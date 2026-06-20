import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Users, UserPlus, Share2, Mail, QrCode, AlertTriangle, Sparkles, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TwinHint } from "@/components/TwinHint";
import { useGuardianMemory, type TrustedMember } from "@/context/GuardianMemory";
import { prettyScheme } from "@/context/GuardianMemory";
import trustedHero from "@/assets/trusted-circle-hero.png";

export const Route = createFileRoute("/trusted-circle")({
  head: () => ({
    meta: [
      { title: "Trusted Circle — ArthaRakshak" },
      { name: "description", content: "Share AI-generated financial decisions with family, mentors and people you trust." },
    ],
  }),
  component: TrustedGuarded,
});

function TrustedGuarded() {
  return (
    <RequireAuth>
      <TrustedCirclePage />
    </RequireAuth>
  );
}

const SEED_MEMBERS: TrustedMember[] = [
  { id: "m_mom",     name: "Mother",     relationship: "Family",  status: "online" },
  { id: "m_brother", name: "Brother",    relationship: "Family",  status: "trusted" },
  { id: "m_teacher", name: "Teacher",    relationship: "Mentor",  status: "recent" },
  { id: "m_ngo",     name: "NGO Mentor", relationship: "Mentor",  status: "trusted" },
  { id: "m_friend",  name: "Friend",     relationship: "Friend",  status: "online" },
  { id: "m_advisor", name: "Advisor",    relationship: "Advisor", status: "trusted" },
];

function TrustedCirclePage() {
  const memory = useGuardianMemory();

  // Seed once
  useEffect(() => {
    if (memory.trustedCircle.length === 0) {
      memory.setTrustedCircle(SEED_MEMBERS);
      memory.logAction({ module: "trusted", action: "Built initial Trusted Circle", riskImpact: -5 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topScheme = memory.recommendedSchemes[0]
    ? prettyScheme(memory.recommendedSchemes[0])
    : "PM Mudra Yojana";

  const decision = memory.futureGoal ?? "₹2L Personal Loan";
  const verdict = memory.futureGoal ? "Stay the course — your Twin already chose wisely." : "Avoid taking this loan immediately.";

  const advice = generateTrustedAdvice({
    twin: memory.financialTwin.title,
    incomeType: memory.incomeType,
    decision,
  });

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-6 py-10">
        <header className="mb-6 grid items-center gap-6 md:grid-cols-[1fr_240px]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              <Users className="size-3.5" aria-hidden /> Trusted Circle
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Never make a financial decision alone.
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Share AI summaries with family, teachers, mentors and people you trust.
            </p>
          </div>
          <img src={trustedHero} alt="" width={480} height={480} loading="lazy" className="hidden size-56 justify-self-end animate-float-soft md:block" />
        </header>

        <TwinHint context="trusted" />

        {/* Members grid */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Trusted members</h2>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => toast.message("Invite Member", { description: "Coming in Stage 5" })}
            >
              <UserPlus className="size-4" /> Invite Member
            </Button>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memory.trustedCircle.map((m) => (
              <li key={m.id} className="card-lift flex items-center gap-3 rounded-3xl border border-border bg-card p-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-gradient-emerald text-primary-foreground font-bold">
                    {m.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.relationship}</p>
                </div>
                <StatusBadge status={m.status} />
              </li>
            ))}
          </ul>
        </section>

        {/* Share Decision Card */}
        <section className="mt-10 overflow-hidden rounded-3xl bg-gradient-emerald p-7 text-primary-foreground shadow-xl shadow-primary/30">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-white/15">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-85">Share decision</p>
              <h2 className="mt-1 text-2xl font-bold">Considering: {decision}</h2>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <Stat label="Interest" value="15%" />
                <Stat label="Risk" value={<span className="inline-flex items-center gap-1"><AlertTriangle className="size-4" aria-hidden /> HIGH</span>} />
                <Stat label="Alternative" value={topScheme} />
                <Stat label="Twin" value={memory.financialTwin.title} />
              </dl>

              <div className="mt-5 rounded-2xl bg-white/15 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-85">AI Verdict</p>
                <p className="mt-1 text-base font-semibold">{verdict}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  className="rounded-full bg-white text-primary hover:bg-white/90"
                  onClick={() => toast.message("Share via WhatsApp", { description: "Coming in Stage 5" })}
                  aria-label="Share via WhatsApp"
                >
                  <MessageCircle className="size-4" /> WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/15"
                  onClick={() => toast.message("Share via Email", { description: "Coming in Stage 5" })}
                  aria-label="Share via Email"
                >
                  <Mail className="size-4" /> Email
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/15"
                  onClick={() => toast.message("Generate QR", { description: "Coming in Stage 5" })}
                  aria-label="Generate QR code"
                >
                  <QrCode className="size-4" /> QR
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted advice timeline */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Trusted advice</h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {advice.map((a) => (
              <li key={a.author} className="rounded-3xl border border-border bg-card p-5 card-lift">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{a.author}</p>
                <p className="mt-2 text-sm">{a.message}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
                  <ShieldCheck className="size-3" aria-hidden /> Trusted voice
                </p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <dt className="text-[10px] font-semibold uppercase opacity-80">{label}</dt>
      <dd className="mt-1 text-base font-semibold">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: TrustedMember["status"] }) {
  const map = {
    online:  { chip: "bg-primary/15 text-primary",          label: "Online" },
    trusted: { chip: "bg-secondary/30 text-foreground",     label: "Trusted" },
    recent:  { chip: "bg-warning/20 text-warning-foreground", label: "Recently active" },
  } as const;
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.chip}`}>
      <ShieldCheck className="size-3" aria-hidden /> {s.label}
    </span>
  );
}

function generateTrustedAdvice(opts: { twin: string; incomeType: string | null; decision: string }): { author: string; message: string }[] {
  const { twin, incomeType } = opts;
  return [
    {
      author: "Mother",
      message: incomeType === "student"
        ? "Beta, finish your studies first. Don't rush into debt."
        : "Wait for six months. Build a buffer before any big commitment.",
    },
    {
      author: "Teacher",
      message: incomeType === "student"
        ? "Education loans are easier on your future cash flow than personal loans."
        : "Compare the EMI to your monthly savings — never let it cross 35%.",
    },
    {
      author: "AI Guardian",
      message: `People with a ${twin} twin save more by delaying this loan and starting a small SIP first.`,
    },
  ];
}