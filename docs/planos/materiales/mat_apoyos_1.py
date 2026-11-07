"""MAT-APOYOS-1 · Apoyo (poste) de PRFV hl 8 m Ro 1050 daN para el tablero (6015) + apoya escalera H 12 con herrajes (4012).
Datos: FICHAS_TEC.apoyos (6015: total 9,5 m, empotr. ≈ 1,5 m; 4012 AP-T-019 ref. 11), FAMILIAS_MAT.apoyos, Normas AP-T-018 (Ø NO publicado:
se mide perímetro ÷ 3,14; conicidad publicada de los postes PRFV 15 a 20 mm/m; ítem 13 del Anexo I), AP-T-019 (gabinete a 5 m o más, tiro flojo,
poste a 2,50 m del cordón, sellado nota 2), AP-T-012 (abrazaderas del gabinete). El apoya escalera no tiene medidas en la app: ESQUEMA (*)."""
from ilukit import *
h = nueva(); m = h.m

# ======================= ELEVACION (1:100 → 0,04 px/mm)
k = .042; X, YG = 175, 470
h.titulo(40, 62, "ELEVACION - APOYO PRFV 8 m (6015)", "ESC. 1:100 - COTAS EN mm - Ø DIBUJADO 2× (*)")
LT, LL, LE = 9500, 8000, 1500
yb = YG + LE * k; yt = yb - LT * k
rb, rt = 260 / 2 * k * 2, (260 - 17.5 * 9.5) / 2 * k * 2          # Ø base ≈ 260 (*), conicidad 17,5 mm/m (*)
h.ln(40, YG, 440, YG, K, 1.4); h.nivel(420, YG, "±0,00")
for xx in range(44, 440, 9): h.ln(xx, YG + 1, xx - 6, YG + 7, K, .4)
h.path(f"M{X-rb},{yb} L{X-rt},{yt} L{X+rt},{yt} L{X+rb},{yb} Z", "#fff", K, 1.4)
h.ln(X, yt - 10, X, yb + 10, K, .4, h.EJE)
yg = YG - 5000 * k
h.rect(X + rb * .8, yg - 530 * k, 200 * k * 1.4, 530 * k, "#fff", K, .8, 'stroke-dasharray="4 2"'); h.txt(X + rb + 22, yg - 30, "GABINETE", 9, 400, G)
ye = YG - 2500 * k; h.rect(X - rb - 9, ye - 14, 9, 28, "#fff", OR, 1.2)                       # apoya escalera (*)
yr = YG - 7400 * k; h.rect(X - 4, yr - 3, 8, 6, "#111", K, .4)                                  # rack (*)
h.dimV(X - 70, yt, yb, "TOTAL 9.500", ext=X - rt - 3)
h.dimV(X - 48, yt, YG, "LIBRE 8.000", ext=X - rt - 3)
h.dimV(X - 48, YG, yb, "≈1.500", ext=X - rb - 3)
h.dimV(X + 60, yg, YG, "≥ 5.000", ext=X + rb * .8)
h.dimV(X + 90, ye, YG, "(*)", ext=X + 6, c=OR)
h.txt(X, yb + 22, "Ø: SE MIDE (*)", 10, 700, OR, "middle")
h.globo("1", X + 1, YG - 1500 * k, 60, 300); h.globo("2", X - rb - 5, ye, 60, 380, OR); h.globo("3", X + rb + 10, yg - 200 * k, 290, 160)
h.globo("4", X, yr, 290, 110, OR)
corteMarca(h, X - 30, YG - 500 * k, X + 30, YG - 500 * k, "A")

