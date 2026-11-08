"""MAT-BORNERAS-2 (rev. B) · Separadores, topes, tapa final y puentes peine (accesorios de los bornes BPN), armados y explotados.
Plano con los perfiles de r3d/piezas/perfiles.mjs del piloto (BPN, PEINE, SEPARADOR, TOPE, TAPA: no se modifican);
3D: r3d/out/protab_bor2.png y protab_bor2_acc.png (escena protab_bor2.mjs que usa piezas/bpn.mjs).
Datos: FICHAS_TEC.borneras pieza 2, catálogo del pañol, TC-PRFV-01/02, AP-T-007/008, r3d/FUENTES.md (Phoenix FBS / D-UT, Weidmüller). """
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from protabkit import *

B, PE_, SEP, TOPE = PERF["BPN"], PERF["PEINE"], PERF["SEPARADOR"], PERF["TOPE"]
h = nueva3()
P = 8.2
GRIS, CEL, VER, NEG = "#b4b8ba", "#1f78c0", "#13843a", "#3b3d41"

# =============== VISTA DE ARRIBA · TIRA ARMADA ===============
e = 3.0; VX, VY = 92, 128
h.titulo(40, 62, "VISTA DE ARRIBA - TIRA ARMADA", "ESC. 3:1 · TABLERITO DE ABAJO CON JABALINA (TC-PRFV-02)")
orden = [("tope", TOPE["esp"]), ("PE", P), ("N", P), ("sep", SEP["esp"]), ("R", P), ("S", P), ("T", P), ("tapa", 2.2), ("tope", TOPE["esp"])]
X = lambda x: VX + x * e; Y = lambda y: VY + y * e
x = 0; pos = {}
for n, w in orden:
    if n == "tope":
        h.rect(X(x), Y(5), w * e, 43 * e, "#fff", K, 1.1); h.circ(X(x + w / 2), Y(TOPE["yT"]), 3.5 * e, "#fff", K, .8)
        h.ln(X(x + w / 2) - 2.6 * e, Y(TOPE["yT"]) - 1 * e, X(x + w / 2) + 2.6 * e, Y(TOPE["yT"]) + 1 * e, K, .8)
    elif n == "sep": h.rect(X(x), Y(-1.5), w * e, 56 * e, "#555", K, .9)
    elif n == "tapa": h.rect(X(x), Y(0), w * e, 53 * e, "url(#PLAS)", K, .9)
    else:
        h.rect(X(x), Y(0), w * e, 53 * e, "#fff", K, 1.1)
        for yy in B["yT"]: h.circ(X(x + w / 2), Y(yy), 3.4 * e, "#fff", K, .7); h.ln(X(x + w / 2) - 2.4 * e, Y(yy) + .9 * e, X(x + w / 2) + 2.4 * e, Y(yy) - .9 * e, K, .8)
        h.rect(X(x + 1.25), Y(24.5), (w - 1.7) * e, 9 * e, "#fff", K, .5); h.txt(X(x + w / 2), Y(30.6), n, 8.5, 700, K, "middle")
    pos.setdefault(n, []).append(x); x += w
XF = x
# peine PE-N (lomo arriba del canal)
h.rect(X(pos["PE"][0] + 1.35), Y(18.8), 14.7 * e, 4.4 * e, "url(#CU)", K, 1.1)
h.ln(X(-3), Y(9), X(XF + 3), Y(9), K, .5, h.OCULTA); h.ln(X(-3), Y(44), X(XF + 3), Y(44), K, .5, h.OCULTA)
h.txt(X(XF + 4), Y(9) + 4, "RIEL NS35", 9, 400, G)
xs = X(pos["sep"][0] + .75); lineaCorte(h, xs, Y(-1.5) - 12, xs, Y(54.5) + 10, "B")
h.dimH(Y(53) + 22, X(pos["R"][0]), X(pos["R"][0] + P), "8,2", ext=Y(53) + 2)
h.dimH(Y(53) + 46, X(0), X(XF), f"{XF:.1f}".replace(".", ","), ext=Y(53) + 2)
h.dimV(X(0) - 18, Y(0), Y(53), "53", ext=X(0) - 2)
h.dimV(X(XF) + 50, Y(-1.5), Y(54.5), "56 (*)", ext=X(pos["sep"][0]) , c=OR)
for n_, (xx, yy), (gx, gy) in [("1", (pos["sep"][0] + .75, 52), (X(pos["sep"][0]) + 34, VY - 30)), ("2", (4.7, 46), (X(0) - 30, Y(53) + 52)),
                                ("3", (pos["PE"][0] + 8, 21), (X(pos["PE"][0]) - 4, VY - 28)), ("4", (pos["tapa"][0] + 1.1, 50), (X(XF) + 20, Y(53) + 52))]:
    h.globo(n_, X(xx), Y(yy), gx, gy, r=9)

