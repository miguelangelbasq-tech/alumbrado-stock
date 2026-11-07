import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *

h = HojaO()
COD = [8017, 8005]
h.check_codigos(COD)
ROJO = "#d93a2b"

# ============ A · MALLA: VISTA DE ARRIBA
h.titulo(40, 62, "MALLA DE ADVERTENCIA (8017) · VISTA DE ARRIBA", "S/E · POLIETILENO ROJO · RECTANGULO DE TEXTO Y ROMBOS ≈ 22 × 18 mm")
mx, my, k = 60, 110, 1/3 * 1.0
W = 300 * k * 1.0 * 1.0
W = 100; L = 700
h.rect(mx, my, L, W, "#fff", K, 1.4)
for i in range(0, int(L / 7.3) + 1):
    x = mx + i * 7.3
    h.path(f"M{x},{my} l3.65,{W/2} l-3.65,{W/2}", "none", K, .45)
    h.path(f"M{x+3.65},{my} l-3.65,{W/2} l3.65,{W/2}", "none", K, .45)
for xx in (mx + 80, mx + 420):
    h.rect(xx, my + W / 2 - 14, 210, 28, "#fff", K, 1)
    h.txt(xx + 105, my + W / 2 + 5, "PELIGRO ELECTRICO", 13, 700, K, "middle")
h.dimV(mx + L + 22, my, my + W, "300", ext=mx + L)
h.llamadaDet(mx + 380, my + 30, 16, "D1")
h.txt(mx, my + W + 20, "ROLLO DE 100 m · SE SOLAPA (+5 %)", 10.5, 400, K)
# D1 rombo ampliado
h.titulo(40, 280, "D1 · ROMBO", "S/E")
dx, dy = 70, 320
h.path(f"M{dx},{dy+36} L{dx+44},{dy} L{dx+88},{dy+36} L{dx+44},{dy+72} Z", "none", K, 2)
h.dimH(dy + 92, dx, dx + 88, "≈ 22", ext=dy + 36); h.dimV(dx + 112, dy, dy + 72, "≈ 18", ext=dx + 88)
h.txt(dx + 160, dy + 30, "MEDIDA APROXIMADA SEGUN FABRICANTE", 10, 400, K)
h.txt(dx + 160, dy + 46, "(MAINTEC, FICHA DE LA APP)", 10, 400, G)
# ubicación en la zanja
h.titulo(470, 280, "UBICACION EN LA ZANJA · AP-TC-001", "ESC. 1:10 · A MITAD DEL RELLENO")
zx, zy, kz = 560, 320, .25
h.rect(zx, zy, 200 * kz * 4, 750 * kz, "url(#EARTH)", K, .5)
zw = 200 * kz * 4
h.rect(zx + zw / 2 - 25, zy, 50, 750 * kz, "url(#ANSI37)", K, .8)
h.rect(zx + zw / 2 - 25, zy + 600 * kz, 50, 150 * kz, "url(#SAND)", K, .8)
h.circ(zx + zw / 2, zy + 675 * kz, 6, "#fff", K, .9)
h.ln(zx + zw / 2 - 25, zy + 300 * kz, zx + zw / 2 + 25, zy + 300 * kz, K, 2, h.MALLA)
h.flecha_llamada(zx + zw / 2 + 10, zy + 300 * kz, zx + zw / 2 + 60, zy + 300 * kz - 30, "MALLA", 10, "start")
h.dimV(zx - 12, zy, zy + 300 * kz, "≈ 300 (*)", ext=zx + zw / 2 - 25, c=OR)
h.dimV(zx + zw + 14, zy, zy + 750 * kz, "750", ext=zx + zw / 2 + 25)

