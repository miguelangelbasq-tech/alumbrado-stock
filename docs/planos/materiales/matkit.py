"""matkit · hojas de MATERIALES del pañol (ficha técnica con plano + 3D).
Usa planokit (sin tocarlo) y agrega: rótulo «FICHA», tablas de códigos/datos/uso y un motor 3D de caras
(painter + sombreado por normal) para dibujar piezas reales con su material."""
import math, sys, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT

AQUI = os.path.dirname(os.path.abspath(__file__))
CAT = {c[0]: (c[1], c[2]) for c in json.load(open(os.path.join(AQUI, "catalogo.json")))}
# códigos que no están en catalogo.json pero sí en el catálogo base de la app (CATALOGO del ORIGINAL v130)
CAT.update({
    "7017": ('Jabalina 18 2.0 AC/CU 3/4 " X 2 METROS', "Un."),
    "4016": ('Bulón 1/2" × 250 mm con tuerca, H°G° MN 52', "Un."),
    "4013": ('Arandela de presión (elástica partida) 1/2"', "Un."),
    "4014": ('Arandela plana 1/2"', "Un."),
    "4037": ('Tuerca cuadrada galvanizada 1/2"', "Un."),
    "4039": ('Tuercas 3/4"', "Un."),
    "4024": ('Fleje de acero inoxidable AISI 304, 3/4"', "m"),
    "4025": ('Hebilla de acero inoxidable AISI 304, 3/4"', "Un."),
    "5004": ('Caño de bajada doble aislación Ø2", L = 4 m', "Un."),
    "5501": ('Caño de H°G° Ø2", L = 6,4 m — transición aéreo-subterránea (pliego 8.03)', "Un."),
    "5502": ('Pipeta / curva de entrada Ø2" para caño de transición', "Un."),
})
def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

EXTRA_DEFS = '''<defs>
<pattern id="STEEL" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#fff"/><path d="M0,0 V8 M2.2,0 V8" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="BRZ" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#fff"/><path d="M0,0 V9" stroke="#111" stroke-width=".55"/><path d="M4.5,0 V9" stroke="#111" stroke-width=".45" stroke-dasharray="2 1.5"/></pattern>
<pattern id="PLAS" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="8" height="8" fill="#fff"/><path d="M0,0 V8" stroke="#111" stroke-width=".4"/><circle cx="4" cy="4" r=".5" fill="#111"/></pattern>
<pattern id="PORC" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#fff"/><path d="M0,0 V10" stroke="#111" stroke-width=".5"/><path d="M0,5 H10" stroke="#111" stroke-width=".3"/></pattern>
</defs>'''

MATS = {  # color base, especular, brillo
    "galv": ("#a9b4bd", .55, 18), "inox": ("#c9cfd4", .7, 30), "cobre": ("#c87436", .55, 22),
    "bronce": ("#c9973f", .55, 20), "porc": ("#8e4a24", .6, 40), "nylon": ("#3c4048", .3, 14),
    "negro": ("#26282c", .2, 12), "pvc": ("#d9dcdf", .35, 16), "pvcg": ("#9aa0a6", .3, 14), "verde": ("#2f9e44", .25, 14),
    "amar": ("#e8c21a", .25, 14), "celeste": ("#4fa3d9", .25, 14), "gris": ("#8d9399", .25, 12), "hierro": ("#6b5e55", .2, 10),
    "conc": ("#b9bdc2", .05, 6), "madera": ("#9c6b3c", .1, 8), "azul": ("#2a5fb0", .25, 14), "marron": ("#7b3f1d", .25, 14),
    "rojo": ("#c62828", .25, 14), "estano": ("#d8dcdc", .6, 26), "blanco": ("#f2f3f1", .2, 10), "alu": ("#c4c9cd", .5, 20),
}
def _rgb(h): h = h.lstrip("#"); return [int(h[i:i + 2], 16) for i in (0, 2, 4)]
def _hex(c): return "#" + "".join(f"{max(0, min(255, int(round(v)))):02x}" for v in c)
def _n(v): l = math.sqrt(sum(a * a for a in v)) or 1; return [a / l for a in v]
def _sub(a, b): return [a[i] - b[i] for i in range(3)]
def _add(a, b): return [a[i] + b[i] for i in range(3)]
def _mul(a, k): return [x * k for x in a]
def _dot(a, b): return sum(a[i] * b[i] for i in range(3))
def _cross(a, b): return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
VIEW = _n([1, 1, 1]); LUZ = _n([.15, .55, 1])

