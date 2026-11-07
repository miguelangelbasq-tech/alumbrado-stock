import math, sys
sys.path.insert(0, ".")
from _barrio import *

h = nueva()
banner(h, "PLANO OFICIAL PENDIENTE - DIBUJADO CON LA FICHA DE NORMAS, LA CALCULADORA DE BARRIO Y LA GUIA «TENDIDO AEREO». LO NARANJA CON (*) ES A CONFIRMAR")

# ======================= VISTA DE FRENTE (desde la vereda) · ESC 1:75
k = 0.0533; PX = 150; yG = 500
LIB, EMP = 7050, 1450
zR, zC = 6900, 6400           # red (*), boca de arriba del caño = 6,4 m
zF = (400, 3200, 6000)        # flejes (*)
def Y(z): return yG - z * k
h.titulo(40, 74, "VISTA DE FRENTE", "ESC. 1:75 - DESDE LA VEREDA, LA RED A LO LARGO")
suelo2d(h, 40, 340, yG, 120)
d = poste2d(h, PX, yG, k, LIB, EMP, 300, 209, "#fff", K, 1.6)
def R(z): return d(z + EMP) / 2 * k
# zanja (AP-TC-001) a la derecha
zx0, zx1 = 268, 300
h.rect(zx0, yG, zx1 - zx0, 750 * k, "url(#SAND)", K, .8)
# red
h.ln(44, Y(zR), 336, Y(zR), K, 3.4); h.ln(44, Y(zR), 336, Y(zR), "#fff", 1.6)
h.rect(PX - 4, Y(zR) - 2, 8, 9, "#fff", K, .8)
# caño a la derecha del poste
cx = lambda z: PX + R(z) + 2
xc = PX + R(zC) + 2.5
h.path(f"M{PX+R(0)},{yG} L{PX+R(zC)},{Y(zC)} L{PX+R(zC)+4},{Y(zC)} L{PX+R(0)+4},{yG} Z", "#fff", K, 1)
# pipeta (curva hacia abajo)
px_, py_ = PX + R(zC) + 2, Y(zC)
h.path(f"M{px_-2},{py_} q0,-8 7,-8 q6,0 7,6", "none", K, 2.6); h.path(f"M{px_-2},{py_} q0,-8 7,-8 q6,0 7,6", "none", "#fff", 1)
# cable expuesto de la red a la pipeta con babero, morsetos
mx = PX + 40
for i in range(4): h.rect(mx - 6 + i * 4, Y(zR) + 2, 3, 6, "#fff", K, .6)
h.path(f"M{mx},{Y(zR)+8} Q{mx},{py_-14} {px_+12},{py_-2}", "none", K, 1.2)
h.rect(px_ + 5, py_ - 18, 14, 8, "#fff", K, .7, 'transform="rotate(35 %f %f)"' % (px_ + 12, py_ - 14))
# flejes
for z in zF: h.rect(PX - R(z) - 2, Y(z) - 1.5, 2 * R(z) + 10, 3, "#fff", K, .8)
# abajo: caño baja hasta el pie, sigue PEAD a la zanja
yt = yG + 600 * k
h.path(f"M{PX+R(0)+2},{yG} L{PX+R(0)+2},{yt-8} Q{PX+R(0)+2},{yt} {PX+R(0)+10},{yt} L{zx1},{yt}", "none", K, 2.4)
h.path(f"M{PX+R(0)+2},{yG} L{PX+R(0)+2},{yt-8} Q{PX+R(0)+2},{yt} {PX+R(0)+10},{yt} L{zx1},{yt}", "none", "#fff", .9)
h.nivel(48, yG, "±0,00")
h.dimV(320, yG, Y(zC), "6.400", ext=xc + 4)
h.dimV(80, Y(zC), Y(zR), "500 (*)", ext=PX - 8, c=OR)
h.dimV(80, yG, Y(zC), "6.400 CAÑO H°G°", ext=PX - R(zC) - 4)
h.dimV(310, yG, yt, "600", ext=zx1)
blanco(h, (PX + R(0) + zx1) / 2, yt + 46, 84)
h.dimH(yt + 34, PX + R(0) + 2, zx1, "2.000 PEAD (*)", ext=yt + 4, c=OR, dy=12)
for z in zF: h.txt(PX - R(z) - 8, Y(z) + 4, "F", 9.5, 700, K, "end")
# línea de corte A-A por el fleje del medio
for xa in (PX - R(3200) - 26, PX + R(3200) + 26):
    h.ln(xa, Y(3200) - 7, xa, Y(3200) + 7, K, 1.6); h.txt(xa + (6 if xa > PX else -6), Y(3200) - 9, "A", 12, 700, K, "middle")
