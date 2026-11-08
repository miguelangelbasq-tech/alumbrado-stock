"""fichakit · hojas de materiales «de catálogo»: plano a la izquierda dibujado con los MISMOS perfiles del 3D
(r3d/perfiles.json, que sale de r3d/piezas/perfiles.mjs) y render three.js a la derecha (r3d/out/*.png) con globos que apuntan
a las anclas proyectadas (r3d/out/*.png.json). Usa matbfc / planokit sin modificarlos.

    from fichakit import *
    h = nueva2()
    v = Vista(h, ox, oy, e)            # origen de la vista en la hoja y escala (px de hoja por mm); y → derecha, z → arriba
    v.seccion(PERF['SECC']['bpn'], 'PLAS')   # multipolígono rayado
    v.poly(pts, 'url(#MET)')                  # pieza metálica en corte
    A = img3d(h, 'bpn_fila', x, y, w)         # inserta el render y devuelve A('ancla') → (x, y) en la hoja
    globo3d(h, A('tornillo'), '2', gx, gy, 'TORNILLO M4')
"""
import json, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *                      # noqa: F401,F403  (nueva, bloque, notasW, rotuloMat, cat, colorOR, rielCorte, sh…)
from planokit import K, G, OR, NV, CAD, MONO, INT

AQUI = os.path.dirname(os.path.abspath(__file__))
R3D = os.path.normpath(os.path.join(AQUI, "..", "..", "r3d"))
PERF = json.load(open(os.path.join(R3D, "perfiles.json")))

# rayados del plano en blanco y negro (ISO 128-50 / práctica de catálogo): plástico, acero, cobre/latón, cerámica, arena, vidrio
DEFS2 = '''<defs>
<pattern id="PLAS" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#111" stroke-width=".45"/></pattern>
<pattern id="MET" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="6" height="6" fill="#fff"/><path d="M0,0 V6 M1.6,0 V6" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="CU" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="7" height="7" fill="#fff"/><line x1="0" y1="0" x2="0" y2="7" stroke="#111" stroke-width=".6"/><line x1="3.5" y1="0" x2="3.5" y2="7" stroke="#111" stroke-width=".45" stroke-dasharray="1.6 1.2"/></pattern>
<pattern id="CER" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><path d="M0,0 V6 M0,0 H6" stroke="#111" stroke-width=".4"/></pattern>
<pattern id="ARE" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#fff"/><circle cx="1.2" cy="1.3" r=".45" fill="#111"/><circle cx="3.7" cy="2.6" r=".35" fill="#111"/><circle cx="2.1" cy="4.2" r=".4" fill="#111"/></pattern>
<pattern id="VID" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="8" height="8" fill="#fff"/><path d="M0,2 H3 M4,6 H7" stroke="#111" stroke-width=".4"/></pattern>
<pattern id="PLAS2" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#111" stroke-width=".45"/></pattern>
</defs>'''
RAYADOS = [("PLAS", "POLIAMIDA (PA 6.6)"), ("MET", "ACERO CINCADO"), ("CU", "COBRE / LATON ESTAÑADO"), ("CER", "CERAMICA"), ("ARE", "ARENA DE CUARZO"), ("VID", "VIDRIO")]


def nueva2():
    h = nueva(); h.a(DEFS2); return h


