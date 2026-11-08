"""MAT-BRAZO_HG-1 (rev. B) · Brazo de H°G° para luminaria, largo total 2,13 m (4501), AP-TC-055 hoja E.
Geometría: r3d/piezas/perfiles_col.mjs (BHG) → perfiles_col.json; 3D: r3d/out/col_bhg.png y col_bhg_det.png.
Datos: FICHAS_TEC.brazo_hg (largo 2,13 m, H°G° con tensor, 2 abrazaderas por Ø del poste o 2 bulones MN 52 en madera, ítems 1.28–1.34; «a confirmar»
Ø y espesor: en planos viejos de EPEC MN 25 Ø38 × 1,8 o Ø48 × 2,9 con acople Ø60 × 150), catálogo (abrazaderas 4001…4008, bulón Ø12 × 90 4018).
Rosca: gas cilíndrica/cónica 1 1/2" (11 hilos por pulgada, IRAM 5063 / ISO 7) (*). Resto: ESQUEMA (*)."""
from colkit import *

h = nueva3()
B = BHG; A = B["acople"]; Ab = B["abraz"]

# ======================= 1. ELEVACION (1:20)
k = .14; PX, YA = 100, 250          # PX = cara del poste, YA = abrazadera de arriba
h.titulo(40, 62, "ELEVACION - BRAZO MONTADO", "ESC. 1:30 · SOBRE POSTE H°A° Ø≈220 (*) · ESQUEMA (*)")
DP = B["posteD"]; YT = YA + B["sep"] * k
h.rect(PX - DP * k, 100, DP * k, 360, "url(#HA)", K, 1.3); rotura(h, PX - DP * k, PX, 100); rotura(h, PX - DP * k, PX, 460)
for yy in (YA, YT): h.rect(PX - DP * k - 4, yy - Ab["b"] / 2 * k, DP * k + 8, Ab["b"] * k, "url(#MET)", K, .9); h.rect(PX - 2, yy - 9, 4 + 2, 18, "url(#MET)", K, .7)
Lh = B["L"] - DP / 2 - 12 - B["rosca"]["L"]; ang = math.atan2(B["sube"], Lh)
def Pb(t, n=0): return (PX + 2 + t * math.cos(ang) * k - n * math.sin(ang) * k, YA - t * math.sin(ang) * k - n * math.cos(ang) * k)
Lr = math.hypot(Lh, B["sube"])
poly(h, [Pb(0, B["D"] / 2), Pb(Lr, B["D"] / 2), Pb(Lr, -B["D"] / 2), Pb(0, -B["D"] / 2)], "#fff", 1.3)
poly(h, [Pb(Lr, B["D"] / 2), Pb(Lr + B["rosca"]["L"], B["D"] / 2 - 1), Pb(Lr + B["rosca"]["L"], -B["D"] / 2 + 1), Pb(Lr, -B["D"] / 2)], "url(#cuH)", .8)
poly(h, [Pb(Lr + 8, A["D"] / 2), Pb(Lr + 8 + A["L"], A["D"] / 2), Pb(Lr + 8 + A["L"], -A["D"] / 2), Pb(Lr + 8, -A["D"] / 2)], "#fff", 1.1)
t1 = Pb(Lh * B["tensor"]["t"] / math.cos(ang), -B["D"] / 2)
h.path(f"M{PX+2},{YT-3} L{t1[0]:.1f},{t1[1]-2:.1f} L{t1[0]+2:.1f},{t1[1]+2:.1f} L{PX+2},{YT+3} Z", "#fff", K, 1)
lum = Pb(Lr + 60, 0)
h.rect(lum[0], lum[1] - 10, 70, 16, "none", G, .7, 'stroke-dasharray="6 2 1.5 2"'); h.txt(lum[0] + 35, lum[1] - 16, "LUMINARIA", 8.5, 700, G, "middle")
h.dimH(118, PX - DP * k, Pb(Lr + B["rosca"]["L"])[0], "LARGO TOTAL 2.130", ext=Pb(Lr + B["rosca"]["L"])[1] - 8)
h.dimV(Pb(Lr + B["rosca"]["L"])[0] + 84, Pb(Lr)[1], YA, f"{B['sube']} (*)", ext=Pb(Lr)[0] + 14, c=OR)
h.dimV(PX - DP * k - 22, YA, YT, f"{B['sep']} (*)", ext=PX - DP * k - 6, c=OR)
h.dimH(470, PX - DP * k, PX, "Ø SE MIDE", ext=462)
h.globo("1", *Pb(500, B["D"] / 2), 200, 165, r=9); h.globo("2", (PX + t1[0]) / 2, (YT + t1[1]) / 2, 260, 420, OR, r=9)
h.globo("3", PX - DP * k - 4, YA, 60, 160, r=9); h.globo("4", PX - DP * k - 4, YT, 60, 400, r=9)
h.globo("5", *Pb(Lr + 80, A["D"] / 2), 380, 150, r=9); h.globo("6", *Pb(Lr + 20, -B["D"] / 2), 420, 290, r=9)
lineaCorte(h, PX - DP * k - 30, YA - 16, PX + 26, YA - 16, "A")

