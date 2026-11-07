import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
from _taer import *
# DATOS (ficha AP-T-019 + calculadora): tiro flojo ≤ 10 m (TIRO_FLOJO_MAX_M) · poste PRFV a 2,50 m del cordón (POSTE_PRFV_DIST_CORDON_M)
#  ref. 12 cables admitidos (CABLES_ACOMETIDA.aerea) · nota 2 espuma + babero · ref. 11 apoya escalera H12 · rack ⟂ al tendido
#  gabinete a 5 m o más, puerta al espacio verde (FICHAS_TEC gabinete) · apoyo hl 8 m / 9,5 m / 1,5 m (AP-T-018)
#  morsetos: línea EPEC 50 mm² (LINEA_EPEC_MM2); Cu 4x16 → 1995/6 PKD-14 bimetálico; 3x25 Al → 1995/3 PKD-16
h = Hoja()
# =================================================== ELEVACION GENERAL
h.titulo(40, 62, "ELEVACION GENERAL POR EL VANO", "S/E (APROX. 1:100) - COTAS EN mm - DERIVACION EN TIRO FLOJO")
k = 0.031; yg = 380; xP = 362; xE = 74
Y = lambda z: yg - z * k
xc1 = xP - 2500 * k; xc0 = xc1 - 6000 * k            # cordones (ancho de calzada a título de ejemplo)
# terreno
h.rect(40, yg, 410, 52, "url(#EARTH)", K, 0)
h.path(f"M40,{yg} H{xc0} v-5 h-3 M{xc0},{yg-5} H{xc1} v5 H448", "none", K, 1.6)
h.rect(xc0, yg - 5, xc1 - xc0, 5, "url(#ANSI37)", K, .6)
h.txt((xc0 + xc1) / 2, yg - 40, "CALZADA", 9, 700, K, "middle")
h.txt(xc0 + 4, yg + 14, "CORDON", 8.5, 400, G); h.txt(xc1 + 3, yg + 14, "CORDON", 8.5, 400, G)
h.txt(400, yg - 50, "ESPACIO VERDE", 8.5, 700, K, "middle")
# poste EPEC (H°A°, existente, altura s/ obra)
zE = 8500
h.path(f"M{xE-4.5},{yg+18} L{xE-2.6},{Y(zE)} H{xE+2.6} L{xE+4.5},{yg+18} Z", "url(#CONC)", K, .9)
h.txt(xE + 8, Y(3200), "POSTE EPEC", 8.5, 700); h.txt(xE + 8, Y(3200) + 10, "EXISTENTE (*)", 8.5, 400, OR)
zL = 7500; h.circ(xE + 9, Y(zL), 3.4, K, K, .5); h.circ(xE + 9, Y(zL), 1.4, "#fff", K, 0)
h.txt(xE + 14, Y(zL) + 22, "LINEA PREENSAMBLADA", 8.5, 700); h.txt(xE + 14, Y(zL) + 32, "EPEC (EN CORTE)", 8.5, 400, G)
# poste PRFV
zt = HL; r_ = lambda z: d_poste(z) / 2 * k * 1.6
h.path(f"M{xP-r_(-EMP)},{Y(-EMP)} L{xP-r_(zt)},{Y(zt)} H{xP+r_(zt)} L{xP+r_(-EMP)},{Y(-EMP)} Z", "#fff", K, 1.3)
h.ln(xP, Y(zt) - 8, xP, Y(-EMP) + 6, K, .4, h.EJE)
# rack en los dos postes, derivacion (catenaria) y bajada
zR, zRe = 7600, 7300
xr0, xr1 = xE + 4, xP - r_(zR)
h.rect(xr0, Y(zRe) - 2, 6, 4, "#fff", K, .6); h.rect(xr1 - 6, Y(zR) - 2, 6, 4, "#fff", K, .6)
pts = []
for i in range(21):
    t = i / 20; x = xr0 + 6 + (xr1 - 6 - xr0 - 6) * t; z = zRe + (zR - zRe) * t - 450 * 4 * t * (1 - t); pts.append((x, Y(z)))
