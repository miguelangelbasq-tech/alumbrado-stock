import math, sys
sys.path.insert(0, ".")
from _barrio import *

h = nueva()
banner(h, "PLANO OFICIAL PENDIENTE (HOJAS B A G) - DIBUJADO CON LA FICHA DE NORMAS, LA CALCULADORA DE BARRIO Y LA GUIA DE LA APP. LO NARANJA CON (*) ES A CONFIRMAR")

# ======================= VISTA LATERAL (mirando a lo largo de la calle) · ESC 1:75
k = 0.0533; PX = 165; yG = 500
LIB, EMP = 7050, 1450
def Y(z): return yG - z * k
h.titulo(40, 74, "VISTA LATERAL", "ESC. 1:75 - MIRANDO A LO LARGO DE LA CALLE")
suelo2d(h, 40, 330, yG, 112)
# fundación H-15 (solo apoyo nuevo)
h.rect(PX - 300 * k, yG, 600 * k, EMP * k, "url(#CONC)", K, .8)
d = poste2d(h, PX, yG, k, LIB, EMP, 300, 209, "#fff", K, 1.6)
def R(z): return d(z + EMP) / 2 * k
# red: piloto arriba, preensamblado (neutro) debajo, en ménsulas (lado calle)
zP, zN, zB, zT = 6900, 6500, 6000, 5400
for z, rr in ((zP, 4.5), (zN, 6)):
    xm = PX + R(z) + 14
    h.ln(PX + R(z), Y(z) - 4, xm, Y(z) - 4, K, 1.2)
    h.circ(xm, Y(z) + 1, rr, "#fff", K, 1)
    h.circ(xm, Y(z) + 1, rr * .45, "url(#AL)", K, .4)
# brazo 2,13 m con tensor
ang = math.radians(15)
bx0, by0 = PX + R(zB), Y(zB)
bx1, by1 = bx0 + 2130 * math.cos(ang) * k, by0 - 2130 * math.sin(ang) * k
h.ln(bx0, by0, bx1, by1, K, 3.2); h.ln(bx0, by0, bx1, by1, "#fff", 1.4)
tx, ty = bx0 + .42 * (bx1 - bx0), by0 + .42 * (by1 - by0)
h.ln(PX + R(zT), Y(zT), tx, ty, K, 1.4)
for z in (zB, zT): h.rect(PX - R(z) - 2, Y(z) - 2, 2 * R(z) + 4, 4, "#fff", K, 1)
# luminaria
h.path(f"M{bx1-2},{by1-3} l34,4 l2,7 l-36,-2 z", "#fff", K, 1.1)
# bajada 3x1,5 por el brazo
h.path(f"M{PX+R(zN)+14},{Y(zN)+8} Q{bx0+8},{by0-6} {bx0+14},{by0-5} L{bx1-4},{by1-6}", "none", K, .7)
# PAT: V/A por el poste (lado opuesto), caño hasta 2500, jabalina
xV = PX - R(2500) - 4
h.path(f"M{bx0-3},{by0+3} L{xV},{Y(5600)} L{xV},{yG+14} Q{xV},{yG+20} {xV+6},{yG+20} L{PX+500*k-3},{yG+20}", "none", K, .8)
h.rect(xV - 2.5, Y(2500), 5, 2500 * k + 14, "#fff", K, .8)
for z in (300, 2200): h.rect(xV - 4, Y(z) - 1.5, 2 * R(z) + 9, 3, "#fff", K, .7)
jx = PX + 500 * k
jabalina2d(h, jx, yG + 300 * k, 1500 * k, 3)
h.rect(jx - 3, yG + 300 * k - 3, 6, 5, "#fff", K, .8)
h.nivel(48, yG, "±0,00")
# cotas
h.dimV(300, yG, Y(LIB), "7.050 (LIBRE)", ext=PX + R(LIB) + 22)
h.dimV(300, yG, yG + EMP * k, "1.450 (*)", ext=PX + 10, c=OR)
h.dimV(56, Y(zB), yG, "6.000 (*)", ext=PX - 14, c=OR)
h.dimV(80, Y(2500), yG, "2.500", ext=xV - 3)
h.dimH(630, PX - 300 * k, PX + 300 * k, "Ø600 (*) H-15 APOYO NUEVO", c=OR, ext=yG + EMP * k + 2, dy=13)
h.txt(bx1 - 20, by1 + 22, "15° (*)", 10, 400, OR)
# globos
gx = 318
h.globo("1", bx1 + 18, by1 + 2, 322, 118)
h.globo("2", bx0 + 60, by0 - 16, 322, 160)
h.globo("6", PX + R(zP) + 14, Y(zP), 110, 118)
h.globo("12", xV, Y(4000), 112, Y(4300))
h.globo("15", xV + 2, Y(1500), 112, Y(1500))
h.globo("10", jx, yG + 1200 * k, 230, yG + 1300 * k + 10)
h.globo("17", PX + 2, Y(3500), 230, Y(3200))

