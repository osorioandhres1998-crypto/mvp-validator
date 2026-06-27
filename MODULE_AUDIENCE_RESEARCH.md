# Módulo: Audience Research (JTBD) — guía + spec

> Cuarto módulo de **MVP Validator**. Modela la **demanda** de un producto con el
> framework **Jobs-to-be-Done (JTBD)**: dado un producto (+ pista de audiencia e
> insights reales opcionales), devuelve segmentos con su situación gatillo, sus
> jobs (funcional, emocional, social) e insights accionables, para pintarse como
> **tabla comparativa**.
>
> Complementa el motor **Monte Carlo** (cuantitativo: aceptación, intención de
> compra…) con una lente **cualitativa**: *cuándo, por qué y cómo* busca el
> cliente una solución como la tuya.
>
> *Nota de origen:* este spec se adaptó desde el proyecto ConsumerMind (Node/JS,
> registro `TASKS` en `prompts.js`). MVP Validator tiene otra arquitectura
> (Python/FastAPI + capa LLM con fallback heurístico + Next.js), así que el
> **concepto** se conserva pero la **implementación** sigue los patrones de este
> repo.

---

## 1. Por qué encaja en la arquitectura actual

El proyecto ya resuelve "dado un producto y un público, usa la capa LLM (con
fallback) y devuelve JSON" en `app/llm/profiles.py` (arquetipos) e
`/ideas/analyze`. Este módulo reutiliza **exactamente ese patrón**, pero cambia
la lente: en vez de generar arquetipos para alimentar la simulación, **modela la
demanda** con JTBD.

| Capa | Qué aporta este módulo |
|------|------------------------|
| LLM (con fallback) | `app/llm/audience_research.py`: `AudienceResearcher` (Protocol) + `ClaudeAudienceResearcher` + `HeuristicAudienceResearcher` + `get_audience_researcher()`. **Mismo patrón que `profiles.py`.** |
| Contrato (schemas) | `AudienceResearchRequest` / `AudienceResearchResponse` / `AudienceSegment` en `app/models/schemas.py`. |
| API | `POST /audience-research` en `app/api/routes.py`. **Síncrono** (una llamada → un JSON), a diferencia de `/ideas/analyze` que es asíncrono por la simulación larga. |
| Frontend | Página `/audience-research`, `researchAudience()` en `lib/api.ts`, tabla comparativa en `components/AudienceTable.tsx`. |

**Regla de oro respetada:** siempre hay fallback heurístico. Sin
`ANTHROPIC_API_KEY`, el módulo funciona offline y los tests/CI corren sin red.
El campo `source` (`claude`/`heuristic`) indica qué motor se usó.

---

## 2. La lógica del prompt, traducida a la app

El concepto pide tres bloques de razonamiento y un **formato de tabla**:

1. **Situaciones clave** → en qué situación, qué evento/disparador y en qué
   momento la audiencia es más receptiva (`trigger_situation`, `trigger_event`,
   `best_timing`).
2. **Jobs-to-be-Done** → trabajo funcional, emocional y social de cada segmento
   (`job_functional`, `job_emotional`, `job_social`).
3. **Insights clave** → preguntas de venta, fricciones de soporte, social
   listening, dolor y deseo (`sales_questions`, `support_frustrations`,
   `social_listening`, `main_pain`, `main_desire`).

La salida es un **array de segmentos** (cada uno = una columna de la tabla;
cada campo = una fila).

### Flujo de entrevista (capa de interacción)

El prompt original empieza preguntando. En la app eso vive en el **frontend**
(formulario del módulo), no en el system prompt, para no romper el contrato
"una llamada → un JSON". Antes de llamar al motor se recoge:

1. **¿Qué producto o servicio vendes?** → `product` (obligatorio).
2. **¿Tienes una idea de a quién te diriges?** → `audience_hint` (opcional; si
   está vacío, los segmentos se marcan `is_hypothesis: true`).
3. **¿Tienes insights reales** (conversaciones, tickets, hilos)? → `insights_raw`
   (opcional; si existe, el motor se basa en él y lo cita en `evidence`, no
   inventa).

---

## 3. Contrato de la API

**Request** (`POST /audience-research`):

```json
{
  "product": "App de finanzas para freelancers que automatiza impuestos",
  "audience_hint": "Freelancers 25-45 en LATAM",
  "insights_raw": "Opcional: frases textuales de clientes/soporte/redes"
}
```

**Response** (`AudienceResearchResponse`):

```json
{
  "summary": "Una oración con el insight de demanda más importante",
  "source": "heuristic",
  "segments": [
    {
      "segment": "Nombre del segmento",
      "is_hypothesis": true,
      "trigger_situation": "...", "trigger_event": "...", "best_timing": "...",
      "job_functional": "...", "job_emotional": "...", "job_social": "...",
      "sales_questions": "...", "support_frustrations": "...",
      "social_listening": "...", "main_pain": "...", "main_desire": "...",
      "evidence": "Cita textual del insight real, o 'hipótesis'"
    }
  ]
}
```

Devuelve **entre 2 y 4 segmentos**.

---

## 4. Render en frontend (tabla comparativa)

`segments[]` se pinta como tabla: **cada segmento es una columna**, **cada clave
es una fila**. Cabeceras, en orden: Situación gatillo · Evento detonante · Mejor
momento · Job funcional · Job emocional · Job social · Preguntas de venta ·
Fricciones de soporte · Social listening · Dolor principal · Deseo principal ·
Evidencia. Los segmentos `is_hypothesis: true` muestran una etiqueta "hipótesis".

Componentes: `components/AudienceResearchForm.tsx`,
`components/AudienceTable.tsx`, página `pages/audience-research.tsx`. Navegación
entre módulos en `components/NavBar.tsx`.

---

## 5. Coherencia con el resto del proyecto

- **No se replica en `web/index.html`.** La regla #1 de `CLAUDE.md` (replicar el
  modelo en la demo del navegador) aplica solo al **motor Monte Carlo**, que es
  determinista y autónomo. Audience Research depende de la capa LLM/backend, así
  que **no** forma parte de la demo offline.
- **Schema ↔ tipos.** Si cambias `AudienceSegment` en `schemas.py`, actualiza
  `frontend/lib/types.ts`.
- **Fallback siempre.** No acoples el endpoint a que exista `ANTHROPIC_API_KEY`.

---

## 6. Checklist de implementación (hecho)

1. ✅ `app/llm/audience_research.py` (generador Claude + heurístico + fábrica).
2. ✅ Schemas `AudienceResearch*` en `app/models/schemas.py`.
3. ✅ Endpoint `POST /audience-research` en `app/api/routes.py`.
4. ✅ Tests del camino heurístico + endpoint (`tests/test_audience_research.py`).
5. ✅ Frontend: página, formulario, tabla, navegación y tipos.
6. ✅ Docs: este archivo, README y CLAUDE.md.
