import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le middleware protege deja /dashboard ; cette verification serveur est
  // une deuxieme ligne de defense (defense en profondeur).
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#FAF7F0]">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200/70 bg-white/90 px-6 py-4 shadow-sm backdrop-blur">
        <span className="flex items-center gap-2">
          <KlarrMark size={22} />
          <KlarrWordmark className="text-lg text-zinc-900" />
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