# ============ B · TELGOPOR
h.titulo(40, 520, "BLOQUE DE TELGOPOR (8005) · VISTAS", "ESC. 1:10 · CANAL DE LA ACOMETIDA EN LA FUNDACION PRFV 7 m (AP-TC-003-A)")
k2 = .3; tx, ty = 80, 570
TW, TH, TD = 150, 650, 176.5
h.rect(tx, ty, TW * k2, TH * k2, "url(#FOAM)", K, 1.3)
h.dimH(ty + TH * k2 + 18, tx, tx + TW * k2, "150 (*)", ext=ty + TH * k2, c=OR); h.dimV(tx - 14, ty, ty + TH * k2, "650", ext=tx)
h.txt(tx + TW * k2 / 2, ty - 8, "FRENTE", 10, 700, K, "middle")
lx = tx + 120
h.rect(lx, ty, TD * k2, TH * k2, "url(#FOAM)", K, 1.3)
h.dimH(ty + TH * k2 + 18, lx, lx + TD * k2, "≈ 176 (*)", ext=ty + TH * k2, c=OR)
h.txt(lx + TD * k2 / 2, ty - 8, "LATERAL", 10, 700, K, "middle")
# en la fundación (planta y corte simplificados)
fx, fy, kf = 340, 570, .3
h.rect(fx, fy, 600 * kf, 1200 * kf * .55, "url(#CONC)", K, 1.2)
h.rect(fx + 300 * kf - 123.5 * kf, fy, 247 * kf, 1000 * kf * .55, "#fff", K, 1)
h.rect(fx + 300 * kf + 123.5 * kf, fy, TD * kf, 650 * kf * .55, "url(#FOAM)", K, 1)
h.txt(fx + 300 * kf, fy - 8, "EN LA FUNDACION (CORTE A-A, S/E)", 10, 700, K, "middle")
h.dimV(fx + 600 * kf + 16, fy, fy + 650 * kf * .55, "650", ext=fx + 600 * kf)
h.txt(fx + 600 * kf + 34, fy + 660 * kf * .55 + 4, "BORDE DE ABAJO A 350", 9.5, 400, G); h.txt(fx + 600 * kf + 34, fy + 660 * kf * .55 + 18, "DEL FONDO DEL HUECO", 9.5, 400, G)
h.flecha_llamada(fx + 300 * kf + 150 * kf, fy + 40, fx + 280, fy - 30, "TELGOPOR CONTRA EL MOLDE, LADO ZANJA", 9.5, "start")
h.txt(560, 640, "1 BLOQUE POR FUNDACION PRFV (DEL LADO", 10, 400, K); h.txt(560, 654, "DE LA ZANJA). VARIANTE: CAÑO PEAD Ø50.", 10, 400, K)

EX = {8017: "ancho 300 · rollo 100 m", 8005: "≈ 150 × 176 × 650 (*)"}
y = h.codigos(40, 830, COD, (46, 0, 34), wtot=800, rowh=20, titulo="VARIANTES Y CODIGOS DEL PAÑOL", extra_col=("MEDIDA", EX, 180))
cols = [(250, "l", False), (160, "c", True), (390, "l", False)]
fil = [["COMPUTO", "CANTIDAD", "CALCULO"], ["MALLA POR METRO DE ZANJA", "1,05 m", "1 m + 5 % DE SOLAPE"],
       ["ROLLOS PARA L METROS", "L × 1,05 / 100", "ROLLO DE 100 m"], ["TELGOPOR", "1 u", "POR FUNDACION PRFV"]]
y = h.tablaM(40, y + 26, cols, fil, 19, None)
h.notasM(40, y + 22, [
    "DATOS: FICHA DE LA APP (MAINTEC: PEBD VIRGEN, ROJA, ROMBO ≈ 22 × 18 mm, ROLLO 100 m; +5 % DE SOLAPE) Y AP-TC-003-A (TELGOPOR: BORDE DE ABAJO A 350 DEL FONDO, ALTO 650).",
    "(*) ANCHO DEL CANAL (150) Y PROFUNDIDAD DE LA MALLA EN LA ZANJA (≈ 300): A CONFIRMAR CON EL PLANO. 176 = (600 − 247) / 2.",
], 800, 10.5)

