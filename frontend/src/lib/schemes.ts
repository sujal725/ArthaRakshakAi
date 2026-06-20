import type { IncomeType, Concern } from "@/context/AppContext";

export type SchemeTag =
  | "farmer" | "woman" | "student" | "senior" | "gig" | "business" | "salary" | "retired";

export interface Scheme {
  id: string;
  name: string;
  benefit: string;
  benefits: string[];
  eligibility: string;
  documents: string[];
  difficulty: "easy" | "medium" | "hard";
  steps: string[];
  tags: SchemeTag[];
  officialUrl: string;
}

export const SCHEMES: Scheme[] = [
  {
    id: "pmkisan",
    name: "PM-KISAN",
    benefit: "₹6,000/year direct support to farmers",
    benefits: ["₹6,000/year direct cash assistance", "Three installments of ₹2,000", "Direct bank transfer"],
    eligibility: "Small and marginal landholding farmers across India",
    documents: ["Aadhaar", "Bank account", "Land ownership records", "PAN (optional)"],
    difficulty: "easy",
    steps: ["Register on portal", "Verify land records", "Receive DBT every 4 months"],
    tags: ["farmer"],
    officialUrl: "https://www.pmkisan.gov.in",
  },
  {
    id: "mudra",
    name: "PM Mudra Yojana",
    benefit: "Collateral-free loan up to ₹10 lakh",
    benefits: ["Loan up to ₹10 lakh", "Three tiers: Shishu/Kishore/Tarun", "No collateral required"],
    eligibility: "Non-corporate, non-farm small/micro enterprises",
    documents: ["Aadhaar", "PAN", "Business proof", "Bank statement (6 months)"],
    difficulty: "medium",
    steps: ["Pick a partner bank", "Submit business plan", "Receive sanction"],
    tags: ["business", "woman", "gig"],
    officialUrl: "https://www.mudra.org.in",
  },
  {
    id: "scholarship",
    name: "National Scholarship Portal",
    benefit: "Scholarships for SC/ST/OBC/Minority students",
    benefits: ["Tuition fee waiver", "Maintenance allowance", "Single window for 100+ schemes"],
    eligibility: "Students from eligible categories pursuing higher education",
    documents: ["Aadhaar", "Income certificate", "Caste certificate", "Bank account", "Bonafide certificate"],
    difficulty: "medium",
    steps: ["Register on NSP", "Upload documents", "Track sanction"],
    tags: ["student"],
    officialUrl: "https://scholarships.gov.in",
  },
  {
    id: "pmjjby",
    name: "PM Jeevan Jyoti Bima Yojana",
    benefit: "₹2 lakh life cover at ₹436/year",
    benefits: ["₹2 lakh life insurance cover", "Premium only ₹436/year", "Auto-debit from bank account"],
    eligibility: "Indian residents aged 18-50 with a bank account",
    documents: ["Aadhaar", "Bank account", "Nominee details"],
    difficulty: "easy",
    steps: ["Enroll at bank", "Auto-debit consent", "Renewed annually"],
    tags: ["salary", "gig", "farmer", "business"],
    officialUrl: "https://jansuraksha.gov.in",
  },
  {
    id: "apy",
    name: "Atal Pension Yojana",
    benefit: "Guaranteed pension ₹1,000-₹5,000/month",
    benefits: ["Guaranteed monthly pension after 60", "Government co-contribution for eligible", "Choose pension slab"],
    eligibility: "Indian citizens aged 18-40 with a bank account",
    documents: ["Aadhaar", "Bank account", "Mobile number"],
    difficulty: "easy",
    steps: ["Open APY at bank", "Pick pension slab", "Auto-debit till age 60"],
    tags: ["gig", "farmer", "salary"],
    officialUrl: "https://www.npscra.nsdl.co.in/scheme-details.php",
  },
  {
    id: "standup",
    name: "Stand-Up India",
    benefit: "Loan ₹10 lakh – ₹1 crore for SC/ST and women",
    benefits: ["Loan ₹10 lakh – ₹1 crore", "For greenfield enterprises", "Composite loan (term + working capital)"],
    eligibility: "Woman or SC/ST entrepreneur setting up greenfield enterprise",
    documents: ["Aadhaar", "PAN", "Business plan", "Caste certificate (if SC/ST)", "Bank statement"],
    difficulty: "hard",
    steps: ["Apply at Stand-Up portal", "Bank evaluation", "Loan disbursal"],
    tags: ["woman", "business"],
    officialUrl: "https://www.standupmitra.in",
  },
  {
    id: "ssy",
    name: "Sukanya Samriddhi Yojana",
    benefit: "High-interest savings for girl child",
    benefits: ["Interest ~8.2% p.a.", "Tax-free maturity", "Partial withdrawal at 18"],
    eligibility: "Parent/guardian of a girl child below 10 years",
    documents: ["Aadhaar of parent", "Birth certificate of girl", "Address proof"],
    difficulty: "easy",
    steps: ["Open at post office or bank", "Deposit annually", "Mature at 21 years"],
    tags: ["woman", "salary", "farmer"],
    officialUrl: "https://www.indiapost.gov.in/Financial/Pages/Content/Sukanya-Samriddhi-Account.aspx",
  },
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana",
    benefit: "Crop insurance against natural risks",
    benefits: ["Premium 1.5%-2% for farmers", "Covers natural calamities", "Claim via mobile app"],
    eligibility: "Farmers growing notified crops in notified areas",
    documents: ["Aadhaar", "Land records", "Bank account", "Sowing certificate"],
    difficulty: "medium",
    steps: ["Enroll via bank or CSC", "Pay nominal premium", "Claim if loss certified"],
    tags: ["farmer"],
    officialUrl: "https://pmfby.gov.in",
  },
];

