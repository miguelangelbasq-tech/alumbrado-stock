import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
# ================= CORTE POR EL BLOQUETE SOLDADO (1:1)
h.titulo(40, 62, "CORTE A-A - BLOQUETE SOLDADO AL FUSTE", "ESC. 1:1 - COLUMNA METALICA EXISTENTE (AP-TC-005 HOJA 2/2)")
k = 3.0; x0, cy = 110, 230
wall = 4   # espesor de la chapa del fuste (*)
h.rect(x0 - wall * k, cy - 60 * k / 2 - 20, wall * k, 60 * k + 40, "url(#STEEL)", K, 1.4)
h.txt(x0 - wall * k - 8, cy - 60 * k / 2 - 26, "FUSTE", 10.5, 700, K, "end")
L = 50; D = 26   # largo 50 (catálogo) · Ø exterior (*)
h.rect(x0, cy - D / 2 * k, L * k, D * k, "url(#BRZ)", K, 1.5)
h.rect(x0, cy - 6.35 * k, L * k, 12.7 * k, "#fff", K, 1)   # rosca 1/2"
for i in range(int(L / 2)):
    xx = x0 + 2 + i * 2 * k; h.ln(xx, cy - 6.35 * k, xx + k, cy - 6.35 * k + 4, K, .4); h.ln(xx, cy + 6.35 * k, xx + k, cy + 6.35 * k - 4, K, .4)
h.path(f"M{x0},{cy-D/2*k} l-8,-8 v8 z M{x0},{cy+D/2*k} l-8,8 v-8 z", K, K, .6)   # cordón de soldadura
h.ln(x0 - 20, cy, x0 + L * k + 30, cy, K, .5, h.EJE)
h.dimH(cy - D / 2 * k - 24, x0, x0 + L * k, "50", ext=cy - D / 2 * k - 2)
h.dimV(x0 + L * k + 26, cy - 6.35 * k, cy + 6.35 * k, 'RW 1/2"', ext=x0 + L * k + 2)
h.dimV(x0 + L * k + 58, cy - D / 2 * k, cy + D / 2 * k, "Ø26 (*)", ext=x0 + L * k + 2, c=OR)
h.dimH(cy + 60 * k / 2 + 40, x0 - wall * k, x0, "4 (*)", c=OR, ext=cy + 60 * k / 2 + 20)
h.globo("1", x0 + 30 * k, cy - 10 * k, x0 + 30 * k, cy - 95); h.txt(x0 + 30 * k + 16, cy - 91, "BLOQUETE DE BRONCE 7003", 10.5)
h.globo("2", x0 - 4, cy + D / 2 * k + 4, x0 + 40, cy + 85); h.txt(x0 + 56, cy + 89, "SOLDADO EN TODO EL PERIMETRO", 10.5)
h.globo("3", x0 + 20 * k, cy + 4, x0 + 20 * k + 60, cy + 55); h.txt(x0 + 20 * k + 76, cy + 59, "ROSCA INTERIOR RW 1/2\"", 10.5)
# ================= TERMINAL BANDERITA (2:1)
h.titulo(470, 62, "TERMINAL BANDERITA (7018)", "ESC. 2:1 - Cu ESTAÑADO - OJAL Ø14,6 (AP-TC-005)")
bx, by = 520, 200; k2 = 3.0
h.circ(bx + 44 * k2, by, 14 * k2, "url(#cuH)", K, 1.4)  # paleta del ojal
h.circ(bx + 44 * k2, by, 7.3 * k2, "#fff", K, 1.2)
h.rect(bx, by - 6 * k2, 30 * k2, 12 * k2, "url(#cuH)", K, 1.4)   # caño de engarce
h.rect(bx - 4, by - 3.5 * k2, 26 * k2, 7 * k2, "#fff", K, .6, 'stroke-dasharray="4 2"')
h.ln(bx - 20, by, bx + 66 * k2, by, K, .5, h.EJE)
h.dimH(by - 14 * k2 - 14, bx + 30 * k2, bx + 58 * k2, "Ø28 (*)", c=OR, ext=by - 4)
h.dimV(bx + 44 * k2 + 7.3 * k2 + 34, by - 7.3 * k2, by + 7.3 * k2, "Ø14,6", ext=bx + 44 * k2 + 4)
h.dimH(by - 6 * k2 - 18, bx, bx + 30 * k2, "30 (*)", ext=by - 6 * k2 - 2, c=OR)
h.txt(bx, by + 14 * k2 + 24, "CAÑO DE ENGARCE: 10 mm² DE LA JABALINA", 10.5)
h.txt(bx, by + 14 * k2 + 40, "+ 2,5 mm² DEL ARTEFACTO, JUNTOS (AP-TC-006)", 10.5)
# ================= BLOQUETE DE HIERRO (no)
h.titulo(470, 330, "BLOQUETE DE HIERRO 7002 - NO USAR", "MN 1101 a - NO CUMPLE (SE OXIDA)")
h.rect(520, 370, 150, 50, "url(#STEEL)", K, 1.3); h.ln(510, 365, 680, 425, OR, 3); h.ln(510, 425, 680, 365, OR, 3)
h.txt(700, 400, "USAR SOLO EL DE", 10.5, 700); h.txt(700, 416, "BRONCE 7003", 10.5, 700)
# códigos
y2 = h.codigos(40, 470, [7003, 7002, 7018, 7013, 7014, 7016],
               extra={7003: "va soldado · col. existente", 7002: "NO USAR (no cumple)", 7018: "ojal Ø14,6 · 10 + 2,5 mm²", 7013: "ver MAT-JABALINA-2", 7014: "ver MAT-JABALINA-2", 7016: "ver MAT-JABALINA-2"})
