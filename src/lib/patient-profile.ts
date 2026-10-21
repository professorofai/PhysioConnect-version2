import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export async function ensurePatientProfile(user: User, preferredName?: string) {
  const fullName = preferredName?.trim() ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    user.email?.split("@")[0] || "Patient";
  const { error } = await supabase.from("profiles").upsert(
    { id: user.id, full_name: fullName },
    { onConflict: "id" },
  );
  if (error) throw error;
  return fullName;
}

export function safePatientDestination(candidate: string | undefined) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) return "/dashboard";
  return candidate;
}