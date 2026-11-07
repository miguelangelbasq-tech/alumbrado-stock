import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
import pat_comun as pc

h = Hoja(); pc.defs(h)

# ================= ELEVACIÓN GENERAL · k = 0.05 (1:120)
k = 0.05; cx = 160; Y0 = 520
yz = lambda z: Y0 - z * k
h.titulo(40, 62, "ELEVACION GENERAL", "ESC. 1:120 - COLUMNA METALICA 7 m")
h.rect(40, Y0, 250, 1850 * k + 4, "url(#EARTH)", K, 0)
h.rect(cx - 15, Y0, 30, 900 * k, "url(#CONC)", K, 1)
for z0, z1, w in ((-700, 2800, 5.7), (2800, 5200, 4.6), (5200, 7000, 3.6)):
    h.rect(cx - w / 2, yz(z1), w, (z1 - z0) * k, "#fff", K, 1)
h.path(f"M{cx},{yz(7000)} q2,-8 {425*k},-8", "none", K, 1.4)
h.rect(cx + 425 * k - 2, yz(7000) - 12, 22, 6, "#fff", K, 1)
h.txt(cx + 46, yz(7000) - 12, "LED", 9.5, 700)
# acometida aérea (de la red) que entra por la pipeta (*)
zp = 6400
h.path(f"M44,{yz(zp)-26} Q{cx-60},{yz(zp)-4} {cx-6},{yz(zp)}", "none", K, 1.3)
h.path(f"M{cx-3},{yz(zp)} q-5,-4 -6,-10", "none", K, 1.8)
h.txt(44, yz(zp) + 4, "ACOMETIDA", 9.5, 700); h.txt(44, yz(zp) + 16, "AEREA (AP-T-019)", 9.5, 700)
h.txt(cx - 10, yz(zp) - 12, "PIPETA (*)", 9, 400, OR, "end")
# 2,5 V/A del artefacto (*) por afuera hasta la banderita
h.path(f"M{cx+3.2},{yz(6950)} V{yz(60)}", "none", OR, 1, 'stroke-dasharray="4 2"')
# torta, bloquete + banderita, cable 10 a la jabalina
h.path(f"M{cx-14},{Y0} L{cx-11},{Y0-5} L{cx+11},{Y0-5} L{cx+14},{Y0} Z", "url(#CONCP)", K, .6)
h.rect(cx + 2.9, Y0 - 4, 3, 3, K, K, .3)
XJ = cx + 1000 * k
h.path(f"M{cx+5},{Y0-2} H{cx+23} V{yz(-300)} H{XJ}", "none", K, 1.3)
pc.jabalinaCAD(h, XJ, yz(-300), yz(-1800), 3, 6)
h.rect(XJ - 3, yz(-300) - 3, 6, 6, K, K, .3)
h.ln(40, Y0, 290, Y0, K, 1.6)
h.dimV(cx - 34, yz(7000), Y0, "7000 ALTURA LIBRE", ext=cx - 4)
h.dimV(cx - 34, Y0, yz(-700), "700", ext=cx - 4)
h.dimH(yz(7000) - 24, cx, cx + 425 * k, "425", ext=yz(7000) - 10)
h.dimH(yz(-1800) + 4, cx, XJ, "1000 (*)", c=OR, dy=12)
h.rect(cx - 30, yz(900), 140, (900 + 1850) * k, "none", K, .7, 'stroke-dasharray="6 3"')
h.txt(cx + 40, yz(900) + 14, "VER CORTE A-A", 9.5, 700)
h.txt(cx + 8, yz(3600), "1x2,5 V/A DEL", 9, 400, OR); h.txt(cx + 8, yz(3600) + 11, "ARTEFACTO (*)", 9, 400, OR)

