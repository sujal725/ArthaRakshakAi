import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Shield, IndianRupee, AlertTriangle, Mic, LineChart } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import guardianAuth from "@/assets/guardian-auth.png";

const FLOATERS = [
  { Icon: Shield, top: "8%", left: "10%", delay: "0s" },
  { Icon: IndianRupee, top: "22%", right: "12%", delay: "1.1s" },
  { Icon: AlertTriangle, bottom: "32%", left: "6%", delay: "2.2s" },
  { Icon: Mic, bottom: "14%", right: "14%", delay: "1.6s" },
  { Icon: LineChart, top: "52%", right: "4%", delay: "0.6s" },
] as const;

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex h-16 max-w-[1400px] items-center px-6">
        <Link to="/" aria-label="ArthaRakshak home">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1400px] gap-10 px-6 pb-12 md:grid-cols-2 md:items-center">
        {/* Illustration side */}
        <section
          aria-hidden
          className="relative hidden overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent via-secondary/30 to-primary/15 p-10 md:block md:min-h-[560px]"
        >
          {FLOATERS.map(({ Icon, delay, ...pos }, i) => (
            <span
              key={i}
              style={{ ...pos, animationDelay: delay }}
              className="absolute grid size-12 place-items-center rounded-2xl border border-white/40 bg-white/70 text-primary shadow-sm backdrop-blur animate-float-soft"
            >
              <Icon className="size-5" />
            </span>
          ))}
          <img
            src={guardianAuth}
            alt=""
            width={1024}
            height={1024}
            className="absolute inset-0 m-auto size-[80%] object-contain drop-shadow-2xl animate-float-soft"
          />
        </section>
        {/* Form side */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}