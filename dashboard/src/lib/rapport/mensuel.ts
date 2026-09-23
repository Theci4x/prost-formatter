import "server-only";
import { comparer } from "@/lib/voisins/comparaison";
import type { SupabaseClient } from "@supabase/supabase-js";
import { chargerPouls } from "@/lib/dashboard/pouls";
import { echapper, enveloppe, lien, type Bloc } from "@/lib/courriel/messages";
import { siteUrl } from "@/lib/site-url";

/**
 * Le rapport du mois, envoyé au restaurateur le 1er.
 *
 * Il sert à une chose : rappeler, même à celui qui n'ouvre jamais le
 * tableau de bord, ce que Klarr a fait pour lui ce mois-ci — et ce qui
 * l'attend. Quatre chiffres, trois lignes, une liste courte de choses à
 * faire. Plus long, il ne serait pas lu ; plus court, il ne dirait rien.
 *
 * Les chiffres se comparent au mois d'avant quand ça a un sens (les
 * couverts), et jamais quand ça n'en a pas : une note qui passe de 4,6 à
 * 4,6 n'a pas besoin d'une flèche.
 */

export type Periode = {
  /** « 2026-08 » : le mois raconté. */
  mois: string;
  debut: string;
  fin: string;
  /** « août 2026 ». */
  libelle: string;
  precedent: { debut: string; fin: string };
};

/** Le jour à Paris, « AAAA-MM-JJ » : la frontière d'un mois se juge là. */
function jourParis(date: Date): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function bornes(annee: number, mois: number) {
  const dernier = new Date(Date.UTC(annee, mois, 0)).getUTCDate();
  const mm = String(mois).padStart(2, "0");
  return {
    debut: `${annee}-${mm}-01`,
    fin: `${annee}-${mm}-${String(dernier).padStart(2, "0")}`,
  };
}

/** « d'août 2026 », « de septembre 2026 » : l'élision devant une voyelle. */
export function deMois(libelle: string): string {
  return /^[aeiouéè]/i.test(libelle) ? `d'${libelle}` : `de ${libelle}`;
}

/** Le mois qui vient de s'achever, vu de Paris. */
export function periodeDuRapport(maintenant: Date): Periode {
  const [a, m] = jourParis(maintenant).split("-").map(Number);
  const annee = m === 1 ? a - 1 : a;
  const mois = m === 1 ? 12 : m - 1;
  const anneeAvant = mois === 1 ? annee - 1 : annee;
  const moisAvant = mois === 1 ? 12 : mois - 1;
  return {
    mois: `${annee}-${String(mois).padStart(2, "0")}`,
    ...bornes(annee, mois),
    libelle: new Date(Date.UTC(annee, mois - 1, 15)).toLocaleDateString(
      "fr-FR",
      { month: "long", year: "numeric", timeZone: "UTC" },
    ),
    precedent: bornes(anneeAvant, moisAvant),
  };
}

export type Rapport = {
  restaurant: { id: string; nom: string };
  periode: Periode;
  reservations: {
    nombre: number;
    couverts: number;
    couvertsAvant: number;
    absences: number;
  };
  acomptesCentimes: number;
  avis: {
    note: number | null;
    /** Avis gagnés sur Google dans le mois ; null sans deux relevés. */
    nouveaux: number | null;
    /** Réponses publiées depuis Klarr ; null sans la migration 0081. */
    reponses: number | null;
  };
  retours: { recus: number; aLire: number };
  clients: { nouveaux: number; joignables: number };
  aFaire: { texte: string; chemin: string }[];
  /** La maison face à ses voisins suivis ; null sans voisins. */
  voisins: {
    rang: number | null;
    total: number;
    gain: number | null;
    gainMoyen: number | null;
  } | null;
};

type RestaurantRapport = {
  id: string;
  nom: string;
  photo_couverture_id?: string | null;
  site_publie?: boolean | null;
  carte_publique?: boolean | null;
  email_contact?: string | null;
  google_statut?: string | null;
  fiche_modifiee_le?: string | null;
  tripadvisor_location_id?: string | null;
};

/** Un compte sans rapatrier les lignes ; zéro si la table manque. */
async function compte(
  requete: PromiseLike<{ count: number | null; error: unknown }>,
): Promise<number | null> {
  const { count, error } = await requete;
  return error ? null : (count ?? 0);
}

