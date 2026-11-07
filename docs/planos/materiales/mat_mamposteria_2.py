import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *

h = HojaO()
COD = [8002, 4040]
h.check_codigos(COD)
D = 12.7; L = 150

# ============ A · ANCLAJE: VISTA
h.titulo(40, 62, "ANCLAJE DE EXPANSION 1/2\" × 150 (8002) · VISTA", "S/E · TIPO KWIK BOLT · CON TUERCA Y ARANDELA H°G°")
k = 2.4; x0, yc = 90, 185
r = D / 2 * k
# rosca (zona roscada) + vástago + cono + clip
h.rect(x0, yc - r, 70 * k, 2 * r, "url(#STEEL)", K, 1)
for q in range(0, int(70 * k / 5)): h.ln(x0 + q * 5, yc - r, x0 + q * 5 + 3, yc + r, K, .4)
h.rect(x0 + 70 * k, yc - r * .82, 66 * k, 2 * r * .82, "#fff", K, 1)
h.path(f"M{x0+136*k},{yc-r*.82} L{x0+L*k},{yc-r} V{yc+r} L{x0+136*k},{yc+r*.82} Z", "#fff", K, 1)
h.rect(x0 + 124 * k, yc - r * 1.02, 14 * k, 2 * r * 1.02, "url(#ANSI37)", K, .9)
h.rect(x0 - 10 * k, yc - r * 1.7, 10 * k, 3.4 * r, "#fff", K, 1.2)                # tuerca
h.rect(x0 + 2, yc - r * 2.1, 2.5 * k, 4.2 * r, "#fff", K, 1)                      # arandela
h.ln(x0 - 30, yc, x0 + L * k + 20, yc, K, .4, h.EJE)
h.dimH(yc - r * 2.1 - 14, x0 + 20, x0 + L * k, "150", ext=yc - r * 2.1)
h.dimV(x0 + L * k + 24, yc - r, yc + r, "1/2\"", ext=x0 + L * k)
h.dimH(yc + r * 2.1 + 22, x0, x0 + 70 * k, "ROSCA (*)", ext=yc + r, c=OR)
for n, (ax, ay, gx) in enumerate([(x0 - 5 * k, yc - r * 1.7, x0 - 30), (x0 + 3, yc - r * 2.1, x0 + 40), (x0 + 40 * k, yc - r, x0 + 120),
                                    (x0 + 130 * k, yc - r, x0 + 300), (x0 + 145 * k, yc - r * .9, x0 + 370)]):
    h.globo(str(n + 1), ax, ay, gx, yc - 64)
h.txt(40, yc + 82, "1 TUERCA · 2 ARANDELA · 3 VASTAGO ROSCADO · 4 CLIP DE EXPANSION · 5 CONO", 10.5, 700, K)

# ============ B · CORTE EN EL HORMIGON
h.titulo(40, 300, "CORTE A-A · COLOCADO EN LA BASE", "S/E · AGUJERO, PROFUNDIDAD Y TORQUE: SEGUN FABRICANTE (*)")
k2 = 1.3; bx, by = 120, 385
h.rect(bx - 60, by, 380, 200, "url(#CONC)", K, 1.2)
h.rect(bx - 60, by - 10, 380, 10, "#fff", K, 1)                                   # placa / pata del gabinete
h.txt(bx + 330, by - 14, "PIE DEL GABINETE / PLACA (*)", 9.5, 400, G, "end")
cx = bx + 100; rr = D / 2 * k2
h.rect(cx - rr - 1, by, 2 * rr + 2, 120 * k2, "#fff", K, .8)                       # agujero
h.rect(cx - rr, by - 40, 2 * rr, 150 * k2, "url(#STEEL)", K, 1)
h.rect(cx - rr * 1.6, by - 10 - 12, rr * 3.2, 12, "#fff", K, 1.2)                 # tuerca
h.rect(cx - rr * 2.1, by - 10 - 2, rr * 4.2, 2, K, K, .4)
h.path(f"M{cx-rr-3},{by+108*k2} l-4,14 h{2*rr+14} l-4,-14 z", "url(#ANSI37)", K, .9)  # clip abierto
h.dimV(cx + 60, by, by + 120 * k2, "PROF. (*)", ext=cx + rr, c=OR)
h.dimH(by + 120 * k2 + 30, cx - rr, cx + rr, "Ø (*)", ext=by + 120 * k2, c=OR)
h.ln(cx, by - 60, cx, by + 170 * k2, K, .4, h.EJE)
h.flecha_llamada(cx - rr - 6, by + 112 * k2, cx - 100, by + 222, "EL CLIP SE ABRE AL APRETAR", 10, "start")
h.txt(bx + 240, by + 60, "HORMIGON", 10, 400, G, "middle"); h.txt(bx + 240, by + 74, "(BASE AP-TC-007)", 10, 400, G, "middle")
# planta: 4 anclajes por tablero a nivel
h.titulo(500, 300, "PLANTA · 4 ANCLAJES POR TABLERO", "AP-TC-007 · TIPO A 900 × 400 / B 635 × 400 · POSICION (*)")
k3 = .3; px, py = 520, 385
h.rect(px, py, 900 * k3, 400 * k3, "url(#ANSI31)", K, 1.2); h.rect(px + 72 * k3, py + 72 * k3, (900 - 144) * k3, (400 - 144) * k3, "#fff", K, .8)
for ax, ay in ((px + 36 * k3, py + 36 * k3), (px + 864 * k3, py + 36 * k3), (px + 36 * k3, py + 364 * k3), (px + 864 * k3, py + 364 * k3)):
    h.circ(ax, ay, 4, K, K, 0)
