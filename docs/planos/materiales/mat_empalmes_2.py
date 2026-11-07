import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *
from mk_cab import _circ

h = HojaMat()
COD = [2020, 2019, 2060]
h.check_codigos(COD)
LM = 178        # largo del molde NBA1 (ficha)
DM = 46         # (*) Ø del molde
DCAB = 17       # cable 4x10 (ficha cable subterráneo: Ø 17)
RCU = math.sqrt(4 * 10 / math.pi) / 2; RC = RCU + .7
CONDS = ["L1", "L2", "L3", "N"]
RES = "#7c8f3a"  # (*) color de la resina

# ============ VISTA LATERAL
h.titulo(40, 62, "VISTA LATERAL - EMPALME TERMINADO", "KIT DE REFERENCIA NBA1 · CABLE 4 x 10 (Ø17) · ESC. 1:2 · COTAS EN mm")
k = 2.0; x0, yc = 145, 230
X = lambda mm: x0 + mm * k
h.rect(X(-50), yc - DCAB / 2 * k, 50 * k + 8, DCAB * k, "#fff", K, 1.2); h.rect(X(LM) - 8, yc - DCAB / 2 * k, 50 * k + 8, DCAB * k, "#fff", K, 1.2)
h.path(f"M{X(0)},{yc-DCAB/2*k-4} C{X(14)},{yc-DM/2*k} {X(20)},{yc-DM/2*k} {X(30)},{yc-DM/2*k} H{X(LM-30)} C{X(LM-20)},{yc-DM/2*k} {X(LM-14)},{yc-DCAB/2*k-4} {X(LM)},{yc-DCAB/2*k-4} "
       f"V{yc+DCAB/2*k+4} C{X(LM-14)},{yc+DCAB/2*k+4} {X(LM-20)},{yc+DM/2*k} {X(LM-30)},{yc+DM/2*k} H{X(30)} C{X(20)},{yc+DM/2*k} {X(14)},{yc+DCAB/2*k+4} {X(0)},{yc+DCAB/2*k+4} Z", "#fff", K, 1.6)
h.rect(X(LM / 2 - 8), yc - DM / 2 * k - 16, 16 * k, 16, "#fff", K, 1.2); h.txt(X(LM / 2), yc - DM / 2 * k - 22, "EMBUDO DE LLENADO (*)", 10, 400, OR, "middle")
h.ln(X(-58), yc, X(LM + 58), yc, K, .5, h.EJE)
for i, xx in enumerate((LM / 2 - 22, LM / 2 - 8, LM / 2 + 8, LM / 2 + 22)):
    h.rect(X(xx) - 12, yc - 14 + i * 7, 24, 6, "#fff", K, .6, h.OCULTA)
h.dimH(yc + DM / 2 * k + 30, X(0), X(LM), "MOLDE 178 (NBA1)", ext=yc + DM / 2 * k)
h.dimV(X(LM) + 30, yc - DM / 2 * k, yc + DM / 2 * k, "Ø (*)", ext=X(LM / 2), c=OR)
h.dimV(X(-50) - 16, yc - DCAB / 2 * k, yc + DCAB / 2 * k, "Ø17", ext=X(-50))
xs = X(LM / 2 + 8); h.ln(xs, yc - DM / 2 * k - 6, xs, yc + DM / 2 * k + 6, K, .6, h.EJE)
h.txt(xs + 6, yc - DM / 2 * k - 4, "A", 12, 700)
h.globo("1", X(40), yc - DM / 2 * k, X(40), 110); h.globo("2", X(-30), yc - DCAB / 2 * k, X(-30), 110); h.globo("3", X(LM / 2 + 22), yc + 6, X(LM / 2 + 40), 330)

# ============ CORTE A-A
h.titulo(560, 62, "CORTE A-A", "ESC. 1:1 · POR LAS UNIONES")
cx, cy, kc = 715, 225, 2.4
h.circ(cx, cy, DM / 2 * kc, "#fff", K, 1.6); h.circ(cx, cy, DM / 2 * kc - 4, "url(#CONCP)", K, .6)
for (a, b) in pos_cond(4, RC * kc * 1.9, 45):
    h.circ(cx + a, cy - b, (RCU + 1.2) * kc, "url(#ANSI31)", K, 1)
    h.cobre2d(cx + a, cy - b, RCU * kc, False, 7)
