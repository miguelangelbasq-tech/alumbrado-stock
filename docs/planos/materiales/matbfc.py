"""Ayudas comunes de las hojas MAT de borneras, fusibles, canal_riel, caja_columna, termomagneticas, diferenciales, comando.
Usa planokit (sin modificarlo). Datos: FICHAS_TEC / FAMILIAS_MAT del ORIGINAL 130 y el catálogo del pañol."""
import math, sys, textwrap, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT, CORES

AQUI = os.path.dirname(os.path.abspath(__file__))
_cat = {str(r[0]): r for r in json.load(open(os.path.join(AQUI, "catalogo.json")))}
# 5 códigos del catálogo base de la app que no están en catalogo.json (ORIGINAL L16074)
_cat.update({
    "3041": ["3041", 'Interruptor termomagnético bipolar, curva "C" y 10kA | 20 A', "Un."],
    "3042": ["3042", 'Interruptor termomagnético tetrapolar, curva "C", 10 Ka -25A', "Un."],
    "3043": ["3043", 'Interruptor termomagnético tetrapolar, curva "C", 10 Ka -50A', "Un."],
    "3044": ["3044", 'Interruptor termomagnético tripolar, curva "C", 10 Ka -25A', "Un."],
    "3045": ["3045", 'Interruptor termomagnético unipolar, curva "C", 10kA | 6 A', "Un."],
})

def esc(s): return str(s).replace("&", "y").replace("<", "‹").replace(">", "›").replace('"', "''")
def cat(c, n=999):
    r = _cat[str(c)]; d = esc(r[1]).upper()
    if len(d) > n: d = d[:n - 1].rstrip() + '…'
    return [str(c), d, r[2]]

GRIS_BPN = "#a3a9b0"; CEL_BPN = "#4fa3d9"; VER_BPN = "#2e9d4a"; BLANCO = "#f4f5f2"
EXTRA = '''<defs>
<linearGradient id="alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9ecef"/><stop offset=".45" stop-color="#c3c9cf"/><stop offset="1" stop-color="#8e979f"/></linearGradient>
<pattern id="aluF" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#c8cdd2"/><circle cx="1.5" cy="1.5" r=".5" fill="#b3b9bf"/><circle cx="4" cy="3.6" r=".45" fill="#d9dde1"/></pattern>
<linearGradient id="chapaN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4d52"/><stop offset=".5" stop-color="#2b2d31"/><stop offset="1" stop-color="#18191b"/></linearGradient>
<linearGradient id="niq" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d949b"/><stop offset=".45" stop-color="#eef1f4"/><stop offset="1" stop-color="#7c838a"/></linearGradient>
<linearGradient id="ceram" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset=".6" stop-color="#ece6d4"/><stop offset="1" stop-color="#cfc6ad"/></linearGradient>
<linearGradient id="acril" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f4fb" stop-opacity=".55"/><stop offset="1" stop-color="#a9d2ea" stop-opacity=".35"/></linearGradient>
<pattern id="cincado" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#c9d3dc"/><path d="M0,2 l3,-1 M4,6 l3,-1" stroke="#e8eef3" stroke-width=".6"/><circle cx="5" cy="2" r=".5" fill="#aab6c1"/></pattern>
</defs>'''

def nueva():
    h = Hoja(); h.a(EXTRA); return h

def sh(hexc, f):
    if not hexc.startswith("#"): return hexc
    x = hexc.lstrip("#"); r, g, b = (int(x[i:i + 2], 16) for i in (0, 2, 4))
    if f >= 1: r, g, b = (int(v + (255 - v) * (f - 1)) for v in (r, g, b))
    else: r, g, b = (int(v * f) for v in (r, g, b))
    return "#%02x%02x%02x" % (r, g, b)

def wrap(t, n): return textwrap.wrap(t, n) or [""]

