import Image from "next/image";
import {
  calculer,
  formatEuros,
  formatQuantite,
  formatTaux,
  totalLigne,
} from "@/lib/devis/calcul";

/**
 * Le devis lui-même : le document que le client lit, imprime et range.
 *
 * Séparé de la page qui va le chercher en base, pour deux raisons. Il se
 * regarde sans base — donc il se vérifie. Et le restaurateur pourra voir
 * exactement ce que son client verra, sans qu'on redessine le document une
 * seconde fois à côté.
 */

export type LigneFeuille = {
  libelle: string;
  quantite: number;
  prixUnitaireCentimes: number;
  tauxTva: number;
};

export type Maison = {
  nom: string;
  adresse: string | null;
  telephone: string | null;
  logoUrl: string | null;
  mentionsLegales: string | null;
};

export type Evenement = {
  clientNom: string | null;
  couverts: number;
  date: string;
  heure: string | null;
  espaceNom: string | null;
};

function jour(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function FeuilleDevis({
  numero,
  valideJusquau,
  acompteCentimes,
  message,
  lignes,
  maison,
  evenement,
}: {
  numero: string;
  valideJusquau: string;
  acompteCentimes: number | null;
  message: string | null;
  lignes: LigneFeuille[];
  maison: Maison;
  evenement: Evenement | null;
}) {
  const totaux = calculer(lignes);

  // Un menu à 10 % et un forfait boissons à 20 % : la colonne du taux
  // n'apparaît que là. Sur un devis à taux unique, elle répéterait vingt
  // fois le même nombre pour ne rien apprendre.
  const plusieursTaux = totaux.ventilation.length > 1;

  return (
    <article className="devis-feuille flex flex-col gap-7 rounded-2xl border border-line bg-paper p-7 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-center gap-3">
          {maison.logoUrl && (
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={maison.logoUrl}
                alt=""
                fill
                sizes="48px"
                className="object-contain"
              />
            </span>
          )}
          <div className="flex flex-col">
            <span className="font-serif text-2xl text-ink">{maison.nom}</span>
            {maison.adresse && (
              <span className="text-sm text-ink-soft">{maison.adresse}</span>
            )}
            {maison.telephone && (
              <span className="text-sm text-ink-soft">{maison.telephone}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
            Devis
          </span>
          <span className="font-serif text-xl text-ink">{numero}</span>
          <span className="text-xs text-ink-soft">
            Valable jusqu&apos;au {jour(valideJusquau)}
          </span>
        </div>
      </header>

      {evenement && (
        <section className="flex flex-col gap-1">
          <h1 className="font-serif text-3xl text-ink">
            {evenement.clientNom ?? "Votre événement"}
          </h1>
          <p className="text-[15px] text-ink-soft">
            {jour(evenement.date)}
            {evenement.heure
              ? ` à ${evenement.heure.slice(0, 5).replace(":", "h")}`
              : ""}{" "}
            · {evenement.couverts} couvert{evenement.couverts > 1 ? "s" : ""}
            {evenement.espaceNom ? ` · ${evenement.espaceNom}` : ""}
          </p>
        </section>
      )}

      <section className="devis-lignes flex flex-col">
        <div className="hidden border-b border-line pb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-soft sm:flex">
          <span className="flex-1">Prestation</span>
          <span className="w-20 text-right">Qté</span>
          <span className="w-28 text-right">P.U. HT</span>
          {plusieursTaux && <span className="w-16 text-right">TVA</span>}
          <span className="w-28 text-right">Total HT</span>
        </div>
        {/* Quatre colonnes sur un écran large, comme un devis de papier.
            Au téléphone, le libellé prend sa ligne et le calcul se lit en
            dessous — « 30 × 45,00 € » d'un côté, le total de l'autre.
            `sm:contents` efface le groupe intérieur dès qu'il y a la place,
            et les colonnes se réalignent d'elles-mêmes. */}
        {lignes.map((ligne, rang) => (
          <div
            key={rang}
            className="flex flex-col gap-1 border-b border-line py-3 text-[15px] sm:flex-row sm:items-baseline sm:gap-2"
          >
            <span className="font-medium text-ink sm:flex-1">
              {ligne.libelle}
            </span>
            <div className="flex items-baseline justify-between gap-3 sm:contents">
              <span className="tabular-nums text-ink-soft sm:w-20 sm:text-right">
                <span className="sm:hidden">
                  {formatQuantite(ligne.quantite)} ×{" "}
                  {formatEuros(ligne.prixUnitaireCentimes)}
                  {plusieursTaux ? ` · TVA ${formatTaux(ligne.tauxTva)}` : ""}
                </span>
                <span className="hidden sm:inline">
                  {formatQuantite(ligne.quantite)}
                </span>
              </span>
              <span className="hidden tabular-nums text-ink-soft sm:block sm:w-28 sm:text-right">
                {formatEuros(ligne.prixUnitaireCentimes)}
              </span>
              {plusieursTaux && (
                <span className="hidden tabular-nums text-ink-soft sm:block sm:w-16 sm:text-right">
                  {formatTaux(ligne.tauxTva)}
                </span>
              )}
              <span className="font-semibold tabular-nums text-ink sm:w-28 sm:text-right">
                {formatEuros(totalLigne(ligne))}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="devis-totaux flex flex-col gap-2 self-end text-[15px] sm:w-72">
        <div className="flex justify-between text-ink-soft">
          <span>Total HT</span>
          <span className="tabular-nums">{formatEuros(totaux.htCentimes)}</span>
        </div>
        {/* La ventilation par taux, obligatoire dès qu'il y en a deux, et
            de toute façon ce que le comptable reprendra. */}
        {totaux.ventilation.map((assiette) => (
          <div
            key={assiette.taux}
            className="flex justify-between text-ink-soft"
          >
            <span>
              TVA {formatTaux(assiette.taux)}
              {plusieursTaux && (
                <span className="text-xs">
                  {" "}
                  sur {formatEuros(assiette.htCentimes)}
                </span>
              )}
            </span>
            <span className="tabular-nums">
              {formatEuros(assiette.tvaCentimes)}
            </span>
          </div>
        ))}
        <div className="flex items-baseline justify-between border-t border-line pt-2">
          <span className="font-semibold text-ink">Total TTC</span>
          <span className="font-serif text-3xl text-ink">
            {formatEuros(totaux.ttcCentimes)}
          </span>
        </div>
        {acompteCentimes && (
          <div className="flex justify-between gap-3 rounded-lg bg-brand-orange-soft px-3 py-2 text-sm">
            <span className="font-medium text-ink">
              Acompte à l&apos;acceptation
            </span>
            <span className="font-semibold tabular-nums text-ink">
              {formatEuros(acompteCentimes)}
            </span>
          </div>
        )}
      </section>

      {message && (
        <section className="whitespace-pre-line border-t border-line pt-5 text-[15px] leading-relaxed text-ink-soft">
          {message}
        </section>
      )}

      {/* Les mentions du restaurant, pas celles de Klarr : c'est lui qui
          contracte avec le client. */}
      {maison.mentionsLegales && (
        <section className="devis-mentions whitespace-pre-line border-t border-line pt-5 text-xs leading-relaxed text-ink-soft">
          {maison.mentionsLegales}
        </section>
      )}
    </article>
  );
}
