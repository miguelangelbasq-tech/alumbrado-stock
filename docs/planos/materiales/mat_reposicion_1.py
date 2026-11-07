import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_obra import *

h = HojaO()
COD = [8004, 8007]
h.check_codigos(COD)

# ============ A · CORTE VEREDA
h.titulo(40, 62, "CORTE A-A · REPOSICION DE VEREDA", "S/E · BALDOSA IGUAL A LA EXISTENTE · REPONER EN 48 h")
k = 1.0; x0, x1, y0 = 70, 520, 130
EB = 25   # espesor baldosa (*)
h.rect(x0, y0, x1 - x0, EB * .7, "url(#ASPH)", K, 1.2)
for q in range(0, int((x1 - x0) / 64) + 1): h.ln(x0 + q * 64, y0, x0 + q * 64, y0 + EB * .7, K, 1)
yb = y0 + EB * .7
h.rect(x0, yb, x1 - x0, 20 * k, "url(#CONCP)", K, 1)
yc = yb + 20 * k
h.rect(x0, yc, x1 - x0, 80 * k, "url(#CONC)", K, 1.2)
yr = yc + 80 * k
h.rect(x0, yr, x1 - x0, 150 * k * .8, "url(#ANSI37)", K, .8)
h.ln(x0, yr + 150 * k * .4, x1, yr + 150 * k * .4, K, .5, h.OCULTA)
h.dimV(x1 + 70, y0, yb, "e (*)", ext=x1, c=OR)
h.dimV(x1 + 20, yb, yc, "20", ext=x1)
h.dimV(x1 + 20, yc, yr, "80", ext=x1)
h.dimV(x1 + 46, yr, yr + 150 * k * .4, "150", ext=x1)
h.nivel(x0 + 10, y0, "±0,00 VEREDA")
for n, (ax, ay, t) in enumerate([(x0 + 100, y0 + 8, "BALDOSA (8004)"), (x0 + 220, yb + 16, "MORTERO DE ASIENTO 20"), (x0 + 330, yc + 60, "CONTRAPISO DE H° POBRE 80"),
                                  (x0 + 420, yr + 50, "RELLENO COMPACTADO EN CAPAS DE 150")]):
    h.globo(str(n + 1), ax, ay, 640, 130 + n * 50)
    h.txt(656, 134 + n * 50, t.split(" ")[0], 10, 700, K)
    h.txt(656, 148 + n * 50, " ".join(t.split(" ")[1:]), 9.5, 400, G)

# ============ B · CORTE CALZADA
h.titulo(40, 400, "CORTE B-B · REPOSICION DE CALZADA", "S/E · HORMIGON H-21 DE 0,20 (ESTIMADO) O CARPETA ASFALTICA SEGUN EL PAVIMENTO")
k2 = .6; cx0, cx1, cy = 70, 360, 450
h.rect(cx0, cy, cx1 - cx0, 200 * k2, "url(#CONC)", K, 1.3)
h.rect(cx0, cy + 200 * k2, cx1 - cx0, 50, "url(#ANSI37)", K, .8)
h.dimV(cx1 + 18, cy, cy + 200 * k2, "200", ext=cx1)
h.txt((cx0 + cx1) / 2, cy + 200 * k2 + 70, "CALLE DE HORMIGON: H-21 (8014)", 10.5, 700, K, "middle")
ax0, ax1 = 470, 780
h.rect(ax0, cy, ax1 - ax0, 50 * k2, "url(#ASPH)", K, 1.3)
h.rect(ax0, cy + 50 * k2, ax1 - ax0, 150 * k2, "url(#CONCP)", K, 1)
h.rect(ax0, cy + 200 * k2, ax1 - ax0, 50, "url(#ANSI37)", K, .8)
h.dimV(ax1 + 18, cy, cy + 50 * k2, "e (*)", ext=ax1, c=OR); h.dimV(ax1 + 18, cy + 50 * k2, cy + 200 * k2, "BASE (*)", ext=ax1, c=OR)
h.txt((ax0 + ax1) / 2, cy + 200 * k2 + 70, "CALLE DE ASFALTO: CARPETA (8007)", 10.5, 700, K, "middle")
h.txt((ax0 + ax1) / 2, cy + 200 * k2 + 86, "ESPESOR Y BASE SEGUN EL PAVIMENTO (*)", 9.5, 400, OR, "middle")