# ======================= D1 · BRAZO Y ABRAZADERAS · ESC 1:25
k1 = 0.133; px1 = 420; ztop = 7100
def Y1(z): return 108 + (ztop - z) * k1
h.titulo(360, 74, "D1 - BRAZO Y ABRAZADERAS", "ESC. 1:30 - DE COSTADO, EL BRAZO HACIA LA CALLE")
r1 = lambda z: d(z + EMP) / 2 * k1
zb1 = 5150
h.path(f"M{px1-r1(zb1)},{Y1(zb1)} L{px1-r1(ztop)},{Y1(ztop)} L{px1+r1(ztop)},{Y1(ztop)} L{px1+r1(zb1)},{Y1(zb1)}", "#fff", K, 1.6)
h.ln(px1, Y1(ztop) - 8, px1, Y1(zb1) + 8, K, .45, h.EJE)
h.path(f"M{px1-r1(zb1)-6},{Y1(zb1)} l8,-5 l10,9 l10,-9 l10,9 l8,-5", "none", K, .9)
# abrazaderas (planchuela 31,7) con orejas y bulón
for z in (zB, zT):
    yy = Y1(z); ww = 31.7 * k1
    h.rect(px1 - r1(z) - 3, yy - ww / 2, 2 * r1(z) + 6, ww, "url(#ANSI31)", K, 1)
    for s_ in (-1, 1):
        xo = px1 + s_ * (r1(z) + 3)
        h.rect(xo if s_ > 0 else xo - 12, yy - ww / 2 - 1, 12, ww + 2, "#fff", K, 1)
        h.ln(xo + s_ * 6, yy - 8, xo + s_ * 6, yy + 8, K, 1.6)
# brazo (caño) y tensor
b0 = (px1 + r1(zB) + 15, Y1(zB)); L1 = 2130 * k1
b1 = (b0[0] + L1 * math.cos(ang), b0[1] - L1 * math.sin(ang))
ex, ey = math.cos(ang), -math.sin(ang); nx, ny = -ey, ex; rp = 30 * k1
h.path(f"M{b0[0]+nx*rp},{b0[1]+ny*rp} L{b1[0]+nx*rp},{b1[1]+ny*rp} L{b1[0]-nx*rp},{b1[1]-ny*rp} L{b0[0]-nx*rp},{b0[1]-ny*rp} Z", "#fff", K, 1.2)
h.ln(b0[0], b0[1], b1[0], b1[1], K, .4, h.EJE)
h.rect(b0[0] - 15, b0[1] - 7, 15, 14, "#fff", K, 1)  # pie del brazo en la abrazadera
t1 = (b0[0] + .42 * L1 * ex, b0[1] + .42 * L1 * ey)
h.ln(px1 + r1(zT) + 12, Y1(zT), t1[0], t1[1] + rp, K, 2.2); h.ln(px1 + r1(zT) + 12, Y1(zT), t1[0], t1[1] + rp, "#fff", .7)
# luminaria
lx, ly = b1
h.path(f"M{lx-6},{ly-6} l70,8 q10,2 8,10 l-4,10 q-40,4 -76,-6 z", "#fff", K, 1.2)
h.ln(lx + 10, ly + 12, lx + 64, ly + 16, K, .5, h.OCULTA)
# red en el costado del poste (en corte)
for z, rr, lab in ((zP, 9.5 / 2 * k1 * 3, "PILOTO 1×25"), (zN, 16 * k1 * 1.6, "PREENSAMBLADO")):
    xm = px1 + r1(z) + 20
    h.rect(px1 + r1(z), Y1(z) - 6, 20, 4, "#fff", K, .9)
    h.circ(xm, Y1(z) + rr - 2, rr, "#fff", K, 1)
    h.circ(xm, Y1(z) + rr - 2, rr * .5, "url(#AL)", K, .4)
    h.txt(xm + rr + 6, Y1(z) + 4, lab, 9.5, 400, G)