h.ln(PX - R(3200) - 26, Y(3200), PX + R(3200) + 26, Y(3200), K, .5, 'stroke-dasharray="10 3 2 3"')
h.llamadaDet(xc, Y(zC) + 4, 34, "D1")
h.llamadaDet(PX + R(0) + 4, yG + 10, 30, "D2")
h.globo("1", xc + 2, Y(4800), 240, Y(4800)); h.globo("2", px_ + 6, py_ - 7, 240, 178)
h.globo("3", PX + R(zF[1]) + 8, Y(zF[1]), 240, Y(2700)); h.globo("6", 240, yt, 210, yt + 70)
h.globo("10", 300, Y(zR), 300, 112); h.globo("11", PX - R(2000), Y(1500), 112, Y(1500))

# ======================= D1 · TOMA DE LA RED Y BOCA DE ARRIBA · ESC 1:15
k1 = .267; X1 = 470; ztop = 7000
def Y1(z): return 108 + (ztop - z) * k1
h.titulo(360, 74, "D1 - TOMA DE LA RED Y PIPETA", "ESC. 1:15 - LADO DEL CAÑO")
zb = 5950
r1 = lambda z: d(z + EMP) / 2 * k1
h.path(f"M{X1-r1(zb)},{Y1(zb)} L{X1-r1(ztop)},{Y1(ztop)} L{X1+r1(ztop)},{Y1(ztop)} L{X1+r1(zb)},{Y1(zb)}", "#fff", K, 1.6)
h.ln(X1, Y1(ztop) - 6, X1, Y1(zb) + 8, K, .45, h.EJE)
h.path(f"M{X1-r1(zb)-6},{Y1(zb)} l8,-5 l10,9 l10,-9 l10,9 l8,-5", "none", K, .9)
# caño 2" (Ø60,3 * ) pegado al poste
rc = 60.3 / 2 * k1; xcc = X1 + r1(zC) + rc + 1
h.rect(xcc - rc, Y1(zC), 2 * rc, Y1(zb) - Y1(zC) + 6, "url(#ANSI31)", K, 1)
h.rect(xcc - rc + 3.2 * k1 * 2, Y1(zC), 2 * rc - 6.4 * k1 * 2, Y1(zb) - Y1(zC) + 6, "#fff", K, .6)
# pipeta: curva de 180 que mira para abajo
pr = rc
h.path(f"M{xcc+rc},{Y1(zC)} L{xcc+rc},{Y1(zC)-22} Q{xcc+rc},{Y1(zC)-22-rc} {xcc+rc*1.5},{Y1(zC)-22-rc} Q{xcc+rc*2},{Y1(zC)-22-rc} {xcc+rc*2},{Y1(zC)-22} L{xcc+rc*2},{Y1(zC)-8}", "none", K, 1.2)
# espuma en la boca de la pipeta
h.rect(xcc + rc * 2 - 1, Y1(zC) - 9, rc + 2, 6, "url(#FOAM)", K, .6)
# cable que entra por la pipeta desde la red, con el babero
yR = Y1(zR)
h.path(f"M{X1+60},{yR+14} Q{X1+75},{yR+60} {xcc+rc*2.5},{Y1(zC)-6} L{xcc+rc*2.5},{Y1(zC)-2}", "none", K, 4.2)
h.path(f"M{X1+60},{yR+14} Q{X1+75},{yR+60} {xcc+rc*2.5},{Y1(zC)-6} L{xcc+rc*2.5},{Y1(zC)-2}", "none", "#fff", 2.6)
h.path(f"M{xcc-rc-8},{Y1(zC)-30} Q{xcc+rc},{Y1(zC)-70} {xcc+rc*4+6},{Y1(zC)-30} L{xcc+rc*4+2},{Y1(zC)-24} Q{xcc+rc},{Y1(zC)-60} {xcc-rc-4},{Y1(zC)-24} Z", "#fff", K, .9)
# cable dentro del caño (oculto)
h.ln(xcc, Y1(zC) + 4, xcc, Y1(zb), K, .6, h.OCULTA)
# red: preensamblado (haz) y 4 morsetos 1995/1
h.ln(368, yR, 600, yR, K, 9); h.ln(368, yR, 600, yR, "#fff", 7)
for xx in range(372, 600, 14): h.ln(xx, yR - 4, xx + 8, yR + 4, K, .5)
h.rect(X1 - 4, yR - 4, 8, 22, "#fff", K, .9)
for i in range(4): morseto2d(h, X1 + 32 + i * 16, yR, .36)
h.path(f"M{X1+32},{yR+20} Q{X1+44},{yR+26} {X1+60},{yR+14}", "none", K, .6)
# flejes
h.rect(X1 - r1(zF[2]) - 3, Y1(zF[2]) - 4, xcc + rc + 6 - (X1 - r1(zF[2]) - 3), 8, "#fff", K, 1)
h.rect(xcc + rc + 4, Y1(zF[2]) - 6, 8, 12, "#fff", K, 1)
h.dimV(X1 - r1(zb) - 32, Y1(zR), Y1(zC), "500 (*)", ext=X1 - r1(zR) - 4, c=OR)
h.dimV(X1 - r1(zb) - 32, Y1(zC), Y1(zF[2]), "400 (*)", ext=X1 - r1(zC) - 4, c=OR)
h.txt(372, yR + 20, "PREENSAMBLADO", 9, 400, G)
h.globo("7", X1 + 56, yR - 20, 380, 126, r=9)
h.globo("9", xcc + rc * 3.5, Y1(zC) - 44, 600, Y1(zC) - 70, r=9)
h.globo("2", xcc + rc * 1.5, Y1(zC) - 22 - rc, 600, Y1(zC) - 30, r=9)
h.globo("8", xcc + rc * 2.6, Y1(zC) - 6, 600, Y1(zC) + 8, r=9)
h.globo("5", X1 + 70, yR + 48, 380, yR + 70, r=9)
h.globo("3", xcc + rc + 8, Y1(zF[2]), 600, Y1(zF[2]) - 4, r=9)
h.globo("1", xcc - rc, Y1(6250), 600, Y1(6250) + 26, r=9)