# ================= CORTE A-A por la banderita, el caño y la jabalina · k = 0.18 (1:110)
k2 = 0.18; c2 = 372; Y2 = 282
y2 = lambda z: Y2 - z * k2
X2 = lambda d: c2 + d * k2
h.titulo(318, 62, "CORTE A-A - BASE (POR LA BANDERITA)", "ESC. 1:110 - COTAS EN mm")
ZT, ZB = 900, -1850
h.rect(318, Y2, 278, y2(ZB) - Y2, "url(#EARTH)", K, 0)
h.path(f"M{X2(-300)},{Y2} V{y2(-900)} H{X2(300)} V{Y2} Z", "url(#CONC)", K, 1.5)
cL, cR = X2(-57), X2(57)
h.rect(cL, y2(ZT), cR - cL, y2(-700) - y2(ZT), "#fff", "none", 0)
for xx in (cL, cR - 1.4): h.rect(xx, y2(ZT), 1.4, y2(-700) - y2(ZT), K, K, .3)
h.ln(cL, y2(-700), cR, y2(-700), K, 1)
h.ln(c2, y2(ZT) - 8, c2, y2(-700) + 8, K, .4, h.EJE)
pc.corteDoble(h, c2, y2(ZT), 7)
# torta (*) cortada
h.path(f"M{X2(-260)},{Y2} L{X2(-230)},{y2(110)} L{cL},{y2(110)} V{Y2} Z M{cR},{Y2} V{y2(110)} L{X2(230)},{y2(110)} L{X2(260)},{Y2} Z", "url(#CONCP)", K, .9)
# bloquete (sobre el piso, dentro de la torta) + banderita
zb = 55
h.rect(cR, y2(zb) - 2.5, 50 * k2, 5, "url(#ANSI31)", K, .8)
xbd = cR + 50 * k2
h.rect(xbd, y2(zb) - 4, 1.6, 22, "#fff", K, .8)
h.rect(xbd + 1.6, y2(zb) - 2, 3, 4, "#fff", K, .7)
# cable 10 V/A: banderita → baja al costado de la fundación por el caño 1" → jabalina
xc = X2(380); XJ2 = X2(1000); zj = -300
h.rect(xc - 2.6, Y2 - 2, 5.2, y2(zj) - Y2 + 2, "#fff", K, .7)
h.rect(xc, y2(zj) - 2.6, XJ2 - 4 - xc, 5.2, "#fff", K, .7)
pc.cableVA(h, f"M{xbd+1},{y2(zb)+18} V{y2(10)} H{xc} V{y2(zj)} H{XJ2-3}", 2, False)
# 2,5 V/A del artefacto (*) por afuera de la columna hasta la banderita
h.path(f"M{cR+3},{y2(ZT)} V{y2(zb)-12} Q{cR+3},{y2(zb)+8} {xbd+.6},{y2(zb)+16}", "none", OR, 1.2, 'stroke-dasharray="4 2"')
pc.jabalinaCAD(h, XJ2, y2(zj), y2(-1800), 3.2, 7)
h.rect(XJ2 - 6, y2(zj) - 5, 12, 10, "url(#ANSI31)", K, .9)
h.path(f"M318,{Y2} H{X2(-300)} M{X2(300)},{Y2} H596", "none", K, 1.8)
h.nivel(330, Y2, "±0,00")
h.dimV(334, Y2, y2(-900), "900", ext=X2(-300) - 2)
h.dimV(352, Y2, y2(-700), "700", ext=cL - 2)
h.dimH(y2(-900) + 16, X2(-300), X2(300), "600", ext=y2(-900) + 2, dy=13)
h.txt(cL - 4, y2(ZT) + 40, "Ø114", 10, 400, K, "end")
h.dimH(y2(-1800) - 2, c2, XJ2, "1000 (*)", c=OR, dy=-5)
h.dimV(XJ2 + 18, Y2, y2(zj), "300 (*)", ext=XJ2 + 6, c=OR); h.dimV(XJ2 + 18, y2(zj), y2(-1800), "1500", ext=XJ2 + 3)
h.dimH(y2(-700), c2, xc, "380 (*)", ext=y2(zj) + 4, c=OR, dy=12)
h.llamadaDet(xbd, y2(zb) + 4, 16, "D1")
gx = 620
for n, ax, ay, gy in (("7", cR + 3, y2(600), 120), ("8", cL + 1, y2(450), 165), ("10", X2(180), y2(60), 210), ("6", cR + 4, y2(zb), 245),
                      ("5", xbd + 1, y2(zb) + 14, 280), ("4", xc + 2, y2(-150), 330), ("3", X2(700), y2(zj), 365),
                      ("2", XJ2 + 6, y2(zj), 400), ("9", X2(240), y2(-600), 440), ("1", XJ2 + 1, y2(-1200), 520)):
    h.globo(n, ax, ay, gx, gy, K, 10)