class Vista:
    """vista ortogonal: (y, z) en mm → hoja. ox, oy = dónde cae y=0, z=0. e = px por mm. espejo=True invierte y."""
    def __init__(s, h, ox, oy, e, espejo=False): s.h, s.ox, s.oy, s.e, s.esp = h, ox, oy, e, espejo
    def p(s, y, z): return (s.ox + (-y if s.esp else y) * s.e, s.oy - z * s.e)
    def d(s, pts, cerrar=True): return "M" + " L".join(f"{s.p(y, z)[0]:.2f},{s.p(y, z)[1]:.2f}" for y, z in pts) + (" Z" if cerrar else "")
    def poly(s, pts, fill="none", sw=1.0, st=K, extra=""): s.h.path(s.d(pts), fill, st, sw, extra)
    def linea(s, pts, sw=.8, st=K, extra=""): s.h.path(s.d(pts, False), "none", st, sw, extra)
    def rect(s, y0, y1, z0, z1, fill="none", sw=1.0, extra=""): s.poly([[y0, z0], [y1, z0], [y1, z1], [y0, z1]], fill, sw, K, extra)
    def circ(s, y, z, r, fill="none", sw=.8, extra=""): x, yy = s.p(y, z); s.h.circ(x, yy, r * s.e, fill, K, sw, extra)
    def seccion(s, multi, pat="PLAS", sw=1.4):
        """multipolígono de polygon-clipping (anillos cerrados) relleno con el rayado, borde de contorno"""
        d = " ".join(s.d([q for q in ring[:-1]]) for poly in multi for ring in poly)
        s.h.a(f'<path d="{d}" fill="url(#{pat})" fill-rule="evenodd" stroke="{K}" stroke-width="{sw}" stroke-linejoin="round"/>')
    def eje(s, y0, z0, y1, z1, sw=.45): a, b = s.p(y0, z0), s.p(y1, z1); s.h.ln(a[0], a[1], b[0], b[1], K, sw, s.h.EJE)
    def oculta(s, pts, sw=.6): s.h.path(s.d(pts, False), "none", K, sw, s.h.OCULTA)
    # cotas en mm (las extensiones salen del objeto)
    def cotaH(s, y0, y1, zc, t, zext=None, c=K, dy=-4):
        a, b = s.p(y0, zc), s.p(y1, zc); ext = s.p(0, zext)[1] if zext is not None else None
        s.h.dimH(a[1], min(a[0], b[0]), max(a[0], b[0]), t, ext=ext, c=c, dy=dy)
    def cotaV(s, yc, z0, z1, t, yext=None, c=K):
        a, b = s.p(yc, z0), s.p(yc, z1); ext = s.p(yext, 0)[0] if yext is not None else None
        s.h.dimV(a[0], min(a[1], b[1]), max(a[1], b[1]), t, ext=ext, c=c)


def tornilloCorte(v, y, zTop, dk, k, M, L, ranura=True):
    """tornillo en vista (no se raya en el corte, IRAM/ISO): cabeza con ranura, vástago con la rosca insinuada"""
    v.poly([[y - dk / 2, zTop - k], [y + dk / 2, zTop - k], [y + dk / 2, zTop - .5], [y + dk / 2 - .5, zTop], [y - dk / 2 + .5, zTop], [y - dk / 2, zTop - .5]], "#fff", 1.0)
    if ranura: v.rect(y - .45, y + .45, zTop - k * .55, zTop, "#111", .3)
    v.rect(y - M / 2, y + M / 2, zTop - k - L, zTop - k, "#fff", .9)
    n = max(2, int(L / .7))
    for i in range(n):
        z = zTop - k - L + (i + .5) * L / n; a, b = v.p(y - M / 2, z - .25), v.p(y + M / 2, z + .25); v.h.ln(a[0], a[1], b[0], b[1], K, .4)
    for yy in (y - M / 2 + .35, y + M / 2 - .35): a, b = v.p(yy, zTop - k), v.p(yy, zTop - k - L); v.h.ln(a[0], a[1], b[0], b[1], K, .3)


def img3d(h, nombre, x, y, w):
    """inserta r3d/out/<nombre>.png (ancho w en la hoja) y devuelve A(ancla) → coordenadas en la hoja"""
    meta = json.load(open(os.path.join(R3D, "out", nombre + ".png.json")))
    k = w / meta["ancho"]; hh = meta["alto"] * k
    rel = os.path.relpath(os.path.join(R3D, "out", nombre + ".png"), AQUI)
    h.a(f'<image href="{rel}" x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{hh:.1f}" preserveAspectRatio="none"/>')
    def A(n): px, py = meta["anclas"][n]; return (x + px * k, y + py * k)
    A.alto = hh; A.meta = meta
    return A


