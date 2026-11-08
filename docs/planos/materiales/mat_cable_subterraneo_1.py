"""MAT-CABLE_SUBTERRANEO-1 (rev. B) · Cable Cu XLPE + vaina PVC IRAM 2178-1 (1009 4×2,5 dibujado; 1010, 1011, 1007, 1008, 1006, 6001).
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (CAB.c4x2_5, c3x1_5); 3D: r3d/out/cab_sub1.png y cab_sub1b.png.
Datos: ficha de la app (Prysmian Retenax Valio: Ø, aislación 0,7, vaina 1,8, intensidades); IEC 60228 (cuerda clase 2); AEA 90364 (colores).
Fuentes: r3d/FUENTES_cables.md. Lo que no está: naranja (*)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

C = PC["CAB"]["c4x2_5"]; C3 = PC["CAB"]["c3x1_5"]; c0 = C["conds"][0]
h = hoja()

# =============== 1. VISTA LATERAL ===============
h.titulo(40, 62, "VISTA LATERAL - PUNTA PELADA", "ESC. 4:1 · 4 x 2,5 mm² (1009) · LARGOS DE PELADO ILUSTRATIVOS (*)")
e = 4.0; X0, YC = 172, 205
La, Lc = [30, 36, 42, 48], [42, 48, 54, 60]
pts = lateral(h, X0, YC, e, C, -24, 0, 7, La, Lc, sep=4.6, cortar=-12)
for (x, y, xa, r, rr), f in zip(pts, ["L1", "L2", "L3", "N"]): h.txt(x + 6, y + 4, f, 10.5, 700)
h.dimV(X0 - 24 * e - 22, YC - C["Ro"] * e, YC + C["Ro"] * e, "Ø12", ext=X0 - 24 * e - 4)
yb = YC + 52
h.dimH(yb, X0, X0 + 7 * e, "", ext=YC + C["Ri"] * e); h.txt(X0 + 3.5 * e, yb + 14, "7 (*)", 9.5, 400, OR, "middle")
h.dimH(yb, X0 + 7 * e, X0 + La[3] * e, "", ext=pts[3][1] + pts[3][3]); h.txt(X0 + (7 + La[3]) / 2 * e, yb + 14, "41 (*)", 9.5, 400, OR, "middle")
h.dimH(yb, X0 + La[3] * e, X0 + Lc[3] * e, "", ext=pts[3][1] + pts[3][4]); h.txt(X0 + (La[3] + Lc[3]) / 2 * e, yb + 14, "12 (*)", 9.5, 400, OR, "middle")
h.txt(X0 + 2, yb + 30, "PELADO SEGUN EL TERMINAL O LA PUNTERA", 9, 400, G)
h.globo("1", X0 - 40, YC - C["Ro"] * e, X0 - 40, 112, r=9)
h.globo("2", X0 + 3.5 * e, YC - C["Ri"] * e + 4, X0 + 10, 112, r=9)
h.globo("3", pts[0][2] - 14, pts[0][1] - pts[0][3], pts[0][2] - 14, 112, r=9)
h.globo("4", pts[0][0] - 10, pts[0][1] - pts[0][4], pts[0][0] - 10, 112, r=9)

# =============== 2. CORTE A-A ===============
h.titulo(560, 62, "CORTE A-A", "ESC. 14:1 · VAINA, RELLENO Y 4 CONDUCTORES")
ec = 14.0; cx, cy = 612, 222
corte(h, cx, cy, ec, C)
R0 = C["Ro"] * ec
h.dimH(cy + R0 + 26, cx - R0, cx + R0, "Ø12 (EXT.)", ext=cy)
h.ln(cx, cy - R0 - 8, cx, cy + R0 + 8, K, .4, h.EJE); h.ln(cx - R0 - 8, cy, cx + R0 + 8, cy, K, .4, h.EJE)
cota_radial(h, cx, cy, C["Ri"] * ec, R0, 120, "1,8", lado=-1, dx=22)
p = (cx + c0["y"] * ec, cy - c0["z"] * ec)
cota_radial(h, p[0], p[1], c0["R"] * ec, c0["rc"] * ec, 75, "0,7", dx=60)
for i, (t, (ax, ay)) in enumerate([("1 · VAINA PVC e = 1,8", (cx + R0 * .78, cy - R0 * .55)),
                                   ("2 · RELLENO (EXTRUIDO)", (cx + 1, cy + 2)),
                                   ("3 · XLPE e = 0,7", (p[0] - c0["rc"] * ec * .75, p[1] + c0["rc"] * ec * .62)),
                                   ("4 · Cu CLASE 2 · 7 x Ø0,67 (*)", (p[0] + 2, p[1] + 2)),
                                   (f"Ø Cu ≈ {2*c0['R']:.2f} · NUCLEO ≈ {2*c0['rc']:.2f}".replace(".", ","), (None, None))]):
    ty = 128 + i * 26
    if ax is not None: llamada(h, ax, ay, 712, ty - 4, "", K)
    h.txt(715, ty, t, 9.4, 400, OR if "(*)" in t else K, "start")

# =============== 3. D1 · CORTE A COLOR ===============
h.titulo(40, 352, "DETALLE D1 - CORTE A COLOR", "ESC. 16:1 · CADA CONDUCTOR CON SU COLOR (AEA 90364) Y SUS 7 ALAMBRES")
dx_, dy_ = 150, 482; ed = 16
h.circ(dx_, dy_, C["Ro"] * ed + 9, "none", K, .7, 'stroke-dasharray="4 3"')
corte(h, dx_, dy_, ed, C, color=True)
h.txt(dx_ + C["Ro"] * ed + 2, dy_ - C["Ro"] * ed - 4, "D1", 11, 700)
leyendaF(h, 268, 432, ["L1", "L2", "L3", "N"], 2, 120)
h.txt(268, 480, "TETRAPOLAR: 3 FASES + NEUTRO, MISMA SECCION.", 9.8)
h.txt(268, 496, "FICHA DE LA APP: EL TRONCAL PUEDE IR CON FASE GRIS,", 9.8, 400, OR)
h.txt(268, 510, "NEUTRO CELESTE Y TIERRA VERDE (SEGUN PROYECTO) (*)", 9.8, 400, OR)

# =============== 4. D2 · CUERDA CLASE 2 ===============
h.titulo(560, 352, "D2 - CUERDA CLASE 2 (IEC 60228)", "ESC. 50:1 · 1 + 6 ALAMBRES, PASO DE CABLEADO (*)")
e2 = 50; qx, qy = 618, 462
cuerda2d(h, qx, qy, e2, c0, color=False)
h.circ(qx, qy, c0["R"] * e2, "none", K, .9, 'stroke-dasharray="3 2"')
dw = 2 * c0["rw"]
h.dimH(qy + c0["R"] * e2 + 18, qx - c0["R"] * e2, qx + c0["R"] * e2, f"Ø{2*c0['R']:.2f}".replace(".", ","), ext=qy)
h.dimV(qx + c0["R"] * e2 + 18, qy - c0["rw"] * e2, qy + c0["rw"] * e2, f"{dw:.2f}".replace(".", ","), ext=qx + c0["rw"] * e2)
# vista de la cuerda: alambres helicoidales
x1, y1, L = 700, 452, 120
rr = c0["R"] * e2 * .55
h.rect(x1, y1 - rr, L, 2 * rr, "#fff", K, .9)
xx = x1 + 4
while xx < x1 + L - 8: h.path(f"M{xx:.1f},{y1+rr:.1f} L{xx+14:.1f},{y1-rr:.1f}", "none", K, .7); xx += 9
h.dimH(y1 - rr - 12, x1 + 4, x1 + 4 + 9 * 7 * 1.0, "", ext=y1 - rr); h.txt(x1 + 36, y1 - rr - 18, "PASO (*)", 9.5, 400, OR, "middle")
h.txt(x1, y1 + rr + 18, "S = 7 · π/4 · d²  →  d = 0,67 mm (CALC.)", 9.5, 400, G)
h.txt(x1, y1 + rr + 32, "CANTIDAD REAL DE ALAMBRES (*)", 9.5, 400, OR)

# =============== 5. D3 · GRABADO ===============
h.titulo(560, 566, "D3 - GRABADO DE LA CUBIERTA", "S/E · LEYENDA A LO LARGO, REPETIDA (*)")
marcaVaina(h, 560, 590, 280, 26, "IRAM 2178-1 · 0,6/1,1 kV · Cu XLPE · 4x2,5 mm²", "FABRICANTE, AÑO Y METRAJE: SEGUN ROLLO (*)")

# =============== TABLAS ===============
TY = 640
TAB = {6001: ("3 x 1,5", "10", "28 A", "24 A"), 1009: ("4 x 2,5", "12", "37 A", "31 A"), 1010: ("4 x 4", "13,5", "48 A", "40 A"),
       1011: ("4 x 6", "14,5", "61 A", "49 A"), 1007: ("4 x 10", "17", "83 A", "66 A"), 1008: ("4 x 16", "20", "107 A", "85 A"),
       1006: ("3 x 25 + 1 x 16", "25,5", "141 A", "108 A")}
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "FORMACION", "Ø EXT.", "ENTERR.", "EN CAÑO", "R min"]]
for c in [1009, 6001, 1010, 1011, 1007, 1008, 1006]:
    f, d, i1, i2 = TAB[c]; dd = float(d.replace(",", ".")); r = cat(c, 40)
    fil.append([r[0], r[1], r[2], f, d, i1, i2, f"{(6 if dd < 25 else 8) * dd:.0f}"])
yt = tablaC(h, 40, TY, [(52, "c", True), (300, "l", False), (32, "c", False), (106, "c", False), (52, "c", True), (60, "c", True), (60, "c", True), (48, "c", True)], fil, "VARIANTES Y CODIGOS DEL PAÑOL (7)")
h.txt(40, yt + 13, "Ø EXT. E INTENSIDADES: FICHA DE LA APP (ENTERRADO A 0,70 m, SUELO 25 °C, 100 K·cm/W). R min = 6 x Ø (Ø < 25) · 8 x Ø (25 A 50), mm.", 9, 400, G)
ydat = bloque(h, 40, yt + 34, "DATOS TECNICOS", [
    "NORMA IRAM 2178-1 · 0,6/1,1 kV · TENDIDO SUBTERRANEO DIRECTO O EN CAÑO.",
    "CONDUCTOR: COBRE, CUERDA REDONDA CLASE 2 (IEC 60228).",
    "AISLACION: XLPE 0,7 mm · RELLENO EXTRUIDO · VAINA: PVC NEGRO 1,8 mm.",
    "3 x 25 + 1 x 16: CONDUCTORES SECTORIALES O REDONDOS SEGUN FABRICANTE (*)."], w=520, sz=10, lh=13.5)
rayadosC(h, 620, yt + 34, ["PVCV", "REL", "XLP", "CU"])
yu = bloque(h, 40, ydat + 6, "DONDE SE USA", [
    "TRONCAL DE LA PLAZA (4 x 2,5 - 1009) EN ZANJA AP-TC-001 · GUIA «ZANJEO Y TENDIDO» · ITEMS 25 A 40.",
    "DE LA CAJA DE LA COLUMNA A LA LUMINARIA: 3 x 1,5 (6001), ENTRA POR PRENSACABLE 3/4\".",
    "BAJADA SUBTERRANEA DE LA ACOMETIDA (AP-T-019 REF. 13): 4 x 6 / 4 x 10 / 4 x 16 / 3 x 25 + 1 x 16.",
    "PRENSACABLE: 4 x 2,5 Y 3 x 1,5 → 3/4\" · 4 x 6 → 7/8\" · 4 x 10 → 1\" · 4 x 16 → 1 1/4\"."], w=780, sz=10, lh=13.5)
notasW(h, 40, yu + 6, [
    "COTAS EN mm. Ø 12, AISLACION 0,7 Y VAINA 1,8: FICHA DE LA APP (PRYSMIAN RETENAX VALIO). 3 x 1,5: 0,7 / 1,8 / Ø10 (PRYSMIAN 2020).",
    "(*) 7 ALAMBRES: MINIMO DE IEC 60228 PARA CUERDA CLASE 2 NO COMPACTADA; Ø DE ALAMBRE CALCULADO DE LA SECCION. LA CUERDA REAL LA DA EL FABRICANTE.",
    "(*) LARGOS DE PELADO, PASO DE CABLEADO Y TEXTO DEL GRABADO: ILUSTRATIVOS. 4 x 10 Y MAYORES PUEDEN TENER ESPESORES MAYORES.",
    "(*) COLORES DEL 3 x 1,5 (6001): COMO EN LA APP (MARRON, NEGRO, CELESTE). A CONFIRMAR CON EL ROLLO.",
    "FUENTES DE CADA MEDIDA: r3d/FUENTES_cables.md."], w=790, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - 4 x 2,5 mm² (1009) EN ESCALONES", "CADA CAPA TERMINA ANTES QUE LA DE ADENTRO · VENTANA EN LA VAINA")
A = img3d(h, "cab_sub1", 905, 90, 580)
columna(h, A, [("vaina", "1", "VAINA PVC NEGRA"), ("marca", "", "GRABADO (D3)"), ("relleno", "2", "RELLENO"), ("ais0", "3", "AISLACION XLPE"),
               ("cu0", "4", "CUERDA Cu CLASE 2")], 1520, 110, 470, paso=34)
h.txt(890, 540, "VISTA 3D - 3 x 1,5 mm² (6001) · COLUMNA A LUMINARIA", 11, 700, NV, "start", INT)
A2 = img3d(h, "cab_sub1b", 925, 560, 430)
columna(h, A2, [("vaina", "1", "VAINA PVC"), ("relleno", "2", "RELLENO"), ("ais1", "3", "XLPE (MARRON · NEGRO · CELESTE (*))"), ("cu2", "4", "Cu 7 ALAMBRES")], 1385, 590, 880, paso=34)
h.txt(890, 1010, "RENDER: three.js (r3d/escenas/cab_sub1.mjs, cab_sub1b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-CABLE_SUBTERRANEO-1", "CABLE Cu XLPE + PVC", "SUBTERRANEO IRAM 2178-1", "VISTA LATERAL, CORTE A-A, D1 A D3 Y 3D", "4:1 / 14:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_cable_subterraneo_1.svg"))