h.flecha_llamada(cx + DM / 2 * kc * .7, cy - DM / 2 * kc * .7, 790, 130, "MOLDE")
h.flecha_llamada(cx - 20, cy + 40, 790, 330, "RESINA")
h.flecha_llamada(cx + 20, cy - 14, 790, 160, "UNION")

# ============ D1 unión a compresión
h.titulo(40, 420, "D1 - UNION A COMPRESION 10 mm² (2060)", "S/E · UNA POR CONDUCTOR, ESCALONADAS · MEDIDAS (*)")
ux, uy = 120, 510
h.rect(ux, uy - 14, 200, 28, C_EST, K, 1.3)
for xx in (ux + 40, ux + 150): h.path(f"M{xx},{uy-14} v28 M{xx+10},{uy-14} v28", "none", K, .8)
h.rect(ux - 100, uy - 9, 104, 18, "url(#cuH)", K, 1); h.rect(ux + 196, uy - 9, 104, 18, "url(#cuH)", K, 1)
h.txt(ux + 100, uy + 34, "TUBO DE Cu ESTAÑADO", 10.5, 700, K, "middle"); h.txt(ux + 45, uy - 22, "COMPRESION", 10, 400, K, "middle"); h.txt(ux + 155, uy - 22, "COMPRESION", 10, 400, K, "middle")
h.parrafo(520, 490, "ESCALONAR LAS UNIONES PARA QUE EL EMPALME NO ENGORDE. EL MOLDE SE ELIGE POR EL Ø DEL CABLE.", 300, 10.5)

# ============ tabla kits + códigos
cols = [(110, "c", False), (100, "c", True), (170, "c", False), (130, "c", True), (90, "c", True)]
fil = [["KIT REF.", "Ø CABLE", "SECCIONES (4 COND.)", "LARGO MOLDE", "RESINA"],
       ["NBA0", "6-16", "4x1,5 a 4x4", "148", "90 ml"], ["NBA1", "10-22", "4x1,5 a 4x10", "178", "135 ml"],
       ["NBA2", "12-25", "4x4 a 4x16", "230", "200 ml"], ["NBA3", "13-32", "4x10 a 4x25", "270", "370 ml"]]
h.tablaM(40, 590, cols, fil, 20, "KITS DE REFERENCIA (3M SCOTCHCAST 92-NBA)")
y = h.codigos(40, 730, COD, (52, 0, 40), extra_col=("USO", {2020: "ITEMS 78 / 79", 2019: "DERIVACION ≤ 4x6", 2060: "UNION 10 mm²"}, 150), wtot=800, rowh=20)
h.notasM(40, 840, [
    "COTAS EN mm. LA TABLA ES DE UNA MARCA DE REFERENCIA (3M SCOTCHCAST SERIE 92-NBA, HD 631.1 S2): SEGUIR EL KIT QUE SE COMPRO.",
    "(*) Ø DEL MOLDE, EMBUDO, COLOR DE LA RESINA Y MEDIDAS DE LA UNION 2060: A CONFIRMAR CON EL FABRICANTE.",
    "(*) 2019 (DERIVACION BT HASTA 4 x 6): SE DIBUJA EL EMPALME RECTO; LA DERIVACION LLEVA MOLDE EN «T» A CONFIRMAR.",
    "2019 Y 2020 FIGURAN EN «m» EN EL CATALOGO DEL PAÑOL: (*) REVISAR LA UNIDAD (ES UN KIT).",
], 790)

