"""MAT-BRAZO_HG-1 · Brazo de H°G° para luminaria, largo total 2,13 m (4501), AP-TC-055 hoja E.
Datos: FICHAS_TEC.brazo_hg (largo 2,13 m, H°G° con tensor, 2 abrazaderas por Ø del poste Ø220/240/260… con 2 bulones c/u o 2 bulones MN 52
en madera, ítems 1.28–1.34, «a confirmar» Ø y espesor: en planos viejos de EPEC MN 25 Ø38 × 1,8 o Ø48 × 2,9 con acople Ø60 × 150),
FAMILIAS_MAT.brazo_hg, catálogo del pañol, hoja aprobada AP-TC-055 (abrazadera por Ø medido 4001…4008, bulón Ø12 × 90 4018). Resto: (*)."""
from ilukit import *
h = nueva(); m = h.m

# ======================= ELEVACION (1:15 → 0,267 px/mm)
k = 0.14; PX, YB = 150, 470          # PX = cara del poste, YB = abrazadera de abajo
h.titulo(40, 62, "ELEVACION - BRAZO MONTADO", "ESC. 1:30 - COTAS EN mm - SOBRE POSTE H°A° Ø≈220 (*)")
DP = 220
h.rect(PX - DP * k, 90, DP * k, 440, "url(#CONC)", K, 1.4)                 # poste (cara)
L = 2130; ZB = 600                   # separación vertical abrazadera brazo ↔ abrazadera tensor (*)
yA = YB - ZB * k                     # abrazadera de arriba (brazo)
for yy in (yA, YB): h.rect(PX - DP * k - 6, yy - 8, DP * k + 12, 16, "url(#STEEL)", K, 1)
xe = PX + (L - 0) * k - DP * k * .0
rise = 150                            # subida de la punta (*)
h.path(f"M{PX},{yA-5} L{PX + L*k},{yA - rise*k - 5} L{PX + L*k},{yA - rise*k + 5} L{PX},{yA+5} Z", "#fff", K, 1.4)     # brazo (caño)
xt = PX + 0.55 * L * k; yt = yA - rise * k * .55
h.path(f"M{PX},{YB-3} L{xt},{yt+2} L{xt+3},{yt+5} L{PX},{YB+3} Z", "#fff", K, 1)                                      # tensor (*)
h.rect(PX + L * k - 6, yA - rise * k - 14, 70, 22, "#fff", K, .7, 'stroke-dasharray="4 2"'); h.txt(PX + L * k + 30, yA - rise * k - 20, "LUMINARIA LED", 9, 700, K, "middle")
h.dimH(yA - rise * k - 50, PX - DP * k, PX + L * k, "LARGO TOTAL 2.130", ext=yA - rise * k - 16)
h.dimV(PX + L * k + 36, yA - rise * k, yA, "150 (*)", ext=PX + L * k + 2, c=OR)
h.dimV(PX - DP * k - 26, yA, YB, "600 (*)", ext=PX - DP * k - 8, c=OR)
h.dimH(YB + 50, PX - DP * k, PX, "Ø≈220 (*)", ext=YB + 10, c=OR)
h.globo("1", PX + 200, yA - 19, 230, 200); h.globo("2", PX + 100, YB - 40, 260, 500, OR); h.globo("3", PX - DP * k - 6, yA, 60, 250)
h.globo("4", PX - DP * k - 6, YB, 60, 430); h.globo("5", PX + L * k + 30, yA - rise * k - 4, 500, 200)
corteMarca(h, PX - DP * k - 30, yA - 18, PX + 30, yA - 18, "A")
h.txt(PX - DP * k + 4, 530 + 16, "POSTE (6501 · 6023 · 6502)", 9.5, 400, G)

