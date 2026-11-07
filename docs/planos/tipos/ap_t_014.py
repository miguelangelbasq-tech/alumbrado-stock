import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT, CORES
from _taer import *
# DATOS: ficha AP-T-014 «tapa acrílica de protección que se coloca en el tablero de columna existente; el tamaño sale de la base de
#  este plano» (plano oficial pendiente; LP 21478 ítem 15.70). Calculadora: «Acrílico de protección de partes activas para la caja de
#  conexión de la columna, con cartel de riesgo eléctrico — obligatorio (ETG cap. 16.1), 1 por caja · ítem 15.64/15.70 · sin código en
#  el pañol». ETG 16.1 (según la app): acrílico obligatorio y caja a 2,50 m. Fondos del pañol: 3009 220x75, 3010 220x80, 3011 230x95,
#  6009 70x165. Riel DIN NS35 de 14 cm (AP-CC-014). Variante: caja estanca externa aluminio 200x150x100 IP65 (6003, AP-PL-003).
h = Hoja()
ACR = "#cfe6f5"
PW, PH = 95, 230          # fondo 3011 (230 x 95 x 2) para el dibujo
RL = 140                  # riel DIN
D = 114                   # Ø de columna para el dibujo (ejemplo) (*)
def acr2d(x, y, w, ht, k_=1.0):
    h.rect(x, y, w, ht, "none", K, 1.3, 'rx="3"')
    for i in range(3): h.ln(x + w * (.18 + i * .12), y + 8, x + w * (.05 + i * .12), y + 22, K, .5)
    for (cx, cy) in ((x + 8, y + 8), (x + w - 8, y + 8), (x + 8, y + ht - 8), (x + w - 8, y + ht - 8)): h.circ(cx, cy, 3, "#fff", K, .7); h.circ(cx, cy, 1, K, K, 0)
def tablerito(x, y, k_, color=False):
    """fondo de chapa con riel vertical, 2 portafusibles y 3 BPN (gris, celeste, verde)"""
    h.rect(x, y, PW * k_, PH * k_, "url(#galv)" if color else "#fff", K, 1)
    rx = x + PW * k_ / 2 - 17.5 * k_; ry = y + (PH - RL) / 2 * k_
    h.rect(rx, ry, 35 * k_, RL * k_, "#ddd" if color else "#fff", K, .8)
    for yy in (ry + 6 * k_, ry + (RL - 10) * k_): h.circ(x + PW * k_ / 2, yy, 2.2 * k_, "#fff", K, .6)
    yb = ry + 14 * k_
    for i, (c, alto) in enumerate((("#efe9d8", 30), ("#efe9d8", 30), ("#9aa0a6", 8.2), ("#4fa3d9", 8.2), ("#3f9b48", 8.2))):
        hh = (17.5 if i < 2 else 8.2) * k_
        h.rect(x + PW * k_ / 2 - 25 * k_, yb, 50 * k_, hh, c if color else "#fff", K, .7)
        if i < 2: h.rect(x + PW * k_ / 2 - 6 * k_, yb + 3 * k_, 12 * k_, hh - 6 * k_, "#c98b3a" if color else "url(#cuH)", K, .4)
        else: h.circ(x + PW * k_ / 2 - 15 * k_, yb + hh / 2, 2 * k_, "#fff", K, .5); h.circ(x + PW * k_ / 2 + 15 * k_, yb + hh / 2, 2 * k_, "#fff", K, .5)
        yb += hh + 2 * k_
    return yb
