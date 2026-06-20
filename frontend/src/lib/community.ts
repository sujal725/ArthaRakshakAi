import type { GuardianMemoryState } from "@/context/GuardianMemory";

export interface ScamTrend { city: string; trend: string; severity: "low" | "medium" | "high"; count: number; }
export interface CommunityStory { id: string; name: string; persona: string; quote: string; outcome: string; }
export interface CommunityImpact { label: string; value: string; sub: string; }

export interface CommunityPoll {
  id: string;
  question: string;
  majorityPct: number;
  majorityChoice: string;
  aiSummary: string;
  options?: { label: string; pct: number }[];
  ctaRoute?: string;
  ctaLabel?: string;
}

export function generateScamTrends(): ScamTrend[] {
  return [
    { city: "Mumbai", trend: "UPI refund scams up 24% this week", severity: "high", count: 142 },
    { city: "Pune",   trend: "Loan-approval call scams rising",    severity: "medium", count: 87  },
    { city: "Nashik", trend: "Fake scholarship WhatsApp forwards", severity: "medium", count: 54  },
  ];
}

export function generateCommunityStories(memory: GuardianMemoryState): CommunityStory[] {
  const twin = memory.financialTwin.title;
  return [
    { id: "s1", name: "Asha, 34", persona: "Salaried · Mumbai",
      quote: "ArthaRakshak caught a fake EMI message before I tapped it.",
      outcome: "Avoided ₹18,000 loss" },
    { id: "s2", name: "Ravi, 41", persona: `Farmer · ${twin}`,
      quote: "The Guardian helped me apply for PM-KISAN in one afternoon.",
      outcome: "₹6,000 / year unlocked" },
    { id: "s3", name: "Meera, 28", persona: "Gig worker · Pune",
      quote: "Cash-flow forecast warned me 3 weeks before a shortfall.",
      outcome: "Built ₹12,000 buffer" },
  ];
}

export function generateCommunityImpact(): CommunityImpact[] {
  return [
    { label: "Guardians active",  value: "12,480", sub: "across India" },
    { label: "Scams blocked",     value: "3,210",  sub: "this month" },
    { label: "Money protected",   value: "₹4.2 Cr", sub: "community total" },
    { label: "Schemes unlocked",  value: "1,860",  sub: "matched & applied" },
  ];
}

export function generateCommunityPolls(memory: GuardianMemoryState): CommunityPoll[] {
  const twin = memory.financialTwin.title;
  return [
    {
      id: "p1",
      question: "Is this ₹2L personal loan safe?",
      majorityPct: 72,
      majorityChoice: "Take a lower EMI option",
      aiSummary: `People with your ${twin} profile usually avoid this loan.`,
      ctaRoute: "/future-self",
      ctaLabel: "See Future Self",
    },
    {
      id: "p2",
      question: "Should I invest during festival season?",
      majorityPct: 68,
      majorityChoice: "Invest only after emergency savings are secured",
      aiSummary: `${twin}s tend to secure 3 months of buffer before festival SIPs.`,
      ctaRoute: "/financial-calendar",
      ctaLabel: "Open Calendar",
    },
    {
      id: "p3",
      question: "Which government scheme helped most?",
      majorityPct: 54,
      majorityChoice: "PM-KISAN",
      aiSummary: `Most ${twin}s report PM-KISAN unlocked the fastest benefit.`,
      options: [
        { label: "PM-KISAN",   pct: 54 },
        { label: "PMJJBY",     pct: 28 },
        { label: "Scholarship", pct: 18 },
      ],
      ctaRoute: "/government-schemes",
      ctaLabel: "Explore Schemes",
    },
  ];
}