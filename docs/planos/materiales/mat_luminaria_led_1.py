"""MAT-LUMINARIA_LED-1 · Luminaria vial LED (6010 provista por la Municipalidad, 6011 200 W, 6012 Philips 76 / 100 W).
Datos: FICHAS_TEC.luminaria_led pieza 1 (aluminio inyectado, módulo LED, vidrio templado, IP66, acople Ø42 / Ø60 inclinación regulable; medidas
del modelo de referencia 575 × 312 × 93 mm, 42–135 W, Strand RS 160; manguito Ø60,3 ≥ 800 mm / Ø42,4 menores), plano() de la ficha (vista de
arriba 575 × 312, lateral 93, «inclinación en pasos de 5°», «acople Ø42 / Ø60»), FAMILIAS_MAT.luminaria_led, hoja aprobada AP-C-008 (manguito
63±1, empotramiento 100-200, bulón pasante 4019 + 4038)."""
from ilukit import *
h = nueva(); m = h.m
POLY = [(0, -50), (150, -156), (575, -156), (575, 156), (150, 156), (0, 50)]      # planta del modelo de referencia (forma (*))

# ======================= VISTA DE ARRIBA (1:4 → 1 px/mm × 0,62)
s = .6; X0, YC = 115, 230
h.titulo(40, 62, "VISTA DE ARRIBA", "ESC. 1:6 - MODELO DE REFERENCIA (*) - 575 × 312")
h.path("M" + " L".join(f"{X0 + a * s:.1f},{YC + b * s:.1f}" for a, b in POLY) + " Z", "#fff", K, 1.5)
h.rect(X0 + 20 * s, YC - 30 * s, 100 * s, 60 * s, "#fff", K, .7, h.OCULTA)                     # cámara del acople
for i in range(6): h.ln(X0 + (230 + i * 52) * s, YC - 120 * s, X0 + (230 + i * 52) * s, YC + 120 * s, K, .4)   # aletas (*)
h.ln(X0 - 60, YC, X0 + 600 * s, YC, K, .4, h.EJE)
h.rect(X0 - 60, YC - 30.15 * s, 60 + 20 * s, 60.3 * s, "#fff", K, 1)                           # brazo entrando
h.dimH(YC - 156 * s - 26, X0, X0 + 575 * s, "575 (REF.)", ext=YC - 156 * s - 4)
h.dimV(X0 + 575 * s + 24, YC - 156 * s, YC + 156 * s, "312 (REF.)", ext=X0 + 577 * s)
h.txt(X0 + 228 * s, YC + 140 * s, "ALETAS DE DISIPACION (*)", 9.5, 400, OR)
h.globo("1", X0 + 300 * s, YC - 60 * s, X0 + 300 * s + 20, YC - 156 * s - 56 + 20 if False else 120)
h.globo("2", X0 + 60 * s, YC, X0 + 60 * s, YC + 156 * s + 46)
h.globo("6", X0 - 30, YC, X0 - 20, YC - 70)
corteMarca(h, X0 + 450 * s, YC - 156 * s - 10, X0 + 450 * s, YC + 156 * s + 10, "A")

# ======================= VISTA LATERAL
h.titulo(40, 400, "VISTA LATERAL", "ESC. 1:6 - INCLINACION EN PASOS DE 5° (FICHA)")
YL = 500
h.path(f"M{X0},{YL-40*s} L{X0+150*s},{YL-50*s} L{X0+575*s},{YL-46*s} L{X0+575*s},{YL+43*s} L{X0},{YL+30*s} Z", "#fff", K, 1.5)
h.rect(X0 + 160 * s, YL + 35 * s, 400 * s, 8 * s, "url(#PLAS)", K, .8)                        # vidrio templado
h.rect(X0 - 60, YL - 30.15 * s, 60 + 20 * s, 60.3 * s, "#fff", K, 1)
h.dimV(X0 + 575 * s + 24, YL - 50 * s, YL + 43 * s, "93", ext=X0 + 577 * s)
for g in (-15, -10, -5, 0, 5, 10, 15):
    a = math.radians(g); h.ln(X0 - 30, YL, X0 - 30 - 46 * math.cos(a), YL + 46 * math.sin(a), K if g == 0 else G, .5 if g else .8)
