import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Mic, ShieldAlert, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VoiceDemoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [phase, setPhase] = useState<"idle" | "listening" | "result">("idle");

  useEffect(() => {
    if (!open) { setPhase("idle"); return; }
    setPhase("listening");
    const t = setTimeout(() => setPhase("result"), 2200);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Try the Voice Guardian</DialogTitle>
          <DialogDescription>Speak naturally. The Guardian replies in your language.</DialogDescription>
        </DialogHeader>

        <div className="my-4 grid gap-4">
          <div className="flex items-center gap-4 rounded-2xl bg-accent p-5">
            <div className={`relative grid size-14 place-items-center rounded-full bg-primary text-primary-foreground ${phase === "listening" ? "animate-pulse-ring" : ""}`}>
              <Mic className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">You said</p>
              <p className="font-medium">
                {phase === "listening" ? "Listening…" : "“Is this UPI request from my bank safe?”"}
              </p>
            </div>
          </div>

          {phase === "result" && (
            <div className="rounded-2xl border border-border bg-card p-5 animate-fade-in">
              <div className="mb-3 flex items-center gap-2 text-destructive">
                <ShieldAlert className="size-5" />
                <span className="font-semibold">Likely scam — do not pay</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-primary" /> Real banks never request UPI PIN to "receive" money.</li>
                <li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-primary" /> Sender number is not on the official bank list.</li>
                <li className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-primary" /> Matches a known "refund credit" scam pattern.</li>
              </ul>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
                <Sparkles className="size-4 text-primary" />
                Replied in your language in 4 seconds.
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="rounded-full">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}