def globo3d(h, p, n, gx, gy, texto="", lado="der", c=NV, r=11):
    """globo con línea de llamada a un punto del render; texto a la derecha o a la izquierda del globo"""
    ax, ay = p
    dx, dy = gx - ax, gy - ay; L = math.hypot(dx, dy) or 1
    h.ln(ax, ay, gx - dx / L * r, gy - dy / L * r, c, .7)
    h.circ(ax, ay, 2.2, c, "#fff", .6)
    if n: h.circ(gx, gy, r, "#fff", c, 1.1); h.txt(gx, gy + 4, n, 11, 700, c, "middle", INT)
    else: r = 0; h.circ(gx, gy, 1.6, c, c, 0)
    if texto:
        xx, an = (gx + r + 5, "start") if lado == "der" else (gx - r - 5, "end")
        h.a(f'<text x="{xx:.1f}" y="{gy + 4:.1f}" font-size="10.5" font-weight="700" fill="{c}" text-anchor="{an}" {INT} stroke="#fff" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke">{texto}</text>')


def columna(h, A, items, x, y0, y1, lado="der", paso=27):
    """globos en columna: items = [(ancla, n, texto)]; los ordena por la altura del ancla para que las líneas no se crucen"""
    its = sorted(items, key=lambda t: A(t[0])[1]); ys = []; yy = y0
    for t in its: yy = max(yy, min(A(t[0])[1], y1)); ys.append(yy); yy += paso
    if ys and ys[-1] > y1:                       # si se pasa, corre todo para arriba
        d = ys[-1] - y1; ys = [max(y0 + i * paso, v - d) for i, v in enumerate(ys)]
    for t, gy in zip(its, ys): globo3d(h, A(t[0]), t[1], x, gy, t[2], lado)


def rayadosRef(h, x, y, items, cols=3, dx=165):
    h.txt(x, y, "RAYADOS", 12.5, 700); h.ln(x, y + 4, x + 64, y + 4, K, 1)
    for i, pid in enumerate(items):
        t = dict(RAYADOS)[pid]; xx = x + (i % cols) * dx; yy = y + 14 + (i // cols) * 22
        h.rect(xx, yy, 26, 15, f"url(#{pid})", K, .6); h.txt(xx + 32, yy + 11.5, t, 9.5)
    return y + 14 + ((len(items) + cols - 1) // cols) * 22


def llamada(h, x1, y1, x2, y2, t, c=K, anc="start", sz=9.5):
    """llamada de texto del plano (línea fina + punto)"""
    h.ln(x1, y1, x2, y2, c, .5); h.circ(x1, y1, 1.5, c, c, 0); h.txt(x2 + (3 if anc == "start" else -3), y2 + 3.5, t, sz, 400, c, anc)


def lineaCorte(h, x1, y1, x2, y2, letra, flecha="arriba", lado=1):
    """línea de corte con trazo grueso en las puntas y la letra"""
    h.ln(x1, y1, x2, y2, K, .6, h.EJE)
    for (x, y) in ((x1, y1), (x2, y2)):
        if abs(x2 - x1) > abs(y2 - y1):   # línea horizontal: trazos verticales
            h.ln(x, y - 7, x, y + 7, K, 2)
        else: h.ln(x - 7, y, x + 7, y, K, 2)
    if abs(x2 - x1) > abs(y2 - y1):
        h.txt(x1 - 6, y1 + 4, letra, 13, 700, K, "end"); h.txt(x2 + 6, y2 + 4, letra, 13, 700)
    else:
        h.txt(x1 + 9 * lado, y1 - 2, letra, 13, 700, K, "start" if lado > 0 else "end"); h.txt(x2 + 9 * lado, y2 + 12, letra, 13, 700, K, "start" if lado > 0 else "end")
