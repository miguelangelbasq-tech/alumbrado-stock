"""MAT-TABLERO-2 · Tablero de alumbrado armado (TNS / TT): 3058, 3057, 3059, 3060, 3061, 3062 y sus aparatos 3049, 3055, 3004, 3054, 3050, 3071.
Datos: FICHAS_TEC.tablero pieza 2 (tabla de 12 códigos; seccionador NH, medidor EPEC, diferencial, contactor comandado por el fotocontrol con
selectora automático-manual, una termomagnética por salida), plano() de la ficha (unifilar típico: NH fusible gL 63 A, medidor kWh «lo provee EPEC»,
diferencial 4 × 40 A 300 mA superinmunizado, contactor KM 25 A AC-1 bobina 220 V A1-A2, salidas 1–4), Normas AP-T-007 (TT) / AP-T-008 (TN-S),
FAMILIAS_MAT.tablero. «El esquema es una guía: salidas, protecciones y esquema de tierra salen del proyecto aprobado»."""
from ilukit import *
h = nueva(); m = h.m

# ======================= UNIFILAR TIPICO
h.titulo(40, 62, "ESQUEMA UNIFILAR TIPICO (TT, AP-T-007)", "GUIA: SALIDAS Y PROTECCIONES SEGUN EL PROYECTO APROBADO")
X = 150; y = 110
def tri(x, y):
    for i in range(3): h.ln(x - 6, y + 4 - i * 4 + 6, x + 6, y - 4 - i * 4 + 6, K, .8)
h.txt(X, y, "ACOMETIDA EPEC 3 × 380 / 220 V", 10, 700, K, "middle"); y += 8
h.ln(X, y, X, y + 20, K, 1.4); tri(X, y + 8); y += 20
# seccionador portafusible NH
h.rect(X - 12, y, 24, 40, "#fff", K, 1.2); h.rect(X - 5, y + 6, 10, 28, "#fff", K, .8); h.ln(X, y + 4, X, y + 36, K, .8)
h.txt(X + 22, y + 16, "SECCIONADOR PORTAFUSIBLE NH T00 + NH-00 gL 63 A", 9.5, 700); h.txt(X + 22, y + 30, "3055 + 3004 (UNO POR FASE) · VARIANTE 3054", 9, 400, G)
h.globo("1", X - 12, y + 20, 70, y + 20); y += 40
h.ln(X, y, X, y + 18, K, 1.4); y += 18
h.rect(X - 22, y, 44, 34, "#fff", K, 1.2); h.txt(X, y + 22, "kWh", 11, 700, K, "middle")
h.txt(X + 32, y + 15, "MEDIDOR TRIFASICO (LO PROVEE EPEC)", 9.5, 700); h.txt(X + 32, y + 29, "3049", 9, 400, G)
h.globo("2", X - 22, y + 17, 70, y + 17); y += 34
h.ln(X, y, X, y + 18, K, 1.4); y += 18
h.rect(X - 14, y, 28, 40, "#fff", K, 1.2); h.ln(X - 8, y + 30, X + 8, y + 10, K, 1.2); h.circ(X, y + 20, 13, "none", K, .6)
h.txt(X + 22, y + 16, "DIFERENCIAL 4 × 40 A · 300 mA SUPERINMUNIZADO", 9.5, 700); h.txt(X + 22, y + 30, "SOLO EN TT (AP-T-007) · TN-S: NO VA (AP-T-008)", 9, 400, G)
h.globo("3", X - 14, y + 20, 70, y + 20); y += 40
h.ln(X, y, X, y + 18, K, 1.4); y += 18
h.rect(X - 14, y, 28, 36, "#fff", K, 1.2); h.ln(X - 6, y + 26, X + 6, y + 10, K, 1.2); h.txt(X, y + 50, "", 9)
h.txt(X + 22, y + 14, "CONTACTOR KM 25 A AC-1 · BOBINA 220 V (A1-A2)", 9.5, 700); h.txt(X + 22, y + 28, "LA BOBINA LA COMANDA EL FOTOCONTROL (3012) CON SELECTORA A-M", 9, 400, G)
h.globo("4", X - 14, y + 18, 70, y + 18); y += 36
h.ln(X, y, X, y + 18, K, 1.4); y += 18
h.ln(X - 140 + 70, y, X + 230, y, K, 2.4)                       # barra
for i in range(4):
    xs = X - 70 + i * 90
    h.ln(xs, y, xs, y + 14, K, 1.2); h.rect(xs - 9, y + 14, 18, 30, "#fff", K, 1.1); h.ln(xs - 4, y + 38, xs + 4, y + 20, K, 1)
    h.ln(xs, y + 44, xs, y + 62, K, 1.2); flecha(h, xs, y + 56, xs, y + 66)
    h.txt(xs, y + 82, f"SALIDA {i+1}", 9.5, 700, K, "middle"); h.txt(xs, y + 95, "TM (*)", 9, 400, OR, "middle")
