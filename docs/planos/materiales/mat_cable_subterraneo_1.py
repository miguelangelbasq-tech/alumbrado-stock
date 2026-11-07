import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *

h = HojaMat()
COD = [1009, 1010, 1011, 1007, 1008, 1006, 6001]
h.check_codigos(COD)
# modelo dibujado: 4 x 2,5 mm² (1009). Ø ext 12 (tabla ficha), vaina 1,8, aislación 0,7 (ficha). Ø conductor = raíz(4·2,5/π) = 1,78 (calculado)
D_EXT, E_V, E_A = 12.0, 1.8, 0.7
R_CU = math.sqrt(4 * 2.5 / math.pi) / 2      # 0,892
RC = R_CU + E_A
CONDS = ["L1", "L2", "L3", "N"]

# ============ VISTA LATERAL (punta pelada)
h.titulo(40, 62, "VISTA LATERAL - PUNTA PELADA", "MODELO 4 x 2,5 mm² (1009) · ESC. 4:1 · LARGOS DE PELADO ILUSTRATIVOS")
k = 4.0
pts = cable_lateral(h, 70, 205, k, D_EXT / 2, CONDS, RC, 40, 4, [30, 36, 42, 48], 12, abrir=2.1, rcu=R_CU, corteAA=24)
h.dimV(52, 205 - 6 * k, 205 + 6 * k, "Ø12", ext=68)
for (x, y), c in zip(pts, CONDS):
    h.txt(x + 12 * k + 8, y + 4, {"L1": "L1", "L2": "L2", "L3": "L3", "N": "N"}[c], 10.5, 700)
h.globo("1", 70 + 30 * k, 205 - 6 * k, 70 + 30 * k, 112)
h.globo("2", 70 + 42 * k, 205 - 10, 70 + 54 * k, 112)
h.globo("3", pts[0][0] - 20, pts[0][1] - RC * k, pts[0][0] - 20, 112)
h.globo("4", pts[3][0] + 22, pts[3][1] + R_CU * k, pts[3][0] + 22, 300)

# ============ CORTE A-A (B y N, acotado)
h.titulo(500, 62, "CORTE A-A", "ESC. 10:1 · COTAS EN mm")
kc = 10.0; cx, cy = 610, 205; Rp = D_EXT / 2 * kc
h.corte_cable(cx, cy, Rp, CONDS, R_CU * kc, E_A * kc, color=False, hilos=7, e_v=E_V * kc)
h.dimH(cy + Rp + 26, cx - Rp, cx + Rp, "Ø12 (EXTERIOR)", ext=cy)
# espesor de vaina: cota radial a la izquierda arriba
h.ln(cx - Rp, cy, cx - Rp + E_V * kc, cy, K, .6); h.tick(cx - Rp, cy); h.tick(cx - Rp + E_V * kc, cy)
pc = pos_cond(4, RC * kc, 45)[0]; px, py = cx + pc[0], cy - pc[1]
for i, (t, ax, ay) in enumerate([("1 · VAINA PVC e = 1,8", cx + Rp * .8, cy - Rp * .6),
                                  ("3 · AISLACION XLPE e = 0,7", px + (R_CU + E_A * .6) * kc * .7, py - (R_CU + E_A * .6) * kc * .7),
                                  ("4 · Ø CONDUCTOR 1,78 (CALC.)", px + 2, py + 2),
                                  ("2 · RELLENO", cx + Rp * .55, cy + Rp * .5)]):
    ty = 128 + i * 34; h.ln(ax, ay, 712, ty - 4, K, .6); h.circ(ax, ay, 1.8, K, K, 0); h.ln(712, ty - 4, 718, ty - 4, K, .6)
    h.txt(721, ty, t, 10.5)
h.txt(cx - Rp - 4, cy - 6, "1,8", 10.5, 400, K, "end")

