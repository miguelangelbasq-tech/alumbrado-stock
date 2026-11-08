"""nherrkit · ayudas del grupo «nherr» (herramientas nuevas del pañol: hojas MAT-HERRAMIENTAS-1…11) sobre fichakit / civilkit.
Lee r3d/perfiles_nherr.json (sale de r3d/piezas/perfiles_nherr.mjs con `node exportar_nherr.mjs`): el plano y el 3D usan los mismos
números y contornos. Los códigos y las descripciones salen de respaldo/nuevos.csv tal cual (unidades mezcladas: no se corrigen).
No modifica fichakit / civilkit / matbfc / planokit."""
import csv, json, os, math
from civilkit import *            # noqa: F401,F403  (fichakit + rayados de civil: PLAS, MET, CU, GOMA, WOOD, ...)
from civilkit import AQUI, R3D, esc

PH = json.load(open(os.path.join(R3D, "perfiles_nherr.json")))
NUEVOS = {}
with open(os.path.normpath(os.path.join(AQUI, "..", "..", "respaldo", "nuevos.csv"))) as f:
    for r in csv.DictReader(f):
        NUEVOS[int(r["codigo"])] = (r["desc"], r["un"], r["activo"].strip().lower() == "true")
FECHA = "08/11/2026"

DEFS5 = '''<defs>
<pattern id="TPE" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><path d="M0,0 V6 M3,0 V6" stroke="#111" stroke-width=".35"/><path d="M0,1.5 H6" stroke="#111" stroke-width=".3" stroke-dasharray="1 2"/></pattern>
<pattern id="ABR" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><circle cx="1.2" cy="1.4" r=".55" fill="#111"/><circle cx="4.1" cy="2.3" r=".45" fill="#111"/><circle cx="2.6" cy="4.6" r=".6" fill="#111"/><circle cx="5.3" cy="5.2" r=".35" fill="#111"/></pattern>
<pattern id="FIB" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#fff"/><path d="M0,2.5 H5 M2.5,0 V5" stroke="#111" stroke-width=".55"/></pattern>
<pattern id="FLUX" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#fff"/><circle cx="2" cy="2" r=".5" fill="#111"/><circle cx="5.2" cy="4.6" r=".4" fill="#111"/><path d="M0,7 L7,0" stroke="#111" stroke-width=".3"/></pattern>
<pattern id="ESP" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><circle cx="2" cy="2" r="1.3" fill="none" stroke="#111" stroke-width=".35"/><circle cx="6" cy="5.5" r="1.6" fill="none" stroke="#111" stroke-width=".35"/><circle cx="2.8" cy="6.4" r=".8" fill="none" stroke="#111" stroke-width=".35"/></pattern>
</defs>'''
RAYC.update({"TPE": "CAPA BLANDA (TPE) (*)", "ABR": "ABRASIVO + RESINA", "FIB": "MALLA DE FIBRA DE VIDRIO", "FLUX": "REVESTIMIENTO (RUTILO)",
             "ESP": "GOMA ESPUMA", "PLAS": "PLASTICO / CAPA DURA", "MET": "ACERO"})


def n(x, d=1):
    """número con coma decimal (es-AR)"""
    t = f"{x:.{d}f}".rstrip("0").rstrip(".") if d else f"{x:.0f}"
    return t.replace(".", ",")


def nuevaH():
    h = nuevaC(); h.a(DEFS5); return h


def nuevo(c):
    return NUEVOS[c]


def tablaH(h, x, y, filas, w=800, rowh=15, titulo="CODIGOS DEL PAÑOL (ALTAS DEL EQUIPO)", tit_extra="MEDIDA / DATO", wext=170):
    """filas = [(codigo, dato)]: código · descripción del respaldo (tal cual) · dato · un. (tal cual) · estado"""
    wu, we = 56, 66; wd = w - 46 - wu - we - wext
    cols = [(46, "c", True), (wd, "l", False), (wext, "c", False), (wu, "c", False), (we, "c", False)]
    fil = [["COD.", "DESCRIPCION (RESPALDO DE LA BASE)", tit_extra, "UN.", "ESTADO"]]
    nn = int(wd / 5.9)
    for c, dato in filas:
        d, u, act = nuevo(c); d = esc(d).upper()
        if len(d) > nn: d = d[:nn - 1].rstrip() + "…"
        fil.append([str(c), d, dato, u, "ACTIVO" if act else "DE BAJA"])
    def col(i, j, t):
        if t == "DE BAJA": return OR
        return colorOR(i, j, t)
    return h.tabla(x, y, cols, fil, rowh=rowh, titulo=titulo, colores=col)


