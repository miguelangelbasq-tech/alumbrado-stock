"""nelekit · hojas del grupo «nelec» (productos nuevos del pañol). Plano con la geometría de r3d/perfiles_nelec.json
(sale de r3d/piezas/perfiles_nelec.mjs, la misma del 3D). Usa protabkit / cableskit / fichakit sin modificarlos."""
import csv, json, os, math
from protabkit import *            # noqa: F401,F403 (fichakit, matbfc, planokit, DEFS3, frenteMod, modPerfil…)
import cableskit as CK
from planokit import K, G, OR, NV, CAD, MONO, INT

PN = json.load(open(os.path.join(R3D, "perfiles_nelec.json")))
ROJO = "#c8302c"
_N = {}
with open(os.path.join(AQUI, "..", "..", "respaldo", "nuevos.csv"), encoding="utf-8") as f:
    for r in csv.DictReader(f): _N[r["codigo"]] = r
for k, v in CK.RAY.items():
    if k not in dict(RAYADOS): RAYADOS.append((k, v))


def catN(c, n=999):
    """fila del respaldo (nuevos.csv): descripción y unidad TAL CUAL vienen; † de baja"""
    r = _N[str(c)]; d = esc(r["desc"]).upper()
    if len(d) > n: d = d[:n - 1].rstrip() + "…"
    return [str(c), d, r["un"], r["activo"] != "True"]


def colorN(i, j, t):
    s = str(t)
    if "DE BAJA" in s or "REUTILIZADO" in s or s.startswith("†"): return ROJO
    return OR if ("(*)" in s or "A CONFIRMAR" in s or "SIN CODIGO" in s) else K


def hojaN():
    h = nueva3(); h.a(CK.DEFSC); return h


def tablaN(h, x, y, cols, filas, titulo, rowh=14.5):
    return h.tabla(x, y, cols, filas, rowh=rowh, titulo=titulo, colores=colorN)


def guardar(h, nombre):
    h.guardar(os.path.join(AQUI, nombre + ".svg"))
