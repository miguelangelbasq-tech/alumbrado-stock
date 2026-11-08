"""conexkit · ayudas del grupo «conex» (punteras, terminales, empalmes, prensacables, riel, cable canal) sobre fichakit.
Lee r3d/perfiles_conex.json (sale de r3d/piezas/perfiles_conex.mjs con `node exportar_conex.mjs`): el plano y el 3D usan los mismos números.
No modifica fichakit / matbfc / planokit."""
import json, os, math
from fichakit import *          # noqa: F401,F403
from fichakit import AQUI, R3D

PC = json.load(open(os.path.join(R3D, "perfiles_conex.json")))
FECHA = "08/11/2026"

# rayados extra (blanco y negro): polipropileno/PVC de color, goma, resina, gel, aluminio, conductor (hilos)
DEFS3 = '''<defs>
<pattern id="PP" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3.2" height="3.2" fill="#fff"/><line x1="0" y1="0" x2="0" y2="3.2" stroke="#111" stroke-width=".35"/></pattern>
<pattern id="GOM" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="#fff"/><path d="M0,0 V4 M0,0 H4" stroke="#111" stroke-width=".55"/></pattern>
<pattern id="RES" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="7" height="7" fill="#fff"/><line x1="0" y1="0" x2="0" y2="7" stroke="#111" stroke-width=".4"/><circle cx="3.5" cy="2" r=".55" fill="#111"/><circle cx="3.5" cy="5.5" r=".35" fill="#111"/></pattern>
<pattern id="GEL" width="10" height="6" patternUnits="userSpaceOnUse"><rect width="10" height="6" fill="#fff"/><path d="M0,3 q2.5,-2.2 5,0 t5,0" fill="none" stroke="#111" stroke-width=".45"/></pattern>
<pattern id="ALU" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#fff"/><path d="M0,0 V8 M2.2,0 V8" stroke="#111" stroke-width=".45"/></pattern>
<pattern id="HIL" width="2.4" height="2.4" patternUnits="userSpaceOnUse"><rect width="2.4" height="2.4" fill="#fff"/><line x1="0" y1="1.2" x2="2.4" y2="1.2" stroke="#7a4512" stroke-width=".55"/></pattern>
<pattern id="XLP" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="6" height="6" fill="#fff"/><path d="M0,0 V6" stroke="#111" stroke-width=".4" stroke-dasharray="2 1"/></pattern>
<pattern id="CUc" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="5" height="5" fill="#f3d3b5"/><line x1="0" y1="0" x2="0" y2="5" stroke="#8a4a1a" stroke-width=".5"/></pattern>
<pattern id="ADH" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#fff"/><circle cx="1" cy="1" r=".5" fill="#111"/><circle cx="3" cy="3" r=".5" fill="#111"/></pattern>
<pattern id="PLAS3" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(60)"><rect width="6" height="6" fill="#fff"/><path d="M0,0 V6 M2,0 V6" stroke="#111" stroke-width=".4"/></pattern>
</defs>'''
RAY3 = {"PLAS": "POLIAMIDA (PA 6.6)", "PLAS2": "PVC / POLIAMIDA", "MET": "ACERO", "CU": "COBRE ESTAÑADO", "CER": "CERAMICA", "ARE": "ARENA",
        "PP": "POLIPROPILENO (COLLAR)", "GOM": "GOMA / ELASTOMERO", "RES": "RESINA", "GEL": "GEL", "ALU": "ALUMINIO", "HIL": "HILOS DE COBRE (CUERDA)",
        "XLP": "AISLACION XLPE / PVC", "VID": "POLICARBONATO TRANSP.", "ADH": "ADHESIVO TERMOFUSIBLE", "PLAS3": "POLIOLEFINA TERMOCONTRAIBLE"}
COLOR = PC["COLOR"]


def nueva3():
    h = nueva2(); h.a(DEFS3); return h


