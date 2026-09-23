import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import {
  echapper,
  enveloppe,
  lien,
  texteNu,
  type Bloc,
  type Message,
} from "@/lib/courriel/messages";
import { lienAvisGoogle } from "@/lib/avis/liens";
import { lienDesabonnement } from "@/lib/campagnes/message";
import { COURRIELS } from "@/lib/i18n/courriels";
import { estLangue, type Langue } from "@/lib/i18n/langues";
import { siteUrl } from "@/lib/site-url";

/**
 * Le lendemain de la visite : merci, et un avis si vous avez une minute.
 *
 * C'est ce qui fait le plus monter le nombre d'avis d'un restaurant, et
 * Klarr a déjà tout sous la main : l'adresse du client, le jour où il est
 * venu, la fiche Google de la maison.
 *
 * **Le même message pour tout le monde.** Un bouton vers Google, et juste
 * dessous un lien pour écrire à la maison — sans demander d'abord si le
 * repas a plu. Envoyer les contents vers Google et les autres ailleurs,
 * c'est ce que Google interdit (le « review gating »), et une fiche peut
 * perdre ses avis pour ça. Le totem suit la même règle, voir
 * `lib/avis/liens.ts`.
 *
 * Qui ne le reçoit pas :
 * - les tables importées d'un autre outil, et les absents constatés ;
 * - ceux qui se sont désinscrits des messages de la maison ;
 * - un habitué qui l'a déjà reçu dans les 90 derniers jours — on ne
 *   redemande pas un avis à chaque dîner ;
 * - les clients d'une maison qui a coupé l'envoi.
 *
 * Un seul envoi par réservation : la trace est posée avant l'envoi dans
 * `reservation_courriels`, dont la contrainte d'unicité fait le reste.
 */

export const GENRE_AVIS = "avis";
const DELAI_ENTRE_DEUX_JOURS = 90;

export type DemandeAvis = {
  restaurantNom: string;
  restaurantAdresse: string | null;
  langue: Langue;
  /** Le formulaire d'avis Google, ou la page d'avis de la maison. */
  lienGoogle: string;
  /** La page où l'on écrit à la maison, sans passer par Google. */
  lienPrive: string | null;
  /** Le lien de désinscription du client, s'il est au fichier. */
  lienDesabonnement: string | null;
};

/** Un sujet tient sur une ligne : le nom vient d'un formulaire. */
function surUneLigne(texte: string): string {
  return texte.replace(/[\r\n]+/g, " ").slice(0, 180);
}

export function messageAvis(d: DemandeAvis): Message {
  const m = COURRIELS[d.langue] ?? COURRIELS.fr;
  const nom = echapper(d.restaurantNom);
  const blocs: Bloc[] = [
    m.avisMerci(nom),
    m.avisDemande,
    { bouton: { libelle: m.avisBouton, url: d.lienGoogle } },
    d.lienPrive ? m.avisPrive(lien(m.avisLibellePrive, d.lienPrive)) : "",
  ];
  const morceaux = [m.avisPourquoi(nom)];
  if (d.restaurantAdresse) morceaux.push(echapper(d.restaurantAdresse));
  if (d.lienDesabonnement) {
    morceaux.push(lien(m.avisNePlusRecevoir, d.lienDesabonnement));
  }
  const pied = morceaux.join("<br />");
  return {
    sujet: surUneLigne(m.avisSujet(d.restaurantNom)),
    texte: texteNu(blocs, d.restaurantNom, pied, d.langue),
    html: enveloppe(blocs, d.restaurantNom, pied, d.langue),
  };
}

/**
 * Les deux liens d'une maison. Le bouton va droit au formulaire Google
 * quand la fiche est connue ; sinon à la page d'avis de la maison, qui
 * sait la retrouver et propose les deux chemins.
 */
export function liensAvis(maison: {
  google_place_id: string | null;
  slug_reservation: string | null;
}): { lienGoogle: string; lienPrive: string | null } | null {
  const page = maison.slug_reservation
    ? `${siteUrl()}/avis/${maison.slug_reservation}`
    : null;
  const google = lienAvisGoogle(maison.google_place_id) ?? page;
  if (!google) return null;
  return { lienGoogle: google, lienPrive: page };
}

/** « 2026-09-22 » à Paris : la veille, pas celle du serveur en UTC. */
export function hierAParis(maintenant: Date): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(maintenant.getTime() - 24 * 3600 * 1000));
}

export type BilanAvis = {
  concernees: number;
  envoyes: number;
  echoues: number;
  ignorees: number;
};

type Reservation = {
  id: string;
  restaurant_id: string;
  client_email: string | null;
  langue: string | null;
};

type Maison = {
  id: string;
  nom: string;
  adresse: string | null;
  email_contact: string | null;
  google_place_id: string | null;
  slug_reservation: string | null;
  avis_apres_visite?: boolean | null;
};

