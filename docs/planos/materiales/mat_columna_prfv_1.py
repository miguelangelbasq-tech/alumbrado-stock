"""MAT-COLUMNA_PRFV-1 (rev. B) · Columna PRFV recta 7 m (6008) y 10 m (6007), AP-C-033-A / B.
Geometría: r3d/piezas/perfiles_col.mjs (PRFV) → perfiles_col.json; 3D: r3d/out/col_prfv_cajas.png y col_prfv_base.png.
Datos: FICHAS_TEC.columna_prfv / FAMILIAS_MAT (ORIGINAL v130): LT, LE, Ø base y cima, buje Ø90/76, adaptador Ø114, cajas IP54 95×160×87 a 3,50 m,
acceso 85×150, placa B 80×130, «C» a 350 de la base, placa de características 100×100 (LC), cargas; CLAUDE §11.3 (fundación 0,60×0,60×1,20,
molde Ø base + 50, arena, sello 50, desagüe Ø25,4, telgopor). Lo que no está: naranja (*). Fuentes: r3d/FUENTES_col.md"""
from colkit import *

h = nueva3()
c7, c10, P = PRFV["c7"], PRFV["c10"], PRFV
def rz(c, z): return (c["DEB"] + (c["DEC"] - c["DEB"]) * (z + c["LE"]) / c["LT"]) / 2

# ======================= 1. ELEVACIONES 7 m Y 10 m (1:110, Ø ×2,2)
k = .036; YG = 470; X = {"c7": 115, "c10": 290}
h.titulo(40, 62, "ELEVACIONES", "ESC. 1:110 · Ø DIBUJADOS 2,2× · z DESDE EL PISO")
suelo(h, 40, 340, YG); h.nivel(190, YG, "±0,00")
for key, c in (("c7", c7), ("c10", c10)):
    x = X[key]; zb, zt = -c["LE"], c["LT"] - c["LE"]; Y = lambda z: YG - z * k; E = 2.2 * k
    poly(h, [(x - rz(c, zb) * E, Y(zb)), (x - rz(c, zt) * E, Y(zt)), (x + rz(c, zt) * E, Y(zt)), (x + rz(c, zb) * E, Y(zb))], "#fff", 1.4)
    B = c["buje"]; h.rect(x - B["De"] / 2 * E * .9, Y(zt + B["sobre"]), B["De"] * E * .9, B["sobre"] * k, "url(#PLAS)" if B["Di"] else "url(#MET)", K, .9)
    h.ln(x, Y(zt + B["sobre"]) - 8, x, Y(zb) + 8, K, .4, h.EJE)
    for zc in c["cajas"]: h.rect(x - 2.8, Y(zc) - 3.2, 5.6, 6.4, "#111", K, .4)
    h.rect(x + 2, Y(zb + c["LC"]) - 2, 4, 4, "#fff", K, .6)
    h.rect(x - rz(c, zb + c["C"]) * E - 1, Y(zb + c["C"]) - 3, 3, 6, OR, OR, .3)
    h.dimV(x - 58, Y(zt), Y(zb), f"LT {mm(c['LT'])}", ext=x - rz(c, zt) * E - 3)
    h.dimV(x - 38, Y(zt), YG, f"LL {mm(c['LT'] - c['LE'])}", ext=x - rz(c, zt) * E - 3)
    h.dimV(x - 38, YG, Y(zb), mm(c["LE"]), ext=x - rz(c, zb) * E - 3)
    h.dimV(x + 40, Y(c["cajas"][0]), YG, mm(c["cajas"][0]), ext=x + 4)
    h.dimV(x + 56, Y(c["cajas"][1]), Y(c["cajas"][0]), "500", ext=x + 4)
    h.dimV(x + 24, Y(zb + c["LC"]), YG, mm(c["LC"] - c["LE"]), ext=x + 6)
    h.txt(x, Y(zb) + 16, f"Ø{c['DEB']}", 10.5, 700, K, "middle"); h.txt(x + 8, Y(zt) + 12, f"Ø{c['DEC']}", 10, 700)
    h.txt(x + 8, Y(zt + B["sobre"]) - 2, f"Ø{B['De']}" + (f"/{B['Di']}" if B["Di"] else ""), 9.5, 700)
    h.txt(x, Y(zb) + 30, f"{'7 m · 6008' if key == 'c7' else '10 m · 6007'}", 11, 700, K, "middle")
