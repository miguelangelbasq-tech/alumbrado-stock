import math, sys, os, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *

h = HojaO()
COD = [8008, 8006, 8003, 8022]
h.check_codigos(COD)

# ============ A · BOLSAS
h.titulo(40, 62, "BOLSAS · FRENTE Y CANTO", "S/E · MEDIDAS DE LA BOLSA (*) · MANDA EL PESO")
def bolsa2d(x, y, w, hh, fill, t1, t2, t3, prof=40):
    h.path(f"M{x+6},{y} H{x+w-6} Q{x+w},{y} {x+w},{y+8} V{y+hh-8} Q{x+w},{y+hh} {x+w-6},{y+hh} H{x+6} Q{x},{y+hh} {x},{y+hh-8} V{y+8} Q{x},{y} {x+6},{y} Z", fill, K, 1.2)
    h.rect(x + w * .08, y + hh * .2, w * .7, hh * .62, "#fff", K, .6)
    h.txt(x + w * .43, y + hh * .2 + 22, t1, 11.5, 700, K, "middle"); h.txt(x + w * .43, y + hh * .2 + 40, t2, 10.5, 400, K, "middle")
    h.txt(x + w * .43, y + hh * .2 + 62, t3, 16, 700, K, "middle")
    h.rect(x + w * .8, y + 10, w * .14, 18, "#fff", K, .6); h.txt(x + w * .87, y + 46, "VALVULA", 8.5, 400, G, "middle")
    # canto
    cx = x + w + 30
    h.path(f"M{cx},{y+4} H{cx+prof} V{y+hh-4} H{cx} Z", fill, K, 1.1)
    h.ln(cx + prof / 2, y + 4, cx + prof / 2, y + hh - 4, K, .4, h.OCULTA)
    h.dimH(y + hh + 22, x, x + w, "LARGO (*)", ext=y + hh, c=OR); h.dimV(x - 14, y, y + hh, "ALTO (*)", ext=x, c=OR)
    h.dimH(y + hh + 22, cx, cx + prof, "(*)", ext=y + hh, c=OR)
bolsa2d(60, 110, 220, 150, "url(#PLAS)", "CEMENTO PORTLAND", "CPN 40 / 50", "50 kg")
bolsa2d(430, 110, 200, 140, "#fff", "CAL HIDRATADA", "", "kg (*)", 36)
h.txt(60, 316, "8008 · CEMENTO CPN 40/50 · bolsa 50kg", 11, 700, K); h.txt(430, 316, "8006 · CAL HIDRATADA · bolsa (peso (*))", 11, 700, K)
h.globo("1", 120, 140, 96, 96); h.globo("2", 480, 140, 456, 96)

# ============ B · GRANULOMETRIA
h.titulo(40, 372, "GRANULOMETRIA · TAMAÑO DE LOS GRANOS", "AMPLIADO (REGLA EN mm) · PIEDRA PARTIDA 6–20 mm (CATALOGO) · ARENA: RANGO (*)")
sk = 9.0; x0, yb = 70, 585
h.ln(x0, yb, x0 + 25 * sk, yb, K, 1)
for mm in range(0, 26):
    xx = x0 + mm * sk
    h.ln(xx, yb, xx, yb + (8 if mm % 5 == 0 else 4), K, .8)
    if mm % 5 == 0: h.txt(xx, yb + 22, f"{mm}", 10.5, 700, K, "middle", MONO)
h.txt(x0 + 25 * sk + 10, yb + 22, "mm", 10.5, 700, K)
def grano(xc, yc, d, fill, rnd, n=7):
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n + rnd.uniform(-.25, .25); r = d / 2 * rnd.uniform(.82, 1.0)
        pts.append((xc + r * math.cos(a), yc + r * math.sin(a) * .8))
    h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z", fill, K, .9)
