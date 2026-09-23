"use client";

import { useEffect } from "react";

/**
 * Ouvre le dialogue d'impression dès que la feuille est affichée.
 *
 * On arrive ici en touchant « Exporter en PDF » : faire toucher un
 * second bouton pour la même intention, c'est un geste de trop. Le
 * court délai laisse aux polices le temps d'arriver — sans lui, le PDF
 * sort parfois avec la police de secours.
 */
export function ImpressionAuto() {
  useEffect(() => {
    const minuteur = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(minuteur);
  }, []);
  return null;
}
