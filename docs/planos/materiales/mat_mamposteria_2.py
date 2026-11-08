"""MAT-MAMPOSTERIA-2 (rev. B) · Anclaje de expansión tipo Kwik Bolt 1/2" × 150 con tuerca y arandela H°G° (8002) y varilla roscada (4040).
Plano y 3D con las mismas medidas (perfiles_civil.json: ANC). 3D: r3d/out/civil_anclaje.png y civil_anclaje_det.png.
Fuentes: ficha de la app y TABLERO_NIVEL (anclajeLargoCm 15, rosca 1/2", 4 por tablero), Hilti KB-TZ2 1/2" (broca 1/2", h_nom 2", 50 ft-lb, llave 3/4"),
rosca 1/2"-13 UNC. Ver r3d/FUENTES_civil.md. Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

A = PC["ANC"]; d = A["d"]; r = d / 2
h = nuevaC()
Lr, Lc, Lk = 52, A["camisa"]["L"], A["cono"]["L"]

# =============== 1. VISTA DEL ANCLAJE ===============
h.titulo(40, 62, "ANCLAJE 1/2\" × 150 (8002) · VISTA", "ESC. 1:1 · PERNO CON ROSCA, CAMISA (CLIP) Y CONO · TUERCA Y ARANDELA H°G°")
k = 2.55; x0, yc = 80, 175          # px/mm (≈ 1:1,2)
def VX(x): return x0 + x * k
h.ln(VX(-8), yc, VX(158), yc, K, .45, h.EJE)
h.rect(VX(0), yc - r * k, Lr * k, d * k, "#fff", K, 1.1)
for i in range(int(Lr / A["paso"])): xx = VX(i * A["paso"]); h.ln(xx, yc - r * k, xx + A["paso"] * k * .5, yc + r * k, K, .5)
h.rect(VX(Lr), yc - (r - .9) * k, (150 - Lr - Lk) * k, (d - 1.8) * k, "#fff", K, 1.1)
h.path(f"M{VX(150 - Lk)},{yc - (r - .9) * k} L{VX(150 - Lk + 3)},{yc - A['cono']['dmin'] / 2 * k} L{VX(150 - 4)},{yc - (r - .4) * k} L{VX(150)},{yc - (r - 1.5) * k} V{yc + (r - 1.5) * k} L{VX(150 - 4)},{yc + (r - .4) * k} L{VX(150 - Lk + 3)},{yc + A['cono']['dmin'] / 2 * k} L{VX(150 - Lk)},{yc + (r - .9) * k}", "#fff", K, 1.1)
xc0 = 150 - Lk - Lc + 6
h.rect(VX(xc0), yc - (r + .2) * k, Lc * k, (d + .4) * k, "url(#MET)", K, 1.0)
for i in range(1, 7): h.ln(VX(xc0 + i * 3.4), yc - (r + .2) * k, VX(xc0 + i * 3.4), yc - (r - .6) * k, K, .8)
h.dimH(yc - r * k - 34, VX(0), VX(150), "150 (8002)", ext=yc - r * k)
h.dimH(yc - r * k - 16, VX(0), VX(Lr), "52 (*)", ext=yc - r * k, c=OR)
h.dimH(yc + r * k + 18, VX(xc0), VX(xc0 + Lc), "24 (*)", ext=yc + r * k, c=OR, dy=13)
h.dimV(VX(-6) - 12, yc - r * k, yc + r * k, "1/2\"", ext=VX(0))
llamada(h, VX(25), yc + r * k, VX(20), yc + r * k + 30, "ROSCA 1/2\"-13 UNC (PASO 1,95)", sz=9)
llamada(h, VX(100), yc + (r - 1) * k, VX(70), yc + r * k + 48, "VASTAGO", sz=9)
llamada(h, VX(xc0 + 12), yc + (r + .2) * k, VX(xc0 + 20), yc + r * k + 66, "CAMISA (CLIP) CON DIENTES (*)", sz=9)
llamada(h, VX(150 - 6), yc - (r - 1) * k, VX(156), yc - r * k - 16, "CONO", sz=9)
# tuerca y arandela sueltas
tx = 600
h.path(f"M{tx},{yc - 22} h22 l11,22 l-11,22 h-22 l-11,-22 Z", "#fff", K, 1.1); h.circ(tx + 11, yc, r * 2.2, "#fff", K, .8); h.circ(tx + 11, yc, r * 2.6, "none", K, .4, h.OCULTA)
h.txt(tx + 11, yc + 40, "TUERCA 1/2\" (LLAVE 3/4\")", 9, 700, K, "middle")
h.circ(tx + 130, yc, A["arandela"]["de"] / 2 * 1.4, "#fff", K, 1.1); h.circ(tx + 130, yc, A["arandela"]["di"] / 2 * 1.4, "#fff", K, .9)
h.txt(tx + 140, yc + 40, "ARANDELA Ø34 (*)", 9, 700, OR, "middle")

# =============== 2. CORTE A-A · COLOCADO ===============
subt(h, 40, 300, "CORTE A-A · COLOCADO EN EL HORMIGON", "ESC. 1:1,6 · BASE DEL TABLERO A NIVEL (AP-TC-007, DETALLE «A»)")
kc = 1.5; ox, oy = 210, 400          # z = 0 en la cara del hormigón
def CX(x): return ox + x * kc
def CY(z): return oy - z * kc
zt, zb, prof = 32, -120, 125
h.rect(CX(-90), CY(0), 180 * kc, 160 * kc, "url(#CONC)", K, 1.3)
h.rect(CX(-r), CY(0), d * kc, prof * kc, "#fff", K, .8)
h.path(f"M{CX(-r)},{CY(-prof)} L{CX(0)},{CY(-prof - 4)} L{CX(r)},{CY(-prof)}", "#fff", K, .8)
h.rect(CX(-70), CY(A["placa"]), 140 * kc, A["placa"] * kc, "url(#MET)", K, 1.0)
h.rect(CX(-A["arandela"]["de"] / 2), CY(A["placa"] + A["arandela"]["e"]), A["arandela"]["de"] * kc, A["arandela"]["e"] * kc, "url(#MET)", K, .9)
ze = A["placa"] + A["arandela"]["e"]; h.rect(CX(-A["tuerca"]["af"] / 2 * 1.155), CY(ze + A["tuerca"]["e"]), A["tuerca"]["af"] * 1.155 * kc, A["tuerca"]["e"] * kc, "url(#MET)", K, 1.0)
h.rect(CX(-r), CY(zt), d * kc, (zt - zb) * kc, "#fff", K, 1.0)
for i in range(int(Lr / A["paso"])): yy = CY(zt) + i * A["paso"] * kc; h.ln(CX(-r), yy, CX(r), yy + A["paso"] * kc * .5, K, .4)
zc0 = zb + Lk * .35
h.rect(CX(-r), CY(zc0 + Lc), 1.6 * kc, Lc * kc, "url(#MET)", K, .8); h.rect(CX(r - 1.6), CY(zc0 + Lc), 1.6 * kc, Lc * kc, "url(#MET)", K, .8)
h.ln(CX(0), CY(zt + 8), CX(0), CY(-prof - 8), K, .45, h.EJE)
h.dimV(CX(90) + 16, CY(0), CY(-prof), "125 (*)", ext=CX(r), c=OR)
h.dimV(CX(90) + 40, CY(0), CY(zc0 + Lc / 2), "≥ 51 (h nom)", ext=CX(r))
h.dimV(CX(-90) - 16, CY(zt), CY(zb), "150", ext=CX(-r))
h.dimH(CY(-160) + 18, CX(-r), CX(r), "Ø12,7 (BROCA 1/2\")", ext=CY(-prof))
for n, (x, z), (gx, gy) in [("1", (6, ze + 6), (CX(118), CY(30))), ("2", (15, ze - 1), (CX(118), CY(14))), ("3", (55, 1.5), (CX(118), CY(-2))),
                            ("4", (-r + 1, zt - 20), (CX(-40), CY(25))), ("5", (-r + 1, zc0 + Lc / 2), (CX(-60), CY(-70))), ("6", (0, zb + 5), (CX(-60), CY(-100))), ("7", (-60, -60), (CX(-60), CY(-30)))]:
    h.globo(n, CX(x), CY(z), gx, gy, r=8.5)
h.txt(CX(-90), CY(-160) + 38, "1 TUERCA · 2 ARANDELA · 3 CHAPA DEL GABINETE · 4 PERNO", 9.5, 400, G); h.txt(CX(-90), CY(-160) + 51, "5 CAMISA ABIERTA · 6 CONO · 7 HORMIGON", 9.5, 400, G)
cx, cy = CX(0), CY(zc0 + Lc / 2); h.llamadaDet(cx, cy, 30, ""); h.txt(cx + 33, cy - 22, "D1", 11, 700)

# =============== 3. D1 · ZONA DE EXPANSION ===============
subt(h, 540, 300, "D1 - LA CAMISA SE ABRE", "ESC. 4:1 · AL APRETAR LA TUERCA EL CONO SUBE")
k3 = 4.2; dx, dy = 690, 420
def DX(x): return dx + x * k3
def DY(z): return dy - (z - (zc0 + Lc / 2)) * k3
h.rect(DX(-r - 10), DY(zc0 + Lc + 6), (d + 20) * k3, (Lc + 16) * k3, "url(#CONC)", K, .8)
h.rect(DX(-r), DY(zc0 + Lc + 6), d * k3, (Lc + 16) * k3, "#fff", "none", 0)
h.rect(DX(-r + 1.6), DY(zc0 + Lc + 6), (d - 3.2) * k3, (Lc + 6 - (zc0 + Lc - zc0)) * k3 + Lc * k3 * 0, "#fff", K, .9)
h.path(f"M{DX(-(r - .9))},{DY(zc0 + Lc + 6)} V{DY(zc0)} L{DX(-A['cono']['dmin'] / 2)},{DY(zc0)} L{DX(-(r - .4))},{DY(zc0 - 10)} H{DX(r - .4)} L{DX(A['cono']['dmin'] / 2)},{DY(zc0)} L{DX(r - .9)},{DY(zc0)} V{DY(zc0 + Lc + 6)}", "#fff", K, 1.0)
for s in (-1, 1):
    xx0 = -r if s < 0 else r - 1.6
    h.path(f"M{DX(xx0)},{DY(zc0 + Lc)} h{1.6 * k3} V{DY(zc0)} h{-1.6 * k3} Z", "url(#MET)", K, 1.0)
    for i in range(6):
        zz = zc0 + 2 + i * 3.6; xe = -r if s < 0 else r
        h.path(f"M{DX(xe)},{DY(zz)} l{-s * 2.5},{-3} l{s * 2.5},{-3}", "none", K, .8)
llamada(h, DX(-r - .5), DY(zc0 + Lc * .6), DX(-r - 16), DY(zc0 + Lc + 10), "DIENTES QUE MUERDEN", sz=9, anc="end")
llamada(h, DX(0), DY(zc0 - 6), DX(10), DY(zc0 - 22), "CONO", sz=9)
h.path(f"M{DX(r + 6)},{DY(zc0 - 8)} v{-40}", "none", OR, 1.6); h.path(f"M{DX(r + 6) - 5},{DY(zc0 - 8) - 34} l5,-8 l5,8", OR, OR, 1)
h.txt(DX(r + 10), DY(zc0 - 8) - 20, "SUBE", 9, 700, OR)

# =============== 4. SECUENCIA ===============
subt(h, 540, 560, "COMO SE COLOCA", "1 AGUJERO Ø1/2\" · 2 LIMPIAR · 3 GOLPEAR · 4 AJUSTAR")
for i, t in enumerate(["AGUJEREAR Ø1/2\" (*)", "SOPLAR / LIMPIAR", "PASAR LA CHAPA Y GOLPEAR", "AJUSTAR ≈ 68 N·m"]):
    yy = 600 + i * 22; h.circ(552, yy - 4, 8, "#fff", K, .9); h.txt(552, yy, str(i + 1), 9.5, 700, K, "middle"); h.txt(566, yy, t, 9.5, 400, OR if "(*)" in t else K)
h.txt(540, 700, "KB-TZ2 1/2\": 50 ft-lb ≈ 68 N·m EN HORMIGON (HILTI).", 9, 400, G)
h.txt(540, 713, "EL ANCLAJE DEL PAÑOL ES «TIPO» KWIK BOLT: USAR", 9, 400, OR); h.txt(540, 726, "EL TORQUE DE SU FICHA (*).", 9, 400, OR)

# =============== TABLAS Y NOTAS ===============
EX = {8002: "1/2\" × 150", 4040: "Ø Y LARGO (*)"}
yt = tablaCod(h, 40, 760, [8002, 4040], EX, w=800, rowh=15, tit_extra="MEDIDA", wext=140)
cols = [(330, "l", False), (150, "c", True), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["ANCLAJES POR TABLERO A NIVEL", "4", "TABLERO_NIVEL (anclajes)"],
       ["LARGO / ROSCA", "150 / 1/2\"", "TABLERO_NIVEL"],
       ["BROCA · EMPOTRAMIENTO NOMINAL", "1/2\" · 51", "HILTI KB-TZ2 1/2\""],
       ["TORQUE DE AJUSTE", "68 N·m (*)", "50 ft-lb (KB-TZ2) · VER FICHA"]]
yt = tablaG(h, 40, yt + 20, cols, fil, rowh=15, titulo="DATOS DE COLOCACION")
yr = rayadosC(h, 40, yt + 20, ["CONC", "MET"], cols=2, dx=260)
notasW(h, 40, yr + 12, [
    "COTAS EN mm. FICHA DE LA APP: «ANCLAJE KWIK BOLT DE 1/2\" × 15 cm: 4 POR TABLERO A NIVEL», CON TUERCA Y ARANDELA PLANA H°G°.",
    "BROCA 1/2\", EMPOTRAMIENTO NOMINAL 2\" (51) Y TORQUE 50 ft-lb: HILTI KB-TZ2 1/2\" (REFERENCIA). EL DEL PAÑOL ES «TIPO»: MANDA SU FICHA.",
    "(*) PROFUNDIDAD DEL AGUJERO (DIBUJADA 125), LARGO ROSCADO, CAMISA, CONO Y ARANDELA: PROPORCIONALES. POSICION DE LOS 4 ANCLAJES: SEGUN EL GABINETE.",
    "(*) VARILLA ROSCADA 4040: Ø, LARGO Y TUERCAS A CONFIRMAR. FUENTES: r3d/FUENTES_civil.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - ANCLAJE COLOCADO, CORTADO A CUARTO", "A LA DERECHA EL MISMO ANCLAJE DESPIEZADO: TUERCA, ARANDELA, PERNO, CAMISA Y CONO")
A1 = img3d(h, "civil_anclaje", 884, 90, 520)
columna(h, A1, [("tuercaS", "", "TUERCA (SUELTA)"), ("arandelaS", "", "ARANDELA"), ("suelto", "", "PERNO 1/2\" × 150"), ("camisaS", "", "CAMISA"), ("conoS", "", "CONO")], 1420, 110, 330, paso=26)
columna(h, A1, [("tuerca", "1", "TUERCA"), ("arandela", "2", "ARANDELA"), ("chapa", "3", "CHAPA DEL GABINETE"), ("perno", "4", "PERNO"), ("hormigon", "7", "HORMIGON")], 1420, 380, 560, paso=26)
h.txt(1420, 600, "D1 EN 3D", 10, 700, NV, "start", INT)
A2 = img3d(h, "civil_anclaje_det", 1420, 604, 200)
globo3d(h, A2("camisa"), "5", 1400, 650, "CAMISA", lado="izq"); globo3d(h, A2("cono"), "6", 1400, 760, "CONO", lado="izq"); globo3d(h, A2("agujero"), "", 1400, 790, "FONDO DEL AGUJERO", lado="izq")
bloque(h, 890, 830, "DATOS TECNICOS", [
    "ANCLAJE DE EXPANSION TIPO KWIK BOLT, 1/2\" × 15 cm",
    "TUERCA Y ARANDELA H°G°",
    "SE COLOCA EN HORMIGON ENDURECIDO (NO EN LADRILLO HUECO)"], w=360, sz=10, lh=13.5)
bloque(h, 1270, 830, "DONDE SE USA", [
    "AP-TC-007: 4 ANCLAJES POR TABLERO A NIVEL",
    "FIJACION DEL GABINETE SOBRE LA BASE",
    "VARILLA ROSCADA: ANCLAJE DEL GABINETE (*)"], w=360, sz=10, lh=13.5)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_anclaje*.mjs): ROSCA HELICOIDAL REAL. FUENTES: r3d/FUENTES_civil.md")
rotuloMat(h, "MAT-MAMPOSTERIA-2", "ANCLAJE DE EXPANSION 1/2\"", "Y VARILLA ROSCADA", "VISTA, CORTE A-A, D1, COLOCACION Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha=FECHA)
guardarC(h, "mat_mamposteria_2")
