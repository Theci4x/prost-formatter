import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur } from "@/components/dashboard/Compteur";
import { AssistantImport } from "@/components/import/AssistantImport";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { IMPORT } from "@/lib/i18n/pages/import";

/**
 * Reprendre son fichier client et ses réservations d'un autre outil.
 *
 * Le premier frein à quitter TheFork ou Zenchef, ce n'est pas le prix :
 * c'est la peur de perdre ses clients et les tables déjà prises. Cet
 * écran le lève en dix minutes, sans nous — le restaurateur exporte de
 * l'ancien outil, dépose le fichier, vérifie, importe.
 */
export default async function ImportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type } = await searchParams;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");

  const supabase = await createClient();
  const aujourdhui = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [restaurantResult, contacts, aVenir, espaces] = await Promise.all([
    supabase.from("restaurants").select("nom").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_contacts")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", id),
    supabase
      .from("restaurant_reservations")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", id)
      .eq("statut", "confirmee")
      .gte("date_reservation", aujourdhui),
    supabase
      .from("restaurant_espaces")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", id),
  ]);

  const restaurant = restaurantResult.data as { nom: string } | null;
  if (!restaurant) notFound();
  const langue = await langueUtilisateur();
  const t = traducteur(langue, IMPORT, COMMUN);

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.reservations}
          title={t("Importer — {nom}", { nom: restaurant.nom })}
          backHref={`/dashboard/${id}/clients`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          {t(
            "Tu viens de TheFork, de Zenchef ou d'un tableur ? Reprends ton fichier client et tes réservations à venir en quelques minutes : exporte-les de l'ancien outil, dépose le fichier ici, vérifie, importe. Rien n'est écrasé, et aucun client n'est prévenu.",
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Compteur
          valeur={(contacts.count ?? 0).toLocaleString(localeDe(langue))}
          libelle={t("clients déjà au fichier")}
        />
        <Compteur
          valeur={(aVenir.count ?? 0).toLocaleString(localeDe(langue))}
          libelle={t("réservations à venir au carnet")}
        />
      </div>

      <AssistantImport
        restaurantId={id}
        langue={langue}
        sallePrete={(espaces.count ?? 0) > 0}
        genreInitial={type === "reservations" ? "reservations" : "clients"}
      />
    </div>
  );
}
