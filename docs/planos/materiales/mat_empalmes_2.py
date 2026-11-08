"""MAT-EMPALMES-2 (rev. B) · Empalme subterráneo con resina (2020; 2019 derivación) y unión a compresión 10 mm² (2060).
Plano y 3D con los mismos números: r3d/piezas/perfiles_conex.mjs (RESINA, UNION, CABLE.c4x10). 3D: r3d/out/conex_resina.png y conex_union.png.
Datos: FICHAS_TEC.empalmes (tabla 3M Scotchcast 92-NBA, HD 631.1 S2), RS / Enrgtech (NBA1 178 × 69), Cellpack / Klauke / Cimco (DIN 46267: 30 · Ø6 · Ø4,5 · K 6)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conexkit import *

h = nueva3()
RS = PC["RESINA"]; U = PC["UNION"]; C = PC["CABLE"]["c4x10"]
L, D, nb, cu, ee = RS["L"], RS["D"] / 2, RS["Dboca"] / 2, RS["cuello"], 1.6
rCu = math.sqrt(10 / math.pi); rIn = rCu + C["aisl"]; rc = rIn * 1.414 + .05; rs = 13
xS0, xS1 = 16, L - 16; xU = [52, 70, 96, 114]
COLS = [COLOR["L1"], COLOR["L2"], COLOR["L3"], COLOR["N"]]

# ================= 1. CORTE A-A · EMPALME TERMINADO · ESC. 1:2 (x 2,2) =================
e = 2.15; v = Vista(h, 112, 214, e)
h.titulo(40, 62, "CORTE A-A", "EMPALME TERMINADO · CABLE 4 x 10 (Ø17) · KIT DE REFERENCIA NBA1 · ARRIBA CORTE, ABAJO VISTA · ESC. 1:2")
ext = [[nb, 0], [nb, 6], [D - 4, cu - 4], [D, cu], [D, L - cu], [D - 4, L - cu + 4], [nb, L - 6], [nb, L]]
secRT(v, ext + [[r - ee, t_] for r, t_ in ext[::-1]], "VID", 1.2)
inn = [[max(r - ee - .05, C["D"] / 2 + .05), t_] for r, t_ in ext][1:-1]
secRT(v, [[C["D"] / 2, 7]] + [[r, min(max(t_, 7), L - 7)] for r, t_ in inn] + [[C["D"] / 2, L - 7]], "RES", .8)
for x0_, x1_ in ((1, 7), (L - 7, L - 1)): v.rect(x0_, x1_, C["D"] / 2, nb + .6, "url(#GOM)", .7)
# cable: vaina + relleno + conductor de arriba (+z, L2) cortado por el eje
for a_, b_ in ((-26, xS0), (xS1, L + 26)):
    v.rect(a_, b_, C["D"] / 2 - 1.6, C["D"] / 2, "url(#PLAS2)", .9); v.rect(a_, b_, 0, C["D"] / 2 - 1.6, "#fff", .5)
def camino(rr):
    return [[-26, rr], [xS0 + 4, rr], [xS0 + 10, rr + 2.2], [xS0 + 16, rr + 5.5], [xS0 + 22, rs - 1.5], [44, rs], [L - 44, rs], [xS1 - 22, rs - 1.5], [xS1 - 16, rr + 5.5], [xS1 - 10, rr + 2.2], [xS1 - 4, rr], [L + 26, rr]]
cam = camino(rc)
up = [[x, z + rIn] for x, z in cam]; dn = [[x, z - rIn] for x, z in cam]
v.poly(up + dn[::-1], "url(#XLP)", .8)
cuU = [[x, z + rCu] for x, z in cam]; cuD = [[x, z - rCu] for x, z in cam]
v.poly(cuU + cuD[::-1], "url(#HIL)", .5)
xu = xU[1]; v.rect(xu - 1, xu + U["L"] + 1, rs - rIn - .05, rs + rIn + .05, "#fff", 0); v.rect(xu - 1, xu + U["L"] + 1, rs - rCu, rs + rCu, "url(#HIL)", .5)
v.rect(xu, xu + U["L"], rs + U["Di"] / 2, rs + U["De"] / 2, "url(#CU)", .8); v.rect(xu, xu + U["L"], rs - U["De"] / 2, rs - U["Di"] / 2, "url(#CU)", .8)
for k_ in (1, 3): v.oculta([[xU[0] if k_ == 1 else xU[2], rs - .2], [(xU[0] if k_ == 1 else xU[2]) + U["L"], rs - .2]])
# embudo
v.poly([[L / 2 - RS["embudoD"] / 2 + .2, D - 1], [L / 2 - RS["embudoD"] / 2 - 3, D + RS["embudoH"]], [L / 2 - RS["embudoD"] / 2 - 1.8, D + RS["embudoH"]], [L / 2 - RS["embudoD"] / 2 + 1.2, D - .2]], "url(#VID)", .8)
v.poly([[L / 2 + RS["embudoD"] / 2 - .2, D - 1], [L / 2 + RS["embudoD"] / 2 + 3, D + RS["embudoH"]], [L / 2 + RS["embudoD"] / 2 + 1.8, D + RS["embudoH"]], [L / 2 + RS["embudoD"] / 2 - 1.2, D - .2]], "url(#VID)", .8)
# abajo: vista
v.poly([[r_, -t_] if False else [t_, -r_] for r_, t_ in ext] + [[L, 0], [0, 0]], "#fff", 1.2)
for a_, b_ in ((-26, 0), (L, L + 26)): v.rect(a_, b_, -C["D"] / 2, 0, "#fff", 1.0)
v.linea([[cu, -D], [cu, 0]], .4); v.linea([[L - cu, -D], [L - cu, 0]], .4)
v.eje(-30, 0, L + 30, 0)
v.cotaH(0, L, -D - 6, "178 (NBA1)", zext=-nb)
v.cotaV(L + 32, -D, D, "Ø69 (*)", yext=L - cu, c=OR)
v.cotaV(-30, -C["D"] / 2, C["D"] / 2, "Ø17", yext=-26)
v.cotaH(xu, xu + U["L"], D + 9, "UNION 30", zext=rs + 3)
a_, b_ = v.p(80, D + 1), v.p(80, -D + 6); lineaCorte(h, a_[0], a_[1], b_[0], b_[1], "B")
a_, b_ = v.p(-14, 12), v.p(-14, -12); lineaCorte(h, a_[0], a_[1], b_[0], b_[1], "C", lado=-1)
for n, (y, z), (gx, gy), tx in [("1", (150, D - .7), (640, 112), "MOLDE (DOS MEDIAS CAÑAS)"), ("2", (130, 22), (640, 136), "RESINA (*)"), ("3", (L / 2, D + 6), (520, 104), "EMBUDO (*)"),
                                ("4", (xu + 20, rs + 2.6), (640, 160), "UNION 2060"), ("5", (60, rs + 1.2), (640, 184), "CONDUCTOR (XLPE)"), ("6", (4, C["D"] / 2 + 1), (90, 104), "CINTA DE SELLADO (*)"),
                                ("7", (-20, C["D"] / 2 - .8), (90, 128), "VAINA PVC")]:
    a_ = v.p(y, z); h.globo(n, a_[0], a_[1], gx, gy, r=9); h.txt(gx + 14, gy + 4, tx, 9, 400, OR if "(*)" in tx else K)

# ================= 2. SECCION B-B · POR LAS UNIONES (color) · ESC. 1:1 (x 2,6) =================
k = 2.15; cx, cy = 130, 474
h.titulo(40, 340, "SECCION B-B", "POR LAS UNIONES (x = 80) · ESC. 1:1")
h.circ(cx, cy, D * k, "url(#VID)", K, 1.2); h.circ(cx, cy, (D - ee) * k, "#e9ecd2", K, .6); h.circ(cx, cy, (D - ee) * k, "url(#RES)", K, .6)
for i, a in enumerate([math.pi, math.pi / 2, 0, -math.pi / 2]):
    px, py = cx + rs * math.cos(a) * k, cy - rs * math.sin(a) * k
    if xU[i] <= 80 <= xU[i] + U["L"]:
        h.circ(px, py, U["De"] / 2 * k, "url(#CU)", K, .8); hilos(h, px, py, 7, 1.35, U["Di"] / 2 - .05, k, sw=.25)
    else:
        h.circ(px, py, rIn * k, COLS[i], K, .7); h.circ(px, py, rCu * k, "#e9a466", K, .4)
h.dimH(cy - D * k - 12, cx - D * k, cx + D * k, "Ø69 (*)", ext=cy, c=OR)
h.txt(cx + D * k + 8, cy + 40, "L1 Y L2: UNION", 9, 400); h.txt(cx + D * k + 8, cy + 52, "L3 Y N: AISLADOS", 9, 400)

# ================= 3. SECCION C-C · CABLE 4 x 10 (color) · ESC. 5:1 =================
k3 = 5; cx3, cy3 = 410, 474
h.titulo(320, 340, "SECCION C-C", "CABLE 4 x 10 · CAPAS · ESC. 5:1")
h.circ(cx3, cy3, C["D"] / 2 * k3, "#2a2a2a", K, 1.0); h.circ(cx3, cy3, (C["D"] / 2 - 1.6) * k3, "#c8c8c8", K, .5)
for i, a in enumerate([math.pi, math.pi / 2, 0, -math.pi / 2]):
    px, py = cx3 + rc * math.cos(a) * k3, cy3 - rc * math.sin(a) * k3
    h.circ(px, py, rIn * k3, COLS[i], K, .6); hilos(h, px, py, 7, 1.35, rCu, k3, sw=.25)
for t_, (ax, ay), (gx, gy) in [("VAINA PVC 1,6 (*)", (cx3 + 40, cy3 - 16), (470, 382)), ("RELLENO", (cx3 + 28, cy3 + 28), (500, 506)), ("XLPE 0,7", (cx3 + 2, cy3 - 24), (510, 400)), ("Cu 7 HILOS (*)", (cx3 + 4, cy3 + 18), (500, 530))]:
    llamada(h, ax, ay, gx, gy, t_, OR if "(*)" in t_ else K, anc="start" if gx > cx3 else "end", sz=9)
h.dimH(cy3 + C["D"] / 2 * k3 + 14, cx3 - C["D"] / 2 * k3, cx3 + C["D"] / 2 * k3, "Ø17", ext=cy3)

# ================= 4. D1 · UNION A COMPRESION 2060 · ESC. 4:1 =================
e4 = 5.8; u = Vista(h, 640, 474, e4)
h.titulo(600, 340, "D1 - UNION 2060", "DIN 46267 · ARRIBA ENGARZADA · ESC. 6:1")
zonas = [(0, 3, 0), (3, 10.5, 1), (10.5, 12.5, 0), (12.5, 17.5, 1), (17.5, 19.5, 0), (19.5, 27, 1), (27, 30, 0)]
for a_, b_, hx in zonas:
    ro_ = (5.2 / 2) if hx else U["De"] / 2
    u.rect(a_, b_, U["Di"] / 2 - (.35 if hx else 0), ro_, "url(#CU)", .8)
u.rect(-6, U["L"] / 2 - .3, 0, U["Di"] / 2 - .4, "url(#HIL)", .4); u.rect(U["L"] / 2 + .3, U["L"] + 6, 0, U["Di"] / 2 - .4, "url(#HIL)", .4)
u.rect(0, U["L"], -U["De"] / 2, 0, "#fff", 1.0); u.oculta([[0, -U["Di"] / 2], [U["L"], -U["Di"] / 2]])
u.eje(-8, 0, U["L"] + 8, 0)
u.cotaH(0, U["L"], -U["De"] / 2 - 3, "30", zext=-U["De"] / 2)
u.cotaV(U["L"] + 4, -U["De"] / 2, 0, "Ø6 (R 3)", yext=U["L"])
u.cotaV(-3, -U["Di"] / 2, 0, "", yext=0); h.txt(*u.p(-9.5, -1.4), "Ø4,5", 9)
u.cotaH(3, 10.5, U["De"] / 2 + 2.2, "K 6", zext=2.7)
h.txt(600, 528, "MATRIZ K 6 · 2 PASADAS POR LADO (*)", 9, 400, OR)
h.txt(600, 541, "PELAR 16 POR LADO; SE TOCAN EN EL MEDIO (*).", 9, 400, OR)

# ================= TABLAS =================
TY = 580
fk = [["KIT REF.", "Ø CABLE", "SECCIONES (4 COND.)", "LARGO MOLDE", "RESINA"], ["NBA0", "6 - 16", "4x1,5 A 4x4", "148", "90 ml"], ["NBA1", "10 - 22", "4x1,5 A 4x10", "178", "135 ml"],
      ["NBA2", "12 - 25", "4x4 A 4x16", "230", "200 ml"], ["NBA3", "13 - 32", "4x10 A 4x25", "270", "370 ml"]]
yk = h.tabla(40, TY, [(80, "c", False), (80, "c", True), (150, "c", False), (100, "c", True), (70, "c", True)], fk, rowh=14,
             titulo="KITS DE REFERENCIA (3M SCOTCHCAST 92-NBA · FICHA DE LA APP)", colores=lambda i, j, t: NV if i == 2 else K)
h.txt(40, yk + 12, "EN AZUL: NBA1, EL DIBUJADO (4 x 10, Ø17).", 9.5, 400, NV)
USO = {2020: "EMPALME RECTO · ITEMS 78 / 79", 2019: "DERIVACION ≤ 4 x 6 (*)", 2060: "UNION 10 mm² · DIN 46267"}
fc = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "USO"]]
for c in [2020, 2019, 2060]: r = cat(c, 44); fc.append([r[0], r[1], r[2] + (" (*)" if r[2] == "m" else ""), USO[c]])
yc_ = h.tabla(40, yk + 30, [(50, "c", True), (290, "l", False), (54, "c", False), (190, "l", False)], fc, rowh=14, titulo="CODIGOS DEL PAÑOL (3)", colores=colorOR)
yr = rayados3(h, 640, TY, ["VID", "RES", "XLP", "HIL", "CU", "PLAS2", "GOM"], cols=1, dx=200, rowh=18)
bloque(h, 40, yc_ + 22, "COMO SE HACE (RESUMEN)", [
    "PELAR LA VAINA, ABRIR LOS CONDUCTORES Y ESCALONAR LAS UNIONES (NO EN EL MISMO LUGAR).",
    "ENGARZAR CADA UNION 2060 CON MATRIZ K 6; LIMPIAR Y LIJAR LA VAINA DONDE APOYA EL MOLDE.",
    "CERRAR EL MOLDE, SELLAR LAS BOCAS Y LLENAR CON LA RESINA MEZCLADA HASTA EL EMBUDO."], w=780, sz=10, lh=13.5)
notasW(h, 40, yc_ + 90, [
    "COTAS EN mm. LA TABLA ES DE UNA MARCA DE REFERENCIA (3M SCOTCHCAST 92-NBA, HD 631.1 S2): SEGUIR EL KIT QUE SE COMPRO. 178 x 69: RS / ENRGTECH (NO DICE SI 69 ES EL Ø).",
    "(*) Ø DEL MOLDE, BOCAS, EMBUDO, COLOR DE LA RESINA Y CINTA DE SELLADO: PROPORCIONALES, A CONFIRMAR CON EL KIT.",
    "UNION 2060: 30 x Ø6 x Ø4,5, MATRIZ K 6 (CELLPACK DV-CU-V 10 · KLAUKE 122R · CIMCO 31). CANTIDAD DE PASADAS (*).",
    "(*) 2019 Y 2020 FIGURAN EN «m» EN EL PAÑOL Y SON KITS: REVISAR LA UNIDAD. 2019 (DERIVACION) LLEVA MOLDE EN «T»: A CONFIRMAR."], w=800, lh=13.5)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - EMPALME CON RESINA EN CABLE 4 x 10", "CORTE A CUARTO POR EL EJE EN LA MITAD IZQUIERDA: MOLDE, RESINA, CONDUCTORES Y UNIONES")
A = img3d(h, "conex_resina", 880, 84, 640)
columna(h, A, [("embudo", "3", "EMBUDO (*)"), ("molde", "1", "MOLDE TRANSPARENTE"), ("resina", "2", "RESINA (*)"), ("union", "4", "UNION 2060"), ("unionCorte", "", "UNION CORTADA"),
               ("xlpe", "5", "CONDUCTOR XLPE"), ("cableD", "", "CABLE 4 x 10"), ("cinta", "6", "CINTA (*)"), ("cobre", "", "COBRE 10 mm²"), ("relleno", "", "RELLENO"), ("vaina", "7", "VAINA")], 1500, 104, 470, paso=25)
h.titulo(890, 500, "D1 EN 3D - UNION A COMPRESION 10 mm² (2060)", "ARRIBA: ANTES, CONDUCTORES PELADOS ENTRANDO · ABAJO: ENGARZADA, CORTADA A CUARTO")
A2 = img3d(h, "conex_union", 880, 520, 640)
columna(h, A2, [("tubo", "", "TUBO Cu ESTAÑADO"), ("pelado", "", "CONDUCTOR PELADO"), ("hex", "", "MARCA HEXAGONAL K 6"), ("hilos", "", "7 HILOS"), ("centro", "", "SE TOCAN EN EL MEDIO (*)")], 1500, 540, 800, paso=28)
columna(h, A2, [("aisl", "", "AISLACION XLPE")], 902, 790, 800)
bloque(h, 890, 848, "DONDE SE USA", [
    "EMPALMES DEL TRONCAL ENTERRADO (ITEMS 78 / 79). QUEDA ESTANCO Y SE PUEDE ENTERRAR EN LA ZANJA (AP-TC-001).",
    "DERIVACIONES BT HASTA 4 x 6 (2019). LA UNION 2060 TAMBIEN VA EN EL EMPALME TERMOCONTRAIBLE (MAT-EMPALMES-3)."], w=740, sz=10, lh=14)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/conex_resina.mjs, conex_union.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES_conex.md", 9.5, 400, G, "start", INT)
rotuloB(h, "MAT-EMPALMES-2", "EMPALME CON RESINA", "Y UNION A COMPRESION 2060", "CORTE A-A, SECCIONES B-B Y C-C, D1 Y 3D", "VARIAS", "INDICADAS · 3D S/E")
guardar(h, "mat_empalmes_2")
