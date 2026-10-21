import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        if (alive) setFailed(true);
        return;
      }
      try {
        await ensurePatientProfile(data.user);
        const destination = safePatientDestination(sessionStorage.getItem("patient-auth-next") ?? undefined);
        sessionStorage.removeItem("patient-auth-next");
        if (alive) await navigate({ to: destination as "/dashboard", replace: true });
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => { alive = false; };
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Activity className="h-6 w-6" /></div>
        <h1 className="mt-5 font-display text-xl font-bold">{failed ? "Sign-in could not be completed" : "Finishing your sign-in…"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{failed ? "Return to the sign-in page and try again." : "Your private patient account is being prepared."}</p>
        {failed && <a href="/auth" className="mt-4 inline-block text-sm font-semibold text-primary underline">Return to sign in</a>}
      </div>
    </main>
  );
}