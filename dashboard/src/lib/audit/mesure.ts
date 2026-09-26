import "server-only";
import { getPlaceDetails } from "@/lib/google/places";
import { checkWebsite } from "@/lib/audit/website";
import {
  scoreLocalSeo,
  scoreEReputation,
  scoreGeo,
  scoreGlobal,
  scoreLabel,
} from "@/lib/audit/scoring";
import { actionsPrioritaires } from "@/lib/audit/actions";
import { mesurerPresenceIa } from "@/lib/audit/ia";
import type { AuditResult } from "@/app/test-presence-google/actions";

/**
 * L'audit d'un établissement déjà reconnu sur Google, sans rien écrire.
 *
 * Deux portes y mènent : le formulaire public, où le restaurateur se teste
 * lui-même, et l'espace d'administration, où l'on prépare l'audit qu'on
 * va lui apporter. La mesure est la même ; seul ce qu'on en garde change,
 * et chaque porte l'écrit à sa façon.
 */
export type Mesure = {
  audit: AuditResult;
  /** Les colonnes de `visibility_audits`, prêtes à insérer. */
  ligne: {
    google_place_id: string;
    local_seo_score: number;
    e_reputation_score: number;
    geo_score: number;
    global_score: number;
    raw_signals: Record<string, unknown>;
  };
};

export async function mesurerEtablissement(
  placeId: string,
  restaurantName: string,
  ville: string,
): Promise<Mesure> {
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

  const audit: AuditResult = {
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

  return {
    audit,
    ligne: {
      google_place_id: placeId,
      local_seo_score: localSeo,
      e_reputation_score: eReputation,
      geo_score: geo,
      global_score: global,
      // Les actions dorment avec les signaux : un audit qu'on relit six mois
      // plus tard doit dire ce qu'on avait conseillé, pas seulement ce qu'on
      // avait mesuré.
      raw_signals: { ...signals, actions, presenceIa },
    },
  };
}
