"use server";

import { createClient } from "@/lib/supabase/server";

export type ProspectFormState = {
  status: "idle" | "success" | "error";
  error?: "missing" | "generic";
};

export async function submitProspect(
  _prevState: ProspectFormState,
  formData: FormData,
): Promise<ProspectFormState> {
  const prenom = (formData.get("prenom") as string)?.trim();
  const nom = (formData.get("nom") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const telephone = (formData.get("telephone") as string)?.trim();
  const entreprise = (formData.get("entreprise") as string)?.trim();

  if (!prenom || !nom || !email || !telephone || !entreprise) {
    return { status: "error", error: "missing" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("prospects").insert({
    prenom,
    nom,
    email,
    telephone,
    entreprise,
  });

  if (error) {
    console.error("[submitProspect]", error);
    return { status: "error", error: "generic" };
  }

  return { status: "success" };
}