# morsetos sobre la red (chicos) y bajada
morseto2d(h, px1 + r1(zP) + 20, Y1(zP) + 2, .35, True)
morseto2d(h, px1 + r1(zN) + 20, Y1(zN) + 5, .35)
h.path(f"M{px1+r1(zN)+20},{Y1(zN)+20} Q{b0[0]+20},{b0[1]-30} {b0[0]+30},{b0[1]-rp-2} L{b1[0]-8},{b1[1]-rp-2}", "none", K, .8)
for i in range(4):
    xx = b0[0] + 40 + i * 70; yy = b0[1] - (xx - b0[0]) * math.tan(ang)
    h.rect(xx - 1.2, yy - rp - 5, 2.4, 2 * rp + 7, "#fff", K, .6)
# V/A 2,5 de la luminaria a la banderita en el pie del brazo
h.path(f"M{b1[0]-6},{b1[1]+rp+2} L{b0[0]+6},{b0[1]+rp+3} L{px1-r1(zB)+6},{Y1(zB)+12}", "none", K, .6, 'stroke-dasharray="4 2"')
h.circ(px1 - r1(zB) - 4, Y1(zB) + 14, 3, "#fff", K, .9)
h.ln(px1 - r1(zB) - 4, Y1(zB) + 17, px1 - r1(5150) - 4, Y1(5150), K, 1.4)
# cotas D1
h.dimV(px1 - r1(zb1) - 40, Y1(zB), Y1(zT), "600 (*)", ext=px1 - r1(zT) - 14, c=OR)
h.dimV(px1 - r1(zb1) - 40, Y1(zN), Y1(zB), "500 (*)", ext=px1 - r1(zN) - 4, c=OR)
h.dimV(px1 - r1(zb1) - 40, Y1(zP), Y1(zN), "400 (*)", ext=px1 - r1(zP) - 4, c=OR)
h.dimH(Y1(zB) + 44, px1 - r1(zB), px1 + r1(zB), "Ø220 (SE MIDE)", ext=Y1(zB) + 8, dy=13)
h.txt((px1 + r1(zT) + t1[0]) / 2 + 8, (Y1(zT) + t1[1]) / 2 + 22, "TENSOR", 9.5, 400, G)
h.txt(b1[0] - 95, b1[1] - 36, "CAÑO H°G° Ø Y e (*)", 9.5, 400, OR)
for xa in (px1 - r1(zB) - 30, px1 + r1(zB) + 30):
    h.ln(xa - 7, Y1(zB) + 6, xa + 7, Y1(zB) + 6, K, 1.6); h.txt(xa, Y1(zB) - 6, "A", 12, 700, K, "middle")
gyD = 124
h.globo("3", px1 + r1(zB) + 3, Y1(zB) + 2, 600, Y1(zB) + 16); h.globo("4", px1 + r1(zT) + 9, Y1(zT) + 4, 600, Y1(zT) + 10)
for n, ax, ay, gx_ in (("2", b0[0] + .7 * (b1[0] - b0[0]), b0[1] + .7 * (b1[1] - b0[1]) - rp, 665),
                       ("9", b0[0] + 180, b0[1] - 180 * math.tan(ang) - rp - 5, 718), ("13", b0[0] + 90, b0[1] - 90 * math.tan(ang) + rp + 5, 771), ("1", lx + 50, ly + 4, 824)):
    h.globo(n, ax, ay, gx_, gyD)
