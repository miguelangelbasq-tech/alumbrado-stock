"""MAT-TABLERO-4 (rev. B) · Tablero T-010 armado completo en PRFV para poste, 747 × 546 × 300 (altas del equipo): 3101 con 3 salidas y 3102 con 2 salidas
«3 × 1 × 16 A». Plano con T010 de r3d/piezas/perfiles_nelec.mjs; 3D: r3d/out/nelec_tab4.png (gabinete, poste y semiabrazaderas de protab_caja, sin tocarlos).
Datos: descripción del pañol (medidas y salidas). T-010 no aparece en la web; contenido aparte de las salidas como el tablero armado de MAT-TABLERO-2 (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nelekit import *

T = PN["T010"]; W, H, P = T["W"], T["H"], T["P"]
h = hojaN()


def placa(ox, oy, e, ns, cotas=True):
    """frente sin puerta: gabinete, placa, rieles con los aparatos (rectángulos a escala)"""
    X = lambda x: ox + (x + W / 2) * e; Z = lambda z: oy + (H - z) * e
    h.a(f'<rect x="{X(-W/2):.1f}" y="{Z(H):.1f}" width="{W*e:.1f}" height="{H*e:.1f}" rx="{T["radio"]*e:.1f}" fill="url(#PRFV)" stroke="{K}" stroke-width="1.6"/>')
    pl = T["placa"]; h.rect(X(-pl["W"] / 2), Z((H + pl["H"]) / 2), pl["W"] * e, pl["H"] * e, "#fff", K, 1.1)
    for z, items in ((560, [(-90, 72, "4x40 (*)"), (10, 45, "KM (*)")]), (380, [(-ns * 36 + 6 + s * 72, 54, "3x1x16") for s in range(ns)])):
        h.rect(X(-230), Z(z + 17.5), 460 * e, 35 * e, "url(#MET)", K, .6)
        for x0, w, t in items:
            h.rect(X(x0), Z(z + 42.5), w * e, 85 * e, "#fff", K, 1)
    nb = ns * 3 + 4
    h.rect(X(-nb * 4.1), Z(190 + 26), nb * 8.2 * e, 53 * e, "url(#PLAS)", K, .9)
    if cotas: h.txt(X(0), Z(190) + 26, "BORNERA BPN (*)", 7.5, 400, OR, "middle")
    for i in range(ns + 1): h.circ(X(-150 + i * 80 - (30 if i else 0) * 0), Z(0) + 4, 9 * e, "#fff", K, .8)
    return X, Z


# =============== 1. FRENTE SIN PUERTA (3101) ===============
e = .42; FX, FY = 70, 112
h.titulo(40, 62, "FRENTE - 3101 (3 SALIDAS)", "ESC. 1:2,4 · SIN PUERTA · PLACA (*)")
X, Z = placa(FX, FY, e, 3)
h.dimH(Z(0) + 28, X(-W / 2), X(W / 2), "546", ext=Z(0) + 4)
h.dimV(X(-W / 2) - 16, Z(H), Z(0), "747", ext=X(-W / 2) - 2)
for n, p, (gx, gy) in [("1", (X(-W / 2 + 6), Z(600)), (FX - 26, FY + 40)), ("2", (X(200), Z(100)), (X(W / 2) + 26, Z(80))), ("3", (X(-54), Z(560)), (X(W / 2) + 26, Z(600))),
                        ("4", (X(32), Z(560)), (X(W / 2) + 26, Z(540))), ("5", (X(-36), Z(380)), (X(W / 2) + 26, Z(400))), ("6", (X(0), Z(190)), (X(W / 2) + 26, Z(220))),
                        ("7", (X(-150), Z(0) + 4), (X(-150) - 20, Z(0) + 48))]:
    h.globo(n, p[0], p[1], gx, gy, r=9)

# =============== 2. LATERAL CON EL POSTE ===============
el = .3; LX, LY = 370, 150
h.titulo(340, 62, "LATERAL EN EL POSTE", "ESC. 1:3,3 · SEMIABRAZADERAS (*)")
Rp = T["poste"]["R"]; yC = -Rp - 26
Y = lambda y: LX + (y - yC + Rp) * el; Zl = lambda z: LY + (H - z) * el
h.rect(Y(yC - Rp), Zl(H + 120), 2 * Rp * el, (H + 240) * el, "url(#PRFV)", K, 1.3)
h.ln(Y(yC), Zl(H + 130), Y(yC), Zl(-130), K, .45, h.EJE)
h.rect(Y(0), Zl(H), P * el, H * el, "#fff", K, 1.6); h.rect(Y(P - T["puerta"]), Zl(H), T["puerta"] * el, H * el, "url(#PRFV)", K, .9)
for z in (140, H - 140):
    h.rect(Y(yC - Rp - 2.5), Zl(z + 20), (Rp + 2.5 - yC + 40) * el * 0 + (-yC + Rp + 2.5) * el, 40 * el, "url(#MET)", K, .8)
h.rect(Y(T["placa"]["y"]), Zl((H + T["placa"]["H"]) / 2), 2 * el + 1, T["placa"]["H"] * el, "url(#MET)", K, .6)
h.dimH(Zl(0) + 28, Y(0), Y(P), "300", ext=Zl(0) + 4)
h.dimV(Y(P) + 18, Zl(H), Zl(0), "747", ext=Y(P) + 2)
h.txt(Y(yC), Zl(-120) + 14, "POSTE (*)", 9, 400, OR, "middle")
for n, p, (gx, gy) in [("8", (Y(yC), Zl(H + 60)), (Y(yC) - 34, Zl(H + 100))), ("9", (Y(yC - Rp + 10), Zl(H - 140)), (Y(yC) - 34, Zl(H - 260)))]:
    h.globo(n, p[0], p[1], gx, gy, r=9)

# =============== 3. 3102 (2 SALIDAS) ===============
h.titulo(590, 62, "3102 - 2 SALIDAS", "ESC. 1:4,2 · IGUAL, SIN LA 3.ª")
placa(600, 112, .24, 2, cotas=False)

# =============== 4. D1 · UNIFILAR ===============
DY = 500
h.titulo(40, DY, "D1 - UNIFILAR (ESQUEMA)", "DE LA ACOMETIDA A LAS SALIDAS · LO QUE NO DICE EL PAÑOL VA (*)")
ux, uy = 70, DY + 46
h.ln(ux, uy, ux + 60, uy, K, 1.6); h.txt(ux, uy - 6, "ACOMETIDA", 8.5, 700); h.txt(ux, uy + 16, "3F + N", 8.5, 700)
def caj(x, y, w, t, c=K): h.rect(x, y - 13, w, 26, "#fff", c, 1.1); h.txt(x + w / 2, y + 4, t, 8.5, 700, c, "middle")
caj(ux + 60, uy, 78, "4 x 40 A (*)", OR); h.ln(ux + 138, uy, ux + 170, uy, K, 1.6); caj(ux + 170, uy, 64, "KM (*)", OR); h.ln(ux + 234, uy, ux + 270, uy, K, 1.6)
h.ln(ux + 270, uy - 50 + 50, ux + 270, uy + 100, K, 1.6)
for s in range(3):
    y = uy + s * 50
    h.ln(ux + 270, y, ux + 300, y, K, 1.2)
    for k in range(3): caj(ux + 300 + k * 52, y, 44, "C16", K)
    h.ln(ux + 456, y, ux + 490, y, K, 1.2); h.txt(ux + 496, y + 4, f"SALIDA {s+1}: L1 · L2 · L3", 8.5, 700)
h.txt(ux + 300, uy + 136, "«3 x 1 x 16 A» = 3 UNIPOLARES DE 16 A POR SALIDA (*)", 8.5, 400, OR)
h.txt(ux + 300, uy + 149, "3102: SOLO SALIDAS 1 Y 2", 8.5, 400)
h.txt(ux, uy + 50, "COMANDO DEL KM: FOTOCONTROL", 8, 400, G); h.txt(ux, uy + 62, "O HORARIO (MAT-COMANDO-2) (*)", 8, 400, OR)

# =============== 5. TABLA ===============
filas = [["COD.", "DESCRIPCION (TAL CUAL EL PAÑOL)", "UN.", "MEDIDAS", "SALIDAS"]]
for c, n in ((3101, "3 x (3 x 1 x 16 A)"), (3102, "2 x (3 x 1 x 16 A)")):
    r = catN(c); filas.append([r[0], r[1][:70] + "…", r[2], "747 x 546 x 300", n])
yt = tablaN(h, 40, 730, [(40, "c", True), (452, "l", False), (34, "c", False), (120, "c", True), (154, "c", False)], filas, "CODIGOS DEL PAÑOL (2) - ALTAS DEL EQUIPO")
notasW(h, 40, yt + 22, [
    "COTAS EN mm: 747 x 546 x 300 SEGUN LA DESCRIPCION DEL PAÑOL (SE TOMA ALTO x ANCHO x FONDO: EL ORDEN NO ESTA DICHO) (*).",
    "(*) «T-010» NO APARECE EN LA WEB NI EN LA APP: PLANO DEL FABRICANTE / PLIEGO A PEDIR. PARED, PUERTA, JUNTA Y PLACA COMO MAT-TABLERO-1.",
    "(*) «3 x 1 x 16 AMP» SE INTERPRETA COMO 3 TERMOMAGNETICAS UNIPOLARES DE 16 A POR SALIDA (VER 3093 EN MAT-TERMOMAGNETICAS-2).",
    "(*) GENERAL 4 x 40 A, CONTACTOR, BORNERA, PRENSACABLES Y POSTE: DIBUJADOS COMO EL TABLERO ARMADO DE MAT-TABLERO-2; A CONFIRMAR.",
    "(*) UNIDADES TAL CUAL EL PAÑOL: 3101 «Un.», 3102 «UN».", "FUENTES: r3d/FUENTES_nelec.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - 3101 EN EL POSTE, PUERTA ABIERTA", "GABINETE PRFV · PLACA CON GENERAL, CONTACTOR, 3 SALIDAS DE 3 x C16 Y BORNERA (*)")
A = img3d(h, "nelec_tab4", 900, 84, 560)
columna(h, A, [("poste", "8", "POSTE (*)"), ("gab", "1", "GABINETE PRFV"), ("tmG", "3", "GENERAL 4 x 40 A (*)"), ("km", "4", "CONTACTOR (*)"),
               ("sal", "5", "SALIDAS 3 x 1 x 16 A"), ("bornes", "6", "BORNERA DE SALIDA (*)"), ("placa", "2", "PLACA DE MONTAJE"), ("semi", "9", "SEMIABRAZADERAS (*)"),
               ("puerta", "", "PUERTA CON JUNTA"), ("prensa", "7", "PRENSACABLES")], 1478, 110, 600, paso=38)
bloque(h, 890, 650, "DATOS TECNICOS", ["GABINETE DE PRFV ARMADO COMPLETO, PARA POSTE (DESCRIPCION DEL PAÑOL).", "3101: 3 SALIDAS · 3102: 2 SALIDAS, CADA UNA 3 x 1 x 16 A.",
                                        "IP, IK, COLOR Y CIERRES: A PEDIR AL PROVEEDOR (*)."], w=740, sz=9.5, lh=13)
bloque(h, 890, 740, "DONDE SE USA", ["TABLERO DE ALUMBRADO EN POSTE (MONTAJE ≥ 5 m, COMO EL 3020 DE MAT-TABLERO-1) (*).",
                                       "ACOMETIDA AP-T-019 · SALIDAS A LOS CIRCUITOS DE LA PLAZA O DEL BARRIO (*)."], w=740, sz=9.5, lh=13)
rayadosRef(h, 890, 830, ["PRFV", "MET", "PLAS"], cols=3, dx=220)
rotuloMat(h, "MAT-TABLERO-4", "TABLERO T-010 PRFV", "PARA POSTE 3 / 2 SALIDAS", "FRENTE, LATERAL, 3102, D1, CODIGOS Y 3D", "1:2,4 · 1:3,3", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardar(h, "mat_tablero_4")
