"""Generador de las hojas TC-PRFV-01 y TC-PRFV-02 (conexionado de la caja de columna PRFV).
Datos: ficha Normas TC-PRFV-01/02, guía «caja_columna_prfv», BPN_COL_DEF, FICHAS_TEC (BPN, portafusible, riel, punteras, cable),
CLAUDE.md §11.3 (fusibles, BPN 6). Lo que no está va en naranja con (*)."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT, CORES

MAR, NEG, ROJ, CEL = CORES[0][0], CORES[1][0], CORES[2][0], CORES[3][0]
VER = "#2e9d4a"; GRI = "#9ea4aa"; CELB = "#4fa3d9"
FASE = {"R": MAR, "S": NEG, "T": ROJ, "N": CEL}
BCOL = {"g": GRI, "c": CELB, "v": VER}

def sh(hexc, f):
    h = hexc.lstrip("#"); r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    if f >= 1: r, g, b = (int(v + (255 - v) * (f - 1)) for v in (r, g, b))
    else: r, g, b = (int(v * f) for v in (r, g, b))
    return "#%02x%02x%02x" % (r, g, b)

def piezas(jab, arriba):
    if arriba: return [("PE", "v"), ("PE", "v"), ("N", "c"), ("gap", None), ("S", "pf"), ("T", "pf")]
    base = [("N", "c"), ("sep", None), ("R", "g"), ("S", "g"), ("T", "g")]
    return ([("PE", "v")] + base) if jab else base

ANCHO = {"v": 8.2, "c": 8.2, "g": 8.2, "pf": 17.5, "sep": 2.0, "gap": 1.5}

def layout(jab, arriba):
    ps = piezas(jab, arriba); tot = sum(ANCHO[t if t else n] for n, t in ps); x = (80 - tot) / 2; out = []
    for n, t in ps:
        w = ANCHO[t if t else n]; out.append((n, t, x, w)); x += w
    return out


def gen(jab):
    h = Hoja()
    PL = "TC-PRFV-02" if jab else "TC-PRFV-01"
    # ================= VISTA FRONTAL DE LOS TABLERITOS (riel con todas las piezas) =================
    h.titulo(40, 62, "VISTA FRONTAL - TABLERITOS 80 x 130", "ESC. 1:2 - COTAS EN mm - RIEL DIN NS35 HORIZONTAL - PIEZAS EN ORDEN")
    k = 2.0; Y0 = 142
    TX = {"ab": 95, "ar": 320}
    pos = {}
    for key, arr in (("ab", False), ("ar", True)):
        x0 = TX[key]; y0 = Y0
        h.rect(x0, y0, 80 * k, 130 * k, "#fff", K, 1.6)
        h.txt(x0 + 80 * k / 2, y0 + 130 * k + 16, "TABLERITO DE ARRIBA" if arr else "TABLERITO DE ABAJO", 11, 700, K, "middle")
        for yy, sep in ((30, 60), (70, 50), (105, 50)):
            for sg in (-1, 1): h.circ(x0 + (40 + sg * sep / 2) * k, y0 + yy * k, 3.2, "#fff", K, .8)
        yc = y0 + 70 * k
        h.ln(x0 - 10, yc, x0 + 80 * k + 10, yc, K, .4, h.EJE)
        # riel NS35 x 7,5 (largo a lo ancho del tablerito)
        rx0, rx1 = x0 + 3 * k, x0 + 77 * k
        h.rect(rx0, yc - 17.5 * k, rx1 - rx0, 35 * k, "url(#ANSI31)", K, 1)
        h.rect(rx0, yc - 12.5 * k, rx1 - rx0, 25 * k, "#fff", K, .6)
        for sx in range(int(rx0 + 8), int(rx1 - 20), 50): h.rect(sx, yc - 3.1 * k, 15 * k, 6.2 * k, "#fff", K, .5)
        for n, t, xm, w in layout(jab, arr):
            xx = x0 + xm * k; ww = w * k; cxp = xx + ww / 2
            pos[(key, n, t, round(xm, 1))] = cxp
            if t in ("v", "c", "g"):
                h.rect(xx, yc - 25 * k, ww, 50 * k, "#fff", K, 1)
                h.rect(xx + 2, yc - 25 * k + 2, ww - 4, 6, "#fff", K, .5); h.rect(xx + 2, yc + 25 * k - 8, ww - 4, 6, "#fff", K, .5)
                for sy in (-16, 16):
                    h.circ(cxp, yc + sy * k, 4.4, "#fff", K, .8); h.ln(cxp - 3, yc + sy * k + 3, cxp + 3, yc + sy * k - 3, K, .8)
                h.txt(cxp, yc - 25 * k - 6, n, 10, 700, K, "middle")
                # cables: arriba y abajo
                h.ln(cxp, yc - 25 * k, cxp, y0 - 18, K, 1.1); h.ln(cxp, yc + 25 * k, cxp, y0 + 130 * k + 2, K, 1.1)
            elif n == "sep":
                h.rect(xx, yc - 27 * k, ww, 54 * k, "#111", K, .6)
            elif t == "pf":
                h.rect(xx, yc - 39.75 * k, ww, 79.5 * k, "#fff", K, 1.1)
                h.ln(xx, yc - 14 * k, xx + ww, yc - 14 * k, K, .6)
                h.rect(xx + 6, yc - 10 * k, ww - 12, 30 * k, "#fff", K, .6, 'rx="3"')
                h.rect(cxp - 10.3 * k / 2, yc - 8 * k, 10.3 * k, 26 * k, "url(#cuH)", K, .4)
                for sy in (-33, 33): h.circ(cxp, yc + sy * k, 4.4, "#fff", K, .8); h.ln(cxp - 3, yc + sy * k + 3, cxp + 3, yc + sy * k - 3, K, .8)
                h.txt(cxp, yc - 39.75 * k - 6, n, 10, 700, K, "middle")
                h.ln(cxp, yc - 39.75 * k, cxp, y0 - 18, K, 1.1); h.ln(cxp, yc + 39.75 * k, cxp, y0 + 130 * k + 2, K, 1.1)
        # peine
        lay = layout(jab, arr)
        if arr: grp = [l for l in lay if l[0] in ("PE", "N") and l[1] in ("v", "c")]
        elif jab: grp = [l for l in lay if l[0] in ("PE", "N")]
        else: grp = []
        if grp:
            px0 = x0 + grp[0][2] * k + 2; px1 = x0 + (grp[-1][2] + grp[-1][3]) * k - 2
            h.rect(px0, yc - 7 * k, px1 - px0, 5 * k, "#e6e6e6", K, .9)
            for l in grp: h.rect(x0 + (l[2] + l[3] / 2) * k - 1.5, yc - 2 * k, 3, 3 * k, "#e6e6e6", K, .6)
    # cotas de la vista frontal
    xa, xr = TX["ab"], TX["ar"]
    h.dimH(Y0 + 130 * k + 42, xa, xa + 80 * k, "80", ext=Y0 + 130 * k + 22)
    h.dimV(xa - 22, Y0, Y0 + 130 * k, "130", ext=xa - 2)
    ys = [Y0, Y0 + 30 * k, Y0 + 70 * k, Y0 + 105 * k, Y0 + 130 * k]
    for a_, b_, t in zip(ys, ys[1:], ("30", "40", "35", "25")): h.dimV(xa - 48, a_, b_, t, ext=xa - 26)
    h.dimH(Y0 + 30 * k - 12, xa + 10 * k, xa + 70 * k, "60")
    h.dimH(Y0 + 105 * k + 14, xa + 15 * k, xa + 65 * k, "50", dy=13)
    # paso del borne y ancho del portafusible (tablerito de arriba)
    lay = layout(jab, True)
    pe = lay[0]; pf = lay[4]
    h.dimH(Y0 + 70 * k + 25 * k + 14, xr + pe[2] * k, xr + (pe[2] + pe[3]) * k, "8,2", dy=13)
    h.dimH(Y0 + 70 * k + 39.75 * k + 14, xr + pf[2] * k, xr + (pf[2] + pf[3]) * k, "17,5", dy=13)
    h.dimV(xr + 80 * k + 18, Y0 + 70 * k - 17.5 * k, Y0 + 70 * k + 17.5 * k, "35", ext=xr + 77 * k)
    h.dimV(xr + 80 * k + 40, Y0 + 70 * k - 25 * k, Y0 + 70 * k + 25 * k, "50", ext=xr + 80 * k + 22)
    # rótulos de los cables de la vista frontal
    # líneas de corte A-A (por el borne S de abajo) y B-B (por el portafusible S de arriba)
    labS = [l for l in layout(jab, False) if l[0] == "S"][0]
    xA = xa + (labS[2] + labS[3] / 2) * k
    xB = xr + (pf[2] + pf[3] / 2) * k
    for xc, L in ((xA, "A"), (xB, "B")):
        for yy, dy in ((Y0 - 34, -4), (Y0 + 130 * k + 62, 13)):
            h.ln(xc - 9, yy, xc + 9, yy, K, 2); h.txt(xc + 12, yy + 4, L, 13, 700)
        h.ln(xc, Y0 - 34, xc, Y0 - 18, K, .6, h.EJE); h.ln(xc, Y0 + 130 * k + 2, xc, Y0 + 130 * k + 62, K, .6, h.EJE)
    # globos de la vista frontal
    GY = 482
    h.globo("1", xa + 6, Y0 + 12, 52, 118); h.globo("2", xa + 18, Y0 + 70 * k + 20, 52, GY)
    labN = [l for l in layout(jab, False) if l[0] == "N"][0]
    h.globo("3", xa + (labS[2] + 4) * k, Y0 + 70 * k + 30, 250, GY)
    h.globo("4", xa + (labN[2] + 4) * k, Y0 + 70 * k + 40, 150, GY)
    h.globo("5", xr + (pe[2] + 4) * k, Y0 + 70 * k + 40, 330, GY)
    lsep = [l for l in layout(jab, False) if l[0] == "sep"][0]
    h.globo("6", xa + (lsep[2] + 1) * k, Y0 + 70 * k + 50, 190, GY)
    h.globo("7", xr + (pe[2] + 12) * k, Y0 + 70 * k - 9, 300, 112)
    h.globo("8", xr + (pf[2] + 3) * k, Y0 + 70 * k - 30 * k, 500, 112)
    h.globo("9", xB + 4, Y0 + 70 * k + 5 * k, 500, GY)

    # ================= CORTE A-A (por un borne) y CORTE B-B (por el portafusible) =================
    def lateral(xs, titulo, sub, pf):
        h.titulo(xs - 18, 62 if pf else 62, titulo, sub)
        yc = Y0 + 70 * k
        h.rect(xs - 2 * k, Y0, 2 * k, 130 * k, "url(#ANSI31)", K, 1.2)         # chapa del tablerito
        # riel NS35 (sombrero): base contra la chapa, alas a 7,5
        r = f"M{xs},{yc-12.5*k} H{xs+7.5*k-1} V{yc-17.5*k} H{xs+7.5*k+1} M{xs},{yc+12.5*k} H{xs+7.5*k-1} V{yc+17.5*k} H{xs+7.5*k+1}"
        h.path(f"M{xs},{yc-12.5*k} V{yc+12.5*k}", "none", K, 2.2)
        h.path(f"M{xs},{yc-12.5*k} L{xs+7.5*k},{yc-12.5*k} L{xs+7.5*k},{yc-17.5*k}", "none", K, 2)
        h.path(f"M{xs},{yc+12.5*k} L{xs+7.5*k},{yc+12.5*k} L{xs+7.5*k},{yc+17.5*k}", "none", K, 2)
        h.circ(xs + 2, yc, 3, "#fff", K, .6)
        if not pf:
            D = 53; A = 50
            d = (f"M{xs+7.5*k},{yc-17.5*k-3} L{xs+7.5*k},{yc-A/2*k} L{xs+(D-14)*k},{yc-A/2*k} L{xs+D*k},{yc-A/2*k+12*k} "
                 f"L{xs+D*k},{yc+A/2*k-12*k} L{xs+(D-14)*k},{yc+A/2*k} L{xs+7.5*k},{yc+A/2*k} L{xs+7.5*k},{yc+17.5*k+3} "
                 f"L{xs+9.5*k},{yc+17.5*k+3} L{xs+9.5*k},{yc-17.5*k-3} Z")
            h.path(d, "url(#ANSI37)", K, 1.4)
            # cajas de ajuste y tornillos (en corte)
            for sg in (-1, 1):
                cy = yc + sg * 16 * k
                h.rect(xs + 22 * k, cy - 5 * k, 14 * k, 10 * k, "#fff", K, .9)
                h.path(f"M{xs+(D-6)*k},{cy-2.2*k} L{xs+30*k},{cy-2.2*k} L{xs+30*k},{cy+2.2*k} L{xs+(D-6)*k},{cy+2.2*k} Z", "#fff", K, .8)
                h.rect(xs + (D - 6) * k, cy - 3.5 * k, 4 * k, 7 * k, "#fff", K, .8)
                # puntera + cable entrando por arriba / abajo
                ye = yc + sg * (A / 2) * k
                h.rect(xs + 26 * k, cy - (1 if sg < 0 else -1) * 0, 6 * k * 0 + 1, 1, "none", K, 0)
                p0 = cy + sg * (-5 * k); pex = ye + sg * 9 * k
                h.rect(xs + 26.5 * k, min(p0, pex), 5 * k, abs(pex - p0), "#fff", K, .8)
                h.ln(xs + 29 * k, pex, xs + 29 * k, ye + sg * 26 * k, K, 2.2)
            h.dimV(xs + D * k + 18, yc - A / 2 * k, yc + A / 2 * k, "50 (A)", ext=xs + D * k + 2)
            h.dimH(Y0 + 130 * k + 34, xs, xs + D * k, "53 (C) (*)", ext=Y0 + 130 * k + 4, c=OR, dy=12)
            h.txt(xs + 7.5 * k + 4, Y0 + 130 * k + 18, "7,5", 10)
            h.txt(xs + 30 * k, yc - A / 2 * k - 30 * k - 4, "CABLE CON PUNTERA", 9, 400, K, "middle")
        else:
            D = 61; Hh = 79.5
            d = (f"M{xs+7.5*k},{yc-Hh/2*k} L{xs+(D-12)*k},{yc-Hh/2*k} L{xs+(D-12)*k},{yc-Hh/2*k+10*k} L{xs+D*k},{yc-Hh/2*k+18*k} "
                 f"L{xs+D*k},{yc+Hh/2*k-18*k} L{xs+(D-12)*k},{yc+Hh/2*k-10*k} L{xs+(D-12)*k},{yc+Hh/2*k} L{xs+7.5*k},{yc+Hh/2*k} Z")
            h.path(d, "url(#ANSI37)", K, 1.4)
            # cartucho 10,3 x 38 dentro de la tapa (oculto)
            fx = xs + 36 * k
            h.rect(fx - 10.3 * k / 2, yc - 19 * k, 10.3 * k, 38 * k, "#fff", K, 1)
            h.rect(fx - 10.3 * k / 2, yc - 19 * k, 10.3 * k, 6 * k, "url(#cuH)", K, .5); h.rect(fx - 10.3 * k / 2, yc + 13 * k, 10.3 * k, 6 * k, "url(#cuH)", K, .5)
            h.ln(xs + (D - 12) * k, yc - 26 * k, xs + 22 * k, yc - 26 * k, K, .6, h.OCULTA)
            for sg in (-1, 1):
                cy = yc + sg * 33 * k
                h.rect(xs + 24 * k, cy - 4 * k, 12 * k, 8 * k, "#fff", K, .8)
                ye = yc + sg * Hh / 2 * k
                h.ln(xs + 30 * k, ye, xs + 30 * k, ye + sg * 14 * k, K, 2.2)
            h.dimV(xs + D * k + 12, yc - Hh / 2 * k, yc + Hh / 2 * k, "79,5", ext=xs + D * k + 2)
            h.dimH(Y0 + 130 * k + 34, xs, xs + D * k, "61", ext=Y0 + 130 * k + 4, dy=12)
            h.dimV(fx - 10.3 * k / 2 - 10, yc - 19 * k, yc + 19 * k, "38")
            h.txt(xs + 30 * k, yc - Hh / 2 * k - 18 * k, "SALIDA AL ART.", 9, 400, K, "middle")
        h.ln(xs - 4, yc, xs + 70 * k, yc, K, .4, h.EJE)
    lateral(572, "CORTE A-A", "ESC. 1:2", False)
    lateral(712, "CORTE B-B", "ESC. 1:2", True)

    # ================= ELEVACION + ESQUEMA DE CONEXION (a color) =================
    EY = 530
    h.titulo(40, EY, "ESQUEMA DE CONEXION EN LA COLUMNA", "S/E - R MARRON · S NEGRO · T ROJO · N CELESTE · PE VERDE (AEA 90364)")
    # columna en elevación (esquemática, con cortes)
    cxL, cxR = 62, 98; yPiso = 790; yC = 806; yTop = 566
    h.path(f"M{cxL},{yTop} V{yC+12} M{cxR},{yTop} V{yC+12}", "none", K, 1.4)
    for yy in (yTop, 700):
        h.path(f"M{cxL-4},{yy} l10,-5 l10,10 l10,-10 l10,10 l10,-5", "#fff", K, .8)
    h.rect(44, yPiso, 86, 26, "url(#EARTH)", K, 0); h.rect(cxL, yPiso, cxR - cxL, 26, "#fff", K, 0)
    h.ln(cxL, yPiso, cxR, yPiso, K, .4); h.ln(44, yPiso, cxL, yPiso, K, 1.6); h.ln(cxR, yPiso, 130, yPiso, K, 1.6)
    h.path(f"M{cxL},{yPiso} V{yC+12} M{cxR},{yPiso} V{yC+12}", "none", K, 1.4)
    h.rect(cxR - 2, yC - 6, 5, 12, "#111", K, .4); h.txt(cxR + 6, yC + 4, "«C»", 10, 700)
    h.txt(132, yPiso - 3, "±0,00", 9, 400)
    yCa, yCb = 632, 717          # cajas arriba / abajo (s/e)
    for yy in (yCa, yCb): h.rect(cxL + 6, yy - 14, cxR - cxL - 12, 28, "#fff", K, 1.1)
    h.txt(cxL + 20, yCa + 4, "C2", 9, 700, K, "middle"); h.txt(cxL + 20, yCb + 4, "C1", 9, 700, K, "middle")
    h.dimV(40, yCb, yPiso, "3500")
    # cables dentro de la columna: troncal desde «C», 4x4 entre cajas, 3x1,5 a la luminaria
    h.path(f"M{cxR+30},{yC} H{cxR} H{cxL+28} V{yCb+14}", "none", "#222", 4.5); h.path(f"M{cxR+30},{yC+5} H{cxL+24} V{yCb+14}", "none", "#222", 2.5)
    h.txt(cxR + 34, yC + 4, "TRONCAL", 9, 700); h.txt(cxR + 34, yC + 15, "(ENTRA Y SIGUE)", 8.5, 400, G)
    h.path(f"M{cxL+30},{yCb-14} V{yCa+14}", "none", "#222", 4)
    h.path(f"M{cxL+26},{yCa-14} V{yTop-12}", "none", "#222", 3); h.path(f"M{cxL+16},{yCa-14} V{yTop-12}", "none", "#222", 3)
    h.txt(cxR + 6, yTop + 8, "↑ 3x1,5 A LUMINARIAS", 8.5, 700)
    if jab:
        h.path(f"M{cxL-26},{yC+8} H{cxL} H{cxL+12} V{yCb+14}", "none", VER, 3.4); h.path(f"M{cxL-26},{yC+8} H{cxL} H{cxL+12} V{yCb+14}", "none", "#f2d200", 3.4, 'stroke-dasharray="4 4"')
        h.txt(46, yC + 24, "V/A JABALINA", 8.5, 700, "#1f7a35")
    bw, bh = 24, 34
    def fila(x0, y, lay):
        cx = {}; x = x0
        for n, t, xm, w in lay:
            if t in ("v", "c", "g"):
                h.rect(x, y, bw, bh, BCOL[t], K, .9, 'rx="2"'); h.txt(x + bw / 2, y + bh / 2 + 4, n, 10, 700, "#fff" if t != "g" else K, "middle")
                cx[(n, len([c for c in cx if c[0] == n]))] = x + bw / 2; x += bw + 3
            elif n == "sep": h.rect(x, y - 4, 4, bh + 8, "#222", K, .5); x += 8
            elif t == "pf":
                h.rect(x, y - 6, 32, bh + 12, "#eceae4", K, .9, 'rx="3"'); h.rect(x + 10, y + 3, 12, bh - 6, "#d08a3f", K, .6)
                h.txt(x + 16, y + bh + 18, n, 10, 700, K, "middle"); cx[(n, "pf")] = x + 16; x += 38
            elif n == "gap": x += 6
        h.rect(x0 - 8, y - 12, x - x0 + 13, bh + 24, "none", G, .6, 'stroke-dasharray="4 3"')
        return cx, x
    yA = 618; yB = 702; X0 = 200
    cA, xAend = fila(X0, yA, layout(jab, True))
    cB, xBend = fila(X0 + 10, yB, layout(jab, False))
    h.txt(X0 - 14, yA + bh / 2 - 2, "C2 ARRIBA", 9, 700, G, "end"); h.txt(X0 - 14, yA + bh / 2 + 10, "(ARTEFACTOS)", 8.5, 400, G, "end")
    h.txt(X0 - 4, yB + bh / 2 - 2, "C1 ABAJO", 9, 700, G, "end"); h.txt(X0 - 4, yB + bh / 2 + 10, "(ALIMENT.)", 8.5, 400, G, "end")
    h.ln(cxR, yCa, X0 - 70, yCa, G, .5, 'stroke-dasharray="2 2"'); h.ln(cxR, yCb, X0 - 70, yCb, G, .5, 'stroke-dasharray="2 2"')
    def w(pts, col, sw=2.4):
        d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts); h.path(d, "none", col, sw, 'stroke-linejoin="round"')
    def peine(lst, y): h.rect(min(lst) - 9, y + bh - 9, max(lst) - min(lst) + 18, 5, "url(#cobre)", K, .6)
    peine([cA[("PE", 0)], cA[("PE", 1)], cA[("N", 0)]], yA)
    if jab: peine([cB[("PE", 0)], cB[("N", 0)]], yB)
    # troncal (abajo de C1): entra y sigue
    yT = yB + bh
    for f in ("N", "R", "S", "T"):
        xx = cB[(f, 0)]
        w([(xx - 3, yT), (xx - 3, yT + 26)], FASE[f], 2.2); w([(xx + 3, yT), (xx + 3, yT + 26)], FASE[f], 2.2)
    xs0 = cB[("N", 0)] - 7; xs1 = cB[("T", 0)] + 7
    h.rect(xs0, yT + 26, xs1 - xs0, 7, "#222", K, .5)
    h.txt(xs0, yT + 46, "TRONCAL 4 x S DESDE «C»: ENTRA Y SIGUE", 9, 700)
    h.txt(xs0, yT + 58, "2 CABLES POR BORNE, PUNTERA DEL CALIBRE", 8.5, 400, G)
    if jab:
        xx = cB[("PE", 0)]
        h.path(f"M{xx},{yT} V{yT+48} H{xx-40}", "none", VER, 3.4); h.path(f"M{xx},{yT} V{yT+48} H{xx-40}", "none", "#f2d200", 3.4, 'stroke-dasharray="4 4"')
        h.txt(xx + 6, yT + 72, "1x10 V/A DE LA JABALINA + TIFF 10", 8.5, 700, "#1f7a35")
    # 4x4: N, S, T de C1 (arriba) a C2 (abajo); R de reserva
    ylane = yA + bh + 26
    for i, (f, dest) in enumerate((("N", ("N", 0)), ("S", ("S", "pf")), ("T", ("T", "pf")))):
        x1 = cB[(f, 0)]; x2 = cA[dest]; yl = ylane + 4 + i * 5
        w([(x1, yB), (x1, yl), (x2, yl), (x2, yA + bh + (6 if dest[1] == "pf" else 0))], FASE[f], 2.4)
    xR = cB[("R", 0)]; w([(xR, yB), (xR, yB - 10)], MAR, 2.4); h.rect(xR - 4, yB - 16, 8, 6, "#111", K, .4)
    h.txt(xBend + 4, yB - 6, "R RESERVA", 8.5, 700, MAR)
    h.txt(xAend + 6, ylane - 2, "4x4 (1 m)", 9, 700)
    # artefactos: 1 y 2 de S, 3 de T (3x1,5: verde PE, celeste N, fase)
    ax0 = xAend + 46; yArt = yA - 52
    arts = [(1, ("S", "pf"), ("PE", 0)), (2, ("S", "pf"), ("PE", 0)), (3, ("T", "pf"), ("PE", 1))]
    for i, (nn, fd, ped) in enumerate(arts):
        yy = yArt + i * 15
        xf = cA[fd] + ((i - 0.5) * 4 if fd[0] == "S" else 0); xpe = cA[ped] + ((-3 if nn == 1 else 3) if ped[1] == 0 else 0); xn = cA[("N", 0)] + (i - 1) * 4
        w([(xpe, yA), (xpe, yy - 4), (ax0, yy - 4)], VER, 1.5)
        w([(xn, yA), (xn, yy), (ax0, yy)], CELB, 1.5)
        w([(xf, yA - 6), (xf, yy + 4), (ax0, yy + 4)], MAR, 1.5)
        h.rect(ax0, yy - 7, 40, 14, "#fff", K, .7); h.txt(ax0 + 20, yy + 4, f"ART. {nn}", 8.5, 700, K, "middle")
    h.txt(ax0, yArt + 48, "3x1,5 (V-C-F)", 9, 700); h.txt(ax0, yArt + 60, "A LA LUMINARIA", 8.5, 400, G)

    # ================= DETALLE D1: UN BORNE BPN 6 =================
    DX, DY = 492, 530
    h.titulo(DX, DY, "D1 - BORNE BPN 6", "ESC. 1:2")
    kd = 2.0; bx = DX + 20; byc = DY + 112
    h.rect(bx, byc - 25 * kd, 8.2 * kd, 50 * kd, GRI, K, 1.2)
    for sy in (-16, 16):
        h.circ(bx + 4.1 * kd, byc + sy * kd, 6, "#d9d9d9", K, .8); h.ln(bx + 4.1 * kd - 4, byc + sy * kd + 4, bx + 4.1 * kd + 4, byc + sy * kd - 4, K, 1.1)
    h.dimH(byc + 25 * kd + 14, bx, bx + 8.2 * kd, "8,2", dy=13)
    h.dimV(bx - 12, byc - 25 * kd, byc + 25 * kd, "50")
    h.txt(bx + 4.1 * kd, byc - 25 * kd - 8, "FRENTE", 9, 700, K, "middle")
    sx = bx + 44
    d = (f"M{sx},{byc-25*kd} L{sx+30*kd},{byc-25*kd} L{sx+40*kd},{byc-14*kd} L{sx+40*kd},{byc+14*kd} L{sx+30*kd},{byc+25*kd} L{sx},{byc+25*kd} Z")
    h.path(d, GRI, K, 1.2)
    h.rect(sx - 6, byc - 17.5 * kd, 6, 35 * kd, "url(#galv)", K, .8)
    for sg in (-1, 1):
        cy = byc + sg * 16 * kd
        h.rect(sx + 16 * kd, cy - 4 * kd, 12 * kd, 8 * kd, "url(#cobre)", K, .8)
        h.rect(sx + 28 * kd, cy - 2 * kd, 10 * kd, 4 * kd, "#d9d9d9", K, .7)
        ye = byc + sg * 25 * kd
        h.rect(sx + 19 * kd, min(ye, ye + sg * 12), 6 * kd, 12, "#f08a24", K, .7)
        h.rect(sx + 18.5 * kd, min(ye + sg * 12, ye + sg * 30), 7 * kd, 18, NEG if sg < 0 else CEL, K, .7)
    h.txt(sx + 30 * kd, byc - 25 * kd - 8, "COSTADO", 9, 700)
    for i, t in enumerate(("CAJA DE AJUSTE + TORNILLO", "CABLE CON PUNTERA, MAX. 2", "PASO 8,2 · 41 A · 800 V")):
        h.txt(DX, byc + 25 * kd + 44 + i * 12, t, 8.5, 400)
    for i, (c, t) in enumerate(((GRI, "2009 GRIS FASE"), (CELB, "2008 CELESTE N"), (VER, "2010 VERDE PE"))):
        h.rect(DX, byc + 25 * kd + 80 + i * 15, 11, 11, c, K, .6); h.txt(DX + 16, byc + 25 * kd + 89 + i * 15, t, 8.5, 700)

    # ================= D3: portafusible tabaquera + fusible =================
    D3X, D3Y = 662, 530
    h.titulo(D3X, D3Y, "D3 - PORTAFUSIBLE", "S/E - TAPA REBATIBLE")
    kf = 1.4; fx = D3X + 22; fy = D3Y + 50
    h.rect(fx, fy, 17.5 * kf, 79.5 * kf, "#eceae4", K, 1.1, 'rx="2"')
    h.ln(fx, fy + 26 * kf, fx + 17.5 * kf, fy + 26 * kf, K, .7)
    h.rect(fx + 4, fy + 30 * kf, 17.5 * kf - 8, 34 * kf, "#fff", K, .6, 'rx="2"')
    h.dimH(fy - 10, fx, fx + 17.5 * kf, "17,5")
    h.dimV(fx - 12, fy, fy + 79.5 * kf, "79,5")
    gx = D3X + 96; gy = D3Y + 56; kg = 2.2
    h.rect(gx, gy, 10.3 * kg, 38 * kg, "#f4f1e8", K, 1)
    h.rect(gx - 1, gy, 10.3 * kg + 2, 7 * kg, "url(#cobre)", K, .7); h.rect(gx - 1, gy + 31 * kg, 10.3 * kg + 2, 7 * kg, "url(#cobre)", K, .7)
    h.txt(gx + 10.3 * kg / 2, gy + 19 * kg + 4, "2A", 9, 700, K, "middle")
    h.dimV(gx + 10.3 * kg + 14, gy, gy + 38 * kg, "38", ext=gx + 10.3 * kg + 2)
    h.dimH(gy - 8, gx, gx + 10.3 * kg, "Ø10,3")
    for i, t in enumerate(("FUSIBLE gG", "500 V · 120 kA", "3017 = 2 A", "3073 = 4 A")):
        h.txt(gx + 46, gy + 14 + i * 13, t, 8.5, 700 if i > 1 else 400)
    h.tabla(D3X + 10, D3Y + 196, [(40, "c", False), (56, "c", False), (56, "c", False)],
            [("ART.", "S", "T"), ("1", "2 A", "VACIO"), ("2", "2 A", "2 A"), ("3", "4 A", "2 A"), ("4", "4 A", "4 A")], rowh=15, titulo="FUSIBLES (2 A x ART.)")

    # ================= D2: cable 4x4 en corte + puntera TIF 4 =================
    D2X, D2Y = 40, 852
    h.titulo(D2X, D2Y, "D2 - CABLE 4x4 Y PUNTERA TIF 4", "S/E - Ø EXT. 13,5 - DIN 46228-4")
    kc = 3.2; ccx = D2X + 40; ccy = D2Y + 75
    h.cable(ccx, ccy, 13.5 / 2 * kc, True, True, 4)
    h.dimH(ccy + 13.5 / 2 * kc + 14, ccx - 13.5 / 2 * kc, ccx + 13.5 / 2 * kc, "Ø13,5", dy=13)
    for i, (c, t) in enumerate(((MAR, "R RESERVA"), (NEG, "S"), (ROJ, "T"), (CEL, "N"))):
        h.rect(D2X + 86, D2Y + 46 + i * 15, 10, 10, c, K, .4); h.txt(D2X + 100, D2Y + 55 + i * 15, t, 9, 700)
    kp = 5; px = D2X + 210; py = D2Y + 80
    h.rect(px - 46, py - 2.3 * kp, 46, 4.6 * kp, NEG, K, .7)
    h.path(f"M{px},{py-4.5*kp/2} L{px+7.5*kp},{py-4.5*kp/2} L{px+7.5*kp+6},{py-1.6*kp} L{px+17.5*kp},{py-1.6*kp} L{px+17.5*kp},{py+1.6*kp} L{px+7.5*kp+6},{py+1.6*kp} L{px+7.5*kp},{py+4.5*kp/2} L{px},{py+4.5*kp/2} Z", "#f08a24", K, 1)
    h.rect(px + 7.5 * kp + 6, py - 1.2 * kp, 10 * kp - 6, 2.4 * kp, "url(#cobre)", K, .5)
    h.dimH(py - 4.5 * kp / 2 - 12, px, px + 17.5 * kp, "17,5")
    h.dimH(py + 4.5 * kp / 2 + 14, px + 7.5 * kp, px + 17.5 * kp, "10 CAÑA", dy=13)
    h.dimV(px + 17.5 * kp + 14, py - 1.45 * kp, py + 1.45 * kp, "Ø2,9")
    h.txt(px + 20, py + 52, "TIF 4 mm² NARANJA (2031): 6 POR COLUMNA", 8.5, 700, K, "middle")

    # ================= COMPUTO POR COLUMNA =================
    CX, CY = 452, 826
    ver = 3 if jab else 2; pein = 5 if jab else 3
    filas = [("PIEZA", "CANT.", "CALCULO"),
             ("BPN GRIS 6", "3", "R + S + T (C1)"),
             ("BPN CELESTE 6", "2", "1 EN C1 + 1 EN C2"),
             ("BPN VERDE 6", str(ver), "PE + PE (C2)" + (" + PE (C1)" if jab else "")),
             ("PORTAFUSIBLE", "2", "S + T (C2)"),
             ("FUSIBLE 10x38", "2", "1 x PORTAF. (CUADRO)"),
             ("SEPARADOR", "1", "ENTRE N Y R (C1)"),
             ("PEINE (ELEM.)", str(pein), "3 EN C2" + (" + 2 EN C1" if jab else "")),
             ("CABLE 4x4", "1 m", "ENTRE C1 Y C2"),
             ("PUNTERA TIF 4", "6", "3 COND. x 2 PUNTAS"),
             ("PUNTERA 2028", "4", "2 x PORTAFUSIBLE")]
    if jab: filas.append(("PUNTERA TIFF 10", "1", "1 x JABALINA"))
    h.tabla(CX, CY, [(104, "l", False), (42, "c", True), (220, "l", False)], filas, rowh=14, titulo="COMPUTO POR COLUMNA" + (" CON JABALINA" if jab else ""))

    # ================= NOTAS =================
    notas = ["COTAS EN mm. LAS 3 BORNERAS SON BPN 6 mm² (FASE, N, PE) SEA CUAL SEA EL CABLE; LAS PUNTERAS SIGUEN EL CALIBRE.",
             "C1: ENTRA Y SIGUE EL TRONCAL. EL 4x4 LLEVA N, S Y T A C2; LA R QUEDA DE RESERVA, AISLADA. ART. 1 Y 2 DE S, ART. 3 DE T.",
             ("PEINE 2027 (10 ELEM., SE CORTA): PE·PE·N EN C2 Y PE·N EN C1. EL V/A DE LA JABALINA ENTRA AL PE DE C1." if jab else "PEINE 2027 (10 ELEM., SE CORTA): UNE PE·PE·N EN C2. NUNCA LA FASE."),
             "(*) CON 3 ART. EL N DE C2 TOMA 3 CELESTES + EL 4x4 (MAX. 2 POR BORNE); EL PLANO DIBUJA 4 BORNES: A CONFIRMAR.",
             "(*) EN ESQUEMA TT EL PEINE N-PE NO VA (REVISION B2): A CONFIRMAR CON EL PROYECTO DE LA PLAZA.",
             "(*) A CONFIRMAR: COTAS A/B/C DEL BORNE, SEPARADOR, RIEL, SEPARACION C1-C2, FASE DEL 3x1,5. TABLERITO SIN CODIGO."]
    h.notas(40, 1040, notas)

    # ================= 3D =================
    h.titulo(890, 62, "VISTA 3D - CAJA DE COLUMNA PRFV ABIERTA" + (" (CON JABALINA)" if jab else ""), "COLUMNA CORTADA PARA VER LOS DOS TABLERITOS, EL RIEL, LAS BORNERAS Y LOS CABLES")
    s = 1.2; h.iso(s, 1190, 612)
    R0 = 76; GAP = 60
    zA0, zA1 = 0, 130; zR0, zR1 = 130 + GAP, 260 + GAP
    zw0, zw1 = -35, zR1 + 35
    zc0, zc1 = zw0 - 25, zw1 + 25
    P = h.P
    def pts(lst): return " ".join(f"{P(*p)[0]:.1f},{P(*p)[1]:.1f}" for p in lst)
    def arc(z, a0, a1, r=R0, n=40):
        return [(r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), r * math.sin(math.radians(a0 + (a1 - a0) * i / n)), z) for i in range(n + 1)]
    # cuerpo de la columna (frente visible: -45 .. 135) con veta de fibra
    body = arc(zc0, 135, -45) + arc(zc1, -45, 135)
    h.a(f'<polygon points="{pts(body)}" fill="url(#prfv)" stroke="#222" stroke-width=".8"/>')
    h.a(f'<polygon points="{pts(body)}" fill="url(#fibra)" stroke="none"/>')
    top = arc(zc1, 0, 360, R0, 60)
    h.a(f'<polygon points="{pts(top)}" fill="#5d6361" stroke="#222" stroke-width=".8"/>')
    h.a(f'<polygon points="{pts(arc(zc1, 0, 360, R0 - 6, 60))}" fill="#2a2d2c" stroke="#222" stroke-width=".5"/>')
    # ventana (corte) del lado +y
    th0, th1 = 8, 150
    win = arc(zw0, th0, th1) + arc(zw1, th1, th0)
    h.a(f'<clipPath id="win3"><polygon points="{pts(win)}"/></clipPath>')
    h.a(f'<polygon points="{pts(win)}" fill="#232726" stroke="#111" stroke-width="1"/>')
    # pared interior del fondo (se ve por la ventana)
    h.a('<g clip-path="url(#win3)">')
    back = arc(zw0 - 60, 150, 370, R0 - 6) + arc(zw1 + 60, 370, 150, R0 - 6)
    h.a(f'<polygon points="{pts(back)}" fill="#3a3f3e" stroke="none"/>')
    yp = -16
    def borne(x0, w_, zc, col, n):
        h.BOX(x0, x0 + w_, yp + 2, yp + 2 + 51, zc - 25, zc + 25, sh(col, 1.25), col, sh(col, .72), "#222", .5)
        for sz in (-16, 16):
            cx_, cy_ = P(x0 + w_ / 2, yp + 53, zc + sz); h.circ(cx_, cy_ + 0, 3.0, "#cfd4d8", "#333", .5)
    def pfus(x0, zc):
        h.BOX(x0, x0 + 17.5, yp + 2, yp + 61, zc - 39.75, zc + 39.75, "#f6f4ee", "#e8e5dc", "#c9c5b9", "#333", .6)
        a_ = [(x0 + 3, yp + 61, zc - 12), (x0 + 14.5, yp + 61, zc - 12), (x0 + 14.5, yp + 61, zc + 18), (x0 + 3, yp + 61, zc + 18)]
        h.F3(a_, "#dcd8cc", "#555", .5)
        for sz in (-33, 33):
            cx_, cy_ = P(x0 + 8.75, yp + 61, zc + sz); h.circ(cx_, cy_, 3.0, "#cfd4d8", "#333", .5)
    anchors = {}
    for key, z0, arr in (("ab", zA0, False), ("ar", zR0, True)):
        zc = z0 + 60
        h.BOX(-40, 40, yp, yp + 2, z0, z0 + 130, "#e9edf0", "url(#galv)", "#8f9aa4", "#333", .6)       # tablerito
        h.BOX(-37, 37, yp + 2, yp + 9.5, zc - 17.5, zc + 17.5, "#e3e9ee", "url(#galv)", "#7f8b96", "#333", .5)  # riel
        for n, t, xm, w_ in layout(jab, arr):
            x0 = xm - 40
            if t in ("v", "c", "g"): borne(x0, w_, zc, BCOL[t], n)
            elif n == "sep": h.BOX(x0, x0 + w_, yp + 2, yp + 56, zc - 27, zc + 27, "#555", "#2b2b2b", "#1a1a1a", "#111", .4)
            elif t == "pf": pfus(x0, zc)
            anchors[(key, n, len([a for a in anchors if a[0] == key and a[1] == n]))] = (x0 + w_ / 2, zc, t, w_)
        lay = layout(jab, arr)
        grp = [l for l in lay if l[0] in ("PE", "N") and l[1] in ("v", "c")] if (arr or jab) else []
        if grp:
            gx0 = grp[0][2] - 40 + 1; gx1 = grp[-1][2] + grp[-1][3] - 40 - 1
            h.BOX(gx0, gx1, yp + 44, yp + 49, zc + 6, zc + 10, "url(#cobre)", "#c27a3a", "#8a5225", "#5a3210", .4)
    def P2(x, y, z): return P(x, y, z)
    def cab(points, col, wd=3.0):
        d = "M" + " L".join(f"{P(*p)[0]:.1f},{P(*p)[1]:.1f}" for p in points)
        h.path(d, "none", "#111", wd + 1.2, 'stroke-linejoin="round" stroke-linecap="round"'); h.path(d, "none", col, wd, 'stroke-linejoin="round" stroke-linecap="round"')
    def sheath(points, wd=8, col="#202020"):
        d = "M" + " L".join(f"{P(*p)[0]:.1f},{P(*p)[1]:.1f}" for p in points)
        h.path(d, "none", "#000", wd + 1.4, 'stroke-linecap="round"'); h.path(d, "none", col, wd, 'stroke-linecap="round"')
    yc_ = yp + 30
    def A(key, n, i=0): return anchors[(key, n, i)]
    # troncal: entra desde abajo a N R S T (abajo)
    zcB = zA0 + 60; zcR = zR0 + 60
    sheath([(-6, yc_, zw0 - 70), (-6, yc_, zcB - 70)], 10)
    sheath([(12, yc_ + 14, zw0 - 70), (12, yc_ + 14, zcB - 78)], 10)
    for f in ("N", "R", "S", "T"):
        ax, az, t, w_ = A("ab", f)
        cab([(-6, yc_, zcB - 70), (ax - 1.5, yc_, zcB - 45), (ax - 1.5, yc_, zcB - 25)], FASE[f], 2.4)
        cab([(12, yc_ + 14, zcB - 78), (ax + 1.5, yc_ + 8, zcB - 47), (ax + 1.5, yc_, zcB - 25)], FASE[f], 2.4)
    if jab:
        ax, az, t, w_ = A("ab", "PE")
        cab([(-34, yc_ + 20, zw0 - 70), (ax, yc_ + 8, zcB - 50), (ax, yc_, zcB - 25)], VER, 3.4)
        dd = "M" + " L".join(f"{P(*p)[0]:.1f},{P(*p)[1]:.1f}" for p in [(-34, yc_ + 20, zw0 - 70), (ax, yc_ + 8, zcB - 50), (ax, yc_, zcB - 25)])
        h.path(dd, "none", "#f2d200", 3.4, 'stroke-dasharray="5 5" stroke-linejoin="round"')
    # 4x4 de abajo (N S T) a arriba (N, PF S, PF T); R de reserva
    zm0 = zcB + 60; zm1 = zcR - 70
    sheath([(-2, yc_ + 6, zm0), (-6, yc_ + 16, (zm0 + zm1) / 2), (-2, yc_ + 6, zm1)], 9)
    for f in ("N", "S", "T"):
        ax, az, t, w_ = A("ab", f)
        cab([(ax, yc_, zcB + 25), (ax, yc_ + 2, zcB + 40), (-2, yc_ + 6, zm0)], FASE[f], 2.4)
    for f, dk in (("N", "N"), ("S", "S"), ("T", "T")):
        ax, az, t, w_ = A("ar", dk) if dk == "N" else [anchors[a] for a in anchors if a[0] == "ar" and a[1] == dk][0]
        zz = zcR - (39.75 if t == "pf" else 25)
        cab([(-2, yc_ + 6, zm1), (ax, yc_ + 4, zz - 18), (ax, yc_ + (8 if t == "pf" else 0), zz)], FASE[f], 2.4)
    ax, az, t, w_ = A("ab", "R")
    cab([(ax, yc_, zcB + 25), (ax, yc_ + 6, zcB + 44)], MAR, 2.4)
    h.BOX(ax - 2.2, ax + 2.2, yc_ + 3, yc_ + 9, zcB + 44, zcB + 52, "#111", "#111", "#000", "#000", .3)
    # 3x1,5 a los artefactos (salen por arriba)
    art = [(-30, ("S",), 0), (-6, ("S",), 1), (20, ("T",), 2)]
    pes = [A("ar", "PE", 0), A("ar", "PE", 0), A("ar", "PE", 1)]
    for i, (xs_, fd, _) in enumerate(art):
        sheath([(xs_, yc_ + 10, zcR + 70), (xs_, yc_ + 10, zw1 + 80)], 7, "#1d1d1d")
        pf_ = [anchors[a] for a in anchors if a[0] == "ar" and a[1] == fd[0]][0]
        n_ = A("ar", "N"); pe_ = pes[i]
        cab([(pe_[0] + (i - 1) * 1.2, yc_, zcR + 25), (pe_[0], yc_ + 6, zcR + 50), (xs_, yc_ + 10, zcR + 70)], VER, 1.8)
        cab([(n_[0] + (i - 1) * 1.5, yc_, zcR + 25), (n_[0], yc_ + 6, zcR + 52), (xs_, yc_ + 10, zcR + 70)], CELB, 1.8)
        cab([(pf_[0] + (i - 1) * 2 if fd[0] == "S" else pf_[0], yc_ + 8, zcR + 39.75), (pf_[0], yc_ + 10, zcR + 55), (xs_, yc_ + 10, zcR + 70)], MAR, 1.8)
    h.a('</g>')
    # borde del corte (espesor de la pared)
    for th in (th0, th1):
        a0 = P(R0 * math.cos(math.radians(th)), R0 * math.sin(math.radians(th)), zw0); a1 = P(R0 * math.cos(math.radians(th)), R0 * math.sin(math.radians(th)), zw1)
        h.ln(a0[0], a0[1], a1[0], a1[1], "#9aa09d", 2.2)
    # globos 3D
    GX = 1478
    ab = lambda n, i=0: A("ab", n, i); ar = lambda n, i=0: A("ar", n, i)
    pfS = [anchors[a] for a in anchors if a[0] == "ar" and a[1] == "S"][0]
    g = []
    g.append(("12", (-30, yc_ + 10, zw1 + 30), "3x1,5 A LA LUMINARIA"))
    g.append(("8", (pfS[0] + 6, yp + 61, zcR + 20), "PORTAFUSIBLE 10x38"))
    g.append(("7", (ar("PE")[0] + 6, yp + 47, zcR + 10), "PUENTE PEINE (2027)"))
    g.append(("5", (ar("PE", 1)[0], yp + 53, zcR - 10), "BPN VERDE PE (2010)"))
    g.append(("4", (ar("N")[0], yp + 53, zcR - 20), "BPN CELESTE N (2008)"))
    g.append(("1", (36, yp + 2, zR0 + 112), "TABLERITO 80x130"))
    g.append(("10", (-4, yc_ + 14, (zm0 + zm1) / 2), "CABLE Cu 4x4 (1010)"))
    g.append(("3", (ab("T")[0], yp + 53, zcB - 15), "BPN GRIS R-S-T (2009)"))
    g.append(("2", (37, yp + 9.5, zcB - 10), "RIEL DIN NS35"))
    g.append(("6", (A("ab", "sep")[0], yp + 56, zcB + 10), "SEPARADOR (2041)"))
    g.append(("13", (12, yc_ + 14, zw0 - 30), "TRONCAL DESDE «C»"))
    if jab: g.append(("15", (-30, yc_ + 20, zw0 - 50), "V/A DE LA JABALINA"))
    g.sort(key=lambda e: P(*e[1])[1])
    y0g = 130; dy = (700 - y0g) / (len(g) - 1)
    for i, (n, p, t) in enumerate(g): h.g3(n, p, GX, y0g + i * dy, t)
    for i, (t, c) in enumerate((("COLUMNA PRFV RAL 7043", NV), ("CAJAS A 3,50 m DEL PISO", NV), ("C2 ARRIBA · C1 ABAJO", NV), ("SEPARACION C1-C2 (*)", OR))):
        h.txt(895, 640 + i * 15, t, 10.5, 700, c, "start", INT)

    # ================= LISTA DE MATERIALES =================
    VIN = "A VINCULAR"
    L = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "TABLERITO 80 x 130 CON RIEL (ARRIBA Y ABAJO)", "2", "SIN CODIGO"),
         ("2", "RIEL DIN NS35 x 7,5 (EN CADA TABLERITO) (*)", "2", "2038"),
         ("3", "BORNE BPN 6 mm² GRIS (FASE) R-S-T", "3", "2009"),
         ("4", "BORNE BPN 6 mm² CELESTE (NEUTRO)", "2", "2008"),
         ("5", "BORNE BPN 6 mm² VERDE (TIERRA)", str(ver), "2010"),
         ("6", "SEPARADOR PARA BORNE BPN", "1", "2041"),
         ("7", "PUENTE PEINE 10 ELEM. p/BPN 6 (SE CORTA)", f"{pein} elem.", "2027"),
         ("8", "PORTAFUSIBLE TABAQUERA 10 x 38 (S Y T)", "2", "3053"),
         ("9", "FUSIBLE 10 x 38 gG 2 A / 4 A (VER CUADRO)", "2", "3017 / 3073"),
         ("10", "CABLE Cu 4 x 4 mm² IRAM 2178-1", "1 m", "1010"),
         ("11", "PUNTERA TIF 4 mm² (PUNTAS DEL 4x4)", "6", "2031"),
         ("12", "CABLE Cu 3 x 1,5 A LOS ARTEFACTOS (CABLE DE SUBIDA)", "S/ CALC.", "6001"),
         ("13", "TRONCAL 4 x S + PUNTERAS DEL CALIBRE", "S/ PROY.", "S/ CALIBRE"),
         ("14", "PUNTERA CONEXION A PORTAFUSIBLE", "4", "2028")]
    if jab: L.append(("15", "CABLE V/A 1x10 DE LA JABALINA + PUNTERA TIFF 10", "1 punta", "7010 / 2029"))
    h.tabla(890, 758, [(40, "c", False), (440, "l", False), (90, "c", True), (180, "c", False)], L, rowh=16,
            titulo="LISTA DE MATERIALES (1 CAJA DE COLUMNA)", colores=lambda i, j, t: OR if t in ("SIN CODIGO", VIN) or "(*)" in t else K)
    h.rotulo(890, h.H - 150, 750, PL, "CONEXIONADO CAJA DE", "COLUMNA PRFV" + (" CON JABALINA" if jab else ""), "RIEL, CORTES, ESQUEMA, DETALLES Y 3D", "1:2 · S/E", "3D S/E", fecha="07/11/2026")
    fn = "tc_prfv_02.svg" if jab else "tc_prfv_01.svg"
    h.guardar(fn); print("ok", fn)
