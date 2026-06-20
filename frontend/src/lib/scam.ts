// Scam analysis — seeded heuristics. No backend, no AI APIs.

export type RiskLevel = "low" | "medium" | "high";

export interface ScamReason {
  explanation: string;
  evidence: string | null;
}

export interface ScamVerdict {
  score: number; // 0–100
  level: RiskLevel;
  reasons: ScamReason[];
  recommendations: string[];
  pattern?: string;
  extracted_text?: string;
}

const SCAM_KEYWORDS: { kw: RegExp; reason: string; weight: number }[] = [
  { kw: /\b(otp|cvv|pin)\b/i, reason: "Asks for OTP, CVV or PIN", weight: 35 },
  { kw: /urgent|immediately|expire|block(ed)?|suspend/i, reason: "Uses urgency tactics", weight: 20 },
  { kw: /refund|cashback|reward|won|lottery|prize/i, reason: "Promises money / prize", weight: 18 },
  { kw: /https?:\/\/(bit\.ly|tinyurl|t\.co|rb\.gy|cutt\.ly)/i, reason: "Suspicious shortened link", weight: 25 },
  { kw: /click here|verify now|update kyc/i, reason: "Pushes you to click a link", weight: 15 },
  { kw: /upi|paytm|gpay|phonepe/i, reason: "Mentions UPI / payment app", weight: 8 },
  { kw: /courier|parcel|customs|delivery/i, reason: "Courier / parcel pattern", weight: 12 },
];

export async function analyzeMessage(text: string): Promise<ScamVerdict> {
  await new Promise((r) => setTimeout(r, 1800));
  if (!text.trim()) {
    return {
      score: 0,
      level: "low",
      reasons: ["No message provided"],
      recommendations: ["Paste the suspicious message to analyze"],
    };
  }
  let score = 8;
  const reasons: string[] = [];
  for (const { kw, reason, weight } of SCAM_KEYWORDS) {
    if (kw.test(text)) {
      score += weight;
      reasons.push(reason);
    }
  }
  score = Math.min(99, score);
  const level: RiskLevel = score >= 65 ? "high" : score >= 35 ? "medium" : "low";
  const pattern =
    /refund|cashback/i.test(text) ? "Fake UPI Refund"
      : /courier|parcel/i.test(text) ? "Courier Scam"
        : /kyc/i.test(text) ? "Fake KYC Update"
          : /lottery|won|prize/i.test(text) ? "Lottery Scam"
            : level === "high" ? "Suspicious request" : undefined;

  if (reasons.length === 0) reasons.push("No obvious scam patterns detected");

  const recommendations =
    level === "high"
      ? ["Do not click any links", "Do not share OTP, PIN or CVV", "Block the sender and report to 1930"]
      : level === "medium"
        ? ["Verify the sender via an official channel", "Avoid clicking unknown links"]
        : ["Looks safe — stay alert anyway"];

  return { score, level, reasons: reasons.slice(0, 4), recommendations, pattern };
}

export async function analyzeScreenshot(_file: File): Promise<ScamVerdict> {
  await new Promise((r) => setTimeout(r, 2200));
  return {
    score: 87,
    level: "high",
    reasons: [
      "Spoofed bank logo detected",
      "Suspicious shortened URL in image",
      "Asks for one-time password",
    ],
    recommendations: [
      "Do not visit the link shown",
      "Block the sender immediately",
      "Report at cybercrime.gov.in",
    ],
    pattern: "Fake bank notice",
  };
}

// Highlight boxes overlaid on the preview image (% of width/height).
export const SCREENSHOT_HIGHLIGHTS = [
  { x: 8, y: 12, w: 60, h: 14, label: "Spoofed logo" },
  { x: 12, y: 46, w: 70, h: 10, label: "Suspicious link" },
  { x: 18, y: 70, w: 55, h: 12, label: "Requests OTP" },
];