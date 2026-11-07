import math, sys
sys.path.insert(0, ".")
from _barrio import *

h = nueva()
banner(h, "PLANO OFICIAL PENDIENTE - DIBUJADO CON LA FICHA DE NORMAS Y COMO REFERENCIA EL AP-TC-002. LO NARANJA CON (*) ES A CONFIRMAR")

# ======================= CORTE B-B (a lo largo del cruce) · S/E
h.titulo(40, 74, "CORTE B-B (A LO LARGO DEL CRUCE)", "S/E - EL CAÑO YA ESTA BAJO LA CALZADA: NO SE ROMPE")
y0 = 170
xv1, xc1, xc2, xv2 = 50, 250, 640, 840
h.rect(xv1, y0, xv2 - xv1, 190, "url(#EARTH)", K, 0)
h.rect(xc1, y0 - 2, xc2 - xc1, 18, "url(#CONC)", K, .8)            # pavimento
h.rect(xv1, y0 - 6, xc1 - xv1, 6, "url(#CONCP)", K, .6); h.rect(xc2, y0 - 6, xv2 - xc2, 6, "url(#CONCP)", K, .6)
h.rect(xc1 - 8, y0 - 10, 8, 26, "#fff", K, .9); h.rect(xc2, y0 - 10, 8, 26, "#fff", K, .9)   # cordones
mx = (xc1 + xc2) / 2; h.path(f"M{mx-6},{y0-22} l6,10 l-6,8 l6,10", "none", K, .8)
h.txt(xv1 + 6, y0 - 16, "VEREDA", 10.5, 700); h.txt(mx + 14, y0 - 16, "CALZADA (ANCHO VARIABLE)", 10.5, 700); h.txt(xv2 - 6, y0 - 16, "VEREDA", 10.5, 700, K, "end")
# cámaras / bocas en vereda
cams = (xc1 - 100, xc2 + 60)
for xx in cams:
    h.rect(xx, y0 - 6, 40, 100, "#fff", K, 1.4); h.rect(xx - 3, y0 - 8, 46, 4, "#fff", K, .8)
yv, yc = y0 + 80, y0 + 140
for off, w in ((0, 2.2), (9, 1.2)):
    h.path(f"M{cams[0]+40},{yv+off} L{xc1+30},{yc+off} L{xc2-30},{yc+off} L{cams[1]},{yv+off}", "none", K, w)
# cable (izq.) y cordón guía (der.)
h.path(f"M{cams[0]+20},{y0} L{cams[0]+20},{yv+4} L{cams[0]+40},{yv+4} L{xc1+30},{yc+4} L{mx},{yc+4}", "none", K, 1.6, h.OCULTA)
h.path(f"M{mx},{yc+4} L{xc2-30},{yc+4} L{cams[1]},{yv+4} L{cams[1]+20},{yv+4} L{cams[1]+20},{y0-30}", "none", K, .8, 'stroke-dasharray="2 2"')
h.path(f"M{cams[1]+20},{y0-30} l-5,9 h10 z", K, K, .6)
h.txt(cams[1] + 32, y0 - 32, "TIRO", 10, 700)
h.circ(mx, yc + 4, 4, "#fff", K, 1); blanco(h, mx + 60, yc - 8, 110); h.txt(mx + 60, yc - 8, "UNION CABLE-CORDON", 9.5, 400, G, "middle")
h.dimV(cams[0] - 16, y0, yv, "500 (*)", c=OR); h.dimV(xc1 + 60, y0 + 16, yc, "1.000 (*)", ext=xc1 + 40, c=OR)
h.dimH(y0 + 206, cams[0], cams[1] + 40, "L = LARGO DEL CRUCE, DE BOCA A BOCA = LO QUE SE PAGA (ITEM 5.02, POR METRO)", ext=y0 + 100, dy=-5)
h.txt(cams[0] + 20, y0 + 116, "BOCA (*)", 9.5, 400, OR, "middle"); h.txt(cams[1] + 20, y0 + 116, "BOCA (*)", 9.5, 400, OR, "middle")
for xa in (mx - 70,):
    h.ln(xa, yc - 30, xa, yc + 30, K, .5, 'stroke-dasharray="10 3 2 3"'); h.ln(xa - 6, yc - 30, xa + 6, yc - 30, K, 1.6); h.ln(xa - 6, yc + 30, xa + 6, yc + 30, K, 1.6)
    h.txt(xa - 10, yc - 24, "A", 12, 700, K, "end"); h.txt(xa - 10, yc + 36, "A", 12, 700, K, "end")