def bloque(h, x, y, titulo, lineas, w=400, sz=11, lh=15.5, vin="·"):
    """Título subrayado + viñetas con corte de línea. Las que llevan (*) van en naranja. Devuelve la y final."""
    h.txt(x, y, titulo, 13, 700); h.ln(x, y + 4, x + len(titulo) * 7.3, y + 4, K, 1)
    yy = y + 21; n = int(w / (sz * .6))
    for l in lineas:
        c = OR if "(*)" in l else K
        for i, s in enumerate(wrap(l, n)):
            h.txt(x + (0 if i == 0 else 10), yy, (vin + " " if i == 0 and vin else "") + s, sz, 400, c); yy += lh
        yy += 2
    return yy

def notasW(h, x, y, lineas, w=800, lh=16):
    h.txt(x, y, "NOTAS", 13, 700); h.ln(x, y + 4, x + 52, y + 4, K, 1)
    yy = y + 21; n = int(w / 6.4)
    for i, l in enumerate(lineas):
        c = OR if "(*)" in l else K
        for j, s in enumerate(wrap(l, n)):
            h.txt(x + (0 if j == 0 else 14), yy, (f"{i+1}. " if j == 0 else "") + s, 11, 400, c); yy += lh
    return yy

def rotuloMat(h, codigo, t1, t2, sub, escalas, escalas2, rev="A", fecha="07/11/2026", hoja="1 DE 1", x=890, y=1040, w=752):
    hh = 120; h.rect(x, y, w, hh, "#fff", K, 1.6)
    for xx in (x + 190, x + w - 230, x + w - 110): h.ln(xx, y, xx, y + hh, K, .8)
    h.ln(x, y + 60, x + 190, y + 60, K, .6); h.ln(x + w - 230, y + 60, x + w, y + 60, K, .6)
    h.txt(x + 8, y + 16, "FICHA DE MATERIAL", 9.5, 400, G)
    fs = min(19, 172 / (len(codigo) * .6)); h.txt(x + 95, y + 44, codigo, fs, 700, K, "middle", MONO)
    h.txt(x + 8, y + 76, "PROYECTO", 9.5, 400, G); h.txt(x + 8, y + 100, "ALUMBRADO DE PLAZAS", 12, 700)
    h.txt(x + 200, y + 16, "PIEZA", 9.5, 400, G)
    f1 = 21 if max(len(t1), len(t2)) <= 26 else 18
    h.txt(x + 200, y + 50, t1, f1, 700); h.txt(x + 200, y + 77, t2, f1, 700); h.txt(x + 200, y + 104, sub, 10.5, 400, G)
    e = x + w - 222; h.txt(e, y + 16, "ESCALAS", 9.5, 400, G); h.txt(e, y + 36, escalas, 12, 700, K, "start", MONO); h.txt(e, y + 52, escalas2, 10.5, 400)
    h.txt(e, y + 76, "UNIDADES", 9.5, 400, G); h.txt(e, y + 100, "mm", 13, 700, K, "start", MONO)
    r = x + w - 102; h.txt(r, y + 16, "REV.", 9.5, 400, G); h.txt(r, y + 40, rev, 14, 700, K, "start", MONO)
    h.txt(r, y + 76, "FECHA / HOJA", 9.5, 400, G); h.txt(r, y + 96, fecha, 11, 700, K, "start", MONO); h.txt(r, y + 112, hoja, 11, 700, K, "start", MONO)

def colorOR(i, j, t): return OR if ("(*)" in str(t) or "A CONFIRMAR" in str(t) or "SIN CODIGO" in str(t)) else K

# ---------------- 3D ----------------
def pts(h, lst): return " ".join(f"{h.P(*p)[0]:.1f},{h.P(*p)[1]:.1f}" for p in lst)

def poly(h, lst, fill, st="#222", sw=.6, op=1, extra=""):
    h.a(f'<polygon points="{pts(h, lst)}" fill="{fill}" fill-opacity="{op}" stroke="{st}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>')