x = X["c7"]; Y = lambda z: YG - z * k
lineaCorte(h, x - 26, Y(3500), x + 16, Y(3500), "A")
h.globo("1", x + 2, Y(1500), 52, 300, r=9); h.globo("2", x + 2, Y(3500), 52, 250, r=9); h.globo("3", x, Y(7300), 52, 140, r=9)
h.globo("4", x + 4, Y(1800), 52, 345, r=9); h.globo("5", x - 4, Y(-650), 52, 515, OR, r=9)

# ======================= 2. CORTE A-A POR LA CAJA DE ABAJO (1:2,5)
e = .62; cx, cy = 470, 210
h.titulo(360, 62, "CORTE A-A", "POR LA CAJA DE ABAJO (z 3.500) · ESC. 1:2,5")
R1 = rz(c7, 3500); ri = R1 - c7["e"]; Cj = P["caja"]; Tp = P["tapa"]
# pared del poste con la ventana de 85 (anillo rayado PRFV, cortado en la ventana)
a = math.degrees(math.asin(Cj["acc"][0] / 2 / R1))
def arco(r, a0, a1, n=60): return [(cx + r * e * math.cos(math.radians(t)), cy - r * e * math.sin(math.radians(t))) for t in [a0 + (a1 - a0) * i / n for i in range(n + 1)]]
pa = arco(R1, -90 + a, 270 - a) + arco(ri, 270 - a, -90 + a)[::1]
hatchPoly(h, arco(R1, -90 + a, 270 - a) + list(reversed(arco(ri, -90 + a, 270 - a))), "PRFV", 1.2)
# caja 95 × 87 empotrada (fondo hacia adentro), placa B, riel, bornes
yf = cy + R1 * e - Cj["f"] * e + 6 * e
h.rect(cx - Cj["w"] / 2 * e, yf, Cj["w"] * e, Cj["f"] * e - 4, "none", K, 1.0)
h.rect(cx - Cj["w"] / 2 * e + 1.5, yf + 1.5, Cj["w"] * e - 3, Cj["f"] * e - 7, "none", K, .5)
h.rect(cx - 40 * e, yf + 2.5, 80 * e, 1.6, "url(#MET)", K, .4)
h.rect(cx - 37 * e, yf + 4, 74 * e, 7.5 * e, "url(#MET)", K, .5)
for i in range(5): h.rect(cx - 22 * e + i * 8.6 * e, yf + 4 + 7.5 * e, 8.2 * e, 41 * e, "#fff", K, .5)
# tapa afuera con junta y 2 tornillos visibles
yt = cy + R1 * e
h.rect(cx - Tp["w"] / 2 * e, yt, Tp["w"] * e, Tp["e"] * e, "url(#PRFV)", K, .9)
h.rect(cx - (Tp["w"] / 2 - 6) * e, yt - 2 * e, (Tp["w"] - 12) * e, 2 * e, "url(#GOMA)", K, .3)
for s in (-1, 1): h.rect(cx + s * Tp["dx"] * e - 2, yt - 10, 4, 10 + Tp["e"] * e + 3, "#fff", K, .6); h.rect(cx + s * Tp["dx"] * e - 4, yt + Tp["e"] * e, 8, 3, "#fff", K, .6)
h.ln(cx - R1 * e - 12, cy, cx + R1 * e + 12, cy, K, .4, h.EJE); h.ln(cx, cy - R1 * e - 12, cx, yt + 16, K, .4, h.EJE)
h.dimH(cy - R1 * e - 16, cx - R1 * e, cx + R1 * e, f"Ø{mm(round(2 * R1))} (*)", ext=cy - 10, c=OR)
h.dimH(yt + 26, cx - Tp["w"] / 2 * e, cx + Tp["w"] / 2 * e, f"TAPA {Tp['w']} (*)", ext=yt + 4, c=OR)
h.dimV(cx + R1 * e + 22, yf, yt, str(Cj["f"]), ext=cx + Cj["w"] / 2 * e + 2)
h.dimH(yf - 8, cx - Cj["w"] / 2 * e, cx + Cj["w"] / 2 * e, str(Cj["w"]), ext=yf)
llamada(h, *(cx - R1 * e * .7, cy - R1 * e * .7), 372, 112, f"PARED e {c7['e']} (*)", c=OR, sz=9)
h.globo("6", cx - 18, yf + 30, 380, 260, r=9); h.globo("7", cx + 30, yt + 2, 612, 268, r=9); h.globo("8", cx + 25 * e, yf + 4 + 25 * e, 575, 120, r=9)
h.globo("9", cx + Tp["dx"] * e, yt + 3, 612, 295, r=9)

