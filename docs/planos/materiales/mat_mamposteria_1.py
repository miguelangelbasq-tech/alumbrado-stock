import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *

h = HojaO()
COD = [8016, 8011, 8012, 8018, 8001]
h.check_codigos(COD)

# ============ A · LADRILLO 3 VISTAS
h.titulo(40, 62, "LADRILLO COMUN MACIZO (8016) · 3 VISTAS", "S/E · COTAS EN mm · 250 × 120 × 50")
k = .7
fx, fy = 70, 130
h.rect(fx, fy, 250 * k, 50 * k, "url(#ANSI31)", K, 1.3)
h.dimH(fy - 16, fx, fx + 250 * k, "250", ext=fy); h.dimV(fx - 14, fy, fy + 50 * k, "50", ext=fx)
h.txt(fx + 125 * k, fy + 50 * k + 16, "FRENTE", 10, 700, K, "middle")
lx = fx + 250 * k + 40
h.rect(lx, fy, 120 * k, 50 * k, "url(#ANSI31)", K, 1.3)
h.dimH(fy - 16, lx, lx + 120 * k, "120", ext=fy)
h.txt(lx + 60 * k, fy + 50 * k + 16, "LATERAL", 10, 700, K, "middle")
py = fy + 50 * k + 34
h.rect(fx, py, 250 * k, 120 * k, "#fff", K, 1.3)
h.dimV(fx - 14, py, py + 120 * k, "120", ext=fx)
h.txt(fx + 125 * k, py + 120 * k + 16, "PLANTA", 10, 700, K, "middle")
h.globo("1", fx + 150, fy + 20, fx + 190, fy - 36)
# D1: sobre el cable en la zanja
h.titulo(400, 62, "D1 · SOBRE EL CABLE, A LO LARGO", "ESC. 1:10 · AP-TC-001 · UNO DETRAS DEL OTRO, SIN JUNTA")
k2 = .4; zx, zy = 410, 130
h.rect(zx, zy, 1000 * k2, 40, "url(#EARTH)", K, .5)
h.rect(zx, zy + 40, 1000 * k2, 50 * k2, "url(#ANSI31)", K, 1)
for q in range(1, 4): h.ln(zx + 250 * q * k2, zy + 40, zx + 250 * q * k2, zy + 40 + 50 * k2, K, 1.4)
ya = zy + 40 + 50 * k2
h.rect(zx, ya, 1000 * k2, 150 * k2, "url(#SAND)", K, .6)
h.rect(zx, ya + 50 * k2, 1000 * k2, 50 * k2, "#fff", K, .9)
h.txt(zx + 200, ya + 75 * k2 + 4, "CABLE", 9, 400, G, "middle")
h.dimH(ya + 150 * k2 + 20, zx, zx + 1000 * k2, "1000 = 4 LADRILLOS", ext=ya + 150 * k2)
h.dimV(zx + 1000 * k2 + 16, zy + 40, ya, "50", ext=zx + 1000 * k2)
h.txt(zx, zy - 6, "MALLA Y RELLENO ARRIBA (VER AP-TC-001)", 9.5, 400, G)

# ============ B · HIERROS
h.titulo(40, 330, "HIERROS · CORTES Y VISTA", "CORTES ESC. 5:1 · LISOS (SIN NERVIOS)")
for i, (d, cod, t) in enumerate([(4.2, "8011", "Ø4,2"), (6, "8012", "Ø6")]):
    cx = 90 + i * 110; cy = 395
    h.circ(cx, cy, d * 5 / 2, "url(#STEEL)", K, 1.2)
    h.dimH(cy + 32, cx - d * 5 / 2, cx + d * 5 / 2, t, ext=cy)
    h.txt(cx, cy + 50, cod, 10.5, 700, K, "middle", MONO)
h.ln(330, 390, 790, 390, K, 4.2 * .8); h.ln(330, 410, 790, 410, K, 6 * .8)
h.txt(798, 394, "8011", 9.5, 700, K, "start", MONO); h.txt(798, 414, "8012", 9.5, 700, K, "start", MONO)
h.dimH(372, 330, 790, "SE DA POR METRO · LARGO DE BARRA (*)", ext=386, c=OR)

# ============ C · HIERROS EN LA JUNTA
h.titulo(40, 480, "Ø6 EN LA JUNTA · BASE DE TABLERO", "ESC. 1:5 · 2 HIERROS CADA 2 HILADAS (AP-TC-007)")
mx, my, k3 = 80, 510, .6
for f in range(4):
    yy = my + f * 75 * k3
    h.rect(mx, yy, 120 * k3, 50 * k3, "url(#ANSI31)", K, 1)
    h.rect(mx, yy + 50 * k3, 120 * k3, 25 * k3, "url(#CONCP)", K, .6)
    if f % 2 == 1:
        for xx in (mx + 30 * k3, mx + 90 * k3): h.circ(xx, yy + 62 * k3, 3.5, K, K, 0)
h.dimV(mx - 14, my, my + 75 * k3, "75", ext=mx); h.dimH(my + 4 * 75 * k3 + 16, mx, mx + 120 * k3, "120", ext=my + 4 * 75 * k3)
h.flecha_llamada(mx + 90 * k3, my + 137 * k3, mx + 110, my + 112, "2 Ø6 (8012)", 10)
h.flecha_llamada(mx + 110 * k3, my + 62 * k3, mx + 110, my + 40, "JUNTA 1:3", 10)