# ============ 3D
h.titulo(890, 62, "VISTA 3D · ROLLO DE MALLA Y BLOQUE DE TELGOPOR", "MALLA DE POLIETILENO ROJA · TELGOPOR BLANCO CON CELDAS")
h.iso(.42, 1010, 250)
# rollo de malla (eje y)
h.cil("y", -150, 150, 0, 120, 120, ROJO, tapa=sombra(ROJO, 1.1), borde="#7a1a12", bw=.6, agujero=(30, "#5a0f0a"))
for rr in (50, 70, 90, 110): h.circ3("y", 150.5, 0, 120, rr, "none", "#9c2116", .5)
# tira desenrollada sobre el piso (de x = 0 hacia +x)
x0_, x1_ = 40, 520
h.F3([(x0_, -150, 0), (x1_, -150, 0), (x1_, 150, 0), (x0_, 150, 0)], "#e2483b", "#7a1a12", .7)
for i in range(0, int((x1_ - x0_) / 22) + 1):
    xa = x0_ + i * 22
    for j in range(0, int(300 / 18)):
        ya = -150 + j * 18
        if xa + 22 <= x1_:
            h.F3([(xa, ya + 9, 0), (xa + 11, ya, 0), (xa + 22, ya + 9, 0), (xa + 11, ya + 18, 0)], "none", "#9c2116", .6)
h.F3([(x0_ + 120, -40, .5), (x0_ + 400, -40, .5), (x0_ + 400, 40, .5), (x0_ + 120, 40, .5)], "#fff", "#c8372b", .6)
h.txtZ(x0_ + 260, 10, .6, "PELIGRO ELECTRICO", 11, 800, "#c8372b")
h.cota3((x1_, -150, 0), (x1_, 150, 0), "300", off=(60, 0, 0), c=NV, sz=10)
h.g3b("1", (0, 150, 240), 1300, 130, "MALLA 30 cm (8017)")
h.txt(1318, 150, "ROLLO DE 100 m", 10, 400, G, "start", INT)
# telgopor
h.iso(.4, 1380, 590)
h.caja(0, TD, 0, TW, 0, TH, C_TELG, "telgT", "#9a9a8c", .7, patop=1)
h.cota3((0, TW, 0), (TD, TW, 0), "≈ 176", off=(0, 50, 0), c=OR, sz=10)
h.cota3((TD, 0, 0), (TD, TW, 0), "150 (*)", off=(40, 0, 0), c=OR, sz=10)
h.cota3((TD, 0, 0), (TD, 0, TH), "650", off=(60, -30, 0), c=NV, sz=10)
h.g3b("2", (TD, TW / 2, 400), 1470, 420, "TELGOPOR (8005)")

h.bloque(890, 730, "DATOS TECNICOS", [
    "MALLA: POLIETILENO (PEBD) ROJO, ANCHO 30 cm, TEXTO «PELIGRO ELECTRICO»",
    "ROLLO DE 100 m · SE SOLAPA 5 %",
    "TELGOPOR: POLIESTIRENO EXPANDIDO, HACE EL CANAL DEL CABLE EN EL HORMIGON",
], 370)
h.bloque(1270, 730, "DONDE SE USA", [
    "AP-TC-001 ZANJA: MALLA A MITAD DEL RELLENO, SOBRE TODO EL TENDIDO",
    "AP-TC-003-A FUNDACION PRFV: TELGOPOR DEL LADO DE LA ZANJA (LO QUE SE USA HOY; VARIANTE PEAD Ø50)",
    "GUIA «ZANJEO Y TENDIDO»",
], 370)
h.rotuloM("MAT-SENAL_SELLADO-1", "MALLA DE ADVERTENCIA", "Y BLOQUE DE TELGOPOR", "VISTAS, UBICACION, COMPUTO Y VISTA 3D", "S/E / 1:10", "3D S/E")
guardar(h, "mat_senal_sellado_1")
