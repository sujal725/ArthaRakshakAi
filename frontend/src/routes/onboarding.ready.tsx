import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2, ShieldCheck, ArrowRight, Radar, Landmark, Activity } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useT } from "@/i18n/translations";
import { derivePersona, deriveRisks, type RiskLevel } from "@/lib/persona";
import { Button } from "@/components/ui/button";
import activatedImg from "@/assets/guardian-activated.png";
import personaImg from "@/assets/ai-persona.png";

export const Route = createFileRoute("/onboarding/ready")({
  head: () => ({ meta: [{ title: "Guardian Activated — ArthaRakshak" }] }),
  component: ReadyStep,
});

const LEVEL_STYLE: Record<RiskLevel, { ring: string; chip: string }> = {
  low: { ring: "ring-primary/40 bg-primary/5", chip: "bg-primary/15 text-primary" },
  medium: { ring: "ring-warning/50 bg-warning/5", chip: "bg-warning/20 text-warning-foreground" },
  high: { ring: "ring-destructive/50 bg-destructive/5", chip: "bg-destructive/15 text-destructive" },
};

function ReadyStep() {
  const { incomeType, concerns, setGuardianActive } = useApp();
  const t = useT();
  const persona = derivePersona(incomeType);
  const risks = deriveRisks(incomeType, concerns);

  useEffect(() => { setGuardianActive(true); }, [setGuardianActive]);

  const riskCards: { key: string; level: RiskLevel; icon: typeof Radar; rationale: string }[] = [
    { key: "s5_scam", level: risks.scam, icon: ShieldCheck, rationale: t("axis_scams") },
    { key: "s5_loan", level: risks.loan, icon: Landmark, rationale: t("axis_loans") },
    { key: "s5_cash", level: risks.cash, icon: Activity, rationale: t("axis_cash") },
  ];

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-6 w-fit">
        <img src={activatedImg} alt="" width={200} height={200} loading="lazy" className="size-40 animate-float-soft" />
        <span className="absolute -bottom-1 left-1/2 grid size-10 -translate-x-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg animate-pulse-ring">
          <CheckCircle2 className="size-5" />
        </span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("s5_ready")}</h1>
      <p className="mt-3 text-muted-foreground">{t("s5_help")}</p>

      {/* AI Persona */}
      <section aria-label={t("s5_persona")} className="mt-10 overflow-hidden rounded-3xl border border-border bg-card p-6 text-left">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">{t("s5_persona")}</p>
        <div className="flex items-center gap-5">
          <img src={personaImg} alt="" width={96} height={96} loading="lazy" className="size-20 rounded-2xl bg-accent p-2" />
          <div>
            <h2 className="text-2xl font-bold">{persona.name}</h2>
            <p className="mt-1 text-muted-foreground">{persona.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {persona.traits.map((tr) => (
                <span key={tr} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{tr}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Risks */}
      <section aria-label={t("s5_risks")} className="mt-6 text-left">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("s5_risks")}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {riskCards.map(({ key, level, icon: Icon, rationale }) => {
            const s = LEVEL_STYLE[level];
            return (
              <div key={key} className={`rounded-3xl border border-border bg-card p-5 ring-2 ${s.ring}`}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.chip}`}>
                    {t(`level_${level}`)}
                  </span>
                </div>
                <p className="text-base font-semibold">{t(key)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{rationale}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Protection Status */}
      <section aria-label={t("s5_status")} className="mt-6 overflow-hidden rounded-3xl bg-gradient-emerald p-6 text-left text-primary-foreground">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-white/15 animate-pulse-ring">
            <ShieldCheck className="size-7" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{t("s5_status")}</p>
            <p className="text-xl font-bold">{t("s5_active")}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {["s5_scamScanner", "s5_incomeSignals", "s5_loanAdvisor", "s5_schemeMatcher"].map((k) => (
            <div key={k} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm">
              <span>{t(k)}</span>
              <span className="flex items-center gap-1 text-xs font-semibold">
                <span className="size-2 rounded-full bg-emerald-300" />
                {t("s5_on")}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Button asChild size="lg" className="mt-8 rounded-full bg-gradient-emerald px-8 text-base font-semibold shadow-lg shadow-primary/25">
        <Link to="/dashboard">{t("s5_enterDashboard")} <ArrowRight className="ml-1 size-4" /></Link>
      </Button>
    </div>
  );
}