"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  LIBELLE_CHAMP,
  decoder,
  detecterColonnes,
  parserCsv,
  trierContacts,
  trierReservations,
  type Champ,
  type Colonnes,
} from "@/lib/import/csv";
import {
  importerContacts,
  importerReservations,
  type BilanImport,
} from "@/app/dashboard/[id]/import/actions";

export type Genre = "clients" | "reservations";
type Source = "thefork" | "zenchef" | "autre";

const CHAMPS: Record<Genre, { champ: Champ; requis?: boolean }[]> = {
  clients: [
    { champ: "email", requis: true },
    { champ: "prenom" },
    { champ: "nom" },
    { champ: "telephone" },
    { champ: "optin" },
  ],
  reservations: [
    { champ: "date", requis: true },
    { champ: "heure", requis: true },
    { champ: "couverts", requis: true },
    { champ: "nom", requis: true },
    { champ: "prenom" },
    { champ: "email" },
    { champ: "telephone" },
    { champ: "note" },
    { champ: "statut" },
  ],
};

/**
 * Où trouver l'export, outil par outil. Décrit le chemin plutôt que
 * l'intitulé exact des boutons : ces outils changent leurs écrans, et un
 * nom de menu faux égare plus qu'il n'aide.
 */
const OU_EXPORTER: Record<Source, Record<Genre, string[]>> = {
  thefork: {
    clients: [
      "Connecte-toi à TheFork Manager et ouvre ta liste de clients.",
      "Cherche l'option d'export et choisis le format CSV (ou Excel, que tu enregistreras en CSV).",
      "Si tu ne trouves pas l'export, demande-le au support TheFork : c'est ton fichier.",
    ],
    reservations: [
      "Dans TheFork Manager, ouvre la liste des réservations.",
      "Choisis la période à venir — par exemple les trois prochains mois — puis exporte en CSV.",
      "Garde TheFork ouvert jusqu'au jour de la bascule : les nouvelles réservations y arrivent encore.",
    ],
  },
  zenchef: {
    clients: [
      "Connecte-toi à Zenchef et ouvre la base clients.",
      "Cherche l'option d'export et choisis le format CSV (ou Excel, que tu enregistreras en CSV).",
      "Si tu ne trouves pas l'export, demande-le au support Zenchef : c'est ton fichier.",
    ],
    reservations: [
      "Dans Zenchef, ouvre la liste des réservations.",
      "Choisis la période à venir, puis exporte en CSV.",
      "Garde Zenchef ouvert jusqu'au jour de la bascule : les nouvelles réservations y arrivent encore.",
    ],
  },
  autre: {
    clients: [
      "Ouvre ton fichier dans Excel, Numbers ou Google Sheets.",
      "Une ligne par client, avec au moins une colonne e-mail.",
      "Enregistre-le au format CSV (Fichier → Enregistrer sous, ou Télécharger → CSV).",
    ],
    reservations: [
      "Ouvre ton tableau dans Excel, Numbers ou Google Sheets.",
      "Une ligne par réservation : date, heure, nombre de couverts et nom au minimum.",
      "Enregistre-le au format CSV (Fichier → Enregistrer sous, ou Télécharger → CSV).",
    ],
  },
};

const NOM_SOURCE: Record<Source, string> = {
  thefork: "TheFork",
  zenchef: "Zenchef",
  autre: "Un tableur",
};

const PUCE =
  "rounded-full border px-4 py-2 text-sm font-medium transition-colors";
const PUCE_ACTIVE = "border-brand-navy bg-brand-navy text-white";
const PUCE_REPOS =
  "border-zinc-200 bg-white text-zinc-700 hover:border-ink hover:text-ink";

