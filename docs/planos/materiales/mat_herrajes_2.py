import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
# ================= RACK EN ELEVACION (esquema app)
h.titulo(40, 62, "RACK MN 4B2L DE 1 VIA CON AISLADOR", "ESQUEMA S/E - LAS COTAS ESTAN EN LOS PLANOS MN DE EPEC (*)")
P, C = 150, 120
h.rect(P - 70, C - 30, 50, 280, "url(#CONC)", K, 1.5); h.txt(P - 45, C + 268, "POSTE", 10.5, 700, K, "middle")
h.path(f"M{P-20},{C} h190 v12 h-190 z M{P-20},{C+180} h190 v12 h-190 z", "url(#STEEL)", K, 1.1)
h.path(f"M{P+158},{C} h12 v192 h-12 z", "url(#STEEL)", K, 1.1)
h.rect(P + 110, C + 12, 8, 168, "#fff", K, 1); h.ln(P + 114, C - 14, P + 114, C + 206, K, .5, h.EJE)
h.path(f"M{P+80},{C+48} h68 v28 q8,8 0,16 v28 q8,8 0,16 v28 h-68 v-28 q-8,-8 0,-16 v-28 q-8,-8 0,-16 z", "url(#PORC)", K, 1.3)
for yy in (C - 4, C + 188): h.rect(P - 24, yy - 6, 8, 24, "url(#STEEL)", K, .9)
h.globo("1", P + 172, C + 6, P + 250, C - 10); h.globo("2", P + 150, C + 92, P + 250, C + 92); h.globo("3", P + 118, C + 160, P + 250, C + 160)
h.globo("4", P - 22, C + 186, P - 100, C + 230)
h.dimV(P + 220, C + 12, C + 180, "ALTURA LIBRE (*)", ext=P + 172, c=OR)
rx, ry = 440, 130
for i, t in enumerate(["BASTIDOR (RACK) DE PLANCHUELA H°G°", "AISLADOR DE PORCELANA TIPO ROLDANA", "PERNO PASANTE DEL AISLADOR", "SEMIABRAZADERAS AL POSTE (MN 166)"]):
    h.circ(rx + 10, ry + i * 26, 9, "#fff", K, .9); h.txt(rx + 10, ry + i * 26 + 4, str(i + 1), 10.5, 700, K, "middle"); h.txt(rx + 26, ry + i * 26 + 4, t, 10.5)
