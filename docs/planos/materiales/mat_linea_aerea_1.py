"""MAT-LINEA_AEREA-1 (rev. B) · Piloto de alumbrado Al-Al 1 × 25 mm² XLPE (1501, IRAM 63002 · ET-1005) y Cu 1 × 4 XLPE (1504).
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (CAB.p1x25, p1x4); 3D: r3d/out/linea1.png.
Datos: ficha de la app (Ø 9,5 · conductor 5,8 · 7 alambres · 712 daN · 136 A). Fuentes: r3d/FUENTES_cables.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

P, Q = PC["CAB"]["p1x25"], PC["CAB"]["p1x4"]; cp, cq = P["conds"][0], Q["conds"][0]
h = hoja()

# =============== VISTA LATERAL ===============
h.titulo(40, 62, "VISTA LATERAL - PUNTA PELADA", "ESC. 5:1 · PILOTO Al-Al 1 x 25 XLPE (1501) · PELADO ILUSTRATIVO (*)")
e = 5.0; x0, yc = 80, 205; Ro, Rc = P["Ro"] * e, cp["R"] * e
h.path(f"M{x0},{yc-Ro} H{x0+50*e} V{yc+Ro} H{x0} q-7,{-Ro/2} 0,{-Ro} t0,{-Ro} Z", "#fff", K, 1.4)
h.ln(x0 + 4, yc - Rc, x0 + 50 * e, yc - Rc, K, .5, h.OCULTA); h.ln(x0 + 4, yc + Rc, x0 + 50 * e, yc + Rc, K, .5, h.OCULTA)
h.rect(x0 + 50 * e, yc - Rc, 26 * e, 2 * Rc, "#fff", K, 1)
xx = x0 + 50 * e + 4
while xx < x0 + 76 * e - 8: h.path(f"M{xx:.1f},{yc+Rc:.1f} L{xx+9:.1f},{yc-Rc:.1f}", "none", K, .7); xx += 11
h.ln(x0 - 12, yc, x0 + 78 * e, yc, K, .45, h.EJE)
h.dimV(x0 - 18, yc - Ro, yc + Ro, "Ø9,5", ext=x0 - 2); h.dimV(x0 + 76 * e + 18, yc - Rc, yc + Rc, "Ø5,8", ext=x0 + 76 * e + 2)
xs = x0 + 25 * e; h.ln(xs, yc - Ro - 12, xs, yc + Ro + 12, K, .6, h.EJE)
for s in (-1, 1): h.ln(xs - 6, yc + s * (Ro + 12), xs + 6, yc + s * (Ro + 12), K, 2)
h.txt(xs - 8, yc - Ro - 16, "A", 12, 700, K, "end"); h.txt(xs - 8, yc + Ro + 28, "A", 12, 700, K, "end")
h.globo("1", x0 + 38 * e, yc - Ro, x0 + 38 * e, 118, r=9); h.globo("2", x0 + 64 * e, yc - Rc, x0 + 64 * e, 118, r=9)
h.dimH(yc + Ro + 30, x0 + 50 * e, x0 + 76 * e, "", ext=yc + Rc); h.txt(x0 + 63 * e, yc + Ro + 44, "26 (*) SEGUN MORSETO / TERMINAL", 9.5, 400, OR, "middle")

# =============== CORTE A-A ===============
h.titulo(560, 62, "CORTE A-A", "ESC. 12:1 · 7 ALAMBRES DE ALUMINIO (FICHA)")
ec = 12.0; cx, cy = 640, 215
nucleo2d(h, cx, cy, ec, cp, al=True)
h.dimH(cy + P["Ro"] * ec + 22, cx - P["Ro"] * ec, cx + P["Ro"] * ec, "Ø ≈ 9,5", ext=cy)
h.dimH(cy - P["Ro"] * ec - 12, cx - cp["R"] * ec, cx + cp["R"] * ec, "Ø ≈ 5,8", ext=cy - cp["R"] * ec)
cota_radial(h, cx, cy, cp["R"] * ec, cp["rc"] * ec, -35, "1,85 (CALC.)", dx=30)
h.txt(722, 170, "7 x Ø1,93 (CALC.)", 9.6); h.txt(722, 186, "XLPE NEGRA, APTA", 9.6); h.txt(722, 200, "INTEMPERIE (UV)", 9.6)
h.globo("1", cx - P["Ro"] * ec * .8, cy - P["Ro"] * ec * .5, 584, 120, r=9); h.globo("2", cx - 4, cy + 4, 584, 290, r=9)

# =============== D1 color ===============
h.titulo(40, 352, "DETALLE D1 - A COLOR", "ESC. 12:1 · 1501 Al-Al 1 x 25 · 1504 Cu 1 x 4")
nucleo2d(h, 140, 470, 12, cp, color=True, al=True); h.circ(140, 470, P["Ro"] * 12 + 7, "none", K, .6, 'stroke-dasharray="4 3"')
nucleo2d(h, 310, 470, 12, cq, color=True); h.circ(310, 470, Q["Ro"] * 12 + 7, "none", K, .6, 'stroke-dasharray="4 3"')
h.txt(140, 548, "1501 · Al-Al 1 x 25", 10.5, 700, K, "middle"); h.txt(310, 548, "1504 · Cu 1 x 4 (*)", 10.5, 700, OR, "middle")

# =============== D2 dónde va ===============
h.titulo(430, 352, "D2 - DONDE VA (ESQUEMA)", "S/E · EN LA PARTE ALTA DEL POSTE (ET-1005)")
px = 620; yb = 580
h.rect(px - 10, 395, 20, yb - 395, "url(#HORM)", K, 1.2); h.ln(430, yb, 840, yb, K, 1.4)
h.path(f"M440,412 Q520,422 {px-10},416", "none", K, 2.4); h.path(f"M{px+10},416 Q700,422 830,412", "none", K, 2.4)
h.txt(445, 406, "PILOTO 1 x 25 (1501)", 10, 700)
h.path(f"M440,458 Q520,472 {px-10},464", "none", K, 4.5); h.path(f"M{px+10},464 Q700,472 830,458", "none", K, 4.5)
h.txt(445, 452, "PREENSAMBLADO DE LA RED", 9.5, 400, G)
h.dimH(yb + 18, 440, 830, "VANO MAXIMO 40 m (ET-1005)", ext=yb - 140, dy=14)

# =============== TABLA ===============
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "ITEM LP 21478 · DATO"]]
dat = {1501: "7.09 · Ø≈9,5 · 712 daN · 136 A", 1504: "7.16 · MEDIDAS (*)"}
for c in [1501, 1504]: r = cat(c, 54); fil.append([r[0], r[1], r[2], dat[c]])
yt = tablaC(h, 40, 640, [(52, "c", True), (400, "l", False), (32, "c", False), (230, "l", False)], fil, "CODIGOS DEL PAÑOL (2)", rowh=16)
rayadosC(h, 40, 1050, ["XLP", "ALU", "CU"], cols=3, dx=200)
ydat = bloque(h, 40, yt + 22, "DATOS TECNICOS (1501)", [
    "NORMA IRAM 63002 · EPEC ET-1005 · 0,6/1,1 kV · ALUMINIO, 7 ALAMBRES, 25 mm² · AISLACION XLPE NEGRA.",
    "Ø EXTERIOR ≈ 9,5 · Ø CONDUCTOR ≈ 5,8 · CARGA DE ROTURA ≈ 712 daN · CORRIENTE ≈ 136 A (FICHA). UNIDAD: METRO."], w=680, sz=10, lh=13.5)
notasW(h, 40, ydat + 4, [
    "COTAS EN mm. Ø 9,5 / 5,8, 7 ALAMBRES, 712 daN Y 136 A: FICHA DE LA APP (ET-1005 / IRAM 63002). AISLACION Y Ø DE ALAMBRE: CALCULADOS.",
    "(*) 1504 (Cu 1 x 4 XLPE, ITEM 7.16): SUS MEDIDAS NO ESTAN EN LA FICHA. SE DIBUJA CON XLPE 1,0 Y 7 ALAMBRES: A CONFIRMAR.",
    "(*) EL ESQUEMA D2 ES DE UBICACION; ALTURAS Y SEPARACIONES SEGUN PLANOS AP-TC-055 (FALTAN EN LA APP).",
    "FUENTES: LP 21478 ANEXO I (7.09 / 7.16); EPEC ET-1005; IRAM 63002; r3d/FUENTES_cables.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - PILOTO Al-Al 1 x 25 Y Cu 1 x 4", "PUNTAS PELADAS · 7 ALAMBRES · GRABADO SOBRE LA XLPE")
A = img3d(h, "linea1", 900, 92, 640)
columna(h, A, [("ais", "1", "AISLACION XLPE NEGRA"), ("cu", "2", "Al 7 ALAMBRES"), ("ais2", "", "1504 Cu 1 x 4 XLPE"), ("cu2", "", "Cu 7 ALAMBRES")], 1500, 140, 560, paso=36)
bloque(h, 890, 650, "DONDE SE USA", [
    "PILOTO DE ALUMBRADO DE BARRIO: INDEPENDIENTE, EN LA PARTE ALTA DEL POSTE (ITEM 7.09).",
    "DE EL SE TOMA LA FASE DE CADA LUMINARIA CON EL MORSETO 1995/4 (MAT-MORSETO-1).",
    "EN POSTE DE MADERA VA ATADO A UN AISLADOR MN 16 / 17 EN RACK (MAT-MORSETERIA_AEREA-2).",
    "1504 Cu 1 x 4: BAJADAS CORTAS (ITEM 7.16). GUIA «TENDIDO AEREO BARRIO»."], w=740, sz=10, lh=14)
h.txt(890, 1010, "RENDER: three.js (r3d/escenas/linea1.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-LINEA_AEREA-1", "PILOTO Al-Al 1 x 25 XLPE", "Y Cu 1 x 4 (IRAM 63002)", "VISTA LATERAL, CORTE A-A, D1, D2 Y 3D", "5:1 / 12:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_linea_aerea_1.svg"))
