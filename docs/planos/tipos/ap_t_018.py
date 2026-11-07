import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
from _taer import *
# DATOS: ficha AP-T-018: hl = 8 m, Ro 1050 daN, altura total 9,5 m, empotramiento ≈1,5 m, código 6015, ítem 13 «H = 8 m Ro1050»
#  Ø NO publicado: se mide (perímetro ÷ 3,14). Conicidad publicada 15-20 mm/m (ficha) vs 10 y 17 mm/m (AP-C-033-A/B) → contradicción
#  Variante (calculadora): poste H°A° Po 8,5 m Ro 1050 kg (6023), empotrado 0,85 m (10 %, pliego 11.02), caño de bajada 5004 Ø2" L 4 m,
#  fleje 4024 3 m (3 vueltas) + 3 hebillas 4025 (fleje 19,05 x 0,7, hebilla 1,5). Gabinete a 5 m o más. Apoya escalera H12 4012.
h = Hoja()
EXG = 2.2   # el Ø se dibuja exagerado en la elevación
# =================================================== ELEVACION
h.titulo(40, 62, "ELEVACION", "ESC. 1:60 (Ø SIN ESCALA) - COTAS EN mm")
k = 0.035; xc = 150; yg = 400
Y = lambda z: yg - z * k
r = lambda z: d_poste(z) / 2 * k * EXG
h.rect(40, yg, 260, 66, "url(#EARTH)", K, 0); h.ln(40, yg, 300, yg, K, 1.6)
h.rect(xc - r(-EMP) - 10, yg, 2 * r(-EMP) + 20, EMP * k + 6, "url(#ANSI37)", K, .5)
h.path(f"M{xc-r(-EMP)},{Y(-EMP)} L{xc-r(HL)},{Y(HL)} H{xc+r(HL)} L{xc+r(-EMP)},{Y(-EMP)} Z", "#fff", K, 1.4)
for z in range(-1400, int(HL), 600): h.ln(xc - r(z) + 2, Y(z), xc - r(z) + 2, Y(z) - 12, K, .3)
h.ln(xc, Y(HL) - 14, xc, Y(-EMP) + 10, K, .4, h.EJE)
h.nivel(46, yg, "±0,00")
# Ro en la punta (punto de aplicación a confirmar)
zr = HL - 250
h.path(f"M{xc+r(zr)},{Y(zr)} h40 M{xc+r(zr)+40},{Y(zr)} l-8,-4 v8 z", "none", K, 1.4); h.txt(xc + r(zr) + 44, Y(zr) + 4, "Ro 1050 daN", 10, 700)
h.txt(xc + r(zr) + 44, Y(zr) + 16, "A 250 DE LA PUNTA (*)", 8.5, 400, OR)
# zona del tablero y accesorios (referencia)
for z0, z1_, t in ((5000, 5530, "GABINETE (≥ 5000)"), (6100, 6150, "FOTOCONTROL (*)"), (6700, 6750, "APOYA ESCALERA (*)"), (7600, 7650, "RACK (*)")):
    h.rect(xc - r(z1_) - 22, Y(z1_), 14, (z1_ - z0) * k + 2, "none", K, .6, h.OCULTA)
    h.txt(xc - r(z1_) - 26, Y((z0 + z1_) / 2) + 3, t, 8, 400, OR if "(*)" in t else G, "end")
# cortes B-B y C-C
for z, L in ((HL - 300, "B"), (300, "C")):
    h.ln(xc + r(z) + 6, Y(z), xc + r(z) + 24, Y(z), K, .8, h.EJE); h.ln(xc - r(z) - 4, Y(z), xc - r(z) - 4, Y(z), K, 1)
    h.ln(xc + r(z) + 24, Y(z) - 6, xc + r(z) + 24, Y(z) + 6, K, 1.8); h.ln(xc - r(z) - 9, Y(z) - 6, xc - r(z) - 9, Y(z) + 6, K, 1.8)
    h.txt(xc + r(z) + 28, Y(z) + 4, L, 12, 700)
