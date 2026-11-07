import math, sys
sys.path.insert(0, ".")
from _barrio import *

h = nueva()
banner(h, "PLANO OFICIAL PENDIENTE - DIBUJADO CON LA FICHA DE NORMAS (AP-CC-010 / AP-PL-003 / AP-CC-014) Y LA CALCULADORA. LO NARANJA CON (*) ES A CONFIRMAR")
FASE, NEU, TIE = "#8f969c", "#4fa3d9", "#2e9d48"
DC = 120          # Ø de la columna dibujado (*)
CA, CB, CP = 200, 150, 100   # caja: alto, ancho, fondo
ZC = 2500         # altura de la caja

# ======================= VISTA DE FRENTE · ESC 1:30
k = .133; PX = 140; yG = 560
def Y(z): return yG - z * k
h.titulo(40, 74, "VISTA DE FRENTE", "ESC. 1:30 - COLUMNA EXISTENTE")
h.rect(40, yG, 220, 60, "url(#EARTH)", K, 0); h.rect(40, yG - 4, 220, 4, "url(#CONCP)", K, .6); h.ln(40, yG, 260, yG, K, 1.4)
rc = DC / 2 * k
h.rect(PX - rc, Y(3200), 2 * rc, 3200 * k + 50, "#fff", K, 1.6)
h.path(f"M{PX-rc-5},{Y(3200)} l7,-4 l8,8 l8,-8 l7,4", "none", K, .9)
h.ln(PX, Y(3200) - 8, PX, yG + 50, K, .45, h.EJE)
# caja centrada a 2,50 m
h.rect(PX + rc, Y(ZC) - CA / 2 * k, CP * k, CA * k, "#fff", K, 1.4)
for z in (ZC - 70, ZC + 70): h.rect(PX - rc - 2, Y(z) - 2, 2 * rc + 4, 4, "#fff", K, 1)
h.rect(PX + rc + CP * k / 2 - 3, Y(ZC) + CA / 2 * k, 6, 5, "#fff", K, .8)   # prensacable
h.path(f"M{PX+rc+CP*k/2},{Y(ZC)+CA/2*k+5} L{PX+rc+CP*k/2},{yG}", "none", K, .9)
# PAT al pie: bloquete + banderita + torta
h.path(f"M{PX-rc-14},{yG} q{14+rc},-14 {2*rc+28},0", "#fff", K, .9)
h.rect(PX + rc, Y(120) - 3, 5, 6, "#fff", K, .8)
h.nivel(46, yG, "±0,00")
h.dimV(252, yG, Y(ZC), "2.500", ext=PX + rc + CP * k + 3)
h.dimV(70, Y(ZC) - CA / 2 * k, Y(ZC) + CA / 2 * k, "200", ext=PX - rc - 3)
h.dimH(Y(3200) - 14, PX - rc, PX + rc, "Ø (*)", c=OR, dy=-4)
h.txt(PX, yG + 72, "COLUMNA METALICA EXISTENTE", 9.5, 400, G, "middle")
for xa in (PX - rc - 26, PX + rc + CP * k + 20):
    h.ln(xa, Y(ZC + 70) - 7, xa, Y(ZC + 70) + 7, K, 1.6); h.txt(xa, Y(ZC + 70) - 10, "A", 12, 700, K, "middle")
h.ln(PX - rc - 26, Y(ZC + 70), PX + rc + CP * k + 20, Y(ZC + 70), K, .5, 'stroke-dasharray="10 3 2 3"')
h.globo("1", PX + rc + CP * k, Y(ZC), 226, Y(ZC + 600)); h.globo("2", PX - rc, Y(ZC - 70), 70, Y(ZC - 600))
h.globo("5", PX + rc + CP * k / 2, Y(ZC) + CA / 2 * k + 3, 220, Y(1600)); h.globo("13", PX + rc + 4, Y(120), 220, Y(700))
h.globo("15", PX - rc - 8, yG - 3, 70, Y(600))

