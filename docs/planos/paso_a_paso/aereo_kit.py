"""Kit común de las guías paso a paso de red aérea (acometida, morseto, barrio). Basado en fund_prfv.py."""
import math, sys, textwrap
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
W, H = 1188, 840
L1, L2, L3, NN = "#7b3f1d", "#1a1a1a", "#c62828", "#4fa3d9"
FASES = [L1, L2, L3, NN]
XDEFS = '''<defs>
<linearGradient id="hA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d8a84"/><stop offset=".35" stop-color="#d6d2ca"/><stop offset=".55" stop-color="#b9b5ad"/><stop offset="1" stop-color="#7b7872"/></linearGradient>
<linearGradient id="porc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a8f84"/><stop offset=".4" stop-color="#fbf8f2"/><stop offset="1" stop-color="#a99d90"/></linearGradient>
<linearGradient id="nylon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4a4a"/><stop offset="1" stop-color="#111"/></linearGradient>
<linearGradient id="estano" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e949a"/><stop offset=".5" stop-color="#eef1f4"/><stop offset="1" stop-color="#8e949a"/></linearGradient>
<linearGradient id="gab" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d4d7da"/><stop offset="1" stop-color="#b3b7bc"/></linearGradient>
<pattern id="pe" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#2e9e44"/><rect width="5" height="10" fill="#f2d21b"/></pattern>
<pattern id="vereda" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#d9d4c7"/><path d="M0,.5 H22 M.5,0 V22" stroke="#b5ae9d" stroke-width="1"/><circle cx="7" cy="7" r="1" fill="#b5ae9d"/><circle cx="15" cy="15" r="1" fill="#b5ae9d"/></pattern>
</defs>'''


def wrap(t, n): return textwrap.wrap(t, n)


def pagina(n, total, titulo, sub, pie):
    h = Hoja(W, H, divisor=None); h.a(XDEFS)
    h.rect(22, 22, W - 44, 62, "#28285E", K, 0)
    h.txt(40, 52, titulo, 22, 800, "#fff", "start", INT)
    h.txt(40, 74, sub, 13, 500, "#dfe3f5", "start", INT)
    h.txt(W - 40, 60, f"HOJA {n} DE {total}", 15, 800, "#fff", "end", INT)
    h.ln(W / 2, 96, W / 2, H - 60, "#c9cde0", 1)
    h.txt(40, H - 34, pie, 11, 500, G, "start", INT)
    return h


def panel(h, x0, num, titulo, lineas, ojo=None, control=None):
    y0 = 104
    h.circ(x0 + 26, y0 + 26, 22, "#28285E", "#28285E", 0); h.txt(x0 + 26, y0 + 34, str(num), 22, 800, "#fff", "middle", INT)
    h.txt(x0 + 58, y0 + 20, f"PASO {num}", 12, 800, "#7C879D", "start", INT); h.txt(x0 + 58, y0 + 42, titulo, 21, 800, "#0D1424", "start", INT)
    h.rect(x0, y0 + 60, 330, 300, "#f7f8fc", "#d5d9e6", 1)
    h.rect(x0 + 338, y0 + 60, 212, 300, "#fff", K, .8)
    h.txt(x0 + 346, y0 + 76, "PLANO", 10, 700, K); h.txt(x0 + 8, y0 + 76, "3D", 10, 700, "#7C879D", "start", INT)
    y = y0 + 392
    for l in lineas:
        for i, w in enumerate(wrap(l, 62)):
            h.txt(x0 + (4 if i == 0 else 20), y, ("• " if i == 0 else "") + w, 15, 500, OR if "(*)" in l else "#0D1424", "start", INT); y += 21
        y += 4
    if ojo:
        ws = wrap(ojo, 58); hh = 16 + len(ws) * 19
        h.rect(x0, y, 550, hh, "#fff4e0", "#FF9F0A", 1.2, 'rx="10"')
        for i, w in enumerate(ws): h.txt(x0 + 12, y + 20 + i * 19, ("⚠ " if i == 0 else "") + w, 14, 700, "#5c3a00", "start", INT)
        y += hh + 10
    if control:
        ws = wrap(control, 58); hh = 16 + len(ws) * 19
        h.rect(x0, y, 550, hh, "#eefaf1", "#34C759", 1.2, 'rx="10"')
        for i, w in enumerate(ws): h.txt(x0 + 12, y + 20 + i * 19, ("✓ " if i == 0 else "") + w, 14, 700, "#14632b", "start", INT)
        y += hh
    assert y < H - 50, f"paso {num}: el texto se pasa ({y})"
    return y0 + 60


