import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
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

  const { fiches, total, joignables, trouves } = lecture;
  const muets = total - joignables;
  const pages = Math.ceil(trouves / FICHES_PAR_PAGE);
  const lien = (modif: Record<string, string>) => {
    const p = new URLSearchParams({ q, tri: triChoisi, ...modif });
    for (const [cle, valeur] of [...p.entries()]) if (!valeur) p.delete(cle);
    const chaine = p.toString();
    return `/dashboard/${id}/clients${chaine ? `?${chaine}` : ""}`;
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.reservations}
        title={`Fichier client — ${restaurant.nom}`}
        backHref={`/dashboard/${id}`}
      />

      <p className="max-w-2xl text-sm text-zinc-600">
        Reconstitué à partir du carnet : une personne, quelle que soit le nombre
        de fois qu&apos;elle a réservé. Les venues comptent les tables honorées,
        pas les demandes annulées.
      </p>

      {/* Le chiffre qui compte n'est pas le total, c'est l'écart. Un
          fichier de huit cents personnes dont vingt acceptent les e-mails
          ne vaut pas huit cents. */}
      <div className="flex flex-wrap gap-3">
        <Compteur valeur={total} libelle="clients au fichier" />
        <Compteur
          valeur={joignables}
          libelle="acceptent vos e-mails"
          accent={joignables > 0}
        />
        <Compteur valeur={muets} libelle="n'ont pas coché la case" />
      </div>

      {total > 0 && joignables === 0 && (
        <p className="max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          <strong>Personne n&apos;a encore accepté vos e-mails.</strong> La case
          est proposée, décochée, sur votre page de réservation — c&apos;est la
          loi : on ne peut pas déduire d&apos;une table réservée l&apos;envie de
          recevoir une newsletter. Elle se remplit avec les prochaines
          réservations.
        </p>
      )}

      <form className="flex flex-wrap items-end gap-3" action="">
        <input type="hidden" name="tri" value={triChoisi} />
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Chercher
          <input
            name="q"
            defaultValue={q}
            placeholder="Un nom, une adresse"
            className="min-w-64 rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-navy"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
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

        <span className="ml-auto flex items-center gap-2 text-sm text-zinc-500">
          {TRIS.map((t) => (
            <Link
              key={t.cle}
              href={lien({ tri: t.cle, page: "" })}
              aria-current={t.cle === triChoisi ? "true" : undefined}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                t.cle === triChoisi
                  ? "bg-brand-navy text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {t.libelle}
            </Link>
          ))}
        </span>
      </form>

      {fiches.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {q
            ? `Personne ne correspond à « ${q} ».`
            : "Le fichier est vide : il se remplira à la première réservation."}
        </p>
      ) : (
        <>
          {/* Quatre colonnes ne tiennent pas sur un téléphone, et un
              tableau qui défile de côté cache précisément ce qu'on est
              venu voir — le consentement — sans rien laisser paraître.
              En dessous de `sm`, elles se replient donc sous le nom. */}
          <div>
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="border-b border-zinc-200 py-2 pr-4">Client</th>
                  <th className="hidden border-b border-zinc-200 py-2 pr-4 sm:table-cell">
                    Venues
                  </th>
                  <th className="hidden border-b border-zinc-200 py-2 pr-4 sm:table-cell">
                    Dernière
                  </th>
                  <th className="hidden border-b border-zinc-200 py-2 pr-4 sm:table-cell">
                    E-mails
                  </th>
                  <th className="hidden border-b border-zinc-200 py-2 sm:table-cell">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {fiches.map((fiche) => (
                  <tr key={fiche.id} className="align-top">
                    <td className="border-b border-zinc-100 py-3 pr-4">
                      <span className="font-medium text-zinc-800">
                        {fiche.nom ?? "—"}
                      </span>
                      <br />
                      <a
                        href={`mailto:${fiche.email}`}
                        className="text-xs text-zinc-500 underline underline-offset-2"
                      >
                        {fiche.email}
                      </a>
                      {fiche.telephone && (
                        <>
                          <br />
                          <a
                            href={`tel:${fiche.telephone}`}
                            className="text-xs text-zinc-500"
                          >
                            {fiche.telephone}
                          </a>
                        </>
                      )}
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 sm:hidden">
                        <span>
                          {fiche.venues} venue{fiche.venues > 1 ? "s" : ""}
                        </span>
                        {fiche.derniere_venue && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{dateLisible(fiche.derniere_venue)}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <Consentement fiche={fiche} />
                      </span>
                      <span className="mt-2 flex sm:hidden">
                        <NoteContact
                          restaurantId={id}
                          contactId={fiche.id}
                          note={fiche.note_interne}
                        />
                      </span>
                    </td>
                    <td className="hidden border-b border-zinc-100 py-3 pr-4 text-zinc-700 sm:table-cell">
                      {fiche.venues}
                      {fiche.couverts > 0 && (
                        <span className="text-xs text-zinc-500">
                          {" "}
                          · {fiche.couverts} couv.
                        </span>
                      )}
                    </td>
                    <td className="hidden border-b border-zinc-100 py-3 pr-4 text-zinc-700 sm:table-cell">
                      {dateLisible(fiche.derniere_venue)}
                    </td>
                    <td className="hidden border-b border-zinc-100 py-3 pr-4 sm:table-cell">
                      <Consentement fiche={fiche} />
                    </td>
                    <td className="hidden border-b border-zinc-100 py-3 sm:table-cell">
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
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <span>
              {trouves} fiche{trouves > 1 ? "s" : ""}
              {pages > 1 && ` · page ${pageChoisie + 1} sur ${pages}`}
            </span>
            {pageChoisie > 0 && (
              <Link
                href={lien({ page: String(pageChoisie - 1) })}
                className="underline underline-offset-2"
              >
                ← Précédentes
              </Link>
            )}
            {pageChoisie + 1 < pages && (
              <Link
                href={lien({ page: String(pageChoisie + 1) })}
                className="underline underline-offset-2"
              >
                Suivantes →
              </Link>
            )}
            {/* L'export emporte tout le fichier, pas la page affichée :
                c'est ce qu'on attend d'un export, et le contraire
                surprendrait au pire moment. */}
            <a
              href={`/dashboard/${id}/clients/export`}
              className="ml-auto underline underline-offset-2"
            >
              Exporter en CSV
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function Compteur({
  valeur,
  libelle,
  accent = false,
}: {
  valeur: number;
  libelle: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex min-w-40 flex-col gap-0.5 rounded-xl border px-4 py-3 ${
        accent
          ? "border-brand-orange bg-brand-orange-soft"
          : "border-zinc-200 bg-white"
      }`}
    >
      <span className="font-serif text-2xl text-ink">{valeur}</span>
      <span className="text-xs text-zinc-600">{libelle}</span>
    </div>
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
      <span className="text-xs text-zinc-500">
        Désinscrit le {dateLisible(fiche.desabonne_le.slice(0, 10))}
      </span>
    );
  }
  if (!fiche.consentement) {
    return <span className="text-xs text-zinc-400">Non</span>;
  }
  return (
    <span className="text-xs font-medium text-emerald-700">
      Oui
      {fiche.consentement_le && (
        <span className="font-normal text-zinc-500">
          {" "}
          · {dateLisible(fiche.consentement_le.slice(0, 10))}
        </span>
      )}
    </span>
  );
}
