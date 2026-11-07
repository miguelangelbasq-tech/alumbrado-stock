"""caja_ext · caja estanca EXTERNA de aluminio 200×150×100 IP65 (6003) para columna existente (AP-PL-002 b / AP-PL-003).
Datos: fichas AP-PL-002/003, calculadora v130 (2 juegos de abrazaderas por caja, riel 14 cm + 2 tornillos cabeza tanque 6×3/8, ojal de goma
en el agujero pasante Ø50, prensacable metálico ZA3 3/4" BSC o ZA11 1/2" BSP, cable Ø6 a 12 mm, IP68, corona dentada), FICHAS_TEC
(semiabrazadera 4003, planchuela 4,76 × 31,7; caja Conextube; fondo para columna 70 × 165, 6009)."""
import math, sys
sys.path.insert(0, ".")
from planokit import K, G, OR, NV, CAD, MONO, INT
import tabmet as T

CW, CH, CD, CE = 200, 150, 100, 5     # caja: ancho, alto, profundidad, pared (*)
OJ = 50                               # agujero pasante
PLW, PLH = 165, 70                    # fondo para columna 70 × 165 (6009) (*) acostado
AB_E, AB_A = 4.76, 31.7               # planchuela de la semiabrazadera
ALU = "#c9ccce"


def prensa2d(h, x, y, k, tipo="ZA3", up=False):
    """prensacable de costado, rosca arriba (entra en la caja por abajo). x,y = cara de la caja"""
    s = -1 if up else 1
    rosca = 19.05 if tipo == "ZA3" else 21.3   # Ø nominal del caño 3/4" BSC / 1/2" BSP (*)
    L1, L2, L3 = 12, 10, 22                    # (*) largo de rosca, tuerca, cuerpo
    h.rect(x - rosca / 2 * k, y - (L1 * k if up else 0), rosca * k, L1 * k, "url(#ANSI37)", K, .7)
    hx = 30 * k; h.rect(x - hx / 2, y + s * L1 * k - (L2 * k if up else 0), hx, L2 * k, "#fff", K, .9)
    y2 = y + s * (L1 + L2) * k
    h.path(f"M{x-12*k:.1f},{y2:.1f} L{x-9*k:.1f},{y2+s*L3*k:.1f} L{x+9*k:.1f},{y2+s*L3*k:.1f} L{x+12*k:.1f},{y2:.1f} Z", "#fff", K, .9)
    for i in range(1, 4): h.ln(x - (12 - i) * k, y2 + s * i * 5 * k, x + (12 - i) * k, y2 + s * i * 5 * k, K, .35)
    return y2 + s * L3 * k


def ojal2d(h, x, y, k, vertical=True):
    """ojal de goma en corte, en un agujero Ø50 de chapa (x = cara de la chapa, y = centro)"""
    r = OJ / 2 * k
    for sy in (-1, 1):
        yy = y + sy * r
        h.path(f"M{x-4*k:.1f},{yy-sy*0:.1f} h{8*k:.1f} v{-sy*5*k:.1f} h{-8*k:.1f} z", "#222", K, .5)


def col3d(h, R, z0, z1, ri=None, col="#7d8488", cut=None):
    T.cyl(h, 0, 0, R, -80, 170, z0, z1, col)
    T.ring(h, 0, 0, R, ri or R - 4, z1, -80, 170, "#c8cdd1")


def abraz3d(h, R, z, xb):
    """semiabrazadera de planchuela alrededor de la columna, con orejas hasta la caja (xb)"""
    T.cyl(h, 0, 0, R + AB_E, -80, 170, z - AB_A / 2, z + AB_A / 2, "#aab6c0")
    for sy in (-1, 1):
        y = sy * (R * .55)
        h.BOX(R * .8, xb, y - 2.5, y + 2.5, z - AB_A / 2, z + AB_A / 2, "#dfe6ec", "#9aa6b0", "#c3ccd4", "#555", .5)