# ================= D1 · BANDERITA CON LOS DOS CABLES
h.titulo(648, 62, "D1 - BANDERITA", "S/E - VISTA DE FRENTE Y CORTE B-B")
bx, by = 708, 172
h.circ(bx, by, 26, "none", K, .6, h.OCULTA)
pc.cableVA(h, f"M{bx-11},{396} V{by+122}", 24, False)
pc.cableVA(h, f"M{bx+17},{396} V{by+122}", 13, False)
h.path(f"M{bx-30},{by+126} V{by+64} L{bx-38},{by+24} A40,40 0 1,1 {bx+38},{by+24} L{bx+30},{by+64} V{by+126} Z", "#fff", K, 1.1)
h.circ(bx, by, 29.2 * .62, "#fff", K, .8)
pc.cuPelado(h, bx - 11, by + 70, bx - 11, by + 124, 16, False)
pc.cuPelado(h, bx + 17, by + 82, bx + 17, by + 124, 8, False, 3)
for yy in (by + 86, by + 104): h.ln(bx - 30, yy, bx + 30, yy, K, 1.6)
pc.hexCab(h, bx, by, 14, "#fff"); h.circ(bx, by, 6, "url(#ROSCA)", K, .6)
h.dimH(by - 50, bx - 29.2 * .62, bx + 29.2 * .62, "OJAL Ø14,6", ext=by - 20, dy=-5)
pc.corteMarca(h, bx - 52, by + 95, bx + 52, by + 95, "B", 1)
h.txt(bx + 46, by + 2, 'BULON', 9.5); h.txt(bx + 46, by + 14, '1/2" (*)', 9.5, 400, OR)
h.globo("6", bx - 30, by - 4, 662, by - 26, K, 9); h.globo("5", bx - 26, by + 74, 664, by + 74, K, 9)
h.globo("3", bx - 11, by + 190, 664, by + 200, K, 9); h.globo("7", bx + 17, by + 190, 752, by + 214, K, 9)
sx, sy = 795, 262
h.txt(sx, 232, "CORTE B-B", 10.5, 700, K, "middle"); h.ln(sx - 26, 236, sx + 26, 236, K, .8)
h.a(f'<ellipse cx="{sx}" cy="{sy+20}" rx="34" ry="22" fill="url(#ANSI31)" stroke="{K}" stroke-width="1"/>')
h.a(f'<ellipse cx="{sx}" cy="{sy+20}" rx="28" ry="16" fill="#fff" stroke="{K}" stroke-width=".7"/>')
pc.cuerda(h, sx - 9, sy + 20, 14, False); pc.cuerda(h, sx + 15, sy + 20, 6.5, False)
h.txt(sx, sy + 56, "10 + 2,5 mm²", 9.5, 700, K, "middle"); h.txt(sx, sy + 68, "JUNTOS EN EL", 9.5, 400, K, "middle")
h.txt(sx, sy + 80, "MISMO TERMINAL", 9.5, 400, K, "middle"); h.txt(sx, sy + 92, "(AP-TC-006)", 9.5, 400, G, "middle")

# ================= VARIANTE ETG 14.4: dos bloquetes
h.titulo(648, 430, "VARIANTE ETG", "S/E - 2 BLOQUETES (ETG 14.4)")
vx = 700
h.rect(vx - 5, 460, 10, 150, "#fff", K, 1); h.ln(650, 600, 760, 600, K, 1.4)
h.path(f"M{vx},{460} q2,-8 26,-8", "none", K, 1.2); h.rect(vx + 24, 448, 14, 5, "#fff", K, .9)
h.path(f"M{vx-5},{478} q-7,-4 -8,-10", "none", K, 1.6)
for yy, t in ((486, "SUP.: 1x2,5 V/A"), (586, "INF.: 1x10 V/A")):
    h.rect(vx + 5, yy - 3, 6, 6, "url(#ANSI31)", K, .8); h.rect(vx + 11, yy - 4, 2, 10, "#fff", K, .7)
    h.txt(vx + 22, yy + 4, t, 9.5)
