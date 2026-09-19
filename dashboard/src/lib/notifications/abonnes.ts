import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { notifierInterne } from "@/lib/notifications/interne";
import { siteUrl } from "@/lib/site-url";
import { LIBELLE_MODULE, LIBELLE_PACK, PACK } from "@/lib/abonnement/modules";

/**
 * Ce que Klarr doit savoir de son propre commerce.
 *
 * Les prospects, les inscriptions et les fins d'essai prévenaient déjà.
 * L'argent, non : un premier abonnement, une résiliation, un prélèvement
 * refusé passaient inaperçus. Ce sont pourtant les trois seuls événements
 * qui décident si l'affaire tient — et les trois où réagir vite change
 * quelque chose. Un client qu'on rappelle le jour où sa carte est refusée
 * reste ; celui qu'on découvre parti un mois plus tard ne revient pas.
 *
 * Rien d'ici ne lève : un abonnement ne doit pas échouer parce qu'on n'a
 * pas su se prévenir.
 */

function libelleAchat(etiquette: string | undefined): string {
  if (etiquette === PACK) return LIBELLE_PACK;
  if (etiquette === "reservations") return LIBELLE_MODULE.reservations;
  return LIBELLE_MODULE.visibilite;
}

async function nomEtablissement(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<string> {
  const { data } = await supabase
    .from("restaurants")
    .select("nom")
    .eq("id", restaurantId)
    .maybeSingle();
  return (data as { nom: string } | null)?.nom ?? "établissement inconnu";
}

const lien = () => ({
  libelle: "Ouvrir l'administration",
  url: `${siteUrl()}/admin`,
});

export async function annoncerAbonnement(
  supabase: SupabaseClient,
  restaurantId: string,
  etiquette: string | undefined,
): Promise<void> {
  const nom = await nomEtablissement(supabase, restaurantId);
  await notifierInterne({
    titre: `Nouvel abonné — ${nom}`,
    lignes: [`${nom} vient de souscrire ${libelleAchat(etiquette)}.`],
    lien: lien(),
  });
}

export async function annoncerResiliation(
  supabase: SupabaseClient,
  restaurantId: string,
  finPrevue: string | null,
): Promise<void> {
  const nom = await nomEtablissement(supabase, restaurantId);
  await notifierInterne({
    // Un départ annoncé se rattrape ; un départ constaté, non. C'est le
    // seul message de cette liste où le délai de réaction vaut de l'argent.
    titre: `Résiliation demandée — ${nom}`,
    lignes: [
      finPrevue
        ? `L'abonnement s'arrêtera le ${new Date(finPrevue).toLocaleDateString("fr-FR")}.`
        : "L'abonnement s'arrêtera à la fin de la période en cours.",
      "Il est encore temps d'appeler.",
    ],
    lien: lien(),
  });
}

export async function annoncerFinAbonnement(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<void> {
  const nom = await nomEtablissement(supabase, restaurantId);
  await notifierInterne({
    titre: `Abonnement terminé — ${nom}`,
    lignes: ["Les modules concernés sont fermés."],
    lien: lien(),
  });
}

export async function annoncerImpaye(
  supabase: SupabaseClient,
  restaurantId: string,
  montantCentimes: number,
  authentification: boolean,
): Promise<void> {
  const nom = await nomEtablissement(supabase, restaurantId);
  const montant = `${(montantCentimes / 100).toLocaleString("fr-FR")} €`;
  await notifierInterne({
    titre: `Paiement en attente — ${nom}`,
    lignes: [
      authentification
        ? `${montant} : sa banque réclame une authentification qu'il n'a pas encore faite.`
        : `${montant} n'ont pas pu être prélevés.`,
      "Il a été prévenu sur son téléphone et sur sa page d'abonnement.",
    ],
    lien: lien(),
  });
}