h.txt(X0 - 75, YL - 34, "PASOS DE 5° (*)", 9, 400, OR)
h.globo("3", X0 + 360 * s, YL + 39 * s, X0 + 360 * s, YL + 80); h.txt(X0 + 360 * s + 16, YL + 84, "VIDRIO TEMPLADO", 9.5, 400)

# ======================= CORTE A-A (ESQUEMA)
h.titulo(500, 62, "CORTE A-A (ESQUEMA)", "ESC. 1:3 - CUERPO, MODULO LED, VIDRIO")
cx, cy = 660, 220
w, hh = 312 * .48, 93 * .9
h.path(f"M{cx-w/2},{cy+hh/2} L{cx-w/2},{cy-hh/2+12} Q{cx},{cy-hh/2-14} {cx+w/2},{cy-hh/2+12} L{cx+w/2},{cy+hh/2} Z", "url(#STEEL)", K, 1.4)
h.rect(cx - w / 2 + 10, cy + hh / 2 - 26, w - 20, 16, "#fff", K, .9)
for i in range(8): h.rect(cx - w / 2 + 18 + i * 16, cy + hh / 2 - 22, 8, 6, "#111", K, .3)
h.rect(cx - w / 2 + 6, cy + hh / 2 - 6, w - 12, 6, "url(#PLAS)", K, .8)
h.globo("4", cx - 40, cy + hh / 2 - 19, cx - 120, cy + 90); h.txt(cx - 104, cy + 94, "MODULO LED", 9.5, 400)
h.globo("3", cx + 30, cy + hh / 2 - 3, cx + 110, cy + 90)
h.globo("1", cx + 20, cy - 20, cx + 60, cy - 88); h.txt(cx + 76, cy - 84, "ALUMINIO INYECTADO", 9.5, 400)
h.dimH(cy - hh / 2 - 30, cx - w / 2, cx + w / 2, "312", ext=cy - hh / 2)
h.dimV(cx - w / 2 - 20, cy - hh / 2 - 6, cy + hh / 2, "93", ext=cx - w / 2 - 2)

# ======================= D1 · ACOPLE AL BRAZO
h.titulo(500, 400, "D1 · ACOPLE AL BRAZO", "ESC. 1:3 - MANGUITO Ø60,3 / Ø42,4")
ax, ay = 520, 500
h.rect(ax, ay - 20, 110, 40, "#fff", K, 1.2); h.rect(ax + 110, ay - 34, 180, 68, "url(#STEEL)", K, 1.2)
h.rect(ax + 110, ay - 21, 75, 42, "#fff", K, 1)
h.rect(ax + 150, ay - 46, 8, 92, "#fff", K, 1)
h.dimV(ax - 12, ay - 20, ay + 20, "Ø60,3 / 42,4", ext=ax - 2)
h.dimH(ay + 62, ax + 110, ax + 185, "100-200", ext=ay + 22)
h.globo("5", ax + 154, ay - 46, ax + 210, ay - 70); h.txt(ax + 226, ay - 66, "BULON 4019 + 4038", 9.5, 400)
h.globo("6", ax + 50, ay, ax + 50, ay - 60)

# ======================= TABLAS
y2 = h.codigos(40, 625, [6010, 6011, 6012], extra={6010: "según provisión", 6011: "200 W · UN. «m» (*)", 6012: "76 / 100 W · UN. «m» (*)"}, wx=180)
h.datos(40, y2 + 30, [("CUERPO", "aluminio inyectado"), ("OPTICA", "módulo LED + vidrio templado"), ("PROTECCION", "IP66"),
        ("MEDIDAS (REF.)", "575 × 312 × 93 mm · 42–135 W"), ("ACOPLE", "Ø42 o Ø60, inclinación regulable"),
        ("MANGUITO", "Ø60,3 (≥ 800 mm) · Ø42,4 (menores)"), ("ALIMENTACION", "Cu 3×1,5 (6001) desde la caja"),
        ("FIJACION", "bulón pasante 4019 + 4038")], w=420, c1=120)
