"use client";

import { useActionState, useState } from "react";
import {
  chercherSurTripadvisor,
  epinglerTripadvisor,
  type RechercheState,
} from "@/app/dashboard/[id]/avis/actions";
import type { Langue } from "@/lib/i18n/langues";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { AVIS } from "@/lib/i18n/pages/avis";

const initial: RechercheState = { candidats: null, error: null };

/**
 * « Ce n'est pas mon établissement. »
 *
 * Klarr retrouve l'établissement en cherchant son nom et son adresse.
 * C'est juste la plupart du temps, et ça ne demande rien au restaurateur
 * — d'où le choix de ne pas imposer une connexion là où une devinette
 * suffit. Mais deux « Le Bistrot » dans la même ville, et l'écran affiche
 * la note du voisin sans que personne ne s'en doute.
 *
 * Le lien reste donc discret tant que tout va bien, et devient la seule
 * chose visible quand rien n'a été trouvé.
 */
export function ConfirmationTripadvisor({
  restaurantId,
  nomTrouve,
  requeteInitiale,
  epingle,
  langue,
}: {
  restaurantId: string;
  langue: Langue;
  /** Le nom de l'établissement retenu, ou null si rien n'a été trouvé. */
  nomTrouve: string | null;
  requeteInitiale: string;
  epingle: boolean;
}) {
  const t = traducteur(langue, AVIS, COMMUN);
  const [ouvert, setOuvert] = useState(false);
  const [state, chercher, cherchePending] = useActionState(
    chercherSurTripadvisor,
    initial,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-100 pt-3">
      {!ouvert && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {nomTrouve ? (
            <span className="text-zinc-500">
              {epingle ? t("Confirmé") : t("Trouvé automatiquement")}
              {langue === "fr" ? " : " : langue === "zh" ? "：" : ": "}
              <span className="font-medium text-zinc-700">{nomTrouve}</span>
            </span>
          ) : (
            <span className="text-zinc-500">
              {t("Aucun établissement associé.")}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOuvert(true)}
            className="font-medium text-brand-navy underline underline-offset-2"
          >
            {nomTrouve ? t("Ce n'est pas mon établissement") : t("Le chercher")}
          </button>
        </div>
      )}

      {ouvert && (
        <div className="flex flex-col gap-3">
          <form action={chercher} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="restaurant_id" value={restaurantId} />
            <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-medium text-zinc-700">
              {t("Cherche ton établissement")}
              <input
                name="requete"
                defaultValue={requeteInitiale}
                placeholder={t("Nom du restaurant et ville")}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
              />
            </label>
            <button
              type="submit"
              disabled={cherchePending}
              className="rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
            >
              {cherchePending ? t("Recherche…") : t("Chercher")}
            </button>
          </form>

          {state.error && (
            <p className="text-xs text-red-600" role="alert">
              {t(state.error)}
            </p>
          )}

          {state.candidats && state.candidats.length > 0 && (
            <ul className="flex flex-col gap-1">
              {state.candidats.map((candidat) => (
                <li key={candidat.locationId}>
                  <form action={epinglerTripadvisor}>
                    <input
                      type="hidden"
                      name="restaurant_id"
                      value={restaurantId}
                    />
                    <input
                      type="hidden"
                      name="location_id"
                      value={candidat.locationId}
                    />
                    <button
                      type="submit"
                      className="w-full rounded-md border border-zinc-200 px-3 py-2 text-left transition-colors hover:border-brand-navy"
                    >
                      <span className="block text-sm font-medium text-zinc-900">
                        {candidat.name}
                      </span>
                      {/* L'adresse est ce qui sépare deux homonymes : sans
                          elle, la liste ne se choisit pas. */}
                      {candidat.adresse && (
                        <span className="block text-xs text-zinc-500">
                          {candidat.adresse}
                        </span>
                      )}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="text-zinc-500 underline underline-offset-2"
            >
              {t("Annuler")}
            </button>
            {epingle && (
              <form action={epinglerTripadvisor}>
                <input
                  type="hidden"
                  name="restaurant_id"
                  value={restaurantId}
                />
                <input type="hidden" name="location_id" value="" />
                <button
                  type="submit"
                  className="text-zinc-500 underline underline-offset-2"
                >
                  {t("Revenir à la recherche automatique")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
