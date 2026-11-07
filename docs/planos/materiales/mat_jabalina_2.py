import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
# ================= TOMACABLE · PLANTA Y CORTE (2:1)
h.titulo(40, 62, "TOMACABLE DE BRONCE - PLANTA Y CORTE", 'ESC. 2:1 - PARA JABALINA 5/8" (Ø14,6) - MEDIDAS DEL CUERPO (*)')
k = 4.0   # px por mm (2:1 en la hoja)
cx, cy = 190, 230
W, D = 31, 21   # cuerpo (*) (tomacable comercial hasta 21 × 31)
h.rect(cx - W / 2 * k, cy - D / 2 * k, W * k, D * k, "url(#BRZ)", K, 1.6)
h.circ(cx - 5 * k, cy, 7.3 * k, "#fff", K, 1.2); h.circ(cx - 5 * k, cy, 7.3 * k - 2, "url(#cuH)", K, .6)   # jabalina en corte
h.rect(cx + 4 * k, cy - 2.6 * k, 9 * k, 5.2 * k, "#fff", K, .9)   # canal del cable
h.circ(cx + 8.5 * k, cy, 2.05 * k, "url(#cuH)", K, .7)
h.ln(cx - W / 2 * k - 16, cy, cx + W / 2 * k + 16, cy, K, .5, h.EJE); h.ln(cx - 5 * k, cy - D / 2 * k - 16, cx - 5 * k, cy + D / 2 * k + 16, K, .5, h.EJE)
h.dimH(cy - D / 2 * k - 26, cx - W / 2 * k, cx + W / 2 * k, "31 (*)", ext=cy - D / 2 * k - 2, c=OR)
h.dimV(cx - W / 2 * k - 26, cy - D / 2 * k, cy + D / 2 * k, "21 (*)", ext=cx - W / 2 * k - 2, c=OR)
h.dimH(cy + D / 2 * k + 30, cx - 12.3 * k, cx + 2.3 * k, "Ø14,6", ext=cy + 10)
h.globo("1", cx + 12 * k, cy - 8 * k, cx + 120, cy - 62); h.txt(cx + 136, cy - 58, "CUERPO DE BRONCE", 10.5)
h.globo("2", cx - 5 * k, cy + 3 * k, cx + 120, cy + 70); h.txt(cx + 136, cy + 74, "JABALINA (PASA ENTERA)", 10.5)
h.globo("3", cx + 8.5 * k, cy + 1 * k, cx + 120, cy + 34); h.txt(cx + 136, cy + 38, "CABLE 1×10 V/A EN SU CANAL", 10.5)
# ================= CONECTOR C DE COMPRESION (esquema)
h.titulo(480, 62, "CONECTOR «C» DE COMPRESION", "ESQUEMA S/E - CMC-7 (7013) / CMC-8 (7014)")
ox, oy = 640, 230
h.path(f"M{ox+60},{oy-48} A62,62 0 1 0 {ox+60},{oy+48} L{ox+40},{oy+30} A38,38 0 1 1 {ox+40},{oy-30} Z", "url(#BRZ)", K, 1.5)
h.circ(ox - 20, oy - 4, 29, "url(#cuH)", K, 1); h.txt(ox - 20, oy + 1, "JAB.", 10, 700, K, "middle")
h.circ(ox + 22, oy + 14, 11, "url(#cuH)", K, .9)
h.globo("4", ox + 40, oy - 60, ox + 130, oy - 82); h.txt(ox + 120, oy - 104, "CUERPO EN «C»", 10.5, 400, K, "middle")
h.globo("5", ox + 22, oy + 14, ox + 130, oy + 70); h.txt(ox + 105, oy + 100, "CABLE 6-16 (CMC-7) · 25 (CMC-8)", 10.5, 400, K, "middle")
h.txt(ox - 95, oy + 128, "SE CIERRA CON PINZA DE COMPRESION", 10, 400, G)
h.txt(ox - 95, oy + 142, "(«PICO DE LORO»), NO CON BULON", 10, 400, G)
# ================= CABLE 1×10 V/A · CORTE
h.titulo(40, 400, "CABLE Cu 1×10 mm² VERDE-AMARILLO - CORTE", "ESC. 10:1 (ESQUEMA) - IRAM NM 247-3 (7010)")
ccx, ccy = 140, 525
h.circ(ccx, ccy, 50, "url(#PLAS)", K, 1.3); h.circ(ccx, ccy, 34, "#fff", K, .8)
for px, py in [(0, 0)] + [(22 * math.cos(math.radians(60 * j)), 22 * math.sin(math.radians(60 * j))) for j in range(6)]:
    h.circ(ccx + px, ccy + py, 11, "url(#cuH)", K, .6)
