import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *

h = HojaO()
COD = [4029, 4030, 4021, 4033, 4035, 1001, 9002]
h.check_codigos(COD)

# ============ A · PRECINTO
h.titulo(40, 62, "PRECINTO DE NYLON 66 (4029 / 4030) · VISTA", "S/E · LARGO 200 / 250 × ANCHO 4,5 · CABEZA CON TRABA (TRINQUETE)")
px, py = 70, 130
h.rect(px, py - 12, 28, 30, "#fff", K, 1.3); h.rect(px + 7, py - 5, 14, 16, "#fff", K, .8)
h.path(f"M{px+28},{py-3} H{px+680} l14,6 l-14,6 H{px+28} Z", "#fff", K, 1.1)
for q in range(0, 120): h.ln(px + 50 + q * 5, py - 3, px + 50 + q * 5, py + 9, K, .4)
h.dimH(py + 44, px, px + 694, "LARGO 200 (4029) · 250 (4030)", ext=py + 18)
h.dimV(px + 720, py - 3, py + 9, "4,5", ext=px + 694)
h.llamadaDet(px + 14, py + 3, 22, "D1")
# D1 cabeza en corte
h.titulo(40, 230, "D1 · CABEZA EN CORTE", "S/E · LOS DIENTES TRABAN Y NO SE AFLOJA (*)")
dx, dy = 70, 270
h.rect(dx, dy, 90, 70, "url(#PLAS)", K, 1.2); h.rect(dx + 30, dy, 30, 70, "#fff", K, .8)
h.path(f"M{dx+34},{dy+20} l14,10 l-14,4 z", K, K, .4)
for q in range(5): h.path(f"M{dx+60},{dy+6+q*12} l-6,6 l6,0 z", K, K, .3)
h.flecha_llamada(dx + 42, dy + 28, dx + 140, dy + 20, "UÑA (TRABA)", 10, "start")
h.flecha_llamada(dx + 57, dy + 50, dx + 140, dy + 56, "DIENTES DE LA TIRA", 10, "start")

# ============ B · CINTA AISLADORA
h.titulo(420, 230, "CINTA AISLADORA PVC (4021)", "S/E · 19 mm × 20 m · Ø DEL ROLLO (*)")
cx, cy = 520, 320
h.circ(cx, cy, 50, "#fff", K, 1.4); h.circ(cx, cy, 30, "#fff", K, .9); h.circ(cx, cy, 26, "url(#WOOD)", K, .6)
h.rect(640, cy - 50, 19 * 2.4, 100, "url(#PLAS)", K, 1.3)
h.dimH(cy + 70, 640, 640 + 19 * 2.4, "19", ext=cy + 50)
h.dimH(cy + 70, cx - 50, cx + 50, "Ø (*)", ext=cy + 50, c=OR)
h.txt(720, cy + 4, "20 m POR ROLLO", 10.5, 700, K)

# ============ C · TORNILLO + FISHER y SOPORTE
h.titulo(40, 430, "TORNILLO CON FISHER N° 8 (4035) Y SOPORTE PARA CAÑOS (4033)", "S/E · MEDIDAS (*) · EL FISHER (TACO) VA EN EL AGUJERO DE LA PARED")
tx, ty = 70, 500
h.rect(tx, ty - 8, 20, 70, "url(#ANSI31)", K, 1)                       # pared
h.rect(tx + 20, ty - 8, 4, 70, "#fff", K, .4)
h.path(f"M{tx+24},{ty+10} h80 l8,6 v4 l-8,6 h-80 z", "url(#PLAS)", K, 1)     # taco
h.path(f"M{tx+4},{ty+20} h120 l10,3 l-10,3 h-120 z", "url(#STEEL)", K, 1)   # tornillo
h.rect(tx - 10, ty + 10, 14, 26, "#fff", K, 1.2)                             # cabeza
h.flecha_llamada(tx + 80, ty + 12, tx + 160, ty - 10, "FISHER N° 8 (*)", 10, "start", OR)
h.flecha_llamada(tx + 120, ty + 23, tx + 200, ty + 46, "TORNILLO (*)", 10, "start", OR)
h.dimH(ty + 80, tx + 24, tx + 112, "L TACO (*)", ext=ty + 36, c=OR)
# soporte (abrazadera de 1 ala) con caño
sx, sy = 470, 520
h.rect(sx - 10, sy + 40, 260, 14, "url(#ANSI31)", K, 1)
h.circ(sx + 130, sy + 10, 28, "#fff", K, 1)
h.path(f"M{sx+60},{sy+40} V{sy+34} H{sx+98} A32,32 0 1 1 {sx+162},{sy+34} V{sy+40} h-4 v-2 A28,28 0 1 0 {sx+102},{sy+38} v2 Z", "url(#STEEL)", K, 1)
h.rect(sx + 70, sy + 30, 8, 24, K, K, .3)
h.txt(sx + 130, sy + 14, "CAÑO", 9, 400, G, "middle")
h.flecha_llamada(sx + 160, sy - 10, sx + 210, sy - 30, "SOPORTE (4033)", 10, "start")
h.flecha_llamada(sx + 74, sy + 50, sx + 20, sy + 80, "TORNILLO + FISHER", 10, "start")

