"use client";

import { deleteRestaurant } from "@/app/dashboard/actions";

export function DeleteRestaurantButton({
  id,
  libelle,
  confirmation,
}: {
  id: string;
  libelle: string;
  confirmation: string;
}) {
  return (
    <form
      action={deleteRestaurant}
      onSubmit={(event) => {
        if (!confirm(confirmation)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:text-red-800"
      >
        {libelle}
      </button>
    </form>
  );
}
