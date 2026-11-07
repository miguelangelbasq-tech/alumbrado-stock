import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *
from mk_cab import _circ

h = HojaMat()
COD = [2049, 2045, 2046, 2047, 2048, 2043, 2044]
h.check_codigos(COD)
# modelo: 16 mm² / M10 (ficha): L 39 · d 5,5 · W 16 · palma 2,2
L, d, W, e = 39, 5.5, 16, 2.2
DT = 8.0       # (*) Ø exterior de la caña: no está en la ficha
LC = 22.0      # (*) largo de la caña
DA = 10.5      # (*) agujero para M10
XP = L - W / 2  # centro del agujero

# ============ PLANTA
h.titulo(40, 62, "PLANTA", "MODELO 16 mm² / M10 · ESC. 5:1 · COTAS EN mm")
k = 5.0; x0, yc = 80, 210
X = lambda mm: x0 + mm * k
h.path(f"M{X(0)},{yc-DT/2*k} H{X(LC)} L{X(LC+5)},{yc-W/2*k} H{X(XP)} A{W/2*k},{W/2*k} 0 0 1 {X(XP)},{yc+W/2*k} H{X(LC+5)} L{X(LC)},{yc+DT/2*k} H{X(0)} Z", "#fff", K, 1.5)
h.circ(X(XP), yc, DA / 2 * k, "#fff", K, 1.2)
h.ln(X(XP) - DA / 2 * k - 8, yc, X(XP) + DA / 2 * k + 8, yc, K, .5, h.EJE); h.ln(X(XP), yc - W / 2 * k - 8, X(XP), yc + W / 2 * k + 8, K, .5, h.EJE)
h.ln(X(0), yc - d / 2 * k, X(LC - 3), yc - d / 2 * k, K, .6, h.OCULTA); h.ln(X(0), yc + d / 2 * k, X(LC - 3), yc + d / 2 * k, K, .6, h.OCULTA)
h.dimH(yc + W / 2 * k + 30, X(0), X(L), "L = 39", ext=yc + DT / 2 * k)
h.dimV(X(L) + 26, yc - W / 2 * k, yc + W / 2 * k, "W = 16", ext=X(XP))
h.dimV(X(0) - 18, yc - d / 2 * k, yc + d / 2 * k, "d = 5,5", ext=X(0))
h.dimH(yc - W / 2 * k - 18, X(0), X(LC), "CAÑA (*)", ext=yc - DT / 2 * k, c=OR)
h.txt(X(XP), yc - W / 2 * k - 30, "M10 (Ø AGUJERO (*))", 10.5, 400, OR, "middle")
xs = X(LC * .55); h.ln(xs, yc - DT / 2 * k - 14, xs, yc + DT / 2 * k + 14, K, .6, h.EJE)
h.txt(xs, yc - DT / 2 * k - 18, "A", 12, 700, K, "middle"); h.txt(xs, yc + DT / 2 * k + 28, "A", 12, 700, K, "middle")
h.globo("1", X(8), yc - DT / 2 * k, X(8), 108); h.globo("2", X(XP + 5), yc - W / 2 * k + 6, 470, 140); h.globo("3", X(XP) + DA / 2 * k * .7, yc + DA / 2 * k * .7, 470, 300)

# ============ LATERAL
h.titulo(40, 372, "VISTA LATERAL", "ESC. 5:1")
yl = 450
h.path(f"M{X(0)},{yl-DT/2*k} H{X(LC)} L{X(LC+5)},{yl+DT/2*k-e*k} H{X(L)} V{yl+DT/2*k} H{X(0)} Z", "#fff", K, 1.5)
h.ln(X(0), yl - d / 2 * k, X(LC - 3), yl - d / 2 * k, K, .6, h.OCULTA); h.ln(X(0), yl + d / 2 * k, X(LC - 3), yl + d / 2 * k, K, .6, h.OCULTA)
h.ln(X(XP) - DA / 2 * k, yl + DT / 2 * k - e * k, X(XP) - DA / 2 * k, yl + DT / 2 * k, K, .6, h.OCULTA); h.ln(X(XP) + DA / 2 * k, yl + DT / 2 * k - e * k, X(XP) + DA / 2 * k, yl + DT / 2 * k, K, .6, h.OCULTA)
h.dimV(X(L) + 26, yl + DT / 2 * k - e * k, yl + DT / 2 * k, "e 2,2", ext=X(L))
h.dimV(X(0) - 18, yl - DT / 2 * k, yl + DT / 2 * k, "Ø (*)", ext=X(0), c=OR)

