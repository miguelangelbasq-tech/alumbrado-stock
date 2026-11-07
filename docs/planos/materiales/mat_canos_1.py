import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *

h = HojaO()
COD = [5007, 5008, 5010, 5009, 5011, 5030, 5014]
h.check_codigos(COD)

# ============ A · CORTES TRANSVERSALES (ficha caños: tabla de espesores)
h.titulo(40, 62, "CORTES · Ø EXTERIOR Y ESPESOR DE PARED", "ESC. 1:1,2 (k = 0,85 px/mm) · PARED EN NEGRO POR SER FINA · VER D1")
k = .85; yc = 205
CAN = [(160, 3.2, "5008", 112, "REF. 4,7"), (110, 3.2, "5007", 262, None), (90, 2.7, "5010", 382, None), (50, 3.2, "5009", 480, None), (25.4, None, "5011", 556, None)]
for D, e, cod, cx, alt in CAN:
    r = D / 2 * k
    h.circ(cx, yc, r, K, K, .9)
    ee = (e if e else 1.8) * k
    h.circ(cx, yc, r - ee, "#fff", K, .6)
    h.ln(cx - r - 8, yc, cx + r + 8, yc, K, .4, h.EJE); h.ln(cx, yc - r - 8, cx, yc + r + 8, K, .4, h.EJE)
    h.dimH(yc + 88, cx - r, cx + r, "Ø" + str(D).replace(".", ","), ext=yc)
    et = ("e " + str(e).replace(".", ",")) if e else "e (*)"
    h.txt(cx, yc + 108, et, 10.5, 700, OR if not e else K, "middle")
    if alt: h.txt(cx, yc + 122, "(" + alt + ")", 9.5, 400, K, "middle")
    h.txt(cx, yc - 80, cod, 11, 700, K, "middle", MONO)
h.txt(40, yc + 150, "Ø110: EL CATALOGO DICE «Ø100 INTERIOR», PERO 110 − 2 × 3,2 = 103,6 (VER NOTA 2).", 10.5, 400, OR)

# D1: pared del Ø110 ampliada
h.titulo(620, 62, "DETALLE D1", "PARED Ø110 · ESC. 10:1")
h.llamadaDet(262 + 46 * .707, yc - 46 * .707, 9, "D1")
x1, y1, kk = 650, 118, 10
h.rect(x1, y1, 160, 3.2 * kk, "url(#ANSI31)", K, 1.3)
h.ln(x1 - 6, y1 + 3.2 * kk + 40, x1 + 166, y1 + 3.2 * kk + 40, K, .4, h.EJE)
h.txt(x1 + 168, y1 + 3.2 * kk + 44, "EJE", 9.5, 400, G)
h.dimV(x1 + 182, y1, y1 + 3.2 * kk, "3,2", ext=x1 + 160)
h.txt(x1, y1 - 8, "CARA EXTERIOR (Ø110)", 10, 400, G); h.txt(x1, y1 + 3.2 * kk + 16, "CARA INTERIOR (Ø103,6)", 10, 400, G)
h.path(f"M{x1-6},{y1-4} l6,4 l-6,4 l6,4 l-6,4 l6,4 l-6,4 l6,4 l-6,4", "none", K, .6)
h.path(f"M{x1+166},{y1-4} l-6,4 l6,4 l-6,4 l6,4 l-6,4 l6,4 l-6,4 l6,4", "none", K, .6)

