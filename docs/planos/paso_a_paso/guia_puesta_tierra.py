"""Guía paso a paso «Puesta a tierra y medición» (GUIAS_OBRA id puesta_tierra · AP-TC-005/006, TC-PRFV-02).
Texto: guía de la app (v130). Medidas: fichas AP-TC-005, TC-PRFV-02, hoja ap_tc_005, CLAUDE.md §11.3."""
from k4kit import *
from k4piezas import abajo as tab_abajo, BW, BD
ID = "puesta_tierra"; TOT = 5
TIT = "PUESTA A TIERRA Y MEDICIÓN"; SUB = "Planos AP-TC-005 / AP-TC-006 y TC-PRFV-02 · ítems 74 y 81 · riesgo alto"; PL = "AP-TC-005"
def pag(n): return pagina(n, TOT, TIT, SUB, PL)
SOIL = ("url(#grass)", "url(#soil3)", "url(#soil3)")
RJ = 7.3                                          # jabalina Ø14,6
def jab3(h, x, y, z0, z1, punta=True):
    """jabalina vertical: Cu con alma de acero, cabeza en z1"""
    a = h.P(x, y, z0); b = h.P(x, y, z1); w = max(1.6, RJ * h._s * 1.1)
    poly(h, [(a[0] - w, a[1]), (b[0] - w, b[1]), (b[0] + w, b[1]), (a[0] + w, a[1])], "url(#cuV)", "#7a4512", .5)
    if punta: poly(h, [(a[0] - w, a[1]), (a[0] + w, a[1]), (a[0], a[1] + w * 3)], "url(#cuV)", "#7a4512", .5)
    h.a(f'<ellipse cx="{b[0]:.1f}" cy="{b[1]:.1f}" rx="{w:.1f}" ry="{w*.5:.1f}" fill="#f0b47a" stroke="#7a4512" stroke-width=".5"/>')
def tomacable3(h, x, y, z, s3=1.0):
    """tomacable de bronce en la cabeza de la jabalina (caja + bulón)"""
    d = 16 * s3
    h.BOX(x - d, x + d, y - d, y + d, z - 2.2 * d, z, "url(#bronceV)", "#b98a2f", "#9c7222", "#5a3a10", .6)
    h.BOX(x + d, x + d + 10 * s3, y - 6 * s3, y + 6 * s3, z - 1.4 * d, z - .6 * d, "#d9b45a", "#b98a2f", "#8d6420", "#5a3a10", .5)
def poste3(h, x, y, z0, z1, r=98.5):
    h.tuboZ(z0, z1, x, y, r, r * .93)
def rot(h, x, y, z, w=8):
    p = h.P(x, y, z); h.path(f"M{p[0]-w-3},{p[1]+2} l5,-5 l4,6 l5,-6 l4,5 l5,-4", "none", "#111", 1)
# ===================== HOJA 1
h = pag(1)
d = dict(epp="Guantes, anteojos, calzado de seguridad.", aut="La medición se hace con la instalación SIN TENSIÓN.",
         her="Maza, pinza de compresión («pico de loro»), telurímetro con sus 3 picas y cables, cinta métrica.",
         mat=[("7015", "Jabalina copperweld Ø14,6 × 1500 mm, IRAM 2309"), ("7010", "Cable verde-amarillo 1×10 mm² IRAM NM 247-3"),
              ("7019", "Tomacable WGC/TGC (a compresión, no a rosca)"), ("2029", "Puntera TIFF 10 mm² (columna PRFV)"),
              ("2045", "Terminal ojal 10 mm² (metálica nueva y tablero)")])
def donde(y):
    h.txt(40, y, "CUÁNTAS JABALINAS", 14, 800, "#28285E", "start", INT)
    h.tabla(40, y + 12, [(170, "l", False), (190, "l", False), (190, "l", False)],
            [("COLUMNAS", "JABALINAS", "CABLE 1×10 V/A"), ("PRFV", "1 por circuito (la última) + 1 tablero", "7 m por circuito + 10 m tablero"),
             ("Metálica", "1 por columna + 1 tablero", "4 m por columna + 10 m tablero")], rowh=26)
    h.txt(40, y + 112, "Cada jabalina: 1 tomacable + 1 medición (ítem 81) + puntera TIF 10. Fuente: CLAUDE.md §11.3.", 12, 500, "#4B5670", "start", INT)