# ======================= CORTE A-A · ESC 1:10
k2 = .42; ax, ay = 735, 220
h.titulo(640, 74, "CORTE A-A", "ESC. 1:10 - POR UN FLEJE")
rp = 110 * k2; rcn = 60.3 / 2 * k2
h.circ(ax, ay, rp, "url(#CONCP)", K, 1.6)
ccx = ax + rp + rcn
h.cano(ccx, ay, rcn, rcn - 3.65 * k2 * 1.6, "#fff")
h.cable(ccx, ay, 8, False, False, 4)
# fleje alrededor de los dos
h.path(f"M{ax},{ay-rp-3} A{rp+3},{rp+3} 0 1 0 {ax},{ay+rp+3} L{ccx},{ay+rcn+3} A{rcn+3},{rcn+3} 0 0 0 {ccx},{ay-rcn-3} Z", "none", K, 1.8)
h.rect(ccx + rcn + 2, ay - 6, 8, 12, "#fff", K, 1)
h.dimH(ay + rp + 22, ax - rp, ax + rp, "Ø220 (SE MIDE)", ext=ay + 4, dy=12)
h.dimH(ay - rp - 18, ccx - rcn, ccx + rcn, "60,3 (*)", ext=ay - rcn - 4, c=OR)
h.txt(ax - rp - 6, ay + rp + 52, "FLEJE = π × Ø + 0,30 = 0,99 m", 10, 700)
h.globo("3", ax - rp * .7, ay - rp * .7 - 3, 660, 128, r=9); h.globo("4", ccx + rcn + 10, ay, 840, ay + 40, r=9)
h.globo("5", ccx, ay + 3, 840, ay + 80, r=9)

