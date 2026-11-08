"""MAT-HERRAJES-2 (rev. B) · Rack MN 4B2L de 1 vía (4032) con aislador de porcelana roldana MN 16 / MN 17 (4009 / 4010), aislador de rienda MN 20 (4011)
y semiabrazaderas (4022 / 4003). Geometría: r3d/piezas/perfiles_cables.mjs (MN.rack, MN.aislador: las del grupo «cables», importadas sin cambios)
y aerea.mjs rack(); 3D: r3d/out/pat_her2a.png, pat_her2b.png. Fuentes: r3d/FUENTES_pat.md"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *

MN = PC["MN"]; I = MN["aislador"]; Kr = MN["rack"]
H, r1, r2, ra = I["H"], I["Dmax"] / 2, I["Dcuello"] / 2, I["agujero"] / 2
H2 = H / 2 + Kr["e"] + 2; sal = I["Dmax"] / 2 + 22; xp = sal + 6; La = sal + I["Dmax"] / 2 + 6
h = hojaP()

# ================= ELEVACION CON EL AISLADOR EN CORTE (1,5:1) =================
h.titulo(40, 62, "ELEVACION - RACK CON EL AISLADOR EN CORTE", "ESC. 1,5:1 · CORTE POR EL EJE DEL PERNO")
e = 1.5; ox, oy = 110, 290; X = lambda x: ox + x * e; Z = lambda z: oy - z * e
h.rect(X(-30), Z(H2 + 55), 30 * e, (2 * H2 + 110) * e, "url(#HORM)", K, 1.0); h.txt(X(-15), Z(H2 + 55) - 6, "POSTE", 9, 700, G, "middle")
h.rect(X(0), Z(H2 + 40), Kr["e"] * e, (2 * H2 + 80) * e, "url(#HG)", K, 1.3)
for s in (1, -1): h.rect(X(0), Z(s * H2 + (Kr["e"] if s > 0 else 0)), La * e, Kr["e"] * e, "url(#HG)", K, 1.3)
# aislador en corte: perfil de revolución (mitades a cada lado del perno)
pf = [(ra, 0), (r1 - 4, 0), (r1, 4), (r1, 14), (r1 - 3, 18), (r2 + 2, 26), (r2, 32), (r2, H - 32), (r2 + 2, H - 26), (r1 - 3, H - 18), (r1, H - 14), (r1, H - 4), (r1 - 4, H), (ra, H)]
for s in (1, -1):
    h.path("M" + " L".join(f"{X(xp + s * rr):.1f},{Z(-H / 2 + t):.1f}" for rr, t in pf) + " Z", "url(#PORC)", K, 1.3)
h.rect(X(xp - 7), Z(H2 + 10), 14 * e, (2 * H2 + 20) * e, "#fff", K, 1.1)        # perno Ø14 (vista)
h.rect(X(xp - 11), Z(H2 + Kr["e"] + 5), 22 * e, 5 * e, "#fff", K, 1.1)
ejeV(h, X(xp), Z(H2 + 24), Z(-H2 - 22)); ejeH(h, X(-36), X(La + 20), oy)
h.dimV(X(La) + 26, Z(H / 2), Z(-H / 2), "76 (*)", ext=X(xp + r1), c=OR)
h.dimH(Z(-H2) + 30, X(xp - r1), X(xp + r1), "Ø76 (*)", ext=Z(-H / 2), c=OR)
h.dimH(Z(-H2) + 74, X(xp - r2), X(xp + r2), "CUELLO Ø52 (*)", ext=Z(0), c=OR)
h.dimH(Z(-H2) + 52, X(0), X(xp), "66 (*)", ext=Z(-H2), c=OR)
for n, (u, z), (gx, gz) in [("1", (2, H2 + 30), (30, H2 + 52)), ("2", (xp + r1 - 3, H / 2 - 9), (La + 60, H / 2 + 6)), ("3", (xp - r2 - 4, 0), (La + 60, -6)),
                            ("4", (xp + 3, -H2 - 6), (La + 60, -H2 - 16)), ("5", (xp + 10, H2 + 3), (La + 60, H2 + 26))]:
    h.globo(n, X(u), Z(z), X(gx), Z(gz), r=8)
for n, t, z in [("2", "POLLERA (ALA)", H / 2 + 6), ("3", "CUELLO DE ATADURA", -6), ("4", "PERNO PASANTE Ø14 (*)", -H2 - 16), ("5", "ARANDELA + CHAVETA (*)", H2 + 26)]:
    h.txt(X(La + 60) + 12, Z(z) + 4, t, 9.5, 400, OR if "(*)" in t else K)
h.txt(X(30) + 12, Z(H2 + 52) + 4, "BASTIDOR PLANCHUELA H°G°", 9.5)

# ================= PLANTA (1:3) =================
h.titulo(510, 62, "PLANTA (DESDE ARRIBA)", "ESC. 1:2 · LA ROLDANA TOMA EL PILOTO DE LA ACOMETIDA")
e2 = 1 / 3 * 1.0; e2 = .5; ox2, oy2 = 640, 230; X2 = lambda x: ox2 + x * e2; Y2 = lambda y: oy2 - y * e2
Rp = 100
h.circ(X2(-Rp), Y2(0), Rp * e2, "url(#HORM)", K, 1.2)
h.circ(X2(-Rp), Y2(0), (Rp + 4.76) * e2, "none", K, 1.6)    # semiabrazadera
h.rect(X2(0), Y2(Kr["a"] / 2), Kr["e"] * e2 + 1, Kr["a"] * e2, "url(#HG)", K, 1)
h.rect(X2(0), Y2(Kr["a"] / 2), La * e2, Kr["a"] * e2, "#fff", K, 1.1)
h.circ(X2(xp), Y2(0), r1 * e2, "#fff", K, 1.2); h.circ(X2(xp), Y2(0), r2 * e2, "none", K, .6, h.OCULTA); h.circ(X2(xp), Y2(0), 7 * e2, "#fff", K, .9)
rp = PC["CAB"]["p1x25"]["Ro"]
h.rect(X2(xp + r2), Y2(170), 2 * rp * e2, 340 * e2, "#fff", K, 1.2)
h.txt(X2(xp + r2) + 12, Y2(160), "PILOTO Al 1 × 25", 9.5, 700); h.txt(X2(xp + r2) + 12, Y2(160) + 13, "(ACOMETIDA TIRO FLOJO)", 9.5)
h.txt(X2(-Rp), Y2(-Rp) + 20, "SEMIABRAZADERAS 4022 (POR Ø)", 9.5, 400, K, "middle")
h.txt(510, 340, "ORIENTAR EL RACK PARA QUE LA DERIVACION AL TABLERO", 9.5); h.txt(510, 353, "QUEDE LO MAS PERPENDICULAR AL TENDIDO (AP-T-019).", 9.5)

# ================= D1 atadura =================
h.titulo(510, 390, "D1 - ATADURA DEL PILOTO EN EL CUELLO", "ESQUEMA · ALAMBRE GALV. N° 14 (1001) · 2 m POR ATADURA (*)")
ax, ay = 640, 470
h.rect(ax - r2, ay - 34, 2 * r2, 68, "url(#PORC)", K, 1.1); h.rect(ax - r1, ay - 38, 2 * r1, 8, "url(#PORC)", K, 1.1); h.rect(ax - r1, ay + 30, 2 * r1, 8, "url(#PORC)", K, 1.1)
h.circ(ax + r2 + rp, ay, rp, "#fff", K, 1.2)
for i in range(7): yy = ay - 18 + i * 6; h.path(f"M{ax + r2 + rp - 8},{yy - 3} C{ax + r2 + 2 * rp + 6},{yy - 2} {ax + r2 + 2 * rp + 6},{yy + 3} {ax + r2 + rp - 8},{yy + 4}", "none", K, .9)
h.path(f"M{ax - r2},{ay - 6} C{ax - r2 - 20},{ay - 4} {ax - r2 - 20},{ay + 6} {ax - r2},{ay + 8}", "none", K, 1.1)
h.txt(ax + r2 + 2 * rp + 20, ay - 4, "VUELTAS SOBRE EL PILOTO", 9.5); h.txt(ax + r2 + 2 * rp + 20, ay + 9, "≈ 0,05 kg / AISLADOR (*)", 9.5, 400, OR)

# ================= MN 20 rienda =================
h.titulo(40, 470, "AISLADOR DE RIENDA MN 20 (4011)", "ESC. 1:1,5 · 90 × 65 (FICHA) · 2 AGUJEROS CRUZADOS (FORMA (*))")
e3 = 1 / 1.5; mx, my = 140, 570
h.path(f"M{mx},{my - 45 * e3 * 1.0} C{mx + 32.5 * e3 * 1.33},{my - 45 * e3} {mx + 32.5 * e3 * 1.33},{my + 45 * e3} {mx},{my + 45 * e3} C{mx - 32.5 * e3 * 1.33},{my + 45 * e3} {mx - 32.5 * e3 * 1.33},{my - 45 * e3} {mx},{my - 45 * e3} Z", "url(#PORC)", K, 1.3)
h.circ(mx, my - 16 * e3, 7 * e3, "#fff", K, 1); h.rect(mx - 32 * e3, my + 16 * e3 - 7 * e3, 64 * e3, 14 * e3, "#fff", K, 1)
h.dimV(mx - 40, my - 45 * e3, my + 45 * e3, "90", ext=mx - 4); h.dimH(my + 45 * e3 + 18, mx - 32.5 * e3, mx + 32.5 * e3, "65", ext=my)
h.txt(mx + 50, my - 6, "LAS DOS RIENDAS SE CRUZAN", 9.5, 700); h.txt(mx + 50, my + 7, "Y NO SE TOCAN: SI LA PORCELANA", 9.5); h.txt(mx + 50, my + 20, "SE ROMPE, LA RIENDA NO CAE.", 9.5)

# ================= TABLAS =================
yC = codigos(h, 40, 650, [4032, 4010, 4009, 4011, 4022, 4003, 1001], {4032: "2 por punta de retención", 4010: "roldana BT", 4009: "roldana BT", 4011: "90 × 65 mm", 4022: "por Ø del poste", 4003: "por Ø del poste", 1001: "≈ 0,05 kg por aislador (*)"}, wdesc=430, wx=170, rowh=15)
yD = bloque(h, 40, yC + 16, "DATOS TECNICOS Y DONDE SE USA", [
    "PORCELANA MARRON PARA INTEMPERIE (ET 51), HERRAJES CINCADOS (ET 10). NORMAS EPEC MN 15/16/17 Y MN 19/20/21 (PLANO P_100194).",
    "REFERENCIA ANSI 53-2 (ROLDANA BT DE CATALOGO): ALTO 76 · Ø 79,4 · AGUJERO 17,5 · GARGANTA R 17,5 · 3000 lb.",
    "AP-T-019: ACOMETIDA DESDE TIRO FLOJO: RACK + MN 17 EN EL APOYO · AP-TC-006 · AP-T-014 · CALCULADORA: RACK, AISLADORES Y ALAMBRE POR PUNTA (2 m POR ATADURA)."], w=800, sz=10, lh=13.5)
notasW(h, 40, yD + 2, [
    "COTAS EN mm. LAS MEDIDAS DE MN 4B2L, MN 16 Y MN 17 ESTAN EN LOS PLANOS DE MATERIALES NORMALES DE EPEC, QUE NO TENEMOS (*): SE DIBUJAN COMO EN MAT-MORSETERIA_AEREA-2.",
    "(*) DIFERENCIA ENTRE MN 16 Y MN 17 (TAMAÑO): A CONFIRMAR. PERNO Ø14, CHAVETA Y LARGO DE LOS BRAZOS: A CONFIRMAR.",
    "(*) ALAMBRE DE ATAR ≈ 0,05 kg POR AISLADOR: CALCULADO POR VUELTAS (CLAUDE.md §11.3). FUENTES: FICHA DE LA APP; r3d/FUENTES_pat.md."], w=800, lh=14)
rayadosC(h, 40, 1104, ["PORC", "HG", "HORM"], cols=3, dx=200)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - RACK MN 4B2L CON ROLDANA CORTADA A CUARTO", "PORCELANA MARRON (ET 51): POLLERAS, CUELLO DE ATADURA, AGUJERO Y PERNO PASANTE")
A = img3d(h, "pat_her2a", 860, 96, 560)
columna(h, A, [("rack", "1", "BASTIDOR H°G° (4032)"), ("chaveta", "5", "ARANDELA + CHAVETA (*)"), ("brazo", "", "BRAZO DEL RACK"), ("pollera", "2", "POLLERA"), ("perno", "4", "PERNO PASANTE"),
               ("cuello", "3", "CUELLO DE ATADURA"), ("agujero", "", "AGUJERO DEL AISLADOR"), ("corte", "", "CORTE DE LA PORCELANA")], 1440, 120, 510, paso=36)
h.txt(890, 566, "EN SU LUGAR - RACK EN EL POSTE, PILOTO ATADO; AL COSTADO EL MN 20 DE RIENDA", 11, 700, NV, "start", INT)
A2 = img3d(h, "pat_her2b", 860, 572, 520)
columna(h, A2, [("poste", "", "POSTE H°A°"), ("rack", "1", "RACK 4032"), ("aislador", "", "ROLDANA MN 17 (4010)"), ("atadura", "", "ATADURA ALAMBRE 1001"), ("piloto", "", "PILOTO DE LA ACOMETIDA"),
                ("semi", "", "SEMIABRAZADERA 4022"), ("mn20", "", "AISLADOR DE RIENDA MN 20"), ("agujeros", "", "AGUJEROS CRUZADOS")], 1410, 600, 995, paso=34)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/pat_her2a.mjs, pat_her2b.mjs; rack y aislador de piezas/aerea.mjs). FUENTES: r3d/FUENTES_pat.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-HERRAJES-2", "RACK MN 4B2L", "Y AISLADORES MN", "ELEVACION EN CORTE, PLANTA, D1, MN 20 Y 3D", "1,5:1 / 1:2", "D1 1:1 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_herrajes_2.svg"))
