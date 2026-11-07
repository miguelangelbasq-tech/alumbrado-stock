import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
from morsetokit import plano_frente, morseto3d
h = Ficha(); m = h.m
# ================= VISTA FRONTAL (corte por los canales)
h.titulo(40, 62, "VISTA FRONTAL - CORTE POR LOS CANALES", "ESQUEMA S/E (MEDIDAS DEL CUERPO NO PUBLICADAS) - 1995/6 · PKD-14")
C, V = 90, 150
plano_frente(h, C, V)
h.dimH(V - 52, C, C + 180, "≈ 50 (*)", ext=V - 4, c=OR)
h.dimV(C - 22, V - 4, V + 156, "≈ 60 (*)", ext=C - 2, c=OR)
h.globo("1", C + 20, V + 22, C - 50, V - 14); h.globo("2", C + 78, V + 36, C - 50, V + 52); h.globo("3", C + 80, V + 112, C - 50, V + 112)
h.globo("4", C + 172, V - 22, C + 220, V - 40); h.globo("5", C + 164, V + 4, C + 220, V + 8); h.globo("6", C + 160, V + 140, C + 220, V + 140)
h.txt(C + 90, V + 186, "LINEA (ARRIBA) · DERIVACION (ABAJO)", 10.5, 700, K, "middle")
# referencias
rx, ry = 370, 130
for i, t in enumerate(["CUERPO NYLON 6/6 CON 33 % FIBRA DE VIDRIO", "CANAL DE LA LINEA (PRINCIPAL)", "CANAL DE DERIVACION + CAPUCHON",
                       "CABEZA FUSIBLE: SE CORTA AL LLEGAR AL TORQUE", "TUERCA DEL BULON (LLAVE TUBO 13 mm)", "BULON CON TRATAMIENTO ANTICORROSIVO"]):
    h.circ(rx + 10, ry + i * 26, 9, "#fff", K, .9); h.txt(rx + 10, ry + i * 26 + 4, str(i + 1), 10.5, 700, K, "middle"); h.txt(rx + 26, ry + i * 26 + 4, t, 10.5)
# D1 dientes
h.titulo(370, 312, "DETALLE D1 - DIENTES", "S/E - Cu ESTAÑADO, DOBLE PERFORACION")
h.llamadaDet(C + 90, V + 32, 16, "D1")
dx, dy = 400, 360
h.rect(dx, dy + 34, 300, 26, "url(#PLAS)", K, 1); h.txt(dx + 306, dy + 52, "AISLACION", 10)
h.rect(dx, dy + 60, 300, 14, "url(#cuH)", K, 1); h.txt(dx + 306, dy + 72, "CONDUCTOR", 10)
for i in range(6):
    xx = dx + 30 + i * 46; h.path(f"M{xx-10},{dy+20} L{xx},{dy+64} L{xx+10},{dy+20} z", "url(#cuH)", K, 1)
h.rect(dx, dy, 300, 20, "url(#PLAS)", K, 1)
h.dimH(dy - 14, dx + 20, dx + 40, "1,5", ext=dy + 20)
h.txt(dx, dy + 98, "EL DIENTE ATRAVIESA LA AISLACION: NO SE PELA EL CABLE.", 10.5)
# variantes / datos de cada código
h.tabla(40, 520, [(62, "c", True), (130, "l", False), (90, "c", False), (90, "c", False), (100, "c", False), (60, "c", True), (250, "l", False)],
        [("CODIGO", "MODELO", "PRINCIPAL", "DERIVACION", "TORQUE", "PESO", "USO"),
         ("4027", "1995/6 · PKD-14AC", "10–95 mm²", "1,5–10 mm²", "≈ 8 N·m", "123 g", "neutro / bajada (ver nota 3)"),
         ("4026", "1995/4 · PKD-14PF", "10–95 mm²", "4–16 mm²", "10 N·m", "110 g", "fase con fusible, 1 luminaria")], titulo="VARIANTES (LCT, PLANILLA DE DATOS N° 352)")