def prisma(h, perfil, x0, x1, base, st="#222", sw=.6, tex=None, fin=None, caras=None):
    """Extruye a lo largo de x un perfil [(y,z)…] (antihorario visto desde +x). Dibuja las caras visibles y la tapa en x1.
    base = color (hex) o (top, frente, fin) para gradientes. tex = patrón que se superpone a las caras."""
    n = len(perfil); A = 0
    for i in range(n):
        (y1, z1), (y2, z2) = perfil[i], perfil[(i + 1) % n]; A += y1 * z2 - y2 * z1
    if A < 0: perfil = perfil[::-1]
    caras_ = []
    for i in range(n):
        (y1, z1), (y2, z2) = perfil[i], perfil[(i + 1) % n]
        dy, dz = y2 - y1, z2 - z1; ny, nz = dz, -dy
        if ny + nz <= 1e-9: continue
        L = math.hypot(ny, nz) or 1; ny, nz = ny / L, nz / L
        caras_.append(((y1 + y2) / 2 + (z1 + z2) / 2, [(x0, y1, z1), (x1, y1, z1), (x1, y2, z2), (x0, y2, z2)], ny, nz))
    caras_.sort(key=lambda c: c[0])
    for _, q, ny, nz in caras_:
        if isinstance(base, tuple): col = base[0] if nz > ny else base[1]
        else: col = sh(base, 1 + .22 * nz) if nz > ny else sh(base, .92 + .05 * nz)
        poly(h, q, col, st, sw)
        if tex: poly(h, q, tex, "none", 0)
    capf = fin if fin else (base[2] if isinstance(base, tuple) else sh(base, .74))
    poly(h, [(x1, y, z) for y, z in perfil], capf, st, sw)
    if tex: poly(h, [(x1, y, z) for y, z in perfil], tex, "none", 0)

def hull(p):
    p = sorted(set((round(a, 2), round(b, 2)) for a, b in p))
    if len(p) < 3: return p
    def cr(o, a, b): return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, up = [], []
    for q in p:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], q) <= 0: lo.pop()
        lo.append(q)
    for q in reversed(p):
        while len(up) >= 2 and cr(up[-2], up[-1], q) <= 0: up.pop()
        up.append(q)
    return lo[:-1] + up[:-1]

def cilX(h, x0, x1, yc, zc, r, fill, cap=None, st="#333", sw=.6, n=40):
    c0 = [h.P(x0, yc + r * math.cos(2 * math.pi * i / n), zc + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
    c1 = [h.P(x1, yc + r * math.cos(2 * math.pi * i / n), zc + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
    hh = hull(c0 + c1)
    h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in hh) + f'" fill="{fill}" stroke="{st}" stroke-width="{sw}"/>')
    h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in c1) + f'" fill="{cap or fill}" stroke="{st}" stroke-width="{sw}"/>')

def cilZ(h, z0, z1, xc, yc, r, fill, cap=None, st="#333", sw=.6, n=40):
    c0 = [h.P(xc + r * math.cos(2 * math.pi * i / n), yc + r * math.sin(2 * math.pi * i / n), z0) for i in range(n)]
    c1 = [h.P(xc + r * math.cos(2 * math.pi * i / n), yc + r * math.sin(2 * math.pi * i / n), z1) for i in range(n)]
    hh = hull(c0 + c1)
    h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in hh) + f'" fill="{fill}" stroke="{st}" stroke-width="{sw}"/>')
    h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in c1) + f'" fill="{cap or fill}" stroke="{st}" stroke-width="{sw}"/>')

def cilY(h, y0, y1, xc, zc, r, fill, cap=None, st="#333", sw=.6, n=40):
    c0 = [h.P(xc + r * math.cos(2 * math.pi * i / n), y0, zc + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
    c1 = [h.P(xc + r * math.cos(2 * math.pi * i / n), y1, zc + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
    hh = hull(c0 + c1)
    h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in hh) + f'" fill="{fill}" stroke="{st}" stroke-width="{sw}"/>')
    h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in c1) + f'" fill="{cap or fill}" stroke="{st}" stroke-width="{sw}"/>')

