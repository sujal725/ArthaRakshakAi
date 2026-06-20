import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useApp, type Language } from "@/context/AppContext";
import { LANGUAGES, useT } from "@/i18n/translations";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Guardian Account — ArthaRakshak" },
      { name: "description", content: "Create your free ArthaRakshak Guardian and get AI protection in your language." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const t = useT();
  const nav = useNavigate();
  const { isAuthenticated, hasCompletedOnboarding, signUp, language: ctxLang } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [lang, setLang] = useState<Language>(ctxLang);
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to={hasCompletedOnboarding ? "/dashboard" : "/onboarding/language"} />;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("Enter your full name");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr("Enter a valid email");
    if (pwd.length < 6) return setErr("Password must be at least 6 characters");
    if (pwd !== confirm) return setErr("Passwords don't match");
    if (!agree) return setErr("Please accept the Privacy Policy");
    setErr(null);
    signUp({ name: name.trim(), email, language: lang });
    toast.success("Guardian account created");
    nav({ to: "/onboarding/language" });
  }

  return (
    <AuthShell>
      <h1 className="text-3xl font-bold tracking-tight">{t("auth_signupTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("auth_signupSub")}</p>
      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">{t("auth_fullName")}</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth_email")}</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pwd">{t("auth_password")}</Label>
            <Input id="pwd" type="password" autoComplete="new-password" required value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">{t("auth_confirmPassword")}</Label>
            <Input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lang">{t("auth_preferredLanguage")}</Label>
          <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
            <SelectTrigger id="lang" className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.native} <span className="text-muted-foreground">— {l.english}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
          {t("auth_agree")}
        </label>
        {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
        <Button type="submit" size="lg" className="w-full rounded-full bg-gradient-emerald text-base font-semibold">
          {t("auth_createAccount")} <ArrowRight className="ml-1 size-4" />
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("auth_haveAccount")}{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          {t("auth_signInLink")}
        </Link>
      </p>
    </AuthShell>
  );
}