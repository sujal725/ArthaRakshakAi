import type { GuardianMemoryState } from "@/context/GuardianMemory";

export interface ImpactCard { label: string; value: string; sub: string; tone: "emerald" | "mint" | "amber" | "slate"; }
export interface Achievement { id: string; title: string; description: string; unlocked: boolean; }
export interface MoneyPoint { month: string; amount: number; }
export interface SocialImpact { familyProtected: number; trustedCount: number; communityInspired: number; totalProtected: string; }
export interface TwinEvolutionStat { label: string; from: string; to: string; }

export function generateGuardianImpact(m: GuardianMemoryState): ImpactCard[] {
  const scamAvoided = Math.round((100 - m.scamRiskScore) * 180);
  const cashSaved   = m.cashFlowRisk === "low" ? 22000 : m.cashFlowRisk === "medium" ? 12000 : 5000;
  const benefits    = m.recommendedSchemes.length * 6000;
  return [
    { label: "Money protected", value: `₹${scamAvoided.toLocaleString()}`, sub: "scams avoided", tone: "emerald" },
    { label: "Cash saved",      value: `₹${cashSaved.toLocaleString()}`,   sub: "via planning",   tone: "mint"    },
    { label: "Benefits unlocked", value: `₹${benefits.toLocaleString()}`, sub: "from schemes",   tone: "amber"   },
    { label: "Guardian Score",  value: `${m.guardianScore}`,               sub: m.guardianLevel,  tone: "slate"   },
  ];
}

export function generateAchievements(m: GuardianMemoryState): Achievement[] {
  return [
    { id: "first-scan",   title: "First Scan",       description: "Analyzed your first message", unlocked: m.actionHistory.some((a) => a.module === "scam") },
    { id: "future-set",   title: "Vision Set",       description: "Defined a future goal",        unlocked: !!m.futureGoal },
    { id: "scheme-match", title: "Benefit Hunter",   description: "Matched a government scheme",  unlocked: m.recommendedSchemes.length > 0 },
    { id: "trusted",      title: "Circle Builder",   description: "Added a trusted member",       unlocked: m.trustedCircle.length >= 3 },
    { id: "sage",         title: "Financial Sage",   description: "Reached score 80+",            unlocked: m.guardianScore >= 80 },
  ];
}

export function generateTwinEvolution(m: GuardianMemoryState): TwinEvolutionStat[] {
  const conf = Math.min(95, 50 + m.actionHistory.length * 4);
  return [
    { label: "Confidence",    from: "50%", to: `${conf}%` },
    { label: "Risk profile",  from: "Unknown", to: m.financialTwin.riskStyle },
    { label: "Twin identity", from: m.previousTwinTitle ?? "—", to: m.financialTwin.title },
  ];
}

export function generateMoneyTimeline(m: GuardianMemoryState): MoneyPoint[] {
  const base = [4000, 8000, 15000, 24000, 42000, 58000];
  const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  const scale = Math.max(0.6, m.guardianScore / 80);
  return months.map((month, i) => ({ month, amount: Math.round(base[i] * scale) }));
}

export function generateSocialImpact(m: GuardianMemoryState): SocialImpact {
  const trusted = m.trustedCircle.length;
  const family  = Math.max(3, Math.min(6, trusted));
  const inspired = Math.max(12, Math.min(60, 12 + m.actionHistory.length * 2));
  const totalLakhs = (4.2 * Math.max(1, m.guardianScore / 60)).toFixed(1);
  return {
    familyProtected: family,
    trustedCount: Math.max(2, trusted),
    communityInspired: inspired,
    totalProtected: `₹${totalLakhs}L`,
  };
}