h.dimV(262, Y(HL), yg, "hl 8000", ext=xc + r(HL) + 4); h.dimV(262, yg, Y(-EMP), "≈1500", ext=xc + r(-EMP) + 4)
h.dimV(290, Y(HL), Y(-EMP), "TOTAL 9500", ext=None)
h.globo("1", xc + r(3000), Y(3000), 220, Y(2600)); h.globo("7", xc, Y(-800), 220, Y(-500))
# =================================================== CORTES B-B / C-C
h.titulo(330, 62, "CORTES B-B Y C-C", "ESC. 1:5 - Ø Y PARED NO PUBLICADOS (*)")
for i, (z, L) in enumerate(((HL - 300, "B-B (PUNTA)"), (300, "C-C (AL PISO)"))):
    kb = 0.42; cx = 395 + i * 135; cy = 190; R = d_poste(z) / 2 * kb; e = 8 * kb * 1.6
    h.circ(cx, cy, R, "url(#ANSI31)", K, 1.2); h.circ(cx, cy, R - e, "#fff", K, .6)
    for a in range(0, 360, 30): h.ln(cx + (R - e) * math.cos(math.radians(a)), cy + (R - e) * math.sin(math.radians(a)), cx + R * math.cos(math.radians(a)), cy + R * math.sin(math.radians(a)), K, .25)
    h.ln(cx - R - 10, cy, cx + R + 10, cy, K, .4, h.EJE); h.ln(cx, cy - R - 10, cx, cy + R + 10, K, .4, h.EJE)
    h.dimH(cy - R - 18, cx - R, cx + R, "Ø (*)", ext=cy - 4, c=OR)
    h.txt(cx, cy + R + 22, L, 10, 700, K, "middle"); h.txt(cx, cy + R + 35, "PARED (*)", 8.5, 400, OR, "middle")
