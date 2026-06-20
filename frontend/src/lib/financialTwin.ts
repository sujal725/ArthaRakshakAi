import type { IncomeType, Concern } from "@/context/AppContext";
import type { Persona } from "./persona";

export type TwinTitle =
  | "Conservative Saver"
  | "Seasonal Earner"
  | "Risk Taker"
  | "Emergency Prone"
  | "Wise Keeper"
  | "Steady Builder"
  | "Opportunity Hunter"
  | "Balanced Planner";

export interface FinancialTwin {
  title: TwinTitle;
  riskStyle: "low" | "medium" | "high";
  spendingPattern: string;
  savingPattern: string;
  adviceStyle: string;
  regretProbability: number; // 0–100
  futureConfidence: number;  // 0–100
}

const TWIN_DEFS: Record<TwinTitle, Omit<FinancialTwin, "title">> = {
  "Conservative Saver": {
    riskStyle: "low",
    spendingPattern: "Tight, planned spends. Avoids impulse buys.",
    savingPattern: "Saves 25–35% of income, parks in FDs and PPF.",
    adviceStyle: "People like you save 20% more when SIP starts 2 days after salary.",
    regretProbability: 18,
    futureConfidence: 82,
  },
  "Seasonal Earner": {
    riskStyle: "medium",
    spendingPattern: "Spending swings with crop and festival seasons.",
    savingPattern: "Saves in bursts after big payouts.",
    adviceStyle: "Park 30% of every big payout into a recurring deposit before festival spends.",
    regretProbability: 32,
    futureConfidence: 65,
  },
  "Risk Taker": {
    riskStyle: "high",
    spendingPattern: "Quick to spend on new opportunities and gadgets.",
    savingPattern: "Low buffer, often invested in volatile assets.",
    adviceStyle: "Cap risky bets at 15% of net worth. Keep a 6-month emergency fund.",
    regretProbability: 48,
    futureConfidence: 55,
  },
  "Emergency Prone": {
    riskStyle: "high",
    spendingPattern: "Frequent unplanned expenses drain savings.",
    savingPattern: "Saves but withdraws often.",
    adviceStyle: "A separate untouchable emergency fund stops the leak.",
    regretProbability: 55,
    futureConfidence: 48,
  },
  "Wise Keeper": {
    riskStyle: "low",
    spendingPattern: "Conservative, family-first spending.",
    savingPattern: "Preserves capital. Senior citizen schemes preferred.",
    adviceStyle: "Stagger FDs across 3, 5 and 7 years to protect against rate cuts.",
    regretProbability: 14,
    futureConfidence: 86,
  },
  "Steady Builder": {
    riskStyle: "low",
    spendingPattern: "Routine spends, predictable EMIs.",
    savingPattern: "Strong saving habit, automated SIPs.",
    adviceStyle: "People like you save 20% more when SIP starts 2 days after salary.",
    regretProbability: 16,
    futureConfidence: 84,
  },
  "Opportunity Hunter": {
    riskStyle: "medium",
    spendingPattern: "Spends on growth bets and learning.",
    savingPattern: "Cycles money between schemes and ventures.",
    adviceStyle: "Use Mudra-style schemes before taking expensive personal loans.",
    regretProbability: 36,
    futureConfidence: 62,
  },
  "Balanced Planner": {
    riskStyle: "medium",
    spendingPattern: "Plans large spends 60 days ahead.",
    savingPattern: "Mix of SIP, RD and emergency fund.",
    adviceStyle: "Increase SIP by 10% on every salary hike to stay ahead of inflation.",
    regretProbability: 22,
    futureConfidence: 78,
  },
};

function build(title: TwinTitle): FinancialTwin {
  return { title, ...TWIN_DEFS[title] };
}

export function deriveFinancialTwin(
  incomeType: IncomeType | null,
  concerns: Concern[],
  _persona: Persona,
): FinancialTwin {
  if (incomeType === "farmer") return build("Seasonal Earner");
  if (incomeType === "retired") return build("Wise Keeper");
  if (incomeType === "business") return build("Opportunity Hunter");
  if (incomeType === "gig") {
    return build(concerns.includes("income") ? "Emergency Prone" : "Seasonal Earner");
  }
  if (incomeType === "student") return build("Risk Taker");
  if (incomeType === "salary") {
    if (concerns.includes("savings") || concerns.includes("investments")) return build("Steady Builder");
    if (concerns.includes("loans")) return build("Balanced Planner");
    return build("Conservative Saver");
  }
  return build("Balanced Planner");
}

const ORDER: TwinTitle[] = [
  "Emergency Prone",
  "Risk Taker",
  "Opportunity Hunter",
  "Seasonal Earner",
  "Balanced Planner",
  "Steady Builder",
  "Conservative Saver",
  "Wise Keeper",
];

export interface EvolutionInputs {
  base: FinancialTwin;
  riskImpactSum: number;       // sum of all actionHistory riskImpact
  futureGoalSet: boolean;
  recommendedSchemes: number;
  trustedCircleSize: number;
  voiceTurns: number;
}

export function updateFinancialTwin(input: EvolutionInputs): { twin: FinancialTwin; reason: string | null } {
  const { base, riskImpactSum, futureGoalSet, recommendedSchemes, trustedCircleSize, voiceTurns } = input;
  const reasons: string[] = [];
  let delta = 0;

  // riskImpactSum < 0 = healthy actions (delayed loans, schemes, etc.)
  if (riskImpactSum <= -30) { delta += 2; reasons.push("you delayed risky loans"); }
  else if (riskImpactSum <= -10) { delta += 1; reasons.push("your recent actions reduced risk"); }
  else if (riskImpactSum >= 30) { delta -= 2; reasons.push("recent risky activity"); }
  else if (riskImpactSum >= 10) { delta -= 1; reasons.push("a few risky messages were flagged"); }

  if (futureGoalSet) { delta += 1; reasons.push("you set a future financial goal"); }
  if (recommendedSchemes >= 1) { delta += 1; reasons.push("you explored matching government schemes"); }
  if (trustedCircleSize >= 1) { delta += 1; reasons.push("you built a trusted circle"); }
  if (voiceTurns >= 3) { delta += 1; reasons.push("you used your Guardian regularly"); }

  const baseIdx = ORDER.indexOf(base.title);
  const targetIdx = Math.max(0, Math.min(ORDER.length - 1, baseIdx + delta));
  const newTitle = ORDER[targetIdx];

  if (newTitle === base.title) return { twin: base, reason: null };

  const reason = reasons.length
    ? `Because ${reasons.slice(0, 2).join(" and ")}.`
    : "Your financial behaviour pattern shifted.";
  return { twin: build(newTitle), reason };
}

export type TwinContext = "scam" | "future" | "calendar" | "schemes" | "voice" | "trusted" | "community" | "impact";

export function twinLine(twin: FinancialTwin, context: TwinContext): string {
  const title = twin.title;
  switch (context) {
    case "scam":
      return `People with profiles similar to a ${title} avoid clicking unknown investment links.`;
    case "future":
      return `Your ${title} twin prefers delaying loans and increasing SIP.`;
    case "calendar":
      return `${title}s see festival spending rise by ~18%. Plan early.`;
    case "schemes":
      return `Most ${title}s qualify for PMJJBY, Atal Pension and Mudra.`;
    case "voice":
      return `Based on your ${title} twin, I would avoid this decision.`;
    case "trusted":
      return `Share your ${title} twin summary with your trusted circle.`;
    case "community":
      return `Other ${title}s often pause before big spends — see what they did.`;
    case "impact":
      return `Your ${title} habits are quietly compounding into real protection.`;
  }
}