"""tabmet · piezas comunes de mis hojas de columna metálica: tablerito AP-CC-014/015/016, caja externa AP-PL-002/003,
columna (AP-PL-001, AP-C-007, AP-TC-023). Usa planokit sin tocarlo.
Datos (ORIGINAL v130): fondo chapa galv. p/columna 230×95×2 (3011, catálogo y FICHAS_TEC caja_columna) · riel DIN NS35, 14 cm por caja,
2 tornillos cabeza tanque 6×3/8 (AP-PL-002) · BPN-06 paso 8,2, A/B/C 50/48/53 (FICHAS_TEC borneras, Zoloda) · portafusible 10×38
17,5 × 79,5 × 61 (FICHAS_TEC fusibles, Schneider DF101) · bpnMetDef(t, esquema) de la calculadora."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT

PL_W, PL_H, PL_E = 95, 230, 2          # fondo chapa galvanizada (3011)
RIEL_L, RIEL_W, RIEL_H = 140, 35, 7.5  # riel DIN NS35, 14 cm por caja
PF_P, PF_A, PF_C = 17.5, 79.5, 61      # portafusible 10×38: paso, alto (a lo ancho del fondo), fondo
B_P, B_A, B_C = 8.2, 50, 53            # BPN-06
SEP_P, TOPE_P = 2.0, 8.0               # separador y tope (*) sin medida
FASEC = {"R": "#7b3f1d", "S": "#1a1a1a", "T": "#c62828", "N": "#4fa3d9", "PE": "#2e9e4f"}
BCOL = {"gris": "#9aa0a6", "cel": "#4fa3d9", "ver": "#2e9e4f"}


def f(v, d=0):
    return f"{v:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def met_def(t, esq):
    """copia de bpnMetDef (calculadora v130)"""
    o = math.ceil((1 + t) / 2)
    return dict(pf=t + 1, gris=o, cel=t, ver=o) if esq == "TT" else dict(pf=t, gris=t, cel=t, ver=o)


def armado(t=3, esq="TN-S"):
    """lista de piezas sobre el riel, de arriba hacia abajo: (tipo, etiqueta)"""
    d = met_def(t, esq); L = [("tope", "")]
    if esq == "TT": pfs = ["N"] + ["R"] * t; gr = ["R"] * d["gris"]
    else: pfs = ["R", "S", "T"][:t] if t <= 3 else ["R", "S", "T", "R"][:t]; gr = pfs[:]
    L += [("pf", x) for x in pfs] + [("gris", x) for x in gr] + [("sep", "")]
    L += [("cel", "N")] * d["cel"] + [("ver", "PE")] * d["ver"] + [("tope", "")]
    return L


def paso(tp): return {"tope": TOPE_P, "pf": PF_P, "gris": B_P, "cel": B_P, "ver": B_P, "sep": SEP_P}[tp]


def largo(L): return sum(paso(tp) for tp, _ in L)


# ======================= 2D (blanco y negro) =======================
def frente(h, X, Y, k, L, globos=None, cables=True):
    """vista frontal del tablerito (fondo 230×95). X,Y = esquina sup. izq. del fondo. Devuelve dict de posiciones."""
    W, H = PL_W * k, PL_H * k; cx = X + W / 2
    h.rect(X, Y, W, H, "#fff", K, 1.4)
    for yy in (Y + 18 * k, Y + H - 18 * k): h.circ(cx, yy, 3.5 * k, "#fff", K, .7)
    # riel vertical, centrado en el alto
    ry0 = Y + (PL_H - RIEL_L) / 2 * k; rx = cx - RIEL_W / 2 * k
    h.rect(rx, ry0, RIEL_W * k, RIEL_L * k, "#fff", K, .8)
    h.ln(rx + 5 * k, ry0, rx + 5 * k, ry0 + RIEL_L * k, K, .4); h.ln(rx + (RIEL_W - 5) * k, ry0, rx + (RIEL_W - 5) * k, ry0 + RIEL_L * k, K, .4)
    for yy in (ry0 + 12 * k, ry0 + (RIEL_L - 12) * k):    # 2 tornillos cabeza tanque
        h.circ(cx, yy, 3 * k, "#fff", K, .7); h.ln(cx - 2 * k, yy, cx + 2 * k, yy, K, .6)
    # piezas
    pos = {"pf": [], "gris": [], "cel": [], "ver": [], "tope": [], "sep": []}
    tot = largo(L); y = ry0 + (RIEL_L - tot) / 2 * k
    for tp, lab in L:
        p = paso(tp) * k
        if tp == "pf":
            a = PF_A * k; h.rect(cx - a / 2, y, a, p, "#fff", K, .9)
            h.rect(cx - a / 2 + 4 * k, y + 2 * k, 12 * k, p - 4 * k, "#fff", K, .5); h.rect(cx + a / 2 - 16 * k, y + 2 * k, 12 * k, p - 4 * k, "#fff", K, .5)
            h.rect(cx - 19 * k, y + 3 * k, 38 * k, p - 6 * k, "url(#ANSI37)", K, .6)    # tapa / cartucho 10×38
            h.txt(cx, y + p / 2 + 3.5, lab, 8.5, 700, K, "middle")
        elif tp in ("gris", "cel", "ver"):
            a = B_A * k; h.rect(cx - a / 2, y, a, p, "#fff", K, .8)
            for sx in (-1, 1):
                h.circ(cx + sx * (a / 2 - 6 * k), y + p / 2, min(p / 2 - .6, 3 * k), "#fff", K, .5)
                xx = cx + sx * (a / 2 - 6 * k); h.ln(xx - 1.6, y + p / 2 + 1.6, xx + 1.6, y + p / 2 - 1.6, K, .5)
            if tp != "gris": h.txt(cx, y + p / 2 + 3, "N" if tp == "cel" else "PE", 6.5, 700, K, "middle")
            else: h.txt(cx, y + p / 2 + 3, lab, 6.5, 700, K, "middle")
        elif tp == "tope":
            h.path(f"M{cx-22*k:.1f},{y+p:.1f} L{cx-22*k:.1f},{y+2*k:.1f} L{cx+22*k:.1f},{y+2*k:.1f} L{cx+22*k:.1f},{y+p:.1f} Z", "url(#ANSI31)", K, .7)
        else:
            h.rect(cx - 30 * k, y, 60 * k, p, K, K, .4)
        pos[tp].append((cx, y + p / 2, p)); y += p
    pos["riel"] = (rx, ry0); pos["bulon"] = (cx, Y + H - 18 * k); pos["fij"] = (cx, Y + 18 * k); pos["cx"] = cx
    return pos


def cable2(h, d, w=2.2):
    h.path(d, "none", K, w + 1.4, 'stroke-linecap="round" stroke-linejoin="round"'); h.path(d, "none", "#fff", w, 'stroke-linecap="round" stroke-linejoin="round"')


def multifilar(h, X, Y, esq="TN-S", t=3, ancho=420, titulo=True, existente=False, sub=None):
    """esquema de conexión de la caja, con colores (AEA 90364). X,Y arriba a la izquierda. alto ≈ 205"""
    if titulo: h.titulo(X, Y, f"ESQUEMA {esq}" + (" - COLUMNA EXISTENTE" if existente else ""), sub or "S/E - 3 ARTEFACTOS")
    y0 = Y + 40; L = armado(t, esq)
    # troncal desde abajo
    xb = X + 12; yb = y0 + 170
    tr = [("R", FASEC["R"]), ("S", FASEC["S"]), ("T", FASEC["T"]), ("N", FASEC["N"])]
    # bornes en fila horizontal (el riel acostado para leer)
    bx = X + 62; by = y0 + 70; bw = 15
    items = [it for it in L if it[0] not in ("tope",)]
    xs = []
    x = bx
    for tp, lab in items:
        w = 22 if tp == "pf" else (5 if tp == "sep" else bw)
        if tp == "pf":
            h.rect(x, by - 10, w, 34, "#f4efe4", K, .8); h.rect(x + 5, by - 4, 12, 22, "#d8c9a3", K, .5); h.txt(x + w / 2, by - 14, lab, 8.5, 700, K, "middle")
        elif tp == "sep": h.rect(x, by - 6, w, 28, "#222", K, .4)
        else:
            h.rect(x, by - 4, w, 24, BCOL[tp], K, .8); h.txt(x + w / 2, by + 12, {"gris": lab, "cel": "N", "ver": "PE"}[tp], 7.5, 700, "#fff", "middle")
        xs.append((tp, lab, x + w / 2)); x += w + 2
    xend = x
    pfx = [(lab, xx) for tp, lab, xx in xs if tp == "pf"]
    gx = [(lab, xx) for tp, lab, xx in xs if tp == "gris"]
    cx_ = [xx for tp, lab, xx in xs if tp == "cel"]; vx = [xx for tp, lab, xx in xs if tp == "ver"]
    # peines
    if esq == "TT":
        h.rect(cx_[0] - 6, by + 22, cx_[-1] - cx_[0] + 12, 4, "#c9a227", K, .5); h.rect(vx[0] - 6, by + 22, vx[-1] - vx[0] + 12, 4, "#c9a227", K, .5)
        h.rect(gx[0][1] - 6, by + 22, gx[-1][1] - gx[0][1] + 12, 4, "#c9a227", K, .5)
    else:
        h.rect(cx_[0] - 6, by + 22, vx[-1] - cx_[0] + 12, 4, "#c9a227", K, .5)
    h.txt(cx_[0] - 6, by + 50, "PEINE" + (": N Y PE APARTE" if esq == "TT" else " N+PE: UNA TIRA"), 7.5, 400, G)
    def w(d, c, ww=1.8): h.path(d, "none", c, ww, 'stroke-linejoin="round" stroke-linecap="round"')
    # troncal: entra por abajo
    for i, (n, c) in enumerate(tr):
        xx = xb + i * 6; w(f"M{xx},{yb} V{yb-40}", c, 2.2)
    h.txt(xb - 2, yb + 13, "TRONCAL (LLEGA Y SIGUE)", 8, 700)
    ent = {"R": None, "S": None, "T": None}
    if esq == "TT":
        g0 = gx[0][1]; w(f"M{xb},{yb-40} V{by+48} H{g0} V{by+20}", FASEC["R"])
        npf = pfx[0][1]; w(f"M{xb+18},{yb-40} V{by+60} H{npf-4} V{by+24}", FASEC["N"])
        w(f"M{npf+4},{by-10} V{by-24} H{cx_[0]} V{by-4}", FASEC["N"], 1.4)
        for j, (lab, xx) in enumerate(pfx[1:]):   # puentes 1×2,5 gris → portafusibles
            src = gx[min(j // 2, len(gx) - 1)][1] + (-3 if j % 2 == 0 else 3)
            w(f"M{src},{by-4} V{by-30-j*5} H{xx} V{by-10}", FASEC["R"], 1.2)
        h.txt(xb + 28, yb - 4, "S Y T: A OTRAS COLUMNAS", 7.5, 400, G)
    else:
        for i, (lab, xx) in enumerate(gx):
            w(f"M{xb+i*6},{yb-40} V{by+44+i*8} H{xx} V{by+20}", FASEC[lab])
        w(f"M{xb+18},{yb-40} V{by+72} H{cx_[0]} V{by+26}", FASEC["N"])
        for j, (lab, xx) in enumerate(pfx):
            src = gx[j][1]; w(f"M{src},{by-4} V{by-28-j*6} H{xx} V{by-10}", FASEC[lab], 1.2)
    # salida de los portafusibles a los artefactos 3×1,5
    salen = pfx[1:] if esq == "TT" else pfx
    for j, (lab, xx) in enumerate(salen):
        ya = Y + 22 + j * 0  # arriba
        art_y = y0 - 8
        ax = xend + 40 + j * 50
        w(f"M{xx},{by-10} V{by-50-j*0} L{xx},{art_y+24}", FASEC[lab] if lab != "N" else FASEC["N"], 1.2)
        h.txt(xx, art_y + 18, f"A{j+1}", 7.5, 700, K, "middle")
    # neutros y tierras de los artefactos
    for j, xx in enumerate(cx_[:t]): w(f"M{xx-3},{by-4} V{y0+20}", FASEC["N"], 1.0)
    for j, xx in enumerate(vx): w(f"M{xx},{by-4} V{y0+20}", FASEC["PE"], 1.0)
    h.txt(cx_[0] - 6, y0 + 14, "N y PE DE LOS 3×1,5", 7.5, 400, G)
    # PAT: bulón (nueva) o bloquete + banderita (existente)
    pb = (vx[-1] + 24, by + 75)
    h.circ(pb[0], pb[1], 6, "#c9a227", K, .8); h.ln(pb[0] - 3, pb[1], pb[0] + 3, pb[1], K, .8)
    w(f"M{pb[0]},{pb[1]-6} V{by+36} H{vx[-1]} V{by+20}", FASEC["PE"], 1.6)
    w(f"M{pb[0]+5},{pb[1]+4} L{pb[0]+30},{pb[1]+30}", FASEC["PE"], 2.4)
    h.txt(pb[0] - 10, pb[1] + 4, "BLOQUETE + BANDERITA (*)" if existente else "BULON PAT", 7.5, 700, OR if existente else K, "end")
    h.txt(pb[0] + 26, pb[1] + 42, "1×10 A JABALINA", 7.5, 400, G, "end")
    return dict(xend=xend, by=by)


# ======================= 3D =======================
def rgb(c, k):
    c = c.lstrip("#"); r, g, b = (int(c[i:i + 2], 16) for i in (0, 2, 4))
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(v * k))) for v in (r, g, b))


def cyl(h, xc, yc, r, a0, a1, z0, z1, col, inner=False, n=None, st=None):
    """franja de cilindro vertical entre ángulos a0..a1 (grados) con luz de la izquierda"""
    n = n or max(2, int(abs(a1 - a0) / 6))
    for i in range(n):
        u0 = math.radians(a0 + (a1 - a0) * i / n); u1 = math.radians(a0 + (a1 - a0) * (i + 1) / n); um = (u0 + u1) / 2
        lum = .62 + .42 * math.cos(um - math.radians(100)) if not inner else .45 + .3 * math.cos(um - math.radians(280))
        c = rgb(col, lum)
        pts = [(xc + r * math.cos(u0), yc + r * math.sin(u0), z0), (xc + r * math.cos(u1), yc + r * math.sin(u1), z0),
               (xc + r * math.cos(u1), yc + r * math.sin(u1), z1), (xc + r * math.cos(u0), yc + r * math.sin(u0), z1)]
        h.F3(pts, c, c, .6)
    if st:
        for zz in (z0, z1):
            pts = [(xc + r * math.cos(math.radians(a0 + (a1 - a0) * i / 40)), yc + r * math.sin(math.radians(a0 + (a1 - a0) * i / 40)), zz) for i in range(41)]
            h.a('<polyline points="' + " ".join(f"{h.P(*p)[0]:.1f},{h.P(*p)[1]:.1f}" for p in pts) + f'" fill="none" stroke="{st}" stroke-width=".8"/>')


def ring(h, xc, yc, ro, ri, z, a0, a1, col="#d9dde1", st="#333"):
    """corte del caño (anillo) entre a0..a1 a la altura z"""
    n = 30; o = [(xc + ro * math.cos(math.radians(a0 + (a1 - a0) * i / n)), yc + ro * math.sin(math.radians(a0 + (a1 - a0) * i / n)), z) for i in range(n + 1)]
    ii = [(xc + ri * math.cos(math.radians(a1 - (a1 - a0) * i / n)), yc + ri * math.sin(math.radians(a1 - (a1 - a0) * i / n)), z) for i in range(n + 1)]
    h.F3(o + ii, col, st, .6)


def tab3d(h, X0, Y0, Z0, L, s_lab=True, tapa_bulon=True, cables=True):
    """tablerito en 3D: fondo en el plano x = X0 mirando a +x; ancho en y (centro Y0), alto en z (centro Z0)."""
    yA, yB = Y0 - PL_W / 2, Y0 + PL_W / 2; zA, zB = Z0 - PL_H / 2, Z0 + PL_H / 2
    h.BOX(X0 - PL_E, X0, yA, yB, zA, zB, "#cfd5da", "#b4bcc4", "url(#galv)", "#555", .7)
    for zz in (zB - 18, zA + 18):
        p = h.P(X0, Y0, zz); h.a(f'<ellipse cx="{p[0]:.1f}" cy="{p[1]:.1f}" rx="{3*h._s:.1f}" ry="{2*h._s:.1f}" fill="#555"/>')
    r0 = Z0 - RIEL_L / 2; r1 = Z0 + RIEL_L / 2
    h.BOX(X0, X0 + RIEL_H, Y0 - RIEL_W / 2, Y0 + RIEL_W / 2, r0, r1, "#e3e7ea", "#aab3bb", "#c9d0d6", "#555", .6)
    items = list(reversed(L)); tot = largo(L); z = Z0 - tot / 2
    pos = {}
    for tp, lab in items:          # de abajo hacia arriba (pintor)
        p = paso(tp)
        if tp == "pf":
            a = PF_A / 2
            h.BOX(X0 + RIEL_H, X0 + RIEL_H + PF_C * .75, Y0 - a, Y0 + a, z, z + p, "#f1ece0", "#cfc6b0", "#e2dac6", "#444", .6)
            h.BOX(X0 + RIEL_H + PF_C * .75, X0 + RIEL_H + PF_C, Y0 - 19, Y0 + 19, z + 2, z + p - 2, "#3a3a3a", "#202020", "#2b2b2b", "#111", .5)
            q = h.P(X0 + RIEL_H + PF_C, Y0 + 2, z + p / 2); h.txt(q[0], q[1] + 3, lab, 7, 700, "#fff", "middle", INT)
        elif tp in ("gris", "cel", "ver"):
            a = B_A / 2; col = BCOL[tp]
            h.BOX(X0 + RIEL_H, X0 + RIEL_H + B_C, Y0 - a, Y0 + a, z, z + p, rgb(col, 1.15), rgb(col, .8), col, "#333", .5)
            for sy in (-a + 7, a - 7):
                q = h.P(X0 + RIEL_H + B_C, Y0 + sy, z + p / 2); h.a(f'<circle cx="{q[0]:.1f}" cy="{q[1]:.1f}" r="{1.6*h._s:.1f}" fill="#d7dadf" stroke="#333" stroke-width=".4"/>')
        elif tp == "tope":
            h.BOX(X0 + RIEL_H, X0 + RIEL_H + 30, Y0 - 22, Y0 + 22, z, z + p, "#4a4f55", "#33373b", "#3d4146", "#111", .5)
        else:
            h.BOX(X0 + RIEL_H, X0 + RIEL_H + B_C + 6, Y0 - 30, Y0 + 30, z, z + p, "#e9c46a", "#b8952f", "#d2ad49", "#333", .4)
        pos.setdefault(tp, []).append(z + p / 2); z += p
    # bulón PAT en el agujero de abajo
    bp = h.P(X0 + 4, Y0, zA + 18)
    h.a(f'<ellipse cx="{bp[0]+2:.1f}" cy="{bp[1]:.1f}" rx="{6*h._s:.1f}" ry="{5*h._s:.1f}" fill="url(#bronce)" stroke="#5a3d10" stroke-width=".6"/>')
    pos["bulon"] = (X0 + 4, Y0, zA + 18); pos["fondo"] = (X0, Y0 + 30, zB - 30)
    return pos
