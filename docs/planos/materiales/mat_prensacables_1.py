import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *
from mk_cab import _circ

h = HojaMat()
COD = [5020, 5024, 5027, 5032, 5022, 5023, 5029, 5034, 5028, 5018, 5026, 5031, 5025, 5033, 5019, 5021, 5012, 5013]
h.check_codigos(COD)
# modelo 3/4" con cable 4x2,5 (Ø12). Medidas de la pieza ilustrativas (*): la ficha da la rosca y el rango de Ø de cable
S, ROS, LR, LH, LT, DT, DCAB = 27, 24, 10, 8, 14, 25, 12
GOM = "#1f2328"

# ============ CORTE A-A (longitudinal)
h.titulo(40, 62, "CORTE A-A · PRENSACABLE CON TUERCA Y ARANDELA", "MODELO 3/4\" CON CABLE 4 x 2,5 (Ø12) · S/E · MEDIDAS DE LA PIEZA (*)")
k = 6.0; x0, yc = 230, 240
X = lambda mm: x0 + mm * k
RI = DCAB / 2 + 2.5
def anillo(xa, xb, r0, r1, pat, sw=1.1):
    for sg in (-1, 1):
        y0, y1 = yc + sg * r0 * k, yc + sg * r1 * k
        h.rect(X(xa), min(y0, y1), (xb - xa) * k, abs(y1 - y0), f"url(#{pat})", K, sw)
# cable
h.rect(X(-30), yc - DCAB / 2 * k, 80 * k, DCAB * k, "#fff", K, 1)
h.path(f"M{X(-30)},{yc-DCAB/2*k} q-6,{DCAB/4*k} 0,{DCAB/2*k} t0,{DCAB/2*k}", "none", K, .9)
h.ln(X(-34), yc, X(52), yc, K, .5, h.EJE)
# chapa
h.rect(X(-2), yc - 125, 2 * k, 125 - ROS / 2 * k, "url(#ANSI31)", K, 1.2); h.rect(X(-2), yc + ROS / 2 * k, 2 * k, 125 - ROS / 2 * k, "url(#ANSI31)", K, 1.2)
h.txt(X(-2) - 8, yc - 105, "CHAPA / CAJA", 10.5, 400, G, "end")
anillo(-8, -2, ROS / 2, S / 2, "ANSI31")                 # 1 tuerca
anillo(0, 1.2, ROS / 2, S / 2 + 2, "ANSI37")             # 2 arandela
anillo(-10, 1.2, RI, ROS / 2, "ANSI31")                  # 3 rosca del cuerpo
anillo(1.2, 9.2, RI, S / 2, "ANSI31", 1.4)               # 3 hexágono
for sg in (-1, 1):                                        # 4 goma (cónica)
    h.path(f"M{X(4)},{yc+sg*RI*k} H{X(15)} L{X(19)},{yc+sg*DCAB/2*k} H{X(4)} Z", "url(#CONCP)", K, 1)
    # 5 tapa cúpula
    h.path(f"M{X(9.2)},{yc+sg*DT/2*k} H{X(16)} L{X(23)},{yc+sg*(DCAB/2+.4)*k} H{X(19.6)} L{X(15.4)},{yc+sg*(RI+.4)*k} H{X(9.2)} Z", "url(#ANSI31)", K, 1.3)
h.dimV(X(-30) - 16, yc - DCAB / 2 * k, yc + DCAB / 2 * k, "Ø CABLE 12", ext=X(-30))
h.dimV(X(30), yc - DT / 2 * k, yc + DT / 2 * k, "Ø (*)", ext=X(14), c=OR)
h.dimH(yc + S / 2 * k + 30, X(-10), X(1.2), "ROSCA RE 3/4\"", ext=yc + ROS / 2 * k, dy=14)
h.dimH(yc + S / 2 * k + 64, X(-10), X(23), "LARGO (*)", ext=yc + DT / 2 * k, c=OR)
for n, (ax, ay, gx, gy) in enumerate([(X(-5), yc - S / 2 * k + 6, X(-24), 110), (X(.6), yc - S / 2 * k - 6, X(-6), 110), (X(5), yc - S / 2 * k + 6, X(10), 110),
                                       (X(12), yc - (DCAB / 2 + 1) * k, X(40), 150), (X(13), yc - DT / 2 * k + 4, X(28), 110)]):
    h.globo(str(n + 1), ax, ay, gx, gy)