# ============ C · CÓMPUTO
cols = [(260, "l", False), (160, "c", True), (380, "l", False)]
fil = [["COMPUTO (POR METRO DE ZANJA)", "CANTIDAD", "CALCULO"],
       ["BALDOSA (8004) · ZANJA DE 1 CONDUCTOR", "0,20 m² (*)", "ANCHO 0,20 (AP-TC-001) × 1 m · + SOBREANCHO (*)"],
       ["BALDOSA (8004) · 2 / 3 CONDUCTORES", "0,40 / 0,60 m² (*)", "ANCHO 0,40 / 0,60 × 1 m"],
       ["CARPETA ASFALTICA (8007) · CRUCE", "0,50 m² (*)", "ANCHO DEL CRUCE 0,50 (CRUCE_AP_TC_002) × 1 m"],
       ["H-21 (8014) · CRUCE EN CALLE DE H°", "0,100 m³", "0,50 × 0,20 (AP-TC-002)"]]
y = h.tablaM(40, 700, cols, fil, 19, "COMPUTO")
y = h.codigos(40, y + 30, COD, (46, 0, 40), wtot=800, rowh=20, titulo="VARIANTES Y CODIGOS DEL PAÑOL", extra_col=("SE MIDE", {8004: "m² de vereda", 8007: "m² de calzada"}, 140))
h.notasM(40, y + 24, [
    "DATOS: FICHA DE LA APP (PLIEGO LP 21478: CONTRAPISO 8 cm + MORTERO 2 cm + BALDOSA IGUAL, EN 48 h; RELLENO EN CAPAS DE 15 cm; CALZADA H-21 0,20 (ESTIMADO) O CARPETA).",
    "(*) TIPO Y ESPESOR DE BALDOSA, ESPESOR DE LA CARPETA Y SU BASE, SOBREANCHO DE REPOSICION: SEGUN LA VEREDA / CALLE EXISTENTE (A CONFIRMAR).",
], 800, 10.5)

# ============ 3D
h.titulo(890, 62, "VISTA 3D EN CORTE ESCALONADO · VEREDA Y CALZADA", "BALDOSA · MORTERO · CONTRAPISO · RELLENO / CARPETA ASFALTICA SOBRE SU BASE")
h.iso(.4, 1150, 230)
Lx, Ly = 600, 500
h.caja(0, Lx, 0, Ly, -380, -110, "#c9a77c", "soilT", "#6b5030", .6)
h.caja(0, Lx - 60, 0, Ly - 60, -110, -30, "#cfcabf", "concPT", "#7a7466", .6)
h.caja(0, Lx - 120, 0, Ly - 120, -30, -10, "#a9a59c", "morT", "#666", .6)
T = 120
for i in range(int((Lx - 180) / T) + 1):
    for j in range(int((Ly - 180) / T) + 1):
        a, b = i * T, j * T
        if a < Lx - 180 and b < Ly - 180:
            h.caja(a + 2, min(a + T - 2, Lx - 180), b + 2, min(b + T - 2, Ly - 180), -10, 15, "#cfc6b4", "baldT", "#8a8270", .5)
h.g3b("1", (200, 200, 15), 1480, 120, "BALDOSA (8004)")
h.g3b("2", (Lx - 120, 200, -20), 1480, 170, "MORTERO 20")
h.g3b("3", (Lx - 60, 250, -70), 1480, 220, "CONTRAPISO 80")
h.g3b("4", (Lx, 300, -250), 1480, 270, "RELLENO COMPACTADO")
# calzada asfáltica
h.iso(.26, 1420, 470)
h.caja(0, 600, 0, 400, -320, -200, "#c9a77c", "soilT", "#6b5030", .6)
h.caja(0, 560, 0, 360, -200, -50, "#cfcabf", "concPT", "#7a7466", .6)
h.caja(0, 520, 0, 320, -50, 0, "#3f4042", "asfT", "#222", .6)
h.F3([(240, 0, 0.5), (270, 0, .5), (270, 320, .5), (240, 320, .5)], "#f2f2f2", "none", 0)
h.g3b("5", (150, 250, 0), 1180, 620, "CARPETA ASFALTICA (8007)")
h.g3b("6", (560, 200, -120), 1520, 640, "BASE (*)")

h.bloque(890, 740, "DATOS TECNICOS", [
    "VEREDA: CONTRAPISO 8 cm + MORTERO 2 cm + BALDOSA IGUAL A LA EXISTENTE",
    "SE REPONE EN 48 h",
    "CALZADA: H-21 DE 0,20 (ESTIMADO) O CARPETA ASFALTICA",
    "RELLENO COMPACTADO EN CAPAS DE 15 cm",
], 370)
h.bloque(1270, 740, "DONDE SE USA", [
    "AP-TC-001: ZANJA BAJO VEREDA CON BALDOSA (ZANJEO, ITEMS 15–20)",
    "AP-TC-002: CRUCE DE CALZADA (H-21 O ASFALTO)",
    "GUIA «ZANJEO Y TENDIDO»",
], 370)
h.rotuloM("MAT-REPOSICION-1", "REPOSICION DE VEREDA", "Y CALZADA", "CORTES, COMPUTO Y VISTA 3D ESCALONADA", "S/E", "")
guardar(h, "mat_reposicion_1")
