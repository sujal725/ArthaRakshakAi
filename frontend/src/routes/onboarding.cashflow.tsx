import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, TrendingDown, CreditCard, ShieldCheck, Users } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useT } from "@/i18n/translations";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { StepNav } from "@/components/onboarding/StepNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/onboarding/cashflow")({
    head: () => ({ meta: [{ title: "Income Details — ArthaRakshak" }] }),
    component: CashflowStep,
});

function CashflowStep() {
    const t = useT();
    const { incomeType } = useApp();
    const [monthlyIncome, setMonthlyIncome] = useState<number | "">("");
    const [incomeFrequency, setIncomeFrequency] = useState<"monthly" | "weekly" | "irregular" | "seasonal">(
        incomeType === "gig" ? "irregular" : incomeType === "farmer" ? "seasonal" : "monthly"
    );
    const [expenses, setExpenses] = useState<number | "">("");
    const [emiTotal, setEmiTotal] = useState<number | "">("");
    const [hasEmergencyFund, setHasEmergencyFund] = useState(false);
    const [dependents, setDependents] = useState<number | "">("");

    const canNext = monthlyIncome !== "" && Number(monthlyIncome) > 0;

    const FREQ_OPTIONS: { id: typeof incomeFrequency; label: string }[] = [
        { id: "monthly", label: "Fixed monthly" },
        { id: "weekly", label: "Weekly" },
        { id: "irregular", label: "Irregular / gig-based" },
        { id: "seasonal", label: "Seasonal (e.g. farming)" },
    ];

    return (
        <>
            <StepHeader
                title="Tell us about your money"
                help="This helps your Guardian predict cash-flow risk and match real schemes — never shared without your permission."
            />

            <div className="space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Wallet className="size-5 text-primary" aria-hidden />
                        <p className="font-semibold">Monthly income</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="income">Approximate monthly income (₹)</Label>
                            <Input
                                id="income" type="number" inputMode="decimal" placeholder="e.g. 25000"
                                value={monthlyIncome}
                                onChange={(e) => setMonthlyIncome(e.target.value === "" ? "" : Number(e.target.value))}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>How regular is it?</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {FREQ_OPTIONS.map((f) => (
                                    <button
                                        key={f.id} type="button" onClick={() => setIncomeFrequency(f.id)}
                                        className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${incomeFrequency === f.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <TrendingDown className="size-5 text-primary" aria-hidden />
                        <p className="font-semibold">Monthly outgoings</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="expenses">Estimated monthly expenses (₹)</Label>
                            <Input
                                id="expenses" type="number" inputMode="decimal" placeholder="e.g. 15000"
                                value={expenses}
                                onChange={(e) => setExpenses(e.target.value === "" ? "" : Number(e.target.value))}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emi">Existing EMI / loan payments (₹/month)</Label>
                            <Input
                                id="emi" type="number" inputMode="decimal" placeholder="e.g. 0"
                                value={emiTotal}
                                onChange={(e) => setEmiTotal(e.target.value === "" ? "" : Number(e.target.value))}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-primary" aria-hidden />
                            <div>
                                <p className="font-semibold">Do you have an emergency fund?</p>
                                <p className="text-xs text-muted-foreground">Savings you could use within a week if needed</p>
                            </div>
                        </div>
                        <Switch checked={hasEmergencyFund} onCheckedChange={setHasEmergencyFund} aria-label="Has emergency fund" />
                    </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="mb-3 flex items-center gap-2">
                        <Users className="size-5 text-primary" aria-hidden />
                        <Label htmlFor="dependents">Number of people financially dependent on you</Label>
                    </div>
                    <Input
                        id="dependents" type="number" inputMode="numeric" placeholder="e.g. 2"
                        value={dependents}
                        onChange={(e) => setDependents(e.target.value === "" ? "" : Number(e.target.value))}
                        className="max-w-xs rounded-xl"
                    />
                </div>
            </div>

            <CashflowStepNav
                canNext={canNext}
                payload={{
                    monthlyIncome: monthlyIncome === "" ? null : monthlyIncome,
                    incomeFrequency,
                    expenses: expenses === "" ? null : expenses,
                    emiTotal: emiTotal === "" ? null : emiTotal,
                    hasEmergencyFund,
                    dependents: dependents === "" ? null : dependents,
                }}
            />
        </>
    );
}

function CashflowStepNav({ canNext, payload }: { canNext: boolean; payload: Record<string, unknown> }) {
    const nav = useNavigate();

    async function handleNext() {
        const deviceId = localStorage.getItem("artharakshak_device_id");
        if (deviceId) {
            try {
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/onboarding`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        device_id: deviceId,
                        monthly_income: payload.monthlyIncome,
                        income_frequency: payload.incomeFrequency,
                        monthly_expenses_estimate: payload.expenses,
                        existing_emi_total: payload.emiTotal,
                        has_emergency_fund: payload.hasEmergencyFund,
                        dependents_count: payload.dependents,
                    }),
                });
            } catch {
                // Non-blocking — localStorage onboarding flow continues even if backend sync fails
            }
        }
        nav({ to: "/onboarding/concern" });
    }

    return (
        <div className="mt-10 flex items-center justify-between">
            <button
                type="button"
                onClick={() => nav({ to: "/onboarding/income" })}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
                ← Back
            </button>
            <button
                type="button"
                disabled={!canNext}
                onClick={handleNext}
                className="rounded-full bg-gradient-emerald px-7 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
                Continue →
            </button>
        </div>
    );
}