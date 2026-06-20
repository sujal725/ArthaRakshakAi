import { Sparkles, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGuardianMemory } from "@/context/GuardianMemory";

export function TwinEvolvedDialog() {
  const { previousTwinTitle, twinEvolutionReason, financialTwin, clearTwinEvolutionDialog } = useGuardianMemory();
  const open = !!previousTwinTitle;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) clearTwinEvolutionDialog(); }}>
      <DialogContent className="overflow-hidden rounded-3xl border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/15 sm:max-w-md">
        <div className="grid place-items-center pt-4">
          <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground animate-pulse-ring">
            <Sparkles className="size-6" aria-hidden />
          </span>
        </div>
        <DialogTitle className="text-center text-2xl font-bold">Your Financial Twin evolved</DialogTitle>
        <DialogDescription className="text-center text-sm text-muted-foreground">
          A new pattern of behaviour has shifted your twin.
        </DialogDescription>

        <div className="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 animate-scale-in">
          <div className="rounded-2xl border border-border bg-card/70 p-4 text-center">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Before</p>
            <p className="mt-1 text-base font-bold">{previousTwinTitle}</p>
          </div>
          <ArrowRight className="size-5 text-primary" aria-hidden />
          <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-center">
            <p className="text-[10px] font-semibold uppercase text-primary">Now</p>
            <p className="mt-1 text-base font-bold text-primary">{financialTwin.title}</p>
          </div>
        </div>

        {twinEvolutionReason && (
          <p className="rounded-2xl bg-accent/60 p-3 text-center text-sm text-foreground">
            {twinEvolutionReason}
          </p>
        )}

        <DialogFooter className="sm:justify-center">
          <Button onClick={clearTwinEvolutionDialog} className="rounded-full bg-gradient-emerald px-8">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}