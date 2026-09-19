import "server-only";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import { enveloppe, texteNu, type Bloc } from "@/lib/courriel/messages";
import { formater, type ActionPrioritaire } from "@/lib/audit/actions";
import type { PresenceIa } from "@/lib/audit/ia";
import { translations, type Lang } from "@/lib/i18n/testPresence";

/**
 * Le rapport d'audit, envoyé à celui qui l'a demandé.
 *
 * Jusqu'ici le résultat s'affichait à l'écran et nulle part ailleurs :
 * l'onglet fermé, il ne restait rien au restaurateur. Il avait laissé son
 * téléphone, vu son score, et n'avait pas de quoi le relire le lendemain
 * ni le montrer à son associé.
 *
 * Ce n'est pas de la prospection : il est venu chercher ce rapport, et la
 * page le lui a promis en toutes lettres — « vos coordonnées servent
 * uniquement à vous transmettre ce test ». On livre ce qui a été annoncé.
 * Une relance commerciale, elle, demanderait un consentement distinct.
 *
 * Comme tout envoi dans ce fichier : ne lève jamais. Un rapport qui ne
 * part pas ne doit pas effacer le prospect qu'on vient d'enregistrer.
 */

function ligneIa(presence: PresenceIa): string[] {
  const cite = presence.cite
    ? presence.rang
      ? `Vous êtes cité en position ${presence.rang}.`
      : "Vous êtes cité dans la réponse."
    : "Vous n'apparaissez pas dans la réponse.";
  const concurrents =
    !presence.cite && presence.concurrents.length > 0
      ? `L'IA cite à votre place : ${presence.concurrents.join(", ")}.`
      : "";
  return [`« ${presence.question} »`, cite, concurrents].filter(Boolean);
}

export async function envoyerRapportAuProspect({
  destinataire,
  prenom,
  etablissement,
  score,
  label,
  piliers,
  actions,
  presenceIa,
  lienEssai,
  langue,
}: {
  destinataire: string;
  prenom: string;
  etablissement: string;
  score: number;
  label: string;
  piliers: { localSeo: number; eReputation: number; geo: number };
  actions: ActionPrioritaire[];
  presenceIa?: PresenceIa;
  lienEssai: string;
  /** Celle dans laquelle la page a été lue : le rapport la suit. */
  langue: Lang;
}) {
  const t = translations[langue];
  // Trois actions au plus : un courriel qui en liste huit ne se lit pas,
  // et les suivantes attendront de toute façon les premières.
  const retenues = actions.slice(0, 3);

  const blocs: Bloc[] = [
    `Bonjour ${prenom},`,
    `Voici le résultat du test de présence en ligne de ${etablissement}, tel qu'il s'est affiché après votre demande.`,
    {
      encadre: [
        `Score global : ${score}/100 (${label})`,
        `Fiche Google : ${piliers.localSeo}/100`,
        `Avis : ${piliers.eReputation}/100`,
        `Présence IA : ${piliers.geo}/100`,
      ],
    },
  ];

  if (presenceIa) {
    blocs.push(
      "Ce qu'une IA répond aujourd'hui à un client qui cherche un restaurant comme le vôtre :",
      { encadre: ligneIa(presenceIa) },
    );
  }

  if (retenues.length > 0) {
    blocs.push(
      retenues.length > 1
        ? "Les points à regarder en premier :"
        : "Le point à regarder en premier :",
    );
    for (const action of retenues) {
      const texte = t.audit.actions[action.cle];
      // Le constat porte des valeurs mesurées ({n}, {total}, {hote}) :
      // sans `formater`, le lecteur verrait les accolades telles quelles.
      blocs.push({
        encadre: [texte.titre, formater(texte.constat, action.valeurs)],
      });
    }
  }

  blocs.push(
    "Ces points se corrigent seuls, sans nous — et c'est le mieux à faire. Si vous préférez les traiter depuis un seul écran, Klarr est gratuit pendant trente jours, sans carte bancaire.",
    { bouton: { libelle: "Essayer Klarr", url: lienEssai } },
    "Et si vous voulez qu'on regarde ces résultats ensemble, répondez simplement à ce message.",
  );

  const signature = "L'équipe Klarr";

  return envoyerCourriel({
    destinataire,
    sujet: `Votre test de présence en ligne — ${etablissement} : ${score}/100`,
    html: enveloppe(blocs, signature),
    texte: texteNu(blocs, signature),
  });
}
