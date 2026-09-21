"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import {
  adresseIp,
  consommer,
  empreinte,
  secretEmpreinte,
} from "@/lib/limites/publiques";
import {
  codeDeRetrait,
  expireLe,
  peutRejouer,
  tirer,
  type Lot,
} from "@/lib/roue/tirage";
import { courrielDuLot } from "@/lib/roue/courriel";
import { siteUrl } from "@/lib/site-url";
import { type JeuState } from "@/lib/roue/jeu";
import { langueVisiteur } from "@/lib/i18n/langue";
import { AVIS } from "@/lib/i18n/avis";

/**
 * Tourner la roue.
 *
 * Tout se décide ici, sur le serveur. Une roue dont le résultat se calcule
 * dans le navigateur se truque en trois lignes de console, et c'est le
 * restaurateur qui paie les cafés : le client reçoit un résultat, et
 * l'animation s'aligne dessus.
 *
 * La note du client n'entre nulle part. Elle n'est pas demandée, pas
 * connue, pas un paramètre. Le lot tombe pareil pour une étoile et pour
 * cinq — c'est la seule façon honnête de faire tourner une roue à côté
 * d'un lien vers une plateforme d'avis.
 */

/** Deux parties par visiteur et par jour, tous établissements confondus. */
const PARTIES_PAR_JOUR = 2;

type MaisonJeu = {
  id: string;
  nom: string;
  email_contact: string | null;
  slug_reservation: string | null;
};