h.txt(335, 300, "PRFV RAL 7043, VETA DE FIBRA A LO LARGO.", 8.5, 400)
h.txt(335, 312, "SE MIDE EN OBRA: Ø = PERIMETRO ÷ 3,14.", 8.5, 700)
# =================================================== CONICIDAD
cn = [("FUENTE", "CONICIDAD"), ("FICHA AP-T-018", "15 A 20 mm/m"), ("AP-C-033-A (7 m)", "10 mm/m"), ("AP-C-033-B (10 m)", "17 mm/m")]
h.tabla(610, 76, [(120, "l", False), (100, "c", True)], cn, rowh=18, titulo="CONICIDAD (NO COINCIDEN) (*)", colores=lambda i, j, t: OR if i == 1 else K)
h.txt(612, 178, "EJEMPLO (SOLO PARA EL DIBUJO):", 8.5, 700, OR)
h.txt(612, 191, "PUNTA Ø130 (*) + 15 mm/m x 8 m", 8.5, 400, OR, "start", MONO); h.txt(612, 203, "= Ø250 AL PISO (*)", 8.5, 400, OR, "start", MONO)
h.txt(612, 220, "→ NO USAR PARA PEDIR ABRAZADERAS:", 8.5, 700); h.txt(612, 232, "   MEDIR A LA ALTURA DE MONTAJE.", 8.5, 400)
# =================================================== D1 EMPOTRAMIENTO
h.titulo(330, 340, "D1 - EMPOTRAMIENTO", "ESC. 1:30 - HOYO Y RELLENO S/ PLANO (*)")
kd = 0.06; ex, eg = 440, 416
Ye = lambda z: eg - z * kd
re_ = lambda z: d_poste(z) / 2 * kd
hw = 300 * kd                                    # medio ancho del hoyo (*)
h.rect(345, eg, 230, EMP * kd + 26, "url(#EARTH)", K, 0); h.ln(345, eg, 575, eg, K, 1.6)
h.rect(ex - hw, eg, 2 * hw, EMP * kd + 10, "url(#ANSI37)", K, .8)
h.path(f"M{ex-re_(-EMP)},{Ye(-EMP)} L{ex-re_(500)},{Ye(500)} H{ex+re_(500)} L{ex+re_(-EMP)},{Ye(-EMP)} Z", "#fff", K, 1.2)
corte_quiebre(h, ex - 26, ex + 26, Ye(500) - 2)
h.rect(ex - hw, Ye(-EMP), 2 * hw, 10, "url(#CONCP)", K, .6)
h.dimV(ex + hw + 18, eg, Ye(-EMP), "≈1500", ext=ex + re_(-EMP) + 2)
h.dimH(eg - 40, ex - hw, ex + hw, "HOYO (*)", ext=eg - 2, c=OR)
h.rect(ex + hw + 30, eg + 20, 86, 26, "#fff", None, 0); h.txt(ex + hw + 34, eg + 30, "RELLENO", 8.5, 700, OR); h.txt(ex + hw + 34, eg + 42, "COMPACTADO (*)", 8.5, 400, OR)
h.rect(ex + hw + 30, Ye(-EMP) - 2, 50, 13, "#fff", None, 0); h.txt(ex + hw + 34, Ye(-EMP) + 8, "BASE (*)", 8.5, 700, OR)
h.globo("7", ex - re_(-700), Ye(-700), 370, eg + 30); h.globo("8", ex - hw + 4, eg + 70, 370, eg + 70)
# =================================================== D2 COMO SE MIDE
h.titulo(610, 270, "D2 - COMO SE MIDE EL Ø", "EN EL PUNTO DE MONTAJE")
mx, my = 660, 330
h.a(f'<ellipse cx="{mx}" cy="{my}" rx="36" ry="11" fill="#fff" stroke="#111"/>'); h.path(f"M{mx-36},{my} V{my+60} M{mx+36},{my} V{my+60}", "none", K, 1)
h.a(f'<ellipse cx="{mx}" cy="{my+26}" rx="37.5" ry="11.5" fill="none" stroke="#c2410c" stroke-width="3"/>')
h.txt(mx + 46, my + 2, "CINTA: P", 9, 700); h.txt(mx + 46, my + 16, "Ø = P ÷ 3,14", 10.5, 700, K, "start", MONO)
h.txt(mx + 46, my + 30, "EJ. 754 ÷ 3,14 = 240", 9, 400, G, "start", MONO); h.txt(mx + 46, my + 44, "→ SEMIABRAZADERA", 9, 400, G, "start", MONO)
h.txt(mx + 46, my + 56, "  201-300 (AP-T-012)", 9, 400, G, "start", MONO)
# =================================================== VARIANTE H°A°
h.titulo(40, 545, "VARIANTE: POSTE H°A° 8,5 m", "S/E - OPCION DE LA CALCULADORA")
kv = 0.025; vx = 100; vg = 790
Yv = lambda z: vg - z * kv
h.rect(40, vg, 250, 26, "url(#EARTH)", K, 0); h.ln(40, vg, 290, vg, K, 1.6)
h.path(f"M{vx-7},{Yv(-850)} L{vx-4},{Yv(7650)} H{vx+4} L{vx+7},{Yv(-850)} Z", "url(#CONC)", K, 1.1)
h.rect(vx + 8, Yv(3500), 5, 4000 * kv, "#fff", K, .9)       # caño de bajada 4 m, al costado
for z in (700, 1900, 3100): h.rect(vx - 7, Yv(z) - 1.5, 21, 3, K, K, 0)
h.rect(vx + 10, Yv(5530), 14, 530 * kv, GAB_T, K, .8)
h.dimV(70, Yv(7650), vg, "Po ≈ 7650 LIBRE", ext=vx - 6); h.dimV(70, vg, Yv(-850), "850", ext=vx - 8)
h.txt(vx + 30, Yv(4000), "CAÑO DE BAJADA", 8.5, 700); h.txt(vx + 30, Yv(4000) + 11, "Ø2\" L = 4 m (5004)", 8.5, 400)
h.txt(vx + 30, Yv(1900), "FLEJE 3/4\" INOX (4024)", 8.5, 700); h.txt(vx + 30, Yv(1900) + 11, "3 VUELTAS + 3 HEBILLAS", 8.5, 400)
h.txt(vx + 30, Yv(1900) + 22, "(4025)", 8.5, 400)
h.txt(46, vg + 40, "EMPOTRADO 0,85 m = 10 % DE 8,5 m (PLIEGO 11.02).", 8.5, 400)
# D3 fleje
h.titulo(320, 545, "D3 - FLEJE Y HEBILLA", "ESC. 2:1 - SOLO EN LA VARIANTE")
fx, fy = 340, 610; kf = 3.0
h.rect(fx, fy, 19.05 * kf, .7 * kf * 2, "url(#ANSI31)", K, 1)
h.dimH(fy - 14, fx, fx + 19.05 * kf, "19,05 (3/4\")", ext=fy - 2)
h.dimV(fx + 19.05 * kf + 18, fy, fy + .7 * kf * 2, "0,7", ext=fx + 19.05 * kf + 4)
h.rect(fx, fy + 40, 19.05 * kf + 20, 34, "url(#galv)", K, .9, 'rx="3"'); h.rect(fx + 8, fy + 48, 19.05 * kf + 4, 18, "#fff", K, .6)
h.txt(fx, fy + 92, "HEBILLA AISI 304, ESPESOR 1,5", 8.5, 400); h.txt(fx, fy + 104, "FLEJE ROTURA ≈ 7,5 kN", 8.5, 400)
# comparación
cmp_ = [("", "PRFV (HOY)", "H°A° (VARIANTE)"), ("CODIGO", "6015", "6023"), ("ALTURA", "hl 8 / TOTAL 9,5 m", "Po 8,5 m"),
        ("EMPOTRAMIENTO", "≈ 1,5 m", "0,85 m"), ("Ro", "1050 daN", "1050 kg"), ("CAÑO DE BAJADA", "NO", "SI (5004)"),
        ("FLEJE + HEBILLAS", "NO", "3 m + 3"), ("ESPUMA + BABERO", "SI (AP-T-015)", "NO"), ("ITEM", "13", "S/ PLIEGO 11.02")]
