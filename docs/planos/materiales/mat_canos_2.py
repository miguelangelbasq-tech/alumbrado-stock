import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *
from mk_obra import _circ
from matkit import M3

h = HojaO()
COD = [5005, 5006, 5015]
h.check_codigos(COD)

# ============ A · PEAD Ø50
h.titulo(40, 62, "CORTE A-A · CAÑO PEAD Ø50 PN6", "ESC. 1:1 · POLIETILENO NEGRO")
k = 2.0; cx, cy = 150, 210; R = 25 * k; e = 3.0 * k
h.circ(cx, cy, R, "url(#ANSI31)", K, 1.4); h.circ(cx, cy, R - e, "#fff", K, .9)
h.ln(cx - R - 14, cy, cx + R + 14, cy, K, .4, h.EJE); h.ln(cx, cy - R - 14, cx, cy + R + 14, K, .4, h.EJE)
h.dimH(cy + R + 30, cx - R, cx + R, "Ø50", ext=cy)
h.flecha_llamada(cx + R * .72, cy - R * .72, cx + 80, cy - R - 20, "e (*) SEGUN PN6", 10.5, "start", OR)
h.txt(cx, cy + R + 56, "5005 · PEAD Ø50 PN6", 11, 700, K, "middle")
# corte longitudinal con cable adentro
h.titulo(330, 62, "CORTE B-B · CON EL CABLE ADENTRO", "ESC. 1:1 · EJ. CABLE 4 × 2,5 (Ø12)")
x0, x1 = 340, 820
h.rect(x0, cy - R, x1 - x0, e, "url(#ANSI31)", K, 1); h.rect(x0, cy + R - e, x1 - x0, e, "url(#ANSI31)", K, 1)
h.rect(x0 - 40, cy + R - e - 24, x1 - x0 + 80, 24, "#fff", K, 1)
h.txt(x0 + 200, cy + R - e - 8, "CABLE (APOYADO EN EL FONDO DEL CAÑO)", 10, 400, G, "middle")
for xx in (x0, x1): h.path(f"M{xx},{cy-R-8} l-5,10 l10,8 l-5,10 V{cy+R+8}", "none", K, .7)
h.ln(x0 - 50, cy, x1 + 50, cy, K, .4, h.EJE)
h.dimV(x1 + 36, cy - R, cy + R, "Ø50", ext=x1)
h.globo("1", x0 + 60, cy - R + 3, x0 + 40, cy - R - 30); h.globo("2", x0 + 310, cy + R - 14, x0 + 330, cy - R - 30)

# ============ B · CORRUGADO 3/4"
h.titulo(40, 360, "VISTA Y MEDIO CORTE · CAÑO PVC CORRUGADO 3/4\"", "ESC. 2:1 · PARA PASAR EL CABLE DE PAT 1 × 10 · PASO Y Ø EXTERIOR (*)")
k2 = 2.6; yc = 470; Re = 11 * k2; Ri = 8.4 * k2; paso = 5 * k2 / 1.0 * 1.2   # (*) medidas típicas, ilustrativas
x0, x1 = 60, 560
# arriba en corte (diente de sierra redondeado), abajo en vista
d = f"M{x0},{yc-Ri}"; xx = x0
while xx < x1:
    d += f" Q{xx+paso*.25},{yc-Re-2} {xx+paso*.5},{yc-Re} Q{xx+paso*.75},{yc-Re-2} {xx+paso},{yc-Ri}"; xx += paso
h.path(d, "none", K, 1.2)
d2 = d.replace(f"M{x0},{yc-Ri}", f"M{x0},{yc-Ri+2.2}")
for xx in [x0 + i * paso for i in range(int((x1 - x0) / paso))]:
    h.rect(xx + paso * .3, yc - Re + 1, paso * .4, Re - Ri - 1, K, K, .2)
xx = x0
while xx < x1:
    h.path(f"M{xx},{yc+Ri} Q{xx+paso*.25},{yc+Re+2} {xx+paso*.5},{yc+Re} Q{xx+paso*.75},{yc+Re+2} {xx+paso},{yc+Ri}", "none", K, 1.1)
    h.ln(xx + paso * .5, yc + Re - 1, xx + paso * .5, yc + Ri + 2, K, .4); xx += paso