# =================================================== VISTA FRONTAL
h.titulo(40, 62, "VISTA FRONTAL - TAPA SACADA", "ESC. 1:2 - CON EL ACRILICO PUESTO")
k = 1.15; fx, fy = 120, 158
cw = D * k * 1.15
h.path(f"M{fx+PW*k/2-cw/2},{fy-40} V{fy+PH*k+40} M{fx+PW*k/2+cw/2},{fy-40} V{fy+PH*k+40}", "none", K, 1.3)
corte_quiebre(h, fx + PW * k / 2 - cw / 2 - 10, fx + PW * k / 2 + cw / 2 + 10, fy - 42); corte_quiebre(h, fx + PW * k / 2 - cw / 2 - 10, fx + PW * k / 2 + cw / 2 + 10, fy + PH * k + 42)
h.rect(fx - 8, fy - 14, PW * k + 16, PH * k + 28, "none", K, .9, 'rx="6" stroke-dasharray="6 3"')
tablerito(fx, fy, k)
acr2d(fx - 4, fy + 18, PW * k + 8, PH * k - 36)
cx_, cy_, a = fx + PW * k / 2, fy + PH * k * .78, 16
h.path(f"M{cx_},{cy_-a} L{cx_+a},{cy_+a*.75} H{cx_-a} Z", "#fff", K, .9); h.path(f"M{cx_+2},{cy_-a*.4} l-5,9 h5 l-4,9", "none", K, 1.1)
h.dimH(fy - 26, fx, fx + PW * k, "95 (FONDO 3011)", ext=fy - 2)
h.dimV(fx - 22, fy, fy + PH * k, "230", ext=fx - 2)
h.dimV(fx + PW * k + 26, fy + 18, fy + PH * k - 18, "S/ PLANO (*)", ext=fx + PW * k + 6, c=OR)
h.dimH(fy + PH * k + 56, fx - 4, fx + PW * k + 4, "S/ PLANO (*)", ext=fy + PH * k - 16, c=OR, dy=-4)
h.txt(fx + PW * k / 2, fy + PH * k + 84, "VENTANA S/ COLUMNA (*)", 8.5, 400, OR, "middle")
h.ln(fx - 40, fy + PH * k * .42, fx - 26, fy + PH * k * .42, K, .8, h.EJE); h.ln(fx + PW * k + 44, fy + PH * k * .42, fx + PW * k + 58, fy + PH * k * .42, K, .8, h.EJE)
for x_ in (fx - 40, fx + PW * k + 58): h.ln(x_, fy + PH * k * .42 - 7, x_, fy + PH * k * .42 + 7, K, 1.8)
h.txt(fx - 46, fy + PH * k * .42 + 4, "B", 13, 700, K, "end"); h.txt(fx + PW * k + 62, fy + PH * k * .42 + 4, "B", 13, 700)
h.ln(fx + PW * k / 2 - 30, fy - 52, fx + PW * k / 2 - 30, fy - 42, K, 1.8); h.txt(fx + PW * k / 2 - 25, fy - 44, "A", 13, 700)
GX = 300
h.globo("1", fx + 14, fy + 30, GX, 150); h.globo("2", fx + PW * k - 6, fy + 10, GX, 120)
h.globo("3", fx + PW * k / 2 + 10, fy + 60, GX, 190); h.globo("4", fx + PW * k / 2 + 22, fy + 116, GX, 230)
h.globo("5", fx + 8, fy + 26, 60, 120); h.globo("6", cx_ + 6, cy_, GX, 310); h.globo("7", fx + PW * k / 2 + cw / 2, fy + PH * k + 20, GX, 350)
# =================================================== CORTE A-A
h.titulo(350, 62, "CORTE A-A (LATERAL)", "ESC. 1:2 - SEPARADO DE LO ACTIVO")
ax, ay = 400, 140; ka = 1.15
h.rect(ax, ay - 40, 6, PH * ka + 80, "url(#ANSI31)", K, 1)                     # pared de la columna (fondo)
h.rect(ax + 6 + 70 * ka, ay - 40, 6, 30, "url(#ANSI31)", K, 1); h.rect(ax + 6 + 70 * ka, ay + PH * ka + 10, 6, 30, "url(#ANSI31)", K, 1)   # pared con la ventana
h.rect(ax + 10, ay, 2 * ka * 1.5, PH * ka, "url(#ANSI31)", K, .8)               # chapa
rx0 = ax + 10 + 3.5
h.rect(rx0, ay + (PH - RL) / 2 * ka, 7.5 * ka, RL * ka, "#fff", K, .8)          # riel
for yy, hh in ((ay + 60, 20), (ay + 82, 20), (ay + 106, 9), (ay + 117, 9), (ay + 128, 9)):
    h.path(f"M{rx0+7.5*ka},{yy} h{40*ka} v{hh} h-{40*ka} z", "#fff", K, .8)
