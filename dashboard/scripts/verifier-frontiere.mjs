import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * La frontière entre le serveur et le client.
 *
 * React sérialise les propriétés qu'un composant serveur passe à un
 * composant client : des chaînes, des nombres, des objets simples. Pas du
 * code. Or nos dictionnaires en contiennent — « 1 couvert » et « 2
 * couverts » ne s'accordent pas seuls, il faut une fonction pour compter.
 *
 * Passer un dictionnaire à un composant marqué « use client » lève donc
 * une erreur, et elle ne se voit **ni à la compilation ni à la
 * construction** : tout est bien typé, tout construit, et l'écran tombe
 * en panne chez le restaurateur. C'est arrivé au carnet de réservation,
 * qui est resté cassé plusieurs jours.
 *
 * La règle est simple : un composant client ne reçoit pas de
 * dictionnaire, il reçoit la langue et va chercher le sien. Un composant
 * serveur, lui, fait ce qu'il veut — rien n'est sérialisé entre deux
 * composants serveur.
 *
 * Ce script vérifie cette règle. Il est volontairement bête : il lit le
 * texte des fichiers. Une analyse fine se tromperait plus souvent qu'elle
 * ne nous sauverait.
 */

const RACINE = "src";
const PROPRIETE = /^\s*([a-zA-Z][a-zA-Z0-9]*)\s*\??:\s*(Cles[A-Za-z]+)\s*;/gm;

function fichiers(dossier) {
  const trouves = [];
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) trouves.push(...fichiers(chemin));
    else if (chemin.endsWith(".tsx")) trouves.push(chemin);
  }
  return trouves;
}

const fautes = [];

for (const chemin of fichiers(RACINE)) {
  const texte = readFileSync(chemin, "utf8");
  // La directive doit être en tête du fichier pour compter.
  if (!/^\s*["']use client["']/.test(texte)) continue;

  for (const trouvaille of texte.matchAll(PROPRIETE)) {
    const ligne = texte.slice(0, trouvaille.index).split("\n").length;
    fautes.push({
      chemin,
      ligne,
      propriete: trouvaille[1],
      type: trouvaille[2],
    });
  }
}

if (fautes.length > 0) {
  console.error(
    `\nLa frontière serveur/client est franchie ${fautes.length} fois :\n`,
  );
  for (const faute of fautes) {
    console.error(
      `  ${faute.chemin}:${faute.ligne}\n` +
        `    « ${faute.propriete}: ${faute.type} » sur un composant client.\n` +
        `    Ce dictionnaire contient des fonctions ; React ne sait pas les\n` +
        `    faire traverser. Prends « langue: Langue » et va chercher le\n` +
        `    dictionnaire dans le composant.\n`,
    );
  }
  process.exit(1);
}

console.log("Frontière serveur/client : aucun dictionnaire ne la franchit.");
