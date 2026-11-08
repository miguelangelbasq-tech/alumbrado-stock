"""MAT-CABLE_ACOMETIDA-1 (rev. B) · Preensamblado Al-Al 3 × 1 × 25/50 mm² (1016) con neutro portante; 1015 y 1014.
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (HAZ.h25_50); 3D: r3d/out/cab_acom1.png.
Datos: ficha de la app (Prysmian Retenax preensamblado IRAM 2263: fase Ø9, neutro Ø12,5, haz ≈ 26, 82 A, 515 kg/km). Fuentes: r3d/FUENTES_cables.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

H = PC["HAZ"]["h25_50"]; F = H["fases"][0]; N = H["neu"]
h = hoja()

# =============== CORTE A-A ===============
h.titulo(40, 62, "CORTE A-A DEL HAZ", "ESC. 6:1 · 3 FASES Al 25 SOBRE EL NEUTRO PORTANTE Al-ALEACION 50")
e = 6.0; cx, cy = 190, 250
pts = haz2d(h, cx, cy, e, H)
Rh = H["Dh"] / 2 * e
h.circ(cx, cy, Rh, "none", G, .6, 'stroke-dasharray="4 3"')
h.dimH(cy + Rh + 24, cx - Rh, cx + Rh, "Ø HAZ 30,5 (CALC.) · FICHA ≈ 26 (*)", ext=cy, c=OR)
x1, y1, _ = pts[0]
h.dimV(x1 + F["rc"] * e + 16, y1 - F["rc"] * e, y1 + F["rc"] * e, "Ø9", ext=x1 + 2)
h.txt(cx, cy + N["rc"] * e + 14, "Ø12,5", 10, 700, K, "middle")
for i, (t, (ax, ay)) in enumerate([("1 · FASE: Al 25 mm², 7 ALAMBRES (*)", (pts[1][0] + 2, pts[1][1] + 2)),
                                   ("2 · AISLACION XLPE NEGRA (Ø 9)", (pts[1][0] - F["rc"] * e * .8, pts[1][1] + F["rc"] * e * .55)),
                                   ("3 · NEUTRO PORTANTE Al-ALEACION 50", (cx + 3, cy + 3)),
                                   ("4 · AISLACION DEL NEUTRO (Ø 12,5)", (cx - N["rc"] * e * .8, cy - N["rc"] * e * .55))]):
    ty = 120 + i * 24; llamada(h, ax, ay, 382, ty - 4, "", K); h.txt(385, ty, t, 9.8, 400, OR if "(*)" in t else K)
h.txt(385, 222, f"Ø Al 25 ≈ {2*F['R']:.2f} · Ø Al 50 ≈ {2*N['R']:.2f} (7 ALAMBRES, CALC.)".replace(".", ","), 9.5, 400, G)
h.txt(385, 238, "AISLACION = (Ø EXT. − Ø CONDUCTOR) / 2 ≈ 1,3 / 1,75 (CALC.)", 9.5, 400, G)

# =============== D1 a color ===============
h.titulo(560, 300, "DETALLE D1 - A COLOR", "S/E · XLPE NEGRA · ALUMINIO")
ed = 4.6; dx_, dy_ = 690, 400
h.circ(dx_, dy_, H["Dh"] / 2 * ed + 8, "none", K, .6, 'stroke-dasharray="4 3"')
haz2d(h, dx_, dy_, ed, H, color=True)
h.txt(690, 492, "FASES 1-2-3: NUMEROS O NERVIOS (*)", 9.5, 400, OR, "middle")

# =============== VISTA LATERAL ===============
h.titulo(40, 420, "VISTA LATERAL DEL HAZ", "S/E · LAS FASES ENROLLADAS SOBRE EL NEUTRO · PASO DE CABLEADO (*)")
X0, YC, el = 60, 500, 1.6
lateral_haz(h, X0, YC, el, H, 300, 280)
h.ln(X0 - 10, YC, X0 + 300 * el + 10, YC, K, .45, h.EJE)
h.dimH(YC + 38, X0, X0 + 280 * el, "PASO ≈ 280 (*)", ext=YC + 26, c=OR)
h.dimV(X0 + 300 * el + 18, YC - H["Dh"] / 2 * el, YC + H["Dh"] / 2 * el, "≈ 30", ext=X0 + 300 * el)

# =============== D2: dónde va ===============
h.titulo(40, 590, "D2 - DONDE VA (AP-T-019, ESQUEMA)", "S/E · DE LA LINEA DE EPEC AL POSTE DEL TABLERO")
yb = 762
h.ln(40, yb, 840, yb, K, 1.4)
h.rect(90, yb - 110, 9, 110, "url(#HORM)", K, 1); h.txt(106, yb - 40, "LINEA EPEC", 10, 700)
h.rect(560, yb - 90, 8, 90, "url(#HORM)", K, 1); h.rect(571, yb - 76, 26, 36, "#fff", K, 1); h.txt(602, yb - 54, "TABLERO", 10)
h.path(f"M99,{yb-100} Q330,{yb-60} 560,{yb-84}", "none", K, 2.4)
h.txt(330, yb - 82, "HAZ 3 x 1 x 25/50 (1016)", 10.5, 700, K, "middle")
h.dimH(yb - 122, 99, 560, "VANO MAX. 10 m", ext=yb - 100)
h.ln(700, yb, 700, yb - 10, K, 1.2); h.txt(700, yb - 14, "CORDON", 10, 400, K, "middle")
h.dimH(yb + 16, 564, 700, "2,50 m", ext=yb, dy=12)

# =============== TABLAS ===============
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO (FICHA)"]]
dat = {1016: "HAZ ≈ 26 · 82 A · 515 kg/km", 1015: "SIN DATOS (*)", 1014: "VER MAT-LINEA_AEREA-1"}
for c in [1016, 1015, 1014]: r = cat(c, 50); fil.append([r[0], r[1], r[2], dat[c]])
yt = tablaC(h, 40, 790, [(52, "c", True), (360, "l", False), (32, "c", False), (220, "l", False)], fil, "CODIGOS DEL PAÑOL (3)", rowh=16)
rayadosC(h, 720, 790, ["XLP", "ALU"])
ydat = bloque(h, 40, yt + 22, "DATOS TECNICOS (1016)", [
    "NORMA IRAM 2263 · 0,6/1,1 kV · CONDUCTORES DE ALUMINIO AISLADOS EN XLPE NEGRO (APTO INTEMPERIE).",
    "3 FASES Al 25 mm² (Ø 9) ENROLLADAS SOBRE EL NEUTRO PORTANTE DE ALEACION DE Al 50 mm² (Ø 12,5), QUE SOPORTA EL PESO.",
    "PESO ≈ 515 kg/km · INTENSIDAD ≈ 82 A (FICHA)."], w=800, sz=10, lh=13.5)
notasW(h, 40, ydat + 4, [
    "COTAS EN mm. Ø 9 / 12,5 / 26, PESO E INTENSIDAD: FICHA DE LA APP (PRYSMIAN RETENAX PREENSAMBLADO, IRAM 2263).",
    "(*) CON Ø 9 Y Ø 12,5 APOYADOS, EL HAZ DA ≈ 30,5, NO 26: CONTRADICCION EN LA FICHA, CONFIRMAR CON LA HOJA DEL FABRICANTE.",
    "(*) 7 ALAMBRES POR CONDUCTOR (MINIMO IEC 60228 CLASE 2), PASO DE CABLEADO Y MARCA DE LAS FASES: A CONFIRMAR CON EL ROLLO.",
    "FUENTES: r3d/FUENTES_cables.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - HAZ PREENSAMBLADO 3 x 1 x 25/50", "LAS FASES ENROLLADAS SOBRE EL NEUTRO PORTANTE · PUNTAS PELADAS EN ESCALONES")
A = img3d(h, "cab_acom1", 890, 92, 690)
columna(h, A, [("f0", "2", "FASE · XLPE NEGRA"), ("c0", "1", "Al 25 · 7 ALAMBRES"), ("n", "4", "NEUTRO PORTANTE"), ("nc", "3", "Al-ALEACION 50"), ("marca", "", "NUMERO DE FASE (*)")], 1500, 120, 560, paso=34)
yb2 = bloque(h, 890, 650, "DONDE SE USA", [
    "ACOMETIDA AEREA AP-T-019 REF. 12: DE LA LINEA DE EPEC AL TABLERO · GUIA «ACOMETIDA AEREA».",
    "SE CUELGA DEL NEUTRO PORTANTE CON LA MORSETERIA (GRAMPAS Y MENSULAS): MAT-MORSETERIA_AEREA-1.",
    "SE DERIVA CON MORSETOS DE PERFORACION (1995/6 NEUTRO · 1995/4 FASE): MAT-MORSETO-1.",
    "1014 PILOTO Y 1015 2 x 25: VER MAT-LINEA_AEREA-1 / -2."], w=740, sz=10, lh=14)
h.txt(890, 1010, "RENDER: three.js (r3d/escenas/cab_acom1.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-CABLE_ACOMETIDA-1", "PREENSAMBLADO Al-Al", "3 x 1 x 25/50 (IRAM 2263)", "CORTE A-A, VISTA LATERAL, D1, D2 Y 3D", "6:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_cable_acometida_1.svg"))
