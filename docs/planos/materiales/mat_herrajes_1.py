import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
def mitad(cx, cy, R, sg, escote, e=4.76, k=1.0, oreja=36, luz=4.7):
    """media abrazadera en planta: sg=-1 la de arriba, +1 la de abajo. Devuelve el path."""
    yo = cy + sg * luz / 2 * k
    pts = []
    for i in range(0, 61):
        a = math.pi - i * math.pi / 60   # de 180° a 0°
        rr = R
        if escote and abs(a - math.pi / 2) < math.radians(22): rr = R + (R * .2) * (1 - abs(a - math.pi / 2) / math.radians(22))
        pts.append((cx + rr * math.cos(a), yo + sg * rr * math.sin(a)))
    return pts
def abrazadera2d(cx, cy, R, tipo, k):
    t = 4.76 * k
    for sg in (-1, 1):
        esc = (tipo >= 1 and sg == -1) or (tipo >= 2 and sg == 1)
        inn = mitad(cx, cy, R, sg, esc, k=k); out = mitad(cx, cy, R + t, sg, esc, k=k)
        yo = cy + sg * 4.7 / 2 * k
        d = f"M{cx-R-t-36*k},{yo} L" + " L".join(f"{x:.1f},{y:.1f}" for x, y in out) + f" L{cx+R+t+36*k},{yo} L{cx+R+t+36*k},{yo+sg*t} L{cx+R},{yo+sg*t} L" + \
            " L".join(f"{x:.1f},{y:.1f}" for x, y in reversed(inn[1:-1])) + f" L{cx-R},{yo+sg*t} L{cx-R-t-36*k},{yo+sg*t} Z"
        h.path(d, "url(#STEEL)", K, 1.1)
        if esc:
            ty = yo + sg * (R * 1.2 + t / 2) ; h.circ(cx, ty - sg * 1, 7 * k, "#fff", K, .9)
    for xx in (cx - R - t - 18 * k, cx + R + t + 18 * k):
        h.rect(xx - 6 * k, cy - 4.7 / 2 * k - 4.76 * k - 9 * k, 12 * k, 4.7 * k + 2 * 4.76 * k + 18 * k, "#fff", K, .9)   # bulón
        h.ln(xx, cy - 30 * k, xx, cy + 30 * k, K, .4, h.EJE)
    h.circ(cx, cy, R, "none", K, .4, 'stroke-dasharray="6 3"')
# ================= VISTAS EN PLANTA
h.titulo(40, 62, "VISTA EN PLANTA (DESDE ARRIBA DEL POSTE)", "ESQUEMA - PLANCHUELA 4,76 × 31,7 - BULONES EN LAS OREJAS")
k = .55
abrazadera2d(170, 220, 220 / 2 * k, 0, k)
h.txt(170, 340, "LISA (4004-4008)", 11, 700, K, "middle"); h.txt(170, 356, "Ø220 A Ø340", 10.5, 400, G, "middle")
h.dimH(220 - 220 / 2 * k - 34, 170 - 220 / 2 * k, 170 + 220 / 2 * k, "Ø NOMINAL INT.", ext=220)
abrazadera2d(455, 220, 140 / 2 * k * 1.3, 1, k)
h.txt(455, 340, "1 ESCOTE (4001)", 11, 700, K, "middle"); h.txt(455, 356, "Ø140 · ESCOTE CON Ø14", 10.5, 400, G, "middle")
abrazadera2d(705, 220, 200 / 2 * k, 2, k)
h.txt(705, 340, "2 ESCOTES (4002)", 11, 700, K, "middle"); h.txt(705, 356, "Ø200 · 2 ESCOTES CON Ø14", 10.5, 400, G, "middle")
h.txt(40, 384, "LUZ ENTRE OREJAS ≈ 4,7 · AGUJEROS DE LAS OREJAS Ø14 · SE CIERRA CON 2 BULONES (VER MAT-HERRAJES-3)", 10.5)
# ================= PLANCHUELA
h.titulo(40, 430, "PLANCHUELA (VISTA DE ARRIBA, EXTENDIDA)", "ESC. 1:2 - ACERO CINCADO (H°G°)")
x, l, n, o = 70, 480, 360, 31.7 * 1.6
h.rect(x, l, n, o, "url(#STEEL)", K, 1.4)
for e in (x + 31 * 1.6, x + n - 31 * 1.6):
    h.circ(e, l + o / 2, 7 * 1.6, "#fff", K, 1); h.ln(e, l - 8, e, l + o + 8, K, .4, h.EJE)
