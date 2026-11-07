"""AP-TC-025 · Poda de arboleda (ítem 82 del Anexo I, «poda de árboles s/ AP-TC-025»).
Datos: ficha AP-TC-025 (qué es, ojo: ítems 1-8 ya incluyen poda en el entorno de la columna); calculadora v130 (renglón «Poda de arboleda»,
Un. = árbol, ítem 82); pasos de la tarea «poda» (autorización · despejar columnas y luminarias · retirar residuos); baremo (1,5 puntos
por árbol, K ref. 0,58 por árbol); CLAUDE.md §11.1 (hidroelevadores de más de 10 m). El plano oficial no da distancias: van (*)."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
h = Hoja()
# ================= ELEVACION =================
h.titulo(40, 62, "ELEVACION", "ESC. 1:100 - COLUMNA DE 7 m Y ARBOL QUE INTERFIERE")
k = .058; y0 = 640; cx = 200
Y = lambda z: y0 - z * k
h.rect(40, y0, 520, 20, "url(#EARTH)", K, 0); h.ln(40, y0, 560, y0, K, 1.6); h.nivel(520, y0, "±0,00")
h.rect(cx - 3, Y(7000), 6, y0 - Y(7000), "#fff", K, 1.1)                      # columna
h.path(f"M{cx},{Y(7000)} l{400*k:.1f},{-40*k:.1f}", "none", K, 1.6)            # brazo 400
lx = cx + 400 * k; h.rect(lx, Y(7000) - 40 * k - 4, 34, 7, "#fff", K, 1.0)    # luminaria
# cono de luz (eje)
h.path(f"M{lx+6},{Y(7000)+2} L{lx-120},{y0} M{lx+30},{Y(7000)+2} L{lx+190},{y0}", "none", K, .5, 'stroke-dasharray="6 3"')
# árbol
tx = cx + 230
h.path(f"M{tx-8},{y0} L{tx-5},{Y(4800)} L{tx+5},{Y(4800)} L{tx+8},{y0} Z", "url(#ANSI31)", K, 1.0)
for (dx, dz, r) in ((-60, 5200, 80), (40, 5600, 85), (-10, 6600, 70), (90, 4600, 60), (-110, 4300, 55)):
    h.circ(tx + dx, Y(dz), r, "none", K, .9)
# ramas que tocan: a cortar
for (x1, z1, x2, z2) in ((tx - 5, 3600, tx - 130, 6300), (tx - 4, 4200, tx - 160, 5200)):
    h.ln(x1, Y(z1), x2, Y(z2), K, 2.2)
    xm, zm = x1 + (x2 - x1) * .55, z1 + (z2 - z1) * .55
    h.ln(xm - 7, Y(zm) - 7, xm + 7, Y(zm) + 7, OR, 2); h.ln(xm - 7, Y(zm) + 7, xm + 7, Y(zm) - 7, OR, 2)
# zona a despejar (*)
h.circ(lx + 10, Y(7000), 1500 * k, "none", OR, 1.2, 'stroke-dasharray="8 4"')
h.txt(lx + 10, Y(7000) - 1500 * k - 8, "ZONA A DESPEJAR R (*)", 9.5, 700, OR, "middle")
h.dimV(cx - 40, y0, Y(7000), "LIBRE 7.000", ext=cx - 5)
h.dimH(Y(7000) - 30, cx, lx, "400", ext=Y(7000) - 4)
for n, a, g in (("1", (cx, Y(3000)), (60, 400)), ("2", (lx + 18, Y(7000) - 3), (300, 120)), ("3", (tx - 90, Y(5000)), (60, 250)),
                ("4", (tx + 40, Y(5600)), (520, 160)), ("5", (tx, Y(1500)), (520, 470)), ("6", (lx + 10 + 1500 * k * .7, Y(7000) - 1500 * k * .7), (520, 260))):
    h.globo(n, a[0], a[1], g[0], g[1])
h.txt(tx - 40, y0 + 36, "X = CORTE DE LA RAMA QUE TAPA LA LUZ O TOCA LA INSTALACION", 9, 700, OR, "middle")
# ================= PLANTA =================
h.titulo(600, 62, "PLANTA", "ESC. 1:200")
kp = .022; pcx, pcy = 650, 250
h.circ(pcx, pcy, 4, K, K, 0); h.ln(pcx, pcy, pcx + 400 * kp * 2, pcy, K, 1.4)
h.circ(pcx + 400 * kp * 2 + 4, pcy, 5, "#fff", K, .9)
h.circ(pcx + 230 / k * kp, pcy + 10, 3500 * kp, "none", K, .9); h.circ(pcx + 230 / k * kp, pcy + 10, 5, K, K, 0)
h.circ(pcx + 14, pcy, 1500 * kp, "none", OR, 1.1, 'stroke-dasharray="8 4"')
h.txt(pcx - 20, pcy + 70, "COLUMNA", 9, 700, K, "middle"); h.txt(pcx + 230 / k * kp, pcy + 130, "COPA DEL ARBOL", 9, 700, K, "middle")
h.txt(pcx + 14, pcy - 54, "R (*)", 9.5, 700, OR, "middle")
# ================= PASOS =================
h.titulo(600, 420, "PASOS (TAREA «PODA»)", "LOS DE LA APP")
for i, t in enumerate(["1) VERIFICAR LA AUTORIZACION", "    ANTES DE PODAR.", "2) DESPEJAR EL ENTORNO DE COLUMNAS", "    Y LUMINARIAS (QUE NO TAPE LA LUZ).", "3) RETIRAR LOS RESIDUOS DE PODA", "    DEL LUGAR DE TRABAJO."]):
    h.txt(600, 462 + i * 18, t, 10, 700 if t[0] != " " else 400)
# ================= COMPUTO =================
rows = [("CONCEPTO", "CANT.", "CALCULO"), ("PODA DE ARBOLES (ITEM 82)", "1 árbol", "UNIDAD = ARBOL (K REF. 0,58)"),
        ("PUNTOS DEL BAREMO", "1,5", "POR ARBOL PODADO"), ("PODA EN EL ENTORNO DE LA COLUMNA", "-", "DENTRO DE LOS ITEMS 1 A 8"),
        ("MATERIAL DEL PAÑOL", "-", "NO LLEVA")]
h.tabla(40, 700, [(236, "l", False), (70, "c", True), (224, "l", False)], rows, rowh=20, titulo="COMPUTO POR ARBOL")
h.rayados(600, 700, [("ANSI31", "TRONCO (CORTE)")], cols=1)
h.ln(600, 760, 630, 760, OR, 1.2, 'stroke-dasharray="8 4"'); h.txt(638, 764, "ZONA A DESPEJAR (*)", 10.5, 400, OR)
h.ln(600, 786, 614, 800, OR, 2); h.ln(600, 800, 614, 786, OR, 2); h.txt(638, 797, "CORTE DE RAMA", 10.5, 400, OR)
h.notas(40, 860, [
 "COTAS EN mm. SE PODA EL ARBOLADO QUE INTERFIERE CON LA INSTALACION: TAPA LA LUZ O TOCA COLUMNA, BRAZO O LUMINARIA.",
 "SE COBRA EN EL ITEM 82 DEL ANEXO I, POR ARBOL. LOS ITEMS 1 A 8 YA INCLUYEN LA PODA EN EL ENTORNO DE LA COLUMNA QUE SE INSTALA:",
 "     EL 82 ES LA PODA QUE SE PIDE APARTE. CONFIRMAR CON LA INSPECCION CUAL ES CUAL ANTES DE CERTIFICAR.",
 "SIN AUTORIZACION NO SE PODA. LOS RESIDUOS SE RETIRAN EL MISMO DIA.",
 "(*) EL PLANO NO DA DISTANCIAS: RADIO A DESPEJAR, ALTURA Y FORMA DE LOS CORTES, A CONFIRMAR CON EL PLANO OFICIAL Y LA INSPECCION."])
# ================= 3D =================
h.titulo(880, 62, "VISTA 3D - COLUMNA, LUMINARIA Y ARBOL", "LAS RAMAS QUE TAPAN EL CONO DE LUZ, MARCADAS PARA CORTAR (EN NARANJA)")
h.iso(.045, 1200, 470)
A = 2800
h.BOX(-A, A, -A, A, -300, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
# cono de luz
c0 = h.P(400, 0, 6960); pts = [h.P(400 + 2200 * math.cos(t), 2200 * math.sin(t), 0) for t in [2 * math.pi * i / 40 for i in range(40)]]
h.a('<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + '" fill="#fff3b0" fill-opacity=".55" stroke="#e0b400" stroke-width=".6"/>')
l1 = h.P(400 - 2200, 0, 0); l2 = h.P(400 + 2200, 0, 0); l3 = h.P(400, 2200, 0); l4 = h.P(400, -2200, 0)
h.a(f'<polygon points="{c0[0]:.1f},{c0[1]:.1f} {l3[0]:.1f},{l3[1]:.1f} {l2[0]:.1f},{l2[1]:.1f}" fill="#fff3b0" fill-opacity=".35" stroke="none"/>')
# columna
h.tuboZ(0, 7000, 0, 0, 57, 38, "url(#galv)", "#444")
b0 = h.P(0, 0, 7000); b1 = h.P(400, 0, 6960); h.ln(b0[0], b0[1], b1[0], b1[1], "#555", 3)
h.a(f'<ellipse cx="{b1[0]+6:.1f}" cy="{b1[1]+2:.1f}" rx="16" ry="5" fill="#cfd5da" stroke="#333" stroke-width=".7"/>')
# árbol
TX, TY = 2000, -500
h.tuboZ(0, 4600, TX, TY, 180, 110, "#7a5230", "#3b2614")
def copa(x, y, z, r, c):
    p = h.P(x, y, z); rr = r * h._s
    h.a(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="{rr:.1f}" fill="{c}" stroke="#2f5a1c" stroke-width=".7"/>')
    h.a(f'<circle cx="{p[0]-rr*.3:.1f}" cy="{p[1]-rr*.3:.1f}" r="{rr*.45:.1f}" fill="#9bd06b" fill-opacity=".35"/>')
for (x, y, z, r) in ((TX + 300, TY - 300, 5200, 1300), (TX - 200, TY + 400, 5600, 1200), (TX + 100, TY, 6500, 1100)):
    copa(x, y, z, r, "#5b9a36")
# ramas que invaden: naranja con cortes
for (z1, x2, y2, z2) in ((3600, 700, -100, 6200), (4200, 900, 500, 5200)):
    a = h.P(TX, TY, z1); b = h.P(x2, y2, z2); h.ln(a[0], a[1], b[0], b[1], "#c2410c", 4)
    copa(x2, y2, z2, 450, "#e58a3a")
    m = (a[0] + (b[0] - a[0]) * .5, a[1] + (b[1] - a[1]) * .5)
    h.ln(m[0] - 8, m[1] - 8, m[0] + 8, m[1] + 8, "#111", 2.2); h.ln(m[0] - 8, m[1] + 8, m[0] + 8, m[1] - 8, "#111", 2.2)
# residuos en el piso
for (x, y) in ((1000, 1300), (1300, 1600)):
    p = h.P(x, y, 0); h.a(f'<path d="M{p[0]-14:.1f},{p[1]:.1f} l10,-6 l8,4 l12,-5 l-6,9 z" fill="#7aa64d" stroke="#3b5a22" stroke-width=".6"/>')
gy = 120
def g(n, p, t):
    global gy; h.g3(n, p, 1500, gy, t); gy += 46
g("2", (420, 0, 6960), "LUMINARIA LED")
g("4", (TX + 100, TY, 6800), "COPA DEL ARBOL")
g("3", (700, -100, 6200), "RAMAS A CORTAR")
g("6", (400, 1800, 0), "CONO DE LUZ")
g("1", (0, 0, 3000), "COLUMNA 7 m")
g("5", (TX, TY, 1500), "TRONCO (NO SE TOCA)")
g("7", (1150, 1450, 0), "RESIDUOS: SE RETIRAN")
LISTA = [("POS.", "ELEMENTO", "CANT.", "CODIGO"),
 ("1", "COLUMNA (NUEVA O EXISTENTE) CON SU VINCULO", "-", "VER AP-C-005"),
 ("2", "LUMINARIA LED", "-", "6010"),
 ("3", "RAMAS QUE TAPAN LA LUZ O TOCAN LA INSTALACION: SE CORTAN", "S/ OBRA", "-"),
 ("4", "COPA DEL ARBOL (QUEDA)", "-", "-"),
 ("5", "TRONCO (NO SE TOCA)", "-", "-"),
 ("6", "CONO DE LUZ / ZONA A DESPEJAR R (*)", "-", "-"),
 ("7", "RESIDUOS DE PODA: SE RETIRAN DEL LUGAR", "TODO", "-"),
 ("8", "HIDROELEVADOR DE MAS DE 10 m (EQUIPO MINIMO DEL PLIEGO)", "1", "EQUIPO"),
 ("9", "PODA DE ARBOLES (ITEM 82, POR ARBOL)", "1 árbol", "ITEM 82")]
h.tabla(890, 650, [(40, "c", False), (480, "l", False), (90, "c", True), (140, "c", False)], LISTA, rowh=24,
        titulo="ELEMENTOS (NO LLEVA MATERIAL DEL PAÑOL)", colores=lambda i, j, t: OR if ("(*)" in t or t in ("A VINCULAR", "SIN CODIGO")) else K)
h.rotulo(890, h.H - 150, 750, "AP-TC-025", "PODA DE ARBOLEDA", "(ITEM 82)", "ELEVACION, PLANTA, PASOS, COMPUTO Y 3D", "1:100 / 1:200", "3D S/E", fecha="07/11/2026")
h.guardar("ap_tc_025.svg")