antes(h, 40, d, donde)
X = W / 2 + 18
py = panel(h, X, 1, "Dónde va cada jabalina",
           ["PRFV: 1 en la última columna de cada circuito + 1 en el tablero.", "Metálica: 1 por columna + 1 en el tablero."],
           ojo="(*) Si el proyecto marca otra cosa (TN-C o TN-S), manda el proyecto: confirmalo antes de hincar.",
           control="Jabalinas marcadas en el plano de la plaza antes de empezar.")
clip_ini(h, X, py, 330, 300)
s = .036; h.iso(s, X + 60, py + 92)
h.BOX(-400, 7200, -500, 600, -1900, 0, *SOIL)
for i, xc in enumerate((600, 2100, 3600, 5100)):
    poste3(h, xc, 300, 0, 2600); rot(h, xc, 300, 2600)
    if i == 3: jab3(h, xc + 450, 600, -1800, -300)
# tablero en su apoyo
poste3(h, 6600, 300, 0, 1600, 80); rot(h, 6600, 300, 1600)
h.BOX(6450, 6750, 120, 480, 900, 1500, "#d5d9de", "#bfc5cc", "#a9b0b8", "#333", .6)
jab3(h, 6600 + 450, 600, -1800, -300)
# cable del circuito (enterrado, en la cara de corte)
a = h.P(600, 600, -700); b = h.P(6600, 600, -700); h.ln(*a, *b, "#222", 2.4, 'stroke-dasharray="6 3"')
clip_fin(h)
g(h, (5100 + 450, 600, -1200), X + 326, py + 292, "J al final del circuito", "end")
g(h, (6600, 120, 1300), X + 326, py + 150, "tablero", "end")
g(h, (2100, 300, 2000), X + 14, py + 34, "columnas PRFV del circuito")
g(h, (2600, 600, -700), X + 14, py + 250, "cable del circuito")
# plano: planta esquemática
cx0 = X + 338 + 22; cy = py + 150
h.ln(cx0, cy, cx0 + 160, cy, K, 1.2, 'stroke-dasharray="6 3"')
for i in range(4):
    xx = cx0 + 8 + i * 38; h.circ(xx, cy, 7, "#fff", K, 1.2); h.txt(xx, cy - 14, f"C{i+1}", 8.5, 700, K, "middle")
h.rect(cx0 + 162, cy - 10, 20, 20, "#fff", K, 1.3); h.txt(cx0 + 172, cy - 16, "TAB.", 8.5, 700, K, "middle")
for xx in (cx0 + 8 + 3 * 38, cx0 + 172):
    h.ln(xx, cy + 8, xx, cy + 36, K, .9); h.path(f"M{xx-6},{cy+36} h12 M{xx-4},{cy+40} h8 M{xx-2},{cy+44} h4", "none", K, 1.1)
h.txt(cx0 + 8 + 3 * 38, cy + 60, "J", 10, 700, K, "middle"); h.txt(cx0 + 172, cy + 60, "J", 10, 700, K, "middle")
h.txt(X + 338 + 106, py + 230, "PRFV: J AL FINAL DEL CIRCUITO", 9, 700, K, "middle")
h.txt(X + 338 + 106, py + 246, "+ J DEL TABLERO", 9, 700, K, "middle")
h.txt(X + 338 + 106, py + 292, "PLANTA · ESQUEMA (S/E)", 10, 700, K, "middle")
h.guardar(f"{ID}_p1.svg")
# ===================== HOJA 2: pasos 2 y 3
h = pag(2)
X = 40
py = panel(h, X, 2, "Revisá el material",
           ["Jabalina Ø14,6 × 1500 mm (IRAM 2309) y cable verde-amarillo 1×10 mm².",
            "Tomacable a compresión. No se permite el tomacable a rosca (ETG 14)."],
           ojo="Tomacable de latón o con zinc no sirve: verificá el modelo al comprar.",
           control="Jabalina derecha, sin la capa de Cu dañada; cable y tomacable correctos.")
