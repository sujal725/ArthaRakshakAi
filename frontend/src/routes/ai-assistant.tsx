import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Mic, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp, type Language } from "@/context/AppContext";
import { useT, LANGUAGES } from "@/i18n/translations";
import { transcribeAudio } from "@/lib/voice";
import { announce, stopAnnounce } from "@/lib/a11y";
import aiAvatar from "@/assets/ai-assistant-hero.png";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — ArthaRakshak" },
      { name: "description", content: "Ask your Financial Guardian anything — speak or type in your language." },
    ],
  }),
  component: AssistantGuarded,
});

function AssistantGuarded() {
  return (
    <RequireAuth>
      <AssistantPage />
    </RequireAuth>
  );
}

function uid() { return Math.random().toString(36).slice(2); }

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const QUICK_LANGUAGES = LANGUAGES.filter((l) => ["en", "hi", "mr", "kn"].includes(l.code));

async function callAssistantAPI(text: string, language: string, voice: boolean) {
  const deviceId = localStorage.getItem("artharakshak_device_id") ?? "";
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/voice/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_id: deviceId, text, language, voice }),
  });
  if (!res.ok) throw new Error("Assistant request failed");
  return res.json();
}

function AssistantPage() {
  const t = useT();
  const { language, setLanguage } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: uid(), role: "assistant", content: t("ai_greeting"), ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function reply(text: string, opts: { voice?: boolean } = {}) {
    const isVoice = !!opts.voice;
    setMessages((m) => [...m, { id: uid(), role: "user", content: text, ts: Date.now() }]);
    setThinking(true);
    try {
      const result = await callAssistantAPI(text, language, isVoice);
      const answer = result.reply ?? "Sorry, I couldn't understand that. Please try again.";
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: answer, ts: Date.now() }]);
      // Only speak the answer if the question itself was asked by voice.
      if (isVoice) {
        announce(result.speak_text ?? answer, language);
      }
    } catch (error) {
      console.error(error);
      setMessages((m) => [...m, {
        id: uid(), role: "assistant",
        content: "I'm having trouble reaching the Guardian right now. Please try again in a moment.",
        ts: Date.now(),
      }]);
    }
    setThinking(false);
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    stopAnnounce();
    reply(trimmed, { voice: false });
  }

  async function startVoice() {
    if (listening || thinking) return;
    setVoiceError(null);
    setListening(true);
    try {
      const txt = await transcribeAudio(language);
      setListening(false);
      reply(txt, { voice: true });
    } catch (error) {
      setListening(false);
      setVoiceError(error instanceof Error ? error.message : "Could not hear that. Please try again or type instead.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
        <header className="mb-4 flex items-center gap-4">
          <img src={aiAvatar} alt="" width={64} height={64} loading="lazy" className="size-14 rounded-2xl bg-accent p-1" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("ai_title")}</h1>
            <p className="text-sm text-muted-foreground">{t("ai_sub")}</p>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {QUICK_LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code as Language)}
              aria-pressed={language === l.code}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                language === l.code ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-3xl border border-border bg-card p-6">
          <ScrollArea className="h-full">
            <ul className="space-y-5">
              {messages.map((m) => (
                <li key={m.id} className={m.role === "user" ? "flex justify-end" : "flex gap-3"}>
                  {m.role === "assistant" && (
                    <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-emerald text-primary-foreground">
                      <Sparkles className="size-4" />
                    </span>
                  )}
                  <div className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-sm"
                      : "max-w-[88%] text-foreground"
                  }>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(m.content) }} />
                  </div>
                </li>
              ))}
              {thinking && (
                <li className="flex gap-3">
                  <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-emerald text-primary-foreground animate-pulse-ring">
                    <Sparkles className="size-4" />
                  </span>
                  <div className="flex items-center gap-1 pt-2">
                    <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                    <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                    <span className="size-2 animate-bounce rounded-full bg-primary" />
                    <span className="ml-2 text-xs text-muted-foreground">{t("ai_thinking")}</span>
                  </div>
                </li>
              )}
              {listening && (
                <li className="flex justify-end">
                  <div className="rounded-2xl bg-accent px-4 py-2.5 text-sm text-primary animate-pulse">{t("ai_listening")}</div>
                </li>
              )}
            </ul>
          </ScrollArea>
        </div>

        {voiceError && <p className="mt-2 text-xs text-destructive">{voiceError}</p>}

        <form onSubmit={submit} className="mt-4 rounded-3xl border border-border bg-card p-3 shadow-sm">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("ai_placeholder")}
            rows={2}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            className="min-h-12 resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
          />
          <div className="mt-2 flex items-center justify-between">
            <Button
              type="button" variant="ghost" size="icon"
              aria-label={t("ai_voiceLabel")} aria-pressed={listening}
              onClick={startVoice}
              className={`rounded-full ${listening ? "animate-pulse-ring bg-primary text-primary-foreground" : "text-primary"}`}
            >
              <Mic className="size-5" />
            </Button>
            <Button type="submit" size="sm" disabled={!input.trim() || thinking} className="rounded-full bg-gradient-emerald px-5">
              <Send className="mr-1 size-4" /> {t("ai_send")}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function formatInline(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}