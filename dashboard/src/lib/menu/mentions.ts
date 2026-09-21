/**
 * Les mentions qui doivent figurer au bas d'une carte, en France.
 *
 * Elles ne se paramètrent pas, et c'est voulu : ce ne sont pas des
 * préférences d'établissement mais des obligations identiques pour tous.
 * Offrir une case à cocher laisserait entendre qu'on peut ne pas les
 * afficher, et le premier restaurateur pressé la décocherait.
 *
 * **Prix nets, taxes et service compris.** Le service en sus a disparu
 * des additions françaises avec la loi du 30 décembre 1986 : depuis, un
 * prix affiché dans un restaurant est le prix payé. L'arrêté du 27 mars
 * 1987 impose de l'écrire. C'est aussi ce que cherche le client qui
 * compare deux cartes sur le trottoir.
 *
 * **Les allergènes.** Pour un plat non préemballé, le règlement (UE)
 * 1169/2011 et le décret 2015-447 demandent une information écrite,
 * accessible *sans demande préalable*. Klarr imprime les allergènes
 * déclarés sous chaque plat ; la mention dit où regarder et rappelle que
 * la cuisine, elle, n'est pas cloisonnée — une trace n'est pas un
 * ingrédient, et personne ne doit lire « sans gluten » là où on a voulu
 * dire « pas de gluten dans la recette ».
 */

export const MENTION_PRIX = {
  fr: "Prix nets en euros, taxes et service compris.",
  en: "Prices in euros, all taxes and service included.",
  zh: "标价为欧元净价，已含税费及服务费。",
} as const;

export const MENTION_ALLERGENES = {
  fr: "Les allergènes déclarés figurent sous chaque plat. Nos préparations sont faites dans une cuisine qui manipule les quatorze allergènes : nous ne pouvons pas exclure les traces. Signalez toute allergie avant de commander.",
  en: "Declared allergens appear under each dish. Our kitchen handles all fourteen regulated allergens, so traces cannot be ruled out. Please tell us about any allergy before ordering.",
  zh: "每道菜下方标注了已申报的过敏原。我们的厨房同时处理全部十四类过敏原，无法排除交叉接触的痕量。点餐前请告知我们您的过敏情况。",
} as const;

/** Affichée quand rien n'a encore été déclaré : mieux vaut le dire. */
export const MENTION_ALLERGENES_ABSENTS = {
  fr: "Pour toute question sur les allergènes, demandez-nous avant de commander.",
  en: "For any allergen question, please ask us before ordering.",
  zh: "有任何过敏原方面的问题，请在点餐前询问我们。",
} as const;

export const TITRE_ALLERGENES = {
  fr: "Les allergènes, plat par plat",
  en: "Allergens, dish by dish",
  zh: "各道菜的过敏原一览",
} as const;
