import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api, type Video } from "@/lib/api";
import { videos as defaultVideos } from "@/lib/mock-data";
import { Play, Search, ShieldCheck, Clock } from "lucide-react";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Exercise Library — Physio Connect" },
      { name: "description", content: "Free guided recovery routines from licensed physiotherapists. Back pain, knee rehab, shoulder mobility and more." },
      { property: "og:title", content: "Exercise Library — Physio Connect" },
      { property: "og:description", content: "Guided recovery routines from trusted clinicians." },
    ],
  }),
  component: VideosPage,
});

const cats = ["All","Back Pain","Knee","Shoulder","Post-natal","Geriatric","Ankle"];

function VideosPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [list, setList] = useState<Video[]>(defaultVideos);

  useEffect(() => {
    let active = true;
    api.getVideos(q, cat).then((data) => {
      if (active) setList(data);
    });
    return () => {
      active = false;
    };
  }, [q, cat]);


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border/60 bg-gradient-subtle">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Vetted by licensed physiotherapists
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Exercise & recovery library</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Free demo routines you can follow at home, from the same clinicians you'd book on Physio Connect.</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search routines…" className="pl-9" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {cats.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}
              >{c}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(v => (
            <Card key={v.id} className="group overflow-hidden border-border/60 p-0 transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className={`relative aspect-video bg-gradient-to-br ${v.thumb}`}>
                <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:opacity-0" />
                <button className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-elegant transition-transform group-hover:scale-110">
                    <Play className="h-6 w-6 fill-primary text-primary" />
                  </div>
                </button>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  <Clock className="h-3 w-3" /> {v.duration}
                </div>
                <Badge className="absolute left-2 top-2 bg-white/95 text-foreground hover:bg-white">{v.category}</Badge>
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-semibold leading-snug">{v.title}</h3>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{v.doctor}</span>
                  <span>{v.views} views</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