clip_ini(h, X, py, 330, 300)
s = .17; h.iso(s, X + 50, py + 110)
h.BOX(-100, 1700, -200, 500, -40, 0, "#d9d6cf", "#c4c0b6", "#b8b3a8", "#888", .5)
# jabalina acostada a lo largo de x
a = h.P(0, 100, 15); b = h.P(1500, 100, 15); w = 2.2
poly(h, [(a[0], a[1] - w), (b[0], b[1] - w), (b[0], b[1] + w), (a[0], a[1] + w)], "url(#cuV)", "#7a4512", .5)
poly(h, [(b[0], b[1] - w), (b[0] + 9, b[1] + 4), (b[0], b[1] + w)], "url(#cuV)", "#7a4512", .5)
# rollo de cable VA
cx, cy = h.P(500, 380, 0)
for i in range(4):
    h.a(f'<ellipse cx="{cx:.1f}" cy="{cy-6-i*3:.1f}" rx="{40-i*1.5:.1f}" ry="{18-i:.1f}" fill="none" stroke="#163d1c" stroke-width="7"/>')
    h.a(f'<ellipse cx="{cx:.1f}" cy="{cy-6-i*3:.1f}" rx="{40-i*1.5:.1f}" ry="{18-i:.1f}" fill="none" stroke="#2f9e44" stroke-width="5"/>')
    h.a(f'<ellipse cx="{cx:.1f}" cy="{cy-6-i*3:.1f}" rx="{40-i*1.5:.1f}" ry="{18-i:.1f}" fill="none" stroke="#f2c200" stroke-width="2.6" stroke-dasharray="5 5"/>')
pj = h.P(750, 100, 15); pc_ = h.P(500, 380, 0)
# tomacables: bueno (compresión) y malo (rosca)
h.iso(.5, X + 250, py + 170)
tomacable3(h, 0, 0, 40, 1.0)
h.iso(.5, X + 250, py + 260)
tomacable3(h, 0, 0, 40, 1.0)
x, y = h.P(26, 0, 12); h.circ(x + 6, y, 5, "#c9ccd0", "#333", .6); h.ln(x + 2, y - 3, x + 10, y + 3, "#333", .8)
clip_fin(h)
chk(h, X + 300, py + 130); chk(h, X + 300, py + 230, False)
h.txt(X + 250, py + 202, "a compresión", 11.5, 700, "#14632b", "middle", INT)
h.txt(X + 250, py + 290, "a rosca: NO", 11.5, 700, "#b42318", "middle", INT)
g2(h, pj[0], pj[1], X + 14, py + 34, "jabalina Ø14,6 × 1500")
g2(h, pc_[0] - 40, pc_[1] - 8, X + 14, py + 290, "cable V/A 1×10 mm²")
# plano: jabalina en vista
k = .14; cx, y0 = X + 338 + 60, py + 46
h.rect(cx - 5, y0, 10, 1500 * k, "#fff", K, 1); h.path(f"M{cx-5},{y0+1500*k} L{cx},{y0+1500*k+16} L{cx+5},{y0+1500*k}", "#fff", K, 1)
h.dimV(cx - 22, y0, y0 + 1500 * k, "1500", ext=cx - 6); h.dimH(y0 - 8, cx - 5, cx + 5, ""); h.txt(cx, y0 - 14, "Ø14,6", 9.5, 400, K, "middle")
h.txt(cx + 12, y0 + 100, "COPPERWELD", 8.5, 700, K); h.txt(cx + 12, y0 + 112, "IRAM 2309", 8.5, 400, K)
h.rect(cx + 70, y0 + 20, 40, 44, "#fff", K, 1.1); h.rect(cx + 110, y0 + 34, 12, 16, "#fff", K, 1); h.circ(cx + 90, y0 + 42, 7.3 * .9, "url(#ANSI31)", K, .8)
h.txt(cx + 90, y0 + 80, "TOMACABLE", 8.5, 700, K, "middle"); h.txt(cx + 90, y0 + 92, "(*) MEDIDAS", 8.5, 700, OR, "middle")
h.txt(X + 338 + 106, py + 292, "JABALINA Y TOMACABLE", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 3, "Hincá la jabalina",
           ["Al lado de la base, hincala derecha hasta que la cabeza quede al nivel previsto.",
            "Si el terreno no deja, avisá: no cortes la jabalina."],
           ojo="(*) Profundidad de la cabeza (300 mm) y distancia a la columna (1000 mm): no están en la ficha, confirmar con el plano.",
           control="Jabalina derecha, entera, con la cabeza a la profundidad del plano.")