# =============== CORTE B-B (SEPARADOR) ===============
ec = 2.5; vb = Vista(h, 530, 286, ec)
h.titulo(470, 62, "CORTE B-B (POR EL SEPARADOR)", "ESC. 2,5:1 · SOBRESALE DEL BORNE (*)")
vb.poly(B["contorno"], "none", .7, K, h.OCULTA)
vb.seccion([[SEP["contorno"] + [SEP["contorno"][0]]]], "PLAS2")
vb.poly([[9 + u, w - 7.5] for u, w in PERF["NS35"]["perfil"]], "url(#MET)", .9)
vb.cotaV(58, 0, 53.5, "53,5 (*)", yext=37, c=OR); vb.cotaV(66, 0, 50, "50 (BORNE)", yext=55)
vb.cotaH(-1.5, 54.5, -14, "56 (*)", zext=-3, c=OR)
vb.cotaH(9, 44, -24, "35 (RIEL)", zext=-8)
h.txt(470, 368, "EN LINEA DE PUNTOS: EL BORNE BPN-06 DE ATRAS (A = 50, C = 53).", 9, 400, G)
h.txt(470, 381, "EL SEPARADOR CORTA LA LINEA DE FUGA ENTRE N Y LA FASE.", 9, 400, G)

# =============== D1 · PEINE 2027 ===============
DX, DY = 470, 404
h.titulo(DX, DY, "D1 - PEINE 2027 (10 POLOS)", "ESC. 2:1 · VISTA DE FRENTE · SE CORTA A MEDIDA")
k = 2.0; px, py = DX + 14, DY + 50; L = PE_["anchos"]["10"]
h.rect(px, py, L * k, 3.2 * k, "url(#PLAS2)", K, 1)
for i in range(10):
    xc = px + (4.1 + i * P - .85 + .45) * k
    h.rect(xc - 1.5 * k, py + 3.2 * k, 3 * k, (PE_["alto"] - 3.2) * k, "url(#CU)", K, .6)
h.ln(px + (3 * P - .85 + 1.35) * k, py - 10, px + (3 * P - .85 + 1.35) * k, py + 34 * k, OR, 1, 'stroke-dasharray="4 2"')
h.txt(px + (3 * P) * k + 6, py - 12, "CORTE: TROZO DE 3 (PE · PE · N)", 9, 400, OR)
h.dimH(py + PE_["alto"] * k + 18, px, px + L * k, "80,3 = 10 x 8,2 - 1,7", ext=py + PE_["alto"] * k + 2)
h.dimV(px + L * k + 18, py, py + PE_["alto"] * k, "29,6", ext=px + L * k + 2)
h.dimH(py - 10, px + (4.55 - 1.5) * k, px + (4.55 - 1.5 + P) * k, "8,2", ext=py - 2)

# =============== D2 · TOPE CON TORNILLO ===============
TX, TY = 40, 404
h.titulo(TX, TY, "D2 - TOPE (2021 / 2059) EN CORTE", "ESC. 2,6:1 · EL TORNILLO APRIETA CONTRA EL RIEL (*)")
vt = Vista(h, TX + 30, TY + 136, 2.6)
vt.seccion([[TOPE["contorno"] + [TOPE["contorno"][0]]]], "PLAS")
vt.rect(TOPE["yT"] - 4, TOPE["yT"] + 4, 18, 31, "#fff", .6)
tornilloCorte(vt, TOPE["yT"], 30.5, 7, 2.6, 4, 12)
vt.poly([[9 + u, w - 7.5] for u, w in PERF["NS35"]["perfil"]], "url(#MET)", .9)
vt.cotaH(5, 48, -14, "43 (*)", zext=-3, c=OR); vt.cotaV(52, 0, 30, "30 (*)", yext=48, c=OR)
h.txt(TX + 200, TY + 70, "ANCHO 9,5 (*)", 9, 400, OR); h.txt(TX + 200, TY + 84, "TORNILLO M4 (*)", 9, 400, OR)
h.txt(TX + 200, TY + 98, "UNO EN CADA PUNTA:", 9, 400); h.txt(TX + 200, TY + 112, "LA TIRA NO SE CORRE", 9, 400)

# =============== COMO SE USA EL PEINE ===============
UY = 600
h.titulo(40, UY, "COMO SE USA EL PEINE", "NUNCA EN LAS FASES")
def fila(ox, oy, lst, peines, t1, t2):
    xx = ox; cs = {"PE": VER, "N": CEL, "R": GRIS, "S": GRIS, "T": GRIS, "|": NEG}; xs_ = []
    for t in lst:
        w = 7 if t == "|" else 26
        h.rect(xx, oy, w, 38, cs[t], "#333", .7)
        if t != "|": h.txt(xx + w / 2, oy + 24, t, 10, 700, "#fff" if t in ("PE", "N") else K, "middle", INT)
        xs_.append((xx, w)); xx += w
    for a, b in peines: h.rect(xs_[a][0] + 3, oy - 6, xs_[b][0] + xs_[b][1] - xs_[a][0] - 6, 5, "#c8302c", "#6c1a10", .6)
    h.txt(xx + 12, oy + 16, t1, 9.5, 700, K, "start", INT); h.txt(xx + 12, oy + 30, t2, 9, 400, G, "start", INT)
