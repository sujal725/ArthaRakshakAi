import { createFileRoute } from "@tanstack/react-router";
import { Activity, Shield, PiggyBank, Award, Trophy, Lock, Users, HeartHandshake, Globe, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RequireAuth } from "@/components/RequireAuth";
import { TwinHint } from "@/components/TwinHint";
import { GuardianJourney } from "@/components/GuardianJourney";
import { MoneyTimelineChart } from "@/components/MoneyTimelineChart";
import { Counter } from "@/components/Counter";
import { useT } from "@/i18n/translations";
import { useGuardianMemory } from "@/context/GuardianMemory";
import {
  generateGuardianImpact, generateAchievements, generateTwinEvolution,
  generateMoneyTimeline, generateSocialImpact,
} from "@/lib/impact";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Guardian Impact — ArthaRakshak" },
      { name: "description", content: "See how your Guardian protected your money, your family and your community." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ImpactPage />
    </RequireAuth>
  ),
});

const TONE: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  mint:    "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  amber:   "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  slate:   "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};
const ICONS = [Shield, PiggyBank, Award, Activity];

function ImpactPage() {
  const t = useT();
  const memory = useGuardianMemory();
  const cards = generateGuardianImpact(memory);
  const achievements = generateAchievements(memory);
  const evo = generateTwinEvolution(memory);
  const timeline = generateMoneyTimeline(memory);
  const social = generateSocialImpact(memory);

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Guardian Impact</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">A living record of what your Guardian has protected so far.</p>
        </header>

        <TwinHint context="impact" />

        {/* Impact cards */}
        <section aria-labelledby="impact-cards-h">
          <h2 id="impact-cards-h" className="sr-only">Impact summary</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c, i) => {
              const Icon = ICONS[i] ?? Shield;
              return (
                <article key={c.label} className={`rounded-2xl border border-border bg-card p-5`}>
                  <div className={`inline-flex size-9 items-center justify-center rounded-xl ${TONE[c.tone]}`}>
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground" aria-live="polite">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.sub}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Money Saved Timeline */}
        <section aria-labelledby="growth-h" className="mt-10 rounded-3xl border border-border bg-card p-6">
          <h2 id="growth-h" className="text-xl font-semibold text-foreground">{t("imp_growth")}</h2>
          <p className="text-sm text-muted-foreground">{t("imp_growth_sub")}</p>
          <div className="mt-6 text-emerald-600">
            <MoneyTimelineChart data={timeline} />
          </div>
        </section>

        {/* Guardian Journey */}
        <section aria-labelledby="journey-h" className="mt-10">
          <h2 id="journey-h" className="text-xl font-semibold text-foreground">Guardian Journey</h2>
          <div className="mt-4">
            <GuardianJourney />
          </div>
        </section>

        {/* Twin Evolution */}
        <section aria-labelledby="evo-h" className="mt-10 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-500 p-8 text-white">
          <h2 id="evo-h" className="text-2xl font-semibold">Financial Twin Evolution</h2>
          <p className="text-white/85">How your behaviour shaped your Twin.</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {evo.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <dt className="text-xs uppercase tracking-wide text-white/80">{s.label}</dt>
                <dd className="mt-2 flex items-baseline gap-2 text-lg font-semibold">
                  <span className="text-white/70 line-through decoration-white/40">{s.from}</span>
                  <span>→</span>
                  <span>{s.to}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Achievements */}
        <section aria-labelledby="ach-h" className="mt-10">
          <h2 id="ach-h" className="text-xl font-semibold text-foreground">Achievements</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {achievements.map((a) => (
              <article
                key={a.id}
                className={`rounded-2xl border p-4 text-center ${
                  a.unlocked
                    ? "border-primary/30 bg-primary/5"
                    : "border-dashed border-border bg-muted/40 opacity-70"
                }`}
                aria-label={`${a.title} — ${a.unlocked ? "Unlocked" : "Locked"}`}
              >
                <div className={`mx-auto grid size-12 place-items-center rounded-full ${a.unlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {a.unlocked ? <Trophy className="size-5" aria-hidden /> : <Lock className="size-5" aria-hidden />}
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide">
                  {a.unlocked ? <span className="text-emerald-600">✓ Unlocked</span> : <span className="text-muted-foreground">Locked</span>}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Social Impact */}
        <section aria-labelledby="social-h" className="mt-10">
          <h2 id="social-h" className="text-xl font-semibold text-foreground">{t("imp_social")}</h2>
          <p className="text-sm text-muted-foreground">{t("imp_social_sub")}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SocialCard icon={Users} label={t("imp_family")} value={social.familyProtected} sub="Family members protected" />
            <SocialCard icon={HeartHandshake} label={t("imp_trusted")} value={social.trustedCount} sub="Trusted members guided" />
            <SocialCard icon={Globe} label={t("imp_community")} value={social.communityInspired} sub="Guardians inspired" />
            <SocialCard icon={Shield} label={t("imp_moneyProtected")} valueText={social.totalProtected} sub="Estimated community protection" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function SocialCard({
  icon: Icon, label, value, valueText, sub,
}: { icon: typeof Users; label: string; value?: number; valueText?: string; sub: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
        <Icon className="size-4" aria-hidden />
      </div>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground" aria-live="polite">
        {valueText ?? (typeof value === "number" ? <Counter value={value} /> : null)}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </article>
  );
}