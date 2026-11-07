"""MAT-LUMINARIA_LED-2 · Portalámpara de aplicar E27 con lámpara LED 5 W (6014): la luz interna del tablero.
Datos: FICHAS_TEC.luminaria_led pieza 2 (portalámpara de aplicar, rosca E27, LED 5 W, luz interna del tablero), catálogo del pañol.
Medidas: NO están en la app. Rosca E27 = Edison 27 mm (IEC 60061-1); lámpara y base: típicas de catálogo → (*)."""
from ilukit import *
h = nueva(); m = h.m

# ======================= VISTA LATERAL / CORTE (1:1 → 2 px/mm)
e = 2.0; cx, yb = 230, 470          # yb = cara de apoyo (placa del tablero)
h.titulo(40, 62, "CORTE POR EL EJE", "ESC. 1:1 (×2 EN PANTALLA) - COTAS EN mm - MEDIDAS TIPICAS (*)")
h.rect(80, yb, 300, 14, "url(#STEEL)", K, 1); h.txt(86, yb + 30, "PLACA DE MONTAJE DEL TABLERO", 9, 400, G)
B, HB = 72, 30                                       # base Ø72 × 30 (*)
h.path(f"M{cx-B/2*e},{yb} L{cx-B/2*e},{yb-HB*e+8} Q{cx-B/2*e},{yb-HB*e} {cx-B/2*e+8},{yb-HB*e} L{cx+B/2*e-8},{yb-HB*e} Q{cx+B/2*e},{yb-HB*e} {cx+B/2*e},{yb-HB*e+8} L{cx+B/2*e},{yb} Z", "url(#PLAS)", K, 1.4)
for sx in (-1, 1): h.rect(cx + sx * 24 * e - 3, yb - HB * e, 6, HB * e, "#fff", K, .7); h.circ(cx + sx * 24 * e, yb - HB * e + 6, 5, "#fff", K, .7)
yc = yb - HB * e; H27 = 26
h.rect(cx - 33 / 2 * e, yc - H27 * e, 33 * e, H27 * e, "url(#PLAS)", K, 1.2)                    # cuello del portalámpara (*)
h.rect(cx - 26.5 / 2 * e, yc - H27 * e, 26.5 * e, H27 * e - 6, "#fff", K, .8)
for i in range(6):
    y = yc - H27 * e + 8 + i * 8; h.path(f"M{cx-13.25*e},{y} L{cx+13.25*e},{y+4}", "none", K, .9)    # rosca E27
h.rect(cx - 6, yc - 8, 12, 6, "url(#cuH)", K, .7)                                                     # contacto central
# lámpara A60 (*)
yl = yc - H27 * e
h.path(f"M{cx-13*e},{yl} L{cx-13*e},{yl-20*e} C{cx-30*e},{yl-40*e} {cx-30*e},{yl-100*e} {cx},{yl-100*e} C{cx+30*e},{yl-100*e} {cx+30*e},{yl-40*e} {cx+13*e},{yl-20*e} L{cx+13*e},{yl} Z", "none", K, 1, 'stroke-dasharray="6 3"')
h.ln(cx, yl - 110 * e, cx, yb + 20, K, .4, h.EJE)
h.dimH(yb + 52, cx - B / 2 * e, cx + B / 2 * e, "Ø≈72 (*)", ext=yb + 2, c=OR)
h.dimV(cx + B / 2 * e + 20, yb - HB * e, yb, "≈30 (*)", ext=cx + B / 2 * e + 2, c=OR)
h.txt(cx - 17 * e - 6, yc - 26, "E27 (Ø≈26,5)", 10, 700, K, "end")
h.dimV(cx - 60 * e / 2 - 30, yl - 100 * e, yl, "≈ 108 (*) A60", ext=cx - 30 * e - 2, c=OR)
h.dimH(yl - 100 * e - 14, cx - 30 * e, cx + 30 * e, "Ø60 (*)", ext=yl - 60 * e, c=OR)
h.globo("1", cx - B / 2 * e + 10, yb - 20, 60, yb - 60); h.globo("2", cx + 10, yc - 30, cx + 180, yc - 40); h.globo("3", cx, yl - 60 * e, cx + 180, yl - 90 * e)
h.globo("4", cx + 24 * e, yb - HB * e + 6, cx + 180, yb - 40); h.txt(cx + 196, yb - 36, "TORNILLO DE FIJACION (*)", 9.5, 400, OR)
h.txt(cx + 196, yc - 36, "ROSCA E27 + CONTACTO CENTRAL", 9.5, 400); h.txt(cx + 196, yl - 86 * e, "LAMPARA LED 5 W (A60 (*))", 9.5, 400, OR)