clip_ini(h, X, py, 330, 300)
s = .08; h.iso(s, X + 165, py + 22)
L = 1600; c = 900
h.BOX(0, c, 0, c, -1700, 0, *SOIL)
h.BOX(c, L, 0, c, -1700, 0, *SOIL)
h.BOX(0, c, c, L, -1700, 0, *SOIL)
# base de la columna (hormigón) al fondo y el poste
h.BOX(50, 650, 50, 650, 0, 12, "url(#conc3)", "url(#conc3)", "url(#conc3)", "#4a4f55", .6)
poste3(h, 350, 350, 12, 1700); rot(h, 350, 350, 1700)
jab3(h, c, c, -1500 + 150, 150)
x, y = h.P(c, c, 150)
h.ln(x, y - 4, x + 50, y - 60, "#8a5a2b", 4); h.rect(x - 18, y - 26, 34, 18, "#444", "#111", .8, f'transform="rotate(-48 {x} {y-17})"')
clip_fin(h)
g(h, (c, c, -800), X + 14, py + 290, "jabalina derecha")
g2(h, x + 30, y - 40, X + 326, py + 34, "maza", "end")
g(h, (200, 600, 12), X + 14, py + 34, "al lado de la base")
# plano: corte
k = .11; cx, top = X + 338 + 120, py + 60
h.rect(X + 338 + 14, top, 184, 220, "url(#EARTH)", K, 0); h.ln(X + 338 + 14, top, X + 338 + 198, top, K, 1.3)
h.rect(cx - 90, top - 1, 50, 900 * k, "url(#CONC)", K, 1)
h.rect(cx - 6, top, 12, 300 * k, "#fff", K, .8)
h.rect(cx - 2.5, top + 300 * k, 5, 1500 * k, "#fff", K, 1); h.path(f"M{cx-2.5},{top+1800*k} L{cx},{top+1800*k+8} L{cx+2.5},{top+1800*k}", "#fff", K, .8)
h.dimV(cx + 22, top, top + 300 * k, "300 (*)", ext=cx + 4, c=OR); h.dimV(cx + 22, top + 300 * k, top + 1800 * k, "1500", ext=cx + 4)
h.dimH(top - 12, cx - 65, cx, "1000 (*)", c=OR)
h.txt(cx - 65, top + 120, "FUND.", 8.5, 700, K, "middle")
h.txt(X + 338 + 106, py + 292, "CORTE · JABALINA HINCADA", 10, 700, K, "middle")
h.guardar(f"{ID}_p2.svg")
# ===================== HOJA 3: pasos 4 y 5
h = pag(3)
X = 40
py = panel(h, X, 4, "Conectá el cable con tomacable",
           ["Cable VA 1×10 al tomacable WGC/TGC o conector a compresión (sin zinc en la aleación).",
            "Apretá firme: el cable no tiene que girar ni salirse."],
           ojo="Nunca un tomacable a rosca: con la humedad se afloja y la PAT queda abierta.",
           control="Cable firme en el tomacable, sin juego.")
clip_ini(h, X, py, 330, 300)
s = 1.4; h.iso(s, X + 150, py + 70)
h.BOX(-80, 80, -80, 80, -160, -100, "url(#soil3)", "url(#soil3)", "url(#soil3)")
jab3(h, 0, 0, -100, 30, punta=False)
tomacable3(h, 0, 0, 22, 1.0)
va3(h, [(26, 0, 6), (70, 0, 6), (110, 30, 10), (150, 60, 20)], 13)
xe, ye = h.P(150, 60, 20)
h.circ(xe + 6, ye - 2, 9, "url(#VA)", "#163d1c", .8); h.circ(xe + 6, ye - 2, 6, CU, "#7a4512", .5)
for dx, dy in [(0, 0)] + [(3.4 * math.cos(math.radians(60 * j)), 3.4 * math.sin(math.radians(60 * j))) for j in range(6)]:
    h.circ(xe + 6 + dx, ye - 2 + dy, 1.7, "#e7a35a", "#7a4512", .3)
