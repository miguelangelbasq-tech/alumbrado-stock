import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
import pat_comun as pc

h = Hoja(); pc.defs(h)

# ================= VISTA FRONTAL (mirando el bloquete) · k = 1.2 (1:5)
k = 1.2; cx = 150; Y0 = 470; f = 2.0
yz = lambda z: Y0 - z * k
h.titulo(40, 62, "VISTA FRONTAL", "ESC. 1:5 - COLUMNA EXISTENTE Ø114")
zb = 80                                        # centro del bloquete (*)
h.rect(40, Y0, 240, 70, "url(#CONC)", K, 0); h.ln(40, Y0, 280, Y0, K, 1.6)
h.txt(46, Y0 + 16, "FUNDACION", 9.5, 700)
h.rect(cx - 68.4, yz(270), 136.8, Y0 - yz(270), "#fff", K, 1.3)
h.ln(cx, yz(270) - 10, cx, Y0 + 20, K, .4, h.EJE)
pc.corteDoble(h, cx, yz(270), 12)
h.path(f"M{cx-100},{Y0} L{cx-92},{yz(130)} L{cx+92},{yz(130)} L{cx+100},{Y0}", "none", K, .8, 'stroke-dasharray="8 3 2 3"')
h.txt(cx - 104, yz(130) - 8, "TORTA (*), NO DIBUJADA", 9.5, 400, OR)
yb = yz(zb)
hx = " ".join(f"{cx+28*math.cos(math.radians(60*i+30)):.1f},{yb+28*math.sin(math.radians(60*i+30)):.1f}" for i in range(6))
h.a(f'<polygon points="{hx}" fill="#fff" stroke="{K}" stroke-width="1" stroke-dasharray="4 2"/>')
pc.cableVA(h, f"M{cx},{Y0+30} V{yb+80}", 12, False)
h.path(f"M{cx-12},{yb+84} V{yb+44} L{cx-24},{yb+16} A26,26 0 1,1 {cx+24},{yb+16} L{cx+12},{yb+44} V{yb+84} Z", "#fff", K, 1)
pc.cuPelado(h, cx, yb + 52, cx, yb + 84, 9, False)
for yy in (yb + 58, yb + 72): h.ln(cx - 12, yy, cx + 12, yy, K, 1.6)
h.circ(cx, yb, 17.5, "none", K, .6)
pc.hexCab(h, cx, yb, 16, "#fff"); h.circ(cx, yb, 7.6, "none", K, .5)
pc.corteMarca(h, cx - 100, yb, cx + 100, yb, "B", -1)
pc.corteMarca(h, cx + 0.01, yz(205), cx, yz(-40), "A", 1)
h.dimV(cx - 84, yb, Y0, "(*)", ext=cx - 70, c=OR)
h.dimH(yz(270) + 22, cx - 68.4, cx + 68.4, "Ø114", dy=-5)
h.dimH(yb - 50, cx - 17.5, cx + 17.5, "Ø14,6", ext=yb - 20, dy=-5)
h.globo("2", cx + 22, yb - 18, 266, yb - 70, K, 10); h.globo("6", cx + 10, yb + 40, 266, yb + 30, K, 10); h.globo("7", cx + 5, Y0 + 20, 266, Y0 + 20, K, 10)
h.globo("1", cx + 60, yz(220), 266, yz(220), K, 10); h.globo("4", cx + 8, yb + 6, 266, yb - 20, K, 10)

