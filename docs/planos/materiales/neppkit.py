"""neppkit · ayudas de las hojas del grupo «nepp» (EPP e instrumentos: mat_epp_N, mat_instrumentos_N).
Usa fichakit / matbfc / planokit SIN modificarlos. Geometría: r3d/perfiles_nepp.json (sale de r3d/piezas/perfiles_nepp.mjs,
la misma del 3D). Códigos: respaldo/nuevos.csv (altas del equipo) + catalogo.json (base)."""
import csv, json, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fichakit import *          # noqa: F401,F403
from fichakit import Vista, img3d, globo3d, columna, llamada, lineaCorte, nueva2, bloque, notasW, rotuloMat, esc
from planokit import K, G, OR, NV, CAD, MONO, INT

AQUI = os.path.dirname(os.path.abspath(__file__))
SCR = os.path.normpath(os.path.join(AQUI, "..", ".."))
PN = json.load(open(os.path.join(SCR, "r3d", "perfiles_nepp.json")))
ROJO = "#c81e1e"

_nuevos = {}
for r in csv.DictReader(open(os.path.join(SCR, "respaldo", "nuevos.csv"), encoding="utf-8")):
    _nuevos[r["codigo"]] = r
# 7013 no es alta nueva: es un código del catálogo base que en el respaldo cambió de descripción (respaldo/cambiados.csv)
for r in csv.DictReader(open(os.path.join(SCR, "respaldo", "cambiados.csv"), encoding="utf-8")):
    if r["codigo"] == "7013": _nuevos["7013"] = r
_base = {str(r[0]): r for r in json.load(open(os.path.join(AQUI, "catalogo.json")))}


def catN(c, n=999):
    """fila [código, descripción, un.] tal cual el respaldo (alta del equipo). DE BAJA si activo = False. Si el código ya estaba
    en el catálogo base con otra descripción, lo marca (código reutilizado)."""
    c = str(c); r = _nuevos[c]
    d = esc(r["desc"]).upper(); baja = r["activo"].strip().lower() != "true"
    if baja: d = "† " + d
    if len(d) > n: d = d[:n - 1].rstrip() + "…"
    return [c, d, r["un"], baja]


def baseDe(c):
    r = _base.get(str(c)); return esc(r[1]).upper() if r else None


def colorN(i, j, t):
    s = str(t)
    if "REUTILIZADO" in s or s.startswith("† ") or "DE BAJA" in s: return ROJO
    return OR if ("(*)" in s or "A CONFIRMAR" in s) else K


def tablaCodigos(h, x, y, codigos, dato, w_desc=330, w_dato=170, titulo=None, n=60):
    filas = [["CODIGO", "DESCRIPCION (ALTA DEL EQUIPO, TAL CUAL)", "UN.", "DATO"]]
    for c in codigos:
        cc, d, un, baja = catN(c, n); filas.append([cc, d, un, ("DE BAJA · " if baja else "") + dato.get(str(c), "")])
    return h.tabla(x, y, [(48, "c", True), (w_desc, "l", False), (52, "c", False), (w_dato, "l", False)], filas, rowh=15,
                   titulo=titulo or f"CODIGOS DEL PAÑOL ({len(codigos)})", colores=colorN)


