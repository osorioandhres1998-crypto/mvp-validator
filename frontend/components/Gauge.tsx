import type { MetricSummary } from "../lib/types";

interface GaugeProps {
  label: string;
  metric: MetricSummary;
  color: string;
}

/** Indicador circular (donut) con la media y el intervalo de confianza. */
export default function Gauge({ label, metric, color }: GaugeProps) {
  const pct = Math.max(0, Math.min(1, metric.mean));
  const size = 160;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div className="gauge">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill="var(--text)"
        >
          {(pct * 100).toFixed(1)}%
        </text>
        <text x="50%" y="64%" textAnchor="middle" fontSize="11" fill="var(--muted)">
          CI95 {(metric.ci_95_lower * 100).toFixed(1)}–
          {(metric.ci_95_upper * 100).toFixed(1)}%
        </text>
      </svg>
      <div className="gauge-label">{label}</div>
    </div>
  );
}
