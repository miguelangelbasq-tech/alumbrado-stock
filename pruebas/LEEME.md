# Pruebas de la v092

Estas pruebas se suman al arnés del kit (`h.js`, `firebase_stub.js`, `reglas_stub.js`).

- `t_v092.js`: Proyectista con cálculos (Columnas, Eléctrico, Luz, memoria). Correr: `APP=…/index.html node t_v092.js` (PC) y `… cel`.
- `t_v092u.js`: ubicación con el celular bloqueado (cortes, aviso, prueba, app cerrada, lo que ve la oficina). Usa `page.clock` de Playwright y la opción nueva `tz` de `h.js` (zona horaria del navegador: agregar `op.tz ? { timezoneId: op.tz } : {}` al `newContext`).
- `num/`: control numérico independiente.
  1. `node num/gen.js proyectista.js` genera casos con el motor de la app (el código de `proyectistaCod`, guardado aparte como `proyectista.js`).
  2. `python3 num/control.py` los recalcula con fórmulas y librerías aparte (numpy, scipy, shapely, pyproj). Tiene que dar todo OK.

# Pruebas de la v098 y la v099

- `t_v098.js`: el «Quedan N de T» de la orden lee lo cargado en el Avance de obra (itemizado), sin contar dos veces lo que ya cerraron las órdenes.
- `t_v098b.js`: «¿Olvidaste tu contraseña o tu usuario?» en la entrada. Necesita en `firebase_stub.js` (dentro de `crearAuth`, junto a `createUserWithEmailAndPassword`) un `sendPasswordResetEmail(email)` que:
  - anote cada pedido en `window.__stubResets` (`{email, lang: a.languageCode}`);
  - rechace con `auth/invalid-email` un correo mal escrito, con `auth/network-request-failed` si `__stubSinRed`, y con `auth/user-not-found` si no hay cuenta.
- `t_v099.js`: Proyectista. Tocar, mover (arrastrando, tocando el mapa), cambiar tipo, nota, borrar y deshacer puntos en el mapa; quiebres de los tramos (＋ y cuadraditos) con su largo en la cota, la planilla, el DXF (polilínea) y el cable del cálculo eléctrico; dibujar el camino caminando (GPS de mentira, cuarto de círculo); plano que se mueve, se acerca (＋, rueda, dos dedos) y donde se tocan y arrastran los puntos. Usa `leaflet: true`.

# Pruebas de la v100

- `t_v100.js`: Avance de obra sin etapas EPEC, valorización, balance ni fotos; rubros con % y colores, columnas a la vista, +, total del ítem, agregar y sacar ítems, inspección; legajo con «🧾 Material: calculado vs. entregado» (tarjetas, filtro, orden, devolver lo que sobró).
- Se actualizaron `t_v045.js` (ya no hay tabla de valorización ni lista de etapas a mano: se controla la fila del ítem y que la inspección se tilde aparte) y `t_v047.js` (las filas ahora van agrupadas por rubro: se toma la primera fila de la lista).

# Pruebas de la v101

- `t_v101.js`: alternativas del pañol en «📦 Material de esta obra» (Calculadora › Material por obra). El cable 3×1,5 (6001) que no hay muestra en verde el 1019 y el 1025 (con «lo daba la Municipalidad», «no dice la norma», «rollos») y en amarillo el 3×2,5. La BPN que no alcanza muestra el 2003 «no dice el color». No ofrece prensacable 1 1/2" por 1/2" ni fusible 1 A o Neozed por 2 A. «Pedir esta en su lugar» pregunta los m por rollo, cambia el pedido y lo anota. «Calculadora ↔ pañol» usa la misma comparación.
- `t_v102a.js`: columnas sin vínculo (4 → 4 en la orden), segundo tablero, «Pasar este cálculo a la obra», etapa y «qué falta» desde los ítems, colores, la inspección pregunta antes.
- `t_v102b.js`: números de comprobante guardados y marcas sin señal escritas directo.
- `t_v102c.js`: pañol: unidades (`porUnidad`), sustitutos, reservas sin «No hay», lista de compras, anular la pareja, prensacables.
- `t_v102d.js`: órdenes y puntos: reinicio, reparto, «Quedan», orden cerrada que sigue otro día, anuladas, revertir avance.
- `t_v102e.js`: «Finalizada» única, obras ocultas en la plata, ganancia sin IVA, material por código, notas, cable del itemizado con la subida.
- `t_v055.js` se actualizó (v102): «📏 ¿Cuántos m trae cada Un.?» reemplaza a «Poner unidad».
- `t_v103.js`: cables en m y alambre en kg, 7004–7007 de baja, mismo material con otro código, ganancia 3,5 + 0,5 m, reserva 5 % fuera del ítem, provisiones fuera del %, puntos desde el 01/11/2026 (`pisoReal:true`).
- `t_v104.js`: «📌 Seguimiento» (lo dado, lo hecho, lo que falta; darla a otro) y «↩ Sigue en obra».
- `t_v055.js` y `t_v056.js` se actualizaron (v103): fijan en sus datos las unidades de antes (la base ahora tiene cables en m y alambre en kg).
- **Arnés (v103):** `h.js` tiene que poner `window.__puntosPisoFijo = "2000-01-01"` en las pruebas viejas (salvo `pisoReal:true`), porque desde la v103 los puntos cuentan desde el 01/11/2026.