# ---------- rayados propios (blanco y negro) ----------
DEFSN = '''<defs>
<pattern id="GOMA" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><line x1="0" y1="0" x2="0" y2="6" stroke="#111" stroke-width=".5"/><line x1="3" y1="0" x2="3" y2="6" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="CUERO" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><path d="M0,4 q2,-2 4,0 t4,0" fill="none" stroke="#111" stroke-width=".45"/></pattern>
<pattern id="TELA" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#fff"/><path d="M0,2.5 H5 M2.5,0 V5" stroke="#111" stroke-width=".3" stroke-dasharray="1 1"/></pattern>
<pattern id="ESPUMA" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#fff"/><circle cx="2" cy="2" r="1.1" fill="none" stroke="#111" stroke-width=".35"/><circle cx="5.2" cy="5" r=".8" fill="none" stroke="#111" stroke-width=".35"/></pattern>
<pattern id="PLAST" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#111" stroke-width=".45"/></pattern>
<pattern id="ACERO" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="6" height="6" fill="#fff"/><path d="M0,0 V6 M1.6,0 V6" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="POLI" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="4" height="4" fill="#fff"/><line x1="0" y1="2" x2="4" y2="2" stroke="#111" stroke-width=".35"/></pattern>
</defs>'''
RAY_N = {"GOMA": "GOMA / CAUCHO", "CUERO": "CUERO", "TELA": "TEJIDO", "ESPUMA": "ESPUMA (POLIURETANO)",
         "PLAST": "PLASTICO (ABS / PC)", "ACERO": "ACERO / ALUMINIO", "POLI": "CINTA DE POLIESTER"}


def nuevaN():
    h = nueva2(); h.a(DEFSN); return h


def rayadosN(h, x, y, ids, cols=1, dx=200):
    h.txt(x, y, "RAYADOS", 12.5, 700); h.ln(x, y + 4, x + 64, y + 4, K, 1)
    for i, pid in enumerate(ids):
        xx = x + (i % cols) * dx; yy = y + 14 + (i // cols) * 22
        h.rect(xx, yy, 26, 15, f"url(#{pid})", K, .6); h.txt(xx + 32, yy + 11.5, RAY_N[pid], 9.5)
    return y + 14 + ((len(ids) + cols - 1) // cols) * 22


def guantePlano(v, key, fill="#fff", sw=1.3, dedos=True, muneca=True):
    """dibuja el contorno del guante (vista de la palma) con la línea de la muñeca y los pliegues de los dedos"""
    for poly in PN["CONTORNO"][key]:
        for ring in poly: v.poly([q for q in ring[:-1]], fill, sw)
    Pp = PN["PUNOS"][PN["GUANTES"][key]["puno"]]; s = PN["GUANTES"][key]["s"]
    if muneca: v.linea([[-Pp["wB"] / 2, 6], [Pp["wB"] / 2, 6]], .6)
    if dedos:
        M = PN["MANO"]; pv = M["palma"]["v1"] * s
        for d in PN["DEDOS"][key][:4]:
            a, b = d["p0"], d["p1"]; L = math.hypot(b[0] - a[0], b[1] - a[1]); ux, uy = (b[0] - a[0]) / L, (b[1] - a[1]) / L
            q = [a[0] + ux * (pv - a[1]) / max(uy, .2), pv]
            v.linea([[q[0] - d["r"] * .7, q[1]], [q[0] + d["r"] * .7, q[1]]], .45)
    return Pp


def bboxG(key):
    xs, ys = [], []
    for poly in PN["CONTORNO"][key]:
        for ring in poly:
            for x, y in ring: xs.append(x); ys.append(y)
    return min(xs), max(xs), min(ys), max(ys)


def cajaUso(h, x, y, w, titulo, items, color="#1d6b35"):
    """recuadro «ANTES DE USAR / USO EN OBRA»: ✓ CONTROL (verde) y ⚠ OJO (naranja)"""
    yy = y + 22; lin = []
    for t in items:
        c = OR if t.startswith("⚠") else color
        for i, s in enumerate(wrap(t, int(w / 6.7))): lin.append((s, c, i))
    hh = 30 + len(lin) * 14.5
    h.rect(x, y, w, hh, "#fff", color, 1.4); h.rect(x, y, w, 20, color, color, 1.4)
    h.txt(x + 8, y + 14.5, titulo, 11.5, 700, "#fff", "start", INT)
    for s, c, i in lin:
        yy += 14.5; h.txt(x + (10 if i == 0 else 22), yy, s, 10.2, 700 if i == 0 and (s.startswith("✓") or s.startswith("⚠")) else 400, c, "start", INT)
    return y + hh