h.globo("14", px1 - r1(zB) - 4, Y1(zB) + 14, 382, 362)
h.txt((b0[0] + b1[0]) / 2 + 14, (b0[1] + b1[1]) / 2 + 24, "L = 2.130", 10.5, 700, K, "start", CAD, -15)

# ======================= CORTE A-A (planta por la abrazadera del brazo) · ESC 1:5
k2 = .42; cx, cy = 770, 372
h.titulo(660, 272, "CORTE A-A", "ESC. 1:10 - PLANTA POR LA ABRAZADERA")
rp2 = 110 * k2
h.circ(cx, cy, rp2, "url(#CONCP)", K, 1.6)
t = 4.76 * k2 * 2
for s_ in (-1, 1):
    h.path(f"M{cx-rp2-t},{cy} A{rp2+t},{rp2+t} 0 0 {1 if s_<0 else 0} {cx+rp2+t},{cy}", "none", K, 2.2)
for s_ in (-1, 1):
    xo = cx + s_ * (rp2 + 2)
    h.rect(min(xo, xo + s_ * 26), cy - 4, 26, 8, "#fff", K, 1)
    h.rect(xo + s_ * 12 - 2.5, cy - 14, 5, 28, "#fff", K, 1)  # bulón Ø12
h.rect(cx - 7, cy - rp2 - t - 30, 14, 30, "#fff", K, 1)  # pie del brazo hacia la calle
h.txt(cx - 14, cy - rp2 - 18, "BRAZO (*)", 9, 400, OR, "end")
h.dimH(cy + rp2 + 22, cx - rp2, cx + rp2, "Ø220", ext=cy + 6, dy=12)
h.txt(642, cy - 36, "PLANCHUELA", 9, 400, G); h.txt(642, cy - 25, "4,76 × 31,7", 9, 400, G)
h.txt(cx + 52, cy + 34, "BULON Ø12", 9, 400, G)

# ======================= D2 · CONEXION A LA RED (morsetos)
h.titulo(360, 466, "D2 - CONEXION A LA RED", "S/E - NO SE PELA: LOS MORSETOS PERFORAN LA AISLACION")
yP, yN = 540, 600
h.ln(372, yP, 610, yP, K, 4.5); h.ln(372, yP, 610, yP, "#fff", 2.6)
h.ln(372, yN, 610, yN, K, 6); h.ln(372, yN, 610, yN, "#fff", 4)
h.ln(372, yN + 8, 610, yN + 8, K, 6); h.ln(372, yN + 8, 610, yN + 8, "#fff", 4)
h.txt(484, yP - 7, "PILOTO 1×25 (FASE QUE ENCIENDE)", 9.5, 700)
h.txt(372, yN + 30, "PREENSAMBLADO: NEUTRO", 9.5, 700)
morseto2d(h, 450, yP, 1.0, True)
morseto2d(h, 545, yN, 1.0)
# derivaciones -> 3x1,5
h.path(f"M450,{yP+33} L450,{yP+44} Q450,{yP+50} 456,{yP+50} L590,{yP+50}", "none", K, 1)
h.path(f"M545,{yN+33} L545,{yN+40} Q545,{yN+44} 552,{yN+44} L590,{yN+44}", "none", K, 1)
h.path(f"M590,{yP+50} Q600,{yP+50} 600,{yN-10}", "none", K, 1)
h.globo("6", 462, yP - 26, 420, 492, r=9); h.globo("7", 540, yN - 40, 508, 574, r=9)
# corte del 3x1,5 (a la luminaria)
h.txt(632, 562, "3×1,5 F-N-T", 9.5, 700); h.txt(632, 574, "A LA LUMINARIA", 9, 400, G)
cx3, cy3, r3 = 690, 612, 17
h.circ(cx3, cy3, r3, "#fff", K, .9); h.circ(cx3, cy3, r3 * .86, "#fff", K, .4)
for i in range(3):
    a_ = math.radians(90 + 120 * i); x_ = cx3 + 7 * math.cos(a_); y_ = cy3 - 7 * math.sin(a_)
    h.circ(x_, y_, 5.5, "#fff", K, .5); h.circ(x_, y_, 3.4, "url(#cuH)", K, .3)
