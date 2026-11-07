import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
from _taer import *
# DATOS: ficha AP-T-015 + AP-T-019 nota 2: «el orificio de ingreso al poste deberá sellarse con espuma de poliuretano y
#  complementarse con una protección mecánica exterior que recubra el tramo de cable expuesto, mediante babero de zinguería
#  o protección equivalente en PVC apto para UV» · calculadora: 8010 espuma (1 por apoyo), 4015 babero (1 por apoyo)
#  «los conductores de salida entran al apoyo de PRFV por un agujero practicado en el poste, con las dimensiones mínimas necesarias»
#  cable de salida Cu XLPE + vaina PVC IRAM 2178-1 apto UV · Ø de referencia (calculadora): 1x10 6,35 · 3x1,5 11,1 · 4x2,5 12,3 · 4x6 16,1 · 4x16 22,1
h = Hoja()
h.a('<defs><pattern id="PU" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#fff"/><circle cx="2" cy="2" r="1.3" fill="none" stroke="#111" stroke-width=".4"/><circle cx="5.5" cy="5" r="1" fill="none" stroke="#111" stroke-width=".4"/></pattern>'
    '<pattern id="PU3" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f2d35e"/><circle cx="2" cy="2" r="1.3" fill="#f8e79a" stroke="#c9a227" stroke-width=".4"/><circle cx="6" cy="5.5" r="1.1" fill="#f8e79a" stroke="#c9a227" stroke-width=".4"/></pattern></defs>')
ZO = 4780; DO = 50          # centro y Ø del orificio para dibujar (*)
EP = 8                      # pared del poste PRFV (*)
CAB = [12.3, 12.3, 6.35]    # ejemplo: 2 circuitos 4x2,5 + 1x10 V/A a la jabalina (Ø de la calculadora)
# =================================================== CORTE A-A (vertical por el orificio)
h.titulo(40, 62, "CORTE A-A (POR EL ORIFICIO)", "ESC. 1:2,5 - EL BABERO CUBRE EL CABLE A LA VISTA")
k = 0.55; xc = 150; Y = lambda z: 126 + (5100 - z) * k
za, zb = 4560, 5100
R = lambda z: d_poste(z) / 2 * k; e = EP * k * 1.3
# pared del poste en corte (dos paredes) con el orificio del lado +y (derecha)
h.path(f"M{xc-R(za)},{Y(za)} L{xc-R(zb)},{Y(zb)} h{e} L{xc-R(za)+e},{Y(za)} Z", "url(#ANSI31)", K, 1)
yo0, yo1 = Y(ZO + DO / 2), Y(ZO - DO / 2)
h.path(f"M{xc+R(za)},{Y(za)} L{xc+R(ZO)},{yo1} h-{e} L{xc+R(za)-e},{Y(za)} Z", "url(#ANSI31)", K, 1)
h.path(f"M{xc+R(ZO)},{yo0} L{xc+R(zb)},{Y(zb)} h-{e} L{xc+R(ZO)-e},{yo0} Z", "url(#ANSI31)", K, 1)
corte_quiebre(h, xc - R(za) - 12, xc + R(za) + 12, Y(za) + 3); h.ln(xc, Y(zb) - 8, xc, Y(za) + 8, K, .4, h.EJE)
# gabinete (fondo) arriba a la derecha con prensacables
gx = xc + R(5100) + 40 * k
h.rect(gx, Y(5100) - 6, 200 * k + 10, 6, "#fff", K, 1.2); h.txt(gx + 2, Y(5100) - 10, "FONDO DEL GABINETE", 8.5, 700)
xs = [gx + 22, gx + 44, gx + 64]
for x_ in xs: h.rect(x_ - 6, Y(5100), 12, 12, "#fff", K, .7); h.rect(x_ - 4, Y(5100) + 12, 8, 6, "#fff", K, .6)
# cables: bajan del prensacable, doblan y entran por el orificio; adentro bajan (ocultos)
xin = xc + R(ZO) - e
for i, (x_, d) in enumerate(zip(xs, CAB)):
    w = d * k; zz = ZO + 14 - i * 14
    cable2d(h, f"M{x_},{Y(5100)+18} V{Y(zz)-12} Q{x_},{Y(zz)} {x_-12},{Y(zz)} H{xin-6}", w)
    h.path(f"M{xin-6},{Y(zz)} Q{xc+8-i*9},{Y(zz)} {xc+8-i*9},{Y(zz)+16} V{Y(za)}", "none", K, 1.3, h.OCULTA)
