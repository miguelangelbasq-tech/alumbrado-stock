"""MAT-APOYOS-1 (rev. B) · Apoyo (poste) de PRFV hl 8 m Ro 1050 daN para el tablero (6015) + apoya escalera H 12 con herrajes (4012).
Geometría: r3d/piezas/perfiles_col.mjs (APO) → perfiles_col.json; 3D: r3d/out/col_apo1.png.
Datos: FICHAS_TEC.apoyos (6015: total 9,5 m, empotr. ≈ 1,5 m; 4012 AP-T-019 ref. 11), FAMILIAS_MAT.apoyos, Normas AP-T-018 (Ø NO publicado: se mide
perímetro ÷ 3,14; conicidad publicada de los postes PRFV 15 a 20 mm/m; ítem 13), AP-T-019 (gabinete a 5 m o más, tiro flojo ≤ 10 m, poste a 2,50 m del
cordón), AP-T-012 (abrazaderas del gabinete). El apoya escalera no tiene medidas en la app ni en la web: ESQUEMA (*)."""
from colkit import *

h = nueva3()
P, E = APO["prfv"], APO["esc"]
rz = lambda z: (P["Db"] - P["k"] * (z + P["LE"]) / 1000) / 2

# ======================= 1. ELEVACION (1:100, Ø ×2)
k = .042; X, YG = 170, 470
h.titulo(40, 62, "ELEVACION - APOYO PRFV 8 m (6015)", "ESC. 1:100 · Ø DIBUJADO 2× (*)")
suelo(h, 40, 330, YG); h.nivel(300, YG, "±0,00")
Y = lambda z: YG - z * k; zt = P["LL"]
poly(h, [(X - rz(-P["LE"]) * k * 2, Y(-P["LE"])), (X - rz(zt) * k * 2, Y(zt)), (X + rz(zt) * k * 2, Y(zt)), (X + rz(-P["LE"]) * k * 2, Y(-P["LE"]))], "#fff", 1.4)
h.ln(X, Y(zt) - 10, X, Y(-P["LE"]) + 10, K, .4, h.EJE)
h.rect(X + rz(P["gab"]) * k * 2, Y(P["gab"] + 530), 200 * k * 1.4, 530 * k, "#fff", G, .8, 'stroke-dasharray="4 2"'); h.txt(X + 30, Y(P["gab"] + 600), "GABINETE", 8.5, 400, G)
h.rect(X - rz(E["z"]) * k * 2 - E["a"] * k * 1.5, Y(E["z"]) - 2.5, E["a"] * k * 1.5, 5, "#fff", OR, 1.2)
h.dimV(X - 70, Y(zt), Y(-P["LE"]), "TOTAL 9.500", ext=X - rz(zt) * k * 2 - 3)
h.dimV(X - 50, Y(zt), YG, "LIBRE 8.000", ext=X - rz(zt) * k * 2 - 3)
h.dimV(X - 50, YG, Y(-P["LE"]), "≈1.500", ext=X - rz(-P["LE"]) * k * 2 - 3)
h.dimV(X + 70, Y(P["gab"]), YG, "≥ 5.000", ext=X + rz(P["gab"]) * k * 2)
h.dimV(X + 42, Y(E["z"]), YG, f"{mm(E['z'])} (*)", ext=X + 6, c=OR)
h.txt(X, Y(-P["LE"]) + 16, "Ø: SE MIDE (*)", 10, 700, OR, "middle")
h.globo("1", X + 1, Y(1500), 60, 300, r=9); h.globo("2", X - rz(E["z"]) * k * 2 - E["a"] * k * 1.5, Y(E["z"]), 60, 370, OR, r=9)
h.globo("3", X + rz(P["gab"]) * k * 2 + 6, Y(P["gab"] + 200), 290, 160, r=9)
lineaCorte(h, X - 30, Y(800), X + 30, Y(800), "A")

