"""ilukit · ayudas comunes de las hojas de MATERIALES de columnas, vínculos, apoyos, luminarias, fotocontrol y tableros.
Usa matkit (Ficha + motor M3) sin tocarlo."""
import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT, esc, CAT, MATS
AQUI = os.path.dirname(os.path.abspath(__file__))
PRFV = "#575c5a"      # RAL 7043 gris tráfico B (oscuro, satinado)
MATS.setdefault("prfv", (PRFV, .35, 16)); MATS.setdefault("prfvGab", ("#c9ccc6", .3, 14))   # gabinete RAL 7035 (gris claro)
MATS.setdefault("hormigon", ("#b9bdc2", .05, 6)); MATS.setdefault("policarb", ("#dfe3e6", .5, 30))

def nueva(): return Ficha()
def guardar(h, nombre): h.guardar(os.path.join(AQUI, nombre + ".svg")); print("ok", nombre)
def coloresOR(i, j, t): return OR if ("(*)" in str(t) or "A CONFIRMAR" in str(t).upper() or "A VINCULAR" in str(t)) else K

def corteMarca(h, x1, y1, x2, y2, letra, lado=1):
    """línea de corte con las letras en las puntas (trazo grueso en los extremos)"""
    h.ln(x1, y1, x2, y2, K, .6, 'stroke-dasharray="14 3 2 3"')
    for (x, y) in ((x1, y1), (x2, y2)):
        h.circ(x, y, 1.6, K, K, 0); h.txt(x + (8 if x == x2 and x2 > x1 else -8 if x2 > x1 else 0), y + (4 if y1 == y2 else (-6 if y == y1 else 14)), letra, 12, 700, K, "middle")

def flecha(h, x1, y1, x2, y2, c=K, w=.7):
    h.ln(x1, y1, x2, y2, c, w); a = math.atan2(y2 - y1, x2 - x1)
    p = [(x2, y2), (x2 - 8 * math.cos(a - .35), y2 - 8 * math.sin(a - .35)), (x2 - 8 * math.cos(a + .35), y2 - 8 * math.sin(a + .35))]
    h.a('<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in p) + f'" fill="{c}"/>')

def rot2(x, y, a):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a)); return x * c - y * s, x * s + y * c

def ringZ(m, rin, rout, z0, z1, mat, a0=90, a1=360, bias=0, edge=None, n=40):
    m.ring([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], rin, rout, z0, z1, a0, a1, mat, n=n, bias=bias, edge=edge)

def ventanaZ(m, r, ang, zc, w, hgt, mat="#1e2124", bias=5, dz=0):
    """rectángulo pegado sobre un cilindro vertical de radio r, en el ángulo ang (grados)"""
    a = math.radians(ang); nx, ny = math.cos(a), math.sin(a); tx, ty = -ny, nx; rr = r + 1.5
    c = [rr * nx, rr * ny]
    pts = [[c[0] + tx * u, c[1] + ty * u, zc + v] for u, v in ((-w / 2, -hgt / 2), (w / 2, -hgt / 2), (w / 2, hgt / 2), (-w / 2, hgt / 2))]
    m.face(pts, mat, bias, "#111"); return (nx, ny, tx, ty, c)

def textoBloque(h, x, y, titulo, lineas, sz=10.5, dy=16, c=K):
    h.txt(x, y, titulo, 13, 700); h.ln(x, y + 4, x + len(titulo) * 7.2, y + 4, K, 1)
    for i, l in enumerate(lineas):
        cc = OR if "(*)" in l else c
        if l.startswith("·"): h.txt(x + 2, y + 22 + i * dy, "•", sz, 700, cc); h.txt(x + 14, y + 22 + i * dy, esc(l[1:].strip()), sz, 400, cc)
        else: h.txt(x + 14, y + 22 + i * dy, esc(l), sz, 400, cc)
    return y + 22 + len(lineas) * dy
