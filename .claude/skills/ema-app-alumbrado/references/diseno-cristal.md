# Diseño «Cristal» — guía para pantallas nuevas

El tema salió de la skill UI UX Pro Max (receta «Operaciones / Legible / Industrial») y se pulió con Impeccable. Vive en `<style id="temaCristal">` dentro de la app. Lo que sigue son los valores **reales** del código (v089). Si el código cambia, manda el código.

## Índice
1. Variables (colores, letras, sombras)
2. Piezas que ya existen (usalas tal cual)
3. Pantalla nueva: esqueleto recomendado
4. Ventanas a pantalla completa (overlays)
5. Celular
6. Impresión / PDF
7. Gráficos, mapas y planos
8. Errores comunes

---

## 1. Variables (`:root` del tema)

| Variable | Valor | Para qué |
|---|---|---|
| `--navy` | `#28285e` | color de la marca: botón principal, activo, títulos |
| `--navy-dark` | `#1c1c45` | sombras y fondos oscuros (velos) |
| `--navy-2` | `#1f5f86` (v144; antes `#3d3f8a`) | segundo tono del degradé del botón principal (navy → azul petróleo) |
| `--teal` | `#89c2db` (v144; antes `#84c3da`) | turquesa del logo: **solo detalles** (líneas, íconos, marcas chicas, arco del anillo). **Nunca con letra blanca encima** (no da contraste) |
| (sin variable) | `#1e6f91` | turquesa hondo (v144): acentos de las tarjetas del Inicio (eyebrow, links «Ver todo», íconos), barras de avance |
| `--bg` | `#eaf2f7` (v144; antes `#eceff7`) | fondo general |
| `--card` / `--vidrio` | `rgba(255,255,255,.7)` | tarjetas de vidrio |
| `--vidrio-2` / `--panel` | `rgba(255,255,255,.55)` | vidrio más transparente |
| `--canto` | `rgba(255,255,255,.8)` | borde de las tarjetas |
| `--border` / `--line` | `rgba(40,40,94,.1)` | separadores |
| `--bg-soft` | `rgba(40,40,94,.04)` | fondos suaves de bloques |
| `--text` | `#0d1424` | texto |
| `--text-soft` | `#475569` (v144; antes `#4b5670`) | texto secundario, etiquetas |
| `--text-3` | `#6e7c93` (v144; antes `#7c879d`) | ayudas, encabezados de tabla |
| `--verde` | `#34c759` | bien, hecho, en línea |
| `--amber` | `#ff9f0a` | atención, pendiente |
| `--danger` | `#ff3b30` | error, sin stock, borrar |
| `--ring` | `rgba(40,40,94,.18)` | anillo de foco |
| `--radius` | `24px` | radio de tarjetas |
| `--sombra-sm` | `0 1px 2px rgba(40,40,94,.06)` | |
| `--sombra-md` | `0 18px 44px -26px rgba(40,40,94,.45), inset 0 1px 0 rgba(255,255,255,.9)` | sombra de tarjeta |
| `--fuente` | `"Plus Jakarta Sans",-apple-system,"Segoe UI",Roboto,Arial,sans-serif` (v144; antes Inter) | texto (14,5 px; 15 px en el celular) |
| `--disp` | `"Plus Jakarta Sans",…` (v144; antes Inter Display) | títulos (700–800, `letter-spacing: -.02em`; el saludo grande de la portada en 400) |
| `--mono` | `"JetBrains Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace` | números, códigos, encabezados de tabla (`font-variant-numeric: tabular-nums`) |

Fondo: `html` en `#eaf2f7` y, por detrás, manchas radiales turquesa claro (`#bfe0ee`, `#d5e3f2`, `#c9dff0`) quietas (v144). Ya lo pone la app: una pantalla nueva no lo repite.

