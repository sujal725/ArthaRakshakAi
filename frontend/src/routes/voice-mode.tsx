import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Sparkles, Headphones, Volume2, Vibrate, ZoomIn, ArrowRight, User } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TwinHint } from "@/components/TwinHint";
import { useApp } from "@/context/AppContext";
import { useGuardianMemory } from "@/context/GuardianMemory";

import { transcribeAudio } from "@/lib/voice";
import { announce, stopAnnounce } from "@/lib/a11y";
import voiceHero from "@/assets/voice-mode-hero.png";
import guardianHead from "@/assets/guardian-headset.png";

export const Route = createFileRoute("/voice-mode")({
  head: () => ({
    meta: [
      { title: "Voice Guardian — ArthaRakshak" },
      { name: "description", content: "Speak naturally in Marathi, Hindi or English — your AI Guardian listens, remembers and guides." },
    ],
  }),
  component: VoiceGuarded,
});

function VoiceGuarded() {
  return (
    <RequireAuth>
      <VoicePage />
    </RequireAuth>
  );
}

const EXAMPLES = [
  "Should I take this loan?",
  "ह्या कर्जाचा EMI किती होईल?",
  "माझ्यासाठी कोणती सरकारी योजना आहे?",
];

type Phase = "idle" | "listening" | "thinking" | "speaking";

function uid() { return Math.random().toString(36).slice(2); }

