import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { physios, timeSlots } from "@/lib/mock-data";
import { api, type Physio } from "@/lib/api";
import { toast } from "sonner";
import {
  MapPin,
  Star,
  Award,
  GraduationCap,
  Languages,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  LogIn,
  ShieldCheck,
  CalendarPlus,
} from "lucide-react";
import { usePatientAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/physio/$id")({
  head: ({ params }) => {
    const p = physios.find((x) => x.id === params.id);
    const title = p
      ? `${p.name} — Book Physio | Physio Connect`
      : "Physiotherapist | Physio Connect";
    const desc = p
      ? `Book a session with ${p.name} (${p.title}) at ${p.clinic}. ${p.specialties.join(", ")}.`
      : "Book a session with a trusted physiotherapist.";
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
    <div className="p-16 text-center">
      Physio not found.{" "}
      <Link to="/find" className="text-primary underline">
        Back to search
      </Link>
    </div>
  ),
});

function nextNDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getGoogleCalendarUrl(
  title: string,
  clinic: string,
  date: Date,
  timeSlot: string,
) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const dateStr = `${year}${month}${day}`;

  const eventTitle = encodeURIComponent(`Physiotherapy Session: ${title}`);
  const details = encodeURIComponent(
    `Physiotherapy consultation with ${title} at ${clinic}.\nScheduled time: ${timeSlot}.\nManaged via Physio Connect.`,
  );
  const location = encodeURIComponent(clinic);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${dateStr}/${dateStr}&details=${details}&location=${location}`;
}

function PhysioDetail() {
  const { id } = useParams({ from: "/physio/$id" });
  const navigate = useNavigate();
  const { user, displayName } = usePatientAuth();
  const [p, setP] = useState<Physio | null>(() => physios.find((x) => x.id === id) || null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedInfo, setConfirmedInfo] = useState<{
    id: string;
    day: string;
    slot: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      void api.getPhysioById(id).then((data) => {
        if (data) setP(data);
      });
    }
  }, [id]);

  // Restore pending booking if user just completed authentication
  useEffect(() => {
    try {
      const pendingRaw = sessionStorage.getItem("pending_booking");
      if (pendingRaw) {
        const parsed = JSON.parse(pendingRaw);
        if (parsed.physioId === id) {
          if (typeof parsed.dayIdx === "number") setDayIdx(parsed.dayIdx);
          if (parsed.slot) setSlot(parsed.slot);
        }
      }
    } catch (e) {
      console.warn("Could not restore pending booking:", e);
    }
  }, [id]);

  if (!p) return null;
  const days = nextNDays(7);

  const confirm = async () => {
    if (!slot) return;

    // 1. If not authenticated, save selection and redirect to login
    if (!user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "pending_booking",
          JSON.stringify({ physioId: p.id, dayIdx, slot }),
        );
      }
      toast.info("Please sign in to save your booking", {
        description: "Your selected time slot is saved and will be ready when you return.",
      });
      void navigate({
        to: "/auth",
        search: { next: `/physio/${p.id}` },
      });
      return;
    }

    setIsSubmitting(true);
    const selectedDate = days[dayIdx];
    const pad = (n: number) => String(n).padStart(2, "0");
    const formattedDate = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;

    try {
      // 2. Insert into Supabase bookings table with patient ownership
      const { data: dbBooking, error: dbError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          physio_id: p.id,
          physio_name: p.name,
          clinic: p.clinic,
          appointment_date: formattedDate,
          appointment_time: slot,
          price: p.price,
          status: "confirmed",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Notify secondary API/mock store asynchronously
      void api
        .createBooking({
          physioId: p.id,
          physioName: p.name,
          day: selectedDate.toDateString(),
          slot,
          patientName: displayName || user.email || "Patient",
          patientEmail: user.email || undefined,
        })
        .catch((err) => console.warn("Secondary API sync non-fatal warning:", err));

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pending_booking");
      }

      setConfirmedInfo({
        id: dbBooking?.id || `book_${Date.now()}`,
        day: selectedDate.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        slot,
      });
      setBooked(true);
      toast.success("Appointment Confirmed!", {
        description: `${p.name} · ${selectedDate.toDateString()} at ${slot}`,
      });
    } catch (err: any) {
      console.error("Booking error:", err);
      toast.error("Could not complete booking", {
        description: err?.message || "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/find">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to search
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Details */}
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
                    <div className="text-sm text-muted-foreground">
                      {p.title} · {p.clinic}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {p.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-foreground">{p.rating}</span> ({p.reviews}{" "}
                    reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <Languages className="h-4 w-4" /> English, Hindi, Kannada
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.specialties.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Education</div>
                    <div className="text-xs text-muted-foreground">Doctor of Physical Therapy</div>
                  </div>
                </div>
              </Card>
              <Card className="border-border/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Experience</div>
                    <div className="text-xs text-muted-foreground">10+ years · 3,400+ sessions</div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="border-border/60 p-6">
              <h3 className="font-display text-lg font-semibold">Recent patient reviews</h3>
              <div className="mt-4 space-y-4">
                {[
                  {
                    n: "Priya K.",
                    t: "Dr. Anika designed a tailored plan for my lower back pain — six weeks in and I'm active and pain-free.",
                    r: 5,
                  },
                  {
                    n: "Rahul M.",
                    t: "Clear communication, thorough mobility checks, and very structured sessions. Highly recommend.",
                    r: 5,
                  },
                ].map((r) => (
                  <div key={r.n} className="rounded-lg bg-muted/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{r.n}</div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.r }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.t}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border-border/60 p-5 shadow-elegant">
              {!booked ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="font-display text-2xl font-bold">₹{p.price}</div>
                      <div className="text-xs text-muted-foreground">per 45-min consultation</div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Verified Specialist
                    </Badge>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-semibold">Choose a day</div>
                    <div className="mt-2 grid grid-cols-7 gap-1.5">
                      {days.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setDayIdx(i);
                            setSlot(null);
                          }}
                          className={`flex flex-col items-center rounded-lg border py-2 text-xs transition-colors cursor-pointer ${
                            i === dayIdx
                              ? "border-primary bg-primary text-primary-foreground font-semibold"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          <span>{d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2)}</span>
                          <span className="mt-0.5 font-display text-sm font-bold">{d.getDate()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-semibold">Available time slots</div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSlot(t)}
                          className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors cursor-pointer ${
                            slot === t
                              ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => void confirm()}
                    disabled={!slot || isSubmitting}
                    className="mt-5 w-full bg-gradient-hero shadow-elegant h-11"
                  >
                    {isSubmitting ? (
                      "Saving booking to your account…"
                    ) : !user ? (
                      <span className="flex items-center gap-1.5">
                        <LogIn className="h-4 w-4" />
                        {slot ? `Sign in to book ${slot}` : "Sign in to book"}
                      </span>
                    ) : slot ? (
                      `Confirm ${slot} · ₹${p.price}`
                    ) : (
                      "Select a time slot"
                    )}
                  </Button>

                  <p className="mt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Free cancellation up to 6 hours before
                  </p>
                </>
              ) : (
                <div className="py-4 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">Session confirmed!</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Saved to your private patient account
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-left text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <span className="text-muted-foreground">Specialist:</span>
                      <span className="font-bold text-foreground">{p.name}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <span className="text-muted-foreground">Clinic:</span>
                      <span className="font-medium text-foreground">{p.clinic}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Date:
                      </span>
                      <span className="font-bold text-foreground">{confirmedInfo?.day}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Time:
                      </span>
                      <span className="font-bold text-primary">{confirmedInfo?.slot}</span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-foreground text-sm">₹{p.price}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button asChild className="w-full bg-gradient-hero shadow-elegant h-10">
                      <Link to="/dashboard">
                        Open Patient Dashboard
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full text-xs h-9 border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <a
                        href={getGoogleCalendarUrl(
                          p.name,
                          p.clinic,
                          days[dayIdx],
                          slot || "4:00 PM",
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" /> Add to Google Calendar
                        <ExternalLink className="h-3 w-3 ml-0.5 opacity-60" />
                      </a>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setBooked(false);
                        setSlot(null);
                        setConfirmedInfo(null);
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Book another session
                    </Button>
                  </div>
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
