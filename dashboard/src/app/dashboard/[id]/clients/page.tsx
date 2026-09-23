import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur } from "@/components/dashboard/Compteur";
import { campagnesOuvertes } from "@/lib/campagnes/message";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { lireFiches, FICHES_PAR_PAGE, type Tri } from "@/lib/contacts/fiches";
import { NoteContact } from "@/components/contacts/NoteContact";
import type { Restaurant } from "@/types/restaurant";

function dateLisible(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const TRIS: { cle: Tri; libelle: string }[] = [
  { cle: "recents", libelle: "Derniers venus" },
  { cle: "fideles", libelle: "Plus fidèles" },
  { cle: "nom", libelle: "Par nom" },
];

function estTri(valeur: string | undefined): valeur is Tri {
  return TRIS.some((t) => t.cle === valeur);
}

export default async function ClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; tri?: string; page?: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");

  const { q = "", tri, page } = await searchParams;
  const triChoisi: Tri = estTri(tri) ? tri : "recents";
  const pageChoisie = Math.max(0, Number.parseInt(page ?? "0", 10) || 0);

  const supabase = await createClient();
  const [{ data: restaurantData }, lecture] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    lireFiches({
      supabase,
      restaurantId: id,
      recherche: q,
      tri: triChoisi,
      page: pageChoisie,
    }),
  ]);

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) notFound();

  const { fiches, total, joignables, trouves, sansHistorique } = lecture;
  const muets = total - joignables;
  const pages = Math.ceil(trouves / FICHES_PAR_PAGE);
  const lien = (modif: Record<string, string>) => {
    const p = new URLSearchParams({ q, tri: triChoisi, ...modif });
    for (const [cle, valeur] of [...p.entries()]) if (!valeur) p.delete(cle);
    const chaine = p.toString();
    return `/dashboard/${id}/clients${chaine ? `?${chaine}` : ""}`;
  };

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.reservations}
        title={`Fichier client — ${restaurant.nom}`}
        backHref="/dashboard"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-4xl text-sm text-zinc-600">
          Reconstitué à partir du carnet : une personne, quel que soit le nombre
          de fois qu&apos;elle a réservé. Les venues comptent les tables
          honorées, pas les demandes annulées.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {campagnesOuvertes() && joignables > 0 && (
            <Link
              href={`/dashboard/${id}/campagnes`}
              className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
            >
              Écrire à mes clients
            </Link>
          )}
          {total > 0 && (
            <a
              href={`/dashboard/${id}/clients/export`}
              className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
            >
              Exporter en CSV
            </a>
          )}
          <Link
            href={`/dashboard/${id}/import`}
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            Importer depuis TheFork ou Zenchef
          </Link>
        </div>
      </div>

      {/* Le chiffre qui compte n'est pas le total, c'est l'écart. Un
          fichier de huit cents personnes dont vingt acceptent les e-mails
          ne vaut pas huit cents. */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur valeur={total} libelle="clients au fichier" />
        <Compteur
          valeur={joignables}
          libelle="acceptent tes e-mails"
          accent={total > 0 && joignables === 0}
        />
        <Compteur valeur={muets} libelle="n'ont pas coché la case" />
      </div>

      {total > 0 && joignables === 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          <strong>Personne n&apos;a encore accepté tes e-mails.</strong> La case
          est proposée, décochée, sur ta page de réservation — c&apos;est la loi
          : on ne peut pas déduire d&apos;une table réservée l&apos;envie de
          recevoir une newsletter. Elle se remplit avec les prochaines
          réservations.
        </p>
      )}

      {sansHistorique && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          <strong>
            L&apos;historique des venues n&apos;a pas pu être calculé.
          </strong>{" "}
          Voici tes clients tels qu&apos;ils sont enregistrés ; le nombre de
          venues et les dates reviendront dès que le calcul répondra.
        </p>
      )}

      {/* La recherche, le tri et la liste dans une seule carte : c'est un
          seul outil, et il se lit comme tel. */}
      <section className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        <form
          className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-5 py-4"
          action=""
        >
          <input type="hidden" name="tri" value={triChoisi} />
          <label className="relative flex min-w-0 flex-1 basis-72 items-center sm:max-w-md">
            <span className="sr-only">Chercher</span>
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="pointer-events-none absolute left-3 text-zinc-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              name="q"
              defaultValue={q}
              placeholder="Chercher un nom, une adresse"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          >
            Chercher
          </button>
          {q && (
            <Link
              href={lien({ q: "", page: "" })}
              className="text-sm text-zinc-500 underline underline-offset-2"
            >
              Effacer
            </Link>
          )}

          <span className="ml-auto flex items-center gap-1 rounded-full bg-zinc-100 p-1">
            {TRIS.map((t) => (
              <Link
                key={t.cle}
                href={lien({ tri: t.cle, page: "" })}
                aria-current={t.cle === triChoisi ? "true" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  t.cle === triChoisi
                    ? "bg-white text-ink shadow-sm"
                    : "text-zinc-500 hover:text-ink"
                }`}
              >
                {t.libelle}
              </Link>
            ))}
          </span>
        </form>

        {fiches.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-zinc-500">
            {q
              ? `Personne ne correspond à « ${q} ».`
              : total > 0
                ? "La liste n'a pas pu être lue. Recharge la page dans un instant."
                : "Le fichier est vide : il se remplira à la première réservation."}
          </p>
        ) : (
          <>
            {/* Cinq colonnes ne tiennent pas sur un téléphone, et un
                tableau qui défile de côté cache précisément ce qu'on est
                venu voir — le consentement — sans rien laisser paraître.
                En dessous de `md`, elles se replient donc sous le nom. */}
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-zinc-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  <th className="border-b border-zinc-100 px-5 py-3">Client</th>
                  <th className="hidden border-b border-zinc-100 px-4 py-3 md:table-cell">
                    Venues
                  </th>
                  <th className="hidden border-b border-zinc-100 px-4 py-3 md:table-cell">
                    Dernière venue
                  </th>
                  <th className="hidden border-b border-zinc-100 px-4 py-3 md:table-cell">
                    E-mails
                  </th>
                  <th className="hidden w-[32%] border-b border-zinc-100 px-5 py-3 md:table-cell">
                    Note interne
                  </th>
                </tr>
              </thead>
              <tbody>
                {fiches.map((fiche) => (
                  <tr
                    key={fiche.id}
                    className="align-middle transition-colors hover:bg-brand-cream/60"
                  >
                    <td className="border-b border-zinc-100 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Initiale fiche={fiche} />
                        <div className="flex min-w-0 flex-col">
                          {/* Sans nom, l'adresse devient le nom : un tiret
                              en tête de ligne ne désigne personne. */}
                          <span className="truncate font-semibold text-ink">
                            {fiche.nom ?? fiche.email}
                          </span>
                          <span className="flex flex-wrap gap-x-3 text-xs text-zinc-500">
                            {fiche.nom && (
                              <a
                                href={`mailto:${fiche.email}`}
                                className="truncate hover:text-brand-navy hover:underline"
                              >
                                {fiche.email}
                              </a>
                            )}
                            {fiche.telephone && (
                              <a
                                href={`tel:${fiche.telephone}`}
                                className="hover:text-brand-navy hover:underline"
                              >
                                {fiche.telephone}
                              </a>
                            )}
                            {!fiche.nom && !fiche.telephone && (
                              <a
                                href={`mailto:${fiche.email}`}
                                className="hover:text-brand-navy hover:underline"
                              >
                                Écrire
                              </a>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col gap-2 md:hidden">
                        <span className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <Venues fiche={fiche} />
                          {fiche.derniere_venue && (
                            <span>· {dateLisible(fiche.derniere_venue)}</span>
                          )}
                          <Consentement fiche={fiche} />
                        </span>
                        <NoteContact
                          restaurantId={id}
                          contactId={fiche.id}
                          note={fiche.note_interne}
                        />
                      </div>
                    </td>
                    <td className="hidden border-b border-zinc-100 px-4 py-4 md:table-cell">
                      <Venues fiche={fiche} />
                    </td>
                    <td className="hidden border-b border-zinc-100 px-4 py-4 text-zinc-700 md:table-cell">
                      {fiche.derniere_venue ? (
                        dateLisible(fiche.derniere_venue)
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="hidden border-b border-zinc-100 px-4 py-4 md:table-cell">
                      <Consentement fiche={fiche} />
                    </td>
                    <td className="hidden border-b border-zinc-100 px-5 py-4 md:table-cell">
                      <NoteContact
                        restaurantId={id}
                        contactId={fiche.id}
                        note={fiche.note_interne}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-wrap items-center gap-4 px-5 py-4 text-sm text-zinc-500">
              <span>
                {trouves} fiche{trouves > 1 ? "s" : ""}
                {pages > 1 && ` · page ${pageChoisie + 1} sur ${pages}`}
              </span>
              {pageChoisie > 0 && (
                <Link
                  href={lien({ page: String(pageChoisie - 1) })}
                  className="font-medium text-ink hover:underline"
                >
                  ← Précédentes
                </Link>
              )}
              {pageChoisie + 1 < pages && (
                <Link
                  href={lien({ page: String(pageChoisie + 1) })}
                  className="font-medium text-ink hover:underline"
                >
                  Suivantes →
                </Link>
              )}
              {/* L'export emporte tout le fichier, pas la page affichée :
                  c'est ce qu'on attend d'un export, et le contraire
                  surprendrait au pire moment. */}
              <a
                href={`/dashboard/${id}/clients/export`}
                className="ml-auto inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
              >
                <svg
                  aria-hidden="true"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16" />
                </svg>
                Exporter en CSV
              </a>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/** La première lettre du nom, ou de l'adresse faute de nom. */
function Initiale({ fiche }: { fiche: { nom: string | null; email: string } }) {
  const lettre = (fiche.nom ?? fiche.email).trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange-soft font-serif text-lg text-brand-orange-dark"
    >
      {lettre || "?"}
    </span>
  );
}

/**
 * « Pas encore venu » plutôt que « 0 » : un zéro seul se lit comme une
 * donnée manquante, alors que c'est un fait — la personne a réservé, sa
 * table n'est pas encore passée.
 */
function Venues({ fiche }: { fiche: { venues: number; couverts: number } }) {
  if (fiche.venues === 0) {
    return <span className="text-zinc-400">Pas encore venu</span>;
  }
  return (
    <span className="text-zinc-700">
      <span className="font-semibold text-ink">{fiche.venues}</span> venue
      {fiche.venues > 1 ? "s" : ""}
      {fiche.couverts > 0 && (
        <span className="text-xs text-zinc-500"> · {fiche.couverts} couv.</span>
      )}
    </span>
  );
}

function Consentement({
  fiche,
}: {
  fiche: {
    consentement: boolean;
    consentement_le: string | null;
    desabonne_le: string | null;
  };
}) {
  if (fiche.desabonne_le) {
    return (
      <span className="inline-flex flex-col gap-0.5">
        <span className="w-fit rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          Désinscrit
        </span>
        <span className="text-[11px] text-zinc-400">
          le {dateLisible(fiche.desabonne_le.slice(0, 10))}
        </span>
      </span>
    );
  }
  if (!fiche.consentement) {
    return (
      <span className="w-fit rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-500">
        Non
      </span>
    );
  }
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        Accepte
      </span>
      {fiche.consentement_le && (
        <span className="text-[11px] text-zinc-400">
          depuis le {dateLisible(fiche.consentement_le.slice(0, 10))}
        </span>
      )}
    </span>
  );
}
