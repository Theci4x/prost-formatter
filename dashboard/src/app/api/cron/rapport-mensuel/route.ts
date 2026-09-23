import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { jetonValide } from "@/lib/limites/publiques";
import { chargerAcces } from "@/lib/abonnement/acces";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import {
  calculerRapport,
  periodeDuRapport,
  rendreRapport,
} from "@/lib/rapport/mensuel";

/**
 * Le rapport du mois, le 1er au matin.
 *
 * La tâche tourne les trois premiers jours du mois : un envoi raté le 1er
 * — fournisseur en panne, fonction coupée — repart le lendemain. Le
 * journal `restaurant_rapports` garantit qu'aucun restaurateur ne le
 * reçoit deux fois : la ligne est posée avant l'envoi, et retirée si
 * l'envoi échoue, pour laisser la place à la tentative suivante.
 *
 * Qui le reçoit : le propriétaire, à l'adresse de son compte Klarr — pas
 * l'adresse de contact publique, qui est souvent celle de la salle. Pas
 * les établissements sans aucun module ouvert (essai fini, rien de payé),
 * ni ceux créés après la fin du mois raconté : ils n'ont rien à lire.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Un garde-fou par passage ; le reste part le lendemain. */
const PLAFOND = 150;

type Ligne = {
  id: string;
  nom: string;
  proprietaire_id: string;
  created_at: string;
  email_contact: string | null;
  rapport_mensuel?: boolean | null;
  photo_couverture_id?: string | null;
  site_publie?: boolean | null;
  carte_publique?: boolean | null;
  google_statut?: string | null;
  fiche_modifiee_le?: string | null;
  tripadvisor_location_id?: string | null;
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/rapport-mensuel] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const maintenant = new Date();
  const periode = periodeDuRapport(maintenant);

  // Sans le journal (migration 0082), rien ne protège du triple envoi :
  // on n'envoie rien plutôt que trois fois.
  const { data: dejaEnvoyes, error: erreurJournal } = await supabase
    .from("restaurant_rapports")
    .select("restaurant_id")
    .eq("mois", periode.mois);
  if (erreurJournal) {
    console.error("[cron/rapport-mensuel] journal", erreurJournal.message);
    return NextResponse.json(
      { error: "journal des rapports indisponible (migration 0082 ?)" },
      { status: 500 },
    );
  }
  const envoyes = new Set(
    ((dejaEnvoyes ?? []) as { restaurant_id: string }[]).map(
      (ligne) => ligne.restaurant_id,
    ),
  );

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .lte("created_at", `${periode.fin}T23:59:59Z`)
    .order("created_at");
  if (error) {
    console.error("[cron/rapport-mensuel] restaurants", error.message);
    return NextResponse.json({ error: "lecture impossible" }, { status: 500 });
  }

  const aTraiter = ((data ?? []) as Ligne[])
    .filter((r) => r.rapport_mensuel !== false && !envoyes.has(r.id))
    .slice(0, PLAFOND);

  let envoyesCeTour = 0;
  let ignores = 0;
  let echecs = 0;

  for (const restaurant of aTraiter) {
    try {
      const acces = await chargerAcces(restaurant.id, supabase);
      if (!Object.values(acces.ouvert).some(Boolean)) {
        ignores++;
        continue;
      }

      const { data: compte } = await supabase.auth.admin.getUserById(
        restaurant.proprietaire_id,
      );
      const destinataire =
        compte?.user?.email ?? restaurant.email_contact ?? null;
      if (!destinataire) {
        ignores++;
        continue;
      }

      // La place d'abord : deux passages simultanés ne peuvent pas tous
      // deux la prendre, la clé primaire tranche.
      const { error: reserve } = await supabase
        .from("restaurant_rapports")
        .insert({
          restaurant_id: restaurant.id,
          mois: periode.mois,
          destinataire,
        });
      if (reserve) {
        ignores++;
        continue;
      }

      const rapport = await calculerRapport(
        supabase,
        restaurant,
        periode,
        maintenant,
      );
      const message = rendreRapport(rapport);
      const resultat = await envoyerCourriel({
        destinataire,
        sujet: message.sujet,
        texte: message.texte,
        html: message.html,
      });

      if (resultat.envoye) {
        envoyesCeTour++;
      } else {
        echecs++;
        // Rendue, la place laisse la tentative de demain réessayer.
        await supabase
          .from("restaurant_rapports")
          .delete()
          .eq("restaurant_id", restaurant.id)
          .eq("mois", periode.mois);
      }
    } catch (cause) {
      echecs++;
      console.error("[cron/rapport-mensuel]", restaurant.id, cause);
      await supabase
        .from("restaurant_rapports")
        .delete()
        .eq("restaurant_id", restaurant.id)
        .eq("mois", periode.mois);
    }
  }

  return NextResponse.json({
    mois: periode.mois,
    candidats: aTraiter.length,
    envoyes: envoyesCeTour,
    ignores,
    echecs,
  });
}