clip_fin(h)
g(h, (0, 0, 0), X + 14, py + 34, "tomacable de bronce")
g(h, (0, 0, -60), X + 14, py + 290, "cabeza de la jabalina")
g(h, (90, 15, 8), X + 326, py + 290, "cable VA 1×10 mm²", "end")
g2(h, xe + 6, ye - 2, X + 326, py + 34, "cuerda de hilos de Cu", "end")
# plano: D1 tomacable vista + corte
cx, cy = X + 338 + 70, py + 120
h.rect(cx - 28, cy - 30, 56, 56, "#fff", K, 1.2); h.rect(cx + 28, cy - 12, 18, 18, "#fff", K, 1)
h.rect(cx - 8, cy + 26, 16, 110, "#fff", K, 1); h.ln(cx, cy - 50, cx, cy + 150, K, .4, h.EJE)
h.path(f"M{cx-6},{cy-30} Q{cx-6},{cy-70} {cx+60},{cy-70}", "none", K, 6); h.path(f"M{cx-6},{cy-30} Q{cx-6},{cy-70} {cx+60},{cy-70}", "none", "#fff", 4)
h.txt(cx + 64, cy - 66, "1×10 V/A", 9, 700, K); h.txt(cx + 50, cy - 18, "BULÓN", 8.5, 700, K)
h.dimH(cy + 142, cx - 8, cx + 8, ""); h.txt(cx + 14, cy + 146, "Ø14,6", 9.5, 400, K, "start")
h.txt(cx - 34, cy - 4, "D1", 10, 700, K, "end")
h.txt(X + 338 + 106, py + 292, "D1 · TOMACABLE (S/E)", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 5, "Llevá el cable a su lugar",
           ["PRFV fin de circuito: puntera TIFF 10 (2029) al BPN verde del tablerito de abajo (TC-PRFV-02).",
            'Metálica nueva: por caño PVC 1", ojal 10 mm² (2045) al bulón de bronce. Tablero: ojal 10 mm² a la barra de PAT.'],
           ojo="(*) En esquema TT el PE no se une al N: confirmá el esquema antes de poner el peine PE · N.",
           control="Puntera o terminal crimpeado con la pinza, firme en su borne.")
clip_ini(h, X, py, 330, 300)
s = 1.45; cabinet(h, s, X + 120, py + 210)
pb = tab_abajo(h, 0, jab=True)
xpe = pb["N"] - BW + BW / 2
va3(h, [(xpe + 18, 30, -70), (xpe + 18, 30, 10), (xpe, 26, 28), (xpe, 24, 33)], 6)
punta_cu(h, (xpe, 24, 33), (xpe, 24, 41), 3)
for k3, L in enumerate("NRST"):
    xb = pb[L] + BW / 2
    hilo3(h, [(xb + 2, 30, -70), (xb + 2, 30, 10), (xb, 24, 34), (xb, 24, 40)], {"N": NC, "R": L1, "S": L2, "T": L3}[L], 2.4)
clip_fin(h)
g(h, (xpe, BD, 70), X + 14, py + 34, "BPN verde (PE)")
g(h, (xpe + 18, 30, -20), X + 14, py + 210, "VA 1×10 (jabalina)")
g(h, (xpe + 8, BD + 2, 66), X + 14, py + 66, "peine PE · N")
g(h, (pb["S"] + 4, 30, -40), X + 326, py + 290, "troncal", "end")
# plano: tres destinos
px = X + 346
for i, (t1, t2) in enumerate((("PRFV (FIN DE CIRC.)", "TIF 10 → BPN VERDE"), ("METÁLICA NUEVA", 'CAÑO 1" · OJAL 10 → BULÓN'), ("TABLERO", "OJAL 10 → BARRA PAT"))):
    y = py + 44 + i * 80
    h.txt(px, y, t1, 9, 700, K); h.txt(px, y + 13, t2, 8.5, 400, K)
    h.ln(px + 4, y + 50, px + 70, y + 50, K, 3); h.ln(px + 4, y + 50, px + 70, y + 50, "#fff", 1.6)
    if i == 0:
        h.rect(px + 70, y + 46, 12, 8, "url(#cuH)", K, .6); h.rect(px + 84, y + 26, 18, 44, "#fff", K, 1)
    else:
        h.circ(px + 78, y + 50, 7, "#fff", K, 1); h.circ(px + 78, y + 50, 3, "#fff", K, .6)
        if i == 1: h.rect(px + 86, y + 30, 40, 40, "#fff", K, 1); h.circ(px + 78, y + 50, 1.5, K, K, 0)
        else: h.rect(px + 86, y + 44, 90, 12, "url(#ANSI31)", K, 1)