# ======================= 3. D1 · VENTANA, CAJA Y TAPA (frente, 1:2,5)
h.titulo(620, 62, "D1 · VENTANA Y CAJA", "FRENTE SIN TAPA · ESC. 1:2,5")
fx, fy = 720, 215
h.rect(fx - Cj["w"] / 2 * e, fy - Cj["h"] / 2 * e, Cj["w"] * e, Cj["h"] * e, "none", K, .7, h.OCULTA)
h.path(f"M{fx-42.5*e+6},{fy-75*e} H{fx+42.5*e-6} Q{fx+42.5*e},{fy-75*e} {fx+42.5*e},{fy-75*e+6} V{fy+75*e-6} Q{fx+42.5*e},{fy+75*e} {fx+42.5*e-6},{fy+75*e} H{fx-42.5*e+6} Q{fx-42.5*e},{fy+75*e} {fx-42.5*e},{fy+75*e-6} V{fy-75*e+6} Q{fx-42.5*e},{fy-75*e} {fx-42.5*e+6},{fy-75*e} Z", "#fff", K, 1.3)
h.rect(fx - 40 * e, fy - 65 * e, 80 * e, 130 * e, "url(#MET)", K, .5)
h.rect(fx - 37 * e, fy - 17.5 * e, 74 * e, 35 * e, "#fff", K, .6)
for i, t in enumerate(("L", "L", "L", "N", "PE")):
    xx = fx - 22 * e + i * 8.6 * e; h.rect(xx, fy - 26 * e, 8.2 * e, 52 * e, "#fff", K, .6)
    for zz in (-15, 15): h.circ(xx + 4.1 * e, fy + zz * e, 2.4 * e, "#fff", K, .5)
for s in (-1, 1):
    for t in (-1, 1): h.circ(fx + s * Tp["dx"] * e, fy + t * Tp["dz"] * e, 2.2, "#fff", K, .7); h.ln(fx + s * Tp["dx"] * e - 2, fy + t * Tp["dz"] * e, fx + s * Tp["dx"] * e + 2, fy + t * Tp["dz"] * e, K, .5)
h.rect(fx - Tp["w"] / 2 * e, fy - Tp["h"] / 2 * e, Tp["w"] * e, Tp["h"] * e, "none", OR, .8, 'stroke-dasharray="6 2 1.5 2"')
h.dimH(fy - Tp["h"] / 2 * e - 12, fx - 42.5 * e, fx + 42.5 * e, "85", ext=fy - 75 * e)
h.dimV(fx + Tp["w"] / 2 * e + 16, fy - 75 * e, fy + 75 * e, "150", ext=fx + 42.5 * e + 2)
h.dimV(fx - Tp["w"] / 2 * e - 14, fy - Cj["h"] / 2 * e, fy + Cj["h"] / 2 * e, "160", ext=fx - Cj["w"] / 2 * e - 2)
h.txt(fx, fy + Tp["h"] / 2 * e + 16, "TAPA 105 × 172 · 4 TORN. M5 (*)", 9, 400, OR, "middle")
h.txt(fx, fy + Tp["h"] / 2 * e + 28, "PLACA B 80 × 130 · RIEL NS35", 9, 400, G, "middle")

