import type { MoneyPoint } from "@/lib/impact";

const W = 600;
const H = 220;
const PAD_L = 48;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 36;

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function MoneyTimelineChart({ data }: { data: MoneyPoint[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  const stepX = (W - PAD_L - PAD_R) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => ({
    x: PAD_L + i * stepX,
    y: PAD_T + (1 - d.amount / max) * (H - PAD_T - PAD_B),
  }));
  const linePath = buildSmoothPath(points);
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x} ${H - PAD_B}` +
    ` L ${points[0].x} ${H - PAD_B} Z`;

  const yTicks = [0, 0.5, 1].map((t) => ({
    v: Math.round((max * t) / 1000),
    y: PAD_T + (1 - t) * (H - PAD_T - PAD_B),
  }));

  const summary = `Money saved grew from ₹${data[0].amount.toLocaleString()} in ${data[0].month} to ₹${data[data.length - 1].amount.toLocaleString()} in ${data[data.length - 1].month}.`;

  return (
    <figure className="w-full">
      <svg
        role="img"
        aria-label={summary}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="moneyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.14 160)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.62 0.14 160)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={W - PAD_R} y1={t.y} y2={t.y} stroke="currentColor" strokeOpacity="0.08" />
            <text x={PAD_L - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.6">
              ₹{t.v}k
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#moneyFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="oklch(0.62 0.14 160)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-dash"
        />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="oklch(0.62 0.14 160)" />
            <text x={p.x} y={H - PAD_B + 20} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">
              {data[i].month}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="sr-only">
        <table>
          <thead><tr><th>Month</th><th>Amount</th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month}><td>{d.month}</td><td>₹{d.amount.toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}