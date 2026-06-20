// Future Self — deterministic projection formulas. Pure functions.

export type Scenario =
  | "personal_loan"
  | "vehicle"
  | "sip"
  | "education_loan"
  | "emergency_loan"
  | "mutual_fund";

export interface SimInputs {
  amount: number;    // ₹ principal
  rate: number;      // % annual
  income: number;    // ₹ monthly
  tenure: number;    // months
  savings: number;   // ₹ monthly savings
  scenario: Scenario;
}

export interface YearPoint {
  year: number;
  net: number;
  debt: number;
  savings: number;
  stress: number; // 0-100
}

export interface SimResult {
  label: string;
  savingsAt5y: number;
  stress: "low" | "medium" | "high";
  risk: "low" | "medium" | "high";
  emi: number;
  series: YearPoint[];
}

const YEARS = [2026, 2028, 2030, 2035];

function emi(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function fvSeries(monthly: number, annualReturn: number, months: number): number {
  const r = annualReturn / 12 / 100;
  if (r === 0) return monthly * months;
  return monthly * ((Math.pow(1 + r, months) - 1) / r);
}

function classifyLevel(value: number, lowMax: number, mediumMax: number): "low" | "medium" | "high" {
  if (value <= lowMax) return "low";
  if (value <= mediumMax) return "medium";
  return "high";
}

function amortizedRemainingBalance(principal: number, annualRate: number, totalMonths: number, monthsElapsed: number): number {
  if (totalMonths <= 0) return 0;
  const r = annualRate / 12 / 100;
  const e = emi(principal, annualRate, totalMonths);
  const months = Math.min(monthsElapsed, totalMonths);
  let balance = principal;
  for (let m = 0; m < months; m++) {
    const interestPortion = balance * r;
    const principalPortion = e - interestPortion;
    balance = Math.max(0, balance - principalPortion);
  }
  return balance;
}

export function simulateLoanNow(i: SimInputs): SimResult {
  const e = emi(i.amount, i.rate, i.tenure);
  const emiToIncomeRatio = i.income > 0 ? e / i.income : 1;

  const series: YearPoint[] = YEARS.map((y, idx) => {
    const months = (idx + 1) * 24;
    const debt = amortizedRemainingBalance(i.amount, i.rate, i.tenure, months);
    const net = Math.max(0, fvSeries(Math.max(0, i.savings - e * 0.5), 6, months) - debt * 0.2);
    const savings = Math.max(0, (i.savings - e * 0.4) * months);
    const stress = Math.min(95, 40 + emiToIncomeRatio * 80);
    return { year: y, net, debt, savings, stress };
  });

  const lastStress = series[series.length - 1]?.stress ?? 0;

  return {
    label: "Take Loan Now",
    savingsAt5y: Math.round(series[1]?.savings ?? 0),
    stress: classifyLevel(lastStress, 40, 65),
    risk: classifyLevel(emiToIncomeRatio * 100, 30, 50),
    emi: Math.round(e),
    series,
  };
}

export function simulateDelayedSIP(i: SimInputs): SimResult {
  const sip = Math.max(2000, i.savings || 5000);
  const sipToIncomeRatio = i.income > 0 ? sip / i.income : 0;

  const series: YearPoint[] = YEARS.map((y, idx) => {
    const months = (idx + 1) * 24;
    const corpus = fvSeries(sip, 12, months);
    const stress = Math.max(5, Math.min(60, 10 + sipToIncomeRatio * 50 - idx * 3));
    return { year: y, net: Math.round(corpus * 0.9), debt: 0, savings: Math.round(corpus), stress };
  });

  const lastStress = series[series.length - 1]?.stress ?? 0;
  const shortHorizonRisk = i.tenure < 12;

  return {
    label: "Delay Loan + Start SIP",
    savingsAt5y: Math.round(series[1]?.savings ?? 0),
    stress: classifyLevel(lastStress, 25, 45),
    risk: shortHorizonRisk ? "medium" : "low",
    emi: 0,
    series,
  };
}

export function buildAdviceLine(now: SimResult, delay: SimResult, monthlySavings: number, tenureMonths: number): string {
  const nowAmount = Math.max(now.savingsAt5y, 1);
  const delayAmount = delay.savingsAt5y;
  const multiplier = delayAmount / nowAmount;
  const multiplierLabel = multiplier >= 1.05
    ? `${multiplier.toFixed(1)}× better`
    : multiplier <= 0.95
      ? `${(1 / multiplier).toFixed(1)}× worse`
      : "a similar";
  const years = Math.max(1, Math.round(tenureMonths / 12));

  return `Based on your numbers, waiting and investing ₹${monthlySavings.toLocaleString("en-IN")}/month instead of taking this loan creates ${multiplierLabel} financial outcome over the next ${years > 1 ? `${years} years` : "year"}.`;
}

export function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${Math.round(n)}`;
}