h.globo("1", xc2 - 80, yc, xc2 - 60, yc + 36); h.globo("2", cams[0] + 20, y0 + 40, cams[0] + 80, y0 + 40)
h.globo("3", cams[1] + 20, y0 + 50, cams[1] + 70, y0 + 60); h.globo("5", cams[0] + 40, y0 - 4, cams[0] + 70, y0 - 50)
h.globo("4", cams[0] + 38, yv + 4, cams[0] + 80, yv + 40)

# ======================= CORTE A-A (bajo la calzada) · S/E
h.titulo(40, 420, "CORTE A-A", "S/E - POR EL CAÑO EXISTENTE")
ax, ay = 150, 560
h.rect(50, 470, 220, 18, "url(#CONC)", K, .8); h.rect(50, 488, 220, 150, "url(#EARTH)", K, 0); h.ln(50, 470, 270, 470, K, 1.4)
h.cano(ax, ay, 40, 36, "#fff")
h.cable(ax - 6, ay + 12, 15, False, False, 4)
h.circ(ax + 22, ay + 22, 3.2, "#fff", K, .8)
h.dimV(290, 470, ay, "1.000 (*)", ext=ax + 40, c=OR)
blanco(h, ax, ay + 72, 96)
h.dimH(ay + 60, ax - 40, ax + 40, "Ø EXISTENTE (*)", ext=ay + 4, c=OR, dy=12)
h.globo("1", ax - 30, ay - 25, 70, 452 + 60 - 40); h.globo("2", ax - 6, ay + 12, 230, 520); h.globo("3", ax + 22, ay + 22, 230, 600)

# ======================= D1 · BOCA DEL CAÑO EN LA CÁMARA · S/E
h.titulo(330, 420, "D1 - BOCA EN LA CAMARA", "S/E - SE SELLA AL TERMINAR")
cx0, cy0 = 360, 482
h.rect(cx0, cy0, 160, 180, "url(#EARTH)", K, 0)
h.rect(cx0 + 20, cy0, 100, 160, "#fff", K, 1.4)
h.rect(cx0 + 15, cy0 - 4, 110, 6, "#fff", K, .9)
h.rect(cx0 + 120, cy0 + 100, 40, 36, "url(#ANSI31)", K, 1); h.rect(cx0 + 120, cy0 + 104, 40, 28, "#fff", K, .6)
h.rect(cx0 + 112, cy0 + 104, 10, 28, "url(#FOAM)", K, .8)
h.path(f"M{cx0+160},{cy0+118} L{cx0+70},{cy0+118} Q{cx0+50},{cy0+118} {cx0+50},{cy0+98} L{cx0+50},{cy0-20}", "none", K, 2.4)
h.path(f"M{cx0+160},{cy0+118} L{cx0+70},{cy0+118} Q{cx0+50},{cy0+118} {cx0+50},{cy0+98} L{cx0+50},{cy0-20}", "none", "#fff", 1)
h.txt(cx0 + 170, cy0 + 112, "CAÑO", 9.5, 400, G); h.txt(cx0 + 170, cy0 + 124, "EXISTENTE", 9.5, 400, G)
h.txt(cx0 + 58, cy0 - 12, "A LA ZANJA (AP-TC-001)", 9.5, 400, G)
h.dimH(cy0 + 176, cx0 + 20, cx0 + 120, "400 (*)", c=OR, dy=12)
h.globo("4", cx0 + 117, cy0 + 110, cx0 + 140, cy0 + 70, r=9); h.globo("5", cx0 + 100, cy0 + 2, cx0 + 140, cy0 + 34, r=9)

# ======================= RAYADOS
h.rayados(600, 420, [("CONC", "PAVIMENTO"), ("EARTH", "TERRENO"), ("ANSI31", "PARED DEL CAÑO"), ("FOAM", "MASILLA / ESPUMA")], cols=1, dx=150)

# ======================= PASOS
h.titulo(40, 690, "COMO SE HACE (GUIA DE LA FICHA)", "SIN ROMPER LA CALZADA")
pasos = [("1. SONDEAR", "sonda / cinta pasacable"), ("2. LIMPIAR", "sacar tierra y agua"), ("3. CORDON GUIA", "queda pasado de boca a boca"),
         ("4. TIRAR EL CABLE", "atado al cordon (*)"), ("5. SELLAR BOCAS", "masilla o espuma (*)")]
