import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { LoginIllustration } from "@/components/brand/LoginIllustration";

export const metadata: Metadata = {
  title: "Mot de passe oublié — Klarr",
};

export default function ForgotPasswordPage() {
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
            Mot de passe oublié
          </h1>
          <p className="max-w-sm text-sm text-zinc-500">
            Indique ton adresse e-mail : on t&apos;envoie un lien pour en
            choisir un nouveau.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
