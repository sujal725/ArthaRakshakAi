import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Navbar } from "@/components/layout/Navbar";
import { Logo } from "@/components/layout/Logo";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingShell,
});

const STEPS = [
  { path: "/onboarding/language", n: 1 },
  { path: "/onboarding/income", n: 2 },
  { path: "/onboarding/cashflow", n: 3 },   // NEW
  { path: "/onboarding/concern", n: 4 },
  { path: "/onboarding/accessibility", n: 5 },
  { path: "/onboarding/ready", n: 6 },
];
function OnboardingShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = STEPS.find((s) => pathname.startsWith(s.path))?.n ?? 1;
  const pct = (current / STEPS.length) * 100;

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <Logo />
          <span>Step {current} of {STEPS.length}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-accent">
          <div className="h-full rounded-full bg-gradient-emerald transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-8">
        <Outlet />
      </main>
    </div>
  );
}