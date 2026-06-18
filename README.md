# 🧪 MVP Validator — Validador de MVP basado en Audiencias Simuladas

> Valida tu idea de producto **antes de construirla**. La empresa carga un concepto y la IA genera miles de perfiles virtuales basados en datos reales del público objetivo para predecir cómo reaccionaría el mercado.

[![Status](https://img.shields.io/badge/status-MVP-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](#-licencia)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF)](#-integración-continua)
[![Python](https://img.shields.io/badge/python-3.11-3776AB)](#)

---

## 📌 Descripción

**MVP Validator** es una plataforma de validación de productos impulsada por IA. En lugar de invertir semanas y miles de dólares en encuestas, focus groups o lanzamientos piloto, las empresas pueden **simular la respuesta del mercado en minutos**.

El usuario carga una idea de producto y el sistema crea **miles de perfiles virtuales (audiencias simuladas)**. Estos perfiles "reaccionan" a la propuesta como lo haría un cliente real, generando insights accionables antes de cualquier inversión.

Esta primera iteración implementa el **motor de simulación Monte Carlo** que modela estadísticamente esas reacciones, expuesto mediante una **API REST (FastAPI)**. La generación de perfiles y respuestas textuales con un **LLM (Claude)** queda preparada como punto de extensión (ver [Roadmap de IA](#-roadmap-de-ia)).

---

## ✨ ¿Qué obtienes?

| Resultado | Métrica en la API |
|-----------|-------------------|
| 📈 **Aceptación del mercado** | `acceptance_rate` (media + intervalo de confianza 95 %) |
| 💰 **Intención de compra** | `purchase_intent_probability` (media + CI 95 %) |
| 🚧 **Predicción de objeciones** | `top_objections` (lista con frecuencias) |
| ⭐ **Características más valoradas** | `feature_importance` (sensibilidad de la adopción) |

---

## 🧠 ¿Cómo funciona?

```
┌──────────────────┐     ┌────────────────────┐     ┌─────────────────────┐
│ 1. Carga la idea │ ──▶ │ 2. Generación de   │ ──▶ │ 3. Simulación de    │
│  + config        │     │    perfiles        │     │    reacciones (MC)  │
└──────────────────┘     └────────────────────┘     └─────────────────────┘
                                                              │
                                                              ▼
                                                  ┌─────────────────────┐
                                                  │ 4. Reporte de        │
                                                  │    insights + CI     │
                                                  └─────────────────────┘
```

El **motor Monte Carlo** ejecuta miles de iteraciones; en cada una genera una población de perfiles que perciben las características del producto, evalúan el precio y deciden (o no) adoptar y comprar. La agregación de todas las iteraciones produce métricas con intervalos de confianza.

---

## 🗂️ Estructura del repositorio

```
.
├── README.md                  # Este archivo
├── docker-compose.yml         # Levanta backend + frontend
├── .github/workflows/ci.yml   # CI: lint + tests + coverage
├── examples/
│   └── payload_default.json   # Payload de ejemplo para POST /simulations
├── notebooks/
│   └── demo_monte_carlo.ipynb # Demo con gráficos
├── backend/                   # API FastAPI + motor Monte Carlo
│   ├── app/
│   │   ├── main.py            # App FastAPI
│   │   ├── api/routes.py      # Endpoints REST
│   │   ├── sim/monte_carlo.py # Motor de simulación (run_simulation)
│   │   ├── models/schemas.py  # Schemas pydantic
│   │   ├── utils/             # seed, logging, paralelización
│   │   ├── llm/profiles.py    # Hook para integración con Claude
│   │   └── store.py           # Cola y almacén de simulaciones
│   ├── tests/                 # Unit + integración
│   ├── requirements.txt       # Dependencias fijas
│   └── Dockerfile
└── frontend/                  # Placeholder Next.js + TypeScript
```

---

## 🚀 Inicio rápido con Docker

```bash
docker-compose up --build
```

- Backend (API + Swagger): <http://localhost:8000/docs>
- Frontend (placeholder): <http://localhost:3000>

---

## 🛠️ Desarrollo local (sin Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload      # http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev                        # http://localhost:3000
```

---

## 🔌 API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/simulations` | Encola una simulación. Devuelve `simulation_id`. |
| `GET`  | `/simulations/{id}/status` | Estado: `queued` / `running` / `done` / `failed`. |
| `GET`  | `/simulations/{id}/results` | Resultados agregados. |
| `GET`  | `/simulations/{id}/samples?limit=100&page=1` | Muestras crudas paginadas. |
| `GET`  | `/health` | Estado del servicio. |

### Ejemplo de uso

```bash
# 1) Lanzar simulación (payload por defecto: n_iterations=10000, population_size=1000, seed=42)
curl -X POST http://localhost:8000/simulations \
  -H "Content-Type: application/json" \
  -d @examples/payload_default.json
# => { "simulation_id": "ab12...", "status": "queued" }

# 2) Consultar estado
curl http://localhost:8000/simulations/ab12.../status

# 3) Obtener resultados
curl http://localhost:8000/simulations/ab12.../results

# 4) Paginar muestras crudas
curl "http://localhost:8000/simulations/ab12.../samples?limit=100&page=1"
```

### Payload de ejemplo

```json
{
  "n_iterations": 10000,
  "population_size": 1000,
  "adoption_prob_base": 0.2,
  "feature_weights": {
    "usabilidad": 1.0,
    "diseno": 0.7,
    "innovacion": 0.9,
    "soporte": 0.5,
    "confiabilidad": 0.8
  },
  "price_sensitivity": 1.0,
  "noise_distribution": { "type": "normal", "params": { "loc": 0.0, "scale": 1.0 } },
  "random_seed": 42,
  "include_raw_samples": true
}
```

### Parámetros de configuración

| Parámetro | Tipo | Por defecto | Descripción |
|-----------|------|-------------|-------------|
| `n_iterations` | int | `10000` | Nº de iteraciones Monte Carlo. |
| `population_size` | int | `1000` | Perfiles virtuales por iteración. |
| `adoption_prob_base` | float | `0.2` | Probabilidad base de adopción (0–1). |
| `feature_weights` | dict | *(ver ejemplo)* | Peso de cada característica del producto. |
| `price_sensitivity` | float | `1.0` | Penalización por precio percibido. |
| `noise_distribution` | obj | `normal(0,1)` | `type`: `normal`/`uniform`/`lognormal`/`gumbel` + `params`. |
| `random_seed` | int? | `42` | Semilla para reproducibilidad. |
| `include_raw_samples` | bool | `true` | Devolver muestras crudas paginables. |
| `n_jobs` | int? | `null` | Workers de paralelización (`-1` = todas las CPU; `null` = automático). |

---

## 📊 Interpretación de las métricas

- **`acceptance_rate`** — Porcentaje esperado del público que adoptaría el producto. **Usa el intervalo de confianza** (`ci_95_lower`/`ci_95_upper`), no solo la media, para comunicar incertidumbre.
- **`purchase_intent_probability`** — Probabilidad de intención de compra, condicionada a la adopción y penalizada por el precio.
- **`top_objections`** — Objeciones ordenadas por frecuencia (`precio_alto`, `valor_percibido_bajo`, `no_lo_necesita`). Prioriza mitigar la más frecuente.
- **`feature_importance`** — Sensibilidad de la adopción a cada característica (correlación punto-biserial normalizada). Enfoca el roadmap en las de mayor `importance`.
- **`execution_metrics`** — Tiempos, iteraciones/segundo, semilla y workers usados.

---

## 🧪 Pruebas y calidad

```bash
cd backend
pytest --cov=app --cov-report=term-missing   # tests + cobertura
ruff check app tests                         # linter
black --check app tests                      # formato
isort --check-only app tests                 # orden de imports
```

Las pruebas cubren: validación de schemas, **reproducibilidad** (misma semilla → mismo resultado), **convergencia** aproximada a la tasa base, equivalencia serie/paralelo, y los **endpoints** de la API. Objetivo de cobertura inicial: **70 %**.

---

## 📓 Notebook de demostración

```bash
pip install -r backend/requirements.txt -r notebooks/requirements.txt
jupyter notebook notebooks/demo_monte_carlo.ipynb
```

Ejecuta un escenario realista y genera gráficos de la distribución de aceptación, objeciones e importancia de características.

---

## 🔁 Integración continua

`.github/workflows/ci.yml` ejecuta en cada push/PR: `ruff`, `black`, `isort` y `pytest` con umbral de cobertura del 70 %.

---

## 🤖 Roadmap de IA

El motor actual es **puramente estadístico** (sin dependencias pesadas de ML). El módulo [`backend/app/llm/profiles.py`](backend/app/llm/profiles.py) define la interfaz (`ProfileGenerator`) que la siguiente iteración implementará con la **API de Claude** para:

1. Generar perfiles virtuales realistas a partir de la descripción de la idea y el público objetivo.
2. Convertir las objeciones agregadas en **explicaciones en lenguaje natural**.

Sustituir `StubProfileGenerator` por una implementación basada en el SDK `anthropic` (modelo `claude-opus-4-8` o el vigente) sin tocar el motor de simulación ni la API.

---

## 🗺️ Próximos pasos para el siguiente desarrollador

- [ ] Persistencia en **PostgreSQL** (el servicio ya está preparado y comentado en `docker-compose.yml`).
- [ ] Cola de trabajo real (Celery/RQ) en lugar del `ThreadPoolExecutor` en memoria.
- [ ] Implementar el generador de perfiles con Claude (`app/llm/profiles.py`).
- [ ] UI real del frontend: formulario de idea + dashboard de resultados.
- [ ] Segmentación de audiencias (perfiles por demografía/psicografía).

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.

---

## 📬 Contacto

**Autor:** Andrés Osorio · 📧 osorioandhres1998@gmail.com

> Hecho con ❤️ y 🤖 para validar ideas antes de construirlas.