# ======================= 4. D2 · BASE EN LA FUNDACION (corte por el eje, 1:12,5)
q = .16; bx, by = 405, 392      # by = nivel del piso
F = P["fund7"]
h.titulo(360, 330, "D2 · BASE EN LA FUNDACION (7 m)", "CORTE POR EL EJE · ESC. 1:12,5 · AP-TC-003-A")
X0 = lambda y: bx + y * q; Yz = lambda z: by - z * q
h.rect(X0(-F["a"] / 2), Yz(0), F["a"] * q, F["h"] * q, "url(#CONC)", K, 1.2)
h.rect(X0(-F["molde"] / 2), Yz(0), F["molde"] * q, F["h"] * q, "url(#SAND)", K, .8)
for s in (-1, 1): h.rect(X0(s * F["molde"] / 2) - (1.5 if s > 0 else 0), Yz(0), 1.5, F["h"] * q, "#111", K, .2)
h.rect(X0(-F["molde"] / 2), Yz(0), F["molde"] * q, F["sello"] * q, "url(#CONCP)", K, .6)
zb = -c7["LE"]
for s in (-1, 1):
    poly(h, [(X0(s * rz(c7, zb)), Yz(zb)), (X0(s * rz(c7, 0)), Yz(0) - 0), (X0(s * rz(c7, 0)), Yz(150)), (X0(s * (rz(c7, 150) - c7["e"] * 2)), Yz(150)), (X0(s * (rz(c7, zb) - c7["e"] * 2)), Yz(zb))], "url(#PRFV)", .9)
h.rect(X0(-rz(c7, zb) + 4), Yz(zb), (2 * rz(c7, zb) - 8) * q, 2.2, "#111", K, .2)
h.rect(X0(-12.7), Yz(zb), 25.4 * q, (F["h"] + zb + 120) * q, "#fff", K, .6)
zc = zb + c7["C"]
h.rect(X0(-F["a"] / 2) - 30, Yz(zc + 75), (F["a"] / 2 - F["molde"] / 2) * q + 30, 150 * q, "url(#TELG)", K, .6)
h.rect(X0(-F["a"] / 2) - 30, Yz(zc + 30), (F["a"] / 2 - rz(c7, zc) + 2 * c7["e"]) * q + 30, 60 * q, "#fff", K, .5)
h.path(f"M{X0(-F['a']/2)-30:.1f},{Yz(zc):.1f} L{X0(-rz(c7, zc))-2:.1f},{Yz(zc):.1f} Q{X0(-30):.1f},{Yz(zc):.1f} {X0(-30):.1f},{Yz(zc+120):.1f} L{X0(-30):.1f},{Yz(150):.1f}", "none", K, 2.2)
suelo(h, X0(-F["a"] / 2) - 40, X0(F["a"] / 2) + 40, by, False)
h.rect(X0(-F["a"] / 2) - 40, by, 10, F["h"] * q, "url(#EARTH)", K, 0)
h.ln(bx, Yz(250), bx, Yz(-F["h"] - 150), K, .4, h.EJE)
h.dimH(Yz(-F["h"]) + 14, X0(-F["a"] / 2), X0(F["a"] / 2), "600", ext=Yz(-F["h"]))
h.dimV(X0(F["a"] / 2) + 50, Yz(0), Yz(-F["h"]), "1.200", ext=X0(F["a"] / 2) + 2)
h.dimV(X0(F["a"] / 2) + 30, Yz(zb), Yz(-F["h"]), "200", ext=X0(12.7))
h.dimV(X0(rz(c7, zb)) + 16, Yz(zc), Yz(zb), "350", ext=X0(rz(c7, zb)))
h.dimH(Yz(150) - 6, X0(-F["molde"] / 2), X0(F["molde"] / 2), "Ø247", ext=Yz(0))
for t, (yy, zz), (tx, ty) in [("SELLO 50 (H° POBRE)", (80, -25), (500, 380)), ("ARENA SECA", (110, -300), (500, 440)), ("MOLDE PVC Ø247", (F["molde"] / 2, -900), (500, 455)),
                              ("BOCA «C»", (-rz(c7, zc), zc), (500, 500)), ("CANAL TELGOPOR (*)", (-250, zc + 50), (500, 515)),
                              ("TAPA BASE + DESAGÜE (*)", (0, zb), (500, 560))]:
    llamada(h, X0(yy), Yz(zz), tx, ty, t, c=OR if "(*)" in t else K, sz=8.5)
h.txt(X0(-F["a"] / 2) - 34, Yz(zc) - 5, "TRONCAL", 8, 700, K, "start")