# espuma: tapón en el orificio y un poco adentro y afuera
h.path(f"M{xc+R(ZO)+8},{yo0-3} Q{xc+R(ZO)+14},{Y(ZO)} {xc+R(ZO)+8},{yo1+3} L{xc+R(ZO)-e-10},{yo1+6} Q{xc+R(ZO)-e-18},{Y(ZO)} {xc+R(ZO)-e-10},{yo0-6} Z", "url(#PU)", K, .8)
for i, (x_, d) in enumerate(zip(xs, CAB)):          # los cables se ven atravesando la espuma
    zz = ZO + 14 - i * 14; h.ln(xc + R(ZO) - e - 10, Y(zz), xc + R(ZO) + 12, Y(zz), K, d * k * .9)
# babero: chapa doblada, de abajo del gabinete hasta 100 (*) bajo el orificio
bt, bb = 5090, ZO - 120
bx_out = gx + 200 * k + 14
h.path(f"M{bx_out},{Y(bt)} L{bx_out},{Y(ZO+60)} Q{bx_out},{Y(bb+40)} {xc+R(bb)+4},{Y(bb)} L{xc+R(bb)+1},{Y(bb)+12}", "none", K, 2.2)
h.path(f"M{xc+R(bb)+1},{Y(bb)+12} L{xc+R(bb)+1},{Y(bb)-10}", "none", K, 2.2)
h.circ(xc + R(bb) + 1, Y(bb) + 2, 2.5, K, K, 0); h.circ(bx_out, Y(bt) - 2, 2.5, K, K, 0)
h.txt(xc + R(bb) + 8, Y(bb) + 22, "FIJACION (*)", 8.5, 700, OR)
# cotas
h.dimV(xc - R(za) - 26, yo0, yo1, "Ø (*)", ext=xc - R(ZO) + 2, c=OR)
h.dimV(bx_out + 26, Y(bt), Y(bb), "(*)", ext=bx_out + 4, c=OR)
h.dimH(Y(za) + 22, xc - R(za), xc - R(za) + e, "PARED (*)", ext=Y(za) + 4, c=OR, dy=14)
h.txt(xc - R(zb) - 6, Y(zb) + 14, "APOYO PRFV", 8.5, 700, K, "end"); h.txt(xc - R(zb) - 6, Y(zb) + 25, "(AP-T-018)", 8.5, 400, G, "end")
h.txt(xc + R(za) + 8, Y(za) - 4, "BAJAN A LA ZANJA", 8.5, 700)
GX = 345
h.globo("1", xc - R(4650) + 3, Y(4650), 70, Y(4650) + 40)
h.globo("2", xc + R(ZO) + 10, Y(ZO) + 8, GX, Y(ZO) + 48)
h.globo("3", bx_out, Y(ZO + 120), GX, Y(ZO + 200))
h.globo("4", xs[0], Y(4980), GX, Y(5040))
h.globo("5", xs[1], Y(5100) + 6, GX, Y(5100) - 18)
h.globo("6", xc + R(ZO) - e / 2, yo1 + 14, GX, Y(ZO) + 110)
# =================================================== VISTA FRONTAL
h.titulo(395, 62, "VISTA C (DE FRENTE)", "ESC. 1:5 - DESDE EL ESPACIO VERDE")
kf = 0.3; fx = 500; Yf = lambda z: 126 + (5100 - z) * kf
Rf = lambda z: d_poste(z) / 2 * kf
h.path(f"M{fx-Rf(za)},{Yf(za)} L{fx-Rf(zb)},{Yf(zb)} M{fx+Rf(za)},{Yf(za)} L{fx+Rf(zb)},{Yf(zb)}", "none", K, 1.2)
corte_quiebre(h, fx - 40, fx + 40, Yf(za) + 3); h.ln(fx, Yf(zb) - 8, fx, Yf(za) + 8, K, .4, h.EJE)
h.rect(fx - 215 * kf, Yf(5100) - 22, 430 * kf, 22, "#fff", K, 1.2); h.txt(fx, Yf(5100) - 8, "GABINETE", 8.5, 700, K, "middle")
h.circ(fx, Yf(ZO), DO / 2 * kf, "none", K, .8, h.OCULTA)
bw = 160                         # ancho del babero (*)
h.path(f"M{fx-bw/2*kf},{Yf(bt)} V{Yf(bb)} Q{fx},{Yf(bb)+10} {fx+bw/2*kf},{Yf(bb)} V{Yf(bt)}", "#fff", K, 1.5)
h.path(f"M{fx-bw/2*kf+5},{Yf(bt)} V{Yf(bb)-2}", "none", K, .5); h.path(f"M{fx+bw/2*kf-5},{Yf(bt)} V{Yf(bb)-2}", "none", K, .5)
for x_ in (fx - 12, fx, fx + 12): h.ln(x_, Yf(bt), x_, Yf(ZO), K, .7, h.OCULTA)
h.circ(fx, Yf(bb) + 2, 1.8, K, K, 0)
h.dimH(Yf(bb) + 30, fx - bw / 2 * kf, fx + bw / 2 * kf, "(*)", ext=Yf(bb) + 6, c=OR, dy=12)
h.ln(fx - 70, Yf(ZO), fx - Rf(ZO) - 2, Yf(ZO), K, .8, h.EJE); h.ln(fx + Rf(ZO) + 2, Yf(ZO), fx + 70, Yf(ZO), K, .8, h.EJE)
for x_ in (fx - 70, fx + 70): h.ln(x_, Yf(ZO) - 7, x_, Yf(ZO) + 7, K, 1.8)
h.txt(fx - 76, Yf(ZO) + 4, "B", 13, 700, K, "end"); h.txt(fx + 76, Yf(ZO) + 4, "B", 13)
h.ln(fx, Yf(za) + 22, fx, Yf(za) + 40, K, .8, h.EJE); h.ln(fx - 7, Yf(za) + 40, fx + 7, Yf(za) + 40, K, 1.8); h.txt(fx + 6, Yf(za) + 50, "A", 13, 700)
h.globo("3", fx + bw / 2 * kf - 2, Yf(4900), 580, Yf(4950))
# =================================================== CORTE B-B (planta por el orificio)
h.titulo(620, 62, "CORTE B-B (PLANTA)", "ESC. 1:2,5 - POR EL ORIFICIO")
kb = 0.6; bx, by = 720, 230; Rb = d_poste(ZO) / 2 * kb; eb = EP * kb * 1.3
a0 = math.asin((DO / 2 * kb) / Rb)
def arco(r, a1, a2): return f"{bx + r * math.cos(a1):.1f},{by + r * math.sin(a1):.1f}", f"{bx + r * math.cos(a2):.1f},{by + r * math.sin(a2):.1f}"
p1, p2 = arco(Rb, math.pi / 2 + a0, math.pi / 2 - a0 + 2 * math.pi); q1, q2 = arco(Rb - eb, math.pi / 2 - a0 + 2 * math.pi, math.pi / 2 + a0)
h.path(f"M{p1} A{Rb:.1f},{Rb:.1f} 0 1 1 {p2} L{q1} A{Rb-eb:.1f},{Rb-eb:.1f} 0 1 0 {q2} Z", "url(#ANSI31)", K, 1)
h.path(f"M{bx-DO/2*kb-4},{by+Rb-eb-8} Q{bx},{by+Rb-eb-14} {bx+DO/2*kb+4},{by+Rb-eb-8} L{bx+DO/2*kb+3},{by+Rb+8} Q{bx},{by+Rb+12} {bx-DO/2*kb-3},{by+Rb+8} Z", "url(#PU)", K, .8)
for i, d in enumerate(CAB): h.circ(bx - 10 + i * 10, by + Rb - 2, d * kb / 2, "#fff", K, .8); h.circ(bx - 10 + i * 10, by + Rb - 2, d * kb / 2 * .5, "url(#cuH)", K, .3)
# babero en U alrededor
bwp = bw * kb
h.path(f"M{bx-bwp/2},{by+Rb-12} V{by+Rb+70} H{bx+bwp/2} V{by+Rb-12}", "none", K, 2.2)
for i, d in enumerate(CAB): h.circ(bx - 18 + i * 18, by + Rb + 46, d * kb / 2, "#fff", K, .8)
h.txt(bx, by + Rb + 92, "CABLES BAJO EL BABERO", 8.5, 700, K, "middle")
h.ln(bx, by - Rb - 16, bx, by + Rb + 100, K, .4, h.EJE); h.ln(bx - Rb - 16, by, bx + Rb + 16, by, K, .4, h.EJE)
h.dimH(by + Rb + 108, bx - bwp / 2, bx + bwp / 2, "(*)", ext=by + Rb + 72, c=OR, dy=12)
h.dimH(by - Rb - 14, bx - Rb, bx + Rb, "Ø DEL POSTE (MEDIR) (*)", ext=by - 4, c=OR)
h.globo("2", bx + DO / 2 * kb + 2, by + Rb, 822, by + 40); h.globo("3", bx + bwp / 2, by + Rb + 30, 822, by + Rb + 30); h.globo("1", bx - Rb + 4, by - 10, 640, by - 30)
# =================================================== D1 ORIFICIO
h.titulo(40, 510, "D1 - ORIFICIO Y ESPUMA", "ESC. 2:1 - LO JUSTO PARA LOS CABLES (NOTA 2)")
dx, dy = 150, 632; kd = 2.0
h.circ(dx, dy, DO / 2 * kd + 16, "url(#ANSI31)", K, .8); h.circ(dx, dy, DO / 2 * kd, "url(#PU)", K, 1.1)
pos = [(-14, -12), (14, -12), (0, 16)]
for (ox, oy), d, (col, lab) in zip(pos, CAB, (("#222", "4x2,5"), ("#222", "4x2,5"), ("#3f8f3f", "1x10 V/A"))):
    if d > 10: h.cable(dx + ox * kd / 1.4, dy + oy * kd / 1.4, d / 2 * kd, color=True, hilos=False)
    else:
        h.circ(dx + ox, dy + oy * kd / 1.4, d / 2 * kd, "#2e8b3a", K, .7); h.circ(dx + ox, dy + oy * kd / 1.4, d / 2 * kd * .7, "url(#cobre)", K, .4)
        h.path(f"M{dx+ox-d/2*kd},{dy+oy*kd/1.4} h{d*kd}", "none", "#f2d000", 2.2)
