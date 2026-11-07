"""Piezas 3D de la caja de columna PRFV (copiadas de guia_caja_columna_prfv.py)."""
from k4kit import *
GRIS, CEL, VER = "#9aa0a6", "#4fa3d9", "#2f9e44"
BW, BH, BD = 8.2, 50, 41          # borne BPN 6: paso 8,2 · alto 50 · fondo (*)
RZ0 = 47.5                        # riel NS35 de z 47,5 a 82,5 (centrado en la placa de 130)
FAS = {"R": L1, "S": L2, "T": L3, "N": NC}
# ---------- piezas 3D (x ancho de la placa, y hacia el que mira, z arriba)
def placa(h, z0=0):
    h.BOX(0, 80, -3, 0, z0, z0 + 130, "#eef0f3", "#dfe3e8", "#c9ced6", "#555", .7)
    for (xx, zz) in ((10, 112), (70, 112), (10, 18), (70, 18)):
        x, y = h.P(xx, 0, z0 + zz); h.circ(x, y, 1.6, "#fff", "#555", .5)
    h.BOX(1, 79, 0, 7.5, z0 + RZ0, z0 + RZ0 + 35, "url(#galv)", "#c3ccd4", "#8d98a2", "#444", .6)
def borne(h, x0, col, z0=0, letra=None):
    zb = z0 + 40
    h.BOX(x0, x0 + BW, 7.5, BD, zb, zb + BH, col, col, col, "#222", .6)
    h.BOX(x0 + 1.2, x0 + BW - 1.2, BD - .1, BD + .2, zb + 6, zb + BH - 6, "#00000022", "#0000002a", "#00000033", "none", 0)
    for zz in (zb + 41, zb + 9):
        x, y = h.P(x0 + BW / 2, BD, zz); h.circ(x, y, max(1.4, 2.6 * h._s / 1.35), "#d9dde2", "#222", .5)
        h.ln(x - 1.6 * h._s / 1.35, y - 1.6 * h._s / 1.35, x + 1.6 * h._s / 1.35, y + 1.6 * h._s / 1.35, "#222", .6)
    x, y = h.P(x0 + BW / 2, 24, zb + BH); h.a(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{1.8*h._s/1.35:.1f}" ry="{1.1*h._s/1.35:.1f}" fill="#111"/>')
    if letra:
        x, y = h.P(x0 + BW / 2, BD, zb + 33)
        h.txt(x, y + 3, letra, max(6, 7 * h._s / 1.35), 800, "#fff" if col != CEL else "#06324d", "middle", INT)
def separador(h, x0, z0=0):
    h.BOX(x0, x0 + 2, 7.5, BD + 4, z0 + 36, z0 + 94, "#3a3f45", "#2a2e33", "#4a5057", "#111", .5)
def peine(h, x0, n, z0=0):
    h.BOX(x0 + 1, x0 + n * BW - 1, BD + .2, BD + 2.2, z0 + 62, z0 + 68, "#e0a85a", "#c98b3a", "#a86d26", "#5a3a10", .5)
def portaf(h, x0, z0=0, letra=None):
    h.BOX(x0, x0 + 17.5, 7.5, 61, z0 + 25, z0 + 104.5, "#d7d9dc", "#c8cbcf", "#b5b9be", "#333", .6)
    h.BOX(x0 + 2, x0 + 15.5, 61, 62, z0 + 32, z0 + 97, "#e9ebed", "#e1e3e6", "#ccd0d4", "#555", .5)
    x, y = h.P(x0 + 8.75, 62, z0 + 64)
    if letra: h.txt(x, y + 3, letra, max(6, 7 * h._s / 1.35), 800, "#333", "middle", INT)
def abajo(h, z0=0, jab=False):
    placa(h, z0)
    x = 20 if not jab else 14
    if jab: borne(h, x, VER, z0, "PE"); x += BW
    borne(h, x, CEL, z0, "N"); xn = x; x += BW
    if jab: peine(h, xn - BW, 2, z0)
    separador(h, x, z0); x += 2
    pos = {"N": xn}
    for L in "RST": borne(h, x, GRIS, z0, L); pos[L] = x; x += BW
    return pos
def arriba(h, z0=0):
    placa(h, z0)
    x = 8; pos = {}
    for i, (col, L) in enumerate(((VER, "PE"), (VER, "PE"), (CEL, "N"))):
        borne(h, x, col, z0, L); pos[L + str(i)] = x; x += BW
    peine(h, 8, 3, z0)
    portaf(h, 38, z0, "S"); portaf(h, 58, z0, "T"); pos["S"] = 38; pos["T"] = 58
    return pos
def ent_abajo(x0, z0, w=BW): return (x0 + w / 2, 24, z0 + 40)          # entrada de cable por abajo del borne
def ent_arriba(x0, z0, w=BW): return (x0 + w / 2, 24, z0 + 90)
def tif(h, p, arriba=True, col="#f08a24"):
    """puntera TIF entrando al borne: caña de Cu + collar de color"""
    x, y, z = p; d = 1 if arriba else -1
    punta_cu(h, (x, y, z), (x, y, z + d * 6), max(1.5, 2.2 * h._s / 1.35))
    linea3(h, [(x, y, z + d * 6), (x, y, z + d * 11)], col, max(2.2, 3.4 * h._s / 1.35), 'stroke-linecap="butt"')
