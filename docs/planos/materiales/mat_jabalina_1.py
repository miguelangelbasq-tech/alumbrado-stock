"""MAT-JABALINA-1 (rev. B) · Jabalina (dispersor) cobre-acero IRAM 2309: 7015 (5/8" × 1500) y 7017 (3/4" × 2000).
Plano con la geometría de r3d/piezas/perfiles_pat.mjs (JAB); 3D: r3d/out/pat_jab1a.png (cabeza cortada, sufridera, punta) y pat_jab1b.png (variante seccional).
Fuentes: r3d/FUENTES_pat.md. Lo que no tiene fuente va «(*)»."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *

J = PP["JAB"]; r58 = J["j58"]["D"] / 2; cu = J["cu"]
h = hojaP()

# ================= VISTA LATERAL (2:1, interrumpida) =================
h.titulo(40, 62, "VISTA LATERAL (INTERRUMPIDA)", 'ESC. 2:1 · JABALINA 5/8" (7015) · LA CABEZA A LA IZQUIERDA, LA PUNTA A LA DERECHA')
e = 2.0; yc = 150; xa = 70; Lh = 150; gap = 40; Lt = 170
r = r58 * e; ch = J["chaflan"] * e; Lp = J["punta"] * e
xb = xa + Lh; xc = xb + gap; xd = xc + Lt
def rot(x, y=None):  # línea de rotura (S)
    y = yc if y is None else y
    h.path(f"M{x:.1f},{y - r - 6:.1f} C{x + 9:.1f},{y - r / 2:.1f} {x - 9:.1f},{y + r / 2:.1f} {x:.1f},{y + r + 6:.1f}", "none", K, .9)
h.path(f"M{xa + ch},{yc - r} H{xb} V{yc + r} H{xa + ch} L{xa},{yc + r - ch} V{yc - r + ch} Z", "#fff", K, 1.6)
h.path(f"M{xc},{yc - r} H{xd - Lp} L{xd},{yc} L{xd - Lp},{yc + r} H{xc} Z", "#fff", K, 1.6)
for x in (xb, xc): rot(x)
for yy in (yc - r + cu * e * 3, yc + r - cu * e * 3):    # capa de cobre (exagerada ×3 en la vista)
    h.ln(xa + ch, yy, xb, yy, K, .35); h.ln(xc, yy, xd - Lp, yy, K, .35)
ejeH(h, xa - 16, xd + 18, yc)
h.ln(xa + ch, yc - r, xa + ch, yc + r, K, .5)
h.dimV(xa - 26, yc - r, yc + r, "Ø14,6", ext=xa - 2)
h.dimH(yc - r - 26, xd - Lp, xd, "≈ 25 (*)", ext=yc - r - 2, c=OR)
h.dimH(yc + r + 52, xa, xd, 'L = 1500 (7015 · 5/8")  ·  2000 (7017 · 3/4" = Ø16,2)', ext=yc + r + 2)
llamada(h, xa + 2, yc - r + 2, xa - 10, yc - r - 36, "CHAFLAN 1,5 × 45° (*)", OR, "start")
llamada(h, xa + 110, yc + r - 2, xa + 175, yc + r + 22, "LEYENDA GRABADA: IRAM 2309 · JL16 · 5/8\" × 1500 (*)", OR)
h.txt(xd + 8, yc + 4, "PUNTA CONICA", 10, 700)
lineaCorte(h, xa + 70, yc - r - 12, xa + 70, yc + r + 12, "A")
lineaCorte(h, xc + 110, yc - r - 12, xc + 110, yc + r + 12, "B")
h.globo("1", xa + 40, yc + 4, xa + 30, yc + r + 24, r=8); h.globo("2", xb - 20, yc - r + .5, xb - 20, yc - r - 22, r=8)
h.globo("3", xd - 6, yc, xd + 20, yc + 26, r=8)

# ================= CORTE A-A (8:1) y D1 (capa de cobre) =================
h.titulo(40, 248, "CORTE A-A", "ESC. 8:1 · CAPA DE COBRE A ESCALA")
ec = 8.0; cx, cy = 140, 340; R0 = r58 * ec
h.circ(cx, cy, R0, "url(#CU)", K, 1.4); h.circ(cx, cy, R0 - cu * ec, "url(#ACE)", K, 1.0)
ejeH(h, cx - R0 - 12, cx + R0 + 12, cy); ejeV(h, cx, cy - R0 - 12, cy + R0 + 12)
h.dimH(cy + R0 + 22, cx - R0, cx + R0, "Ø14,6 (5/8\")", ext=cy + 4)
h.globo("1", cx - 18, cy + 14, cx - R0 - 4, cy + R0 + 4, r=8); h.globo("2", cx + R0 * .97, cy + R0 * .25, cx + R0 + 22, cy + R0 * .25 + 26, r=8)
h.circ(cx + R0 * .71, cy - R0 * .71, 13, "none", K, .6, 'stroke-dasharray="3 2"'); h.txt(cx + R0 * .71 + 14, cy - R0 * .71 - 12, "D1", 11, 700)

h.titulo(270, 248, "D1 - CAPA DE COBRE", "ESC. 200:1 (ESQUEMA)")
dx, dy = 285, 300; W1 = 230; tc = cu * 200
h.rect(dx, dy, W1, tc, "url(#CU)", K, 1.2); h.rect(dx, dy + tc, W1, 70, "url(#ACE)", K, 1.2)
h.path(f"M{dx},{dy - 14} H{dx + W1}", "none", K, .5, 'stroke-dasharray="2 3"'); h.txt(dx + W1, dy - 18, "SUPERFICIE", 9, 400, G, "end")
h.dimV(dx + W1 + 22, dy, dy + tc, "≥ 0,254", ext=dx + W1 + 2)
h.txt(dx + 6, dy + tc / 2 + 4, "Cu ELECTROLITICO 99,9 % (*)", 9.5, 700, OR); h.txt(dx + 6, dy + tc + 40, "ALMA DE ACERO SAE 1010-1020 · ≥ 140 HB", 9.5, 700)
h.txt(dx, dy + tc + 92, "COBRE UNIDO AL ACERO (NO ES UN CAÑO): EN EL ENSAYO", 9.5); h.txt(dx, dy + tc + 106, "DE ADHERENCIA NO SE DESPEGA. NO SE RASPA NI SE CORTA.", 9.5)

# ================= D2 cabeza con sufridera =================
h.titulo(560, 248, "D2 - CABEZA Y SUFRIDERA", "ESC. 2:1 · CORTE · SE GOLPEA LA SUFRIDERA")
S = J["sufridera"]; es = 2.0; sx, sy = 700, 300
De, Ls, Pr, Di = S["De"] * es, S["L"] * es, S["prof"] * es, S["Di"] * es
# sufridera en corte (vertical, el agujero abajo)
h.path(f"M{sx - De / 2},{sy} H{sx + De / 2} V{sy + Ls} H{sx + Di / 2} V{sy + Ls - Pr} H{sx - Di / 2} V{sy + Ls} H{sx - De / 2} Z", "url(#ACE)", K, 1.4)
# cabeza de la jabalina adentro
h.path(f"M{sx - r + ch},{sy + Ls - Pr + 2} H{sx + r - ch} L{sx + r},{sy + Ls - Pr + 2 + ch} V{sy + Ls + 40} H{sx - r} V{sy + Ls - Pr + 2 + ch} Z", "#fff", K, 1.2)
ejeV(h, sx, sy - 10, sy + Ls + 50)
h.dimH(sy - 12, sx - De / 2, sx + De / 2, "Ø32 (*)", ext=sy, c=OR)
h.dimV(sx + De / 2 + 18, sy, sy + Ls, "70 (*)", ext=sx + De / 2, c=OR); h.dimV(sx - De / 2 - 18, sy + Ls - Pr, sy + Ls, "45 (*)", ext=sx - Di / 2, c=OR)
llamada(h, sx + 2, sy + Ls - Pr + 4, sx + De / 2 + 24, sy + Ls + 26, "AGUJERO Ø15,6 (*)", OR)
h.globo("4", sx + De / 4, sy + 20, sx + De / 2 + 46, sy + 20, r=8)

# ================= VARIANTE SECCIONAL (2:1) =================
h.titulo(40, 500, "VARIANTE - JABALINA SECCIONAL (EMPALME)", 'ESC. 2:1 · CORTE B-B DEL MANGUITO · ROSCA 5/8" UNC (11 HILOS/PULG, 60°) LAMINADA')
ev = 2.0; yv = 580; Mg = J["manguito"]; Rr = J["rosca"]; B = J["bulonHinca"]
xm0 = 300; Lm = Mg["L"] * ev; rM = Mg["De"] / 2 * ev; rd = Rr["d"] / 2
# manguito (cortado a la mitad: arriba rayado, adentro la rosca)
for lado in (-1, 1):
    inn = roscaPts(xm0, xm0 + Lm, yv, rd, Rr["paso"], 60, ev, lado, ext=False)
    d = poly(inn) + f" L{xm0 + Lm:.1f},{yv + lado * rM:.1f} L{xm0:.1f},{yv + lado * rM:.1f} Z"
    h.path(d, "url(#BRZ)", K, 1.1)
# tramo izquierdo (inferior) metido hasta la mitad, y el derecho afuera (explotado)
for x0, x1, xr0, xr1, fase in ((xm0 - 110, xm0, xm0, xm0 + Rr["L"] * ev, 0), (xm0 + Lm + 34 + Rr["L"] * ev, xm0 + Lm + 34 + Rr["L"] * ev + 90, xm0 + Lm + 34, xm0 + Lm + 34 + Rr["L"] * ev, .5)):
    h.rect(x0, yv - r, x1 - x0, 2 * r, "#fff", K, 1.3)
    up = roscaPts(xr0, xr1, yv, rd, Rr["paso"], 60, ev, -1, fase=fase); dn = roscaPts(xr0, xr1, yv, rd, Rr["paso"], 60, ev, 1, fase=fase)
    h.path(poly(up) + " L" + " L".join(f"{x:.1f},{y:.1f}" for x, y in reversed(dn)) + " Z", "#fff", K, .9)
rot(xm0 - 110, yv); rot(xm0 + Lm + 34 + Rr["L"] * ev + 90, yv)
ejeH(h, xm0 - 130, xm0 + Lm + 34 + Rr["L"] * ev + 104, yv)
h.dimH(yv - rM - 16, xm0, xm0 + Lm, "61 (CR58 = 2,4\")", ext=yv - rM)
h.dimV(xm0 + Lm + 14, yv - rM, yv + rM, "Ø22 (*)", ext=xm0 + Lm, c=OR)
h.dimH(yv + rM + 22, xm0 + Lm + 34, xm0 + Lm + 34 + Rr["L"] * ev, "30 (*)", ext=yv + r, c=OR)
h.globo("5", xm0 + Lm * .2, yv + rM * .7, xm0 + Lm * .2 - 30, yv + rM + 22, r=8); h.globo("6", xm0 + Lm + 50, yv + r - 2, xm0 + Lm + 26, yv + rM + 22, r=8)
# bulón de hinca (a la izquierda, vista)
bx = 50; Lc = B["k"] * ev; Dc = B["Dc"] / 2 * ev; Lr2 = B["Lr"] * ev
h.rect(bx, yv - Dc, Lc, 2 * Dc, "url(#ACE)", K, 1.3)
up = roscaPts(bx + Lc, bx + Lc + Lr2, yv, rd, Rr["paso"], 60, ev, -1); dn = roscaPts(bx + Lc, bx + Lc + Lr2, yv, rd, Rr["paso"], 60, ev, 1)
h.path(poly(up) + " L" + " L".join(f"{x:.1f},{y:.1f}" for x, y in reversed(dn)) + " Z", "#fff", K, .9)
h.txt(bx, yv + Dc + 16, "BULON DE HINCA (ACERO TEMPLADO)", 9.5, 700); h.txt(bx, yv + Dc + 29, "SE ENROSCA EN EL MANGUITO DE ARRIBA (*)", 9.5, 400, OR)
h.globo("7", bx + Lc / 2, yv - Dc + 4, bx + Lc / 2, yv - Dc - 20, r=8)
h.txt(xm0 - 110, yv - r - 8, "TRAMO DE ABAJO (YA HINCADO)", 9.5, 400, G); h.txt(xm0 + Lm + 60, yv - r - 8, "TRAMO QUE SE AGREGA", 9.5, 400, G)

# ================= TABLAS =================
yT = tablaC(h, 40, 668, [(52, "c", True), (110, "l", False), (80, "c", True), (130, "c", True), (130, "l", False)],
            [("CODIGO", "DESIGNACION", "Ø NOMINAL", "LARGO", "COBRE"), ("7015", 'JL16 · 5/8"', "14,6", "1500", "≥ 254 µm"), ("7017", 'JL18 · 3/4"', "16,2", "2000", "≥ 254 µm"),
             ("—", 'JL14 · 1/2"', "12,6", "1000/1500/2000", "≥ 254 µm")], "VARIANTES (IRAM 2309, FICHA DE LA APP)", rowh=16)
yC = codigos(h, 40, yT + 18, [7015, 7017], {7015: 'pliego ítem 75 / 88', 7017: 'Ø16,2 (no 18)'}, wdesc=330, wx=120)
bloque(h, 40, yC + 20, "DATOS TECNICOS", [
    "IRAM 2309: ALMA DE ACERO SAE 1010-1020 (≥ 140 HB) CON CAPA DE COBRE ELECTROLITICO UNIDA, ≥ 254 µm (= 10 MIL, COMO UL 467).",
    "PLIEGO: DISPERSOR Ø14,6 × 1500 (ÍTEM 75; PROVISION ÍTEM 88). LA ETG ADMITE HASTA 3 JABALINAS POR PUNTO SEGUN EL SUELO.",
    "CONEXION: TOMACABLE A COMPRESION O TIPO TGC, SIN ZINC EN LA ALEACION (NO A ROSCA): VER MAT-JABALINA-2.",
    "RESISTENCIA: ≤ 40 Ω EN TT (ETG 2022) (*). LA ETG 2014 DECIA 10 Ω."], w=800, sz=10, lh=13.5)
bloque(h, 600, 668, "DONDE SE USA", [
    "AP-TC-005/006: 1 POR COLUMNA METALICA + 1 POR TABLERO.",
    "TC-PRFV-02: 1 AL FINAL DE CADA CIRCUITO + 1 POR TABLERO.",
    "AP-T-007: LA BARRA DE PAT DEL TABLERO VA SOLA A SU JABALINA.",
    "AP-TC-004: PAT DE LA RED AEREA DE BARRIO (CADA 200 m).",
    "GUIA «PUESTA A TIERRA Y MEDICION» · ÍTEMS 75, 81, 88."], w=250, sz=10, lh=13)
notasW(h, 40, 948, [
    "COTAS EN mm. MANDA LA COTA. LA VISTA ESTA INTERRUMPIDA; EN LA VISTA LATERAL LA CAPA DE COBRE VA EXAGERADA ×3 (EN EL CORTE A-A, A ESCALA).",
    "OJO: LA DE 3/4\" (7017) MIDE Ø16,2: «JL18» ES SOLO EL NOMBRE COMERCIAL.",
    "(*) PUNTA ≈ 25, CHAFLAN, LEYENDA, SUFRIDERA (Ø32 × 70, AGUJERO Ø15,6 × 45) Y Ø22 DEL MANGUITO: SIN FICHA DEL FABRICANTE. A CONFIRMAR.",
    "(*) VARIANTE SECCIONAL: LA 7015 ES LISA (SE HINCA CON SUFRIDERA). EL EMPALME CON MANGUITO DE BRONCE 5/8\" UNC (ERICO CR58, 61 mm) ES PARA HINCAR MAS DE 1 TRAMO; HOY NO HAY CODIGO EN EL PAÑOL (A VINCULAR SI SE USA).",
    "(*) LA FICHA DICE ≥ 254 µm Y LA FAMILIA 250 µm: VALE LA IRAM 2309. FUENTES: r3d/FUENTES_pat.md."], w=800, lh=14)
rayadosC(h, 40, 1100, ["CU", "ACE", "BRZ"], cols=3, dx=200)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - JABALINA 5/8\" CORTADA A CUARTO", "CAPA DE COBRE REAL (0,254) SOBRE EL ALMA DE ACERO · SUFRIDERA DE HINCA · PUNTA CONICA")
A = img3d(h, "pat_jab1a", 860, 70, 600)
columna(h, A, [("cobre", "2", "CAPA DE COBRE ≥ 254 µm"), ("alma", "1", "ALMA DE ACERO"), ("chaflan", "", "CHAFLAN DE LA CABEZA (*)"), ("sufridera", "4", "SUFRIDERA (ACERO TEMPLADO) (*)"),
               ("alojamiento", "", "ALOJAMIENTO DE LA CABEZA"), ("punta", "3", "PUNTA CONICA"), ("almaP", "", "EL ALMA LLEGA A LA PUNTA"), ("cuerpo", "", "CUERPO Ø14,6")], 1440, 110, 500, paso=34)
h.txt(890, 560, "VARIANTE SECCIONAL - MANGUITO DE BRONCE CORTADO Y BULON DE HINCA (*)", 11, 700, NV, "start", INT)
A2 = img3d(h, "pat_jab1b", 870, 566, 470)
columna(h, A2, [("bulon", "7", "BULON DE HINCA"), ("espigaB", "", "ESPIGA 5/8\" UNC"), ("manguito2", "5", "MANGUITO (ARRIBA)"), ("espiga", "", "ROSCA LAMINADA"),
                ("roscaE", "6", "ROSCA DEL TRAMO"), ("manguito", "5", "MANGUITO CORTADO"), ("roscaI", "", "ROSCA INTERIOR"), ("tope", "", "TOPE: LOS TRAMOS SE TOCAN"), ("tramoInf", "", "TRAMO HINCADO")], 1330, 590, 1000, paso=34)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/pat_jab1a.mjs, pat_jab1b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_pat.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-JABALINA-1", "JABALINA COBRE-ACERO", "IRAM 2309 · 5/8\" Y 3/4\"", "VISTA, CORTE, D1, D2, VARIANTE Y 3D", "2:1 / 8:1", "D1 200:1 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_jabalina_1.svg"))
