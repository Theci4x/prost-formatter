import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Langue, MenuItem, TraductionPlat } from "@/types/menu";
import { libellesFormats } from "@/lib/menu/traduction";

/**
 * Traduire une carte de restaurant.
 *
 * Une exigence qui ne va pas de soi pour un modèle laissé libre : **ne
 * rien inventer**. Une description absente reste absente — un modèle qui
 * « améliore » un plat en lui prêtant des ingrédients fait mentir la
 * carte, et sur un allergène ça ne se rattrape pas.
 *
 * L'autre exigence, elle, dépend de la langue, et c'est pour ça qu'elle
 * ne vit plus dans une consigne unique. Vers l'anglais, il faut laisser
 * « tartare » et « Saint-Nectaire » en français, que le lecteur
 * reconnaît. Vers le chinois, il faut les traduire — personne ne
 * reconnaît « Saint-Nectaire » — mais garder le nom français entre
 * parenthèses, parce que le client devra le prononcer à un serveur qui
 * ne lit pas le chinois.
 */

type Cible = Exclude<Langue, "fr">;

/**
 * Ce qui change d'une langue à l'autre.
 *
 * Le chinois n'est pas l'anglais avec d'autres mots. Un lecteur
 * anglophone reconnaît « tartare » et « foie gras » ; un lecteur chinois
 * ne reconnaît rien, et une carte qui lui rendrait les noms français tels
 * quels ne lui servirait à rien. Mais il commande à voix haute, à un
 * serveur qui ne lit pas le chinois : le nom français doit donc rester
 * lisible à côté de la traduction, pas disparaître.
 */
const CIBLES: Record<
  Cible,
  { langue: string; regles: string; categories: string }
> = {
  en: {
    langue: "l'anglais",
    regles: `- Garde en français ce qui n'a pas de traduction : appellations (Saint-Nectaire, Comté, Côtes du Rhône), plats passés tels quels en anglais (tartare, foie gras, crème brûlée, confit), noms propres. Un nom français reconnaissable vaut mieux qu'une traduction littérale qui ne veut rien dire.`,
    categories: `Entrées → Starters, Plats → Main courses, Desserts → Desserts, Fromages → Cheese, Boissons → Drinks, Vins → Wine.`,
  },
  zh: {
    langue: "le chinois simplifié",
    regles: `- Traduis vraiment : un lecteur chinois ne reconnaît ni « tartare », ni « confit », ni « Saint-Nectaire ». Dis ce que c'est.
- MAIS garde le nom français entre parenthèses après la traduction quand le plat porte un nom propre ou une appellation — « 圣内克泰尔奶酪（Saint-Nectaire）». Le client commande à voix haute, à un serveur qui ne lit pas le chinois : sans le nom français, il ne peut pas se faire comprendre.
- N'utilise ni caractères traditionnels, ni pinyin : du chinois simplifié, tel qu'on le lit en Chine continentale.
- Pas d'espace avant la ponctuation chinoise, et sépare les énumérations par « 、 » plutôt que par une virgule.`,
    categories: `Entrées → 前菜, Plats → 主菜, Desserts → 甜点, Fromages → 奶酪, Boissons → 饮品, Vins → 葡萄酒.`,
  },
};

function consigne(cible: Cible): string {
  const c = CIBLES[cible];
  return `Tu traduis la carte d'un restaurant français vers ${c.langue}, pour des clients étrangers qui la lisent à table.

Règles :
- Traduis le nom du plat, sa description et sa catégorie.
${c.regles}
- N'invente RIEN. Si la description est absente, renvoie null. N'ajoute ni ingrédient, ni cuisson, ni accompagnement qui ne soit pas dans le texte français.
- N'ajoute pas de prix, ils sont gérés à part.
- Quand un plat porte des formats (« 6 pièces », « au verre », « grande assiette »), traduis chaque libellé, dans le même ordre, et renvoie-les dans "formats". Ce sont des quantités et des contenants, pas des noms de plats. Si le plat n'a pas de formats, renvoie un tableau vide.
- Reste court : une carte se lit debout, pas un roman.
- Une catégorie se traduit par son équivalent d'usage : ${c.categories}

Réponds UNIQUEMENT par un tableau JSON, sans texte autour, de la forme :
[{"id": "...", "nom": "...", "description": "..." ou null, "categorie": "...", "formats": ["...", "..."]}]
Un objet par plat reçu, avec le même id.`;
}

