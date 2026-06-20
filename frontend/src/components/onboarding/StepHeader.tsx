import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useT } from "@/i18n/translations";

export function StepHeader({ title, help }: { title: string; help: string }) {
  const t = useT();
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{help}</p>
      </div>
      <Button
        variant="outline"
        className="shrink-0 rounded-full border-primary/30 text-primary"
        onClick={() => toast.message(t("listening"), { description: t("speakInstead") })}
      >
        <Mic className="mr-1 size-4" /> {t("speakInstead")}
      </Button>
    </div>
  );
}