# ======================= D2 · BOCA DE ABAJO Y PASO A LA ZANJA · ESC 1:25
k3 = .16; X3 = 420; yG3 = 512
def Y3(z): return yG3 - z * k3
h.titulo(360, 412, "D2 - PIE DEL POSTE Y PASO A LA ZANJA", "ESC. 1:25 - CORTE POR EL CAÑO")
h.rect(364, yG3, 486, 150, "url(#EARTH)", K, 0)
h.rect(364, yG3 - 5, 486, 5, "url(#CONCP)", K, .6); h.ln(364, yG3, 850, yG3, K, 1.4)
# zanja AP-TC-001: tapada 600, excava 750, ancho 400 (2 cond.)
zw = 400 * k3; zx = 760
h.rect(zx, yG3, zw, 750 * k3, "url(#ANSI37)", K, 1.4)
h.rect(zx, Y3(-750), zw, 100 * k3, "url(#SAND)", K, .6)
h.ln(zx, Y3(-300), zx + zw, Y3(-300), K, 1.4, h.MALLA)
h.rect(364, yG3, (X3 - 364) + 0, 1, "#fff", K, 0)
rr3 = d(EMP) / 2 * k3
h.rect(X3 - rr3, yG3 - 60, 2 * rr3, 60 + 150, "url(#CONCP)", K, 1.6)
# caño H°G° hasta el piso (*), espuma, PEAD que sigue
rc3 = 60.3 / 2 * k3; xc3 = X3 + rr3 + rc3 + 1
h.rect(xc3 - rc3, yG3 - 60, 2 * rc3, 60, "url(#ANSI31)", K, 1)
h.rect(xc3 - rc3 + 1.5, yG3 - 60, 2 * rc3 - 3, 60, "#fff", K, .5)
h.rect(xc3 - rc3 + 1.5, yG3 - 8, 2 * rc3 - 3, 8, "url(#FOAM)", K, .6)
rpe = 50 / 2 * k3; yp = Y3(-600)
h.path(f"M{xc3-rpe},{yG3} L{xc3-rpe},{yp-14} Q{xc3-rpe},{yp+rpe} {xc3+14},{yp+rpe} L{zx+zw/2},{yp+rpe}", "none", K, 1)
h.path(f"M{xc3+rpe},{yG3} L{xc3+rpe},{yp-14} Q{xc3+rpe},{yp-rpe} {xc3+14},{yp-rpe} L{zx+zw/2},{yp-rpe}", "none", K, 1)
h.ln(xc3, yG3 - 56, xc3, yp - 10, K, .6, h.OCULTA)
h.circ(zx + zw / 2, yp, rpe + .5, "#fff", K, .9); h.circ(zx + zw / 2, yp, 2, "#111", K, .3)
h.dimV(zx + zw + 14, yG3, yp, "600", ext=zx + zw)
h.dimV(zx + zw + 30, yG3, Y3(-750), "750", ext=zx + zw)
h.dimH(Y3(-750) + 18, zx, zx + zw, "400", ext=Y3(-750), dy=12)
blanco(h, (xc3 + zx + zw / 2) / 2, yp + 46, 120)
h.dimH(yp + 34, xc3, zx + zw / 2, "PEAD Ø50 · 2.000 (*)", ext=yp + 6, c=OR, dy=12)
h.txt(zx - 4, yG3 - 12, "ZANJA AP-TC-001", 9.5, 700, K, "end")
h.txt(xc3 + 8, yG3 - 30, "ESPUMA EN LA BOCA", 9.5, 400, G)
blanco(h, xc3 + 58, yG3 + 30, 104); h.txt(xc3 + 8, yG3 + 30, "UNION CAÑO-PEAD (*)", 9.5, 400, OR)
h.txt(364, yG3 + 196, "", 9)
h.globo("8", xc3, yG3 - 4, 620, 462, r=9); h.globo("6", xc3 + 40, yp + rpe, 540, 654, r=9); h.globo("1", xc3 - rc3, yG3 - 40, 380, 462, r=9)
h.globo("11", X3 - rr3, yG3 + 60, 384, yG3 + 110, r=9)

