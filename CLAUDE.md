# CLAUDE.md — Memoria del proyecto: MVP Validator

> Documento de referencia para mantener la **coherencia arquitectónica** ante
> cualquier cambio futuro. Léelo antes de modificar código. Está en español
> (todo el proyecto se documenta en español).

---

## 1. Qué es el proyecto

**MVP Validator** valida ideas de producto mediante **audiencias simuladas**.
La IA genera arquetipos del público objetivo y un motor **Monte Carlo** estima,
con miles de iteraciones, la reacción del mercado.

**Flujo conceptual:** `idea → generación de perfiles (arquetipos) → simulación Monte Carlo → reporte de insights`.

**Salidas clave** (mismas en todas las capas):
- `acceptance_rate` — aceptación de mercado (media + IC 95 %).
- `purchase_intent_probability` — intención de compra (media + IC 95 %).
- `top_objections` — objeciones con frecuencia.
- `feature_importance` — sensibilidad de la adopción a cada característica.

---

## 2. Arquitectura y componentes

El repo tiene **4 componentes** + infraestructura. La lógica del modelo es la
**fuente de verdad** y vive en el backend; los demás la consumen o la replican.

```
┌─────────────────────────────┐     ┌──────────────────────────────────────┐
│ frontend/ (Next.js + TS)    │ ──▶ │ backend/ (FastAPI)                   │
│ Dashboard: form + polling   │ HTTP│  ┌────────────────────────────────┐  │
│ + visualizaciones SVG/CSS   │ ◀── │  │ api/routes.py  (endpoints REST)│  │
└─────────────────────────────┘     │  └───────────┬────────────────────┘  │
                                     │              │                       │
┌─────────────────────────────┐     │   ┌──────────▼─────────┐ ┌─────────┐ │
│ web/index.html (port JS)    │     │   │ store.py (cola)    │ │ llm/    │ │
│ Demo autónoma 100% navegador│     │   │ ThreadPoolExecutor │ │ Claude/ │ │
│ (replica el modelo en JS)   │     │   └──────────┬─────────┘ │ heur.   │ │
└─────────────────────────────┘     │              │           └────┬────┘ │
                                     │   ┌──────────▼─────────┐      │      │
┌─────────────────────────────┐     │   │ sim/monte_carlo.py │◀─────┘      │
│ notebooks/ (Jupyter)        │ ──▶ │   │ run_simulation()   │ (núcleo)    │
│ Demo con gráficos           │     │   └────────────────────┘             │
└─────────────────────────────┘     └──────────────────────────────────────┘
```

### 2.1 Backend — `backend/` (componente principal)
FastAPI + Python. Contiene el **núcleo del modelo**.

| Módulo | Responsabilidad | Notas para no romper coherencia |
|--------|-----------------|---------------------------------|
| `app/sim/monte_carlo.py` | **Núcleo Monte Carlo**: `run_simulation(config: dict) -> dict`. Vectorizado (numpy), paralelizado (joblib). | **Fuente de verdad del modelo.** Cualquier cambio en la fórmula de adopción/precio/objeciones debe replicarse en `web/index.html` (ver §4). Reproducible por `random_seed` (SeedSequence por iteración). |
| `app/models/schemas.py` | Schemas pydantic v2 (entrada/salida). | El contrato de la API. Si cambias campos, actualiza `frontend/lib/types.ts`. |
| `app/api/routes.py` | Endpoints REST. | Ver tabla §3. |
| `app/store.py` | Cola en memoria + ejecución asíncrona (`ThreadPoolExecutor`). Estados `queued/running/done/failed`. Genera insights post-simulación si hay metadatos de idea. | **In-memory a propósito** (MVP). Punto de extensión a Celery/RQ + PostgreSQL. |
| `app/llm/` | Integración con IA. Ver §2.5. | |
| `app/utils/` | `seed.py` (SeedSequence), `logging.py`, `parallel.py` (resolución de `n_jobs`). | |
| `tests/` | Unit + integración (pytest). | Mantener cobertura ≥ 70 % (lo exige el CI). |

### 2.2 Frontend — `frontend/` (Next.js + TypeScript)
Dashboard que **consume la API**. Pages Router.

