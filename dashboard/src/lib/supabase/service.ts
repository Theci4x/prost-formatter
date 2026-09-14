import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * La clé de service, sous l'un ou l'autre de ses noms. Supabase a rebaptisé
 * « service_role key » en « secret key » ; les deux circulent encore, dans
 * la documentation comme dans les tableaux de bord. Accepter les deux évite
 * qu'une page publique tombe parce que la variable porte l'ancien nom.
 */
function cleDeService(): string {
  const cle =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!cle) {
    // Sans ce message, @supabase/supabase-js répond « supabaseKey is
    // required », qui ne dit pas laquelle ni où la mettre.
    throw new Error(
      "Clé de service Supabase absente : renseigne SUPABASE_SERVICE_ROLE_KEY " +
        "(ou SUPABASE_SECRET_KEY) dans les variables d'environnement.",
    );
  }
  return cle;
}

/**
 * Client avec la clé de service : il passe outre les règles d'accès (RLS).
 * Réservé à ce qui s'exécute hors contexte utilisateur authentifié — la page
 * de réservation publique, les pages de paiement, le webhook Stripe. Chaque
 * appelant doit donc vérifier lui-même ce qu'il a le droit de lire.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    cleDeService(),
    { auth: { persistSession: false } },
  );
}
