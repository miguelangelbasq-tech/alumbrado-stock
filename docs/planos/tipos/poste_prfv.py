"""Hoja común de los postes PRFV AP-C-033-A (7 m) y AP-C-033-B (10 m). La llaman ap_c_033a.py y ap_c_033b.py.
Datos: fichas de Normas AP-C-033-A/B y TC-PRFV-01/02, COLUMNA_PRFV, FUNDACIONES, CABLE_SUBIDA_* (ORIGINAL v130), CLAUDE.md §11."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT

C30 = math.cos(math.radians(30))
COL = {"gris": "#9aa0a6", "cel": "#4fa3d9", "ver": "#2e9e4f", "neg": "#1a1a1a", "mar": "#7b3f1d", "roj": "#c62828", "galv": "#e3e6ea", "riel": "#b8bcc2", "fus": "#2b2b2b"}
FASE = {"R": COL["mar"], "S": COL["neg"], "T": COL["roj"], "N": COL["cel"], "PE": COL["ver"]}


def f(v, d=0):
    s = f"{v:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return s


def hoja(c, salida):
    h = Hoja()
    LT, LL, LE, LB, LC, CE = c["LT"], c["LL"], c["LE"], c["LB"], c["LC"], 350
    DEB, DEC = c["DEB"], c["DEC"]
    BS, BE, BD = c["bujeS"], c["bujeE"], c["bujeD"]
    FB, FP, MOL = c["fundB"], c["fundP"], c["molde"]
    PAW, PAH = c["placaA"]
    CJW, CJH, CJD = 95, 160, 87          # caja bornera IP54
    PBW, PBH = 80, 130                   # placa B = tablerito
    Z1 = LB - LE; Z2 = Z1 + 500          # ejes de las cajas, sobre el piso (*) referencia
    ZC = CE - LE                         # entrada C (negativa)

    def r(hb):  # radio en mm a la altura hb desde la base
        return (DEB - (DEB - DEC) * hb / LT) / 2

    def rz(z): return r(z + LE)
    rc = rz(Z1)

    def cablebanda(d, w, c1=K):  # banda con borde (cable en B/N)
        h.path(d, "none", c1, w + 1.4, 'stroke-linecap="round" stroke-linejoin="round"')
        h.path(d, "none", "#fff", w, 'stroke-linecap="round" stroke-linejoin="round"')

    def corte_marca(x, y, letra, vertical=True, lado=1):
        if vertical: h.ln(x - 8, y, x + 8, y, K, 1.8)
        else: h.ln(x, y - 8, x, y + 8, K, 1.8)
        h.txt(x + (10 if vertical else 0), y + (4 if vertical else -12 * lado if lado < 0 else 22), letra, 13, 700, K, "start" if vertical else "middle")

    # ================= 1) VISTA DE FRENTE (col 1) =================
    h.titulo(40, 62, "VISTA DE FRENTE", f"ESC. {c['escF']} - COTAS EN mm")
    ytop = 122; k1 = (838 - ytop) / (LL + BS + FP)
    y0 = ytop + (LL + BS) * k1; yb = y0 + LE * k1; yF = y0 + FP * k1; cx = 196
    def yh(hb): return yb - hb * k1
    fx0, fx1 = cx - FB / 2 * k1, cx + FB / 2 * k1
    h.rect(fx0 - 26, y0, 26, yF - y0 + 12, "url(#EARTH)", K, 0); h.rect(fx1, y0, 26, yF - y0 + 12, "url(#EARTH)", K, 0)
    h.rect(fx0, yF, fx1 - fx0, 12, "url(#EARTH)", K, 0)
    h.rect(fx0, y0, fx1 - fx0, yF - y0, "url(#CONC)", K, 1.2)
    h.rect(cx - MOL / 2 * k1, y0, MOL * k1, LE * k1, "url(#SAND)", K, .6)
    h.ln(fx0 - 26, y0, fx1 + 26, y0, K, 1.6); h.ln(fx1 + 26, y0, fx1 + 74, y0, K, .5); h.nivel(fx1 + 62, y0, "±0,00")
    pts = [(cx - r(0) * k1, yb), (cx - r(LT) * k1, yh(LT)), (cx + r(LT) * k1, yh(LT)), (cx + r(0) * k1, yb)]
    h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z", "#fff", K, 1.3)
    h.ln(cx - r(LE) * k1, y0, cx + r(LE) * k1, y0, K, .5, 'stroke-dasharray="3 2"')
    h.rect(cx - BD / 2 * k1, yh(LT) - BS * k1, BD * k1, BS * k1, "#fff", K, 1)
    h.rect(cx - BD / 2 * k1 + .8, yh(LT), BD * k1 - 1.6, BE * k1, "none", K, .5, h.OCULTA)
    h.ln(cx, ytop - 14, cx, yF + 10, K, .45, h.EJE)
    for z in (Z1, Z2):
        y = y0 - z * k1; h.rect(cx - CJW / 2 * k1, y - CJH / 2 * k1, CJW * k1, CJH * k1, "#e9e9e9", K, .9)
    yLC = yh(LC); h.rect(cx - 50 * k1, yLC - 50 * k1, 100 * k1, 100 * k1, "#fff", K, .7); h.ln(cx - 3, yLC - 1, cx + 3, yLC - 1, K, .4); h.ln(cx - 3, yLC + 1.5, cx + 3, yLC + 1.5, K, .4)
    yCE = yh(CE); h.rect(cx + r(CE) * k1 - 2, yCE - 25 * k1, 4, 50 * k1, "#fff", OR, .9, h.OCULTA)
    # cable que entra por la C (oculto, bajo el piso) y sube por adentro
    h.path(f"M{fx1+26:.1f},{yCE:.1f} L{cx+3:.1f},{yCE:.1f} L{cx+3:.1f},{y0-Z1*k1+CJH/2*k1:.1f}", "none", K, .7, h.OCULTA)
    # cotas izquierda
    xL1, xL2, xL3 = fx0 - 40, fx0 - 64, fx0 - 88
    h.dimV(xL1, y0, yF, f"{f(FP)}", ext=fx0 - 28)
    h.dimV(xL2, y0, yh(LT), f"LL = {f(LL)}", ext=cx - r(LE) * k1 - 3)
    h.dimV(xL2, yb, y0, f"LE {f(LE)}", ext=cx - r(0) * k1 - 3)
    h.dimV(xL3, yb, yh(LT), f"LT = {f(LT)}", ext=xL2 - 4)
    # cotas derecha (desde la base)
    xr = cx + 30
    h.dimV(xr, yb, yCE, "350", ext=cx + r(0) * k1 + 3)
    h.dimV(xr + 24, yb, yLC, f"LC = {f(LC)}", ext=cx + 6)
    h.dimV(xr + 50, yb, y0 - Z1 * k1, f"LB = {f(LB)}", ext=cx + CJW / 2 * k1 + 2)
    h.dimV(xr + 50, y0 - Z1 * k1, y0 - Z2 * k1, "500", ext=cx + CJW / 2 * k1 + 2)
    h.dimV(xr + 6, yh(LT), yh(LT) - BS * k1, f"{BS}", ext=cx + BD / 2 * k1 + 2)
    h.txt(xr + 16, yh(LT) - BS * k1 / 2 + 4, f"Ø{c['bujeTxt']}", 10, 400)
    h.txt(cx - r(LT) * k1 - 6, yh(LT) + 14, f"Ø{DEC}", 10.5, 700, K, "end"); h.txt(cx - r(LT) * k1 - 6, yh(LT) + 26, "(DEC)", 9, 400, G, "end")
    h.txt(fx1 + 30, yF - 6, f"Ø{DEB}", 10.5, 700, K, "start"); h.txt(fx1 + 30, yF + 6, "(DEB)", 9, 400, G, "start"); h.ln(fx1 + 28, yF - 10, cx + r(0) * k1, yb - 2, K, .5)
    h.txt(fx1 + 30, yCE + 4, "«C»", 10, 700, OR)
    ya = y0 - Z1 * k1
    h.ln(cx - 30, ya, cx + 22, ya, K, .9, h.EJE)
    for xx in (cx - 30, cx + 22): h.ln(xx, ya - 7, xx, ya + 7, K, 1.8)
    h.txt(cx - 36, ya + 4, "A", 12, 700, K, "end"); h.txt(cx + 26, ya - 6, "A", 12, 700)
    gx = 46
    h.globo("1", cx - 2, yh(LT * .6), gx, yh(LT * .62))
    h.globo("2", cx - CJW / 2 * k1 + 1, y0 - Z1 * k1 + 4, gx, y0 - Z1 * k1 + 34)
    h.globo("3", cx - CJW / 2 * k1 + 1, y0 - Z2 * k1 - 4, gx, y0 - Z2 * k1 - 30)
    h.globo("12", cx - BD / 2 * k1, yh(LT) - BS * k1 * .5, gx, yh(LT) - BS * k1 * .5)
    h.globo("13", cx - 4, yLC, gx, yLC - 26)
    h.globo("11", cx + r(CE) * k1, yCE, gx, y0 - 30)
    h.globo("14", fx0 + 8, yF - 12, gx, yF - 10)
    # ================= 2) CORTE B-B lateral por el eje (col 2) =================
    k2 = .25 if FB <= 600 else .2
    cx2 = 445 if FB <= 600 else 440
    h.titulo(305, 62, "CORTE B-B (LATERAL)", f"ESC. {c['escB']} - POR EL EJE, LAS CAJAS Y LA «C»")
    ZU0, ZU1 = Z1 - 200, Z2 + 330
    yu0 = 108; ybrk = yu0 + (ZU1 - ZU0) * k2; yl0 = ybrk + 30; ZL1 = 300
    def yB(z): return yu0 + (ZU1 - z) * k2 if z >= ZU0 - 1 else yl0 + (ZL1 - z) * k2
    yfl = yB(0); yfb = yB(-FP)
    def rx(z): return rz(z) * k2
    # --- zona baja: terreno, fundación, poste empotrado
    bx0, bx1 = cx2 - FB / 2 * k2, cx2 + FB / 2 * k2
    h.rect(bx0 - 26, yfl, 26, yfb - yfl + 12, "url(#EARTH)", K, 0); h.rect(bx1, yfl, 26, yfb - yfl + 12, "url(#EARTH)", K, 0); h.rect(bx0, yfb, bx1 - bx0, 12, "url(#EARTH)", K, 0)
    h.rect(bx0, yfl, bx1 - bx0, yfb - yfl, "url(#CONC)", K, 1.5)
    mx0, mx1 = cx2 - MOL / 2 * k2, cx2 + MOL / 2 * k2; yEmp = yB(-LE)
    h.rect(mx0, yfl, mx1 - mx0, yEmp - yfl, "url(#SAND)", K, .8)
    h.rect(mx0, yfl, mx1 - mx0, 50 * k2, "url(#CONCP)", K, .5)
    yT = yB(ZC)  # telgopor hasta la «C» (fondo del hueco + 350)
    h.rect(mx1, yfl, bx1 - mx1, yT - yfl - 50 * k2, "url(#FOAM)", K, .8)
    h.rect(cx2 - 12.7 * k2 * 1.5, yEmp, 25.4 * k2 * 1.5, yfb - yEmp + 12, "#fff", K, .6)  # desagüe
    # poste en corte (pared maciza en negro) desde la base hasta la rotura
    def pared(z0, z1):
        pl = [(cx2 - rx(z), yB(z)) for z in (z0, z1)]; pr = [(cx2 + rx(z), yB(z)) for z in (z0, z1)]
        h.path(f"M{pl[0][0]:.1f},{pl[0][1]:.1f} L{pl[1][0]:.1f},{pl[1][1]:.1f} L{pr[1][0]:.1f},{pr[1][1]:.1f} L{pr[0][0]:.1f},{pr[0][1]:.1f} Z", "#fff", "none", 0)
        for s in (-1, 1):
            a = (cx2 + s * rx(z0), yB(z0)); b = (cx2 + s * rx(z1), yB(z1))
            h.path(f"M{a[0]:.1f},{a[1]:.1f} L{b[0]:.1f},{b[1]:.1f} L{b[0]-s*2.4:.1f},{b[1]:.1f} L{a[0]-s*2.4:.1f},{a[1]:.1f} Z", "#111", K, .3)
    pared(-LE, ZL1); h.ln(cx2 - rx(-LE), yEmp, cx2 + rx(-LE), yEmp, K, 1.2)
    # entrada C: hoy el cable pasa por el canal que deja el telgopor (sin caño); variante: caño PEAD (punteado)
    yc = yT - 25 * k2
    h.rect(cx2 + rx(ZC) - 3, yc - 26 * k2, 3.2, 52 * k2, "#fff", OR, 1)
    h.rect(mx1, yc - 25 * k2, bx1 + 22 - mx1, 50 * k2, "none", K, .6, 'stroke-dasharray="2 2"')
    # troncal: viene de la zanja por el canal del telgopor, entra por la C y sube por adentro
    xt = cx2 + rx(ZC) - 8
    for i, dx in enumerate((0, 5)):
        cablebanda(f"M{bx1+24},{yc-1.5+i*3:.1f} L{xt+6-dx:.1f},{yc-1.5+i*3:.1f} Q{xt-dx},{yc:.1f} {xt-dx:.1f},{yc-14:.1f} L{xt-dx:.1f},{yB(ZL1)-2:.1f}", 2.2)
    h.ln(cx2, yB(ZL1) - 4, cx2, yfb + 8, K, .45, h.EJE)
    # rotura arriba de la zona baja
    def rotura(y, z):
        w = rx(z) + 10
        h.path(f"M{cx2-w:.1f},{y:.1f} l{w*.45:.1f},0 l5,-6 l6,12 l5,-6 L{cx2+w:.1f},{y:.1f}", "#fff", K, .9)
    rotura(yB(ZL1), ZL1)
    # --- zona alta: cajas
    pared(ZU0, ZU1); rotura(yB(ZU0), ZU0); rotura(yB(ZU1), ZU1)
    for z, nom in ((Z1, "ab"), (Z2, "ar")):
        yc0, yc1 = yB(z + CJH / 2), yB(z - CJH / 2); xf = cx2 + rx(z); xbk = xf - CJD * k2
        h.rect(xbk, yc0, xf - xbk, yc1 - yc0, "#fff", "none", 0)
        h.rect(xbk, yc0, xf - xbk, yc1 - yc0, "none", K, 1.1)
        h.rect(xf - 1, yc0 - 3, 3, yc1 - yc0 + 6, "#111", K, .3)  # tapa
        h.rect(xbk - 2.2, yB(z + PAH / 2), 2.2, PAH * k2, "#555", K, .4)  # placa A
        h.rect(xbk + 1, yB(z + PBH / 2), 1.2, PBH * k2, "#999", K, .3)   # placa B
        h.rect(xbk + 2.2, yB(z + 17.5), 7.5 * k2, 35 * k2, "#ccc", K, .4)  # riel
        h.rect(xbk + 2.2 + 7.5 * k2, yB(z + 25), 50 * k2, 50 * k2, "#fff", K, .7)  # bornes de perfil
    # 4x4 entre cajas (libre) y 3x1,5 hacia arriba
    xi = cx2 - rx(Z1) * .25
    cablebanda(f"M{cx2+rx(Z1)-CJD*k2+4:.1f},{yB(Z1+CJH/2)+1:.1f} Q{xi:.1f},{yB(Z1+CJH/2)-10:.1f} {xi:.1f},{yB(Z1+CJH/2)-30:.1f} L{xi:.1f},{yB(Z2-CJH/2)+26:.1f} Q{xi:.1f},{yB(Z2-CJH/2)+6:.1f} {cx2+rx(Z2)-CJD*k2+4:.1f},{yB(Z2-CJH/2)-1:.1f}", 2.6)
    for i in range(3):
        xx = cx2 - rx(Z2) * .55 + i * 4.2
        cablebanda(f"M{cx2+rx(Z2)-CJD*k2+4:.1f},{yB(Z2+CJH/2)+1:.1f} Q{xx:.1f},{yB(Z2+CJH/2)-4:.1f} {xx:.1f},{yB(Z2+CJH/2)-16:.1f} L{xx:.1f},{yB(ZU1)+6:.1f}", 1.8)
    for i, dx in enumerate((0, 5)):  # troncal sube a la caja de abajo
        xx = cx2 + rx(Z1) - 10 - dx
        cablebanda(f"M{xx:.1f},{yB(ZU0)-6:.1f} L{xx:.1f},{yB(Z1-CJH/2)+8:.1f} Q{xx:.1f},{yB(Z1-CJH/2)+2:.1f} {cx2+rx(Z1)-CJD*k2+6:.1f},{yB(Z1-CJH/2)-2:.1f}", 2.2)
    h.ln(cx2, yB(ZU1) + 2, cx2, yB(ZU0) - 2, K, .45, h.EJE)
    # cotas B-B
    xl = cx2 - rx(0) - 22
    h.ln(cx2 - rx(0) - 30, yfl, bx0, yfl, K, 1.6); h.ln(bx1, yfl, bx1 + 26, yfl, K, 1.6)
    h.nivel(bx0 - 22, yfl, "±0,00")
    h.dimV(bx0 - 12, yfl, yT - 25 * k2, f"{f(-ZC)}", ext=cx2 + rx(ZC) - 3 if False else None)
    h.dimV(bx0 - 12, yfl, yfb, "", ext=bx0 - 2)
    h.txt(bx0 - 16, (yfl + yfb) / 2 + 30, f"{f(FP)}", 11, 400, K, "middle", CAD, -90)
    # cota 350 base -> C, a la derecha dentro del hormigón no: va a la izquierda del poste
    h.dimV(cx2 - rx(-LE) - 10, yEmp, yc, "350", ext=None)
    h.dimV(xl, yB(Z1), yB(Z2), "500", ext=cx2 - rx(Z2) - 2)
    xl2 = cx2 - rx(Z1) - 44
    h.ln(xl2, yB(ZU0) + 4, xl2, yB(Z1) + 4, K, .6); h.tick(xl2, yB(Z1)); h.ln(cx2 - rx(Z1) - 2, yB(Z1), xl2 - 5, yB(Z1), K, .4)
    h.ln(xl2, yfl + 4, xl2, yB(ZL1) - 4, K, .6); h.tick(xl2, yfl); h.ln(bx0 - 2, yfl, xl2 - 5, yfl, K, .4)
    h.path(f"M{xl2-6},{yB(ZL1)-6} l12,-5 M{xl2-6},{yB(ZU0)+8} l12,-5", "none", K, .7)
    h.txt(xl2 - 4, (yB(ZU0) + yB(Z1)) / 2 + 20, f"{f(Z1)} (*)", 11, 400, OR, "middle", CAD, -90)
    h.dimV(cx2 + rx(Z1) + 14, yB(Z1 + CJH / 2), yB(Z1 - CJH / 2), "160", ext=cx2 + rx(Z1) + 3)
    h.dimH(yB(Z2 + CJH / 2) - 10, cx2 + rx(Z2) - CJD * k2, cx2 + rx(Z2), "87", ext=yB(Z2 + CJH / 2) - 2)
    h.txt(cx2 + rx(ZC) + 8, yc - 8, "«C»", 10.5, 700, OR)
    h.txt(bx1 + 4, yc + 16, "A ZANJA", 9.5, 700)
    # marca A-A en el corte B-B
    h.ln(cx2 - rx(Z1) - 12, yB(Z1), cx2 + rx(Z1) + 2, yB(Z1), K, .7, h.EJE)
    gx2 = 552
    G2 = [("3", (cx2 + rx(Z2) - CJD * k2 * .5, yB(Z2 + CJH / 2 - 20)), yB(Z2) - 58),
          ("4", (cx2 + rx(Z2) - CJD * k2 - 1, yB(Z2 + 50)), yB(Z2) - 32),
          ("6", (cx2 + rx(Z2) - CJD * k2 + 10, yB(Z2)), yB(Z2) - 6),
          ("9", (cx2 - rx(Z2) * .55 + 4, yB(Z2 + CJH / 2 + 120)), yB(ZU1) + 14),
          ("8", (xi, (yB(Z1) + yB(Z2)) / 2), (yB(Z1) + yB(Z2)) / 2 + 12),
          ("5", (cx2 + rx(Z1) - CJD * k2 + 1.6, yB(Z1 + 40)), yB(Z1) - 22),
          ("2", (cx2 + rx(Z1) - CJD * k2 * .5, yB(Z1 - CJH / 2 + 15)), yB(Z1) + 6),
          ("10", (cx2 + rx(Z1) - 12, yB(ZU0 + 50)), yB(Z1) + 36),
          ("11", (cx2 + rx(ZC) - 1, yc), yc - 24),
          ("14", (bx1 - 14, yfb - 14), yfb - 8)]
    G2.sort(key=lambda t: t[2]); last = -1e9; G2b = []
    for n, a, gy in G2:
        gy = max(gy, last + 24); last = gy; G2b.append((n, a, gy))
    for n, (ax, ay), gy in G2b: h.globo(n, ax, ay, gx2, gy)
    # ================= 3) CORTE A-A (col 3) =================
    h.titulo(590, 62, "CORTE A-A", f"POR LA CAJA DE ABAJO - ESC. {c['escA']}")
    k3 = min(1.05, 168 / (2 * rc)); ax, ay = 712, 222; R = rc * k3; wpx = max(2.6, c.get("esp", 4) * k3)
    h.circ(ax, ay, R, "#111", K, .8); h.circ(ax, ay, R - wpx, "#fff", K, .6)
    ffr = ay + R; bk = ffr - CJD * k3
    h.rect(ax - CJW / 2 * k3, bk, CJW * k3, CJD * k3 + 2, "#fff", "none", 0)
    h.rect(ax - CJW / 2 * k3, bk, CJW * k3, CJD * k3, "none", K, 1.2)
    h.rect(ax - PAW / 2 * k3, bk - 3 * k3, PAW * k3, 3 * k3, "#666", K, .6)                 # placa A (*)
    h.rect(ax - PBW / 2 * k3, bk + 3 * k3, PBW * k3, 2 * k3, "#bbb", K, .5)                 # placa B
    h.rect(ax - (PBW / 2 - 2) * k3, bk + 5 * k3, (PBW - 4) * k3, 7.5 * k3, "#ddd", K, .5)   # riel
    xs = ax - 18 * k3; yb0 = bk + 12.5 * k3
    for i, (lab, w) in enumerate((("N", 8.2), ("", 2), ("R", 8.2), ("S", 8.2), ("T", 8.2))):
        h.rect(xs, yb0, w * k3, 50 * k3, "#fff" if lab else "#111", K, .6)
        if lab and k3 > .8: h.txt(xs + w * k3 / 2, yb0 + 50 * k3 + 11, lab, 8.5, 700, K, "middle")
        xs += w * k3
    if k3 <= .8: h.txt(ax, yb0 + 50 * k3 + 11, "N·R·S·T", 8.5, 700, K, "middle")
    h.rect(ax - (CJW / 2 + 5) * k3, ffr - 1, (CJW + 10) * k3, 3.2 * k3, "#111", K, .3)  # tapa
    h.ln(ax, ay - R - 16, ax, ffr + 22, K, .45, h.EJE); h.ln(ax - R - 14, ay, ax + R + 14, ay, K, .45, h.EJE)
    for yy, s in ((ay - R - 16, -1), (ffr + 22, 1)):
        h.ln(ax - 7, yy, ax + 7, yy, K, 1.8)
    h.txt(ax + 9, ay - R - 13, "B", 12, 700); h.txt(ax + 9, ffr + 30, "B", 12, 700)
    h.dimH(ffr + 40, ax - CJW / 2 * k3, ax + CJW / 2 * k3, "95", ext=ffr + 4, dy=13)
    h.dimV(ax + R + 22, bk, ffr, "87", ext=ax + CJW / 2 * k3 + 2)
    h.dimH(ay - R - 26, ax - R, ax + R, f"Ø≈{f(2*rc)}", ext=ay - 2)
    h.txt(ax - R - 8, bk - 2, f"PLACA A {PAW}", 9.5, 700, K, "end"); h.ln(ax - R - 6, bk - 5, ax - PAW / 2 * k3 + 4, bk - 1.5 * k3, K, .5)
    h.txt(ax + R + 6, ffr + 8, "TAPA", 9.5, 700); h.txt(ax - R - 4, ffr + 8, "FRENTE", 9.5, 400, G, "end")
    h.globo("6", ax + 6 * k3, yb0 + 25 * k3, ax + R + 46, yb0 + 10)
    h.globo("5", ax - 30 * k3, bk + 4 * k3, ax - R - 30, bk + 26)
    # ================= 4) D1 / D2 tableritos (col 3) =================
    k4 = 1.0
    h.titulo(590, 376, "D1 · D2 - TABLERITOS (PLACA B)", "ESC. 1:1 - CON LA TAPA SACADA (TC-PRFV-01)")
    def tablerito(x0, y0_, arriba):
        # caja (frente) y acceso
        h.rect(x0 - CJW / 2 * k4, y0_, CJW * k4, CJH * k4, "#fff", K, 1.4)
        h.rect(x0 - 85 / 2 * k4, y0_ + 5 * k4, 85 * k4, 150 * k4, "none", K, .5, h.OCULTA)
        px, py = x0 - PBW / 2 * k4, y0_ + 15 * k4
        h.rect(px, py, PBW * k4, PBH * k4, COL["galv"], K, .9)
        for yy, sep in ((30, 60), (70, 50), (105, 50)):
            for s in (-1, 1): h.circ(x0 + s * sep / 2 * k4, py + yy * k4, 1.8, "#fff", K, .6)
        ry = py + 70 * k4
        h.rect(px + 2, ry - 17.5 * k4, PBW * k4 - 4, 35 * k4, COL["riel"], K, .6)
        h.ln(px + 2, ry - 11 * k4, px + PBW * k4 - 2, ry - 11 * k4, "#888", .5); h.ln(px + 2, ry + 11 * k4, px + PBW * k4 - 2, ry + 11 * k4, "#888", .5)
        if not arriba:
            seq = [("N", "cel", 8.2), ("", "neg", 2), ("R", "gris", 8.2), ("S", "gris", 8.2), ("T", "gris", 8.2)]
        else:
            seq = [("PE", "ver", 8.2), ("PE", "ver", 8.2), ("N", "cel", 8.2), ("S", "fus", 17.5), ("T", "fus", 17.5)]
        tw = sum(w for _, _, w in seq) + (3 if arriba else 0); xs = x0 - tw / 2 * k4; pos = {}
        for lab, col, w in seq:
            hh = 79.5 if col == "fus" else 50
            h.rect(xs, ry - hh / 2 * k4, w * k4, hh * k4, COL[col], K, .6)
            if col == "fus":
                h.rect(xs + 2, ry - 14 * k4, w * k4 - 4, 28 * k4, "#555", K, .4)
                h.txt(xs + w * k4 / 2, ry + 3, lab, 8.5, 700, "#fff", "middle")
            elif lab:
                for yy in (-17, 17): h.circ(xs + w * k4 / 2, ry + yy * k4, 2, "#ddd", K, .4)
            pos[lab + str(len(pos))] = xs + w * k4 / 2
            if lab and col != "fus": h.txt(xs + w * k4 / 2, ry + 4, lab if lab != "PE" else "", 7, 700, "#fff", "middle")
            xs += w * k4 + (3 if (arriba and col == "cel") else 0)
        if arriba:  # peine sobre PE-PE-N
            xa = x0 - tw / 2 * k4; h.rect(xa + 1, ry - 27 * k4, (3 * 8.2) * k4 - 2, 4 * k4, "#c9a227", K, .5)
        return px, py, ry, pos
    tx1, tx2, ty = 638, 792, 446
    p1 = tablerito(tx1, ty, False); p2 = tablerito(tx2, ty, True)
    # cables en el detalle (color)
    ybot = ty + CJH * k4
    def cond(x1, y1, x2, y2, col, w=2.2):
        h.path(f"M{x1:.1f},{y1:.1f} C{x1:.1f},{(y1+y2)/2:.1f} {x2:.1f},{(y1+y2)/2:.1f} {x2:.1f},{y2:.1f}", "none", col, w, 'stroke-linecap="round"')
    ry1 = p1[2]; xs = [v for v in p1[3].values()]
    for j, dx in enumerate((-16, 16)):   # troncal llega y sigue: dos cables por abajo
        xe = tx1 + dx; h.rect(xe - 5, ybot - 2, 10, 26, "#2a2a2a", K, .5)
        for col, xb in zip(("N", "R", "S", "T"), (xs[0], xs[2], xs[3], xs[4])):
            cond(xe + (-3 + "NRST".index(col) * 2), ybot - 2, xb + (j * 2 - 1), ry1 + 25 * k4, FASE[col], 1.5)
    # 4x4: sale por arriba de la caja de abajo (N, S, T) y entra por abajo en la de arriba
    yt1 = ty
    h.rect(tx1 - 6, yt1 - 22, 12, 22, "#2a2a2a", K, .5)
    for col, xb in (("N", xs[0]), ("S", xs[3]), ("T", xs[4])):
        cond(tx1 + "NST".index(col) * 3 - 3, yt1, xb, ry1 - 25 * k4, FASE[col], 1.6)
    cond(tx1 + 5, yt1, tx1 + 14, ty + 20, FASE["R"], 1.6); h.circ(tx1 + 14, ty + 21, 2.2, "#ffd54f", K, .5)  # R reserva, encintada
    h.txt(tx1 + 10, yt1 - 12, "4×4 ↑ (8)", 9, 700, K, "start")
    h.txt(tx2 + 10, ybot + 14, "↑ 4×4 (8)", 9, 700, K, "start")
    xs2 = [v for v in p2[3].values()]; ry2 = p2[2]
    h.rect(tx2 - 6, ybot, 12, 22, "#2a2a2a", K, .5)
    for col, xb in (("N", xs2[2]), ("S", xs2[3]), ("T", xs2[4])):
        cond(tx2 + "NST".index(col) * 3 - 3, ybot, xb, ry2 + (25 if col == "N" else 38) * k4, FASE[col], 1.6)
    # 3x1,5 a los artefactos: arriba
    for i, (fz, xf) in enumerate((("S", xs2[3]), ("S", xs2[3]), ("T", xs2[4]))):
        xe = tx2 - 30 + i * 30; h.rect(xe - 4, ty - 26, 8, 26, "#2a2a2a", K, .5)
        cond(xe - 2, ty, xf + (i - 1) * 1.5, ry2 - 38 * k4, COL["gris"], 1.3)
        cond(xe, ty, xs2[2] + (i - 1), ry2 - 25 * k4, FASE["N"], 1.3)
        cond(xe + 2, ty, xs2[min(i, 1)] + (i - 1), ry2 - 25 * k4, FASE["PE"], 1.3)
        h.txt(xe, ty - 30, f"A{i+1}", 9, 700, K, "middle")
    h.txt(tx1, ybot + 48, "ABAJO: N · SEP · R · S · T", 9.5, 700, K, "middle")
    h.txt(tx1, ybot + 60, "ENTRA EL TRONCAL", 9, 400, G, "middle")
    h.txt(tx2, ybot + 52, "ARRIBA: PE · PE · N + FUS. S · T", 9.5, 700, K, "middle")
    h.dimV(tx1 - CJW / 2 * k4 - 10, ty, ybot, "160", ext=tx1 - CJW / 2 * k4 - 2)
    h.dimV(tx1 + CJW / 2 * k4 + 9, p1[1], p1[1] + PBH * k4, "130", ext=tx1 + PBW / 2 * k4 + 2)
    h.txt(tx2, ybot + 64, "PLACA B 80 × 130", 9, 400, G, "middle")
    h.globo("7", xs2[4] + 4, ry2 + 30 * k4, tx2 + 36, ybot + 30)
    h.globo("15", xs2[0] + 2, ry2 - 25 * k4, tx2 - CJW / 2 * k4 - 20, ry2 - 62)
    h.globo("6", xs[2] + 1, ry1 - 10 * k4, tx1 + CJW / 2 * k4 + 30, ry1 - 20)
    h.globo("10", tx1 + 16, ybot + 18, tx1 + CJW / 2 * k4 + 26, ybot + 22)
    # ================= rayados (col 3) =================
    h.rayados(590, 690, [("CONC", "HORMIGON H-13"), ("SAND", "ARENA SECA"), ("FOAM", "TELGOPOR"), ("CONCP", "SELLO"), ("EARTH", "TERRENO")], dx=128)
    h.rect(590 + 128, 690 + 16 + 2 * 26, 30, 18, "#111", K, .6); h.txt(590 + 128 + 38, 690 + 16 + 2 * 26 + 13, "PARED PRFV", 10.5)
    # ================= datos del poste (col 1, abajo) =================
    h.tabla(40, 868, [(100, "l", False), (160, "c", True)],
            [("DATO", "VALOR"), ("LT / LL / LE", f"{f(LT)} / {f(LL)} / {f(LE)}"), ("Ø BASE / CIMA", f"{DEB} / {DEC} mm"),
             ("CONIC. / FLECHA", f"{c['conic']} mm/m · {f(LL/10)}"), ("TRAB. / ROTURA", "65 / 130 kgf · FS 2"), ("PESO", c["pesoTxt"])], rowh=17, titulo="DATOS DEL POSTE")
    # ================= cómputo (abajo, col 2-3) =================
    sub = LL / 1000 - 3.5 + .4 + .6
    h.tabla(305, 798, [(205, "l", False), (78, "c", True), (262, "l", False)],
            [("POR COLUMNA (3 ARTEFACTOS)", "CANT.", "CALCULO"),
             ("CABLE 3×1,5 (6001)", f"{f(3*sub,1)} m", f"3 × ({f(LL/1000,2)} − 3,50 + 0,40 + 0,60) = 3 × {f(sub,2)}"),
             ("CABLE 4×4 ENTRE CAJAS (1010)", "1 m", "N, S Y T; LA R QUEDA DE RESERVA"),
             ("PUNTERAS TIF 4 (2031)", "6", "3 CONDUCTORES × 2 PUNTAS"),
             ("BPN 6 GRIS (2009)", "3", "R · S · T EN LA CAJA DE ABAJO"),
             ("BPN 6 CELESTE (2008)", "2", "1 ABAJO + 1 ARRIBA"),
             ("BPN 6 VERDE (2010)", "2", "PE · PE ARRIBA (3 CON JABALINA)"),
             ("PEINE (2027) + SEPARADOR (2041)", "3 el. + 1", "PE-PE-N ARRIBA · SEP. ENTRE N Y R"),
             ("PORTAFUSIBLE 10×38 (3053)", "2", "UNO POR FASE: S Y T"),
             ("FUSIBLE 10×38: 4 A (3073) / 2 A (3017)", "1 + 1", "S = ART. 1 Y 2 → 4 A · T = ART. 3 → 2 A"),
             ("GANANCIA DEL TRONCAL", "8 m", "2 SUBIDAS × (3,50 + 0,50) · COLUMNA INTERMEDIA")],
            rowh=17, titulo="COMPUTO POR COLUMNA")
    # ================= notas =================
    h.notas(40, 1004, c["notas"])
    # ================= 3D =================
    h.titulo(890, 62, f"VISTA 3D - POSTE PRFV {c['alto']} m", "IZQ.: EL POSTE CON LA FUNDACION CORTADA A UN CUARTO · DER.: LAS DOS CAJAS ABIERTAS")
    tres_d(h, c, r, rz, Z1, Z2, ZC)
    # lista de materiales
    filas = [("POS.", "DESCRIPCION", "CANT.", "CODIGO")] + c["lista"]
    h.tabla(890, 716, [(38, "c", False), (488, "l", False), (92, "c", True), (132, "c", False)], filas, rowh=17,
            titulo="LISTA DE MATERIALES (1 POSTE, 3 ARTEFACTOS)", colores=lambda i, j, t: OR if (t in ("A VINCULAR", "SIN CODIGO") or "(*)" in t) else K)
    h.rotulo(890, h.H - 150, 750, c["id"], "POSTE DE PRFV", f"ALTURA LIBRE {c['alto']},0 m", "FRENTE, CORTES, TABLERITOS, COMPUTO Y VISTA 3D", f"{c['escF']}·{c['escB']}·1:1", "3D S/E", fecha="07/11/2026")
    h.guardar(salida); print("ok", salida)


def tres_d(h, c, r, rz, Z1, Z2, ZC):
    LT, LL, LE = c["LT"], c["LL"], c["LE"]; FB, FP, MOL = c["fundB"], c["fundP"], c["molde"]
    BS, BD = c["bujeS"], c["bujeD"]
    # ---------- vista general con roturas ----------
    GAP = 260; S1 = (-FP, 450); S2 = (Z1 - 260, Z2 + 260); S3 = (LL - 380, LL + BS)
    def zd(z):
        if z <= S1[1] + 1: return z
        if z <= S2[1] + 1: return S1[1] + GAP + (z - S2[0])
        return S1[1] + GAP + (S2[1] - S2[0]) + GAP + (z - S3[0])
    tot = zd(S3[1]) + FP
    s = 570 / (tot + FB * .9); s = min(s, .2)
    ox, oy = 1010, 120 + zd(S3[1]) * s
    h.iso(s, ox, oy)
    c0 = FB / 2; rm = MOL / 2
    def P(x, y, z): return h.P(x, y, zd(z) if z > S1[1] else z)
    # piso de atrás
    h.BOX(-FB * .2, FB * 1.25, -320, 0, -60, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
    h.BOX(-320, 0, 0, FB * 1.25, -60, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
    h.BOX(0, FB, 0, c0, -FP, 0, "url(#conc3)", "url(#conc3)", "url(#conc3)")
    h.BOX(0, c0, c0, FB, -FP, 0, "url(#conc3)", "url(#conc3)", "url(#conc3)")
    def cy_(x0, x1, z0, z1, fill): h.F3([(x0, c0, z0), (x1, c0, z0), (x1, c0, z1), (x0, c0, z1)], fill, "#333", .6)
    def cx_(y0, y1, z0, z1, fill): h.F3([(c0, y0, z0), (c0, y1, z0), (c0, y1, z1), (c0, y0, z1)], fill, "#333", .6)
    cy_(c0, FB, -FP, 0, "#dfe2e5"); cx_(c0, FB, -FP, 0, "#dfe2e5")
    cy_(c0, c0 + rm, -LE, 0, "url(#sand3)"); cx_(c0, c0 + rm, -LE, 0, "url(#sand3)")
    cy_(c0, c0 + rm, -50, 0, "url(#concP3)"); cx_(c0, c0 + rm, -50, 0, "url(#concP3)")
    cy_(c0 + rm, FB, ZC, 0, "#f4f4f4")
    # cable de la acometida: de la zanja, por el canal del telgopor, a la C (dos cables: llega y sigue)
    for dy in (-14, 14):
        h.tuboX(c0 + rz(ZC) * .9, FB + 260, c0 + dy, ZC - 16, 7, "url(#pead)", "#000")
        h.poly3(h.circX(FB + 260, c0 + dy, ZC - 16, 7, 16), "#1c1c1c", "#000", .5)
        for i, col in enumerate(["#7b3f1d", "#1a1a1a", "#c62828", "#4fa3d9"]):
            a = math.radians(45 + 90 * i); h.poly3(h.circX(FB + 261, c0 + dy + 3.2 * math.cos(a), ZC - 16 + 3.2 * math.sin(a), 2, 10), col, "#000", .2)
    # poste por tramos (cono) con roturas
    def tramo(z0, z1, roto_abajo, roto_arriba):
        p0, p1 = h.P(c0, c0, zd(z0) if z0 > S1[1] else z0), h.P(c0, c0, zd(z1))
        w0, w1 = rz(z0) * s * 1.2247, rz(z1) * s * 1.2247
        h.a(f'<polygon points="{p0[0]-w0:.1f},{p0[1]:.1f} {p1[0]-w1:.1f},{p1[1]:.1f} {p1[0]+w1:.1f},{p1[1]:.1f} {p0[0]+w0:.1f},{p0[1]:.1f}" fill="url(#prfv)" stroke="#333" stroke-width=".7"/>')
        h.a(f'<polygon points="{p0[0]-w0:.1f},{p0[1]:.1f} {p1[0]-w1:.1f},{p1[1]:.1f} {p1[0]+w1:.1f},{p1[1]:.1f} {p0[0]+w0:.1f},{p0[1]:.1f}" fill="url(#fibra)" stroke="none"/>')
        for (p, w, roto, up) in ((p0, w0, roto_abajo, False), (p1, w1, roto_arriba, True)):
            if roto:
                d = f"M{p[0]-w:.1f},{p[1]:.1f} l{w*.6:.1f},{-4 if up else 4} l{w*.5:.1f},{6 if up else -6} l{w*.5:.1f},{-5 if up else 5} L{p[0]+w:.1f},{p[1]:.1f}"
                h.path(d, "none", "#333", 1)
            else:
                h.a(f'<ellipse cx="{p[0]:.1f}" cy="{p[1]:.1f}" rx="{w:.1f}" ry="{w*.577:.1f}" fill="#7a807e" stroke="#333" stroke-width=".7"/>')
    tramo(-LE, S1[1], False, True)
    def frente0(z, u):
        x, y = h.P(c0, c0, z); return x + u * s * 1.2247, y + rz(z) * s * .707
    a, b = frente0(380, -30), frente0(60, 30)
    h.rect(a[0], a[1], b[0] - a[0], b[1] - a[1], "#3d3f44", "#222", .5)
    for u in (-14, 10): p, q = frente0(380, u), frente0(60, u); h.ln(p[0], p[1] + 2, q[0], q[1] - 2, "#111", 4.2); h.ln(p[0], p[1] + 2, q[0], q[1] - 2, "#555", 1.2)
    tramo(S2[0], S2[1], True, True); tramo(S3[0], LT - LE, True, False)
    # buje
    pb0, pb1 = h.P(c0, c0, zd(LL)), h.P(c0, c0, zd(LL + BS)); wb = BD / 2 * s * 1.2247
    h.a(f'<rect x="{pb1[0]-wb:.1f}" y="{pb1[1]:.1f}" width="{2*wb:.1f}" height="{pb0[1]-pb1[1]:.1f}" fill="{c['bujeFill']}" stroke="#333" stroke-width=".7"/>')
    h.a(f'<ellipse cx="{pb1[0]:.1f}" cy="{pb1[1]:.1f}" rx="{wb:.1f}" ry="{wb*.577:.1f}" fill="#9aa0a6" stroke="#333" stroke-width=".7"/>')
    # cajas abiertas (chiquitas), placa de características
    def frente(z, u):  # punto en el frente del poste (u en mm horizontal)
        x, y = h.P(c0, c0, zd(z)); return x + u * s * 1.2247, y + rz(z) * s * .707
    for z in (Z1, Z2):
        a = frente(z + 80, -47.5); b = frente(z - 80, 47.5)
        h.rect(a[0], a[1], b[0] - a[0], b[1] - a[1], "#3a3f45", "#111", .7)
        h.rect(a[0] + 2, a[1] + 3, b[0] - a[0] - 4, b[1] - a[1] - 6, "#e3e6ea", "#555", .4)
        h.path(f"M{b[0]:.1f},{a[1]:.1f} l{(b[0]-a[0])*.8:.1f},{(b[0]-a[0])*.5:.1f} l0,{b[1]-a[1]:.1f} L{b[0]:.1f},{b[1]:.1f} Z", "#c8ccd1", "#333", .6)
    # (placa de características está en el tramo roto: no se dibuja; se ve en el frente)
    # lupa hacia el zoom
    za = frente((Z1 + Z2) / 2, 0)
    h.circ(za[0], za[1], (Z2 - Z1 + 300) / 2 * s, "none", NV, .8, 'stroke-dasharray="4 3"')
    h.ln(za[0] + (Z2 - Z1 + 300) / 2 * s, za[1], 1188, za[1], NV, .6, 'stroke-dasharray="4 3"')
    gx = 1150
    h.globo("1", *frente(S2[0] + 60, -20), gx - 10, frente(S2[0] + 60, 0)[1] + 40, NV, 11)
    h.globo("12", pb1[0] + wb, (pb0[1] + pb1[1]) / 2, gx - 10, (pb0[1] + pb1[1]) / 2, NV, 11)
    h.globo("14", *h.P(FB * .55, 0, -FP * .45), 905, h.P(FB * .55, 0, -FP * .45)[1] + 80, NV, 11)
    h.globo("11", *h.P(FB + 120, c0, ZC - 25), gx - 6, h.P(FB + 120, c0, ZC - 25)[1] - 16, NV, 11)
    pc = h.P(c0, c0 + rm * .8, -LE * .5)
    # ---------- zoom de las cajas ----------
    zoom(h, c, rz, Z1, Z2)


def zoom(h, c, rz, Z1, Z2):
    s = .5 if c["DEB"] < 300 else .42
    ZA, ZB = Z1 - 230, Z2 + 270
    X0 = 1360; Y0 = 108 + ZB * s
    def F(u, z, d=0):  # frente del poste: u horizontal, z altura, d hacia adentro
        return X0 + u * s * 1.2247, Y0 - z * s - (rz(z) - 0) * 0 - d * s * .707
    def poly(pts, fill, st="#333", sw=.7):
        h.a('<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + f'" fill="{fill}" stroke="{st}" stroke-width="{sw}" stroke-linejoin="round"/>')
    # silueta del poste
    wa, wb = rz(ZA) * s * 1.2247, rz(ZB) * s * 1.2247
    ya, yb = Y0 - ZA * s, Y0 - ZB * s
    poly([(X0 - wa, ya), (X0 - wb, yb), (X0 + wb, yb), (X0 + wa, ya)], "url(#prfv)")
    poly([(X0 - wa, ya), (X0 - wb, yb), (X0 + wb, yb), (X0 + wa, ya)], "url(#fibra)", "none", 0)
    for (y, w, up) in ((ya, wa, False), (yb, wb, True)):
        h.path(f"M{X0-w-6:.1f},{y:.1f} l{w*.6:.1f},{-5 if up else 5} l{w*.6:.1f},{8 if up else -8} l{w*.6:.1f},{-6 if up else 6} L{X0+w+6:.1f},{y:.1f}", "none", "#333", 1.2)
    # ventanas de corte en la pared (para ver los cables por dentro)
    def ventana(z0, z1, u0, u1):
        poly([F(u0, z0), F(u0, z1), F(u1, z1), F(u1, z0)], "#3d3f44", "#222", .6)
        poly([F(u0, z1), F(u0, z1, -6), F(u1, z1, -6), F(u1, z1)], "#9aa0a6", "#222", .4)
    zt1, zb2 = Z1 + 80, Z2 - 80
    ventana(zt1 + 30, zb2 - 30, -30, 30)
    ventana(ZA + 20, Z1 - 80 - 25, -34, 12)
    ventana(Z2 + 80 + 25, ZB - 20, -36, 36)
    def cab(pts, col="#202225", w=5):
        d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        h.path(d, "none", "#000", w + 1.2, 'stroke-linecap="round" stroke-linejoin="round"'); h.path(d, "none", col, w, 'stroke-linecap="round" stroke-linejoin="round"')
        h.path(d, "none", "#6b7078", w * .3, 'stroke-linecap="round" stroke-linejoin="round" transform="translate(-1,-1)"')
    # troncal (dos cables) desde abajo hasta la caja de abajo
    cab([F(-24, ZA + 20), F(-24, Z1 - 80 - 25)], w=6); cab([F(0, ZA + 20), F(0, Z1 - 80 - 25)], w=6)
    # 4x4 entre cajas
    cab([F(0, zt1 + 30), F(0, zb2 - 30)], w=5.4)
    # 3x1,5 hacia arriba
    for u in (-22, 0, 22): cab([F(u, Z2 + 80 + 25), F(u, ZB - 20)], w=4)
    # cajas
    def caja(z, arriba):
        hw, hh, D = 47.5, 80, 87
        a, b = F(-hw, z + hh), F(hw, z - hh)
        # marco de la caja
        poly([F(-hw - 5, z + hh + 5), F(hw + 5, z + hh + 5), F(hw + 5, z - hh - 5), F(-hw - 5, z - hh - 5)], "#c9cdd2", "#333", .8)
        # interior: fondo (placa A) y piso de la caja
        poly([F(-hw, z + hh), F(hw, z + hh), F(hw, z - hh), F(-hw, z - hh)], "#2c2f33", "#111", .8)
        poly([F(-hw, z - hh + D * .707 * 0), F(hw, z - hh), F(hw, z - hh, D), F(-hw, z - hh, D)], "#5b6068", "#111", .5)
        bx = lambda u, zz: F(u, zz, D - 4)
        poly([bx(-40, z + 65), bx(40, z + 65), bx(40, z - 65), bx(-40, z - 65)], "#e3e6ea", "#333", .6)   # placa B
        poly([bx(-38, z + 17.5), bx(38, z + 17.5), bx(38, z - 17.5), bx(-38, z - 17.5)], "#b8bcc2", "#333", .5)  # riel
        if not arriba: seq = [("cel", 8.2), ("neg", 2), ("gris", 8.2), ("gris", 8.2), ("gris", 8.2)]
        else: seq = [("ver", 8.2), ("ver", 8.2), ("cel", 8.2), ("fus", 17.5), ("fus", 17.5)]
        tw = sum(w for _, w in seq); u = -tw / 2
        for col, w in seq:
            hh2 = 39.7 if col == "fus" else 25
            dfr = D - 4 - 7.5 - 50     # cara de adelante del borne
            top = [F(u, z + hh2, dfr), F(u + w, z + hh2, dfr), F(u + w, z + hh2, D - 11), F(u, z + hh2, D - 11)]
            poly(top, "#f3f4f6" if col != "fus" else "#555", "#333", .4)
            poly([F(u, z + hh2, dfr), F(u + w, z + hh2, dfr), F(u + w, z - hh2, dfr), F(u, z - hh2, dfr)], COL[col], "#222", .5)
            u += w
        if arriba:
            u0 = -tw / 2; poly([F(u0, z + 28, D - 61), F(u0 + 24.6, z + 28, D - 61), F(u0 + 24.6, z + 24, D - 61), F(u0, z + 24, D - 61)], "#c9a227", "#333", .4)
        # tapa abierta (bisagra a la derecha)
        t = 120
        p1, p2 = F(hw + 5, z + hh + 5), F(hw + 5, z - hh - 5)
        dx, dy = t * s * .866 * .9, t * s * .5 * .9
        poly([p1, (p1[0] + dx, p1[1] + dy), (p2[0] + dx, p2[1] + dy), p2], "#aeb4ba", "#333", .8)
        poly([(p1[0] + dx * .15, p1[1] + dy * .15 + 8), (p1[0] + dx * .85, p1[1] + dy * .85 + 8), (p2[0] + dx * .85, p2[1] + dy * .85 - 8), (p2[0] + dx * .15, p2[1] + dy * .15 - 8)], "none", "#7b828a", .6)
        return a, b
    a1, b1 = caja(Z1, False); a2, b2 = caja(Z2, True)
    # conductores visibles dentro de las cajas (detalle)
    D = 87
    for i, col in enumerate(("N", "R", "S", "T")):
        x1, y1 = F(-12 + i * 3, Z1 - 80, 40); x2, y2 = F(-16 + i * 9 + (2 if i else 0), Z1 - 25, 27)
        h.path(f"M{x1:.1f},{y1:.1f} Q{x1:.1f},{y2+8:.1f} {x2:.1f},{y2:.1f}", "none", FASE[col], 1.6)
    for i, col in enumerate(("N", "S", "T")):
        x1, y1 = F(-4 + i * 3, Z1 + 80, 40); x2, y2 = F([-16, 3.3, 11.5][i], Z1 + 25, 27)
        h.path(f"M{x1:.1f},{y1:.1f} Q{x1:.1f},{y2-6:.1f} {x2:.1f},{y2:.1f}", "none", FASE[col], 1.6)
        x1, y1 = F(-4 + i * 3, Z2 - 80, 40); x2, y2 = F([-4, 6, 24][i], Z2 - 30, 27)
        h.path(f"M{x1:.1f},{y1:.1f} Q{x1:.1f},{y2+6:.1f} {x2:.1f},{y2:.1f}", "none", FASE[col], 1.6)
    for i, u in enumerate((-22, 0, 22)):
        x1, y1 = F(u, Z2 + 80, 40)
        for j, (col, ub) in enumerate(((COL["gris"], 6 if i < 2 else 24), (FASE["N"], -4), (FASE["PE"], -12))):
            x2, y2 = F(ub + j, Z2 + 30, 27)
            h.path(f"M{x1+j:.1f},{y1:.1f} Q{x1+j:.1f},{y2-6:.1f} {x2:.1f},{y2:.1f}", "none", col, 1.2)
    # globos del zoom
    GX = 1494
    def g(n, p, gy, t):
        h.globo(n, p[0], p[1], GX, gy, NV, 11); h.txt(GX + 16, gy + 4, t, 10.5, 700, NV, "start", INT)
    g("9", F(22, ZB - 60), 138, "3×1,5 (3 ARTEF.)")
    g("3", F(-40, Z2 + 60), 178, "CAJA DE ARRIBA")
    g("7", F(16, Z2 - 10, 40), 218, "FUSIBLES S · T")
    g("15", F(-30, Z2 + 26, 60), 258, "PEINE PE·PE·N")
    g("8", F(0, (Z1 + Z2) / 2), 330, "4×4 SIN CAÑO")
    g("2", F(-40, Z1 + 60), 400, "CAJA DE ABAJO")
    g("6", F(0, Z1, 40), 440, "BORNES N·R·S·T")
    g("5", F(-38, Z1 - 55, 83), 480, "PLACA B")
    g("10", F(-24, ZA + 60), 560, "TRONCAL (2)")
    for z in (Z1, Z2):
        tp = F(47.5 + 5, z); h.txt(tp[0] + 120 * s * .866 * .45, tp[1] + 22, "TAPA", 9.5, 700, "#333", "middle", INT)