h.dimH(dy - DO / 2 * kd - 26, dx - DO / 2 * kd, dx + DO / 2 * kd, "Ø MINIMO (*)", ext=dy - 4, c=OR)
h.txt(dx + DO / 2 * kd + 24, dy - 4, "ESPUMA DE", 8.5, 700); h.txt(dx + DO / 2 * kd + 24, dy + 8, "POLIURETANO", 8.5, 700)
h.txt(dx + DO / 2 * kd + 24, dy + 20, "LLENA TODO", 8.5, 400, G); h.txt(dx + DO / 2 * kd + 24, dy + 32, "EL HUECO", 8.5, 400, G)
h.txt(46, dy + DO / 2 * kd + 34, "EJEMPLO: 2 CIRCUITOS 4x2,5 + 1x10 V/A", 8.5, 400, G)
# tabla de Ø
TD = [("CABLE", "Ø ext."), ("1x10 V/A", "6,35"), ("3x1,5", "11,1"), ("4x2,5", "12,3"), ("4x6", "16,1"), ("4x16", "22,1")]
h.tabla(40, 742, [(80, "l", False), (60, "c", True)], TD, rowh=15, titulo="Ø DE REFERENCIA (mm)")
# =================================================== D2 BABERO (desarrollo)
h.titulo(300, 510, "D2 - BABERO DE ZINGUERIA", "S/E - DESARROLLO DE LA CHAPA; MEDIDAS (*)")
sx, sy = 340, 560; W2, H2 = 150, 190
h.path(f"M{sx},{sy} H{sx+W2} V{sy+H2-40} Q{sx+W2/2},{sy+H2+6} {sx},{sy+H2-40} Z", "#fff", K, 1.4)
for f in (.18, .82): h.ln(sx + W2 * f, sy, sx + W2 * f, sy + H2 - 34, K, .8, 'stroke-dasharray="6 3"')
h.ln(sx, sy + 26, sx + W2, sy + 26, K, .8, 'stroke-dasharray="6 3"')
for (x_, y_) in ((sx + 12, sy + 13), (sx + W2 - 12, sy + 13), (sx + W2 / 2, sy + H2 - 20)): h.circ(x_, y_, 3, "#fff", K, .7)
h.dimH(sy - 14, sx, sx + W2, "(*)", ext=sy - 2, c=OR); h.dimV(sx + W2 + 18, sy, sy + H2 - 14, "(*)", ext=sx + W2 + 4, c=OR)
h.txt(sx + W2 + 30, sy + 14, "PLIEGUE CONTRA", 8.5, 700); h.txt(sx + W2 + 30, sy + 26, "EL GABINETE", 8.5, 400, G)
h.txt(sx + W2 + 30, sy + 92, "PLIEGUES", 8.5, 700); h.txt(sx + W2 + 30, sy + 104, "LATERALES (U)", 8.5, 400, G)
h.txt(sx + W2 + 30, sy + 164, "PUNTA REDONDA", 8.5, 700); h.txt(sx + W2 + 30, sy + 176, "SOBRE EL ORIFICIO", 8.5, 400, G)
h.txt(302, sy + H2 + 30, "CHAPA GALVANIZADA O ZINC (*); SIN FILOS QUE CORTEN EL CABLE.", 8.5, 400, OR)
# =================================================== VARIANTE PVC UV
h.titulo(600, 510, "VARIANTE: PVC APTO UV", "S/E - LA NOTA 2 LA ADMITE COMO EQUIVALENTE")
vx, vy = 660, 570
h.path(f"M{vx},{vy} V{vy+150} M{vx+70},{vy} V{vy+150}", "none", K, 1.2)
h.path(f"M{vx+70},{vy+20} h30 a22,22 0 0 1 0,44 h-30", "none", K, .8, h.OCULTA)
h.rect(vx + 70, vy + 20, 46, 120, "#fff", K, 1.4, 'rx="10"'); h.rect(vx + 74, vy + 24, 38, 112, "none", K, .4, 'rx="8"')
for yy in (vy + 36, vy + 124): h.rect(vx - 4, yy, 124, 5, "#333", K, .4)
for x_ in (vx + 84, vx + 93, vx + 102): h.ln(x_, vy + 20, x_, vy + 140, K, .6, h.OCULTA)
h.txt(vx + 126, vy + 40, "MEDIA CAÑA PVC", 8.5, 700); h.txt(vx + 126, vy + 52, "APTA UV (*)", 8.5, 400, OR)
h.txt(vx + 126, vy + 128, "PRECINTOS (*)", 8.5, 700, OR)
h.globo("V", vx + 116, vy + 80, vx + 150, vy + 86)
# =================================================== COMPUTO
rows = [("ORIFICIO EN EL POSTE", "1", "1 POR APOYO, LO JUSTO PARA LOS CABLES"), ("ESPUMA DE POLIURETANO", "1 u", "1 POR APOYO (CALCULADORA)"),
        ("BABERO DE ZINGUERIA", "1 u", "1 POR APOYO (CALCULADORA)"), ("FIJACION DEL BABERO", "(*)", "NO COMPUTADA: CONFIRMAR"),
        ("ITEM DEL ANEXO I", "-", "ESPUMA Y BABERO NO TIENEN ITEM")]
