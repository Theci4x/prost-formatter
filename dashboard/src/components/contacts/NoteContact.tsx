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
    <form action={noterContact} className="flex items-center gap-1.5">
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input type="hidden" name="contact_id" value={contactId} />
      <input
        name="note"
        defaultValue={note ?? ""}
        placeholder="Allergies, habitudes…"
        maxLength={500}
        aria-label="Note interne"
        className="w-48 rounded-md border border-transparent bg-zinc-50 px-2 py-1 text-xs outline-none transition-colors hover:border-zinc-200 focus:border-brand-navy focus:bg-white"
      />
      <button
        type="submit"
        className="text-xs font-medium text-zinc-400 transition-colors hover:text-brand-navy"
      >
        OK
      </button>
    </form>
  );
}