y2 = h.codigos(40, 620, [4027, 4026], extra={4027: "unidad «m» en catálogo (*)", 4026: "unidad «m» en catálogo (*)"})
y3 = h.datos(40, y2 + 32, [("TIPO", "IPC: perforación de aislación"), ("CUERPO", "nylon 6/6 + 33 % fibra de vidrio"), ("DIENTES", "Cu electrolítico 99,9 %, estañado"),
    ("TENSION", "1,1 kV"), ("PORTAFUSIBLE (PF)", "tipo Neozed, 63 A máx."), ("NORMAS", "IRAM 2435 · NFC 33004/33022 · ANSI C119.4")], w=410, c1=140)
h.lista(480, y2 + 32, "DONDE SE USA", [
    "· AP-T-019: bajada Cu 4×16 a la línea",
    "   preensamblada de EPEC: 1 por conductor.",
    "· AP-TC-006 / AP-TC-055: acometida aérea a",
    "   una luminaria con el PF (fusible).",
    "· Guía «Morseto PKD-14» y «Acometida aérea».",
    "· Se aprieta con llave tubo 13 mm aislada",
    "   hasta que se corta la cabeza fusible.",
])
h.notas(40, 1010, [
    "ESQUEMA SIN ESCALA: EL FABRICANTE NO PUBLICA LAS COTAS DEL CUERPO. LAS MEDIDAS ≈ SON ORIENTATIVAS (*), A CONFIRMAR.",
    "DIENTES DE Cu ESTAÑADO DE 1,5 mm. SIRVE PARA LINEA DE Al Y BAJADA DE Cu (BIMETALICO).",
    "(*) 1995/6: LA FICHA DA DERIVACION 1,5–10 mm² Y LA FAMILIA DICE 4–16. PARA LA BAJADA Cu 4×16 CONFIRMAR EN EL GRABADO; SI NO, PKD-14PF.",
    "(*) EL CATALOGO TIENE 4026 Y 4027 EN «m» Y LA CALCULADORA LOS CUENTA POR UNIDAD (REVISION DE TIPOS, PUNTO C).",
    "NO CONFUNDIR CON EL 1995/3 (PKD-16, 4028): ESE ES DE 25–95 Y NO SIRVE PARA 16 mm² (VER MAT-MORSETO-2).",
    "FUENTE: LCT PLANILLA DE DATOS GARANTIZADOS N° 352 Y CATALOGO DE LINEAS AEREAS; DISTRIBUIDORES METAL-CE; FICHA DE LA APP.",
])
# ================= 3D
h.titulo(890, 62, "VISTA 3D - MORSETO 1995/6 (PKD-14) EN LA LINEA", "NYLON NEGRO · DIENTES DE COBRE · BULON CON CABEZA FUSIBLE")
h.iso(2.3, 1170, 320)
morseto3d(m)
h.g3("1", (0, -10, 30), 1450, 130, "CUERPO NYLON 6/6 + FV")
h.g3("2", (-2, -80, 9), 1450, 175, "LINEA PREENSAMBLADA (PASA)")
h.g3("3", (-2, 90, -16), 1450, 220, "DERIVACION / BAJADA")
h.g3("7", (-2, -24, -14), 1450, 265, "CAPUCHON DE LA PUNTA")
h.g3("4", (30, 0, 48), 1450, 310, "CABEZA FUSIBLE")
h.g3("6", (30, 0, -38), 1450, 355, "BULON + TUERCA 13 mm")
h.titulo(890, 560, "VISTA 3D - MORSETO 1995/4 (PKD-14PF)", "IGUAL AL ANTERIOR, CON PORTAFUSIBLE NEOZED EN LA DERIVACION")
h.iso(2.3, 1170, 820)
morseto3d(m, pf=True)
h.g3("8", (-14, 33, 6), 1450, 680, "PORTAFUSIBLE (63 A MAX.)")
h.g3("4", (30, 0, 48), 1450, 725, "CABEZA FUSIBLE")
h.g3("2", (-2, -80, 9), 1450, 770, "LINEA")
h.g3("3", (-2, 100, -16), 1450, 815, "A LA LUMINARIA")
h.rotulo(890, h.H - 150, 750, "MAT-MORSETO-1", "MORSETO DENTADO", "1995/6 Y 1995/4 (PKD-14)", "FRENTE, DIENTES, VARIANTES, DATOS Y 3D", "S/E", "ESQUEMA Y 3D")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_morseto_1.svg")); print("ok")