def tornilloY(h, x, y, z, r=2.6, ranura=True):
    """cabeza de tornillo vista en la cara +y (frente)"""
    c = [h.P(x + r * math.cos(2 * math.pi * i / 24), y, z + r * math.sin(2 * math.pi * i / 24)) for i in range(24)]
    h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in c) + '" fill="url(#niq)" stroke="#333" stroke-width=".5"/>')
    if ranura:
        a, b = h.P(x - r * .8, y, z + r * .3), h.P(x + r * .8, y, z - r * .3); h.ln(a[0], a[1], b[0], b[1], "#333", 1)

def tornilloZ(h, x, y, z, r=2.6):
    c = [h.P(x + r * math.cos(2 * math.pi * i / 24), y + r * math.sin(2 * math.pi * i / 24), z) for i in range(24)]
    h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in c) + '" fill="url(#niq)" stroke="#333" stroke-width=".5"/>')
    a, b = h.P(x - r * .8, y, z), h.P(x + r * .8, y, z); h.ln(a[0], a[1], b[0], b[1], "#333", 1)

# riel NS35 × 7,5 (perfil de la ficha: alas de 5, canal 25 exterior / 27 interior, chapa 1,0). y = ancho (35), z = alto.
def perfilNS35(alto=7.5, t=1.0):
    """sección «sombrero»: el canal apoya en la placa (z=0) y las alas quedan a 7,5"""
    return [(0, alto), (0, alto - t), (4, alto - t), (4, 0), (31, 0), (31, alto - t), (35, alto - t), (35, alto), (30, alto), (30, t), (5, t), (5, alto)]

def riel3d(h, x0, x1, y0, z0, ranuras=True):
    per = [(y0 + y, z0 + z) for y, z in perfilNS35()]
    prisma(h, per, x0, x1, ("#dfe6ec", "url(#galv)", "#9aa6b0"), "#3c444c", .5, tex="url(#cincado)")
    if ranuras:
        x = x0 + 12.5
        while x + 7.5 < x1:
            q = [(x - 7.5, y0 + 17.5 - 3.1, z0 + 1.01), (x + 7.5, y0 + 17.5 - 3.1, z0 + 1.01), (x + 7.5, y0 + 17.5 + 3.1, z0 + 1.01), (x - 7.5, y0 + 17.5 + 3.1, z0 + 1.01)]
            poly(h, q, "#2b2f33", "#222", .4); x += 25
        # la pared y el ala de adelante tapan la ranura
        per2 = [(y0 + a, z0 + b) for a, b in [(30, 0), (31, 0), (31, 6.5), (35, 6.5), (35, 7.5), (30, 7.5)]]
        prisma(h, per2, x0, x1, ("#dfe6ec", "url(#galv)", "#9aa6b0"), "#3c444c", .5, tex="url(#cincado)")

def rielCorte(h, x, y, e, fill="url(#ANSI31)", sw=.9):
    """perfil NS35×7,5 en el plano: x,y = esquina sup. izq. (alas arriba); e = px por mm"""
    q = [(0, 0), (5, 0), (5, 6.5), (30, 6.5), (30, 0), (35, 0), (35, 1), (31, 1), (31, 7.5), (4, 7.5), (4, 1), (0, 1)]
    d = "M" + " L".join(f"{x + a * e:.1f},{y + b * e:.1f}" for a, b in q) + " Z"
    h.path(d, fill, K, sw)

# borne BPN genérico (perfil propio, medidas de la tabla Zoloda: A 50 alto, C 53 largo; resto del contorno a confirmar)
def perfilBPN(C=53, A=50):
    k = C / 53
    return [(0, -3), (8.5 * k, -3), (8.5 * k, 0), (44.5 * k, 0), (44.5 * k, -3), (C, -3), (C, 30 * k), (41 * k, A), (12 * k, A), (0, 30 * k)]