h.tabla(40, 866, [(160, "l", False), (56, "c", True), (250, "l", False)], [("CONCEPTO", "CANT.", "CALCULO")] + rows, rowh=17,
        titulo="COMPUTO POR APOYO PRFV", colores=lambda i, j, t: OR if "(*)" in t else K)
h.rayados(560, 830, [("ANSI31", "PRFV (CORTE)"), ("PU", "ESPUMA POLIURETANO")], cols=1, dx=140)
h.txt(560, 912, "SECUENCIA (GUIA DE LA APP)", 11, 700); h.ln(560, 916, 740, 916, K, .8)
for i, t_ in enumerate(("1. PASAR LOS CABLES POR EL ORIFICIO.", "2. SELLAR LA ENTRADA CON ESPUMA.", "3. CUBRIR CON EL BABERO (NOTA 2).")):
    h.txt(560, 932 + i * 13, t_, 8.5, 400)
# =================================================== NOTAS
h.notas(40, 1000, [
    "COTAS EN mm. LOS CONDUCTORES DE SALIDA ENTRAN AL APOYO PRFV POR UN AGUJERO CON LAS DIMENSIONES MINIMAS NECESARIAS.",
    "EL ORIFICIO SE SELLA CON ESPUMA DE POLIURETANO (8010) Y EL CABLE A LA VISTA SE CUBRE CON BABERO DE ZINGUERIA (4015).",
    "VARIANTE ADMITIDA: PROTECCION EQUIVALENTE EN PVC APTO PARA UV. CABLE DE SALIDA Cu XLPE + VAINA PVC IRAM 2178-1 APTO UV.",
    "COMPLEMENTA LA NOTA 2 DEL AP-T-019. EL GABINETE Y SU SUJECION: AP-T-012. EL APOYO: AP-T-018.",
    "(*) A CONFIRMAR CON EL PLANO OFICIAL: Ø Y ALTURA DEL ORIFICIO, PARED DEL POSTE, MEDIDAS Y FIJACION DEL BABERO.",
    "(*) ESPUMA Y BABERO LOS EXIGE EL PLANO PERO NO TIENEN ITEM EN EL ANEXO I."])