textoBloque(h, 485, y2 + 30, "DONDE SE USA", [
    "· En la punta de cada brazo del vínculo",
    "   (AP-C-008, 017, 034, 040, 011).",
    "· Ítems de columna (luminaria incluida) y",
    "   provisión 85.1 LED 75 W / 85.2 LED 180 W.",
    "· Barrio: brazo H°G° 4501 (AP-TC-055).",
    "· Se prueba en el galpón antes de montarla.",
    "· Prensacable 3/4\" (5029) por luminaria."], sz=10, dy=15)
h.notas(40, 1040, [
    "COTAS EN mm. LAS MEDIDAS SON DE UN MODELO DE REFERENCIA (STRAND RS 160): CADA MODELO TIENE LAS SUYAS, VER LA HOJA DEL FABRICANTE.",
    "(*) FORMA EN PLANTA, ALETAS Y PASOS DE INCLINACION DIBUJADOS COMO ESQUEMA: A CONFIRMAR CON EL FABRICANTE DE CADA PROVISION.",
    "(*) EL CATALOGO DEL PAÑOL TIENE 6011 Y 6012 EN «m»: DEBERIAN SER «Un.». NO SE CAMBIA SIN EL OK DE ANGEL.",
    "FUENTE: FOLLETO STRAND RS 160, PLIEGO LP 21478, FICHA TECNICA DE LA APP Y CATALOGO DEL PAÑOL."])

# ======================= 3D
def lum(m, flip=False):
    sg = -1 if flip else 1
    A = [[a, b, 0] for a, b in POLY]; B = [[a, b, sg * 70] for a, b in POLY]
    Bt = [[a * .96 + 10, b * .9, sg * 93] for a, b in POLY]
    m.face(A, "alu", 0, "#6d747a")
    for i in range(len(A)):
        j = (i + 1) % len(A); m.face([A[i], A[j], B[j], B[i]], "alu", 0, "#6d747a"); m.face([B[i], B[j], Bt[j], Bt[i]], "alu", 0, "#6d747a")
    m.face(Bt, "alu", 0, "#6d747a"); m.render()
    if not flip:
        for i in range(6):
            xx = 230 + i * 52; m.box(xx, xx + 10, -120, 120, 93, 108, "alu", edge="#6d747a")
        m.render()
    else:
        m.face([[160, -130, 1], [560, -130, 1], [560, 130, 1], [160, 130, 1]], "#2a3a48", 5, "#111")           # vidrio
        m.render()
        for r in range(3):
            for c in range(8):
                x0, y0 = 190 + c * 45, -90 + r * 70; m.face([[x0, y0, 2], [x0 + 26, y0, 2], [x0 + 26, y0 + 26, 2], [x0, y0 + 26, 2]], "#f2f0d8", 8, "#9a9a80")
        m.render()
    m.cyl([-260, 0, sg * 45], [60, 0, sg * 45], 30.15, "galv", n=18, seg=3, capmat="#c9d1d8"); m.render()
h.titulo(890, 62, "VISTA 3D - LUMINARIA VIAL LED (REF.)", "ALUMINIO INYECTADO · ALETAS · ACOPLE AL BRAZO Ø60,3")
h.iso(.45, 1080, 260); lum(m)
h.g3("1", (400, 0, 108), 1380, 160, "CUERPO DE ALUMINIO + ALETAS (*)")
h.g3("6", (-150, 0, 45), 1380, 420, "BRAZO Ø60,3 (VER MAT-VINCULOS-1)")
h.g3("2", (60, 30, 90), 1380, 200, "ACOPLE / MANGUITO")
h.titulo(890, 560, "VISTA DESDE ABAJO", "VIDRIO TEMPLADO Y MODULO LED (DIBUJO DADO VUELTA)")
h.iso(.45, 1080, 740); lum(m, flip=True)
h.g3("3", (500, 120, 1), 1380, 640, "VIDRIO TEMPLADO")
h.g3("4", (300, 0, 2), 1380, 680, "MODULO LED (*)")
h.rotulo(890, h.H - 150, 750, "MAT-LUMINARIA_LED-1", "LUMINARIA VIAL LED", "6010 · 6011 · 6012", "ARRIBA, LATERAL, CORTE, ACOPLE, CODIGOS Y 3D", "1:6 / 1:3", "3D S/E")
guardar(h, "mat_luminaria_led_1")