# ======================= 5. D3 · CIMA: BUJE Ø90/76 Y ADAPTADOR Ø114 (1:10)
h.titulo(640, 330, "D3 · CIMA", "BUJE (7 m) · ADAPTADOR (10 m) · ESC. 1:12,5")
for (xc, c, rell) in ((690, c7, "PLAS"), (790, c10, "MET")):
    B = c["buje"]; yc = 470; ri_ = c["DEC"] / 2 - c["e"]
    for s in (-1, 1):
        poly(h, [(xc + s * c["DEC"] / 2 * q, yc + 70), (xc + s * c["DEC"] / 2 * q, yc), (xc + s * ri_ * q, yc), (xc + s * ri_ * q, yc + 70)], "url(#PRFV)", .9)
        bi = (B["Di"] or B["De"] - 8) / 2
        poly(h, [(xc + s * B["De"] / 2 * q, yc + B["dentro"] * q), (xc + s * B["De"] / 2 * q, yc - B["sobre"] * q), (xc + s * bi * q, yc - B["sobre"] * q), (xc + s * bi * q, yc + B["dentro"] * q)], f"url(#{rell})", .8)
    h.ln(xc, yc - B["sobre"] * q - 8, xc, yc + 74, K, .4, h.EJE)
    h.dimV(xc - 34, yc - B["sobre"] * q, yc, str(B["sobre"]), ext=xc - B["De"] / 2 * q - 2)
    h.dimV(xc - 34, yc, yc + B["dentro"] * q, str(B["dentro"]), ext=xc - B["De"] / 2 * q - 2)
    h.txt(xc, yc - B["sobre"] * q - 12, f"Ø{B['De']}" + (f"/{B['Di']}" if B["Di"] else ""), 9.5, 700, K, "middle")
    h.txt(xc + c["DEC"] / 2 * q + 4, yc + 12, f"Ø{c['DEC']}", 9, 700)
    h.txt(xc, yc + 88, "7 m" if c is c7 else "10 m", 10, 700, K, "middle")
h.txt(640, 590, "MATERIAL DEL BUJE (*)", 8.5, 400, OR)

# ======================= TABLAS
TY = 630
yv = tablaD(h, 40, TY, [("COD.", "MODELO", "LT", "LL", "EMPOTR.", "Ø BASE", "Ø CIMA", "CAJAS", "PARED", "PESO"),
        ("6008", "7 m · AP-C-033-A", "8.000", "7.000", "1.000", "197", "122", "3.500", "5 (*)", "41 kg + buje"),
        ("6007", "10 m · AP-C-033-B", "11.100", "10.000", "1.100", "353", "180", "3.500", "4,8", "107 kg")],
        [(44, "c", True), (124, "l", False), (60, "c", True), (60, "c", True), (60, "c", True), (60, "c", True), (60, "c", True), (60, "c", True), (60, "c", True), (102, "c", False)],
        "VARIANTES (FICHA TECNICA · mm · CAJAS DESDE EL PISO)")
yc_ = codTabla(h, 40, yv + 22, [6008, 6007], {6008: "ITEMS 5-7 · PROV. 84.1", 6007: "ITEM 8 · PROV. 84.2"}, wd=170)
yd = tablaD(h, 40, yc_ + 22, [("DATO", "VALOR"), ("NORMA / COLOR", "IRAM 13901 · GRIS RAL 7043"), ("CONICIDAD", "7 m ≈ 9,4 mm/m · 10 m ≈ 15,6 mm/m"),
        ("CAJAS (2)", "IP54 95 × 160 × 87 · ACCESO 85 × 150"), ("TAPA", "PRFV 105 × 172 + JUNTA + 4 M5 INOX (*)"),
        ("ENTRADA «C»", "350 DE LA BASE (650 BAJO EL PISO)"), ("PLACA CARACT.", "100 × 100 A 1.800 DEL PISO"), ("CARGA", "TRABAJO 65 kgf · ROTURA 130 kgf · FS 2"),
        ("DEFLEXION", "10 % LL = 700 / 1.000")], [(110, "l", False), (300, "l", False)], "DATOS TECNICOS", rowh=14)
