# DEPLOY.md — Despliegue de MVP Validator

Pipeline para la **app completa**: dashboard **Next.js en Vercel** + backend
**FastAPI** en un host persistente (**Railway** o **Render**).

> ⚠️ Vercel **no** sirve para el backend FastAPI: usa estado en memoria
> (`store.py`) y un `ThreadPoolExecutor`, incompatibles con serverless. El
> backend necesita un host con proceso persistente (Railway/Render/Fly).

## Diferencias clave frente a un stack Node+Postgres

Este proyecto **NO** tiene los puntos de fricción típicos:

- ❌ **Sin base de datos** → sin migraciones, sin `DATABASE_URL`, sin `migrate.js`.
- ✅ **Backend por Dockerfile** → Python queda fijado a **3.11**, así que los
  pines de numpy/pandas instalan wheels sin compilar (el problema que da Python
  3.13/3.14).
- ✅ **IA opcional con fallback** → sin `ANTHROPIC_API_KEY`, el endpoint
  `/ideas/analyze` usa la heurística determinista. **No se necesita ninguna key
  para el primer deploy.** (Este código usa el SDK de Anthropic, no Groq.)

---

## Fase 0 — Preparación del código (ya hecha en el repo)

1. `backend/Dockerfile` arranca con `--port ${PORT:-8000}` (respeta el `$PORT`
   del host; en local sigue siendo 8000).
2. CORS del backend abierto (`allow_origins=["*"]`) → el frontend puede llamarlo
   desde el dominio de Vercel sin configuración extra.
3. El frontend lee el backend de `NEXT_PUBLIC_API_URL` (con fallback a
   `http://localhost:8000`).

---

## Fase 1 — Backend en Railway (Dockerfile)

1. **New Project → Deploy from GitHub** → repo `mvp-validator`.
2. **Settings → Root Directory = `backend`** (Railway detecta el `Dockerfile`).
3. **Variables** (mínimo): ninguna obligatoria.
   - *(Opcional)* `ANTHROPIC_API_KEY` = `sk-ant-...` para IA real con Claude.
   - *(Opcional)* `LLM_MODEL` = `claude-sonnet-4-6`.
4. **Settings → Networking → Generate Domain** → copiar la URL `https://...`.
5. Verificar: `https://<backend>/health` → `{"status":"ok"}`.

> Alternativa **Render**: New → Web Service → repo → Root Directory `backend` →
> Runtime **Docker** → crea el servicio. Mismo resultado.

---

## Fase 2 — Frontend en Vercel

1. **Add New → Project** → importar `mvp-validator`.
2. **Root Directory = `frontend`** (Vercel detecta Next.js).
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = URL del backend de la Fase 1 (con `https://`).
4. **Deploy** → copiar la URL de Vercel.

> ⚠️ `NEXT_PUBLIC_*` se **incrusta en build-time**. Si cambias
> `NEXT_PUBLIC_API_URL` después, hay que **redeploy** para que tome efecto.

---

## Fase 3 — Verificación

1. Abrir la URL de Vercel.
2. Introducir idea + público objetivo → **Validar idea**.
3. El dashboard debe mostrar gauges, objeciones, características y arquetipos
   (con `audience_source: heuristic` si no pusiste API key).

---

## Trampas específicas de ESTE stack

1. **Backend en Vercel = no.** Es FastAPI con estado en memoria; debe ir en
   Railway/Render. (Vercel solo para el frontend.)
2. **`NEXT_PUBLIC_API_URL` es build-time**, no runtime: configúrala en Vercel y
   redeploy si la cambias.
3. **Monorepo**: en Vercel Root Directory = `frontend`; en el host del backend
   Root Directory = `backend`. Cada plataforma vigila su carpeta.
4. **Python en el host**: desplegar por **Dockerfile** (Python 3.11) evita que
   el host use 3.13/3.14 y falle al compilar numpy.
5. **Sin DB**: ignora cualquier paso de PostgreSQL/migraciones de pipelines
   anteriores; aquí no aplica.

---

## Atajo alternativo (todo en Vercel, sin backend)

Si solo quieres una demo pública inmediata, despliega la carpeta **`web/`**
(estática) como proyecto Vercel con Root Directory = `web`: el modelo corre
100 % en el navegador, sin backend ni variables. Ver [`web/README.md`](web/README.md).