# ======================= CÓMPUTO
h.tabla(40, 686, [(160, "l", False), (78, "c", True), (300, "l", False)],
        [("POR TRANSICION", "CANT.", "CALCULO (CALCULADORA DE BARRIO)"),
         ("CAÑO H°G° 2\" × 6,4 m", "1 u", "uno por transicion"),
         ("PIPETA 2\"", "1 u", "una por caño, en la boca de arriba"),
         ("FLEJE INOX 3/4\"", "2,97 m", "3 × (π × 0,220 + 0,30) = 3 × 0,99"),
         ("HEBILLAS", "3 u", "una por fleje"),
         ("CABLE Cu 4×4 (DEFECTO)", "10 m", "caño + cola arriba + cola abajo"),
         ("PEAD Ø50", "2 m", "del pie del caño a la zanja"),
         ("MORSETO 1995/1", "4 u", "uno por conductor del cable que baja"),
         ("ESPUMA", "1 u", "sella las dos bocas"),
         ("BABERO", "1 u", "cable expuesto entre la red y la pipeta"),
         ("ITEM 6.07", "6,4 m", "red → subterraneo: por metro de caño"),
         ("ITEM 6.08 (EN VEZ DE 6.07)", "1 u", "si alimenta una columna de A.P.")],
        rowh=19, titulo="COMPUTO POR TRANSICION")
# D3 cable y D4 variante
h.titulo(610, 686, "D3 - CABLE 4×4", "S/E - EN EL CAÑO")
h.cable(660, 760, 26, True, True, 4)
h.globo("5", 660 + 26, 760 - 6, 720, 730, r=9)
for i, (c_, t_) in enumerate([("#7b3f1d", "L1"), ("#1a1a1a", "L2"), ("#c62828", "L3"), ("#4fa3d9", "N")]):
    h.circ(720, 760 + i * 13, 4, c_, K, .4); h.txt(729, 764 + i * 13, t_, 9.5)
h.titulo(610, 832, "VARIANTE (NOTA 5)", "DOBLE AISLACION 2\" × 4 m")
h.rect(640, 870, 14, 4000 * .0533 * .4, "#fff", K, 1)
h.rect(700, 870, 10, 6400 * .0533 * .4, "url(#ANSI31)", K, 1)
h.txt(632, 966, "4 m", 10, 700, K, "end", MONO); h.txt(716, 966, "6,4 m", 10, 700, K, "start", MONO)
h.txt(760, 890, "5004", 10, 700, K, "start", MONO); h.txt(760, 904, "ITEM 8.02", 9.5, 400, G)
h.txt(760, 930, "5501", 10, 700, K, "start", MONO); h.txt(760, 944, "ITEM 8.03", 9.5, 400, G)
h.notas(40, 1000, [
    "COTAS EN mm. TRANSICION DE LA RED AEREA DE BARRIO A UN TENDIDO SUBTERRANEO O A UNA COLUMNA DE A.P. (LP 21478 6.07 / 6.08).",
    "CAÑO H°G° Ø2\" × 6,4 m (8.03) SUJETO AL POSTE CON 3 FLEJES INOX 3/4\" CON HEBILLA, COMO MINIMO (15.74 / 15.75).",
    "ARRIBA PIPETA Y SELLADO. ABAJO BOCA SELLADA CON ESPUMA; EL CABLE SIGUE EN PEAD Ø50 HASTA LA ZANJA (AP-TC-001).",
    "TOMA DE LA RED CON MORSETOS 1995/1, UNO POR CONDUCTOR. CABLE EXPUESTO RED-PIPETA CON BABERO O PVC APTO UV (AP-T-019).",
    "VARIANTE: CAÑO DE DOBLE AISLACION Ø2\" × 4 m (5004, ITEM 8.02). MISMO ARMADO; LA PIPETA QUEDA MAS BAJA.",
    "(*) SIN PLANO: ALTURA DE LA RED, ARRANQUE DEL CAÑO (A NIVEL O ENTERRADO), ALTURA DE LOS FLEJES Y UNION CAÑO-PEAD.",
    "(*) Ø 60,3 DEL CAÑO 2\" ES MEDIDA COMERCIAL, NO DEL PLANO. EL CABLE QUE BAJA ES SEGUN PROYECTO (4×4 EN LA CALCULADORA).",
    "(*) EL MORSETO 1995/1 NO TIENE DATOS PUBLICADOS: VERIFICAR EL RANGO EN EL GRABADO DE LA PIEZA."])

