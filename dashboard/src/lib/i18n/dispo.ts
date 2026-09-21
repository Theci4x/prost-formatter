import type { Langue } from "@/lib/i18n/langues";

/**
 * Pourquoi un créneau ne se prend pas, dans la langue du lecteur.
 *
 * Ces phrases-là comptent plus que les autres. Le client ne les lit que
 * lorsqu'il est empêché : c'est le moment où il décide de rappeler, de
 * changer d'heure, ou de fermer l'onglet. « Complet » et « trop tard » ne
 * se corrigent pas de la même façon, et un motif qu'on ne comprend pas
 * se lit comme un refus sec.
 *
 * `ferme` et `fermePour` portent ces noms-là parce que `motifFermeture`
 * les attend ainsi : le dictionnaire se passe tel quel.
 */

export type ClesDispo = {
  ferme: string;
  fermePour(motif: string): string;
  dejaPrivatise: string;
  auMaximum(capacite: number): string;
  neResteQue(restants: number, heure: string): string;
  privatisationDemarre(minimum: number): string;
  pasDisponible: string;
  demandesFerment(heures: number): string;
  servicePasse: string;
  completPourCeNombre: string;
};

const fr: ClesDispo = {
  ferme: "Fermé ce jour-là.",
  fermePour: (motif) => `Fermé — ${motif}`,
  dejaPrivatise: "Cet espace est déjà privatisé sur ce créneau.",
  auMaximum: (capacite) =>
    `Cet espace accueille au maximum ${capacite} couverts.`,
  neResteQue: (restants, heure) =>
    `Il ne reste que ${restants} couverts à ${heure}.`,
  privatisationDemarre: (minimum) =>
    `La privatisation démarre à ${minimum} couverts.`,
  pasDisponible: "Cet espace n'est pas disponible pour cette demande.",
  demandesFerment: (heures) =>
    `Les demandes ferment ${heures} h avant le service.`,
  servicePasse: "Ce service est passé.",
  completPourCeNombre: "Complet pour ce nombre de convives.",
};

const en: ClesDispo = {
  ferme: "Closed that day.",
  fermePour: (motif) => `Closed — ${motif}`,
  dejaPrivatise: "This space is already booked privately for that slot.",
  auMaximum: (capacite) => `This space seats ${capacite} guests at most.`,
  neResteQue: (restants, heure) =>
    `Only ${restants} seats left at ${heure}.`,
  privatisationDemarre: (minimum) =>
    `Private hire starts at ${minimum} guests.`,
  pasDisponible: "This space is not available for that request.",
  demandesFerment: (heures) => `Requests close ${heures} h before service.`,
  servicePasse: "That service is over.",
  completPourCeNombre: "Fully booked for that number of guests.",
};

const zh: ClesDispo = {
  ferme: "这一天休息。",
  fermePour: (motif) => `休息 —— ${motif}`,
  dejaPrivatise: "这个空间在该时段已被包场。",
  auMaximum: (capacite) => `这个空间最多容纳 ${capacite} 位。`,
  neResteQue: (restants, heure) => `${heure} 只剩 ${restants} 个位子。`,
  privatisationDemarre: (minimum) => `包场从 ${minimum} 位起。`,
  pasDisponible: "这个空间无法满足该申请。",
  demandesFerment: (heures) => `申请在开餐前 ${heures} 小时截止。`,
  servicePasse: "这一餐次已经结束。",
  completPourCeNombre: "这个人数已经订满。",
};

export const DISPO: Record<Langue, ClesDispo> = { fr, en, zh };
