import { useState } from "react";
import AudienceResearchForm from "../components/AudienceResearchForm";
import AudienceTable from "../components/AudienceTable";
import { researchAudience } from "../lib/api";
import type { AudienceResearchInput, AudienceResearchResponse } from "../lib/types";

export default function AudienceResearchPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AudienceResearchResponse | null>(null);

  async function handleSubmit(input: AudienceResearchInput) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      setData(await researchAudience(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>🧭 Audience Research</h1>
        <p>
          Modela la <strong>demanda</strong> con el framework{" "}
          <strong>Jobs-to-be-Done</strong>: descubre en qué situaciones tu
          audiencia busca una solución como la tuya, qué trabajo funcional,
          emocional y social espera resolver, y qué insights accionables guían su
          decisión. Si aportas insights reales, la respuesta se ancla en ellos.
        </p>
      </header>

      <AudienceResearchForm onSubmit={handleSubmit} loading={loading} />

      {loading && (
        <div className="status-banner">
          ⏳ Identificando segmentos y modelando sus Jobs-to-be-Done…
        </div>
      )}
      {error && <div className="status-banner error">⚠️ {error}</div>}

      {data && <AudienceTable data={data} />}
    </main>
  );
}
