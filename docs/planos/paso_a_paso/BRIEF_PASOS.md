# Encargo: PDF «paso a paso» de las guías de «Cómo se hace»

Leé primero:
- `/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/hojas/BRIEF.md`: el estilo, las reglas de Ángel, cómo sacar datos del ORIGINAL y cómo renderizar.
- En `/home/user/alumbrado-stock/.claude/skills/planos-tecnicos-ema/SKILL.md`, la sección **«Formato paso a paso»**.

El ejemplo aprobado está en `/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/pasos/`:
- `fund_prfv.py` (generador);
- `p1.png` a `p4.png` (páginas);
- `pdf.js` (arma el PDF);
- `fundacion_prfv_paso_a_paso.pdf`.

Mirá las 4 PNG con Read y copiá la estructura de `fund_prfv.py` (pagina, panel, escena 3D, plano al lado).

## Qué hacer
Por cada guía que te toque, un PDF A4 apaisado: 2 pasos por hoja.
- **Hoja 1:** «Antes de empezar» (EPP, autorización, herramientas, materiales con código) y paso 1.
- **Última hoja:** «Así queda», con el 3D del tipo constructivo terminado si ya existe una hoja en `../hojas/` (recortá su 3D de la PNG con PIL), y qué guía sigue.

**Cada paso lleva:**
- número y título con verbo;
- **3D del momento exacto** de ese paso, con materiales y colores reales según el kit (`planokit`: `soil3`, `conc3`, `prfv`, `galv`, `pead`, `pvc`, `cobre`, `bronce`, `foam3`, `lad3`, `mesh`…);
- **al lado, su plano** en blanco y negro, acotado;
- viñetas cortas;
- ⚠ OJO y ✓ CONTROL.

**Cables:** se ven entrar y conectarse, con su color de fase (L1 marrón, L2 negro, L3 rojo, N celeste, PE verde-amarillo) y la cuerda de hilos.

## De dónde sale el texto
Lo sacás de la guía de la app: `window.GUIAS_OBRA`, en el ORIGINAL, L45617–45680 más 2 de barrio en L46861–46862.

Para extraer una guía:
```
sed -n 45617,45680p ORIGINAL | python3 -c "import sys,re;t=sys.stdin.read();i=t.find('id: \"ID\"');j=t.find('pendientes',i);seg=t[i:j+600];[print('PASO:',m.group(1),'|',re.sub(r'<[^>]+>','',m.group(2))) for m in re.finditer(r'\{ t: \"([^\"]+)\", txt: \[(.*?)\]',seg,re.S)];print(re.sub(r'<[^>]+>','',seg[:1500]))"
```
(Para las de barrio, el rango es 46855–46866.)

- **Respetá los pasos de la guía** (título y texto). Podés partir un paso largo en dos si se entiende mejor.
- **Medidas:** de los planos (`NORMAS_FICHAS`) y de CLAUDE.md §11.
- **Lo que falta:** «(*) a confirmar»; los «pendientes» de la guía también van así.

## Archivos
- Carpeta: `/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/pasos/`.
- **Generador:** `guia_<id>.py`. Escribe `<id>_p1.svg`, `<id>_p2.svg`…
- **PDF:** `NODE_PATH=/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/node_modules:$(npm root -g) node pdf.js <id>_paso_a_paso.pdf <id>_p1 <id>_p2 …` (también deja las PNG).
- **Mirá cada PNG con Read y corregí** hasta que no se pise nada: el 3D dentro de su recuadro, sin tapar el texto.
- No toques `fund_prfv.py` ni la app ni el repo.

## Qué devolvés
Por cada guía:
- la ruta del PDF;
- la cantidad de hojas y de pasos;
- lo «a confirmar».
