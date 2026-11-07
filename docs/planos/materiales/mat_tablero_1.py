"""MAT-TABLERO-1 · Gabinete de PRFV 530 × 430 × 200 mm (3020) y su placa de montaje (3052).
Datos: FICHAS_TEC.tablero pieza 1 (PRFV, IP66 / IK10, doble aislación, puerta 180°, cierres ¼ de vuelta, placa aparte, montaje a ≥ 5 m con la
puerta hacia el espacio verde; referencia Schneider PanelSeT PLM NSYPLM54G 530 × 430 × 200 RAL 7035), plano() de la ficha (frente 430 × 530,
perfil 200), FAMILIAS_MAT.tablero, Normas AP-T-012 (2 juegos de semiabrazaderas por Ø del poste), hoja aprobada AP-T-012 (4003)."""
from ilukit import *
h = nueva(); m = h.m

# ======================= VISTA DE FRENTE (1:5 → 0,8 px/mm × 0,7)
s = .56; X0, Y0 = 90, 120
W, Hh, P = 430, 530, 200
h.titulo(40, 62, "VISTA DE FRENTE", "ESC. 1:7 - COTAS EN mm - PUERTA CERRADA")
h.rect(X0, Y0, W * s, Hh * s, "#fff", K, 1.6); h.rect(X0 + 10, Y0 + 10, W * s - 20, Hh * s - 20, "none", K, .6)
for yy in (Y0 + 60, Y0 + Hh * s - 60): h.circ(X0 + W * s - 24, yy, 7, "#fff", K, 1); h.ln(X0 + W * s - 29, yy, X0 + W * s - 19, yy, K, 1.4)   # cierres ¼ vuelta
for yy in (Y0 + 40, Y0 + Hh * s - 40): h.rect(X0 - 5, yy - 14, 5, 28, "#fff", K, .8)                                                      # bisagras
h.path(f"M{X0 + W*s/2 - 22},{Y0 + 70} l22,-38 l22,38 z", "#fff", K, 1.2); h.txt(X0 + W * s / 2, Y0 + 64, "!", 18, 700, K, "middle")
h.txt(X0 + W * s / 2, Y0 + 100, "RIESGO ELECTRICO", 8.5, 700, K, "middle")
h.dimH(Y0 - 16, X0, X0 + W * s, "430", ext=Y0)
h.dimV(X0 + W * s + 44, Y0, Y0 + Hh * s, "530", ext=X0 + W * s + 2)
h.globo("1", X0 + 60, Y0 + 200, 60, Y0 + Hh * s + 30); h.globo("2", X0 + W * s - 24, Y0 + 60, X0 + W * s + 60, Y0 + 40)
h.globo("3", X0 - 3, Y0 + 40, 60, Y0 + 30)
corteMarca(h, X0 - 20, Y0 + Hh * s / 2, X0 + W * s + 14, Y0 + Hh * s / 2, "A")

# ======================= CORTE A-A / PERFIL
h.titulo(430, 62, "CORTE A-A", "ESC. 1:7 - PERFIL, PLACA Y SOPORTES")
X1 = 560
h.rect(X1, Y0, P * s, Hh * s, "#fff", K, 1.6)
h.rect(X1 + 3, Y0 + 3, 4, Hh * s - 6, "#111", K, .3)                          # pared trasera en corte
h.rect(X1 + P * s - 7, Y0 + 3, 4, Hh * s - 6, "#111", K, .3)                  # puerta en corte
h.rect(X1 + 20, Y0 + 18, 4, Hh * s - 36, "url(#STEEL)", K, .8)                # placa de montaje (*)
h.ln(X1 + 7, Y0 + 30, X1 + 20, Y0 + 30, K, 2); h.ln(X1 + 7, Y0 + Hh * s - 30, X1 + 20, Y0 + Hh * s - 30, K, 2)
h.dimH(Y0 - 16, X1, X1 + P * s, "200", ext=Y0)
h.globo("4", X1 + 22, Y0 + 150, X1 + 150, Y0 + 150); h.txt(X1 + 166, Y0 + 154, "PLACA 3052 (*)", 9.5, 400, OR)
h.txt(X1 + P * s + 6, Y0 + Hh * s - 6, "PUERTA", 9, 400, G)
for yy in (Y0 + 50, Y0 + Hh * s - 50):
    h.rect(X1 - 30, yy - 6, 30, 12, "url(#STEEL)", K, .8)
h.circ(X1 - 70, Y0 + Hh * s / 2, 46, "url(#fibra)", K, 1); h.circ(X1 - 70, Y0 + Hh * s / 2, 46, "none", K, 1.2)
h.txt(X1 - 70, Y0 + Hh * s / 2 + 64, "APOYO", 9, 700, K, "middle")
h.globo("5", X1 - 15, Y0 + 50, X1 + 150, Y0 + 40); h.txt(X1 + 166, Y0 + 44, "SEMIABRAZ. 4003", 9.5, 400)

# ======================= D1 · CIERRE ¼ DE VUELTA + DATOS DE MONTAJE
h.titulo(430, 455, "D1 · CIERRE ¼ DE VUELTA", "ESQUEMA (*)")
cx, cy = 470, 520
h.circ(cx, cy, 22, "#fff", K, 1.2); h.rect(cx - 16, cy - 3, 32, 6, "#fff", K, 1); flecha(h, cx + 30, cy + 10, cx + 10, cy + 30, OR)
h.txt(cx + 40, cy + 4, "ABRE Y CIERRA CON ¼ DE VUELTA", 9.5, 400)
h.txt(90, 470, "MONTAJE: A 5 m O MAS DEL PISO, PUERTA HACIA EL ESPACIO VERDE.", 9.5, 700)

