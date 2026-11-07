"""Guía paso a paso «Conexionado de la caja de columna PRFV (borneras BPN)» (GUIAS_OBRA id caja_columna_prfv · TC-PRFV-01/02).
Texto: guía de la app (v130). Medidas: fichas TC-PRFV-01/02, AP-C-033-A, hoja tc_prfv_01, CLAUDE.md §11.3."""
from k4kit import *
ID = "caja_columna_prfv"; TOT = 4
TIT = "CONEXIONADO DE LA CAJA DE COLUMNA PRFV"; SUB = "Planos TC-PRFV-01 / TC-PRFV-02 (con jabalina) · tableritos 80 × 130 mm · riesgo medio"; PL = "TC-PRFV-01"
def pag(n): return pagina(n, TOT, TIT, SUB, PL)
GRIS, CEL, VER = "#9aa0a6", "#4fa3d9", "#2f9e44"
BW, BH, BD = 8.2, 50, 41          # borne BPN 6: paso 8,2 · alto 50 · fondo (*)
RZ0 = 47.5                        # riel NS35 de z 47,5 a 82,5 (centrado en la placa de 130)
FAS = {"R": L1, "S": L2, "T": L3, "N": NC}
# ---------- piezas 3D (x ancho de la placa, y hacia el que mira, z arriba)
def placa(h, z0=0):
    h.BOX(0, 80, -3, 0, z0, z0 + 130, "#eef0f3", "#dfe3e8", "#c9ced6", "#555", .7)
    for (xx, zz) in ((10, 112), (70, 112), (10, 18), (70, 18)):
        x, y = h.P(xx, 0, z0 + zz); h.circ(x, y, 1.6, "#fff", "#555", .5)
    h.BOX(1, 79, 0, 7.5, z0 + RZ0, z0 + RZ0 + 35, "url(#galv)", "#c3ccd4", "#8d98a2", "#444", .6)
