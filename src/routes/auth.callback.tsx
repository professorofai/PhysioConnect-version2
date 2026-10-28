import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensurePatientProfile, safePatientDestination } from "@/lib/patient-profile";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Finishing sign in — PhysioConnect" },
      { name: "description", content: "Completing secure patient account sign-in." },
      { property: "og:title", content: "Finishing sign in — PhysioConnect" },
      { property: "og:description", content: "Completing secure patient account sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          const code = url.searchParams.get("code");
          const errorDescription =
            url.searchParams.get("error_description") || url.searchParams.get("error");

          if (errorDescription) {
            throw new Error(errorDescription);
          }

          // Exchange PKCE authorization code for a session
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.error("Supabase code exchange error:", exchangeError);
              throw exchangeError;
            }
          }
        }

        // Retrieve active session / user
        const { data: sessionData } = await supabase.auth.getSession();
        let user = sessionData.session?.user;

        if (!user) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData?.user) {
            throw userError || new Error("No authenticated session found.");
          }
          user = userData.user;
        }

        // Ensure patient profile is created/synced
        await ensurePatientProfile(user);

        const destination = safePatientDestination(
          sessionStorage.getItem("patient-auth-next") ?? undefined,
        );
        sessionStorage.removeItem("patient-auth-next");

        if (alive) {
          // Hard navigation to guarantee clean session hydration across layouts
          window.location.href = destination;
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        if (alive) {
          setErrorMessage(err?.message || "Sign-in could not be completed.");
          setFailed(true);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Activity className="h-7 w-7 animate-pulse" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold">
          {failed ? "Sign-in could not be completed" : "Finishing your sign-in…"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {failed
            ? errorMessage || "Return to the sign-in page and try again."
            : "Your private patient account is being prepared. You will be redirected to your dashboard in a moment."}
        </p>
        {failed && (
          <a
            href="/auth"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Return to sign in
          </a>
        )}
      </div>
    </main>
  );
}
