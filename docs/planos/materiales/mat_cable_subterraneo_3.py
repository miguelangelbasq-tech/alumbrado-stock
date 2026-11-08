"""MAT-CABLE_SUBTERRANEO-3 (rev. B) · Cables Cu XLPE tetra/tripolares nuevos del pañol (altas del equipo): IRAM 62266 (LSZH) 1047 4 × 2,5,
1037 4 × 4, 1033 4 × 6, 3083 3 × 1,5 · IRAM 2178 1046 4 × 4, 1059 4 × 6.
Plano con CABN de r3d/piezas/perfiles_nelec.mjs (mismo armado que CAB de perfiles_cables, sin tocarlo); 3D: r3d/out/nelec_sub3.png y nelec_sub3b.png.
Datos: ficha de la app (Retenax Valio: Ø, XLPE 0,7, vaina 1,8, intensidades), Afumex 1000+ (IRAM 62266, XLPE silanizado + vaina LSZH, sin Ø visible).
Fuentes: r3d/FUENTES_nelec.md y FUENTES_cables.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nelekit import *

C = PN["CABN"]["L4x6"]; C3 = PN["CABN"]["L3x1_5"]; c0 = C["conds"][0]
h = hojaN()

# =============== 1. VISTA LATERAL ===============
h.titulo(40, 62, "VISTA LATERAL - PUNTA PELADA", "ESC. 3,5:1 · 4 x 6 IRAM 62266 (1033) · PELADO ILUSTRATIVO (*)")
e = 3.5; X0, YC = 172, 205
La, Lc = [32, 38, 44, 50], [44, 50, 56, 62]
pts = CK.lateral(h, X0, YC, e, C, -24, 0, 7, La, Lc, sep=5.4, cortar=-12)
for (x, y, xa, r, rr), f in zip(pts, ["L1", "L2", "L3", "N"]): h.txt(x + 6, y + 4, f, 10.5, 700)
h.dimV(X0 - 24 * e - 22, YC - C["Ro"] * e, YC + C["Ro"] * e, "Ø14,5 (*)", ext=X0 - 24 * e - 4, c=OR)
yb = YC + 56
h.dimH(yb, X0, X0 + La[3] * e, "", ext=pts[3][1] + pts[3][3]); h.txt(X0 + La[3] / 2 * e, yb + 14, "50 (*)", 9.5, 400, OR, "middle")
h.dimH(yb, X0 + La[3] * e, X0 + Lc[3] * e, "", ext=pts[3][1] + pts[3][4]); h.txt(X0 + (La[3] + Lc[3]) / 2 * e, yb + 14, "12 (*)", 9.5, 400, OR, "middle")
h.globo("1", X0 - 40, YC - C["Ro"] * e, X0 - 40, 112, r=9)
h.globo("2", X0 + 3.5 * e, YC - C["Ri"] * e + 4, X0 + 10, 112, r=9)
h.globo("3", pts[0][2] - 14, pts[0][1] - pts[0][3], pts[0][2] - 14, 112, r=9)
h.globo("4", pts[0][0] - 10, pts[0][1] - pts[0][4], pts[0][0] - 10, 112, r=9)

# =============== 2. CORTES A COLOR ===============
h.titulo(560, 62, "CORTE A-A A COLOR", "ESC. 10:1 · 4 x 6 Y 3 x 1,5 · AEA 90364")
ec = 10.0; cx, cy = 640, 210
CK.corte(h, cx, cy, ec, C, color=True)
h.dimH(cy + C["Ro"] * ec + 22, cx - C["Ro"] * ec, cx + C["Ro"] * ec, "Ø14,5 (*)", ext=cy, c=OR)
CK.cota_radial(h, cx, cy, C["Ri"] * ec, C["Ro"] * ec, 120, "1,8 LSZH (*)", lado=-1, dx=14, c=OR)
cx3 = 785; CK.corte(h, cx3, cy, ec, C3, color=True)
h.dimH(cy + C3["Ro"] * ec + 22, cx3 - C3["Ro"] * ec, cx3 + C3["Ro"] * ec, "Ø10 (*)", ext=cy, c=OR)
CK.leyendaF(h, 566, 312, ["L1", "L2", "L3", "N"], 2, 140)
h.txt(560, 356, "VAINA LSZH: SIN HALOGENOS, POCO HUMO (IRAM 62266).", 9, 400)

# =============== 3. D1 · 62266 vs 2178 ===============
DY = 380
h.titulo(40, DY, "D1 - IRAM 62266 (LSZH) CONTRA IRAM 2178 (PVC)", "MISMO ARMADO · CAMBIA LA VAINA")
fil = [["", "IRAM 62266 (1033 · 1037 · 1047 · 3083)", "IRAM 2178 (1046 · 1059)"], ["AISLACION", "XLPE (SILANIZADO, AFUMEX)", "XLPE"],
       ["VAINA", "LSZH: SIN HALOGENOS, BAJO HUMO", "PVC NEGRO 1,8"], ["SI SE QUEMA", "HUMO POCO OPACO, NO CORROSIVO", "HUMO DENSO, ACIDO (HCl)"],
       ["DONDE CONVIENE", "CAÑERIAS, LOCALES, TUNELES (*)", "ENTERRADO, ZANJA AP-TC-001"]]
yd = tablaN(h, 40, DY + 30, [(110, "l", False), (330, "l", False), (330, "l", False)], fil, None, rowh=15)
h.txt(40, yd + 14, "EL Ø, EL ESPESOR DE LA VAINA LSZH Y LAS INTENSIDADES DEL 62266 NO SE VIERON EN LA FICHA: SE USAN LOS DEL 2178 (*).", 9, 400, OR)

# =============== 4. TABLA ===============
TAB = {1047: ("4 x 2,5", "62266", "12 (*)", "37 A (*)"), 1037: ("4 x 4", "62266", "13,5 (*)", "48 A (*)"), 1033: ("4 x 6", "62266", "14,5 (*)", "61 A (*)"),
       3083: ("3 x 1,5", "62266", "10 (*)", "28 A (*)"), 1046: ("4 x 4", "2178", "13,5", "48 A"), 1059: ("4 x 6", "2178", "14,5", "61 A")}
filas = [["COD.", "DESCRIPCION (TAL CUAL EL PAÑOL)", "UN.", "FORM.", "NORMA", "Ø EXT.", "ENTERR.", "IGUAL A"]]
igual = {1047: "1009 (PVC)", 1037: "1010 (PVC)", 1033: "1011 (PVC)", 3083: "6001 (PVC)", 1046: "1010 (*)", 1059: "1011 (*)"}
for c in [1047, 1037, 1033, 3083, 1046, 1059]:
    r = catN(c, 46); f, n, d, i = TAB[c]; filas.append([r[0], r[1], r[2], f, n, d, i, igual[c]])
yt = tablaN(h, 40, 610, [(40, "c", True), (306, "l", False), (50, "c", False), (56, "c", False), (56, "c", False), (64, "c", True), (66, "c", True), (132, "c", False)],
            filas, "CODIGOS DEL PAÑOL (6) - ALTAS DEL EQUIPO")
h.txt(40, yt + 13, "Ø E INTENSIDADES: FICHA DE LA APP PARA IRAM 2178-1 (ENTERRADO 0,70 m, 25 °C). «IGUAL A»: MISMA FORMACION YA EN MAT-CABLE_SUBTERRANEO-1.", 8.8, 400, G)
notasW(h, 40, yt + 34, [
    "COTAS EN mm. XLPE 0,7, VAINA 1,8 Y Ø: FICHA DE LA APP (PRYSMIAN RETENAX VALIO). CUERDA CLASE 2 DE 7 ALAMBRES (MINIMO IEC 60228).",
    "(*) 62266: Ø, VAINA E INTENSIDADES TOMADOS DEL 2178 (LA TABLA DEL AFUMEX 1000+ NO SE PUDO ABRIR). COLOR DE LA VAINA LSZH A CONFIRMAR CON EL ROLLO.",
    "(*) 1046 Y 1059 REPITEN LA FORMACION DE 1010 Y 1011 (4 x 4 Y 4 x 6 IRAM 2178): CODIGO NUEVO PARA EL MISMO MATERIAL. REVISAR CON EL PAÑOL.",
    "(*) 3083 ES UN CABLE PERO ESTA EN LA FAMILIA 3 (PROTECCION). UNIDADES MEZCLADAS: «m», «M», «METRO», TAL CUAL EL PAÑOL.",
    "PELADO, PASO DE CABLEADO Y GRABADO: ILUSTRATIVOS (*). FUENTES: r3d/FUENTES_nelec.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - 4 x 6 IRAM 62266 (1033) EN ESCALONES", "CADA CAPA TERMINA ANTES QUE LA DE ADENTRO · VENTANA EN LA VAINA")
A = img3d(h, "nelec_sub3", 905, 90, 580)
columna(h, A, [("vaina", "1", "VAINA LSZH (*)"), ("marca", "", "GRABADO IRAM 62266"), ("relleno", "2", "RELLENO"), ("ais0", "3", "AISLACION XLPE"),
               ("cu0", "4", "CUERDA Cu CLASE 2")], 1520, 110, 430, paso=34)
h.txt(890, 480, "VISTA 3D - 3 x 1,5 IRAM 62266 (3083) · COLUMNA A LUMINARIA", 11, 700, NV, "start", INT)
A2 = img3d(h, "nelec_sub3b", 925, 500, 460)
columna(h, A2, [("vaina", "1", "VAINA LSZH (*)"), ("relleno", "2", "RELLENO"), ("ais1", "3", "XLPE MARRON · NEGRO · CELESTE (*)"), ("cu2", "4", "Cu 7 ALAMBRES")], 1400, 540, 740, paso=34)
bloque(h, 890, 800, "DONDE SE USA", ["TRONCAL DE LA PLAZA Y SUBIDAS (MISMOS USOS QUE MAT-CABLE_SUBTERRANEO-1).", "62266: DONDE SE PIDA LIBRE DE HALOGENOS (LOCALES, CAÑERIAS) (*)."], w=740, sz=9.5, lh=13)
rayadosRef(h, 890, 880, ["PVCV", "REL", "XLP", "CU"], cols=4, dx=185)
rotuloMat(h, "MAT-CABLE_SUBTERRANEO-3", "CABLE Cu XLPE IRAM 62266", "Y 2178 (ALTAS NUEVAS)", "LATERAL, CORTES, D1, CODIGOS Y 3D", "3,5:1 / 10:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardar(h, "mat_cable_subterraneo_3")
