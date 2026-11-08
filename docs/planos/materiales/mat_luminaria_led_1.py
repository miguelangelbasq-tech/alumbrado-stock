"""MAT-LUMINARIA_LED-1 (rev. B) · Luminaria vial LED (6010 provista por la Municipalidad, 6011 200 W, 6012 Philips 76 / 100 W).
Geometría: r3d/piezas/perfiles_col.mjs (LUM, plantaLum) → perfiles_col.json; 3D: r3d/out/col_lum_ext.png y col_lum_corte.png.
Datos: FICHAS_TEC.luminaria_led (aluminio inyectado, módulo LED, vidrio templado, IP66, acople Ø42 / Ø60 con inclinación regulable en pasos de 5°,
modelo de referencia Strand RS 160: 575 × 312 × 93; manguito Ø60,3 ≥ 800 mm / Ø42,4 menores), AP-C-008 (entrada 63±1, empotramiento 100–200,
bulón pasante 4019 + 4038). Web: Strand RS 160 alto 93, acople 40 / 60 (Luminotecnia); receptáculo NEMA 7 pines ANSI C136.41 (Intermatic K171H Ø64 × 38);
protector de sobretensiones 10 kV y driver con dimerización 1-10 V (fichas de luminarias viales). Interior (driver, SPD, bornera, lentes, aletas): (*)."""
from colkit import *

h = nueva3()
L = LUM; PL = L["planta"]; PI = L["plantaIn"]; Al = L["aletas"]; Vd = L["vidrio"]; Pb = L["placaLED"]; Ln = L["lentes"]; N = L["nema"]; A = L["acople"]
D, S, Bo = L["drv"], L["spd"], L["bornera"]; zJ, H = L["zJunta"], L["H"]

# ======================= 1. VISTA DE ARRIBA (1:4)
e = .42; ox, oy = 110, 190
h.titulo(40, 62, "VISTA DE ARRIBA", "ESC. 1:4 · MODELO DE REFERENCIA 575 × 312 (*)")
T = lambda x, y: (ox + x * e, oy + y * e)
poly(h, [T(x, y) for x, y in PL], "#fff", 1.5)
dt = [(0, -L["cuello"]), (L["xAncho"], -L["W"] / 2), (L["sep"] + 2, -L["W"] / 2), (L["sep"] + 2, L["W"] / 2), (L["xAncho"], L["W"] / 2), (0, L["cuello"])]
ins = lambda k_: [(k_, -L["cuello"] + k_ * .7), (L["xAncho"], -L["W"] / 2 + k_), (L["sep"] + 2 - k_ * .3, -L["W"] / 2 + k_), (L["sep"] + 2 - k_ * .3, L["W"] / 2 - k_), (L["xAncho"], L["W"] / 2 - k_), (k_, L["cuello"] - k_ * .7)]
poly(h, [T(*p) for p in ins(12)], "none", .7)
for i in range(Al["n"]):
    y = -Al["y"] + i * 2 * Al["y"] / (Al["n"] - 1); h.rect(T(Al["x"][0], 0)[0], T(0, y)[1] - Al["e"] / 2 * e, (Al["x"][1] - Al["x"][0]) * e, Al["e"] * e, "#fff", K, .6)