function aujourdhuiParis(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function AssistantImport({
  restaurantId,
  sallePrete,
  genreInitial = "clients",
}: {
  restaurantId: string;
  /** Sans salle, une réservation n'a nulle part où se ranger. */
  sallePrete: boolean;
  genreInitial?: Genre;
}) {
  const [genre, setGenre] = useState<Genre>(genreInitial);
  const [source, setSource] = useState<Source>("thefork");
  const [fichier, setFichier] = useState<string | null>(null);
  const [erreurFichier, setErreurFichier] = useState<string | null>(null);
  const [entetes, setEntetes] = useState<string[]>([]);
  const [lignes, setLignes] = useState<string[][]>([]);
  const [colonnes, setColonnes] = useState<Colonnes | null>(null);
  const [certifie, setCertifie] = useState(false);
  const [bilan, setBilan] = useState<BilanImport | null>(null);
  const [enCours, demarrer] = useTransition();

  function recommencer() {
    setFichier(null);
    setEntetes([]);
    setLignes([]);
    setColonnes(null);
    setBilan(null);
    setCertifie(false);
    setErreurFichier(null);
  }

  async function lire(file: File) {
    recommencer();
    if (/\.(xlsx?|numbers)$/i.test(file.name)) {
      setErreurFichier(
        "C'est un fichier Excel ou Numbers : enregistre-le d'abord au format CSV, puis dépose ce CSV ici.",
      );
      return;
    }
    const texte = decoder(await file.arrayBuffer());
    const tableau = parserCsv(texte);
    if (tableau.length < 2) {
      setErreurFichier(
        "Le fichier semble vide : il faut une ligne d'en-têtes et au moins une ligne de données.",
      );
      return;
    }
    setFichier(file.name);
    setEntetes(tableau[0]);
    setLignes(tableau.slice(1));
    setColonnes(detecterColonnes(tableau[0]));
  }

  const tri = useMemo(() => {
    if (!colonnes) return null;
    return genre === "clients"
      ? trierContacts(lignes, colonnes)
      : trierReservations(lignes, colonnes, aujourdhuiParis());
  }, [genre, lignes, colonnes]);

  const manquants = colonnes
    ? CHAMPS[genre]
        .filter(
          ({ champ, requis }) =>
            requis &&
            colonnes[champ] < 0 &&
            // Un nom suffit s'il y a au moins un prénom, et inversement.
            !(champ === "nom" && colonnes.prenom >= 0),
        )
        .map(({ champ }) => LIBELLE_CHAMP[champ])
    : [];
  const optinCompte =
    genre === "clients" && tri
      ? (tri.valides as { optin: boolean }[]).filter((c) => c.optin).length
      : 0;

  function importer() {
    if (!tri || tri.valides.length === 0) return;
    demarrer(async () => {
      const resultat =
        genre === "clients"
          ? await importerContacts(
              restaurantId,
              tri.valides as Parameters<typeof importerContacts>[1],
              certifie,
            )
          : await importerReservations(
              restaurantId,
              tri.valides as Parameters<typeof importerReservations>[1],
            );
      setBilan(resultat);
    });
  }

  const champSelect =
    "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white";

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Quoi, et d'où */}
      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
        <span className="font-serif text-2xl text-ink">
          1. Ce que tu importes
        </span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["clients", "Mon fichier client"],
              ["reservations", "Mes réservations à venir"],
            ] as const
          ).map(([valeur, libelle]) => (
            <button
              key={valeur}
              type="button"
              onClick={() => {
                setGenre(valeur);
                recommencer();
              }}
              className={`${PUCE} ${genre === valeur ? PUCE_ACTIVE : PUCE_REPOS}`}
            >
              {libelle}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-600">Depuis :</span>
          {(Object.keys(NOM_SOURCE) as Source[]).map((valeur) => (
            <button
              key={valeur}
              type="button"
              onClick={() => setSource(valeur)}
              className={`${PUCE} ${source === valeur ? PUCE_ACTIVE : PUCE_REPOS}`}
            >
              {NOM_SOURCE[valeur]}
            </button>
          ))}
        </div>
        <ol className="flex flex-col gap-2.5 rounded-xl bg-zinc-50 p-4">
          {OU_EXPORTER[source][genre].map((etape, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
                {i + 1}
              </span>
              <span className="text-zinc-700">{etape}</span>
            </li>
          ))}
        </ol>
        {genre === "reservations" && !sallePrete && (
          <p className="rounded-xl border border-brand-orange/60 bg-brand-orange-soft px-4 py-3 text-sm text-ink">
            Crée d&apos;abord au moins une salle dans{" "}
            <Link
              href={`/dashboard/${restaurantId}/reservations/configuration`}
              className="font-semibold text-brand-orange-dark underline"
            >
              la configuration des réservations
            </Link>{" "}
            : chaque réservation importée doit y être rangée.
          </p>
        )}
      </section>

      {/* 2. Le fichier */}
      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
        <span className="font-serif text-2xl text-ink">2. Ton fichier</span>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50/60 px-6 py-8 text-center transition-colors hover:border-brand-navy">
          <span className="text-sm font-semibold text-ink">
            {fichier ?? "Choisis ou dépose ton fichier CSV"}
          </span>
          <span className="text-xs text-zinc-500">
            {fichier
              ? `${lignes.length} ligne${lignes.length > 1 ? "s" : ""} lue${lignes.length > 1 ? "s" : ""} — clique pour en choisir un autre`
              : "Il reste sur ton ordinateur tant que tu n'as pas cliqué « Importer »."}
          </span>
          <input
            type="file"
            accept=".csv,text/csv,.txt,.xlsx,.xls"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void lire(f);
              e.target.value = "";
            }}
          />
        </label>
        {erreurFichier && (
          <p className="text-sm text-red-600" role="alert">
            {erreurFichier}
          </p>
        )}
      </section>

      {/* 3. La correspondance et l'aperçu */}
      {colonnes && tri && (
        <section className="flex flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-serif text-2xl text-ink">
              3. Vérifie les colonnes
            </span>
            <span className="text-sm text-zinc-600">
              Klarr a reconnu ce qu&apos;il a pu. Corrige ce qui ne va pas :
              l&apos;aperçu se met à jour.
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CHAMPS[genre].map(({ champ, requis }) => (
              <label
                key={champ}
                className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700"
              >
                <span>
                  {LIBELLE_CHAMP[champ]}
                  {requis && <span className="text-brand-orange-dark"> *</span>}
                </span>
                <select
                  value={colonnes[champ]}
                  onChange={(e) =>
                    setColonnes({
                      ...colonnes,
                      [champ]: Number(e.target.value),
                    })
                  }
                  className={`${champSelect} font-normal`}
                >
                  <option value={-1}>— Aucune colonne —</option>
                  {entetes.map((entete, i) => (
                    <option key={i} value={i}>
                      {entete || `Colonne ${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          {manquants.length > 0 ? (
            <p className="rounded-xl border border-brand-orange/60 bg-brand-orange-soft px-4 py-3 text-sm text-ink">
              Il manque : {manquants.join(", ")}. Choisis la colonne
              correspondante ci-dessus.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4">
                  <span className="font-serif text-4xl leading-none text-ink">
                    {tri.valides.length}
                  </span>
                  <span className="text-sm text-zinc-600">
                    {genre === "clients"
                      ? "clients prêts à importer"
                      : "réservations à venir prêtes à importer"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200/70 bg-white px-5 py-4">
                  <span className="font-serif text-4xl leading-none text-ink">
                    {tri.ecartees.length}
                  </span>
                  <span className="text-sm text-zinc-600">
                    lignes laissées de côté
                  </span>
                </div>
              </div>

              {tri.valides.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-zinc-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-[0.06em] text-zinc-500">
                      <tr>
                        {(genre === "clients"
                          ? ["E-mail", "Nom", "Téléphone", "Opt-in"]
                          : ["Date", "Heure", "Couverts", "Nom", "E-mail"]
                        ).map((t) => (
                          <th key={t} className="px-4 py-2.5">
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tri.valides.slice(0, 5).map((v, i) => (
                        <tr key={i} className="border-t border-zinc-100">
                          {(genre === "clients"
                            ? [
                                (v as { email: string }).email,
                                (v as { nom: string | null }).nom ?? "—",
                                (v as { telephone: string | null }).telephone ??
                                  "—",
                                (v as { optin: boolean }).optin ? "oui" : "—",
                              ]
                            : [
                                new Date(
                                  `${(v as { date: string }).date}T12:00:00`,
                                ).toLocaleDateString("fr-FR", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                }),
                                (v as { heure: string }).heure,
                                String((v as { couverts: number }).couverts),
                                (v as { nom: string }).nom,
                                (v as { email: string | null }).email ?? "—",
                              ]
                          ).map((cellule, j) => (
                            <td
                              key={j}
                              className="max-w-[16rem] truncate px-4 py-2.5 text-ink"
                            >
                              {cellule}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tri.valides.length > 5 && (
                    <p className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-500">
                      … et {tri.valides.length - 5} autres
                    </p>
                  )}
                </div>
              )}

              {tri.ecartees.length > 0 && (
                <details className="text-sm text-zinc-600">
                  <summary className="cursor-pointer font-medium text-zinc-700">
                    Pourquoi {tri.ecartees.length} ligne
                    {tri.ecartees.length > 1
                      ? "s sont laissées"
                      : " est laissée"}{" "}
                    de côté
                  </summary>
                  <ul className="mt-2 flex flex-col gap-1">
                    {tri.ecartees.slice(0, 20).map((e) => (
                      <li key={e.ligne}>
                        Ligne {e.ligne} : {e.raison}
                      </li>
                    ))}
                    {tri.ecartees.length > 20 && (
                      <li>… et {tri.ecartees.length - 20} autres</li>
                    )}
                  </ul>
                </details>
              )}

              {genre === "clients" &&
                colonnes.optin >= 0 &&
                optinCompte > 0 && (
                  <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
                    <input
                      type="checkbox"
                      checked={certifie}
                      onChange={(e) => setCertifie(e.target.checked)}
                      className="mt-1 accent-brand-navy"
                    />
                    <span>
                      Je certifie que les {optinCompte} clients marqués « oui »
                      dans la colonne « {entetes[colonnes.optin]} » ont accepté
                      de recevoir les actualités de mon restaurant. Sans cette
                      case, ils sont importés sans consentement : ils
                      n&apos;apparaîtront pas dans les destinataires de tes
                      campagnes.
                    </span>
                  </label>
                )}
              {genre === "clients" && colonnes.optin < 0 && (
                <p className="text-sm text-zinc-500">
                  Aucune colonne d&apos;opt-in : les clients sont importés sans
                  consentement, et ne recevront pas tes campagnes tant
                  qu&apos;ils ne l&apos;auront pas donné en réservant.
                </p>
              )}
              {genre === "reservations" && (
                <p className="text-sm text-zinc-500">
                  Les réservations importées arrivent confirmées dans ton
                  carnet. Klarr n&apos;envoie rien à ces clients : ils ont déjà
                  reçu leur confirmation de l&apos;autre outil.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={importer}
                  disabled={
                    enCours ||
                    tri.valides.length === 0 ||
                    (genre === "reservations" && !sallePrete) ||
                    bilan?.erreur === null
                  }
                  className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
                >
                  {enCours
                    ? "Import en cours…"
                    : `Importer ${tri.valides.length} ${
                        genre === "clients"
                          ? tri.valides.length > 1
                            ? "clients"
                            : "client"
                          : tri.valides.length > 1
                            ? "réservations"
                            : "réservation"
                      }`}
                </button>
                <button
                  type="button"
                  onClick={recommencer}
                  className="text-sm text-zinc-500 transition-colors hover:text-ink"
                >
                  Recommencer
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* 4. Le résultat */}
      {bilan && (
        <section
          className={`flex flex-col gap-2 rounded-2xl border p-6 ${
            bilan.erreur
              ? "border-red-200 bg-red-50"
              : "border-emerald-200 bg-emerald-50/60"
          }`}
          role="status"
        >
          <span className="font-serif text-2xl text-ink">
            {bilan.erreur ? "L'import s'est interrompu" : "Import terminé"}
          </span>
          {bilan.erreur && (
            <p className="text-sm text-red-700">{bilan.erreur}</p>
          )}
          <p className="text-sm leading-relaxed text-zinc-700">
            {bilan.ajoutes} {genre === "clients" ? "client" : "réservation"}
            {bilan.ajoutes > 1 ? "s" : ""} ajouté
            {genre === "reservations" ? "e" : ""}
            {bilan.ajoutes > 1 ? "s" : ""}
            {bilan.dejaLa > 0
              ? `, ${bilan.dejaLa} déjà présent${genre === "reservations" ? "e" : ""}${bilan.dejaLa > 1 ? "s" : ""}`
              : ""}
            {bilan.refuses > 0
              ? `, ${bilan.refuses} refusé${genre === "reservations" ? "e" : ""}${bilan.refuses > 1 ? "s" : ""}`
              : ""}
            {genre === "clients" && bilan.joignables
              ? `. ${bilan.joignables} pourront recevoir tes campagnes.`
              : "."}
          </p>
          {!bilan.erreur && (
            <Link
              href={`/dashboard/${restaurantId}/${genre === "clients" ? "clients" : "reservations"}`}
              className="w-fit text-sm font-semibold text-brand-orange-dark hover:underline"
            >
              {genre === "clients"
                ? "Voir mon fichier client →"
                : "Voir mon carnet →"}
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
