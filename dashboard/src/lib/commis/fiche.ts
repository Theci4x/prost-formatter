import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Espace, Service } from "@/types/reservation";
import type { MenuItem } from "@/types/menu";
import type { Horaires, JourSemaine } from "@/types/restaurant";
import { JOURS_SEMAINE } from "@/types/restaurant";
import { heureLisible } from "@/lib/site/horaires";
import { carteOrganisee, formatPrix } from "@/lib/menu/carte";
import { traductionAJour, traductionDe } from "@/lib/menu/traduction";
import { cartePubliee } from "@/lib/menu/publication";
import { listeAllergenes } from "@/types/allergenes";

/**
 * Tout ce qu'un établissement dit publiquement de lui-même, en un texte.
 *
 * C'est la seule chose que le Commis d'un restaurant aura le droit de
 * lire. D'où deux règles qui commandent ce fichier.
 *
 * **Rien ici n'est privé.** Chaque ligne est déjà affichée sur la page de
 * réservation ou sur la vitrine : horaires, salles, carte publiée,
 * questions fréquentes. Un assistant qui lirait le carnet pourrait dire à
 * un inconnu qui dîne ce soir et à quelle heure — ce fichier est la
 * frontière qui l'en empêche, et elle doit se relire d'un coup d'œil.
 *
 * **Rien ici ne parle de disponibilité.** Ni réservations, ni jauges, ni
 * places restantes. Le Commis ne doit jamais dire « oui, il reste une
 * table » : le formulaire de la page le sait, lui, et c'est à lui de le
 * dire. Une table promise par erreur, c'est quelqu'un qui se présente à
 * vingt heures et repart.
 */

export type Fiche = {
  nom: string;
  /** Le texte remis au modèle. Vide quand il n'y a rien à dire. */
  corpus: string;
  /** De quoi juger si l'assistant a de la matière — voir `ficheUtile`. */
  rubriques: number;
};

type Restaurant = {
  id: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  site_web: string | null;
  description: string | null;
  type_cuisine: string | null;
  horaires: Horaires | null;
};

type QuestionFaq = { question: string; reponse: string };

/** « lundi », « mardi »… tels que le restaurateur les a saisis. */
function horairesLisibles(horaires: Horaires | null): string[] {
  if (!horaires) return [];
  const lignes: string[] = [];
  for (const jour of JOURS_SEMAINE as readonly JourSemaine[]) {
    const jourHoraire = horaires[jour];
    if (!jourHoraire) continue;
    if (jourHoraire.ferme) {
      lignes.push(`${jour} : fermé`);
      continue;
    }
    const premier = `de ${heureLisible(jourHoraire.ouverture)} à ${heureLisible(jourHoraire.fermeture)}`;
    const seconde = jourHoraire.seconde
      ? `, puis de ${heureLisible(jourHoraire.seconde.ouverture)} à ${heureLisible(jourHoraire.seconde.fermeture)}`
      : "";
    lignes.push(`${jour} : ${premier}${seconde}`);
  }
  return lignes;
}