# ============ D · ALAMBRE DE ATAR y PINTURA
h.titulo(40, 650, "ALAMBRE PARA ATADURAS (1001) · ATADURA EN EL AISLADOR", "S/E · GALVANIZADO N° 14 ≈ 25 g/m (*) · 2 m POR ATADURA (CLAUDE.md §11.3)")
ax, ay = 140, 740
h.circ(ax, ay, 34, "url(#PORC)", K, 1.2); h.circ(ax, ay, 18, "#fff", K, .8)
h.ln(ax - 110, ay - 34, ax + 110, ay - 34, K, 3)
for q in range(-3, 4): h.path(f"M{ax+q*9-5},{ay-42} q5,14 10,0", "none", K, 1)
h.txt(ax, ay + 56, "AISLADOR MN 16 / MN 17", 10, 700, K, "middle")
cols = [(200, "l", False), (130, "c", True), (170, "l", False)]
fil = [["ALAMBRE (CALCULADO)", "CANTIDAD", "CALCULO"], ["POR ATADURA", "2 m", "CLAUDE.md §11.3"], ["PESO POR METRO (N° 14)", "≈ 25 g/m (*)", "A CONFIRMAR"],
       ["POR AISLADOR", "≈ 0,05 kg (*)", "2 m × 25 g/m"]]
h.tablaM(300, 690, cols, fil, 19, None)

EX = {4029: "200 × 4,5", 4030: "250 × 4,5 · negro", 4021: "19 mm × 20 m", 4033: "medida (*)", 4035: "n° 8", 1001: "≈ 25 g/m (*)", 9002: "envase (*)"}
y = h.codigos(40, 830, COD, (46, 0, 34), wtot=800, rowh=18, titulo="VARIANTES Y CODIGOS DEL PAÑOL", extra_col=("MEDIDA", EX, 140))
h.notasM(40, y + 22, [
    "DATOS: FICHA DE LA APP (PRECINTOS NYLON 66 DE 200 Y 250 × 4,5; CINTA PVC 19 mm × 20 m) Y CLAUDE.md §11.3 (ALAMBRE: 2 m POR ATADURA).",
    "(*) 4029 FIGURA EN EL CATALOGO EN «m» Y 4030 EN «Un.»: CONFIRMAR LA UNIDAD. ALAMBRE: PESO POR METRO Y kg POR AISLADOR A CONFIRMAR (CALCULADO POR VUELTAS).",
    "(*) MEDIDAS DEL TORNILLO, DEL FISHER, DEL SOPORTE Y ENVASE / COLOR DE LA PINTURA GRIS: A CONFIRMAR.",
], 800, 10.5)

# ============ 3D
h.titulo(890, 62, "VISTA 3D · ATANDO, ENCINTANDO Y FIJANDO", "NYLON BLANCO Y NEGRO · CINTA PVC NEGRA · ACERO CINCADO · ALAMBRE GALVANIZADO")
# haz de cables con 2 precintos
h.iso(1.6, 1000, 230)
for (a, b, c) in ((0, 0, "#7b3f1d"), (14, 0, "#1a1a1a"), (7, 12, "#c62828"), (7, -12, "#4fa3d9")):
    h.cil("x", 0, 170, a - 7, b, 7, c, tapa=sombra(c, 1.2), borde="#000", bw=.4)
for xx, col in ((40, C_NYLON_B), (120, C_NYLON_N)):
    h.cil("x", xx, xx + 4.5, 0, 0, 23, col, tapa=None, borde="#555", bw=.4)
    h.caja(xx - 3, xx + 7, -8, 8, 20, 30, col, None, "#555", .5)
    h.cil("z", 30, 70, xx + 2, 6, 2, col, borde="#555", bw=.3)
