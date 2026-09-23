import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { enregistrerSuivi, offrirAcces } from "./actions";
import {
  LIBELLE_STATUT,
  parCible,
  STATUTS,
  TEINTE_STATUT,
  type Suivi,
} from "@/lib/suivi";
import { calculerAcces, essaiLePlusLong } from "@/lib/abonnement/modules";

export const metadata: Metadata = {
  title: "Administration — Klarr",
  robots: { index: false, follow: false },
};

type Prospect = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  entreprise: string;
  ville: string | null;
  created_at: string;
};

type Audit = {
  id: string;
  restaurant_name: string;
  ville: string;
  global_score: number | null;
  created_at: string;
};

type RestaurantRow = {
  id: string;
  nom: string;
  proprietaire_id: string;
  adresse: string | null;
  created_at: string;
  acces_offert_jusqu_au: string | null;
};

type SubscriptionRow = {
  restaurant_id: string;
  module?: string;
  status: string;
  current_period_end: string | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <span className="text-2xl font-semibold text-brand-navy">{value}</span>
      <span className="text-sm text-zinc-500">{label}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        {children}
      </div>
    </section>
  );
}

/**
 * Le suivi d'un contact : ce qu'on en a fait, et la ligne suivante.
 *
 * Un journal plutôt qu'un état : « il rappelle après le service » vaut
 * plus que « à relancer », et l'état se lit dans la dernière ligne. Le
 * formulaire est en bas, jamais en haut — on lit avant d'écrire.
 */
