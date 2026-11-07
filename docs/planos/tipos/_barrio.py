"""Ayudas comunes de los planos de BARRIO (red aérea): AP-TC-055, 024, 004, 021, AP-CC-010.
Usa planokit sin modificarlo; agrega gradientes propios y piezas (poste H°A°, brazo, morsetos, jabalina, tubos 3D)."""
import math
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT

EXTRA = '''<defs>
<linearGradient id="hA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f8a80"/><stop offset=".3" stop-color="#e4e0d8"/><stop offset=".55" stop-color="#cfcac0"/><stop offset="1" stop-color="#77726a"/></linearGradient>
<linearGradient id="madera" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3a1c"/><stop offset=".35" stop-color="#a0703f"/><stop offset="1" stop-color="#4a2f16"/></linearGradient>
<linearGradient id="brilloV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".32" stop-color="#fff" stop-opacity=".28"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
<linearGradient id="alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef1f4"/><stop offset=".5" stop-color="#c3c9cf"/><stop offset="1" stop-color="#8e969e"/></linearGradient>
<linearGradient id="nylon" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b2b2b"/><stop offset=".4" stop-color="#4d4d4d"/><stop offset="1" stop-color="#111"/></linearGradient>
<linearGradient id="inox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".5" stop-color="#c4cad0"/><stop offset="1" stop-color="#e6e9ec"/></linearGradient>
<linearGradient id="lumi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d6670"/><stop offset="1" stop-color="#2d333a"/></linearGradient>
<pattern id="vereda3" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#d8d2c4"/><path d="M0,.5 H22 M.5,0 V22" stroke="#a79f8e" stroke-width=".8"/><circle cx="6" cy="6" r="1.4" fill="#bdb5a4"/><circle cx="16" cy="6" r="1.4" fill="#bdb5a4"/><circle cx="6" cy="16" r="1.4" fill="#bdb5a4"/><circle cx="16" cy="16" r="1.4" fill="#bdb5a4"/></pattern>
<pattern id="AL" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#fff"/><circle cx="2" cy="2" r=".6" fill="#111"/></pattern>
</defs>'''


def nueva():
    h = Hoja(); h.a(EXTRA); return h


def banner(h, txt):
    """aviso naranja arriba de todo (plano oficial pendiente)"""
    h.rect(30, 27, h.W - 60, 18, "#fff4ec", OR, 1.2)
    h.txt(h.W / 2, 40, txt, 11.5, 700, OR, "middle")


# ---------------------------------------------------------------- 2D
def poste2d(h, x, yG, k, libre, emp, db, dc, fill="#fff", st=K, sw=1.6, corte_top=None):
    """poste troncocónico en elevación. yG = nivel del suelo (px). db Ø en la base enterrada, dc Ø en la cima (mm)."""
    tot = libre + emp
    def d(z):  # Ø a la altura z (mm desde el pie enterrado)
        return db + (dc - db) * z / tot
    yb = yG + emp * k; yt = yG - libre * k
    if corte_top is not None: yt = corte_top
    ztop = (yG - yt) / k + emp
    pts = [(x - d(0) / 2 * k, yb), (x - d(ztop) / 2 * k, yt), (x + d(ztop) / 2 * k, yt), (x + d(0) / 2 * k, yb)]
    h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in pts) + " Z", fill, st, sw)
    h.ln(x, yt - 8, x, yb + 8, K, .45, h.EJE)
    return d


def suelo2d(h, x1, x2, yG, prof, vereda=True):
    h.rect(x1, yG, x2 - x1, prof, "url(#EARTH)", K, 0)
    if vereda:
        h.rect(x1, yG - 4, x2 - x1, 4, "url(#CONCP)", K, .6)
    h.ln(x1, yG, x2, yG, K, 1.4)


def morseto2d(h, x, y, s=1.0, fus=False, color=False, conductor=None):
    """morseto dentado de perforación (1995/x) de costado: cuerpo de nylon, bulón con cabeza fusible arriba,
    ranura de la línea (en y) y de la derivación (abajo). fus=True: portafusible Neozed al costado."""
    c_body = "url(#nylon)" if color else "#fff"
    w, hh = 26 * s, 46 * s
    h.path(f"M{x-w/2},{y-hh*.42} h{w} v{hh} h{-w} z", c_body, K, 1)
    # ranura de la línea (el conductor principal pasa por acá)
    h.ln(x - w / 2, y, x + w / 2, y, "#888" if color else K, .5, h.OCULTA)
    # dientes (se ven por la ranura)
    for i in range(4):
        xx = x - w / 2 + 4 * s + i * 6 * s
        h.path(f"M{xx},{y+3*s} l{2*s},{-3*s} l{2*s},{3*s}", "none", "#c27a2c" if color else K, .6)
    # bulón y cabeza fusible
    h.rect(x - 3 * s, y - hh * .42 - 10 * s, 6 * s, 10 * s, "url(#galv)" if color else "#fff", K, .8)
    h.path(f"M{x-6*s},{y-hh*.42-10*s} h{12*s} l{-2*s},{-7*s} h{-8*s} z", "#9aa3ab" if color else "#fff", K, .8)
    h.path(f"M{x-4*s},{y-hh*.42-17*s} h{8*s} v{-5*s} h{-8*s} z", "#ddd" if color else "#fff", K, .6, 'stroke-dasharray="1.5 1"')
    # salida de la derivación
    h.rect(x - 6 * s, y + hh * .58, 12 * s, 6 * s, "#333" if color else "#fff", K, .7)
    if fus:  # portafusible Neozed al costado derecho
        h.rect(x + w / 2, y + 6 * s, 14 * s, 18 * s, "#e9e4d4" if color else "#fff", K, .8)
        h.circ(x + w / 2 + 7 * s, y + 15 * s, 5 * s, "#d9b23a" if color else "#fff", K, .6)
        h.txt(x + w / 2 + 7 * s, y + 18 * s, "2A", 6.5 * s, 700, K, "middle", MONO)