# ============ B · BARRA CON ENCHUFE Y UNION PEGADA (medio corte)
h.titulo(40, 392, "VISTA Y MEDIO CORTE B-B · UNION DE DOS BARRAS Ø110", "ESC. 1:1,2 · ARRIBA EN CORTE, ABAJO EN VISTA · BARRA CON ENCHUFE (CABEZA) PARA PEGAR (*)")
k2 = 1.0; yc2 = 528; R = 55 * k2; E = 3.2 * k2 * 1.4
xa, xs, xs2, xb = 60, 380, 470, 800        # barra 1 hasta el enchufe; enchufe xs..xs2; barra 2 entra hasta xs
# barra 1 (vista abajo, corte arriba)
h.rect(xa, yc2 - R, xs - xa, E, K, K, .4)                    # pared superior cortada
h.ln(xa, yc2 + R, xs, yc2 + R, K, 1.2)                         # contorno inferior (vista)
h.ln(xa, yc2 - R + E, xs, yc2 - R + E, K, .5)
# enchufe (cabeza) de la barra 1: diámetro exterior mayor
RE = R + E
h.path(f"M{xs-24},{yc2-R} L{xs},{yc2-RE} H{xs2} V{yc2-RE+E} H{xs} L{xs-24+3},{yc2-R+E} Z", K, K, .4)
h.path(f"M{xs-24},{yc2+R} L{xs},{yc2+RE} H{xs2} V{yc2+R}", "none", K, 1.2)
# barra 2: espiga dentro del enchufe
h.rect(xs + 2, yc2 - R, xb - xs - 2, E, K, K, .4)
h.ln(xs2, yc2 + R, xb, yc2 + R, K, 1.2); h.ln(xs + 2, yc2 - R + E, xb, yc2 - R + E, K, .5)
h.ln(xs + 2, yc2 - R, xs + 2, yc2 - R + E, K, 1)
h.ln(xs + 2, yc2 + R, xs + 2, yc2 + R - 8, K, .5, h.OCULTA)
# adhesivo
h.ln(xs + 4, yc2 - R - 1.2, xs2, yc2 - R - 1.2, OR, 1.6)
h.flecha_llamada(xs + 60, yc2 - R - 1.5, xs + 130, yc2 - R - 22, "ADHESIVO PARA PVC (*)", 10, "start", OR)
# cortes de barra (líneas de rotura)
for xx in (xa, xb):
    h.path(f"M{xx},{yc2-RE-8} l-5,10 l10,8 l-5,10 V{yc2+RE+8}", "none", K, .7)
h.ln(xa - 10, yc2, xb + 10, yc2, K, .5, h.EJE)
h.dimV(xa + 30, yc2 - R, yc2 + R, "Ø110", ext=None)
h.dimH(yc2 + RE + 28, xs, xs2, "L ENCHUFE (*)", ext=yc2 + RE, c=OR)
h.txt((xa + xs) / 2 + 20, yc2 + 26, "BARRA: LARGO COMERCIAL (*) · 5007 SE DA POR UNIDAD", 10, 400, OR, "middle")
h.globo("1", xa + 140, yc2 - R + 2, xa + 160, yc2 - R - 26)
h.globo("2", xs + 30, yc2 - RE + 2, xs - 16, yc2 - RE - 22)
h.globo("3", xb - 120, yc2 - R + 2, xb - 100, yc2 - R - 26)
h.txt(xa + 182, yc2 - R - 22, "BARRA", 10, 400, G); h.txt(xs - 36, yc2 - RE - 18, "ENCHUFE", 10, 400, G, "end"); h.txt(xb - 82, yc2 - R - 22, "ESPIGA DE LA OTRA BARRA", 10, 400, G)

# ============ C · ACCESORIOS
h.titulo(40, 640, "ACCESORIOS · VISTAS", "ESC. 1:3 · CUPLA Y CURVAS: NO TIENEN CODIGO EN EL PAÑOL (A VINCULAR)")
k3 = .45; yc3 = 728; r3 = 55 * k3
# cupla (medio corte)
cx = 90; lc = 120 * k3
h.ln(cx - 70, yc3, cx + lc + 70, yc3, K, .4, h.EJE)
h.rect(cx - 60, yc3 - r3, 60 + 4, 2 * r3, "#fff", K, 1); h.rect(cx + lc - 4, yc3 - r3, 64, 2 * r3, "#fff", K, 1)
h.rect(cx, yc3 - r3 - 4, lc, 2 * r3 + 8, "#fff", K, 1.3); h.rect(cx, yc3 - r3 - 4, lc, 4, K, K, .3)
h.ln(cx + lc / 2, yc3 - r3 - 4, cx + lc / 2, yc3 - r3, K, 1.2)
h.txt(cx + lc / 2, yc3 + r3 + 24, "CUPLA Ø110", 10.5, 700, K, "middle"); h.txt(cx + lc / 2, yc3 + r3 + 38, "A VINCULAR", 10, 700, OR, "middle")
h.dimH(yc3 - r3 - 16, cx, cx + lc, "L (*)", ext=yc3 - r3 - 4, c=OR)
# curva 90°
ox, oy, Rc = 330, yc3 + 40, 140 * k3 * 1.0
def arco(rr, a0=180, a1=270):
    return " ".join(f"{ox + rr * math.cos(math.radians(a)):.1f},{oy + rr * math.sin(math.radians(a)):.1f}" for a in range(a0, a1 + 1, 5))