# ============ CORTE A-A y D1 engarzado
h.titulo(500, 62, "CORTE A-A (CAÑA)", "ESC. 10:1")
cx, cy, kc = 620, 200, 10
h.circ(cx, cy, DT / 2 * kc, "url(#ANSI31)", K, 1.2); h.circ(cx, cy, d / 2 * kc, "#fff", K, 1)
h.cobre2d(cx, cy, d / 2 * kc * .93, False, 7)
h.dimH(cy + DT / 2 * kc + 22, cx - d / 2 * kc, cx + d / 2 * kc, "d 5,5", ext=cy)
h.flecha_llamada(cx + DT / 2 * kc * .7, cy - DT / 2 * kc * .7, 700, 120, "TUBO Cu ESTAÑADO")
h.flecha_llamada(cx + 8, cy + 6, 700, 250, "CONDUCTOR 16 mm²")
h.titulo(500, 372, "DETALLE D1 - ENGARZADO", "S/E · MATRIZ HEXAGONAL DE LA SECCION DEL CABLE")
hx, hy, hr = 620, 470, 52
pts = " ".join(f"{hx+hr*math.cos(math.radians(60*q)):.1f},{hy+hr*math.sin(math.radians(60*q)):.1f}" for q in range(6))
h.a(f'<polygon points="{pts}" fill="{C_EST}" stroke="{K}" stroke-width="1.3"/>')
pts2 = " ".join(f"{hx+hr*.66*math.cos(math.radians(60*q)):.1f},{hy+hr*.66*math.sin(math.radians(60*q)):.1f}" for q in range(6))
h.a(f'<polygon points="{pts2}" fill="#c8743a" stroke="{K}" stroke-width=".8"/>')
for q in range(7):
    a = 2 * math.pi * q / 6; rr = 0 if q == 6 else 20
    h.circ(hx + rr * math.cos(a), hy + rr * math.sin(a), 10.5, "#e9a466", "#6a3510", .4)
h.parrafo(690, 440, "LA CAÑA QUEDA HEXAGONAL Y LOS HILOS COMPACTADOS, SIN HUECOS.", 150, 10)

# ============ tabla de la ficha y códigos
cols = [(150, "l", False), (60, "c", True), (60, "c", True), (60, "c", True), (110, "c", True)]
fil = [["SECCION / AGUJERO", "L", "d", "W", "PALMA"]] + [[a, b, c, dd, ee] for a, b, c, dd, ee in [
    ("10 mm² / M8", "34", "4,5", "13", "1,8"), ("10 mm² / M10", "34", "4,5", "16", "1,5"), ("16 mm² / M8", "39", "5,5", "15", "2,4"),
    ("16 mm² / M10", "39", "5,5", "16", "2,2"), ("25 mm² / M8", "43", "7", "15", "2,9"), ("25 mm² / M10", "43", "7", "16", "2,7"),
    ("25 mm² / M12", "48", "7", "19", "2,7"), ("50 mm² / M10", "53", "10", "20", "4"), ("50 mm² / M12", "56", "10", "22", "3,5")]]
h.tablaM(40, 560, cols, fil, 19, "MEDIDAS (LAPP, IEC 61238-1)")
SEC = {2049: "6 mm²", 2045: "10 mm²", 2046: "16 mm² · 3/8\"", 2047: "25 mm²", 2048: "50 mm²", 2043: "10 mm² (ACC)", 2044: "25 mm² · 3/8\" (ACC)"}
y = h.codigos(500, 574, COD, (46, 0, 34), extra_col=("SECCION", SEC, 100), wtot=340, rowh=19, titulo=None)
h.txt(500, 560, "CODIGOS DEL PAÑOL", 13, 700); h.ln(500, 564, 500 + 140, 564, K, 1)

h.notasM(40, 790, [
    "COTAS EN mm. L, d, W Y PALMA: TABLA DE LA FICHA DE LA APP (LAPP, TERMINALES TUBULARES DE Cu ESTAÑADO, IEC 61238-1).",
    "(*) Ø EXTERIOR Y LARGO DE LA CAÑA Y Ø DEL AGUJERO: NO ESTAN EN LA FICHA. A CONFIRMAR CON EL FABRICANTE.",
    "(*) 6 mm² (2049) Y LOS ACC 10/3 Y 25/3 (2043 / 2044): MEDIDAS NO ESTAN EN LA FICHA. A CONFIRMAR CON EL FABRICANTE.",
    "SE COMPRIME CON MATRIZ HEXAGONAL DE LA SECCION DEL CABLE Y SE CUBRE CON TERMOCONTRAIBLE (2057).",
    "PAT: BULON RW 1/2\" CON OJAL 5/16\" NO ENTRA (REVISION DE TIPOS CONSTRUCTIVOS, PUNTO 11): ELEGIR EL AGUJERO DEL BULON.",
], 790)

