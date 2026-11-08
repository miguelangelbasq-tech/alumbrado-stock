"""MAT-ACCESORIOS_PAT-1 (rev. B) · Barra de puesta a tierra 125 A (7001) y bornes de PAT 6 mm² en riel (7004–7007, DE BAJA).
Geometría: r3d/piezas/perfiles_pat.mjs (BARRA) y perfiles.mjs (BPN, el mismo cuerpo que el BPN-06); 3D: r3d/out/pat_acc1a.png, pat_acc1b.png. Fuentes: r3d/FUENTES_pat.md"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *

B = PP["BARRA"]; Bp = PERF["BPN"]
h = hojaP()

# ================= FRENTE DE LA BARRA (1:1,6) =================
h.titulo(40, 62, "BARRA DE PAT 125 A (7001) - VISTA DE ARRIBA", "ESC. 1,6:1 · COBRE SOBRE 2 AISLADORES · 7 AGUJEROS ROSCADOS M6 (*)")
e = 1.6; ox, oy = 110, 168; X = lambda x: ox + x * e; Y = lambda y: oy + y * e
h.rect(X(-25), Y(-26), (B["L"] + 50) * e, 52 * e, "#fff", K, .6, 'stroke-dasharray="6 3"'); h.txt(X(B["L"] + 25) - 4, Y(26) - 4, "CHAPA DE MONTAJE", 8.5, 400, G, "end")
h.rect(X(0), Y(-B["a"] / 2), B["L"] * e, B["a"] * e, "url(#CU)", K, 1.5)
xs = [25 + i * B["paso"] for i in range(B["agujeros"])]
for x in xs: h.circ(X(x), Y(0), 3.1 * e, "#fff", K, 1)
for x in (10, B["L"] - 10):
    rc = B["ais"]["D"] / 2 / math.cos(math.pi / 6)
    h.a(f'<polygon points="{" ".join(f"{X(x) + rc * e * math.cos(math.pi / 6 + i * math.pi / 3):.1f},{Y(0) + rc * e * math.sin(math.pi / 6 + i * math.pi / 3):.1f}" for i in range(6))}" fill="none" stroke="{K}" stroke-width=".7" stroke-dasharray="5 3"/>')
    h.circ(X(x), Y(0), 5 * e, "#fff", K, 1); h.circ(X(x), Y(0), 3 * e, "none", K, .6)
ejeH(h, X(-12), X(B["L"] + 12), Y(0))
h.dimH(Y(-B["a"] / 2) - 44, X(0), X(B["L"]), "200 (*)", ext=Y(-B["a"] / 2), c=OR)
h.dimH(Y(B["a"] / 2) + 26, X(xs[0]), X(xs[1]), "25 (*)", ext=Y(0), c=OR)
h.dimV(X(B["L"]) + 26, Y(-B["a"] / 2), Y(B["a"] / 2), "20 (*)", ext=X(B["L"]), c=OR)
lineaCorte(h, X(10), Y(-B["a"] / 2) - 22, X(10), Y(B["a"] / 2) + 24, "A")
lineaCorte(h, X(xs[2]), Y(-B["a"] / 2) - 22, X(xs[2]), Y(B["a"] / 2) + 24, "B")
h.globo("1", X(120), Y(4), X(130), Y(B["a"] / 2) + 40, r=8); h.globo("2", X(B["L"] - 10) + 10, Y(8), X(B["L"] - 10) + 28, Y(B["a"] / 2) + 40, r=8)
h.txt(X(0), Y(B["a"] / 2) + 66, "UNA BORNA POR CABLE: 1 × 10 DE LA JABALINA + LAS TIERRAS DEL TABLERO (1 × 2,5 / 1 × 6).", 9.5)

# ================= CORTE A-A (por el aislador, 3:1) =================
h.titulo(40, 278, "CORTE A-A (AISLADOR)", "ESC. 3:1")
e2 = 3.0; ox2, oy2 = 150, 400; X2 = lambda x: ox2 + x * e2; Z2 = lambda z: oy2 - z * e2
hA = B["ais"]["H"]; rA = B["ais"]["D"] / 2
h.rect(X2(-40), Z2(0), 80 * e2, 2 * e2, "url(#HG)", K, 1.0)                       # chapa
h.path(f"M{X2(-rA)},{Z2(0)} V{Z2(2)} L{X2(-rA + 2.5)},{Z2(4)} V{Z2(hA - 4)} L{X2(-rA)},{Z2(hA - 2)} V{Z2(hA)} H{X2(rA)} V{Z2(hA - 2)} L{X2(rA - 2.5)},{Z2(hA - 4)} V{Z2(4)} L{X2(rA)},{Z2(2)} V{Z2(0)} Z", "url(#PLAS)", K, 1.3)
for z0, z1 in ((-6, 9), (hA - 9, hA + B["e"] + 4.5)):   # insertos / espárrago M6
    h.rect(X2(-3), Z2(z1), 6 * e2, (z1 - z0) * e2, "#fff", K, .9)
h.rect(X2(-B["a"] / 2), Z2(hA + B["e"]), B["a"] * e2, B["e"] * e2, "url(#CU)", K, 1.3)
h.rect(X2(-5), Z2(hA + B["e"] + 4.5), 10 * e2, 4.5 * e2, "#fff", K, 1.1)
h.rect(X2(-3), Z2(-6), 6 * e2, 2 * e2, "#fff", K, .8)
ejeV(h, X2(0), Z2(hA + 14), Z2(-10))
h.dimV(X2(rA) + 20, Z2(0), Z2(hA), "25 (*)", ext=X2(rA), c=OR); h.dimH(Z2(0) + 20, X2(-rA), X2(rA), "HEX 25 (*)", ext=Z2(0), c=OR)
h.dimV(X2(-B["a"] / 2) - 16, Z2(hA), Z2(hA + B["e"]), "5 (*)", ext=X2(-B["a"] / 2), c=OR)
h.globo("2", X2(rA - 3), Z2(hA / 2), X2(rA) + 54, Z2(hA / 2), r=8); h.globo("1", X2(4), Z2(hA + 2.5), X2(rA) + 54, Z2(hA + 12), r=8)
llamada(h, X2(-30), Z2(1), X2(-40), Z2(-14), "CHAPA DEL TABLERO", K, "start")

# ================= CORTE B-B (por un agujero con su ojal, 4:1) =================
h.titulo(330, 278, "CORTE B-B (BORNA CON OJAL)", "ESC. 4:1 · TORNILLO M6 + ARANDELA SOBRE EL OJAL 10 mm²")
e3 = 4.0; ox3, oy3 = 470, 400; X3 = lambda x: ox3 + x * e3; Z3 = lambda z: oy3 - z * e3
h.rect(X3(-B["a"] / 2), Z3(B["e"]), B["a"] * e3, B["e"] * e3, "url(#CU)", K, 1.3)
for xx0, xx1 in ((-B["a"] / 2, -3.0), (3.0, B["a"] / 2)): pass
h.rect(X3(-3), Z3(B["e"]), 6 * e3, B["e"] * e3, "#fff", K, .6)
# ojal (palma) + arandela + tornillo
h.rect(X3(-7.5), Z3(B["e"] + 1.8), 15 * e3, 1.8 * e3, "url(#CU)", K, 1.1)
h.rect(X3(-6), Z3(B["e"] + 3.0), 12 * e3, 1.2 * e3, "url(#HG)", K, 1.0)
h.rect(X3(-3), Z3(B["e"] + 3.0), 6 * e3, (B["e"] + 3.0 + 4) * e3, "#fff", K, 1.0)
for z in [i * 1.0 for i in range(-4, 5)]: h.ln(X3(-3), Z3(z) , X3(3), Z3(z - .5), K, .35)
h.rect(X3(-5.8), Z3(B["e"] + 7), 11.6 * e3, 4 * e3, "#fff", K, 1.2)
ejeV(h, X3(0), Z3(B["e"] + 14), Z3(-8))
# barril del ojal saliendo hacia la derecha con la cuerda
h.path(f"M{X3(7.5)},{Z3(B['e'] + 1.8)} L{X3(12)},{Z3(B['e'] + 3.5)} H{X3(28)} V{Z3(B['e'] - 2.6)} H{X3(12)} L{X3(7.5)},{Z3(B['e'])} Z", "url(#CU)", K, 1.0)
h.rect(X3(28), Z3(B["e"] + 3.5), 10 * e3, 6.1 * e3, "url(#PVCV)", K, 1.0)
llamada(h, X3(20), Z3(B["e"] + 3.5), X3(24), Z3(B["e"] + 11), "OJAL Cu ESTAÑADO 10 mm² · M6")
llamada(h, X3(-5), Z3(B["e"] + 3.6), X3(-22), Z3(B["e"] + 3.6), "ARANDELA", K, "end")
llamada(h, X3(-4), Z3(B["e"] + 9), X3(-22), Z3(B["e"] + 9), "TORNILLO M6 (*)", OR, "end")
llamada(h, X3(-8), Z3(2), X3(-22), Z3(-2), "BARRA (ROSCA M6) (*)", OR, "end")
llamada(h, X3(33), Z3(B["e"] + 1), X3(36), Z3(-6), "CABLE V/A")

# ================= BORNES 7004–7007 (vista de arriba, 2:1) =================
h.titulo(40, 470, "BORNES DE PAT 7004–7007 EN RIEL NS35 (DE BAJA)", "ESC. 3:1 · VISTA DE ARRIBA · AZ AZUL · GR GRIS · VE VERDE · CUERPO DEL BPN-06")
e4 = 3.0; ox4, oy4 = 70, 528; P = Bp["paso"]; Cc = Bp["C"]
cols = [("AZ", "7004"), ("GR", "7005"), ("GR", "7006"), ("VE", "7007")]
h.rect(ox4 - 10, oy4 + 9 * e4, (4 * P) * e4 + 20, 35 * e4, "url(#HG)", K, .6)
for i, (col, cod) in enumerate(cols):
    x0 = ox4 + i * P * e4
    h.rect(x0, oy4, P * e4, Cc * e4, "url(#PLAS)" if col == "VE" else "#fff", K, 1.2)
    for yT in Bp["yT"]: h.circ(x0 + P * e4 / 2, oy4 + yT * e4, 3.3 * e4, "#fff", K, .9); h.ln(x0 + P * e4 / 2 - 3, oy4 + yT * e4 + 3, x0 + P * e4 / 2 + 3, oy4 + yT * e4 - 3, K, .8)
    h.txt(x0 + P * e4 / 2, oy4 + Cc * e4 + 14, col, 8.5, 700, K, "middle"); h.txt(x0 + P * e4 / 2, oy4 + Cc * e4 + 26, cod, 8.5, 400, K, "middle", MONO)
h.dimH(oy4 - 8, ox4, ox4 + P * e4, "8,2", ext=oy4)
h.dimV(ox4 + 4 * P * e4 + 26, oy4, oy4 + Cc * e4, "53", ext=ox4 + 4 * P * e4)
bloque(h, 250, 512, "QUE SON", [
    "BORNES DE PASO PARA 6 mm² (TORNILLO ARRIBA Y ABAJO), EN COLORES.",
    "LA TIERRA VA SIEMPRE VERDE (O VERDE-AMARILLO): EL AZUL Y LOS GRISES NO SIRVEN COMO TIERRA.",
    "DE BAJA (CLAUDE.md §11.3): SE USA LA BPN 6 mm² VERDE 2010 (ÍTEM 63). 7005 = 7006 (MISMO MATERIAL).",
    "(*) DUDA: SI 7004–7007 «BORNE DE PAT 6 mm²» SON BPN-06 DE OTRO COLOR. PREGUNTAR ANTES DE UNIR NADA."], w=430, sz=10, lh=13)

# ================= TABLAS =================
yC = codigos(h, 40, 718, [7001, 7004, 7005, 7006, 7007], {7001: "125 A · llega la jabalina", 7004: "DE BAJA (usar 2010)", 7005: "= 7006 · DE BAJA", 7006: "= 7005 · DE BAJA", 7007: "DE BAJA (usar 2010)"}, wdesc=420, wx=180)
yD = bloque(h, 40, yC + 18, "DATOS TECNICOS Y DONDE SE USA", [
    "BARRA 7001: COBRE ELECTROLITICO SOBRE 2 AISLADORES DE RESINA, 125 A (DESCRIPCION DEL PAÑOL). MEDIDAS NO PUBLICADAS (*).",
    "AP-T-007 (TT): LA BARRA DE PAT DEL TABLERO VA SOLA A SU JABALINA; NO SE UNE AL NEUTRO. AP-T-008 (TN-S): BARRA DE PAT DEL TABLERO.",
    "LLEGA EL CABLE 1 × 10 V/A DE LA JABALINA CON OJAL (GUIA PAT) Y TODAS LAS TIERRAS DEL TABLERO. CALCULO: 10 m DE 1 × 10 POR TABLERO.",
    "AP-CC-014: TABLERO DE CONEXIONADO DE COLUMNA."], w=800, sz=10, lh=13.5)
notasW(h, 40, yD + 2, [
    "COTAS EN mm. MANDA LA COTA. LA BARRA SE DIBUJA COMO LAS COMERCIALES DE 125 A (20 × 5, 7 AGUJEROS M6 CADA 25, AISLADORES HEX 25).",
    "(*) LARGO, SECCION, PASO Y ROSCA DE LOS AGUJEROS Y AISLADORES DE LA BARRA: NO ESTAN EN LA APP NI EN EL PAÑOL. A CONFIRMAR CON LA QUE SE COMPRA.",
    "7004–7007 ESTAN DE BAJA: NO SE COMPRAN. SE DIBUJAN CON EL CUERPO DEL BPN-06 (MISMO PASO 8,2 Y LARGO 53) PORQUE SON PARA 6 mm² (*).",
    "UN OJAL POR TORNILLO. CON ARANDELA; SIN ARANDELA DE PRESION SOBRE EL COBRE (*). FUENTES: r3d/FUENTES_pat.md."], w=800, lh=14)
rayadosC(h, 40, 1104, ["CU", "HG", "PLAS", "PVCV"], cols=4, dx=190)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - BARRA DE PAT DEL TABLERO", "COBRE SOBRE AISLADORES, CON EL OJAL DEL 1 × 10 V/A DE LA JABALINA Y DOS TIERRAS 1 × 2,5")
A = img3d(h, "pat_acc1a", 870, 104, 560)
columna(h, A, [("agujero", "", "AGUJERO ROSCADO M6 (*)"), ("arandela", "", "ARANDELA"), ("barra", "1", "BARRA DE COBRE 7001"), ("aislador", "2", "AISLADOR DE RESINA (*)"),
               ("tornillo", "", "TORNILLO M6"), ("esparrago", "", "ESPARRAGO DEL AISLADOR"), ("chapa", "", "CHAPA DEL TABLERO"), ("ojal10", "", "OJAL 10 mm²"),
               ("cable25", "", "TIERRA 1 × 2,5 V/A"), ("cable10", "", "1 × 10 V/A A LA JABALINA")], 1440, 110, 500, paso=34)
h.txt(890, 556, "BORNES DE PAT EN RIEL: 7004 AZUL · 7005 / 7006 GRIS · 7007 VERDE (DE BAJA)", 11, 700, NV, "start", INT)
A2 = img3d(h, "pat_acc1b", 880, 560, 520)
columna(h, A2, [("marca", "", "MARCADOR CON EL CODIGO"), ("azul", "", "7004 AZUL (NO ES TIERRA)"), ("gris", "", "7005 GRIS"), ("gris2", "", "7006 GRIS (= 7005)"), ("verde", "", "7007 VERDE"),
                ("tornillo", "", "TORNILLO M4"), ("cable", "", "CABLE CON PUNTERA"), ("riel", "", "RIEL NS35 (2038)")], 1420, 590, 990, paso=34)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/pat_acc1a.mjs, pat_acc1b.mjs; bornes con piezas/bpn.mjs). FUENTES: r3d/FUENTES_pat.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-ACCESORIOS_PAT-1", "BARRA DE PAT", "Y BORNES DE TIERRA", "VISTA, CORTES A-A Y B-B, BORNES Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_accesorios_pat_1.svg"))
