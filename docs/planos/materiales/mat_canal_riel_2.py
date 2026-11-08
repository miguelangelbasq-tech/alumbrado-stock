"""MAT-CANAL_RIEL-2 (rev. B) · Cable canal ranurado 30 × 30 (5001) y 40 × 30 (5002) con tapa a presión.
Plano y 3D con los mismos números: r3d/piezas/perfiles_conex.mjs (CANAL, seccionCanal, seccionTapa). 3D: r3d/out/conex_canal.png.
Datos: FICHAS_TEC.canal_riel (PVC gris, ranuras laterales, tapa a presión, tiras de 2 m) y descripciones del pañol (30 × 30, 40 × 30).
Pared, ranuras, dedos y enganche de la tapa: (*) proporcionales (referencia: canal con «ranura de 4 mm», Ideal NZ)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conexkit import *

h = nueva3()
C = PC["CANAL"]; Hc = 30; pw, fo, rn, dd, aR = C["pared"], C["fondo"], C["ranura"], C["dedo"], C["alturaRanura"]

def corte(v, Wd, cables=True):
    v.poly(C["sec%d" % Wd], "url(#PLAS2)", 1.1)
    v.poly(C["tapa%d" % Wd], "url(#PLAS2)", 1.1)
    if cables:
        n = 5 if Wd == 40 else 3
        for i in range(n):
            for j in range(2): v.circ(4.6 + i * 7.4, fo + 2.4 + j * 5, 1.83, "#fff", .7)

# ================= 1. CORTE A-A 40 x 30 · ESC. 5:1 =================
e = 5.2; v = Vista(h, 100, 270, e)
h.titulo(40, 62, "CORTE A-A - 40 x 30 (5002)", "PVC GRIS · CON LA TAPA PUESTA · ESC. 5:1")
corte(v, 40)
v.cotaH(0, 40, -3, "40", zext=-.2)
v.cotaV(-4.5, 0, Hc, "30", yext=-1.2)
v.cotaV(-9.5, 0, Hc + C["tapa"]["e"], "31,4 (*)", yext=-2.8, c=OR)
llamada(h, *v.p(40 - pw / 2, 15), *v.p(48, 16), "PARED 1,6 (*)", OR, sz=9)
llamada(h, *v.p(20, fo / 2), *v.p(48, 5), "FONDO 1,8 (*)", OR, sz=9)
llamada(h, *v.p(30, Hc + .7), *v.p(48, Hc + 5), "TAPA A PRESION", sz=9)
cx_, cy_ = v.p(40.4, Hc - 1); h.llamadaDet(cx_, cy_, 22, "")
h.txt(cx_ + 24, cy_ - 16, "D1", 11, 700)

# ================= 2. CORTE 30 x 30 · ESC. 5:1 =================
w = Vista(h, 470, 270, e)
h.titulo(440, 62, "CORTE - 30 x 30 (5001)", "MISMA PARED Y TAPA (*) · ESC. 5:1")
corte(w, 30)
w.cotaH(0, 30, -3, "30", zext=-.2)
w.cotaV(34, 0, Hc, "30", yext=31.2)

# ================= 3. D1 · ENGANCHE DE LA TAPA · ESC. 16:1 =================
e3 = 15; d = Vista(h, 660 - 37.6 * e3, 330 + 32.2 * e3, e3)
h.titulo(640, 300, "D1 - ENGANCHE", "ESC. 15:1 (*)")
x1, y1 = d.p(37.6, Hc + 2.2); x2, y2 = d.p(43.4, Hc - 5.4)
h.a(f'<clipPath id="cpCa"><rect x="{x1}" y="{y1}" width="{x2-x1}" height="{y2-y1}"/></clipPath><g clip-path="url(#cpCa)">')
d.poly(C["sec40"], "url(#PLAS2)", 1.2); d.poly(C["tapa40"], "url(#GOM)" if False else "url(#PLAS)", 1.2)
h.a('</g>'); h.rect(x1, y1, x2 - x1, y2 - y1, "none", K, .7)
llamada(h, *d.p(40.6, Hc - 1.3), x2 + 6, y1 + 40, "LABIO DEL CANAL", sz=9)
llamada(h, *d.p(42.4, Hc - 3), x2 + 6, y1 + 66, "PESTAÑA DE LA TAPA", sz=9)
h.txt(x1, y2 + 14, "LA TAPA SE CALZA A PRESION Y SE SACA", 9, 400); h.txt(x1, y2 + 26, "TIRANDO DE UN COSTADO.", 9, 400)

# ================= 4. VISTA LATERAL · RANURAS · ESC. 2,5:1 =================
e4 = 2.6; X4, Y4 = 70, 470
h.titulo(40, 440, "VISTA LATERAL - RANURAS", "TRAMO DE 150 mm · ESC. 2,5:1 · RANURA, DEDO Y PROFUNDIDAD (*)")
Lt = 150; zr = Hc - aR
def Q(x, z): return (X4 + x * e4, Y4 + 30 + (Hc - z) * e4)
h.rect(*Q(0, Hc), Lt * e4, Hc * e4, "#fff", K, 1.3)
paso = dd + rn; x = 0; xr = []
while x + dd < Lt:
    xa = x + dd; xb = min(xa + rn, Lt)
    if xb - xa > .5:
        xr.append(xa); r_ = rn / 2
        p0 = Q(xa, Hc); p1 = Q(xa, zr + r_); p2 = Q(xb, zr + r_); p3 = Q(xb, Hc)
        h.path(f"M{p0[0]:.1f},{p0[1]:.1f} L{p1[0]:.1f},{p1[1]:.1f} A{r_*e4:.1f},{r_*e4:.1f} 0 0 0 {p2[0]:.1f},{p2[1]:.1f} L{p3[0]:.1f},{p3[1]:.1f}", "#fff", K, .9)
    x += paso
h.ln(*Q(0, Hc - .9), *Q(Lt, Hc - .9), K, .4)
h.dimH(Q(0, Hc)[1] - 12, Q(xr[0], 0)[0], Q(xr[0] + rn, 0)[0], "4,2 (*)", ext=Q(0, Hc)[1] - 2, c=OR)
h.dimH(Q(0, Hc)[1] - 12, Q(xr[2] - dd, 0)[0], Q(xr[2], 0)[0], "6 (*)", ext=Q(0, Hc)[1] - 2, c=OR)
h.dimV(Q(Lt, 0)[0] + 16, Q(0, Hc)[1], Q(0, zr)[1], "21 (*)", ext=Q(Lt, 0)[0], c=OR)
h.dimV(Q(Lt, 0)[0] + 40, Q(0, Hc)[1], Q(0, 0)[1], "30", ext=Q(Lt, 0)[0])
h.dimH(Q(0, 0)[1] + 18, Q(xr[4] - dd, 0)[0], Q(xr[5] - dd, 0)[0], "PASO 10,2 (*)", ext=Q(0, 0)[1], c=OR)
xa_ = Q(140, 0)[0]; lineaCorte(h, xa_, Q(0, Hc + 4)[1], xa_, Q(0, -4)[1], "A")
h.txt(40, Q(0, 0)[1] + 46, "LOS DEDOS SE PUEDEN CORTAR PARA SACAR VARIOS CABLES JUNTOS. LOS CABLES SALEN POR LAS RANURAS SIN CRUZARSE.", 9.5, 400, G)

# ================= TABLAS =================
TY = 720
fc = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "MEDIDAS"], cat(5001) + ["30 x 30 mm · TIRA 2 m (*)"], cat(5002) + ["40 x 30 mm · TIRA 2 m (*)"]]
yt = h.tabla(40, TY, [(52, "c", True), (400, "l", False), (34, "c", False), (220, "l", False)], fc, rowh=15, titulo="CODIGOS DEL PAÑOL (2)", colores=colorOR)
au40 = (40 - 2 * pw) * (Hc - fo); au30 = (30 - 2 * pw) * (Hc - fo)
fu = [["CANAL", "SECCION UTIL (*)", "AL 50 %"], ["40 x 30", f"≈ {au40:.0f} mm²", f"≈ {au40 / 2:.0f} mm²"], ["30 x 30", f"≈ {au30:.0f} mm²", f"≈ {au30 / 2:.0f} mm²"]]
yu = h.tabla(40, yt + 20, [(80, "c", False), (130, "c", True), (100, "c", True)], fu, rowh=15, titulo="LUGAR PARA CABLES (CALCULADO)", colores=colorOR)
yr = rayados3(h, 400, yt + 20, ["PLAS2", "PLAS"], cols=1)
h.txt(400, yr + 4, "(PLAS = TAPA EN EL DETALLE D1)", 9, 400, G)
notasW(h, 40, max(yu, yr) + 22, [
    "COTAS EN mm: 30 x 30 Y 40 x 30 SALEN DE LA DESCRIPCION DEL PAÑOL; TIRAS DE 2 m Y PVC GRIS: FICHA DE LA APP.",
    "(*) PARED, FONDO, RANURA (4,2), DEDO (6), PROFUNDIDAD DE LA RANURA (21) Y FORMA DEL ENGANCHE DE LA TAPA: PROPORCIONALES, A CONFIRMAR CON EL QUE SE COMPRE.",
    "(*) EL CATALOGO LO TIENE EN «Un.»: CONFIRMAR SI ES LA TIRA DE 2 m. LA FICHA NO LO ASOCIA A NINGUN PLANO TIPO: A CONFIRMAR EN QUE TABLERO VA.",
    "(*) LUGAR PARA CABLES: (ANCHO - 2 PAREDES) x (ALTO - FONDO); SE RECOMIENDA NO PASAR EL 50 % (CRITERIO USUAL, A CONFIRMAR)."], w=800, lh=13.5)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - CABLE CANAL 40 x 30 CON LA TAPA CORRIDA", "PVC GRIS · LOS CABLES SALEN POR UNA RANURA · ATRAS: 30 x 30 CON SU TAPA")
A = img3d(h, "conex_canal", 880, 84, 640)
columna(h, A, [("canal30", "", "CANAL 30 x 30 (5001)"), ("tapa", "", "TAPA A PRESION"), ("sale", "", "SALE POR LA RANURA"), ("dedo", "", "DEDO (*)"), ("ranura", "", "RANURA (*)"),
               ("labio", "", "LABIO DE LA TAPA (*)")], 1500, 110, 520, paso=28)
columna(h, A, [("cables", "", "CABLES DEL TABLERO"), ("fondo", "", "FONDO")], 902, 480, 520, paso=26)
bloque(h, 890, 590, "DATOS TECNICOS", ["CANAL DE PVC GRIS CON RANURAS LATERALES Y TAPA A PRESION.", "30 x 30 mm (5001) Y 40 x 30 mm (5002), EN TIRAS DE 2 m (FICHA DE LA APP).",
                                        "SE ATORNILLA AL FONDO DEL TABLERO; SE CORTA CON SIERRA. PARED Y RANURAS (*)."], w=740, sz=10, lh=14)
bloque(h, 890, 690, "DONDE SE USA", ["INTERIOR DEL TABLERO DE MEDICION Y COMANDO: LLEVA EL CABLEADO ORDENADO ENTRE LOS APARATOS DEL RIEL NS35 (MAT-CANAL_RIEL-1).",
                                      "LA FICHA NO LO ASOCIA A NINGUN PLANO TIPO (AP-T-…): A CONFIRMAR EN QUE TABLERO VA (*)."], w=740, sz=10, lh=14)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/conex_canal.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES_conex.md", 9.5, 400, G, "start", INT)
rotuloB(h, "MAT-CANAL_RIEL-2", "CABLE CANAL RANURADO", "30 x 30 / 40 x 30", "CORTES, ENGANCHE, RANURAS, CODIGOS Y 3D", "5:1 · 2,5:1", "D1 15:1 · 3D S/E")
guardar(h, "mat_canal_riel_2")