h.g3b("1", (42, 0, 24), 1200, 110, "PRECINTO 200 (4029)")
h.g3b("2", (122, 0, 24), 1200, 150, "PRECINTO NEGRO 250 (4030)")
# rollo de cinta
h.iso(1.3, 1490, 300)
h.cil("y", 0, 19, 0, 0, 48, "#1c1d20", tapa="#2d2f33", borde="#000", bw=.5, agujero=(30, "#c9b48a"))
h.circ3("y", 19.2, 0, 0, 26, "#fff", "#999", .4)
h.g3b("3", (0, 19, 48), 1420, 210, "CINTA PVC 19 mm (4021)")
# tornillo + fisher + soporte con caño sobre una pared
h.iso(1.2, 1060, 500)
h.caja(-20, 0, -60, 160, -40, 90, "#d6d9dc", None, "#666", .6)
h.cil("x", 0, 40, 100, 30, 22, "#d9dcdf", tapa="#e9ebed", borde="#666", bw=.5, agujero=(19, "#8d949b"))
from matkit import M3
mm = M3(h); mm.ring([0, 100, 30], [0, 1, 0], [0, 0, 1], [1, 0, 0], 22, 24.5, 10, 24, 0, 180, "galv"); mm.render()
h.caja(0, 3, 50, 76, 15, 30, "#b8c2ca", None, "#555", .4); h.caja(0, 3, 124, 150, 15, 30, "#b8c2ca", None, "#555", .4)
h.cil("x", 3, 7, 63, 22, 5, "#c8cdd2", tapa="#d9dde1", metal=True, borde="#555", bw=.4)
h.cil("x", 3, 7, 137, 22, 5, "#c8cdd2", tapa="#d9dde1", metal=True, borde="#555", bw=.4)
# fisher suelto + tornillo suelto
h.cil("x", 70, 110, 70, -40, 4, "#e9e3c8", tapa="#f4efd8", borde="#777", bw=.4)
h.cil("x", 120, 160, 70, -40, 2.2, "#c8cdd2", metal=True, borde="#555", bw=.4)
h.cil("x", 160, 163, 70, -40, 4.5, "#c8cdd2", tapa="#d9dde1", metal=True, borde="#555", bw=.4)
h.g3b("4", (17, 100, 54), 1200, 470, "SOPORTE PARA CAÑOS (4033) (*)")
h.g3b("5", (140, 70, -40), 1200, 640, "TORNILLO + FISHER N° 8 (4035)")
# rollo de alambre y lata
h.iso(1.0, 1460, 560)
for rr in (40, 37, 34, 31):
    h.cil("z", 0, 8, 0, 0, rr, "#aab3ba", tapa="none" if False else None, metal=True, borde="#666", bw=.3)
h.cil("z", 0, 10, 0, 0, 41, "#aab3ba", tapa="#c3cad0", metal=True, borde="#666", bw=.4, agujero=(28, "#ffffff"))
h.cil("z", 0, 90, 120, -40, 40, "#8d9399", tapa="#b9bec4", metal=True, borde="#444", bw=.5)
h.txtX(160, -40, 50, "GRIS", 10, 800, "#ffffff")
h.g3b("6", (0, 0, 10), 1470, 470, "ALAMBRE (1001)")
h.g3b("7", (120, -40, 90), 1470, 660, "PINTURA GRIS (9002)")

h.bloque(890, 730, "DATOS TECNICOS", [
    "PRECINTOS NYLON 66: 200 × 4,5 Y 250 × 4,5 (NEGRO)",
    "CINTA AISLADORA PVC 19 mm × 20 m",
    "TORNILLO CON FISHER N° 8 · SOPORTE PARA CAÑOS AMURADO",
    "ALAMBRE PARA ATADURAS (kg) · PINTURA GRIS DE TERMINACION",
], 370)
h.bloque(1270, 730, "DONDE SE USA", [
    "PRECINTOS: ORDENAR CABLES EN TABLEROS Y COLUMNAS",
    "ALAMBRE: ATADURAS EN AISLADORES MN 16 / MN 17 (LINEA AEREA)",
    "SOPORTE + FISHER: FIJAR CAÑOS A PARED",
    "PINTURA GRIS: TERMINACION",
], 370)
h.rotuloM("MAT-FIJACION-1", "PRECINTOS, CINTA, TORNILLOS,", "ALAMBRE Y PINTURA", "VISTAS, DETALLES, COMPUTO Y VISTA 3D", "S/E", "")
guardar(h, "mat_fijacion_1")
