"""AP-PL-002 (hoja b) · Despiece de la caja de conexión: riel, tornillos, ojal de goma, prensacable + nota de fases TT / TN-S.
Datos: ficha AP-PL-002 (riel NS35 14 cm, 2 tornillos cabeza tanque 6×3/8, ojal de goma en agujero pasante Ø50, prensacable ZA3 3/4" BSC
o ZA11 1/2" BSP, cable 6 a 12 mm; nota TT/TN-S), calculadora v130 (códigos de fábrica 20001053 / 20001061, IP68, corona dentada; ítem 14.1)."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
import tabmet as T, caja_ext as C
h = Hoja(); R = 57; GAP = 18
L = T.armado(3, "TN-S")
# ================= DESPIECE (corte lateral explotado) =================
h.titulo(40, 62, "DESPIECE - CORTE LATERAL EXPLOTADO", "ESC. 1:3 - LAS PIEZAS SE SEPARAN SOBRE EL EJE DEL AGUJERO Ø50")
k = .95; zc = 260; ax = 60
h.ln(ax, zc, 840, zc, K, .5, h.EJE)
# 1 pared de la columna
h.rect(ax + 20, zc - 140, 4 * k, 280, K, K, 0)
for yy in (zc - 140, zc + 140): h.path(f"M{ax+10},{yy} h10 l4,-5 l4,10 l4,-5 h10", "none", K, .6)
h.rect(ax + 19.5, zc - 25 * k, 5, 50 * k, "#fff", "none", 0)
h.txt(ax + 22, zc + 160, "PARED COLUMNA", 9, 700, K, "middle")
# 2 ojal de goma (separado)
ox = ax + 90
h.path(f"M{ox},{zc-34*k} h10 v8 h-3 v{-8+60*k-16*0:.1f}", "none", "none", 0)
for sy in (-1, 1):
    y1 = zc + sy * 25 * k
    h.rect(ox, y1 - (9 if sy < 0 else 0) * k - (0 if sy < 0 else 0), 12 * k, 9 * k, "#333", K, .6)
    h.rect(ox + 3 * k, y1 - (4 if sy < 0 else -4) * k - (5 if sy > 0 else 0) * 0, 6 * k, 4 * k, "#fff", K, .4)
h.txt(ox + 6, zc + 176, "OJAL DE GOMA", 9, 700, K, "middle")
# 3 caja (fondo con agujero)
cx0 = ax + 160
h.rect(cx0, zc - C.CH / 2 * k, C.CD * k, C.CH * k, "url(#ANSI31)", K, 1.0)
h.rect(cx0 + C.CE * k, zc - C.CH / 2 * k + C.CE * k, (C.CD - 2 * C.CE) * k, (C.CH - 2 * C.CE) * k, "#fff", K, .6)
h.rect(cx0 - .5, zc - 25 * k, C.CE * k + 1, 50 * k, "#fff", "none", 0)
h.txt(cx0 + C.CD * k / 2, zc + 160, "CAJA 6003", 9, 700, K, "middle")
# 4 fondo del tablerito + 5 riel + 6 tornillos (separados)
fx = cx0 + C.CD * k + 50
h.rect(fx, zc - 35 * k, 2 * k + .6, 70 * k, K, K, 0)
rx = fx + 40; h.path(f"M{rx},{zc-17.5*k} h{2*k} v{2.5*k} h{5.5*k} v{30*k} h{-5.5*k} v{2.5*k} h{-2*k} z", "#fff", K, .8)
for dy in (-10, 10):
    tx0 = rx + 40; yy = zc + dy * k
    h.rect(tx0, yy - 1.6 * k, 9.5 * k, 3.2 * k, "url(#ANSI37)", K, .5); h.path(f"M{tx0+9.5*k:.1f},{yy-5*k:.1f} q5,0 5,5 q0,5 -5,5 z", "#fff", K, .7)
    h.ln(rx + 8, yy, tx0, yy, K, .4, h.OCULTA)
h.txt(fx, zc + 160, "FONDO", 9, 700, K, "middle"); h.txt(rx + 4, zc + 176, "RIEL", 9, 700, K, "middle"); h.txt(rx + 52, zc + 160, "2 TORN.", 9, 700, K, "middle")
# 7 piezas del tablerito (bloque) y 8 tapa
bx = rx + 90
h.rect(bx, zc - 39.75 * k, 61 * k, 79.5 * k, "#fff", K, .8); h.rect(bx + 10 * k, zc - 19 * k, 51 * k, 38 * k, "url(#ANSI37)", K, .5)
h.txt(bx + 30 * k, zc + 176, "PF + BPN", 9, 700, K, "middle")
tpx = bx + 120; h.rect(tpx, zc - C.CH / 2 * k, 4 * k, C.CH * k, "#fff", K, 1.2); h.rect(tpx - 3, zc - C.CH / 2 * k + 6, 3, C.CH * k - 12, "#333", K, .4)
h.txt(tpx, zc + 160, "TAPA + JUNTA", 9, 700, K, "middle")
# prensacable abajo de la caja (bajado)
pxx = cx0 + C.CD * k / 2; py0 = zc + C.CH / 2 * k
h.ln(pxx, py0, pxx, py0 + 12, K, .4, h.OCULTA)
pend = C.prensa2d(h, pxx, py0 + 12, 1.0)
h.txt(pxx + 22, py0 + 34, "PRENSACABLE", 9, 700)
# flechas de armado
for xa, xb_ in ((ax + 28, ox - 4), (ox + 16, cx0 - 4), (fx + 4, cx0 + C.CD * k - 6)):
    h.ln(xa, zc - 70, xb_, zc - 70, K, .5); h.path(f"M{xb_},{zc-70} l-6,-3 v6 z", K, K, .3)
for n, a, g in (("1", (ax + 22, zc - 100), (ax + 22, 110)), ("2", (ox + 6, zc - 26), (ox + 6, 110)), ("3", (cx0 + 20, zc - 60), (cx0 + 20, 110)),
                ("4", (fx + 1, zc - 25), (fx + 1, 110)), ("5", (rx + 4, zc - 12), (rx + 4, 110)), ("6", (rx + 46, zc - 9), (rx + 50, 110)),
                ("8", (bx + 30, zc - 30), (bx + 30, 110)), ("9", (tpx + 2, zc - 50), (tpx + 2, 110)), ("7", (pxx, pend - 4), (pxx - 60, pend - 16))):
    h.globo(n, a[0], a[1], g[0], g[1])
h.dimH(zc - C.CH / 2 * k - 14, cx0, cx0 + C.CD * k, "100", ext=zc - C.CH / 2 * k - 2)
h.dimV(cx0 - 14, zc - C.CH / 2 * k, zc + C.CH / 2 * k, "150", ext=cx0 - 2)
h.dimV(ox - 14, zc - 25 * k, zc + 25 * k, "Ø50", ext=ox - 2)
# ================= D1 RIEL + TORNILLO =================
h.titulo(40, 470, "D1 - RIEL DIN NS35 + TORNILLOS", "ESC. 1:2 - 14 cm POR CAJA, 2 TORNILLOS CABEZA TANQUE 6×3/8")
k1 = 1.6; X1, Y1 = 60, 520
h.rect(X1, Y1, 140 * k1, 35 * k1, "#fff", K, 1.0)
h.ln(X1, Y1 + 5 * k1, X1 + 140 * k1, Y1 + 5 * k1, K, .5); h.ln(X1, Y1 + 30 * k1, X1 + 140 * k1, Y1 + 30 * k1, K, .5)
for i in range(9):
    xs = X1 + (8 + i * 15.5) * k1; h.rect(xs, Y1 + 13 * k1, 9 * k1, 9 * k1, "#fff", K, .5)   # ranuras (*)
for xx in (X1 + 12 * k1, X1 + 128 * k1):
    h.circ(xx, Y1 + 17.5 * k1, 5 * k1, "#fff", K, .9); h.ln(xx - 3 * k1, Y1 + 17.5 * k1, xx + 3 * k1, Y1 + 17.5 * k1, K, .8)
h.dimH(Y1 - 12, X1, X1 + 140 * k1, "140", ext=Y1 - 2); h.dimV(X1 + 140 * k1 + 14, Y1, Y1 + 35 * k1, "35", ext=X1 + 140 * k1 + 2)
h.dimH(Y1 + 35 * k1 + 16, X1, X1 + 12 * k1, "12 (*)", ext=Y1 + 35 * k1 + 2, c=OR)
# sección del riel
sx, sy = 330, 540
h.path(f"M{sx},{sy} h{5*k1*1.4} v{-7.5*k1*1.4} h{25*k1*1.4} v{7.5*k1*1.4} h{5*k1*1.4}", "none", K, 2.2)
h.dimH(sy + 16, sx, sx + 35 * k1 * 1.4, "35", ext=sy + 2); h.dimV(sx - 12, sy - 7.5 * k1 * 1.4, sy, "7,5", ext=sx + 6)
h.txt(sx + 17.5 * k1 * 1.4, sy + 36, "SECCION NS35 × 7,5", 9, 700, K, "middle")
# ================= D2 OJAL =================
h.titulo(500, 470, "D2 - OJAL DE GOMA", "ESC. 1:1 - EN EL AGUJERO Ø50")
ox2, oy2 = 640, 560; ro = 25
for sgn in (-1, 1):
    yy = oy2 + sgn * ro
    h.rect(ox2 - 6, yy - (10 if sgn < 0 else 0), 12, 10, "#333", K, .6)
    h.rect(ox2 - 1.5, yy - (3 if sgn < 0 else -3) - (0 if sgn < 0 else 3) , 3, 3, "#fff", "none", 0)
h.rect(ox2 - 1.5, oy2 - 80, 3, 80 - ro - 0, "url(#ANSI31)", K, .6); h.rect(ox2 - 1.5, oy2 + ro, 3, 55, "url(#ANSI31)", K, .6)
h.dimV(ox2 + 40, oy2 - ro, oy2 + ro, "Ø50", ext=ox2 + 6)
h.dimV(ox2 - 40, oy2 - ro + 10, oy2 + ro - 10, "Ø PASO (*)", ext=ox2 - 6, c=OR)
h.ln(ox2 - 70, oy2, ox2 + 70, oy2, K, .4, h.EJE); h.txt(ox2 + 54, oy2 - 50, "CHAPA", 9, 400)
h.txt(ox2, oy2 + 100, "PROTEGE EL CABLE DEL FILO", 9, 400, K, "middle")
# ================= D3 PRENSACABLE =================
h.titulo(40, 700, "D3 - PRENSACABLE METALICO", "ESC. 1:1 - ZA3 o ZA11 (EQUIVALENTES)")
C.prensa2d(h, 120, 760, 1.6, "ZA3", up=False)
h.rect(98, 745, 44, 15, "url(#ANSI31)", K, .7); h.txt(150, 756, "CAJA", 9, 400)
h.ln(120, 760 + 44 * 1.6, 120, 760 + 44 * 1.6 + 40, K, 2.4, 'stroke-dasharray="5 2"')
h.dimH(760 + 44 * 1.6 + 46, 106, 134, "", ext=760 + 44 * 1.6); h.txt(140, 760 + 44 * 1.6 + 50, "CABLE Ø6 A 12", 9, 400)
rows = [("MODELO", "ROSCA", "COD. FABRICA", "CABLE"), ("ZA3", '3/4" BSC', "20001053", "Ø6 A 12"), ("ZA11", '1/2" BSP', "20001061", "Ø6 A 12")]
h.tabla(220, 730, [(54, "c", False), (66, "c", False), (92, "c", True), (66, "c", True)], rows, rowh=20)
h.txt(220, 810, "CUERPO METALICO, CORONA DENTADA ANTIVIBRATORIA, IP68 (CONEXTUBE)", 9, 400)
h.txt(220, 824, "MEDIDAS DEL CUERPO Y LA TUERCA: (*) A CONFIRMAR CON EL FABRICANTE", 9, 400, OR)
# ================= FASES TT / TN-S =================
h.titulo(520, 700, "NOTA DEL PLANO: FASES", "S/E - 3 ARTEFACTOS POR COLUMNA")
def fila(y, tit, fases):
    h.txt(520, y + 4, tit, 9.5, 700)
    for i, fz in enumerate(fases):
        x = 600 + i * 62; h.ln(x, y - 10, x, y + 26, K, 1.6)
        for j, f_ in enumerate(fz):
            xx = x - 16 + j * 16; h.ln(x, y - 10, xx, y - 16, K, .6); h.circ(xx, y - 16, 6, T.FASEC[f_], K, .6)
        h.txt(x, y + 40, "-".join(dict.fromkeys(fz)) if len(set(fz)) > 1 else fz[0], 9, 700, K, "middle")
fila(760, "TT", ["RRR", "SSS", "TTT"])
fila(830, "TN-S", ["RST", "RST", "RST"])
h.txt(780, 760, "COLUMNA 1 · 2 · 3", 9, 400, G)
h.txt(520, 892, "TT: 1 FASE POR COLUMNA · TN-S: 1 FASE POR ARTEFACTO", 9, 400)
# ================= COMPUTO y NOTAS =================
rows = [("POR CAJA", "CANT.", "CALCULO"), ("RIEL DIN NS35", "0,14 m", "14 cm POR CAJA"), ("TORNILLO CAB. TANQUE 6×3/8", "2", "2 POR CAJA"),
        ("OJAL DE GOMA", "1", "1 POR AGUJERO Ø50"), ("PRENSACABLE ZA3 O ZA11", "1", "1 POR CAJA (ENTRADA)")]
h.tabla(40, 905, [(180, "l", False), (60, "c", True), (180, "l", False)], rows, rowh=19, titulo="COMPUTO POR CAJA")
h.rayados(520, 925, [("ANSI31", "ALUMINIO / CHAPA"), ("ANSI37", "ROSCA / FUSIBLE")], cols=2, dx=150)
h.notas(40, 1040, [
 "COTAS EN mm. ES LA FERRETERIA DE LA CAJA (HOJA b): LA MISMA PARA LA CAJA EXTERNA DEL AP-PL-003 (ITEM 42 / 14.1).",
 "LA CALCULADORA TAMBIEN LA PONE POR CADA CAJA DE COLUMNA NUEVA. EL RIEL EN EL PAÑOL ESTA EN «Un.» (SE CUENTA EN m).",
 "(*) A CONFIRMAR: TORNILLO 6×3/8 SIN CODIGO, Ø DE PASO DEL OJAL, RANURAS DEL RIEL, MEDIDAS DEL PRENSACABLE.",
 "(*) LA TABLA DE LA APP DICE ZA11 PARA CABLE 5 A 8 mm Y LA FICHA 6 A 12. ¿QUE CABLE ENTRA POR AHI? (REVISION B.7)"])
# ================= 3D EXPLOTADO =================
h.titulo(880, 62, "VISTA 3D - DESPIECE DE LA CAJA", "LAS PIEZAS SEPARADAS SOBRE EL EJE DEL AGUJERO, EN EL ORDEN EN QUE SE ARMAN")
h.iso(.82, 1040, 300)
C.col3d(h, R, -170, 150)
# ojal (anillo negro) separado
xo = R + 30
o = h.P(xo, 0, 10); h.a(f'<ellipse cx="{o[0]:.1f}" cy="{o[1]:.1f}" rx="{12:.1f}" ry="{24:.1f}" fill="none" stroke="#111" stroke-width="7" transform="rotate(-30 {o[0]:.1f} {o[1]:.1f})"/>')
# caja
xb = R + 70
b = C.caja3d(h, xb, 0, 0, ojal=True)
C.caja3d_frente(h, b, corte=C.CD - 25)
C.prensa3d(h, xb + C.CD / 2, 30, -C.CH / 2 - 60)
# fondo + riel + tornillos + piezas, separados en x
xf = xb + C.CD + 40
h.BOX(xf, xf + 2, -C.PLW / 2, C.PLW / 2, -10 - C.PLH / 2, -10 + C.PLH / 2, "#cfd5da", "#b4bcc4", "url(#galv)", "#555", .6)
xr = xf + 45
h.BOX(xr, xr + 7.5, -70, 70, -27.5, 7.5, "#e3e7ea", "#aab3bb", "#c9d0d6", "#555", .6)
for yy in (-58, 58):
    a = h.P(xr + 50, yy, -10); h.a(f'<ellipse cx="{a[0]:.1f}" cy="{a[1]:.1f}" rx="5" ry="3.5" fill="url(#galv)" stroke="#333" stroke-width=".6"/>')
    b2 = h.P(xr + 7.5, yy, -10); h.ln(b2[0], b2[1], a[0], a[1], "#555", .5, h.OCULTA)
xt = xr + 55
yv = -T.largo(L) / 2
for tp, lab in L:
    p = T.paso(tp)
    if tp == "pf": h.BOX(xt, xt + 46, yv, yv + p, -50, 30, "#f1ece0", "#cfc6b0", "#e2dac6", "#444", .5)
    elif tp in ("gris", "cel", "ver"):
        cc = T.BCOL[tp]; h.BOX(xt, xt + 53, yv, yv + p, -35, 15, T.rgb(cc, 1.15), T.rgb(cc, .8), cc, "#333", .4)
    elif tp == "tope": h.BOX(xt, xt + 30, yv, yv + p, -32, 12, "#4a4f55", "#33373b", "#3d4146", "#111", .4)
    else: h.BOX(xt, xt + 59, yv, yv + p, -40, 20, "#e9c46a", "#b8952f", "#d2ad49", "#333", .4)
    yv += p
# tapa
tx = xt + 150
h.F3([(tx, -C.CW / 2, -C.CH / 2), (tx, C.CW / 2, -C.CH / 2), (tx, C.CW / 2, C.CH / 2), (tx, -C.CW / 2, C.CH / 2)], "#d9dcde", "#5d6266", .8)
h.F3([(tx - 4, -C.CW / 2 + 6, -C.CH / 2 + 6), (tx - 4, C.CW / 2 - 6, -C.CH / 2 + 6), (tx - 4, C.CW / 2 - 6, C.CH / 2 - 6), (tx - 4, -C.CW / 2 + 6, C.CH / 2 - 6)], "none", "#111", 2.2)
# eje de armado
e0 = h.P(0, 0, 10); e1 = h.P(tx + 20, 0, 10); h.ln(e0[0], e0[1], e1[0], e1[1], NV, .6, h.EJE)
gy = 120
def g(n, p, t):
    global gy; h.g3(n, p, 1500, gy, t); gy += 40
g("1", (R * .7, R * .7, 120), "PARED DE LA COLUMNA")
g("2", (xo, 0, 30), "OJAL DE GOMA Ø50")
g("3", (xb, C.CW / 2, C.CH / 2), "CAJA 200×150×100")
g("4", (xf, 40, 20), "FONDO DEL TABLERITO")
g("5", (xr + 7.5, -20, 7.5), "RIEL DIN NS35 140")
g("6", (xr + 50, 58, -10), "2 TORN. CAB. TANQUE")
g("8", (xt + 46, -50, 30), "PF + BPN (AP-CC-014)")
g("9", (tx, -C.CW / 2 + 20, 40), "TAPA CON JUNTA")
g("7", (xb + C.CD / 2, 30, -C.CH / 2 - 100), "PRENSACABLE ZA3/ZA11")
LISTA = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
 ("1", "COLUMNA (AGUJERO PASANTE Ø50 EN LA PARED)", "-", "EXISTENTE"),
 ("2", "OJAL DE GOMA PARA EL AGUJERO PASANTE Ø50", "1 u", "A VINCULAR"),
 ("3", "CAJA ESTANCA ALUMINIO INYECTADO 200×150×100 IP65", "1 u", "6003"),
 ("4", "FONDO DEL TABLERITO (*)", "1 u", "A VINCULAR"),
 ("5", "RIEL DIN NORMALIZADO NS35, 14 cm", "0,14 m", "2038"),
 ("6", "TORNILLO CABEZA TANQUE 6×3/8 PARA EL RIEL", "2 u", "A VINCULAR"),
 ("7", "PRENSACABLE METALICO ZA3 3/4\" BSC (20001053) O ZA11 1/2\" BSP (20001061)", "1 u", "A VINCULAR"),
 ("8", "PORTAFUSIBLES, FUSIBLES, BPN, PEINE (VER AP-CC-014)", "1 juego", "VER AP-CC-014"),
 ("9", "TAPA CON JUNTA (VIENE CON LA CAJA)", "1 u", "CON LA CAJA")]
h.tabla(890, 700, [(40, "c", False), (480, "l", False), (90, "c", True), (140, "c", False)], LISTA, rowh=24,
        titulo="LISTA DE MATERIALES (1 CAJA)", colores=lambda i, j, t: OR if ("(*)" in t or t in ("A VINCULAR", "SIN CODIGO")) else K)
h.rotulo(890, h.H - 150, 750, "AP-PL-002", "DESPIECE DE LA CAJA", "DE CONEXION (HOJA b)", "RIEL, TORNILLOS, OJAL, PRENSACABLE Y FASES TT / TN-S", "1:3 / 1:2", "D2-D3 1:1, 3D S/E", fecha="07/11/2026")
h.guardar("ap_pl_002.svg")