function VoicePage() {
  const { a11yMode, setA11yMode, incomeType, language } = useApp();
  const memory = useGuardianMemory();
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentReply, setCurrentReply] = useState<{ reply: string; suggestedRoute?: string } | null>(null);

  const large = a11yMode === "large";
  async function callVoiceAPI(text: string, language: string) {
    const deviceId = localStorage.getItem("artharakshak_device_id") ?? "";
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/voice/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId, text, language, voice: true }), // NEW: voice: true
    });
    return res.json();
  }

  async function handleSpeak(prefill?: string) {
    if (phase !== "idle") return;
    stopAnnounce();               // NEW — cancel any speech still playing
    setCurrentReply(null);
    setPhase("listening");
    let text: string;
    if (prefill) {
      await new Promise((r) => setTimeout(r, 1200));
      text = prefill;
    } else {
      text = await transcribeAudio(language);
    }
    setCurrentUser(text);
    setPhase("thinking");
    await new Promise((r) => setTimeout(r, 1100));
    const apiResult = await callVoiceAPI(text, language);
    const replyData = { reply: apiResult.reply, suggestedRoute: apiResult.suggested_route };
    setCurrentReply(replyData);
    setPhase("speaking");
    announce(apiResult.speak_text ?? apiResult.reply, language);   // NEW — actually speak it
    const now = Date.now();
    memory.addVoiceTurn({ id: `vu_${uid()}`, ts: now, role: "user", text });
    memory.addVoiceTurn({ id: `vg_${uid()}`, ts: now + 1, role: "guardian", text: replyData.reply, suggestedRoute: replyData.suggestedRoute });
    memory.logAction({ module: "voice", action: `Voice chat: "${text.slice(0, 40)}"`, riskImpact: -2 });
    setTimeout(() => setPhase("idle"), 1800);
  }

  function onMicKey(e: React.KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleSpeak();
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        {/* Hero */}
        <header className="mb-6 grid items-center gap-6 md:grid-cols-[1fr_220px]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              <Headphones className="size-3.5" aria-hidden /> AI Voice Guardian
            </span>
            <h1 className={`mt-3 font-bold tracking-tight ${large ? "text-5xl" : "text-4xl sm:text-5xl"}`}>
              Ask naturally. Your Guardian listens. In your language.
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">Marathi · Hindi · English — no typing required.</p>
          </div>
          <img src={voiceHero} alt="" width={420} height={420} loading="lazy" className="hidden size-52 justify-self-end animate-float-soft md:block" />
        </header>

        <TwinHint context="voice" />

        {/* Accessibility Mode toggle */}
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
          <div>
            <p className="text-sm font-semibold">Accessibility Mode</p>
            <p className="text-xs text-muted-foreground">Larger text, high contrast and voice-first controls.</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={large}
              onCheckedChange={(v) => setA11yMode(v ? "large" : "normal")}
              aria-label="Toggle accessibility mode"
            />
            <span className="text-sm font-medium">{large ? "On" : "Off"}</span>
          </div>
        </section>

        {large && (
          <div className="mb-6 flex flex-wrap gap-2 text-xs">
            <Pill icon={Volume2} label="Voice Enabled" />
            <Pill icon={Vibrate} label="Haptic Feedback" />
            <Pill icon={ZoomIn} label="Large Text Mode" />
          </div>
        )}

        {/* Voice Card */}
        <section
          aria-live="polite"
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-secondary/10 p-10 text-center shadow-sm"
        >
          <button
            type="button"
            onClick={() => handleSpeak()}
            onKeyDown={onMicKey}
            disabled={phase !== "idle"}
            aria-label={
              phase === "idle" ? "Tap to speak"
                : phase === "listening" ? "Listening"
                  : phase === "thinking" ? "Thinking"
                    : "Speaking"
            }
            aria-pressed={phase === "listening"}
            className={`relative mx-auto grid size-28 place-items-center rounded-full bg-gradient-emerald text-primary-foreground shadow-xl shadow-primary/30 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:opacity-80 ${phase === "listening" ? "animate-pulse-ring scale-110" : phase === "idle" ? "hover:scale-105 animate-pulse-ring" : ""
              }`}
          >
            <Mic className="size-12" aria-hidden />
          </button>

          <div className="mt-6 min-h-32">
            {phase === "idle" && (
              <div>
                <p className={`font-semibold ${large ? "text-xl" : "text-base"}`}>Tap to Speak</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Try:</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => handleSpeak(ex)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-sm transition hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      "{ex}"
                    </button>
                  ))}
                </div>
              </div>
            )}
            {phase === "listening" && (
              <div>
                <Waveform />
                <p className="mt-3 text-sm font-medium text-primary">Listening…</p>
                {currentUser && <p className="mt-1 text-sm text-foreground">"{currentUser}"</p>}
              </div>
            )}
            {phase === "thinking" && (
              <div className="flex flex-col items-center gap-2">
                <span className="inline-flex h-7 items-center gap-1">
                  <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                  <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                  <span className="size-2 animate-bounce rounded-full bg-primary" />
                </span>
                <p className="text-sm font-medium text-primary">Analyzing Guardian Profile…</p>
              </div>
            )}
            {phase === "speaking" && currentReply && (
              <SpeakingBubble reply={currentReply.reply} route={currentReply.suggestedRoute} large={large} />
            )}
          </div>
        </section>

        {/* Conversation History */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Conversation history</h2>
          {memory.voiceHistory.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Your conversations will appear here once you speak with your Guardian.
            </p>
          ) : (
            <ul className="space-y-3">
              {memory.voiceHistory.map((turn) => (
                <li key={turn.id} className={turn.role === "user" ? "flex justify-end" : "flex gap-3"}>
                  {turn.role === "guardian" && (
                    <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-emerald text-primary-foreground">
                      <Sparkles className="size-4" aria-hidden />
                    </span>
                  )}
                  <div
                    className={
                      turn.role === "user"
                        ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-sm"
                        : "max-w-[80%] rounded-2xl rounded-tl-sm bg-accent px-4 py-2.5 text-accent-foreground"
                    }
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                      {turn.role === "user" ? "You" : "Guardian"}
                    </p>
                    <p className="mt-1 text-sm">{turn.text}</p>
                    {turn.suggestedRoute && (
                      <Link
                        to={turn.suggestedRoute as "/scam-shield"}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline"
                      >
                        Open <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                  {turn.role === "user" && (
                    <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                      <User className="size-4" aria-hidden />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof Volume2; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
      <Icon className="size-3.5" aria-hidden /> {label}
    </span>
  );
}

function Waveform() {
  return (
    <div className="mx-auto flex h-12 items-center justify-center gap-1.5" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="block w-1.5 rounded-full bg-primary"
          style={{
            height: `${8 + ((i * 7) % 28)}px`,
            animation: "pulse 1s ease-in-out infinite",
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

function SpeakingBubble({ reply, route, large }: { reply: string; route?: string; large: boolean }) {
  return (
    <div className="mx-auto flex max-w-xl items-start gap-3 text-left animate-in fade-in slide-in-from-bottom-2 duration-500">
      <img src={guardianHead} alt="" width={64} height={64} loading="lazy" className="size-14 shrink-0 rounded-2xl bg-accent p-1" />
      <div className="flex-1 rounded-2xl rounded-tl-sm bg-card border border-border p-4 shadow-sm">
        <p className={`leading-relaxed ${large ? "text-lg" : "text-sm"}`}>{reply}</p>
        {route && (
          <Button asChild size="sm" className="mt-3 rounded-full bg-gradient-emerald">
            <Link to={route as "/scam-shield"}>
              Open <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}