export async function calculerRapport(
  supabase: SupabaseClient,
  restaurant: RestaurantRapport,
  periode: Periode,
  maintenant: Date = new Date(),
): Promise<Rapport> {
  const id = restaurant.id;
  const { debut, fin, precedent } = periode;
  // Les horodatages se comparent en UTC ; une heure de décalage à la
  // frontière du mois ne change rien à un bilan mensuel.
  const debutTs = `${debut}T00:00:00Z`;
  const finTs = `${fin}T23:59:59Z`;

  const [
    reservations,
    reservationsAvant,
    snapshotFin,
    snapshotDebut,
    reponses,
    retoursRecus,
    retoursALire,
    contactsNouveaux,
    contactsJoignables,
    pouls,
  ] = await Promise.all([
    supabase
      .from("restaurant_reservations")
      .select(
        "couverts, absence_constatee_le, acompte_centimes, acompte_statut",
      )
      .eq("restaurant_id", id)
      .eq("statut", "confirmee")
      .gte("date_reservation", debut)
      .lte("date_reservation", fin)
      .then(
        ({ data }) =>
          (data ?? []) as {
            couverts: number | null;
            absence_constatee_le: string | null;
            acompte_centimes: number | null;
            acompte_statut: string | null;
          }[],
      ),
    supabase
      .from("restaurant_reservations")
      .select("couverts")
      .eq("restaurant_id", id)
      .eq("statut", "confirmee")
      .is("absence_constatee_le", null)
      .gte("date_reservation", precedent.debut)
      .lte("date_reservation", precedent.fin)
      .then(({ data }) => (data ?? []) as { couverts: number | null }[]),
    supabase
      .from("restaurant_reputation_snapshots")
      .select("note, nombre_avis")
      .eq("restaurant_id", id)
      .eq("plateforme", "google")
      .lte("releve_le", finTs)
      .order("releve_le", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(
        ({ data }) =>
          data as {
            note: number | string | null;
            nombre_avis: number | null;
          } | null,
      ),
    supabase
      .from("restaurant_reputation_snapshots")
      .select("nombre_avis")
      .eq("restaurant_id", id)
      .eq("plateforme", "google")
      .lt("releve_le", debutTs)
      .order("releve_le", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data as { nombre_avis: number | null } | null),
    compte(
      supabase
        .from("restaurant_avis_reponses")
        .select("cle", { count: "exact", head: true })
        .eq("restaurant_id", id)
        .gte("repondu_le", debutTs)
        .lte("repondu_le", finTs),
    ),
    compte(
      supabase
        .from("restaurant_retours")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", id)
        .gte("created_at", debutTs)
        .lte("created_at", finTs),
    ),
    compte(
      supabase
        .from("restaurant_retours")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", id)
        .eq("traite", false),
    ),
    compte(
      supabase
        .from("restaurant_contacts")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", id)
        .gte("created_at", debutTs)
        .lte("created_at", finTs),
    ),
    compte(
      supabase
        .from("restaurant_contacts")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", id)
        .eq("consentement", true)
        .is("desabonne_le", null)
        .gte("created_at", debutTs)
        .lte("created_at", finTs),
    ),
    chargerPouls(supabase, restaurant, maintenant),
  ]);

  const honorees = reservations.filter((r) => !r.absence_constatee_le);
  const couverts = honorees.reduce((t, r) => t + (r.couverts ?? 0), 0);
  const couvertsAvant = reservationsAvant.reduce(
    (t, r) => t + (r.couverts ?? 0),
    0,
  );
  const acomptesCentimes = reservations
    .filter((r) => r.acompte_statut === "paye")
    .reduce((t, r) => t + (r.acompte_centimes ?? 0), 0);
  const nouveauxAvis =
    snapshotFin?.nombre_avis != null && snapshotDebut?.nombre_avis != null
      ? Math.max(0, snapshotFin.nombre_avis - snapshotDebut.nombre_avis)
      : null;

  // Ce qui attend, dans l'ordre où ça coûte le plus d'attendre.
  const base = `/dashboard/${id}`;
  const aFaire: { texte: string; chemin: string }[] = [];
  if (pouls.aConfirmer > 0) {
    aFaire.push({
      texte: `${pouls.aConfirmer} demande${pouls.aConfirmer > 1 ? "s" : ""} de réservation à confirmer`,
      chemin: `${base}/reservations`,
    });
  }
  if (pouls.sansEmailContact) {
    aFaire.push({
      texte:
        "Ajoute une adresse e-mail de contact : sans elle, les alertes de réservation ne partent nulle part",
      chemin: `${base}/reservations/configuration`,
    });
  }
  if ((retoursALire ?? 0) > 0) {
    aFaire.push({
      texte: `${retoursALire} retour${retoursALire! > 1 ? "s" : ""} client${retoursALire! > 1 ? "s" : ""} à lire`,
      chemin: `${base}/retours`,
    });
  }
  if (nouveauxAvis && nouveauxAvis > (reponses ?? 0)) {
    aFaire.push({
      texte: "Réponds à tes nouveaux avis : Klarr te propose chaque réponse",
      chemin: `${base}/avis`,
    });
  }
  if (pouls.presenceARevoir > 0) {
    aFaire.push({
      texte: `${pouls.presenceARevoir} fiche${pouls.presenceARevoir > 1 ? "s" : ""} à mettre à jour sur Apple, Bing et les autres`,
      chemin: `${base}/presence`,
    });
  }

  // Les voisins, si la maison en suit : la table peut manquer (migration
  // 0086), et un bilan ne doit jamais tomber pour ça.
  const comparaison = await comparer(supabase, restaurant, debut, fin).catch(
    () => null,
  );
  const voisins =
    comparaison && comparaison.lignes.some((l) => !l.nous)
      ? {
          rang: comparaison.rang,
          total: comparaison.lignes.filter((l) => l.note != null).length,
          gain: comparaison.lignes.find((l) => l.nous)?.gain ?? null,
          gainMoyen:
            comparaison.moyenneGain != null
              ? Math.round(comparaison.moyenneGain)
              : null,
        }
      : null;

  return {
    restaurant: { id, nom: restaurant.nom },
    periode,
    reservations: {
      nombre: honorees.length,
      couverts,
      couvertsAvant,
      absences: reservations.length - honorees.length,
    },
    acomptesCentimes,
    avis: {
      note: snapshotFin?.note != null ? Number(snapshotFin.note) : null,
      nouveaux: nouveauxAvis,
      reponses,
    },
    retours: { recus: retoursRecus ?? 0, aLire: retoursALire ?? 0 },
    clients: {
      nouveaux: contactsNouveaux ?? 0,
      joignables: contactsJoignables ?? 0,
    },
    aFaire,
    voisins,
  };
}

/* ——— Mise en forme ———————————————————————————————————————————— */

const ENCRE = "#1f1b17";
const ENCRE_DOUCE = "#7a7168";
const FOND = "#f4f1ec";
const MARQUE = "#0f1e3d";
const POLICE =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

const nombre = (n: number) => n.toLocaleString("fr-FR");
const euros = (centimes: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: centimes % 100 === 0 ? 0 : 2,
  }).format(centimes / 100);
