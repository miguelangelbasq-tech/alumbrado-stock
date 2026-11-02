# Pruebas de la v092

Estas pruebas se suman al arnés del kit (`h.js`, `firebase_stub.js`, `reglas_stub.js`).

- `t_v092.js`: Proyectista con cálculos (Columnas, Eléctrico, Luz, memoria). Correr: `APP=…/index.html node t_v092.js` (PC) y `… cel`.
- `t_v092u.js`: ubicación con el celular bloqueado (cortes, aviso, prueba, app cerrada, lo que ve la oficina). Usa `page.clock` de Playwright y la opción nueva `tz` de `h.js` (zona horaria del navegador: agregar `op.tz ? { timezoneId: op.tz } : {}` al `newContext`).
- `num/`: control numérico independiente.
  1. `node num/gen.js proyectista.js` genera casos con el motor de la app (el código de `proyectistaCod`, guardado aparte como `proyectista.js`).
  2. `python3 num/control.py` los recalcula con fórmulas y librerías aparte (numpy, scipy, shapely, pyproj). Tiene que dar todo OK.
