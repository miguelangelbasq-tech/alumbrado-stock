"""Kit común de las guías paso a paso (zanjeo, montaje PRFV, caja de columna, PAT). Copia la estructura de fund_prfv.py."""
import math, sys, textwrap
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT, CORES
W, H = 1188, 840
# colores de fase (AEA 90364) y Cu
L1, L2, L3, NC = "#7b3f1d", "#1a1a1a", "#c62828", "#4fa3d9"
VE, AM = "#2f9e44", "#f2c200"
CU = "#d08a3f"
EXTRA = '''<defs>
<pattern id="VA" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="10" height="10" fill="#2f9e44"/><rect width="4" height="10" fill="#f2c200"/></pattern>
<linearGradient id="bronceV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d5718"/><stop offset=".4" stop-color="#f0cf7a"/><stop offset="1" stop-color="#8d6420"/></linearGradient>
<linearGradient id="cuV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a4d1d"/><stop offset=".45" stop-color="#f6c39a"/><stop offset="1" stop-color="#a5561f"/></linearGradient>
<linearGradient id="madera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8955a"/><stop offset="1" stop-color="#8a5a2b"/></linearGradient>
<pattern id="pastoV" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#d9d6cf"/><circle cx="2" cy="2" r=".7" fill="#b3aea4"/><circle cx="6" cy="6" r=".6" fill="#a9a398"/></pattern>
</defs>'''


def wrap(t, n): return textwrap.wrap(t, n)


def pagina(n, total, titulo, sub, plano):
    h = Hoja(W, H, divisor=None)
    h.a(EXTRA)
    h.rect(22, 22, W - 44, 62, "#28285E", K, 0)
    h.txt(40, 52, "CÓMO SE HACE · " + titulo, 22, 800, "#fff", "start", INT)
    h.txt(40, 74, sub, 13, 500, "#dfe3f5", "start", INT)
    h.txt(W - 40, 60, f"HOJA {n} DE {total}", 15, 800, "#fff", "end", INT)
    h.ln(W / 2, 96, W / 2, H - 60, "#c9cde0", 1)
    h.txt(40, H - 34, f"EMA · Alumbrado Público · Las medidas mandan en el plano {plano} · (*) a confirmar", 11, 500, G, "start", INT)
    return h


def caja_txt(h, x0, y, texto, fondo, borde, color, signo, ancho=550, n=60):
    ws = wrap(texto, n); hh = 16 + len(ws) * 19
    h.rect(x0, y, ancho, hh, fondo, borde, 1.2, 'rx="10"')
    for i, w in enumerate(ws):
        h.txt(x0 + 12, y + 20 + i * 19, (signo + " " if i == 0 else "  ") + w, 14, 700, color, "start", INT)
    return y + hh + 10


def panel(h, x0, num, titulo, lineas, ojo=None, control=None, sz=15, n=62):
    y0 = 104
    h.circ(x0 + 26, y0 + 26, 22, "#28285E", "#28285E", 0); h.txt(x0 + 26, y0 + 34, str(num), 22, 800, "#fff", "middle", INT)
    h.txt(x0 + 58, y0 + 20, f"PASO {num}", 12, 800, "#7C879D", "start", INT); h.txt(x0 + 58, y0 + 42, titulo, 21, 800, "#0D1424", "start", INT)
    h.rect(x0, y0 + 60, 330, 300, "#f7f8fc", "#d5d9e6", 1)
    h.rect(x0 + 338, y0 + 60, 212, 300, "#fff", K, .8)
    h.txt(x0 + 346, y0 + 76, "PLANO", 10, 700, K); h.txt(x0 + 8, y0 + 76, "3D", 10, 700, "#7C879D", "start", INT)
    y = y0 + 390
    for l in lineas:
        c = OR if "(*)" in l else "#0D1424"
        for i, w in enumerate(wrap(l, n)):
            h.txt(x0 + (4 if i == 0 else 20), y, ("• " if i == 0 else "") + w, sz, 500, c, "start", INT); y += sz + 5
        y += 4
    y += 2
    if ojo: y = caja_txt(h, x0, y, ojo, "#fff4e0", "#FF9F0A", "#5c3a00", "⚠ OJO:")
    if control: y = caja_txt(h, x0, y, control, "#eefaf1", "#34C759", "#14632b", "✓ CONTROL:")
    if y > H - 52: print("!! texto desborda paso", num, y)
    return y0 + 60


