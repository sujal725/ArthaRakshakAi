import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useApp, type Concern, type IncomeType } from "./AppContext";
import { derivePersona, type Persona } from "@/lib/persona";
import {
  deriveFinancialTwin, updateFinancialTwin, type FinancialTwin, type TwinTitle,
} from "@/lib/financialTwin";
import type { VoiceTurn } from "@/lib/voice";

/* ------------------------------ Types ------------------------------ */

export type GuardianLevel = "Protected" | "Planner" | "Guardian" | "Wise Guardian" | "Financial Sage";
export type ActionModule = "scam" | "future" | "calendar" | "voice" | "schemes" | "trusted";
export type NotificationType = "warning" | "tip" | "achievement";

export interface GuardianAction {
  id: string;
  timestamp: number;
  module: ActionModule;
  action: string;
  riskImpact: number;
}

export interface GuardianNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  route?: string;
  timestamp: number;
}

export interface JourneyMilestone {
  id: string;
  timestamp: number;
  icon: string;
  title: string;
  monthLabel: string;
}

export interface TrustedMember {
  id: string;
  name: string;
  relationship: string;
  status: "online" | "trusted" | "recent";
}

export interface GuardianMemoryState {
  persona: Persona;
  financialTwin: FinancialTwin;
  previousTwinTitle: TwinTitle | null;
  twinEvolutionReason: string | null;
  guardianScore: number;
  guardianLevel: GuardianLevel;
  incomeType: IncomeType | null;
  riskTolerance: "low" | "medium" | "high";
  topConcerns: Concern[];
  scamRiskScore: number;
  cashFlowRisk: "low" | "medium" | "high";
  recommendedSchemes: string[];
  futureGoal: string | null;
  trustedCircle: TrustedMember[];
  voiceHistory: VoiceTurn[];
  actionHistory: GuardianAction[];
  guardianNotifications: GuardianNotification[];
  journey: JourneyMilestone[];
  dismissedNotificationIds: string[];
}

interface GuardianMemoryValue extends GuardianMemoryState {
  setScamRiskScore: (score: number) => void;
  setCashFlowRisk: (risk: "low" | "medium" | "high") => void;
  setRecommendedSchemes: (ids: string[]) => void;
  setFutureGoal: (goal: string | null) => void;
  setTrustedCircle: (members: TrustedMember[]) => void;
  addVoiceTurn: (turn: VoiceTurn) => void;
  logAction: (a: Omit<GuardianAction, "id" | "timestamp">) => void;
  dismissNotification: (id: string) => void;
  clearTwinEvolutionDialog: () => void;
}

/* ------------------------------ Persistence ------------------------------ */

const STORAGE_KEY = "artharakshak_memory_v1";
const CAP_VOICE = 20;
const CAP_ACTIONS = 30;
const CAP_NOTIFS = 20;
const CAP_JOURNEY = 24;
const CAP_DISMISSED = 80;

/* ------------------------------ Helpers ------------------------------ */

function uid(prefix = "g") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function monthLabel(ts: number): string {
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(ts));
}