def sello2d(h, x, y, s=10, texto="1000 V", c=K, sz=None):
    """símbolo IEC 60417-5216 (doble triángulo) + tensión; (x, y) = centro del símbolo"""
    for cy in (y + s * .5, y - s * .5):
        h.path(f"M{x - s / 2:.1f},{cy + s / 2:.1f} L{x + s / 2:.1f},{cy + s / 2:.1f} L{x:.1f},{cy - s / 2:.1f} Z", c, c, .3)
    if texto: h.txt(x + s * .8, y + (sz or s) * .38, texto, sz or s * 1.05, 700, c)


def rrect(h, cx, cy, w, hh, r, fill, sw=1.0):
    r = min(r, w / 2, hh / 2)
    h.a(f'<rect x="{cx - w / 2:.2f}" y="{cy - hh / 2:.2f}" width="{w:.2f}" height="{hh:.2f}" rx="{r:.2f}" fill="{fill}" stroke="{K}" stroke-width="{sw}"/>')


def multi(v, m, fill="#fff", sw=1.1):
    """dibuja un multipolígono (x, y) con la Vista v (x de la herramienta → horizontal, y → arriba)"""
    d = " ".join(v.d([q for q in ring[:-1]]) for pol in m for ring in pol)
    v.h.a(f'<path d="{d}" fill="{fill}" fill-rule="evenodd" stroke="{K}" stroke-width="{sw}" stroke-linejoin="round"/>')


def espejo(m):
    return [[[[x, -y] for x, y in ring] for ring in pol] for pol in m]


def pinzaArriba(h, P, ox, oy, e, cotas=True, nombre=True, corte=True, rot=0):
    """vista de arriba de la pinza cerrada: aislación (capa dura y blanda), acero, remache, eje; cotas largo / ancho"""
    v = Vista(h, ox, oy, e)
    a = P["aisPol"]
    multi(v, P["brazoA"], "#fff", 1.2); multi(v, P["brazoB"], "#fff", 1.2)
    for lado in (1, -1):
        f = (lambda r: [[r]]) if lado > 0 else (lambda r: espejo([[r]]))
        multi(v, f(a["base"]), "#fff", 1.0); multi(v, f(a["tope"]), "#fff", 1.0); multi(v, f(a["grip"]), "url(#TPE)", 1.0)
    v.circ(P["xp"], 0, 5.2, "#fff", 1.0); v.circ(P["xp"], 0, 2.2, "none", .5)
    v.eje(-6, 0, P["xp"] + P["rp"] + 8, 0)
    # acero dentro del mango (oculto)
    xs = [P["xh"] + i * (P["L"] - 2 - P["xh"]) / 12 for i in range(13)]
    for sg in (1, -1):
        cen = [(x, sg * cdel(P, x)) for x in xs]
        v.oculta([(x, y + P_hc(P, x)) for x, y in cen]); v.oculta([(x, y - P_hc(P, x)) for x, y in cen])
    yext = (P["c1"] + P["hc1"] + P["ais"]["grip"][2])
    if cotas:
        v.cotaH(0, P["L"], yext + 14 / e, f'{P["L"]:g}', zext=yext)
        h.dimV(ox + P["L"] * e + 14, oy - yext * e, oy + yext * e, f'{2 * yext:.0f}', ext=ox + (P["L"] - 4) * e)
    if corte:
        xa = P["corteAA"]; ex = P_hc(P, xa) + P["ais"]["grip"][2] + 5
        p0 = v.p(xa, cdel(P, xa) - ex); p1 = v.p(xa, cdel(P, xa) + ex)
        lineaCorte(h, p1[0], p1[1], p0[0], p0[1], "A", lado=1)
    return v


def cdel(P, x):
    """línea media del mango del brazo A (y < 0) — misma fórmula que perfiles_nherr.pinza"""
    t = max(0.0, (x - P["xh"]) / (P["L"] - P["xh"]))
    return -(P["c0"] + (P["c1"] - P["c0"]) * t ** 1.25)


def P_hc(P, x):
    t = (x - P["xh"]) / (P["L"] - P["xh"])
    return P["hc0"] + (P["hc1"] - P["hc0"]) * t


