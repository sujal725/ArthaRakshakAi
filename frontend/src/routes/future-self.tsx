import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  GitBranch, Sparkles, TrendingUp, TrendingDown, Briefcase, Car, PiggyBank,
  GraduationCap, AlertCircle, LineChart,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/translations";
import {
  simulateLoanNow, simulateDelayedSIP, formatINR,
  type SimInputs, type Scenario, type SimResult,
} from "@/lib/futureSelf";
import { useGuardianMemory } from "@/context/GuardianMemory";
import { TwinHint } from "@/components/TwinHint";
import futureHero from "@/assets/future-self-hero.png";
import futureCompare from "@/assets/future-comparison.png";
import { toast } from "sonner";

export const Route = createFileRoute("/future-self")({
  head: () => ({
    meta: [
      { title: "Future Self Simulator — ArthaRakshak" },
      { name: "description", content: "Compare two financial futures side by side before making any big decision." },
    ],
  }),
  component: FutureSelfGuarded,
});

function FutureSelfGuarded() {
  return (
    <RequireAuth>
      <FutureSelfPage />
    </RequireAuth>
  );
}

const SCENARIOS: { value: Scenario; icon: typeof Briefcase; key: string }[] = [
  { value: "personal_loan", icon: Briefcase, key: "scn_personal_loan" },
  { value: "vehicle", icon: Car, key: "scn_vehicle" },
  { value: "sip", icon: PiggyBank, key: "scn_sip" },
  { value: "education_loan", icon: GraduationCap, key: "scn_education_loan" },
  { value: "emergency_loan", icon: AlertCircle, key: "scn_emergency_loan" },
  { value: "mutual_fund", icon: LineChart, key: "scn_mutual_fund" },
];

