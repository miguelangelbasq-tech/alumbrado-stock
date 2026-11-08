"""MAT-LUMINARIA_LED-2 (rev. B) · Portalámpara de aplicar E27 con lámpara LED 5 W (6014): la luz interna del tablero.
Geometría: r3d/piezas/perfiles_col.mjs (E27) → perfiles_col.json; 3D: r3d/out/col_e27.png.
Datos: FICHAS_TEC.luminaria_led pieza 2 (portalámpara de aplicar, rosca E27, LED 5 W, luz interna del tablero), catálogo del pañol.
Rosca E27 (IEC 60061-1): Ø mayor 26,45 · Ø menor 24,26 · paso 3,629 (7 hilos por pulgada). Base, cuello y lámpara A60: típicos (*)."""
from colkit import *

h = nueva3()
B, Cu, Rs, Lp = E27["base"], E27["cuello"], E27["rosca"], E27["lamp"]

# ======================= 1. CORTE POR EL EJE (2:1)
e = 2.0; cx, yb = 230, 500         # yb = cara de apoyo (placa del tablero)
h.titulo(40, 62, "CORTE POR EL EJE", "ESC. 2:1 · COTAS EN mm · LAMPARA EN VISTA")
Y = lambda z: yb - z * e
h.rect(70, yb, 330, 12, "url(#MET)", K, 1); h.txt(76, yb + 28, "PLACA DE MONTAJE DEL TABLERO", 9, 400, G)
zr = B["H"] + Cu["H"] - Rs["L"]
for s in (-1, 1):
    poly(h, [(cx + s * B["D"] / 2 * e, Y(0)), (cx + s * B["D"] / 2 * e, Y(B["H"] - 6)), (cx + s * (B["D"] / 2 - 6) * e, Y(B["H"])), (cx + s * Cu["D"] / 2 * e, Y(B["H"])),
             (cx + s * Cu["D"] / 2 * e, Y(B["H"] + Cu["H"])), (cx + s * (Rs["D"] / 2 + 1.5) * e, Y(B["H"] + Cu["H"])), (cx + s * (Rs["D"] / 2 + 1.5) * e, Y(10)), (cx + s * 0 * e, Y(10)), (cx, Y(0))], "url(#PLAS)", 1.2)
    # camisa roscada (latón) en corte
    pts = [(cx + s * (Rs["D"] / 2 - .4) * e, Y(zr))]
    n = int(Rs["L"] / Rs["paso"])
    for i in range(n * 2 + 1): pts.append((cx + s * ((Rs["d"] / 2 + .3) if i % 2 else (Rs["D"] / 2 + .3)) * e, Y(zr + i * Rs["paso"] / 2)))
    pts += [(cx + s * (Rs["D"] / 2 + .3) * e, Y(zr + Rs["L"])), (cx + s * (Rs["D"] / 2 - .4) * e, Y(zr + Rs["L"]))]
    poly(h, pts, "url(#CU)", .8)
    h.rect(cx + s * B["tornillos"] / 2 * e - 4, Y(B["H"] - 6), 8, (B["H"] - 6) * e + 22, "#fff", K, .7); h.rect(cx + s * B["tornillos"] / 2 * e - 7.5, Y(B["H"] - 6) - 5, 15, 5, "#fff", K, .8)
h.rect(cx - 8, Y(zr) - 6, 16, 6, "url(#CU)", K, .7)
# lámpara A60 en vista (línea fina)
zl = zr + 1; zc = zl + Rs["L"] + 4
h.path(f"M{cx-Rs['D']/2*e:.1f},{Y(zl)} V{Y(zc):.1f} L{cx-14.5*e:.1f},{Y(zc):.1f} L{cx-24*e:.1f},{Y(zc+26):.1f} C{cx-30*e:.1f},{Y(zc+40):.1f} {cx-30*e:.1f},{Y(zl+Lp['L']-14):.1f} {cx:.1f},{Y(zl+Lp['L']):.1f} "
       f"C{cx+30*e:.1f},{Y(zl+Lp['L']-14):.1f} {cx+30*e:.1f},{Y(zc+40):.1f} {cx+24*e:.1f},{Y(zc+26):.1f} L{cx+14.5*e:.1f},{Y(zc):.1f} L{cx+Rs['D']/2*e:.1f},{Y(zc):.1f} V{Y(zl):.1f}", "none", K, .9, 'stroke-dasharray="8 3"')
