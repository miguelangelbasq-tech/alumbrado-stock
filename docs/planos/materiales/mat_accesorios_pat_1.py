import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
# ================= BARRA DE PAT · FRENTE Y LATERAL (esquema 1:2)
h.titulo(40, 62, "BARRA DE PUESTA A TIERRA 125 A (7001)", "FRENTE Y CORTE A-A - ESC. 1:2 (*) - MEDIDAS A CONFIRMAR")
k = 2.0; x0, y0 = 70, 150; L = 200; Wb = 20; e = 5   # largo, ancho y espesor de la barra (*)
# aisladores
for xi in (x0 + 10 * k, x0 + (L - 30) * k):
    h.rect(xi, y0 + e * k, 20 * k, 30 * k, "url(#PLAS)", K, 1.2)
    h.ln(xi + 10 * k, y0 - 14, xi + 10 * k, y0 + (e + 30) * k + 12, K, .5, h.EJE)
h.rect(x0, y0, L * k, e * k, "url(#cuH)", K, 1.5)
holes = [x0 + (36 + i * 18) * k for i in range(8)]
for hx in holes:
    h.rect(hx - 3 * k, y0 - 4 * k, 6 * k, 4 * k, "#fff", K, .9); h.ln(hx, y0 - 4 * k - 6, hx, y0 + e * k + 6, K, .4, h.EJE)
h.ln(x0 - 20, y0 + (e + 30) * k, x0 + L * k + 20, y0 + (e + 30) * k, K, 1.2)   # chapa de fondo
h.rect(x0 - 20, y0 + (e + 30) * k, L * k + 40, 6, "url(#STEEL)", K, .8)
h.dimH(y0 - 40, x0, x0 + L * k, "200 (*)", ext=y0 - 2, c=OR)
h.dimV(x0 - 24, y0, y0 + e * k, "5 (*)", ext=x0 - 2, c=OR)
h.dimV(x0 + L * k + 30, y0 + e * k, y0 + (e + 30) * k, "30 (*)", ext=x0 + (L - 10) * k, c=OR)
h.dimH(y0 + (e + 30) * k + 36, holes[0], holes[1], "18 (*)", c=OR)
h.globo("1", x0 + 60 * k, y0 + e * k / 2, x0 + 60 * k, y0 + 130)
h.globo("2", x0 + 20 * k, y0 + 25 * k, x0 + 20 * k - 30, y0 + 140)
h.globo("3", holes[7], y0 - 4 * k, x0 + L * k + 46, y0 - 22)
# corte A-A
h.titulo(530, 62, "CORTE A-A", "POR UN AISLADOR")
cx, cy = 640, 150
h.rect(cx - Wb / 2 * k * 1.5, cy, Wb * k * 1.5, e * k * 1.5, "url(#cuH)", K, 1.4)
h.rect(cx - 10 * k * 1.5, cy + e * k * 1.5, 20 * k * 1.5, 30 * k * 1.5, "url(#PLAS)", K, 1.2)
h.rect(cx - 3, cy - 12, 6, e * k * 1.5 + 12 + 30 * k * 1.5, "#fff", K, .8)
h.rect(cx - 9, cy - 20, 18, 8, "url(#STEEL)", K, .8)
h.dimH(cy - 34, cx - Wb / 2 * k * 1.5, cx + Wb / 2 * k * 1.5, "20 (*)", ext=cy - 2, c=OR)
h.txt(cx + 50, cy + 6, "BARRA DE COBRE", 10.5); h.txt(cx + 50, cy + 52, "AISLADOR", 10.5); h.txt(cx + 50, cy - 14, "TORNILLO", 10.5)
# ================= BORNE DE PAT 6 mm² · FRENTE Y LATERAL
h.titulo(40, 330, "BORNE DE PAT P/CONDUCTOR 6 mm² (7004-7007)", "SOBRE RIEL DIN NS35 - ESC. 2:1 - DE BAJA: USAR BPN VERDE 2010")
bx, by = 70, 380; s2 = 3.0
for i, col in enumerate(("AZUL 7004", "GRIS 7005", "GRIS 7006", "VERDE 7007")):
    xx = bx + i * 8.2 * s2
    h.rect(xx, by, 8.2 * s2, 45 * s2, "#fff", K, 1.2)
    h.rect(xx + 2, by + 6 * s2, 8.2 * s2 - 4, 6 * s2, "url(#STEEL)", K, .6); h.rect(xx + 2, by + 33 * s2, 8.2 * s2 - 4, 6 * s2, "url(#STEEL)", K, .6)
    h.txt(xx + 4.1 * s2, by + 24 * s2, str(i + 1), 11, 700, K, "middle")
