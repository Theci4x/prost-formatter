"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useFormStatus } from "react-dom";
import { choisirLangueVisiteur } from "@/app/langue-actions";
import { choisirLangueJournal } from "@/app/blog/langue-actions";
import {
  CODE_LANGUE,
  langueDuNavigateur,
  LANGUES,
  NOM_LANGUE,
  type Langue,
} from "@/lib/i18n/langues";

/**
 * Le choix de langue dans la barre de la page d'accueil.
 *
 * Trois boutons côte à côte ne tenaient pas : sur un iPhone, « 中文 » se
 * cassait en deux lignes et poussait « Connexion » contre le bord. Un
 * menu ne montre qu'une chose fermé, et les trois noms ouvert.
 *
 * **Pas de drapeau.** Un drapeau désigne un pays, pas une langue, et
 * celui du chinois n'existe pas : en poser un revient à dire à un
 * restaurateur taïwanais ou hongkongais qu'on l'a rangé ailleurs. C'est
 * aussi pour ça que chaque langue s'écrit dans sa propre langue —
 * « 中文 » se reconnaît quand tout le reste de l'écran est illisible, un
 * drapeau ne se reconnaît que si on a deviné l'intention.
 *
 * Le globe, lui, ne prétend rien : c'est le signe convenu, et il tient
 * dans la largeur qu'on a.
 *
 * `journal` dit qu'on est dans le journal, où chaque langue a sa propre
 * adresse : y choisir une langue doit emmener à la page correspondante,
 * et pas seulement poser un témoin sous un texte qu'on ne lit toujours
 * pas. Ailleurs — l'accueil, l'aide —, c'est la même URL qui se
 * recalcule dans l'autre dictionnaire, et il n'y a nulle part où aller.
 *
 * `courante` est facultatif, et l'absence est un cas normal. Le journal
 * et l'aide sont pré-générés : y lire le témoin côté serveur les rendrait
 * dynamiques, et ferait perdre la génération statique des pages qui
 * portent tout le référencement du site. Là, le composant lit le témoin
 * dans le navigateur après l'hydratation, et tient son état lui-même —
 * le serveur n'ayant rien à recalculer, personne ne le ferait pour lui.
 */
export function ChoixLangueSite({
  courante,
  journal,
  action,
}: {
  courante?: Langue;
  /**
   * Dans le journal : le slug français de l'article ouvert, ou rien sur
   * un index. Sa seule présence fait changer d'adresse.
   */
  journal?: { article?: string };
  /**
   * L'action à appeler à la place du témoin seul. Le tableau de bord
   * s'en sert pour écrire aussi sur le compte, afin que le choix suive
   * la personne d'un appareil à l'autre.
   */
  action?: (langue: string) => Promise<void>;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  const autonome = courante === undefined;

  // Le témoin est un état extérieur à React : `useSyncExternalStore` est
  // fait pour ça, et il rend le français au rendu serveur — ce que la
  // page pré-générée contient de toute façon. Pas d'effet qui repose un
  // état, donc pas de rendu en cascade.
  const duTemoin = useSyncExternalStore(sabonner, lireTemoin, temoinServeur);

  // Le choix tout juste fait, avant que le témoin ne soit posé. Sans lui,
  // l'étiquette ne bougerait qu'au rechargement suivant.
  const [choisie, setChoisie] = useState<Langue | null>(null);

  const affichee = courante ?? choisie ?? duTemoin;
  // Une fonction plutôt que la référence elle-même : l'enfant n'a pas à
  // écrire dans ce qu'on lui passe, et le compilateur React le refuse.
  const fermer = useCallback(() => {
    if (menu.current) menu.current.open = false;
  }, []);

  return (
    <details ref={menu} className="relative">
      <summary
        aria-label="Langue / Language / 语言"
        className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-2 py-1.5 [&::-webkit-details-marker]:hidden"
        style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}
      >
        <Globe />
        <span className="whitespace-nowrap">{CODE_LANGUE[affichee]}</span>
      </summary>

      <form
        className="absolute right-0 z-20 mt-1 flex min-w-40 flex-col overflow-hidden rounded-xl border py-1 shadow-lg"
        style={{
          background: "var(--paper)",
          borderColor: "var(--line)",
          boxShadow: "0 18px 40px -20px oklch(20% 0.02 60 / 45%)",
        }}
      >
        <Options
          courante={affichee}
          fermer={fermer}
          journal={journal}
          action={action}
          // Sur une page pré-générée, rien ne revient du serveur : c'est
          // au composant de refléter le choix, sans quoi on croit que le
          // clic n'a rien fait et on reclique.
          surChoix={autonome ? setChoisie : undefined}
        />
      </form>
    </details>
  );
}

