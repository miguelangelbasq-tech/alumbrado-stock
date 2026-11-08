"""civilkit · ayudas del grupo «civil» (caños, cámaras, áridos y hormigones, mampostería, señalización y sellado, reposición,
fijación) sobre fichakit. Lee r3d/perfiles_civil.json (sale de r3d/piezas/perfiles_civil.mjs con `node exportar_civil.mjs`):
el plano y el 3D usan los mismos números. No modifica fichakit / matbfc / planokit."""
import json, os, math
from fichakit import *          # noqa: F401,F403
from fichakit import AQUI, R3D
from matbfc import esc

PC = json.load(open(os.path.join(R3D, "perfiles_civil.json")))
CAT = {int(k): v for k, v in json.load(open(os.path.join(AQUI, "_cat_app.json"))).items()}
FECHA = "08/11/2026"


def catC(c, n=999):
    d, u = CAT[c]; d = esc(d).upper()
    if len(d) > n: d = d[:n - 1].rstrip() + "…"
    return [str(c), d, u]


# rayados extra (blanco y negro, ISO 128-50 / práctica de obra)
DEFS4 = '''<defs>
<pattern id="PE" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#fff"/><line x1="0" y1="0" x2="0" y2="3" stroke="#111" stroke-width=".7"/></pattern>
<pattern id="PVCr" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#111" stroke-width=".45"/></pattern>
<pattern id="BRZ" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><path d="M0,0 V6 M3,0 V6" stroke="#111" stroke-width=".4"/><path d="M1.5,0 V6" stroke="#111" stroke-width=".4" stroke-dasharray="1 1"/></pattern>
<pattern id="WOOD" width="22" height="8" patternUnits="userSpaceOnUse"><rect width="22" height="8" fill="#fff"/><path d="M0,3 q6,-2 11,0 t11,0 M0,6.5 q7,1.5 14,0 t8,0" stroke="#111" stroke-width=".45" fill="none"/></pattern>
<pattern id="ASPH" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#fff"/><circle cx="2" cy="2" r="1" fill="#111"/><circle cx="7" cy="6" r=".8" fill="#111"/><circle cx="4" cy="8.5" r=".5" fill="#111"/><path d="M0,5 L10,5" stroke="#111" stroke-width=".25"/></pattern>
<pattern id="LAD" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><line x1="0" y1="0" x2="0" y2="6" stroke="#111" stroke-width=".55"/></pattern>
<pattern id="MORT" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><circle cx="1.5" cy="1.5" r=".4" fill="#111"/><circle cx="5.5" cy="3.5" r=".35" fill="#111"/><circle cx="3" cy="6.5" r=".45" fill="#111"/><circle cx="7" cy="7" r=".3" fill="#111"/></pattern>
<pattern id="GOMA" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="#fff"/><path d="M0,0 V4 M0,0 H4" stroke="#111" stroke-width=".55"/></pattern>
<pattern id="BASE" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#fff"/><circle cx="3.5" cy="3.5" r="2.2" fill="none" stroke="#111" stroke-width=".5"/><circle cx="10.5" cy="9.5" r="2.6" fill="none" stroke="#111" stroke-width=".5"/><circle cx="9" cy="2.5" r=".6" fill="#111"/></pattern>
<pattern id="CERAM" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><path d="M0,0 V5 M2.5,0 V5" stroke="#111" stroke-width=".35"/></pattern>
</defs>'''
RAYC = {"PLAS": "POLIAMIDA / NYLON 66", "PVCr": "PVC RIGIDO", "PE": "PEAD (POLIETILENO)", "MET": "ACERO", "BRZ": "BRONCE", "CONC": "HORMIGON",
        "CONCP": "HORMIGON POBRE", "MORT": "MORTERO / REVOQUE", "SAND": "ARENA", "EARTH": "TERRENO NATURAL", "ANSI37": "RELLENO COMPACTADO",
        "LAD": "LADRILLO", "WOOD": "MADERA", "ASPH": "CARPETA ASFALTICA", "FOAM": "TELGOPOR (EPS)", "GOMA": "GOMA / ELASTOMERO", "BASE": "BASE GRANULAR",
        "CERAM": "BALDOSA CALCAREA", "CU": "COBRE", "ANSI31": "CORTE (GENERAL)"}


def nuevaC():
    h = nueva2(); h.a(DEFS4); return h


