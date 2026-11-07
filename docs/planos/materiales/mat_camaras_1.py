import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *

h = HojaO()
COD = [5003, 5016, 5017]
h.check_codigos(COD)
T = 8          # pared de la cámara (*)
HC = 500       # altura máxima 50 cm (CRUCE_AP_TC_002)
ZC = 380       # eje de los caños: ≤ 0,60 m desde el solado (dibujado a 380 (*))

# ============ CORTE A-A
h.titulo(40, 62, "CORTE A-A · POR LOS CAÑOS", "ESC. 1:8 · CAMARA EN LA VEREDA, A UN LADO DEL CRUCE (AP-TC-002)")
k = .5; cx, y0 = 300, 150          # y0 = nivel del solado
xi0, xi1 = cx - 200 * k, cx + 200 * k
# terreno a los costados
h.rect(60, y0, xi0 - T * k - 60, 340, "url(#EARTH)", K, .5); h.rect(xi1 + T * k, y0, 540 - xi1 - T * k, 340, "url(#EARTH)", K, .5)
h.rect(60, y0 - 4, 480, 8, "url(#CONC)", K, .8)      # solado / contrapiso
h.nivel(80, y0 - 4, "±0,00 SOLADO")
# paredes de la cámara
for xa in (xi0 - T * k, xi1): h.rect(xa, y0, T * k, HC * k, K, K, .4)
# arena de asiento
h.rect(xi0 - 30, y0 + HC * k, xi1 - xi0 + 60, 26, "url(#SAND)", K, .8)
h.rect(60, y0 + HC * k + 26, 480, 340 - HC * k - 26, "url(#EARTH)", K, .5)
# caños Ø110 (corte longitudinal) entrando por las dos caras
yC = y0 + ZC * k; rC = 55 * k
for xa, xb in ((60, xi0), (xi1, 540)):
    h.rect(xa, yC - rC, xb - xa, 2 * rC, "#fff", K, 1); h.ln(xa, yC - rC + 2, xb, yC - rC + 2, K, .5); h.ln(xa, yC + rC - 2, xb, yC + rC - 2, K, .5)
    h.ln(xa, yC, xb, yC, K, .4, h.EJE)
# masilla en la boca
for xa in (xi0 - T * k - 4, xi1 - 2): h.rect(xa, yC - rC - 4, T * k + 6, 2 * rC + 8, "url(#RAMA)", K, .8)
# marco y tapa
h.rect(xi0 - 10, y0 - 6, xi1 - xi0 + 20, 8, "url(#BRZ)", K, 1.2)
h.rect(xi0 - 2, y0 - 6, xi1 - xi0 + 4, 5, K, K, .3)
h.dimH(y0 - 40, xi0, xi1, "400 INT.", ext=y0 - 6)
h.dimV(xi1 + 50, y0, y0 + HC * k, "≤ 500", ext=xi1 + T * k)
h.dimV(xi0 - 70, y0, yC, "≤ 600 (*) " if False else "ZC (*)", ext=xi0 - T * k, c=OR)
h.dimV(570, yC - rC, yC + rC, "Ø110", ext=540)
h.globo("1", xi0 - T * k / 2, y0 + 60, xi0 - 50, y0 + 40)
h.globo("2", cx + 60, y0 - 4, cx + 100, y0 - 54)
h.globo("3", xi1 + 2, yC - rC - 2, xi1 + 40, yC - rC - 40)
h.globo("4", 460, yC, 480, yC - rC - 40)
h.txt(cx, y0 + HC * k + 18, "ARENA DE ASIENTO (*)", 9.5, 400, G, "middle")
h.txt(60, y0 + 360, "ZC: EJE DE LOS CAÑOS. EL PLANO PIDE PROFUNDIDAD MAXIMA 0,60 m.", 10, 400, OR)

# ============ PLANTA
h.titulo(620, 62, "PLANTA · SIN TAPA", "ESC. 1:8")
k2 = .36; px, py = 700, 140; L = 400 * k2
h.rect(px - T * k2, py - T * k2, L + 2 * T * k2, L + 2 * T * k2, K, K, .3); h.rect(px, py, L, L, "#fff", K, .8)
h.rect(px - 10, py - 10, L + 20, L + 20, "none", K, .6, 'stroke-dasharray="5 3"')
for xa, xb in ((px - 70, px - T * k2), (px + L + T * k2, px + L + 60)):
    h.rect(xa, py + L / 2 - 55 * k2, xb - xa, 110 * k2, "#fff", K, .9)
