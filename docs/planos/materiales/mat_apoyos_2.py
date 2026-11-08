"""MAT-APOYOS-2 (rev. B) · Postes de 8,5 m: H°A° pretensado Ro 1050 (6023), H°A° pretensado Ro 750 (6501) y madera eucaliptus salinizado (6502).
Geometría: r3d/piezas/perfiles_col.mjs (APO.ha) → perfiles_col.json; 3D: r3d/out/col_apo2.png.
Datos: FICHAS_TEC.apoyos (6023 empotr. 0,85 m; tabla barrio 6501 / 6023 / 6502 con ítems 11.01–11.03; Ø cima 18–20 / 20–22 cm), FAMILIAS_MAT.apoyos
(con H°A° va caño de bajada + fleje), calculadora de barrio (empotramiento 1,45 con H-15 en hoyo Ø0,60 · 0,85 directo · madera 1,35).
Web: IRAM 1605 = postes de hormigón pretensado de sección anular troncocónica. Pared y alambres: (*)."""
from colkit import *

h = nueva3()
PS = APO["ha"]

# ======================= 1. ELEVACIONES (1:100, Ø ×2)
k = .042; YG = 430
h.titulo(40, 62, "ELEVACIONES - POSTES DE 8,5 m", "ESC. 1:100 · Ø DIBUJADOS 2× (*)")
suelo(h, 40, 840, YG); h.nivel(815, YG, "±0,00")
for i, p in enumerate(PS):
    x = 130 + i * 270; Y = lambda z: YG - z * k
    rz = lambda z: (p["dc"] + p["k"] * (p["L"] - p["emp"] - z) / 1000) / 2
    zb, zt = -p["emp"], p["L"] - p["emp"]
    if i == 0: h.rect(x - 300 * k * 1.6, YG, 600 * k * 1.6, (p["emp"] + 150) * k, "url(#CONC)", K, .8)
    poly(h, [(x - rz(zb) * k * 2, Y(zb)), (x - rz(zt) * k * 2, Y(zt)), (x + rz(zt) * k * 2, Y(zt)), (x + rz(zb) * k * 2, Y(zb))], "url(#MAD)" if not p["e"] else "#fff", 1.4)
    if p["e"]: poly(h, [(x - (rz(zb) - p["e"]) * k * 2, Y(zb)), (x - (rz(zt) - p["e"]) * k * 2, Y(zt)), (x + (rz(zt) - p["e"]) * k * 2, Y(zt)), (x + (rz(zb) - p["e"]) * k * 2, Y(zb))], "none", .5, K, h.OCULTA)
    h.ln(x, Y(zt) - 10, x, Y(zb) + 10, K, .4, h.EJE)
    h.dimV(x - 60, Y(zt), Y(zb), "8.500", ext=x - rz(zt) * k * 2 - 3)
    h.dimV(x - 40, Y(zt), YG, mm(zt), ext=x - rz(zt) * k * 2 - 3)
    h.dimV(x - 40, YG, Y(zb), f"{mm(p['emp'])} (*)", ext=x - rz(zb) * k * 2 - 3, c=OR)
    h.txt(x, Y(zb) + 18, f"{p['cod']} · {p['nom'].upper()}", 10.5, 700, K, "middle")
    h.txt(x, Y(zb) + 31, f"Ø CIMA ≈ {p['dc']} (*) · ITEM {p['item']}", 9, 400, OR, "middle")
    h.txt(x + rz(zt) * k * 2 + 6, Y(zt) + 10, f"Ø{p['dc']}", 9, 700)
    h.globo(str(i + 1), x + 2, Y(3000), x + 80, Y(5500), r=9)
# caño de bajada + fleje en el 6023
x = 130 + 14
h.rect(x, YG - 4000 * k, 5, 4000 * k, "url(#PLAS)", K, .6)
for z in (800, 2000, 3200): h.rect(x - 16, YG - z * k - 2, 26, 4, "#555", K, .3)
h.txt(x + 10, YG - 3500 * k, "CAÑO DE BAJADA + FLEJE (SOLO H°A°)", 8.5, 700, K)
lineaCorte(h, 130 - 30, YG - 1000 * k, 130 + 30, YG - 1000 * k, "A"); lineaCorte(h, 670 - 30, YG - 1000 * k, 670 + 30, YG - 1000 * k, "B")

# ======================= 2. CORTES A-A (H°A°) Y B-B (MADERA), 1:5
h.titulo(40, 545, "A-A · H°A° PRETENSADO", "SECCION ANULAR (IRAM 1605) · ESC. 1:5 · PARED Y ALAMBRES (*)")
p = PS[0]; cx, cy, e = 140, 652, .4
rz0 = (p["dc"] + p["k"] * (p["L"] - p["emp"] - 1000) / 1000) / 2
ring = lambda rr, n=72, cx=cx: [(cx + rr * e * math.cos(2 * math.pi * i / n), cy - rr * e * math.sin(2 * math.pi * i / n)) for i in range(n)]
hatchPoly(h, ring(rz0), "HA", 1.3); poly(h, ring(rz0 - p["e"]), "#fff", 1)
for i in range(12):
    a = 2 * math.pi * i / 12; rr = rz0 - p["e"] / 2
    h.circ(cx + rr * e * math.cos(a), cy - rr * e * math.sin(a), 1.6, "#111", K, 0)
