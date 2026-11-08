"""MAT-MAMPOSTERIA-1 (rev. B) · Ladrillo común macizo 25 × 12 × 5 (8016), hierro liso Ø4,2 (8011), hierro Ø6 (8012), malla SIMA 15 × 15 (8018), alfarjía (8001).
Plano y 3D con las mismas medidas (perfiles_civil.json: LAD, HIERRO, SIMA, ALFA). 3D: r3d/out/civil_mamp.png, civil_hierros.png, civil_hierro_macro.png.
Fuentes: ficha de la app (ladrillo 25 × 12 × 5, malla SIMA 15 × 15), TABLERO_NIVEL (hilada 0,075, 2 hierros Ø6, malla SIMA en la variante H°A°),
Revista Nacional de Arquitectura 1948 (25 × 12 × 5 como tamaño normal), Easy (hierro ADN Ø6 × 12 m, malla Q188 Ø6). Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

L = PC["LAD"]; HI = PC["HIERRO"]; SI = PC["SIMA"]; AL = PC["ALFA"]
h = nuevaC()

# =============== 1. LADRILLO · 3 VISTAS ===============
h.titulo(40, 62, "LADRILLO (8016) · 3 VISTAS", "ESC. 1:2,5 · 250 × 120 × 50 · NOMBRE DE CADA CARA")
k = .4 * 1.0 * 1.6 / 1.6 * 1.0; k = .64
fx, fy = 60, 110
h.rect(fx, fy, L["L"] * k, L["A"] * k, "url(#LAD)", K, 1.3); h.txt(fx + L["L"] * k / 2, fy + L["A"] * k / 2 + 4, "TABLA", 11, 700, K, "middle")
h.dimH(fy - 12, fx, fx + L["L"] * k, "250", ext=fy); h.dimV(fx - 14, fy, fy + L["A"] * k, "120", ext=fx)
cy2 = fy + L["A"] * k + 40
h.rect(fx, cy2, L["L"] * k, L["H"] * k, "url(#LAD)", K, 1.3); h.txt(fx + L["L"] * k / 2, cy2 + L["H"] * k / 2 + 4, "CANTO (SOGA)", 10, 700, K, "middle")
h.dimV(fx - 14, cy2, cy2 + L["H"] * k, "50", ext=fx)
tx = fx + L["L"] * k + 40
h.rect(tx, cy2, L["A"] * k, L["H"] * k, "url(#LAD)", K, 1.3); h.txt(tx + L["A"] * k / 2, cy2 + L["H"] * k / 2 + 4, "TESTA", 10, 700, K, "middle")
h.dimH(cy2 + L["H"] * k + 14, tx, tx + L["A"] * k, "120", ext=cy2 + L["H"] * k)
h.txt(fx, cy2 + L["H"] * k + 34, "MACIZO, CERAMICO COCIDO · SIN HUECOS · ≈ 2,5 kg (*)", 9.5, 400, OR)

# =============== 2. MURO EN SOGA · VISTA Y CORTE ===============
subt(h, 420, 62, "MURO EN SOGA · 2 Ø6 EN LA JUNTA", "ESC. 1:7,5 · HILADA 75 = 50 + JUNTA 25 (TABLERO_NIVEL)")
km = .4; mx, my = 430, 250; j = L["junta"]
for hh in range(4):
    z0 = my - (hh + 1) * (L["H"] + j) * km + j * km; off = (L["L"] + j) / 2 * km if hh % 2 else 0
    h.rect(mx, z0 + L["H"] * km, 3 * (L["L"] + j) * km - j * km, j * km, "url(#MORT)", K, .4)
    x = mx - off
    while x < mx + 3 * (L["L"] + j) * km - j * km:
        a, b = max(x, mx), min(x + L["L"] * km, mx + 3 * (L["L"] + j) * km - j * km)
        if b - a > 2: h.rect(a, z0, b - a, L["H"] * km, "url(#LAD)", K, 1.0)
        x += (L["L"] + j) * km
zh = my - 2 * (L["H"] + j) * km + j * km + L["H"] * km + j * km / 2
h.ln(mx - 8, zh, mx + 3 * (L["L"] + j) * km + 10, zh, K, 1.8)
llamada(h, mx + 3 * (L["L"] + j) * km + 6, zh, mx + 250, my + 30, "2 Ø6 (8012) CADA 2 HILADAS", sz=9)
h.dimV(mx - 14, my - (L["H"] + j) * km, my, "75", ext=mx)
# corte del muro
cx0 = 790; cw = L["A"] * km
for hh in range(4):
    z0 = my - (hh + 1) * (L["H"] + j) * km + j * km
    h.rect(cx0, z0, cw, L["H"] * km, "url(#LAD)", K, 1.1); h.rect(cx0, z0 + L["H"] * km, cw, j * km, "url(#MORT)", K, .5)
for yy in (30, 90): h.circ(cx0 + yy * km, zh, 3 * km + .8, K, K, .3)
h.dimH(my + 14, cx0, cx0 + cw, "120", ext=my)
h.txt(cx0 + cw / 2, my + 36, "CORTE", 9.5, 700, K, "middle")

# =============== 3. HIERROS ===============
subt(h, 40, 330, "HIERROS · VISTA Y SECCION", "ESC. 5:1 · Ø6 (8012) CONFORMADO (*) · Ø4,2 (8011) LISO")
k3 = 5; hx, hy = 60, 390; d = HI["d6"]; nv = .45
h.rect(hx, hy - d / 2 * k3, 300, d * k3, "#fff", K, 1.2)
for i in range(int(300 / (d * .66 * k3))):
    xx = hx + 8 + i * d * .66 * k3; h.path(f"M{xx},{hy - d / 2 * k3} l{6},{d * k3 * .5} M{xx + 3},{hy} l{6},{d * k3 * .5}", "none", K, 1.0)
h.ln(hx, hy, hx + 300, hy, K, 1.6)
h.dimV(hx + 312, hy - d / 2 * k3, hy + d / 2 * k3, "Ø6", ext=hx + 300)
h.dimH(hy + d / 2 * k3 + 14, hx + 8, hx + 8 + d * .66 * k3, "≈ 4 (*)", ext=hy + d / 2 * k3, c=OR)
llamada(h, hx + 120, hy - d / 2 * k3 + 4, hx + 150, hy - d / 2 * k3 - 18, "NERVIOS TRANSVERSALES (*)", c=OR, sz=9)
llamada(h, hx + 230, hy, hx + 240, hy + d / 2 * k3 + 22, "NERVIO LONGITUDINAL", sz=9)
sx = 430
h.circ(sx, hy, d / 2 * k3, "url(#MET)", K, 1.2); h.circ(sx - d / 2 * k3 - 1, hy, 2.5, K, K, 0); h.circ(sx + d / 2 * k3 + 1, hy, 2.5, K, K, 0)
for a in range(0, 360, 30):
    if a in (0, 180): continue
    h.circ(sx + (d / 2 * k3 + 1.5) * math.cos(math.radians(a)), hy + (d / 2 * k3 + 1.5) * math.sin(math.radians(a)), 1.4, "#fff", K, .5)
h.txt(sx, hy + 30, "Ø6 · SECCION", 9, 700, K, "middle")
h.circ(sx + 70, hy, HI["d42"] / 2 * k3, "url(#MET)", K, 1.2); h.txt(sx + 70, hy + 30, "Ø4,2 LISO", 9, 700, K, "middle")
h.txt(60, hy + 54, "BARRA COMERCIAL 12 m (EASY: ADN Ø6 × 12 m) · Ø6: 0,222 kg/m · Ø4,2: 0,109 kg/m (CALCULADO CON 7850 kg/m³)", 9.5, 400, OR)

# =============== 4. MALLA SIMA ===============
subt(h, 560, 330, "MALLA SIMA 15 × 15 (8018)", "ESC. 1:10 · Q188 = Ø6 CADA 150 (*) · PAÑO 2,40 × 6,00 (*)")
ks = .32; sx0, sy0 = 590, 400
for i in range(5): h.ln(sx0, sy0 + i * 150 * ks, sx0 + 4 * 150 * ks, sy0 + i * 150 * ks, K, 1.4)
for i in range(5): h.ln(sx0 + i * 150 * ks, sy0 - 6, sx0 + i * 150 * ks, sy0 + 4 * 150 * ks + 6, K, 1.4)
for i in range(5):
    for jj in range(5): h.circ(sx0 + i * 150 * ks, sy0 + jj * 150 * ks, 2.4, K, K, 0)
h.dimH(sy0 - 14, sx0, sx0 + 150 * ks, "150", ext=sy0); h.dimV(sx0 + 4 * 150 * ks + 14, sy0, sy0 + 150 * ks, "150", ext=sx0 + 4 * 150 * ks)
llamada(h, sx0 + 2 * 150 * ks, sy0 + 150 * ks, sx0 + 110, sy0 + 222, "NUDO SOLDADO", sz=9)

# =============== 5. ALFARJIA ===============
subt(h, 60, 500, "ALFARJIA (8001)", "ESC. 1:2,5 · SECCION (*)")
ax, ay = 80, 545
h.rect(ax, ay, AL["h"] * .64, AL["b"] * .64, "url(#WOOD)", K, 1.2)
h.dimH(ay - 10, ax, ax + AL["h"] * .64, "75 (*)", ext=ay, c=OR); h.dimV(ax - 12, ay, ay + AL["b"] * .64, "50 (*)", ext=ax, c=OR)
h.txt(ax + 70, ay + 20, "MADERA · USO EN OBRA (*)", 9, 400, OR)

# =============== TABLAS Y NOTAS ===============
EX = {8016: "250 × 120 × 50", 8011: "Ø4,2 LISO", 8012: "Ø6 (*)", 8018: "15 × 15 · Ø (*)", 8001: "SECCION (*)"}
yt = tablaCod(h, 40, 640, [8016, 8011, 8012, 8018, 8001], EX, w=800, rowh=15, tit_extra="MEDIDA", wext=150)
cols = [(330, "l", False), (150, "c", True), (320, "l", False)]
fil = [["COMPUTO", "CANTIDAD", "DE DONDE SALE"],
       ["LADRILLO SOBRE CABLE DIRECTO (AP-TC-001)", "4 u/m", "TRANSVERSAL A LA ZANJA (EN PEAD NO VA)"],
       ["BASE TABLERO A NIVEL TIPO A / B", "81 / 65 u", "TABLERO_NIVEL (CON 8 %)"],
       ["HIERRO Ø6 EN LA BASE", "2 CADA 2 HILADAS", "TABLERO_NIVEL"],
       ["MALLA SIMA (VARIANTE H°A°)", "POR m²", "AP-TC-007 NOTA 4"]]
yt = tablaG(h, 40, yt + 20, cols, fil, rowh=15, titulo="COMPUTO")
yr = rayadosC(h, 40, yt + 20, ["LAD", "MORT", "MET", "WOOD"], cols=4, dx=200)
notasW(h, 40, yr + 12, [
    "COTAS EN mm. LADRILLO 25 × 12 × 5 (PAÑOL, FICHA DE LA APP; «TAMAÑO NORMAL» DEL LADRILLO MACIZO EN ARGENTINA, REVISTA DE ARQUITECTURA 1948).",
    "HILADA 0,075 Y 2 HIERROS Ø6: TABLERO_NIVEL. CON LADRILLO DE 50 LA JUNTA DA 25. VARIANTE H°A°: e = 12 cm CON MALLA SIMA 15 × 15.",
    "(*) EL PAÑOL DICE «HIERRO REDONDO Ø6»: SE DIBUJO CONFORMADO (ADN 420, CON NERVIOS). CONFIRMAR SI SE COMPRA LISO O CONFORMADO.",
    "(*) MALLA «SIMA 15 × 15» NO DICE EL Ø: Q188 ES Ø6 (EASY: MINIMALLA Q188 150 × 150 × 6); Q84 ES MAS FINA. CONFIRMAR CON EL PROVEEDOR.",
    "(*) SECCION Y USO DE LA ALFARJIA, PESO DEL LADRILLO, ALTURA DE LOS NERVIOS: A CONFIRMAR. FUENTES: r3d/FUENTES_civil.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - MURO EN SOGA Y LADRILLO SUELTO", "3 HILADAS CON JUNTA DE 25 · 2 Ø6 EN LA JUNTA DE ARRIBA · CARAS DEL LADRILLO")
A = img3d(h, "civil_mamp", 884, 92, 600)
columna(h, A, [("hierro", "1", "2 Ø6 EN LA JUNTA"), ("soga", "2", "LADRILLO EN SOGA"), ("junta", "3", "JUNTA 25"), ("vertical", "", "JUNTA VERTICAL"),
               ("tabla", "", "TABLA"), ("canto", "", "CANTO"), ("testa", "", "TESTA")], 1500, 120, 440, paso=27)
h.txt(890, 480, "HIERROS, MALLA SIMA Y ALFARJIA", 11, 700, NV, "start", INT)
A2 = img3d(h, "civil_hierros", 884, 488, 400)
globo3d(h, A2("malla"), "", 1300, 510, "MALLA SIMA 15 × 15"); globo3d(h, A2("nudo"), "", 1300, 540, "NUDO SOLDADO")
globo3d(h, A2("d6"), "", 1300, 570, "Ø6 (8012)"); globo3d(h, A2("d42"), "", 1300, 595, "Ø4,2 (8011)"); globo3d(h, A2("alfa"), "", 1300, 620, "ALFARJIA (8001)")
h.txt(1300, 650, "DETALLE: NERVIOS", 10, 700, NV, "start", INT)
A3 = img3d(h, "civil_hierro_macro", 1300, 652, 300)
bloque(h, 890, 800, "DATOS TECNICOS", [
    "LADRILLO COMUN MACIZO 25 × 12 × 5 cm",
    "HIERRO Ø4,2 LISO · Ø6 (POR METRO) · BARRA DE 12 m",
    "MALLA SIMA 15 × 15 (POR m²) · Ø DEL ALAMBRE (*)",
    "ALFARJIA: MADERA, MEDIDA (*)"], w=360, sz=10, lh=13.5)
bloque(h, 1270, 800, "DONDE SE USA", [
    "AP-TC-001: LADRILLO SOBRE EL CABLE ENTERRADO DIRECTO (4 POR METRO)",
    "AP-TC-007: BASE DE TABLERO (81 / 65 u) Y 2 Ø6 CADA 2 HILADAS",
    "AP-TC-007 VARIANTE H°A°: MALLA SIMA 15 × 15",
    "Ø4,2: COLUMNA METALICA (FICHA DE LA APP)"], w=360, sz=10, lh=13.5)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_mamp.mjs, civil_hierros.mjs): NERVIOS COMO GEOMETRIA. FUENTES: r3d/FUENTES_civil.md")
rotuloMat(h, "MAT-MAMPOSTERIA-1", "LADRILLO, HIERROS,", "MALLA SIMA Y ALFARJIA", "VISTAS, MURO, HIERROS, MALLA Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha=FECHA)
guardarC(h, "mat_mamposteria_1")