export async function demanderLesAvis({
  supabase,
  maintenant,
  plafond = 300,
}: {
  supabase: SupabaseClient;
  maintenant: Date;
  plafond?: number;
}): Promise<BilanAvis> {
  const bilan: BilanAvis = {
    concernees: 0,
    envoyes: 0,
    echoues: 0,
    ignorees: 0,
  };
  const jour = hierAParis(maintenant);

  const { data, error } = await supabase
    .from("restaurant_reservations")
    .select("id, restaurant_id, client_email, langue")
    .eq("date_reservation", jour)
    .eq("statut", "confirmee")
    .is("absence_constatee_le", null)
    .neq("origine", "import")
    .limit(plafond);
  if (error) {
    console.error("[avis-apres-visite] lecture impossible", error.message);
    return bilan;
  }
  const reservations = ((data ?? []) as Reservation[]).filter((r) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((r.client_email ?? "").trim()),
  );
  bilan.concernees = reservations.length;
  if (reservations.length === 0) return bilan;

  const idsMaisons = [...new Set(reservations.map((r) => r.restaurant_id))];
  // Toute la ligne : la colonne du réglage n'existe qu'après la
  // migration 0084, et une maison sans elle garde l'envoi par défaut.
  const { data: maisonsData } = await supabase
    .from("restaurants")
    .select("*")
    .in("id", idsMaisons);
  const maisons = new Map(
    ((maisonsData ?? []) as Maison[]).map((m) => [m.id, m]),
  );

  const emails = [
    ...new Set(reservations.map((r) => r.client_email!.trim().toLowerCase())),
  ];
  const { data: contactsData } = await supabase
    .from("restaurant_contacts")
    .select("restaurant_id, email, jeton, desabonne_le")
    .in("restaurant_id", idsMaisons)
    .in("email", emails);
  const contacts = new Map(
    (
      (contactsData ?? []) as {
        restaurant_id: string;
        email: string;
        jeton: string;
        desabonne_le: string | null;
      }[]
    ).map((c) => [`${c.restaurant_id}|${c.email}`, c]),
  );

  // Qui a déjà reçu la demande de cette maison récemment.
  const depuis = new Date(
    maintenant.getTime() - DELAI_ENTRE_DEUX_JOURS * 24 * 3600 * 1000,
  ).toISOString();
  const { data: dejaData } = await supabase
    .from("reservation_courriels")
    .select("destinataire, restaurant_reservations!inner(restaurant_id)")
    .eq("genre", GENRE_AVIS)
    .gte("envoye_le", depuis)
    .in("destinataire", emails);
  const deja = new Set(
    (
      (dejaData ?? []) as unknown as {
        destinataire: string;
        restaurant_reservations:
          | { restaurant_id: string }
          | { restaurant_id: string }[];
      }[]
    ).flatMap((ligne) =>
      [ligne.restaurant_reservations]
        .flat()
        .map((r) => `${r.restaurant_id}|${ligne.destinataire}`),
    ),
  );

  for (const reservation of reservations) {
    const maison = maisons.get(reservation.restaurant_id);
    const email = reservation.client_email!.trim().toLowerCase();
    const cle = `${reservation.restaurant_id}|${email}`;
    const contact = contacts.get(cle);
    const liens = maison ? liensAvis(maison) : null;

    if (
      !maison ||
      maison.avis_apres_visite === false ||
      !liens ||
      contact?.desabonne_le ||
      deja.has(cle)
    ) {
      bilan.ignorees += 1;
      continue;
    }
    // Deux tables le même soir pour la même personne : un seul message.
    deja.add(cle);

    const { error: erreurTrace } = await supabase
      .from("reservation_courriels")
      .insert({
        reservation_id: reservation.id,
        genre: GENRE_AVIS,
        destinataire: email,
      });
    if (erreurTrace) {
      if (erreurTrace.code !== "23505") {
        console.error("[avis-apres-visite/trace]", erreurTrace.message);
      }
      bilan.ignorees += 1;
      continue;
    }

    const resultat = await envoyerCourriel({
      destinataire: email,
      repondreA: maison.email_contact ?? undefined,
      ...messageAvis({
        restaurantNom: maison.nom,
        restaurantAdresse: maison.adresse,
        langue: estLangue(reservation.langue) ? reservation.langue : "fr",
        ...liens,
        lienDesabonnement: contact ? lienDesabonnement(contact.jeton) : null,
      }),
    });

    if (resultat.envoye) {
      bilan.envoyes += 1;
    } else {
      bilan.echoues += 1;
      await supabase
        .from("reservation_courriels")
        .update({ erreur: resultat.erreur ?? "inconnue" })
        .eq("reservation_id", reservation.id)
        .eq("genre", GENRE_AVIS);
    }
  }

  return bilan;
}
