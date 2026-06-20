// Voice AI hooks — UI simulation only. Future-ready typed surface.
// TODO: Wire transcribeAudio() to Bhashini ASR or Whisper-large in Stage 4.
// TODO: Wire analyzeVoiceScam() to scam-classifier model (Gemini/OpenAI).
// TODO: Wire speakResult() to Bhashini TTS or browser Web Speech.

export interface VoiceVerdict {
  verdict: string;
  confidence: number; // 0–100
  level: "low" | "medium" | "high";
}

const SAMPLE_TRANSCRIPT =
  "Sir, your bank account will be blocked. Please share your OTP to verify your identity.";

export async function transcribeAudio(_blob?: Blob): Promise<string> {
  await new Promise((r) => setTimeout(r, 1800));
  return SAMPLE_TRANSCRIPT;
}

export async function analyzeVoiceScam(_text: string): Promise<VoiceVerdict> {
  await new Promise((r) => setTimeout(r, 900));
  return {
    verdict: "Possible impersonation scam — caller is pretending to be your bank",
    confidence: 89,
    level: "high",
  };
}

export async function speakResult(_text: string): Promise<void> {
  // Future: route to Bhashini TTS or Web Speech.
  return;
}

/* =================== Voice Guardian intelligence =================== */

import type { IncomeType } from "@/context/AppContext";
import type { Persona } from "./persona";
import type { FinancialTwin } from "./financialTwin";

export interface VoiceTurn {
  id: string;
  ts: number;
  role: "user" | "guardian";
  text: string;
  suggestedRoute?: string;
}

export interface VoiceReply {
  reply: string;
  suggestedRoute?: string;
}

export interface VoiceContext {
  text: string;
  persona: Persona;
  financialTwin: FinancialTwin;
  incomeType: IncomeType | null;
  scamRisk: number;
  cashFlowRisk: "low" | "medium" | "high";
  futureGoal: string | null;
}

const KEYWORDS = {
  loan: /\b(loan|कर्ज|कर्जा|ऋण|emi)\b/i,
  scam: /\b(scam|whatsapp|otp|fraud|फसवण|धोखा|मोसडी)\b/i,
  scheme: /\b(scheme|yojana|योजना|mudra|kisan|pension)\b/i,
  sip: /\b(sip|invest|invest(ment)?|mutual)\b/i,
  trusted: /\b(family|mother|father|trusted|कुटुंब)\b/i,
};

export function generateVoiceReply(ctx: VoiceContext): VoiceReply {
  const { text, financialTwin: twin, incomeType, scamRisk, cashFlowRisk, futureGoal } = ctx;
  const t = text.toLowerCase();

  if (KEYWORDS.scam.test(t) || scamRisk >= 60) {
    return {
      reply: `Possible scam detected. Your ${twin.title} profile should avoid sharing OTPs. Open Scam Shield to verify the message.`,
      suggestedRoute: "/scam-shield",
    };
  }

  if (KEYWORDS.loan.test(t)) {
    const verdict = twin.riskStyle === "high" ? "is risky for your profile" : "needs careful planning";
    return {
      reply: `Based on your ${twin.title} twin, this loan ${verdict}. I recommend comparing both futures before deciding.`,
      suggestedRoute: "/future-self",
    };
  }

  if (KEYWORDS.scheme.test(t)) {
    return {
      reply: `Most ${twin.title}s qualify for PM-KISAN, Mudra and PMJJBY. Let me show you matched schemes.`,
      suggestedRoute: "/government-schemes",
    };
  }

  if (KEYWORDS.sip.test(t)) {
    return {
      reply: `Great instinct. ${twin.adviceStyle}`,
      suggestedRoute: "/future-self",
    };
  }

  if (KEYWORDS.trusted.test(t)) {
    return {
      reply: "Never decide alone. Share your decision summary with your Trusted Circle and gather advice.",
      suggestedRoute: "/trusted-circle",
    };
  }

  if (cashFlowRisk === "high") {
    return {
      reply: `Cash flow stress is predicted. Your ${twin.title} twin suggests opening the Financial Calendar to plan ahead.`,
      suggestedRoute: "/financial-calendar",
    };
  }

  if (futureGoal) {
    return {
      reply: `Your active goal is "${futureGoal}". Stay the course. Want me to project it across 2026–2030?`,
      suggestedRoute: "/financial-calendar",
    };
  }

  return {
    reply: `I'm listening, Guardian. ${incomeType ? `As a ${twin.title}, ` : ""}ask me about a loan, a scam, schemes or your future.`,
  };
}