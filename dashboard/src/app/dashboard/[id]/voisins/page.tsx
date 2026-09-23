import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
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

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.voisins}
          title={`Tes voisins — ${restaurant.nom}`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          Jusqu&apos;à cinq restaurants autour de toi, relevés chaque lundi sur
          Google : leur note, leur nombre d&apos;avis, et combien ils en
          gagnent. C&apos;est ce dernier chiffre qui dit qui avance — une note
          bouge peu, le rythme des avis beaucoup.
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

      {suivis.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Compteur
              valeur={
                comparaison?.rang
                  ? `${comparaison.rang}${comparaison.rang === 1 ? "re" : "e"}`
                  : "—"
              }
              libelle={`à la note, sur ${lignes.filter((l) => l.note != null).length}`}
              accent={comparaison?.rang === 1}
            />
            <Compteur
              valeur={`${note(nous?.note ?? null)} / ${moyenne(comparaison?.moyenneNote ?? null, 1)}`}
              libelle="ta note / celle de tes voisins"
            />
            <Compteur
              valeur={gain(nous?.gain ?? null)}
              libelle="avis gagnés en 30 jours"
            />
            <Compteur
              valeur={
                comparaison?.moyenneGain != null
                  ? `+${moyenne(comparaison.moyenneGain, 0)}`
                  : "—"
              }
              libelle="en moyenne chez tes voisins"
            />
          </div>

          <section className="flex flex-col gap-4">
            <TitreSection
              aside={
                gagnants[0] ? `le plus actif : ${gagnants[0].nom}` : undefined
              }
            >
              Le classement
            </TitreSection>
            <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-[0.08em] text-zinc-500">
                    <th className="px-4 py-3 font-semibold sm:px-5">
                      Restaurant
                    </th>
                    <th className="px-3 py-3 text-right font-semibold">Note</th>
                    <th className="hidden px-3 py-3 text-right font-semibold sm:table-cell">
                      Avis
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      En 30 jours
                    </th>
                    <th className="w-10 px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne: Ligne, rang) => (
                    <tr
                      key={ligne.cle}
                      className={`border-b border-zinc-100 last:border-0 ${
                        ligne.nous ? "bg-brand-orange-soft/60" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <span className="flex items-baseline gap-3">
                          <span className="w-4 shrink-0 text-xs text-zinc-400">
                            {rang + 1}
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span
                              className={`truncate ${ligne.nous ? "font-bold text-ink" : "font-semibold text-ink"}`}
                            >
                              {ligne.nom}
                              {ligne.nous && (
                                <span className="ml-2 text-xs font-medium text-brand-orange-dark">
                                  toi
                                </span>
                              )}
                            </span>
                            {ligne.distance != null && (
                              <span className="text-xs text-zinc-500">
                                à {distanceLisible(ligne.distance)}
                              </span>
                            )}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right font-semibold tabular-nums text-ink">
                        {note(ligne.note)}
                      </td>
                      <td className="hidden px-3 py-3.5 text-right tabular-nums text-zinc-700 sm:table-cell">
                        {ligne.avis?.toLocaleString("fr-FR") ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        <span
                          className={
                            ligne.gain != null && ligne.gain > 0
                              ? "font-semibold text-emerald-700"
                              : "text-zinc-500"
                          }
                        >
                          {gain(ligne.gain)}
                          {ligne.gainPartiel && "*"}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right">
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
                              className="rounded-md px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-600"
                            >
                              ×
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="max-w-3xl text-xs text-zinc-500">
              Relevé chaque lundi matin sur Google.
              {partiel &&
                " * Suivi depuis moins de 30 jours : le chiffre part du premier relevé."}
              {nous?.note == null &&
                " Ta propre note arrive avec le relevé de ta fiche Google, chaque semaine."}
            </p>
          </section>
        </>
      )}

      {!migrationManquante && restaurant.google_place_id && reste > 0 && (
        <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <TitreSection
            aside={`${reste} place${reste > 1 ? "s" : ""} sur ${VOISINS_MAX}`}
          >
            {suivis.length === 0 ? "Choisis tes voisins" : "Ajouter un voisin"}
          </TitreSection>
          <p className="max-w-3xl text-sm text-zinc-600">
            {recherche
              ? `Résultats pour « ${recherche} », du plus proche au plus loin.`
              : "Les restaurants les plus proches qui te ressemblent. Coche ceux qui te prennent vraiment des clients — c'est toi qui sais."}
          </p>

          <form
            action={`/dashboard/${id}/voisins`}
            className="flex flex-wrap items-end gap-3"
          >
            <label className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-md">
              <span className="text-sm font-medium text-ink">
                Chercher un restaurant par son nom
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
              className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
            >
              Chercher
            </button>
            {recherche && (
              <Link
                href={`/dashboard/${id}/voisins`}
                className="py-2.5 text-sm text-zinc-500 hover:text-ink"
              >
                Revenir aux propositions
              </Link>
            )}
          </form>

          {erreurGoogle && (
            <p className="text-sm text-red-600">{erreurGoogle}</p>
          )}

          {propositions.length > 0 ? (
            <form action={suivreVoisins} className="flex flex-col gap-4">
              <input type="hidden" name="restaurant_id" value={id} />
              <ul className="grid gap-2 md:grid-cols-2">
                {propositions.map((p, rang) => (
                  <li key={p.id} className="min-w-0">
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-3.5 transition-colors has-[:checked]:border-brand-navy has-[:checked]:bg-zinc-50">
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
                        className="mt-1 h-4 w-4 shrink-0 accent-brand-navy"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate font-semibold text-ink">
                            {p.nom}
                          </span>
                          <span className="shrink-0 text-sm tabular-nums text-ink">
                            {note(p.note)}{" "}
                            <span className="text-xs text-zinc-500">
                              · {p.nombreAvis?.toLocaleString("fr-FR") ?? 0}{" "}
                              avis
                            </span>
                          </span>
                        </span>
                        <span className="truncate text-xs text-zinc-500">
                          {p.distance != null &&
                            `à ${distanceLisible(p.distance)} · `}
                          {p.adresse}
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
                Au-delà de {VOISINS_MAX}, les suivants sont ignorés : retire un
                voisin pour en suivre un autre.
              </p>
            </form>
          ) : (
            !erreurGoogle && (
              <p className="text-sm text-zinc-500">
                Aucun restaurant trouvé. Essaie avec un autre nom.
              </p>
            )
          )}
        </section>
      )}
    </div>
  );
}
