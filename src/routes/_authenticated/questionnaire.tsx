import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, CheckCircle2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/questionnaire")({
  head: () => ({
    meta: [
      { title: "Assessment — Physio Connect" },
      { name: "description", content: "Share your symptoms and reports so we can match you with the right physiotherapist." },
      { property: "og:title", content: "Assessment — Physio Connect" },
      { property: "og:description", content: "Guided intake questionnaire for personalised physiotherapy care." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Questionnaire,
});

const steps = ["About you", "Your problem", "Pain & mobility", "History & reports", "Review"];

function Questionnaire() {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : user.email?.split("@")[0] ?? "",
    age: "",
    gender: "female",
    area: "Lower back",
    description: "",
    duration: "1-4 weeks",
    pain: [5],
    mobility: [6],
    activities: [] as string[],
    surgery: "no",
    meds: "",
    reports: [] as File[],
  });

  const update = (k: keyof typeof form, v: unknown) => setForm(s => ({ ...s, [k]: v }));
  const toggleActivity = (a: string) =>
    update("activities", form.activities.includes(a) ? form.activities.filter(x => x !== a) : [...form.activities, a]);

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const uploadedPaths: string[] = [];
    try {
      for (const file of form.reports) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from("patient-reports").upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
        if (error) throw error;
        uploadedPaths.push(path);
      }

      const { error } = await supabase.from("assessment_submissions").insert({
        user_id: user.id,
        patient_name: form.name.trim() || "Patient",
        age: form.age ? Number(form.age) : null,
        gender: form.gender,
        affected_area: form.area,
        description: form.description,
        duration: form.duration,
        pain_score: form.pain[0] ?? 5,
        mobility_score: form.mobility[0] ?? 6,
        activities: form.activities,
        recent_surgery: form.surgery,
        medications: form.meds,
        report_names: form.reports.map(file => file.name),
        report_paths: uploadedPaths,
      });
      if (error) throw error;

      setDone(true);
      toast.success("Assessment submitted", { description: "Your responses and reports are saved to your account." });
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("patient-reports").remove(uploadedPaths);
      }
      toast.error("Assessment could not be saved", {
        description: error instanceof Error ? error.message : "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">Assessment complete</h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Thanks {form.name || "there"} — based on your responses we've shortlisted specialists near you who treat {form.area.toLowerCase()}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-hero shadow-elegant">
              <Link to="/find">See matched physios <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Guided intake</span>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Let's understand what you're dealing with.</h1>
        </div>

        {/* Progress */}
        <div className="mt-10">
          <div className="flex items-center justify-between text-xs font-medium">
            {steps.map((s, i) => (
              <div key={s} className={`flex-1 text-center ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border-2 ${i <= step ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>
                  {i + 1}
                </div>
                <div className="hidden sm:block">{s}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-hero transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <Card className="mt-8 border-border/60 p-6 shadow-card sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your name" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={form.age} onChange={e => update("age", e.target.value)} placeholder="34" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Gender</Label>
                <RadioGroup value={form.gender} onValueChange={v => update("gender", v)} className="mt-2 flex gap-4">
                  {["female", "male", "other"].map(g => (
                    <label key={g} className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <RadioGroupItem value={g} /> <span className="capitalize">{g}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <Label>Which area is affected?</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {["Lower back","Neck","Shoulder","Knee","Ankle","Hip","Wrist","Post-surgery","Other"].map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => update("area", a)}
                      className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${form.area === a ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"}`}
                    >{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="desc">Describe what you're feeling</Label>
                <Textarea id="desc" rows={4} value={form.description} onChange={e => update("description", e.target.value)} placeholder="e.g. Sharp pain in my lower back when standing up in the morning, started after a long flight..." className="mt-1.5" />
              </div>
              <div>
                <Label>How long has this been going on?</Label>
                <RadioGroup value={form.duration} onValueChange={v => update("duration", v)} className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {["< 1 week","1-4 weeks","1-3 months","> 3 months"].map(d => (
                    <label key={d} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <RadioGroupItem value={d} /> <span>{d}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between">
                  <Label>Pain level</Label>
                  <span className="font-display text-2xl font-bold text-primary">{form.pain[0]}/10</span>
                </div>
                <Slider value={form.pain} onValueChange={v => update("pain", v)} min={0} max={10} step={1} className="mt-4" />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>No pain</span><span>Severe</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>Mobility</Label>
                  <span className="font-display text-2xl font-bold text-primary">{form.mobility[0]}/10</span>
                </div>
                <Slider value={form.mobility} onValueChange={v => update("mobility", v)} min={0} max={10} step={1} className="mt-4" />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>Immobile</span><span>Full range</span></div>
              </div>
              <div>
                <Label>Activities affected</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {["Walking","Sitting","Standing","Sleeping","Exercise","Work","Driving","Stairs","Lifting"].map(a => (
                    <label key={a} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <Checkbox checked={form.activities.includes(a)} onCheckedChange={() => toggleActivity(a)} />
                      <span>{a}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <Label>Any recent surgery in that area?</Label>
                <RadioGroup value={form.surgery} onValueChange={v => update("surgery", v)} className="mt-2 flex gap-4">
                  {["no","yes"].map(v => (
                    <label key={v} className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <RadioGroupItem value={v} /> <span className="capitalize">{v}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="meds">Current medications (optional)</Label>
                <Textarea id="meds" rows={3} value={form.meds} onChange={e => update("meds", e.target.value)} placeholder="e.g. Ibuprofen 400mg as needed" className="mt-1.5" />
              </div>
              <div>
                <Label>Upload reports (X-ray, MRI, prescriptions)</Label>
                <label className="mt-2 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-6 py-10 text-center hover:bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <div className="text-sm font-medium">Click to upload or drag files</div>
                  <div className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</div>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                    onChange={e => {
                      const selected = Array.from(e.target.files ?? []);
                      const accepted = selected.filter(file =>
                        file.size <= 10 * 1024 * 1024 &&
                        ["application/pdf", "image/png", "image/jpeg"].includes(file.type),
                      );
                      if (accepted.length !== selected.length) {
                        toast.error("Some files were not added", { description: "Choose PDF, PNG, or JPG files up to 10MB each." });
                      }
                      update("reports", [...form.reports, ...accepted]);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
                {form.reports.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {form.reports.map((r, index) => <li key={`${r.name}-${index}`}>• {r.name}</li>)}
                  </ul>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold">Review your responses</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Name", form.name || "—"],
                  ["Age", form.age || "—"],
                  ["Gender", form.gender],
                  ["Affected area", form.area],
                  ["Duration", form.duration],
                  ["Pain", `${form.pain[0]}/10`],
                  ["Mobility", `${form.mobility[0]}/10`],
                  ["Activities", form.activities.join(", ") || "—"],
                  ["Recent surgery", form.surgery],
                  ["Reports", form.reports.length ? `${form.reports.length} attached` : "None"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-muted/40 p-3">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="mt-1 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              {form.description && (
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Description</div>
                  <div className="mt-1 text-sm">{form.description}</div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next} className="bg-gradient-hero shadow-elegant">
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
                  <Button onClick={submit} disabled={submitting} className="bg-gradient-hero shadow-elegant">
                {submitting ? "Saving assessment…" : "Submit assessment"}
              </Button>
            )}
          </div>
        </Card>
      </div>
      <SiteFooter />
    </div>
  );
}
