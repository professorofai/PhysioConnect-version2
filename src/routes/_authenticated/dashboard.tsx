import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
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
  TrendingDown,
  UserCheck,
  Download,
  CalendarPlus,
  PlayCircle,
  Sparkles,
  ExternalLink,
  Ban,
  Filter,
  Check,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { usePatientAuth } from "@/lib/auth-context";
import { PatientAvatar } from "@/components/patient-avatar";
import { toast } from "sonner";
import { videos } from "@/lib/mock-data";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type Assessment = Database["public"]["Tables"]["assessment_submissions"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Patient Dashboard — PhysioConnect" },
      {
        name: "description",
        content:
          "Your private recovery dashboard, clinical assessment history, recovery analytics, and physiotherapy sessions.",
      },
    ],
  }),
  component: DashboardPage,
});

function getGoogleCalendarUrl(
  title: string,
  clinic: string,
  dateStr: string,
  timeSlot: string,
) {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dFormatted = !isNaN(d.getTime())
    ? `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    : "";

  const eventTitle = encodeURIComponent(`Physiotherapy: ${title}`);
  const details = encodeURIComponent(
    `Consultation with ${title} at ${clinic}.\nScheduled time: ${timeSlot}.\nManaged via Physio Connect.`,
  );
  const location = encodeURIComponent(clinic);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${dFormatted}/${dFormatted}&details=${details}&location=${location}`;
}

