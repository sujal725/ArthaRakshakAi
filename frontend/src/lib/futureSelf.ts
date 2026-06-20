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

export function simulateLoanNow(i: SimInputs): SimResult {
  const e = emi(i.amount, i.rate, i.tenure);
  const series: YearPoint[] = YEARS.map((y, idx) => {
    const months = (idx + 1) * 24;
    const cappedMonths = Math.min(months, i.tenure);
    const paid = e * cappedMonths;
    const debt = Math.max(0, i.amount - paid * 0.55); // rough principal-paid approximation
    const net = Math.max(0, fvSeries(Math.max(0, i.savings - e * 0.5), 6, months) - debt * 0.2);
    const savings = Math.max(0, (i.savings - e * 0.4) * months);
    const stress = Math.min(95, 40 + (e / Math.max(i.income, 1)) * 80);
    return { year: y, net, debt, savings, stress };
  });
  return {
    label: "Take Loan Now",
    savingsAt5y: Math.round(series[1]?.savings ?? 0),
    stress: "high",
    risk: "medium",
    emi: Math.round(e),
    series,
  };
}

export function simulateDelayedSIP(i: SimInputs): SimResult {
  const sip = Math.max(2000, i.savings || 5000);
  const series: YearPoint[] = YEARS.map((y, idx) => {
    const months = (idx + 1) * 24;
    const corpus = fvSeries(sip, 12, months);
    return {
      year: y,
      net: Math.round(corpus * 0.9),
      debt: 0,
      savings: Math.round(corpus),
      stress: Math.max(8, 25 - idx * 3),
    };
  });
  return {
    label: "Delay Loan + Start SIP",
    savingsAt5y: Math.round(series[1]?.savings ?? 0),
    stress: "low",
    risk: "low",
    emi: 0,
    series,
  };
}

export function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${Math.round(n)}`;
}