# ======================= CORTE B-B (lateral) · ESC 1:5
k2 = .8; X2 = 330; yc2 = 284
h.titulo(290, 74, "CORTE B-B", "ESC. 1:5 - DE COSTADO")
r2 = DC / 2 * k2
h.rect(X2 - r2, yc2 - 150, 2 * r2, 300, "#fff", K, 1.6)
h.rect(X2 - r2 + 4, yc2 - 150, 2 * r2 - 8, 300, "none", K, .4, h.OCULTA)
xb = X2 + r2 + 4
h.rect(xb, yc2 - CA / 2 * k2, CP * k2, CA * k2, "url(#ANSI31)", K, 1.4)
h.rect(xb + 5, yc2 - CA / 2 * k2 + 5, CP * k2 - 14, CA * k2 - 10, "#fff", K, .6)
h.rect(xb + CP * k2 - 9, yc2 - CA / 2 * k2 - 2, 9, CA * k2 + 4, "#fff", K, 1)        # tapa con junta
h.rect(xb + 8, yc2 - 60, 6, 120, "#fff", K, .8)                                      # placa / riel
for dz in (-56, 56):
    y = yc2 + dz
    h.rect(X2 - r2 - 3, y - 4, 2 * r2 + 6, 8, "url(#ANSI31)", K, 1)
    h.rect(X2 + r2 + 2, y - 7, 10, 14, "#fff", K, .9); h.ln(X2 + r2, y, xb + 14, y, K, 2)
# prensacable abajo y cable que entra
xp = xb + CP * k2 / 2 - 8
h.rect(xp - 9, yc2 + CA / 2 * k2, 18, 10, "#fff", K, 1); h.rect(xp - 6, yc2 + CA / 2 * k2 + 10, 12, 10, "#fff", K, 1)
h.path(f"M{xp},{yc2+CA/2*k2+20} L{xp},{yc2+150}", "none", K, 2.4); h.path(f"M{xp},{yc2+CA/2*k2+20} L{xp},{yc2+150}", "none", "#fff", 1)
# salida a la luminaria (*) por atrás, hacia la columna
h.path(f"M{xb+14},{yc2-30} L{X2+r2-1},{yc2-30} L{X2},{yc2-60} L{X2},{yc2-150}", "none", OR, 1.4, 'stroke-dasharray="4 2"')
h.txt(X2 + r2 + 6, 142, "A LA LUMINARIA", 9, 400, OR); h.txt(X2 + r2 + 6, 154, "POR LA COLUMNA (*)", 9, 400, OR)
h.dimV(xb + CP * k2 + 22, yc2 - CA / 2 * k2, yc2 + CA / 2 * k2, "200", ext=xb + CP * k2 + 2)
h.dimH(yc2 - CA / 2 * k2 - 18, xb, xb + CP * k2, "100", ext=yc2 - CA / 2 * k2 - 3)
h.dimH(yc2 + 164, X2 - r2, X2 + r2, "Ø (*) SE MIDE", c=OR, dy=12)
h.globo("1", xb + CP * k2 - 4, yc2 - 70, 470, 120, r=9); h.globo("2", X2 - r2, yc2 + 56, 300, yc2 + 120, r=9)
h.globo("5", xp + 9, yc2 + CA / 2 * k2 + 6, 470, yc2 + 130, r=9); h.globo("3", xb + 11, yc2 + 40, 470, yc2 + 40, r=9)