zx = rx0 + 7.5 * ka + 40 * ka
sep = 14                                                                         # separación al acrílico (*)
h.rect(zx + sep, ay + 18, 4, PH * ka - 36, ACR, K, 1.2)
for yy in (ay + 27, ay + PH * ka - 27):
    h.rect(rx0 - 3, yy - 3, zx + sep - rx0 + 3, 6, "#fff", K, .6); h.rect(zx + sep + 4, yy - 5, 4, 10, "#bbb", K, .6)
h.rect(ax + 12 + 70 * ka, ay - 10, 4, PH * ka + 20, "url(#galv)", K, 1, h.OCULTA)   # tapa (sacada)
h.txt(ax + 22 + 70 * ka, ay + PH * ka + 2, "TAPA", 8.5, 700); h.txt(ax + 22 + 70 * ka, ay + PH * ka + 13, "(SACADA)", 8.5, 400, G)
h.dimH(ay - 16, zx, zx + sep, "(*)", c=OR, ext=ay + 18)
h.dimV(ax - 18, ay + 18, ay + PH * ka - 18, "S/ PLANO (*)", ext=zx + sep, c=OR)
h.txt(ax - 4, ay + PH * ka + 52, "COLUMNA EXISTENTE", 8.5, 700)
h.globo("5", zx + sep + 2, ay + 60, 560, 130); h.globo("8", zx + sep + 6, ay + 27, 560, 100); h.globo("9", zx - 6, ay + 27, 560, 160)
h.globo("3", rx0 + 4, ay + 200, 560, 230); h.globo("1", ax + 12, ay + 240, 560, 270)
# =================================================== CORTE B-B
h.titulo(600, 62, "CORTE B-B (PLANTA)", "ESC. 1:2 - COLUMNA Ø114 (*)")
bx, by = 720, 220; kb = 1.1; R = D / 2 * kb; e = 3.6 * kb
ang = math.radians(42)
h.path(f"M{bx+R*math.sin(ang):.1f},{by+R*math.cos(ang):.1f} A{R},{R} 0 1 1 {bx-R*math.sin(ang):.1f},{by+R*math.cos(ang):.1f} L{bx-(R-e)*math.sin(ang):.1f},{by+(R-e)*math.cos(ang):.1f} A{R-e},{R-e} 0 1 0 {bx+(R-e)*math.sin(ang):.1f},{by+(R-e)*math.cos(ang):.1f} Z", "url(#ANSI31)", K, 1)
cy0 = by - R + 18
h.rect(bx - PW / 2 * kb * .62, cy0, PW * kb * .62, 3, "url(#ANSI31)", K, .6)
h.rect(bx - 17.5 * kb * .62, cy0 + 3, 35 * kb * .62, 7.5 * kb, "#fff", K, .7)
h.rect(bx - 25 * kb * .62, cy0 + 3 + 7.5 * kb, 50 * kb * .62, 40 * kb, "#fff", K, .8)
ya = cy0 + 3 + 7.5 * kb + 40 * kb + 14
h.rect(bx - PW / 2 * kb * .7, ya, PW * kb * .7, 4, ACR, K, 1.1)
h.ln(bx - R - 14, by, bx + R + 14, by, K, .4, h.EJE); h.ln(bx, by - R - 14, bx, by + R + 30, K, .4, h.EJE)
h.dimH(by - R - 22, bx - R, bx + R, "Ø COLUMNA (*)", ext=by - 4, c=OR)
h.dimH(by + R + 36, bx - R * math.sin(ang), bx + R * math.sin(ang), "VENTANA (*)", ext=by + R * math.cos(ang) + 2, c=OR, dy=12)
h.globo("5", bx + 20, ya + 2, 820, ya - 10); h.globo("4", bx + 14, cy0 + 30, 820, cy0 + 6)
# =================================================== D1 FIJACION
h.titulo(40, 548, "D1 - FIJACION DEL ACRILICO", "ESC. 2:1 - EN CADA PUNTA (*)")
dx, dy = 90, 640; kd = 2.2
h.rect(dx, dy - 40, 2 * kd * 1.4, 80, "url(#ANSI31)", K, .8); h.txt(dx - 4, dy + 54, "CHAPA", 8.5, 700)
h.rect(dx + 6, dy - 7, 34 * kd, 14, "#fff", K, .8); h.txt(dx + 2, dy - 50, "SEPARADOR (*)", 8.5, 700, OR)
h.rect(dx + 6 + 34 * kd, dy - 30, 4 * kd, 60, ACR, K, 1.2); h.txt(dx + 30 + 38 * kd, dy - 20, "ACRILICO e (*)", 8.5, 700, OR)
h.rect(dx + 10 + 38 * kd, dy - 12, 6, 24, "#bbb", K, .7); h.rect(dx - 10, dy - 3, dx + 26 + 38 * kd - dx + 10, 6, "#e3e3e3", K, .6, 'opacity=".8"')
h.rect(dx - 14, dy - 8, 6, 16, "#999", K, .6)
h.dimH(dy + 48, dx + 6, dx + 6 + 34 * kd, "(*)", ext=dy + 8, c=OR, dy=12)
h.txt(46, dy + 76, "NADA DE COBRE A LA VISTA DETRAS DEL ACRILICO;", 8.5, 400); h.txt(46, dy + 88, "SE SACA SIN TOCAR LAS PARTES ACTIVAS.", 8.5, 400)
# =================================================== D2 CARTEL
h.titulo(330, 548, "D2 - CARTEL", "S/E - SOBRE EL ACRILICO")
tx, ty, a = 390, 640, 34
h.path(f"M{tx},{ty-a} L{tx+a*1.1},{ty+a*.85} H{tx-a*1.1} Z", "#fff", K, 1.6)
h.path(f"M{tx},{ty-a+9} L{tx+a*1.1-11},{ty+a*.85-5} H{tx-a*1.1+11} Z", "none", K, .6)
h.path(f"M{tx+4},{ty-a*.35} l-10,17 h10 l-8,17", "none", K, 2)
h.txt(tx, ty + a + 18, "RIESGO ELECTRICO", 10, 700, K, "middle")
h.txt(tx, ty + a + 32, "TAMAÑO (*)", 8.5, 400, OR, "middle")
# =================================================== VARIANTE CAJA EXTERNA
h.titulo(520, 548, "VARIANTE: CAJA EXTERNA", "S/E - AP-PL-003: ALUMINIO 200x150x100 IP65 (6003)")
vx, vy = 590, 600; kv = .85
h.path(f"M{vx-30},{vy-30} V{vy+196} M{vx+30},{vy-30} V{vy+196}", "none", K, 1.2)
h.rect(vx + 30, vy, 150 * kv, 200 * kv, "#fff", K, 1.3, 'rx="5"')
tablerito(vx + 30 + (150 * kv - PW * .7) / 2, vy + 10, .7)
acr2d(vx + 30 + 10, vy + 24, 150 * kv - 20, 200 * kv - 48)
for z_ in (vy + 30, vy + 150): h.rect(vx - 34, z_, 68 + 4, 8, "none", K, .9); h.rect(vx + 30, z_ - 2, 6, 12, "#ddd", K, .5)
h.dimH(vy - 14, vx + 30, vx + 30 + 150 * kv, "150", ext=vy - 2); h.dimV(vx + 30 + 150 * kv + 18, vy, vy + 200 * kv, "200", ext=vx + 30 + 150 * kv + 4)
h.txt(vx + 210, vy + 40, "2 JUEGOS DE", 8.5, 700); h.txt(vx + 210, vy + 52, "ABRAZADERAS", 8.5, 700); h.txt(vx + 210, vy + 64, "A 2,50 m", 8.5, 400, G)
h.txt(vx + 210, vy + 100, "MISMO ACRILICO", 8.5, 700); h.txt(vx + 210, vy + 112, "ADENTRO (*)", 8.5, 400, OR)
h.globo("V", vx + 30 + 150 * kv, vy + 150, vx + 220, vy + 150)
# =================================================== FONDOS
FD = [("CODIGO", "FONDO DEL PAÑOL", "ACRILICO"), ("3011", "230 x 95 x 2 GALV.", "A MEDIDA (*)"), ("3010", "220 x 80 x 2 NEGRA", "A MEDIDA (*)"),
      ("3009", "220 x 75 x 2 C/ RIEL", "A MEDIDA (*)"), ("6009", "70 x 165", "A MEDIDA (*)")]