# ======================= CORTE A-A · COMO SE MIDE EL Ø
h.titulo(470, 62, "CORTE A-A · EL Ø SE MIDE", "ESC. 1:5 - PERIMETRO CON CINTA ÷ 3,14")
cx, cy, r = 560, 210, 66
h.circ(cx, cy, r, "#111", K, 1.4); h.circ(cx, cy, r - 5, "#fff", K, .7)
h.circ(cx, cy, r + 7, "none", OR, 1.2, 'stroke-dasharray="6 3"'); flecha(h, cx + r + 7, cy + 4, cx + r + 7, cy - 4, OR)
h.dimH(cy + r + 30, cx - r, cx + r, "Ø = PERIMETRO ÷ 3,14", ext=cy + 6)
h.txt(cx + r + 16, cy - r + 8, "CINTA", 10, 700, OR)
h.txt(470, cy + r + 64, "EL Ø DEL APOYO NO LO PUBLICA NINGUN FABRICANTE NI EL PLANO:", 9.5, 400)
h.txt(470, cy + r + 78, "LA CALCULADORA TE LO PIDE PARA ELEGIR LAS ABRAZADERAS.", 9.5, 400)
h.txt(470, cy + r + 92, "PUBLICADO: CONICIDAD DE LOS POSTES PRFV 15 A 20 mm/m.", 9.5, 400)

# ======================= D1 · APOYA ESCALERA H 12 (ESQUEMA)
h.titulo(470, 400, "D1 · APOYA ESCALERA H 12 (4012)", "ESQUEMA (*) - VISTA DE COSTADO Y DE FRENTE")
ax, ay = 520, 520
h.rect(ax - 20, ay - 90, 22, 180, "url(#fibra)", K, 1)                                         # poste
h.rect(ax + 2, ay - 6, 120, 12, "url(#STEEL)", K, 1.2); h.rect(ax + 110, ay - 30, 12, 60, "url(#STEEL)", K, 1.2)
h.path(f"M{ax+2},{ay+36} L{ax+80},{ay+6}", "none", K, 3)
for yy in (ay - 2, ay + 36): h.rect(ax - 24, yy - 6, 30, 12, "#fff", K, .9)
h.dimH(ay - 46, ax + 2, ax + 122, "≈ 300 (*)", ext=ay - 34, c=OR)
fx = 720
h.rect(fx - 70, ay - 30, 140, 12, "url(#STEEL)", K, 1.2); h.rect(fx - 70, ay - 30, 12, 60, "url(#STEEL)", K, 1.2); h.rect(fx + 58, ay - 30, 12, 60, "url(#STEEL)", K, 1.2)
h.circ(fx, ay + 26, 22, "url(#fibra)", K, 1)
h.txt(fx, ay + 74, "DE FRENTE: TOPE EN «U» (*)", 9, 400, OR, "middle"); h.txt(ax + 50, ay + 74, "DE COSTADO (*)", 9, 400, OR, "middle")

# ======================= TABLAS
y2 = h.codigos(40, 625, [6015, 4012], extra={6015: "1 por tablero aéreo · ítem 13", 4012: "AP-T-019 ref. 11"}, wx=210)
h.datos(40, y2 + 30, [("MATERIAL", "PRFV (poliéster + fibra de vidrio)"), ("ALTURA LIBRE", "8,0 m (hl)"), ("LARGO TOTAL", "9,5 m"),
        ("EMPOTRAMIENTO", "≈ 1,5 m"), ("CARGA DE ROTURA", "Ro 1050 daN"), ("Ø", "no publicado: se mide (*)"),
        ("CONICIDAD", "15 a 20 mm/m (publicado)"), ("DIST. AL CORDON", "2,50 m (AP-T-019, nota 8)")], w=420, c1=130)
textoBloque(h, 485, y2 + 30, "DONDE SE USA", [
    "· AP-T-018: el poste del tablero aéreo,",
    "   1 apoyo por tablero (ítem 13).",
    "· AP-T-019: acometida desde tiro flojo,",
    "   rack, fotocontrol y apoya escalera (ref. 11).",
    "· AP-T-012: sujeción del gabinete (Ø medido).",
    "· AP-T-015: sellado del orificio de entrada.",
    "· Con apoyo PRFV NO va caño de bajada."], sz=10, dy=15)