h.ln(x - 10, l + o / 2, x + n + 10, l + o / 2, K, .4, h.EJE)
h.dimH(l - 16, x, x + 31 * 1.6, "31", ext=l); h.dimV(x - 18, l, l + o, "31,7", ext=x)
h.dimH(l + o + 26, x + n - 31 * 1.6 - 7 * 1.6, x + n - 31 * 1.6 + 7 * 1.6, "Ø14", ext=l + o / 2)
h.txt(x + n + 30, l + 14, "ESPESOR 4,76", 10.5, 700); h.txt(x + n + 30, l + 30, "LARGO DESARROLLADO SEGUN Ø (*)", 10.5, 400, OR)
# códigos
y2 = h.codigos(40, 590, [4004, 4005, 4006, 4007, 4008, 4001, 4002],
               extra={4004: "Ø220 (ref. fab. 405220)", 4005: "Ø240 (405240)", 4006: "Ø260 (405260)", 4007: "Ø300 (405300)", 4008: "Ø340 (405340)", 4001: "Ø140 (406140)", 4002: "Ø200 (407200)"}, wx=170)
y3 = h.datos(40, y2 + 30, [("PLANCHUELA", "acero 4,76 × 31,7 mm, cincada"), ("CIERRE", "2 medias abrazaderas + 2 bulones"), ("AGUJEROS", "Ø14 (orejas y escote)"),
    ("SE PIDE POR", "Ø del poste en el punto de colocación"), ("Ø LISA QUE HAY", "60 a 550 mm (fabricante)"), ("Ø ESCOTE QUE HAY", "60 a 550 (1 esc.) · 140 a 550 (2 esc.)")], w=430, c1=140)
h.lista(500, y2 + 30, "DONDE SE USA", [
    "· AP-T-012: sujeción del tablero aéreo",
    "   al apoyo; AP-T-018: apoyo PRFV.",
    "· AP-PL-003: caja estanca externa.",
    "· AP-TC-055: brazo H°G° de barrio:",
    "   2 abrazaderas por Ø del poste.",
    "· El escote toma un perno o el bulón",
    "   del rack.",
])
h.notas(40, 1010, [
    "COTAS EN mm. LA PLANTA ES UN ESQUEMA: LA ABRAZADERA SE PIDE POR EL Ø DEL POSTE EN EL PUNTO DONDE VA.",
    "Ø QUE SE CONSIGUEN (LISA): 60 · 120 · 140 · 150 · 160 · 180 · 200 · 220 · 230 · 240 · 250 · 260 · 270 · 280 · 300 … 550.",
    "(*) LARGO DE LAS OREJAS Y DESARROLLO DE LA PLANCHUELA: NO ESTAN EN LA FICHA. A CONFIRMAR CON EL FABRICANTE.",
    "(*) EL POSTE ES CONICO: MEDIR EL Ø EN LA ALTURA DE COLOCACION ANTES DE PEDIR.",
    "FUENTE: CATALOGO DE ABRAZADERAS Y COLLARES DE HP ELECTRICIDAD (RIO CUARTO), REF. ENTRE PARENTESIS; FICHA DE LA APP.",
])
# ================= 3D DE LAS TRES
def abraz3d(cx, cy, R, tipo, z0=0, w=31.7, t=4.76, oreja=40, luz=4.7, frente=False, lados=(-1, 1), anillo=True):
    for sg in (1, -1):
        a0, a1 = (0, 180) if sg > 0 else (180, 360)
        if frente: a0, a1 = (0, 140) if sg > 0 else (305, 360)
        if anillo: m.ring([cx, cy + sg * luz / 2, z0], [1, 0, 0], [0, 1, 0], [0, 0, 1], R, R + t, 0, w, a0, a1, "galv", n=40)
        m.render()
        for side in lados:
            m.box(cx + side * (R + t) if side > 0 else cx - R - t - oreja, cx + R + t + oreja if side > 0 else cx - R - t,
                  min(cy + sg * luz / 2, cy + sg * (luz / 2 + t)), max(cy + sg * luz / 2, cy + sg * (luz / 2 + t)), z0, z0 + w, "galv", edge="#55606a")
            m.render()
        esc = anillo and (tipo >= 1 and sg > 0) or (tipo >= 2 and sg < 0)
        if esc:
            m.prism([(-R * .25, 0), (0, R * .22), (R * .25, 0)], [cx, cy + sg * (R + t / 2 + luz / 2), z0], [1, 0, 0], [0, sg, 0], [0, 0, 1], w, "galv", edge="#55606a")
            m.render()
    for side in lados:
        xb = cx + side * (R + t + oreja / 2)
        m.cyl([xb, cy - 18, z0 + w / 2], [xb, cy + 18, z0 + w / 2], 6, "galv", n=12); m.render()
        m.cyl([xb, cy + 12, z0 + w / 2], [xb, cy + 20, z0 + w / 2], 10, "galv", n=6, edge="#444"); m.render()