- `lib/api.ts` — cliente HTTP (`analyzeIdea`, `getStatus`, `getResults`, `waitForResults` con polling).
- `lib/types.ts` — **espejo TypeScript** de los schemas pydantic.
- `components/` — `IdeaForm`, `ResultsDashboard`, `Gauge`, `BarList`, `ArchetypeCards`. Visualizaciones propias en **SVG/CSS** (sin librerías de charts).
- `pages/index.tsx` — orquesta: form → `analyzeIdea` → polling → dashboard.
- `styles/globals.css` — tema oscuro (variables CSS compartidas conceptualmente con `web/`).

### 2.3 Web demo — `web/index.html` (autónoma, sin backend)
Página **single-file** que **replica el modelo en JavaScript puro** (port de
`monte_carlo.py` + arquetipos/insights heurísticos de `profiles.py`). RNG
`mulberry32` para reproducibilidad. **No depende del backend.** Sirve como demo
tipo "modelo de ML" embebible.

### 2.4 Notebook — `notebooks/demo_monte_carlo.ipynb`
Importa `app.sim.monte_carlo` y grafica resultados (matplotlib). Documentación viva.

### 2.5 Capa LLM — `backend/app/llm/`
Traduce idea → audiencia → insights. **Degradación elegante**: funciona sin clave.

| Módulo | Rol |
|--------|-----|
| `client.py` | Wrapper del SDK `anthropic` + `extract_json()`. `is_available()` decide si hay clave y SDK. |
| `profiles.py` | Interfaz `ProfileGenerator` (Protocol) con 2 implementaciones: `ClaudeProfileGenerator` (real) y `HeuristicProfileGenerator` (fallback offline determinista). `get_profile_generator()` elige según `ANTHROPIC_API_KEY`. |
| `config_builder.py` | `build_simulation_plan()`: genera arquetipos y los **agrega** (media ponderada por `segment_share`) en una config para `run_simulation`. |
| `audience_research.py` | **Módulo Audience Research (JTBD)**: `AudienceResearcher` (Protocol) + `ClaudeAudienceResearcher` + `HeuristicAudienceResearcher` + `get_audience_researcher()`. Modela la demanda (segmentos con jobs e insights). Mismo patrón de fallback. |

**Regla de oro de la IA:** siempre debe existir un fallback heurístico. Tests y
CI corren **sin** clave de API. El campo `audience_source` (`claude`/`heuristic`)
indica qué motor se usó.

---

## 3. Contrato de la API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/ideas/analyze` | Idea + público → arquetipos (IA) → encola simulación. Devuelve `simulation_id`. |
| `POST` | `/simulations` | Simulación con `config` manual. |
| `GET`  | `/simulations/{id}/status` | `queued`/`running`/`done`/`failed`. |
| `GET`  | `/simulations/{id}/results` | Resultados agregados (+ `archetypes`, `insights`, `audience_source` si vino de `/ideas/analyze`). |
| `GET`  | `/simulations/{id}/samples?limit&page` | Muestras crudas por iteración, paginadas. |
| `POST` | `/audience-research` | **Módulo JTBD (síncrono)**: producto → segmentos de demanda (jobs e insights). |
| `GET`  | `/health` | Estado del servicio. |

---

## 4. Reglas de coherencia (LO MÁS IMPORTANTE)

Al modificar el proyecto, respeta estos invariantes para no romper la lógica:

1. **El modelo tiene una fuente de verdad: `backend/app/sim/monte_carlo.py`.**
   Si cambias la fórmula (adopción, efecto precio como **coste neto**,
   objeciones, importancia de características, cálculo de IC), **replica el
   cambio en `web/index.html`** (función `runSimulation`) y, si aplica, en el
   notebook. Son tres implementaciones del mismo modelo. **Ojo:** esto aplica
   solo al motor Monte Carlo. Los módulos **LLM** (arquetipos, Audience Research)
   dependen del backend y **no** se replican en la demo `web/` autónoma.

2. **El contrato API ↔ frontend debe ir sincronizado.** Cambios en
   `app/models/schemas.py` o en la forma de `results` ⇒ actualizar
   `frontend/lib/types.ts` (y los componentes que consumen esos campos).

