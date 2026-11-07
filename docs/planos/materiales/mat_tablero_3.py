"""MAT-TABLERO-3 · Tablero aéreo de barrio de policarbonato armado completo (3504, ítem 9.03) y base portafusible NH ACR 20–125 A / 500 V (3503, ítem 15.16).
Datos: FICHAS_TEC.tablero (barrio: PRFV armado en obra 9.02 o policarbonato armado completo 9.03; la base NH ACR lleva un fusible NH por fase),
plano() de la ficha (qué lleva: 3 bases NH + contactor «C», reloj, térmicas; ítems 15.16 base NH 3503, 15.17 fusible NH 3004, 15.20 minicontactor
3501, 15.15 reloj AT1-R 3502, 15.21–15.25 térmicas, 15.01 / 15.13 fotocontrol y base; «el de policarbonato viene ARMADO»), FICHAS_TEC.fusibles
(base NH00 unipolar 30 × 119 · fusible NH00 cuerpo 79, alto 58 — DIN 43620, usados como medida típica (*))."""
from ilukit import *
h = nueva(); m = h.m

# ======================= QUE LLEVA (FRENTE, ESQUEMA)
h.titulo(40, 62, "TABLERO AEREO DE BARRIO - QUE LLEVA", "FRENTE SIN TAPA - ESQUEMA (*) - SEGUN EL PLANO DE LA FICHA")
X0, Y0, W, H = 70, 110, 330, 420
h.rect(X0, Y0, W, H, "#fff", K, 1.8); h.rect(X0 + 12, Y0 + 12, W - 24, H - 24, "none", K, .6)
h.txt(X0 + W / 2, Y0 + H + 18, "CAJA DE POLICARBONATO (3504) · MEDIDAS (*)", 9.5, 400, OR, "middle")
for i in range(3):
    x = X0 + 40 + i * 62; h.rect(x, Y0 + 40, 40, 120, "#fff", K, 1.2); h.rect(x + 6, Y0 + 72, 28, 56, "url(#PORC)", K, .8)
    h.txt(x + 20, Y0 + 178, "NH", 10, 700, K, "middle")
h.rect(X0 + 236, Y0 + 50, 60, 90, "#fff", K, 1.2); h.txt(X0 + 266, Y0 + 100, "C", 13, 700, K, "middle"); h.txt(X0 + 266, Y0 + 158, "MINICONT.", 8.5, 700, K, "middle")
h.ln(X0 + 20, Y0 + 230, X0 + W - 20, Y0 + 230, K, 2)                                 # riel
for i in range(4):
    x = X0 + 40 + i * 30; h.rect(x, Y0 + 205, 26, 52, "#fff", K, 1)
h.txt(X0 + 92, Y0 + 278, "TERMICAS", 9, 700, K, "middle")
h.rect(X0 + 210, Y0 + 205, 80, 52, "#fff", K, 1); h.circ(X0 + 250, Y0 + 231, 16, "#fff", K, .8); h.txt(X0 + 250, Y0 + 278, "RELOJ AT1-R", 9, 700, K, "middle")
h.rect(X0 + 40, Y0 + 320, 250, 26, "#fff", K, .8); h.txt(X0 + 165, Y0 + 337, "BORNERAS (*)", 9, 400, OR, "middle")
h.globo("1", X0 + 60, Y0 + 100, 440, 90)
h.globo("2", X0 + 266, Y0 + 70, 440, 140); h.globo("3", X0 + 53, Y0 + 230, 440, 186); h.globo("4", X0 + 250, Y0 + 231, 440, 232)
h.globo("5", X0 + 2, Y0 + 300, 440, 278)
for (g, tx) in ((140, "MINICONTACTOR 20 A (3501) · 15.20"), (186, "TERMOMAGNETICAS · 15.21–15.25"), (232, "RELOJ AT1-R (3502) · 15.15"), (278, "CAJA POLICARBONATO ARMADA (3504) · 9.03")):
    h.txt(456, g + 4, tx, 9.5, 400)
h.txt(456, 94, "BASE NH ACR (3503) + FUSIBLE NH (3004) POR FASE", 9.5, 400)
h.txt(456, 108, "ITEMS 15.16 Y 15.17", 9, 400, G)
h.txt(456, 322, "EL DE POLICARBONATO VIENE ARMADO: LA CALCULADORA", 9.5, 700); h.txt(456, 336, "NO COMPUTA SUS ELEMENTOS INTERIORES.", 9.5, 700)
h.txt(456, 360, "VARIANTE: PRFV ARMADO EN OBRA (AP-T-007, ÍTEM 9.02).", 9.5, 400)

# ======================= D1 · BASE NH (ACR 20–125 A)
h.titulo(456, 410, "D1 · BASE NH ACR 20–125 A (3503)", "VISTA DE FRENTE Y LATERAL - ESC. 1:2 - MEDIDAS TIPICAS NH00 (*)")
e = 1.0; bx, by = 490, 465
h.rect(bx, by, 30 * e * 1.4, 119 * e * 1.4 * .8, "#fff", K, 1.4)
L = 119 * 1.4 * .8
for yy in (by + 10, by + L - 30): h.rect(bx + 8, yy, 26, 20, "url(#BRZ)", K, .8)
h.dimH(by - 10, bx, bx + 42, "30 (*)", ext=by, c=OR); h.dimV(bx - 14, by, by + L, "119 (*)", ext=bx - 2, c=OR)
fx = 600
h.rect(fx, by + 40, 79 * .9, 58 * .9, "url(#PORC)", K, 1.3); h.rect(fx - 10, by + 56, 10, 20, "url(#BRZ)", K, .8); h.rect(fx + 71, by + 56, 10, 20, "url(#BRZ)", K, .8)
h.dimH(by + 30, fx, fx + 71, "79 (*)", ext=by + 40, c=OR); h.dimV(fx + 100, by + 40, by + 92, "58 (*)", ext=fx + 73, c=OR)
h.txt(fx + 35, by + 110, "FUSIBLE NH 00 (3004)", 9, 700, K, "middle")

