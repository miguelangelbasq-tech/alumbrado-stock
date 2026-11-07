import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
def rosca2d(x0, x1, yc, r):
    h.rect(x0, yc - r, x1 - x0, 2 * r, "#fff", K, 1.1)
    xx = x0 + 3
    while xx < x1 - 3: h.ln(xx, yc - r, xx + 4, yc + r, K, .45); xx += 5
# ================= BULON DE OJO MN 505
h.titulo(40, 62, "BULON DE OJO MN 505 (Q 182) - 4506", "ESC. 1:2 - LARGO SEGUN EL POSTE (PASANTE)")
k = 1.6; y = 150; x0 = 90
h.circ(x0, y, 24, "none", K, 8); h.circ(x0, y, 24, "none", "#fff", 4.5)
h.rect(x0 + 22, y - 6.35 * k, 120, 12.7 * k, "#fff", K, 1.1); rosca2d(x0 + 142, x0 + 300, y, 6.35 * k)
h.rect(x0 + 260, y - 12 * k, 14, 24 * k, "url(#STEEL)", K, 1)
h.ln(x0 - 30, y, x0 + 320, y, K, .5, h.EJE)
h.dimH(y - 40, x0 + 22, x0 + 300, "LARGO SEGUN POSTE (*)", ext=y - 12, c=OR)
h.dimV(x0 + 330, y - 6.35 * k, y + 6.35 * k, 'Ø 1/2" (*)', ext=x0 + 302, c=OR)
h.dimH(y + 44, x0 - 24, x0 + 24, "OJO Ø48 (*)", ext=y + 26, c=OR)
h.txt(x0 + 270, y + 38, "TUERCA", 10.5, 700, K, "middle")
# ================= OJAL MN 377
h.titulo(480, 62, "OJAL MN 377 - 4507", "ESQUEMA S/E - MEDIDAS SEGUN NORMA MN (*)")
ox, oy = 560, 150
h.circ(ox, oy, 22, "none", K, 7); h.circ(ox, oy, 22, "none", "#fff", 3.5)
h.rect(ox + 20, oy - 6, 60, 12, "#fff", K, 1.1); rosca2d(ox + 80, ox + 160, oy, 6)
h.ln(ox - 30, oy, ox + 180, oy, K, .5, h.EJE)
h.txt(ox + 40, oy + 46, "ROSCA / LARGO SEGUN MN 377 (*)", 10.5, 400, OR)
# ================= TIRAFONDO MN 520
h.titulo(40, 262, "BULON TIRAFONDO MN 520 - 4508", "ESC. 1:1 - 12,7 × 101 mm (PLIEGO 15.63)")
tx, ty = 70, 340; k1 = 2.5
h.rect(tx, ty - 10 * k1 / 1.2, 26, 20 * k1 / 1.2, "url(#STEEL)", K, 1.2)   # cabeza
L = 101.6 * k1 * .85
h.rect(tx + 26, ty - 6.35 * k1, 60, 12.7 * k1, "#fff", K, 1.1)
h.path(f"M{tx+86},{ty-6.35*k1} L{tx+26+L-30},{ty-6.35*k1} L{tx+26+L},{ty} L{tx+26+L-30},{ty+6.35*k1} L{tx+86},{ty+6.35*k1} Z", "#fff", K, 1.1)
xx = tx + 90
while xx < tx + 26 + L - 20: h.path(f"M{xx},{ty-6.35*k1-3} l6,{12.7*k1+6}", "none", K, .9); xx += 9
h.ln(tx - 10, ty, tx + 26 + L + 16, ty, K, .5, h.EJE)
h.dimH(ty + 46, tx + 26, tx + 26 + L, '101,6 (4")', ext=ty + 18)
h.dimV(tx + 26 + L + 40, ty - 6.35 * k1, ty + 6.35 * k1, 'Ø12,7 (1/2")', ext=tx + 26 + L - 20)
h.txt(tx, ty - 34, "CABEZA CUADRADA / HEX. (*)", 10.5, 400, OR)
h.txt(tx + 190, ty - 34, "ROSCA PARA MADERA, PUNTA CONICA", 10.5)
# ================= ARANDELA CUADRADA MN 30
h.titulo(480, 262, "ARANDELA CUADRADA MN 30 - 4509", "ESQUEMA S/E - MEDIDAS SEGUN NORMA MN (*)")
ax, ay = 560, 325
h.rect(ax, ay, 90, 90, "url(#STEEL)", K, 1.3); h.circ(ax + 45, ay + 45, 9, "#fff", K, 1)
h.dimH(ay - 14, ax, ax + 90, "≈ 50 (*)", c=OR); h.dimV(ax - 16, ay, ay + 90, "≈ 50 (*)", c=OR)
h.rect(ax + 130, ay, 10, 90, "url(#STEEL)", K, 1.3); h.dimH(ay + 106, ax + 130, ax + 140, "e (*)", c=OR)
h.txt(ax + 160, ay + 30, "SE PONE DEBAJO", 10.5); h.txt(ax + 160, ay + 46, "DE LA TUERCA DEL", 10.5); h.txt(ax + 160, ay + 62, "BULON DE OJO", 10.5)
# códigos
y2 = h.codigos(40, 470, [4506, 4507, 4508, 4509], extra={4506: "retención, pasante", 4507: "MN 377", 4508: "suspensión · 15.63", 4509: "con el bulón de ojo"}, wx=150)
y3 = h.datos(40, y2 + 32, [("MATERIAL", "acero galvanizado (H°G°)"), ("TIRAFONDO 4508", "12,7 × 101 mm · pliego 15.63"), ("BULON DE OJO", "MN 505 (Q 182), con tuerca"),
    ("ARANDELA", "cuadrada MN 30"), ("SOLO EN", "postes de madera (no fleje)"), ("MEDIDAS MN 505 / 377 / 30", "según norma MN (*)")], w=410, c1=170)