h.a(f'<polyline points="{arco(Rc + r3)}" fill="none" stroke="{K}" stroke-width="1.2"/>')
h.a(f'<polyline points="{arco(Rc - r3)}" fill="none" stroke="{K}" stroke-width="1.2"/>')
h.a(f'<polyline points="{arco(Rc)}" fill="none" stroke="{K}" stroke-width=".4" {h.EJE}/>')
h.ln(ox - Rc - r3, oy, ox - Rc + r3, oy, K, 1.2); h.ln(ox, oy - Rc - r3, ox, oy - Rc + r3, K, 1.2)
h.ln(ox, oy, ox - Rc, oy, K, .4, h.OCULTA); h.ln(ox, oy, ox, oy - Rc, K, .4, h.OCULTA)
h.txt(ox - Rc / 2, oy + 14, "R (*)", 10.5, 700, OR, "middle")
h.txt(ox - 60, yc3 + r3 + 24 + 30, "CURVA 90° Ø110", 10.5, 700, K, "middle"); h.txt(ox - 60, yc3 + r3 + 38 + 30, "A VINCULAR", 10, 700, OR, "middle")
# curva 45°
ox2, oy2 = 520, yc3 + 40
h.a(f'<polyline points="{" ".join(f"{ox2 + (Rc + r3) * math.cos(math.radians(a)):.1f},{oy2 + (Rc + r3) * math.sin(math.radians(a)):.1f}" for a in range(225, 271, 5))}" fill="none" stroke="{K}" stroke-width="1.2"/>')
h.a(f'<polyline points="{" ".join(f"{ox2 + (Rc - r3) * math.cos(math.radians(a)):.1f},{oy2 + (Rc - r3) * math.sin(math.radians(a)):.1f}" for a in range(225, 271, 5))}" fill="none" stroke="{K}" stroke-width="1.2"/>')
for a in (225, 270):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
    h.ln(ox2 + (Rc - r3) * c, oy2 + (Rc - r3) * s, ox2 + (Rc + r3) * c, oy2 + (Rc + r3) * s, K, 1.2)
h.txt(ox2 - 30, yc3 + r3 + 54, "CURVA 45° Ø110", 10.5, 700, K, "middle"); h.txt(ox2 - 30, yc3 + r3 + 68, "A VINCULAR", 10, 700, OR, "middle")
# tapa 5030 (corte)
tx = 650
h.ln(tx - 50, yc3, tx + 100, yc3, K, .4, h.EJE)
h.rect(tx - 50, yc3 - r3, 90, 2 * r3, "#fff", K, 1)
h.path(f"M{tx+20},{yc3-r3-3} H{tx+52} V{yc3+r3+3} H{tx+20} V{yc3+r3} H{tx+48} V{yc3-r3} H{tx+20} Z", K, K, .5)
h.flecha_llamada(tx + 50, yc3 - r3 + 4, tx + 80, yc3 - r3 - 30, "5030 TAPA", 10.5)
h.flecha_llamada(tx - 20, yc3 + 4, tx - 40, yc3 + r3 + 30, "CORDON GUIA 5014 ADENTRO", 10, "start")
h.ln(tx - 50, yc3 + 4, tx + 44, yc3 + 4, "#111", 1.4, 'stroke-dasharray="6 3"')
h.txt(tx + 30, yc3 + r3 + 70, "CAÑO DE RESERVA CERRADO", 10, 700, K, "middle")

# ============ CODIGOS
EX = {5007: "Ø110 · e 3,2", 5008: "Ø160 · e 3,2 / 4,7", 5010: "Ø90 · e 2,7 (cl. 6)", 5009: "Ø50 · e 3,2", 5011: "Ø25,4 · e (*)", 5030: "para Ø110", 5014: "Ø10 nylon"}
y = h.codigos(40, 852, COD, (46, 0, 34), wtot=800, rowh=17, titulo="VARIANTES Y CODIGOS DEL PAÑOL", extra_col=("Ø × PARED", EX, 150))
h.notasM(40, 1014, [
    "MEDIDAS: FICHA DE LA APP (TIGRE, CATALOGO DE CAÑOS; ETG CORDOBA: CRUCE CON PVC REFORZADO Ø100 × 3,2) Y CRUCE_AP_TC_002 (2 CAÑOS Ø110).",
    "(*) Ø110: EL PAÑOL DICE «Ø100 INTERIOR»; CON e = 3,2 DA 103,6. CONFIRMAR CON EL FABRICANTE CUAL SE COMPRA.",
    "(*) LARGO DE BARRA, LARGO DEL ENCHUFE, RADIO DE CURVAS, CUPLA Y PARED DEL Ø25,4: A CONFIRMAR CON EL FABRICANTE.",
    "(*) ITEM 21 DEL PLIEGO: «1 CAÑO Ø160» (5008); EL PLANO AP-TC-002: 2 Ø110. CERRAR CON LA INSPECCION.",
], 800, 10.5)

