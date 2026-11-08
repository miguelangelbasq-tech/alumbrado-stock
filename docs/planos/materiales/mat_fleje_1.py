"""MAT-FLEJE-1 (rev. B) · Fleje inox AISI 304 3/4" (4024), hebilla (4025), cómo se dobla y se traba, la herramienta, caño de bajada 5004 y babero 4015.
Geometría: r3d/piezas/perfiles_pat.mjs (FLE, CANO.da) y pat.mjs hebilla() / flejePoste(); 3D: r3d/out/pat_fle1a.png, pat_fle1b.png. Fuentes: r3d/FUENTES_pat.md"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *

F = PP["FLE"]; Hb = F["hebilla"]; Cd = PP["CANO"]["da"]
h = hojaP()

# ================= CORTE DEL FLEJE (12:1) =================
h.titulo(40, 62, "CORTE A-A DEL FLEJE", "ESC. 12:1 · AISI 304 · 3/4\" (4024)")
e = 12.0; fx, fy = 60, 140
h.rect(fx, fy, F["a"] * e, F["e"] * e, "url(#INX)", K, 1.3)
h.dimH(fy - 16, fx, fx + F["a"] * e, "19,05 (3/4\")", ext=fy)
h.dimV(fx + F["a"] * e + 18, fy, fy + F["e"] * e, "0,7", ext=fx + F["a"] * e)
h.txt(fx, fy + 30, "CANTOS REDONDEADOS (NO CORTAN EL CABLE).", 9.5); h.txt(fx, fy + 43, "BAND-IT C206: 0,76 (0,030\") (*) · ≈ 7,5 kN (FICHA)", 9.5, 400, OR)

# ================= HEBILLA (3:1): planta y corte B-B =================
h.titulo(340, 62, "HEBILLA DE OREJAS (4025) - PLANTA Y CORTE B-B", "ESC. 3:1 · AISI 304 · ESPESOR 1,5 · TRABADA CON 2 VUELTAS DE FLEJE")
e2 = 3.0; hx, hy = 380, 134; L, A, ee, oo = Hb["L"], Hb["a"], Hb["e"], Hb["oreja"]
h.rect(hx - 20, hy + (A - F["a"]) / 2 * e2, (L + 40) / 1 * e2 / 1 * 1 if False else (L * e2 + 40), F["a"] * e2, "url(#INX)", K, .6)
h.rect(hx, hy, L * e2, A * e2, "none", K, 1.4)
h.rect(hx + 2 * e2, hy, (L - 4) * e2, oo * e2, "#fff", K, 1.2); h.rect(hx + 2 * e2, hy + (A - oo) * e2, (L - 4) * e2, oo * e2, "#fff", K, 1.2)
h.path(f"M{hx + L * e2 - 3},{hy + oo * e2 + 2} h14 v{(A - 2 * oo) * e2 - 4} h-14", "none", K, 1.1)   # cola doblada
h.dimH(hy - 14, hx, hx + L * e2, "28 (*)", ext=hy, c=OR); h.dimV(hx - 16, hy, hy + A * e2, "22,5 (*)", ext=hx, c=OR)
lineaCorte(h, hx + L * e2 / 2, hy - 8, hx + L * e2 / 2, hy + A * e2 + 8, "B")
h.globo("2", hx + 4, hy + 8, hx - 30, hy - 6, r=8); h.globo("3", hx + L * e2 + 6, hy + A * e2 / 2, hx + L * e2 + 34, hy + A * e2 / 2 + 22, r=8)
# corte B-B (transversal): base, paredes, orejas dobladas y las 2 capas de fleje
cx, cy = 690, 150; e3 = 4.0
X = lambda y: cx + y * e3; Z = lambda z: cy - z * e3
hb = 2 * F["e"] + .2
pts = [(-A / 2, 0), (A / 2, 0), (A / 2, ee + hb + ee), (A / 2 - oo, ee + hb + ee), (A / 2 - oo, ee + hb), (A / 2 - ee, ee + hb), (A / 2 - ee, ee), (-A / 2 + ee, ee), (-A / 2 + ee, ee + hb), (-A / 2 + oo, ee + hb), (-A / 2 + oo, ee + hb + ee), (-A / 2, ee + hb + ee)]
h.path("M" + " L".join(f"{X(u):.1f},{Z(v):.1f}" for u, v in pts) + " Z", "url(#INX)", K, 1.3)
for k in range(2): h.rect(X(-F["a"] / 2), Z(ee + (k + 1) * F["e"] + k * .1), F["a"] * e3, F["e"] * e3, "#fff", K, .9)
h.dimV(X(A / 2) + 16, Z(ee + hb + ee), Z(0), "≈ 4,6", ext=X(A / 2))
h.txt(cx, cy + 22, "CORTE B-B (4:1)", 9.5, 700, K, "middle"); h.txt(cx, cy + 35, "2 CAPAS DE FLEJE ADENTRO", 9.5, 400, K, "middle")

# ================= COMO SE DOBLA Y SE TRABA (esquemas) =================
h.titulo(40, 250, "COMO SE COLOCA, SE TENSA Y SE TRABA", "ESQUEMAS S/E · VISTA DE COSTADO · 4 PASOS")
def paso(n, x, y, titulo, dib):
    h.circ(x + 10, y + 10, 10, NV, NV, 0); h.txt(x + 10, y + 14, str(n), 11, 700, "#fff", "middle", INT)
    h.txt(x + 26, y + 14, titulo, 10, 700); dib(x, y + 26)
def p1(x, y):
    h.path(f"M{x + 10},{y + 60} Q{x + 10},{y + 10} {x + 80},{y + 10} H{x + 150}", "none", K, 2.2); h.rect(x + 40, y + 52, 26, 10, "#fff", K, 1.2)
    h.path(f"M{x + 10},{y + 60} H{x + 150}", "none", K, 2.2); h.txt(x + 4, y + 80, "DAR LA VUELTA AL POSTE", 9, 400, K); h.txt(x + 4, y + 92, "Y PASAR LA PUNTA 2 VECES", 9, 400, K); h.txt(x + 4, y + 104, "POR LA HEBILLA.", 9, 400, K)
def p2(x, y):
    h.path(f"M{x + 10},{y + 60} H{x + 90}", "none", K, 2.2); h.rect(x + 30, y + 52, 26, 10, "#fff", K, 1.2)
    h.rect(x + 90, y + 30, 50, 34, "#fff", K, 1.3); h.circ(x + 150, y + 47, 9, "#fff", K, 1.1); h.path(f"M{x + 150},{y + 38} l12,-18 h10", "none", K, 2)
    h.path(f"M{x + 120},{y + 72} l-14,0 m0,0 l5,-4 m-5,4 l5,4", "none", K, 1); h.txt(x + 4, y + 80, "CALZAR LA HERRAMIENTA Y", 9, 400, K); h.txt(x + 4, y + 92, "GIRAR LA MANIVELA HASTA", 9, 400, K); h.txt(x + 4, y + 104, "QUE EL FLEJE NO CORRE.", 9, 400, K)
def p3(x, y):
    h.path(f"M{x + 10},{y + 60} H{x + 66} Q{x + 76},{y + 60} {x + 76},{y + 50} Q{x + 76},{y + 42} {x + 60},{y + 42} H{x + 40}", "none", K, 2.2); h.rect(x + 40, y + 52, 26, 10, "#fff", K, 1.2)
    h.path(f"M{x + 95},{y + 30} l10,10 m-10,0 l10,-10", "none", OR, 2); h.txt(x + 4, y + 80, "DOBLAR 180° SOBRE LA", 9, 400, K); h.txt(x + 4, y + 92, "HEBILLA Y CORTAR CON LA", 9, 400, K); h.txt(x + 4, y + 104, "PALANCA (COLA ≈ 10 (*)).", 9, 400, OR)
def p4(x, y):
    h.path(f"M{x + 10},{y + 60} H{x + 66} Q{x + 76},{y + 60} {x + 76},{y + 50} Q{x + 76},{y + 42} {x + 60},{y + 42} H{x + 40}", "none", K, 2.2)
    h.path(f"M{x + 38},{y + 52} v-14 h30 v14", "#fff", K, 1.2); h.path(f"M{x + 53},{y + 18} v12 m-4,-4 l4,4 l4,-4", "none", K, 1.3)
    h.txt(x + 4, y + 80, "GOLPEAR LAS 2 OREJAS", 9, 400, K); h.txt(x + 4, y + 92, "SOBRE LA COLA:", 9, 400, K); h.txt(x + 4, y + 104, "QUEDA TRABADA.", 9, 400, K)
for i, (t, d) in enumerate([("PASAR", p1), ("TENSAR", p2), ("DOBLAR Y CORTAR", p3), ("TRABAR LAS OREJAS", p4)]):
    paso(i + 1, 40 + (i % 2) * 410 if False else 40 + i * 205, 270, t, d)

# ================= HERRAMIENTA (esquema) =================
h.titulo(40, 430, "HERRAMIENTA TENSORA CON CORTADOR", "ESQUEMA 1:4 · PARA FLEJE 3/4\" DE 0,4 A 0,76 · TIPO BAND-IT C001 (*)")
tx, ty = 70, 500
h.rect(tx, ty, 160, 26, "#fff", K, 1.4); h.rect(tx + 160, ty - 6, 30, 38, "#fff", K, 1.3)
h.circ(tx + 205, ty + 13, 12, "#fff", K, 1.2); h.path(f"M{tx + 205},{ty + 1} l18,-26 h26", "none", K, 3)
h.path(f"M{tx + 10},{ty} l60,-34 l8,6 l-54,32", "#fff", K, 1.3)
h.rect(tx - 30, ty + 30, 180, 3, "url(#INX)", K, .6)
llamada(h, tx + 50, ty - 22, tx + 100, ty - 34, "PALANCA DE CORTE"); llamada(h, tx + 236, ty - 22, tx + 280, ty - 10, "MANIVELA (TENSA)")
llamada(h, tx + 100, ty + 26, tx + 120, ty + 54, "NARIZ: APOYA EN LA HEBILLA"); llamada(h, tx + 175, ty + 20, tx + 280, ty + 30, "MORDAZA DEL FLEJE")

# ================= ELEVACION BAJADA (1:40) =================
h.titulo(560, 430, "BAJADA EN POSTE DE H°A°", "ESC. 1:40 · CAÑO DOBLE AISLACION Ø2\" (5004), L = 4 m")
k = .042; bx, byb = 640, 676
h.path(f"M{bx - 14},{byb} L{bx - 10},{byb - 4600 * k} H{bx + 10} L{bx + 14},{byb} Z", "url(#HORM)", K, 1.2)
h.rect(bx + 14, byb - 4000 * k, 60 * k * 3, 4000 * k, "#fff", K, 1.0)
for z in (500, 2000, 3600):
    h.rect(bx - 15, byb - z * k - 2, 36 + 60 * k * 3 - 6, 4, "url(#INX)", K, .8)
h.path(f"M{bx + 12},{byb - 4000 * k - 10} h14 l-3,12 h-8 z", "#fff", K, 1)
h.ln(bx - 60, byb, bx + 120, byb, K, 1.4); h.nivel(bx + 80, byb, "±0,00")
h.dimV(bx + 70, byb - 4000 * k, byb, "4000", ext=bx + 24)
h.dimV(bx - 40, byb - 2000 * k, byb - 500 * k, "(*)", ext=bx - 16, c=OR); h.dimV(bx - 40, byb - 3600 * k, byb - 2000 * k, "(*)", ext=bx - 16, c=OR)
h.txt(bx + 90, byb - 3700 * k, "BABERO 4015 (*)", 9.5, 400, OR); h.txt(bx + 90, byb - 2000 * k, "3 FLEJES + HEBILLA", 9.5)

# ================= TABLAS =================
yC = codigos(h, 40, 712, [4024, 4025, 5004, 4015, 4034], {4024: "19,05 × 0,7 · ítem 71", 4025: "esp. 1,5 · ítem 72", 5004: "en poste H°A° · ítem 76", 4015: "sobre el cable expuesto", 4034: "NO USAR"}, wdesc=430, wx=170)
yD = bloque(h, 40, yC + 18, "DATOS TECNICOS Y DONDE SE USA", [
    "FLEJE 4024: AISI 304 · 19,05 × 0,7 · ≈ 7,5 kN · HEBILLA 4025: AISI 304 3/4\" · ESPESOR 1,5. POR BAJADA: 3 FLEJES CON HEBILLA.",
    "BAJADA EN POSTE DE H°A°: CAÑO + 3 FLEJES. CON APOYO PRFV NUEVO NO VA CAÑO DE BAJADA (AP-T-018 / AP-T-019).",
    "AP-T-019 NOTA 2: ESPUMA + BABERO SOBRE EL TRAMO DE CABLE EXPUESTO. MENSULAS DE LA RED AEREA EN H°A°: 2 FLEJES CON HEBILLA CADA UNA.",
    "CALCULADORA: 3 m DE FLEJE POR TABLERO AEREO SOBRE POSTE EXISTENTE (ÍTEM 71)."], w=800, sz=10, lh=13.5)
notasW(h, 40, yD + 2, [
    "COTAS EN mm. MANDA LA COTA. EL CAÑO SE DIBUJA A 1:40; EN EL 3D LA BANDA VA CON 1,2 DE ESPESOR PARA QUE SE VEA (REAL 0,7).",
    "(*) SEPARACION ENTRE FLEJES, FORMA DEL BABERO, MEDIDAS DE LA HEBILLA (SALVO 19,05 Y ESPESOR 1,5), COLA ≈ 10 Y MODELO DE LA HERRAMIENTA: A CONFIRMAR.",
    "(*) EL ITEM 71 DICE «3/4\" × 0,7\" × 30\"», LARGO 3 m; LA FICHA DICE 19,05 × 0,7 mm. EL «0,7\"» DEL PLIEGO PARECE SER mm: CONFIRMAR.",
    "LOS SUNCHOS DE ACERO 3/8 (4034) NO SE USAN. FUENTES: TVC / LAN SS304; BAND-IT C206 / C256; LP 21478 ITEMS 71/72/76; r3d/FUENTES_pat.md."], w=800, lh=14)
rayadosC(h, 40, 1104, ["INX", "HORM"], cols=2, dx=200)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - FLEJES CON HEBILLA SOBRE POSTE Y CAÑO", "ACERO INOXIDABLE AISI 304 · LA BANDA ABRAZA EL POSTE DE H°A° Y EL CAÑO DE BAJADA 5004")
A = img3d(h, "pat_fle1a", 860, 96, 560)
columna(h, A, [("cano", "", "CAÑO DOBLE AISLACION 5004"), ("poste", "", "POSTE H°A°"), ("fleje", "1", "FLEJE INOX 3/4\" (4024)"), ("oreja", "3", "OREJAS TRABADAS"), ("hebilla", "2", "HEBILLA 4025"), ("cola", "", "COLA DOBLADA")], 1440, 140, 500, paso=38)
h.txt(890, 556, "DETALLE - HEBILLA TRABADA (2 CAPAS DE FLEJE, OREJAS DOBLADAS Y COLA)", 11, 700, NV, "start", INT)
A2 = img3d(h, "pat_fle1b", 880, 566, 500)
columna(h, A2, [("cola", "", "COLA DOBLADA HACIA ATRAS"), ("oreja", "3", "OREJA DOBLADA"), ("fleje2", "", "2ª CAPA DE FLEJE"), ("fleje1", "", "1ª CAPA DE FLEJE"), ("base", "2", "BASE DE LA HEBILLA"), ("banda", "1", "FLEJE 19,05 × 0,7")], 1410, 620, 990, paso=40)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/pat_fle1a.mjs, pat_fle1b.mjs; poste de piezas/aerea.mjs). FUENTES: r3d/FUENTES_pat.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-FLEJE-1", "FLEJE INOX, HEBILLA", "Y CAÑO DE BAJADA", "CORTES, PASOS, HERRAMIENTA, ELEVACION Y 3D", "12:1 / 3:1", "1:40 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_fleje_1.svg"))
