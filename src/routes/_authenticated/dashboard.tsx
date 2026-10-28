import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  Calendar,
  FileText,
  ArrowRight,
  Clock,
  MapPin,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Assessment = Database["public"]["Tables"]["assessment_submissions"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Patient Dashboard — PhysioConnect" },
      {
        name: "description",
        content: "Your private recovery dashboard, assessment history, and physiotherapy sessions.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [userName, setUserName] = useState<string>("Patient");
  const [userEmail, setUserEmail] = useState<string>("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPatientData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !active) return;

        setUserEmail(user.email || "");

        // Fetch Profile Name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        } else if (user.email) {
          setUserName(user.email.split("@")[0]);
        }

        // Fetch Assessments
        const { data: userAssessments } = await supabase
          .from("assessment_submissions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (userAssessments && active) {
          setAssessments(userAssessments);
        }

        // Fetch Bookings
        const { data: userBookings } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("appointment_date", { ascending: true });

        if (userBookings && active) {
          setBookings(userBookings);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPatientData();
    return () => {
      active = false;
    };
  }, []);

  const latestAssessment = assessments[0];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border border-primary/20 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-background/80 text-primary"
                >
                  <UserCheck className="mr-1 h-3 w-3" /> Verified Patient
                </Badge>
              </div>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {userName}!
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your personalized recovery journey, clinical evaluations, and scheduled
                therapy sessions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button asChild className="bg-gradient-hero shadow-elegant">
                <Link to="/questionnaire">
                  <PlusCircle className="mr-1.5 h-4 w-4" /> Start Assessment
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/find">
                  Find Specialists <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Health Stats Bar */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Assessments</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold">{assessments.length}</div>
            <p className="mt-0.5 text-xs text-muted-foreground">Clinical intakes recorded</p>
          </Card>

          <Card className="p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Upcoming Visits</span>
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold">{bookings.length}</div>
            <p className="mt-0.5 text-xs text-muted-foreground">Scheduled sessions</p>
          </Card>

          <Card className="p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Latest Pain Score</span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {latestAssessment ? latestAssessment.pain_score : "—"}
              </span>
              <span className="text-xs text-muted-foreground">/ 10</span>
            </div>
            <Progress
              value={latestAssessment ? (latestAssessment.pain_score / 10) * 100 : 0}
              className="mt-2 h-1.5"
            />
          </Card>

          <Card className="p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Mobility Index</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {latestAssessment ? latestAssessment.mobility_score : "—"}
              </span>
              <span className="text-xs text-muted-foreground">/ 10</span>
            </div>
            <Progress
              value={latestAssessment ? (latestAssessment.mobility_score / 10) * 100 : 0}
              className="mt-2 h-1.5"
            />
          </Card>
        </div>

        {/* Main Content Sections */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Section: Assessment Submissions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Clinical Assessments
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/questionnaire">Take New</Link>
              </Button>
            </div>

            {loading ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                Loading your assessment history…
              </Card>
            ) : assessments.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-semibold">No assessment completed yet</h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Complete our 3-minute intake questionnaire to get recovery recommendations and
                  connect with a physiotherapist.
                </p>
                <Button asChild size="sm" className="mt-4 bg-gradient-hero">
                  <Link to="/questionnaire">Start Intake Now</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {assessments.map((a) => (
                  <Card key={a.id} className="p-4 transition hover:border-primary/50 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground capitalize">
                            {a.affected_area || "General Evaluation"}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Pain: {a.pain_score}/10
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {a.description || "No specific symptoms notes."}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(a.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground border-t pt-2">
                      <span>
                        Mobility: <strong className="text-foreground">{a.mobility_score}/10</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Duration: <strong className="text-foreground">{a.duration || "N/A"}</strong>
                      </span>
                      {a.report_names && a.report_names.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-primary font-medium">
                            📎 {a.report_names.length} attached report
                            {a.report_names.length > 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Section: Upcoming Sessions / Bookings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Bookings
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/find">Explore Doctors</Link>
              </Button>
            </div>

            {loading ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                Loading your appointments…
              </Card>
            ) : bookings.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-semibold">No appointments scheduled</h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Browse licensed physiotherapists near you and book your in-clinic or online
                  consultation.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link to="/find">Find a Physiotherapist</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <Card key={b.id} className="p-4 shadow-sm border-l-4 border-l-primary">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{b.physio_name}</h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {b.clinic}
                        </p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                        {b.status || "Confirmed"}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground border-t pt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(b.appointment_date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {b.appointment_time}
                      </span>
                      {b.price && (
                        <span className="ml-auto font-medium text-foreground">₹{b.price}</span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
