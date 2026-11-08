"""MAT-TERMINALES-3 (rev. B) · Terminales preaislados de ojal (2050–2056) y termocontraíble 2057; variante de pala (sin código).
Plano y 3D con los mismos números: r3d/piezas/perfiles_conex.mjs (PREAIS, PALA, TERMO). 3D: r3d/out/conex_preais.png.
Datos: descripciones del pañol (Ø del agujero, color, sección); RS PRO M6 amarillo 4–6 mm² (L 29,5 · ojal 12 / 6,4 · chapa 1); fichas de termocontraíble 4,8/2,4."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conexkit import *

h = nueva3()
P = PC["PREAIS"]; L, Dr, dr, t = P["L"], P["Dr"], P["dr"], P["t"]
mL, mDe, mDi, bL, bDe, bDi, cu = P["mangL"], P["mangDe"], P["mangDi"], P["barrilL"], P["barrilDe"], P["barrilDi"], P["cuello"]
xb0 = mL - bL - .4; xb1 = xb0 + bL; xn = xb1 + cu; xc = L - Dr / 2
AM, AZ = PC["PREAIS_COL"]["amarillo"], PC["PREAIS_COL"]["azul"]

# ================= 1. PLANTA · ESC. 9:1 =================
e = 11.5; v = Vista(h, 72, 206, e)
h.titulo(40, 62, "PLANTA", "OJAL Ø6 AMARILLO (2054) · ESC. 11,5:1")
v.poly([[0, mDe / 2 - .7], [.4, mDe / 2], [mL - 2, mDe / 2], [mL, bDe / 2 + .6], [mL, -(bDe / 2 + .6)], [mL - 2, -mDe / 2], [.4, -mDe / 2], [0, -(mDe / 2 - .7)]], "#fff", 1.4)
ring = [[xb1 - .4, bDe / 2 * .8], [xn, Dr * .26]]
for i in range(0, 33): a_ = math.pi * .62 - math.pi * 1.24 * i / 32; ring.append([xc + Dr / 2 * math.cos(a_), Dr / 2 * math.sin(a_)])
ring += [[xn, -Dr * .26], [xb1 - .4, -bDe / 2 * .8]]
v.poly([[mL, ring[0][1]]] + ring[1:-1] + [[mL, ring[-1][1]]], "#fff", 1.4)
v.circ(xc, 0, dr / 2, "#fff", 1.2)
v.oculta([[xb0, bDe / 2], [xb1, bDe / 2]]); v.oculta([[xb0, -bDe / 2], [xb1, -bDe / 2]]); v.oculta([[xb0, bDe / 2], [xb0, -bDe / 2]])
v.eje(-2.5, 0, L + 2.5, 0); v.eje(xc, -Dr / 2 - 2, xc, Dr / 2 + 2)
v.cotaH(0, L, -Dr / 2 - 3.2, "29,5 (L)", zext=-mDe / 2)
v.cotaV(L + 3, -Dr / 2, Dr / 2, "Ø12", yext=xc)
v.cotaV(-2.6, -mDe / 2, mDe / 2, "Ø7,6 (*)", yext=0, c=OR)
v.cotaH(0, mL, Dr / 2 + 1.6, "13 (*) MANGUITO", zext=mDe / 2, c=OR)
llamada(h, *v.p(xc + 2.3, 2.3), *v.p(L + 4, 8.5), "Ø6,4 PARA M6", sz=9.5)
a_, b_ = v.p(xb0 + 7, mDe / 2 + 1.2), v.p(xb0 + 7, -mDe / 2 - 1.2); lineaCorte(h, a_[0], a_[1] - 4, b_[0], b_[1] + 4, "B")
for n, (y, z), (gx, gy) in [("1", (6, mDe / 2), (190, 98)), ("2", (L - 3, 4), (400, 104)), ("3", (xn + .5, 2.5), (300, 282))]:
    h.globo(n, *v.p(y, z), gx, gy, r=9)

# ================= 2. CORTE A-A (elevación) =================
v2 = Vista(h, 72, 440, e)
h.titulo(40, 332, "CORTE A-A", "POR EL EJE · ARRIBA CORTE, ABAJO VISTA · ESC. 11,5:1")
Rm, Ri, rb, rbi = mDe / 2, mDi / 2, bDe / 2, bDi / 2
secRT(v2, [[Ri + .7, 0], [Rm - .3, 0], [Rm, .4], [Rm, mL - 2], [rb + .6, mL], [rb + .05, mL], [rb + .05, mL - bL + .2], [Ri + .05, mL - bL - .2], [Ri + .05, 1.4]], "PLAS2", 1.1)
secRT(v2, [[Ri - .3, 1.2], [Ri, 1.2], [Ri, xb0 - .4], [Ri - .3, xb0 - .4]], "CU", .8)
secRT(v2, [[rbi, xb0], [rb, xb0], [rb, xb1], [rbi, xb1]], "CU", 1.0)
v2.poly([[xb1 - .4, -rb], [xb1 - .4, -rb + t], [L, -rb + t], [L, -rb]], "url(#CU)", 1.0)
v2.poly([[0, 0], [0, -(Rm - .7)], [.4, -Rm], [mL - 2, -Rm], [mL, -(rb + .6)], [mL, 0]], "#fff", 1.1)
v2.oculta([[xb0, -rbi], [xb1, -rbi]]); v2.oculta([[xb0, -rb], [xb1, -rb]])
v2.oculta([[xc - dr / 2, -rb], [xc - dr / 2, -rb + t]]); v2.oculta([[xc + dr / 2, -rb], [xc + dr / 2, -rb + t]])
v2.eje(-2.5, 0, L + 2.5, 0)
v2.cotaV(L + 3, -rb, -rb + t, "", yext=L); h.txt(*v2.p(L - 3, -rb - 2.4), "1,0", 9.5)
v2.cotaV(-2.6, -rbi, rbi, "Ø3,6 (*)", yext=0, c=OR)
v2.cotaH(xb0, xb1, Rm + 1.6, "9,5 (*) BARRIL", zext=rb, c=OR)
for n, (y, z), (gx, gy), tx in [("4", (3, Rm - .3), (60, 510), "MANGUITO PVC / NYLON (*)"), ("5", (2.5, Ri - .15), (60, 534), "MANGUITO INT. Cu (AGARRA LA AISLACION)"),
                                ("6", (xb0 + 3, rb - .2), (60, 558), "BARRIL CON COSTURA SOLDADA (*)")]:
    a_ = v2.p(y, z); h.globo(n, a_[0], a_[1], gx, gy, r=9); h.txt(gx + 14, gy + 4, tx, 9, 400, OR if "(*)" in tx else K)

# ================= 3. SECCION B-B · ANTES / DESPUES · ESC. 12:1 =================
h.titulo(470, 62, "SECCION B-B", "POR EL BARRIL · 4 mm² · ESC. 12:1")
k = 12
def dentado(cx, cy, r, prof, ancho=1.9, n=180):
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n; rr = r
        for c in (math.pi / 2, -math.pi / 2):
            d = abs(math.atan2(math.sin(a - c), math.cos(a - c))) * r
            if d < ancho: rr = min(rr, r - prof * (1 - (d / ancho) ** 2))
        pts.append((cx + rr * k * math.cos(a), cy - rr * k * math.sin(a)))
    return "M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in pts) + " Z"
cx, cy = 548, 196
anillo(h, cx, cy, Rm, Ri, "PLAS2", k, 1.0); anillo(h, cx, cy, rb, rbi, "CU", k, 1.0); hilos(h, cx, cy, 56, .3, 1.15, k)
h.txt(cx, cy + 62, "ANTES", 10, 700, K, "middle")
h.dimH(cy - Rm * k - 12, cx - rb * k, cx + rb * k, "Ø5 (*)", ext=cy - rb * k, c=OR)
cx2 = 760
h.path(dentado(cx2, cy, Rm, 1.5) + " " + dentado(cx2, cy, Ri - .05, 1.3), "url(#PLAS2)", K, 1.0, 'fill-rule="evenodd"')
h.path(dentado(cx2, cy, rb, 1.1) + " " + dentado(cx2, cy, rbi, 1.0), "url(#CU)", K, 1.0, 'fill-rule="evenodd"')
for u, vv in empaque(56, .3, 1.15):
    vv2 = vv * .62; h.circ(cx2 + u * k * 1.08, cy - vv2 * k, .15 * k * .97, "#e9a466", "#6a3510", .3)
h.txt(cx2, cy + 62, "DESPUES (MARCA DOBLE)", 10, 700, K, "middle")
h.path(f"M{cx + 56},{cy} H{cx2 - 56}", "none", K, 1.2); h.path(f"M{cx2 - 64},{cy - 5} L{cx2 - 54},{cy} L{cx2 - 64},{cy + 5}", "none", K, 1.2)
h.txt((cx + cx2) / 2, cy - 8, "PINZA DE", 9.5, 700, K, "middle"); h.txt((cx + cx2) / 2, cy + 16, "PREAISLADOS (*)", 9.5, 400, OR, "middle")
h.txt(470, cy + 84, "LA MATRIZ HUNDE EL MANGUITO Y EL BARRIL SIN CORTAR LA AISLACION.", 9.5, 400, G)

# ================= 4. D1 · VARIANTE PALA · ESC. 6:1 =================
h.titulo(470, 332, "D1 - VARIANTE: PALA", "SIN CODIGO EN EL PAÑOL (*) · ESC. 6:1")
PA = PC["PALA"]; e3 = 6; v3 = Vista(h, 490, 420, e3)
w_, s_ = PA["W"] / 2, PA["ranura"] / 2
v3.poly([[0, mDe / 2 - .7], [.4, mDe / 2], [mL - 2, mDe / 2], [mL, bDe / 2 + .6], [mL, -(bDe / 2 + .6)], [mL - 2, -mDe / 2], [.4, -mDe / 2], [0, -(mDe / 2 - .7)]], "#fff", 1.2)
Lp = L
v3.poly([[mL, Dr * .26], [xn, Dr * .26], [xn + 2, w_], [Lp - .6, w_], [Lp, w_ - .6], [Lp, s_ + .2], [xn + 7, s_], [xn + 6.2, 0], [xn + 7, -s_], [Lp, -s_ - .2], [Lp, -w_ + .6], [Lp - .6, -w_], [xn + 2, -w_], [xn, -Dr * .26], [mL, -Dr * .26]], "#fff", 1.2)
v3.eje(-2, 0, L + 2, 0)
v3.cotaV(L + 3, -w_, w_, "6,4 (*)", yext=L, c=OR); v3.cotaH(xn + 6.2, L, -w_ - 2.4, "RANURA (*)", zext=-s_, c=OR)
h.txt(470, 474, "ENTRA SIN SACAR EL TORNILLO; SE PUEDE SALIR SI SE AFLOJA.", 9, 400, G)
h.txt(470, 487, "EN ALUMBRADO SE USA OJAL: NO ESTA EN EL PAÑOL.", 9, 400, G)

# ================= 5. D2 · TERMOCONTRAIBLE 2057 · ESC. 10:1 =================
TE = PC["TERMO"]; k5 = 10
h.titulo(470, 520, "D2 - TERMOCONTRAIBLE 2057", "PARED FINA 2:1 · ESC. 10:1")
for i, (tx, D_, w0) in enumerate((("ANTES", TE["Dsum"], TE["pared0"]), ("DESPUES (LIBRE)", TE["Drec"], TE["pared"]))):
    x_ = 520 + i * 130; y_ = 590
    anillo(h, x_, y_, D_ / 2, D_ / 2 - w0, "PLAS2", k5, 1.0)
    h.dimH(y_ - TE["Dsum"] / 2 * k5 - 10, x_ - D_ / 2 * k5, x_ + D_ / 2 * k5, ("Ø5,0" if i == 0 else "Ø2,5"), ext=y_)
    h.txt(x_, y_ + 44, tx, 9.5, 700, K, "middle")
h.path("M556,590 H626", "none", K, 1.2); h.path("M618,585 L628,590 L618,595", "none", K, 1.2); h.txt(591, 582, "CALOR", 9.5, 700, K, "middle")
h.txt(470, 652, "PARED CONTRAIDA ≈ 0,5 (FICHAS 4,8/2,4: 0,43 A 0,51).", 9.5, 400)
h.txt(470, 665, "PARED ANTES DE CALENTAR (*).", 9.5, 400, OR)
h.txt(470, 678, "TOMA DE Ø2,5 A Ø5,0: CABLES DE 1,5 Y 2,5 mm².", 9.5, 400)
h.txt(470, 691, "NO ENTRA EN EL CABLE DE 16 mm² (Ø ≈ 7,3) (*).", 9.5, 400, OR)

# ================= TABLAS =================
TY = 720
AG = {2054: ["Ø6 (M6)", "AMARILLO", "2,5 / 6 (*)"], 2055: ["Ø6 (M6)", "AZUL", "2,5 / 6 (*)"], 2052: ["(*)", "AZUL", "16-14 AWG"], 2053: ["Ø12", "AMARILLO", "—"],
      2051: ["Ø10", "AMARILLO", "—"], 2050: ["Ø8", "—", "—"], 2056: ["\"012\" (*)", "—", "—"], 2057: ["Ø5,0 / 2,5", "—", "TUBO"]}
fc = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "AGUJERO", "COLOR", "mm²"]]
for c in [2054, 2055, 2052, 2053, 2051, 2050, 2056, 2057]:
    r = cat(c, 46); fc.append([r[0], r[1], r[2]] + AG[c])
yt = h.tabla(40, TY, [(46, "c", True), (330, "l", False), (34, "c", False), (80, "c", False), (80, "c", False), (80, "c", False)], fc, rowh=14, titulo="CODIGOS DEL PAÑOL (8)", colores=colorOR)
fcol = [["COLOR DEL MANGUITO", "SECCION DEL CABLE", "AWG"], ["ROJO", "0,5 A 1,5 mm²", "22-16"], ["AZUL", "1,5 A 2,5 mm²", "16-14"], ["AMARILLO", "4 A 6 mm²", "12-10"]]
yt2 = h.tabla(900, 760, [(140, "l", False), (130, "c", True), (70, "c", True)], fcol, rowh=14, titulo="CODIGO DE COLORES (PRACTICA DE FABRICANTES)")
yr = rayados3(h, 40, yt + 22, ["PLAS2", "CU", "HIL"], cols=3, dx=200)
bloque(h, 1260, 760, "DONDE SE USA", ["CABLES CHICOS DE COMANDO DEL TABLERO.", "2057: 1 POR OJAL EN LA PLANILLA DE LA ACOMETIDA (VER NOTA 4)."], w=250, sz=9.5, lh=12.5)
notasW(h, 40, yr + 14, [
    "COTAS EN mm. L 29,5, OJAL Ø12 / Ø6,4 Y CHAPA 1,0: RS PRO M6 AMARILLO 4-6 mm². Ø DEL AGUJERO, COLOR Y SECCION: DESCRIPCION DEL PAÑOL.",
    "(*) MANGUITO, BARRIL, MANGUITO INTERIOR Y FORMA DE LA MARCA DEL ENGARCE: PROPORCIONALES, A CONFIRMAR CON EL FABRICANTE.",
    "(*) 2055 «AZUL ... 2,5/6 mm²»: EL AZUL ES DE 1,5 A 2,5 mm²; 6 mm² ES AMARILLO. REVISAR LA DESCRIPCION O EL MATERIAL. 2052 Y 2056: SIN Ø DE AGUJERO.",
    "(*) EL 2057 (Ø5,0 / 2,5) SE PIDE PARA LOS OJALES DE 16 mm² DE LA ACOMETIDA, PERO NO ENTRA EN ESE CABLE: HACE FALTA UNO MAS GRANDE. REVISAR.",
    "LA PINZA 2022 ES PARA PUNTERAS TIF; PARA PREAISLADOS VA LA PINZA DE MATRIZ ROJO / AZUL / AMARILLO (*)."], w=800, lh=13.5)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - PREAISLADOS Y TERMOCONTRAIBLE", "AMARILLO Ø6 ENGARZADO Y CORTADO · AZUL Ø6 NUEVO · PALA (VARIANTE) · TUBO 2057")
A = img3d(h, "conex_preais", 880, 84, 680)
columna(h, A, [("mang", "4", "MANGUITO AMARILLO"), ("barrilY", "6", "BARRIL Cu ESTAÑADO"), ("marca", "", "MARCA DEL ENGARCE (*)"), ("ojalY", "2", "OJAL Ø6"),
               ("azul", "", "AZUL Ø6 (2055)"), ("agujeroA", "", "AGUJERO Ø6,4"), ("pala", "", "VARIANTE PALA (*)"), ("termo0", "", "2057 ANTES"), ("termo1", "", "2057 CONTRAIDO")], 1490, 110, 520, paso=27)
bloque(h, 890, 600, "DATOS TECNICOS", [
    "TERMINAL DE COBRE ESTAÑADO CON MANGUITO AISLANTE DE COLOR (PVC O NYLON (*)).",
    "EL COLOR DICE LA SECCION: ROJO 0,5-1,5 · AZUL 1,5-2,5 · AMARILLO 4-6 mm².",
    "AGUJEROS EN EL PAÑOL: Ø6, Ø8, Ø10 Y Ø12.",
    "TERMOCONTRAIBLE DE POLIOLEFINA, PARED FINA, 2:1: SE CONTRAE A LA MITAD CON CALOR.",
    "UNIDAD: Un."], w=740, sz=10, lh=14)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/conex_preais.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES_conex.md", 9.5, 400, G, "start", INT)
rotuloB(h, "MAT-TERMINALES-3", "TERMINALES PREAISLADOS", "Y TERMOCONTRAIBLE", "PLANTA, CORTE A-A, SECCION B-B, D1, D2 Y 3D", "11,5:1 · 12:1", "INDICADAS · 3D S/E")
guardar(h, "mat_terminales_3")
