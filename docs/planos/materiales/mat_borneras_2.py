"""MAT-BORNERAS-2 · Separadores, topes y puentes peine (accesorios de los bornes BPN).
Datos: FICHAS_TEC.borneras pieza 2 (descripciones + Zoloda JSSB-10-xx/BPN, PSB3/10/4), FAMILIAS_MAT.borneras,
catálogo del pañol, TC-PRFV-01/02, AP-T-007/008 (TT / TN-S), CLAUDE.md §11.3. Paso BPN-06 = 8,2 (ficha pieza 1)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
SEPC = "#3b3d41"
# ================= VISTA DE ARRIBA de una tira armada · esc 2:1 =================
e = 3.6; VX, VY = 80, 150; e2 = 2.2
h.titulo(40, 62, "VISTA DE ARRIBA - TIRA ARMADA", "ESC. 3:1 - COTAS EN mm - EJEMPLO TC-PRFV-02")
# orden: tope | PE | N | separador | R | S | T | tope   (como el tablerito de abajo del TC-PRFV-02, dibujado a lo largo del riel)
items = [("tope", 6), ("PE", 8.2), ("N", 8.2), ("sep", 2.5), ("R", 8.2), ("S", 8.2), ("T", 8.2), ("tope", 6)]
L = 53
xx = VX; pos = {}
for n, w in items:
    fill = "#fff"
    h.rect(xx, VY, w * e, L * e, "url(#ANSI31)" if n == "sep" else fill, K, 1.2 if n != "tope" else 1)
    if n in ("PE", "N", "R", "S", "T"):
        for yc in (17, 36): h.circ(xx + w * e / 2, VY + yc * e, 2.3 * e, "#fff", K, .7)
        h.txt(xx + w * e / 2, VY + 47 * e + 4, n, 10, 700, K, "middle")
    if n == "tope":
        h.ln(xx, VY + 9 * e, xx + w * e, VY + 9 * e, K, .4); h.ln(xx, VY + 44 * e, xx + w * e, VY + 44 * e, K, .4)
    pos.setdefault(n, []).append((xx, w))
    xx += w * e
XF = xx
# peine PE-N (el «puente» que une neutro y tierra; nunca la fase)
xpe = pos["PE"][0][0]; xn = pos["N"][0][0]
h.rect(xpe + 2, VY + 24 * e, (8.2 * 2) * e - 4, 4 * e, "url(#cuH)", K, 1)
h.ln(VX - 14, VY + 26 * e, XF + 14, VY + 26 * e, K, .4, h.EJE)
# riel oculto
h.ln(VX - 18, VY + 9 * e, XF + 18, VY + 9 * e, K, .5, h.OCULTA); h.ln(VX - 18, VY + 44 * e, XF + 18, VY + 44 * e, K, .5, h.OCULTA)
h.txt(XF + 22, VY + 9 * e + 4, "RIEL NS35", 9.5, 400, G)
# línea de corte B-B por el separador
xs = pos["sep"][0][0] + 2.5 * e / 2
h.ln(xs, VY - 26, xs, VY + L * e + 26, K, 1, h.EJE)
for yy in (VY - 26, VY + L * e + 26): h.ln(xs - 8, yy, xs + 8, yy, K, 1.8)
h.txt(xs + 6, VY - 30, "B", 13, 700); h.txt(xs + 6, VY + L * e + 40, "B", 13, 700)
# cotas
h.dimH(VY + L * e + 22, xpe, xpe + 8.2 * e, "8,2", ext=VY + L * e + 2)
h.dimH(VY + L * e + 22, pos["sep"][0][0], pos["sep"][0][0] + 2.5 * e, "", ext=VY + L * e + 2)
h.txt(pos["sep"][0][0] + 2.5 * e / 2 + 4, VY + L * e + 52, "2,5 (*)", 11, 400, OR, "middle")
h.dimV(VX - 22, VY, VY + L * e, "53", ext=VX - 2)
h.dimH(VY - 14, pos["tope"][0][0], pos["tope"][0][0] + 6 * e, "", ext=VY - 2)
h.txt(VX + 3 * e, VY - 20, "6 (*)", 10.5, 400, OR, "middle")
# globos (los números del 3D)
h.globo("1", xs, VY + 6 * e, xs + 30, VY - 40 + 8)
h.globo("2", pos["tope"][0][0] + 3 * e, VY + 50 * e, VX - 10, VY + L * e + 60)
h.globo("3", xpe + 8 * e, VY + 26 * e, XF + 70, VY + 26 * e - 40)

# ================= CORTE B-B (por el separador) · esc 2:1 =================
CX, CY = 460, 250
h.titulo(CX, 62, "CORTE B-B (SEPARADOR)", "ESC. 2:1 - SOBRESALE DEL BORNE (*)")
per = perfilBPN()
sep = [(-3, -3), (56, -3), (56, 33), (44, 55), (9, 55), (-3, 33)]       # separador: más grande que el borne (*)
d = "M" + " L".join(f"{CX + 20 + y * e2:.1f},{CY - z * e2:.1f}" for y, z in sep) + " Z"
h.path(d, "url(#ANSI31)", K, 1.4)
d2 = "M" + " L".join(f"{CX + 20 + y * e2:.1f},{CY - z * e2:.1f}" for y, z in per) + " Z"
h.path(d2, "none", K, .7, h.OCULTA)
rielCorte(h, CX + 20 + 9 * e2, CY, e2)
h.dimV(CX + 20 + 56 * e2 + 26, CY, CY - 50 * e2, "50 (BORNE)", ext=CX + 20 + 53 * e2)
h.dimV(CX + 20 + 56 * e2 + 52, CY, CY - 55 * e2, "55 (*)", ext=CX + 20 + 44 * e2, c=OR)
h.dimH(CY + 8.5 * e2 + 26, CX + 20 - 3 * e2, CX + 20 + 56 * e2, "59 (*)", ext=CY, c=OR)
h.txt(CX + 20, CY + 8.5 * e2 + 60, "EN LINEA DE PUNTOS: EL BORNE BPN-06 DE ATRAS.", 10, 400, G)

# ================= D1 · PUENTE PEINE 10 ELEMENTOS · esc 2:1 =================
DX, DY = 460, 362
h.titulo(DX, DY, "D1 - PUENTE PEINE 10 ELEM. P/BPN 6 (2027)", "ESC. 2:1 - SE CORTA A LA MEDIDA: UNE N Y PE, NUNCA LA FASE")
py = DY + 50; pk = 1.75
h.rect(DX + 10, py, 82 * pk, 4 * pk, "url(#cuH)", K, 1)
for i in range(10):
    xp = DX + 10 + (4.1 + i * 8.2) * pk
    h.rect(xp - 1.4 * pk, py + 4 * pk, 2.8 * pk, 9 * pk, "url(#cuH)", K, .7)
h.ln(DX + 10 + 3 * 8.2 * pk, py - 10, DX + 10 + 3 * 8.2 * pk, py + 14 * pk + 6, OR, 1, 'stroke-dasharray="4 2"')
h.txt(DX + 10 + 3 * 8.2 * pk + 4, py - 12, "CORTE (3 ELEM. EN C2)", 9.5, 400, OR)
h.dimH(py + 13 * pk + 24, DX + 10, DX + 10 + 82 * pk, "82 = 10 x 8,2 (*)", ext=py + 13 * pk, c=OR)
h.dimH(py - 14, DX + 10 + 4.1 * pk, DX + 10 + 12.3 * pk, "", ext=py - 2)
h.txt(DX + 10 + 8.2 * pk, py - 20, "8,2", 10.5, 400, K, "middle")
h.dimV(DX + 10 + 82 * pk + 22, py, py + 13 * pk, "13 (*)", ext=DX + 10 + 82 * pk, c=OR)

# ================= TABLA DE CODIGOS =================
uso = {"2041": "ENTRE FASE Y N / PE", "2021": "TOPE EN LA PUNTA", "2059": "TOPE EN LA PUNTA", "2027": "PEINE BPN 6 · EN USO",
       "2023": "PEINE BPN 4", "2024": "PEINE BPN 6 (UN.: m (*))", "2025": "PEINE BPN 16", "2026": "PUENTE BPN 4", "2039": "CENTRAL TB 16",
       "2040": "CENTRAL TB 35", "2042": "ADAPTADOR 1 MODULO", "2011": "BORNERA FIJA (*)", "2012": "BORNERA DIVISIBLE (*)", "2002": "BARRA DE NEUTRO (*)"}
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "PARA QUE"]]
for c in [2041, 2021, 2059, 2027, 2023, 2024, 2025, 2026, 2039, 2040, 2042, 2011, 2012, 2002]:
    r = cat(c, 66); filas.append([r[0], r[1], r[2], uso[str(c)]])
TY = 520
yt = h.tabla(40, TY, [(52, "c", True), (470, "l", False), (40, "c", False), (238, "l", False)], filas, rowh=17, titulo="CODIGOS DEL PAÑOL (14)", colores=colorOR)
ydat = bloque(h, 40, yt + 26, "DATOS TECNICOS", [
    "SEPARADOR: PLACA AISLANTE QUE VA ENTRE LA FASE Y EL NEUTRO / TIERRA.",
    "TOPES (2021, 2059): EN LAS DOS PUNTAS, EVITAN QUE LOS BORNES SE CORRAN EN EL RIEL.",
    "PUENTE PEINE: UNE BORNES IGUALES DE PASO; SE CORTA A LA CANTIDAD DE ELEMENTOS (2027 = 10 ELEM., BPN 6).",
    "PUENTES CENTRALES ZOLODA JSSB-10-xx/BPN Y PEINE PSB3/10/4 (FICHA).",
    "MATERIAL, COLOR Y MEDIDAS DEL SEPARADOR, DEL TOPE Y DEL PEINE: (*)"], w=380)
yu = bloque(h, 440, yt + 26, "DONDE SE USA", [
    "TC-PRFV-01: ABAJO N · SEPARADOR · R · S · T; ARRIBA PE · PE · N CON PEINE (3 ELEM.).",
    "TC-PRFV-02 (CON JABALINA): ABAJO PE · N · R · S · T, PEINE PE-N Y SEPARADOR ENTRE N Y R.",
    "AP-T-007 (TT): EL PUENTE SE CORTA EN DOS TIRAS (NEUTRO Y TIERRA SEPARADOS).",
    "AP-T-008 (TN-S): NEUTRO Y TIERRA PUENTEADOS EN UNA SOLA TIRA."], w=390)
notasW(h, 40, max(ydat, yu) + 12, [
    "COTAS EN mm. PASO 8,2 = BPN-06 (TABLA ZOLODA, MAT-BORNERAS-1). EL LARGO DEL PEINE ES 10 x 8,2, CALCULADO.",
    "(*) ESPESOR Y ALTO DEL SEPARADOR, ANCHO DEL TOPE Y ALTO/MATERIAL DEL PEINE: A CONFIRMAR CON EL FABRICANTE.",
    "(*) 2024 FIGURA EN EL CATALOGO CON UNIDAD «m»: REVISAR SI ES «Un.».",
    "(*) 2011, 2012, 2002, 2039, 2040 Y 2042 NO SE DIBUJAN: LA FICHA NO TRAE MEDIDAS NI FORMA.",
    "(*) EN ESQUEMA TT EL PEINE N-PE NO VA (REVISION B2 DE TC-PRFV): A CONFIRMAR CON EL PROYECTO DE LA PLAZA."], w=800)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - TIRA CON TOPES, SEPARADOR Y PEINE", "TABLERITO DE ABAJO CON JABALINA (TC-PRFV-02): PE · N · SEPARADOR · R · S · T")
h.iso(4.6, 1245, 380)
riel3d(h, -16, 70, 9, -7.5)
x = 0
order = [("tope", 6, "#2b2d31"), ("PE", 8.2, VER_BPN), ("N", 8.2, CEL_BPN), ("sep", 2.5, SEPC), ("R", 8.2, GRIS_BPN), ("S", 8.2, GRIS_BPN), ("T", 8.2, GRIS_BPN), ("tope", 6, "#2b2d31")]
x = -8
for n, w, col in order:
    if n == "tope":
        per = [(9 + y, z) for y, z in [(-1, -3), (36, -3), (36, 12), (30, 22), (5, 22), (-1, 12)]]
        prisma(h, per, x, x + w, (sh(col, 1.5), col, sh(col, .8)), "#111", .5)
        tornilloZ(h, x + w / 2, 26.5, 22, 2.2)
    elif n == "sep":
        per = [(y, z) for y, z in [(-3, -3), (56, -3), (56, 33), (44, 55), (9, 55), (-3, 33)]]
        prisma(h, per, x, x + w, (sh(col, 1.5), col, sh(col, .8)), "#111", .5)
    else:
        borne3d(h, x, w, 0, 0, col)
    x += w
# peine sobre PE y N
xp0 = -8 + 6
prisma(h, [(24, 46), (28, 46), (28, 51), (24, 51)], xp0 + 1, xp0 + 16.4 - 1, ("#f0b070", "#c87a35", "#9c5a1c"), "#6c3210", .5)
# cables: el troncal entra por las bocas
for xc, col in ((-8 + 6 + 8.2 + 4.1, "#4fa3d9"), (-8 + 6 + 16.4 + 2.5 + 4.1, "#7b3f1d"), (-8 + 6 + 16.4 + 2.5 + 12.3, "#1a1a1a"), (-8 + 6 + 16.4 + 2.5 + 20.5, "#c62828"), (-8 + 6 + 4.1, "#2e9d4a")):
    cilY(h, 88, 60, xc, 13, 2.8, col, col); cilY(h, 60, 53.2, xc, 13, 1.7, "url(#cobre)", "#d08a3f")
h.g3("1", (-8 + 6 + 16.4 + 1.2, 40, 52), 1430, 140, "SEPARADOR (2041)")
h.g3("2", (47.5, 36, 14), 1430, 420, "TOPE (2021 / 2059)")
h.g3("3", (xp0 + 8, 26, 54), 1430, 190, "PUENTE PEINE PE-N (2027)")
h.g3("4", (60, 22, 0), 1430, 470, "RIEL DIN NS35 (2038)")
h.g3("5", (-8 + 6 + 16.4 + 2.5 + 12.3, 40, 48), 1430, 240, "BORNES BPN 6 (2009 · 2008 · 2010)")
# esquema de uso del peine (TT / TN-S)
h.txt(890, 720, "COMO SE USA EL PEINE", 12, 700, NV, "start", INT)
def fila(ox, oy, lst, peines, tit):
    xx = ox
    cs = {"PE": VER_BPN, "N": CEL_BPN, "R": GRIS_BPN, "S": GRIS_BPN, "T": GRIS_BPN, "|": SEPC}
    xs = []
    for t in lst:
        w = 8 if t == "|" else 30
        h.rect(xx, oy, w, 50, cs[t], "#333", .7)
        if t != "|": h.txt(xx + w / 2, oy + 31, t, 11, 700, "#fff" if t in ("PE", "N") else K, "middle", INT)
        xs.append((xx, w)); xx += w
    for a, b in peines:
        h.rect(xs[a][0] + 3, oy + 40, xs[b][0] + xs[b][1] - xs[a][0] - 6, 5, "url(#cobre)", "#6c3210", .5)
    h.txt(xx + 16, oy + 22, tit[0], 11, 700, K, "start", INT); h.txt(xx + 16, oy + 40, tit[1], 10.5, 400, G, "start", INT)
fila(900, 740, ["PE", "PE", "N"], [(0, 2)], ("TN-S (AP-T-008): PE · PE · N CON PEINE", "NEUTRO Y TIERRA EN UNA SOLA TIRA"))
fila(900, 810, ["PE", "PE", "N"], [(0, 1)], ("TT (AP-T-007): EL PEINE SE CORTA EN DOS", "PE CON PE · EL N QUEDA SOLO"))
fila(900, 880, ["N", "|", "R", "S", "T"], [], ("FASES: NUNCA CON PEINE", "SEPARADOR ENTRE N Y LA FASE"))
h.txt(890, 970, "FUENTE: FICHA TECNICA DE LA APP (ZOLODA JSSB-10-xx/BPN, PSB3/10/4), TC-PRFV-01/02, AP-T-007/008 Y CATALOGO.", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-BORNERAS-2", "SEPARADORES, TOPES", "Y PUENTES PEINE", "VISTA DE ARRIBA, CORTE, DETALLE, CODIGOS Y 3D", "3:1 · 2:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_borneras_2.svg"))
