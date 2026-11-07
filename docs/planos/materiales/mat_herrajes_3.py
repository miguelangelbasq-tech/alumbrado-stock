import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
def rosca2d(x0, x1, yc, r):
    h.rect(x0, yc - r, x1 - x0, 2 * r, "#fff", K, 1.1)
    xx = x0 + 3
    while xx < x1 - 3: h.ln(xx, yc - r, xx + 4, yc + r, K, .45); xx += 5
# ================= BULON (genérico)
h.titulo(40, 62, "BULON CABEZA HEXAGONAL CON TUERCA", "ESQUEMA - Ø 1/2\" (12,7) - LARGO SEGUN CODIGO")
P, C = 70, 175
h.rect(P, C - 26, 30, 52, "url(#STEEL)", K, 1.2); h.ln(P, C - 9, P + 30, C - 9, K, .6); h.ln(P, C + 9, P + 30, C + 9, K, .6)
h.rect(P + 30, C - 12, 180, 24, "#fff", K, 1.1); rosca2d(P + 210, P + 420, C, 12)
h.rect(P + 330, C - 26, 30, 52, "url(#STEEL)", K, 1.2)
h.rect(P + 322, C - 22, 8, 44, "url(#STEEL)", K, 1); h.rect(P + 314, C - 19, 8, 38, "url(#STEEL)", K, 1)
h.ln(P - 12, C, P + 434, C, K, .5, h.EJE)
h.dimH(C + 52, P + 30, P + 420, "L: 250 (MN 52 · 4016) · 90 (4018) · 38 (4017)", ext=C + 14)
h.dimV(P + 444, C - 12, C + 12, 'Ø 1/2" (12,7)', ext=P + 422)
h.dimH(C - 40, P + 210, P + 420, "ZONA ROSCADA (*)", ext=C - 14, c=OR)
h.globo("1", P + 15, C - 26, P + 15, C - 60); h.globo("2", P + 318, C + 19, P + 300, C + 78); h.globo("3", P + 326, C - 22, P + 290, C - 60); h.globo("4", P + 345, C + 26, P + 380, C + 78)
h.txt(P + 470, C - 40, "1 CABEZA HEX.", 10.5); h.txt(P + 470, C - 24, "2 ARANDELA PLANA 4014", 10.5); h.txt(P + 470, C - 8, "3 ARANDELA PRESION 4013", 10.5); h.txt(P + 470, C + 8, "4 TUERCA", 10.5)
h.txt(P + 470, C + 30, "SIEMPRE PLANA + PRESION", 10.5, 700); h.txt(P + 470, C + 46, "DEBAJO DE LA TUERCA", 10.5, 700)
# ================= ARANDELAS Y TUERCAS
h.titulo(40, 292, "ARANDELAS, TUERCAS Y CHAPA DE RETENCION", "ESC. 1:1 (ESQUEMA) - MEDIDAS DE LA DESCRIPCION DEL PAÑOL")
cy = 378
h.circ(100, cy, 30, "url(#STEEL)", K, 1.2); h.circ(100, cy, 13, "#fff", K, 1); h.txt(100, cy + 52, 'PLANA 1/2" · 4014', 10.5, 700, K, "middle")
h.circ(230, cy, 24, "url(#STEEL)", K, 1.2); h.circ(230, cy, 13, "#fff", K, 1)
h.path(f"M226,{cy-25} l8,12", "none", "#fff", 5); h.path(f"M225,{cy-25} l6,12 M231,{cy-25} l6,12", "none", K, .9)
h.txt(230, cy + 52, 'PRESION 1/2" · 4013', 10.5, 700, K, "middle")
hexp = " ".join(f"{360 + 26 * math.cos(math.radians(30 + 60 * i)):.1f},{cy + 26 * math.sin(math.radians(30 + 60 * i)):.1f}" for i in range(6))
h.a(f'<polygon points="{hexp}" fill="url(#STEEL)" stroke="{K}" stroke-width="1.2"/>'); h.circ(360, cy, 12, "#fff", K, 1)
h.txt(360, cy + 52, 'HEX. 5/16" · 4036', 10.5, 700, K, "middle"); h.txt(360, cy + 68, 'HEX. 3/4" · 4039', 10.5, 700, K, "middle")
h.rect(476, cy - 24, 48, 48, "url(#STEEL)", K, 1.2); h.circ(500, cy, 12, "#fff", K, 1); h.txt(500, cy + 52, 'CUADRADA 1/2" · 4037', 10.5, 700, K, "middle")
# chapa de retención 52 × 28 × 2
k2 = 2.2; chx, chy = 625, cy - 14 * k2
h.rect(chx, chy, 52 * k2, 28 * k2, "url(#STEEL)", K, 1.3); h.circ(chx + 26 * k2, cy, 9, "#fff", K, 1)
h.dimH(chy - 14, chx, chx + 52 * k2, "52", ext=chy); h.dimV(chx + 52 * k2 + 18, chy, chy + 28 * k2, "28", ext=chx + 52 * k2)
h.txt(chx + 26 * k2, cy + 52, "CHAPA DE RETENCION · 4020", 10.5, 700, K, "middle"); h.txt(chx + 26 * k2, cy + 68, "ESPESOR 2 · AGUJERO (*)", 10.5, 400, OR, "middle")
# espárrago y capuchón
h.titulo(40, 470, "ESPARRAGO M16 × 190 (4023) Y CAPUCHON R15 (4031)", "ESC. 1:2 / ESQUEMA")
ey = 525; rosca2d(70, 70 + 190 * 1.6, ey, 8 * 1.6)
h.dimH(ey + 30, 70, 70 + 190 * 1.6, "190", ext=ey + 14); h.dimV(56, ey - 8 * 1.6, ey + 8 * 1.6, "M16", ext=68)
cx2 = 520
h.path(f"M{cx2},{ey-16} h70 a16,16 0 0 1 0,32 h-70 z", "url(#PLAS)", K, 1.3); h.rect(cx2 - 30, ey - 7, 30, 14, "url(#cuH)", K, .9)
h.txt(cx2 + 100, ey - 4, "CAPUCHON PROTECTOR R15:", 10.5, 700); h.txt(cx2 + 100, ey + 12, "1 POR CONDUCTOR Y POR PUNTA", 10.5)
h.txt(cx2 + 100, ey + 28, "MEDIDAS Y COLOR (*)", 10.5, 400, OR)
# códigos
y2 = h.codigos(40, 590, [4016, 4018, 4017, 4023, 4014, 4013, 4037, 4036, 4039, 4020, 4031, 9001],
               extra={4016: '1/2" × 250', 4018: "Ø12 × 90 (abrazadera Ø260)", 4017: "Ø12 × 38", 4023: "M16 × 190 · unidad «m» (*)", 4014: '1/2"', 4013: '1/2" (partida)', 4037: '1/2"',
                      4036: '5/16"', 4039: '3/4"', 4020: "52 × 28 × 2", 4031: "1 por conductor y punta", 9001: "genérico (varios)"}, wx=190)