h.globo("9", cx3 + r3, cy3, 740, 600, r=9); h.globo("8", 450 + 13 + 7 * 1.0, yP + 15, 520, 496, r=9)
# D3 · jabalina y tomacable
h.titulo(762, 466, "D3", "S/E - TOMACABLE")
jx3 = 812
h.rect(778, 536, 70, 100, "url(#EARTH)", K, 0); h.ln(778, 536, 848, 536, K, 1.2)
h.rect(jx3 - 5, 556, 10, 80, "#fff", K, 1)
h.rect(jx3 - 10, 552, 20, 16, "#fff", K, 1.1); h.rect(jx3 + 10, 556, 6, 8, "#fff", K, .9)
h.path(f"M{jx3-34},540 Q{jx3-24},560 {jx3-10},560", "none", K, 1.6)
h.txt(jx3 + 18, 584, "Ø14,6", 9, 400, K, "start", MONO)
h.globo("11", jx3 + 10, 552, 840, 506, r=9)
h.dimV(774, 536, 556, "300 (*)", c=OR)

# ======================= CÓMPUTO
h.tabla(40, 672, [(170, "l", False), (82, "c", True), (292, "l", False)],
        [("POR UNIDAD (1 LUMINARIA)", "CANT.", "CALCULO (CALCULADORA DE BARRIO)"),
         ("BRAZO H°G° 2,13 m", "1 u", "1 por luminaria (brazo nuevo)"),
         ("ABRAZADERAS POR Ø", "2 u", "2 por brazo · Ø = perimetro ÷ 3,14"),
         ("BULONES + ARANDELAS", "4+4+4", "2 bulones por abrazadera, plana y presion"),
         ("MORSETO 1995/4 + NEOZED", "1 + 1", "fase: sobre el piloto"),
         ("MORSETO 1995/6", "1 u", "neutro: sobre la red"),
         ("BAJADA Cu 3×1,5", "4 m", "brazo 2,13 + colas (valor por defecto)"),
         ("PRECINTOS", "4 u", "ordenan la bajada en el brazo"),
         ("V/A 1×10", "9 m", "del brazo a la jabalina"),
         ("V/A 1×2,5", "3 m", "de la luminaria a la banderita"),
         ("CAÑO PVC 3/4\"", "3 m", "protege el V/A hasta 2,5 m"),
         ("FLEJE 3/4\" + HEBILLAS", "1,98 m + 2", "2 × (π × 0,220 + 0,30) = 2 × 0,99"),
         ("JABALINA + TOMACABLE", "1 + 1", "una por unidad (PAT completa)"),
         ("MEDICION DE PAT", "1", "≤ 10 Ω (ETG) · ≤ 40 Ω por apoyo (ET-1005)")],
        rowh=19, titulo="COMPUTO POR UNIDAD")
