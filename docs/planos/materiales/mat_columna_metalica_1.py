"""MAT-COLUMNA_METALICA-1 (rev. B) · Columna metálica recta de tramos 7 m (6006) y 10 m (6005) + caño PVC Ø75 (6004).
Geometría: r3d/piezas/perfiles_col.mjs (MET) → perfiles_col.json; 3D: r3d/out/col_met_puerta.png y col_met_base.png.
Datos: FICHAS_TEC.columna_metalica (tabla de tramos de un fabricante de referencia, ETG: SAE 1010, espesores, empotramiento 1/10, entrada 150 × 76
a ≥ 300 bajo el piso, manguito Ø60,3 × 300, caja a 2,50 m, bulón de bronce PAT), Normas AP-C-005 (Ht, empotramiento, Ø pie, fundación AP-TC-003).
Web: IRAM 2619 / 2620, ventana 95 × 160 / 100 × 170 (pliego Trenque Lauquen), soldadura sólo en las uniones (FEM). Fuentes: r3d/FUENTES_col.md"""
from colkit import *

h = nueva3()
c7, c10, M = MET["c7"], MET["c10"], MET
Pu, Rd, En = M["puerta"], M["red"], M["entrada"]

# ======================= 1. ELEVACIONES (1:110, Ø ×1,6)
k = .036; YG = 470; ex = 1.6
h.titulo(40, 62, "ELEVACIONES - TRAMOS", "ESC. 1:110 · Ø DIBUJADOS 1,6× · TRAMOS DE REF. (*)")
suelo(h, 40, 340, YG); h.nivel(200, YG, "±0,00")
for (x, c, nom) in ((120, c7, "7 m · 6006"), (285, c10, "10 m · 6005")):
    Y = lambda z: YG - z * k; z = -c["emp"]
    for i, (D, e, L) in enumerate(c["tr"]):
        z1 = min(z + L, c["Ht"] - c["emp"]); r = D / 2 * k * ex
        h.rect(x - r, Y(z1), 2 * r, (z1 - z) * k, "#fff", K, 1.2)
        if i: h.ln(x - r - 1.5, Y(z), x + r + 1.5, Y(z), K, 1.6)
        h.txt(x + 9, (Y(z) + Y(z1)) / 2 + 3, f"Ø{D}·{mm(e)}", 8, 400, OR)
        z = z1
    zt = c["Ht"] - c["emp"]
    h.rect(x - 60.3 / 2 * k * ex, Y(zt + 300), 60.3 * k * ex, 300 * k, "url(#MET)", K, .7)
    h.ln(x, Y(zt + 300) - 8, x, Y(-c["emp"]) + 8, K, .4, h.EJE)
    h.rect(x - 2.6, Y(Pu["z"]) - 3, 5.2, 6, "#111", K, .3); h.rect(x - 2.6, Y(En["z"]) - 2.7, 5.2, 5.4, OR, OR, .3)
    h.dimV(x - 50, Y(zt), Y(-c["emp"]), f"Ht {mm(c['Ht'])}", ext=x - 4)
    h.dimV(x - 32, Y(zt), YG, f"LIBRE {mm(zt)}", ext=x - 4)
    h.dimV(x - 32, YG, Y(-c["emp"]), mm(c["emp"]), ext=x - 6)
    h.dimV(x + 64, Y(Pu["z"]), YG, "2.500", ext=x + 4)
    h.txt(x, Y(-c["emp"]) + 16, nom, 11, 700, K, "middle")
x = 120; Y = lambda z: YG - z * k
lineaCorte(h, x - 24, Y(En["z"]), x + 22, Y(En["z"]), "A")
h.globo("1", x, Y(1200), 52, 290, r=9); h.globo("2", x - 2, Y(Pu["z"]), 52, 245, r=9); h.globo("3", x, Y(2700), 52, 200, r=9)
h.globo("4", x, Y(7100), 52, 150, r=9); h.globo("5", x - 2, Y(En["z"]), 52, 520, OR, r=9)