# =================================================== 3D
h.titulo(890, 62, "VISTA 3D - INGRESO SELLADO", "POSTE CORTADO DEBAJO DEL ORIFICIO; EL BABERO LEVANTADO Y CORRIDO PARA VER LA ESPUMA")
h.iso(.5, 1150, 2690)
z0, z1 = 4440, 5150
pole3d(h, 0, 0, z0, z1)
# ventana de corte en el poste (debajo del orificio) para ver los cables que bajan por dentro
r0 = d_poste(4560) / 2; r1_ = d_poste(4720) / 2
pa = [h.P(0, 0, 4720), h.P(0, 0, 4480)]
wl = 0.30 * h._s * 180
h.a(f'<polygon points="{pa[0][0]-10:.1f},{pa[0][1]+12:.1f} {pa[0][0]+wl:.1f},{pa[0][1]+12:.1f} {pa[1][0]+wl:.1f},{pa[1][1]:.1f} {pa[1][0]-10:.1f},{pa[1][1]:.1f}" fill="#202322" stroke="#111" stroke-width=".8"/>')
h.a(f'<polygon points="{pa[0][0]+wl:.1f},{pa[0][1]+12:.1f} {pa[0][0]+wl+5:.1f},{pa[0][1]+10:.1f} {pa[1][0]+wl+5:.1f},{pa[1][1]-2:.1f} {pa[1][0]+wl:.1f},{pa[1][1]:.1f}" fill="#5f6563" stroke="#111" stroke-width=".5"/>')
for i in range(3): h.ln(pa[0][0] + 6 + i * 9, pa[0][1] + 12, pa[1][0] + 6 + i * 9, pa[1][1], "#0a0a0a", 5.2 if i < 2 else 3.4); h.ln(pa[0][0] + 5 + i * 9, pa[0][1] + 12, pa[1][0] + 5 + i * 9, pa[1][1], "#3a3a3a", 1.2)
# gabinete: solo el fondo, arriba
gy0 = d_poste(5150) / 2 + 40
h.BOX(-215, 215, gy0, gy0 + 200, 5060, 5150, GAB_T, GAB_S, GAB_E, "#6f7269", .8)
pcx = [(-40, 70), (40, 70), (110, 70)]
for (x_, y_) in pcx: h.tuboZ(5025, 5060, x_, gy0 + y_, 14, 14, "#9aa3ab", "#333")
# cables: del prensacable al orificio (+y del poste)
ry = d_poste(ZO) / 2
for i, ((x_, y_), d) in enumerate(zip(pcx, CAB)):
    cable3d(h, [(x_, gy0 + y_, 5025), (x_, gy0 + y_, ZO + 60 - i * 10), (x_ * .25, ry + 30, ZO + 10 - i * 12), (x_ * .25, ry - 8, ZO + 10 - i * 12)], d * h._s * 0.9)
