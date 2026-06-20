import { Sparkles } from "lucide-react";
import { useGuardianMemory } from "@/context/GuardianMemory";
import { twinLine, type TwinContext } from "@/lib/financialTwin";

export function TwinHint({ context }: { context: TwinContext }) {
  const { financialTwin } = useGuardianMemory();
  return (
    <div
      role="note"
      aria-label={`Financial Twin hint: ${financialTwin.title}`}
      className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground"
    >
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
        <Sparkles className="size-3.5" aria-hidden />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          Your Financial Twin · {financialTwin.title}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{twinLine(financialTwin, context)}</p>
      </div>
    </div>
  );
}