const NOM_JOUR = [
  "",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

function servicesLisibles(services: Service[]): string[] {
  return services.map((service) => {
    const jours = service.jours
      .map((jour) => NOM_JOUR[jour])
      .filter(Boolean)
      .join(", ");
    const creneau = `${heureLisible(service.heure_debut)} à ${heureLisible(service.heure_fin)}`;
    const delai =
      service.delai_heures > 0
        ? ` — réservable jusqu'à ${service.delai_heures} h avant`
        : "";
    return `${service.nom} : ${jours || "tous les jours"}, de ${creneau}${delai}`;
  });
}

function euros(centimes: number): string {
  return `${(centimes / 100).toLocaleString("fr-FR")} €`;
}

function espacesLisibles(espaces: Espace[]): string[] {
  return espaces.map((espace) => {
    const morceaux = [`${espace.nom} — ${espace.capacite} couverts`];
    if (espace.description) morceaux.push(espace.description);
    if (espace.privatisation_minimum !== null) {
      morceaux.push(
        `privatisable à partir de ${espace.privatisation_minimum} convives`,
      );
      if (espace.minimum_consommation_centimes) {
        morceaux.push(
          `minimum de consommation ${euros(espace.minimum_consommation_centimes)} ${espace.minimum_consommation_ht ? "HT" : "TTC"}`,
        );
      }
    } else {
      morceaux.push("ne se privatise pas");
    }
    if (espace.acompte_centimes) {
      morceaux.push(
        `acompte demandé : ${euros(espace.acompte_centimes)}${espace.acompte_mode === "par_couvert" ? " par convive" : ""}`,
      );
    } else if (espace.caution_centimes) {
      morceaux.push(
        `empreinte bancaire : ${euros(espace.caution_centimes)}${espace.caution_mode === "par_couvert" ? " par convive" : ""}, débitée seulement en cas d'absence`,
      );
    }
    return morceaux.join(" · ");
  });
}

/**
 * La carte, catégorie par catégorie. Seulement si elle est publiée.
 *
 * **La version anglaise voyage avec la française, quand elle existe.** Un
 * client qui écrit en anglais recevra une réponse en anglais, et sans
 * cela le modèle traduirait les plats lui-même : or « suprême de volaille
 * aux morilles » mal rendu n'est pas une maladresse de style, c'est une
 * assiette qui n'est pas celle qu'on croyait commander. La traduction du
 * restaurateur a été relue par lui ; celle du modèle, par personne.
 *
 * Seules les traductions à jour sont reprises. `traductionAJour` écarte
 * celles qu'un plat corrigé en français a rendues caduques — mieux vaut
 * laisser le modèle traduire au vol que citer un ancien texte avec
 * l'autorité d'une carte officielle.
 */
function carteLisible(items: MenuItem[]): string[] {
  return carteOrganisee(items).map((bloc) => {
    const plats = bloc.plats
      .map((plat) => {
        const prix = plat.prix_centimes
          ? ` (${formatPrix(plat.prix_centimes)})`
          : "";
        const detail = plat.description ? ` — ${plat.description}` : "";
        const anglais = traductionAJour(plat, "en")
          ? traductionDe(plat, "en")
          : null;
        const versionEn = anglais
          ? ` [en : ${anglais.nom}${anglais.description ? ` — ${anglais.description}` : ""}]`
          : "";
        // Déclaré par le restaurateur, ou rien. Les trois états de la
        // colonne se rendent en trois phrases distinctes, parce que le
        // modèle les confondrait : « aucun » et « pas encore examiné »
        // s'écrivent tous deux comme une liste vide, et la consigne ne
        // peut pas rattraper une source ambiguë.
        const allergenes =
          plat.allergenes === null
            ? " (allergènes non déclarés)"
            : plat.allergenes.length === 0
              ? " (aucun des quatorze allergènes déclarés)"
              : ` (allergènes déclarés : ${listeAllergenes(plat.allergenes, false)})`;
        return `${plat.nom}${prix}${detail}${versionEn}${allergenes}`;
      })
      .join(" ; ");
    return `${bloc.categorie} : ${plats}`;
  });
}

/** Une rubrique n'entre dans le texte que si elle a quelque chose à dire. */
function rubrique(titre: string, lignes: string[]): string | null {
  const utiles = lignes.filter((ligne) => ligne.trim().length > 0);
  if (utiles.length === 0) return null;
  return `## ${titre}\n${utiles.map((ligne) => `- ${ligne}`).join("\n")}`;
}

export function composerFiche({
  restaurant,
  services,
  espaces,
  faq,
  carte,
}: {
  restaurant: Restaurant;
  services: Service[];
  espaces: Espace[];
  faq: QuestionFaq[];
  carte: MenuItem[];
}): Fiche {
  const identite = [
    restaurant.adresse ? `Adresse : ${restaurant.adresse}` : "",
    restaurant.telephone ? `Téléphone : ${restaurant.telephone}` : "",
    restaurant.type_cuisine ? `Cuisine : ${restaurant.type_cuisine}` : "",
    restaurant.site_web ? `Site : ${restaurant.site_web}` : "",
    restaurant.description ?? "",
  ];

  const blocs = [
    rubrique("L'établissement", identite),
    rubrique("Horaires d'ouverture", horairesLisibles(restaurant.horaires)),
    rubrique("Services et réservation", servicesLisibles(services)),
    rubrique("Salles", espacesLisibles(espaces)),
    rubrique(
      "Questions fréquentes",
      faq.map((q) => `${q.question} ${q.reponse}`),
    ),
    rubrique("La carte", carteLisible(carte)),
  ].filter((bloc): bloc is string => bloc !== null);

  return {
    nom: restaurant.nom,
    corpus: blocs.join("\n\n"),
    rubriques: blocs.length,
  };
}

/**
 * Y a-t-il de quoi répondre ?
 *
 * L'identité seule ne suffit pas : un assistant qui ne connaît que le nom
 * et l'adresse répondra « je n'ai pas cette information » à tout, et vaut
 * moins qu'un numéro de téléphone affiché. Trois rubriques, c'est le
 * moment où il commence à servir — et c'est aussi ce qui donne au
 * restaurateur une raison de finir sa fiche.
 */
export function ficheUtile(fiche: Fiche): boolean {
  return fiche.rubriques >= 3;
}

/**
 * Charge la fiche publique d'un établissement.
 *
 * Avec la clé de service, comme la page publique elle-même — et en ne
 * lisant que des tables dont le contenu est déjà public. La carte passe
 * par `cartePubliee`, qui rend un tableau vide tant que le restaurateur
 * ne l'a pas publiée : une carte saisie pour essayer n'a pas à sortir
 * d'ici.
 *
 * Ne lève jamais. Une fiche incomplète vaut mieux qu'une page qui tombe.
 */
export async function chargerFiche(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<Fiche | null> {
  try {
    const [restaurantResult, servicesResult, espacesResult, faqResult, carte] =
      await Promise.all([
        supabase
          .from("restaurants")
          .select(
            "id, nom, adresse, telephone, site_web, description, type_cuisine, horaires",
          )
          .eq("id", restaurantId)
          .maybeSingle(),
        supabase
          .from("restaurant_services")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("ordre"),
        supabase
          .from("restaurant_espaces")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("ordre"),
        supabase
          .from("restaurant_faq")
          .select("question, reponse")
          .eq("restaurant_id", restaurantId)
          .order("ordre")
          .order("created_at"),
        cartePubliee(supabase, restaurantId),
      ]);

    const restaurant = restaurantResult.data as Restaurant | null;
    if (!restaurant) return null;

    return composerFiche({
      restaurant,
      services: (servicesResult.data ?? []) as Service[],
      espaces: (espacesResult.data ?? []) as Espace[],
      faq: (faqResult.data ?? []) as QuestionFaq[],
      carte: carte.items,
    });
  } catch (erreur) {
    console.error("[commis/fiche]", erreur);
    return null;
  }
}
