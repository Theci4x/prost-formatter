"use client";

import { useEffect } from "react";
import type { LangueJournal } from "@/types/blog";

/**
 * L'attribut `lang` de la page, sur les versions traduites.
 *
 * Il ne s'écrit qu'ici. La balise `<html>` est rendue par la mise en page
 * racine, une seule pour tout le site : lui faire lire la langue de la
 * page demanderait de connaître l'adresse côté serveur, donc de rendre
 * chaque page à la demande — et le journal perdrait sa génération
 * statique, qui est tout ce qui le fait remonter.
 *
 * Ce n'est pas un détail d'étiquette. `lang="fr"` au-dessus d'un texte
 * chinois fait lire ce texte à un lecteur d'écran avec la prononciation
 * française : illisible. Le corriger après l'hydratation le corrige pour
 * celui qui écoute, et pour les robots qui exécutent le script ; le
 * balisage `hreflang`, lui, est posé côté serveur et ne dépend pas de ça.
 */
export function LangueDocument({ langue }: { langue: LangueJournal }) {
  useEffect(() => {
    const avant = document.documentElement.lang;
    document.documentElement.lang = langue;
    return () => {
      document.documentElement.lang = avant;
    };
  }, [langue]);

  return null;
}
