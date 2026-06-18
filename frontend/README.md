# Frontend — MVP Validator (dashboard)

Dashboard en **Next.js + TypeScript** que consume la API del backend. Permite
introducir una idea de producto y su público objetivo, lanza el análisis con IA
(`POST /ideas/analyze`), hace *polling* del estado y muestra los resultados:

- **Gauges** de aceptación de mercado e intención de compra (con CI 95 %).
- **Resumen accionable** e insights (generados por Claude o por la heurística).
- **Barras** de objeciones y de importancia de características.
- **Tarjetas** con los arquetipos de audiencia generados.

No usa librerías de gráficos: todo se dibuja con **SVG/CSS** propios para
mantener el bundle ligero.

## Requisitos

- Node.js 20+
- Backend corriendo (por defecto en `http://localhost:8000`).

## Puesta en marcha

```bash
cd frontend
npm install
cp .env.example .env.local   # opcional: ajustar NEXT_PUBLIC_API_URL
npm run dev                  # http://localhost:3000
```

Para una build de producción:

```bash
npm run build && npm start
```

## Estructura

```
frontend/
├── lib/
│   ├── api.ts        # cliente del backend (analyze, status, results)
│   └── types.ts      # tipos compartidos con la API
├── components/
│   ├── IdeaForm.tsx
│   ├── ResultsDashboard.tsx
│   ├── Gauge.tsx
│   ├── BarList.tsx
│   └── ArchetypeCards.tsx
├── pages/
│   ├── _app.tsx
│   └── index.tsx
└── styles/globals.css
```

## Variables de entorno

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL base del backend. |

## Siguientes pasos sugeridos

1. Modo "simulación manual" (editar `feature_weights` a mano vía `POST /simulations`).
2. Tabla paginada de muestras (`GET /simulations/{id}/samples`).
3. Histórico de simulaciones y comparación A/B de ideas.
