"""MAT-REPOSICION-1 (rev. B) · Baldosa de vereda para reposición (8004) y carpeta asfáltica (8007).
Plano y 3D con las mismas medidas (perfiles_civil.json: VER, CALZ). 3D: r3d/out/civil_vereda.png.
Fuentes: ficha de la app (pliego LP 21478: contrapiso 8 cm + mortero 2 cm + baldosa igual a la existente, en 48 h; relleno en capas de 15 cm;
calzada H-21 0,20 (estimado) o carpeta), AP-TC-001 / AP-TC-002. Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

V = PC["VER"]; C = PC["CALZ"]
h = nuevaC()

# =============== 1. CORTE A-A · VEREDA ===============
h.titulo(40, 62, "CORTE A-A · REPOSICION DE VEREDA SOBRE LA ZANJA", "ESC. 1:7,5 · BALDOSA IGUAL A LA EXISTENTE · SE REPONE EN 48 h")
k = .52; x0, y0 = 90, 120
def X(x): return x0 + x * k
def Y(z): return y0 - z * k
zb = -V["baldosa"]; zm = zb - V["mortero"]; zc = zm - V["contrapiso"]; W = 1000; zw0, zw1 = 300, 700   # zanja de 400 (2 cond.) entre x 300 y 700
for i in range(5):
    xx = i * V["pan"]; h.rect(X(xx), Y(0), V["pan"] * k, V["baldosa"] * k, "url(#CERAM)", K, 1.0)
h.rect(X(0), Y(zb), W * k, V["mortero"] * k, "url(#MORT)", K, .8)
h.rect(X(0), Y(zm), W * k, V["contrapiso"] * k, "url(#CONCP)", K, 1.0)
h.rect(X(0), Y(zc), zw0 * k, 450 * k, "url(#EARTH)", "none", 0); h.rect(X(zw1), Y(zc), (W - zw1) * k, 450 * k, "url(#EARTH)", "none", 0)
for i in range(3):
    h.rect(X(zw0), Y(zc - i * V["capa"]), (zw1 - zw0) * k, V["capa"] * k, "url(#ANSI37)", K, .8)
h.ln(X(zw0), Y(zc), X(zw0), Y(zc - 450), K, 1.2); h.ln(X(zw1), Y(zc), X(zw1), Y(zc - 450), K, 1.2)
h.nivel(X(W) - 60, Y(0), "±0,00")
h.dimV(X(W) + 14, Y(0), Y(zb), "", ext=X(W)); h.txt(X(W) + 20, Y(zb / 2) + 4, "25 (*) BALDOSA", 9, 400, OR)
h.dimV(X(W) + 14, Y(zb), Y(zm), "", ext=X(W)); h.txt(X(W) + 20, Y((zb + zm) / 2) + 4, "20 MORTERO", 9, 400, K)
h.dimV(X(W) + 14, Y(zm), Y(zc), "80", ext=X(W)); h.txt(X(W) + 20, Y((zm + zc) / 2) + 4, "CONTRAPISO", 9, 400, K)
for i in range(3): h.dimV(X(zw1) + 14, Y(zc - i * 150), Y(zc - (i + 1) * 150), "150", ext=X(zw1))
h.dimH(Y(zc - 450) + 16, X(zw0), X(zw1), "ANCHO DE LA ZANJA", ext=Y(zc - 450))
h.dimH(Y(0) - 14, X(zw0 - 100), X(zw1 + 100), "SOBREANCHO (*)", ext=Y(0), c=OR)
llamada(h, X(500), Y(zc - 75), X(60), Y(zc - 470), "RELLENO COMPACTADO EN CAPAS DE 15", sz=9)

# =============== 2. BALDOSA ===============
subt(h, 40, 462, "BALDOSA DE 9 PANES (8004)", "ESC. 1:4 · 200 × 200 (*) · IGUAL A LA EXISTENTE")
kb = 1.0; bx, by = 70, 510
h.rect(bx, by, 200 * kb, 200 * kb, "url(#CERAM)", K, 1.2)
for p in range(3):
    for q in range(3): h.rect(bx + 8 + p * 62, by + 8 + q * 62, 52, 52, "#fff", K, .8)
h.dimH(by - 10, bx, bx + 200 * kb, "200 (*)", ext=by, c=OR); h.dimV(bx + 214, by, by + 200 * kb, "200 (*)", ext=bx + 200 * kb, c=OR)
h.dimH(by + 222, bx + 8, bx + 60, "52 (*)", ext=by + 200, c=OR)
h.rect(bx, by + 240, 200 * kb, 25, "url(#CERAM)", K, 1.0); h.txt(bx + 210, by + 257, "CANTO: 25 (*)", 9, 400, OR)

# =============== 3. CORTE B-B · CALZADA ===============
subt(h, 380, 470, "CORTE B-B · CALZADA (CRUCE AP-TC-002)", "ESC. 1:10 · CARPETA ASFALTICA O H-21")
kc = .38; cx0, cy0 = 410, 520
def CX(x): return cx0 + x * kc
def CY(z): return cy0 - z * kc
za = -C["asfalto"]; zh = za - C["h21"]; zbs = zh - C["base"]
h.rect(CX(0), CY(0), 1000 * kc, C["asfalto"] * kc, "url(#ASPH)", K, 1.1)
h.rect(CX(0), CY(za), 1000 * kc, C["h21"] * kc, "url(#CONC)", K, 1.1)
h.rect(CX(0), CY(zh), 1000 * kc, C["base"] * kc, "url(#BASE)", K, .9)
h.rect(CX(0), CY(zbs), 1000 * kc, 100 * kc, "url(#EARTH)", "none", 0)
h.dimV(CX(1000) + 14, CY(0), CY(za), "50 (*)", ext=CX(1000), c=OR)
h.dimV(CX(1000) + 14, CY(za), CY(zh), "200 (ESTIM.)", ext=CX(1000), c=OR)
h.dimV(CX(1000) + 14, CY(zh), CY(zbs), "150 (*)", ext=CX(1000), c=OR)
for t, z in (("CARPETA ASFALTICA 8007", za / 2), ("H-21 (8014)", (za + zh) / 2), ("BASE GRANULAR (*)", (zh + zbs) / 2)):
    h.txt(CX(20), CY(z) + 4, t, 9, 700, OR if "(*)" in t else K)

# =============== TABLAS Y NOTAS ===============
yt = tablaCod(h, 40, 810, [8004, 8007], {8004: "m² DE VEREDA", 8007: "m² DE CALZADA"}, w=800, rowh=15, tit_extra="SE MIDE", wext=140)
cols = [(330, "l", False), (150, "c", True), (320, "l", False)]
fil = [["COMPUTO", "CANTIDAD", "CALCULO"], ["BALDOSA (8004)", "m²", "(ANCHO ZANJA + SOBREANCHO (*)) × LARGO"],
       ["CARPETA (8007)", "m²", "ANCHO DEL CRUCE × LARGO"], ["CONTRAPISO / MORTERO", "m³", "m² × 0,08 / m² × 0,02"]]
yt = tablaG(h, 40, yt + 20, cols, fil, rowh=15, titulo="COMPUTO")
yr = rayadosC(h, 40, yt + 20, ["CERAM", "MORT", "CONCP", "ANSI37", "ASPH", "CONC", "BASE", "EARTH"], cols=4, dx=200)
notasW(h, 40, yr + 12, [
    "DATOS: FICHA DE LA APP (PLIEGO LP 21478: CONTRAPISO 8 cm + MORTERO 2 cm + BALDOSA IGUAL, EN 48 h; RELLENO EN CAPAS DE 15 cm; CALZADA H-21 0,20 (ESTIMADO) O CARPETA).",
    "(*) TIPO Y ESPESOR DE LA BALDOSA, ESPESOR DE LA CARPETA Y DE SU BASE, SOBREANCHO DE REPOSICION: SEGUN LA VEREDA / CALLE EXISTENTE (A CONFIRMAR).",
    "FUENTES: r3d/FUENTES_civil.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - CORTE ESCALONADO · VEREDA Y CALZADA", "CADA CAPA TERMINA ANTES QUE LA DE ABAJO, ASI SE VEN TODAS")
A = img3d(h, "civil_vereda", 884, 92, 600)
columna(h, A, [("panes", "1", "BALDOSA DE 9 PANES (8004)"), ("mortero", "2", "MORTERO 20"), ("contrapiso", "3", "CONTRAPISO 80"), ("capa1", "4", "RELLENO · CAPA 1"),
               ("capa2", "5", "CAPA 2"), ("capa3", "6", "CAPA 3")], 1500, 110, 300, paso=27)
columna(h, A, [("asfalto", "7", "CARPETA ASFALTICA (8007)"), ("h21", "8", "H-21 0,20"), ("base", "9", "BASE GRANULAR (*)"), ("suelo", "10", "SUELO")], 1500, 330, 560, paso=27)
bloque(h, 890, 780, "DATOS TECNICOS", [
    "VEREDA: CONTRAPISO 8 cm + MORTERO 2 cm + BALDOSA IGUAL A LA EXISTENTE",
    "SE REPONE EN 48 h · RELLENO COMPACTADO EN CAPAS DE 15 cm",
    "CALZADA: H-21 DE 0,20 (ESTIMADO) O CARPETA ASFALTICA"], w=360, sz=10, lh=13.5)
bloque(h, 1270, 780, "DONDE SE USA", [
    "AP-TC-001: ZANJA BAJO VEREDA CON BALDOSA (ITEMS 15–20)",
    "AP-TC-002: CRUCE DE CALZADA (H-21 O ASFALTO)",
    "GUIA «ZANJEO Y TENDIDO»"], w=360, sz=10, lh=13.5)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_vereda.mjs) CON LAS MISMAS CAPAS DEL PLANO. FUENTES: r3d/FUENTES_civil.md")
rotuloMat(h, "MAT-REPOSICION-1", "REPOSICION DE VEREDA", "Y CALZADA", "CORTES A-A Y B-B, BALDOSA, COMPUTO Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha=FECHA)
guardarC(h, "mat_reposicion_1")
