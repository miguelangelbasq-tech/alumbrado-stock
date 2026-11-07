import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
from _taer import *
# DATOS: ficha AP-T-012 (2 juegos de semiabrazaderas de soporte de caja, elegidas por el Ø del poste en el punto de montaje)
#  4003 «Semiabrazadera para soporte de caja/tablero (plano N° 40100), se pide por diámetro del poste» · cant. 2 (calculadora)
#  ABRAZADERA_SOPORTE_RANGOS: ≤200 · 201–300 · 301–400 · 401–500 · 501–600 mm · gabinete 530×430×200 (3020/3058)
#  gabinete a 5 m o más, puerta al espacio verde · pliego 9.02: el gabinete viene con sus abrazaderas · Ø: perímetro ÷ 3,14
h = Hoja()
GW, GH, GD = 430, 530, 200
z1, z2 = 5100, 5430              # alturas de las 2 semiabrazaderas (*) (dentro del alto del gabinete)
SEP = 60                          # separación gabinete-poste (*)
BA = 40                           # ancho de la planchuela (*)
def dz(z): return d_poste(z)
# =================================================== VISTA FRONTAL
h.titulo(40, 62, "VISTA FRONTAL", "ESC. 1:7,5 - DESDE EL ESPACIO VERDE (PUERTA)")
k = 0.42; xc = 205; Y = lambda z: 128 + (5640 - z) * k
za, zb = 4880, 5640
h.path(f"M{xc-dz(za)/2*k},{Y(za)} L{xc-dz(zb)/2*k},{Y(zb)} M{xc+dz(za)/2*k},{Y(za)} L{xc+dz(zb)/2*k},{Y(zb)}", "none", K, 1.3)
corte_quiebre(h, xc - 60, xc + 60, Y(zb) - 2); corte_quiebre(h, xc - 60, xc + 60, Y(za) + 2)
h.ln(xc, Y(zb) - 12, xc, Y(za) + 12, K, .4, h.EJE)
gx0 = xc - GW / 2 * k; gz0 = 5000
gabinete_frente(h, gx0, Y(gz0 + GH), GW * k, GH * k)
for z in (z1, z2):          # semiabrazaderas detrás del gabinete (ocultas) y orejas a la vista
    rr = dz(z) / 2 * k + 3
    h.rect(xc - rr - 14, Y(z) - BA / 2 * k, 2 * rr + 28, BA * k, "none", K, .8, h.OCULTA)