for i, (t_, s_) in enumerate(pasos):
    x = 40 + i * 162; y = 724
    h.rect(x, y, 152, 92, "#fff", K, .8)
    h.txt(x + 8, y + 16, t_, 10.5, 700); h.txt(x + 8, y + 30, s_, 9.5, 400, OR if "(*)" in s_ else G)
    yy = y + 64
    h.rect(x + 14, yy - 10, 124, 20, "url(#ANSI31)", K, .8); h.rect(x + 14, yy - 7, 124, 14, "#fff", K, .5)
    if i == 0:
        h.ln(x + 4, yy, x + 96, yy, K, 1.2); h.path(f"M{x+96},{yy-4} l8,4 l-8,4 z", K, K, .5)
    if i == 1:
        for j in range(5): h.circ(x + 60 + j * 14, yy + 3, 2.2, "#fff", K, .6)
        h.ln(x + 4, yy, x + 50, yy, K, 1.2); h.path(f"M{x+50},{yy-6} h6 v12 h-6 z", "url(#ANSI37)", K, .6)
    if i == 2:
        h.ln(x + 4, yy, x + 148, yy, K, .8, 'stroke-dasharray="2 2"')
    if i == 3:
        h.ln(x + 4, yy + 1, x + 80, yy + 1, K, 3); h.ln(x + 80, yy + 1, x + 148, yy + 1, K, .8, 'stroke-dasharray="2 2"'); h.circ(x + 80, yy + 1, 3.5, "#fff", K, .9)
        h.path(f"M{x+140},{yy-5} l8,6 l-8,6", "none", K, 1)
    if i == 4:
        h.ln(x + 4, yy, x + 148, yy, K, 3)
        for xx in (x + 14, x + 132): h.rect(xx, yy - 7, 6, 14, "url(#FOAM)", K, .6)

# ======================= CÓMPUTO
h.tabla(40, 852, [(170, "l", False), (110, "c", True), (300, "l", False)],
        [("POR CRUCE", "CANT.", "CALCULO"),
         ("CRUCE (ITEM 5.02)", "L m", "L = largo del caño de boca a boca"),
         ("CABLE", "L + colas (*)", "segun proyecto: hasta las camaras y la zanja"),
         ("CORDON GUIA Ø10", "L m (*)", "si queda pasado para la proxima vez"),
         ("MASILLA / ESPUMA", "2 u (*)", "una por boca"),
         ("CAMARAS 40×40", "0 a 2 (*)", "solo si no hay boca a la vista")],
        rowh=19, titulo="COMPUTO POR CRUCE (NO ESTA EN LA CALCULADORA)",
        colores=lambda i, j, t: OR if "(*)" in t else K)
h.notas(40, 1000, [
    "TENDIDO POR UN CAÑO DE CRUCE QUE YA EXISTE BAJO LA CALZADA: SE SONDEA, SE LIMPIA Y SE PASA EL CABLE CON CORDON GUIA.",
    "SE PAGA POR METRO (LP 21478 ITEM 5.02). POR AHORA LA CALCULADORA NO LO COMPUTA: QUEDA COMO REFERENCIA.",
    "SI EL CAÑO ESTA ROTO, APLASTADO O NO SE DESTAPA: CRUCE NUEVO AP-TC-002 (A CIELO ABIERTO) O AP-TC-022 (TUNELERA).",
    "(*) SIN PLANO: Ø Y PROFUNDIDAD DEL CAÑO EXISTENTE; 1.000 / 500 Y CAMARA 40×40 SON LOS DEL AP-TC-002, SOLO REFERENCIA.",
    "(*) A CONFIRMAR: SI SE DEJA CORDON GUIA, SI SE SELLAN LAS BOCAS Y CON QUE, SI HACE FALTA CAMARA NUEVA EN CADA PUNTA.",
    "(*) COMO SE ATA EL CABLE AL CORDON (MANGA DE TIRO O ATADURA) Y LAS COLAS DE CABLE EN CADA PUNTA."])