# ======================= 3D · ARRIBA
h.titulo(880, 74, "VISTA 3D - TRANSICION ARRIBA Y ABAJO", "IZQ.: TOMA DE LA RED, BABERO Y PIPETA · DER.: PIE DEL POSTE, TERRENO CORTADO A UN CUARTO")
h.iso(.3, 1080, 2250)
posteZ(h, 5900, 7050, 0, 0, 114, 105)
roturaV(h, h.P(0, 0, 5900)[0], h.P(0, 0, 5900)[1], 26)
# caño H°G° en la cara +x
C0 = 145
tubo(h, (C0, 30, 5900), (C0, 30, zC), 30, "url(#galv)", "#444")
# pipeta (vuelta hacia abajo)
cuerda(h, [(C0, 30, zC), (C0, 30, zC + 70), (C0 + 40, 30, zC + 110), (C0 + 90, 30, zC + 80), (C0 + 100, 30, zC + 20)], 32, "#9aa6b0", "#333", .7)
xx, yy = h.P(C0 + 100, 30, zC + 20); h.circ(xx, yy, 9, "#f6f1c9", "#888", .6)
# fleje de arriba
anilloZ(h, 6000, 0, 0, 120, 22, "url(#inox)", "#666")
xx, yy = h.P(C0 + 40, 30, 6010); h.rect(xx - 4, yy - 6, 8, 10, "url(#inox)", "#555", .6)
# cable 4x4 de la red a la pipeta, con babero
cuerda(h, [(260, -260, zR - 60), (300, -120, zR - 200), (C0 + 100, 30, zC + 60), (C0 + 100, 30, zC + 20)], 13, "#1c1c1c")
h.F3([(C0 + 20, -60, zC + 260), (C0 + 140, -40, zC + 270), (C0 + 160, 60, zC + 140), (C0 + 30, 40, zC + 120)], "#c7ced4", "#555", .7, .92)
# red y ménsula
h.BOX(100, 240, -20, 20, zR - 40, zR + 20, "url(#galv)", "#8a96a0", "#a4afb8", "#333", .6)
for dz, c_ in ((-30, "#1a1a1a"), (-70, "#262626"), (-110, "#1f1f1f"), (-150, "#2b2b2b")):
    cuerda(h, [(250, -480, zR + dz), (250, 600, zR + dz)], 16, c_)
def m3(y, z):
    h.BOX(225, 290, y - 25, y + 25, z - 45, z + 35, "#3a3a3a", "#1d1d1d", "#2a2a2a", "#000", .5)
    tubo(h, (257, y, z + 35), (257, y, z + 75), 7, "url(#galv)", cap="#d0d6dc")
for i, dz in enumerate((-30, -70, -110, -150)): m3(-400 + i * 70, zR + dz)
GL = 900
h.g3("10", (250, -460, zR - 70), GL, 128, "RED")
h.g3("7", (290, -400, zR), GL, 166, "1995/1 × 4")
h.g3("5", (300, -120, zR - 200), GL, 204, "CABLE 4×4")
h.g3("9", (C0 + 90, 0, zC + 200), GL, 242, "BABERO")
h.g3("2", (C0 + 50, 30, zC + 110), GL, 280, "PIPETA")
h.g3("8", (C0 + 100, 30, zC + 20), GL, 318, "ESPUMA")
h.g3("3", (0, 120, 6010), GL, 356, "FLEJE")
h.g3("1", (C0, 30, 6150), GL, 394, "CAÑO H°G° 2\"")