h.dimH(Y(gz0 + GH) - 18, gx0, gx0 + GW * k, "430", ext=Y(gz0 + GH) - 4)
h.dimV(gx0 - 20, Y(gz0 + GH), Y(gz0), "530", ext=gx0 - 4)
h.dimV(gx0 + GW * k + 20, Y(z2), Y(z1), "(*)", ext=gx0 + GW * k + 4, c=OR)
xa = gx0 + GW * k + 34
h.ln(xa, Y(z2) - 8, xa, Y(z2) + 8, K, 1.8)
h.ln(gx0 - 44, Y(z2), gx0 - 30, Y(z2), K, .8, h.EJE); h.ln(gx0 - 44, Y(z2) - 8, gx0 - 44, Y(z2) + 8, K, 1.8); h.ln(gx0 + GW * k + 4, Y(z2), xa, Y(z2), K, .8, h.EJE)
h.txt(xa + 4, Y(z2) + 4, "A", 13, 700); h.txt(gx0 - 58, Y(z2) + 4, "A", 13, 700)
h.ln(xc, Y(zb) + 6, xc, Y(gz0 + GH) - 26, K, .8, h.EJE)
h.txt(xc - 16, Y(zb) - 2, "B", 13, 700)
h.txt(xc, Y(za) + 22, "PUERTA HACIA EL ESPACIO VERDE", 8.5, 700, K, "middle")
h.globo("2", gx0 + 20, Y(5450), gx0 - 10, 120); h.globo("1", xc + dz(4930) / 2 * k, Y(4930), 330, Y(4930) + 4)
h.globo("3", xc + 30, Y(z1), 330, Y(z1) + 30)
# =================================================== VISTA LATERAL (corte B-B)
h.titulo(350, 62, "CORTE B-B (LATERAL)", "ESC. 1:7,5 - POR EL EJE DEL POSTE")
xl = 436
h.path(f"M{xl-dz(za)/2*k},{Y(za)} L{xl-dz(zb)/2*k},{Y(zb)} H{xl+dz(zb)/2*k} L{xl+dz(za)/2*k},{Y(za)} Z", "url(#ANSI31)", K, 1.2)
e = 6 * k * 1.4
h.path(f"M{xl-dz(za)/2*k+e},{Y(za)} L{xl-dz(zb)/2*k+e},{Y(zb)} H{xl+dz(zb)/2*k-e} L{xl+dz(za)/2*k-e},{Y(za)} Z", "#fff", K, .5)
h.rect(xl - dz(zb) / 2 * k - 3, Y(zb) - 3, dz(zb) * k + 6, 3, "#fff", None, 0)
corte_quiebre(h, xl - 60, xl + 60, Y(zb) - 2); corte_quiebre(h, xl - 60, xl + 60, Y(za) + 2)
h.ln(xl, Y(zb) - 12, xl, Y(za) + 12, K, .4, h.EJE)
gxl = xl + dz(5300) / 2 * k + SEP * k
h.rect(gxl, Y(gz0 + GH), GD * k, GH * k, "#fff", K, 1.3)
h.rect(gxl + 3, Y(gz0 + GH) + 3, GD * k - 6, GH * k - 6, "none", K, .4)        # pared PRFV (*)
h.ln(gxl + GD * k, Y(gz0 + GH) + 10, gxl + GD * k, Y(gz0) - 10, K, 2)           # puerta
for z in (z1, z2):
    xr = xl + dz(z) / 2 * k
    # semiabrazadera en corte (dos ramas) + planchuela soporte hasta el gabinete
    h.rect(xl - dz(z) / 2 * k - 5, Y(z) - BA / 2 * k, 5, BA * k, K, K, 0)
    h.rect(xr, Y(z) - BA / 2 * k, 5, BA * k, K, K, 0)
    h.rect(xr + 5, Y(z) - 3, gxl - xr - 5, 6, "url(#ANSI31)", K, .8)
    h.ln(gxl - 16, Y(z), gxl + 14, Y(z), K, 2.2); h.rect(gxl + 6, Y(z) - 6, 4, 12, "#ddd", K, .5); h.rect(gxl + 10, Y(z) - 5, 6, 10, "#888", K, .5)
h.dimH(Y(gz0) + 22, gxl, gxl + GD * k, "200", ext=Y(gz0) + 4, dy=12)
h.dimH(Y(gz0 + GH) - 18, xl + dz(5570) / 2 * k, gxl, "(*)", ext=Y(gz0 + GH) - 4, c=OR)
h.dimV(gxl + GD * k + 22, Y(z2) - BA / 2 * k, Y(z2) + BA / 2 * k, "(*)", ext=gxl + GD * k + 4, c=OR)
h.txt(xl, Y(za) + 22, "Ø MEDIDO EN OBRA (*)", 8.5, 700, OR, "middle")
h.globo("3", xl + dz(z2) / 2 * k + 3, Y(z2) - 8, 500, 112); h.globo("4", gxl - 6, Y(z1) + 3, 530, Y(z1) + 46)
h.globo("5", gxl + 13, Y(z1) + 5, 575, Y(z1) + 46); h.globo("2", gxl + GD * k - 4, Y(5560), gxl + 40, 112)
# =================================================== CORTE A-A (planta por la abrazadera)
h.titulo(600, 62, "CORTE A-A (PLANTA)", "ESC. 1:5 - POR LA SEMIABRAZADERA DE ARRIBA")
kp = 0.5; cx, cy = 728, 200; R = dz(z2) / 2 * kp
h.circ(cx, cy, R, "url(#ANSI31)", K, 1.2); h.circ(cx, cy, R - 6 * kp * 1.4, "#fff", K, .5)
t = 5 * kp
h.path(f"M{cx-R-t},{cy} A{R+t},{R+t} 0 0 1 {cx+R+t},{cy} H{cx+R} A{R},{R} 0 0 0 {cx-R},{cy} Z", "#555", K, .6)       # contra (atrás)
h.path(f"M{cx-R-t},{cy} A{R+t},{R+t} 0 0 0 {cx+R+t},{cy} H{cx+R} A{R},{R} 0 0 1 {cx-R},{cy} Z", "#999", K, .6)       # de soporte (adelante)
for sx in (-1, 1):
    ex = cx + sx * (R + t)
    h.rect(min(ex, ex + sx * 26), cy - 5, 26, 4, "#555", K, .6); h.rect(min(ex, ex + sx * 26), cy + 1, 26, 4, "#999", K, .6)
    bx = ex + sx * 15; h.ln(bx, cy - 16, bx, cy + 16, K, 2.4); h.rect(bx - 6, cy - 13, 12, 4, "#ccc", K, .5); h.rect(bx - 5, cy + 9, 10, 6, "#888", K, .5)
