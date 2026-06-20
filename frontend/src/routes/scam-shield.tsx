import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
import type { ScamVerdict } from "@/lib/scam";
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
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {verdict.reasons.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
                    <span>
                      {r.explanation}
                      {r.evidence && (
                        <span className="mt-1 block rounded-md bg-warning/10 px-2 py-1 text-xs italic text-warning-foreground">
                          "{r.evidence}"
                        </span>
                      )}
                    </span>
                  </li>
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
      {verdict.extracted_text && (
        <details className="mt-4 rounded-2xl border border-border bg-muted/30 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-muted-foreground">
            View extracted text from screenshot
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-foreground">{verdict.extracted_text}</p>
        </details>
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
async function callScamImageAPI(file: File) {
  const deviceId = localStorage.getItem("artharakshak_device_id") ?? "";
  const formData = new FormData();
  formData.append("device_id", deviceId);
  formData.append("file", file);
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/scam/analyze-image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Image analysis failed");
  return res.json();
}

function ScreenshotTab() {
  const t = useT();
  const memory = useGuardianMemory();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<ScamVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    setFile(f); setVerdict(null); setError(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  async function run() {
    if (!file) return;
    setLoading(true); setVerdict(null); setError(null);
    try {
      const v = await callScamImageAPI(file);
      if (v.score === null || v.score === undefined) {
        setError("Could not read any text from this image clearly. Try a clearer screenshot or paste the text instead.");
        setLoading(false);
        return;
      }
      setVerdict(v);
      memory.setScamRiskScore(v.score);
      memory.logAction({
        module: "scam",
        action: v.level === "high" ? "Avoided high-risk scam screenshot" : "Analyzed a suspicious screenshot",
        riskImpact: Math.round(v.score / 5),
      });
    } catch {
      setError("Could not reach the Guardian. Please try again.");
    }
    setLoading(false);
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
          </div>
          <div>
            <Button onClick={run} disabled={loading || !file} size="lg" className="w-full rounded-full bg-gradient-emerald">
              {loading ? t("ss_thinking") : t("ss_analyzeShot")}
            </Button>
            {loading && <ThinkingPulse label={t("ss_thinking")} />}
            {error && (
              <div className="mt-4 rounded-2xl border border-warning/40 bg-warning/5 p-4 text-sm text-warning-foreground">
                {error}
              </div>
            )}
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

interface CommunityReportsSummary {
  total_messages_checked: number;
  total_flagged: number;
  top_patterns: { pattern: string; count: number }[];
  note: string;
}

interface NationalFraudReference {
  source: string;
  source_url: string;
  last_updated: string;
  categories: { category: string; trend: "rising" | "declining"; note: string }[];
}

function TrendsTab() {
  const t = useT();
  const [community, setCommunity] = useState<CommunityReportsSummary | null>(null);
  const [reference, setReference] = useState<NationalFraudReference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL;
    Promise.all([
      fetch(`${base}/api/trends/community-reports`).then((r) => r.json()),
      fetch(`${base}/api/trends/national-fraud-reference`).then((r) => r.json()),
    ])
      .then(([communityData, referenceData]) => {
        setCommunity(communityData);
        setReference(referenceData);
      })
      .catch(() => {
        setCommunity(null);
        setReference(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Real, live community intelligence — built from this app's actual usage */}
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Live Community Intelligence</p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Real data from ArthaRakshak Guardians who have checked messages with Scam Shield.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading community data…</p>
        ) : community && community.total_messages_checked > 0 ? (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-accent/30 p-4">
                <p className="text-xs text-muted-foreground">Messages checked by Guardians</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{community.total_messages_checked}</p>
              </div>
              <div className="rounded-2xl border border-border bg-destructive/5 p-4">
                <p className="text-xs text-muted-foreground">Flagged as risky</p>
                <p className="mt-1 text-2xl font-bold text-destructive">{community.total_flagged}</p>
              </div>
            </div>
            {community.top_patterns.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold">Most common patterns reported by Guardians</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {community.top_patterns.map((p) => (
                    <div key={p.pattern} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                      <span className="text-sm">{p.pattern}</span>
                      <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-bold text-destructive">
                        {p.count} {p.count === 1 ? "report" : "reports"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
            No community reports yet — be the first Guardian to check a message in Scam Shield.
          </p>
        )}
      </div>

      {/* Real published national reference data — clearly sourced, not fabricated */}
      {reference && (
        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">National Fraud Trends</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Published reference data from{" "}
            <a href={reference.source_url} target="_blank" rel="noopener noreferrer" className="underline">
              {reference.source}
            </a>{" "}
            ({reference.last_updated})
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {reference.categories.map((c) => (
              <div key={c.category} className="rounded-2xl border border-border bg-card p-4 card-lift">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{c.category}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${c.trend === "rising" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                    }`}>
                    {c.trend === "rising" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {c.trend}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}