# ======================= D1 · TABLERITO (CAJA ABIERTA) · ESC 1:2,5
k3 = 1.6; x3, y3 = 560, 126
h.titulo(520, 74, "D1 - TABLERITO (CAJA SIN TAPA)", "ESC. 1:2,5 - S/ AP-CC-014 A/C, CRITERIO 2026")
W3, H3 = CB * k3, CA * k3
h.rect(x3, y3, W3, H3, "url(#alu)", K, 1.6); h.rect(x3 + 10, y3 + 10, W3 - 20, H3 - 20, "#f4f5f6", K, .6)
for cx_, cy_ in ((x3 + 6, y3 + 6), (x3 + W3 - 6, y3 + 6), (x3 + 6, y3 + H3 - 6), (x3 + W3 - 6, y3 + H3 - 6)): h.circ(cx_, cy_, 3, "#fff", K, .6)
# riel DIN 140 (35 de alto)
ry = y3 + 150; rl = 140 * k3 * .98; rx = x3 + (W3 - rl) / 2
h.rect(rx, ry, rl, 35 * k3 * .5, "url(#galv)", K, .9)
for xx in (rx + 8, rx + rl - 8): h.circ(xx, ry + 14, 3.2, "#ddd", K, .7)
# BPN: fase gris, neutro celeste, tierra verde · portafusible tabaquera
mods = [(FASE, "F"), (NEU, "N"), (TIE, "T")]
bw = 6.2 * k3 * 1.6
for i, (c_, t_) in enumerate(mods):
    xx = rx + 36 + i * (bw + 2)
    h.rect(xx, ry - 30, bw, 88, c_, K, .8)
    for yy in (ry - 22, ry + 50): h.circ(xx + bw / 2, yy, 4, "#d8dde2", K, .6)
    h.txt(xx + bw / 2, ry + 18, t_, 11, 700, "#fff", "middle")
xf = rx + 36 + 3 * (bw + 2) + 10
h.rect(xf, ry - 36, 30, 100, "#efe9d6", K, .9); h.rect(xf + 6, ry - 10, 18, 48, "#fffbe8", K, .7)
h.txt(xf + 15, ry + 20, "2A", 10, 700, K, "middle", MONO)
# cables: entra por abajo (prensacable), sale arriba (*)
pxc = x3 + W3 / 2
h.rect(pxc - 14, y3 + H3, 28, 12, "url(#galv)", K, 1)
cb = lambda xa, ya, xb_, yb_, c_, w=3: (h.path(f"M{xa},{ya} C{xa},{(ya+yb_)/2} {xb_},{(ya+yb_)/2} {xb_},{yb_}", "none", K, w + 1.4), h.path(f"M{xa},{ya} C{xa},{(ya+yb_)/2} {xb_},{(ya+yb_)/2} {xb_},{yb_}", "none", c_, w))
x_f = rx + 36 + bw / 2; x_n = x_f + bw + 2; x_t = x_n + bw + 2
cb(pxc - 6, y3 + H3, x_f, ry + 54, "#7b3f1d"); cb(pxc, y3 + H3, x_n, ry + 54, NEU); cb(pxc + 6, y3 + H3, x_t, ry + 54, TIE)
cb(x_f, ry - 26, xf + 15, ry - 36, "#7b3f1d", 2)                       # 1×2,5 bornera → portafusible
cb(xf + 15, ry + 64, xf + 30, y3 + 26, "#7b3f1d", 2)
cb(x_n, ry - 26, xf + 40, y3 + 26, NEU, 2); cb(x_t, ry - 26, x3 + 22, y3 + 70, TIE, 2.6)     # 1×6 de tierra al bulón
h.circ(x3 + 22, y3 + 70, 5, "#d8dde2", K, .8)
h.txt(x3 + 30, y3 + 94, "BORNE TIERRA", 8.5, 400, G)
h.txt(x3 + 16, y3 + 30, "A LA LUMINARIA (*)", 9, 400, OR)
h.dimH(y3 - 12, x3, x3 + W3, "150", ext=y3 - 2)
h.dimV(x3 - 14, y3, y3 + H3, "200", ext=x3 - 2)
h.dimH(ry + 80, rx, rx + rl, "140 RIEL", ext=ry + 20, dy=12)
h.globo("3", rx + 4, ry + 8, 540, ry + 110, r=9); h.globo("4", rx + 8, ry + 14, 540, ry + 140, r=9)
h.globo("6", rx + 36 + bw / 2, ry - 30, 830, y3 + 60, r=9); h.globo("7", x_n, ry - 30, 830, y3 + 88, r=9); h.globo("8", x_t, ry - 30, 830, y3 + 116, r=9)
h.globo("9", xf + 28, ry + 40, 830, ry + 60, r=9); h.globo("10", xf + 15, ry + 10, 830, ry + 10, r=9)
h.globo("11", x3 + 40, y3 + 82, 830, y3 + 30, r=9); h.globo("12", xf + 5, ry - 48, 780, y3 + 22, r=9)
h.globo("5", pxc + 14, y3 + H3 + 6, 780, y3 + H3 + 14, r=9)

