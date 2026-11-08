"""nobrakit · ayudas del grupo «nobra» (productos nuevos del pañol: precintos, herrajes, caño HDX, fundación, señalización, luminarias)
sobre civilkit / fichakit. Lee r3d/perfiles_nobra.json (sale de r3d/piezas/perfiles_nobra.mjs con `node exportar_nobra.mjs`) y
../../respaldo/nuevos.csv (altas del equipo: descripción y unidad TAL CUAL, los activo=False van «DE BAJA»). No modifica otros kits."""
import json, os, csv
from civilkit import *          # noqa: F401,F403
from civilkit import AQUI, R3D, CAT, esc, RAYC

try: PN = json.load(open(os.path.join(R3D, "perfiles_nobra.json")))
except FileNotFoundError: PN = {}
NUE = {}
with open(os.path.normpath(os.path.join(AQUI, "..", "..", "respaldo", "nuevos.csv")), newline="", encoding="utf-8") as f:
    for r in csv.DictReader(f): NUE[int(r["codigo"])] = (r["desc"], r["un"], r["activo"].strip().lower() == "true")
ROJO = "#c62828"
RAYC.update({"PLAS2": "PVC / POLIAMIDA (PIEZA)"})


def catN(c, n=999):
    """[cod, DESCRIPCIÓN, un] del catálogo de la app o, si es alta del equipo, de nuevos.csv (tal cual). † DE BAJA si activo=False."""
    if c in NUE:
        d, u, act = NUE[c]; d = esc(d).upper()
        suf = "" if act else " † DE BAJA"
        if len(d) + len(suf) > n: d = d[:n - 1 - len(suf)].rstrip() + "…"
        return [str(c), d + suf, u]
    return catC(c, n)


def colorN(i, j, t):
    s = str(t)
    if "DE BAJA" in s or "REUTILIZADO" in s: return ROJO
    return OR if ("(*)" in s or "A CONFIRMAR" in s or "A VINCULAR" in s) else K


def tablaN(h, x, y, cods, extra=None, w=800, rowh=15, titulo="CODIGOS DEL PAÑOL", tit_extra="MEDIDA", wext=150, n=None):
    """código · descripción (catálogo o alta del equipo, tal cual) · [extra] · un. (*) naranja, DE BAJA rojo; alta del equipo con ▪"""
    wu = 66; wd = w - 46 - wu - (wext if extra else 0)
    cols = [(46, "c", True), (wd, "l", False)] + ([(wext, "c", False)] if extra else []) + [(wu, "c", False)]
    fil = [["COD.", "DESCRIPCION (CATALOGO DEL PAÑOL · ▪ ALTA DEL EQUIPO)"] + ([tit_extra] if extra else []) + ["UN."]]
    nn = n or int(wd / 6.1)
    for c in cods:
        r = catN(c, nn - 2)
        d = ("▪ " + r[1]) if c in NUE else r[1]
        fil.append([r[0], d] + ([extra.get(c, "—")] if extra else []) + [r[2]])
    return h.tabla(x, y, cols, fil, rowh=rowh, titulo=titulo, colores=colorN)


def rotN(h, codigo, t1, t2, sub, esc1, esc2, rev="B"):
    rotuloMat(h, codigo, t1, t2, sub, esc1, esc2, rev=rev, fecha=FECHA)
