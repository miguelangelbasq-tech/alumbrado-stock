"""MAT-FUSIBLES-1 (rev. B) · Portafusible seccionable 10×38 «tabaquera» (3053) y fusible cilíndrico 10×38 gG (3017 2 A, 3073 4 A).
Plano con los perfiles de r3d/piezas/perfiles.mjs (TAB, F10x38); 3D: r3d/out/tab_par.png y fus10x38.png.
Datos: FICHAS_TEC.fusibles (Schneider DF101 17,5 × 79,5 × 61; Mersen FR10GG Ø10,3 × 38 gG 500 V 120 kA; 3001 32 A 690 V),
CLAUDE.md §11.3 (2 A por artefacto; 3014 no entra), TC-PRFV-01/02, AP-CC-014. Fuentes: r3d/FUENTES.md. Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fuskit import *

T, F = PERF["TAB"], PERF["F10x38"]
H_, D_, W_ = T["H"], T["D"], T["W"]; n0, n1 = T["cuello"]
h = nueva2()
e = 2.8; OY = 380          # z = 0 de las vistas de la fila de arriba

# =============== 1. VISTA DE FRENTE ===============
h.titulo(40, 62, "FRENTE", "ESC. 2,8:1")
X, Z = portaFrente(h, 64, OY - H_ * e, e, T)
h.dimH(OY + 52, X(0), X(W_), "17,5", ext=OY + 2)
h.dimV(X(0) - 14, Z(H_), Z(0), "79,5", ext=X(0) - 2)
lineaCorte(h, X(W_ / 2), Z(H_) - 22, X(W_ / 2), Z(0) + 22, "A")
h.globo("2", X(W_ - 3), Z(n1 - 4), X(W_) + 26, Z(n1 + 2), r=9); h.globo("9", X(W_ / 2), Z(T["visor"]["z"]), X(W_) + 26, Z(T["visor"]["z"] - 6), r=9)
h.globo("4", X(W_ / 2 + 3), Z(T["tornillo"]["z"]), X(W_) + 26, Z(T["tornillo"]["z"] + 8), r=9)

# =============== 2. PERFIL (CARRO CERRADO) ===============
vp = Vista(h, 205, OY, e)
h.titulo(178, 62, "PERFIL", "CARRO CERRADO · CABLES ARRIBA Y ABAJO")
portaPerfil(vp, T, F)
vp.cotaH(0, D_, -15, "61", zext=0)
vp.cotaH(0, T["Dr"], -21, "44 (*)", zext=1, c=OR)
vp.cotaV(D_ + 6, n0, n1, "45 (DIN 43880)", yext=D_ + .5)
vp.cotaV(-11, T["zM"] - 17.5, T["zM"] + 17.5, "35", yext=-7.5)
vp.cotaV(D_ + 15, 0, H_, "79,5", yext=T["Dr"] + 1)
h.globo("10", *vp.p(-4, T["zM"] + 10), vp.p(-14, T["zM"] + 30)[0], vp.p(-14, T["zM"] + 30)[1], r=9)
h.globo("12", *vp.p(8, -1.2), vp.p(-12, -6)[0], vp.p(-12, -6)[1], r=9)
h.globo("13", *vp.p(31.7, H_ + 12), vp.p(14, H_ + 8)[0], vp.p(14, H_ + 8)[1], r=9)

# =============== 3. CORTE A-A (plano medio) ===============
vc = Vista(h, 492, OY, e)
h.titulo(462, 62, "CORTE A-A", "PLANO MEDIO · BORNE, FLEJE, PINZA, CARRO, FUSIBLE")
portaCorte(vc, T, F)
a, b = vc.p(T["Dr"] - 4, T["pinza"]["zS"]), vc.p(D_ + 4, T["pinza"]["zS"]); lineaCorte(h, a[0] - 8, a[1], b[0] + 6, b[1], "C")
vc.cotaV(D_ + 7, T["fus"]["z0"], T["fus"]["z1"], "38", yext=T["fus"]["y"] + 5.4)
for n, (y, z), (gx, gy) in [("1", (12, 40), (446, 120)), ("3", (27.5, 70), (446, 150)), ("5", (29, 60), (446, 180)), ("6", (T["Dr"] + 2, T["pinza"]["zS"] + 2), (710, 120)),
                            ("7", (T["fus"]["y"] + 2, T["zM"] + 6), (710, 150)), ("8", (T["fus"]["y"], T["fus"]["z1"] - 4), (710, 180)), ("2", (D_ - 2.5, T["zM"] - 8), (710, 290)),
                            ("11", T["pivote"], (710, 330)), ("14", (31.7, -12), (446, 380)), ("4", (40, T["H"] - T["tornillo"]["z"]), (446, 340))]:
    h.globo(n, *vc.p(y, z), gx, gy, r=9)

# =============== 4. PERFIL CON EL CARRO ABIERTO ===============
e2 = 2.0; va = Vista(h, 64, 646, e2)
h.titulo(40, 456, "CARRO ABIERTO", f"ESC. 2:1 · GIRA {T['abre']}° (*) Y SACA EL FUSIBLE")
portaPerfil(va, T, F, abierto=True, cables=False)
tip = rot(T["carro"][5], T["pivote"], T["abre"]); a = va.p(*tip); h.txt(a[0] + 8, a[1], f"{T['abre']}° (*)", 10, 700, OR)
h.txt(*va.p(T["Dr"] + 4, 4), "CORTA EL CIRCUITO AL ABRIR", 9, 400, G)

# =============== 5. D1 · FUSIBLE 10×38 EN CORTE ===============
k = 4.2; vd = Vista(h, 350, 0, k)
h.titulo(300, 456, "D1 - FUSIBLE 10 x 38 gG EN CORTE", "ESC. 4:1 · IEC 60269-2")
# lo dibujo horizontal: uso una vista girada (z del fusible → x de la hoja)
class Vh(Vista):
    def p(s, y, z): return (s.ox + z * s.e, s.oy - y * s.e)
vh = Vh(h, 322, 560, k)
fusibleLong(vh, F, 0, 0)
vh.cotaV = None
h.dimH(560 + F["D"] / 2 * k + 16, 322, 322 + 38 * k, "38", ext=560 + F["D"] / 2 * k + 2)
h.dimV(322 + 38 * k + 22, 560 - F["D"] / 2 * k, 560 + F["D"] / 2 * k, "Ø10,3", ext=322 + 38 * k + 2)
h.dimH(560 - F["D"] / 2 * k - 14, 322, 322 + F["cap"] * k, "", ext=560 - F["D"] / 2 * k - 2); h.txt(322 + F["cap"] * k / 2, 560 - F["D"] / 2 * k - 20, "10 (*)", 9.5, 400, OR, "middle")
h.dimV(322 - 12, 560 - F["tubo"] / 2 * k, 560 + F["tubo"] / 2 * k, "9,7 (*)", ext=322 + 12 * k, c=OR)
for t, (zz, yy), (tx, ty) in [("CASQUILLO LATON NIQ.", (36, 4.6), (470, 520)), ("TUBO CERAMICO", (25, -4.4), (322, 616)), ("ARENA DE CUARZO", (18, 2.4), (380, 515)),
                             ("ESTRANGULAMIENTO", (11.75, 0), (322, 632)), ("PUNTO DE ESTAÑO (*)", (19, -.3), (440, 632))]:
    a = vh.p(yy, zz); llamada(h, a[0], a[1], tx, ty, t, sz=8.5)

# =============== 6. SECCION C-C · PINZA ===============
h.titulo(660, 456, "SECCION C-C", "ESC. 5:1 · PINZA Y CASQUILLO")
P = pinzaCorte(h, 700, 520, 5, T)
llamada(h, *P(T["fD"] / 2 + .3, T["fus"]["y"] - 1), 745, 545, "PINZA (RESORTE)", sz=8.5)
llamada(h, *P(1.5, T["Dr"] + .5), 745, 610, "FLEJE AL BORNE", sz=8.5)
llamada(h, *P(2, T["fus"]["y"] + 3), 745, 490, "CASQUILLO 10x38", sz=8.5)

# =============== TABLAS ===============
TY = 668
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO (FICHA)"]]
dato = {"3053": "2 POR COLUMNA PRFV", "3001": "32 A · 690 V", "3016": "1 A", "3017": "2 A · EN USO", "3073": "4 A · EN USO", "3013": "AMPERAJE (*)"}
for c in [3053, 3001, 3017, 3073, 3016, 3013]:
    r = cat(c, 54); filas.append([r[0], r[1], r[2], dato[str(c)]])
yt = h.tabla(40, TY, [(52, "c", True), (370, "l", False), (40, "c", False), (140, "l", False)], filas, rowh=15, titulo="CODIGOS DEL PAÑOL (6)", colores=colorOR)
fc = [["ARTEF.", "S", "T"], ["1", "2 A", "VACIO"], ["2", "2 A", "2 A"], ["3", "4 A", "2 A"], ["4", "4 A", "4 A"]]
yq = h.tabla(40, yt + 22, [(56, "c", True), (60, "c", True), (60, "c", True)], fc, rowh=15, titulo="FUSIBLES POR COLUMNA")
h.txt(40, yq + 13, "2 A = 3017 · 4 A = 3073", 9.5, 400, G)
ydat = bloque(h, 250, yt + 22, "DATOS TECNICOS", [
    "PORTAFUSIBLE SECCIONABLE DE 1 POLO, 1 MODULO (17,5 mm), RIEL NS35.",
    "CARRO BASCULANTE: AL ABRIRLO SACA EL FUSIBLE DE LAS PINZAS Y CORTA.",
    "FUSIBLE CILINDRICO gG Ø10,3 x 38 · 500 V · 120 kA (MERSEN FR10GG).",
    "BASE 3001: 32 A · 690 V.",
    "SECCION QUE TOMAN LOS BORNES Y PAR DE APRIETE (*)"], w=560, sz=10, lh=13.5)
rayadosRef(h, 650, TY, ["PLAS", "CU", "MET", "CER", "ARE"], cols=1, dx=200)
yu = bloque(h, 40, max(ydat, yq + 22) + 14, "DONDE SE USA", [
    "TC-PRFV-01 / 02: 2 PORTAFUSIBLES (S Y T) EN EL TABLERITO DE ARRIBA; DE AHI SALE EL 3x1,5 (6001) A CADA LUMINARIA.",
    "COLUMNA METALICA: 1 PORTAFUSIBLE POR LUMINARIA. CALCULADORA: 2 A POR ARTEFACTO (SIMPLE 2+0 · DOBLE 2+2 · TRIPLE 4+2 · CUADRUPLE 4+4)."], w=800, sz=10, lh=13.5)
notasW(h, 40, yu + 8, [
    "COTAS EN mm. 17,5 x 79,5 x 61 = SCHNEIDER DF101 (FICHA DE LA APP); OTRA FICHA DE SCHNEIDER DICE 88,5 x 64 (*). Ø10,3 x 38 = MERSEN FR10GG.",
    "CUELLO DE 45 mm Y MODULO DE 17,5 mm: DIN 43880. (*) HOMBRO (44), CARRO, PIVOTE, PINZAS, BORNES Y ANGULO DE APERTURA: PROPORCIONALES, A CONFIRMAR.",
    "(*) CASQUILLO: 10 mm EN LA FICHA DE UN 10 x 38 aM; OTRA FICHA DA 8,5. TUBO 9,7, PARED Y FORMA DEL ELEMENTO: ESQUEMATICOS (IEC 60269-2).",
    "EL FUSIBLE 3014 (8,5 x 31,5) NO ENTRA EN LA TABAQUERA 10 x 38 (3053). VER MAT-FUSIBLES-2.",
    "(*) AP-CC-014 PIDE 3 PORTAFUSIBLES 8,5 x 31,5 CON 4 A POR FASE; LA OBRA 2026 USA 2 TABAQUERAS 10 x 38 CON 2 A POR ARTEFACTO.",
    "(*) 3013 «FUSIBLE CERAMICO 10 x 38» SIN AMPERAJE EN EL CATALOGO. INDICADOR (9): SOLO EN LA VERSION CON LAMPARA (*)."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - DOS TABAQUERAS 10 x 38 EN EL RIEL", "LA DE ADELANTE CORTADA A CUARTO; LA DE ATRAS CON EL CARRO ABIERTO Y EL FUSIBLE AFUERA")
A = img3d(h, "tab_par", 960, 82, 520)
columna(h, A, [("cuerpo", "1", "CUERPO DE PA"), ("jaula", "3", "JAULA"), ("tornillo", "4", "TORNILLO"), ("fleje", "5", "FLEJE DE COBRE"),
               ("pinza", "6", "PINZA"), ("arena", "7", "ARENA"), ("casquillo", "8", "CASQUILLO"), ("visor", "9", "INDICADOR (*)"), ("manija", "2", "CARRO / MANIJA"),
               ("traba", "12", "TRABA DEL RIEL")], 1500, 110, 560)
columna(h, A, [("cableS", "13", "CABLE CON PUNTERA"), ("fusSuelto", "15", "FUSIBLE 10x38 gG 2A"), ("pivote", "11", "PIVOTE"), ("riel", "10", "RIEL NS35")],
        925, 140, 560, lado="der")
h.txt(890, 620, "FUSIBLE CILINDRICO 10 x 38 gG POR DENTRO (IEC 60269-2)", 11, 700, NV, "start", INT)
A2 = img3d(h, "fus10x38", 900, 628, 500)
columna(h, A2, [("casquillo", "8", "CASQUILLO LATON NIQUELADO"), ("tubo", "", "TUBO CERAMICO"), ("arena", "7", "ARENA DE CUARZO"),
                ("elemento", "", "ELEMENTO DE PLATA"), ("muesca", "", "ESTRANGULAMIENTO"), ("estano", "", "PUNTO DE ESTAÑO (*)"), ("soldadura", "", "SOLDADURA AL CASQUILLO"),
                ("entero", "", "4 A (3073) ENTERO")], 1415, 640, 880, paso=25)
h.txt(890, 1012, "RENDER: three.js (r3d/escenas/tab_par.mjs, fus10x38.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-FUSIBLES-1", "PORTAFUSIBLE 10 x 38", "Y FUSIBLE CILINDRICO", "VISTAS, CORTES A-A Y C-C, DETALLE D1 Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_fusibles_1.svg"))