h.titulo(890, 62, "VISTA 3D - LISA, 1 ESCOTE Y 2 ESCOTES", "HIERRO GALVANIZADO, CERRADAS CON SUS BULONES")
h.iso(.62, 1080, 230)
abraz3d(0, 0, 110, 0)
h.iso(.62, 1300, 300)
abraz3d(0, 0, 70, 1)
h.iso(.62, 1180, 450)
abraz3d(0, 0, 100, 2)
h.iso(.62, 1080, 230); h.g3("1", (0, 110, 31), 1450, 130, "LISA Ø220 (4004)")
h.iso(.62, 1300, 300); h.g3("2", (0, 90, 31), 1450, 180, "1 ESCOTE Ø140 (4001)")
h.iso(.62, 1180, 450); h.g3("3", (0, 120, 31), 1450, 230, "2 ESCOTES Ø200 (4002)")
h.g3("4", (100 + 4.76 + 20, 20, 16), 1450, 280, "BULON EN LA OREJA")
# ================= 3D EN SU LUGAR
h.titulo(890, 560, "EN SU LUGAR - SOBRE EL POSTE", "SE ELIGE POR EL Ø DEL POSTE EN EL PUNTO DE COLOCACION")
h.iso(.5, 1180, 900)
ZS = [(z, 130 - 10 * (z + 150) / 570 + 1) for z in (60, 300)]
for z, rr in ZS: abraz3d(0, 0, rr, 0, z0=z, lados=(-1,), anillo=False)
m.cyl([0, 0, -150], [0, 0, 420], 130, "#5f6563", n=40, seg=6, r1=120); m.render()
for z, rr in ZS: abraz3d(0, 0, rr, 0, z0=z, frente=True, lados=(1,))
h.g3("1", (0, 132, 330), 1450, 680, "ABRAZADERA LISA (POR Ø)")
h.g3("4", (rr + 25, 20, 316), 1450, 730, "2 BULONES POR ABRAZADERA")
h.g3("5", (0, 125, 200), 1450, 780, "POSTE PRFV / H°A° (MEDIR EL Ø)")
h.rotulo(890, h.H - 150, 750, "MAT-HERRAJES-1", "ABRAZADERAS H°G°", "LISAS Y CON ESCOTE", "PLANTA, PLANCHUELA, DATOS Y 3D", "S/E / 1:2", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_herrajes_1.svg")); print("ok")
