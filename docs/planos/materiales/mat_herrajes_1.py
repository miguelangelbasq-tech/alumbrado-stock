"""MAT-HERRAJES-1 (rev. C) · rev. C (grupo «nobra»): altas del equipo 4050 lisa Ø200, 4049 lisa Ø280 y 4047 2 escotes Ø240 (respaldo/nuevos.csv).
 · Abrazaderas H°G° de planchuela 4,76 × 31,7: lisas Ø220–340 (4004–4008), con 1 escote Ø140 (4001) y 2 escotes Ø200 (4002).
Geometría: r3d/piezas/perfiles_pat.mjs (ABR, BUL) y pat.mjs abrazadera(); 3D: r3d/out/pat_her1a.png, pat_her1b.png. Fuentes: r3d/FUENTES_pat.md"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *

A = PP["ABR"]; W = PP["BUL"]["w12"]; Bu = PP["BUL"]
h = hojaP()

# ================= PLANTA (1:1,6) =================
h.titulo(40, 62, "PLANTA - ABRAZADERA CON 2 ESCOTES Ø200 (4002)", "ESC. 1:1 · 2 MEDIAS DE PLANCHUELA 4,76 × 31,7 Y 2 BULONES 1/2\"")
e = 1.0; ox, oy = 280, 300; X = lambda x: ox + x * e; Y = lambda y: oy - y * e
D = 200; R0 = D / 2; ee = A["e"]; luz = A["luz"] / 2; ore = A["oreja"]
for s in (1, -1):
    th0 = math.asin(luz / R0); xA = R0 * math.cos(th0); th1 = math.asin((luz + ee) / (R0 + ee))
    inn = [(-(xA + ore), s * luz)] + [(R0 * math.cos(math.pi - th0 - (math.pi - 2 * th0) * i / 64), s * R0 * math.sin(math.pi - th0 - (math.pi - 2 * th0) * i / 64)) for i in range(65)] + [(xA + ore, s * luz)]
    out = [(-(xA + ore), s * (luz + ee))] + [((R0 + ee) * math.cos(math.pi - th1 - (math.pi - 2 * th1) * i / 64), s * (R0 + ee) * math.sin(math.pi - th1 - (math.pi - 2 * th1) * i / 64)) for i in range(65)] + [(xA + ore, s * (luz + ee))]
    h.path("M" + " L".join(f"{X(u):.1f},{Y(v):.1f}" for u, v in inn + out[::-1]) + " Z", "url(#ACE)", K, 1.3)
    # escote (lengüeta radial) en el medio de cada media, con agujero Ø14
    yb = s * (R0 + ee)
    h.rect(X(-A["a"] / 2), min(Y(yb), Y(yb + s * A["escote"]["h"])), A["a"] * e, A["escote"]["h"] * e, "#fff", K, 1.2)
    h.circ(X(0), Y(yb + s * A["escote"]["h"] * .6), A["agujero"] / 2 * e, "#fff", K, 1)
# bulones en las orejas (vista: cabeza arriba, tuerca abajo)
for sx in (-1, 1):
    xo = sx * (R0 * math.cos(math.asin(luz / R0)) + ore / 2 + ee / 2)
    h.rect(X(xo - W["d"] / 2), Y(luz + ee + 0), W["d"] * e, (2 * luz + 2 * ee) * e, "#fff", K, .8)
    h.rect(X(xo - W["af"] / 2), Y(luz + ee + W["k"]), W["af"] * e, W["k"] * e, "#fff", K, 1.1)
    h.rect(X(xo - Bu["plana"]["de"] / 2), Y(-luz - ee), Bu["plana"]["de"] * e, Bu["plana"]["e"] * e, "url(#HG)", K, .8)
    h.rect(X(xo - W["af"] / 2), Y(-luz - ee - Bu["plana"]["e"] - Bu["presion"]["e"]), W["af"] * e, W["tuerca"] * e, "#fff", K, 1.1)
ejeH(h, X(-R0 - 70), X(R0 + 70), oy); ejeV(h, X(0), Y(R0 + 60), Y(-R0 - 60))
h.circ(X(0), Y(0), R0 * e, "none", K, .45, 'stroke-dasharray="6 3"'); h.txt(X(0), Y(R0 * .45), "POSTE", 9.5, 700, G, "middle")
h.dimH(Y(-R0 * .45), X(-R0 * .89), X(R0 * .89), "", ext=None); h.txt(X(0), Y(-R0 * .45) - 6, "Ø200 INTERIOR (EL CODIGO)", 9.5, 700, K, "middle")
h.dimH(Y(R0 + ee + A["escote"]["h"]) - 14, X(-A["a"] / 2), X(A["a"] / 2), "31,7", ext=Y(R0 + ee + A["escote"]["h"]))
h.dimV(X(A["a"] / 2) + 22, Y(R0 + ee + A["escote"]["h"]), Y(R0 + ee), "40 (*)", ext=X(A["a"] / 2), c=OR)
xr = R0 * math.cos(math.asin(luz / R0))
h.dimH(Y(-R0) - 18 + 30, X(xr), X(xr + ore), "40 (*)", ext=Y(-luz), c=OR)
h.dimV(X(R0 + ore + 30), Y(luz + ee), Y(-luz - ee), "", ext=X(xr + ore))
h.txt(X(R0 + ore + 40), Y(0) + 4, "LUZ 8 + 2 × 4,76 (*)", 9.5, 400, OR)
for n, (u, v), (gx, gy) in [("1", (-R0 * .7, R0 * .7 + 2), (-R0 - 30, R0 + 20)), ("2", (0, R0 + ee + 30), (60, R0 + 70)), ("3", (xr + ore / 2 + 2, luz + ee + W["k"] / 2), (R0 + 70, luz + 60)),
                            ("4", (-(xr + ore / 2), -luz - ee - 6), (-R0 - 50, -luz - 50))]:
    h.globo(n, X(u), Y(v), X(gx), Y(gy), r=8)
lineaCorte(h, X(-R0 * math.cos(.6)) - 26 * math.cos(.6), Y(R0 * math.sin(.6)) , X(-R0 * math.cos(.6)) + 10, Y(R0 * math.sin(.6)) - 10, "A") if False else None

# ================= CORTE DE LA PLANCHUELA + GALVANIZADO =================
h.titulo(560, 62, "CORTE A-A DE LA PLANCHUELA", "ESC. 5:1 · ACERO (*) GALVANIZADO EN CALIENTE")
e2 = 5.0; px, py = 600, 120
h.rect(px, py, A["e"] * e2, A["a"] * e2, "url(#ACE)", K, 1.4)
h.rect(px - 1.6, py - 1.6, A["e"] * e2 + 3.2, A["a"] * e2 + 3.2, "none", K, .9)
h.dimV(px - 18, py, py + A["a"] * e2, "31,7 (1 1/4\")", ext=px)
h.dimH(py + A["a"] * e2 + 20, px, px + A["e"] * e2, "4,76 (3/16\")", ext=py + A["a"] * e2)
h.circ(px + A["e"] * e2, py + 20, 10, "none", K, .6, 'stroke-dasharray="3 2"'); h.txt(px + A["e"] * e2 + 12, py + 12, "D1", 10, 700)
# D1 capa de zinc (esquema 400:1)
dx, dy = 680, 110
h.rect(dx, dy, 120, 70 * .4, "url(#ZN)", K, 1.0); h.rect(dx, dy + 28, 120, 50, "url(#ACE)", K, 1.0)
h.dimV(dx + 136, dy, dy + 28, "≥ 70 µm", ext=dx + 120)
h.txt(dx, dy - 8, "D1 (ESQUEMA): CAPA DE ZINC", 9.5, 700)
h.txt(dx, dy + 96, "ISO 1461: ACERO 3–6 mm ≥ 70 µm", 9.5); h.txt(dx, dy + 109, "(> 6 mm: 85 µm · ROSCAS: 50 µm)", 9.5)
h.txt(560, 350, "EL GALVANIZADO SE HACE DESPUES DE CORTAR,", 9.5); h.txt(560, 363, "DOBLAR Y AGUJEREAR: NO SE AGUJEREA EN OBRA.", 9.5, 700)
h.txt(560, 376, "SI SE RAYA, PINTURA RICA EN ZINC (*).", 9.5, 400, OR)

# ================= TABLA DE DIAMETROS =================
yT = tablaC(h, 40, 470, [(52, "c", True), (240, "l", False), (90, "c", True), (120, "c", True), (150, "l", False)],
            [("CODIGO", "TIPO", "Ø INTERIOR", "REF. FABRICANTE", "USO"), ("4050", "LISA ▪", "200", "405200 (*)", "POSTE / APOYO"), ("4004", "LISA", "220", "405220", "POSTE / APOYO"), ("4005", "LISA", "240", "405240", "POSTE / APOYO"),
             ("4006", "LISA", "260", "405260", "CON BULON 4018"), ("4049", "LISA ▪", "280", "405280 (*)", "POSTE / APOYO"), ("4007", "LISA", "300", "405300", "POSTE / APOYO"), ("4008", "LISA", "340", "405340", "POSTE / APOYO"),
             ("4001", "1 ESCOTE (ARRIBA)", "140", "406140", "PERNO DEL RACK"), ("4002", "2 ESCOTES (ARRIBA Y ABAJO)", "200", "407200", "2 PERNOS OPUESTOS"),
             ("4047", "2 ESCOTES (ARRIBA Y ABAJO) ▪", "240", "407240 (*)", "2 PERNOS OPUESTOS")], "DIAMETROS DEL PAÑOL (FICHA DE LA APP · ▪ ALTA DEL EQUIPO, VER TABLA ABAJO)", rowh=15)
yD = bloque(h, 40, yT + 18, "DATOS TECNICOS", [
    "PLANCHUELA 4,76 × 31,7 mm CINCADA · AGUJEROS Ø14 (OREJAS Y ESCOTE) · CIERRE CON 2 BULONES 1/2\" + ARANDELA PLANA + PRESION + TUERCA (MAT-HERRAJES-3).",
    "SE PIDE POR EL Ø DEL POSTE EN EL PUNTO DONDE VA: EL POSTE ES CONICO (≈ 15 mm POR METRO (*)). MEDIR ANTES DE PEDIR.",
    "Ø QUE SE CONSIGUEN (LISA): 60 · 120 · 140 · 150 · 160 · 180 · 200 · 220 · 230 · 240 · 250 · 260 · 270 · 280 · 300 … 550. CON ESCOTE: 60–550 (1) · 140–550 (2)."], w=800, sz=10, lh=13.5)
yU = bloque(h, 40, yD + 4, "DONDE SE USA", [
    "AP-T-012: SUJECION DEL TABLERO AEREO AL APOYO · AP-T-018: APOYO PRFV · AP-PL-003: CAJA ESTANCA EXTERNA.",
    "AP-TC-055: BRAZO H°G° DE BARRIO, 2 ABRAZADERAS POR Ø DEL POSTE. EL ESCOTE TOMA EL PERNO DEL RACK (MAT-HERRAJES-2)."], w=800, sz=10, lh=13.5)
yN = notasW(h, 40, yU + 4, [
    "COTAS EN mm. MANDA LA COTA. LA PLANTA ES LA DE 2 ESCOTES Ø200; LAS LISAS SON IGUALES SIN LENGÜETA.",
    "(*) LARGO DE LAS OREJAS (40), LUZ ENTRE OREJAS (8), ALTO DEL ESCOTE (40) Y CALIDAD DEL ACERO: NO ESTAN EN LA FICHA. A CONFIRMAR CON EL FABRICANTE.",
    "(*) LA FICHA DICE «ESCOTE (PUNTA) CON AGUJERO Ø14»: SE DIBUJA COMO LENGÜETA PLANA DOBLADA A 90° (FORMA A CONFIRMAR).",
    "FUENTES: CATALOGO DE ABRAZADERAS HP ELECTRICIDAD (RIO CUARTO), REF. 405xxx / 406xxx / 407xxx; ISO 1461; r3d/FUENTES_pat.md.",
    "REV. C: ▪ ALTAS DEL EQUIPO 4047, 4049 Y 4050 (TABLA «ALTAS DEL EQUIPO», DESCRIPCION Y UNIDAD TAL CUAL EL PAÑOL). MISMA FORMA QUE LA PLANTA.",
    "(*) REF. 405200 / 405280 / 407240: SE ARMA CON LA REGLA DEL CATALOGO HP (TIPO + Ø); CONFIRMAR CON EL PROVEEDOR. LA UNIDAD DE 4050 VIENE «UN» Y LAS OTRAS «Un.» (MISMA UNIDAD)."], w=800, lh=14)
tablaC(h, 40, yN + 6, [(52, "c", True), (628, "l", False), (60, "c", False)],
       [("CODIGO", "DESCRIPCION DEL PAÑOL (TAL CUAL, respaldo/nuevos.csv)", "UN."), ("4047", "Abrazadera con 2 escotes H°G° Ø240 mm", "Un."),
        ("4049", "Abrazadera lisa H°G° Ø280 mm", "Un."), ("4050", "Abrazadera lisa H°G° Ø200 mm", "UN")], "▪ ALTAS DEL EQUIPO", rowh=15)
rayadosC(h, 40, 1104, ["ACE", "ZN", "HG"], cols=3, dx=200)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - LISA Ø220, 1 ESCOTE Ø140, 2 ESCOTES Ø200", "HIERRO GALVANIZADO EN CALIENTE, CERRADAS CON SUS BULONES 1/2\"")
Aa = img3d(h, "pat_her1a", 870, 96, 560)
columna(h, Aa, [("esc2", "2", "ESCOTE CON AGUJERO Ø14"), ("esc1", "", "1 ESCOTE Ø140 (4001)"), ("esc2b", "", "2 ESCOTES Ø200 (4002)"), ("lisa", "1", "LISA Ø220 (4004)"),
                ("bulon", "3", "BULON 1/2\" EN LA OREJA"), ("tuerca", "4", "PLANA + PRESION + TUERCA"), ("oreja", "", "OREJA"), ("planchuela", "", "PLANCHUELA 4,76 × 31,7")], 1440, 120, 520, paso=36)
h.txt(890, 570, "EN SU LUGAR - SOBRE EL POSTE DE H°A° (SE ELIGE POR EL Ø EN ESA ALTURA)", 11, 700, NV, "start", INT)
Ab = img3d(h, "pat_her1b", 880, 576, 500)
columna(h, Ab, [("poste", "", "POSTE H°A° (MEDIR EL Ø)"), ("bulon", "3", "BULON 1/2\""), ("escote", "", "OREJAS CERRADAS"), ("abrazadera", "1", "ABRAZADERA LISA"), ("tuerca", "4", "TUERCA")], 1400, 640, 990, paso=40)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/pat_her1a.mjs, pat_her1b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_pat.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-HERRAJES-1", "ABRAZADERAS H°G°", "LISAS Y CON ESCOTE", "PLANTA, CORTE, D1 GALVANIZADO, TABLA Y 3D", "1:1 / 5:1", "D1 S/E · 3D S/E", rev="C", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_herrajes_1.svg"))