# ======================= 3D
h.titulo(880, 74, "VISTA 3D EN CORTE - CRUCE CON CAÑO EXISTENTE", "LA CALLE CORTADA POR EL EJE DEL CAÑO; LAS CAPAS EN ESCALONES SOBRE LA CARA DEL CORTE")
h.iso(.075, 930, 196)
Lv, Lc = 1600, 4400
X0, X1, X2, X3 = 0, Lv, Lv + Lc, 2 * Lv + Lc
YB, YC = -1500, 350
zc = -1000
# terreno hasta el corte (y = YC)
h.BOX(X0, X3, YB, YC, -1600, -350, "url(#soil3)", "url(#soil3)", "url(#soil3)")
# caño existente sobre la cara del corte
tubo(h, (X0 + 300, YC, -450), (X1 + 200, YC, zc), 55, "url(#pvc)", "#666")
tubo(h, (X1 + 200, YC, zc), (X2 - 200, YC, zc), 55, "url(#pvc)", "#666")
tubo(h, (X2 - 200, YC, zc), (X3 - 300, YC, -450), 55, "url(#pvc)", "#666")
cuerda(h, [(X0 + 300, YC + 10, 250), (X0 + 300, YC + 10, -450), (X1 + 200, YC + 10, zc), (X1 + 2800, YC + 10, zc)], 24, "#1c1c1c")
cuerda(h, [(X1 + 2800, YC + 10, zc), (X2 - 200, YC + 10, zc), (X3 - 300, YC + 10, -450), (X3 - 300, YC + 10, 350)], 7, "#e6cf8a", "#7a5a1a", .4)
# capas de la calle, escalonadas hacia atrás
h.BOX(X1, X2, YB, YC - 120, -350, -150, "url(#concP3)", "url(#concP3)", "url(#concP3)")
h.BOX(X1, X2, YB, YC - 260, -150, 0, "url(#asph3)", "url(#asph3)", "#3a3a3a")
for xa, xb in ((X0, X1), (X2, X3)):
    h.BOX(xa, xb, YB, YC - 120, -350, -100, "#d9c29a", "#cbb183", "#c2a678")
    h.BOX(xa, xb, YB, YC - 260, -100, 0, "url(#vereda3)", "#bdb5a4", "#a79f8e")
for xx in (X1 - 150, X2):
    h.BOX(xx, xx + 150, YB, YC - 260, -300, 60, "#cfd2d4", "#b6babd", "#a6aaad", "#555", .6)
# cámaras cortadas al medio (en cada boca)
for xc_ in (X0 + 300, X3 - 300):
    h.BOX(xc_ - 260, xc_ + 260, YC - 260, YC, -650, 30, "#e2e5e8", "#9aa3ab", "#c9ced3", "#555", .7)
    h.BOX(xc_ - 200, xc_ + 200, YC - 200, YC, -600, 30, "#3b3f44", "#2b2f33", "#2b2f33", "#222", .5)
cuerda(h, [(X0 + 300, YC + 10, 250), (X0 + 300, YC + 10, -450)], 24, "#1c1c1c")
cuerda(h, [(X3 - 300, YC + 10, -450), (X3 - 300, YC + 10, 350)], 7, "#e6cf8a", "#7a5a1a", .4)
GX = 1460
h.g3("6", (X1 + 1500, YB + 600, 0), GX, 150, "CALZADA: NO SE ROMPE")
h.g3("5", (X3 - 300, YC - 230, 30), GX, 200, "BOCA / CAMARA (*)")
h.g3("3", (X3 - 300, YC + 10, 200), GX, 250, "CORDON GUIA")
h.g3("1", (X1 + 2400, YC, zc + 55), 1300, 590, "CAÑO EXISTENTE")
h.g3("2", (X1 + 900, YC, zc + 20), 1090, 590, "CABLE")
h.g3("4", (X3 - 300, YC, -450), GX, 300, "MASILLA (*)")
h.txt(880, 640, "El cable entra por la boca de la izquierda; el cordon guia lo tira desde la boca de la derecha.", 11, 400, G, "start", INT)

# ======================= LISTA
filas = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "CAÑO DE CRUCE EXISTENTE BAJO LA CALZADA (NO SE COMPRA)", "-", "EXISTENTE"),
         ("2", "CABLE SUBTERRANEO SEGUN PROYECTO", "L + COLAS", "SEGUN CALCULO"),
         ("3", "CORDON GUIA DE NYLON Ø10 (*)", "L m", "5014"),
         ("4", "MASILLA / ESPUMA DE OBTURACION PARA BOCA DE CONDUCTO (*)", "2 u", "5017"),
         ("5", "CAMARA DE PASO PVC 40 × 40 (SOLO SI NO HAY BOCA) (*)", "0 a 2 u", "5003"),
         ("6", "CALZADA EXISTENTE: NO SE ROMPE NI SE REPONE", "-", "-"),
         ("7", "ITEM 5.02: CRUCE CON CAÑO EXISTENTE, POR METRO", "L m", "ITEM 5.02")]
h.tabla(880, 676, [(38, "c", False), (468, "l", False), (104, "c", True), (150, "c", False)], filas, rowh=24,
        titulo="LISTA DE MATERIALES (1 CRUCE DE L METROS)", colores=lambda i, j, t: OR if "(*)" in t else K)
h.rotulo(880, h.H - 150, 760, "AP-TC-021", "CRUCE DE CALZADA", "CON CAÑO EXISTENTE", "SONDEO, LIMPIEZA Y CORDON GUIA - SIN ROMPER", "S/E", "REF. AP-TC-002", fecha="07/11/2026", proyecto="ALUMBRADO DE BARRIOS")
h.guardar("ap_tc_021.svg"); print("ok")
