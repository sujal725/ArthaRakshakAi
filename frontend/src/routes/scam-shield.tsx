import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ShieldCheck, Mic, AlertTriangle, TrendingUp, TrendingDown, Upload, Sparkles, MapPin,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/translations";
import { analyzeMessage, analyzeScreenshot, SCREENSHOT_HIGHLIGHTS, type ScamVerdict } from "@/lib/scam";
import { transcribeAudio, analyzeVoiceScam, type VoiceVerdict } from "@/lib/voice";
import { useGuardianMemory } from "@/context/GuardianMemory";
import { TwinHint } from "@/components/TwinHint";
import scamHero from "@/assets/scam-shield-hero.png";
import voiceImg from "@/assets/voice-scam.png";

export const Route = createFileRoute("/scam-shield")({
  head: () => ({
    meta: [
      { title: "Scam Shield — ArthaRakshak" },
      { name: "description", content: "Check suspicious messages, screenshots, links and voice calls instantly with AI." },
    ],
  }),
  component: ScamShieldGuarded,
});

function ScamShieldGuarded() {
  const t = useT();
  return (
    <RequireAuth>
      <div className="min-h-dvh bg-background">
        <Navbar />
        <main className="mx-auto max-w-[1200px] px-6 py-10">
          <header className="mb-8 grid items-center gap-6 md:grid-cols-[1fr_240px]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="size-3.5" /> {t("ss_badge")}
              </span>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t("ss_title")}</h1>
              <p className="mt-3 max-w-xl text-muted-foreground">{t("ss_sub")}</p>
            </div>
            <img src={scamHero} alt="" width={480} height={480} loading="lazy" className="hidden size-56 justify-self-end animate-float-soft md:block" />
          </header>

          <TwinHint context="scam" />

          <Tabs defaultValue="message" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-accent p-1 sm:grid-cols-4">
              <TabsTrigger value="message" className="rounded-xl">{t("ss_tabMessage")}</TabsTrigger>
              <TabsTrigger value="screenshot" className="rounded-xl">{t("ss_tabScreenshot")}</TabsTrigger>
              <TabsTrigger value="voice" className="rounded-xl">{t("ss_tabVoice")}</TabsTrigger>
              <TabsTrigger value="trends" className="rounded-xl">{t("ss_tabTrends")}</TabsTrigger>
            </TabsList>

            <TabsContent value="message" className="mt-6"><MessageTab /></TabsContent>
            <TabsContent value="screenshot" className="mt-6"><ScreenshotTab /></TabsContent>
            <TabsContent value="voice" className="mt-6"><VoiceTab /></TabsContent>
            <TabsContent value="trends" className="mt-6"><TrendsTab /></TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}

const LEVEL_COLOR: Record<ScamVerdict["level"], { ring: string; chip: string; text: string }> = {
  low: { ring: "stroke-primary", chip: "bg-primary/15 text-primary", text: "LOW RISK" },
  medium: { ring: "stroke-warning", chip: "bg-warning/20 text-warning-foreground", text: "MEDIUM RISK" },
  high: { ring: "stroke-destructive", chip: "bg-destructive/15 text-destructive", text: "HIGH RISK" },
};

