import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { updateRestaurant } from "@/app/dashboard/actions";
import { RestaurantForm } from "@/components/restaurants/RestaurantForm";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { JOURS_SEMAINE, type Plage, type Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";

/** La durée d'une plage en minutes ; une fermeture après minuit compte le lendemain. */
function minutes(plage: Plage): number {
  const [ho, mo] = plage.ouverture.split(":").map(Number);
  const [hf, mf] = plage.fermeture.split(":").map(Number);
  const debut = ho * 60 + mo;
  let fin = hf * 60 + mf;
  if (fin <= debut) fin += 24 * 60;
  return fin - debut;
}

const DESTINATIONS = [
  {
    href: "vitrine",
    titre: "Site vitrine",
    texte: "Nom, adresse, horaires et description, en tête de ta page.",
  },
  {
    href: "reservations/configuration",
    titre: "Page de réservation",
    texte: "Le nom et l'adresse que voit le client au moment de réserver.",
  },
  {
    href: "visibilite-ia",
    titre: "Visibilité IA",
    texte:
      "Type de cuisine et description servent à vérifier si les assistants te citent.",
  },
];

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");

  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const restaurant = data as (Restaurant & { site_publie?: boolean }) | null;

  if (!restaurant) {
    notFound();
  }

  // Ce qui manque se voit avant de lire le formulaire : une fiche sans
  // téléphone ni description se remplit en deux minutes, encore faut-il
  // savoir qu'elle est incomplète.
  const champs = [
    restaurant.nom,
    restaurant.adresse,
    restaurant.telephone,
    restaurant.site_web,
    restaurant.type_cuisine,
    restaurant.description,
  ];
  const remplis = champs.filter((c) => c && c.trim().length > 0).length;
  const jours = JOURS_SEMAINE.filter(
    (jour) => !(restaurant.horaires?.[jour]?.ferme ?? false),
  );
  const heures = Math.round(
    jours.reduce((total, jour) => {
      const h = restaurant.horaires?.[jour];
      if (!h?.ouverture || !h.fermeture) return total;
      return (
        total +
        minutes({ ouverture: h.ouverture, fermeture: h.fermeture }) +
        (h.seconde ? minutes(h.seconde) : 0)
      );
    }, 0) / 60,
  );

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.edit}
          title={`Modifier ${restaurant.nom}`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          La fiche de ta maison : ce qu&apos;elle est, où elle se trouve et
          quand elle ouvre. Klarr la reprend partout — site vitrine, page de
          réservation, questions posées aux assistants IA.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur
          valeur={`${remplis}/${champs.length}`}
          libelle="champs de la fiche remplis"
          accent={remplis < champs.length}
        />
        <Compteur
          valeur={jours.length}
          libelle={`jour${jours.length > 1 ? "s" : ""} d'ouverture par semaine`}
        />
        <Compteur valeur={`${heures} h`} libelle="d'ouverture par semaine" />
      </div>

      <RestaurantForm
        action={updateRestaurant}
        restaurant={restaurant}
        submitLabel="Enregistrer"
      />

      <section className="flex flex-col gap-4">
        <TitreSection>Où ces informations apparaissent</TitreSection>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {DESTINATIONS.map((destination) => (
            <Link
              key={destination.href}
              href={`/dashboard/${id}/${destination.href}`}
              className="group flex flex-col gap-1 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-[border-color,transform,box-shadow] hover:-translate-y-px hover:border-ink hover:shadow-md"
            >
              <span className="flex items-center justify-between gap-2 text-base font-semibold text-ink">
                {destination.titre}
                <span
                  aria-hidden="true"
                  className="text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                >
                  →
                </span>
              </span>
              <span className="text-sm leading-relaxed text-zinc-600">
                {destination.texte}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