# ======================= 2. D1 · PUNTA: ROSCA Y ACOPLE (corte por el eje, 1:1,5)
h.titulo(470, 370, "D1 · ROSCA Y ACOPLE", "CORTE POR EL EJE · ESC. 1:1 · ACOPLE DESENROSCADO (*)")
e = 1.0; ox, oy = 500, 462; r = B["D"] / 2; ri = r - B["e"]; ra = A["D"] / 2; p = B["rosca"]["paso"]
X = lambda t: ox + t * e
for s in (-1, 1):
    poly(h, [(X(0), oy - s * r * e), (X(70), oy - s * r * e), (X(70), oy - s * ri * e), (X(0), oy - s * ri * e)], "url(#MET)", .9)
    pts = [(X(70), oy - s * ri * e)]
    n = int(B["rosca"]["L"] / p)
    for i in range(n * 2 + 1): pts.append((X(70 + i * p / 2), oy - s * (r - (p * .6 if i % 2 else 0)) * e))
    pts += [(X(70 + B["rosca"]["L"]), oy - s * ri * e)]
    poly(h, pts, "url(#MET)", .8)
    x0 = 70 + B["rosca"]["L"] + 40
    pts = [(X(x0), oy - s * ra * e), (X(x0 + A["L"]), oy - s * ra * e), (X(x0 + A["L"]), oy - s * (ra - 3.6) * e), (X(x0 + B["rosca"]["L"] * .8), oy - s * (ra - 3.6) * e)]
    for i in range(int(B["rosca"]["L"] * .8 / p) * 2, -1, -1): pts.append((X(x0 + i * p / 2), oy - s * (r + .6 - (p * .55 if i % 2 else 0)) * e))
    poly(h, pts, "url(#MET)", .9)
rotura(h, X(0) - 2, X(0) + 2, oy); h.ln(X(-5), oy, X(x0 + A["L"] + 10), oy, K, .4, h.EJE)
h.dimH(oy - ra * e - 16, X(70), X(70 + B["rosca"]["L"]), f"{B['rosca']['L']} (*)", ext=oy - r * e, c=OR)
h.dimH(oy - ra * e - 16, X(x0), X(x0 + A["L"]), str(A["L"]), ext=oy - ra * e)
h.dimV(X(x0 + A["L"]) + 14, oy - ra * e, oy + ra * e, "Ø60,3", ext=X(x0 + A["L"]) + 2)
h.dimV(X(0) - 12, oy - r * e, oy + r * e, "Ø48,3 (*)", ext=X(0) - 2, c=OR)
h.txt(X(40), oy + ra * e + 16, "ROSCA GAS 1 1/2\" · 11 h/\" (*)", 8.5, 400, OR, "middle")
h.txt(X(x0 + A["L"] / 2) + 30, oy + ra * e + 16, "ROSCA INTERIOR", 8.5, 400, G, "middle")