h.circ(*T(N["x"], 0), N["Dfc"] / 2 * e, "#fff", K, 1); h.circ(*T(N["x"], 0), N["D"] / 2 * e, "none", K, .5)
for x in (40, 80): h.circ(*T(x, 0), 7.5 * e, "#fff", K, .7)
for x, y in ((30, -L["cuello"] + 6), (30, L["cuello"] - 6), (L["sep"] - 12, -L["W"] / 2 + 12), (L["sep"] - 12, L["W"] / 2 - 12)): h.circ(*T(x, y), 2.5, "#fff", K, .6)
h.rect(ox - 50, oy - 30.15 * e, 50 + 8 * e, 60.3 * e, "#fff", K, 1)
h.ln(ox - 56, oy, ox + 590 * e, oy, K, .4, h.EJE)
h.dimH(oy - L["W"] / 2 * e - 22, ox, ox + L["L"] * e, "575 (REF.)", ext=oy - L["W"] / 2 * e - 4)
h.dimV(ox + L["L"] * e + 18, oy - L["W"] / 2 * e, oy + L["W"] / 2 * e, "312 (REF.)", ext=ox + L["L"] * e + 2)
h.dimH(oy + L["W"] / 2 * e + 16, ox, ox + L["sep"] * e, f"{L['sep']} (*)", ext=oy + L["W"] / 2 * e, c=OR)
lineaCorte(h, T(400, 0)[0], oy - L["W"] / 2 * e - 8, T(400, 0)[0], oy + L["W"] / 2 * e + 8, "A")
a, b = T(-10, 0), T(585, 0); h.txt(a[0] - 4, a[1] - 6, "B", 12, 700, K, "end")
h.globo("1", *T(480, 150), 300, 78, r=9); h.globo("2", *T(450, Al["y"]), 330, 78, r=9); h.globo("5", *T(N["x"], -30), 80, 100, r=9)
h.globo("8", *T(40, 0), 60, 150, r=9)

# ======================= 2. CORTE A-A (por el recinto óptico, 1:2)
h.titulo(370, 62, "CORTE A-A", "RECINTO OPTICO · ESC. 1:2")
e2 = .7; cx, zb = 500, 250
Z = lambda y, z: (cx + y * e2, zb - z * e2)
W2 = L["W"] / 2
poly(h, [Z(-W2 + 4, 0), Z(-W2, 8), Z(-W2, zJ), Z(-W2 + 3, zJ), Z(-W2 + 3, 8), Z(-W2 + 6, 3), Z(-Vd["y"] + 6, 3), Z(-Vd["y"] + 6, 0)], "url(#ALU)", 1)
poly(h, [Z(W2 - 4, 0), Z(W2, 8), Z(W2, zJ), Z(W2 - 3, zJ), Z(W2 - 3, 8), Z(W2 - 6, 3), Z(Vd["y"] - 6, 3), Z(Vd["y"] - 6, 0)], "url(#ALU)", 1)
poly(h, [Z(-W2, zJ), Z(W2, zJ), Z(W2, zJ + 10), Z(-W2, zJ + 10)], "url(#ALU)", 1)
for i in range(Al["n"]):
    y = -Al["y"] + i * 2 * Al["y"] / (Al["n"] - 1); hh = Al["h"] * (1 - (abs(y) / (Al["y"] + 40)) ** 2 * .8)
    poly(h, [Z(y - Al["e"] / 2, zJ + 10), Z(y - Al["e"] / 2 + .6, zJ + 10 + hh), Z(y + Al["e"] / 2 - .6, zJ + 10 + hh), Z(y + Al["e"] / 2, zJ + 10)], "url(#ALU)", .8)
h.rect(*Z(-Pb["y"], zJ - 2), 2 * Pb["y"] * e2, Pb["e"] * e2, "url(#MET)", K, .6)
for j in range(Ln["filas"]):
    y = -Pb["y"] + 2 * Pb["y"] / Ln["filas"] * (j + .5); z0 = zJ - 2 - Pb["e"] - 1.2
    h.rect(*Z(y - 12, zJ - 2 - Pb["e"]), 24 * e2, 1.2 * e2, "#fff", K, .4)
    h.path(f"M{Z(y - Ln['d'] / 2 * 1.15, z0)[0]:.1f},{Z(0, z0)[1]:.1f} Q{Z(y, z0)[0]:.1f},{Z(0, z0 - Ln['h'] * 2)[1]:.1f} {Z(y + Ln['d'] / 2 * 1.15, z0)[0]:.1f},{Z(0, z0)[1]:.1f}", "url(#VID)", K, .7)
