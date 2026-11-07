"""MAT-COMANDO-1 · Contactor tripolar 25 A (bobina 220 V), selectora automático–manual y llaves encapsuladas.
Datos: FICHAS_TEC.comando (Schneider LC1D25 45 × 85 × 92; AC-1 40 A, AC-3 25 A (400 V); bobina 220 V; 1NA+1NC; selectora y llaves),
FAMILIAS_MAT.comando, AP-T-003 (fotocontrol en la primera columna + cable de comando 3×1,5), catálogo."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
W, H, D = 45, 85, 92
DR, NK = 60, 65      # (*) escalón del frente
e = 1.9
# ================= CONTACTOR: FRENTE =================
h.titulo(40, 62, "CONTACTOR 25 A - FRENTE", "ESC. 2:1 (APROX.) - COTAS EN mm")
FX, FY = 80, 130
h.rect(FX, FY, W * e, H * e, "#fff", K, 1.5)
h.rect(FX + 3, FY + (H - NK) / 2 * e, W * e - 6, NK * e, "none", K, .7)
for i, (tA, tB) in enumerate((("1/L1", "2/T1"), ("3/L2", "4/T2"), ("5/L3", "6/T3"))):
    xc = FX + (7.5 + i * 15) * e
    for zz, tt in ((7, tA), (H - 7, tB)):
        h.circ(xc, FY + zz * e, 3 * e, "#fff", K, .8); h.ln(xc - 2.4 * e, FY + zz * e + 1.6 * e, xc + 2.4 * e, FY + zz * e - 1.6 * e, K, .7)
    h.txt(xc, FY + 18 * e, tA, 8.5, 700, K, "middle"); h.txt(xc, FY + (H - 15) * e, tB, 8.5, 700, K, "middle")
h.rect(FX + 10 * e, FY + 34 * e, 25 * e, 14 * e, "#fff", K, .9); h.txt(FX + W / 2 * e, FY + 43 * e, "A1 · A2", 9.5, 700, K, "middle")
h.rect(FX + 16 * e, FY + 51 * e, 13 * e, 7 * e, "url(#ANSI31)", K, .7)   # visor / pulsador de prueba
h.txt(FX + W * e + 8, FY + 26 * e, "13 NA 14", 9, 400); h.txt(FX + W * e + 8, FY + 62 * e, "21 NC 22", 9, 400)
h.dimH(FY + H * e + 22, FX, FX + W * e, "45", ext=FY + H * e + 2)
h.dimV(FX - 18, FY, FY + H * e, "85", ext=FX - 2)
h.globo("1", FX + 7.5 * e, FY + 7 * e, FX - 10, FY - 30)
h.globo("2", FX + 30 * e, FY + 41 * e, FX + W * e + 60, FY + 40 * e)
h.globo("3", FX + 7.5 * e, FY + (H - 7) * e, FX - 10, FY + H * e + 50)
# ================= PERFIL =================
PX, PY = 330, 130
h.titulo(PX, 62, "PERFIL", "SOBRE RIEL NS35")
perfilModular(h, PX, PY, H, D, e, DR, NK)
h.dimH(PY + H * e + 22, PX, PX + D * e, "92", ext=PY + H * e + 2)
h.dimV(PX + D * e + 9 * e + 20, PY + (H - NK) / 2 * e, PY + (H + NK) / 2 * e, "65 (*)", ext=PX + D * e + 2, c=OR)
h.dimH(PY - 14, PX + DR * e, PX + D * e, "32 (*)", ext=PY + (H - NK) / 2 * e - 2, c=OR)

# ================= ESQUEMA DE COMANDO =================
SX, SY = 40, 400
h.titulo(SX, SY, "ESQUEMA DE COMANDO", "S/E - EL FOTOCONTROL CIERRA LA BOBINA; LA SELECTORA PERMITE PROBAR DE DIA (*)")
y0 = SY + 44; xl = SX + 30
h.ln(xl, y0, xl, y0 + 170, K, 1.4); h.txt(xl, y0 - 6, "L", 11, 700, K, "middle")
xn = SX + 470; h.ln(xn, y0, xn, y0 + 170, K, 1.4); h.txt(xn, y0 - 6, "N", 11, 700, K, "middle")
ym = y0 + 60
h.ln(xl, ym, xl + 40, ym, K, 1.2)
# selectora 2 posiciones
h.circ(xl + 44, ym, 3, "#fff", K, 1); h.ln(xl + 44, ym, xl + 84, ym - 22, K, 1.4)
h.circ(xl + 90, ym - 26, 3, "#fff", K, 1); h.circ(xl + 90, ym + 26, 3, "#fff", K, 1)
h.txt(xl + 30, ym + 58, "SELECTORA (3056 / 3048)", 9.5, 400, K, "start")
h.txt(xl + 98, ym - 30, "AUT", 9.5, 700); h.txt(xl + 98, ym + 36, "MAN", 9.5, 700)
# rama AUT: fotocontrol
h.ln(xl + 93, ym - 26, xl + 150, ym - 26, K, 1.2); h.rect(xl + 150, ym - 40, 70, 28, "#fff", K, 1.2); h.txt(xl + 185, ym - 22, "FOTOC.", 9.5, 700, K, "middle")
h.ln(xl + 220, ym - 26, xl + 280, ym - 26, K, 1.2)
h.txt(xl + 150, ym - 48, "EN LA 1.ª COLUMNA (AP-T-003)", 9, 400, G)
# rama MAN
h.ln(xl + 93, ym + 26, xl + 280, ym + 26, K, 1.2); h.ln(xl + 280, ym - 26, xl + 280, ym + 26, K, 1.2)
h.ln(xl + 280, ym, xl + 320, ym, K, 1.2)
# bobina
h.rect(xl + 320, ym - 12, 44, 24, "#fff", K, 1.4); h.ln(xl + 320, ym + 12, xl + 364, ym - 12, K, 1)
h.txt(xl + 342, ym - 18, "A1      A2", 9, 700, K, "middle"); h.txt(xl + 342, ym + 30, "KM 220 V", 9.5, 700, K, "middle")
h.ln(xl + 364, ym, xn, ym, K, 1.2)
# contactos de potencia
yp = y0 + 140
for i in range(3):
    xx = xl + 330 + i * 26
    h.ln(xx, yp - 20, xx, yp - 6, K, 1); h.ln(xx, yp - 6, xx + 10, yp + 6, K, 1.2); h.ln(xx, yp + 8, xx, yp + 22, K, 1)
h.path(f"M{xl + 342},{ym + 34} V{yp - 2}", "none", K, .6, h.OCULTA)
h.txt(xl + 330 - 10, yp + 4, "SALIDAS DE ALUMBRADO", 9, 400, K, "end")

# ================= D2 SELECTORA Y LLAVE =================
LX, LY = 560, 400
h.titulo(LX, LY, "D2 - SELECTORA Y LLAVE", "S/E - MEDIDAS (*)")
cx, cy = LX + 60, LY + 112
h.circ(cx, cy, 34, "#fff", K, 1.4); h.circ(cx, cy, 26, "#fff", K, .8)
h.rect(cx - 6, cy - 24, 12, 48, "url(#ANSI31)", K, 1, f'transform="rotate(-35 {cx} {cy})"')
h.txt(cx - 46, cy - 26, "AUT", 9.5, 700, K, "middle"); h.txt(cx + 50, cy - 26, "MAN", 9.5, 700, K, "middle")
h.txt(cx, cy + 52, "SELECTORA 2 POS. FIJAS", 9.5, 400, K, "middle"); h.txt(cx, cy + 66, "1NA + 1NC (3056)", 9.5, 400, K, "middle")
h.dimH(cy - 48 - 14, cx - 34, cx + 34, "", ext=cy - 34)
h.txt(cx, cy - 66, "Ø (*)", 10, 400, OR, "middle")
bx, by = LX + 150, LY + 72
h.rect(bx, by, 80, 80, "#fff", K, 1.4); h.rect(bx + 26, by + 18, 28, 44, "#fff", K, 1); h.rect(bx + 30, by + 22, 20, 18, "url(#ANSI31)", K, .7)
h.txt(bx + 40, by + 96, "LLAVE ENCAPSULADA", 9.5, 400, K, "middle"); h.txt(bx + 40, by + 110, "1 PUNTO (3047 / 3048)", 9.5, 400, K, "middle")
h.dimH(by - 12, bx, bx + 80, "", ext=by - 2); h.txt(bx + 40, by - 18, "(*)", 10, 400, OR, "middle")

# ================= TABLA DE CODIGOS =================
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO (FICHA)"]]
dd = {"3005": "45 x 85 x 92 mm (LC1D25)", "3006": "25 A · AC1", "3056": "AUTOMATICO - MANUAL", "3048": "AUTOMATICO - MANUAL", "3047": "LUZ INTERNA DEL TABLERO"}
for c in (3005, 3006, 3056, 3048, 3047):
    r = cat(c, 66); filas.append([r[0], r[1], r[2], dd[str(c)]])
TY = 650
yt = h.tabla(40, TY, [(52, "c", True), (470, "l", False), (40, "c", False), (238, "l", False)], filas, rowh=17, titulo="CODIGOS DEL PAÑOL (5)", colores=colorOR)
ydat = bloque(h, 40, yt + 26, "DATOS TECNICOS", [
    "CONTACTOR TRIPOLAR 25 A, BOBINA 220 V 50 Hz, 1 NA + 1 NC (3005).",
    "AC-1: 40 A · AC-3: 25 A (400 V) (SCHNEIDER LC1D25).",
    "3006: AC1, BOBINA 220 Vca, 1 NA, 25 A. MEDIDAS (*).",
    "MONTAJE EN RIEL DIN NS35."], w=390)
yu = bloque(h, 450, yt + 26, "DONDE SE USA", [
    "TABLERO DE MEDICION Y COMANDO: EL FOTOCONTROL CIERRA LA BOBINA AL ANOCHECER Y SE ENCIENDEN LAS SALIDAS.",
    "AP-T-003: EL FOTOCONTROL VA EN LA 1.ª COLUMNA MAS CERCANA, CON CABLE DE COMANDO 3 x 1,5 HASTA EL TABLERO.",
    "SELECTORA AUT - MAN: PROBAR EL ALUMBRADO DE DIA. LLAVE 3047: LUZ INTERNA."], w=390)
notasW(h, 40, max(ydat, yu) + 10, [
    "COTAS EN mm: 45 x 85 x 92 = SCHNEIDER LC1D25 (FICHA DE LA APP). BORNES SEGUN EN 50005 (1/L1 ... 6/T3, A1-A2, 13-14, 21-22).",
    "(*) ESCALON DEL FRENTE (65 / 32), MEDIDAS DE LA SELECTORA Y DE LA LLAVE ENCAPSULADA: A CONFIRMAR CON EL FABRICANTE.",
    "(*) ESQUEMA DE COMANDO TIPICO: CONFIRMAR CON EL UNIFILAR DEL TABLERO DE CADA PLAZA.",
    "3050 (TOMACORRIENTE) Y 3071 (TOMA 10 A) ESTAN EN LA FICHA PERO SON DE LA FAMILIA «TABLERO»."], w=800)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - CONTACTOR 25 A EN EL RIEL", "CON LOS CABLES DE POTENCIA ARRIBA Y LA BOBINA A1-A2 EN EL FRENTE")
setIso(h, 3.2, 1230, 560, True)
placaV(h, -10, 70, -15, 100)
riel3dV(h, -8, 68, H / 2)
modular3d(h, 0, 3, H, D, NK, DR, palanca=None, ancho=W, mod=15)
# ventana A1-A2 y visor
q = [(8, D, 50), (37, D, 50), (37, D, 38), (8, D, 38)]; poly(h, q, "#e9ecf2", "#555", .5)
txtY(h, 22.5, D, 46, "A1 · A2 · 220 V", 7)
q = [(15, D, 33), (30, D, 33), (30, D, 26), (15, D, 26)]; poly(h, q, "#2d3038", "#000", .5)
txtY(h, 22.5, D, 60, "LC1D25", 8, c="#555")
for i, col in enumerate(("#7b3f1d", "#1a1a1a", "#c62828")):
    xc = 7.5 + 15 * i
    cil3(h, (xc, DR + 1, H - 8), (xc, DR + 26, H - 8), 2.6, col, col)
h.g3("1", (7.5, DR + 22, H - 8), 1520, 200, "ENTRADA L1-L3")
h.g3("2", (22.5, D, 44), 1520, 520, "BOBINA 220 V")
h.g3("3", (37.5, DR, 8), 1520, 700, "SALIDAS T1-T3")
h.g3("4", (60, -2, H / 2 + 17), 930, 760, "RIEL DIN NS35 (2038)")
h.g3("5", (22.5, D, 30), 1520, 600, "VISOR (*)")
h.txt(890, 1010, "FUENTE: FICHA TECNICA DE LA APP (SCHNEIDER LC1D25), FAMILIA «COMANDO», AP-T-003 Y CATALOGO DEL PAÑOL.", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-COMANDO-1", "CONTACTOR 25 A", "SELECTORA Y LLAVES", "FRENTE, PERFIL, ESQUEMA, CODIGOS Y 3D", "2:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_comando_1.svg"))