# ======================= 2. CORTE A-A · EL Ø SE MIDE (1:5)
h.titulo(400, 62, "CORTE A-A · EL Ø SE MIDE", "ESC. 1:5 · PERIMETRO CON CINTA ÷ 3,14")
cx, cy = 480, 190; r = rz(800) * .45; ee = 7 * .45
ring = lambda rr, n=72: [(cx + rr * math.cos(2 * math.pi * i / n), cy - rr * math.sin(2 * math.pi * i / n)) for i in range(n)]
hatchPoly(h, ring(r) + list(reversed(ring(r - ee * 1.5))), "PRFV", 1.3)
h.circ(cx, cy, r + 7, "none", OR, 1.2, 'stroke-dasharray="6 3"')
h.dimH(cy + r + 24, cx - r, cx + r, "Ø = PERIMETRO ÷ 3,14", ext=cy + 6)
h.txt(cx + r + 14, cy - r + 6, "CINTA", 9.5, 700, OR)
h.txt(400, cy + r + 50, "PUBLICADO: CONICIDAD 15 A 20 mm/m.", 9, 400)
h.txt(400, cy + r + 63, "DIBUJO: Ø BASE ≈ 260, 17,5 mm/m,", 9, 400, OR); h.txt(400, cy + r + 76, "PARED 7 (*).", 9, 400, OR)

# ======================= 3. D1 · APOYA ESCALERA H 12 (ESQUEMA, 1:10): costado y planta
h.titulo(620, 62, "D1 · APOYA ESCALERA (4012)", "ESQUEMA (*) · COSTADO Y PLANTA · ESC. 1:10")
q = .2; ax, ay = 650, 230
D = 2 * rz(E["z"]); rP = D / 2
h.rect(ax, ay - 110, D * q * 1.1, 220, "url(#PRFV)", K, 1)
pl, tpl = E["pl"]
for zz in (60, -60): h.rect(ax - 4, ay - zz * q * 1.6 - pl / 2 * q, D * q * 1.1 + 8, pl * q, "url(#MET)", K, .8)
h.rect(ax + D * q * 1.1, ay - pl / 2 * q, E["a"] * q, pl * q, "url(#MET)", K, 1)
h.rect(ax + D * q * 1.1 + E["a"] * q - tpl * q, ay - pl / 2 * q - 60 * q, tpl * q + 2, 60 * q + pl * q, "url(#MET)", K, 1)
h.dimH(ay - 70, ax + D * q * 1.1, ax + D * q * 1.1 + E["a"] * q, f"≈ {E['a']} (*)", ext=ay - 8, c=OR)
h.txt(ax + 40, ay + 130, "DE COSTADO (*)", 8.5, 400, OR, "middle")
# planta
px, py = 760, 230
h.circ(px, py + 40, rP * q, "url(#PRFV)", K, 1)
for s in (-1, 1): h.rect(px + s * E["b"] / 2 * q - tpl * q / 2, py + 40 - rP * q - E["a"] * q, tpl * q, E["a"] * q, "url(#MET)", K, .9)
h.rect(px - E["b"] / 2 * q - 1, py + 40 - rP * q - E["a"] * q - tpl * q, E["b"] * q + 2, tpl * q + 1, "url(#MET)", K, .9)
h.dimH(py + 40 - rP * q - E["a"] * q - 14, px - E["b"] / 2 * q, px + E["b"] / 2 * q, f"≈ {E['b']} (*)", ext=py + 40 - rP * q - E["a"] * q - 2, c=OR)
h.txt(px, py + 92, "PLANTA: «U» (*)", 8.5, 400, OR, "middle")

# ======================= TABLAS
TY = 595
yc_ = codTabla(h, 40, TY, [6015, 4012], {6015: "1 POR TABLERO AEREO · ITEM 13", 4012: "AP-T-019 REF. 11"}, wd=190)
yd = tablaD(h, 40, yc_ + 20, [("DATO", "VALOR"), ("MATERIAL", "PRFV (POLIESTER + FIBRA DE VIDRIO)"), ("ALTURA LIBRE", "8,0 m (hl)"), ("LARGO TOTAL", "9,5 m"),
        ("EMPOTRAMIENTO", "≈ 1,5 m"), ("CARGA DE ROTURA", "Ro 1050 daN"), ("Ø", "NO PUBLICADO: SE MIDE (*)"), ("CONICIDAD", "15 A 20 mm/m (PUBLICADO)"),
        ("DIST. AL CORDON", "2,50 m (AP-T-019, NOTA 8)"), ("APOYA ESCALERA", "PLANCHUELA 50 × 6 H°G° + 2 ABRAZADERAS (*)")], [(120, "l", False), (300, "l", False)], "DATOS TECNICOS", rowh=14)
