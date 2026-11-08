"""MAT-JABALINA-2 (rev. B) · Tomacable de bronce (7019), conector C de compresión (7013 / 7014), grampa A184 (7016), cable 1 × 10 V/A (7010)
y la cámara de inspección. Geometría: r3d/piezas/perfiles_pat.mjs (TOMA, CAM, JAB); 3D: r3d/out/pat_jab2a.png, pat_jab2b.png. Fuentes: r3d/FUENTES_pat.md"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *

T = PP["TOMA"]; J = PP["JAB"]; C = PP["CAM"]; r = J["j58"]["D"] / 2
W0, W1 = T["ven"]["x0"] - T["pared"], T["ven"]["x1"] + T["pared"]; xb = W1 + 6; xc = r + 2.0; xp0, xp1 = xc + 2.0, xc + 2.0 + T["puente"]["e"]
h = hojaP()

def rrect(X, Y, x0, x1, y0, y1, k):
    return (f"M{X(x0 + k):.1f},{Y(y0):.1f} H{X(x1 - k):.1f} A{k * e:.1f},{k * e:.1f} 0 0 1 {X(x1):.1f},{Y(y0) + k * e:.1f} V{Y(y1) - k * e:.1f} "
            f"A{k * e:.1f},{k * e:.1f} 0 0 1 {X(x1 - k):.1f},{Y(y1):.1f} H{X(x0 + k):.1f} A{k * e:.1f},{k * e:.1f} 0 0 1 {X(x0):.1f},{Y(y1) - k * e:.1f} V{Y(y0) + k * e:.1f} A{k * e:.1f},{k * e:.1f} 0 0 1 {X(x0 + k):.1f},{Y(y0):.1f} Z")

# ================= CORTE A-A (planta por el bulón, 4:1) =================
h.titulo(40, 62, "CORTE A-A (PLANTA POR EL BULON)", 'ESC. 4:1 · TOMACABLE PARA JABALINA 5/8" · CUERPO 21 × 31 (*)')
e = 4.0; ox, oy = 150, 190; X = lambda x: ox + x * e; Y = lambda y: oy + y * e
h.path(rrect(X, Y, W0, xb, -T["E"] / 2, T["E"] / 2, 5) + " " + rrect(X, Y, T["ven"]["x0"], T["ven"]["x1"], -T["ven"]["z"] / 2 + 1.5, T["ven"]["z"] / 2 - 1.5, 3), "url(#BRZ)", K, 1.5, 'fill-rule="evenodd"')
h.rect(X(W1 - 1), Y(-4.2), (xb - W1 + 1) * e, 8.4 * e, "#fff", "none", 0)   # agujero roscado M10 en el cuerpo (se dibuja el bulón encima)
h.rect(X(xp0), Y(-T["ven"]["z"] / 2 + 2), (xp1 - xp0) * e, (T["ven"]["z"] - 4) * e, "url(#BRZ)", K, 1.1)   # puente
h.circ(X(0), Y(0), r * e, "url(#CU)", K, 1.3); h.circ(X(0), Y(0), (r - .25) * e, "url(#ACE)", K, .6)
for k in range(7):   # cuerda clase 5 insinuada
    a = 2 * math.pi * k / 6; rr = 0 if k == 6 else 1.35
    h.circ(X(xc) + rr * e * math.cos(a), Y(0) + rr * e * math.sin(a), .66 * e, "url(#cuG)", "#7a3a12", .4)
# bulón M10 (vista, no se raya)
Lb = xb - xp1
h.rect(X(xp1), Y(-5), Lb * e, 10 * e, "#fff", K, 1.1)
for i in range(int(Lb / 1.5)): xx = X(xp1 + i * 1.5 + .75); h.ln(xx, Y(-5) + 1, xx + 3, Y(5) - 1, K, .35)
af = T["bulon"]["af"]; ac = af / math.cos(math.pi / 6)
h.rect(X(xb), Y(-ac / 2), T["bulon"]["k"] * e, ac * e, "#fff", K, 1.3); h.ln(X(xb), Y(-ac / 4), X(xb + T["bulon"]["k"]), Y(-ac / 4), K, .6); h.ln(X(xb), Y(ac / 4), X(xb + T["bulon"]["k"]), Y(ac / 4), K, .6)
ejeH(h, X(W0) - 14, X(xb + T["bulon"]["k"]) + 14, oy); ejeV(h, X(0), Y(-T["E"] / 2) - 14, Y(T["E"] / 2) + 14)
h.dimH(Y(-T["E"] / 2) - 22, X(W0), X(xb), "≈ 38 (*)", ext=Y(-T["E"] / 2), c=OR)
h.dimV(X(W0) - 42, Y(-T["E"] / 2), Y(T["E"] / 2), "21 (*)", ext=X(W0), c=OR)
h.dimH(Y(T["E"] / 2) + 22, X(-r), X(r), "Ø14,6", ext=Y(T["E"] / 2) - 6)
for n, (px, py), (gx, gy) in [("1", (W0 + 2, -8), (W0 - 4, -22)), ("2", (-3, 3), (-8, 20)), ("3", (xc, 0), (xc - 2, -22)), ("4", (xp0 + 2, 6), (xp0 + 6, 20)), ("5", (xb + 3, 0), (xb + 12, -20))]:
    h.globo(n, X(px), Y(py), X(gx), Y(gy), r=8)
h.txt(X(xb + 12) + 14, Y(-20) + 4, "BULON M10 (*)", 9.5, 400, OR)
lineaCorte(h, X(W0) - 14, oy, X(xb + T["bulon"]["k"]) + 26, oy, "B")

# ================= CORTE B-B (vertical por el eje, 3:1) =================
h.titulo(470, 62, "CORTE B-B (VERTICAL)", "ESC. 3:1 · LA CUERDA PELADA QUEDA APRETADA")
e2 = 3.0; ox2, oy2 = 560, 250; X2 = lambda x: ox2 + x * e2; Z2 = lambda z: oy2 - z * e2
Hh = T["H"]
h.path(f"M{X2(W0)},{Z2(Hh / 2)} H{X2(xb)} V{Z2(-Hh / 2)} H{X2(W0)} Z M{X2(T['ven']['x0'])},{Z2(Hh / 2)} H{X2(T['ven']['x1'])} V{Z2(-Hh / 2)} H{X2(T['ven']['x0'])} Z", "url(#BRZ)", K, 1.4, 'fill-rule="evenodd"')
zr0, zr1 = Hh / 2 + 8, -Hh / 2 - 26
h.path(f"M{X2(-r) + 1.5 * e2},{Z2(zr0)} H{X2(r) - 1.5 * e2} L{X2(r)},{Z2(zr0 - 1.5)} V{Z2(zr1)} H{X2(-r)} V{Z2(zr0 - 1.5)} Z", "url(#ACE)", K, 1.2)
h.ln(X2(-r + .3), Z2(zr0 - 1.5), X2(-r + .3), Z2(zr1), K, .4); h.ln(X2(r - .3), Z2(zr0 - 1.5), X2(r - .3), Z2(zr1), K, .4)
h.path(f"M{X2(-r) - 4},{Z2(zr1)} q{r * e2 + 4},8 {2 * r * e2 + 8},0", "none", K, .9)
h.rect(X2(xc - 2), Z2(Hh / 2 + 3), 4 * e2, (Hh + 1) * e2, "url(#CU)", K, 1.0)
h.rect(X2(xc - 3), Z2(Hh / 2 + 30), 6 * e2, 27 * e2, "url(#PVCV)", K, 1.0)
h.rect(X2(xp0), Z2(Hh / 2 - 2), (xp1 - xp0) * e2, (Hh - 4) * e2, "url(#BRZ)", K, 1.0)
h.rect(X2(xp1), Z2(5), (xb - xp1) * e2, 10 * e2, "#fff", K, 1.0); h.rect(X2(xb), Z2(ac / 2), T["bulon"]["k"] * e2, ac * e2, "#fff", K, 1.2)
ejeH(h, X2(W0) - 10, X2(xb + 8) + 10, oy2)
h.dimV(X2(W0) - 18, Z2(Hh / 2), Z2(-Hh / 2), "31 (*)", ext=X2(W0), c=OR)
llamada(h, X2(xc + 3), Z2(Hh / 2 + 20), X2(xb) + 20, Z2(Hh / 2 + 26), "AISLACION V/A")
llamada(h, X2(xc + 1), Z2(-4), X2(xb) + 30, Z2(-Hh / 2 - 6), "CUERDA PELADA")
llamada(h, X2(xp0 + 2), Z2(Hh / 2 - 6), X2(xb) + 20, Z2(Hh / 2 + 6), "PUENTE")
llamada(h, X2(-r + 2), Z2(zr1 + 10), X2(-r) - 50, Z2(zr1 + 4), "JABALINA", K, "end")
h.txt(470, 398, "CUERPO Y PUENTE DE BRONCE SIN ZINC (ETG). SE APRIETA EL BULON HASTA", 9.5); h.txt(470, 411, "QUE LA CUERDA NO GIRA (PAR (*)). EL CABLE NO SE DOBLA A 90°.", 9.5, 400, OR)

# ================= CAMARA DE INSPECCION (1:5) =================
h.titulo(40, 420, "CAMARA DE INSPECCION - CORTE", "ESC. 1:5 · CAMARA 150 × 150 (GENROD 15 × 15) · SE MIDE LA PAT SIN EXCAVAR")
e3 = 0.5; ox3, oy3 = 215, 495; X3 = lambda x: ox3 + x * e3; Z3 = lambda z: oy3 - z * e3
a = C["a"] / 2 + C["e"]
h.path(f"M{X3(-300)},{Z3(0)} H{X3(-a)} V{Z3(-C['H'])} H{X3(a)} V{Z3(0)} H{X3(300)} V{Z3(-340)} H{X3(-300)} Z", "url(#TIE)", K, 1.0)
h.ln(X3(-300), Z3(0), X3(-a - 6), Z3(0), K, 1.6); h.ln(X3(a + 6), Z3(0), X3(300), Z3(0), K, 1.6)
for s in (-1, 1): h.rect(X3(s * a - (C["e"] if s > 0 else 0)), Z3(0), C["e"] * e3, C["H"] * e3, "url(#PLAS)", K, 1.0)
h.rect(X3(-a - 4), Z3(C["tapa"]), (2 * a + 8) * e3, C["tapa"] * e3, "url(#PLAS)", K, 1.2)
zj = -45
h.rect(X3(-r), Z3(zj), 2 * r * e3, 295 * e3, "url(#CU)", K, .9)
h.path(f"M{X3(-r) - 3},{Z3(zj - 295)} q{r * e3 + 3},6 {2 * r * e3 + 6},0", "none", K, .8)
zt = zj - 22
h.rect(X3(W0), Z3(zt + T["H"] / 2), (xb - W0) * e3, T["H"] * e3, "url(#BRZ)", K, .9)
h.path(f"M{X3(xc)},{Z3(zt + T['H'] / 2)} V{Z3(-60 - 18)} Q{X3(xc)},{Z3(-60)} {X3(xc + 18)},{Z3(-60)} H{X3(300)}", "none", K, 2.6)
h.path(f"M{X3(xc)},{Z3(zt + T['H'] / 2)} V{Z3(-60 - 18)} Q{X3(xc)},{Z3(-60)} {X3(xc + 18)},{Z3(-60)} H{X3(300)}", "none", "#fff", 1.2)
h.txt(X3(300) + 6, Z3(-60) + 4, "A LA COLUMNA", 9.5, 700)
h.nivel(X3(-280), Z3(0), "±0,00")
h.dimV(X3(-a) - 24, Z3(0), Z3(-C["H"]), "150 (*)", ext=X3(-a), c=OR)
h.dimH(Z3(C["tapa"]) - 14, X3(-a), X3(a), "150 + 2 × 6 (*)", ext=Z3(C["tapa"]), c=OR)
h.dimV(X3(-a) + 16, Z3(0), Z3(zj), "45 (*)", c=OR)
for n, (px, pz), (gx, gz) in [("6", (a - 3, -120), (a + 50, -130)), ("7", (40, C["tapa"] / 2), (130, 30)), ("2", (0, -250), (60, -250)), ("1", (W0, zt), (-50, -110)), ("8", (200, -60), (220, -100))]:
    h.globo(n, X3(px), Z3(pz), X3(gx), Z3(gz), r=8)
h.txt(X3(-300), Z3(-340) + 14, "TIERRA NATURAL · CAMARA SIN FONDO · LA JABALINA SIGUE (L = 1500)", 9.5, 400, G)

# ================= CONECTOR C Y GRAMPA (esquemas) =================
h.titulo(560, 420, "CONECTOR «C» CMC-7 / CMC-8", "ESQUEMA S/E · SE CIERRA CON PINZA, NO CON BULON (*)")
cx, cy = 650, 520
h.path(f"M{cx + 50},{cy - 40} A52,52 0 1 0 {cx + 50},{cy + 40} L{cx + 34},{cy + 25} A34,34 0 1 1 {cx + 34},{cy - 25} Z", "url(#BRZ)", K, 1.4)
h.circ(cx - 14, cy, 22, "url(#CU)", K, 1); h.circ(cx + 20, cy, 10, "url(#cuG)", "#7a3a12", .8)
llamada(h, cx - 14, cy, cx - 70, cy + 70, "JABALINA", K, "end"); llamada(h, cx + 20, cy, cx + 70, cy + 66, "CABLE 6–16 (7013) · 25 (7014)")
h.titulo(560, 610, "GRAMPA TERMINAL A184 (7016)", "ESQUEMA S/E · FORMA A CONFIRMAR (*)")
gx, gy = 600, 640
h.rect(gx, gy, 90, 30, "url(#BRZ)", K, 1.2); h.circ(gx + 22, gy + 15, 8, "#fff", K, 1); h.rect(gx + 90, gy + 7, 60, 16, "url(#BRZ)", K, 1.0); h.circ(gx + 130, gy + 15, 5, "#fff", K, .9)
h.txt(gx, gy + 46, "Cu ESTAÑADO · CABLE DE PAT A OJAL", 9.5, 400, OR)

# ================= TABLAS =================
yC = codigos(h, 40, 728, [7019, 7013, 7014, 7016, 7010], {7019: 'jabalina 5/8" + cable', 7013: "jab. 5/8\" + 6–16 mm²", 7014: "jab. 5/8\" + 25 mm²", 7016: "cable de PAT", 7010: "jabalina → borne / barra"}, wdesc=440, wx=170)
yD = bloque(h, 40, yC + 18, "DATOS TECNICOS", [
    "BRONCE SIN ZINC EN LA ALEACION (ETG CAP. 14.2: TAMPOCO LATON, AUNQUE VENGA ESTAÑADO). COMERCIALES DE 13 × 17 A 21 × 31 mm (T1 A T4).",
    "CABLE 7010: Cu 1 × 10 V/A IRAM NM 247-3, Ø 6,0, AISLACION 1,0, CUERDA CLASE 5. SE CALCULA 10 m POR TABLERO + 7 m POR CIRCUITO (PRFV) O 4 m POR COLUMNA.",
    "1 TOMACABLE POR JABALINA (ÍTEM 74). FOTO DE LA CONEXION ANTES DE TAPAR (GUIA PAT, PASO 4)."], w=800, sz=10, lh=13.5)
notasW(h, 40, yD + 2, [
    "COTAS EN mm. MANDA LA COTA. EL TOMACABLE SE DIBUJA PARA LA JABALINA 5/8\" (Ø14,6) DEL PLIEGO.",
    "(*) CONTRADICCION: LA ETG PROHIBE EL «TOMACABLE DE AJUSTE A ROSCA» Y PIDE A COMPRESION ELASTICA (PINZA PICO DE LORO) O TIPO «TGC»; EL 7019 COMERCIAL (GENROD) APRIETA CON TORNILLO. CONFIRMAR QUE MODELO WGC / TGC SE COMPRA. SI NO SIRVE: CONECTOR C 7013 / 7014.",
    "(*) MEDIDAS DEL CUERPO, BULON M10, PUENTE, CAMARA (ALTO 150, ESPESOR 6) Y PROFUNDIDAD DE LA CABEZA (≈ 45): A CONFIRMAR.",
    "LA CAMARA NO TIENE FONDO: LA JABALINA ENTRA EN LA TIERRA. EL CABLE SALE POR UN PASACABLE HACIA LA COLUMNA O EL TABLERO.",
    "FUENTES: FICHA «TOMACABLE Y CONECTORES» (TAREA / GENROD); ETG CAP. 14; GENROD CAJA DE INSPECCION 15 × 15; r3d/FUENTES_pat.md."], w=800, lh=14)
rayadosC(h, 40, 1104, ["BRZ", "CU", "ACE", "TIE", "PLAS", "PVCV"], cols=6, dx=135)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - TOMACABLE EN LA CABEZA DE LA JABALINA", "CUERPO DE BRONCE CORTADO A CUARTO: EL PUENTE APRIETA LA CUERDA PELADA DEL 1 × 10 V/A")
A = img3d(h, "pat_jab2a", 870, 70, 560)
columna(h, A, [("cable", "8", "CABLE 1 × 10 V/A (7010)"), ("aisl", "", "AISLACION CORTADA ARRIBA"), ("cuerda", "3", "CUERDA PELADA"), ("puente", "4", "PUENTE DE BRONCE"),
               ("cuerpo", "1", "CUERPO DE BRONCE (7019)"), ("bulon", "5", "BULON M10 (*)"), ("contacto", "", "CONTACTO CON LA JABALINA"), ("jabalina", "2", "JABALINA 7015")], 1440, 100, 480, paso=34)
h.txt(890, 556, "EN SU LUGAR - CAMARA DE INSPECCION (TERRENO CORTADO A CUARTO)", 11, 700, NV, "start", INT)
A2 = img3d(h, "pat_jab2b", 880, 566, 500)
columna(h, A2, [("tapa", "7", "TAPA (*)"), ("camara", "6", "CAMARA 150 × 150"), ("pasacable", "", "PASACABLE A LA COLUMNA"), ("tomacable", "1", "TOMACABLE"),
                ("cable", "8", "CABLE 1 × 10 V/A"), ("jabalina", "2", "JABALINA (SIGUE 1500)"), ("terreno", "", "TIERRA NATURAL")], 1400, 600, 990, paso=36)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/pat_jab2a.mjs, pat_jab2b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_pat.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-JABALINA-2", "TOMACABLE, CONECTORES", "Y CAMARA DE INSPECCION", "CORTES A-A Y B-B, CAMARA, ESQUEMAS Y 3D", "4:1 / 3:1", "CAMARA 1:5 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_jabalina_2.svg"))
