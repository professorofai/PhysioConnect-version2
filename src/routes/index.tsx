import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImg from "@/assets/hero bg image.webp";
import {
  ClipboardList, MapPin, PlayCircle, LineChart,
  ShieldCheck, Sparkles, ArrowRight, Star, Activity, HeartPulse, Clock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Physio Connect — Physiotherapy Assessment, Booking & Recovery" },
      { name: "description", content: "Get assessed, matched with trusted physiotherapists, book sessions and track your recovery — all in one modern platform." },
      { property: "og:title", content: "Physio Connect — Physiotherapy Assessment, Booking & Recovery" },
      { property: "og:description", content: "Get assessed, matched with trusted physiotherapists, book sessions and track your recovery." },
    ],
  }),
  component: Home,
});

const features = [
  { icon: ClipboardList, title: "Smart intake", desc: "A guided questionnaire captures your symptoms, history and reports in minutes." },
  { icon: MapPin, title: "Nearby physios", desc: "Discover verified specialists around you, filtered by condition and availability." },
  { icon: Clock, title: "Instant booking", desc: "See live time slots and confirm your session in a few taps." },
  { icon: PlayCircle, title: "Trusted video library", desc: "Follow guided routines built by licensed clinicians for your condition." },
  { icon: LineChart, title: "Recovery dashboard", desc: "Track pain, mobility, streaks and milestones as you get better." },
  { icon: ShieldCheck, title: "Private by design", desc: "Your reports and history stay encrypted and yours to share." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `linear-gradient(to right, rgba(230, 246, 251, 0.95), rgba(230, 246, 251, 0.6)), url("${heroImg}")` }}
        />
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary-glow/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              New: guided recovery paths
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Recovery, without the{" "}
              <span className="text-gradient">guesswork.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Physio Connect connects patients with verified physiotherapists. Assess your
              condition, book a specialist near you, follow expert-led routines,
              and watch your progress add up.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-hero shadow-elegant hover:opacity-95">
                <Link to="/questionnaire">
                  Start free assessment <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/find">Find a physio</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["AR", "VS", "MD", "AM"].map(i => (
                    <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-gradient-hero text-[10px] font-semibold text-primary-foreground">{i}</div>
                  ))}
                </div>
                <span>50+ verified physios</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium text-foreground">4.9</span>
                <span>· 12k patient reviews</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-hero opacity-20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border/60 shadow-elegant">
              <img src={heroImg} alt="Physiotherapist working with a patient" width={1600} height={1200} className="h-full w-full object-cover" />
            </div>
            <Card className="absolute -bottom-6 -left-6 w-64 border-border/60 p-4 shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <HeartPulse className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Recovery score</div>
                  <div className="font-display text-xl font-bold">+38% <span className="text-xs font-normal text-success">this week</span></div>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[72%] rounded-full bg-gradient-hero" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { k: "12,000+", v: "Patients recovered" },
            { k: "200+", v: "Verified clinicians" },
            { k: "48hr", v: "Avg. time to first session" },
            { k: "4.9/5", v: "Satisfaction rating" },
          ].map(s => (
            <div key={s.v}>
              <div className="font-display text-3xl font-bold text-foreground">{s.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Everything you need</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">One platform, end-to-end recovery.</h2>
          <p className="mt-3 text-muted-foreground">From your first symptom to your final session — we've built the tools that keep you and your clinician on the same page.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <Card key={f.title} className="group border-border/60 p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground shadow-elegant">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Four steps to feeling better.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { n: "01", t: "Answer a few questions", d: "Tell us what hurts and share any reports." },
              { n: "02", t: "Match with a specialist", d: "See physios nearby with the right expertise." },
              { n: "03", t: "Book a time that works", d: "In-clinic or virtual sessions, on your schedule." },
              { n: "04", t: "Track your recovery", d: "Follow routines and watch your progress compound." },
            ].map(s => (
              <div key={s.n} className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-card">
                <div className="font-display text-xs font-bold text-primary">{s.n}</div>
                <div className="mt-2 font-display text-lg font-semibold">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elegant sm:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <Activity className="h-8 w-8" />
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Start your recovery today.</h2>
            <p className="mt-3 text-primary-foreground/85">
              The 3-minute intake gives your clinician everything they need before your first session.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/questionnaire">Take the assessment</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                <Link to="/find">Browse specialists</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
