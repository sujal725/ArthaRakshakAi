import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldAlert, AlertTriangle, Sparkles, MessageSquare, GitBranch, CalendarDays, FileText,
  TrendingUp, TrendingDown, X, Trophy, Lightbulb, Users, CheckCircle2, ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { useT } from "@/i18n/translations";
import { derivePersona } from "@/lib/persona";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/RequireAuth";
import { toast } from "sonner";
import { useGuardianMemory, type GuardianNotification } from "@/context/GuardianMemory";
import { GuardianScoreCard } from "@/components/GuardianScoreCard";
import { GuardianJourney } from "@/components/GuardianJourney";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import financialTwinImg from "@/assets/financial-twin.png";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ArthaRakshak" }] }),
  component: DashboardGuarded,
});

function DashboardGuarded() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const { incomeType } = useApp();
  const t = useT();
  const persona = derivePersona(incomeType);

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-6 py-10">
        {/* Greeting */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("d_greeting")}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground">{persona.name}</span>
              <span>•</span>
              <span>{t("d_protectedSince")}</span>
            </div>
          </div>
        </header>

        {/* Twin hero + Score / Journey */}
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <FinancialTwinHero />
          <div className="space-y-6">
            <GuardianScoreCard />
            <GuardianJourney />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <HealthScoreCard />
          <RadarCard />
          <ConnectedAlertsCard />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <RecentActivityCard />
          <NotificationFeedFallback />
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">{t("d_quickActions")}</h2>
          <QuickActions />
        </section>
      </main>
      <Footer />
    </div>
  );
}

/* ---------- Financial Twin Hero ---------- */

