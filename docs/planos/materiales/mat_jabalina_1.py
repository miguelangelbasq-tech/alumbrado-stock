import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
def corte(x, y, hgt=30):   # rotura (línea quebrada)
    h.path(f"M{x-4},{y-hgt/2} L{x+4},{y-4} L{x-4},{y+4} L{x+4},{y+hgt/2}", "none", K, .7)
# ================= VISTA LATERAL (1:1, interrumpida)
h.titulo(40, 62, "VISTA LATERAL (INTERRUMPIDA)", "ESC. 1:1 - COTAS EN mm - JABALINA 5/8\" (7015)")
y = 150; r = 7.3; x0 = 60
seg1 = 230; gap = 50; seg2 = 330; tip = 26
xa = x0 + seg1; xb = xa + gap; xc = xb + seg2
for (a, b) in ((x0, xa), (xb, xc)):
    h.rect(a, y - r, b - a, 2 * r, "#fff", K, 1.4)
    h.ln(a, y - r + .9, b, y - r + .9, K, .35); h.ln(a, y + r - .9, b, y + r - .9, K, .35)   # capa de cobre (exagerada)
corte(xa, y, 30); corte(xb, y, 30)
h.path(f"M{xc},{y-r} L{xc+tip},{y} L{xc},{y+r}", "#fff", OR, 1.4)
h.ln(x0 - 14, y, xc + tip + 14, y, K, .5, h.EJE)
h.dimH(y + 58, x0, xc + tip, 'L = 1500 (5/8" · 7015)  ·  2000 (3/4" · 7017)', ext=y + r + 2, dy=-5)
h.dimV(x0 - 24, y - r, y + r, "Ø14,6", ext=x0 - 2)
h.dimH(y - 34, xc, xc + tip, "≈ 25 (*)", ext=y - r - 2, c=OR)
h.txt(xc + tip + 6, y + 26, "PUNTA CONICA", 10.5, 700, K, "end")
h.txt(x0, y - 28, "CABEZA (SE GOLPEA CON LA MAZA)", 10.5, 700)
# línea de corte A-A
xs = xb + 90
for yy, dy in ((y - 30, -1), (y + 30, 1)):
    h.ln(xs, yy, xs, yy - dy * 12, K, 1.6); h.path(f"M{xs},{yy} l-8,0", "none", K, 1.6)
    h.path(f"M{xs-8},{yy} l4,-3 v6 z", K, K, .6); h.txt(xs - 12, yy + 4, "A", 12, 700, K, "end")
# ================= CORTE A-A (10:1)
h.titulo(40, 262, "CORTE A-A (AMPLIADO)", "ESC. 10:1 - CAPA DE COBRE A ESCALA")
cx, cy, R = 150, 380, 73
h.circ(cx, cy, R, "url(#cuH)", K, 1.4); h.circ(cx, cy, R - 2.54, "url(#STEEL)", K, 1.2)
h.ln(cx - R - 14, cy, cx + R + 14, cy, K, .5, h.EJE); h.ln(cx, cy - R - 14, cx, cy + R + 14, K, .5, h.EJE)
h.dimH(cy + R + 30, cx - R, cx + R, "Ø14,6 (5/8\")", ext=cy + 10)
h.globo("1", cx - 20, cy - 10, cx + 120, cy - 48); h.txt(cx + 136, cy - 44, "ALMA DE ACERO SAE 1010-1020", 10.5)
h.globo("2", cx + R * .7, cy + R * .7 - 1, cx + 120, cy + 40); h.txt(cx + 136, cy + 44, "CAPA DE COBRE ≥ 0,254 (254 µm)", 10.5)
h.txt(cx + 136, cy + 59, "Cu 98 % (DATO DE LA FAMILIA)", 10, 400, G)
# D1 detalle de la capa
h.titulo(440, 262, "DETALLE D1 - CAPA DE COBRE", "ESC. 100:1 (ESQUEMA)")
h.llamadaDet(cx + R * .71, cy - R * .71, 12, "D1")
dx, dy = 470, 320
h.rect(dx, dy, 330, 26, "url(#cuH)", K, 1.2); h.rect(dx, dy + 26, 330, 70, "url(#STEEL)", K, 1.2)
h.path(f"M{dx},{dy-12} H{dx+330}", "none", K, .5, 'stroke-dasharray="2 3"')
h.dimV(dx + 350, dy, dy + 26, "0,254", ext=dx + 332); h.txt(dx + 8, dy + 64, "ALMA DE ACERO", 10, 700)
h.txt(dx + 8, dy + 18, "COBRE ELECTROLITICO (UNIDO AL ACERO, NO ES UN CAÑO)", 10, 700)
h.txt(dx, dy + 116, "LA CAPA NO SE RASPA NI SE CORTA: SI EL TERRENO NO DEJA HINCAR,", 10.5)
h.txt(dx, dy + 132, "SE AVISA (NO SE CORTA LA JABALINA).", 10.5)
# variantes (de la ficha)
h.tabla(440, 492, [(62, "c", True), (110, "l", False), (90, "c", True), (128, "c", True)],
        [("CODIGO", "DESIGNACION", "Ø NOMINAL", "LARGO"), ("7015", 'JL16 · 5/8"', "14,6 mm", "1500 mm"), ("7017", 'JL18 · 3/4"', "16,2 mm", "2000 mm"), ("—", 'JL14 · 1/2"', "12,6 mm", "1000/1500/2000")],
        titulo="VARIANTES (IRAM 2309)", colores=lambda i, j, t: G if t == "—" or (i == 3) else K)
