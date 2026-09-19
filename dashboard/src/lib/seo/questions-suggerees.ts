/**
 * Ce qu'on demande le plus, et que le téléphone encaisse en plein service.
 *
 * Hors du fichier d'actions : un module « use server » ne peut exporter
 * que des fonctions asynchrones, et une simple liste y fait échouer la
 * compilation de la page entière.
 */
export const QUESTIONS_SUGGEREES = [
  "Avez-vous une terrasse ?",
  "Êtes-vous accessible en fauteuil roulant ?",
  "Acceptez-vous les chiens ?",
  "Avez-vous des plats végétariens ?",
  "Peut-on venir à 12 sans réserver ?",
  "Y a-t-il un parking à proximité ?",
  "Proposez-vous un menu du midi ?",
  "Peut-on privatiser une salle ?",
];