function FinancialTwinHero() {
  const { financialTwin } = useGuardianMemory();
  const [open, setOpen] = useState(false);
  return (
    <article className="relative overflow-hidden rounded-3xl bg-gradient-emerald p-7 text-primary-foreground shadow-xl shadow-primary/30">
      <img src={financialTwinImg} alt="" width={360} height={360} loading="lazy" className="pointer-events-none absolute -right-6 -bottom-6 size-48 opacity-90 animate-float-soft" />
      <p className="text-xs font-semibold uppercase tracking-wide opacity-85">Your Financial Twin</p>
      <h2 className="mt-1 text-3xl font-bold uppercase tracking-tight">{financialTwin.title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip>Risk: {financialTwin.riskStyle}</Chip>
        <Chip>{financialTwin.spendingPattern.split(".")[0]}</Chip>
        <Chip>Confidence: {financialTwin.futureConfidence}%</Chip>
      </div>
      <p className="mt-4 max-w-md text-sm opacity-95">{financialTwin.adviceStyle}</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-5 rounded-full bg-white text-primary hover:bg-white/90">
            View Insights <ArrowRight className="ml-1 size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>{financialTwin.title} — full insights</DialogTitle>
          <DialogDescription>How your twin spends, saves and plans.</DialogDescription>
          <dl className="mt-2 grid gap-3 text-sm">
            <Row k="Risk style" v={financialTwin.riskStyle} />
            <Row k="Spending" v={financialTwin.spendingPattern} />
            <Row k="Saving" v={financialTwin.savingPattern} />
            <Row k="Advice" v={financialTwin.adviceStyle} />
            <Row k="Regret probability" v={`${financialTwin.regretProbability}%`} />
            <Row k="Future confidence" v={`${financialTwin.futureConfidence}%`} />
          </dl>
        </DialogContent>
      </Dialog>
    </article>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize">{children}</span>;
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3">
      <dt className="text-xs font-semibold uppercase text-muted-foreground">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

/* ---------- Connected Alerts (memory-driven) ---------- */

function ConnectedAlertsCard() {
  const t = useT();
  const { guardianNotifications, dismissNotification } = useGuardianMemory();
  const notifs = guardianNotifications.slice(0, 4);

  if (notifs.length === 0) {
    return <AlertsCard />; // fallback to existing static alerts
  }

  return (
    <article className="rounded-3xl border border-border bg-card p-6 lg:col-span-3">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("d_alerts")}</h2>
        <span className="text-xs text-muted-foreground">From your Guardian</span>
      </div>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {notifs.map((n) => <NotificationCard key={n.id} n={n} onDismiss={dismissNotification} />)}
      </ul>
    </article>
  );
}

function NotificationCard({ n, onDismiss }: { n: GuardianNotification; onDismiss: (id: string) => void }) {
  const TONE = {
    warning: { ring: "border-warning/40 bg-warning/5", icon: AlertTriangle, color: "text-warning-foreground", label: "Warning" },
    tip: { ring: "border-primary/30 bg-primary/5", icon: Lightbulb, color: "text-primary", label: "Tip" },
    achievement: { ring: "border-secondary/40 bg-secondary/10", icon: Trophy, color: "text-foreground", label: "Achievement" },
  }[n.type];
  const Icon = TONE.icon;
  return (
    <li className={`relative rounded-2xl border p-4 ${TONE.ring}`}>
      <button
        type="button"
        onClick={() => onDismiss(n.id)}
        aria-label="Dismiss notification"
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-muted-foreground transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3.5" aria-hidden />
      </button>
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`size-5 ${TONE.color}`} aria-hidden />
        <span className="text-[10px] font-semibold uppercase text-muted-foreground">{TONE.label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{n.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{n.description}</p>
      {n.route && (
        <Button asChild size="sm" variant="outline" className="mt-3 rounded-full">
          <Link to={n.route as "/scam-shield"}>Open <ArrowRight className="ml-1 size-3" /></Link>
        </Button>
      )}
    </li>
  );
}

/* ---------- Recent Guardian Activity ---------- */

function RecentActivityCard() {
  const { actionHistory } = useGuardianMemory();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const rel = (ts: number) => {
    const diff = ts - Date.now();
    const abs = Math.abs(diff);
    if (abs < 60_000) return rtf.format(Math.round(diff / 1000), "second");
    if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), "minute");
    if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), "hour");
    return rtf.format(Math.round(diff / 86_400_000), "day");
  };
  return (
    <article className="rounded-3xl border border-border bg-card p-6">
      <h2 className="mb-3 text-lg font-semibold">Recent Guardian Activity</h2>
      {actionHistory.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
          Your Guardian will log every protection action here.
        </p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {actionHistory.slice(0, 10).map((a) => (
            <li key={a.id} className="flex items-start gap-3 rounded-2xl border border-border bg-accent/20 p-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="size-3.5" aria-hidden />
              </span>
              <div className="flex-1">
                <p className="text-sm">{a.action}</p>
                <p className="text-xs text-muted-foreground">{rel(a.timestamp)} · {a.module}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function NotificationFeedFallback() {
  // Mirror of activity but shows a 'tip of the day' hint when notifications are empty.
  const { guardianNotifications } = useGuardianMemory();
  if (guardianNotifications.length > 0) return <SuggestionsCard />;
  return <SuggestionsCard />;
}

function SuggestionsCard() {
  return (
    <article className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-secondary/10 p-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold">Try next</h2>
      </div>
      <ul className="grid gap-2 text-sm">
        <Suggestion to="/scam-shield" icon={ShieldAlert} label="Check a suspicious message" />
        <Suggestion to="/future-self" icon={GitBranch} label="Simulate two futures" />
        <Suggestion to="/government-schemes" icon={FileText} label="Find a scheme you qualify for" />
        <Suggestion to="/trusted-circle" icon={Users} label="Build your Trusted Circle" />
        <Suggestion to="/voice-mode" icon={MessageSquare} label="Talk to your Voice Guardian" />
      </ul>
    </article>
  );
}

function Suggestion({ to, icon: Icon, label }: { to: "/scam-shield" | "/future-self" | "/government-schemes" | "/trusted-circle" | "/voice-mode"; icon: typeof MessageSquare; label: string }) {
  return (
    <li>
      <Link to={to} className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-3 py-2 transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Icon className="size-4 text-primary" aria-hidden /> {label}
        <ArrowRight className="ml-auto size-3.5 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}

/* ---------- Quick Actions ---------- */

function QuickActions() {
  const t = useT();
  const items = [
    { label: t("d_qa1"), help: t("d_qa1Help"), icon: MessageSquare, to: "/scam-shield" as const },
    { label: t("d_qa2"), help: t("d_qa2Help"), icon: GitBranch, to: "/future-self" as const },
    { label: t("d_qa3"), help: t("d_qa3Help"), icon: CalendarDays, to: "/financial-calendar" as const },
    { label: t("d_qa4"), help: t("d_qa4Help"), icon: FileText, to: "/government-schemes" as const },
    { label: "Trusted Circle", help: "Share decisions with people you trust", icon: Users, to: "/trusted-circle" as const },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((i) => (
        <Link
          key={i.label}
          to={i.to}
          className="card-lift flex flex-col items-start gap-3 rounded-3xl border border-border bg-card p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-accent text-primary">
            <i.icon className="size-5" />
          </span>
          <span className="text-base font-semibold">{i.label}</span>
          <span className="text-sm text-muted-foreground">{i.help}</span>
        </Link>
      ))}
    </div>
  );
}

function HealthScoreCard() {
  const t = useT();
  const { monthlyIncome, monthlyExpenses, existingEmiTotal, hasEmergencyFund } = useApp();

  // Calculate real score from user data
  const income = monthlyIncome ?? 40000;
  const expenses = (monthlyExpenses ?? income * 0.62) + (existingEmiTotal ?? 0);
  const savings = income - expenses;
  const savingsPct = Math.max(0, Math.min(100, Math.round((savings / income) * 100)));
  const emiRatio = existingEmiTotal ? Math.round((existingEmiTotal / income) * 100) : 0;
  const cashFlowScore = Math.max(0, Math.min(100, 100 - emiRatio - (expenses > income ? 30 : 0)));
  const emergencyScore = hasEmergencyFund ? 90 : 40;
  const score = Math.round((savingsPct + cashFlowScore + emergencyScore) / 3);

  const radius = 64;
  const C = 2 * Math.PI * radius;
  const offset = C - (score / 100) * C;
  const bars = [
    { label: t("d_savings"), value: Math.min(100, savingsPct * 3), trend: savingsPct > 15 ? "up" as const : "down" as const },
    { label: t("d_scamSafety"), value: 84, trend: "up" as const },
    { label: t("d_cashFlow"), value: cashFlowScore, trend: cashFlowScore > 60 ? "up" as const : "down" as const },
  ];

  return (
    <article className="rounded-3xl border border-border bg-gradient-to-br from-accent to-card p-6 lg:col-span-2">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">{t("d_healthScore")}</div>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden>
            <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="12" />
            <circle
              cx="80" cy="80" r={radius} fill="none"
              stroke="var(--color-primary)" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-4xl font-bold">{score}</div>
              <div className="text-xs text-muted-foreground">/ 100</div>
              <div className="mt-1 text-xs font-semibold text-primary">{t("d_stable")}</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3 self-stretch">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{b.label}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  {b.value}% {b.trend === "up" ? <TrendingUp className="size-3.5 text-primary" /> : <TrendingDown className="size-3.5 text-destructive" />}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-accent">
                <div className="h-full rounded-full bg-gradient-emerald" style={{ width: `${b.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {monthlyIncome && (
        <div className="mt-4 rounded-2xl bg-accent/60 px-4 py-3 text-sm">
          <span className="font-semibold text-primary">Monthly snapshot: </span>
          <span className="text-foreground">
            Income ₹{monthlyIncome.toLocaleString("en-IN")} ·
            Expenses ₹{Math.round(expenses).toLocaleString("en-IN")} ·
            Savings ₹{Math.max(0, Math.round(savings)).toLocaleString("en-IN")}
          </span>
        </div>
      )}
    </article>
  );
}

function RadarCard() {
  const t = useT();
  const axes = [t("axis_scams"), t("axis_loans"), t("axis_cash"), t("axis_savings"), t("axis_schemes")];
  const values = [0.7, 0.45, 0.65, 0.4, 0.3];
  const cx = 110, cy = 110, R = 80;
  const pt = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };
  const poly = values.map((v, i) => pt(i, R * v).join(",")).join(" ");

  return (
    <article className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">{t("d_decisionRadar")}</div>
      <p className="mb-3 text-sm text-muted-foreground">{t("d_radarHelp")}</p>
      <div className="grid place-items-center">
        <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden>
          {[0.33, 0.66, 1].map((s) => (
            <polygon key={s} points={axes.map((_, i) => pt(i, R * s).join(",")).join(" ")} fill="none" stroke="var(--color-border)" strokeWidth="1" />
          ))}
          {axes.map((_, i) => {
            const [x, y] = pt(i, R);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--color-border)" strokeWidth="1" />;
          })}
          <polygon points={poly} fill="color-mix(in oklab, var(--color-primary) 25%, transparent)" stroke="var(--color-primary)" strokeWidth="2" />
          {axes.map((a, i) => {
            const [x, y] = pt(i, R + 14);
            return <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="var(--color-muted-foreground)">{a}</text>;
          })}
        </svg>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">{t("d_rising")}</p>
    </article>
  );
}

function AlertsCard() {
  const t = useT();
  const alerts = [
    { key: "d_alert1", action: "d_review", time: "2m", tone: "warning" as const, icon: AlertTriangle },
    { key: "d_alert2", action: "d_seePlan", time: "1h", tone: "danger" as const, icon: ShieldAlert },
    { key: "d_alert3", action: "d_checkEligibility", time: "Today", tone: "ok" as const, icon: Sparkles },
  ];
  const TONE: Record<"warning" | "danger" | "ok", string> = {
    warning: "border-warning/40 bg-warning/5 text-warning-foreground",
    danger: "border-destructive/40 bg-destructive/5 text-destructive",
    ok: "border-primary/30 bg-primary/5 text-primary",
  };
  return (
    <article className="rounded-3xl border border-border bg-card p-6 lg:col-span-3">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("d_alerts")}</h2>
      </div>
      <ul className="grid gap-3 md:grid-cols-3">
        {alerts.map(({ key, action, time, tone, icon: Icon }) => (
          <li key={key} className={`rounded-2xl border p-4 ${TONE[tone]}`}>
            <div className="mb-2 flex items-center justify-between">
              <Icon className="size-5" />
              <span className="text-xs opacity-75">{time}</span>
            </div>
            <p className="text-sm font-medium text-foreground">{t(key)}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 rounded-full"
              onClick={() => toast.message(t(action), { description: t("d_comingSoon") })}
            >
              {t(action)}
            </Button>
          </li>
        ))}
      </ul>
    </article>
  );
}