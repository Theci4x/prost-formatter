import "server-only";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import { echapper, enveloppe, type Bloc } from "@/lib/courriel/messages";
import { createServiceClient } from "@/lib/supabase/service";

export type AuditPourAlerte = {
  statut: string;
  ecarts: string[];
  note: number | null;
  nombreAvis: number | null;
};

type RestaurantPourAlerte = {
  id: string;
  nom: string;
  proprietaire_id: string;
  email_contact?: string | null;
};

export function estIncoherenceCritique(audit: AuditPourAlerte): boolean {
  return audit.statut === "inaccessible" || audit.ecarts.some((ecart) =>
    ["nom", "adresse", "telephone"].includes(ecart.toLocaleLowerCase("fr-FR")),
  );
}

/**
 * Envoie au propriétaire une seule alerte par état constaté. Le même problème
 * retrouvé le mois suivant reste visible dans le dashboard mais ne renvoie pas
 * un email identique ; un nouvel état, lui, peut à nouveau prévenir.
 */
export async function alerterIncoherenceCritique({
  supabase,
  restaurant,
  plateforme,
  url,
  audit,
}: {
  supabase: ReturnType<typeof createServiceClient>;
  restaurant: RestaurantPourAlerte;
  plateforme: string;
  url: string;
  audit: AuditPourAlerte;
}): Promise<boolean> {
  if (!estIncoherenceCritique(audit)) return false;

  const empreinte = [
    audit.statut,
    [...audit.ecarts].sort().join(","),
    audit.note ?? "",
    audit.nombreAvis ?? "",
  ].join("|");
  const cle = `presence-critique:${restaurant.id}:${plateforme}:${empreinte}`;
  const { error: reserve } = await supabase
    .from("notifications_internes")
    .insert({ cle });
  if (reserve) return false;

  const { data: compte } = await supabase.auth.admin.getUserById(
    restaurant.proprietaire_id,
  );
  const destinataire = compte?.user?.email ?? restaurant.email_contact ?? null;
  if (!destinataire) {
    console.warn("[presence/alerte] propriétaire sans email", restaurant.id);
    await supabase.from("notifications_internes").delete().eq("cle", cle);
    return false;
  }

  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.klarr.net"}/dashboard/${restaurant.id}/presence#${plateforme}`;
  const resultat = audit.statut === "inaccessible"
    ? {
        titre: `La fiche ${plateforme} est inaccessible`,
        detail: "Klarr n’a pas pu ouvrir la page publique enregistrée.",
      }
    : {
        titre: `La fiche ${plateforme} ne correspond plus`,
        detail: `Champ(s) à vérifier : ${audit.ecarts.join(", ")}.`,
      };
  const chiffres = audit.note != null || audit.nombreAvis != null
    ? `Note relevée : ${audit.note ?? "—"}/5 · ${audit.nombreAvis ?? "—"} avis.`
    : "Aucune note lisible n’a été relevée.";
  const blocs: Bloc[] = [
    resultat.titre,
    { encadre: [restaurant.nom, resultat.detail, chiffres] },
    { bouton: { libelle: "Ouvrir le suivi dans Klarr", url: dashboardUrl } },
    `URL contrôlée : ${url}`,
  ];
  const texte = [
    `Klarr — ${resultat.titre}`,
    "",
    restaurant.nom,
    resultat.detail,
    chiffres,
    "",
    `Ouvrir le suivi : ${dashboardUrl}`,
  ].join("\n");
  const envoi = await envoyerCourriel({
    destinataire,
    sujet: `Klarr — incohérence critique sur ${plateforme}`,
    texte,
    html: enveloppe(blocs, "Klarr"),
  });
  if (!envoi.envoye) {
    // L'alerte pourra être retentée au prochain passage si l'email a échoué.
    await supabase.from("notifications_internes").delete().eq("cle", cle);
    return false;
  }
  return true;
}
