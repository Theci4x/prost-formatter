"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
};

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signup(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?confirm=1");
}

export type ResetState = {
  error: string | null;
  sent: boolean;
};

export async function requestPasswordReset(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = formData.get("email") as string;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/nouveau-mot-de-passe`,
  });

  if (error) {
    console.error("[requestPasswordReset]", error);
  }

  // Toujours la même réponse, que l'adresse existe ou non : sinon le
  // formulaire devient un moyen de savoir qui a un compte chez nous.
  return { error: null, sent: true };
}

export async function updatePassword(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = formData.get("password") as string;

  const supabase = await createClient();
  // Le lien reçu par e-mail a déjà ouvert une session : c'est elle qui
  // autorise ce changement.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Lien expiré. Redemande un e-mail de réinitialisation." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