h.rect(bx - 10, by + 20 * s2, 4 * 8.2 * s2 + 20, 4, "url(#STEEL)", K, .6)
h.dimH(by - 16, bx, bx + 8.2 * s2, "8,2 (*)", ext=by - 2, c=OR)
h.dimV(bx - 24, by, by + 45 * s2, "45 (*)", ext=bx - 2, c=OR)
h.txt(bx + 4 * 8.2 * s2 + 20, by + 20, "1  AZUL (7004)", 10.5); h.txt(bx + 4 * 8.2 * s2 + 20, by + 38, "2  GRIS (7005)", 10.5)
h.txt(bx + 4 * 8.2 * s2 + 20, by + 56, "3  GRIS (7006) = 7005", 10.5); h.txt(bx + 4 * 8.2 * s2 + 20, by + 74, "4  VERDE (7007)", 10.5)
h.txt(bx + 4 * 8.2 * s2 + 20, by + 100, "TORNILLOS DE APRIETE", 10.5); h.txt(bx + 4 * 8.2 * s2 + 20, by + 116, "ARRIBA Y ABAJO", 10.5)
# lateral del borne
lx, ly = 420, 380
h.path(f"M{lx},{ly} h{18*s2} l{6*s2},{8*s2} v{29*s2} l{-6*s2},{8*s2} h{-18*s2} l{-4*s2},{-6*s2} v{-33*s2} z", "url(#PLAS)", K, 1.2)
h.rect(lx + 2 * s2, ly + 6 * s2, 12 * s2, 6 * s2, "#fff", K, .8); h.rect(lx + 2 * s2, ly + 33 * s2, 12 * s2, 6 * s2, "#fff", K, .8)
h.rect(lx - 4 * s2 - 6, ly + 15 * s2, 6, 35 * s2 / 2.3, "url(#STEEL)", K, .6)
h.dimV(lx - 40, ly + 15 * s2, ly + 15 * s2 + 35 * s2 / 2.3, "35 NS35", ext=lx - 12)
h.txt(lx + 30 * s2, ly + 20, "LATERAL", 10.5, 700); h.txt(lx + 30 * s2, ly + 36, "RIEL DIN NS35 (35 mm)", 10.5)
h.txt(lx + 30 * s2, ly + 52, "ANCHO Y ALTO DEL BORNE (*)", 10.5, 400, OR)
# códigos
y2 = h.codigos(40, 590, [7001, 7004, 7005, 7006, 7007],
               extra={7001: "125 A · llega la jabalina", 7004: "DE BAJA (usar 2010)", 7005: "= 7006 · DE BAJA", 7006: "= 7005 · DE BAJA", 7007: "DE BAJA (usar 2010)"})
y3 = h.datos(40, y2 + 32, [("BARRA 7001", "cobre sobre aisladores · 125 A"), ("LLEGA A LA BARRA", "cable de jabalina con ojal 10 mm²"),
    ("TAMBIEN LLEGAN", "todas las tierras del tablero"), ("BORNES 7004-7007", "p/conductor 6 mm², riel DIN"),
    ("REEMPLAZO", "BPN 6 mm² verde 2010 (ítem 63)"), ("MEDIDAS", "no publicadas en la app (*)")], w=410, c1=140)