# ======================= CORTE A-A (planta por la abrazadera) · ESC 1:5
h.titulo(290, 490, "CORTE A-A", "ESC. 1:5 - POR LA ABRAZADERA DE ARRIBA")
ax, ay = 340, 590; ra = DC / 2 * k2 * .8
h.circ(ax, ay, ra, "#fff", K, 1.6); h.circ(ax, ay, ra - 3, "none", K, .5)
h.path(f"M{ax},{ay-ra-3} A{ra+3},{ra+3} 0 0 0 {ax},{ay+ra+3}", "none", K, 2.4)
h.rect(ax + ra + 2, ay - 52, CP * k2 * .8, 104, "url(#ANSI31)", K, 1.4)
h.rect(ax + ra + 6, ay - 48, CP * k2 * .8 - 12, 96, "#fff", K, .5)
h.path(f"M{ax},{ay-ra-3} L{ax+ra+2},{ay-ra-3} M{ax},{ay+ra+3} L{ax+ra+2},{ay+ra+3}", "none", K, 2.4)
for s_ in (-1, 1): h.rect(ax + ra - 6, ay + s_ * (ra + 3) - 3, 12, 6, "#fff", K, .8)
h.txt(ax + ra + 82, ay - 40, "CAJA 150 × 100", 9.5, 400, G); h.txt(ax - ra - 6, ay + ra + 30, "2 SEMIABRAZADERAS (*)", 9.5, 400, OR)
h.globo("2", ax - ra - 2, ay - 10, 300, ay - 64, r=9)

# ======================= D2 · PAT AL PIE · S/E
h.titulo(560, 490, "D2 - PAT DE LA COLUMNA", "S/E - BLOQUETE SOLDADO Y BANDERITA")
bx, by = 640, 640
h.rect(560, by, 290, 40, "url(#EARTH)", K, 0); h.ln(560, by, 850, by, K, 1.4)
h.rect(bx - 30, by - 110, 60, 150, "#fff", K, 1.6)
h.path(f"M{bx-70},{by} Q{bx},{by-34} {bx+70},{by}", "url(#CONCP)", K, 1)
h.rect(bx + 30, by - 40, 14, 22, "#fff", K, 1.1)                 # bloquete
h.path(f"M{bx+44},{by-34} h22 a6,6 0 1 1 0,12 h-22 z", "#fff", K, 1)   # banderita
h.path(f"M{bx+74},{by-28} L{bx+150},{by-28} L{bx+150},{by+30}", "none", K, 1.6)
h.txt(bx + 156, by - 30, "V/A 1×10", 9.5, 400, G)
h.txt(bx + 40, by - 60, "SOLDADO EN TODO EL PERIMETRO", 9, 400, G)
h.globo("14", bx + 37, by - 40, bx - 60, by - 90, r=9); h.globo("13", bx + 60, by - 28, bx + 110, by - 80, r=9)
h.globo("15", bx - 50, by - 6, bx - 90, by - 50, r=9)

