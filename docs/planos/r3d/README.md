# r3d · kit de render 3D «de catálogo» para las fichas de materiales EMA

El kit arma las piezas con three.js, con geometría real y materiales PBR, y saca un PNG grande. También guarda un JSON con las **anclas proyectadas**, para que los globos del SVG apunten exacto.
El plano y el 3D usan **los mismos perfiles** (`piezas/perfiles.mjs`).

## Archivos
| Archivo | Qué es |
|---|---|
| `r3dkit.js` | Lanzador (Node): levanta un servidor local y Chromium headless con WebGL (SwiftShader), corre la escena y guarda `salida.png` + `salida.png.json` (anclas, tiempo) |
| `lib/r3d.mjs` | Librería del navegador: luz de estudio de 3 puntos + reflejos (RoomEnvironment/PMREM), sombra suave al piso, encuadre automático, supersampling, bordes técnicos, materiales, primitivas, CSG |
| `piezas/perfiles.mjs` | **Única fuente** de la geometría 2D (mm): BPN, NS35, PEINE, SEPARADOR, TOPE, TAB/BASE831 (`portaFus()`), fusibles, NEOZED, B520 |
| `piezas/bpn.mjs`, `piezas/fusibles.mjs` | Modelos: `riel`, `borne`, `peine`, `separador`, `tapa`, `tope`, `cable` · `fusible`, `portafusible`, `rielModular`, `neozed`, `borne520` |
| `escenas/*.mjs` | Una escena por render (piezas + cámara + anclas) |
| `exportar_perfiles.mjs` | Escribe `perfiles.json` (perfiles + secciones por el plano medio, calculadas con polygon-clipping) para las hojas Python |
| `render_todo.js` | Renderiza todas las escenas piloto y muestra el tiempo de cada una |
| `FUENTES.md` | De dónde sale cada medida |

Hojas: `../hojas/mat/fichakit.py` (vistas con los perfiles, rayados, `img3d` + `globo3d` / `columna`) y `fuskit.py` (vistas del portafusible y de los fusibles).

## Correr
```
cd r3d
node exportar_perfiles.mjs                  # si cambiaste perfiles.mjs
node render_todo.js                         # o: node r3dkit.js escenas/bpn_fila.mjs out/bpn_fila.png 2400 2000 2
cd ../hojas/mat && bash r.sh mat_borneras_1 # arma el SVG y lo pasa a PNG (2520 × 1782)
```
Dependencias, ya instaladas en `node_modules`: three 0.160, three-bvh-csg 0.0.17, three-mesh-bvh 0.7.8 y polygon-clipping 0.15.7. Playwright viene del global.

## Agregar una pieza nueva (receta)
1. **Perfil** en `piezas/perfiles.mjs`: contorno `[(y, z)…]` en mm, con las cavidades y las piezas metálicas como polígonos. Las medidas que no salen de una ficha llevan el comentario «AC» (a confirmar).
2. **Modelo** en `piezas/<familia>.mjs`: `export function pieza(R, x0, op)`. Se arma con:
   - `R.perfil(contorno, cavidades, ancho, mat, {a0, bevel, A, B, C, o, padre})`: extruye el perfil (con bisel) a lo largo de x, o de cualquier eje con A/B/C;
   - `R.cil(p0, p1, r, mat)`, `R.torno(p0, p1, [[r, t]…], mat)` (pieza de revolución), `R.caja(x0, x1, y0, y1, z0, z1, mat, {r})`;
   - `R.tornillo(p, dir, {M, L, dk, k, tipo: 'ranura'|'pozi'|'combi'})`;
   - `R.texto('BPN-6', o, u, v, mat, {size, prof})` (relieve), `R.impreso([líneas], w, h, o, u, v)`, `R.impresoCil([líneas], p0, p1, r, arco, ang, {px})`;
   - `R.restarCSG(a, b, matCorte)` para agujeros redondos; `R.cortar(grupo, [x0, x1, y0, y1, z0, z1])` para el corte a cuarto. La cara cortada toma el color del material: usar `R.tipoCorte(mat, 'metal'|'plastico'|'ceramica'|'arena')`.
3. **Materiales** (`R.M`): `pa(color)` poliamida mate y rugosa · `pvc` · `latonNiq` · `laton` · `cobre` · `cobreEst` · `aceroCinc` · `acero` · `plata` · `estano` · `ceramica` · `arena` · `vidrio` · `lente` · `cable(color)` · `goma`. Colores en `R.PAL`.
   La textura es ruido procedural en coordenadas de mundo: es la misma en cualquier geometría y no necesita UV.
4. **Escena** `escenas/<hoja>.mjs`: `export default function (R) { R.vista({az, el, fov, margen}); …piezas…; R.ancla('nombre', [x, y, z]) }`.
   - z es para arriba. `az` (grados) es desde dónde mira la cámara: con 0 mira desde −y; con 90, desde +x; con 180, desde +y; con −146, desde −x +y.
   - Opcional: `R.config({sombra, bordes, exposicion, piso})`.
5. **Hoja** `hojas/mat/<hoja>.py`:
   - `from fichakit import *` · `PERF = perfiles.json`;
   - `Vista(h, ox, oy, e)` dibuja con los mismos puntos (`seccion`, `poly`, `cotaH`/`cotaV`, `eje`, `oculta`);
   - `A = img3d(h, 'nombre', x, y, w)` y `columna(h, A, [(ancla, n°, texto)…], x, y0, y1)` ponen los globos. Se ordenan solos por altura.
6. Mirar el PNG completo y a recortes, corregir y repetir.

## Tiempos (máquina de la nube, SwiftShader por CPU, 2400 px de ancho y supersampling 2×)
| Render | Tiempo |
|---|---|
| bpn_fila (8 bornes, peine, cables, CSG) | 31 s |
| tab_par | 16 s |
| fus10x38 | 12 s |
| base_borne | 14 s |
| fus_chicos | 9 s |
| bpn_peine | 6 s |

Casi todo el tiempo se va en el CSG (agujeros y cortes) y en el render de 4800 px. Para una prueba rápida: `ss = 1` y 1200 px (unos 3 a 5 s).

## Trampas
- Las caras de corte y los agujeros salen de CSG (three-bvh-csg). Esas mallas no llevan bordes técnicos, porque el CSG deja aristas en T.
- Una base de ejes espejada se corrige sola: `R.perfil` invierte los triángulos si el determinante es negativo.
- `R.texto` mira hacia `u × v`: para una cara +y usar `u = [-1, 0, 0]`, `v = [0, 0, 1]`.
- Si un ancla sale `null` en el JSON, es que se calculó con un índice o variable inexistente en la escena.
- Las hojas cargan el PNG por ruta relativa (`../../r3d/out/…`). Para mandar el SVG suelto, hay que pasar la imagen a base64.
