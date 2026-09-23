"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { telephoneAEnregistrer } from "@/lib/contact/telephone";
import { jetonAnnulation } from "@/lib/reservations/annulation";
import {
  emailValide,
  lireDate,
  lireHeure,
  type ContactImporte,
  type ReservationImportee,
} from "@/lib/import/csv";

/**
 * L'import d'un fichier venu d'un autre outil.
 *
 * Le navigateur a déjà lu, trié et validé. On revérifie tout ici, ligne
 * par ligne : ce qui arrive d'un formulaire peut avoir été fabriqué à la
 * main, et une ligne fausse en base se paie plus cher qu'une ligne
 * refusée.
 *
 * Rien n'est jamais écrasé. Un client déjà au fichier garde sa fiche — et
 * surtout son consentement ou sa désinscription : un import ne réabonne
 * personne. Une réservation déjà au carnet (même jour, même heure, même
 * nom) n'est pas dédoublée.
 */

const PLAFOND_CONTACTS = 5000;
const PLAFOND_RESERVATIONS = 2000;
const PAQUET = 500;

export type BilanImport = {
  erreur: string | null;
  ajoutes: number;
  dejaLa: number;
  refuses: number;
  /** Contacts : ceux qu'on pourra écrire en campagne. */
  joignables?: number;
};

const echec = (erreur: string): BilanImport => ({
  erreur,
  ajoutes: 0,
  dejaLa: 0,
  refuses: 0,
});

/** Aujourd'hui à Paris : une table de ce soir n'est pas « passée ». */
function aujourdhuiParis(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const court = (texte: string | null, max: number) =>
  texte ? texte.trim().slice(0, max) || null : null;

export async function importerContacts(
  restaurantId: string,
  contacts: ContactImporte[],
  consentementConfirme: boolean,
): Promise<BilanImport> {
  if (!restaurantId) return echec("Établissement inconnu.");
  await exiger(restaurantId, "gerant");
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return echec("Aucun client à importer.");
  }
  if (contacts.length > PLAFOND_CONTACTS) {
    return echec(
      `Plus de ${PLAFOND_CONTACTS} clients : découpe le fichier en plusieurs parties.`,
    );
  }

  const maintenant = new Date().toISOString();
  const vus = new Set<string>();
  let refuses = 0;
  const lignes = contacts.flatMap((c) => {
    const email = emailValide(String(c?.email ?? ""));
    if (!email || vus.has(email)) {
      refuses++;
      return [];
    }
    vus.add(email);
    // Le consentement ne passe que s'il est prouvé deux fois : la colonne
    // du fichier dit oui, et le restaurateur certifie qu'elle dit vrai.
    const consent = consentementConfirme && c.optin === true;
    return [
      {
        restaurant_id: restaurantId,
        email,
        nom: court(c.nom, 200),
        telephone: telephoneAEnregistrer(court(c.telephone, 40)),
        consentement: consent,
        consentement_le: consent ? maintenant : null,
        consentement_source: consent ? "import" : null,
      },
    ];
  });

  const supabase = await createClient();
  let ajoutes = 0;
  let joignables = 0;
  for (let i = 0; i < lignes.length; i += PAQUET) {
    const paquet = lignes.slice(i, i + PAQUET);
    const { data, error } = await supabase
      .from("restaurant_contacts")
      .upsert(paquet, {
        onConflict: "restaurant_id,email",
        ignoreDuplicates: true,
      })
      .select("consentement");
    if (error) {
      console.error("[import/contacts]", error.message);
      return {
        erreur: `L'import s'est arrêté après ${ajoutes} clients. Réessaie : ceux déjà ajoutés ne seront pas dédoublés.`,
        ajoutes,
        dejaLa: 0,
        refuses,
        joignables,
      };
    }
    const inseres = (data ?? []) as { consentement: boolean }[];
    ajoutes += inseres.length;
    joignables += inseres.filter((c) => c.consentement).length;
  }

  revalidatePath(`/dashboard/${restaurantId}/clients`);
  return {
    erreur: null,
    ajoutes,
    dejaLa: lignes.length - ajoutes,
    refuses,
    joignables,
  };
}

/** Lundi = 1 … dimanche = 7, comme les services. */
function jourIso(date: string): number {
  const jour = new Date(`${date}T12:00:00Z`).getUTCDay();
  return jour === 0 ? 7 : jour;
}

