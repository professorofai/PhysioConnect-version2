import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import physioLogo from "@/assets/Physio.png";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ensurePatientProfile, safePatientDestination } from "@/lib/patient-profile";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: z.object({ next: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Patient sign in — PhysioConnect" },
      {
        name: "description",
        content:
          "Sign in or create a patient account to manage your assessments, bookings, and recovery.",
      },
      { property: "og:title", content: "Patient sign in — PhysioConnect" },
      { property: "og:description", content: "Secure patient accounts for physiotherapy care." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md space-y-4 rounded-2xl border bg-card p-8 shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold">Sign In Error</h1>
        <p className="text-sm text-muted-foreground">
          {error?.message || "There was a problem loading the sign in page."}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={() => reset()} variant="outline">
            Try again
          </Button>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  ),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [googleDirectEmail, setGoogleDirectEmail] = useState("");
  const destination = safePatientDestination(next);

  const supabaseUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
    "https://zcflvdwlxenheuitpguc.supabase.co";
  const supabaseCallbackUrl = `${supabaseUrl}/auth/v1/callback`;

  const finishSignIn = async (
    user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]>,
  ) => {
    try {
      await ensurePatientProfile(user, mode === "signup" ? name : undefined);
    } catch (e) {
      console.warn("Profile creation non-fatal error:", e);
    }
    if (typeof window !== "undefined") {
      window.location.href = destination;
    }
  };

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user && alive && typeof window !== "undefined") {
          window.location.href = destination;
        }
      } catch (e) {
        console.warn("Session check error (non-fatal):", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [destination]);


  const submitEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          data: mode === "signup" ? { full_name: name.trim() } : undefined,
        },
      });
      if (error) throw error;
      setStep("otp");
      toast.success("Verification code sent", {
        description: `We sent a 6-digit code to ${email.trim()}.`,
      });
    } catch (err: any) {
      console.error("Supabase OTP send error:", err);
      toast.error("Could not send code", {
        description: err?.message || "Please check your email and try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDirectGoogleEmailSignIn = async (targetEmail: string) => {
    const clean = targetEmail.trim();
    if (!clean || !clean.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setEmail(clean);
    setShowGoogleModal(false);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: clean,
        options: {
          data: mode === "signup" ? { full_name: name.trim() } : undefined,
        },
      });
      if (error) throw error;
      setStep("otp");
      toast.success("Verification code sent to your Google mail ID", {
        description: `Enter the 6-digit code sent to ${clean}.`,
      });
    } catch (err: any) {
      console.error("Direct Google sign-in OTP error:", err);
      toast.error("Could not send verification code", {
        description: err?.message || "Please verify your email and try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (tokenToVerify: string) => {
    const cleanToken = tokenToVerify.trim();
    if (busy || !cleanToken || cleanToken.length < 6) return;
    setBusy(true);
    try {
      let { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanToken,
        type: "email",
      });
      if (error) {
        const signupFallback = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: cleanToken,
          type: "signup",
        });
        if (!signupFallback.error && signupFallback.data?.user) {
          data = signupFallback.data;
          error = null;
        }
      }
      if (error) throw error;
      if (!data?.user) throw new Error("Unable to verify your account.");
      await finishSignIn(data.user);
    } catch (err: any) {
      console.error("verifyOtp error:", err);
      toast.error("Invalid code", {
        description: err?.message || "The code you entered is incorrect or has expired.",
      });
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await verifyCode(otp);
  };

  const signInWithGoogle = async () => {
    setGoogleBusy(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("patient-auth-next", destination);
    }

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "/auth/callback";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
      // Note: In browser, Supabase redirects window automatically to Google login
    } catch (err: any) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("patient-auth-next");
      }
      setGoogleBusy(false);
      console.error("Google sign-in error:", err);

      const msg = err?.message || "";
      if (msg.includes("provider is not enabled") || err?.code === "validation_failed") {
        setGoogleDirectEmail(email || "");
        setShowGoogleModal(true);
        toast.info("Google OAuth provider setup required", {
          description: "Follow the setup guide or sign in directly with your Google mail ID.",
        });
      } else {
        toast.error("Google sign-in is unavailable", {
          description: msg || "Please try signing in directly with your email.",
        });
      }
    }
  };

  const copyCallbackUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(supabaseCallbackUrl);
      setCopiedCallback(true);
      toast.success("Callback URL copied to clipboard!");
      setTimeout(() => setCopiedCallback(false), 2000);
    }
  };


  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3 font-display text-xl font-bold">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-elegant">
            <img
              src={physioLogo}
              alt="Physio Connect Logo"
              className="h-full w-full object-cover"
            />
          </div>
          PhysioConnect
        </Link>
        <div className="max-w-lg pb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
            Care that follows your progress
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight">
            Your recovery journey, all in one place.
          </h2>
          <p className="mt-4 text-primary-foreground/80 leading-relaxed">
            Keep your assessments, reports, upcoming visits, and progress together in a private
            patient account.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">Private patient access · PhysioConnect</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-elegant">
              <img
                src={physioLogo}
                alt="Physio Connect Logo"
                className="h-full w-full object-cover"
              />
            </div>
            PhysioConnect
          </Link>

          {step === "email" ? (
            <>
              <div className="mt-10 lg:mt-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Patient account
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {mode === "signin"
                    ? "Sign in with your Google mail ID or email to view your care and recovery."
                    : "Your assessments and bookings stay safely linked to you."}
                </p>
              </div>

              {/* Direct One-Click Google Sign-In Button */}
              <div className="mt-8 space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 flex items-center justify-center gap-3 border-border hover:bg-muted/60 transition-all font-medium text-foreground shadow-sm"
                  onClick={signInWithGoogle}
                  disabled={busy || googleBusy}
                >
                  {googleBusy ? (
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Connecting to Google…
                    </span>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </>
                  )}
                </Button>

                <div className="relative my-6 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  <span>or sign in with email / Google mail ID</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </div>

              <form onSubmit={submitEmail} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="patient-name">Full name</Label>
                    <Input
                      id="patient-name"
                      autoComplete="name"
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="patient-email">Google Mail ID / Email</Label>
                    <span className="text-[11px] text-muted-foreground">
                      Any @gmail.com or email
                    </span>
                  </div>
                  <Input
                    id="patient-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busy || !email}
                  className="w-full h-11 bg-gradient-hero shadow-elegant"
                >
                  {busy ? "Sending 6-digit code…" : "Send direct login code"}{" "}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </form>

              <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Tip: Entering your Google mail ID sends an instant 6-digit verification code
                  directly to your Gmail inbox.
                </span>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New to PhysioConnect?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          ) : (
            <div className="mt-10 lg:mt-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep("email")}
                className="-ml-3 mb-4 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <h1 className="font-display text-3xl font-bold">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to{" "}
                {mode === "signin" ? "sign in" : "create your account"}.
              </p>

              <form onSubmit={submitOtp} className="mt-8 space-y-8">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      if (val.length === 6 && !busy) {
                        void verifyCode(val);
                      }
                    }}
                    autoFocus
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  type="submit"
                  disabled={busy || otp.length < 6}
                  className="w-full h-11 bg-gradient-hero shadow-elegant"
                >
                  {busy ? "Verifying…" : "Verify and sign in"}{" "}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </form>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Back to PhysioConnect
            </Link>
          </p>
        </div>
      </section>

      {/* Google Setup & Direct Gmail Modal */}
      <Dialog open={showGoogleModal} onOpenChange={setShowGoogleModal}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <GoogleIcon />
              </div>
              <div>
                <DialogTitle className="text-xl">Sign in with Google Mail</DialogTitle>
                <DialogDescription className="text-xs">
                  Direct login with your Google account
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Quick direct sign-in with Google Mail ID */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>Instant Sign In with Google Mail ID</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your Gmail address below to immediately receive a 6-digit verification code
                directly in your inbox:
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={googleDirectEmail}
                  onChange={(e) => setGoogleDirectEmail(e.target.value)}
                  className="bg-background text-sm"
                />
                <Button
                  type="button"
                  onClick={() => handleDirectGoogleEmailSignIn(googleDirectEmail)}
                  className="bg-primary text-primary-foreground shrink-0 text-xs px-4"
                >
                  Send code
                </Button>
              </div>
            </div>

            {/* How to enable 1-Click OAuth in Supabase */}
            <div className="rounded-xl border border-dashed p-4 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>To enable 1-Click Google OAuth</span>
                </div>
                <a
                  href="https://supabase.com/dashboard/project/zcflvdwlxenheuitpguc/auth/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  Open Supabase <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                <li>
                  Open your{" "}
                  <strong>Supabase Dashboard &gt; Authentication &gt; Providers &gt; Google</strong>
                  .
                </li>
                <li>
                  Toggle <strong>"Enable Google"</strong> to ON.
                </li>
                <li>
                  In Google Cloud Console, set this <strong>Authorized Redirect URI</strong>:
                </li>
              </ol>

              <div className="flex items-center gap-2 rounded-lg bg-muted p-2 font-mono text-[11px] text-foreground">
                <span className="truncate flex-1 select-all">{supabaseCallbackUrl}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={copyCallbackUrl}
                  className="h-7 px-2 shrink-0 text-xs"
                >
                  {copiedCallback ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