y3 = h.datos(40, y2 + 32, [("BLOQUETE 7003", 'bronce · RW 1/2" × 50 (MN 1101 b)'), ("NOMBRE EN EPEC", "espárrago con tuerca Q320 / Q320E"),
    ("AP-C-006", 'tuerca RW 1/2" de bronce soldada'), ("FIJACION", "soldado en todo el perímetro"),
    ("BANDERITA 7018", "Cu estañado · cable 10 mm² · ojal Ø14,6"), ("SOLO EN", "columna metálica EXISTENTE")], w=410, c1=140)
h.lista(480, y2 + 32, "DONDE SE USA", [
    "· AP-TC-005 hoja 2/2: columna existente,",
    "   1 banderita + 1 bloquete Q-320E de bronce.",
    "· AP-TC-006: acometida aérea; la banderita",
    "   aprieta el 10 mm² y el 2,5 mm² juntos.",
    "· AP-C-006 detalle B · AP-CC-001.",
    "· Columna NUEVA: no lleva bloquete ni",
    "   banderita: bulón PAT de la caja.",
    "· «Columnas existentes»: + torta.",
])
h.notas(40, 1010, [
    "COTAS EN mm. MANDA LA COTA. EL FUSTE SE DIBUJA PLANO (ES UN CAÑO).",
    "(*) Ø EXTERIOR DEL BLOQUETE, ESPESOR DEL FUSTE Y MEDIDAS DE LA BANDERITA (SALVO EL OJAL Ø14,6): A CONFIRMAR CON EL FABRICANTE.",
    "(*) ABIERTO (REVISION DE TIPOS): «BULON DE PAT RW 1/2\" CON TERMINAL DE OJAL 5/16\": NO ENTRA. ¿CUAL VA?».",
    "(*) UNIFICAR EL NOMBRE DEL BLOQUETE: RW 1/2\" / Q-320E / MN1101 b / «DE LATON». ES LA MISMA PIEZA (7003).",
    "LA BANDERITA QUEDA TAPADA CON LA TORTA DE LA COLUMNA EXISTENTE. EL BLOQUETE DE HIERRO 7002 NO SE USA.",
    "FUENTE: FICHA «BLOQUETE DE BRONCE Y TERMINAL BANDERITA» (EPEC P_140278 Q320/Q320E; LP 21478); AP-TC-005/006; AP-C-006.",
])
# ================= 3D PIEZAS
h.titulo(890, 62, "VISTA 3D - BLOQUETE, BULON Y BANDERITA", "DESPIECE: EL BULON PASA POR EL OJAL Y ENTRA EN LA ROSCA DEL BLOQUETE")
h.iso(2.3, 1080, 280)
m.box(-8, 0, -40, 40, -40, 40, "galv", edge="#55606a")          # pedazo de chapa del fuste
m.render()
m.cyl([0, 0, 0], [50, 0, 0], 13, "bronce", n=28, capmat="bronce", bias=10)
m.cyl([0, 0, 0], [2, 0, 0], 16, "#6f5a2a", n=28, bias=5)        # cordón de soldadura
m.render()
m.cyl([50.2, 0, 0], [50.4, 0, 0], 6.35, "#3b2a10", n=20, bias=30)
m.render()
# banderita separada
m.cyl([75, 0, 0], [77, 0, 0], 14, "estano", n=28, bias=40)
m.render()
m.cyl([77.1, 0, 0], [77.2, 0, 0], 7.3, "#ffffff", n=24, bias=41)
m.box(75, 77, 10, 40, -6, 6, "estano", edge="#777", bias=40)
m.cyl([76, 40, 0], [76, 70, 0], 6, "estano", n=16, bias=40)
m.cyl([76, 70, 0], [76, 120, 0], 3.4, "verde", n=12, seg=3, bias=40)
m.render()
m.cyl([110, 0, 0], [120, 0, 0], 11, "galv", n=6, edge="#555", bias=60)
m.rosca([80, 0, 0], [110, 0, 0], 6.35, "galv", paso=2.5, bias=55)
m.render()
h.g3("1", (25, 0, 13), 1450, 130, "BLOQUETE DE BRONCE 7003")
h.g3("2", (1, 0, -15), 1450, 180, "SOLDADURA PERIMETRAL")
h.g3("4", (76, 0, 12), 1450, 230, "BANDERITA 7018 (Cu ESTAÑADO)")
h.g3("5", (76, 100, 3), 1450, 280, "CABLE 1×10 V/A A LA JABALINA")
h.g3("6", (115, 0, 10), 1450, 330, 'BULON 1/2" (*)')
h.g3("7", (-4, 30, 30), 1450, 380, "FUSTE DE LA COLUMNA")
# ================= 3D EN SU LUGAR
h.titulo(890, 560, "EN SU LUGAR - PIE DE LA COLUMNA EXISTENTE", "LA BANDERITA Y EL BLOQUETE QUEDAN DEBAJO DE LA TORTA")
h.iso(.48, 1180, 790)
m.box(-260, 260, -260, 260, -150, 0, "#c9a77c", pat="soil3", edge="#6b5236")
m.render()
# torta cortada a un cuarto: 3 cuartos llenos
for (xa, xb, ya, yb) in ((-200, 0, -200, 200), (0, 200, -200, 0)):
    m.box(xa, xb, ya, yb, 0, 120, "conc", pat="conc3", edge="#666")
