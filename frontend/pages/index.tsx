import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Página placeholder del frontend de MVP Validator.
 *
 * Comprueba la conectividad con el backend FastAPI consultando /health.
 * Sustituir por la UI real (formulario de idea, dashboard de resultados) en
 * iteraciones posteriores.
 */
export default function Home() {
  const [health, setHealth] = useState<string>("comprobando...");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then((d) => setHealth(d.status ?? "desconocido"))
      .catch(() => setHealth("backend no disponible"));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: "3rem", maxWidth: 720 }}>
      <h1>🧪 MVP Validator</h1>
      <p>Placeholder del frontend (Next.js + TypeScript).</p>
      <p>
        Estado del backend (<code>{API_URL}/health</code>): <strong>{health}</strong>
      </p>
      <p>
        Documentación de la API: <a href={`${API_URL}/docs`}>{API_URL}/docs</a>
      </p>
    </main>
  );
}
