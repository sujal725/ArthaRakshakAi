import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Landmark, Sparkles, ExternalLink, CheckCircle2, FileText, Zap,
  Award, Target,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useT } from "@/i18n/translations";
import { useApp } from "@/context/AppContext";
import { derivePersona } from "@/lib/persona";
import {
  getEligibleSchemes, getSchemeRecommendations, TAG_LABELS, type Scheme, type SchemeTag,
} from "@/lib/schemes";
import { useGuardianMemory } from "@/context/GuardianMemory";
import { TwinHint } from "@/components/TwinHint";
import { useEffect } from "react";
import schemesHero from "@/assets/govt-schemes-hero.png";
import finderImg from "@/assets/scheme-finder.png";

interface SchemeMatchResult { id: string; match: number; reason: string }

async function callSchemeMatchAPI(opts: {
  incomeType: string | null;
  category: string | null;
  concerns: string[];
  candidates: { id: string; name: string; eligibility: string; tags: string[] }[];
  language: string;
}): Promise<SchemeMatchResult[]> {
  const deviceId = localStorage.getItem("artharakshak_device_id") ?? "";
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schemes/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_id: deviceId,
      income_type: opts.incomeType,
      category: opts.category,
      concerns: opts.concerns,
      candidates: opts.candidates,
      language: opts.language,
    }),
  });
  if (!res.ok) throw new Error("Scheme match request failed");
  const data = await res.json();
  return data.results as SchemeMatchResult[];
}

export const Route = createFileRoute("/government-schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes — ArthaRakshak" },
      { name: "description", content: "AI-matched central government schemes with eligibility, documents and official links." },
    ],
  }),
  component: GovSchemesGuarded,
});

const INCOME_TO_TAG: Record<string, SchemeTag> = {
  salary: "salary", gig: "gig", farmer: "farmer", business: "business", student: "student", retired: "retired",
};

