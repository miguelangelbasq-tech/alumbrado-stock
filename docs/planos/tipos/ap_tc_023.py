"""AP-TC-023 · Pintura de columnas metálicas, tipos 1, 2 y 3 (D.G.A.P. oct. 2021).
Datos: ficha AP-TC-023; calculadora v130 (sección PINTURA: qué lleva cada tipo, colores, espesores ETG cap. 1.3, columna nueva / instalada,
columnas oxidadas A/B/C, pintura asfáltica 8023 = 2 caras × π × Ø × (emp. + 0,30), dieléctrica hasta 2,50 m, tramos 3.03-3.08);
COLUMNA_MET (Ø y empotramiento). Corrige la ficha (REVISION A.3): la asfáltica YA se computa (8023) y se describen los 3 tipos."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
import tabmet as T, colmet as M
h = Hoja(); h.a(M.DEFS)
POL, SIN, ANTI, CONV, ACERO, ASF, HORM = "#6f767a", "#8b9195", "#3f4249", "#a3392b", "#b9c2c9", "#1d1b19", "#b9bdc2"
# ================= TRES TIPOS (vistas) =================
h.titulo(40, 62, "VISTAS - TIPOS 1, 2 Y 3", "ESC. 1:60 - COLUMNA TIPO C (7 m LIBRES) - ZONAS DE PINTURA")
k = .052; y0 = 560
for i, (tit, cx) in enumerate((("TIPO 1", 80), ("TIPO 2", 265), ("TIPO 3", 450))):
    Y = lambda z: y0 - z * k
    if i < 2:
        M.elev(h, cx, y0, k, asf=0, caja=False)
        # zonas: 0-2500 y asfáltica (-700 a +300)
        d = 114 * k
        h.rect(cx - d / 2, Y(2500), d, Y(0) - Y(2500), "url(#ANSI37)" if i == 0 else "url(#ANSI31)", K, .8)
        h.rect(cx - d / 2, Y(300), d, Y(-700) - Y(300), "url(#ASFH)", K, .8)
    else:   # columna de hormigón
        h.rect(cx - 26, y0, 52, 60, "url(#EARTH)", K, 0); h.ln(cx - 26, y0, cx + 26, y0, K, 1.6)
        h.path(f"M{cx-7},{y0+40} L{cx-4.5},{Y(7000)} L{cx+4.5},{Y(7000)} L{cx+7},{y0+40} Z", "url(#CONC)", K, 1.1)
        h.ln(cx, Y(7000) - 10, cx, y0 + 50, K, .45, h.EJE)
    h.txt(cx, y0 + 80 if i < 2 else y0 + 80, tit, 12, 700, K, "middle")
    xr = cx + 36
    if i < 2:
        h.dimV(cx - 26, Y(0), Y(2500), "2.500", ext=cx - 4); h.dimV(cx - 26, Y(-700), Y(300), "700 + 300", ext=cx - 4)
    lines = {0: [(5200, "CONVERTIDOR SI HACE FALTA"), (4900, "+ SINTETICO RAL 7043"), (1700, "CONVERTIDOR DE OXIDO"), (1400, "+ POLIURETANICA 7043"), (150, "ASFALTICA ADENTRO"), (-150, "Y AFUERA")],
             1: [(5200, "IGUAL QUE EL TIPO 1"), (1700, "ANTIPEGATINA 7024"), (1400, "DIELECTRICA 1 kV"), (1100, "+ CUERPO Y TAPA"), (150, "ASFALTICA ADENTRO"), (-150, "Y AFUERA")],
             2: [(5200, "SOLO HORMIGON:"), (4900, "CEPILLO DURO, AGUA"), (4600, "A PRESION CON LAVAN-"), (4300, "DINA, REPARACION Y"), (4000, "LATEX EN TODA")]}[i]
    for z, t in lines: h.txt(xr, Y(z), t, 8, 700 if t[0] != "+" else 400)
    if i < 2:
        h.ln(cx + 4, Y(1550), xr - 2, Y(1550) - 6, K, .4); h.ln(cx + 4, Y(5000), xr - 2, Y(5000) - 6, K, .4); h.ln(cx + 4, Y(0), xr - 2, Y(150) - 4, K, .4)
h.rayados(40, 700, [("ANSI37", "TRAMO 0-2.500 TIPO 1"), ("ANSI31", "TRAMO 0-2.500 TIPO 2"), ("ASFH", "PINTURA ASFALTICA"), ("CONC", "HORMIGON")], cols=2, dx=200)
# ================= D1 CAPAS =================
h.titulo(600, 62, "D1 - CAPAS DE PINTURA", "S/E - CORTE DE LA PARED, ETG CAP. 1.3")
X1, Y1 = 640, 135
h.rect(X1, Y1, 60, 180, "url(#ANSI31)", K, 1.0); h.txt(X1 + 30, Y1 + 200, "ACERO", 9, 700, K, "middle")
h.rect(X1 + 60, Y1, 14, 180, "url(#ANSI37)", K, .8); h.rect(X1 + 74, Y1, 22, 180, "#fff", K, .8)
h.dimH(Y1 - 10, X1 + 60, X1 + 74, "≥50", ext=Y1 - 2); h.dimH(Y1 - 24, X1 + 74, X1 + 96, "≥80", ext=Y1 - 2)
h.dimH(Y1 + 214, X1 + 60, X1 + 96, "≥130 µm", ext=Y1 + 182)
h.txt(X1 + 104, Y1 + 40, "BASE (CONVERTIDOR,", 9, 700); h.txt(X1 + 104, Y1 + 54, "EPOXI O ANTIOXIDO)", 9, 700)
h.txt(X1 + 104, Y1 + 90, "TERMINACION", 9, 700); h.txt(X1 + 104, Y1 + 104, "(POLIURETANICA,", 9, 400); h.txt(X1 + 104, Y1 + 118, "SINTETICO O", 9, 400); h.txt(X1 + 104, Y1 + 132, "ANTIPEGATINA)", 9, 400)
h.txt(X1, Y1 + 248, "IRAM 1109 B2 · ENSAYOS IRAM 1023 Y 1107", 9, 400, G)
# ================= D2 EMPOTRAMIENTO =================
h.titulo(600, 410, "D2 - ZONA DE EMPOTRAMIENTO", "S/E - TIPO C, ASFALTICA POR DENTRO Y POR FUERA")
kv = .25; cx2, y02 = 700, 580; wr = 34
h.rect(cx2 - 140, y02, 280, 160, "url(#EARTH)", K, 0); h.rect(cx2 - 105, y02, 210, 160, "url(#CONC)", K, .8)
h.ln(cx2 - 140, y02, cx2 + 140, y02, K, 1.6)
h.path(f"M{cx2-140},{y02+160} l30,0 l6,-6 l6,12 l6,-6 l184,0 l6,-6 l6,12 l6,-6 l30,0", "none", K, .6)
h.rect(cx2 - wr + 3, y02, 2 * wr - 6, 160, "#fff", "none", 0)
ya = y02 - 300 * kv; ytop = y02 - 120
for sx in (-1, 1):
    xw = cx2 + sx * wr
    h.rect(xw - 3, ytop, 6, y02 + 160 - ytop, "url(#ANSI31)", K, .8)
    for dx in (-5.5, 3): h.rect(xw + dx, ya, 2.5, y02 + 160 - ya, K, K, 0)
h.path(f"M{cx2-wr-6},{ytop} l6,-6 l{wr},8 l{wr},-6 l6,6", "none", K, .6)
h.dimV(cx2 + 116, ya, y02, "300", ext=cx2 + wr + 6)
h.dimV(cx2 + 116, y02, y02 + 160, "700 EMP.", ext=cx2 + wr + 6)
h.ln(cx2 - wr - 20, y02 - 200 * kv, cx2 + wr + 20, y02 - 200 * kv, OR, .8, 'stroke-dasharray="4 2"'); h.txt(cx2 - wr - 24, y02 - 200 * kv + 3, "200 (AP-PL-001) (*)", 8.5, 400, OR, "end")
h.txt(cx2 - wr - 24, ya - 20, "PARED Ø114", 8.5, 700, K, "end"); h.ln(cx2 - wr - 22, ya - 23, cx2 - wr, ya - 30, K, .4)
h.txt(cx2 - 140, y02 + 182, "NEGRO = ASFALTICA FRIA (8023) POR DENTRO Y POR FUERA", 9, 700)
# ================= CUADROS =================
rows = [("COLUMNA", "Ø", "EMP.", "m² ASFALTICA (8023)")]
for t, d, e in (("C 7 m", 114, .70), ("D 8 m", 140, .80), ("F 10 m", 140, 1.00), ("H 12 m", 168, 1.20), ("K 14 m", 168, 1.40)):
    m2 = 2 * math.pi * d / 1000 * (e + .3); rows.append((t, str(d), T.f(e, 2), f"2 × π × {T.f(d/1000,3)} × {T.f(e+.3,2)} = {T.f(m2,2)}"))
h.tabla(40, 790, [(70, "l", False), (40, "c", True), (50, "c", True), (250, "l", False)], rows, rowh=18, titulo="COMPUTO PINTURA ASFALTICA POR COLUMNA")
rows2 = [("RENGLON DEL PLIEGO", "ITEMS"), ("HASTA 9 m", "3.3"), ("HASTA 12 m", "3.4"), ("MAS DE 12 m", "3.5"), ("TIPO × TRAMO", "3.03 A 3.08"), ("EXISTENTE", "ITEM 41")]
h.tabla(470, 790, [(140, "l", False), (90, "c", True)], rows2, rowh=18, titulo="SE COBRA POR COLUMNA")
rows3 = [("OXIDADA", "QUE SE HACE (ETG)"), ("A BASE OXIDADA", "ESMERILAR + 2 CONV. + 2 POLIUR."), ("B PICADA", "DECAPAR Y LO MISMO"), ("C PERFORADA", "SE CAMBIA LA COLUMNA")]
h.tabla(470, 920, [(110, "l", False), (260, "l", False)], rows3, rowh=18)
h.notas(40, 1005, [
 "COTAS EN mm. ANTES DE TODO: LIMPIEZA (OXIDO, GRASA, PAPEL). NUEVA: ARENADO, EPOXI O ANTIOXIDO, 2.ª MANO YA INSTALADA.",
 "LA PINTURA ASFALTICA SI SE COMPUTA (8023): EMPOTRAMIENTO + 300, POR DENTRO Y POR FUERA (ETG CAP. 1.3).",
 "TIPO 1: CONVERTIDOR + POLIURETANICA EN 0-2.500. TIPO 2: ANTIPEGATINA RAL 7024. TIPO 3: SOLO HORMIGON, LATEX.",
 "LA INSPECCION DEFINE TIPO 1 O 2 POR PLAZA (LOS 6 PROYECTOS LEIDOS USAN TIPO 1). SECADO 1 h ANTES DE RELLENAR.",
 "(*) ASFALTICA: 300 SOBRE EL EMPOTRAMIENTO (ETG, LO QUE CALCULA HOY) O 200 (AP-PL-001). A DECIDIR.",
 "(*) LITROS DE CONVERTIDOR, POLIURETANICA, SINTETICO Y ANTIPEGATINA: SIN COMPUTAR NI CODIGO (9002 «PINTURA GRIS»)."])
# ================= 3D =================
h.titulo(880, 62, "VISTA 3D - TIPOS 1 Y 2 Y LA BASE EN CORTE", "IZQ.: LAS DOS COLUMNAS HASTA 3 m · DER.: LA BASE CON LAS CAPAS EN ESCALON Y EL SUELO CORTADO A UN CUARTO")
for ox, tipo in ((960, 1), (1050, 2)):
    h.iso(.105, ox, 530)
    h.BOX(-400, 400, -400, 400, -60, 0, "url(#grass)", "url(#soil3)", "url(#soil3)", "#3a2a1a", .5)
    M.col3d(h, [(114, 3000)], 0, [(0, 300, ASF), (300, 2500, POL if tipo == 1 else ANTI), (2500, 3000, SIN)], zmax=3000)
    p = h.P(0, 0, 3000); h.path(f"M{p[0]-9},{p[1]-4} l6,-4 l4,6 l6,-4", "none", "#333", .8)
    q = h.P(400, 400, -60); h.txt(q[0] - 40, q[1] + 22, f"TIPO {tipo}", 11, 700, NV, "middle", INT)
# zoom de la base
h.iso(.2, 1290, 330)
A = 330
h.BOX(-A, 0, -A, A, -900, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
h.BOX(0, A, -A, 0, -900, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
h.BOX(0, 300, 0, 300, -900, -40, "url(#conc3)", "url(#conc3)", "url(#conc3)", "#555", .6)   # fundación cortada (cuarto)
T.cyl(h, 0, 0, 57, -80, 170, -700, 300, "#1d1b19")
T.cyl(h, 0, 0, 57, -80, 170, 300, 950, POL)
# capas en escalón: acero → convertidor → poliuretánica (sector de adelante)
T.cyl(h, 0, 0, 57.4, 0, 30, 380, 950, ACERO); T.cyl(h, 0, 0, 57.6, 30, 60, 380, 950, CONV)
T.ring(h, 0, 0, 57, 53, 950, 0, 360, "#c8cdd1")
p0 = h.P(0, 0, 950); h.path(f"M{p0[0]-20},{p0[1]+2} l8,-6 l6,8 l8,-6 l8,6", "none", "#333", .8)
gy = 120
def g(n, p, t, c=NV):
    global gy; h.g3(n, p, 1500, gy, t, c); gy += 40
g("1", (40, 40, 800), "POLIURETANICA 7043")
g("2", (57 * math.cos(math.radians(45)), 57 * math.sin(math.radians(45)), 600), "CONVERTIDOR DE OXIDO")
g("3", (57 * math.cos(math.radians(15)), 57 * math.sin(math.radians(15)), 500), "ACERO ARENADO")
g("4", (45, 35, 100), "ASFALTICA FRIA (8023)")
g("5", (45, 35, -400), "ASFALTICA ENTERRADA")
g("6", (300, 150, -300), "FUNDACION H-13")
g("7", (-200, A, -500), "TIERRA")
h.iso(.105, 1050, 530); a8 = h.P(40, 40, 1500); h.globo("8", a8[0], a8[1], 925, 150, NV, 12); h.txt(943, 154, "ANTIPEGATINA 7024", 11, 700, NV)
h.iso(.105, 960, 530); a9 = h.P(40, 40, 2800); h.globo("9", a9[0], a9[1], 925, 190, NV, 12); h.txt(943, 194, "SINTETICO RAL 7043", 11, 700, NV)
LISTA = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
 ("1", "PINTURA POLIURETANICA GRIS RAL 7043 (TIPO 1, 0-2.500)", "S/ FICHA", "A VINCULAR"),
 ("2", "CONVERTIDOR DE OXIDO ROJO (O SUS TONALIDADES)", "S/ FICHA", "A VINCULAR"),
 ("3", "LIMPIEZA: ARENADO / GRANALLADO (NUEVA) · RASQUETEO (EXISTENTE)", "-", "MANO DE OBRA"),
 ("4", "PINTURA ASFALTICA FRIA, EMP. + 300, DENTRO Y FUERA (TIPO C)", "0,72 m²", "8023"),
 ("6", "FUNDACION H-13 0,60×0,60×0,90 (AP-TC-003)", "1", "AP-TC-003"),
 ("8", "PINTURA ANTIPEGATINA DIELECTRICA RAL 7024 (TIPO 2)", "S/ FICHA", "A VINCULAR"),
 ("9", "ESMALTE SINTETICO GRIS RAL 7043 (DE 2.500 PARA ARRIBA) (*)", "S/ FICHA", "9002 (*)"),
 ("10", "TIPO 3 (HORMIGON): LAVANDINA, REPARACION, LATEX EXTERIOR", "S/ FICHA", "A VINCULAR"),
 ("11", "EPOXI AUTOIMPRIMANTE / ANTIOXIDO CROMATO DE ZINC (COL. NUEVA)", "S/ FICHA", "A VINCULAR")]
h.tabla(890, 650, [(40, "c", False), (480, "l", False), (90, "c", True), (140, "c", False)], LISTA, rowh=24,
        titulo="LISTA DE MATERIALES (1 COLUMNA TIPO C)", colores=lambda i, j, t: OR if ("(*)" in t or t in ("A VINCULAR", "SIN CODIGO")) else K)
h.rotulo(890, h.H - 150, 750, "AP-TC-023", "PINTURA DE COLUMNAS", "METALICAS - TIPOS 1, 2 Y 3", "ZONAS, CAPAS, EMPOTRAMIENTO, COMPUTO Y 3D", "1:60 / 1:10", "D1 S/E, 3D S/E", fecha="07/11/2026")
h.guardar("ap_tc_023.svg")
