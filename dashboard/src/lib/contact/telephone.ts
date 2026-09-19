/**
 * Un numéro de téléphone qu'on pourra vraiment composer.
 *
 * La page est servie en trois langues : refuser tout ce qui n'est pas
 * français écarterait un prospect étranger. Mais un numéro qui commence
 * par 0 est français, et un français fait dix chiffres — ni onze, ni
 * douze. C'est cette règle-là qui manquait : « 064947464734 » passait, et
 * on ne s'en apercevait qu'en essayant de rappeler.
 */

/** Ne garde que les chiffres, et le « + » s'il ouvre le numéro. */
function chiffres(saisie: string): string {
  const brut = saisie.trim();
  const international = brut.startsWith("+");
  const nombres = brut.replace(/\D/g, "");
  return international ? `+${nombres}` : nombres;
}

/**
 * Le numéro sous sa forme internationale, ou null s'il ne tient pas
 * debout. On renvoie la forme normalisée plutôt qu'un simple vrai/faux :
 * autant enregistrer « +33649474647 » que « 06 49 47 46 47 », puisque
 * c'est ce qu'on recompose pour appeler.
 */
export function normaliserTelephone(saisie: string): string | null {
  let numero = chiffres(saisie);
  if (!numero) return null;

  // 0033… et 0033… s'écrivent aussi +33…
  if (numero.startsWith("00")) numero = `+${numero.slice(2)}`;

  // France, écrit à la française : 0 puis neuf chiffres, le premier de 1 à 9
  // (06 ou 07 pour un mobile, 01 à 05 pour un fixe — jamais 00).
  if (/^0[1-9]\d{8}$/.test(numero)) return `+33${numero.slice(1)}`;

  // Un 0 en tête sans faire dix chiffres : c'est un français mal saisi, et
  // le laisser passer revient à enregistrer un numéro qu'on ne joindra pas.
  if (numero.startsWith("0")) return null;

  // Idem pour l'indicatif français en clair : il doit tenir sa longueur, et
  // non retomber sur la règle internationale ci-dessous, bien plus large —
  // c'est par là qu'un « +33 » trop court serait passé.
  if (numero.startsWith("+33")) {
    return /^\+33[1-9]\d{8}$/.test(numero) ? numero : null;
  }

  // Ailleurs dans le monde, on ne connaît pas les plans de numérotation :
  // on s'en tient aux bornes de la norme internationale, indicatif compris.
  if (/^\+\d{8,15}$/.test(numero)) return numero;

  return null;
}

export function telephoneValide(saisie: string): boolean {
  return normaliserTelephone(saisie) !== null;
}

/**
 * Le numéro tel qu'on le range en base.
 *
 * Normalisé quand il tient debout, **tel qu'il a été tapé** sinon. Ce
 * n'est pas un compromis mou, c'est la seule règle qui serve les deux
 * lecteurs de cette colonne.
 *
 * Une machine qui enverra un SMS ne peut rien faire d'un « 06 49 47 46 »
 * tronqué : elle filtre sur la forme internationale et l'ignore. Mais le
 * restaurateur, lui, en fait quelque chose — il voit qu'il manque un
 * chiffre et retrouve l'appel dans son journal. Effacer ce qu'on ne sait
 * pas lire lui retirerait l'indice sans rien apporter à personne.
 *
 * D'où une colonne à deux formes, assumée : `+33…` se compose, le reste
 * se relit. `telephoneJoignable` est le seul endroit qui tranche.
 */
export function telephoneAEnregistrer(
  saisie: string | null | undefined,
): string | null {
  const brut = (saisie ?? "").trim();
  if (!brut) return null;
  return normaliserTelephone(brut) ?? brut;
}

/**
 * Le numéro sur lequel on peut réellement envoyer quelque chose, ou rien.
 *
 * L'autre moitié de la règle ci-dessus, et le seul endroit qui décide :
 * tout ce qui n'est pas sous forme internationale n'est pas joignable par
 * une machine, quoi qu'on en devine à l'œil.
 */
export function telephoneJoignable(
  range: string | null | undefined,
): string | null {
  const valeur = (range ?? "").trim();
  return /^\+\d{8,15}$/.test(valeur) ? valeur : null;
}