class M3:
    """Motor 3D por caras: se agregan caras y se dibujan de atrás hacia adelante."""
    def __init__(s, h): s.h = h; s.f = []
    def face(s, pts, mat, bias=0, edge=None, pat=None, op=1):
        s.f.append((pts, mat, bias, edge, pat, op))
    def render(s):
        h = s.h; out = []
        for pts, mat, bias, edge, pat, op in s.f:
            c = [sum(p[i] for p in pts) / len(pts) for i in range(3)]
            out.append((_dot(c, VIEW) + bias, pts, mat, edge, pat, op))
        out.sort(key=lambda x: x[0])
        for _, pts, mat, edge, pat, op in out:
            n = [0, 0, 0]
            for i in range(len(pts)):
                a, b = pts[i], pts[(i + 1) % len(pts)]
                n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
            n = _n(n)
            if _dot(n, VIEW) < 0: n = _mul(n, -1)
            base, ks, sh = MATS.get(mat, (mat, .2, 12)) if not mat.startswith("#") else (mat, .2, 12)
            dif = max(0, _dot(n, LUZ)); shade = .42 + .62 * dif
            hv = _n(_add(LUZ, VIEW)); sp = ks * max(0, _dot(n, hv)) ** sh
            col = [min(255, v * shade + 255 * sp) for v in _rgb(base)]
            fill = _hex(col)
            pp = " ".join(f"{h.P(*p)[0]:.1f},{h.P(*p)[1]:.1f}" for p in pts)
            st = edge if edge else fill; sw = .7 if edge else .45
            h.a(f'<polygon points="{pp}" fill="{fill}" fill-opacity="{op}" stroke="{st}" stroke-width="{sw}" stroke-linejoin="round"/>')
            if pat: h.a(f'<polygon points="{pp}" fill="url(#{pat})" opacity=".55" stroke="none"/>')
        s.f = []
    # --- primitivas
    def _frame(s, a):
        a = _n(a); t = [0, 0, 1] if abs(a[2]) < .9 else [1, 0, 0]
        u = _n(_cross(a, t)); v = _cross(a, u); return u, v
    def cyl(s, p0, p1, r, mat, n=28, r1=None, caps=True, seg=None, bias=0, edge=None, capmat=None, pat=None, up=None, cull=False):
        r1 = r if r1 is None else r1; ax = _sub(p1, p0); L = math.sqrt(_dot(ax, ax)); u, v = s._frame(ax)
        if up: u = _n(_cross(_n(ax), up)); v = _cross(_n(ax), u)
        ns = seg or max(1, int(L / 60))
        def ring(t, rr): c = _add(p0, _mul(ax, t)); return [_add(c, _add(_mul(u, rr * math.cos(2 * math.pi * i / n)), _mul(v, rr * math.sin(2 * math.pi * i / n)))) for i in range(n)]
        rings = [ring(k / ns, r + (r1 - r) * k / ns) for k in range(ns + 1)]
        for k in range(ns):
            A, B = rings[k], rings[k + 1]
            for i in range(n):
                if cull:
                    am = 2 * math.pi * (i + .5) / n; rad = _add(_mul(u, math.cos(am)), _mul(v, math.sin(am)))
                    if _dot(rad, VIEW) < -0.02: continue
                s.face([A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]], mat, bias, edge, pat)
        if caps:
            if r > 0: s.face(rings[0], capmat or mat, bias, edge)
            if r1 > 0: s.face(rings[-1], capmat or mat, bias, edge)
    def box(s, x0, x1, y0, y1, z0, z1, mat, bias=0, edge="#333", pat=None):
        P = lambda x, y, z: [x, y, z]
        fs = [[P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], [P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)],
              [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)],
              [P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)], [P(x0, y0, z0), P(x0, y1, z0), P(x0, y1, z1), P(x0, y0, z1)]]
        for f in fs: s.face(f, mat, bias, edge, pat)
    def prism(s, poly, o, U, V, W, d, mat, bias=0, edge="#333", pat=None):
        """polígono 2D (u,v) en el plano o+U·u+V·v, extruido d en la dirección W (unitarios)"""
        A = [_add(o, _add(_mul(U, a), _mul(V, b))) for a, b in poly]; B = [_add(p, _mul(W, d)) for p in A]
        s.face(A, mat, bias, edge, pat); s.face(B, mat, bias, edge, pat)
        for i in range(len(A)): j = (i + 1) % len(A); s.face([A[i], A[j], B[j], B[i]], mat, bias, edge, pat)
    def ring(s, c, U, V, W, rin, rout, w0, w1, a0, a1, mat, n=40, bias=0, edge=None):
        """sector de anillo (planchuela curvada): eje W, radios rin..rout, ancho w0..w1, ángulos a0..a1 (grados)"""
        pts = lambda r, w: [_add(c, _add(_add(_mul(U, r * math.cos(math.radians(a0 + (a1 - a0) * i / n))), _mul(V, r * math.sin(math.radians(a0 + (a1 - a0) * i / n)))), _mul(W, w))) for i in range(n + 1)]
        oi, oo, ii, io = pts(rout, w0), pts(rout, w1), pts(rin, w0), pts(rin, w1)
        for i in range(n):
            s.face([oi[i], oi[i + 1], oo[i + 1], oo[i]], mat, bias, edge); s.face([ii[i], ii[i + 1], io[i + 1], io[i]], mat, bias, edge)
            s.face([oi[i], oi[i + 1], ii[i + 1], ii[i]], mat, bias, edge); s.face([oo[i], oo[i + 1], io[i + 1], io[i]], mat, bias, edge)
        for k in (0, n): s.face([oi[k], oo[k], io[k], ii[k]], mat, bias, edge or "#333")
    def rosca(s, p0, p1, r, mat, paso=8, n=20, bias=0):
        ax = _sub(p1, p0); L = math.sqrt(_dot(ax, ax)); m = max(2, int(L / paso))
        for k in range(m):
            a = _add(p0, _mul(ax, k / m)); b = _add(p0, _mul(ax, (k + .5) / m)); c = _add(p0, _mul(ax, (k + 1) / m))
            s.cyl(a, b, r, mat, n, r1=r * .86, caps=False, seg=1, bias=bias); s.cyl(b, c, r * .86, mat, n, r1=r, caps=False, seg=1, bias=bias)
    def hexa(s, p0, p1, r, mat, bias=0, edge="#444"): s.cyl(p0, p1, r, mat, 6, bias=bias, edge=edge)