h.lista(480, y2 + 32, "DONDE SE USA", [
    "· Red aérea de barrio sobre poste de madera:",
    "   retención = bulón de ojo MN 505 pasante",
    "   + arandela cuadrada MN 30;",
    "   suspensión = tirafondo MN 520.",
    "· AP-TC-055 hoja A (poste de madera).",
    "· LP 21478 ítems 15.62 / 15.63.",
])
h.notas(40, 1010, [
    "COTAS EN mm. MANDA LA COTA. DEL TIRAFONDO SE CONOCEN Ø12,7 Y LARGO 101,6 (CATALOGO Y PLIEGO 15.63).",
    "(*) MEDIDAS DE MN 505 / MN 377 / MN 30 SEGUN LA NORMA MN: A CONFIRMAR CON EL PLANO DE LA INSPECCION.",
    "(*) EL Ø DEL BULON DE OJO, EL OJO Y LA ARANDELA SE DIBUJAN ORIENTATIVOS.",
    "EN POSTE DE H°A° NO SE USAN: VA FLEJE INOX CON HEBILLA (VER MAT-FLEJE-1 Y MAT-MORSETERIA_AEREA-1).",
    "FUENTE: LP 21478 (15.62 / 15.63); NORMAS MN DE HERRAJES; CATALOGO METAL-CE; FICHA DE LA APP.",
])
# ================= 3D PIEZAS
h.titulo(890, 62, "VISTA 3D - HERRAJES MN (H°G°)", "BULON DE OJO, OJAL, TIRAFONDO Y ARANDELA CUADRADA")
h.iso(1.25, 1120, 230)
# bulón de ojo (a lo largo de x)
m.ring([0, 0, 0], [0, 1, 0], [0, 0, 1], [1, 0, 0], 16, 26, -5, 5, 0, 360, "galv", n=30); m.render()
m.cyl([24, 0, 0], [80, 0, 0], 6.35, "galv", n=14); m.rosca([80, 0, 0], [200, 0, 0], 6.35, "galv", paso=4); m.render()
m.box(160, 172, -11, 11, -11, 11, "galv", edge="#555"); m.render()
# arandela cuadrada
m.box(80, 140, 60, 66, -30, 30, "galv", edge="#555"); m.render()
m.cyl([110, 66.2, 0], [110, 66.4, 0], 8, "#333333", n=16); m.render()
# tirafondo
m.cyl([0, 120, 0], [0, 120, 0.1], 1, "galv", n=4)
m.box(-12, 0, 108, 132, -12, 12, "galv", edge="#555"); m.render()
m.cyl([0, 120, 0], [50, 120, 0], 6.35, "galv", n=14); m.rosca([50, 120, 0], [100, 120, 0], 6.35, "galv", paso=5); m.cyl([100, 120, 0], [112, 120, 0], 6.35, "galv", n=14, r1=.5); m.render()
# ojal
m.ring([170, 140, 0], [0, 1, 0], [0, 0, 1], [1, 0, 0], 14, 22, -4, 4, 0, 360, "galv", n=30); m.render()
m.cyl([190, 140, 0], [240, 140, 0], 6, "galv", n=12); m.rosca([240, 140, 0], [290, 140, 0], 6, "galv", paso=4); m.render()
h.g3("1", (0, 0, 26), 1450, 130, "BULON DE OJO MN 505 · 4506")
h.g3("2", (110, 63, 30), 1450, 180, "ARANDELA MN 30 · 4509")
h.g3("3", (70, 120, 6), 1450, 230, "TIRAFONDO MN 520 · 4508")
h.g3("4", (170, 140, 22), 1450, 280, "OJAL MN 377 · 4507")
# ================= 3D EN SU LUGAR · POSTE DE MADERA
h.titulo(890, 560, "EN SU LUGAR - POSTE DE MADERA", "RETENCION CON BULON DE OJO PASANTE Y SUSPENSION CON TIRAFONDO")
h.iso(.7, 1150, 900)
m.cyl([0, 0, 0], [0, 0, 260], 110, "madera", n=40, seg=4); m.render()
m.ring([0, 0, 260], [1, 0, 0], [0, 1, 0], [0, 0, 1], 0, 110, -0.5, 0, 0, 360, "#c69a62", n=40); m.render()
# bulón de ojo pasante en z=200, sale por +x (cara visible) el ojo y por -x la tuerca (atrás)
m.box(110, 116, -30, 30, 170, 230, "galv", edge="#555"); m.render()
m.ring([140, 0, 200], [0, 1, 0], [0, 0, 1], [1, 0, 0], 16, 26, -5, 5, 0, 360, "galv", n=30); m.render()
m.cyl([116, 0, 200], [120, 0, 200], 6.35, "galv", n=12); m.render()
# tirafondo en z=80 hacia +y
m.cyl([0, 110, 80], [0, 140, 80], 6.35, "galv", n=12); m.box(-12, 12, 140, 152, 68, 92, "galv", edge="#555"); m.render()
h.g3("1", (150, 0, 220), 1450, 660, "BULON DE OJO (PASANTE)")
h.g3("2", (113, 20, 180), 1450, 710, "ARANDELA CUADRADA")
h.g3("3", (0, 146, 92), 1450, 760, "TIRAFONDO (MENSULA DE SUSP.)")
h.g3("5", (-60, 90, 230), 1450, 810, "POSTE DE MADERA")
h.rotulo(890, h.H - 150, 750, "MAT-MORSETERIA_AEREA-2", "HERRAJES MN PARA", "POSTE DE MADERA", "VISTAS, DATOS Y 3D", "1:2 / 1:1", "ESQUEMAS Y 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_morseteria_aerea_2.svg")); print("ok")
