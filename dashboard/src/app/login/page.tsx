import { LoginForm } from "@/components/auth/LoginForm";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string }>;
}) {
  const { confirm } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <KlarrMark size={40} />
        <h1 className="flex items-baseline gap-2 text-2xl font-semibold text-zinc-900">
          <KlarrWordmark />
          <span className="text-zinc-400">— connexion</span>
        </h1>
        <p className="max-w-sm text-sm text-zinc-500">
          Connecte-toi ou crée un compte pour accéder au dashboard.
        </p>
      </div>

      {confirm && (
        <p className="max-w-sm rounded-md bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
          Compte créé ! Vérifie tes emails pour confirmer ton adresse avant de
          te connecter.
        </p>
      )}

      <LoginForm />
    </div>
  );
}