h.dimH(ccy + 70, ccx - 50, ccx + 50, "≈ Ø6 (*)", ext=ccy + 52, c=OR)
h.dimH(ccy - 66, ccx - 34, ccx + 34, "≈ Ø4,1 (*)", ext=ccy - 36, c=OR)
h.txt(ccx + 70, ccy - 22, "CUERDA DE 7 HILOS DE COBRE (*)", 10.5); h.txt(ccx + 70, ccy - 6, "AISLACION PVC VERDE-AMARILLO", 10.5)
h.txt(ccx + 70, ccy + 10, "450/750 V (*)", 10.5, 400, OR)
# ================= GRAMPA TERMINAL A184 (esquema)
h.titulo(480, 400, "GRAMPA TERMINAL A184 (7016)", "ESQUEMA S/E - FORMA A CONFIRMAR (*)")
gx, gy = 560, 470
h.rect(gx, gy, 120, 44, "url(#BRZ)", K, 1.3); h.circ(gx + 30, gy + 22, 11, "#fff", K, 1)
h.rect(gx + 120, gy + 10, 90, 24, "url(#BRZ)", K, 1.1); h.circ(gx + 180, gy + 22, 7, "#fff", K, .9)
h.txt(gx + 60, gy + 66, "Cu ESTAÑADO · CABLE DE PAT A OJAL (*)", 10.5, 400, OR, "middle")
# códigos
y2 = h.codigos(40, 625, [7019, 7013, 7014, 7016, 7010],
               extra={7019: 'jabalina 5/8"', 7013: 'jab. 5/8" + cable 6–16 mm²', 7014: 'jab. 5/8" + cable 25 mm²', 7016: "cable de PAT", 7010: "jabalina → borne / bulón"})
y3 = h.datos(40, y2 + 32, [("MATERIAL", "bronce (sin zinc en la aleación)"), ("TOMACABLES COM.", "13×17 a 21×31 mm (T1 a T4)"),
    ("PARA JABALINA", "Ø 10 / 12 / 16 / 19 según modelo"), ("CABLE", "4 a 120 mm² según modelo"), ("EXIGENCIA ETG 14", "no se admite tomacable a rosca"),
    ("CABLE 7010", "Cu 1×10 mm² V/A · IRAM NM 247-3")], w=410, c1=140)
