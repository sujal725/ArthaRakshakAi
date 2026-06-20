import type { IncomeType, Concern } from "@/context/AppContext";

export interface Persona {
  name: string;
  description: string;
  traits: string[];
}

const BY_INCOME: Record<IncomeType, Persona> = {
  salary: {
    name: "The Steady Builder",
    description: "Predictable income, planning for the long climb.",
    traits: ["Consistent", "EMI-aware", "Long-term"],
  },
  gig: {
    name: "The Rising Earner",
    description: "Income flows in waves — your Guardian smooths the dips.",
    traits: ["Flexible", "Multi-source", "Buffer-first"],
  },
  farmer: {
    name: "The Seasoned Provider",
    description: "Seasonal cash flow needs season-aware protection.",
    traits: ["Seasonal", "Asset-rich", "Scheme-eligible"],
  },
  business: {
    name: "The Bold Operator",
    description: "Cash moves fast — risks need to move faster.",
    traits: ["Growth-minded", "Risk-aware", "Liquidity-led"],
  },
  student: {
    name: "The Future Spark",
    description: "Early start, biggest compounding edge.",
    traits: ["Curious", "Scam-targeted", "Compounder"],
  },
  retired: {
    name: "The Wise Keeper",
    description: "Preservation first, scams shielded fiercely.",
    traits: ["Income-secure", "Scam-shielded", "Family-aware"],
  },
};

export function derivePersona(income: IncomeType | null): Persona {
  return income ? BY_INCOME[income] : {
    name: "The Guardian",
    description: "Your AI is learning your money personality.",
    traits: ["Learning"],
  };
}

export type RiskLevel = "low" | "medium" | "high";

export interface RiskSnapshot {
  scam: RiskLevel;
  loan: RiskLevel;
  cash: RiskLevel;
}

export function deriveRisks(income: IncomeType | null, concerns: Concern[]): RiskSnapshot {
  const has = (c: Concern) => concerns.includes(c);
  const gigOrFarmer = income === "gig" || income === "farmer";
  return {
    scam: has("scams") ? "high" : income === "retired" || income === "student" ? "medium" : "low",
    loan: has("loans") ? "high" : income === "business" ? "medium" : "low",
    cash: has("income") || gigOrFarmer ? "high" : has("savings") ? "medium" : "low",
  };
}