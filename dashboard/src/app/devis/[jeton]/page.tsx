import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { FeuilleDevis } from "@/components/devis/FeuilleDevis";
import { ReponseDevis } from "@/components/devis/ReponseDevis";
import { BoutonImprimer } from "@/components/devis/BoutonImprimer";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { decidable, formatEuros, type StatutDevis } from "@/lib/devis/calcul";
import { langueVisiteur } from "@/lib/i18n/langue";
import { DEVIS } from "@/lib/i18n/devis";

// Un devis nominatif n'a rien à faire dans un moteur de recherche.
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: DEVIS[await langueVisiteur()].votreDevis,
    robots: { index: false, follow: false },
  };
}

type LigneBrute = {
  libelle: string;
  quantite: number;
  prix_unitaire_centimes: number;
  tva_taux: number;
};

type Devis = {
  id: string;
  restaurant_id: string;
  reservation_id: string;
  numero: string;
  statut: StatutDevis;
  message: string | null;
  tva_taux: number;
  acompte_centimes: number | null;
  valide_jusquau: string;
  envoye_le: string | null;
  /** Les mentions figées à l'envoi. Nulles sur un devis d'avant la 0057. */
  mentions: string | null;
};

type Reservation = {
  client_nom: string | null;
  couverts: number;
  date_reservation: string;
  heure_arrivee: string | null;
  espace_id: string | null;
};

export default async function DevisPublicPage({
  params,
}: {
  params: Promise<{ jeton: string }>;
}) {
  const { jeton } = await params;
  const langue = await langueVisiteur();
  const d = DEVIS[langue];
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("devis")
    .select("*")
    .eq("jeton", jeton)
    .maybeSingle();

  // Une requête refusée renvoie elle aussi « aucune ligne » : sans cette
  // trace, une colonne manquante ressemblerait à un mauvais lien.
  if (error) console.error("[devis/jeton]", error.message);
  const devis = data as Devis | null;
  // Un brouillon n'a pas d'existence pour le client : le lien n'ouvre rien
  // tant que le restaurateur n'a pas envoyé.
  if (!devis || devis.statut === "brouillon") notFound();

  const [lignesResult, resaResult, maisonResult] = await Promise.all([
    supabase
      .from("devis_lignes")
      .select("libelle, quantite, prix_unitaire_centimes, tva_taux")
      .eq("devis_id", devis.id)
      .order("ordre"),
    supabase
      .from("restaurant_reservations")
      .select(
        "client_nom, couverts, date_reservation, heure_arrivee, espace_id",
      )
      .eq("id", devis.reservation_id)
      .maybeSingle(),
    supabase
      .from("restaurants")
      .select(
        "nom, adresse, telephone, logo_url, mentions_legales, devis_mentions",
      )
      .eq("id", devis.restaurant_id)
      .maybeSingle(),
  ]);

  const lignes = (lignesResult.data ?? []) as LigneBrute[];
  const reservation = resaResult.data as Reservation | null;
  const maison = maisonResult.data as {
    nom: string;
    adresse: string | null;
    telephone: string | null;
    logo_url: string | null;
    mentions_legales: string | null;
    devis_mentions: string | null;
  } | null;
  if (!maison) notFound();

  const espace = reservation?.espace_id
    ? ((
        await supabase
          .from("restaurant_espaces")
          .select("nom")
          .eq("id", reservation.espace_id)
          .maybeSingle()
      ).data as { nom: string } | null)
    : null;

  const verdict = decidable(devis, new Date(), langue);

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream print:bg-white">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10 print:max-w-none print:py-0">
        <FeuilleDevis
          numero={devis.numero}
          valideJusquau={devis.valide_jusquau}
          acompteCentimes={devis.acompte_centimes}
          message={devis.message}
          lignes={lignes.map((ligne) => ({
            libelle: ligne.libelle,
            quantite: Number(ligne.quantite),
            prixUnitaireCentimes: ligne.prix_unitaire_centimes,
            tauxTva: Number(ligne.tva_taux),
          }))}
          maison={{
            nom: maison.nom,
            adresse: maison.adresse,
            telephone: maison.telephone,
            logoUrl: maison.logo_url,
            // Ce qui a été envoyé prime sur ce que la maison affiche
            // aujourd'hui : le client relit ce qu'il a accepté. Les
            // mentions de la page de réservation ne servent qu'aux devis
            // établis avant qu'on ne les distingue.
            mentionsLegales:
              devis.mentions ??
              maison.devis_mentions ??
              maison.mentions_legales,
          }}
          evenement={
            reservation
              ? {
                  clientNom: reservation.client_nom,
                  couverts: reservation.couverts,
                  date: reservation.date_reservation,
                  heure: reservation.heure_arrivee,
                  espaceNom: espace?.nom ?? null,
                }
              : null
          }
        />

        {/* La feuille ci-dessus reste en français : c'est la pièce
            contractuelle, celle qu'on opposera si quelque chose se
            discute. On le dit au lecteur plutôt que de le laisser croire
            à une traduction oubliée — et tout ce qu'il a à faire, en
            dessous, est dans sa langue. */}
        {d.documentEnFrancais && (
          <p className="text-sm text-ink-soft print:hidden">
            {d.documentEnFrancais}
          </p>
        )}

        {/* Un client fait souvent signer le devis par quelqu'un d'autre :
            son conjoint, son comité d'entreprise, son patron. Il lui faut
            donc un document à emporter, pas seulement une page. */}
        <div className="flex flex-wrap gap-3 print:hidden">
          <BoutonImprimer libelle={d.imprimerOuPdf} />
        </div>

        {verdict.possible ? (
          <ReponseDevis
            jeton={jeton}
            acompte={
              devis.acompte_centimes
                ? formatEuros(devis.acompte_centimes)
                : null
            }
            langue={langue}
          />
        ) : (
          <p className="rounded-2xl border border-line bg-paper p-5 text-sm text-ink-soft print:hidden">
            {verdict.motif}
          </p>
        )}

        <SignatureKlarr texte={d.signatureDevis} className="print:hidden" />
      </main>
    </div>
  );
}
