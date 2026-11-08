"""MAT-SENAL_SELLADO-1 (rev. B) · Malla subterránea de advertencia «Peligro Eléctrico» 30 cm (8017) y bloque de telgopor (8005).
Plano y 3D con las mismas medidas (perfiles_civil.json: MALLA, TELG). 3D: r3d/out/civil_malla.png y civil_perlas.png.
Fuentes: ficha de la app (Maintec: PEBD virgen roja, rombo ≈ 22 × 18, rollo 100 m, +5 % de solape), catálogo Maintec (rollos de 100 m, 15/30 cm,
polietileno de baja densidad lineal), AP-TC-001 (zanja), AP-TC-003-A (telgopor a 350 del fondo, alto 650). Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

M = PC["MALLA"]; T = PC["TELG"]
h = nuevaC()
ROJO = "#d93a2b"

# =============== 1. MALLA · VISTA DE ARRIBA ===============
h.titulo(40, 62, "MALLA DE ADVERTENCIA (8017) · VISTA DE ARRIBA", "ESC. 1:13 · ANCHO 300 · ROMBO ≈ 22 × 18 · FRANJA CON LA LEYENDA (*)")
k = .3; mx, my = 70, 100; W = M["ancho"]; Lx = 2400
h.a(f'<clipPath id="cpM"><rect x="{mx}" y="{my}" width="{Lx * k}" height="{W * k}"/></clipPath><g clip-path="url(#cpM)">')
rx, ry = M["rombo"]
for s in (1, -1):
    for kk in range(-20, int(Lx / rx) + 20):
        x0 = kk * rx; x1 = x0 + s * (W / (ry / 2)) * (rx / 2)
        h.ln(mx + x0 * k, my, mx + x1 * k, my + W * k, K, .5)
h.a('</g>')
for a, b in ((0, 8), (W / 2 - 22, W / 2 + 22), (W - 8, W)):
    h.rect(mx, my + a * k, Lx * k, (b - a) * k, "#fff", K, .7)
for xx in (120, 520):
    h.txt(mx + xx, my + W / 2 * k + 3.5, "PELIGRO ELECTRICO", 8.5, 700, K, "start")
h.rect(mx, my, Lx * k, W * k, "none", K, 1.2)
h.dimV(mx - 14, my, my + W * k, "300", ext=mx)
h.dimV(mx + Lx * k + 14, my + (W / 2 - 22) * k, my + (W / 2 + 22) * k, "44 (*)", ext=mx + Lx * k, c=OR)
h.dimV(mx + Lx * k + 14, my, my + 8 * k, "", ext=mx + Lx * k); h.txt(mx + Lx * k + 20, my + 6, "8 (*)", 8.5, 400, OR)
cx, cy = mx + 300 * k, my + 70 * k; h.llamadaDet(cx, cy, 16, ""); h.txt(cx - 18, cy - 12, "D1", 11, 700, K, "end")

# =============== 2. D1 ROMBO ===============
subt(h, 40, 225, "D1 - ROMBO", "ESC. 3:1 · HILO (*)")
k2 = 3; dx, dy = 110, 300
pts = [(dx - rx / 2 * k2, dy), (dx, dy - ry / 2 * k2), (dx + rx / 2 * k2, dy), (dx, dy + ry / 2 * k2)]
for i in range(4):
    a, b = pts[i], pts[(i + 1) % 4]; h.ln(a[0], a[1], b[0], b[1], K, M["hilo"] * k2 * .5)
h.dimH(dy + ry / 2 * k2 + 18, dx - rx / 2 * k2, dx + rx / 2 * k2, "≈ 22", ext=dy)
h.dimV(dx + rx / 2 * k2 + 18, dy - ry / 2 * k2, dy + ry / 2 * k2, "≈ 18", ext=dx)

# =============== 3. UBICACION EN LA ZANJA ===============
subt(h, 250, 225, "UBICACION EN LA ZANJA (AP-TC-001)", "ESC. 1:10 · 1 CONDUCTOR · ANCHO 200")
kz = .27; zx, zy = 380, 260
def ZX(x): return zx + x * kz
def ZY(z): return zy - z * kz
h.rect(ZX(-180), ZY(0), 360 * kz, 800 * kz, "url(#EARTH)", "none", 0)
h.rect(ZX(-100), ZY(0), 200 * kz, 750 * kz, "url(#ANSI37)", K, 1.0)
h.rect(ZX(-100), ZY(-650), 200 * kz, 100 * kz, "url(#SAND)", K, .8)
h.circ(ZX(0), ZY(-700), 10 * kz + 1, K, K, 0)
h.ln(ZX(-100), ZY(-300), ZX(100), ZY(-300), ROJO, 2.0, h.MALLA)
h.ln(ZX(-180), ZY(0), ZX(180), ZY(0), K, 1.2)
h.nivel(ZX(-170), ZY(0), "±0,00")
h.dimV(ZX(-260) - 14, ZY(0), ZY(-300), "300 (*)", ext=ZX(-100), c=OR)
h.dimV(ZX(-260) - 34, ZY(0), ZY(-750), "750", ext=ZX(-100))
h.dimH(ZY(-750) + 14, ZX(-100), ZX(100), "200", ext=ZY(-750))
llamada(h, ZX(60), ZY(-300), ZX(290), ZY(-330), "MALLA 8017", c=ROJO, sz=9)
llamada(h, ZX(40), ZY(-610), ZX(290), ZY(-580), "ARENA 5 + 5", sz=9)
llamada(h, ZX(10), ZY(-700), ZX(290), ZY(-700), "CABLE", sz=9)

# =============== 4. TELGOPOR · VISTAS Y UBICACION ===============
subt(h, 40, 520, "BLOQUE DE TELGOPOR (8005) · 3 VISTAS", "ESC. 1:10 · 150 × 176 × 650 (*) · EPS")
kt = .3; tx, ty = 70, 560
h.rect(tx, ty, T["a"] * kt, T["h"] * kt, "url(#FOAM)", K, 1.2); h.rect(tx + T["a"] * kt + 30, ty, T["b"] * kt, T["h"] * kt, "url(#FOAM)", K, 1.2)
h.rect(tx + T["a"] * kt + T["b"] * kt + 60, ty, T["b"] * kt, T["a"] * kt, "url(#FOAM)", K, 1.2)
h.dimV(tx - 12, ty, ty + T["h"] * kt, "650", ext=tx)
h.dimH(ty + T["h"] * kt + 14, tx, tx + T["a"] * kt, "150 (*)", ext=ty + T["h"] * kt, c=OR)
h.dimH(ty + T["h"] * kt + 14, tx + T["a"] * kt + 30, tx + T["a"] * kt + 30 + T["b"] * kt, "176", ext=ty + T["h"] * kt)
h.txt(tx + T["a"] * kt + T["b"] * kt + 60, ty + T["a"] * kt + 16, "PLANTA", 9, 400, G)
h.txt(tx, ty + T["h"] * kt + 42, "176 = (600 − 247) / 2: DEL MOLDE A LA PARED DEL POZO", 9, 400, K)
# ubicación en la fundación PRFV 7 m (AP-TC-003-A)
subt(h, 330, 520, "UBICACION EN LA FUNDACION PRFV (AP-TC-003-A)", "ESC. 1:20 · TELGOPOR CONTRA EL MOLDE, DEL LADO DE LA ZANJA")
kf = .17; fx, fy = 470, 806
def FX(x): return fx + x * kf
def FY(z): return fy - z * kf
h.rect(FX(-300), FY(1200), 600 * kf, 1200 * kf, "url(#CONC)", K, 1.2)
h.rect(FX(-123.5), FY(1200), 247 * kf, 1200 * kf - 0, "#fff", K, 1.0)
h.rect(FX(123.5), FY(350 + T["h"]), (300 - 123.5) * kf, T["h"] * kf, "url(#FOAM)", K, 1.1)
h.rect(FX(-98.5), FY(1500), 197 * kf, 1500 * kf - 350 * kf * 0, "none", K, .6, h.OCULTA)
h.dimV(FX(300) + 14, FY(0), FY(350), "350", ext=FX(300))
h.dimV(FX(300) + 14, FY(350), FY(1000), "650", ext=FX(300))
h.dimH(FY(0) + 14, FX(-300), FX(300), "600", ext=FY(0))
h.dimH(FY(1200) + 14, FX(-123.5), FX(123.5), "Ø247", ext=FY(1200), dy=13)
llamada(h, FX(210), FY(700), FX(380), FY(780), "TELGOPOR 8005", sz=9)
llamada(h, FX(0), FY(600), FX(-330), FY(700), "MOLDE Ø247 / POSTE", sz=9, anc="end")
h.txt(FX(320), FY(500), "ZANJA →", 9, 700, K)
h.txt(FX(-300) - 60, FY(0) + 32, "DESPUES DEL FRAGÜE SE ROMPE: QUEDA EL CANAL DEL CABLE HASTA LA «C» DEL POSTE", 9, 400, K)

# =============== TABLAS Y NOTAS ===============
EX = {8017: "300 · ROLLO 100 m", 8005: "150 × 176 × 650 (*)"}
yt = tablaCod(h, 40, 850, [8017, 8005], EX, w=800, rowh=15, tit_extra="MEDIDA", wext=170)
cols = [(250, "l", False), (160, "c", True), (390, "l", False)]
fil = [["COMPUTO", "CANTIDAD", "CALCULO"], ["MALLA POR METRO DE ZANJA", "1,05 m", "1 m + 5 % DE SOLAPE (FICHA DE LA APP)"],
       ["ROLLOS PARA L METROS", "L × 1,05 / 100", "ROLLO DE 100 m"], ["TELGOPOR", "1 u", "POR FUNDACION PRFV"]]
yt = tablaG(h, 40, yt + 20, cols, fil, rowh=15, titulo="COMPUTO")
notasW(h, 40, yt + 20, [
    "COTAS EN mm. MALLA: FICHA DE LA APP (MAINTEC: PEBD VIRGEN, ROJA, ROMBO ≈ 22 × 18, ROLLO 100 m) Y CATALOGO MAINTEC (ROLLOS DE 100 m, 15 Y 30 cm).",
    "(*) DISEÑO DE LA FRANJA Y TEXTO DE LA LEYENDA: MAINTEC TIENE «CABLES ENTERRADOS» Y «PELIGRO RIESGO ELECTRICO»; EL PAÑOL DICE «PELIGRO ELECTRICO». CONFIRMAR.",
    "(*) MALLA «A 30 cm» (CLAUDE.md §11.3): SE DIBUJO A 300 DEL SOLADO. CONFIRMAR SI ES DEL SOLADO O DEL CABLE. ESPESOR DEL TELGOPOR (150) Y DENSIDAD: A CONFIRMAR.",
    "FUENTES: r3d/FUENTES_civil.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - ROLLO DE MALLA Y BLOQUE DE TELGOPOR", "MALLA DE POLIETILENO ROJA CON LEYENDA · TELGOPOR BLANCO CON SUS PERLAS")
A = img3d(h, "civil_malla", 884, 92, 600)
columna(h, A, [("rollo", "1", "ROLLO DE 100 m"), ("orilla", "2", "ORILLA"), ("leyenda", "3", "LEYENDA"), ("rombo", "4", "ROMBOS ≈ 22 × 18"),
               ("telgTop", "5", "TELGOPOR 8005"), ("telg", "", "CARA DE 650")], 1500, 120, 440, paso=27)
h.txt(890, 488, "TELGOPOR DE CERCA: PERLAS SOLDADAS ENTRE SI (*)", 11, 700, NV, "start", INT)
A2 = img3d(h, "civil_perlas", 884, 496, 420)
globo3d(h, A2("perla"), "", 1330, 560, "PERLAS DE EPS (*)"); globo3d(h, A2("regla"), "", 1330, 740, "REGLA EN mm")
bloque(h, 890, 820, "DATOS TECNICOS", [
    "MALLA: POLIETILENO ROJO, ANCHO 30 cm, «PELIGRO ELECTRICO»",
    "ROLLO DE 100 m · SE SOLAPA 5 %",
    "TELGOPOR: POLIESTIRENO EXPANDIDO; HACE EL CANAL DEL CABLE EN EL HORMIGON"], w=360, sz=10, lh=13.5)
bloque(h, 1270, 820, "DONDE SE USA", [
    "AP-TC-001 ZANJA: MALLA SOBRE TODO EL TENDIDO",
    "AP-TC-003-A FUNDACION PRFV: TELGOPOR DEL LADO DE LA ZANJA (HOY); VARIANTE PEAD Ø50",
    "GUIA «ZANJEO Y TENDIDO»"], w=360, sz=10, lh=13.5)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_malla.mjs, civil_perlas.mjs). FUENTES: r3d/FUENTES_civil.md")
rotuloMat(h, "MAT-SENAL_SELLADO-1", "MALLA DE ADVERTENCIA", "Y BLOQUE DE TELGOPOR", "VISTAS, D1, ZANJA, FUNDACION Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha=FECHA)
guardarC(h, "mat_senal_sellado_1")