h.tabla(530, 559, [(100, "l", False), (105, "c", False), (105, "c", False)], cmp_, rowh=18, titulo="PRFV CONTRA H°A°")
# =================================================== COMPUTO
rows = [("APOYO PRFV hl 8 m Ro 1050", "1", "1 POR TABLERO AEREO (ITEM 13)"), ("APOYA ESCALERA H12", "1", "REF. 11 DEL AP-T-019"),
        ("EXCAVACION DEL HOYO", "(*)", "≈1,5 m DE PROFUNDIDAD; ANCHO S/ PLANO"), ("RELLENO / BASE", "(*)", "S/ PLANO OFICIAL"),
        ("MEDIDA DEL Ø", "1", "EN OBRA, A LA ALTURA DE CADA ABRAZADERA")]
h.tabla(40, 860, [(170, "l", False), (50, "c", True), (260, "l", False)], [("CONCEPTO", "CANT.", "CALCULO")] + rows, rowh=17,
        titulo="COMPUTO POR TABLERO AEREO", colores=lambda i, j, t: OR if "(*)" in t else K)
h.rayados(560, 880, [("ANSI37", "RELLENO"), ("EARTH", "TERRENO"), ("CONC", "H°A°"), ("ANSI31", "PRFV (CORTE)")], cols=2, dx=140)
# =================================================== NOTAS
h.notas(40, 1000, [
    "COTAS EN mm. APOYO PRFV hl 8 m, Ro 1050 daN, ALTURA TOTAL 9,5 m, EMPOTRAMIENTO ≈1,5 m (CODIGO 6015, ITEM 13 DEL ANEXO I).",
    "SOSTIENE EL TABLERO AEREO (AP-T-019): GABINETE A 5 m O MAS (AP-T-012), RACK, FOTOCONTROL Y APOYA ESCALERA H12.",
    "EL Ø NO LO PUBLICA NINGUN FABRICANTE NI EL PLANO: SE MIDE EL PERIMETRO Y SE DIVIDE POR 3,14 PARA ELEGIR ABRAZADERAS.",
    "(*) CONICIDAD: LA FICHA DICE 15-20 mm/m Y LOS AP-C-033-A/B USAN 10 Y 17 mm/m. CONFIRMAR CON EL FABRICANTE.",
    "(*) A CONFIRMAR CON EL PLANO OFICIAL: HOYO, RELLENO, BASE, PARED, PUNTO DE APLICACION DE Ro Y ALTURAS DE LOS ACCESORIOS.",
    "VARIANTE: POSTE H°A° Po 8,5 m (6023) EMPOTRADO 0,85 m, CON CAÑO DE BAJADA, FLEJE Y HEBILLAS; SIN ESPUMA NI BABERO."])
