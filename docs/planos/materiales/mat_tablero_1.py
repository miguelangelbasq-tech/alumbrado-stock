"""MAT-TABLERO-1 (rev. B) · Gabinete de PRFV 530 × 430 × 200 mm (3020) y su placa de montaje (3052).
Plano con GAB de r3d/piezas/perfiles_protab.mjs; 3D: r3d/out/protab_tab1.png y protab_tab1_cierre.png.
Datos: FICHAS_TEC.tablero pieza 1 (PRFV, IP66 / IK10, doble aislación, puerta 180°, placa aparte, montaje ≥ 5 m, puerta al espacio verde;
referencia Schneider PanelSeT PLM NSYPLM54G 530 × 430 × 200 RAL 7035, «2 cierres con inserto doble barra»), AP-T-012 (semiabrazaderas 4003)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from protabkit import *

G_ = PT["GAB"]; W, H, P, e, pu = G_["W"], G_["H"], G_["P"], G_["pared"], G_["puerta"]; pl = G_["placa"]
h = nueva3()

# =============== FRENTE ===============
s = .6; X0, Y0 = 92, 118
X = lambda x: X0 + (x + W / 2) * s; Z = lambda z: Y0 + (H - z) * s
h.titulo(40, 62, "FRENTE (PUERTA CERRADA)", "ESC. 1:1,7 · RAL 7035 (*)")
h.rect(X(-W / 2), Z(H), W * s, H * s, "#fff", K, 1.7, f'rx="{14*s}"'); h.rect(X(-W / 2) + 5, Z(H) + 5, W * s - 10, H * s - 10, "none", K, .5, f'rx="{10*s}"')
for z in G_["cierres"]:
    h.circ(X(W / 2 - 34), Z(z), 13 * s, "#fff", K, 1.1); h.rect(X(W / 2 - 34) - 6.5 * s, Z(z) - 1.6 * s, 13 * s, 3.2 * s, "#111", K, .3); h.rect(X(W / 2 - 34) - 1.6 * s, Z(z) - 1.6 * s, 3.2 * s, 5 * s, "#111", K, .3)
for z in G_["bisagras"]: h.rect(X(-W / 2) - 7 * s, Z(z + 27), 7 * s, 54 * s, "#fff", K, .9)
for (sx, z) in ((-1, 30), (1, 30), (-1, H - 30), (1, H - 30)):
    x = sx * (W / 2 + G_["pie"]["l"] / 2 - 6); h.rect(X(x - 18), Z(z + 20), 36 * s, 40 * s, "#fff", K, .8); h.circ(X(x + sx * 6), Z(z), 4.2 * s, "#fff", K, .7)
h.rect(X(-45), Z(H - 57), 90 * s, 26 * s, "#fff", K, .7); h.txt(X(0), Z(H - 67) + 2, "RIESGO ELECTRICO", 7.5, 700, K, "middle")
for x in (-110, 0, 110): h.rect(X(x - 15), Z(0), 30 * s, 34 * s, "#fff", K, .8); h.rect(X(x - 6), Z(-34), 12 * s, 26 * s, "#fff", K, .6)
h.dimH(Z(H) - 30, X(-W / 2), X(W / 2), "430", ext=Z(H) - 2)
h.dimV(X(W / 2) + 46, Z(H), Z(0), "530", ext=X(W / 2) + 26)
lineaCorte(h, X(-W / 2) - 30, Z(H / 2), X(W / 2) + 34, Z(H / 2), "A") if False else None
lineaCorte(h, X(0), Z(H) - 12, X(0), Z(0) + 38, "A")
for n, (x, z), (gx, gy) in [("1", (-120, 300), (56, 300)), ("2", (W / 2 - 34, G_["cierres"][1]), (X(W / 2) + 30, Z(G_["cierres"][1]) - 40)), ("3", (-W / 2 - 4, G_["bisagras"][1]), (56, Z(G_["bisagras"][1]))),
                            ("8", (-110, -20), (56, Z(0) + 30)), ("9", (W / 2 + 14, H - 30), (X(W / 2) + 30, Z(H) + 18))]:
    h.globo(n, X(x), Z(z), gx, gy, r=9)

# =============== CORTE A-A ===============
vc = Vista(h, 560, 440, .5)
h.titulo(400, 62, "CORTE A-A", "ESC. 1:2 · PLACA Y SEMIABRAZADERAS")
vc.poly([[0, 0], [P - pu, 0], [P - pu, e], [e, e], [e, H - e], [P - pu, H - e], [P - pu, H], [0, H]], "url(#PRFV)", 1.2)
vc.rect(P - pu, P, 0, H, "url(#PRFV)", 1.2)
vc.rect(P - pu - 9.5, P - pu - 7, 8, 8 + G_["junta"]["a"], "url(#GOMA)", .5); vc.rect(P - pu - 9.5, P - pu - 7, H - 8 - G_["junta"]["a"], H - 8, "url(#GOMA)", .5)
vc.rect(pl["y"], pl["y"] + pl["e"] * 2, (H - pl["H"]) / 2, (H + pl["H"]) / 2, "url(#MET)", .8)
for z in ((H - pl["H"]) / 2 + 15, (H + pl["H"]) / 2 - 15): vc.rect(e, pl["y"], z - 6, z + 6, "#fff", .7)
for z in G_["cierres"]: vc.rect(P - pu - 16, P - pu - 12, z - 7, z + 7, "url(#MET)", .6); vc.rect(P, P + 7, z - 13, z + 13, "url(#PLAS2)", .7)
vc.rect(P / 2 - 13, P / 2 + 13, -34, 0, "#fff", .8); vc.rect(P / 2 - 7, P / 2 + 7, -70, -34, "#fff", .6)
Rp = 110; yC = -Rp - 26
vc.rect(yC - Rp, yC + Rp, -60, H + 40, "url(#PRFV)", .9)
for zq in (-60, H + 40): a, b = vc.p(yC - Rp - 4, zq), vc.p(yC + Rp + 4, zq); h.path(f"M{a[0]:.1f},{a[1]:.1f} l{(b[0]-a[0])/3:.1f},-5 l{(b[0]-a[0])/3:.1f},10 L{b[0]:.1f},{b[1]:.1f}", "#fff", K, .8)
for z in (90, H - 90): vc.rect(yC + Rp, 0, z - 20, z + 20, "url(#MET)", .8); vc.rect(yC - Rp - 2.5, yC + Rp, z - 20, z + 20, "none", .5)
vc.eje(yC, -70, yC, H + 50)
vc.cotaH(0, P, -90, "200", zext=-2)
vc.cotaH(0, pl["y"], H + 20, "22 (*)", zext=H, c=OR)
vc.cotaV(P + 20, (H - pl["H"]) / 2, (H + pl["H"]) / 2, "480 (*)", yext=pl["y"] + 4, c=OR)
for n, (y, z), (gx, gy) in [("4", (pl["y"] + 2, 330), (650, 210)), ("5", (12, (H + pl["H"]) / 2 - 15), (650, 130)), ("6", (P - pu - 8, 60), (650, 400)),
                            ("7", (yC + Rp / 2 + 30, H - 90), (400, 200)), ("2", (P - pu - 14, G_["cierres"][1]), (650, 290)), ("8", (P / 2, -20), (650, 440))]:
    h.globo(n, *vc.p(y, z), gx, gy, r=9)
h.txt(*vc.p(yC, H + 62), "APOYO PRFV Ø (*)", 8.5, 400, OR, "middle")

# =============== D1 · JUNTA ===============
D1x, D1y = 680, 62
h.titulo(D1x, D1y, "D1 - JUNTA Y PUERTA", "ESC. 3:1 · CERRADA (*)")
vj = Vista(h, D1x - 145.5 * 3, D1y + 30 + 535 * 3, 3.0)
h.a(f'<clipPath id="cpJ"><rect x="{D1x}" y="{D1y + 30}" width="190" height="150"/></clipPath>'); h.rect(D1x, D1y + 30, 190, 150, "none", K, .5)
h.a('<g clip-path="url(#cpJ)">')
vj.poly([[P - pu - 60, H - e], [P - pu, H - e], [P - pu, H], [P - pu - 60, H]], "url(#PRFV)", 1.1)
vj.poly([[P - pu - 6, H - e - 6], [P - pu, H - e - 6], [P - pu, H - e], [P - pu - 6, H - e]], "url(#PRFV)", .8)
vj.rect(P - pu, P, H - 60, H + 2, "url(#PRFV)", 1.1)
vj.rect(P - pu - 7, P - pu, H - 5 - 7, H - 5, "url(#PRFV)", .8)
vj.rect(P - pu - 9.5, P - pu - 7, H - 8 - G_["junta"]["a"], H - 8, "url(#GOMA)", .6)
h.a('</g>')
for t, (y, z), (tx, ty) in [("CUERPO PRFV 4 (*)", (P - pu - 30, H - 2), (D1x + 6, D1y + 44)), ("PUERTA 4,5 (*)", (P - pu / 2, H - 40), (D1x + 110, D1y + 150)),
                             ("JUNTA DE GOMA (*)", (P - pu - 8, H - 14), (D1x + 6, D1y + 150))]:
    a = vj.p(y, z); llamada(h, a[0], a[1], tx, ty, t, sz=8.5)

# =============== D2 · CIERRE DOBLE BARRA ===============
D2x, D2y = 680, 262
h.titulo(D2x, D2y, "D2 - CIERRE", "ESC. 2:1 · CON LLAVE (*)")
cx, cy = D2x + 50, D2y + 82
h.circ(cx, cy, 26, "#fff", K, 1.3); h.circ(cx, cy, 22, "none", K, .6)
h.rect(cx - 13, cy - 3.2, 26, 6.4, "#111", K, .4); h.rect(cx - 3.2, cy - 13, 6.4, 10, "#111", K, .4)
h.txt(cx, cy + 44, "INSERTO DOBLE BARRA", 8.5, 400, K, "middle")
lx = D2x + 86; h.rect(lx, cy - 6, 60, 12, "url(#MET)", K, .8); h.circ(lx + 6, cy, 5, "#fff", K, .8)
h.path(f"M{lx + 40},{cy - 26} a22,22 0 0,1 20,18", "none", OR, 1); h.txt(lx + 4, cy + 30, "LEVA ¼ VUELTA (*)", 8.5, 400, OR)

# =============== TABLAS ===============
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO"]]
for c, d in ((3020, "530 x 430 x 200 mm"), (3052, "UN. «m» EN EL PAÑOL (*)")):
    r = cat(c, 60); filas.append([r[0], r[1], r[2], d])
yt = h.tabla(40, 500, [(52, "c", True), (450, "l", False), (40, "c", False), (258, "l", False)], filas, rowh=16, titulo="CODIGOS DEL PAÑOL (2)", colores=colorOR)
dat = [("DATO", "VALOR"), ("MATERIAL", "PRFV (POLIESTER + FIBRA DE VIDRIO)"), ("PROTECCION", "IP66 · IK10 · DOBLE AISLACION"), ("COLOR (REF.)", "GRIS RAL 7035"),
       ("PUERTA", "ABRE 180° · 2 CIERRES CON INSERTO DOBLE BARRA"), ("MEDIDAS", "530 x 430 x 200 (ALTO x ANCHO x FONDO)"), ("PLACA", "APARTE (3052) · 480 x 380 (*)"),
       ("MONTAJE", "≥ 5 m, PUERTA AL ESPACIO VERDE"), ("REFERENCIA", "SCHNEIDER PANELSET PLM NSYPLM54G")]
ydt = h.tabla(40, yt + 24, [(120, "l", False), (300, "l", False)], dat, rowh=16, titulo="DATOS TECNICOS", colores=lambda i, j, t: OR if "(*)" in t else K)
yu = bloque(h, 480, yt + 24, "DONDE SE USA", [
    "AP-T-019 / 018: TABLERO AEREO SOBRE EL APOYO PRFV (6015) O POSTE H°A°.",
    "AP-T-012: 2 JUEGOS DE SEMIABRAZADERAS POR Ø DEL POSTE (4003).",
    "ADENTRO: AP-T-007 (TT) / AP-T-008 (TN-S), VER MAT-TABLERO-2.",
    "PLIEGO 9.02: EL GABINETE TRAE SUS ABRAZADERAS (SI VIENEN, 4003 NO SE PIDE)."], w=360, sz=10, lh=13.5)
rayadosRef(h, 480, yu + 10, ["PRFV", "MET", "GOMA", "PLAS2"], cols=2, dx=180)
notasW(h, 40, max(ydt, yu + 70) + 20, [
    "COTAS EN mm. 530 x 430 x 200: CATALOGO (3020) Y REFERENCIA SCHNEIDER NSYPLM54G; CONFIRMAR CON CADA PROVEEDOR.",
    "(*) PARED 4, PUERTA 4,5, JUNTA, SEPARADORES (22), PLACA 480 x 380 x 2, PIES Y CIERRES: PROPORCIONALES, A CONFIRMAR.",
    "(*) LA PLACA DE MONTAJE ESTA EN «m» EN EL PAÑOL (DEBERIA SER «Un.»); NO SE CAMBIA SIN EL OK DE ANGEL.",
    "(*) Ø DEL APOYO A 5 m Y LARGO DE LAS SEMIABRAZADERAS: SEGUN EL POSTE (4003 SE PIDE POR Ø).",
    "PRENSACABLES: CANTIDAD Y MEDIDA SEGUN LOS CABLES DE LA OBRA (NO VIENEN CON EL GABINETE (*))."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - GABINETE ABIERTO EN EL APOYO", "PUERTA ABIERTA · PLACA DE MONTAJE · 2 SEMIABRAZADERAS · PRENSACABLES ABAJO")
A = img3d(h, "protab_tab1", 892, 82, 520)
columna(h, A, [("poste", "7", "APOYO PRFV"), ("semi", "7", "SEMIABRAZADERA (4003)"), ("pie", "9", "PIE DE FIJACION"), ("cuerpo", "1", "CUERPO PRFV (3020)"),
               ("placa", "4", "PLACA DE MONTAJE (3052)"), ("separador", "5", "SEPARADOR"), ("bulon", "", "BULON DE TIERRA (*)"), ("bisagra", "3", "BISAGRA"),
               ("junta", "6", "JUNTA DE GOMA"), ("cierre", "2", "CIERRE (LEVA)"), ("puerta", "", "PUERTA"), ("prensa", "8", "PRENSACABLE (*)"), ("cable", "", "CABLE")],
        1430, 100, 640, paso=30)
h.titulo(890, 680, "CERRADO, DE ABAJO", "CIERRES, BISAGRAS, ROTULO Y PRENSACABLES")
A2 = img3d(h, "protab_tab1_cierre", 892, 700, 380)
columna(h, A2, [("rotulo", "", "ROTULO RIESGO ELECTRICO"), ("cierre", "2", "INSERTO DOBLE BARRA"), ("bisagra", "3", "BISAGRA"), ("pie", "9", "PIE"),
                ("prensa", "8", "PRENSACABLE"), ("cable", "", "CABLE")], 1290, 720, 990, paso=30)
rotuloMat(h, "MAT-TABLERO-1", "GABINETE PRFV", "530 x 430 x 200 mm", "FRENTE, CORTE A-A, D1, D2, CODIGOS, DATOS Y 3D", "1:1,7", "D1 3:1 · D2 2:1 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_tablero_1.svg"))