function Suivre({
  cibleType,
  cibleId,
  lignes,
}: {
  cibleType: "prospect" | "restaurant";
  cibleId: string;
  lignes: Suivi[];
}) {
  const derniere = lignes[0];

  return (
    <div className="flex min-w-[260px] flex-col gap-2">
      {derniere ? (
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${TEINTE_STATUT[derniere.statut]}`}
            >
              {LIBELLE_STATUT[derniere.statut]}
            </span>
            <span className="text-xs text-zinc-400">
              {formatDate(derniere.created_at)}
            </span>
          </span>
          {derniere.note && (
            <span className="text-xs text-zinc-600">{derniere.note}</span>
          )}
        </div>
      ) : (
        <span className="text-xs text-zinc-400">Jamais contacté.</span>
      )}

      {lignes.length > 1 && (
        <details className="text-xs text-zinc-500">
          <summary className="cursor-pointer text-zinc-400">
            {lignes.length - 1} ligne(s) avant
          </summary>
          <ul className="mt-1 flex flex-col gap-1">
            {lignes.slice(1).map((ligne) => (
              <li key={ligne.created_at}>
                <span className="text-zinc-400">
                  {formatDate(ligne.created_at)} —{" "}
                </span>
                {LIBELLE_STATUT[ligne.statut]}
                {ligne.note ? ` : ${ligne.note}` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}

      <form action={enregistrerSuivi} className="flex flex-col gap-1">
        <input type="hidden" name="cible_type" value={cibleType} />
        <input type="hidden" name="cible_id" value={cibleId} />
        <div className="flex items-center gap-1">
          <select
            name="statut"
            defaultValue={derniere?.statut ?? "a_rappeler"}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-brand-navy"
          >
            {STATUTS.map((statut) => (
              <option key={statut} value={statut}>
                {LIBELLE_STATUT[statut]}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="note"
            placeholder="Ce qu'il a dit"
            className="min-w-0 flex-1 rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-brand-navy"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
          >
            Noter
          </button>
        </div>
      </form>
    </div>
  );
}

export default async function AdminPage() {
  const email = await requireAdmin("/admin");

  // Le contrôle d'accès ci-dessus est la seule barrière : ce client
  // contourne toutes les règles de sécurité de la base.
  const supabase = createServiceClient();

  const [prospects, audits, restaurants, subscriptions, users, suivis] =
    await Promise.all([
      supabase
        .from("prospects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("visibility_audits")
        .select("id, restaurant_name, ville, global_score, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("restaurants")
        .select(
          "id, nom, adresse, proprietaire_id, created_at, acces_offert_jusqu_au",
        )
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("restaurant_subscriptions")
        .select("restaurant_id, module, status, current_period_end"),
      supabase.auth.admin.listUsers({ page: 1, perPage: 200 }),
      // Du plus récent au plus ancien : la première ligne d'une cible est
      // son état courant, sans requête de plus.
      supabase
        .from("suivis")
        .select("cible_type, cible_id, statut, note, auteur, created_at")
        .order("created_at", { ascending: false }),
    ]);

  const prospectRows = (prospects.data ?? []) as Prospect[];
  const auditRows = (audits.data ?? []) as Audit[];
  const restaurantRows = (restaurants.data ?? []) as RestaurantRow[];
  const subscriptionRows = (subscriptions.data ?? []) as SubscriptionRow[];
  const journal = parCible((suivis.data ?? []) as Suivi[]);

  // listUsers ne renvoie "total" que sur la variante paginée de sa réponse.
  const totalUsers =
    users.data && "total" in users.data ? users.data.total : "—";

  // Le propriétaire d'un restaurant vit dans auth.users, jamais dans la
  // table : sans cette jointure faite à la main, la liste ci-dessous est
  // une liste de noms qu'on ne peut pas rappeler.
  const comptes = new Map(
    (users.data?.users ?? []).map((compte) => [
      compte.id,
      {
        email: compte.email ?? null,
        telephone: compte.phone || null,
        derniereVisite: compte.last_sign_in_at ?? null,
      },
    ]),
  );

  const activeSubscriptions = subscriptionRows.filter(
    (s) => s.status === "active" || s.status === "trialing",
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200/70 bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
        <Link href="/dashboard" className="flex items-center gap-2">
          <KlarrMark size={22} />
          <KlarrWordmark className="text-lg text-zinc-900" />
          <span className="ml-2 rounded-full bg-brand-orange-soft px-2.5 py-0.5 text-xs font-semibold text-brand-navy">
            admin
          </span>
        </Link>
        <span className="text-sm text-zinc-500">{email}</span>
      </header>

      <main className="flex flex-1 flex-col gap-8 px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Prospects" value={prospectRows.length} />
          <Stat label="Audits lancés" value={auditRows.length} />
          <Stat label="Comptes créés" value={totalUsers} />
          <Stat label="Restaurants" value={restaurantRows.length} />
          <Stat label="Abonnements actifs" value={activeSubscriptions} />
        </div>

        <Section title="Prospects (test de présence Google)">
          {prospectRows.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">
              Aucun prospect pour le moment.
            </p>
          ) : (
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3 font-semibold">Nom</th>
                  <th className="px-5 py-3 font-semibold">Établissement</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Suivi</th>
                </tr>
              </thead>
              <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-zinc-100 [&_tr:last-child]:border-0">
                {prospectRows.map((prospect) => (
                  <tr key={prospect.id}>
                    <td className="font-medium text-zinc-900">
                      {prospect.prenom} {prospect.nom}
                    </td>
                    <td className="text-zinc-600">
                      {prospect.entreprise}
                      {prospect.ville ? ` — ${prospect.ville}` : ""}
                    </td>
                    <td className="text-zinc-600">
                      <a
                        href={`mailto:${prospect.email}`}
                        className="text-brand-orange hover:underline"
                      >
                        {prospect.email}
                      </a>
                      <br />
                      {prospect.telephone}
                    </td>
                    <td className="whitespace-nowrap text-zinc-500">
                      {formatDate(prospect.created_at)}
                    </td>
                    <td>
                      <Suivre
                        cibleType="prospect"
                        cibleId={prospect.id}
                        lignes={journal.get(`prospect:${prospect.id}`) ?? []}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title="Derniers audits">
          {auditRows.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">Aucun audit.</p>
          ) : (
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3 font-semibold">Établissement</th>
                  <th className="px-5 py-3 font-semibold">Ville</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-zinc-100 [&_tr:last-child]:border-0">
                {auditRows.map((audit) => (
                  <tr key={audit.id}>
                    <td className="font-medium text-zinc-900">
                      {audit.restaurant_name}
                    </td>
                    <td className="text-zinc-600">{audit.ville}</td>
                    <td className="text-zinc-600">
                      {audit.global_score ?? "—"}
                    </td>
                    <td className="whitespace-nowrap text-zinc-500">
                      {formatDate(audit.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title="Restaurants inscrits">
          {restaurantRows.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">Aucun restaurant.</p>
          ) : (
            <table className="w-full min-w-[1140px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3 font-semibold">Nom</th>
                  <th className="px-5 py-3 font-semibold">Adresse</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Abonnement</th>
                  <th className="px-5 py-3 font-semibold">Accès</th>
                  <th className="px-5 py-3 font-semibold">
                    Offert jusqu&apos;au
                  </th>
                  <th className="px-5 py-3 font-semibold">Créé le</th>
                  <th className="px-5 py-3 font-semibold">Suivi</th>
                </tr>
              </thead>
              <tbody className="[&_td]:px-5 [&_td]:py-3 [&_tr]:border-b [&_tr]:border-zinc-100 [&_tr:last-child]:border-0">
                {restaurantRows.map((restaurant) => {
                  const subscription = subscriptionRows.find(
                    (s) => s.restaurant_id === restaurant.id,
                  );
                  const compte = comptes.get(restaurant.proprietaire_id);
                  const acces = calculerAcces({
                    abonnements: subscriptionRows
                      .filter((s) => s.restaurant_id === restaurant.id)
                      .map((s) => ({
                        module:
                          s.module === "reservations"
                            ? "reservations"
                            : "visibilite",
                        status: s.status,
                      })),
                    creeLe: restaurant.created_at,
                    accesOffertJusquAu: restaurant.acces_offert_jusqu_au,
                    maintenant: new Date(),
                  });
                  return (
                    <tr key={restaurant.id}>
                      <td className="font-medium text-zinc-900">
                        {restaurant.nom}
                      </td>
                      <td className="text-zinc-600">
                        {restaurant.adresse ?? "—"}
                      </td>
                      <td className="text-zinc-600">
                        {compte?.email ? (
                          <a
                            href={`mailto:${compte.email}`}
                            className="text-brand-orange hover:underline"
                          >
                            {compte.email}
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">
                            compte supprimé
                          </span>
                        )}
                        {compte?.telephone && (
                          <>
                            <br />
                            {compte.telephone}
                          </>
                        )}
                        {compte?.derniereVisite && (
                          <>
                            <br />
                            <span className="text-xs text-zinc-400">
                              vu le {formatDate(compte.derniereVisite)}
                            </span>
                          </>
                        )}
                      </td>
                      <td>
                        {subscription ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              subscription.status === "active" ||
                              subscription.status === "trialing"
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {subscription.status}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">aucun</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {/* Ce que voit réellement le restaurateur, une
                            fois l'essai, les faveurs et les paiements
                            additionnés. C'est cette colonne-là qu'on
                            regarde quand il appelle. */}
                        <span className="flex flex-col text-xs">
                          <span
                            className={
                              acces.ouvert.visibilite
                                ? "text-emerald-700"
                                : "text-zinc-400"
                            }
                          >
                            {acces.ouvert.visibilite ? "✓" : "✕"} visibilité
                          </span>
                          <span
                            className={
                              acces.ouvert.reservations
                                ? "text-emerald-700"
                                : "text-zinc-400"
                            }
                          >
                            {acces.ouvert.reservations ? "✓" : "✕"} réservations
                          </span>
                          {/* Le plus long des deux : c'est la date à
                              laquelle cet établissement perd tout. */}
                          {(() => {
                            const essai = essaiLePlusLong(acces);
                            return acces.enEssai && essai ? (
                              <span className="text-brand-navy">
                                essai, {essai.joursRestants} j
                              </span>
                            ) : null;
                          })()}
                        </span>
                      </td>
                      <td>
                        {/* Le même champ donne et reprend : vidé, il
                            retire la faveur. Pas de second bouton à
                            côté, qu'on cliquerait de travers. */}
                        <form
                          action={offrirAcces}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="hidden"
                            name="restaurant_id"
                            value={restaurant.id}
                          />
                          <input
                            type="date"
                            name="jusqu_au"
                            defaultValue={
                              restaurant.acces_offert_jusqu_au ?? ""
                            }
                            className="rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-brand-navy"
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
                          >
                            Appliquer
                          </button>
                        </form>
                      </td>
                      <td className="whitespace-nowrap text-zinc-500">
                        {formatDate(restaurant.created_at)}
                      </td>
                      <td>
                        <Suivre
                          cibleType="restaurant"
                          cibleId={restaurant.id}
                          lignes={
                            journal.get(`restaurant:${restaurant.id}`) ?? []
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>
      </main>
    </div>
  );
}
