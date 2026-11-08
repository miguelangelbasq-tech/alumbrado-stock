"""fuskit · vistas del portafusible seccionable (tabaquera 3053 / base 3002) y de los fusibles cilíndricos,
dibujadas con los perfiles de r3d/perfiles.json (TAB, BASE831, F10x38, F85x315, F5x20, NEOZED)."""
import math
from fichakit import *


def rot(p, c, deg):
    a = math.radians(deg); dy, dz = p[0] - c[0], p[1] - c[1]
    return [c[0] + dy * math.cos(a) + dz * math.sin(a), c[1] - dy * math.sin(a) + dz * math.cos(a)]


def rielYZ(v, zM, fill="url(#MET)"):
    v.poly([[w - 7.5, zM - 17.5 + u] for u, w in PERF["NS35"]["perfil"]], fill, .9)


def fusibleLong(v, F, y, z0, rotar=None, fill=True, elemento=True):
    """fusible en corte longitudinal con el eje vertical en y, de z0 a z0+L (rotar = (centro, grados) para el carro abierto)"""
    L, D, cap, tubo, par = F["L"], F["D"], F["cap"], F["tubo"], F["pared"]
    R_ = lambda pts: [rot(p, *rotar) for p in pts] if rotar else pts
    r, rt, ri = D / 2, tubo / 2, tubo / 2 - par
    # tubo cerámico (dos paredes) y arena
    for s in (-1, 1): v.poly(R_([[y + s * ri, z0 + .4], [y + s * rt, z0 + .4], [y + s * rt, z0 + L - .4], [y + s * ri, z0 + L - .4]]), "url(#CER)", .7)
    v.poly(R_([[y - ri, z0 + .4], [y + ri, z0 + .4], [y + ri, z0 + L - .4], [y - ri, z0 + L - .4]]), "url(#ARE)", .5)
    # casquillos en corte (vaso de chapa)
    e = .4
    for zb, sg in ((z0, 1), (z0 + L, -1)):
        pts = [[y - r, zb], [y + r, zb], [y + r, zb + sg * cap], [y + r - e, zb + sg * cap], [y + r - e, zb + sg * e], [y - r + e, zb + sg * e], [y - r + e, zb + sg * cap], [y - r, zb + sg * cap]]
        v.poly(R_(pts), "url(#CU)", .8)
    if elemento:
        n = F["elemento"]["muescas"]; w = .9; pts = []; sec = (L - 2) / (n + 1)
        izq = [[y - w / 2, z0 + 1]]; der = [[y + w / 2, z0 + 1]]
        for i in range(1, n + 1):
            t = z0 + 1 + sec * i; izq += [[y - w / 2, t - .7], [y - .12, t], [y - w / 2, t + .7]]; der += [[y + w / 2, t - .7], [y + .12, t], [y + w / 2, t + .7]]
        izq.append([y - w / 2, z0 + L - 1]); der.append([y + w / 2, z0 + L - 1])
        v.poly(R_(izq + der[::-1]), "#222", .3)
        if F["elemento"]["estano"]: v.poly(R_([[y - .9, z0 + L / 2 - .6], [y + .9, z0 + L / 2 - .6], [y + .9, z0 + L / 2 + .6], [y - .9, z0 + L / 2 + .6]]), "#777", .5)
    a, b = v.p(*R_([[y, z0 - 2]])[0]), v.p(*R_([[y, z0 + L + 2]])[0]); v.h.ln(a[0], a[1], b[0], b[1], K, .4, v.h.EJE)


def tornilloH(v, y, z, T):
    """tornillo horizontal (eje y) visto: cabeza hacia +y"""
    dk, k, M, L = T["dk"], T["k"], T["M"], T["L"]; yh = y - k
    v.poly([[yh, z - dk / 2], [y - .4, z - dk / 2], [y, z - dk / 2 + .5], [y, z + dk / 2 - .5], [y - .4, z + dk / 2], [yh, z + dk / 2]], "#fff", .9)
    v.rect(y - .9, y, z - .45, z + .45, "#111", .2)
    v.rect(yh - L, yh, z - M / 2, z + M / 2, "#fff", .8)
    n = max(2, int(L / .6))
    for i in range(n):
        yy = yh - L + (i + .5) * L / n; a, b = v.p(yy - .2, z - M / 2), v.p(yy + .2, z + M / 2); v.h.ln(a[0], a[1], b[0], b[1], K, .4)