h.ln(cx, Y(zl + Lp["L"]) - 10, cx, yb + 18, K, .4, h.EJE)
h.dimH(yb + 46, cx - B["D"] / 2 * e, cx + B["D"] / 2 * e, f"Ø≈{B['D']} (*)", ext=yb + 2, c=OR)
h.dimV(cx + B["D"] / 2 * e + 18, Y(B["H"]), yb, f"≈{B['H']} (*)", ext=cx + B["D"] / 2 * e + 2, c=OR)
h.dimV(cx - B["D"] / 2 * e - 18, Y(zr + Rs["L"]), Y(zr), f"{Rs['L']} (*)", ext=cx - Rs["D"] / 2 * e - 4, c=OR)
h.dimH(Y(zl + Lp["L"]) - 12, cx - 30 * e, cx + 30 * e, "Ø60 (A60) (*)", ext=Y(zl + Lp["L"] - 40), c=OR)
h.dimV(cx + 30 * e + 40, Y(zl + Lp["L"]), Y(zl), f"≈{Lp['L']} (*)", ext=cx + 30 * e + 2, c=OR)
h.globo("1", cx - B["D"] / 2 * e + 10, Y(10), 60, yb - 60, r=9); h.globo("2", cx + (Rs["D"] / 2) * e, Y(zr + 8), 420, Y(zr + 8), r=9)
h.globo("3", cx + 20 * e, Y(zl + 70), 420, Y(zl + 70), OR, r=9); h.globo("4", cx + B["tornillos"] / 2 * e, Y(B["H"] - 3), 420, Y(B["H"] - 3) + 20, OR, r=9)
h.globo("5", cx, Y(zr) - 3, 420, Y(zr) + 14, r=9)
llamada(h, cx + 1, Y(zr) - 3, 432, Y(zr) + 30, "CONTACTO CENTRAL (LATON)", sz=8.5)
h.txt(436, Y(zr + 8) + 4, "CAMISA ROSCADA E27 (LATON)", 8.5, 400); h.txt(436, Y(zl + 70) + 4, "LAMPARA LED 5 W A60 (*)", 8.5, 400, OR)
h.txt(436, Y(B["H"] - 3) + 24, "TORNILLO DE FIJACION (*)", 8.5, 400, OR)

# ======================= 2. D1 · ROSCA E27 (IEC 60061-1, 5:1)
h.titulo(500, 62, "D1 · ROSCA E27", "IEC 60061-1 · ESC. 12:1 · PERFIL REDONDO · CAMISA DE LATON")
rx, ry_, e5 = 560, 230, 12
pts = []
for i in range(0, 4 * 2 + 1):
    pts.append((rx + i * Rs["paso"] / 2 * e5, ry_ - ((Rs["D"] - Rs["d"]) / 2 * e5 if i % 2 == 0 else 0)))
poly(h, pts + [(pts[-1][0], ry_ + 26), (pts[0][0], ry_ + 26)], "url(#CU)", .3, extra='stroke-opacity="0"')
h.path("M" + " Q".join([f"{pts[0][0]:.1f},{pts[0][1]:.1f}"] + [f"{(a[0]+b[0])/2:.1f},{a[1]:.1f} {b[0]:.1f},{b[1]:.1f}" for a, b in zip(pts, pts[1:])]), "none", K, 1.4)
h.ln(rx, ry_ + 26, rx + 4 * Rs["paso"] * e5, ry_ + 26, K, .8)
h.dimH(ry_ + 30, pts[0][0], pts[2][0], "3,629", ext=ry_ + 2)
h.dimV(rx - 14, pts[0][1], ry_, "1,1", ext=rx - 2)
h.txt(500, 290, "Ø MAYOR 26,45 · Ø MENOR 24,26 · PASO 3,629 (7 h/\")", 9.5, 700)
h.txt(500, 305, "LA LAMPARA ENROSCA HASTA TOCAR EL CONTACTO CENTRAL.", 9, 400, G)