h.tabla(40, 820, [(60, "c", False), (150, "l", False), (100, "c", False)], FD, rowh=17, titulo="FONDOS DE COLUMNA (EL ACRILICO LOS CUBRE)",
        colores=lambda i, j, t: OR if "(*)" in t else K)
rows = [("ACRILICO DE PROTECCION", "1", "1 POR CAJA DE COLUMNA (CALCULADORA)"), ("CARTEL RIESGO ELECTRICO", "1", "1 POR ACRILICO"),
        ("TORNILLO + SEPARADOR", "4 (*)", "1 POR PUNTA (*)")]
h.tabla(370, 820, [(160, "l", False), (46, "c", True), (240, "l", False)], [("CONCEPTO", "CANT.", "CALCULO")] + rows, rowh=17,
        titulo="COMPUTO POR CAJA", colores=lambda i, j, t: OR if "(*)" in t else K)
h.rayados(370, 926, [("ANSI31", "CHAPA / COLUMNA"), ("cuH", "COBRE")], cols=2, dx=140)
h.rect(660, 942, 30, 18, ACR, K, .8); h.txt(698, 955, "ACRILICO", 10.5)
# =================================================== NOTAS
h.notas(40, 1000, [
    "COTAS EN mm. TAPA ACRILICA DE PROTECCION DE PARTES ACTIVAS EN LA CAJA DE COLUMNA EXISTENTE (LP 21478 ITEM 15.70; PLIEGO 15.64).",
    "OBLIGATORIA (ETG 16.1), CON CARTEL «RIESGO ELECTRICO»; 1 POR CAJA (CALCULADORA). SIN CODIGO: DARLA DE ALTA.",
    "CAJA A 2,50 m DEL PISO (ETG 16.1 / AP-C-005). SI LA CAJA NO SIRVE, VA LA CAJA EXTERNA 200x150x100 (AP-PL-003 / AP-CC-010).",
    "(*) PLANO OFICIAL PENDIENTE: TAMAÑO, ESPESOR Y FIJACION DEL ACRILICO, SEPARACION A LOS BORNES Y TAMAÑO DEL CARTEL.",
    "(*) LA FICHA DE NORMAS DICE «YA LO COMPUTA»: SALE 1 POR CAJA PERO SIN CODIGO (REVISION v107, PUNTO A.6).",
    "EL TABLERITO (BPN, PORTAFUSIBLES, RIEL) ES EL DEL AP-CC-014; ACA SOLO SE MUESTRA PARA UBICAR EL ACRILICO."])
