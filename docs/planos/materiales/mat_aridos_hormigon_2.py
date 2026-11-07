import math, sys, os, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *

h = HojaO()
COD = [8013, 8014, 8015, 8020, 8021, 8019, 8024, 8025]
h.check_codigos(COD)

# ============ A · DOSAJE H-13 EN VOLUMEN
h.titulo(40, 62, "DOSAJE H-13 · 1 : 2,5 : 4 EN VOLUMEN", "PARTES DE CEMENTO, ARENA Y PIEDRA (MEDIDAS CON EL MISMO BALDE O CAJON)")
bx, by, u = 70, 260, 34      # 1 parte = 34 px de alto
for i, (n, t, pat, cod) in enumerate([(1, "CEMENTO", "PLAS", "8008"), (2.5, "ARENA", "SAND", "8003"), (4, "PIEDRA 6–20", "CONC", "8022")]):
    x = bx + i * 130
    h.rect(x, by - n * u, 80, n * u, f"url(#{pat})", K, 1.2)
    for q in range(1, int(math.ceil(n))):
        if q < n: h.ln(x, by - q * u, x + 80, by - q * u, K, .5, h.OCULTA)
    h.txt(x + 40, by + 18, t, 10.5, 700, K, "middle"); h.txt(x + 40, by + 32, cod, 10, 400, K, "middle", MONO)
    h.txt(x + 40, by - n * u - 8, ("1" if n == 1 else str(n).replace(".", ",")) + (" PARTE" if n == 1 else " PARTES"), 11, 700, K, "middle")
h.ln(bx - 10, by, bx + 3 * 130 - 30, by, K, 1.4)
h.bloque(470, 110, "POR m³ DE H-13 (FICHA DE LA APP)", [
    "CEMENTO: 5,2 BOLSAS (260 kg)",
    "ARENA GRUESA: 0,55 m³",
    "PIEDRA 6–20: 0,80 m³",
    "AGUA: 170 LITROS",
    "NO SE AGREGA AGUA DESPUES DE HECHO EL PASTON",
    "SE HORMIGONA EN CAPAS Y SE APISONA CON VARILLA · FRAGÜE 72 h ANTES DE MONTAR LA COLUMNA",
], 360, 10.5)

# ============ B · DONDE VA CADA UNO (cortes chicos)
h.titulo(40, 330, "DONDE VA CADA UNO · CORTES TIPO", "S/E · MEDIDAS DE LOS PLANOS AP-TC (VER CADA PLANO)")
# B1 fundación H-13
x0, y0 = 60, 390
h.rect(x0, y0, 220, 150, "url(#EARTH)", K, .5)
h.rect(x0 + 60, y0, 100, 130, "url(#CONC)", K, 1.3); h.rect(x0 + 96, y0 - 12, 28, 122, "#fff", K, 1)
h.txt(x0 + 110, y0 + 168, "FUNDACION · H-13 (8013)", 10.5, 700, K, "middle"); h.txt(x0 + 110, y0 + 182, "AP-TC-003: 0,60 × 0,60 × 1,20 (7 m)", 9.5, 400, G, "middle")
# B2 cruce de calzada: H-21 200 + hormigón pobre 150 sobre los caños
x0 = 330
h.rect(x0, y0, 220, 150, "url(#EARTH)", K, .5)
h.rect(x0 + 40, y0, 140, 20, "url(#CONC)", K, 1.3); h.rect(x0 + 40, y0 + 20, 140, 90, "url(#ANSI37)", K, .8)
h.rect(x0 + 40, y0 + 110, 140, 30, "url(#CONCP)", K, 1.1)
for cx in (x0 + 85, x0 + 135): h.circ(cx, y0 + 125, 11, "#fff", K, 1)
h.dimV(x0 + 200, y0, y0 + 20, "200", ext=x0 + 180); h.dimV(x0 + 200, y0 + 110, y0 + 140, "150", ext=x0 + 180)
h.txt(x0 + 110, y0 + 168, "CRUCE · H-21 (8014) + POBRE (8015)", 10.5, 700, K, "middle"); h.txt(x0 + 110, y0 + 182, "AP-TC-002 · CRUCE_AP_TC_002", 9.5, 400, G, "middle")
# B3 pegote sobre el cable
x0 = 600
h.rect(x0, y0, 220, 150, "url(#EARTH)", K, .5)
h.rect(x0 + 70, y0 + 40, 80, 100, "url(#ANSI37)", K, .8); h.rect(x0 + 70, y0 + 100, 80, 40, "url(#SAND)", K, .8)
h.rect(x0 + 70, y0 + 92, 80, 10, "url(#CONCP)", K, 1.2); h.circ(x0 + 110, y0 + 120, 8, "#fff", K, 1)
h.flecha_llamada(x0 + 140, y0 + 96, x0 + 175, y0 + 60, "PEGOTE", 10, "start")
h.txt(x0 + 110, y0 + 168, "PEGOTE · H° POBRE (8015)", 10.5, 700, K, "middle"); h.txt(x0 + 110, y0 + 182, "1,00 × 0,20 × 0,05 (AP-TC-001)", 9.5, 400, G, "middle")

