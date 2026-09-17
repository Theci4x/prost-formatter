import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculerAcces,
  LIBELLE_MODULE,
  MODULES,
} from "@/lib/abonnement/modules";
import { notifierInterne } from "@/lib/notifications/interne";
import { siteUrl } from "@/lib/site-url";

/**
 * L'essai qui se termine.
 *
 * Quatorze jours passent vite et personne ne les compte à notre place. Un
 * restaurateur qui n'a pas donné de nouvelles à trois jours de la fin est
 * le seul moment où un appel sert vraiment à quelque chose : après, le
 * carnet s'éteint et l'appel devient une réclamation.
 *
 * Trois jours, et pas un : il faut que le coup de fil puisse tomber un
 * jour de fermeture sans être perdu.
 */
export const PREVENIR_JOURS = 3;

export type BilanEssais = {
  examines: number;
  prevenus: number;
};

type Ligne = {
  id: string;
  nom: string;
  proprietaire_id: string;
  created_at: string;
  acces_offert_jusqu_au: string | null;
};

type Abonnement = {
  restaurant_id: string;
  module: string | null;
  status: string;
};

/**
 * Marque l'alerte comme envoyée, et dit si c'est la première fois. La
 * table porte une clé primaire : deux passages le même jour ne peuvent
 * pas prévenir deux fois, même si la tâche est relancée à la main.
 */
async function premiereFois(
  supabase: SupabaseClient,
  cle: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("notifications_internes")
    .upsert({ cle }, { onConflict: "cle", ignoreDuplicates: true })
    .select("cle");

  if (error) {
    // Une alerte manquée vaut mieux qu'une alerte quotidienne : en cas de
    // doute on se tait.
    console.error("[essais]", error);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export async function prevenirDesEssaisQuiFinissent({
  supabase,
  maintenant,
}: {
  supabase: SupabaseClient;
  maintenant: Date;
}): Promise<BilanEssais> {
  const [restaurants, abonnements] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, nom, proprietaire_id, created_at, acces_offert_jusqu_au"),
    supabase
      .from("restaurant_subscriptions")
      .select("restaurant_id, module, status"),
  ]);

  const lignes = (restaurants.data ?? []) as Ligne[];
  const etats = (abonnements.data ?? []) as Abonnement[];

  let prevenus = 0;

  for (const ligne of lignes) {
    const acces = calculerAcces({
      abonnements: etats
        .filter((etat) => etat.restaurant_id === ligne.id)
        .map((etat) => ({
          module: etat.module === "reservations" ? "reservations" : "visibilite",
          status: etat.status,
        })),
      creeLe: ligne.created_at,
      accesOffertJusquAu: ligne.acces_offert_jusqu_au,
      maintenant,
    });

    // Celui qui paie déjà quelque chose n'est pas en essai.
    if (!acces.enEssai) continue;

    // Les deux essais ne finissent pas le même jour : chacun est une
    // occasion d'appeler, et chacun mérite donc son alerte.
    for (const cle of MODULES) {
      const essai = acces.essai[cle];
      if (!essai) continue;
      if (essai.joursRestants > PREVENIR_JOURS || essai.joursRestants <= 0) {
        continue;
      }

      const empreinte = `essai:${ligne.id}:${cle}:${essai.jusquau}`;
      if (!(await premiereFois(supabase, empreinte))) continue;

      // L'adresse du propriétaire vit dans auth.users : sans elle, l'alerte
      // annonce un nom qu'on ne peut pas rappeler.
      const compte = await supabase.auth.admin
        .getUserById(ligne.proprietaire_id)
        .catch(() => null);
      const courriel = compte?.data?.user?.email ?? "adresse inconnue";

      await notifierInterne({
        titre: `Essai bientôt fini — ${ligne.nom} (${LIBELLE_MODULE[cle]})`,
        lignes: [
          `Il reste ${essai.joursRestants} jour(s), jusqu'au ${essai.jusquau}.`,
          `Propriétaire : ${courriel}`,
          "Aucun abonnement en cours.",
        ],
        lien: { libelle: "Ouvrir l'administration", url: `${siteUrl()}/admin` },
      });
      prevenus += 1;
    }
  }

  return { examines: lignes.length, prevenus };
}