h.notas(40, 1040, [
    "COTAS EN mm. GABINETE A 5 m O MAS DEL PISO, PUERTA HACIA EL ESPACIO VERDE (AP-T-019). TIRO FLOJO ≤ 10 m.",
    "(*) Ø DIBUJADO ≈ 260 EN LA BASE CON 17,5 mm/m SOLO PARA EL DIBUJO: EN OBRA SE MIDE (PERIMETRO ÷ 3,14).",
    "(*) APOYA ESCALERA: SIN MEDIDAS EN LA APP; ALTURA, FORMA Y HERRAJES A CONFIRMAR CON EL FABRICANTE / AP-T-019.",
    "(*) ALTURA DEL RACK Y DEL FOTOCONTROL: A CONFIRMAR (AP-T-019). FUENTE: LP 21478 (AP-T-018 / 019), CATALOGO DEL PAÑOL."])

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - APOYO PRFV 8 m CON SU TABLERO", "PRFV RAL 7043 (*) · GABINETE A ≥ 5 m · APOYA ESCALERA (*) · SUELO A UN CUARTO")
h.iso(.075, 1060, 830)
B = 400
m.box(-B, 0, -B, B, -1600, 0, "#c9a77c", pat="soil3", edge="#6b5236"); m.box(0, B, -B, 0, -1600, 0, "#c9a77c", pat="soil3", edge="#6b5236"); m.render()
ringZ(m, 0, 130, -1500, 0, "prfv", bias=60); m.render()
m.box(-B - 400, -B, -B - 400, B + 400, -40, 0, "#5a9e3a", pat="grass", edge="#3d6b27"); m.box(-B, B + 400, -B - 400, -B, -40, 0, "#5a9e3a", pat="grass", edge="#3d6b27"); m.render()
m.cyl([0, 0, 0], [0, 0, 8000], 130 - 17.5 * 1.5 / 2 * 0, "prfv", n=30, r1=130 - 17.5 * 9.5 / 2, seg=14, pat="fibra", capmat="#6f7472"); m.render()
# gabinete 530 × 430 × 200 en la cara +x
gz = 5000; m.box(110, 310, -215, 215, gz, gz + 530, "prfvGab", edge="#666"); m.render()
for z in (gz + 120, gz + 410): m.ring([0, 0, z], [1, 0, 0], [0, 1, 0], [0, 0, 1], 110, 118, -20, 20, -60, 240, "galv", n=30); m.render()
# apoya escalera (*) en la cara +y
m.box(-60, 60, 105, 420, 2480, 2520, "galv", edge="#555"); m.box(-120, 120, 400, 440, 2400, 2560, "galv", edge="#555"); m.render()
# rack y fotocontrol (referencia)
m.box(-30, 30, -30, 120, 7400, 7460, "galv", edge="#555"); m.render()
m.cyl([0, 0, 7980], [0, 0, 8060], 42, "#e6e2c8", n=20, capmat="#f3efd6"); m.render()
h.g3("1", (0, 0, 3500), 1250, 470, "APOYO PRFV hl 8 m (6015)")
h.g3("3", (310, 0, gz + 300), 1250, 300, "GABINETE PRFV (VER MAT-TABLERO-1)")
h.g3("2", (0, 420, 2500), 1250, 560, "APOYA ESCALERA H 12 (4012) (*)", OR)
h.g3("4", (0, 120, 7430), 1250, 200, "RACK DE ACOMETIDA (*)", OR)
h.g3("5", (0, 0, 8040), 1250, 160, "FOTOCONTROL (VER MAT-FOTOCONTROL-1)")
h.g3("6", (-200, 380, -900), 1250, 760, "EMPOTRAMIENTO ≈ 1,5 m")
h.rotulo(890, h.H - 150, 750, "MAT-APOYOS-1", "APOYO PRFV 8 m Ro 1050", "Y APOYA ESCALERA H 12", "ELEVACION, MEDICION DEL Ø, ESQUEMA, CODIGOS Y 3D", "1:100 / 1:5", "D1 S/E · 3D S/E")
guardar(h, "mat_apoyos_1")
