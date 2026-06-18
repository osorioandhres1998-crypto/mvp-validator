# Frontend — MVP Validator (placeholder)

Placeholder de **Next.js + TypeScript**. Su único objetivo en esta primera
iteración es verificar la conectividad con el backend y servir de base para la
UI real (formulario de carga de ideas y dashboard de resultados).

## Requisitos

- Node.js 20+

## Puesta en marcha

```bash
cd frontend
npm install
cp .env.example .env.local   # opcional: ajustar NEXT_PUBLIC_API_URL
npm run dev
```

La app queda disponible en <http://localhost:3000> y consulta el endpoint
`/health` del backend (por defecto `http://localhost:8000`).

## Siguientes pasos sugeridos

1. Formulario para cargar la idea de producto y la configuración de simulación.
2. Llamada a `POST /simulations` y *polling* de `GET /simulations/{id}/status`.
3. Dashboard con las métricas (`acceptance_rate`, `purchase_intent_probability`,
   `top_objections`, `feature_importance`) y gráficos.
4. Tabla paginada de muestras (`GET /simulations/{id}/samples`).