def jabalina2d(h, x, ytop, largo_px, ancho=4):
    h.rect(x - ancho / 2, ytop, ancho, largo_px, "#fff", K, .9)
    h.path(f"M{x-ancho/2},{ytop+largo_px} L{x},{ytop+largo_px+8} L{x+ancho/2},{ytop+largo_px}", "#fff", K, .9)


def fleje2d(h, x1, x2, y, hebilla=True):
    h.rect(x1 - 2, y - 3, x2 - x1 + 4, 6, "#fff", K, .9)
    if hebilla: h.rect(x2 + 2, y - 5, 7, 10, "#fff", K, .9)


# ---------------------------------------------------------------- 3D
def tubo(h, p0, p1, r, fill, st="#222", sw=.6, cap=None, brillo=True):
    a = h.P(*p0); b = h.P(*p1); dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L, dx / L; R = r * h._s
    pts = [(a[0] + nx * R, a[1] + ny * R), (b[0] + nx * R, b[1] + ny * R), (b[0] - nx * R, b[1] - ny * R), (a[0] - nx * R, a[1] - ny * R)]
    h.a('<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + f'" fill="{fill}" stroke="{st}" stroke-width="{sw}" stroke-linejoin="round"/>')
    if brillo and R > 1.2:
        o = -.35
        h.ln(a[0] + nx * R * o, a[1] + ny * R * o, b[0] + nx * R * o, b[1] + ny * R * o, "#fff", max(.5, R * .35), 'stroke-opacity=".35" stroke-linecap="round"')
    if cap: h.circ(b[0], b[1], R, cap, st, sw)


def cuerda(h, pts, r, fill, st="#111", sw=.5):
    """cable flexible por varios puntos 3D (tramos de tubo)"""
    for p0, p1 in zip(pts, pts[1:]): tubo(h, p0, p1, r, fill, st, sw, brillo=False)
    for p in pts[1:-1]:
        x, y = h.P(*p); h.circ(x, y, r * h._s, fill, "none", 0)


def posteZ(h, z0, z1, x, y, r0, r1, fill="url(#hA)", st="#4a463f"):
    h.tuboZ(z0, z1, x, y, r0, r1, fill, st)
    p0 = h.P(x, y, z0); p1 = h.P(x, y, z1); w0 = r0 * h._s; w1 = r1 * h._s
    h.a(f'<polygon points="{p0[0]-w0:.1f},{p0[1]:.1f} {p1[0]-w1:.1f},{p1[1]:.1f} {p1[0]+w1:.1f},{p1[1]:.1f} {p0[0]+w0:.1f},{p0[1]:.1f}" fill="url(#brilloV)" stroke="none"/>')


def anilloZ(h, z, x, y, r, ancho, fill="url(#galv)", st="#333"):
    """abrazadera / fleje alrededor de un poste vertical: banda visible de frente"""
    p0 = h.P(x, y, z); p1 = h.P(x, y, z + ancho); w = r * h._s
    h.a(f'<path d="M{p0[0]-w:.1f},{p0[1]:.1f} A{w:.1f},{w*.5:.1f} 0 0 0 {p0[0]+w:.1f},{p0[1]:.1f} L{p1[0]+w:.1f},{p1[1]:.1f} A{w:.1f},{w*.5:.1f} 0 0 1 {p1[0]-w:.1f},{p1[1]:.1f} Z" fill="{fill}" stroke="{st}" stroke-width=".6"/>')


def suelo3d(h, W, D, prof, top="url(#vereda3)", side="url(#soil3)"):
    """terreno con un cuarto cortado (x>0, y>0) para ver lo enterrado."""
    h.BOX(-W, W, -D, 0, -prof, 0, top, side, side)       # mitad de atrás (la cara y=0 es el corte)
    h.BOX(-W, 0, 0, D, -prof, 0, top, side, side)        # cuarto de adelante a la izquierda (cara x=0 = corte)


def roturaV(h, x, y, w):
    h.path(f"M{x-w-4},{y} l{w*.6},-5 l{w*.8},10 l{w*.6},-5 l{w*.5},0", "#fff", K, .9)


def hull(h, W, D, prof):
    """contorno en pantalla del cuarto quitado (x 0..W, y 0..D, z -prof..0), para recortar lo enterrado"""
    pts = [h.P(x, y, z) for x in (0, W) for y in (0, D) for z in (-prof, 0)]
    pts = sorted(set(pts))
    def cr(o, a, b): return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    lo, up = [], []
    for p in pts:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(up) >= 2 and cr(up[-2], up[-1], p) <= 0: up.pop()
        up.append(p)
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in lo[:-1] + up[:-1])


def blanco(h, x, y, w, hh=12):
    """fondo blanco para un texto que cae sobre un rayado (x = centro)"""
    h.rect(x - w / 2, y - hh + 2, w, hh, "#fff", "none", 0)
