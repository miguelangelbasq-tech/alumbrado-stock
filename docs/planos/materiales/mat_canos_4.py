"""MAT-CAÑOS-4 (rev. A) · grupo «nfin»: curva 90° de H°G° Ø3/4" para entrada del cable a la columna (acometida aérea), código 5503 (app, rango x500).
Plano y 3D con los mismos números: r3d/piezas/perfiles_nfin.mjs (CURVA34) → perfiles_nfin.json. 3D: r3d/out/nfin_curva.png.
Rosca R 3/4 ISO 7-1 (14 hilos, 55°, Ø26,441 en el plano de calibre, calibre 9,5, rosca útil 14,5). Radio, patas y colocación: (*). Fuentes: r3d/FUENTES_nfin.md"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *
from nfinkit import PF, cm
import matbfc as _mb

_mb._cat["5503"] = ["5503", 'Curva 90° de H°G° Ø3/4" para entrada del cable a la columna (acometida aérea)', "Un."]
C = PF["CURVA34"]; ro = C["De"] / 2; ri = ro - C["e"]; Rb = C["R"]; P = C["pata"]; Lu = C["Lutil"]; p = C["paso"]
Hf = 0.960491 * p
def rMaj(s): return (C["dMaj"] - (C["Lcal"] - s) / 16) / 2          # s = distancia desde la punta (ISO 7-1: Ø de calibre a 9,5 de la punta)
def rr(s):
    u = (s / p) % 1; tri = 1 - abs(2 * u - 1); rm = rMaj(s)
    return min(rm - Hf / 6, max(rm - Hf * 5 / 6, rm - Hf + Hf * tri))
h = hojaP()

# ================= ELEVACION EN CORTE (2:1) =================
h.titulo(40, 62, "CURVA 90° H°G° Ø3/4\" (5503) · CORTE POR EL EJE", "ESC. 2:1 · CAÑO 26,9 × 2,65 CURVADO · ROSCA R 3/4 EN LAS PUNTAS")
e = 2.0; ox, oy = 130, 340
X = lambda x: ox + x * e; Y = lambda z: oy - z * e
# pata vertical: z de 0 a −P; rosca en los últimos Lu (s = z + P)
for sg in (-1, 1):
    pts = [(X(sg * ri), Y(0)), (X(sg * ro), Y(0)), (X(sg * ro), Y(-P + Lu))]
    pts += [(X(sg * rr(Lu - k * Lu / 80)), Y(-P + Lu - k * Lu / 80)) for k in range(81)]
    pts += [(X(sg * ri), Y(-P))]
    h.path(poly(pts) + " Z", "url(#HG)", K, 1.0)
# arco: centro (Rb, 0), de 180° a 90°
def arco(r0, r1):
    a = [(Rb + r0 * math.cos(math.radians(180 - 90 * i / 48)), r0 * math.sin(math.radians(180 - 90 * i / 48))) for i in range(49)]
    b = [(Rb + r1 * math.cos(math.radians(90 + 90 * i / 48)), r1 * math.sin(math.radians(90 + 90 * i / 48))) for i in range(49)]
    return poly([(X(x), Y(z)) for x, z in a + b]) + " Z"
h.path(arco(Rb + ro, Rb + ri), "url(#HG)", K, 1.0); h.path(arco(Rb - ri, Rb - ro), "url(#HG)", K, 1.0)
# pata horizontal: x de Rb a Rb + P a la altura Rb; rosca en los últimos Lu
for sg in (-1, 1):
    pts = [(X(Rb), Y(Rb + sg * ri)), (X(Rb), Y(Rb + sg * ro)), (X(Rb + P - Lu), Y(Rb + sg * ro))]
    pts += [(X(Rb + P - Lu + k * Lu / 80), Y(Rb + sg * rr(Lu - k * Lu / 80))) for k in range(81)]
    pts += [(X(Rb + P), Y(Rb + sg * ri))]
    h.path(poly(pts) + " Z", "url(#HG)", K, 1.0)
# ejes
h.path(f"M{X(0)},{Y(-P - 12)} V{Y(0)} A{Rb * e},{Rb * e} 0 0 1 {X(Rb)},{Y(Rb)} H{X(Rb + P + 12)}", "none", K, .45, h.EJE)
h.ln(X(Rb), Y(0), X(0), Y(0), K, .4, 'stroke-dasharray="2 2"'); h.ln(X(Rb), Y(0), X(Rb), Y(Rb), K, .4, 'stroke-dasharray="2 2"')
h.ln(X(Rb), Y(0), X(Rb + Rb * math.cos(math.radians(135))), Y(Rb * math.sin(math.radians(135))), K, .6)
h.txt(X(Rb - 30), Y(26), "R80 (*)", 10, 700, OR, "middle")
# cotas
h.dimV(X(-ro) - 20, Y(0), Y(-P), "60 (*)", ext=X(-ro), c=OR)
h.dimH(Y(Rb + ro) - 26, X(Rb), X(Rb + P), "60 (*)", ext=Y(Rb + ro), c=OR)
h.dimH(Y(-P) + 22, X(-ro), X(ro), "Ø26,9", ext=Y(-P))
h.dimV(X(Rb + P) + 22, Y(Rb + ro), Y(Rb - ro), "Ø26,9", ext=X(Rb + P))
h.dimV(X(ro) + 16, Y(-P + Lu), Y(-P), "14,5", ext=X(ro))
h.dimH(Y(Rb - ro) + 20, X(Rb + P - Lu), X(Rb + P), "14,5", ext=Y(Rb - ro))
llamada(h, X(ri + 1), Y(-P / 2 + 10), X(ri) + 70, Y(-P / 2 + 10), "PARED 2,65 (*) · H°G°")
llamada(h, X(ro - .5), Y(-P + 4), X(ro) + 60, Y(-P + 30), "ROSCA R 3/4 (ISO 7-1)")
h.circ(X(Rb + P - Lu / 2), Y(Rb + ro), 13, "none", K, .6, 'stroke-dasharray="3 2"'); h.txt(X(Rb + P - Lu / 2) + 16, Y(Rb + ro) - 12, "D1", 10, 700)
lineaCorte(h, X(Rb + P * .18), Y(Rb + ro) - 10, X(Rb + P * .18), Y(Rb - ro) + 14, "A")
for i, t in enumerate(["(*) SE DIBUJA CURVA DE CAÑO CON ROSCA MACHO EN LAS DOS PUNTAS.", "SI ES DE FUNDICION (EN 10242 G1 / G4, HEMBRA) CAMBIA LA PUNTA:", "CONFIRMAR CON LA QUE TIENE EL PAÑOL."]):
    h.txt(40, 530 + i * 13, t, 9.5, 400, OR)

# ================= D1 ROSCA (10:1) =================
h.titulo(520, 62, "D1 - ROSCA R 3/4 (ISO 7-1)", "ESC. 10:1 · 55° · P = 1,814 (25,4 / 14) · CONICA 1:16")
ed = 10.0; x2, y2 = 540, 170; pts = []
for i in range(4 * 16 + 1):
    z = 4 * p * i / 64; u = (z / p) % 1; tri = 1 - abs(2 * u - 1); r_ = min(Hf * 5 / 6, max(Hf / 6, Hf * tri)); pts.append((x2 + z * ed, y2 - (r_ - Hf / 6) * ed + z * ed / 32))
h.path(poly(pts) + f" L{x2 + 4 * p * ed},{y2 + 30} L{x2},{y2 + 30} Z", "url(#HG)", K, 1.1)
h.dimH(y2 - 0.64 * p * ed - 16, x2 + p * ed * .5, x2 + p * ed * 1.5, "1,814", ext=y2 - .64 * p * ed)
h.dimV(x2 + 4 * p * ed + 14, y2 - (Hf * 5 / 6 - Hf / 6) * ed, y2, "1,16", ext=x2 + 4 * p * ed)
cols = [(150, "l", False), (80, "c", True), (90, "l", False)]
fil = [["DATO (R 3/4)", "VALOR", "FUENTE"], ["HILOS POR PULGADA", "14", "ISO 7-1"], ["PASO", "1,814", "ISO 7-1"], ["Ø EN EL PLANO DE CALIBRE", "26,441", "ISO 7-1"],
       ["LARGO DE CALIBRE", "9,5", "ISO 7-1"], ["ROSCA UTIL (MIN.)", "14,5", "ISO 7-1"], ["ALTURA DEL FILETE", "1,162", "0,640 P"], ["CONICIDAD", "1:16", "EN EL Ø"]]
tablaC(h, 520, 240, cols, fil, "DATOS DE LA ROSCA", rowh=14)

# ================= CORTE A-A (3:1) =================
h.titulo(520, 400, "CORTE A-A", "ESC. 3:1 · CON EL CABLE ADENTRO (*)")
e3 = 3.0
cx, cy = 600, 480
h.circ(cx, cy, ro * e3, "url(#HG)", K, 1.3); h.circ(cx, cy, ri * e3, "#fff", K, 1.0)
h.circ(cx, cy + (ri - 6.2) * e3, 6 * e3, "url(#PVCV)", K, 1.0)
ejeH(h, cx - ro * e3 - 10, cx + ro * e3 + 10, cy); ejeV(h, cx, cy - ro * e3 - 10, cy + ro * e3 + 10)
h.dimH(cy + ro * e3 + 16, cx - ri * e3, cx + ri * e3, "Ø21,6 LIBRE (*)", ext=cy, c=OR)
llamada(h, cx + 6 * e3 - 4, cy + (ri - 6.2) * e3 + 6, cx + ro * e3 + 30, cy + 20, "CABLE DE LA ACOMETIDA Ø12 (*)")

# ================= TABLAS =================
yC = codigos(h, 40, 590, [5503], {5503: "1 por columna aérea (app)"}, wdesc=530, wx=176, rowh=15)
yD = bloque(h, 40, yC + 14, "DATOS TECNICOS Y DONDE SE USA", [
    "VA UNA POR COLUMNA METALICA CON ACOMETIDA AEREA (APP · RECETA DE COLUMNA AEREA DE LA PLANILLA «PROYECTO AVANCE DE OBRA» DE EMA).",
    "EL CONCENTRICO QUE BAJA DE LA RED SE ATA EN EL AISLADOR MN 16 Y ENTRA A LA COLUMNA POR ESTA CURVA, SIN ROZAR EL BORDE DEL AGUJERO (FICHA DE LA APP).",
    "LA BOCA DE AFUERA MIRA PARA ABAJO: EL AGUA NO ENTRA A LA COLUMNA (MISMO CRITERIO QUE LA PIPETA 5502, MAT-FLEJE-2).",
    "CAÑO 3/4\" H°G° DE LA FAMILIA DEL ITEM 77 (CAÑO DE PAT): MISMO Ø Y ROSCA."], w=800, sz=10, lh=13.5)
notasW(h, 40, yD + 2, [
    "5503 ES CODIGO DE LA APP (RANGO x500, MATERIAL QUE TRAE LA APP). DESCRIPCION Y UNIDAD TAL CUAL EL CATALOGO.",
    "(*) RADIO DE CURVADO (80), LARGO DE LAS PATAS (60), ESPESOR (2,65), SI ES CURVA DE CAÑO O DE FUNDICION Y SI LA PUNTA ES MACHO O HEMBRA: A CONFIRMAR CON LA QUE COMPRA EL PAÑOL.",
    "(*) COMO SE FIJA A LA COLUMNA (TUERCA Y CONTRATUERCA, BOQUILLA O SOLO APOYADA EN EL AGUJERO), A QUE ALTURA VA EL AGUJERO Y EL Ø DEL CONCENTRICO: A CONFIRMAR (NO HAY PLANO).",
    "ROSCA: ISO 7-1 (R 3/4, 55°, 14 HILOS/\"). SELLAR CON CINTA O PASTA SI SE ENROSCA. FUENTES: r3d/FUENTES_nfin.md."], w=800, lh=14)
rayadosC(h, 40, 1104, ["HG", "PVCV"], cols=2, dx=200)

# ================= ESQUEMA EN SU LUGAR =================
h.titulo(890, 62, "VISTA 3D - CURVA 5503 CON LA PATA DE ARRIBA ABIERTA", "ROSCA BSP CONICA REAL EN CORTE · EL CABLE ENTRA POR LA PATA HORIZONTAL Y SALE ABAJO")
A = img3d(h, "nfin_curva", 930, 96, 540)
columna(h, A, [("curva", "1", "CURVA 90° R80 (*)"), ("roscaH", "2", "ROSCA R 3/4 (CORTE)"), ("pared", "", "PARED 2,65 (*)"), ("cable", "", "CABLE DE LA ACOMETIDA (*)"),
               ("patH", "", "PATA 60 (*)"), ("patV", "", "PATA 60 (*)"), ("roscaV", "2", "ROSCA R 3/4"), ("cableB", "", "BAJA POR ADENTRO")], 1450, 120, 470, paso=36)
h.txt(890, 520, "EN SU LUGAR - ESQUEMA (*): CONCENTRICO DE LA RED → AISLADOR MN 16 → CURVA 5503 → ADENTRO DE LA COLUMNA", 11, 700, NV, "start", INT)
sx, sy = 1060, 560; k = .5
h.rect(sx, sy, 60, 440, "url(#HG)", K, 1.0); h.rect(sx + 6, sy, 48, 440, "#fff", K, .6)          # columna metálica (esquema, Ø AC)
h.txt(sx + 30, sy + 456, "COLUMNA METALICA (*)", 9.5, 700, K, "middle")
h.circ(sx - 30, sy + 60, 12, "url(#PORC)", K, 1.0); h.ln(sx - 18, sy + 60, sx, sy + 60, K, 2.2); h.txt(sx - 48, sy + 64, "MN 16", 9.5, 700, K, "end")
h.path(f"M{sx - 150},{sy + 20} C{sx - 110},{sy + 30} {sx - 70},{sy + 40} {sx - 40},{sy + 52}", "none", K, 2.4)      # concéntrico de la red
# curva: pata de adentro horizontal por el agujero, pata de afuera con la boca para abajo (*); el cable hace un lazo de goteo y sube a la boca
cyc = sy + 200; rc = 22; xb = sx - 40
cur = f"M{sx + 30},{cyc} H{xb + rc} A{rc},{rc} 0 0 0 {xb},{cyc + rc} V{cyc + rc + 24}"
h.path(cur, "none", K, 9); h.path(cur, "none", "#fff", 5)
h.path(f"M{sx - 30},{sy + 72} C{sx - 60},{sy + 120} {sx - 80},{cyc + 40} {sx - 76},{cyc + 80} C{sx - 72},{cyc + 104} {xb},{cyc + 100} {xb},{cyc + rc + 24} V{cyc + rc} A{rc},{rc} 0 0 1 {xb + rc},{cyc} H{sx + 40} Q{sx + 46},{cyc} {sx + 46},{cyc + 20} V{sy + 430}", "none", K, 2.0)
h.ln(sx, cyc - 10, sx, cyc + 10, "#fff", 3)
for n, (gx, gy), (tx_, ty_), t in [("1", (xb + 4, cyc + 8), (sx + 140, cyc - 20), "CURVA 5503: BOCA PARA ABAJO (*)"), ("3", (sx - 30, sy + 60), (sx + 140, sy + 60), "AISLADOR MN 16 (ATADURA)"),
                                   ("4", (sx - 110, sy + 30), (sx + 140, sy + 20), "CONCENTRICO DE LA RED"), ("5", (sx + 3, cyc), (sx + 140, cyc + 30), "AGUJERO EN LA COLUMNA (*)"),
                                   ("7", (sx - 74, cyc + 84), (sx + 140, cyc + 80), "LAZO DE GOTEO (*)"), ("6", (sx + 46, cyc + 160), (sx + 140, cyc + 150), "SIGUE POR ADENTRO AL TABLERITO")]:
    h.globo(n, gx, gy, tx_, ty_, r=8); h.txt(tx_ + 14, ty_ + 4, t, 9.5, 700 if "(*)" not in t else 400, K if "(*)" not in t else OR)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/nfin_curva.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_nfin.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-CAÑOS-4", "CURVA 90° H°G° Ø3/4\"", "ENTRADA A LA COLUMNA", "CORTE, D1 ROSCA, CORTE A-A, ESQUEMA Y 3D", "2:1 / 3:1", "D1 10:1 · 3D S/E", rev="A", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_canos_4.svg"))