rnd = random.Random(4)
for i in range(14):
    d = rnd.uniform(.6, 3.5) * sk
    grano(x0 + 4 + (i % 7) * 6, yb - 8 - (i // 7) * 14 - d / 3, d, "url(#SAND)", rnd, 6)
h.txt(x0 + 22, yb - 52, "ARENA", 10, 700, K, "middle")
for d, xx in ((6, 9), (10, 14.5), (15, 21), (20, 29)):
    grano(x0 + xx * sk, yb - d * sk * .4 - 6, d * sk, "url(#CONC)", rnd, 8)
    h.txt(x0 + xx * sk, yb - d * sk * .8 - 14, f"{d} mm", 9.5, 400, G, "middle")
h.dimH(yb + 46, x0 + 6 * sk, x0 + 20 * sk, "PIEDRA 6 A 20 mm", ext=yb + 8)
h.dimH(yb + 46, x0, x0 + 5 * sk, "ARENA (*)", ext=yb + 8, c=OR)
h.bloque(460, 410, "COMO SE RECONOCEN", [
    "PIEDRA PARTIDA: GRANOS ANGULOSOS, GRIS, SIN POLVO NI TIERRA",
    "ARENA: LIMPIA, SIN BARRO NI RAICES; LA DE LA CAMA DEL CABLE, SIN PIEDRAS",
    "CEMENTO: POLVO GRIS SUELTO; SI TIENE TERRONES DUROS, NO SE USA",
    "CAL: POLVO BLANCO, SE GUARDA SECA",
], 380, 10.5)
# ============ C · COMPUTO
cols = [(170, "l", False), (110, "c", True), (130, "c", True), (130, "c", True), (260, "l", False)]
fil = [["MATERIAL", "POR m³ H-13", "FUND. PRFV 7 m", "FUND. PRFV 10 m", "DE DONDE SALE"],
       ["CEMENTO (8008)", "5,2 bolsas", "2,1 bolsas", "3,8 bolsas", "DOSAJE 1 : 2,5 : 4 (APP)"],
       ["ARENA GRUESA (8003)", "0,55 m³", "0,22 m³", "0,40 m³", "VOL. × 0,55"],
       ["PIEDRA 6–20 (8022)", "0,80 m³", "0,32 m³", "0,58 m³", "VOL. × 0,80"],
       ["AGUA", "170 L", "69 L", "124 L", "VOL. × 170"],
       ["VOLUMEN", "1 m³", "0,403 m³ (*)", "0,728 m³ (*)", "CALCULADORA / AP-TC-003"]]
y = h.tablaM(40, 640, cols, fil, 19, "CUANTO VA · HORMIGON H-13 (FUNDACIONES)")
cols2 = [(270, "l", False), (150, "c", True), (380, "l", False)]
fil2 = [["CAMA Y CUBRIMIENTO DEL CABLE", "POR METRO", "CALCULO"],
        ["ARENA (8003) · ZANJA AP-TC-001", "0,030 m³", "ANCHO 0,20 × (50 + CABLE + 50 ≈ 0,15)"]]
y = h.tablaM(40, y + 26, cols2, fil2, 19, "ARENA EN LA ZANJA")
y = h.codigos(40, y + 30, COD, (46, 0, 70), wtot=800, rowh=19, titulo="VARIANTES Y CODIGOS DEL PAÑOL")
h.notasM(40, y + 30, [
    "DOSAJE Y CANTIDADES: FICHA DE LA APP (H-13 1 : 2,5 : 4 · 5,2 BOLSAS, 0,55 m³ ARENA, 0,80 m³ PIEDRA, 170 L DE AGUA POR m³) Y CLAUDE.md §11.3.",
    "(*) VOLUMEN DE LA FUNDACION: EL CODIGO USA 0,403 / 0,728 m³; ANTES SE ANOTO 0,4057 / 0,8035. A CONFIRMAR CUAL VALE.",
    "(*) PESO DE LA BOLSA DE CAL, MEDIDAS DE LAS BOLSAS Y RANGO DE LA ARENA: A CONFIRMAR CON EL PROVEEDOR.",
    "AP-TC-003 PIDE «ARENA FINA SECA» ALREDEDOR DEL POSTE; EL H-13 LLEVA ARENA GRUESA. EN EL PAÑOL HAY UN SOLO CODIGO (8003).",
], 800, 10.5)

# ============ 3D
h.titulo(890, 62, "VISTA 3D · COMO SE VEN EN EL PAÑOL Y EN LA OBRA", "BOLSA DE PAPEL KRAFT · CAL EN BOLSA BLANCA · MONTONES DE ARENA Y PIEDRA")
h.iso(.34, 1190, 400)
# montones (atrás)
h.monton(-800, -250, 260, 280, "arenaT", C_ARENA, (90, (1, 2), ["#d9b867", "#c9a654", "#efdca4"]), 3)
h.monton(-100, -750, 250, 240, "piedraT", C_PIEDRA, (160, (2.5, 5.5), ["#b4b9bf", "#9ea3aa", "#c6cace", "#8b9096"]), 5)
# pallet de bolsas de cemento
h.caja(-120, 620, -120, 360, -60, 0, "#a77845", "maderaT", "#5a3d1e", .6)
for i, (bx, by, bz) in enumerate([(-100, -100, 0), (260, -100, 0), (-100, 130, 0), (260, 130, 0), (-60, -80, 130), (300, -80, 130)]):
    h.bolsa(bx, by, bz, 330, 200, 125, C_CEM, [("CEMENTO", 8.5, 800, NV), ("CPN 40 · 50 kg", 7.5, 700, "#333")])
# bolsas de cal (adelante a la derecha)
for i, (bx, by, bz) in enumerate([(700, 300, -60), (700, 300, 50)]):
    h.bolsa(bx, by, bz, 300, 190, 110, "#f1f0ea", [("CAL", 9, 800, "#1d6b3a"), ("HIDRATADA", 7.5, 700, "#333")], pat="calT")
h.g3b("1", (60, 330, 60), 1440, 420, "CEMENTO CPN 40 (8008)")
h.g3b("2", (850, 570, 20), 1440, 540, "CAL HIDRATADA (8006)")
h.g3b("3", (-800, -250, 230), 1440, 130, "ARENA (8003)")
h.g3b("4", (-100, -750, 200), 1440, 190, "PIEDRA PARTIDA 6–20 (8022)")
h.txt(900, 640, "Pallet y cantidad de bolsas: ilustrativo.", 10.5, 400, G, "start", INT)

h.bloque(890, 690, "DATOS TECNICOS", [
    "CEMENTO PORTLAND NORMAL CPN 40 / 50 · BOLSA DE 50 kg",
    "CAL HIDRATADA EN BOLSA (PESO (*))",
    "PIEDRA PARTIDA 6–20 mm · ARENA PARA CAMA Y HORMIGON",
    "GUARDAR EL CEMENTO Y LA CAL SOBRE PALLET, LEJOS DE LA HUMEDAD",
], 370)
h.bloque(1270, 690, "DONDE SE USA", [
    "FUNDACIONES H-13 (AP-TC-003 PRFV, COLUMNA METALICA)",
    "CAMA Y CUBRIMIENTO DEL CABLE (AP-TC-001)",
    "MORTEROS Y REVOQUES DE LA BASE DE TABLERO (AP-TC-007)",
    "GUIA «FUNDACION PRFV» · VER MAT-ARIDOS_HORMIGON-2",
], 370)
h.rotuloM("MAT-ARIDOS_HORMIGON-1", "CEMENTO, CAL, ARENA", "Y PIEDRA PARTIDA", "BOLSAS, GRANULOMETRIA, COMPUTO Y VISTA 3D", "S/E", "GRANOS AMPLIADOS")
guardar(h, "mat_aridos_hormigon_1")