# espuma en el orificio (amarilla, desborda un poco)
po = h.P(0, ry + 2, ZO)
h.a(f'<ellipse cx="{po[0]:.1f}" cy="{po[1]:.1f}" rx="{DO*h._s*.62:.1f}" ry="{DO*h._s*.58:.1f}" fill="url(#PU3)" stroke="#b8961f" stroke-width=".8"/>')
for i, ((x_, y_), d) in enumerate(zip(pcx, CAB)):
    p = h.P(x_ * .25, ry + 30, ZO + 10 - i * 12); h.circ(p[0], p[1], d * h._s * .45, "#111", "#000", .4)
# babero levantado y corrido hacia +x
def bab(dx_, dz_, op):
    yb0, yb1 = d_poste(4700) / 2 + 2, gy0 + 170
    h.F3([(-80 + dx_, yb0, 4640 + dz_), (-80 + dx_, yb1, 5050 + dz_), (-80 + dx_, yb1, 4990 + dz_), (-80 + dx_, yb0, 4590 + dz_)], "#7d8993", "#4a5560", .6, op)
    h.F3([(-80 + dx_, yb0, 4640 + dz_), (80 + dx_, yb0, 4640 + dz_), (80 + dx_, yb1, 5050 + dz_), (-80 + dx_, yb1, 5050 + dz_)], "url(#galv)", "#4a5560", .9, op)
    h.F3([(80 + dx_, yb0, 4640 + dz_), (80 + dx_, yb1, 5050 + dz_), (80 + dx_, yb1, 4990 + dz_), (80 + dx_, yb0, 4590 + dz_)], "#9aa6b0", "#4a5560", .7, op)