h.lista(480, y2 + 32, "DONDE SE USA", [
    "· AP-TC-005: cable 1×10 + tomacable en cada",
    "   jabalina de columna metálica y de tablero.",
    "· TC-PRFV-02: jabalina de fin de circuito,",
    "   puntera TIFF 10 al BPN verde.",
    "· Guía «Puesta a tierra y medición»: paso 4.",
    "· Ítem 74 tomacable · 87 cable V/A 10 mm².",
    "· Cálculo: 1 tomacable por jabalina; cable",
    "   10 m/tablero + 7 m/circ. (PRFV) o 4 m/col.",
])
h.notas(40, 1010, [
    "COTAS EN mm. MANDA LA COTA. SE DIBUJA EL TOMACABLE PARA LA JABALINA 5/8\" (Ø14,6) DEL PLIEGO.",
    "(*) MEDIDAS DEL CUERPO DEL TOMACABLE: LA FICHA SOLO DA EL RANGO COMERCIAL 13×17 A 21×31. A CONFIRMAR CON EL FABRICANTE.",
    "(*) LA FAMILIA DICE «A COMPRESION, NO A ROSCA» Y EL DIBUJO DE LA APP MUESTRA UN BULON: CONFIRMAR EL MODELO WGC/TGC QUE SE COMPRA.",
    "(*) FORMA DE LA GRAMPA A184 Y DIAMETROS DEL CABLE 1×10 (CUERDA, AISLACION, TENSION): NO ESTAN EN LA APP, A CONFIRMAR.",
    "EL CABLE NO TIENE QUE GIRAR NI SALIRSE. FOTO DE LA CONEXION ANTES DE TAPAR (GUIA PAT).",
    "FUENTE: FICHA «TOMACABLE Y CONECTORES PARA JABALINA» (CATALOGOS TAREA Y GENROD); GUIA PAT; CLAUDE.md §11.3.",
])
# ================= 3D TOMACABLE SOBRE LA JABALINA
h.titulo(890, 62, "VISTA 3D - TOMACABLE EN LA CABEZA", "BRONCE SOBRE LA JABALINA DE ACERO-COBRE, CON EL CABLE 1×10 V/A")
h.iso(3.4, 1190, 300)
R = 7.3
m.cyl([0, 0, -48], [0, 0, 6], R, "cobre", n=32, seg=4)
m.box(-12.5, 18.5, -10.5, 10.5, -22, -4, "bronce", edge="#5a4012", bias=10)
m.cyl([18.5, 0, -13], [27, 0, -13], 5, "bronce", n=6, edge="#5a4012", bias=14)   # tuerca/bulón (*)
m.cyl([9, 10.5, -13], [9, 70, -13], 3.4, "verde", n=14, seg=6, bias=12)
m.cyl([9, -26, -13], [9, -10.5, -13], 2.05, "cobre", n=10, bias=5)
m.render()
for kk in range(6):
    a = h.P(9, 16 + kk * 9, -13 + 3.2); b = h.P(9, 20 + kk * 9, -13 + 3.2); h.ln(a[0], a[1], b[0], b[1], "#f2d21e", 3)
h.g3("1", (5, -10.5, -8), 1450, 150, "TOMACABLE DE BRONCE 7019")
h.g3("2", (0, 0, -40), 1450, 200, "JABALINA 7015 (CABEZA)")
h.g3("3", (9, 50, -11), 1450, 250, "CABLE 1×10 V/A 7010")
h.g3("6", (24, 0, -10), 1450, 300, "AJUSTE (*) VER NOTA 3")
# ================= 3D CONECTOR C (variante)
h.titulo(890, 560, "VARIANTE - CONECTOR «C» DE COMPRESION", "CMC-7 / CMC-8: ABRAZA LA JABALINA Y EL CABLE, SE CIERRA CON PINZA")
h.iso(4.0, 1200, 790)
m.cyl([0, 0, -46], [0, 0, 6], R, "cobre", n=32, seg=4)
# perfil en C extruido en z
pts = []
for a in range(-130, 131, 10): pts.append((14 * math.cos(math.radians(a + 180)) * 1, 14 * math.sin(math.radians(a + 180))))
for a in range(130, -131, -10): pts.append((10 * math.cos(math.radians(a + 180)), 10 * math.sin(math.radians(a + 180))))
m.prism(pts, [4, 0, -30], [1, 0, 0], [0, 1, 0], [0, 0, 1], 14, "bronce", edge="#5a4012", bias=8)
m.cyl([10.6, 0, -34], [10.6, 0, -10], 2.6, "verde", n=14, seg=4, bias=6)
m.cyl([10.6, 0, -10], [50, 0, 6], 2.6, "verde", n=14, seg=4, bias=6)
m.render()
h.g3("4", (0, -14, -18), 1450, 650, "CONECTOR C 7013 / 7014")
h.g3("5", (35, 0, 0), 1450, 700, "CABLE DE PAT")
h.g3("2", (0, 0, -40), 1450, 750, "JABALINA")
h.txt(890, 1006, "El conector va apretado con la pinza de compresión: no se suelta con el tiempo ni con la corrosión.", 11, 400, G, "start", INT)
h.rotulo(890, h.H - 150, 750, "MAT-JABALINA-2", "TOMACABLE, CONECTORES", "Y CABLE DE PAT", "PLANTA, CORTES, ESQUEMAS, DATOS Y 3D", "2:1 / 10:1", "ESQUEMAS Y 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_jabalina_2.svg")); print("ok")
