import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useApp } from "@/context/AppContext";

/**
 * Client-side auth gate. Redirects unauthenticated users to /login.
 * Kept out of beforeLoad to keep build:dev prerender green.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
}