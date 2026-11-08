"""MAT-FUSIBLES-2 (rev. B) · Base 8×31 (3002), borne seccionable 5×20 (3003), fusibles 8,5×31,5 (3014/3015) y Neozed D01 (3018/3019).
Plano con los perfiles de r3d/piezas/perfiles.mjs (BASE831, B520, F85x315, F5x20, NEOZED); 3D: r3d/out/base_borne.png y fus_chicos.png.
Datos: FICHAS_TEC.fusibles pieza 2 (3002 base 8×31 1 polo DIN 25 A; 3014/3015 8,5×31,5 2 A / 4 A; Neozed D01 E14 2–16 A; 3003 borne
seccionable 5×20 cable 4 mm²; IEC 60269; Legrand 005806), CLAUDE.md §11.3, AP-CC-014. Fuentes: r3d/FUENTES.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fuskit import *

T, F, F5, NZ, B5 = PERF["BASE831"], PERF["F85x315"], PERF["F5x20"], PERF["NEOZED"], PERF["B520"]
h = nueva2()
e = 2.6; OY = 372

# =============== 1. BASE 3002 · FRENTE Y CORTE A-A ===============
h.titulo(40, 62, "BASE 8 x 31 (3002)", "FRENTE Y CORTE A-A · ESC. 2,6:1")
X, Z = portaFrente(h, 64, OY - T["H"] * e, e, T, "8x31")
h.dimH(OY + 40, X(0), X(T["W"]), "17,5 (*)", ext=OY + 2, c=OR)
h.dimV(X(0) - 12, Z(T["H"]), Z(0), "80 (*)", ext=X(0) - 2, c=OR)
lineaCorte(h, X(T["W"] / 2), Z(T["H"]) - 20, X(T["W"] / 2), Z(0) + 20, "A")
vc = Vista(h, 164, OY, e)
portaCorte(vc, T, F)
vc.cotaH(0, T["D"], -14, "60 (*)", zext=0, c=OR)
vc.cotaV(T["D"] + 6, T["fus"]["z0"], T["fus"]["z1"], "31,5", yext=T["fus"]["y"] + 4.5)
for n, (y, z), (gx, gy) in [("1", (12, 40), (150, 112)), ("2", (T["D"] - 2.5, T["zM"] - 8), (352, 300)), ("3", (T["fus"]["y"], T["zM"] + 4), (352, 150)),
                            ("4", (27.5, T["H"] - 8), (352, 112)), ("5", (T["Dr"] + 2, T["pinza"]["zS"] + 2), (352, 188)), ("6", (-4, T["zM"] + 10), (150, 400))]:
    h.globo(n, *vc.p(y, z), gx, gy, r=9)

# =============== 2. BORNE 5×20 (3003) · CORTE Y PALANCA ABIERTA ===============
vb = Vista(h, 430, OY - 20, e)
h.titulo(420, 62, "BORNE SECCIONABLE 5 x 20 (3003)", "CORTE POR EL MEDIO · ESC. 2,6:1 · PALANCA ABIERTA EN PUNTOS")
vb.seccion(PERF["SECC"]["b520"], "PLAS")
vb.poly([[B5["rielY0"] + u, w - 7.5] for u, w in PERF["NS35"]["perfil"]], "url(#MET)", .9)
for y in B5["yT"]:
    vb.rect(y - 4.4, y + 4.4, 6, 21, "url(#MET)", .9); vb.rect(y - 3.4, y + 3.4, 7, 20, "#fff", .6)
    tornilloCorte(vb, y, 23.6, 7, 2.6, 4, 4.6)
vb.rect(4.5, 28, 15.5, 17.5, "url(#CU)", .8); vb.rect(44.5, B5["C"] - 4.5, 15.5, 17.5, "url(#CU)", .8)
for y in (26.5, 46): vb.rect(y - .6, y + .6, 17.5, 36.5, "url(#CU)", .7)
vb.seccion([[B5["palanca"] + [B5["palanca"][0]]]], "PLAS2", 1.2)
fy0, fy1, fz = B5["fus"]["y0"], B5["fus"]["y1"], B5["fus"]["z"]
vb.rect(fy0 + 4.5, fy1 - 4.5, fz - 2.5, fz + 2.5, "url(#VID)", .8)
for y0_ in (fy0, fy1 - 4.5): vb.rect(y0_, y0_ + 4.5, fz - 2.6, fz + 2.6, "url(#CU)", .8)
vb.linea([[fy0 + 4.5, fz], [fy1 - 4.5, fz]], .6)
vb.oculta(B5["palancaAbierta"] + [B5["palancaAbierta"][0]], .6)
vb.circ(*B5["pivote"], 1.1, "#fff", .8)
vb.cotaH(0, B5["C"], -14, "72,5", zext=-.5)
vb.cotaH(fy0, fy1, 52, "20", zext=fz + 3)
vb.cotaV(-6, 0, B5["A"], "47 (*)", yext=1, c=OR)
for n, (y, z), (gx, gy) in [("7", (40, 46), (720, 112)), ("8", (36, fz), (720, 150)), ("9", (B5["yT"][1], 22.5), (720, 300)), ("6", (30, -7), (560, 420))]:
    h.globo(n, *vb.p(y, z), gx, gy, r=9)

# =============== 3. D1 · FUSIBLE 8,5 × 31,5 EN CORTE ===============
class Vh(Vista):
    def p(s, y, z): return (s.ox + z * s.e, s.oy - y * s.e)
k = 4.0
h.titulo(40, 460, "D1 - FUSIBLE 8,5 x 31,5", "ESC. 4:1 · CERAMICO · 3014 / 3015")
v1 = Vh(h, 60, 545, k); fusibleLong(v1, F, 0, 0)
h.dimH(545 + F["D"] / 2 * k + 16, 60, 60 + F["L"] * k, "31,5", ext=545 + F["D"] / 2 * k + 2)
h.dimV(60 + F["L"] * k + 16, 545 - F["D"] / 2 * k, 545 + F["D"] / 2 * k, "Ø8,5", ext=60 + F["L"] * k + 2)
h.dimH(545 - F["D"] / 2 * k - 12, 60, 60 + F["cap"] * k, "", ext=545 - F["D"] / 2 * k - 2); h.txt(60 + F["cap"] * k / 2, 545 - F["D"] / 2 * k - 18, "6,3 (*)", 9.5, 400, OR, "middle")
# =============== 4. D2 · FUSIBLE 5×20 DE VIDRIO ===============
k2 = 5.0
h.titulo(260, 460, "D2 - FUSIBLE 5 x 20", "ESC. 5:1 · VIDRIO · BORNE 3003")
x0, yc = 280, 545; L, D, cap = F5["L"], F5["D"], F5["cap"]
h.rect(x0 + cap * k2, yc - F5["tubo"] / 2 * k2, (L - 2 * cap) * k2, F5["tubo"] * k2, "url(#VID)", K, .9)
for xx in (x0, x0 + (L - cap) * k2): h.rect(xx, yc - D / 2 * k2, cap * k2, D * k2, "url(#CU)", K, 1.0)
h.ln(x0 + 1, yc, x0 + L * k2 - 1, yc, K, .9); h.rect(x0 + L * k2 / 2 - 3, yc - 1.5, 6, 3, "#777", K, .4)
h.ln(x0 - 8, yc, x0 + L * k2 + 8, yc, K, .4, h.EJE)
h.dimH(yc + D / 2 * k2 + 16, x0, x0 + L * k2, "20", ext=yc + D / 2 * k2 + 2)
h.dimV(x0 + L * k2 + 16, yc - D / 2 * k2, yc + D / 2 * k2, "Ø5,2", ext=x0 + L * k2 + 2)
h.txt(x0, yc - D / 2 * k2 - 12, "CASQUILLO 4,5 (*) · TIPO Y AMPERAJE (*)", 9, 400, OR)
# =============== 5. D3 · NEOZED D01 (medio corte) ===============
k3 = 3.6; cx, zb = 650, 640
h.titulo(560, 460, "D3 - NEOZED D01", "ESC. 3,6:1 · MEDIO CORTE · E14")
Pn = lambda r, t: (cx + r * k3, zb - t * k3)
def lado(pts, s=1): return [(cx + s * r * k3, zb - t * k3) for r, t in pts]
cuerpo = [[5.0, 6.0], [5.5, 6.6], [5.5, 30.6], [5.0, 31.2]]
pie = [[3.0, 0], [3.0, 6.0]]; cab = [[4.95, 31.0], [4.95, 32.8], [4.5, 36]]
der = [[0, 0]] + pie + cuerpo + cab + [[0, 36]]
h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in lado(der)) + " Z", "#fff", K, 1.4)
izq = [[0, 0], [3.0, 0], [3.0, 6.0], [5.0, 6.0], [5.5, 6.6], [5.5, 30.6], [5.0, 31.2], [4.95, 31.0], [4.95, 32.8], [4.5, 36], [0, 36]]
h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in lado(izq, -1)) + " Z", "url(#CER)", K, 1.4)
h.rect(cx - 3.4 * k3, zb - 30 * k3, 3.4 * k3, 23 * k3, "url(#ARE)", K, .6)
h.rect(cx - 3.0 * k3, zb - 6 * k3, 3.0 * k3, 6 * k3, "url(#CU)", K, .8); h.rect(cx - 4.95 * k3, zb - 36 * k3, 4.95 * k3, 5 * k3, "url(#CU)", K, .8)
h.rect(cx - .5, zb - 31 * k3, 1, 25 * k3, "#222", K, .3)
h.rect(cx - 2.2 * k3, zb - 36.3 * k3, 4.4 * k3, .3 * k3 + 1, "#fff", K, .8)
h.ln(cx, zb + 8, cx, zb - 36 * k3 - 10, K, .4, h.EJE)
h.dimV(cx + 5.5 * k3 + 14, zb - 36 * k3, zb, "36", ext=cx + 5.5 * k3)
h.dimH(zb + 14, cx - 5.5 * k3, cx + 5.5 * k3, "Ø11", ext=zb - 7 * k3)
h.dimH(zb - 36 * k3 - 12, cx - 4.95 * k3, cx + 4.95 * k3, "", ext=zb - 36 * k3)
llamada(h, cx + 1.5 * k3, zb - 36 * k3 - 1, cx + 40, zb - 36 * k3 + 10, "INDICADOR DE COLOR", sz=8.5)
llamada(h, cx + 3 * k3, zb - 3 * k3, cx + 34, zb - 3 * k3 + 6, "PIE DE CONTACTO (*)", sz=8.5)
for t, c_, i in (("2 A ROSA", NZ["colores"]["2"], 0), ("6 A VERDE", NZ["colores"]["6"], 1)):
    h.rect(760, 520 + i * 22, 14, 14, c_, K, .6); h.txt(780, 532 + i * 22, t, 9, 700)

# =============== TABLAS ===============
TY = 672
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO (FICHA)"]]
dd = {"3002": "25 A · 1 POLO DIN", "3014": "2 A", "3015": "4 A", "3018": "NEOZED D01 · 2 A", "3019": "NEOZED D01 · 6 A", "3003": "CABLE 4 mm²"}
for c in (3002, 3014, 3015, 3018, 3019, 3003):
    r = cat(c, 54); filas.append([r[0], r[1], r[2], dd[str(c)]])
yt = h.tabla(40, TY, [(52, "c", True), (370, "l", False), (40, "c", False), (140, "l", False)], filas, rowh=15, titulo="CODIGOS DEL PAÑOL (6)", colores=colorOR)
rayadosRef(h, 660, TY, ["PLAS", "CU", "MET", "CER", "ARE", "VID"], cols=1, dx=200)
ydat = bloque(h, 40, yt + 22, "DATOS TECNICOS", [
    "FUSIBLES CHICOS PARA CIRCUITOS DE COMANDO Y PROTECCION DEL FOTOCONTROL.",
    "8,5 x 31,5: CERAMICO, 2 A Y 4 A. BASE 3002: 8 x 31, 1 POLO DIN, 25 A (LEGRAND 005806).",
    "NEOZED D01: ROSCA E14, DE 2 A 16 A (IEC 60269-3). LARGO 36, Ø11 (MERSEN).",
    "BORNE 3003: PORTAFUSIBLE SECCIONABLE 5 x 20, CABLE DE 4 mm²."], w=390, sz=10, lh=13.5)
yu = bloque(h, 450, yt + 22, "DONDE SE USA", [
    "TABLERO: COMANDO Y FOTOCONTROL.",
    "AP-CC-014 (HOJA A): 3 BASES BMF 8,5 x 31,5 CON FUSIBLE CERAMICO DE 4 A, UNA POR FASE (PLANO OFICIAL).",
    "EN LA CAJA DE COLUMNA PRFV SE USA LA TABAQUERA 10 x 38 (MAT-FUSIBLES-1)."], w=390, sz=10, lh=13.5)
notasW(h, 40, max(ydat, yu) + 10, [
    "COTAS EN mm. Ø8,5 x 31,5 Y Ø5 x 20: DESCRIPCION DEL PAÑOL / FICHA. NEOZED D01 36 x Ø11: FICHA MERSEN (TABLA a / b).",
    "EL 3014 (8,5 x 31,5) NO ENTRA EN LA TABAQUERA 10 x 38 (3053): NO MEZCLARLOS.",
    "(*) BASE 3002: 1 MODULO 17,5 (UNIPOLAR), ALTO 80 Y PROFUNDIDAD 60: A CONFIRMAR CON LEGRAND 005806. SE DIBUJA CON EL MISMO CARRO QUE LA TABAQUERA.",
    "(*) BORNE 3003: PASO 8,2 Y LARGO 72,5 COMO PHOENIX UK 5-HESI; ALTO, PALANCA Y COLOR: A CONFIRMAR.",
    "(*) CASQUILLOS, PIE DEL NEOZED Y ESCALONES: ESQUEMATICOS. COLOR DEL INDICADOR SEGUN AMPERAJE (DIN VDE 0636-3): 2 A ROSA · 6 A VERDE.",
    "(*) AP-CC-014 PIDE 8,5 x 31,5 CON 4 A POR FASE; LA OBRA 2026 USA 10 x 38 CON 2 A POR ARTEFACTO (CLAUDE.md §11.3)."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - BASE 8 x 31 Y BORNE SECCIONABLE 5 x 20", "LA BASE CORTADA A CUARTO; EL BORNE 5 x 20 CON LA PALANCA ABIERTA (FUSIBLE DE VIDRIO A LA VISTA)")
A = img3d(h, "base_borne", 900, 84, 560)
columna(h, A, [("base", "1", "BASE 8x31 (3002)"), ("carro", "2", "CARRO"), ("fus85", "3", "FUSIBLE 8,5x31,5"), ("jaula", "4", "JAULA"),
               ("pinza", "5", "PINZA"), ("riel", "6", "RIEL NS35 (2038)"), ("palanca", "7", "PALANCA"), ("vidrio", "8", "FUSIBLE 5x20 (*)"), ("b520", "9", "BORNE 3003")], 1480, 110, 540, paso=26)
h.txt(890, 590, "FUSIBLES SUELTOS: 8,5 x 31,5 (CORTADO Y ENTERO), 5 x 20 DE VIDRIO, NEOZED D01 2 A Y 6 A", 11, 700, NV, "start", INT)
A2 = img3d(h, "fus_chicos", 900, 600, 540)
columna(h, A2, [("f85", "3", "8,5x31,5 EN CORTE"), ("f85b", "", "4 A (3015)"), ("f520", "8", "5x20 VIDRIO (*)"), ("neo2", "", "NEOZED D01 2 A (3018)"),
                ("neo6", "", "NEOZED D01 6 A (3019)"), ("neoPie", "", "PIE DE CONTACTO")], 1470, 620, 880)
h.txt(890, 1012, "RENDER: three.js (r3d/escenas/base_borne.mjs, fus_chicos.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-FUSIBLES-2", "BASE 8 x 31, BORNE 5 x 20,", "FUSIBLES 8,5 x 31,5 Y NEOZED", "VISTAS, CORTES, DETALLES D1 A D3 Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_fusibles_2.svg"))