# ============ 3D
h.titulo(890, 62, "VISTA 3D · CRUCE CON 2 CAÑOS Ø110 Y MEDIDAS COMPARADAS", "PVC GRIS CLARO BRILLANTE · TAPA Y CORDON GUIA EN EL DE RESERVA")
h.iso(.42, 1150, 250)
# caño de trabajo (atrás, y = 0) con unión
h.cano3("x", -250, 120, 0, 0, 55, 3.2, C_PVC)
h.cil("x", 120, 220, 0, 0, 58.2, sombra(C_PVC, .96), tapa=None, metal=False, borde="#555", bw=.5)
h.cano3("x", 220, 700, 0, 0, 55, 3.2, C_PVC)
# caño de reserva (adelante, y = 250) con tapa separada y cordón
h.cano3("x", -250, 700, 250, 0, 55, 3.2, C_PVC)
# cordón guía (amarillo) que sale del caño
cam = [(690, 250, -20), (740, 256, -26), (790, 262, -50), (830, 268, -70)]
h.a('<polyline points="' + " ".join(f"{h.P(*p)[0]:.1f},{h.P(*p)[1]:.1f}" for p in cam) + '" fill="none" stroke="#c9a400" stroke-width="3"/>')
h.a('<polyline points="' + " ".join(f"{h.P(*p)[0]:.1f},{h.P(*p)[1]:.1f}" for p in cam) + '" fill="none" stroke="#f2d200" stroke-width="1.5" stroke-dasharray="3 2"/>')
# tapa 5030 separada
h.cil("x", 800, 830, 250, 70, 58.5, "#c7ccd1", tapa="#d9dde1", borde="#555", bw=.6)
h.g3b("1", (-100, 0, 55), 1400, 110, "CAÑO DE TRABAJO Ø110 (5007)")
h.g3b("2", (170, 0, 58), 1400, 150, "UNION CON ENCHUFE (*)")
h.g3b("3", (0, 250, 55), 1400, 190, "CAÑO DE RESERVA Ø110 (5007)")
h.g3b("4", (815, 250, 128), 1400, 230, "TAPA DE CIERRE (5030)")
h.g3b("5", (790, 262, -50), 1400, 270, "CORDON GUIA Ø10 (5014)")
h.cota3((700, 0, 0), (700, 250, 0), "250 (*) SEPARACION 0,25 m", off=(0, 0, -110), c=NV, sz=9.5, lado=1)

# medidas comparadas (tramos parados, cortados)
h.txt(890, 470, "TRAMOS CORTADOS, A LA MISMA ESCALA", 11, 700, NV, "start", INT)
h.iso(.6, 1060, 590)
xs_ = [(0, 160, 3.2, "Ø160 · 5008"), (230, 110, 3.2, "Ø110 · 5007"), (400, 90, 2.7, "Ø90 · 5010"), (530, 50, 3.2, "Ø50 · 5009"), (620, 25.4, 2.0, "Ø25,4 · 5011")]
for xx, D, e, t in xs_:
    h.cano3("z", 0, 140, xx, -xx * .6, D / 2, e, C_PVC, n=48)
for xx, D, e, t in xs_:
    X, Y = h.P(xx, -xx * .6, 0); h.txt(X, Y + D / 2 * .62 + 18, t, 10, 700, NV, "middle", INT)

h.bloque(890, 730, "DATOS TECNICOS", [
    "PVC RIGIDO REFORZADO (Ø110, Ø160, Ø50) · Ø90 CLASE 6",
    "ESPESORES: Ø110 Y Ø50 = 3,2 · Ø160 = 3,2 (REFORZADO 4,7) · Ø90 = 2,7",
    "UNION POR ENCHUFE PEGADO (*) · CUPLA Y CURVAS SIN CODIGO",
    "CORDON GUIA: NYLON Ø10 EN EL CAÑO DE RESERVA",
], 370)
h.bloque(1270, 730, "DONDE SE USA", [
    "AP-TC-002 CRUCE DE CALZADA: 2 Ø110 (1 DE RESERVA, CON TAPA Y CORDON)",
    "AP-TC-007 TABLERO A NIVEL: Ø90 INGRESO EPEC",
    "PAT: CONDUCTO Ø50 EXCLUSIVO · Ø1\" PAT / DESAGÜE DE LA FUNDACION (AP-TC-003)",
    "GUIA «ZANJEO Y TENDIDO»",
], 370)
h.rotuloM("MAT-CAÑOS-1", "CAÑOS DE PVC RIGIDO", "Ø25,4 A Ø160 · TAPA Y CORDON GUIA", "CORTES, UNION, ACCESORIOS Y VISTA 3D", "1:1,2 / 1:3", "3D S/E")
guardar(h, "mat_canos_1")
