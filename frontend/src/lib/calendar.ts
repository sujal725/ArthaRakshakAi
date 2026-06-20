import type { IncomeType, Concern } from "@/context/AppContext";
import type { Persona } from "./persona";

export type CalendarCategory = "income" | "expense" | "investment" | "government" | "seasonal";

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  amount?: number;
  category: CalendarCategory;
  icon: string;
}

export interface AIInsight {
  id: string;
  tone: "warn" | "celebrate" | "info" | "credit";
  title: string;
  recommendation: string;
}

interface CalOpts {
  monthIndex: number; // 0-11
  year: number;
  incomeType: IncomeType | null;
  concerns: Concern[];
}

function d(year: number, month: number, day: number): Date {
  return new Date(year, month, day);
}

export function generateCalendarEvents(opts: CalOpts): CalendarEvent[] {
  const { monthIndex: m, year: y, incomeType } = opts;
  const ev: CalendarEvent[] = [];
  const push = (date: number, title: string, category: CalendarCategory, icon: string, amount?: number) =>
    ev.push({ id: `${title}-${date}-${m}`, date: d(y, m, date), title, amount, category, icon });

  // Income — by incomeType
  const income = opts.monthlyIncome;
  if (incomeType === "salary" || !incomeType) push(1, "Salary Credit", "income", "💰", income ?? 45000);
  if (incomeType === "gig") {
    push(7, "Freelance Payout", "income", "💼", income ? Math.round(income * 0.6) : 12000);
    push(21, "Gig Earnings", "income", "💼", income ? Math.round(income * 0.4) : 9000);
  }
  if (incomeType === "farmer") push(15, "Crop Sale", "income", "🌾", income ?? 28000);
  if (incomeType === "business") push(3, "Business Income", "income", "🏪", income ?? 38000);
  if (incomeType === "student") push(5, "Stipend", "income", "🎓", income ?? 8000);
  if (incomeType === "retired") push(1, "Pension Credit", "income", "👴", income ?? 22000);

  // Expenses (universal)
  push(5, "Home Loan EMI", "expense", "🏠", 18500);
  push(8, "Electricity Bill", "expense", "💡", 1450);
  push(12, "Insurance Premium", "expense", "🛡️", 2200);
  push(18, "Credit Card Bill", "expense", "💳", 6800);
  push(25, "Rent", "expense", "🏘️", 12000);

  // Investments
  push(10, "SIP Auto-debit", "investment", "📈", 5000);
  push(20, "Recurring Deposit", "investment", "🏦", 3000);
  push(28, "Mutual Fund Review", "investment", "📊");

  // Government
  if (incomeType === "farmer") push(14, "PM-KISAN Installment", "government", "🌾", 2000);
  if (incomeType === "student") push(22, "Scholarship Window", "government", "🎓");
  push(27, "Advance Tax Reminder", "government", "📋");

  // Seasonal
  const seasonal = SEASONAL[m] ?? [];
  for (const s of seasonal) push(s.date, s.title, "seasonal", s.icon);

  return ev.sort((a, b) => a.date.getDate() - b.date.getDate());
}

const SEASONAL: Record<number, { date: number; title: string; icon: string }[]> = {
  0: [{ date: 14, title: "Makar Sankranti", icon: "🪁" }],
  2: [{ date: 17, title: "Holi", icon: "🎨" }],
  3: [{ date: 30, title: "Akshaya Tritiya", icon: "🪙" }],
  5: [{ date: 21, title: "Monsoon Begins", icon: "🌧️" }],
  7: [{ date: 15, title: "Independence Day", icon: "🇮🇳" }],
  8: [{ date: 19, title: "Ganesh Chaturthi", icon: "🐘" }],
  9: [{ date: 24, title: "Dussehra", icon: "🏹" }],
  10: [{ date: 12, title: "Diwali", icon: "🪔" }],
  11: [{ date: 25, title: "Year-end Tax Planning", icon: "📊" }],
};

export function generateAIInsights(opts: {
  persona: Persona;
  incomeType: IncomeType | null;
  concerns: Concern[];
  events: CalendarEvent[];
  monthIndex: number;
}): AIInsight[] {
  const { incomeType, concerns, monthIndex } = opts;
  const out: AIInsight[] = [];
  out.push({
    id: "emi-buffer",
    tone: "warn",
    title: "EMI + SIP fall in the same week",
    recommendation: "Keep at least ₹8,000 buffered between the 5th and 12th to avoid bounce charges.",
  });
  if (incomeType === "farmer") {
    out.push({
      id: "kisan",
      tone: "info",
      title: "PM-KISAN window opens",
      recommendation: "Verify your land records this week to receive the next ₹2,000 installment on time.",
    });
  }
  if (monthIndex === 9 || monthIndex === 10) {
    out.push({
      id: "festival",
      tone: "celebrate",
      title: "Festival season ahead",
      recommendation: "Spending typically rises 18%. Set a ₹15,000 cap and protect your SIP.",
    });
  }
  if (concerns.includes("loans") || incomeType === "student") {
    out.push({
      id: "credit",
      tone: "credit",
      title: "Credit card due before salary",
      recommendation: "Pay the minimum by the 18th to keep your credit score above 750.",
    });
  }
  return out.slice(0, 4);
}

export function generateDangerAlert(opts: {
  persona: Persona;
  incomeType: IncomeType | null;
  concerns: Concern[];
  events: CalendarEvent[];
}): { title: string; message: string } {
  const { incomeType, concerns } = opts;
  if (incomeType === "farmer") {
    return {
      title: "Upcoming Financial Event",
      message: "PM-KISAN installment expected next month. Keep your Aadhaar-linked bank details updated.",
    };
  }
  if (incomeType === "student") {
    return {
      title: "Heads up",
      message: "Education loan EMI begins in 4 months. Start a ₹2,000/month buffer SIP now.",
    };
  }
  if (incomeType === "gig") {
    return {
      title: "Income volatility ahead",
      message: "Income fluctuations may affect next month's savings. Hold a 6-week emergency cushion.",
    };
  }
  if (incomeType === "business") {
    return {
      title: "Liquidity watch",
      message: "GST filing and supplier payments cluster on the 20th. Maintain ₹40,000 working capital.",
    };
  }
  if (concerns.includes("loans")) {
    return {
      title: "Loan calendar conflict",
      message: "Two EMI debits and your SIP are 3 days apart. Keep an ₹8,000 emergency buffer to avoid penalties.",
    };
  }
  return {
    title: "Salary-cycle alert",
    message: "EMI and SIP dates are only 3 days apart. Maintain ₹8,000 emergency buffer this month.",
  };
}

export function getUpcomingEvents(events: CalendarEvent[], today: Date): { label: string; event: CalendarEvent }[] {
  const sorted = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  const labels = ["Tomorrow", "In 3 days", "In 7 days", "Next month"];
  const offsets = [1, 3, 7, 30];
  const out: { label: string; event: CalendarEvent }[] = [];
  for (let i = 0; i < offsets.length; i++) {
    const target = new Date(today.getTime() + offsets[i] * 86400000);
    const ev = sorted.find((e) => e.date.getTime() >= target.getTime()) ?? sorted[i];
    if (ev) out.push({ label: labels[i], event: ev });
  }
  return out;
}