import { ShieldCheck } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="grid size-9 place-items-center rounded-xl bg-gradient-emerald text-primary-foreground shadow-md shadow-primary/20">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </div>
      <span className="text-lg font-semibold tracking-tight">
        Artha<span className="text-primary">Rakshak</span>
      </span>
    </div>
  );
}