3. **La IA siempre con fallback.** Nunca hagas que un endpoint dependa de que
   `ANTHROPIC_API_KEY` exista. Mantén `HeuristicProfileGenerator` operativo y
   los tests sin red.

4. **Reproducibilidad.** Misma `random_seed` ⇒ mismos resultados. En backend se
   logra con `SeedSequence` por iteración (independiente del nº de workers); en
   `web/` con `mulberry32` sembrado por iteración. No introduzcas aleatoriedad
   sin sembrar.

5. **Sin dependencias pesadas de ML.** El núcleo es estadístico (numpy). Evita
   añadir frameworks de ML; si hace falta, justifícalo en este documento.

6. **Calidad.** Backend debe pasar `ruff`, `black`, `isort` y `pytest` con
   cobertura ≥ 70 % (lo verifica `.github/workflows/ci.yml`). Frontend debe
   compilar (`next build`, TypeScript estricto).

7. **Idioma.** Código comentado y documentación **en español**. Mantén el estilo.

---

## 5. Stack tecnológico

| Capa | Tecnología | Versión / nota |
|------|------------|----------------|
| Backend | Python + FastAPI + uvicorn | Pinned en `backend/requirements.txt` (target 3.11). |
| Núcleo numérico | numpy, pandas, joblib | Sin libs de ML pesadas. |
| IA | `anthropic` SDK (Claude) | Opcional en runtime; modelo por defecto `claude-sonnet-4-6` (`LLM_MODEL`). |
| Validación | pydantic v2 | |
| Frontend | Next.js 14 (Pages Router) + React 18 + TypeScript 5 | Sin librerías de charts (SVG/CSS propios). |
| Web demo | HTML + JS vanilla | Single-file, sin build. |
| Tests/calidad | pytest, pytest-cov, ruff, black, isort | |
| Infra | Docker, docker-compose, GitHub Actions | PostgreSQL preparado (comentado) en `docker-compose.yml`. |

---

## 6. Comandos habituales

```bash
# Backend (local)
cd backend && python -m venv .venv && .venv/Scripts/activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload            # http://localhost:8000/docs
pytest --cov=app --cov-report=term-missing
ruff check app tests && black app tests && isort app tests

# Frontend
cd frontend && npm install && npm run dev # http://localhost:3000
npm run build                             # verificación de tipos + build

# Todo junto
docker-compose up --build                 # backend :8000 + frontend :3000

# Web demo (sin nada)
# abrir web/index.html, o: python -m http.server 5051 --directory web
```

### Entorno de este equipo (notas operativas)
- Python local es **3.14**; los pines (numpy 1.26.4 etc.) **no tienen wheels**
  para 3.14 → usar Docker o un venv con Python 3.11 para reproducir CI. Para
  pruebas locales se instalaron versiones recientes en el `.venv` del backend.
- `gh` CLI está en `C:\Program Files\GitHub CLI` (puede no estar en el PATH del
  shell). Repo remoto: **privado**, `osorioandhres1998-crypto/mvp-validator`.
  Ramas: `main` (por defecto) e `init/monte-carlo` (desarrollo), mantenidas en
  paralelo.

---

## 7. Estado actual y roadmap

**Implementado:** motor Monte Carlo + API REST + cola async + integración Claude
(con fallback) + dashboard Next.js + demo web autónoma + notebook + CI + Docker.

**Pendiente (mantener coherencia al abordarlo):**
- Persistencia en **PostgreSQL** (servicio ya preparado y comentado en `docker-compose.yml`) → reemplazar el almacén in-memory de `store.py`.
- Cola de trabajo real (Celery/RQ) en vez de `ThreadPoolExecutor`.
- **Simulación por segmento** (aceptación por arquetipo, no solo agregada) → afectaría a `config_builder.py` y a `run_simulation` o a un nuevo orquestador.
- Caché de llamadas a Claude y control de coste/tokens.
- Tabla paginada de muestras y comparación A/B en el frontend.

---

## 8. Convenciones de Git

- Commits **atómicos y descriptivos** en español, con prefijo tipo
  (`feat`, `fix`, `test`, `docs`, `chore`, `ci`). Terminar con la línea
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- No commitear `.venv/`, `node_modules/`, `.next/`, `.claude/` (ya en `.gitignore`).
