import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import physioLogo from "@/assets/Physio.png";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { ensurePatientProfile, safePatientDestination } from "@/lib/patient-profile";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ next: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Patient sign in — PhysioConnect" },
      { name: "description", content: "Sign in or create a patient account to manage your assessments, bookings, and recovery." },
      { property: "og:title", content: "Patient sign in — PhysioConnect" },
      { property: "og:description", content: "Secure patient accounts for physiotherapy care." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
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
  const destination = safePatientDestination(next);

  const finishSignIn = async (user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]>) => {
    await ensurePatientProfile(user, mode === "signup" ? name : undefined);
    await navigate({ to: destination as "/dashboard", replace: true });
  };

  const submitEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: mode === "signup" ? { full_name: name.trim() } : undefined,
        },
      });
      if (error) throw error;
      setStep("otp");
      toast.success("Verification code sent", {
        description: `We sent a 6-digit code to ${email}.`,
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

  const verifyCode = async (tokenToVerify: string) => {
    const cleanToken = tokenToVerify.trim();
    if (busy || !cleanToken || cleanToken.length < 6) return;
    setBusy(true);
    try {
      let { data, error } = await supabase.auth.verifyOtp({
        email,
        token: cleanToken,
        type: 'email',
      });
      if (error) {
        const signupFallback = await supabase.auth.verifyOtp({
          email,
          token: cleanToken,
          type: 'signup',
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
    sessionStorage.setItem("patient-auth-next", destination);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      sessionStorage.removeItem("patient-auth-next");
      toast.error("Google sign-in is unavailable", { description: "Please try email instead." });
    }
  };

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3 font-display text-xl font-bold">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-elegant">
            <img src={physioLogo} alt="Physio Connect Logo" className="h-full w-full object-cover" />
          </div>
          PhysioConnect
        </Link>
        <div className="max-w-lg pb-8">
          <p className="text-sm font-semibold uppercase">Care that follows your progress</p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight">Your recovery journey, all in one place.</h2>
          <p className="mt-4 text-primary-foreground/80">Keep your assessments, reports, upcoming visits, and progress together in a private patient account.</p>
        </div>
        <p className="text-sm text-primary-foreground/70">Private patient access · PhysioConnect</p>
      </section>
      
      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-elegant">
              <img src={physioLogo} alt="Physio Connect Logo" className="h-full w-full object-cover" />
            </div>
            PhysioConnect
          </Link>
          
          {step === "email" ? (
            <>
              <div className="mt-10 lg:mt-0">
                <p className="text-sm font-semibold uppercase text-primary">Patient account</p>
                <h1 className="mt-2 font-display text-3xl font-bold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to view your care and recovery." : "Your assessments and bookings stay linked to you."}</p>
              </div>

              <form onSubmit={submitEmail} className="mt-8 space-y-5">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="patient-name">Full name</Label>
                    <Input id="patient-name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} required />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="patient-email">Email</Label>
                  <Input id="patient-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-hero shadow-elegant">
                  {busy ? "Sending code…" : "Continue with email"} <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or continue with<span className="h-px flex-1 bg-border" /></div>
              <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle}>Continue with Google</Button>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New to PhysioConnect?" : "Already have an account?"}{" "}
                <button type="button" className="font-semibold text-primary underline-offset-4 hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          ) : (
            <div className="mt-10 lg:mt-0">
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep("email")} className="-ml-3 mb-4">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <h1 className="font-display text-3xl font-bold">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to {mode === "signin" ? "sign in" : "create your account"}.
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
                <Button type="submit" disabled={busy || otp.length < 6} className="w-full bg-gradient-hero shadow-elegant">
                  {busy ? "Verifying…" : "Verify and sign in"} <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground"><Link to="/" className="hover:text-foreground">Back to PhysioConnect</Link></p>
        </div>
      </section>
    </main>
  );
}