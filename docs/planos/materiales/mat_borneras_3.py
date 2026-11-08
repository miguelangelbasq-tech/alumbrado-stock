"""MAT-BORNERAS-3 (rev. B) · Bornes BPN 4 / 06 («10 mm») / 16 de colores y sus accesorios (altas del equipo):
1038, 1039, 3075, 3076, 2065, separadores 2063 / 2064 y tapa 2066.
Plano con BPN4 / BPN10 / BPN16 / SEP4 / SEP16 de r3d/piezas/perfiles_nelec.mjs (estiran el BPN-06 del piloto, que no se toca);
3D: r3d/out/nelec_bor3.png y nelec_bor3_exp.png. Datos: tabla Zoloda de la ficha de la app (paso, A/B/C, In). Fuentes: r3d/FUENTES_nelec.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nelekit import *

B4, B10, B16, S4, S16 = PN["BPN4"], PN["BPN10"], PN["BPN16"], PN["SEP4"], PN["SEP16"]
h = hojaN()
NS = [[0, 7.5], [0, 6.5], [4, 6.5], [4, 0], [31, 0], [31, 6.5], [35, 6.5], [35, 7.5], [30, 7.5], [30, 1], [5, 1], [5, 7.5]]


def perfilB(v, B, k, cotas=True, c_or=False):
    v.seccion(PN["SECC"][k], "PLAS")
    for e, i in ((B["jaula"]["ext"], B["jaula"]["int"]), (B["jaula"]["extD"], B["jaula"]["intD"])):
        v.poly(e, "url(#MET)", .8); v.poly(i, "#fff", .6)
    v.poly(B["barra"]["p"], "url(#CU)", .8); v.poly(B["zocaloP"]["p"], "url(#CU)", .7)
    for y in B["yT"]: tornilloCorte(v, y, B["tornillo"]["zCab"], B["tornillo"]["dk"], B["tornillo"]["k"], B["tornillo"]["M"], B["tornillo"]["L"])
    v.poly([[B["riel"]["y0"] + u, B["riel"]["z0"] + w] for u, w in NS], "url(#MET)", .9)
    for y in B["yT"]: v.eje(y, -10, y, B["A"] + 6)


# =============== 1. PERFILES EN CORTE ===============
e = 3.0
h.titulo(40, 62, "CORTE - BPN-04 (Y BPN-06)", "ESC. 3:1 · PLANO MEDIO")
v1 = Vista(h, 62, 300, e); perfilB(v1, B4, "BPN4")
v1.cotaH(0, B4["C"], -22, "53 (C)", zext=-8)
v1.cotaV(B4["C"] + 9, 0, B4["A"], "50 (A)", yext=B4["C"] - 14)
h.txt(62, 386, "PASO: BPN-04 = 6,2 · BPN-06 = 8,2 (ZOLODA)", 9.5, 400, G)
glo = [("1", v1.p(B4["yT"][0], B4["tornillo"]["zCab"] + 1), (60, 104)), ("2", v1.p(9, 12), (60, 132)), ("3", v1.p(26, 16.5), (150, 104)),
       ("4", v1.p(21, 21), (196, 104)), ("5", v1.p(29, 49.7), (236, 104)), ("6", v1.p(26, -4), (60, 366))]
for n, (ax, ay), (gx, gy) in glo: h.globo(n, ax, ay, gx, gy, r=9)

h.titulo(320, 62, "CORTE - BPN-16", "ESC. 3:1 · MAS LARGO Y ALTO (*)")
v2 = Vista(h, 328, 300, e); perfilB(v2, B16, "BPN16")
v2.cotaH(0, B16["C"], -22, "71 (C)", zext=-8)
v2.cotaV(B16["C"] + 9, 0, B16["A"], "56 (A)", yext=B16["C"] - 16)
h.txt(328, 386, "PASO 12,2 · TORNILLO M5 (*)", 9.5, 400, OR)

# =============== 2. VISTA DE ARRIBA DE LA TIRA ===============
et = 2.4; TX, TY = 646, 146
h.titulo(600, 62, "VISTA DE ARRIBA", "ESC. 2,4:1 · TIRA DEL 3D")
orden = [("N", B4, "#fff"), ("PE", B4, "#fff"), ("s", {"paso": 1.5}, "#555"), ("PE", B10, "#fff"), ("t", {"paso": 2.2}, "url(#PLAS)"), ("g", {"paso": 4}, None),
         ("s", {"paso": 1.5}, "#555"), ("L1", B16, "#fff"), ("N", B16, "#fff")]
x = 0; X = lambda u: TX + u * et; Y = lambda w: TY + w * et
for n, B, fill in orden:
    w = B["paso"]
    if fill:
        C = B.get("C", 53 if x < 20 else 71); off = 0 if C == 53 else -9
        if n in ("s", "t"): C = 56 if x < 20 else 74; off = -1.5 if x < 20 else -10.5
        h.rect(X(x), Y(off), w * et, C * et, fill, K, .9)
        if "yT" in B:
            for yy in B["yT"]: h.circ(X(x + w / 2), Y(yy + off), min(w * .36, 4) * et, "#fff", K, .6)
            h.txt(X(x + w / 2), Y(C / 2 + off) + 4, n, 8, 700, K, "middle")
    x += w
h.ln(X(-3), Y(9), X(x + 3), Y(9), K, .5, h.OCULTA); h.ln(X(-3), Y(44), X(x + 3), Y(44), K, .5, h.OCULTA)
h.dimH(Y(62) + 24, X(0), X(6.2), "6,2", ext=Y(53) + 2)
h.dimH(Y(62) + 24, X(x - 24.4), X(x - 12.2), "12,2", ext=Y(62) + 2)
h.dimH(Y(62) + 46, X(0), X(x), f"{x:.1f}".replace(".", ","), ext=Y(62) + 2)
h.txt(X(x) + 8, Y(9) + 4, "RIEL", 9, 400, G)
for n_, (xx, yy), (gx, gy) in [("7", (13.15, 20), (X(13) - 20, TY - 26)), ("8", (22.5, 30), (X(22.5) + 4, TY - 30)), ("9", (27.2, 30), (X(30) + 30, TY - 30))]:
    h.globo(n_, X(xx), Y(yy), gx, gy, r=9)

# =============== 3. D1 · SEPARADORES Y TAPA ===============
DY = 416
h.titulo(40, DY, "D1 - SEPARADORES (2063 · 2064) Y TAPA (2066)", "ESC. 1,6:1 · DE PERFIL · ESPESOR 1,5 Y 2,2 (*)")
ed = 1.6
for i, (S, t1, t2, pat, cy) in enumerate([(S4, "2063 SEPARADOR 2,5/4", "SOBRESALE DEL BORNE (*)", "PLAS2", 53.5), (S16, "2064 SEPARADOR 16/35", "PARA EL BPN-16", "PLAS2", 0),
                                              ({"contorno": PERF["BPN"]["contorno"]}, "2066 TAPA BPN 2,5/10", "CIERRA EL LADO ABIERTO", "PLAS", 0)]):
    ox = 58 + i * 160; vs = Vista(h, ox, DY + 150, ed)
    vs.poly(S["contorno"], f"url(#{pat})", 1.2)
    vs.poly([[(9 if i != 1 else 18) + u, -7.5 + w] for u, w in NS], "url(#MET)", .7)
    h.txt(ox, DY + 172, t1, 9.5, 700); h.txt(ox, DY + 186, t2, 9, 400, OR if "(*)" in t2 else G)
h.ln(530, DY + 32, 530, DY + 196, K, .4, h.OCULTA)

# =============== 4. COMO SE ARMA ===============
h.titulo(548, DY, "COMO SE ARMA LA TIRA", "COLORES AEA 90364 · EL AZUL HACE DE NEUTRO (*)")
def fila(ox, oy, lst, t1, t2):
    cs = {"PE": "#13843a", "N": "#2b5fae", "L": "#b4b8ba", "|": "#3b3d41", "]": "#9ea3a8"}; xx = ox
    for t in lst:
        w = 6 if t in "|]" else 24
        h.rect(xx, oy, w, 34, cs[t], "#333", .7)
        if t not in "|]": h.txt(xx + w / 2, oy + 22, t, 9.5, 700, "#fff" if t != "L" else K, "middle", INT)
        xx += w
    h.txt(ox, oy + 50, t1, 9, 700, K, "start", INT); h.txt(ox, oy + 63, t2, 8.5, 400, G, "start", INT)
fila(560, DY + 34, ["N", "PE", "|", "PE", "]"], "BPN-04 AZUL + VERDE", "SEPARADOR · TAPA AL FINAL")
fila(700, DY + 34, ["|", "L", "N"], "BPN-16 GRIS + AZUL", "SEPARADOR 16/35")
h.txt(560, DY + 130, "LA TAPA VA DEL LADO ABIERTO DEL ULTIMO BORNE.", 9, 400)
h.txt(560, DY + 144, "EL SEPARADOR CORTA LA FUGA ENTRE GRUPOS.", 9, 400)
h.txt(560, DY + 158, "MAXIMO 2 CABLES POR BORNE, SIEMPRE CON PUNTERA.", 9, 400)

# =============== 5. TABLA ===============
dat = {1038: ("BPN-04", "6,2", "50/53", "32 A", "NEUTRO 4 mm²"), 1039: ("BPN-04", "6,2", "50/53", "32 A", "TIERRA 4 mm²"),
       3075: ("BPN-06 (*)", "8,2", "50/53", "41 A", "TIERRA HASTA 10 mm²"), 3076: ("BPN-16", "12,2", "56/71", "76 A", "FASE 16 mm²"),
       2065: ("BPN-16", "12,2", "56/71", "76 A", "NEUTRO 16 mm²"), 2063: ("SEP. 2,5/4", "1,5 (*)", "—", "—", "ENTRE GRUPOS BPN-04/06"),
       2064: ("SEP. 16/35", "1,5 (*)", "—", "—", "ENTRE GRUPOS BPN-16"), 2066: ("TAPA 2,5/10", "2,2 (*)", "—", "—", "FIN DE TIRA BPN-04/06")}
filas = [["COD.", "DESCRIPCION (TAL CUAL EL PAÑOL)", "UN.", "TIPO", "PASO", "A/C", "In", "PARA QUE"]]
for c in [1038, 1039, 3075, 3076, 2065, 2063, 2064, 2066]:
    r = catN(c, 44); d = dat[c]; filas.append([r[0], r[1], r[2], *d])
yt = tablaN(h, 40, 640, [(40, "c", True), (282, "l", False), (34, "c", False), (78, "l", False), (46, "c", True), (48, "c", True), (40, "c", True), (232, "l", False)],
            filas, "CODIGOS DEL PAÑOL (8) - ALTAS DEL EQUIPO")
notasW(h, 40, yt + 22, [
    "COTAS EN mm. PASO, A, C E In: TABLA ZOLODA DE LA FICHA DE LA APP (BPN-04 6,2 · 50/48/53 · 32 A; BPN-06 8,2 · 41 A; BPN-16 12,2 · 56/66/71 · 76 A).",
    "(*) FORMA DEL BPN-04 Y DEL BPN-16: EL PERFIL DEL BPN-06 (MAT-BORNERAS-1) ESTIRADO A SU C Y A. JAULAS, TORNILLO (M3,5 / M4 / M5) Y BARRA: PROPORCIONALES.",
    "(*) 3075 DICE «BPN 10 MM»: EN LA TABLA ZOLODA EL DE 10 mm² ES EL BPN-06 (6/10 mm²). CONFIRMAR CON LA ETIQUETA.",
    "(*) 1038 Y 2065 SON AZULES: EL NEUTRO VA CELESTE (AEA 90364). SEPARADORES Y TAPA: 1,5 Y 2,2 COMO PHOENIX D-UT; FORMA A CONFIRMAR.",
    "(*) UNIDADES MEZCLADAS EN EL PAÑOL («Un.» Y «UN»): VAN TAL CUAL. 2066 TAMBIEN SIRVE DE FIN PARA EL BPN-04 (MISMO PERFIL) (*).",
    "MISMAS PIEZAS DEL PILOTO: BPN-06 GRIS/CELESTE/VERDE, PEINE Y TOPES EN MAT-BORNERAS-1 Y -2. FUENTES: r3d/FUENTES_nelec.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - TIRA ARMADA EN EL RIEL NS35", "BPN-04 AZUL Y VERDE · SEPARADOR · BPN-06 VERDE · TAPA · SEPARADOR · BPN-16 GRIS Y AZUL")
A = img3d(h, "nelec_bor3", 900, 84, 560)
columna(h, A, [("b16a", "", "BPN-16 AZUL (2065)"), ("b16g", "", "BPN-16 GRIS (3076)"), ("s16", "8", "SEPARADOR 16/35 (2064)"), ("b10", "", "BPN-06 VERDE (3075)"),
               ("s4", "7", "SEPARADOR 2,5/4 (2063)"), ("b4v", "", "BPN-04 VERDE (1039)"), ("b4a", "", "BPN-04 AZUL (1038)"), ("jaula", "2", "JAULA (ACERO CINCADO)"),
               ("tornillo", "1", "TORNILLO"), ("barra", "3", "BARRA DE COBRE ESTAÑADO"), ("riel", "6", "RIEL NS35")], 1478, 96, 470, paso=30)
h.titulo(890, 504, "LAS PIEZAS UNA POR UNA", "DEL LADO ABIERTO: JAULAS, BARRA Y TORNILLOS A LA VISTA")
A2 = img3d(h, "nelec_bor3_exp", 900, 528, 560)
columna(h, A2, [("b16a", "", "BPN-16"), ("s16", "8", "SEPARADOR 16/35"), ("tapa", "9", "TAPA 2066 (*)"), ("b10", "", "BPN-06"), ("s4", "7", "SEPARADOR 2,5/4"),
                ("b4a", "", "BPN-04")], 1478, 540, 860, paso=30)
ydt = bloque(h, 890, 902, "DATOS TECNICOS", ["800 V · PASO Y CORRIENTE SEGUN LA TABLA DE ABAJO.", "POLIAMIDA 6.6, JAULA DE ACERO CINCADO, BARRA DE COBRE ESTAÑADO (*)."], w=470, sz=9, lh=12)
bloque(h, 1390, 902, "DONDE SE USA", ["TABLERITO DE COLUMNA Y TABLERO DE PLAZA.", "BPN-16: LLEGADA DE LA ACOMETIDA 4 x 16 (*)."], w=250, sz=9, lh=12)
rotuloMat(h, "MAT-BORNERAS-3", "BORNES BPN 4 · 06 · 16", "SEPARADORES Y TAPA", "CORTES, VISTA DE ARRIBA, D1, CODIGOS Y 3D", "3:1 · 2,4:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardar(h, "mat_borneras_3")
