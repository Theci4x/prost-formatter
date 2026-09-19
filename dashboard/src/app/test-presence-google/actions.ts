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
import { mesurerPresenceIa, type PresenceIa } from "@/lib/audit/ia";
import { notifierInterne } from "@/lib/notifications/interne";
import { siteUrl } from "@/lib/site-url";

/** La carte d'identité de l'établissement, telle que Google la connaît. */
export type FicheEtablissement = {
  nom: string;
  genre: string | null;
  adresse: string;
  telephone: string | null;
  siteWeb: string | null;
  note: number | null;
  avis: number | null;
};

export type AuditResult = {
  /**
   * Montrée en tête du rapport. Un prospect qui reconnaît sa note, son
   * nombre d'avis et son adresse sait qu'on a regardé son établissement,
   * et non produit un document type — c'est ce qui rend crédible tout ce
   * qui suit.
   */
  fiche?: FicheEtablissement;
  score: number;
  label: "excellent" | "bon" | "moyen" | "critique";
  pillars: { localSeo: number; eReputation: number; geo: number };
  /** Les gestes à faire, du plus lourd au plus léger. */
  actions: ActionPrioritaire[];
  /** Ce que l'IA répond vraiment. Absent sans clé, ou sans genre connu. */
  presenceIa?: PresenceIa;
};

export type ProspectFormState = {
  status: "idle" | "success" | "error";
  error?: "missing" | "generic" | "quota";
  audit?: AuditResult;
  /** Pour pré-remplir l'inscription plutôt que de la redemander. */
  email?: string;
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

    // La seule mesure de l'audit qui interroge vraiment un assistant. Elle
    // vient après les scores : ceux-ci ne doivent pas dépendre d'elle, et
    // l'audit reste complet quand elle manque.
    const presenceIa = await mesurerPresenceIa(
      details.displayName || restaurantName,
      details.primaryType,
      ville,
    );

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
      raw_signals: { ...signals, actions, presenceIa },
    });

    return {
      score: global,
      label: scoreLabel(global),
      fiche: {
        nom: details.displayName || restaurantName,
        genre: details.primaryType,
        adresse: details.formattedAddress,
        telephone: details.nationalPhoneNumber,
        siteWeb: details.websiteUri,
        note: details.rating,
        avis: details.userRatingCount,
      },
      pillars: { localSeo, eReputation, geo },
      actions,
      presenceIa: presenceIa ?? undefined,
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
  const service = createServiceClient();
  const visiteur = empreinte(
    "audit",
    adresseIp(entetes),
    entetes.get("user-agent") ?? "",
    secretEmpreinte(),
  );
  const [sousPlafond, sousPlafondGlobal] = await Promise.all([
    consommer(service, visiteur, AUDITS_PAR_JOUR),
    consommer(service, "audit:global", AUDITS_PAR_JOUR_GLOBAL),
  ]);
  // Un refus de plafond n'est pas une panne : le dire franchement, sinon le
  // restaurateur réessaie deux fois « dans un instant » et s'en va. Et le
  // journaliser, sinon on ne sait même pas qu'il est passé.
  if (!sousPlafond || !sousPlafondGlobal) {
    console.warn(
      `[submitProspect] plafond atteint (${sousPlafond ? "global" : "visiteur"})`,
    );
    return { status: "error", error: "quota" };
  }

  // Écrit avec la clé de service, et non avec celle du visiteur. La table
  // n'a qu'une politique d'insertion, jamais de lecture — c'est voulu,
  // personne ne doit pouvoir lister les prospects par l'API publique. Mais
  // « insert ... returning », que produit `.select()`, se fait refuser par
  // cette politique de lecture manquante : l'insertion partait, et Postgres
  // répondait « new row violates row-level security policy », un message
  // qui accuse la politique d'insertion alors qu'elle est correcte. Le
  // formulaire échouait à chaque envoi.
  const { data, error } = await service
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
      // Le meilleur argument d'ouverture pour l'appel : on lui dit qui
      // l'IA cite à sa place, et il connaît ces noms.
      audit?.presenceIa
        ? audit.presenceIa.cite
          ? `Cité par l'IA sur « ${audit.presenceIa.question} ».`
          : `Non cité sur « ${audit.presenceIa.question} » — l'IA nomme ${audit.presenceIa.concurrents.join(", ") || "d'autres maisons"}.`
        : "Présence IA non mesurée.",
    ],
    lien: { libelle: "Voir les prospects", url: `${siteUrl()}/admin` },
  });

  return { status: "success", audit, email };
}