h.path(f"M{vx-9},{470} Q{vx-14},{486} {vx+11},{491}", "none", K, 1.1, 'stroke-dasharray="3 2"')
h.ln(vx + 12, 592, vx + 12, 612, K, 1.6)
h.txt(vx + 22, 510, "DEL ARTEFACTO,", 9, 400, G); h.txt(vx + 22, 521, "POR LA PIPETA", 9, 400, G)
h.txt(vx + 22, 548, "LA COLUMNA HACE", 9, 400, G); h.txt(vx + 22, 559, "DE CONDUCTOR", 9, 400, G)
h.globo("12", vx + 8, 486, 664, 500, K, 10)

# ================= PLANTA · k = 0.1 (1:60)
h.titulo(40, 652, "PLANTA", "ESC. 1:60")
kp = 0.1; pcx, pcy = 100, 730; pj = pcx + 1000 * kp
h.rect(pcx - 30, pcy - 30, 60, 60, "url(#CONC)", K, 1.2)
h.circ(pcx, pcy, 26, "url(#CONCP)", K, .7)
h.circ(pcx, pcy, 5.7, "#fff", K, 1.1)
h.rect(pcx + 5.7, pcy - 1.5, 5, 3, "url(#ANSI31)", K, .6)
h.path(f"M{pcx+11},{pcy} H{pj-4}", "none", K, 1.2, 'stroke-dasharray="5 2"')
h.circ(pcx + 38, pcy, 2.6, "#fff", K, .7); h.circ(pj, pcy, 2.4, K, K, .3); h.rect(pj - 5, pcy - 4, 10, 8, "none", K, .7)
pc.corteMarca(h, pcx - 52, pcy, pj + 30, pcy, "A", -1)
h.dimH(pcy + 46, pcx, pj, "1000 (*)", ext=pcy + 8, c=OR, dy=12)
h.txt(pcx + 48, pcy - 12, "1x10 V/A", 9.5, 700); h.txt(pcx - 34, pcy - 40, "TORTA (*)", 9.5, 400, OR)
h.txt(pcx + 40, pcy - 40, "ACOMETIDA AEREA: ARRIBA", 9, 400, G)

# ================= CÓMPUTO + RAYADOS
h.tabla(258, 652, [(122, "l", False), (54, "c", True), (106, "l", False)],
        [("CONCEPTO", "CANT.", "CALCULO"), ("JABALINA", "1 u", "1 POR COLUMNA"), ("TOMACABLE", "1 u", "1 POR JABALINA"),
         ("CABLE 1x10 V/A", "4 m", "64 m / 16 PAT"), ('CAÑO PVC 1"', "2 m", "AP-TC-005"), ("BANDERITA", "1 u", "10 + 2,5 JUNTOS"),
         ("BLOQUETE", "1 u", "1 POR COLUMNA"), ("CABLE 1x2,5 V/A (*)", "(*)", "SEGUN ALTURA"), ("TORTA (*)", "1 u", "1 POR COLUMNA"),
         ("MEDICION DE PAT", "1", "ITEM 81")], rowh=19, titulo="COMPUTO POR COLUMNA",
        colores=lambda i, j, t: OR if "(*)" in t else K)
h.rayados(572, 652, [("CONC", "HORMIGON H-13"), ("EARTH", "TERRENO NATURAL"), ("CONCP", "TORTA (*)"), ("ANSI31", "BRONCE / ACERO")], cols=1)

