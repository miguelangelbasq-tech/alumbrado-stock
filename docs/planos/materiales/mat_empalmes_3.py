import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *
from mk_cab import _circ

h = HojaMat()
COD = [2501]
h.check_codigos(COD)
CU = "#4b5563"   # (*) color del cuerpo
# todas las medidas son ilustrativas (*): la ficha no trae medidas
LB, DB, LT_, DT_, DCAB = 60, 22, 14, 26, 10

# ============ VISTA LATERAL (esquema)
h.titulo(40, 62, "VISTA LATERAL (ESQUEMA)", "S/E · LA FICHA NO TRAE MEDIDAS: TODO (*) A CONFIRMAR CON EL FABRICANTE")
k = 3.5; x0, yc = 190, 230
X = lambda mm: x0 + mm * k
h.rect(X(-30), yc - DCAB / 2 * k, 30 * k, DCAB * k, "#fff", K, 1.2); h.rect(X(LB + 2 * LT_), yc - DCAB / 2 * k, 30 * k, DCAB * k, "#fff", K, 1.2)
for xa in (0, LB + LT_):
    h.rect(X(xa), yc - DT_ / 2 * k, LT_ * k, DT_ * k, "#fff", K, 1.4)
    for q in range(1, 6): h.ln(X(xa) + q * LT_ * k / 6, yc - DT_ / 2 * k, X(xa) + q * LT_ * k / 6, yc + DT_ / 2 * k, K, .4)
h.rect(X(LT_), yc - DB / 2 * k, LB * k, DB * k, "#fff", K, 1.6)
h.ln(X(-36), yc, X(LB + 2 * LT_ + 36), yc, K, .5, h.EJE)
for i in range(3): h.rect(X(LT_ + LB / 2 - 9), yc - 30 + i * 22, 18 * k, 12, "#fff", K, .6, h.OCULTA)
h.dimH(yc + DT_ / 2 * k + 30, X(0), X(LB + 2 * LT_), "LARGO (*)", ext=yc + DT_ / 2 * k, c=OR)
h.dimV(X(LB + 2 * LT_) + 26, yc - DT_ / 2 * k, yc + DT_ / 2 * k, "Ø (*)", ext=X(LB + 2 * LT_), c=OR)
h.globo("1", X(LT_ + 20), yc - DB / 2 * k, X(LT_ + 20), 112); h.globo("2", X(6), yc - DT_ / 2 * k, X(6), 112)
h.globo("3", X(LT_ + LB / 2), yc + 2, X(LT_ + LB / 2) + 60, 360); h.globo("4", X(-20), yc - DCAB / 2 * k, X(-20), 150)

# ============ D1: unifilar
h.titulo(40, 440, "D1 - QUE UNE", "S/E · 3 CONDUCTORES DE HASTA 4 mm²")
for i, c in enumerate(["L1", "N", "PE"]):
    y = 500 + i * 34
    h.ln(150, y, 260, y, FASE[c], 5); h.ln(320, y, 430, y, FASE[c], 5)
    if c == "PE": h.ln(150, y, 260, y, "#f2c200", 5, 'stroke-dasharray="8 8"'); h.ln(320, y, 430, y, "#f2c200", 5, 'stroke-dasharray="8 8"')
    h.rect(260, y - 7, 60, 14, "#fff", K, 1); h.circ(275, y, 3, K, K, 0); h.circ(305, y, 3, K, K, 0)
h.txt(470, 538, "BORNES DENTRO DEL CUERPO (*)", 10, 400, OR)
h.txt(40, 504, "DE LA COLUMNA", 10.5, 700); h.txt(470, 504, "A LA LUMINARIA", 10.5, 700)

# ============ tabla + datos
h.codigos(40, 640, COD, (52, 0, 40), extra_col=("ITEM", {2501: "15.14"}, 90), wtot=800, rowh=22)
h.notasM(40, 730, [
    "PAMPACO QR 23 «O SIMILAR», 3 x 4 mm², IP68: ITEM 15.14 DEL PLIEGO LP 21478, «SEGUN DISPONIBILIDAD».",
    "(*) LA FICHA NO TRAE MEDIDAS NI COLOR: EL DIBUJO ES UN ESQUEMA. A CONFIRMAR CON LA HOJA DEL FABRICANTE.",
    "SE USA CUANDO EL EMPALME NO SE PUEDE HACER DENTRO DEL ARTEFACTO.",
    "EL CABLE DE LA COLUMNA A LA LUMINARIA ES EL 3 x 1,5 (6001): VER MAT-CABLE_SUBTERRANEO-1.",
    "FUENTE: LP 21478 ANEXO I (15.14).",
], 790)

# ============ 3D
h.titulo(890, 62, "VISTA 3D - CONECTOR ESTANCO (ESQUEMA)", "CUERPO CON DOS TUERCAS DE SELLADO · CABLE ENTRANDO POR CADA LADO")
h.iso(3.4, 1060, 330)
h.cil("x", -40, 0, 0, 0, DCAB / 2, C_VAINA, borde="#000", bw=.5)
h.cil("x", 0, LT_, 0, 0, DT_ / 2, sombra(CU, 1.1), tapa=sombra(CU, 1.35), borde="#000", bw=.5, n=24)
h.cil("x", LT_, LT_ + LB, 0, 0, DB / 2, CU, borde="#000", bw=.6, n=48)
h.cil("x", LT_ + LB, LB + 2 * LT_, 0, 0, DT_ / 2, sombra(CU, 1.1), tapa=sombra(CU, 1.35), borde="#000", bw=.5, n=24, agujero=(DCAB / 2 + .5, "#111"))
h.cil("x", LB + 2 * LT_, LB + 2 * LT_ + 40, 0, 0, DCAB / 2, C_VAINA, tapa="#3a3d42", borde="#000", bw=.5)
x, y = h.P(LT_ + 8, 0, DB / 2); h.a(f'<text transform="matrix(.866 .5 0 1 {x:.1f} {y+3:.1f})" font-size="13" font-weight="800" fill="#d1d5db" {INT}>IP68</text>')
h.g3b("1", (LT_ + 30, 0, DB / 2), 1440, 170, "CUERPO ESTANCO IP68")
h.g3b("2", (LB + LT_ + 6, 0, DT_ / 2), 1440, 240, "TUERCA DE SELLADO (*)")
h.g3b("4", (-30, 0, -DCAB / 2), 990, 470, "CABLE 3 x 1,5")
h.txt(890, 620, "Esquema: forma, medidas y color del cuerpo a confirmar con el fabricante (*).", 11, 400, OR, "start", INT)
h.bloque(890, 670, "DATOS TECNICOS", [
    "CONECTOR ESTANCO IP68 (SUMERGIBLE)",
    "3 CONDUCTORES DE HASTA 4 mm²",
    "MARCA DE REFERENCIA: PAMPACO QR 23 (O SIMILAR)",
    "UNIDAD: Un.",
], 360)
h.bloque(1270, 670, "DONDE SE USA", [
    "BAJADA DE LA LUMINARIA, CUANDO EL EMPALME NO SE PUEDE HACER DENTRO DEL ARTEFACTO",
    "ITEM 15.14 DEL PLIEGO (SEGUN DISPONIBILIDAD) · RED DE BARRIO",
], 370)
h.rotuloM("MAT-EMPALMES-3", "CONECTOR ESTANCO IP68", "PAMPACO QR 23 · 3 x 4 mm²", "ESQUEMA LATERAL, DETALLE Y VISTA 3D", "S/E", "ESQUEMA")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_empalmes_3.svg"))
print("ok")
