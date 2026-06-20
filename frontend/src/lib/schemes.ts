import type { IncomeType, Concern } from "@/context/AppContext";

export type SchemeTag =
  | "farmer" | "woman" | "student" | "senior" | "gig" | "business" | "salary" | "retired" | "disabled";

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
    officialUrl: "https://pmkisan.gov.in",
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
    officialUrl: "https://www.jansuraksha.gov.in/Forms-PMJJBY.aspx",
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
    officialUrl: "https://npscra.nsdl.co.in/scheme-details.php",
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
    officialUrl: "https://www.indiapost.gov.in/Financial/pages/content/sukanya-samriddhi-account.aspx",
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

  // ---------- Disability schemes (previously missing entirely) ----------
  {
    id: "adip",
    name: "ADIP Scheme",
    benefit: "Free/subsidised assistive devices (wheelchairs, hearing aids, prosthetics)",
    benefits: [
      "Free aids for those below poverty line",
      "50% subsidy for moderate income groups",
      "Covers wheelchairs, hearing aids, Braille kits, prosthetics, tricycles",
    ],
    eligibility: "Persons with disabilities (40%+ disability) with valid UDID/disability certificate",
    documents: ["UDID card / disability certificate", "Income certificate", "Aadhaar", "Passport-size photo"],
    difficulty: "easy",
    steps: ["Apply via implementing NGO/ALIMCO", "Disability assessment camp", "Device issued/fitted"],
    tags: ["disabled"],
    officialUrl: "https://www.disabilityaffairs.gov.in/content/page/adip.php",
  },
  {
    id: "nhfdc-loan",
    name: "NHFDC Concessional Loan",
    benefit: "Low-interest loans (5-8%) for self-employment",
    benefits: [
      "Loans up to ₹30 lakh for self-employment ventures",
      "Interest rates as low as 5% for women/below-poverty applicants",
      "Covers business, vocational training, education loans",
    ],
    eligibility: "Persons with disabilities (40%+) seeking self-employment or higher education",
    documents: ["UDID/disability certificate", "Project report", "Aadhaar", "Bank account"],
    difficulty: "medium",
    steps: ["Apply through State Channelising Agency", "Submit project proposal", "Loan sanction & disbursal"],
    tags: ["disabled", "business"],
    officialUrl: "https://www.nhfdc.nic.in",
  },
  {
    id: "disability-pension",
    name: "Indira Gandhi National Disability Pension Scheme",
    benefit: "Monthly pension of ₹300-₹1,000 for severely disabled",
    benefits: [
      "Monthly pension (amount varies by state top-up)",
      "Direct bank transfer",
      "No repayment — pure social security support",
    ],
    eligibility: "Persons with 80%+ disability or multiple disabilities, BPL household, aged 18-79",
    documents: ["UDID/disability certificate", "BPL certificate", "Aadhaar", "Bank account", "Age proof"],
    difficulty: "easy",
    steps: ["Apply at Gram Panchayat/Municipal office", "Verification", "Monthly DBT begins"],
    tags: ["disabled", "senior"],
    officialUrl: "https://nsap.nic.in/Guidelines/igndps_guidelines.pdf",
  },
  {
    id: "udid",
    name: "UDID Card (Unique Disability ID)",
    benefit: "Single ID unlocking all disability scheme benefits nationally",
    benefits: [
      "Universal proof of disability accepted across India",
      "Required gateway document for ADIP, pension, reservations, tax benefits",
      "Free to apply, issued digitally",
    ],
    eligibility: "Any person with a certified disability under the RPWD Act 2016",
    documents: ["Medical assessment certificate", "Aadhaar", "Passport-size photo", "Address proof"],
    difficulty: "easy",
    steps: ["Register on UDID portal", "Attend medical board assessment", "Download e-card"],
    tags: ["disabled"],
    officialUrl: "https://www.swavlambancard.gov.in",
  },
  {
    id: "deendayal-disability-rehab",
    name: "Deendayal Disabled Rehabilitation Scheme (DDRS)",
    benefit: "Funding for rehab, education & vocational training via NGOs",
    benefits: [
      "Special schools and vocational training centres",
      "Early intervention and therapy services",
      "Community-based rehabilitation support",
    ],
    eligibility: "Persons with disabilities accessing NGO-run rehabilitation/education centres",
    documents: ["UDID/disability certificate", "Aadhaar", "Enrollment proof with partner NGO"],
    difficulty: "medium",
    steps: ["Locate a DDRS-registered NGO nearby", "Enroll for relevant program", "Avail therapy/training"],
    tags: ["disabled", "student"],
    officialUrl: "https://disabilityaffairs.gov.in/content/page/ddrs.php",
  },
  {
    id: "disability-tax-80u",
    name: "Income Tax Deduction (Section 80U / 80DD)",
    benefit: "Tax deduction ₹75,000-₹1,25,000 for disability",
    benefits: [
      "₹75,000 deduction for 40-79% disability, ₹1,25,000 for 80%+",
      "Section 80DD covers caregiver expenses for dependents with disability",
      "Directly reduces taxable income — no separate application",
    ],
    eligibility: "Taxpayer with certified disability, or taxpayer supporting a dependent with disability",
    documents: ["UDID/medical certificate (Form 10-IA if needed)", "PAN", "ITR filing"],
    difficulty: "easy",
    steps: ["Obtain disability certificate from a govt hospital", "Claim deduction while filing ITR"],
    tags: ["disabled", "salary", "business"],
    officialUrl: "https://www.incometax.gov.in",
  },

  // ---------- Additional realistic schemes for broader category coverage ----------
  {
    id: "nps",
    name: "National Pension System (NPS)",
    benefit: "Market-linked retirement corpus + tax benefits",
    benefits: [
      "Additional ₹50,000 tax deduction under Section 80CCD(1B)",
      "Choice of equity/debt allocation",
      "Portable across jobs and locations",
    ],
    eligibility: "Indian citizens aged 18-70, especially salaried employees",
    documents: ["Aadhaar", "PAN", "Bank account", "Photo"],
    difficulty: "easy",
    steps: ["Open NPS account via employer or eNPS portal", "Choose fund manager & allocation", "Contribute monthly/annually"],
    tags: ["salary", "business"],
    officialUrl: "https://npscra.nsdl.co.in",
  },
  {
    id: "vaya-vandana",
    name: "Pradhan Mantri Vaya Vandana Yojana",
    benefit: "Guaranteed pension for senior citizens",
    benefits: [
      "Guaranteed return ~7.4% p.a. (LIC-administered)",
      "Monthly/quarterly/annual payout options",
      "10-year guaranteed pension plan",
    ],
    eligibility: "Senior citizens aged 60+",
    documents: ["Aadhaar", "Age proof", "Bank account"],
    difficulty: "easy",
    steps: ["Purchase via LIC branch or online", "Choose payout frequency", "Receive guaranteed pension"],
    tags: ["retired", "senior"],
    officialUrl: "https://licindia.in/Products/Pension-Plans/Pradhan-Mantri-Vaya-Vandana-Yojana-1",
  },
  {
    id: "e-shram",
    name: "e-Shram Card (Unorganised Workers)",
    benefit: "₹2 lakh accident insurance + access to welfare schemes",
    benefits: [
      "Free accidental insurance cover up to ₹2 lakh",
      "National database unlocking gig/unorganised worker welfare schemes",
      "Portable social security ID",
    ],
    eligibility: "Unorganised sector and gig workers aged 16-59",
    documents: ["Aadhaar", "Bank account", "Mobile number"],
    difficulty: "easy",
    steps: ["Register at eshram.gov.in or CSC", "Verify via Aadhaar OTP", "Receive e-Shram card"],
    tags: ["gig"],
    officialUrl: "https://eshram.gov.in",
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

/**
 * Returns ONLY schemes matching the selected category tag.
 * If no tag is selected, falls back to the user's income-type tag so the
 * page is never empty, but a category filter always narrows results —
 * this fixes the bug where PM-KISAN showed for every income type.
 */
export function getEligibleSchemes(
  filterTag: SchemeTag | null,
  opts: { incomeType: IncomeType | null; concerns: Concern[] },
): { scheme: Scheme; match: number }[] {
  const userTag = opts.incomeType ? INCOME_TO_TAG[opts.incomeType] : null;
  const effectiveTag = filterTag ?? userTag;

  const pool = effectiveTag
    ? SCHEMES.filter((s) => s.tags.includes(effectiveTag))
    : SCHEMES;

  return pool
    .map((scheme) => {
      // Deterministic fallback score (used only if live AI match isn't available yet).
      // Real match % + reasoning now comes from /api/schemes/match — see government-schemes.tsx.
      let match = 60;
      if (effectiveTag && scheme.tags.includes(effectiveTag)) match += 25;
      if (opts.concerns.includes("schemes")) match += 5;
      if (scheme.difficulty === "easy") match += 5;
      if (scheme.difficulty === "hard") match -= 10;
      return { scheme, match: Math.max(40, Math.min(95, match)) };
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
  disabled: "Person with Disability",
};