import type { Espace } from "@/types/reservation";
import { garantieRequise } from "@/lib/reservations/garantie";

/**
 * Les conditions d'une privatisation, dites avant de réserver.
 *
 * Jusqu'ici la page publique n'en soufflait mot : le client envoyait sa
 * demande, et découvrait l'acompte de cinq cents euros quand le
 * restaurateur l'acceptait, plusieurs jours plus tard. Une condition
 * découverte après coup n'est pas une condition, c'est une mauvaise
 * surprise — et elle se paie en demandes abandonnées à l'étape du
 * paiement, après que la salle a été tenue pour rien.
 *
 * Le minimum de consommation appartient à la même famille, même s'il ne
 * prélève rien : c'est un engagement, et il se lit d'avance.
 */

export type Condition = {
  /** Ce qu'on annonce, en une ligne. */
  libelle: string;
  /** La précision qui évite le malentendu. Null quand il n'y en a pas. */
  precision: string | null;
};

function euros(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: centimes % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Ce qui sera demandé à ce client, pour cet espace et ce nombre de
 * convives. Le calcul est celui de `garantieRequise` : la page publique
 * doit annoncer exactement ce que l'acceptation réclamera, pas une
 * approximation.
 */
export function conditionsPrivatisation(
  espace: Espace,
  couverts: number,
): Condition[] {
  const conditions: Condition[] = [];

  if (espace.minimum_consommation_centimes) {
    conditions.push({
      libelle: `Minimum de consommation : ${euros(
        espace.minimum_consommation_centimes,
      )} € ${espace.minimum_consommation_ht ? "HT" : "TTC"}`,
      precision:
        "Rien n'est encaissé à la réservation : ce montant se règle à l'addition.",
    });
  }

  const garantie = garantieRequise(espace, "privatisation", couverts);

  if (garantie.acompteCentimes) {
    conditions.push({
      libelle: `Acompte : ${euros(garantie.acompteCentimes)} €`,
      precision:
        "Demandé une fois la demande acceptée, par un lien de paiement sécurisé. Il vient en déduction de l'addition.",
    });
  } else if (garantie.cautionCentimes) {
    conditions.push({
      libelle: `Carte en garantie : ${euros(garantie.cautionCentimes)} €`,
      // La nuance vaut la phrase : beaucoup de clients renoncent en
      // croyant qu'on les débite, alors que rien ne part.
      precision:
        "Rien n'est prélevé. La carte est enregistrée, et ne serait débitée qu'en cas de défection.",
    });
  }

  return conditions;
}
