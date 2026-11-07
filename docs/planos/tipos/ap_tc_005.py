import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
import pat_comun as pc

h = Hoja(); pc.defs(h)

# ================= CORTE A-A (columna nueva, hoja 1/2) · k = 0.15 (1:40)
k = 0.15; cx = 150; Y0 = 400; XJ = cx + 1000 * k     # jabalina a 1000 (*)
def yz(z):
    return Y0 - z * k if z <= 700 else Y0 - 700 * k - 16 - (z - 2200) * k
h.titulo(40, 62, "CORTE A-A - COLUMNA NUEVA (HOJA 1/2)", "ESC. 1:40 - COTAS EN mm - COLUMNA METALICA 7 m TIPO C (Ø114, EMP. 700)")
yJ0, yJ1 = yz(-300), yz(-1800)
h.rect(40, Y0, 400, yJ1 - Y0 + 18, "url(#EARTH)", K, 0)
fL, fR, fB = cx - 300 * k, cx + 300 * k, yz(-900)
h.path(f"M{fL},{Y0} V{fB} H{fR} V{Y0} Z", "url(#CONC)", K, 1.6)
# caño PVC 1" de la jabalina a la entrada de la columna (a -300)
cL, cR = cx - 57 * k, cx + 57 * k
h.rect(cR, yJ0 - 12.7 * k * 1.4, XJ - 5 - cR, 25.4 * k * 1.4 * 2 / 2 * 2 / 2 * 2, "#fff", K, .8)
# columna: bajo el piso (empotrada 700) y arriba con rotura
yE = yz(-700)
h.rect(cL, yz(2700), cR - cL, yE - yz(2700), "#fff", "none", 0)
yE1, yE2 = yz(-375), yz(-225)                          # ventana de entrada 150 de alto
h.ln(cL, yz(2700), cL, yE, K, 1.3); h.ln(cR, yz(2700), cR, yE2, K, 1.3); h.ln(cR, yE1, cR, yE, K, 1.3); h.ln(cL, yE, cR, yE, K, 1.3)
h.ln(cx, yz(2700) - 12, cx, yE + 10, K, .4, h.EJE)
# torta (*) sobre el piso
h.path(f"M{cx-60*0+cL-14},{Y0} L{cL-9},{Y0-9} L{cR+9},{Y0-9} L{cR+14},{Y0} Z", "url(#CONCP)", K, .8)
# caja de conexión a +2500 con el bulón PAT
yC = yz(2500)
h.rect(cL + 1.5, yC - 14, cR - cL - 3, 28, "#fff", K, .7, h.OCULTA)
h.circ(cx + 1, yC, 3.2, "#fff", K, .8)
# cable 1x10 V/A: de la jabalina por el caño, sube por adentro de la columna hasta el bulón
pc.cableVA(h, f"M{XJ-3},{yJ0} H{cx+4} V{yC+4} Q{cx+4},{yC} {cx+1},{yC}", 2.4, False)
# rotura de la columna (entre +700 y +2200) y arriba
yb1, yb2 = yz(700), yz(2200)
h.rect(cL - 6, yb2 + 1, cR - cL + 12, yb1 - yb2 - 2, "#fff", "none", 0)
for yy in (yb1, yb2): pc.corteDoble(h, cx, yy, 6)
pc.corteDoble(h, cx, yz(2700), 6); h.txt(cx + 16, yz(2700) + 3, "SIGUE", 9.5, 400, G)
# jabalina y tomacable
pc.jabalinaCAD(h, XJ, yJ0, yJ1, 4, 8)
h.rect(XJ - 7, yJ0 - 6, 14, 12, "url(#ANSI31)", K, .9)
h.path(f"M40,{Y0} H{fL} M{fR},{Y0} H440", "none", K, 1.8)
h.nivel(52, Y0, "±0,00 NPT")
# cotas
h.dimH(fB + 18, fL, fR, "600", ext=fB + 2, dy=14)
h.dimV(64, Y0, fB, "900", ext=fL - 2); h.dimV(88, Y0, yE, "700 EMP.", ext=cL - 2)
h.dimV(112, yC, Y0, "2500 MIN.", ext=cL - 2)
h.txt(cR + 5, yz(560), "Ø114", 10.5)
h.dimV(236, Y0, yJ0, "300 MIN.", ext=cR + 2)
h.dimV(345, Y0, yJ0, "300 (*)", ext=XJ + 10, c=OR); h.dimV(345, yJ0, yJ1, "1500", ext=XJ + 4)
h.dimH(Y0 - 30, cx, XJ, "1000 (*)", ext=Y0 - 2, c=OR)
h.llamadaDet(XJ, yJ0, 15, "D1"); h.llamadaDet(cx, yC, 17, "D2")
gx = 420
h.globo("1", XJ + 2, yz(-1300), gx, yz(-1300)); h.globo("2", XJ + 6, yJ0 + 3, gx, yJ0 + 26)
h.globo("3", XJ - 40, yJ0, gx, yJ0 - 18); h.globo("4", cR + 26, yJ0 + 3, gx, yJ0 + 60)
h.globo("5", cx + 3, yC + 6, gx, yC + 34); h.globo("6", cx + 1, yC - 3, gx, yC - 10)
h.globo("7", cR - 1, yz(450), gx, yz(450) - 30); h.globo("8", fR - 8, fB - 30, gx, fB - 6); h.globo("9", cR + 10, Y0 - 4, gx, Y0 - 52)