bab(330, 40, .95)
p0 = h.P(250, 260, 4900); p1 = h.P(80, 230, 4860)
h.path(f"M{p0[0]:.1f},{p0[1]:.1f} L{p1[0]:.1f},{p1[1]:.1f}", "none", NV, 1.4, 'stroke-dasharray="5 3"')
h.path(f"M{p1[0]:.1f},{p1[1]:.1f} l9,-1 m-9,1 l5,7", "none", NV, 1.4)
h.txt(920, 470, "EL BABERO TAPA EL CABLE", 10, 700, NV); h.txt(920, 484, "ENTRE EL GABINETE Y", 10, 700, NV); h.txt(920, 498, "EL ORIFICIO", 10, 700, NV)
h.txt(920, 516, "MEDIDAS DEL ORIFICIO", 10, 700, OR); h.txt(920, 530, "Y DEL BABERO (*)", 10, 700, OR)
GX = 1468
h.g3("5", (110, gy0 + 70, 5040), GX, 130, "PRENSACABLE DEL GABINETE")
h.g3("4", (40, gy0 + 70, 4950), GX, 180, "CABLE DE SALIDA (A LA VISTA)")
h.g3("3", (410, d_poste(4700) / 2 + 120, 4800), GX, 230, "BABERO (LEVANTADO)")
h.g3("2", (0, ry + 2, ZO - 18), GX, 280, "ESPUMA DE POLIURETANO")
h.g3("6", (0, 0, 4600), GX, 330, "CABLES ADENTRO DEL POSTE")
h.g3("1", (0, -d_poste(4500) / 2, 4500), GX, 380, "APOYO PRFV")
# =================================================== LISTA
L = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
     ("1", "APOYO PRFV hl 8 m (AP-T-018) - NO SE COMPUTA ACA", "-", "6015"),
     ("2", "ESPUMA DE POLIURETANO PARA SELLADO", "1", "8010"),
     ("3", "BABERO DE ZINGUERIA PARA TRAMO DE CABLE EXPUESTO", "1", "4015"),
     ("4", "CABLE DE SALIDA Cu XLPE + PVC IRAM 2178-1 APTO UV", "S/ PROY.", "S/ CALIBRE"),
     ("5", "PRENSACABLE DEL GABINETE (POR EL Ø DEL CABLE)", "S/ CALC.", "5020 / 5023 / 5025"),
     ("6", "ORIFICIO EN EL POSTE (TRABAJO, SIN MATERIAL)", "1", "-"),
     ("7", "FIJACION DEL BABERO (*)", "(*)", "A VINCULAR"),
     ("V", "VARIANTE: PROTECCION PVC APTA UV (MEDIA CAÑA) (*)", "1", "4015 (*)")]
h.tabla(890, 580, [(40, "c", False), (470, "l", False), (90, "c", True), (150, "c", False)], L, rowh=24, titulo="LISTA DE MATERIALES (1 APOYO)",
        colores=lambda i, j, t: OR if ("(*)" in t or t == "A VINCULAR") else K)
h.rotulo(890, h.H - 150, 750, "AP-T-015", "SELLADO DEL INGRESO", "DE CABLES AL POSTE", "CORTES, ORIFICIO, BABERO, VARIANTE PVC Y 3D", "1:2,5 / 1:5", "D1 2:1, 3D S/E", fecha="07/11/2026")
h.guardar("ap_t_015.svg"); print("ok")