h.parrafo(560, 330, "1 TUERCA DE FIJACION · 2 ARANDELA · 3 CUERPO CON ROSCA ELECTRICA · 4 GOMA DE SELLADO · 5 TAPA (CUPULA) QUE APRIETA LA GOMA", 270, 10, K, w=700)

# ============ tabla de la ficha
cols = [(60, "c", False), (110, "c", True), (230, "c", True), (160, "c", False)]
fil = [["ROSCA", "Ø DEL CABLE", "CODIGOS DEL PAÑOL", "USO TIPICO"],
       ["1/2\"", "5-8", "5020", "PAT 1x10"], ["5/8\"", "7-11", "5024 · 5027 · 5032", "3x1,5"], ["3/4\"", "10-14", "5022 · 5023 · 5029 · 5034", "4x2,5 · 3x1,5 · LUM."],
       ["7/8\"", "12-17", "5028", "4x6"], ["1\"", "15-20", "5018 · 5026 · 5031", "4x10 · 4x16"], ["1 1/4\"", "20-25", "5025 · 5033", "Cu 4x16"],
       ["1 1/2\"", "23-30", "5019", "3x25+1x16"], ["2\"", "30-40", "5021", "—"]]
h.tablaM(40, 430, cols, fil, 19, "SE ELIGE POR EL Ø EXTERIOR DEL CABLE (PAMPACO, SERIE COMPACTO)")
y = h.codigos(40, 640, COD, (46, 0, 34), wtot=800, rowh=16.5, titulo="CODIGOS DEL PAÑOL")

h.notasM(40, 980, [
    "Ø DE CABLE POR ROSCA Y CODIGOS: FICHA DE LA APP (PAMPACO, PRENSACABLES DE ALUMINIO SERIE COMPACTO, ROSCA BSC). COMPARAR CON EL Ø EXTERIOR DEL CABLE.",
    "(*) MEDIDAS DE LA PIEZA (HEXAGONO, LARGO, Ø DE LA TAPA): A CONFIRMAR CON EL FABRICANTE.",
    "(*) 1/2\": LA FICHA AP-PL-002 DICE «6 A 12 mm» Y LA APP «5 A 8»: A CONFIRMAR (REVISION DE TIPOS CONSTRUCTIVOS, PUNTO 7).",
    "5031 / 5032 / 5033 / 5034 SON TUERCAS SUELTAS; 5022 / 5024 VIENEN SIN TUERCA. 5012 / 5013: CONECTORES CAJA-CAÑO Ø40 (OTRA PIEZA).",
], 790, 10.5)

# ============ 3D: despiece + montado
h.titulo(890, 62, "VISTA 3D - DESPIECE Y MONTADO EN LA CAJA", "ALUMINIO · GOMA NEGRA · CABLE 4 x 2,5 ENTRANDO A LA CAJA")
h.iso(3.0, 1010, 175)
def pieza_tuerca(x0_): h.hexa("x", x0_, x0_ + 5, 0, 0, S, C_AL, tapa=sombra(C_AL, 1.15), metal=True, borde="#555", bw=.5, agujero=(ROS / 2, "#5b6168"))
def pieza_arandela(x0_): h.cil("x", x0_, x0_ + 1.2, 0, 0, S / 2 + 2, "#c3c8ce", tapa="#d7dbe0", metal=True, borde="#555", bw=.4, agujero=(ROS / 2, "#5b6168"))
def pieza_cuerpo(x0_):
    h.cil("x", x0_, x0_ + LR, 0, 0, ROS / 2, C_AL, metal=True, borde="#555", bw=.4)
    h.helice("x", x0_, x0_ + LR, 0, 0, ROS / 2, 1, 1.6, "#6b7177", .5)
    h.hexa("x", x0_ + LR, x0_ + LR + LH, 0, 0, S, C_AL, tapa=sombra(C_AL, 1.15), metal=True, borde="#555", bw=.5, agujero=(DCAB / 2 + 2, "#5b6168"))
