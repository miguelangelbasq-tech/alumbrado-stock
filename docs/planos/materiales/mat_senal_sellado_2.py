import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *

h = HojaO()
COD = [8009, 8010, 8026, 8023, 9003]
h.check_codigos(COD)

# ============ A · SELLADO DE LA BASE DEL POSTE PRFV
h.titulo(40, 62, "D1 · SELLADO DE LA BASE DEL POSTE PRFV", "S/E · AP-TC-003-A: ARENA HASTA −50 Y SELLO DE 50 (*)")
cx, y0, k = 200, 190, .55
h.rect(60, y0, 280, 200, "url(#CONC)", K, 1)
h.rect(cx - 123.5 * k, y0, 247 * k, 200, "#fff", K, 1.1)             # molde Ø247
h.rect(cx - 123.5 * k, y0 + 50 * k, 247 * k, 200 - 50 * k, "url(#SAND)", K, .8)
h.rect(cx - 123.5 * k, y0, 247 * k, 50 * k, "url(#CONCP)", K, 1.2)   # sello
h.rect(cx - 98.5 * k, y0 - 50, 197 * k, 250, "#fff", K, 1.4)         # poste Ø197
h.path(f"M{cx-98.5*k-10},{y0} q10,-12 10,-12 v12 z M{cx+98.5*k+10},{y0} q-10,-12 -10,-12 v12 z", K, K, .6)  # cordón elastómero
h.dimH(y0 + 218, cx - 123.5 * k, cx + 123.5 * k, "Ø247 (MOLDE)", ext=y0 + 200)
h.dimV(cx + 123.5 * k + 70, y0, y0 + 50 * k, "50 (*)", ext=cx + 123.5 * k, c=OR)
h.flecha_llamada(cx + 98.5 * k + 6, y0 - 6, cx + 120, y0 - 40, "ELASTOMERO (8009) (*)", 10, "start", OR)
h.flecha_llamada(cx + 110 * k, y0 + 12, cx + 120, y0 + 60, "SELLO DE BASE", 10, "start")
h.txt(cx, y0 - 58, "POSTE PRFV Ø197", 10, 700, K, "middle")
h.nivel(70, y0, "±0,00")

# ============ B · ENTRADA AL GABINETE CON ESPUMA
h.titulo(470, 62, "D2 · ENTRADA DE CABLES AL GABINETE", "S/E · ESPUMA DE POLIURETANO + BABERO (AP-T-019)")
gx, gy = 520, 110
h.rect(gx, gy, 200, 170, "#fff", K, 1.4); h.rect(gx + 12, gy + 12, 176, 146, "none", K, .5)
h.txt(gx + 100, gy + 80, "GABINETE", 10.5, 700, K, "middle")
h.path(f"M{gx+60},{gy+170} h80 v14 h-80 z", "url(#RAMA)", K, 1)
for q in range(4): h.ln(gx + 76 + q * 16, gy + 184, gx + 76 + q * 16, gy + 260, K, 2.4)
h.path(f"M{gx+50},{gy+186} h100 l-14,22 h-72 z", "#fff", K, .9)
h.flecha_llamada(gx + 140, gy + 176, gx + 230, gy + 168, "ESPUMA PU (8010)", 10, "start")
h.flecha_llamada(gx + 140, gy + 198, gx + 230, gy + 206, "BABERO", 10, "start")
h.txt(gx + 100, gy + 280, "CABLES DE LA ACOMETIDA", 9.5, 400, G, "middle")

# ============ C · JUNTA DE LA BASE DE TABLERO
h.titulo(40, 440, "D3 · SELLADOR DE JUNTA · BASE DE TABLERO (AP-TC-007)", "S/E · PERIMETRO DEL ASIENTO: A 0,90 × 0,40 → 2,60 m · B 0,635 × 0,40 → 2,07 m")
bx, by = 70, 480
h.rect(bx, by + 40, 300, 110, "url(#ANSI31)", K, 1.1)
h.rect(bx + 30, by, 240, 40, "#fff", K, 1.3); h.txt(bx + 150, by + 26, "GABINETE", 10, 700, K, "middle")
for xx in (bx + 30, bx + 270):
    h.path(f"M{xx-8},{by+40} q8,-10 8,-10 v10 z" if xx < bx + 100 else f"M{xx+8},{by+40} q-8,-10 -8,-10 v10 z", K, K, .6)
