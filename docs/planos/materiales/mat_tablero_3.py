"""MAT-TABLERO-3 (rev. B) · Tablero aéreo de barrio de policarbonato armado completo (3504, ítem 9.03) y base portafusible NH ACR 20–125 A / 500 V (3503, ítem 15.16).
3D: r3d/out/protab_tab3.png (caja con tapa transparente) y protab_tab3_nh.png (base y fusible NH). NH de perfiles_protab.mjs.
Datos: FICHAS_TEC.tablero (barrio: PRFV armado en obra 9.02 o policarbonato armado completo 9.03; 3 bases NH + contactor «C», reloj, térmicas;
15.16 base NH 3503, 15.17 fusible NH 3004, 15.20 minicontactor 3501, 15.15 reloj AT1-R 3502, 15.21–15.25 térmicas, 15.01 / 15.13 fotocontrol y base),
FICHAS_TEC.fusibles (base NH00 30 × 119 × 58,5 · fusible NH00 79 × 58 × 30: medida típica (*) para la base ACR)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from protabkit import *

h = nueva3()
# =============== QUE LLEVA (frente sin tapa, a escala de los aparatos) ===============
h.titulo(40, 62, "TABLERO AEREO DE BARRIO - QUE LLEVA", "FRENTE SIN TAPA · ESC. 1:2,5 · CAJA 320 x 420 x 170 (*)")
s = .82; W, H = 320, 420; ox, oy = 70, 118
Xf = lambda x: ox + (x + W / 2) * s; Zf = lambda z: oy + (H - z) * s
h.rect(Xf(-W / 2), Zf(H), W * s, H * s, "#fff", K, 1.8, 'rx="8"'); h.rect(Xf(-W / 2) + 4, Zf(H) + 4, W * s - 8, H * s - 8, "none", K, .5, 'rx="6"')
h.rect(Xf(-140), Zf(400), 280 * s, 380 * s, "url(#MET)", K, .5)
for x in (-110, -70, -30):
    h.rect(Xf(x - 15), Zf(300 + 59.5), 30 * s, 119 * s, "url(#PLAS2)", K, .9); h.rect(Xf(x - 13), Zf(300 + 26), 26 * s, 52 * s, "url(#CER)", K, .9)
    for zz in (300 + 47.5, 300 - 47.5): h.circ(Xf(x), Zf(zz), 5 * s, "#fff", K, .7)
h.rect(Xf(-135), Zf(175 + 17.5), 270 * s, 35 * s, "none", K, .5, h.OCULTA)
for x, w, t in ((-125, 36, "KM"), (-84, 54, "RELOJ"), (-28, 18, "C10"), (-8, 18, "C10")):
    h.rect(Xf(x), Zf(175 + 42.5), w * s, 85 * s, "#fff", K, .9); h.txt(Xf(x + w / 2), Zf(175) + 3, t, 7, 700, K, "middle")
h.circ(Xf(-57), Zf(219 - 42.5), 19 * s, "#fff", K, .8)
for i in range(6): h.rect(Xf(-120 + i * 8.2), Zf(70 + 26.5), 8.2 * s, 53 * s, "#fff", K, .5)
for x in (-80, 0, 80): h.rect(Xf(x - 12), Zf(0), 24 * s, 26 * s, "#fff", K, .7)
h.dimH(Zf(H) - 9, Xf(-W / 2), Xf(W / 2), "320 (*)", ext=Zf(H) - 2, c=OR); h.dimV(Xf(W / 2) + 14, Zf(H), Zf(0), "420 (*)", ext=Xf(W / 2) + 2, c=OR)
gl = [("1", (-70, 330), (Xf(W / 2) + 44, 150)), ("2", (-107, 200), (Xf(W / 2) + 44, 196)), ("3", (-19, 200), (Xf(W / 2) + 44, 242)), ("4", (-57, 176), (Xf(W / 2) + 44, 288)),
      ("6", (-100, 70), (Xf(W / 2) + 44, 380)), ("5", (W / 2 - 3, 400), (Xf(W / 2) + 44, 108))]
for n, (x, z), (gx, gy) in gl: h.globo(n, Xf(x), Zf(z), gx, gy, r=9)
tx = Xf(W / 2) + 60
for gy, t, c in ((108, "CAJA POLICARBONATO ARMADA (3504) · 9.03", K), (150, "BASE NH ACR (3503) + FUSIBLE NH (3004) POR FASE", K), (164, "ITEMS 15.16 Y 15.17", G),
                 (196, "MINICONTACTOR 20 A (3501) · 15.20", K), (242, "TERMOMAGNETICAS · 15.21-15.25", K), (288, "RELOJ AT1-R (3502) · 15.15", K), (380, "BORNERA (*)", OR)):
    h.txt(tx, gy + 4, t, 9.5, 700 if c == K else 400, c)
h.txt(tx, 430, "EL DE POLICARBONATO VIENE ARMADO: LA CALCULADORA", 9.5, 700); h.txt(tx, 444, "NO COMPUTA SUS ELEMENTOS INTERIORES.", 9.5, 700)
h.txt(tx, 466, "VARIANTE: PRFV ARMADO EN OBRA (AP-T-007, ITEM 9.02).", 9.5, 400)

# =============== D1 BASE NH ===============
h.titulo(470, 500, "D1 - BASE NH ACR Y FUSIBLE NH 00", "ESC. 1:1,25 · MEDIDAS TIPICAS NH00 (*) (DIN 43620)")
nhD1(h, 470, 500)

# =============== TABLAS ===============
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO"]]
for c, d in ((3504, "ITEM 9.03 · VIENE ARMADO"), (3503, "ITEM 15.16 · 1 POR FASE"), (3004, "15.17 · NH 00"), (3501, "15.20"), (3502, "15.15")):
    r = cat(c, 56); filas.append([r[0], r[1], r[2], d])
yt = h.tabla(40, 760, [(52, "c", True), (430, "l", False), (40, "c", False), (278, "l", False)], filas, rowh=16, titulo="CODIGOS DEL PAÑOL", colores=colorOR)
dat = [("DATO", "VALOR"), ("CAJA (3504)", "POLICARBONATO, ARMADA COMPLETA"), ("BASE (3503)", "NH ACR 20-125 A / 500 V"), ("FUSIBLE", "NH 20-100 A (3004), UNO POR FASE"),
       ("COMANDO", "MINICONTACTOR 20 A + RELOJ AT1-R"), ("ENCENDIDO", "FOTOCONTROL Y BASE 15.01 / 15.13")]
ydt = h.tabla(40, yt + 22, [(110, "l", False), (280, "l", False)], dat, rowh=15, titulo="DATOS TECNICOS")
bloque(h, 450, yt + 22, "DONDE SE USA", ["RED AEREA DE BARRIO (LP 21478 ANEXO I): TABLERO AEREO 9.02 (PRFV) O 9.03 (POLICARBONATO).",
       "AP-T-007: TABLERO PRFV ARMADO EN OBRA.", "CALCULADORA BARRIO: TABLERO AEREO, TRANSICION AP-TC-024 Y PAT DE RED."], w=390, sz=10, lh=13.5)
notasW(h, 40, ydt + 14, [
    "COTAS EN mm. LA APP NO TIENE MEDIDAS DE LA CAJA DE POLICARBONATO NI DE LA BASE ACR: CAJA Y DISPOSICION SON ESQUEMA (*).",
    "(*) BASE Y FUSIBLE: MEDIDAS TIPICAS NH00 (DIN 43620) DE LA FICHA «FUSIBLES»; CONFIRMAR CON EL FABRICANTE DE LA BASE ACR.",
    "(*) RELOJ AT1-R Y MINICONTACTOR: FORMA Y ANCHO ESQUEMATICOS. BORNERAS: SEGUN EL FABRICANTE DEL TABLERO ARMADO.",
    "FUENTE: LP 21478 ANEXO I (9.02 / 9.03 / 15.15-15.25), FICHAS TECNICAS DE LA APP, CATALOGO DEL PAÑOL."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - TABLERO AEREO DE POLICARBONATO", "TAPA TRANSPARENTE CERRADA (*) · BASES NH CON FUSIBLE · RELOJ · MINICONTACTOR")
A = img3d(h, "protab_tab3", 892, 84, 520)
columna(h, A, [("caja", "5", "CAJA POLICARBONATO (3504) (*)"), ("tapa", "", "TAPA TRANSPARENTE (*)"), ("nh", "1", "BASE NH ACR (3503)"), ("fus", "", "FUSIBLE NH (3004)"),
               ("mc", "2", "MINICONTACTOR (3501)"), ("reloj", "4", "RELOJ AT1-R (3502)"), ("tm", "3", "TERMOMAGNETICAS"), ("bornes", "6", "BORNERA (*)"),
               ("cierre", "", "CIERRE"), ("prensa", "", "PRENSACABLE")], 1430, 110, 600, paso=34)
h.titulo(890, 640, "BASE NH ACR CON EL FUSIBLE AFUERA", "PINZAS A RESORTE, CUCHILLAS Y BORNES M8 (*)")
A2 = img3d(h, "protab_tab3_nh", 892, 664, 470)
columna(h, A2, [("fusible", "", "FUSIBLE NH 00 gL"), ("oreja", "", "OREJA PARA LA MANIJA"), ("indicador", "", "INDICADOR"), ("cuchilla", "", "CUCHILLA"),
                ("pinza", "", "PINZA A RESORTE"), ("resorte", "", "RESORTE DE ACERO"), ("borne", "", "BORNE M8 (*)"), ("cuerpo", "", "BASE")], 1390, 680, 1000, paso=30)
rotuloMat(h, "MAT-TABLERO-3", "TABLERO AEREO DE BARRIO", "POLICARBONATO · BASE NH", "QUE LLEVA, BASE NH, CODIGOS, DATOS Y 3D", "1:2,5", "D1 1:1,25 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_tablero_3.svg"))
