"""MAT-FLEJE-2 (rev. B) · Transición aéreo-subterránea AP-TC-024: caño H°G° Ø2" × 6,4 m (5501), pipeta (5502), flejes con hebilla, alternativa doble aislación (5004).
Geometría: r3d/piezas/perfiles_pat.mjs (CANO.c2, FLE); 3D: r3d/out/pat_fle2a.png, pat_fle2b.png. Plano oficial AP-TC-024 pendiente: medidas «(*)». Fuentes: r3d/FUENTES_pat.md"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *

C = PP["CANO"]; c2 = C["c2"]; ro = c2["De"] / 2; ri = ro - c2["e"]
h = hojaP()

# ================= ELEVACION (1:60) =================
h.titulo(40, 62, "TRANSICION AEREO-SUBTERRANEA (AP-TC-024)", "ESC. 1:60 · PLANO OFICIAL PENDIENTE: MEDIDAS A CONFIRMAR (*)")
k = 1 / 60 * 3.3; x0, yb = 120, 560
h.path(f"M{x0 - 18},{yb + 40} L{x0 - 12},{yb - 7200 * k} H{x0 + 12} L{x0 + 18},{yb + 40} Z", "url(#HORM)", K, 1.4)
h.rect(x0 + 17, yb - 6400 * k, 60.3 * k * 6, 6400 * k + 10, "url(#HG)", K, 1.0)
for z in (800, 3200, 5800): h.rect(x0 - 16, yb - z * k - 2.5, 34 + 60.3 * k * 6, 5, "url(#INX)", K, .8)
px = x0 + 17 + 60.3 * k * 3
h.path(f"M{px - 9},{yb - 6400 * k} v-8 a16,14 0 0 1 32,0 v8 h-8 v-6 a8,7 0 0 0 -16,0 v6 Z", "#fff", K, 1.1)
h.path(f"M{px + 19},{yb - 6400 * k + 4} C{px + 30},{yb - 6400 * k + 40} {px + 120},{yb - 6400 * k - 20} {px + 260},{yb - 6400 * k - 30}", "none", K, 2.2)
h.path(f"M{px},{yb} Q{px + 2},{yb + 24} {px + 40},{yb + 24} H{x0 + 330}", "none", K, 3)
h.ln(x0 - 70, yb, x0 + 340, yb, K, 1.6); h.nivel(x0 + 300, yb, "±0,00")
h.path(f"M{x0 + 60},{yb + 6} h270 v40 h-270 Z", "none", K, .6, 'stroke-dasharray="5 3"'); h.txt(x0 + 200, yb + 58, "ZANJA (AP-TC-001)", 9, 400, G, "middle")
h.dimV(x0 + 66, yb - 6400 * k, yb, "6400 (5501) · 4000 (5004)", ext=x0 + 26)
h.dimV(x0 - 44, yb - 7200 * k, yb, "POSTE ≥ 7 m (*)", ext=x0 - 14, c=OR)
for n, (gx, gy), (tx, ty), t in [("1", (px, yb - 6400 * k - 12), (x0 + 170, yb - 6400 * k + 40), "PIPETA 5502 + ESPUMA 8010"), ("2", (x0 + 25, yb - 3200 * k), (x0 + 170, yb - 3200 * k), "3 FLEJES INOX 3/4\" CON HEBILLA"),
                                   ("3", (x0 + 22, yb - 1800 * k), (x0 + 170, yb - 1800 * k), "CAÑO H°G° Ø2\" (5501)"), ("4", (x0 + 200, yb + 24), (x0 + 220, yb + 90), "SIGUE EN PEAD Ø50 (5005) A LA ZANJA"),
                                   ("5", (px + 200, yb - 6400 * k - 25), (x0 + 170, yb - 6400 * k - 50), "TOMA DE LA RED: 1995/1 (3051)")]:
    h.globo(n, gx, gy, tx, ty, r=8); h.txt(tx + 14, ty + 4, t, 9.5)
lineaCorte(h, x0 + 2, yb - 1000 * k, x0 + 30 + 60.3 * k * 6, yb - 1000 * k, "A")

# ================= CORTE A-A (3:1) =================
h.titulo(500, 62, "CORTE A-A DEL CAÑO", "ESC. 2:1 · CAÑO H°G° 2\" (IRAM 2502 / BSP) · CABLE DE LA RED ADENTRO")
e = 2.0; cx, cy = 610, 170
h.circ(cx, cy, ro * e, "url(#HG)", K, 1.4); h.circ(cx, cy, ri * e, "#fff", K, 1.0)
h.circ(cx - 12, cy + 10, PC["CAB"]["p1x25"]["Ro"] * e, "url(#PVCV)", K, 1.0); h.circ(cx - 12, cy + 10, 2.9 * e, "url(#ALU)", K, .7)
ejeH(h, cx - ro * e - 12, cx + ro * e + 12, cy); ejeV(h, cx, cy - ro * e - 12, cy + ro * e + 12)
h.dimH(cy + ro * e + 20, cx - ro * e, cx + ro * e, "Ø60,3", ext=cy)
h.dimV(cx + ro * e + 20, cy - ro * e, cy - ri * e, "3,65 (*)", ext=cx)
llamada(h, cx - 12, cy + 10, cx + ro * e + 30, cy + 40, "PILOTO Al 1 × 25 (Ø9,5)")

# ================= D1 PIPETA EN CORTE (1:1,5) =================
h.titulo(500, 300, "D1 - PIPETA ENROSCADA (CORTE)", "ESC. 1:1 · FORMA (*) · BOCA HACIA ABAJO: NO ENTRA EL AGUA")
e2 = 1.0; dx, dy = 600, 560; X = lambda x: dx + x * e2; Z = lambda z: dy - z * e2
Lr = C["rosca"]; Rb = 48; P2 = c2["paso"]; Hf = P2 / (2 * math.tan(math.radians(27.5)))
def rr(z):
    s_ = ((z + 200) / P2) % 1; tri = 1 - abs(2 * s_ - 1); return min(ro - Hf / 6, max(ro - Hf * 5 / 6, ro - Hf + Hf * tri))
zs = [-Lr + Lr * i / 120 for i in range(121)]
for lado in (-1, 1):
    pts = [(X(lado * ri), Z(-150)), (X(lado * ro), Z(-150)), (X(lado * ro), Z(-Lr))] + [(X(lado * rr(z)), Z(z)) for z in zs] + [(X(lado * ri), Z(0))]
    h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z", "url(#HG)", K, 1.0)
    h.path(f"M{X(lado * (ro + .3)):.1f},{Z(6):.1f} V{Z(-Lr):.1f} H{X(lado * (ro + 7)):.1f} V{Z(6):.1f} Z", "url(#ALU)", K, 1.1)
# codo de 180° (pared de 7) que termina con la boca hacia abajo en x = 2 Rb
for (r_o, r_i) in ((Rb + ro + 7, Rb + ro), (Rb - ro, Rb - ro - 7)):
    h.path(f"M{X(Rb - r_o)},{Z(6)} A{r_o * e2},{r_o * e2 * .9} 0 0 1 {X(Rb + r_o)},{Z(6)} H{X(Rb + r_i)} A{r_i * e2},{r_i * e2 * .9} 0 0 0 {X(Rb - r_i)},{Z(6)} Z", "url(#ALU)", K, 1.2)
h.path(f"M{X(2 * Rb + 50)},{Z(-150)} C{X(2 * Rb + 10)},{Z(-90)} {X(2 * Rb)},{Z(-40)} {X(2 * Rb)},{Z(6)} A{Rb * e2},{Rb * e2 * .9} 0 0 0 {X(0)},{Z(6)} V{Z(-150)}", "none", K, 2.4)
ejeV(h, X(0), Z(-160), Z(Rb + 30))
h.dimV(X(-ro - 7) - 14, Z(0), Z(-Lr), "30 (*)", ext=X(-ro - 7), c=OR)
llamada(h, X(-ro + 1), Z(-Lr + 6), X(-ro) - 50, Z(-Lr - 20), "ROSCA BSP 2\"", K, "end"); llamada(h, X(Rb), Z(6 + (Rb + ro + 4) * .9), X(Rb) + 70, Z(6 + (Rb + ro + 4) * .9) - 6, "PIPETA 5502 (*)")
llamada(h, X(2 * Rb + 6), Z(-70), X(2 * Rb) + 50, Z(-90), "CABLE DE LA RED"); llamada(h, X(-ro + 1), Z(-120), X(-ro) - 50, Z(-130), "CAÑO 5501", K, "end")
h.circ(X(-ro), Z(-Lr / 2), 11, "none", K, .6, 'stroke-dasharray="3 2"'); h.txt(X(-ro) - 14, Z(-Lr / 2) - 10, "D2", 10, 700, K, "end")

# ================= D2 rosca BSP 2" =================
h.titulo(40, 640, "D2 - ROSCA GAS BSP 2\" (CAÑO)", "ESC. 10:1 · 55° · P = 2,309 (25,4 / 11) · CONICA 1:16 (ISO 7-1)")
P = c2["paso"]; ed = 10.0; x2, y2 = 60, 730; Hf = P / (2 * math.tan(math.radians(27.5))); pts = []
for i in range(4 * 16 + 1):
    z = 4 * P * i / 64; s = (z / P) % 1; tri = 1 - abs(2 * s - 1); rr = min(Hf * 5 / 6, max(Hf / 6, Hf * tri)); pts.append((x2 + z * ed, y2 - (rr - Hf / 6) * ed + z * ed / 32))
h.path(poly(pts) + f" L{x2 + 4 * P * ed},{y2 + 26} L{x2},{y2 + 26} Z", "url(#HG)", K, 1.1)
h.dimH(y2 - .64 * P * ed - 14, x2 + P * ed * .5, x2 + P * ed * 1.5, "2,309", ext=y2 - .64 * P * ed)
h.txt(x2 + 4 * P * ed + 20, y2 - 4, "PROFUNDIDAD 0,64 P = 1,48 · CRESTAS REDONDEADAS", 9.5); h.txt(x2 + 4 * P * ed + 20, y2 + 10, "LA PIPETA ENROSCA EN LA PUNTA DEL CAÑO; SELLAR CON CINTA", 9.5)

# ================= TABLAS =================
yC = codigos(h, 40, 770, [5501, 5502, 5004, 8010, 5005, 4024, 4025], {5501: "ítem 8.03 · L = 6,4 m", 5502: "boca de arriba", 5004: "ítem 8.02 (alternativa)", 8010: "sellado de las bocas", 5005: "sigue a la zanja", 4024: "3 por bajada (MAT-FLEJE-1)", 4025: "3 por bajada"}, wdesc=420, wx=180, rowh=15)
yD = bloque(h, 40, yC + 14, "DATOS TECNICOS Y DONDE SE USA", [
    "CAÑO 5501: H°G° Ø2\" × 6,4 m (ÍTEM 8.03) · ALTERNATIVA 5004: DOBLE AISLACION Ø2\" × 4 m (ÍTEM 8.02) · PAGO: ÍTEM 6.07 POR m · 6.08 POR UNIDAD.",
    "AP-TC-024: PASA LA RED AEREA A SUBTERRANEO (O A UNA COLUMNA) BAJANDO POR UN POSTE. 3 FLEJES COMO MINIMO · BOCA DE ARRIBA CON PIPETA · BOCAS SELLADAS CON ESPUMA.",
    "CALCULADORA MODO BARRIO → «TRANSICION AEREO-SUBTERRANEA»."], w=800, sz=10, lh=13.5)
notasW(h, 40, yD + 2, [
    "ESQUEMA: EL PLANO OFICIAL AP-TC-024 NO LO TENEMOS TODAVIA. DIBUJO Y MEDIDAS A CONFIRMAR (*). 5501 / 5502 SON CODIGOS DE LA APP (RANGO x500).",
    "(*) ESPESOR DEL CAÑO (3,65), LARGO ROSCADO, FORMA DE LA PIPETA Y SEPARACION DE LOS FLEJES: A CONFIRMAR CON EL FABRICANTE / PLANO. FUENTES: r3d/FUENTES_pat.md."], w=800, lh=14)
rayadosC(h, 40, 1104, ["HG", "ALU", "INX", "HORM", "PVCV"], cols=5, dx=160)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - PIPETA SOBRE EL CAÑO H°G° (CORTADO A CUARTO)", "ROSCA BSP REAL · EL CABLE ENTRA POR LA BOCA DE ABAJO DE LA PIPETA Y BAJA POR EL CAÑO")
A = img3d(h, "pat_fle2a", 870, 96, 560)
columna(h, A, [("pipeta", "1", "PIPETA 5502 (*)"), ("boca", "", "BOCA HACIA ABAJO"), ("roscaP", "", "ROSCA DE LA PIPETA"), ("rosca", "", "ROSCA BSP 2\" (CORTE)"), ("cable", "", "CABLE DE LA RED"),
               ("pared", "", "PARED DEL CAÑO"), ("cano", "3", "CAÑO H°G° Ø2\" 5501")], 1440, 130, 510, paso=40)
h.txt(890, 566, "EN SU LUGAR - ARRIBA DEL POSTE: CAÑO, FLEJE, PIPETA Y BAJADA DE LA RED (*)", 11, 700, NV, "start", INT)
A2 = img3d(h, "pat_fle2b", 880, 576, 500)
columna(h, A2, [("cable", "5", "BAJADA DE LA RED"), ("pipeta", "1", "PIPETA"), ("boca", "", "ENTRADA DEL CABLE"), ("poste", "", "POSTE H°A°"), ("fleje", "2", "FLEJE + HEBILLA"), ("cano", "3", "CAÑO H°G° 5501")], 1400, 620, 990, paso=40)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/pat_fle2a.mjs, pat_fle2b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_pat.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-FLEJE-2", "CAÑO H°G° 2\" Y PIPETA", "TRANSICION AP-TC-024", "ELEVACION, CORTE, D1 PIPETA, D2 ROSCA Y 3D", "1:60 / 2:1", "D1 1:1 · D2 10:1", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_fleje_2.svg"))
