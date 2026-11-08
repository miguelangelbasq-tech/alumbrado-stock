"""MAT-CAJA_COLUMNA-2 (rev. B) · Fondos y tableritos de columna con riel (3009, 3010, 3011, 6009) y tablerito PRFV 80 × 130 (sin código).
Plano con FONDOS de r3d/piezas/perfiles_protab.mjs + perfiles del piloto (NS35, TAB, BPN); 3D: r3d/out/protab_cc2.png (3011 armado) y protab_cc2_prfv.png (los fondos).
Datos: FICHAS_TEC.caja_columna pieza 2 (medidas por código; tablerito PRFV 80 × 130; acrílico ETG 16.1), AP-CC-014 (chapa galvanizada, riel NS35 + 2 tornillos
cabeza tanque 6 × 3/8, BPN, bases portafusible, bulón de PAT), AP-C-033-A (placa A fija 120 × 145 con roscas Ø6 · placa B móvil 80 × 130), TC-PRFV-01/02."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from protabkit import *

F = PT["FONDOS"]; TAB, BPN = PERF["TAB"], PERF["BPN"]
h = nueva3()

# =============== PLANTAS DE LOS FONDOS ===============
h.titulo(40, 62, "PLANTAS DE LOS FONDOS (MISMA ESCALA)", "ESC. 1:1 · COTAS EN mm · RIEL NS35 Y AGUJEROS DE FIJACION (*)")
e = 1.05; y = 112
def riel_planta(x0, x1, zc, X, Z):
    h.rect(X(x0), Z(zc + 17.5), (x1 - x0) * e, 35 * e, "#fff", K, .7)
    h.ln(X(x0), Z(zc + 12.5), X(x1), Z(zc + 12.5), K, .4); h.ln(X(x0), Z(zc - 12.5), X(x1), Z(zc - 12.5), K, .4)
    xx = x0 + 12.5
    while xx + 7.5 < x1 - 2: h.rect(X(xx - 7.5), Z(zc + 3.1), 15 * e, 6.2 * e, "#fff", K, .4, 'rx="3"'); xx += 25
for cod, k, nota, fill in (("3009", "f3009", "CON RIEL (UN. «m» (*))", "url(#MET)"), ("3010", "f3010", "CHAPA NEGRA", "url(#ANSI37)"), ("3011", "f3011", "GALVANIZADA · AP-CC-014", "url(#MET)")):
    f = F[k]; x = 76
    X = lambda q, x=x: x + q * e; Z = lambda q, y=y, f=f: y + (f["H"] - q) * e
    h.rect(X(0), Z(f["H"]), f["W"] * e, f["H"] * e, fill, K, 1.4)
    for xx in (8, f["W"] - 8): h.circ(X(xx), Z(f["H"] / 2), F["agujero"] / 2 * e, "#fff", K, .7)
    if cod in ("3009", "3011"): riel_planta(20, f["W"] - 20, f["H"] / 2, X, Z)
    h.dimH(Z(0) + 14, X(0), X(f["W"]), str(f["W"]), ext=Z(0) + 2); h.dimV(X(0) - 14, Z(f["H"]), Z(0), str(f["H"]), ext=X(0) - 2)
    h.txt(X(f["W"]) + 12, Z(f["H"]) + 14, cod, 12, 700, K, "start", MONO); h.txt(X(f["W"]) + 12, Z(f["H"]) + 30, nota, 9, 400, OR if "(*)" in nota else K)
    h.txt(X(f["W"]) + 12, Z(f["H"]) + 44, "e = 2 mm", 9, 400)
    y += f["H"] * e + 40
# 6009 y tablerito PRFV (verticales)
for (cod, k, x0, nota) in (("6009", "f6009", 470, "70 x 165 · ESPESOR (*)"), ("PRFV", "prfv", 600, "80 x 130 · SIN CODIGO")):
    f = F[k]; X = lambda q, x0=x0: x0 + q * e; Z = lambda q, f=f: 150 + (f["H"] - q) * e
    h.rect(X(0), Z(f["H"]), f["W"] * e, f["H"] * e, "url(#PRFV)" if k == "prfv" else "url(#MET)", K, 1.4, 'rx="4"' if k == "prfv" else "")
    for zz in (8, f["H"] - 8): h.circ(X(f["W"] / 2), Z(zz), F["agujero"] / 2 * e, "#fff", K, .7)
    h.dimH(Z(0) + 14, X(0), X(f["W"]), str(f["W"]), ext=Z(0) + 2); h.dimV(X(f["W"]) + 14, Z(f["H"]), Z(0), str(f["H"]), ext=X(f["W"]) + 2)
    h.txt(X(0), Z(f["H"]) - 12, cod, 12, 700, K, "start", MONO); h.txt(X(0), Z(0) + 32, nota, 8.5, 400, OR if "(*)" in nota or "SIN" in nota else K)
h.txt(600, 360, "PLACA B MOVIL (AP-C-033-A)", 8.5, 400); h.txt(470, 374, "RIEL Y AGUJEROS EN 6009 / PRFV: (*)", 8.5, 400, OR)

# =============== CORTE A-A DEL 3011 ARMADO ===============
CX, CY = 470, 410
h.titulo(CX, CY, "CORTE A-A - 3011 ARMADO", "ESC. 2:1 · CON EL ACRILICO (ETG 16.1)")
f = F["f3011"]; ec = 2.0; vc = Vista(h, CX + 40, CY + 240, ec); zm = f["H"] / 2
vc.rect(-2, 0, 0, f["H"], "url(#MET)", 1.2)
vc.poly([[w - 7.5 + 7.5, zm - 17.5 + u] for u, w in PERF["NS35"]["perfil"]], "url(#MET)", .8)
vc.poly([[y_ + 7.5, z_ + zm - TAB["zM"]] for y_, z_ in TAB["lado"]], "#fff", 1.2)
vc.poly([[z_ + 7.5, y_ + zm - 26.5] for y_, z_ in BPN["contorno"]], "none", .6, K, h.OCULTA)
vc.rect(85, 88, -5, f["H"] + 5, "url(#VID)", 1.0)
vc.oculta([[0, zm - 3.5], [85, zm - 3.5], [85, zm + 3.5], [0, zm + 3.5]], .5)
vc.rect(-2, 10, zm - 4, zm + 4, "none", .5)
vc.cotaH(0, 85, -26, "85 (*)", zext=0, c=OR); vc.cotaV(-14, 0, f["H"], "95", yext=-3)
vc.cotaH(-2, 0, -12, "2", zext=-1)
for t, (yy, zz), (tx, ty) in [("CHAPA GALV. 2", (-1, 20), (CX + 2, CY + 268)), ("RIEL NS35", (4, zm + 14), (CX + 2, CY + 54)), ("TABAQUERA (EN VISTA)", (40, zm + 25), (CX + 150, CY + 54)),
                             ("BPN (OCULTO)", (40, zm - 20), (CX + 160, CY + 268)), ("ACRILICO (*)", (86.5, zm + 30), (CX + 250, CY + 100)), ("SEPARADOR (*)", (60, zm), (CX + 250, CY + 190))]:
    a = vc.p(yy, zz); llamada(h, a[0], a[1], tx, ty, t, sz=8.5)

# =============== TABLA ===============
dd = {"3009": "220 x 75 x 2 · C/RIEL", "3010": "220 x 80 x 2 · NEGRA", "3011": "230 x 95 x 2 · GALV.", "6009": "70 x 165"}
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "MEDIDAS (FICHA)"]] + [cat(c, 64) + [dd[str(c)]] for c in (3009, 3010, 3011, 6009)]
filas.append(["—", "TABLERITO DE LA CAJA DE COLUMNA PRFV (2 POR COLUMNA, TC-PRFV-01/02)", "—", "80 x 130 · SIN CODIGO"])
yt = h.tabla(40, 720, [(52, "c", True), (470, "l", False), (40, "c", False), (238, "l", False)], filas, rowh=16,
             titulo="CODIGOS DEL PAÑOL (4) + TABLERITO SIN CODIGO", colores=lambda i, j, t: OR if (i == 5 or (j == 2 and t == "m")) else K)
ydat = bloque(h, 40, yt + 22, "DATOS TECNICOS", [
    "PLACA DE CHAPA DONDE VAN EL RIEL NS35, LOS BORNES BPN Y LOS PORTAFUSIBLES.",
    "AP-CC-014: CHAPA GALVANIZADA, RIEL CON 2 TORNILLOS CABEZA TANQUE 6 x 3/8, BULON DE PAT.",
    "ACRILICO DE PROTECCION ADELANTE: OBLIGATORIO (ETG 16.1)."], w=390, sz=10, lh=13.5)
yu = bloque(h, 450, yt + 22, "DONDE SE USA", [
    "COLUMNA PRFV: 2 TABLERITOS 80 x 130 (C1 ABAJO, C2 ARRIBA) A 3,50 m DEL PISO.",
    "COLUMNA METALICA Y CAJA EXTERNA: FONDO DEL TABLERITO AP-CC-014 / 015."], w=390, sz=10, lh=13.5)
notasW(h, 40, max(ydat, yu) + 8, [
    "COTAS EN mm: SALEN DE LA DESCRIPCION DEL PAÑOL (FICHA DE LA APP).",
    "(*) POSICION DEL RIEL, AGUJEROS DE FIJACION, ESPESOR DE 6009, SEPARACION Y ESPESOR DEL ACRILICO: A CONFIRMAR.",
    "(*) 3009 FIGURA CON UNIDAD «m» EN EL CATALOGO: REVISAR SI ES «Un.».",
    "(*) EL TABLERITO PRFV 80 x 130 NO TIENE CODIGO EN EL PAÑOL (¿VIENE CON LA COLUMNA?).",
    "AP-C-033-A: PLACA A FIJA AL POSTE 120 x 145 CON ROSCAS Ø6 Y PLACA B MOVIL 80 x 130."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - FONDO 230 x 95 GALVANIZADO ARMADO (3011)", "RIEL CON 2 TORNILLOS · 2 TABAQUERAS · BPN · BULON DE PAT · CABLES · ACRILICO ADELANTE")
A = img3d(h, "protab_cc2", 892, 90, 600)
columna(h, A, [("fondo", "", "FONDO GALVANIZADO (3011)"), ("torn", "", "TORNILLO 6 x 3/8"), ("riel", "", "RIEL NS35 (2038)"), ("tab", "", "TABAQUERAS 10x38 (3053)"),
               ("bpn", "", "BPN 6 (2009 · 2008 · 2010)"), ("pat", "", "BULON DE PAT"), ("acril", "", "ACRILICO (ETG 16.1) (*)"), ("sep", "", "SEPARADOR (*)"), ("cable", "", "CABLES")],
        1478, 110, 470, paso=34)
h.titulo(890, 520, "LOS FONDOS DEL PAÑOL, A LA MISMA ESCALA", "3009 · 3010 · 3011 · 6009 · TABLERITO PRFV (SIN CODIGO)")
A2 = img3d(h, "protab_cc2_prfv", 892, 540, 740)
for k, t in (("f3009", "3009"), ("f3010", "3010"), ("f3011", "3011"), ("f6009", "6009"), ("prfv", "PRFV")):
    x, yy = A2(k); h.txt(x, yy - 14, t, 11, 700, NV, "middle", INT)
rayadosRef(h, 890, 900, ["MET", "PRFV", "VID", "PLAS"], cols=4, dx=185)
rotuloMat(h, "MAT-CAJA_COLUMNA-2", "FONDOS Y TABLERITOS", "DE COLUMNA CON RIEL", "PLANTAS, CORTE A-A, CODIGOS Y 3D", "1:1 · 2:1", "3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_caja_columna_2.svg"))