ry = rayadosRef(h, 480, yc_ + 20, ["PRFV", "MET", "EARTH"], cols=1, dx=180)
yu = bloque(h, 480, ry + 8, "DONDE SE USA", ["AP-T-018: POSTE DEL TABLERO AEREO, 1 POR TABLERO (ITEM 13).", "AP-T-019: ACOMETIDA, RACK, FOTOCONTROL Y APOYA ESCALERA.",
            "AP-T-012: SUJECION DEL GABINETE (Ø MEDIDO).", "AP-T-015: SELLADO DEL ORIFICIO DE ENTRADA.", "CON APOYO PRFV NO VA CAÑO DE BAJADA."], w=360, sz=9.5, lh=12.5)
notasW(h, 40, max(yd, yu) + 20, [
    "COTAS EN mm. GABINETE A 5 m O MAS DEL PISO, PUERTA HACIA EL ESPACIO VERDE (AP-T-019). TIRO FLOJO ≤ 10 m.",
    "(*) Ø DIBUJADO ≈ 260 EN LA BASE CON 17,5 mm/m SOLO PARA EL DIBUJO: EN OBRA SE MIDE (PERIMETRO ÷ 3,14). PARED 7 (*).",
    "(*) APOYA ESCALERA: SIN MEDIDAS EN LA APP NI EN LA WEB; ALTURA, FORMA Y HERRAJES A CONFIRMAR CON EL FABRICANTE / AP-T-019.",
    "(*) EMPOTRAMIENTO DIRECTO EN SUELO COMPACTADO: COMO SE RELLENA EL HOYO, A CONFIRMAR (AP-T-018)."], w=800, lh=13.5)

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - APOYO PRFV 8 m (6015)", "PIE EMPOTRADO ≈1,5 m CORTADO A UN CUARTO · TRAMO DEL APOYA ESCALERA (ESQUEMA *)")
A = img3d(h, "col_apo1", 895, 120, 340)
columna(h, A, [("apoyo", "1", "APOYO PRFV RAL 7043"), ("empotr", "", "EMPOTRAMIENTO ≈1.500"), ("suelo", "", "SUELO COMPACTADO (*)"), ("base", "", "BASE (TAPA) (*)")],
        905, 560, 700, paso=30)
h.txt(1260, 120, "APOYA ESCALERA H 12 (4012) · ESQUEMA (*)", 11, 700, NV, "start", INT)
E3 = img3d(h, "col_apo1_esc", 1250, 130, 390)
columna(h, E3, [("escTope", "", "TOPE DE LA ESCALERA (*)"), ("escU", "2", "«U» PLANCHUELA 50 × 6 (*)"), ("escChapa", "", "CHAPA DE APOYO (*)"), ("escAbr", "", "2 ABRAZADERAS H°G°"),
                ("bulon", "", "BULON Ø12 (*)")], 1300, 600, 760, paso=30)
pie3d(h, "", "RENDER three.js: r3d/escenas/col_apo1.mjs · MISMA GEOMETRIA DEL PLANO · FUENTES: r3d/FUENTES_col.md")
rotuloMat(h, "MAT-APOYOS-1", "APOYO PRFV 8 m Ro 1050", "Y APOYA ESCALERA H 12", "ELEVACION, A-A, D1 ESQUEMA, CODIGOS Y 3D", "1:100 / 1:5", "D1 1:10 · 3D S/E", rev="B", fecha="08/11/2026")
guardarCol(h, "mat_apoyos_1")