h.rect(*Z(-Vd["y"], Vd["z"] + Vd["e"]), 2 * Vd["y"] * e2, Vd["e"] * e2, "url(#VID)", K, .8)
for s in (-1, 1): h.rect(*Z(s * Vd["y"] - (4 if s > 0 else 0), Vd["z"] + Vd["e"] + 3), 4 * e2, 3 * e2, "url(#GOMA)", K, .3)
h.dimH(zb - (zJ + 10 + Al["h"]) * e2 - 10, cx - W2 * e2, cx + W2 * e2, "312", ext=zb - zJ * e2)
h.dimV(cx + W2 * e2 + 14, zb - (zJ + 10 + Al["h"]) * e2, zb, "≈ 86 (*)", ext=cx + W2 * e2 + 2, c=OR)
for t, (y, z), (tx, ty) in [("ALETAS (*)", (Al["y"] * .8, zJ + 40), (590, 120)), ("PLACA LED Al (*)", (60, zJ - 3), (590, 280)), ("LENTE PMMA (*)", (0, zJ - 8), (590, 295)),
                            ("VIDRIO TEMPLADO 5 (*)", (100, Vd["z"] + 2), (590, 310)), ("JUNTA DE SILICONA (*)", (Vd["y"] - 2, Vd["z"] + 8), (590, 265))]:
    llamada(h, *Z(y, z), tx, ty, t, c=OR, sz=8.5)
h.globo("1", *Z(-W2, 20), 372, 280, r=9)

# ======================= 3. D2 · RECEPTACULO NEMA 7 PINES (ANSI C136.41)
h.titulo(660, 62, "D2 · ZOCALO NEMA", "7 PINES · ANSI C136.41 · ESC. 1:1")
nx_, ny_ = 745, 185; rN = N["D"] / 2 * 1.2
h.circ(nx_, ny_, rN, "#fff", K, 1.2); h.circ(nx_, ny_, rN - 6, "none", K, .5)
for i in range(3):
    a = math.radians(90 + i * 120); px_, py_ = nx_ + 20 * math.cos(a), ny_ - 20 * math.sin(a)
    tx, ty = -math.sin(a), -math.cos(a)
    h.path(f"M{px_ - 6 * tx:.1f},{py_ - 6 * ty:.1f} A20,20 0 0,0 {px_ + 6 * tx:.1f},{py_ + 6 * ty:.1f}", "none", K, 3.5)
for i in range(4):
    a = math.radians(45 + i * 90); h.rect(nx_ + 9 * math.cos(a) - 2.5, ny_ - 9 * math.sin(a) - 2.5, 5, 5, "#fff", K, .6)
h.dimH(ny_ + rN + 18, nx_ - rN, nx_ + rN, "Ø64 (REF. K171H)", ext=ny_)
h.txt(nx_, ny_ + rN + 34, "3 CONTACTOS DE POTENCIA + 4 DE SEÑAL", 8, 400, G, "middle")
h.txt(nx_, ny_ + rN + 46, "(DIMERIZACION / CONTROL)", 8, 400, G, "middle")

