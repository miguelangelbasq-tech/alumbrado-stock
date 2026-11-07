"""Hoja común de la columna metálica recta (AP-C-005, tipo C 7 m) y de la de 4 m (AP-C-027). La llaman ap_c_005.py y ap_c_027.py.
Datos: fichas de Normas AP-C-005, AP-C-027, AP-CC-001/004, AP-CC-014, AP-TC-003; FICHAS_TEC columna_metalica, caja_columna,
borneras, fusibles; COLUMNA_MET, FUNDACIONES.Metálica, CABLE_SUBIDA_* y la nota de metodología de cajas (ORIGINAL v130); CLAUDE.md §11."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT

COL = {"gris": "#9aa0a6", "cel": "#4fa3d9", "ver": "#2e9e4f", "neg": "#1a1a1a", "galv": "#e3e6ea", "riel": "#b8bcc2", "fus": "#2b2b2b"}
FASE = {"R": "#7b3f1d", "S": "#1a1a1a", "T": "#c62828", "N": "#4fa3d9", "PE": "#2e9e4f"}


def f(v, d=0):
    return f"{v:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def hoja(c, salida):
    h = Hoja()
    HT, LL, EMP, D = c["HT"], c["LL"], c["EMP"], c["D"]
    FA, FT = c["fundA"], c["fundT"]
    ZC = 2500                       # caja de conexión sobre el piso (mínimo, AP-C-005)
    EW, EH, EZ = 76, 150, -300      # entrada de cable 150 × 76, centro a 300 o más bajo el piso
    VW, VH = 80, 250                # ventana de la caja (*) sin medida en la ficha
    PW, PH = 95, 230                # fondo de chapa galvanizada 230 × 95 (3011) (*)
    R = D / 2; WALL = 3.2

    def cablebanda(d, w, c1=K):
        h.path(d, "none", c1, w + 1.4, 'stroke-linecap="round" stroke-linejoin="round"')
        h.path(d, "none", "#fff", w, 'stroke-linecap="round" stroke-linejoin="round"')

    # ================= 1) VISTA DE FRENTE =================
    h.titulo(40, 62, "VISTA DE FRENTE", f"ESC. {c['escF']} - COTAS EN mm")
    ytop = 120; k1 = (c["yElevFin"] - ytop) / (LL + FT); y0 = ytop + LL * k1; yb = y0 + EMP * k1; yF = y0 + FT * k1; cx = 196
    fx0, fx1 = cx - FA / 2 * k1, cx + FA / 2 * k1
    h.rect(fx0 - 26, y0, 26, yF - y0 + 12, "url(#EARTH)", K, 0); h.rect(fx1, y0, 26, yF - y0 + 12, "url(#EARTH)", K, 0)
    h.rect(fx0, yF, fx1 - fx0, 12, "url(#EARTH)", K, 0)
    h.rect(fx0, y0, fx1 - fx0, yF - y0, "url(#CONC)", K, 1.2)
    h.ln(fx0 - 26, y0, fx1 + 26, y0, K, 1.6); h.ln(fx1 + 26, y0, fx1 + 74, y0, K, .5); h.nivel(fx1 + 62, y0, "±0,00")
    h.rect(cx - R * k1, y0 - LL * k1, D * k1, (LL + EMP) * k1, "#fff", K, 1.3)
    h.ln(cx - R * k1, y0, cx + R * k1, y0, K, .5, 'stroke-dasharray="3 2"')
    h.ln(cx, ytop - 14, cx, yF + 10, K, .45, h.EJE)
    yv = y0 - ZC * k1
    h.rect(cx - VW / 2 * k1, yv - VH / 2 * k1, VW * k1, VH * k1, "#e9e9e9", OR, .9)
    ye = y0 - EZ * k1
    h.rect(cx - EW / 2 * k1, ye - EH / 2 * k1, EW * k1, EH * k1, "#fff", K, .7, h.OCULTA)
    h.rect(cx + R * k1, ye - 37.5 * k1, fx1 + 26 - cx - R * k1, 75 * k1, "none", K, .6, h.OCULTA)
    h.path(f"M{fx1+26:.1f},{ye:.1f} L{cx+2:.1f},{ye:.1f} L{cx+2:.1f},{yv+VH/2*k1:.1f}", "none", K, .8, h.OCULTA)
    xL1, xL2, xL3 = fx0 - 40, fx0 - 64, fx0 - 88
    h.dimV(xL1, y0, yF, f"{f(FT)}", ext=fx0 - 28)
    h.dimV(xL2, y0, y0 - LL * k1, f"LIBRE {f(LL)}", ext=cx - R * k1 - 3)
    h.dimV(xL2, yb, y0, f"{f(EMP)}", ext=cx - R * k1 - 3)
    h.dimV(xL3, yb, y0 - LL * k1, f"Ht = {f(HT)}", ext=xL2 - 4)
    xr = cx + 34
    h.dimV(xr, y0, yv, f"{f(ZC)} MIN.", ext=cx + VW / 2 * k1 + 2)
    h.dimV(xr + 26, y0, ye, "≥300", ext=cx + R * k1 + 2)
    h.dimH(y0 - LL * k1 - 14, cx - R * k1, cx + R * k1, f"Ø{D}", ext=y0 - LL * k1 - 2)
    h.txt(fx1 + 30, ye + 18, "ENTRADA", 9, 700); h.txt(fx1 + 30, ye + 29, "150×76", 9, 400)
    h.txt(fx1 + 30, yF - 2, f"{f(FA)}×{f(FA)}", 9.5, 700); h.txt(fx1 + 30, yF + 9, "(AP-TC-003)", 8.5, 400, OR if c["fundEst"] else G)
    ya = yv
    h.ln(cx - 28, ya, cx + 20, ya, K, .9, h.EJE)
    for xx in (cx - 28, cx + 20): h.ln(xx, ya - 7, xx, ya + 7, K, 1.8)
    h.txt(cx - 34, ya + 4, "A", 12, 700, K, "end"); h.txt(cx + 24, ya - 6, "A", 12, 700)
    gx = 46
    h.globo("1", cx - R * k1, y0 - LL * k1 * .88, gx, y0 - LL * k1 * .9)
    h.globo("2", cx - VW / 2 * k1, yv - 6, gx, yv - 36)
    h.globo("10", fx1 + 10, ye, gx, y0 - 34)
    h.globo("14", fx0 + 8, yF - 10, gx, yF - 8)
    # ================= 2) CORTE B-B lateral =================
    k2 = .3 if FA <= 600 else .25
    cx2 = 448
    h.titulo(305, 62, "CORTE B-B (LATERAL)", f"ESC. {c['escB']} - POR EL EJE, LA CAJA Y LA ENTRADA")
    ZU0, ZU1 = ZC - 260, ZC + 300
    yu0 = 110; ybrk = yu0 + (ZU1 - ZU0) * k2; yl0 = ybrk + 30; ZL1 = 260
    def yB(z): return yu0 + (ZU1 - z) * k2 if z >= ZU0 - 1 else yl0 + (ZL1 - z) * k2
    yfl, yfb, yEmp = yB(0), yB(-FT), yB(-EMP)
    rx = R * k2
    bx0, bx1 = cx2 - FA / 2 * k2, cx2 + FA / 2 * k2
    h.rect(bx0 - 24, yfl, 24, yfb - yfl + 12, "url(#EARTH)", K, 0); h.rect(bx1, yfl, 34, yfb - yfl + 12, "url(#EARTH)", K, 0); h.rect(bx0, yfb, bx1 - bx0, 12, "url(#EARTH)", K, 0)
    h.rect(bx0, yfl, bx1 - bx0, yfb - yfl, "url(#CONC)", K, 1.5)
    def tubo(z0, z1):
        y0_, y1_ = yB(z1), yB(z0)
        h.rect(cx2 - rx, y0_, 2 * rx, y1_ - y0_, "#fff", "none", 0)
        h.rect(cx2 - rx, y0_, WALL * k2 + .8, y1_ - y0_, "#111", K, .3); h.rect(cx2 + rx - WALL * k2 - .8, y0_, WALL * k2 + .8, y1_ - y0_, "#111", K, .3)
    tubo(-EMP, ZL1); h.ln(cx2 - rx, yEmp, cx2 + rx, yEmp, K, 1.2)
    # entrada y caño PVC Ø75 (6004) hasta la zanja, atravesando el hormigón
    yc = yB(EZ)
    h.rect(cx2 + rx - 2, yc - EH / 2 * k2, 3, EH * k2, "#fff", K, 1)
    h.rect(cx2 + rx + 1, yc - 37.5 * k2, bx1 + 32 - cx2 - rx, 75 * k2, "#fff", K, 1)
    h.rect(cx2 + rx + 1, yc - 37.5 * k2, bx1 + 32 - cx2 - rx, 3.5 * k2 + .6, "#111", K, .2); h.rect(cx2 + rx + 1, yc + 37.5 * k2 - 3.5 * k2 - .6, bx1 + 32 - cx2 - rx, 3.5 * k2 + .6, "#111", K, .2)
    xt = cx2 + rx - 9
    for i, dx in enumerate((0, 5)):
        cablebanda(f"M{bx1+50},{yc-3+i*4:.1f} L{xt+6-dx:.1f},{yc-3+i*4:.1f} Q{xt-dx},{yc:.1f} {xt-dx:.1f},{yc-14:.1f} L{xt-dx:.1f},{yB(ZL1)-2:.1f}", 2.2)
    cablebanda(f"M{bx1+50},{yc+9:.1f} L{xt+4:.1f},{yc+9:.1f} Q{xt-10:.1f},{yc+7:.1f} {xt-10:.1f},{yc-10:.1f} L{xt-10:.1f},{yB(ZL1)-2:.1f}", 1.3)  # 1x10 PAT
    def rotura(y):
        w = rx + 10
        h.path(f"M{cx2-w:.1f},{y:.1f} l{w*.45:.1f},0 l5,-6 l6,12 l5,-6 L{cx2+w:.1f},{y:.1f}", "#fff", K, .9)
    rotura(yB(ZL1))
    tubo(ZU0, ZU1); rotura(yB(ZU0)); rotura(yB(ZU1))
    # ventana, tapa, fondo (tablerito) y bornes de perfil
    yv0, yv1 = yB(ZC + VH / 2), yB(ZC - VH / 2)
    h.rect(cx2 + rx - WALL * k2 - 1, yv0, WALL * k2 + 2, yv1 - yv0, "#fff", "none", 0)
    h.rect(cx2 + rx, yv0 - 4, 2.4, yv1 - yv0 + 8, "#111", K, .3)  # tapa
    xp = cx2 - 24.6 * k2
    h.rect(xp - 2 * k2, yB(ZC + PH / 2), 2 * k2 + .6, PH * k2, "#777", K, .3)
    h.rect(xp, yB(ZC + PH / 2 - 10), 7.5 * k2, (PH - 20) * k2, "#ccc", K, .4)
    h.rect(xp + 7.5 * k2, yB(ZC + 95), 50 * k2, 190 * k2, "#fff", K, .7)
    for zz in range(-90, 95, 16): h.ln(xp + 7.5 * k2, yB(ZC + zz), xp + 57.5 * k2, yB(ZC + zz), K, .3)
    h.circ(cx2 + rx - 6, yB(ZC - VH / 2 + 18), 3, "#fff", K, .7)  # bulón PAT
    # cables: troncal y 1x10 hasta la caja, 3x1,5 hacia arriba
    for i, dx in enumerate((0, 5)):
        xx = xt - dx
        cablebanda(f"M{xx:.1f},{yB(ZU0)-6:.1f} L{xx:.1f},{yB(ZC-VH/2)+10:.1f} Q{xx:.1f},{yB(ZC-60):.1f} {xp+58*k2:.1f},{yB(ZC-60+i*14):.1f}", 2.2)
    cablebanda(f"M{xt-10:.1f},{yB(ZU0)-6:.1f} L{xt-10:.1f},{yB(ZC-VH/2+18)+4:.1f} Q{xt-10:.1f},{yB(ZC-VH/2+18):.1f} {cx2+rx-9:.1f},{yB(ZC-VH/2+18):.1f}", 1.3)
    for i in range(3):
        xx = cx2 - rx + 5 + i * 3.6
        cablebanda(f"M{xp+58*k2:.1f},{yB(ZC+80-i*10):.1f} Q{xx:.1f},{yB(ZC+80-i*10):.1f} {xx:.1f},{yB(ZC+110):.1f} L{xx:.1f},{yB(ZU1)+6:.1f}", 1.6)
    h.ln(cx2, yB(ZU1) + 2, cx2, yB(ZU0) - 2, K, .45, h.EJE); h.ln(cx2, yB(ZL1) - 4, cx2, yfb + 8, K, .45, h.EJE)
    # cotas B-B
    h.ln(bx0 - 24, yfl, bx0, yfl, K, 1.6); h.ln(bx1, yfl, bx1 + 34, yfl, K, 1.6); h.nivel(bx0 - 16, yfl, "±0,00")
    h.dimV(bx0 - 12, yfl, yfb, f"{f(FT)}", ext=bx0 - 2)
    h.dimV(cx2 - rx - 28, yfl, yEmp, f"{f(EMP)}", ext=cx2 - rx - 2)
    h.dimV(cx2 - rx - 10, yfl, yc, "≥300", ext=None)
    h.dimV(cx2 + rx + 10, yc - EH / 2 * k2, yc + EH / 2 * k2, "150", ext=None)
    xl2 = cx2 - rx - 40
    h.ln(xl2, yB(ZU0) + 4, xl2, yB(ZC) + 4, K, .6); h.tick(xl2, yB(ZC)); h.ln(cx2 - rx - 2, yB(ZC), xl2 - 5, yB(ZC), K, .4)
    h.ln(xl2, yfl + 4, xl2, yB(ZL1) - 4, K, .6); h.tick(xl2, yfl); h.ln(bx0 - 2, yfl, xl2 - 5, yfl, K, .4)
    h.path(f"M{xl2-6},{yB(ZL1)-6} l12,-5 M{xl2-6},{yB(ZU0)+8} l12,-5", "none", K, .7)
    h.txt(xl2 - 4, (yB(ZU0) + yB(ZC)) / 2 + 10, f"{f(ZC)} MIN.", 11, 400, K, "middle", CAD, -90)
    h.dimV(cx2 + rx + 16, yv0, yv1, "(*)", ext=cx2 + rx + 3, c=OR)
    h.txt(bx1 - 4, yc + 24, "PVC Ø75", 9.5, 700, K, "end"); h.txt(bx1 - 4, yc + 35, "A ZANJA", 9, 400, K, "end")
    h.ln(cx2 - rx - 12, yB(ZC), cx2 + rx + 4, yB(ZC), K, .7, h.EJE)
    gx2 = 556
    G2 = [("3", (xp + 1, yB(ZC + 100)), yB(ZC + 100)), ("4", (xp + 30 * k2, yB(ZC + 30)), yB(ZC + 30)),
          ("5", (xp + 40 * k2, yB(ZC + 80)), yB(ZC + 60)), ("2", (cx2 + rx + 1, yB(ZC + 60)), yB(ZC + 140)),
          ("7", (cx2 - rx + 8, yB(ZC + 200)), yB(ZU1) + 14), ("6", (cx2 + rx - 6, yB(ZC - VH / 2 + 18)), yB(ZC - VH / 2)),
          ("9", (xt, yB(ZU0 + 40)), yB(ZU0 + 20)), ("10", (bx1 + 20, yc - 6), yc - 30), ("11", (bx1 + 24, yc + 9), yc + 46),
          ("14", (bx0 + 12, yfb - 12), yfb - 4)]
    G2.sort(key=lambda t: t[2]); last = -1e9
    for n, (ax, ay), gy in G2:
        gy = max(gy, last + 24); last = gy; h.globo(n, ax, ay, gx2, gy)
    # ================= 3) CORTE A-A =================
    h.titulo(590, 62, "CORTE A-A", f"POR LA CAJA - ESC. {c['escA']}")
    k3 = 1.35; ax, ay = 722, 202; Rp = R * k3
    h.circ(ax, ay, Rp, "#111", K, .8); h.circ(ax, ay, Rp - WALL * k3, "#fff", K, .6)
    a = math.degrees(math.asin(VW / 2 / R))
    x1, y1 = ax + Rp * math.sin(math.radians(a)), ay + Rp * math.cos(math.radians(a))
    h.path(f"M{ax-(x1-ax)-1:.1f},{y1-6:.1f} L{x1+1:.1f},{y1-6:.1f} L{x1+1:.1f},{ay+Rp+2:.1f} L{ax-(x1-ax)-1:.1f},{ay+Rp+2:.1f} Z", "#fff", "none", 0)
    h.rect(ax - (VW / 2 + 8) * k3, ay + Rp, (VW + 16) * k3, 2.5 * k3, "#111", K, .3)   # tapa
    yp = ay - 24.6 * k3
    h.rect(ax - PW / 2 * k3, yp - 2 * k3, PW * k3, 2 * k3, "#777", K, .4)
    h.rect(ax - 17.5 * k3, yp, 35 * k3, 7.5 * k3, "#ddd", K, .5)
    h.rect(ax - 25 * k3, yp + 7.5 * k3, 50 * k3, 50 * k3, "#fff", K, .7)
    for sx in (-1, 1): h.rect(ax + sx * 36 * k3 - 2.5, yp - 2 * k3 - 6, 5, 6 + 2 * k3, "#555", K, .3)  # tornillos cabeza tanque
    h.ln(ax, ay - Rp - 16, ax, ay + Rp + 22, K, .45, h.EJE); h.ln(ax - Rp - 14, ay, ax + Rp + 14, ay, K, .45, h.EJE)
    for yy in (ay - Rp - 16, ay + Rp + 22): h.ln(ax - 7, yy, ax + 7, yy, K, 1.8)
    h.txt(ax + 9, ay - Rp - 13, "B", 12, 700); h.txt(ax + 9, ay + Rp + 30, "B", 12, 700)
    h.dimH(ay - Rp - 30, ax - Rp, ax + Rp, f"Ø{D}", ext=ay - 2)
    h.dimH(ay + Rp + 40, ax - VW / 2 * k3, ax + VW / 2 * k3, "VENTANA (*)", ext=ay + Rp + 4, c=OR, dy=14)
    h.dimV(ax + Rp + 18, yp + 7.5 * k3, yp + 57.5 * k3, "50", ext=ax + 26 * k3)
    h.txt(ax - Rp - 6, ay + Rp + 12, "FRENTE", 9.5, 400, G, "end"); h.txt(ax + Rp + 8, ay + Rp + 8, "TAPA", 9.5, 700)
    h.txt(590, ay + 48, "2 TORN. CAB.", 9, 700); h.txt(590, ay + 59, "TANQUE 6×3/8", 9, 400); h.ln(642, ay + 50, ax - 36 * k3, yp - 4, K, .5)
    h.globo("3", ax - 40 * k3, yp - 1, ax - Rp - 22, yp + 30)
    h.globo("5", ax + 10 * k3, yp + 35 * k3, ax + Rp + 36, yp + 64)
    # ================= 4) D1 tablerito =================
    k4 = .95
    h.titulo(590, 356, "D1 - TABLERITO (AP-CC-014)", "ESC. 1:2 - VISTA DE FRENTE CON LA TAPA SACADA")
    tx, ty = 700, 450
    px0 = tx - PW / 2 * k4
    h.rect(tx - VW / 2 * k4 - 8, ty - 10, VW * k4 + 16, PH * k4 + 20, "none", OR, .7, h.OCULTA)
    h.rect(px0, ty, PW * k4, PH * k4, COL["galv"], K, .9)
    for sy in (14, PH - 14): h.circ(tx, ty + sy * k4, 3, "#666", K, .5)
    h.rect(tx - 17.5 * k4, ty + 26 * k4, 35 * k4, (PH - 52) * k4, COL["riel"], K, .6)
    seq = [("F1", "fus", 17.5), ("F2", "fus", 17.5), ("F3", "fus", 17.5), ("", "sep", 3), ("L1", "gris", 8.2), ("L2", "gris", 8.2), ("L3", "gris", 8.2), ("", "sep", 2),
           ("N", "cel", 8.2), ("N", "cel", 8.2), ("N", "cel", 8.2), ("", "sep", 2), ("PE", "ver", 8.2), ("PE", "ver", 8.2)]
    tot = sum(w for _, _, w in seq); yy = ty + (PH - tot) / 2 * k4; pos = {}
    for lab, col, w in seq:
        ww = 79.5 if col == "fus" else 50
        if col == "sep": h.rect(tx - 24 * k4, yy, 48 * k4, w * k4, "#111", K, .2)
        else:
            h.rect(tx - ww / 2 * k4, yy, ww * k4, w * k4, COL[col], K, .5)
            if col == "fus": h.rect(tx - 13 * k4, yy + 2, 26 * k4, w * k4 - 4, "#555", K, .3); h.txt(tx, yy + w * k4 / 2 + 3, lab, 7.5, 700, "#fff", "middle")
            else:
                for sx in (-17, 17): h.circ(tx + sx * k4, yy + w * k4 / 2, 1.7, "#ddd", K, .3)
        pos.setdefault(col, []).append(yy + w * k4 / 2); yy += w * k4
    # bulón PAT de bronce (borne principal de tierra, AP-CC-001)
    bpy = ty + PH * k4 + 26
    h.circ(tx, bpy, 7, "url(#bronce)", K, .7); h.path(f"M{tx-4},{bpy-2.3} l4,-2.3 l4,2.3 v4.6 l-4,2.3 l-4,-2.3 z", "#8a5f1c", K, .4)
    # cables (color): troncal entra por abajo a la izquierda, sale 3x1,5 por arriba
    def cond(x1, y1, x2, y2, col, w=1.6):
        h.path(f"M{x1:.1f},{y1:.1f} C{(x1+x2)/2:.1f},{y1:.1f} {(x1+x2)/2:.1f},{y2:.1f} {x2:.1f},{y2:.1f}", "none", col, w, 'stroke-linecap="round"')
    xin = px0 + 10; ybot = ty + PH * k4
    h.rect(xin - 5, ybot - 10, 10, 50, "#2a2a2a", K, .5)
    for i, (col, yb_) in enumerate(zip(("R", "S", "T"), pos["gris"])): cond(xin, ybot - 10, tx - 25 * k4, yb_, FASE[col])
    for yb_ in pos["cel"]: cond(xin, ybot - 10, tx - 25 * k4, yb_, FASE["N"], 1.2)
    xo = tx + PW / 2 * k4 + 22
    for i, (yf, yl, yn, yp_) in enumerate(zip(pos["fus"], pos["gris"], pos["cel"], [pos["ver"][0], pos["ver"][0], pos["ver"][1]])):
        cond(tx + 25 * k4, yl, tx + 39.7 * k4, yf, "#555", 1.1)   # 1x2,5 de la bornera al portafusible (hoja C)
        cond(tx + 39.7 * k4, yf, xo, ty - 6 - i * 4, COL["gris"], 1.4)
        cond(tx + 25 * k4, yn, xo + 4, ty - 6 - i * 4, FASE["N"], 1.1)
        cond(tx + 25 * k4, yp_, xo + 8, ty - 6 - i * 4, FASE["PE"], 1.1)
    for i in range(3):
        h.rect(xo - 2 + i * 0, ty - 34 - i * 4, 12, 26, "#2a2a2a", K, .4)
    h.txt(xo + 16, ty - 22, "3×1,5", 9, 700)
    cond(tx + 7, bpy, tx - 25 * k4, pos["ver"][1], "#2e7d32", 1.8)   # 1x6 del bulón a la bornera de tierra
    cond(xin + 12, ybot + 34, tx - 7, bpy, "#2e7d32", 2.4)            # 1x10 de la jabalina al bulón
    h.txt(xin + 8, ybot + 46, "TRONCAL + 1×10", 9, 700)
    h.txt(tx + 12, bpy - 6, "BULON PAT", 9, 700)
    h.dimV(tx + PW / 2 * k4 + 12, ty, ty + PH * k4, "230 (*)", ext=tx + PW / 2 * k4 + 2, c=OR)
    h.dimH(ty - 46, px0, px0 + PW * k4, "95 (*)", ext=ty - 2, c=OR)
    h.globo("4", tx - 30 * k4, pos["gris"][1], px0 - 24, pos["gris"][1] - 20)
    h.globo("5", tx, pos["fus"][1], px0 - 24, pos["fus"][1] - 20)
    h.globo("6", tx + 6, bpy + 3, tx + 70, bpy + 10)
    h.globo("7", xo + 5, ty - 30, xo + 62, ty - 40)
    h.globo("9", xin, ybot + 20, px0 - 24, ybot + 10)
    h.globo("8", tx + 32 * k4, pos["gris"][2] - 3, xo + 50, pos["gris"][2] + 20)
    h.globo("11", xin + 24, ybot + 30, px0 - 24, ybot + 40)
    # ================= cuadro / datos (col 3) =================
    if c.get("cuadro"):
        h.tabla(32, c["yElevFin"] + 26, [(34, "c", False), (42, "c", True), (48, "c", True), (40, "c", True), (36, "c", True), (66, "c", False)], c["cuadro"], rowh=15.6,
                titulo="CUADRO DE TIPOS (AP-C-005)", colores=lambda i, j, t: NV if (i and t == c["tipo"]) else (OR if "(*)" in t else K))
    else:
        h.tabla(40, c["yElevFin"] + 26, [(120, "l", False), (140, "c", True)], c["datos"], rowh=18, titulo="DATOS DE LA COLUMNA", colores=lambda i, j, t: OR if "(*)" in t else K)
    # ================= rayados (col 1) =================
    h.rayados(590, 734, [("CONC", "HORMIGON H-13"), ("EARTH", "TERRENO")], dx=128)
    yy = 734 + 16 + 26
    h.rect(590, yy, 30, 18, "#111", K, .6); h.txt(628, yy + 13, "PARED DE ACERO", 10.5)
    h.rect(738, yy, 30, 18, "#fff", K, 1); h.rect(739, yy + 1, 28, 2.5, "#111", K, 0); h.rect(739, yy + 14.5, 28, 2.5, "#111", K, 0); h.txt(776, yy + 13, "CAÑO PVC", 10.5)
    # ================= cómputo =================
    h.tabla(305, 826, [(215, "l", False), (78, "c", True), (252, "l", False)], c["computo"], rowh=17, titulo="COMPUTO POR COLUMNA")
    h.notas(40, 1022, c["notas"])
    # ================= 3D =================
    h.titulo(890, 62, c["tit3d"], "IZQ.: LA COLUMNA CON LA FUNDACION CORTADA A UN CUARTO · DER.: LA CAJA ABIERTA")
    tres_d(h, c, ZC, EZ, VW, VH, PW, PH)
    filas = [("POS.", "DESCRIPCION", "CANT.", "CODIGO")] + c["lista"]
    h.tabla(890, c.get("yLista", 736), [(38, "c", False), (488, "l", False), (92, "c", True), (132, "c", False)], filas, rowh=17,
            titulo="LISTA DE MATERIALES (1 COLUMNA, 3 ARTEFACTOS)", colores=lambda i, j, t: OR if (t in ("A VINCULAR", "SIN CODIGO") or "(*)" in t) else K)
    h.rotulo(890, h.H - 150, 750, c["id"], "COLUMNA METALICA RECTA", c["tit2"], "FRENTE, CORTES, TABLERITO, COMPUTO Y VISTA 3D", f"{c['escF']}·{c['escB']}·1:2", "3D S/E", fecha="07/11/2026")
    h.guardar(salida); print("ok", salida)


def tres_d(h, c, ZC, EZ, VW, VH, PW, PH):
    HT, LL, EMP, D = c["HT"], c["LL"], c["EMP"], c["D"]; FA, FT = c["fundA"], c["fundT"]; R = D / 2
    GAP = 240; S1 = (-FT, 420); S2 = (ZC - 260, ZC + 300); S3 = (LL - 360, LL)
    def zd(z):
        if z <= S1[1] + 1: return z
        if z <= S2[1] + 1: return S1[1] + GAP + (z - S2[0])
        return S1[1] + GAP + (S2[1] - S2[0]) + GAP + (z - S3[0])
    tot = zd(S3[1]) + FT
    s = min(.2, 560 / (tot + FA * .9)); ox, oy = 1010, 130 + zd(S3[1]) * s
    h.iso(s, ox, oy); c0 = FA / 2
    h.BOX(-FA * .2, FA * 1.3, -300, 0, -60, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
    h.BOX(-300, 0, 0, FA * 1.3, -60, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
    h.BOX(0, FA, 0, c0, -FT, 0, "url(#conc3)", "url(#conc3)", "url(#conc3)")
    h.BOX(0, c0, c0, FA, -FT, 0, "url(#conc3)", "url(#conc3)", "url(#conc3)")
    h.F3([(c0, c0, -FT), (FA, c0, -FT), (FA, c0, 0), (c0, c0, 0)], "#dfe2e5", "#333", .6)
    h.F3([(c0, c0, -FT), (c0, FA, -FT), (c0, FA, 0), (c0, c0, 0)], "#dfe2e5", "#333", .6)
    # caño PVC Ø75 desde la entrada hasta afuera, con los cables adentro
    h.tuboX(c0 + R * .8, FA + 300, c0, EZ, 37.5, "url(#pvc)", "#555")
    h.poly3(h.circX(FA + 300, c0, EZ, 37.5), "#e6e8eb", "#555", .7); h.poly3(h.circX(FA + 301, c0, EZ, 33), "#3d3f44", "#222", .4)
    for dy, dz in ((-12, 6), (12, 6), (0, -14)):
        h.poly3(h.circX(FA + 302, c0 + dy, EZ + dz, 8 if dz > 0 else 4, 14), "#1c1c1c" if dz > 0 else "#2e9e4f", "#000", .4)
    def tramo(z0, z1, ra, rb):
        p0 = h.P(c0, c0, zd(z0) if z0 > S1[1] else z0); p1 = h.P(c0, c0, zd(z1)); w = R * s * 1.2247
        h.a(f'<polygon points="{p0[0]-w:.1f},{p0[1]:.1f} {p1[0]-w:.1f},{p1[1]:.1f} {p1[0]+w:.1f},{p1[1]:.1f} {p0[0]+w:.1f},{p0[1]:.1f}" fill="url(#galv)" stroke="#333" stroke-width=".7"/>')
        for (p, roto, up) in ((p0, ra, False), (p1, rb, True)):
            if roto: h.path(f"M{p[0]-w:.1f},{p[1]:.1f} l{w*.6:.1f},{-4 if up else 4} l{w*.5:.1f},{6 if up else -6} l{w*.5:.1f},{-5 if up else 5} L{p[0]+w:.1f},{p[1]:.1f}", "none", "#333", 1)
            else: h.a(f'<ellipse cx="{p[0]:.1f}" cy="{p[1]:.1f}" rx="{w:.1f}" ry="{w*.577:.1f}" fill="#8f99a3" stroke="#333" stroke-width=".7"/>')
    tramo(-EMP, S1[1], False, True); tramo(S2[0], S2[1], True, True); tramo(S3[0], LL, True, False)
    # pintura asfáltica en el tramo enterrado + 300 (se ve la franja de 300 arriba del piso)
    pa, pb = h.P(c0, c0, 0), h.P(c0, c0, 300); w = R * s * 1.2247
    h.a(f'<rect x="{pa[0]-w:.1f}" y="{pb[1]:.1f}" width="{2*w:.1f}" height="{pa[1]-pb[1]:.1f}" fill="#262626" stroke="#333" stroke-width=".6"/>')
    def frente(z, u):
        x, y = h.P(c0, c0, zd(z)); return x + u * s * 1.2247, y + R * s * .707
    a, b = frente(ZC + VH / 2, -VW / 2), frente(ZC - VH / 2, VW / 2)
    h.rect(a[0], a[1], b[0] - a[0], b[1] - a[1], "#3a3f45", "#111", .7)
    h.rect(a[0] + 1.5, a[1] + 3, b[0] - a[0] - 3, b[1] - a[1] - 6, "#e3e6ea", "#555", .4)
    h.path(f"M{b[0]:.1f},{a[1]:.1f} l{(b[0]-a[0])*1.1:.1f},{(b[0]-a[0])*.6:.1f} l0,{b[1]-a[1]:.1f} L{b[0]:.1f},{b[1]:.1f} Z", "#c8ccd1", "#333", .6)
    za = frente(ZC, 0); rr = (VH + 220) / 2 * s
    h.circ(za[0], za[1], rr, "none", NV, .8, 'stroke-dasharray="4 3"'); h.ln(za[0] + rr, za[1], 1190, za[1], NV, .6, 'stroke-dasharray="4 3"')
    gx = 1146
    h.globo("1", *frente(S3[0] + 120, -R * .6), gx, frente(S3[0] + 120, 0)[1], NV, 11)
    h.globo("14", *h.P(FA * .55, 0, -FT * .45), 905, h.P(FA * .55, 0, -FT * .45)[1] + 70, NV, 11)
    pv = h.P(FA + 200, c0, EZ); h.globo("10", pv[0], pv[1], gx, pv[1] - 26, NV, 11)
    pp = frente(150, R * .6); h.globo("13", pp[0], pp[1], gx, pp[1] - 40, NV, 11)
    zoom(h, c, ZC, VW, VH, PW, PH)


def zoom(h, c, ZC, VW, VH, PW, PH):
    R = c["D"] / 2; s = .82
    ZA, ZB = ZC - 260, ZC + 330
    X0 = 1350; Y0 = 112 + (ZB - ZC) * s
    def F(u, z, d=0): return X0 + u * s * 1.2247, Y0 - (z - ZC) * s - d * s * .707
    def poly(pts, fill, st="#333", sw=.7):
        h.a('<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + f'" fill="{fill}" stroke="{st}" stroke-width="{sw}" stroke-linejoin="round"/>')
    w = R * s * 1.2247; ya, yb = F(0, ZA)[1], F(0, ZB)[1]
    poly([(X0 - w, ya), (X0 - w, yb), (X0 + w, yb), (X0 + w, ya)], "url(#galv)")
    for (y, up) in ((ya, False), (yb, True)):
        h.path(f"M{X0-w-6:.1f},{y:.1f} l{w*.6:.1f},{-5 if up else 5} l{w*.6:.1f},{8 if up else -8} l{w*.6:.1f},{-6 if up else 6} L{X0+w+6:.1f},{y:.1f}", "none", "#333", 1.2)
    def ventana(z0, z1, u0, u1):
        poly([F(u0, z0), F(u0, z1), F(u1, z1), F(u1, z0)], "#3d3f44", "#222", .6)
    ventana(ZA + 20, ZC - VH / 2 - 20, -36, 30); ventana(ZC + VH / 2 + 20, ZB - 20, -30, 30)
    def cab(pts, col="#202225", wd=5):
        d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        h.path(d, "none", "#000", wd + 1.2, 'stroke-linecap="round"'); h.path(d, "none", col, wd, 'stroke-linecap="round"')
        h.path(d, "none", "#6b7078", wd * .3, 'stroke-linecap="round" transform="translate(-1,-1)"')
    cab([F(-20, ZA + 20), F(-20, ZC - VH / 2 - 20)], wd=6); cab([F(2, ZA + 20), F(2, ZC - VH / 2 - 20)], wd=6)
    cab([F(20, ZA + 20), F(20, ZC - VH / 2 - 20)], "#2e9e4f", 3)
    for u in (-18, 0, 18): cab([F(u, ZC + VH / 2 + 20), F(u, ZB - 20)], wd=4)
    hw, hh, Dd = VW / 2, VH / 2, 82
    poly([F(-hw - 5, ZC + hh + 5), F(hw + 5, ZC + hh + 5), F(hw + 5, ZC - hh - 5), F(-hw - 5, ZC - hh - 5)], "#c9cdd2", "#333", .8)
    poly([F(-hw, ZC + hh), F(hw, ZC + hh), F(hw, ZC - hh), F(-hw, ZC - hh)], "#2c2f33", "#111", .8)
    poly([F(-hw, ZC - hh), F(hw, ZC - hh), F(hw, ZC - hh, 40), F(-hw, ZC - hh, 40)], "#5b6068", "#111", .5)
    dp = 57 + 24.6 - 2
    bx = lambda u, z: F(u, z, dp)
    poly([bx(-PW / 2 * .8, ZC + PH / 2), bx(PW / 2 * .8, ZC + PH / 2), bx(PW / 2 * .8, ZC - PH / 2), bx(-PW / 2 * .8, ZC - PH / 2)], "#e3e6ea", "#333", .6)
    poly([bx(-17.5, ZC + PH / 2 - 26), bx(17.5, ZC + PH / 2 - 26), bx(17.5, ZC - PH / 2 + 26), bx(-17.5, ZC - PH / 2 + 26)], "#b8bcc2", "#333", .5)
    seq = [("fus", 17.5)] * 3 + [("sep", 3)] + [("gris", 8.2)] * 3 + [("sep", 2)] + [("cel", 8.2)] * 3 + [("sep", 2)] + [("ver", 8.2)] * 2
    tot = sum(x for _, x in seq); z = ZC + tot / 2
    dfr = dp - 7.5 - 50
    for col, wd in seq:
        ww = 39.7 if col == "fus" else 25
        if col != "sep":
            poly([F(-ww, z, dfr), F(ww, z, dfr), F(ww, z, dp - 8), F(-ww, z, dp - 8)], "#f3f4f6" if col != "fus" else "#555", "#333", .4)
            poly([F(-ww, z, dfr), F(ww, z, dfr), F(ww, z - wd, dfr), F(-ww, z - wd, dfr)], COL[col], "#222", .5)
        z -= wd
    bp = F(-hw + 12, ZC - hh + 22, 6)
    h.circ(bp[0], bp[1], 7, "url(#bronce)", "#5a3a10", .7)
    for i, col in enumerate(("R", "S", "T")):
        x1, y1 = F(-20 + i * 3, ZC - hh, 40); x2, y2 = F(-26, ZC - 20 - i * 9, dfr)
        h.path(f"M{x1:.1f},{y1:.1f} Q{x1:.1f},{y2:.1f} {x2:.1f},{y2:.1f}", "none", FASE[col], 1.6)
    t = 140; p1, p2 = F(hw + 5, ZC + hh + 5), F(hw + 5, ZC - hh - 5); dx, dy = t * s * .866 * .9, t * s * .5 * .9
    poly([p1, (p1[0] + dx, p1[1] + dy), (p2[0] + dx, p2[1] + dy), p2], "#8d969f", "#222", .9)
    # señal «Riesgo eléctrico» en la tapa
    mx, my = (p1[0] + p2[0] + dx) / 2, (p1[1] + p2[1] + dy) / 2
    h.path(f"M{mx:.1f},{my-12:.1f} l11,19 h-22 z", "#ffd400", "#111", 1)
    h.path(f"M{mx+1:.1f},{my-6:.1f} l-4,7 h4 l-3,6 l7,-8 h-4 l3,-5 z", "#111", "none", 0)
    GX = 1494
    def g(n, p, gy, tx):
        h.globo(n, p[0], p[1], GX, gy, NV, 11); h.txt(GX + 16, gy + 4, tx, 10.5, 700, NV, "start", INT)
    g("7", F(18, ZB - 60), 140, "3×1,5 (3 ARTEF.)")
    g("2", F(-hw, ZC + hh - 20), 200, "CAJA / VENTANA")
    g("5", F(10, ZC + 70, dfr), 250, "PORTAFUSIBLES")
    g("4", F(10, ZC - 2, dfr), 300, "BORNES BPN 6")
    g("3", F(-PW / 2 * .8 + 3, ZC - 90, dp), 350, "TABLERITO")
    g("2", (mx + 6, my + 30), 400, "TAPA «RIESGO»")
    g("6", bp, 450, "BULON PAT")
    g("9", F(-20, ZA + 60), 510, "TRONCAL (2)")
    g("11", F(20, ZA + 40), 560, "1×10 DE LA PAT")
