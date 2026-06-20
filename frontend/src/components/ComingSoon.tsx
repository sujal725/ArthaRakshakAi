import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  title,
  description,
  icon: Icon = Sparkles,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <RequireAuth>
      <div className="min-h-dvh bg-background">
        <Navbar />
        <main className="mx-auto grid min-h-[calc(100dvh-8rem)] max-w-3xl place-items-center px-6 py-16">
          <div className="w-full rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
            <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-gradient-emerald text-primary-foreground shadow-lg shadow-primary/25">
              <Icon className="size-7" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3" /> Stage 3
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-3 text-muted-foreground">{description}</p>
            <Button asChild size="lg" className="mt-8 rounded-full bg-gradient-emerald px-7">
              <Link to="/dashboard">
                Back to Dashboard <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}