def antes(h, filas, materiales, x0=40, extra=None):
    """filas = [(titulo, texto)], materiales = [(codigo, descripcion)]"""
    h.txt(x0, 128, "ANTES DE EMPEZAR", 18, 800, "#28285E", "start", INT)
    y = 156
    for t1, t2 in filas:
        ws = wrap(t2, 70); hh = 30 + len(ws) * 17
        h.rect(x0, y - 20, 550, hh, "#f7f8fc", "#d5d9e6", 1, 'rx="12"'); h.txt(x0 + 14, y, t1, 14, 800, "#0D1424", "start", INT)
        for i, w in enumerate(ws): h.txt(x0 + 14, y + 19 + i * 17, w, 13, 500, "#4B5670", "start", INT)
        y += hh + 6
    h.txt(x0, y + 8, "MATERIALES (CÓDIGO DEL PAÑOL)", 15, 800, "#28285E", "start", INT)
    filas = [("CÓD.", "DESCRIPCIÓN")] + [(c, d) for c, d in materiales]
    y = h.tabla(x0, y + 18, [(56, "c", True), (494, "l", False)], filas, rowh=20,
                colores=lambda i, j, t: OR if "(*)" in t else K)
    if extra: extra(y)
    assert y < H - 50, f"antes: se pasa ({y})"
    return y


def asi_queda(h, X, png, crop, ref, sigue, control, pendientes):
    """crop = (x0,y0,x1,y1) en px de la PNG de la hoja; recorta con PIL y lo pone en el recuadro"""
    from PIL import Image
    im = Image.open(png).crop(crop); nombre = png.split("/")[-1].replace(".png", "_3d.png"); im.save(nombre)
    h.txt(X, 128, "ASÍ QUEDA", 18, 800, "#28285E", "start", INT)
    h.rect(X, 140, 550, 400, "#f7f8fc", "#d5d9e6", 1, 'rx="12"')
    h.a(f'<image href="{nombre}" x="{X+10}" y="150" width="530" height="380" preserveAspectRatio="xMidYMid meet"/>')
    y = 566
    ws = wrap("Control final: " + control, 66); hh = 14 + len(ws) * 18
    h.rect(X, y - 18, 550, hh, "#eefaf1", "#34C759", 1.2, 'rx="10"')
    for i, w in enumerate(ws): h.txt(X + 12, y + i * 18, ("✓ " if i == 0 else "") + w, 13, 700, "#14632b", "start", INT)
    y += hh + 8
    for p in pendientes:
        ws = wrap("(*) A confirmar: " + p, 70)
        for i, w in enumerate(ws): h.txt(X + 4, y + i * 17, w, 12.5, 600, OR, "start", INT)
        y += len(ws) * 17 + 4
    h.txt(X, y + 10, ref, 13, 600, "#4B5670", "start", INT)
    h.txt(X, y + 30, "Sigue: " + sigue, 13, 700, "#28285E", "start", INT)
    assert y + 30 < H - 50, f"así queda: se pasa ({y})"


# ---------------- 3D (usa la proyección iso del planokit)
def lin3(h, p0, p1, c=K, w=1, d=""):
    a = h.P(*p0); b = h.P(*p1); h.ln(a[0], a[1], b[0], b[1], c, w, d)