h.txt(rx, ry + 120, "2 RACKS POR PUNTA DE RETENCION (ITEM 6.04).", 10.5, 700)
h.txt(rx, ry + 136, "PORCELANA MARRON PARA INTEMPERIE (ET 51);", 10.5)
h.txt(rx, ry + 152, "HERRAJES CINCADOS (ET 10).", 10.5)
# ================= AISLADOR DE RIENDA MN 20
h.titulo(440, 330, "AISLADOR DE RIENDA MN 20 (4011)", "ESC. 1:2 - 90 × 65 mm (COMERCIAL)")
ax, ay = 590, 445; kk = 1.3
h.path(f"M{ax},{ay-90*kk/2} C{ax+65*kk*.7},{ay-90*kk/2} {ax+65*kk*.7},{ay+90*kk/2} {ax},{ay+90*kk/2} C{ax-65*kk*.7},{ay+90*kk/2} {ax-65*kk*.7},{ay-90*kk/2} {ax},{ay-90*kk/2} Z", "url(#PORC)", K, 1.4)
h.circ(ax, ay - 18, 7, "#fff", K, 1); h.rect(ax - 20, ay + 12, 40, 12, "#fff", K, 1)
h.dimV(ax - 65 * kk / 2 - 24, ay - 90 * kk / 2, ay + 90 * kk / 2, "90", ext=ax - 10)
h.dimH(ay + 90 * kk / 2 + 18, ax - 65 * kk / 2, ax + 65 * kk / 2, "65")
h.txt(ax + 64, ay - 10, "AGUJEROS CRUZADOS:", 10.5, 700); h.txt(ax + 64, ay + 6, "LAS DOS RIENDAS NO SE TOCAN", 10.5); h.txt(ax + 64, ay + 22, "FORMA Y AGUJEROS (*)", 10.5, 400, OR)
# ================= ROLDANA MN 16 / 17
h.titulo(40, 470, "AISLADOR ROLDANA MN 16 / MN 17", "ESQUEMA S/E - PORCELANA MARRON (4009 / 4010)")
rx2, ry2 = 150, 560
h.path(f"M{rx2-40},{ry2+36} V{ry2+22} Q{rx2-48},{ry2+14} {rx2-40},{ry2+6} V{ry2-6} Q{rx2-48},{ry2-14} {rx2-40},{ry2-22} V{ry2-36} H{rx2+40} V{ry2-22} Q{rx2+48},{ry2-14} {rx2+40},{ry2-6} V{ry2+6} Q{rx2+48},{ry2+14} {rx2+40},{ry2+22} V{ry2+36} Z", "url(#PORC)", K, 1.4)
h.rect(rx2 - 8, ry2 - 36, 16, 72, "#fff", K, 1); h.ln(rx2, ry2 - 50, rx2, ry2 + 50, K, .5, h.EJE)
h.dimH(ry2 - 50, rx2 - 40, rx2 + 40, "Ø (*)", c=OR); h.dimV(rx2 + 64, ry2 - 36, ry2 + 36, "ALTO (*)", ext=rx2 + 42, c=OR)
h.txt(rx2 + 90, ry2 - 10, "GARGANTAS PARA EL CABLE", 10.5); h.txt(rx2 + 90, ry2 + 6, "Y LA ATADURA (ALAMBRE 1001)", 10.5)
h.txt(rx2 + 90, ry2 + 22, "MN 16 Y MN 17: TAMAÑO SEGUN MN (*)", 10.5, 400, OR)
# códigos
y2 = h.codigos(40, 640, [4032, 4010, 4009, 4011, 4022, 4003],
               extra={4032: "2 por punta de retención", 4010: "roldana BT", 4009: "roldana BT", 4011: "90 × 65 mm", 4022: "por Ø del poste", 4003: "por Ø del poste"}, wx=160)
y3 = h.datos(40, y2 + 30, [("PORCELANA", "marrón, para intemperie (ET 51)"), ("HERRAJES", "cincados (ET 10)"), ("MN 20", "90 × 65 mm"),
    ("NORMAS", "MN 15/16/17 · MN 19/20/21 (P_100194)"), ("ATADURA", "alambre 1001 ≈ 0,05 kg/aislador (*)")], w=430, c1=120)
h.lista(500, y2 + 30, "DONDE SE USA", [
    "· AP-T-019: acometida desde tiro flojo:",
    "   rack + aislador MN 17 en el apoyo.",
    "· AP-TC-006: PAT con acometida aérea.",
    "· AP-T-014 · guía «Acometida aérea».",
    "· Calculadora: rack, aisladores y alambre",
    "   de atar por punta (2 m por atadura).",
])
h.notas(40, 1010, [
    "ESQUEMAS SIN ESCALA: LAS COTAS DE MN 4B2L / MN 16 / MN 17 ESTAN EN LOS PLANOS DE MATERIALES NORMALES DE EPEC (NO LOS TENEMOS) (*).",
    "MEDIDA DEL AISLADOR DE RIENDA MN 20: COMERCIAL 90 × 65 mm.",
    "EL RACK SE ORIENTA PARA QUE LA DERIVACION AL TABLERO QUEDE LO MAS PERPENDICULAR POSIBLE AL TENDIDO (AP-T-019).",
    "(*) ALAMBRE DE ATAR ≈ 0,05 kg POR AISLADOR: CALCULADO POR VUELTAS, A CONFIRMAR (CLAUDE.md §11.3).",
    "FUENTE: EPEC MATERIALES NORMALES (MN 15/16/17, MN 19/20/21, P_100194; ET 51; ET 10); FICHA DE LA APP; AP-T-019.",
])
# ================= 3D RACK
h.titulo(890, 62, "VISTA 3D - RACK CON ROLDANA", "PLANCHUELA GALVANIZADA, PERNO Y AISLADOR DE PORCELANA MARRON")
h.iso(.85, 1130, 360)
m.box(-6, 0, -40, 40, -10, 190, "galv", edge="#55606a"); m.render()       # placa de apoyo (*)
m.box(0, 170, -25, 25, 180, 190, "galv", edge="#55606a"); m.render()     # brazo de arriba
m.box(0, 170, -25, 25, 0, 10, "galv", edge="#55606a"); m.render()        # brazo de abajo
m.cyl([110, 0, 10], [110, 0, 180], 5, "galv", n=12); m.render()
for (z0, z1, r) in ((40, 56, 34), (56, 72, 26), (72, 88, 34), (88, 104, 26), (104, 120, 34), (120, 136, 26), (136, 152, 34)):
    m.cyl([110, 0, z0], [110, 0, z1], r, "porc", n=32); m.render()