/**
 * Les trois entrées, et l'attente.
 *
 * Changer de langue fait un aller-retour au serveur : la page est
 * recalculée entière, dans l'autre dictionnaire. On ne peut pas
 * l'éviter sans embarquer les trois traductions dans le navigateur — ce
 * qui alourdirait la page pour tout le monde afin d'accélérer un geste
 * qu'on fait une fois. On montre donc l'attente plutôt que de la
 * supprimer : sans repère, une seconde de silence se lit comme un bouton
 * cassé, et on reclique.
 */
/** Le témoin ne prévient de rien : il n'y a rien à quoi s'abonner. */
function sabonner(): () => void {
  return () => {};
}

function lireTemoin(): Langue {
  return langueDuNavigateur() ?? "fr";
}

function temoinServeur(): Langue {
  return "fr";
}

function Options({
  courante,
  fermer,
  surChoix,
  journal,
  action,
}: {
  courante: Langue;
  fermer: () => void;
  surChoix?: (langue: Langue) => void;
  journal?: { article?: string };
  action?: (langue: string) => Promise<void>;
}) {
  const { pending } = useFormStatus();
  const [demandee, setDemandee] = useState<Langue | null>(null);

  // Le menu reste ouvert tant que ça tourne — c'est là qu'est le repère —
  // puis se referme une fois la page revenue.
  //
  // C'est le passage de « en cours » à « fini » qu'on guette, pas l'état
  // lui-même : se contenter de « rien en cours » refermerait le menu à
  // l'instant où on l'ouvre, avant même le premier clic.
  const tournait = useRef(false);
  useEffect(() => {
    if (pending) {
      tournait.current = true;
      return;
    }
    if (tournait.current) {
      tournait.current = false;
      fermer();
    }
  }, [pending, fermer]);

  return (
    <>
      {LANGUES.map((langue) => (
        <button
          key={langue}
          type="submit"
          // La langue par `bind` : le `name` d'un bouton qui porte une
          // action sert à React, pas à nous (voir `langue-actions.ts`).
          formAction={
            action
              ? action.bind(null, langue)
              : journal
                ? choisirLangueJournal.bind(
                    null,
                    journal.article ?? null,
                    langue,
                  )
                : choisirLangueVisiteur.bind(null, langue)
          }
          onClick={() => {
            setDemandee(langue);
            surChoix?.(langue);
          }}
          disabled={pending}
          aria-current={langue === courante ? "true" : undefined}
          className="flex items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors disabled:opacity-60"
          style={{
            color: langue === courante ? "var(--ink)" : "var(--ink-soft)",
            fontWeight: langue === courante ? 600 : 500,
            background:
              langue === courante ? "var(--accent-soft)" : "transparent",
          }}
        >
          <span className="whitespace-nowrap">{NOM_LANGUE[langue]}</span>
          {demandee === langue && pending ? (
            <Sablier />
          ) : (
            langue === courante && <Coche />
          )}
        </button>
      ))}
    </>
  );
}

function Globe() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
    </svg>
  );
}

function Coche() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent-dark)"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Une roue qui tourne, sans dépendre d'une feuille de style extérieure. */
function Sablier() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ flex: "none", animation: "klarr-tourne 0.8s linear infinite" }}
    >
      <path d="M21 12a9 9 0 1 1-6.2-8.5" />
    </svg>
  );
}
