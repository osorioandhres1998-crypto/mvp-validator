"""Endpoints REST de la API de simulaciones."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import (
    CreateSimulationResponse,
    HealthResponse,
    SamplesPage,
    SimulationConfig,
    SimulationStatus,
    SimulationStatusResponse,
)
from app.store import store

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["meta"])
def health() -> HealthResponse:
    """Comprobación de salud del servicio."""
    return HealthResponse()


@router.post(
    "/simulations",
    response_model=CreateSimulationResponse,
    status_code=202,
    tags=["simulations"],
)
def create_simulation(config: SimulationConfig) -> CreateSimulationResponse:
    """Encola una nueva simulación y devuelve su identificador."""
    record = store.create(config.to_engine_config())
    return CreateSimulationResponse(simulation_id=record.id, status=record.status)


@router.get(
    "/simulations/{simulation_id}/status",
    response_model=SimulationStatusResponse,
    tags=["simulations"],
)
def get_status(simulation_id: str) -> SimulationStatusResponse:
    """Devuelve el estado de una simulación (queued/running/done/failed)."""
    record = store.get(simulation_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Simulación no encontrada.")
    return SimulationStatusResponse(
        simulation_id=record.id,
        status=record.status,
        created_at=record.created_at,
        started_at=record.started_at,
        finished_at=record.finished_at,
        error=record.error,
    )


@router.get("/simulations/{simulation_id}/results", tags=["simulations"])
def get_results(simulation_id: str) -> dict:
    """Devuelve los resultados agregados de una simulación finalizada."""
    record = store.get(simulation_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Simulación no encontrada.")
    if record.status == SimulationStatus.FAILED:
        raise HTTPException(status_code=500, detail=record.error or "Fallo desconocido.")
    if record.status != SimulationStatus.DONE or record.result is None:
        raise HTTPException(
            status_code=409,
            detail=f"La simulación aún no está lista (estado: {record.status.value}).",
        )
    return {"simulation_id": record.id, **record.result}


@router.get(
    "/simulations/{simulation_id}/samples",
    response_model=SamplesPage,
    tags=["simulations"],
)
def get_samples(
    simulation_id: str,
    limit: int = Query(100, ge=1, le=10000),
    page: int = Query(1, ge=1),
) -> SamplesPage:
    """Devuelve las muestras crudas por iteración, paginadas."""
    record = store.get(simulation_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Simulación no encontrada.")
    if record.status != SimulationStatus.DONE:
        raise HTTPException(
            status_code=409,
            detail=f"La simulación aún no está lista (estado: {record.status.value}).",
        )

    total = len(record.raw_samples)
    total_pages = (total + limit - 1) // limit if total else 0
    start = (page - 1) * limit
    end = start + limit
    items = record.raw_samples[start:end]
    return SamplesPage(
        simulation_id=record.id,
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
        items=items,
    )
