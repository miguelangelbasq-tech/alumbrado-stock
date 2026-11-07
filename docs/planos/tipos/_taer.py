"""Piezas comunes de las hojas AP-T-012 / 014 / 015 / 018 / 019 (tablero aéreo en apoyo PRFV).
Datos (no inventar): ficha AP-T-018 (hl 8 m, total 9,5 m, empotr. ≈1,5 m, Ro 1050 daN, Ø NO publicado),
FICHAS_TEC gabinete 530×430×200 (3020), CABLES_ACOMETIDA, MORSETOS, PRENSACABLES, ABRAZADERA_SOPORTE_RANGOS.
Lo que no está (Ø del poste, medidas del rack/aislador/morseto/babero) se dibuja «razonable» y se acota en naranja (*)."""
import math
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT, CORES
GAB_T, GAB_S, GAB_E = "#e4e5e0", "#c9cbc4", "#b3b5ae"      # gabinete PRFV RAL 7035 (gris claro)
PORC = "#7b3a1e"; PORC2 = "#a5532c"                           # porcelana marrón (ET 51)
AL = "#c3c8cc"                                                # aluminio
# Ø del poste para DIBUJAR (no publicado): punta 130 (*) y conicidad 15 mm/m (*) -> solo para el dibujo
D_PUNTA, CONIC, HL, EMP = 130.0, 15.0, 8000.0, 1500.0
def d_poste(z):            # z en mm desde el nivel de piso (+ arriba); diámetro de dibujo
    return D_PUNTA + CONIC * (HL - z) / 1000.0
def corte_quiebre(h, x0, x1, y, amp=5):
    """línea de interrupción horizontal (zigzag)"""
    m = (x0 + x1) / 2
    h.path(f"M{x0},{y} H{m-8} l4,-{amp} l8,{2*amp} l4,-{amp} H{x1}", "none", K, .7)
def cable2d(h, d, w=2.2, col=K, fondo="#fff"):
    """cable en vista (trazo doble)"""
    h.path(d, "none", col, w + 1.6, 'stroke-linejoin="round" stroke-linecap="round"'); h.path(d, "none", fondo, w * .45, 'stroke-linejoin="round" stroke-linecap="round"')
def mn17(h, x, y, s=1.0, color=False, eje="v"):
    """aislador de porcelana tipo roldana MN 17 en vista lateral (carretel): eje vertical. medidas (*)"""
    f = PORC if color else "#fff"; f2 = PORC2 if color else "#fff"
    W, H = 38 * s, 36 * s
    h.path(f"M{x-W/2},{y-H/2} h{W} v{4*s} q-{7*s},{3*s} -{7*s},{9*s} v{10*s} q0,{6*s} {7*s},{9*s} v{4*s} h-{W} v-{4*s} q{7*s},-{3*s} {7*s},-{9*s} v-{10*s} q0,-{6*s} -{7*s},-{9*s} z", f, K, .9)
    if color: h.path(f"M{x-W/2+3*s},{y-H/2+1.5*s} h{W-6*s}", "none", "#e0915e", 1.2)
    h.ln(x, y - H / 2 - 6 * s, x, y + H / 2 + 6 * s, K, .4, h.EJE)
def rack2d(h, x, y, s=1.0, ancho=60, color=False):
    """rack MN 4B2L (bastidor de una vía) visto de costado: chapa en U contra el poste + bulón del aislador. (*)"""
    c = "url(#galv)" if color else "#fff"
    h.path(f"M{x},{y-ancho/2*s} h{40*s} v{ancho*s} h-{40*s} v-{4*s} h{36*s} v-{(ancho-8)*s} h-{36*s} z", c, K, .8)
def morseto2d(h, x, y, s=1.0, color=False):
    """morseto dentado de perforación (PKD-14) en vista: cuerpo, bulón con cabeza fusible. medidas (*)"""
    f = "#2b2b2b" if color else "#fff"
    h.rect(x - 9 * s, y - 13 * s, 18 * s, 26 * s, f, K, .8, f'rx="{3*s}"')
    h.ln(x - 9 * s, y, x + 9 * s, y, "#888" if color else K, .6)
    h.rect(x - 3 * s, y - 21 * s, 6 * s, 8 * s, "url(#galv)" if color else "#fff", K, .6)
    h.rect(x - 4.5 * s, y - 27 * s, 9 * s, 6 * s, "url(#galv)" if color else "#fff", K, .6)