const INCOME_TO_TAG: Record<IncomeType, SchemeTag> = {
  salary: "salary",
  gig: "gig",
  farmer: "farmer",
  business: "business",
  student: "student",
  retired: "retired",
};

export function getEligibleSchemes(filterTag: SchemeTag | null, opts: { incomeType: IncomeType | null; concerns: Concern[] }): { scheme: Scheme; match: number }[] {
  const userTag = opts.incomeType ? INCOME_TO_TAG[opts.incomeType] : null;
  return SCHEMES
    .map((scheme) => {
      let match = 50;
      if (filterTag && scheme.tags.includes(filterTag)) match += 30;
      if (userTag && scheme.tags.includes(userTag)) match += 20;
      if (opts.concerns.includes("schemes")) match += 5;
      if (scheme.difficulty === "easy") match += 5;
      if (scheme.difficulty === "hard") match -= 5;
      return { scheme, match: Math.max(40, Math.min(98, match)) };
    })
    .sort((a, b) => b.match - a.match);
}

export function getSchemeRecommendations(opts: { incomeType: IncomeType | null; concerns: Concern[]; personaName: string }): {
  reasonBullets: string[];
  schemes: Scheme[];
} {
  const tag = opts.incomeType ? INCOME_TO_TAG[opts.incomeType] : null;
  const top = getEligibleSchemes(tag, { incomeType: opts.incomeType, concerns: opts.concerns }).slice(0, 3).map((r) => r.scheme);
  const bullets = [
    `Based on your income type${opts.incomeType ? ` (${opts.incomeType})` : ""}`,
    opts.concerns[0] ? `Top concern: ${opts.concerns[0]}` : "Broad financial protection",
    `Persona: ${opts.personaName}`,
  ];
  return { reasonBullets: bullets, schemes: top };
}

export const TAG_LABELS: Record<SchemeTag, string> = {
  farmer: "Farmer",
  woman: "Woman Entrepreneur",
  student: "Student",
  senior: "Senior Citizen",
  gig: "Gig Worker",
  business: "Business Owner",
  salary: "Salary Employee",
  retired: "Retired",
};