h.circ(px + L / 2, py + L / 2, 3, K, K, 0)
h.ln(px - 80, py + L / 2, px + L + 70, py + L / 2, K, .5, h.EJE)
for xx, lab in ((px - 80, "A"), (px + L + 66, "A")):
    h.ln(xx, py + L / 2 - 14, xx, py + L / 2 + 14, K, 1.4); h.txt(xx, py + L / 2 - 18, lab, 12, 700, K, "middle")
h.dimH(py + L + 30, px, px + L, "400 × 400 INT.", ext=py + L)
h.txt(px + L / 2, py + L + 60, "LINEA DE TRAZOS: MARCO DE BRONCE", 9.5, 400, G, "middle")

# ============ D1 MARCO Y TAPA
h.titulo(620, 400, "DETALLE D1 · MARCO Y TAPA", "ESC. 1:2 · BRONCE · MEDIDAS DEL PERFIL (*)")
dx, dy, kd = 640, 480, 1.6
h.rect(dx, dy, 120, 10, "url(#CONC)", K, .8)                 # solado
h.path(f"M{dx+120},{dy} h40 v-2 h-30 v40 h-10 z", "url(#BRZ)", K, 1)    # marco (perfil L) (*)
h.rect(dx + 132, dy - 6, 70, 6, "url(#BRZ)", K, 1.2)           # tapa
h.txt(dx + 166, dy - 10, "TAPA «A.P.»", 9.5, 700, K, "middle")
h.rect(dx + 112, dy + 10, 8, 50, K, K, .3)                     # pared de la cámara
h.flecha_llamada(dx + 125, dy + 30, dx + 50, dy + 70, "MARCO (*)", 10, "end")
h.flecha_llamada(dx + 116, dy + 50, dx + 50, dy + 92, "PARED CAMARA", 10, "end")
h.dimH(dy - 26, dx + 132, dx + 202, "(*)", ext=dy - 6, c=OR)
h.txt(dx + 180, dy + 60, "TAPA A NIVEL", 10, 400, K); h.txt(dx + 180, dy + 74, "DEL SOLADO", 10, 400, K)

# ============ CODIGOS / DATOS
EX = {5003: "40 × 40 · h ≤ 50", 5016: "bronce · «A.P.»", 5017: "1 por boca"}
y = h.codigos(40, 590, COD, (46, 0, 34), wtot=800, rowh=19, titulo="VARIANTES Y CODIGOS DEL PAÑOL", extra_col=("MEDIDA", EX, 150))
cols = [(330, "l", False), (150, "c", True), (320, "l", False)]
fil = [["CONCEPTO (POR CRUCE DE CALZADA)", "CANTIDAD", "DE DONDE SALE"],
       ["CAMARAS 40 × 40 (5003)", "2 u", "CRUCE_AP_TC_002: camaras = 2"],
       ["MARCO Y TAPA DE BRONCE (5016)", "2 u", "1 POR CAMARA"],
       ["MASILLA EN LAS BOCAS (5017)", "4 u (*)", "2 BOCAS POR CAMARA (*)"]]
y = h.tablaM(40, y + 30, cols, fil, 19, "COMPUTO POR CRUCE")
h.notasM(40, 860, [
    "DATOS: FICHA DE LA APP (PLIEGO LP 21478, PLANO AP-TC-002) Y CRUCE_AP_TC_002: «40 × 40 cm, ALTURA MAXIMA 50 cm», PROFUNDIDAD MAXIMA 0,60 m.",
    "40 cm ES MEDIDA INTERIOR (DIBUJO DE LA APP). LA CAMARA ES TIPO DESAGÜE CLOACAL, DE PVC.",
    "(*) ESPESOR DE PARED, ARENA DE ASIENTO, PERFIL DEL MARCO Y TAPA: A CONFIRMAR CON EL FABRICANTE / PLANO OFICIAL.",
    "(*) CANTIDAD DE MASILLA: SE CUENTA 1 POR BOCA DE CONDUCTO; CONFIRMAR SI EL CAÑO DE RESERVA LLEVA TAPA EN VEZ DE MASILLA.",
    "UNA CAMARA A CADA LADO DEL CRUCE, EN LA VEREDA. EL CAÑO DE TRABAJO SE SELLA A AMBOS LADOS.",
], 800, 10.5)

