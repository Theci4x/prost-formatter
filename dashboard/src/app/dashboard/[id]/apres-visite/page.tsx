import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { GENRE_AVIS, liensAvis, messageAvis } from "@/lib/courriel/apresVisite";
import { estLangue, type Langue } from "@/lib/i18n/langues";
import { basculerAvisApresVisite } from "./actions";

/**
 * La demande d'avis du lendemain.
 *
 * Elle part toute seule ; cette page sert à la voir telle qu'elle arrive,
 * dans les trois langues, et à la couper. Le réglage vit ici plutôt que
 * sur la page des avis : c'est le carnet qui fournit les adresses, et une
 * maison abonnée aux seules réservations doit pouvoir y toucher.
 */

/** L'instant d'il y a `jours` jours : lu hors du rendu, comme toute horloge. */
function ilYA(jours: number): string {
  return new Date(Date.now() - jours * 24 * 3600 * 1000).toISOString();
}

const LANGUES: { cle: Langue; libelle: string }[] = [
  { cle: "fr", libelle: "Français" },
  { cle: "en", libelle: "Anglais" },
  { cle: "zh", libelle: "Chinois" },
];

export default async function ApresVisitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ langue?: string }>;
}) {
  const { id } = await params;
  const { langue: langueDemandee } = await searchParams;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");

  const supabase = await createClient();
  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const restaurant = restaurantData as {
    id: string;
    nom: string;
    adresse: string | null;
    google_place_id: string | null;
    slug_reservation: string | null;
    avis_apres_visite?: boolean | null;
  } | null;
  if (!restaurant) notFound();

  const actif = restaurant.avis_apres_visite !== false;
  const liens = liensAvis(restaurant);
  const langue: Langue = estLangue(langueDemandee) ? langueDemandee : "fr";

  // Le journal des envois n'est lisible qu'avec la clé de service : il
  // porte les adresses de tous les clients de toutes les maisons.
  const depuis = ilYA(30);
  const service = createServiceClient();
  const [envoisResult, retoursResult] = await Promise.all([
    service
      .from("reservation_courriels")
      .select("erreur, restaurant_reservations!inner(restaurant_id)")
      .eq("genre", GENRE_AVIS)
      .eq("restaurant_reservations.restaurant_id", id)
      .gte("envoye_le", depuis),
    supabase
      .from("restaurant_retours")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", id)
      .gte("created_at", depuis),
  ]);
  const envois = (envoisResult.data ?? []) as { erreur: string | null }[];
  const partis = envois.filter((e) => !e.erreur).length;
  const echecs = envois.length - partis;

  const message = liens
    ? messageAvis({
        restaurantNom: restaurant.nom,
        restaurantAdresse: restaurant.adresse,
        langue,
        ...liens,
        lienDesabonnement: "#",
      })
    : null;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.avis}
          title={`Après la visite — ${restaurant.nom}`}
          backHref={`/dashboard/${id}/notifications`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          Le lendemain de leur venue, vers 11 h, tes clients reçoivent un merci
          et une invitation à laisser un avis sur Google, avec juste dessous un
          lien pour t&apos;écrire directement. Même message pour tout le monde :
          Google interdit de n&apos;inviter que les clients contents.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Compteur valeur={partis} libelle="envoyés ces 30 derniers jours" />
        <Link
          href={`/dashboard/${id}/retours`}
          className="block [&>div]:h-full"
        >
          <Compteur
            valeur={retoursResult.count ?? 0}
            libelle="messages privés reçus ces 30 jours"
          />
        </Link>
        {echecs > 0 && (
          <Compteur
            valeur={echecs}
            libelle="non partis (adresse refusée)"
            accent
          />
        )}
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 font-serif text-2xl text-ink">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${
                actif ? "bg-emerald-500" : "bg-zinc-300"
              }`}
            />
            {actif ? "Envoyée chaque matin" : "Coupée"}
          </span>
          <span className="text-sm text-zinc-600">
            {actif
              ? "Aux clients venus la veille, une fois par trimestre au plus pour un habitué."
              : "Plus aucun client ne la reçoit. Tu peux la remettre quand tu veux."}
          </span>
        </div>
        <form action={basculerAvisApresVisite}>
          <input type="hidden" name="restaurant_id" value={id} />
          <input type="hidden" name="actif" value={actif ? "0" : "1"} />
          <button
            type="submit"
            className={
              actif
                ? "rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                : "rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
            }
          >
            {actif ? "Couper l'envoi" : "Remettre l'envoi"}
          </button>
        </form>
      </section>

      {!restaurant.google_place_id && liens && (
        <p className="max-w-3xl rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-4 text-sm text-ink">
          Klarr ne connaît pas encore ta fiche Google : le bouton mène à ta page
          d&apos;avis, qui la retrouve toute seule. Pour qu&apos;il aille droit
          au formulaire Google, ouvre une fois{" "}
          <Link
            href={`/dashboard/${id}/google`}
            className="font-semibold underline"
          >
            la page Fiche Google
          </Link>
          .
        </p>
      )}

      <section className="flex flex-col gap-4">
        <TitreSection aside={message?.sujet}>
          Ce que reçoit le client
        </TitreSection>
        <div className="flex flex-wrap gap-2">
          {LANGUES.map((l) => (
            <Link
              key={l.cle}
              href={`/dashboard/${id}/apres-visite${l.cle === "fr" ? "" : `?langue=${l.cle}`}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                l.cle === langue
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
              }`}
            >
              {l.libelle}
            </Link>
          ))}
        </div>
        <p className="max-w-3xl text-sm text-zinc-500">
          Il part dans la langue où le client a réservé, depuis l&apos;adresse
          de Klarr, et c&apos;est à toi qu&apos;il répond.
        </p>
        {message ? (
          <iframe
            title="Aperçu de la demande d'avis"
            srcDoc={message.html}
            sandbox="allow-popups allow-popups-to-escape-sandbox"
            className="h-[560px] w-full max-w-3xl rounded-2xl border border-zinc-200/70 bg-white shadow-sm"
          />
        ) : (
          <p className="max-w-3xl rounded-2xl border border-zinc-200/70 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            Rien ne part tant que ta page de réservation n&apos;a pas
            d&apos;adresse : c&apos;est elle qui porte le lien vers ta fiche
            Google et le formulaire pour t&apos;écrire.
          </p>
        )}
      </section>

      <section className="flex max-w-3xl flex-col gap-3">
        <TitreSection>Qui ne la reçoit pas</TitreSection>
        <ul className="flex flex-col gap-2 text-sm text-zinc-600">
          <li>Les absents que tu as notés dans le carnet.</li>
          <li>Les tables importées d&apos;un autre outil.</li>
          <li>
            Un habitué qui l&apos;a déjà reçue ces 90 derniers jours : on ne
            redemande pas un avis à chaque dîner.
          </li>
          <li>
            Ceux qui se sont désinscrits de tes messages — le lien est en bas de
            chaque envoi.
          </li>
        </ul>
      </section>
    </div>
  );
}