def antes(h, x0, d, extra=None):
    """«Antes de empezar»: EPP, autorización, herramientas y materiales con código."""
    h.txt(x0, 128, "ANTES DE EMPEZAR", 18, 800, "#28285E", "start", INT)
    y = 150
    for t1, t2 in (("🦺 EPP", d["epp"]), ("🚧 Autorización", d["aut"]), ("🛠 Herramientas", d["her"])):
        ws = wrap(t2, 52)
        hh = 14 + max(1, len(ws)) * 17
        h.rect(x0, y, 550, hh, "#f7f8fc", "#d5d9e6", 1, 'rx="10"')
        h.txt(x0 + 12, y + 20, t1, 14, 800, "#0D1424", "start", INT)
        for i, w in enumerate(ws): h.txt(x0 + 150, y + 20 + i * 17, w, 13, 500, "#4B5670", "start", INT)
        y += hh + 6
    y += 14
    h.txt(x0, y, "📦 MATERIALES (CÓDIGO DEL PAÑOL)", 14, 800, "#28285E", "start", INT); y += 8
    rows = d["mat"]
    for cod, desc in rows:
        ws = wrap(desc, 66); hh = 6 + len(ws) * 16
        h.rect(x0, y, 550, hh, "#fff", "#c9cde0", .8)
        h.ln(x0 + 92, y, x0 + 92, y + hh, "#c9cde0", .8)
        h.txt(x0 + 46, y + 16, cod, 12, 700, OR if "VINC" in cod else "#0D1424", "middle", MONO)
        for i, w in enumerate(ws): h.txt(x0 + 100, y + 16 + i * 16, w, 12.5, 500, OR if "(*)" in w else "#0D1424", "start", INT)
        y += hh
    if extra: extra(y + 22)
    if y > H - 52: print("!! antes desborda", y)
    return y


def asi_queda(h, x0, img, plano, sigue, control, pend, alto=420):
    h.txt(x0, 128, "ASÍ QUEDA", 18, 800, "#28285E", "start", INT)
    h.rect(x0, 140, 550, alto, "#fff", "#d5d9e6", 1, 'rx="12"')
    h.a(f'<image href="{img}" x="{x0+8}" y="148" width="534" height="{alto-16}" preserveAspectRatio="xMidYMid meet"/>')
    y = 140 + alto + 14
    h.txt(x0, y + 6, f"Plano completo: {plano} (cortes, cómputo y materiales).", 13, 600, "#4B5670", "start", INT)
    y += 18
    y = caja_txt(h, x0, y, control, "#eefaf1", "#34C759", "#14632b", "✓ CONTROL FINAL:", n=58)
    for p in pend:
        y = caja_txt(h, x0, y, "(*) " + p, "#fff4e0", "#FF9F0A", "#5c3a00", "⚠", n=60)
    h.txt(x0, y + 12, "Sigue: guía «" + sigue + "».", 15, 800, "#28285E", "start", INT)
    if y + 12 > H - 52: print("!! asi_queda desborda", y)


def g(h, p, tx, ty, t, anc="start"):
    """etiqueta 3D: punto en p (3D) y texto en (tx,ty) de la hoja"""
    x, y = h.P(*p)
    ex = tx - 4 if anc == "start" else tx + 4
    h.ln(x, y, ex, ty - 4, NV, .8); h.circ(x, y, 2.4, NV, NV, 0)
    h.txt(tx, ty, t, 11.5, 700, NV, anc, INT)


def g2(h, x, y, tx, ty, t, anc="start"):
    ex = tx - 4 if anc == "start" else tx + 4
    h.ln(x, y, ex, ty - 4, NV, .8); h.circ(x, y, 2.4, NV, NV, 0)
    h.txt(tx, ty, t, 11.5, 700, NV, anc, INT)


