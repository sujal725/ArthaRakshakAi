import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, MapPin, TrendingUp, ShieldAlert, Sparkles, ArrowRight, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { TwinHint } from "@/components/TwinHint";
import { Counter } from "@/components/Counter";
import { useT } from "@/i18n/translations";
import { useGuardianMemory } from "@/context/GuardianMemory";
import {
  generateScamTrends, generateCommunityStories, generateCommunityImpact, generateCommunityPolls,
} from "@/lib/community";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Guardian Network — ArthaRakshak" },
      { name: "description", content: "Live scam alerts, Guardian stories and community impact across India." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <CommunityPage />
    </RequireAuth>
  ),
});

function CommunityPage() {
  const t = useT();
  const memory = useGuardianMemory();
  const trends = generateScamTrends();
  const stories = generateCommunityStories(memory);
  const impact = generateCommunityImpact();
  const polls = generateCommunityPolls(memory);

  const sevTone = (s: "low" | "medium" | "high") =>
    s === "high" ? "text-destructive" : s === "medium" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600";

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Guardian Network</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            See what other Guardians across India are doing — scams blocked, schemes unlocked, decisions shared.
          </p>
        </header>

        <TwinHint context="community" />

        {/* Scam Trends */}
        <section aria-labelledby="trends-h" className="mt-8">
          <h2 id="trends-h" className="text-xl font-semibold text-foreground">Live Scam Trends</h2>
          <p className="text-sm text-muted-foreground">Patterns reported by Guardians in your region.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trends.map((t) => (
              <article key={t.city} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" aria-hidden />
                  <span>{t.city}</span>
                </div>
                <p className="mt-2 font-medium text-foreground">{t.trend}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${sevTone(t.severity)}`}>
                    <ShieldAlert className="size-3.5" aria-hidden />
                    {t.severity.toUpperCase()} severity
                  </span>
                  <span className="text-xs text-muted-foreground">{t.count} reports</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Guardian Stories */}
        <section aria-labelledby="stories-h" className="mt-10">
          <h2 id="stories-h" className="text-xl font-semibold text-foreground">Guardian Stories</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {stories.map((s) => (
              <article key={s.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                    <Users className="size-5" aria-hidden />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.persona}</p>
                  </div>
                </div>
                <blockquote className="mt-3 text-sm text-foreground">"{s.quote}"</blockquote>
                <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="size-3" aria-hidden /> {s.outcome}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Ask the Community */}
        <section aria-labelledby="polls-h" className="mt-10">
          <h2 id="polls-h" className="text-xl font-semibold text-foreground">{t("com_polls")}</h2>
          <p className="text-sm text-muted-foreground">{t("com_polls_sub")}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {polls.map((p) => (
              <article key={p.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="size-4" aria-hidden />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">{t("com_poll_question")}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-foreground">{p.question}</h3>

                {p.options ? (
                  <ul className="mt-3 space-y-2" aria-label="Poll results">
                    {p.options.map((o) => (
                      <li key={o.label}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{o.label}</span>
                          <span className="font-semibold text-foreground">{o.pct}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-muted" role="progressbar" aria-valuenow={o.pct} aria-valuemin={0} aria-valuemax={100}>
                          <div className="h-full rounded-full bg-primary" style={{ width: `${o.pct}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{p.majorityPct}% {t("com_guardians_say")}:</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{p.majorityChoice}</p>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted" role="progressbar" aria-valuenow={p.majorityPct} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full bg-primary" style={{ width: `${p.majorityPct}%` }} />
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{t("com_ai_summary")}</p>
                  <p className="mt-1 text-foreground">{p.aiSummary}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">{t("com_view_analysis")}</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>{p.question}</DialogTitle>
                      <DialogDescription>{p.aiSummary}</DialogDescription>
                      <div className="mt-2 rounded-xl bg-muted p-3 text-sm text-foreground">
                        {p.majorityPct}% of Guardians chose: <strong>{p.majorityChoice}</strong>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {p.ctaRoute && (
                    <Button asChild size="sm">
                      <Link to={p.ctaRoute}>{p.ctaLabel ?? "Open"} <ArrowRight className="ml-1 size-4" aria-hidden /></Link>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Community Impact */}
        <section aria-labelledby="impact-h" className="mt-10 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-500 p-8 text-white">
          <h2 id="impact-h" className="text-2xl font-semibold">Community Impact</h2>
          <p className="mt-1 text-white/85">Together, Guardians make India safer.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impact.map((m) => (
              <div key={m.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-white/80">
                  <TrendingUp className="size-4" aria-hidden />
                  <span className="text-xs uppercase tracking-wide">{m.label}</span>
                </div>
                <p className="mt-2 text-2xl font-bold" aria-live="polite">{m.value}</p>
                <p className="text-xs text-white/80">{m.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}