# ======================= 4. CORTE B-B LONGITUDINAL (por el eje, 1:2,2)
h.titulo(40, 340, "CORTE B-B (LONGITUDINAL)", "DRIVER Y OPTICO · ESC. 1:1,1 · INTERIOR (*)")
e3 = .9; ox3, zb3 = 175, 580
Q = lambda x, z: (ox3 + x * e3, zb3 - z * e3)
# carcasa: bandeja, tabique, tapa del driver, placa disipadora, aletas
poly(h, [Q(0, 8), Q(0, zJ), Q(3, zJ), Q(3, 8)], "url(#ALU)", .9); poly(h, [Q(L["L"], 8), Q(L["L"], zJ), Q(L["L"] - 3, zJ), Q(L["L"] - 3, 8)], "url(#ALU)", .9)
poly(h, [Q(4, 0), Q(L["sep"], 0), Q(L["sep"], 3), Q(4, 3)], "url(#ALU)", .9)
poly(h, [Q(L["sep"] - 2, 0), Q(L["sep"] + 2, 0), Q(L["sep"] + 2, zJ + 10), Q(L["sep"] - 2, zJ + 10)], "url(#ALU)", .9)
poly(h, [Q(0, zJ), Q(0, H - 12), Q(3, H - 6), Q(12, H), Q(L["sep"] + 2, H), Q(L["sep"] + 2, H - 3), Q(14, H - 3), Q(6, H - 9), Q(3, H - 12), Q(3, zJ)], "url(#ALU)", .9)
poly(h, [Q(L["sep"], zJ), Q(L["L"], zJ), Q(L["L"], zJ + 10), Q(L["sep"], zJ + 10)], "url(#ALU)", .9)
poly(h, [Q(Al["x"][0], zJ + 10), Q(Al["x"][0] + 30, zJ + 10 + Al["h"] * .99), Q(Al["x"][1] - 25, zJ + 10 + Al["h"] * .99), Q(Al["x"][1], zJ + 10)], "none", .8)
h.rect(*Q(Vd["x"][0], Vd["z"] + Vd["e"]), (Vd["x"][1] - Vd["x"][0]) * e3, Vd["e"] * e3, "url(#VID)", K, .7)
h.rect(*Q(Pb["x"][0], zJ - 2), (Pb["x"][1] - Pb["x"][0]) * e3, Pb["e"] * e3, "url(#MET)", K, .5)
gx = (Pb["x"][1] - Pb["x"][0]) / Ln["col"]
for i in range(Ln["col"]):
    x = Pb["x"][0] + gx * (i + .5); z0 = zJ - 2 - Pb["e"] - 1.2
    h.path(f"M{Q(x - Ln['d'] / 2, z0)[0]:.1f},{Q(0, z0)[1]:.1f} Q{Q(x, z0)[0]:.1f},{Q(0, z0 - Ln['h'] * 2)[1]:.1f} {Q(x + Ln['d'] / 2, z0)[0]:.1f},{Q(0, z0)[1]:.1f}", "url(#VID)", K, .6)
# driver (detrás del plano, en línea oculta), SPD, bornera
h.rect(*Q(D["x"][0], D["z"][1]), (D["x"][1] - D["x"][0]) * e3, (D["z"][1] - D["z"][0]) * e3, "none", K, .7, h.OCULTA)
h.rect(*Q(S["x"][0], S["z"][1]), (S["x"][1] - S["x"][0]) * e3, (S["z"][1] - S["z"][0]) * e3, "none", K, .7, h.OCULTA)
h.rect(*Q(Bo["x"][0], Bo["z"][1]), (Bo["x"][1] - Bo["x"][0]) * e3, (Bo["z"][1] - Bo["z"][0]) * e3, "none", K, .7, h.OCULTA)
# acople: brazo dentro de la boca, 2 bulones con puente
h.rect(ox3 - 45, Q(0, A["z"] + A["D"] / 2)[1], 45 + A["emp"] * e3, A["D"] * e3, "#fff", K, 1.1)
h.rect(ox3 - 45, Q(0, A["z"] + A["D"] / 2 - 3.2)[1], 45 + A["emp"] * e3, (A["D"] - 6.4) * e3, "none", K, .4, h.OCULTA)
for x in (40, 80):
    h.rect(*Q(x - 4, H), 8 * e3, (H - 6) * e3, "url(#STEEL)", K, .6); h.rect(*Q(x - 7.5, H + 4), 15 * e3, 4 * e3, "#fff", K, .7)
    h.rect(*Q(x - 9, A["z"] - A["D"] / 2 - 1), 18 * e3, 5 * e3, "url(#MET)", K, .5)
