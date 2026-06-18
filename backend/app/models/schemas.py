"""Modelos pydantic (v2) para validar configuración y respuestas de la API."""

from __future__ import annotations

from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


class SimulationStatus(str, Enum):
    """Estados posibles del ciclo de vida de una simulación."""

    QUEUED = "queued"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"


class NoiseDistribution(BaseModel):
    """Distribución de ruido aplicada al modelo de adopción."""

    type: Literal["normal", "uniform", "lognormal", "gumbel"] = "normal"
    params: dict[str, float] = Field(default_factory=lambda: {"loc": 0.0, "scale": 1.0})


class SimulationConfig(BaseModel):
    """Configuración de entrada para ``run_simulation``.

    Los valores por defecto coinciden con el payload sugerido en la
    documentación: ``n_iterations=10000``, ``population_size=1000``,
    ``random_seed=42``.
    """

    n_iterations: int = Field(10000, ge=1, le=1_000_000)
    population_size: int = Field(1000, ge=1, le=1_000_000)
    adoption_prob_base: float = Field(0.2, gt=0.0, lt=1.0)
    feature_weights: dict[str, float] = Field(
        default_factory=lambda: {
            "usabilidad": 1.0,
            "diseno": 0.7,
            "innovacion": 0.9,
            "soporte": 0.5,
            "confiabilidad": 0.8,
        }
    )
    price_sensitivity: float = Field(1.0, ge=0.0)
    noise_distribution: NoiseDistribution = Field(default_factory=NoiseDistribution)
    random_seed: int | None = Field(42)
    include_raw_samples: bool = True
    n_jobs: int | None = Field(None)

    @field_validator("feature_weights")
    @classmethod
    def _non_empty_weights(cls, value: dict[str, float]) -> dict[str, float]:
        if not value:
            raise ValueError("feature_weights no puede estar vacío.")
        return value

    def to_engine_config(self) -> dict[str, Any]:
        """Serializa a un dict plano consumible por ``run_simulation``."""
        return self.model_dump()


class MetricSummary(BaseModel):
    """Resumen de una métrica con intervalo de confianza al 95 %."""

    mean: float
    std: float
    sem: float
    ci_95_lower: float
    ci_95_upper: float


class ObjectionItem(BaseModel):
    objection: str
    count: int
    frequency: float


class FeatureImportanceItem(BaseModel):
    feature: str
    sensitivity: float
    importance: float


class CreateSimulationResponse(BaseModel):
    simulation_id: str
    status: SimulationStatus


class SimulationStatusResponse(BaseModel):
    simulation_id: str
    status: SimulationStatus
    created_at: float
    started_at: float | None = None
    finished_at: float | None = None
    error: str | None = None


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "mvp-validator-backend"
    version: str = "0.1.0"


class SamplesPage(BaseModel):
    simulation_id: str
    page: int
    limit: int
    total: int
    total_pages: int
    items: list[dict[str, Any]]
