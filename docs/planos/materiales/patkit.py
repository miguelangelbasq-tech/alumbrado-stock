"""patkit · hojas del grupo «pat» (jabalina, accesorios de PAT, herrajes, fleje) con la MISMA geometría del 3D
(r3d/perfiles_pat.json, que sale de r3d/piezas/perfiles_pat.mjs) y los renders r3d/out/pat_*.png.
Usa cableskit / fichakit / matbfc / planokit sin modificarlos."""
import json, os, math
from cableskit import *            # noqa: F401,F403  hoja, rayadosC, tablaC, img3d, columna, bloque, notasW, rotuloMat, cat, lineaCorte, llamada, PC, FCOL…
from planokit import K, G, OR, NV, CAD, MONO, INT
import matbfc as _mb
import cableskit as _ck

PP = json.load(open(os.path.join(R3D, "perfiles_pat.json")))
# códigos del catálogo base de la app que no están en catalogo.json (los mismos que usaba matkit, ORIGINAL v130)
_mb._cat.update({
    "7017": ["7017", 'Jabalina 18 2.0 AC/CU 3/4 " X 2 METROS', "Un."],
    "4016": ["4016", 'Bulón 1/2" × 250 mm con tuerca, H°G° MN 52', "Un."],
    "4013": ["4013", 'Arandela de presión (elástica partida) 1/2"', "Un."],
    "4014": ["4014", 'Arandela plana 1/2"', "Un."],
    "4037": ["4037", 'Tuerca cuadrada galvanizada 1/2"', "Un."],
    "4039": ["4039", 'Tuercas 3/4"', "Un."],
    "4024": ["4024", 'Fleje de acero inoxidable AISI 304, 3/4"', "m"],
    "4025": ["4025", 'Hebilla de acero inoxidable AISI 304, 3/4"', "Un."],
    "5004": ["5004", 'Caño de bajada doble aislación Ø2", L = 4 m', "Un."],
    "5501": ["5501", 'Caño de H°G° Ø2", L = 6,4 m — transición aéreo-subterránea (pliego 8.03)', "Un."],
    "5502": ["5502", 'Pipeta / curva de entrada Ø2" para caño de transición', "Un."],
})
_ck.RAY.update({"BRZ": "BRONCE", "ACE": "ACERO", "TIE": "TERRENO NATURAL", "ZN": "ZINC (GALVANIZADO)", "INX": "ACERO INOXIDABLE", "PLAS": "PVC / PLASTICO", "CU": "COBRE"})
DEFSP = '''<defs>
<pattern id="BRZ" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#fff"/><path d="M0,0 V8" stroke="#111" stroke-width=".6"/><path d="M4,0 V8" stroke="#111" stroke-width=".45" stroke-dasharray="2 1.5"/></pattern>
<pattern id="ACE" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><path d="M0,0 V5" stroke="#111" stroke-width=".55"/></pattern>
<pattern id="INX" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="7" height="7" fill="#fff"/><path d="M0,0 V7 M1.6,0 V7 M3.2,0 V7" stroke="#111" stroke-width=".45"/></pattern>
<pattern id="TIE" width="18" height="12" patternUnits="userSpaceOnUse"><rect width="18" height="12" fill="#fff"/><path d="M1,10 l4,-6 M6,10 l4,-6 M11,10 l4,-6" stroke="#111" stroke-width=".55"/><path d="M1,10 H16" stroke="#111" stroke-width=".4"/></pattern>
<pattern id="ZN" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#bbb"/><circle cx="1.5" cy="1.5" r=".6" fill="#111"/></pattern>
<pattern id="PLAS" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#111" stroke-width=".45"/></pattern>
</defs>'''


def hojaP():
    h = hoja(); h.a(DEFSP); return h


def roscaPts(x0, x1, yc, rMaj, paso, ang, e, lado=-1, ext=True, fase=0.0):
    """puntos del perfil de rosca (vista en corte) entre x0 y x1 (mm → hoja con escala e; x0 ya en hoja). lado = -1 arriba, +1 abajo"""
    Hf = paso / (2 * math.tan(math.radians(ang / 2)))
    top = rMaj - Hf / 8; bot = rMaj - Hf * (7 / 8 if ext else 3 / 4) + Hf / 8
    pts = []; L = (x1 - x0) / e; n = max(8, int(L / paso * 16))
    for i in range(n + 1):
        z = L * i / n; s = (z / paso + fase) % 1; tri = 1 - abs(2 * s - 1)
        r = min(top, max(bot, rMaj - 7 / 8 * Hf + Hf * tri))
        pts.append((x0 + z * e, yc + lado * r * e))
    return pts


def poly(pts): return "M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in pts)


def ejeH(h, x0, x1, y): h.ln(x0, y, x1, y, K, .45, h.EJE)
def ejeV(h, x, y0, y1): h.ln(x, y0, x, y1, K, .45, h.EJE)


def codigos(h, x, y, cods, extra=None, titulo=None, wdesc=470, wx=170, rowh=16):
    fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN."] + (["DATO / USO"] if extra else [])]
    n = int(wdesc / 6.7)
    for c in cods:
        r = cat(c, n); fil.append([r[0], r[1], r[2]] + ([extra.get(c, "—")] if extra else []))
    cols = [(52, "c", True), (wdesc, "l", False), (42, "c", False)] + ([(wx, "l", False)] if extra else [])
    return tablaC(h, x, y, cols, fil, titulo or f"CODIGOS DEL PAÑOL ({len(cods)})", rowh=rowh)


def hexLado(h, cx, cy, af, k, e, vertical=True, fill="#fff"):
    """cabeza o tuerca hexagonal vista de costado (entre aristas): 3 caras visibles"""
    ac = af / math.cos(math.pi / 6)
    if vertical:   # eje horizontal, cabeza vista de costado: alto = entre aristas
        x0, x1 = cx, cx + k * e
        h.rect(min(x0, x1), cy - ac / 2 * e, abs(x1 - x0), ac * e, fill, K, 1.2)
        for yy in (cy - ac / 4 * e, cy + ac / 4 * e): h.ln(min(x0, x1), yy, max(x0, x1), yy, K, .7)
