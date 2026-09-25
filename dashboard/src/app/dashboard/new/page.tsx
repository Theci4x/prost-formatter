import { createRestaurant } from "@/app/dashboard/actions";
import { RestaurantForm } from "@/components/restaurants/RestaurantForm";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { FICHE } from "@/lib/i18n/pages/fiche";

/**
 * Ce qui vient après la création, dans l'ordre où ça rapporte. Sans
 * liens : l'établissement n'existe pas encore, et l'accueil du tableau
 * de bord, où l'on arrive juste après, porte toutes ces entrées.
 */
const ETAPES = [
  {
    titre: "Ta carte et tes photos",
    texte:
      "Les plats, les allergènes et quelques belles photos : c'est ce que les clients regardent avant de réserver.",
  },
  {
    titre: "Ta page de réservation",
    texte:
      "Tes services, tes salles et tes tables. Les demandes arrivent ensuite dans ton carnet, sans commission.",
  },
  {
    titre: "Ton site vitrine",
    texte:
      "Il se construit avec la fiche, la carte et les photos. Tu le publies quand il te plaît.",
  },
];

export default async function NewRestaurantPage() {
  const langue = await langueUtilisateur();
  const t = traducteur(langue, FICHE, COMMUN);
  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.new}
          title={t("Ajouter un restaurant")}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          {t(
            "Le nom suffit pour commencer : tout le reste se complète ou se corrige plus tard, depuis « Modifier ». Ces informations alimentent ton site vitrine, ta page de réservation et ce que les assistants IA savent de toi.",
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur valeur="1" libelle={t("seul champ obligatoire : le nom")} />
        <Compteur valeur={t("2 min")} libelle={t("pour remplir la fiche")} />
        <Compteur valeur={t("14 j")} libelle={t("d'essai, dès la création")} />
      </div>

      <RestaurantForm
        action={createRestaurant}
        submitLabel={t("Créer le restaurant")}
        langue={langue}
      />

      <section className="flex flex-col gap-4">
        <TitreSection>{t("Et ensuite")}</TitreSection>
        <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {ETAPES.map((etape, index) => (
            <li
              key={etape.titre}
              className="flex gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
            >
              <span className="font-serif text-4xl leading-none text-brand-orange">
                {index + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-base font-semibold text-ink">
                  {t(etape.titre)}
                </span>
                <span className="text-sm leading-relaxed text-zinc-600">
                  {t(etape.texte)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
