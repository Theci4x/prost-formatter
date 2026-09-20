import { normaliserTelephone } from "@/lib/contact/telephone";

/**
 * Le lien qui ouvre une conversation WhatsApp **vers** nous.
 *
 * Le sens compte, et c'est tout l'intérêt du procédé : ici, c'est le
 * prospect qui écrit le premier. Une conversation ouverte par lui est
 * gratuite, sans gabarit à faire valider, sans limite de volume, et
 * autorisée sans réserve — là où un message parti de chez nous vers
 * quelqu'un qui n'a rien demandé est précisément ce que la politique de
 * Meta interdit, et ce qui fait fermer un compte.
 *
 * D'où un simple lien plutôt qu'une intégration : il ne demande aucun
 * compte WhatsApp Business, aucune vérification d'entreprise, et il
 * fonctionne le jour où on le pose.
 *
 * `NEXT_PUBLIC_` assumé : ce numéro s'affiche dans un lien que tout le
 * monde voit. Le cacher n'aurait aucun sens, et le faire descendre en
 * props à travers trois composants non plus.
 */

/** Notre numéro, ou rien — auquel cas l'écran n'affiche pas de bouton. */
export function numeroWhatsApp(): string | null {
  const brut = process.env.NEXT_PUBLIC_KLARR_WHATSAPP?.trim();
  if (!brut) return null;
  // Le même contrôle que partout ailleurs : un numéro mal saisi dans une
  // variable d'environnement produirait un lien mort sur toutes les
  // pages, et personne ne s'en apercevrait avant longtemps.
  return normaliserTelephone(brut);
}

/**
 * L'adresse du lien, message prérempli compris.
 *
 * `wa.me` veut les chiffres seuls, sans le « + » : le laisser donne une
 * page d'erreur, et c'est le genre de détail qu'on ne voit pas en
 * relisant le code.
 */
export function lienWhatsApp(numero: string, message: string): string {
  const chiffres = numero.replace(/\D/g, "");
  return `https://wa.me/${chiffres}?text=${encodeURIComponent(message)}`;
}