# ======================= 2. D1 · REDUCCION Ø114 → Ø90 (corte por el eje, 1:1,6)
e = .62; cx, zr = 445, 250          # zr = y de la hoja en la base de la reducción
h.titulo(360, 62, "D1 · REDUCCION SOLDADA", "CORTE POR EL EJE · ESC. 1:1,6")
(D1, e1, _), (D2, e2, _) = c7["tr"][0], c7["tr"][1]
for s in (-1, 1):
    poly(h, [(cx + s * D1 / 2 * e, zr + 70), (cx + s * D1 / 2 * e, zr), (cx + s * (D1 / 2 - e1) * e, zr), (cx + s * (D1 / 2 - e1) * e, zr + 70)], "url(#MET)", 1.1)
    poly(h, [(cx + s * D1 / 2 * e, zr), (cx + s * (D2 / 2 + 1) * e, zr - Rd["L"] * .8 * e), (cx + s * (D2 / 2 + 1) * e, zr - Rd["L"] * e), (cx + s * (D2 / 2 + 1 - e1) * e, zr - Rd["L"] * e),
             (cx + s * (D2 / 2 + 1 - e1) * e, zr - Rd["L"] * .8 * e), (cx + s * (D1 / 2 - e1) * e, zr)], "url(#MET)", 1.1)
    poly(h, [(cx + s * D2 / 2 * e, zr - Rd["L"] * .55 * e), (cx + s * D2 / 2 * e, zr - Rd["L"] * e - 70), (cx + s * (D2 / 2 - e2) * e, zr - Rd["L"] * e - 70), (cx + s * (D2 / 2 - e2) * e, zr - Rd["L"] * .55 * e)], "url(#MET)", 1.1)
    for (yy, xx, w) in ((zr, D1 / 2 * e, 5), (zr - Rd["L"] * e, (D2 / 2 + 1) * e, 4)):
        poly(h, [(cx + s * xx, yy - w), (cx + s * (xx + w), yy), (cx + s * xx, yy + w * .2)], "#111", .5)
rotura(h, cx - D1 / 2 * e, cx + D1 / 2 * e, zr + 72); rotura(h, cx - D2 / 2 * e, cx + D2 / 2 * e, zr - Rd["L"] * e - 72)
h.ln(cx, zr - Rd["L"] * e - 80, cx, zr + 80, K, .4, h.EJE)
h.dimH(zr + 88, cx - D1 / 2 * e, cx + D1 / 2 * e, "Ø114", ext=zr + 74)
h.dimH(zr - Rd["L"] * e - 86, cx - D2 / 2 * e, cx + D2 / 2 * e, "Ø90", ext=zr - Rd["L"] * e - 74)
h.dimV(cx + D1 / 2 * e + 26, zr - Rd["L"] * e, zr, "60 (*)", ext=cx + D2 / 2 * e + 4, c=OR)
llamada(h, cx + D1 / 2 * e + 3, zr - 1, 525, zr + 40, "CORDON ≥ 1,5 e (FEM)", sz=8.5)
llamada(h, cx - (D2 / 2 + 1) * e - 2, zr - Rd["L"] * e + 2, 362, zr - 60, "ABOCARDADO (*)", c=OR, sz=8.5)
h.txt(cx - D1 / 2 * e - 4, zr + 40, "e 3,6", 8.5, 700, K, "end"); h.txt(cx - D2 / 2 * e - 4, zr - Rd["L"] * e - 50, "e 3,2", 8.5, 700, K, "end")
h.globo("3", cx + 20, zr - Rd["L"] * .5 * e, 560, 120, r=9)