const pluriel = (n: number, mot: string) => `${mot}${n > 1 ? "s" : ""}`;

/** « +12 % par rapport à juillet », ou rien quand la comparaison ne dit rien. */
function evolution(avant: number, apres: number): string | null {
  if (avant === 0) return null;
  const ecart = Math.round(((apres - avant) / avant) * 100);
  if (ecart === 0) return "comme le mois d'avant";
  return `${ecart > 0 ? "+" : ""}${ecart} % sur un mois`;
}

type Tuile = { valeur: string; libelle: string; detail: string | null };

function tuiles(r: Rapport): Tuile[] {
  const { reservations, avis, clients } = r;
  return [
    {
      valeur: reservations.couverts > 0 ? nombre(reservations.couverts) : "—",
      libelle: "couverts réservés dans Klarr",
      detail: evolution(reservations.couvertsAvant, reservations.couverts),
    },
    {
      valeur: reservations.nombre > 0 ? nombre(reservations.nombre) : "—",
      libelle: pluriel(reservations.nombre, "réservation"),
      detail:
        reservations.absences > 0
          ? `${reservations.absences} ${pluriel(reservations.absences, "absence")} constatée${reservations.absences > 1 ? "s" : ""}`
          : reservations.nombre > 0
            ? "aucune absence constatée"
            : null,
    },
    {
      valeur: avis.note != null ? avis.note.toFixed(1).replace(".", ",") : "—",
      libelle: "note Google",
      detail:
        avis.nouveaux != null
          ? `${avis.nouveaux > 0 ? "+" : ""}${avis.nouveaux} avis ce mois-ci`
          : null,
    },
    {
      valeur: nombre(clients.nouveaux),
      libelle:
        clients.nouveaux > 1
          ? "nouveaux clients au fichier"
          : "nouveau client au fichier",
      detail:
        clients.nouveaux > 0
          ? `dont ${clients.joignables} ${pluriel(clients.joignables, "joignable")} par campagne`
          : null,
    },
  ];
}

/** Les lignes secondaires : seulement celles qui ont quelque chose à dire. */
function lignes(r: Rapport): string[] {
  const l: string[] = [];
  if (r.acomptesCentimes > 0) {
    l.push(
      `${euros(r.acomptesCentimes)} d'acomptes encaissés, sans commission`,
    );
  }
  if (r.avis.reponses) {
    l.push(
      `${r.avis.reponses} ${pluriel(r.avis.reponses, "réponse")} à des avis ${r.avis.reponses > 1 ? "publiées" : "publiée"}`,
    );
  }
  if (r.voisins?.rang) {
    const signe = (n: number) => `${n > 0 ? "+" : ""}${n}`;
    const rythme =
      r.voisins.gain != null && r.voisins.gainMoyen != null
        ? `, et ${signe(r.voisins.gain)} avis ce mois-ci contre ${signe(r.voisins.gainMoyen)} en moyenne chez tes voisins`
        : "";
    l.push(
      `${r.voisins.rang === 1 ? "1re" : `${r.voisins.rang}e`} note Google sur ${r.voisins.total} dans ton quartier${rythme}`,
    );
  }
  if (r.retours.recus > 0) {
    l.push(
      `${r.retours.recus} ${pluriel(r.retours.recus, "retour")} ${pluriel(r.retours.recus, "client")} ${pluriel(r.retours.recus, "reçu")} en privé, avant d'être écrits en public`,
    );
  }
  return l;
}