# =================================================== 3D
h.titulo(890, 62, "VISTA 3D - CAJA DE COLUMNA CON EL ACRILICO", "COLUMNA EXISTENTE CORTADA POR LA VENTANA; LA TAPA SACADA AL COSTADO")
h.iso(.95, 1215, 2735)
R3 = D / 2
z0, z1 = 2300, 2750
# fondo de la columna (mitad de atrás) en gris oscuro, interior
p0, p1 = h.P(0, 0, z0), h.P(0, 0, z1); w = R3 * h._s
h.a(f'<polygon points="{p0[0]-w:.1f},{p0[1]:.1f} {p1[0]-w:.1f},{p1[1]:.1f} {p1[0]+w:.1f},{p1[1]:.1f} {p0[0]+w:.1f},{p0[1]:.1f}" fill="url(#galv)" stroke="#333" stroke-width=".8"/>')
h.a(f'<ellipse cx="{p1[0]:.1f}" cy="{p1[1]:.1f}" rx="{w:.1f}" ry="{w*.5:.1f}" fill="#3a3f45" stroke="#333" stroke-width=".8"/>')
h.a(f'<ellipse cx="{p1[0]:.1f}" cy="{p1[1]:.1f}" rx="{w*.94:.1f}" ry="{w*.47:.1f}" fill="#22272c" stroke="none"/>')
# ventana: hueco oscuro en la cara de adelante
vw, z_v0, z_v1 = 0.75, 2380, 2670
q = [h.P(0, 0, z_v0), h.P(0, 0, z_v1)]
h.a(f'<polygon points="{q[0][0]-w*vw:.1f},{q[0][1]+w*.32:.1f} {q[1][0]-w*vw:.1f},{q[1][1]+w*.32:.1f} {q[1][0]+w*vw:.1f},{q[1][1]+w*.32:.1f} {q[0][0]+w*vw:.1f},{q[0][1]+w*.32:.1f}" fill="#2b3036" stroke="#111" stroke-width="1"/>')
# tablerito adentro (chapa, riel, bornes, portafusibles)
ox, oy = q[0][0], q[0][1] + w * .32
tw, th = 54, 270
h.rect(ox - tw / 2, oy - th - 22, tw, th, "url(#galv)", "#555", .8)
h.rect(ox - 10, oy - th + 25, 20, 175, "#d7dbe0", "#555", .6)
yb = oy - th + 40
for c, hh in (("#efe9d8", 30), ("#efe9d8", 30), ("#9aa0a6", 13), ("#4fa3d9", 13), ("#3f9b48", 13)):
    h.rect(ox - 26, yb, 52, hh, c, "#333", .7); h.rect(ox - 26, yb, 6, hh, "#000", None, 0, 'opacity=".15"')
    if hh == 30: h.rect(ox - 7, yb + 6, 14, 18, "#c98b3a", "#6b4410", .5)
    yb += hh + 3