# ======================= 3. D2 · PUERTA DE INSPECCION (frente) Y CORTE B-B
h.titulo(600, 62, "D2 · PUERTA A 2,50 m", "FRENTE Y CORTE B-B · ESC. 1:2,5")
e3 = .62; fx, fy = 680, 232; r1 = D1 / 2
h.rect(fx - r1 * e3, fy - 105, 2 * r1 * e3, 210, "#fff", K, 1.2)
rotura(h, fx - r1 * e3, fx + r1 * e3, fy - 105); rotura(h, fx - r1 * e3, fx + r1 * e3, fy + 105)
h.rect(fx - (Pu["w"] / 2 + 8) * e3, fy - (Pu["h"] / 2 + 8) * e3, (Pu["w"] + 16) * e3, (Pu["h"] + 16) * e3, "url(#MET)", K, .7)
h.rect(fx - Pu["w"] / 2 * e3, fy - Pu["h"] / 2 * e3, Pu["w"] * e3, Pu["h"] * e3, "#fff", K, 1.2)
h.rect(fx - 12 * e3, fy - (Pu["h"] / 2 + 14) * e3, 24 * e3, 16 * e3, "#fff", K, .6, h.OCULTA)
h.circ(fx, fy + (Pu["h"] / 2 - 3) * e3, 4, "#fff", K, .7)
h.rect(fx - 18 * e3, fy - 20 * e3, 50 * e3, 66 * e3, "#fff", K, .6); h.rect(fx - 22 * e3, fy - 5, 58 * e3, 35 * e3 * .3, "url(#MET)", K, .4)
h.circ(fx - 30 * e3, fy + (Pu["h"] / 2 - 20) * e3, 3.5, "url(#CU)", K, .6)
h.dimH(fy - 105 - 8, fx - Pu["w"] / 2 * e3, fx + Pu["w"] / 2 * e3, "100", ext=fy - Pu["h"] / 2 * e3)
h.dimV(fx + r1 * e3 + 16, fy - Pu["h"] / 2 * e3, fy + Pu["h"] / 2 * e3, "170", ext=fx + Pu["w"] / 2 * e3 + 2)
llamada(h, fx, fy - (Pu["h"] / 2 + 10) * e3, 735, 104, "TRABA (*)", c=OR, sz=8.5)
llamada(h, fx, fy + (Pu["h"] / 2 - 3) * e3, 735, 330, "BULON ANTIVANDALICO (*)", c=OR, sz=8.5)
llamada(h, fx - 30 * e3, fy + (Pu["h"] / 2 - 20) * e3, 610, 330, "PAT BRONCE", sz=8.5)
llamada(h, fx + 10, fy - 2, 735, 160, "TABLERITO AP-CC-014", sz=8.5)
lineaCorte(h, fx - r1 * e3 - 18, fy + 20, fx + r1 * e3 + 18, fy + 20, "B")
# corte B-B (horizontal) a la derecha
bx, by = 790, 215; rb = r1 * .62; aa = math.degrees(math.asin(Pu["w"] / 2 / r1))
arc = lambda r, a0, a1: [(bx + r * math.cos(math.radians(t)), by + r * math.sin(math.radians(t))) for t in [a0 + (a1 - a0) * i / 40 for i in range(41)]]
hatchPoly(h, arc(rb, 90 + aa, 450 - aa) + arc(rb - e1 * .62 * 1.5, 450 - aa, 90 + aa), "MET", 1)
h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in arc(rb + 22, 90 - aa - 4, 90 + aa + 4)), "none", K, 2.2)
h.txt(bx, by + rb + 38, "TAPA AFUERA", 8, 400, G, "middle"); h.txt(bx, by - rb - 6, "B-B", 9, 700, K, "middle")

# ======================= 4. D3 · ENTRADA 150 × 76 Y CAÑO Ø75 (corte por el eje, 1:10)
q = .2; px, yp = 470, 505
h.titulo(360, 365, "D3 · ENTRADA Y CAÑO Ø75", "CORTE POR EL EJE · ESC. 1:10 · AP-TC-003 (7 m)")
Yz = lambda z: yp - z * q
h.rect(px - 300 * q, Yz(0), 600 * q, M["fund"]["h7"] * q * .62, "url(#CONC)", K, 1)
rotura(h, px - 300 * q, px + 300 * q, Yz(0) + M["fund"]["h7"] * q * .62 + 1)
h.ln(px - 140, Yz(0), px + 140, Yz(0), K, 1.4); h.nivel(px + 70, Yz(0), "±0,00")
for s in (-1, 1): h.rect(px + s * 57 * q - (3.6 * q * 1.5 if s > 0 else 0), Yz(400), 3.6 * q * 1.5, (400 + 560) * q, "#111", K, .2)
h.rect(px - 57 * q - 1, Yz(En["z"] + En["h"] / 2), 3.6 * q * 1.5 + 2, En["h"] * q, "#fff", K, .6)
rp = 37.5 * q
h.rect(px - 140, Yz(En["z"]) - rp, 140 - 57 * q, 2 * rp, "#fff", K, .5)
h.rect(px - 140, Yz(En["z"]) - rp, 140 - 57 * q, 2.2, "url(#PLAS)", K, .4); h.rect(px - 140, Yz(En["z"]) + rp - 2.2, 140 - 57 * q, 2.2, "url(#PLAS)", K, .4)
h.path(f"M{px-140},{Yz(En['z'])} L{px-57*q-4},{Yz(En['z'])} Q{px-8},{Yz(En['z'])} {px-8},{Yz(En['z']+120)} L{px-8},{Yz(400)}", "none", K, 2)
h.dimV(px + 57 * q + 18, Yz(0), Yz(En["z"]), "≥ 300", ext=px + 57 * q + 2)
h.dimV(px - 57 * q - 14, Yz(En["z"] + En["h"] / 2), Yz(En["z"] - En["h"] / 2), "150", ext=px - 57 * q - 2)
h.dimH(Yz(400) - 8, px - 57 * q, px + 57 * q, "Ø114", ext=Yz(400))
h.txt(px - 138, Yz(En["z"]) - rp - 5, "CAÑO PVC Ø75 (6004)", 8.5, 700)
h.globo("5", px - 57 * q, Yz(En["z"] - 40), px + 90, Yz(-480), OR, r=9)
# corte A-A por la entrada
ax_, ay_ = 650, 500
h.txt(610, 440, "A-A", 10, 700); R_ = 57 * .7
a2 = math.degrees(math.asin(38 / 57))
hatchPoly(h, [(ax_ + R_ * math.cos(math.radians(t)), ay_ - R_ * math.sin(math.radians(t))) for t in [a2 + (360 - 2 * a2) * i / 40 for i in range(41)]] +
          [(ax_ + (R_ - 3.6) * math.cos(math.radians(t)), ay_ - (R_ - 3.6) * math.sin(math.radians(t))) for t in [360 - a2 - (360 - 2 * a2) * i / 40 for i in range(41)]], "MET", 1)