h.ln(x0, yc + Ri, x0, yc - Ri, K, 1); h.ln(x0 - 20, yc, x1 + 20, yc, K, .4, h.EJE)
# cable de PAT adentro
rc = 3.6 * k2 / 1.0 * 1.0
h.rect(x0 + 30, yc - rc, x1 - x0 - 10, 2 * rc, "#fff", K, .9)
h.txt(x0 + 260, yc + 4, "CABLE 1 × 10 V/A (PAT)", 9.5, 400, G, "middle")
h.dimV(x1 + 40, yc - Re, yc + Re, "Ø EXT. (*)", ext=x1, c=OR)
h.dimV(x1 + 80, yc - Ri, yc + Ri, "Ø INT. (*)", ext=x1 + 10, c=OR)
h.dimH(yc - Re - 22, x0 + 4 * paso, x0 + 5 * paso, "PASO (*)", ext=yc - Ri, c=OR)
h.globo("3", x0 + 240, yc - Re, x0 + 270, yc - Re - 34)

# ============ C · GRAMPA
h.titulo(40, 580, "GRAMPA DE SUJECION (5015) · FRENTE Y LATERAL", "ESC. 1:1 · TIPO «OMEGA» CON 2 AGUJEROS (*) · SE ELIGE POR EL Ø DEL CAÑO")
gx, gy, kg = 200, 720, 3.2
rr = 11 * kg; ala = 14 * kg; t = 1.2 * kg
h.path(f"M{gx-rr-ala},{gy} H{gx-rr} V{gy-rr*0.2} A{rr},{rr} 0 0 1 {gx+rr},{gy-rr*0.2} V{gy} H{gx+rr+ala} V{gy-t} H{gx+rr+t} V{gy-rr*0.2} A{rr+t},{rr+t} 0 0 0 {gx-rr-t},{gy-rr*0.2} V{gy-t} H{gx-rr-ala} Z", "url(#ANSI31)", K, 1)
h.ln(gx - rr - ala - 20, gy, gx + rr + ala + 20, gy, K, 1.4)
h.txt(gx + rr + ala + 24, gy + 4, "PARED / PISO", 10, 400, G)
h.circ(gx, gy - rr * .55, rr * .78, "#fff", K, .9, 'stroke-dasharray="5 3"')
h.txt(gx, gy - rr * .55 + 4, "CAÑO", 9, 400, G, "middle")
for sx in (-1, 1): h.ln(gx + sx * (rr + ala / 2), gy - t - 6, gx + sx * (rr + ala / 2), gy + 14, K, .5, h.EJE)
h.dimH(gy + 30, gx - rr - ala, gx + rr + ala, "LARGO (*)", ext=gy, c=OR)
# lateral (vista superior de la grampa)
lx, ly = 470, 650
h.rect(lx, ly, 2 * (rr + ala), 14 * kg / 1.6, "#fff", K, 1.2)
for sx in (lx + ala / 2, lx + 2 * rr + 1.5 * ala): h.circ(sx, ly + 14 * kg / 3.2, 4, "#fff", K, .8)
h.dimV(lx - 14, ly, ly + 14 * kg / 1.6, "ANCHO (*)", ext=lx, c=OR)
h.txt(lx, ly - 10, "VISTA DE ARRIBA", 10, 400, G)
h.txt(lx + 2 * (rr + ala) + 12, ly + 16, "2 AGUJEROS PARA TORNILLO", 10, 400, G)
h.txt(lx + 2 * (rr + ala) + 12, ly + 30, "CON FISHER (VER MAT-FIJACION-1)", 10, 400, G)
h.globo("4", gx + rr * .7, gy - rr * .9, gx + 70, gy - rr - 44)