function FutureSelfPage() {
  const t = useT();
  const memory = useGuardianMemory();
  const [scenario, setScenario] = useState<Scenario>("personal_loan");
  const [amount, setAmount] = useState(200000);
  const [rate, setRate] = useState(14);
  const [income, setIncome] = useState(45000);
  const [tenure, setTenure] = useState(36);
  const [savings, setSavings] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ now: SimResult; delay: SimResult } | null>(null);

  async function compare() {
    setLoading(true); setResults(null);
    await new Promise((r) => setTimeout(r, 1400));
    const inputs: SimInputs = { amount, rate, income, tenure, savings, scenario };
    const out = { now: simulateLoanNow(inputs), delay: simulateDelayedSIP(inputs) };
    setResults(out);
    memory.setFutureGoal("Delay loan + Start SIP");
    memory.logAction({
      module: "future",
      action: `Compared ${scenario.replace("_", " ")} — delaying saves more`,
      riskImpact: -15,
    });
    setLoading(false);
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-6 py-10">
        <header className="mb-8 grid items-center gap-6 md:grid-cols-[1fr_220px]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              <GitBranch className="size-3.5" /> {t("fs_badge")}
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t("fs_title")}</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">{t("fs_sub")}</p>
          </div>
          <img src={futureHero} alt="" width={440} height={440} loading="lazy" className="hidden size-52 justify-self-end animate-float-soft md:block" />
        </header>

        <TwinHint context="future" />

        {/* Scenario */}
        <section className="rounded-3xl border border-border bg-card p-6">
          <p className="mb-4 text-sm font-semibold">{t("fs_scenarioQ")}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {SCENARIOS.map(({ value, icon: Icon, key }) => {
              const selected = scenario === value;
              return (
                <button key={value} type="button" onClick={() => setScenario(value)}
                  className={`card-lift flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${selected ? "border-primary bg-accent" : "border-border bg-card"}`}>
                  <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-medium">{t(key)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Inputs */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField id="amount" label={t("fs_loanAmount")} prefix="₹" value={amount} onChange={setAmount} step={5000} />
            <NumberField id="rate" label={t("fs_interestRate")} suffix="%" value={rate} onChange={setRate} step={0.5} />
            <NumberField id="income" label={t("fs_monthlyIncome")} prefix="₹" value={income} onChange={setIncome} step={1000} />
            <NumberField id="tenure" label={t("fs_tenure")} value={tenure} onChange={setTenure} step={6} />
            <NumberField id="savings" label={t("fs_monthlySavings")} prefix="₹" value={savings} onChange={setSavings} step={500} />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={compare} disabled={loading} size="lg" className="rounded-full bg-gradient-emerald px-8">
              {loading ? t("fs_computing") : t("fs_compare")}
            </Button>
          </div>
        </section>

        {results && (
          <>
            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <ComparisonCard tone="danger" result={results.now} t={t} />
              <ComparisonCard tone="success" result={results.delay} t={t} />
            </section>

            <section className="mt-8 rounded-3xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-4">
                <img src={futureCompare} alt="" width={180} height={120} loading="lazy" className="hidden h-16 w-auto sm:block" />
                <h2 className="text-xl font-semibold">{t("fs_timeline")}</h2>
              </div>
              <Timeline now={results.now} delay={results.delay} t={t} />
            </section>

            <section className="mt-8 rounded-3xl bg-gradient-emerald p-7 text-primary-foreground shadow-xl shadow-primary/25">
              <div className="flex items-start gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
                  <Sparkles className="size-6" />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{t("fs_advice")}</p>
                  <p className="mt-2 text-lg font-semibold leading-relaxed">
                    Based on your profile, waiting 12 months and investing ₹{savings.toLocaleString("en-IN")}/month
                    creates a <span className="underline decoration-white/50 underline-offset-2">3× better financial outcome</span> than taking the loan today.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-5 rounded-full bg-white text-primary hover:bg-white/90"
                    onClick={() => toast.success(t("fs_save"), { description: t("fs_savedToast") })}
                  >
                    {t("fs_save")}
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function NumberField({ id, label, value, onChange, step = 1, prefix, suffix }: {
  id: string; label: string; value: number; onChange: (n: number) => void;
  step?: number; prefix?: string; suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <Input
          id={id} type="number" inputMode="decimal" step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`rounded-xl ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""}`}
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function ComparisonCard({ tone, result, t }: { tone: "danger" | "success"; result: SimResult; t: (k: string) => string }) {
  const isDanger = tone === "danger";
  const Trend = isDanger ? TrendingDown : TrendingUp;
  return (
    <article className={`rounded-3xl border-2 p-6 ${isDanger ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-xl font-bold ${isDanger ? "text-destructive" : "text-primary"}`}>{result.label}</h3>
        <Trend className={`size-6 ${isDanger ? "text-destructive" : "text-primary"}`} />
      </div>
      <p className="text-xs text-muted-foreground">{t("fs_savingsAt5y")}</p>
      <p className="text-4xl font-bold">{formatINR(result.savingsAt5y)}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Chip label={t("fs_stress")} value={result.stress.toUpperCase()} tone={result.stress} />
        <Chip label={t("fs_risk")} value={result.risk.toUpperCase()} tone={result.risk} />
      </div>
      <MiniChart series={result.series} tone={tone} />
    </article>
  );
}

function Chip({ label, value, tone }: { label: string; value: string; tone: "low" | "medium" | "high" }) {
  const cls = tone === "high" ? "bg-destructive/15 text-destructive"
    : tone === "medium" ? "bg-warning/20 text-warning-foreground"
    : "bg-primary/15 text-primary";
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>{value}</p>
    </div>
  );
}

function MiniChart({ series, tone }: { series: SimResult["series"]; tone: "danger" | "success" }) {
  const W = 280, H = 80;
  const key = tone === "danger" ? "debt" : "savings";
  const max = Math.max(...series.map((s) => s[key])) || 1;
  const points = series.map((s, i) => {
    const x = (i / (series.length - 1)) * W;
    const y = H - (s[key] / max) * (H - 10);
    return `${x},${y}`;
  }).join(" ");
  const color = tone === "danger" ? "var(--color-destructive)" : "var(--color-primary)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-5 h-20 w-full" aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {series.map((s, i) => {
        const x = (i / (series.length - 1)) * W;
        const y = H - (s[key] / max) * (H - 10);
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} />;
      })}
    </svg>
  );
}

function Timeline({ now, delay, t }: { now: SimResult; delay: SimResult; t: (k: string) => string }) {
  const rows = [
    { key: "fs_netWorth", get: (s: SimResult["series"][number]) => formatINR(s.net) },
    { key: "fs_debt", get: (s: SimResult["series"][number]) => formatINR(s.debt) },
    { key: "fs_savingsRow", get: (s: SimResult["series"][number]) => formatINR(s.savings) },
    { key: "fs_stressScore", get: (s: SimResult["series"][number]) => `${Math.round(s.stress)}` },
  ];
  const years = now.series.map((s) => s.year);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-3">Metric</th>
            {years.map((y) => <th key={y} className="px-3 py-2 text-center">{y}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.key}>
              <td className="py-3 pr-3 font-semibold">{t(r.key)}</td>
              {now.series.map((s, i) => (
                <td key={i} className="px-3 py-3 text-center">
                  <div className="text-destructive">{r.get(s)}</div>
                  <div className="text-xs text-primary">{r.get(delay.series[i])}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-center justify-end gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-destructive" /> {now.label}</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary" /> {delay.label}</span>
      </div>
    </div>
  );
}