# ================= CORTE A-A (vertical, por el eje del bloquete) · 2 px/mm (1:3)
s = 2.0; xw = 344; Ya = 500                 # xw = cara exterior del fuste, Ya = piso
ya = lambda z: Ya - z * s
h.titulo(300, 62, "CORTE A-A - POR EL BLOQUETE", "ESC. 1:3 - COTAS EN mm")
h.rect(300, Ya, 300, 46, "url(#CONC)", K, 0)
h.path(f"M{xw},{Ya} V{ya(130)} L{xw+190},{ya(110)} L{xw+240},{Ya} Z", "url(#CONCP)", K, 1.1)
h.rect(xw - 8, ya(185), 8, Ya + 46 - ya(185), "url(#ANSI31)", K, 1.1)
h.txt(xw - 14, ya(150), "INTERIOR DEL FUSTE", 8.5, 400, G, "start", CAD, -90)
pc.corteDoble(h, xw - 4, ya(185), 5)
hb = 24; L = 50; yb = ya(zb)
h.rect(xw, yb - hb, L * s, hb * 2, "url(#ANSI31)", K, 1.3)
dr = 12.7 * s / 2; prof = 34 * s
h.rect(xw + L * s - prof, yb - dr, prof, 2 * dr, "#fff", K, .9)
h.path(f"M{xw+L*s-prof},{yb-dr} l-6,{dr} l6,{dr}", "#fff", K, .9)
pc.rosca(h, xw + L * s - prof + 4, yb, xw + L * s + 10, yb, dr - 1.5, 4)
xp = xw + L * s
h.rect(xp, yb - 30, 5, 72, "#fff", K, 1)
h.rect(xp + 5, yb - 16, 4, 32, "#fff", K, .9)
h.rect(xp + 9, yb - 18, 14, 36, "#fff", K, 1.1)
h.ln(xp + 9, yb - 8, xp + 23, yb - 8, K, .5); h.ln(xp + 9, yb + 8, xp + 23, yb + 8, K, .5)
h.rect(xp - 3, yb + 42, 14, 46, "#fff", K, 1.1)
pc.cuPelado(h, xp + 4, yb + 50, xp + 4, yb + 88, 8, False)
for yy in (yb + 58, yb + 74): h.ln(xp - 3, yy, xp + 11, yy, K, 1.6)
pc.cableVA(h, f"M{xp+4},{yb+88} V{Ya-40} Q{xp+4},{Ya-24} {xp+24},{Ya-24} H{596}", 12, False)
pc.flecha(h, 520, Ya - 44, 556, Ya - 44); h.txt(556, Ya - 50, 'A LA JABALINA', 9.5, 700, K, "end")
for sgn in (-1, 1):
    y0 = yb + sgn * hb
    h.path(f"M{xw},{y0} L{xw},{y0+sgn*10} L{xw+10},{y0} Z", K, K, .6)
# símbolo de soldadura: flecha a la junta, línea de referencia sobre la torta
jx, jy = xw + 4, yb - hb - 4; rx, ry = xw + 52, ya(170)
h.ln(jx, jy, rx, ry, K, .8); h.a(f'<polygon points="{jx:.1f},{jy:.1f} {jx+3:.1f},{jy-8:.1f} {jx+7:.1f},{jy-5:.1f}" fill="{K}"/>')
h.ln(rx, ry, rx + 100, ry, K, .8); h.circ(rx, ry, 4.5, "none", K, .9); h.path(f"M{rx+30},{ry} v-10 l10,10 z", "none", K, .9)
h.txt(rx + 46, ry - 4, "TODO EL PERIMETRO", 9.5)
h.path(f"M300,{Ya} H{xw-8} M{xw+240},{Ya} H596", "none", K, 1.8)
h.nivel(470, Ya, "±0,00")
h.dimH(yb + hb + 34, xw, xw + L * s, "50", ext=yb + hb + 2, dy=13)
h.dimH(yb + hb + 12, xw + L * s - prof, xw + L * s, "(*)", ext=yb + dr + 2, c=OR, dy=-3)
h.dimV(xp + 40, yb - dr, yb + dr, 'RW 1/2"', ext=xp + 24)
h.dimV(xw - 26, yb - hb, yb + hb, "(*)", ext=xw - 10, c=OR)
h.dimV(xw - 48, yb, Ya, "(*)", ext=xw - 10, c=OR)
h.dimH(ya(185) - 4, xw - 8, xw, "≥4", dy=-5)
h.llamadaDet(xw + L * s - prof / 2, yb, 30, "D1")
for n, ax, ay, gy in (("1", xw - 4, ya(176), 140), ("2", xw + 24, yb - hb + 6, 222), ("4", xp + 18, yb - 10, 288), ("5", xp + 7, yb + 14, 355),
                      ("3", xw + 3, yb + hb + 4, 390), ("6", xp + 10, yb + 64, 422), ("7", xp + 60, Ya - 24, 462), ("8", xw + 150, ya(40), 520)):
    h.globo(n, ax, ay, 584, gy, K, 10)