class Ficha(Hoja):
    def __init__(s):
        super().__init__(); s.a(EXTRA_DEFS); s.m = M3(s)
    def rotulo(s, x, y, w, ficha, t1, t2, sub, escalas, escalas2, rev="A", fecha="07/11/2026", hoja="1 DE 1", proyecto="FICHAS DE MATERIALES"):
        h = 120; s.rect(x, y, w, h, "#fff", K, 1.6)
        for xx in (x + 170, x + w - 230, x + w - 110): s.ln(xx, y, xx, y + h, K, .8)
        s.ln(x, y + 60, x + 170, y + 60, K, .6); s.ln(x + w - 230, y + 60, x + w, y + 60, K, .6)
        s.txt(x + 8, y + 16, "FICHA DE MATERIAL", 9.5, 400, G); sz = min(19, 156 / (.62 * len(ficha)))
        s.txt(x + 85, y + 44, ficha, sz, 700, K, "middle", MONO)
        s.txt(x + 8, y + 76, "PROYECTO", 9.5, 400, G); s.txt(x + 8, y + 94, proyecto, 11.5, 700); s.txt(x + 8, y + 110, "PAÑOL · EMA SERVICIOS", 10, 400, G)
        s.txt(x + 180, y + 16, "TITULO", 9.5, 400, G); s.txt(x + 180, y + 50, t1, 20, 700); s.txt(x + 180, y + 77, t2, 20, 700); s.txt(x + 180, y + 104, sub, 10.5, 400, G)
        e = x + w - 222; s.txt(e, y + 16, "ESCALAS", 9.5, 400, G); s.txt(e, y + 36, escalas, 12, 700, K, "start", MONO); s.txt(e, y + 52, escalas2, 10.5, 400)
        s.txt(e, y + 76, "UNIDADES", 9.5, 400, G); s.txt(e, y + 100, "mm", 13, 700, K, "start", MONO)
        r = x + w - 102; s.txt(r, y + 16, "REV.", 9.5, 400, G); s.txt(r, y + 40, rev, 14, 700, K, "start", MONO)
        s.txt(r, y + 76, "FECHA / HOJA", 9.5, 400, G); s.txt(r, y + 96, fecha, 11, 700, K, "start", MONO); s.txt(r, y + 112, hoja, 11, 700, K, "start", MONO)
    def codigos(s, x, y, cods, w=790, titulo="CODIGOS DEL PAÑOL", extra=None, wx=200):
        """extra: dict codigo → texto de la columna DATO"""
        filas = [("CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.") + (("DATO",) if extra else ())]
        for c in cods:
            d, u = CAT[str(c)]; filas.append((str(c), esc(d), u) + ((esc(extra.get(c, "—")),) if extra else ()))
        cw = [(62, "c", True), (w - 62 - 52 - (wx if extra else 0), "l", False), (52, "c", False)] + ([(wx, "l", False)] if extra else [])
        return s.tabla(x, y, cw, filas, rowh=20, titulo=titulo, colores=lambda i, j, t: OR if ("NO USAR" in t or "no usar" in t or "a confirmar" in t or "(*)" in t) else K)
    def datos(s, x, y, filas, w=390, titulo="DATOS TECNICOS", c1=150):
        return s.tabla(x, y, [(c1, "l", False), (w - c1, "l", False)], [("DATO", "VALOR")] + [(a, esc(b)) for a, b in filas], rowh=20, titulo=titulo,
                       colores=lambda i, j, t: OR if "(*)" in t else K)
    def lista(s, x, y, titulo, lineas, sz=11, dy=17):
        s.txt(x, y, titulo, 13, 700); s.ln(x, y + 4, x + len(titulo) * 7.2, y + 4, K, 1)
        for i, l in enumerate(lineas):
            c = OR if "(*)" in l else K
            if l.startswith("·"): s.txt(x + 4, y + 22 + i * dy, "•", sz, 700, c); s.txt(x + 16, y + 22 + i * dy, esc(l[1:].strip()), sz, 400, c)
            else: s.txt(x + 16, y + 22 + i * dy, esc(l), sz, 400, c)
        return y + 22 + len(lineas) * dy
    def notas(s, x, y, lineas):
        s.txt(x, y, "NOTAS", 13, 700); s.ln(x, y + 4, x + 52, y + 4, K, 1)
        for i, n in enumerate(lineas):
            c = OR if "(*)" in n else K
            s.txt(x, y + 22 + i * 18, f"{i+1}. {esc(n)}", 10.5, 400, c)
    def cot(s, txt, conf=False): return txt + (" (*)" if conf else "")
    def guardar(s, ruta): super().guardar(ruta)
