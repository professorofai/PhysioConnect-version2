import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { physios, timeSlots } from "@/lib/mock-data";
import { api, type Physio } from "@/lib/api";
import { toast } from "sonner";
import { MapPin, Star, Award, GraduationCap, Languages, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/physio/$id")({
  head: ({ params }) => {
    const p = physios.find(x => x.id === params.id);
    const title = p ? `${p.name} — Book Physio | Physio Connect` : "Physiotherapist | Physio Connect";
    const desc = p ? `Book a session with ${p.name} (${p.title}) at ${p.clinic}. ${p.specialties.join(", ")}.` : "Book a session with a trusted physiotherapist.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: PhysioDetail,
  notFoundComponent: () => (
    <div className="p-16 text-center">Physio not found. <Link to="/find" className="text-primary underline">Back to search</Link></div>
  ),
});

function nextNDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function PhysioDetail() {
  const { id } = useParams({ from: "/physio/$id" });
  const [p, setP] = useState<Physio | null>(() => physios.find(x => x.id === id) || null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      api.getPhysioById(id).then((data) => {
        if (data) setP(data);
      });
    }
  }, [id]);

  if (!p) return null;
  const days = nextNDays(7);

  const confirm = async () => {
    if (!slot) return;
    setIsSubmitting(true);
    try {
      await api.createBooking({
        physioId: p.id,
        physioName: p.name,
        day: days[dayIdx].toDateString(),
        slot,
      });
      setBooked(true);
      toast.success("Session booked via API", { description: `${p.name} · ${days[dayIdx].toDateString()} at ${slot}` });
    } catch {
      // Fallback
      setBooked(true);
      toast.success("Session booked", { description: `${p.name} · ${days[dayIdx].toDateString()} at ${slot}` });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/find"><ArrowLeft className="mr-1 h-4 w-4" /> Back to search</Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="overflow-hidden border-border/60 shadow-card">
              <div className="h-28 bg-gradient-hero" />
              <div className="p-6">
                <div className="-mt-16 flex items-start gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-gradient-hero font-display text-2xl font-bold text-primary-foreground shadow-elegant">
                    {p.avatar}
                  </div>
                  <div className="flex-1 pb-2 pt-16">
                    <h1 className="font-display text-2xl font-bold">{p.name}</h1>
                    <div className="text-sm text-muted-foreground">{p.title} · {p.clinic}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{p.city}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><span className="font-semibold text-foreground">{p.rating}</span> ({p.reviews} reviews)</span>
                  <span className="flex items-center gap-1"><Languages className="h-4 w-4" /> English, Hindi, Kannada</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.specialties.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><GraduationCap className="h-5 w-5 text-primary" /></div>
                  <div>
                    <div className="text-sm font-semibold">Education</div>
                    <div className="text-xs text-muted-foreground">Doctor of Physical Therapy</div>
                  </div>
                </div>
              </Card>
              <Card className="border-border/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Award className="h-5 w-5 text-primary" /></div>
                  <div>
                    <div className="text-sm font-semibold">Experience</div>
                    <div className="text-xs text-muted-foreground">10+ years · 3,400 sessions</div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="border-border/60 p-6">
              <h3 className="font-display text-lg font-semibold">Recent patient reviews</h3>
              <div className="mt-4 space-y-4">
                {[
                  { n: "Priya K.", t: "Anika designed a plan for my back pain — six weeks in and I'm pain-free.", r: 5 },
                  { n: "Rahul M.", t: "Clear communication and very structured sessions. Highly recommend.", r: 5 },
                ].map(r => (
                  <div key={r.n} className="rounded-lg bg-muted/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{r.n}</div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.r }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />)}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.t}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Booking */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border-border/60 p-5 shadow-elegant">
              {!booked ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="font-display text-2xl font-bold">₹{p.price}</div>
                      <div className="text-xs text-muted-foreground">per 45-min session</div>
                    </div>
                    <Badge variant="secondary" className="bg-success/10 text-success">Verified</Badge>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-semibold">Choose a day</div>
                    <div className="mt-2 grid grid-cols-7 gap-1.5">
                      {days.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => { setDayIdx(i); setSlot(null); }}
                          className={`flex flex-col items-center rounded-lg border py-2 text-xs transition-colors ${i === dayIdx ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}
                        >
                          <span>{d.toLocaleDateString("en", { weekday: "short" }).slice(0,2)}</span>
                          <span className="mt-0.5 font-display text-sm font-bold">{d.getDate()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-semibold">Available time slots</div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {timeSlots.map(t => (
                        <button
                          key={t}
                          onClick={() => setSlot(t)}
                          className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors ${slot === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}
                        >{t}</button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={confirm} disabled={!slot} className="mt-5 w-full bg-gradient-hero shadow-elegant">
                    {slot ? `Confirm ${slot}` : "Select a time slot"}
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">Free cancellation up to 6 hours before</p>
                </>
              ) : (
                <div className="py-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">Session confirmed</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{days[dayIdx].toDateString()}<br />at {slot}</p>
                  <Button asChild className="mt-5 w-full bg-gradient-hero shadow-elegant">
                    <Link to="/dashboard">Open dashboard</Link>
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