# planchuela de soporte hacia el gabinete (+y = abajo en la planta)
gy = cy + R + SEP * kp
h.rect(cx - 30, cy + R + t, 60, gy - cy - R - t, "url(#ANSI31)", K, .8)
h.rect(cx - GW / 2 * kp, gy, GW * kp, GD * kp, "#fff", K, 1.3); h.rect(cx - GW / 2 * kp + 3, gy + 3, GW * kp - 6, GD * kp - 6, "none", K, .4)
for bx in (cx - 18, cx + 18):
    h.ln(bx, gy - 10, bx, gy + 14, K, 2); h.rect(bx - 5, gy + 4, 10, 4, "#ddd", K, .5); h.rect(bx - 4, gy + 8, 8, 6, "#888", K, .5)
h.ln(cx - GW / 2 * kp + 6, gy + GD * kp, cx + GW / 2 * kp - 6, gy + GD * kp, K, 2.2)
h.txt(cx, gy + GD * kp + 16, "PUERTA ↓ ESPACIO VERDE", 8.5, 700, K, "middle")
h.ln(cx, cy - R - 30, cx, gy + GD * kp + 4, K, .4, h.EJE); h.ln(cx - R - 60, cy, cx + R + 60, cy, K, .4, h.EJE)
h.dimH(cy - R - 22, cx - R, cx + R, "Ø (*)", ext=cy - 4, c=OR)
h.dimH(gy + GD * kp + 32, cx - GW / 2 * kp, cx + GW / 2 * kp, "430", ext=gy + GD * kp + 4, dy=12)
h.dimV(cx + GW / 2 * kp + 18, gy, gy + GD * kp, "200", ext=cx + GW / 2 * kp + 4)
h.dimV(cx + 52, cy + R, gy, "(*)", ext=cx + 32, c=OR)
h.globo("3", cx - R * .7, cy + R * .75, 640, 290); h.globo("6", cx - R * .6, cy - R * .8, 640, 120)
h.globo("7", cx + R + t + 15, cy - 14, 812, 130); h.globo("4", cx + 24, cy + R + 12, 812, 310)
# =================================================== D1 SEMIABRAZADERA
h.titulo(40, 494, "D1 - SEMIABRAZADERA DE SOPORTE", "S/E - PLANO N° 40100: FORMA Y MEDIDAS (*)")
dx, dy_ = 170, 600; r1 = 62
h.path(f"M{dx-r1-6},{dy_} A{r1+6},{r1+6} 0 0 0 {dx+r1+6},{dy_} H{dx+r1} A{r1},{r1} 0 0 1 {dx-r1},{dy_} Z", "url(#galv)", K, 1)
for sx in (-1, 1):
    ex = dx + sx * (r1 + 6); h.rect(min(ex, ex + sx * 40), dy_ - 6, 40, 6, "url(#galv)", K, .9)
    h.circ(ex + sx * 22, dy_ - 3, 4, "#fff", K, .6)
