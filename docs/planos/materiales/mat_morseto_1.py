"""MAT-MORSETO-1 (rev. B) · Morseto de perforación de aislación 1995/6 (LCT PKD-14, 4027) y 1995/4 (PKD-14PF con portafusible, 4026).
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (MORS.PKD14) y r3d/piezas/morseto.mjs; 3D: r3d/out/mors1.png y mors1b.png.
Datos: LCT planilla de datos garantizados N° 352 / catálogo de líneas aéreas (rangos, torque, peso, materiales); Sicame TTD / Feman PC 95-10 (bulón M8, cabeza 13 mm).
Las cotas del cuerpo NO están publicadas: (*) proporcionales. Fuentes: r3d/FUENTES_cables.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

P = dict(PC["MORS"]["PKD14"]); NEU = PC["HAZ"]["h25_50"]["neu"]; DER = PC["CAB"]["p1x4"]["conds"][0]
P["_rcP"], P["_rcD"] = NEU["rc"] + .35, DER["rc"] + .35
h = hoja()

# =============== FRENTE ===============
h.titulo(40, 62, "FRENTE", "ESC. 3:1 · DESDE LA CABEZA FUSIBLE")
e = 3.0; X, Y = morsetoFrente(h, 150, 250, e, P)
h.txt(X(0), Y(P["H"] / 2 - 6) + 4, "PKD-14", 10, 700, K, "middle"); h.txt(X(0), Y(-P["H"] / 2 + 5) + 4, "1 kV", 9, 400, K, "middle")
h.dimH(Y(P["H"] / 2) - 40, X(-P["L"] / 2), X(P["L"] / 2), "≈ 40 (*)", ext=Y(P["H"] / 2), c=OR)
h.dimV(X(-P["L"] / 2) - 34, Y(P["H"] / 2), Y(-P["H"] / 2), "≈ 52 (*)", ext=X(-P["L"] / 2), c=OR)
h.dimV(X(P["L"] / 2) + 26, Y(P["zP"]), Y(P["zD"]), "≈ 27 (*)", ext=X(P["L"] / 2) + 10, c=OR)
lineaCorte(h, X(P["dientes"]["x"][2]), Y(P["H"] / 2) - 16, X(P["dientes"]["x"][2]), Y(-P["H"] / 2) + 30, "A")
h.txt(X(-P["L"] / 2 - 10), Y(P["zP"]) - 6, "LINEA", 9, 700, K, "end"); h.txt(X(-P["L"] / 2 - 10), Y(P["zD"]) - 6, "DERIV.", 9, 700, K, "end")
h.globo("1", X(-P["L"] / 2 + 4), Y(-P["H"] / 2 + 10), X(-P["L"] / 2) - 40, Y(-P["H"] / 2 + 2), r=9)
h.globo("5", X(3), Y(4), X(P["L"] / 2) + 40, Y(10), r=9)

# =============== CORTE A-A ===============
h.titulo(320, 62, "CORTE A-A POR LOS DIENTES", "ESC. 5:1 · LINEA = NEUTRO 50 (Ø 12,5) · DERIVACION = Cu 1 x 4")
ec = 5.0; X2, Y2 = morsetoCorte(h, 470, 250, ec, P, NEU, DER)
h.dimH(Y2(P["H"] / 2) - 16, X2(-P["D"] / 2), X2(P["D"] / 2), "≈ 30 (*)", ext=Y2(P["H"] / 2), c=OR)
for n, (yy, zz), (gx, gy) in [("2", (0, P["zP"] + NEU["R"] * .5), (640, 120)), ("3", (-NEU["R"] - .8, P["zP"]), (330, 140)), ("4", (-P["_rcP"] - 1.9, P["zP"] - 4), (330, 200)),
                              ("6", (0, P["zD"]), (640, 330)), ("7", (P["D"] / 4, P["H"] / 2 - 6), (640, 160)), ("8", (-P["D"] / 4, -P["H"] / 2 + 6), (330, 360))]:
    h.globo(n, X2(yy), Y2(zz), gx, gy, r=9)
h.txt(X2(-P["D"] / 4), Y2(-P["H"] / 2) + 18, "ATRAS", 9, 700, G, "middle"); h.txt(X2(-P["D"] / 4), Y2(-P["H"] / 2) + 30, "(DIENTES)", 9, 400, G, "middle"); h.txt(X2(P["D"] / 4), Y2(-P["H"] / 2) + 18, "ADELANTE", 9, 700, G, "middle"); h.txt(X2(P["D"] / 4), Y2(-P["H"] / 2) + 30, "(BULON)", 9, 400, G, "middle")

# =============== D1 diente ===============
h.titulo(660, 300, "D1 - EL DIENTE PERFORA", "ESC. 12:1 · NO SE PELA EL CABLE")
ed = 12; ox, oy = 760, 420
c = NEU; Rc, rc = c["R"] * ed, c["rc"] * ed
h.a(f'<clipPath id="d1c"><rect x="{ox-95:.1f}" y="{oy-70:.1f}" width="150" height="140"/></clipPath>')
h.a('<g clip-path="url(#d1c)">')
nucleo2d(h, ox + 40, oy, ed, c)
h.path(f"M{ox-95},{oy-24} L{ox+40-Rc+3},{oy-2} L{ox+40-Rc+3},{oy+2} L{ox-95},{oy+24} Z", "url(#CU)", K, 1)
h.a('</g>'); h.rect(ox - 95, oy - 70, 150, 140, "none", K, .6, 'stroke-dasharray="4 3"')
h.txt(ox - 90, oy + 86, "DIENTE Cu ESTAÑADO", 9.4); h.txt(ox - 90, oy + 100, "→ CONTACTO CON LA CUERDA", 9.4)

# =============== TABLAS ===============
v = [("CODIGO", "MODELO", "PRINCIPAL", "DERIVACION", "TORQUE", "PESO", "USO"),
     ("4027", "1995/6 · PKD-14AC", "10–95 mm²", "1,5–10 mm²", "≈ 8 N·m", "123 g", "NEUTRO / BAJADA (NOTA 3)"),
     ("4026", "1995/4 · PKD-14PF", "10–95 mm²", "4–16 mm²", "10 N·m", "110 g", "FASE CON FUSIBLE")]
yv = tablaC(h, 40, 520, [(56, "c", True), (130, "l", False), (80, "c", False), (84, "c", False), (66, "c", False), (50, "c", True), (210, "l", False)], v, "VARIANTES (LCT, PLANILLA DE DATOS N° 352)", rowh=16)
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN."]]
for cc in [4027, 4026]: r = cat(cc, 80); fil.append([r[0], r[1], r[2] + " (*)"])
yt = tablaC(h, 40, yv + 18, [(56, "c", True), (560, "l", False), (60, "c", False)], fil, "CODIGOS DEL PAÑOL (2)", rowh=16)
ydat = bloque(h, 40, yt + 20, "DATOS TECNICOS", [
    "TIPO IPC: PERFORA LA AISLACION, NO SE PELA EL CABLE. CUERPO NYLON 6/6 + 33 % FIBRA DE VIDRIO. DIENTES Cu ELECTROLITICO ESTAÑADO.",
    "1,1 kV · BULON M8 CON CABEZA FUSIBLE DE 13 mm: SE APRIETA CON LLAVE TUBO AISLADA HASTA QUE SE CORTA. PF: PORTAFUSIBLE NEOZED 63 A MAX.",
    "NORMAS: IRAM 2435 · NFC 33004 / 33022 · ANSI C119.4."], w=800, sz=10, lh=13.5)
notasW(h, 40, ydat + 2, [
    "COTAS DEL CUERPO NO PUBLICADAS POR EL FABRICANTE: LAS «≈» SON PROPORCIONALES A IPC DE CATALOGO (SICAME TTD, FEMAN PC 95-10) (*).",
    "DIENTES DE Cu ESTAÑADO (1,5 mm). SIRVE PARA LINEA DE Al Y BAJADA DE Cu (BIMETALICO). FORMA Y CANTIDAD DE DIENTES DEL DIBUJO (*).",
    "(*) 1995/6: LA FICHA DA DERIVACION 1,5–10 mm² Y LA FAMILIA DICE 4–16. PARA LA BAJADA Cu 4 x 16 CONFIRMAR EN EL GRABADO; SI NO, PKD-14PF.",
    "(*) EL CATALOGO TIENE 4026 Y 4027 EN «m» Y LA CALCULADORA LOS CUENTA POR UNIDAD (REVISION DE TIPOS, PUNTO C).",
    "NO CONFUNDIR CON EL 1995/3 (PKD-16, 4028): ES DE 25–95 Y NO SIRVE PARA 16 mm² (MAT-MORSETO-2). FUENTES: r3d/FUENTES_cables.md."], w=800, lh=14)

rayadosC(h, 40, 1092, ["NYL", "CU", "XLP", "ALU"], cols=4, dx=190)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - 1995/6 (PKD-14) EN EL NEUTRO", "CORTADO A CUARTO POR LA FILA DE DIENTES: SE VE COMO PERFORAN LA AISLACION")
A = img3d(h, "mors1", 890, 92, 560)
columna(h, A, [("diente", "3", "DIENTES Cu ESTAÑADO"), ("cuerda", "2", "NEUTRO Al-ALEACION 50"), ("aisl", "", "XLPE PERFORADA"), ("placa", "4", "PLACA DE CONTACTO"),
               ("capuchon", "6", "CAPUCHON DERIVACION"), ("cuerpo", "1", "CUERPO NYLON + FV"), ("fusible", "5", "CABEZA FUSIBLE 13 mm"), ("cabeza", "", "CABEZA QUE QUEDA"),
               ("leyenda", "7", "LEYENDA EN RELIEVE"), ("tuerca", "8", "TUERCA"), ("der", "", "DERIVACION Cu 1 x 4")], 1475, 110, 500, paso=36)
h.txt(890, 560, "VISTA 3D - 1995/4 (PKD-14PF) · CON PORTAFUSIBLE EN LA DERIVACION (*)", 11, 700, NV, "start", INT)
A2 = img3d(h, "mors1b", 905, 570, 470)
columna(h, A2, [("linea", "", "FASE Al 25 (LINEA)"), ("fusible", "", "CABEZA FUSIBLE"), ("pf", "", "PORTAFUSIBLE NEOZED (*)"), ("tapa", "", "TAPA ROSCADA"), ("salida", "", "A LA LUMINARIA")], 1400, 600, 900, paso=32)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/mors1.mjs, mors1b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-MORSETO-1", "MORSETO DENTADO (IPC)", "1995/6 Y 1995/4 (PKD-14)", "FRENTE, CORTE A-A, D1, VARIANTES Y 3D", "3:1 / 5:1", "D1 12:1 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_morseto_1.svg"))
