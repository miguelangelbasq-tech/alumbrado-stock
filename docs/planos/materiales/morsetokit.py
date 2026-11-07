"""dibujo común de los morsetos dentados (IPC) para las hojas MAT-MORSETO-n"""
import math
from matkit import K, G, OR
def plano_frente(h, C, V, pf=False, rp=12, rd=7, txt=True):
    """vista frontal cortada por los canales (esquema de la app, función R): C,V esquina; rp/rd radios de los conductores"""
    h.path(f"M{C},{V+40} v-28 a12,12 0 0 1 12,-12 h156 a12,12 0 0 1 12,12 v28 z", "url(#PLAS)", K, 1.5)
    h.path(f"M{C},{V+64} h180 v80 a12,12 0 0 1 -12,12 h-156 a12,12 0 0 1 -12,-12 z", "url(#PLAS)", K, 1.5)
    h.circ(C + 90, V + 52, 20, "#fff", K, 1); h.circ(C + 90, V + 52, rp, "url(#cuH)", K, 1)
    h.circ(C + 90, V + 112, 13, "#fff", K, 1); h.circ(C + 90, V + 112, rd, "url(#cuH)", K, 1)
    for l in (-1, 1):
        for n in range(-2, 3):
            h.path(f"M{C+90+n*7-3},{V+52+l*20} l3,{-l*7} l3,{l*7} z", "#fff", K, .7)
    h.rect(C + 154, V - 30, 10, 196, "url(#STEEL)", K, .9); h.ln(C + 159, V - 44, C + 159, V + 176, K, .5, h.EJE)
    h.rect(C + 146, V - 12, 26, 12, "#fff", K, 1); h.rect(C + 148, V - 28, 22, 12, "#fff", K, 1)
    h.ln(C + 70, V + 52, C + 110, V + 52, K, .4, h.EJE); h.ln(C + 90, V + 32, C + 90, V + 132, K, .4, h.EJE)
    if pf:
        h.rect(C + 182, V + 92, 52, 40, "url(#PLAS)", K, 1.3); h.circ(C + 208, V + 112, 12, "#fff", K, 1)
        h.txt(C + 208, V + 150, "PF", 10.5, 700, K, "middle")
def morseto3d(m, x=0, y=0, z=0, pf=False, s=1.0, linea=True, deriv=True, col_der="negro", rder=5.5):
    """morseto en 3D: conductores a lo largo de y; bulón vertical. Medidas del cuerpo a confirmar (*)"""
    # orden de dibujo a mano (de atrás hacia adelante): -y queda atrás, +y adelante
    if linea: m.cyl([x - 2, y - 110, z], [x - 2, y - 18, z], 9, "negro", n=20, seg=4, capmat="alu"); m.render()
    if deriv: m.cyl([x - 2, y - 30, z - 20], [x - 2, y - 18, z - 20], 6.5, "rojo", n=16, capmat="rojo"); m.render()   # capuchón
    m.box(x - 25, x + 25, y - 18, y + 18, z - 34, z - 6, "nylon", edge="#8a8f96"); m.render()
    if linea: m.cyl([x - 2, y - 18, z], [x - 2, y + 18, z], 9, "negro", n=20, seg=1, caps=False); m.render()
    m.box(x - 25, x + 25, y - 18, y + 18, z + 6, z + 30, "nylon", edge="#8a8f96"); m.render()
    m.cyl([x + 30, y, z - 40], [x + 30, y, z + 46], 4, "galv", n=12); m.render()
    m.box(x + 22, x + 38, y - 10, y + 10, z - 34, z + 30, "nylon", edge="#8a8f96"); m.render()
    m.cyl([x + 30, y, z + 30], [x + 30, y, z + 38], 7.5, "galv", n=6, edge="#444"); m.render()
    m.cyl([x + 30, y, z + 38], [x + 30, y, z + 48], 6.2, "galv", n=6, edge="#444"); m.render()
    if pf:
        m.box(x - 25, x - 3, y + 18, y + 48, z - 46, z - 6, "nylon", edge="#8a8f96"); m.render()
        m.cyl([x - 14, y + 33, z - 6], [x - 14, y + 33, z + 6], 8, "galv", n=16); m.render()
    if deriv:
        y0 = y + 48 if pf else y + 18
        m.cyl([x - 2, y0, z - 20], [x - 2, y + 120, z - 20], rder, col_der, n=16, seg=4, capmat="cobre"); m.render()
    if linea: m.cyl([x - 2, y + 18, z], [x - 2, y + 110, z], 9, "negro", n=20, seg=4, capmat="alu"); m.render()