# ================= CORTE B-B (horizontal, por el eje del bloquete) · 1 px/mm (1:6)
h.titulo(622, 62, "CORTE B-B", "ESC. 1:6 - PLANTA POR EL BLOQUETE")
bx, by, R = 690, 230, 57
h.circ(bx, by, R, "url(#ANSI31)", K, 1.2); h.circ(bx, by, R - 4, "#fff", K, 1)
h.ln(bx - R - 10, by, bx + R + 10, by, K, .4, h.EJE); h.ln(bx, by - R - 10, bx, by + R + 10, K, .4, h.EJE)
h.rect(bx + R - 1, by - 12, 51, 24, "url(#ANSI31)", K, 1.2)
h.rect(bx + R + 50 - 17, by - 6.35, 17, 12.7, "#fff", K, .8, h.OCULTA)
for sgn in (-1, 1):
    h.path(f"M{bx+R-2},{by+sgn*12} l0,{sgn*9} l9,{-sgn*9} Z", K, K, .5)
h.rect(bx + R + 50, by - 14, 3, 28, "#fff", K, .9); h.rect(bx + R + 53, by - 9, 2, 18, "#fff", K, .8); h.rect(bx + R + 55, by - 10, 7, 20, "#fff", K, 1)
h.dimH(by - R - 18, bx - R, bx + R, "Ø114", ext=by - 4, dy=-5)
h.dimH(by + 34, bx + R, bx + R + 50, "50", ext=by + 14, dy=13)
h.txt(bx - 30, by + R + 30, "PARED ≥ 4 mm (ETG, Ø > 76)", 9.5)
pc.corteMarca(h, bx + R + 25, by - 72, bx + R + 25, by + 26, "A", 1)
h.globo("2", bx + R + 30, by - 8, 836, by - 40, K, 9); h.globo("3", bx + R + 4, by + 16, 836, by + 66, K, 9)

# ================= D1 · ROSCA NO PASANTE (texto del detalle)
h.titulo(622, 352, "D1 - ROSCA NO PASANTE", "S/E")
h.rect(640, 384, 18, 100, "url(#ANSI31)", K, 1.1)
h.rect(658, 404, 110, 60, "url(#ANSI31)", K, 1.1)
h.rect(700, 420, 68, 28, "#fff", K, .9); h.path("M700,420 l-10,14 l10,14", "#fff", K, .9)
for x in range(704, 768, 6): h.ln(x, 420, x + 3, 424, K, .5); h.ln(x, 448, x + 3, 444, K, .5)
h.txt(640, 504, "EL AGUJERO NO LLEGA AL FUSTE:", 9.5, 700); h.txt(640, 517, "NO SE PERFORA LA COLUMNA (ETG 14.3).", 9.5)
h.txt(640, 532, "CARA DE CONEXION SIN PINTURA.", 9.5)

# ================= VARIANTE: terminal a compresión ojal 5/16"
h.titulo(622, 566, "VARIANTE - TERMINAL", 'S/E - A COMPRESION, OJAL 5/16" (ETG 14.3)')
vx, vy = 660, 620
h.circ(vx, vy, 13, "#fff", K, 1); h.circ(vx, vy, 4, "#fff", K, .8)
h.path(f"M{vx+8},{vy-10} H{vx+40} V{vy+10} H{vx+8}", "#fff", K, 1)
h.path(f"M{vx+40},{vy-9} l14,-2 v22 l-14,-2 Z", "#fff", K, 1); h.ln(vx + 46, vy - 10, vx + 46, vy + 10, K, 1.4)
pc.cableVA(h, f"M{vx+54},{vy} H{vx+110}", 10, False)
h.txt(vx - 14, vy + 30, "OJAL Cu ESTAÑADO 10 mm² (2045), CRIMPADO", 9.5)
h.globo("9", vx - 6, vy - 10, 638, vy - 26, K, 9)

