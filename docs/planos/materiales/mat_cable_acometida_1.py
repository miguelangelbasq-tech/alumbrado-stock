import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *

h = HojaMat()
COD = [1016, 1015, 1014]
h.check_codigos(COD)
# ficha: fase Al 25 mm² Ø9 · neutro portante Al-aleación 50 mm² Ø12,5 · haz Ø ≈ 26 · XLPE negra · 0,6/1,1 kV · IRAM 2263
RF, RN = 4.5, 6.25
RCF = math.sqrt(4 * 25 / math.pi) / 2; RCN = math.sqrt(4 * 50 / math.pi) / 2   # calculados de la sección
D = RN + RF

# ============ CORTE A-A
h.titulo(40, 62, "CORTE A-A DEL HAZ", "ESC. 5:1 · COTAS EN mm")
k = 5.0; cx, cy = 190, 235
h.circ(cx, cy, (D + RF) * k, "none", G, .6, 'stroke-dasharray="4 3"')
h.circ(cx, cy, RN * k, "#fff", K, 1.2); h.cobre2d(cx, cy, RCN * k, False, 7)
ang = [-90, 30, 150]
for i, a in enumerate(ang):
    x = cx + D * k * math.cos(math.radians(a)); y = cy + D * k * math.sin(math.radians(a))
    h.circ(x, y, RF * k, "#fff", K, 1.2); h.cobre2d(x, y, RCF * k, False, 7)
    h.txt(x + RF * k * .62, y - RF * k * .55, str(i + 1), 11, 700)
h.dimH(cy + (D + RF) * k + 24, cx - (D + RF) * k, cx + (D + RF) * k, "Ø HAZ ≈ 26 (FICHA) (*)", ext=cy, c=OR)
xf, yf = cx + D * k * math.cos(math.radians(30)), cy + D * k * math.sin(math.radians(30))
h.dimV(cx - (D + RF) * k - 20, cy - RN * k, cy + RN * k, "Ø12,5", ext=cx - RN * k)
h.dimH(cy - (D + RF) * k - 16, cx - RF * k, cx + RF * k, "Ø9", ext=cy - D * k - RF * k)
for i, (t, ax, ay) in enumerate([("1 · FASE Al 25 mm² - AISLACION XLPE NEGRA", cx + 4, cy - D * k - RF * k * .7),
                                  ("2 · CONDUCTOR Al 25 mm² (Ø5,64 CALC.)", cx + 6, cy - D * k + 4),
                                  ("3 · NEUTRO PORTANTE Al-ALEACION 50 mm²", cx + RN * k * .8, cy + RN * k * .5),
                                  ("4 · CONDUCTOR NEUTRO (Ø7,98 CALC.)", cx + 6, cy + 6)]):
    ty = 120 + i * 30; h.ln(ax, ay, 370, ty - 4, K, .6); h.circ(ax, ay, 1.8, K, K, 0); h.ln(370, ty - 4, 376, ty - 4, K, .6)
    h.txt(379, ty, t, 10.5)

# ============ VISTA LATERAL
h.titulo(40, 400, "VISTA LATERAL DEL HAZ", "ESC. 1:1 APROX. · EL NEUTRO PORTANTE VA AL CENTRO, LAS FASES ENROLLADAS")
cores = [("#222", RF, RCF, D, math.radians(a)) for a in (-90, 30, 150)] + [("#222", RN, RCN, 0.001, 0)]
haz_lateral(h, 60, 500, 2.6, 270, 200, cores)
h.dimH(560, 60, 60 + 200 * 2.6, "PASO DE CABLEADO (*)", ext=530, c=OR)
h.ln(40, 500, 790, 500, K, .5, h.EJE)
h.globo("1", 60 + 60 * 2.6, 500 - 8 * 2.6, 60 + 60 * 2.6, 440); h.globo("3", 60 + 230 * 2.6, 500 + 3, 800, 470)

# ============ D1 color
h.titulo(500, 62, "DETALLE D1 - A COLOR", "S/E · ALUMINIO CON LA CUERDA DE 7 ALAMBRES (*)")
# (se dibuja a la derecha del corte, abajo de la lista)
dx, dy, s = 640, 330, 5.6
h.circ(dx, dy, (D + RF) * s + 8, "none", K, .7, 'stroke-dasharray="4 3"')
h.circ(dx, dy, RN * s, "#2c2f37", K, 1); h.cobre2d(dx, dy, RCN * s, True, 7, al=True)
for i, a in enumerate(ang):
    x = dx + D * s * math.cos(math.radians(a)); y = dy + D * s * math.sin(math.radians(a))
    h.circ(x, y, RF * s, "#26282c", K, 1); h.cobre2d(x, y, RCF * s, True, 7, al=True)
    h.txt(x + RF * s * .66, y - RF * s * .5, str(i + 1), 10, 700, "#fff")
h.txt(dx - 20, 62, "", 1)