def borne(h, x0, col, z0=0, letra=None):
    zb = z0 + 40
    h.BOX(x0, x0 + BW, 7.5, BD, zb, zb + BH, col, col, col, "#222", .6)
    h.BOX(x0 + 1.2, x0 + BW - 1.2, BD - .1, BD + .2, zb + 6, zb + BH - 6, "#00000022", "#0000002a", "#00000033", "none", 0)
    for zz in (zb + 41, zb + 9):
        x, y = h.P(x0 + BW / 2, BD, zz); h.circ(x, y, max(1.4, 2.6 * h._s / 1.35), "#d9dde2", "#222", .5)
        h.ln(x - 1.6 * h._s / 1.35, y - 1.6 * h._s / 1.35, x + 1.6 * h._s / 1.35, y + 1.6 * h._s / 1.35, "#222", .6)
    x, y = h.P(x0 + BW / 2, 24, zb + BH); h.a(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{1.8*h._s/1.35:.1f}" ry="{1.1*h._s/1.35:.1f}" fill="#111"/>')
    if letra:
        x, y = h.P(x0 + BW / 2, BD, zb + 33)
        h.txt(x, y + 3, letra, max(6, 7 * h._s / 1.35), 800, "#fff" if col != CEL else "#06324d", "middle", INT)
def separador(h, x0, z0=0):
    h.BOX(x0, x0 + 2, 7.5, BD + 4, z0 + 36, z0 + 94, "#3a3f45", "#2a2e33", "#4a5057", "#111", .5)
def peine(h, x0, n, z0=0):
    h.BOX(x0 + 1, x0 + n * BW - 1, BD + .2, BD + 2.2, z0 + 62, z0 + 68, "#e0a85a", "#c98b3a", "#a86d26", "#5a3a10", .5)
def portaf(h, x0, z0=0, letra=None):
    h.BOX(x0, x0 + 17.5, 7.5, 61, z0 + 25, z0 + 104.5, "#d7d9dc", "#c8cbcf", "#b5b9be", "#333", .6)
    h.BOX(x0 + 2, x0 + 15.5, 61, 62, z0 + 32, z0 + 97, "#e9ebed", "#e1e3e6", "#ccd0d4", "#555", .5)
    x, y = h.P(x0 + 8.75, 62, z0 + 64)
    if letra: h.txt(x, y + 3, letra, max(6, 7 * h._s / 1.35), 800, "#333", "middle", INT)
def abajo(h, z0=0, jab=False):
    placa(h, z0)
    x = 20 if not jab else 14
    if jab: borne(h, x, VER, z0, "PE"); x += BW
    borne(h, x, CEL, z0, "N"); xn = x; x += BW
    if jab: peine(h, xn - BW, 2, z0)
    separador(h, x, z0); x += 2
    pos = {"N": xn}
    for L in "RST": borne(h, x, GRIS, z0, L); pos[L] = x; x += BW
    return pos
def arriba(h, z0=0):
    placa(h, z0)
    x = 8; pos = {}
    for i, (col, L) in enumerate(((VER, "PE"), (VER, "PE"), (CEL, "N"))):
        borne(h, x, col, z0, L); pos[L + str(i)] = x; x += BW
    peine(h, 8, 3, z0)
    portaf(h, 38, z0, "S"); portaf(h, 58, z0, "T"); pos["S"] = 38; pos["T"] = 58
    return pos
def ent_abajo(x0, z0, w=BW): return (x0 + w / 2, 24, z0 + 40)          # entrada de cable por abajo del borne
def ent_arriba(x0, z0, w=BW): return (x0 + w / 2, 24, z0 + 90)
def tif(h, p, arriba=True, col="#f08a24"):
    """puntera TIF entrando al borne: caña de Cu + collar de color"""
    x, y, z = p; d = 1 if arriba else -1
    punta_cu(h, (x, y, z), (x, y, z + d * 6), max(1.5, 2.2 * h._s / 1.35))
    linea3(h, [(x, y, z + d * 6), (x, y, z + d * 11)], col, max(2.2, 3.4 * h._s / 1.35), 'stroke-linecap="butt"')
# ---------- plano: frente del tablerito (B/N)
def plano_tab(h, cx, ytop, k, tipo="abajo", titulo=""):
    w, hh = 80 * k, 130 * k; x0 = cx - w / 2
    h.rect(x0, ytop, w, hh, "#fff", K, 1.2)
    for (xx, zz) in ((10, 18), (70, 18), (10, 112), (70, 112)): h.circ(x0 + xx * k, ytop + zz * k, 2, "#fff", K, .6)
    h.rect(x0 + k, ytop + RZ0 * k, 78 * k, 35 * k, "url(#ANSI31)", K, .6)
    def bpn(xx, L):
        h.rect(x0 + xx * k, ytop + 40 * k, BW * k, BH * k, "#fff", K, .9)
        for zz in (49, 81): h.circ(x0 + (xx + BW / 2) * k, ytop + zz * k, 2.2, "#fff", K, .6)
        h.txt(x0 + (xx + BW / 2) * k, ytop + 36 * k, L, 8.5, 700, K, "middle")
    if tipo == "abajo":
        bpn(20, "N"); h.rect(x0 + 28.2 * k, ytop + 36 * k, 2 * k, 58 * k, "#111", K, .5)
        for i, L in enumerate("RST"): bpn(30.2 + i * BW, L)
        h.dimH(ytop + hh + 14, x0 + 30.2 * k, x0 + 38.4 * k, "8,2")
    else:
        for i, L in enumerate(("PE", "PE", "N")): bpn(8 + i * BW, L)
        h.rect(x0 + 9 * k, ytop + 62 * k, 22.6 * k, 6 * k, "#fff", K, .9)
        for xx, L in ((38, "S"), (58, "T")):
            h.rect(x0 + xx * k, ytop + 25 * k, 17.5 * k, 79.5 * k, "#fff", K, .9); h.rect(x0 + (xx + 4) * k, ytop + 40 * k, 9.5 * k, 50 * k, "url(#ANSI31)", K, .5)
            h.txt(x0 + (xx + 8.75) * k, ytop + 21 * k, L, 8.5, 700, K, "middle")
        h.dimH(ytop + hh + 14, x0 + 38 * k, x0 + 55.5 * k, "17,5")
    h.dimH(ytop - 10, x0, x0 + w, "80"); h.dimV(x0 - 12, ytop, ytop + hh, "130", ext=x0 - 2)
    h.dimV(x0 + w + 12, ytop + RZ0 * k, ytop + (RZ0 + 35) * k, "35", ext=x0 + w - 2)
    if titulo: h.txt(cx - 6, ytop + hh + 40, titulo, 9.5, 700, K, "middle")
# ===================== HOJA 1
h = pag(1)
d = dict(epp="Guantes, anteojos.", aut="Circuito sin tensión.", her="Destornilladores aislados, pinza crimpeadora de TIFF, alicate, pelacables.",
         mat=[("SIN COD.", "Tablerito 80 × 130 mm con riel DIN — 2 (arriba y abajo)"), ("3053", "Portafusible tabaquera 10×38 — 2 (S y T, arriba)"),
              ("2009", "BPN gris (fase) 6 mm² R · S · T — 3 (siempre de 6, sea cual sea el cable)"), ("2008", "BPN celeste (neutro) 6 mm² — 2 (uno arriba, uno abajo)"),
              ("2010", "BPN verde (tierra) 6 mm² — 2 arriba (3 en la columna con jabalina)"), ("2041", "Separador — 1 (abajo, después del N)"),
              ("2027", "Puente peine — PE · PE · N arriba (y PE · N abajo con jabalina)"), ("1010", "Cable Cu 4×4 mm² IRAM 2178-1 — 1 m entre tableritos"),
              ("2031", "Puntera TIF 4 mm² — 6 (puntas del 4×4)"), ("3017/3073", "Fusible 10×38 gG 2 A / 4 A"), ("6001", "Cable Cu 3 × 1,5 mm² — uno por artefacto")])
antes(h, 40, d)
X = W / 2 + 18
py = panel(h, X, 1, "Dos tableritos de 80 × 130",
           ["Abajo: llega la alimentación (N · R · S · T; en la columna con jabalina también PE).",
            "Arriba: PE · PE · N con peine y los portafusibles S y T; de ahí salen los 3 × 1,5 a los artefactos.",
            "La caja de abajo queda a 3,50 m del piso; la de arriba, 500 mm más arriba."],
           ojo="Se arma sin tensión. En el galpón queda más cómodo que arriba de la columna.",
           control="Los dos tableritos con sus piezas en el orden del plano.")
clip_ini(h, X, py, 330, 300)
s = .7; cabinet(h, s, X + 200, py + 262)
# pared de la columna (media caña oscura, detrás)
for zz0, zz1 in ((-60, 130), (185, 360)):
    h.F3([(-20, -6, zz0), (100, -6, zz0), (100, -6, zz1), (-20, -6, zz1)], "url(#prfv)", "#222", .6)
pb = abajo(h, 0); pa = arriba(h, 200)
# 4x4 entre las dos (corte)
cubierta3(h, [(60, 30, 140), (60, 30, 190)], 5)
x, y = h.P(60, 30, 165); h.path(f'M{x-7},{y+3} l4,-4 l4,4 l4,-4', 'none', '#e11d48', 1.4); h.txt(x + 10, y + 4, '≈ 500', 10, 800, '#e11d48', 'start', INT)
cubierta3(h, [(42, 30, -60), (42, 30, 30)], 6); cubierta3(h, [(52, 30, -60), (52, 30, 30)], 6)
for k3, (L, xx) in enumerate((("N", 24.1), ("R", 34.3), ("S", 42.5), ("T", 50.7))):
    hilo3(h, [(42 + k3 - 1.5, 30, 30), (xx, 26, 36), (xx, 24, 40)], FAS[L], 1.6)
for j, xa in enumerate((14, 30, 50)):
    cubierta3(h, [(xa, 30, 350), (xa, 30, 310)], 3.6, "#e8e8e8")
clip_fin(h)
g(h, (4, 30, 280), X + 14, py + 92, "tablerito de ARRIBA")
g(h, (4, 30, 80), X + 14, py + 210, "tablerito de ABAJO")
g(h, (60, 30, 150), X + 14, py + 150, "4 × 4 entre los dos")
g(h, (42, 30, -30), X + 14, py + 292, "troncal: llega y sigue")
g(h, (14, 30, 345), X + 14, py + 34, "3 × 1,5 a los artefactos")
# plano: esquema de la columna con las dos cajas
cx = X + 338 + 80; y0 = py + 270; kk = 0.045
h.ln(cx - 14, y0, cx - 14, py + 36, K, 1.3); h.ln(cx + 14, y0, cx + 14, py + 36, K, 1.3)
h.ln(cx - 60, y0, cx + 80, y0, K, 1); h.txt(cx + 82, y0 + 4, "±0", 9.5)
yA = y0 - 3500 * kk * 1.25; yB = yA - 500 * kk * 1.6
for yy, L in ((yA, "C1 ABAJO"), (yB, "C2 ARRIBA")):
    h.rect(cx - 8, yy - 10, 16, 20, "#fff", K, 1.2); h.txt(cx + 22, yy + 4, L, 8.5, 700, K)
h.ln(cx, yA - 10, cx, yB + 10, K, 2.2); h.txt(cx - 18, (yA + yB) / 2 + 3, "4×4", 8.5, 700, K, "end")
h.dimV(cx - 44, yA, y0, "3500", ext=cx - 16); h.dimV(cx - 44, yB, yA, "500", ext=cx - 16)
h.path(f"M{cx-14},{py+40} l7,-7 l7,7 l7,-7 l7,7", "none", K, .7)
h.txt(X + 338 + 106, py + 292, "ESQUEMA · ALTURAS (S/E)", 10, 700, K, "middle")
h.guardar(f"{ID}_p1.svg")
# ===================== HOJA 2: pasos 2 y 3
h = pag(2)
X = 40
py = panel(h, X, 2, "Tablerito de abajo",
           ["TC-PRFV-01: N · separador · R · S · T.",
            "TC-PRFV-02 (con jabalina): PE · N unidos con peine · separador · R · S · T. El cable de la jabalina va al PE.",
            "El troncal entra y sigue: 2 cables por borne (llega y sigue), con su color: R marrón, S negro, T rojo, N celeste."],
           ojo="(*) En esquema TT el PE no se une al N: confirmar el esquema del proyecto antes de poner el peine.",
           control="Orden N · sep · R · S · T, cada fase en su borne, nada flojo.")
clip_ini(h, X, py, 330, 300)
s = 1.5; cabinet(h, s, X + 110, py + 230)
pb = abajo(h, 0)
for j, xc in enumerate((30, 50)):
    cubierta3(h, [(xc, 26, -90), (xc, 26, 4)], 9)
    for k3, L in enumerate("NRST"):
        xb = pb[L] + BW / 2 + (j - .5) * 2.2
        hilo3(h, [(xc - 4.5 + k3 * 3, 26, 4), (xc - 4.5 + k3 * 3, 26, 14), (xb, 24, 28), (xb, 24, 36)], FAS[L], 2.6)
        tif(h, (xb, 24, 36), True, "#9aa0a6")
clip_fin(h)
x, y = h.P(30, 26, -90)
g(h, (pb["N"] + 4, BD, 72), X + 14, py + 34, "N celeste")
g(h, (12, 0, 50), X + 14, py + 120, "separador")
g(h, (pb["R"] + 4, BD, 80), X + 326, py + 34, "R · S · T grises", "end")
g(h, (40, 3, 82), X + 326, py + 60, "riel DIN NS35", "end")
g(h, (30, 26, -60), X + 14, py + 290, "troncal que llega")
g(h, (50, 26, -40), X + 326, py + 290, "troncal que sigue", "end")
h.circ(X + 300, py + 200, 26, "#fff", NV, 1.2); cara_cable(h, X + 300, py + 200, 21)
g2(h, X + 278, py + 212, X + 326, py + 250, "corte del troncal", "end")
plano_tab(h, X + 338 + 112, py + 60, 1.45, "abajo", "FRENTE · TABLERITO DE ABAJO")
X = W / 2 + 18
py = panel(h, X, 3, "Tablerito de arriba",
           ["PE · PE · N unidos con el peine y, al lado, los portafusibles S y T.",
            "El plano dibuja 3 bornes en la disposición y 4 en el esquema: armá los que pide la inspección (*)."],
           ojo="El peine une PE y N: nunca una fase. Cortalo a la cantidad justa de bornes.",
           control="Peine bien calzado en PE · PE · N, portafusibles S y T firmes en el riel.")
clip_ini(h, X, py, 330, 300)
s = 1.6; cabinet(h, s, X + 110, py + 255)
pa = arriba(h, 0)
clip_fin(h)
g(h, (16, BD + 2, 66), X + 14, py + 60, "peine PE · PE · N (2027)")
g(h, (12, BD, 75), X + 14, py + 34, "PE verdes · N celeste")
g(h, (47, 62, 90), X + 326, py + 34, "portafusible S (3053)", "end")
g(h, (67, 62, 50), X + 326, py + 280, "portafusible T", "end")
g(h, (40, 3, 50), X + 14, py + 280, "riel DIN NS35")
plano_tab(h, X + 338 + 112, py + 60, 1.45, "arriba", "FRENTE · TABLERITO DE ARRIBA")
h.guardar(f"{ID}_p2.svg")
# ===================== HOJA 3: pasos 4 y 5
h = pag(3)
X = 40
py = panel(h, X, 4, "El 4×4 entre los dos",
           ["Cable 4 × 4 mm² IRAM 2178-1 (1010), unos 1 m: N al borne N de arriba, S y T a los portafusibles.",
            "La R queda de reserva: aislada, sin conectar.", "Puntera TIF 4 (2031) en las 6 puntas."],
           ojo="Entre las cajas va solo el 4 × 4, sin caño (el plano dibuja un caño PVC; en obra no se pone).",
           control="N · S · T conectados abajo y arriba, R aislada en las dos puntas.")
clip_ini(h, X, py, 330, 300)
s = .66; cabinet(h, s, X + 130, py + 276)
pb = abajo(h, 0); pa = arriba(h, 220)
xs = 60
cubierta3(h, [(xs, 30, 120), (xs, 30, 230)], 5.5)
# punta de abajo: N S T a los bornes de abajo (arriba del borne), R aislada
for k3, L in enumerate("NRST"):
    p0 = (xs - 3 + k3 * 2, 30, 120)
    if L == "R":
        hilo3(h, [p0, (xs - 1, 30, 110), (pb["R"] + 4, 28, 104)], L1, 1.8); x, y = h.P(pb["R"] + 4, 28, 104); h.circ(x, y, 2.6, "#111", "#000", .4)
    else:
        e = ent_arriba(pb[L], 0); hilo3(h, [p0, (p0[0], 30, 112), (e[0], 26, 100), (e[0], 24, 96)], FAS[L], 1.8)
# punta de arriba: N al N, S y T a los portafusibles (abajo)
for k3, L in enumerate("NST"):
    p0 = (xs - 2 + k3 * 2, 30, 230)
    tgt = ent_abajo(pa["N2"], 220) if L == "N" else ent_abajo(pa[L], 220, 17.5)
    hilo3(h, [p0, (p0[0], 30, 238), (tgt[0], 26, tgt[2] - 6), (tgt[0], 24, tgt[2] - (15 if L != "N" else 0) + 0)], FAS[L], 1.8)
clip_fin(h)
x, y = h.P(pb["R"] + 4, 28, 104)
g2(h, x, y, X + 326, py + 290, "R de reserva, aislada", "end")
g(h, (xs, 30, 175), X + 326, py + 160, "4 × 4 mm² (1 m)", "end")
g(h, (pb["N"] + 4, BD, 70), X + 14, py + 290, "N · S · T abajo")
g(h, (pa["S"] + 8, 62, 280), X + 326, py + 34, "S y T a los fusibles", "end")
# plano: esquema 4x4
px = X + 338 + 30; yA, yB = py + 240, py + 70
h.txt(px - 6, yA + 26, "ABAJO", 9, 700, K); h.txt(px - 6, yB - 18, "ARRIBA", 9, 700, K)
for i, L in enumerate("NRST"):
    xx = px + 12 + i * 36; h.rect(xx - 10, yA, 20, 18, "#fff", K, 1); h.txt(xx, yA + 13, L, 9.5, 700, K, "middle")
for i, L in enumerate(("PE", "PE", "N", "S", "T")):
    xx = px + 4 + i * 34; h.rect(xx - 13, yB, 26, 18, "#fff", K, 1); h.txt(xx, yB + 13, L if i < 3 else "F " + L, 8.5, 700, K, "middle")
for (ia, ib) in ((0, 2), (2, 3), (3, 4)):
    xa = px + 12 + ia * 36; xb = px + 4 + ib * 34; h.path(f"M{xa},{yA} V{(yA+yB)/2+10} L{xb},{(yA+yB)/2-10} V{yB+18}", "none", K, 1.2)
h.ln(px + 48, yA, px + 48, yA - 26, K, 1.2); h.rect(px + 42, yA - 34, 12, 8, "#111", K, .5); h.txt(px + 38, yA - 38, "R RESERVA", 8.5, 700, K, "end")
h.txt(px + 160, (yA + yB) / 2 + 30, "4×4", 9.5, 700, K, "middle")
h.txt(X + 338 + 106, py + 292, "ESQUEMA DEL 4 × 4", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 5, "Salidas a los artefactos",
           ["Un 3 × 1,5 mm² (6001) por artefacto: verde al PE, celeste al N y la fase al portafusible.",
            "Artefactos 1 y 2 de S, el 3 de T. Fusible: 2 A por artefacto (S con 2 artefactos = 4 A, T con 1 = 2 A)."],
           ojo="(*) Con 3 artefactos el N de arriba recibe 3 celestes + el 4 × 4 y van máximo 2 por borne: confirmar con la inspección.",
           control="Cada artefacto con PE, N y su fase; fusibles 4 A (S) y 2 A (T) puestos.")
clip_ini(h, X, py, 330, 300)
s = 1.15; cabinet(h, s, X + 110, py + 220)
pa = arriba(h, 0)
salidas = [("PE0", "S", VER, 0), ("PE1", "S", VER, 1), ("PE1", "T", VER, 2)]
for j, (pe, fase, cv, a) in enumerate(salidas):
    xc = 14 + j * 22
    cubierta3(h, [(xc, 30, 172), (xc, 30, 150)], 6.5, "#e8e8e8")
    ep = ent_arriba(pa[pe], 0); en = ent_arriba(pa["N2"], 0); ef = (pa[fase] + 8.75, 30, 104.5)
    hilo3(h, [(xc - 2, 30, 150), (xc - 2, 30, 140), (ep[0] + (a - 1) * 1.6, 24, 100), (ep[0] + (a - 1) * 1.6, 24, 96)], VER, 2)
    hilo3(h, [(xc, 30, 150), (xc, 30, 138), (en[0] + (a - 1) * 1.6, 24, 100), (en[0] + (a - 1) * 1.6, 24, 96)], NC, 2)
    hilo3(h, [(xc + 2, 30, 150), (xc + 2, 30, 142), (ef[0] + (a % 2) * 2.5, 32, 112), (ef[0] + (a % 2) * 2.5, 32, 106)], L1, 2)
# el 4x4 que llega por abajo
cubierta3(h, [(60, 30, -60), (60, 30, 10)], 5.5)
for k3, L in enumerate("NST"):
    tgt = ent_abajo(pa["N2"], 0) if L == "N" else ent_abajo(pa[L], 0, 17.5)
    hilo3(h, [(58 + k3 * 2, 30, 10), (58 + k3 * 2, 30, 16), (tgt[0], 26, 22), (tgt[0], 24, 25 if L != "N" else 40)], FAS[L], 1.8)
clip_fin(h)
for j in range(3):
    x, y = h.P(14 + j * 22, 30, 172); h.circ(x, y - 12, 9, "#fff", NV, 1.2); h.txt(x, y - 8, str(j + 1), 11, 800, NV, "middle", INT)
x, y = h.P(14, 30, 172); h.txt(x - 14, y - 8, "artefactos", 11.5, 700, NV, "end", INT)
g(h, (pa["S"] + 8, 62, 70), X + 326, py + 150, "S: 4 A (art. 1 y 2)", "end")
g(h, (pa["T"] + 12, 62, 50), X + 326, py + 260, "T: 2 A (art. 3)", "end")
g(h, (60, 30, -40), X + 14, py + 290, "4 × 4 desde abajo")
# plano: tabla de fusibles
px = X + 346
h.txt(px, py + 50, "FUSIBLES 10×38 gG", 10, 700, K)
h.tabla(px, py + 60, [(66, "l", False), (60, "c", True), (60, "c", True)],
        [("ARTEF.", "S", "T"), ("Simple", "2 A", "—"), ("Doble", "2 A", "2 A"), ("Triple", "4 A", "2 A"), ("Cuádruple", "4 A", "4 A")], rowh=22)
h.txt(px, py + 192, "2 A por artefacto", 9.5, 400, K)
h.txt(px, py + 208, "2 A = 3017 · 4 A = 3073", 9.5, 400, K)
h.txt(px, py + 230, "3 × 1,5 por artefacto:", 9.5, 700, K)
h.txt(px, py + 246, "verde → PE · celeste → N", 9.5, 400, K)
h.txt(px, py + 262, "fase → portafusible", 9.5, 400, K)
h.txt(X + 338 + 106, py + 292, "CUADRO DE FUSIBLES", 10, 700, K, "middle")
h.guardar(f"{ID}_p3.svg")
# ===================== HOJA 4: paso 6 + así queda
h = pag(4)
X = 40
py = panel(h, X, 6, "TIFF, apriete y prueba de tirón",
           ["Cada punta con su puntera TIFF de la misma sección; doble donde el circuito sigue a la otra columna. Máximo 2 cables por borne.",
            "Tirá suave de cada cable: ninguno tiene que salirse. Tapa puesta, sin cobre a la vista."],
           ojo="La puntera sigue el calibre del cable, no la bornera (la BPN es siempre de 6).",
           control="Tableritos armados como el TC-PRFV-01 (o 02), nada flojo. Foto: «Caja de columna» con su N°.")
clip_ini(h, X, py, 330, 300)
s = 2.6; cabinet(h, s, X + 130, py + 262)
h.BOX(-14, 26, 0, 7.5, 2, 37, "url(#galv)", "#c3ccd4", "#8d98a2", "#444", .7)
h._s_bak = s
borne(h, 0, GRIS, -40, "S")
# cable que entra por arriba con su TIF
p = (BW / 2, 24, 50)
punta_cu(h, (p[0], 24, 50), (p[0], 24, 60), 6.5)
linea3(h, [(p[0], 24, 60), (p[0], 24, 70)], "#f08a24", 11, 'stroke-linecap="butt"')
hilo3(h, [(p[0], 24, 70), (p[0], 24, 84), (p[0] + 6, 24, 92), (p[0] + 24, 24, 94)], L2, 9)
# cuerda de hilos en la punta de arriba (corte)
clip_fin(h)
x, y = h.P(p[0], 24, 66)
h.circ(X + 280, py + 62, 30, "#fff", NV, 1.2)
for i, (dx, dy) in enumerate([(0, 0)] + [(10 * math.cos(math.radians(60 * j)), 10 * math.sin(math.radians(60 * j))) for j in range(6)]):
    h.circ(X + 280 + dx, py + 62 + dy, 5, "#e7a35a", "#7a4512", .5)
h.ln(x + 8, y - 4, X + 252, py + 72, NV, .8, 'stroke-dasharray="3 2"')
h.txt(X + 280, py + 106, "hilos en la TIF", 11, 700, NV, "middle", INT)
# flecha de tirón
xa, ya = h.P(p[0] + 24, 24, 94)
h.ln(xa + 6, ya, xa + 44, ya, "#e11d48", 2.4); h.path(f"M{xa+50},{ya} l-9,-5 v10 z", "#e11d48", "#e11d48", 1)
h.txt(xa + 26, ya + 20, "tirá suave", 12, 800, "#e11d48", "middle", INT)
# destornillador al tornillo de arriba
xs_, ys_ = h.P(BW / 2, BD, 41)
h.ln(xs_ + 4, ys_ + 2, xs_ + 70, ys_ + 36, "#888", 3.4); h.ln(xs_ + 40, ys_ + 20, xs_ + 92, ys_ + 47, "#e11d48", 10)
g(h, (BW / 2, 24, 55), X + 14, py + 120, "puntera TIF (Cu)")
g(h, (BW / 2, 24, 65), X + 14, py + 60, "collar (TIF 4: naranja)")
g2(h, xs_ + 2, ys_ + 1, X + 14, py + 290, "apretá el tornillo firme")
chk(h, X + 300, py + 270); h.txt(X + 284, py + 275, "no se mueve", 12, 800, "#14632b", "end", INT)
# plano: D1 puntera TIF dentro del borne (corte)
cx, cy = X + 338 + 100, py + 60; k = 5
h.rect(cx - 20, cy + 60, 40, 150, "url(#ANSI37)", K, 1)
h.rect(cx - 7, cy + 60, 14, 70, "#fff", K, .8)
h.rect(cx - 4, cy + 70, 8, 50, "url(#cuH)", K, .8)
h.rect(cx - 7.5, cy + 30, 15, 30, "#fff", K, 1); h.rect(cx - 5, cy - 20, 10, 50, "#fff", K, 1)
h.ln(cx + 26, cy + 92, cx + 6, cy + 92, K, .6); h.path(f"M{cx+30},{cy+80} h20 v24 h-20 z", "#fff", K, .8); h.txt(cx + 54, cy + 96, "TORNILLO", 8, 700, K)
h.dimV(cx - 30, cy + 70, cy + 120, "10", ext=cx - 6)
h.txt(cx + 14, cy + 44, "COLLAR", 8, 700, K); h.txt(cx + 12, cy + 0, "CABLE", 8, 700, K)
h.txt(cx - 26, cy + 160, "BORNE", 8, 700, K, "end")
h.txt(X + 338 + 106, py + 278, "D1 · TIF EN EL BORNE (S/E)", 10, 700, K, "middle")
h.txt(X + 338 + 106, py + 292, "máx. 2 cables por borne", 9, 400, K, "middle")
X = W / 2 + 18
asi_queda(h, X, "k4_caja_3d.png", "TC-PRFV-01 / TC-PRFV-02", "Montaje de columna PRFV y luminaria",
          "Tableritos 80 × 130 armados como el TC-PRFV-01 (o el 02 si lleva jabalina), 4 × 4 con N · S · T y la R de reserva, artefactos 1 y 2 de S y 3 de T, TIFF en todas las puntas, nada flojo. Foto: «Caja de columna» con su N°.",
          ["Tablerito de arriba: la disposición dibuja 3 bornes (PE · PE · N) y el esquema 4. Confirmar.",
           "El tablerito 80 × 130 no tiene código en el pañol."], alto=300)
h.guardar(f"{ID}_p4.svg")
print("ok")