h.rect(dx - 34, dy_ + r1 + 6, 68, 50, "url(#galv)", K, .9)
for bx in (dx - 18, dx + 18): h.circ(bx, dy_ + r1 + 34, 5, "#fff", K, .7)
h.dimH(dy_ - 26, dx - r1, dx + r1, "Ø INT. = RANGO DE LA TABLA", ext=dy_ - 8)
h.dimH(dy_ + r1 + 72, dx - 34, dx + 34, "(*)", ext=dy_ + r1 + 58, c=OR, dy=12)
h.dimV(dx + 52, dy_ + r1 + 6, dy_ + r1 + 56, "(*)", ext=dx + 38, c=OR)
h.txt(dx + 64, dy_ + 10, "OREJA + BULON", 8.5, 700); h.txt(dx + 64, dy_ + 21, "CON LA CONTRA", 8.5, 400, G)
h.txt(dx - 30, dy_ + r1 + 92, "PLANCHUELA AL GABINETE", 8.5, 700)
h.txt(46, dy_ + r1 + 108, "ACERO GALVANIZADO EN CALIENTE (*)", 8.5, 400, OR)
# =================================================== D2 ANCLAJE AL GABINETE
h.titulo(345, 494, "D2 - BULON AL GABINETE", "ESC. 1:1 - ARANDELA PLANA + DE PRESION")
bx0, by0 = 450, 610
h.rect(bx0 - 60, by0 - 6, 60, 12, "url(#ANSI31)", K, .9)                     # planchuela
h.rect(bx0, by0 - 50, 8, 100, "url(#FOAM)", K, 1); h.txt(bx0 + 4, by0 - 58, "PARED PRFV (*)", 8.5, 700, OR, "middle")
h.rect(bx0 - 78, by0 - 9, 10, 18, "#bbb", K, .6)                              # cabeza
h.rect(bx0 - 68, by0 - 3.5, 108, 7, "#e3e3e3", K, .6)                         # vástago
for xx in range(int(bx0 + 12), int(bx0 + 38), 3): h.ln(xx, by0 - 3.5, xx + 1.5, by0 + 3.5, K, .35)
h.rect(bx0 + 8, by0 - 14, 3, 28, "#ddd", K, .5); h.rect(bx0 + 11, by0 - 11, 3, 22, "#999", K, .5); h.rect(bx0 + 14, by0 - 10, 10, 20, "#888", K, .6)
h.globo("8", bx0 - 72, by0 - 9, bx0 - 90, by0 - 48); h.globo("9", bx0 + 9, by0 + 14, bx0 + 40, by0 + 50); h.globo("10", bx0 + 19, by0 - 10, bx0 + 60, by0 - 36)
h.txt(340, by0 + 80, "EL GABINETE DEL PLIEGO 9.02 TRAE SUS ABRAZADERAS:", 8.5, 700)
h.txt(340, by0 + 92, "CONTROLAR EL REMITO ANTES DE PEDIRLAS APARTE.", 8.5, 400)
# =================================================== RANGOS + COMO MEDIR
rg = [("RANGO", "Ø DEL POSTE", "SE PIDE"), ("1", "HASTA 200 mm", "4003 · ≤ 200"), ("2", "201 A 300 mm", "4003 · 201-300"), ("3", "301 A 400 mm", "4003 · 301-400"),
      ("4", "401 A 500 mm", "4003 · 401-500"), ("5", "501 A 600 mm", "4003 · 501-600")]
h.tabla(600, 494, [(46, "c", False), (100, "c", False), (94, "c", False)], rg, rowh=18, titulo="RANGOS (CALCULADORA)")
h.titulo(600, 640, "D3 - COMO SE MIDE EL Ø", "EN EL PUNTO DE MONTAJE")
mx, my = 650, 712
h.a(f'<ellipse cx="{mx}" cy="{my}" rx="44" ry="13" fill="#fff" stroke="#111" stroke-width="1"/>')
h.path(f"M{mx-44},{my} V{my+40} M{mx+44},{my} V{my+40}", "none", K, 1)
h.a(f'<ellipse cx="{mx}" cy="{my+18}" rx="45.5" ry="13.5" fill="none" stroke="#c2410c" stroke-width="3"/>')
h.txt(mx + 54, my + 4, "CINTA: PERIMETRO P", 9, 700); h.txt(mx + 54, my + 18, "Ø = P ÷ 3,14", 10.5, 700, K, "start", MONO)
h.txt(mx + 54, my + 32, "EJ.: 565 ÷ 3,14 = 180", 9, 400, G, "start", MONO); h.txt(mx + 54, my + 44, "→ RANGO 1 (≤ 200)", 9, 400, G, "start", MONO)
# =================================================== COMPUTO
rows = [("SEMIABRAZADERA DE SOPORTE", "2", "1 ARRIBA + 1 ABAJO"), ("CONTRA (CIERRE ATRAS)", "2 (*)", "SEGUN PLANO 40100: CONFIRMAR"),
        ("BULONES DE LAS OREJAS", "4 (*)", "2 POR JUEGO"), ("BULONES AL GABINETE", "4 (*)", "2 POR PLANCHUELA"),
        ("ARANDELA PLANA + PRESION", "8 + 8 (*)", "1 + 1 POR BULON"), ("MEDIDA", "1 RANGO", "Ø = PERIMETRO ÷ 3,14 A ESA ALTURA")]
