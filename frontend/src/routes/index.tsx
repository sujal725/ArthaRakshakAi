import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck, TrendingUp, Mic, Radar, GitBranch, CalendarDays, UserCircle2,
  ArrowRight, Play, Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { VoiceDemoDialog } from "@/components/VoiceDemoDialog";
import { Counter } from "@/components/Counter";
import guardianHero from "@/assets/guardian-hero.png";
import decisionRadarImg from "@/assets/decision-radar.png";
import futureSelfImg from "@/assets/future-self.png";
import calendarImg from "@/assets/financial-calendar.png";
import personaImg from "@/assets/ai-persona.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ArthaRakshak — Your Proactive Financial Guardian AI" },
      { name: "description", content: "India's first proactive financial guardian. AI that protects you before scams, risky loans and cash flow crises happen." },
      { property: "og:title", content: "ArthaRakshak — Your Proactive Financial Guardian AI" },
      { property: "og:description", content: "AI that protects you before scams, risky loans and cash flow crises happen." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [voiceOpen, setVoiceOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero onVoice={() => setVoiceOpen(true)} />
        <FeatureRow />
        <WhySection />
        <ImpactSection />
      </main>
      <Footer />
      <VoiceDemoDialog open={voiceOpen} onOpenChange={setVoiceOpen} />
    </div>
  );
}

function Hero({ onVoice }: { onVoice: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-secondary/30 blur-3xl" />
        <div className="absolute right-10 top-40 size-72 rounded-full bg-primary/15 blur-3xl" />
      </div>
      <div className="mx-auto grid max-w-[1280px] gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:items-center lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-sm text-accent-foreground">
            <Sparkles className="size-3.5 text-primary" />
            AI is watching out for you — 24/7
          </div>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Protect Your <span className="text-gradient-emerald">Financial Future</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            India&apos;s first proactive financial guardian that protects users before scams,
            risky loans and financial crises happen.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-gradient-emerald px-7 text-base font-semibold shadow-lg shadow-primary/25">
              <Link to="/signup">
                Start Your Journey <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full px-6 text-base">
              <Play className="mr-1 size-4" /> Watch Demo
            </Button>
            <Button size="lg" variant="outline" onClick={onVoice} className="rounded-full border-primary/30 px-6 text-base text-primary hover:bg-accent">
              <Mic className="mr-1 size-4" /> Try Voice Demo
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-accent to-secondary/30" />
          <img
            src={guardianHero}
            alt="AI Guardian protecting people from scams, risky loans and financial stress"
            width={1024}
            height={1024}
            className="mx-auto w-full max-w-md animate-float-soft drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: ShieldCheck, title: "Scam Protection", text: "Detect scams instantly from messages, screenshots and links." },
  { icon: TrendingUp, title: "Cash Flow Intelligence", text: "Predict income shortfalls before they happen." },
  { icon: Mic, title: "Voice Accessibility", text: "Speak naturally in your language. Zero typing required." },
];

function FeatureRow() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-12">
      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card-lift rounded-3xl border border-border bg-card p-7">
            <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-accent text-primary">
              <Icon className="size-6" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const WHY = [
  { icon: Radar, img: decisionRadarImg, title: "Decision Radar", text: "AI predicts financial risks before they happen." },
  { icon: GitBranch, img: futureSelfImg, title: "Future Self Simulator", text: "See how today's decisions affect your future." },
  { icon: CalendarDays, img: calendarImg, title: "Financial Calendar", text: "Track EMI, salary, SIPs and important dates." },
  { icon: UserCircle2, img: personaImg, title: "AI Financial Persona", text: "Your money personality, decoded. AI tailors every alert and nudge to how you actually spend, save and decide." },
];

function WhySection() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Why ArthaRakshak</h2>
        <p className="mt-4 text-muted-foreground">A guardian built around how Indian families really make money decisions.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {WHY.map(({ icon: Icon, img, title, text }) => (
          <article key={title} className="card-lift flex items-start gap-6 rounded-3xl border border-border bg-card p-7">
            <div className="relative shrink-0">
              <div className="size-28 rounded-3xl bg-accent p-3">
                <img src={img} alt="" width={112} height={112} loading="lazy" className="size-full object-contain" />
              </div>
              <div className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <Icon className="size-4" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const STATS = [
  { value: 500, suffix: "+", label: "Government Schemes" },
  { value: 12, suffix: "+", label: "Indian Languages" },
  { value: 95, suffix: "%", label: "Scam Detection Accuracy" },
  { value: 24, suffix: "/7", label: "AI Protection" },
];

function ImpactSection() {
  return (
    <section className="bg-accent/40">
      <div className="mx-auto max-w-[1280px] px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Real protection. Real numbers.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-3xl border border-border bg-card p-8 text-center">
              <div className="text-5xl font-bold text-gradient-emerald">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
