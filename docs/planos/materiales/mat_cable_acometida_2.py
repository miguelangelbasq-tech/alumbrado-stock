import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *

h = HojaMat()
COD = [1027, 1028, 1004, 1002, 1003]
h.check_codigos(COD)
R_CU = math.sqrt(4 * 16 / math.pi) / 2      # 2,26 (calculado de la sección)
E_A, E_V = 1.0, 1.8                          # (*) espesores ilustrativos, no están en la ficha
RC = R_CU + E_A
D_EXT = 2 * (RC / math.sin(math.pi / 4) + RC + .6 + E_V)
CONDS = ["L1", "L2", "L3", "N"]

# ============ VISTA LATERAL
h.titulo(40, 62, "VISTA LATERAL - PUNTA PELADA", "MODELO 4 x 16 mm² (1027 / 1028) · S/E · LARGOS ILUSTRATIVOS")
k = 2.6
pts = cable_lateral(h, 70, 205, k, D_EXT / 2, CONDS, RC, 40, 4, [30, 38, 46, 54], 14, abrir=2.0, rcu=R_CU, corteAA=24)
h.dimV(52, 205 - D_EXT / 2 * k, 205 + D_EXT / 2 * k, "Ø (*)", ext=68, c=OR)
for (x, y), c in zip(pts, CONDS): h.txt(x + 14 * k + 8, y + 4, c, 10.5, 700)
h.globo("1", 70 + 30 * k, 205 - D_EXT / 2 * k, 70 + 30 * k, 112)
h.globo("3", pts[0][0] - 20, pts[0][1] - RC * k, pts[0][0] - 20, 112)
h.globo("4", pts[3][0] + 22, pts[3][1] + R_CU * k, pts[3][0] + 22, 300)

# ============ CORTE A-A
h.titulo(500, 62, "CORTE A-A", "ESC. 5:1 · COTAS EN mm")
kc = 5.0; cx, cy = 610, 205; Rp = D_EXT / 2 * kc
h.corte_cable(cx, cy, Rp, CONDS, R_CU * kc, E_A * kc, color=False, hilos=7, e_v=E_V * kc)
h.dimH(cy + Rp + 26, cx - Rp, cx + Rp, "Ø EXT. SEGUN FABRICANTE (*)", ext=cy, c=OR)
pc = pos_cond(4, RC * kc, 45)[0]; px, py = cx + pc[0], cy - pc[1]
for i, (t, ax, ay) in enumerate([("1 · VAINA (XLPE O LSZH) (*)", cx + Rp * .8, cy - Rp * .6),
                                  ("3 · AISLACION XLPE (*)", px + (R_CU + E_A * .6) * kc * .7, py - (R_CU + E_A * .6) * kc * .7),
                                  ("4 · Cu 16 mm² (Ø4,51 CALC.)", px + 2, py + 2),
                                  ("2 · RELLENO", cx + Rp * .55, cy + Rp * .5)]):
    ty = 128 + i * 34; h.ln(ax, ay, 712, ty - 4, K, .6); h.circ(ax, ay, 1.8, K, K, 0); h.ln(712, ty - 4, 718, ty - 4, K, .6)
    h.txt(721, ty, t, 10.5, 400, OR if "(*)" in t else K)

# ============ D1 color
h.titulo(40, 352, "DETALLE D1 - CORTE A COLOR", "S/E · CADA CONDUCTOR CON SU COLOR Y LA CUERDA")
dx, dy, dr = 150, 470, 88
h.circ(dx, dy, dr + 9, "none", K, .7, 'stroke-dasharray="4 3"')
sc = dr / (D_EXT / 2)
h.corte_cable(dx, dy, dr, CONDS, R_CU * sc, E_A * sc, color=True, hilos=7, e_v=E_V * sc)
h.leyenda_fases(270, 420, CONDS, 2, 110)
h.parrafo(270, 470, "TETRAPOLAR: 3 FASES + NEUTRO DEL MISMO 16 mm². COLORES AEA 90364 (*) A CONFIRMAR CON EL FABRICANTE.", 210, 10, OR)

# ============ D2 variante antihurto
h.titulo(520, 352, "D2 - VARIANTE ANTIHURTO", "1002 (2,5/2,5) · 1003 (4/4) · ESQUEMA (*)")
ax_, ay_ = 640, 470
h.circ(ax_, ay_, 62, "#26282c", K, 1)
h.circ(ax_, ay_, 52, "#9a9ea4", K, .5)
for q in range(22):
    a = 2 * math.pi * q / 22; h.circ(ax_ + 46 * math.cos(a), ay_ + 46 * math.sin(a), 5.2, "#e9a466", "#6a3510", .4)
