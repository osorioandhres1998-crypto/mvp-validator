"""Hooks para la futura integración con un LLM (Claude).

En el MVP actual los perfiles de la audiencia y sus objeciones se generan de
forma puramente estadística (ver ``app.sim.monte_carlo``). Este módulo define
la *interfaz* que usará la siguiente iteración para:

1. Generar perfiles virtuales realistas a partir de la descripción de la idea
   y del público objetivo (demografía, psicografía, comportamiento).
2. Convertir las objeciones estadísticas en respuestas textuales explicables.

Mantener esta interfaz estable permite sustituir la implementación *stub* por
llamadas reales a la API de Claude sin tocar el motor de simulación ni la API.
"""

from __future__ import annotations

from typing import Any, Protocol


class ProfileGenerator(Protocol):
    """Contrato para generadores de perfiles de audiencia."""

    def generate_profiles(
        self, idea: str, target_audience: str, n_profiles: int
    ) -> list[dict[str, Any]]:
        """Devuelve una lista de perfiles virtuales."""
        ...

    def explain_objections(
        self, idea: str, objections: list[dict[str, Any]]
    ) -> list[str]:
        """Convierte objeciones agregadas en explicaciones en lenguaje natural."""


class StubProfileGenerator:
    """Implementación de marcador de posición (no llama a ningún LLM).

    Reemplazar por una implementación basada en la API de Claude
    (``anthropic`` SDK, modelo ``claude-opus-4-8`` o el vigente) en la próxima
    iteración. Documentado así a propósito para el siguiente desarrollador.
    """

    def generate_profiles(
        self, idea: str, target_audience: str, n_profiles: int
    ) -> list[dict[str, Any]]:
        raise NotImplementedError(
            "Generación de perfiles con LLM pendiente. Integrar el SDK de Anthropic "
            "aquí (ver README, sección 'Roadmap de IA')."
        )

    def explain_objections(
        self, idea: str, objections: list[dict[str, Any]]
    ) -> list[str]:
        raise NotImplementedError("Explicación de objeciones con LLM pendiente.")
