"""MAT-FIJACION-1 (rev. B) · Precintos nylon 66 200 × 4,5 (4029) y 250 × 4,5 negro (4030), cinta aisladora 19 mm × 20 m (4021),
soporte para caños (4033), tornillo con fisher n° 8 (4035), alambre para ataduras (1001) y pintura gris (9002).
Plano y 3D con las mismas medidas (perfiles_civil.json: PREC, FISHER, CINTA, ALAMBRE). 3D: r3d/out/civil_fijacion.png, civil_precinto.png, civil_fisher.png.
Fuentes: ficha de la app (precintos nylon 66 de 200 y 250 × 4,5; cinta 19 mm × 20 m), HellermannTyton T50R (200 × 4,6 · 225 N · −40 a 85 °C),
Fischer SX 8 × 40 (broca 8, taladro 50, tornillo 4,5–6), Easy (taco S8 + tornillo 5 × 45), CLAUDE.md §11.3 (alambre). Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

P = PC["PREC"]; F = PC["FISHER"]; CI = PC["CINTA"]; AL = PC["ALAMBRE"]
h = nuevaC()

# =============== 1. PRECINTO · VISTA ===============
h.titulo(40, 62, "PRECINTO NYLON 66 (4029 / 4030) · VISTA DE ARRIBA Y DE COSTADO", "ESC. 1:1,25 · 200 (250) × 4,5 · CABEZA CON UÑA DE TRABA")
k = 3.2; px, py = 70, 140
cab = P["cab"]
h.rect(px, py - cab[2] / 2 * k, cab[0] * k, cab[2] * k, "#fff", K, 1.2); h.rect(px + 2.5 * k, py - P["w"] / 2 * k + .5, 1.6 * k, P["w"] * k - 1, "#fff", K, .7)
h.path(f"M{px + cab[0] * k},{py - P['w'] / 2 * k} H{px + (P['L'] - 12) * k} L{px + P['L'] * k},{py - P['w'] / 2 * k + 3} V{py + P['w'] / 2 * k - 3} L{px + (P['L'] - 12) * k},{py + P['w'] / 2 * k} H{px + cab[0] * k} Z", "#fff", K, 1.1)

h.dimH(py - cab[2] / 2 * k - 14, px, px + P["L"] * k, "200 (4029) · 250 (4030)", ext=py - cab[2] / 2 * k)
h.dimV(px + P["L"] * k + 16, py - P["w"] / 2 * k, py + P["w"] / 2 * k, "4,5", ext=px + P["L"] * k)
h.dimV(px - 12, py - cab[2] / 2 * k, py + cab[2] / 2 * k, "7 (*)", ext=px, c=OR)
# costado
sy = py + 44
h.rect(px, sy - cab[1] * k, cab[0] * k, cab[1] * k, "#fff", K, 1.2)
h.rect(px + cab[0] * k, sy - P["t"] * k, (P["L"] - cab[0]) * k, P["t"] * k, "#fff", K, 1.0)
h.dimV(px - 12, sy - cab[1] * k, sy, "6 (*)", ext=px, c=OR); h.dimH(sy + 14, px, px + cab[0] * k, "8,2 (*)", ext=sy, c=OR)
h.dimV(px + 160, sy - P["t"] * k, sy, "", ext=px + 150); h.txt(px + 166, sy - 1, "1,25 (*)", 9, 400, OR)

# =============== 2. CORTE A-A POR LA CABEZA ===============
subt(h, 40, 240, "CORTE A-A · CABEZA CERRADA SOBRE LA COLA", "ESC. 8:1 · LA UÑA ENTRA EN EL DENTADO: SUBE, NO BAJA")
k2 = 11; cx0, cy0 = 250, 380
def X(x): return cx0 + x * k2
def Y(z): return cy0 - z * k2
x0, x1 = -2.9, -2.9 + cab[0]
h.path(f"M{X(x0)},{Y(0)} H{X(-.05)} V{Y(cab[1])} H{X(x0)} Z M{X(1.65)},{Y(0)} H{X(x1)} V{Y(cab[1])} H{X(1.65)} Z", "url(#PLAS)", K, 1.2)
h.rect(X(-2.3), Y(5.3), 2.25 * k2, 3.6 * k2, "#fff", K, .8)
una = [(-2.3, 5.3), (-1.5, 5.3), (.8 - P["t"] / 2 - P["diente"] * .2, 2.15), (.8 - P["t"] / 2 - P["diente"] * 1.05, 2.0), (-2.3, 4.6)]
h.path("M" + " L".join(f"{X(a):.1f},{Y(b):.1f}" for a, b in una) + " Z", "url(#PLAS2)", K, 1.1)
xs, t, d, p = .8, P["t"], P["diente"], P["pasoD"]
pts = [(xs + t / 2, -3)] + [(xs + t / 2, 9)]
dent = []
z = -3
while z < 9:
    dent += [(xs - t / 2, z), (xs - t / 2 - d, z + p * .98)]; z += p
h.path("M" + " L".join(f"{X(a):.1f},{Y(b):.1f}" for a, b in [(xs + t / 2, -3), (xs + t / 2, 9)] + list(reversed(dent))) + " Z", "url(#PLAS)", K, 1.0)
h.dimH(Y(cab[1]) - 12, X(x0), X(x1), "8,2 (*)", ext=Y(cab[1]), c=OR)
h.dimV(X(x1) + 14, Y(0), Y(cab[1]), "6 (*)", ext=X(x1), c=OR)
h.dimH(Y(-3) + 14, X(xs - t / 2), X(xs + t / 2), "1,25 (*)", ext=Y(-3), c=OR)
llamada(h, X(-.6), Y(3.6), X(-10), Y(7.5), "UÑA (TRINQUETE)", sz=9, anc="end")
llamada(h, X(xs - t / 2 - .2), Y(-1.5), X(-8), Y(-3.5), "DENTADO DE LA COLA", sz=9, anc="end")
llamada(h, X(1.6), Y(7.6), X(5.5), Y(8.8), "COLA (SALE POR ARRIBA)", sz=9)
llamada(h, X(4), Y(3), X(8.5), Y(1.5), "CABEZA", sz=9)
h.path(f"M{X(xs + 3.2)},{Y(-1)} V{Y(3)}", "none", OR, 1.6); h.path(f"M{X(xs + 3.2) - 4},{Y(3) + 7} l4,-8 l4,8", OR, OR, .5); h.txt(X(xs + 3.6), Y(1), "TIRA", 9, 700, OR)

# =============== 3. TORNILLO + FISHER EN LA PARED ===============
subt(h, 450, 240, "TORNILLO + FISHER N° 8 EN LA PARED", "ESC. 2:1 · MEDIO CORTE · SOPORTE 4033 APRETADO")
k3 = 3.2; fx, fy = 470, 385
def FX(y): return fx + (y + 8) * k3
def FY(r): return fy - r * k3
h.rect(FX(0), FY(25), 15 * k3, 50 * k3, "url(#MORT)", K, 1.0); h.rect(FX(15), FY(25), 47 * k3, 50 * k3, "url(#LAD)", K, 1.0)
h.rect(FX(0), FY(F["d"] / 2), F["prof"] * k3, F["d"] * k3, "#fff", K, .8)
h.rect(FX(-1.2), FY(9), 1.2 * k3, 34 * k3, "url(#MET)", K, .9)
for s in (1, -1):
    h.path(f"M{FX(1)},{FY(s * (F['d'] / 2 - .15))} H{FX(F['L'] + 1)} V{FY(s * 2.7)} H{FX(11)} V{FY(s * 2.55)} H{FX(1)} Z", "url(#PLAS)", K, .9)
h.path(f"M{FX(-1.2)},{FY(4.75)} L{FX(-4)},{FY(4.75)} L{FX(-4)},{FY(-4.75)} L{FX(-1.2)},{FY(-4.75)} Z", "url(#MET)", K, .9)
h.rect(FX(-1.2), FY(2.5), (F["tornillo"][1] - 6) * k3, 5 * k3, "#fff", K, .9)
for i in range(int((F["tornillo"][1] - 6) / 2.2)): xx = FX(-1.2 + i * 2.2); h.ln(xx, FY(2.5), xx + 1.1 * k3, FY(-2.5), K, .5)
h.path(f"M{FX(F['tornillo'][1] - 7.2)},{FY(2.5)} L{FX(F['tornillo'][1] - 1)},{FY(0)} L{FX(F['tornillo'][1] - 7.2)},{FY(-2.5)}", "#fff", K, .9)
h.dimH(FY(25) - 12, FX(0), FX(F["prof"]), "50 (TALADRO)", ext=FY(F["d"] / 2))
h.dimH(FY(-25) + 14, FX(1), FX(F["L"] + 1), "40 (TACO)", ext=FY(-F["d"] / 2))
h.dimV(FX(62) + 12, FY(F["d"] / 2), FY(-F["d"] / 2), "Ø8", ext=FX(F["prof"]))
llamada(h, FX(25), FY(3.5), FX(35), FY(18), "PATAS ABIERTAS", sz=9)
llamada(h, FX(8), FY(0), FX(-3), FY(-18), "TORNILLO 5 × 45", sz=9, anc="end")
llamada(h, FX(-1), FY(8), FX(-3), FY(16), "SOPORTE 4033", sz=9, anc="end")
h.txt(FX(2), FY(-25) + 34, "REVOQUE", 8.5, 400, G); h.txt(FX(30), FY(-25) + 34, "LADRILLO", 8.5, 400, G)

# =============== 4. CINTA, ALAMBRE Y PINTURA ===============
subt(h, 40, 490, "CINTA 4021 · ALAMBRE 1001 · PINTURA 9002", "ESC. 1:2 · ROLLO 19 mm × 20 m · ALAMBRE N° 14 ≈ 2 mm (*)")
cx, cy = 110, 590
h.circ(cx, cy, 45, "url(#PLAS2)", K, 1.2); h.circ(cx, cy, 27, "#fff", K, 1.0); h.circ(cx, cy, 24, "none", K, .5)
h.dimH(cy + 60, cx - 45, cx + 45, "≈ Ø90 (*)", ext=cy, c=OR); h.txt(cx, cy - 56, "4021 · 19 × 20 m", 9, 700, K, "middle")
h.rect(cx + 80, cy - 45, 19 * 1.2, 90, "url(#PLAS2)", K, 1.0); h.dimH(cy + 60, cx + 80, cx + 80 + 19 * 1.2, "19", ext=cy + 45)
ax = 300
for i in range(6): h.circ(ax, cy, 40 + i * 2.2, "none", K, 1.0)
h.txt(ax, cy - 56, "1001 · ALAMBRE (kg)", 9, 700, K, "middle"); h.txt(ax, cy + 66, "N° 14 ≈ 2,03 · ≈ 25 g/m (*)", 9, 400, OR, "middle")
lx = 410
h.rect(lx, cy - 40, 80, 80, "#fff", K, 1.1); h.rect(lx - 2, cy - 43, 84, 4, "#fff", K, .8); h.rect(lx + 8, cy - 22, 64, 40, "none", K, .5)
h.txt(lx + 40, cy - 56, "9002 · PINTURA GRIS", 9, 700, K, "middle"); h.txt(lx + 40, cy + 56, "ENVASE (*)", 9, 400, OR, "middle")
bloque(h, 540, 520, "ATADURA EN EL AISLADOR", [
    "2 m DE ALAMBRE POR ATADURA (MN 16 / MN 17)",
    "N° 14 GALVANIZADO ≈ 25 g/m → ≈ 0,05 kg POR AISLADOR (*)",
    "CALCULADO POR VUELTAS: NO HAY DATO PUBLICADO (*)"], w=300, sz=9.5, lh=13)

# =============== TABLAS Y NOTAS ===============
EX = {4029: "200 × 4,5", 4030: "250 × 4,5 · NEGRO", 4021: "19 mm × 20 m", 4033: "MEDIDA (*)", 4035: "N° 8 · 5 × 45", 1001: "≈ 25 g/m (*)", 9002: "ENVASE (*)"}
yt = tablaCod(h, 40, 690, [4029, 4030, 4021, 4033, 4035, 1001, 9002], EX, w=800, rowh=14.5, tit_extra="MEDIDA", wext=150)
cols = [(250, "l", False), (180, "c", False), (370, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"], ["PRECINTO: RESISTENCIA", "225 N (REF.)", "HELLERMANNTYTON T50R 200 × 4,6, PA 66"],
       ["PRECINTO: TEMPERATURA", "−40 A 85 °C (REF.)", "T50R · EL NEGRO (4030) PARA SOL (*)"],
       ["FISHER N° 8", "BROCA 8 · TALADRO 50", "FISCHER SX 8 × 40 · TORNILLO 4,5 A 6"]]
yt = tablaG(h, 40, yt + 18, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
notasW(h, 40, yt + 18, [
    "DATOS: FICHA DE LA APP (PRECINTOS NYLON 66 DE 200 Y 250 × 4,5; CINTA PVC 19 mm × 20 m) Y CLAUDE.md §11.3 (ALAMBRE: 2 m POR ATADURA).",
    "(*) 4029 FIGURA EN EL CATALOGO EN «m» Y 4030 EN «Un.»: CONFIRMAR LA UNIDAD. FORMA DE LA CABEZA Y UÑA: PROPORCIONAL A T50R.",
    "(*) MEDIDAS DEL SOPORTE 4033, DEL ROLLO DE CINTA, ENVASE Y COLOR DE LA PINTURA GRIS, PESO DEL ALAMBRE: A CONFIRMAR. FUENTES: r3d/FUENTES_civil.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - PRECINTO CORTADO POR LA CABEZA", "LA UÑA ENGANCHA EL DENTADO · CERRADO SOBRE UN MAZO DE 3 CABLES (CORTADOS)")
A = img3d(h, "civil_precinto", 884, 90, 380)
columna(h, A, [("cola", "1", "COLA DENTADA"), ("una", "2", "UÑA (TRINQUETE)"), ("cabeza", "3", "CABEZA"), ("ranura", "", "RANURA"), ("dientes", "", "DIENTES"),
               ("corte", "", "CARA DE CORTE"), ("banda", "4", "BANDA"), ("mazo", "", "MAZO DE CABLES")], 1290, 110, 420, paso=28)
h.txt(890, 450, "TORNILLO + FISHER N° 8 EN MEDIO CORTE", 11, 700, NV, "start", INT)
A2 = img3d(h, "civil_fisher", 884, 458, 380)
columna(h, A2, [("cabeza", "5", "TORNILLO 5 × 45"), ("soporte", "6", "SOPORTE 4033"), ("taco", "7", "FISHER N° 8"), ("patas", "", "PATAS ABIERTAS"),
                ("revoque", "", "REVOQUE"), ("ladrillo", "", "LADRILLO"), ("agujero", "", "FONDO DEL TALADRO")], 1290, 478, 740, paso=28)
h.txt(890, 790, "PRECINTOS, CINTA, ALAMBRE, TORNILLO, FISHER Y PINTURA", 11, 700, NV, "start", INT)
A3 = img3d(h, "civil_fijacion", 1150, 795, 330)
columna(h, A3, [("p200", "", "4029 PRECINTO 200"), ("p250", "", "4030 PRECINTO 250"), ("cinta", "", "4021 CINTA"), ("alambre", "", "1001 ALAMBRE"), ("lata", "", "9002 PINTURA"), ("fisher", "", "4035 TORNILLO + FISHER")], 1110, 820, 1000, lado="izq", paso=28)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_precinto.mjs, civil_fisher.mjs, civil_fijacion.mjs). FUENTES: r3d/FUENTES_civil.md")
rotuloMat(h, "MAT-FIJACION-1", "PRECINTOS, CINTA, TORNILLOS,", "ALAMBRE Y PINTURA", "VISTAS, CORTE A-A, FISHER, COMPUTO Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha=FECHA)
guardarC(h, "mat_fijacion_1")