def pinzaCostado(h, P, ox, oy, e, cotas=True):
    """vista de costado (espesores): cabeza de acero, collar, capa dura y capa blanda; remache"""
    a = P["ais"]; X = lambda x: ox + x * e; Z = lambda z: oy - z * e
    tc = P["tCab"] / 2
    h.path(f"M{X(0)},{Z(tc * .55)} L{X(P['xp'] * .35)},{Z(tc)} H{X(P['xh'] + 3)} V{Z(-tc)} H{X(P['xp'] * .35)} L{X(0)},{Z(-tc * .55)} Z", "#fff", K, 1.2)
    h.rect(X(P["xp"] - 5.2), Z(tc + .9), 10.4 * e, (2 * tc + 1.8) * e, "#fff", K, .9)
    rrect(h, (X(P["xh"] + a["tope"][1] - .5) + X(P["L"])) / 2, oy, (P["L"] - P["xh"] - a["tope"][1] + .5) * e, a["tBase"] * e, 2.4 * e, "#fff", 1.0)
    rrect(h, (X(P["xh"]) + X(P["xh"] + a["tope"][1])) / 2, oy, a["tope"][1] * e, a["tTope"] * e, 2.2 * e, "#fff", 1.0)
    rrect(h, (X(P["xh"] + a["grip"][0]) + X(P["L"] - a["grip"][1])) / 2, oy, (P["L"] - a["grip"][1] - P["xh"] - a["grip"][0]) * e, a["tGrip"] * e, 4.2 * e, "url(#TPE)", 1.0)
    h.ln(X(-4), oy, X(P["L"] + 4), oy, K, .45, h.EJE)
    if cotas:
        h.dimV(X(P["L"]) + 12, Z(a["tGrip"] / 2), Z(-a["tGrip"] / 2), n(a["tGrip"]), ext=X(P["L"] - a["grip"][1]))
        h.dimV(X(0) - 10, Z(tc), Z(-tc), f'{n(P["tCab"])} (*)', ext=X(P["xp"] * .35), c=OR)


def pinzaSeccion(h, P, cx, cy, e, cotas=True):
    """corte A-A del mango por el grip: acero + capa dura + capa blanda (bimaterial)"""
    a = P["ais"]; hc = P["hcAA"]
    wg, wb, ws = 2 * (hc + a["grip"][2]), 2 * (hc + a["base"]), 2 * hc
    rrect(h, cx, cy, wg * e, a["tGrip"] * e, 4.2 * e, "url(#TPE)", 1.3)
    rrect(h, cx, cy, wb * e, a["tBase"] * e, 2.4 * e, "url(#PLAS)", 1.1)
    rrect(h, cx, cy, ws * e, P["tAcero"] * e, .4 * e, "url(#MET)", 1.1)
    if cotas:
        h.dimH(cy - a["tGrip"] / 2 * e - 12, cx - wg / 2 * e, cx + wg / 2 * e, f"{n(wg)} (*)", ext=cy - a["tGrip"] / 2 * e + 4 * e, c=OR)
        h.dimV(cx + wg / 2 * e + 14, cy - a["tGrip"] / 2 * e, cy + a["tGrip"] / 2 * e, n(a["tGrip"]), ext=cx + wg / 2 * e - 4 * e)
        h.dimV(cx - wg / 2 * e - 12, cy - P["tAcero"] / 2 * e, cy + P["tAcero"] / 2 * e, f'{n(P["tAcero"])} (*)', ext=cx - ws / 2 * e, c=OR)
    return wg


def usoBloque(h, x, y, lineas, w=360, titulo="PARA QUE SE USA EN LA OBRA"):
    return bloque(h, x, y, titulo, lineas, w=w, sz=10, lh=13.5)


def flecha(h, x1, y1, x2, y2, c=K):
    h.ln(x1, y1, x2, y2, c, .8); a = math.atan2(y2 - y1, x2 - x1)
    h.path(f"M{x2:.1f},{y2:.1f} L{x2 - 7 * math.cos(a - .35):.1f},{y2 - 7 * math.sin(a - .35):.1f} L{x2 - 7 * math.cos(a + .35):.1f},{y2 - 7 * math.sin(a + .35):.1f} Z", c, c, .3)


def guardarH(h, nombre):
    h.guardar(os.path.join(AQUI, nombre + ".svg")); print("ok", nombre)
