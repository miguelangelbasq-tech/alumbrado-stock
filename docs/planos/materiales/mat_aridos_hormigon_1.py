"""MAT-ARIDOS_HORMIGON-1 (rev. B) · Cemento CPN 40 (8008), cal hidratada (8006), arena (8003) y piedra partida 6–20 (8022).
Plano y 3D con las mismas medidas (perfiles_civil.json: BOLSA, ARIDO, H13). 3D: r3d/out/civil_aridos.png y civil_granos.png.
Fuentes: ficha de la app (H-13 1 : 2,5 : 4 · 5,2 bolsas, 0,55 m³ arena, 0,80 m³ piedra, 170 L agua por m³), CLAUDE.md §11.3,
Easy / El Cronista (bolsa de 25 kg), IRAM 50000, serie de tamices IRAM. Ver r3d/FUENTES_civil.md. Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

BO = PC["BOLSA"]; AR = PC["ARIDO"]; H = PC["H13"]
h = nuevaC()

# =============== 1. BOLSAS · FRENTE Y CANTO ===============
h.titulo(40, 62, "BOLSAS · VISTA DE ARRIBA Y CANTO", "ESC. 1:12,5 · MANDA EL PESO; LAS MEDIDAS DE LA BOLSA SON DE REFERENCIA")
k = .32
def bolsa2d(x, y, b, l1, l2, l3, col_or=False):
    L, A, Hh = b["L"] * k, b["A"] * k, b["H"] * k
    h.path(f"M{x + 8},{y} H{x + L - 8} Q{x + L},{y} {x + L},{y + 8} V{y + A - 8} Q{x + L},{y + A} {x + L - 8},{y + A} H{x + 8} Q{x},{y + A} {x},{y + A - 8} V{y + 8} Q{x},{y} {x + 8},{y} Z", "#fff", K, 1.2)
    for t in (y + 10, y + A - 10): h.path(f"M{x + 4},{t} q{L / 4},3 {L / 2},0 t{L / 2 - 8},0", "none", K, .4, h.OCULTA)
    h.rect(x + L * .14, y + A * .22, L * .62, A * .56, "none", K, .6)
    h.txt(x + L * .45, y + A * .40, l1, 9, 700, K, "middle"); h.txt(x + L * .45, y + A * .52, l2, 8.5, 400, K, "middle"); h.txt(x + L * .45, y + A * .70, l3, 12, 700, K, "middle")
    h.rect(x + L * .82, y + A * .08, L * .12, A * .12, "none", K, .6); h.txt(x + L * .88, y + A * .08 - 3, "VALVULA", 7.5, 400, G, "middle")
    # canto (abajo)
    yc = y + A + 18
    h.path(f"M{x + 6},{yc + Hh / 2} Q{x},{yc} {x + 14},{yc} H{x + L - 14} Q{x + L},{yc} {x + L - 6},{yc + Hh / 2} Q{x + L},{yc + Hh} {x + L - 14},{yc + Hh} H{x + 14} Q{x},{yc + Hh} {x + 6},{yc + Hh / 2} Z", "#fff", K, 1.0)
    c = OR if col_or else K
    h.dimH(yc + Hh + 16, x, x + L, f"{b['L']}" + (" (*)" if col_or else ""), ext=yc + Hh, c=c)
    h.dimV(x + L + 14, y, y + A, f"{b['A']}" + (" (*)" if col_or else ""), ext=x + L, c=c)
    h.dimV(x + L + 14, yc, yc + Hh, f"{b['H']}" + (" (*)" if col_or else ""), ext=x + L, c=c)
bolsa2d(50, 100, BO["c50"], "CEMENTO PORTLAND NORMAL", "CPN 40 · IRAM 50000", "50 kg", True)
h.txt(50, 412, "8008 · BOLSA DE 50 kg (COMO LA PIDE EL PAÑOL)", 9.5, 700)
bolsa2d(345, 100, BO["c25"], "CEMENTO / CAL", "BOLSA DE 25 kg", "25 kg")
h.txt(345, 412, "BOLSA DE 25 kg (LA QUE SE VENDE HOY) · 8006 CAL (*)", 9.5, 700, OR)

# =============== 2. GRANOS A TAMAÑO REAL ===============
subt(h, 560, 62, "GRANOS · ESC. 1:1", "PIEDRA PARTIDA 6, 13 Y 20 mm · ARENA HASTA 4,75")
kg = 1680 / 420          # px de hoja por mm a escala 1:1 (hoja A3)
import random
rnd = random.Random(4)
def piedra(cx, cy, d):
    n = 7; a0 = rnd.random()
    pts = " ".join(f"{cx + d / 2 * kg * (.8 + .25 * rnd.random()) * math.cos(a0 + 6.283 * i / n):.1f},{cy + d / 2 * kg * (.62 + .25 * rnd.random()) * math.sin(a0 + 6.283 * i / n):.1f}" for i in range(n))
    h.a(f'<polygon points="{pts}" fill="url(#CONC)" stroke="{K}" stroke-width="1"/>')
for d, cx in ((6, 590), (13, 650), (20, 740)):
    piedra(cx, 140, d); h.txt(cx + d * kg / 2 + 8, 144, f"{d}", 10, 700, K, "start")
piedras2d(h, 580, 205, 220, 46, 260, .6, 4.75 * kg * .55, semilla=9, fill="#fff", sw=.35)
h.rect(580, 205, 220, 46, "none", K, .6); h.txt(690, 266, "ARENA (0,075 A 4,75)", 9.5, 700, K, "middle")
for i in range(0, 56, 5):
    xx = 580 + i * kg; h.ln(xx, 278, xx, 278 + (8 if i % 10 == 0 else 5), K, .6)
    if i % 10 == 0: h.txt(xx, 296, str(i), 8, 400, K, "middle")
h.ln(580, 278, 580 + 55 * kg, 278, K, .8); h.txt(800, 296, "mm", 8, 400, G)

# =============== 3. GRANULOMETRIA ===============
subt(h, 40, 440, "GRANULOMETRIA · % QUE PASA POR CADA TAMIZ", "CURVAS ILUSTRATIVAS (*): EL PLIEGO NO DA EL HUSO · TAMICES DE LA SERIE IRAM")
gx0, gy0, gw, gh = 90, 485, 560, 170
tam = [0.075, 0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 9.5, 12.5, 19, 25]
lmin, lmax = math.log10(0.06), math.log10(30)
def GX(d): return gx0 + (math.log10(d) - lmin) / (lmax - lmin) * gw
def GY(p): return gy0 + gh - p / 100 * gh
h.rect(gx0, gy0, gw, gh, "none", K, .8)
for p in range(0, 101, 20): h.ln(gx0, GY(p), gx0 + gw, GY(p), K, .25, 'stroke-dasharray="2 3"'); h.txt(gx0 - 6, GY(p) + 3, str(p), 8.5, 400, K, "end")
for d in tam:
    h.ln(GX(d), gy0, GX(d), gy0 + gh, K, .25, 'stroke-dasharray="2 3"'); h.txt(GX(d), gy0 + gh + 13, str(d).replace(".", ","), 8, 400, K, "middle", MONO)
h.txt(gx0 + gw / 2, gy0 + gh + 28, "ABERTURA DEL TAMIZ (mm, ESCALA LOG)", 9, 400, G, "middle"); h.txt(gx0 - 30, gy0 + gh / 2, "% QUE PASA", 9, 400, G, "middle", CAD, -90)
are = [(0.075, 2), (0.15, 8), (0.3, 25), (0.6, 50), (1.18, 70), (2.36, 85), (4.75, 97), (9.5, 100)]
pie = [(4.75, 2), (6, 6), (9.5, 30), (12.5, 55), (19, 92), (25, 100)]
h.path("M" + " L".join(f"{GX(d):.1f},{GY(p):.1f}" for d, p in are), "none", OR, 1.8)
h.path("M" + " L".join(f"{GX(d):.1f},{GY(p):.1f}" for d, p in pie), "none", OR, 1.8, 'stroke-dasharray="7 3"')
h.txt(GX(0.6) + 6, GY(50) - 6, "ARENA (*)", 9.5, 700, OR); h.txt(GX(12.5) + 6, GY(55) + 14, "PIEDRA 6-20 (*)", 9.5, 700, OR)
h.rect(GX(6), gy0, GX(20) - GX(6), gh, "#9993", "none", 0); h.txt((GX(6) + GX(20)) / 2, gy0 + 14, "6 A 20 (PAÑOL)", 8.5, 700, K, "middle")
h.txt(gx0 + gw + 10, gy0 + 20, "TAMIZ 4,75: SEPARA", 9, 400, K); h.txt(gx0 + gw + 10, gy0 + 33, "ARENA DE PIEDRA", 9, 400, K)

# =============== 4. COMPUTO ===============
cols = [(250, "l", False), (110, "c", True), (110, "c", True), (110, "c", True), (110, "c", True), (110, "c", True)]
def r2(x): return f"{x:.2f}".replace(".", ",")
fil = [["H-13 1 : 2,5 : 4", "VOLUMEN", "CEMENTO 50 kg", "(EN 25 kg)", "ARENA", "PIEDRA"],
       ["POR m³ (FICHA DE LA APP)", "1 m³", "5,2 bolsas", "10,4 bolsas", "0,55 m³", "0,80 m³"]]
for t, v in (("FUNDACION PRFV 7 m (*)", .403), ("FUNDACION PRFV 10 m (*)", .728)):
    fil.append([t, r2(v) + " m³", r2(H["bolsas"] * v), r2(2 * H["bolsas"] * v), r2(H["arena"] * v) + " m³", r2(H["piedra"] * v) + " m³"])
yt = tablaG(h, 40, 718, cols, fil, rowh=15, titulo="COMPUTO · AGUA: 170 L POR m³")
EX = {8008: "50 kg (25 kg HOY)", 8006: "PESO (*)", 8003: "0,075–4,75", 8022: "6–20"}
yt = tablaCod(h, 40, yt + 22, [8008, 8006, 8003, 8022], EX, w=800, rowh=15, tit_extra="MEDIDA", wext=150)
notasW(h, 40, yt + 22, [
    "DOSAJE Y CANTIDADES: FICHA DE LA APP Y CLAUDE.md §11.3. CEMENTO PORTLAND NORMAL CPN 40: IRAM 50000.",
    "(*) LA INDUSTRIA PASO A BOLSA DE 25 kg (EASY: 46 × 41 × 11,5 cm; EL CRONISTA). EL PAÑOL Y LA CALCULADORA CUENTAN BOLSAS DE 50 kg: SI SE COMPRA DE 25, SON EL DOBLE.",
    "(*) VOLUMEN DE LA FUNDACION: EL CODIGO USA 0,403 / 0,728 m³; ANTES SE ANOTO 0,4057 / 0,8035. A CONFIRMAR CUAL VALE.",
    "(*) PESO DE LA BOLSA DE CAL (25 kg EN EL MERCADO), CURVAS DE GRANULOMETRIA: A CONFIRMAR. AP-TC-003 PIDE «ARENA FINA SECA»; EL H-13 LLEVA ARENA GRUESA: HAY UN SOLO CODIGO (8003).",
    "FUENTES: r3d/FUENTES_civil.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - BOLSAS Y MONTONES", "CEMENTO (BOLSA DE PAPEL) · CAL · ARENA · PIEDRA PARTIDA 6-20 CON SUS GRANOS")
A = img3d(h, "civil_aridos", 884, 88, 600)
columna(h, A, [("cal", "1", "CAL HIDRATADA 8006"), ("piedra", "2", "PIEDRA PARTIDA 8022"), ("leyenda", "3", "IMPRESO DE LA BOLSA"), ("cemento", "4", "CEMENTO 8008"),
               ("arena", "5", "ARENA 8003"), ("valvula", "6", "VALVULA")], 1500, 120, 440, paso=27)
h.txt(890, 480, "GRANOS SOBRE UNA REGLA (A TAMAÑO REAL EN EL RENDER)", 11, 700, NV, "start", INT)
A2 = img3d(h, "civil_granos", 884, 488, 560)
globo3d(h, A2("arena"), "", 1470, 560, "ARENA HASTA 4,75"); globo3d(h, A2("piedra"), "", 1470, 520, "PIEDRA 6 A 20"); globo3d(h, A2("regla"), "", 1470, 760, "REGLA EN cm")
bloque(h, 890, 830, "DATOS TECNICOS", [
    "CEMENTO PORTLAND NORMAL CPN 40 (IRAM 50000)",
    "CAL HIDRATADA EN BOLSA (PESO (*))",
    "GUARDAR SOBRE PALLET, LEJOS DE LA HUMEDAD; CEMENTO CON TERRONES DUROS NO SE USA"], w=360, sz=10, lh=13.5)
bloque(h, 1270, 830, "DONDE SE USA", [
    "FUNDACIONES H-13 (AP-TC-003 PRFV, COLUMNA METALICA)",
    "CAMA Y CUBRIMIENTO DEL CABLE (AP-TC-001)",
    "MORTEROS Y REVOQUES DE LA BASE DE TABLERO (AP-TC-007) · VER MAT-ARIDOS_HORMIGON-2"], w=360, sz=10, lh=13.5)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_aridos.mjs, civil_granos.mjs): LOS GRANOS Y PIEDRAS SON GEOMETRIA REAL. FUENTES: r3d/FUENTES_civil.md")
rotuloMat(h, "MAT-ARIDOS_HORMIGON-1", "CEMENTO, CAL, ARENA", "Y PIEDRA PARTIDA", "BOLSAS, GRANOS, GRANULOMETRIA, COMPUTO Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha=FECHA)
guardarC(h, "mat_aridos_hormigon_1")