# ======================= CORTE A-A · ABRAZADERA (1:5)
h.titulo(560, 62, "CORTE A-A", "ABRAZADERA DEL BRAZO - ESC. 1:7 - ESQUEMA (*)")
cx, cy, e = 700, 280, .6
R = DP / 2 * e
h.circ(cx, cy, R, "url(#CONC)", K, 1.4)
h.path(f"M{cx-R-6},{cy} A{R+6},{R+6} 0 0,1 {cx+R+6},{cy}", "none", K, 4.5)
h.path(f"M{cx-R-6},{cy} A{R+6},{R+6} 0 0,0 {cx+R+6},{cy}", "none", K, 4.5)
for sx in (-1, 1):
    h.rect(cx + sx * (R + 6) - 14 + (14 if sx > 0 else 0), cy - 4, 14, 8, "url(#STEEL)", K, 1)   # orejas
    h.rect(cx + sx * (R + 13) - 3, cy - 22, 6, 44, "#fff", K, .9); h.rect(cx + sx * (R + 13) - 7, cy - 30, 14, 8, "#fff", K, .9)
h.rect(cx - 30, cy - R - 64, 60, 58, "#fff", K, 1.1); h.txt(cx, cy - R - 32, "ACOPLE", 9, 700, K, "middle")
h.circ(cx, cy - R - 35, 19, "#fff", K, 1.1); h.circ(cx, cy - R - 35, 16, "url(#STEEL)", K, .7)
h.dimH(cy + R + 32, cx - R, cx + R, "Ø DEL POSTE (SE MIDE)", ext=cy + 8)
h.txt(cx + R + 26, cy - 34, "2 BULONES Ø12 × 90 (*)", 9.5, 400, OR)
h.txt(cx, cy + R + 52, "ABRAZADERA POR Ø: ≤140 · ≤200 · ≤220 · ≤240 · ≤260 · ≤300 · +", 9, 400, G, "middle")
h.txt(cx, cy + R + 64, "(CODIGOS 4001…4008, FICHA «HERRAJES»)", 9, 400, G, "middle")
h.globo("3", cx - R - 5, cy - 30, 600, 160); h.globo("1", cx, cy - R - 35, 760, 130)

# ======================= D1 · CAÑO DEL BRAZO (1:2) · VARIANTES EPEC
h.titulo(500, 470, "D1 · CAÑO (PLANOS VIEJOS EPEC)", "ESC. 1:2 - REFERENCIA, A CONFIRMAR (*)")
for (x0, d, t, txt) in ((560, 38, 1.8, "MN 25: Ø38 × 1,8"), (690, 48, 2.9, "Ø48 × 2,9 + ACOPLE Ø60 × 150")):
    h.circ(x0, 545, d / 2 * 1.4, "url(#STEEL)", K, 1.2); h.circ(x0, 545, (d / 2 - t) * 1.4, "#fff", K, .8)
    h.txt(x0, 545 + d * .7 + 20, txt + " (*)", 9.5, 400, OR, "middle")

# ======================= TABLAS
y2 = h.codigos(40, 625, [4501], extra={4501: "ítems 1.28 a 1.34 (con LED)"}, wx=200)
h.datos(40, y2 + 30, [("MATERIAL", "hierro galvanizado (H°G°)"), ("LARGO TOTAL", "2,13 m (AP-TC-055 hoja E)"),
        ("FORMA", "caño con tensor"), ("Ø / ESPESOR", "a confirmar (*)"), ("FIJACION H°A°/MET.", "2 abrazaderas por Ø del poste"),
        ("FIJACION MADERA", "2 bulones MN 52 pasantes"), ("LUMINARIA", "LED vial (6010), en la punta")], w=420, c1=130)
textoBloque(h, 485, y2 + 30, "DONDE SE USA", [
    "· AP-TC-055 hoja E: unidad aérea de barrio,",
    "   apoyo nuevo con brazo y luminaria LED.",
    "· LP 21478: ítems 1.28 a 1.34 (con LED).",
    "· Calculadora modo 🏘 Barrio: 1 brazo por",
    "   luminaria en apoyo nuevo.",
    "· Guía «Unidad aérea de barrio»."], sz=10, dy=15)
