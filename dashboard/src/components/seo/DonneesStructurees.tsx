/**
 * Le bloc JSON-LD d'une page. Isolé dans un composant pour que l'échappement
 * soit fait au même endroit partout : un nom de plat contenant « </script> »
 * couperait la page en deux sans cette précaution.
 */
export function DonneesStructurees({
  donnees,
}: {
  donnees: Record<string, unknown> | null;
}) {
  if (!donnees) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(donnees).replace(/</g, "\\u003c"),
      }}
    />
  );
}