# ======================= CÓMPUTO
h.tabla(40, 700, [(170, "l", False), (86, "c", True), (290, "l", False)],
        [("POR CAJA (N = LUMINARIAS)", "CANT.", "CALCULO (CALCULADORA, COL. EXISTENTES)"),
         ("CAJA ESTANCA 200×150×100", "1 u", "1 por columna existente (item 42 / 14.1)"),
         ("JUEGOS DE ABRAZADERAS", "2", "Ø a 2,50 m = perimetro ÷ 3,14, igual o mayor"),
         ("RIEL DIN NS 35", "0,14 m", "despiece del plano (AP-PL-003 b)"),
         ("TORNILLOS 6×3/8", "2 u", "fijan el riel"),
         ("PRENSACABLE", "1 u", "entrada del cable a la caja"),
         ("BPN F + N", "N + N", "una fase y un neutro por luminaria"),
         ("BPN T", "1 u", "tierra"),
         ("PORTAFUSIBLE + FUSIBLE 2 A", "N + N", "2 A por artefacto (criterio 2026)"),
         ("BANDERITA + BLOQUETE", "1 + 1", "1 por columna existente"),
         ("TORTA DE MORTERO", "1 u", "deja ver media banderita")],
        rowh=19, titulo="COMPUTO POR CAJA")
h.rayados(620, 700, [("ANSI31", "CAJA / ABRAZADERA"), ("CONCP", "TORTA DE MORTERO"), ("EARTH", "TERRENO")], cols=1, dx=150)
h.notas(40, 942, [
    "COTAS EN mm. CAJA EXTERNA PARA COLUMNA O POSTE SIN CAJA INTERIOR UTILIZABLE. ES LA MISMA PIEZA QUE AP-PL-003.",
    "ALUMINIO INYECTADO 200×150×100 IP65, TAPA CON JUNTA, SEÑAL «RIESGO ELECTRICO». A 2,50 m DEL PISO, 2 JUEGOS DE ABRAZADERAS.",
    "ADENTRO EL TABLERITO DEL AP-CC-014 A/C: CABLE 1×6 DEL BORNE DE TIERRA A LA BORNERA Y 1×2,5 DE LA BORNERA AL FUSIBLE.",
    "AP-CC-014 PIDE 3 BASES 8,5×31,5 CON 4 A POR FASE; EN OBRA (2026) VA TABAQUERA 10×38 CON 2 A POR ARTEFACTO. SE DIBUJA 2026.",
    "PAT: BLOQUETE DE LATON SOLDADO A LA COLUMNA + BANDERITA PARA V/A 10; TORTA DE MORTERO. ACRILICO DE PROTECCION (ETG 16.1).",
    "EN PLAZAS: ITEM 42 DEL ITEMIZADO 2026 (14.1 DEL COMPUTO OFICIAL). EN BARRIO QUEDA COMO REFERENCIA (LP 21478 14.01).",
    "(*) SIN PLANO: ORIENTACION DE LA CAJA, POR DONDE SALE EL CABLE A LA LUMINARIA, CUANTOS PRENSACABLES, ALTURA DE LAS ABRAZADERAS.",
    "(*) Ø 120 DE LA COLUMNA SOLO PARA DIBUJAR: SE MIDE. ABRAZADERAS, TORNILLOS, PRENSACABLE Y CABLES 1×6 / 1×2,5: SIN CODIGO."])

# ======================= 3D
h.titulo(880, 74, "VISTA 3D - CAJA EXTERNA EN LA COLUMNA", "LA TAPA ABIERTA PARA VER EL TABLERITO")
h.iso(.6, 1110, 1846)
R3 = DC / 2
posteZ(h, 2100, 2860, 0, 0, R3, R3 - 1, "url(#galv)", "#3d4650")
roturaV(h, h.P(0, 0, 2100)[0], h.P(0, 0, 2100)[1], 24)
# abrazaderas con orejas
for z in (ZC + 70, ZC - 70):
    anilloZ(h, z - 12, 0, 0, R3 + 3, 25, "url(#galv)", "#333")
    h.BOX(R3 - 4, R3 + 26, -R3 - 18, -R3 + 2, z - 12, z + 13, "#b8c1c9", "#8f99a2", "#a0aab3", "#333", .5)
