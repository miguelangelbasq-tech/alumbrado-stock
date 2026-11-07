"""MAT-CANAL_RIEL-1 · Riel DIN NS35 (EN 60715).
Datos: FICHAS_TEC.canal_riel pieza 1 (acero cincado 1 mm; 35 × 7,5, también 15; ranuras 6,2 × 15 cada 25; tiras de 1 o 2 m),
AP-PL-002 (14 cm por caja + 2 tornillos cabeza tanque 6×3/8), AP-T-002 (4 barras de 50 cm), catálogo 2038."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
# ================= PERFIL NS35 x 7,5 · esc 6:1 =================
e = 6.0
h.titulo(40, 62, "CORTE A-A - PERFIL NS35 x 7,5", "ESC. 6:1 - COTAS EN mm")
X0, Y0 = 90, 150
rielCorte(h, X0, Y0, e)
h.dimH(Y0 - 24, X0, X0 + 35 * e, "35", ext=Y0 - 2)
h.dimH(Y0 + 7.5 * e + 24, X0 + 4 * e, X0 + 31 * e, "27", ext=Y0 + 7.5 * e + 2)
h.dimH(Y0 + 7.5 * e + 50, X0 + 5 * e, X0 + 30 * e, "25", ext=Y0 + 6.5 * e + 2)
h.dimV(X0 + 35 * e + 26, Y0, Y0 + 7.5 * e, "7,5", ext=X0 + 31 * e + 2)
h.dimV(X0 - 22, Y0, Y0 + 1 * e, "", ext=X0 - 2); h.txt(X0 - 30, Y0 + 4, "1,0", 11, 400, K, "end")
h.dimH(Y0 - 50, X0, X0 + 5 * e, "5", ext=Y0 - 26)
h.txt(X0 + 17.5 * e, Y0 + 7.5 * e + 76, "CHAPA DE ACERO CINCADO DE 1,0 mm", 10.5, 400, K, "middle")
h.globo("1", X0 + 2 * e, Y0 + .5 * e, X0 - 30, Y0 + 70)
h.globo("2", X0 + 17.5 * e, Y0 + 7 * e, X0 + 17.5 * e + 120, Y0 + 100)
# ================= PERFIL NS35 x 15 =================
h.titulo(400, 62, "VARIANTE NS35 x 15", "ESC. 4:1 - LA FICHA LA NOMBRA; EL PAÑOL TIENE LA DE 7,5")
k = 4.0; X1, Y1 = 440, 150
q = [(0, 0), (5, 0), (5, 14), (30, 14), (30, 0), (35, 0), (35, 1), (31, 1), (31, 15), (4, 15), (4, 1), (0, 1)]
h.path("M" + " L".join(f"{X1 + a * k:.1f},{Y1 + b * k:.1f}" for a, b in q) + " Z", "url(#ANSI31)", K, .9)
h.dimH(Y1 - 20, X1, X1 + 35 * k, "35", ext=Y1 - 2)
h.dimV(X1 + 35 * k + 24, Y1, Y1 + 15 * k, "15", ext=X1 + 31 * k + 2)
# ================= VISTA DE ARRIBA · esc 2:1 =================
h.titulo(40, 330, "VISTA DE ARRIBA - RANURAS", "ESC. 2:1 - TRAMO DE 140 mm (UNA CAJA DE COLUMNA, AP-PL-002)")
k2 = 2.6; X2, Y2 = 70, 400
h.rect(X2, Y2, 140 * k2, 35 * k2, "#fff", K, 1.5)
h.ln(X2, Y2 + 5 * k2, X2 + 140 * k2, Y2 + 5 * k2, K, .6); h.ln(X2, Y2 + 30 * k2, X2 + 140 * k2, Y2 + 30 * k2, K, .6)
xs = []
for i in range(5):
    xc = X2 + (20 + i * 25) * k2; xs.append(xc)
    h.rect(xc - 7.5 * k2, Y2 + (17.5 - 3.1) * k2, 15 * k2, 6.2 * k2, "#fff", K, .9, f'rx="{3.1 * k2:.1f}"')
    h.ln(xc, Y2 - 8, xc, Y2 + 35 * k2 + 8, K, .4, h.EJE)
h.ln(X2 - 10, Y2 + 17.5 * k2, X2 + 140 * k2 + 10, Y2 + 17.5 * k2, K, .4, h.EJE)
h.dimH(Y2 - 20, xs[0], xs[1], "25", ext=Y2 - 10)
h.dimH(Y2 + 35 * k2 + 22, xs[2] - 7.5 * k2, xs[2] + 7.5 * k2, "15", ext=Y2 + 20.6 * k2)
h.dimV(X2 + 140 * k2 + 26, Y2 + 14.4 * k2, Y2 + 20.6 * k2, "6,2", ext=X2 + 140 * k2 + 2)
h.dimH(Y2 + 35 * k2 + 50, X2, X2 + 140 * k2, "140 POR CAJA (AP-PL-002)", ext=Y2 + 35 * k2 + 2)
# línea de corte A-A
xa = X2 + 8 * k2
for yy in (Y2 - 26, Y2 + 35 * k2 + 26): h.ln(xa - 8, yy, xa + 8, yy, K, 1.8)
h.ln(xa, Y2 - 26, xa, Y2 + 35 * k2 + 26, K, .8, h.EJE); h.txt(xa - 12, Y2 - 22, "A", 12, 700, K, "end")
h.globo("3", xs[3], Y2 + 17.5 * k2, xs[3] + 30, Y2 - 34)
h.globo("4", xs[1], Y2 + 17.5 * k2, xs[1] + 30, Y2 + 35 * k2 + 76)
h.txt(xs[1] + 46, Y2 + 35 * k2 + 80, "TORNILLO CABEZA TANQUE 6 x 3/8 (2 POR CAJA) EN LA RANURA", 10, 400)
# ================= COMPUTO =================
fc = [["DONDE", "RIEL", "CALCULO"], ["CAJA COL. (AP-PL-002)", "140 mm", "+ 2 TORN. 6 x 3/8"],
      ["TABLERO (AP-T-002)", "2,00 m", "4 x 50 cm"], ["TABLERITO PRFV", "≤ 80 (*)", "1 POR TABLERITO (*)"]]
yc = h.tabla(500, 330, [(130, "l", False), (72, "c", True), (130, "l", False)], fc, rowh=17, titulo="COMPUTO", colores=colorOR)
# ================= TABLA DE CODIGOS =================
yt = h.tabla(40, 650, [(52, "c", True), (470, "l", False), (40, "c", False), (238, "l", False)],
             [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "MEDIDAS (FICHA)"], cat(2038) + ["35 x 7,5 · CHAPA 1,0"]], rowh=17, titulo="CODIGOS DEL PAÑOL (1)")
ydat = bloque(h, 40, yt + 26, "DATOS TECNICOS", [
    "RIEL EN 60715 (DIN 46277-3), PERFIL «SOMBRERO» NS35.",
    "ACERO CINCADO DE 1,0 mm · 35 DE ANCHO x 7,5 DE ALTO (TAMBIEN 15).",
    "RANURAS 6,2 x 15 CADA 25 PARA ATORNILLARLO AL FONDO.",
    "TIRAS DE 1 o 2 m: CUAL ES LA DEL PAÑOL (*)"], w=390)
yu = bloque(h, 450, yt + 26, "DONDE SE USA", [
    "CAJA DE COLUMNA PRFV (TC-PRFV-01/02): RIEL HORIZONTAL EN CADA TABLERITO, CON BORNES BPN Y PORTAFUSIBLES.",
    "AP-CC-014: TABLERITO DE COLUMNA METALICA CON RIEL NS35 Y 2 TORNILLOS CABEZA TANQUE 6 x 3/8.",
    "TABLEROS (AP-T-002): RIEL NS35 EN 4 BARRAS DE 50 cm PARA LOS APARATOS MODULARES."], w=390)
notasW(h, 40, max(ydat, yu) + 10, [
    "COTAS EN mm (FICHA DE LA APP: EN 60715; RANURADO SEGUN EJEMPLO DE PHOENIX CONTACT).",
    "(*) LARGO DE LA TIRA DEL PAÑOL (1 o 2 m) Y LARGO DEL TRAMO EN EL TABLERITO PRFV: A CONFIRMAR.",
    "EL CATALOGO LO TIENE EN «Un.»: CONFIRMAR SI ES LA TIRA ENTERA."], w=800)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - RIEL NS35 CON SUS RANURAS", "ACERO CINCADO; DOS BORNES BPN ENGANCHADOS Y LOS TORNILLOS EN LAS RANURAS")
setIso(h, 3.8, 1110, 360)
riel3d(h, 0, 140, 0, 0)
# tornillos cabeza tanque en 2 ranuras
for xc in (45, 120):
    cx, cy = h.P(xc, 17.5, 1.2)
    h.a(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{5.5*3.8*.87:.1f}" ry="{5.5*3.8*.5:.1f}" fill="url(#niq)" stroke="#333" stroke-width=".6"/>')
    a, b = h.P(xc - 4, 17.5, 1.2), h.P(xc + 4, 17.5, 1.2); h.ln(a[0], a[1], b[0], b[1], "#333", 1.4)
# borne BPN enganchado (gris) y un portafusible (crema) para mostrar el uso
borne3d(h, 70, 8.2, -9, 7.5, GRIS_BPN)
borne3d(h, 78.2, 8.2, -9, 7.5, CEL_BPN)
h.g3("1", (2, 2, 7.5), 930, 520, "ALA (CHAPA 1,0)")
h.g3("2", (20, 20, 1), 930, 580, "FONDO DEL CANAL")
h.g3("3", (95, 17.5, 1), 930, 640, "RANURA 6,2 x 15 CADA 25")
h.g3("4", (120, 17.5, 1.2), 930, 700, "TORNILLO CABEZA TANQUE 6 x 3/8")
h.g3("5", (74, 20, 52), 1440, 150, "BORNE BPN (MAT-BORNERAS-1)")
h.txt(890, 1010, "FUENTE: FICHA TECNICA DE LA APP (EN 60715, PHOENIX CONTACT), AP-PL-002, AP-T-002 Y CATALOGO DEL PAÑOL.", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-CANAL_RIEL-1", "RIEL DIN NS35", "(EN 60715)", "PERFILES, RANURAS, COMPUTO, CODIGO Y 3D", "6:1 · 2:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_canal_riel_1.svg"))
