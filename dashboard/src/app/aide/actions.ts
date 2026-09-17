"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  adresseIp,
  AIDES_PAR_JOUR,
  consommer,
  empreinte,
  secretEmpreinte,
} from "@/lib/limites/publiques";
import { notifierInterne } from "@/lib/notifications/interne";

/**
 * Écrire à Klarr quand le mode d'emploi ne suffit pas.
 *
 * Pas de messagerie instantanée, pas de widget tiers : un formulaire qui
 * envoie un e-mail, et une réponse qui part d'une vraie boîte. Ce qui
 * fait la différence avec un « contactez-nous » ordinaire, c'est le
 * contexte joint automatiquement — qui écrit, depuis quel établissement,
 * depuis quel écran. Le restaurateur n'a rien à expliquer de tout ça, et
 * nous n'avons rien à demander avant de pouvoir aider.
 */

export type DemandeAideState = {
  status: "idle" | "success" | "error";
  error?: "missing" | "email" | "trop" | "generic";
};

type Etablissement = { nom: string };

export async function envoyerDemandeAide(
  _prevState: DemandeAideState,
  formData: FormData,
): Promise<DemandeAideState> {
  const message = (formData.get("message") as string)?.trim();
  const ecran = (formData.get("ecran") as string)?.trim();
  const emailSaisi = (formData.get("email") as string)?.trim();

  if (!message) return { status: "error", error: "missing" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Un visiteur non connecté doit laisser une adresse : répondre à
  // personne n'aide personne.
  const courriel = user?.email ?? emailSaisi;
  if (!courriel || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courriel)) {
    return { status: "error", error: "email" };
  }

  const entetes = await headers();
  const visiteur = empreinte(
    "aide",
    adresseIp(entetes),
    entetes.get("user-agent") ?? "",
    secretEmpreinte(),
  );
  if (!(await consommer(createServiceClient(), visiteur, AIDES_PAR_JOUR))) {
    return { status: "error", error: "trop" };
  }

  // Les établissements du demandeur : la RLS fait le tri toute seule, on
  // ne voit ici que les siens.
  let etablissements: string[] = [];
  if (user) {
    const { data } = await supabase.from("restaurants").select("nom");
    etablissements = ((data ?? []) as Etablissement[]).map(
      (ligne) => ligne.nom,
    );
  }

  const bilan = await notifierInterne({
    titre: `Demande d'aide — ${etablissements[0] ?? courriel}`,
    lignes: [
      courriel,
      etablissements.length > 0
        ? `Établissement(s) : ${etablissements.join(", ")}`
        : "Visiteur sans compte.",
      ecran ? `Écran : ${ecran}` : "Écran non précisé.",
      "",
      message,
    ],
    repondreA: courriel,
  });

  // Une demande d'aide qui se perd est pire qu'un formulaire absent : on
  // le dit au lieu d'afficher un merci mensonger.
  if (bilan.courriels === 0 && !bilan.slack) {
    return { status: "error", error: "generic" };
  }

  return { status: "success" };
}