def capuchon2d(h, x, y, s=1.0, color=False, rot=0):
    f = "#222" if color else "#fff"
    h.a(f'<g transform="rotate({rot} {x:.1f} {y:.1f})"><path d="M{x},{y-4*s} h{10*s} q{5*s},0 {5*s},{4*s} q0,{4*s} -{5*s},{4*s} h-{10*s} z" fill="{f}" stroke="#111" stroke-width=".7"/></g>')
def gabinete_frente(h, x, y, w, ht, color=False, cartel=True):
    """gabinete PRFV 430 × 530 de frente: puerta, bisagras, 2 cierres de ¼ de vuelta, señal de riesgo"""
    h.rect(x, y, w, ht, GAB_T if color else "#fff", K, 1.2, 'rx="2"')
    h.rect(x + w * .05, y + ht * .04, w * .9, ht * .92, "none", K, .5, 'rx="1.5"')
    for f in (.2, .8): h.rect(x - 2, y + ht * f - 5, 3, 10, "#999" if color else "#fff", K, .5)
    for f in (.3, .7): h.circ(x + w * .9, y + ht * f, max(2, w * .03), "#777" if color else "#fff", K, .6)
    if cartel:
        cx, cy, a = x + w / 2, y + ht * .38, w * .18
        h.path(f"M{cx},{cy-a} L{cx+a},{cy+a*.75} H{cx-a} Z", "#f2c500" if color else "#fff", K, .8)
        h.path(f"M{cx+a*.12},{cy-a*.45} L{cx-a*.18},{cy+a*.15} H{cx+a*.12} L{cx-a*.12},{cy+a*.6}", "none", K, 1.1)
# ---------------- 3D
def pole3d(h, xc, yc, z0, z1, fill="url(#prfv)", st="#262a29", dz=lambda z: d_poste(z)):
    h.tuboZ(z0, z1, xc, yc, dz(z0) / 2, dz(z1) / 2, fill, st)
def anillo3d(h, xc, yc, z, r, w=3.0, col="url(#galv)", st="#4a5560"):
    """banda (abrazadera / fleje) alrededor de un cilindro vertical: medio anillo de adelante"""
    p = h.P(xc, yc, z); rx = r * h._s * 1.04; ry = rx * .5
    d = f"M{p[0]-rx:.1f},{p[1]:.1f} A{rx:.1f},{ry:.1f} 0 0 0 {p[0]+rx:.1f},{p[1]:.1f}"
    h.path(d, "none", st, w + 1.4); h.path(d, "none", "#cfd8df" if col == "url(#galv)" else col, w)
def gab3d(h, x0, x1, y0, y1, z0, z1, puerta="+y"):
    h.BOX(x0, x1, y0, y1, z0, z1, GAB_T, GAB_S, GAB_E, "#6f7269", .8)
    # puerta en la cara +y (con borde y cierres)
    m = 25
    h.F3([(x0 + m, y1 + 1, z0 + m), (x1 - m, y1 + 1, z0 + m), (x1 - m, y1 + 1, z1 - m), (x0 + m, y1 + 1, z1 - m)], "none", "#8c8f86", .7)
    for f in (.3, .7):
        p = h.P(x1 - m - 25, y1 + 1, z0 + (z1 - z0) * f); h.circ(p[0], p[1], 2.2, "#666", "#333", .4)
def cable3d(h, pts, w=3.2, col="#151515", hi="#555"):
    q = [h.P(*p) for p in pts]; d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in q)
    h.path(d, "none", "#000", w + 1.2, 'stroke-linejoin="round" stroke-linecap="round"'); h.path(d, "none", col, w, 'stroke-linejoin="round" stroke-linecap="round"')
    h.path(d, "none", hi, max(.6, w * .25), 'stroke-linejoin="round" stroke-linecap="round" opacity=".7" transform="translate(-.6,-.8)"')