def pieza_goma(x0_): h.cil("x", x0_, x0_ + 10, 0, 0, DCAB / 2 + 2, GOM, r1=DCAB / 2 + 1, tapa="#3a3f45", borde="#000", bw=.4, agujero=(DCAB / 2, "#000"))
def pieza_tapa(x0_):
    h.cil("x", x0_, x0_ + LT * .55, 0, 0, DT / 2, C_AL, metal=True, borde="#555", bw=.4, n=24)
    h.cil("x", x0_ + LT * .55, x0_ + LT, 0, 0, DT / 2, C_AL, r1=DCAB / 2 + 1, tapa=sombra(C_AL, 1.15), metal=True, borde="#555", bw=.4, agujero=(DCAB / 2 + .2, "#111"))
xs_ = [0, 18, 34, 72, 98]
for f, xx in zip([pieza_tuerca, pieza_arandela, pieza_cuerpo, pieza_goma, pieza_tapa], xs_): f(xx)
for n, (xx, dz) in enumerate(zip([2, 18.6, 38, 77, 104], [S / 2, S / 2 + 2, S / 2, DCAB / 2 + 2, DT / 2])):
    x, y = h.P(xx, 0, dz); h.globo(str(n + 1), x, y, x - 10, y - 46, NV, 11)
h.txt(890, 145, "DESPIECE", 11, 700, NV, "start", INT)
# montado
h.txt(890, 430, "MONTADO", 11, 700, NV, "start", INT)
h.iso(3.0, 1190, 515)
h.cil("x", -40, 0, 0, 0, DCAB / 2, C_VAINA, borde="#000", bw=.4)
h.BOX(-2, 0, -32, 32, -32, 32, "#c9cdd2", "#b4b9bf", "#d5d9de", "#555", .8)       # pared de la caja
h.F3([(0, ROS / 2 * math.cos(2 * math.pi * q / 30), ROS / 2 * math.sin(2 * math.pi * q / 30)) for q in range(30)], "#6b7177", "#444", .4)
pieza_arandela(0); h.hexa("x", 1.2, 1.2 + LH, 0, 0, S, C_AL, tapa=sombra(C_AL, 1.15), metal=True, borde="#555", bw=.5)
pieza_tapa(1.2 + LH)
h.cil("x", 1.2 + LH + LT, 1.2 + LH + LT + 45, 0, 0, DCAB / 2, C_VAINA, tapa="#3a3d42", borde="#000", bw=.5)
x, y = h.P(-2, 32, -32); h.txt(x - 10, y + 18, "PARED DE LA CAJA (TUERCA DEL LADO DE ADENTRO)", 10, 400, G, "start", INT)
h.g3b("5", (1.2 + LH + LT * .3, 0, DT / 2), 1460, 450, "TAPA (CUPULA)")
h.g3b("3", (1.2 + LH * .5, 0, S / 2), 1460, 510, "CUERPO HEXAGONAL")
h.g3b("6", (1.2 + LH + LT + 30, 0, DCAB / 2), 1460, 570, "CABLE 4 x 2,5")
h.txt(890, 690, "Medidas de la pieza ilustrativas (*); manda la tabla de Ø de cable.", 11, 400, OR, "start", INT)
h.bloque(890, 720, "DATOS TECNICOS", [
    "CUERPO DE ALUMINIO, ROSCA ELECTRICA (RE / BSC)",
    "GOMA DE SELLADO QUE APRIETA LA TAPA",
    "TAMBIEN PLASTICO 3/4\" (5029)",
    "SE ELIGE POR EL Ø EXTERIOR DEL CABLE, NO POR LA SECCION",
], 360)
h.bloque(1270, 720, "DONDE SE USA", [
    "ENTRADA DE CABLES A CAJAS Y TABLEROS",
    "LUMINARIA: 1 PRENSACABLE 3/4\" POR ARTEFACTO",
    "1x10 → 1/2\" · 3x1,5 Y 4x2,5 → 3/4\" · 4x6 → 7/8\" · 4x10 → 1\" · Cu 4x16 → 1 1/4\" (CLAUDE.md §11.3)",
], 370)
h.rotuloM("MAT-PRENSACABLES-1", "PRENSACABLE DE ALUMINIO", "ROSCA ELECTRICA (RE) · 1/2\" A 2\"", "CORTE A-A, TABLA DE ELECCION Y VISTA 3D", "S/E", "ESQUEMATICO")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_prensacables_1.svg"))
print("ok")