def cableV(v, T, arriba=True, largo=6, r=1.1):
    """cable con puntera que entra por la boca (corte longitudinal): tubo, collar, aislación, rotura"""
    yc, H = 31.7, T["H"]; s = 1 if arriba else -1; zb = H if arriba else 0; zi = H - 15 if arriba else 15
    v.rect(yc - r, yc + r, min(zi, zb + s * 2), max(zi, zb + s * 2), "url(#CU)", .7)
    v.rect(yc - 2.3, yc + 2.3, min(zb + s * 2, zb + s * 9), max(zb + s * 2, zb + s * 9), "url(#PLAS2)", .7)
    z1 = zb + s * (9 + largo)
    v.rect(yc - 1.55, yc + 1.55, min(zb + s * 9, z1), max(zb + s * 9, z1), "#fff", .8); v.rect(yc - .7, yc + .7, min(zb + s * 9, z1), max(zb + s * 9, z1), "url(#CU)", .4)
    a = v.p(yc - 2.2, z1); v.h.path(f"M{a[0]:.1f},{a[1]:.1f} q{1.1*v.e:.1f},{-s*3:.1f} {2.2*v.e:.1f},0 q{1.1*v.e:.1f},{s*3:.1f} {2.2*v.e:.1f},0", "none", K, .6)


def portaCorte(v, T, F, rotulo=True):
    """CORTE A-A por el plano medio: núcleo rayado, pared lateral de fondo, jaulas, flejes, pinzas, carro, fusible, tornillos, riel, cables"""
    v.poly(T["lado"], "#fff", .5)                                 # pared del fondo (se ve detrás del corte)
    v.seccion(PERF["SECC"]["tab" if T["H"] < 79.8 else "base"], "PLAS")
    rielYZ(v, T["zM"])
    for e_, i_ in ((T["jaula"]["ext"], T["jaula"]["int"]), (T["jaula"]["extI"], T["jaula"]["intI"])): v.poly(e_, "url(#MET)", .9); v.poly(i_, "#fff", .6)
    for f in (T["fleje"]["p"], T["fleje"]["pI"]): v.poly(f, "url(#CU)", .8)
    yb = T["fus"]["y"] - T["fD"] / 2 - .9
    for zc in (T["pinza"]["zS"], T["pinza"]["zI"]):
        v.rect(T["Dr"] - .5, yb + .7, zc - T["pinza"]["alto"] / 2, zc + T["pinza"]["alto"] / 2, "url(#CU)", .8)
    v.seccion([[T["carro"] + [T["carro"][0]]]], "PLAS2", 1.2)
    fusibleLong(v, F, T["fus"]["y"], T["fus"]["z0"])
    v.circ(*T["pivote"], 1.1, "#fff", .8)
    for z in (T["tornillo"]["z"], T["H"] - T["tornillo"]["z"]): tornilloH(v, T["tornillo"]["y"], z, T["tornillo"])
    cableV(v, T, True); cableV(v, T, False)


def portaPerfil(v, T, F, abierto=False, cables=True):
    """vista lateral exterior (con el carro cerrado o abierto y el fusible)"""
    rielYZ(v, T["zM"], "#fff")
    if abierto:
        v.poly(T["lado"], "#fff", 1.6)
        ca = T["carroAbierto"]; v.poly(ca, "#fff", 1.3)
        fusibleLong(v, F, T["fus"]["y"], T["fus"]["z0"], rotar=(T["pivote"], T["abre"]), elemento=False)
        # recorrido de apertura: arco de la punta de la manija
        tip = T["carro"][5]; c = T["pivote"]; R_ = math.hypot(tip[0] - c[0], tip[1] - c[1]); a0 = math.atan2(tip[1] - c[1], tip[0] - c[0])
        pts = [[c[0] + R_ * math.cos(a0 - math.radians(T["abre"]) * i / 20), c[1] + R_ * math.sin(a0 - math.radians(T["abre"]) * i / 20)] for i in range(21)]
        v.linea(pts, .8, K, 'stroke-dasharray="4 2"')
        p, q = v.p(*pts[-1]), v.p(*pts[-3]); ang = math.atan2(p[1] - q[1], p[0] - q[0])
        v.h.path(f"M{p[0]:.1f},{p[1]:.1f} l{-8*math.cos(ang-.4):.1f},{-8*math.sin(ang-.4):.1f} M{p[0]:.1f},{p[1]:.1f} l{-8*math.cos(ang+.4):.1f},{-8*math.sin(ang+.4):.1f}", "none", K, .9)
        v.oculta(T["carro"], .5)
    else:
        v.poly(T["lado"], "#fff", 1.6)
        v.oculta([p for p in T["carro"]] + [T["carro"][0]], .55)
        v.oculta([[T["fus"]["y"] - T["fD"] / 2, T["fus"]["z0"]], [T["fus"]["y"] + T["fD"] / 2, T["fus"]["z0"]], [T["fus"]["y"] + T["fD"] / 2, T["fus"]["z1"]], [T["fus"]["y"] - T["fD"] / 2, T["fus"]["z1"]], [T["fus"]["y"] - T["fD"] / 2, T["fus"]["z0"]]], .5)
    v.circ(*T["pivote"], 1.1, "#fff", .8)
    v.rect(3, 13, -2.2, 0, "#fff", .8)              # traba del riel
    for z in (T["tornillo"]["z"], T["H"] - T["tornillo"]["z"]): v.oculta([[37.5, z - 3.3], [T["Dr"], z - 3.3]]); v.oculta([[37.5, z + 3.3], [T["Dr"], z + 3.3]])
    if cables: cableV(v, T, True, 6); cableV(v, T, False, 1)