# códigos del pañol
y2 = h.codigos(40, 590, [7015, 7017])
# datos técnicos
y3 = h.datos(40, y2 + 34, [("NORMA", "IRAM 2309"), ("ALMA", "acero SAE 1010-1020"), ("REVESTIMIENTO", "cobre ≥ 254 µm (Cu 98 %)"),
     ("PEDIDO DEL PLIEGO", 'Ø14,6 × 1500 mm (5/8")'), ("LARGOS NORMALIZADOS", "1000 · 1500 · 2000 · 3000 mm"),
     ("CONEXION", "tomacable a compresión (no a rosca)"), ("RESIST. MAXIMA", "≤ 40 Ω en TT (ETG 2022) (*)")], w=400, c1=160)
h.lista(470, y2 + 34, "DONDE SE USA", [
    "· AP-TC-005 / 006: PAT de columna metálica:",
    "   1 por columna + 1 por tablero.",
    "· TC-PRFV-02: columna PRFV fin de circuito:",
    "   1 por circuito + 1 por tablero.",
    "· AP-T-007: la barra de PAT del tablero va",
    "   sola a su jabalina (esquema TT).",
    "· AP-TC-004: PAT de la red aérea de barrio.",
    "· Guía «Puesta a tierra y medición».",
    "· Ítems: 75 dispersor · 88 provisión jabalina.",
])
h.notas(40, 1010, [
    "COTAS EN mm. MANDA LA COTA, NO LA MEDIDA SOBRE EL DIBUJO. LA VISTA LATERAL ESTA INTERRUMPIDA.",
    'OJO: LA DE 3/4" (7017) MIDE Ø16,2 (NO 18): «JL18» ES SOLO EL NOMBRE COMERCIAL.',
    "(*) LARGO DE LA PUNTA CONICA (≈ 25): NO ESTA EN LA FICHA, A CONFIRMAR CON EL FABRICANTE.",
    "(*) CAPA DE COBRE: LA FICHA DICE ≥ 254 µm Y LA FAMILIA 250 µm. VALE LA NORMA IRAM 2309 (A CONFIRMAR).",
    "(*) RESISTENCIA MAXIMA: ETG 2014 DECIA 10 Ω, ETG 2022 DICE 40 Ω EN TT. CONFIRMAR CON EL PROYECTO.",
    "FUENTE: IRAM 2309; CATALOGOS FACBSA, TAREA Y GENROD; PLIEGO ETG MUNICIPALIDAD DE CORDOBA; GUIA PAT DE LA APP.",
])
# ================= 3D DE LA PIEZA
h.titulo(890, 62, "VISTA 3D - JABALINA ACERO-COBRE", "COMPLETA Y CABEZA AMPLIADA EN CORTE")
h.iso(.30, 960, 150)
m.cyl([0, 0, 0], [1500, 0, 0], 7.3 * 1.8, "cobre", n=18, seg=20)   # Ø dibujado 1,8× para que se vea
m.cyl([1500, 0, 0], [1545, 0, 0], 7.3 * 1.8, "cobre", n=18, r1=0.5)
m.render()
pA = h.P(0, 0, 0); pB = h.P(1545, 0, 0)
h.txt(pA[0] - 10, pA[1] - 18, "CABEZA", 11, 700, NV, "start", INT); h.txt(pB[0] - 10, pB[1] + 26, "PUNTA", 11, 700, NV, "end", INT)
h.txt(1100, 400, "L = 1500 / 2000 mm (Ø exagerado 1,8×)", 11, 400, G, "start", INT)
# cabeza ampliada en corte (cuarto sacado)
h.iso(4.6, 1440, 300)
R0 = 7.3
for a in range(90, 360, 9):
    a0, a1 = math.radians(a), math.radians(a + 9)
    m.face([[R0*math.cos(a0), R0*math.sin(a0), 0], [R0*math.cos(a1), R0*math.sin(a1), 0], [R0*math.cos(a1), R0*math.sin(a1), -45], [R0*math.cos(a0), R0*math.sin(a0), -45]], "cobre")
