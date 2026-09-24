import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { TitreSection } from "@/components/dashboard/Compteur";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import {
  chercherAutour,
  positionDe,
  type LieuAutour,
  type Position,
} from "@/lib/google/places";
import {
  VOISINS_MAX,
  comparer,
  distanceLisible,
  distanceMetres,
  type Ligne,
} from "@/lib/voisins/comparaison";
import { retirerVoisin, suivreVoisins } from "./actions";

/**
 * Les voisins : cinq restaurants proches, relevés chaque lundi sur
 * Google. Pas un score de plus — la note, le nombre d'avis, et combien
 * chacun en a gagné en un mois. C'est ce dernier chiffre qui dit qui
 * avance.
 */

function jourIso(decalageJours: number): string {
  return new Date(Date.now() + decalageJours * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
}

const note = (n: number | null) =>
  n != null ? n.toFixed(1).replace(".", ",") : "—";
const gain = (n: number | null) =>
  n == null ? "—" : `${n > 0 ? "+" : ""}${n.toLocaleString("fr-FR")}`;
const moyenne = (n: number | null, decimales: number) =>
  n == null
    ? "—"
    : n.toLocaleString("fr-FR", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
      });

type Candidat = LieuAutour & { distance: number | null };

async function candidats(
  centre: Position,
  requete: string,
  exclus: Set<string>,
  rayon: number,
): Promise<Candidat[]> {
  const lieux = await chercherAutour(requete, centre, rayon);
  return lieux
    .filter((l) => !exclus.has(l.id))
    .map((l) => ({
      ...l,
      distance: l.position ? distanceMetres(centre, l.position) : null,
    }))
    .sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9))
    .slice(0, 10);
}