# NEMA + fotocontrol
h.rect(*Q(N["x"] - N["D"] / 2 - 4, H + 14), (N["D"] + 8) * e3, 14 * e3, "url(#PLAS)", K, .8)
h.path(f"M{Q(N['x'] - N['Dfc'] / 2, H + 14)[0]:.1f},{Q(0, H + 14)[1]:.1f} V{Q(0, H + 14 + N['Hfc'] * .55)[1]:.1f} Q{Q(N['x'], H + 14 + N['Hfc'] * 1.15)[0]:.1f},{Q(0, H + 14 + N['Hfc'] * 1.15)[1]:.1f} {Q(N['x'] + N['Dfc'] / 2, H + 14 + N['Hfc'] * .55)[0]:.1f},{Q(0, H + 14 + N['Hfc'] * .55)[1]:.1f} V{Q(0, H + 14)[1]:.1f} Z", "none", K, .8, 'stroke-dasharray="6 2 1.5 2"')
h.ln(ox3 - 50, Q(0, A["z"])[1], Q(L["L"] + 10, 0)[0], Q(0, A["z"])[1], K, .4, h.EJE)
h.dimH(zb3 + 16, ox3, Q(L["L"], 0)[0], "575 (REF.)", ext=zb3 + 2)
h.dimV(Q(L["L"], 0)[0] + 14, Q(0, H)[1], zb3, "93", ext=Q(L["L"] - 30, 0)[0])
h.dimH(Q(0, A["z"] - A["D"] / 2)[1] + 14, ox3, Q(A["emp"], 0)[0], "100-200", ext=Q(0, A["z"] - A["D"] / 2)[1])
h.dimV(ox3 - 58, Q(0, A["z"] + A["D"] / 2)[1], Q(0, A["z"] - A["D"] / 2)[1], "Ø60,3", ext=ox3 - 46)
for t, (x, z), (tx, ty) in [("RECINTO DEL DRIVER", (150, 70), (430, 395)), ("TABIQUE (*)", (L["sep"], 30), (430, 410)), ("RECINTO OPTICO", (420, 25), (560, 395)),
                            ("DRIVER 1-10 V, DETRAS (*)", (D["x"][0] + 30, 22), (330, 650)), ("SPD 10 kV, DETRAS (*)", (60, 12), (130, 650)), ("BORNERA L·N·PE, ADELANTE (*)", (140, 14), (330, 665)),
                            ("PUENTE DEL ACOPLE", (80, A["z"] - A["D"] / 2), (130, 665)), ("JUNTA DE LA TAPA", (100, zJ), (55, 455))]:
    llamada(h, *Q(x, z), tx, ty, t, c=OR if "(*)" in t else K, sz=8.5)
h.globo("6", *Q(N["x"], H + 50), 330, 400, r=9); h.globo("4", *Q(40, H + 5), 240, 400, r=9); h.globo("3", *Q(500, Vd["z"] + 3), 740, 650, r=9)
h.globo("7", *Q(-30, A["z"] + 20), 60, 520, r=9)

# ======================= 5. D1 · INCLINACION
h.titulo(660, 62 + 290, "D1 · INCLINACION", "PASOS DE 5° · −15° A +15° (*)")
ix, iy = 700, 420
for g in range(-15, 20, 5):
    a = math.radians(g); h.ln(ix, iy, ix + 110 * math.cos(a), iy - 110 * math.sin(a), K if g == 0 else G, .9 if g == 0 else .5, "" if g == 0 else 'stroke-dasharray="3 2"')
    h.txt(ix + 122 * math.cos(a), iy - 122 * math.sin(a) + 3, f"{g:+d}°" if g else "0°", 8.5, 700 if g == 0 else 400)
h.circ(ix, iy, 6, "#fff", K, .8); h.rect(ix - 50, iy - 7, 50, 14, "#fff", K, .8); h.txt(ix - 48, iy + 22, "BRAZO", 8, 700)

# ======================= TABLAS
TY = 700
yc_ = codTabla(h, 40, TY, [6010, 6011, 6012], {6010: "SEGUN PROVISION", 6011: "200 W · UN. «m» (*)", 6012: "76 / 100 W · UN. «m» (*)"}, wd=150)
yd = tablaD(h, 40, yc_ + 18, [("DATO", "VALOR"), ("CUERPO", "ALUMINIO INYECTADO PINTADO, CON ALETAS"), ("OPTICA", "PLACA LED + LENTES + VIDRIO TEMPLADO (*)"),
        ("PROTECCION", "IP66 (FICHA) · IK08 (*)"), ("MEDIDAS (REF.)", "575 × 312 × 93 · 42–135 W (STRAND RS 160)"), ("ACOPLE", "Ø42 O Ø60 · 2 BULONES · PASOS DE 5°"),
        ("MANGUITO", "Ø60,3 (≥ 800 mm) · Ø42,4 (MENORES)"), ("SOBRETENSION", "SPD 10 kV (*)"), ("FOTOCONTROL", "ZOCALO NEMA 7 PINES (*)"),
        ("ALIMENTACION", "Cu 3×1,5 (6001) DESDE LA CAJA"), ("FIJACION", "BULON PASANTE 4019 + 4038")], [(140, "l", False), (290, "l", False)], "DATOS TECNICOS", rowh=14)