export async function importerReservations(
  restaurantId: string,
  reservations: ReservationImportee[],
): Promise<BilanImport> {
  if (!restaurantId) return echec("Établissement inconnu.");
  await exiger(restaurantId, "gerant");
  if (!Array.isArray(reservations) || reservations.length === 0) {
    return echec("Aucune réservation à importer.");
  }
  if (reservations.length > PLAFOND_RESERVATIONS) {
    return echec(
      `Plus de ${PLAFOND_RESERVATIONS} réservations : découpe le fichier en plusieurs parties.`,
    );
  }

  const supabase = await createClient();
  const aujourdhui = aujourdhuiParis();
  const [espacesResult, servicesResult, existantesResult] = await Promise.all([
    supabase
      .from("restaurant_espaces")
      .select("id, accepte_table, ordre, created_at")
      .eq("restaurant_id", restaurantId)
      .order("ordre")
      .order("created_at"),
    supabase
      .from("restaurant_services")
      .select("id, jours, heure_debut, heure_fin")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("restaurant_reservations")
      .select("date_reservation, heure_arrivee, client_nom")
      .eq("restaurant_id", restaurantId)
      .gte("date_reservation", aujourdhui),
  ]);

  const espaces = (espacesResult.data ?? []) as {
    id: string;
    accepte_table: boolean;
  }[];
  // Une réservation se range dans une salle. La première qui accepte les
  // tables, comme pour une saisie au téléphone ; le plan permettra de la
  // déplacer ensuite.
  const espace = espaces.find((e) => e.accepte_table) ?? espaces[0];
  if (!espace) {
    return echec(
      "Crée d'abord au moins une salle dans « Configuration » : chaque réservation doit y être rangée.",
    );
  }

  const services = (servicesResult.data ?? []) as {
    id: string;
    jours: number[];
    heure_debut: string;
    heure_fin: string;
  }[];
  const serviceDe = (date: string, heure: string) => {
    const dans = (s: (typeof services)[number]) =>
      heure >= s.heure_debut.slice(0, 5) && heure < s.heure_fin.slice(0, 5);
    const jour = jourIso(date);
    return (
      services.find((s) => s.jours.includes(jour) && dans(s)) ??
      services.find(dans) ??
      null
    );
  };

  const cleDe = (date: string, heure: string, nom: string) =>
    `${date}|${heure.slice(0, 5)}|${nom.trim().toLowerCase()}`;
  const existantes = new Set(
    (
      (existantesResult.data ?? []) as {
        date_reservation: string;
        heure_arrivee: string | null;
        client_nom: string;
      }[]
    ).map((r) =>
      cleDe(r.date_reservation, r.heure_arrivee ?? "", r.client_nom),
    ),
  );

  let refuses = 0;
  let dejaLa = 0;
  const contacts = new Map<string, { nom: string; telephone: string | null }>();
  const lignes = reservations.flatMap((r) => {
    const date = lireDate(String(r?.date ?? ""));
    const heure = lireHeure(String(r?.heure ?? ""));
    const couverts = Number(r?.couverts);
    const nom = court(String(r?.nom ?? ""), 200);
    if (
      !date ||
      date < aujourdhui ||
      !heure ||
      !Number.isInteger(couverts) ||
      couverts < 1 ||
      couverts > 500 ||
      !nom
    ) {
      refuses++;
      return [];
    }
    const cle = cleDe(date, heure, nom);
    if (existantes.has(cle)) {
      dejaLa++;
      return [];
    }
    existantes.add(cle);

    const email = emailValide(String(r.email ?? ""));
    const telephone = telephoneAEnregistrer(court(r.telephone, 40));
    if (email) contacts.set(email, { nom, telephone });

    return [
      {
        restaurant_id: restaurantId,
        espace_id: espace.id,
        service_id: serviceDe(date, heure)?.id ?? null,
        date_reservation: date,
        heure_arrivee: heure,
        couverts,
        type: "table",
        statut: "confirmee",
        // Prise dans l'autre outil : Klarr n'envoie ni confirmation ni
        // rappel (voir la migration 0083).
        origine: "import",
        client_nom: nom,
        // La colonne est obligatoire ; certains exports ne donnent pas
        // l'adresse du client. Vide, elle ne reçoit rien, ce qui est
        // exactement ce qu'on veut pour une table prise ailleurs.
        client_email: email ?? "",
        client_telephone: telephone,
        note_interne: court(r.note, 1000),
        annulation_token: jetonAnnulation(),
      },
    ];
  });

  let ajoutes = 0;
  for (let i = 0; i < lignes.length; i += PAQUET) {
    const paquet = lignes.slice(i, i + PAQUET);
    const { error } = await supabase
      .from("restaurant_reservations")
      .insert(paquet);
    if (error) {
      console.error("[import/reservations]", error.message);
      return {
        erreur: `L'import s'est arrêté après ${ajoutes} réservations. Réessaie : celles déjà ajoutées ne seront pas dédoublées.`,
        ajoutes,
        dejaLa,
        refuses,
      };
    }
    ajoutes += paquet.length;
  }

  // Les clients de ces tables rejoignent le fichier, sans consentement :
  // réserver une table n'est pas accepter une newsletter.
  if (contacts.size > 0) {
    const { error } = await supabase.from("restaurant_contacts").upsert(
      [...contacts].map(([email, c]) => ({
        restaurant_id: restaurantId,
        email,
        nom: c.nom,
        telephone: c.telephone,
        consentement: false,
      })),
      { onConflict: "restaurant_id,email", ignoreDuplicates: true },
    );
    if (error) console.error("[import/reservations] contacts", error.message);
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  return { erreur: null, ajoutes, dejaLa, refuses };
}
