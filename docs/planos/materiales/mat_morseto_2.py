import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
from morsetokit import plano_frente, morseto3d
h = Ficha(); m = h.m
# ================= VISTA FRONTAL (corte por los canales)
h.titulo(40, 62, "VISTA FRONTAL - CORTE POR LOS CANALES", "ESQUEMA S/E (MEDIDAS DEL CUERPO NO PUBLICADAS) - 1995/3 · PKD-16")
C, V = 90, 150
plano_frente(h, C, V, rp=13, rd=10)
h.dimH(V - 52, C, C + 180, "≈ 50 (*)", ext=V - 4, c=OR)
h.dimV(C - 22, V - 4, V + 156, "≈ 60 (*)", ext=C - 2, c=OR)
h.globo("1", C + 20, V + 22, C - 50, V - 14); h.globo("2", C + 78, V + 36, C - 50, V + 52); h.globo("3", C + 80, V + 112, C - 50, V + 112)
h.globo("4", C + 172, V - 22, C + 220, V - 40); h.globo("5", C + 164, V + 4, C + 220, V + 8); h.globo("6", C + 160, V + 140, C + 220, V + 140)
h.txt(C + 90, V + 186, "LINEA (ARRIBA) · DERIVACION (ABAJO)", 10.5, 700, K, "middle")
# referencias
rx, ry = 370, 130
for i, t in enumerate(["CUERPO AISLANTE (NYLON CON FV) (*)", "CANAL DE LA LINEA (25–95 mm²)", "CANAL DE DERIVACION (25–95 mm²)",
                       "CABEZA FUSIBLE: SE CORTA AL LLEGAR AL TORQUE", "TUERCA DEL BULON (LLAVE TUBO 13 mm)", "BULON CON TRATAMIENTO ANTICORROSIVO"]):
    h.circ(rx + 10, ry + i * 26, 9, "#fff", K, .9); h.txt(rx + 10, ry + i * 26 + 4, str(i + 1), 10.5, 700, K, "middle"); h.txt(rx + 26, ry + i * 26 + 4, t, 10.5)
# D1 dientes
h.titulo(370, 312, "DETALLE D1 - DIENTES", "S/E - INDENTACION MULTIPLE, Cu ESTAÑADO (*)")
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
h.tabla(40, 520, [(62, "c", True), (170, "l", False), (90, "c", False), (90, "c", False), (100, "c", False), (60, "c", True), (210, "l", False)],
        [("CODIGO", "MODELO", "PRINCIPAL", "DERIVACION", "TORQUE", "PESO", "USO"),
         ("4028", "1995/3 · PKD-16", "25–95 mm²", "25–95 mm²", "10 N·m", "100 g", "derivaciones grandes"),
         ("3051", "1995/1 (acometida tablero)", "ver grabado", "ver grabado", "—", "—", "toma de la red (AP-TC-024)")], titulo="VARIANTES (LCT / METAL-CE)",
        colores=lambda i, j, t: OR if t in ("ver grabado", "—") else K)
y2 = h.codigos(40, 620, [4028, 3051], extra={4028: "NO sirve para 16 mm²", 3051: "unidad «m» en catálogo (*)"})
y3 = h.datos(40, y2 + 32, [("TIPO", "indentación múltiple, perfora la aislación"), ("RANGO 1995/3", "principal y derivación 25–95 mm²"), ("NO SIRVE PARA", "la bajada Cu 4×16 (usar 1995/6 o /4)"),
    ("CUERPO", "nylon con fibra de vidrio (*)"), ("1995/1", "sin datos publicados: leer el grabado")], w=410, c1=140)
h.lista(480, y2 + 32, "DONDE SE USA", [
    "· Acometida (CLAUDE.md §11.3): 1995/3",
    "   (PKD-16) 25–95; 1995/6 bajada 4–16;",
    "   1995/4 solo derivación aérea.",
    "· AP-TC-024 transición aéreo-subterránea:",
    "   toma de la red con morsetos 1995/1 (3051).",
    "· AP-T-014 · guía «Acometida aérea».",
])
h.notas(40, 1010, [
    "ESQUEMA SIN ESCALA: EL FABRICANTE NO PUBLICA LAS COTAS DEL CUERPO. LAS MEDIDAS ≈ SON ORIENTATIVAS (*), A CONFIRMAR.",
    "EL 1995/3 (PKD-16) ES DE 25 A 95 mm² EN LOS DOS CANALES: NO SIRVE PARA 16 mm². PARA LA BAJADA Cu 4×16, VER MAT-MORSETO-1.",
    "(*) EL 1995/1 (3051) NO TIENE DATOS PUBLICADOS: RANGOS, TORQUE Y FORMA SALEN DEL GRABADO DE LA PIEZA. SE DIBUJA COMO EL 1995/3.",
    "(*) EL CATALOGO TIENE 3051 EN «m» Y LA CALCULADORA LO CUENTA POR UNIDAD (REVISION DE TIPOS, PUNTO C).",
    "(*) INDENTACION / FORMA DE LOS DIENTES DEL 1995/3: A CONFIRMAR CON EL CATALOGO LCT.",
    "FUENTE: LCT CATALOGO DE LINEAS AEREAS; DISTRIBUIDORES METAL-CE; FICHA DE LA APP; AP-TC-024; CLAUDE.md §11.3.",
])
# ================= 3D
h.titulo(890, 62, "VISTA 3D - MORSETO 1995/3 (PKD-16)", "LINEA Y DERIVACION GRANDES (PREENSAMBLADO A PREENSAMBLADO)")
h.iso(2.3, 1170, 320)
morseto3d(m, rder=8.5, col_der="negro")
h.g3("1", (0, -10, 30), 1450, 130, "CUERPO")
h.g3("2", (-2, -80, 9), 1450, 175, "LINEA 25–95 mm²")
h.g3("3", (-2, 90, -16), 1450, 220, "DERIVACION 25–95 mm²")
h.g3("4", (30, 0, 48), 1450, 265, "CABEZA FUSIBLE")
h.g3("6", (30, 0, -38), 1450, 310, "BULON + TUERCA")
h.titulo(890, 560, "VISTA 3D - MORSETO 1995/1 (3051)", "ACOMETIDA A TABLERO - FORMA A CONFIRMAR CON LA PIEZA (*)")
h.iso(2.3, 1170, 820)
morseto3d(m, rder=8.5, col_der="negro")
h.g3("1", (0, -10, 30), 1450, 680, "CUERPO (FORMA (*))")
h.g3("2", (-2, -80, 9), 1450, 725, "RED (VER GRABADO)")
h.g3("3", (-2, 90, -16), 1450, 770, "AL TABLERO / CAÑO")
h.rotulo(890, h.H - 150, 750, "MAT-MORSETO-2", "MORSETO DE INDENTACION", "1995/3 (PKD-16) Y 1995/1", "FRENTE, VARIANTES, DATOS Y 3D", "S/E", "ESQUEMA Y 3D")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_morseto_2.svg")); print("ok")
