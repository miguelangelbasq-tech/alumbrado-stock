import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *
from mk_cab import _circ

h = HojaMat()
COD = [2001]
h.check_codigos(COD)
L, H, A = 35.5, 8.9, 8.1     # ficha: 35,5 x 8,9 x 8,1
PEL = 11                     # pelar 11 mm (ver envase)
NAR = "#f28c28"; CUE = "#dfe3e8"

# ============ VISTA LATERAL
h.titulo(40, 62, "VISTA LATERAL", "ESC. 5:1 · COTAS EN mm · PALANCAS BAJAS (CERRADO)")
k = 9.0; x0, yb = 120, 260
X = lambda mm: x0 + mm * k
h.rect(X(0), yb - H * k, L * k, H * k, "#fff", K, 1.5)
for i in (0, 1):   # palancas (contorno superior)
    xa = X(1.5 + i * L / 2); h.path(f"M{xa},{yb-H*k} v-{1.2*k} h{(L/2-3)*k} l{1.2*k},{1.2*k}", "#fff", K, 1.2)
h.ln(X(L / 2), yb - H * k, X(L / 2), yb, K, .6, h.OCULTA)
# cables entrando (pelados 11)
for sgn, xe in ((-1, X(0)), (1, X(L))):
    yc = yb - H * k * .45
    h.rect(xe - (0 if sgn > 0 else 0) + (0 if sgn > 0 else -40) if sgn < 0 else xe, yc - 7, 40, 14, "#fff", K, 1) if False else None
    h.ln(xe + sgn * 2, yc, xe + sgn * 70, yc, K, .5, h.EJE)
    h.ln(xe, yc - 6, xe - sgn * PEL * k, yc - 6, K, .6, h.OCULTA); h.ln(xe, yc + 6, xe - sgn * PEL * k, yc + 6, K, .6, h.OCULTA)
h.dimH(yb + 24, X(0), X(L), "35,5", ext=yb)
h.dimV(X(L) + 30, yb - H * k, yb, "8,9", ext=X(L))
h.dimH(yb - H * k - 34, X(0), X(PEL), "PELAR 11 (VER ENVASE)", ext=yb - H * k)
h.globo("1", X(22), yb - H * k - 1.2 * k, X(22), 112); h.globo("2", X(30), yb - 20, X(30), 320)

# ============ PLANTA
h.titulo(40, 352, "PLANTA", "ESC. 5:1")
yp = 420
h.rect(X(0), yp, L * k, A * k, "#fff", K, 1.5)
for i in (0, 1):
    h.rect(X(1.5 + i * L / 2), yp + 1.2 * k, (L / 2 - 3) * k, (A - 2.4) * k, "#fff", K, 1)
h.ln(X(-6), yp + A * k / 2, X(L + 6), yp + A * k / 2, K, .5, h.EJE)
h.dimV(X(L) + 30, yp, yp + A * k, "8,1", ext=X(L))
h.dimH(yp + A * k + 24, X(0), X(L), "35,5", ext=yp + A * k)

# ============ D1 cómo se usa
h.titulo(500, 62, "D1 - COMO SE USA", "S/E · SIN HERRAMIENTA")
for i, t in enumerate(["1. LEVANTAR LA PALANCA", "2. METER EL CABLE PELADO 11 mm HASTA EL TOPE", "3. BAJAR LA PALANCA"]):
    y = 130 + i * 70; x = 520
    h.rect(x, y - 12, 90, 22, "#fff", K, 1.2)
    if i == 0: h.path(f"M{x+6},{y-12} l70,-28 l4,6 l-66,26", "#fff", K, 1)
    else: h.rect(x + 6, y - 18, 78, 6, "#fff", K, 1)
    if i >= 1: h.ln(x + 90, y, x + 140, y, K, 3); h.ln(x + 60, y, x + 90, y, K, 1.2)
    h.parrafo(x + 150, y + 4, t, 175, 10.5)