h.rayados(610, 672, [("EARTH", "TERRENO"), ("CONC", "H-15 (APOYO NUEVO)"), ("CONCP", "POSTE H°A° (CORTE)"), ("ANSI31", "ABRAZADERA (CORTE)"), ("AL", "ALUMINIO (RED)")], cols=1, dx=150)
h.txt(610, 832, "ITEMS LP 21478:", 10.5, 700); h.txt(610, 848, "1.28-1.36 · 1.43 · 1.44", 10.5, 400, K, "start", MONO)
h.txt(610, 866, "PAT COMPLETA: 1.34 / 1.35", 10.5, 400, K, "start", MONO)
h.notas(40, 988, [
    "COTAS EN mm. RED DE BARRIO EXISTENTE: PILOTO Al-Al 1×25 (IRAM 63002) ARRIBA, PREENSAMBLADO 2×16 O 3×25+1×16 (IRAM 2263).",
    "FASE: 1995/4 + NEOZED 2 A EN EL PILOTO (CON FOTOCONTROL, EN LA FASE). NEUTRO: 1995/6. LLAVE TUBO 13 AISLADA.",
    "ABRAZADERA POR Ø MEDIDO: ≤140 4001 · ≤200 4002 · ≤220 4004 · ≤240 4005 · ≤260 4006 · ≤300 4007 · MAS 4008.",
    "PAT: V/A 1×10 POR EL POSTE EN CAÑO PVC 3/4\" HASTA 2,5 m CON 2 FLEJES; JABALINA CON TOMACABLE AL PIE. MEDIR Y ANOTAR EN LA ORDEN.",
    "(*) FALTAN LAS HOJAS B A G: TIPO 1/2/3, ALTURAS DEL BRAZO, TENSOR Y RED, INCLINACION, Ø Y ESPESOR DEL CAÑO, FIJACION DEL BRAZO.",
    "(*) PAT COMPLETA (HOJAS F/G): DISTANCIA Y PROFUNDIDAD DE LA JABALINA, ALTURA DE LOS FLEJES. DIBUJADO COMO AP-TC-006.",
    "(*) APOYO NUEVO: EMPOTRAMIENTO 1,45 m CON H-15 EN HOYO Ø600 (0,85 DIRECTO, 1,35 MADERA) Y Ø300: VALORES DE LA CALCULADORA (ET 4).",
    "(*) LA FICHA DICE QUE HAY HOJAS A Y F Y TAMBIEN QUE FALTAN B A G: CORREGIR LA FICHA CUANDO LLEGUE EL PLANO."])

# ======================= 3D · ARRIBA
h.titulo(880, 74, "VISTA 3D - LA UNIDAD ARRIBA Y ABAJO", "IZQ.: BRAZO, RED Y MORSETOS · DER.: PIE DEL POSTE CON EL TERRENO CORTADO A UN CUARTO")
h.iso(.16, 1010, 1415)
posteZ(h, 5150, 7050, 0, 0, 120, 105)
roturaV(h, h.P(0, 0, 5150)[0], h.P(0, 0, 5150)[1], 16)
for z in (zT, zB): anilloZ(h, z - 16, 0, 0, 117, 32)
# V/A 1x10 bajando por el poste (cara +y)
cuerda(h, [(0, 150, 6000), (0, 125, 5800), (0, 125, 5150)], 9, "#5aa02c")
# tensor y brazo
ca, sa = math.cos(ang), math.sin(ang)
B0 = (120, 0, zB); B1 = (120 + 2130 * ca, 0, zB + 2130 * sa)
T1 = (120 + .42 * 2130 * ca, 0, zB + .42 * 2130 * sa)
tubo(h, (120, 0, zT), T1, 16, "url(#galv)")
tubo(h, B0, B1, 30, "url(#galv)", cap="#c9d1d8")
# luminaria
LX, LZ = B1[0], B1[2]
h.F3([(LX - 40, -150, LZ + 40), (LX + 560, -130, LZ + 10), (LX + 600, 0, LZ - 20), (LX + 560, 130, LZ + 10), (LX - 40, 150, LZ + 40)], "url(#lumi)", "#1f2328", .8)
h.F3([(LX + 40, -110, LZ - 25), (LX + 520, -95, LZ - 50), (LX + 520, 95, LZ - 50), (LX + 40, 110, LZ - 25)], "#f3f1d8", "#555", .6)
# bajada 3x1,5 y V/A 2,5 por el brazo
cuerda(h, [(260, 280, zN - 60), (220, 160, zB + 120), (260, 20, zB + 100), (B1[0] - 60, 20, B1[2] + 60)], 7, "#1c1c1c")
cuerda(h, [(B1[0] - 40, 25, B1[2] - 45), (160, 30, zB - 45), (60, 120, zB - 30)], 4, "#5aa02c")
for i in range(4):
    f = .2 + .2 * i; p = (120 + f * 2130 * ca, 0, zB + f * 2130 * sa)
    anilloZ(h, p[2] - 5, p[0], 0, 40, 10, "#111", "#000")