function grilleHtml(liste: Tuile[]): string {
  const cellule = (t: Tuile) =>
    [
      `<td width="50%" valign="top" style="padding:6px">`,
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`,
      `<td bgcolor="${FOND}" style="padding:16px 16px 14px;background:${FOND};border-radius:12px">`,
      `<div style="font-family:${SERIF};font-size:34px;line-height:1;color:${MARQUE}">${echapper(t.valeur)}</div>`,
      `<div style="margin-top:8px;font-family:${POLICE};font-size:13px;line-height:1.4;color:${ENCRE}">${echapper(t.libelle)}</div>`,
      t.detail
        ? `<div style="margin-top:3px;font-family:${POLICE};font-size:12px;line-height:1.4;color:${ENCRE_DOUCE}">${echapper(t.detail)}</div>`
        : "",
      `</td></tr></table></td>`,
    ].join("");
  const rangees: string[] = [];
  for (let i = 0; i < liste.length; i += 2) {
    rangees.push(
      `<tr>${cellule(liste[i])}${liste[i + 1] ? cellule(liste[i + 1]) : "<td></td>"}</tr>`,
    );
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 -6px 18px">${rangees.join("")}</table>`;
}

function listeHtml(titre: string, elements: string[]): string {
  return [
    `<p style="margin:6px 0 8px;font-family:${POLICE};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:${ENCRE_DOUCE}">${echapper(titre)}</p>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px">`,
    ...elements.map(
      (element) =>
        `<tr><td valign="top" style="padding:3px 10px 3px 0;font-family:${POLICE};font-size:15px;line-height:1.55;color:${MARQUE}">•</td><td style="padding:3px 0;font-family:${POLICE};font-size:15px;line-height:1.55;color:${ENCRE}">${element}</td></tr>`,
    ),
    `</table>`,
  ].join("");
}

export type MessageRapport = { sujet: string; texte: string; html: string };

export function rendreRapport(r: Rapport): MessageRapport {
  const site = siteUrl();
  const { nom, id } = r.restaurant;
  const mois = r.periode.libelle;
  const liste = tuiles(r);
  const autres = lignes(r);
  const reglages = `${site}/dashboard/${id}/rapport`;

  const blocs: Bloc[] = [
    `Voici le bilan ${echapper(deMois(mois))} pour ${echapper(nom)}.`,
    { brut: grilleHtml(liste) },
    autres.length > 0
      ? { brut: listeHtml("Et aussi", autres.map(echapper)) }
      : "",
    r.aFaire.length > 0
      ? {
          brut: listeHtml(
            "À faire ce mois-ci",
            r.aFaire.map((a) => lien(a.texte, `${site}${a.chemin}`)),
          ),
        }
      : `Rien ne t'attend : tout est à jour. Bon mois à toute l'équipe.`,
    {
      bouton: {
        libelle: "Ouvrir mon tableau de bord",
        url: `${site}/dashboard`,
      },
    },
  ];

  const pied = `Tu reçois ce bilan chaque mois parce que ${echapper(nom)} utilise Klarr. ${lien("Ne plus le recevoir", reglages)}.`;

  const texte = [
    `Voici le bilan ${deMois(mois)} pour ${nom}.`,
    "",
    ...liste.map(
      (t) => `${t.valeur} — ${t.libelle}${t.detail ? ` (${t.detail})` : ""}`,
    ),
    ...(autres.length > 0
      ? ["", "Et aussi :", ...autres.map((a) => `- ${a}`)]
      : []),
    "",
    ...(r.aFaire.length > 0
      ? [
          "À faire ce mois-ci :",
          ...r.aFaire.map((a) => `- ${a.texte} : ${site}${a.chemin}`),
        ]
      : ["Rien ne t'attend : tout est à jour."]),
    "",
    `Ton tableau de bord : ${site}/dashboard`,
    "",
    "—",
    `Tu reçois ce bilan chaque mois parce que ${nom} utilise Klarr. Pour ne plus le recevoir : ${reglages}`,
  ].join("\n");

  return {
    sujet: `${nom} — ton bilan ${deMois(mois)}`,
    texte,
    html: enveloppe(blocs, `Bilan ${deMois(mois)}`, pied),
  };
}
