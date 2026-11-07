"""MAT-COLUMNA_METALICA-1 · Columna metálica recta 7 m (6006) y 10 m (6005) + caño PVC Ø75 de la acometida (6004).
Datos: FICHAS_TEC.columna_metalica (tabla de tramos de un fabricante de referencia: C 80 / C 110 ASV-4), plano() de la ficha (ETG: SAE 1010,
espesores, empotramiento 1/10, entrada 150 × 76 a ≥ 300 bajo el piso, manguito Ø60,3 × 300, caja a 2,50 m), FAMILIAS_MAT.columna_metalica,
ficha de Normas AP-C-005 (tipos C y F: Ht, empotramiento, Ø del pie, fundación). ORIGINAL v130."""
from ilukit import *
h = nueva(); m = h.m

# ======================= ELEVACIONES (tramos del fabricante de referencia) · k = 0,036 (1:110)
k = .036; YG = 480; ex = 1.6
h.titulo(40, 62, "ELEVACION - COLUMNA RECTA DE TRAMOS", "ESC. 1:110 - COTAS EN mm - Ø 1,6× - TRAMOS DE REF. (*)")
C7 = dict(x=150, HT=8000, EMP=800, tr=[(114, 3200, "3,6"), (90, 2000, "3,2"), (76, 1500, "3,2"), (60, 1300, "3,2")], nom="7 m · 6006", ref="C 80 ASV-4")
C10 = dict(x=355, HT=11000, EMP=1100, tr=[(140, 4200, "4,7"), (114, 3000, "3,6"), (90, 2000, "3,2"), (76, 1800, "3,2")], nom="10 m · 6005", ref="C 110 ASV-4")
h.ln(40, YG, 450, YG, K, 1.4); h.nivel(432, YG, "±0,00")
for xx in range(44, 450, 9): h.ln(xx, YG + 1, xx - 6, YG + 7, K, .4)
for C in (C7, C10):
    x = C["x"]; yb = YG + C["EMP"] * k; z = 0
    for (d, L, e) in C["tr"]:
        r = d / 2 * k * ex; y0 = yb - z * k; y1 = yb - (z + L) * k
        h.rect(x - r, y1, 2 * r, y0 - y1, "#fff", K, 1.3)
        h.txt(x + r + 4 + (14 if C is C7 else 0), (y0 + y1) / 2 + 4, f"Ø{d} × {L:,} (e {e})".replace(",", "."), 9.5, 400, OR)
        z += L
    yt = yb - C["HT"] * k
    h.ln(x, yt - 10, x, yb + 10, K, .4, h.EJE)
    h.dimV(x - 58, yt, yb, f"TOTAL {C['HT']:,}".replace(",", "."), ext=x - 4)
    h.dimV(x - 38, yt, YG, f"LIBRE {C['HT'] - C['EMP']:,}".replace(",", "."), ext=x - 4)
    h.dimV(x - 38, YG, yb, f"{C['EMP']:,}".replace(",", "."), ext=x - 8)
    yc = YG - 2500 * k; h.rect(x - 2.4, yc - 3, 4.8, 6, "#111", K, .4)
    h.dimV(x - 18, yc, YG, "2.500", ext=x - 3)
    yv = YG + 300 * k; h.rect(x - 1.5, yv - 2.7, 3, 5.4, OR, OR, .4)
    h.txt(x, yb + 20, C["nom"], 11, 700, K, "middle"); h.txt(x, yb + 33, C["ref"] + " (REF.) (*)", 9, 400, OR, "middle")
h.globo("1", C7["x"] - 2, YG - 120, 62, 300); h.globo("2", C7["x"] - 2, YG - 2500 * k, 62, 380); h.globo("3", C7["x"], YG + 300 * k, 62, YG + 40, OR)
h.globo("4", C7["x"], YG - 7200 * k, 62, 210)
corteMarca(h, C7["x"] - 24, YG + 300 * k, C7["x"] + 24, YG + 300 * k, "A")

