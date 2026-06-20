import { Link, useRouterState } from "@tanstack/react-router";
import { Mic } from "lucide-react";
import { useApp } from "@/context/AppContext";

const HIDDEN = new Set(["/", "/login", "/signup", "/forgot-password"]);

export function VoiceGuardianFAB() {
  const { isAuthenticated } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const hidden =
    !isAuthenticated ||
    HIDDEN.has(pathname) ||
    pathname.startsWith("/onboarding") ||
    pathname === "/voice-mode";

  if (hidden) return null;

  return (
    <Link
      to="/voice-mode"
      aria-label="Open Voice Guardian"
      className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-gradient-emerald text-primary-foreground shadow-xl shadow-primary/40 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 animate-pulse-ring"
    >
      <Mic className="size-6" aria-hidden />
    </Link>
  );
}