# ================= PLANTA · k = 0.1 (1:60)
h.titulo(470, 62, "PLANTA", "ESC. 1:60")
kp = 0.1; px0, py0 = 560, 160; pj = px0 + 1000 * kp
h.rect(px0 - 30, py0 - 30, 60, 60, "url(#CONC)", K, 1.3)
h.path(f"M{px0-22},{py0} A22,22 0 1,0 {px0+22},{py0} A22,22 0 1,0 {px0-22},{py0}", "url(#CONCP)", K, .6, h.OCULTA)
h.circ(px0, py0, 57 * kp, "#fff", K, 1.2)
h.rect(px0 + 5.7, py0 - 2, pj - px0 - 8, 4, "#fff", K, .7, h.OCULTA)
h.circ(pj, py0, 2.5, K, K, .5); h.rect(pj - 5, py0 - 4, 10, 8, "none", K, .7)
pc.corteMarca(h, px0 - 96, py0, pj + 40, py0, "A", -1)
h.dimH(py0 + 48, px0 - 30, px0 + 30, "600", ext=py0 + 32, dy=13)
h.dimH(py0 - 44, px0, pj, "1000 (*)", ext=py0 - 6, c=OR)
h.dimV(px0 - 48, py0 - 30, py0 + 30, "600", ext=px0 - 32)
h.txt(pj, py0 + 26, "JABALINA", 10, 700, K, "middle"); h.txt(px0 + 34, py0 + 14, 'CAÑO 1"', 9.5, 400, G); h.txt(px0 - 28, py0 + 44, "TORTA (*)", 9.5, 400, OR)
h.rayados(470, 258, [("CONC", "HORMIGON H-13"), ("EARTH", "TERRENO NATURAL"), ("CONCP", "TORTA / MORTERO (*)"), ("ANSI31", "BRONCE / ACERO (CORTE)")], cols=2, dx=180)