m.render()
m.cyl([0, 0, -100], [0, 0, 380], 70, "galv", n=36, seg=10, bias=-50)
m.render()
m.cyl([45, 45, 60], [85, 85, 60], 13, "bronce", n=16, bias=10)
m.cyl([86, 86, 60], [90, 90, 60], 18, "estano", n=16, bias=12)
m.cyl([88, 88, 45], [100, 100, -10], 3.4, "verde", n=10, seg=3, bias=11)
m.cyl([100, 100, -10], [230, 140, -120], 3.4, "verde", n=10, seg=3, bias=11)
m.render()
h.g3("1", (65, 65, 70), 1450, 640, "BLOQUETE 7003")
h.g3("4", (88, 88, 76), 1450, 690, "BANDERITA 7018")
h.g3("5", (180, 120, -70), 1450, 740, "CABLE 1×10 V/A")
h.g3("8", (-100, 150, 120), 1450, 790, "TORTA (CORTADA)")
h.g3("7", (0, 70, 300), 1450, 840, "COLUMNA METALICA EXISTENTE")
h.rotulo(890, h.H - 150, 750, "MAT-ACCESORIOS_PAT-2", "BLOQUETE DE BRONCE", "Y TERMINAL BANDERITA", "CORTE, BANDERITA, DATOS Y 3D", "1:1 / 2:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_accesorios_pat_2.svg")); print("ok")
