"""MAT-FUSIBLES-1 · Portafusible seccionable 10×38 (tabaquera) y fusible cilíndrico 10×38 gG.
Datos: FICHAS_TEC.fusibles pieza 1 (Schneider DF101 17,5 × 79,5 × 61; Mersen FR10GG Ø10,3 × 38 gG 500 V 120 kA; 3001 32 A 690 V),
FAMILIAS_MAT.fusibles, catálogo, CLAUDE.md §11.3 (2 A por artefacto; 3014 no entra), TC-PRFV-01/02, AP-CC-014 (contradicción)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
W, H_, D = 17.5, 79.5, 61
YN = 44          # comienzo del cuello del frente (*)
ZN0, ZN1 = 17, 62  # alto del cuello / tapa rebatible (*)
e = 2.4
# ================= VISTA DE FRENTE =================
FX, FY = 70, 120
h.titulo(40, 62, "VISTA DE FRENTE", "ESC. 5:2 - COTAS EN mm")
h.rect(FX, FY, W * e, H_ * e, "#fff", K, 1.6)
for zz in (8, H_ - 8):
    h.rect(FX + 4, FY + (H_ - zz) * e - 7, W * e - 8, 14, "#fff", K, .7)
    h.circ(FX + W * e / 2, FY + (H_ - zz) * e, 5, "#fff", K, .8); h.ln(FX + W * e / 2 - 4, FY + (H_ - zz) * e + 3, FX + W * e / 2 + 4, FY + (H_ - zz) * e - 3, K, .8)
h.rect(FX + 3, FY + (H_ - ZN1) * e, W * e - 6, (ZN1 - ZN0) * e, "#fff", K, 1)          # tapa rebatible
h.rect(FX + 9, FY + (H_ - 50) * e, W * e - 18, 18 * e, "#fff", K, .6)                    # visor (*)
h.txt(FX + W * e / 2, FY + (H_ - 40) * e + 4, "2A", 9, 700, K, "middle")
h.ln(FX + W * e / 2, FY - 14, FX + W * e / 2, FY + H_ * e + 14, K, .4, h.EJE)
# línea de corte A-A (vertical por el eje)
for yy in (FY - 22, FY + H_ * e + 22): h.ln(FX + W * e / 2 - 8, yy, FX + W * e / 2 + 8, yy, K, 1.8)
h.txt(FX + W * e / 2 + 12, FY - 18, "A", 13, 700); h.txt(FX + W * e / 2 + 12, FY + H_ * e + 30, "A", 13, 700)
h.dimH(FY + H_ * e + 46, FX, FX + W * e, "17,5", ext=FY + H_ * e + 2)
h.dimV(FX - 18, FY, FY + H_ * e, "79,5", ext=FX - 2)
h.globo("2", FX + W * e - 6, FY + (H_ - 45) * e, FX + W * e + 34, FY + 70)
h.globo("3", FX + W * e / 2 + 4, FY + 8 * e, FX + W * e + 34, FY + 20)

# ================= PERFIL =================
PX, PY = 210, 120
h.titulo(PX, 62, "PERFIL", "ESC. 5:2 - TAPA ABIERTA EN PUNTOS")
prof = [(0, 0), (YN, 0), (YN, ZN0), (D, ZN0), (D, ZN1), (YN, ZN1), (YN, H_), (0, H_)]
d = "M" + " L".join(f"{PX + y * e:.1f},{PY + (H_ - z) * e:.1f}" for y, z in prof) + " Z"
h.path(d, "#fff", K, 1.6)
ab = [rot(p, (D, ZN0), 55) for p in [(YN, ZN0), (D, ZN0), (D, ZN1), (YN, ZN1)]]
h.path("M" + " L".join(f"{PX + y * e:.1f},{PY + (H_ - z) * e:.1f}" for y, z in ab) + " Z", "none", K, .8, h.OCULTA)
# riel NS35 en la cara de atrás (de canto)
h.rect(PX - 7.5 * e, PY + (H_ / 2 - 17.5) * e, 7.5 * e, 35 * e, "url(#ANSI31)", K, .8)
h.txt(PX - 7.5 * e - 4, PY + H_ / 2 * e + 4, "RIEL", 9.5, 400, G, "end")
h.dimH(PY + H_ * e + 28, PX, PX + D * e, "61", ext=PY + H_ * e + 2)
h.dimH(PY - 16, PX + YN * e, PX + D * e, "17 (*)", ext=PY + (H_ - ZN1) * e - 2, c=OR)
h.dimV(PX + D * e + 22, PY + (H_ - ZN1) * e, PY + (H_ - ZN0) * e, "45 (*)", ext=PX + D * e + 2, c=OR)
h.globo("2", PX + (D - 4) * e, PY + (H_ - 40) * e, PX + D * e + 60, PY + 30)
h.globo("1", PX + 20 * e, PY + (H_ - 60) * e, PX + 20 * e, PY - 30 + 4)

# ================= CORTE A-A =================
CX, CY = 470, 120
h.titulo(CX, 62, "CORTE A-A", "ESC. 5:2 - FUSIBLE EN LA TAPA")
d = "M" + " L".join(f"{CX + y * e:.1f},{CY + (H_ - z) * e:.1f}" for y, z in prof) + " Z"
h.path(d, "url(#ANSI31)", K, 1.6)
# hueco interior de la tapa + fusible (eje vertical)
h.rect(CX + (YN - 6) * e, CY + (H_ - ZN1 + 2) * e, (D - YN + 4) * e, (ZN1 - ZN0 - 4) * e, "#fff", K, .8)
fz0, fz1 = 21, 59; fy = 52.5
h.rect(CX + (fy - 5.15) * e, CY + (H_ - fz1) * e, 10.3 * e, 38 * e, "#fff", K, 1.1)
for zc in (fz0, fz1 - 6): h.rect(CX + (fy - 5.15) * e, CY + (H_ - zc - 6) * e, 10.3 * e, 6 * e, "url(#cuH)", K, .7)
h.ln(CX + fy * e, CY + (H_ - fz1 - 4) * e, CX + fy * e, CY + (H_ - fz0 + 4) * e, K, .4, h.EJE)
# contactos (pinzas) y bornes de cable
for zc in (fz0 - 2, fz1 + 2):
    h.rect(CX + (YN - 14) * e, CY + (H_ - zc) * e - 2, 14 * e + (fy - YN - 5) * e, 4, "url(#cuH)", K, .6)
for zz in (8, H_ - 8):
    h.rect(CX + 8 * e, CY + (H_ - zz - 5) * e, 14 * e, 10 * e, "#fff", K, .8)
    h.rect(CX + 13 * e, CY + (H_ - zz - 13) * e if zz > 40 else CY + (H_ - zz + 5) * e, 4 * e, 8 * e, "#fff", K, .6)
    h.rect(CX - 26, CY + (H_ - zz) * e - 4, 26 + 12 * e, 8, "#fff", K, .8)
h.dimV(CX + D * e + 20, CY + (H_ - fz1) * e, CY + (H_ - fz0) * e, "38", ext=CX + (fy + 5.15) * e)
h.globo("4", CX + fy * e, CY + (H_ - 40) * e, CX + D * e + 54, CY + 110)
h.globo("5", CX - 20, CY + 8 * e + 0, CX - 30, CY + H_ * e + 30)
h.txt(CX - 20, CY + H_ * e + 60, "CABLE CON PUNTERA (ENTRA Y SALE)", 9.5, 400, G)

# ================= D1 FUSIBLE =================
DX, DY = 470, 410
h.titulo(DX, DY, "D1 - FUSIBLE CILINDRICO 10 x 38 gG", "ESC. 4:1 - CUERPO CERAMICO, CASQUILLOS DE LATON NIQUELADO (*)")
k4 = 4.0; fx, fyy = DX + 40, DY + 72
h.rect(fx + 6 * k4, fyy - 10.3 * k4 / 2 + 2, (38 - 12) * k4, 10.3 * k4 - 4, "#fff", K, 1)
for xx in (fx, fx + 32 * k4): h.rect(xx, fyy - 10.3 * k4 / 2, 6 * k4, 10.3 * k4, "url(#cuH)", K, 1)
h.ln(fx - 10, fyy, fx + 38 * k4 + 10, fyy, K, .4, h.EJE)
h.txt(fx + 19 * k4, fyy + 4, "gG 2A 500V", 10, 700, K, "middle")
h.dimH(fyy + 10.3 * k4 / 2 + 22, fx, fx + 38 * k4, "38", ext=fyy + 10.3 * k4 / 2 + 2)
h.dimV(fx + 38 * k4 + 22, fyy - 10.3 * k4 / 2, fyy + 10.3 * k4 / 2, "Ø10,3", ext=fx + 38 * k4 + 2)
h.dimH(fyy - 10.3 * k4 / 2 - 14, fx, fx + 6 * k4, "", ext=fyy - 10.3 * k4 / 2 - 2)
h.txt(fx + 3 * k4, fyy - 10.3 * k4 / 2 - 20, "6 (*)", 10.5, 400, OR, "middle")

# ================= TABLA DE CODIGOS =================
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO (FICHA)"]]
dato = {"3053": "2 POR COLUMNA PRFV", "3001": "32 A · 690 V", "3016": "1 A", "3017": "2 A · EN USO", "3073": "4 A · EN USO", "3013": "AMPERAJE (*)"}
for c in [3053, 3001, 3017, 3073, 3016, 3013]:
    r = cat(c, 66); filas.append([r[0], r[1], r[2], dato[str(c)]])
TY = 520
yt = h.tabla(40, TY, [(52, "c", True), (470, "l", False), (40, "c", False), (238, "l", False)], filas, rowh=17, titulo="CODIGOS DEL PAÑOL (6)", colores=colorOR)
# cuadro de fusibles por columna (CLAUDE.md §11.3)
fc = [["ARTEF.", "S", "T"], ["1", "2 A", "VACIO"], ["2", "2 A", "2 A"], ["3", "4 A", "2 A"], ["4", "4 A", "4 A"]]
yq = h.tabla(40, yt + 30, [(56, "c", True), (60, "c", True), (60, "c", True)], fc, rowh=17, titulo="FUSIBLES POR COLUMNA (2 A x ART.)")
h.txt(40, yq + 14, "2 A = 3017 · 4 A = 3073", 10, 400, G)
ydat = bloque(h, 300, yt + 30, "DATOS TECNICOS", [
    "PORTAFUSIBLE MODULAR DE 1 POLO, 17,5 mm DE ANCHO, PARA RIEL NS35.",
    "TAPA REBATIBLE: AL ABRIRLA SACA EL FUSIBLE Y CORTA EL CIRCUITO.",
    "FUSIBLE CILINDRICO gG Ø10,3 x 38 · 500 V · 120 kA (MERSEN FR10GG).",
    "BASE 3001: 32 A · 690 V.",
    "SECCION DE CABLE QUE TOMAN LOS BORNES Y PAR DE APRIETE (*)"], w=520)
yu = bloque(h, 40, max(ydat, yq + 22) + 10, "DONDE SE USA", [
    "TC-PRFV-01 / 02: 2 PORTAFUSIBLES (S Y T) EN EL TABLERITO DE ARRIBA; DE AHI SALE EL 3x1,5 (6001) A CADA LUMINARIA.",
    "COLUMNA METALICA: 1 PORTAFUSIBLE POR LUMINARIA. GUIA «CAJA DE COLUMNA PRFV».",
    "CALCULADORA: 2 A POR ARTEFACTO; SIMPLE 2 + VACIO · DOBLE 2+2 · TRIPLE 4+2 · CUADRUPLE 4+4."], w=790)
notasW(h, 40, yu + 12, [
    "COTAS EN mm. 17,5 x 79,5 x 61 = SCHNEIDER DF101; Ø10,3 x 38 = MERSEN FR10GG (FICHA DE LA APP).",
    "(*) FORMA DEL PERFIL (CUELLO 17 x 45), VISOR Y LARGO DE LOS CASQUILLOS (6): A CONFIRMAR CON EL FABRICANTE.",
    "EL FUSIBLE 3014 (8,5 x 31,5) NO ENTRA EN LA TABAQUERA 10 x 38 (3053). VER MAT-FUSIBLES-2.",
    "(*) AP-CC-014 PIDE 3 PORTAFUSIBLES 8,5 x 31,5 CON 4 A POR FASE; LA OBRA Y LOS PROYECTOS 2026 USAN 2 TABAQUERAS 10 x 38 CON 2 A POR ARTEFACTO.",
    "(*) 3013 «FUSIBLE CERAMICO 10 x 38» SIN AMPERAJE EN EL CATALOGO: A CONFIRMAR."], w=800)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - DOS PORTAFUSIBLES EN EL RIEL (S Y T)", "EL DE LA DERECHA CON LA TAPA ABIERTA: SE VE EL FUSIBLE 10 x 38")
h.iso(3.5, 1150, 560)
placaV(h, -8, 72, -25, 105)
riel3dV(h, -6, 70, H_ / 2)
BODY = ("#fbfbf8", "#e9e8e2", "#c9c7bd")
# el aparato «de pie»: y = profundidad (frente en +y), z = alto. Lo apoyo con la espalda en la placa: giro el perfil (y,z)
def aparato(x0, abierto):
    prisma(h, [(0, 0), (YN, 0), (YN, H_), (0, H_)], x0, x0 + W, BODY, "#333", .6)
    for zz in (8, H_ - 8):
        q = [(x0 + 3, YN, zz - 6), (x0 + W - 3, YN, zz - 6), (x0 + W - 3, YN, zz + 6), (x0 + 3, YN, zz + 6)]
        poly(h, q, "#22252a", "#000", .4); tornilloY(h, x0 + W / 2, YN + .01, zz, 2.8)
    tapa = [(YN, ZN0), (D, ZN0), (D, ZN1), (YN, ZN1)]
    if abierto:
        # hueco donde va la tapa, contactos, y la tapa girada 55° con el fusible
        q = [(x0 + 2, YN, ZN0), (x0 + W - 2, YN, ZN0), (x0 + W - 2, YN, ZN1), (x0 + 2, YN, ZN1)]
        poly(h, q, "#3a3d42", "#000", .4)
        for zc in (ZN0 + 3, ZN1 - 3):
            q = [(x0 + 4, YN, zc - 1.5), (x0 + W - 4, YN, zc - 1.5), (x0 + W - 4, YN, zc + 1.5), (x0 + 4, YN, zc + 1.5)]; poly(h, q, "url(#bronce)", "#5a3d10", .4)
        tr = [rot(p, (D, ZN0), 55) for p in tapa]
        prisma(h, tr, x0 + 1, x0 + W - 1, BODY, "#333", .6)
        a = rot((52.5, 21), (D, ZN0), 55); b = rot((52.5, 59), (D, ZN0), 55)
        ya, za = a; yb, zb = b
        f = lambda t: (x0 + W / 2, ya + (yb - ya) * t, za + (zb - za) * t)
        cil3(h, f(6 / 38), f(32 / 38), 5.15, "url(#ceram)", "#efe9d6")
        cil3(h, f(0), f(6 / 38), 5.15, "url(#niq)", "#d6dbe0"); cil3(h, f(32 / 38), f(1), 5.15, "url(#niq)", "#d6dbe0")
    else:
        prisma(h, tapa, x0 + 1, x0 + W - 1, BODY, "#333", .6)
        q = [(x0 + 4, D, 30), (x0 + W - 4, D, 30), (x0 + W - 4, D, 48), (x0 + 4, D, 48)]; poly(h, q, "#30343a", "#000", .4)
aparato(0, False)
aparato(W, True)
# cables 3x1,5 saliendo por abajo (bornes de abajo)
for xc, col in ((W / 2, "#1a1a1a"), (W * 1.5, "#c62828")):
    cil3(h, (xc, YN + 1, 8), (xc, YN + 30, 8), 2.2, col, col)
h.g3("1", (W / 2, 22, H_), 1430, 150, "CUERPO AISLANTE, 1 POLO")
h.g3("3", (W * 1.5, YN, H_ - 8), 1430, 200, "BORNE (ARRIBA Y ABAJO)")
h.g3("2", (W / 2, D, 40), 920, 300, "TAPA REBATIBLE (3053)")
h.g3("4", (W * 1.5, 75, 52), 1430, 380, "FUSIBLE 10 x 38 gG 2 A (3017)")
h.g3("6", (60, -2, H_ / 2 + 17), 1430, 560, "RIEL DIN NS35 (2038)")
h.g3("7", (70, -7.5, 0), 1430, 610, "TABLERITO 80 x 130 (SIN CODIGO)")
h.g3("5", (W * 1.5, YN + 26, 8), 920, 730, "3 x 1,5 A LA LUMINARIA (6001)")
# fusible suelto
h.txt(890, 800, "FUSIBLE CILINDRICO 10 x 38", 12, 700, NV, "start", INT)
h.iso(3.0, 930, 840)
cil3(h, (0, 0, 0), (6, 0, 0), 5.15, "url(#niq)", "#d6dbe0"); cil3(h, (6, 0, 0), (32, 0, 0), 5.15, "url(#ceram)", "#efe9d6"); cil3(h, (32, 0, 0), (38, 0, 0), 5.15, "url(#niq)", "#d6dbe0")
h.txt(1100, 840, "CUERPO CERAMICO · CASQUILLOS METALICOS (*)", 11, 400, K, "start", INT)
h.txt(1100, 858, "gG · 500 V · 120 kA · 2 A (3017) / 4 A (3073) / 1 A (3016)", 11, 400, K, "start", INT)
h.txt(890, 990, "FUENTE: FICHA TECNICA DE LA APP (SCHNEIDER DF101, MERSEN FR10GG), CLAUDE.md §11.3 Y CATALOGO DEL PAÑOL.", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-FUSIBLES-1", "PORTAFUSIBLE 10 x 38", "Y FUSIBLE CILINDRICO", "FRENTE, PERFIL, CORTE, DETALLE, CODIGOS Y 3D", "5:2 · 4:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_fusibles_1.svg"))