# ============ D · MALLA SIMA y ALFARJIA
h.titulo(330, 480, "MALLA SIMA 15 × 15 (8018)", "ESC. 1:10 · Ø DEL ALAMBRE (*) · POR m²")
sx, sy, k4 = 340, 515, .25
for q in range(0, 6): h.ln(sx + q * 150 * k4, sy, sx + q * 150 * k4, sy + 600 * k4, K, 1.3)
for q in range(0, 5): h.ln(sx - 8, sy + q * 150 * k4, sx + 750 * k4 + 8, sy + q * 150 * k4, K, 1.3)
h.dimH(sy + 600 * k4 + 16, sx, sx + 150 * k4, "150", ext=sy + 600 * k4); h.dimV(sx + 750 * k4 + 22, sy, sy + 150 * k4, "150", ext=sx + 750 * k4 + 8)
h.titulo(600, 480, "ALFARJIA (8001)", "CORTE · MADERA · SECCION (*)")
h.rect(630, 530, 90, 36, "url(#WOOD)", K, 1.3)
h.dimH(590, 630, 720, "(*)", ext=566, c=OR); h.dimV(616, 530, 566, "(*)", ext=630, c=OR)
h.txt(610, 625, "USO EN LA OBRA: A CONFIRMAR (*)", 10, 400, OR)

# ============ CODIGOS
EX = {8016: "250 × 120 × 50", 8011: "Ø4,2 liso", 8012: "Ø6", 8018: "15 × 15", 8001: "sección (*)"}
y = h.codigos(40, 730, COD, (46, 0, 34), wtot=800, rowh=18, titulo="VARIANTES Y CODIGOS DEL PAÑOL", extra_col=("MEDIDA", EX, 140))
h.notasM(40, y + 22, [
    "DATOS: FICHA DE LA APP (LADRILLO 25 × 12 × 5, MALLA SIMA 15 × 15) Y TABLERO_NIVEL (HILADA 0,075, 2 HIERROS Ø6, MALLA SIMA EN LA VARIANTE H°A°).",
    "(*) Ø DEL ALAMBRE DE LA MALLA, LARGO DE BARRA DE LOS HIERROS, SECCION Y USO DE LA ALFARJIA: A CONFIRMAR.",
], 800, 10.5)

# ============ 3D
h.titulo(890, 62, "VISTA 3D · LADRILLO, HIERROS, MALLA Y ALFARJIA", "LADRILLO CERAMICO ROJO · HIERRO NEGRO (SIN GALVANIZAR) · MADERA")
h.iso(.3, 960, 190)
h.caja(0, 1000, 0, 200, -180, -20, C_ARENA, "arenaT", "#8a6a2a", .5)
h.cil("x", -60, 1060, 100, -75, 22, C_VAINA, tapa="#3a3d42", borde="#000", bw=.4)
for q in range(4):
    h.caja(q * 250, q * 250 + 248, 40, 160, -20, 30, C_LAD, "ladT", "#7a3418", .6)
h.cota3((0, 200, -180), (1000, 200, -180), "1 m = 4 LADRILLOS", off=(0, 80, 0), c=NV, sz=10)
h.g3b("1", (600, 100, 30), 1290, 130, "LADRILLO (8016)")
h.iso(.7, 1430, 230)
h.caja(0, 250, 0, 120, 0, 50, C_LAD, "ladT", "#7a3418", .8)
h.cota3((0, 120, 0), (250, 120, 0), "250", off=(0, 40, 0), c=NV, sz=10, lado=1)
h.cota3((250, 0, 0), (250, 120, 0), "120", off=(40, 0, 0), c=NV, sz=10)
h.cota3((0, 120, 0), (0, 120, 50), "50", off=(0, 40, 0), c=NV, sz=10, lado=-1)
# malla SIMA
h.iso(.25, 1000, 470)
for q in range(0, 5): h.cil("x", 0, 600, q * 150, 0, 5, "#5e554e", borde=None, metal=True)
for q in range(0, 5): h.cil("y", 0, 600, q * 150, 8, 5, "#6e655e", borde=None, metal=True)
h.g3b("2", (300, 300, 8), 1110, 600, "MALLA SIMA (8018)")
# hierros y alfarjía
h.iso(.4, 1360, 450)
for q, r in enumerate([3, 2.1, 3, 2.1]):
    h.cil("x", 0, 600, q * 22, 0, r * 2, C_HIERRO, tapa="#8a7f77", metal=True, borde="#222", bw=.4)
h.caja(-60, 540, 150, 230, 0, 40, "#b07a45", "maderaT", "#5a3d1e", .6)
h.g3b("3", (420, 66, 6), 1500, 420, "HIERROS Ø6 / Ø4,2")
h.g3b("4", (540, 190, 20), 1500, 600, "ALFARJIA (8001) (*)")

h.bloque(890, 700, "DATOS TECNICOS", [
    "LADRILLO COMUN MACIZO 25 × 12 × 5 cm",
    "HIERRO LISO Ø4,2 · REDONDO Ø6 (POR METRO)",
    "MALLA SIMA 15 × 15 (POR m²) · Ø ALAMBRE (*)",
    "ALFARJIA: MADERA, MEDIDA (*)",
], 370)
h.bloque(1270, 700, "DONDE SE USA", [
    "AP-TC-001: LADRILLO SOBRE EL CABLE ENTERRADO DIRECTO (4 POR METRO); EN PEAD Ø50 NO VA",
    "AP-TC-007: MAMPOSTERIA DE LA BASE (81 / 65 u CON 8 %) Y 2 Ø6 CADA 2 HILADAS",
    "AP-TC-007 VARIANTE H°A°: MALLA SIMA 15 × 15",
    "Ø4,2: COLUMNA METALICA (FICHA DE LA APP)",
], 370)
h.rotuloM("MAT-MAMPOSTERIA-1", "LADRILLO, HIERROS,", "MALLA SIMA Y ALFARJIA", "VISTAS, DETALLES, CORTES Y VISTA 3D", "S/E / 1:10", "3D S/E")
guardar(h, "mat_mamposteria_1")
