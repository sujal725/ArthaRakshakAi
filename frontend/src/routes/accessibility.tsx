import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Accessibility as A11yIcon, Check, Languages, Volume2, Type, Contrast, Eye, Brain, Hand,
  Keyboard, ShieldAlert, Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useApp, type Language } from "@/context/AppContext";
import { useT, LANGUAGES } from "@/i18n/translations";
import { announce } from "@/lib/a11y";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility — ArthaRakshak" },
      { name: "description", content: "Adjust text size, contrast, voice, language, and senior-friendly Guardian settings." },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const t = useT();
  const { language, setLanguage, a11y, setA11ySetting, setSeniorMode } = useApp();
  const [speaking, setSpeaking] = useState(false);
  const currentLangName = LANGUAGES.find((l) => l.code === language)?.english ?? "English";

  const handleRead = () => {
    const ok = announce(
      "Welcome to ArthaRakshak. Your Guardian is protecting your finances.",
      language,
    );
    if (ok) {
      setSpeaking(true);
      setTimeout(() => setSpeaking(false), 4000);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Hero */}
        <header className="mb-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-500 p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <A11yIcon className="size-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Accessibility</h1>
              <p className="text-sm text-white/85">Make your Guardian comfortable for you — and the people you protect.</p>
            </div>
          </div>
        </header>

        {/* Preferred Language */}
        <Section
          title={t("a11y_language")}
          subtitle={t("a11y_language_sub")}
          icon={Languages}
        >
          <fieldset>
            <legend className="sr-only">Preferred language</legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup">
              {LANGUAGES.map((l) => {
                const selected = l.code === language;
                return (
                  <button
                    key={l.code}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setLanguage(l.code as Language)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-foreground">{l.native}</p>
                      <p className="text-xs text-muted-foreground">{l.english}</p>
                    </div>
                    {selected && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        <Check className="size-4" aria-hidden /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <p className="mt-3 text-sm text-muted-foreground">Current language: <strong className="text-foreground">{currentLangName}</strong></p>
        </Section>

        {/* Senior Citizen Mode */}
        <Section
          title={`👴 ${t("a11y_senior")}`}
          subtitle={t("a11y_senior_sub")}
          icon={Hand}
          highlight
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-foreground">Enable a simpler, larger, voice-first Guardian.</p>
            <Switch
              checked={a11y.seniorMode}
              onCheckedChange={setSeniorMode}
              aria-label="Toggle Senior Citizen Mode"
            />
          </div>
          {a11y.seniorMode && (
            <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("a11y_senior_features")}</p>
              <ul className="mt-2 grid gap-2 text-sm text-foreground sm:grid-cols-2">
                {["Extra Large Text", "Voice First", "Bigger Buttons", "Reduced Complexity", "Emergency Trusted Circle Shortcut"].map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="size-4 text-emerald-600" aria-hidden /> {f}</li>
                ))}
              </ul>
              <Button asChild size="lg" className="mt-4">
                <Link to="/trusted-circle">
                  <ShieldAlert className="mr-2 size-5" aria-hidden /> Emergency: Open Trusted Circle
                </Link>
              </Button>
            </div>
          )}
        </Section>

        {/* Large Text */}
        <Section title="Large Text Mode" subtitle="Increase text size across the Guardian." icon={Type}>
          <div role="radiogroup" aria-label="Text size" className="grid gap-2 sm:grid-cols-3">
            {(["normal", "large", "extraLarge"] as const).map((size) => (
              <button
                key={size}
                role="radio"
                aria-checked={a11y.largeText === size}
                onClick={() => setA11ySetting("largeText", size)}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  a11y.largeText === size ? "border-primary bg-primary/5 text-foreground" : "border-border bg-card text-muted-foreground"
                }`}
              >
                {size === "normal" ? "Normal" : size === "large" ? "Large" : "Extra Large"}
              </button>
            ))}
          </div>
        </Section>

        {/* High Contrast */}
        <ToggleSection
          title="High Contrast"
          subtitle="Boost contrast for low-vision readability."
          icon={Contrast}
          checked={a11y.highContrast}
          onChange={(v) => setA11ySetting("highContrast", v)}
          ariaLabel="Toggle high contrast"
        />

        {/* Screen Reader */}
        <Section title="Screen Reader" subtitle="Have the Guardian read key messages aloud." icon={Volume2}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">Enable screen reader support</p>
            <Switch
              checked={a11y.screenReader}
              onCheckedChange={(v) => setA11ySetting("screenReader", v)}
              aria-label="Toggle screen reader"
            />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={handleRead} disabled={!a11y.screenReader} variant="outline">
              <Volume2 className="mr-2 size-4" aria-hidden /> {t("a11y_readSample")}
            </Button>
            <span aria-live="polite" className="text-xs text-muted-foreground">
              {speaking ? "Speaking…" : "Idle"}
            </span>
          </div>
        </Section>

        {/* Voice Navigation */}
        <Section title="Voice Navigation" subtitle="Move through the Guardian using your voice." icon={Sparkles}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">Enable voice navigation</p>
            <Switch
              checked={a11y.voiceNavigation}
              onCheckedChange={(v) => setA11ySetting("voiceNavigation", v)}
              aria-label="Toggle voice navigation"
            />
          </div>
          {a11y.voiceNavigation && (
            <ul className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              <li>"Open Dashboard"</li>
              <li>"Check this message"</li>
              <li>"Show my schemes"</li>
              <li>"Open Trusted Circle"</li>
              <li>"What is my Guardian Score?"</li>
            </ul>
          )}
        </Section>

        {/* Dyslexia + Colour Blind */}
        <ToggleSection
          title="Dyslexia Mode"
          subtitle="Wider spacing and softer line height."
          icon={Brain}
          checked={a11y.dyslexiaMode}
          onChange={(v) => setA11ySetting("dyslexiaMode", v)}
          ariaLabel="Toggle dyslexia mode"
        />
        <ToggleSection
          title="Color Blind Mode"
          subtitle="Adjust palette so colour is never the only indicator."
          icon={Eye}
          checked={a11y.colorBlindMode}
          onChange={(v) => setA11ySetting("colorBlindMode", v)}
          ariaLabel="Toggle colour blind mode"
        />

        {/* Keyboard Navigation */}
        <Section title={t("a11y_keyboard")} subtitle={t("a11y_keyboard_sub")} icon={Keyboard}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              { k: "Tab", d: "Move focus" },
              { k: "Enter", d: "Select option" },
              { k: "Arrow Keys", d: "Navigate tabs" },
              { k: "Space", d: "Activate controls" },
            ].map((s) => (
              <li key={s.k} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <kbd className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs">
                  ⌨ {s.k}
                </kbd>
                <span className="text-sm text-muted-foreground">{s.d}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ISL */}
        <Section title="Indian Sign Language (ISL)" subtitle="Coming soon — Guardian explanations in ISL video." icon={Hand}>
          <p className="text-sm text-muted-foreground">We're partnering with ISL educators to bring video explainers to scams, schemes and decisions.</p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

function Section({
  title, subtitle, icon: Icon, highlight, children,
}: { title: string; subtitle: string; icon: typeof Type; highlight?: boolean; children: React.ReactNode }) {
  return (
    <section
      aria-label={title}
      className={`mt-6 rounded-3xl border p-6 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ToggleSection({
  title, subtitle, icon, checked, onChange, ariaLabel,
}: { title: string; subtitle: string; icon: typeof Type; checked: boolean; onChange: (v: boolean) => void; ariaLabel: string }) {
  return (
    <Section title={title} subtitle={subtitle} icon={icon}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground">{checked ? "Enabled" : "Disabled"}</p>
        <Switch checked={checked} onCheckedChange={onChange} aria-label={ariaLabel} />
      </div>
    </Section>
  );
}