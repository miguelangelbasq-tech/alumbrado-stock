"""AP-C-007 · Detalle de unión de tramos en columnas metálicas (D.G.A.P. sept. 2022): encastre del tramo de arriba dentro del de abajo
con soldadura perimetral (corte A-A). Datos: ficha AP-C-007, dibujo actual de la app («encastre», «soldadura perimetral», «tramo de arriba
dentro del de abajo»), ETG cap. 1.1 (tramos de distinto Ø unidos según AP-C-007; SAE 1010; e ≥ 4 mm desde Ø90, ≥ 3,2 debajo), planilla de
datos garantizados (7 m: 114/90/76; 8 m: 140/114/90/76), FICHAS_TEC (modelos de referencia C 80 / C 110 ASV-4)."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
import tabmet as T
h = Hoja()
D1, D2, E = 114, 90, 4.0; R1, R2 = D1 / 2, D2 / 2; RI1, RI2 = R1 - E, R2 - E; LE = 150   # LE: largo del encastre (*)
# ================= CORTE B-B (longitudinal) =================
h.titulo(40, 62, "CORTE B-B (LONGITUDINAL)", "ESC. 1:2 - POR EL EJE - UNION Ø114 / Ø90")
k = 1.0; cx = 190; yj = 330                     # yj = boca del tramo de abajo
yb = yj + 230; yt = yj - 200
for sx in (-1, 1):
    h.rect(cx + sx * R1 * k - (E * k if sx > 0 else 0), yj, E * k, yb - yj, "url(#ANSI31)", K, .9)              # pared Ø114
    h.rect(cx + sx * R2 * k - (E * k if sx > 0 else 0), yt, E * k, yj + LE * k - yt, "url(#ANSI31)", K, .9)    # pared Ø90
    # cordón de soldadura en la boca
    xm = cx + sx * R1 * k; xu = cx + sx * R2 * k
    h.path(f"M{xm - (E*k if sx > 0 else 0) + (0 if sx > 0 else E*k):.1f},{yj} L{xu:.1f},{yj} L{xu:.1f},{yj-9} Z" if False else
           f"M{cx+sx*(RI1)*k:.1f},{yj} L{cx+sx*R2*k:.1f},{yj} L{cx+sx*R2*k:.1f},{yj-10} L{cx+sx*R1*k:.1f},{yj-2} L{cx+sx*R1*k:.1f},{yj} Z", K, K, .5)
for yy in (yb, yt): h.path(f"M{cx-R1*k-10},{yy} h{R1*k} l5,-6 l5,12 l5,-6 h{R1*k}", "none", K, .6)
h.ln(cx, yt - 14, cx, yb + 14, K, .45, h.EJE)
h.dimH(yb + 30, cx - R1 * k, cx + R1 * k, "Ø114", ext=yb + 4)
h.dimH(yt - 24, cx - R2 * k, cx + R2 * k, "Ø90", ext=yt - 4)
h.dimV(cx + R1 * k + 24, yj, yj + LE * k, "Le (*)", ext=cx + R1 * k + 4, c=OR)
h.dimH(yj + LE * k + 24, cx + R2 * k, cx + RI1 * k, "", ext=yj + LE * k + 2)
h.txt(cx + RI1 * k + 30, yj + LE * k + 28, "HOLGURA 8 (*)", 9, 700, OR)
h.dimH(yj + 200, cx - R1 * k, cx - RI1 * k, "", ext=yj + 190); h.txt(cx - R1 * k - 6, yj + 204, "e 4", 9, 700, K, "end")
h.ln(cx - R2 * k + 4, yj + LE * k, cx + R2 * k - 4, yj + LE * k, K, .5, h.OCULTA)
for yy, s in ((yj + 70, "A"),):
    for xx in (cx - R1 * k - 30, cx + R1 * k + 48): h.ln(xx - 8, yy, xx + 8, yy, K, 1.8); h.txt(xx, yy - 6, s, 12, 700, K, "middle")
    h.ln(cx - R1 * k - 22, yy, cx + R1 * k + 40, yy, K, .5, h.EJE)
for n, a, g in (("1", (cx - R1 * k + 2, yj + 160), (60, 470)), ("2", (cx - R2 * k + 2, yt + 60), (60, 160)), ("3", (cx + R2 * k + 3, yj - 4), (330, 260)), ("4", (cx + R2 * k + 4, yj + 100), (330, 420))):
    h.globo(n, a[0], a[1], g[0], g[1])
# ================= VISTA =================
h.titulo(400, 62, "VISTA", "ESC. 1:4 - DE AFUERA")
k2 = .5; cx2 = 470; yj2 = 300
h.rect(cx2 - R1 * k2, yj2, D1 * k2, 220 * k2, "#fff", K, 1.2); h.rect(cx2 - R2 * k2, yj2 - 300 * k2, D2 * k2, 300 * k2, "#fff", K, 1.2)
h.path(f"M{cx2-R1*k2},{yj2} Q{cx2-R2*k2},{yj2-2} {cx2-R2*k2},{yj2-5} L{cx2+R2*k2},{yj2-5} Q{cx2+R2*k2},{yj2-2} {cx2+R1*k2},{yj2}", "#bbb", K, .6)
h.ln(cx2, yj2 - 320 * k2, cx2, yj2 + 240 * k2, K, .45, h.EJE)
h.txt(cx2 + R1 * k2 + 8, yj2 + 2, "SOLDADURA", 9, 700); h.txt(cx2 + R1 * k2 + 8, yj2 + 14, "PERIMETRAL", 9, 700)
for xx in (cx2 - R1 * k2 - 18, cx2 + R1 * k2 + 18): h.ln(xx, yj2 + 70 * k2 - 8, xx, yj2 + 70 * k2 + 8, K, 1.8)
h.txt(cx2 - R1 * k2 - 26, yj2 + 70 * k2 + 4, "B", 12, 700, K, "end")
# ================= CORTE A-A =================
h.titulo(580, 62, "CORTE A-A", "ESC. 1:1,5 - EN EL ENCASTRE")
k3 = 1.6; c3x, c3y = 700, 230
h.circ(c3x, c3y, R1 * k3, "url(#ANSI31)", K, 1.1); h.circ(c3x, c3y, RI1 * k3, "#fff", K, .7)
h.circ(c3x, c3y, R2 * k3, "url(#ANSI31)", K, 1.1); h.circ(c3x, c3y, RI2 * k3, "#fff", K, .7)
h.ln(c3x - R1 * k3 - 14, c3y, c3x + R1 * k3 + 14, c3y, K, .45, h.EJE); h.ln(c3x, c3y - R1 * k3 - 14, c3x, c3y + R1 * k3 + 14, K, .45, h.EJE)
h.dimH(c3y - R1 * k3 - 22, c3x - R1 * k3, c3x + R1 * k3, "Ø114", ext=c3y - 4)
h.dimH(c3y + R1 * k3 + 26, c3x - R2 * k3, c3x + R2 * k3, "Ø90", ext=c3y + 4)
h.txt(c3x + 4, c3y - RI1 * k3 + 10, "HOLGURA (*)", 8.5, 700, OR)
# ================= D1 SOLDADURA =================
h.titulo(580, 400, "D1 - CORDON PERIMETRAL", "ESC. 5:1 - EN LA BOCA DEL TRAMO DE ABAJO")
k4 = 5; x4, y4 = 640, 520
h.rect(x4, y4, E * k4, 60, "url(#ANSI31)", K, 1.0)                    # pared de abajo (Ø114)
h.rect(x4 + E * k4 + 8 * k4, y4 - 90, E * k4, 150, "url(#ANSI31)", K, 1.0)   # pared de arriba (Ø90), adentro
h.path(f"M{x4},{y4} L{x4+E*k4+8*k4},{y4} L{x4+E*k4+8*k4},{y4-12*k4} Z", "#777", K, .8)
h.dimH(y4 + 76, x4 + E * k4, x4 + E * k4 + 8 * k4, "8 (*)", ext=y4 + 62, c=OR)
h.dimH(y4 + 76, x4, x4 + E * k4, "4", ext=y4 + 62)
h.dimV(x4 + E * k4 + 8 * k4 + E * k4 + 18, y4 - 12 * k4, y4, "a (*)", ext=x4 + E * k4 + 8 * k4 + 2, c=OR)
h.txt(x4 - 6, y4 + 40, "Ø114", 9, 700, K, "end"); h.txt(x4 + E * k4 + 8 * k4 + E * k4 + 6, y4 - 70, "Ø90", 9, 700)
h.globo("3", x4 + 30, y4 - 14, x4 - 20, y4 - 60)
# ================= CUADRO =================
rows = [("UNION", "e ABAJO", "Ø INT. ABAJO", "HOLGURA", "DONDE")]
for a, b, w in ((114, 90, "7 m Y 8 m"), (90, 76, "7 m Y 8 m"), (140, 114, "8 A 10 m"), (76, 60, "MANGO (REF.)")):
    e = 4.0 if a >= 90 else 3.2; di = a - 2 * e; hol = (di - b) / 2
    rows.append((f"Ø{a} / Ø{b}", T.f(e, 1), T.f(di, 1), T.f(hol, 1), w))
h.tabla(40, 640, [(90, "l", False), (64, "c", True), (90, "c", True), (70, "c", True), (110, "l", False)], rows, rowh=19,
        titulo="CUADRO DE UNIONES (e MINIMO DE LA ETG)")
h.txt(40, 760, "HOLGURA = (Ø INT. DEL DE ABAJO − Ø DEL DE ARRIBA) / 2", 9.5, 700)
h.txt(40, 776, "MODELO DE REF. C 80: Ø114 e 3,6 → 106,8 INT. → HOLGURA 8,4", 9, 400, G)
rows2 = [("TRAMOS POR COLUMNA", "UNIONES"), ("7 m (114 / 90 / 76)", "2"), ("8 m (140 / 114 / 90 / 76)", "3")]
h.tabla(480, 640, [(190, "l", False), (80, "c", True)], rows2, rowh=19, titulo="CUANTAS UNIONES")
h.rayados(480, 740, [("ANSI31", "ACERO SAE 1010 (CORTE)")], cols=1)
h.notas(40, 830, [
 "COTAS EN mm. EL TRAMO DE ARRIBA (MENOR Ø) ENTRA EN EL DE ABAJO Y SE SUELDA EN TODO EL PERIMETRO DE LA BOCA.",
 "ES EL DETALLE QUE ACOMPAÑA AL AP-C-005: LA FORMACION DE CADA COLUMNA VA EN EL PLANO DE LA OBRA (ETG 1.1).",
 "TUBOS DE ACERO SAE 1010: e ≥ 4 mm DESDE Ø90 Y ≥ 3,2 mm DEBAJO. SECCIONES DECRECIENTES HACIA LA CIMA.",
 "REFERENCIA CONSTRUCTIVA: NO COMPUTA MATERIAL. LA UNION VIENE DE FABRICA CON LA COLUMNA (6006 / 6005).",
 "(*) A CONFIRMAR: LARGO DEL ENCASTRE Le, CENTRADO DE LA HOLGURA Y GARGANTA a (SE DIBUJA EL CORDON CERRANDO LA BOCA).",
 "(*) EL MODELO DE REFERENCIA TIENE Ø90 CON e 3,2: LA ETG PIDE 4 mm DESDE Ø90. VERIFICAR AL RECIBIR."])
# ================= 3D =================
h.titulo(880, 62, "VISTA 3D - UNION DE TRAMOS EN CORTE", "EL TRAMO DE ABAJO CORTADO A UN CUARTO PARA VER EL ENCASTRE Y EL CORDON")
h.iso(.82, 1170, 380)
PAINT, CUT = "#7d8488", "#d6dade"
z0, zt = -230, 230
T.cyl(h, 0, 0, RI1, 135, 315, z0, 0, "#7d8488", inner=True)                       # interior del de abajo
T.cyl(h, 0, 0, R2, -10, 100, -LE, 0, PAINT)                                         # tramo de arriba, metido
T.ring(h, 0, 0, R2, RI2, -LE, -10, 100, CUT)                                        # punta del de arriba (oculta en parte)
T.cyl(h, 0, 0, R1, -80, -10, z0, 0, PAINT); T.cyl(h, 0, 0, R1, 100, 170, z0, 0, PAINT)
for a in (-10, 100):                                                                 # caras del corte
    ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
    h.F3([(RI1 * ca, RI1 * sa, z0), (R1 * ca, R1 * sa, z0), (R1 * ca, R1 * sa, 0), (RI1 * ca, RI1 * sa, 0)], CUT, "#333", .6)
T.ring(h, 0, 0, R1, RI1, 0, 100, 350, CUT)
T.cyl(h, 0, 0, R2 + 7, -80, 170, 0, 10, "#5f5a52")                                  # cordón perimetral
T.cyl(h, 0, 0, R2, -80, 170, 10, zt, PAINT)
T.ring(h, 0, 0, R2, RI2, zt, 0, 360, CUT)
gy = 140
def g(n, pp, t):
    global gy; h.g3(n, pp, 1500, gy, t); gy += 46
g("2", (R2 * .7, R2 * .7, 150), "TRAMO DE ARRIBA Ø90")
g("3", (R2 * .8 + 4, R2 * .6 + 4, 6), "SOLDADURA")
g("4", (R2 * math.cos(math.radians(45)), R2 * math.sin(math.radians(45)), -90), "ENCASTRE Le (*)")
g("5", (RI1 * math.cos(math.radians(200)), RI1 * math.sin(math.radians(200)), -120), "HOLGURA (*)")
g("1", (R1 * math.cos(math.radians(140)), R1 * math.sin(math.radians(140)), -150), "TRAMO DE ABAJO Ø114")
LISTA = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
 ("1", "TRAMO DE ABAJO Ø114 e ≥ 4, SAE 1010", "1", "CON LA COLUMNA"),
 ("2", "TRAMO DE ARRIBA Ø90 e ≥ 4, SAE 1010", "1", "CON LA COLUMNA"),
 ("3", "CORDON DE SOLDADURA PERIMETRAL EN LA BOCA (FABRICA)", "1", "CON LA COLUMNA"),
 ("4", "ENCASTRE: EL DE ARRIBA DENTRO DEL DE ABAJO, LARGO Le (*)", "-", "-"),
 ("5", "HOLGURA ENTRE TRAMOS (8 mm EN Ø114/Ø90) (*)", "-", "-"),
 ("6", "COLUMNA METALICA RECTA 7 m (AP-C-005) QUE LA INCLUYE", "1 u", "6006"),
 ("7", "RETOQUE DE PINTURA DE LA UNION (AP-TC-023)", "S/ OBRA", "VER AP-TC-023")]
h.tabla(890, 640, [(40, "c", False), (470, "l", False), (90, "c", True), (150, "c", False)], LISTA, rowh=26,
        titulo="LISTA (REFERENCIA, NO COMPUTA MATERIAL)", colores=lambda i, j, t: OR if ("(*)" in t or t in ("A VINCULAR", "SIN CODIGO")) else K)
h.rotulo(890, h.H - 150, 750, "AP-C-007", "UNION DE TRAMOS EN", "COLUMNAS METALICAS", "CORTES A-A Y B-B, CORDON, CUADRO DE UNIONES Y 3D", "1:2 / 1:4", "1:1,5, 5:1, 3D S/E", fecha="07/11/2026")
h.guardar("ap_c_007.svg")