# ============ tabla
y = h.codigos(40, 620, COD, (52, 0, 40), extra_col=("DATO (FICHA)", {1016: "haz Ø ≈ 26 · 82 A", 1015: "—", 1014: "—"}, 150), wtot=800, rowh=20)

h.bloque(890, 800, "DATOS TECNICOS (1016)", [
    "NORMA IRAM 2263 · 0,6/1,1 kV",
    "3 FASES Al 25 mm², AISLACION XLPE NEGRA, Ø9",
    "NEUTRO PORTANTE Al-ALEACION 50 mm², Ø12,5: SOPORTA EL PESO",
    "PESO ≈ 515 kg/km · INTENSIDAD ≈ 82 A",
    "FASES NUMERADAS 1-2-3",
], 360)
h.bloque(1270, 800, "DONDE SE USA", [
    "ACOMETIDA AEREA AP-T-019 REF. 12: DE LA LINEA DE EPEC AL TABLERO (GUIA «ACOMETIDA AEREA»)",
    "SE CUELGA DEL NEUTRO PORTANTE CON LA MORSETERIA DE LINEA AEREA (GRAMPAS Y MENSULAS)",
    "1014 PILOTO Y 1015 2 x 25: VER MAT-LINEA_AEREA-1 / -2",
], 370)
h.notasM(40, 730, [
    "COTAS EN mm. Ø 9 / 12,5 / 26, PESO E INTENSIDAD: FICHA DE LA APP (PRYSMIAN, RETENAX PREENSAMBLADO IRAM 2263).",
    "(*) CON Ø9 Y Ø12,5 TOCANDOSE EL HAZ DA ≈ 30, NO 26: EL Ø DEL HAZ VA A CONFIRMAR CON LA HOJA DEL FABRICANTE.",
    "Ø DE LOS CONDUCTORES: CALCULADOS DE LA SECCION (RAIZ 4S/PI), NO SON DATO DEL FABRICANTE.",
    "(*) PASO DE CABLEADO Y CANTIDAD DE ALAMBRES DEL NEUTRO: A CONFIRMAR CON EL FABRICANTE.",
], 790)

# ============ D2: dónde va
h.titulo(40, 870, "D2 - DONDE VA (AP-T-019, ESQUEMA)", "S/E · DE LA LINEA DE EPEC AL POSTE DEL TABLERO")
yb = 1060
yb = 1050
h.ln(40, yb, 840, yb, K, 1.4)
h.rect(90, yb - 100, 8, 100, "#fff", K, 1); h.txt(104, yb - 40, "LINEA EPEC", 10, 700)
h.rect(560, yb - 80, 7, 80, "#fff", K, 1); h.rect(570, yb - 66, 26, 36, "#fff", K, 1); h.txt(600, yb - 44, "TABLERO", 10)
h.path(f"M98,{yb-92} Q330,{yb-55} 560,{yb-74}", "none", K, 2.2)
h.txt(330, yb - 74, "HAZ 3 x 1 x 25/50 (1016)", 10.5, 700, K, "middle")
h.dimH(yb - 112, 98, 560, "VANO MAX. 10 m", ext=yb - 92)
h.ln(700, yb, 700, yb - 10, K, 1.2); h.txt(700, yb - 14, "CORDON", 10, 400, K, "middle")
h.dimH(yb + 14, 563, 700, "2,50 m", ext=yb, dy=12)

# ============ 3D
h.titulo(890, 62, "VISTA 3D - HAZ PREENSAMBLADO 3 x 1 x 25/50", "LAS FASES ENROLLADAS SOBRE EL NEUTRO PORTANTE · PUNTAS PELADAS")
h.iso(5.2, 990, 200)
c3 = [(C_VAINA, RF, RCF, D, math.radians(a)) for a in (-90, 30, 150)] + [("#3a3d42", RN, RCN, 0.001, 0)]
o = haz3d(h, c3, 120, 170, u_fin=[96, 104, 112, 86], L_cu=12, hilos=7, al=True)
fin = o["fin"]
h.g3b("1", (60, fin[0][1] * .2, D * .8 + RF), 1440, 160, "FASE Al 25 XLPE")
h.g3b("2", (fin[1][0] + 8, fin[1][1], fin[1][2] + RCF), 1440, 220, "CONDUCTOR Al")
h.g3b("3", (fin[3][0] - 4, 0, RN), 1440, 280, "NEUTRO PORTANTE")
h.g3b("4", (fin[3][0] + 9, 0, RCN), 1440, 340, "Al-ALEACION 50")
h.txt(890, 740, "Paso del enrollado y largos de pelado ilustrativos (*); las medidas mandan en el corte A-A.", 11, 400, OR, "start", INT)

h.rotuloM("MAT-CABLE_ACOMETIDA-1", "PREENSAMBLADO Al-Al", "3 x 1 x 25/50 mm² (IRAM 2263)", "CORTE A-A, VISTA LATERAL, DETALLE Y VISTA 3D", "5:1", "D1, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_cable_acometida_1.svg"))
print("ok")