ry = rayadosRef(h, 490, yc_ + 18, ["ALU", "VID", "MET", "GOMA", "PLAS"], cols=1, dx=180)
yu = bloque(h, 490, ry + 6, "DONDE SE USA", ["PUNTA DE CADA BRAZO (AP-C-008/017/034/040/011).", "ITEMS DE COLUMNA (INCLUIDA) Y PROV. 85.1 / 85.2.", "BARRIO: BRAZO H°G° 4501.",
            "SE PRUEBA EN EL GALPON ANTES DE MONTARLA."], w=340, sz=9.5, lh=12)
notasW(h, 40, max(yd, yu) + 20, [
    "COTAS EN mm DEL MODELO DE REFERENCIA (STRAND RS 160, FICHA DE LA APP): CADA PROVISION TIENE LAS SUYAS. VER LA HOJA DEL FABRICANTE.",
    "(*) FORMA, ALETAS, TABIQUE, DRIVER, SPD, BORNERA, LENTES Y JUNTAS: ESQUEMA. NO SE PUDO ABRIR LA FICHA DE STRAND / LUMENAC / TRIVIALTECH / IEP.",
    "(*) EL CATALOGO DEL PAÑOL TIENE 6011 Y 6012 EN «m»: DEBERIAN SER «Un.». NO SE CAMBIA SIN EL OK DE ANGEL."], w=800, lh=13)

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - LUMINARIA VIAL LED (REF.)", "EXTERIOR SOBRE EL BRAZO Ø60,3 · ABAJO: CORTE B-B POR EL EJE (RECINTO DEL DRIVER Y RECINTO OPTICO)")
A3 = img3d(h, "col_lum_ext", 895, 84, 560)
columna(h, A3, [("nema", "6", "FOTOCONTROL NEMA (*)"), ("tapaDrv", "", "TAPA DEL DRIVER + 4 TORN."), ("bulones", "4", "BULONES DEL ACOPLE"), ("aletas", "2", "ALETAS DISIPADORAS"),
                ("escala", "", "ESCALA DE INCLINACION (*)"), ("cuerpo", "1", "CUERPO DE ALUMINIO"), ("brazo", "", "BRAZO Ø60,3")], 1460, 110, 440, paso=30)
h.txt(890, 560, "CORTE B-B (3D)", 11, 700, NV, "start", INT)
B3 = img3d(h, "col_lum_corte", 895, 568, 600)
columna(h, B3, [("foto", "", "FOTOCONTROL"), ("tapa", "", "TAPA"), ("driver", "", "DRIVER (*)"), ("bulon", "", "BULON + PUENTE"), ("junta", "", "JUNTA"), ("tabique", "", "TABIQUE (*)"),
                ("aletas", "", "ALETAS"), ("placa", "", "PLACA LED (*)"), ("lente", "", "LENTES (*)"), ("vidrio", "", "VIDRIO (*)"), ("brazo", "", "BRAZO")], 1500, 580, 1000, paso=25)
pie3d(h, "", "RENDER three.js: r3d/escenas/col_lum_ext.mjs y col_lum_corte.mjs · MISMA GEOMETRIA DEL PLANO · FUENTES: r3d/FUENTES_col.md")
rotuloMat(h, "MAT-LUMINARIA_LED-1", "LUMINARIA VIAL LED", "6010 · 6011 · 6012", "ARRIBA, A-A, B-B, D1, D2 NEMA, CODIGOS Y 3D", "1:4 / 1:2", "3D S/E", rev="B", fecha="08/11/2026")
guardarCol(h, "mat_luminaria_led_1")