type Reponse = {
  id: string;
  nom: string;
  description: string | null;
  categorie: string;
  formats?: unknown;
};

/** Extrait le tableau JSON, même si le modèle l'a entouré de texte. */
export function extraireJson(brut: string): Reponse[] {
  const sansCloture = brut.replace(/```(?:json)?/g, "").trim();
  const debut = sansCloture.indexOf("[");
  const fin = sansCloture.lastIndexOf("]");
  if (debut === -1 || fin === -1 || fin < debut) {
    throw new Error("Réponse illisible");
  }
  const analyse = JSON.parse(sansCloture.slice(debut, fin + 1));
  if (!Array.isArray(analyse)) throw new Error("Réponse illisible");
  return analyse as Reponse[];
}

/**
 * Traduit les plats donnés et renvoie, par identifiant, la traduction à
 * enregistrer. Les plats que le modèle a oubliés sont simplement absents du
 * résultat : on préfère une carte à moitié traduite à une traduction
 * fabriquée pour combler un trou.
 */
export async function traduirePlats(
  items: MenuItem[],
  cible: Cible,
): Promise<Map<string, TraductionPlat>> {
  const resultat = new Map<string, TraductionPlat>();
  if (items.length === 0) return resultat;

  const client = new Anthropic();
  const reponse = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-opus-5",
    max_tokens: 4000,
    system: consigne(cible),
    messages: [
      {
        role: "user",
        content: JSON.stringify(
          items.map((item) => ({
            id: item.id,
            nom: item.nom,
            description: item.description,
            categorie: item.categorie,
            formats: libellesFormats(item),
          })),
        ),
      },
    ],
  });

  const texte = reponse.content
    .filter((bloc): bloc is Anthropic.TextBlock => bloc.type === "text")
    .map((bloc) => bloc.text)
    .join("");

  const traduits = extraireJson(texte);
  const parId = new Map(items.map((item) => [item.id, item]));

  for (const traduit of traduits) {
    const source = parId.get(traduit.id);
    // Un identifiant inconnu : le modèle a inventé une ligne, on la jette.
    if (!source) continue;
    if (!traduit.nom || typeof traduit.nom !== "string") continue;

    // Les formats ne sont retenus que si le modèle en a renvoyé exactement
    // autant que le plat en porte. Un de trop ou un de trop peu, et on
    // garde les libellés français : associer « by the glass » au prix de
    // la bouteille est pire que de ne pas traduire.
    const attendus = libellesFormats(source);
    const renvoyes = Array.isArray(traduit.formats)
      ? traduit.formats.map((libelle) =>
          typeof libelle === "string" ? libelle.trim() : "",
        )
      : [];
    const formats =
      attendus.length > 0 &&
      renvoyes.length === attendus.length &&
      renvoyes.every((libelle) => libelle.length > 0)
        ? renvoyes
        : attendus;

    resultat.set(source.id, {
      nom: traduit.nom.trim(),
      description:
        typeof traduit.description === "string" && traduit.description.trim()
          ? traduit.description.trim()
          : null,
      categorie:
        typeof traduit.categorie === "string" && traduit.categorie.trim()
          ? traduit.categorie.trim()
          : source.categorie,
      formats,
      source: {
        nom: source.nom,
        description: source.description,
        categorie: source.categorie,
        formats: attendus,
      },
    });
  }

  return resultat;
}
