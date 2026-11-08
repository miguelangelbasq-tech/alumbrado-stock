"""MAT-TERMINALES-1 (rev. B) · Terminal tubular de ojal de Cu estañado, a compresión (2049, 2045, 2046, 2047, 2048, 2043, 2044).
Plano y 3D con los mismos números: r3d/piezas/perfiles_conex.mjs (OJAL). 3D: r3d/out/conex_ojal.png y conex_ojal_bulon.png.
Datos: FICHAS_TEC.terminales (Lapp: L, d, W, palma), Cimco (Øe 8,5), Weidmüller (agujero 10,5). Fuentes: r3d/FUENTES_conex.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conexkit import *

h = nueva3()
O = PC["OJAL"]; L, d, De, W, ep, hole, Lb, tr = O["L"], O["d"], O["De"], O["W"], O["e"], O["hole"], O["Lb"], O["trans"]
re_, ri = De / 2, d / 2
xc = L - W / 2; Wm = W * .62 / 2; xp = Lb + tr

# ================= 1. PLANTA · ESC. 6:1 =================
e = 7.9; v = Vista(h, 104, 200, e)
h.titulo(40, 62, "PLANTA", "MODELO 16 mm² / M10 (2046) · ESC. 8:1")
pl = [[0, re_ - .3], [.3, re_], [Lb, re_], [xp, Wm]]
for i in range(0, 25): a_ = math.pi / 2 - math.pi * i / 24; pl.append([xc + W / 2 * math.cos(a_ - math.pi / 2 + math.pi / 2) if False else xc + W / 2 * math.sin(math.pi * i / 24), W / 2 * math.cos(math.pi * i / 24)])
pl += [[xp, -Wm], [Lb, -re_], [.3, -re_], [0, -(re_ - .3)]]
v.poly(pl, "#fff", 1.5)
v.linea([[Lb, re_], [Lb, -re_]], .6); v.linea([[xp, Wm], [xp, -Wm]], .6)
v.circ(xc, 0, hole / 2, "#fff", 1.2)
v.oculta([[0, ri], [Lb - 1.6, ri], [Lb - 1.2, 0]]); v.oculta([[0, -ri], [Lb - 1.6, -ri], [Lb - 1.2, 0]])
v.eje(-3, 0, L + 3, 0); v.eje(xc, -W / 2 - 2.5, xc, W / 2 + 2.5)
v.cotaH(0, L, -W / 2 - 4.2, "39 (L)", zext=-re_)
v.cotaH(0, Lb, W / 2 + 2.4, "19 (*) BARRIL", zext=re_, c=OR)
v.cotaV(L + 4, -W / 2, W / 2, "16 (W)", yext=xc)
v.cotaV(-3.4, -re_, re_, "Ø8,5", yext=0)
llamada(h, *v.p(xc + 3.7, 3.7), *v.p(L + 5, 12.5), "Ø10,5 PARA M10", sz=9.5)
a_, b_ = v.p(9, re_ + 2.6), v.p(9, -re_ - 2.6); lineaCorte(h, a_[0], a_[1] - 6, b_[0], b_[1] + 6, "B")
for n, (y, z), (gx, gy) in [("1", (5, re_), (64, 130)), ("2", (Lb + 3, 3.4), (300, 102)), ("3", (L - 4, -5.5), (300, 300))]:
    h.globo(n, *v.p(y, z), gx, gy, r=9)
a_, b_ = v.p(-5, 0), v.p(L + 7, 0)

# ================= 2. CORTE A-A (elevación, mitad en corte) · ESC. 6:1 =================
v2 = Vista(h, 104, 448, e)
h.titulo(40, 330, "CORTE A-A", "POR EL EJE · ARRIBA CORTE, ABAJO VISTA · ESC. 8:1")
secRT(v2, [[ri + .5, 0], [re_ - .3, 0], [re_, .3], [re_, Lb], [ep / 2, xp], [ep / 2, xc - hole / 2], [0, xc - hole / 2], [0, Lb - 1.2], [ri, Lb - 1.6], [ri, .5]], "CU", 1.2)
secRT(v2, [[ep / 2, xc + hole / 2], [ep / 2, L], [0, L], [0, xc + hole / 2]], "CU", 1.2)
v2.poly([[0, 0], [0, -(re_ - .3)], [.3, -re_], [Lb, -re_], [xp, -ep / 2], [L, -ep / 2], [L, 0]], "#fff", 1.2)
v2.oculta([[0, -ri], [Lb - 1.6, -ri]]); v2.oculta([[xc - hole / 2, 0], [xc - hole / 2, -ep / 2]]); v2.oculta([[xc + hole / 2, 0], [xc + hole / 2, -ep / 2]])
v2.eje(-3, 0, L + 3, 0)
v2.cotaV(L + 4, -ep / 2, ep / 2, "2,2", yext=L)
v2.cotaV(-3.4, -ri, ri, "Ø5,5 (d)", yext=0)
v2.cotaH(Lb, xp, re_ + 2, "6 (*)", zext=re_, c=OR)
llamada(h, *v2.p(Lb - .8, .6), *v2.p(Lb + 6, -re_ - 3.4), "FONDO CERRADO", sz=9)
llamada(h, *v2.p(.2, -ri - .5), *v2.p(5, -re_ - 5.6), "CHAFLAN DE ENTRADA", sz=9)

# ================= 3. SECCION B-B: ANTES Y DESPUES · ESC. 10:1 =================
h.titulo(452, 62, "SECCION B-B", "BARRIL · 16 mm² CLASE 2 (7 HILOS Ø1,7 (*)) · ESC. 10:1")
k = 10; cx, cy = 548, 196
anillo(h, cx, cy, re_, ri, "CU", k, 1.1); hilos(h, cx, cy, 7, 1.7, ri - .02, k)
h.txt(cx, cy + 62, "ANTES", 10, 700, K, "middle")
h.dimH(cy - re_ * k - 12, cx - re_ * k, cx + re_ * k, "Ø8,5", ext=cy)
cx2 = 768; s_out = O["hexEntre"]; s_in = math.sqrt(16 * 1.05 / (math.sqrt(3) / 2))
def hexp(cx, cy, s, rot=0):
    r = s / math.sqrt(3); return [(cx + r * k * math.cos(math.pi / 3 * i + rot), cy - r * k * math.sin(math.pi / 3 * i + rot)) for i in range(6)]
po, pi_ = hexp(cx2, cy, s_out), hexp(cx2, cy, s_in)
h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in po) + " Z M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pi_) + " Z", "url(#CU)", K, 1.1, 'fill-rule="evenodd"')
pc = hexp(cx2, cy, s_in / 3)
h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pi_) + " Z", "#e9a466", "#6a3510", .5)
h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pc) + " Z", "#eeb27a", "#6a3510", .5)
for (x1, y1), (x2, y2) in zip(pc, pi_): h.ln(x1, y1, x2, y2, "#6a3510", .5)
h.txt(cx2, cy + 62, "DESPUES (HEXAGONAL)", 10, 700, K, "middle")
h.dimH(cy - s_out / math.sqrt(3) * k - 12, cx2 - s_out / 2 * k, cx2 + s_out / 2 * k, "7,4 (*) E/C", ext=cy, c=OR)
h.path(f"M{cx + 56},{cy} H{cx2 - 56}", "none", K, 1.2); h.path(f"M{cx2 - 64},{cy - 5} L{cx2 - 54},{cy} L{cx2 - 64},{cy + 5}", "none", K, 1.2)
h.txt((cx + cx2) / 2, cy - 8, "MATRIZ 16 mm²", 9.5, 700, K, "middle"); h.txt((cx + cx2) / 2, cy + 16, "HEXAGONAL", 9.5, 400, K, "middle")
h.txt(452, cy + 84, "LOS 7 HILOS SE DEFORMAN Y LLENAN EL HUECO: UNION SIN AIRE, NO SE AFLOJA.", 9.5, 400, G)

# ================= 4. D1 · ENGARCE (vista lateral) · ESC. 4:1 =================
h.titulo(470, 330, "D1 - DOS PASADAS DE MATRIZ", "VISTA · ESC. 6:1 · DE LA PALMA HACIA LA BOCA")
e4 = 6.2; v4 = Vista(h, 572, 418, e4)
h0 = 3.5; zonas = [(0, h0, re_), (h0, h0 + O["hexL"], O["hexEntre"] / 2), (h0 + O["hexL"], h0 + O["hexL"] + 1.5, re_ - .4), (h0 + O["hexL"] + 1.5, h0 + 2 * O["hexL"] + 1.5, O["hexEntre"] / 2), (h0 + 2 * O["hexL"] + 1.5, Lb, re_)]
for a, b, r in zonas: v4.rect(a, b, -r, r, "#fff", 1.1)
for a, b, r in zonas:
    if r == O["hexEntre"] / 2: v4.linea([[a, r * .5], [b, r * .5]], .5); v4.linea([[a, -r * .5], [b, -r * .5]], .5)
v4.poly([[Lb, re_], [xp, Wm], [L - W / 2, Wm], [L - W / 2, -Wm], [xp, -Wm], [Lb, -re_]], "#fff", 1.1)
v4.rect(-14, 0, -3.65, 3.65, "url(#PLAS2)", 1.0)
v4.eje(-16, 0, L - 4, 0)
v4.cotaH(h0, h0 + O["hexL"], re_ + 2.4, "7 (*)", zext=re_, c=OR)
v4.cotaH(h0 + O["hexL"] + 1.5, h0 + 2 * O["hexL"] + 1.5, re_ + 2.4, "7 (*)", zext=re_, c=OR)
h.txt(470, 476, "1.º PASADA CERCA DE LA PALMA, 2.º HACIA LA BOCA. LA MATRIZ", 9, 400, K)
h.txt(470, 489, "LLEVA EL NUMERO DE LA SECCION (16): QUEDA GRABADO (*).", 9, 400, OR)

# ================= TABLAS =================
TY = 512
fil = [["SECCION / AGUJERO", "L", "d (Ø INT.)", "W", "PALMA"]] + [[r[0], f"{r[1]:g}", f"{r[2]:g}".replace(".", ","), f"{r[3]:g}", f"{r[4]:g}".replace(".", ",")] for r in PC["OJAL_TABLA"]]
yt = h.tabla(40, TY, [(140, "l", False), (50, "c", True), (78, "c", True), (50, "c", True), (66, "c", True)], fil, rowh=14,
             titulo="MEDIDAS (LAPP, IEC 61238-1 · FICHA DE LA APP)", colores=lambda i, j, t: NV if i == 4 else K)
h.txt(40, yt + 13, "EN AZUL: 16 mm² / M10, EL DIBUJADO.", 9.5, 400, NV)
SEC = {2049: "6 mm² (*)", 2045: "10 mm²", 2046: "16 · 3/8\" ACOMETIDA", 2047: "25 mm²", 2048: "50 mm²", 2043: "10 mm² · ACC (*)", 2044: "25 · 3/8\" · ACC (*)"}
fc = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "SECCION / USO"]]
for c in [2049, 2045, 2046, 2047, 2048, 2043, 2044]:
    r = cat(c, 33); fc.append([r[0], r[1], r[2], SEC[c]])
yc_ = h.tabla(440, TY, [(44, "c", True), (240, "l", False), (30, "c", False), (106, "l", False)], fc, rowh=14, titulo="CODIGOS DEL PAÑOL (7)", colores=colorOR)
yr = rayados3(h, 440, yc_ + 22, ["CU", "HIL", "PLAS2"], cols=2, dx=200)
bloque(h, 40, yt + 40, "DATOS TECNICOS", [
    "TUBO DE COBRE ELECTROLITICO ESTAÑADO, PALMA APLASTADA Y PERFORADA.",
    "SE ELIGE POR LA SECCION DEL CABLE Y EL Ø DEL BULON (M8 / M10 / M12).",
    "COMPRESION CON MATRIZ HEXAGONAL DE LA SECCION; NUNCA CON MARTILLO.",
    "PELAR EL LARGO DEL BARRIL: EL CABLE LLEGA AL FONDO, SIN COBRE A LA VISTA."], w=380, sz=10, lh=13.5)
bloque(h, 440, yr + 16, "DONDE SE USA", [
    "ACOMETIDA Cu 4 x 16 AL SECCIONADOR NH: OJAL 2046 (3/8\"), UNO POR CONDUCTOR.",
    "TABLERO: 5 POR TABLERO (PLANILLA EMA). PAT: CABLE AL BORNE O BULON."], w=400, sz=10, lh=13.5)
notasW(h, 40, 850, [
    "COTAS EN mm. L, d, W Y PALMA: TABLA DE LA FICHA DE LA APP (LAPP). Ø EXTERIOR 8,5: CIMCO 16 mm² (DIN 46235). AGUJERO 10,5 PARA M10: WEIDMULLER.",
    "(*) LARGO DEL BARRIL, TRANSICION, ENTRE CARAS DE LA MATRIZ Y CANTIDAD DE PASADAS: PROPORCIONALES, A CONFIRMAR CON EL FABRICANTE Y LA PINZA.",
    "(*) 6 mm² (2049) Y «ACC 10/3» / «ACC 25/3 3/8» (2043 / 2044): LA FICHA NO TRAE SUS MEDIDAS NI QUE ES «ACC».",
    "(*) EL TERMOCONTRAIBLE 2057 (5,0 / 2,5 mm) NO ENTRA EN UN CABLE DE 16 mm² (Ø ≈ 7,3): LA CALCULADORA LO PIDE PARA LOS OJALES DE LA ACOMETIDA. REVISAR.",
    "PAT: BULON RW 1/2\" CON OJAL 5/16\" NO ENTRA (REVISION DE TIPOS CONSTRUCTIVOS, PUNTO 11): ELEGIR EL AGUJERO POR EL BULON."], w=800, lh=13.5)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - OJAL 16 mm² / M10 DE Cu ESTAÑADO", "ADELANTE: ENGARZADO EN EL CABLE, CORTADO A CUARTO · ATRAS: NUEVO, SE VE EL BARRIL")
A = img3d(h, "conex_ojal", 880, 84, 610)
columna(h, A, [("nuevo", "1", "BARRIL (TUBO Cu ESTAÑADO)"), ("boca", "", "CHAFLAN DE ENTRADA"), ("palma", "2", "PALMA APLASTADA"), ("agujero", "3", "AGUJERO Ø10,5 (M10)"),
               ("transicion", "", "TRANSICION (*)"), ("hex", "", "ENGARCE HEXAGONAL (*)"), ("cable", "", "CABLE 16 mm² (L1)"), ("hilos", "", "7 HILOS EN EL BARRIL"), ("barril", "", "BARRIL CORTADO")], 1476, 104, 490, paso=25)
h.titulo(890, 520, "COMO VA: ABULONADO", "PLANCHUELA · OJAL · ARANDELA PLANA · GROWER · TUERCA M10")
A2 = img3d(h, "conex_ojal_bulon", 880, 540, 560)
columna(h, A2, [("bulon", "", "BULON M10"), ("tuerca", "", "TUERCA"), ("grower", "", "ARANDELA GROWER"), ("arandela", "", "ARANDELA PLANA"),
                ("ojal", "", "OJAL 2046"), ("planchuela", "", "PLANCHUELA / BARRA"), ("cable", "", "CABLE 16 mm²")], 1460, 560, 860, paso=28)
h.txt(890, 1000, "Planchuela, bulón y arandelas: ilustrativos (*), ver la barra y el seccionador de cada tablero.", 10, 400, OR, "start", INT)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/conex_ojal*.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES_conex.md", 9.5, 400, G, "start", INT)
rotuloB(h, "MAT-TERMINALES-1", "TERMINAL DE OJAL", "Cu ESTAÑADO A COMPRESION", "PLANTA, CORTE A-A, SECCION B-B, D1 Y 3D", "8:1 · 10:1", "INDICADAS · 3D S/E")
guardar(h, "mat_terminales_1")