// REPLACE WITH:
export function computeGuardianScore(s: {
  scamRiskScore: number;
  cashFlowRisk: "low" | "medium" | "high";
  incomeType: IncomeType | null;
  topConcerns: Concern[];
  futureGoal: string | null;
  recommendedSchemes: string[];
  trustedCircle: TrustedMember[];
  voiceHistory: VoiceTurn[];
  monthlyIncome?: number | null;
  monthlyExpenses?: number | null;
  existingEmiTotal?: number | null;
  hasEmergencyFund?: boolean | null;
}): number {
  let score = 40;
  score += Math.round((100 - s.scamRiskScore) * 0.20);          // 0–20 scam safety
  score += s.cashFlowRisk === "low" ? 12 : s.cashFlowRisk === "medium" ? 6 : 0;
  score += s.incomeType ? 4 : 0;
  score += s.topConcerns.length >= 1 ? 3 : 0;
  score += s.futureGoal ? 8 : 0;
  score += Math.min(8, s.recommendedSchemes.length * 3);
  score += Math.min(8, s.trustedCircle.length * 2);
  score += Math.min(6, s.voiceHistory.length);
  // Bonus from real financial health
  if (s.hasEmergencyFund) score += 5;
  if (s.monthlyIncome && s.monthlyExpenses) {
    const savings = s.monthlyIncome - s.monthlyExpenses - (s.existingEmiTotal ?? 0);
    const savingsPct = savings / s.monthlyIncome;
    if (savingsPct > 0.2) score += 8;
    else if (savingsPct > 0.1) score += 4;
    else if (savingsPct < 0) score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

export function scoreToLevel(score: number): GuardianLevel {
  if (score <= 20) return "Protected";
  if (score <= 40) return "Planner";
  if (score <= 60) return "Guardian";
  if (score <= 80) return "Wise Guardian";
  return "Financial Sage";
}

function deriveRiskTolerance(twin: FinancialTwin): "low" | "medium" | "high" {
  return twin.riskStyle;
}

/* ------------------------------ Notifications + Journey ------------------------------ */

function deriveNewNotifications(prev: GuardianMemoryState, next: GuardianMemoryState): GuardianNotification[] {
  const dismissed = new Set(next.dismissedNotificationIds);
  const existing = new Set(next.guardianNotifications.map((n) => n.id));
  const out: GuardianNotification[] = [];
  const push = (n: Omit<GuardianNotification, "timestamp">) => {
    if (dismissed.has(n.id) || existing.has(n.id)) return;
    out.push({ ...n, timestamp: Date.now() });
  };

  if (prev.scamRiskScore < 60 && next.scamRiskScore >= 60) {
    push({
      id: "scam-risk-high",
      type: "warning",
      title: "Scam risk rising",
      description: "You recently analyzed risky messages. Review them in Scam Shield.",
      route: "/scam-shield",
    });
  }
  if (prev.cashFlowRisk !== "high" && next.cashFlowRisk === "high") {
    push({
      id: "cashflow-high",
      type: "warning",
      title: "Cash flow stress predicted",
      description: "Expenses may exceed savings next month. Open the Financial Calendar.",
      route: "/financial-calendar",
    });
  }
  for (const id of next.recommendedSchemes.slice(0, 2)) {
    if (!prev.recommendedSchemes.includes(id)) {
      push({
        id: `scheme-${id}`,
        type: "tip",
        title: `${prettyScheme(id)} matches your profile`,
        description: "Based on your income, persona and concerns.",
        route: "/government-schemes",
      });
    }
  }
  if (!prev.futureGoal && next.futureGoal) {
    push({
      id: `future-goal-${slug(next.futureGoal)}`,
      type: "achievement",
      title: "Future goal active",
      description: next.futureGoal,
      route: "/future-self",
    });
  }
  if (prev.financialTwin.title !== next.financialTwin.title) {
    push({
      id: `twin-${slug(next.financialTwin.title)}`,
      type: "achievement",
      title: `Your Twin evolved to ${next.financialTwin.title}`,
      description: next.twinEvolutionReason ?? "Your financial behaviour pattern shifted.",
    });
  }
  return out;
}

function deriveNewMilestones(prev: GuardianMemoryState, next: GuardianMemoryState): JourneyMilestone[] {
  const existing = new Set(next.journey.map((m) => m.id));
  const out: JourneyMilestone[] = [];
  const push = (m: Omit<JourneyMilestone, "timestamp" | "monthLabel">) => {
    if (existing.has(m.id)) return;
    const ts = Date.now();
    out.push({ ...m, timestamp: ts, monthLabel: monthLabel(ts) });
  };

  if (prev.actionHistory.length < next.actionHistory.length) {
    const latest = next.actionHistory[0]; // newest first
    if (latest) {
      if (latest.module === "scam" && latest.riskImpact >= 10 && !existing.has("milestone-scam-avoided")) {
        push({ id: "milestone-scam-avoided", icon: "🛡️", title: "Avoided scam" });
      }
      if (latest.module === "future" && latest.riskImpact <= 0 && !existing.has("milestone-loan-delayed")) {
        push({ id: "milestone-loan-delayed", icon: "⏳", title: "Delayed risky loan" });
      }
      if (latest.module === "future" && !existing.has("milestone-sip-started")) {
        push({ id: "milestone-sip-started", icon: "📈", title: "Started SIP" });
      }
      if (latest.module === "schemes" && !existing.has("milestone-scheme-matched")) {
        push({ id: "milestone-scheme-matched", icon: "🏛️", title: "Matched a government scheme" });
      }
      if (latest.module === "trusted" && !existing.has("milestone-trusted-added")) {
        push({ id: "milestone-trusted-added", icon: "🤝", title: "Added member to Trusted Circle" });
      }
      if (latest.module === "voice" && !existing.has("milestone-voice-first")) {
        push({ id: "milestone-voice-first", icon: "🎤", title: "First Voice Guardian chat" });
      }
    }
  }
  if (prev.financialTwin.title !== next.financialTwin.title) {
    const id = `milestone-twin-${slug(next.financialTwin.title)}`;
    if (!existing.has(id)) push({ id, icon: "✨", title: `Became ${next.financialTwin.title}` });
  }

  return out;
}

function prettyScheme(id: string): string {
  return ({
    pmkisan: "PM-KISAN",
    mudra: "PM Mudra",
    scholarship: "National Scholarship",
    pmjjby: "PMJJBY",
    apy: "Atal Pension Yojana",
    standup: "Stand-Up India",
    ssy: "Sukanya Samriddhi",
    pmfby: "PM Fasal Bima",
  } as Record<string, string>)[id] ?? id;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ------------------------------ Context ------------------------------ */

const GuardianMemoryContext = createContext<GuardianMemoryValue | null>(null);

function seedState(incomeType: IncomeType | null, concerns: Concern[]): GuardianMemoryState {
  const persona = derivePersona(incomeType);
  const twin = deriveFinancialTwin(incomeType, concerns, persona);
  const base: GuardianMemoryState = {
    persona,
    financialTwin: twin,
    previousTwinTitle: null,
    twinEvolutionReason: null,
    guardianScore: 0,
    guardianLevel: "Protected",
    incomeType,
    riskTolerance: deriveRiskTolerance(twin),
    topConcerns: concerns,
    scamRiskScore: 12,
    cashFlowRisk: "low",
    recommendedSchemes: [],
    futureGoal: null,
    trustedCircle: [],
    voiceHistory: [],
    actionHistory: [],
    guardianNotifications: [],
    journey: [],
    dismissedNotificationIds: [],
  };
  base.guardianScore = computeGuardianScore(base);
  base.guardianLevel = scoreToLevel(base.guardianScore);
  return base;
}

export function GuardianMemoryProvider({ children }: { children: ReactNode }) {
  const { incomeType, concerns } = useApp();
  const [state, setState] = useState<GuardianMemoryState>(() => seedState(incomeType, concerns));
  const lastEvolvedRef = useRef<TwinTitle | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const stored = JSON.parse(raw) as Partial<GuardianMemoryState>;
        setState((s) => ({ ...s, ...stored, persona: s.persona, financialTwin: stored.financialTwin ?? s.financialTwin }));
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep persona/twin/income in sync with AppContext changes (onboarding flows)
  useEffect(() => {
    setState((s) => {
      if (s.incomeType === incomeType && s.topConcerns.join(",") === concerns.join(",")) return s;
      const persona = derivePersona(incomeType);
      const baseTwin = deriveFinancialTwin(incomeType, concerns, persona);
      return {
        ...s,
        incomeType,
        topConcerns: concerns,
        persona,
        financialTwin: s.financialTwin.title === baseTwin.title ? s.financialTwin : baseTwin,
        riskTolerance: deriveRiskTolerance(s.financialTwin.title === baseTwin.title ? s.financialTwin : baseTwin),
      };
    });
  }, [incomeType, concerns]);

  // Persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { }
  }, [state]);

  // Twin-evolved toast (fires once per transition)
  useEffect(() => {
    if (state.previousTwinTitle && lastEvolvedRef.current !== state.financialTwin.title) {
      lastEvolvedRef.current = state.financialTwin.title;
      toast.success(`Your Financial Twin evolved`, {
        description: `${state.previousTwinTitle} → ${state.financialTwin.title}`,
      });
    }
  }, [state.previousTwinTitle, state.financialTwin.title]);

  /* Reducer-style updater that handles derivations */
  const apply = useCallback(
    (mutate: (prev: GuardianMemoryState) => GuardianMemoryState) => {
      setState((prev) => {
        let next = mutate(prev);

        // Re-derive twin from current evolution inputs
        const riskImpactSum = next.actionHistory.reduce((acc, a) => acc + a.riskImpact, 0);
        const baseTwin = deriveFinancialTwin(next.incomeType, next.topConcerns, next.persona);
        const { twin, reason } = updateFinancialTwin({
          base: baseTwin,
          riskImpactSum,
          futureGoalSet: !!next.futureGoal,
          recommendedSchemes: next.recommendedSchemes.length,
          trustedCircleSize: next.trustedCircle.length,
          voiceTurns: next.voiceHistory.length,
        });
        const prevTitle = next.financialTwin.title;
        if (twin.title !== prevTitle) {
          next = {
            ...next,
            previousTwinTitle: prevTitle,
            financialTwin: twin,
            twinEvolutionReason: reason,
            riskTolerance: deriveRiskTolerance(twin),
          };
        }

        // Score + level
        const storedState = (() => { try { return JSON.parse(localStorage.getItem("artharakshak_state_v1") ?? "{}"); } catch { return {}; } })();
        next.guardianScore = computeGuardianScore({
          ...next,
          monthlyIncome: storedState.monthlyIncome ?? null,
          monthlyExpenses: storedState.monthlyExpenses ?? null,
          existingEmiTotal: storedState.existingEmiTotal ?? null,
          hasEmergencyFund: storedState.hasEmergencyFund ?? null,
        });
        next.guardianLevel = scoreToLevel(next.guardianScore);

        // Notifications + milestones
        const newNotifs = deriveNewNotifications(prev, next);
        if (newNotifs.length) {
          next.guardianNotifications = [...newNotifs, ...next.guardianNotifications].slice(0, CAP_NOTIFS);
        }
        const newMilestones = deriveNewMilestones(prev, next);
        if (newMilestones.length) {
          next.journey = [...next.journey, ...newMilestones].slice(-CAP_JOURNEY);
        }

        return next;
      });
    },
    [],
  );

  const value: GuardianMemoryValue = useMemo(() => ({
    ...state,
    setScamRiskScore: (score) =>
      apply((s) => ({ ...s, scamRiskScore: Math.max(0, Math.min(100, score)) })),
    setCashFlowRisk: (risk) => apply((s) => ({ ...s, cashFlowRisk: risk })),
    setRecommendedSchemes: (ids) => apply((s) => ({ ...s, recommendedSchemes: ids })),
    setFutureGoal: (goal) => apply((s) => ({ ...s, futureGoal: goal })),
    setTrustedCircle: (members) => apply((s) => ({ ...s, trustedCircle: members })),
    addVoiceTurn: (turn) =>
      apply((s) => ({ ...s, voiceHistory: [...s.voiceHistory, turn].slice(-CAP_VOICE) })),
    logAction: (a) =>
      apply((s) => {
        const action: GuardianAction = { ...a, id: uid("act"), timestamp: Date.now() };
        return { ...s, actionHistory: [action, ...s.actionHistory].slice(0, CAP_ACTIONS) };
      }),
    dismissNotification: (id) =>
      apply((s) => ({
        ...s,
        guardianNotifications: s.guardianNotifications.filter((n) => n.id !== id),
        dismissedNotificationIds: [id, ...s.dismissedNotificationIds.filter((d) => d !== id)].slice(0, CAP_DISMISSED),
      })),
    clearTwinEvolutionDialog: () =>
      apply((s) => ({ ...s, previousTwinTitle: null, twinEvolutionReason: null })),
  }), [state, apply]);

  return (
    <GuardianMemoryContext.Provider value={value}>{children}</GuardianMemoryContext.Provider>
  );
}

export function useGuardianMemory(): GuardianMemoryValue {
  const ctx = useContext(GuardianMemoryContext);
  if (!ctx) throw new Error("useGuardianMemory must be used inside GuardianMemoryProvider");
  return ctx;
}

export { prettyScheme };