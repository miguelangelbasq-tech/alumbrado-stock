"""Guía paso a paso «Montaje de columna PRFV y luminaria» (GUIAS_OBRA id montaje_prfv · planos AP-C-033-A/B y AP-TC-003-A).
Texto: guía de la app (v130). Medidas: fichas AP-C-033-A/B, AP-TC-003-A, hoja ap_c_033a, CLAUDE.md §11.3."""
from k4kit import *
ID = "montaje_prfv"; TOT = 4
TIT = "MONTAJE DE COLUMNA PRFV Y LUMINARIA"; SUB = "Planos AP-C-033-A (7 m) / AP-C-033-B (10 m) y AP-TC-003-A · columna 7 m (10 m entre paréntesis) · riesgo alto"
PL = "AP-C-033-A"
def pag(n): return pagina(n, TOT, TIT, SUB, PL)
# ---- geometría (mm) de la fundación AP-TC-003-A (7 m)
L = 1200; A0, A1 = 300, 900; c0 = 600; PZ = 1200; PT = 1500; R = 124; ZH = -1000
RB, RT = 98.5, 61.0                       # radios del poste: Ø197 en la base, Ø122 a 8,00 m
def rcol(z, zb): return RB - (z - zb) * (RB - RT) / 8000
SOIL = ("url(#grass)", "url(#soil3)", "url(#soil3)"); S3 = ("url(#soil3)",) * 3; C3 = ("url(#conc3)",) * 3; A3 = ("url(#sand3)",) * 3
def fund(h, ox, oy, s, arena=False, sello=False, cable=False):
    h.iso(s, ox, oy)
    h.BOX(0, L, 0, A0, -PT, 0, *SOIL); h.BOX(0, A0, A0, L, -PT, 0, *SOIL)
    h.BOX(A0, A1, A0, c0, -PT, -PZ, *S3); h.BOX(A0, c0, c0, A1, -PT, -PZ, *S3)
    st = "#4a4f55"
    for b in [(A0, c0 - R, A0, c0), (c0 - R, c0, A0, c0 - R), (c0, c0 + R, A0, c0 - R)]:
        h.BOX(*b, -PZ, 0, *C3, st, .6)
    h.BOX(c0 - R, c0 + R, c0 - R, c0, -PZ, ZH, *C3, st, .6)
    h.BOX(c0 - R, c0, c0, c0 + R, -PZ, ZH, *C3, st, .6)
    h.BOX(c0 + R, A1, A0, c0 - 75, -PZ, 0, *C3, st, .6)
    h.BOX(c0 + R, A1, c0 - 75, c0, -PZ, -650, *C3, st, .6)
    h.BOX(A0, c0 - R, c0, A1, -PZ, 0, *C3, st, .6); h.BOX(c0 - R, c0, c0 + R, A1, -PZ, 0, *C3, st, .6)
    if arena:
        zt = -50
        h.BOX(c0 - R, c0 + R, c0 - R, c0, ZH, zt, *A3, "#8a6d2a", .5); h.BOX(c0 - R, c0, c0, c0 + R, ZH, zt, *A3, "#8a6d2a", .5)
    if sello:
        h.BOX(c0 - R, c0 + R, c0 - R, c0, -50, 8, "#9aa0a6", "#8d9399", "#8d9399", "#333", .6)
        h.BOX(c0 - R, c0, c0, c0 + R, -50, 8, "#9aa0a6", "#8d9399", "#8d9399", "#333", .6)
def frente_atras(h, zanja=False):
    if zanja:
        h.BOX(A1, L, A0, c0 - 100, -PT, 0, *SOIL); h.BOX(A1, L, c0 - 100, c0, -PT, -750, *S3)
    else:
        h.BOX(A1, L, A0, c0, -PT, 0, *SOIL)
def frente_adelante(h): h.BOX(A0, c0, A1, L, -PT, 0, *SOIL)
def frente(h, zanja=False):
    frente_atras(h, zanja); frente_adelante(h)
def hueco(h):
    pts = [h.P(*p) for p in h.circZ(1, c0, c0, R - 2)]
    poly(h, pts, "#3b3b3b", "#222", .8)
def columna(h, zb, ztop, dx=0, dy=0):
    h.tuboZ(zb, ztop, c0 + dx, c0 + dy, rcol(zb, zb), rcol(ztop, zb))