# ================= CÓMPUTO + RAYADOS
h.tabla(40, 572, [(134, "l", False), (50, "c", True), (136, "l", False)],
        [("CONCEPTO", "CANT.", "CALCULO"), ("BLOQUETE DE BRONCE", "1 u", "1 POR COL. EXIST."), ("TERMINAL BANDERITA", "1 u", "1 POR COL. EXIST."),
         ('BULON 1/2" + ARANDELA', "1 u", "MEDIDA (*)"), ("CORDON DE SOLDADURA", "1", "TODO EL PERIMETRO"),
         ("LIMPIEZA DE PINTURA", "1", "CARA DE CONEXION"), ("TORTA DE MORTERO", "1 u", "TAPA EL BLOQUETE (*)"),
         ("COLUMNA NUEVA", "0", "USA EL BULON PAT")], rowh=19, titulo="COMPUTO POR COLUMNA EXISTENTE",
        colores=lambda i, j, t: OR if "(*)" in t else K)
h.rayados(380, 572, [("ANSI31", "BRONCE / ACERO (CORTE)"), ("CONCP", "TORTA / MORTERO (*)"), ("CONC", "FUNDACION H-13")], cols=1)

h.notas(40, 790, [
    'BLOQUETE = TUERCA RW 1/2" DE BRONCE SOLDADA AL FUSTE (DETALLE B DEL AP-C-006). PAÑOL 7003: «BLOQUETE DE BRONCE 1/2 50 mm (MN1101 b)».',
    "VA SOLO EN COLUMNA METALICA EXISTENTE (REVISION v107). LA COLUMNA NUEVA USA EL BULON PAT DE LA CAJA (AP-CC-001/004).",
    "ETG 14.3: LATON PARA USO ELECTRICO, ROSCA NO PASANTE, SOLDADO EN TODO SU PERIMETRO, CARA DE CONEXION SIN PINTURA.",
    "ETG 14.3: CONEXION EXTERNA = BLOQUETE SOBRE EL PISO, TAPADO CON LA TORTA. LA ETG RECOMIENDA LA CONEXION INTERNA (ANTIRROBO).",
    "EL BLOQUETE DE HIERRO 7002 (MN-1101a) NO CUMPLE: NO USAR. EN ACOMETIDA AEREA VER AP-TC-006 (10 + 2,5 EN LA MISMA BANDERITA).",
    "TERMINAL: BANDERITA Cu ESTAÑADO 10 mm² OJAL Ø14,6 (7018, LA QUE SE USA) O A COMPRESION OJAL 5/16\" (2045, VARIANTE). LAS DOS VALEN (ETG).",
    '(*) FORMA EXTERIOR Y ALTO DEL BLOQUETE, PROFUNDIDAD DE LA ROSCA, BULON Y ARANDELA: NO ESTAN EN LA APP. CONFIRMAR CON EL PLANO.',
    "(*) ALTURA DEL BLOQUETE SOBRE EL PISO Y MEDIDAS DE LA TORTA: A CONFIRMAR. UNIFICAR EL NOMBRE: RW 1/2\" / Q-320E / MN1101 b / «DE LATON».",
    "(*) EL PAÑOL DICE «BRONCE» Y LA ETG PIDE «LATON PARA USO ELECTRICO» SIN ZINC EN EL CONECTOR: CONFIRMAR LA ALEACION AL COMPRAR."])