# ======================= D1 · ENTRADA DE CABLE 150 × 76 (1:5 → 0,8 px/mm)
s = .8; X0, Y0 = 520, 120
h.titulo(475, 62, "D1 · ENTRADA DE CABLE Y CAÑO", "CORTE POR EL EJE - ESC. 1:10 (7 m, TRAMO Ø114)")
s = .5; px = 600; ypiso = 150
h.rect(475, ypiso, 360, 12, "url(#CONC)", K, .3)
h.ln(475, ypiso, 835, ypiso, K, 1.4); h.nivel(820, ypiso, "±0,00")
r = 57 * s; e = 3.6 * s
for xx in (px - r, px + r - e): h.rect(xx, 95, e, 317, "#111", K, .3)
h.rect(px - r - 120, ypiso + 12, 120, 250, "url(#EARTH)", K, 0)
h.rect(px + r, ypiso + 12, 240 - r + 0, 250, "url(#EARTH)", K, 0)
yv = ypiso + 300 * s; hv = 150 * s
h.rect(px + r - e - 1, yv - hv / 2, e + 2, hv, "#fff", K, .8)                         # ventana (corte del tubo)
h.ln(px - 30, yv, px + r + 20, yv, K, .4, h.EJE)
# caño PVC Ø75 desde la ventana hacia la zanja (en corte: pared rayada)
rp = 75 / 2 * s
h.path(f"M{px+r},{yv-rp} L{px+225},{yv-rp} M{px+r},{yv+rp} L{px+225},{yv+rp}", "none", K, 1)
h.rect(px + r, yv - rp, 225 - r, 2.5, "url(#PLAS)", K, .5); h.rect(px + r, yv + rp - 2.5, 225 - r, 2.5, "url(#PLAS)", K, .5)
for dy_, col in ((-6, "#111"), (0, "#111"), (6, "#111")):
    h.path(f"M{px+222},{yv+dy_} L{px+r+2},{yv+dy_} Q{px+8},{yv+dy_} {px+6 + dy_},{yv-60} L{px+6+dy_},{95}", "none", col, 1.6)
h.dimV(px + r + 30, yv - hv / 2, yv + hv / 2, "150", ext=px + r + 2)
h.dimV(px - r - 20, ypiso, yv, "MIN. 300", ext=px - r - 2)
h.dimV(px + 238, yv - rp, yv + rp, "Ø75", ext=px + 226)
h.dimH(108, px - r, px + r, "Ø114", ext=120)
h.txt(px + 150, yv + rp + 16, "CAÑO PVC Ø75 (6004) A LA ZANJA", 9.5, 700, K, "middle")
h.txt(px - r - 8, 130, "TRONCAL + 1×10 SUBEN", 9, 700, K, "end")
h.globo("3", px + r, yv - hv / 2 + 6, 700, 235, OR); h.globo("5", px + 200, yv + rp, 790, 380)
h.txt(480, 440, "SUBEN POR ADENTRO HASTA LA CAJA DE 2.500 (AP-CC-001 / 004).", 9.5, 400, G)