h.dimV(ax_ + R_ + 18, ay_ - 38 * .7, ay_ + 38 * .7, "76", ext=ax_ + R_ * math.cos(math.radians(a2)) + 2)
h.ln(ax_ - R_ - 10, ay_, ax_ + R_ + 10, ay_, K, .4, h.EJE)
h.txt(ax_, ay_ + R_ + 16, "ESC. 1:2,5", 8.5, 400, G, "middle")

# ======================= TABLAS
TY = 645
yv = tablaD(h, 40, TY, [("COD.", "MODELO (AP-C-005)", "Ht", "LIBRE", "EMPOTR.", "Ø PIE", "FUNDACION", "TRAMOS DE REF. Ø × e × L (*)"),
        ("6006", "TIPO C · 7 m", "7.700", "7.000", "700", "114", "0,60 × 0,60 × 0,90", "114×3,6×3400 · 90×3,2×2000 · 76×3,2×1500 · 60×3,2×800"),
        ("6005", "TIPO F · 10 m", "11.000", "10.000", "1.000", "140", "0,60 × 0,60 × 1,20", "140×4,7×4200 · 114×3,6×3000 · 90×3,2×2000 · 76×3,2×1800")],
        [(40, "c", True), (100, "l", False), (48, "c", True), (48, "c", True), (52, "c", True), (44, "c", True), (106, "l", False), (362, "l", False)],
        "VARIANTES (CUADRO AP-C-005 · mm) Y TRAMOS DEL FABRICANTE DE REFERENCIA")
yc_ = codTabla(h, 40, yv + 22, [6006, 6005, 6004], {6006: "ITEMS 1-3 · PROV. 83.1", 6005: "ITEM 4 · PROV. 83.2", 6004: "DE LA ENTRADA A LA ZANJA"}, wd=170)
yd = tablaD(h, 40, yc_ + 22, [("DATO", "VALOR"), ("MATERIAL", "TUBO DE ACERO SAE 1010, EN TRAMOS"), ("ESPESOR (ETG)", "≥ 3,2 (Ø ≤ 76) · ≥ 4 (MAYOR)"),
        ("UNIONES", "SOLDADAS SOLO ENTRE TRAMOS (FEM)"), ("NORMAS", "IRAM 2619 / 2620"), ("TERMINACION", "GALVANIZADO EN CALIENTE ≥ 75 µm (*)"),
        ("PUERTA", "100 × 170 A 2,50 m · TAPA + TRABA (*)"), ("ENTRADA", "150 × 76 · CENTRO ≥ 300 BAJO EL PISO"), ("MANGUITO", "Ø60,3 × 300 (O Ø42,6 × 150)"),
        ("PAT", "BULON DE BRONCE EN LA CAJA + JABALINA")], [(100, "l", False), (300, "l", False)], "DATOS TECNICOS", rowh=14)
