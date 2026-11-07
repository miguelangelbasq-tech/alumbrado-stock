"""Hoja del tablerito de columna metálica (AP-CC-014 hasta Ø114 · AP-CC-015 desde Ø140). La llaman ap_cc_014.py y ap_cc_015.py.
Datos: fichas AP-CC-014/015/001/004, AP-PL-002, AP-C-005, AP-TC-005; calculadora v130 (bpnMetDef, cajas: 1×6 0,50 m por caja, 1×2,5 0,30 m
por portafusible, 2028/2030/2032/2049); FICHAS_TEC (fondo 3011 230×95×2, BPN-06, portafusible 10×38 DF101); ETG (espesor ≥ 4 mm desde Ø90)."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
import tabmet as T
from tabmet import f


def hoja(c, salida):
    h = Hoja(); D = c["D"]; E = 4.0; R = D / 2; RI = R - E
    L = T.armado(3, "TN-S"); VW, VH = 80, 250
    # ============ VISTA FRONTAL ============
    h.titulo(40, 62, "D1 - TABLERITO: VISTA FRONTAL", "ESC. 1:1,5 - TAPA Y ACRILICO SACADOS - TRIPLE, TN-S")
    k = 1.4; X, Y = 130, 160
    pos = T.frente(h, X, Y, k, L)
    W, H = T.PL_W * k, T.PL_H * k; cx = pos["cx"]
    # cables: 3×1,5 salen por arriba, troncal entra por abajo, 1×10 al bulón
    for i in range(3):
        xx = cx - 22 + i * 22; T.cable2(h, f"M{xx},{Y-22} L{xx},{Y+6}", 5)
    h.txt(cx + 40, Y - 6, "3×1,5 A LOS ARTEF.", 9.5, 700)
    for i in range(2):
        xx = cx - 38 + i * 12; T.cable2(h, f"M{xx},{Y+H+34} L{xx},{Y+H-46}", 6)
    h.txt(X - 4, Y + H + 48, "TRONCAL (LLEGA Y SIGUE)", 9.5, 700, K, "end" if False else "start")
    bx, by = pos["bulon"]; h.circ(bx, by, 7, "#fff", K, 1.1); h.path(f"M{bx-4},{by-4} l8,8 M{bx+4},{by-4} l-8,8", "none", K, .7)
    T.cable2(h, f"M{bx+6},{by+3} Q{bx+40},{by+20} {bx+44},{Y+H+34}", 3)
    h.txt(bx + 50, Y + H + 30, "1×10 V/A (PAT)", 9, 400)
    # cotas
    h.dimH(Y - 30, X, X + W, f"{T.PL_W}", ext=Y - 2)
    h.dimV(X - 22, Y, Y + H, f"{T.PL_H}", ext=X - 2)
    ry = pos["riel"][1]; h.dimV(X + W + 20, ry, ry + T.RIEL_L * k, f"RIEL {T.RIEL_L}", ext=cx + 20)
    h.dimV(X + W + 44, Y + H - 18 * k, Y + H, "18 (*)", ext=bx + 8, c=OR)
    pf0 = pos["pf"][0]; h.dimH(Y + 22, cx - T.PF_A / 2 * k, cx + T.PF_A / 2 * k, "79,5", ext=pf0[1] - pf0[2] / 2)
    # línea de corte A-A (horizontal por los portafusibles) y B-B (vertical por el eje)
    ya = pos["pf"][1][1]
    for xx, s in ((X - 30, "A"), (X + W + 70, "A")):
        h.ln(xx - 8, ya, xx + 8, ya, K, 1.8); h.txt(xx, ya - 6, s, 12, 700, K, "middle")
    h.ln(X - 22, ya, X + W + 62, ya, K, .5, h.EJE)
    # globos
    gl = [("1", (X + 8, Y + 40), (62, 150)), ("2", (pos["riel"][0] + 3, ry + 8), (62, 196)), ("3", (cx - 30, pos["pf"][0][1]), (62, 244)),
          ("6", (cx - 20, pos["gris"][1][1]), (62, 300)), ("7", (cx - 20, pos["cel"][1][1]), (62, 340)), ("8", (cx - 20, pos["ver"][0][1]), (62, 380)),
          ("9", (cx + 30, pos["sep"][0][1]), (62, 420)), ("10", (cx + 18, pos["tope"][0][1]), (380, 205)), ("11", (bx + 5, by - 5), (62, 466)),
          ("4", (cx + 36, pos["pf"][2][1]), (380, 250)), ("5", (cx + 8, pos["pf"][1][1] + 2), (380, 292))]
    for n, a, g in gl: h.globo(n, a[0], a[1], g[0], g[1])
    h.txt(X + W / 2, Y + H + 70, "DE ARRIBA ABAJO: TOPE · PF R-S-T · BPN GRIS R-S-T", 9.5, 700, K, "middle")
    h.txt(X + W / 2, Y + H + 84, "· SEPARADOR · BPN CELESTE ×3 · BPN VERDE ×2 · TOPE", 9.5, 700, K, "middle")
    h.txt(X + W / 2, Y + H + 98, f"LARGO OCUPADO {f(T.largo(L),1)} DE {T.RIEL_L} DE RIEL (*)", 9, 400, OR, "middle")
    # ============ CORTE A-A (planta por los portafusibles) ============
    h.titulo(400, 62, "CORTE A-A", f"ESC. 1:2 - PLANTA, Ø{D}")
    k2 = 1.25 if D > 130 else 1.45; cx2, cy2 = 525, 140 + R * k2 + 20
    a_v = math.degrees(math.asin((VW / 2) / R))
    # pared de la columna, abierta en la ventana (frente = abajo en la hoja)
    def arco(r, a0, a1):
        return [(cx2 + r * k2 * math.cos(math.radians(a)), cy2 + r * k2 * math.sin(math.radians(a))) for a in [a0 + (a1 - a0) * i / 60 for i in range(61)]]
    o = arco(R, 90 + a_v, 450 - a_v); ii = arco(RI, 450 - a_v, 90 + a_v)
    h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in o + ii) + " Z", K, K, .8)
    h.ln(cx2, cy2 - R * k2 - 16, cx2, cy2 + R * k2 + 34, K, .5, h.EJE)
    # fondo: cuerda a la distancia d
    d = math.sqrt(RI ** 2 - (T.PL_W / 2) ** 2)
    yf = cy2 - d * k2
    h.rect(cx2 - T.PL_W / 2 * k2, yf, T.PL_W * k2, T.PL_E * k2 + 1, "url(#ANSI31)", K, .8)
    h.rect(cx2 - T.RIEL_W / 2 * k2, yf + 3, T.RIEL_W * k2, T.RIEL_H * k2, "#fff", K, .7)
    h.rect(cx2 - T.PF_A / 2 * k2, yf + 3 + T.RIEL_H * k2, T.PF_A * k2, T.PF_C * k2, "#fff", K, .9)
    h.rect(cx2 - 19 * k2, yf + 3 + T.RIEL_H * k2 + 10 * k2, 38 * k2, (T.PF_C - 10) * k2, "url(#ANSI37)", K, .5)
    # tapa (frente)
    yt = cy2 + R * k2 * math.cos(math.radians(a_v)) + 4
    h.ln(cx2 - (VW / 2 + 14) * k2, yt, cx2 + (VW / 2 + 14) * k2, yt, K, 2.2); h.txt(cx2 + (VW / 2 + 16) * k2, yt + 4, "TAPA", 9, 700)
    h.dimH(cy2 - R * k2 - 22, cx2 - R * k2, cx2 + R * k2, f"Ø{D}", ext=cy2 - 2)
    h.dimV(cx2 + R * k2 + 24, yf, yf + (3 + T.RIEL_H * 1 + T.PF_C) * k2, "61 + 7,5", ext=cx2 + T.PF_A / 2 * k2 + 2)
    h.dimH(yt + 30, cx2 - VW / 2 * k2, cx2 + VW / 2 * k2, "VENTANA 80 (*)", ext=yt, c=OR)
    h.txt(cx2 - R * k2 - 6, cy2 + R * k2 + 2, f"e = {f(E)} MIN.", 9, 400, K, "end")
    for xx, s in ((cx2, "B"),):
        for yy in (cy2 - R * k2 - 40, cy2 + R * k2 + 46):
            h.ln(xx - 8, yy, xx + 8, yy, K, 1.8); h.txt(xx + 12, yy + 4, s, 12, 700)
    h.txt(cx2, yt + 84, f"LIBRE {f(RI + d,1)} ≥ 2 + 7,5 + 61 = 70,5", 9, 400, K, "middle")
    # ============ CORTE B-B (lateral, vertical por el eje) ============
    h.titulo(680, 62, "CORTE B-B", "ESC. 1:3 - LATERAL")
    k3 = .95; X3 = 715; Y3 = 140; zc = Y3 + 165
    wall_b = X3; wall_f = X3 + (2 * R) * k3     # pared de atrás y de adelante
    top, bot = Y3, Y3 + 330
    for xw in (wall_b, wall_f - E * k3):
        h.rect(xw, top, E * k3 + .5, bot - top, K, K, 0)
    # ventana en la pared de adelante
    h.rect(wall_f - E * k3 - .2, zc - VH / 2 * k3, E * k3 + 1.2, VH * k3, "#fff", "none", 0)
    h.ln(wall_f + 6, zc - VH / 2 * k3, wall_f + 6, zc + VH / 2 * k3, K, 2.0)   # tapa
    xf = wall_b + (E + (RI - d)) * k3
    h.rect(xf, zc - T.PL_H / 2 * k3, T.PL_E * k3 + 1, T.PL_H * k3, "url(#ANSI31)", K, .7)
    h.rect(xf + 2, zc - T.RIEL_L / 2 * k3, T.RIEL_H * k3, T.RIEL_L * k3, "#fff", K, .6)
    z = zc - T.largo(L) / 2 * k3
    for tp, lab in L:
        p = T.paso(tp) * k3; dd = {"pf": T.PF_C, "tope": 30, "sep": T.B_C + 6}.get(tp, T.B_C)
        h.rect(xf + 2 + T.RIEL_H * k3, z, dd * k3, p, "#fff", K, .5); z += p
    bz = zc + (T.PL_H / 2 - 18) * k3
    h.rect(wall_b - 8, bz - 3, xf - wall_b + 14, 6, "#fff", K, .7); h.rect(xf + 4, bz - 6, 5, 12, "#fff", K, .6)
    for yy in (top, bot): h.path(f"M{wall_b-8},{yy} l{2*R*k3/2+8},0 l5,-6 l5,12 l5,-6 l{2*R*k3/2},0", "none", K, .6)
    h.dimV(wall_f + 26, zc - VH / 2 * k3, zc + VH / 2 * k3, "250 (*)", ext=wall_f + 8, c=OR)
    h.dimV(wall_b - 18, zc - T.PL_H / 2 * k3, zc + T.PL_H / 2 * k3, "230", ext=xf - 2)
    h.dimH(bot + 24, wall_b, wall_f, f"Ø{D}", ext=bot + 4)
    h.txt(wall_b - 30, bz + 18, "BULON PAT", 9, 700, K, "end"); h.ln(wall_b - 28, bz + 14, wall_b - 4, bz, K, .5)
    h.txt(wall_b + R * k3, bot + 44, "CAJA A 2,50 m MIN. DEL PISO", 9, 400, G, "middle")
    # ============ ESQUEMA DE CONEXIÓN ============
    T.multifilar(h, 40, 610, "TN-S", 3, titulo=True, sub="S/E - TRIPLE · CADA ARTEFACTO A SU FASE (AEA 90364)")
    # ============ D2 CABLES INTERNOS (HOJA C) ============
    h.titulo(560, 610, "D2 - CABLES INTERNOS (HOJA C)", "S/E - CON SUS TERMINALES")
    def tira(x, y, largo, col, sec, t1, t2, cod1, cod2, txt):
        h.rect(x, y - 5, largo, 10, col, K, .7)
        h.rect(x - 22, y - 3, 22, 6, "url(#cobre)", K, .5)
        h.rect(x + largo, y - 3, 20, 6, "url(#cobre)", K, .5)
        if t1 == "ojal":
            h.circ(x - 30, y, 9, "url(#cobre)", K, .7); h.circ(x - 30, y, 4, "#fff", K, .6)
        h.txt(x + largo / 2, y - 10, txt, 9, 700, K, "middle"); h.txt(x + largo / 2, y + 20, f"{sec} · {cod1} / {cod2}", 9, 400, G, "middle")
    tira(608, 668, 170, "#2e9e4f", "1×6 V/A · 0,50 m", "ojal", "tif", "OJAL 2049", "TIF 6 2032", "BULON PAT → BPN VERDE")
    h.rect(608, 666, 170, 4, "#e6c229", "none", 0)
    tira(608, 726, 170, "#7b3f1d", "1×2,5 · 0,30 m C/U", "tif", "tif", "TIF 2,5 2030", "TIF 2,5 2030", "BPN GRIS → PORTAFUSIBLE")
    tira(608, 786, 170, "#1a1a1a", "3×1,5 (6001)", "tif", "tif", "TIF 1,5 2028", "AL ARTEF.", "PORTAFUSIBLE → LUMINARIA")
    # ============ CÓMPUTO ============
    rows = [("VINCULO", "ESQ.", "PF", "GRIS", "CEL.", "VERDE", "FUS. 2 A")]
    for t in (1, 2, 3):
        for e in ("TN-S", "TT"):
            dd = T.met_def(t, e); rows.append(({1: "SIMPLE", 2: "DOBLE", 3: "TRIPLE"}[t], e, str(dd["pf"]), str(dd["gris"]), str(dd["cel"]), str(dd["ver"]), str(t)))
    h.tabla(40, 860, [(70, "l", False), (46, "c", False), (36, "c", True), (44, "c", True), (40, "c", True), (48, "c", True), (60, "c", True)], rows, rowh=17,
            titulo="ARMADO POR VINCULO (CALCULADORA)")
    rows2 = [("POR CAJA (TRIPLE TN-S)", "CANT.", "CALCULO"),
             ("1×6 V/A BULON → BPN", "0,50 m", "0,50 POR CAJA"), ("1×2,5 BPN → PF", "0,90 m", "0,30 × 3 PF"),
             ("TIF 2,5 (2030)", "6", "2 × 3 PF"), ("TIF 1,5 (2028)", "3", "1 POR PF (SALIDA)"),
             ("OJAL 6 (2049) + TIF 6 (2032)", "1 + 1", "PUNTAS DEL 1×6"), ("BPN VERDE", "2", "⌈(1 + 3) / 2⌉, 2 CABLES/BORNE")]
    h.tabla(400, 860, [(160, "l", False), (56, "c", True), (220, "l", False)], rows2, rowh=17, titulo="COMPUTO POR CAJA")
    h.notas(40, 1030, c["notas"])
    tres_d(h, c, D, L)
    # ============ LISTA ============
    h.tabla(890, 608, [(40, "c", False), (470, "l", False), (100, "c", True), (140, "c", False)], c["lista"], rowh=19.5,
            titulo=c["titLista"], colores=lambda i, j, t: OR if ("(*)" in t or t in ("A VINCULAR", "SIN CODIGO")) else K)
    h.rotulo(890, h.H - 150, 750, c["id"], c["t1"], c["t2"], c["sub"], "1:1,5 · 1:2", "1:3, 3D S/E", fecha="07/11/2026")
    h.guardar(salida)


def tres_d(h, c, D, L):
    # ============ 3D ============
    D = c["D"]; E = 4.0; R = D / 2; RI = R - E; VW, VH = 80, 250
    d = math.sqrt(RI ** 2 - (T.PL_W / 2) ** 2)
    h.titulo(880, 62, c["tit3d"], "IZQ.: LA COLUMNA CORTADA A LA ALTURA DE LA CAJA · DER.: EL TABLERITO SACADO, CON LAS PIEZAS EN SU LUGAR")
    ac = 62
    s1 = .95 if D <= 114 else (.8 if D <= 140 else .66)
    h.iso(s1, 1000, 350)
    z0, z1 = -190, 190
    T.cyl(h, 0, 0, RI, 100, 350, z0, z1, "#8f969b", inner=True)             # interior del fondo
    # tablerito dentro (fondo mirando a +x)
    xpl = -d
    T.tab3d(h, xpl, 0, 0, L)
    tl = T.largo(L) / 2
    for i, col in enumerate(("#7b3f1d", "#1a1a1a", "#c62828")):
        p0 = h.P(xpl + 40, -12 + i * 12, tl - 6 - 17.5 * i); p1 = h.P(xpl + 12, -8 + i * 8, z1)
        h.path(f"M{p0[0]:.1f},{p0[1]:.1f} Q{p1[0]+6:.1f},{p0[1]-30:.1f} {p1[0]:.1f},{p1[1]:.1f}", "none", col, 1.8)
    for i in range(2):
        p0 = h.P(xpl + 40, -30 + i * 9, -tl + 10); p1 = h.P(xpl + 14, -20 + i * 9, z0)
        h.path(f"M{p0[0]:.1f},{p0[1]:.1f} L{p1[0]:.1f},{p1[1]:.1f}", "none", "#151515", 4)
    # pared de adelante con la ventana (ángulos -80..170 visibles)
    T.cyl(h, 0, 0, R, -80, -ac, z0, z1, "#7d8488")
    T.cyl(h, 0, 0, R, ac, 170, z0, z1, "#7d8488")
    T.cyl(h, 0, 0, R, -ac, ac, VH / 2, z1, "#7d8488"); T.cyl(h, 0, 0, R, -ac, ac, z0, -VH / 2, "#7d8488")
    T.ring(h, 0, 0, R, RI, z1, -80, 170, "#c8cdd1"); T.ring(h, 0, 0, R, RI, -VH / 2, -ac, ac, "#c8cdd1")
    pz = h.P(0, 0, z0); h.ln(pz[0], pz[1] + 4, pz[0], pz[1] + 20, "#555", .5, h.EJE)
    # tapa sacada al costado
    h.F3([(R + 40, -R - 40, -VH / 2 - 10), (R + 40, -R - 70 - VW, -VH / 2 - 10), (R + 40, -R - 70 - VW, VH / 2 + 10), (R + 40, -R - 40, VH / 2 + 10)], "#8a9094", "#333", .8)
    q = h.P(R + 40, -R - 55 - VW / 2, 30); h.a(f'<path d="M{q[0]:.1f},{q[1]-14:.1f} l12,22 h-24 z" fill="#ffd400" stroke="#111" stroke-width=".8"/>')
    h.txt(q[0], q[1] + 4, "!", 11, 700, "#111", "middle")
    # tablerito grande
    h.iso(1.55, 1330, 330)
    p2 = T.tab3d(h, 0, 0, 0, L)
    ztop = T.largo(L) / 2
    # cables en el 3D: 3×1,5 suben, troncal abajo
    for i, col in enumerate(("#7b3f1d", "#1a1a1a", "#c62828")):
        a = h.P(T.RIEL_H + T.PF_C - 4, -14 + i * 14, ztop - 8 - 17.5 * i); b = h.P(T.RIEL_H + 40, -14 + i * 14, 140)
        h.path(f"M{a[0]:.1f},{a[1]:.1f} C{a[0]+10:.1f},{a[1]-40:.1f} {b[0]:.1f},{b[1]+40:.1f} {b[0]:.1f},{b[1]:.1f}", "none", col, 2.4)
    for i in range(2):
        a = h.P(T.RIEL_H + 10, -38 + i * 10, -140); b = h.P(T.RIEL_H + 30, -38 + i * 10, -70)
        h.path(f"M{a[0]:.1f},{a[1]:.1f} L{b[0]:.1f},{b[1]:.1f}", "none", "#151515", 6)
    bp = h.P(*p2["bulon"]); gv = h.P(T.RIEL_H + T.B_C, 20, -ztop + 20)
    h.path(f"M{bp[0]:.1f},{bp[1]:.1f} Q{bp[0]+40:.1f},{bp[1]-10:.1f} {gv[0]:.1f},{gv[1]:.1f}", "none", "#2e9e4f", 2.6)
    h.path(f"M{bp[0]:.1f},{bp[1]:.1f} Q{bp[0]+40:.1f},{bp[1]-10:.1f} {gv[0]:.1f},{gv[1]:.1f}", "none", "#e6c229", 1, 'stroke-dasharray="4 4"')
    gy = 120
    def g(n, p, t):
        nonlocal gy; h.g3(n, p, 1500, gy, t); gy += 38
    lab = c.get("glob3d", {})
    zz = lambda tp, i=0: p2[tp][i] if tp in p2 else 0
    g("12", (T.RIEL_H + 30, 8, 140), "3×1,5 A LOS ARTEF.")
    g("1", (0, 30, 95), "FONDO 230×95 (3011)")
    g("3", (T.RIEL_H + T.PF_C, 10, zz("pf", -1)), lab.get("pf", "PORTAFUSIBLES R-S-T"))
    g("2", (T.RIEL_H, 12, 55), "RIEL DIN NS35")
    g("6", (T.RIEL_H + T.B_C, 18, zz("gris", -1)), lab.get("gris", "BPN GRIS R-S-T"))
    g("9", (T.RIEL_H + T.B_C + 6, 22, zz("sep")), "SEPARADOR")
    g("7", (T.RIEL_H + T.B_C, 18, zz("cel", 1)), "BPN CELESTE N")
    g("8", (T.RIEL_H + T.B_C, 18, zz("ver", 0)), "BPN VERDE PE")
    g("11", p2["bulon"], lab.get("bulon", "BULON PAT (BRONCE)"))
    g("13", (T.RIEL_H + 20, -33, -105), "TRONCAL (2)")
    h.txt(885, 588, f"COLUMNA Ø{D} · e ≥ 4 mm · CAJA A 2,50 m MIN. DEL PISO ·", 10.5, 700, NV, "start", INT)
    h.txt(1268, 588, c.get("nota3d", "VENTANA 80 × 250 (*) · TAPA SACADA"), 10.5, 700, OR, "start", INT)
