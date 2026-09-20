import { createServiceClient } from "@/lib/supabase/service";
import { notifierInterne } from "@/lib/notifications/interne";
import {
  adresseIp,
  consommer,
  empreinte,
  RAPPELS_PAR_JOUR,
  secretEmpreinte,
} from "@/lib/limites/publiques";
import { siteUrl } from "@/lib/site-url";

/**
 * « Rappelez-moi » — laissé depuis le Commis, sur le site public.
 *
 * C'est la porte de prospection de Klarr : quelqu'un lit le journal ou la
 * page d'accueil, pose deux questions à l'assistant, et veut parler à un
 * humain. Le délai est tout : rappelé dans les dix minutes il est
 * impressionné, rappelé le soir il est perdu. D'où Slack, qui sonne.
 *
 * **Rien n'est enregistré dans Klarr.** Ni ici, ni dans une table de
 * prospects. Les coordonnées partent vers la messagerie de l'équipe et
 * vers Slack, exactement comme les demandes d'aide — et c'est ce que la
 * politique de confidentialité annonce déjà pour ces échanges-là. Une
 * base de prospects de plus serait une base de plus à protéger, à purger
 * et à déclarer, pour une information qu'on traite en dix minutes.
 *
 * **Ce n'est pas le modèle qui décide.** L'assistant ne « détecte » pas
 * une intention de contact et ne recopie aucune coordonnée depuis la
 * conversation : c'est un formulaire, que la personne remplit. Un
 * consentement se donne, il ne se devine pas — et une adresse tapée par
 * son propriétaire est la seule qui soit sûrement juste.
 */
export const dynamic = "force-dynamic";

function texte(message: string, statut = 200): Response {
  return new Response(message, {
    status: statut,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Ce qu'on accepte d'un champ libre, avant de l'écrire dans un e-mail. */
function champ(brut: unknown, max = 120): string {
  return typeof brut === "string" ? brut.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let corps: unknown;
  try {
    corps = await request.json();
  } catch {
    return texte("Requête illisible.", 400);
  }

  const nom = champ((corps as { nom?: unknown })?.nom);
  const etablissement = champ(
    (corps as { etablissement?: unknown })?.etablissement,
  );
  const email = champ((corps as { email?: unknown })?.email).toLowerCase();
  const telephone = champ((corps as { telephone?: unknown })?.telephone, 30);
  // La dernière question posée à l'assistant : c'est elle qui dit de quoi
  // parler en rappelant. Le formulaire annonce qu'elle est jointe.
  const question = champ((corps as { question?: unknown })?.question, 500);

  if (!nom) return texte("Indiquez votre nom.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return texte("Cette adresse e-mail ne semble pas valide.", 400);
  }

  const entetes = request.headers;
  const visiteur = empreinte(
    "rappel",
    adresseIp(entetes),
    entetes.get("user-agent") ?? "",
    secretEmpreinte(),
  );
  if (!(await consommer(createServiceClient(), visiteur, RAPPELS_PAR_JOUR))) {
    return texte(
      "Nous avons déjà votre demande. On vous rappelle très vite.",
      429,
    );
  }

  const bilan = await notifierInterne({
    titre: `Rappel demandé — ${etablissement || nom}`,
    lignes: [
      nom,
      email,
      telephone || "Pas de téléphone laissé.",
      etablissement
        ? `Établissement : ${etablissement}`
        : "Établissement non précisé.",
      "",
      question
        ? `Sa dernière question : « ${question} »`
        : "Aucune question posée avant.",
      "",
      `Depuis le Commis, sur ${siteUrl()}`,
    ],
    repondreA: email,
  });

  // Un prospect qui se perd est pire qu'un formulaire absent : on le dit
  // plutôt que d'afficher un merci mensonger.
  if (bilan.courriels === 0 && !bilan.slack) {
    return texte("L'envoi a échoué. Écrivez-nous à contact@klarr.net.", 502);
  }

  return texte("ok");
}
