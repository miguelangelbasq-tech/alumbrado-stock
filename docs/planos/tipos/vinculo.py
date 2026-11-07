"""Hoja común de los vínculos / capuchones (AP-C-008, AP-C-034, AP-C-040, AP-C-038, AP-C-011).
Datos (ORIGINAL v130): fichas de Normas AP-C-008/034/040/038/011 y AP-C-033-A/B; VINCULOS (opciones de la calculadora, brazoM);
FICHAS_TEC vinculos (caño Ø60,3, 5° o 15°, códigos 6013/6016/6019-6022/4019/4038) y luminaria_led (575×312×93 de referencia,
manguito Ø60,3/Ø42,4); nota ETG cap. 25 / Anexo C de la calculadora (entrada 63±1, empotramiento 100-200, prisioneros vs bulón);
cómputo de la calculadora (4019, 4038, 5029 uno por artefacto); CABLE_SUBIDA_* ; cable 3×1,5 Ø11,1 → 3/4"; CLAUDE.md §11."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT

C30 = math.cos(math.radians(30))
MAR, CEL, VA = "#7b3f1d", "#4fa3d9", "#2e9e4f"
V3 = (1, 1, 1)


def f(v, d=0):
    return f"{v:,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def hoja(c, salida):
    h = Hoja()
    VAR = c["variantes"]; PR = VAR[c.get("principal", 0)]
    ARMS = PR["arms"]; N = len(ARMS)
    L = c["L"]; ALF = 5; TA = math.tan(math.radians(ALF))
    col = c["col"]
    bD, bDi, bS, bE, DEC = col["bD"], col["bDi"], col["bS"], col["bE"], col["DEC"]
    ESP = col.get("esp", 4)
    capD = bD + 12; capH = 250; capT = 6           # (*) capuchón: Ø, largo de la camisa y tapa
    zTop = bS + capT                                 # arriba del capuchón (desde la cima del poste)
    zCap0 = zTop - capH                              # borde de abajo de la camisa
    zA = zTop - 70                                   # (*) eje de los brazos en el capuchón
    AD, AW = 60.3, 3.2                               # brazo caño Ø60,3, pared (*)
    LUM, LW, LH, EMP = 575, 312, 93, 150             # luminaria de referencia; empotramiento 100-200
    rcap = capD / 2
    OCTO = c.get("octo")                             # apotema del aro octogonal (*) o None
    r0arm = OCTO if OCTO else rcap
    zT = zA + (L - r0arm) * TA                       # altura del eje en la punta del brazo
    zC = zCap0 + 70                                  # nivel del corte C-C (prisioneros) (*)
    ext = L - EMP + LUM * math.cos(math.radians(ALF))

    def z_arm(r): return zA + (r - r0arm) * TA

    # ---------- ayudas 2D
    def cablebanda(d, w, c1=K, extra=""):
        h.path(d, "none", c1, w + 1.2, 'stroke-linecap="round" stroke-linejoin="round" ' + extra)
        h.path(d, "none", "#fff", max(w - .2, .6), 'stroke-linecap="round" stroke-linejoin="round" ' + extra)

    def poly(pts, fill="#fff", st=K, sw=1, extra=""):
        h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z", fill, st, sw, extra)

    def cable3(cx, cy, r, hilos=True):
        """3×1,5 en corte: cubierta, relleno, F marrón, N celeste, PE verde-amarillo, cuerda de hilos."""
        h.circ(cx, cy, r, "#1d1d1d", K, .8); h.circ(cx, cy, r * .84, "#cfcfcf", K, .35)
        rc, d = r * .4, r * .44
        for i, col_ in enumerate([MAR, CEL, VA]):
            a = math.radians(90 + 120 * i); x = cx + d * math.cos(a); y = cy - d * math.sin(a)
            h.circ(x, y, rc, col_, K, .4)
            if col_ == VA:
                h.a(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rc:.2f}" fill="none" stroke="#f2d22e" stroke-width="{rc*.45:.2f}" stroke-dasharray="{rc*.55:.2f} {rc*.55:.2f}"/>')
            rcu = rc * .66; h.circ(x, y, rcu, "#d08a3f", K, .3)
            if hilos:
                rh = rcu / 3
                for px, py in [(0, 0)] + [(2 * rh * math.cos(math.radians(60 * j)), 2 * rh * math.sin(math.radians(60 * j))) for j in range(6)]:
                    h.circ(x + px, y + py, rh * .95, "#e7a35a", "#7a4512", .3)

    def marcaCorte(x, y, letra, horiz=True):
        if horiz: h.ln(x, y - 8, x, y + 8, K, 1.8); h.txt(x, y - 12, letra, 13, 700, K, "middle")
        else: h.ln(x - 8, y, x + 8, y, K, 1.8); h.txt(x + 12, y + 5, letra, 13, 700)

    # ================= 1) CORTE A-A (VISTA LATERAL) =================
    LX0, LX1, LY0, LY1 = 40, 590, 128, 470
    zmin = -560; zmax = zT + LUM * math.sin(math.radians(ALF)) + 80
    k = min((LX1 - LX0 - 70) / (2 * ext), (LY1 - LY0) / (zmax - zmin))
    esc = c.get("escL") or f"1:{round(4 / k / 5) * 5}"
    h.titulo(40, 62, "CORTE A-A · VISTA LATERAL", f"ESC. {esc} - COTAS EN mm - POR EL EJE Y EL BRAZO 1 ({PR['nombre']})")
    cx = (LX0 + LX1) / 2; y0 = LY1 - (0 - zmin) * k   # y0 = cima del poste

    def Y(z): return y0 - z * k

    def X(r, th=0): return cx + r * math.cos(math.radians(th)) * k

    # brazos que quedan detrás del plano de corte (sinθ>0): en vista, línea fina
    def brazo2d(th, cortado):
        p = math.cos(math.radians(th))
        rr = r0arm
        if abs(p) < .05:     # de punta: se ve el tubo como círculo y la luminaria de frente
            yt = Y(zT); h.rect(cx - LW / 2 * k, yt - LH * .55 * k, LW * k, LH * k, "#fff", K, .7)
            h.circ(cx, Y(z_arm(rr + 60)), AD / 2 * k, "#fff", K, .7)
            return
        x0 = X(rr, th); x1 = X(L, th); ya = Y(z_arm(rr)); yb = Y(zT)
        hw = AD / 2 * k
        if cortado:
            poly([(x0, ya - hw), (x1, yb - hw), (x1, yb + hw), (x0, ya + hw)], "#fff", K, .9)
            poly([(x0, ya - hw), (x1, yb - hw), (x1, yb - hw + AW * k + .5), (x0, ya - hw + AW * k + .5)], K, K, .3)
            poly([(x0, ya + hw - AW * k - .5), (x1, yb + hw - AW * k - .5), (x1, yb + hw), (x0, ya + hw)], K, K, .3)
        else:
            poly([(x0, ya - hw), (x1, yb - hw), (x1, yb + hw), (x0, ya + hw)], "#fff", K, .6)
        # luminaria (en vista), inclinada α, con la parte del brazo adentro oculta
        s = 1 if p > 0 else -1
        ca, sa = math.cos(math.radians(ALF)), math.sin(math.radians(ALF))
        rA = L - EMP
        xa, za = rA, z_arm(rA)
        def pt(u, w):  # u a lo largo del brazo, w perpendicular
            return (X(xa + u * ca - w * sa, th), Y(za + u * sa + w * ca)) if True else None
        pts = [pt(0, -LH * .45), pt(0, LH * .45), pt(LUM - 70, LH * .55), pt(LUM, LH * .2), pt(LUM, -LH * .3), pt(LUM - 40, -LH * .45)]
        poly(pts, "#fff", K, 1.1 if cortado else .7)
        if cortado:
            a0, a1 = pt(0, 0), pt(EMP, 0)
            h.ln(*pt(0, hw / k), *pt(EMP, hw / k), K, .6, h.OCULTA); h.ln(*pt(0, -hw / k), *pt(EMP, -hw / k), K, .6, h.OCULTA)
            b0, b1 = pt(EMP / 2, LH * .45), pt(EMP / 2, -LH * .45)
            h.ln(*b0, *b1, K, 1.4)       # bulón pasante
            h.ln(*pt(LUM * .45, -LH * .45), *pt(LUM * .9, -LH * .45), K, 2.2)   # vidrio LED (abajo)
        return pts

    tras = [t for t in ARMS if math.sin(math.radians(t)) > 0.05]
    enplano = [t for t in ARMS if abs(math.sin(math.radians(t))) <= 0.05]
    for t in tras: brazo2d(t, False)
    # aro octogonal: en el plano se cortan los dos lados; la mitad de atrás se ve como banda
    if OCTO:
        R8 = OCTO / math.cos(math.radians(22.5))
        h.rect(X(-R8), Y(zA) - AD / 2 * k, (2 * R8) * k, AD * k, "#fff", K, .6)
    # poste (corte): paredes
    rT = DEC / 2
    yb = Y(zmin + 40)
    for sg in (-1, 1):
        xo = cx + sg * rT * k; xi = cx + sg * (rT - ESP) * k
        poly([(xo, Y(0)), (xi, Y(0)), (xi, yb), (xo, yb)], col["fillB"], K, .9)
    h.ln(cx - rT * k, Y(0), cx + rT * k, Y(0), K, .5)
    # quiebre abajo
    h.path(f"M{cx - rT*k - 8},{yb} l8,0 l4,-6 l4,12 l4,-6 h{2*rT*k-12+8}", "none", K, .8)
    h.txt(cx + rT * k + 12, yb + 4, f"SIGUE EL {col['nombre']}", 9.5, 400, G)
    # buje / adaptador (corte)
    for sg in (-1, 1):
        xo = cx + sg * bD / 2 * k; xi = cx + sg * bDi / 2 * k
        poly([(xo, Y(bS)), (xi, Y(bS)), (xi, Y(-bE)), (xo, Y(-bE))], col["fillBuje"], K, .8)
    h.ln(cx - bD / 2 * k, Y(-bE), cx + bD / 2 * k, Y(-bE), K, .6)
    # capuchón (corte): camisa + tapa
    for sg in (-1, 1):
        xo = cx + sg * rcap * k; xi = cx + sg * (rcap - 3) * k
        poly([(xo, Y(zTop)), (xi, Y(zTop)), (xi, Y(zCap0)), (xo, Y(zCap0))], "url(#ANSI31)", K, 1)
    h.rect(cx - rcap * k, Y(zTop), capD * k, capT * k, "url(#ANSI31)", K, 1)
    # prisioneros de fijación del capuchón (*)
    for sg in (-1, 1):
        xx = cx + sg * rcap * k
        h.rect(min(xx, xx + sg * 7) , Y(zC) - 2.2, 7, 4.4, OR, OR, .5)
    # brazos en el plano de corte
    for t in enplano: brazo2d(t, True)
    if OCTO:   # el aro cortado por A-A: dos secciones del caño
        for sg in (-1, 1):
            h.circ(X(OCTO * sg), Y(zA), AD / 2 * k, "url(#ANSI31)", OR, 1); h.circ(X(OCTO * sg), Y(zA), (AD / 2 - AW) * k, "#fff", OR, .5)
    # cables 3×1,5: suben por adentro del poste y del buje y entran a cada brazo
    cw = max(11.1 * k, 1.6); sp = 13 * k
    offs = [(i - (N - 1) / 2) * sp for i in range(N)]
    for i, t in enumerate(ARMS):
        p = math.cos(math.radians(t)); xo = cx + offs[i]
        if abs(math.sin(math.radians(t))) <= .05:
            s = 1 if p > 0 else -1
            ytop = Y(zA) + (i - (N - 1) / 2) * 0
            xin = X(r0arm, t); xt = X(L + 25, t)
            d = f"M{xo:.1f},{yb:.1f} V{Y(zA)+6:.1f} Q{xo:.1f},{Y(zA):.1f} {xo + s*8:.1f},{Y(zA):.1f} L{xin:.1f},{Y(z_arm(r0arm)):.1f} L{xt:.1f},{Y(z_arm(L+25)):.1f}"
            cablebanda(d, cw)
        else:
            d = f"M{xo:.1f},{yb:.1f} V{Y(zA)+6:.1f}"
            cablebanda(d, cw)
            h.path(f"M{xo:.1f},{Y(zA)+6:.1f} L{xo + p*rcap*k*.8:.1f},{Y(zA):.1f}", "none", K, .7, h.OCULTA)
    h.ln(cx, Y(zmax - 30), cx, yb + 6, K, .45, h.EJE)
    # nivel de la cima
    h.ln(cx + rT * k, Y(0), cx + rT * k + 70, Y(0), K, .4)
    h.nivel(cx + rT * k + 56, Y(0), f"CIMA {col['nombre']}")
    # ---- cotas
    tipx = X(L, 0) if 0 in [round(t) % 360 for t in enplano] else X(L, 180)
    sgL = 1 if tipx > cx else -1
    yd = Y(zT + LH * .6) - 30
    h.dimH(yd, min(cx, tipx), max(cx, tipx), f"{f(L)} (*)" if c.get("Lstar") else f(L), ext=Y(zT) - AD / 2 * k - 4)
    h.ln(cx, yd + 4, cx, Y(zTop) - 20, K, .4)
    h.dimH(Y(zTop) - 16, cx - rcap * k, cx + rcap * k, f"Ø≈{capD:.0f} (*)", ext=Y(zTop) - 2, c=OR)
    # ángulo α
    xr = X(r0arm, 0 if sgL > 0 else 180); yr = Y(zA)
    R_ = 70 * (1 if k > .15 else 1.4)
    a2 = math.radians(ALF)
    h.ln(xr, yr, xr + sgL * (R_ + 18), yr, K, .4, h.OCULTA)
    h.path(f"M{xr + sgL*R_:.1f},{yr:.1f} A{R_},{R_} 0 0 {0 if sgL>0 else 1} {xr + sgL*R_*math.cos(a2):.1f},{yr - R_*math.sin(a2):.1f}", "none", K, .7)
    h.txt(xr + sgL * (R_ + 6), yr + 14, "5° (O 15°)", 10.5, 700, K, "start" if sgL > 0 else "end")
    # buje: 468 / 240
    xdb = cx + (rT + 24) * k + 4
    xdb = max(xdb, cx + rcap * k + 20)
    h.dimV(xdb + 22, Y(bS), Y(0), f(bS), ext=cx + bD / 2 * k + 2)
    h.dimV(xdb + 22, Y(0), Y(-bE), f(bE), ext=cx + bD / 2 * k + 2)
    # capuchón
    xdc = cx - rcap * k - 18
    h.dimV(xdc, Y(zTop), Y(zCap0), f"{capH} (*)", ext=cx - rcap * k - 2, c=OR)
    # globos del corte
    gxL = LX0 + 12
    gl_ = sorted([("1", cx - rcap * k + 1, Y(zCap0 + 120) - 30, Y(zCap0 + 120), K), ("10", cx - rcap * k - 3, Y(zC), Y(zC), OR),
                  ("8", cx - bD / 2 * k + 1, Y(80), Y(80), K), ("9", cx - rT * k + 1, Y(-300), Y(-300), K), ("4", cx + offs[0], Y(-430), Y(-400), K)], key=lambda t: t[2])
    prev = -1e9
    for n_, ax_, gy_, ay_, cc in gl_:
        gy_ = max(gy_, prev + 30); prev = gy_
        h.globo(n_, ax_, ay_, gxL, gy_, cc)
    # texto Ø
    h.txt(xdb + 34, Y(bS * .55), col["bTxt"], 10, 400, K, "start")
    # corte C-C en la camisa
    h.ln(cx - rcap * k - 14, Y(zC), cx + rcap * k + 14, Y(zC), K, .9, h.EJE)
    for sg in (-1, 1): h.ln(cx + sg * (rcap * k + 14), Y(zC) - 7, cx + sg * (rcap * k + 14), Y(zC) + 7, K, 1.8)
    h.txt(cx + rcap * k + 18, Y(zC) - 6, "C", 12, 700)
    # llamada D2 en la punta del brazo 1
    t1 = enplano[-1] if enplano else ARMS[0]
    xd2, yd2 = X(L - EMP / 2, t1), Y(z_arm(L - EMP / 2))
    h.llamadaDet(xd2, yd2, max(18, EMP * .6 * k), "D2")
    # globos de la luminaria y del brazo
    h.globo("2", X((r0arm + L - EMP) / 2, t1), Y(z_arm((r0arm + L - EMP) / 2)) + AD / 2 * k, X((r0arm + L - EMP) / 2, t1), Y(zA) + 95)
    t1 = enplano[0] if enplano else ARMS[0]
    xl = X(L + LUM * .55, t1); h.globo("3", xl, Y(zT + 30), xl, Y(zmax) - 4)

    # ================= 2) VISTA DESDE ARRIBA =================
    PX0, PX1, PY0, PY1 = 618, 842, 128, 470
    multi = len(VAR) > 1
    h.titulo(618, 62, "VISTA DESDE ARRIBA", "")

    def planta(v, pcx, pcy, kp, cotas=True, corteAA=True):
        arms = v["arms"]
        R8 = None
        if v.get("octo"):
            R8 = v["octo"] / math.cos(math.radians(22.5))
            ang8 = [22.5 + 45 * i for i in range(8)]
            if v.get("medio"): ang8 = [a for a in ang8 if 0 < a < 180] ; ang8 = [0] + ang8 + [180]
            pts = [(pcx + (R8 if a % 45 else v["octo"]) * math.cos(math.radians(a)) * kp, pcy - (R8 if a % 45 else v["octo"]) * math.sin(math.radians(a)) * kp) for a in ang8]
            dd = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + ("" if v.get("medio") else " Z")
            h.path(dd, "none", K, AD * kp + 1.2); h.path(dd, "none", "#fff", max(AD * kp - .8, .6))
        for th in arms:
            ca, sa = math.cos(math.radians(th)), -math.sin(math.radians(th))
            r_a = v.get("octo") or rcap
            def q(r, w): return (pcx + (r * ca - w * sa) * kp, pcy + (r * sa + w * ca) * kp)
            poly([q(r_a, -AD / 2), q(L - EMP, -AD / 2), q(L - EMP, AD / 2), q(r_a, AD / 2)], "#fff", K, .8)
            rr = L - EMP
            lp = [q(rr, -LW * .35), q(rr + 60, -LW / 2), q(rr + LUM - 60, -LW / 2), q(rr + LUM, -LW * .3), q(rr + LUM, LW * .3), q(rr + LUM - 60, LW / 2), q(rr + 60, LW / 2), q(rr, LW * .35)]
            poly(lp, "#fff", K, 1)
            poly([q(rr + LUM * .42, -LW * .3), q(rr + LUM * .9, -LW * .3), q(rr + LUM * .9, LW * .3), q(rr + LUM * .42, LW * .3)], "none", K, .5, h.OCULTA)
            h.ln(*q(rr, 0), *q(rr + EMP, 0), K, .5, h.OCULTA)
            h.circ(*q(rr + EMP / 2, 0), max(1.6, 8 * kp), K, K, .3)   # bulón visto de arriba
        if v.get("octo") and not v.get("medio"):   # rayos del capuchón al aro (*)
            for a in (45, 135, 225, 315):
                ca, sa = math.cos(math.radians(a)), -math.sin(math.radians(a))
                h.ln(pcx + rcap * ca * kp, pcy + rcap * sa * kp, pcx + R8 * .97 * ca * kp, pcy + R8 * .97 * sa * kp, OR, max(AD * kp * .6, 1))
        if v.get("octo") and v.get("medio"):
            for a in (60, 120):
                ca, sa = math.cos(math.radians(a)), -math.sin(math.radians(a))
                h.ln(pcx + rcap * ca * kp, pcy + rcap * sa * kp, pcx + v["octo"] * ca * kp, pcy + v["octo"] * sa * kp, OR, max(AD * kp * .6, 1))
        h.circ(pcx, pcy, DEC / 2 * kp, "#fff", K, .6, h.OCULTA)
        h.circ(pcx, pcy, rcap * kp, "#fff", K, 1.2); h.circ(pcx, pcy, rcap * kp * .55, "none", K, .4)
        h.ln(pcx - 16, pcy, pcx + 16, pcy, K, .4, h.EJE); h.ln(pcx, pcy - 16, pcx, pcy + 16, K, .4, h.EJE)
        # ángulos entre brazos
        ss = sorted(a % 360 for a in arms)
        if len(ss) > 1 and not v.get("noAng"):
            Ra = (rcap + 90) * kp + 6
            pares = list(zip(ss, ss[1:] + [ss[0] + 360]))
            if len(ss) == 2 and (ss[1] - ss[0]) % 360 > 180: pares = [(ss[1], ss[0] + 360)]
            elif len(ss) == 2: pares = [(ss[0], ss[1])]
            for a0, a1 in pares[:2] if len(ss) > 2 else pares:
                d_ = a1 - a0
                if d_ >= 359: continue
                am = math.radians(a0 + 8); bm = math.radians(a1 - 8)
                h.path(f"M{pcx + Ra*math.cos(am):.1f},{pcy - Ra*math.sin(am):.1f} A{Ra:.1f},{Ra:.1f} 0 {1 if d_-16>180 else 0} 0 {pcx + Ra*math.cos(bm):.1f},{pcy - Ra*math.sin(bm):.1f}", "none", K, .6)
                mm = math.radians((a0 + a1) / 2); tc = OR if v.get("angStar") else K
                h.txt(pcx + (Ra + 12) * math.cos(mm), pcy - (Ra + 12) * math.sin(mm) + 4, f"{d_:.0f}°" + (" (*)" if v.get("angStar") else ""), 10.5, 700, tc, "middle")
        if cotas:
            th = arms[0]; ca, sa = math.cos(math.radians(th)), -math.sin(math.radians(th))
            yy = pcy + (LW / 2 + 40) * kp + 4
            h.dimH(yy, pcx, pcx + L * kp, f(L), ext=pcy + 4, dy=14)
            h.txt(pcx, pcy + (ext + 40) * kp + 26, "LUMINARIA DE REFERENCIA 575×312 (*)", 9.5, 700, OR, "middle")
        if corteAA:
            xa = pcx - (ext + 60) * kp; xb = pcx + (ext + 60) * kp
            h.ln(xa, pcy, xb, pcy, K, .9, h.EJE)
            for xx in (xa, xb): marcaCorte(xx, pcy, "A")

    if not multi:
        kp = min((PX1 - PX0 - 30) / (2 * ext + 80), (PY1 - PY0 - 40) / (2 * ext + 80))
        planta(PR, (PX0 + PX1) / 2 - 6, (PY0 + PY1) / 2 - 10, kp)
        h.globo("3", (PX0 + PX1) / 2 - 6 + (L - EMP + LUM * .7) * kp, (PY0 + PY1) / 2 - 10 - LW * .5 * kp, (PX0 + PX1) / 2 + 100, PY0 - 6)
    else:
        def yext(v):
            ys = [-rcap, rcap]
            for th in v["arms"]:
                sn, cs = math.sin(math.radians(th)), math.cos(math.radians(th))
                for r in (L - EMP, ext):
                    for w in (-LW / 2, LW / 2): ys.append(r * sn + w * cs)
            if v.get("octo"):
                R8 = v["octo"] / math.cos(math.radians(22.5)); ys += [R8] + ([] if v.get("medio") else [-R8])
            if len(v["arms"]) > 1: ys += [rcap + 200]
            return max(ys), min(ys)
        ex = [yext(v) for v in VAR]; LAB = 34
        kp = min((PX1 - PX0 - 40) / (2 * ext + 60), (PY1 - PY0 + 40 - LAB * len(VAR) - 8 * len(VAR)) / sum(a - b for a, b in ex))
        y_ = PY0 - 18
        for v, (top, bot) in zip(VAR, ex):
            h.txt(PX0 - 4, y_ + 12, v["rotulo"], 10.5, 700, K)
            h.txt(PX0 - 4, y_ + 25, v["sub"], 9.5, 400, OR if "VINCULAR" in v["sub"] or "(*)" in v["sub"] else G)
            yc = y_ + LAB + top * kp
            planta(v, (PX0 + PX1) / 2 + 6, yc, kp, cotas=False, corteAA=(v is PR))
            y_ = yc - bot * kp + 8
        h.txt(PX0, 92 - 0, "", 1)
    _escP = f"1:{round(4 / kp / 5) * 5}"
    h.txt(618, 81, f"ESC. {_escP} - BRAZOS Y LUMINARIAS A ESCALA", 10.5, 400, G)

    # ================= 3) DETALLES =================
    DY = 512
    h.ln(40, DY - 30, 842, DY - 30, K, .3, 'stroke-dasharray="2 3"')
    # D1: corte C-C del encastre
    h.titulo(40, DY, "D1 · CORTE C-C", "ENCASTRE DEL CAPUCHON · ESC. 1:2")
    k1 = 1.38 if capD < 110 else 1.16
    dx, dy = 130, DY + 128
    h.circ(dx, dy, rcap * k1, "url(#ANSI31)", K, 1.1); h.circ(dx, dy, (rcap - 3) * k1, "#fff", K, .7)
    h.circ(dx, dy, bD / 2 * k1, col["fillBuje"], K, .9); h.circ(dx, dy, bDi / 2 * k1, "#fff", K, .7)
    # prisioneros (*)
    for sg in (-1, 1):
        x0 = dx + sg * (rcap - 4) * k1
        h.rect(min(x0, x0 + sg * 26), dy - 4, 26, 8, "#fff", OR, 1); h.rect(min(x0 + sg * 26, x0 + sg * 32), dy - 7, 6, 14, "#fff", OR, 1)
    for i in range(N):
        a = math.radians(90 + 360 / N * i + (45 if N == 4 else 0))
        rr_ = 0 if N == 1 else (13 if N == 2 else 14)
        cable3(dx + rr_ * k1 * math.cos(a), dy - rr_ * k1 * math.sin(a), 11.1 / 2 * k1)
    h.dimH(dy - rcap * k1 - 14, dx - bD / 2 * k1, dx + bD / 2 * k1, f"Ø{bD}", ext=dy - 4, dy=-4)
    h.dimH(dy + rcap * k1 + 16, dx - rcap * k1, dx + rcap * k1, f"Ø≈{capD:.0f} (*)", ext=dy + 4, c=OR, dy=14)
    h.txt(dx, dy + rcap * k1 + 46, f"INTERIOR Ø{bDi}{' (*)' if col.get('bDiStar') else ''}: {N} CABLES 3×1,5", 9.5, 700, OR if col.get("bDiStar") else K, "middle")
    h.globo("10", dx + (rcap + 18) * k1, dy - 5, dx + 86, dy - 52, OR)
    h.globo("4", dx + 2, dy + 2, dx - 86, dy + 52)

    # D2: unión brazo-luminaria
    h.titulo(250, DY, "D2 · BRAZO ↔ LUMINARIA", "ESC. 1:5 · CORTE POR EL EJE DEL BRAZO")
    k2 = .58; bx0, byc = 262, DY + 128
    xm = bx0 + 90 * k2 / .58 * .58 + 40   # inicio del manguito
    xm = bx0 + 70
    xe = xm + EMP * k2   # punta del brazo
    rA = AD / 2 * k2; rM = 63 / 2 * k2; wm = 5 * k2
    # brazo
    h.rect(bx0, byc - rA, xe - bx0, 2 * rA, "#fff", K, .9)
    h.rect(bx0, byc - rA, xe - bx0, AW * k2, K, K, .3); h.rect(bx0, byc + rA - AW * k2, xe - bx0, AW * k2, K, K, .3)
    h.path(f"M{bx0},{byc-rA-4} l-5,6 l8,6 l-6,6 l8,6 l-5,{2*rA-16}", "none", K, .7)
    # cuerpo de la luminaria (corte)
    LX = xm + 330 * k2
    poly([(xm - 8, byc - rM - wm - 10), (LX, byc - rM - wm - 26), (LX, byc + rM + wm + 18), (xm - 8, byc + rM + wm + 10)], "#fff", K, 1.2)
    h.path(f"M{LX},{byc - rM - wm - 30} l-4,8 l8,8 l-6,10", "none", K, .6)
    # manguito (corte, rayado)
    h.rect(xm, byc - rM - wm, (EMP + 30) * k2, wm, "url(#ANSI31)", K, .8); h.rect(xm, byc + rM, (EMP + 30) * k2, wm, "url(#ANSI31)", K, .8)
    xw = xm + (EMP + 30) * k2
    h.rect(xw, byc - rM - wm - 14, 5, 2 * (rM + wm) + 26, "url(#ANSI31)", K, .8)   # pared del recinto de equipo
    # prensacable 3/4"
    h.rect(xw - 5, byc - 8, 15, 16, "#fff", K, .9); h.rect(xw + 10, byc - 6, 6, 12, "#fff", K, .7)
    # bulón pasante + tuerca y arandela
    xb = xm + EMP / 2 * k2
    h.rect(xb - 3, byc - rM - wm - 9, 6, 2 * (rM + wm) + 18, "#fff", K, .9)
    h.rect(xb - 7, byc - rM - wm - 13, 14, 5, "#fff", K, 1)                # cabeza
    h.rect(xb - 8, byc + rM + wm + 2, 16, 2.5, "#fff", K, .8)               # arandela
    h.rect(xb - 6, byc + rM + wm + 4.5, 12, 6, "#fff", K, 1)                # tuerca
    # cable dentro del brazo hasta el equipo
    cablebanda(f"M{bx0+4},{byc+2} H{xb-6} M{xb+5},{byc+2} H{xw+30}", 11.1 * k2)
    h.dimH(byc + rM + 28, xm, xe, "100-200 (EMP.)", ext=byc + rM + 4, dy=14)
    h.dimV(bx0 + 18, byc - rA, byc + rA, "Ø60,3")
    h.txt(xm + 4, byc - rM - wm - 34, "MANGUITO Ø63±1", 9.5, 700)
    h.globo("5", xb + 4, byc - rM - wm - 11, xb + 30, DY + 40)
    h.globo("6", xb + 6, byc + rM + wm + 8, xb + 92, DY + 196)
    h.globo("7", xw + 13, byc - 6, xw + 40, DY + 44)
    h.globo("2", bx0 + 30, byc - rA + 1, bx0 + 20, DY + 48)
    h.globo("3", LX - 10, byc + rM + wm + 14, LX + 8, DY + 196)

    # D3: cable 3×1,5
    h.titulo(572, DY, "D3 · CABLE", "3×1,5 · ESC. 5:1")
    cable3(610, DY + 82, 11.1 / 2 * 6.4)
    h.dimH(DY + 128, 610 - 35.5, 610 + 35.5, "Ø11,1", ext=DY + 84, dy=14)
    for i, (col_, t) in enumerate([(MAR, "F MARRON"), (CEL, "N CELESTE"), (VA, "PE VERDE-AMAR.")]):
        h.rect(572, DY + 156 + i * 16, 11, 9, col_, K, .4); h.txt(588, DY + 164 + i * 16, t, 9.5)
    h.txt(572, DY + 212, "XLPE + VAINA PVC", 9.5, 400, G); h.txt(572, DY + 225, "IRAM 2178-1 · 3/4\"", 9.5, 400, G)

    # D4: variante columna metálica
    h.titulo(706, DY, "D4 · VARIANTE", "COLUMNA METALICA")
    vx, vy = 750, DY + 112; kv = .32
    mR = c["metal"][1] / 2
    h.rect(vx - mR * kv, vy - 20, 2 * mR * kv, 70, "url(#ANSI31)", K, 1); h.rect(vx - (mR - 4) * kv, vy - 20, 2 * (mR - 4) * kv, 70, "#fff", K, .6)
    cR = mR + 6
    h.rect(vx - cR * kv - 2, vy - 60, 2 * cR * kv + 4, 70, "none", OR, 1.2, 'stroke-dasharray="4 2"')
    h.ln(vx + cR * kv, vy - 50, vx + cR * kv + 36, vy - 56, OR, 1.6)
    h.ln(vx - cR * kv, vy - 50, vx - cR * kv - 36, vy - 56, OR, 1.6)
    h.path(f"M{vx - mR*kv - 4},{vy+50} l4,-5 l6,8 l4,-4 h{2*mR*kv-6}", "none", K, .6)
    for i, (t, cc) in enumerate([(c["metal"][0], K), (f"CIMA Ø{c['metal'][1]}, SIN BUJE", K), ("CAPUCHON Ø INT. (*)", OR), ("FIJACION: PRISIONEROS (*)", OR),
                                  (f"SUBIDA = {c['altura']} − 2,50 + {f(L/1000, 3).rstrip('0').rstrip(',')} + 0,6", K)]):
        h.txt(706, vy + 72 + i * 13, t, 9.5, 700 if i == 0 else 400, cc)

    # ================= 4) CÓMPUTO =================
    cols_v = VAR if c.get("computoTodas") else [PR]
    def subida(v): return c["altura"] - c["caja"] + L / 1000 + 0.6
    sub = subida(PR)
    Lm = f(L / 1000, 3).rstrip("0").rstrip(",")
    filas = [("POR VINCULO",) + tuple(v["corto"] for v in cols_v) + ("CALCULO",)]
    def fila(t, fn, calc): filas.append((t,) + tuple(fn(len(v["arms"])) for v in cols_v) + (calc,))
    fila("LUMINARIA LED (6010)", lambda n: f"{n} u", "1 POR BRAZO")
    fila("CABLE 3×1,5 (6001)", lambda n: f"{f(n*sub,2)} m", f"n × ({c['altura']} − {f(c['caja'],2)} + {Lm} + 0,60) = n × {f(sub,3).rstrip('0').rstrip(',')}")
    fila("BULON PASANTE (4019)", lambda n: f"{n} u", "1 POR ARTEFACTO (ANTIVANDALICO)")
    fila("TUERCA Y ARANDELA (4038)", lambda n: f"{n} u", "1 JUEGO POR ARTEFACTO")
    fila("PRENSACABLE 3/4\" (5029)", lambda n: f"{n} u", "1 POR LUMINARIA (Ø11,1)")
    fila("FUSIBLE 10×38 2 A (3017)", lambda n: f"{n} u", "2 A POR ARTEFACTO, EN LA CAJA")
    fila("SHORTING CUP NEMA (*)", lambda n: f"{n} u", "SI NO LLEVA FOTOCELULA (ETG 26.3)")
    cw_ = [176] + [52] * len(cols_v) + [482 - 52 * len(cols_v) - 176 + 176 - 10 + (0 if len(cols_v) > 1 else 0)]
    cw_[-1] = 560 - sum(cw_[:-1])
    yct = 790
    h.tabla(40, yct, [(cw_[0], "l", False)] + [(w, "c", True) for w in cw_[1:-1]] + [(cw_[-1], "l", False)], filas, rowh=19,
            titulo="COMPUTO POR VINCULO" + (" (CADA HOJA)" if len(cols_v) > 1 else f" ({N} ARTEFACTOS, {col['nombre']})"),
            colores=lambda i, j, t: OR if "(*)" in t else K)
    # rayados
    rx = 620
    h.txt(rx, yct, "RAYADOS", 13, 700); h.ln(rx, yct + 4, rx + 70, yct + 4, K, 1)
    items = [("url(#ANSI31)", "ACERO GALV. (CORTE)"), (col["fillBuje"], col["rayBuje"]), (col["fillB"], col["rayB"]), ("url(#cuH)", "COBRE"), ("#fff", "PIEZA EN VISTA")]
    for i, (fl, t) in enumerate(items):
        yy = yct + 16 + i * 25; h.rect(rx, yy, 30, 17, fl, K, .6); h.txt(rx + 38, yy + 13, t, 10.5)
    yy = yct + 16 + len(items) * 25; h.rect(rx, yy, 30, 17, "#fff", OR, 1); h.txt(rx + 38, yy + 13, "A CONFIRMAR (*)", 10.5, 400, OR)

    # ================= 5) NOTAS =================
    h.notas(40, 975, c["notas"])

    # ================= 6) 3D =================
    h.titulo(890, 62, c["t3d"], c["t3dsub"])

    def ring(xc, yc, z, r, a0, a1, n=28):
        return [(xc + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), yc + r * math.sin(math.radians(a0 + (a1 - a0) * i / n)), z) for i in range(n + 1)]

    def pol(pts3, fill, st="#333", sw=.6, op=1, extra=""):
        h.F3(pts3, fill, st, sw, op, extra)

    def cil(z0, z1, r, fill, top, st="#333"):
        pol(ring(0, 0, z1, r, -45, 135) + ring(0, 0, z0, r, 135, -45), fill, st, .6)
        if fill == "url(#prfv)": pol(ring(0, 0, z1, r, -45, 135) + ring(0, 0, z0, r, 135, -45), "url(#fibra)", "none", 0)
        pol(ring(0, 0, z1, r, 0, 360, 40), top, st, .6)

    def cascara(z0, z1, ro, ri, fill, corte, dentro):
        pol(ring(0, 0, z1, ri, 90, 360) + ring(0, 0, z0, ri, 360, 90), "#6d7378", "#222", .4)
        dentro()
        pol([(ri, 0, z0), (ro, 0, z0), (ro, 0, z1), (ri, 0, z1)], corte, "#222", .5)
        pol([(0, ri, z0), (0, ro, z0), (0, ro, z1), (0, ri, z1)], corte, "#222", .5)
        for a0, a1 in ((-45, 0), (90, 135)):
            pol(ring(0, 0, z1, ro, a0, a1, 8) + ring(0, 0, z0, ro, a1, a0, 8), fill, "#333", .6)
            if fill == "url(#prfv)": pol(ring(0, 0, z1, ro, a0, a1, 8) + ring(0, 0, z0, ro, a1, a0, 8), "url(#fibra)", "none", 0)

    def tubo3(p0, p1, r, base="#8f9ba6", luz="#e8eef3", st="#4a525c"):
        a, b = h.P(*p0), h.P(*p1); dx_, dy_ = b[0] - a[0], b[1] - a[1]; ll = math.hypot(dx_, dy_) or 1
        nx, ny = -dy_ / ll, dx_ / ll
        if ny > 0: nx, ny = -nx, -ny   # normal hacia arriba en pantalla
        w = r * h._s
        def q(p, o): return f"{p[0] + nx*o:.1f},{p[1] + ny*o:.1f}"
        h.a(f'<polygon points="{q(a,w)} {q(b,w)} {q(b,-w)} {q(a,-w)}" fill="{base}" stroke="{st}" stroke-width=".6"/>')
        h.a(f'<polygon points="{q(a,w*.75)} {q(b,w*.75)} {q(b,w*.15)} {q(a,w*.15)}" fill="{luz}" opacity=".85"/>')
        h.a(f'<polygon points="{q(a,-w*.45)} {q(b,-w*.45)} {q(b,-w)} {q(a,-w)}" fill="#5f6b76" opacity=".7"/>')

    def luminaria3(th, ancla=None):
        ca, sa = math.cos(math.radians(th)), math.sin(math.radians(th))
        cA, sA = math.cos(math.radians(ALF)), math.sin(math.radians(ALF))
        u = (ca * cA, sa * cA, sA); v = (-sa, ca, 0); w = (-ca * sA, -sa * sA, cA)
        r0 = L - EMP; o = (r0 * ca, r0 * sa, z_arm(r0))
        def pt(a, b, cc): return tuple(o[i] + a * u[i] + b * v[i] + cc * w[i] for i in range(3))
        out = [(0, -LW * .35), (60, -LW / 2), (LUM - 60, -LW / 2), (LUM, -LW * .3), (LUM, LW * .3), (LUM - 60, LW / 2), (60, LW / 2), (0, LW * .35)]
        top = [pt(a, b, LH * .5) for a, b in out]; bot = [pt(a * .98 + 4, b * .92, -LH * .5) for a, b in out]
        def dot(n): return n[0] * V3[0] + n[1] * V3[1] + n[2] * V3[2]
        caras = []
        for i in range(len(out)):
            j = (i + 1) % len(out)
            a, b = out[i], out[j]
            ex, ey = b[0] - a[0], b[1] - a[1]
            nl = (ey, -ex)   # normal hacia afuera (polígono en sentido antihorario en (u,v)?)
            nw = tuple(nl[0] * u[k_] + nl[1] * v[k_] for k_ in range(3))
            caras.append((dot(nw), [top[i], top[j], bot[j], bot[i]]))
        sgn = 1 if sum(1 for d_, _ in caras if d_ > 0) <= len(caras) // 2 + 1 else 1
        for d_, pts in caras:
            if d_ > 0: pol(pts, "#59606a", "#222", .6)
        # vidrio LED abajo (si se ve) y tapa
        if dot(w) < 0: pol(bot, "#fff6c8", "#222", .5)
        pol(top, "#7b838d", "#222", .7)
        # aletas de disipación
        for t in range(6):
            a_ = LUM * (.35 + t * .085)
            p1, p2 = h.P(*pt(a_, -LW * .38, LH * .5)), h.P(*pt(a_, LW * .38, LH * .5))
            h.ln(*p1, *p2, "#4b525a", 1.1)
        # zócalo NEMA con shorting cup
        pn = pt(LUM * .22, 0, LH * .5)
        x_, y_ = h.P(*pn); rn = 34 * h._s
        h.a(f'<ellipse cx="{x_:.1f}" cy="{y_-3*h._s:.1f}" rx="{rn:.1f}" ry="{rn*.5:.1f}" fill="#2f3337" stroke="#111" stroke-width=".5"/>')
        h.a(f'<ellipse cx="{x_:.1f}" cy="{y_-14*h._s:.1f}" rx="{rn*.8:.1f}" ry="{rn*.4:.1f}" fill="#464c52" stroke="#111" stroke-width=".5"/>')
        return {"cuerpo": pt(LUM * .6, 0, LH * .5), "nema": pn, "luz": pt(LUM * .7, LW * .3, -LH * .5), "manguito": pt(EMP / 2, 0, LH * .2), "bulon": pt(EMP / 2, 0, LH * .5)}

    def escena(s, ox, oy, zlow, zcutTop, rot, brazos=True, armsR=None, rotular=None):
        h.iso(s, ox, oy)
        arms3 = [(a + rot) % 360 for a in ARMS]
        Lb = armsR or L
        def depth(a): return math.cos(math.radians(a)) + math.sin(math.radians(a))
        atras = sorted([a for a in arms3 if depth(a) < 0], key=depth); adel = sorted([a for a in arms3 if depth(a) >= 0], key=depth)
        info = {}
        def un_brazo(a):
            ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
            r_a = OCTO or rcap
            rr = min(Lb, L - EMP + 40) if Lb == L else Lb
            tubo3((r_a * ca, r_a * sa, z_arm(r_a)), (rr * ca, rr * sa, z_arm(rr)), AD / 2)
            if Lb == L: info[a] = luminaria3(a)
            else:
                x_, y_ = h.P(rr * ca, rr * sa, z_arm(rr)); h.a(f'<ellipse cx="{x_:.1f}" cy="{y_:.1f}" rx="{AD/2*s*.75:.1f}" ry="{AD/2*s:.1f}" fill="#c9d1d8" stroke="#4a525c" stroke-width=".6"/>')
        def aro(front):
            if not OCTO: return
            R8 = OCTO / math.cos(math.radians(22.5))
            ang = [22.5 + 45 * i for i in range(9)]
            if PR.get("medio"): ang = [0, 22.5, 67.5, 112.5, 157.5, 180]
            segs = []
            for i in range(len(ang) - 1):
                a0, a1 = ang[i] + rot, ang[i + 1] + rot
                rA_ = OCTO if ang[i] % 45 == 0 else R8; rB_ = OCTO if ang[i + 1] % 45 == 0 else R8
                p0 = (rA_ * math.cos(math.radians(a0)), rA_ * math.sin(math.radians(a0)), zA); p1 = (rB_ * math.cos(math.radians(a1)), rB_ * math.sin(math.radians(a1)), zA)
                segs.append((depth((a0 + a1) / 2), p0, p1))
            for d_, p0, p1 in sorted(segs):
                if (d_ >= 0) == front: tubo3(p0, p1, AD / 2)
            rad = (45, 135, 225, 315) if not PR.get("medio") else (60, 120)
            for a in rad:
                a_ = a + rot
                if (depth(a_) >= 0) == front:
                    ca, sa = math.cos(math.radians(a_)), math.sin(math.radians(a_))
                    tubo3((rcap * ca, rcap * sa, zA), (R8 * .95 * ca, R8 * .95 * sa, zA), AD * .3)
        if brazos:
            aro(False)
            for a in atras: un_brazo(a)
        # poste sin cortar
        zc0 = max(zlow, -330)
        if zlow < -330: cil(zlow, -330, DEC / 2, col["fill3"], col["top3"])
        # tramo cortado del poste (−330..0) con el buje y los cables adentro
        def cables(z0, z1):
            for i in range(N):
                ang = math.radians(200 + 360 / N * i) if N > 1 else 0
                rr_ = 0 if N == 1 else 12
                xx, yy = rr_ * math.cos(ang), rr_ * math.sin(ang)
                a_, b_ = h.P(xx, yy, z0), h.P(xx, yy, z1)
                h.ln(*a_, *b_, "#0d0d0d", max(11.1 * s * 1.05, 1.4)); h.ln(a_[0] - 11.1 * s * .25, a_[1], b_[0] - 11.1 * s * .25, b_[1], "#5a5a5a", max(11.1 * s * .25, .5))
        def buje(z0, z1, corte=True):
            if corte: cascara(z0, z1, bD / 2, bDi / 2, col["fillB3"], col["corteB3"], lambda: cables(z0, z1))
            else: cil(z0, z1, bD / 2, col["fillB3"], col["topB3"])
        cascara(zc0, 0, DEC / 2, DEC / 2 - ESP, col["fill3"], "#9da3a1" if col["fill3"] == "url(#prfv)" else "#cfd6dc", lambda: buje(max(zc0, -bE), 0))
        pol(ring(0, 0, 0, DEC / 2, 90, 360) + ring(0, 0, 0, DEC / 2 - ESP, 360, 90), col["top3"], "#333", .5)
        # buje al aire entre la cima y el capuchón
        buje(0, zCap0)
        pol(ring(0, 0, zCap0, bD / 2, 0, 360, 40), "none", "#333", .3)
        # capuchón: cortado hasta zcutTop, entero arriba
        cascara(zCap0, zcutTop, rcap, rcap - 3, "url(#galv)", "#c7d0d8", lambda: buje(zCap0, zcutTop))
        # prisioneros (*)
        for a in (-30, 120):
            ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
            tubo3((rcap * ca, rcap * sa, zC), ((rcap + 14) * ca, (rcap + 14) * sa, zC), 5, "#b0b6bc", "#eef1f4", "#333")
        cil(zcutTop, zTop, rcap, "url(#galv)", "#d7dee5")
        if brazos:
            aro(True)
            for a in adel: un_brazo(a)
        return arms3, info

    # escena principal
    s3 = c.get("s3", min(500 / (2 * ext * 1.22), .3))
    ox, oy = c.get("o3", (1165, 330))
    arms3, info = escena(s3, ox, oy, c.get("zlow3", -900), zA - 45, c.get("rot3", -45))
    G3 = c.get("G3", 1478)
    h.iso(s3, ox, oy)
    a_vis = sorted(info.keys(), key=lambda a: -(math.cos(math.radians(a)) + math.sin(math.radians(a))))
    af = a_vis[0]
    ca, sa = math.cos(math.radians(af)), math.sin(math.radians(af))
    gl = c.get("gl3", {})
    def g(nm, p, y, t, col_=NV): h.g3(nm, p, G3, y, t, col_)
    g("3", info[af]["cuerpo"], gl.get("3", 128), "LUMINARIA LED (6010)")
    g("11", info[af]["nema"], gl.get("11", 164), "SHORTING CUP NEMA (*)", OR)
    g("2", ((L * .45) * ca, (L * .45) * sa, z_arm(L * .45)), gl.get("2", 200), "BRAZO CAÑO Ø60,3 GALV.")
    g("1", (rcap * math.cos(math.radians(-20)), rcap * math.sin(math.radians(-20)), zTop - 20), gl.get("1", 236), "CAPUCHON GALV.")
    g("10", (rcap + 14, 0, zC) if False else ((rcap + 14) * math.cos(math.radians(-30)), (rcap + 14) * math.sin(math.radians(-30)), zC), gl.get("10", 272), "FIJACION AL BUJE (*)", OR)
    g("8", (bD / 2 * math.cos(math.radians(-30)), bD / 2 * math.sin(math.radians(-30)), zCap0 * .4), gl.get("8", 308), col["g8"])
    g("4", (0, 0, -150), gl.get("4", 344), f"{N} CABLES 3×1,5 SUBEN")
    g("9", (DEC / 2 * math.cos(math.radians(-40)), DEC / 2 * math.sin(math.radians(-40)), -420), gl.get("9", 380), col["g9"])
    if OCTO: g("12", ((OCTO) * math.cos(math.radians(22.5 + c.get('rot3', -45) + 45)), OCTO * math.sin(math.radians(22.5 + c.get('rot3', -45) + 45)), zA), gl.get("12", 416), "ARO OCTOGONAL (*)", OR)
    # luz LED (cono tenue) debajo de una luminaria
    # inset: encastre ampliado
    ix, iy, isz = c.get("inset", (1490, 654, .38))
    h.rect(ix - 94, iy - 220, 250, 276, "#fff", "#9aa3ad", .6, 'rx="6"')
    h.txt(ix - 86, iy - 204, "ENCASTRE AMPLIADO · CORTE A UN CUARTO", 9, 700, NV, "start", INT)
    escena(isz, ix + 20, iy + 15, -70, zA - 45, c.get("rot3", -45), brazos=not OCTO, armsR=rcap + 90 if not OCTO else OCTO + 60)
    h.iso(isz, ix + 20, iy + 15)
    # rótulos chicos del inset
    def gi(nm, p, gx, gy, col_=NV):
        x_, y_ = h.P(*p); h.globo(nm, x_, y_, gx, gy, col_, 9)
    gi("8", (bD / 2 * math.cos(math.radians(-40)), bD / 2 * math.sin(math.radians(-40)), zCap0 * .5), ix + 128, iy - 60)
    gi("4", (0, 0, -40), ix + 128, iy - 20)
    gi("1", (rcap * math.cos(math.radians(-40)), rcap * math.sin(math.radians(-40)), zCap0 + 160), ix + 128, iy - 105)
    gi("9", (DEC / 2 * math.cos(math.radians(-40)), DEC / 2 * math.sin(math.radians(-40)), -90), ix + 128, iy + 20)


    # ================= 7) LISTA + RÓTULO =================
    ly = c.get("ly", 714)
    h.tabla(890, ly, [(40, "c", False), (448, "l", False), (110, "c", True), (152, "c", False)], [("POS.", "DESCRIPCION", "CANT.", "CODIGO")] + c["lista"],
            rowh=c.get("rowh", 21), titulo=c["listaTit"], colores=lambda i, j, t: OR if (t in ("A VINCULAR", "SIN CODIGO") or "(*)" in t) else K)
    h.rotulo(890, h.H - 150, 750, c["id"], c["tit1"], c["tit2"], c["sub"], f"{esc}·1:2·1:5", "3D S/E", fecha="07/11/2026", hoja=c.get("hoja", "1 DE 1"))
    h.guardar(salida); print("ok", salida, "k=", round(k, 3), "esc", esc)


PRFV7 = dict(nombre="POSTE PRFV 7 m", DEC=122, bD=90, bDi=76, bS=468, bE=240, esp=4, bTxt="BUJE Ø90/76 (PRFV)",
             fillB="#111", fillBuje="#111", rayB="PARED PRFV", rayBuje="BUJE PRFV",
             fill3="url(#prfv)", top3="#7a807e", fillB3="url(#prfv)", topB3="#7a807e", corteB3="#9da3a1",
             g8="BUJE Ø90/76 (SALE 468)", g9="POSTE PRFV 7 m (SIGUE)", insetTxt=["EL CAPUCHON CALZA SOBRE EL BUJE", "Ø90/76 (SALE 468, ENTRA 240)"])
PRFV10 = dict(nombre="POSTE PRFV 10 m", DEC=180, bD=114, bDi=104, bDiStar=True, bS=468, bE=400, esp=4.8, bTxt="ADAPT. METAL Ø114",
              fillB="#111", fillBuje="url(#ANSI31)", rayB="PARED PRFV", rayBuje="ADAPTADOR METAL",
              fill3="url(#prfv)", top3="#7a807e", fillB3="url(#galv)", topB3="#d7dee5", corteB3="#c7d0d8",
              g8="ADAPTADOR METAL Ø114", g9="POSTE PRFV 10 m (SIGUE)", insetTxt=["CALZA SOBRE EL ADAPTADOR METAL", "Ø114 (SALE 468, ENTRA 400)"])