# ============ 3D
h.titulo(890, 62, "VISTA 3D · CAMARA CORTADA A UN CUARTO Y TAPA LEVANTADA", "PVC GRIS CLARO · MARCO Y TAPA DE BRONCE · MASILLA EN LAS BOCAS · ARENA")
h.iso(.42, 1240, 560)
A = 200; ZC_ = HC - ZC
h.caja(-280, 280, -280, 280, -60, 0, C_ARENA, "arenaT", "#8a6a2a", .6)
# caño izquierdo (atrás) y pared trasera / izquierda
h.cano3("x", -560, -A - T, -100, ZC_, 55, 3.2, C_PVC)
h.caja(-A - T, A + T, -A - T, -A, 0, HC, C_PVC, None, "#666", .6)
h.caja(-A - T, -A, -A, A + T, 0, HC, C_PVC, None, "#666", .6)
# masilla de la boca izquierda (cara interior)
h.cil("x", -A, -A + 6, -100, ZC_, 62, "#b98a52", tapa="#c99a62", borde="#6b4a22", bw=.5, agujero=(52, "#7d838c"))
h.cil("x", -A + 6, -A + 30, -100, ZC_, 55, C_PVC, tapa=sombra(C_PVC, 1.1), borde="#555", bw=.5, agujero=(52, C_PVC_IN))
# pared derecha (solo la mitad de atrás) y frente (solo la mitad izquierda)
h.caja(A, A + T, -A, 0, 0, HC, C_PVC, None, "#666", .6)
h.F3([(A + T, -A, 0), (A + T, 0, 0), (A + T, 0, HC), (A + T, -A, HC)], sombra(C_PVC, .64), "#666", .6)
h.cil("x", A + T, A + T + 6, -100, ZC_, 62, "#b98a52", tapa="#c99a62", borde="#6b4a22", bw=.5, agujero=(55, C_PVC))
h.cano3("x", A + T + 6, 520, -100, ZC_, 55, 3.2, C_PVC)
h.caja(-A, 0, A, A + T, 0, HC, C_PVC, None, "#666", .6)
# canto de corte de las paredes
h.F3([(0, A, 0), (0, A + T, 0), (0, A + T, HC), (0, A, HC)], "#555", "#333", .5)
h.F3([(A, 0, 0), (A + T, 0, 0), (A + T, 0, HC), (A, 0, HC)], "#555", "#333", .5)
# marco y tapa (levantados)
zm = HC + 160
for (x0, x1, y0_, y1) in ((-A - 20, A + 20, -A - 20, -A), (-A - 20, -A, -A, A + 20), (A, A + 20, -A, A + 20), (-A, A, A, A + 20)):
    h.caja(x0, x1, y0_, y1, zm, zm + 14, C_BRONCE, None, "#6b4a12", .6)
zt = zm + 150
h.caja(-A + 4, A - 4, -A + 4, A - 4, zt, zt + 8, C_BRONCE, None, "#6b4a12", .7)
h.txtZ(0, 0, zt + 8, "A.P.", 40, 800, "#6b4a12", "middle")
for xx in (-A - 20, A + 20):
    a = h.P(xx, A + 20, HC + 4); b = h.P(xx, A + 20, zm); h.ln(a[0], a[1], b[0], b[1], NV, .6, 'stroke-dasharray="4 3"')
h.g3b("1", (-A - T, 120, 300), 1450, 230, "CAMARA PVC 40 × 40 (5003)")
h.g3b("2", (A - 4, 0, zt + 4), 1450, 150, "MARCO Y TAPA «A.P.» (5016)")
h.g3b("3", (A + T + 3, -100, ZC_ + 60), 1450, 300, "MASILLA EN LA BOCA (5017)")
h.g3b("4", (420, -100, ZC_ + 55), 1450, 360, "CAÑO Ø110 DEL CRUCE")
h.g3b("5", (200, 260, -30), 1450, 640, "ARENA DE ASIENTO (*)")
h.cota3((-A, A + T, 0), (-A, A + T, HC), "≤ 500", off=(-60, 0, 0), c=NV, sz=10, lado=-1)

h.bloque(890, 730, "DATOS TECNICOS", [
    "CAMARA DE PVC TIPO DESAGÜE CLOACAL, 40 × 40 cm INTERIOR",
    "ALTURA MAXIMA 50 cm · PROFUNDIDAD MAXIMA 0,60 m",
    "MARCO DE BRONCE CON TAPA «A.P.», A NIVEL DEL SOLADO",
    "BOCAS DE LOS CONDUCTOS OBTURADAS CON MASILLA O ESPUMA",
], 370)
h.bloque(1270, 730, "DONDE SE USA", [
    "AP-TC-002 CRUCE DE CALZADA: 2 CAMARAS, UNA A CADA LADO",
    "LOS 2 CAÑOS Ø110 LLEGAN DE CAMARA A CAMARA",
    "GUIA «ZANJEO Y TENDIDO»",
], 370)
h.rotuloM("MAT-CAMARAS-1", "CAMARA DE INSPECCION", "PVC 40 × 40 CON TAPA «A.P.»", "CORTE, PLANTA, DETALLE DEL MARCO Y VISTA 3D", "1:8 / 1:2", "3D S/E")
guardar(h, "mat_camaras_1")
