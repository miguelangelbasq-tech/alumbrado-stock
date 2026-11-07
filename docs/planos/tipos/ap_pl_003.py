"""AP-PL-003 (hojas a y b) · Caja estanca EXTERNA de aluminio 200×150×100 IP65 (6003) abrochada a una columna existente a 2,50 m.
Datos: ficha AP-PL-003 / AP-PL-002, calculadora v130 (Columnas existentes: 6003, 2 juegos de abrazaderas, riel 0,14, 2 tornillos,
prensacable ZA3/ZA11, banderita 7018 + bloquete 7003 + torta, ítem 42 / 14.1), FICHAS_TEC (4003 planchuela 4,76×31,7; fondo 6009 70×165)."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
import tabmet as T, caja_ext as C
h = Hoja(); D = 114; R = D / 2; GAP = 18      # Ø de la columna a 2,50 m: EJEMPLO (*) · separación caja-columna (*)
L = T.armado(3, "TN-S")
# ================= ELEVACION (lateral) =================
h.titulo(40, 62, "VISTA LATERAL", "ESC. 1:20 - COLUMNA EXISTENTE")
k = .135; cx = 120; y0 = 560; ytop = y0 - 3200 * k
h.rect(40, y0, 220, 26, "url(#EARTH)", K, 0); h.ln(40, y0, 260, y0, K, 1.6); h.nivel(232, y0, "±0,00")
h.rect(cx - R * k, ytop, D * k, y0 - ytop + 26, "#fff", K, 1.2)
h.path(f"M{cx-R*k-6:.1f},{ytop:.1f} l6,-6 l{D*k/2:.1f},10 l{D*k/2:.1f},-8 l6,6", "none", K, .7)
h.ln(cx, ytop - 10, cx, y0 + 30, K, .45, h.EJE)
zc = 2500 + C.CH / 2; ycz = y0 - zc * k
xb = cx + (R + GAP) * k
h.rect(xb, ycz - C.CH / 2 * k, C.CD * k, C.CH * k, "#fff", K, 1.1)
for dz in (-50, 50): h.rect(cx - R * k - 1, ycz + dz * k - 2.1, (R + GAP) * k + R * k + 1, 4.3, "#fff", K, .7)
pb = C.prensa2d(h, xb + C.CD / 2 * k, ycz + C.CH / 2 * k, k * 2.2)
h.dimV(xb + C.CD * k + 30, y0, ycz + C.CH / 2 * k, "2.500 MIN. (*)", ext=xb + C.CD * k + 4, c=OR)
h.dimV(xb + C.CD * k + 30, ycz + C.CH / 2 * k, ycz - C.CH / 2 * k, "150", ext=xb + C.CD * k + 4)
h.txt(cx + R * k + 6, ytop + 20, f"Ø{D} (*)", 9.5, 700, OR)
# entrada del cable (existente) y cable por adentro
h.rect(cx - 3, y0 + 4, 6, 18, "#fff", K, .5, h.OCULTA); h.ln(cx, y0 + 10, cx, ycz, K, .7, h.OCULTA)
for n, a, g in (("1", (cx, ytop + 60), (60, 140)), ("2", (xb + 6, ycz), (60, 300)), ("4", (cx + R * k, ycz - 50 * k), (60, 250)),
                ("7", (xb + C.CD / 2 * k, pb - 4), (60, 360)), ("16", (cx, y0 - 120), (60, 420))):
    h.globo(n, a[0], a[1], g[0], g[1])
# ================= CORTE A-A (planta por la caja) =================
h.titulo(330, 62, "CORTE A-A", "ESC. 1:4 - PLANTA A LA ALTURA DE LA ABRAZADERA")
k2 = .78; c2x, c2y = 395, 230
h.circ(c2x, c2y, R * k2, "#fff", K, 1.2); h.circ(c2x, c2y, (R - 4) * k2, "#fff", K, .6)
h.circ(c2x, c2y, (R + C.AB_E) * k2, "none", K, 1.0)
xb2 = c2x + (R + GAP) * k2
for sy in (-1, 1):
    yy = c2y + sy * R * .55 * k2; h.rect(c2x + R * .8 * k2, yy - 2.5, xb2 - c2x - R * .8 * k2, 5, "#fff", K, .7)
    h.circ(xb2 - 6, yy, 2.2, K, K, 0)
h.rect(xb2, c2y - C.CW / 2 * k2, C.CD * k2, C.CW * k2, "#fff", K, 1.1)
h.rect(xb2 + C.CE * k2, c2y - C.CW / 2 * k2 + C.CE * k2, (C.CD - 2 * C.CE) * k2, (C.CW - 2 * C.CE) * k2, "#fff", K, .5)
h.ln(xb2 + C.CD * k2 + 3, c2y - C.CW / 2 * k2, xb2 + C.CD * k2 + 3, c2y + C.CW / 2 * k2, K, 2)
h.ln(c2x - R * k2 - 18, c2y, xb2 + C.CD * k2 + 24, c2y, K, .5, h.EJE)
for yy, s in ((c2y - C.CW / 2 * k2 - 22, "B"), (c2y + C.CW / 2 * k2 + 22, "B")):
    xx = xb2 + C.CD / 2 * k2; h.ln(xx, yy - 8, xx, yy + 8, K, 1.8); h.txt(xx + 6, yy + 4, s, 12, 700)
h.dimV(xb2 + C.CD * k2 + 22, c2y - C.CW / 2 * k2, c2y + C.CW / 2 * k2, "200", ext=xb2 + C.CD * k2 + 6)
h.dimH(c2y + C.CW / 2 * k2 + 40, xb2, xb2 + C.CD * k2, "100", ext=c2y + C.CW / 2 * k2 + 2)
h.dimH(c2y + C.CW / 2 * k2 + 40, c2x - R * k2, c2x + R * k2, f"Ø{D}(*)", ext=c2y + R * k2 + 2, c=OR)
h.txt(c2x - R * k2 - 6, c2y - R * k2 - 6, "PLANCHUELA 4,76×31,7", 9, 400, K, "end" if False else "start")
# ================= CORTE B-B (vertical por el eje) =================
h.titulo(615, 62, "CORTE B-B", "ESC. 1:3 - POR EL AGUJERO Ø50")
k3 = 1.0; wx = 630; zc3 = 245
h.rect(wx, zc3 - 150, 4 * k3, 300, K, K, 0)
for yy in (zc3 - 150, zc3 + 150): h.path(f"M{wx-14},{yy} h12 l4,-5 l4,10 l4,-5 h10", "none", K, .6)

xb3 = wx + 4 + GAP * k3
h.rect(xb3, zc3 - C.CH / 2, C.CD, C.CH, "url(#ANSI31)", K, 1.0)
h.rect(xb3 + C.CE, zc3 - C.CH / 2 + C.CE, C.CD - 2 * C.CE, C.CH - 2 * C.CE, "#fff", K, .6)
h.rect(xb3 + C.CD, zc3 - C.CH / 2, 4, C.CH, "#fff", K, 1.2); h.txt(xb3 + C.CD + 8, zc3 - C.CH / 2 + 10, "TAPA CON JUNTA", 8.5, 700)
# agujero pasante Ø50 en la columna y en la caja + ojal de goma
for x0, w in ((wx, 4), (xb3, C.CE)):
    h.rect(x0 - .5, zc3 - 25, w + 1, 50, "#fff", "none", 0)
    for sy in (-1, 1): h.rect(x0 - 3, zc3 + sy * 25 - (6 if sy > 0 else 0), w + 6, 6, "#222", K, .4)
# tablerito acostado (corte): fondo, riel, portafusible
zt = zc3 - 10
h.rect(xb3 + C.CE, zt - 35, 2, 70, K, K, 0); h.rect(xb3 + C.CE + 2, zt - 17.5, 7.5, 35, "#fff", K, .6)
h.rect(xb3 + C.CE + 9.5, zt - 39.75, 61, 79.5, "#fff", K, .8); h.rect(xb3 + C.CE + 20, zt - 19, 50, 38, "url(#ANSI37)", K, .5)
# cables: del interior de la columna por el Ø50 a la caja
h.path(f"M{wx+4-30},{zc3+150} C{wx-10},{zc3+40} {wx-10},{zc3+6} {xb3+C.CE+4},{zc3+8}", "none", K, 3.4); h.path(f"M{wx+4-30},{zc3+150} C{wx-10},{zc3+40} {wx-10},{zc3+6} {xb3+C.CE+4},{zc3+8}", "none", "#fff", 2)
pb3 = C.prensa2d(h, xb3 + C.CD / 2, zc3 + C.CH / 2, 1.0)
h.ln(xb3 + C.CD / 2, pb3, xb3 + C.CD / 2, pb3 + 40, K, 1.2, 'stroke-dasharray="4 2"'); h.txt(xb3 + C.CD / 2 - 6, pb3 + 34, "CABLE Ø6-12 (*)", 8.5, 400, OR, "end")
for dz in (-50, 50):
    h.rect(wx - 4.76, zc3 + dz - 15.85, 4.76, 31.7, "#fff", K, .8); h.rect(wx + 4, zc3 + dz - 2.5, GAP, 5, "#fff", K, .6)
h.dimV(xb3 + C.CD + 34, zc3 - C.CH / 2, zc3 + C.CH / 2, "150", ext=xb3 + C.CD + 6)
h.dimH(zc3 - C.CH / 2 - 16, xb3, xb3 + C.CD, "100", ext=zc3 - C.CH / 2 - 2)
h.dimV(wx - 30, zc3 - 25, zc3 + 25, "Ø50", ext=wx - 2)
h.dimH(zc3 - C.CH / 2 - 40, wx + 4, xb3, f"{GAP} (*)", ext=zc3 - C.CH / 2 + 30, c=OR)
for n, a, g in (("5", (wx + 1, zc3 + 22), (612, 380)), ("8", (xb3 + 40, zt + 20), (598, 300)), ("7", (xb3 + C.CD / 2, pb3 - 8), (790, 400)), ("3", (wx - 3, zc3 - 50), (598, 180))):
    h.globo(n, a[0], a[1], g[0], g[1])
# ================= VISTA FRONTAL SIN TAPA =================
h.titulo(330, 450, "D1 - VISTA FRONTAL SIN TAPA", "ESC. 1:2 - FONDO ACOSTADO (*), TRIPLE TN-S")
k4 = 1.15; fx, fy = 360, 500
h.rect(fx, fy, C.CW * k4, C.CH * k4, "url(#ANSI31)", K, 1.1)
h.rect(fx + C.CE * k4, fy + C.CE * k4, (C.CW - 2 * C.CE) * k4, (C.CH - 2 * C.CE) * k4, "#fff", K, .6)
for xx, yy in ((fx + 9, fy + 9), (fx + C.CW * k4 - 9, fy + 9), (fx + 9, fy + C.CH * k4 - 9), (fx + C.CW * k4 - 9, fy + C.CH * k4 - 9)):
    h.circ(xx, yy, 3.2, "#fff", K, .6)
pcx, pcy = fx + C.CW / 2 * k4, fy + C.CH / 2 * k4
h.circ(pcx, pcy - 46 * k4, 25 * k4, "#fff", K, .7, h.OCULTA)
oW, oH = T.PL_W, T.PL_H; T.PL_W, T.PL_H = C.PLH, C.PLW
h.a(f'<g transform="rotate(-90 {pcx:.1f} {pcy:.1f})">')
T.frente(h, pcx - C.PLH / 2 * k4, pcy - C.PLW / 2 * k4, k4, L)
h.a('</g>'); T.PL_W, T.PL_H = oW, oH
h.dimH(fy - 14, fx, fx + C.CW * k4, "200", ext=fy - 2); h.dimV(fx - 14, fy, fy + C.CH * k4, "150", ext=fx - 2)
h.dimH(fy + C.CH * k4 + 18, pcx - C.PLW / 2 * k4, pcx + C.PLW / 2 * k4, "FONDO 165 × 70 (*)", ext=pcy + 36, c=OR)
h.txt(pcx + 32 * k4, pcy - 64 * k4, "Ø50 DETRAS (*)", 8, 400, OR)
for n, a, g in (("8", (pcx - 60, pcy), (330, 540)), ("9", (pcx + 40, pcy + 12), (330, 600))):
    h.globo(n, a[0], a[1], g[0], g[1])
# ================= D2 ABRAZADERA =================
h.titulo(640, 450, "D2 - SEMIABRAZADERA", "S/E - SE PIDE POR EL Ø A 2,50 m")
ax, ay = 735, 560
h.path(f"M{ax-48},{ay} A48,48 0 0 1 {ax+48},{ay}", "none", K, 3.2); h.path(f"M{ax-48},{ay} A48,48 0 0 1 {ax+48},{ay}", "none", "#fff", 1.4)
for sx in (-1, 1):
    h.rect(ax + sx * 48 - (18 if sx > 0 else -4) - (0 if sx > 0 else 18) + (0 if sx > 0 else 0), ay - 2, 18, 4.6, "#fff", K, .8)
    h.circ(ax + sx * 58, ay, 2.6, "#fff", K, .7)
h.dimH(ay + 22, ax - 48, ax + 48, "Ø COLUMNA (MEDIR)", ext=ay + 4)
h.txt(ax, ay + 44, "PLANCHUELA 4,76 × 31,7 CINCADA", 9, 400, K, "middle"); h.txt(ax, ay + 58, "2 MEDIAS + 2 BULONES = 1 JUEGO", 9, 400, K, "middle")
h.txt(ax, ay + 72, "PERIMETRO ÷ 3,14 → MEDIDA IGUAL O MAYOR", 9, 400, G, "middle")
# ================= COMPUTO =================
rows = [("POR COLUMNA EXISTENTE", "CANT.", "CALCULO (CALCULADORA)"),
        ("CAJA ESTANCA 200×150×100 (6003)", "1", "1 POR COLUMNA EXISTENTE"),
        ("JUEGOS DE ABRAZADERAS (4003)", "2", "2 JUEGOS × 2 SEMIABR. POR CAJA"),
        ("RIEL DIN NS35", "0,14 m", "14 cm POR CAJA"), ("TORNILLO CAB. TANQUE 6×3/8", "2", "2 POR CAJA"),
        ("PRENSACABLE ZA3 / ZA11", "1", "1 POR CAJA"), ("OJAL DE GOMA Ø50", "1", "1 POR CAJA (AGUJERO PASANTE)"),
        ("TABLERITO AP-CC-014 A/C", "1", "MISMO ARMADO (TRIPLE: 3 PF, 8 BPN)"),
        ("PAT: BANDERITA+BLOQ.+TORTA", "1+1+1", "AP-TC-005 2/2 (NO BULON)")]
h.tabla(40, 700, [(190, "l", False), (56, "c", True), (220, "l", False)], rows, rowh=19, titulo="COMPUTO POR COLUMNA EXISTENTE (ITEM 42)")
h.rayados(540, 700, [("ANSI31", "ALUMINIO (CORTE)"), ("ANSI37", "FUSIBLE / ROSCA")], cols=1)
h.txt(540, 790, "SE COBRA EN EL ITEM 42 (ANEXO I 2026)", 10, 700); h.txt(540, 806, "= 14.1 DE LOS COMPUTOS OFICIALES", 10, 400)
h.txt(540, 822, "EJ.: ALBERTO PIO 3191: 14.1 = 8 CAJAS", 10, 400, G)
h.notas(40, 905, [
 "COTAS EN mm. VA CUANDO LA CAJA DE LA COLUMNA EXISTENTE NO SIRVE O QUEDA BAJA. 2,50 m DEL PISO (ETG: MINIMO).",
 "2 JUEGOS DE ABRAZADERAS POR CAJA: LA MEDIDA ES EL Ø DE LA COLUMNA A 2,50 m (MEDIR EL PERIMETRO Y DIVIDIR POR 3,14).",
 "ADENTRO, EL TABLERITO DEL AP-CC-014 A/C Y LA FERRETERIA DE LA HOJA b (AP-PL-002): RIEL, 2 TORNILLOS, OJAL, PRENSACABLE.",
 "PAT DE LA EXISTENTE: BANDERITA 7018 + BLOQUETE 7003 SOLDADO + TORTA (AP-TC-005 2/2). AP-CC-010 ES LA MISMA CAJA (SIN ENLACE).",
 "(*) A CONFIRMAR: Ø114 ES UN EJEMPLO; SEPARACION 18, 2.500 AL PIE DE LA CAJA, ABRAZADERAS A ±50, FONDO 165×70 (6009).",
 "(*) PRENSACABLE ZA3/ZA11 TOMA Ø6 A 12 (FICHA) Y LA TABLA DICE 5 A 8; ¿QUE CABLE PASA? 200×200×100 ES LA OTRA CAJA ADMITIDA.",
 "(*) AGUJERO Ø50: POSICION EN LA CAJA Y EN LA COLUMNA (SE DIBUJA 10 SOBRE EL CENTRO) A CONFIRMAR CON LA HOJA a."])
# ================= 3D =================
h.titulo(880, 62, "VISTA 3D - CAJA EXTERNA SOBRE COLUMNA EXISTENTE", "TAPA SACADA PARA VER EL TABLERITO, EL OJAL Y LOS CABLES; ABRAZADERAS Y PRENSACABLE")
h.iso(.82, 1110, 390)
C.col3d(h, R, -200, 190)
xb = R + GAP
for z in (-50, 50): C.abraz3d(h, R, z, xb)
b = C.caja3d(h, xb, 0, 0)
C.tab_h3d(h, xb + C.CE, 0, -10, L)
# cables desde el agujero: troncal (2) y 3×1,5 (3)
o = h.P(xb + C.CE, 0, 10)
for i, col in enumerate(("#151515", "#151515")):
    e = h.P(xb + 30, -60 + i * 12, -30); h.path(f"M{o[0]:.1f},{o[1]:.1f} Q{o[0]-10:.1f},{e[1]+10:.1f} {e[0]:.1f},{e[1]:.1f}", "none", col, 4.2)
for i, col in enumerate(("#7b3f1d", "#1a1a1a", "#c62828")):
    e = h.P(xb + 70, -40 + i * 17.5, 30); h.path(f"M{o[0]+2:.1f},{o[1]-2:.1f} Q{o[0]+20:.1f},{o[1]-30:.1f} {e[0]:.1f},{e[1]:.1f}", "none", col, 1.8)
C.caja3d_frente(h, b)
C.prensa3d(h, xb + C.CD / 2, 30, -C.CH / 2)
q = h.P(xb + C.CD / 2, 30, -C.CH / 2 - 44); h.ln(q[0], q[1], q[0], q[1] + 40, "#151515", 4)
# tapa sacada
tx = xb + C.CD + 80; ty = -150
h.F3([(tx, ty - C.CW / 2, -C.CH / 2), (tx, ty + C.CW / 2, -C.CH / 2), (tx, ty + C.CW / 2, C.CH / 2), (tx, ty - C.CW / 2, C.CH / 2)], "#d9dcde", "#5d6266", .8)
h.F3([(tx - 4, ty - C.CW / 2 + 6, -C.CH / 2 + 6), (tx - 4, ty + C.CW / 2 - 6, -C.CH / 2 + 6), (tx - 4, ty + C.CW / 2 - 6, C.CH / 2 - 6), (tx - 4, ty - C.CW / 2 + 6, C.CH / 2 - 6)], "none", "#111", 2.2)
qq = h.P(tx, ty, 10); h.a(f'<path d="M{qq[0]:.1f},{qq[1]-14:.1f} l12,22 h-24 z" fill="#ffd400" stroke="#111" stroke-width=".8"/>'); h.txt(qq[0], qq[1] + 4, "!", 11, 700, "#111", "middle")
gy = 120
def g(n, p, t):
    global gy; h.g3(n, p, 1500, gy, t); gy += 40
g("1", (R * .7, R * .7, 200), "COLUMNA EXISTENTE")
g("2", (xb, C.CW / 2, C.CH / 2), "CAJA ALUMINIO IP65")
g("9", (tx, ty + C.CW / 2 - 20, 40), "TAPA CON JUNTA")
g("3", (R * .8, R * .6, 50), "ABRAZADERAS (2 JGOS.)")
g("8", (xb + 60, 20, 20), "TABLERITO AP-CC-014")
g("5", (xb + C.CE, 0, 34), "OJAL DE GOMA Ø50")
g("6", (xb + 30, -55, -30), "TRONCAL (2)")
g("10", (xb + 70, -10, 30), "3×1,5 A LOS ARTEF.")
g("7", (xb + C.CD / 2, 30, -C.CH / 2 - 30), "PRENSACABLE")
h.txt(885, 602, "COLUMNA EXISTENTE PINTADA (AP-TC-023) · CAJA A 2,50 m DEL PISO", 10.5, 700, NV, "start", INT)
LISTA = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
 ("1", "COLUMNA METALICA EXISTENTE (REACONDICIONADA, ITEM 41)", "-", "EXISTENTE"),
 ("2", "CAJA ESTANCA ALUMINIO INYECTADO 200×150×100 IP65", "1 u", "6003"),
 ("3", "SEMIABRAZADERA DE PLANCHUELA, POR Ø (2 JUEGOS = 4 MEDIAS)", "4 u", "4003"),
 ("4", "BULONES DE LAS ABRAZADERAS (*)", "4 u (*)", "A VINCULAR"),
 ("5", "OJAL DE GOMA PARA AGUJERO PASANTE Ø50", "1 u", "A VINCULAR"),
 ("6", "CABLE TRONCAL (NUEVA ACOMETIDA SUBTERRANEA)", "S/ PROY.", "SEGUN CALCULO"),
 ("7", "PRENSACABLE METALICO ZA3 3/4\" BSC O ZA11 1/2\" BSP, IP68", "1 u", "A VINCULAR"),
 ("8", "TABLERITO: FONDO 165×70 (*) + RIEL 0,14 m + 2 TORN. 6×3/8", "1 + 0,14 m", "6009 (*)·2038"),
 ("9", "TAPA DE LA CAJA CON JUNTA Y CARTEL «RIESGO ELECTRICO»", "1", "CON LA CAJA"),
 ("10", "CABLE Cu 3×1,5 XLPE A CADA LUMINARIA", "S/ CALC.", "6001"),
 ("11", "ARMADO DEL TABLERITO (PF, FUSIBLES, BPN, PEINE): VER AP-CC-014", "1 juego", "VER AP-CC-014"),
 ("12", "TERMINAL BANDERITA Cu ESTAÑADO 10 mm², OJAL Ø14,6", "1 u", "7018"),
 ("13", "BLOQUETE DE BRONCE 1/2\" SOLDADO A LA COLUMNA (MN1101 b)", "1 u", "7003"),
 ("14", "TORTA DE MORTERO SOBRE EL BLOQUETE", "1 u", "8020"),
 ("15", "VARIANTE: CAJA 200×200×100 (AP-PL-003)", "-", "A VINCULAR"),
 ("16", "ENTRADA DEL CABLE EN LA COLUMNA (EXISTENTE, POR ADENTRO)", "-", "EXISTENTE")]
h.tabla(890, 622, [(40, "c", False), (450, "l", False), (100, "c", True), (160, "c", False)], LISTA, rowh=21,
        titulo="LISTA DE MATERIALES (1 COLUMNA EXISTENTE)", colores=lambda i, j, t: OR if ("(*)" in t or t in ("A VINCULAR", "SIN CODIGO")) else K)
h.rotulo(890, h.H - 150, 750, "AP-PL-003", "CAJA ESTANCA EXTERNA", "PARA COLUMNA EXISTENTE", "HOJAS a Y b - LATERAL, CORTES, FRENTE, ABRAZADERA Y 3D", "1:20 / 1:4", "1:3, 1:2, 3D S/E", fecha="07/11/2026")
h.guardar("ap_pl_003.svg")