# ======================= CORTE A-A por la entrada (1:5)
s = .8; cx, cy = 560, 575
h.titulo(475, 495, "CORTE A-A", "POR LA ENTRADA - ESC. 1:5 - TRAMO Ø114 e 3,6")
R = 57 * s
h.circ(cx, cy, R, "#111", K, 1.2); h.circ(cx, cy, R - 3.6 * s * 1.5, "#fff", K, .6)
a = math.asin(38 / 57)
h.path(f"M{cx + R*math.cos(a):.1f},{cy - R*math.sin(a):.1f} L{cx+R+4},{cy-30} L{cx+R+4},{cy+30} L{cx + R*math.cos(a):.1f},{cy + R*math.sin(a):.1f}", "#fff", "#fff", 0)
h.ln(cx + R * math.cos(a), cy - R * math.sin(a), cx + R * math.cos(a), cy + R * math.sin(a), K, .4, h.OCULTA)
h.dimV(cx + R + 26, cy - 38 * s, cy + 38 * s, "76", ext=cx + R - 2)
h.txt(cx - R - 8, cy + 4, "Ø114", 10.5, 700, K, "end")
h.ln(cx - R - 12, cy, cx + R + 12, cy, K, .4, h.EJE)
# ======================= TABLAS
h.tabla(40, 640, [(62, "c", True), (165, "l", False), (78, "c", True), (78, "c", True), (78, "c", True), (78, "c", True), (251, "l", False)],
        [("CODIGO", "MODELO (AP-C-005)", "Ht", "LIBRE", "EMPOTR.", "Ø PIE", "FUNDACION (AP-TC-003)"),
         ("6006", "TIPO C · 7 m", "7,70 m", "7,00 m", "0,70 m", "114", "0,60 × 0,60 × 0,90"),
         ("6005", "TIPO F · 10 m", "11,00 m", "10,00 m", "1,00 m", "140", "0,60 × 0,60 × 1,20")],
        rowh=20, titulo="VARIANTES (CUADRO DEL PLANO AP-C-005: MANDA SOBRE LA TABLA DEL FABRICANTE)")
y2 = h.codigos(40, 734, [6006, 6005, 6004])
h.datos(40, y2 + 30, [("MATERIAL", "tubo de acero SAE 1010 en tramos"), ("ESPESOR", "≥ 3,2 mm (Ø ≤ 76) · ≥ 4 mm (mayor)"),
        ("ENTRADA", "150 × 76, centro ≥ 300 bajo el piso"),
        ("CAJA CONEXION", "a 2,50 m del piso terminado"), ("MANGUITO", "Ø60,3 × 300 (o Ø42,6 × 150)"),
        ("PAT", "bulón de bronce en la caja + jabalina")], w=410, c1=130)
textoBloque(h, 475, y2 + 30, "DONDE SE USA", [
    "· AP-C-005: columna recta, acometida subt.",
    "   Ítems 1 a 4 (metálica 1/2/3 brazos, 10 m)",
    "   y provisión 83.1 / 83.2.",
    "· AP-TC-003: fundación metálica (cuadro).",
    "· AP-CC-001 (Ø ≤ 114) / AP-CC-004 (Ø140):",
    "   caja; tablerito AP-CC-014 / 015.",
    "· AP-TC-005: PAT, 1 jabalina por columna.",
    "· Calculadora: subida = altura − 2,50 + ...",
    "   ganancia del troncal 5 m por subida."])
h.notas(40, 1040, [
    "COTAS EN mm. Ht ES LO QUE SE PIDE AL FABRICANTE; EL PLIEGO HABLA DE ALTURA LIBRE: NO MEZCLARLAS.",
    "(*) LOS TRAMOS SON DE UN FABRICANTE DE REFERENCIA (Ht 8,0 / 11,0); EL AP-C-005 PIDE 7,70 / 11,00: MANDA EL PLANO.",
    "(*) EMPOTRAMIENTO: ETG 1/10 (0,70 / 1,00) · TABLA DEL FABRICANTE 0,8 / 1,1: A CONFIRMAR CON EL PROVEEDOR.",
    "6004 SE PIDE EN METROS: DE LA ENTRADA A LA ZANJA. LA COLUMNA NUEVA TRAE EL BULON PAT EN LA CAJA.",
    "FUENTE: ETG MUNICIPALIDAD DE CORDOBA (2014), PLANO AP-C-005 (D.G.A.P. 2022), BAEL (COLUMNAS DE TRAMOS)."])