# ======================= TABLAS
y2 = h.codigos(40, 625, [3504, 3503], extra={3504: "ítem 9.03 · viene armado", 3503: "ítem 15.16 · 1 por fase"}, wx=190)
h.datos(40, y2 + 30, [("CAJA (3504)", "policarbonato, armada completa"), ("BASE (3503)", "NH ACR 20–125 A / 500 V"),
        ("FUSIBLE", "NH 20–100 A (3004), uno por fase"), ("COMANDO", "minicontactor 20 A + reloj AT1-R"), ("SALIDAS", "termomagnéticas 15.21–15.25"),
        ("ENCENDIDO", "fotocontrol y base 15.01 / 15.13")], w=420, c1=120)
textoBloque(h, 485, y2 + 30, "DONDE SE USA", [
    "· Red aérea de barrio (LP 21478 Anexo I):",
    "   tablero aéreo 9.02 (PRFV) o 9.03 (policarb.).",
    "· AP-T-007: tablero PRFV armado en obra.",
    "· Calculadora 🏘 Barrio: tablero aéreo,",
    "   transición AP-TC-024 y PAT de red."], sz=10, dy=15)
h.notas(40, 1040, [
    "COTAS EN mm. LA APP NO TIENE MEDIDAS DE LA CAJA DE POLICARBONATO NI DE LA BASE ACR: TODO EL FRENTE ES ESQUEMA (*).",
    "(*) BASE Y FUSIBLE: MEDIDAS TIPICAS NH00 (DIN 43620) DE LA FICHA «FUSIBLES»; CONFIRMAR CON EL FABRICANTE DE LA BASE ACR.",
    "(*) DISPOSICION INTERIOR Y BORNERAS: SEGUN EL FABRICANTE DEL TABLERO ARMADO Y EL PROYECTO.",
    "FUENTE: LP 21478 ANEXO I (9.02 / 9.03 / 15.15–15.25), FICHAS TECNICAS DE LA APP, CATALOGO DEL PAÑOL."])

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - TABLERO AEREO DE POLICARBONATO", "CAJA TRANSLUCIDA (*) · BASES NH CON FUSIBLE · ESQUEMA")
h.iso(.75, 1180, 600)
m.box(-80, -70, -200, 200, 0, 520, "#9aa0a6", edge="#555"); m.render()                                # fondo
for i in range(3):
    y0 = -170 + i * 70; m.box(-70, -40, y0, y0 + 40, 300, 440, "#2d3038", edge="#111"); m.render()
    m.box(-40, -10, y0 + 6, y0 + 34, 330, 410, "#d8d0b8", edge="#776"); m.render()
    for zz in (338, 402): m.box(-12, -6, y0 + 12, y0 + 28, zz - 6, zz + 6, "bronce", edge="#5a4012")
    m.render()
m.box(-70, -20, 60, 150, 320, 430, "#eeeeea", edge="#777"); m.render()
m.box(-70, -64, -180, 180, 220, 245, "galv", edge="#555"); m.render()
for i in range(4): m.box(-64, -10, -170 + i * 28, -146 + i * 28, 190, 275, "#f5f5f2", edge="#777")
m.box(-64, -10, 40, 150, 190, 275, "#e8e8e4", edge="#777"); m.render()
# caja de policarbonato (translúcida): solo bordes y caras con poca opacidad
for f_ in ([[80, -200, 0], [80, 200, 0], [80, 200, 520], [80, -200, 520]], [[-80, 200, 0], [80, 200, 0], [80, 200, 520], [-80, 200, 520]], [[-80, -200, 520], [80, -200, 520], [80, 200, 520], [-80, 200, 520]]):
    pp = " ".join(f"{h.P(*p)[0]:.1f},{h.P(*p)[1]:.1f}" for p in f_)
    h.a(f'<polygon points="{pp}" fill="#cfe3ee" fill-opacity=".22" stroke="#6a8796" stroke-width="1.1"/>')
h.g3("1", (-10, -150, 380), 1430, 160, "BASE NH ACR + FUSIBLE (3503 · 3004)", NV)
h.g3("2", (-20, 100, 400), 1430, 200, "MINICONTACTOR 20 A (3501)", NV)
h.g3("3", (-10, -100, 240), 1430, 240, "TERMOMAGNETICAS", NV)
h.g3("4", (-10, 100, 240), 1430, 280, "RELOJ AT1-R (3502)", NV)
h.g3("5", (80, 200, 100), 1430, 320, "CAJA POLICARBONATO (3504) (*)", OR)
h.rotulo(890, h.H - 150, 750, "MAT-TABLERO-3", "TABLERO AEREO DE BARRIO", "POLICARBONATO · BASE NH", "QUE LLEVA, BASE NH, CODIGOS, DATOS Y 3D", "S/E", "D1 1:2 · 3D S/E")
guardar(h, "mat_tablero_3")
