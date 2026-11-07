"""colmet · columna metálica recta por tramos para AP-PL-001, AP-C-007 y AP-TC-023.
Datos: AP-C-005 tipo C (Ht 7,70 · emp. 0,70 · Ø114), ETG cap. 1.1 y planilla de datos garantizados (7 m = 3 tramos Ø114/90/76;
8 m = 4 tramos Ø140/114/90/76; espesor ≥ 4 mm desde Ø90, ≥ 3,2 debajo; ventana 150×76 con centro ≥ 300 bajo el empotramiento;
caja ≥ 2.500), fundación AP-TC-003 0,60×0,60×0,90, pintura ETG cap. 1.3 / AP-TC-023 (calculadora v130)."""
import math, sys
sys.path.insert(0, ".")
from planokit import K, G, OR, NV, CAD, MONO, INT
import tabmet as T

HT, EMP, LL = 7700, 700, 7000
TRAMOS = [(114, 3200), (90, 2500), (76, 2000)]   # Ø y largo (*): los largos no están en las fichas
FA, FT = 600, 900
DEFS = '''<defs><pattern id="ASFH" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#fff"/><circle cx="1" cy="1" r=".9" fill="#111"/><circle cx="3" cy="3" r=".9" fill="#111"/></pattern>
<pattern id="asf3" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#1d1b19"/><circle cx="2" cy="2" r=".7" fill="#3b3734"/><circle cx="5" cy="4.5" r=".6" fill="#2e2b28"/></pattern></defs>'''


def espesor(d): return 4.0 if d >= 90 else 3.2


def elev(h, cx, y0, k, tramos=TRAMOS, emp=EMP, asf=300, fund=True, caja=True, cut_top=None, rotulos=True):
    """vista de la columna en blanco y negro. y0 = nivel de piso. Devuelve función z(mm) → y."""
    Y = lambda z: y0 - z * k
    if fund:
        fx0, fx1 = cx - FA / 2 * k, cx + FA / 2 * k
        h.rect(fx0 - 26, y0, 26, FT * k + 12, "url(#EARTH)", K, 0); h.rect(fx1, y0, 26, FT * k + 12, "url(#EARTH)", K, 0)
        h.rect(fx0, y0 + FT * k, fx1 - fx0, 12, "url(#EARTH)", K, 0)
        h.rect(fx0, y0, fx1 - fx0, FT * k, "url(#CONC)", K, 1.1)
        h.ln(fx0 - 26, y0, fx1 + 26, y0, K, 1.6)
    z = -emp
    for i, (d, l) in enumerate(tramos):
        z1 = z + l; top = Y(min(z1, cut_top)) if cut_top else Y(z1)
        h.rect(cx - d / 2 * k, top, d * k, Y(z) - top, "#fff", K, 1.2)
        if asf and z < asf:
            ya = Y(min(asf, z1)); h.rect(cx - d / 2 * k, ya, d * k, Y(z) - ya, "url(#ASFH)", K, .8)
        if i: h.ln(cx - tramos[i - 1][0] / 2 * k - 3, Y(z), cx + tramos[i - 1][0] / 2 * k + 3, Y(z), K, .8)
        z = z1 - 0
        if cut_top and z1 >= cut_top: break
    h.ln(cx, Y(z) - 12, cx, y0 + FT * k + 16, K, .45, h.EJE)
    if caja:
        h.rect(cx - 40 * k, Y(2500 + 125), 80 * k, 250 * k, "#e8e8e8", K, .8)
        h.rect(cx - 38 * k, Y(-300 + 75), 76 * k, 150 * k, "#fff", K, .7, h.OCULTA)
    return Y


def cyl_band(h, r, z0, z1, col, a0=-80, a1=170):
    if z1 > z0: T.cyl(h, 0, 0, r, a0, a1, z0, z1, col)


def col3d(h, tramos, emp, bandas, a0=-80, a1=170, top_ring=True, zmax=None):
    """columna en 3D, tramo por tramo, con bandas de color [(z0, z1, color)] (las de más adelante mandan)"""
    z = -emp
    for d, l in tramos:
        z1 = z + l if zmax is None else min(z + l, zmax); r = d / 2
        cuts = sorted(set([z, z1] + [b for bb in bandas for b in bb[:2] if z < b < z1]))
        for u0, u1 in zip(cuts, cuts[1:]):
            col = "#7d8488"
            for b0, b1, c in bandas:
                if b0 <= u0 and u1 <= b1: col = c
            cyl_band(h, r, u0, u1, col, a0, a1)
        if top_ring:
            T.ring(h, 0, 0, r, r - espesor(d), z1, 0, 360, "#c8cdd1")
        z = z + l
        if zmax is not None and z >= zmax: break
