# Encargo: hojas de MATERIALES (ficha técnica con plano + 3D)

Leé primero **todo** `/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/hojas/BRIEF.md`: el estilo, las reglas de Ángel, de dónde salen los datos y cómo renderizar. Este encargo es igual, pero para **materiales del pañol**.

## Qué es una hoja de material
**Una hoja por pieza** (1680×1188), con la misma estructura que los tipos constructivos.

**Izquierda, plano estilo AutoCAD:**
- vistas de la pieza (frente, lateral o planta, y un corte si tiene interior), **acotadas en mm**;
- un detalle ampliado de lo importante (rosca, borne, conductor, contacto, marca…);
- **tabla de variantes / códigos del pañol:** TODOS los códigos de esa pieza, con código · descripción · unidad (sacalos del catálogo);
- **datos técnicos**: norma, material, sección, corriente, IP, etc.;
- **dónde se usa**: qué tipo constructivo (AP-…) o qué guía la usa, y para qué;
- notas.

**Derecha:**
- **3D de la pieza**, fiel en material, color y textura: bronce, galvanizado, PVC, PRFV RAL 7043, policarbonato, cobre, aislaciones de colores…;
- si sirve, la pieza **puesta en su lugar** (ej. el morseto sobre el cable, la bornera en el riel), con globos;
- el **rótulo**: en vez de «PLANO TIPO», poné el código de la ficha `MAT-<familia>-<n>`, y como título el nombre de la pieza.

## Datos (no se inventa nada)
- **Familias:** `window.FAMILIAS_MAT` (L45682–45711 y L46838–46839 del ORIGINAL). Campos `{id, titulo, guia, codigos[], datos[]}`.
- **Piezas:** `window.FICHAS_TEC[famId] = {intro, piezas[{tit, codigos, desc, render(), plano(), tabla, fuente}]}` (L45904–46860). El `plano()` actual tiene medidas en sus textos y cotas: **usalas**. La `tabla` y la `fuente` también.
- **Catálogo del pañol:** `/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/hojas/mat/catalogo.json` (lista de [codigo, desc, un]).
- Si una medida no está en la ficha, en la tabla ni en la descripción del catálogo, va **naranja con (*)** y en NOTAS «a confirmar con el fabricante».
- Si hace falta, podés buscar en la web la ficha del fabricante para medidas típicas, pero marcalas «(*) típica según fabricante X» y poné la fuente en NOTAS. **Nunca inventes códigos.**

## Dónde y cómo
- Carpeta: `/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/hojas/mat/`. Ahí ya están `planokit.py`, `shot.js` y `catalogo.json`.
- **Un script por pieza:** `mat_<familia>_<n>.py` → `.svg` → `.png`.
  ```
  cd mat && NODE_PATH=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/node_modules:$(npm root -g) node shot.js mat_x_1
  ```
- **Mirá cada PNG con Read y corregí** hasta que esté limpia: nada pisado, todo dentro del marco, materiales que se distinguen.
- Si una familia tiene muchas piezas muy parecidas (ej. fusibles 2 A / 4 A), podés juntarlas en una hoja con una tabla de variantes. **Pero cada código tiene que aparecer en alguna hoja.**

## Qué devolvés (informe corto)
- Por cada hoja: la ruta de la PNG, la pieza, los códigos que cubre y los datos «a confirmar».
- Al final, la **lista de códigos de tus familias que NO quedaron en ninguna hoja**: tiene que estar vacía, o explicá por qué.
