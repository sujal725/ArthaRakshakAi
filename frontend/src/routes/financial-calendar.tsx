import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, ChevronLeft, ChevronRight, Sparkles, ShieldAlert,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ShieldCheck,
  OctagonAlert, Download, ExternalLink, Wallet, Receipt, PiggyBank, Landmark,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useT } from "@/i18n/translations";
import { useApp } from "@/context/AppContext";
import { derivePersona } from "@/lib/persona";
import {
  generateCalendarEvents, generateAIInsights, generateDangerAlert,
  getUpcomingEvents, type CalendarEvent, type CalendarCategory,
} from "@/lib/calendar";
import {
  predictCashFlow, analyzeCashFlowRisk, generateEarlyWarning,
  generateFinancialPersonality, projectTimeline,
} from "@/lib/cashflow";
import { useGuardianMemory } from "@/context/GuardianMemory";
import { TwinHint } from "@/components/TwinHint";
import heroImg from "@/assets/financial-calendar-hero.png";
import insightsImg from "@/assets/calendar-ai-insights.png";
import cashHero from "@/assets/cash-flow-hero.png";
import personaImg from "@/assets/financial-persona-seasonal.png";

export const Route = createFileRoute("/financial-calendar")({
  head: () => ({
    meta: [
      { title: "Financial Calendar — ArthaRakshak" },
      { name: "description", content: "Track EMIs, SIPs, salary credits and government schemes with AI cash-flow forecasts." },
    ],
  }),
  component: FinancialCalendarGuarded,
});

function FinancialCalendarGuarded() {
  const t = useT();
  return (
    <RequireAuth>
      <div className="min-h-dvh bg-background">
        <Navbar />
        <main className="mx-auto max-w-[1200px] px-6 py-10">
          <header className="mb-8 grid items-center gap-6 md:grid-cols-[1fr_240px]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                <CalendarDays className="size-3.5" /> {t("fc_badge")}
              </span>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t("fc_title")}</h1>
              <p className="mt-3 max-w-xl text-muted-foreground">{t("fc_sub")}</p>
            </div>
            <img src={heroImg} alt="" width={480} height={480} loading="lazy" className="hidden size-56 justify-self-end animate-float-soft md:block" />
          </header>

          <TwinHint context="calendar" />

          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 rounded-2xl bg-accent p-1">
              <TabsTrigger value="calendar" className="rounded-xl">{t("fc_tabCalendar")}</TabsTrigger>
              <TabsTrigger value="cashflow" className="rounded-xl">{t("fc_tabCashFlow")}</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-6"><CalendarTab /></TabsContent>
            <TabsContent value="cashflow" className="mt-6"><CashFlowTab /></TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}

/* ====================== CALENDAR TAB ====================== */

const CATEGORY_STYLE: Record<CalendarCategory, { chip: string; dot: string; label: string; Icon: typeof Wallet }> = {
  income:      { chip: "bg-primary/15 text-primary",    dot: "bg-primary",   label: "Income",     Icon: Wallet },
  expense:     { chip: "bg-destructive/15 text-destructive", dot: "bg-destructive", label: "Expense", Icon: Receipt },
  investment:  { chip: "bg-secondary/30 text-foreground",dot: "bg-secondary",label: "Investment", Icon: PiggyBank },
  government:  { chip: "bg-warning/20 text-warning-foreground",dot: "bg-warning",label: "Govt",   Icon: Landmark },
  seasonal:    { chip: "bg-violet-500/15 text-violet-600",dot: "bg-violet-500",label: "Seasonal",Icon: PartyPopper },
};