h.flecha_llamada(bx + 272, by + 34, bx + 330, by + 10, "SELLADOR (8026)", 10, "start")
h.txt(bx + 150, by + 100, "MAMPOSTERIA / H° DE LA BASE", 10, 400, G, "middle")
cols = [(150, "l", False), (120, "c", True), (130, "c", True)]
fil = [["SELLADOR DE JUNTA", "TIPO A", "TIPO B"], ["PERIMETRO", "2,60 m", "2,07 m"], ["CALCULO", "2 × (0,90 + 0,40)", "2 × (0,635 + 0,40)"]]
h.tablaM(420, by + 20, cols, fil, 20, None)

# ============ D · ENVASES
h.titulo(40, 660, "ENVASES · VISTAS", "S/E · MEDIDAS DE LOS ENVASES (*) · MANDA EL CONTENIDO DEL CATALOGO")
ex = 80; ey = 712
# cartucho de silicona 260 ml
h.rect(ex, ey + 20, 40, 160, "#fff", K, 1.2); h.path(f"M{ex+12},{ey+20} L{ex+18},{ey-20} h4 l6,40 z", "#fff", K, 1)
h.txt(ex + 20, ey + 200, "9003", 10.5, 700, K, "middle", MONO); h.txt(ex + 20, ey + 214, "260 ml", 10, 400, K, "middle")
# aerosol espuma
ex2 = ex + 110
h.rect(ex2, ey + 40, 56, 140, "#fff", K, 1.2); h.path(f"M{ex2+6},{ey+40} q22,-26 44,0 z", "#fff", K, 1); h.rect(ex2 + 22, ey + 4, 12, 14, "#fff", K, 1)
h.txt(ex2 + 28, ey + 200, "8010", 10.5, 700, K, "middle", MONO); h.txt(ex2 + 28, ey + 214, "envase (*)", 10, 400, OR, "middle")
# lata pintura asfáltica
ex3 = ex2 + 120
h.rect(ex3, ey + 80, 110, 100, "#fff", K, 1.2); h.path(f"M{ex3+20},{ey+80} q35,-40 70,0", "none", K, 1)
h.txt(ex3 + 55, ey + 200, "8023", 10.5, 700, K, "middle", MONO); h.txt(ex3 + 55, ey + 214, "lata (*) · se cuenta en m²", 10, 400, OR, "middle")
# cartucho sellador / elastómero
ex4 = ex3 + 170
for xx, cod in ((ex4, "8026"), (ex4 + 90, "8009")):
    h.rect(xx, ey + 20, 40, 160, "#fff", K, 1.2); h.path(f"M{xx+12},{ey+20} L{xx+18},{ey-20} h4 l6,40 z", "#fff", K, 1)
    h.txt(xx + 20, ey + 200, cod, 10.5, 700, K, "middle", MONO)
h.txt(ex4 + 65, ey + 214, "envase (*) · 8026 por m", 10, 400, OR, "middle")

EX = {8009: "base PRFV", 8010: "gabinete", 8026: "junta · por m", 8023: "por m²", 9003: "260 ml"}
y = h.codigos(40, 945, COD, (46, 0, 34), wtot=800, rowh=18, titulo="VARIANTES Y CODIGOS DEL PAÑOL", extra_col=("USO", EX, 130))
h.notasM(40, y + 20, [
    "DATOS: FICHA DE LA APP, AP-TC-003-A (SELLO 50), AP-T-019 (ESPUMA + BABERO) Y TABLERO_NIVEL (PERIMETRO DEL ASIENTO).",
    "(*) AP-TC-003-A: EL DIBUJO DICE «MORTERO» Y LA NOTA «SELLO DE HORMIGON»; EL PAÑOL TIENE «ELASTOMERO» (8009). CONFIRMAR CUAL VA. ENVASES Y USO DE LA PINTURA ASFALTICA: A CONFIRMAR.",
], 800, 10)

