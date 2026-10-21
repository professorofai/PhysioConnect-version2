import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, type Physio } from "@/lib/api";
import { physios as defaultPhysios } from "@/lib/mock-data";
import { Search, MapPin, Star, Clock, SlidersHorizontal, Loader2 } from "lucide-react";

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find a Physio — Physio Connect" },
      { name: "description", content: "Search verified physiotherapists near you by specialty, availability and rating." },
      { property: "og:title", content: "Find a Physio — Physio Connect" },
      { property: "og:description", content: "Browse trusted physiotherapists and book a session in minutes." },
    ],
  }),
  component: FindPage,
});

const specialties = ["All","Sports Injury","ACL Recovery","Stroke Recovery","Pelvic Floor","Knee Replacement","Fall Prevention","Running Injuries"];

function FindPage() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("All");
  const [physioList, setPhysioList] = useState<Physio[]>(defaultPhysios);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getPhysios(q, spec).then((data) => {
      if (active) {
        setPhysioList(data);
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [q, spec]);

  const filtered = physioList;


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-gradient-subtle border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Find a physiotherapist near you</h1>
          <p className="mt-2 text-muted-foreground">Verified specialists, real availability, book in a few taps.</p>

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-card sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, clinic, condition…" className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0" />
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex items-center gap-2 px-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Bengaluru, KA</span>
            </div>
            <Button className="bg-gradient-hero shadow-elegant">Search</Button>
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
            {specialties.map(s => (
              <button
                key={s}
                onClick={() => setSpec(s)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${spec === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}
              >{s}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-4 text-sm text-muted-foreground">{filtered.length} specialists available</div>
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map(p => (
            <Card key={p.id} className="border-border/60 p-5 transition-all hover:shadow-elegant">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-hero font-display text-lg font-bold text-primary-foreground shadow-elegant">
                  {p.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-tight">{p.name}</h3>
                      <div className="text-sm text-muted-foreground">{p.title} · {p.clinic}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-bold">₹{p.price}</div>
                      <div className="text-xs text-muted-foreground">per session</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city} · {p.distance}</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /><span className="font-semibold text-foreground">{p.rating}</span> ({p.reviews})</span>
                    <span className="flex items-center gap-1 text-success"><Clock className="h-3 w-3" /> {p.nextSlot}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.specialties.map(s => (
                      <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm" className="bg-gradient-hero shadow-elegant">
                      <Link to="/physio/$id" params={{ id: p.id }}>Book session</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/physio/$id" params={{ id: p.id }}>View profile</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No specialists match your filters.
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
