"""MAT-ACCESORIOS_PAT-2 (rev. B) · Bloquete de bronce RW 1/2" × 50 (7003, MN 1101 b) soldado al fuste, terminal banderita (7018) y bulón 1/2".
Geometría: r3d/piezas/perfiles_pat.mjs (BLQ, BAN, BUL); 3D: r3d/out/pat_acc2a.png, pat_acc2b.png. Fuentes: r3d/FUENTES_pat.md"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *

Bq = PP["BLQ"]; Bn = PP["BAN"]; W = PP["BUL"]["w12"]; Bu = PP["BUL"]
h = hojaP()

# ================= CORTE A-A (2:1) =================
h.titulo(40, 62, "CORTE A-A - BLOQUETE SOLDADO AL FUSTE", 'ESC. 2:1 · COLUMNA METALICA EXISTENTE (AP-TC-005 HOJA 2/2) · ROSCA RW 1/2" EN CORTE')
e = 3.0; ox, oy = 110, 225; X = lambda x: ox + x * e; Y = lambda y: oy - y * e
f = Bq["fuste"]; R0 = Bq["D"] / 2; L = Bq["L"]; P = Bq["rosca"]["paso"]; rd = Bq["rosca"]["d"] / 2
# fuste (pared, rayado acero) con el agujero NO pasante: el bloquete va sobre la cara
h.rect(X(-f), Y(32), f * e, 64 * e, "url(#ACE)", K, 1.4)
for yy in (32, -32): h.path(f"M{X(-f) - 5},{Y(yy) + 4} q{(f * e + 10) / 2},-8 {f * e + 10},0", "none", K, .8)
# bloquete en corte: dos mitades rayadas (bronce) con la rosca interior de Bq["prof"]
x0r = L - Bq["prof"]
for lado in (-1, 1):
    inn = roscaPts(X(x0r), X(L), oy, rd, P, 55, e, lado, ext=False)
    d = f"M{X(0):.1f},{oy + lado * 0.0:.1f} L{X(0):.1f},{oy + lado * R0 * e:.1f} L{X(L - 1.5):.1f},{oy + lado * R0 * e:.1f} L{X(L):.1f},{oy + lado * (R0 - 1.5) * e:.1f} L{X(L):.1f},{inn[-1][1]:.1f} " + \
        " ".join(f"L{x:.1f},{y:.1f}" for x, y in reversed(inn)) + f" L{X(x0r):.1f},{oy:.1f} Z"
    h.path(d, "url(#BRZ)", K, 1.3)
# fondo del agujero (cono de la mecha)
h.path(f"M{X(x0r)},{oy - (rd - .9) * e} L{X(x0r - 4)},{oy} L{X(x0r)},{oy + (rd - .9) * e}", "none", K, .8)
# cordones de soldadura (filete) en el pie
for lado in (-1, 1): h.path(f"M{X(0)},{oy + lado * R0 * e} l0,{lado * 7} l9,{-lado * 7} Z", "#222", K, .8)
ejeH(h, X(-8), X(L + 24), oy)
# banderita y bulón (en el mismo corte: la palma apretada contra la cara del bloquete)
h.rect(X(L), oy - Bn["a"] / 2 * e, Bn["e"] * e, Bn["a"] * e, "url(#CU)", K, 1.2)
h.rect(X(L + Bn["e"]), oy - Bu["plana"]["de"] / 2 * e, Bu["plana"]["e"] * e, Bu["plana"]["de"] * e, "url(#HG)", K, 1.0)
xh = L + Bn["e"] + Bu["plana"]["e"] + Bu["presion"]["e"]
h.rect(X(L + Bn["e"] + Bu["plana"]["e"]), oy - Bu["presion"]["de"] / 2 * e, Bu["presion"]["e"] * e, Bu["presion"]["de"] * e, "url(#HG)", K, 1.0)
# bulón (vista, no se raya): cabeza + vástago roscado que entra 24 en el bloquete
ac = W["af"] / math.cos(math.pi / 6)
h.rect(X(xh), oy - ac / 2 * e, W["k"] * e, ac * e, "#fff", K, 1.3); h.ln(X(xh), oy - ac / 4 * e, X(xh + W["k"]), oy - ac / 4 * e, K, .6); h.ln(X(xh), oy + ac / 4 * e, X(xh + W["k"]), oy + ac / 4 * e, K, .6)
up = roscaPts(X(L - 24), X(xh), oy, rd, P, 55, e, -1); dn = roscaPts(X(L - 24), X(xh), oy, rd, P, 55, e, 1)
h.path(poly(up) + " L" + " L".join(f"{x:.1f},{y:.1f}" for x, y in reversed(dn)) + " Z", "#fff", K, .9)
h.dimV(X(-f) - 22, oy - R0 * e, oy + R0 * e, "Ø30 (*)", ext=X(-f), c=OR)
h.dimH(oy - R0 * e - 40, X(0), X(L), "50 (PAÑOL)", ext=oy - R0 * e)
h.dimH(oy - R0 * e - 18, X(x0r), X(L), "30 (*)", ext=oy - R0 * e, c=OR)
h.dimH(oy + R0 * e + 52, X(-f), X(0), "4 (*)", ext=oy + R0 * e) if False else None
llamada(h, X(-f / 2), Y(-28), X(-f) - 8, Y(-36), "FUSTE 4 (*)", OR, "end")
for n, (px, py), (gx, gy) in [("1", (L * .35, R0 * .6), (L * .12, R0 + 8)), ("2", (0, -R0 - 2), (-6, -R0 - 10)), ("3", (L - 8, -rd + .3), (L - 30, -R0 - 10)),
                              ("4", (L + 1, Bn["a"] / 2 - 3), (L + 10, Bn["a"] / 2 + 10)), ("5", (xh + W["k"] / 2, -3), (xh + 20, -R0 - 6)), ("6", (L + Bn["e"] + 1, -Bu["plana"]["de"] / 2 + 1), (L + 12, -R0 - 10))]:
    h.globo(n, X(px), Y(py), X(gx), Y(gy), r=8)
h.circ(X(L - 10), oy - rd * e, 12, "none", K, .6, 'stroke-dasharray="3 2"'); h.txt(X(L - 10) - 4, oy - rd * e - 16, "D1", 10, 700, K, "end")

# ================= D1 rosca Whitworth (12:1) =================
h.titulo(560, 62, "D1 - ROSCA WHITWORTH RW 1/2\"", "ESC. 12:1 · 12 HILOS POR PULGADA · 55°")
ed = 12.0; dx0, dy0 = 590, 190; Hf = P / (2 * math.tan(math.radians(27.5))); hp = .640327 * P
pts = []
for i in range(3 * 16 + 1):
    z = 3 * P * i / 48; s = (z / P) % 1; tri = 1 - abs(2 * s - 1)
    rr = min(Hf / 6 * 5, max(Hf / 6, Hf * tri))   # truncado 1/6 arriba y abajo (perfil Whitworth)
    pts.append((dx0 + z * ed, dy0 - (rr - Hf / 6) * ed))
h.path(poly(pts) + f" L{dx0 + 3 * P * ed},{dy0 + 30} L{dx0},{dy0 + 30} Z", "url(#BRZ)", K, 1.2)
h.path(poly([(x, y - 1.5) for x, y in pts]), "none", K, .5, 'stroke-dasharray="2 2"')
h.dimH(dy0 - hp * ed - 26, dx0 + P * .5 * ed, dx0 + P * 1.5 * ed, "P = 2,117 (1\"/12)", ext=dy0 - hp * ed)
h.dimV(dx0 + 3 * P * ed + 18, dy0 - hp * ed, dy0, "h = 0,64 P = 1,36", ext=dx0 + 3 * P * ed)
cxp = dx0 + P * 1.0 * ed
h.ln(cxp, dy0 - hp * ed - 4, cxp - 18, dy0 + 6, K, .6); h.ln(cxp, dy0 - hp * ed - 4, cxp + 18, dy0 + 6, K, .6)
h.txt(cxp, dy0 + 22, "55°", 10, 700, K, "middle")
h.txt(560, 250, "CRESTAS Y FONDOS REDONDEADOS (r = 0,137 P).", 9.5); h.txt(560, 263, "NO ES METRICA: UN M12 (1,75 · 60°) NO ENTRA.", 9.5, 700)

# ================= BANDERITA (2:1) =================
h.titulo(40, 330, "TERMINAL BANDERITA 7018 - VISTA Y CORTE C-C", "ESC. 2:1 · Cu ESTAÑADO · OJAL Ø14,6 (AP-TC-005) · CAÑO PARA 10 + 2,5 mm² (AP-TC-006)")
e2 = 2.0; bx, by = 120, 470; Xb = lambda u: bx + u * e2; Yb = lambda v: by - v * e2
a2 = Bn["a"] / 2
pal = [(a2 * math.cos(math.pi * i / 32), a2 * math.sin(math.pi * i / 32)) for i in range(33)] + [(-a2, -Bn["Lp"] + 8), (a2, -Bn["Lp"] + 8)]
h.path("M" + " L".join(f"{Xb(u):.1f},{Yb(v):.1f}" for u, v in pal) + " Z", "#fff", K, 1.4)
h.circ(Xb(0), Yb(0), Bn["ojo"] / 2 * e2, "#fff", K, 1.2)
zc0 = -Bn["Lp"] + 8; cL = Bn["cano"]["L"]; rC = Bn["cano"]["De"] / 2
h.rect(Xb(-rC), Yb(zc0), 2 * rC * e2, cL * e2, "#fff", K, 1.3)
for k in (.35, .7): h.rect(Xb(-rC - .2), Yb(zc0 - cL * k + 1.5), (2 * rC + .4) * e2, 3 * e2, "#e9e9e9", K, .6)
h.rect(Xb(-3.2), Yb(zc0 - cL), 6.4 * e2, 14 * e2, "url(#PVCV)", K, 1.0)
ejeV(h, Xb(0), Yb(a2 + 8), Yb(zc0 - cL - 18))
h.dimH(Yb(a2) - 14, Xb(-a2), Xb(a2), "30 (*)", ext=Yb(0), c=OR)
h.dimH(Yb(0) - 6, Xb(-Bn["ojo"] / 2), Xb(Bn["ojo"] / 2), "Ø14,6", ext=None)
h.dimV(Xb(a2) + 40, Yb(zc0), Yb(zc0 - cL), "22 (*)", ext=Xb(rC), c=OR)
lineaCorte(h, Xb(-a2) - 14, Yb(zc0 - cL * .5), Xb(a2) + 14, Yb(zc0 - cL * .5), "C")
llamada(h, Xb(rC), Yb(zc0 - cL * .35), Xb(a2) + 60, Yb(zc0 - cL * .2), "ENGARCE CON PINZA (2 MARCAS)")
llamada(h, Xb(0), Yb(zc0 - cL - 8), Xb(a2) + 60, Yb(zc0 - cL - 8), "AISLACIONES V/A 10 Y 2,5")
# corte C-C: caño con los dos cables adentro
cx, cy = 400, 440; ec = 7.0
h.circ(cx, cy, rC * ec, "url(#CU)", K, 1.3); h.circ(cx, cy, Bn["cano"]["Di"] / 2 * ec, "#fff", K, 1.0)
for (u, rr, n) in ((-.7, 2.0, 7), (1.9, .95, 7)):
    for k in range(n):
        a = 2 * math.pi * k / 6; q = 0 if k == 6 else rr * .62
        h.circ(cx + (u + q * math.cos(a)) * ec, cy + q * math.sin(a) * ec, rr * .33 * ec, "url(#cuG)", "#7a3a12", .4)
h.txt(cx, cy + rC * ec + 18, "CORTE C-C (7:1)", 10, 700, K, "middle"); h.txt(cx, cy + rC * ec + 31, "CUERDA DE 10 + CUERDA DE 2,5 JUNTAS", 9.5, 400, K, "middle")
h.txt(cx, cy + rC * ec + 44, "Ø EXT. 9 · INT. 6,2 (*)", 9.5, 400, OR, "middle")

# ================= BLOQUETE DE HIERRO (no usar) =================
h.titulo(560, 330, "BLOQUETE DE HIERRO 7002 - NO USAR", "MN 1101 a · NO CUMPLE: SE OXIDA EN LA UNION")
hx, hy = 600, 380
h.rect(hx, hy, 70, 40, "url(#ACE)", K, 1.2); h.path(f"M{hx - 6},{hy - 6} L{hx + 76},{hy + 46} M{hx + 76},{hy - 6} L{hx - 6},{hy + 46}", "none", OR, 2.2)
h.txt(hx + 90, hy + 16, "USAR SOLO EL DE", 10, 700); h.txt(hx + 90, hy + 30, "BRONCE 7003", 10, 700)

# ================= TABLAS =================
yC = codigos(h, 40, 610, [7003, 7002, 7018, 4016, 4014, 4013], {7003: "va soldado · col. existente", 7002: "NO USAR (no cumple)", 7018: "ojal Ø14,6 · 10 + 2,5 mm²", 4016: "bulón 1/2\" (*)", 4014: "arandela plana", 4013: "arandela de presión"}, wdesc=430, wx=170)
yD = bloque(h, 40, yC + 18, "DATOS TECNICOS Y DONDE SE USA", [
    "BLOQUETE 7003: BRONCE · ROSCA RW 1/2\" × 50 (MN 1101 b). EN EPEC ES EL «ESPARRAGO CON TUERCA Q320 / Q320E». AP-C-006: TUERCA RW 1/2\" DE BRONCE SOLDADA.",
    "SOLO EN COLUMNA METALICA EXISTENTE (AP-TC-005 HOJA 2/2): 1 BANDERITA + 1 BLOQUETE. LA COLUMNA NUEVA USA EL BULON DE PAT DE LA CAJA.",
    "AP-TC-006 (ACOMETIDA AEREA): LA BANDERITA APRIETA EL 10 mm² DE LA JABALINA Y EL 2,5 mm² DEL ARTEFACTO, JUNTOS. QUEDA TAPADA CON LA TORTA."], w=800, sz=10, lh=13.5)
notasW(h, 40, yD + 2, [
    "COTAS EN mm. MANDA LA COTA. EL FUSTE SE DIBUJA PLANO EN EL CORTE (ES UN CAÑO).",
    "(*) Ø EXTERIOR DEL BLOQUETE, PROFUNDIDAD DE LA ROSCA, ESPESOR DEL FUSTE Y MEDIDAS DE LA BANDERITA (SALVO EL OJAL Ø14,6): A CONFIRMAR CON EL FABRICANTE.",
    "(*) ABIERTO (REVISION DE TIPOS): «BULON DE PAT RW 1/2\" CON TERMINAL DE OJAL 5/16\"»: NO ENTRA. ¿CUAL VA? EL 4016 ES DE 250 mm (MN 52): SE USA UNO CORTO (*).",
    "(*) UNIFICAR EL NOMBRE: RW 1/2\" / Q-320E / MN 1101 b / «DE LATON» ES LA MISMA PIEZA (7003). WHITWORTH 55° · 12 HILOS (NO ES M12).",
    "SOLDADURA EN TODO EL PERIMETRO Y PINTURA ANTIOXIDO ENCIMA. FUENTES: FICHA DE LA APP (EPEC P_140278; LP 21478); r3d/FUENTES_pat.md."], w=800, lh=14)
rayadosC(h, 40, 1104, ["BRZ", "ACE", "CU", "HG", "PVCV"], cols=5, dx=160)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - BLOQUETE, BANDERITA Y BULON (DESPIECE)", "BLOQUETE CORTADO A CUARTO: SE VE LA ROSCA WHITWORTH REAL · CORDON DE SOLDADURA AL FUSTE")
A = img3d(h, "pat_acc2a", 860, 100, 580)
columna(h, A, [("bulon", "5", "BULON 1/2\" WHITWORTH"), ("presion", "", "ARANDELA DE PRESION"), ("plana", "6", "ARANDELA PLANA"), ("ojo", "", "OJAL Ø14,6"),
               ("banderita", "4", "BANDERITA 7018"), ("rosca", "3", "ROSCA INTERIOR (CORTE)"),  ("bloquete", "1", "BLOQUETE DE BRONCE 7003"), ("soldadura", "2", "CORDON DE SOLDADURA"),
               ("fuste", "", "FUSTE DE LA COLUMNA"), ("cable25", "", "1 × 2,5 V/A DEL ARTEFACTO"), ("cable10", "", "1 × 10 V/A DE LA JABALINA")], 1450, 104, 540, paso=33)
h.txt(890, 584, "EN SU LUGAR - PIE DE LA COLUMNA EXISTENTE (TORTA Y TERRENO CORTADOS)", 11, 700, NV, "start", INT)
A2 = img3d(h, "pat_acc2b", 880, 594, 500)
columna(h, A2, [("columna", "", "COLUMNA METALICA EXISTENTE"), ("bloquete", "1", "BLOQUETE 7003"), ("banderita", "4", "BANDERITA + BULON"), ("torta", "", "TORTA DE HORMIGON"),
                ("cable", "", "CABLE 1 × 10 V/A"), ("tomacable", "", "TOMACABLE"), ("jabalina", "", "JABALINA 7015"), ("terreno", "", "TERRENO")], 1400, 620, 1000, paso=34)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/pat_acc2a.mjs, pat_acc2b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_pat.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-ACCESORIOS_PAT-2", "BLOQUETE DE BRONCE", "Y TERMINAL BANDERITA", "CORTE A-A, D1 ROSCA, BANDERITA Y 3D", "2:1 / 12:1", "C-C 7:1 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_accesorios_pat_2.svg"))