ry = rayadosRef(h, 470, yc_ + 22, ["MET", "PLAS", "CONC", "CU", "EARTH"], cols=2, dx=180)
yu = bloque(h, 470, ry + 8, "DONDE SE USA", [
    "AP-C-005: COLUMNA RECTA, ACOMETIDA SUBTERRANEA.",
    "ITEMS 1-4 (METALICA 1/2/3 BRAZOS, 10 m) Y 83.1 / 83.2.",
    "AP-CC-001 (Ø ≤ 114) / AP-CC-004: CAJA; TABLERITO AP-CC-014.",
    "AP-TC-005: PAT, 1 JABALINA POR COLUMNA.",
    "CALCULADORA: GANANCIA DEL TRONCAL 5 m POR SUBIDA."], w=420, sz=9.5, lh=12)
notasW(h, 40, max(yd, yu) + 20, [
    "COTAS EN mm. Ht ES LO QUE SE PIDE AL FABRICANTE; EL PLIEGO HABLA DE ALTURA LIBRE: NO MEZCLARLAS. MANDA EL CUADRO DEL AP-C-005.",
    "(*) CONTRADICCION: CON LOS TRAMOS DE REF. (1.ER TRAMO 3.200 + EMPOTR. 700) LA REDUCCION CAE A 2.500, JUSTO EN LA CAJA. SE DIBUJO 3.400.",
    "(*) EMPOTRAMIENTO: ETG 1/10 (0,70 / 1,00) · FABRICANTE 0,8 / 1,1. REDUCCION (60), TAPA, TRABA Y BULON: PROPORCIONALES, A CONFIRMAR.",
    "(*) PUERTA 100 × 170: MEDIDA DE IRAM 2620 SEGUN UN PLIEGO MUNICIPAL (LA OTRA ES 95 × 160). FEM SUELDA LA TUERCA PAT A 50 DEL PISO."], w=800, lh=13.5)

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - COLUMNA METALICA 7 m (6006)", "ARRIBA: PUERTA A 2,50 m, REDUCCION A UN CUARTO Y CIMA · ABAJO: BASE EN LA FUNDACION A UN CUARTO")
A = img3d(h, "col_met_puerta", 895, 88, 355)
columna(h, A, [("manguito", "4", "MANGUITO Ø60,3 × 300"), ("cima", "", "TRAMO Ø60"), ("tramo2", "", "TRAMO Ø90 × 3,2"), ("reduccion", "3", "REDUCCION (ABOCARDADO) (*)"),
               ("soldadura", "", "CORDON DE SOLDADURA"), ("traba", "", "TRABA DE LA TAPA (*)"), ("tab", "", "TABAQUERA EN RIEL"), ("tapa", "", "TAPA CURVA (*)"),
               ("abertura", "2", "PUERTA 100 × 170"), ("pat", "", "BULON PAT DE BRONCE"), ("bulonT", "", "BULON ANTIVANDALICO (*)"), ("galv", "1", "GALVANIZADO EN CALIENTE")], 1290, 100, 505, paso=26)
B_ = img3d(h, "col_met_base", 920, 520, 330)
columna(h, B_, [("tubo", "1", "TRAMO Ø114 × 3,6"), ("pared", "", "PARED e 3,6"), ("entrada", "5", "ENTRADA 150 × 76"), ("troncal", "", "TRONCAL Cu"),
                ("pe", "", "PE 1×10 V/A"), ("cano", "", "CAÑO PVC Ø75 (6004)"), ("horm", "", "FUNDACION 0,60×0,60×0,90"), ("relleno", "", "RELLENO INTERIOR (*)")], 1290, 560, 995, paso=27)
pie3d(h, "", "RENDER three.js: r3d/escenas/col_met_puerta.mjs y col_met_base.mjs · MISMA GEOMETRIA DEL PLANO · FUENTES: r3d/FUENTES_col.md")
rotuloMat(h, "MAT-COLUMNA_METALICA-1", "COLUMNA METALICA RECTA", "7 m (6006) · 10 m (6005)", "ELEVACIONES, D1, D2, D3 Y 3D",
          "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardarCol(h, "mat_columna_metalica_1")