xs = X + 290
h.ln(X + 230, y, xs, y, K, 1.2); h.ln(xs, y, xs, y + 14, K, 1); h.rect(xs - 9, y + 14, 18, 30, "#fff", K, 1)
h.ln(xs, y + 44, xs, y + 56, K, 1); h.circ(xs - 12, y + 66, 9, "#fff", K, 1); h.txt(xs - 12, y + 70, "T", 9, 700, K, "middle")
h.circ(xs + 14, y + 66, 9, "#fff", K, 1); h.path(f"M{xs+8},{y+60} l12,12 M{xs+20},{y+60} l-12,12", "none", K, 1)
h.txt(xs, y + 92, "TOMA 3050 / 3071 · LUZ 6014", 9, 400, G, "middle")
h.globo("5", X - 70, y + 30, 70, y + 120); h.txt(86, y + 124, "UNA TERMOMAGNETICA POR SALIDA (CANTIDAD Y CALIBRE: PROYECTO)", 9.5, 400, OR)
h.txt(560, 165, "TT: LA BARRA PE VA SOLA A SU JABALINA,", 9.5, 400); h.txt(560, 179, "SIN UNION NEUTRO-PE (AP-T-007).", 9.5, 400)
h.txt(560, 199, "TN-S: BORNE DE NEUTRO DESPUES DEL GENERAL,", 9.5, 400); h.txt(560, 213, "UNIDO A LA BARRA PE, DESVINCULABLE (AP-T-008).", 9.5, 400)

# ======================= TABLA DE CODIGOS
y2 = h.codigos(40, 525, [3058, 3057, 3059, 3060, 3061, 3062, 3049, 3055, 3004, 3054, 3050, 3071],
               extra={3058: "armado s/proyecto", 3057: "TT · 2 sal. 4×25", 3059: "TNS · 6 sal. 1×16 A", 3060: "TNS · 3 sal. 1×25",
                      3061: "3 sal. 3×1×20 A", 3062: "4 sal. 3×1×16 A", 3049: "lo provee EPEC", 3055: "T00 + gL 63 A", 3004: "NH 00 63 A",
                      3054: "160 A, T000/00", 3050: "IRAM 2071", 3071: "10 A + T"}, wx=140, titulo="CODIGOS DEL PAÑOL (TABLEROS Y APARATOS)")
h.datos(40, y2 + 28, [("GABINETE", "PRFV IP65 (3058) · 800×600×300 (3057/3059)"), ("PROTECCION GRAL.", "NH 00 gL 63 A por fase"),
        ("DIFERENCIAL (TT)", "4 × 40 A · 300 mA · clase A"), ("COMANDO", "contactor 25 A AC-1 + fotocontrol"), ("SALIDAS", "TM por circuito (proyecto)")], w=440, c1=130)
textoBloque(h, 500, y2 + 28, "DONDE SE USA", [
    "· AP-T-007 (TT) / AP-T-008 (TN-S): el",
    "   interior del tablero aéreo.",
    "· AP-T-019: en el apoyo, a ≥ 5 m.",
    "· Calculadora: «Esquema de conexión a",
    "   tierra» TT / TN-S y cómo pedirlo.",
    "· Tablero de plaza: se compra armado."], sz=10, dy=15)
h.notas(40, 1040, [
    "EL ESQUEMA ES UNA GUIA: LA CANTIDAD DE SALIDAS, LAS PROTECCIONES Y EL ESQUEMA DE TIERRA (TT / TN-S) SALEN DEL PROYECTO APROBADO.",
    "(*) CALIBRE Y POLOS DE LAS TERMOMAGNETICAS, Y DISPOSICION DE LOS APARATOS EN LA PLACA: SEGUN EL PROYECTO.",
    "(*) MEDIDAS DE 3058, 3060, 3061, 3062: NO ESTAN EN EL CATALOGO. 3057 Y 3059: 800 × 600 × 300 (DESCRIPCION DEL PAÑOL).",
    "FUENTE: PLIEGO LP 21478 (AP-T-012 / ETG), PLANOS AP-T-007 / 008 (D.G.A.P. 2022), DESCRIPCIONES DEL PAÑOL."])