def rotura(h, z, dx=0, dy=0):
    x, y = h.P(c0 + dx, c0 + dy, z); w = 9
    h.path(f"M{x-w-3},{y+2} l5,-5 l4,6 l5,-6 l4,5 l5,-4", "none", "#111", 1)
# ---- plano: corte del pozo con el poste, k=.18
def plano_corte(h, X, py, poste=True, arena=False, sello=False, cable=False, zb=ZH, titulo=""):
    k = .16; cx = X + 338 + 100; top = py + 70; w = 600 * k; d = PZ * k; hr = 123.5 * k; rb = 98.5 * k
    h.rect(cx - w / 2 - 26, top, 26, d + 10, "url(#EARTH)", K, 0); h.rect(cx + w / 2, top, 26, d + 10, "url(#EARTH)", K, 0)
    h.rect(cx - w / 2 - 26, top + d, w + 52, 10, "url(#EARTH)", K, 0)
    h.rect(cx - w / 2, top, w, d, "url(#CONC)", K, 1.2)
    h.rect(cx - hr, top, 2 * hr, 1000 * k, "#fff", K, 1)
    h.rect(cx + hr, top, w / 2 - hr, 650 * k, "#fff", K, .8)
    h.rect(cx - 2, top + 1000 * k, 4, 200 * k, "#fff", K, .6)
    if arena: h.rect(cx - hr, top + 50 * k, 2 * hr, 950 * k, "url(#SAND)", K, .6)
    if sello: h.rect(cx - hr, top, 2 * hr, 50 * k, "url(#ANSI37)", K, .7)
    if poste:
        zt = top - (zb - ZH) * k
        yb = top + (-zb) * k
        h.path(f"M{cx-rb},{yb} V{py+40} M{cx+rb},{yb} V{py+40}", "none", K, 1.6)
        h.rect(cx - rb, py + 40, 2 * rb, yb - py - 40, "#fff", "none", 0)
        h.path(f"M{cx-rb},{yb} V{py+40} M{cx+rb},{yb} V{py+40} M{cx-rb},{yb} H{cx+rb}", "none", K, 1.6)
        h.path(f"M{cx-rb-4},{py+44} l6,-6 l6,6 l6,-6 M{cx+rb-14},{py+44} l6,-6 l6,6 l6,-6", "none", K, .7)
        h.ln(cx, py + 34, cx, yb + 8, K, .5, h.EJE)
    if cable:
        yc = top + 650 * k
        h.path(f"M{cx+w/2+26},{yc+6} H{cx+hr+2} Q{cx+rb+2},{yc+6} {cx+rb},{yc}", "none", K, 2.6)
        h.txt(cx + rb + 4, yc - 4, "C", 10, 700, K)
    h.nivel(cx + w / 2 + 14, top, "±0")
    h.txt(cx - 4, py + 292, titulo, 10, 700, K, "middle")
    return cx, top, w, d, k, hr, rb
# ===================== HOJA 1: antes + paso 1
h = pag(1)
d = dict(epp="Casco, guantes, calzado, chaleco reflectivo.", aut="Zona de izado vallada; nadie debajo de la carga.",
         her="Hidrogrúa con eslinga, nivel, arena fina seca, pisón, elastómero de sellado.",
         mat=[("6008/6007", "Columna PRFV 7 m (LT 8,00 m) / 10 m (LT 11,10 m), IRAM 13901, RAL 7043"),
              ("6019…6021", "Vínculo capuchón con brazo de 400 mm (1, 2 o 3 artefactos)"),
              ("6010", "Luminaria LED, probada en el galpón"),
              ("A VINC.", 'Prensacable 3/4" — uno por luminaria'),
              ("4019+4038", "Bulón pasante antivandálico con tuerca y arandela"),
              ("8003", "Arena fina seca (relleno del hueco)"), ("8009", "Elastómero de sellado")])
def medidas(y):
    h.txt(40, y, "MEDIDAS DEL POSTE", 14, 800, "#28285E", "start", INT)
    h.tabla(40, y + 12, [(150, "c", False), (130, "c", True), (130, "c", True), (140, "c", True)],
            [("POSTE", "LARGO TOTAL", "EMPOTRADO", "Ø BASE"), ("7 m", "8,00 m", "1,00 m", "197 mm"), ("10 m", "11,10 m", "1,10 m", "353 mm")], rowh=24)
