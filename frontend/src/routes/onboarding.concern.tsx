import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Landmark, PiggyBank, TrendingUp, FileText, Activity, Check } from "lucide-react";
import { useApp, type Concern } from "@/context/AppContext";
import { useT } from "@/i18n/translations";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { StepNav } from "@/components/onboarding/StepNav";

export const Route = createFileRoute("/onboarding/concern")({
  head: () => ({ meta: [{ title: "Concerns — ArthaRakshak" }] }),
  component: ConcernStep,
});

const OPTIONS: { id: Concern; icon: typeof AlertTriangle; key: string }[] = [
  { id: "scams", icon: AlertTriangle, key: "concern_scams" },
  { id: "loans", icon: Landmark, key: "concern_loans" },
  { id: "savings", icon: PiggyBank, key: "concern_savings" },
  { id: "investments", icon: TrendingUp, key: "concern_investments" },
  { id: "schemes", icon: FileText, key: "concern_schemes" },
  { id: "income", icon: Activity, key: "concern_income" },
];

function ConcernStep() {
  const { concerns, setConcerns } = useApp();
  const t = useT();

  const toggle = (id: Concern) => {
    if (concerns.includes(id)) setConcerns(concerns.filter((c) => c !== id));
    else if (concerns.length < 3) setConcerns([...concerns, id]);
  };

  return (
    <>
      <StepHeader title={t("s3_title")} help={t("s3_help")} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {OPTIONS.map(({ id, icon: Icon, key }) => {
          const selected = concerns.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={`card-lift relative flex min-h-[140px] flex-col items-start justify-between rounded-3xl border-2 p-5 text-left transition ${selected ? "border-primary bg-accent" : "border-border bg-card"}`}
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-accent text-primary">
                <Icon className="size-5" />
              </span>
              <span className="text-base font-semibold">{t(key)}</span>
              {selected && (
                <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <StepNav back="/onboarding/income" next="/onboarding/accessibility" canNext={concerns.length > 0} />
    </>
  );
}