# ======================= 3D · TABLERO ARMADO ABIERTO
h.titulo(890, 62, "VISTA 3D - TABLERO ARMADO (ESQUEMA)", "GABINETE PRFV SIN PUERTA, TECHO NI COSTADO · APARATOS SOBRE LA PLACA · DISPOSICION (*)")
h.iso(.66, 1130, 640)
X0g, X1g, Yg, Zg = -100, 100, 215, 530
F = lambda *p: [list(q) for q in p]
m.face(F((X0g, -Yg, 0), (X0g, Yg, 0), (X0g, Yg, Zg), (X0g, -Yg, Zg)), "#e9eae4", 0, "#999")
m.face(F((X0g, -Yg, 0), (X1g, -Yg, 0), (X1g, -Yg, Zg), (X0g, -Yg, Zg)), "#dcddd6", 0, "#999")
m.face(F((X0g, -Yg, 0), (X1g, -Yg, 0), (X1g, Yg, 0), (X0g, Yg, 0)), "#d4d5ce", 0, "#999"); m.render()
m.box(-90, -84, -195, 195, 15, 515, "galv", edge="#666"); m.render()
# fila de arriba: 3 bases NH con fusible
for i in range(3):
    y0 = -150 + i * 70; m.box(-84, -40, y0, y0 + 50, 380, 490, "#2d3038", edge="#111"); m.box(-40, -20, y0 + 8, y0 + 42, 400, 470, "#d8d0b8", edge="#776")
m.render()
# medidor
m.box(-84, -20, 80, 180, 360, 500, "#f2f2ee", edge="#666"); m.render()
m.face(F((-19, 95, 470), (-19, 165, 470), (-19, 165, 420), (-19, 95, 420)), "#283848", 5, "#111"); m.render()
# riel con diferencial, contactor y termomagnéticas
m.box(-84, -78, -190, 190, 230, 265, "galv", edge="#555"); m.render()
mods = [(-180, 72, "#f4f4f2", "DIF"), (-100, 45, "#e9e9e6", "KM"), (-45, 18, "#f6f6f4", ""), (-25, 18, "#f6f6f4", ""), (-5, 18, "#f6f6f4", ""), (15, 18, "#f6f6f4", ""), (45, 18, "#f6f6f4", ""), (80, 45, "#f2f2f0", "")]
for y0, w, c, t in mods:
    m.box(-78, -20, y0, y0 + w, 200, 295, c, edge="#777")
    m.box(-20, -14, y0 + w * .3, y0 + w * .7, 238, 258, "#2d3038" if t != "DIF" else "#1c4fa0", edge="#111")
m.render()
# borneras de salida abajo
for i in range(10):
    y0 = -170 + i * 22; m.box(-84, -50, y0, y0 + 16, 60, 130, "gris" if i < 6 else ("celeste" if i < 8 else "verde"), edge="#333")
m.render()

h.g3("1", (-20, -80, 440), 1440, 180, "SECCIONADOR NH (3055 · 3004)")
h.g3("2", (-20, 130, 470), 1440, 225, "MEDIDOR (3049, EPEC)")
h.g3("3", (-20, -150, 260), 1440, 270, "DIFERENCIAL 4 × 40 A 300 mA (TT)")
h.g3("4", (-20, -80, 250), 1440, 315, "CONTACTOR KM 25 A")
h.g3("5", (-20, 0, 260), 1440, 360, "TERMOMAGNETICAS POR SALIDA (*)", OR)
h.g3("6", (-50, 0, 95), 1440, 405, "BORNERAS DE SALIDA (*)", OR)
h.rotulo(890, h.H - 150, 750, "MAT-TABLERO-2", "TABLERO DE ALUMBRADO", "ARMADO (TT / TN-S)", "UNIFILAR, CODIGOS, DATOS Y 3D", "S/E", "ESQUEMA")
guardar(h, "mat_tablero_2")