# ============ 3D
h.titulo(890, 62, "VISTA 3D · ENVASES Y SELLADO DE LA BASE", "CARTUCHOS · AEROSOL · LATA · CORDON DE ELASTOMERO EN EL POSTE PRFV")
h.iso(.8, 960, 290)
def cartucho(x, y, col, tapa, txt):
    h.cil("z", 0, 160, x, y, 22, col, tapa=sombra(col, 1.1), metal=False, borde="#555", bw=.5)
    h.cil("z", 160, 170, x, y, 8, "#e9e9e6", borde="#555", bw=.4)
    h.cil("z", 170, 210, x, y, 6, tapa, r1=2, tapa=tapa, borde="#555", bw=.4)
cartucho(0, 0, "#f2f3f0", "#f2f3f0", "")
h.txtX(22, 0, 80, "SILICONA", 9, 800, "#1d6b9a")
cartucho(80, -20, "#d9d6cf", "#b8b2a4", "")
cartucho(150, -40, "#cfd3d6", "#9aa0a6", "")
# aerosol espuma
h.cil("z", 0, 190, 260, -40, 32, "#2f7fc0", tapa="#c9cdd1", metal=True, borde="#1d4f78", bw=.5)
h.cil("z", 190, 205, 260, -40, 22, "#c9cdd1", r1=12, tapa="#c9cdd1", metal=True, borde="#555", bw=.4)
h.cil("z", 205, 222, 260, -40, 6, "#222222", tapa="#333333", borde="#000", bw=.4)
# lata pintura asfáltica
h.cil("z", 0, 120, 400, 20, 60, "#2a2b2d", tapa="#9aa0a6", metal=True, borde="#000", bw=.5)
h.txtX(460, 20, 60, "ASFALTICA", 10, 800, "#e8c21a")
h.g3b("1", (0, 0, 205), 1130, 115, "SILICONA 260 ml (9003)")
h.g3b("2", (80, -20, 200), 1130, 150, "SELLADOR DE JUNTA (8026)")
h.g3b("3", (150, -40, 200), 1410, 115, "ELASTOMERO (8009) (*)")
h.g3b("4", (260, -40, 210), 1410, 150, "ESPUMA PU (8010)")
h.g3b("5", (440, 20, 120), 1410, 230, "PINTURA ASFALTICA (8023)")
# base del poste con cordón
h.iso(.32, 1420, 600)
h.caja(-220, 220, -220, 220, -120, 0, "#b9bdc2", "concT", "#555", .7)
h.cil("z", -1, 1, 0, 0, 123.5, "#cfcabf", tapa="#cfcabf", borde="#7a7466", bw=.6)
nn = 40
h.cil("z", 0, 14, 0, 0, 112, "#2b2d30", r1=99, tapa="#2b2d30", borde="#000", bw=.4)
h.tuboZ(14, 330, 0, 0, 98.5, 95, "url(#prfv)", "#333")
h.g3b("6", (110, 0, 8), 1490, 620, "CORDON (8009) (*)")
h.g3b("7", (0, 0, 200), 1520, 470, "POSTE PRFV")
h.g3b("8", (220, 0, -60), 1520, 690, "SELLO / FUNDACION")

h.bloque(890, 740, "DATOS TECNICOS", [
    "SILICONA TRANSPARENTE 260 ml (3M / FISCHER)",
    "ESPUMA DE POLIURETANO: ENTRADA AL GABINETE",
    "SELLADOR ELASTICO DE JUNTA: POR METRO",
    "PINTURA ASFALTICA FRIA: POR m²",
], 370)
h.bloque(1270, 740, "DONDE SE USA", [
    "AP-TC-003-A: SELLADO DE LA BASE DEL POSTE PRFV",
    "AP-T-019: ESPUMA + BABERO EN LA ENTRADA DEL GABINETE",
    "AP-TC-007: JUNTA GABINETE / BASE (2,60 m TIPO A · 2,07 m TIPO B)",
    "PINTURA ASFALTICA: USO A CONFIRMAR (*)",
], 370)
h.rotuloM("MAT-SENAL_SELLADO-2", "SELLADORES, ESPUMA,", "SILICONA Y PINTURA ASFALTICA", "DETALLES DE USO, ENVASES Y VISTA 3D", "S/E", "")
guardar(h, "mat_senal_sellado_2")