# ================= D1 · TOMACABLE EN LA JABALINA
h.titulo(470, 370, "DETALLE D1 - TOMACABLE", "S/E - VISTA Y CORTE C-C POR EL BULON")
xr, wr = 545, 38
yh = 470
h.rect(xr - wr / 2, yh, wr, 160, "#fff", K, 1.1)
h.path(f"M{xr-wr/2-4},{yh+160} q10,-8 {wr/2+4},0 q10,8 {wr/2+4},0", "#fff", K, .9)
h.ln(xr, yh - 8, xr, yh + 170, K, .4, h.EJE)
bx0, bx1, by0, by1 = xr - wr / 2 - 12, xr + wr / 2 + 16 + 8 + 14, yh + 14, yh + 86
h.rect(bx0, by0, bx1 - bx0, by1 - by0, "#fff", K, 1.2)
for xx in (xr - wr / 2, xr + wr / 2, xr + wr / 2 + 16, xr + wr / 2 + 24): h.ln(xx, by0, xx, by1, K, .6, h.OCULTA)
xc = xr + wr / 2 + 8
pc.cableVA(h, f"M{xc+130},{yh-34} H{xc+40} Q{xc},{yh-34} {xc},{yh-2} V{by0}", 16, False)
h.ln(xc, by0, xc, by1, K, .4, h.OCULTA)
pc.cuPelado(h, xc, by1, xc, by1 + 12, 10, False)
yb = (by0 + by1) / 2
h.rect(bx1, yb - 13, 12, 26, "#fff", K, 1); h.ln(bx1, yb - 6, bx1 + 12, yb - 6, K, .5); h.ln(bx1, yb + 6, bx1 + 12, yb + 6, K, .5)
pc.corteMarca(h, bx0 - 26, yb, bx1 + 30, yb, "C", 1)
h.dimH(yh + 140, xr - wr / 2, xr + wr / 2, "Ø14,6", ext=yh + 130, dy=-5)
h.globo("1", xr - 6, yh + 110, 488, yh + 118); h.globo("2", bx0 + 6, by0 + 10, 488, by0 - 4); h.globo("3", xc + 70, yh - 34, xc + 96, yh - 52)
h.txt(xc + 110, yh - 48, "1x10 V/A", 10.5)
# corte C-C
sx, sy, R = 700, 590, 29.2
h.txt(sx + 20, 494, "CORTE C-C", 11, 700, K, "middle"); h.ln(sx - 12, 498, sx + 52, 498, K, .9)
h.rect(sx - R - 10, sy - R - 10, R + 10 + R + 16 + 8 + 16, 2 * R + 20, "url(#ANSI31)", K, 1.2)
xw = sx + R + 16 + 8
h.path(f"M{sx},{sy-R} H{xw} V{sy+R} H{sx} A{R},{R} 0 0 1 {sx},{sy-R} Z", "#fff", K, .8)
h.circ(sx, sy, R, "#fff", K, 1.1); h.circ(sx, sy, R - 3, "url(#ANSI31)", K, .6)
pc.cuerda(h, sx + R + 8, sy, 8, False)
h.rect(sx + R + 16, sy - 18, 8, 36, "#fff", K, .9)
pc.rosca(h, xw, sy, xw + 30, sy, 6, 3)
h.rect(xw + 30, sy - 13, 11, 26, "#fff", K, 1); h.ln(xw + 30, sy - 6, xw + 41, sy - 6, K, .5); h.ln(xw + 30, sy + 6, xw + 41, sy + 6, K, .5)
h.dimH(sy - R - 18, sx - R, sx + R, "Ø14,6", ext=sy - R - 12, dy=-4)
lab = [("ALMA DE ACERO", sx - 8, sy + 6), ("CAPA DE Cu (EXAGERADA)", sx - R + 1.5, sy + 10), ("CUERDA Cu 10 mm²", sx + R + 8, sy + 5),
       ("PLACA DE APRIETE (*)", sx + R + 20, sy + 16), ("CUERPO DE BRONCE", sx + R + 34, sy + R + 6), ("BULON", xw + 36, sy + 10)]
for i, (t, ax, ay) in enumerate(lab):
    ty = 652 + (i % 3) * 15; tx = 575 if i < 3 else 735
    h.ln(ax, ay, tx + (len(t) * 4.6 if i < 3 else -3), ty - 4, K, .5); h.circ(ax, ay, 1.6, K, K, 0)
    h.txt(tx, ty, t, 9.5, 400, OR if "(*)" in t else K)