# ============ DETALLE D1 (color, con la cuerda)
h.titulo(40, 352, "DETALLE D1 - CORTE A COLOR", "S/E · CADA CONDUCTOR CON SU COLOR Y LA CUERDA DE HILOS")
dx, dy, dr = 160, 482, 100
h.circ(dx, dy, dr + 9, "none", K, .7, 'stroke-dasharray="4 3"')
sc = dr / (D_EXT / 2)
h.corte_cable(dx, dy, dr, CONDS, R_CU * sc, E_A * sc, color=True, hilos=7, e_v=E_V * sc)
pc = pos_cond(4, RC * sc, 45)[0]; qx, qy = dx + pc[0], dy - pc[1]
for i, (t, ax, ay) in enumerate([("1 · VAINA EXTERIOR PVC NEGRA", dx + dr * .75, dy - dr * .62),
                                  ("3 · AISLACION XLPE (COLOR DE FASE)", qx + (R_CU + E_A * .5) * sc * .8, qy - (R_CU + E_A * .5) * sc * .55),
                                  ("4 · Cu CLASE 2 - CUERDA 7 HILOS (*)", qx + 4, qy + 2),
                                  ("2 · RELLENO", dx + dr * .7, dy + dr * .25)]):
    ty = 404 + i * 22; h.ln(ax, ay, 290, ty - 4, K, .6); h.circ(ax, ay, 1.8, K, K, 0)
    h.txt(294, ty, t, 10.5, 400, OR if "(*)" in t else K)
h.txt(294, 506, "COLORES (AEA 90364):", 10.5, 700)
h.leyenda_fases(294, 524, CONDS, 2, 120)
h.parrafo(294, 572, "LA FICHA DE LA APP ADMITE TAMBIEN: FASE GRIS, NEUTRO CELESTE, TIERRA VERDE-AMARILLO (SEGUN PROYECTO).", 250, 10, G)

# ============ D2: radio de curvatura
h.titulo(520, 352, "DETALLE D2 - CURVA", "RADIO MINIMO DE CURVATURA")
ox, oy, rr = 530, 570, 130
h.path(f"M{ox},{oy-rr} A{rr},{rr} 0 0 1 {ox+rr},{oy}", "none", K, 9)
h.path(f"M{ox},{oy-rr} A{rr},{rr} 0 0 1 {ox+rr},{oy}", "none", "#fff", 6.5)
h.ln(ox - 12, oy - rr, ox, oy - rr, K, 9); h.ln(ox - 12, oy - rr, ox, oy - rr, "#fff", 6.5)
h.ln(ox + rr, oy, ox + rr, oy + 20, K, 9); h.ln(ox + rr, oy, ox + rr, oy + 20, "#fff", 6.5)
h.ln(ox, oy, ox + rr * .707, oy - rr * .707, K, .6); h.circ(ox, oy, 2, K, K, 0)
h.txt(ox + 30, oy - 30, "R min", 11, 700)
h.txt(ox + rr + 14, oy - 120, "Ø < 25: R = 6 x Ø", 10.5); h.txt(ox + rr + 14, oy - 104, "25 a 50: R = 8 x Ø", 10.5)
h.txt(ox + rr + 14, oy - 84, "4x2,5 (Ø12): R ≥ 72", 10.5, 700)

# ============ TABLA DE VARIANTES
TAB = {6001: ("3 x 1,5", "10", "28 A", "24 A"), 1009: ("4 x 2,5", "12", "37 A", "31 A"), 1010: ("4 x 4", "13,5", "48 A", "40 A"),
       1011: ("4 x 6", "14,5", "61 A", "49 A"), 1007: ("4 x 10", "17", "83 A", "66 A"), 1008: ("4 x 16", "20", "107 A", "85 A"),
       1006: ("3 x 25 + 1 x 16", "25,5", "141 A", "108 A")}
cols = [(50, "c", True), (330, "l", False), (110, "c", False), (66, "c", True), (78, "c", True), (78, "c", True), (44, "c", False), (44, "c", True)]
fil = [["COD.", "DESCRIPCION (CATALOGO DEL PAÑOL)", "FORMACION mm²", "Ø EXT.", "ENTERRADO", "EN CAÑO", "UN.", "R min"]]
for c in [6001, 1009, 1010, 1011, 1007, 1008, 1006]:
    f, d, i1, i2 = TAB[c]; dd = float(d.replace(",", "."))
    rmin = (6 if dd < 25 else 8) * dd
    fil.append([str(c), CAT[c][0], f, d, i1, i2, CAT[c][1], f"{rmin:.0f}"])
y = h.tablaM(40, 650, cols, fil, 20, "VARIANTES Y CODIGOS DEL PAÑOL")
h.txt(40, y + 16, "Ø EXT. APROX. E INTENSIDADES: CABLE ENTERRADO A 0,70 m, SUELO A 25 °C, RESISTIVIDAD 100 K·cm/W. R min = RADIO DE CURVATURA (mm).", 10, 400, G)

