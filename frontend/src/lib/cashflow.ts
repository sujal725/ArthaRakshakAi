import type { IncomeType, Concern } from "@/context/AppContext";
import type { Persona } from "./persona";

export interface MonthPoint {
  label: string;
  income: number;
  expenses: number;
  savings: number;
  predicted?: boolean;
  risk?: "low" | "medium" | "high";
}

export interface CashFlowPrediction {
  months: MonthPoint[];
  summary: { income: number; expenses: number; savings: number; forecast: number };
}

const BASE_INCOME: Record<IncomeType, number> = {
  salary: 45000,
  gig: 32000,
  farmer: 28000,
  business: 60000,
  student: 12000,
  retired: 22000,
};

export function predictCashFlow(opts: { incomeType: IncomeType | null; monthIndex: number }): CashFlowPrediction {
  const base = opts.incomeType ? BASE_INCOME[opts.incomeType] : 40000;
  const labels = monthLabels(opts.monthIndex);
  const months: MonthPoint[] = labels.map((label, i) => {
    const variance = [1, 1.02, 0.98, 1.05, 1.1, 0.95][i] ?? 1;
    const income = Math.round(base * variance);
    const expensesVariance = i >= 3 ? 1.18 : 1; // festive uptick
    const expenses = Math.round(base * 0.62 * expensesVariance);
    const savings = income - expenses;
    const predicted = i >= 3;
    const risk: MonthPoint["risk"] = predicted && savings < base * 0.15 ? "high" : predicted ? "medium" : "low";
    return { label, income, expenses, savings, predicted, risk };
  });
  const cur = months[2];
  const next = months[3];
  return {
    months,
    summary: {
      income: cur.income,
      expenses: cur.expenses,
      savings: cur.savings,
      forecast: next.savings,
    },
  };
}

function monthLabels(start: number): string[] {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return Array.from({ length: 6 }, (_, i) => names[(start - 2 + i + 12) % 12]);
}

export interface RiskReport {
  level: "low" | "medium" | "high";
  reasons: string[];
  recommendations: string[];
}

export function analyzeCashFlowRisk(opts: { incomeType: IncomeType | null; concerns: Concern[]; prediction: CashFlowPrediction }): RiskReport {
  const { incomeType, concerns, prediction } = opts;
  const future = prediction.months.filter((m) => m.predicted);
  const minSavings = Math.min(...future.map((m) => m.savings));
  const level: RiskReport["level"] = minSavings < 3000 ? "high" : minSavings < 8000 ? "medium" : "low";
  const reasons: string[] = [];
  const recommendations: string[] = [];
  if (incomeType === "gig" || incomeType === "farmer") reasons.push("Income is seasonal and may dip in the next quarter.");
  if (concerns.includes("loans")) reasons.push("EMI burden compresses your savings buffer.");
  reasons.push("Festival season raises discretionary spending by ~18%.");
  if (level === "high") recommendations.push("Open a 6-month emergency fund of ₹60,000.");
  recommendations.push("Automate a ₹3,000 SIP on the 2nd of each month.");
  recommendations.push("Set a category cap for festival shopping.");
  return { level, reasons, recommendations };
}

export function generateEarlyWarning(opts: {
  persona: Persona;
  incomeType: IncomeType | null;
  concerns: Concern[];
  prediction: CashFlowPrediction;
  monthIndex: number;
}): { title: string; message: string } {
  const { prediction, monthIndex } = opts;
  const risky = prediction.months.find((m) => m.predicted && m.risk === "high");
  if (risky) {
    return {
      title: "AI Early Warning",
      message: `Your expenses may exceed income by ${risky.label}. Trim ₹4,000 from discretionary spending this month.`,
    };
  }
  if (monthIndex >= 8 && monthIndex <= 10) {
    return {
      title: "AI Early Warning",
      message: "Festival season could increase spending by 18%. Set a ₹15,000 cap to protect your savings.",
    };
  }
  return {
    title: "AI Early Warning",
    message: "You may save ₹42,000 more this year by delaying one large discretionary purchase by 90 days.",
  };
}

export function generateFinancialPersonality(opts: { persona: Persona; incomeType: IncomeType | null }): {
  title: string;
  risk: string;
  advice: string;
} {
  const { incomeType } = opts;
  if (incomeType === "farmer") {
    return {
      title: "Seasonal Provider",
      risk: "High variance — Kharif and Rabi cycles dominate cash flow.",
      advice: "Park 30% of every crop sale into a recurring deposit before festival spending begins.",
    };
  }
  if (incomeType === "gig") {
    return {
      title: "Wave Earner",
      risk: "Medium variance — earnings rise and fall with platform demand.",
      advice: "Smooth your income with a 60-day buffer in a liquid mutual fund.",
    };
  }
  if (incomeType === "business") {
    return {
      title: "Liquidity Operator",
      risk: "Medium — supplier and GST cycles peak mid-month.",
      advice: "Keep ₹40,000 working capital separate from personal savings.",
    };
  }
  return {
    title: "Steady Builder",
    risk: "Low — predictable salary with manageable EMI load.",
    advice: "Increase your SIP by 10% every salary hike to stay ahead of inflation.",
  };
}

export interface TimelineRow {
  year: number;
  income: number;
  savings: number;
  expenses: number;
  risk: "low" | "medium" | "high";
  netWorth: number;
}

export function projectTimeline(opts: { incomeType: IncomeType | null }): TimelineRow[] {
  const base = opts.incomeType ? BASE_INCOME[opts.incomeType] : 40000;
  const years = [2026, 2027, 2028, 2030];
  return years.map((year, i) => {
    const growth = Math.pow(1.08, i + 1);
    const income = Math.round(base * 12 * growth);
    const expenses = Math.round(base * 12 * 0.65 * Math.pow(1.06, i + 1));
    const savings = income - expenses;
    const netWorth = Math.round(savings * (i + 1) * 1.4);
    const risk: TimelineRow["risk"] = savings < base ? "high" : savings < base * 3 ? "medium" : "low";
    return { year, income, savings, expenses, risk, netWorth };
  });
}