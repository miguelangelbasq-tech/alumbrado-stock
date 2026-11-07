"""MAT-CAJA_COLUMNA-1 · Caja estanca de aluminio inyectado 200 × 150 × 100 IP65 (6003) y caja de conexión con señal (6002).
Datos: FICHAS_TEC.caja_columna pieza 1 (Conextube; tapa con junta, tornillos imperdibles, entrada por prensacable),
AP-PL-003 (externa en columna existente, a 2,50 m, 2 juegos de abrazaderas = Ø de la columna; ítem 14.1),
AP-PL-002 (riel 14 cm + 2 tornillos 6×3/8, ojal Ø50, prensacable 3/4" BSC o 1/2" BSP — ZA3 / ZA11, cable 6–12 mm), AP-CC-010."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
Wb, Hb, Db = 200, 150, 100
e = 1.15
# ================= FRENTE SIN TAPA =================
h.titulo(40, 62, "VISTA DE FRENTE (SIN TAPA)", "ESC. 1:1 (APROX.) - COTAS EN mm")
FX, FY = 80, 120
h.rect(FX, FY, Wb * e, Hb * e, "#fff", K, 1.6, 'rx="8"')
h.rect(FX + 8 * e, FY + 8 * e, (Wb - 16) * e, (Hb - 16) * e, "#fff", K, .8, 'rx="5"')
for (x, y) in ((FX + 10, FY + 10), (FX + Wb * e - 10, FY + 10), (FX + 10, FY + Hb * e - 10), (FX + Wb * e - 10, FY + Hb * e - 10)):
    h.circ(x, y, 5, "#fff", K, .8); h.circ(x, y, 2, "#fff", K, .5)
# tablerito adentro con riel y bornes (AP-CC-014)
tx, ty = FX + 30 * e, FY + 25 * e
h.rect(tx, ty, 140 * e, 100 * e, "url(#ANSI37)", K, .7)
h.rect(tx + 0 * e, ty + 32.5 * e, 140 * e, 35 * e, "#fff", K, .8)
for i in range(6):
    h.rect(tx + (8 + i * 8.2) * e, ty + 24 * e, 8.2 * e, 52 * e, "#fff", K, .7)
for i in range(2):
    h.rect(tx + (70 + i * 18) * e, ty + 10 * e, 17.5 * e, 80 * e, "#fff", K, .7)
h.circ(tx + 120 * e, ty + 50 * e, 5 * e, "#fff", K, .8)
h.txt(tx + 120 * e, ty + 66 * e, "PAT", 8.5, 700, K, "middle")
h.dimH(FY + Hb * e + 24, FX, FX + Wb * e, "200", ext=FY + Hb * e + 2)
h.dimV(FX - 20, FY, FY + Hb * e, "150", ext=FX - 2)
h.dimH(FY - 14, tx, tx + 140 * e, "RIEL 140 (AP-PL-002)", ext=ty + 32.5 * e)
h.globo("1", FX + 4, FY + Hb * e / 2, FX - 44, FY + Hb * e + 60)
h.globo("3", tx + 30 * e, ty + 50 * e, tx + 30 * e, FY + Hb * e + 60)
h.globo("4", tx + 120 * e, ty + 50 * e, tx + 160 * e, FY + Hb * e + 60)
h.txt(FX + Wb * e + 8, FY + 30, "TABLERITO", 9.5, 400); h.txt(FX + Wb * e + 8, FY + 44, "AP-CC-014", 9.5, 400)
# ================= PERFIL =================
PX = 420
h.titulo(PX, 62, "PERFIL", "TAPA CON JUNTA")
h.rect(PX, FY, Db * e, Hb * e, "#fff", K, 1.6, 'rx="6"')
h.ln(PX + (Db - 14) * e, FY, PX + (Db - 14) * e, FY + Hb * e, K, .8)
h.rect(PX + (Db - 16) * e, FY + 4, 2 * e, Hb * e - 8, "#222", K, .3)   # junta
h.dimH(FY + Hb * e + 24, PX, PX + Db * e, "100", ext=FY + Hb * e + 2)
h.dimH(FY - 14, PX + (Db - 14) * e, PX + Db * e, "", ext=FY - 2); h.txt(PX + (Db - 7) * e, FY - 20, "14 (*)", 10, 400, OR, "middle")
# prensacable abajo
h.rect(PX + 35 * e, FY + Hb * e, 26 * e, 12 * e, "url(#ANSI31)", K, .8); h.rect(PX + 40 * e, FY + Hb * e + 12 * e, 16 * e, 20, "#fff", K, .8)
h.globo("2", PX + Db * e - 8, FY + 20, PX + Db * e + 40, FY - 20)
h.globo("5", PX + 48 * e, FY + Hb * e + 12 * e, PX + Db * e + 40, FY + Hb * e + 50)
h.txt(PX + Db * e + 56, FY + Hb * e + 54, "PRENSACABLE 3/4\" BSC o 1/2\" BSP", 9.5, 400)
h.txt(PX + Db * e + 56, FY + Hb * e + 68, "(ZA3 / ZA11, CABLE 6-12 mm)", 9.5, 400)
# ================= D1 SEÑAL «RIESGO ELECTRICO» (6002) =================
DX, DY = 640, 62
h.titulo(DX, DY, "D1 - SEÑAL (6002)", "S/E - MEDIDAS (*)")
cx, cy = DX + 70, DY + 110
h.path(f"M{cx},{cy - 58} L{cx + 62},{cy + 46} L{cx - 62},{cy + 46} Z", "#fff", K, 2.2)
h.path(f"M{cx},{cy - 44} L{cx + 50},{cy + 38} L{cx - 50},{cy + 38} Z", "none", K, .8)
h.path(f"M{cx + 6},{cy - 22} L{cx - 10},{cy + 6} L{cx + 2},{cy + 6} L{cx - 8},{cy + 30} L{cx + 14},{cy - 2} L{cx + 2},{cy - 2} L{cx + 12},{cy - 22} Z", K, K, .8)
h.txt(cx, cy + 66, "RIESGO ELECTRICO", 10, 700, K, "middle")

# ================= INSTALACION (AP-PL-003) =================
IX, IY = 40, 420
h.titulo(IX, IY, "INSTALACION EXTERNA (AP-PL-003)", "S/E - EN COLUMNA EXISTENTE, CUANDO LA CAJA ORIGINAL NO SIRVE O QUEDA BAJA")
k = .06
x0, yb = IX + 90, IY + 230
h.ln(IX + 20, yb, IX + 300, yb, K, 1.6); h.rect(IX + 20, yb, 280, 8, "url(#EARTH)", K, 0)
h.rect(x0 - 8, yb - 3300 * k, 16, 3300 * k, "#fff", K, 1.2)
h.rect(x0 + 8, yb - 2500 * k - 150 * k * 2.2, 100 * k * 2.2, 150 * k * 2.2, "#fff", K, 1.2)
for dy in (20 * k * 2.2, 130 * k * 2.2): h.rect(x0 - 10, yb - 2500 * k - dy - 2, 20 + 100 * k * 2.2, 4, "url(#ANSI31)", K, .5)
h.dimV(x0 - 30, yb, yb - 2500 * k, "2500", ext=x0 - 10)
h.nivel(IX + 230, yb, "±0,00")
h.txt(x0 + 40, yb - 2500 * k - 10, "CAJA 200 x 150 x 100", 10, 700); h.txt(x0 + 40, yb - 2500 * k + 4, "2 JUEGOS DE ABRAZADERAS", 10, 400)
h.txt(x0 + 40, yb - 2500 * k + 18, "MEDIDA = Ø DE LA COLUMNA A 2,50 m", 10, 400)

# ================= TABLA DE CODIGOS =================
dd = {"6003": "200 x 150 x 100 · IP65", "6002": "MEDIDAS (*)"}
yt = h.tabla(40, 680, [(52, "c", True), (520, "l", False), (40, "c", False), (188, "l", False)],
             [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "MEDIDAS (FICHA)"]] + [cat(c, 74) + [dd[str(c)]] for c in (6003, 6002)],
             rowh=17, titulo="CODIGOS DEL PAÑOL (2)", colores=colorOR)
ydat = bloque(h, 40, yt + 26, "DATOS TECNICOS", [
    "ALUMINIO INYECTADO · IP65 · TAPA CON JUNTA Y TORNILLOS IMPERDIBLES.",
    "200 x 150 x 100 mm (TAMBIEN EXISTE 200 x 200 x 100, AP-PL-003).",
    "ENTRADA POR PRENSACABLE; ADENTRO EL TABLERITO AP-CC-014 (RIEL 14 cm, BPN, PORTAFUSIBLES, BULON DE PAT).",
    "ESPESOR DE PARED, OREJAS DE FIJACION Y POSICION DE LOS TORNILLOS (*)"], w=390)
yu = bloque(h, 450, yt + 26, "DONDE SE USA", [
    "AP-PL-003 / ITEM 14.1: CAJA EXTERNA PARA COLUMNA EXISTENTE, A 2,50 m DEL PISO. ITEMIZADO 2026: CAE EN EL ITEM 42.",
    "AP-CC-010 (BARRIO): TABLERO DE COLUMNA EXTERNO CON CAJA ESTANCA (PLANO OFICIAL PENDIENTE).",
    "GUIA «CAJA DE COLUMNA PRFV»: COLUMNAS SIN CAJA INCORPORADA."], w=390)
notasW(h, 40, max(ydat, yu) + 10, [
    "COTAS EN mm: 200 x 150 x 100 (CONEXTUBE, FICHA DE LA APP Y AP-PL-003).",
    "(*) TAPA (14), JUNTA, OREJAS Y TORNILLOS: ESQUEMATICOS, A CONFIRMAR CON EL FABRICANTE.",
    "(*) 6002 (CAJA CON SEÑAL «RIESGO ELECTRICO»): SIN MEDIDAS NI MATERIAL EN LA FICHA. A CONFIRMAR."], w=800)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - CAJA ESTANCA EN LA COLUMNA EXISTENTE", "ALUMINIO INYECTADO, SIN TAPA PARA VER EL TABLERITO; 2 ABRAZADERAS")
setIso(h, 1.9, 1150, 650, True)
# columna existente (acero galvanizado) detrás de la caja
R = 57
cil3(h, (-R - 15, 50, -40), (-R - 15, 50, 190), R, "url(#galv)", "#c8d0d7")
# abrazaderas (2 juegos)
for zc in (35, 115):
    bandaZ(h, zc - 6, zc + 6, -R - 15, 50, R + 2, "url(#galv)")
    h.BOX(-12, 0, 20, 80, zc - 6, zc + 6, "#e0e6eb", "url(#galv)", "#9aa6b0", "#333", .5)
# caja: espalda en x=0, frente (abierto) en x=100; ancho y=0..200, alto z=0..150 → en espejo el frente mira a la izquierda
ALU = ("url(#alu)", "url(#aluF)", "#9aa3ab")
h.BOX(0, 100, -50, 150, 0, 150, "#d9dee2", "url(#aluF)", "#a7afb6", "#333", .7)
# hueco interior (caja abierta): tablerito
q = [(100, -42, 8), (100, 142, 8), (100, 142, 142), (100, -42, 142)]; poly(h, q, "#5b6168", "#333", .6)
q = [(100.1, -30, 25), (100.1, 110, 25), (100.1, 110, 125), (100.1, -30, 125)]; poly(h, q, "url(#galv)", "#333", .6)
txtX(h, 100.2, 40, 30, "TABLERITO AP-CC-014", 8, c="#222")
for i, col in enumerate((GRIS_BPN, GRIS_BPN, GRIS_BPN, CEL_BPN, VER_BPN)):
    yy = -20 + i * 9
    q = [(100.3, yy, 52), (100.3, yy + 8.2, 52), (100.3, yy + 8.2, 98), (100.3, yy, 98)]; poly(h, q, col, "#222", .5)
for i in range(2):
    yy = 40 + i * 19
    q = [(100.3, yy, 40), (100.3, yy + 17.5, 40), (100.3, yy + 17.5, 112), (100.3, yy, 112)]; poly(h, q, "#f4f2ea", "#333", .5)
# prensacable abajo
cil3(h, (50, 50, -14), (50, 50, 0), 10, "url(#niq)", "#d6dbe0")
cil3(h, (50, 50, -40), (50, 50, -14), 5, "#1a1a1a", "#333")
h.g3("1", (50, -50, 120), 1460, 150, "CAJA ALUMINIO IP65 (6003)")
h.g3("3", (100, -10, 75), 930, 200, "BORNES BPN Y PORTAFUSIBLES")
h.g3("5", (50, 50, -8), 1460, 640, "PRENSACABLE (ZA3 / ZA11)")
h.g3("6", (-R - 15 + 59 * .3, 50 + 59 * .95, 112), 1460, 260, "ABRAZADERA (2 JUEGOS)")
h.g3("7", (-R - 15, 50, 170), 1460, 200, "COLUMNA EXISTENTE")
h.txt(890, 1010, "FUENTE: FICHA TECNICA DE LA APP (CONEXTUBE), AP-PL-002, AP-PL-003, AP-CC-014 / 010 Y CATALOGO DEL PAÑOL.", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-CAJA_COLUMNA-1", "CAJA ESTANCA ALUMINIO", "200 x 150 x 100 IP65", "FRENTE, PERFIL, INSTALACION, CODIGOS Y 3D", "1:1 · S/E", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_caja_columna_1.svg"))