def portaFrente(h, x0, y0, e, T, texto="10x38"):
    """vista de frente (x, z): x0,y0 = esquina de arriba a la izquierda"""
    W, H = T["W"], T["H"]; X = lambda x: x0 + x * e; Z = lambda z: y0 + (H - z) * e
    h.a(f'<rect x="{X(0):.1f}" y="{Z(H):.1f}" width="{W*e:.1f}" height="{H*e:.1f}" rx="{1.5*e:.1f}" fill="#fff" stroke="{K}" stroke-width="1.6"/>')
    n0, n1 = T["cuello"]; h.rect(X(1.5), Z(n1), (W - 3) * e, (n1 - n0) * e, "#fff", K, 1.2)
    for i in range(4): zz = n1 - 6.6 + i * 1.3; h.ln(X(2.7), Z(zz), X(W - 2.7), Z(zz), K, .5)
    h.circ(X(W / 2), Z(T["visor"]["z"]), T["visor"]["r"] * e, "#fff", K, .8)
    h.txt(X(W / 2) + 3.5, Z(T["zM"] - 4), texto, 9.5, 700, K, "middle", CAD, -90)
    for z in (T["tornillo"]["z"], H - T["tornillo"]["z"]):
        h.circ(X(W / 2), Z(z), 4.3 * e, "#fff", K, .6); h.circ(X(W / 2), Z(z), 3.0 * e, "#fff", K, .9)
        h.ln(X(W / 2) - 2.2 * e, Z(z) + .9 * e, X(W / 2) + 2.2 * e, Z(z) - .9 * e, K, .9); h.ln(X(W / 2) - .9 * e, Z(z) - 2.2 * e, X(W / 2) + .9 * e, Z(z) + 2.2 * e, K, .9)
    for zA, zB in ((H, H - 3), (0, 3)): h.ln(X(T["boca"]["x"][0]), Z(zA), X(T["boca"]["x"][0]), Z(zB), K, .5, h.OCULTA); h.ln(X(T["boca"]["x"][1]), Z(zA), X(T["boca"]["x"][1]), Z(zB), K, .5, h.OCULTA)
    h.ln(X(W / 2), Z(H) - 10, X(W / 2), Z(0) + 10, K, .4, h.EJE)
    return X, Z


def pinzaCorte(h, cx, cy, e, T):
    """SECCION C-C (horizontal, a la altura de la pinza): el casquillo abrazado por la pinza en U"""
    r0 = T["fD"] / 2; xm = 0
    P = lambda x, y: (cx + x * e, cy - (y - T["fus"]["y"]) * e)
    yb = T["fus"]["y"] - r0 - .9; xa, xb = -r0 - .55, r0 + .55
    def poly(pts, fill, sw=.8): h.path("M" + " L".join(f"{P(*p)[0]:.1f},{P(*p)[1]:.1f}" for p in pts) + " Z", fill, K, sw)
    poly([[xa, yb], [xb, yb], [xb, yb + .7], [xa, yb + .7]], "url(#CU)")
    for s in (-1, 1):
        x0, x1 = (xa, xa + .55) if s < 0 else (xb - .55, xb)
        poly([[x0, yb], [x1, yb], [x1, T["fus"]["y"] + .5], [x0, T["fus"]["y"] + .5]], "url(#CU)")
    poly([[-2.6, T["Dr"] - .5], [2.6, T["Dr"] - .5], [2.6, yb + .3], [-2.6, yb + .3]], "url(#CU)")
    c = P(0, T["fus"]["y"]); h.circ(c[0], c[1], r0 * e, "url(#CU)", K, 1.0); h.circ(c[0], c[1], (r0 - .4) * e, "#fff", K, .6)
    h.circ(c[0], c[1], (T["fD"] / 2 - .9) * e, "url(#CER)", K, .5)
    h.ln(c[0] - (r0 + 3) * e, c[1], c[0] + (r0 + 3) * e, c[1], K, .4, h.EJE); h.ln(c[0], c[1] - (r0 + 3) * e, c[0], c[1] + (r0 + 9) * e, K, .4, h.EJE)
    return P
