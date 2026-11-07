"""AP-PL-001 · Columna metálica recta apta para acometida subterránea, versión PL (julio 2022).
Datos: ficha AP-PL-001 (vista, detalle «A» PAT con bulón RW 1/2" soldado, cuadro de formación por tramos; acero SAE 1010/1020;
pintura interior de imprimación; asfáltica en el tramo enterrado + 20 cm), AP-C-005 tipo C (Ht 7,70 · emp. 0,70 · Ø114), ETG cap. 1.1,
planilla de datos garantizados (7 m = 3 tramos Ø114/90/76; 8 m = 4 tramos), FICHAS_TEC columna_metalica (modelos de referencia C 80 / C 110
ASV-4), calculadora v130 (asfáltica 8023), REVISION B.5 y B.11."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
import tabmet as T, colmet as M
h = Hoja(); h.a(M.DEFS)
# ================= VISTA =================
h.titulo(40, 62, "VISTA", "ESC. 1:50 - TIPO C, 7 m LIBRES")
k = .056; cx = 150; y0 = 640
Y = M.elev(h, cx, y0, k, asf=200)
h.nivel(cx + 50, y0, "±0,00")
z = -M.EMP
for i, (d, l) in enumerate(M.TRAMOS):
    h.dimV(cx + 48, Y(z), Y(z + l), f"L{i+1} (*)", ext=cx + d / 2 * k + 2, c=OR)
    h.txt(cx - d / 2 * k - 6, Y(z + l / 2), f"Ø{d}", 9.5, 700, K, "end"); z += l
h.dimV(cx - 70, Y(-M.EMP), Y(M.HT - M.EMP), "Ht 7.700", ext=cx - 10)
h.dimV(cx - 46, Y(0), Y(M.LL), "LIBRE 7.000", ext=cx - 10)
h.dimV(cx - 46, Y(-M.EMP), Y(0), "700", ext=cx - 10)
h.dimV(cx + 78, Y(0), Y(2500), "2.500 MIN.", ext=cx + 6)
for n, a, gy in (("1", (cx, Y(4000)), 160), ("2", (cx, Y(2500)), 300), ("3", (cx + 2, Y(-200)), 560), ("4", (cx, Y(5800)), 120), ("5", (cx + 1, Y(-300)), 610)):
    h.globo(n, a[0], a[1], 60 if n not in ("3", "5") else 270, gy)
# A-A en la caja
h.ln(cx - 20, Y(2500), cx + 20, Y(2500), K, .5, h.EJE)
# ================= CUADRO DE FORMACION =================
rows = [("MODELO / FUENTE", "FORMACION (Ø mm × LARGO m)", "TOTAL / LIBRE / EMP."),
        ("7 m (DATOS GARANT.)", "3 TRAMOS: Ø114 · Ø90 · Ø76 (LARGOS *)", "7,70 / 7,00 / 0,70"),
        ("8 m (DATOS GARANT.)", "4 TRAMOS: Ø140 · Ø114 · Ø90 · Ø76", "8,80 / 8,00 / 0,80"),
        ("C 80 ASV-4 (REFERENCIA)", "114×3,2 (e 3,6) + 90×2 + 76×1,5 + 60×1,3", "8 / 7,2 / 0,8"),
        ("C 110 ASV-4 (REFERENCIA)", "140×4,2 (e 4,7) + 114×3 (e 3,6) + 90×2 + 76×1,8", "11 / 9,9 / 1,1"),
        ("ESPESOR MINIMO (ETG)", "4 mm DESDE Ø90 · 3,2 mm DEBAJO DE Ø90", "SAE 1010 / 1020")]
h.tabla(300, 62, [(150, "l", False), (250, "l", False), (126, "c", True)], rows, rowh=20, titulo="CUADRO DE FORMACION POR TRAMOS")
# ================= DETALLE A =================
h.titulo(300, 230, "DETALLE «A» - PUESTA A TIERRA", "ESC. 1:1 - BULON RW 1/2\" SOLDADO A LA PARED, EN LA CAJA (*)")
kA = 2.4; wx = 340; zc = 420; e = 4 * kA; rb = 6.35 * kA
h.rect(wx, zc - 120, e, 240, "url(#ANSI31)", K, 1.0)
for yy in (zc - 120, zc + 120): h.path(f"M{wx-8},{yy} h8 l3,-4 l3,8 l3,-4 h6", "none", K, .6)
x0 = wx + e; Lb = 50 * kA
h.rect(x0, zc - rb, Lb, 2 * rb, "#fff", K, 1.0)
for i in range(1, 30):
    xx = x0 + 30 * kA + i * 1.8 * kA
    if xx < x0 + Lb - 2: h.ln(xx, zc - rb, xx - 3, zc + rb, K, .35)
for sy in (-1, 1): h.path(f"M{x0},{zc+sy*rb} l0,{sy*6*kA} l{6*kA},{-sy*6*kA} z", K, K, .3)   # cordón de soldadura
xa = x0 + 14 * kA
h.rect(xa, zc - 13 * kA, 2.5 * kA, 26 * kA, "#fff", K, .9)                                # arandela (*)
h.rect(xa + 2.5 * kA, zc - 11 * kA, 2 * kA, 22 * kA, "#e0e0e0", K, .9)                    # palma del terminal
h.path(f"M{xa+2.5*kA},{zc+11*kA} l0,{14*kA} l{2*kA},0 l0,{-14*kA}", "none", K, .9)
T.cable2(h, f"M{xa+3.5*kA},{zc+25*kA} Q{xa+3.5*kA},{zc+48*kA} {xa+40*kA},{zc+50*kA}", 7)
h.rect(xa + 4.5 * kA, zc - 10 * kA, 11 * kA, 20 * kA, "#fff", K, 1.1)                     # tuerca (*)
h.ln(xa + 4.5 * kA, zc - 5 * kA, xa + 15.5 * kA, zc - 5 * kA, K, .5); h.ln(xa + 4.5 * kA, zc + 5 * kA, xa + 15.5 * kA, zc + 5 * kA, K, .5)
h.ln(wx - 10, zc, x0 + Lb + 14, zc, K, .45, h.EJE)
h.dimH(zc - 44, x0, x0 + Lb, "50 (*)", ext=zc - rb - 2, c=OR)
h.dimV(x0 + Lb + 22, zc - rb, zc + rb, "1/2\"", ext=x0 + Lb + 2)
h.dimH(zc - 44 - 0, wx, x0, "", ext=zc - 120)
h.txt(wx - 6, zc + 140, "PARED (e ≥ 4)", 9, 700, K, "start")
h.txt(xa + 44 * kA, zc + 54 * kA, "1×10 V/A", 9, 700)
for n, a, g in (("6", (x0 + 2, zc - rb - 4), (wx + 30, zc - 80)), ("7", (x0 + 40 * kA, zc + rb - 2), (x0 + 40 * kA + 30, zc + 60)),
                ("8", (xa + 3.5 * kA, zc + 20 * kA), (xa - 30, zc + 110)), ("9", (xa + 10 * kA, zc - 10 * kA), (xa + 90, zc - 80))):
    h.globo(n, a[0], a[1], g[0], g[1])
h.txt(wx + 4, zc - 100, "CORDON PERIMETRAL", 9, 700); h.txt(xa + 106, zc - 76, "TUERCA + ARANDELA (*)", 9, 700)
h.txt(wx, zc + 160, "(*) OJAL 5/16\" EN UN BULON 1/2\": NO ENTRA. ¿CUAL VA? (REVISION B.11)", 9, 400, OR)
# ================= CORTE A-A (planta en la caja) =================
h.titulo(640, 230, "CORTE A-A", "ESC. 1:4 - EN LA CAJA")
k2 = .9; c2x, c2y = 740, 380; R = 57
av = math.degrees(math.asin(40 / R))
def arco(r, a0, a1): return [(c2x + r * k2 * math.cos(math.radians(a)), c2y + r * k2 * math.sin(math.radians(a))) for a in [a0 + (a1 - a0) * i / 60 for i in range(61)]]
h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in arco(R, 90 + av, 450 - av) + arco(R - 4, 450 - av, 90 + av)) + " Z", K, K, .8)
h.rect(c2x - 4, c2y - (R - 4) * k2, 8, 30, "#fff", K, .8)
h.dimH(c2y - R * k2 - 14, c2x - R * k2, c2x + R * k2, "Ø114", ext=c2y - 2)
h.txt(c2x, c2y + R * k2 + 22, "VENTANA (FRENTE)", 9, 400, K, "middle"); h.txt(c2x + 12, c2y - R * k2 + 34, "BULON (*)", 9, 700, OR)
# ================= COMPUTO =================
rows = [("CONCEPTO (TIPO C)", "CANT.", "CALCULO"),
        ("ASFALTICA SEGUN AP-PL-001", "0,64 m²", "2 × π × 0,114 × (0,70 + 0,20)"),
        ("ASFALTICA SEGUN ETG (CALC.)", "0,72 m²", "2 × π × 0,114 × (0,70 + 0,30)"),
        ("IMPRIMACION INTERIOR", "TODA", "POR DENTRO DE LOS TRAMOS"),
        ("BULON PAT", "1", "EN LA CAJA (AP-CC-001)")]
h.tabla(300, 610, [(170, "l", False), (64, "c", True), (220, "l", False)], rows, rowh=19, titulo="COMPUTO POR COLUMNA")
h.rayados(40, 760, [("ASFH", "PINTURA ASFALTICA"), ("CONC", "HORMIGON H-13"), ("ANSI31", "ACERO (CORTE)"), ("EARTH", "TERRENO")], cols=2, dx=200)
h.notas(40, 880, [
 "COTAS EN mm. ES OTRA HOJA DE LA MISMA COLUMNA DEL AP-C-005 (SERIE PL). LOS PROYECTOS CITAN EL AP-C-005.",
 "ACERO SAE 1010/1020. PINTURA INTERIOR DE IMPRIMACION. TERMINACION SEGUN AP-TC-023.",
 "LOS TRAMOS SE UNEN POR ENCASTRE CON SOLDADURA PERIMETRAL (AP-C-007). CAJA A 2.500 MIN. (AP-CC-001).",
 "EL BULON PAT ES EL BORNE PRINCIPAL DE TIERRA DE LA COLUMNA NUEVA: NO LLEVA BANDERITA NI BLOQUETE.",
 "(*) ASFALTICA: ESTE PLANO DICE ENTERRADO + 200; LA ETG + 300 (ES LO QUE CALCULA HOY). A DECIDIR.",
 "(*) L1/L2/L3, LARGO DEL BULON Y SU POSICION EN LA CAJA: A CONFIRMAR CON EL PLANO OFICIAL.",
 "(*) PREGUNTA ABIERTA: ¿SE CITA AP-C-005 O AP-PL-001 EN CADA PROYECTO? COLOR DE LA IMPRIMACION EN EL 3D: ILUSTRATIVO."])
# ================= 3D =================
h.titulo(880, 62, "VISTA 3D - COLUMNA PL Y DETALLE «A»", "IZQ.: LA COLUMNA CON LA FUNDACION CORTADA A UN CUARTO · DER.: EL BULON PAT SOLDADO EN LA PARED")
h.iso(.052, 990, 470)
A = 700
h.BOX(-A, 0, -A, A, -900, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
h.BOX(0, A, -A, 0, -900, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
h.BOX(0, 300, 0, 300, -900, -30, "url(#conc3)", "url(#conc3)", "url(#conc3)", "#555", .5)
PAINT = "#767c80"
M.col3d(h, M.TRAMOS, M.EMP, [(-700, 200, "#1d1b19"), (200, 9000, PAINT)])
pc = h.P(57, 0, 2500); h.rect(pc[0] - 2, pc[1] - 7, 4, 14, "#222", "none", 0)
# detalle A en 3D
h.iso(1.25, 1250, 300)
RI = 53
T.cyl(h, 0, 0, RI, 110, 250, -90, 90, "#8a7a6e", inner=True)            # interior con imprimación (*)
h.F3([(RI * math.cos(math.radians(110)), RI * math.sin(math.radians(110)), -90), (57 * math.cos(math.radians(110)), 57 * math.sin(math.radians(110)), -90),
      (57 * math.cos(math.radians(110)), 57 * math.sin(math.radians(110)), 90), (RI * math.cos(math.radians(110)), RI * math.sin(math.radians(110)), 90)], "url(#ANSI31)", "#333", .6)
T.ring(h, 0, 0, 57, RI, 90, 110, 250, "#c8cdd1")
# cordón de soldadura y bulón (a lo largo de +x desde la pared en 180°)
wc = [(-RI + 1, 6.35 * 1.6 * math.cos(2 * math.pi * i / 24), 6.35 * 1.6 * math.sin(2 * math.pi * i / 24)) for i in range(24)]
h.F3(wc, "#a7a29a", "#444", .6)
h.tuboX(-RI, -RI + 50, 0, 0, 6.35, "url(#bronce)", "#5a3d10")
h.F3(h.circX(-RI + 22, 0, 0, 13, 6), "url(#galv)", "#333", .6)         # arandela (*)
h.F3([(-RI + 25, -9, -22), (-RI + 25, 9, -22), (-RI + 25, 9, 9), (-RI + 25, -9, 9)], "url(#cobre)", "#5a2d0c", .6)  # terminal de ojal
h.F3(h.circX(-RI + 34, 0, 0, 11, 6), "url(#bronce)", "#5a3d10", .7)     # tuerca
p1 = h.P(-RI + 25, 0, -20); p2 = h.P(-RI + 25, 30, -90)
h.path(f"M{p1[0]:.1f},{p1[1]:.1f} Q{p1[0]-10:.1f},{p2[1]-20:.1f} {p2[0]:.1f},{p2[1]+30:.1f}", "none", "#2e9e4f", 7)
h.path(f"M{p1[0]:.1f},{p1[1]:.1f} Q{p1[0]-10:.1f},{p2[1]-20:.1f} {p2[0]:.1f},{p2[1]+30:.1f}", "none", "#e6c229", 2.5, 'stroke-dasharray="6 6"')
gy = 120
def g(n, p, t):
    global gy; h.g3(n, p, 1500, gy, t); gy += 42
h.iso(.052, 990, 470)
g("4", (40, 40, 6200), "TRAMOS Ø114/90/76")
g("2", (57, 0, 2500), "CAJA A 2.500 MIN.")
g("3", (40, 40, 0), "ASFALTICA +200 (*)")
g("5", (200, 200, -500), "FUNDACION AP-TC-003")
h.iso(1.25, 1250, 300)
g("1", (RI * math.cos(math.radians(200)), RI * math.sin(math.radians(200)), 60), "IMPRIMACION INTERIOR")
g("6", (-RI + 2, 8, 8), "SOLDADURA")
g("7", (-RI + 12, 0, 5), "BULON RW 1/2\"")
g("8", (-RI + 25, 8, -15), "TERMINAL DE OJAL (*)")
g("9", (-RI + 34, 0, 9), "TUERCA Y ARANDELA")
g("10", (-RI + 20, 25, -70), "1×10 V/A A JABALINA")
LISTA = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
 ("1", "COLUMNA METALICA RECTA 7 m LIBRES (Ht 7,70), SAE 1010/1020, IMPRIMACION INT.", "1 u", "6006"),
 ("2", "CAJA DE CONEXION CON TAPA «RIESGO ELECTRICO» (AP-CC-001)", "1 u", "6002"),
 ("3", "PINTURA ASFALTICA FRIA, ENTERRADO + 200 (PL) / + 300 (ETG)", "0,64-0,72 m²", "8023"),
 ("4", "TRAMOS Ø114 / Ø90 / Ø76 UNIDOS POR ENCASTRE (AP-C-007)", "3", "CON LA COLUMNA"),
 ("5", "FUNDACION H-13 0,60×0,60×0,90 (AP-TC-003)", "1", "AP-TC-003"),
 ("6", "CORDON DE SOLDADURA DEL BULON (FABRICA)", "-", "CON LA COLUMNA"),
 ("7", "BULON RW 1/2\" (BORNE PRINCIPAL DE TIERRA)", "1 u", "CON LA CAJA"),
 ("8", "TERMINAL DE OJAL Cu ESTAÑADO 10 mm² (*)", "1 u", "2045 (*)"),
 ("9", "TUERCA Y ARANDELA DEL BULON", "1 + 1", "CON LA CAJA"),
 ("10", "CABLE Cu 1×10 mm² VERDE-AMARILLO A LA JABALINA (AP-TC-005)", "4 m", "7010")]
h.tabla(890, 610, [(40, "c", False), (490, "l", False), (100, "c", True), (120, "c", False)], LISTA, rowh=23,
        titulo="LISTA DE MATERIALES (1 COLUMNA TIPO C)", colores=lambda i, j, t: OR if ("(*)" in t or t in ("A VINCULAR", "SIN CODIGO")) else K)
h.rotulo(890, h.H - 150, 750, "AP-PL-001", "COLUMNA METALICA RECTA", "VERSION PL (JULIO 2022)", "VISTA, DETALLE «A» DE PAT, FORMACION POR TRAMOS Y 3D", "1:50 / 1:1", "1:4, 3D S/E", fecha="07/11/2026")
h.guardar("ap_pl_001.svg")
