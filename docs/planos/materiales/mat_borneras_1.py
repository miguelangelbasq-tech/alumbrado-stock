"""MAT-BORNERAS-1 (rev. B) · Borne de paso BPN-06 sobre riel NS35, con peine 2027, separador, tapa final y tope.
Plano: dibujado con los perfiles de r3d/piezas/perfiles.mjs (los mismos del 3D). 3D: render three.js r3d/out/bpn_fila.png y bpn_peine.png.
Datos: FICHAS_TEC.borneras (tabla Zoloda A/B/C, paso, tensión, corriente), catálogo del pañol, CLAUDE.md §11.3,
referencias Phoenix UT 6 / FBS 10-8 y Weidmüller WDU 6 (ver r3d/FUENTES.md). Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fichakit import *

B, PE, NS, SEP, TOPE = PERF["BPN"], PERF["PEINE"], PERF["NS35"], PERF["SEPARADOR"], PERF["TOPE"]
cv = B["cavidades"]; C = B["C"]; P = B["paso"]; YT = B["yT"]; yP = B["yPuente"]
h = nueva2()

def riel_yz(v, y0=9, z0=-7.5):
    v.poly([[y0 + u, z0 + w] for u, w in NS["perfil"]], "url(#MET)", .9)

def peine_yz(v):   # lomo + chapa + diente en el corte A-A (plano del peine)
    v.rect(PE["lomo"][0][0], PE["lomo"][1][0], PE["lomo"][0][1], PE["lomo"][2][1], "url(#PLAS2)", 1.0)
    v.rect(yP - .5, yP + .5, PE["zPunta"], PE["chapaZ"][1], "url(#CU)", .8)

# =============== 1. CORTE A-A (por el medio del borne N, con el peine puesto) · ESC. 4:1 ===============
e = 4.0; OY = 316; v = Vista(h, 100, OY, e)
h.titulo(40, 62, "CORTE A-A", "ESC. 4:1 · POR EL MEDIO DEL BORNE N, CON EL PEINE PUESTO")
v.seccion(PERF["SECC"]["bpn"], "PLAS")
for poz in PERF["SECC"]["bpnPozoRedondo"]: v.linea(poz[:3], .5); v.linea(poz[3:] + poz[:1], .5)
riel_yz(v)
for e_, i_ in ((B["jaula"]["ext"], B["jaula"]["int"]), (B["jaula"]["extD"], B["jaula"]["intD"])):
    v.poly(e_, "url(#MET)", .9); v.poly(i_, "#fff", .7)
v.poly(B["barra"]["p"], "url(#CU)", .9); v.poly(B["zocaloP"]["p"], "url(#CU)", .9)
for y in YT: tornilloCorte(v, y, B["tornillo"]["zCab"], B["tornillo"]["dk"], B["tornillo"]["k"], 4, B["tornillo"]["L"])
peine_yz(v)
zc, rp = B["puntera"]["zEje"], B["puntera"]["r"]
v.rect(C - 9, C + 2.2, zc - rp, zc + rp, "url(#CU)", .8)
v.poly([[C + 2.2, zc - 3.3], [C + 9.2, zc - 3.3], [C + 9.2, zc + 3.3], [C + 2.2, zc + 3.3]], "url(#PLAS2)", .8)
v.rect(C + 9, C + 21, zc - 2.75, zc + 2.75, "#fff", .9); v.rect(C + 9, C + 21, zc - 1.6, zc + 1.6, "url(#CU)", .5)
xa, ya_ = v.p(C + 21, zc + 3.4); h.path(f"M{xa:.1f},{ya_:.1f} q4,7 0,13.6 q-4,7 0,13.6", "none", K, .6)
v.eje(-3, zc, C + 23, zc); [v.eje(y, 19, y, 43) for y in YT]
v.cotaV(-6, 0, 50, "50 (A)", yext=1)
v.cotaV(-12, -7.5, 0, "7,5", yext=8)
v.cotaH(0, C, -12.5, "53 (C)", zext=-.5)
v.cotaH(9, 44, -18.5, "35 (RIEL)", zext=-8)
v.cotaH(YT[0], YT[1], -24.5, "33 (*)", zext=21, c=OR)
v.cotaV(C + 5, PE["zPunta"], PE["zTop"], "29,6", yext=yP + 2.5)
a, b = v.p(yP, 55.5), v.p(yP, -8.5); lineaCorte(h, a[0], a[1], b[0], b[1], "B", lado=-1)
cx, cy = v.p(YT[0], 15); h.llamadaDet(cx, cy, 12 * e, ""); h.txt(cx - 12 * e - 2, cy - 12 * e + 10, "D1", 11, 700, K, "end")
for n, (y, z), (gx, gy) in [("1", (28, 8), (52, 112)), ("6", (yP, 38), (52, 138)), ("7", (19.2, 52.6), (122, 104)), ("8", (29, 49.7), (262, 104)),
                            ("2", (YT[1], 22.5), (412, 120)), ("5", (yP + 1.2, 22.2), (412, 146)), ("4", (36, 16.5), (412, 172)),
                            ("3", (C - 6.2, 8.5), (412, 198)), ("9", (C - .3, 13.5), (412, 224)), ("15", (C - 2, zc + 1.7), (412, 250)),
                            ("16", (C + 16, zc + 2.75), (412, 276)), ("10", (49, 3.6), (380, 345)), ("11", (26.5, -7.1), (310, 356))]:
    h.globo(n, *v.p(y, z), gx, gy, r=9)

# =============== 2. VISTA DE ARRIBA (alineada con el corte) ===============
X0 = 452
h.txt(40, 428, "VISTA DE ARRIBA", 13, 700); h.ln(40, 432, 160, 432, K, 1)
h.txt(40, 446, "TOPE · PE · PE · N · SEP. · R", 9.5, 400, G)
fila = [("T", 9.5), ("PE", P), ("PE", P), ("N", P), ("S", 1.5), ("R", P)]
xs = []; x = 0
for nom, w in fila: xs.append((nom, x, w)); x += w
def ya(xm): return X0 + 8 + xm * e
def py(y): return v.ox + y * e
for nom, x0, w in xs:
    if nom == "T":
        h.rect(py(5), ya(x0), 43 * e, w * e, "#fff", K, 1.0); h.circ(py(26.5), ya(x0 + w / 2), 2.5 * e, "#fff", K, .8)
        h.ln(py(26.5) - 6, ya(x0 + w / 2) + 3, py(26.5) + 6, ya(x0 + w / 2) - 3, K, .8); continue
    if nom == "S": h.rect(py(-1.5), ya(x0), (C + 3) * e, w * e, "url(#PLAS)", K, .8); continue
    h.rect(py(0), ya(x0), C * e, w * e, "#fff", K, 1.2)
    for y in (5, 16, 18, 35, 37, 48): h.ln(py(y), ya(x0), py(y), ya(x0 + w), K, .45)
    cyp = ya(x0 + 1 + (w - 1) / 2)
    for y in YT:
        h.circ(py(y), cyp, 4.3 * e, "#fff", K, .6); h.circ(py(y), cyp, 3.4 * e, "#fff", K, .8)
        h.ln(py(y) - 2.6 * e, cyp + 1.2 * e, py(y) + 2.6 * e, cyp - 1.2 * e, K, .9)
    h.rect(py(24.2), ya(x0 + 1.2), 9.6 * e, (w - 1.6) * e, "#fff", K, .7); h.txt(py(29), cyp + 3.5, nom, 9, 700, K, "middle")
    h.rect(py(19.7), ya(x0 + 1), 2.6 * e, (w - 1) * e, "#e9e9e9", K, .5)
x0p = xs[1][1] + 1.35; h.rect(py(18.8), ya(x0p), 4.4 * e, PE["anchos"]["3"] * e, "url(#PLAS2)", K, 1.1)
for i in (1, 2): xx = ya(x0p + i * P - .85); h.ln(py(18.8), xx, py(23.2), xx, K, 1.4)
for y in (9, 14, 39, 44): h.ln(py(y), ya(-1.5), py(y), ya(x + 1.5), K, .5, h.OCULTA)
xr = xs[5][1] + 1 + (P - 1) / 2; h.rect(py(C + 9), ya(xr - 2.75), 12 * e, 5.5 * e, "#fff", K, .9); h.rect(py(C + 2.2), ya(xr - 3.3), 7 * e, 6.6 * e, "#fff", K, .8)
yN = ya(xs[3][1] + 1 + (P - 1) / 2); lineaCorte(h, py(-4), yN, py(C + 4), yN, "A")
h.dimV(py(-9), ya(xs[1][1]), ya(xs[1][1] + P), "8,2", ext=py(-.5))
h.dimV(py(C + 26), ya(x0p), ya(x0p + PE["anchos"]["3"]), "22,9", ext=py(23.5))
h.txt(py(C + 26) + 6, ya(x0p + 11.5) + 4, "PEINE", 9, 400, G); h.txt(py(C + 26) + 6, ya(x0p + 11.5) + 15, "3 POLOS", 9, 400, G)
h.dimV(py(-9), ya(xs[4][1]), ya(xs[4][1] + 1.5), "", ext=py(-1.6)); h.txt(py(-9) - 4, ya(xs[4][1]) + 14, "1,5 (*)", 9, 400, OR, "end")

# =============== 3. VISTA LATERAL desde la entrada del cable (z alineado con el corte) ===============
vf = Vista(h, 640, OY, e, espejo=True)
h.titulo(462, 62, "VISTA LATERAL", "DESDE LA ENTRADA DEL CABLE")
for nom, x0, w in xs:
    if nom == "T": vf.rect(x0, x0 + w, 0, 30, "#fff", 1.0); continue
    if nom == "S": vf.rect(x0, x0 + w, -2.6, 53.5, "url(#PLAS)", .9); continue
    vf.rect(x0, x0 + w, -2.6, 50, "#fff", 1.2)
    for z in (27, 32, 40): a, b = vf.p(x0, z), vf.p(x0 + w, z); h.ln(a[0], a[1], b[0], b[1], K, .45)
    vf.rect(x0 + 1, x0 + w, 7.6, 15.0, "#fff", .8)
    xm = x0 + 1 + (w - 1) / 2
    if not (nom == "PE" and x0 == xs[2][1]):
        vf.circ(xm, zc, 3.3, "url(#PLAS2)", .8); vf.circ(xm, zc, 2.75, "#fff", .8); vf.circ(xm, zc, 1.55, "url(#CU)", .6)
    vf.rect(x0 + 1.25, x0 + w - .45, 49.25, 50.25, "#fff", .6)
vf.rect(x0p, x0p + PE["anchos"]["3"], 50, 53.2, "url(#PLAS2)", 1.0)
for i in range(3):
    xm = xs[1 + i][1] + 1 + (P - 1) / 2; vf.oculta([[xm - 1.5, 50], [xm - 1.5, PE["zPunta"]], [xm + 1.5, PE["zPunta"]], [xm + 1.5, 50]])
vf.rect(-2, x + 2, -7.5, 0, "#fff", .9); vf.oculta([[-2, -6.5], [x + 2, -6.5]])
vf.cotaV(-6, -2.6, 53.5, "56,1 (*)", yext=-1.6, c=OR)
vf.cotaH(xs[5][1], xs[5][1] + P, -15.5, "8,2", zext=-7.6)
a, b = vf.p(x / 2, -7.5); h.txt(a, b + 13, "RIEL NS35 (2038)", 9, 400, G, "middle")

# =============== 4. CORTE B-B · POR EL CANAL DEL PUENTE ===============
vb = Vista(h, 698, OY, e)
h.titulo(690, 62, "CORTE B-B", "CANAL DEL PUENTE")
for i in range(3):
    x0 = i * P
    vb.rect(x0, x0 + 1, 0, 50, "url(#PLAS)", 1.0); vb.rect(x0 + 1, x0 + P, 0, 15.2, "url(#PLAS)", 1.0)
    vb.rect(x0 + 2.2, x0 + 7.0, 15.5, 17.5, "url(#CU)", .8); vb.rect(x0 + 2.6, x0 + 6.6, 17.5, 20.8, "url(#CU)", .8)
    xm = x0 + 1 + (P - 1) / 2
    vb.poly([[xm - 1.5, PE["chapaZ"][0]], [xm - 1.5, PE["zPunta"] + .6], [xm - 1, PE["zPunta"]], [xm + 1, PE["zPunta"]], [xm + 1.5, PE["zPunta"] + .6], [xm + 1.5, PE["chapaZ"][0]]], "url(#CU)", .8)
W3 = PE["anchos"]["3"]
vb.rect(1.35, 1.35 + W3, PE["chapaZ"][0], PE["chapaZ"][1], "url(#CU)", .8)
vb.rect(1.35, 1.35 + W3, 52.6, 53.2, "url(#PLAS2)", .6); vb.rect(1.35, 1.35 + W3, 50, 50.4, "url(#PLAS2)", .6)
vb.poly([[1.35, 50], [1.35 + W3, 50], [1.35 + W3, 53.2], [1.35, 53.2]], "none", 1.0)
vb.rect(-2, 3 * P + 2, -7.5, -6.5, "url(#MET)", .7)
vb.cotaH(1 + (P - 1) / 2, P + 1 + (P - 1) / 2, -12, "8,2 (PASO)", zext=-7.6)
vb.cotaV(-3.5, 15.5, 17.5, "", yext=1)
for t, (yy, zz), z2 in [("DIENTE", (P + 4.6, 34), 38), ("HORQUILLA", (2 * P + 4.6, 19.5), 25), ("BARRA", (2 * P + 6.5, 16.5), 12), ("PARED", (2 * P + .5, 8), 4)]:
    a_ = vb.p(yy, zz); c2 = vb.p(3 * P + 1.5, z2); llamada(h, a_[0], a_[1], c2[0], c2[1], t, sz=8.5)

# =============== 5. D1 · JAULA, TORNILLO Y PUNTERA · ESC. 8:1 ===============
e1 = 8; d1 = Vista(h, 500, 678, e1)
h.txt(452, 428, "D1 - JAULA Y TORNILLO", 13, 700); h.ln(452, 432, 610, 432, K, 1)
h.txt(452, 446, "ESC. 8:1 · LA PUNTA EMPUJA LA BARRA", 9.5, 400, G)
x1, y1 = d1.p(-3.5, 27.5); x2, y2 = d1.p(18.5, 5)
h.a(f'<clipPath id="cpD1"><rect x="{x1}" y="{y1}" width="{x2-x1}" height="{y2-y1}"/></clipPath><g clip-path="url(#cpD1)">')
d1.seccion(PERF["SECC"]["bpn"], "PLAS", 1.2)
d1.poly(B["jaula"]["ext"], "url(#MET)", 1.0); d1.poly(B["jaula"]["int"], "#fff", .8)
d1.poly(B["barra"]["p"], "url(#CU)", 1.0)
d1.rect(-4, 9, zc - rp, zc - rp + .3, "url(#CU)", .7); d1.rect(-4, 9, zc + rp - .3, zc + rp, "url(#CU)", .7); d1.rect(-4, 9, zc - rp + .3, zc + rp - .3, "#fbe9d9", .4)
for i in range(6): a_, b_ = d1.p(-4, zc - 1.2 + i * .48), d1.p(9, zc - 1.2 + i * .48); h.ln(a_[0], a_[1], b_[0], b_[1], "#b8622a", .35)
tornilloCorte(d1, YT[0], B["tornillo"]["zCab"], B["tornillo"]["dk"], B["tornillo"]["k"], 4, B["tornillo"]["L"])
h.a('</g>'); h.rect(x1, y1, x2 - x1, y2 - y1, "none", K, .8)
d1.cotaV(17, 6, 21, "15 (*)", yext=14.4, c=OR)
d1.cotaH(5.6, 14.4, 26, "8,8 (*)", zext=23.6, c=OR)
for n, (y, z) in [("2", (YT[0] + 2.5, 22.6)), ("3", (14.2, 19.5)), ("4", (12, 16.5)), ("15", (4, zc + 1.3))]:
    a_ = d1.p(y, z); h.globo(n, a_[0], a_[1], x2 + 15, a_[1], r=9)

# =============== 6. D2 · PEINE 2027 SUELTO ===============
e2 = 1.8; Z0 = 605; X2 = 688
h.txt(X2, 428, "D2 - PEINE 2027", 13, 700); h.ln(X2, 432, X2 + 128, 432, K, 1)
h.txt(X2, 446, "ESC. 2:1 · 10 POLOS, SE CORTA", 9.5, 400, G)
def pz(z): return Z0 - (z - PE["zPunta"]) * e2
def px(xm): return X2 + xm * e2
W10 = PE["anchos"]["10"]; t0 = (P - 1.7) / 2 + .85
for i in range(10):
    xx = px(t0 + i * P); h.path(f"M{xx-1.5*e2:.1f},{pz(50.4):.1f} V{pz(PE['zPunta']+.6):.1f} l{.5*e2:.1f},{.6*e2:.1f} h{2*e2:.1f} l{.5*e2:.1f},{-.6*e2:.1f} V{pz(50.4):.1f}", "url(#CU)", K, .6)
h.rect(px(0), pz(53.2), W10 * e2, 3.2 * e2, "url(#PLAS2)", K, 1.0)
for i in range(1, 10): xx = px(i * P - .85); h.ln(xx, pz(53.2) - 2, xx, pz(51.8), K, 1.3)
h.dimH(pz(53.2) - 10, px(0), px(W10), "80,3 (10 POLOS)", ext=pz(53.2) - 2)
h.dimV(px(W10) + 10, pz(53.2), pz(PE["zPunta"]), "29,6", ext=px(W10) + 2)
h.dimH(pz(PE["zPunta"]) + 11, px(t0 + 8 * P), px(t0 + 9 * P), "8,2", ext=pz(PE["zPunta"]) + 2)
h.txt(px(0), pz(PE["zPunta"]) + 22, "ANCHO = N x 8,2 - 1,7", 9, 400, G)
h.txt(px(0), pz(PE["zPunta"]) + 34, "DIENTE 3 x 1 (*)", 9, 400, OR)

# =============== TABLAS ===============
TY = 660
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "MODELO / USO"]]
uso = {"2009": "BPN-06 · FASE (EN USO)", "2008": "BPN-06 · NEUTRO (EN USO)", "2010": "BPN-06 · TIERRA (EN USO)", "2007": "BPN-04 · YA NO SE USA",
       "2003": "BPN-06", "2006": "BPN-16", "2004": "BPN-35", "2013": "BPN-04 · NEUTRO", "2014": "BPN-04 · SALIDA AP", "2015": "BPN-06 · NEUTRO",
       "2016": "BPN-06 · SALIDA AP", "2017": "2,5 mm² · COMANDO (*)", "2005": "16 mm² (BPN-16 (*))", "2018": "NEUTRO (*)"}
for c in [2009, 2008, 2010, 2007, 2003, 2006, 2004, 2013, 2014, 2015, 2016, 2017, 2005, 2018]:
    r = cat(c, 47); filas.append([r[0], r[1], r[2], uso[str(c)]])
yt = h.tabla(40, TY, [(46, "c", True), (330, "l", False), (34, "c", False), (150, "l", False)], filas, rowh=14, titulo="BORNES BPN DEL PAÑOL (14)", colores=colorOR)
filas2 = [["COD.", "ACCESORIO", "POS."]]
acc = [("2027", "PEINE BPN 6, 10 ELEM.", "7"), ("2024", "PUENTE FIJO BPN 06 (*)", "7"), ("2041", "SEPARADOR BPN", "12"),
       ("2021", "EXTREMO (TAPA FINAL) (*)", "13"), ("2059", "TOPE DE BORNERA", "14"), ("2038", "RIEL DIN NS35", "11"), ("2031", "PUNTERA TIF (*)", "15")]
for a_ in acc: filas2.append(list(a_))
h.tabla(610, TY, [(42, "c", True), (150, "l", False), (38, "c", True)], filas2, rowh=14, titulo="ACCESORIOS", colores=colorOR)
# datos del fabricante
TY2 = yt + 20
filas3 = [["MODELO", "SECCION FLEX./RIG.", "PASO", "A / B / C", "TENSION", "CORRIENTE"],
          ["BPN-04", "4 / 6 mm²", "6,2", "50 / 48 / 53", "800 V", "32 A"], ["BPN-06", "6 / 10 mm²", "8,2", "50 / 48 / 53", "800 V", "41 A"],
          ["BPN-16", "16 / 35 mm²", "12,2", "56 / 66 / 71", "800 V", "76 A"], ["BPN-35", "35 / 50 mm²", "16,2", "56 / 66 / 71", "800 V", "125 A"]]
yf = h.tabla(40, TY2, [(62, "l", False), (112, "c", True), (40, "c", True), (88, "c", True), (54, "c", True), (66, "c", True)], filas3, rowh=14,
             titulo="DATOS DEL FABRICANTE (ZOLODA, FICHA DE LA APP)", colores=lambda i, j, t: NV if i == 2 else K)
h.txt(40, yf + 13, "EN AZUL: EL QUE SE USA EN LA CAJA DE COLUMNA (BPN-06, 6 mm²).", 9.5, 400, NV)
rayadosRef(h, 610, TY + 14 + 8 * 14 + 14, ["PLAS", "MET", "CU"], cols=1, dx=200)
bloque(h, 470, TY2, "DATOS TECNICOS", [
    "CUERPO DE POLIAMIDA; JAULA DE ACERO Y BARRA DE COBRE (*).",
    "MAX. 2 CABLES POR BORNE, CON PUNTERA DEL CALIBRE.",
    "PEINE: SE ENCHUFA EN EL CANAL; SE CORTA A MEDIDA.",
    "PAR DE APRIETE DEL TORNILLO (*)"], w=400, sz=10, lh=13.5)
notasW(h, 40, yf + 34, [
    "COTAS EN mm. A = 50, C = 53, PASO 8,2: TABLA ZOLODA (FICHA DE LA APP). B = 48: NO SE SABE A QUE MEDIDA CORRESPONDE (*).",
    "(*) FORMA DEL PERFIL, JAULA, BARRA, TORNILLO Y PIES: PROPORCIONALES A PHOENIX UT 6 (8,2 x 47,7 x 46,9) Y WEIDMULLER WDU 6. A CONFIRMAR CON ZOLODA.",
    "PEINE: COMO PHOENIX FBS 10-8 (PASO 8,2 · 80,3 DE ANCHO · 29,6 DE ALTO). (*) MATERIAL Y COLOR DEL LOMO DEL 2027: A CONFIRMAR.",
    "(*) 2024 «PUENTE FIJO P/BPN 06» FIGURA EN METROS EN EL PAÑOL; 2021 PUEDE SER TAPA FINAL O TOPE: A CONFIRMAR.",
    "2007 (BPN 4 GRIS) YA NO SE USA: VAN TODAS DE 6 mm². NO SE BORRA DEL PAÑOL. LAS PUNTERAS SIGUEN EL CALIBRE DEL CABLE.",
    "FUENTES DE CADA MEDIDA: r3d/FUENTES.md."], w=800, lh=14.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - FILA DE BORNES BPN-06 EN EL RIEL NS35", "PE · PE · N CON PEINE 2027 · SEPARADOR · R · S · T SIN TAPA FINAL, PARA VER ADENTRO")
A = img3d(h, "bpn_fila", 880, 84, 600)
columna(h, A, [("cuerpo", "1", "CUERPO DE POLIAMIDA"), ("peine", "7", "PEINE 2027 (PUENTE)"), ("marcador", "8", "MARCADOR"),
               ("separador", "12", "SEPARADOR 2041"), ("tope", "14", "TOPE 2059"), ("zocalo", "5", "HORQUILLA DEL PUENTE"),
               ("traba", "10", "PIE CON TRABA"), ("riel", "11", "RIEL NS35 (2038)"), ("cable", "16", "CABLE")], 1500, 120, 560)
columna(h, A, [("tornillo", "2", "TORNILLO M4"), ("barra", "4", "BARRA DE COBRE"), ("jaula", "3", "JAULA DE ACERO"),
               ("boca", "9", "BOCA DE ENTRADA"), ("puntera", "15", "PUNTERA")], 902, 470, 590, paso=26)
h.txt(890, 612, "ACCESORIOS SUELTOS: PEINE DE 10 POLOS, TROZO CORTADO DE 3, SEPARADOR, TAPA FINAL Y TOPE", 11, 700, NV, "start", INT)
A2 = img3d(h, "bpn_peine", 880, 622, 560)
columna(h, A2, [("lomo", "7", "PEINE 2027 · 10 POLOS"), ("corte", "", "MARCA DE CORTE"), ("dientes", "", "DIENTES (CHAPA DE COBRE)"),
                ("trozo", "", "TROZO DE 3 (PE · PE · N)"), ("sep", "12", "SEPARADOR 2041"), ("tapa", "13", "TAPA FINAL (*)"), ("tope", "14", "TOPE 2059")], 1470, 640, 880)
# orden en la caja de columna (como en la hoja anterior)
yo = 905
h.txt(890, yo, "ORDEN EN LA CAJA DE COLUMNA PRFV (TC-PRFV-01)", 11.5, 700, NV, "start", INT)
def cajitas(ox, oy, items):
    xx = ox
    for col, t, w in items:
        h.rect(xx, oy, w, 34, col, "#333", .7)
        if t: h.txt(xx + w / 2, oy + 22, t, 10.5, 700, "#fff" if col in (VER_BPN, CEL_BPN, "#333") else K, "middle", INT)
        xx += w
    return xx
xe = cajitas(890, yo + 10, [(VER_BPN, "PE", 26), (VER_BPN, "PE", 26), (CEL_BPN, "N", 26), ("#fff", "", 8), ("#f6f4ee", "S", 26), ("#f6f4ee", "T", 26)])
h.rect(892, yo + 8, 76, 4, "#c8302c", "#7a1a16", .5)
h.txt(xe + 12, yo + 31, "ARRIBA: PE · PE · N CON PEINE (2027) + 2 PORTAFUSIBLES (S, T)", 10.5, 400, K, "start", INT)
xe = cajitas(890, yo + 52, [(CEL_BPN, "N", 26), ("#333", "", 6), (GRIS_BPN, "R", 26), (GRIS_BPN, "S", 26), (GRIS_BPN, "T", 26)])
h.txt(xe + 12, yo + 66, "ABAJO: N · SEPARADOR (2041) · R · S · T", 10.5, 400, K, "start", INT)
h.txt(xe + 12, yo + 81, "CON JABALINA (TC-PRFV-02): PE · N · R · S · T", 10.5, 400, K, "start", INT)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/bpn_fila.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-BORNERAS-1", "BORNE DE PASO BPN-06", "Y PEINE PARA RIEL NS35", "CORTES A-A Y B-B, VISTAS, D1, D2 Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_borneras_1.svg"))
