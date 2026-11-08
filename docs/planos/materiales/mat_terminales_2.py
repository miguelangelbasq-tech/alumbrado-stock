"""MAT-TERMINALES-2 (rev. B) · Punteras aisladas TIF (DIN 46228-4): simples 1,5 a 10 mm², dobles, pinza.
Plano y 3D con los mismos números: r3d/piezas/perfiles_conex.mjs (TIF, collarTIF, engarceTIF). 3D: r3d/out/conex_tif_corte.png y conex_tif_fila.png.
Datos: FICHAS_TEC.terminales (tabla L / caña / Ø int.), catálogo del pañol, Weidmüller / Interpower (Ø del collar). Fuentes: r3d/FUENTES_conex.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conexkit import *

h = nueva3()
T = PC["TIF"]; P6 = T[3]; C6 = P6["collar"]; Lc = C6["Lc"]
ro, ri = P6["di"] / 2 + P6["t"], P6["di"] / 2
R2 = P6["D2"] / 2
EG = P6["engarce"]; a = EG["lado"]

# ================= 1. CORTE A-A · PUNTERA 6 mm² NUEVA (mitad en corte, mitad en vista) · ESC. 12:1 =================
e = 15; v = Vista(h, 84, 214, e)
h.titulo(40, 62, "CORTE A-A", "PUNTERA 6 mm² (2032) NUEVA · ESC. 15:1 · ARRIBA CORTE, ABAJO VISTA")
secRT(v, C6["perfil"], "PP", 1.1)                                                     # collar (arriba, en corte)
secRT(v, [[ri, Lc - 1.6], [ro, Lc - 1.6], [ro, P6["L"] - .1], [ro - .08, P6["L"]], [ri, P6["L"]]], "CU", 1.0)   # tubo
# mitad de abajo: vista
v.poly([[0, 0], [0, -(R2 - .15)], [.2, -R2], [Lc * .62, -R2], [Lc - .25, -(ro + .35)], [Lc + .6, -(ro + .35)], [Lc + .6, 0]], "#fff", 1.1)
v.poly([[Lc + .6, 0], [Lc + .6, -ro], [P6["L"] - .1, -ro], [P6["L"], -ro + .08], [P6["L"], 0]], "#fff", 1.1)
v.linea([[Lc * .62, -R2], [Lc * .62, 0]], .4)
v.oculta([[Lc - 1.6, -ri], [P6["L"], -ri]]); v.oculta([[.35, -C6["perfil"][0][0]], [Lc * .55, -2.38], [Lc - .2, -ri]])
v.eje(-2.5, 0, P6["L"] + 2.5, 0)
v.cotaH(0, P6["L"], -R2 - 2.2, "20 (L)", zext=-R2)
v.cotaH(Lc, P6["L"], R2 + 1.6, "12 (CAÑA = PELADO)", zext=ro + .2)
v.cotaH(0, Lc, R2 + 1.6, "8", zext=R2)
v.cotaV(P6["L"] + 2.6, -ri, ri, "Ø3,6", yext=P6["L"])
v.cotaV(-1.6, -R2, R2, "Ø6 (*)", yext=0, c=OR)
llamada(h, *v.p(14, ro - .1), *v.p(16, R2 + 4.2), "PARED 0,25 (*)", OR, sz=9)
llamada(h, *v.p(4.2, 2.6), *v.p(5, R2 + 4.2), "EMBUDO DE ENTRADA", sz=9)
for n, (y, z), (gx, gy) in [("1", (2.2, 2.9), (110, 112)), ("2", (17, 1.95), (380, 112))]:
    h.globo(n, *v.p(y, z), gx, gy, r=9)

# ================= 2. CORTE C-C · PUESTA EN EL CABLE Y ENGARZADA · ESC. 8:1 =================
e2 = 10.5; w = Vista(h, 594, 214, e2)
h.titulo(452, 62, "CORTE C-C", "PUESTA EN EL CABLE (6 mm², CLASE 5) Y ENGARZADA · ESC. 10:1")
rI, rB = 4.95 / 2, 1.6
X0 = -11
w.rect(X0, .6, rB, rI, "url(#PLAS2)", .9)                                               # aislación
w.rect(X0, .6, -rI, -rB, "#fff", .9)
secRT(w, C6["perfil"], "PP", 1.0)
xc0, xc1 = Lc + .9, P6["L"] - .25
secRT(w, [[ri, Lc - 1.6], [ro, Lc - 1.6], [ro, xc0], [a / 2, xc0 + .8], [a / 2, xc1], [a / 2 - P6["t"], xc1], [a / 2 - P6["t"], xc0 + .8], [ri, xc0]], "CU", 1.0)
w.poly([[X0, 0], [X0, rB], [.6, rB], [Lc - 1.6, ri - .03], [xc0, ri - .03], [xc0 + .8, a / 2 - P6["t"]], [xc1, a / 2 - P6["t"]], [xc1, 0]], "url(#HIL)", .5)
for k in range(1, 6): w.linea([[X0, rB * k / 6], [.6, rB * k / 6], [Lc - 1.6, (ri - .03) * k / 6], [xc0, (ri - .03) * k / 6], [xc0 + .8, (a / 2 - P6["t"]) * k / 6], [xc1, (a / 2 - P6["t"]) * k / 6]], .25, "#7a4512")
# vista abajo
w.poly([[0, 0], [0, -(R2 - .15)], [.2, -R2], [Lc * .62, -R2], [Lc - .25, -(ro + .35)], [Lc + .6, -(ro + .35)], [Lc + .6, 0]], "#fff", 1.0)
w.poly([[Lc + .6, 0], [Lc + .6, -ro], [xc0, -ro], [xc0 + .8, -a / 2], [xc1, -a / 2], [xc1, 0]], "#fff", 1.0)
for z in (-a / 2 + .35,): w.linea([[xc0 + .8, z], [xc1, z]], .5)
w.eje(X0 - 1.5, 0, P6["L"] + 2, 0)
w.cotaH(xc0 + .8, xc1, R2 + 1.8, "ENGARCE 10 (*)", zext=a / 2 + .2, c=OR)
w.cotaV(xc1 + 2.4, -a / 2, a / 2, "□ 3,1 (*)", yext=xc1, c=OR)
a_, b_ = w.p(11.4, 3.6), w.p(11.4, -3.6); lineaCorte(h, a_[0], a_[1] - 8, b_[0], b_[1] + 8, "B", lado=1)
for n, (y, z), (gx, gy) in [("4", (-6, 2.2), (470, 112)), ("3", (-4, .9), (470, 140)), ("1", (3, 2.7), (600, 106)), ("2", (17, a / 2 - .1), (720, 118))]:
    h.globo(n, *w.p(y, z), gx, gy, r=9)

# ================= 3. SECCION B-B: ANTES Y DESPUES DEL ENGARCE · ESC. 20:1 =================
h.titulo(40, 336, "SECCION B-B", "POR LA CAÑA · ESC. 20:1 · 84 HILOS DE Ø0,3 (*)")
k = 20
cx, cy = 116, 438
anillo(h, cx, cy, ro, ri, "CU", k, 1.0); hilos(h, cx, cy, 84, .3, ri - .03, k)
h.txt(cx, cy + 64, "ANTES (PUESTA)", 10, 700, K, "middle")
h.dimH(cy - ro * k - 12, cx - ro * k, cx + ro * k, "Ø4,1", ext=cy)
cx2 = 290
h.path(rectRed(cx2, cy, a, a, .35, k) + " " + rectRed(cx2, cy, a - 2 * P6["t"], a - 2 * P6["t"], .2, k), "url(#CU)", K, 1.0, 'fill-rule="evenodd"')
hilosComp(h, cx2, cy, 84, a - 2 * P6["t"], k)
h.txt(cx2, cy + 64, "DESPUES (ENGARZADA)", 10, 700, K, "middle")
h.dimH(cy - a / 2 * k - 12, cx2 - a / 2 * k, cx2 + a / 2 * k, "3,1 (*)", ext=cy - a / 2 * k, c=OR)
h.path(f"M{cx + 52},{cy} H{cx2 - 52}", "none", K, 1.2); h.path(f"M{cx2 - 60},{cy - 5} L{cx2 - 50},{cy} L{cx2 - 60},{cy + 5}", "none", K, 1.2)
h.txt((cx + cx2) / 2, cy - 7, "PINZA 2022", 9, 700, K, "middle"); h.txt((cx + cx2) / 2, cy + 14, "CON CRIQUET", 9, 400, K, "middle")
h.txt(40, cy + 84, "LOS HILOS QUEDAN COMPACTADOS: NO SE SUELTAN NI LOS CORTA EL TORNILLO.", 9.5, 400, G)

# ================= 4. D1 · PUNTERA DOBLE 2 x 1,5 · ESC. 14:1 =================
D = PC["TIFD"]; k2 = 13; dx, dy = 520, 438
h.titulo(452, 336, "D1 - DOBLE 2 x 1,5", "2033 / 2058 · CAÑA · ESC. 13:1")
W_, H_ = D["ancho"], D["alto"]
h.path(rectRed(dx, dy, W_, H_, H_ / 2, k2) + " " + rectRed(dx, dy, W_ - 2 * D["t"], H_ - 2 * D["t"], H_ / 2 - D["t"], k2), "url(#CU)", K, 1.0, 'fill-rule="evenodd"')
for s in (-1, 1): hilos(h, dx + s * (W_ / 4 - .05) * k2, dy, 30, .25, (H_ - 2 * D["t"]) / 2 - .02, k2)
h.path(rectRed(dx, dy, D["D2"][0], D["D2"][1], D["D2"][1] / 2, k2), "none", K, .7, h.OCULTA)
h.dimH(dy - D["D2"][1] / 2 * k2 - 12, dx - W_ / 2 * k2, dx + W_ / 2 * k2, "5,6 (*)", ext=dy - H_ / 2 * k2, c=OR)
h.dimV(dx + D["D2"][0] / 2 * k2 + 14, dy - H_ / 2 * k2, dy + H_ / 2 * k2, "3,2 (*)", ext=dx + W_ / 2 * k2, c=OR)
llamada(h, dx - 30, dy + 34, dx + 60, dy + 64, "COLLAR OVAL (EN VISTA)", sz=9)
h.txt(452, dy + 84, "DOS CABLES EN UNA CAÑA (SIGUE A LA OTRA COLUMNA).", 9.5, 400, G)
# pinza
h.titulo(690, 336, "PINZA 2022", "LY-16WF · CRIQUET · 6-16 mm²")
for i, t in enumerate(["NO ABRE HASTA COMPLETAR", "EL APRIETE (CRIQUET).", "FORMA DEL ENGARCE: (*)", "1,5 A 4 mm²: PINZA (*)"]):
    h.txt(690, 380 + i * 15, t, 9.5, 400, OR if "(*)" in t else K)

# ================= 5. D2 · LAS CINCO MEDIDAS (vista, con el color del collar) =================
h.titulo(40, 556, "D2 - LAS CINCO MEDIDAS", "VISTA A ESC. 4:1 · COLLAR CON EL COLOR DIN 46228-4")
e5 = 4.2
for i, p in enumerate(T):
    x0, yc = 52 + i * 160, 600
    c_ = p["collar"]; lc = c_["Lc"]; r2 = p["D2"] / 2; r_o = p["di"] / 2 + p["t"]
    pts = [[0, r2 - .15], [.2, r2], [lc * .62, r2], [lc - .25, r_o + .35], [lc + .6, r_o + .35], [lc + .6, -(r_o + .35)], [lc - .25, -(r_o + .35)], [lc * .62, -r2], [.2, -r2], [0, -(r2 - .15)]]
    h.path("M" + " L".join(f"{x0 + y * e5:.1f},{yc - z * e5:.1f}" for y, z in pts) + " Z", p["din"], K, .8)
    h.rect(x0 + (lc + .6) * e5, yc - r_o * e5, (p["L"] - lc - .6) * e5, 2 * r_o * e5, "url(#CU)", K, .8)
    h.txt(x0, yc + 26, f"{p['s']} mm² · {p['cod']}", 10, 700)
    h.txt(x0, yc + 39, f"L {p['L']:g} · CAÑA {p['L2']:g} · Ø {p['di']:g}".replace(".", ","), 9, 400, G)
    h.txt(x0, yc + 51, f"DIN: {p['dinN']} · FICHA: {p['frN']}", 9, 400, OR if p["dinN"] != p["frN"] else K)

# ================= TABLAS =================
TY = 680
fil = [["SECCION", "CODIGO", "L", "CAÑA", "Ø INT.", "Ø COLLAR", "COLOR DIN 46228-4", "COLOR FICHA APP"]]
for p in T:
    fil.append([p["s"] + " mm²", str(p["cod"]), f"{p['L']:g}".replace(".", ","), f"{p['L2']:g}", f"{p['di']:g}".replace(".", ","),
                (f"{p['D2']:g}".replace(".", ",") + (" (*)" if p["d2ac"] else "")), p["dinN"], p["frN"] + (" (*)" if p["dinN"] != p["frN"] else "")])
yt = h.tabla(40, TY, [(66, "l", False), (54, "c", True), (44, "c", True), (48, "c", True), (54, "c", True), (78, "c", True), (128, "c", False), (128, "c", False)], fil, rowh=14,
             titulo="MEDIDAS (FICHA DE LA APP) Y COLOR DEL COLLAR", colores=colorOR)
SEC = {2028: "SIMPLE 1,5", 2030: "SIMPLE 2,5", 2031: "SIMPLE 4", 2032: "SIMPLE 6", 2029: "SIMPLE 10", 2037: "SIMPLE 1,5 NEGRA",
       2033: "DOBLE 2 x 1,5", 2034: "DOBLE 2 x 2,5", 2035: "DOBLE 2 x 4", 2036: "DOBLE 2 x 6", 2058: "DOBLE 2 x 1,5 NEGRA (x300)", 2022: "PINZA 6 A 16 mm²"}
fc = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "TIPO"]]
for c in [2028, 2030, 2031, 2032, 2029, 2037, 2033, 2034, 2035, 2036, 2058, 2022]:
    r = cat(c, 50); fc.append([r[0], r[1], r[2], SEC[c]])
yc_ = h.tabla(40, yt + 22, [(46, "c", True), (318, "l", False), (34, "c", False), (166, "l", False)], fc, rowh=13.5, titulo="CODIGOS DEL PAÑOL (12)")
yr = rayados3(h, 640, yt + 22, ["PP", "CU", "HIL", "PLAS2"], cols=1, dx=200)
bloque(h, 640, yr + 18, "DONDE SE USA", ["CADA PUNTA QUE ENTRA A UNA BORNERA.", "CAJA PRFV: 6 TIF 4 (2031) POR COLUMNA (Cu 4 x 4).", "CADA JABALINA: TIF 10 (2029).", "SIGUE EL CALIBRE DEL CABLE, NO EL DE LA BORNERA."], w=200, sz=9.5, lh=12.5)
notasW(h, 40, yc_ + 20, [
    "COTAS EN mm. L, CAÑA Y Ø INT.: TABLA DE LA FICHA DE LA APP (UN FABRICANTE). Ø DEL COLLAR 1,5 / 2,5 / 4: INTERPOWER Y WEIDMULLER H. EL RESTO (*) A CONFIRMAR.",
    "(*) COLORES: LA FICHA DICE «DIN 46228-4» PERO SU TABLA (NEGRO, GRIS, NARANJA, VERDE, MARRON) ES LA SERIE FRANCESA NF C 63-023. EN DIN: 2,5 AZUL, 4 GRIS, 6 AMARILLO, 10 ROJO. CONFIRMAR CUAL HAY EN EL PAÑOL.",
    "(*) PARED DEL TUBO, FORMA Y LARGO DEL ENGARCE, CANTIDAD DE HILOS (CLASE 5) Y MEDIDAS DE LAS DOBLES: PROPORCIONALES, A CONFIRMAR.",
    "SE PELA LO MISMO QUE LA CAÑA; LOS HILOS NO SOBRESALEN MAS DE 0,5 mm. LA PINZA 2022 ES DE 6 A 16 mm²: PARA 1,5 A 4 mm² FALTA LA PINZA (*)."], w=800, lh=13.5)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - PUNTERA 6 mm²: ANTES, PUESTA Y ENGARZADA", "LAS DOS DE ADELANTE CORTADAS A CUARTO: COLLAR, CAÑA, HILOS Y AISLACION")
A = img3d(h, "conex_tif_corte", 880, 84, 620)
columna(h, A, [("suelta", "1", "COLLAR (POLIPROPILENO)"), ("tuboS", "2", "CAÑA Cu ESTAÑADO"), ("embudoB", "", "EMBUDO DEL COLLAR"),
               ("hilosB", "3", "HILOS SUELTOS (PUESTA)"), ("engC", "", "ENGARCE CUADRADO (*)"), ("hexC", "", "HILOS COMPACTADOS")], 1488, 110, 470)
columna(h, A, [("pelado", "", "CABLE PELADO 12 mm"), ("aislB", "4", "AISLACION DEL CABLE"), ("aislC", "", "CABLE 6 mm² (L1)")], 902, 150, 470, paso=26)
h.titulo(890, 528, "LAS CINCO SIMPLES, ENGARZADAS", "1,5 · 2,5 · 4 · 6 · 10 mm² · COLLAR CON COLOR DIN 46228-4 (*)")
A2 = img3d(h, "conex_tif_fila", 880, 552, 620)
columna(h, A2, [(f"t{i}", "", f"{p['s']} mm² · {p['cod']} · {p['dinN']}") for i, p in enumerate(T)], 1488, 580, 860, paso=28)
bloque(h, 890, 916, "DATOS TECNICOS", ["CAÑA DE COBRE ELECTROLITICO ESTAÑADO; COLLAR DE POLIPROPILENO DE COLOR (*).", "SE ELIGE POR LA SECCION DEL CABLE: EL COLOR AYUDA, MANDA LA SECCION GRABADA.", "ENGARZAR SIEMPRE CON PINZA: NUNCA CON ALICATE NI SOLDADA."], w=740, sz=10, lh=13.5)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/conex_tif_*.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES_conex.md", 9.5, 400, G, "start", INT)
rotuloB(h, "MAT-TERMINALES-2", "PUNTERAS AISLADAS TIF", "SIMPLES Y DOBLES (DIN 46228-4)", "CORTES A-A, C-C, SECCION B-B, D1, D2 Y 3D", "15:1 · 20:1", "INDICADAS · 3D S/E")
guardar(h, "mat_terminales_2")
