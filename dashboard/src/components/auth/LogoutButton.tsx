import { signOut } from "@/app/login/actions";

export function LogoutButton({ libelle }: { libelle: string }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
      >
        {libelle}
      </button>
    </form>
  );
}
