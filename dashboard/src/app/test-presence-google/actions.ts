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
import { searchPlaces, getPlaceDetails } from "@/lib/google/places";
import { trancher, type Candidat } from "@/lib/audit/correspondance";
import { normaliserTelephone } from "@/lib/contact/telephone";
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
import { envoyerRapportAuProspect } from "@/lib/courriel/audit";
import { estLangue, type Lang } from "@/lib/i18n/testPresence";
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
  status: "idle" | "success" | "error" | "choix";
  error?: "missing" | "generic" | "quota" | "telephone";
  /**
   * Ce qu'il avait saisi, pour le lui rendre. Un formulaire qui se vide
   * parce qu'un champ était mal rempli fait fuir : il faut tout retaper
   * pour corriger une virgule.
   */
  valeurs?: Record<string, string>;
  audit?: AuditResult;
  /** Pour pré-remplir l'inscription plutôt que de la redemander. */
  email?: string;
  /**
   * Les établissements entre lesquels le restaurateur doit choisir, quand
   * son nom ne désigne pas un seul endroit. Ses coordonnées sont déjà
   * enregistrées : on ne lui redemande que ce point-là.
   */
  candidats?: Candidat[];
  prospectId?: string;
  entreprise?: string;
  ville?: string;
  prenom?: string;
  langue?: Lang;
};

/*
 * Ici se trouvait une synthèse rédigée par Claude à partir des mêmes
 * signaux. Elle a été retirée : un paragraphe libre disait moins que la
 * liste d'actions qui le remplace, coûtait un appel par prospect, et
 * n'était écrit qu'en français sur une page servie en trois langues. Les
 * actions, elles, se calculent sans réseau — l'audit tourne donc même sans
 * clé Anthropic.
 */

/** Ce qu'on a pu établir, une fois la recherche faite. */
type Issue =
  | { audit: AuditResult | undefined }
  | { choix: Candidat[] }
  | { introuvable: true };

/**
 * Cherche l'établissement, et n'audite que si l'on est sûr de l'avoir
 * reconnu. Sinon on rend la liste : c'est au restaurateur de dire lequel
 * est le sien, il le sait mieux que nous.
 */
async function identifier(
  restaurantName: string,
  ville: string,
  prospectId: string,
): Promise<Issue> {
  let candidats;
  try {
    candidats = await searchPlaces(`${restaurantName} ${ville}`);
  } catch (err) {
    console.error("[identifier]", err);
    return { audit: undefined };
  }

  const verdict = trancher(
    candidats.map((place) => ({
      id: place.id,
      nom: place.displayName,
      adresse: place.formattedAddress,
    })),
    restaurantName,
  );

  if ("aucun" in verdict) {
    await noterIntrouvable(restaurantName, ville, prospectId);
    return { introuvable: true };
  }
  if ("choix" in verdict) return { choix: verdict.choix };

  return {
    audit: await auditer(verdict.certain.id, restaurantName, ville, prospectId),
  };
}

/** Un établissement que Google ne connaît pas : c'est déjà un résultat. */
async function noterIntrouvable(
  restaurantName: string,
  ville: string,
  prospectId: string,
) {
  const supabase = await createClient();
  await supabase.from("visibility_audits").insert({
    prospect_id: prospectId,
    restaurant_name: restaurantName,
    ville,
    error: "Établissement introuvable sur Google Maps",
  });
}