function ScoreRing({ score, level }: { score: number; level: ScamVerdict["level"] }) {
  const radius = 56;
  const C = 2 * Math.PI * radius;
  const offset = C - (score / 100) * C;
  return (
    <div className="relative shrink-0">
      <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="10" />
        <circle cx="70" cy="70" r={radius} fill="none" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={offset} transform="rotate(-90 70 70)"
          className={LEVEL_COLOR[level].ring} style={{ transition: "stroke-dashoffset 800ms ease" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-bold">{score}%</div>
          <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${LEVEL_COLOR[level].chip}`}>{LEVEL_COLOR[level].text}</div>
        </div>
      </div>
    </div>
  );
}

function VerdictCard({ verdict, t }: { verdict: ScamVerdict; t: (k: string) => string }) {
  return (
    <article className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={verdict.score} level={verdict.level} />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("ss_riskScore")}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-semibold">{t("ss_reasons")}</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {verdict.reasons.map((r) => (
                  <li key={r} className="flex gap-2"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" /> {r}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold">{t("ss_recommendations")}</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {verdict.recommendations.map((r) => (
                  <li key={r} className="flex gap-2"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" /> {r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {verdict.pattern && (
        <div className="mt-5 rounded-2xl bg-accent p-3 text-sm">
          <span className="font-semibold text-primary">{t("ss_pattern")}: </span>
          <span className="text-accent-foreground">{verdict.pattern}</span>
        </div>
      )}
    </article>
  );
}
async function callScamAPI(message: string) {
  const deviceId = localStorage.getItem("artharakshak_device_id") ?? "";
  const formData = new FormData();
  formData.append("device_id", deviceId);
  formData.append("message", message);
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scam/analyze-text`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

function MessageTab() {
  const t = useT();
  const memory = useGuardianMemory();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<ScamVerdict | null>(null);



  async function run() {
    setLoading(true); setVerdict(null);
    const v = await callScamAPI(text);
    setVerdict(v); setLoading(false);
    memory.setScamRiskScore(v.score);
    memory.logAction({
      module: "scam",
      action: v.level === "high" ? "Avoided high-risk scam message" : "Analyzed a suspicious message",
      riskImpact: Math.round(v.score / 5),
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <label htmlFor="msg" className="text-sm font-semibold">{t("ss_msgPlaceholder")}</label>
      <Textarea
        id="msg" value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Dear customer, your KYC will expire today. Click here to update: bit.ly/sbi-kyc"
        className="mt-3 min-h-[140px] rounded-2xl text-base"
      />
      <div className="mt-4 flex justify-end">
        <Button onClick={run} disabled={loading || !text.trim()} size="lg" className="rounded-full bg-gradient-emerald px-7">
          {loading ? t("ss_thinking") : t("ss_analyze")}
        </Button>
      </div>
      {loading && <ThinkingPulse label={t("ss_thinking")} />}
      {verdict && <VerdictCard verdict={verdict} t={t} />}
    </div>
  );
}

function ThinkingPulse({ label }: { label: string }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-accent p-6 text-sm text-primary">
      <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground animate-pulse-ring">
        <Sparkles className="size-4" />
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function ScreenshotTab() {
  const t = useT();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<ScamVerdict | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    setFile(f); setVerdict(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  async function run() {
    setLoading(true); setVerdict(null);
    const v = await callScamAPI(text);
    setVerdict(v); setLoading(false);
    memory.setScamRiskScore(v.score);
    memory.logAction({
      module: "scam",
      action: v.level === "high" ? "Avoided high-risk scam message" : "Analyzed a suspicious message",
      riskImpact: Math.round(v.score / 5),
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
        className="grid w-full place-items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-accent/30 px-6 py-10 text-sm text-muted-foreground transition hover:border-primary/50 hover:bg-accent"
      >
        <Upload className="size-6 text-primary" />
        <span>{t("ss_uploadHint")}</span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only"
        onChange={(e) => pick(e.target.files?.[0] ?? undefined)} />

      {preview && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
            <img src={preview} alt="Screenshot preview" className="w-full" />
            {verdict && SCREENSHOT_HIGHLIGHTS.map((h, i) => (
              <span key={i}
                style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
                className="pointer-events-none absolute rounded-md border-2 border-destructive bg-destructive/10 animate-in fade-in duration-500">
                <span className="absolute -top-6 left-0 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">{h.label}</span>
              </span>
            ))}
          </div>
          <div>
            <Button onClick={run} disabled={loading} size="lg" className="w-full rounded-full bg-gradient-emerald">
              {loading ? t("ss_thinking") : t("ss_analyzeShot")}
            </Button>
            {loading && <ThinkingPulse label={t("ss_thinking")} />}
            {verdict && <VerdictCard verdict={verdict} t={t} />}
          </div>
        </div>
      )}
    </div>
  );
}

function VoiceTab() {
  const t = useT();
  const [phase, setPhase] = useState<"idle" | "listening" | "transcribing" | "verdict">("idle");
  const [transcript, setTranscript] = useState("");
  const [verdict, setVerdict] = useState<VoiceVerdict | null>(null);

  async function start() {
    setPhase("listening"); setTranscript(""); setVerdict(null);
    const txt = await transcribeAudio();
    setTranscript(txt); setPhase("transcribing");
    const v = await analyzeVoiceScam(txt);
    setVerdict(v); setPhase("verdict");
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center">
      <img src={voiceImg} alt="" width={160} height={160} loading="lazy" className="mx-auto size-32" />
      <p className="mt-2 text-muted-foreground">{t("ss_voicePrompt")}</p>
      <div className="mt-6 grid place-items-center">
        <button
          type="button"
          onClick={start}
          aria-label={t("ss_voiceStart")}
          aria-pressed={phase === "listening"}
          disabled={phase === "listening" || phase === "transcribing"}
          className={`relative grid size-24 place-items-center rounded-full bg-gradient-emerald text-primary-foreground shadow-xl shadow-primary/30 transition hover:scale-105 disabled:opacity-80 ${phase === "listening" ? "animate-pulse-ring" : ""}`}
        >
          <Mic className="size-9" />
        </button>
      </div>
      <p className="mt-4 min-h-5 text-sm font-medium text-primary">
        {phase === "listening" ? t("ai_listening") : phase === "transcribing" ? t("ss_thinking") : ""}
      </p>

      {transcript && (
        <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-accent p-4 text-left animate-in fade-in slide-in-from-bottom-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("ss_transcript")}</p>
          <p className="mt-1 text-sm text-accent-foreground">"{transcript}"</p>
        </div>
      )}
      {verdict && (
        <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-left animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            <p className="font-bold text-destructive">{t("ss_verdict")}</p>
          </div>
          <p className="mt-2 text-sm text-foreground">{verdict.verdict}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t("ss_confidence")}: <span className="font-semibold text-destructive">{verdict.confidence}%</span></p>
        </div>
      )}
    </div>
  );
}

const TRENDS = [
  { label: "Fake UPI Refund", count: "+38%", up: true },
  { label: "Courier / Customs Scam", count: "+22%", up: true },
  { label: "Fake Investment Tips", count: "+17%", up: true },
  { label: "Lottery / Prize Scam", count: "-9%", up: false },
];

function TrendsTab() {
  const t = useT();
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t("ss_trendsTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("ss_trendsSub")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {TRENDS.map((t2) => (
            <div key={t2.label} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 card-lift">
              <div>
                <p className="font-semibold">{t2.label}</p>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${t2.up ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                {t2.up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />} {t2.count}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 text-center">
        <MapPin className="mx-auto size-6 text-primary" />
        <svg viewBox="0 0 200 220" className="mx-auto mt-4 h-56 w-auto text-primary/30" aria-hidden>
          <path
            d="M100 10 C140 20 170 60 175 110 C180 160 150 200 100 210 C50 200 20 160 25 110 C30 60 60 20 100 10 Z"
            fill="currentColor"
          />
          {[[80, 60], [120, 90], [70, 130], [130, 150], [100, 180]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" className="fill-primary animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </svg>
        <p className="mt-3 text-sm text-muted-foreground">{t("ss_trendsFooter")}</p>
      </div>
    </div>
  );
}