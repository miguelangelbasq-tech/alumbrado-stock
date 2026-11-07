import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *
from mk_cab import _circ

h = HojaMat()
COD = [2028, 2030, 2031, 2032, 2029, 2037, 2033, 2034, 2035, 2036, 2058, 2022]
h.check_codigos(COD)
TAB = [("1,5", "NEGRO", 12.5, 6, 1.8, "#1b1b1b"), ("2,5", "GRIS", 15, 8, 2.3, "#8f959c"), ("4", "NARANJA", 17.5, 10, 2.9, "#f08a24"),
       ("6", "VERDE", 20, 12, 3.6, "#2f9e44"), ("10", "MARRON", 21, 12, 4.6, "#7a4a2a")]
# modelo 2,5 mm²
L, LC, DI = 15, 8, 2.3
DC = DI * 2.4          # (*) Ø del collar
TT = .25               # (*) espesor del tubo

# ============ VISTA LATERAL
h.titulo(40, 62, "VISTA LATERAL", "MODELO 2,5 mm² (2030) · ESC. 10:1 · COTAS EN mm")
k = 14.0; x0, yc = 110, 215
X = lambda mm: x0 + mm * k
LCo = L - LC
h.path(f"M{X(0)},{yc-DC/2*k} H{X(LCo*.55)} L{X(LCo)},{yc-(DI/2+TT+.4)*k} V{yc+(DI/2+TT+.4)*k} L{X(LCo*.55)},{yc+DC/2*k} H{X(0)} Z", "#fff", K, 1.4)
h.rect(X(LCo), yc - (DI / 2 + TT) * k, LC * k, (DI + 2 * TT) * k, "#fff", K, 1.3)
h.ln(X(0) - 12, yc, X(L) + 14, yc, K, .5, h.EJE)
h.ln(X(0), yc - DI / 2 * k, X(L), yc - DI / 2 * k, K, .6, h.OCULTA); h.ln(X(0), yc + DI / 2 * k, X(L), yc + DI / 2 * k, K, .6, h.OCULTA)
h.dimH(yc + DC / 2 * k + 30, X(0), X(L), "LARGO TOTAL 15", ext=yc + DC / 2 * k)
h.dimH(yc - DC / 2 * k - 16, X(LCo), X(L), "CAÑA 8", ext=yc - (DI / 2 + TT) * k)
h.dimV(X(L) + 30, yc - DI / 2 * k, yc + DI / 2 * k, "Ø INT. 2,3", ext=X(L))
h.dimV(X(0) - 20, yc - DC / 2 * k, yc + DC / 2 * k, "Ø COLLAR (*)", ext=X(0), c=OR)
xs = X(LCo + LC / 2); h.txt(xs, yc + DC / 2 * k + 14, "A", 12, 700, K, "middle"); h.ln(xs, yc - (DI / 2 + TT) * k - 8, xs, yc + DC / 2 * k + 2, K, .5, h.EJE)
h.globo("1", X(2), yc - DC / 2 * k, X(2), 100); h.globo("2", X(L - 2), yc - (DI / 2 + TT) * k, 420, 100)

# ============ CORTE A-A + D1 doble
h.titulo(500, 62, "CORTE A-A", "ESC. 20:1")
cx, cy, kc = 590, 210, 20
h.circ(cx, cy, (DI / 2 + TT) * kc, "url(#ANSI31)", K, 1.2); h.circ(cx, cy, DI / 2 * kc, "#fff", K, .9)
h.cobre2d(cx, cy, DI / 2 * kc * .95, False, 19)
h.dimH(cy + 46, cx - DI / 2 * kc, cx + DI / 2 * kc, "2,3", ext=cy)
h.titulo(670, 62, "D1 - DOBLE", "S/E · DOS CABLES EN UNA CAÑA")
dx, dy = 740, 210
h.a(f'<rect x="{dx-34}" y="{dy-20}" width="68" height="40" rx="20" fill="url(#ANSI31)" stroke="{K}" stroke-width="1.2"/>')
h.a(f'<rect x="{dx-30}" y="{dy-16}" width="60" height="32" rx="16" fill="#fff" stroke="{K}" stroke-width=".8"/>')
h.cobre2d(dx - 14, dy, 14, False, 19); h.cobre2d(dx + 14, dy, 14, False, 19)
h.parrafo(680, 260, "REEMPLAZA DOS SIMPLES CUANDO EL CIRCUITO SIGUE A LA OTRA COLUMNA.", 160, 10)

# ============ D2 colores (lateral de cada medida, a escala 4:1)
h.titulo(40, 372, "D2 - LAS CINCO MEDIDAS (DIN 46228-4)", "S/E · COLLAR DEL COLOR DE LA SECCION")
ks = 3.5
for i, (s, ct, Lt, Lc, di, col) in enumerate(TAB):
    y = 432 + i * 40; x = 160; dc = di * 2.4
    h.txt(40, y + 4, s + " mm²", 11, 700)
    h.path(f"M{x},{y-dc/2*ks} H{x+(Lt-Lc)*.55*ks} L{x+(Lt-Lc)*ks},{y-(di/2+.6)*ks} V{y+(di/2+.6)*ks} L{x+(Lt-Lc)*.55*ks},{y+dc/2*ks} H{x} Z", col, K, 1)
    h.rect(x + (Lt - Lc) * ks, y - (di / 2 + .25) * ks, Lc * ks, (di + .5) * ks, C_EST, K, 1)
    h.txt(x + Lt * ks + 12, y + 4, f"{ct} · L {Lt:g} · CAÑA {Lc} · Ø {di:g}".replace(".", ","), 10.5)