# ================= D2 · BULÓN PAT EN LA CAJA (columna nueva)
h.titulo(40, 742, "D2 - BULON PAT EN LA CAJA", "S/E - COLUMNA NUEVA (HOJA 1/2)")
bx, by = 92, 836
h.rect(52, 778, 82, 166, "#fff", K, .8); h.txt(112, 790, "CAJA", 9, 400, G)
for yy in range(800, 935, 9): h.ln(54, yy, 60, yy - 6, K, .35)
pc.cableVA(h, f"M{bx},{944} V{by+62}", 16, False)
h.path(f"M{bx-8},{by+62} V{by+28} L{bx-9},{by+12} A13,13 0 1,1 {bx+9},{by+12} L{bx+8},{by+28} V{by+62} Z", "#fff", K, 1)
h.circ(bx, by, 7.6, "#fff", K, .8)
pc.cuPelado(h, bx, by + 34, bx, by + 60, 10, False)
for yy in (by + 40, by + 52): h.ln(bx - 8, yy, bx + 8, yy, K, 1.4)
h.circ(bx, by, 12, "none", K, .5, h.OCULTA)
pc.hexCab(h, bx, by, 9, "#fff")
h.circ(bx, by, 4, "url(#ROSCA)", K, .6)
h.path(f"M{bx+10},{by-6} q20,-14 40,-22", "none", K, 1.4, h.OCULTA)
L2 = [("BULON PAT DE BRONCE (DE LA CAJA)", by - 34, (bx + 4, by - 2)), ("TUERCA Y ARANDELA (*)", by - 18, (bx + 8, by + 4)),
      ('TERMINAL OJAL Cu ESTAÑADO 10 mm²', by + 6, (bx + 7, by + 22)), ('OJAL 5/16" (2045)', by + 20, None),
      ("CRIMPADO A COMPRESION", by + 42, (bx + 8, by + 46)), ("CABLE 1x10 V/A", by + 86, (bx + 8, by + 96)),
      ("PUENTE 1x6 A LA BPN (APARTE)", by - 50, (bx + 46, by - 28))]
for t, ty, ap in L2:
    h.txt(146, ty, t, 9.5, 400, OR if "(*)" in t else K)
    if ap: h.ln(ap[0], ap[1], 143, ty - 3, K, .5); h.circ(ap[0], ap[1], 1.6, K, K, 0)
h.globo("5", bx - 8, by + 30, 72, by + 30, K, 8); h.globo("6", bx - 4, by - 6, 72, by - 22, K, 8)

# ================= D3 · COLUMNA EXISTENTE (hoja 2/2)
h.titulo(330, 742, "D3 - COLUMNA EXISTENTE", "S/E - HOJA 2/2 - VER AP-C-006")
gx3, gy3 = 368, 900
h.rect(330, gy3, 236, 36, "url(#EARTH)", K, 0); h.ln(330, gy3, 566, gy3, K, 1.6)
h.path(f"M{gx3-34},{gy3} L{gx3-28},{gy3-40} L{gx3+58},{gy3-40} L{gx3+66},{gy3} Z", "url(#CONCP)", K, .9)
h.rect(gx3 - 20, 772, 40, gy3 + 36 - 772, "#fff", K, 1.3); h.ln(gx3, 768, gx3, 936, K, .4, h.EJE)
yb3 = gy3 - 22
h.rect(gx3 + 20, yb3 - 8, 12, 16, "url(#ANSI31)", K, 1)
h.path(f"M{gx3+21},{yb3-8} l-3,-3 M{gx3+21},{yb3+8} l-3,3", "none", K, 1.6)
h.rect(gx3 + 32, yb3 - 9, 3, 18, "#fff", K, .9)
h.rect(gx3 + 35, yb3 - 6, 6, 12, "#fff", K, .9)
h.path(f"M{gx3+32},{yb3+9} q0,8 4,14 V{gy3+30}", "none", K, 1.8)
pc.cableVA(h, f"M{gx3+36},{yb3+24} V{gy3+36}", 7, False)
L3 = [("10", "BLOQUETE 1/2\" (7003)", gx3 + 26, yb3, 806), ("11", "BANDERITA (7018)", gx3 + 33, yb3 + 6, 830),
      ("3", "CABLE 1x10 V/A", gx3 + 36, gy3 + 14, 854), ("9", "TORTA (*)", gx3 + 50, gy3 - 34, 782)]
for n, t, ax, ay, ty in L3:
    h.globo(n, ax, ay, 452, ty, K, 9); h.txt(465, ty + 4, t, 9.5, 400, OR if "(*)" in t else K)
h.txt(445, 880, "SOLDADO, SOBRE EL PISO,", 9.5, 400, G); h.txt(445, 893, "TAPADO CON LA TORTA", 9.5, 400, G)

