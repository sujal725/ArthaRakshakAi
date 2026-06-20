import { createFileRoute } from "@tanstack/react-router";
import { Eye, Type, Mic, Contrast, Accessibility, Check } from "lucide-react";
import { useApp, type A11yMode } from "@/context/AppContext";
import { useT } from "@/i18n/translations";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { StepNav } from "@/components/onboarding/StepNav";

export const Route = createFileRoute("/onboarding/accessibility")({
  head: () => ({ meta: [{ title: "Accessibility — ArthaRakshak" }] }),
  component: A11yStep,
});

const MODES: { id: A11yMode; icon: typeof Eye; key: string }[] = [
  { id: "normal", icon: Eye, key: "a11y_normal" },
  { id: "large", icon: Type, key: "a11y_large" },
  { id: "voice", icon: Mic, key: "a11y_voice" },
  { id: "hc", icon: Contrast, key: "a11y_hc" },
  { id: "sr", icon: Accessibility, key: "a11y_sr" },
];

function A11yStep() {
  const { a11yMode, setA11yMode } = useApp();
  const t = useT();

  return (
    <>
      <StepHeader title={t("s4_title")} help={t("s4_help")} />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          {MODES.map(({ id, icon: Icon, key }) => {
            const selected = a11yMode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setA11yMode(id)}
                className={`card-lift relative flex min-h-[120px] flex-col items-start justify-between rounded-3xl border-2 p-4 text-left transition ${selected ? "border-primary bg-accent" : "border-border bg-card"}`}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold">{t(key)}</span>
                {selected && (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="mb-4 text-sm font-medium text-muted-foreground">{t("a11y_preview")}</p>
          <div className="rounded-2xl bg-accent p-5">
            <p className="font-semibold">{t("d_alerts")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("d_alert1")}</p>
          </div>
        </div>
      </div>
      <StepNav back="/onboarding/concern" next="/onboarding/ready" />
    </>
  );
}