export async function jouer(
  _precedent: JeuState,
  donnees: FormData,
): Promise<JeuState> {
  const slug = String(donnees.get("slug") ?? "").trim();
  const email = String(donnees.get("email") ?? "")
    .trim()
    .toLowerCase();
  const consent = donnees.get("consentement") !== null;

  // La langue du joueur : elle sert aux refus, et surtout à la lettre qui
  // porte le lot. C'est le seul moment où on la connaît — le courriel
  // arrive plus tard, sans requête pour la lui redemander.
  const langue = await langueVisiteur();
  const a = AVIS[langue];

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: a.emailValidePourLot, resultat: null };
  }
  if (!consent) {
    return { error: a.consentementRequis, resultat: null };
  }

  const supabase = createServiceClient();

  const { data: maisonData } = await supabase
    .from("restaurants")
    .select("id, nom, email_contact, slug_reservation")
    .eq("slug_reservation", slug)
    .maybeSingle();
  const maison = maisonData as MaisonJeu | null;
  if (!maison) return { error: a.jeuInexistant, resultat: null };

  const { data: roueData } = await supabase
    .from("restaurant_roue")
    .select("active, validite_jours, delai_rejeu_jours")
    .eq("restaurant_id", maison.id)
    .maybeSingle();
  const roue = roueData as {
    active: boolean;
    validite_jours: number;
    delai_rejeu_jours: number;
  } | null;
  if (!roue?.active)
    return { error: a.jeuPasOuvert, resultat: null };

  // Le plafond du visiteur avant tout le reste : c'est lui qui empêche de
  // vider le stock depuis une seule table.
  const entetes = await headers();
  const visiteur = empreinte(
    "roue",
    adresseIp(entetes),
    entetes.get("user-agent") ?? "",
    secretEmpreinte(),
  );
  if (!(await consommer(supabase, visiteur, PARTIES_PAR_JOUR))) {
    return { error: a.dejaJoueAujourdhui, resultat: null };
  }

  // La règle du rejeu, par adresse cette fois : le plafond au-dessus
  // compte les appareils, celui-ci compte les personnes.
  const { data: derniere } = await supabase
    .from("restaurant_roue_parties")
    .select("created_at")
    .eq("restaurant_id", maison.id)
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const dernierJeu = derniere
    ? new Date((derniere as { created_at: string }).created_at)
    : null;
  if (!peutRejouer(dernierJeu, roue.delai_rejeu_jours)) {
    return { error: a.dejaTenteRecemment, resultat: null };
  }

  const [{ data: lotsData }, { data: partiesData }] = await Promise.all([
    supabase
      .from("restaurant_roue_lots")
      .select("*")
      .eq("restaurant_id", maison.id)
      .order("ordre")
      .order("created_at"),
    supabase
      .from("restaurant_roue_parties")
      .select("lot_id")
      .eq("restaurant_id", maison.id),
  ]);

  const lots = (lotsData ?? []) as {
    id: string;
    libelle: string;
    gagnant: boolean;
    poids: number;
    stock: number | null;
  }[];
  const distribues: Record<string, number> = {};
  for (const p of (partiesData ?? []) as { lot_id: string | null }[]) {
    if (p.lot_id) distribues[p.lot_id] = (distribues[p.lot_id] ?? 0) + 1;
  }

  const candidats: Lot[] = lots.map((lot) => ({
    id: lot.id,
    libelle: lot.libelle,
    gagnant: lot.gagnant,
    poids: lot.poids,
    stock: lot.stock,
    distribues: distribues[lot.id] ?? 0,
  }));

  const tirage = tirer(candidats);
  if (!tirage) {
    return { error: a.lotsEpuises, resultat: null };
  }

  const maintenant = new Date();
  const fin = expireLe(maintenant, roue.validite_jours);

  // Le code doit être unique chez ce restaurateur. Une collision sur six
  // caractères est rare, la traiter coûte trois lignes, et la laisser
  // passer ferait échouer une partie sous les yeux du client.
  let code: string | null = null;
  let partieId: string | null = null;
  for (let essai = 0; essai < 5 && !partieId; essai += 1) {
    const tentative = codeDeRetrait();
    const { data, error } = await supabase
      .from("restaurant_roue_parties")
      .insert({
        restaurant_id: maison.id,
        lot_id: tirage.lot.id,
        email,
        gagnant: tirage.lot.gagnant,
        lot_libelle: tirage.lot.libelle,
        code: tentative,
        expire_le: fin,
      })
      .select("id")
      .maybeSingle();
    if (!error && data) {
      code = tentative;
      partieId = (data as { id: string }).id;
    } else if (error && !error.message.includes("duplicate")) {
      console.error("[roue/jouer]", error.message);
      return { error: a.jeuRate, resultat: null };
    }
  }
  if (!partieId || !code) {
    return { error: a.jeuRate, resultat: null };
  }

  // L'adresse entre au fichier client avec son consentement daté. Une
  // adresse déjà désinscrite ne se réabonne pas parce qu'elle a joué :
  // `desabonne_le` n'est jamais touché ici.
  const { data: contact } = await supabase
    .from("restaurant_contacts")
    .upsert(
      {
        restaurant_id: maison.id,
        email,
        consentement: true,
        consentement_le: maintenant.toISOString(),
        consentement_source: "roue",
        updated_at: maintenant.toISOString(),
      },
      { onConflict: "restaurant_id,email" },
    )
    .select("id")
    .maybeSingle();
  if (contact) {
    await supabase
      .from("restaurant_roue_parties")
      .update({ contact_id: (contact as { id: string }).id })
      .eq("id", partieId);
  }

  // Le lot part tout de suite : le client est encore à table, il vérifie.
  if (tirage.lot.gagnant) {
    const lettre = courrielDuLot({
      maison: maison.nom,
      lot: tirage.lot.libelle,
      code,
      expireLe: fin,
      adresseTotem: `${siteUrl()}/avis/${maison.slug_reservation ?? slug}`,
      langue,
    });
    await envoyerCourriel({
      destinataire: email,
      repondreA: maison.email_contact ?? undefined,
      sujet: lettre.sujet,
      texte: lettre.texte,
      html: lettre.html,
    });
  }

  return {
    error: null,
    resultat: {
      index: tirage.index,
      libelle: tirage.lot.libelle,
      gagnant: tirage.lot.gagnant,
      code: tirage.lot.gagnant ? code : null,
      expireLe: tirage.lot.gagnant ? fin : null,
    },
  };
}

/**
 * Le client a ouvert la fiche Google.
 *
 * On note l'ouverture, et seulement elle. Personne ne peut savoir si un
 * avis a été écrit — ni nous, ni aucun outil du marché : Google n'expose
 * rien qui le permette. Une colonne nommée « avis_laissé » serait un
 * mensonge rangé dans sa propre base.
 */
export async function noterOuvertureAvis(donnees: FormData): Promise<void> {
  const partieId = String(donnees.get("partie_id") ?? "");
  if (!partieId) return;
  const supabase = createServiceClient();
  await supabase
    .from("restaurant_roue_parties")
    .update({ avis_ouvert_le: new Date().toISOString() })
    .eq("id", partieId);
}