# ============ NOTAS
h.notasM(40, 880, [
    "COTAS EN mm. EL MODELO DIBUJADO ES EL 4 x 2,5 mm² (1009); LAS OTRAS FORMACIONES SON IGUALES, CAMBIA LA SECCION.",
    "ESPESORES DE LA FICHA: AISLACION XLPE 0,7 Y VAINA PVC 1,8. (*) EN 4 x 10 Y MAYORES PUEDEN SER MAS GRUESOS: A CONFIRMAR CON EL FABRICANTE.",
    "Ø DEL CONDUCTOR = RAIZ(4 x 2,5 / PI) = 1,78: CALCULADO DE LA SECCION NOMINAL, NO ES DATO DEL FABRICANTE.",
    "(*) CUERDA CLASE 2: SE DIBUJAN 7 HILOS; LA CANTIDAD REAL DEPENDE DE LA SECCION. A CONFIRMAR CON EL FABRICANTE.",
    "(*) COLORES DEL 3 x 1,5 (6001): SE DIBUJAN COMO EN LA APP (MARRON, NEGRO, CELESTE). A CONFIRMAR CON EL FABRICANTE.",
    "FUENTE: PRYSMIAN, FOLLETO RETENAX VALIO (IRAM 2178-1) Y CATALOGO DE CABLES BT (RADIOS DE CURVATURA).",
], 790)

# ============ 3D
h.titulo(890, 62, "VISTA 3D - PUNTA PELADA EN ESCALONES", "4 x 2,5 mm² · CADA CAPA TERMINA ANTES QUE LA DE ADENTRO")
h.iso(6.0, 1010, 215)
o = cable3d(h, D_EXT / 2, CONDS, R_CU * 1.35, E_A * 1.6, L_vaina=42, L_rel=4, L_ais=(20, 7), L_cu=10, abrir=1.9, hilos=7,
            texto="IRAM 2178-1 · 0,6/1,1 kV · Cu XLPE 4x2,5")
h.g3b("1", o["vaina"], 1440, 150, "VAINA PVC")
h.g3b("2", o["relleno"], 1440, 200, "RELLENO")
h.g3b("3", o["ais"][-1], 1440, 250, "AISLACION XLPE")
h.g3b("4", o["cu"][-1], 1440, 300, "Cu CLASE 2 (CUERDA)")
h.txt(890, 620, "Los conductores se dibujan un poco más gruesos para que se vean la aislación y la cuerda; las medidas mandan en el corte A-A.", 11, 400, G, "start", INT)

# ============ DATOS TECNICOS / DONDE SE USA
h.bloque(890, 650, "DATOS TECNICOS", [
    "NORMA: IRAM 2178-1 · 0,6/1,1 kV",
    "CONDUCTOR: COBRE CLASE 2 (CUERDA)",
    "AISLACION: XLPE 0,7 mm · VAINA: PVC 1,8 mm",
    "TENDIDO SUBTERRANEO DIRECTO O EN CAÑO",
    "R min DE CURVATURA: 6 x Ø (Ø < 25) · 8 x Ø (25 A 50)",
    "UNIDAD DE COMPRA: METRO",
], 360)
h.bloque(1270, 650, "DONDE SE USA", [
    "TRONCAL DE LA PLAZA (TIPICO 4 x 2,5 - 1009) EN ZANJA AP-TC-001 · GUIA «ZANJEO Y TENDIDO»",
    "DE LA CAJA DE LA COLUMNA A LA LUMINARIA: 3 x 1,5 (6001)",
    "BAJADA SUBTERRANEA DE LA ACOMETIDA (AP-T-019 REF. 13): 4x6 / 4x10 / 4x16 / 3x25+1x16",
    "ITEMS 25 A 40 (PROVISION Y TENDIDO EN ZANJA DE CABLE Cu)",
    "ENTRA A LA CAJA POR PRENSACABLE: 4x2,5 Y 3x1,5 → 3/4\" · 4x6 → 7/8\" · 4x10 → 1\" · 4x16 → 1 1/4\"",
], 370)

h.rotuloM("MAT-CABLE_SUBTERRANEO-1", "CABLE SUBTERRANEO Cu XLPE", "+ VAINA PVC (IRAM 2178-1)", "VISTA LATERAL, CORTE A-A, DETALLES Y VISTA 3D",
          "4:1 / 10:1", "D1, D2, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_cable_subterraneo_1.svg"))
print("ok")