ry = rayadosRef(h, 470, yc_ + 22, ["PRFV", "PLAS", "MET", "CONC", "SAND", "CONCP", "TELG", "GOMA", "EARTH"], cols=2, dx=180)
yu = bloque(h, 470, ry + 8, "DONDE SE USA", [
    "AP-C-033-A / B: ITEMS 5-8 Y PROVISION 84.1 / 84.2.",
    "AP-TC-003-A: FUNDACION CON MOLDE, ARENA Y TELGOPOR.",
    "TC-PRFV-01 / 02: LO QUE VA EN LAS 2 CAJAS.",
    "VINCULOS AP-C-008 / 034 SOBRE EL BUJE (MAT-VINCULOS-1).",
    "SUBIDA 3×1,5 = ALTURA − 3,50 + BRAZO + 0,60."], w=420, sz=9.5, lh=12)
notasW(h, 40, max(yd, yu) + 20, [
    "COTAS EN mm. LT, LE, Ø, CAJAS, ACCESO, PLACA, «C» Y CARGAS: FICHA AP-C-033-A / B (D.G.A.P. 06/2026). Ø EN LA CAJA (155) INTERPOLADO.",
    "ENTRE LAS DOS CAJAS VA SOLO EL CABLE 4×4 XLPE, SIN CAÑO (EL PLANO DIBUJA CAÑO: EN OBRA NO SE PONE).",
    "(*) PARED DEL 7 m, TAPA DE LA VENTANA, TORNILLOS, BOCA «C» (60 × 150), TAPA DE LA BASE Y MATERIAL DEL BUJE: A CONFIRMAR CON EL FABRICANTE.",
    "(*) LA FICHA DEL 10 m ROTULA «LC = 4600» A LA LINEA DE CAJA (ES LB). NO SE ENCONTRO FICHA PUBLICA DE OTEK / PETROPLAST CON LA VENTANA."], w=800, lh=13.5)

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - COLUMNA PRFV 7 m (6008)", "ARRIBA: CAJAS A 3,50 m (LA DE ABAJO CON LA TAPA AFUERA) Y CIMA · ABAJO: BASE EN LA FUNDACION CORTADA A UN CUARTO")
A = img3d(h, "col_prfv_cajas", 895, 88, 355)
columna(h, A, [("fibra", "1", "PRFV RAL 7043 (VETA)"), ("cajaArriba", "", "CAJA DE ARRIBA (FUSIBLES)"), ("bornes", "8", "BORNES BPN EN PLACA B"),
               ("cajaAbajo", "6", "CAJA IP54 95 × 160 × 87"), ("tapa", "7", "TAPA PRFV + JUNTA (*)"), ("tornillo", "9", "TORNILLO INOX M5 (*)"),
               ("buje", "3", "BUJE Ø90/76"), ("cima", "", "CIMA Ø122")], 1290, 110, 500, paso=26)
B_ = img3d(h, "col_prfv_base", 920, 520, 330)
columna(h, B_, [("poste", "1", "POSTE PRFV"), ("sello", "", "SELLO 50"), ("molde", "", "MOLDE PVC Ø247"), ("arena", "", "ARENA SECA"),
                ("telgopor", "", "CANAL DE TELGOPOR (*)"), ("C", "5", "BOCA «C» (350 DE LA BASE)"), ("troncal", "", "TRONCAL Cu 4×4"), ("pe", "", "PE 1×10 V/A"),
                ("horm", "", "HORMIGON H-13 600×600×1200"), ("tapaBase", "", "TAPA DE LA BASE (*)"), ("desague", "", "DESAGÜE Ø25,4")], 1290, 560, 995, paso=26)
pie3d(h, "", "RENDER three.js: r3d/escenas/col_prfv_cajas.mjs y col_prfv_base.mjs · MISMA GEOMETRIA DEL PLANO · FUENTES: r3d/FUENTES_col.md")
rotuloMat(h, "MAT-COLUMNA_PRFV-1", "COLUMNA PRFV RECTA", "7 m (6008) Y 10 m (6007)", "ELEVACIONES, CORTE A-A, D1, D2, D3 Y 3D",
          "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardarCol(h, "mat_columna_prfv_1")