# ============ tabla
h.codigos(40, 560, COD, (52, 0, 40), extra_col=("DATO (FICHA)", {2001: "35,5 x 8,9 x 8,1 · 32 A · 450 V"}, 230), wtot=800, rowh=22)
h.notasM(40, 650, [
    "COTAS EN mm: FICHA DE LA APP (FARNELL, FICHA WAGO 221-2411).",
    "(*) ALTO DE LA PALANCA, LARGO DE CADA PALANCA Y POSICION DE LA VENTANA DE PRUEBA: ILUSTRATIVOS. A CONFIRMAR CON EL FABRICANTE.",
    "UNE DOS CABLES DE 0,2 A 4 mm² (RIGIDO O FLEXIBLE). NO ES ESTANCO: SOLO DENTRO DE CAJAS O LUMINARIAS.",
    "PARA ENTERRAR O A LA INTEMPERIE: EMPALME CON RESINA (MAT-EMPALMES-2) O CONECTOR ESTANCO QR 23 (MAT-EMPALMES-3).",
], 790)

# ============ 3D
h.titulo(890, 62, "VISTA 3D - CONECTOR CON LOS DOS CABLES", "CUERPO TRANSPARENTE · PALANCAS NARANJAS")
h.iso(9.5, 1090, 300)
zc = H * .45
h.cil("x", -16, 0, A / 2, zc, 1.9, FASE["L1"], borde="#000", bw=.4)          # cable de atrás
h.BOX(1, L - 1, 1.6, A - 1.6, H * .2, H * .25, "#c0c4c9", "#a7acb2", "#9aa0a6", "#6b7280", .4)   # barra interna
h.cil("x", 0, PEL, A / 2, zc, .95, C_CU, metal=True, borde="#7a3f12", bw=.3)
h.cil("x", L - PEL, L, A / 2, zc, .95, C_CU, metal=True, borde="#7a3f12", bw=.3)
h.BOX(0, L, 0, A, 0, H, sombra(CUE, 1.04), sombra(CUE, .92), sombra(CUE, .82), "#6b7280", .8, .55)
for i in (0, 1):
    x0_ = 1.5 + i * L / 2
    h.BOX(x0_, x0_ + L / 2 - 3, 1.2, A - 1.2, H, H + 1.2, sombra(NAR, 1.05), sombra(NAR, .9), sombra(NAR, .78), "#9a4a0a", .8)
h.cil("x", L, L + 16, A / 2, zc, 1.9, FASE["N"], tapa=sombra(FASE["N"], 1.3), borde="#000", bw=.4)
h.g3b("1", (8, A / 2, H + 1.2), 1440, 170, "PALANCA NARANJA")
h.g3b("2", (L * .7, A, H * .6), 1440, 240, "CUERPO TRANSPARENTE")
h.g3b("3", (L - PEL / 2, A / 2, zc), 1440, 310, "CABLE PELADO 11 mm")
h.txt(890, 620, "Se ven los cables adentro por el cuerpo transparente; el largo de la palanca es ilustrativo (*).", 11, 400, OR, "start", INT)
h.bloque(890, 670, "DATOS TECNICOS", [
    "WAGO 221-2411 · EMPALME EN LINEA, 1 POLO",
    "CABLE RIGIDO O FLEXIBLE: 0,2 A 4 mm²",
    "32 A · 450 V",
    "MEDIDAS: 35,5 x 8,9 x 8,1 mm",
    "PELAR 11 mm (VER ENVASE) · UNIDAD: Un.",
], 360)
h.bloque(1270, 670, "DONDE SE USA", [
    "UNIONES SECAS DENTRO DE CAJAS, TABLEROS O LA LUMINARIA",
    "UNIR DOS CABLES DE HASTA 4 mm² SIN HERRAMIENTA",
    "NO VA ENTERRADO NI A LA INTEMPERIE",
], 370)
h.rotuloM("MAT-EMPALMES-1", "CONECTOR DE EMPALME EN LINEA", "CON PALANCA (WAGO 221-2411)", "LATERAL, PLANTA, DETALLE Y VISTA 3D", "5:1", "D1, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_empalmes_1.svg"))
print("ok")