# ================= CÓMPUTO
h.tabla(590, 742, [(112, "l", False), (44, "c", True), (102, "l", False)],
        [("CONCEPTO", "CANT.", "CALCULO"), ("JABALINA", "1 u", "1 POR COLUMNA"), ("TOMACABLE", "1 u", "1 POR JABALINA"),
         ("CABLE 1x10 V/A", "4 m", "64 m / 16 PAT"), ('CAÑO PVC 1"', "2 m", "AP-TC-005"), ("OJAL 10 mm²", "1 u", "COL. NUEVA"),
         ("BANDERITA (EXIST.)", "1 u", "COL. EXIST."), ("BLOQUETE (EXIST.)", "1 u", "COL. EXIST."), ("MEDICION DE PAT", "1", "ITEM 81")],
        rowh=19, titulo="COMPUTO POR COLUMNA METALICA")
h.txt(590, 944, "+ TABLERO: 1 JABALINA, 10 m Y 1 MEDICION", 9.5, 400, G)

h.notas(40, 966, [
    "COTAS EN mm. 1 JABALINA POR COLUMNA METALICA + 1 POR TABLERO (PLIEGO LP 21478 IT. 2.01; HIPICA: 15 COLUMNAS → 16 PAT, 64 m DE 1x10).",
    "COLUMNA NUEVA (HOJA 1/2): EL BORNE DE TIERRA ES EL BULON PAT DE LA CAJA (AP-CC-001/004). NO LLEVA BANDERITA NI BLOQUETE.",
    "COLUMNA EXISTENTE (HOJA 2/2): BANDERITA Cu ESTAÑADO 10 mm² OJAL Ø14,6 (7018) + BLOQUETE DE BRONCE (7003). DETALLE EN AP-C-006.",
    "ETG 14.2/14.3: NO SE ADMITE TOMACABLE DE AJUSTE A ROSCA NI CON ZINC (LATON); SI TGC O COMPRESION. VERIFICAR EL MODELO AL COMPRAR.",
    "MEDIR SIN TENSION Y ANTES DE UNIR NEUTRO Y TIERRA (ITEM 81). TT: ≤ 40 Ω POR TOMA; SI NO DA, HASTA 3 JABALINAS (ETG 14.1).",
    "(*) PROFUNDIDAD DE LA CABEZA (300) Y DISTANCIA A LA COLUMNA (1000): NO ESTAN EN LA FICHA, CONFIRMAR CON EL PLANO OFICIAL.",
    "(*) MEDIDAS DE TOMACABLE, PLACA, TUERCA Y TORTA, Y SI LLEVA CAMARA DE INSPECCION: NO ESTAN EN LA APP, CONFIRMAR CON EL PLANO.",
    '(*) CAÑO 1": LA CALCULADORA LO PIDE «FLEXIBLE» Y SIN CODIGO; EN EL PAÑOL ESTA EL 5011 (PVC Ø25,4). CONFIRMAR TIPO Y RECORRIDO DE 2 m.',
    "CAPA DE Cu DE LA JABALINA: FICHA ≥ 254 µm, CALCULADORA 250 µm (IRAM 2309). EL MODULO K = 1 DEL PLIEGO ES ESTA PAT COMPLETA."])