async function auditer(
  placeId: string,
  restaurantName: string,
  ville: string,
  prospectId: string,
): Promise<AuditResult | undefined> {
  const supabase = await createClient();

  try {
    const details = await getPlaceDetails(placeId);
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
      google_place_id: placeId,
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
    console.error("[auditer]", err);
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
  const brut = (formData.get("langue") as string)?.trim();
  const langue = estLangue(brut) ? brut : "fr";
  // Un accord de canal, pas une case marketing : il porte sur le même
  // sujet que le reste du formulaire — ce test et sa suite. Ce qu'il
  // ajoute, c'est de nommer WhatsApp, ce que Meta exige d'un opt-in et
  // qu'un numéro laissé dans un champ ne dit pas.
  const whatsapp = formData.get("whatsapp") === "on";

  const valeurs = { prenom, nom, email, telephone, entreprise, ville };

  if (!prenom || !nom || !email || !telephone || !entreprise || !ville) {
    return { status: "error", error: "missing", valeurs };
  }

  // Un numéro trop long passait : on le découvrait en essayant de rappeler,
  // c'est-à-dire trop tard. On l'enregistre sous sa forme internationale,
  // celle qu'on recompose pour appeler.
  const telephoneNormalise = normaliserTelephone(telephone);
  if (!telephoneNormalise) {
    return { status: "error", error: "telephone", valeurs };
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
    return { status: "error", error: "quota", valeurs };
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
    .insert({
      prenom,
      nom,
      email,
      telephone: telephoneNormalise,
      entreprise,
      ville,
      whatsapp,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[submitProspect]", error);
    return { status: "error", error: "generic", valeurs };
  }

  const prospectId = data.id as string;
  const issue = await identifier(entreprise, ville, prospectId);

  // On n'attend pas de savoir quel établissement c'est pour prévenir
  // l'équipe : le prospect, lui, est déjà là. S'il abandonne devant la
  // liste, on a quand même son numéro.
  if ("choix" in issue) {
    await prevenirEquipe({
      prenom,
      nom,
      email,
      telephone: telephoneNormalise,
      entreprise,
      ville,
    });
    return {
      status: "choix",
      candidats: issue.choix,
      prospectId,
      entreprise,
      ville,
      email,
      prenom,
      langue,
    };
  }

  const audit = "audit" in issue ? issue.audit : undefined;
  await livrerRapport(audit, { email, prenom, entreprise, langue });
  await prevenirEquipe(
    { prenom, nom, email, telephone: telephoneNormalise, entreprise, ville },
    audit,
  );
  return { status: "success", audit, email, entreprise };
}

/**
 * Le second temps : le restaurateur a désigné son établissement.
 *
 * Ses coordonnées sont déjà en base — on ne refait que l'audit. Le
 * compteur est reconsommé parce que ce geste-ci coûte deux appels
 * facturés à Google, exactement comme le premier.
 */
export async function confirmerEtablissement(
  _prevState: ProspectFormState,
  formData: FormData,
): Promise<ProspectFormState> {
  const placeId = (formData.get("place_id") as string)?.trim() ?? "";
  const prospectId = (formData.get("prospect_id") as string)?.trim();
  const entreprise = (formData.get("entreprise") as string)?.trim();
  const ville = (formData.get("ville") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const prenomConfirme = (formData.get("prenom") as string)?.trim() ?? "";
  const brutConfirme = (formData.get("langue") as string)?.trim();
  const langue = estLangue(brutConfirme) ? brutConfirme : "fr";

  if (!prospectId || !entreprise || !ville) {
    return { status: "error", error: "generic" };
  }

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
  if (!sousPlafond || !sousPlafondGlobal) {
    console.warn("[confirmerEtablissement] plafond atteint");
    return { status: "error", error: "quota" };
  }

  // « Aucun de ces établissements » : son adresse n'est pas sur Google, ce
  // qui est en soi le premier constat de l'audit.
  if (!placeId) {
    await noterIntrouvable(entreprise, ville, prospectId);
    return { status: "success", email };
  }

  const audit = await auditer(placeId, entreprise, ville, prospectId);
  await livrerRapport(audit, {
    email,
    prenom: prenomConfirme,
    entreprise,
    langue,
  });
  await notifierInterne({
    titre: `Établissement confirmé — ${entreprise}`,
    lignes: [
      `${entreprise}, ${ville}`,
      audit
        ? `Score de visibilité : ${audit.score}/100 (${audit.label}).`
        : "Audit indisponible.",
      audit?.presenceIa
        ? audit.presenceIa.cite
          ? `Cité par l'IA sur « ${audit.presenceIa.question} ».`
          : `Non cité sur « ${audit.presenceIa.question} » — l'IA nomme ${audit.presenceIa.concurrents.join(", ") || "d'autres maisons"}.`
        : "Présence IA non mesurée.",
    ],
    lien: { libelle: "Voir les prospects", url: `${siteUrl()}/admin` },
  });

  return { status: "success", audit, email, entreprise };
}

/**
 * Le rapport part chez celui qui l'a demandé.
 *
 * Sans audit, rien à envoyer : un courriel qui annoncerait un résultat
 * absent vaut moins que pas de courriel. Et l'échec d'envoi ne remonte
 * pas — le prospect est enregistré, l'écran affiche son score, ce n'est
 * pas le moment de lui montrer une erreur.
 */
async function livrerRapport(
  audit: AuditResult | undefined,
  qui: { email: string; prenom: string; entreprise: string; langue: Lang },
) {
  if (!audit) return;
  const bilan = await envoyerRapportAuProspect({
    destinataire: qui.email,
    prenom: qui.prenom,
    etablissement: audit.fiche?.nom || qui.entreprise,
    score: audit.score,
    label: audit.label,
    piliers: audit.pillars,
    actions: audit.actions,
    presenceIa: audit.presenceIa,
    lienEssai: `${siteUrl()}/login?email=${encodeURIComponent(qui.email)}`,
    langue: qui.langue,
  });
  if (!bilan.envoye) {
    console.error("[livrerRapport]", bilan.erreur);
  }
}

/**
 * Un prospect rappelé dans les dix minutes est impressionné ; rappelé le
 * soir, il est perdu. L'alerte porte le score quand on l'a : c'est lui qui
 * donne la première phrase de l'appel.
 */
async function prevenirEquipe(
  p: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    entreprise: string;
    ville: string;
  },
  audit?: AuditResult,
) {
  await notifierInterne({
    titre: `Nouveau prospect — ${p.entreprise}`,
    lignes: [
      `${p.prenom} ${p.nom} — ${p.entreprise}, ${p.ville}`,
      `${p.email} — ${p.telephone}`,
      audit
        ? `Score de visibilité : ${audit.score}/100 (${audit.label}).`
        : "Audit indisponible (établissement introuvable ou à confirmer).",
      audit?.presenceIa
        ? audit.presenceIa.cite
          ? `Cité par l'IA sur « ${audit.presenceIa.question} ».`
          : `Non cité sur « ${audit.presenceIa.question} » — l'IA nomme ${audit.presenceIa.concurrents.join(", ") || "d'autres maisons"}.`
        : "Présence IA non mesurée.",
    ],
    lien: { libelle: "Voir les prospects", url: `${siteUrl()}/admin` },
    repondreA: p.email,
  });
}
