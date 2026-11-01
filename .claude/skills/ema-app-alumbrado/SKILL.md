---
name: ema-app-alumbrado
description: 'Forma de trabajar y diseño «Cristal» de la app «Alumbrado Público» de EMA Servicios (Córdoba): un solo index.html con Firebase, pañol, órdenes de trabajo, Mis tareas de la cuadrilla, calculadora, mapa, Proyectista, APK de Android. Usala SIEMPRE que se toque, revise, pruebe o publique esa app, o cuando se arme cualquier pantalla, módulo, hoja imprimible, PDF, informe o maqueta para EMA o para Ángel —aunque no digan «Cristal», «skill» ni «diseño»— para que todo lo nuevo salga con el mismo diseño, se arme la versión como corresponde (ORIGINAL → parche → index, dos marcas de versión, pruebas en PC y celular) y no se pise el trabajo de SALEM. También sirve para preguntas sobre cómo está hecha la app, sus colores, letras, roles o reglas de Firebase.'
---

# App «Alumbrado Público» — EMA Servicios

Esta skill junta dos cosas que tienen que salir siempre igual, la haga quien la haga (Claude Code, el chat de Claude, SALEM):

1. **El diseño «Cristal»**: que cada pantalla nueva parezca de la misma app.
2. **La forma de trabajar**: que cada versión se arme, se pruebe y se entregue igual, sin pisar el trabajo de otro asistente.

Si en la conversación hay un `CLAUDE.md` del proyecto, ese manda: tiene el detalle completo (datos, módulos, dominio técnico). Esta skill es el resumen que no puede faltar.

## Con quién hablás
- **Ángel** (Miguel Ángel Díaz, EMA Servicios). Trabaja en obra y lee desde el celular.
- Hablale en **español rioplatense, simple y directo**. Primero la respuesta, después el detalle. Respuestas cortas.
- Escribe rápido y con errores de tipeo: interpretá la intención.
- No le muestres rutas internas ni jerga de programación. Decí «la app», «GitHub», «tu carpeta», «las reglas de Firebase».

## Diseño: la regla de oro
**Usá las piezas que la app ya tiene, no inventes estilos nuevos.**

La app trae sus clases y variables de color (tema `<style id="temaCristal">`). Si una pantalla nueva usa `.card`, `.btn-primary`, `.chip`, `.subtabs` y `var(--navy)`, sale igual al resto. Si además se actualiza el tema, la pantalla nueva cambia sola junto con todo lo demás. Cuando hagas estilos propios con colores fijos, la pantalla se despega del resto de la app.

Resumen rápido (el detalle, con el CSS de cada pieza, está en `references/diseno-cristal.md`; leelo antes de armar o retocar una pantalla):

| Qué | Cómo |
|---|---|
| Color principal | `var(--navy)` **#28285E**: botones principales, lo activo, títulos de la barra |
| Segundo azul | `var(--navy-2)` #3D3F8A (degradé del botón principal) |
| Celeste del logo | `var(--teal)` **#84C3DA**: solo detalles, **nunca botones** |
| Fondo | `#ECEFF7` con manchas celestes suaves (ya lo pone la app) |
| Texto | `var(--text)` #0D1424 · `var(--text-soft)` #4B5670 · `var(--text-3)` #7C879D |
| Estados | `var(--verde)` #34C759 bien · `var(--amber)` #FF9F0A atención · `var(--danger)` #FF3B30 error |
| Letras | `var(--fuente)` Inter (texto 14,5 px; 15–16 px en el celular) · `var(--disp)` títulos 700–800 · `var(--mono)` JetBrains Mono para números, códigos y encabezados de tabla |
| Tarjeta | `.card`: vidrio blanco 70 %, borde blanco, radio 24 px, sombra suave |
| Botones | `.btn-primary` píldora azul con degradé · `.btn-ghost` píldora blanca con texto azul · mínimo 44 px de alto |
| Pestañas | `.subtabs` > `.subtab` (`.activo` = blanca sobre gris) |
| Chips | `.chip` (`.activo` = azul con texto blanco) |
| Avisos | `#avisoApp` / la función de aviso de la app. **Nunca `alert()`** |
| Números | formato argentino: `1.050,00` · `$ 1.050,00` · `120 m` · `9 Un.` · `01/10/2026` |