h.txt(40, 632, "LOS COLORES SON DE DIN 46228-4; ALGUNAS MARCAS USAN OTRA TABLA: GUIARSE POR LA SECCION GRABADA.", 10, 400, G)

# ============ tabla de códigos
SEC = {2028: "1,5 SIMPLE", 2030: "2,5 SIMPLE", 2031: "4 SIMPLE", 2032: "6 SIMPLE", 2029: "10 SIMPLE", 2037: "1,5 SIMPLE NEGRA",
       2033: "2 x 1,5 DOBLE", 2034: "2 x 2,5 DOBLE", 2035: "2 x 4 DOBLE", 2036: "2 x 6 DOBLE", 2058: "2 x 1,5 DOBLE NEGRA", 2022: "PINZA 6-16 mm²"}
y = h.codigos(40, 668, COD, (50, 0, 40), extra_col=("TIPO / mm²", SEC, 150), wtot=800, rowh=19)
h.notasM(40, 945, [
    "COTAS EN mm. LARGO TOTAL, CAÑA Y Ø INT.: TABLA DE LA FICHA (DIN 46228-4, TABLA DE UN FABRICANTE).",
    "(*) Ø DEL COLLAR, ESPESOR DEL TUBO Y MEDIDAS DE LAS DOBLES: NO ESTAN EN LA FICHA. A CONFIRMAR CON EL FABRICANTE.",
    "SE CRIMPEAN CON LA PINZA CON CRIQUET (2022, PARA 6 A 16 mm²). (*) PARA 1,5 A 4 mm²: PINZA A CONFIRMAR.",
    "LA PUNTERA SIGUE EL CALIBRE DEL CABLE, NO EL DE LA BORNERA (CLAUDE.md §11.3).",
], 790)

# ============ 3D: las cinco punteras con su cable
h.titulo(890, 62, "VISTA 3D - PUNTERAS CON SU CABLE", "1,5 · 2,5 · 4 · 6 · 10 mm² · COLLAR DE COLOR Y CAÑA DE Cu ESTAÑADO")
h.iso(7.5, 1104, 330)
for i, (s, ct, Lt, Lc, di, col) in reversed(list(enumerate(TAB))):
    yy = -i * 9.5; dc = di * 2.4; lco = Lt - Lc
    h.cil("x", -16, 0, yy, 0, di / 2 + .55, "#2b2d33", borde="#000", bw=.4)       # cable aislado
    h.solido("x", 0, lco, _circ(dc / 2, 30), _circ(di / 2 + .55, 30), yy, 0, col, borde="#000", bw=.5)
    h.cil("x", lco, Lt, yy, 0, di / 2 + .25, C_EST, metal=True, borde="#555", bw=.4)
    h.cuerda_tapa("x", Lt, yy, 0, di / 2, 19)
    p = h.P(Lt + 2, yy, 0); h.txt(p[0] + 6, p[1] + 14, s + " mm²", 11, 700, NV, "start", INT)
h.g3b("1", (lco * .4, 0, -dc / 2), 1050, 520, "COLLAR PLASTICO")
h.g3b("2", (Lt - 3, 0, -di / 2), 1300, 540, "CAÑA Cu ESTAÑADO")
h.g3b("3", (-10, 0, -di / 2 - .55), 960, 470, "CABLE")
h.txt(890, 600, "Ø del collar ilustrativo (*). Colores según DIN 46228-4.", 11, 400, OR, "start", INT)
h.bloque(890, 650, "DATOS TECNICOS", [
    "NORMA: DIN 46228-4 (PUNTERA AISLADA)",
    "CAÑA DE COBRE ESTAÑADO + COLLAR PLASTICO DE COLOR",
    "SIMPLES 1,5 A 10 mm² · DOBLES 2 x 1,5 A 2 x 6 mm²",
    "UNIDAD: Un. (2058 VIENE EN PACK x 300)",
], 360)
h.bloque(1270, 650, "DONDE SE USA", [
    "EN CADA PUNTA QUE ENTRA A UNA BORNERA · GUIA «CAJA DE COLUMNA PRFV»",
    "CAJA PRFV: 6 PUNTERAS TIF 4 (2031) POR COLUMNA PARA EL Cu 4 x 4",
    "CADA JABALINA: PUNTERA TIF 10 (2029)",
], 370)
h.rotuloM("MAT-TERMINALES-2", "PUNTERAS AISLADAS TIF", "SIMPLES Y DOBLES (DIN 46228-4)", "LATERAL, CORTE A-A, DETALLES Y VISTA 3D", "10:1 / 20:1", "D1, D2, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_terminales_2.svg"))
print("ok")