h.txt(X + 338 + 106, py + 292, "DESTINO DEL CABLE (S/E)", 10, 700, K, "middle")
h.guardar(f"{ID}_p3.svg")
# ===================== HOJA 4: pasos 6 y 7
h = pag(4)
X = 40
py = panel(h, X, 6, "Medí antes de unir tierra y neutro",
           ["Sin tensión, desconectá el cable del electrodo y medí con telurímetro, método de las 3 picas.",
            "Picas en línea: la de corriente (C) lejos y la de potencial (P) a ~62 % de esa distancia, o lo que indique el manual."],
           ojo="Con tensión no se mide. Y con el cable conectado medís toda la red, no la jabalina.",
           control="Picas en línea recta, bien clavadas, cables sin empalmes.")
clip_ini(h, X, py, 330, 300)
s = .0205; h.iso(s, X + 26, py + 150)
Dm = 10000; r2 = 2 ** .5
def UV(u, v, z=0): return ((u + v) / r2, (v - u) / r2, z)
VV = 3200
band = [UV(-1300, -VV), UV(Dm + 1300, -VV), UV(Dm + 1300, VV), UV(-1300, VV)]
h.F3(band, "url(#grass)", "#3e5e22", .6)
h.F3([UV(-1300, VV), UV(Dm + 1300, VV), UV(Dm + 1300, VV, -1600), UV(-1300, VV, -1600)], "url(#soil3)", "#3a2a1a", .6)
h.F3([UV(Dm + 1300, -VV), UV(Dm + 1300, VV), UV(Dm + 1300, VV, -1600), UV(Dm + 1300, -VV, -1600)], "url(#soil3)", "#3a2a1a", .6)
pE, pP, pC = UV(0, 0), UV(.62 * Dm, 0), UV(Dm, 0)
jab3(h, pE[0], pE[1], -40, 300, punta=False)
for p in (pP, pC):
    a1 = h.P(*p); b1 = h.P(p[0], p[1], 1400); h.ln(*a1, *b1, "#9aa3ae", 3); h.ln(b1[0], b1[1], b1[0], b1[1] - 5, "#e11d48", 6)
pT = UV(2600, -2600)
tx, ty = h.P(*pT)
for p, col, zz in ((pE, "#2f9e44", 180), (pP, "#f2c200", 1300), (pC, "#e11d48", 1300)):
    b1 = h.P(p[0], p[1], zz); h.path(f"M{tx},{ty-8} Q{(tx+b1[0])/2},{max(ty,b1[1])+16} {b1[0]},{b1[1]}", "none", col, 1.6)
h.rect(tx - 24, ty - 34, 48, 32, "#f2c230", "#5c4300", 1, 'rx="3"'); h.rect(tx - 16, ty - 30, 32, 13, "#1d3b2a", "#000", .6); h.txt(tx, ty - 20, "Ω", 10, 800, "#7CFC00", "middle", INT)
clip_fin(h)
for p, L in ((pE, "E"), (pP, "P"), (pC, "C")):
    x, y = h.P(*p); h.txt(x, y + 26, L, 14, 800, NV, "middle", INT)