**Estilo «V1 · Turquesa del logo» (v144, elegido por Ángel el 10/11/2026)** — `<style id="estiloV1Css">`, después de todo el resto:
- **Portadas** (Inicio Ejecutivo `#iniEje .ie-hero` y el «Hoy» de la cuadrilla `.cd-hh` / `.cd-hero`): degradé `158deg` `#17173D → #222459 → #1F4C78 → #1F6F91` con un brillo turquesa `rgba(137,194,219,.42)` arriba a la derecha; franja del reloj del celu `#17173D`. El Inicio del pañolero no tiene portada: lleva los mismos acentos `#1E6F91`.
- **Botones principales** siguen navy (degradé `#28285E → #1F5F86`, contraste AA con letra blanca).
- **Letras incrustadas** en la app (andan sin internet, `font-display: swap`): Plus Jakarta Sans 300–800 y JetBrains Mono 400–700, woff2 latín en base64 (≈ 58 KB). A Google Fonts solo se le pide Inter, para el sello de las fotos (que no cambia) y las hojas A4 que se abren aparte.
- Plus Jakarta es más ancha que Inter: en el celu el título de la barra va en 13,5 px y sin partirse.

Dentro de un **SVG** (planos, láminas, íconos) poné los colores con su valor real (`#28285e`), no con `var(--navy)`: dentro del mapa y al imprimir las variables no siempre llegan.

## 2. Piezas que ya existen

Todas con `!important` en el tema: con poner la clase, la pieza ya sale con el estilo. No hace falta CSS propio.

- **Tarjeta `.card`**: vidrio 70 %, borde `--canto`, radio 24 px, `--sombra-md`, padding `20px 22px 22px` (`18px 16px` en el celular). Entre tarjetas, 16 px.
  - `.card h2`: título en `--disp`, 17 px, 700. Debajo, `.h2-sub` (13 px, `--text-soft`).
  - `.card label`: 13 px, 600, `--text-soft`.
  - `.hint`: ayuda en `--text-3`.
- **Indicador `.tile`** con `.num` (800 28 px `--disp`) y `.lbl` (12,5 px): para totales arriba de una hoja.
- **Botón principal `.btn-primary`**: píldora (`border-radius: 999px`), degradé `135deg` de `--navy` a `--navy-2`, texto blanco 700, `min-height: 44px`, sombra azul. Deshabilitado: `#28285e2e`. Hay **uno por bloque**: la acción principal.
- **Botón secundario `.btn-ghost`**: píldora blanca (`#ffffffb8`), borde fino, texto `--navy` 600.
- **Campos** (`input`, `select`, `textarea`): fondo `#ffffffc7`, borde `rgba(40,40,94,.12)`, radio 14 px, alto mínimo 46 px (48 px y letra de 16 px en el celular). En foco: borde `--navy` y anillo `--ring` de 4 px.
- **Pestañas**: `.subtabs` (riel gris `#28285e12`, píldora, deslizable de costado sin barra) con `.subtab` dentro. La activa lleva `.activo`: blanca, texto `--text` y sombra suave.
- **Chips `.chip`**: filtros y opciones; `.activo` = fondo `--navy` y texto blanco.
- **Interruptor `label.switch`**: 50×30, prendido en `--navy`.
- **Tablas**: números con `tabular-nums`; `thead th` en `--mono` 11 px mayúsculas `--text-3` sobre `#28285e0d`; filas sin rayado, separador `rgba(40,40,94,.07)`. En el celular pasan a tarjetas con `.tabla-tarjetas`.
- **Títulos de sección `.section-title`**: `--mono` 11,5 px, fondo `#28285e0f`, radio 12 px.
- **Alertas suaves**: ámbar (`#ff9f0a1a` de fondo, borde `rgba(255,159,10,.28)`, texto `#6b3a00`, radio 16 px).
- **Avisos al usuario**: `#avisoApp` (hoja blanca que sube desde abajo, radio 26 px, botón píldora). **No uses `alert()`**. `confirm()` se tolera solo para borrar algo.
- **Al tocar**: botones y chips se achican a `scale(.96)`. Ya está en el tema.
- **Menú lateral**: los renglones son `.menu-item` con `<span class="menu-ico">`. Los agregados se insertan como el de Cámara: ver `#menuCamara` y `#menuProyectista`. Los bloques nuevos del menú necesitan `flex: none`, porque si no se aplastan.

## 3. Pantalla nueva: esqueleto recomendado

```html
<div class="wrap" id="viewNueva" style="display:none">
  <div class="subtabs"><button class="subtab activo">Vista 1</button><button class="subtab">Vista 2</button></div>
  <div class="card">
    <h2>Título <span class="h2-sub">aclaración corta</span></h2>
    <label for="x">Dato</label><input id="x" type="text" placeholder="ej. …">
    <div class="hint">Ayuda en una línea.</div>
    <button class="btn-primary">Acción principal</button> <button class="btn-ghost">Otra</button>
  </div>
</div>
```

