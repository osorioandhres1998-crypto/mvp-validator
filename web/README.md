# Web — Demo autónoma en el navegador

`index.html` es una **página independiente y funcional** que ejecuta el modelo
del proyecto (motor Monte Carlo + arquetipos heurísticos) **100 % en el
navegador**, sin backend ni dependencias. Es un *port* en JavaScript de:

- [`backend/app/sim/monte_carlo.py`](../backend/app/sim/monte_carlo.py) — simulación.
- [`backend/app/llm/profiles.py`](../backend/app/llm/profiles.py) — arquetipos e insights (heurística).

## Uso

Basta con abrir el archivo:

```bash
# Doble clic en web/index.html, o servirlo localmente:
python -m http.server 5051 --directory web
# -> http://localhost:5051
```

Introduce una idea y un público objetivo, ajusta los controles (arquetipos,
iteraciones, población, semilla) y pulsa **Validar idea**. La simulación corre
en tu equipo y muestra:

- Gauges de **aceptación de mercado** e **intención de compra** con CI 95 %.
- **Resumen accionable** y recomendaciones por objeción.
- Barras de **objeciones** e **importancia de características**.
- Tarjetas de **arquetipos de audiencia**.

## Notas

- Es **reproducible**: la misma semilla produce el mismo resultado (RNG
  `mulberry32`).
- Pensada como demostración tipo "modelo de ML" embebible. Para la versión
  completa (API + Claude + dashboard Next.js) ver el [README principal](../README.md).
- El repositorio es privado: GitHub Pages para repos privados requiere plan de
  pago. La página funciona igualmente abriéndola en local.
