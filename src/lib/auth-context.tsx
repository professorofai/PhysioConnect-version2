import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PatientGender = "female" | "male" | "other";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  gender: PatientGender | null;
  displayName: string;
  avatarUrl: string | null;
  preferCartoon: boolean;
  updateGender: (newGender: PatientGender) => Promise<void>;
  setPreferCartoon: (prefer: boolean) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  gender: null,
  displayName: "Patient",
  avatarUrl: null,
  preferCartoon: false,
  updateGender: async () => {},
  setPreferCartoon: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState<PatientGender | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("physio_patient_gender");
      if (saved === "female" || saved === "male" || saved === "other") return saved;
    }
    return null;
  });
  const [preferCartoon, setPreferCartoonState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("physio_prefer_cartoon") === "true";
    }
    return false;
  });
  const [displayName, setDisplayName] = useState<string>("Patient");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const extractUserInfo = useCallback(async (activeUser: User | null) => {
    if (!activeUser) {
      setDisplayName("Patient");
      setAvatarUrl(null);
      return;
    }

    // 1. Google Avatar or metadata avatar
    const metaAvatar =
      (typeof activeUser.user_metadata?.avatar_url === "string"
        ? activeUser.user_metadata.avatar_url
        : null) ||
      (typeof activeUser.user_metadata?.picture === "string"
        ? activeUser.user_metadata.picture
        : null);
    setAvatarUrl(metaAvatar);

    // 2. Name from metadata or email
    let resolvedName =
      (typeof activeUser.user_metadata?.full_name === "string" && activeUser.user_metadata.full_name) ||
      (typeof activeUser.user_metadata?.name === "string" && activeUser.user_metadata.name) ||
      "";

    // 3. Gender from metadata
    let resolvedGender: PatientGender | null =
      (activeUser.user_metadata?.gender as PatientGender) || null;

    // 4. Try fetching profile table and recent assessment if gender is missing
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (profile?.full_name && !resolvedName) {
        resolvedName = profile.full_name;
      }

      if (!resolvedGender) {
        const { data: latestAssessment } = await supabase
          .from("assessment_submissions")
          .select("gender")
          .eq("user_id", activeUser.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestAssessment?.gender) {
          const g = latestAssessment.gender.toLowerCase();
          if (g === "female" || g === "male" || g === "other") {
            resolvedGender = g;
          }
        }
      }
    } catch (e) {
      console.warn("Non-fatal profile fetch warning:", e);
    }

    if (!resolvedName && activeUser.email) {
      resolvedName = activeUser.email.split("@")[0];
    }
    setDisplayName(resolvedName || "Patient");

    if (resolvedGender) {
      setGender(resolvedGender);
      if (typeof window !== "undefined") {
        localStorage.setItem("physio_patient_gender", resolvedGender);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    await extractUserInfo(data.user);
  }, [extractUserInfo]);

  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!alive) return;
        setUser(data.user);
        await extractUserInfo(data.user);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    let unsubscribe: (() => void) | undefined;
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!alive) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await extractUserInfo(currentUser);
        if (event === "INITIAL_SESSION") {
          setLoading(false);
        }
      });
      unsubscribe = () => authListener?.subscription?.unsubscribe();
    } catch (err) {
      console.warn("Supabase auth listener setup error:", err);
    }

    return () => {
      alive = false;
      if (unsubscribe) unsubscribe();
    };
  }, [extractUserInfo]);

  const updateGender = async (newGender: PatientGender) => {
    setGender(newGender);
    if (typeof window !== "undefined") {
      localStorage.setItem("physio_patient_gender", newGender);
    }

    if (user) {
      try {
        await supabase.auth.updateUser({
          data: { gender: newGender },
        });
      } catch (err) {
        console.warn("Unable to sync gender to auth user metadata:", err);
      }
    }
    toast.success("Avatar updated", {
      description: `Switched avatar to ${newGender} cartoon character.`,
    });
  };

  const setPreferCartoon = (prefer: boolean) => {
    setPreferCartoonState(prefer);
    if (typeof window !== "undefined") {
      localStorage.setItem("physio_prefer_cartoon", String(prefer));
    }
    toast.success(prefer ? "Cartoon avatar enabled" : "Google account photo restored", {
      description: prefer
        ? "Displaying cartoon avatar based on your gender."
        : "Displaying your Gmail / Google account photo.",
    });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setDisplayName("Patient");
      setAvatarUrl(null);
      toast.success("Signed out successfully");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("Sign out error:", err);
      toast.error("Could not sign out", { description: err?.message });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        gender,
        displayName,
        avatarUrl,
        preferCartoon,
        updateGender,
        setPreferCartoon,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function usePatientAuth() {
  return useContext(AuthContext);
}
