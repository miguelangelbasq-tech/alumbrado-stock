"""MAT-HERRAJES-3 (rev. B) · Bulones 1/2" (4016 MN 52 · 4018 · 4017), arandela plana 4014 y de presión 4013, tuercas 4037 / 4036 / 4039, chapa de retención 4020,
espárrago M16 × 190 (4023), capuchón R15 (4031). Rosca Whitworth 55° vs métrica 60°; galvanizado en caliente.
Geometría: r3d/piezas/perfiles_pat.mjs (BUL); 3D: r3d/out/pat_her3a.png, pat_her3b.png. Fuentes: r3d/FUENTES_pat.md"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *

B = PP["BUL"]; W = B["w12"]; Mm = B["m12"]
h = hojaP()

# ================= BULON EN MEDIO CORTE (2:1) =================
h.titulo(40, 62, "BULON 1/2\" × 90 (4018) CON ARANDELAS Y TUERCA", "ESC. 3:1 · MEDIO CORTE ARRIBA DEL EJE · RW 55°, 12 HILOS/PULG")
e = 3.0; ox, oy = 100, 205; X = lambda x: ox + x * e; Y = lambda y: oy - y * e
L, Lr = 90, 40; rd = W["d"] / 2; ac = W["af"] / math.cos(math.pi / 6)
# cabeza (vista de costado, 3 caras)
h.rect(X(-W["k"]), Y(ac / 2), W["k"] * e, ac * e, "#fff", K, 1.4)
for yy in (ac / 4, -ac / 4): h.ln(X(-W["k"]), Y(yy), X(0), Y(yy), K, .7)
h.path(f"M{X(-W['k'])},{Y(ac / 2) + 3} q4,-3 8,0 M{X(-W['k'])},{Y(-ac / 2) - 3} q4,3 8,0", "none", K, .6)
# vástago liso
h.rect(X(0), Y(rd), (L - Lr) * e, 2 * rd * e, "#fff", K, 1.3)
# rosca: abajo en vista (líneas), arriba en corte (perfil real)
up = roscaPts(X(L - Lr), X(L), oy, rd, W["paso"], 55, e, -1); dn = roscaPts(X(L - Lr), X(L), oy, rd, W["paso"], 55, e, 1)
h.path(poly(up) + f" L{X(L)},{oy} L{X(L - Lr)},{oy} Z", "url(#ACE)", K, 1.0)
h.path(poly(dn) + f" L{X(L)},{oy} L{X(L - Lr)},{oy} Z", "#fff", K, 1.0)
h.ln(X(L - Lr), Y(-rd + .85), X(L), Y(-rd + .85), K, .5)
# piezas apretadas sobre una chapa de 12 (*): plana, presión, tuerca (en corte arriba del eje)
xa = L - 26
h.rect(X(xa - 12), Y(22), 12 * e, 44 * e, "url(#HG)", K, .8); h.txt(X(xa - 6), Y(-22) + 12, "CHAPA (*)", 8.5, 400, OR, "middle")
for (x0, t, di, de, pat) in ((xa, B["plana"]["e"], B["plana"]["di"], B["plana"]["de"], "url(#ACE)"), (xa + B["plana"]["e"], B["presion"]["e"], B["presion"]["di"], B["presion"]["de"], "url(#ACE)")):
    h.rect(X(x0), Y(de / 2), t * e, (de - di) / 2 * e, pat, K, 1.0); h.rect(X(x0), Y(-di / 2), t * e, (de - di) / 2 * e, "#fff", K, 1.0)
xt = xa + B["plana"]["e"] + B["presion"]["e"]
inn = roscaPts(X(xt), X(xt + W["tuerca"]), oy, rd, W["paso"], 55, e, -1, ext=False)
h.path(poly(inn) + f" L{X(xt + W['tuerca'])},{Y(ac / 2)} L{X(xt)},{Y(ac / 2)} Z", "url(#ACE)", K, 1.2)
h.rect(X(xt), Y(-rd), W["tuerca"] * e, (ac / 2 - rd) * e, "#fff", K, 1.2)
ejeH(h, X(-W["k"]) - 12, X(L) + 14, oy)
h.dimH(Y(ac / 2) - 40, X(0), X(L), "L = 90 (4018) · 250 (4016) · 38 (4017)", ext=Y(rd))
h.dimH(Y(-ac / 2) + 30, X(L - Lr), X(L), "ROSCA 40 (*)", ext=Y(-rd), c=OR)
h.dimV(X(-W["k"]) - 18, Y(ac / 2), Y(-ac / 2), "", ext=X(-W["k"]))
h.txt(X(-W["k"]) - 22, Y(0) + 4, "24 (*)", 9.5, 400, OR, "end")
h.dimH(Y(-ac / 2) + 30, X(-W["k"]), X(0), "8,5 (*)", ext=Y(-ac / 2), c=OR)
for n, (u, v), (gx, gy) in [("1", (-W["k"] / 2, -ac / 2 + 1), (-W["k"] / 2 - 6, -ac / 2 - 12)), ("2", (xa + 1, B["plana"]["de"] / 2 - 2), (xa - 10, ac / 2 + 6)),
                            ("3", (xa + B["plana"]["e"] + 1, -B["presion"]["de"] / 2 + 2), (xa + 4, -ac / 2 - 12)), ("4", (xt + 5, ac / 2 - 2), (xt + 16, ac / 2 + 6)), ("5", (L - 5, rd - 1), (L + 12, ac / 2 - 2))]:
    h.globo(n, X(u), Y(v), X(gx), Y(gy), r=8)
h.circ(X(L - 18), Y(rd - .7), 9, "none", K, .6, 'stroke-dasharray="3 2"'); h.txt(X(L - 18) + 10, Y(rd) - 10, "D1", 10, 700)

# ================= D1 Whitworth vs métrica (10:1) =================
h.titulo(500, 62, "D1 - ROSCA WHITWORTH vs METRICA", "ESC. 18:1 · NO SE MEZCLAN")
ed = 18.0
for k, (nom, P, ang, x0) in enumerate((("RW 1/2\" (BSW): P = 2,117 · 55°", W["paso"], 55, 520), ("M12: P = 1,75 · 60°", Mm["paso"], 60, 520))):
    y0 = 160 + k * 70; Hf = P / (2 * math.tan(math.radians(ang / 2))); pts = []
    for i in range(int(3 * 16) + 1):
        z = 3 * P * i / 48; s = (z / P) % 1; tri = 1 - abs(2 * s - 1)
        rr = min(Hf * (5 / 6 if ang == 55 else 7 / 8), max(Hf / (6 if ang == 55 else 4), Hf * tri)); pts.append((x0 + z * ed, y0 - rr * ed))
    h.path(poly(pts) + f" L{x0 + 3 * P * ed},{y0 + 14} L{x0},{y0 + 14} Z", "url(#ACE)", K, 1.1)
    h.txt(x0 + 3 * P * ed + 14, y0 - 8, nom, 9.5, 700); h.txt(x0 + 3 * P * ed + 14, y0 + 6, "CRESTA REDONDEADA" if ang == 55 else "CRESTA PLANA (ISO 68-1)", 9)
h.txt(500, 270, "UNA TUERCA M12 NO ENTRA EN UN BULON RW 1/2\" (NI AL REVES):", 9.5, 700)
h.txt(500, 283, "PEDIR SIEMPRE LA TUERCA DEL MISMO SISTEMA QUE EL BULON.", 9.5)

# ================= ARANDELAS, TUERCAS, CHAPA, ESPARRAGO, CAPUCHON (1:1) =================
h.titulo(40, 320, "ARANDELAS, TUERCAS, CHAPA DE RETENCION, ESPARRAGO Y CAPUCHON", "ESC. 1:1 · VISTAS DE FRENTE Y CORTES")
cy = 400; e1 = 1.6
def anillo(cx, di, de, t, nom, cod, partida=False):
    h.circ(cx, cy, de / 2 * e1, "#fff", K, 1.3); h.circ(cx, cy, di / 2 * e1, "#fff", K, 1.0)
    if partida: h.path(f"M{cx - 2},{cy - de / 2 * e1 - 1} l5,{(de - di) / 2 * e1 + 2}", "none", "#fff", 4); h.path(f"M{cx - 3},{cy - de / 2 * e1} l4,{(de - di) / 2 * e1} M{cx + 1},{cy - de / 2 * e1} l4,{(de - di) / 2 * e1}", "none", K, .9)
    h.rect(cx - de / 2 * e1, cy + 30, de * e1, t * e1, "url(#ACE)", K, 1.0); h.rect(cx - di / 2 * e1, cy + 30, di * e1, t * e1, "#fff", "none", 0)
    h.txt(cx, cy + 56, nom, 9.5, 700, K, "middle"); h.txt(cx, cy + 69, cod, 9, 400, G, "middle", MONO)
anillo(90, B["plana"]["di"], B["plana"]["de"], B["plana"]["e"], "PLANA 13 × 24 × 2,5", "4014")
anillo(210, B["presion"]["di"], B["presion"]["de"], B["presion"]["e"], "PRESION 12,2 × 21,1", "4013 · DIN 127 B", partida=True)
hx = " ".join(f"{335 + W['af'] / 2 / math.cos(math.pi / 6) * e1 * math.cos(math.pi / 6 + i * math.pi / 3):.1f},{cy + W['af'] / 2 / math.cos(math.pi / 6) * e1 * math.sin(math.pi / 6 + i * math.pi / 3):.1f}" for i in range(6))
h.a(f'<polygon points="{hx}" fill="#fff" stroke="{K}" stroke-width="1.3"/>'); h.circ(335, cy, rd * e1, "#fff", K, 1)
h.txt(335, cy + 56, "HEX 1/2\" e/c 20,8 (*)", 9.5, 700, K, "middle"); h.txt(335, cy + 69, "4036 5/16\" · 4039 3/4\"", 9, 400, G, "middle", MONO)
a4 = B["cuadrada"]["a"] * e1; h.rect(455 - a4 / 2, cy - a4 / 2, a4, a4, "#fff", K, 1.3); h.circ(455, cy, rd * e1, "#fff", K, 1)
h.txt(455, cy + 69 + 13, "CUADRADA 22 × 11 (*)", 9.5, 700, OR, "middle"); h.txt(455, cy + 56, "4037", 9, 400, G, "middle", MONO)
C4 = B["chapa"]; x4 = 540; h.rect(x4, cy - C4["b"] / 2 * e1, C4["a"] * e1, C4["b"] * e1, "#fff", K, 1.3); h.circ(x4 + C4["a"] / 2 * e1, cy, C4["agujero"] / 2 * e1, "#fff", K, 1)
h.dimH(cy - C4["b"] / 2 * e1 - 12, x4, x4 + C4["a"] * e1, "52", ext=cy - C4["b"] / 2 * e1); h.dimV(x4 + C4["a"] * e1 + 14, cy - C4["b"] / 2 * e1, cy + C4["b"] / 2 * e1, "28", ext=x4 + C4["a"] * e1)
h.txt(x4 + C4["a"] / 2 * e1, cy + 56, "CHAPA 52 × 28 × 2", 9.5, 700, K, "middle"); h.txt(x4 + C4["a"] / 2 * e1, cy + 69, "4020 · AGUJERO Ø14 (*)", 9, 400, OR, "middle")
# capuchón R15 en corte
Cp = B["capuchon"]; cx5 = 720
h.path(f"M{cx5},{cy - Cp['De'] / 2 * e1} H{cx5 + (Cp['L'] - 6) * e1} A{6 * e1},{Cp['De'] / 2 * e1} 0 0 1 {cx5 + (Cp['L'] - 6) * e1},{cy + Cp['De'] / 2 * e1} H{cx5} V{cy + (Cp['De'] / 2 - 1.8) * e1} H{cx5 + (Cp['L'] - 2) * e1 - 6} V{cy - (Cp['De'] / 2 - 1.8) * e1} H{cx5} Z", "url(#PLAS)", K, 1.2)
h.txt(cx5 + 30, cy + 56, "CAPUCHON R15 (CORTE)", 9.5, 700, K, "middle"); h.txt(cx5 + 30, cy + 69, "4031 · MEDIDAS (*)", 9, 400, OR, "middle")
# espárrago M16 × 190 (1:2)
ey = 520; Es = B["esparrago"]; e5 = .9
h.rect(60, ey - Es["d"] / 2 * e5, Es["L"] * e5, Es["d"] * e5, "#fff", K, 1.2)
for i in range(int(Es["L"] / Es["paso"])): xx = 60 + i * Es["paso"] * e5; h.ln(xx, ey - Es["d"] / 2 * e5, xx + 2, ey + Es["d"] / 2 * e5, K, .3)
for xn in (20, Es["L"] - 33): h.rect(60 + xn * e5, ey - 24 / math.cos(math.pi / 6) / 2 * e5, 13 * e5, 24 / math.cos(math.pi / 6) * e5, "#fff", K, 1.2)
h.dimH(ey + 26, 60, 60 + Es["L"] * e5, "190", ext=ey + Es["d"] / 2 * e5); h.dimV(48, ey - Es["d"] / 2 * e5, ey + Es["d"] / 2 * e5, "M16", ext=60)
h.txt(60 + Es["L"] * e5 + 16, ey - 2, "ESPARRAGO M16 × 190 (4023) · 1:1,1", 9.5, 700); h.txt(60 + Es["L"] * e5 + 16, ey + 11, "TODO ROSCADO, CON 2 TUERCAS (*)", 9.5, 400, OR)

# ================= TABLAS =================
yT = tablaC(h, 40, 580, [(130, "l", False), (110, "c", True), (110, "c", True), (130, "l", False)],
            [("DATO", 'RW 1/2" (BSW)', "M12", "FUENTE"), ("Ø MAYOR", "12,70", "12,00", "NORMA"), ("PASO", "2,117 (12 h/pulg)", "1,75", "BSW / ISO 261"), ("ANGULO", "55°", "60°", "BSW / ISO 68-1"),
             ("ENTRE CARAS", "20,8 (*)", "18", "ISO 4014"), ("ALTO CABEZA", "8,5 (*)", "7,5", "ISO 4014"), ("ALTO TUERCA", "11 (*)", "10,8", "ISO 4032")], "WHITWORTH vs METRICA", rowh=15)
yC = codigos(h, 40, yT + 14, [4016, 4018, 4017, 4023, 4014, 4013, 4037, 4036, 4039, 4020, 4031, 9001],
             {4016: '1/2" × 250', 4018: "Ø12 × 90 (abrazad. Ø260)", 4017: "Ø12 × 38 (*)", 4023: "M16 × 190 · unidad «m» (*)", 4014: '1/2"', 4013: '1/2" (partida)', 4037: '1/2"', 4036: '5/16"', 4039: '3/4"',
              4020: "52 × 28 × 2", 4031: "1 por conductor y punta", 9001: "genérico (sin pieza)"}, wdesc=400, wx=180, rowh=14.5)
notasW(h, 40, yC + 10, [
    "COTAS EN mm. TODO H°G° EN CALIENTE (ISO 1461: ROSCAS CENTRIFUGADAS > 6 mm ≥ 50 µm). SIEMPRE ARANDELA PLANA + PRESION DEBAJO DE LA TUERCA.",
    "(*) LARGO ROSCADO, CABEZAS Y TUERCAS 1/2\" (BSW) Y AGUJERO DE LA CHAPA: NO ESTAN EN LA APP. A CONFIRMAR CON EL FABRICANTE.",
    "(*) 4023 ESPARRAGO ESTA EN «m» EN EL CATALOGO PERO ES UNA PIEZA DE 190 mm: REVISAR LA UNIDAD (NO SE CAMBIA SIN TU OK). 4017 «12 × 38 NO4-R 25 mm»: SIGNIFICADO A CONFIRMAR.",
    "BULON MN 52 (4016) = 1/2\" × 250 CON TUERCA: 2 POR BRAZO EN POSTE DE MADERA (AP-TC-055). 4018 CIERRA LA ABRAZADERA Ø260. CAPUCHON R15: 1 POR CONDUCTOR Y POR PUNTA (AP-T-019)."], w=800, lh=13.5)
rayadosC(h, 40, 1110, ["ACE", "HG", "PLAS", "ZN"], cols=4, dx=190)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - DESPIECE (GALVANIZADO EN CALIENTE)", "BULON 1/2\" CON LA ROSCA WHITWORTH REAL CORTADA A CUARTO, TUERCA CORTADA, ARANDELAS, CHAPA, ESPARRAGO Y CAPUCHON")
A = img3d(h, "pat_her3a", 860, 96, 580)
columna(h, A, [("esparrago", "", "ESPARRAGO M16 × 190 (4023)"), ("tuercaE", "", "TUERCA M16"), ("capuchon", "", "CAPUCHON R15 (4031)"), ("tuercaC", "", "ROSCA INTERIOR (CORTE)"),
               ("tuerca", "4", "TUERCA HEX 1/2\""), ("presion", "3", "ARANDELA DE PRESION 4013"), ("plana", "2", "ARANDELA PLANA 4014"), ("roscaC", "5", "ROSCA RW 55° (CORTE)"),
               ("cuadrada", "", "TUERCA CUADRADA 4037"), ("chapa", "", "CHAPA DE RETENCION 4020"), ("vastago", "", "VASTAGO"), ("cabeza", "1", "CABEZA HEXAGONAL")], 1450, 110, 540, paso=33)
h.txt(890, 590, "EN SU LUGAR - CIERRE DE LAS OREJAS (CORTADO A CUARTO)", 11, 700, NV, "start", INT)
A2 = img3d(h, "pat_her3b", 870, 596, 500)
columna(h, A2, [("zinc", "", "CAPA DE ZINC (EXAGERADA ×10)"), ("luz", "", "LUZ ENTRE OREJAS"), ("oreja", "", "OREJA DE LA ABRAZADERA"), ("bulon", "1", "CABEZA DEL BULON"),
                ("agujero", "", "AGUJERO Ø14"), ("presion", "3", "PRESION"), ("plana", "2", "PLANA"), ("tuerca", "4", "TUERCA"), ("rosca", "5", "ROSCA EN CORTE")], 1400, 610, 1000, paso=34)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/pat_her3a.mjs, pat_her3b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_pat.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-HERRAJES-3", "BULONES, ARANDELAS,", "TUERCAS Y CHAPA", "MEDIO CORTE, D1 ROSCAS, VISTAS, TABLAS Y 3D", "2:1 / 1:1", "D1 10:1 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_herrajes_3.svg"))
