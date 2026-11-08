"""MAT-MORSETERIA_AEREA-2 (rev. B) · Herrajes MN (H°G°) para poste de madera: bulón de ojo MN 505 (4506), ojal MN 377 (4507), tirafondo MN 520 (4508), arandela cuadrada MN 30 (4509);
con el rack MN 4B2L (4032) y el aislador MN 16 / 17 (4009 / 4010) que los acompañan (hoja propia: MAT-HERRAJES-2).
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (MN) y r3d/piezas/aerea.mjs; 3D: r3d/out/mn_piezas.png y mn_poste.png.
Solo el tirafondo tiene medidas (12,7 × 101,6, pliego 15.63); lo demás (*). Fuentes: r3d/FUENTES_cables.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

MN = PC["MN"]; B, O, T, W, I, KR = MN["bulonOjo"], MN["ojal"], MN["tirafondo"], MN["arandela"], MN["aislador"], MN["rack"]
h = hoja()

def rosca_h(x0, x1, yc, r, paso):
    h.rect(x0, yc - r, x1 - x0, 2 * r, "#fff", K, 1)
    xx = x0 + paso / 2
    while xx < x1 - 1: h.ln(xx, yc - r, xx + paso * .5, yc + r, K, .45); xx += paso
    h.ln(x0, yc - r * .82, x1, yc - r * .82, K, .35); h.ln(x0, yc + r * .82, x1, yc + r * .82, K, .35)

# =============== BULON DE OJO MN 505 ===============
h.titulo(40, 62, "BULON DE OJO MN 505 - 4506", "ESC. 1:2 · CON ARANDELA MN 30 Y TUERCA · LARGO SEGUN POSTE (PASANTE)")
e = 1.35; x0, yc = 90, 165
rm, rt = (B["ojoRi"] + B["ojoRe"]) / 2, (B["ojoRe"] - B["ojoRi"]) / 2
h.circ(x0, yc, B["ojoRe"] * e, "url(#HG)", K, 1.2); h.circ(x0, yc, B["ojoRi"] * e, "#fff", K, 1.2)
xs = x0 + (rm + rt * .6) * e; L = 200
h.rect(xs, yc - B["M"] / 2 * e, L * .45 * e, B["M"] * e, "#fff", K, 1)
rosca_h(xs + L * .45 * e, xs + L * e, yc, B["M"] / 2 * e, 2.2 * e * 1.5)
xa = x0 + (rm + 150) * e
h.rect(xa, yc - W["a"] / 2 * e, W["e"] * e, W["a"] * e, "url(#HG)", K, 1); h.rect(xa + W["e"] * e, yc - B["tuerca"] / math.sqrt(3) * e, 11 * e, 2 * B["tuerca"] / math.sqrt(3) * e, "#fff", K, 1.1)
h.ln(x0 - 30, yc, xs + L * e + 12, yc, K, .45, h.EJE)
h.dimH(yc - 44, xs, xs + L * e, "LARGO SEGUN POSTE (*)", ext=yc - B["M"] / 2 * e, c=OR)
h.dimV(xs + L * e + 26, yc - B["M"] / 2 * e, yc + B["M"] / 2 * e, 'Ø 1/2" (*)', ext=xs + L * e + 2, c=OR)
h.dimH(yc + 46, x0 - B["ojoRe"] * e, x0 + B["ojoRe"] * e, "OJO Ø46 (*)", ext=yc + B["ojoRe"] * e, c=OR)
h.txt(xa + 8, yc + W["a"] / 2 * e + 14, "ARANDELA + TUERCA", 9.2, 400, K, "middle")

# =============== OJAL MN 377 ===============
h.titulo(500, 62, "OJAL MN 377 - 4507", "ESC. 1:2 · MEDIDAS SEGUN NORMA MN (*)")
x0, yc = 560, 165; rm, rt = (O["ojoRi"] + O["ojoRe"]) / 2, (O["ojoRe"] - O["ojoRi"]) / 2
h.circ(x0, yc, O["ojoRe"] * e, "url(#HG)", K, 1.2); h.circ(x0, yc, O["ojoRi"] * e, "#fff", K, 1.2)
xs = x0 + rm * e
h.path(f"M{xs:.1f},{yc-rt*1.6*e:.1f} L{xs+14*e:.1f},{yc-(O['M']/2+1)*e:.1f} V{yc+(O['M']/2+1)*e:.1f} L{xs:.1f},{yc+rt*1.6*e:.1f} Z", "url(#HG)", K, 1)
rosca_h(xs + 14 * e, xs + O["L"] * e, yc, O["M"] / 2 * e, 2 * e * 1.5)
h.ln(x0 - 30, yc, xs + O["L"] * e + 10, yc, K, .45, h.EJE)
h.dimH(yc + 40, xs + 14 * e, xs + O["L"] * e, "ROSCA / LARGO (*)", ext=yc + O["M"] / 2 * e, c=OR)

# =============== TIRAFONDO MN 520 ===============
h.titulo(40, 260, "BULON TIRAFONDO MN 520 - 4508", "ESC. 1:1 · 12,7 x 101,6 (PLIEGO 15.63) · ROSCA PARA MADERA")
e2 = 2.4; x0, yc = 80, 345; r = T["d"] / 2 * e2
h.rect(x0, yc - T["cab"] / 2 * e2, T["k"] * e2, T["cab"] * e2, "url(#HG)", K, 1.2)
xs = x0 + T["k"] * e2; Ll = T["L"] * .4
h.rect(xs, yc - r, Ll * e2, 2 * r, "#fff", K, 1)
core = r * .72; xe = xs + T["L"] * e2
h.path(f"M{xs+Ll*e2:.1f},{yc-core:.1f} H{xe-12*e2:.1f} L{xe:.1f},{yc:.1f} L{xe-12*e2:.1f},{yc+core:.1f} H{xs+Ll*e2:.1f} Z", "#fff", K, 1)
xx = xs + Ll * e2 + 2
while xx < xe - 14:
    rr = r if xx < xe - 12 * e2 else core + (r - core) * (xe - xx) / (12 * e2)
    h.path(f"M{xx:.1f},{yc-rr:.1f} L{xx+5.5*e2*.5:.1f},{yc+rr:.1f}", "none", K, 1); xx += 5.5 * e2
h.ln(x0 - 10, yc, xe + 10, yc, K, .45, h.EJE)
h.dimH(yc + 40, xs, xe, '101,6 (4")', ext=yc + r)
h.dimV(xe + 30, yc - r, yc + r, 'Ø12,7 (1/2")', ext=xs + 20)
h.dimV(x0 - 16, yc - T["cab"] / 2 * e2, yc + T["cab"] / 2 * e2, "19 (*)", ext=x0, c=OR)
h.txt(x0, yc - 40, "CABEZA CUADRADA (*)", 9.5, 400, OR); h.txt(xs + Ll * e2 + 20, yc - 40, "FILETE PARA MADERA, PASO ≈ 5,5 (*)", 9.5, 400, OR)

# =============== ARANDELA MN 30 ===============
h.titulo(560, 260, "ARANDELA CUADRADA MN 30 - 4509", "ESC. 1:2 · PLANTA Y CORTE (*)")
e3 = 1.6; ax, ay = 600, 310; a = W["a"] * e3
h.rect(ax, ay, a, a, "#fff", K, 1.2); h.circ(ax + a / 2, ay + a / 2, W["agujero"] / 2 * e3, "#fff", K, 1)
h.ln(ax + a / 2, ay - 8, ax + a / 2, ay + a + 8, K, .45, h.EJE); h.ln(ax - 8, ay + a / 2, ax + a + 8, ay + a / 2, K, .45, h.EJE)
h.dimH(ay - 12, ax, ax + a, "≈ 50 (*)", c=OR)
h.rect(ax + a + 40, ay, W["e"] * e3 * 2, a, "url(#HG)", K, 1); h.txt(ax + a + 52, ay + a + 16, "e ≈ 5 (*)", 9.5, 400, OR, "middle")

# =============== AISLADOR MN 16 + RACK ===============
h.titulo(40, 440, "RACK MN 4B2L (4032) CON AISLADOR MN 16 (4009) - CORTE", "ESC. 1:2 · EL PILOTO VA ATADO EN LA GARGANTA · VER MAT-HERRAJES-2 (*)")
e4 = 1.5; ox, oy = 150, 590
Hh, r1, r2, ra = I["H"], I["Dmax"] / 2, I["Dcuello"] / 2, I["agujero"] / 2
pf = [[ra, 0], [r1 - 4, 0], [r1, 4], [r1, 14], [r1 - 3, 18], [r2 + 2, 26], [r2, 32], [r2, Hh - 32], [r2 + 2, Hh - 26], [r1 - 3, Hh - 18], [r1, Hh - 14], [r1, Hh - 4], [r1 - 4, Hh], [ra, Hh]]
for s in (1, -1):
    d = "M" + " L".join(f"{ox + s * rr * e4:.1f},{oy - (t - Hh / 2) * e4:.1f}" for rr, t in pf) + " Z"
    h.path(d, "url(#PORC)", K, 1.2)
pinr = 7 * e4
h.rect(ox - pinr, oy - (Hh / 2 + KR["e"] + 14) * e4, 2 * pinr, (Hh + 2 * KR["e"] + 28) * e4, "#fff", K, 1)
H2 = Hh / 2 + KR["e"] + 2; sal = r1 + 22
for sgn in (1, -1):
    y0 = oy - sgn * H2 * e4; h.rect(ox - (sal + 6) * e4, min(y0, y0 - sgn * KR["e"] * e4), (sal + 6 + r1 + 6) * e4, KR["e"] * e4, "url(#HG)", K, 1)
h.rect(ox - (sal + 6) * e4 - KR["e"] * e4, oy - (H2 + 22) * e4, KR["e"] * e4, (2 * H2 + 44) * e4, "url(#HG)", K, 1.2)
pr = PC["CAB"]["p1x25"]; px = ox + (r2 + pr["Ro"]) * e4
nucleo2d(h, px, oy, e4, pr["conds"][0], al=True)
h.circ(px, oy, (pr["Ro"] + .9) * e4, "none", K, .8, 'stroke-dasharray="2 1.5"')
h.ln(ox, oy - (Hh / 2 + 20) * e4, ox, oy + (Hh / 2 + 20) * e4, K, .45, h.EJE)
h.dimV(ox + (r1 + 30) * e4, oy - Hh / 2 * e4, oy + Hh / 2 * e4, "≈ 76 (*)", ext=ox + r1 * e4, c=OR)
h.dimH(oy + (Hh / 2 + 34) * e4, ox - r1 * e4, ox + r1 * e4, "Ø ≈ 76 (*)", ext=oy + Hh / 2 * e4, c=OR)
for t, (qx, qy), ty in [("AISLADOR CARRETEL DE PORCELANA (*)", (ox - r1 * e4 * .7, oy - (Hh / 2 - 8) * e4), 500), ("PERNO DEL RACK", (ox, oy - (Hh / 2 + 8) * e4), 530),
                        ("RACK: PLANCHUELA H°G°", (ox - (sal + 6.5) * e4, oy - 20), 560), ("PILOTO EN LA GARGANTA + ATADURA", (px + 3, oy - 3), 590), ("GARGANTA Ø ≈ 52 (*)", (ox + r2 * e4, oy + 30), 620)]:
    llamada(h, qx, qy, 330, ty, t, OR if "(*)" in t else K, "start", 9.4)
h.txt(330, 650, "ATADURA: ALAMBRE GALV. N° 14, 2 m POR AISLADOR", 9.4); h.txt(330, 665, "(≈ 0,05 kg, CLAUDE.md §11.3) (*)", 9.4, 400, OR)

# =============== TABLAS ===============
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "USO"]]
uso = {4506: "RETENCION, PASANTE", 4507: "MN 377", 4508: "SUSPENSION · 15.63", 4509: "CON EL BULON DE OJO", 4032: "MAT-HERRAJES-2", 4009: "MAT-HERRAJES-2", 4010: "MAT-HERRAJES-2"}
for c in [4506, 4507, 4508, 4509, 4032, 4009, 4010]: r = cat(c, 56); fil.append([r[0], r[1], r[2], uso[c]])
yt = tablaC(h, 40, 730, [(52, "c", True), (400, "l", False), (34, "c", False), (170, "l", False)], fil, "CODIGOS DEL PAÑOL (4 + 3 QUE LOS ACOMPAÑAN)", rowh=15)
rayadosC(h, 730, 730, ["HG", "PORC", "MAD", "ALU"], cols=1)
ydat = bloque(h, 40, yt + 18, "DATOS TECNICOS", [
    "ACERO GALVANIZADO EN CALIENTE (H°G°). SOLO EN POSTES DE MADERA (EN H°A° VA FLEJE: MAT-MORSETERIA_AEREA-1).",
    "RETENCION = BULON DE OJO MN 505 PASANTE + ARANDELA MN 30 · SUSPENSION = TIRAFONDO MN 520 (12,7 x 101,6) · PILOTO EN RACK 4B2L CON AISLADOR MN 16 / 17."], w=800, sz=10, lh=13.5)
notasW(h, 40, ydat + 2, [
    "COTAS EN mm. MANDA LA COTA. DEL TIRAFONDO SE CONOCEN Ø 12,7 Y LARGO 101,6 (CATALOGO Y PLIEGO 15.63).",
    "(*) MEDIDAS DE MN 505 / MN 377 / MN 30 / MN 16 / 4B2L: NORMAS MN, NO PUBLICADAS EN LA WEB. A CONFIRMAR CON EL PLANO DE LA INSPECCION.",
    "(*) Ø DEL BULON DE OJO, EL OJO, LA ARANDELA, EL CARRETEL Y EL RACK: ORIENTATIVOS. FUENTES: LP 21478 (15.62 / 15.63); r3d/FUENTES_cables.md."], w=800, lh=13)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - HERRAJES MN (H°G°) Y RACK CON AISLADOR", "BULON DE OJO CON ARANDELA Y TUERCA · OJAL · TIRAFONDO · ARANDELA · RACK 4B2L + MN 16")
A = img3d(h, "mn_piezas", 890, 92, 560)
columna(h, A, [("ojo", "", "BULON DE OJO MN 505"), ("vastago", "", "VASTAGO ROSCADO"), ("tuerca", "", "ARANDELA + TUERCA"), ("ojal", "", "OJAL MN 377"),
               ("tira", "", "TIRAFONDO MN 520"), ("rosca", "", "FILETE PARA MADERA"), ("arandela", "", "ARANDELA MN 30"), ("rack", "", "RACK 4B2L"), ("aislador", "", "AISLADOR MN 16"), ("perno", "", "PERNO")], 1460, 100, 520, paso=36)
h.titulo(890, 548, "EN SU LUGAR - POSTE DE MADERA", "RETENCION CON BULON DE OJO PASANTE · PILOTO ATADO AL AISLADOR EN EL RACK")
A2 = img3d(h, "mn_poste", 890, 572, 540)
columna(h, A2, [("ojo", "", "BULON DE OJO"), ("grampa", "", "GRAMPA DE CUÑA (4503)"), ("tuerca", "", "TUERCA DEL OTRO LADO"), ("rack", "", "RACK 4B2L"), ("aislador", "", "AISLADOR MN 16"), ("atadura", "", "ATADURA"), ("piloto", "", "PILOTO Al 1 x 25"), ("poste", "", "POSTE DE MADERA")], 1460, 590, 990, paso=36)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/mn_piezas.mjs, mn_poste.mjs). FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-MORSETERIA_AEREA-2", "HERRAJES MN PARA", "POSTE DE MADERA", "VISTAS, CORTE DEL RACK, DATOS Y 3D", "1:2 / 1:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_morseteria_aerea_2.svg"))