# ======================= 3D · ABAJO
h.iso(.13, 1490, 330)
suelo3d(h, 800, 800, 1700)
h.a(f'<clipPath id="cuarto"><polygon points="{hull(h, 800, 800, 1700)}"/></clipPath><g clip-path="url(#cuarto)">')
posteZ(h, -1450, 0, 0, 0, 150, 144)
# zanja: lecho de arena y PEAD a -600 que sale por el corte (eje x)
h.F3([(300, 0, -750), (800, 0, -750), (800, 0, 0), (300, 0, 0)], "#d8be93", "#6b5232", .8)
h.F3([(300, 0, -750), (800, 0, -750), (800, 0, -500), (300, 0, -500)], "url(#sand3)", "#9a8040", .5)
cuerda(h, [(C0 + 30, 30, 0), (C0 + 30, 30, -500), (C0 + 130, 30, -600), (800, 30, -600)], 25, "url(#pead)", "#000")
h.a('</g>')
xx, yy = h.P(800, 30, -600); h.circ(xx, yy, 25 * .13, "#111", "#000", .5)
posteZ(h, 0, 1500, 0, 0, 144, 140)
roturaV(h, h.P(0, 0, 1500)[0], h.P(0, 0, 1500)[1], 22)
tubo(h, (C0 + 30, 30, 0), (C0 + 30, 30, 1500), 30, "url(#galv)", "#444")
xx, yy = h.P(C0 + 30, 30, 0); h.circ(xx, yy, 30 * .13, "url(#foam3)", "#777", .5)
anilloZ(h, 400, 0, 0, 150, 22, "url(#inox)", "#666")
GR = 1540
h.g3("1", (C0 + 30, 30, 1000), GR, 128, "CAÑO H°G° 2\"")
h.g3("3", (150, 0, 410), GR, 166, "FLEJE + HEBILLA")
h.g3("8", (C0 + 30, 30, 0), GR, 450, "ESPUMA")
h.g3("6", (500, 30, -600), GR, 520, "PEAD Ø50")
h.g3("11", (-60, 0, 1100), 1330, 128, "POSTE")
h.txt(1320, 612, "ZANJA AP-TC-001 CON ARENA, PEAD A -600", 10.5, 400, G, "start", INT)

# ======================= LISTA
filas = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "CAÑO DE H°G° Ø2\", L = 6,4 m (ITEM 8.03)", "1 u", "5501"),
         ("2", "PIPETA / CURVA DE ENTRADA Ø2\" EN LA BOCA DE ARRIBA", "1 u", "5502"),
         ("3", "FLEJE DE ACERO INOXIDABLE AISI 304, 3/4\" (3 × 0,99 m)", "2,97 m", "4024"),
         ("4", "HEBILLA DE ACERO INOXIDABLE AISI 304, 3/4\"", "3 u", "4025"),
         ("5", "CABLE Cu 4×4 XLPE (O EL QUE PIDA EL PROYECTO)", "10 m", "1010"),
         ("6", "CAÑO PEAD Ø50 PN6: DEL PIE DEL CAÑO A LA ZANJA", "2 m", "5005"),
         ("7", "MORSETO DE DERIVACION 1995/1, UNO POR CONDUCTOR", "4 u", "3051"),
         ("8", "ESPUMA DE POLIURETANO: SELLA LAS DOS BOCAS", "1 u", "8010"),
         ("9", "BABERO DE ZINGUERIA O PVC APTO UV (CABLE EXPUESTO)", "1 u", "4015"),
         ("10", "RED EXISTENTE: PREENSAMBLADO / PILOTO (NO SE COMPUTA)", "-", "1501·1502·1503"),
         ("11", "POSTE EXISTENTE H°A° O MADERA Po 8,5 m", "SEGUN OBRA", "6501·6502"),
         ("12", "VARIANTE: CAÑO DOBLE AISLACION Ø2\", L = 4 m (8.02)", "(1 u)", "5004"),
         ("13", "ZANJA Y TENDIDO SUBTERRANEO (VER AP-TC-001)", "-", "VER AP-TC-001")]
h.tabla(880, 646, [(38, "c", False), (468, "l", False), (104, "c", True), (150, "c", False)], filas, rowh=21,
        titulo="LISTA DE MATERIALES (1 TRANSICION, CAÑO H°G°, POSTE Ø220)")
h.rotulo(880, h.H - 150, 760, "AP-TC-024", "TRANSICION AEREO -", "SUBTERRANEA EN POSTE", "CAÑO H°G° 2\", PIPETA, FLEJES Y PASO A LA ZANJA", "1:75 / 1:15", "A-A 1:10 · D2 1:25", fecha="07/11/2026", proyecto="ALUMBRADO DE BARRIOS")
h.guardar("ap_tc_024.svg"); print("ok")
