import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/translations";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — ArthaRakshak" },
      { name: "description", content: "Reset your ArthaRakshak Guardian account password." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AuthShell>
      <h1 className="text-3xl font-bold tracking-tight">{t("auth_forgotTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("auth_forgotSub")}</p>
      {sent ? (
        <div className="mt-8 rounded-2xl border border-primary/30 bg-accent p-5 text-sm text-accent-foreground">
          <CheckCircle2 className="mb-2 size-6 text-primary" />
          {t("auth_resetSent")}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth_email")}</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full bg-gradient-emerald font-semibold">
            {t("auth_sendReset")}
          </Button>
        </form>
      )}
      <p className="mt-8 text-center text-sm">
        <Link to="/login" className="font-semibold text-primary hover:underline">
          ← {t("auth_backToLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}