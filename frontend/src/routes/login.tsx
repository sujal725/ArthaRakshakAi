import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/context/AppContext";
import { useT } from "@/i18n/translations";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — ArthaRakshak" },
      { name: "description", content: "Sign in to your ArthaRakshak Financial Guardian." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const t = useT();
  const nav = useNavigate();
  const { isAuthenticated, hasCompletedOnboarding, signIn } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to={hasCompletedOnboarding ? "/dashboard" : "/onboarding/language"} />;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("Enter a valid email");
    if (password.length < 4) return setErr("Password is too short");
    setErr(null);
    signIn(email);
    toast.success("Welcome back, Guardian");
    nav({ to: hasCompletedOnboarding ? "/dashboard" : "/onboarding/language" });
  }

  return (
    <AuthShell>
      <h1 className="text-3xl font-bold tracking-tight">{t("auth_welcomeBack")}</h1>
      <p className="mt-2 text-muted-foreground">{t("auth_loginSub")}</p>
      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth_email")}</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth_password")}</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
            {t("auth_remember")}
          </label>
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            {t("auth_forgot")}
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full rounded-full bg-gradient-emerald text-base font-semibold">
          {t("auth_login")} <ArrowRight className="ml-1 size-4" />
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("auth_newHere")}{" "}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          {t("auth_createAccount")}
        </Link>
      </p>
    </AuthShell>
  );
}