def rayados3(h, x, y, items, cols=1, dx=200, rowh=21):
    h.txt(x, y, "RAYADOS", 12.5, 700); h.ln(x, y + 4, x + 64, y + 4, K, 1)
    for i, pid in enumerate(items):
        xx = x + (i % cols) * dx; yy = y + 13 + (i // cols) * rowh
        h.rect(xx, yy, 26, 14, f"url(#{pid})", K, .6); h.txt(xx + 32, yy + 11, RAY3[pid], 9.5)
    return y + 13 + ((len(items) + cols - 1) // cols) * rowh


def empaque(n, d, Rb):
    """mismo empaque hexagonal que piezas/conex.mjs (centros de los hilos)"""
    s = d * .98; m = int(math.ceil(Rb / s)) + 2; pts = []
    for i in range(-m, m + 1):
        for j in range(-m, m + 1):
            u, v = (i + (j % 2) * .5) * s, j * s * .866
            if math.hypot(u, v) <= Rb - d / 2 + 1e-6: pts.append((u, v))
    pts.sort(key=lambda p: math.hypot(*p)); return pts[:n]


def hilos(h, cx, cy, n, d, Rb, e, color=True, sw=.3):
    """cuerda en corte transversal: un círculo por hilo (e = px por mm)"""
    for u, v in empaque(n, d, Rb):
        h.circ(cx + u * e, cy - v * e, d / 2 * e * .97, "#e9a466" if color else "#fff", "#6a3510" if color else K, sw)


def hilosComp(h, cx, cy, n, a, e, color=True):
    """hilos compactados por el engarce: celdas hexagonales que llenan un cuadrado de lado a"""
    s = a / math.sqrt(n * 1.15); r = s / math.sqrt(3)
    for i in range(-9, 10):
        for j in range(-9, 10):
            u, v = (i + (j % 2) * .5) * s, j * s * .866
            if abs(u) > a / 2 - s * .45 or abs(v) > a / 2 - s * .45: continue
            p = " ".join(f"{cx + (u + r * math.cos(math.pi / 3 * k + math.pi / 6)) * e:.2f},{cy - (v + r * math.sin(math.pi / 3 * k + math.pi / 6)) * e:.2f}" for k in range(6))
            h.a(f'<polygon points="{p}" fill="{"#e9a466" if color else "#fff"}" stroke="{"#6a3510" if color else K}" stroke-width=".3"/>')


def rectRed(cx, cy, w, hh, r, e):
    """path SVG de un rectángulo redondeado (mm → px)"""
    x0, y0, W, H, R_ = cx - w / 2 * e, cy - hh / 2 * e, w * e, hh * e, r * e
    return f"M{x0+R_:.2f},{y0:.2f} H{x0+W-R_:.2f} A{R_:.2f},{R_:.2f} 0 0 1 {x0+W:.2f},{y0+R_:.2f} V{y0+H-R_:.2f} A{R_:.2f},{R_:.2f} 0 0 1 {x0+W-R_:.2f},{y0+H:.2f} H{x0+R_:.2f} A{R_:.2f},{R_:.2f} 0 0 1 {x0:.2f},{y0+H-R_:.2f} V{y0+R_:.2f} A{R_:.2f},{R_:.2f} 0 0 1 {x0+R_:.2f},{y0:.2f} Z"


def anillo(h, cx, cy, ro, ri, pat, e, sw=1.0):
    """anillo en corte (pared rayada)"""
    h.path(f"M{cx-ro*e:.2f},{cy:.2f} a{ro*e:.2f},{ro*e:.2f} 0 1 0 {2*ro*e:.2f},0 a{ro*e:.2f},{ro*e:.2f} 0 1 0 {-2*ro*e:.2f},0 Z "
           f"M{cx-ri*e:.2f},{cy:.2f} a{ri*e:.2f},{ri*e:.2f} 0 1 1 {2*ri*e:.2f},0 a{ri*e:.2f},{ri*e:.2f} 0 1 1 {-2*ri*e:.2f},0 Z", f"url(#{pat})", K, sw, 'fill-rule="evenodd"')


def secRT(v, pts, pat, sw=1.0, abajo=False, x0=0, fill=None):
    """perfil de revolución [(r, t)] dibujado en corte longitudinal: t → eje horizontal (desde x0), r → arriba (o abajo)"""
    s = -1 if abajo else 1
    v.poly([[x0 + t, s * r] for r, t in pts], fill or f"url(#{pat})", sw)


def vistaRT(v, pts, sw=1.0, abajo=True, x0=0):
    """mitad en vista: el contorno exterior (envolvente de r) del perfil"""
    s = -1 if abajo else 1
    v.poly([[x0 + t, s * r] for r, t in pts], "#fff", sw)


def cotaD(h, x, y1, y2, t, ext=None, c=K):
    h.dimV(x, y1, y2, t, ext=ext, c=c)


def notaOR(h, x, y, t, sz=9.5, anc="start"): h.txt(x, y, t, sz, 400, OR, anc)


def rotuloB(h, codigo, t1, t2, sub, escalas, escalas2):
    rotuloMat(h, codigo, t1, t2, sub, escalas, escalas2, rev="B", fecha=FECHA)


def guardar(h, nombre): h.guardar(os.path.join(AQUI, nombre + ".svg"))

# catálogo completo de la app (v130: STOCK_CATALOGO_BASE) — catalogo.json de esta carpeta no trae 2046, 5019–5029, 5031, 5034
_CAT_APP = json.load(open(os.path.join(AQUI, "_cat_app.json")))
def cat(c, n=999):
    r = _CAT_APP[str(c)]; d = esc(r[0]).upper()
    if len(d) > n: d = d[:n - 1].rstrip() + "…"
    return [str(c), d, r[1]]