m.face([[R0 * math.cos(math.radians(a)), R0 * math.sin(math.radians(a)), 0] for a in range(90, 361, 9)] + [[0, 0, 0]], "cobre")
m.face([[(R0 - .9) * math.cos(math.radians(a)), (R0 - .9) * math.sin(math.radians(a)), .05] for a in range(90, 361, 9)] + [[0, 0, .05]], "#8d969d", edge=None)
m.render()
# cara del cuarto sacado (planos x=0 y y=0) dibujada encima
for pl in ("x", "y"):
    def pt(t, z): return [t, 0, z] if pl == "x" else [0, t, z]
    m.face([pt(0, 0), pt(R0, 0), pt(R0, -45), pt(0, -45)], "#7d868d", bias=900); m.face([pt(R0 - .9, 0), pt(R0, 0), pt(R0, -45), pt(R0 - .9, -45)], "cobre", bias=901)
m.render()
h.g3("1", (2, 0, -25), 1500, 470, "ALMA DE ACERO")
h.g3("2", (R0 - .4, 0, -12), 1500, 500, "COBRE (EXAGERADO)")
h.txt(1310, 150, "CABEZA AMPLIADA", 11, 700, NV, "start", INT)
# ================= 3D EN SU LUGAR
h.titulo(890, 560, "EN SU LUGAR - HINCADA JUNTO A LA BASE", "TERRENO CORTADO A UN CUARTO · TOMACABLE Y CABLE VERDE-AMARILLO")
h.iso(.145, 1180, 672)
Z0 = -150   # cabeza bajo el nivel del piso (*)
B = 520
m.box(-B, 0, -B, B, -1800, 0, "#c9a77c", pat="soil3", edge="#6b5236")
m.box(0, B, -B, 0, -1800, 0, "#c9a77c", pat="soil3", edge="#6b5236")
m.render()
m.box(0, B, 0, B, -1800, -1700, "#c9a77c", pat="soil3", edge="#6b5236")   # piso del cuarto
m.render()
m.cyl([0, 0, Z0 - 1500], [0, 0, Z0], 7.3 * 2.2, "cobre", n=16, seg=12, bias=50)
m.cyl([0, 0, Z0 - 1560], [0, 0, Z0 - 1500], 0.5, "cobre", n=16, r1=7.3 * 2.2, bias=50)
# tomacable (cuerpo de bronce) + bulón
m.box(-30, 30, -24, 24, Z0 - 70, Z0 - 10, "bronce", bias=80, edge="#5a4012")
m.cyl([30, 0, Z0 - 40], [62, 0, Z0 - 40], 9, "bronce", n=6, bias=90, edge="#5a4012")
# cable 1×10 verde-amarillo que sale hacia la columna (+y)
m.cyl([0, 24, Z0 - 40], [0, 520, Z0 - 40], 12, "verde", n=12, seg=10, bias=70)
m.render()
for k in range(1, 10):   # vetas amarillas del cable
    a = h.P(0, 24 + k * 52 - 18, Z0 - 40 + 8); b = h.P(0, 24 + k * 52, Z0 - 40 + 8)
    h.ln(a[0], a[1], b[0], b[1], "#f2d21e", 2.5)
pz = h.P(-B, B, 0); h.nivel(pz[0] - 10, pz[1] - 4, "±0,00 PISO")
h.g3("1", (0, 0, Z0 - 800), 1440, 650, "JABALINA 7015 (Ø14,6 × 1500)")
h.g3("2", (0, -20, Z0 - 20), 1440, 690, "TOMACABLE WGC/TGC 7019")
h.g3("3", (0, 400, Z0 - 30), 1440, 730, "CABLE Cu 1×10 V/A 7010")
h.txt(1420, 800, "(*) Profundidad de la cabeza y separación", 11, 400, OR, "start", INT); h.txt(1420, 816, "a la base: «al nivel previsto» (guía PAT),", 11, 400, OR, "start", INT); h.txt(1420, 832, "a confirmar.", 11, 400, OR, "start", INT)
h.rotulo(890, h.H - 150, 750, "MAT-JABALINA-1", "JABALINA ACERO-COBRE", "IRAM 2309 · 5/8\" Y 3/4\"", "VISTA, CORTE, VARIANTES, DATOS Y 3D", "1:1 / 10:1", "D1 100:1, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_jabalina_1.svg")); print("ok")
