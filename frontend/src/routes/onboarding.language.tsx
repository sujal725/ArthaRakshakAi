import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp, type Language } from "@/context/AppContext";
import { LANGUAGES, useT } from "@/i18n/translations";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { StepNav } from "@/components/onboarding/StepNav";
import { Check } from "lucide-react";

export const Route = createFileRoute("/onboarding/language")({
  head: () => ({ meta: [{ title: "Choose Language — ArthaRakshak" }] }),
  component: LanguageStep,
});

function LanguageStep() {
  const { language, setLanguage } = useApp();
  const t = useT();
  const nav = useNavigate();

  const pick = (code: Language) => {
    setLanguage(code);
    setTimeout(() => nav({ to: "/onboarding/income" }), 600);
  };

  return (
    <>
      <StepHeader title={t("s1_title")} help={t("s1_help")} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {LANGUAGES.map((l) => {
          const selected = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => pick(l.code)}
              className={`card-lift relative flex min-h-[120px] flex-col items-start justify-between rounded-3xl border-2 p-5 text-left transition ${selected ? "border-primary bg-accent" : "border-border bg-card"}`}
            >
              <span className="text-2xl font-semibold">{l.native}</span>
              <span className="text-sm text-muted-foreground">{l.english}</span>
              {selected && (
                <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <StepNav next="/onboarding/income" />
    </>
  );
}