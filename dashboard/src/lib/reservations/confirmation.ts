import type { Service } from "@/types/reservation";
import { debutDuService } from "@/lib/reservations/disponibilite";
import type { Garantie } from "@/lib/reservations/garantie";

/**
 * Faut-il confirmer cette réservation toute seule ?
 *
 * Valider chaque demande à la main tient à trois par semaine et s'écroule
 * à vingt : le restaurateur finit par confirmer en bloc sans regarder, ce
 * qui revient à ne pas confirmer — en plus lent, et avec des clients qui
 * ont attendu pendant ce temps.
 *
 * Trois choses l'emportent malgré tout sur l'automatisme, et dans cet
 * ordre.
 */
export type ReglesConfirmation = {
  /** Le restaurateur peut tout reprendre à la main s'il préfère. */
  confirmation_auto: boolean;
  /**
   * En deçà de ce délai avant le service, on ne confirme plus tout seul.
   * Une table pour demain soir se confirme ; une table pour dans deux
   * heures se regarde, parce que c'est celle qui peut ne pas passer.
   */
  confirmation_auto_delai_heures: number;
};

export type Decision = {
  statut: "demande" | "confirmee";
  /** Pourquoi on n'a pas confirmé. Null quand on a confirmé. */
  motif: "desactive" | "derniere_minute" | "garantie" | "privatisation" | null;
};

export function decisionAutomatique({
  regles,
  service,
  date,
  type,
  garantie,
  maintenant,
}: {
  regles: ReglesConfirmation;
  service: Service;
  date: string;
  type: "table" | "privatisation";
  garantie: Garantie;
  maintenant: Date;
}): Decision {
  // 1. L'argent d'abord. Une privatisation qui réclame un acompte ou une
  //    empreinte reste une option jusqu'au paiement : c'est toute la règle
  //    posée dans garantie.ts, et la confirmation automatique ne doit pas
  //    la contourner par la bande.
  if (garantie.exigee) return { statut: "demande", motif: "garantie" };

  // 2. Une privatisation se regarde, même sans garantie. Bloquer une salle
  //    entière pour un groupe qu'on n'a jamais eu au téléphone n'est pas
  //    une décision qu'un logiciel doit prendre à la place du patron.
  if (type === "privatisation") {
    return { statut: "demande", motif: "privatisation" };
  }

  if (!regles.confirmation_auto) {
    return { statut: "demande", motif: "desactive" };
  }

  // 3. La dernière minute. Le délai se compte depuis l'ouverture du
  //    service, comme le délai de prévenance : c'est le même repère, et
  //    deux repères différents pour deux réglages voisins seraient une
  //    source d'erreurs.
  const heures = regles.confirmation_auto_delai_heures;
  if (heures > 0) {
    const limite = new Date(
      debutDuService(date, service).getTime() - heures * 3600 * 1000,
    );
    if (maintenant >= limite) {
      return { statut: "demande", motif: "derniere_minute" };
    }
  }

  return { statut: "confirmee", motif: null };
}