def tubo(h, p0, p1, r, col="#1a1a1a", hl="#777", cap="round"):
    a = h.P(*p0); b = h.P(*p1); w = max(1.2, 2 * r * h._s)
    h.a(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#111" stroke-width="{w+1.2:.1f}" stroke-linecap="{cap}"/>')
    h.a(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{col}" stroke-width="{w:.1f}" stroke-linecap="{cap}"/>')
    if hl and w > 3: h.a(f'<line x1="{a[0]:.1f}" y1="{a[1]-w*.22:.1f}" x2="{b[0]:.1f}" y2="{b[1]-w*.22:.1f}" stroke="{hl}" stroke-width="{w*.22:.1f}" stroke-linecap="round" opacity=".7"/>')


def cable(h, pts, r, col="#1a1a1a", hl="#6a6a6a", borde="#000"):
    q = [h.P(*p) for p in pts]; d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in q); w = max(1.4, 2 * r * h._s)
    h.path(d, "none", borde, w + 1.2, 'stroke-linejoin="round" stroke-linecap="round"')
    h.path(d, "none", col, w, 'stroke-linejoin="round" stroke-linecap="round"')
    if hl and w > 3:
        d2 = "M" + " L".join(f"{x:.1f},{y-w*.22:.1f}" for x, y in q); h.path(d2, "none", hl, w * .2, 'stroke-linejoin="round" opacity=".6"')


def comba(p0, p1, flecha, n=24):
    return [(p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, p0[2] + (p1[2] - p0[2]) * t - 4 * flecha * t * (1 - t)) for t in [i / n for i in range(n + 1)]]


def haz(h, x0, x1, y, z, r=11, flecha=0, cols=("#1a1a1a",) * 4, sep=None):
    """preensamblado: 4 conductores trenzados (dibujados juntos, con la vuelta del trenzado)"""
    offs = [(-r, r), (r, r), (-r, -r), (r, -r)]
    for i, (dy, dz) in enumerate(offs[::-1]):
        pts = [(x, y + dy, zz + dz) for (x, _, zz) in comba((x0, y, z), (x1, y, z), flecha)]
        cable(h, pts, r * .95, cols[3 - i], "#5d5d5d")
    for xx in range(int(x0) + 60, int(x1), 120):   # vueltas del trenzado
        zz = z - (4 * flecha * ((xx - x0) / (x1 - x0)) * (1 - (xx - x0) / (x1 - x0)) if flecha else 0)
        lin3(h, (xx, y - r, zz + 2 * r), (xx + 40, y + r, zz - 2 * r), "#000", .8)


def poste(h, x, y, z0, z1, r0, r1, tipo="hA"):
    h.tuboZ(z0, z1, x, y, r0, r1, "url(#prfv)" if tipo == "prfv" else ("url(#galv)" if tipo == "galv" else "url(#hA)"), "#333")


def anillo(h, x, y, z, r, col="#c9d1d8", w=3):
    pts = [h.P(*p) for p in h.circZ(z, x, y, r, 40)]
    fr = [p for i, p in enumerate(pts) if 0 <= i <= 20 or i >= 36]  # mitad de adelante
    fr = pts[36:] + pts[:21]
    d = "M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in fr)
    h.path(d, "none", "#4a525a", w + 1.4, 'stroke-linecap="round"'); h.path(d, "none", col, w, 'stroke-linecap="round"')


def suelo(h, x0, x1, y0, y1, prof, top="url(#grass)"):
    h.BOX(x0, x1, y0, y1, -prof, 0, top, "url(#soil3)", "url(#soil3)")


def morseto(h, x, y, z, e=1.0, abierto=False, cabeza="si", linea=True, deriv=True, col_der="#1a1a1a", lin_len=160, der_len=170, pf=False):
    """morseto dentado tipo PKD-14 en 3D. Canal de arriba = línea, canal de abajo = derivación (con capuchón en +x)."""
    g = 14 * e if abierto else 0
    zl, zd = z + 26 * e + g, z - 26 * e   # ejes de los canales
    if linea: tubo(h, (x - lin_len * e, y, zl), (x + lin_len * e, y, zl), 10 * e, "#1a1a1a", "#666")
    if deriv: tubo(h, (x - der_len * e, y, zd), (x + 30 * e, y, zd), 7 * e, col_der, "#888", cap="butt")
    # mordazas de nylon
    h.BOX(x - 30 * e, x + 30 * e, y - 24 * e, y + 24 * e, z - 48 * e, z - 4 * e, "#3a3a3a", "url(#nylon)", "#262626", "#000", .7)
    h.BOX(x - 30 * e, x + 30 * e, y - 24 * e, y + 24 * e, z + 4 * e + g, z + 48 * e + g, "#3a3a3a", "url(#nylon)", "#262626", "#000", .7)
    # dientes de cobre estañado a la vista entre mordazas
    for k in range(-2, 3): lin3(h, (x + k * 10 * e, y + 24 * e, z - 4 * e), (x + k * 10 * e + 3 * e, y + 24 * e, z + 4 * e + g), "#d6b36a", 1.4)
    # capuchón del canal de derivación
    h.BOX(x + 30 * e, x + 44 * e, y - 12 * e, y + 12 * e, zd - 12 * e, zd + 12 * e, "#2a2a2a", "#1c1c1c", "#333", "#000", .6)
    # bulón, tuerca y cabeza fusible
    h.tuboZ(z - 60 * e, z + 62 * e + g, x, y, 5 * e, 5 * e, "url(#galv)", "#444")
    h.tuboZ(z + 48 * e + g, z + 60 * e + g, x, y, 11 * e, 11 * e, "url(#galv)", "#444")
    if cabeza == "si": h.tuboZ(z + 60 * e + g, z + 74 * e + g, x, y, 9 * e, 9 * e, "url(#galv)", "#444")
    if pf:   # portafusible Neozed al costado
        h.BOX(x - 18 * e, x + 18 * e, y + 24 * e, y + 52 * e, zd - 30 * e, zd + 10 * e, "#3a3a3a", "url(#nylon)", "#262626", "#000", .6)
        h.tuboZ(zd + 10 * e, zd + 24 * e, x, y + 38 * e, 10 * e, 10 * e, "#e8e8e8", "#555")
    return zl, zd


def g(h, p, tx, ty, t, anc="start"):
    x, y = h.P(*p); h.ln(x, y, tx - (4 if anc == "start" else -4), ty - 4, NV, .8); h.circ(x, y, 2.4, NV, NV, 0)
    h.txt(tx, ty, t, 11.5, 700, NV, anc, INT)


def g2(h, x, y, tx, ty, t, anc="start"):
    h.ln(x, y, tx - (4 if anc == "start" else -4), ty - 4, NV, .8); h.circ(x, y, 2.4, NV, NV, 0); h.txt(tx, ty, t, 11.5, 700, NV, anc, INT)


def rotar(h, cx, cy, r, sentido=1, txt=None, col="#c2410c"):
    """flecha de giro (2D)"""
    a0, a1 = (200, 520) if sentido > 0 else (520, 200)
    p = lambda a: (cx + r * math.cos(math.radians(a)), cy + .45 * r * math.sin(math.radians(a)))
    pts = [p(a0 + (a1 - a0) * i / 30) for i in range(31)]
    h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts), "none", col, 2.4)
    x2, y2 = pts[-1]; x1, y1 = pts[-3]; an = math.atan2(y2 - y1, x2 - x1)
    h.path(f"M{x2+8*math.cos(an):.1f},{y2+8*math.sin(an):.1f} L{x2+7*math.cos(an+2.3):.1f},{y2+7*math.sin(an+2.3):.1f} L{x2+7*math.cos(an-2.3):.1f},{y2+7*math.sin(an-2.3):.1f} z", col, col, 0)
    if txt: h.txt(cx, cy - .45 * r - 8, txt, 12, 800, col, "middle", INT)