x, y = h.P(*pP); h.txt(x - 60, y + 26, "≈ 62 %", 11.5, 700, NV, "middle", INT)
g2(h, tx, ty - 34, X + 120, py + 40, "telurímetro")
x, y = h.P(pE[0], pE[1], 100); g2(h, x, y, X + 14, py + 290, "jabalina desconectada")
x, y = h.P(pC[0], pC[1], 600); g2(h, x, y, X + 326, py + 290, "picas de prueba", "end")
# plano: esquema de distancias
px, py2 = X + 338 + 24, py + 150
h.ln(px, py2, px + 168, py2, K, .5, h.EJE)
for xx, L in ((0, "E"), (104, "P"), (168, "C")):
    h.ln(px + xx, py2 - 10, px + xx, py2 + 30, K, 2); h.txt(px + xx, py2 - 16, L, 11, 700, K, "middle")
h.dimH(py2 + 50, px, px + 168, "D (según el manual) (*)", c=OR); h.dimH(py2 + 80, px, px + 104, "≈ 0,62 D")
h.txt(X + 338 + 106, py + 292, "MÉTODO DE LAS 3 PICAS", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 7, "Anotá el valor y compará",
           ["Anotá el valor de cada jabalina en la planilla.",
            "Si supera el máximo del proyecto (ETG 2022, esquema TT: ≤ 40 Ω), agregá jabalina (hasta 3) y volvé a medir."],
           ojo="(*) Valor máximo: la ETG 2014 decía 10 Ω y la ETG 2022 dice 40 Ω en TT (TN-S: ≤ 1,5 veces el promedio). Confirmar cuál pide el proyecto.",
           control="Cada jabalina con su valor en la planilla (ítem 81).")
clip_ini(h, X, py, 330, 300)
s = .4; h.iso(s, X + 190, py + 70)
h.BOX(0, 300, 0, 420, -12, 0, "#fbfbf7", "#ddd", "#ccc", "#555", .8)
h.BOX(110, 190, -10, 20, 0, 14, "#9aa3ae", "#7d858f", "#6b737c", "#333", .6)
for i in range(5):
    a = h.P(40 + i * 50, 30, 0); b = h.P(40 + i * 50, 390, 0); h.ln(*a, *b, "#9aa3ae", .8)
rows = (("C4", "12,4 Ω", True), ("C9", "18,0 Ω", True), ("TAB.", "47,5 Ω", False))
for i, (n_, v, ok) in enumerate(rows):
    a = h.P(65 + i * 50, 330, 0); h.txt(a[0], a[1], n_, 9.5, 700, "#0D1424", "middle", INT)
    a = h.P(65 + i * 50, 150, 0); h.txt(a[0], a[1], v, 9.5, 800, "#14632b" if ok else "#b42318", "middle", INT)
pl = h.P(150, 420, -12)
h.iso(.42, X + 250, py + 170)
h.BOX(0, 160, 0, 120, 0, 80, "#f2c230", "#d9a91a", "#c2950f", "#5c4300", .8)
poly(h, [h.P(25, 120, 66), h.P(135, 120, 66), h.P(135, 120, 28), h.P(25, 120, 28)], "#1d3b2a", "#000", .6)
c_ = h.P(80, 120, 47); h.txt(c_[0] - 1, c_[1] + 3, "12,4Ω", 7.5, 800, "#7CFC00", "middle", INT)
pt_ = h.P(80, 60, 80)
clip_fin(h)
g2(h, pl[0], pl[1], X + 14, py + 290, "planilla de PAT")
g2(h, pt_[0], pt_[1], X + 326, py + 34, "telurímetro", "end")
# plano: planilla
h.tabla(X + 346, py + 50, [(78, "l", False), (62, "c", True), (56, "c", False)],
        [("JABALINA", "VALOR", "≤ 40 Ω"), ("Col. 4", "12,4 Ω", "SÍ"), ("Col. 9", "18,0 Ω", "SÍ"), ("Tablero", "47,5 Ω", "NO")], rowh=24,
        colores=lambda i, j, t: ("#b42318" if t == "NO" else K))