# ======================= 3. CORTE A-A · ABRAZADERA (1:5)
h.titulo(500, 62, "CORTE A-A · ABRAZADERA", "2 MITADES · 2 BULONES Ø12 × 90 (4018) · ESC. 1:5")
cx, cy, e2 = 640, 190, .42; R_ = DP / 2 * e2
h.circ(cx, cy, R_, "url(#HA)", K, 1.3)
for a0, a1 in ((5, 175), (185, 355)):
    pts = [(cx + (R_ + 0) * math.cos(math.radians(t)), cy - (R_ + 0) * math.sin(math.radians(t))) for t in [a0 + (a1 - a0) * i / 30 for i in range(31)]]
    pts += [(cx + (R_ + Ab["e"] * e2 * 1.6) * math.cos(math.radians(t)), cy - (R_ + Ab["e"] * e2 * 1.6) * math.sin(math.radians(t))) for t in [a1 - (a1 - a0) * i / 30 for i in range(31)]]
    hatchPoly(h, pts, "MET", .8)
for s in (-1, 1):
    xo = cx + s * (R_ + 3)
    for yy in (cy - 6, cy + 3): h.rect(min(xo, xo + s * Ab["oreja"] * e2 * 1.4), yy, Ab["oreja"] * e2 * 1.4, 3, "url(#MET)", K, .6)
    bxp = xo + s * Ab["oreja"] * e2 * .8; h.rect(bxp - 2.5, cy - 20, 5, 40, "#fff", K, .7); h.rect(bxp - 6, cy - 26, 12, 6, "#fff", K, .8); h.rect(bxp - 6, cy + 18, 12, 6, "#fff", K, .8)
# montura del brazo apoyada
h.rect(cx + R_ * .5, cy - R_ - 8, 30, 8, "url(#MET)", K, .7)
h.dimH(cy + R_ + 24, cx - R_, cx + R_, "Ø DEL POSTE (SE MIDE)", ext=cy + 8)
h.txt(cx, cy + R_ + 44, "ABRAZADERA POR Ø: 4001 Ø140 · 4002 Ø200 · 4004 Ø220", 8.5, 400, G, "middle")
h.txt(cx, cy + R_ + 56, "4005 Ø240 · 4006 Ø260 · 4007 Ø300 · 4008 Ø340", 8.5, 400, G, "middle")
h.globo("3", cx - R_ - 3, cy - 16, 520, 120, r=9); h.globo("7", cx + R_ + 3 + Ab["oreja"] * e2 * .8, cy - 26, 760, 110, r=9)

# ======================= TABLAS
TY = 548
yc_ = codTabla(h, 40, TY, [4501, 4004, 4005, 4006, 4018, 4016], {4501: "ITEMS 1.28 A 1.34 (CON LED)", 4004: "POSTE Ø220", 4005: "POSTE Ø240", 4006: "POSTE Ø260",
        4018: "2 POR ABRAZADERA (*)", 4016: "EN POSTE DE MADERA"}, wd=170, titulo="CODIGOS DEL PAÑOL (EL BRAZO Y LO QUE LO SUJETA)")
yd = tablaD(h, 40, yc_ + 20, [("DATO", "VALOR"), ("MATERIAL", "HIERRO GALVANIZADO (H°G°)"), ("LARGO TOTAL", "2,13 m (AP-TC-055 HOJA E)"),
        ("CAÑO", "Ø48,3 × 2,9 (PLANO EPEC VIEJO) (*)"), ("ACOPLE", "Ø60 × 150 EN LA PUNTA (*)"), ("TENSOR", "CAÑO 3/4\" AL 55 % (*)"),
        ("FIJ. H°A° / MET.", "2 ABRAZADERAS POR Ø DEL POSTE"), ("FIJ. MADERA", "2 BULONES MN 52 PASANTES (4016)"), ("LUMINARIA", "LED VIAL (6010) EN LA PUNTA")],
        [(110, "l", False), (300, "l", False)], "DATOS TECNICOS", rowh=14)