def rayadosC(h, x, y, items, cols=1, dx=190, rowh=20):
    h.txt(x, y, "RAYADOS", 12.5, 700); h.ln(x, y + 4, x + 64, y + 4, K, 1)
    for i, pid in enumerate(items):
        xx = x + (i % cols) * dx; yy = y + 13 + (i // cols) * rowh
        h.rect(xx, yy, 26, 14, f"url(#{pid})", K, .6); h.txt(xx + 32, yy + 11, RAYC[pid], 9.5)
    return y + 13 + ((len(items) + cols - 1) // cols) * rowh


def tablaCod(h, x, y, cods, extra=None, w=800, rowh=15, titulo="CODIGOS DEL PAÑOL", tit_extra="MEDIDA", wext=150, n=None):
    """código · descripción (catálogo) · [extra] · un. Las celdas con (*) o A VINCULAR van en naranja"""
    wu = 66; wd = w - 46 - wu - (wext if extra else 0)
    cols = [(46, "c", True), (wd, "l", False)] + ([(wext, "c", False)] if extra else []) + [(wu, "c", False)]
    fil = [["COD.", "DESCRIPCION (CATALOGO DEL PAÑOL)"] + ([tit_extra] if extra else []) + ["UN."]]
    nn = n or int(wd / 6.1)
    for c in cods:
        r = catC(c, nn); fil.append([r[0], r[1]] + ([extra.get(c, "—")] if extra else []) + [r[2]])
    return h.tabla(x, y, cols, fil, rowh=rowh, titulo=titulo, colores=colorOR)


def tablaG(h, x, y, cols, filas, rowh=15, titulo=None):
    return h.tabla(x, y, cols, filas, rowh=rowh, titulo=titulo, colores=colorOR)


def subt(h, x, y, t, sub=None, w=None):
    h.txt(x, y, t, 13, 700); h.ln(x, y + 4, x + (w or len(t) * 7.4), y + 4, K, 1)
    if sub: h.txt(x, y + 18, sub, 9.5, 400, G)


def t3d(h, x, y, t, sub=None):
    h.titulo(x, y, t, sub or "")


def nota3d(h, x, y, t):
    h.txt(x, y, t, 9.5, 400, G, "start", INT)


def hatchRect(h, x, y, w, hh, pat, sw=1.0):
    h.rect(x, y, w, hh, f"url(#{pat})", K, sw)


def cotaOR(t):
    return OR if "(*)" in t else K


def guardarC(h, nombre):
    h.guardar(os.path.join(AQUI, nombre + ".svg")); print("ok", nombre)


def arcoPath(cx, cy, r, a0, a1, n=40):
    return " ".join(f"{'M' if i == 0 else 'L'}{cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)):.2f},{cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n)):.2f}" for i in range(n + 1))


def anillo(h, cx, cy, ro, ri, pat, sw=1.2):
    """sección de caño (anillo rayado)"""
    h.a(f'<path d="M{cx - ro:.2f},{cy:.2f} a{ro:.2f},{ro:.2f} 0 1,0 {2 * ro:.2f},0 a{ro:.2f},{ro:.2f} 0 1,0 {-2 * ro:.2f},0 Z M{cx - ri:.2f},{cy:.2f} a{ri:.2f},{ri:.2f} 0 1,1 {2 * ri:.2f},0 a{ri:.2f},{ri:.2f} 0 1,1 {-2 * ri:.2f},0 Z" fill="url(#{pat})" fill-rule="evenodd" stroke="{K}" stroke-width="{sw}"/>')


def piedras2d(h, x, y, w, hh, n, d0, d1, semilla=1, fill="#fff", sw=.5, clip=True):
    """piedras angulosas dibujadas (granulometría en el plano)"""
    import random
    rnd = random.Random(semilla)
    cid = f"cp{semilla}_{int(x)}_{int(y)}"
    if clip: h.a(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{hh}"/></clipPath><g clip-path="url(#{cid})">')
    for _ in range(n):
        d = d0 + (d1 - d0) * rnd.random() ** 1.5; cx = x + rnd.random() * w; cy = y + rnd.random() * hh
        k = rnd.randint(5, 7); a0 = rnd.random() * 6.28
        pts = " ".join(f"{cx + d / 2 * (.7 + .4 * rnd.random()) * math.cos(a0 + 6.283 * i / k):.1f},{cy + d / 2 * (.6 + .4 * rnd.random()) * math.sin(a0 + 6.283 * i / k):.1f}" for i in range(k))
        h.a(f'<polygon points="{pts}" fill="{fill}" stroke="{K}" stroke-width="{sw}"/>')
    if clip: h.a('</g>')
