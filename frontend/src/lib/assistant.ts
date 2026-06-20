import type { IncomeType, Concern } from "@/context/AppContext";
import type { Persona } from "@/lib/persona";

export interface AdviceContext {
  persona?: Persona;
  incomeType?: IncomeType | null;
  concerns?: Concern[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

/**
 * Mock financial advice — keyword router. No LLM calls.
 * Future: replace with Gemini / OpenAI gated by a server function.
 */
export function generateFinancialAdvice(prompt: string, ctx: AdviceContext = {}): string {
  const p = prompt.toLowerCase();
  const personaLine = ctx.persona ? ` As **${ctx.persona.name}**, your profile suggests` : " Based on your profile,";

  if (/loan|emi|borrow|interest/.test(p)) {
    return `${personaLine} waiting 6 months before this loan can save you roughly **₹48,000 in interest**. If you must take it now, keep your EMI under 35% of monthly income and avoid pre-payment penalties. Want me to compare two futures side-by-side in **Future Self**?`;
  }
  if (/scam|fraud|otp|phishing|fake|whatsapp/.test(p)) {
    return `Never share **OTP, PIN or CVV** — no genuine bank ever asks. If a message uses urgency ("account will be blocked"), it's almost always a scam. Paste the exact message in **Scam Shield** and I'll score the risk in seconds.`;
  }
  if (/save|saving|sip|invest|mutual|fund/.test(p)) {
    return `A simple rule: pay yourself first. Start a SIP of **10–15% of your income** in a diversified index or balanced fund. Even ₹3,000/month at 12% can grow to **~₹6.9L in 10 years**. Consistency beats timing.`;
  }
  if (/scheme|sarkari|yojana|govt|government|pension|subsidy/.test(p)) {
    return `Several central schemes likely match your profile — **PM Mudra**, **PM-SYM**, and **Atal Pension Yojana** are common starting points. The Government Schemes module (coming in Stage 3) will check your eligibility automatically.`;
  }
  if (/budget|spend|expense/.test(p)) {
    return `Try the **50-30-20 rule**: 50% needs, 30% wants, 20% savings + debt repayment. If 50% feels tight, your fixed costs (rent, EMIs, subscriptions) are probably eating your buffer — start there.`;
  }
  return `I'm here to help with **scams, loans, savings, and government schemes**. Try asking: *"Is this WhatsApp message a scam?"* or *"Should I take a ₹2 lakh personal loan?"* — I'll give you a clear answer in seconds.`;
}