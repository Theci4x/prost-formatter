import { noterContact } from "@/app/dashboard/[id]/clients/actions";

/**
 * Le pense-bête sur un client, éditable sur place.
 *
 * Pas de composant client : un formulaire ordinaire et une action
 * serveur suffisent, et cent lignes de tableau ne doivent pas embarquer
 * cent états React pour un champ de texte. L'enregistrement recharge la
 * page — c'est un geste rare, une fois par service au plus.
 */
export function NoteContact({
  restaurantId,
  contactId,
  note,
}: {
  restaurantId: string;
  contactId: string;
  note: string | null;
}) {
  return (
    <form action={noterContact} className="flex w-full items-center gap-2">
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input type="hidden" name="contact_id" value={contactId} />
      <input
        name="note"
        defaultValue={note ?? ""}
        placeholder="Allergies, habitudes…"
        maxLength={500}
        aria-label="Note interne"
        className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 hover:border-zinc-300 focus:border-brand-navy focus:bg-white"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-brand-navy hover:text-brand-navy"
      >
        Enregistrer
      </button>
    </form>
  );
}
