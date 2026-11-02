# Catastro de Córdoba en la app (desde v095)

## Qué es
El catastro de la ciudad de fondo en **Proyectista**: en el mapa, en el plano, en el plano impreso, en la memoria y en el DXF. También sirve para el botón «🌳 Traer el borde de la plaza».

- **Fuente:** DXF «Catastro_CBA_*_v6» (NE, NO, SE, SO), que Ángel armó con el otro chat el 02/11/2026, y `Plazas_CBA_*.geojson`, con 1.156 plazas.
- **Coordenadas:**
  - El DXF viene en Gauss-Krüger **POSGAR 94** faja 4 (EPSG:22174). Se controló contra el GeoJSON de plazas y coincide al milímetro.
  - La app trabaja en **POSGAR 2007** (EPSG:5346), igual que el GPS. Se le suman **+0,162 m al este y +0,610 m al norte**: es lo que da PROJ, constante en toda la ciudad.

## Dónde está
Carpeta `catastro/v6/` en GitHub, junto al `index.html`. En total son 56 archivos y unos 55 MB (15 MB comprimidos):
- `indice.json`: versión, tamaños y lista de bloques.
- `b_<bx>_<by>.json`: 54 bloques de 4 km × 4 km.
  - Cada bloque trae pedacitos de 250 m (`"i_j"`).
  - `bx = floor(x / 4000)` y `i = floor(x / 250)`, con x/y en GK POSGAR 2007 faja 4.
- `plazas.json`: contornos de las plazas en GK 2007 (cm), simplificados a 0,2 m; `n` nombre; `e` estado (`v` verificada, `a` aproximada, `x` edificada / no es plaza).

**Formato de cada pedacito:** coordenadas en centímetros, contadas desde la esquina del pedacito; cada línea es una lista plana `[x, y, x, y…]`.
- Clases de líneas:
  - `m` manzana · `p` parcela · `b` baldío;
  - `e` eje de calle · `a` avenida o autopista;
  - `v` plaza · `l` límite de barrio · `f` vías del tren.
- Textos `t`: `[clase, x, y, giro°, texto]`. Clases: `c` calle · `v` plaza · `b` barrio · `m` manzana · `a` ancho de calle · `p` parcela.

**Cómo se usa en la app:**
- Se baja solo el bloque que se está mirando.
- El `sw.js` lo guarda, así después se ve sin señal.
- En el APK se pide a GitHub Pages, igual que la app.

## Cómo se regenera (si hay catastro nuevo)
1. `python docs/armar_catastro.py <carpeta con los 4 DXF> <salida> 250`. Usa ezdxf y shapely; deja `todo.json` con todos los pedacitos.
2. `python docs/armar_bloques.py <salida>/todo.json <carpeta con Plazas_CBA_*.geojson> catastro/v6`: arma los bloques de 4 km, `plazas.json` e `indice.json`. Usa pyproj y shapely.
3. Si cambia el formato, subir el número de versión: carpeta `catastro/v7/` y la ruta en Proyectista (`catBase`).