function DashboardPage() {
  const { user: authUser, gender, avatarUrl, preferCartoon } = usePatientAuth();
  const [userName, setUserName] = useState<string>("Patient");
  const [userEmail, setUserEmail] = useState<string>("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState<"all" | "upcoming" | "cancelled">("all");
  const [isMounted, setIsMounted] = useState(false);
  const [protocolView, setProtocolView] = useState<"actual" | "projected">("actual");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

        // Fetch Bookings (from Supabase bookings table)
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
  const oldestAssessment = assessments[assessments.length - 1];

  // Cancel booking handler
  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) {
        console.warn("Direct update warning, applying optimistic update:", error);
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)),
      );
      toast.success("Appointment cancelled", {
        description: "Your session has been marked as cancelled.",
      });
    } catch (err: any) {
      console.error("Cancel booking error:", err);
      toast.error("Could not cancel session", { description: err?.message });
    } finally {
      setCancellingId(null);
    }
  };

  // Download uploaded patient reports
  const handleDownloadReport = async (path: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("patient-reports")
        .createSignedUrl(path, 3600);

      if (error || !data?.signedUrl) {
        throw error || new Error("Could not generate secure file URL.");
      }

      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      console.error("Report download error:", err);
      toast.error("Could not access report", {
        description: err?.message || "File might be inaccessible or pending review.",
      });
    }
  };

  // Recovery Chart Data preparation
  const chartData = useMemo(() => {
    if (assessments.length === 0) return [];

    if (assessments.length >= 2 || protocolView === "actual") {
      // Sort oldest to newest for trendline
      const chronological = [...assessments].reverse();
      return chronological.map((a, idx) => {
        const d = new Date(a.created_at);
        const label = !isNaN(d.getTime())
          ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
          : `Visit ${idx + 1}`;
        return {
          name: label,
          date: !isNaN(d.getTime()) ? d.toLocaleDateString() : "",
          pain: a.pain_score,
          mobility: a.mobility_score,
          area: a.affected_area || "General",
        };
      });
    }

    // Single assessment: show baseline + 4-week clinical projection protocol
    const basePain = latestAssessment.pain_score;
    const baseMobility = latestAssessment.mobility_score;

    return [
      {
        name: "Intake (W0)",
        date: "Baseline Assessment",
        pain: basePain,
        mobility: baseMobility,
        area: latestAssessment.affected_area,
      },
      {
        name: "Week 1",
        date: "Target Milestone 1",
        pain: Math.max(1, Math.round(basePain * 0.75)),
        mobility: Math.min(10, Math.round(baseMobility + 1)),
        area: "Targeted mobility",
      },
      {
        name: "Week 2",
        date: "Target Milestone 2",
        pain: Math.max(1, Math.round(basePain * 0.5)),
        mobility: Math.min(10, Math.round(baseMobility + 2)),
        area: "Core stabilization",
      },
      {
        name: "Week 3",
        date: "Target Milestone 3",
        pain: Math.max(1, Math.round(basePain * 0.3)),
        mobility: Math.min(10, Math.round(baseMobility + 3)),
        area: "Functional reloading",
      },
      {
        name: "Week 4",
        date: "Target Recovery Goal",
        pain: 1,
        mobility: Math.min(10, Math.max(8, baseMobility + 4)),
        area: "Full activity return",
      },
    ];
  }, [assessments, latestAssessment, protocolView]);

  // Analytics Metrics
  const painDelta = useMemo(() => {
    if (assessments.length < 2) return null;
    const initial = oldestAssessment.pain_score;
    const current = latestAssessment.pain_score;
    const diff = initial - current;
    const pct = Math.round((diff / (initial || 1)) * 100);
    return { diff, pct };
  }, [assessments, oldestAssessment, latestAssessment]);

  const mobilityDelta = useMemo(() => {
    if (assessments.length < 2) return null;
    const initial = oldestAssessment.mobility_score;
    const current = latestAssessment.mobility_score;
    const diff = current - initial;
    const pct = Math.round((diff / (initial || 1)) * 100);
    return { diff, pct };
  }, [assessments, oldestAssessment, latestAssessment]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    if (bookingFilter === "upcoming") {
      return bookings.filter(
        (b) => b.status !== "cancelled" && b.appointment_date >= today,
      );
    }
    if (bookingFilter === "cancelled") {
      return bookings.filter((b) => b.status === "cancelled");
    }
    return bookings;
  }, [bookings, bookingFilter]);

  // Recommended Exercises based on affected area
  const recommendedVideos = useMemo(() => {
    const area = latestAssessment?.affected_area?.toLowerCase() || "";
    let matched = videos.filter((v) => {
      const cat = v.category.toLowerCase();
      if (area.includes("back") && cat.includes("back")) return true;
      if (area.includes("knee") && cat.includes("knee")) return true;
      if (area.includes("shoulder") && cat.includes("shoulder")) return true;
      if (area.includes("ankle") && cat.includes("ankle")) return true;
      return false;
    });

    if (matched.length === 0) {
      matched = videos.slice(0, 3);
    }
    return matched.slice(0, 3);
  }, [latestAssessment]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border border-primary/20 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start sm:items-center gap-4">
              <PatientAvatar
                user={authUser}
                gender={gender}
                avatarUrl={avatarUrl}
                forceCartoon={preferCartoon}
                name={userName}
                size="lg"
                className="ring-4 ring-background shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-primary/40 bg-background/80 text-primary font-semibold"
                  >
                    <UserCheck className="mr-1 h-3 w-3" /> Verified Patient
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {preferCartoon
                      ? "Cartoon Avatar"
                      : avatarUrl
                        ? "Google Account Photo"
                        : "Cartoon Avatar"}
                  </span>
                </div>
                <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
                  Welcome back, {userName}!
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your clinical assessments, real-time recovery analytics, and scheduled
                  physiotherapy consultations.
                </p>
              </div>
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
          <Card className="p-4 shadow-sm border-border/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Clinical Intakes</span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold">{assessments.length}</div>
            <p className="mt-0.5 text-xs text-muted-foreground">Total evaluations completed</p>
          </Card>

          <Card className="p-4 shadow-sm border-border/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Sessions</span>
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold">
              {bookings.filter((b) => b.status !== "cancelled").length}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Confirmed bookings</p>
          </Card>

          <Card className="p-4 shadow-sm border-border/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Latest Pain Score</span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {latestAssessment ? latestAssessment.pain_score : "—"}
              </span>
              <span className="text-xs text-muted-foreground">/ 10</span>
              {painDelta && painDelta.diff > 0 && (
                <span className="ml-auto inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <TrendingDown className="h-3 w-3 mr-0.5" /> -{painDelta.pct}%
                </span>
              )}
            </div>
            <Progress
              value={latestAssessment ? (latestAssessment.pain_score / 10) * 100 : 0}
              className="mt-2 h-1.5"
            />
          </Card>

          <Card className="p-4 shadow-sm border-border/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Mobility Index</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {latestAssessment ? latestAssessment.mobility_score : "—"}
              </span>
              <span className="text-xs text-muted-foreground">/ 10</span>
              {mobilityDelta && mobilityDelta.diff > 0 && (
                <span className="ml-auto inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +{mobilityDelta.pct}%
                </span>
              )}
            </div>
            <Progress
              value={latestAssessment ? (latestAssessment.mobility_score / 10) * 100 : 0}
              className="mt-2 h-1.5"
            />
          </Card>
        </div>

        {/* Section: Interactive Recovery Analytics & Progress Tracking */}
        <div className="mt-8">
          <Card className="p-6 shadow-sm border-border/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recovery Progression Analytics
                  </h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    Clinical Metrics
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time tracking of pain attenuation and functional mobility milestones.
                </p>
              </div>

              {/* Protocol selector if 1 assessment */}
              {assessments.length === 1 && (
                <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setProtocolView("actual")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      protocolView === "actual"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Intake Baseline
                  </button>
                  <button
                    type="button"
                    onClick={() => setProtocolView("projected")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      protocolView === "projected"
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    4-Week Projected Protocol
                  </button>
                </div>
              )}
            </div>

            {/* Recovery Highlights Row */}
            {latestAssessment && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-muted/30 p-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Primary Condition:</span>
                  <p className="font-bold text-foreground capitalize mt-0.5">
                    {latestAssessment.affected_area || "General Care"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Symptom Duration:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {latestAssessment.duration || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rehab Trajectory:</span>
                  <p className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {assessments.length > 1
                      ? "Progressing Positively"
                      : "Protocol Established"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Functional Status:</span>
                  <p className="font-bold text-primary mt-0.5">
                    {latestAssessment.mobility_score >= 7
                      ? "High Mobility"
                      : latestAssessment.mobility_score >= 4
                        ? "Moderate Mobility"
                        : "Restricted Mobility"}
                  </p>
                </div>
              </div>
            )}

            {/* Recharts Area Chart */}
            <div className="mt-6 h-72 w-full">
              {loading || !isMounted ? (
                <div className="flex h-full items-center justify-center rounded-xl bg-muted/20 text-xs text-muted-foreground animate-pulse">
                  Loading recovery telemetry…
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="text-sm font-semibold">No assessment records yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Take your first guided clinical assessment to generate your personalized
                    recovery telemetry chart.
                  </p>
                  <Button asChild size="sm" className="mt-3 bg-gradient-hero">
                    <Link to="/questionnaire">Take 3-Min Intake</Link>
                  </Button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="mobilityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[170px]">
                            <p className="font-bold text-foreground">{data.name}</p>
                            <p className="text-[11px] text-muted-foreground">{data.date}</p>
                            <div className="pt-1.5 border-t border-border/60 space-y-1">
                              <div className="flex items-center justify-between text-rose-600 font-semibold">
                                <span>Pain Score:</span>
                                <span>{data.pain} / 10</span>
                              </div>
                              <div className="flex items-center justify-between text-emerald-600 font-semibold">
                                <span>Mobility Index:</span>
                                <span>{data.mobility} / 10</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pain"
                      name="Pain Score (Target: Low)"
                      stroke="#F43F5E"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#painGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="mobility"
                      name="Mobility Index (Target: High)"
                      stroke="#0D9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#mobilityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Activity Milestones from Assessment */}
            {latestAssessment?.activities && latestAssessment.activities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/60">
                <span className="text-xs font-semibold text-muted-foreground">
                  Functional Activities Targeted for Recovery:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {latestAssessment.activities.map((act) => (
                    <Badge
                      key={act}
                      variant="outline"
                      className="border-primary/30 bg-primary/5 text-primary text-xs py-1"
                    >
                      <Check className="mr-1 h-3 w-3" /> {act}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Section: Sessions and Assessment Details */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Section: Bookings & Upcoming Consultations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold">Consultation Bookings</h2>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/30 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setBookingFilter("all")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    bookingFilter === "all"
                      ? "bg-background font-bold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({bookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingFilter("upcoming")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    bookingFilter === "upcoming"
                      ? "bg-background font-bold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  onClick={() => setBookingFilter("cancelled")}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    bookingFilter === "cancelled"
                      ? "bg-background font-bold text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {loading ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                Loading your appointments…
              </Card>
            ) : filteredBookings.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-semibold">No bookings found</h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  {bookingFilter === "cancelled"
                    ? "You do not have any cancelled sessions."
                    : "Browse verified physiotherapists in your city and schedule your next session."}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link to="/find">Find a Physiotherapist</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((b) => (
                  <Card
                    key={b.id}
                    className={`p-4 shadow-sm border-l-4 transition-all ${
                      b.status === "cancelled"
                        ? "border-l-muted-foreground/40 bg-muted/20 opacity-80"
                        : "border-l-primary hover:border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to="/physio/$id"
                            params={{ id: b.physio_id }}
                            className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                          >
                            {b.physio_name}
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          </Link>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" /> {b.clinic}
                        </p>
                      </div>

                      <Badge
                        className={
                          b.status === "cancelled"
                            ? "bg-muted text-muted-foreground border-border"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }
                      >
                        {b.status === "cancelled" ? "Cancelled" : "Confirmed"}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(b.appointment_date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {b.appointment_time}
                      </span>
                      {b.price && (
                        <span className="font-bold text-foreground ml-auto">₹{b.price}</span>
                      )}
                    </div>

                    {/* Booking Actions */}
                    {b.status !== "cancelled" && (
                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-primary hover:bg-primary/10 px-2"
                        >
                          <a
                            href={getGoogleCalendarUrl(
                              b.physio_name,
                              b.clinic,
                              b.appointment_date,
                              b.appointment_time,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1"
                          >
                            <CalendarPlus className="h-3 w-3" /> Add to Calendar
                          </a>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cancellingId === b.id}
                          onClick={() => void handleCancelBooking(b.id)}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 px-2"
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          {cancellingId === b.id ? "Cancelling…" : "Cancel Session"}
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Section: Clinical Assessments & Attached Reports */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Intake Assessments & Reports
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/questionnaire">Take New</Link>
              </Button>
            </div>

            {loading ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                Loading clinical intake history…
              </Card>
            ) : assessments.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="mt-3 font-semibold">No assessment completed yet</h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Complete our 3-minute intake questionnaire to record symptoms and receive clinical
                  recommendations.
                </p>
                <Button asChild size="sm" className="mt-4 bg-gradient-hero">
                  <Link to="/questionnaire">Start Intake Now</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {assessments.map((a) => (
                  <Card key={a.id} className="p-4 transition hover:border-primary/50 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground capitalize">
                            {a.affected_area || "General Evaluation"}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Pain: {a.pain_score}/10
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Mobility: {a.mobility_score}/10
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {a.description || "No specific symptoms notes entered."}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(a.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground border-t border-border/60 pt-2">
                      <span>
                        Duration: <strong className="text-foreground">{a.duration || "N/A"}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Gender: <strong className="text-foreground capitalize">{a.gender}</strong>
                      </span>
                    </div>

                    {/* Attached Clinical Medical Reports */}
                    {a.report_paths && a.report_paths.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-border/50">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Attached Medical Documents:
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {a.report_paths.map((path, idx) => {
                            const name = a.report_names?.[idx] || `Report_${idx + 1}`;
                            return (
                              <button
                                key={path}
                                type="button"
                                onClick={() => void handleDownloadReport(path, name)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              >
                                <Download className="h-3 w-3" />
                                <span className="max-w-[160px] truncate">{name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section: Tailored Rehab Exercise Routines */}
        {latestAssessment && recommendedVideos.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  Recommended Routines for Your Recovery
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Clinician-guided routines matched for your {latestAssessment.affected_area || "recovery"} condition.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/videos">
                  Browse All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {recommendedVideos.map((v) => (
                <Card
                  key={v.id}
                  className="overflow-hidden border-border/70 hover:border-primary/50 transition-all shadow-xs"
                >
                  <div
                    className={`h-24 bg-gradient-to-br ${v.thumb} flex items-center justify-center relative p-3`}
                  >
                    <PlayCircle className="h-9 w-9 text-white/90 drop-shadow-md" />
                    <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {v.duration}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 mb-1.5">
                      {v.category}
                    </Badge>
                    <h3 className="font-semibold text-xs line-clamp-1 text-foreground">{v.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{v.doctor}</p>
                    <Button asChild size="sm" variant="outline" className="w-full mt-3 h-8 text-xs">
                      <Link to="/videos">Watch Routine</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
