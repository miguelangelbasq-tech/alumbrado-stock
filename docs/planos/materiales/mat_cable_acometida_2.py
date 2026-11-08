"""MAT-CABLE_ACOMETIDA-2 (rev. B) · Bajada Cu 4 × 16 mm² (1027 autoportante IRAM 2164 · 1028 XLPE/LSZH IRAM 62266 · 1004) y antihurto concéntrico (1002 · 1003).
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (CAB.c4x16b, ANTI); 3D: r3d/out/cab_acom2.png y cab_acom2b.png.
Ø y espesores NO están en la ficha (depende del fabricante): (*) a confirmar. Fuentes: r3d/FUENTES_cables.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

C = PC["CAB"]["c4x16b"]; c0 = C["conds"][0]; AN = PC["ANTI"]
h = hoja()

# =============== VISTA LATERAL ===============
h.titulo(40, 62, "VISTA LATERAL - PUNTA PELADA", "ESC. 2,5:1 · 4 x 16 mm² (1027 / 1028) · LARGOS DE PELADO ILUSTRATIVOS (*)")
e = 2.5; X0, YC = 150, 210
La, Lc = [46, 56, 66, 76], [62, 72, 82, 92]
pts = lateral(h, X0, YC, e, C, -36, 0, 8, La, Lc, sep=7.4, cortar=-18)
for (x, y, xa, r, rr), f in zip(pts, ["L1", "L2", "L3", "N"]): h.txt(x + 6, y + 4, f, 10.5, 700)
h.dimV(X0 - 36 * e - 22, YC - C["Ro"] * e, YC + C["Ro"] * e, "Ø ≈ 20 (*)", ext=X0 - 36 * e - 4, c=OR)
yb = YC + 62
h.dimH(yb, X0 + La[3] * e, X0 + Lc[3] * e, "", ext=pts[3][1] + pts[3][4]); h.txt(X0 + (La[3] + Lc[3]) / 2 * e, yb + 14, "16 (*)", 9.5, 400, OR, "middle")
h.txt(X0 + La[3] * e - 10, yb + 30, "PELADO SEGUN EL TERMINAL DE OJAL 16 mm² (2046)", 9, 400, G, "end")
for n, x, y in [("1", X0 - 50, YC - C["Ro"] * e), ("2", X0 + 4 * e, YC - C["Ri"] * e + 4), ("3", pts[0][2] - 14, pts[0][1] - pts[0][3]), ("4", pts[0][0] - 10, pts[0][1] - pts[0][4])]:
    h.globo(n, x, y, x, 112, r=9)

# =============== CORTE A-A ===============
h.titulo(560, 62, "CORTE A-A", "ESC. 8:1 · TETRAPOLAR 4 x 16 (*)")
ec = 8.0; cx, cy = 610, 222
corte(h, cx, cy, ec, C); R0 = C["Ro"] * ec
h.dimH(cy + R0 + 24, cx - R0, cx + R0, "Ø SEGUN FABRICANTE (*)", ext=cy, c=OR)
p = (cx + c0["y"] * ec, cy - c0["z"] * ec)
for i, (t, (ax, ay)) in enumerate([("1 · VAINA (XLPE O LSZH) (*)", (cx + R0 * .78, cy - R0 * .55)), ("2 · RELLENO", (cx + 1, cy + 2)),
                                   ("3 · XLPE (*)", (p[0] - c0["rc"] * ec * .75, p[1] + c0["rc"] * ec * .62)), ("4 · Cu 16 · 7 x Ø1,71 (*)", (p[0] + 2, p[1] + 2))]):
    ty = 130 + i * 26; llamada(h, ax, ay, 705, ty - 4, "", K); h.txt(708, ty, t, 9.2, 400, OR if "(*)" in t else K)
h.txt(708, 236, f"Ø Cu ≈ {2*c0['R']:.2f} (CALC.)".replace(".", ","), 9.4, 400, G)

# =============== D1 a color ===============
h.titulo(40, 352, "DETALLE D1 - CORTE A COLOR", "S/E · AEA 90364")
ed = 6.0; dx_, dy_ = 140, 470
h.circ(dx_, dy_, C["Ro"] * ed + 8, "none", K, .6, 'stroke-dasharray="4 3"')
corte(h, dx_, dy_, ed, C, color=True)
leyendaF(h, 250, 430, ["L1", "L2", "L3", "N"], 2, 110)
h.txt(250, 476, "TETRAPOLAR: 3 FASES + NEUTRO DEL MISMO 16 mm².", 9.8)
h.txt(250, 492, "COLORES DEL ROLLO (*) A CONFIRMAR.", 9.8, 400, OR)

# =============== D2 antihurto ===============
h.titulo(560, 352, "D2 - ANTIHURTO CONCENTRICO", "ESC. 12:1 · 1003 (4/4) · 1002 (2,5/2,5) (*)")
ea = 12.0; ax_, ay_ = 610, 470
h.path(circd(ax_, ay_, AN["Ro"] * ea) + " " + circd(ax_, ay_, AN["rCinta"] * ea, cw=False), "url(#PVCV)", K, 1.3, 'fill-rule="evenodd"')
h.circ(ax_, ay_, AN["rCinta"] * ea, "#fff", K, .8)
for i in range(AN["nAl"]):
    a = 2 * math.pi * i / AN["nAl"]; h.circ(ax_ + AN["rN"] * ea * math.cos(a), ay_ + AN["rN"] * ea * math.sin(a), AN["rwN"] * ea * .95, "url(#CU)", K, .6)
nucleo2d(h, ax_, ay_, ea, {**AN["fase"], "f": "L2"})
for i, (t, (qx, qy)) in enumerate([("VAINA NEGRA (*)", (ax_ + AN["Ro"] * ea * .8, ay_ - AN["Ro"] * ea * .55)), ("CINTA SEPARADORA (*)", (ax_ + AN["rCinta"] * ea * .72, ay_ + AN["rCinta"] * ea * .7)),
                                   ("NEUTRO 20 ALAMBRES (*)", (ax_ - AN["rN"] * ea, ay_)), ("FASE Cu 4 + XLPE (*)", (ax_ + 3, ay_ + 3))]):
    ty = 412 + i * 24; llamada(h, qx, qy, 705, ty - 4, "", K); h.txt(708, ty, t, 9.2, 400, OR)
h.txt(560, 545, "EL NEUTRO ENVUELVE A LA FASE: SI LO CORTAN", 9.2, 400, G); h.txt(560, 559, "O LO PINCHAN SE NOTA (ANTIHURTO).", 9.2, 400, G)

# =============== TABLA ===============
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "NORMA", "DIBUJO"]]
dat = {1027: ("IRAM 2164", "VISTAS / D1"), 1028: ("IRAM 62266", "VISTAS / D1"), 1004: ("— (*)", "VISTAS / D1"), 1002: ("— (*)", "D2"), 1003: ("— (*)", "D2")}
for c in [1027, 1028, 1004, 1002, 1003]: r = cat(c, 52); fil.append([r[0], r[1], r[2], *dat[c]])
yt = tablaC(h, 40, 590, [(52, "c", True), (380, "l", False), (32, "c", False), (100, "c", False), (110, "c", False)], fil, "CODIGOS DEL PAÑOL (5)", rowh=16)
rayadosC(h, 730, 590, ["PVCV", "REL", "XLP", "CU"])
ydat = bloque(h, 40, yt + 22, "DATOS TECNICOS", [
    "FORMACION 4 x 16 mm² COBRE · 0,6/1,1 kV · AISLACION XLPE.",
    "1027: AUTOPORTANTE, IRAM 2164 (PRYSMIAN RETENAX ENLACE: XLPE) · 1028: XLPE + VAINA LSZH (BAJA EMISION DE HUMOS), IRAM 62266.",
    "(*) Ø EXTERIOR Y ESPESORES: SEGUN FABRICANTE (PEDIR LA HOJA DE DATOS). UNIDAD DE COMPRA: METRO."], w=800, sz=10, lh=13.5)
notasW(h, 40, ydat + 4, [
    "ES LA BAJADA QUE FIJA EL AP-T-019 REF. 12 (Cu 4 x 16 XLPE AUTOPORTANTE O XLPE/LSZH). NO SE CAMBIA SIN APROBACION DE LA INSPECCION.",
    "(*) EL DIBUJO USA AISLACION 0,7 Y VAINA 1,8 (COMO LA 2178-1) Y CUERDA DE 7 ALAMBRES (MINIMO IEC 60228): A CONFIRMAR CON EL ROLLO.",
    "(*) ANTIHURTO 1002 / 1003: SIN FICHA. CONSTRUCCION CONCENTRICA HABITUAL (PRYSMIAN «RETENAX ANTIHURTO»): A CONFIRMAR.",
    "FUENTES: PLIEGO LP 21478, PLANO AP-T-019; FICHA «CABLE DE ACOMETIDA» DE LA APP; r3d/FUENTES_cables.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - BAJADA Cu 4 x 16 mm²", "TETRAPOLAR · PUNTA PELADA EN ESCALONES")
A = img3d(h, "cab_acom2", 900, 86, 560)
columna(h, A, [("vaina", "1", "VAINA"), ("relleno", "2", "RELLENO"), ("a0", "3", "XLPE (COLOR DE FASE)"), ("c0", "4", "Cu 16 · CUERDA")], 1480, 120, 470, paso=34)
h.txt(890, 540, "VISTA 3D - ANTIHURTO CONCENTRICO 4/4 (1003) (*)", 11, 700, NV, "start", INT)
A2 = img3d(h, "cab_acom2b", 890, 556, 400)
columna(h, A2, [("av", "", "VAINA NEGRA"), ("at", "", "CINTA"), ("an", "", "NEUTRO CONCENTRICO"), ("aa", "", "XLPE DE LA FASE"), ("ac", "", "FASE Cu 4")], 1330, 590, 840, paso=30)
yb2 = bloque(h, 890, 878, "DONDE SE USA", [
    "BAJADA DE LA ACOMETIDA AEREA (AP-T-019 REF. 12).",
    "SE TOMA DE LA LINEA CON MORSETO 1995/6 / 1995/4.",
    "AL NH: TERMINAL DE OJAL 16 mm² (2046). ENTRA POR PRENSACABLE 1 1/4\"."], w=740, sz=10, lh=14)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/cab_acom2.mjs, cab_acom2b.mjs). FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-CABLE_ACOMETIDA-2", "BAJADA DE Cu 4 x 16 mm²", "Y ANTIHURTO CONCENTRICO", "VISTA LATERAL, CORTE A-A, D1, D2 Y 3D", "2,5:1 / 8:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_cable_acometida_2.svg"))