h.tabla(40, 820, [(170, "l", False), (70, "c", True), (250, "l", False)], [("CONCEPTO", "CANT.", "CALCULO")] + rows, rowh=17,
        titulo="COMPUTO POR TABLERO (2 JUEGOS)", colores=lambda i, j, t: OR if "(*)" in t else K)
h.rayados(560, 820, [("ANSI31", "PRFV / ACERO (CORTE)"), ("FOAM", "PARED GABINETE")], cols=1, dx=140)
h.txt(560, 912, "VARIANTE: POSTE H°A° EXISTENTE", 11, 700); h.ln(560, 916, 780, 916, K, .8)
h.txt(560, 932, "MISMA SEMIABRAZADERA, MEDIDA POR EL Ø DEL H°A°;", 8.5, 400)
h.txt(560, 944, "LLEVA ADEMAS CAÑO DE BAJADA CON FLEJE (AP-T-018).", 8.5, 400)
# =================================================== NOTAS
h.notas(40, 1000, [
    "COTAS EN mm. GABINETE PRFV 530 x 430 x 200 (3020 / TABLERO 3058) A 5 m O MAS DEL PISO, PUERTA HACIA EL ESPACIO VERDE.",
    "2 JUEGOS DE SEMIABRAZADERAS DE SOPORTE DE CAJA (4003), ELEGIDAS POR EL Ø DEL POSTE A LA ALTURA DE MONTAJE (TABLA).",
    "EL Ø DEL APOYO PRFV NO ESTA PUBLICADO: SE MIDE EL PERIMETRO CON CINTA Y SE DIVIDE POR 3,14 (D3).",
    "EL PLIEGO 9.02 PIDE EL GABINETE CON SUS ABRAZADERAS INCLUIDAS: SI VIENEN, LA LINEA 4003 NO SE PIDE.",
    "(*) A CONFIRMAR CON EL PLANO 40100: FORMA, PLANCHUELA, BULONES, CONTRA, SEPARACION ENTRE JUEGOS Y AL POSTE.",
    "(*) EL FOTOCONTROL VA EN EL MISMO APOYO CON SU PROPIO JUEGO DE SEMIABRAZADERAS (ETG): NO SE DIBUJA ACA."])
# =================================================== 3D
h.titulo(890, 62, "VISTA 3D - GABINETE ABROCHADO AL APOYO", "GABINETE TRANSPARENTADO; LA SEMIABRAZADERA DE ABAJO ABIERTA (CONTRA SEPARADA) PARA VER COMO CIERRA")
h.iso(.42, 1225, 2580)
zA, zB = 4760, 5720
pole3d(h, 0, 0, zA, zB)
gy0 = dz(5300) / 2 + SEP
def semi3d(z, abierta=False):
    r = dz(z) / 2
    # contra (atrás): si está abierta se corre hacia -y
    off = -260 if abierta else 0
    p = h.P(0, off, z); rx = (r + 5) * h._s * 1.04; ry = rx * .5
    d = f"M{p[0]-rx:.1f},{p[1]:.1f} A{rx:.1f},{ry:.1f} 0 0 1 {p[0]+rx:.1f},{p[1]:.1f}"
    h.path(d, "none", "#4a5560", 7.5); h.path(d, "none", "#cfd8df", 5.5)
    for sx in (-1, 1):
        h.BOX(sx * (r + 5) + (0 if sx > 0 else -40), sx * (r + 5) + (40 if sx > 0 else 0), off - 6, off, z - BA / 2, z + BA / 2, "#dfe6ec", "#aab6c0", "#7f8b96", "#4a5560", .5)
    return r
for z, ab in ((z1, True), (z2, False)):
    r = semi3d(z, ab)
    # de soporte (adelante, +y) y planchuela al gabinete
    anillo3d(h, 0, 0, z, r + 2, 5.5)
    for sx in (-1, 1):
        h.BOX(sx * (r + 5) + (0 if sx > 0 else -40), sx * (r + 5) + (40 if sx > 0 else 0), 0, 6, z - BA / 2, z + BA / 2, "#dfe6ec", "#aab6c0", "#7f8b96", "#4a5560", .5)
        bx = sx * (r + 5 + 20)
        if not ab: h.tuboZ(z + BA / 2, z + BA / 2 + 16, bx, 3, 5, 5, "url(#galv)", "#333")
    h.BOX(-30, 30, r, gy0, z - 4, z + 4, "#dfe6ec", "#aab6c0", "#7f8b96", "#4a5560", .6)
