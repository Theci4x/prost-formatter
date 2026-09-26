"use client";

import { useActionState } from "react";
import type { Langue } from "@/lib/i18n/langues";
import { CARTE } from "@/lib/i18n/carte";
import { ajouterPlat, type MenuState } from "@/app/dashboard/[id]/menu/actions";
import {
  CATEGORIES_SUGGEREES,
  MENU_VIDE,
  type MenuValeurs,
} from "@/types/menu";

const initialState: MenuState = {
  error: null,
  rendu: 0,
  valeurs: MENU_VIDE,
};

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

function Champs({
  restaurantId,
  categories,
  valeurs,
  langue,
}: {
  restaurantId: string;
  categories: string[];
  valeurs: MenuValeurs;
  langue: Langue;
}) {
  const c = CARTE[langue];
  // Les catégories déjà utilisées d'abord : on complète une carte plus
  // souvent qu'on n'en commence une.
  const propositions = [
    ...categories,
    ...CATEGORIES_SUGGEREES.filter(
      (suggestion) =>
        !categories.some(
          (existante) => existante.toLowerCase() === suggestion.toLowerCase(),
        ),
    ),
  ];

  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Le champ a toujours été libre — c'est un champ texte avec des
            suggestions, pas une liste fermée. Mais le navigateur lui dessine
            un chevron identique à celui d'un menu déroulant, et un
            restaurateur qui voit six entrées et un chevron conclut, à juste
            titre, qu'il n'a le choix qu'entre les six. L'étiquette, l'aide et
            l'exemple disent maintenant ce que le champ sait faire : c'était
            la seule chose qui manquait. */}
        <label className={label} htmlFor="plat-categorie">
          {c.champCategorie}{" "}
          <span className="font-normal text-zinc-400">{c.categorieLibre}</span>
          <input
            id="plat-categorie"
            name="categorie"
            list="categories-carte"
            required
            defaultValue={valeurs.categorie}
            placeholder={c.placeholderCategorie}
            className={champ}
          />
          <datalist id="categories-carte">
            {propositions.map((categorie) => (
              <option key={categorie} value={categorie} />
            ))}
          </datalist>
          <span className="text-sm font-normal text-zinc-500">
            {c.aideCategorie}
          </span>
        </label>
        <label className={label} htmlFor="plat-nom">
          {c.champPlat}
          <input
            id="plat-nom"
            name="nom"
            required
            defaultValue={valeurs.nom}
            placeholder={c.placeholderPlat}
            className={champ}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label className={label} htmlFor="plat-description">
          {c.champDescription}{" "}
          <span className="font-normal text-zinc-400">{c.facultatif}</span>
          <input
            id="plat-description"
            name="description"
            defaultValue={valeurs.description}
            placeholder={c.placeholderDescription}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="plat-prix">
          {c.champPrix}{" "}
          <span className="font-normal text-zinc-400">{c.prixVide}</span>
          <input
            id="plat-prix"
            name="prix"
            inputMode="decimal"
            defaultValue={valeurs.prix}
            placeholder={c.placeholderPrix}
            className={champ}
          />
        </label>
      </div>
    </>
  );
}

export function PlatForm({
  restaurantId,
  categories,
  langue,
}: {
  restaurantId: string;
  categories: string[];
  langue: Langue;
}) {
  const c = CARTE[langue];
  const [state, action, pending] = useActionState(ajouterPlat, initialState);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
    >
      {/* Voir EspaceForm : React vide le formulaire après l'action, la clé le
          remonte avec les valeurs renvoyées. */}
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        categories={categories}
        valeurs={state.valeurs}
        langue={langue}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? c.ajoutEnCours : c.ajouterALaCarte}
      </button>
    </form>
  );
}