# ============ CODIGOS + COMPARACION
EX = {5005: "Ø50 · e (*) · NEGRO", 5006: "3/4\" · Ø (*)", 5015: "medida (*)"}
y = h.codigos(40, 790, COD, (46, 0, 34), wtot=800, rowh=19, titulo="VARIANTES Y CODIGOS DEL PAÑOL", extra_col=("MEDIDA", EX, 150))
cols = [(150, "l", False), (210, "c", False), (220, "c", False), (220, "c", False)]
fil = [["", "PEAD Ø50 (5005)", "PVC RIGIDO Ø50 (5009)", "CORRUGADO 3/4\" (5006)"],
       ["SE CURVA", "SI, SIN ACCESORIOS (*)", "NO: CON CURVAS", "SI"],
       ["USO EN LA APP", "VEREDA, HORMIGON, CANAL", "CONDUCTO DE PAT", "CABLE DE PAT"],
       ["UNIDAD DEL PAÑOL", "Un. (*)", "m", "Un. (*)"]]
y = h.tablaM(40, y + 30, cols, fil, 19, "CUAL USAR")
h.notasM(40, 1030, [
    "DATOS: FICHA DE LA APP (FAMILIA «CAÑOS Y CONDUCTOS») Y AP-TC-007 (UN PEAD Ø50 POR CIRCUITO A LA ZANJA).",
    "(*) ESPESOR DEL PEAD PN6, Ø Y PASO DEL CORRUGADO, MEDIDAS DE LA GRAMPA: A CONFIRMAR CON EL FABRICANTE.",
    "(*) 5005 Y 5006 SE DAN POR «Un.»: CONFIRMAR SI ES ROLLO O TRAMO Y CUANTOS METROS TRAE.",
], 800, 10.5)

# ============ 3D
h.titulo(890, 62, "VISTA 3D · PEAD Ø50, CORRUGADO 3/4\" Y GRAMPA", "PEAD NEGRO · CORRUGADO GRIS OSCURO · GRAMPA GALVANIZADA")
# PEAD saliendo curvo con el cable
h.iso(1.25, 1080, 330)
Rb = 80; pts = [(-160, 0, 0), (-60, 0, 0)] + [(-60 + Rb * math.sin(a), 0, Rb - Rb * math.cos(a)) for a in [math.pi / 2 * j / 12 for j in range(1, 13)]]
barrido(h, pts, 25, "negro", 40)
h.cil("z", Rb, Rb + 40, -60 + Rb, 0, 25, C_PEAD, tapa="#3a3d42", metal=True, borde="#000", bw=.5, agujero=(22, "#0b0b0c"))
h.cil("z", Rb + 40, Rb + 100, -60 + Rb, 0, 6, C_VAINA, tapa="#3a3d42", borde="#000", bw=.4)
h.g3b("1", (-120, 0, 25), 1420, 130, "PEAD Ø50 NEGRO (5005)")
h.g3b("2", (-60 + Rb, 0, Rb + 90), 1420, 175, "CABLE QUE SALE POR EL CAÑO")
h.txt(900, 400, "PEAD: SE CURVA, VA SIN UNIONES EN EL TRAMO (*)", 10.5, 400, OR, "start", INT)

# corrugado + grampa sobre una pared
h.iso(1.25, 1140, 560)
h.BOX(-60, 260, -40, -34, -60, 60, "#d6d9dc", "#b9bec4", "#c3c8cc", "#555", .6)
m = M3(h)
Re, Ri = 11, 8.4
n = 0; xx = -40
while xx < 230:
    h.cil("x", xx, xx + 3, -22, 0, Re, C_CORR, tapa=None, metal=False, borde=None)
    h.cil("x", xx + 3, xx + 6, -22, 0, Ri + .8, sombra(C_CORR, .85), tapa=None, borde=None)
    xx += 6
h.cil("x", xx, xx + 3, -22, 0, Re, C_CORR, tapa=sombra(C_CORR, 1.25), borde="#111", bw=.4, agujero=(Ri, "#0d0d0d"))
# cable PAT verde-amarillo saliendo
h.cil("x", xx + 3, xx + 50, -22, 0, 3.6, "#2f9e44", tapa="#2f9e44", borde="#111", bw=.4)
for q in range(4):
    p0 = h.P(xx + 8 + q * 11, -22, 3.6); p1 = h.P(xx + 13 + q * 11, -22, -3.6)
    h.ln(p0[0], p0[1], p1[0], p1[1], "#f2c200", 2.2)