# ============ C · TABLAS
cols = [(110, "l", False), (150, "c", False), (190, "l", False), (350, "l", False)]
fil = [["HORMIGON", "RESISTENCIA", "USO", "DATOS"],
       ["H-13 (8013)", "13 MPa (130 kg/cm²)", "FUNDACION DE COLUMNA", "1 : 2,5 : 4 · 5,2 BOLSAS/m³"],
       ["H-21 (8014)", "21 MPa (210 kg/cm²)", "REPOSICION DE CALZADA", "CEMENTO 320 ± 15 kg/m³ · a/c ≤ 0,50 · e = 0,20"],
       ["POBRE (8015)", "—", "PEGOTES DEL TENDIDO", "DOSAJE (*) · e = 0,15 EN EL CRUCE"]]
y = h.tablaM(40, 610, cols, fil, 19, "HORMIGONES")
cols = [(70, "c", True), (250, "l", False), (60, "c", False), (420, "l", False)]
fil = [["COD.", "MORTERO / REVOQUE", "UN.", "DONDE (DATOS DE LA APP)"],
       ["8020", "CEMENTICIO PARA CONTRABASE / TORTA", "Un.", "TORTA DE COLUMNA METALICA · DOSAJE (*)"],
       ["8021", "JUNTA CEMENTICIA REFORZADA 1:3", "m³", "BASE DE TABLERO AP-TC-007: MAMPOSTERIA × 0,25"],
       ["8019", "CALCAREO DE RELLENO", "m³", "RELLENOS · DOSAJE (*)"],
       ["8024", "REVOQUE GRUESO EXTERIOR", "m³", "BASE DE TABLERO: REVOQUE EXT. e = 10"],
       ["8025", "REVOQUE IGNIFUGO + CALCAREO", "m²", "DONDE SE USA (*)"]]
y = h.tablaM(40, y + 30, cols, fil, 19, "MORTEROS Y REVOQUES")
y = h.codigos(40, y + 30, COD, (46, 0, 46), wtot=800, rowh=17, titulo="VARIANTES Y CODIGOS DEL PAÑOL")
h.notasM(40, y + 26, [
    "DATOS: FICHA DE LA APP (PLIEGO LP 21478 Y ETG CORDOBA: H-13 PARA BASES; PLIEGO MALARGÜE: H-21, CIRSOC 201), CRUCE_AP_TC_002 Y TABLERO_NIVEL.",
    "(*) DOSAJE DEL HORMIGON POBRE, DEL MORTERO DE TORTA Y DEL CALCAREO; USO DEL REVOQUE IGNIFUGO: A CONFIRMAR.",
    "(*) H-21: «0,20 m (ESTIMADO)» SEGUN LA APP. LA METALICA LLEVA TORTA; EL PRFV NO (SOLO SELLADO DE BASE).",
], 800, 10.5)

