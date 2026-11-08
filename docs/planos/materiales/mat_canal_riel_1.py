"""MAT-CANAL_RIEL-1 (rev. B) · Riel DIN NS35 × 7,5 (EN 60715), código 2038.
Plano y 3D con los mismos números: r3d/piezas/perfiles_conex.mjs (NS, perfilNS). 3D: r3d/out/conex_riel.png (bornes BPN de r3d/piezas/bpn.mjs).
Datos: FICHAS_TEC.canal_riel (acero cincado 1 mm; 35 × 7,5, también 15; ranuras 6,2 × 15 cada 25), Phoenix NS 35/7,5 (1207640: 35 · 27 · 1 · 7,5 · 6,2 · 25 · 15),
Weidmüller TS 35 (chapa 1 mm, DIN EN 60715), AP-PL-002 (14 cm por caja + 2 tornillos cabeza tanque 6 × 3/8), AP-T-002 (4 barras de 50 cm), catálogo 2038."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conexkit import *

h = nueva3()
N = PC["NS"]; W, H, t, b = N["W"], N["H"], N["t"], N["b"]; a = (W - b) / 2; PER = PC["NSPERFIL"]; RA = N["ranura"]

# ================= 1. CORTE A-A · PERFIL NS35 x 7,5 · ESC. 12:1 =================
e = 12; v = Vista(h, 70, 236, e)
h.titulo(40, 62, "CORTE A-A - PERFIL NS35 x 7,5", "EN 60715 · ESC. 12:1 · CHAPA DE ACERO CINCADO 1,0 · CON LOS PLIEGUES")
v.poly(PER, "url(#MET)", 1.2)
v.eje(W / 2, -2.5, W / 2, H + 2.5)
v.cotaH(0, W, H + 2.4, "35", zext=H + .2)
v.cotaH(a, W - a, -2.4, "27", zext=-.2)
v.cotaH(a + t, W - a - t, -5.0, "25", zext=t - .1)
v.cotaV(W + 2.6, 0, H, "7,5", yext=W)
v.cotaV(-1.8, H - t, H, "", yext=0); h.txt(*v.p(-2.6, H - .2), "1,0", 10.5, 400, K, "end")
cx_, cy_ = v.p(a + .5, .6); h.llamadaDet(cx_, cy_, 34, "D1")
for n, (y, z), (gx, gy) in [("1", (2, H - .5), (48, 150)), ("2", (a + .5, H / 2), (40, 262)), ("3", (W / 2 + 6, .5), (560, 270))]:
    a_ = v.p(y, z); h.globo(n, a_[0], a_[1], gx, gy, r=9)
h.txt(40, 320, "1 ALA (AHI ENGANCHA EL APARATO) · 2 ALMA · 3 FONDO CON LAS RANURAS", 9.5, 400, G)

# ================= 2. D1 · PLIEGUE · ESC. 40:1 =================
e1 = 34; d = Vista(h, 520, 236, e1)
h.titulo(600, 62, "D1 - PLIEGUE", "ESC. 34:1 · RADIOS (*)")
x1, y1 = d.p(a - 1.4, 3.0); x2, y2 = d.p(a + 4.0, -.6)
h.a(f'<clipPath id="cpNS"><rect x="{x1}" y="{y1}" width="{x2-x1}" height="{y2-y1}"/></clipPath><g clip-path="url(#cpNS)">')
d.poly(PER, "url(#MET)", 1.2)
h.a('</g>'); h.rect(x1, y1, x2 - x1, y2 - y1, "none", K, .7)
cx, cz = a + N["rP"] + t, N["rP"] + t
llamada(h, *d.p(a + .3, .3), 610, 280, "R EXT. 1,8 (*)", OR, sz=9.5)
llamada(h, *d.p(a + t + .25, t + .25), 720, 280, "R INT. 0,8 (*)", OR, sz=9.5)
d.cotaV(a - .8, 0, t, "", yext=a + 2); h.txt(*d.p(a - 1.1, .3), "1,0", 10, 400, K, "end")

# ================= 3. VISTA DE ARRIBA · TRAMO DE UNA CAJA · ESC. 3:1 =================
e2 = 2.85; X2, Y2 = 60, 352
h.titulo(40, 346, "VISTA DE ARRIBA - RANURAS", "ESC. 3:1 · TRAMO DE 140 mm (UNA CAJA DE COLUMNA, AP-PL-002)")
L = 140
def P(x, y): return (X2 + x * e2, Y2 + 30 + y * e2)
h.rect(*P(0, 0), L * e2, W * e2, "#fff", K, 1.4)
for y in (a, a + t + .8, W - a - t - .8, W - a): h.ln(*P(0, y), *P(L, y), K, .5 if y in (a, W - a) else .35, h.OCULTA if y not in (a, W - a) else "")
xs = []
for i in range(5):
    xc = 20 + i * RA["paso"]; xs.append(xc); x0_, y0_ = P(xc - RA["L"] / 2, W / 2 - RA["A"] / 2)
    h.rect(x0_, y0_, RA["L"] * e2, RA["A"] * e2, "#fff", K, .9, f'rx="{RA["A"] / 2 * e2:.1f}"'); h.ln(*P(xc, -2), *P(xc, W + 2), K, .4, h.EJE)
h.ln(*P(-3, W / 2), *P(L + 3, W / 2), K, .4, h.EJE)
for xc in (20, 120):
    cx2, cy2 = P(xc, W / 2); h.circ(cx2, cy2, 3.6 * e2, "#fff", K, 1.0); h.ln(cx2 - 6, cy2, cx2 + 6, cy2, K, 1); h.ln(cx2, cy2 - 6, cx2, cy2 + 6, K, 1)
h.dimH(P(0, 0)[1] - 12, P(xs[1], 0)[0], P(xs[2], 0)[0], "25", ext=P(0, 0)[1] - 4)
h.dimH(P(0, W)[1] + 16, P(xs[2] - RA["L"] / 2, 0)[0], P(xs[2] + RA["L"] / 2, 0)[0], "15", ext=P(0, W / 2 + RA["A"] / 2)[1])
h.dimV(P(L, 0)[0] + 16, P(0, W / 2 - RA["A"] / 2)[1], P(0, W / 2 + RA["A"] / 2)[1], "6,2", ext=P(L, 0)[0])
h.dimH(P(0, W)[1] + 38, P(0, 0)[0], P(L, 0)[0], "140 POR CAJA (AP-PL-002)", ext=P(0, W)[1])
h.dimV(P(0, 0)[0] - 14, P(0, 0)[1], P(0, W)[1], "35", ext=P(0, 0)[0])
xa_ = P(8, 0)[0]; lineaCorte(h, xa_, P(0, -3)[1], xa_, P(0, W + 3)[1], "A")
llamada(h, *P(120, W / 2 + 2.5), 470, P(0, W)[1] + 58, "TORNILLO 6 x 3/8 (2 POR CAJA)", sz=9)
llamada(h, *P(xs[1] + 5, W / 2), P(L, 0)[0] + 30, P(0, 0)[1] + 8, "RANURA OBLONGA", sz=9)

# ================= 4. VARIANTE NS35 x 15 · ESC. 4:1 =================
k = 4; X4, Y4 = 640, 380
h.titulo(600, 318 - 4, "VARIANTE NS35 x 15", "ESC. 4:1 · EN EL PAÑOL: LA DE 7,5")
q = [(0, 0), (5, 0), (5, 14), (30, 14), (30, 0), (35, 0), (35, 1), (31, 1), (31, 15), (4, 15), (4, 1), (0, 1)]
h.path("M" + " L".join(f"{X4 + a_ * k:.1f},{Y4 + b_ * k:.1f}" for a_, b_ in q) + " Z", "url(#MET)", K, .9)
h.dimH(Y4 - 12, X4, X4 + 35 * k, "35", ext=Y4 - 2)
h.dimV(X4 + 35 * k + 16, Y4, Y4 + 15 * k, "15", ext=X4 + 31 * k + 2)

# ================= 5. D2 · COMO ENGANCHA UN APARATO · ESC. 3:1 =================
k5 = 4.2; X5, Y5 = 630, 590
h.titulo(600, 470, "D2 - COMO ENGANCHA", "GANCHO DE UN LADO, TRABA DEL OTRO")
h.path("M" + " L".join(f"{X5 + y * k5:.1f},{Y5 - z * k5:.1f}" for y, z in PER) + " Z", "url(#MET)", K, .8)
h.path(f"M{X5 - 3*k5:.1f},{Y5 - 7.5*k5 - 2:.1f} H{X5 + 38*k5:.1f} V{Y5 - 7.5*k5 - 46:.1f} H{X5 - 3*k5:.1f} Z", "#fff", K, 1.0)
h.path(f"M{X5 - 1.2*k5:.1f},{Y5 - 7.5*k5 - 2:.1f} v{1.6*k5:.1f} h{3.4*k5:.1f}", "none", K, 1.6)
h.path(f"M{X5 + 36.2*k5:.1f},{Y5 - 7.5*k5 - 2:.1f} v{1.6*k5:.1f} h{-3.4*k5:.1f}", "none", K, 1.6)
h.path(f"M{X5 + 33*k5:.1f},{Y5 - 7.5*k5 + 3:.1f} l14,10", "none", K, 1, h.OCULTA)
h.txt(X5 + 17.5 * k5, Y5 - 7.5 * k5 - 20, "APARATO / BORNE", 9, 700, K, "middle")
h.txt(X5 - 8, Y5 + 16, "GANCHO", 9, 400); h.txt(X5 + 38 * k5, Y5 + 30, "TRABA CON RESORTE", 9, 400, K, "end")

# ================= TABLAS =================
TY = 640
fc = [["DONDE", "RIEL", "CALCULO"], ["CAJA COL. (AP-PL-002)", "140 mm", "+ 2 TORN. 6 x 3/8"], ["TABLERO (AP-T-002)", "2,00 m", "4 x 50 cm"], ["TABLERITO PRFV", "≤ 80 (*)", "1 POR TABLERITO (*)"]]
yc = h.tabla(40, TY, [(150, "l", False), (80, "c", True), (150, "l", False)], fc, rowh=15, titulo="COMPUTO (CALCULADORA DE LA APP)", colores=colorOR)
fn = [["MEDIDA", "VALOR", "FUENTE"], ["ANCHO / ALTO", "35 / 7,5", "EN 60715 · FICHA APP"], ["ENTRE CARAS DEL CANAL", "27 (25 POR DENTRO)", "PHOENIX 1207640"],
      ["CHAPA", "1,0 ACERO CINCADO", "FICHA APP · WEIDMULLER"], ["RANURA / PASO", "15 x 6,2 / 25", "FICHA APP · PHOENIX"], ["RADIOS DE PLIEGUE", "0,8 / 1,8 (*)", "A CONFIRMAR"]]
yn = h.tabla(430, TY, [(140, "l", False), (124, "c", True), (150, "l", False)], fn, rowh=15, titulo="MEDIDAS Y FUENTES", colores=colorOR)
fcod = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "NOTA"], cat(2038) + ["35 x 7,5 · TIRA (*)"],
        cat(2059) + ["TOPE (MAT-BORNERAS-1)"], cat(2021, 48) + ["TAPA FINAL (*)"], cat(2042, 48) + ["(*) SIN FICHA"]]
ycd = h.tabla(40, max(yc, yn) + 24, [(52, "c", True), (420, "l", False), (34, "c", False), (220, "l", False)], fcod, rowh=15, titulo="CODIGOS DEL PAÑOL (RIEL Y ACCESORIOS)", colores=colorOR)
yr = rayados3(h, 40, ycd + 20, ["MET"], cols=1)
bloque(h, 300, ycd + 20, "DATOS TECNICOS", ["RIEL EN 60715 (EX DIN 46277-3), PERFIL «SOMBRERO» NS35 (TH35-7,5).", "TIRAS DE 1 o 2 m: CUAL ES LA DEL PAÑOL (*)."], w=520, sz=10, lh=13.5)
notasW(h, 40, ycd + 80, [
    "COTAS EN mm: FICHA DE LA APP (EN 60715) Y HOJA DE PHOENIX NS 35/7,5 (35 · 27 · 1 · 7,5 · 6,2 · 25 · 15). LA NORMA NO SE PUDO VER: TOLERANCIAS (*).",
    "(*) RADIOS DE LOS PLIEGUES, LARGO DE LA TIRA DEL PAÑOL Y LARGO DEL TRAMO EN EL TABLERITO PRFV: A CONFIRMAR.",
    "EL CATALOGO LO TIENE EN «Un.» Y LA CALCULADORA LO PIDE EN «m» (0,14 m POR CAJA): CONFIRMAR SI LA «Un.» ES LA TIRA ENTERA (*).",
    "2021 «EXTREMO BORNERA BAJO» Y 2042 «SOPORTE ADAPTADOR DE 1 MODULO» VAN EN EL RIEL: NO HAY FICHA DE NINGUNO (*)."], w=800, lh=13.5)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - RIEL NS35 CON SUS RANURAS", "TRAMO DE 140 mm · 2 TORNILLOS CABEZA TANQUE · TOPE 2059 Y DOS BORNES BPN-06 ENGANCHADOS")
A = img3d(h, "conex_riel", 880, 84, 640)
columna(h, A, [("borne", "", "BORNE BPN-06"), ("tope", "", "TOPE 2059"), ("extremo", "", "PUNTA DEL RIEL (PERFIL)"), ("ranura", "", "RANURA 15 x 6,2")], 1480, 120, 520, paso=28)
columna(h, A, [("ala", "1", "ALA"), ("pliegue", "", "PLIEGUE (*)"), ("canal", "3", "FONDO"), ("tornillo", "", "TORNILLO 6 x 3/8")], 902, 420, 540, paso=26)
bloque(h, 890, 610, "DONDE SE USA", [
    "CAJA DE COLUMNA PRFV (TC-PRFV-01/02): RIEL HORIZONTAL EN CADA TABLERITO, CON BORNES BPN Y PORTAFUSIBLES.",
    "AP-CC-014: TABLERITO DE COLUMNA METALICA CON RIEL NS35 Y 2 TORNILLOS CABEZA TANQUE 6 x 3/8.",
    "TABLEROS (AP-T-002): RIEL NS35 EN 4 BARRAS DE 50 cm PARA LOS APARATOS MODULARES."], w=740, sz=10, lh=14)
bloque(h, 890, 720, "COMO SE CORTA Y SE FIJA", [
    "CORTAR CON SIERRA O CORTARRIEL, SIN DEFORMAR LAS ALAS; LIMAR LA REBABA.",
    "ATORNILLAR AL FONDO POR LAS RANURAS (2 POR CAJA); EL RIEL QUEDA CON LAS ALAS HACIA AFUERA.",
    "PONER UN TOPE (2059) A CADA LADO DE LA FILA PARA QUE LOS BORNES NO SE CORRAN."], w=740, sz=10, lh=14)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/conex_riel.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES_conex.md", 9.5, 400, G, "start", INT)
rotuloB(h, "MAT-CANAL_RIEL-1", "RIEL DIN NS35", "(EN 60715)", "PERFIL, PLIEGUE, RANURAS, VARIANTE, COMPUTO Y 3D", "12:1 · 3:1", "D1 34:1 · 3D S/E")
guardar(h, "mat_canal_riel_1")
