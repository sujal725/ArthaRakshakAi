import type { MonthlySeriesPoint } from "@/lib/futureSelf";

const W = 700;
const H = 320;
const PAD_L = 64;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 36;

export function LoanVsSipChart({ series }: { series: MonthlySeriesPoint[] }) {
  const maxY = Math.max(...series.map((p) => Math.max(p.loanInterestPaid, p.sipValueGrown)), 1);
  const stepX = (W - PAD_L - PAD_R) / Math.max(1, series.length - 1);
  const yAt = (v: number) => PAD_T + (1 - v / maxY) * (H - PAD_T - PAD_B);
  const xAt = (i: number) => PAD_L + i * stepX;

  const interestPath = series.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.loanInterestPaid)}`).join(" ");
  const sipPath = series.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.sipValueGrown)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    v: Math.round(maxY * t),
    y: PAD_T + (1 - t) * (H - PAD_T - PAD_B),
  }));

  const labelEvery = Math.max(1, Math.round(series.length / 16));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-72 w-full"
      role="img"
      aria-label="Cumulative interest paid on the loan versus value grown via SIP, month by month"
    >
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD_L} x2={W - PAD_R} y1={t.y} y2={t.y} stroke="var(--color-border)" strokeDasharray="3 4" />
          <text x={PAD_L - 10} y={t.y + 4} textAnchor="end" fontSize="11" fill="var(--color-muted-foreground)">
            {t.v}
          </text>
        </g>
      ))}
      <path d={interestPath} fill="none" stroke="var(--color-destructive)" strokeWidth="2.5" strokeLinecap="round" />
      <path d={sipPath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
      {series.map((p, i) =>
        i % labelEvery === 0 || i === series.length - 1 ? (
          <text key={i} x={xAt(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)">
            {p.month}
          </text>
        ) : null,
      )}
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="11" fill="var(--color-muted-foreground)">
        Month
      </text>
    </svg>
  );
}