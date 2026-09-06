"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "restaurant-photos";

export async function uploadPhoto(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return;

  const supabase = await createClient();

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${restaurantId}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("[uploadPhoto]", uploadError);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  await supabase.from("restaurant_photos").insert({
    restaurant_id: restaurantId,
    storage_path: path,
    url: publicUrl,
  });

  revalidatePath(`/dashboard/${restaurantId}/photos`);
}

export async function removePhoto(formData: FormData) {
  const id = formData.get("id") as string;
  const restaurantId = formData.get("restaurant_id") as string;
  const storagePath = formData.get("storage_path") as string;

  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
  await supabase.from("restaurant_photos").delete().eq("id", id);

  revalidatePath(`/dashboard/${restaurantId}/photos`);
}