ry = rayadosRef(h, 470, yc_ + 20, ["MET", "HA", "CU"], cols=1, dx=180)
yu = bloque(h, 470, ry + 8, "DONDE SE USA", ["AP-TC-055 HOJA E: UNIDAD AEREA DE BARRIO,", "APOYO NUEVO CON BRAZO Y LUMINARIA LED.", "LP 21478: ITEMS 1.28 A 1.34.",
            "CALCULADORA (BARRIO): 1 BRAZO POR LUMINARIA.", "GUIA «UNIDAD AEREA DE BARRIO»."], w=370, sz=9.5, lh=12.5)
notasW(h, 40, max(yd, yu) + 20, [
    "COTAS EN mm. SOLO EL LARGO TOTAL 2,13 m ESTA EN LA APP: EL RESTO ES ESQUEMA (*) HASTA TENER LA HOJA E DEL AP-TC-055.",
    "(*) A CONFIRMAR: Ø Y ESPESOR DEL CAÑO (MN 25 Ø38 × 1,8 O Ø48 × 2,9), ROSCA, ACOPLE, SUBIDA, TENSOR Y SEPARACION DE ABRAZADERAS.",
    "LA ABRAZADERA SE ELIGE CON EL Ø MEDIDO DEL POSTE A ESA ALTURA (PERIMETRO ÷ 3,14). 4018 ES PARA Ø260: VERIFICAR LARGO EN OTROS Ø (*)."], w=800, lh=13.5)

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - BRAZO H°G° 2,13 m (4501) EN SU LUGAR", "POSTE H°A° · ABRAZADERAS · TENSOR · ACOPLE ENROSCADO · LUMINARIA LED · ESQUEMA (*)")
A3 = img3d(h, "col_bhg", 895, 95, 740)
columna(h, A3, [("lum", "", "LUMINARIA LED (6010)"), ("acople", "5", "ACOPLE Ø60 × 150 (*)"), ("brazo", "1", "BRAZO H°G° 2,13 m (4501)")], 1330, 110, 220, paso=28)
columna(h, A3, [("abrA", "3", "ABRAZADERA DEL BRAZO"), ("bulon", "7", "BULON Ø12 × 90 (4018)"), ("abrT", "4", "ABRAZADERA DEL TENSOR"), ("tensor", "2", "TENSOR (*)"),
                ("poste", "", "POSTE H°A° (6023 / 6501)")], 1130, 420, 560, paso=28)
h.txt(890, 620, "D: LA PUNTA - ROSCA GAS Y ACOPLE DESENROSCADO (CORTADO A UN CUARTO)", 11, 700, NV, "start", INT)
D3 = img3d(h, "col_bhg_det", 895, 630, 620)
columna(h, D3, [("cano", "1", "CAÑO Ø48,3 × 2,9 (*)"), ("rosca", "6", "ROSCA GAS 1 1/2\" (*)"), ("roscaInt", "", "ROSCA INTERIOR"), ("acople", "5", "ACOPLE Ø60,3 × 150 (*)")], 1440, 650, 900, paso=28)
pie3d(h, "", "RENDER three.js: r3d/escenas/col_bhg.mjs y col_bhg_det.mjs · MISMA GEOMETRIA DEL PLANO · FUENTES: r3d/FUENTES_col.md")
rotuloMat(h, "MAT-BRAZO_HG-1", "BRAZO DE H°G°", "LARGO TOTAL 2,13 m", "ELEVACION, A-A ABRAZADERA, D1 ROSCA, CODIGOS Y 3D", "1:30 / 1:5", "D1 1:1 · 3D S/E", rev="B", fecha="08/11/2026")
guardarCol(h, "mat_brazo_hg_1")
