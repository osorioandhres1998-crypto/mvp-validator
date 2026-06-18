import type { SimulationResults } from "../lib/types";
import ArchetypeCards from "./ArchetypeCards";
import BarList from "./BarList";
import Gauge from "./Gauge";

const OBJECTION_LABELS: Record<string, string> = {
  precio_alto: "Precio alto",
  valor_percibido_bajo: "Valor percibido bajo",
  no_lo_necesita: "No lo necesita",
};

export default function ResultsDashboard({ data }: { data: SimulationResults }) {
  const objections = data.top_objections.map((o) => ({
    label: OBJECTION_LABELS[o.objection] ?? o.objection,
    value: o.frequency,
  }));
  const features = data.feature_importance.map((f) => ({
    label: f.feature,
    value: f.importance,
    caption: `sensibilidad ${f.sensitivity.toFixed(3)}`,
  }));

  return (
    <div className="dashboard">
      <section className="panel gauges">
        <Gauge
          label="Aceptación de mercado"
          metric={data.acceptance_rate}
          color="var(--accent)"
        />
        <Gauge
          label="Intención de compra"
          metric={data.purchase_intent_probability}
          color="var(--accent-2)"
        />
      </section>

      {data.insights && (
        <section className="panel">
          <h3>🧠 Resumen accionable</h3>
          <p className="summary">{data.insights.summary}</p>
          <ul className="reco-list">
            {data.insights.recommendations.map((r) => (
              <li key={r.objection}>
                <strong>{OBJECTION_LABELS[r.objection] ?? r.objection}</strong>{" "}
                <span className="muted">({(r.frequency * 100).toFixed(0)}%)</span>
                <div>{r.recommendation}</div>
              </li>
            ))}
          </ul>
          <span className="source-tag">fuente: {data.insights.source}</span>
        </section>
      )}

      <div className="grid-2">
        <section className="panel">
          <h3>🚧 Principales objeciones</h3>
          <BarList items={objections} color="var(--warn)" />
        </section>
        <section className="panel">
          <h3>⭐ Características más valoradas</h3>
          <BarList items={features} color="var(--ok)" />
        </section>
      </div>

      {data.archetypes && data.archetypes.length > 0 && (
        <section className="panel">
          <h3>
            👥 Arquetipos de audiencia{" "}
            <span className="source-tag">fuente: {data.audience_source}</span>
          </h3>
          <ArchetypeCards archetypes={data.archetypes} />
        </section>
      )}

      <section className="panel meta">
        <span>
          {data.execution_metrics.n_iterations.toLocaleString()} iteraciones ×{" "}
          {data.execution_metrics.population_size.toLocaleString()} perfiles
        </span>
        <span>{data.execution_metrics.elapsed_seconds.toFixed(2)} s</span>
        <span>seed {String(data.execution_metrics.random_seed)}</span>
      </section>
    </div>
  );
}
