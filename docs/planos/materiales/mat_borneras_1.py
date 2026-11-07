"""MAT-BORNERAS-1 · Borne de paso BPN para riel NS35.
Datos: FICHAS_TEC.borneras pieza 1 (tabla Zoloda A/B/C, paso, tensión, corriente), FAMILIAS_MAT.borneras, catálogo del pañol,
CLAUDE.md §11.3 (todas BPN 6; máx. 2 cables por borne), TC-PRFV-01/02. Lo que no está: naranja (*)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
# ================= CORTE A-A (por el eje del borne) · esc 3:1 =================
e = 3.0; X0, YB = 70, 300            # YB = cara de apoyo sobre las alas del riel
h.titulo(40, 62, "CORTE A-A (POR EL EJE DEL BORNE)", "ESC. 3:1 - COTAS EN mm - BPN-06 SOBRE RIEL NS35")
per = perfilBPN()
d = "M" + " L".join(f"{X0 + y * e:.1f},{YB - z * e:.1f}" for y, z in per) + " Z"
h.path(d, "url(#ANSI31)", K, 1.6)
# cavidades: 2 cajas de ajuste (hueco blanco), pozo del tornillo, barra de unión
for yc in (17, 36):
    xc = X0 + yc * e
    h.rect(xc - 6 * e, YB - 22 * e, 12 * e, 13 * e, "#fff", K, .8)              # caja de ajuste
    h.rect(xc - 3.2 * e, YB - 50 * e, 6.4 * e, 28 * e, "#fff", K, .8)           # pozo del tornillo
    h.rect(xc - 2.5 * e, YB - 31 * e, 5 * e, 17 * e, "#fff", K, 1)              # tornillo (vástago)
    for k_ in range(6): h.ln(xc - 2.5 * e, YB - (30 - k_ * 2.6) * e, xc + 2.5 * e, YB - (29 - k_ * 2.6) * e, K, .5)
    h.rect(xc - 3 * e, YB - 33 * e, 6 * e, 2.5 * e, "#fff", K, 1)               # cabeza
    h.ln(X0 + yc * e, YB - 55 * e, X0 + yc * e, YB - 6 * e, K, .5, h.EJE)
h.rect(X0 + 11 * e, YB - 10.5 * e, 31 * e, 2 * e, "url(#cuH)", K, .8)          # barra de unión (pasa la corriente)
# cables con puntera entrando por las dos bocas
for lado in (0, 1):
    if lado == 0: xa, xb = X0 - 42, X0 + 15 * e
    else: xa, xb = X0 + 53 * e + 42, X0 + 38 * e
    yc = YB - 15.5 * e
    s = 1 if lado == 0 else -1
    xm = X0 + (4 if lado == 0 else 49) * e
    h.rect(min(xa, xm), yc - 4.5, abs(xm - xa), 9, "#fff", K, .9)                # aislación
    h.rect(min(xm, xb), yc - 2.6, abs(xb - xm), 5.2, "url(#cuH)", K, .7)         # puntera
h.ln(X0 - 10, YB - 15.5 * e, X0 + 63 * e, YB - 15.5 * e, K, .4, h.EJE)
# riel NS35 en corte, debajo (alas a la altura de YB)
rielCorte(h, X0 + 9 * e, YB, e)
h.txt(X0 + 26.5 * e, YB + 8.5 * e + 14, "RIEL NS35 x 7,5", 10, 400, K, "middle")
# cotas
h.dimV(X0 + 53 * e + 70, YB, YB - 50 * e, "50 (A)", ext=X0 + 41 * e)
h.dimH(YB + 8.5 * e + 34, X0, X0 + 53 * e, "53 (C)", ext=YB - 3 * e)
h.dimH(YB - 50 * e - 22, X0 + 17 * e, X0 + 36 * e, "19 (*)", ext=YB - 50 * e - 4, c=OR)
h.dimH(YB + 8.5 * e + 58, X0 + 9 * e, X0 + 44 * e, "35", ext=YB + 8.5 * e + 20)
# globos
gx = 40
h.globo("1", X0 + 4 * e, YB - 26 * e, 40, 110)
h.globo("2", X0 + 17 * e, YB - 32 * e, 120, 98)
h.globo("3", X0 + 36 * e + 5 * e, YB - 18 * e, X0 + 53 * e + 40, 120)
h.globo("4", X0 + 25 * e, YB - 9.5 * e, X0 + 53 * e + 40, 160)
h.globo("6", X0 - 30, YB - 15.5 * e, 40, YB - 15.5 * e - 40)
h.globo("5", X0 + 15 * e, YB + 4 * e, 40, YB + 40)
h.llamadaDet(X0 + 36 * e, YB - 20 * e, 34, "")
h.txt(X0 + 36 * e + 30, YB - 20 * e - 30, "D1", 11, 700)

# ================= VISTA DE ARRIBA · esc 3:1 =================
VX, VY = 470, 120
h.titulo(VX, 62, "VISTA DE ARRIBA", "ESC. 3:1 - 3 BORNES EN EL RIEL")
pasos = [8.2, 8.2, 8.2]
yy = VY
for i, p in enumerate(pasos):
    h.rect(VX, yy, 53 * e, p * e, "#fff", K, 1.2)
    for yc in (17, 36):
        h.circ(VX + yc * e, yy + p * e / 2, 2.7 * e * .9, "#fff", K, .8); h.ln(VX + yc * e - 6, yy + p * e / 2 + 3, VX + yc * e + 6, yy + p * e / 2 - 3, K, .8)
    h.ln(VX + 12 * e, yy, VX + 12 * e, yy + p * e, K, .4); h.ln(VX + 41 * e, yy, VX + 41 * e, yy + p * e, K, .4)
    yy += p * e
# eje del riel (oculto debajo)
h.ln(VX + 9 * e, VY - 14, VX + 9 * e, yy + 14, K, .5, h.OCULTA); h.ln(VX + 44 * e, VY - 14, VX + 44 * e, yy + 14, K, .5, h.OCULTA)
h.txt(VX + 26.5 * e, yy + 26, "RIEL (OCULTO)", 9.5, 400, G, "middle")
# línea de corte A-A por el eje del borne del medio
ya = VY + 8.2 * e * 1.5
h.ln(VX - 22, ya, VX + 53 * e + 22, ya, K, 1, h.EJE)
for xx in (VX - 22, VX + 53 * e + 22): h.ln(xx, ya - 8, xx, ya + 8, K, 1.8)
h.txt(VX - 30, ya + 4, "A", 13, 700, K, "end"); h.txt(VX + 53 * e + 30, ya + 4, "A", 13, 700)
h.dimV(VX + 53 * e + 50, VY, VY + 8.2 * e, "8,2", ext=VX + 53 * e + 2)
h.txt(VX + 53 * e + 64, VY + 8.2 * e - 2, "PASO", 9.5, 400, G)
h.dimH(VY - 22, VX, VX + 53 * e, "53", ext=VY - 2)

# ================= D1 · CAJA DE AJUSTE · esc 6:1 =================
DX, DY = 480, 236
h.titulo(DX, DY, "D1 - CAJA DE AJUSTE Y PUNTERA", "ESC. 6:1 - MAX. 2 CABLES POR BORNE, SIEMPRE CON PUNTERA")
k6 = 5.0; cx, cy = DX + 120, DY + 100
h.rect(cx - 6 * k6, cy - 6.5 * k6, 12 * k6, 13 * k6, "#fff", K, 1.4)                  # caja (jaula)
h.rect(cx - 6 * k6 + 3, cy - 6.5 * k6 + 3, 12 * k6 - 6, 13 * k6 - 6, "none", K, .5)
h.rect(cx - 2.5 * k6, cy - 6.5 * k6 - 14 * k6 * .55, 5 * k6, 14 * k6 * .55, "#fff", K, 1)   # tornillo
for i in range(7): h.ln(cx - 2.5 * k6, cy - 6.5 * k6 - 2 - i * 5.2, cx + 2.5 * k6, cy - 6.5 * k6 - 6 - i * 5.2, K, .5)
h.rect(cx - 5 * k6, cy - 1.5 * k6, 10 * k6, 2.6 * k6, "url(#cuH)", K, .8)                # puntera apretada
h.rect(cx - 5 * k6, cy + 1.6 * k6, 10 * k6, 2.0 * k6, "url(#cuH)", K, .8)               # barra
h.rect(cx - 6 * k6 - 70, cy - 2.2 * k6, 70, 4.4 * k6, "#fff", K, 1)                       # aislación
h.rect(cx - 6 * k6 - 10, cy - 1.5 * k6, 10 + 6 * k6 - 5 * k6, 2.6 * k6, "url(#cuH)", K, .8)
h.txt(cx + 6 * k6 + 10, cy - 20, "JAULA (CAJA DE AJUSTE)", 10, 400); h.ln(cx + 6 * k6 + 8, cy - 23, cx + 6 * k6 - 3, cy - 23, K, .5)
h.txt(cx + 6 * k6 + 10, cy + 4, "PUNTERA DEL CALIBRE", 10, 400); h.ln(cx + 6 * k6 + 8, cy + 1, cx + 3 * k6, cy - 1, K, .5)
h.txt(cx + 6 * k6 + 10, cy + 24, "BARRA DE UNION", 10, 400); h.ln(cx + 6 * k6 + 8, cy + 21, cx + 3 * k6, cy + 2.6 * k6, K, .5)
h.txt(cx - 6 * k6 - 70, cy - 2.2 * k6 - 8, "CABLE", 10, 400)
h.txt(cx - 2.5 * k6 - 6, cy - 6.5 * k6 - 20, "TORNILLO", 10, 400, K, "end")
h.txt(DX, cy + 52, "ENTRA 1 PUNTERA (O 2 DEL MISMO CALIBRE) ENTRE JAULA Y BARRA.", 10, 400, G)

# ================= TABLA DE CODIGOS =================
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "MODELO / USO"]]
uso = {"2009": "BPN-06 · FASE (EN USO)", "2008": "BPN-06 · NEUTRO (EN USO)", "2010": "BPN-06 · TIERRA (EN USO)", "2007": "BPN-04 · YA NO SE USA",
       "2003": "BPN-06", "2006": "BPN-16", "2004": "BPN-35", "2013": "BPN-04 · NEUTRO", "2014": "BPN-04 · SALIDA AP", "2015": "BPN-06 · NEUTRO",
       "2016": "BPN-06 · SALIDA AP", "2017": "2,5 mm² · COMANDO (*)", "2005": "16 mm² (BPN-16 (*))", "2018": "NEUTRO (*)"}
for c in [2009, 2008, 2010, 2007, 2003, 2006, 2004, 2013, 2014, 2015, 2016, 2017, 2005, 2018]:
    r = cat(c, 66); d_ = r[1]
    filas.append([r[0], d_, r[2], uso[str(c)]])
TY = 400
h.tabla(40, TY, [(52, "c", True), (470, "l", False), (40, "c", False), (238, "l", False)], filas, rowh=17, titulo="CODIGOS DEL PAÑOL (14)", colores=colorOR)
# ================= TABLA DEL FABRICANTE =================
TY2 = TY + 14 + 15 * 17 + 26
filas2 = [["MODELO", "SECCION FLEX./RIG.", "PASO", "A / B / C", "TENSION", "CORRIENTE"],
          ["BPN-04", "4 / 6 mm²", "6,2", "50 / 48 / 53", "800 V", "32 A"],
          ["BPN-06", "6 / 10 mm²", "8,2", "50 / 48 / 53", "800 V", "41 A"],
          ["BPN-16", "16 / 35 mm²", "12,2", "56 / 66 / 71", "800 V", "76 A"],
          ["BPN-35", "35 / 50 mm²", "16,2", "56 / 66 / 71", "800 V", "125 A"]]
yfin = h.tabla(40, TY2, [(66, "l", False), (120, "c", True), (50, "c", True), (100, "c", True), (60, "c", True), (72, "c", True)], filas2, rowh=17,
               titulo="DATOS DEL FABRICANTE (ZOLODA)", colores=lambda i, j, t: NV if i == 2 else K)
h.txt(40, yfin + 14, "EN AZUL EL QUE SE USA EN LA CAJA DE COLUMNA (BPN-06, 6 mm²).", 10, 400, NV)
# ================= DATOS TECNICOS =================
ydat = bloque(h, 530, TY2, "DATOS TECNICOS", [
    "CUERPO DE POLIAMIDA; TORNILLO Y CAJA DE AJUSTE METALICOS.",
    "SE MONTA A PRESION SOBRE RIEL NS35 (EN 60715).",
    "COLORES: GRIS = FASE · CELESTE = NEUTRO · VERDE = TIERRA.",
    "MAX. 2 CABLES POR BORNE, SIEMPRE CON PUNTERA DEL CALIBRE.",
    "MATERIAL DEL TORNILLO, DE LA JAULA Y PAR DE APRIETE (*)"], w=300)
# ================= DONDE SE USA =================
yu = bloque(h, 40, max(yfin + 50, ydat + 10), "DONDE SE USA", [
    "TC-PRFV-01 / TC-PRFV-02 (CAJA DE COLUMNA PRFV): ABAJO N · R · S · T (+ PE CON JABALINA), ARRIBA PE · PE · N CON PEINE. GUIA «CAJA DE COLUMNA PRFV».",
    "AP-CC-014 / AP-CC-015 (TABLERITO DE COLUMNA METALICA): BORNES BPN CON PUENTE SECCIONABLE. METALICA: 1 BORNERA FASE + NEUTRO POR LUMINARIA.",
    "CALCULADORA: TODAS BPN 6 mm² DESDE v067 (2009 · 2008 · 2010), SEA CUAL SEA EL CABLE; LAS PUNTERAS SIGUEN EL CALIBRE DEL CABLE."], w=790)
notasW(h, 40, max(yu + 14, 948), [
    "COTAS EN mm. A Y C SALEN DE LA TABLA DEL FABRICANTE (ZOLODA). EL CONTORNO DEL CUERPO ES ESQUEMATICO.",
    "(*) COTA B (48 / 66) DE LA TABLA ZOLODA: NO SE SABE A QUE MEDIDA DEL DIBUJO CORRESPONDE. A CONFIRMAR CON EL FABRICANTE.",
    "(*) SEPARACION ENTRE TORNILLOS (19), FORMA DE LA JAULA Y DE LA BARRA, Y LOS PIES DE ENGANCHE: A CONFIRMAR CON EL FABRICANTE.",
    "(*) 2017 (2,5 mm² COMANDO), 2005 (16 mm²) Y 2018 (UNIPOLAR DE NEUTRO): SIN MODELO DEL FABRICANTE EN LA FICHA. A CONFIRMAR.",
    "2007 (BPN 4 GRIS) YA NO SE USA: VAN TODAS DE 6 mm². NO SE BORRA DEL PAÑOL."], w=800)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - BORNES BPN 6 EN EL RIEL NS35", "BORNE GRIS (FASE), CELESTE (NEUTRO) Y VERDE (TIERRA), CON EL CABLE ENTRANDO POR LA BOCA")
h.iso(5.2, 1255, 360)
riel3d(h, -14, 70, 9, -7.5)
x = 0
for col, w in ((GRIS_BPN, 8.2), (GRIS_BPN, 8.2), (GRIS_BPN, 8.2), (CEL_BPN, 8.2), (VER_BPN, 8.2)):
    borne3d(h, x, w, 0, 0, col); x += w
# cable con puntera entrando en el borne celeste (por la cara +y)
xc = 8.2 * 3 + 4.1
cilY(h, 92, 60, xc, 13, 3.1, "#4fa3d9", "#4fa3d9")       # aislación celeste
cilY(h, 60, 53.2, xc, 13, 1.9, "url(#cobre)", "#d08a3f")  # puntera
cilY(h, 98, 92, xc, 13, 3.1, "#4fa3d9", "#2f7fb3")
xg = 8.2 * 1 + 4.1
cilY(h, 96, 60, xg, 13, 3.1, "#7b3f1d", "#7b3f1d"); cilY(h, 60, 53.2, xg, 13, 1.9, "url(#cobre)", "#d08a3f")
h.g3("1", (8.2 * 2 + 4, 40, 40), 1420, 150, "CUERPO DE POLIAMIDA (GRIS = FASE)")
h.g3("2", (8.2 * 4 + 4.1, 36, 50), 1420, 196, "TORNILLO DE AJUSTE")
h.g3("3", (8.2 * 4 + 4.1, 53, 13), 1420, 560, "BOCA DE ENTRADA (CAJA DE AJUSTE)")
h.g3("5", (66, 22, 0), 1420, 470, "RIEL DIN NS35 (2038)")
h.g3("6", (xc, 82, 13), 950, 600, "CABLE CON PUNTERA")
h.g3("7", (8.2 * 3 + 4, 30, 50), 1420, 242, "CELESTE = NEUTRO (2008)")
h.g3("8", (8.2 * 4 + 6, 20, 46), 1420, 288, "VERDE = TIERRA (2010)")
# vista chica: un borne solo, para ver el perfil
h.txt(890, 700, "ORDEN EN LA CAJA DE COLUMNA PRFV (TC-PRFV-01)", 12, 700, NV, "start", INT)
ox, oy = 900, 720
for i, (col, t) in enumerate([(VER_BPN, "PE"), (VER_BPN, "PE"), (CEL_BPN, "N"), ("#fff", ""), ("#f6f4ee", "S"), ("#f6f4ee", "T")]):
    w = 30 if t else 10
    xx = ox + sum(30 if q else 10 for _, q in [(0, "PE"), (0, "PE"), (0, "N"), (0, ""), (0, "S"), (0, "T")][:i])
    h.rect(xx, oy, w, 60, col, "#333", .7)
    if t: h.txt(xx + w / 2, oy + 36, t, 11, 700, "#fff" if col in (VER_BPN, CEL_BPN) else K, "middle", INT)
h.rect(ox - 4, oy + 50, 98, 5, "url(#cobre)", "#6c3210", .5)
h.txt(ox + 175, oy + 22, "ARRIBA: PE · PE · N CON PEINE (2027) + 2 PORTAFUSIBLES (S, T)", 11, 400, K, "start", INT)
ox2, oy2 = 900, 800
for i, (col, t) in enumerate([(CEL_BPN, "N"), ("#333", ""), (GRIS_BPN, "R"), (GRIS_BPN, "S"), (GRIS_BPN, "T")]):
    w = 30 if t else 8
    xx = ox2 + sum(30 if q else 8 for _, q in [(0, "N"), (0, ""), (0, "R"), (0, "S"), (0, "T")][:i])
    h.rect(xx, oy2, w, 60, col, "#333", .7)
    if t: h.txt(xx + w / 2, oy2 + 36, t, 11, 700, "#fff" if col == CEL_BPN else K, "middle", INT)
h.txt(ox + 175, oy2 + 22, "ABAJO: N · SEPARADOR (2041) · R · S · T", 11, 400, K, "start", INT)
h.txt(ox + 175, oy2 + 40, "CON JABALINA (TC-PRFV-02): PE · N · R · S · T", 11, 400, K, "start", INT)
h.txt(890, 900, "FUENTE: FICHA TECNICA DE LA APP (ZOLODA, TABLA DE SELECCION DE BORNES) Y CATALOGO DEL PAÑOL.", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-BORNERAS-1", "BORNE DE PASO BPN", "PARA RIEL NS35", "CORTE, VISTA DE ARRIBA, DETALLE, CODIGOS Y 3D", "3:1 · 6:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_borneras_1.svg"))