# red: ménsulas, piloto y preensamblado (a lo largo de la calle, eje y)
for z in (zP, zN):
    h.BOX(100, 260, -20, 20, z - 40, z + 20, "url(#galv)", "#8a96a0", "#a4afb8", "#333", .6)
cuerda(h, [(260, -650, zP - 30), (260, 950, zP - 30)], 14, "#1a1a1a")
cuerda(h, [(260, -650, zN - 40), (260, 950, zN - 40)], 20, "#222")
cuerda(h, [(260, -650, zN - 75), (260, 950, zN - 75)], 20, "#2e2e2e")
# morsetos (cuerpo negro + bulón galvanizado) y Neozed
def morseto3(y, z, fus):
    h.BOX(225, 300, y - 30, y + 30, z - 60, z + 40, "#3a3a3a", "#1d1d1d", "#2a2a2a", "#000", .5)
    tubo(h, (262, y, z + 40), (262, y, z + 90), 9, "url(#galv)", cap="#d0d6dc")
    if fus:
        h.BOX(300, 360, y - 22, y + 22, z - 55, z - 5, "#efe9d6", "#d8cfb4", "#cfc5a8", "#555", .5)
        x_, y_ = h.P(360, y, z - 30); h.circ(x_, y_, 3.4, "#d9b23a", "#444", .5)
morseto3(420, zP - 30, True)
morseto3(520, zN - 55, False)
# globos ARRIBA
GL = 902
h.g3("6", (300, 420, zP - 20), GL, 158, "1995/4 + NEOZED")
h.g3("7", (300, 520, zN - 55), GL, 196, "1995/6")
h.g3("18", (260, -560, zP - 30), GL, 120, "RED")
h.g3("9", (240, 120, zB + 130), GL, 234, "BAJADA 3×1,5")
h.g3("3", (0, 117, zB), GL, 272, "ABRAZADERA")
h.g3("12", (0, 125, 5300), GL, 310, "V/A 1×10")
h.g3("2", (120 + 1500 * ca, 0, zB + 1500 * sa + 30), 1185, 120, "BRAZO 2,13")
h.g3("1", (LX + 300, 0, LZ), 1185, 158, "LUMINARIA")
h.g3("14", (60, 120, zB - 30), GL, 348, "BANDERITA")

# ======================= 3D · ABAJO
h.iso(.13, 1500, 262)
suelo3d(h, 700, 700, 2000)
h.a(f'<clipPath id="cuarto"><polygon points="{hull(h, 700, 700, 2000)}"/></clipPath><g clip-path="url(#cuarto)">')
posteZ(h, -1450, 0, 0, 0, 300, 300, "url(#conc3)", "#555")      # fundación H-15
posteZ(h, -1450, 0, 0, 0, 150, 144)
h.a('</g>')
posteZ(h, 0, 1250, 0, 0, 144, 141)
roturaV(h, h.P(0, 0, 1250)[0], h.P(0, 0, 1250)[1], 22)
# caño PVC con el V/A, flejes
tubo(h, (165, 60, 1250), (165, 60, 0), 14, "url(#pvc)", "#777")
cuerda(h, [(165, 60, 0), (165, 60, -200), (400, 30, -300), (560, 0, -300)], 7, "#5aa02c")
for z in (300,):
    anilloZ(h, z, 0, 0, 160, 25, "url(#inox)", "#666")
# jabalina en la cara del corte
h.F3([(560, 0, -300), (560, 0, -1800)], "none", "#000", .1)
tubo(h, (560, 0, -1800), (560, 0, -300), 9, "url(#cobre)", "#5a3510")
h.BOX(530, 600, -25, 25, -330, -260, "url(#bronce)", "#9b6a22", "#b07a2a", "#4a3010", .6)
# globos ABAJO
GR = 1548
h.g3("15", (165, 60, 900), GR, 120, "CAÑO PVC")
h.g3("16", (160, 0, 312), GR, 158, "FLEJE")
h.g3("17", (-60, 0, 800), 1330, 120, "POSTE")
h.g3("11", (600, 0, -290), GR, 310, "TOMACABLE")
h.g3("10", (560, 0, -1200), GR, 400, "JABALINA")
h.g3("12", (400, 30, -300), GR, 234, "V/A 1×10")
h.txt(1310, 610, "H-15 SOLO EN APOYO NUEVO", 10.5, 400, G, "start", INT)