# caja: fondo y paredes (abierta hacia +x)
x0c = R3 + 26
h.BOX(x0c, x0c + 8, -CB / 2, CB / 2, ZC - CA / 2, ZC + CA / 2, "#c3c9cf", "#a9b0b7", "#dfe3e7", "#333", .7)
h.BOX(x0c, x0c + CP, CB / 2 - 8, CB / 2, ZC - CA / 2, ZC + CA / 2, "#d5dade", "url(#alu)", "#c3c9cf", "#333", .7)
h.BOX(x0c, x0c + CP, -CB / 2, CB / 2, ZC - CA / 2, ZC - CA / 2 + 8, "#cfd5da", "url(#alu)", "#b9c0c6", "#333", .7)
# riel y bornes sobre el fondo
h.BOX(x0c + 8, x0c + 16, -70, 70, ZC - 18, ZC + 17, "#dfe6ec", "#9aa6b0", "#c3ccd4", "#444", .5)
for i, c_ in enumerate((FASE, NEU, TIE)):
    yy = -55 + i * 12
    h.BOX(x0c + 16, x0c + 60, yy, yy + 10, ZC - 30, ZC + 30, c_, c_, c_, "#222", .4)
h.BOX(x0c + 16, x0c + 64, -12, 14, ZC - 34, ZC + 34, "#efe9d6", "#d8cfb4", "#e2dac2", "#555", .5)
h.BOX(x0c + 16, x0c + 60, 22, 34, ZC - 30, ZC + 30, TIE, TIE, TIE, "#222", .4)
# tapa abierta (bisagra en el borde -y, girada)
h.F3([(x0c + CP, -CB / 2, ZC - CA / 2), (x0c + CP + 140, -CB / 2 - 40, ZC - CA / 2), (x0c + CP + 140, -CB / 2 - 40, ZC + CA / 2), (x0c + CP, -CB / 2, ZC + CA / 2)], "url(#alu)", "#333", .8)
pa = h.P(x0c + CP + 70, -CB / 2 - 20, ZC + 20); h.path(f"M{pa[0]},{pa[1]-12} l10,18 h-20 z", "#ffd400", "#222", .7)
h.txt(pa[0], pa[1] + 4, "!", 9, 700, "#222", "middle")
# prensacable abajo y cable
tubo(h, (x0c + 50, 0, ZC - CA / 2), (x0c + 50, 0, ZC - CA / 2 - 25), 14, "url(#galv)", "#333")
cuerda(h, [(x0c + 50, 0, ZC - CA / 2 - 25), (x0c + 50, 0, 2100)], 8, "#1c1c1c")
# torta + bloquete al pie (inset)
h.iso(.32, 1490, 560)
posteZ(h, 0, 600, 0, 0, R3, R3, "url(#galv)", "#3d4650")
h.BOX(-220, 220, -220, 220, -60, 0, "url(#vereda3)", "#bdb5a4", "#a79f8e")
h.a(f'<ellipse cx="{h.P(0,0,0)[0]:.1f}" cy="{h.P(0,0,0)[1]:.1f}" rx="{140*.35*1.2:.1f}" ry="{140*.35*.6:.1f}" fill="url(#concP3)" stroke="#6b6458" stroke-width=".7"/>')
posteZ(h, 0, 600, 0, 0, R3, R3, "url(#galv)", "#3d4650")
h.BOX(R3 - 4, R3 + 16, -12, 12, 20, 60, "url(#bronce)", "#9b6a22", "#b07a2a", "#4a3010", .5)
h.BOX(R3 + 16, R3 + 50, -6, 6, 32, 50, "url(#cobre)", "#9c5a1c", "#c07a3a", "#4a3010", .5)
cuerda(h, [(R3 + 50, 0, 40), (R3 + 140, 0, 40), (R3 + 160, 0, -30)], 7, "#5aa02c")
GX = 1380
h.iso(.6, 1110, 1846)
h.g3("1", (x0c + CP, CB / 2, ZC + CA / 2 - 10), GX, 128, "CAJA 200×150×100 IP65")
h.g3("2", (0, R3, ZC + 70), GX, 168, "ABRAZADERAS")
h.g3("6", (x0c + 60, -50, ZC + 30), GX, 208, "BPN F · N · T")
h.g3("9", (x0c + 64, 0, ZC + 34), GX, 248, "FUSIBLE 2 A")
h.g3("3", (x0c + 16, 60, ZC), GX, 288, "RIEL DIN NS35")
h.g3("5", (x0c + 50, 0, ZC - CA / 2 - 20), GX, 328, "PRENSACABLE")
h.g3("16", (x0c + CP + 70, -CB / 2 - 20, ZC - 40), 900, 128, "TAPA + SEÑAL")
h.iso(.32, 1490, 560)
h.g3("14", (R3 + 6, 0, 60), 1560, 440, "BLOQUETE")
h.g3("15", (-120, 0, 0), 1340, 440, "TORTA (AL PIE)")

