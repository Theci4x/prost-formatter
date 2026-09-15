import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { LoginIllustration } from "@/components/brand/LoginIllustration";

export const metadata: Metadata = {
  title: "Nouveau mot de passe — Klarr",
};

export default async function NewPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <div className="hidden md:flex md:w-2/5">
        <LoginIllustration />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-4 py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex flex-col items-center gap-3 md:hidden">
            <KlarrMark size={40} />
            <KlarrWordmark className="text-2xl text-zinc-900" />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Nouveau mot de passe
          </h1>
        </div>

        {user ? (
          <NewPasswordForm />
        ) : (
          <div className="flex w-full max-w-sm flex-col gap-4 text-center">
            <p className="rounded-md bg-orange-50 px-4 py-3 text-sm text-orange-800">
              Ce lien n&apos;est plus valable. Les liens de réinitialisation
              expirent au bout d&apos;une heure et ne servent qu&apos;une fois.
            </p>
            <Link
              href="/mot-de-passe-oublie"
              className="text-sm font-medium text-brand-navy hover:underline"
            >
              Demander un nouveau lien
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
