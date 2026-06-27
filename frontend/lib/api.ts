// Cliente ligero de la API del backend MVP Validator.

import type {
  AnalyzeIdeaInput,
  AudienceResearchInput,
  AudienceResearchResponse,
  SimulationResults,
  StatusResponse,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = JSON.stringify(body.detail);
    } catch {
      /* ignora cuerpos no-JSON */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export async function analyzeIdea(
  input: AnalyzeIdeaInput
): Promise<{ simulation_id: string; status: string }> {
  const res = await fetch(`${API_URL}/ideas/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res);
}

export async function researchAudience(
  input: AudienceResearchInput
): Promise<AudienceResearchResponse> {
  const res = await fetch(`${API_URL}/audience-research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res);
}

export async function getStatus(id: string): Promise<StatusResponse> {
  return handle(await fetch(`${API_URL}/simulations/${id}/status`));
}

export async function getResults(id: string): Promise<SimulationResults> {
  return handle(await fetch(`${API_URL}/simulations/${id}/results`));
}

/** Sondea el estado hasta que la simulación termina (o falla / agota tiempo). */
export async function waitForResults(
  id: string,
  { intervalMs = 1000, timeoutMs = 120000 } = {}
): Promise<SimulationResults> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { status, error } = await getStatus(id);
    if (status === "done") return getResults(id);
    if (status === "failed") throw new Error(error ?? "La simulación falló.");
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Tiempo de espera agotado.");
}
