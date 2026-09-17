import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { FeuilleDevis } from "@/components/devis/FeuilleDevis";
import { ReponseDevis } from "@/components/devis/ReponseDevis";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { decidable, formatEuros, type StatutDevis } from "@/lib/devis/calcul";

export const metadata: Metadata = {
  title: "Votre devis",
  // Un devis nominatif n'a rien à faire dans un moteur de recherche.
  robots: { index: false, follow: false },
};

type LigneBrute = {
  libelle: string;
  quantite: number;
  prix_unitaire_centimes: number;
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
      .select("libelle, quantite, prix_unitaire_centimes")
      .eq("devis_id", devis.id)
      .order("ordre"),
    supabase
      .from("restaurant_reservations")
      .select("client_nom, couverts, date_reservation, heure_arrivee, espace_id")
      .eq("id", devis.reservation_id)
      .maybeSingle(),
    supabase
      .from("restaurants")
      .select("nom, adresse, telephone, logo_url, mentions_legales")
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

  const verdict = decidable(devis, new Date());

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream print:bg-white">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10 print:max-w-none print:py-0">
        <FeuilleDevis
          numero={devis.numero}
          valideJusquau={devis.valide_jusquau}
          tauxTva={Number(devis.tva_taux)}
          acompteCentimes={devis.acompte_centimes}
          message={devis.message}
          lignes={lignes.map((ligne) => ({
            libelle: ligne.libelle,
            quantite: Number(ligne.quantite),
            prixUnitaireCentimes: ligne.prix_unitaire_centimes,
          }))}
          maison={{
            nom: maison.nom,
            adresse: maison.adresse,
            telephone: maison.telephone,
            logoUrl: maison.logo_url,
            mentionsLegales: maison.mentions_legales,
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

        {verdict.possible ? (
          <ReponseDevis
            jeton={jeton}
            acompte={
              devis.acompte_centimes ? formatEuros(devis.acompte_centimes) : null
            }
          />
        ) : (
          <p className="rounded-2xl border border-line bg-paper p-5 text-sm text-ink-soft print:hidden">
            {verdict.motif}
          </p>
        )}

        <SignatureKlarr texte="Devis propulsé par" className="print:hidden" />
      </main>
    </div>
  );
}