function CalendarTab() {
  const t = useT();
  const { incomeType, concerns } = useApp();
  const persona = useMemo(() => derivePersona(incomeType), [incomeType]);
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const events = useMemo(
    () => generateCalendarEvents({ monthIndex: cursor.getMonth(), year: cursor.getFullYear(), incomeType, concerns }),
    [cursor, incomeType, concerns],
  );
  const insights = useMemo(
    () => generateAIInsights({ persona, incomeType, concerns, events, monthIndex: cursor.getMonth() }),
    [persona, incomeType, concerns, events, cursor],
  );
  const danger = useMemo(
    () => generateDangerAlert({ persona, incomeType, concerns, events }),
    [persona, incomeType, concerns, events],
  );
  const upcoming = useMemo(() => getUpcomingEvents(events, today), [events]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-6">
        <CalendarGrid cursor={cursor} setCursor={setCursor} events={events} t={t} />

        {/* Export Actions */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-full" onClick={() => toast(t("fc_exportSoon"))}>
            <ExternalLink className="size-4" /> {t("fc_exportGoogle")}
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => toast(t("fc_exportSoon"))}>
            <Download className="size-4" /> {t("fc_exportPdf")}
          </Button>
        </div>

        {/* AI Smart Insights */}
        <article className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-secondary/10 p-6 shadow-sm">
          <img src={insightsImg} alt="" width={180} height={180} loading="lazy" className="pointer-events-none absolute -right-6 -top-6 size-36 opacity-70 animate-float-soft" />
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground animate-pulse-ring">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("fc_insightsTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("fc_insightsSub")}</p>
            </div>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {insights.map((ins) => (
              <li key={ins.id} className="rounded-2xl border border-border bg-card/80 p-4 card-lift">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ToneIcon tone={ins.tone} /> {ins.title}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{ins.recommendation}</p>
              </li>
            ))}
          </ul>
        </article>

        {/* Upcoming Financial Danger */}
        <article className="rounded-3xl border border-destructive/25 bg-gradient-to-br from-destructive/8 via-card to-warning/10 p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-destructive/15 text-destructive">
              <ShieldAlert className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive">{t("fc_dangerTitle")}</p>
              <p className="mt-1 text-lg font-semibold">{danger.title}</p>
              <p className="mt-1 text-sm text-foreground">{danger.message}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <ShieldCheck className="size-3.5" /> {t("fc_dangerFooter")}
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Upcoming sidebar */}
      <aside className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("fc_upcoming")}</h2>
        {upcoming.map((u, i) => {
          const style = CATEGORY_STYLE[u.event.category];
          return (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 card-lift">
              <p className="text-xs font-semibold uppercase text-primary">{u.label}</p>
              <p className="mt-1 text-sm font-semibold">{u.event.title}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.chip}`}>
                  <style.Icon className="size-3" /> {style.label}
                </span>
                {u.event.amount && <span className="text-sm font-semibold">₹{u.event.amount.toLocaleString("en-IN")}</span>}
              </div>
            </div>
          );
        })}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{t("fc_legend")}</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {(Object.keys(CATEGORY_STYLE) as CalendarCategory[]).map((k) => {
              const s = CATEGORY_STYLE[k];
              return (
                <div key={k} className="flex items-center gap-1.5">
                  <span className={`size-2.5 rounded-full ${s.dot}`} />
                  <s.Icon className="size-3 text-muted-foreground" />
                  <span>{t(`fc_cat_${k}`)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

function ToneIcon({ tone }: { tone: "warn" | "celebrate" | "info" | "credit" }) {
  const map = {
    warn: <AlertTriangle className="size-4 text-warning" aria-hidden />,
    celebrate: <PartyPopper className="size-4 text-violet-500" aria-hidden />,
    info: <Sparkles className="size-4 text-primary" aria-hidden />,
    credit: <Receipt className="size-4 text-destructive" aria-hidden />,
  };
  return map[tone];
}

function CalendarGrid({
  cursor, setCursor, events, t,
}: {
  cursor: Date;
  setCursor: (d: Date) => void;
  events: CalendarEvent[];
  t: (k: string) => string;
}) {
  const today = new Date();
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDay = new Map<number, CalendarEvent[]>();
  for (const e of events) {
    const list = byDay.get(e.date.getDate()) ?? [];
    list.push(e);
    byDay.set(e.date.getDate(), list);
  }

  const dows = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label={t("fc_prev")} className="rounded-full" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="min-w-44 text-center text-lg font-bold">{monthLabel}</h2>
          <Button variant="ghost" size="icon" aria-label={t("fc_next")} className="rounded-full" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}>
          {t("fc_today")}
        </Button>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground">
        {dows.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="aspect-square rounded-2xl bg-transparent" />;
          const list = byDay.get(day) ?? [];
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <HoverCard key={i} openDelay={120}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className={`group relative flex aspect-square w-full flex-col items-stretch overflow-hidden rounded-2xl border bg-card p-1.5 text-left transition card-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isToday ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                  aria-label={`${day} ${monthLabel}, ${list.length} events`}
                >
                  <span className={`text-[11px] font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day}</span>
                  <div className="mt-0.5 flex flex-1 flex-col gap-0.5 overflow-hidden">
                    {list.slice(0, 2).map((e) => {
                      const s = CATEGORY_STYLE[e.category];
                      return (
                        <span key={e.id} className={`flex items-center gap-1 truncate rounded-md px-1 py-0.5 text-[9px] font-medium ${s.chip}`}>
                          <s.Icon className="size-2.5 shrink-0" />
                          <span className="truncate">{e.title}</span>
                        </span>
                      );
                    })}
                    {list.length > 2 && (
                      <span className="text-[9px] font-semibold text-muted-foreground">+{list.length - 2}</span>
                    )}
                  </div>
                </button>
              </HoverCardTrigger>
              {list.length > 0 && (
                <HoverCardContent className="w-64">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{day} {monthLabel}</p>
                  <ul className="space-y-2">
                    {list.map((e) => {
                      const s = CATEGORY_STYLE[e.category];
                      return (
                        <li key={e.id} className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className={`mt-0.5 grid size-5 place-items-center rounded-full ${s.chip}`}><s.Icon className="size-3" /></span>
                            <div>
                              <p className="text-sm font-medium">{e.title}</p>
                              <p className="text-[10px] text-muted-foreground">{s.label}</p>
                            </div>
                          </div>
                          {e.amount && <span className="shrink-0 text-sm font-semibold">₹{e.amount.toLocaleString("en-IN")}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </HoverCardContent>
              )}
            </HoverCard>
          );
        })}
      </div>
    </section>
  );
}

/* ====================== CASH FLOW TAB ====================== */

function CashFlowTab() {
  const t = useT();
  const { incomeType, concerns } = useApp();
  const memory = useGuardianMemory();
  const persona = useMemo(() => derivePersona(incomeType), [incomeType]);
  const monthIndex = new Date().getMonth();
  const prediction = useMemo(() => predictCashFlow({ incomeType, monthIndex }), [incomeType, monthIndex]);
  const risk = useMemo(() => analyzeCashFlowRisk({ incomeType, concerns, prediction }), [incomeType, concerns, prediction]);
  const warning = useMemo(() => generateEarlyWarning({ persona, incomeType, concerns, prediction, monthIndex }), [persona, incomeType, concerns, prediction, monthIndex]);
  const personality = useMemo(() => generateFinancialPersonality({ persona, incomeType }), [persona, incomeType]);
  const timeline = useMemo(() => projectTimeline({ incomeType }), [incomeType]);

  useEffect(() => {
    memory.setCashFlowRisk(risk.level);
    memory.logAction({ module: "calendar", action: `Reviewed cash flow — ${risk.level} risk`, riskImpact: risk.level === "high" ? 5 : -2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risk.level]);

  const RiskIcon = risk.level === "low" ? ShieldCheck : risk.level === "medium" ? AlertTriangle : OctagonAlert;
  const riskChip =
    risk.level === "low" ? "bg-primary/15 text-primary"
    : risk.level === "medium" ? "bg-warning/20 text-warning-foreground"
    : "bg-destructive/15 text-destructive";
  const riskLabel = risk.level === "low" ? t("cf_riskLow") : risk.level === "medium" ? t("cf_riskMedium") : t("cf_riskHigh");

  return (
    <div className="space-y-6">
      <section className="grid items-center gap-6 rounded-3xl border border-border bg-card p-6 md:grid-cols-[1fr_220px]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" /> {t("cf_badge")}
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{t("cf_title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("cf_sub")}</p>
        </div>
        <img src={cashHero} alt="" width={420} height={420} loading="lazy" className="hidden size-48 justify-self-end animate-float-soft md:block" />
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label={t("cf_income")}    value={prediction.summary.income}    Icon={TrendingUp}   tone="primary" />
        <SummaryCard label={t("cf_expenses")}  value={prediction.summary.expenses}  Icon={TrendingDown} tone="destructive" />
        <SummaryCard label={t("cf_savings")}   value={prediction.summary.savings}   Icon={PiggyBank}    tone="secondary" />
        <SummaryCard label={t("cf_forecast")}  value={prediction.summary.forecast}  Icon={Sparkles}     tone="primary" hint="Predicted" />
      </section>

      {/* Forecast graph */}
      <ForecastGraph prediction={prediction} />

      {/* Risk indicator + analysis */}
      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className={`flex flex-col items-start gap-3 rounded-3xl border border-border bg-card p-6 ${riskChip}`}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{t("cf_riskTitle")}</p>
          <div className="flex items-center gap-2">
            <RiskIcon className="size-7" aria-hidden />
            <span className="text-2xl font-bold">{riskLabel}</span>
          </div>
        </div>
        <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 md:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="size-4 text-warning" /> {t("cf_reasons")}</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {risk.reasons.map((r) => <li key={r} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />{r}</li>)}
            </ul>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 text-primary" /> {t("cf_recommendations")}</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {risk.recommendations.map((r) => <li key={r} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />{r}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* AI Early Warning */}
      <article className="rounded-3xl border border-destructive/25 bg-gradient-to-br from-destructive/8 via-card to-warning/10 p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-destructive">⚠ {t("cf_earlyTitle")}</p>
            <p className="mt-1 text-lg font-semibold">{warning.message}</p>
          </div>
        </div>
      </article>

      {/* Seasonal personality */}
      <article className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-emerald p-6 text-primary-foreground">
        <img src={personaImg} alt="" width={380} height={380} loading="lazy" className="pointer-events-none absolute -right-6 -bottom-6 size-48 opacity-90 animate-float-soft" />
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">{t("cf_personality")}</p>
        <h3 className="mt-1 text-3xl font-bold">{personality.title}</h3>
        <p className="mt-2 max-w-xl text-sm opacity-95">{personality.risk}</p>
        <p className="mt-3 max-w-xl text-sm opacity-90"><strong>Advice:</strong> {personality.advice}</p>
      </article>

      {/* Timeline */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("cf_timeline")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((row) => (
            <div key={row.year} className="rounded-2xl border border-border bg-card p-4 card-lift">
              <p className="text-lg font-bold">{row.year}</p>
              <dl className="mt-3 space-y-1.5 text-sm">
                <Row label={t("cf_t_income")} value={`₹${(row.income/1000).toFixed(0)}k`} />
                <Row label={t("cf_t_savings")} value={`₹${(row.savings/1000).toFixed(0)}k`} />
                <Row label={t("cf_t_expenses")} value={`₹${(row.expenses/1000).toFixed(0)}k`} />
                <Row label={t("cf_t_risk")} value={row.risk === "low" ? t("cf_riskLow") : row.risk === "medium" ? t("cf_riskMedium") : t("cf_riskHigh")} />
                <Row label={t("cf_t_net")} value={`₹${(row.netWorth/100000).toFixed(1)}L`} bold />
              </dl>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? "font-bold" : "font-medium"}>{value}</dd>
    </div>
  );
}

function SummaryCard({ label, value, Icon, tone, hint }: { label: string; value: number; Icon: typeof Wallet; tone: "primary" | "destructive" | "secondary"; hint?: string }) {
  const tones = {
    primary: "bg-primary/15 text-primary",
    destructive: "bg-destructive/15 text-destructive",
    secondary: "bg-secondary/30 text-foreground",
  } as const;
  return (
    <div className="rounded-3xl border border-border bg-card p-5 card-lift">
      <div className="flex items-center gap-2">
        <span className={`grid size-9 place-items-center rounded-full ${tones[tone]}`}><Icon className="size-4" /></span>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold">₹{value.toLocaleString("en-IN")}</p>
      {hint && <p className="mt-0.5 text-[10px] font-semibold uppercase text-primary">{hint}</p>}
    </div>
  );
}

function ForecastGraph({ prediction }: { prediction: ReturnType<typeof predictCashFlow> }) {
  const W = 560, H = 280, P = 36;
  const months = prediction.months;
  const max = Math.max(...months.flatMap((m) => [m.income, m.expenses, m.savings])) * 1.15;
  const xStep = (W - P * 2) / (months.length - 1);
  const yAt = (v: number) => H - P - (v / max) * (H - P * 2);
  const xAt = (i: number) => P + i * xStep;

  const solidEnd = months.findIndex((m) => m.predicted);
  const splitIdx = solidEnd === -1 ? months.length - 1 : solidEnd - 1;

  function line(get: (m: (typeof months)[number]) => number, from: number, to: number) {
    return months.slice(from, to + 1).map((m, idx) => `${idx === 0 ? "M" : "L"} ${xAt(from + idx)} ${yAt(get(m))}`).join(" ");
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">6-month forecast</p>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Legend color="bg-primary" label="Income" />
          <Legend color="bg-destructive" label="Expenses" />
          <Legend color="bg-secondary" label="Savings" />
          <Legend color="bg-primary" dashed label="AI Predicted" />
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-72 w-full" role="img" aria-label="Six month income, expenses and savings forecast">
        {/* gridlines */}
        {Array.from({ length: 4 }).map((_, i) => {
          const y = P + ((H - P * 2) / 4) * (i + 1);
          return <line key={i} x1={P} x2={W - P} y1={y} y2={y} stroke="var(--color-border)" strokeDasharray="3 4" />;
        })}
        {/* solid past lines */}
        <path d={line((m) => m.income, 0, splitIdx)} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
        <path d={line((m) => m.expenses, 0, splitIdx)} fill="none" stroke="var(--color-destructive)" strokeWidth="2.5" strokeLinecap="round" />
        <path d={line((m) => m.savings, 0, splitIdx)} fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" />
        {/* dashed prediction */}
        <path d={line((m) => m.income, splitIdx, months.length - 1)} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeDasharray="6 6" />
        <path d={line((m) => m.expenses, splitIdx, months.length - 1)} fill="none" stroke="var(--color-destructive)" strokeWidth="2.5" strokeDasharray="6 6" />
        <path d={line((m) => m.savings, splitIdx, months.length - 1)} fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeDasharray="6 6" />
        {/* points */}
        {months.map((m, i) => (
          <g key={i}>
            <circle cx={xAt(i)} cy={yAt(m.income)} r="3" fill="var(--color-primary)" />
            <circle cx={xAt(i)} cy={yAt(m.expenses)} r="3" fill="var(--color-destructive)" />
            <circle cx={xAt(i)} cy={yAt(m.savings)} r="3" fill="var(--color-secondary)" />
            <text x={xAt(i)} y={H - 10} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>
              {m.label}{m.predicted ? "·AI" : ""}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className={`inline-block h-0.5 w-6 rounded ${color} ${dashed ? "opacity-60" : ""}`} style={dashed ? { backgroundImage: "repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 8px)", backgroundColor: "transparent" } : undefined} />
      {label}
    </span>
  );
}