function GovSchemesGuarded() {
  const t = useT();
  const { incomeType, concerns, language } = useApp();
  const memory = useGuardianMemory();
  const persona = useMemo(() => derivePersona(incomeType), [incomeType]);
  const defaultTag: SchemeTag | null = incomeType ? INCOME_TO_TAG[incomeType] ?? null : null;
  const [activeTag, setActiveTag] = useState<SchemeTag | null>(defaultTag);

  // Filtered, category-scoped candidate list (deterministic fallback scores)
  const filtered = useMemo(() => getEligibleSchemes(activeTag, { incomeType, concerns }), [activeTag, incomeType, concerns]);

  // Live AI match scores — overwrite the fallback scores in `filtered` once they arrive
  const [aiResults, setAiResults] = useState<Record<string, SchemeMatchResult>>({});
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMatchLoading(true);
    callSchemeMatchAPI({
      incomeType,
      category: activeTag,
      concerns,
      candidates: filtered.map(({ scheme }) => ({
        id: scheme.id, name: scheme.name, eligibility: scheme.eligibility, tags: scheme.tags,
      })),
      language,
    })
      .then((results) => {
        if (cancelled) return;
        const byId: Record<string, SchemeMatchResult> = {};
        for (const r of results) byId[r.id] = r;
        setAiResults(byId);
      })
      .catch(() => { /* fall back to deterministic scores already in `filtered` */ })
      .finally(() => { if (!cancelled) setMatchLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, incomeType, language]);

  // Merge: AI match % + reason when available, deterministic fallback otherwise
  const sorted = useMemo(() => {
    return filtered
      .map(({ scheme, match }) => ({
        scheme,
        match: aiResults[scheme.id]?.match ?? match,
        reason: aiResults[scheme.id]?.reason ?? null,
      }))
      .sort((a, b) => b.match - a.match);
  }, [filtered, aiResults]);

  const reco = useMemo(() => getSchemeRecommendations({ incomeType, concerns, personaName: persona.name }), [incomeType, concerns, persona]);

  const loggedTagRef = useState(() => ({ current: "" }))[0];
  useEffect(() => {
    // Only fire once AI scores have actually loaded (avoid the deterministic-fallback
    // pass triggering a duplicate notification before the real match arrives).
    if (matchLoading) return;
    const top = sorted.slice(0, 3).map((s) => s.scheme.id);
    if (top.length === 0) return;

    const tagKey = `${activeTag ?? "none"}`;
    if (loggedTagRef.current === tagKey) return; // already logged for this category
    loggedTagRef.current = tagKey;

    const reasonsMap: Record<string, string> = {};
    for (const s of sorted.slice(0, 3)) {
      if (s.reason) reasonsMap[s.scheme.id] = s.reason;
    }
    memory.setRecommendedSchemes(top, reasonsMap);
    memory.logAction({
      module: "schemes",
      action: `Matched ${top.length} schemes — top: ${sorted[0]?.scheme.name ?? ""}`,
      riskImpact: -8,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, matchLoading, sorted]);

  const allTags = Object.keys(TAG_LABELS) as SchemeTag[];

  return (
    <RequireAuth>
      <div className="min-h-dvh bg-background">
        <Navbar />
        <main className="mx-auto max-w-[1200px] px-6 py-10">
          <header className="mb-8 grid items-center gap-6 md:grid-cols-[1fr_240px]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                <Landmark className="size-3.5" /> {t("gs_badge")}
              </span>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t("gs_title")}</h1>
              <p className="mt-3 max-w-xl text-muted-foreground">{t("gs_sub")}</p>
            </div>
            <img src={schemesHero} alt="" width={480} height={480} loading="lazy" className="hidden size-56 justify-self-end animate-float-soft md:block" />
          </header>

          <TwinHint context="schemes" />

          {/* Search chips */}
          <section className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("gs_searchBy")}</p>
                <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("gs_searchBy")}>
                  {allTags.map((tag) => {
                    const active = activeTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveTag(active ? null : tag)}
                        aria-pressed={active}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"
                          }`}
                      >
                        {TAG_LABELS[tag]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <img src={finderImg} alt="" width={140} height={140} loading="lazy" className="hidden size-24 shrink-0 md:block" />
            </div>
          </section>

          {/* AI Recommendation banner */}
          <section className="mt-6 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-emerald p-6 text-primary-foreground">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-white/20 animate-pulse-ring">
                <Sparkles className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-90">{t("gs_recoTitle")}</p>
                <ul className="mt-2 space-y-1 text-sm opacity-95">
                  {reco.reasonBullets.map((b) => (
                    <li key={b} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {b}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  {reco.schemes.map((s) => (
                    <span key={s.id} className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{s.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Scheme cards */}
          <section className="mt-6 grid gap-5 md:grid-cols-2">
            {matchLoading && sorted.length === 0 && (
              <p className="col-span-2 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Matching schemes for this category…
              </p>
            )}
            {sorted.length === 0 && !matchLoading && (
              <p className="col-span-2 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No schemes found for this category yet.
              </p>
            )}
            {sorted.map(({ scheme, match, reason }) => (
              <SchemeCard key={scheme.id} scheme={scheme} match={match} reason={reason} t={t} />
            ))}
          </section>

          {/* Comparison table */}
          <section className="mt-8 rounded-3xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold">{t("gs_compare")}</h2>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scheme</TableHead>
                    <TableHead>Benefit</TableHead>
                    <TableHead>Eligibility</TableHead>
                    <TableHead>{t("gs_difficulty")}</TableHead>
                    <TableHead className="text-right">{t("gs_match")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map(({ scheme, match }) => (
                    <TableRow key={scheme.id}>
                      <TableCell className="font-medium">{scheme.name}</TableCell>
                      <TableCell className="text-muted-foreground">{scheme.benefit}</TableCell>
                      <TableCell className="text-muted-foreground">{scheme.eligibility}</TableCell>
                      <TableCell><DifficultyBadge difficulty={scheme.difficulty} t={t} /></TableCell>
                      <TableCell className="text-right font-bold text-primary">{match}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}

function SchemeCard({ scheme, match, reason, t }: { scheme: Scheme; match: number; reason?: string | null; t: (k: string) => string }) {
  const eligible = match >= 70;
  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm card-lift">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold leading-tight">{scheme.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{scheme.benefit}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${eligible ? "bg-primary/15 text-primary" : "bg-warning/20 text-warning-foreground"}`}>
          {eligible ? <CheckCircle2 className="size-3" /> : <Target className="size-3" />}
          {eligible ? t("gs_eligible") : t("gs_check")}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-emerald text-primary-foreground">
          <span className="text-lg font-bold">{match}%</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">{t("gs_match")}</p>
          <DifficultyBadge difficulty={scheme.difficulty} t={t} />
        </div>
      </div>

      {reason && (
        <p className="mt-3 rounded-xl bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
          <span className="font-semibold text-primary">AI: </span>{reason}
        </p>
      )}

      <div className="mt-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-primary"><Award className="size-3.5" /> {t("gs_benefits")}</p>
        <ul className="mt-2 space-y-1 text-sm text-foreground">
          {scheme.benefits.map((b) => (
            <li key={b} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" /> {b}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-primary"><FileText className="size-3.5" /> {t("gs_documents")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {scheme.documents.map((d) => (
            <span key={d} className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">{d}</span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-primary"><Zap className="size-3.5" /> {t("gs_steps")}</p>
        <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
          {scheme.steps.map((s, i) => (
            <li key={s} className="flex gap-2"><span className="grid size-4 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>{s}</li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t("gs_official")}: ${scheme.name}`}>
            <ExternalLink className="size-4" /> {t("gs_official")}
          </a>
        </Button>
        <Button size="sm" className="ml-auto rounded-full bg-gradient-emerald" onClick={() => toast(t("gs_applySoon"))}>
          {t("gs_apply")}
        </Button>
      </div>
    </article>
  );
}

function DifficultyBadge({ difficulty, t }: { difficulty: Scheme["difficulty"]; t: (k: string) => string }) {
  const map = {
    easy: { chip: "bg-primary/15 text-primary", label: t("gs_easy") },
    medium: { chip: "bg-warning/20 text-warning-foreground", label: t("gs_medium") },
    hard: { chip: "bg-destructive/15 text-destructive", label: t("gs_hard") },
  } as const;
  const s = map[difficulty];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.chip}`}>
      <Zap className="size-3" aria-hidden /> {s.label}
    </span>
  );
}