h.notas(40, 878, [
    "COTAS EN mm. NOTA DEL AP-TC-006: EN EL TERMINAL BANDERITA SE APRISIONAN JUNTOS EL 1x10 DE LA JABALINA Y EL 1x2,5 DEL ARTEFACTO LED.",
    "BLOQUETE DE BRONCE SOLDADO EN TODO SU PERIMETRO, SOBRE EL PISO Y TAPADO CON LA TORTA (ETG 14.3). DETALLE EN AP-C-006.",
    "VARIANTE ETG 14.4 (COLUMNA NUEVA CON ACOMETIDA AEREA): 2 BLOQUETES; EL 2,5 SALE POR LA PIPETA AL SUPERIOR Y EL 10 VA AL INFERIOR.",
    "1 JABALINA POR COLUMNA METALICA; TOMACABLE A COMPRESION O TGC (LA ETG NO ADMITE EL DE AJUSTE A ROSCA). MEDIR SIN TENSION (ITEM 81).",
    "(*) RECORRIDO Y LARGO DEL 1x2,5 DEL ARTEFACTO, Y POSICION DE LA PIPETA: NO ESTAN EN LA FICHA. CONFIRMAR CON EL PLANO OFICIAL.",
    "(*) ALTURA DEL BLOQUETE: EL DIBUJO DE LA APP PONE LA BANDERITA A MEDIA COLUMNA; LA ETG LO PIDE SOBRE EL PISO BAJO LA TORTA. CONFIRMAR.",
    "(*) CABEZA DE LA JABALINA A 300, A 1000 DE LA COLUMNA, Y BAJADA AL COSTADO DE LA FUNDACION (380): MEDIDAS NO PUBLICADAS, A CONFIRMAR.",
    '(*) BULON 1/2" DE LA BANDERITA, TORTA Y CAÑO 1" (5011): MEDIDAS Y TIPO A CONFIRMAR. NOMBRE DEL BLOQUETE: RW 1/2" / Q-320E / MN1101 b.'])

