import { ShieldCheck, TrendingUp, MessageSquare, Users, ShieldAlert, Landmark } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useGuardianMemory, type GuardianLevel } from "@/context/GuardianMemory";

const LEVEL_STYLE: Record<GuardianLevel, { chip: string; icon: string }> = {
  "Protected":      { chip: "bg-muted text-muted-foreground",        icon: "🛡️" },
  "Planner":        { chip: "bg-secondary/30 text-foreground",       icon: "🧭" },
  "Guardian":       { chip: "bg-primary/15 text-primary",            icon: "🛡️" },
  "Wise Guardian":  { chip: "bg-primary/20 text-primary",            icon: "✨" },
  "Financial Sage": { chip: "bg-gradient-emerald text-primary-foreground", icon: "👑" },
};

export function GuardianScoreCard() {
  const { guardianScore, guardianLevel } = useGuardianMemory();
  const score = guardianScore;
  const radius = 48;
  const C = 2 * Math.PI * radius;
  const offset = C - (score / 100) * C;
  const style = LEVEL_STYLE[guardianLevel];

  const improvements = [
    { label: "Start SIP",            delta: 8, icon: TrendingUp,    to: "/future-self" as const },
    { label: "Add trusted member",   delta: 5, icon: Users,         to: "/trusted-circle" as const },
    { label: "Enable scam alerts",   delta: 7, icon: ShieldAlert,   to: "/scam-shield" as const },
    { label: "Check eligible schemes", delta: 4, icon: Landmark,    to: "/government-schemes" as const },
  ];

  return (
    <article className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-secondary/15 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="10" />
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-primary)" strokeWidth="10"
              strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 800ms ease" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <ShieldCheck className="mx-auto size-5 text-primary" aria-hidden />
              <div className="text-2xl font-bold leading-none">{score}</div>
              <div className="text-[10px] text-muted-foreground">/ 100</div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Guardian Score</p>
          <p className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${style.chip}`}>
            <span aria-hidden>{style.icon}</span> {guardianLevel}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Calculated from scam safety, cash flow, savings, schemes and your trusted circle.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card/70 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">How to improve</p>
        <ul className="mt-2 grid gap-2">
          {improvements.map((i) => (
            <li key={i.label}>
              <Link
                to={i.to}
                className="group flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-2">
                  <i.icon className="size-4 text-primary" aria-hidden />
                  {i.label}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  +{i.delta}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}