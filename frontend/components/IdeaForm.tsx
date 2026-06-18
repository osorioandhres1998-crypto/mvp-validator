import { useState } from "react";
import type { AnalyzeIdeaInput } from "../lib/types";

interface IdeaFormProps {
  onSubmit: (input: AnalyzeIdeaInput) => void;
  loading: boolean;
}

const EXAMPLE = {
  idea: "App de finanzas personales para freelancers que automatiza la categorización de gastos y la previsión de impuestos.",
  target_audience:
    "Freelancers y autónomos de 25-45 años en LATAM con ingresos variables.",
};

export default function IdeaForm({ onSubmit, loading }: IdeaFormProps) {
  const [idea, setIdea] = useState(EXAMPLE.idea);
  const [audience, setAudience] = useState(EXAMPLE.target_audience);
  const [nArchetypes, setNArchetypes] = useState(8);
  const [nIterations, setNIterations] = useState(5000);
  const [population, setPopulation] = useState(1000);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      idea,
      target_audience: audience,
      n_archetypes: nArchetypes,
      simulation: {
        n_iterations: nIterations,
        population_size: population,
        random_seed: 42,
      },
    });
  }

  return (
    <form className="panel form" onSubmit={submit}>
      <label>
        Idea de producto
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={3}
          minLength={10}
          required
        />
      </label>
      <label>
        Público objetivo
        <textarea
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          rows={2}
          minLength={3}
          required
        />
      </label>
      <div className="form-row">
        <label>
          Arquetipos: <strong>{nArchetypes}</strong>
          <input
            type="range"
            min={1}
            max={12}
            value={nArchetypes}
            onChange={(e) => setNArchetypes(Number(e.target.value))}
          />
        </label>
        <label>
          Iteraciones: <strong>{nIterations.toLocaleString()}</strong>
          <input
            type="range"
            min={500}
            max={10000}
            step={500}
            value={nIterations}
            onChange={(e) => setNIterations(Number(e.target.value))}
          />
        </label>
        <label>
          Población: <strong>{population.toLocaleString()}</strong>
          <input
            type="range"
            min={200}
            max={2000}
            step={100}
            value={population}
            onChange={(e) => setPopulation(Number(e.target.value))}
          />
        </label>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Simulando…" : "🚀 Validar idea"}
      </button>
    </form>
  );
}
