"""colkit · hojas MAT del grupo «col» (columnas PRFV y metálica, vínculos, brazo H°G°, apoyos, luminaria LED, portalámpara E27).
Plano con la geometría de r3d/perfiles_col.json (sale de r3d/piezas/perfiles_col.mjs, la misma del 3D) y renders r3d/out/col_*.png.
Usa fichakit / matbfc / planokit / matkit sin modificarlos."""
import json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fichakit import *          # noqa: F401,F403  (nueva2, Vista, img3d, globo3d, columna, rayadosRef, llamada, lineaCorte, bloque, notasW, rotuloMat, R3D…)
from fichakit import RAYADOS
from matkit import CAT

PC = json.load(open(os.path.join(R3D, "perfiles_col.json")))
PRFV, MET, VIN, BHG, APO, LUM, E27 = (PC[k] for k in ("PRFV", "MET", "VIN", "BHG", "APO", "LUM", "E27"))

DEFS_COL = '''<defs>
<pattern id="PRFV" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#fff"/><path d="M0,0 V8 M4,0 V8" stroke="#111" stroke-width=".45" stroke-dasharray="3 1.5"/></pattern>
<pattern id="ALU" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><path d="M0,0 V7" stroke="#111" stroke-width=".5"/><path d="M3.5,0 V7" stroke="#111" stroke-width=".5" stroke-dasharray="1 1.4"/></pattern>
<pattern id="MAD" width="10" height="6" patternUnits="userSpaceOnUse"><rect width="10" height="6" fill="#fff"/><path d="M0,1.5 Q2.5,0 5,1.5 T10,1.5 M0,4.5 Q2.5,3 5,4.5 T10,4.5" fill="none" stroke="#111" stroke-width=".45"/></pattern>
<pattern id="GOMA" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#3a3a3a"/><circle cx="2" cy="2" r=".6" fill="#fff"/></pattern>
<pattern id="HA" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#fff"/><path d="M2,3 l2,-1.5 l1,2 z M9,8 l2.5,1 l-1.5,2 z" fill="none" stroke="#111" stroke-width=".5"/><circle cx="10" cy="3" r=".6" fill="#111"/><circle cx="4" cy="11" r=".5" fill="#111"/><path d="M0,14 L14,0" stroke="#111" stroke-width=".35"/></pattern>
<pattern id="TELG" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><path d="M0,4 q2,-3 4,0 t4,0" fill="none" stroke="#111" stroke-width=".5"/></pattern>
</defs>'''
RAYADOS.extend([("PRFV", "PRFV (POLIESTER + FIBRA)"), ("ALU", "ALUMINIO INYECTADO"), ("MAD", "MADERA"), ("GOMA", "JUNTA DE GOMA / SILICONA"),
                ("HA", "H°A° PRETENSADO"), ("CONC", "HORMIGON H-13"), ("EARTH", "TERRENO NATURAL"), ("SAND", "ARENA SECA"), ("CONCP", "SELLO / H° POBRE"),
                ("TELG", "TELGOPOR")])
OR_ = OR


def nueva3():
    h = nueva2(); h.a(DEFS_COL); return h


def mm(v):
    """1234.5 → '1.234,5' (es-AR)"""
    s = f"{v:,.1f}" if abs(v - round(v)) > 1e-6 else f"{int(round(v)):,}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def codTabla(h, x, y, cods, dato, titulo="CODIGOS DEL PAÑOL", wd=150, wdesc=None, rowh=15, n=None):
    """tabla CODIGO · DESCRIPCION (catálogo) · UN. · DATO. dato: {cod: texto}"""
    wdesc = wdesc or (800 - 52 - 40 - wd)
    nc = n or int(wdesc / 5.6)
    filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO"]]
    for c in cods:
        d, u = CAT[str(c)]; d = esc(d).upper()
        if len(d) > nc: d = d[:nc - 1].rstrip() + "…"
        filas.append([str(c), d, u, dato.get(c, dato.get(str(c), ""))])
    return h.tabla(x, y, [(52, "c", True), (wdesc, "l", False), (40, "c", False), (wd, "l", False)], filas, rowh=rowh, titulo=titulo, colores=colorOR)


def tablaD(h, x, y, filas, cols, titulo, rowh=15):
    return h.tabla(x, y, cols, filas, rowh=rowh, titulo=titulo, colores=colorOR)


def hatchPoly(h, pts, pat, sw=1.0, st=K):
    h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in pts) + " Z", f"url(#{pat})", st, sw)


def poly(h, pts, fill="#fff", sw=1.0, st=K, extra="", cerrar=True):
    h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in pts) + (" Z" if cerrar else ""), fill, st, sw, extra)


def suelo(h, x0, x1, y, rayas=True):
    h.ln(x0, y, x1, y, K, 1.4)
    if rayas:
        for xx in range(int(x0) + 4, int(x1), 9): h.ln(xx, y + 1, xx - 6, y + 7, K, .4)


def rotura(h, x0, x1, y):
    """línea de rotura (zig-zag) horizontal"""
    xm = (x0 + x1) / 2
    h.path(f"M{x0-4:.1f},{y:.1f} L{xm-4:.1f},{y:.1f} L{xm-1:.1f},{y-5:.1f} L{xm+2:.1f},{y+5:.1f} L{xm+5:.1f},{y:.1f} L{x1+4:.1f},{y:.1f}", "none", K, .6)


def flechaRot(h, cx, cy, r, a0, a1, c=K):
    a0r, a1r = math.radians(a0), math.radians(a1)
    x0, y0 = cx + r * math.cos(a0r), cy - r * math.sin(a0r); x1, y1 = cx + r * math.cos(a1r), cy - r * math.sin(a1r)
    h.path(f"M{x0:.1f},{y0:.1f} A{r},{r} 0 0,0 {x1:.1f},{y1:.1f}", "none", c, .7)


def tornilloV(h, x, y, ancho, alto, dir=1):
    """tornillo en vista lateral simple: cabeza + vástago (dir 1 = vástago hacia abajo)"""
    h.rect(x - ancho, y - (alto * .25 if dir > 0 else 0), ancho * 2, alto * .25, "#fff", K, .8)
    h.rect(x - ancho * .5, y, ancho, alto * dir, "#fff", K, .7)


def pie3d(h, nombre, txt=None):
    h.txt(890, 1012, txt or f"RENDER: three.js (r3d/escenas/{nombre}) CON LA MISMA GEOMETRIA DEL PLANO (r3d/piezas/perfiles_col.mjs). FUENTES: r3d/FUENTES_col.md",
          9.5, 400, G, "start", INT)


def guardarCol(h, nombre):
    h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), nombre + ".svg"))