# ---------- piezas 3D
def poly(h, pts2, fill, st="#222", sw=.7, extra=""):
    h.a('<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts2) + f'" fill="{fill}" stroke="{st}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>')


def linea3(h, pts, color, w, extra='stroke-linecap="round" stroke-linejoin="round"'):
    d = "M" + " L".join(f"{h.P(*p)[0]:.1f},{h.P(*p)[1]:.1f}" for p in pts)
    h.path(d, "none", color, w, extra)


def hilo3(h, pts, color, w, borde="#111"):
    """conductor aislado en 3D (con borde y brillo)"""
    linea3(h, pts, borde, w + 1.4)
    linea3(h, pts, color, w)
    if color not in ("#1a1a1a",):
        d = "M" + " L".join(f"{h.P(*p)[0]:.1f},{h.P(*p)[1]-w*.22:.1f}" for p in pts)
        h.path(d, "none", "#fff", max(.5, w * .2), 'opacity=".35" stroke-linecap="round" stroke-linejoin="round"')


def va3(h, pts, w):
    linea3(h, pts, "#163d1c", w + 1.4)
    d = "M" + " L".join(f"{h.P(*p)[0]:.1f},{h.P(*p)[1]:.1f}" for p in pts)
    h.path(d, "none", VE, w, 'stroke-linecap="round" stroke-linejoin="round"')
    h.path(d, "none", AM, w * .55, f'stroke-dasharray="{w*.9:.1f} {w*.9:.1f}" stroke-linejoin="round"')


def punta_cu(h, p, q, w=3):
    """punta pelada de Cu (cuerda) de p a q (3D)"""
    a, b = h.P(*p), h.P(*q)
    h.ln(*a, *b, "#7a4512", w + 1.2); h.ln(*a, *b, CU, w); h.ln(*a, *b, "#f6c39a", w * .3)


def cara_cable(h, x, y, r, nucleos=4, pe=False):
    """cara cortada de un cable (2D en la hoja): cubierta, conductores con su color y cuerda de hilos"""
    h.circ(x, y, r, "#2a2a2a", "#000", .8); h.circ(x, y, r * .86, "#c8c8c8", "#000", .3)
    cols = [L1, L2, L3, NC][:nucleos] if not pe else [VE, NC, L1]
    if nucleos == 3: d = r * .42; angs = [90, 210, 330]
    else: d = r * .42; angs = [45 + 90 * i for i in range(4)]
    rc = r * (.36 if nucleos == 4 else .40)
    for col, an in zip(cols, angs):
        cx = x + d * math.cos(math.radians(an)); cy = y - d * math.sin(math.radians(an))
        h.circ(cx, cy, rc, col, "#000", .4)
        rcu = rc * .66; h.circ(cx, cy, rcu, CU, "#7a4512", .3)
        rh = rcu / 3
        for px, py in [(0, 0)] + [(2 * rh * math.cos(math.radians(60 * j)), 2 * rh * math.sin(math.radians(60 * j))) for j in range(6)]:
            h.circ(cx + px, cy + py, rh * .95, "#e7a35a", "#7a4512", .25)


def cubierta3(h, pts, w, col="#222"):
    linea3(h, pts, "#000", w + 1.6, 'stroke-linecap="butt" stroke-linejoin="round"')
    linea3(h, pts, col, w, 'stroke-linecap="butt" stroke-linejoin="round"')
    d = "M" + " L".join(f"{h.P(*p)[0]:.1f},{h.P(*p)[1]-w*.25:.1f}" for p in pts)
    h.path(d, "none", "#777", w * .18, 'stroke-linejoin="round"')


def cono(h, x, y, s=1.0):
    """cono de tránsito (2D sobre la escena)"""
    poly(h, [(x - 9 * s, y), (x - 2 * s, y - 28 * s), (x + 2 * s, y - 28 * s), (x + 9 * s, y)], "#f97316", "#7c2d12", .7)
    poly(h, [(x - 6.2 * s, y - 10 * s), (x - 4.6 * s, y - 17 * s), (x + 4.6 * s, y - 17 * s), (x + 6.2 * s, y - 10 * s)], "#fff", "none", 0)
    h.rect(x - 12 * s, y - 2 * s, 24 * s, 4 * s, "#ea580c", "#7c2d12", .6)


def chk(h, x, y, ok=True):
    h.circ(x, y, 11, "#34C759" if ok else "#FF3B30", "#fff", 1.5)
    if ok: h.path(f"M{x-5},{y} l3.5,4 l6.5,-8", "none", "#fff", 2.4)
    else: h.path(f"M{x-4.5},{y-4.5} l9,9 M{x+4.5},{y-4.5} l-9,9", "none", "#fff", 2.4)