# ============ 3D
h.titulo(890, 62, "VISTA 3D - EMPALME CON RESINA", "MOLDE TRANSPARENTE · RESINA · UNIONES A COMPRESION ESCALONADAS")
h.iso(2.9, 1060, 280)
pos = pos_cond(4, RC * 1.05, 45)
h.cil("x", -60, 18, 0, 0, DCAB / 2, C_VAINA, borde="#000", bw=.5)
orden = sorted(range(4), key=lambda i: pos[i][0] + pos[i][1])
for i in orden:
    a, b = pos[i]; col = FASE[CONDS[i]]; xu = LM / 2 - 22 + i * 14.7
    cam = [(18 + t * (xu - 12 - 18) / 8, a * (1 + .9 * min(1, t / 4)), b * (1 + .9 * min(1, t / 4))) for t in range(9)]
    tubo_camino(h, "x", cam, RC, col)
    ae, be = cam[-1][1], cam[-1][2]
    h.cil("x", xu - 12, xu + 12, ae, be, RCU + 1.2, C_EST, metal=True, borde="#555", bw=.4)
    cam2 = [(xu + 12 + t * (LM - 18 - xu - 12) / 8, ae * (1 - .5 * max(0, (t - 4) / 4)) / 1 , be * (1 - .5 * max(0, (t - 4) / 4))) for t in range(9)]
    cam2 = [(u, a * (1 + .9 * (1 - max(0, (t - 3) / 5))), b * (1 + .9 * (1 - max(0, (t - 3) / 5)))) for t, (u, _, _) in enumerate(cam2)]
    tubo_camino(h, "x", cam2, RC, col)
h.cil("x", LM - 18, LM + 60, 0, 0, DCAB / 2, C_VAINA, tapa="#3a3d42", borde="#000", bw=.5)
# resina y molde (transparentes)
h.cil("x", 26, LM - 26, 0, 0, DM / 2 - 2, RES, borde=None, op=.38, n=48)
prof = [(0, DCAB / 2 + 2)] * 0
h.cil("x", 0, 26, 0, 0, DCAB / 2 + 2, "#dbeafe", r1=DM / 2, borde="#64748b", bw=.5, op=.28)
h.cil("x", 26, LM - 26, 0, 0, DM / 2, "#dbeafe", borde="#64748b", bw=.6, op=.25, n=48)
h.cil("x", LM - 26, LM, 0, 0, DM / 2, "#dbeafe", r1=DCAB / 2 + 2, borde="#64748b", bw=.5, op=.28, tapa=None)
h.cil("z", DM / 2 - 2, DM / 2 + 12, LM / 2, 0, 9, "#dbeafe", r1=12, tapa="#eef2f7", borde="#64748b", bw=.5, op=.6)
h.g3b("1", (60, 0, DM / 2), 1440, 150, "MOLDE TRANSPARENTE")
h.g3b("2", (LM / 2 + 18, 0, DM / 2 - 6), 1440, 220, "RESINA (*)")
h.g3b("3", (LM / 2 - 22 + 3 * 14.7, pos[3][0] * 1.9, pos[3][1] * 1.9 + RCU + 1.2), 1440, 290, "UNION A COMPRESION")
h.g3b("4", (-40, 0, DCAB / 2), 960, 470, "CABLE 4 x 10")
h.g3b("5", (LM / 2, 0, DM / 2 + 12), 1220, 120, "EMBUDO (*)")
h.txt(890, 620, "Colores de la resina y del molde ilustrativos (*).", 11, 400, OR, "start", INT)
h.bloque(890, 670, "DATOS TECNICOS", [
    "MOLDE TRANSPARENTE QUE SE CIERRA SOBRE EL EMPALME Y SE LLENA CON RESINA",
    "QUEDA ESTANCO Y SE PUEDE ENTERRAR",
    "SE ELIGE POR EL Ø DEL CABLE (TABLA DE KITS)",
    "REFERENCIA: 3M SCOTCHCAST 92-NBA · HD 631.1 S2",
], 360)
h.bloque(1270, 670, "DONDE SE USA", [
    "EMPALMES DEL TRONCAL ENTERRADO · ITEMS 78 / 79 (EMPALMES)",
    "DERIVACIONES BT HASTA 4 x 6 (2019)",
    "LA ZANJA SIGUE EL AP-TC-001",
], 370)
h.rotuloM("MAT-EMPALMES-2", "EMPALME SUBTERRANEO", "CON RESINA Y UNION A COMPRESION", "LATERAL, CORTE A-A, DETALLE Y VISTA 3D", "1:2 / 1:1", "D1, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_empalmes_2.svg"))
print("ok")
