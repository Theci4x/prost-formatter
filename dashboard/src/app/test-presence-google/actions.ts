"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  adresseIp,
  AUDITS_PAR_JOUR,
  AUDITS_PAR_JOUR_GLOBAL,
  consommer,
  empreinte,
  secretEmpreinte,
} from "@/lib/limites/publiques";
import { searchPlace, getPlaceDetails } from "@/lib/google/places";
import { checkWebsite } from "@/lib/audit/website";
import {
  scoreLocalSeo,
  scoreEReputation,
  scoreGeo,
  scoreGlobal,
  scoreLabel,
} from "@/lib/audit/scoring";
import {
  actionsPrioritaires,
  type ActionPrioritaire,
} from "@/lib/audit/actions";
import { notifierInterne } from "@/lib/notifications/interne";
import { siteUrl } from "@/lib/site-url";

export type AuditResult = {
  score: number;
  label: "excellent" | "bon" | "moyen" | "critique";
  pillars: { localSeo: number; eReputation: number; geo: number };
  /** Les gestes à faire, du plus lourd au plus léger. */
  actions: ActionPrioritaire[];
};

export type ProspectFormState = {
  status: "idle" | "success" | "error";
  error?: "missing" | "generic";
  audit?: AuditResult;
};

/*
 * Ici se trouvait une synthèse rédigée par Claude à partir des mêmes
 * signaux. Elle a été retirée : un paragraphe libre disait moins que la
 * liste d'actions qui le remplace, coûtait un appel par prospect, et
 * n'était écrit qu'en français sur une page servie en trois langues. Les
 * actions, elles, se calculent sans réseau — l'audit tourne donc même sans
 * clé Anthropic.
 */

async function runAudit(
  restaurantName: string,
  ville: string,
  prospectId: string,
): Promise<AuditResult | undefined> {
  const supabase = await createClient();

  try {
    const place = await searchPlace(`${restaurantName} ${ville}`);
    if (!place) {
      await supabase.from("visibility_audits").insert({
        prospect_id: prospectId,
        restaurant_name: restaurantName,
        ville,
        error: "Établissement introuvable sur Google Maps",
      });
      return undefined;
    }

    const details = await getPlaceDetails(place.id);
    const website = await checkWebsite(details.websiteUri);

    const localSeo = scoreLocalSeo(details);
    const eReputation = scoreEReputation(details);
    const geo = scoreGeo(website);
    const global = scoreGlobal(localSeo, eReputation, geo);

    const signals = {
      restaurant: details.displayName,
      adresse: details.formattedAddress,
      note: details.rating,
      nombreAvis: details.userRatingCount,
      photos: details.photoCount,
      siteWeb: details.websiteUri,
      siteAccessible: website.reachable,
      donneesStructurees: website.hasJsonLd,
      liensReseauxSociaux: website.hasSameAs,
      scores: { localSeo, eReputation, geo, global },
    };

    const actions = actionsPrioritaires(details, website);

    await supabase.from("visibility_audits").insert({
      prospect_id: prospectId,
      restaurant_name: restaurantName,
      ville,
      google_place_id: place.id,
      local_seo_score: localSeo,
      e_reputation_score: eReputation,
      geo_score: geo,
      global_score: global,
      // Les actions dorment avec les signaux : un audit qu'on relit six mois
      // plus tard doit dire ce qu'on avait conseillé, pas seulement ce qu'on
      // avait mesuré.
      raw_signals: { ...signals, actions },
    });

    return {
      score: global,
      label: scoreLabel(global),
      pillars: { localSeo, eReputation, geo },
      actions,
    };
  } catch (err) {
    // L'audit est un bonus : s'il échoue (clé API manquante, service
    // indisponible...), on garde quand même le lead et on retombe sur le
    // message de remerciement classique plutôt que de casser le formulaire.
    console.error("[runAudit]", err);
    return undefined;
  }
}

export async function submitProspect(
  _prevState: ProspectFormState,
  formData: FormData,
): Promise<ProspectFormState> {
  const prenom = (formData.get("prenom") as string)?.trim();
  const nom = (formData.get("nom") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const telephone = (formData.get("telephone") as string)?.trim();
  const entreprise = (formData.get("entreprise") as string)?.trim();
  const ville = (formData.get("ville") as string)?.trim();

  if (!prenom || !nom || !email || !telephone || !entreprise || !ville) {
    return { status: "error", error: "missing" };
  }

  // Chaque soumission déclenche deux appels facturés à Google Places. Sans
  // compteur, la facture est à la main du premier venu — et on ne la
  // découvre qu'à la fin du mois. Le compteur s'écrit avec la clé de
  // service : la fonction n'est pas ouverte au visiteur, qui pourrait
  // sinon gonfler le compteur d'autrui jusqu'à le bloquer.
  const entetes = await headers();
  const compteurs = createServiceClient();
  const visiteur = empreinte(
    "audit",
    adresseIp(entetes),
    entetes.get("user-agent") ?? "",
    secretEmpreinte(),
  );
  const [sousPlafond, sousPlafondGlobal] = await Promise.all([
    consommer(compteurs, visiteur, AUDITS_PAR_JOUR),
    consommer(compteurs, "audit:global", AUDITS_PAR_JOUR_GLOBAL),
  ]);
  if (!sousPlafond || !sousPlafondGlobal) {
    return { status: "error", error: "generic" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prospects")
    .insert({ prenom, nom, email, telephone, entreprise, ville })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[submitProspect]", error);
    return { status: "error", error: "generic" };
  }

  const audit = await runAudit(entreprise, ville, data.id as string);

  // Un prospect rappelé dans les dix minutes est impressionné ; rappelé le
  // soir, il est perdu. L'alerte part après l'audit pour porter le score :
  // c'est lui qui donne la première phrase de l'appel.
  await notifierInterne({
    titre: `Nouveau prospect — ${entreprise}`,
    lignes: [
      `${prenom} ${nom} — ${entreprise}, ${ville}`,
      `${email} — ${telephone}`,
      audit
        ? `Score de visibilité : ${audit.score}/100 (${audit.label}).`
        : "Audit indisponible (établissement introuvable sur Google).",
    ],
    lien: { libelle: "Voir les prospects", url: `${siteUrl()}/admin` },
  });

  return { status: "success", audit };
}