h.lista(40, y2 + 30, "DATOS Y USO", [
    "· Todo galvanizado. Bulón MN 52 = 1/2\" × 250 con tuerca: 2 por brazo en poste de madera (AP-TC-055).",
    "· 4018 Ø12 × 90: cierra la abrazadera Ø260 (2 por abrazadera, ver MAT-HERRAJES-1).",
    "· Capuchón R15: 1 por conductor y por punta de la acometida (AP-T-019). Chapa de retención en la acometida.",
])
h.notas(40, 1010, [
    "COTAS EN mm. LAS MEDIDAS SALEN DE LA DESCRIPCION DE CADA CODIGO DEL PAÑOL.",
    "(*) LARGO ROSCADO, MEDIDAS DE CABEZAS / TUERCAS Y AGUJERO DE LA CHAPA: NO ESTAN EN LA APP. A CONFIRMAR CON EL FABRICANTE.",
    "(*) 4023 ESPARRAGO ESTA EN «m» EN EL CATALOGO PERO ES UNA PIEZA DE 190 mm: REVISAR LA UNIDAD (NO SE CAMBIA SIN TU OK).",
    "(*) 4017 DICE «BULON 12 x 38 NO4-R 25 mm»: EL SIGNIFICADO DE «NO4-R 25 mm» NO ESTA CLARO. A CONFIRMAR.",
    "9001 «HERRAJES Y MORSETERIA» ES UN CODIGO GENERICO: NO TIENE PIEZA PROPIA.",
    "FUENTE: DESCRIPCIONES DEL PAÑOL; FICHA «BULONES, ARANDELAS, TUERCAS Y CHAPA DE RETENCION» DE LA APP.",
])
# ================= 3D DESPIECE
h.titulo(890, 62, "VISTA 3D - DESPIECE DEL BULON", "BULON, ARANDELA PLANA, DE PRESION Y TUERCA (GALVANIZADO)")
h.iso(1.0, 990, 170)
m.cyl([-20, 0, 0], [0, 0, 0], 11, "galv", n=6, edge="#444"); m.render()
m.cyl([0, 0, 0], [110, 0, 0], 6.35, "galv", n=16); m.rosca([110, 0, 0], [250, 0, 0], 6.35, "galv", paso=4); m.render()
m.ring([280, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 0], 6.8, 15, 0, 2.5, 0, 360, "galv", n=30); m.render()
m.ring([310, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 0], 6.8, 12, 0, 3, 8, 352, "galv", n=30); m.render()
m.cyl([340, 0, 0], [351, 0, 0], 11, "galv", n=6, edge="#444"); m.render()
m.cyl([351.2, 0, 0], [351.4, 0, 0], 6.35, "#333333", n=16); m.render()
h.g3("1", (-10, 0, 11), 1450, 120, "BULON 1/2\" (4016 / 4018 / 4017)")
h.g3("2", (281, 0, 15), 1450, 165, "ARANDELA PLANA 4014")
h.g3("3", (311, 0, 12), 1450, 210, "ARANDELA DE PRESION 4013")
h.g3("4", (345, 0, 11), 1450, 255, "TUERCA 4037 (CUADRADA) / HEX.")
# espárrago, chapa, capuchón
h.iso(.9, 1050, 370)
m.rosca([0, 0, 0], [190, 0, 0], 8, "galv", paso=4); m.render()
m.box(230, 282, -14, 14, 0, 2, "galv", edge="#555"); m.render()
m.cyl([256, 0, 2.1], [256, 0, 2.3], 6.5, "#333333", n=16); m.render()
m.cyl([320, 0, 0], [380, 0, 0], 9, "negro", n=16); m.render()
m.cyl([290, 0, 0], [320, 0, 0], 5, "negro", n=12); m.render()
h.g3("5", (95, 0, 8), 1450, 330, "ESPARRAGO M16 × 190 · 4023")
h.g3("6", (256, 14, 2), 1450, 375, "CHAPA 52 × 28 × 2 · 4020")
h.g3("7", (350, 0, 9), 1450, 420, "CAPUCHON R15 · 4031 (*)")
# ================= EN SU LUGAR
h.titulo(890, 560, "EN SU LUGAR - CIERRE DE LAS OREJAS", "BULON PASANTE, ARANDELA PLANA + PRESION Y TUERCA")
h.iso(2.4, 1150, 820)
m.box(-40, 40, -11, -6.3, -16, 16, "galv", edge="#55606a"); m.render()
m.box(-40, 40, -6.3, -1.6, -16, 16, "galv", edge="#55606a"); m.render()
m.cyl([0, -30, 0], [0, -11, 0], 11, "galv", n=6, edge="#444"); m.render()
m.box(-40, 40, 1.6, 6.3, -16, 16, "galv", edge="#55606a"); m.render()
m.box(-40, 40, 6.3, 11, -16, 16, "galv", edge="#55606a"); m.render()
m.ring([0, 11, 0], [1, 0, 0], [0, 0, 1], [0, 1, 0], 6.8, 15, 0, 2.5, 0, 360, "galv", n=30); m.render()
m.ring([0, 13.5, 0], [1, 0, 0], [0, 0, 1], [0, 1, 0], 6.8, 12, 0, 3, 8, 352, "galv", n=30); m.render()
m.cyl([0, 16.5, 0], [0, 27.5, 0], 11, "galv", n=6, edge="#444"); m.render()
m.rosca([0, 27.5, 0], [0, 40, 0], 6.35, "galv", paso=3); m.render()
h.g3("8", (30, 11, 16), 1450, 660, "OREJAS DE LA ABRAZADERA")
h.g3("2", (0, 11, 15), 1450, 710, "ARANDELA PLANA")
h.g3("3", (0, 14, 12), 1450, 760, "ARANDELA DE PRESION")
h.g3("4", (0, 22, 11), 1450, 810, "TUERCA")
h.rotulo(890, h.H - 150, 750, "MAT-HERRAJES-3", "BULONES, ARANDELAS,", "TUERCAS Y CHAPA", "ESQUEMAS, DATOS Y 3D", "S/E / 1:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_herrajes_3.svg")); print("ok")