for i, c in enumerate(("#7b3f1d", "#4fa3d9", "#3f9b48")):
    h.path(f"M{ox-14+i*10},{oy-th+190} C{ox-14+i*10},{oy-30} {ox-24+i*6},{oy+10} {ox-24+i*6},{oy+40}", "none", c, 3)
# acrílico: placa transparente delante, con reflejos y cartel
ax0, ay0, aw, ah = ox - 40, oy - th + 2, 80, 230
h.a(f'<rect x="{ax0:.1f}" y="{ay0:.1f}" width="{aw}" height="{ah}" rx="4" fill="{ACR}" fill-opacity=".42" stroke="#5f9fb8" stroke-width="1.4"/>')
h.a(f'<path d="M{ax0+8:.1f},{ay0+40:.1f} l26,-30 M{ax0+8:.1f},{ay0+64:.1f} l50,-56 M{ax0+18:.1f},{ay0+200:.1f} l40,-46" stroke="#fff" stroke-width="3" opacity=".75"/>')
for (cx, cy) in ((ax0 + 7, ay0 + 7), (ax0 + aw - 7, ay0 + 7), (ax0 + 7, ay0 + ah - 7), (ax0 + aw - 7, ay0 + ah - 7)): h.circ(cx, cy, 3, "#c9ced3", "#555", .6)
tcx, tcy, ta = ox, ay0 + ah - 46, 15
h.path(f"M{tcx},{tcy-ta} L{tcx+ta*1.1},{tcy+ta*.85} H{tcx-ta*1.1} Z", "#f2c500", "#222", .9); h.path(f"M{tcx+2},{tcy-ta*.35} l-5,8 h5 l-4,8", "none", "#111", 1.4)
# tapa sacada, al costado
h.a(f'<g transform="translate(1035 200) rotate(-8)"><rect x="0" y="0" width="70" height="250" rx="10" fill="url(#galv)" stroke="#555" stroke-width="1"/><rect x="6" y="8" width="58" height="234" rx="7" fill="none" stroke="#7f8b96"/></g>')
h.txt(1010, 482, "TAPA (SACADA)", 9.5, 700, NV)
h.txt(905, 515, "TAMAÑO, ESPESOR Y FIJACION", 10, 700, OR); h.txt(905, 529, "DEL ACRILICO: S/ PLANO OFICIAL (*)", 10, 700, OR)
GXX = 1468
h.globo("5", ax0 + aw - 10, ay0 + 120, GXX, 150, NV, 12); h.txt(GXX + 18, 154, "ACRILICO TRANSPARENTE", 11, 700, NV)
h.globo("6", tcx + 6, tcy, GXX, 200, NV, 12); h.txt(GXX + 18, 204, "CARTEL RIESGO ELECTRICO", 11, 700, NV)
h.globo("8", ax0 + aw - 7, ay0 + 7, GXX, 250, NV, 12); h.txt(GXX + 18, 254, "TORNILLO + SEPARADOR (*)", 11, 700, NV)
h.globo("3", ox + 18, oy - th + 60, GXX, 300, NV, 12); h.txt(GXX + 18, 304, "PORTAFUSIBLES (AP-CC-014)", 11, 700, NV)
h.globo("4", ox + 20, oy - th + 120, GXX, 350, NV, 12); h.txt(GXX + 18, 354, "BPN GRIS · CELESTE · VERDE", 11, 700, NV)
h.globo("1", ox + tw / 2 - 4, oy - 40, GXX, 400, NV, 12); h.txt(GXX + 18, 404, "FONDO DE CHAPA + RIEL", 11, 700, NV)
h.globo("7", p0[0] + w - 6, p0[1] - 20, GXX, 450, NV, 12); h.txt(GXX + 18, 454, "COLUMNA EXISTENTE", 11, 700, NV)
# =================================================== LISTA
L = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
     ("1", "FONDO DE TABLERO PARA COLUMNA (EL QUE TENGA)", "1", "3011 / 3010 / 3009"),
     ("2", "BORDE DE LA VENTANA DE LA CAJA", "-", "-"),
     ("3", "PORTAFUSIBLE + FUSIBLE (AP-CC-014)", "S/ CALC.", "3053 / 3017"),
     ("4", "BORNES BPN 6 GRIS / CELESTE / VERDE", "S/ CALC.", "2009 / 2008 / 2010"),
     ("5", "ACRILICO DE PROTECCION DE PARTES ACTIVAS (*)", "1", "A VINCULAR"),
     ("6", "CARTEL «RIESGO ELECTRICO» SOBRE EL ACRILICO", "1", "CON EL ACRILICO"),
     ("7", "COLUMNA EXISTENTE (NO SE COMPUTA)", "-", "-"),
     ("8", "TORNILLO DE FIJACION DEL ACRILICO (*)", "4", "A VINCULAR"),
     ("9", "SEPARADOR (*)", "4", "A VINCULAR"),
     ("V", "VARIANTE: CAJA ESTANCA ALUMINIO 200x150x100 IP65", "1", "6003")]
h.tabla(890, 580, [(40, "c", False), (440, "l", False), (90, "c", True), (180, "c", False)], L, rowh=22, titulo="LISTA DE MATERIALES (1 CAJA DE COLUMNA)",
        colores=lambda i, j, t: OR if ("(*)" in t or t == "A VINCULAR") else K)
h.rotulo(890, h.H - 150, 750, "AP-T-014", "ACRILICO PARA TABLERO", "DE COLUMNA EXISTENTE", "VISTA, CORTES, FIJACION, CARTEL, VARIANTE Y 3D", "1:2", "D1 2:1, 3D S/E", fecha="07/11/2026")
h.guardar("ap_t_014.svg"); print("ok")
