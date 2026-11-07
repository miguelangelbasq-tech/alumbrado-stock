import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
# ================= ELEVACION TRANSICION (esquema AP-TC-024)
h.titulo(40, 62, "TRANSICION AEREO-SUBTERRANEA (AP-TC-024)", "ESQUEMA 1:60 - PLANO OFICIAL PENDIENTE: MEDIDAS A CONFIRMAR (*)")
k = 0.058; x0, yb = 170, 568
h.path(f"M{x0-18},{yb+40} L{x0-12},{yb-440} H{x0+12} L{x0+18},{yb+40} Z", "url(#CONC)", K, 1.4)
h.rect(x0 + 18, yb - 6400 * k, 12, 6400 * k, "url(#STEEL)", K, 1.2)
h.path(f"M{x0+18},{yb-6400*k} q2,-22 26,-24 l4,12 q-16,2 -18,12 z", "url(#STEEL)", K, 1.1)   # pipeta
for yy in (yb - 330, yb - 200, yb - 70): h.rect(x0 - 22, yy, 60, 6, "url(#STEEL)", K, .9)
h.path(f"M{x0+60},{yb-6400*k-40} C{x0+52},{yb-6400*k-36} {x0+48},{yb-6400*k-30} {x0+44},{yb-6400*k-20}", "none", K, 2.5)
h.path(f"M{x0+300},{yb-6400*k-50} L{x0+60},{yb-6400*k-40}", "none", K, 2.5)
h.ln(40, yb, 470, yb, K, 1.4); h.txt(40, yb - 6, "±0,00", 10.5)
h.rect(40, yb, 430, 40, "url(#EARTH)", K, 0)
h.path(f"M{x0+24},{yb} Q{x0+26},{yb+22} {x0+60},{yb+22} H460", "none", K, 4)
h.dimV(x0 + 80, yb - 6400 * k, yb, "6400 H°G° (8.03) · 4000 DOBLE AISL. (8.02)", ext=x0 + 32)
h.globo("1", x0 + 34, yb - 6400 * k - 16, x0 + 160, yb - 6400 * k + 10); h.txt(x0 + 176, yb - 6400 * k + 14, "PIPETA + ESPUMA (5502 / 8010)", 10.5)
h.globo("2", x0 + 38, yb - 327, x0 + 160, yb - 300); h.txt(x0 + 176, yb - 296, '3 FLEJES INOX 3/4" CON HEBILLA', 10.5)
h.globo("3", x0 + 24, yb - 140, x0 + 160, yb - 150); h.txt(x0 + 176, yb - 146, 'CAÑO H°G° Ø2" (5501)', 10.5)
h.globo("4", x0 + 200, yb + 22, x0 + 220, yb + 56); h.txt(x0 + 236, yb + 60, "SIGUE EN PEAD Ø50 (5005) A LA ZANJA", 10.5)
h.globo("5", x0 + 200, yb - 6400 * k - 46, x0 + 230, yb - 6400 * k - 74); h.txt(x0 + 246, yb - 6400 * k - 70, "TOMA DE LA RED: 1995/1 (3051)", 10.5)
# ================= CORTE DEL CAÑO Y PIPETA
h.titulo(560, 260, "CORTE A-A DEL CAÑO", "ESC. 1:1 (ESQUEMA)")
cx, cy = 660, 360
h.circ(cx, cy, 30, "url(#STEEL)", K, 1.4); h.circ(cx, cy, 26, "#fff", K, 1)
for a in range(0, 360, 90): h.circ(cx + 12 * math.cos(math.radians(a + 45)), cy + 12 * math.sin(math.radians(a + 45)), 6, "url(#cuH)", K, .5)
h.dimH(cy + 46, cx - 30, cx + 30, 'Ø2" (≈Ø60,3 ext.) (*)', ext=cy + 32, c=OR)
h.txt(cx + 40, cy - 30, "ESPESOR (*)", 10.5, 400, OR)
# códigos
y2 = h.codigos(40, 670, [5501, 5502, 5004], extra={5501: "ítem 8.03", 5502: "boca de arriba", 5004: "ítem 8.02 (alternativa)"}, wx=170)
y3 = h.datos(40, y2 + 30, [("CAÑO 5501", 'H°G° Ø2" · L = 6,4 m'), ("ALTERNATIVA 5004", 'doble aislación Ø2" · L = 4 m'), ("SUJECION", "3 flejes con hebilla como mínimo"),
    ("BOCA DE ARRIBA", "pipeta y sellado"), ("BOCA DE ABAJO", "sellada con espuma (8010)"), ("PAGO", "ítem 6.07 por m · 6.08 por unidad")], w=430, c1=140)
