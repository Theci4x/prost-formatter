import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { MenuItem, TraductionPlat } from "@/types/menu";
import { libellesFormats } from "@/lib/menu/traduction";

/**
 * Traduire une carte de restaurant en anglais.
 *
 * Deux exigences qui ne vont pas de soi pour un modèle laissé libre :
 * ne pas traduire ce qui ne se traduit pas — « Saint-Nectaire », « Côte du
 * Rhône », « steak tartare » ont un nom en anglais qui est le nom français —
 * et ne rien inventer. Une description absente reste absente : un modèle qui
 * « améliore » un plat en lui prêtant des ingrédients fait mentir la carte,
 * et sur un allergène ça ne se rattrape pas.
 */

const CONSIGNE = `Tu traduis la carte d'un restaurant français vers l'anglais, pour des clients étrangers qui la lisent à table.

Règles :
- Traduis le nom du plat, sa description et sa catégorie.
- Garde en français ce qui n'a pas de traduction : appellations (Saint-Nectaire, Comté, Côtes du Rhône), plats passés tels quels en anglais (tartare, foie gras, crème brûlée, confit), noms propres. Un nom français reconnaissable vaut mieux qu'une traduction littérale qui ne veut rien dire.
- N'invente RIEN. Si la description est absente, renvoie null. N'ajoute ni ingrédient, ni cuisson, ni accompagnement qui ne soit pas dans le texte français.
- N'ajoute pas de prix, ils sont gérés à part.
- Quand un plat porte des formats (« 6 pièces », « au verre », « grande assiette »), traduis chaque libellé, dans le même ordre, et renvoie-les dans "formats". Ce sont des quantités et des contenants, pas des noms de plats : « 6 pièces » → « 6 pieces », « à la bouteille » → « by the bottle ». Si le plat n'a pas de formats, renvoie un tableau vide.
- Reste court : une carte se lit debout, pas un roman.
- Une catégorie se traduit par son équivalent d'usage : Entrées → Starters, Plats → Main courses, Desserts → Desserts, Fromages → Cheese, Boissons → Drinks, Vins → Wine.

Réponds UNIQUEMENT par un tableau JSON, sans texte autour, de la forme :
[{"id": "...", "nom": "...", "description": "..." ou null, "categorie": "...", "formats": ["...", "..."]}]
Un objet par plat reçu, avec le même id.`;

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
): Promise<Map<string, TraductionPlat>> {
  const resultat = new Map<string, TraductionPlat>();
  if (items.length === 0) return resultat;

  const client = new Anthropic();
  const reponse = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-opus-5",
    max_tokens: 4000,
    system: CONSIGNE,
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