h.dimH(py + 400 * k3 + 18, px, px + 900 * k3, "900 (TIPO A)", ext=py + 400 * k3)
h.dimV(px - 14, py, py + 400 * k3, "400", ext=px)
h.txt(px + 450 * k3, py + 400 * k3 + 46, "● = ANCLAJE (UBICACION (*))", 10, 400, OR, "middle")

# ============ C · VARILLA ROSCADA
h.titulo(40, 645, "VARILLA ROSCADA (4040) · VISTA", "S/E · DIAMETRO, LARGO Y TUERCAS (*) · ANCLAJE DEL GABINETE")
vx, vy = 80, 712
h.rect(vx, vy - 6, 520, 12, "url(#STEEL)", K, 1)
for q in range(0, 104): h.ln(vx + q * 5, vy - 6, vx + q * 5 + 3, vy + 6, K, .4)
for xx in (vx + 40, vx + 440): h.rect(xx, vy - 11, 14, 22, "#fff", K, 1.2)
h.dimH(vy + 30, vx, vx + 520, "LARGO (*)", ext=vy + 6, c=OR); h.dimV(vx + 540, vy - 6, vy + 6, "Ø (*)", ext=vx + 520, c=OR)

EX = {8002: "1/2\" × 150", 4040: "Ø y largo (*)"}
y = h.codigos(40, 790, COD, (46, 0, 34), wtot=800, rowh=20, titulo="VARIANTES Y CODIGOS DEL PAÑOL", extra_col=("MEDIDA", EX, 140))
h.notasM(40, y + 26, [
    "DATOS: FICHA DE LA APP («ANCLAJE KWIK BOLT DE 1/2\" × 15 cm: 4 POR TABLERO A NIVEL») Y TABLERO_NIVEL (anclajeLargoCm 15, anclajeRosca 1/2\", anclajes 4).",
    "(*) Ø DEL AGUJERO, PROFUNDIDAD, TORQUE Y LARGO ROSCADO: SEGUN LA FICHA DEL FABRICANTE DEL ANCLAJE (A CONFIRMAR).",
    "(*) VARILLA ROSCADA 4040: Ø, LARGO Y CANTIDAD DE TUERCAS A CONFIRMAR. UBICACION DE LOS 4 ANCLAJES: CONFIRMAR CON EL GABINETE.",
    "PARA LA FICHA DE TUERCAS Y ARANDELAS SUELTAS VER LA FAMILIA HERRAJES.",
], 800, 10.5)

