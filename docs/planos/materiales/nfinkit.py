"""nfinkit · grupo «nfin» (códigos que faltaban en las hojas). Lee r3d/perfiles_nfin.json (sale de r3d/piezas/perfiles_nfin.mjs con
`node exportar_nfin.mjs`): plano y 3D con los mismos números. No modifica otros kits."""
import json, os
from fichakit import R3D
PF = json.load(open(os.path.join(R3D, "perfiles_nfin.json")))
def cm(v, d=1):
    """número con coma decimal (es-AR)"""
    s = f"{v:.{d}f}".rstrip("0").rstrip(".") if isinstance(v, float) else str(v)
    return s.replace(".", ",")
