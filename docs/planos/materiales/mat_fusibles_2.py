"""MAT-FUSIBLES-2 · Fusibles 8,5×31,5, Neozed D01 y borne portafusible 5×20 (comando y fotocontrol).
Datos: FICHAS_TEC.fusibles pieza 2 (3002 base 8×31 1 polo DIN 25 A; 3014/3015 8,5×31,5 2 A / 4 A; Neozed D01 rosca E14 2–16 A;
3003 borne seccionable 5×20 cable 4 mm²; IEC 60269; Legrand 005806), CLAUDE.md §11.3 (3014 no entra en 3053), AP-CC-014."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
def fusibleCil(x, y, L, Dm, k, cap, texto="", oran=False):
    h.rect(x + cap * k, y - Dm * k / 2 + 1.5, (L - 2 * cap) * k, Dm * k - 3, "#fff", K, 1)
    for xx in (x, x + (L - cap) * k): h.rect(xx, y - Dm * k / 2, cap * k, Dm * k, "url(#cuH)", K, 1)
    h.ln(x - 10, y, x + L * k + 10, y, K, .4, h.EJE)
    if texto: h.txt(x + L * k / 2, y + 4, texto, 9.5, 700, K, "middle")
# ================= D1 FUSIBLE 8,5 x 31,5 =================
k = 4.5
h.titulo(40, 62, "D1 - FUSIBLE CERAMICO 8,5 x 31,5", "ESC. 9:2 - COTAS EN mm - 2 A (3014) · 4 A (3015)")
x, y = 70, 150
fusibleCil(x, y, 31.5, 8.5, k, 5, "2 A")
h.dimH(y + 8.5 * k / 2 + 24, x, x + 31.5 * k, "31,5", ext=y + 8.5 * k / 2 + 2)
h.dimV(x + 31.5 * k + 24, y - 8.5 * k / 2, y + 8.5 * k / 2, "Ø8,5", ext=x + 31.5 * k + 2)
h.dimH(y - 8.5 * k / 2 - 14, x, x + 5 * k, "", ext=y - 8.5 * k / 2 - 2); h.txt(x + 2.5 * k, y - 8.5 * k / 2 - 20, "5 (*)", 10.5, 400, OR, "middle")
# ================= D2 FUSIBLE 5 x 20 =================
h.titulo(40, 270, "D2 - FUSIBLE 5 x 20 (BORNE 3003)", "ESC. 9:2")
x, y = 70, 340
fusibleCil(x, y, 20, 5, k, 4)
h.dimH(y + 5 * k / 2 + 24, x, x + 20 * k, "20", ext=y + 5 * k / 2 + 2)
h.dimV(x + 20 * k + 24, y - 5 * k / 2, y + 5 * k / 2, "Ø5", ext=x + 20 * k + 2)
h.txt(x + 20 * k + 60, y + 4, "TIPO Y AMPERAJE (*)", 10, 400, OR)
# ================= D3 NEOZED D01 =================
h.titulo(330, 62, "D3 - FUSIBLE NEOZED D01", "S/E - ROSCA E14 · 2 A (3018) · 6 A (3019)")
x, y = 360, 160; k3 = 3.2
h.path(f"M{x},{y - 5.5 * k3} h{20 * k3} l{4 * k3},{2 * k3} v{7 * k3} l{-4 * k3},{2 * k3} h{-20 * k3} z", "#fff", K, 1.2)
h.rect(x + 24 * k3, y - 2.5 * k3, 7 * k3, 5 * k3, "url(#cuH)", K, .9)
h.rect(x - 6 * k3, y - 3.5 * k3, 6 * k3, 7 * k3, "url(#cuH)", K, .9)
h.circ(x - 6 * k3, y, 1.4 * k3, "#fff", K, .7)
h.ln(x - 14 * k3, y, x + 36 * k3, y, K, .4, h.EJE)
h.txt(x + 10 * k3, y + 4, "2 A", 9.5, 700, K, "middle")
h.dimH(y + 5.5 * k3 + 22, x - 6 * k3, x + 31 * k3, "(*)", ext=y + 5.5 * k3 + 2, c=OR)
h.dimV(x + 31 * k3 + 30, y - 5.5 * k3, y + 5.5 * k3, "Ø (*)", ext=x + 24 * k3, c=OR)
h.txt(x - 6 * k3, y - 5.5 * k3 - 10, "INDICADOR (*)", 9.5, 400, OR, "middle")
h.txt(x, y + 5.5 * k3 + 52, "VA DENTRO DE UNA BASE Y TAPA ROSCADA E14 (NO HAY CODIGO DE BASE NEOZED EN LA FICHA)", 9.5, 400, G)

# ================= BASE 3002 Y BORNE 3003 (FRENTE) =================
h.titulo(330, 270, "BASE 8 x 31 (3002) Y BORNE 5 x 20 (3003)", "S/E - VISTA DE FRENTE · MEDIDAS (*)")
e = 2.0
bx, by = 380, 320
h.rect(bx, by, 17.5 * e, 80 * e, "#fff", K, 1.5); h.rect(bx + 3, by + 22 * e, 17.5 * e - 6, 36 * e, "#fff", K, 1)
for zz in (8, 72): h.circ(bx + 8.75 * e, by + zz * e, 3 * e, "#fff", K, .8)
h.txt(bx + 8.75 * e, by + 80 * e + 18, "3002", 10, 700, K, "middle", MONO)
h.dimH(by - 12, bx, bx + 17.5 * e, "", ext=by - 2); h.txt(bx + 8.75 * e, by - 18, "(*)", 10, 400, OR, "middle")
cx_ = bx + 110
h.rect(cx_, by + 10, 8.2 * e, 65 * e, "#fff", K, 1.5); h.rect(cx_ + 2, by + 26 * e, 8.2 * e - 4, 26 * e, "url(#ANSI31)", K, .8)
for zz in (14, 66): h.circ(cx_ + 4.1 * e, by + zz * e, 2.6 * e, "#fff", K, .8)
h.txt(cx_ + 4.1 * e, by + 80 * e + 18, "3003", 10, 700, K, "middle", MONO)
h.txt(cx_ + 30, by + 40 * e, "TAPA SECCIONABLE", 9.5, 400); h.txt(cx_ + 30, by + 40 * e + 14, "CON EL 5 x 20 ADENTRO", 9.5, 400)
h.txt(cx_ + 30, by + 40 * e + 34, "CABLE 4 mm²", 9.5, 700)

# ================= TABLA DE CODIGOS =================
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO (FICHA)"]]
dd = {"3002": "25 A · 1 POLO DIN", "3014": "2 A", "3015": "4 A", "3018": "NEOZED D01 · 2 A", "3019": "NEOZED D01 · 6 A", "3003": "CABLE 4 mm²"}
for c in (3002, 3014, 3015, 3018, 3019, 3003):
    r = cat(c, 66); filas.append([r[0], r[1], r[2], dd[str(c)]])
TY = 540
yt = h.tabla(40, TY, [(52, "c", True), (470, "l", False), (40, "c", False), (238, "l", False)], filas, rowh=17, titulo="CODIGOS DEL PAÑOL (6)", colores=colorOR)
ydat = bloque(h, 40, yt + 26, "DATOS TECNICOS", [
    "FUSIBLES CHICOS PARA CIRCUITOS DE COMANDO Y PROTECCION DEL FOTOCONTROL.",
    "8,5 x 31,5: CERAMICO, 2 A Y 4 A. BASE 3002: 8 x 31, 1 POLO DIN, 25 A (LEGRAND 005806).",
    "NEOZED D01: ROSCA E14, DE 2 A 16 A (IEC 60269).",
    "BORNE 3003: PORTAFUSIBLE SECCIONABLE 5 x 20, PARA CABLE DE 4 mm²."], w=390)
yu = bloque(h, 450, yt + 26, "DONDE SE USA", [
    "TABLERO: COMANDO Y FOTOCONTROL.",
    "AP-CC-014 (HOJA A): 3 BASES BMF 8,5 x 31,5 CON FUSIBLE CERAMICO DE 4 A, UNA POR FASE (PLANO OFICIAL).",
    "EN LA CAJA DE COLUMNA PRFV SE USA LA TABAQUERA 10 x 38 (MAT-FUSIBLES-1)."], w=390)
notasW(h, 40, max(ydat, yu) + 10, [
    "COTAS EN mm. Ø8,5 x 31,5 Y Ø5 x 20 SALEN DE LA DESCRIPCION DEL PAÑOL / FICHA.",
    "EL 3014 (8,5 x 31,5) NO ENTRA EN LA TABAQUERA 10 x 38 (3053): NO MEZCLARLOS.",
    "(*) LARGO DE LOS CASQUILLOS, MEDIDAS DEL NEOZED D01, DE LA BASE 3002 Y DEL BORNE 3003: A CONFIRMAR CON EL FABRICANTE.",
    "(*) AP-CC-014 PIDE 8,5 x 31,5 CON 4 A POR FASE; LA OBRA 2026 USA 10 x 38 CON 2 A POR ARTEFACTO (VER CLAUDE.md §11.3)."], w=800)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - BASE 8 x 31 Y BORNE 5 x 20 EN EL RIEL", "CON LOS FUSIBLES SUELTOS AL LADO: 8,5 x 31,5 · 5 x 20 · NEOZED D01")
setIso(h, 3.3, 1230, 520, True)
placaV(h, -42, 26, -15, 95)
riel3dV(h, -40, 24, 40)
# borne 3003 (8,2 de ancho (*), tapa seccionable)
per = [(0, 5), (50, 5), (50, 60), (36, 75), (14, 75), (0, 60)]
prisma(h, per, -30, -21.8, ("#b7bbc1", "#8b9097", "#6b7077"), "#222", .5)
prisma(h, [(30, 66), (52, 44), (56, 48), (34, 70)], -29, -22.8, ("#fbfbf8", "#ecebe5", "#c9c7bd"), "#333", .5)
# base 3002 (modular 1 polo, medidas (*))
modular3d(h, 0, 1, 80, 60, 40, 44, palanca=None, ancho=17.5, mod=17.5)
q = [(3, 60, 22), (14.5, 60, 22), (14.5, 60, 58), (3, 60, 58)]; poly(h, q, "#e2e0d8", "#555", .5)
txtY(h, 8.75, 60, 44, "8x31", 7)
# cables
for xc, col in ((8.75, "#1a1a1a"), (-25.9, "#4fa3d9")):
    cil3(h, (xc, 44, 72 if xc < 10 else 66), (xc, 70, 72 if xc < 10 else 66), 2.0, col, col)
# fusibles sueltos
setIso(h, 3.6, 1000, 740, True)
cil3(h, (0, 0, 0), (5, 0, 0), 4.25, "url(#niq)"); cil3(h, (5, 0, 0), (26.5, 0, 0), 4.25, "url(#ceram)"); cil3(h, (26.5, 0, 0), (31.5, 0, 0), 4.25, "url(#niq)")
setIso(h, 3.6, 1160, 760, True)
cil3(h, (0, 0, 0), (4, 0, 0), 2.5, "url(#niq)"); cil3(h, (4, 0, 0), (16, 0, 0), 2.5, "#dfe9f2"); cil3(h, (16, 0, 0), (20, 0, 0), 2.5, "url(#niq)")
setIso(h, 3.6, 1310, 770, True)
cil3(h, (0, 0, 0), (6, 0, 0), 3.5, "url(#bronce)"); cil3(h, (6, 0, 0), (26, 0, 0), 5.5, "url(#ceram)"); cil3(h, (26, 0, 0), (31, 0, 0), 2.5, "url(#bronce)")
h.txt(985, 830, "8,5 x 31,5 (3014/3015)", 10.5, 700, NV, "middle", INT)
h.txt(1150, 830, "5 x 20 (*)", 10.5, 700, NV, "middle", INT)
h.txt(1330, 860, "NEOZED D01 (3018/3019)", 10.5, 700, NV, "middle", INT)
setIso(h, 3.3, 1230, 520, True)
h.g3("1", (8.75, 60, 44), 1440, 400, "BASE 8 x 31 · 1 POLO (3002)")
h.g3("2", (-25.9, 50, 62), 1440, 200, "BORNE SECCIONABLE 5 x 20 (3003)")
h.g3("3", (-36, -2, 57), 1440, 520, "RIEL DIN NS35 (2038)")
h.txt(890, 1010, "FUENTE: FICHA TECNICA DE LA APP (IEC 60269, LEGRAND 005806), CLAUDE.md §11.3, AP-CC-014 Y CATALOGO DEL PAÑOL.", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-FUSIBLES-2", "FUSIBLES 8,5 x 31,5,", "NEOZED Y BORNE 5 x 20", "DETALLES, FRENTES, CODIGOS Y 3D", "9:2", "S/E · 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_fusibles_2.svg"))
