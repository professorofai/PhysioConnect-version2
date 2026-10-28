import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // During server-side execution, do NOT redirect to avoid ejecting authenticated clients
    if (typeof window === "undefined") {
      return { user: null as unknown as User };
    }

    try {
      // 1. Check local session first (instant, synchronous from localStorage)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        return { user: sessionData.session.user };
      }

      // 2. Fall back to getUser() in case session is being restored/refreshed
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData.user) {
        throw redirect({
          to: "/auth",
          search: { next: location.pathname + location.search },
        });
      }

      return { user: userData.user };
    } catch (err: any) {
      // If it's already a TanStack redirect, re-throw it
      if (err?.isRedirect || err?.to) throw err;
      throw redirect({
        to: "/auth",
        search: { next: location.pathname + location.search },
      });
    }
  },
  component: () => <Outlet />,
});