def flecha(h, x1, y1, x2, y2, col="#c2410c", w=2.4):
    h.ln(x1, y1, x2, y2, col, w); an = math.atan2(y2 - y1, x2 - x1)
    h.path(f"M{x2+6*math.cos(an):.1f},{y2+6*math.sin(an):.1f} L{x2+8*math.cos(an+2.4):.1f},{y2+8*math.sin(an+2.4):.1f} L{x2+8*math.cos(an-2.4):.1f},{y2+8*math.sin(an-2.4):.1f} z", col, col, 0)


def conductor2d(h, x, y, ang, L, col, pelado=0, w=7):
    """conductor aislado en 2D (detalle); si pelado>0 muestra la cuerda de hilos de cobre en la punta"""
    c, s = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    x1, y1 = x + L * c, y + L * s
    h.ln(x, y, x1, y1, "#000", w + 1.4, 'stroke-linecap="butt"'); h.ln(x, y, x1, y1, col, w, 'stroke-linecap="butt"')
    if pelado:
        x2, y2 = x1 + pelado * c, y1 + pelado * s
        h.ln(x1, y1, x2, y2, "#7a4512", w * .75 + 1); h.ln(x1, y1, x2, y2, "#e7a35a", w * .75)
        for k in (-1, 0, 1):
            ox, oy = -s * k * w * .22, c * k * w * .22
            h.ln(x1 + ox, y1 + oy, x2 + ox, y2 + oy, "#9c5a1c", .6)
    return x1, y1


def corte_cable_2d(h, cx, cy, r, cols=FASES, pe=False):
    """corte de un cable multipolar con colores de fase y cuerda de hilos (a color)"""
    h.circ(cx, cy, r, "#2a2a2a", K, .9); h.circ(cx, cy, r * .86, "#c8c8c8", K, .4)
    n = len(cols); rc, d = r * (.36 if n == 4 else .4), r * (.42 if n == 4 else .44)
    for i, col in enumerate(cols):
        ang = math.radians(45 + 360 / n * i); x = cx + d * math.cos(ang); y = cy - d * math.sin(ang)
        h.circ(x, y, rc, col, K, .5); rcu = rc * .66; rh = rcu / 3
        for px, py in [(0, 0)] + [(2 * rh * math.cos(math.radians(60 * j)), 2 * rh * math.sin(math.radians(60 * j))) for j in range(6)]:
            h.circ(x + px, y + py, rh * .95, "#e7a35a", "#7a4512", .35)