h.dimH(cy + rz0 * e + 18, cx - rz0 * e, cx + rz0 * e, f"Ø≈{round(2 * rz0)} (*)", ext=cy + 6, c=OR)
h.dimV(cx + rz0 * e + 16, cy - rz0 * e, cy - (rz0 - p["e"]) * e, f"{p['e']} (*)", ext=cx + 4, c=OR)
llamada(h, cx + (rz0 - p["e"] / 2) * e, cy, 220, 620, "ALAMBRES DE PRETENSADO (*)", c=OR, sz=8.5)
h.txt(220, 690, "HUECO: PASO DE CABLES", 8.5, 400, G)
h.titulo(470, 545, "B-B · MADERA SALINIZADA", "SECCION LLENA · ESC. 1:5")
p = PS[2]; cx2 = 560; rzm = (p["dc"] + p["k"] * (p["L"] - p["emp"] - 1000) / 1000) / 2
hatchPoly(h, ring(rzm, cx=cx2), "MAD", 1.3)
h.circ(cx2, cy, (rzm - 22) * e, "none", K, .6, 'stroke-dasharray="4 2"')
for rr in (.2, .45, .7): h.circ(cx2, cy, rzm * rr * e, "none", K, .35)
h.dimH(cy + rzm * e + 18, cx2 - rzm * e, cx2 + rzm * e, f"Ø≈{round(2 * rzm)} (*)", ext=cy + 6, c=OR)
llamada(h, cx2 + (rzm - 10) * e, cy - 10, 640, 615, "ALBURA IMPREGNADA (SALES) ≈ 22 (*)", c=OR, sz=8.5)
llamada(h, cx2, cy, 640, 700, "DURAMEN", sz=8.5)

# ======================= TABLAS
TY = 775
yv = tablaD(h, 40, TY, [("CODIGO", "POSTE", "ITEM", "CARGA ROTURA", "EMPOTR. (CALC.)", "PARA QUE"),
        ("6023", "H°A° PRETENSADO Po 8,5", "11.02", "Ro 1050 kg", "1,45 / 0,85 (*)", "RETENCIONES FUERTES Y PUNTAS"),
        ("6501", "H°A° PRETENSADO Po 8,5", "11.01", "Ro 750 kg", "1,45 / 0,85 (*)", "ALINEACION"),
        ("6502", "MADERA EUCALIPTUS SALINIZADO", "11.03", "—", "1,35 (*)", "VA EMPOTRADO DIRECTO")],
        [(54, "c", True), (190, "l", False), (50, "c", True), (100, "c", False), (110, "c", False), (296, "l", False)], "VARIANTES (LP 21478 ANEXO I · EPEC ET 4)")
yc_ = codTabla(h, 40, yv + 18, [6023, 6501, 6502], {6023: "ITEM 11.02", 6501: "ITEM 11.01", 6502: "ITEM 11.03"}, wd=110, rowh=14)
yd = tablaD(h, 40, yc_ + 18, [("DATO", "VALOR"), ("NORMA", "EPEC ET 4 · IRAM 1605 (ANULAR, TRONCOCONICO)"), ("EMPOTR. H-15", "1,45 m EN HOYO Ø0,60 (CALC.) (*)"),
        ("EMPOTR. DIRECTO", "0,85 m EN HOYO Ø0,50 + PIEDRA (*)"), ("Ø CIMA H°A°", "18–20 (Ro 750) · 20–22 (Ro 1050) cm")], [(120, "l", False), (300, "l", False)], "DATOS TECNICOS", rowh=14)
ry = rayadosRef(h, 480, yc_ + 18, ["HA", "MAD", "CONC"], cols=1, dx=180)
notasW(h, 40, max(yd, ry) + 20, [
    "COTAS EN mm. EMPOTRAMIENTOS Y Ø: ESTIMADOS DE LA CALCULADORA (*). LA FICHA DEL 6023 DICE 0,85 m; CON H-15 SE PROPONE 1,45 m: CONFIRMAR CON EPEC.",
    "(*) PARED (50–55), ALAMBRES Y CONICIDAD 15 mm/m: PROPORCIONALES. NO SE ENCONTRO LA ET 4 DE EPEC PUBLICADA. CON H°A° VA CAÑO DE BAJADA + FLEJE."], w=800, lh=13)

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - LOS TRES POSTES AL PIE", "CORTADOS A UN CUARTO: H°A° ANULAR CON ALAMBRES · MADERA CON LA ALBURA IMPREGNADA")
A = img3d(h, "col_apo2", 895, 90, 740)
for cod, x_ in (("6023", 0), ("6501", 1), ("6502", 2)):
    px_, py_ = A("p" + cod); h.txt(px_, 115, cod, 13, 700, NV, "middle", MONO)
columna(h, A, [("e6023", "1", "H°A° Ro 1050 (6023)"), ("alambre", "", "ALAMBRES DE PRETENSADO (*)"), ("h15", "", "H-15 EN HOYO Ø600 (*)"), ("f6023", "", "PIE")], 905, 700, 900, paso=28)
columna(h, A, [("e6501", "2", "H°A° Ro 750 (6501) DIRECTO"), ("e6502", "3", "MADERA SALINIZADA (6502)"), ("f6502", "", "ALBURA IMPREGNADA (*)")], 1300, 700, 900, paso=28)
pie3d(h, "", "RENDER three.js: r3d/escenas/col_apo2.mjs · MISMA GEOMETRIA DEL PLANO · FUENTES: r3d/FUENTES_col.md")
rotuloMat(h, "MAT-APOYOS-2", "POSTES DE 8,5 m", "H°A° Ro 1050 / Ro 750 · MADERA", "ELEVACIONES, CORTES A-A Y B-B, CODIGOS Y 3D", "1:100 / 1:5", "3D S/E", rev="B", fecha="08/11/2026")
guardarCol(h, "mat_apoyos_2")