# =================================================== 3D
h.titulo(890, 62, "VISTA 3D - APOYO PRFV EMPOTRADO", "TERRENO CORTADO POR EL EJE; CINTA DE MEDIR A LA ALTURA DEL GABINETE")
h.iso(.042, 1180, 470)
h.BOX(-1100, 0, -1100, 1100, -2000, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
h.F3([(0, -300, -1550), (0, 300, -1550), (0, 300, 0), (0, -300, 0)], "#c9b79a", "#7a6a4f", .7)        # relleno del hoyo (*)
h.F3([(0, -300, -1650), (0, 300, -1650), (0, 300, -1550), (0, -300, -1550)], "url(#concP3)", "#7a6a4f", .6)
h.BOX(0, 1100, 300, 1100, -60, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
pole3d(h, 0, 0, -EMP, HL)
# cinta a 5 m y anillo de Ro
anillo3d(h, 0, 0, 5200, d_poste(5200) / 2 + 4, 3.5, "#c2410c", "#7a2a08")
p = h.P(0, 0, HL - 250); h.path(f"M{p[0]+8},{p[1]} h56 M{p[0]+64},{p[1]} l-9,-5 v10 z", "#1d2160", NV, 2)
h.txt(p[0] + 70, p[1] + 4, "Ro 1050 daN", 11, 700, NV)
h.txt(900, 122, "Ø Y CONICIDAD DEL DIBUJO:", 10, 700, OR); h.txt(900, 136, "SOLO ILUSTRATIVOS (*)", 10, 700, OR)
GX = 1470
h.g3("1", (0, d_poste(7000) / 2, 7000), GX, 170, "APOYO PRFV hl 8 m (RAL 7043)")
h.g3("9", (0, d_poste(5200) / 2 + 4, 5200), GX, 230, "CINTA: Ø = P ÷ 3,14")
h.g3("10", (0, d_poste(0) / 2, 0), GX, 330, "NIVEL ±0,00 (PISO)")
h.g3("7", (0, d_poste(-800) / 2, -800), GX, 390, "EMPOTRAMIENTO ≈1,5 m")
h.g3("8", (0, 200, -1100), GX, 450, "RELLENO DEL HOYO (*)")
h.g3("11", (0, 200, -1600), GX, 510, "BASE (*)")
# =================================================== LISTA
L = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
     ("1", "POSTE / APOYO DE PRFV hl = 8 m, Ro 1050 daN (TOTAL 9,5 m)", "1", "6015"),
     ("2", "APOYA ESCALERA H12 CON HERRAJES (AP-T-019 REF. 11)", "1", "4012"),
     ("7", "EMPOTRAMIENTO ≈ 1,5 m (EXCAVACION)", "1", "-"),
     ("8", "RELLENO DEL HOYO (*)", "(*)", "A VINCULAR"),
     ("11", "BASE DEL HOYO (*)", "(*)", "A VINCULAR"),
     ("V1", "VARIANTE: POSTE H°A° PRETENSADO Po 8,5 m Ro 1050 kg", "1", "6023"),
     ("V2", "VARIANTE: CAÑO DE BAJADA DOBLE AISLACION Ø2\" L 4 m", "1", "5004"),
     ("V3", "VARIANTE: FLEJE ACERO INOX. AISI 304 3/4\"", "3 m", "4024"),
     ("V4", "VARIANTE: HEBILLA ACERO INOX. AISI 304 3/4\"", "3", "4025")]
h.tabla(890, 580, [(40, "c", False), (470, "l", False), (90, "c", True), (150, "c", False)], L, rowh=24, titulo="LISTA DE MATERIALES (1 APOYO)",
        colores=lambda i, j, t: OR if ("(*)" in t or t == "A VINCULAR") else K)
h.rotulo(890, h.H - 150, 750, "AP-T-018", "APOYO (POSTE) DE PRFV", "PARA TABLERO AEREO", "ELEVACION, CORTES, EMPOTRAMIENTO, VARIANTE H°A° Y 3D", "1:60 / 1:5", "D1 1:30, 3D S/E", fecha="07/11/2026")
h.guardar("ap_t_018.svg"); print("ok")