# ============ 3D
h.titulo(890, 62, "VISTA 3D · MUESTRAS DE CADA MATERIAL", "H-13 CON ARIDO GRUESO · H-21 · H° POBRE (BEIGE) · MAMPOSTERIA CON JUNTA 1:3 Y REVOQUE")
# A · H-13 (dado de fundación con el poste)
h.iso(.22, 1040, 270)
h.caja(-600, 0, -600, 0, -600, 0, "#b9bdc2", "concT", "#555", .7)
rnd = random.Random(2)
for _ in range(60):
    x, y = h.P(0, rnd.uniform(-590, -10), rnd.uniform(-590, -10)); r = rnd.uniform(1.2, 2.6)
    h.a(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{r:.1f}" ry="{r*.8:.1f}" fill="#8d9298" stroke="#6b7076" stroke-width=".3"/>')
h.tuboZ(0, 500, -300, -300, 98, 94, "url(#prfv)", "#333")
h.g3b("1", (0, -150, -300), 1180, 190, "H-13 (8013)")
# B · H-21 (losa de calzada)
h.iso(.22, 1300, 190)
h.caja(0, 700, -500, 0, -200, 0, "#b9bdc2", "concT", "#555", .7)
h.caja(0, 700, -500, 0, 0, 12, "#4b4c4e", "asfT", "#333", .5)
h.cota3((700, 0, -200), (700, 0, 0), "200", off=(60, 0, 0), c=NV, sz=9.5)
h.g3b("2", (350, 0, -100), 1500, 330, "H-21 (8014)")
h.txt(1518, 350, "CALZADA · e = 200", 10, 400, G, "start", INT)
# C · pegote de H° pobre sobre el cable
h.iso(.24, 1050, 455)
h.caja(-200, 1100, -100, 300, -80, 0, C_ARENA, "arenaT", "#8a6a2a", .6)
h.cil("x", -200, 1100, 100, 25, 20, C_VAINA, tapa="#3a3d42", borde="#000", bw=.4)
h.caja(0, 1000, 0, 200, 50, 100, "#cfcabf", "concPT", "#7a7466", .7)
h.cota3((0, 200, 100), (1000, 200, 100), "1000", off=(0, 80, 0), c=NV, sz=9.5)
h.g3b("3", (1000, 100, 75), 1150, 400, "H° POBRE (8015)")
h.txt(1168, 420, "PEGOTE 1,00 × 0,20 × 0,05", 10, 400, G, "start", INT)
# D · mampostería con junta 1:3 y revoque
h.iso(.34, 1420, 500)
LX0, LY0 = 0, 0
for fila in range(4):
    z0 = fila * 75; off = 0 if fila % 2 == 0 else 130
    h.caja(LX0, LX0 + 520, LY0, LY0 + 120, z0, z0 + 25, "#a9a59c", "morT", "#666", .5)
    for xx in [LX0 - off + 260 * q for q in range(0, 4)]:
        a, b = max(LX0, xx), min(LX0 + 520, xx + 250)
        if b - a > 20: h.caja(a, b, LY0, LY0 + 120, z0 + 25, z0 + 75, C_LAD, "ladT", "#7a3418", .5)
h.caja(LX0, LX0 + 250, LY0 + 120, LY0 + 130, 0, 300, "#bdb8ad", "morT", "#666", .6)
h.g3b("4", (LX0 + 520, LY0 + 60, 112), 1530, 420, "JUNTA 1:3 (8021)")
h.g3b("5", (LX0 + 120, LY0 + 130, 150), 1530, 630, "REVOQUE (8024)")
h.txt(900, 684, "Muestras sin escala entre sí. Ladrillo: MAT-MAMPOSTERIA-1.", 10.5, 400, G, "start", INT)

h.bloque(890, 712, "DATOS TECNICOS", [
    "H-13: 13 MPa · 1 : 2,5 : 4 · 5,2 BOLSAS/m³",
    "H-21: 21 MPa · 320 ± 15 kg DE CEMENTO/m³ · a/c ≤ 0,50",
    "H° POBRE: PEGOTES Y CAPA SOBRE LOS CAÑOS DEL CRUCE",
    "JUNTA 1:3 (CEMENTO : ARENA) EN LA BASE DE TABLERO",
], 370)
h.bloque(1270, 712, "DONDE SE USA", [
    "AP-TC-003 / AP-TC-005-006: FUNDACIONES (H-13)",
    "AP-TC-002: CRUCE (H-21 + POBRE)",
    "AP-TC-001: PEGOTES DE LA ZANJA",
    "AP-TC-007: BASE DE TABLERO (JUNTA Y REVOQUE)",
], 370)
h.rotuloM("MAT-ARIDOS_HORMIGON-2", "HORMIGONES, MORTEROS", "Y REVOQUES", "DOSAJE, CORTES TIPO, TABLAS Y VISTA 3D", "S/E", "")
guardar(h, "mat_aridos_hormigon_2")