# ======================= TABLAS
y2 = h.codigos(40, 600, [3020, 3052], extra={3020: "530 × 430 × 200 mm", 3052: "UN. «m» en el pañol (*)"}, wx=180)
h.datos(40, y2 + 30, [("MATERIAL", "PRFV (poliéster + fibra de vidrio)"), ("PROTECCION", "IP66 · IK10 · doble aislación"),
        ("COLOR (REF.)", "gris RAL 7035"), ("PUERTA", "abre 180°, cierres ¼ de vuelta"), ("MEDIDAS", "530 × 430 × 200 mm (alto × ancho × fondo)"),
        ("PLACA", "aparte (3052)"), ("MONTAJE", "≥ 5 m, puerta al espacio verde"), ("REFERENCIA", "Schneider PanelSeT NSYPLM54G")], w=420, c1=110)
textoBloque(h, 485, y2 + 30, "DONDE SE USA", [
    "· AP-T-019 / 018: tablero aéreo sobre el",
    "   apoyo PRFV (6015) o poste H°A°.",
    "· AP-T-012: sujeción con 2 juegos de",
    "   semiabrazaderas por Ø (4003).",
    "· Adentro: AP-T-007 (TT) / AP-T-008 (TN-S),",
    "   ver MAT-TABLERO-2.",
    "· Pliego 9.02: el gabinete trae sus",
    "   abrazaderas (si vienen, 4003 no se pide)."], sz=10, dy=15)
h.notas(40, 1040, [
    "COTAS EN mm. MEDIDAS DEL CATALOGO (3020) Y DE LA REFERENCIA SCHNEIDER: CONFIRMAR CON CADA PROVEEDOR.",
    "(*) PLACA DE MONTAJE: EL PAÑOL LA TIENE EN «m» (DEBERIA SER «Un.»); NO SE CAMBIA SIN EL OK DE ANGEL. MEDIDAS DE LA PLACA (*).",
    "(*) FORMA DEL CIERRE Y DE LA BISAGRA: ESQUEMA, SEGUN EL FABRICANTE.",
    "FUENTE: SCHNEIDER PANELSET PLM NSYPLM54G; PLIEGO LP 21478 (AP-T-012 / 019); CATALOGO DEL PAÑOL."])

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - GABINETE PRFV 530 × 430 × 200", "PUERTA ABIERTA 110° · PLACA DE MONTAJE · RAL 7035 (*)")
h.iso(.6, 1150, 560)
X0g, X1g, Yg, Zg = -100, 100, 215, 530
F = lambda *p: [list(q) for q in p]
m.face(F((X0g, -Yg, 0), (X0g, Yg, 0), (X0g, Yg, Zg), (X0g, -Yg, Zg)), "#e9eae4", 0, "#999")          # fondo (por dentro)
m.face(F((X0g, -Yg, 0), (X1g, -Yg, 0), (X1g, -Yg, Zg), (X0g, -Yg, Zg)), "#dcddd6", 0, "#999")       # costado derecho (por dentro)
m.face(F((X0g, -Yg, 0), (X1g, -Yg, 0), (X1g, Yg, 0), (X0g, Yg, 0)), "#d4d5ce", 0, "#999")          # piso
m.render()
m.box(-90, -84, -185, 185, 30, 500, "galv", edge="#666"); m.render()                                  # placa de montaje (*) contra el fondo
m.face(F((X0g, Yg, 0), (X1g, Yg, 0), (X1g, Yg, Zg), (X0g, Yg, Zg)), "prfvGab", 0, "#777")            # costado izquierdo
m.face(F((X0g, -Yg, Zg), (X1g, -Yg, Zg), (X1g, Yg, Zg), (X0g, Yg, Zg)), "prfvGab", 0, "#777")        # techo
m.render()
th = math.radians(115); dxp, dyp = math.sin(th), math.cos(th)
hx, hy = 100, -215; ex, ey = hx + 430 * dxp, hy + 430 * dyp
m.face([[hx, hy, 0], [ex, ey, 0], [ex, ey, 530], [hx, hy, 530]], "prfvGab", 0, "#777"); m.render()
for z in (60, 470): m.cyl([hx, hy, z - 20], [hx, hy, z + 20], 6, "gris", n=10)
m.cyl([hx + 400 * dxp, hy + 400 * dyp, 460], [hx + 400 * dxp + 12, hy + 400 * dyp, 460], 10, "gris", n=12)
m.render()
h.g3("1", (0, 215, 200), 1200, 820, "GABINETE PRFV 3020", NV)
h.g3("2", (hx + 400 * dxp + 10, hy + 400 * dyp, 460), 1200, 700, "CIERRE ¼ DE VUELTA (*)", OR)
h.g3("3", (hx, hy, 470), 1200, 740, "BISAGRA (PUERTA 180°)", NV)
h.g3("4", (-84, 100, 300), 1200, 780, "PLACA DE MONTAJE 3052", NV)
h.txt(960, 900, "VER ADENTRO: MAT-TABLERO-2 (TABLERO ARMADO)", 10, 400, G, "start", INT)
h.rotulo(890, h.H - 150, 750, "MAT-TABLERO-1", "GABINETE PRFV", "530 × 430 × 200 mm", "FRENTE, CORTE, CIERRE, CODIGOS, DATOS Y 3D", "1:7", "D1 S/E · 3D S/E")
guardar(h, "mat_tablero_1")