h.lista(480, y2 + 32, "DONDE SE USA", [
    "· AP-T-007 (TT): la barra de PAT va sola a su",
    "   jabalina; no hay unión neutro–PAT.",
    "· AP-T-008 (TN-S): barra de PAT del tablero.",
    "· AP-CC-014: tablero de conexionado de columna.",
    "· Guía PAT: «ojal 10 mm² a la barra de PAT».",
    "· Cálculo: 10 m de 1×10 V/A por tablero.",
])
h.notas(40, 1010, [
    "COTAS EN mm. MANDA LA COTA. LA BARRA Y EL BORNE SE DIBUJAN EN ESQUEMA.",
    "(*) MEDIDAS DE LA BARRA (LARGO, SECCION, AISLADORES, PASO DE TORNILLOS) Y DEL BORNE: NO ESTAN EN LA APP. A CONFIRMAR CON EL FABRICANTE.",
    "7004-7007 ESTAN DE BAJA (CLAUDE.md §11.3): LA TIERRA VA VERDE, USAR LA BPN 6 mm² VERDE 2010. 7005 Y 7006 SON EL MISMO MATERIAL.",
    "(*) DUDA ABIERTA: SI 7004-7007 «BORNE DE PUESTA A TIERRA 6 mm²» SON LAS BPN. PREGUNTAR A ANGEL ANTES DE UNIR NADA.",
    "EN ESQUEMA TT LA BARRA DE PAT NO SE UNE AL NEUTRO (AP-T-007).",
    "FUENTE: DESCRIPCIONES DEL PAÑOL; FICHA «BARRA DE PUESTA A TIERRA DEL TABLERO»; AP-T-007 / 008; GUIA PAT.",
])
# ================= 3D BARRA
h.titulo(890, 62, "VISTA 3D - BARRA DE PAT DEL TABLERO", "COBRE SOBRE AISLADORES, CON EL OJAL DEL CABLE DE LA JABALINA")
h.iso(2.2, 1130, 260)
m.box(-20, 220, -15, 35, -6, 0, "galv", edge="#55606a")       # chapa de fondo
for xi in (20, 180): m.cyl([xi, 10, 0], [xi, 10, 30], 9, "negro", n=20, bias=5)
m.render()
m.box(0, 200, 0, 20, 30, 35, "cobre", edge="#7a3f12", bias=20)
for i in range(8):
    xx = 36 + i * 18
    m.cyl([xx, 10, 35], [xx, 10, 40], 5.5, "galv", n=6, edge="#555", bias=30)
    m.cyl([xx, 10, 40], [xx, 10, 42], 3, "galv", n=12, bias=31)
m.render()
# ojal y cable en el tornillo 1
m.ring([36, 10, 35.2], [1, 0, 0], [0, 1, 0], [0, 0, 1], 3.2, 7, 0, 1.2, 0, 360, "cobre", n=24, bias=40)
m.box(36, 60, 6, 14, 35.2, 36.6, "cobre", edge="#7a3f12", bias=40)
m.cyl([60, 10, 36], [70, 100, 6], 3.4, "verde", n=12, seg=4, bias=35)
m.render()
for kk in range(6):
    a = h.P(61 + kk * 1.5, 22 + kk * 12, 37 - kk * 4); b = h.P(61.5 + kk * 1.5, 27 + kk * 12, 35 - kk * 4); h.ln(a[0], a[1], b[0], b[1], "#f2d21e", 3)
h.g3("1", (120, 10, 35), 1450, 150, "BARRA DE COBRE 7001")
h.g3("2", (180, 19, 15), 1450, 200, "AISLADOR")
h.g3("3", (90, 10, 40), 1450, 250, "TORNILLO DE APRIETE")
h.g3("4", (38, 16, 36), 1450, 300, "OJAL 10 mm² DEL CABLE")
h.g3("5", (65, 60, 22), 1450, 350, "CABLE 1×10 V/A A LA JABALINA")
# ================= 3D BORNES EN RIEL
h.titulo(890, 560, "VISTA 3D - BORNES DE PAT EN RIEL DIN", "7004 AZUL · 7005 / 7006 GRIS · 7007 VERDE - TODOS DE BAJA")
h.iso(3.0, 1130, 760)
m.box(-10, 50, 0, 35, -7.5, 0, "galv", edge="#55606a")
cols = ["azul", "gris", "gris", "verde"]
for i, c in enumerate(cols):
    x = i * 8.4
    m.box(x, x + 8.2, 2, 33, 0, 38, c, edge="#222", bias=10)
    for yy in (7, 28): m.cyl([x + 4.1, yy, 38], [x + 4.1, yy, 40], 2.4, "galv", n=12, bias=20)
m.render()
for i, (c, t) in enumerate(zip(cols, ["7004 AZUL", "7005 GRIS", "7006 GRIS", "7007 VERDE"])):
    h.g3(str(i + 1), (i * 8.4 + 4, 34, 20), 1450, 660 + i * 50, t)
h.g3("6", (48, 30, -4), 1450, 860, "RIEL DIN NS35")
h.txt(890, 1006, "De baja: no se compran más. En la caja de columna la tierra va a la BPN verde 6 mm² (2010).", 11, 400, OR, "start", INT)
h.rotulo(890, h.H - 150, 750, "MAT-ACCESORIOS_PAT-1", "BARRA DE PAT", "Y BORNES DE TIERRA", "FRENTE, CORTE, LATERAL, DATOS Y 3D", "1:2 / 2:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_accesorios_pat_1.svg")); print("ok")