# ======================= LISTA DE MATERIALES
A_V = "A VINCULAR"
filas = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "LUMINARIA LED VIAL (LA PROVEE MUNICIPALIDAD / EPEC)", "1 u", "6010"),
         ("2", "BRAZO H°G° CON TENSOR, LARGO TOTAL 2,13 m (AP-TC-055 E)", "1 u", "4501"),
         ("3", "ABRAZADERA LISA H°G° POR Ø DEL POSTE (Ø220)", "2 u", "4004"),
         ("4", "BULON Ø12 × 90 CON TUERCA H°G°", "4 u", "4018"),
         ("5", "ARANDELA PLANA + DE PRESION 1/2\"", "4 + 4 u", "4014·4013"),
         ("6", "MORSETO FASE 1995/4 (PKD-14PF) SOBRE EL PILOTO", "1 u", "4026"),
         ("7", "MORSETO NEUTRO 1995/6 (PKD-14) SOBRE LA RED", "1 u", "4027"),
         ("8", "FUSIBLE NEOZED 2 A DEL MORSETO DE FASE", "1 u", "3018"),
         ("9", "CABLE Cu 3×1,5 F-N-T: BAJADA MORSETO → LUMINARIA", "4 m", "6001"),
         ("10", "JABALINA Cu-ACERO Ø14,6 × 1500 (IRAM 2309)", "1 u", "7015"),
         ("11", "TOMACABLE WGC / TGC", "1 u", "7019"),
         ("12", "CABLE Cu 1×10 V/A: DEL BRAZO A LA JABALINA", "9 m", "7010"),
         ("13", "CABLE Cu 1×2,5 V/A: DE LA LUMINARIA A LA BANDERITA", "3 m", "7008"),
         ("14", "TERMINAL BANDERITA (UNE EL 1×10 CON EL 2,5)", "1 u", "7018"),
         ("15", "CAÑO PVC 3/4\": PROTECCION DEL V/A HASTA 2,5 m", "3 m", "5006"),
         ("16", "FLEJE INOX 3/4\" (2 × 0,99 m) + HEBILLAS", "1,98 m + 2", "4024·4025"),
         ("17", "POSTE H°A° Po 8,5 m (EXISTENTE O APOYO NUEVO)", "SEGUN OBRA", "6501·6023"),
         ("18", "RED EXISTENTE: PILOTO 1×25 / PREENSAMBLADO", "-", "1501·1502·1503"),
         ("19", "PRECINTOS 250 × 4,5 PARA LA BAJADA", "4 u", "4030"),
         ("20", "VAR. MADERA: BULON MN 52 + ARAND. CUADRADA (EN LUGAR DE 3-5)", "2 + 2 u", "4016·4509"),
         ("21", "VAR. FOTOCONTROL + ZOCALO (ENCENDIDO SIN PILOTO)", "1 + 1 u", "3012·3072")]
h.tabla(880, 632, [(38, "c", False), (468, "l", False), (104, "c", True), (150, "c", False)], filas, rowh=17.6,
        titulo="LISTA DE MATERIALES (1 UNIDAD, POSTE H°A° EXISTENTE)")
h.rotulo(880, h.H - 150, 760, "AP-TC-055", "LUMINARIA AEREA DE BARRIO", "BRAZO, MORSETOS Y PAT", "RED AEREA - VISTA, DETALLES, COMPUTO Y 3D", "1:75 / 1:30", "A-A 1:10 · RESTO S/E", fecha="07/11/2026", proyecto="ALUMBRADO DE BARRIOS")
h.guardar("ap_tc_055.svg"); print("ok")