Si necesitás un estilo propio, ponelo en un `<style id="xxxCss">` y **armalo con las variables** (`var(--navy)`, `var(--text-soft)`, `var(--mono)`, `var(--canto)`…). No copies colores sueltos.

## 4. Ventanas a pantalla completa (overlays)

Ejemplos que ya existen: la cámara, la hoja de impresión y Proyectista.
- Barra superior en `--navy` con texto blanco, botón «‹ volver» a la izquierda y «✕» a la derecha. Botones de 44 px, fondo `rgba(255,255,255,.14)`, radio 12 px. Respetá `env(safe-area-inset-top)`.
- Cuerpo con fondo `--bg`, y adentro tarjetas `.card` y botones de la app.
- Posición fija con `top:0;left:0;right:0;bottom:0`, no `inset:0`, que en Chrome 80 no anda sin respaldo. Orden de capas: por debajo de la hoja de impresión (`#hojaOv` 10075) y de `#avisoApp`.

## 5. Celular (≤ 640 px)
- Una columna. Todo lo que se toca mide 44 px o más.
- Inputs de 16 px: con menos, el celular hace zoom solo.
- Nunca scroll de costado. Las tablas pasan a tarjetas.
- En pantallas de campo (cuadrilla, relevamiento), **arriba va lo que se usa con el dedo**: el dato en vivo y el botón grande de acción. Mapa y listas abajo. Configuración y «borrar» al final.
- Contraste alto y letra grande: se usa al sol.
- Celulares viejos (Chrome 80): nada de `:has()` en JS, `inset:` sin respaldo, `||=`/`??=` en código que no pase por esbuild, ni APIs nuevas sin chequear.

## 6. Impresión / PDF
- Toda impresión va por `hojaEMA.abrir(titulo, htmlCompleto)`: abre la hoja A4 con «Imprimir / Compartir PDF / Bajar PDF».
- Fondo blanco, `@page { size: A4; margin: 10–12mm }`. Logo con `<img class="logo-impreso">` (no como fondo CSS). Sin menú, botones ni versión.
- Tablas con borde fino `#d5dae8` y encabezado `#eef1f6`. Firmas o cajetín al pie: «EMA Servicios · …», fecha y quién.

## 7. Gráficos, mapas y planos
- **Mapa:** Leaflet con satélite (Esri) o calles (OSM).
  - Pines de obra por avance: gris sin empezar, rojo < 30 %, amarillo 30–59 %, azul 60–99 %, verde 100 %.
  - Etiquetas: fondo `--navy` con texto blanco. Cotas: fondo crema `#fff8e1` con borde ámbar.
- **Planos y láminas (SVG):** líneas `#28285e`, cotas en naranja oscuro `#b45309`, fondo blanco y grilla `#eef1f6`. Siempre con escala gráfica y norte.
- **Colores por tipo de elemento** (Proyectista):
  - columna nueva `#2563eb`;
  - columna existente `#7c879d`;
  - tablero `#d97706`;
  - acometida `#7c3aed`;
  - cámara `#0d9488`;
  - cruce `#dc2626`;
  - otro `#28285e`.
  - borde de la plaza `#0891b2` (línea punteada).
  - mapa de luz: rojo `#ff3b30` debajo del mínimo · naranja `#ff9f0a` debajo del promedio · verde `#34c759` bien · amarillo `#ffd60a` de más.

  Si aparece un tipo nuevo, mantené estos colores y sumale uno distinto.

## 8. Errores comunes
- Crear `.mi-boton { background:#2a2a60 }` en vez de usar `.btn-primary` → queda casi igual, pero no igual.
- Usar el celeste `--teal` para un botón → regla de la marca: solo detalles.
- Usar `alert()`, o dejar textos en inglés o neutros («Submit», «Ingrese») → usá rioplatense de obra («Guardar», «Poné el nombre»).
- Hacer una tabla ancha en el celular → scroll de costado.
- Poner números sin formato argentino (`1050.5` en vez de `1.050,50`).