# ======================= 3. VISTA DE ARRIBA SIN LAMPARA (1:1)
h.titulo(500, 345, "VISTA DE ARRIBA", "SIN LAMPARA · ESC. 1:1")
ax, ay = 640, 450; e1 = 1.2
h.circ(ax, ay, B["D"] / 2 * e1, "#fff", K, 1.4); h.circ(ax, ay, Cu["D"] / 2 * e1, "#fff", K, 1.1); h.circ(ax, ay, Rs["D"] / 2 * e1, "url(#CU)", K, .8); h.circ(ax, ay, Rs["d"] / 2 * e1 - 2, "#fff", K, .6)
h.circ(ax, ay, 4, "url(#CU)", K, .7)
for s in (-1, 1): h.circ(ax + s * B["tornillos"] / 2 * e1, ay, 4, "#fff", K, .8); h.ln(ax + s * B["tornillos"] / 2 * e1 - 3, ay, ax + s * B["tornillos"] / 2 * e1 + 3, ay, K, .6)
h.dimH(ay + B["D"] / 2 * e1 + 14, ax - B["tornillos"] / 2 * e1, ax + B["tornillos"] / 2 * e1, f"{B['tornillos']} (*)", ext=ay, c=OR)
h.txt(ax, ay + B["D"] / 2 * e1 + 36, "2 BORNES FASE · NEUTRO (DEBAJO) (*)", 8.5, 400, OR, "middle")

# ======================= TABLAS
TY = 630
yc_ = codTabla(h, 40, TY, [6014], {6014: "1 POR TABLERO (*)"}, wd=170)
yd = tablaD(h, 40, yc_ + 20, [("DATO", "VALOR"), ("TIPO", "PORTALAMPARA DE APLICAR"), ("ROSCA", "E27 (EDISON 27, IEC 60061-1)"), ("LAMPARA", "LED 5 W, ROSCA E27 (A60 (*))"),
        ("TENSION", "220 V (*)"), ("MATERIAL BASE", "TERMOPLASTICO / BAQUELITA (*)"), ("CONTACTOS", "LATON (CAMISA Y CENTRAL)"), ("MONTAJE", "2 TORNILLOS SOBRE LA PLACA (*)")],
        [(120, "l", False), (300, "l", False)], "DATOS TECNICOS", rowh=15)
ry = rayadosRef(h, 480, yc_ + 20, ["PLAS", "CU", "MET"], cols=1, dx=180)
yu = bloque(h, 480, ry + 8, "DONDE SE USA", ["LUZ INTERNA DEL TABLERO DE MEDICION, PROTECCION Y COMANDO (3058 Y VARIANTES).",
            "SE ALIMENTA DEL CIRCUITO DE SERVICIO DEL TABLERO (JUNTO AL TOMA) (*).", "VER MAT-TABLERO-2 (TABLERO ARMADO)."], w=360, sz=9.5, lh=12.5)
notasW(h, 40, max(yd, yu) + 20, [
    "COTAS EN mm. LA APP SOLO TIENE LA DESCRIPCION: «PORTALAMPARA DE APLICAR - ROSCA E27 EQUIPADO CON LAMPARA LED DE 5 W».",
    "(*) BASE, CUELLO, BORNES, TORNILLOS Y LAMPARA: TIPICOS DE CATALOGO (FORMA A60). A CONFIRMAR CON LO QUE COMPRA EL PAÑOL.",
    "(*) CIRCUITO DE ALIMENTACION Y POSICION EN EL TABLERO: SEGUN EL PROYECTO DEL TABLERO ARMADO."], w=800, lh=13.5)

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - PORTALAMPARA E27 + LED 5 W", "CORTADO A UN CUARTO SOBRE LA PLACA DEL TABLERO · ROSCA DE LATON · GLOBO OPAL")
A = img3d(h, "col_e27", 930, 90, 500)
columna(h, A, [("globo", "3", "GLOBO OPAL (A60) (*)"), ("placaLed", "", "PLACA LED (*)"), ("casquillo", "", "CASQUILLO E27 DE LA LAMPARA"), ("rosca", "2", "CAMISA ROSCADA E27"),
               ("contacto", "5", "CONTACTO CENTRAL"), ("borne", "", "BORNE (*)"), ("base", "1", "BASE DE APLICAR (*)"), ("tornillo", "4", "TORNILLO (*)"), ("placa", "", "PLACA DEL TABLERO")],
        1430, 120, 640, paso=32)
pie3d(h, "", "RENDER three.js: r3d/escenas/col_e27.mjs · MISMA GEOMETRIA DEL PLANO · FUENTES: r3d/FUENTES_col.md")
rotuloMat(h, "MAT-LUMINARIA_LED-2", "PORTALAMPARA E27", "CON LAMPARA LED 5 W", "CORTE, D1 ROSCA, ARRIBA, CODIGO, DATOS Y 3D", "2:1", "D1 12:1 · 3D S/E", rev="B", fecha="08/11/2026")
guardarCol(h, "mat_luminaria_led_2")