m.box(158, 170, -25, 25, 0, 190, "galv", edge="#55606a"); m.render()
h.g3("1", (80, 0, 190), 1450, 130, "RACK MN 4B2L 4032")
h.g3("2", (110, 34, 90), 1450, 180, "ROLDANA MN 17 / MN 16")
h.g3("3", (110, 0, 185), 1450, 230, "PERNO PASANTE")
# ================= EN SU LUGAR
h.titulo(890, 560, "EN SU LUGAR - RETENCION DE LA ACOMETIDA", "RACK CON SEMIABRAZADERAS AL POSTE Y CABLE ATADO A LA ROLDANA")
h.iso(.55, 1180, 880)
for z in (0, 190):    # semiabrazaderas: parte de atrás antes del poste
    m.ring([-110, 0, z], [1, 0, 0], [0, 1, 0], [0, 0, 1], 100, 105, 0, 12, 140, 305, "galv", n=24); m.render()
m.cyl([-110, 0, -150], [-110, 0, 300], 100, "#5f6563", n=40, seg=4); m.render()
for z in (0, 190):
    m.ring([-110, 0, z], [1, 0, 0], [0, 1, 0], [0, 0, 1], 100, 105, 0, 12, -55, 140, "galv", n=24); m.render()
m.box(-6, 0, -40, 40, -10, 200, "galv", edge="#55606a"); m.render()
m.box(0, 170, -25, 25, 180, 190, "galv", edge="#55606a"); m.box(0, 170, -25, 25, 0, 10, "galv", edge="#55606a"); m.render()
m.cyl([110, 0, 10], [110, 0, 180], 5, "galv", n=12); m.render()
for (z0, z1, r) in ((40, 56, 34), (56, 72, 26), (72, 88, 34), (88, 104, 26), (104, 120, 34), (120, 136, 26), (136, 152, 34)):
    m.cyl([110, 0, z0], [110, 0, z1], r, "porc", n=32); m.render()
m.cyl([140, -330, 96], [128, 0, 96], 9, "negro", n=14, seg=6); m.render()
m.box(158, 170, -25, 25, 0, 190, "galv", edge="#55606a"); m.render()
m.cyl([128, 0, 96], [150, 60, 40], 9, "negro", n=14, seg=2); m.cyl([150, 60, 40], [160, 110, -100], 9, "negro", n=14, seg=4); m.render()
h.g3("4", (-60, 80, 6), 1450, 660, "SEMIABRAZADERAS 4022 (POR Ø)")
h.g3("1", (60, 0, 190), 1450, 710, "RACK 4032")
h.g3("2", (110, 34, 140), 1450, 760, "ROLDANA MN 17")
h.g3("5", (138, -260, 96), 1450, 810, "ACOMETIDA (TIRO FLOJO)")
h.g3("6", (155, 100, -60), 1450, 860, "BAJADA AL TABLERO")
h.rotulo(890, h.H - 150, 750, "MAT-HERRAJES-2", "RACK MN 4B2L", "Y AISLADORES", "ESQUEMAS, DATOS Y 3D", "S/E / 1:2", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_herrajes_2.svg")); print("ok")
