"""MAT-MORSETO-2 (rev. B) · Morseto de indentación múltiple 1995/3 (LCT PKD-16, 4028) y 1995/1 (acometida a tablero, 3051).
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (MORS.PKD16) y r3d/piezas/morseto.mjs; 3D: r3d/out/mors2.png (cortado) y mors2b.png (explotado).
Datos: LCT / Metal-CE (25–95 mm² en los dos canales, 10 N·m, 100 g). 1995/1 sin datos publicados. Fuentes: r3d/FUENTES_cables.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

P = dict(PC["MORS"]["PKD16"]); FA = PC["HAZ"]["h25_50"]["fases"][0]; DER = dict(FA); DER["_al"] = True
P["_rcP"], P["_rcD"] = FA["rc"] + .35, FA["rc"] + .35
h = hoja()

# =============== FRENTE ===============
h.titulo(40, 62, "FRENTE", "ESC. 3:1 · DESDE LA CABEZA FUSIBLE")
e = 3.0; X, Y = morsetoFrente(h, 160, 250, e, P)
h.txt(X(0), Y(P["H"] / 2 - 6) + 4, "PKD-16", 10, 700, K, "middle"); h.txt(X(0), Y(-P["H"] / 2 + 5) + 4, "1 kV", 9, 400, K, "middle")
h.dimH(Y(P["H"] / 2) - 40, X(-P["L"] / 2), X(P["L"] / 2), "≈ 44 (*)", ext=Y(P["H"] / 2), c=OR)
h.dimV(X(-P["L"] / 2) - 34, Y(P["H"] / 2), Y(-P["H"] / 2), "≈ 60 (*)", ext=X(-P["L"] / 2), c=OR)
h.dimV(X(P["L"] / 2) + 26, Y(P["zP"]), Y(P["zD"]), "≈ 30 (*)", ext=X(P["L"] / 2) + 10, c=OR)
lineaCorte(h, X(P["dientes"]["x"][2]), Y(P["H"] / 2) - 16, X(P["dientes"]["x"][2]), Y(-P["H"] / 2) + 30, "A")
h.txt(X(-P["L"] / 2 - 10), Y(P["zP"]) - 6, "LINEA", 9, 700, K, "end"); h.txt(X(-P["L"] / 2 - 10), Y(P["zD"]) - 6, "DERIV.", 9, 700, K, "end")
h.globo("1", X(-P["L"] / 2 + 4), Y(-P["H"] / 2 + 10), X(-P["L"] / 2) - 40, Y(-P["H"] / 2 + 2), r=9)
h.globo("5", X(3), Y(4), X(P["L"] / 2) + 40, Y(10), r=9)

# =============== CORTE A-A ===============
h.titulo(330, 62, "CORTE A-A POR LOS DIENTES", "ESC. 4,5:1 · LINEA Y DERIVACION = FASE Al 25 (Ø 9)")
ec = 4.5; X2, Y2 = morsetoCorte(h, 480, 272, ec, P, FA, DER)
h.dimH(Y2(P["H"] / 2) - 16, X2(-P["D"] / 2), X2(P["D"] / 2), "≈ 32 (*)", ext=Y2(P["H"] / 2), c=OR)
for n, (yy, zz), (gx, gy) in [("2", (0, P["zP"] + FA["R"] * .5), (650, 120)), ("3", (-FA["R"] - .8, P["zP"]), (345, 140)), ("4", (-P["_rcP"] - 1.9, P["zP"] - 6), (345, 220)),
                              ("6", (0, P["zD"]), (650, 330)), ("7", (P["D"] / 4, P["H"] / 2 - 6), (650, 170))]:
    h.globo(n, X2(yy), Y2(zz), gx, gy, r=9)
for yy, t1, t2 in ((-P["D"] / 4, "ATRAS", "(DIENTES)"), (P["D"] / 4, "ADELANTE", "(BULON)")):
    h.txt(X2(yy), Y2(-P["H"] / 2) + 18, t1, 9, 700, G, "middle"); h.txt(X2(yy), Y2(-P["H"] / 2) + 30, t2, 9, 400, G, "middle")

# =============== D1 dientes ===============
h.titulo(670, 300, "D1 - INDENTACION", "ESC. 12:1 · LOS DOS CANALES (*)")
ed = 12; ox, oy = 760, 420; c = FA; Rc = c["R"] * ed
h.a(f'<clipPath id="d1c"><rect x="{ox-90:.1f}" y="{oy-70:.1f}" width="160" height="140"/></clipPath>')
h.a('<g clip-path="url(#d1c)">'); nucleo2d(h, ox + 50, oy, ed, c, al=True)
for dz in (-c["R"] * .45 * ed, 0, c["R"] * .45 * ed):
    tipx = ox + 50 - math.sqrt(max(Rc ** 2 - dz ** 2, 0)) + 3
    h.path(f"M{ox-90},{oy+dz-18} L{tipx:.1f},{oy+dz-1.5:.1f} L{tipx:.1f},{oy+dz+1.5:.1f} L{ox-90},{oy+dz+18} Z", "url(#CU)", K, .9)
h.a('</g>'); h.rect(ox - 90, oy - 70, 160, 140, "none", K, .6, 'stroke-dasharray="4 3"')
h.txt(ox - 85, oy + 86, "3 DIENTES POR FILA, 4 FILAS (*)", 9.4); h.txt(ox - 85, oy + 100, "ATRAVIESAN LA XLPE HASTA EL Al", 9.4)

# =============== TABLAS ===============
v = [("CODIGO", "MODELO", "PRINCIPAL", "DERIVACION", "TORQUE", "PESO", "USO"),
     ("4028", "1995/3 · PKD-16", "25–95 mm²", "25–95 mm²", "10 N·m", "100 g", "DERIVACIONES GRANDES"),
     ("3051", "1995/1 (A TABLERO)", "VER GRABADO (*)", "VER GRABADO (*)", "— (*)", "— (*)", "TOMA DE LA RED (AP-TC-024)")]
yv = tablaC(h, 40, 520, [(56, "c", True), (140, "l", False), (110, "c", False), (110, "c", False), (56, "c", False), (50, "c", True), (210, "l", False)], v, "VARIANTES (LCT / METAL-CE)", rowh=16)
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN."]]
for cc in [4028, 3051]: r = cat(cc, 80); fil.append([r[0], r[1], r[2] + (" (*)" if r[2] == "m" else "")])
yt = tablaC(h, 40, yv + 18, [(56, "c", True), (560, "l", False), (60, "c", False)], fil, "CODIGOS DEL PAÑOL (2)", rowh=16)
ydat = bloque(h, 40, yt + 20, "DATOS TECNICOS", [
    "INDENTACION MULTIPLE: LOS DIENTES PERFORAN LA AISLACION DE LOS DOS CABLES. PRINCIPAL Y DERIVACION 25–95 mm² (1995/3).",
    "BULON M8 CON CABEZA FUSIBLE (LLAVE TUBO 13 mm): SE APRIETA HASTA QUE SE CORTA (≈ 10 N·m). CUERPO DE NYLON CON FIBRA DE VIDRIO (*).",
    "NO SIRVE PARA LA BAJADA Cu 4 x 16 (USAR 1995/6 O 1995/4: MAT-MORSETO-1)."], w=800, sz=10, lh=13.5)
notasW(h, 40, ydat + 2, [
    "COTAS DEL CUERPO NO PUBLICADAS: LAS «≈» SON PROPORCIONALES A IPC DE CATALOGO (*). SE DIBUJA CON LA MISMA FORMA QUE EL PKD-14.",
    "(*) EL 1995/1 (3051) NO TIENE DATOS PUBLICADOS: RANGOS, TORQUE Y FORMA SALEN DEL GRABADO DE LA PIEZA. SE DIBUJA COMO EL 1995/3.",
    "(*) EL CATALOGO TIENE 3051 EN «m» Y LA CALCULADORA LO CUENTA POR UNIDAD (REVISION DE TIPOS, PUNTO C).",
    "(*) FORMA, CANTIDAD Y FILAS DE DIENTES DEL 1995/3: A CONFIRMAR CON EL CATALOGO LCT.",
    "FUENTES: LCT CATALOGO DE LINEAS AEREAS; DISTRIBUIDORES METAL-CE; FICHA DE LA APP; AP-TC-024; CLAUDE.md §11.3; r3d/FUENTES_cables.md."], w=800, lh=14)
rayadosC(h, 40, 1092, ["NYL", "CU", "XLP", "ALU"], cols=4, dx=190)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - 1995/3 (PKD-16) EN LA LINEA", "CORTADO A CUARTO POR LA FILA DE DIENTES")
A = img3d(h, "mors2", 890, 92, 540)
columna(h, A, [("diente", "3", "DIENTES Cu ESTAÑADO"), ("cuerda", "2", "FASE Al 25 (LINEA)"), ("aisl", "", "XLPE PERFORADA"), ("placa", "4", "PLACA DE CONTACTO"),
               ("cuerpo", "1", "CUERPO NYLON + FV"), ("fusible", "5", "CABEZA FUSIBLE 13 mm"), ("cabeza", "", "CABEZA QUE QUEDA"), ("der", "6", "DERIVACION Al 25")], 1460, 120, 470, paso=40)
h.txt(890, 530, "VISTA 3D - EXPLOTADO: LAS DOS MITADES, LOS DIENTES Y EL BULON", 11, 700, NV, "start", INT)
A2 = img3d(h, "mors2b", 890, 540, 520)
columna(h, A2, [("mitadA", "", "MITAD DE ATRAS"), ("dientes", "", "4 FILAS DE DIENTES (*)"), ("bulon", "", "BULON M8"), ("mitadF", "", "MITAD DE ADELANTE"), ("tuerca", "", "TUERCA"), ("fusible", "", "CABEZA FUSIBLE")], 1440, 580, 920, paso=40)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/mors2.mjs, mors2b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-MORSETO-2", "MORSETO DE INDENTACION", "1995/3 (PKD-16) Y 1995/1", "FRENTE, CORTE A-A, D1, VARIANTES Y 3D", "3:1 / 4,5:1", "D1 12:1 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_morseto_2.svg"))