h.lista(485, y2 + 150, "QUE LLEVA (POR BRAZO)", ["· 2 abrazaderas por Ø (4001…4008)", "· 4 bulones Ø12 × 90 (4018)", "· Madera: 2 bulones MN 52 (4016)"], sz=10.5, dy=16)
h.notas(40, 1040, [
    "COTAS EN mm. SOLO EL LARGO TOTAL 2,13 m ESTA EN LA APP; EL RESTO ES ESQUEMA (*) HASTA TENER LA HOJA E DEL AP-TC-055.",
    "(*) A CONFIRMAR CON EL PLANO: Ø Y ESPESOR DEL CAÑO, ACOPLE A LA LUMINARIA, INCLINACION, TENSOR Y SEPARACION DE ABRAZADERAS.",
    "LA ABRAZADERA SE ELIGE CON EL Ø MEDIDO DEL POSTE A ESA ALTURA (PERIMETRO ÷ 3,14).",
    "FUENTE: LP 21478 ANEXO I (1.28–1.34); PLANOS TIPO DE EPEC ANTERIORES (BRAZO MN 25); CATALOGO DEL PAÑOL."])

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - BRAZO H°G° 2,13 m EN SU LUGAR", "SOBRE POSTE H°A° · TENSOR, ABRAZADERAS Y LUMINARIA LED · ESQUEMA (*)")
h.iso(.21, 1060, 700)
m.cyl([0, 0, -1200], [0, 0, 1400], 112, "hormigon", n=32, r1=100, seg=8, capmat="#a7abb0"); m.render()
for z in (0, 600):
    m.ring([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], 114, 124, z - 30, z + 30, 0, 360, "galv", n=36); m.render()
def P3(t, z0=600, rise=150): return [0, -(110 + t * 2020), z0 + rise * t]
m.cyl(P3(0), P3(1), 24, "galv", n=16, seg=6, capmat="#c9d1d8")
m.cyl([0, -112, 0], P3(.55), 12, "galv", n=12, seg=4); m.render()
c0 = P3(1); u = [0, -1, 0]; v = [1, 0, 0]
poly = [(-60, -100), (90, -156), (515, -156), (515, 156), (90, 156), (-60, 100)]
A = [[c0[0] + v[0] * b, c0[1] + u[1] * a, c0[2] - 50] for a, b in poly]; B = [[p[0], p[1], p[2] + 90] for p in A]
m.face(B, "#d7dbdf", 0, "#7a8188"); m.face(A, "#b4bac0", 0, "#7a8188")
for i in range(len(A)): j = (i + 1) % len(A); m.face([A[i], A[j], B[j], B[i]], "#c3c8cd", 0, "#7a8188")
m.render()
h.g3("1", tuple(P3(.35)), 1380, 220, "BRAZO H°G° 2,13 m (4501)")
h.g3("2", (0, (-112 + P3(.55)[1]) / 2, P3(.55)[2] / 2), 1380, 300, "TENSOR (*)", OR)
h.g3("3", (60, -100, 600), 1380, 520, "ABRAZADERA DEL BRAZO")
h.g3("4", (60, -100, 0), 1380, 560, "ABRAZADERA DEL TENSOR")
h.g3("5", tuple(P3(1.05)), 1380, 180, "LUMINARIA LED (6010)")
h.g3("6", (80, 60, -600), 1380, 760, "POSTE H°A° 8,5 m (6501 / 6023)")
h.rotulo(890, h.H - 150, 750, "MAT-BRAZO_HG-1", "BRAZO DE H°G°", "LARGO TOTAL 2,13 m", "ELEVACION, ABRAZADERA, CAÑO, CODIGO, DATOS Y 3D", "1:30 / 1:7", "D1 1:2 · 3D S/E")
guardar(h, "mat_brazo_hg_1")