# ================= 3D (corte por el plano A-A, x = 0)
h.titulo(890, 62, "VISTA 3D EN CORTE - BASE CON BANDERITA", "CORTADA POR EL PLANO A-A: COLUMNA, TORTA, BLOQUETE, CABLES Y JABALINA")
h.iso(.16, 1185, 290)
h.BOX(-600, 0, -350, 1150, -1850, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
def F(y0, y1, z0, z1, fill, st="#333", sw=.6): h.F3([(0, y0, z0), (0, y1, z0), (0, y1, z1), (0, y0, z1)], fill, st, sw)
def Q(y, z): return h.P(0, y, z)
h.F3([(-300, -300, 0), (0, -300, 0), (0, 300, 0), (-300, 300, 0)], "url(#conc3)", "#555", .7)
F(-300, 300, -900, 0, "url(#conc3)", "#555", .8)
# torta media
tor = [(-260 * math.sin(math.radians(a)), 260 * math.cos(math.radians(a)), 110) for a in range(0, 181, 15)]
h.F3(tor, "url(#concP3)", "#6b6457", .6); F(-260, 260, 0, 110, "url(#concP3)", "#6b6457", .7)
# columna cortada (acero galvanizado)
F(-57, 57, -700, 900, "#4a5159", "#222", .7); F(-57, -45, -700, 900, "url(#galv)", "#333", .5); F(45, 57, -700, 900, "url(#galv)", "#333", .5)
# bloquete de bronce y banderita (en el plano)
F(57, 107, 40, 70, "url(#bronce)", "#5a3a10", .6)
F(107, 115, 20, 80, "url(#estano)", "#555", .6)
F(108, 118, -20, 20, "url(#estano)", "#555", .6)
# caño 1" y cable 1x10 V/A
F(360, 400, -300, 0, "url(#pvc)", "#666", .6); F(360, 1000, -330, -270, "url(#pvc)", "#666", .6)
a1 = Q(113, -20); a2 = Q(113, 30 - 30); a3 = Q(380, 0); a4 = Q(380, -300); a5 = Q(990, -300)
pc.cableVA(h, f"M{a1[0]:.1f},{a1[1]:.1f} L{Q(113,-10)[0]:.1f},{Q(113,-10)[1]:.1f} L{Q(380,-10)[0]:.1f},{Q(380,-10)[1]:.1f} L{a4[0]:.1f},{a4[1]:.1f} L{a5[0]:.1f},{a5[1]:.1f}", 3.2, True)
b1 = Q(68, 900); b2 = Q(68, 120); b3 = Q(110, 25)
pc.cableVA(h, f"M{b1[0]:.1f},{b1[1]:.1f} L{b2[0]:.1f},{b2[1]:.1f} Q{Q(68,40)[0]:.1f},{Q(68,40)[1]:.1f} {b3[0]:.1f},{b3[1]:.1f}", 2, True)
# jabalina y tomacable
F(990, 1010, -1720, -300, "url(#cobre)", "#7a4512", .5); h.F3([(0, 990, -1720), (0, 1010, -1720), (0, 1000, -1800)], "url(#cobre)", "#7a4512", .5)
h.BOX(-40, 0, 975, 1045, -345, -255, "url(#bronce)", "url(#bronce)", "url(#bronce)", "#5a3a10", .6)
pt = Q(0, 900); h.path(f"M{pt[0]-14:.1f},{pt[1]+4:.1f} l7,-5 l7,7 l7,-5 l7,5", "none", "#222", 1)
h.txt(pt[0], pt[1] - 12, "SIGUE: 1x2,5 V/A DEL ARTEFACTO (*)", 10, 700, OR, "middle", INT)
pa = Q(110, 30); h.circ(pa[0], pa[1], 14, "none", NV, .8, 'stroke-dasharray="3 2"'); h.txt(pa[0] + 18, pa[1] + 4, "A", 11, 700, NV, "start", INT)
GX = 1290
h.g3("8", (0, 0, 700), GX, 140, "COLUMNA METALICA")
h.g3("7", (0, 68, 450), GX, 190, "1x2,5 V/A (*)")
h.g3("6", (0, 80, 60), GX, 240, "BLOQUETE (A)")
h.g3("10", (-150, 150, 110), GX, 290, "TORTA (*)")
h.g3("5", (0, 112, -5), GX, 340, "BANDERITA (A)")
h.g3("4", (0, 380, -150), GX, 390, 'CAÑO PVC 1"')
h.g3("3", (0, 700, -300), GX, 440, "1x10 V/A")
h.g3("9", (0, -200, -600), GX, 490, "FUNDACION")
h.g3("2", (-20, 1045, -255), GX, 540, "TOMACABLE")
h.g3("1", (0, 1000, -1300), GX, 590, "JABALINA")
# --- detalle A (color)
ax_, ay_ = 1555, 300
h.a(f'<clipPath id="clA6"><circle cx="{ax_}" cy="{ay_}" r="98"/></clipPath>')
h.circ(ax_, ay_, 98, "#f7f8fa", NV, 1.2); h.txt(ax_, ay_ - 108, "A - BANDERITA CON 10 + 2,5 (S/E)", 10.5, 700, NV, "middle", INT)
h.a(f'<g clip-path="url(#clA6)">')
h.rect(ax_ - 110, ay_ - 110, 40, 220, "url(#galv)", "#555", .6)
h.rect(ax_ - 110, ay_ + 50, 220, 70, "url(#concP3)", "#6b6457", .6)
h.rect(ax_ - 70, ay_ - 22, 50, 26, "url(#bronce)", "#5a3a10", .9)
h.path(f"M{ax_-72},{ay_-26} q-4,15 0,34", "none", "#8d949c", 3)
pc.cableVA(h, f"M{ax_+2},{ay_+120} V{ay_+40}", 15, True)
pc.cableVA(h, f"M{ax_+60},{ay_-110} V{ay_-40} Q{ax_+60},{ay_} {ax_+18},{ay_+10} V{ay_+40}", 8, True)
h.path(f"M{ax_-14},{ay_+44} V{ay_+14} L{ax_-18},{ay_-6} A22,22 0 1,1 {ax_+26},{ay_-6} L{ax_+24},{ay_+14} V{ay_+44} Z", "url(#estano)", "#555", 1)
pc.cuPelado(h, ax_ + 2, ay_ + 26, ax_ + 2, ay_ + 44, 10, True); pc.cuPelado(h, ax_ + 16, ay_ + 26, ax_ + 16, ay_ + 44, 5, True, 3)
for yy in (ay_ + 22, ay_ + 32): h.ln(ax_ - 14, yy, ax_ + 24, yy, "#6b6f74", 1.4)
h.circ(ax_ + 4, ay_ - 9, 15, "url(#bronce)", "#5a3a10", .8); pc.hexCab(h, ax_ + 4, ay_ - 9, 11, "url(#bronce)", "#5a3a10")
h.a('</g>')
h.globo("6", ax_ - 50, ay_ - 16, ax_ - 72, ay_ - 62, NV, 9); h.globo("5", ax_ - 8, ay_ + 30, ax_ - 70, ay_ + 40, NV, 9)
h.globo("3", ax_ + 2, ay_ + 80, ax_ - 40, ay_ + 82, NV, 9); h.globo("7", ax_ + 60, ay_ - 60, ax_ + 80, ay_ - 30, NV, 9)
h.txt(ax_ - 92, ay_ + 76, "TORTA (*)", 9, 700, "#4b4437", "start", INT)
h.txt(1455, 430, "El 1x10 sube de la jabalina por el caño", 10, 400, G, "start", INT)
h.txt(1455, 444, "y el 1x2,5 baja del artefacto: los dos", 10, 400, G, "start", INT)
h.txt(1455, 458, "quedan apretados en la misma banderita,", 10, 400, G, "start", INT)
h.txt(1455, 472, "atornillada al bloquete soldado.", 10, 400, G, "start", INT)

# ================= LISTA + RÓTULO
VIN = lambda i, j, t: OR if (t == "A VINCULAR" or "(*)" in t) else K
h.tabla(890, 690, [(40, "c", False), (450, "l", False), (100, "c", True), (150, "c", False)],
        [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "JABALINA Cu CON ALMA DE ACERO Ø14,6 x 1500 (IRAM 2309)", "1 u", "7015"),
         ("2", "TOMACABLE WGC / TGC (A COMPRESION, NO A ROSCA)", "1 u", "7019"),
         ("3", "CABLE Cu 1x10 mm² VERDE-AMARILLO (IRAM NM 247-3)", "4 m", "7010"),
         ("4", 'CAÑO PVC Ø25,4 (1") CONDUCTO DE PAT (*)', "2 m", "5011"),
         ("5", "TERMINAL BANDERITA Cu ESTAÑADO 10 mm², OJAL Ø14,6", "1 u", "7018"),
         ("6", 'BLOQUETE DE BRONCE 1/2" x 50, SOLDADO (AP-C-006)', "1 u", "7003"),
         ("7", "CABLE Cu 1x2,5 mm² VERDE-AMARILLO, DEL ARTEFACTO (*)", "(*)", "7008"),
         ("8", "COLUMNA METALICA 7 m (AP-C-005)", "1 u", "6006"),
         ("9", "FUNDACION H-13 0,60 x 0,60 x 0,90 (AP-TC-003)", "0,297 m³", "-"),
         ("10", "TORTA DE MORTERO CEMENTICIO (*)", "1 u", "8020"),
         ("11", "ACOMETIDA AEREA (VER AP-T-019)", "-", "OTRO PLANO"),
         ("12", "VARIANTE ETG: 2° BLOQUETE + BANDERITA (SUPERIOR)", "(1+1 u)", "7003 / 7018")],
        rowh=21, titulo="LISTA DE MATERIALES (1 PAT DE COLUMNA AEREA)", colores=VIN)
h.rotulo(890, h.H - 150, 750, "AP-TC-006", "PUESTA A TIERRA DE", "COLUMNA CON ACOM. AEREA", "ELEVACION, CORTE, DETALLES, VARIANTE Y 3D", "1:120 / 1:110", "PLANTA 1:60 - DET. S/E", fecha="07/11/2026")
h.guardar("ap_tc_006.svg"); print("ok")
