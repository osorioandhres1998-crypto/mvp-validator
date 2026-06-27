import { useState } from "react";
import type { AudienceResearchInput } from "../lib/types";

interface Props {
  onSubmit: (input: AudienceResearchInput) => void;
  loading: boolean;
}

const EXAMPLE = {
  product:
    "Plataforma que valida ideas de producto mediante audiencias simuladas por IA.",
  audience_hint: "Startups B2B y equipos de producto en LATAM",
};

export default function AudienceResearchForm({ onSubmit, loading }: Props) {
  const [product, setProduct] = useState(EXAMPLE.product);
  const [audienceHint, setAudienceHint] = useState(EXAMPLE.audience_hint);
  const [insightsRaw, setInsightsRaw] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      product,
      audience_hint: audienceHint || undefined,
      insights_raw: insightsRaw || undefined,
    });
  }

  return (
    <form className="panel form" onSubmit={submit}>
      <label>
        ¿Qué producto o servicio vendes?
        <textarea
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          rows={2}
          minLength={10}
          required
        />
      </label>
      <label>
        ¿A quién crees que te diriges? <span className="muted">(opcional)</span>
        <textarea
          value={audienceHint}
          onChange={(e) => setAudienceHint(e.target.value)}
          rows={2}
        />
      </label>
      <label>
        Insights reales: conversaciones, tickets, hilos…{" "}
        <span className="muted">(opcional, ancla la respuesta en datos)</span>
        <textarea
          value={insightsRaw}
          onChange={(e) => setInsightsRaw(e.target.value)}
          rows={4}
          placeholder="Pega aquí frases textuales de clientes, soporte o redes. Si lo dejas vacío, los segmentos se marcan como hipótesis."
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Investigando…" : "🔍 Modelar la demanda"}
      </button>
    </form>
  );
}
