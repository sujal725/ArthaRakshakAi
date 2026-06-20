import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "hi" | "mr" | "ta" | "kn" | "te" | "bn";
export type IncomeType = "salary" | "gig" | "farmer" | "business" | "student" | "retired";
export type Concern = "scams" | "loans" | "savings" | "investments" | "schemes" | "income";
export type A11yMode = "normal" | "large" | "voice" | "hc" | "sr";

export interface A11ySettings {
  largeText: "normal" | "large" | "extraLarge";
  highContrast: boolean;
  screenReader: boolean;
  voiceNavigation: boolean;
  dyslexiaMode: boolean;
  colorBlindMode: boolean;
  seniorMode: boolean;
}

const defaultA11y: A11ySettings = {
  largeText: "normal",
  highContrast: false,
  screenReader: false,
  voiceNavigation: false,
  dyslexiaMode: false,
  colorBlindMode: false,
  seniorMode: false,
};

const A11Y_STORAGE_KEY = "artharakshak_accessibility_v1";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  language: Language;
  subscriptionTier: "free" | "pro";
  joinedAt: string;
}

// REPLACE WITH:
export interface AppState {
  language: Language;
  voiceMode: boolean;
  a11yMode: A11yMode;
  incomeType: IncomeType | null;
  concerns: Concern[];
  guardianActive: boolean;
  isAuthenticated: boolean;
  user: AppUser | null;
  // Financial profile from onboarding
  monthlyIncome: number | null;
  incomeFrequency: "monthly" | "weekly" | "irregular" | "seasonal" | null;
  monthlyExpenses: number | null;
  existingEmiTotal: number | null;
  hasEmergencyFund: boolean | null;
  dependentsCount: number | null;
}

interface AppContextValue extends AppState {
  setLanguage: (l: Language) => void;
  setVoiceMode: (v: boolean) => void;
  setA11yMode: (m: A11yMode) => void;
  setIncomeType: (t: IncomeType) => void;
  setConcerns: (c: Concern[]) => void;
  setGuardianActive: (v: boolean) => void;
  setFinancialProfile: (profile: {
    monthlyIncome?: number | null;
    incomeFrequency?: "monthly" | "weekly" | "irregular" | "seasonal" | null;
    monthlyExpenses?: number | null;
    existingEmiTotal?: number | null;
    hasEmergencyFund?: boolean | null;
    dependentsCount?: number | null;
  }) => void;
  signIn: (email: string, name?: string) => void;
  signUp: (input: { name: string; email: string; language: Language }) => void;
  signOut: () => void;
  hasCompletedOnboarding: boolean;
  a11y: A11ySettings;
  setA11ySetting: <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => void;
  setSeniorMode: (on: boolean) => void;
}

const STORAGE_KEY = "artharakshak_state_v1";
// REPLACE WITH:
const defaultState: AppState = {
  language: "en",
  voiceMode: false,
  a11yMode: "normal",
  incomeType: null,
  concerns: [],
  guardianActive: false,
  isAuthenticated: false,
  user: null,
  monthlyIncome: null,
  incomeFrequency: null,
  monthlyExpenses: null,
  existingEmiTotal: null,
  hasEmergencyFund: null,
  dependentsCount: null,
};
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [a11y, setA11y] = useState<A11ySettings>(defaultA11y);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
      const rawA = typeof window !== "undefined" ? localStorage.getItem(A11Y_STORAGE_KEY) : null;
      if (rawA) setA11y({ ...defaultA11y, ...JSON.parse(rawA) });
    } catch { }
  }, []);


  useEffect(() => {
    if (typeof window === "undefined") return;
    let id = localStorage.getItem("artharakshak_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("artharakshak_device_id", id);
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { }
  }, [state]);

  useEffect(() => {
    try { localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(a11y)); } catch { }
  }, [a11y]);

  // Apply a11y + language to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.lang = state.language;
    root.classList.toggle("hc", state.a11yMode === "hc");
    root.classList.toggle("large-text", state.a11yMode === "large");
  }, [state.language, state.a11yMode]);

  // Apply A11ySettings to <html> via data attributes + classes (additive, no conflict with onboarding modes)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset.a11yText = a11y.largeText;
    root.dataset.a11ySenior = a11y.seniorMode ? "true" : "false";
    root.classList.toggle("hc", a11y.highContrast || state.a11yMode === "hc");
    root.classList.toggle("large-text", a11y.largeText !== "normal" || state.a11yMode === "large");
    root.classList.toggle("extra-large-text", a11y.largeText === "extraLarge");
    root.classList.toggle("dyslexia", a11y.dyslexiaMode);
    root.classList.toggle("colorblind", a11y.colorBlindMode);
  }, [a11y, state.a11yMode]);

  const value: AppContextValue = {
    ...state,
    setLanguage: (language) => setState((s) => ({ ...s, language })),
    setVoiceMode: (voiceMode) => setState((s) => ({ ...s, voiceMode })),
    setA11yMode: (a11yMode) => setState((s) => ({ ...s, a11yMode })),
    setIncomeType: (incomeType) => setState((s) => ({ ...s, incomeType })),
    setConcerns: (concerns) => setState((s) => ({ ...s, concerns })),
    setGuardianActive: (guardianActive) => setState((s) => ({ ...s, guardianActive })),
    setFinancialProfile: (profile) =>
      setState((s) => ({ ...s, ...profile })),
    signIn: (email, name) =>
      setState((s) => ({
        ...s,
        isAuthenticated: true,
        user: s.user ?? {
          id: cryptoId(),
          name: name ?? email.split("@")[0] ?? "Guardian",
          email,
          language: s.language,
          subscriptionTier: "free",
          joinedAt: new Date().toISOString(),
        },
      })),
    // REPLACE WITH:
    signUp: ({ name, email, language }) => {
      // Clear guardian memory for fresh onboarding
      if (typeof window !== "undefined") {
        localStorage.removeItem("artharakshak_memory_v1");
      }
      setState((_s) => ({
        ...defaultState,
        language,
        isAuthenticated: true,
        incomeType: null,
        concerns: [],
        guardianActive: false,
        user: {
          id: cryptoId(),
          name,
          email,
          language,
          subscriptionTier: "free",
          joinedAt: new Date().toISOString(),
        },
      }));
    },

    signOut: () =>
      setState((s) => ({ ...s, isAuthenticated: false })),
    hasCompletedOnboarding:
      !!state.incomeType && state.concerns.length > 0 && state.guardianActive,
    a11y,
    setA11ySetting: (key, value) => setA11y((s) => ({ ...s, [key]: value })),
    setSeniorMode: (on) =>
      setA11y((s) =>
        on
          ? { ...s, seniorMode: true, largeText: "extraLarge", highContrast: true, voiceNavigation: true }
          : { ...s, seniorMode: false }
      ),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}