cable2d(h, "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts), 1.4)
cable2d(h, f"M{xE+9},{Y(zL)+3} Q{xE+9},{Y(zRe)} {xr0+6},{Y(zRe)}", 1.2)
zG0, zG1 = 5000, 5530
cable2d(h, f"M{xr1-6},{Y(zR)} q-4,2 -4,8 L{xP-r_(5100)-3},{Y(zG0)+6} Q{xP-r_(5000)-3},{Y(zG0)+12} {xP+4},{Y(zG0)+12} H{xP+r_(5000)+9}", 1.2)
# gabinete (de costado, del lado del espacio verde) y fotocontrol
gx = xP + r_(5300) + 2
h.rect(gx, Y(zG1), 200 * k * 1.3, (zG1 - zG0) * k, GAB_T, K, .9)
h.ln(xP + r_(5450), Y(5450), gx, Y(5450), K, 1.6); h.ln(xP + r_(5080), Y(5080), gx, Y(5080), K, 1.6)
zF = 6100; h.ln(xP + r_(zF), Y(zF), xP + r_(zF) + 9, Y(zF), K, 1.2); h.rect(xP + r_(zF) + 7, Y(zF) - 6, 5, 6, "#fff", K, .7)
# salidas: bajan por dentro y salen a la zanja
h.path(f"M{xP+1},{Y(4700)} V{Y(-600)} Q{xP+1},{Y(-700)} {xP+10},{Y(-700)} H448", "none", K, 1.1, h.OCULTA)
h.path(f"M{gx+3},{Y(zG0)} V{Y(4780)} H{xP+r_(4780)}", "none", K, 1.1)
h.rect(xP + r_(4800) - 1, Y(4880), 5, 9, "#fff", K, .6)          # babero
h.txt(420, Y(-700) - 3, "ZANJA →", 8.5, 700, K, "end")
# apoya escalera
zA = 6700; h.path(f"M{xP-r_(zA)},{Y(zA)} h-7 v-5", "none", K, 1.2)
# cotas
h.dimH(108, xE, xP, "VANO (TIRO FLOJO) ≤ 10000", ext=Y(zE) - 4)
h.dimH(yg - 24, xc1, xP, "2500", ext=yg - 6)
h.dimH(yg - 24, xc0, xc1, "S/ OBRA (*)", ext=yg - 6, c=OR)
h.dimV(424, Y(zt), yg, "hl 8000", ext=xP + 6); h.dimV(424, yg, Y(-EMP), "≈1500", ext=xP + 6)
h.dimV(442, Y(zt), Y(-EMP), "TOTAL 9500", ext=None)
h.dimV(xP - 22, Y(zG0), yg, "≥ 5000", ext=gx)
gx_ = 168
h.globo("1", xP - r_(3000), Y(3000), xP - 45, Y(3000) - 10)
h.globo("2", gx + 4, Y(5300), 404, Y(5600))
h.globo("6", xr1 - 3, Y(zR) - 2, xP - 30, Y(zt) - 6)
h.globo("10", (pts[8][0]), pts[8][1], 210, 168)
h.globo("12", xP - r_(zA) - 6, Y(zA) - 4, xP - 48, Y(zA) + 4)
h.globo("14", xP + r_(4800) + 4, Y(4860), 404, Y(4600))
# =================================================== PLANTA
h.titulo(470, 62, "PLANTA DE EMPLAZAMIENTO", "S/E (APROX. 1:150) - RACK ⟂ AL TENDIDO, PUERTA AL ESPACIO VERDE")
kp = 0.024; px = 600; yl = 128
yc0 = yl + 28; yc1 = yc0 + 6000 * kp; yP = yc1 + 2500 * kp
h.rect(470, yc0, 360, yc1 - yc0, "url(#ANSI37)", K, 0)
for y in (yc0, yc1): h.ln(470, y, 830, y, K, 1.6)
h.rect(735, (yc0 + yc1) / 2 - 10, 70, 16, "#fff", None, 0); h.txt(770, (yc0 + yc1) / 2 + 2, "CALZADA", 9.5, 700, K, "middle")
h.txt(826, yc1 + 14, "VEREDA (*)", 8.5, 400, OR, "end"); h.txt(826, 392, "ESPACIO VERDE", 9.5, 700, K, "end")
h.ln(470, yl, 830, yl, K, 2.4, 'stroke-dasharray="16 4"'); h.txt(476, yl - 8, "LINEA PREENSAMBLADA EPEC", 8.5, 700)
for xx in (px, px + 140):
    h.circ(xx, yl, 5, "url(#CONC)", K, 1); h.circ(xx, yl, 1.5, K, K, 0)
h.txt(px + 148, yl + 16, "POSTE EPEC (*)", 8.5, 400, OR)
h.path(f"M{px},{yl+5} V{yP-5}", "none", K, 1.6)
for i in range(4): h.rect(px - 26 + i * 6, yl - 3, 4, 6, K, K, 0)
h.circ(px, yP, d_poste(0) / 2 * kp * 1.8, "#fff", K, 1.3); h.circ(px, yP, d_poste(0) / 2 * kp * 1.2, "none", K, .5)
h.rect(px - 8, yP - 9, 16, 3, "#fff", K, .6)
gwp = 430 * kp * 1.5; gdp = 200 * kp * 1.5
h.rect(px - gwp / 2, yP + 6, gwp, gdp, GAB_T, K, 1)
h.path(f"M{px},{yP+6+gdp} v18 m-4,-6 l4,6 l4,-6", "none", K, 1.1); h.txt(px + 8, yP + 30, "PUERTA", 8.5, 700)
h.path(f"M{px+4},{yP} H{px+80} Q{px+96},{yP} {px+96},{yP+16} V418 M{px+4},{yP+4} H{px+76} Q{px+90},{yP+4} {px+90},{yP+18} V418", "none", K, .8, h.OCULTA)
h.txt(px + 102, 420, "ZANJA (AP-TC-001)", 8.5, 700)
h.ln(px, yl - 24, px, yl - 8, K, .8, h.EJE); h.ln(px, yP + 36, px, yP + 52, K, .8, h.EJE)
for yy in (yl - 24, yP + 52): h.ln(px - 7, yy, px + 7, yy, K, 1.8)
h.txt(px - 11, yl - 18, "A", 13, 700, K, "end"); h.txt(px - 11, yP + 58, "A", 13, 700, K, "end")
h.dimV(px - 44, yl, yP, "≤ 10000", ext=px - 6)
h.dimV(px - 76, yc1, yP, "2500", ext=px - 8)
h.dimV(px + 60, yc0, yc1, "S/ OBRA (*)", ext=None, c=OR)
h.globo("4", px - 18, yl, 500, yl + 22); h.globo("6", px + 6, yP - 8, 660, yP - 26); h.globo("2", px + gwp / 2, yP + 10, 690, yP + 14)
# =================================================== CORTE A-A AMPLIADO (arriba del poste)
h.titulo(40, 452, "CORTE A-A - APOYO PRFV", "ESC. 1:15 - DE 4600 A 8000 SOBRE EL PISO")
kc = 0.072; yT = 505; xc = 150
Yc = lambda z: yT + (8000 - z) * kc
rc = lambda z: d_poste(z) / 2 * kc
z0c = 4560
h.path(f"M{xc-rc(z0c)},{Yc(z0c)} L{xc-rc(8000)},{Yc(8000)} H{xc+rc(8000)} L{xc+rc(z0c)},{Yc(z0c)}", "url(#ANSI31)", K, 1.2)
e = 6 * kc * 1.6
h.path(f"M{xc-rc(z0c)+e},{Yc(z0c)} L{xc-rc(8000)+e},{Yc(8000)} H{xc+rc(8000)-e} L{xc+rc(z0c)-e},{Yc(z0c)}", "#fff", K, .5)
corte_quiebre(h, xc - 30, xc + 30, Yc(z0c) + 2)
h.ln(xc, Yc(8000) - 10, xc, Yc(z0c) + 10, K, .4, h.EJE)
# rack + MN17 del lado de la línea (izquierda)
zR = 7600; xrk = xc - rc(zR)
h.path(f"M{xrk},{Yc(zR)-9} h-14 v18 h14", "none", K, 1.2)        # rack
mn17(h, xrk - 22, Yc(zR), .62)
# acometida que llega (Cu 4x16), vuelta en la garganta y atadura
cable2d(h, f"M40,{Yc(zR)-34} Q70,{Yc(zR)-10} {xrk-26},{Yc(zR)+1}", 2.4)
cable2d(h, f"M{xrk-26},{Yc(zR)+1} Q{xrk-34},{Yc(zR)+12} {xrk-30},{Yc(zR)+30} L{xc-rc(5300)-5},{Yc(5150)} Q{xc-rc(5100)-5},{Yc(4960)} {xc+2},{Yc(4960)}", 2.4)
for i in range(5): h.ln(xrk - 31 - i * 3.2, Yc(zR) - 3, xrk - 29 - i * 3.2, Yc(zR) + 5, K, .7)
# gabinete de costado con semiabrazaderas (AP-T-012)
gx = xc + rc(5300) + 12; gw = 200 * kc; gz0, gz1 = 5000, 5530
h.rect(gx, Yc(gz1), gw, (gz1 - gz0) * kc, "#fff", K, 1.2); h.ln(gx + gw - 2, Yc(gz1) + 2, gx + gw - 2, Yc(gz0) - 2, K, .5)
for z in (5100, 5430):
    h.rect(xc + rc(z) - 1, Yc(z) - 2, gx - xc - rc(z) + 1, 4, "#fff", K, .7); h.ln(xc - rc(z) - 2, Yc(z), xc - rc(z), Yc(z), K, 1.4)
h.txt(gx + gw + 4, Yc(gz1) + 10, "PUERTA →", 8.5, 700)
# prensacables abajo: acometida 1 1/4", salidas, PAT, fotocontrol
for i, xx in enumerate((gx + 3, gx + 7, gx + 11)):
    h.rect(xx - 1.6, Yc(gz0), 3.2, 4, "#fff", K, .5)
cable2d(h, f"M{xc+2},{Yc(4960)} H{gx+3} V{Yc(gz0)}", 2.4)
# salidas: del gabinete al orificio (babero), adentro del poste hacia abajo
zo = 4780
cable2d(h, f"M{gx+7},{Yc(gz0)+4} V{Yc(zo)-4} Q{gx+7},{Yc(zo)} {gx+3},{Yc(zo)} H{xc+rc(zo)-e}", 1.6)
cable2d(h, f"M{gx+11},{Yc(gz0)+4} V{Yc(zo)-1} Q{gx+11},{Yc(zo)+3} {gx+7},{Yc(zo)+3} H{xc+rc(zo)-e}", 1.6)
h.path(f"M{xc+rc(zo)-e},{Yc(zo)} Q{xc+2},{Yc(zo)} {xc+2},{Yc(zo)+12} V{Yc(z0c)}", "none", K, 1, h.OCULTA)
h.path(f"M{xc+rc(zo)-e},{Yc(zo)+3} Q{xc-2},{Yc(zo)+3} {xc-2},{Yc(zo)+15} V{Yc(z0c)}", "none", K, 1, h.OCULTA)
h.rect(xc + rc(zo) - e, Yc(zo) - 4, e + 1, 10, "url(#FOAM)", K, .5)          # espuma en el orificio
h.path(f"M{xc+rc(zo+300)},{Yc(zo+300)} Q{gx+18},{Yc(zo+200)} {gx+16},{Yc(zo)+14} L{xc+rc(zo-200)},{Yc(zo-200)}", "none", K, 1.3)  # babero
# fotocontrol con su brazo y semiabrazaderas propias (ETG)
zF = 6100; xf = xc + rc(zF)
h.ln(xf - 2 * rc(zF) - 2, Yc(zF), xf, Yc(zF), K, 1.4); h.path(f"M{xf},{Yc(zF)} h24 v-6", "none", K, 1.4)
h.path(f"M{xf+18},{Yc(zF)-6} h12 v-5 q-6,-6 -12,0 z", "#fff", K, .9)
cable2d(h, f"M{xf+24},{Yc(zF)} V{Yc(gz1)}", .9)
# apoya escalera H12
zA = 6700; xa = xc - rc(zA)
h.path(f"M{xa},{Yc(zA)-6} h-22 v12 h22 M{xa-22},{Yc(zA)-6} q-8,6 0,12", "none", K, 1.3)
h.ln(xc - rc(zA) - 2 * 0, Yc(zA) - 6, xc + rc(zA) + 2, Yc(zA) - 6, K, .5)
# cotas
h.dimV(56, Yc(gz0), Yc(gz1), "530", ext=gx - 2)
h.dimH(Yc(gz0) + 26, gx, gx + gw, "200", ext=Yc(gz0) + 8, dy=12)
h.dimV(xc - 54, Yc(zR), Yc(gz0), "(*)", ext=xrk - 16, c=OR)
h.txt(xc + 12, Yc(8000) + 4, "Ø MEDIR (*)", 8.5, 700, OR)
GX2 = 312
for n, (ax, ay), gy in (("6", (xrk - 10, Yc(zR) - 8), 520), ("5", (xrk - 22, Yc(zR) - 11), 546), ("7", (xrk - 36, Yc(zR) + 2), 572),
                         ("12", (xa - 14, Yc(zA) + 6), 598), ("3", (xf + 26, Yc(zF) - 9), 624), ("2", (gx + gw - 3, Yc(5250)), 650),
                         ("11", (gx + 1, Yc(5430)), 676), ("8", (gx + 3, Yc(gz0) + 1), 702), ("14", (gx + 14, Yc(zo) + 10), 728),
                         ("13", (xc + rc(zo) - 2, Yc(zo)), 754), ("1", (xc - rc(4700) + 2, Yc(4700)), 780)):
    h.globo(n, ax, ay, GX2, gy)
h.txt(64, 790, "SALIDAS: BAJAN POR DENTRO", 8.5, 700); h.txt(64, 800, "DEL POSTE HASTA LA ZANJA", 8.5, 400, G)
# =================================================== D1 MORSETOS
h.titulo(345, 452, "D1 - DERIVACION EN LA LINEA", "S/E - UN MORSETO POR CONDUCTOR")
ly = 520
for dy, c in ((-6, "#1a1a1a"), (-2, "#2b2b2b"), (2, "#1a1a1a"), (6, "#2b2b2b")):
    h.ln(350, ly + dy, 590, ly + dy, c, 3.2)
for xx in range(352, 590, 14): h.ln(xx, ly - 8, xx + 6, ly + 8, "#666", .5)
h.txt(450, ly - 34, "LINEA EPEC 50 mm²", 8.5, 400)
fx = [(400, "R", CORES[0][0]), (440, "S", CORES[1][0]), (480, "T", CORES[2][0]), (520, "N", CORES[3][0])]
for i, (xx, f, c) in enumerate(fx):
    morseto2d(h, xx, ly, .8, True)
    h.path(f"M{xx},{ly+11} V{ly+30+i*6} Q{xx},{ly+38+i*6} {xx+8},{ly+38+i*6} H{xx+14}", "none", "#111", 4.2)
    h.path(f"M{xx},{ly+11} V{ly+30+i*6} Q{xx},{ly+38+i*6} {xx+8},{ly+38+i*6} H{xx+14}", "none", c if f != "S" else "#444", 2.4)
    capuchon2d(h, xx + 14, ly + 38 + i * 6, .9, True)
    h.txt(xx - 8, ly + 26, f, 9, 700, K, "end")
    h.path(f"M{xx},{ly+30+i*6} Q{xx},{ly+68} {560},{ly+86}", "none", "#111", 2.6)
h.path(f"M560,{ly+86} L588,{ly+96}", "none", "#111", 7); h.path(f"M560,{ly+86} L588,{ly+96}", "none", "#444", 2)
h.txt(470, ly + 104, "Cu 4x16 AL RACK", 8.5, 700, K, "middle")
h.dimH(ly - 30, 400, 440, "(*)", c=OR, ext=ly - 18)
h.globo("4", 400, ly - 8, 368, ly + 40); h.globo("9", 534, ly + 56, 582, ly + 40)
h.txt(352, ly + 120, "Cu: MORSETO BIMETALICO 1995/6 (PKD-14). Al 3x25: 1995/3 (PKD-16).", 8.5, 400)
# =================================================== D2 RETENCION
h.titulo(612, 452, "D2 - RETENCION EN EL RACK", "S/E - 1 POR PUNTA (2 POR TABLERO)")
rx_ = 800; ry_ = 545
h.rect(rx_, ry_ - 60, 18, 120, "url(#ANSI31)", K, 1)                 # pared del poste (corte)
h.rect(rx_ - 6, ry_ - 24, 6, 48, "url(#galv)", K, .7)              # semiabrazadera
for yy in (ry_ - 18, ry_ + 18): h.rect(rx_ - 12, yy - 3, 6, 6, "#ccc", K, .5)
h.path(f"M{rx_-6},{ry_-30} h-46 v60 h46 v-4 h-42 v-52 h42 z", "url(#galv)", K, .9)  # rack en U
mn17(h, rx_ - 30, ry_, 1.05, True)
h.ln(rx_ - 30, ry_ - 36, rx_ - 30, ry_ + 36, K, 2)                   # bulón
for yy, w_ in ((ry_ - 32, 14), (ry_ + 31, 14)): h.rect(rx_ - 30 - w_ / 2, yy - 1.5, w_, 3, "#bbb", K, .5)
h.rect(rx_ - 35, ry_ + 34, 10, 5, "#999", K, .5); h.rect(rx_ - 34, ry_ + 39, 8, 6, "#777", K, .5)
cable2d(h, f"M610,{ry_+2} H{rx_-46} Q{rx_-50},{ry_+12} {rx_-46},{ry_+22} H{rx_-60} Q{rx_-110},{ry_+24} {rx_-130},{ry_+70}", 3.4)
for i in range(7): h.ln(rx_ - 62 - i * 5, ry_ + 15, rx_ - 60 - i * 5, ry_ + 29, "#777", 1)
h.rect(rx_ - 100, ry_ - 2, 15, 8, "#ddd", K, .6)                    # chapa de retención (*)
h.txt(612, ry_ - 8, "DE LA LINEA", 8.5, 700); h.txt(640, ry_ + 92, "AL GABINETE", 8.5, 700)
for n, (ax, ay), (gx_, gy_) in (("6", (rx_ - 50, ry_ - 28), (680, 488)), ("5", (rx_ - 24, ry_ - 8), (740, 488)), ("7", (rx_ - 75, ry_ + 22), (650, 620)),
                                 ("15", (rx_ - 93, ry_ + 3), (614, 488)), ("16", (rx_ - 30, ry_ + 40), (790, 622)), ("17", (rx_ - 3, ry_ - 20), (832, 488))):
    h.globo(n, ax, ay, gx_, gy_)
# =================================================== D3 CABLES ADMITIDOS
h.titulo(345, 660, "D3 - CABLES ADMITIDOS (REF. 12)", "S/E - EL DESPLEGABLE SOLO OFRECE ESTOS 4 - SE COBRA EN EL ITEM 11")
for i, (t, tt) in enumerate((("pre", ["PREENSAMBLADO", "Al-Al 3x1x25/50", "IRAM 2263 · Ø≈26"]), ("piloto", ["PILOTO Al", "4x(1x25) XLPE", "IRAM 63002"]),
                              ("auto", ["Cu 4x16 AUTOP.", "XLPE · IRAM 2164", "Ø 22,05 (*)"]), ("lszh", ["Cu 4x16 LSZH", "XLPE · IRAM 62266", "Ø 22,05"]))):
    seccion(h, 390 + i * 125, 722, t, 21, tt)
h.txt(345, 806, "HOY SE USA: Cu 4x16 (BAJADA DE LA GUIA). LOS OTROS 3: VARIANTES ADMITIDAS.", 8.5, 700)
# =================================================== COMPUTO
rows = [("PUNTAS DE RETENCION", "2", "1 EN POSTE EPEC + 1 EN APOYO PRFV"), ("RACK MN 4B2L + MN 17", "2 + 2", "1 + 1 POR PUNTA"),
        ("SEMIABRAZADERAS DEL RACK", "2", "1 JUEGO POR PUNTA (Ø DEL POSTE)"), ("ARANDELA PLANA + DE PRESION", "2 + 2", "1 + 1 POR PUNTA"),
        ("CHAPA DE RETENCION", "2", "1 POR PUNTA"), ("ALAMBRE DE ATAR", "0,10 kg", "2 PUNTAS x 2 m x 0,025 kg/m (*)"),
        ("MORSETO 1995/6 (Cu 4x16)", "4", "1 POR CONDUCTOR (3 F + N)"), ("CAPUCHON R15", "8", "4 CONDUCTORES x 2 PUNTAS"),
        ("OJAL 16 mm² + TERMOCONTR.", "4 + 4", "1 POR CONDUCTOR, AL NH"), ("CABLE Cu 4x16", "L m", "VANO + BAJADA (ITEM 11)"),
        ("SEMIABRAZ. DEL GABINETE", "2", "AP-T-012, POR RANGO DE Ø"), ("ESPUMA + BABERO", "1 + 1", "NOTA 2 (AP-T-015)")]
h.tabla(40, 820, [(186, "l", False), (60, "c", True), (220, "l", False)], [("CONCEPTO", "CANT.", "CALCULO (CALCULADORA)")] + rows, rowh=14.6,
        titulo="COMPUTO POR TABLERO (BAJADA Cu 4x16)", colores=lambda i, j, t: OR if "(*)" in t else K)
# D4 ojal
h.titulo(560, 820, "D4 - LLEGADA AL NH", "ESC. 2:1 - OJAL Cu ESTAÑADO 16 mm² / M10")
s4 = 2.0; ox, oy = 600, 905
h.path(f"M{ox},{oy-5.5*s4/2-1} H{ox+20*s4} V{oy+5.5*s4/2+1} H{ox} Z", "url(#cobre)", K, .8)       # caña
h.path(f"M{ox+20*s4},{oy-8*s4} H{ox+39*s4-8*s4} A{8*s4},{8*s4} 0 0 1 {ox+39*s4-8*s4},{oy+8*s4} H{ox+20*s4} Z", "#d9a066", K, .9)
h.circ(ox + 39 * s4 - 8 * s4, oy, 5.25 * s4, "#fff", K, .8)
h.rect(ox - 34, oy - 5.5 * s4 / 2 - 4, 34 + 14 * s4, 5.5 * s4 + 8, "#222", K, .6, 'opacity=".85"')     # termocontraíble
h.path(f"M{ox-70},{oy} H{ox-34}", "none", CORES[0][0], 9); h.path(f"M{ox-70},{oy} H{ox-34}", "none", "#000", 9, 'opacity=".15"')
h.dimH(oy + 34, ox, ox + 39 * s4, "39", ext=oy + 18, dy=12); h.dimV(ox + 39 * s4 + 16, oy - 8 * s4, oy + 8 * s4, "16", ext=ox + 39 * s4 - 4)
h.dimH(oy - 26, ox, ox + 20 * s4, "Ø 5,5", ext=oy - 8, dy=-4)
h.txt(562, 960, "L 39 · d 5,5 · W 16 · PALMA 2,2 (Lapp)", 8.5, 400); h.txt(562, 973, "TERMOCONTRAIBLE 2057 SOBRE LA CAÑA", 8.5, 400)
h.txt(562, 986, "TERMINAL DEL CALIBRE DEL CABLE ELEGIDO", 8.5, 400)
h.globo("18", ox + 60, oy, 820, 880); h.globo("19", ox - 20, oy - 8, 820, 920)
# =================================================== NOTAS
h.notas(40, 1036, [
    "COTAS EN mm. TIRO FLOJO ≤ 10 m (NOTA 7); SI ES MAS LARGO VA OTRO POSTE. APOYO PRFV A 2,50 m DEL CORDON (NOTA 8).",
    "CABLE SOLO DE LA REF. 12 (D3). INGRESO AL POSTE SELLADO CON ESPUMA DE POLIURETANO + BABERO (NOTA 2, VER AP-T-015).",
    "RACK LO MAS ⟂ POSIBLE AL PREENSAMBLADO; GABINETE A 5 m O MAS, PUERTA AL ESPACIO VERDE; SUJECION AP-T-012; INTERIOR AP-T-007/008.",
    "(*) A CONFIRMAR: ALTURAS DEL RACK, FOTOCONTROL Y APOYA ESCALERA, Ø DEL POSTE, POSICION DEL ORIFICIO Y SALIDA BAJO TIERRA.",
    "(*) 1995/6: PUBLICADO 1,5-10 mm², VER QUE EL GRABADO DIGA 4-16. ESPUMA Y BABERO SIN ITEM EN EL ANEXO I."])
# =================================================== 3D
h.titulo(890, 62, "VISTA 3D - APOYO PRFV CON TABLERO Y ACOMETIDA", "ARRIBA: DE 4500 A 8000 SOBRE EL PISO · RECUADRO: LA BASE CORTADA POR EL EJE")
# ---- parte de arriba
h.iso(.105, 1262, 975)
zR, zA, zF, zo = 7600, 6700, 6100, 4780
der = catenaria((0, -1150, 8050), (0, -d_poste(zR) / 2 - 150, zR + 6), 120, 12)
pole3d(h, 0, 0, 4500, HL)
# rack + aislador del lado de la línea (-y)
anillo3d(h, 0, 0, zR - 50, d_poste(zR) / 2, 3.2)
h.BOX(-45, 45, -d_poste(zR) / 2 - 170, -d_poste(zR) / 2, zR - 64, zR - 44, "#dfe6ec", "#aab6c0", "#7f8b96", "#4a5560", .5)
h.BOX(-45, 45, -d_poste(zR) / 2 - 170, -d_poste(zR) / 2, zR + 44, zR + 64, "#dfe6ec", "#aab6c0", "#7f8b96", "#4a5560", .5)
mn17_3d(h, 0, -d_poste(zR) / 2 - 125, zR, 26, 80)
h.tuboZ(zR + 64, zR + 92, 0, -d_poste(zR) / 2 - 125, 6, 6, "url(#galv)", "#333")
cable3d(h, der, 4.4)
# cola: de la garganta baja pegada al poste hasta debajo del gabinete y entra por el prensacable
tail = [(0, -d_poste(zR) / 2 - 150, zR), (90, -d_poste(zR) / 2 - 120, zR - 140), (110, -d_poste(7000) / 2 - 20, 7000),
        (110, -d_poste(5000) / 2 - 20, 4960), (110, 0, 4900), (110, d_poste(4900) / 2 + 160, 4900), (110, d_poste(4900) / 2 + 160, 4990)]
cable3d(h, tail, 4.4)
for z in (7200, 6400, 5600): anillo3d(h, 0, 0, z, d_poste(z) / 2 + 30, 1.2, "#222", "#000")      # precintos (*)
# apoya escalera H12 (ref. 11)
anillo3d(h, 0, 0, zA, d_poste(zA) / 2, 3.2)
h.BOX(-40, 40, -d_poste(zA) / 2 - 320, -d_poste(zA) / 2, zA - 40, zA, "#dfe6ec", "#aab6c0", "#7f8b96", "#4a5560", .6)
h.BOX(-40, 40, -d_poste(zA) / 2 - 340, -d_poste(zA) / 2 - 300, zA, zA + 90, "#dfe6ec", "#aab6c0", "#7f8b96", "#4a5560", .6)
# fotocontrol con su brazo hacia +x y semiabrazaderas propias
anillo3d(h, 0, 0, zF, d_poste(zF) / 2, 3.2)
h.BOX(d_poste(zF) / 2, d_poste(zF) / 2 + 380, -18, 18, zF - 18, zF + 18, "#dfe6ec", "#aab6c0", "#7f8b96", "#4a5560", .6)
xf = d_poste(zF) / 2 + 380
h.tuboZ(zF + 18, zF + 40, xf, 0, 30, 30, "#3a3a3a", "#111"); h.tuboZ(zF + 40, zF + 106, xf, 0, 42, 42, "#efefe9", "#666")
cable3d(h, [(xf, 0, zF - 18), (xf, 0, zF - 120), (140, d_poste(5600) / 2 + 60, 5560), (140, d_poste(5600) / 2 + 60, 5530)], 2)
# gabinete del lado del espacio verde (+y), 2 semiabrazaderas (AP-T-012)
for z in (5100, 5430): anillo3d(h, 0, 0, z, d_poste(z) / 2, 4.2)
gy0 = d_poste(5300) / 2 + 40
for z in (5100, 5430): h.BOX(-150, 150, d_poste(z) / 2 - 10, gy0, z - 25, z + 25, "#dfe6ec", "#aab6c0", "#7f8b96", "#4a5560", .5)
gab3d(h, -215, 215, gy0, gy0 + 200, 5000, 5530)
p = h.P(0, gy0 + 201, 5330); a_ = 10
h.path(f"M{p[0]},{p[1]-a_} l{a_*.9},{a_*1.5} h-{a_*1.8} z", "#f2c500", "#222", .6)
# salidas al orificio (con espuma) y babero encima
for i, (xx, yy) in enumerate(((20, 70), (-60, 100), (-130, 120))):
    cable3d(h, [(xx, gy0 + yy, 5000), (xx, gy0 + yy, zo + 60 - i * 20), (xx * .3, d_poste(zo) / 2 + 12, zo - i * 25)], 2.4, "#1c1c1c")
po = h.P(0, d_poste(zo) / 2 + 2, zo - 25); h.a(f'<ellipse cx="{po[0]:.1f}" cy="{po[1]:.1f}" rx="9" ry="7" fill="#f2d35e" stroke="#b8961f" stroke-width=".6"/>')
bt, bb = zo + 190, zo - 170           # babero: canal en U, de abajo del gabinete hasta el poste (*)
yb0, yb1 = d_poste(bb) / 2 + 2, gy0 + 170
h.F3([(-120, yb0, bb), (-120, yb1, bt), (-120, yb1, bt - 70), (-120, yb0, bb - 50)], "#7d8993", "#4a5560", .6, .9)
h.F3([(-120, yb0, bb), (120, yb0, bb), (120, yb1, bt), (-120, yb1, bt)], "url(#galv)", "#4a5560", .8, .78)
h.F3([(120, yb0, bb), (120, yb1, bt), (120, yb1, bt - 70), (120, yb0, bb - 50)], "#9aa6b0", "#4a5560", .6, .9)
h.txt(1480, 92, "", 1)
GX = 1468
h.g3("10", der[3], GX, 112, "Cu 4x16 EN TIRO FLOJO")
h.g3("5", (0, -d_poste(zR) / 2 - 125, zR + 30), GX, 148, "AISLADOR MN 17")
h.g3("6", (40, -d_poste(zR) / 2 - 60, zR - 54), GX, 184, "RACK MN 4B2L")
h.g3("12", (40, -d_poste(zA) / 2 - 200, zA - 20), GX, 220, "APOYA ESCALERA H12")
h.g3("3", (xf, 0, zF + 106), GX, 256, "FOTOCONTROL")
h.g3("2", (215, gy0 + 100, 5320), GX, 292, "GABINETE (PUERTA AL VERDE)")
h.g3("11", (0, d_poste(5430) / 2 + 10, 5430 - 30), GX, 328, "SEMIABRAZADERAS 4003")
h.g3("8", (110, d_poste(4900) / 2 + 160, 4985), GX, 364, "PRENSACABLE 1 1/4\"")
h.g3("14", (120, gy0 + 40, zo + 40), GX, 400, "BABERO + ESPUMA")
h.g3("1", (0, d_poste(4600) / 2, 4600), GX, 436, "APOYO PRFV hl 8 m")
# ---- base, cortada por el eje (recuadro)
h.rect(898, 370, 236, 188, "#fff", "#9aa3b0", .6, 'stroke-dasharray="4 3"')
h.txt(906, 384, "BASE - CORTE POR EL EJE", 9.5, 700, NV)
h.iso(.044, 1000, 432)
h.BOX(-900, 0, -900, 1800, -1900, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
h.F3([(-900, -900, 0), (0, -900, 0), (0, -300, 0), (-900, -300, 0)], "#d8d3c8", "#7d776b", .5)
h.F3([(0, 150, -800), (0, 1800, -800), (0, 1800, -450), (0, 150, -450)], "url(#sand3)", "#9c7a3c", .5)
for zz in (-600, -660): cable3d(h, [(0, 40, zz), (0, 1800, zz)], 2.2)
pole3d(h, 0, 0, -EMP, 700)
h.F3([(0, 30, -630), (0, 120, -630), (0, 120, -560), (0, 30, -560)], "#f2d35e", "#b8961f", .5)
x_, y_ = h.P(0, 1300, -630); h.globo("13", x_, y_, 1060, 544, NV, 10); h.txt(1074, 548, "A LA ZANJA (*)", 9.5, 700, NV)
x_, y_ = h.P(0, 0, -1100); h.globo("1", x_, y_, 1088, 470, NV, 10); h.txt(1080, 492, "EMPOTR.", 9.5, 700, NV); h.txt(1080, 504, "≈1,5 m", 9.5, 700, NV)
# =================================================== LISTA DE MATERIALES
L = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
     ("1", "APOYO PRFV hl 8 m, Ro 1050 daN, TOTAL 9,5 m (AP-T-018)", "1", "6015"),
     ("2", "TABLERO ARMADO EN GABINETE PRFV IP65 (530x430x200)", "1", "3058"),
     ("3", "FOTOCONTROL 220 V 10 A IP65 CON BASE", "1", "3012"),
     ("4", "MORSETO BIMETALICO 1995/6 (PKD-14) - Cu 4x16", "4", "4027"),
     ("5", "AISLADOR DE PORCELANA MN 17", "2", "4010"),
     ("6", "RACK MN 4B2L CON SUS SEMIABRAZADERAS", "2", "4032 / 4022"),
     ("7", "ALAMBRE PARA ATADURAS (2 m POR ATADURA) (*)", "0,10 kg", "1001"),
     ("8", "PRENSACABLE 1 1/4\" (ACOMETIDA Cu 4x16, Ø 22,05)", "1", "5025"),
     ("9", "PROTECTOR CAPUCHON R15", "8", "4031"),
     ("10", "CABLE Cu 4x16 XLPE (REF. 12) - VANO + BAJADA", "L m", "1028 / 1027"),
     ("11", "SEMIABRAZADERA SOPORTE DE GABINETE (AP-T-012)", "2", "4003"),
     ("12", "APOYA ESCALERA H12 CON HERRAJES (REF. 11)", "1", "4012"),
     ("13", "SALIDAS DE CIRCUITO Cu XLPE IRAM 2178-1", "S/ PROY.", "S/ CALIBRE"),
     ("14", "ESPUMA DE POLIURETANO + BABERO (NOTA 2)", "1 + 1", "8010 / 4015"),
     ("15", "CHAPA DE RETENCION 52x28x2", "2", "4020"),
     ("16", "ARANDELA PLANA + DE PRESION 1/2\"", "2 + 2", "4014 / 4013"),
     ("17", "CINTA AISLADORA PVC 19 mm", "1", "4021"),
     ("18", "TERMINAL DE OJAL Cu ESTAÑADO 16 mm² (AL NH)", "4", "2046"),
     ("19", "TERMOCONTRAIBLE PARED FINA", "4", "2057"),
     ("V", "VARIANTE: PREENSAMBLADO 3x1x25/50 + 4 MORSETOS 1995/3", "L / 4", "1016 / 4028")]
h.tabla(890, 572, [(40, "c", False), (470, "l", False), (90, "c", True), (150, "c", False)], L, rowh=20.4, titulo="LISTA DE MATERIALES (1 TABLERO AEREO, BAJADA Cu 4x16)",
        colores=lambda i, j, t: OR if ("(*)" in t or t == "A VINCULAR") else K)
h.rotulo(890, h.H - 150, 750, "AP-T-019", "TABLERO AEREO PRFV:", "ACOMETIDA TIRO FLOJO", "EMPLAZAMIENTO, CORTE, MORSETOS, CABLES Y 3D", "S/E / 1:15", "D4 2:1, 3D S/E", fecha="07/11/2026")
h.guardar("ap_t_019.svg"); print("ok")
