import { CheckCircle2, Sparkles } from "lucide-react";
import { useGuardianMemory } from "@/context/GuardianMemory";
import { useT } from "@/i18n/translations";

export function GuardianJourney() {
  const { journey } = useGuardianMemory();
  const t = useT();
  const sorted = [...journey].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold">Your Journey</h2>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-center">
          <p className="text-sm font-medium">{t("d_journeyEmpty")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("d_journeyEmptyHelp")}</p>
        </div>
      ) : (
        <ol className="relative max-h-80 space-y-3 overflow-y-auto pr-2">
          {sorted.map((m) => (
            <li
              key={m.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-accent/20 p-3"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-base" aria-hidden>
                {m.icon}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
                  {m.title}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{m.monthLabel}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}