def borne3d(h, x0, w, y0, z0, col, tornillos=True, C=53, A=50):
    per = [(y0 + y, z0 + z) for y, z in perfilBPN(C, A)]
    prisma(h, per, x0, x0 + w, (sh(col, 1.25), col, sh(col, .74)), "#1e2226", .55)
    k = C / 53
    if tornillos:
        for yy in (17 * k, 36 * k):
            cx, cy = h.P(x0 + w / 2, y0 + yy, z0 + A)
            h.a(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{w*h._s*.55:.1f}" ry="{w*h._s*.32:.1f}" fill="#202326"/>')
            tornilloZ(h, x0 + w / 2, y0 + yy, z0 + A - .2, min(2.6, w * .33))
    # boca de entrada del cable en la cara +y (frente)
    q = [(x0 + w * .18, y0 + C, z0 + 9), (x0 + w * .82, y0 + C, z0 + 9), (x0 + w * .82, y0 + C, z0 + 17), (x0 + w * .18, y0 + C, z0 + 17)]
    poly(h, q, "#15171a", "#000", .4)

def cil3(h, a, b, r, fill, cap=None, st="#333", sw=.6, n=36, tapa=True):
    """cilindro entre los puntos 3D a y b (cualquier dirección)"""
    ax = [b[i] - a[i] for i in range(3)]; L = math.sqrt(sum(c * c for c in ax)) or 1; ax = [c / L for c in ax]
    t = [1, 0, 0] if abs(ax[0]) < .9 else [0, 1, 0]
    u = [ax[1] * t[2] - ax[2] * t[1], ax[2] * t[0] - ax[0] * t[2], ax[0] * t[1] - ax[1] * t[0]]
    lu = math.sqrt(sum(c * c for c in u)); u = [c / lu for c in u]
    v = [ax[1] * u[2] - ax[2] * u[1], ax[2] * u[0] - ax[0] * u[2], ax[0] * u[1] - ax[1] * u[0]]
    def ring(p): return [h.P(*[p[i] + r * (math.cos(2 * math.pi * k / n) * u[i] + math.sin(2 * math.pi * k / n) * v[i]) for i in range(3)]) for k in range(n)]
    c0, c1 = ring(a), ring(b)
    # la tapa visible es la del extremo más cercano al observador (x+y+z mayor)
    near = c1 if sum(b) >= sum(a) else c0
    hh = hull(c0 + c1)
    h.a('<polygon points="' + " ".join(f"{p:.1f},{q:.1f}" for p, q in hh) + f'" fill="{fill}" stroke="{st}" stroke-width="{sw}"/>')
    if tapa: h.a('<polygon points="' + " ".join(f"{p:.1f},{q:.1f}" for p, q in near) + f'" fill="{cap or fill}" stroke="{st}" stroke-width="{sw}"/>')

def rot(p, c, ang):
    """gira (y,z) alrededor de c=(yc,zc) en grados (positivo = hacia +y abajo)"""
    a = math.radians(ang); y, z = p[0] - c[0], p[1] - c[1]
    return (c[0] + y * math.cos(a) + z * math.sin(a), c[1] - y * math.sin(a) + z * math.cos(a))

def riel3dV(h, x0, x1, zc, yfr=0.0):
    """riel NS35 sobre una placa vertical (plano y = yfr - 7,5): las alas tocan la espalda de los aparatos en y = yfr; centro del riel a la altura zc"""
    per = [(yfr - 7.5 + b, zc - 17.5 + a) for a, b in perfilNS35()]
    prisma(h, per, x0, x1, ("#dfe6ec", "url(#galv)", "#9aa6b0"), "#3c444c", .5, tex="url(#cincado)")

def placaV(h, x0, x1, z0, z1, y=-7.5, t=2, fill=("#e3e8ec", "url(#galv)", "#8f9aa4")):
    """placa (fondo de chapa) vertical, con su cara del frente en y"""
    h.BOX(x0, x1, y - t, y, z0, z1, fill[0], fill[1], fill[2], "#333", .6)

CUERPO = ("#fbfbf8", "#ecebe5", "#c9c7bd")
def modular3d(h, x0, polos, H=85, D=78.5, neck=45, Dr=None, palanca="#2d3038", marca="C16", test=False, mod=18, color_frente=None, ancho=None):
    """aparato modular de riel DIN parado sobre una placa vertical (espalda en y=0, frente en y=D).
    Dr = profundidad del cuerpo de atrás (resto = cuello del frente, alto `neck`), a confirmar."""
    W = ancho if ancho else polos * mod
    Dr = Dr if Dr else D - 20
    z0n, z1n = H / 2 - neck / 2, H / 2 + neck / 2
    prisma(h, [(0, 0), (Dr, 0), (Dr, z0n), (D, z0n), (D, z1n), (Dr, z1n), (Dr, H), (0, H)], x0, x0 + W, CUERPO, "#333", .6)
    # divisiones entre polos en el cuello
    for i in range(1, int(round(W / mod))):
        a, b = h.P(x0 + i * mod, D, z0n), h.P(x0 + i * mod, D, z1n); h.ln(a[0], a[1], b[0], b[1], "#9a9890", .6)
        a, b = h.P(x0 + i * mod, Dr, z1n), h.P(x0 + i * mod, Dr, H); h.ln(a[0], a[1], b[0], b[1], "#b5b3aa", .5)
    # bornes arriba y abajo (en la cara del cuerpo de atrás que mira al frente)
    for i in range(int(round(W / mod))):
        xc = x0 + (i + .5) * mod
        for zc in (H - 8, 8):
            q = [(xc - 6, Dr, zc - 5), (xc + 6, Dr, zc - 5), (xc + 6, Dr, zc + 5), (xc - 6, Dr, zc + 5)]
            poly(h, q, "#1f2226", "#000", .4); tornilloY(h, xc, Dr + .01, zc, 3.0)
    # palanca (manija) que cruza todos los polos
    zc = H / 2
    if palanca: prisma(h, [(D, zc - 4), (D + 7, zc - 3), (D + 7, zc + 3), (D, zc + 4)], x0 + 4, x0 + W - 4, (sh(palanca, 1.6), palanca, sh(palanca, .7)), "#111", .5)
    # ventana de la marca
    q = [(x0 + 2, D, z1n - 4), (x0 + W - 2, D, z1n - 4), (x0 + W - 2, D, zc + 7), (x0 + 2, D, zc + 7)]
    poly(h, q, color_frente or "#f1f2f4", "#777", .4)
    if test:
        cx, cy = h.P(x0 + W - 6, D, z0n + 8)
        h.circ(cx, cy, 5.0, "#f2c200", "#7a6000", .6); h.txt(cx, cy + 3, "T", 7.5, 700, "#222", "middle", INT)
    return W

def txtY(h, x, y, z, s, sz=9, w=700, c="#28285E", anc="middle"):
    """texto pegado a una cara +y (frente) del 3D"""
    px, py = h.P(x, y, z); m = "0.866,-0.5" if getattr(h, "_esp", False) else "0.866,0.5"
    h.a(f'<text transform="matrix({m},0,1,{px:.1f},{py:.1f})" font-size="{sz}" font-weight="{w}" fill="{c}" text-anchor="{anc}" {INT}>{s}</text>')

def txtX(h, x, y, z, s, sz=9, w=700, c="#28285E", anc="middle"):
    """texto pegado a una cara +x (costado derecho) del 3D"""
    px, py = h.P(x, y, z); m = "0.866,0.5" if getattr(h, "_esp", False) else "0.866,-0.5"
    h.a(f'<text transform="matrix({m},0,1,{px:.1f},{py:.1f})" font-size="{sz}" font-weight="{w}" fill="{c}" text-anchor="{anc}" {INT}>{s}</text>')

def frenteModular(h, x, y, W, H, e, mod=18, marca="", neck=45, test=False, cota=True):
    """vista de frente de un aparato modular (plano, blanco y negro). W, H en mm."""
    h.rect(x, y, W * e, H * e, "#fff", K, 1.5)
    zn0 = (H - neck) / 2
    h.rect(x + 2, y + zn0 * e, W * e - 4, neck * e, "none", K, .7)
    n = int(round(W / mod))
    for i in range(n):
        xc = x + (i + .5) * W * e / n
        for zz in (8, H - 8):
            h.rect(xc - 6 * e, y + (zz - 5) * e, 12 * e, 10 * e, "#fff", K, .6)
            h.circ(xc, y + zz * e, 3 * e, "#fff", K, .7); h.ln(xc - 2.4 * e, y + zz * e + 1.6 * e, xc + 2.4 * e, y + zz * e - 1.6 * e, K, .7)
        if i: h.ln(x + i * W * e / n, y + zn0 * e, x + i * W * e / n, y + (zn0 + neck) * e, K, .4)
    h.rect(x + 3 * e, y + (H / 2 - 4) * e, W * e - 6 * e, 8 * e, "url(#ANSI31)", K, .8)       # palanca
    if marca: h.txt(x + W * e / 2, y + (zn0 + 9) * e, marca, 9.5, 700, K, "middle")
    if test:
        h.circ(x + W * e - 7 * e, y + (zn0 + neck - 8) * e, 3.5 * e, "#fff", K, .8); h.txt(x + W * e - 7 * e, y + (zn0 + neck - 8) * e + 3.5, "T", 9, 700, K, "middle")
    h.ln(x - 6, y + H / 2 * e, x + W * e + 6, y + H / 2 * e, K, .35, h.EJE)

def perfilModular(h, x, y, H, D, e, Dr, neck=45, rail=True):
    zn0 = (H - neck) / 2
    pts_ = [(0, 0), (Dr, 0), (Dr, zn0), (D, zn0), (D, zn0 + neck), (Dr, zn0 + neck), (Dr, H), (0, H)]
    h.path("M" + " L".join(f"{x + a * e:.1f},{y + b * e:.1f}" for a, b in pts_) + " Z", "#fff", K, 1.5)
    h.rect(x + D * e, y + (H / 2 - 4) * e, 9 * e, 8 * e, "url(#ANSI31)", K, .8)
    if rail:
        h.rect(x - 7.5 * e, y + (H / 2 - 17.5) * e, 7.5 * e, 35 * e, "url(#ANSI31)", K, .8)
        h.path(f"M{x - 1},{y + (H/2 + 17.5) * e} l0,{6*e} l{-4*e},0", "none", K, .8)   # traba (clip) del riel

def setIso(h, s, ox, oy, espejo=False):
    """iso de planokit; con espejo=True se mira desde el otro lado (x e y cambian de lugar en pantalla):
    la cara +y (el frente de los aparatos) queda mirando a la derecha."""
    h.iso(s, ox, oy); h._esp = espejo
    c = math.cos(math.radians(30))
    if espejo: h.P = lambda x, y, z: (ox + s * (y * c - x * c), oy + s * (.5 * x + .5 * y) - s * z)
    else: h.P = lambda x, y, z: (ox + s * (x * c - y * c), oy + s * (.5 * x + .5 * y) - s * z)

def bandaZ(h, z0, z1, xc, yc, r, fill, st="#333", sw=.6, n=40):
    """faja (abrazadera) alrededor de un cilindro vertical: solo la mitad que se ve"""
    ang = [math.radians(-45 + 180 * i / n) for i in range(n + 1)]
    lo = [h.P(xc + r * math.cos(a), yc + r * math.sin(a), z0) for a in ang]
    hi = [h.P(xc + r * math.cos(a), yc + r * math.sin(a), z1) for a in ang][::-1]
    h.a('<polygon points="' + " ".join(f"{p:.1f},{q:.1f}" for p, q in lo + hi) + f'" fill="{fill}" stroke="{st}" stroke-width="{sw}"/>')
