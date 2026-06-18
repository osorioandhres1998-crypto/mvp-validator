import { useState } from "react";
import IdeaForm from "../components/IdeaForm";
import ResultsDashboard from "../components/ResultsDashboard";
import { analyzeIdea, waitForResults } from "../lib/api";
import type { AnalyzeIdeaInput, SimulationResults } from "../lib/types";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResults | null>(null);

  async function handleSubmit(input: AnalyzeIdeaInput) {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const { simulation_id } = await analyzeIdea(input);
      const data = await waitForResults(simulation_id);
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>🧪 MVP Validator</h1>
        <p>
          Valida tu idea con <strong>audiencias simuladas</strong>. La IA genera
          arquetipos de tu público objetivo y una simulación Monte Carlo estima
          aceptación, intención de compra, objeciones y características clave.
        </p>
      </header>

      <IdeaForm onSubmit={handleSubmit} loading={loading} />

      {loading && (
        <div className="status-banner">
          ⏳ Generando audiencias y ejecutando la simulación…
        </div>
      )}
      {error && <div className="status-banner error">⚠️ {error}</div>}

      {results && <ResultsDashboard data={results} />}

      <footer className="footer">
        Backend: <code>{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}</code>
      </footer>
    </main>
  );
}
