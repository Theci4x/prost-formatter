import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Commis } from "@/components/commis/Commis";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { BandeauInstallation } from "@/components/dashboard/BandeauInstallation";
import { LiaisonCoupee } from "@/components/dashboard/LiaisonCoupee";
import { lireSession } from "@/lib/supabase/session";
import { langueUtilisateur } from "@/lib/i18n/langue";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const verdict = await lireSession(supabase);

  // Le proxy protège déjà /dashboard ; cette vérification serveur est une
  // deuxième ligne de défense (défense en profondeur).
  if (verdict.etat === "deconnecte") {
    redirect("/login?motif=ecran_tableau_de_bord");
  }

  // Injoignable : on le dit, et on ne rend surtout pas les écrans en
  // dessous — sans utilisateur, ils n'auraient rien à montrer et
  // tomberaient en panne un par un.
  if (verdict.etat === "indecidable") {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-brand-cream">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200/70 bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
          <Link
            href="/dashboard"
            className="-mx-2 flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-zinc-100 active:bg-zinc-200"
          >
            <KlarrMark size={22} />
            <KlarrWordmark className="text-lg text-zinc-900" />
          </Link>
        </header>
        <main className="flex flex-1 flex-col">
          <LiaisonCoupee
            langue={await langueUtilisateur()}
            chemin="/dashboard"
          />
        </main>
      </div>
    );
  }

  const user = verdict.user;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-brand-cream">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200/70 bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
        {/* Le logo ramène à la liste des établissements.
            C'est le geste que tout le monde tente en premier pour
            « revenir » — sur un téléphone il n'y a pas de barre
            d'adresse, et le bouton retour du navigateur n'existe pas
            dans une application installée. Un logo qui ne fait rien
            oblige à ressortir de l'écran par où on y est entré.
            `active:` en plus de `hover:` : un écran tactile n'a pas de
            survol, et sans retour au doigt on croit avoir raté sa
            cible et on tape deux fois. */}
        <Link
          href="/dashboard"
          className="-mx-2 flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-zinc-100 active:bg-zinc-200"
        >
          <KlarrMark size={22} />
          <KlarrWordmark className="text-lg text-zinc-900" />
        </Link>
        <div className="flex items-center gap-4">
          {/* L'aide se cherche au moment où l'on bloque, pas après : elle
              doit être atteignable depuis n'importe quel écran. */}
          <Link
            href="/aide"
            className="text-sm text-zinc-500 transition-colors hover:text-brand-navy"
          >
            Aide
          </Link>
          <span className="hidden text-sm text-zinc-500 sm:inline">
            {user.email}
          </span>
          <LogoutButton />
        </div>
      </header>
      {/* Sous l'en-tête, au-dessus du travail : visible sans couvrir quoi
          que ce soit, et absent dès que Klarr est installé. */}
      <BandeauInstallation />
      <main className="flex flex-1 flex-col">{children}</main>
      <Commis connecte />
    </div>
  );
}