# ================= 3D (torta cortada a un cuarto)
h.titulo(890, 62, "VISTA 3D - BLOQUETE EN LA COLUMNA EXISTENTE", "LA TORTA CORTADA A UN CUARTO PARA VER EL BLOQUETE, LA BANDERITA Y EL CABLE")
h.iso(.38, 1150, 380)
G0 = 400
h.BOX(-G0, G0, -G0, G0, -260, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
h.F3([(-300, -300, 0), (300, -300, 0), (300, 300, 0), (-300, 300, 0)], "url(#conc3)", "#555", .7)
h.F3([(300, -300, 0), (300, 300, 0), (300, 300, -260), (300, -300, -260)], "url(#conc3)", "#555", .5, op=.0)
# caño 1" que sale de la torta hacia la jabalina
h.tuboX(150, 470, 190, 15, 15, "url(#pvc)", "#666")
RT, HT = 250, 140
# columna (abajo, se ve en el cuarto cortado)
h.tuboZ(0, HT, 0, 0, 57, 57, "url(#galv)", "#444")
arc = lambda a0, a1, z: [(RT * math.cos(math.radians(a)), RT * math.sin(math.radians(a)), z) for a in range(a0, a1 + 1, 10) if True] if a1 >= a0 else [(RT * math.cos(math.radians(a)), RT * math.sin(math.radians(a)), z) for a in range(a0, a1 - 1, -10)]
# lados curvos visibles de la torta (90..180 y -90..0)
for a0, a1 in ((90, 180), (-90, 0)):
    top = arc(a0, a1, HT); bot = arc(a1, a0, 0)
    h.F3(top + bot, "url(#concP3)", "#6b6457", .6); h.F3(top + bot, "#3b3326", "none", 0, .22)
top = [(0, 0, HT)] + arc(0, -270, HT)
h.F3(top, "url(#concP3)", "#6b6457", .7)
# caras de corte de la torta
h.F3([(0, 57, 0), (0, RT, 0), (0, RT, HT), (0, 57, HT)], "#bdb5a5", "#6b6457", .7)
h.F3([(57, 0, 0), (RT, 0, 0), (RT, 0, HT), (57, 0, HT)], "#c9c1b1", "#6b6457", .7)
# columna que sigue arriba
h.tuboZ(HT, 620, 0, 0, 57, 57, "url(#galv)", "#444")
pt = h.P(0, 0, 620); h.txt(pt[0], pt[1] - 26, "SIGUE", 10, 700, NV, "middle", INT)
# bloquete (bronce) en dirección +x+y, soldado
ang = math.radians(45); ux, uy = math.cos(ang), math.sin(ang)
def pr(d, w, z): return (d * ux - w * uy, d * uy + w * ux, z)
zb3 = 80
for d0, d1, w, hh, f in ((57, 107, 12, 12, "url(#bronce)"),):
    cara = [pr(d1, -w, zb3 - hh), pr(d1, w, zb3 - hh), pr(d1, w, zb3 + hh), pr(d1, -w, zb3 + hh)]
    lado = [pr(d0, w, zb3 - hh), pr(d1, w, zb3 - hh), pr(d1, w, zb3 + hh), pr(d0, w, zb3 + hh)]
    arriba = [pr(d0, -w, zb3 + hh), pr(d1, -w, zb3 + hh), pr(d1, w, zb3 + hh), pr(d0, w, zb3 + hh)]
    h.F3(lado, f, "#5a3a10", .7); h.F3(arriba, "#e8c27a", "#5a3a10", .7); h.F3(cara, f, "#5a3a10", .8)
# cordón de soldadura (gris) alrededor del bloquete contra el fuste
cs = [pr(57, -14, zb3 - 14), pr(57, 14, zb3 - 14), pr(57, 14, zb3 + 14), pr(57, -14, zb3 + 14), pr(57, -14, zb3 - 14)]
p2 = [h.P(*q) for q in cs]; h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in p2), "none", "#8d949c", 3.2)
# banderita (estañada) + bulón
ban = [pr(108, -16, zb3 - 50), pr(108, 16, zb3 - 50), pr(108, 16, zb3 + 18), pr(108, -16, zb3 + 18)]
h.F3(ban, "url(#estano)", "#555", .8)
c0 = h.P(*pr(112, 0, zb3)); pc.hexCab(h, c0[0], c0[1], 5.5, "url(#bronce)", "#5a3a10")
# cable 1x10 V/A: baja de la banderita, por la torta, al caño y a la jabalina
q1 = h.P(*pr(110, 0, zb3 - 50)); q2 = h.P(*pr(110, 0, 15)); q3 = h.P(150, 190, 15)
pc.cableVA(h, f"M{q1[0]:.1f},{q1[1]:.1f} L{q2[0]:.1f},{q2[1]:.1f} L{q3[0]:.1f},{q3[1]:.1f}", 4, True)
q4 = h.P(470, 190, 15); h.txt(q4[0] + 8, q4[1] + 16, "A LA JABALINA", 10, 700, NV, "start", INT)
GX = 1440
h.g3("1", (-40, 40, 450), GX, 140, "FUSTE EXISTENTE")
h.g3("3", pr(57, 14, zb3 + 14), GX, 200, "SOLDADURA")
h.g3("2", pr(80, -12, zb3 + 12), GX, 260, "BLOQUETE 7003")
h.g3("4", pr(112, 0, zb3), GX, 320, 'BULON 1/2" (*)')
h.g3("6", pr(108, 16, zb3 - 30), GX, 380, "BANDERITA 7018")
h.g3("7", (300, 190, 15), GX, 440, "1x10 V/A")
h.g3("8", (-150, 150, HT), GX, 500, "TORTA (*)")
# --- detalle A: el bloquete de cerca (color)
ax_, ay_ = 1555, 610
h.a(f'<clipPath id="clC6"><circle cx="{ax_}" cy="{ay_}" r="72"/></clipPath>')
h.circ(ax_, ay_, 72, "#f7f8fa", NV, 1.2); h.txt(ax_ - 80, ay_ - 50, "A - DE CERCA", 10.5, 700, NV, "end", INT)
h.a('<g clip-path="url(#clC6)">')
h.rect(ax_ - 80, ay_ - 80, 34, 160, "url(#galv)", "#555", .6)
h.rect(ax_ - 46, ay_ - 18, 60, 36, "url(#bronce)", "#5a3a10", 1)
h.path(f"M{ax_-46},{ay_-22} q-4,22 0,44", "none", "#8d949c", 4)
h.rect(ax_ + 14, ay_ - 30, 6, 80, "url(#estano)", "#555", .9)
h.rect(ax_ + 20, ay_ - 10, 4, 20, "#d6d9dd", "#555", .7)
h.rect(ax_ + 24, ay_ - 14, 12, 28, "url(#bronce)", "#5a3a10", .9)
pc.cableVA(h, f"M{ax_+17},{ay_+50} V{ay_+90}", 10, True)
h.a('</g>')
h.globo("3", ax_ - 46, ay_ - 20, ax_ - 92, ay_ - 20, NV, 9)
h.globo("2", ax_ - 16, ay_ + 14, ax_ - 92, ay_ + 22, NV, 9)
h.globo("6", ax_ + 18, ay_ + 40, ax_ - 70, ay_ + 66, NV, 9)
h.txt(890, 700, "El bloquete es una tuerca de bronce soldada al fuste; la banderita con el 1x10 se atornilla a él y queda tapada por la torta.", 10.5, 400, G, "start", INT)

