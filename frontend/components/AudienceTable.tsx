import type { AudienceResearchResponse, AudienceSegment } from "../lib/types";

// Cada fila de la tabla = una clave del segmento (etiqueta legible).
const ROWS: { key: keyof AudienceSegment; label: string }[] = [
  { key: "trigger_situation", label: "Situación gatillo" },
  { key: "trigger_event", label: "Evento detonante" },
  { key: "best_timing", label: "Mejor momento" },
  { key: "job_functional", label: "Job funcional" },
  { key: "job_emotional", label: "Job emocional" },
  { key: "job_social", label: "Job social" },
  { key: "sales_questions", label: "Preguntas de venta" },
  { key: "support_frustrations", label: "Fricciones de soporte" },
  { key: "social_listening", label: "Social listening" },
  { key: "main_pain", label: "Dolor principal" },
  { key: "main_desire", label: "Deseo principal" },
  { key: "evidence", label: "Evidencia" },
];

export default function AudienceTable({
  data,
}: {
  data: AudienceResearchResponse;
}) {
  return (
    <div className="dashboard">
      <section className="panel">
        <h3>
          🧭 Demanda modelada (Jobs-to-be-Done){" "}
          <span className="source-tag">fuente: {data.source}</span>
        </h3>
        <p className="summary">{data.summary}</p>
      </section>

      <section className="panel table-panel">
        <div className="table-scroll">
          <table className="audience-table">
            <thead>
              <tr>
                <th className="row-head">Segmento →</th>
                {data.segments.map((s) => (
                  <th key={s.segment}>
                    {s.segment}
                    {s.is_hypothesis && <span className="chip-hyp">hipótesis</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <td className="row-head">{row.label}</td>
                  {data.segments.map((s) => (
                    <td key={s.segment + row.key}>{String(s[row.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
