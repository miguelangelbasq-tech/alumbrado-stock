"""MAT-CANAL_RIEL-2 · Cable canal ranurado 30×30 y 40×30.
Datos: FICHAS_TEC.canal_riel pieza 2 (PVC gris, ranuras laterales, tapa a presión, tiras de 2 m; 30 × 30 y 40 × 30 mm),
FAMILIAS_MAT.canal_riel, catálogo 5001 / 5002."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
T = 1.5   # espesor de pared (*)
# ================= CORTE A-A =================
e = 4.5
h.titulo(40, 62, "CORTE A-A - 40 x 30 (5002) Y 30 x 30 (5001)", "ESC. 9:2 - COTAS EN mm")
for i, (Wd, cod) in enumerate(((40, "5002"), (30, "5001"))):
    X0, Y0 = 80 + i * 260, 140
    h.path(f"M{X0},{Y0} v{30 * e} h{Wd * e} v{-30 * e} h{-T * e} v{(30 - T) * e} h{-(Wd - 2 * T) * e} v{-(30 - T) * e} z", "url(#ANSI31)", K, 1.2)
    # tapa a presión
    h.path(f"M{X0 - 2},{Y0 - 2 * e} h{Wd * e + 4} v{2 * e} h-6 v{3 * e} h-3 v{-3 * e} H{X0 + 7} v{3 * e} h-3 v{-3 * e} h-6 z", "url(#ANSI31)", K, 1)
    for k_, col in enumerate(("#fff",) * (5 if Wd == 40 else 3)):
        h.circ(X0 + (6 + k_ * 7) * e, Y0 + (30 - 5) * e, 2.6 * e, "#fff", K, .8)
    h.dimH(Y0 + 30 * e + 24, X0, X0 + Wd * e, str(Wd), ext=Y0 + 30 * e + 2)
    h.dimV(X0 - 22, Y0, Y0 + 30 * e, "30", ext=X0 - 2)
    h.txt(X0 + Wd * e / 2, Y0 + 30 * e + 52, cod, 11, 700, K, "middle", MONO)
X0 = 80
h.txt(X0 - 56, 140 + 15 * e + 30, "PARED (*)", 10, 400, OR)
h.globo("1", X0 + 40 * e - 4, 140 - e, X0 + 40 * e + 40, 110)
h.globo("2", X0 + T * e / 2, 140 + 15 * e, X0 - 40, 140 + 15 * e)
h.globo("3", X0 + 12 * e, 140 + 25 * e, X0 + 12 * e + 10, 140 + 30 * e + 70)
h.txt(X0 + 12 * e + 26, 140 + 30 * e + 74, "CABLES DEL TABLERO", 10, 400)
# ================= VISTA LATERAL (RANURAS) =================
k = 2.4
h.titulo(40, 400, "VISTA LATERAL - RANURAS", "ESC. 5:2 - TRAMO DE 150 mm · RANURAS (*)")
X2, Y2 = 70, 450
h.rect(X2, Y2, 150 * k, 30 * k, "#fff", K, 1.4)
h.rect(X2, Y2 - 2 * k, 150 * k, 2 * k, "#fff", K, 1)
for i in range(18):
    xx = X2 + (4 + i * 8.2) * k
    h.rect(xx, Y2, 4 * k, 22 * k, "#fff", K, .8)
h.dimH(Y2 + 30 * k + 22, X2 + 4 * k, X2 + 12.2 * k, "", ext=Y2 + 22 * k + 2); h.txt(X2 + 8 * k, Y2 + 30 * k + 38, "PASO (*)", 10, 400, OR, "middle")
h.dimV(X2 + 150 * k + 22, Y2, Y2 + 22 * k, "(*)", ext=X2 + 150 * k + 2, c=OR)
# línea de corte A-A
xa = X2 + 140 * k
for yy in (Y2 - 26, Y2 + 30 * k + 16): h.ln(xa - 8, yy, xa + 8, yy, K, 1.8)
h.ln(xa, Y2 - 26, xa, Y2 + 30 * k + 16, K, .8, h.EJE); h.txt(xa + 12, Y2 - 22, "A", 12, 700)
h.txt(X2, Y2 + 30 * k + 66, "LOS CABLES SALEN POR LAS RANURAS Y SE ORDENAN SIN CRUZARSE.", 10.5, 400)
# ================= TABLA DE CODIGOS =================
yt = h.tabla(40, 680, [(52, "c", True), (470, "l", False), (40, "c", False), (238, "l", False)],
             [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "MEDIDAS (FICHA)"], cat(5001) + ["30 x 30 mm"], cat(5002) + ["40 x 30 mm"]],
             rowh=17, titulo="CODIGOS DEL PAÑOL (2)")
ydat = bloque(h, 40, yt + 26, "DATOS TECNICOS", [
    "CANAL DE PVC GRIS CON RANURAS LATERALES Y TAPA A PRESION.",
    "30 x 30 mm (5001) Y 40 x 30 mm (5002), EN TIRAS DE 2 m.",
    "ESPESOR DE PARED, ANCHO Y PASO DE LAS RANURAS (*)"], w=390)
yu = bloque(h, 450, yt + 26, "DONDE SE USA", [
    "INTERIOR DEL TABLERO DE MEDICION Y COMANDO: LLEVA EL CABLEADO ORDENADO ENTRE LOS APARATOS DEL RIEL.",
    "LA FICHA NO LO ASOCIA A NINGUN PLANO TIPO (AP-T-…): A CONFIRMAR EN QUE TABLERO VA (*)"], w=390)
notasW(h, 40, max(ydat, yu) + 10, [
    "COTAS EN mm: 30 x 30 Y 40 x 30 SALEN DE LA DESCRIPCION DEL PAÑOL.",
    "(*) PARED, RANURAS Y TAPA DIBUJADAS ESQUEMATICAS: A CONFIRMAR CON EL FABRICANTE.",
    "EL CATALOGO LO TIENE EN «Un.»: CONFIRMAR SI ES LA TIRA DE 2 m."], w=800)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - CABLE CANAL 40 x 30 CON LA TAPA CORRIDA", "PVC GRIS, LOS CABLES SALEN POR LAS RANURAS HACIA LOS APARATOS")
setIso(h, 3.0, 1150, 330)
Lc, Wc, Hc = 150, 40, 30
PVC = ("#eef0f2", "#cfd3d8", "#a9afb5")
# fondo
prisma(h, [(0, 0), (Wc, 0), (Wc, T), (0, T)], 0, Lc, PVC, "#555", .5)
# pared de atrás (y=0..T)
prisma(h, [(0, T), (T, T), (T, Hc), (0, Hc)], 0, Lc, PVC, "#555", .5)
# cables adentro
for i, col in enumerate(("#7b3f1d", "#1a1a1a", "#c62828", "#4fa3d9", "#2e9d4a")):
    cil3(h, (0, 6 + i * 7, 5), (Lc + 4, 6 + i * 7, 5), 2.3, col, col)
x = 0
while x < Lc:
    prisma(h, [(Wc - T, T), (Wc, T), (Wc, Hc), (Wc - T, Hc)], x, min(x + 4, Lc), PVC, "#555", .45); x += 4
    if x < Lc:
        prisma(h, [(Wc - T, T), (Wc, T), (Wc, 8), (Wc - T, 8)], x, min(x + 4.2, Lc), PVC, "#555", .45); x += 4.2
cil3(h, (60, 34, 14), (62, 60, 22), 2.3, "#c62828", "#c62828")
# tapa corrida (desde x=70)
prisma(h, [(-1, Hc), (Wc + 1, Hc), (Wc + 1, Hc + 2), (-1, Hc + 2)], 75, Lc + 30, ("#f6f7f8", "#d9dde1", "#b5bbc1"), "#555", .5)
h.g3("1", (120, 20, Hc + 2), 1440, 150, "TAPA A PRESION")
h.g3("2", (34, Wc, 20), 930, 560, "RANURAS LATERALES (*)")
h.g3("3", (30, 13, 5), 930, 200, "CABLES DEL TABLERO")
h.g3("4", (61, 47, 17), 930, 620, "SALE POR LA RANURA")
h.txt(890, 1010, "FUENTE: FICHA TECNICA DE LA APP («DESCRIPCIONES DEL PAÑOL») Y CATALOGO DEL PAÑOL.", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-CANAL_RIEL-2", "CABLE CANAL", "RANURADO 30 x 30 / 40 x 30", "CORTE, VISTA LATERAL, CODIGOS Y 3D", "9:2 · 5:2", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_canal_riel_2.svg"))