# ================= LISTA + RÓTULO
VIN = lambda i, j, t: OR if (t == "A VINCULAR" or "(*)" in t) else K
h.tabla(890, 720, [(40, "c", False), (450, "l", False), (100, "c", True), (150, "c", False)],
        [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "FUSTE DE COLUMNA METALICA EXISTENTE Ø114 (PARED ≥ 4)", "-", "EXISTENTE"),
         ("2", 'BLOQUETE DE BRONCE 1/2" x 50 (MN1101 b), ROSCA NO PASANTE', "1 u", "7003"),
         ("3", "CORDON DE SOLDADURA EN TODO EL PERIMETRO", "1", "-"),
         ("4", 'BULON 1/2" (*)', "1 u", "A VINCULAR"),
         ("5", "ARANDELA (*)", "1 u", "A VINCULAR"),
         ("6", "TERMINAL BANDERITA Cu ESTAÑADO 10 mm², OJAL Ø14,6", "1 u", "7018"),
         ("7", "CABLE Cu 1x10 mm² VERDE-AMARILLO (VER AP-TC-005)", "-", "7010"),
         ("8", "TORTA DE MORTERO CEMENTICIO (*)", "1 u", "8020"),
         ("9", 'VARIANTE: TERMINAL A COMPRESION 10 mm², OJAL 5/16"', "(1 u)", "2045"),
         ("-", "NO USAR: BLOQUETE DE HIERRO (MN-1101a)", "0", "7002")],
        rowh=21, titulo="LISTA DE MATERIALES (1 COLUMNA EXISTENTE)", colores=VIN)
h.rotulo(890, h.H - 150, 750, "AP-C-006", "COLUMNA METALICA", "BLOQUETE DE PAT", "SOLO COLUMNA EXISTENTE - VISTA, CORTES, DETALLE Y 3D", "1:5 / 1:3", "B-B 1:6 - 3D S/E", fecha="07/11/2026")
h.guardar("ap_c_006.svg"); print("ok")