# ================= 3D (corte por el plano A-A)
h.titulo(890, 62, "VISTA 3D EN CORTE - PAT DE COLUMNA NUEVA", "CORTADA POR EL PLANO A-A: COLUMNA, FUNDACION, CAÑO, CABLE Y JABALINA")
h.iso(.135, 1000, 300)
X0, X1, YB, ZB = -700, 1300, -500, -1900
h.BOX(X0, X1, YB, 0, ZB, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
def Q(x, z, y=0): return h.P(x, y, z)
def band(x0, x1, z0, z1, fill, st="#333", sw=.6): h.F3([(x0, 0, z0), (x1, 0, z0), (x1, 0, z1), (x0, 0, z1)], fill, st, sw)
h.F3([(-300, -300, 0), (300, -300, 0), (300, 0, 0), (-300, 0, 0)], "url(#conc3)", "#555", .7)
band(-300, 300, -900, 0, "url(#conc3)", "#555", .8)
# torta (*) media
tor = [(200 * math.cos(math.radians(a)), -200 * math.sin(math.radians(a)), 60) for a in range(0, 181, 15)]
h.F3(tor, "url(#concP3)", "#6b6457", .6); band(-200, 200, 0, 60, "url(#concP3)", "#6b6457", .6)
# columna cortada: interior + paredes de acero galvanizado
ZT = 900
band(-57, 57, -700, ZT, "#4a5159", "#222", .7)
band(-57, -45, -700, ZT, "url(#galv)", "#333", .5)
band(45, 57, -700, -375, "url(#galv)", "#333", .5); band(45, 57, -225, ZT, "url(#galv)", "#333", .5)
# caño PVC 1" (exagerado) y cable V/A
band(57, 985, -345, -255, "url(#pvc)", "#666", .6)
p1 = Q(1000, -300); p2 = Q(10, -300); p3 = Q(10, ZT)
pc.cableVA(h, f"M{p1[0]:.1f},{p1[1]:.1f} L{p2[0]:.1f},{p2[1]:.1f} L{p3[0]:.1f},{p3[1]:.1f}", 3.2, True)
# jabalina (cobre) con punta, y tomacable de bronce
band(990, 1010, -1720, -300, "url(#cobre)", "#7a4512", .5)
h.F3([(990, 0, -1720), (1010, 0, -1720), (1000, 0, -1800)], "url(#cobre)", "#7a4512", .5)
h.BOX(975, 1045, -40, 0, -345, -255, "url(#bronce)", "url(#bronce)", "url(#bronce)", "#5a3a10", .6)
pb = Q(1045, -300); h.rect(pb[0], pb[1] - 3, 4, 6, "url(#bronce)", "#5a3a10", .5)
# rotura arriba de la columna
pt = Q(0, ZT); h.path(f"M{pt[0]-14:.1f},{pt[1]+4:.1f} l7,-5 l7,7 l7,-5 l7,5", "none", "#222", 1)
h.txt(pt[0] - 6, pt[1] - 14, "SIGUE: CAJA A +2500 (VER B)", 10, 700, NV, "middle", INT)
pa = Q(1000, -300); h.circ(pa[0], pa[1], 13, "none", NV, .8, 'stroke-dasharray="3 2"'); h.txt(pa[0] + 4, pa[1] + 30, "A", 11, 700, NV, "start", INT)
GX = 1300
h.g3("7", (0, 0, 700), GX, 150, "COLUMNA (SIGUE)")
h.g3("3", (10, 0, 300), GX, 205, "CABLE 1x10 V/A")
h.g3("9", (150, -60, 60), GX, 260, "TORTA (*)")
h.g3("8", (-200, 0, -600), GX, 315, "FUNDACION H-13")
h.g3("4", (600, 0, -280), GX, 370, 'CAÑO PVC 1"')
h.g3("2", (1045, -20, -255), GX, 425, "TOMACABLE (A)")
h.g3("1", (1000, 0, -1200), GX, 470, "JABALINA")

# --- detalle A (color): tomacable abrazando la jabalina
def inset(cx_, cy_, r, letra, tit, id_):
    h.a(f'<clipPath id="{id_}"><circle cx="{cx_}" cy="{cy_}" r="{r}"/></clipPath>')
    h.circ(cx_, cy_, r, "#f7f8fa", NV, 1.2)
    h.txt(cx_, cy_ - r - 8, f"{letra} - {tit}", 10.5, 700, NV, "middle", INT)
    h.a(f'<g clip-path="url(#{id_})">')
ax_, ay_ = 1555, 225
inset(ax_, ay_, 92, "A", "TOMACABLE (S/E)", "clA")
h.rect(ax_ - 120, ay_ - 10, 240, 120, "url(#soil3)", "none", 0)
h.rect(ax_ - 30, ay_ - 50, 26, 200, "url(#cobre)", "#7a4512", .8)
h.a(f'<ellipse cx="{ax_-17}" cy="{ay_-50}" rx="13" ry="4" fill="#f0a860" stroke="#7a4512" stroke-width=".6"/>')
pc.cableVA(h, f"M{ax_+110},{ay_-62} H{ax_+20} Q{ax_+6},{ay_-62} {ax_+6},{ay_-40} V{ay_-22}", 12, True)
pc.cuPelado(h, ax_ + 6, ay_ - 24, ax_ + 6, ay_ + 46, 8, True)
h.rect(ax_ - 42, ay_ - 26, 70, 62, "url(#bronce)", "#5a3a10", 1, 'rx="4" opacity=".93"')
h.rect(ax_ - 30, ay_ - 26, 26, 62, "url(#cobre)", "#7a4512", .5, 'opacity=".35"')
h.rect(ax_ + 1, ay_ - 26, 10, 62, "#000", "none", 0, 'opacity=".12"')
h.rect(ax_ + 28, ay_ - 2, 12, 14, "url(#bronce)", "#5a3a10", .8)
h.rect(ax_ + 40, ay_ - 8, 12, 26, "url(#bronce)", "#5a3a10", .9)
h.ln(ax_ + 40, ay_ - 1, ax_ + 52, ay_ - 1, "#5a3a10", .5); h.ln(ax_ + 40, ay_ + 11, ax_ + 52, ay_ + 11, "#5a3a10", .5)
pc.cuPelado(h, ax_ + 6, ay_ + 36, ax_ + 6, ay_ + 46, 8, True)
h.a('</g>')
h.globo("1", ax_ - 22, ay_ + 66, ax_ - 70, ay_ + 50, NV, 9); h.globo("2", ax_ - 38, ay_ - 10, ax_ - 72, ay_ - 30, NV, 9)
h.globo("3", ax_ + 70, ay_ - 62, ax_ + 66, ay_ - 34, NV, 9)
h.txt(ax_ + 56, ay_ + 32, "BULON", 9.5, 700, NV, "start", INT)
h.txt(ax_ - 8, ay_ + 64, "Cu", 9.5, 700, "#7a4512", "start", INT)
# --- detalle B (color): bulón PAT en la caja con el ojal
bx_, by_ = 1555, 500
inset(bx_, by_, 92, "B", "BULON PAT EN LA CAJA (+2500)", "clB")
h.rect(bx_ - 100, by_ - 100, 200, 200, "url(#galv)", "none", 0)
h.rect(bx_ - 50, by_ - 70, 100, 150, "#2b3036", "#111", 1, 'rx="6"')
pc.cableVA(h, f"M{bx_},{by_+100} V{by_+40}", 14, True)
h.path(f"M{bx_-7},{by_+42} V{by_+16} L{bx_-8},{by_+2} A12,12 0 1,1 {bx_+8},{by_+2} L{bx_+7},{by_+16} V{by_+42} Z", "url(#estano)", "#555", .9)
for yy in (by_ + 22, by_ + 32): h.ln(bx_ - 7, yy, bx_ + 7, yy, "#777", 1.2)
h.circ(bx_, by_ - 6, 13, "url(#bronce)", "#5a3a10", .8)
pc.hexCab(h, bx_, by_ - 6, 9, "url(#bronce)", "#5a3a10")
h.circ(bx_, by_ - 6, 3.5, "#c8963a", "#5a3a10", .6)
h.path(f"M{bx_+10},{by_-14} q24,-18 60,-26", "none", "#2f9e44", 3, 'stroke-dasharray="6 3"')
h.a('</g>')
h.globo("6", bx_ + 6, by_ - 12, bx_ - 70, by_ - 40, NV, 9); h.globo("5", bx_ - 6, by_ + 18, bx_ - 72, by_ + 20, NV, 9)
h.globo("3", bx_ + 4, by_ + 70, bx_ - 60, by_ + 66, NV, 9)
h.txt(bx_ + 20, by_ - 46, "PUENTE 1x6", 9, 700, "#fff", "start", INT)
# --- VARIANTE: conector C a compresión (color, chico)
vx, vy = 1300, 560
h.txt(vx - 60, vy - 34, "VARIANTE: CONECTOR «C» A COMPRESION", 10, 700, NV, "start", INT)
h.txt(vx - 60, vy - 20, "CMC-7 (7013), EN LUGAR DEL TOMACABLE (2)", 9.5, 400, NV, "start", INT)
h.rect(vx - 60, vy - 8, 200, 70, "url(#soil3)", "#8a6a43", .5)
h.rect(vx - 8, vy - 8, 14, 70, "url(#cobre)", "#7a4512", .7)
pc.cableVA(h, f"M{vx+130},{vy+4} H{vx+40} Q{vx+14},{vy+4} {vx+14},{vy+22} V{vy+56}", 9, True)
h.path(f"M{vx-12},{vy+16} h34 a8,8 0 0 1 0,16 v6 a8,8 0 0 1 0,16 h-34 z", "url(#cobre)", "#5a3a10", .9, 'opacity=".95"')
h.path(f"M{vx-12},{vy+16} h34 a8,8 0 0 1 0,16 v6 a8,8 0 0 1 0,16 h-34 z", "url(#bronce)", "none", 0, 'opacity=".55"')
for yy in (vy + 24, vy + 46): h.ln(vx - 10, yy, vx + 26, yy, "#5a3a10", 1.1)
h.txt(vx + 40, vy + 44, "SE APLICA CON PINZA", 9, 400, NV, "start", INT); h.txt(vx + 40, vy + 56, "(NO LLEVA BULON)", 9, 400, NV, "start", INT)
h.globo("12", vx - 12, vy + 30, vx - 44, vy + 30, NV, 10)
h.txt(890, 666, "El cable verde-amarillo sale de la jabalina por el caño, entra por la ventana a -300 y sube por adentro", 10.5, 400, G, "start", INT)
h.txt(890, 682, "de la columna hasta el bulón de la caja (B). En la columna existente va a la banderita y al bloquete (D3).", 10.5, 400, G, "start", INT)

# ================= LISTA + RÓTULO
VIN = lambda i, j, t: OR if (t == "A VINCULAR" or "(*)" in t) else K
h.tabla(890, 708, [(40, "c", False), (450, "l", False), (100, "c", True), (150, "c", False)],
        [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "JABALINA Cu CON ALMA DE ACERO Ø14,6 x 1500 (IRAM 2309)", "1 u", "7015"),
         ("2", "TOMACABLE WGC / TGC (A COMPRESION, NO A ROSCA)", "1 u", "7019"),
         ("3", "CABLE Cu 1x10 mm² VERDE-AMARILLO (IRAM NM 247-3)", "4 m", "7010"),
         ("4", 'CAÑO PVC Ø25,4 (1") CONDUCTO DE PAT (*)', "2 m", "5011"),
         ("5", 'TERMINAL OJAL Cu ESTAÑADO 10 mm², OJAL 5/16" (COL. NUEVA)', "1 u", "2045"),
         ("6", "BULON PAT DE BRONCE (VIENE EN LA CAJA AP-CC-001/004)", "-", "CON LA CAJA 6002"),
         ("7", "COLUMNA METALICA 7 m (AP-C-005, TIPO C)", "1 u", "6006"),
         ("8", "FUNDACION H-13 0,60 x 0,60 x 0,90 (AP-TC-003)", "0,297 m³", "-"),
         ("9", "TORTA DE MORTERO CEMENTICIO (*)", "1 u", "8020"),
         ("10", 'BLOQUETE DE BRONCE 1/2" x 50 (SOLO COL. EXISTENTE)', "1 u", "7003"),
         ("11", "TERMINAL BANDERITA Cu ESTAÑADO 10 mm², OJAL Ø14,6 (EXIST.)", "1 u", "7018"),
         ("12", "VARIANTE: CONECTOR C A COMPRESION CMC-7 (EN LUGAR DEL 2)", "(1 u)", "7013")],
        rowh=21, titulo="LISTA DE MATERIALES (1 PAT DE COLUMNA)", colores=VIN)
h.rotulo(890, h.H - 150, 750, "AP-TC-005", "PUESTA A TIERRA DE", "COLUMNA METALICA", "NUEVA (1/2) Y EXISTENTE (2/2) - CORTE, DETALLES, 3D", "1:40 / 1:60", "DETALLES Y 3D S/E", fecha="07/11/2026")
h.guardar("ap_tc_005.svg"); print("ok")