h.BOX(-GW / 2, GW / 2, gy0, gy0 + GD, 5000, 5000 + GH, GAB_T, GAB_S, GAB_E, "#6f7269", .9, .55)
h.F3([(-GW / 2 + 25, gy0 + GD + 1, 5025), (GW / 2 - 25, gy0 + GD + 1, 5025), (GW / 2 - 25, gy0 + GD + 1, 5505), (-GW / 2 + 25, gy0 + GD + 1, 5505)], "none", "#8c8f86", .7)
p = h.P(0, gy0 + GD + 1, 5330); a_ = 22
h.path(f"M{p[0]},{p[1]-a_} l{a_*.9},{a_*1.5} h-{a_*1.8} z", "#f2c500", "#222", .8)
h.path(f"M{p[0]+3},{p[1]-a_*.4} l-6,10 h6 l-5,10", "none", "#111", 1.4)
# bulones sueltos de la abrazadera abierta
for sx in (-1, 1):
    bx = sx * (dz(z1) / 2 + 25); h.tuboZ(z1 + 60, z1 + 110, bx, -130, 5, 5, "url(#galv)", "#333")
h.txt(918, 520, "Ø DEL POSTE: MEDIDO EN OBRA (*)", 10, 700, OR)
GX = 1468
h.g3("1", (0, -dz(5650) / 2, 5650), GX, 120, "APOYO PRFV (Ø MEDIDO)")
h.g3("7", (dz(z2) / 2 + 25, 3, z2 + BA / 2 + 16), GX, 170, "BULON DE LA OREJA")
h.g3("3", (0, dz(z2) / 2 + 2, z2 - 8), GX, 220, "SEMIABRAZ. DE SOPORTE")
h.g3("4", (0, gy0 - 30, z2), GX, 270, "PLANCHUELA AL GABINETE")
h.g3("2", (GW / 2, gy0 + 120, 5400), GX, 320, "GABINETE 530x430x200")
h.g3("6", (0, -260 - dz(z1) / 2, z1), GX, 370, "CONTRA (ABIERTA)")
h.g3("11", (0, gy0 + GD, 5330), GX, 420, "SEÑAL RIESGO ELECTRICO")
# =================================================== LISTA
L = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
     ("1", "APOYO PRFV hl 8 m (AP-T-018) - NO SE COMPUTA ACA", "-", "6015"),
     ("2", "TABLERO EN GABINETE PRFV 530x430x200 IP66", "1", "3058 / 3020"),
     ("3", "SEMIABRAZADERA DE SOPORTE DE CAJA (PLANO 40100), POR RANGO", "2", "4003"),
     ("4", "PLANCHUELA DE SOPORTE AL GABINETE (*)", "2", "CON LA 4003 (*)"),
     ("5", "BULON AL GABINETE CON TUERCA (*)", "4", "A VINCULAR"),
     ("6", "CONTRA DE LA SEMIABRAZADERA (*)", "2", "CON LA 4003 (*)"),
     ("7", "BULON DE LAS OREJAS CON TUERCA (*)", "4", "A VINCULAR"),
     ("8", "CABEZA DEL BULON (VER D2)", "-", "-"),
     ("9", "ARANDELA PLANA 1/2\"", "8 (*)", "4014"),
     ("10", "ARANDELA DE PRESION 1/2\"", "8 (*)", "4013"),
     ("11", "SEÑAL «RIESGO ELECTRICO» EN LA PUERTA", "1", "CON EL TABLERO")]
h.tabla(890, 580, [(40, "c", False), (470, "l", False), (90, "c", True), (150, "c", False)], L, rowh=22, titulo="LISTA DE MATERIALES (1 TABLERO)",
        colores=lambda i, j, t: OR if ("(*)" in t or t == "A VINCULAR") else K)
h.rotulo(890, h.H - 150, 750, "AP-T-012", "SUJECION DEL TABLERO", "AEREO AL APOYO", "VISTAS, PLANTA, SEMIABRAZADERA, RANGOS Y 3D", "1:7,5 / 1:5", "D2 1:1, 3D S/E", fecha="07/11/2026")
h.guardar("ap_t_012.svg"); print("ok")