h.lista(500, y2 + 30, "DONDE SE USA", [
    "· AP-TC-024: pasa la red aérea a tendido",
    "   subterráneo (o a una columna de A.P.)",
    "   bajando por un poste de madera o H°A°.",
    "· Calculadora modo Barrio →",
    "   «Transición aéreo-subterránea».",
    "· AP-T-014 (pipeta).",
])
h.notas(40, 1010, [
    "ESQUEMA: EL PLANO OFICIAL AP-TC-024 NO LO TENEMOS TODAVIA. DIBUJO Y MEDIDAS A CONFIRMAR (*).",
    "(*) Ø EXTERIOR Y ESPESOR DEL CAÑO 2\", FORMA DE LA PIPETA Y SEPARACION DE LOS FLEJES: A CONFIRMAR CON EL FABRICANTE / PLANO.",
    "LOS FLEJES Y HEBILLAS SON LOS DE MAT-FLEJE-1 (4024 / 4025). LA ESPUMA ES 8010 (OTRA FAMILIA).",
    "5501 Y 5502 SON CODIGOS DE LA APP (RANGO x500-x999), MATERIAL DE BARRIO.",
    "FUENTE: LP 21478 ANEXO I (6.07 / 6.08 / 8.02 / 8.03); ETG CORDOBA; FICHA AP-TC-024 DE LA APP.",
])
# ================= 3D PIPETA Y CAÑO
h.titulo(890, 62, "VISTA 3D - PIPETA SOBRE EL CAÑO H°G°", "EL CABLE ENTRA POR LA PIPETA, QUE NO DEJA PASAR EL AGUA")
h.iso(1.15, 1130, 360)
m.cyl([0, 0, -70], [0, 0, 0], 30.15, "galv", n=32, seg=2); m.render()
m.cyl([0, 0, 0], [0, 0, 20], 34, "galv", n=32); m.render()
# curva de la pipeta: segmentos de toro
N = 14; AM = 160
def anillo(a, r=32, n=28):
    c = [40 * (1 - math.cos(a)), 0, 20 + 40 * math.sin(a)]; e1 = [-math.cos(a), 0, math.sin(a)]
    return [[c[0] + r * math.cos(2 * math.pi * t / n) * e1[0], r * math.sin(2 * math.pi * t / n), c[2] + r * math.cos(2 * math.pi * t / n) * e1[2]] for t in range(n)]
RG = [anillo(math.radians(AM * k / 24)) for k in range(25)]
for k in range(24):
    A, B = RG[k], RG[k + 1]
    for t in range(28): m.face([A[t], A[(t + 1) % 28], B[(t + 1) % 28], B[t]], "galv")
m.render()
aE = math.radians(AM); pE = [40 * (1 - math.cos(aE)), 0, 20 + 40 * math.sin(aE)]; tE = [math.sin(aE), 0, math.cos(aE)]
m.cyl(pE, [pE[0] + tE[0] * .6, 0, pE[2] + tE[2] * .6], 30, "#202020", n=28); m.render()
p2 = [pE[0] + tE[0] * 25, 0, pE[2] + tE[2] * 25]
m.cyl(pE, p2, 9, "negro", n=14); m.cyl(p2, [p2[0] + 20, 0, p2[2] - 10], 9, "negro", n=14); m.cyl([p2[0] + 20, 0, p2[2] - 10], [230, -40, 60], 9, "negro", n=14, seg=3); m.render()
h.g3("1", (40, 32, 52), 1450, 150, "PIPETA 5502 (BOCA HACIA ABAJO)")
h.g3("3", (0, 30, -40), 1450, 200, 'CAÑO H°G° Ø2" 5501')
h.g3("6", (180, -25, 50), 1450, 250, "CABLE DE LA RED")
h.txt(890, 520, "(*) Forma de la pipeta: esquemática, a confirmar con el plano AP-TC-024.", 11, 400, OR, "start", INT)
# ================= EN SU LUGAR
h.titulo(890, 560, "EN SU LUGAR - BAJADA POR EL POSTE", "CAÑO 6,4 m, 3 FLEJES, PIPETA ARRIBA Y PEAD Ø50 A LA ZANJA")
h.iso(.053, 1170, 990)
m.box(-500, 500, -500, 500, -200, 0, "#c9a77c", pat="soil3", edge="#6b5236"); m.render()
m.cyl([0, 0, -200], [0, 0, 7200], 150, "conc", n=36, seg=10, r1=105, pat="conc3"); m.render()
m.cyl([0, 190, -150], [0, 165, 6400], 34, "galv", n=16, seg=10); m.render()
for z in (1200, 3200, 5200):
    rr = 150 - 45 * z / 7200
    m.ring([0, 0, z], [1, 0, 0], [0, 1, 0], [0, 0, 1], rr, rr + 10, 0, 80, -50, 140, "inox", n=24); m.render()
m.cyl([0, 165, 6400], [60, 165, 6560], 40, "galv", n=16); m.render()
m.cyl([60, 165, 6560], [900, -300, 7000], 12, "negro", n=10, seg=4); m.render()
m.cyl([0, 190, -150], [0, 500, -150], 30, "#1c1c1c", n=12, seg=4); m.render()
h.g3("1", (60, 165, 6560), 1450, 640, "PIPETA 5502")
h.g3("2", (0, 150, 3240), 1450, 700, "3 FLEJES CON HEBILLA")
h.g3("3", (0, 190, 2000), 1450, 760, "CAÑO H°G° 5501 (6,4 m)")
h.g3("4", (0, 450, -150), 1450, 820, "PEAD Ø50 A LA ZANJA")
h.rotulo(890, h.H - 150, 750, "MAT-FLEJE-2", "CAÑO H°G° 2\" Y PIPETA", "TRANSICION AP-TC-024", "ESQUEMA, CORTE, DATOS Y 3D", "1:60 / 1:1", "ESQUEMAS Y 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_fleje_2.svg")); print("ok")