fila(48, UY + 34, ["PE", "PE", "N"], [(0, 2)], "TN-S (AP-T-008): PE · PE · N CON PEINE", "NEUTRO Y TIERRA EN UNA SOLA TIRA")
fila(48, UY + 80, ["PE", "PE", "N"], [(0, 1)], "TT (AP-T-007): PEINE CORTADO", "PE CON PE · EL N QUEDA SOLO (*)")
fila(470, UY + 34, ["N", "|", "R", "S", "T"], [], "FASES: SIN PEINE", "SEPARADOR ENTRE N Y R")
fila(470, UY + 80, ["PE", "N", "|", "R", "S", "T"], [(0, 1)], "TC-PRFV-02 (CON JABALINA)", "PEINE PE-N + SEPARADOR")

# =============== TABLA ===============
uso = {"2041": "ENTRE FASE Y N / PE", "2021": "TOPE EN LA PUNTA (*)", "2059": "TOPE EN LA PUNTA", "2027": "PEINE BPN 6 · EN USO",
       "2023": "PEINE BPN 4", "2024": "PEINE BPN 6 (UN.: m (*))", "2025": "PEINE BPN 16", "2026": "PUENTE BPN 4", "2039": "CENTRAL TB 16 (*)",
       "2040": "CENTRAL TB 35 (*)", "2042": "ADAPTADOR 1 MODULO (*)", "2011": "BORNERA FIJA (*)", "2012": "BORNERA DIVISIBLE (*)", "2002": "BARRA DE NEUTRO (*)"}
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "PARA QUE"]]
for c in [2041, 2021, 2059, 2027, 2023, 2024, 2025, 2026, 2039, 2040, 2042, 2011, 2012, 2002]:
    r = cat(c, 62); filas.append([r[0], r[1], r[2], uso[str(c)]])
yt = h.tabla(40, 748, [(52, "c", True), (452, "l", False), (40, "c", False), (256, "l", False)], filas, rowh=14.5, titulo="CODIGOS DEL PAÑOL (14)", colores=colorOR)
notasW(h, 40, yt + 18, [
    "COTAS EN mm. PASO 8,2, A = 50, C = 53: BPN-06 (TABLA ZOLODA, MAT-BORNERAS-1). PEINE 80,3 x 29,6 = PHOENIX FBS 10-8 (REFERENCIA).",
    "(*) SEPARADOR (1,5 x 56 x 53,5), TOPE (9,5 x 43 x 30, M4) Y TAPA FINAL (2,2): PROPORCIONALES A PHOENIX D-UT / E/UK; A CONFIRMAR.",
    "(*) 2024 FIGURA EN «m». 2021 PUEDE SER TAPA FINAL O TOPE. 2011, 2012, 2002, 2039, 2040, 2042: SIN MEDIDAS EN LA FICHA (NO SE DIBUJAN).",
    "(*) TT: EL PEINE N-PE NO VA (REV. B2 DE TC-PRFV). CONFIRMAR CON EL PROYECTO DE LA PLAZA."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - TIRA ARMADA (TC-PRFV-02)", "PE · N CON PEINE · SEPARADOR · R · S · T · TAPA FINAL · TOPES EN LAS PUNTAS")
A = img3d(h, "protab_bor2", 900, 84, 560)
columna(h, A, [("peine", "3", "PEINE PE-N (2027)"), ("sep", "1", "SEPARADOR (2041)"), ("pe", "", "BPN 6 VERDE (2010)"), ("n", "", "BPN 6 CELESTE (2008)"),
               ("fase", "", "BPN 6 GRIS (2009)"), ("topeD", "2", "TOPE (2021 / 2059)"), ("tornTope", "", "TORNILLO DEL TOPE (*)"), ("riel", "", "RIEL NS35 (2038)"),
               ("cablePE", "", "TIERRA VERDE-AMARILLO"), ("cable", "", "FASE CON PUNTERA")], 1480, 100, 500, paso=30)
h.titulo(890, 528, "LA MISMA TIRA EXPLOTADA", "ASI SE ARMA, DE IZQUIERDA A DERECHA EN EL RIEL")
A2 = img3d(h, "protab_bor2_acc", 890, 560, 600)
columna(h, A2, [("peine", "3", "PEINE (SE ENCHUFA)"), ("dientes", "", "DIENTES"), ("sep", "1", "SEPARADOR"), ("tapa", "4", "TAPA FINAL (*)"),
               ("topeI", "2", "TOPE"), ("riel", "", "RIEL NS35")], 1500, 580, 860, paso=28)
rayadosRef(h, 890, 880, ["PLAS", "PLAS2", "CU", "MET"], cols=4, dx=190)
bloque(h, 890, 940, "DONDE SE USA", ["TC-PRFV-01: ABAJO N · SEP · R · S · T; ARRIBA PE · PE · N CON PEINE (3). TC-PRFV-02: PE · N · SEP · R · S · T."], w=740, sz=9.5, lh=12.5)
rotuloMat(h, "MAT-BORNERAS-2", "SEPARADORES, TOPES", "Y PUENTES PEINE", "VISTA DE ARRIBA, CORTE B-B, D1, D2, CODIGOS Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_borneras_2.svg"))