def caja3d(h, xb, yc, zc, abierta=True, tab=True, ojal=True):
    """caja de aluminio, la cara de atrás en x = xb, abierta del lado +x (tapa sacada)"""
    x0, x1 = xb, xb + CD; y0, y1 = yc - CW / 2, yc + CW / 2; z0, z1 = zc - CH / 2, zc + CH / 2
    st = "#5d6266"
    # fondo (cara de atrás, por dentro) y paredes de adentro
    h.F3([(x0 + CE, y0, z0), (x0 + CE, y1, z0), (x0 + CE, y1, z1), (x0 + CE, y0, z1)], "#b7bbbe", st, .6)
    h.F3([(x0, y0 + CE, z0 + CE), (x1, y0 + CE, z0 + CE), (x1, y1 - CE, z0 + CE), (x0, y1 - CE, z0 + CE)], "#a9adb0", st, .5)   # piso
    h.F3([(x0, y0 + CE, z0), (x1, y0 + CE, z0), (x1, y0 + CE, z1), (x0, y0 + CE, z1)], "#9a9ea2", st, .5)                      # pared -y (adentro)
    h.BOX(x0, x1, y0, y0 + CE, z0, z1, "#e1e3e4", "#a6aaad", "#d3d6d8", st, .6)     # pared -y
    h.BOX(x0, x1, y0, y1, z0, z0 + CE, "#e1e3e4", "#bfc3c6", "#d3d6d8", st, .6)     # piso
    if ojal:
        c = h.P(x0 + CE, yc, zc + 10); rx = OJ / 2 * h._s * .87
        h.a(f'<ellipse cx="{c[0]:.1f}" cy="{c[1]:.1f}" rx="{rx*.5:.1f}" ry="{rx:.1f}" fill="#1b1b1b" stroke="#000" stroke-width="2.5" transform="rotate(-30 {c[0]:.1f} {c[1]:.1f})"/>')
    return (x0, x1, y0, y1, z0, z1)


def caja3d_frente(h, b, corte=30):
    """paredes de adelante cortadas en escalón (techo y pared +y solo hasta x0 + corte) para ver adentro"""
    x0, x1, y0, y1, z0, z1 = b; st = "#5d6266"; xc = x0 + corte
    h.BOX(x0, xc, y1 - CE, y1, z0, z1, "#e3e5e6", "#c1c5c8", "#b9bdc0", st, .6)     # pared +y (cortada)
    h.BOX(x0, min(xc + 25, x1), y0, y1, z1 - CE, z1, "#e9ebec", "#c9ccce", "#b9bdc0", st, .6)  # techo (cortado)
    h.BOX(xc, x1, y1 - CE, y1, z0, z0 + CE, "#e3e5e6", "#c1c5c8", "#d7dadc", st, .5)  # canto del piso


def tab_h3d(h, xb, yc, zc, L):
    """tablerito acostado (riel horizontal, a lo largo de y) sobre el fondo de la caja"""
    h.BOX(xb, xb + 2, yc - PLW / 2, yc + PLW / 2, zc - PLH / 2, zc + PLH / 2, "#cfd5da", "#b4bcc4", "url(#galv)", "#555", .6)
    h.BOX(xb + 2, xb + 9.5, yc - 70, yc + 70, zc - 17.5, zc + 17.5, "#e3e7ea", "#aab3bb", "#c9d0d6", "#555", .5)
    y = yc - T.largo(L) / 2
    for tp, lab in L:   # de -y a +y: se dibuja en ese orden (la cara +y tapa a la anterior)
        p = T.paso(tp)
        if tp == "pf":
            h.BOX(xb + 9.5, xb + 9.5 + 46, y, y + p, zc - 39.75, zc + 39.75, "#f1ece0", "#cfc6b0", "#e2dac6", "#444", .5)
            h.BOX(xb + 55.5, xb + 70.5, y + 2, y + p - 2, zc - 19, zc + 19, "#3a3a3a", "#202020", "#2b2b2b", "#111", .4)
        elif tp in ("gris", "cel", "ver"):
            cc = T.BCOL[tp]; h.BOX(xb + 9.5, xb + 9.5 + 53, y, y + p, zc - 25, zc + 25, T.rgb(cc, 1.15), T.rgb(cc, .8), cc, "#333", .4)
        elif tp == "tope":
            h.BOX(xb + 9.5, xb + 39.5, y, y + p, zc - 22, zc + 22, "#4a4f55", "#33373b", "#3d4146", "#111", .4)
        else:
            h.BOX(xb + 9.5, xb + 9.5 + 59, y, y + p, zc - 30, zc + 30, "#e9c46a", "#b8952f", "#d2ad49", "#333", .4)
        y += p


def prensa3d(h, x, y, zbot, tipo="ZA3"):
    """prensacable colgando de la cara de abajo de la caja"""
    r = 9.5 if tipo == "ZA3" else 10.6
    h.tuboZ(zbot - 12, zbot, x, y, r, r, "url(#galv)", "#444")         # rosca/tuerca
    h.tuboZ(zbot - 22, zbot - 12, x, y, 15, 15, "url(#galv)", "#444")  # tuerca hexagonal (*)
    h.tuboZ(zbot - 44, zbot - 22, x, y, 9, 12, "url(#galv)", "#444")   # cuerpo con corona
