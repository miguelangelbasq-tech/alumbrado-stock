"""MAT-CAJA_COLUMNA-2 · Fondos y tableritos de columna con riel (3009, 3010, 3011, 6009).
Datos: FICHAS_TEC.caja_columna pieza 2 (medidas por código; tablerito PRFV 80 × 130 sin código; acrílico ETG 16.1),
FAMILIAS_MAT.caja_columna, AP-CC-014 (chapa galvanizada, riel NS35 + 2 tornillos cabeza tanque 6×3/8, BPN, bases portafusible, bulón de PAT),
AP-C-033-A (placa A fija 120 × 145 con roscas Ø6 · placa B móvil 80 × 130), TC-PRFV-01/02."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
e = 1.15
h.titulo(40, 62, "PLANTAS DE LOS FONDOS (MISMA ESCALA)", "ESC. 1:1 (APROX.) - COTAS EN mm - RIEL NS35 Y AGUJEROS DE FIJACION (*)")
fondos = [("3009", 220, 75, "CON RIEL"), ("3010", 220, 80, "CHAPA NEGRA"), ("3011", 230, 95, "GALVANIZADA")]
y = 120
for cod, W, Hh, nota in fondos:
    x = 80
    fill = "url(#ANSI37)" if cod == "3010" else "#fff"
    h.rect(x, y, W * e, Hh * e, fill, K, 1.5)
    for xx in (x + 8 * e, x + (W - 8) * e): h.circ(xx, y + Hh * e / 2, 2.6 * e, "#fff", K, .8)
    h.rect(x + 20 * e, y + (Hh / 2 - 17.5) * e, (W - 40) * e, 35 * e, "#fff", K, .7, h.OCULTA if False else "")
    h.ln(x + 20 * e, y + (Hh / 2 - 12.5) * e, x + (W - 20) * e, y + (Hh / 2 - 12.5) * e, K, .4)
    h.ln(x + 20 * e, y + (Hh / 2 + 12.5) * e, x + (W - 20) * e, y + (Hh / 2 + 12.5) * e, K, .4)
    h.dimH(y + Hh * e + 16, x, x + W * e, str(W), ext=y + Hh * e + 2)
    h.dimV(x - 18, y, y + Hh * e, str(Hh), ext=x - 2)
    h.txt(x + W * e + 16, y + 20, cod, 12, 700, K, "start", MONO); h.txt(x + W * e + 16, y + 36, nota, 10, 400)
    h.txt(x + W * e + 16, y + 52, "e = 2 mm", 10, 400)
    y += Hh * e + 44
h.txt(80 + 230 * e + 16, 120 + 68, "RIEL (*)", 10, 400, OR)
# 6009 vertical
x6, y6 = 520, 380
h.titulo(500, 340, "FONDO 6009", "70 x 165 · ESPESOR (*)")
h.rect(x6, y6, 70 * e, 165 * e, "#fff", K, 1.5)
h.rect(x6 + (35 - 17.5) * e, y6 + 20 * e, 35 * e, 125 * e, "#fff", K, .7)
for yy in (y6 + 8 * e, y6 + 157 * e): h.circ(x6 + 35 * e, yy, 2.6 * e, "#fff", K, .8)
h.dimH(y6 + 165 * e + 16, x6, x6 + 70 * e, "70", ext=y6 + 165 * e + 2)
h.dimV(x6 + 70 * e + 20, y6, y6 + 165 * e, "165", ext=x6 + 70 * e + 2)
h.txt(x6, y6 + 165 * e + 40, "RIEL (*)", 10, 400, OR)
# tablerito PRFV 80 x 130 (sin código)
x7, y7 = 700, 380
h.titulo(660, 340, "TABLERITO PRFV", "80 x 130 · SIN CODIGO")
h.rect(x7, y7, 80 * e, 130 * e, "#fff", K, 1.5)
h.rect(x7, y7 + (65 - 17.5) * e, 80 * e, 35 * e, "#fff", K, .7)
h.dimH(y7 + 130 * e + 16, x7, x7 + 80 * e, "80", ext=y7 + 130 * e + 2)
h.dimV(x7 - 16, y7, y7 + 130 * e, "130", ext=x7 - 2)
h.txt(x7, y7 + 130 * e + 46, "PLACA B MOVIL", 9.5, 400); h.txt(x7, y7 + 130 * e + 60, "(AP-C-033-A)", 9.5, 400)
# ================= D1 CORTE CON ACRILICO =================
DX, DY = 40, 610
h.titulo(DX, DY, "D1 - CORTE CON EL ACRILICO (ETG 16.1)", "S/E - SEPARACION Y ESPESOR DEL ACRILICO (*)")
k = 2.3; bx, by = DX + 40, DY + 50
h.rect(bx, by, 4 * k, 80 * k * .7, "url(#ANSI31)", K, 1)                  # chapa (2 mm, exagerada)
rielX = bx + 4 * k
h.path(f"M{rielX},{by + 20 * k} h{7.5 * k} v{2 * k} h{-6.5 * k} v{31 * k} h{6.5 * k} v{2 * k} h{-7.5 * k} z", "url(#ANSI31)", K, .8)
h.path(f"M{rielX + 7.5 * k},{by + 14 * k} h{50 * k} l{3 * k},{10 * k} v{22 * k} l{-3 * k},{10 * k} h{-50 * k} z", "#fff", K, 1)
h.txt(rielX + 33 * k, by + 38 * k, "BORNE / PORTAFUSIBLE", 9, 700, K, "middle")
h.rect(rielX + 72 * k, by - 4, 2 * k, 80 * k * .7 + 8, "url(#acril)", OR, 1.2, 'stroke-dasharray="5 2"')
h.txt(rielX + 76 * k, by + 10, "ACRILICO DE PROTECCION (*)", 10, 700, OR)
h.txt(rielX + 76 * k, by + 24, "OBLIGATORIO (ETG 16.1)", 10, 400)
h.txt(bx - 4, by + 80 * k * .7 + 20, "CHAPA 2 mm", 9.5, 400)
h.globo("1", bx + 2 * k, by + 60, bx - 24, by + 100)
h.globo("2", rielX + 3 * k, by + 21 * k, rielX + 3 * k, by - 18)

# ================= TABLA DE CODIGOS =================
dd = {"3009": "220 x 75 x 2 · C/RIEL", "3010": "220 x 80 x 2 · NEGRA", "3011": "230 x 95 x 2 · GALV.", "6009": "70 x 165"}
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "MEDIDAS (FICHA)"]] + [cat(c, 66) + [dd[str(c)]] for c in (3009, 3010, 3011, 6009)]
filas.append(["—", "TABLERITO DE LA CAJA DE COLUMNA PRFV (2 POR COLUMNA, TC-PRFV-01/02)", "—", "80 x 130 · SIN CODIGO"])
yt = h.tabla(40, 840, [(52, "c", True), (470, "l", False), (40, "c", False), (238, "l", False)], filas, rowh=17,
             titulo="CODIGOS DEL PAÑOL (4) + TABLERITO SIN CODIGO", colores=lambda i, j, t: OR if (i == 5 or (j == 2 and t == "m")) else K)
ydat = bloque(h, 40, yt + 24, "DATOS TECNICOS", [
    "PLACA DE CHAPA DONDE VAN EL RIEL NS35, LOS BORNES BPN Y LOS PORTAFUSIBLES.",
    "AP-CC-014: CHAPA GALVANIZADA, RIEL CON 2 TORNILLOS CABEZA TANQUE 6 x 3/8, BULON DE PAT."], w=390)
yu = bloque(h, 450, yt + 24, "DONDE SE USA", [
    "COLUMNA PRFV: 2 TABLERITOS 80 x 130 (C1 ABAJO, C2 ARRIBA) A 3,50 m DEL PISO.",
    "COLUMNA METALICA Y CAJA EXTERNA: FONDO DEL TABLERITO AP-CC-014 / 015."], w=390)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - FONDO 230 x 95 GALVANIZADO ARMADO", "RIEL, 3 BORNES BPN 6, 2 PORTAFUSIBLES, BULON DE PAT Y EL ACRILICO ADELANTE")
setIso(h, 2.4, 1400, 400)
# fondo vertical: x = espesor (espalda), y = 230 de ancho, z = 95 de alto → en espejo mira a la izquierda-abajo
h.BOX(-2, 0, 0, 230, 0, 95, "#e3e8ec", "url(#galv)", "#8f9aa4", "#333", .6)
h.a('')
# riel horizontal (a lo largo de y): perfil en (x,z)
per = [(0, 47.5 - 17.5 + a) for a in (0,)]
for yy0, yy1 in ((20, 210),):
    # riel como cajón simple
    h.BOX(0, 7.5, yy0, yy1, 30, 65, "#dfe6ec", "url(#galv)", "#9aa6b0", "#3c444c", .5)
# bornes (prisma a lo largo de y no está; uso BOX por borne)
yy = 30
for i in range(2):
    h.BOX(7.5, 68, yy, yy + 17.5, 8, 87, "#fbfbf8", "#ecebe5", "#c9c7bd", "#333", .5)
    q = [(68, yy + 3, 30), (68, yy + 14.5, 30), (68, yy + 14.5, 65), (68, yy + 3, 65)]; poly(h, q, "#2d3038", "#000", .4)
    yy += 17.5
yy += 10
for col in (GRIS_BPN, CEL_BPN, VER_BPN):
    h.BOX(7.5, 57.5, yy, yy + 8.2, 22, 73, sh(col, 1.25), col, sh(col, .74), "#1e2226", .5)
    for zz in (32, 63):
        cx, cy = h.P(57.5, yy + 4.1, zz); h.circ(cx, cy, 6, "url(#niq)", "#333", .5)
    yy += 8.2
# bulón de PAT
cil3(h, (0, 190, 47.5), (14, 190, 47.5), 4, "url(#niq)", "#d6dbe0")
# acrílico adelante, separado (*)
q = [(85, -5, -5), (85, 235, -5), (85, 235, 100), (85, -5, 100)]
poly(h, q, "url(#acril)", "#4a90c2", 1)
h.g3("1", (-1, 225, 90), 1440, 150, "FONDO GALVANIZADO (3011)")
h.g3("2", (7.5, 200, 47), 930, 700, "RIEL NS35 (2038)")
h.g3("3", (57.5, 85, 50), 1440, 330, "BORNES BPN 6")
h.g3("4", (68, 40, 80), 1440, 400, "PORTAFUSIBLES 10 x 38")
h.g3("5", (14, 190, 47.5), 930, 640, "BULON DE PAT")
h.g3("6", (85, 120, 100), 1440, 600, "ACRILICO (ETG 16.1) (*)")
notasW(h, 890, 830, [
    "COTAS EN mm: SALEN DE LA DESCRIPCION DEL PAÑOL (FICHA DE LA APP).",
    "(*) POSICION DEL RIEL, AGUJEROS DE FIJACION, ESPESOR DE 6009 Y ACRILICO: A CONFIRMAR.",
    "(*) 3009 FIGURA CON UNIDAD «m» EN EL CATALOGO: REVISAR SI ES «Un.».",
    "(*) EL TABLERITO PRFV 80 x 130 NO TIENE CODIGO EN EL PAÑOL (VIENE CON LA COLUMNA?).",
    "AP-C-033-A: PLACA A FIJA AL POSTE 120 x 145 CON ROSCAS Ø6 Y PLACA B MOVIL 80 x 130."], w=740)
h.txt(890, 1010, "FUENTE: FICHA TECNICA DE LA APP, AP-CC-014, AP-C-033-A, TC-PRFV-01/02, ETG 16.1 Y CATALOGO DEL PAÑOL.", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-CAJA_COLUMNA-2", "FONDOS Y TABLERITOS", "DE COLUMNA CON RIEL", "PLANTAS, CORTE, CODIGOS Y 3D", "1:1 · S/E", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_caja_columna_2.svg"))
