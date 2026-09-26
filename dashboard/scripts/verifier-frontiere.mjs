import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * La frontière entre le serveur et le client.
 *
 * Deux règles, et toutes deux ont déjà coûté cher. Elles ont en commun de
 * n'être vues **ni par TypeScript ni par la construction** : tout est bien
 * typé, tout construit, et l'écran tombe en panne chez le restaurateur.
 *
 * Ce script est volontairement bête : il lit le texte des fichiers. Une
 * analyse fine se tromperait plus souvent qu'elle ne nous sauverait.
 */

const RACINE = "src";

function fichiers(dossier) {
  const trouves = [];
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) trouves.push(...fichiers(chemin));
    else if (chemin.endsWith(".ts") || chemin.endsWith(".tsx")) {
      trouves.push(chemin);
    }
  }
  return trouves;
}

const ligneDe = (texte, index) => texte.slice(0, index).split("\n").length;

const fautes = [];

/**
 * Règle 1 — un composant client ne reçoit pas de dictionnaire.
 *
 * React sérialise les propriétés qu'un composant serveur passe à un
 * composant client : des chaînes, des nombres, des objets simples. Pas du
 * code. Or nos dictionnaires en contiennent — « 1 couvert » et « 2
 * couverts » ne s'accordent pas seuls, il faut une fonction pour compter.
 *
 * Le carnet de réservation est resté cassé plusieurs jours à cause de ça.
 * Un composant client prend « langue: Langue » et va chercher le sien.
 */
const PROPRIETE_DICTIONNAIRE =
  /^\s*([a-zA-Z][a-zA-Z0-9]*)\s*\??:\s*(Cles[A-Za-z]+)\s*;/gm;

/**
 * Règle 2 — un fichier « use server » n'exporte que des fonctions async.
 *
 * Le reste — une constante, une fonction ordinaire, une classe — n'arrive
 * pas de l'autre côté tel qu'on l'a écrit : ça devient une référence vers
 * le serveur. Parfois la construction échoue et on comprend tout de suite ;
 * parfois elle passe, et c'est pire. Une constante d'état initial ainsi
 * transformée donne un objet dont les champs valent `undefined`, un bouton
 * désactivé pour toujours, et pas une ligne dans la console.
 *
 * Trois fois sur ce dépôt : `FORMATS_INITIAL`, `RETRAIT_INITIAL`,
 * `JEU_INITIAL`. La troisième a coûté une session de test devant une roue
 * qui refusait de tourner.
 *
 * `export type` et `export {}` sont effacés à la compilation : ils passent.
 */
const EN_TETE_SERVEUR = /^\s*(\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use server["']/;
const EXPORT_NON_ASYNC = /^export\s+(?!type\b|default\s+async\b|async\b|\{)(\w+)/gm;

for (const chemin of fichiers(RACINE)) {
  const texte = readFileSync(chemin, "utf8");

  if (/^\s*["']use client["']/.test(texte)) {
    for (const t of texte.matchAll(PROPRIETE_DICTIONNAIRE)) {
      fautes.push({
        genre: "dictionnaire",
        chemin,
        ligne: ligneDe(texte, t.index),
        propriete: t[1],
        type: t[2],
      });
    }
  }

  if (EN_TETE_SERVEUR.test(texte)) {
    for (const t of texte.matchAll(EXPORT_NON_ASYNC)) {
      fautes.push({
        genre: "serveur",
        chemin,
        ligne: ligneDe(texte, t.index),
        extrait: texte.slice(t.index).split("\n")[0].slice(0, 70),
      });
    }
  }
}

if (fautes.length > 0) {
  console.error(`\nLa frontière serveur/client est franchie ${fautes.length} fois :\n`);
  for (const faute of fautes) {
    if (faute.genre === "serveur") {
      console.error(
        `  ${faute.chemin}:${faute.ligne}\n` +
          `    ${faute.extrait}\n` +
          `    Un fichier « use server » ne peut exporter que des fonctions\n` +
          `    asynchrones. Le reste devient une référence vers le serveur —\n` +
          `    parfois sans que rien n'échoue, ce qui est pire. Sors cette\n` +
          `    déclaration dans un module ordinaire.\n`,
      );
    } else {
      console.error(
        `  ${faute.chemin}:${faute.ligne}\n` +
          `    « ${faute.propriete}: ${faute.type} » sur un composant client.\n` +
          `    Ce dictionnaire contient des fonctions ; React ne sait pas les\n` +
          `    faire traverser. Prends « langue: Langue » et va chercher le\n` +
          `    dictionnaire dans le composant.\n`,
      );
    }
  }
  process.exit(1);
}

console.log("Frontière serveur/client : rien ne la franchit indûment.");
