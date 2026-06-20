import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/translations";

export function StepNav({ back, next, canNext = true, finishLabel }: {
  back?: string; next?: string; canNext?: boolean; finishLabel?: string;
}) {
  const t = useT();
  const nav = useNavigate();
  return (
    <div className="mt-10 flex items-center justify-between">
      {back ? (
        <Button variant="ghost" className="rounded-full" onClick={() => nav({ to: back as never })}>
          <ArrowLeft className="mr-1 size-4" /> {t("back")}
        </Button>
      ) : <span />}
      {next && (
        <Button
          disabled={!canNext}
          onClick={() => { if (canNext) nav({ to: next as never }); }}
          className="rounded-full bg-gradient-emerald px-7 disabled:opacity-50"
        >
          {finishLabel ?? t("next")} <ArrowRight className="ml-1 size-4" />
        </Button>
      )}
    </div>
  );
}