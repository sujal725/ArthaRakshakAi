import { Link, useRouterState } from "@tanstack/react-router";
import { Mic, MicOff, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useApp, type Language } from "@/context/AppContext";
import { LANGUAGES, useT } from "@/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type NavTo =
  | "/dashboard" | "/scam-shield" | "/financial-calendar" | "/future-self"
  | "/ai-assistant" | "/government-schemes" | "/community" | "/impact" | "/accessibility";

const NAV_ITEMS: { label: string; to: NavTo }[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Scam Shield", to: "/scam-shield" },
  { label: "Financial Calendar", to: "/financial-calendar" },
  { label: "Future Self", to: "/future-self" },
  { label: "AI Assistant", to: "/ai-assistant" },
  { label: "Government Schemes", to: "/government-schemes" },
  { label: "Community", to: "/community" },
  { label: "Impact", to: "/impact" },
  { label: "Accessibility", to: "/accessibility" },
];

export function Navbar() {
  const { language, setLanguage, voiceMode, setVoiceMode, isAuthenticated, user, signOut } = useApp();
  const t = useT();
  const current = LANGUAGES.find((l) => l.code === language)!;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const initials = (user?.name ?? "G")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-6">
        <Link to={isAuthenticated ? "/dashboard" : "/"} aria-label="ArthaRakshak home">
          <Logo />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-[6px] left-3 right-3 h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 rounded-full">
                <span className="text-base">{current.native}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              {LANGUAGES.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLanguage(l.code as Language)}
                  className="flex items-center justify-between gap-3"
                >
                  <span>{l.native}</span>
                  <span className="text-xs text-muted-foreground">{l.english}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={voiceMode ? "default" : "ghost"}
            size="icon"
            aria-label={voiceMode ? "Disable voice mode" : "Enable voice mode"}
            onClick={() => {
              setVoiceMode(!voiceMode);
              toast.message(voiceMode ? "Voice mode off" : "Voice mode on — speak anywhere");
            }}
            className="rounded-full"
          >
            {voiceMode ? <Mic className="size-4" /> : <MicOff className="size-4" />}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Profile menu"
                  className="flex items-center gap-2 rounded-full bg-accent pr-3 transition hover:bg-accent/70"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-gradient-emerald text-sm font-bold text-primary-foreground">
                    {initials}
                  </span>
                  <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="font-semibold">{user?.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" /> {t("nav_signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/login">{t("nav_signIn")}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-gradient-emerald px-4">
                <Link to="/signup">{t("nav_getStarted")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}