# grampa omega (galvanizada) en x = 90..104
t = 1.2; w = 14
for xg in (40, 150):
    poly = [(-Re - w, 0), (-Re, 0)] + [(-Re * math.cos(math.radians(a)), Re * math.sin(math.radians(a))) for a in range(0, 181, 12)] + [(Re, 0), (Re + w, 0), (Re + w, t), (Re + t, t)] + \
           [((Re + t) * math.cos(math.radians(a)), (Re + t) * math.sin(math.radians(a))) for a in range(0, 181, 12)][::-1][::-1] + [(-Re - t, t), (-Re - w, t)]
    # contorno exterior bien ordenado
    ext = [((Re + t) * math.cos(math.radians(a)), (Re + t) * math.sin(math.radians(a))) for a in range(0, 181, 12)]
    inn = [(Re * math.cos(math.radians(a)), Re * math.sin(math.radians(a))) for a in range(180, -1, -12)]
    poly = [(-Re - w, 0)] + inn + [(Re + w, 0), (Re + w, t)] + ext + [(-Re - w, t)]
    poly = [(-Re - w, 0)] + [(-Re, 0)] + [(Re * math.cos(math.radians(a)), Re * math.sin(math.radians(a))) for a in range(180, -1, -12)] + [(Re + w, 0), (Re + w, t)] + \
           [((Re + t) * math.cos(math.radians(a)), (Re + t) * math.sin(math.radians(a))) for a in range(0, 181, 12)] + [(-Re - w, t)]
    # plano y–z (u = y relativo al caño, v = distancia desde la pared, hacia +y); extruido en x
    m.prism([(u, v) for u, v in poly], [xg, -34, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], 14, "galv", edge="#555")
    m.render()
    for zz in (-Re - w / 2, Re + w / 2):
        h.cil("y", -34 + t, -34 + t + 1.5, xg + 7, zz, 3.2, "#9aa3ab", tapa="#c3c9ce", metal=True, borde="#444", bw=.4)
        X, Y = h.P(xg + 7, -34 + t + 1.6, zz); h.ln(X - 2.2, Y, X + 2.2, Y, "#333", .8)
h.g3b("3", (100, -22, Re), 1420, 470, "CORRUGADO 3/4\" (5006)")
h.g3b("4", (150 + 7, -34 + 1, Re + 6), 1420, 515, "GRAMPA (5015) CON TORNILLO")
h.g3b("5", (xx + 40, -22, 3.6), 1420, 560, "CABLE 1 × 10 V/A (PAT)")
X, Y = h.P(-60, -40, 60); h.txt(X - 10, Y - 12, "PARED (EJEMPLO DE MONTAJE)", 10, 400, G, "start", INT)
h.txt(900, 690, "Medidas del corrugado y la grampa: ilustrativas (*).", 10.5, 400, OR, "start", INT)

h.bloque(890, 730, "DATOS TECNICOS", [
    "PEAD Ø50 PN6: POLIETILENO DE ALTA DENSIDAD, NEGRO",
    "CORRUGADO 3/4\": PVC FLEXIBLE, PARA EL CABLE DE PAT",
    "GRAMPA: SUJETA EL CAÑO A PARED / ESTRUCTURA",
], 370)
h.bloque(1270, 730, "DONDE SE USA", [
    "PEAD: BAJO VEREDA U HORMIGON, CANAL Y ACOMETIDA SUBTERRANEA",
    "AP-TC-007: 1 PEAD Ø50 POR CIRCUITO, DEL TABLERO A LA ZANJA",
    "AP-TC-003: VARIANTE DE LA ACOMETIDA DE LA FUNDACION (EN LUGAR DEL TELGOPOR)",
    "CORRUGADO: CABLE DE PAT · GUIA «ZANJEO Y TENDIDO»",
], 370)
h.rotuloM("MAT-CAÑOS-2", "PEAD Ø50, CORRUGADO 3/4\"", "Y GRAMPA DE SUJECION", "CORTES, VISTAS, TABLA DE USO Y VISTA 3D", "1:1 / 2:1", "3D S/E")
guardar(h, "mat_canos_2")
