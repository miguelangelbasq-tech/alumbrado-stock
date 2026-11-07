"""Generador de las hojas AP-CC-001 (pie hasta Ø114) y AP-CC-004 (pie Ø140 y Ø168): caja de conexión de la columna metálica.
Datos: fichas Normas AP-CC-001/004/014/015, AP-C-005 (tipos, Ø del pie), ETG (ventana 150x76, caja a 2500, bulón PAT),
calculadora (bpnMetDef, riel 14 cm + 2 tornillos 6x3/8, puentes 1x2,5 y 1x6, punteras, ojal de goma Ø50, acrílico),
FICHAS_TEC (BPN, portafusible 10x38, riel, caja 6002, fondos). Lo que no está va en naranja con (*)."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT, CORES
from _prfv import sh, MAR, NEG, ROJ, CEL, VER, GRI, CELB

FASES = [("R", MAR), ("S", NEG), ("T", ROJ)]


def gen(var):
    big = var == "004"
    D = 140 if big else 114
    n = 3 if big else 2                      # artefactos del ejemplo
    ver = math.ceil((1 + n) / 2)
    PL = "AP-CC-004" if big else "AP-CC-001"
    h = Hoja()
    # piezas en el riel vertical, de arriba hacia abajo (orden a confirmar)
    pila = [("pf", i) for i in range(n)] + [("g", i) for i in range(n)] + [("sep", 0)] + [("c", i) for i in range(n)] + [("v", i) for i in range(ver)]
    ALT = {"pf": 17.5, "g": 8.2, "c": 8.2, "v": 8.2, "sep": 2.0}
    tot = sum(ALT[t] for t, _ in pila)
    PLH, PLW, RIEL = 230, 95, 140             # chapa (*) y riel (dato: 14 cm)

    # ================= ELEVACION DEL PIE (con corte) =================
    h.titulo(40, 62, "ELEVACION DEL PIE", "S/E - CON CORTE - COTAS EN mm")
    k = 0.14; ex = 120; hw = D / 2 * k * 1.6
    def Y(z): return 130 + (3100 - z) * k if z >= 2300 else 266 + (600 - z) * k
    yP = Y(0)
    h.rect(40, yP, 160, Y(-800) - yP + 6, "url(#EARTH)", K, 0); h.ln(40, yP, 200, yP, K, 1.6)
    for z0, z1 in ((2300, 3100), (-800, 600)):
        h.rect(ex - hw, Y(z1), 2 * hw, Y(z0) - Y(z1), "#fff", K, 1.4)
    for zz in (2300, 600):
        yy = Y(zz); h.path(f"M{ex-hw-8},{yy} l8,-4 l{hw},8 l{hw},-8 l8,4", "none", K, .8)
    h.path(f"M{ex-hw-8},{Y(-800)} l8,-4 l{hw},8 l{hw},-8 l8,4", "none", K, .8)
    h.ln(ex, 120, ex, Y(-800) + 8, K, .4, h.EJE)
    h.nivel(176, yP, "±0,00 NPT")
    # ventana de acometida 150 x 76, centro a 300 bajo el piso
    vw = 76 * k * 1.6
    h.rect(ex - vw / 2, Y(-225), vw, Y(-375) - Y(-225), "#111", K, .6)
    h.dimV(ex - hw - 16, yP, Y(-300), "≥300", ext=ex - vw / 2)
    h.dimV(ex + hw + 14, Y(-225), Y(-375), "150", ext=ex + vw / 2)
    # caño PVC Ø75 a la zanja (6004)
    h.rect(ex + hw, Y(-300) - 6, 98, 12, "#fff", K, .9); h.txt(ex + hw + 102, Y(-300) + 4, "PVC Ø75 (6004) →", 9, 700)
    # caja: base a ≥2500 del piso (alto a confirmar)
    zc0, zc1 = 2500, 2750
    h.rect(ex - hw + 2, Y(zc1), 2 * hw - 4, Y(zc0) - Y(zc1), "#fff", K, 1.2)
    h.path(f"M{ex-4},{Y(zc1)+5} l4,-7 l4,7 z", "#f2c500", K, .5)
    h.dimV(ex - hw - 40, yP, Y(zc0), "≥2500", ext=ex - hw - 2)
    h.dimV(ex + hw + 14, Y(zc1), Y(zc0), "(*)", ext=ex + hw + 2, c=OR)
    # cables ocultos dentro de la columna: troncal y V/A de la jabalina suben de la ventana a la caja
    for dx, c in ((-2, K), (2, K)):
        h.ln(ex + dx, Y(-300), ex + dx, Y(600), c, .9, h.OCULTA); h.ln(ex + dx, Y(2300), ex + dx, Y(zc0), c, .9, h.OCULTA)
    h.txt(206, Y(-300) + 30, "TRONCAL Y V/A", 9, 700); h.txt(206, Y(-300) + 42, "ENTRAN POR", 9, 400); h.txt(206, Y(-300) + 54, "LA VENTANA", 9, 400)
    h.txt(176, 252, "SUBEN POR ADENTRO", 9, 400)
    # línea de corte A-A por la caja
    za = (zc0 + zc1) / 2
    for xx in (ex - hw - 22, ex + hw + 34):
        h.ln(xx, Y(za) - 8, xx, Y(za) + 8, K, 2); h.txt(xx + (-8 if xx < ex else 4), Y(za) - 12, "A", 13, 700)
    h.ln(ex - hw - 22, Y(za), ex + hw + 34, Y(za), K, .6, h.EJE)
    h.txt(ex + hw + 6, Y(2950), f"Ø{D}", 9.5, 700)
    h.globo("1", ex + hw - 3, Y(zc1) + 8, 230, 150)

    # ================= CORTE A-A (por la caja) =================
    h.titulo(290, 62, "CORTE A-A (POR LA CAJA)", "ESC. 1:3 APROX. - MIRANDO HACIA ABAJO")
    kc = 1.25; cx, cy = 400, 250; R = D / 2 * kc; e = 3 * kc
    h.circ(cx, cy, R, "url(#ANSI31)", K, 1.4); h.circ(cx, cy, R - e, "#fff", K, .9)
    # abertura de la caja del lado de abajo (hacia el que mira)
    aw = 44 * kc
    h.rect(cx - aw, cy + R - e - 2, 2 * aw, e + 4, "#fff", "#fff", 0)
    h.ln(cx - aw, cy + R - e - 1, cx - aw, cy + R + 1, K, 1); h.ln(cx + aw, cy + R - e - 1, cx + aw, cy + R + 1, K, 1)
    h.rect(cx - aw - 6, cy + R + 1, 2 * aw + 12, 4, "#fff", K, 1.1)        # tapa
    h.txt(cx, cy + R + 22, "TAPA CON JUNTA", 9, 700, K, "middle")
    # chapa del tablerito, bulón PAT al fondo, riel y borne
    yp = cy - 22 * kc
    h.rect(cx - PLW / 2 * kc, yp - 2 * kc, PLW * kc, 2 * kc, "url(#ANSI31)", K, .9)
    h.rect(cx - 5 * kc, cy - (R - e) + 1, 10 * kc, yp - 2 * kc - (cy - (R - e)) - 1, "url(#cuH)", K, .9)    # bulón (*)
    h.rect(cx - 9 * kc, yp - 2 * kc - 6 * kc, 18 * kc, 6 * kc, "#fff", K, .8)                         # tuerca
    h.rect(cx - 17.5 * kc, yp, 35 * kc, 7.5 * kc, "url(#ANSI31)", K, .8)                            # riel (visto de canto)
    h.rect(cx - 39.75 * kc, yp + 7.5 * kc, 79.5 * kc, 53.5 * kc, "#fff", K, 1.1)                     # portafusible (61 total)
    h.rect(cx - 25 * kc, yp + 7.5 * kc, 50 * kc, 45.5 * kc, "url(#ANSI37)", K, .8)                  # borne (53 total)
    h.dimH(cy - R - 12, cx - R, cx + R, f"Ø{D}", ext=cy - 4)
    h.dimV(cx + R + 16, yp, yp + 61 * kc, "61", ext=cx + 40 * kc)
    h.dimH(cy + R + 34, cx - aw, cx + aw, "ABERTURA S/ PLANO (*)", c=OR, dy=13)
    h.globo("2", cx - PLW / 2 * kc + 6, yp - 1, 300, 150); h.globo("9", cx - 2, cy - R + 8, 300, 116)
    h.globo("7", cx - 30 * kc, yp + 40 * kc, 300, 340); h.globo("4", cx + 10 * kc, yp + 30 * kc, 510, 340)

    # ================= VISTA DEL TABLERITO (riel vertical) =================
    h.titulo(560, 62, "TABLERITO AP-CC-01" + ("5" if big else "4"), "ESC. 1:4 APROX. - FUERA DE LA CAJA - RIEL VERTICAL")
    kt = 1.1; tx0 = 640; ty0 = 120
    h.rect(tx0, ty0, PLW * kt, PLH * kt, "#fff", K, 1.6)
    tcx = tx0 + PLW / 2 * kt
    rz0 = ty0 + (PLH - RIEL) / 2 * kt - 20
    h.rect(tcx - 17.5 * kt, rz0, 35 * kt, RIEL * kt, "url(#ANSI31)", K, 1); h.rect(tcx - 12.5 * kt, rz0, 25 * kt, RIEL * kt, "#fff", K, .5)
    for yy in (rz0 + 10, rz0 + RIEL * kt - 10): h.circ(tcx, yy, 3.2, "#fff", K, .8)
    y = rz0 + (RIEL - tot) / 2 * kt; py = {}
    for t, i in pila:
        hh = ALT[t] * kt
        if t == "pf":
            h.rect(tcx - 39.75 * kt, y, 79.5 * kt, hh, "#fff", K, 1); h.rect(tcx - 15 * kt, y + 2, 30 * kt, hh - 4, "#fff", K, .5, 'rx="2"')
            h.txt(tcx + 39.75 * kt + 4, y + hh / 2 + 3, f"F{i+1}", 8.5, 700)
        elif t == "sep": h.rect(tcx - 27 * kt, y, 54 * kt, hh, "#111", K, .4)
        else:
            h.rect(tcx - 25 * kt, y, 50 * kt, hh, "#fff", K, .9)
        py[(t, i)] = y + hh / 2; y += hh
    # peine N-PE (TN-S) por la ranura central de N y PE
    yc0 = py[("c", 0)] - 4; yv1 = py[("v", ver - 1)] + 4
    h.rect(tcx + 4 * kt, yc0, 5 * kt, yv1 - yc0, "#e6e6e6", K, .8)
    # bulón PAT abajo
    yb = ty0 + PLH * kt - 22
    h.circ(tcx, yb, 9, "url(#cuH)", K, 1); h.circ(tcx, yb, 13, "none", K, .8)
    h.txt(tcx + 18, yb + 4, "BULON PAT", 8.5, 700)
    h.dimH(ty0 + PLH * kt + 16, tx0, tx0 + PLW * kt, f"{PLW} (*)", c=OR, dy=13)
    h.dimV(tx0 - 14, ty0, ty0 + PLH * kt, f"{PLH} (*)", c=OR)
    h.dimV(tx0 + PLW * kt + 30, rz0, rz0 + RIEL * kt, "140 RIEL", ext=tcx + 18 * kt)
    h.dimH(rz0 - 12, tcx - 39.75 * kt, tcx + 39.75 * kt, "79,5")
    h.globo("3", tcx + 10, rz0 + 4, 560, 130); h.globo("7", tcx - 30 * kt, py[("pf", 0)], 560, 200)
    h.globo("4", tcx - 18 * kt, py[("g", 0)], 560, 260); h.globo("5", tcx - 18 * kt, py[("c", 0)], 560, 320)
    h.globo("6", tcx - 18 * kt, py[("v", 0)], 560, 380); h.globo("9", tcx - 8, yb, 560, 440)

    # ================= ESQUEMA DE CONEXION (color) =================
    EY = 520
    h.titulo(40, EY, "ESQUEMA DE CONEXION" + (" (TN-S)"), f"S/E - EJEMPLO CON {n} ART., CADA UNO EN SU FASE")
    X = 210; yS = EY + 40; bwid = 64; bh = 12
    yy = yS; pos = {}
    for t, i in pila:
        hh = {"pf": 18, "sep": 4}.get(t, bh)
        if t == "pf":
            h.rect(X - 8, yy, bwid + 16, hh, "#eceae4", K, .9, 'rx="3"'); h.rect(X + bwid / 2 - 14, yy + 5, 28, hh - 10, "url(#cobre)", K, .5)
            h.txt(X - 12, yy + hh / 2 + 4, f"F{i+1} 2A", 8.5, 700, K, "end")
        elif t == "sep": h.rect(X - 4, yy, bwid + 8, hh, "#222", K, .3)
        else:
            col = {"g": GRI, "c": CELB, "v": VER}[t]
            h.rect(X, yy, bwid, hh, col, K, .8, 'rx="2"')
            h.txt(X + bwid / 2, yy + 9.5, {"g": "FASE", "c": "N", "v": "PE"}[t], 8, 700, "#fff" if t != "g" else K, "middle")
        pos[(t, i)] = yy + hh / 2; yy += hh + 2
    yEnd = yy
    h.rect(X + bwid - 10, pos[("c", 0)] - 4, 5, pos[("v", ver - 1)] - pos[("c", 0)] + 8, "url(#cobre)", K, .5)
    def w(pts, col, sw=2.2, extra=""):
        d = "M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in pts); h.path(d, "none", col, sw, 'stroke-linejoin="round" ' + extra)
    # troncal desde la ventana: entra y sigue (lado izquierdo de las borneras)
    yTr = yEnd + 30
    lanes = {"R": 60, "S": 72, "T": 84, "N": 96}
    for f, c in FASES + [("N", CEL)]:
        xl = lanes[f]; w([(xl, yTr + 20), (xl, yTr)], c, 2.2)
    for i in range(n):
        f, c = FASES[i]
        w([(lanes[f], yTr), (lanes[f], pos[("g", i)]), (X, pos[("g", i)])], c)
    w([(lanes["N"], yTr), (lanes["N"], pos[("c", 0)]), (X, pos[("c", 0)])], CEL)
    h.rect(54, yTr + 20, 48, 8, "#222", K, .4)
    h.txt(108, yTr + 28, "TRONCAL 4 x S DESDE LA VENTANA (ENTRA Y SIGUE)", 9, 700)
    # puentes 1x2,5 de la bornera de fase al portafusible (lado derecho)
    for i in range(n):
        f, c = FASES[i]; xr = X + bwid + 10 + i * 7
        w([(X + bwid, pos[("g", i)]), (xr, pos[("g", i)]), (xr, pos[("pf", i)] + 6), (X + bwid + 8, pos[("pf", i)] + 6)], c, 1.8)
    h.txt(X + bwid + 10 + n * 7 + 4, pos[("g", 0)] + 4, "1x2,5", 8.5, 700)
    # salidas 3x1,5 a cada artefacto (fase del portafusible, N y PE)
    xa = 420
    for i in range(n):
        ya = EY + 50 + i * 30
        h.rect(xa, ya - 8, 46, 16, "#fff", K, .7); h.txt(xa + 23, ya + 4, f"ART. {i+1}", 8.5, 700, K, "middle")
        f, c = FASES[i]; xo = 330 + i * 8
        w([(X + bwid + 8, pos[("pf", i)] - 5), (xo, pos[("pf", i)] - 5), (xo, ya - 4), (xa, ya - 4)], MAR, 1.5)
        w([(X + bwid, pos[("c", i)] + 2), (xo + 30, pos[("c", i)] + 2), (xo + 30, ya), (xa, ya)], CELB, 1.5)
        vi = i // 2
        w([(X + bwid, pos[("v", vi)] + (i % 2) * 3), (xo + 54, pos[("v", vi)] + (i % 2) * 3), (xo + 54, ya + 4), (xa, ya + 4)], VER, 1.5)
    h.txt(xa, EY + 50 + n * 30 + 8, "3x1,5 A LA", 8.5, 700); h.txt(xa, EY + 50 + n * 30 + 20, "LUMINARIA", 8.5, 700)
    # bulón PAT: puente 1x6 V/A a la PE y V/A 1x10 de la jabalina
    bx, by = X + bwid / 2 + 70, yEnd + 12
    h.circ(bx, by, 9, "url(#bronce)", K, .9); h.txt(bx + 46, by - 2, "BULON PAT", 8.5, 700)
    w([(bx - 6, by - 6), (X - 22, by - 6), (X - 22, pos[("v", 0)]), (X, pos[("v", 0)])], VER, 2.4)
    w([(bx - 6, by - 6), (X - 22, by - 6), (X - 22, pos[("v", 0)]), (X, pos[("v", 0)])], "#f2d200", 2.4, 'stroke-dasharray="4 4"')
    h.txt(X - 26, by - 12, "1x6 V/A", 8.5, 700, "#1f7a35", "end")
    w([(bx + 9, by), (bx + 40, by), (bx + 40, yTr + 14)], VER, 3.2); w([(bx + 9, by), (bx + 40, by), (bx + 40, yTr + 14)], "#f2d200", 3.2, 'stroke-dasharray="4 4"')
    h.txt(bx + 46, yTr + 12, "1x10 V/A JABALINA (OJAL)", 8.5, 700, "#1f7a35")

    # ================= D1: bulón PAT =================
    DX, DY = 480, 520
    h.titulo(DX, DY, "D1 - BULON PAT", "S/E - BORNE DE TIERRA")
    wx = DX + 20; wy = DY + 40
    h.rect(wx, wy, 10, 130, "url(#ANSI31)", K, 1)                          # pared de la columna
    h.rect(wx + 10, wy + 52, 80, 14, "url(#bronce)", K, 1)                    # bulón
    for xx in range(int(wx + 30), int(wx + 90), 5): h.ln(xx, wy + 52, xx + 3, wy + 66, "#6b4a12", .5)
    h.rect(wx + 40, wy + 20, 4, 78, "url(#ANSI31)", K, .8)                      # chapa del tablerito
    h.rect(wx + 44, wy + 46, 10, 26, "url(#bronce)", K, .8); h.rect(wx + 30, wy + 46, 10, 26, "url(#bronce)", K, .8)  # tuercas
    h.rect(wx + 56, wy + 44, 6, 30, "url(#cobre)", K, .7); h.rect(wx + 64, wy + 44, 6, 30, "url(#cobre)", K, .7)   # ojales
    h.path(f"M{wx+59},{wy+44} V{wy+8} H{wx+140}", "none", VER, 3); h.path(f"M{wx+59},{wy+44} V{wy+8} H{wx+140}", "none", "#f2d200", 3, 'stroke-dasharray="4 4"')
    h.path(f"M{wx+67},{wy+74} V{wy+116} H{wx+140}", "none", VER, 4); h.path(f"M{wx+67},{wy+74} V{wy+116} H{wx+140}", "none", "#f2d200", 4, 'stroke-dasharray="4 4"')
    h.rect(wx + 72, wy + 46, 10, 26, "url(#bronce)", K, .8)
    h.txt(wx + 76, wy + 2, "1x6 V/A → PE (OJAL 2049)", 8.5, 700)
    h.txt(wx + 76, wy + 132, "1x10 V/A (OJAL 2045)", 8.5, 700)
    h.txt(wx + 96, wy + 90, "SOSTIENE", 8.5, 400); h.txt(wx + 96, wy + 101, "LA CHAPA", 8.5, 400)
    h.txt(DX, wy + 160, "MEDIDAS Y MATERIAL S/ PLANO (*)", 8.5, 700, OR)
    h.globo("12", wx + 20, wy + 59, wx + 4, wy + 20) if False else None

    # ================= D2: tapa con señal =================
    D2X = 712
    h.titulo(D2X, DY, "D2 - TAPA", "S/E - CON SEÑAL")
    tx, ty = D2X + 10, DY + 40
    h.rect(tx, ty, 60, 170, "url(#galv)", K, 1.2, 'rx="5"'); h.rect(tx + 4, ty + 4, 52, 162, "none", K, .5, 'rx="4"')
    h.path(f"M{tx+30},{ty+45} l20,34 h-40 z", "#f2c500", K, 1.2)
    h.path(f"M{tx+32},{ty+54} l-6,12 h6 l-5,10", "none", K, 1.6)
    h.txt(tx + 30, ty + 98, "RIESGO", 8, 700, K, "middle"); h.txt(tx + 30, ty + 108, "ELECTRICO", 8, 700, K, "middle")
    h.circ(tx + 30, ty + 150, 4, "#ccc", K, .6)
    for i, t in enumerate(("CON JUNTA", "ACRILICO", "ADENTRO", "(ETG 16.1)")): h.txt(tx + 68, ty + 20 + i * 12, t, 8.5, 400)
    h.txt(D2X, ty + 190, "MEDIDAS S/ PLANO (*)", 8.5, 700, OR)

    # ================= COMPUTO + CUADRO + VARIANTE =================
    CY = 852
    filas = [("PIEZA", "CANT.", "CALCULO"),
             ("BPN GRIS 6 (FASE)", str(n), f"1 x ART. = {n}"),
             ("BPN CELESTE 6 (N)", str(n), f"1 x ART. = {n}"),
             ("BPN VERDE 6 (PE)", str(ver), f"(1 + {n}) / 2 = {ver} (MAX. 2 x BORNE)"),
             ("PORTAFUSIBLE 10x38", str(n), f"1 x ART. = {n}"),
             ("FUSIBLE 2 A", str(n), "2 A x ART."),
             ("PUENTE 1x2,5", f"{0.3*n:.1f} m".replace(".", ","), f"0,30 x {n}"),
             ("PUNTERA 2030 / 2028", f"{2*n} / {n}", "2 x PUENTE / 1 x SALIDA"),
             ("PUENTE 1x6 V/A", "0,5 m", "BULON → PE"),
             ("RIEL + TORNILLOS", "0,14 m + 2", "6x3/8 CABEZA TANQUE")]
    h.tabla(40, CY, [(128, "l", False), (72, "c", True), (190, "l", False)], filas, rowh=15, titulo=f"COMPUTO POR CAJA (TN-S, {n} ART.)")
    rows = [("ART.", "PF", "F", "N", "PE")]
    for t in (1, 2, 3):
        o = math.ceil((1 + t) / 2); rows.append((f"{t} TN-S", str(t), str(t), str(t), str(o)))
    for t in (1, 2, 3):
        o = math.ceil((1 + t) / 2); rows.append((f"{t} TT", str(t + 1), str(o), str(t), str(o)))
    h.tabla(452, CY, [(62, "c", False), (34, "c", True), (34, "c", True), (34, "c", True), (34, "c", True)], rows, rowh=15, titulo="CUADRO (bpnMetDef)")
    # variante del plano oficial
    VX = 680
    h.txt(VX, CY, "VARIANTE (PLANO)", 13, 700); h.ln(VX, CY + 4, VX + 118, CY + 4, K, 1)
    h.rect(VX, CY + 16, 150, 90, "none", OR, .8, 'stroke-dasharray="4 3"')
    for i in range(3):
        h.rect(VX + 12 + i * 44, CY + 26, 30, 64, "#fff", K, .9, 'rx="2"'); h.rect(VX + 20 + i * 44, CY + 42, 14, 32, "url(#cuH)", K, .5)
        h.txt(VX + 27 + i * 44, CY + 102, "RST"[i], 9, 700, K, "middle")
    h.txt(VX, CY + 122, "AP-CC-014-A: 3 BASES BMF 8,5x31,5", 8.5, 700, OR); h.txt(VX, CY + 134, "CON FUSIBLE 4 A (1 x FASE). HOY:", 8.5, 400, OR)
    h.txt(VX, CY + 146, "10x38 CON 2 A x ART. (A CONFIRMAR)", 8.5, 400, OR)

    # ================= NOTAS =================
    notas = [f"COTAS EN mm. CAJA PARA COLUMNA DE PIE Ø{'140 Y Ø168 (TIPOS D A K, 8 m O MAS)' if big else '114 (TIPOS A, B Y C: 6 A 7 m)'} SEGUN AP-C-005; TABLERITO AP-CC-01{'5' if big else '4'}.",
             "CAJA CON SU BASE A 2500 O MAS DEL PISO TERMINADO; SI NO LLEGA, TAPA CON CERRAMIENTO ESPECIAL (AEA 95703 4.11.3).",
             "VENTANA DE ACOMETIDA 150 x 76 CON SU CENTRO A 300 O MAS BAJO EL PISO; CAÑO PVC Ø75 (6004) DE LA VENTANA A LA ZANJA.",
             "EL BULON PAT DE BRONCE ES EL BORNE PRINCIPAL DE TIERRA Y SOSTIENE LA CHAPA: LA COLUMNA NUEVA NO LLEVA BANDERITA NI BLOQUETE.",
             "TN-S: CADA ARTEFACTO EN SU FASE Y PEINE N-PE. TT: TODOS EN UNA FASE, N POR BASE SECCIONABLE, SIN UNIR N Y PE (AP-CC-016-C).",
             "(*) A CONFIRMAR: CAJA Y ABERTURA, BULON, CHAPA (¿3011?), ORDEN EN EL RIEL, FASE SIN ARTEFACTO" + (", 6002 EN Ø140." if big else ".")]
    h.notas(40, 1040, notas)

    # ================= 3D =================
    h.titulo(890, 62, f"VISTA 3D - CAJA ABIERTA EN COLUMNA METALICA Ø{D}", "COLUMNA CORTADA PARA VER EL TABLERITO, EL RIEL, LAS BORNERAS, EL BULON PAT Y LOS CABLES")
    s = 1.42 if not big else 1.3; h.iso(s, 1236, 586)
    R0 = D / 2
    P = h.P
    def pts(l): return " ".join(f"{P(*p)[0]:.1f},{P(*p)[1]:.1f}" for p in l)
    def arc(z, a0, a1, r=R0, m=40): return [(r * math.cos(math.radians(a0 + (a1 - a0) * j / m)), r * math.sin(math.radians(a0 + (a1 - a0) * j / m)), z) for j in range(m + 1)]
    zw0, zw1 = -40, PLH + 40; zb0, zb1 = zw0 - 40, zw1 + 40
    body = arc(zb0, 135, -45) + arc(zb1, -45, 135)
    h.a(f'<polygon points="{pts(body)}" fill="url(#galv)" stroke="#333" stroke-width=".8"/>')
    h.a(f'<polygon points="{pts(arc(zb1, 0, 360, R0, 60))}" fill="#c6ced5" stroke="#333" stroke-width=".8"/>')
    h.a(f'<polygon points="{pts(arc(zb1, 0, 360, R0 - 3, 60))}" fill="#3d4247" stroke="#333" stroke-width=".5"/>')
    th0, th1 = 5, 160
    win = arc(zw0, th0, th1) + arc(zw1, th1, th0)
    h.a(f'<clipPath id="winM"><polygon points="{pts(win)}"/></clipPath>')
    h.a(f'<polygon points="{pts(win)}" fill="#4a5158" stroke="#111" stroke-width="1"/>')
    h.a('<g clip-path="url(#winM)">')
    h.a(f'<polygon points="{pts(arc(zw0 - 80, 160, 370, R0 - 3) + arc(zw1 + 80, 370, 160, R0 - 3))}" fill="#5b636b" stroke="none"/>')
    yp = -22
    h.BOX(-PLW / 2, PLW / 2, yp - 2, yp, 0, PLH, "#dfe6ec", "url(#galv)", "#7f8b96", "#333", .6)                  # chapa
    zr0 = (PLH - RIEL) / 2 + 20
    h.BOX(-17.5, 17.5, yp, yp + 7.5, zr0, zr0 + RIEL, "#e3e9ee", "url(#galv)", "#7f8b96", "#333", .5)              # riel
    # bulón PAT (bronce) con tuerca y ojales, abajo
    zbu = 28
    h.BOX(-6, 6, -R0 + 3, yp + 18, zbu - 6, zbu + 6, "#e3b765", "url(#bronce)", "#8a5f1c", "#5a3a0c", .5)
    h.BOX(-10, 10, yp, yp + 6, zbu - 10, zbu + 10, "#e3b765", "url(#bronce)", "#8a5f1c", "#5a3a0c", .5)
    h.BOX(-8, 8, yp + 7, yp + 10, zbu - 8, zbu + 8, "#f0a860", "url(#cobre)", "#9c5a1c", "#5a3210", .4)
    h.BOX(-8, 8, yp + 11, yp + 14, zbu - 8, zbu + 8, "#f0a860", "url(#cobre)", "#9c5a1c", "#5a3210", .4)
    h.BOX(-9, 9, yp + 14, yp + 20, zbu - 9, zbu + 9, "#e3b765", "url(#bronce)", "#8a5f1c", "#5a3a0c", .5)
    z = zr0 + RIEL - (RIEL - tot) / 2; zz = {}
    for t, i in pila:                       # de arriba hacia abajo
        hh = ALT[t]; z0 = z - hh
        if t == "pf":
            h.BOX(-39.75, 39.75, yp + 7.5, yp + 61, z0, z, "#f6f4ee", "#e8e5dc", "#c9c5b9", "#333", .5)
        elif t == "sep":
            h.BOX(-27, 27, yp + 7.5, yp + 56, z0, z, "#555", "#2b2b2b", "#1a1a1a", "#111", .3)
        else:
            col = {"g": GRI, "c": CELB, "v": VER}[t]
            h.BOX(-25, 25, yp + 7.5, yp + 53, z0, z, sh(col, 1.25), col, sh(col, .72), "#222", .4)
        zz[(t, i)] = (z0 + z) / 2; z = z0
    h.BOX(6, 10, yp + 50, yp + 55, zz[("v", ver - 1)] - 4, zz[("c", 0)] + 4, "#f0a860", "url(#cobre)", "#9c5a1c", "#5a3210", .4)   # peine
    def cab(points, col, wd=2.6, dash=False):
        d = "M" + " L".join(f"{P(*p)[0]:.1f},{P(*p)[1]:.1f}" for p in points)
        if dash: h.path(d, "none", "#f2d200", wd, 'stroke-dasharray="5 5" stroke-linejoin="round"'); return
        h.path(d, "none", "#111", wd + 1.2, 'stroke-linejoin="round" stroke-linecap="round"'); h.path(d, "none", col, wd, 'stroke-linejoin="round" stroke-linecap="round"')
    def sheath(points, wd=9, col="#1d1d1d"):
        d = "M" + " L".join(f"{P(*p)[0]:.1f},{P(*p)[1]:.1f}" for p in points)
        h.path(d, "none", "#000", wd + 1.4, 'stroke-linecap="round"'); h.path(d, "none", col, wd, 'stroke-linecap="round"')
    yc = yp + 30
    # troncal entra desde abajo (ventana) por el lado izquierdo y sigue
    sheath([(-34, yc, zw0 - 60), (-34, yc, zbu + 20)], 10); sheath([(-46, yc + 10, zw0 - 60), (-46, yc + 10, zbu + 26)], 10)
    for i in range(n):
        f, c = FASES[i]; zt = zz[("g", i)]
        cab([(-34, yc, zbu + 20), (-30, yc - 4, zt - 8), (-25, yc - 10, zt)], c, 2.2)
        cab([(-46, yc + 10, zbu + 26), (-32, yc - 2, zt - 6), (-25, yc - 6, zt + 1)], c, 2.2)
    cab([(-34, yc, zbu + 20), (-30, yc - 4, zz[("c", 0)] - 4), (-25, yc - 10, zz[("c", 0)])], CEL, 2.2)
    # V/A de la jabalina al bulón y 1x6 del bulón a la PE
    cab([(-14, yp + 30, zw0 - 60), (-6, yp + 20, zbu - 14), (0, yp + 14, zbu - 6)], VER, 3.2); cab([(-14, yp + 30, zw0 - 60), (-6, yp + 20, zbu - 14), (0, yp + 14, zbu - 6)], VER, 3.0, True)
    cab([(0, yp + 10, zbu + 6), (30, yp + 30, zbu + 30), (25, yc, zz[("v", 0)])], VER, 2.2); cab([(0, yp + 10, zbu + 6), (30, yp + 30, zbu + 30), (25, yc, zz[("v", 0)])], VER, 2.0, True)
    # puentes 1x2,5 de la fase al portafusible y salidas a las luminarias (lado derecho, suben)
    for i in range(n):
        f, c = FASES[i]
        cab([(25, yc, zz[("g", i)]), (34 + i * 3, yc + 6, zz[("g", i)]), (34 + i * 3, yc + 18, zz[("pf", i)] - 4), (39.75, yc + 14, zz[("pf", i)] - 4)], c, 1.8)
        xs_ = 46 + i * 4
        sheath([(xs_, yc + 16, zr0 + RIEL + 10), (xs_, yc + 16, zw1 + 80)], 6)
        cab([(39.75, yc + 14, zz[("pf", i)] + 4), (xs_, yc + 16, zr0 + RIEL + 10)], MAR, 1.5)
        cab([(25, yc - 4, zz[("c", i)]), (xs_ - 1, yc + 10, zr0 + RIEL + 6), (xs_, yc + 16, zr0 + RIEL + 10)], CELB, 1.5)
        cab([(25, yc - 8, zz[("v", i // 2)]), (xs_ + 1, yc + 8, zr0 + RIEL + 4), (xs_, yc + 16, zr0 + RIEL + 10)], VER, 1.5)
    h.a('</g>')
    for th in (th0, th1):
        a0 = P(R0 * math.cos(math.radians(th)), R0 * math.sin(math.radians(th)), zw0); a1 = P(R0 * math.cos(math.radians(th)), R0 * math.sin(math.radians(th)), zw1)
        h.ln(a0[0], a0[1], a1[0], a1[1], "#e8edf1", 2.4)
    # tapa retirada, apoyada al costado
    TY = R0 + 75; tp = [(-62, TY, -40), (0, TY, -40), (0, TY, 160), (-62, TY, 160)]
    h.F3(tp, "url(#galv)", "#333", 1)
    tri = [(-31, TY, 110), (-19, TY, 88), (-43, TY, 88)]
    h.F3(tri, "#f2c500", "#111", .9)
    lx, ly = P(-31, TY, 74); h.txt(lx, ly, "RIESGO", 7, 700, K, "middle", INT); h.txt(lx, ly + 8, "ELECTRICO", 6.5, 700, K, "middle", INT)
    # globos
    GX = 1478
    g = [("1", (-31, TY, 20), "CAJA: TAPA RETIRADA"),
         ("2", (PLW / 2 - 4, yp, PLH - 10), "CHAPA DEL TABLERITO (*)"),
         ("3", (17.5, yp + 7.5, zr0 + RIEL - 4), "RIEL DIN NS35 (14 cm)"),
         ("7", (39.75, yp + 61, zz[("pf", 0)]), "PORTAFUSIBLE 10x38"),
         ("4", (25, yp + 53, zz[("g", n - 1)]), "BPN GRIS FASE (2009)"),
         ("5", (25, yp + 53, zz[("c", n - 1)]), "BPN CELESTE N (2008)"),
         ("6", (25, yp + 53, zz[("v", ver - 1)]), "BPN VERDE PE (2010)"),
         ("9", (9, yp + 20, zbu), "BULON PAT (BRONCE)"),
         ("14", (-34, yc, zw0 - 10), "TRONCAL DESDE VENTANA"),
         ("11", (-14, yp + 30, zw0 - 30), "V/A DE LA JABALINA"),
         ("13", (48, yc + 16, zw1 + 20), "3x1,5 A LA LUMINARIA"),
         ("10", (20, yp + 26, zbu + 18), "PUENTE 1x6 V/A")]
    g.sort(key=lambda e: P(*e[1])[1])
    y0g = 130; dy = (705 - y0g) / (len(g) - 1)
    for i, (nn, p, t) in enumerate(g): h.g3(nn, p, GX, y0g + i * dy, t)
    for i, (t, c) in enumerate(((f"COLUMNA METALICA Ø{D} (GALV.)", NV), ("CAJA CON SU BASE A 2,50 m", NV), ("O MAS DEL PISO", NV), ("MEDIDAS DE LA CAJA (*)", OR))):
        h.txt(895, 130 + i * 15, t, 10.5, 700, c, "start", INT)

    # ================= LISTA =================
    VIN = "A VINCULAR"
    L = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "CAJA DE CONEXION CON TAPA Y SEÑAL «RIESGO ELECTRICO»", "1", "6002 (*)" if big else "6002"),
         ("2", "TABLERITO: CHAPA GALVANIZADA N°14 (2 mm) (*)", "1", VIN),
         ("3", "RIEL DIN NS35 + 2 TORNILLOS CAB. TANQUE 6x3/8", "0,14 m + 2", "2038 / " + VIN),
         ("4", "BORNE BPN 6 mm² GRIS (FASE)", str(n), "2009"),
         ("5", "BORNE BPN 6 mm² CELESTE (NEUTRO)", str(n), "2008"),
         ("6", "BORNE BPN 6 mm² VERDE (TIERRA)", str(ver), "2010"),
         ("7", "PORTAFUSIBLE TABAQUERA 10x38 + FUSIBLE 2 A", f"{n} + {n}", "3053 / 3017"),
         ("8", "PUENTE 1x2,5 FASE → PORTAF. (0,30 m c/u)", f"{0.3*n:.1f} m".replace(".", ","), VIN),
         ("8", "PUNTERAS DEL PUENTE (2 c/u) / DE SALIDA (1 c/u)", f"{2*n} / {n}", "2030 / 2028"),
         ("9", "BULON PAT DE BRONCE (VIENE EN LA CAJA)", "1", "CON LA CAJA"),
         ("10", "PUENTE 1x6 V/A BULON → PE + OJAL + PUNTERA", "0,5 m", VIN + " / 2049 / 2032"),
         ("11", "OJAL DEL 1x10 V/A DE LA JABALINA (CABLE EN PAT)", "1", "2045"),
         ("12", "OJAL DE GOMA (AGUJERO PASANTE Ø50) Y ACRILICO", "1 + 1", VIN),
         ("13", "CABLE 3x1,5 A LA LUMINARIA (CABLE DE SUBIDA)", "S/ CALC.", "6001"),
         ("14", "TRONCAL 4 x S (ENTRA Y SIGUE)", "S/ PROY.", "S/ CALIBRE"),
         ("V", "VARIANTE PLANO: BASE BMF 8,5x31,5 + FUSIBLE 4 A", "3", VIN)]
    h.tabla(890, 762, [(36, "c", False), (424, "l", False), (80, "c", True), (210, "c", False)], L, rowh=15,
            titulo=f"LISTA DE MATERIALES (1 CAJA, {n} ARTEFACTOS, TN-S)", colores=lambda i, j, t: OR if (VIN in t or "(*)" in t or (j == 0 and t == "V")) else K)
    h.rotulo(890, h.H - 150, 750, PL, "CAJA DE CONEXION", f"COL. METALICA Ø{"140 / Ø168" if big else "114"}", "ELEVACION, CORTE, TABLERITO, ESQUEMA Y 3D", "S/E", "3D S/E", fecha="07/11/2026")
    fn = "ap_cc_004.svg" if big else "ap_cc_001.svg"
    h.guardar(fn); print("ok", fn)
