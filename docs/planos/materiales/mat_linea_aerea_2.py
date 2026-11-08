"""MAT-LINEA_AEREA-2 (rev. B) · Preensamblado Al 2 × 16 (1502) y Al-Al 3 × 25 + 1 × 16 (1503), sin portante (IRAM 2263 · ET-1005); 1015, 1016.
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (HAZ.h3x25_16, h2x16); 3D: r3d/out/linea2.png.
Solo el Ø del haz 3 × 25 + 1 × 16 (≈ 32) está en la ficha: lo demás (*). Fuentes: r3d/FUENTES_cables.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

H3, H2 = PC["HAZ"]["h3x25_16"], PC["HAZ"]["h2x16"]
h = hoja()

# =============== CORTES ===============
h.titulo(40, 62, "CORTE A-A · 3 x 25 + 1 x 16 (1503)", "ESC. 7:1 · 4 CONDUCTORES RETORCIDOS, SIN PORTANTE")
e = 7.0; cx, cy = 180, 230
haz2d(h, cx, cy, e, H3, a0=45)
Rh = H3["Dh"] / 2 * e; h.circ(cx, cy, Rh, "none", G, .6, 'stroke-dasharray="4 3"')
h.dimH(cy + Rh + 22, cx - Rh, cx + Rh, "Ø HAZ ≈ 22 (CALC.) · FICHA ≈ 32 (*)", ext=cy, c=OR)
f0 = H3["fases"][0]
for i, t in enumerate(["FASES 1-2-3: Al 25, 7 ALAMBRES (*)", "AISLACION XLPE NEGRA 1,4 (*)", "NEUTRO: Al 16 (EL MENOR), XLPE 1,2 (*)", "SIN NEUTRO PORTANTE: EL HAZ SE SOSTIENE", "ENTERO CON GRAMPAS (*)"]):
    h.txt(340, 120 + i * 18, t, 9.6, 400, OR if "(*)" in t else K)
h.titulo(560, 62, "CORTE B-B · 2 x 16 (1502)", "ESC. 7:1 · RED MONOFASICA")
haz2d(h, 690, 230, e, H2, a0=0)
R2 = H2["Dh"] / 2 * e; h.circ(690, 230, R2, "none", G, .6, 'stroke-dasharray="4 3"')
h.dimH(230 + R2 + 22, 690 - R2, 690 + R2, "Ø HAZ ≈ 15 (*)", ext=230, c=OR)

# =============== D1 color ===============
h.titulo(40, 380, "DETALLE D1 - A COLOR", "S/E · XLPE NEGRA · ALUMINIO EN CUERDA (7 ALAMBRES (*))")
haz2d(h, 170, 490, 5.4, H3, color=True, a0=45); haz2d(h, 420, 490, 5.4, H2, color=True, a0=0)
h.txt(170, 580, "3 x 25 + 1 x 16 (1503)", 10.5, 700, K, "middle"); h.txt(420, 580, "2 x 16 (1502)", 10.5, 700, K, "middle")
h.txt(560, 450, "LOS CONDUCTORES SE IDENTIFICAN 1-2-3-N", 9.6); h.txt(560, 465, "(EN LA APP F1-F2-F3-N); EL NEUTRO ES EL", 9.6); h.txt(560, 480, "DE MENOR SECCION. MARCA EXACTA (NUMEROS", 9.6, 400, OR); h.txt(560, 495, "O NERVIOS) SEGUN FABRICANTE (*).", 9.6, 400, OR)

# =============== VISTA LATERAL ===============
h.titulo(40, 612, "VISTA LATERAL DEL HAZ 3 x 25 + 1 x 16", "S/E · CUATRO CONDUCTORES RETORCIDOS ENTRE SI · PASO (*)")
X0, YC = 60, 690
lateral_haz(h, X0, YC, 1.6, H3, 300, 260, a0=45)
el = 1.6
h.ln(X0 - 10, YC, X0 + 300 * el + 10, YC, K, .45, h.EJE)
h.dimH(YC + 30, X0, X0 + 260 * el, "PASO ≈ 260 (*)", ext=YC + 16, c=OR)

# =============== TABLA ===============
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "ITEM LP 21478"]]
it = {1502: "7.10", 1015: "7.11", 1503: "7.15", 1016: "— (MAT-CABLE_ACOMETIDA-1)"}
for c in [1502, 1503, 1015, 1016]: r = cat(c, 54); fil.append([r[0], r[1], r[2], it[c]])
yt = tablaC(h, 40, 760, [(52, "c", True), (400, "l", False), (32, "c", False), (200, "c", False)], fil, "CODIGOS DEL PAÑOL (4)", rowh=16)
rayadosC(h, 560, 600, ["XLP", "ALU"], cols=2, dx=140)
ydat = bloque(h, 40, yt + 22, "DATOS TECNICOS", [
    "NORMA IRAM 2263 · EPEC ET-1005 · 0,6/1,1 kV · CONDUCTORES DE ALUMINIO AISLADOS EN XLPE, RETORCIDOS EN HAZ.",
    "2 x 16: RED MONOFASICA DE ALUMBRADO · 3 x 25 + 1 x 16: RED TRIFASICA (HAZ ≈ 32 SEGUN FICHA). UNIDAD: METRO."], w=800, sz=10, lh=13.5)
notasW(h, 40, ydat + 4, [
    "(*) SOLO EL Ø DEL HAZ 3 x 25 + 1 x 16 (≈ 32) ESTA EN LA FICHA Y ES ORIENTATIVO; CON AISLACION 1,4 EL HAZ DA ≈ 22. VERIFICAR ANTES DE ELEGIR GRAMPA.",
    "(*) Ø DE CADA CONDUCTOR, AISLACION, ALAMBRES, PASO DE CABLEADO Y Ø DEL 2 x 16: A CONFIRMAR CON EL FABRICANTE.",
    "1016 (3 x 1 x 25/50, CON NEUTRO PORTANTE) TIENE SU HOJA: MAT-CABLE_ACOMETIDA-1.",
    "FUENTES: LP 21478 ANEXO I (7.10 / 7.11 / 7.15); EPEC ET-1005; IRAM 2263; r3d/FUENTES_cables.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - PREENSAMBLADOS 3 x 25 + 1 x 16 Y 2 x 16", "HACES RETORCIDOS · PUNTAS PELADAS EN ESCALONES")
A = img3d(h, "linea2", 900, 92, 660)
columna(h, A, [("f0", "", "FASE Al 25 · XLPE"), ("c0", "", "Al 7 ALAMBRES"), ("f3", "", "NEUTRO Al 16"), ("g0", "", "2 x 16 (1502)")], 1500, 140, 560, paso=36)
bloque(h, 890, 650, "DONDE SE USA", [
    "RED AEREA DE ALUMBRADO DE BARRIO · GUIA «TENDIDO AEREO BARRIO».",
    "SE SUJETA POR EL HAZ CON GRAMPAS Y MENSULAS (MAT-MORSETERIA_AEREA-1).",
    "SE DERIVA CON MORSETOS DE PERFORACION (MAT-MORSETO-1 / -2). VANO MAXIMO 40 m (ET-1005)."], w=740, sz=10, lh=14)
h.txt(890, 1010, "RENDER: three.js (r3d/escenas/linea2.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-LINEA_AEREA-2", "PREENSAMBLADO Al 2 x 16", "Y 3 x 25 + 1 x 16 (IRAM 2263)", "CORTES, D1, VISTA LATERAL Y 3D", "7:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_linea_aerea_2.svg"))
