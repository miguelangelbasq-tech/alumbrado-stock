"""MAT-CABLE_ACOMETIDA-3 (rev. B) · Cable unipolar IRAM NM 247-3 450/750 V (1030 celeste · 1031 negro · 7009 / 7010 / 7008 verde-amarillo · 1029 1 × 16 negro).
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (CAB.u6n, u6c, u10v); 3D: r3d/out/cab_acom3.png.
Datos: ficha de la app (Prysmian Superastic Jet: 6 mm² Ø 4,7 / 0,8 · 10 mm² Ø 6,0 / 1,0). Cuerda clase 5 (*). Fuentes: r3d/FUENTES_cables.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

U6, U10 = PC["CAB"]["u6n"], PC["CAB"]["u10v"]; c6, c10 = U6["conds"][0], U10["conds"][0]
h = hoja()

# =============== VISTA LATERAL ===============
h.titulo(40, 62, "VISTA LATERAL - PUNTA PELADA", "ESC. 8:1 · 1 x 6 mm² · PELADO ILUSTRATIVO (*)")
e = 8.0; x0, yc = 90, 200; Ro, Rc = U6["Ro"] * e, c6["R"] * e
h.path(f"M{x0},{yc-Ro} H{x0+34*e} V{yc+Ro} H{x0} q-6,{-Ro/2} 0,{-Ro} t0,{-Ro} Z", "#fff", K, 1.4)
h.rect(x0 + 34 * e, yc - Rc, 14 * e, 2 * Rc, "#fff", K, 1)
xx = x0 + 34 * e + 3
while xx < x0 + 48 * e - 3: h.ln(xx, yc + Rc, xx + 5, yc - Rc, K, .35); xx += 2.6
h.ln(x0 - 12, yc, x0 + 50 * e, yc, K, .45, h.EJE)
h.dimV(x0 - 18, yc - Ro, yc + Ro, "Ø4,7", ext=x0 - 2)
h.dimV(x0 + 48 * e + 18, yc - Rc, yc + Rc, "Ø3,1", ext=x0 + 48 * e + 2)
h.dimH(yc + Ro + 30, x0 + 34 * e, x0 + 48 * e, "", ext=yc + Rc); h.txt(x0 + 41 * e, yc + Ro + 44, "14 (*)", 9.5, 400, OR, "middle")
xs = x0 + 17 * e; h.ln(xs, yc - Ro - 12, xs, yc + Ro + 12, K, .6, h.EJE)
for s in (-1, 1): h.ln(xs - 6, yc + s * (Ro + 12), xs + 6, yc + s * (Ro + 12), K, 2)
h.txt(xs - 8, yc - Ro - 16, "A", 12, 700, K, "end"); h.txt(xs - 8, yc + Ro + 28, "A", 12, 700, K, "end")
h.globo("1", x0 + 26 * e, yc - Ro, x0 + 26 * e, 118, r=9); h.globo("2", x0 + 44 * e, yc - Rc, x0 + 44 * e, 118, r=9)
h.txt(x0 + 34 * e - 6, yc + Ro + 64, "CUERDA FLEXIBLE: SE TERMINA CON PUNTERA (MAT-TERMINALES-2) U OJAL", 9, 400, G, "middle")

# =============== CORTE A-A ===============
h.titulo(560, 62, "CORTE A-A (6 mm²)", "ESC. 25:1 · CUERDA CLASE 5")
ec = 25.0; cx, cy = 640, 210
nucleo2d(h, cx, cy, ec, c6)
h.dimH(cy + U6["Ro"] * ec + 24, cx - U6["Ro"] * ec, cx + U6["Ro"] * ec, "Ø4,7", ext=cy)
cota_radial(h, cx, cy, c6["R"] * ec, c6["rc"] * ec, 40, "0,8", dx=40)
h.txt(722, 250, f"{c6['n']} ALAMBRES Ø0,31 (*)", 9.6, 400, OR); h.txt(722, 264, "AISLACION PVC", 9.6)
h.globo("1", cx - U6["Ro"] * ec * .8, cy + U6["Ro"] * ec * .5, 590, 300, r=9); h.globo("2", cx - 6, cy + 4, 600, 120, r=9)

# =============== D1 colores ===============
h.titulo(40, 352, "DETALLE D1 - LOS COLORES DEL PAÑOL", "ESC. 18:1 · AISLACION PVC DE UN COLOR, CUERDA FLEXIBLE (ALAMBRES FINOS)")
for i, (C, f, t) in enumerate([(U6, "L2", "1031 · 1029 NEGRO"), (U6, "N", "1030 CELESTE"), (U6, "PE", "7009 VERDE-AMARILLO 6"), (U10, "PE", "7010 VERDE-AMARILLO 10")]):
    x = 110 + i * 190; y = 460; c = dict(C["conds"][0]); c["f"] = f
    nucleo2d(h, x, y, 18, c, color=True)
    h.circ(x, y, C["Ro"] * 18 + 6, "none", K, .5, 'stroke-dasharray="4 3"')
    h.txt(x, y + 72, t, 10, 700, K, "middle")
h.txt(40, 560, "TIERRA SIEMPRE VERDE-AMARILLA (AEA 90364). 7004–7007 DE BAJA: USAR 2010 / 7010 (CLAUDE.md §11.3).", 9.6, 400, G)

# =============== TABLA ===============
TD = {1030: ("4,7", "0,8", "CELESTE"), 1031: ("4,7", "0,8", "NEGRO"), 7009: ("4,7", "0,8", "VERDE-AM."), 7010: ("6,0", "1,0", "VERDE-AM."), 7008: ("— (*)", "— (*)", "VERDE-AM."), 1029: ("— (*)", "— (*)", "NEGRO")}
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "Ø EXT.", "AISL.", "COLOR"]]
for c in [1030, 1031, 7009, 7010, 7008, 1029]: r = cat(c, 50); fil.append([r[0], r[1], r[2], *TD[c]])
yt = tablaC(h, 40, 596, [(52, "c", True), (360, "l", False), (32, "c", False), (70, "c", True), (70, "c", True), (100, "c", False)], fil, "VARIANTES Y CODIGOS DEL PAÑOL (6)", rowh=16)
rayadosC(h, 730, 596, ["PLAS", "CU"])
ydat = bloque(h, 40, yt + 22, "DATOS TECNICOS", [
    "NORMA IRAM NM 247-3 · 450/750 V · COBRE FLEXIBLE CON AISLACION DE PVC (PRYSMIAN SUPERASTIC JET).",
    "6 mm²: Ø 4,7 / AISLACION 0,8 · 10 mm²: Ø 6,0 / 1,0 (FICHA). UNIDAD DE COMPRA: METRO.",
    "NO ES CABLE PARA ENTERRAR: VA DENTRO DE TABLEROS, CAJAS O CAÑOS."], w=800, sz=10, lh=13.5)
notasW(h, 40, ydat + 4, [
    "COTAS EN mm. Ø CONDUCTOR = Ø EXT. − 2 x AISLACION (4,7 − 1,6 = 3,1): SALE DE LA FICHA, NO ES DATO SEPARADO DEL FABRICANTE.",
    "(*) CUERDA CLASE 5 (IEC 60228): ALAMBRES DE Ø ≤ 0,31 (6 mm²) / 0,41 (10 mm²) USUALES; LA CANTIDAD DIBUJADA ES ILUSTRATIVA.",
    "(*) 1029 (16 mm²) Y 7008 (2,5 mm²): SUS MEDIDAS NO ESTAN EN LA FICHA. A CONFIRMAR CON EL ROLLO.",
    "MISMO MATERIAL, OTRO CODIGO: 7010 = 1032 (CLAUDE.md §11.3). FUENTES: r3d/FUENTES_cables.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - TRES UNIPOLARES", "NEGRO 6 · CELESTE 6 · VERDE-AMARILLO 10 · PUNTAS PELADAS · CUERDA DE ALAMBRES FINOS")
A = img3d(h, "cab_acom3", 880, 110, 560)
columna(h, A, [("u6n_a", "1", "AISLACION PVC"), ("u6n_c", "2", "CUERDA CLASE 5"), ("u6c_a", "", "1030 CELESTE"), ("u10v_a", "", "7010 VERDE-AM. 10"), ("u10v_c", "", "Cu 10 mm²")], 1480, 280, 620, paso=40)
bloque(h, 890, 680, "DONDE SE USA", [
    "CABLEADO INTERNO DE TABLEROS (1030 / 1031).",
    "PAT: CABLE 1 x 10 VERDE-AMARILLO (7010): 10 m POR TABLERO + 7 m POR CIRCUITO (PRFV) O 4 m POR COLUMNA (METALICA).",
    "LAS PUNTAS VAN CON PUNTERA (MAT-TERMINALES-2) U OJAL (MAT-TERMINALES-1)."], w=740, sz=10, lh=14)
h.txt(890, 1010, "RENDER: three.js (r3d/escenas/cab_acom3.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-CABLE_ACOMETIDA-3", "CABLE UNIPOLAR", "IRAM NM 247-3 (450/750 V)", "VISTA LATERAL, CORTE A-A, COLORES Y 3D", "8:1 / 25:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_cable_acometida_3.svg"))