antes(h, 40, d, medidas)
X = W / 2 + 18
py = panel(h, X, 1, "Revisá la fundación",
           ["Hormigón con 72 h de fragüe como mínimo.", "Hueco limpio y seco, drenaje libre.",
            "Hueco: Ø247 y 1,00 m de hondo (7 m); canal del telgopor abierto hasta la zanja."],
           ojo="Antes de las 72 h no se monta: el hormigón todavía no aguanta.",
           control="Hueco limpio y seco, desagüe destapado, canal abierto.")
clip_ini(h, X, py, 330, 300)
fund(h, X + 165, py + 30, .1); hueco(h); frente(h)
clip_fin(h)
reloj(h, X + 40, py + 44)
g(h, (c0, c0, 0), X + 326, py + 30, "hueco Ø247 limpio y seco", "end")
g(h, (c0 + 260, c0 - 40, -650), X + 230, py + 290, "canal del cable", "start")
g(h, (c0 - 60, c0, -1000), X + 14, py + 292, "fondo con desagüe libre")
cx, top, w, dd, k, hr, rb = plano_corte(h, X, py, poste=False, titulo="CORTE · HUECO LISTO")
h.dimH(top - 8, cx - hr, cx + hr, "Ø247"); h.dimV(cx - w / 2 - 40, top, top + 1000 * k, "1000", ext=cx - w / 2 - 28)
h.dimV(cx + w / 2 + 40, top + 650 * k, top + 1000 * k, "350", ext=cx + hr + 2)
h.txt(cx + hr + 2, top + 300 * k, "CANAL", 7.5, 700, K)
h.txt(cx - 6, top + 1100 * k + 4, "DESAGÜE", 8.5, 700, K, "end")
h.guardar(f"{ID}_p1.svg")
# ===================== HOJA 2: pasos 2 y 3
h = pag(2)
X = 40
py = panel(h, X, 2, "Prepará la columna en el piso",
           ["Luminaria probada en el galpón, vínculo/acople colocado en el buje (Ø90/76: sale 468 mm).",
            'Perforá antes de pasar el cable: prensacable 3/4" por luminaria y bulón pasante.',
            "Columna sobre tacos de madera, nunca arrastrada."],
           ojo="(*) Sujeción de la luminaria: prisioneros inox (ETG) o bulón pasante + soldadura (proyecto). Confirmar.",
           control="Luminaria firme y orientada, perforaciones hechas, 3 × 1,5 pasado.")
clip_ini(h, X, py, 330, 300)
s = .08; h.iso(s, X + 22, py + 92)
h.BOX(-200, 3900, -700, 900, -60, 0, "url(#grass)", "#6f9a47", "#6f9a47", "#3e5e22", .6)
for xt in (400, 2000):
    h.BOX(xt, xt + 150, -150, 150, 0, 100, "url(#madera)", "#9c6a35", "#8a5a2b", "#4d3214", .6)
zc = 100 + RT + 8
# poste acostado (tramo de arriba: 3 m), a lo largo de x
def tuboXc(x0, x1, r0, r1, fill="url(#prfv)"):
    a, b = h.P(x0, 0, zc), h.P(x1, 0, zc)
    ra, rbb = r0 * s * 1.15, r1 * s * 1.15
    poly(h, [(a[0], a[1] - ra), (b[0], b[1] - rbb), (b[0], b[1] + rbb), (a[0], a[1] + ra)], fill, "#333", .7)
    if fill == "url(#prfv)": poly(h, [(a[0], a[1] - ra), (b[0], b[1] - rbb), (b[0], b[1] + rbb), (a[0], a[1] + ra)], "url(#fibra)", "none", 0)
    h.a(f'<ellipse cx="{b[0]:.1f}" cy="{b[1]:.1f}" rx="{rbb*.45:.1f}" ry="{rbb:.1f}" fill="#7a807e" stroke="#333" stroke-width=".6" transform="rotate(-30 {b[0]:.1f} {b[1]:.1f})"/>')
    return a, b