**Celular (≤ 640 px):** una columna; todo lo tocable de 44 px o más; inputs de 16 px (así el celular no hace zoom); tablas → `.tabla-tarjetas`; **nunca scroll de costado**. En una pantalla de trabajo de campo, lo que se usa con el dedo (botón grande, dato en vivo) va **arriba**.

**Impresión:** hoja A4 blanca por `hojaEMA.abrir(titulo, html)`, logo con `<img class="logo-impreso">`, sin menú ni botones, firmas o cajetín al pie.

**Textos:** rioplatense de obra («Sacar foto», «Hacer vale de salida», «Marcar punto acá»). Nombres de plaza en MAYÚSCULAS como el pliego, con «ID 4026». Sin modo oscuro.

**Material de venta o demos:** marca neutra. Sin «EMA», «EPEC», «licitación», «Municipalidad», nombres reales de plazas ni precios.

## Forma de trabajar (resumen)
El detalle está en `references/forma-de-trabajo.md`. Leelo antes de armar o entregar una versión.

1. **Se edita el ORIGINAL** (`NNN_AAAA-MM-DD_app-EMA_ORIGINAL.html`, legible). El `index.html` es un derivado: no se edita a mano, sale de `node compactar80.js ORIGINAL index.html` (esbuild, compatible con Chrome 80).
2. **Parche verificable** (`patch_vNNN.py`): chequea la huella del ORIGINAL de entrada y hace reemplazos exactos que cortan si no calzan. Lo nuevo va **antes de `<script id="revisarAppDiag">`**.
3. **Dos marcas de versión con el mismo valor:** `#appVersion` (`· v AAAA-MM-DD HH:MM · hash6`) y `<meta name="ema-version" content="AAAA-MM-DD HH:MM · hash6">`. Si cambia una sola, a nadie le aparece «Hay una versión nueva».
4. **Un número de versión por vez**, y siempre sobre el último ORIGINAL. Ángel trabaja también con **SALEM** (chat de Claude). Antes de arrancar, confirmá cuál es el último ORIGINAL. Al terminar, devolvé el ORIGINAL nuevo además del index. Si no, una versión pisa a la otra.
5. **Probar antes de entregar:** la prueba nueva `t_vNNN.js` y la batería completa, en PC (1280×860) y en celular (390×844). Si algo falla, se arregla o se dice.
6. **Firebase:** si hace falta una colección o un permiso nuevo, se entregan las reglas completas (`Reglas_Firestore_vNNN.txt`), la app avisa si faltan, y Ángel las publica a mano.
7. **Entrega:** ORIGINAL + `index.html` + huellas SHA-256 + `CHANGELOG`. Decile en 1–2 líneas qué cambió y **qué tiene que hacer él**: subir el index, publicar las reglas, o armar el APK si cambió algo nativo.

## Lo que no se rompe
- **Datos de Firestore:** nunca cambiar ni borrar datos de usuarios sin preguntarle a Ángel. Los arreglos de datos van con un botón y confirmación.
- **Códigos del pañol:** `x001–x499` son del Excel y de las altas del equipo; `x500–x999` son los que trae la app. Un código usado no se reutiliza. **No inventes códigos.**
- **No inventes datos técnicos** (medidas, ítems, coeficientes, normas). Lo que no está en un documento va marcado **«a confirmar»**.
- **Hacé solo lo que se pidió.** Si ves algo para mejorar, avisá en vez de cambiarlo «de paso».
- **Nada de secretos** en la app, el repo, los archivos o el chat (claves de Cloudflare, cuenta de servicio de Firebase, VAPID privada). Si Ángel pega una clave, no la repitas y recomendale cambiarla.
- **La cuadrilla primero:** sus celulares son viejos (Chrome 80) y con poca señal. Lo pesado que no usa la cuadrilla se carga recién cuando hace falta (ver «código dormido» en `references/forma-de-trabajo.md`).
