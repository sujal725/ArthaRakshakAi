// Future Self — accurate financial projections. Pure functions.

export type Scenario =
  | "personal_loan"
  | "vehicle"
  | "sip"
  | "education_loan"
  | "emergency_loan"
  | "mutual_fund";

export const LOAN_SCENARIOS: Scenario[] = ["personal_loan", "vehicle", "education_loan", "emergency_loan"];
export const INVESTMENT_SCENARIOS: Scenario[] = ["sip", "mutual_fund"];

export function isLoanScenario(s: Scenario): boolean {
  return LOAN_SCENARIOS.includes(s);
}

/* ---------------- Core math ---------------- */

export function emi(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/* ---------------- Loan vs SIP (the core comparison) ---------------- */

export interface MonthlySeriesPoint {
  month: number;
  loanInterestPaid: number; // cumulative interest paid on the loan up to this month
  sipValueGrown: number;    // cumulative value if investing the EMI amount instead
}

export interface LoanVsSipResult {
  loanAmount: number;
  tenureMonths: number;
  annualRate: number;
  sipAnnualReturn: number;
  emi: number;
  totalInterest: number;
  totalRepaid: number;
  sipFinalValue: number;
  sipGrowthEarned: number;
  series: MonthlySeriesPoint[];
}

export function simulateLoanVsSip(opts: {
  loanAmount: number;
  annualRate: number;
  tenureMonths: number;
  sipAnnualReturn?: number;
}): LoanVsSipResult {
  const { loanAmount, annualRate, tenureMonths, sipAnnualReturn = 12 } = opts;
  const monthlyEmi = emi(loanAmount, annualRate, tenureMonths);
  const loanMonthlyRate = annualRate / 12 / 100;
  const sipMonthlyRate = sipAnnualReturn / 12 / 100;

  let balance = loanAmount;
  let cumulativeInterest = 0;
  let sipValue = 0;
  const series: MonthlySeriesPoint[] = [];

  for (let m = 1; m <= tenureMonths; m++) {
    // Real reducing-balance amortization
    const interestPortion = balance * loanMonthlyRate;
    const principalPortion = Math.min(balance, monthlyEmi - interestPortion);
    balance = Math.max(0, balance - principalPortion);
    cumulativeInterest += interestPortion;

    // If you invested the EMI amount instead of paying it to the loan
    sipValue = sipValue * (1 + sipMonthlyRate) + monthlyEmi;

    series.push({
      month: m,
      loanInterestPaid: Math.round(cumulativeInterest),
      sipValueGrown: Math.round(sipValue),
    });
  }

  const totalInterest = Math.round(cumulativeInterest);
  const totalRepaid = Math.round(loanAmount + totalInterest);
  const sipFinalValue = series.length ? series[series.length - 1].sipValueGrown : 0;
  const sipGrowthEarned = Math.round(sipFinalValue - monthlyEmi * tenureMonths);

  return {
    loanAmount,
    tenureMonths,
    annualRate,
    sipAnnualReturn,
    emi: Math.round(monthlyEmi * 100) / 100,
    totalInterest,
    totalRepaid,
    sipFinalValue,
    sipGrowthEarned,
    series,
  };
}

export function buildLoanVsSipExplanation(r: LoanVsSipResult): string[] {
  return [
    `If you take the loan, you will pay back a total of ${formatINRExact(r.totalRepaid)}, which is more than the loan amount of ${formatINRExact(r.loanAmount)}.`,
    `If you save and invest instead, you will have a final amount of ${formatINRExact(r.sipFinalValue)} after ${r.tenureMonths} months, which is ${r.sipFinalValue >= r.totalRepaid ? "more" : "less"} than the total amount you would have paid back with the loan.`,
    `By saving and investing, you will earn a total growth of ${formatINRExact(r.sipGrowthEarned)}, which is ${r.sipGrowthEarned >= r.totalInterest ? "more" : "less"} than the interest you would have paid with the loan.`,
  ];
}

export function buildLoanVsSipVerdict(r: LoanVsSipResult): string {
  const better = r.sipFinalValue >= r.totalRepaid;
  return better
    ? `It seems better for you to save and invest instead of taking the loan, because you will end up with more money after ${r.tenureMonths} months and earn growth instead of paying interest.`
    : `Taking the loan may be reasonable here — delaying it and investing instead would not outgrow the total repayment in this case. Compare the EMI against your monthly income before deciding.`;
}

/* ---------------- Investment-only growth (SIP / Mutual Fund scenarios) ---------------- */

export interface InvestmentSeriesPoint {
  month: number;
  value: number;
}

export interface InvestmentGrowthResult {
  monthlyAmount: number;
  annualReturn: number;
  tenureMonths: number;
  finalValue: number;
  totalInvested: number;
  growthEarned: number;
  series: InvestmentSeriesPoint[];
}

export function simulateInvestmentGrowth(opts: {
  monthlyAmount: number;
  annualReturn: number;
  tenureMonths: number;
}): InvestmentGrowthResult {
  const { monthlyAmount, annualReturn, tenureMonths } = opts;
  const r = annualReturn / 12 / 100;
  let value = 0;
  const series: InvestmentSeriesPoint[] = [];
  for (let m = 1; m <= tenureMonths; m++) {
    value = value * (1 + r) + monthlyAmount;
    series.push({ month: m, value: Math.round(value) });
  }
  const totalInvested = monthlyAmount * tenureMonths;
  return {
    monthlyAmount,
    annualReturn,
    tenureMonths,
    finalValue: Math.round(value),
    totalInvested,
    growthEarned: Math.round(value - totalInvested),
    series,
  };
}

export function buildInvestmentExplanation(r: InvestmentGrowthResult): string[] {
  return [
    `Investing ${formatINRExact(r.monthlyAmount)} every month for ${r.tenureMonths} months grows to a final value of ${formatINRExact(r.finalValue)}.`,
    `You would have invested a total of ${formatINRExact(r.totalInvested)} from your own pocket.`,
    `The remaining ${formatINRExact(r.growthEarned)} is pure growth earned from compounding at an assumed ${r.annualReturn}% annual return.`,
  ];
}

/* ---------------- Formatting ---------------- */

export function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
  return `₹${Math.round(n)}`;
}

export function formatINRExact(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return `₹${rounded.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}