a, b = tuboXc(0, 3000, 75, RT)
h.path(f"M{a[0]-3},{a[1]-9} l4,4 l-4,4 l4,4 l-4,4", "none", "#111", 1)
tuboXc(3000, 3468, 45, 45, "url(#galv)")
# vínculo capuchón (caja) + brazo 400 hacia +y + luminaria
h.BOX(3468, 3700, -70, 70, zc - 70, zc + 70, "url(#galv)", "#9aa6b0", "#7f8b96", "#333", .6)
bp = [(3600, 70 + 400 * i / 10, zc) for i in range(11)]
linea3(h, [(3600, 70, zc), (3600, 470, zc)], "#333", 6.5); linea3(h, [(3600, 70, zc), (3600, 470, zc)], "#c9d1d8", 4.5)
h.BOX(3420, 3780, 470, 800, zc - 45, zc + 25, "#5d6670", "#3f474f", "#4b545d", "#111", .7)
h.F3([(3450, 500, zc - 46), (3750, 500, zc - 46), (3750, 770, zc - 46), (3450, 770, zc - 46)], "#f5f3d8", "#999", .5)
# perforaciones en el capuchón
for (yy, zz) in ((-40, zc + 20), (40, zc - 25)):
    x, y = h.P(3700, yy, zz); h.a(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="2.6" ry="3.4" fill="#111"/>')
clip_fin(h)
g(h, (1500, 0, zc + 60), X + 14, py + 250, "columna sobre tacos")
g(h, (3600, 640, zc + 25), X + 120, py + 290, "luminaria probada")
g(h, (3700, -40, zc + 20), X + 326, py + 34, 'prensacable 3/4"', "end")
g(h, (3700, 40, zc - 25), X + 326, py + 60, "bulón pasante", "end")
g(h, (475, 150, 100), X + 14, py + 40, "taco de madera")
# plano: elevación de la punta
k = .1; cx, y0 = X + 338 + 60, py + 270
h.path(f"M{cx-61*k*2.2},{y0} L{cx-61*k*1.6},{y0-150} L{cx+61*k*1.6},{y0-150} L{cx+61*k*2.2},{y0}", "none", K, 1.3)
h.rect(cx - 9, y0 - 150 - 468 * k * 1.6 * .5, 18, 468 * k * 1.6 * .5, "#fff", K, 1.1)
ytop = y0 - 150 - 37
h.rect(cx - 18, ytop - 40, 36, 40, "#fff", K, 1.2)
h.ln(cx + 18, ytop - 20, cx + 70, ytop - 20, K, 3); h.ln(cx + 18, ytop - 20, cx + 70, ytop - 20, "#fff", 1.4)
h.rect(cx + 70, ytop - 30, 64, 16, "#fff", K, 1.2)
h.circ(cx + 10, ytop - 8, 3, "#fff", K, .8); h.circ(cx - 10, ytop - 30, 2.4, "#111", K, .5)
h.dimH(ytop - 52, cx + 18, cx + 70, "400")
h.dimV(cx - 34, y0 - 150 - 37, y0 - 150, "468", ext=cx - 10)
h.txt(cx - 30, y0 - 120, "Ø90/76", 9, 400, K, "end")
h.txt(cx - 26, y0 - 60, "Ø122", 9, 400, K, "end")
h.txt(cx + 22, y0 - 100, "POSTE PRFV", 8.5, 700, K)
h.path(f"M{cx-40},{y0+4} l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8 l8,8 l8,-8", "none", K, .7)
h.txt(cx + 26, ytop + 20, 'PRENSACABLE 3/4"', 8, 700, K); h.ln(cx + 12, ytop - 6, cx + 26, ytop + 14, K, .5)
h.txt(cx - 24, ytop - 50, "BULÓN PASANTE", 8, 700, K, "end"); h.ln(cx - 10, ytop - 30, cx - 26, ytop - 48, K, .5)
h.txt(cx + 102, ytop - 2, "LUMINARIA", 8, 700, K, "middle")
h.txt(X + 338 + 106, py + 292, "PUNTA DEL POSTE · S/E", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 3, "Izá y presentá en el hueco",
           ["Con hidrogrúa y eslinga. Nadie debajo de la carga.",
            "Bajala derecha y despacio hasta apoyar en el fondo del hueco.",
            "Empotramiento: 1,00 m (7 m) · 1,10 m (10 m)."],
           ojo="Nadie debajo de la carga ni dentro del radio de la hidrogrúa.",
           control="Columna apoyada en el fondo del hueco, con el empotramiento del plano.")
clip_ini(h, X, py, 330, 300)
fund(h, X + 165, py + 150, .055); hueco(h); frente(h)
columna(h, 250, 6000)
# eslinga y gancho
x1, y1 = h.P(c0 - 90, c0, 1700); x2, y2 = h.P(c0 + 90, c0, 1700); xh, yh = h.P(c0, c0, 2500)
h.ln(x1, y1, xh, yh, "#e0a100", 2.6); h.ln(x2, y2, xh, yh, "#e0a100", 2.6)
h.path(f"M{xh},{yh} q-7,-2 -6,-10 q2,-7 9,-6", "none", "#333", 3); h.ln(xh + 3, yh - 16, xh + 3, py - 2, "#333", 2)
a1 = h.P(c0, c0, 250); b1 = h.P(c0, c0, -1000); h.ln(*a1, *b1, "#e11d48", 1.4, 'stroke-dasharray="5 4"')
for i, xx in enumerate((X + 22, X + 300)):
    cono(h, xx, py + 286 - (i * 4), .8)
clip_fin(h)
g(h, (c0 + 45, c0, 2100), X + 230, py + 40, "eslinga", "start")
g(h, (c0, c0, 900), X + 14, py + 120, "columna derecha")
g(h, (c0, c0, -500), X + 210, py + 250, "baja hasta el fondo", "start")
cx, top, w, dd, k, hr, rb = plano_corte(h, X, py, poste=True, zb=ZH, titulo="CORTE · EMPOTRAMIENTO")
h.dimV(cx - w / 2 - 40, top, top + 1000 * k, "1000 (1100)", ext=cx - rb)
h.dimH(top + 1000 * k + 16, cx - rb, cx + rb, "")
h.txt(cx, top + 1000 * k + 30, "Ø197", 9.5, 400, K, "middle")
h.guardar(f"{ID}_p2.svg")
# ===================== HOJA 3: pasos 4 y 5
h = pag(3)
X = 40
py = panel(h, X, 4, "Aplomá",
           ["Verificá el plomo con nivel en dos caras (a 90°).", "Recién con la columna a plomo se rellena.",
            "Orientá la luminaria hacia el espacio a iluminar antes de fijar."],
           ojo="Si se rellena torcida, no se endereza después: hay que sacar la arena.",
           control="Burbuja centrada en las dos caras. Luminaria orientada.")
clip_ini(h, X, py, 330, 300)
fund(h, X + 165, py + 74, .085); hueco(h); frente(h)
columna(h, ZH, 4600)
def nivel3(dx, dy, z0, z1):
    a = h.P(c0 + dx, c0 + dy, z0); b = h.P(c0 + dx, c0 + dy, z1)
    h.rect(a[0] - 4, b[1], 8, a[1] - b[1], "#f2c230", "#7a5a00", .8)
    ym = (a[1] + b[1]) / 2; h.rect(a[0] - 2.5, ym - 7, 5, 14, "#bfe8a0", "#356b1a", .6); h.circ(a[0], ym, 1.8, "#fff", "#356b1a", .4)
nivel3(0, 130, 150, 1050); nivel3(130, 0, 150, 1050)
clip_fin(h)
g(h, (c0, c0 + 130, 900), X + 14, py + 50, "nivel en la cara 1")
g(h, (c0 + 130, c0, 900), X + 196, py + 50, "cara 2 (a 90°)")
chk(h, X + 300, py + 120); h.txt(X + 300, py + 148, "a plomo", 12, 800, "#14632b", "middle", INT)
# plano: planta con los dos niveles
k = .26; cx, cy = X + 338 + 106, py + 150
h.rect(cx - 300 * k, cy - 300 * k, 600 * k, 600 * k, "url(#CONC)", K, 1.2)
h.circ(cx, cy, 123.5 * k, "#fff", K, 1); h.circ(cx, cy, 98.5 * k, "#fff", K, 1.6)
h.ln(cx - 95, cy, cx + 95, cy, K, .5, h.EJE); h.ln(cx, cy - 95, cx, cy + 95, K, .5, h.EJE)
h.rect(cx - 4, cy + 98.5 * k, 8, 22, "#fff", K, 1); h.txt(cx + 8, cy + 98.5 * k + 18, "NIVEL 1", 8.5, 700, K)
h.rect(cx + 98.5 * k, cy - 4, 22, 8, "#fff", K, 1); h.txt(cx + 98.5 * k + 2, cy - 8, "NIVEL 2", 8.5, 700, K)
h.path(f"M{cx+40},{cy} A40,40 0 0 1 {cx},{cy+40}", "none", K, .6); h.txt(cx + 32, cy + 34, "90°", 9.5, 700, K)
h.dimH(cy - 300 * k - 12, cx - 300 * k, cx + 300 * k, "600")
h.txt(cx, py + 292, "PLANTA · NIVEL A 90°", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 5, "Rellená con arena seca",
           ["Llená el espacio con arena fina seca, compactando en capas, hasta 50 mm por debajo del piso.",
            "El troncal entra por el paso que dejó el telgopor hasta la entrada «C» del poste (350 mm de la base).",
            "Llega y sigue: 2 cables por el canal."],
           ojo="Arena seca y fina: con tierra o piedra la columna se mueve y no se puede sacar.",
           control="Arena compactada hasta 50 mm del piso, cables adentro por la «C».")
clip_ini(h, X, py, 330, 300)
fund(h, X + 165, py + 74, .085, arena=True)
frente_atras(h, True)
columna(h, ZH, 4600)
for j, yy in enumerate((c0 - 60, c0 - 25)):
    pts = [(L + 40, yy, -690), (A1, yy, -665), (c0 + 140, yy, -655), (c0 + 80, yy * 0 + c0 - 20 + 0 * j, -650)]
    cubierta3(h, pts, 3.2)
    x, y = h.P(L + 40, yy, -690); cara_cable(h, x, y, 4.4)
frente_adelante(h)
zx, zy = X + 290, py + 56
x, y = h.P(L + 40, c0 - 60, -690)
h.ln(x, y, zx - 30, zy + 18, NV, .8, 'stroke-dasharray="3 2"'); h.circ(zx, zy, 32, "#fff", NV, 1.2); cara_cable(h, zx, zy, 26)
h.txt(zx - 40, zy - 18, "troncal:", 11.5, 700, NV, "end", INT); h.txt(zx - 40, zy - 3, "L1 L2 L3 N", 11.5, 700, NV, "end", INT); h.txt(zx - 40, zy + 12, "y sus hilos", 11.5, 700, NV, "end", INT)
clip_fin(h)
g(h, (c0 - 60, c0, -400), X + 14, py + 250, "arena fina seca")
g(h, (c0 + 300, c0 - 40, -665), X + 326, py + 292, "troncal por el canal a la «C»", "end")
cx, top, w, dd, k, hr, rb = plano_corte(h, X, py, poste=True, arena=True, cable=True, titulo="CORTE · ARENA Y ENTRADA «C»")
h.dimV(cx - w / 2 - 40, top, top + 50 * k, "50", ext=cx - hr)
h.dimV(cx - w / 2 - 40, top + 650 * k, top + 1000 * k, "350", ext=cx - rb)
h.guardar(f"{ID}_p3.svg")
# ===================== HOJA 4: paso 6 + así queda
h = pag(4)
X = 40
py = panel(h, X, 6, "Sellá los últimos 50 mm",
           ["Completá los últimos 50 mm con el sello, terminado hacia afuera para que no entre agua.",
            "Ya fraguado, rellená cualquier vacío con elastómero (8009) aprobado por la Inspección.",
            "En PRFV no va torta/contrabase."],
           ojo="(*) El plano dibuja mortero y la nota dice sello de hormigón: confirmar el material del sello.",
           control="Sello de 50 mm con pendiente hacia afuera, sin vacíos. Foto: «Columna» con su N°.")
clip_ini(h, X, py, 330, 300)
fund(h, X + 165, py + 74, .085, arena=True, sello=True); frente(h)
columna(h, ZH, 4600)
pts = [h.P(*p) for p in h.circZ(10, c0, c0, RB + 6)]
h.a('<polyline points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts[:22]) + '" fill="none" stroke="#111" stroke-width="3"/>')
clip_fin(h)
g(h, (c0 - 100, c0, 0), X + 14, py + 250, "sello de 50 mm")
g(h, (c0 + RB, c0 + 30, 10), X + 326, py + 292, "elastómero alrededor", "end")
cx, top, w, dd, k, hr, rb = plano_corte(h, X, py, poste=True, arena=True, sello=True, titulo="CORTE · SELLO")
h.dimV(cx - w / 2 - 40, top, top + 50 * k, "50", ext=cx - hr)
h.txt(cx - w / 2 - 30, top - 14, "SELLO", 8.5, 700, K)
X = W / 2 + 18
asi_queda(h, X, "k4_poste_3d.png", "AP-C-033-A / AP-TC-003-A", "Puesta a tierra y medición",
          "Columna a plomo, empotramiento correcto, arena compactada hasta 50 mm del piso, sello de 50 mm, vacíos con elastómero, luminaria orientada al espacio a iluminar. Foto: «Columna» con su N°.",
          ["Sujeción de la luminaria: prisioneros inox (ETG) o bulón pasante + soldadura (proyecto)."], alto=330)
h.guardar(f"{ID}_p4.svg")
print("ok")