def catenaria(p0, p1, flecha, n=16):
    out = []
    for i in range(n + 1):
        t = i / n; out.append((p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, p0[2] + (p1[2] - p0[2]) * t - flecha * 4 * t * (1 - t)))
    return out
def mn17_3d(h, x, y, z, r=19, hgt=36):
    """aislador roldana con eje vertical, en 3D (porcelana marrón)"""
    h.tuboZ(z - hgt / 2, z - hgt / 2 + 6, x, y, r, r, PORC, "#3a1a0c")
    h.tuboZ(z - hgt / 2 + 6, z + hgt / 2 - 6, x, y, r * .62, r * .62, PORC2, "#3a1a0c")
    h.tuboZ(z + hgt / 2 - 6, z + hgt / 2, x, y, r, r, PORC, "#3a1a0c")
def leyenda_cable(h, x, y, items):
    for i, (c, t) in enumerate(items):
        h.rect(x, y + i * 14, 10, 9, c, K, .4); h.txt(x + 15, y + i * 14 + 8.5, t, 9, 700)
def seccion(h, cx, cy, tipo, r=24, titulo=None):
    """sección a color de los 4 cables admitidos (AP-T-019 ref. 12)"""
    if tipo == "pre":       # 3 fases XLPE negras alrededor del neutro portante de 50 (más grande)
        h.circ(cx, cy, r * .40, "#111", K, .6); h.circ(cx, cy, r * .30, AL, "#555", .4)
        for j in range(7): h.circ(cx + r * .2 * math.cos(j), cy + r * .2 * math.sin(j), r * .05, "#e9edf0", "#777", .2)
        for i in range(3):
            a = math.radians(90 + 120 * i); x, y = cx + r * .62 * math.cos(a), cy - r * .62 * math.sin(a)
            h.circ(x, y, r * .30, "#151515", K, .6); h.circ(x, y, r * .21, AL, "#555", .4)
            for j in range(6): h.circ(x + r * .12 * math.cos(j + 1), y + r * .12 * math.sin(j + 1), r * .04, "#e9edf0", "#777", .2)
            for k_ in range(3): h.ln(x - r * .2 + k_ * r * .2, y - r * .27, x - r * .2 + k_ * r * .2, y - r * .22, "#ddd", .6)  # nervaduras de identificación
    elif tipo == "piloto":  # 4 unipolares Al 25 sueltos
        for i in range(4):
            a = math.radians(45 + 90 * i); x, y = cx + r * .5 * math.cos(a), cy - r * .5 * math.sin(a)
            h.circ(x, y, r * .34, "#151515", K, .6); h.circ(x, y, r * .23, AL, "#555", .4)
            for j in range(6): h.circ(x + r * .13 * math.cos(j), y + r * .13 * math.sin(j), r * .045, "#e9edf0", "#777", .2)
    elif tipo == "auto":    # Cu 4x16 autoportante: 4 conductores XLPE reunidos, sin cubierta (*)
        for i in range(4):
            a = math.radians(45 + 90 * i); x, y = cx + r * .44 * math.cos(a), cy - r * .44 * math.sin(a)
            h.circ(x, y, r * .40, "#151515", K, .6); h.circ(x, y, r * .25, "#d08a3f", "#7a4512", .4)
            for j in range(6): h.circ(x + r * .14 * math.cos(j), y + r * .14 * math.sin(j), r * .05, "#e7a35a", "#7a4512", .2)
            h.txt(x, y + 2.5, str(i + 1), 6.5, 700, "#fff", "middle")
    else:                   # Cu 4x16 XLPE/LSZH con cubierta: colores AEA
        h.cable(cx, cy, r, color=True, hilos=True)
    if titulo:
        for i, t in enumerate(titulo): h.txt(cx, cy + r + 16 + i * 12, t, 9 if i else 9.5, 700 if i == 0 else 400, K if i == 0 else G, "middle")