# ======================= VISTA DE ARRIBA (sin lámpara)
h.titulo(500, 62, "VISTA DE ARRIBA", "SIN LAMPARA - ESC. 1:1 (×2)")
ax, ay = 670, 240
h.circ(ax, ay, 36 * e, "#fff", K, 1.4); h.circ(ax, ay, 16.5 * e, "#fff", K, 1.1); h.circ(ax, ay, 13.25 * e, "#fff", K, .7, h.OCULTA)
h.circ(ax, ay, 5, "url(#cuH)", K, .7)
for sx in (-1, 1): h.circ(ax + sx * 24 * e, ay, 5, "#fff", K, .8)
for sx in (-1, 1): h.rect(ax + sx * 30 * e - 6 + (0 if sx > 0 else 0), ay + 22 * e - 4, 12, 8, "#fff", K, .7)
h.txt(ax, ay + 36 * e + 22, "2 BORNES (FASE · NEUTRO) (*)", 9.5, 400, OR, "middle")
corteMarca(h, ax - 36 * e - 14, ay, ax + 36 * e + 14, ay, "A")

# ======================= TABLAS
y2 = h.codigos(40, 625, [6014], extra={6014: "1 por tablero (*)"}, wx=170)
h.datos(40, y2 + 30, [("TIPO", "portalámpara de aplicar"), ("ROSCA", "E27 (Edison 27 mm, IEC 60061-1)"), ("LAMPARA", "LED 5 W, rosca E27"),
        ("TENSION", "220 V (*)"), ("MATERIAL BASE", "termoplástico / baquelita (*)"), ("MONTAJE", "2 tornillos sobre la placa (*)")], w=420, c1=130)
textoBloque(h, 485, y2 + 30, "DONDE SE USA", [
    "· Luz interna del tablero de medición,",
    "   protección y comando (3058 y variantes).",
    "· Se alimenta del circuito de servicio del",
    "   tablero (junto al toma 3050 / 3071) (*).",
    "· Ver MAT-TABLERO-2 (tablero armado)."], sz=10, dy=15)
h.notas(40, 1040, [
    "COTAS EN mm. LA APP SOLO TIENE LA DESCRIPCION: «PORTALAMPARA DE APLICAR - ROSCA E27 EQUIPADO CON LAMPARA LED DE 5 W».",
    "(*) MEDIDAS DE LA BASE, DEL CUELLO Y DE LA LAMPARA: TIPICAS DE CATALOGO (FORMA A60). A CONFIRMAR CON EL FABRICANTE.",
    "(*) CIRCUITO DE ALIMENTACION Y POSICION EN EL TABLERO: SEGUN EL PROYECTO DEL TABLERO ARMADO.",
    "FUENTE: DESCRIPCION DEL PAÑOL (FICHA TECNICA DE LA APP); ROSCA E27 SEGUN IEC 60061-1."])

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - PORTALAMPARA E27 + LED 5 W", "BASE TERMOPLASTICA (*) · ROSCA DE LATON · LAMPARA LED (VIDRIO OPAL)")
h.iso(2.6, 1260, 600)
m.cyl([0, 0, 0], [0, 0, 30], 36, "blanco", n=40, capmat="#f6f6f2"); m.render()
for sx in (-1, 1): m.cyl([0, sx * 24, 30], [0, sx * 24, 32], 4.5, "inox", n=12); m.render()
m.cyl([0, 0, 30], [0, 0, 56], 16.5, "blanco", n=36, capmat="#f6f6f2"); m.render()
m.rosca([0, 0, 56], [0, 0, 78], 13.25, "bronce", paso=3.6, n=28); m.render()
prof = [(78, 13), (92, 14), (102, 17), (112, 22), (122, 27), (132, 29.6), (142, 30), (152, 28.6), (160, 25.5), (166, 21), (171, 14), (174, 6), (175, 0.5)]
for (z0, r0), (z1, r1) in zip(prof, prof[1:]):
    m.cyl([0, 0, z0], [0, 0, z1], r0, "#f1f1ea" if z0 >= 92 else "#e4e4dc", n=36, r1=r1, caps=False, seg=1)
m.render()
h.g3("1", (30, 20, 15), 1440, 560, "BASE DE APLICAR (*)", NV)
h.g3("2", (10, 8, 70), 1440, 430, "ROSCA E27 (LATON)", NV)
h.g3("3", (20, 20, 140), 1440, 300, "LAMPARA LED 5 W (*)", NV)
h.g3("4", (0, 24, 32), 1440, 600, "TORNILLO DE FIJACION (*)", OR)
h.txt(980, 980, "SE ATORNILLA SOBRE LA PLACA DE MONTAJE DEL TABLERO (3052), ARRIBA, LEJOS DE LOS BORNES.", 10, 400, G, "start", INT)
h.rotulo(890, h.H - 150, 750, "MAT-LUMINARIA_LED-2", "PORTALAMPARA E27", "CON LAMPARA LED 5 W", "CORTE, VISTA DE ARRIBA, CODIGO, DATOS Y 3D", "2:1", "3D S/E")
guardar(h, "mat_luminaria_led_2")
