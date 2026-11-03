import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export async function ensurePatientProfile(
  user: User,
  preferredName?: string,
  preferredGender?: string,
) {
  const fullName =
    preferredName?.trim() ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    user.email?.split("@")[0] ||
    "Patient";

  const gender =
    preferredGender ||
    (typeof user.user_metadata?.gender === "string" ? user.user_metadata.gender : null);

  if (gender && typeof window !== "undefined") {
    localStorage.setItem("physio_patient_gender", gender);
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName }, { onConflict: "id" });
    if (error) {
      console.warn("ensurePatientProfile upsert error (non-fatal):", error);
    }

    if (gender && user.user_metadata?.gender !== gender) {
      await supabase.auth.updateUser({
        data: { gender },
      });
    }
  } catch (err) {
    console.warn("ensurePatientProfile exception (non-fatal):", err);
  }
  return fullName;
}

export function safePatientDestination(candidate: string | undefined) {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) return "/dashboard";
  return candidate;
}