# ======================= LISTA
A_V = "A VINCULAR"
filas = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "CAJA ESTANCA ALUMINIO INYECTADO 200×150×100 IP65", "1 u", "6003"),
         ("2", "JUEGO DE ABRAZADERAS (2 SEMIABRAZADERAS) POR Ø A 2,50 m", "2 juegos", A_V),
         ("3", "RIEL DIN NS 35, 14 cm POR CAJA", "0,14 m", "2038"),
         ("4", "TORNILLO CABEZA TANQUE 6×3/8 PARA EL RIEL", "2 u", A_V),
         ("5", "PRENSACABLE METALICO 3/4\" BSC (ZA3) O 1/2\" BSP (ZA11)", "1 u", A_V),
         ("6", "BORNERA BPN 6 mm² GRIS - FASE", "N u", "2009"),
         ("7", "BORNERA BPN 6 mm² CELESTE - NEUTRO", "N u", "2008"),
         ("8", "BORNERA BPN 6 mm² VERDE - TIERRA", "1 u", "2010"),
         ("9", "PORTAFUSIBLE TABAQUERA 10 × 38", "N u", "3053"),
         ("10", "FUSIBLE CILINDRICO 10 × 38, 2 A (UNO POR ARTEFACTO)", "N u", "3017"),
         ("11", "CABLE 1×6 IRAM 247-3: BORNE DE TIERRA → BORNERA", "S/ OBRA", A_V),
         ("12", "CABLE 1×2,5: BORNERA → PORTAFUSIBLE", "S/ OBRA", A_V),
         ("13", "TERMINAL BANDERITA Cu ESTAÑADO P/ 10 mm², OJAL Ø14,6", "1 u", "7018"),
         ("14", "BLOQUETE DE LATON 1/2\", SOLDADO A LA COLUMNA", "1 u", "7003"),
         ("15", "TORTA DE MORTERO CEMENTICIO SOBRE EL BLOQUETE", "1 u", "-"),
         ("16", "ACRILICO DE PROTECCION (ETG 16.1) Y SEÑAL «RIESGO ELECTRICO»", "1 u", "SIN CODIGO"),
         ("17", "VAR. PLANO AP-CC-014: 3 BASES 8,5×31,5 CON FUSIBLE 4 A", "(3 u)", A_V)]
h.tabla(880, 676, [(38, "c", False), (468, "l", False), (104, "c", True), (150, "c", False)], filas, rowh=19,
        titulo="LISTA DE MATERIALES (1 CAJA, N LUMINARIAS)", colores=lambda i, j, t: OR if t in (A_V, "SIN CODIGO") else K)
h.rotulo(880, h.H - 150, 760, "AP-CC-010", "TABLERO DE COLUMNA", "EXTERNO - CAJA ESTANCA", "CAJA, ABRAZADERAS, TABLERITO, PAT Y VISTA 3D", "1:30 / 1:5", "D1 1:2,5 · D2 S/E", fecha="07/11/2026", proyecto="ALUMBRADO DE BARRIOS")
h.guardar("ap_cc_010.svg"); print("ok")