h.circ(ax_, ay_, 38, "#9a9ea4", K, .5)
h.circ(ax_, ay_, 30, FASE["L2"], K, .8); h.cobre2d(ax_, ay_, 20, True, 7)
h.flecha_llamada(ax_ + 20, ay_ - 4, 720, 420, "FASE AL CENTRO")
h.flecha_llamada(ax_ + 46 * .7, ay_ - 46 * .7, 720, 444, "NEUTRO CONCENTRICO")
h.flecha_llamada(ax_ + 60, ay_ + 14, 720, 468, "VAINA")
h.txt(560, 556, "(*) CONSTRUCCION HABITUAL DEL CABLE CONCENTRICO:", 10, 400, OR)
h.txt(560, 570, "A CONFIRMAR CON EL FABRICANTE DEL ROLLO.", 10, 400, OR)

# ============ tabla
y = h.codigos(40, 610, COD, (52, 0, 40), extra_col=("NORMA", {1027: "IRAM 2164", 1028: "IRAM 62266", 1004: "—", 1002: "—", 1003: "—"}, 110), wtot=800, rowh=20)

h.notasM(40, 800, [
    "ES LA BAJADA QUE FIJA EL AP-T-019 REF. 12 (Cu 4 x 16 XLPE AUTOPORTANTE O XLPE/LSZH). NO SE CAMBIA SIN APROBACION DE LA INSPECCION.",
    "(*) EL Ø EXTERIOR Y LOS ESPESORES DEPENDEN DEL FABRICANTE (FICHA DE LA APP): PEDIR SU HOJA DE DATOS. LOS DEL DIBUJO SON ILUSTRATIVOS.",
    "Ø DEL CONDUCTOR = RAIZ(4 x 16 / PI) = 4,51: CALCULADO DE LA SECCION.",
    "(*) CUERDA: SE DIBUJAN 7 HILOS. A CONFIRMAR CON EL FABRICANTE.",
    "FUENTE: PLIEGO LP 21478, PLANO AP-T-019; FICHA «CABLE DE ACOMETIDA» DE LA APP.",
], 790)

# ============ 3D
h.titulo(890, 62, "VISTA 3D - BAJADA Cu 4 x 16 mm²", "TETRAPOLAR · PUNTA PELADA EN ESCALONES")
h.iso(5.4, 1010, 215)
o = cable3d(h, D_EXT / 2, CONDS, R_CU, E_A * 1.2, L_vaina=48, L_rel=4, L_ais=(22, 8), L_cu=12, abrir=1.7, hilos=7,
            texto="Cu 4x16 mm² XLPE · 0,6/1,1 kV")
h.g3b("1", o["vaina"], 1440, 150, "VAINA")
h.g3b("2", o["relleno"], 1440, 200, "RELLENO")
h.g3b("3", o["ais"][-1], 1440, 250, "AISLACION XLPE")
h.g3b("4", o["cu"][-1], 1440, 300, "Cu 16 mm² (CUERDA)")
h.txt(890, 640, "Espesores y largos de pelado ilustrativos (*): pedir la hoja de datos del fabricante.", 11, 400, OR, "start", INT)

h.bloque(890, 700, "DATOS TECNICOS", [
    "FORMACION: 4 x 16 mm² COBRE",
    "1027: XLPE AUTOPORTANTE, IRAM 2164",
    "1028: XLPE / LSZH (BAJA EMISION DE HUMOS), IRAM 62266",
    "UNIDAD DE COMPRA: METRO",
], 360)
h.bloque(1270, 700, "DONDE SE USA", [
    "BAJADA DE LA ACOMETIDA AEREA (AP-T-019 REF. 12), GUIA «ACOMETIDA AEREA»",
    "SE TOMA DE LA LINEA CON MORSETO 1995/6 (BAJADA 4-16)",
    "AL NH: TERMINAL DE OJAL 16 mm² (2046) CON TERMOCONTRAIBLE",
    "ENTRA A LA CAJA POR PRENSACABLE 1 1/4\"",
], 370)
h.rotuloM("MAT-CABLE_ACOMETIDA-2", "BAJADA DE COBRE 4 x 16 mm²", "AUTOPORTANTE / LSZH Y ANTIHURTO", "VISTA LATERAL, CORTE A-A, DETALLES Y VISTA 3D", "5:1", "D1, D2, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_cable_acometida_2.svg"))
print("ok")