export default async function VoisinsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

  const supabase = await createClient();
  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const restaurant = restaurantData as {
    id: string;
    nom: string;
    google_place_id: string | null;
    type_cuisine: string | null;
  } | null;
  if (!restaurant) notFound();

  const comparaison = await comparer(
    supabase,
    restaurant,
    jourIso(-30),
    jourIso(0),
  );
  const migrationManquante = comparaison === null;
  const lignes = comparaison?.lignes ?? [];
  const suivis = lignes.filter((l) => !l.nous);
  const nous = lignes.find((l) => l.nous) ?? null;
  const reste = VOISINS_MAX - suivis.length;

  // Les propositions ne coûtent un appel à Google que lorsqu'il reste une
  // place à prendre, ou qu'on cherche un nom précis.
  let propositions: Candidat[] = [];
  let erreurGoogle: string | null = null;
  const recherche = q?.trim().slice(0, 120) ?? "";
  if (!migrationManquante && restaurant.google_place_id && reste > 0) {
    try {
      const centre = await positionDe(restaurant.google_place_id);
      if (centre) {
        const exclus = new Set([
          restaurant.google_place_id,
          ...suivis.map((s) => s.cle),
        ]);
        propositions = await candidats(
          centre,
          recherche ||
            (restaurant.type_cuisine
              ? `restaurant ${restaurant.type_cuisine}`
              : "restaurant"),
          exclus,
          recherche ? 5000 : 1500,
        );
      }
    } catch (cause) {
      console.error("[voisins/propositions]", cause);
      erreurGoogle =
        "Google ne répond pas pour le moment. Réessaie dans quelques minutes.";
    }
  }

  const gagnants = suivis
    .filter((l) => l.gain != null)
    .sort((a, b) => (b.gain ?? 0) - (a.gain ?? 0));
  const partiel = lignes.some((l) => l.gainPartiel);

  const rangTexte = comparaison?.rang
    ? `${comparaison.rang}${comparaison.rang === 1 ? "re" : "e"}`
    : "—";
  const notees = lignes.filter((l) => l.note != null).length;
  const maxGain = Math.max(1, ...lignes.map((l) => l.gain ?? 0));
  const moyenneGain = comparaison?.moyenneGain ?? null;
  const nousGain = nous?.gain ?? null;

  // Une phrase, pas un tableau de bord de plus : ce que les chiffres
  // disent, dans l'ordre où le restaurateur se le demande.
  const constat =
    nousGain != null && moyenneGain != null
      ? nousGain > moyenneGain
        ? `Tu gagnes des avis plus vite que tes voisins : ${gain(nousGain)} en 30 jours, contre +${moyenne(moyenneGain, 0)} en moyenne.`
        : nousGain < moyenneGain
          ? `Tes voisins gagnent des avis plus vite que toi : +${moyenne(moyenneGain, 0)} en moyenne en 30 jours, contre ${gain(nousGain)} pour toi.`
          : `Tu gagnes des avis au même rythme que tes voisins : ${gain(nousGain)} en 30 jours.`
      : "Le rythme des avis s'affichera après deux relevés, le lundi matin.";
  const enRetard =
    nousGain != null && moyenneGain != null && nousGain < moyenneGain;

  const propositionsForm = propositions.length > 0 && (
    <form action={suivreVoisins} className="flex flex-col gap-3">
      <input type="hidden" name="restaurant_id" value={id} />
      <ul
        className={`grid gap-2 ${suivis.length === 0 ? "md:grid-cols-2" : ""}`}
      >
        {propositions.map((p, rang) => (
          <li key={p.id} className="min-w-0">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition-colors has-[:checked]:border-brand-navy has-[:checked]:bg-zinc-50">
              <input
                type="checkbox"
                name="candidat"
                defaultChecked={suivis.length === 0 && rang < reste}
                value={JSON.stringify({
                  id: p.id,
                  nom: p.nom,
                  adresse: p.adresse,
                  distance: p.distance,
                  note: p.note,
                  avis: p.nombreAvis,
                })}
                className="h-4 w-4 shrink-0 accent-brand-navy"
              />
              <Pastille nom={p.nom} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-ink">
                  {p.nom}
                </span>
                <span className="truncate text-xs text-zinc-500">
                  {p.distance != null && `${distanceLisible(p.distance)} · `}★{" "}
                  {note(p.note)} · {p.nombreAvis?.toLocaleString("fr-FR") ?? 0}{" "}
                  avis
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="submit"
        className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
      >
        Suivre la sélection
      </button>
      <p className="text-xs text-zinc-500">
        {reste} place{reste > 1 ? "s" : ""} sur {VOISINS_MAX} : au-delà, les
        suivants sont ignorés.
      </p>
    </form>
  );

  const recherchePanneau = (
    <form
      action={`/dashboard/${id}/voisins`}
      className="flex flex-wrap items-end gap-2"
    >
      <label className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">
          Chercher par son nom
        </span>
        <input
          name="q"
          defaultValue={recherche}
          placeholder="Le Bistrot d'à côté"
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
      >
        Chercher
      </button>
      {recherche && (
        <Link
          href={`/dashboard/${id}/voisins`}
          className="w-full text-xs text-zinc-500 hover:text-ink"
        >
          ← Revenir aux propositions
        </Link>
      )}
    </form>
  );

  const ajout = !migrationManquante && restaurant.google_place_id && (
    <div className="flex flex-col gap-4">
      {reste > 0 ? (
        <>
          <p className="text-sm text-zinc-600">
            {recherche
              ? `Résultats pour « ${recherche} », du plus proche au plus loin.`
              : "Les restaurants les plus proches qui te ressemblent. Coche ceux qui te prennent vraiment des clients."}
          </p>
          {recherchePanneau}
          {erreurGoogle && (
            <p className="text-sm text-red-600">{erreurGoogle}</p>
          )}
          {propositionsForm ||
            (!erreurGoogle && (
              <p className="text-sm text-zinc-500">
                Aucun restaurant trouvé. Essaie avec un autre nom.
              </p>
            ))}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-zinc-600">
          Tu suis {VOISINS_MAX} voisins, le maximum. Retire-en un avec la croix
          pour en suivre un autre.
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.voisins}
          title={`Tes voisins — ${restaurant.nom}`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          Jusqu&apos;à cinq restaurants autour de toi, relevés chaque lundi sur
          Google. Une note bouge peu ; le rythme des avis, beaucoup — c&apos;est
          lui qui dit qui avance.
        </p>
      </div>

      {migrationManquante && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          <strong>Migration à passer :</strong>{" "}
          supabase/migrations/0086_voisins.sql n&apos;est pas encore en place.
        </p>
      )}

      {!migrationManquante && !restaurant.google_place_id && (
        <p className="max-w-4xl rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-4 text-sm text-ink">
          Klarr doit d&apos;abord connaître ta fiche Google pour savoir où tu
          es.{" "}
          <Link
            href={`/dashboard/${id}/google`}
            className="font-semibold underline"
          >
            Ouvrir la page Fiche Google
          </Link>
        </p>
      )}

      {suivis.length === 0 ? (
        !migrationManquante &&
        restaurant.google_place_id && (
          <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:p-8">
            <span className="font-serif text-3xl text-ink">
              Choisis tes voisins
            </span>
            {ajout}
          </section>
        )
      ) : (
        <>
          {/* ── Où tu en es ─────────────────────────────────────────── */}
          <section className="grid gap-6 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex flex-col gap-3">
              <span className="flex items-baseline gap-3">
                <span className="font-serif text-6xl leading-none text-ink">
                  {rangTexte}
                </span>
                <span className="text-sm text-zinc-600">
                  à la note, sur {notees} dans ton quartier
                </span>
              </span>
              <p
                className={`max-w-xl text-base leading-relaxed ${enRetard ? "text-ink" : "text-zinc-700"}`}
              >
                {constat}
              </p>
              {enRetard && (
                <Link
                  href={`/dashboard/${id}/apres-visite`}
                  className="w-fit text-sm font-semibold text-brand-orange-dark hover:underline"
                >
                  La demande d&apos;avis du lendemain est faite pour ça →
                </Link>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:min-w-[22rem]">
              <div className="flex flex-col gap-1 rounded-xl bg-zinc-50 px-4 py-3">
                <dt className="text-xs text-zinc-500">Ta note</dt>
                <dd className="font-serif text-3xl leading-none text-ink">
                  {note(nous?.note ?? null)}
                </dd>
                <dd className="text-xs text-zinc-500">
                  voisins : {moyenne(comparaison?.moyenneNote ?? null, 1)}
                </dd>
              </div>
              <div className="flex flex-col gap-1 rounded-xl bg-zinc-50 px-4 py-3">
                <dt className="text-xs text-zinc-500">Avis en 30 jours</dt>
                <dd className="font-serif text-3xl leading-none text-ink">
                  {gain(nousGain)}
                </dd>
                <dd className="text-xs text-zinc-500">
                  voisins :{" "}
                  {moyenneGain != null ? `+${moyenne(moyenneGain, 0)}` : "—"}
                </dd>
              </div>
            </dl>
          </section>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            {/* ── Le classement ─────────────────────────────────────── */}
            <section className="flex min-w-0 flex-col gap-3">
              <TitreSection
                aside={
                  gagnants[0] ? `le plus actif : ${gagnants[0].nom}` : undefined
                }
              >
                Le classement
              </TitreSection>
              <ul className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
                {lignes.map((ligne: Ligne, rang) => (
                  <li
                    key={ligne.cle}
                    className={`grid grid-cols-[1.5rem_auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-4 sm:grid-cols-[1.5rem_auto_minmax(0,1fr)_4.5rem_minmax(7rem,11rem)_2rem] sm:px-5 ${
                      rang > 0 ? "border-t border-zinc-100" : ""
                    } ${ligne.nous ? "bg-brand-orange-soft/50" : ""}`}
                  >
                    <span className="text-center font-serif text-xl text-zinc-400">
                      {rang + 1}
                    </span>
                    <Pastille nom={ligne.nom} nous={ligne.nous} />
                    <span className="flex min-w-0 flex-col">
                      <span className="flex items-baseline gap-2">
                        <span
                          className={`truncate ${ligne.nous ? "font-bold" : "font-semibold"} text-ink`}
                        >
                          {ligne.nom}
                        </span>
                        {ligne.nous && (
                          <span className="shrink-0 text-xs font-semibold text-brand-orange-dark">
                            toi
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {ligne.distance != null
                          ? `à ${distanceLisible(ligne.distance)} · `
                          : ""}
                        {ligne.avis?.toLocaleString("fr-FR") ?? "—"} avis
                      </span>
                    </span>
                    <span className="text-right text-lg font-semibold tabular-nums text-ink sm:text-left">
                      <span
                        aria-hidden="true"
                        className="mr-1 text-sm text-brand-orange"
                      >
                        ★
                      </span>
                      {note(ligne.note)}
                    </span>
                    {/* Le rythme : une barre par maison, à la même échelle.
                        La tienne en orange, les autres en bleu nuit. */}
                    <span className="col-span-2 col-start-3 flex items-center gap-2 sm:col-span-1 sm:col-start-auto">
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <span
                          className={`block h-full rounded-full ${ligne.nous ? "bg-brand-orange" : "bg-brand-navy/70"}`}
                          style={{
                            width:
                              ligne.gain != null && ligne.gain > 0
                                ? `${Math.max(4, (ligne.gain / maxGain) * 100)}%`
                                : "0%",
                          }}
                        />
                      </span>
                      <span className="w-10 text-right text-sm font-semibold tabular-nums text-ink">
                        {gain(ligne.gain)}
                        {ligne.gainPartiel && "*"}
                      </span>
                    </span>
                    <span className="hidden sm:block">
                      {!ligne.nous && (
                        <form action={retirerVoisin}>
                          <input
                            type="hidden"
                            name="restaurant_id"
                            value={id}
                          />
                          <input
                            type="hidden"
                            name="place_id"
                            value={ligne.cle}
                          />
                          <button
                            type="submit"
                            aria-label={`Ne plus suivre ${ligne.nom}`}
                            title="Ne plus suivre"
                            className="rounded-md px-2 py-1 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-red-600"
                          >
                            ×
                          </button>
                        </form>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-zinc-500">
                La barre montre les avis gagnés en 30 jours. Relevé chaque lundi
                matin sur Google.
                {partiel &&
                  " * Suivi depuis moins de 30 jours : le chiffre part du premier relevé."}
                {nous?.note == null &&
                  " Ta propre note arrive avec le relevé hebdomadaire de ta fiche Google."}
              </p>
            </section>

            {/* ── Ajouter ou retirer ───────────────────────────────── */}
            <aside className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm lg:sticky lg:top-6">
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-2xl text-ink">
                  Ajouter un voisin
                </span>
                <span className="text-xs text-zinc-500">
                  {suivis.length}/{VOISINS_MAX}
                </span>
              </span>
              {ajout}
              {/* Sur téléphone, la croix du classement est cachée : on
                  retire ici. */}
              <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 sm:hidden">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  Ne plus suivre
                </span>
                {suivis.map((v) => (
                  <form
                    key={v.cle}
                    action={retirerVoisin}
                    className="flex items-center justify-between gap-3"
                  >
                    <input type="hidden" name="restaurant_id" value={id} />
                    <input type="hidden" name="place_id" value={v.cle} />
                    <span className="truncate text-sm text-ink">{v.nom}</span>
                    <button
                      type="submit"
                      className="shrink-0 text-sm text-zinc-500 hover:text-red-600"
                    >
                      Retirer
                    </button>
                  </form>
                ))}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Les initiales d'un restaurant, dans une pastille. Pas de photo : Google
 * les facture à l'unité, et une initiale suffit à distinguer cinq noms.
 * Les articles et « Chez » ne comptent pas — « Le Bistrot Voltigeur »
 * donne « BV », pas « LB ».
 */
function Pastille({ nom, nous = false }: { nom: string; nous?: boolean }) {
  const mots = nom
    .replace(/['’]/g, " ")
    .split(/\s+/)
    .filter(
      (m) =>
        m &&
        !/^(le|la|les|l|du|de|des|d|chez|au|aux|et|&|restaurant)$/i.test(m),
    );
  const initiales = (mots[0]?.[0] ?? nom[0] ?? "?") + (mots[1]?.[0] ?? "");
  return (
    <span
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold uppercase ${
        nous
          ? "bg-brand-orange text-white"
          : "border border-zinc-200 bg-zinc-50 text-zinc-600"
      }`}
    >
      {initiales}
    </span>
  );
}
