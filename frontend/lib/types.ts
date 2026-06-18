// Tipos compartidos que reflejan las respuestas del backend FastAPI.

export interface MetricSummary {
  mean: number;
  std: number;
  sem: number;
  ci_95_lower: number;
  ci_95_upper: number;
}

export interface Objection {
  objection: string;
  count: number;
  frequency: number;
}

export interface FeatureImportance {
  feature: string;
  sensitivity: number;
  importance: number;
}

export interface Archetype {
  name: string;
  description?: string;
  segment_share: number;
  price_sensitivity: number;
  adoption_prob_base: number;
  feature_weights: Record<string, number>;
  key_drivers?: string[];
}

export interface Recommendation {
  objection: string;
  frequency: number;
  recommendation: string;
}

export interface Insights {
  summary: string;
  recommendations: Recommendation[];
  source: string;
}

export interface ExecutionMetrics {
  n_iterations: number;
  population_size: number;
  n_jobs: number;
  random_seed: number | null;
  elapsed_seconds: number;
  iterations_per_second: number | null;
}

export interface SimulationResults {
  simulation_id: string;
  acceptance_rate: MetricSummary;
  purchase_intent_probability: MetricSummary;
  top_objections: Objection[];
  feature_importance: FeatureImportance[];
  execution_metrics: ExecutionMetrics;
  // Presentes solo cuando provienen de POST /ideas/analyze
  idea?: string;
  target_audience?: string;
  archetypes?: Archetype[];
  audience_source?: string;
  insights?: Insights | null;
}

export type Status = "queued" | "running" | "done" | "failed";

export interface StatusResponse {
  simulation_id: string;
  status: Status;
  error?: string | null;
}

export interface AnalyzeIdeaInput {
  idea: string;
  target_audience: string;
  n_archetypes: number;
  simulation: {
    n_iterations: number;
    population_size: number;
    random_seed: number;
  };
}