# ============ 3D: puesto en su lugar (cable + termocontraíble + terminal + bulón)
h.titulo(890, 62, "VISTA 3D - OJAL ENGARZADO EN EL CABLE", "CABLE 16 mm² · TERMOCONTRAIBLE · TERMINAL Cu ESTAÑADO PARA M10")
h.iso(10, 1060, 215)
RCB = 4.0   # cable 16 mm² unipolar (*) ilustrativo
h.cil("x", -10, 14, 0, 0, RCB, "#202226", borde="#000", bw=.5)
h.cil("x", 0, 22, 0, 0, DT / 2, C_EST, metal=True, borde="#555", bw=.5)
h.hexa("x", 8, 16, 0, 0, DT * .92, sombra(C_EST, .95), metal=True, borde="#555", bw=.5, rot=30)
h.cil("x", 10, 18, 0, 0, RCB + .6, "#2b2d33", tapa=None, borde="#000", bw=.4, op=.92) if False else None
# palma
pal = [(LC + 5 + (XP - LC - 5) * t, -W / 2) for t in (0, 1)] + [(XP + W / 2 * math.cos(math.radians(a)), W / 2 * math.sin(math.radians(a))) for a in range(-90, 91, 10)] + [(LC + 5, W / 2)]
pal = pal[:1] + pal[1:]
h.solido("x", 22, LC + 5, _circ(DT / 2, 24), [(W / 2 * math.cos(t) * .9, e / 2 * math.sin(t) * 1.6) for t in [2 * math.pi * q / 24 for q in range(24)]], 0, 0, C_EST, metal=True, borde="#555", bw=.4, cb1=-DT / 2 + e / 2 + .4)
h.solido("z", -DT / 2 + .4, -DT / 2 + .4 + e, [(px, py) for px, py in pal], [(px, py) for px, py in pal], 0, 0, C_EST, tapa=sombra(C_EST, 1.12), metal=True, borde="#555", bw=.5)
zt = -DT / 2 + .4 + e
# termocontraíble sobre caña y cable
h.cil("x", -6, 5, 0, 0, DT / 2 + .5, "#1e3a8a", tapa=sombra("#1e3a8a", 1.3), borde="#000", bw=.5)
# agujero (se ve el fondo a través)
h.F3([(XP + DA / 2 * math.cos(2 * math.pi * q / 36), DA / 2 * math.sin(2 * math.pi * q / 36), zt + .01) for q in range(36)], "#fff", "#555", .6)
h.g3b("1", (12, 0, DT / 2 * .9), 1440, 150, "CAÑA (ENGARZADA HEXAGONAL)")
h.g3b("2", (LC + 9, -W / 2 + 1, zt), 1440, 220, "PALMA Cu ESTAÑADO")
h.g3b("3", (XP + DA / 2, 0, zt), 1440, 290, "AGUJERO PARA BULON M10 (*)")
h.g3b("4", (-2, 0, -DT / 2 - .5), 945, 330, "TERMOCONTR. (2057)")
h.g3b("5", (-9, 0, RCB), 1110, 122, "CABLE 16 mm²")
h.txt(890, 620, "Termocontraíble dibujado azul para distinguirlo (*); su color real según el que se compre.", 11, 400, OR, "start", INT)

h.bloque(890, 670, "DATOS TECNICOS", [
    "MATERIAL: COBRE ESTAÑADO · TUBULAR CON PALMA",
    "NORMA DE REFERENCIA: IEC 61238-1 (LAPP)",
    "SE ELIGE POR LA SECCION DEL CABLE Y EL Ø DEL BULON (M8 / M10 / M12)",
    "COMPRESION CON MATRIZ HEXAGONAL",
    "UNIDAD: Un.",
], 360)
h.bloque(1270, 670, "DONDE SE USA", [
    "ACOMETIDA Cu 4 x 16 AL PORTAFUSIBLE NH: OJAL 16 mm² (2046, 3/8\") CON TERMOCONTRAIBLE, UNO POR CONDUCTOR",
    "TABLEROS (5 POR TABLERO EN LA PLANILLA EMA) · GUIA «CAJA DE COLUMNA PRFV»",
    "PUESTA A TIERRA: CABLE AL BORNE O BULON",
], 370)
h.rotuloM("MAT-TERMINALES-1", "TERMINAL DE OJAL", "Cu ESTAÑADO A COMPRESION", "PLANTA, LATERAL, CORTE A-A, DETALLE Y VISTA 3D", "5:1 / 10:1", "D1, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_terminales_1.svg"))
print("ok")