# ============ 3D
h.titulo(890, 62, "VISTA 3D · ANCLAJE SUELTO Y COLOCADO", "ACERO GALVANIZADO · HORMIGON CORTADO PARA VER EL CLIP ABIERTO")
h.iso(2.1, 1050, 230)
# anclaje suelto a lo largo de x
h.cil("x", 0, 70, 0, 0, D / 2, C_GALV, metal=True, borde="#555", bw=.4)
h.helice("x", 0, 70, 0, 0, D / 2, 1, 1.8, "#6b7177", .5)
h.cil("x", 70, 124, 0, 0, D / 2 * .82, C_GALV, metal=True, borde="#555", bw=.4)
h.cil("x", 124, 138, 0, 0, D / 2 * 1.03, "#9aa4ad", metal=True, borde="#555", bw=.4)
h.cil("x", 136, 150, 0, 0, D / 2 * .82, C_GALV, r1=D / 2, tapa=sombra(C_GALV, 1.1), metal=True, borde="#555", bw=.4)
h.hexa("x", -26, -16, 0, 0, 19, C_GALV, tapa=sombra(C_GALV, 1.15), borde="#555", bw=.5, agujero=(D / 2, "#5b6168"))
h.cil("x", -6, -3.5, 0, 0, 13, "#c3cad0", tapa="#d7dce1", metal=True, borde="#555", bw=.4, agujero=(D / 2 + .5, "#5b6168"))
h.g3b("1", (-20, 0, 9), 1180, 110, "TUERCA")
h.g3b("2", (-4, 0, 13), 1180, 140, "ARANDELA")
h.g3b("3", (35, 0, 6), 1400, 120, "VASTAGO ROSCADO 1/2\"")
h.g3b("4", (131, 0, 6.5), 1400, 160, "CLIP DE EXPANSION")
h.g3b("5", (146, 0, 6), 1400, 200, "CONO")
# colocado: bloque de hormigón cortado al medio (y > 0 sacado)
h.iso(.95, 1200, 470)
h.caja(-120, 120, -120, 0, -160, 0, "#b9bdc2", "concT", "#555", .7)
# agujero (cara de corte y = 0)
h.F3([(-7, 0, 0), (7, 0, 0), (7, 0, -125), (-7, 0, -125)], "#6f747a", "#444", .5)
h.cil("z", -120, 40, 0, 0, D / 2 * .82, C_GALV, metal=True, borde="#555", bw=.4)
h.cil("z", -125, -112, 0, 0, D / 2 * 1.25, "#9aa4ad", metal=True, borde="#555", bw=.4)
h.cil("z", -135, -122, 0, 0, D / 2, C_GALV, r1=D / 2 * .82, metal=True, borde="#555", bw=.4)
h.caja(-60, 60, -60, 60, 0, 6, "#9aa3ab", None, "#444", .6)                 # placa / pie (*)
h.cil("z", 6, 8.5, 0, 0, 13, "#c3cad0", tapa="#d7dce1", metal=True, borde="#555", bw=.4)
h.hexa("z", 8.5, 19, 0, 0, 19, C_GALV, tapa=sombra(C_GALV, 1.15), borde="#555", bw=.5, agujero=(D / 2 * .82, "#5b6168"))
h.cil("z", 19, 40, 0, 0, D / 2 * .82, C_GALV, tapa=sombra(C_GALV, 1.1), metal=True, borde="#555", bw=.4)
h.g3b("6", (110, -60, -80), 1420, 430, "HORMIGON DE LA BASE")
h.g3b("4", (0, 0, -118), 1420, 600, "CLIP ABIERTO")
h.g3b("7", (50, 50, 6), 1420, 330, "PIE DEL GABINETE (*)")

# varilla roscada suelta
h.iso(1.3, 960, 520)
h.cil("x", 0, 200, 0, 0, 5, C_GALV, tapa=sombra(C_GALV, 1.1), metal=True, borde="#555", bw=.4)
h.helice("x", 0, 200, 0, 0, 5, 1, 1.6, "#6b7177", .45)
for xx in (20, 170): h.hexa("x", xx, xx + 8, 0, 0, 16, C_GALV, tapa=sombra(C_GALV, 1.15), borde="#555", bw=.5, agujero=(5, "#5b6168"))
h.g3b("8", (100, 0, 5), 920, 700, "VARILLA ROSCADA (4040) (*)")
h.bloque(890, 735, "DATOS TECNICOS", [
    "ANCLAJE DE EXPANSION TIPO KWIK BOLT, 1/2\" × 15 cm",
    "TUERCA Y ARANDELA H°G°",
    "SE COLOCA EN EL HORMIGON ENDURECIDO: AGUJERO, LIMPIEZA, GOLPE Y AJUSTE (*)",
    "VARILLA ROSCADA: ANCLAJE DEL GABINETE (*)",
], 370)
h.bloque(1270, 735, "DONDE SE USA", [
    "AP-TC-007: 4 ANCLAJES POR TABLERO A NIVEL",
    "FIJACION DEL GABINETE SOBRE LA BASE",
], 370)
h.rotuloM("MAT-MAMPOSTERIA-2", "ANCLAJE DE EXPANSION 1/2\"", "Y VARILLA ROSCADA", "VISTA, CORTE, PLANTA Y VISTA 3D", "S/E", "")
guardar(h, "mat_mamposteria_2")
