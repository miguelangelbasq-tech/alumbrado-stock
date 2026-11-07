# Encargo: hojas de planos técnicos EMA (tipos constructivos)

Sos un dibujante técnico. Armás hojas de plano para la app de alumbrado público de EMA (Córdoba), en el estilo que Ángel ya aprobó.

## Leé primero (obligatorio)
- `/home/user/alumbrado-stock/.claude/skills/planos-tecnicos-ema/SKILL.md`: las reglas del estilo.
- `/home/user/alumbrado-stock/.claude/skills/planos-tecnicos-ema/scripts/planokit.py`: el kit de dibujo. Copialo o importalo desde `SCR` (ver abajo); no lo modifiques.
- Los ejemplos aprobados. Mirá las PNG con Read y los .py para copiar la forma de trabajar:
  - `/home/user/alumbrado-stock/.claude/skills/planos-tecnicos-ema/ejemplos/ap_tc_001.png` y `.py`;
  - `ap_tc_002.png` y `.py`;
  - `ap_tc_003a.png` y `.py` (este es el más completo).
- `/home/user/alumbrado-stock/CLAUDE.md` §11 (dominio técnico, reglas acordadas con Ángel) y `/home/user/alumbrado-stock/docs/REVISION_TIPOS_CONSTRUCTIVOS.md` (errores conocidos en las fichas: no los repitas).

## De dónde salen los datos (no se inventa NADA)
Fuente: el ORIGINAL de la app, `/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v130/130_2026-11-07_app-EMA_ORIGINAL.html` (5,8 MB). **No lo leas entero**: usá grep y sed con rangos chicos.

- **Fichas de Normas.** Están en las líneas 29199–29208, cada una como `s({ id: "AP-…", … datos: [...], ojo: …, rel: […] })`. Para sacar una:
  ```
  sed -n 29199,29208p ORIGINAL | python3 -c "import sys,re;t=sys.stdin.read();m=re.search(r's\(\{ id: \"ID\".*?\}\)',t,re.S);print(re.sub(r'<[^>]+>','',m.group(0)))"
  ```
- **Dibujos actuales de la app** (gris, simples; sirven de referencia de qué piezas lleva cada plano, no de medidas): `window.TIPOS_CONST_DIB`, en el IIFE de las líneas 45712–45797, más 5 extras en 46865–46866.
- **Constantes de la calculadora**, con grep: `CRUCE_AP_TC_002`, `TABLERO_NIVEL`, `BPN_COL_DEF`, `ESQUEMA_TIERRA`, `PAT_CABLE_*`, `CABLE_SUBIDA_*`, `FUNDACION`, etc.
- **Fichas técnicas de materiales:** `FICHAS_TEC` (L45904–46860), que tiene medidas de piezas (morsetos, borneras, cajas…). Los códigos del pañol figuran en las fichas (`codigos`).
- **Si un dato no está:** dibujalo razonable pero **en naranja con (*)** y anotalo en NOTAS como «a confirmar con el plano oficial». Si el pliego y el plano se contradicen, va en las notas.
- **Códigos del pañol:** usá solo los que aparecen en la app para esa pieza; si no, «A VINCULAR».

## Qué tiene que tener cada hoja (1680×1188)
- **Izquierda, estilo AutoCAD en blanco y negro:**
  - el corte principal acotado, que pase **justo por lo importante** (Ángel lo pidió así: en la fundación, el corte va por el medio de la acometida y se marca en la planta);
  - una segunda vista: corte B–B o planta, con las líneas de corte A–A y B–B marcadas en las otras vistas;
  - detalles ampliados de las piezas clave (D1, D2…), dibujando las **piezas reales**: cables con sus conductores de color y la cuerda de hilos, borneras de a una, ladrillos de a uno, bulones, morsetos;
  - **cómputo** por unidad o por metro, con el cálculo a la vista;
  - rayados y notas.
- **Derecha:**
  - **3D en corte escalonado o a un cuarto**, a color, con globos que repiten los números del plano;
  - debajo, la **lista de materiales** (pos., descripción, cantidad, código);
  - el **rótulo** (plano, título, escalas, rev. A, fecha 07/11/2026).
- **Cuidá los detalles:** nada se pisa (globos, textos, cotas, el 3D contra la lista), todo dentro del marco, cotas legibles y coherentes entre vistas.

## Cómo trabajar
- **Carpeta de trabajo** (SCR): `/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/hojas/`. Ahí ya están `planokit.py` y `shot.js`.
- **Un script por plano**, `ap_xx_nnn.py` (en minúsculas, guiones bajos), que genera `ap_xx_nnn.svg`.
- **Render:**
  ```
  cd SCR && NODE_PATH=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/node_modules:$(npm root -g) node shot.js ap_xx_nnn
  ```
  Genera la `.png`.
- **Mirá la PNG con Read y corregí hasta que esté limpia**: mínimo 2 pasadas.
- **No toques** la app, el repo, ni los scripts de otros planos. No hagas commits.

## Qué devolvés (informe final, corto)
Por cada plano:
- la ruta de la PNG;
- 1 línea de qué muestra;
- la lista de datos «a confirmar»;
- de dónde sacaste cada medida (ficha / constante / CLAUDE.md).
