import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import { DesabonnementClient } from "@/components/contacts/DesabonnementClient";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";

// Un lien personnel, envoyé par e-mail : il n'a rien à faire dans un
// moteur de recherche.
export const metadata: Metadata = {
  title: "Me désinscrire",
  robots: { index: false, follow: false },
};

export default async function DesabonnementPage({
  params,
}: {
  params: Promise<{ jeton: string }>;
}) {
  const { jeton } = await params;

  // Lecture avec la clé de service : la personne n'a pas de compte, le
  // jeton est ce qui l'autorise. On ne lit que de quoi lui dire de quoi
  // elle se désinscrit — son adresse et la maison. Ni ses venues, ni son
  // téléphone, ni la note que le restaurateur a prise sur elle.
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurant_contacts")
    .select("email, desabonne_le, restaurants(nom)")
    .eq("jeton", jeton)
    .maybeSingle();

  const contact = data as {
    email: string;
    desabonne_le: string | null;
    restaurants: { nom: string } | null;
  } | null;
  const maison = contact?.restaurants?.nom ?? "l'établissement";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-cream px-6 py-16">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
        <h1 className="font-serif text-3xl text-ink">Me désinscrire</h1>

        {!contact ? (
          // Le même message pour un lien inventé et pour un lien périmé :
          // rien ne doit permettre de deviner qu'une adresse figure dans
          // le fichier d'un restaurant.
          <p className="text-sm leading-relaxed text-zinc-600">
            Ce lien n&apos;est plus valide. Si vous continuez de recevoir des
            messages, répondez-y directement : l&apos;adresse de réponse est
            celle de l&apos;établissement.
          </p>
        ) : contact.desabonne_le ? (
          <p className="text-sm leading-relaxed text-zinc-600">
            <strong>{contact.email}</strong> est déjà désinscrite des actualités
            de {maison}. Il n&apos;y a rien de plus à faire.
          </p>
        ) : (
          <DesabonnementClient
            jeton={jeton}
            restaurantNom={maison}
            email={contact.email}
          />
        )}
      </div>

      <SignatureKlarr texte="Envois propulsés par" />
    </div>
  );
}
