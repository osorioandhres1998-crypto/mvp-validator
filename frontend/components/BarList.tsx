interface BarItem {
  label: string;
  value: number; // 0–1
  caption?: string;
}

interface BarListProps {
  items: BarItem[];
  color: string;
}

/** Lista de barras horizontales normalizadas al máximo del conjunto. */
export default function BarList({ items, color }: BarListProps) {
  const max = Math.max(...items.map((i) => i.value), 1e-9);
  return (
    <div className="barlist">
      {items.map((item) => (
        <div className="bar-row" key={item.label}>
          <div className="bar-head">
            <span className="bar-label">{item.label}</span>
            <span className="bar-value">{(item.value * 100).toFixed(1)}%</span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(item.value / max) * 100}%`, background: color }}
            />
          </div>
          {item.caption && <div className="bar-caption">{item.caption}</div>}
        </div>
      ))}
    </div>
  );
}
