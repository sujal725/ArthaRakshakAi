import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  GitBranch, Sparkles, Briefcase, Car, PiggyBank,
  GraduationCap, AlertCircle, LineChart, TrendingUp, TrendingDown,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/translations";
import {
  simulateLoanVsSip, simulateInvestmentGrowth,
  buildLoanVsSipExplanation, buildLoanVsSipVerdict, buildInvestmentExplanation,
  isLoanScenario, formatINRExact,
  type Scenario, type LoanVsSipResult, type InvestmentGrowthResult,
} from "@/lib/futureSelf";
import { useGuardianMemory } from "@/context/GuardianMemory";
import { TwinHint } from "@/components/TwinHint";
import { LoanVsSipChart } from "@/components/LoanVsSipChart";
import { InvestmentGrowthChart } from "@/components/InvestmentGrowthChart";
import futureHero from "@/assets/future-self-hero.png";

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

async function fetchAiAdvice(payload: Record<string, unknown>): Promise<string> {
  const deviceId = localStorage.getItem("artharakshak_device_id") ?? "";
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/future-self/advice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_id: deviceId, ...payload }),
  });
  if (!res.ok) throw new Error("Advice request failed");
  const data = await res.json();
  return data.advice as string;
}

function FutureSelfPage() {
  const t = useT();
  const memory = useGuardianMemory();
  const [scenario, setScenario] = useState<Scenario>("personal_loan");

  // Loan-scenario inputs
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(14);
  const [tenure, setTenure] = useState(50);
  const [income, setIncome] = useState(45000);

  // Investment-scenario inputs
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [investTenure, setInvestTenure] = useState(60);

  const [loading, setLoading] = useState(false);
  const [loanResult, setLoanResult] = useState<LoanVsSipResult | null>(null);
  const [investResult, setInvestResult] = useState<InvestmentGrowthResult | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  const loanScenario = isLoanScenario(scenario);

  function pickScenario(s: Scenario) {
    setScenario(s);
    setLoanResult(null);
    setInvestResult(null);
    setAdvice(null);
  }

  async function compare() {
    setLoading(true);
    setLoanResult(null);
    setInvestResult(null);
    setAdvice(null);
    await new Promise((r) => setTimeout(r, 500));

    if (loanScenario) {
      const result = simulateLoanVsSip({ loanAmount, annualRate: interestRate, tenureMonths: tenure, sipAnnualReturn: 12 });
      setLoanResult(result);
      memory.setFutureGoal("Delay loan + Start SIP");
      memory.logAction({
        module: "future",
        action: `Compared ${scenario.replace("_", " ")} — ₹${result.totalInterest} interest vs ₹${result.sipGrowthEarned} SIP growth`,
        riskImpact: result.sipFinalValue >= result.totalRepaid ? -15 : 5,
      });
      setLoading(false);
      setAdviceLoading(true);
      try {
        const text = await fetchAiAdvice({
          scenario,
          loan_amount: loanAmount,
          interest_rate: interestRate,
          tenure_months: tenure,
          monthly_income: income,
          emi: result.emi,
          total_interest: result.totalInterest,
          total_repaid: result.totalRepaid,
          sip_final_value: result.sipFinalValue,
          sip_growth_earned: result.sipGrowthEarned,
        });
        setAdvice(text);
      } catch {
        setAdvice(buildLoanVsSipVerdict(result));
      }
      setAdviceLoading(false);
    } else {
      const result = simulateInvestmentGrowth({ monthlyAmount, annualReturn: expectedReturn, tenureMonths: investTenure });
      setInvestResult(result);
      memory.setFutureGoal(`Start ${scenario === "sip" ? "SIP" : "Mutual Fund"} investing`);
      memory.logAction({
        module: "future",
        action: `Projected ${scenario.replace("_", " ")} — ₹${result.growthEarned} growth over ${investTenure} months`,
        riskImpact: -10,
      });
      setLoading(false);
      setAdviceLoading(true);
      try {
        const text = await fetchAiAdvice({
          scenario,
          monthly_amount: monthlyAmount,
          expected_return: expectedReturn,
          tenure_months: investTenure,
          monthly_income: income,
          final_value: result.finalValue,
          total_invested: result.totalInvested,
          growth_earned: result.growthEarned,
        });
        setAdvice(text);
      } catch {
        setAdvice(`Investing ${formatINRExact(monthlyAmount)} monthly for ${investTenure} months could grow to ${formatINRExact(result.finalValue)}.`);
      }
      setAdviceLoading(false);
    }
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
                <button
                  key={value}
                  type="button"
                  onClick={() => pickScenario(value)}
                  className={`card-lift flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${selected ? "border-primary bg-accent" : "border-border bg-card"}`}
                >
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
          {loanScenario ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <NumberField id="loanAmount" label={t("fs_loanAmount")} prefix="₹" value={loanAmount} onChange={setLoanAmount} step={5000} />
              <NumberField id="rate" label={t("fs_interestRate")} suffix="%" value={interestRate} onChange={setInterestRate} step={0.5} />
              <NumberField id="tenure" label={t("fs_tenure")} value={tenure} onChange={setTenure} step={1} />
              <NumberField id="income" label={t("fs_monthlyIncome")} prefix="₹" value={income} onChange={setIncome} step={1000} />
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <NumberField id="monthlyAmount" label="Monthly investment amount" prefix="₹" value={monthlyAmount} onChange={setMonthlyAmount} step={500} />
              <NumberField id="expectedReturn" label="Expected annual return" suffix="%" value={expectedReturn} onChange={setExpectedReturn} step={0.5} />
              <NumberField id="investTenure" label={t("fs_tenure")} value={investTenure} onChange={setInvestTenure} step={1} />
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button onClick={compare} disabled={loading} size="lg" className="rounded-full bg-gradient-emerald px-8">
              {loading ? t("fs_computing") : t("fs_compare")}
            </Button>
          </div>
        </section>

        {loanScenario && loanResult && (
          <LoanVsSipResultPanel result={loanResult} advice={advice} adviceLoading={adviceLoading} />
        )}

        {!loanScenario && investResult && (
          <InvestmentResultPanel result={investResult} advice={advice} adviceLoading={adviceLoading} />
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

function LoanVsSipResultPanel({ result, advice, adviceLoading }: { result: LoanVsSipResult; advice: string | null; adviceLoading: boolean }) {
  const explanation = buildLoanVsSipExplanation(result);
  const verdict = buildLoanVsSipVerdict(result);
  const sipBetter = result.sipFinalValue >= result.totalRepaid;

  return (
    <>
      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <article className="rounded-3xl border-2 border-destructive/30 bg-destructive/5 p-6">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">Take Loan</p>
            <TrendingDown className="size-5 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive">{formatINRExact(result.emi)}/mo</p>
          <p className="mt-1 text-xs text-muted-foreground">Total interest: {formatINRExact(result.totalInterest)}</p>
        </article>
        <article className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-6">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">Save + SIP Instead</p>
            <TrendingUp className="size-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">{formatINRExact(result.sipFinalValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Growth earned: {formatINRExact(result.sipGrowthEarned)}</p>
        </article>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="mb-4 text-sm font-semibold text-muted-foreground">
          Cumulative interest paid (loan) vs. value grown (SIP), month by month
        </p>
        <LoanVsSipChart series={result.series} />
        <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-destructive" /> Loan: interest paid</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary" /> SIP: value grown</span>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="mb-3 text-sm font-semibold">What this means for you</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {explanation.map((line, i) => (
            <li key={i} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" /> {line}</li>
          ))}
        </ul>
        <div className={`mt-4 rounded-2xl p-4 text-sm font-medium ${sipBetter ? "bg-primary/10 text-primary" : "bg-warning/15 text-warning-foreground"}`}>
          {verdict}
        </div>
      </section>

      <AiAdvicePanel advice={advice} loading={adviceLoading} />
    </>
  );
}

function InvestmentResultPanel({ result, advice, adviceLoading }: { result: InvestmentGrowthResult; advice: string | null; adviceLoading: boolean }) {
  const explanation = buildInvestmentExplanation(result);
  return (
    <>
      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <article className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-6">
          <p className="text-sm font-semibold text-muted-foreground">Final value</p>
          <p className="text-2xl font-bold text-primary">{formatINRExact(result.finalValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Total invested: {formatINRExact(result.totalInvested)}</p>
        </article>
        <article className="rounded-3xl border-2 border-secondary/40 bg-secondary/10 p-6">
          <p className="text-sm font-semibold text-muted-foreground">Growth earned</p>
          <p className="text-2xl font-bold text-foreground">{formatINRExact(result.growthEarned)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Over {result.tenureMonths} months at {result.annualReturn}% p.a.</p>
        </article>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="mb-4 text-sm font-semibold text-muted-foreground">Investment value, month by month</p>
        <InvestmentGrowthChart series={result.series} />
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="mb-3 text-sm font-semibold">What this means for you</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {explanation.map((line, i) => (
            <li key={i} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" /> {line}</li>
          ))}
        </ul>
      </section>

      <AiAdvicePanel advice={advice} loading={adviceLoading} />
    </>
  );
}

function AiAdvicePanel({ advice, loading }: { advice: string | null; loading: boolean }) {
  return (
    <section className="mt-6 rounded-3xl bg-gradient-emerald p-7 text-primary-foreground shadow-xl shadow-primary/25">
      <div className="flex items-start gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
          <Sparkles className="size-6" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">AI Advice</p>
          <p className="mt-2 text-lg font-semibold leading-relaxed">
            {loading ? "Your Guardian is thinking through the numbers…" : advice ?? "—"}
          </p>
        </div>
      </div>
    </section>
  );
}