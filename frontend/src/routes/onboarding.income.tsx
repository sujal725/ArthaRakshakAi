import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Bike, Wheat, Store, GraduationCap, Heart, Check } from "lucide-react";
import { useApp, type IncomeType } from "@/context/AppContext";
import { useT } from "@/i18n/translations";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { StepNav } from "@/components/onboarding/StepNav";

export const Route = createFileRoute("/onboarding/income")({
  head: () => ({ meta: [{ title: "Income — ArthaRakshak" }] }),
  component: IncomeStep,
});

const OPTIONS: { id: IncomeType; icon: typeof Briefcase; key: string }[] = [
  { id: "salary", icon: Briefcase, key: "income_salary" },
  { id: "gig", icon: Bike, key: "income_gig" },
  { id: "farmer", icon: Wheat, key: "income_farmer" },
  { id: "business", icon: Store, key: "income_business" },
  { id: "student", icon: GraduationCap, key: "income_student" },
  { id: "retired", icon: Heart, key: "income_retired" },
];

function IncomeStep() {
  const { incomeType, setIncomeType } = useApp();
  const t = useT();

  return (
    <>
      <StepHeader title={t("s2_title")} help={t("s2_help")} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {OPTIONS.map(({ id, icon: Icon, key }) => {
          const selected = incomeType === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setIncomeType(id)}
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
      <StepNav back="/onboarding/language" next="/onboarding/cashflow" canNext={!!incomeType} />
    </>
  );
}