# ======================= 3D: COLUMNA 7 m EN SU LUGAR
h.titulo(890, 62, "VISTA 3D - COLUMNA METALICA 7 m EN SU LUGAR", "GALVANIZADA EN CALIENTE (*) · FUNDACION CORTADA A UN CUARTO · CAÑO PVC Ø75")
h.iso(.08, 1000, 840)
B = 300
m.box(-B, 0, -B, B, -900, 0, "hormigon", pat="conc3", edge="#6d7277"); m.box(0, B, -B, 0, -900, 0, "hormigon", pat="conc3", edge="#6d7277")
m.render()
ringZ(m, 57 - 3.6, 57, -700, 0, "galv", bias=60); m.render()
m.cyl([0, 300 + 400, -300], [0, 50, -300], 37.5, "pvc", n=20, seg=6, bias=300); m.render()
for (gx0, gx1, gy0, gy1) in ((-B - 260, -B, -B - 260, B + 260), (-B, B + 260, -B - 260, -B)):
    m.box(gx0, gx1, gy0, gy1, -50, 0, "#c9c3b8", pat="concP3", edge="#8a857a")
m.render()
z = -700
for (d, L, e) in C7["tr"]:
    z0 = max(z, 0); z1 = z + L
    if z1 > 0: m.cyl([0, 0, z0], [0, 0, z1], d / 2, "galv", n=30, seg=8, capmat="#8d98a2"); m.render()
    z = z1
ventanaZ(m, 57, 45, 1800, 76, 100, "#20242a"); m.render()                 # tapa de la caja a 2,50 m del piso (*)
m.cyl([0, 0, 7300], [0, 0, 7600], 30.15, "galv", n=20, capmat="#8d98a2"); m.render()
h.g3("4", (0, 0, 7450), 1110, 260, "MANGUITO Ø60,3 × 300")
h.g3("1", (0, 0, 5400), 1110, 300, "COLUMNA METALICA 7 m (6006)")
h.g3("2", (40, 40, 1800), 1110, 560, "CAJA DE CONEXION A 2.500 (*)")
h.g3("3", (0, 60, -300), 1110, 800, "ENTRADA 150 × 76 (≥ 300 BAJO PISO)", OR)
h.g3("5", (0, 400, -300), 1110, 840, "CAÑO PVC Ø75 A LA ZANJA (6004)")
h.g3("6", (-150, 300, -500), 1110, 880, "FUNDACION 0,60 × 0,60 × 0,90")
# ampliado de la base: tramo Ø114 cortado a un cuarto, ventana y caño
h.titulo(1400, 380, "AMPLIADO: ENTRADA", "TUBO Ø114 CORTADO A UN CUARTO")
h.iso(.42, 1540, 640)
ringZ(m, 57 - 3.6, 57, -500, 200, "galv", a0=90, a1=360, bias=0); m.render()
for i, col in enumerate(("negro", "negro", "verde")):
    dy_ = (i - 1) * 14
    m.cyl([0, 330, -300 + dy_ * .2], [dy_, 12, -300], 6, col, n=10, seg=3, bias=40)
    m.cyl([dy_, 12, -300], [dy_, 0, 150], 6, col, n=10, seg=4, bias=40)
m.render()
m.cyl([0, 330, -300], [0, 57, -300], 37.5, "pvc", n=24, seg=3, bias=20); m.render()
m.render()
h.g3("3", (0, 57, -300 + 75), 1620, 520, "", OR); h.g3("5", (0, 250, -300), 1620, 760, "")
h.txt(1420, 880, "CABLES: TRONCAL (NEGRO) Y 1×10 PE", 10, 400, G, "start", INT)
h.rotulo(890, h.H - 150, 750, "MAT-COLUMNA_METALICA-1", "COLUMNA METALICA RECTA", "7 m (6006) · 10 m (6005)", "ELEVACION, ENTRADA, CORTE, DATOS Y 3D + CAÑO 6004",
         "1:110 / 1:10", "A-A 1:5 · 3D S/E")
guardar(h, "mat_columna_metalica_1")
