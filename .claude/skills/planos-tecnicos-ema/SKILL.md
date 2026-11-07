---
name: planos-tecnicos-ema
description: Estilo y método para dibujar los planos técnicos de EMA (tipos constructivos AP-TC / AP-C / AP-CC / AP-T, láminas y los dibujos de «Cómo se hace»): una hoja con el plano estilo AutoCAD a la izquierda (cortes acotados, detalles ampliados, cómputo, rayados, notas) y una vista 3D en corte escalonado a la derecha, con globos que cruzan las dos vistas y la lista de materiales con código del pañol, más el rótulo. Usala SIEMPRE que haya que dibujar, rehacer o revisar un plano, un tipo constructivo, una ficha técnica o una guía de obra para la app de Alumbrado Público, aunque no digan «plano» ni «skill».
---

# Planos técnicos EMA

Ángel aprobó este estilo el 07/11/2026 con la AP-TC-001 (zanja). Ver `ejemplos/ap_tc_001.png`, `ap_tc_002.png` (cruce de calzada) y `ap_tc_003a.png` (fundación PRFV 7 m).

## La hoja (1680 × 1188, apaisada, proporción A3)
- **Marco doble** y una línea vertical en x = 860 que separa las dos mitades.
- **Izquierda = plano «como de AutoCAD»**, en blanco y negro:
  - **Corte transversal A–A** acotado, con nivel ±0,00 y globos numerados.
  - **Corte longitudinal B–B o planta**, con la línea de corte marcada (letras A en las puntas).
  - **Detalles ampliados** D1, D2… (el cable en corte, el ladrillo, la cámara, la bornera…), con su llamada punteada en el corte.
  - **Cómputo** por metro o por unidad: concepto · cantidad · cálculo a la vista.
  - **Rayados** (cuadro de referencias) y **notas** numeradas.
- **Derecha = vista 3D en corte escalonado**, a color:
  - Cada capa termina un poco antes que la de abajo, así se ven todas.
  - Lleva globos con los mismos números del plano.
  - Abajo, la **lista de materiales** (pos. · descripción · cantidad · código del pañol) y el **rótulo**.

## Reglas de dibujo
- **Cotas en mm**, con trazo oblicuo en las puntas (dibujo de construcción, IRAM 4511), en la vista que corresponde. Manda la cota, no la medida sobre el dibujo.
- **Rayados normalizados:**
  - `EARTH` terreno natural · `ANSI37` relleno compactado · `SAND` arena · `ANSI31` ladrillo o corte de pared;
  - `CONC` hormigón · `CONCP` hormigón pobre o sello · `FOAM` telgopor.
- **Líneas:**
  - contorno 1,6–1,8;
  - piezas 0,8–1,2;
  - cotas 0,6;
  - eje `14 3 2 3`; oculta `5 3`; malla de advertencia `7 2 1,5 2`.
- **Cables en corte:**
  - cubierta, relleno, conductores con su aislación de color (L1 marrón, L2 negro, L3 rojo, N celeste — AEA 90364) y la cuerda de hilos de cobre;
  - en el plano en blanco y negro van sin color; en el detalle y en el 3D, con color.
- **Materiales reales:** se dibujan uno por uno, como ladrillos, caños o cámaras, con su medida y **cuántos entran** (por metro, por unidad).
- **Letra:**
  - plano: Arial Narrow en MAYÚSCULAS;
  - números de tabla: JetBrains Mono;
  - texto del 3D: Inter.
- **Materiales en el 3D: cada uno con su color y su textura, fieles a la realidad** (pedido de Ángel, 07/11/2026). **Nunca dos materiales vecinos que se parezcan.**

  | Material | Patrón | Cómo se ve |
  |---|---|---|
  | Hormigón | `conc3` | gris claro, opaco, con áridos |
  | Hormigón pobre o sello | `concP3` | gris beige |
  | Poste PRFV | `prfv` | gris RAL 7043, oscuro y satinado, con la veta de la fibra (`fibra`); **no se tiene que parecer al hormigón** |
  | Acero galvanizado | `galv` | gris azulado con brillo |
  | PVC | `pvc` | gris muy claro y brillante |
  | PEAD | `pead` | negro |
  | Bronce y cobre | `bronce`, `cobre` | sus colores |
  | Arena | `sand3` | — |
  | Tierra | `soil3` | — |
  | Pasto | `grass` | — |
  | Ladrillo | `lad3` | con juntas |
  | Telgopor | `foam3` | blanco con celdas |
  | Malla de advertencia | `mesh` | naranja |
  | Asfalto | `asph3` | — |
  | Cables | — | cubierta negra; conductores marrón, negro, rojo, celeste; cobre |

  Revisá en la imagen que se distingan.
- **3D:** isométrico (x → derecha-abajo, y → izquierda-abajo, z arriba). Se ven las caras +x, +y y la de arriba. Colores: tierra `soil3`, arena `sand3`, hormigón `conc3`, pasto `grass`, malla `mesh`, PVC `pvc`, PRFV `prfv`.

## Datos: no se inventa nada
- Las medidas salen del **plano oficial**, de la ficha de Normas de la app (`NORMAS_FICHAS`, `s({ id: "AP-…" })`), de las constantes de la calculadora (ej. `CRUCE_AP_TC_002`, `TABLERO_NIVEL`) y de CLAUDE.md §11.
- Lo que no esté va en **naranja con (*)** y en las notas como «a confirmar». Ejemplos: medida del ladrillo, referencia de la malla a 300, espesor del telgopor, separación entre caños.
- Si el pliego y el plano se contradicen, va en las notas (ej. ítem 21 «1 caño Ø160» contra 2 Ø110).
- Los **códigos del pañol** que no estén identificados van «A VINCULAR» (naranja). No se inventan códigos.

## Cómo se arma
1. `scripts/planokit.py` tiene todo: `Hoja`, `titulo`, `dimV`/`dimH`, `nivel`, `globo`, `cable`, `cano`, `tabla`, `rayados`, `notas`, `rotulo`, y el 3D (`iso`, `P`, `BOX`, `F3`, `tuboX`, `tuboZ`, `circX`, `g3`).
2. Copiá un ejemplo de `ejemplos/` y cambiá los datos.
3. Mirá la imagen (Playwright, `deviceScaleFactor: 1.5`) y corregí lo que se pise: globos, textos, el 3D contra la lista.
4. Los planos van a la app como SVG (Tipos constructivos y Guías). El DXF para AutoCAD sale con `ezdxf` (mismas medidas, capas por material). Se agrega como «Bajar DXF» si Ángel lo pide.