h.txt(X + 346, py + 172, "47,5 Ω > máximo:", 9.5, 700, K); h.txt(X + 346, py + 186, "agregá jabalina (hasta 3)", 9.5, 400, K)
h.txt(X + 346, py + 200, "y volvé a medir.", 9.5, 400, K)
h.txt(X + 346, py + 230, "Valores de ejemplo.", 9, 400, G)
h.txt(X + 338 + 106, py + 292, "PLANILLA DE PAT (ÍTEM 81)", 10, 700, K, "middle")
h.guardar(f"{ID}_p4.svg")
# ===================== HOJA 5: paso 8 + así queda
h = pag(5)
X = 40
py = panel(h, X, 8, "Reconectá y cerrá",
           ["Volvé a conectar el cable al electrodo y verificá el apriete.", "Sacá la foto de la conexión antes de tapar."],
           ojo="Si tapás sin reconectar, la columna queda sin tierra.",
           control="Jabalina firme, conexión a compresión sin juego, valor anotado. Foto: «Puesta a tierra» con su N°.")
clip_ini(h, X, py, 330, 300)
s = .13; h.iso(s, X + 165, py + 70)
L = 1200
h.BOX(0, L, 0, 400, -1100, 0, *SOIL); h.BOX(0, 400, 400, L, -1100, 0, *SOIL)
h.BOX(400, L, 400, L, -1100, -300, "url(#soil3)", "url(#soil3)", "url(#soil3)")
jab3(h, 800, 800, -1100, -230, punta=False)
tomacable3(h, 800, 800, -250, 2.0)
va3(h, [(830, 800, -290), (830, 430, -290), (830, 410, -60), (830, 300, 0), (830, 0, 0)], 5)
clip_fin(h)
# cámara
cx, cy = X + 290, py + 60
h.rect(cx - 22, cy - 14, 44, 30, "#28285E", "#28285E", 0, 'rx="5"'); h.circ(cx, cy + 1, 9, "#fff", "#fff", 0); h.circ(cx, cy + 1, 5.5, "#28285E", "#28285E", 0); h.rect(cx - 8, cy - 19, 14, 6, "#28285E", "#28285E", 0)
h.txt(cx, cy + 34, "foto antes", 11, 800, "#28285E", "middle", INT); h.txt(cx, cy + 48, "de tapar", 11, 800, "#28285E", "middle", INT)
g(h, (800, 800, -260), X + 14, py + 34, "tomacable apretado")
g(h, (830, 600, -290), X + 326, py + 290, "cable a la columna", "end")
g(h, (800, 800, -700), X + 14, py + 290, "jabalina")
chk(h, X + 300, py + 150); h.txt(X + 284, py + 155, "firme", 12, 800, "#14632b", "end", INT)
# plano: corte final
k = .14; cx, top = X + 338 + 120, py + 80
h.rect(X + 338 + 14, top, 184, 190, "url(#EARTH)", K, 0); h.ln(X + 338 + 14, top, X + 338 + 198, top, K, 1.3)
h.rect(cx - 8, top, 16, 300 * k + 2, "#fff", K, .8)
h.rect(cx - 2.5, top + 300 * k - 10, 5, 1500 * k * .65, "#fff", K, 1)
h.rect(cx - 6, top + 300 * k - 14, 12, 12, "url(#ANSI31)", K, .8)
h.path(f"M{cx-6},{top+300*k-8} H{cx-70} V{top-30}", "none", K, 2.4)
h.txt(cx - 74, top - 34, "A LA COLUMNA", 8.5, 700, K, "start")
h.dimV(cx + 40, top, top + 300 * k, "300 (*)", ext=cx + 8, c=OR)
h.rect(cx + 8, top + 300 * k + 22, 60, 14, "#fff", "none", 0); h.txt(cx + 10, top + 300 * k + 33, "JABALINA", 8.5, 700, K)
h.txt(X + 338 + 106, py + 292, "CORTE · CONEXIÓN TERMINADA", 10, 700, K, "middle")
X = W / 2 + 18
asi_queda(h, X, "k4_pat_3d.png", "AP-TC-005 / TC-PRFV-02", "Acometida aérea: de la línea de EPEC al tablero",
          "Jabalina firme, conexión a compresión sin juego, valor medido anotado y dentro del máximo del proyecto. Foto: «Puesta a tierra» con su N°.",
          ["Valor máximo: ETG 2014 10 Ω vs. ETG 2022 40 Ω en TT. Confirmar con el proyecto."], alto=330)
h.txt(X, 150 + 330 - 2, "", 1)
h.guardar(f"{ID}_p5.svg")
print("ok")
