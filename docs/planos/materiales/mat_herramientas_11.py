"""MAT-HERRAMIENTAS-11 (rev. A) · Varios: pilas AAA (9004), caloventor 2000 W (9014) y electrodos de 2,5 mm para soldar (1036).
Plano y 3D con las mismas medidas (perfiles_nherr.json: VARIOS). 3D: r3d/out/nherr_varios2.png, nherr_pilas.png.
Fuentes: r3d/FUENTES_nherr.md (IEC 60086 LR03: Ø10,5 × 44,5 máx.; Cofan 1000/2000 W 23 × 17 × 26,5 cm; Würth E6013 2,5 × 350, 60–90 A)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

V = PH["VARIOS"]; P, CA, E = V["aaa"], V["calo"], V["electrodo"]
h = nuevaH()

# ============ 1. PILA AAA ============
h.titulo(40, 58, "PILA AAA (LR03) 9004 · VISTA Y CORTE A-A", "ESC. 1,8:1 · ALCALINA 1,5 V · IEC 60086 · CAPAS DE UNA PILA ALCALINA TIPICA (*)")
e = 7.0; ox, oy = 80, 140
L = P["L"] - P["nub"]["h"]; R_ = P["D"] / 2
X = lambda x: ox + x * e; Y = lambda y: oy - y * e
h.rect(X(0), Y(R_), L * e, P["D"] * e, "#fff", K, 1.2)
h.rect(X(L), Y(P["nub"]["D"] / 2), P["nub"]["h"] * e, P["nub"]["D"] * e, "#fff", K, 1.0)
h.rect(X(L * .62), Y(R_), L * .38 * e, P["D"] * e, "url(#PLAS2)", K, .6)
h.txt(X(L) + 14, oy + 5, "+", 16, 700); h.txt(X(0) - 14, oy + 5, "−", 16, 700, K, "end")
h.dimH(Y(R_) - 12, X(0), X(P["L"]), n(P["L"]), ext=Y(R_)); h.dimV(X(0) - 26, Y(R_), Y(-R_), "Ø" + n(P["D"]), ext=X(0))
# corte A-A (a lo largo)
cy = 268
pat = ["PLAS", "MET", "ABR", "PLAS2", "ESP", "CU"]
for (nm, ro, ri), pt in zip(P["capas"], pat):
    for sg in (1, -1):
        a, b = (ro, ri) if sg > 0 else (-ri, -ro)
        z0 = .4 if nm != "ETIQUETA" else 0; z1 = L - .4 if nm != "ETIQUETA" else L
        if nm.startswith("COLECTOR"): z0, z1 = 1.9, L - 2
        h.rect(ox + z0 * e, cy - a * e, (z1 - z0) * e, (a - b) * e, f"url(#{pt})", K, .6)
h.rect(X(L) - .4 * e, cy - R_ * e, .4 * e, P["D"] * e, "url(#MET)", K, .6)
for i, (nm, ro, ri) in enumerate(P["capas"]):
    rm = (ro + ri) / 2 if ri > 0 else .2; xa = ox + (6 + i * 5) * e
    llamada(h, xa, cy - rm * e, ox + L * e + 30, cy - 50 + i * 18, nm + (" (*)" if i > 1 else ""), sz=8.5, c=OR if i > 1 else K)
h.txt(ox, cy + R_ * e + 20, "CORTE A-A · ESC. 2:1", 9, 700, G)

# ============ 2. ELECTRODO ============
subt(h, 40, 354, "ELECTRODO E6013 Ø2,5 × 350 · 1036", "ESC. 1:3,2 (VISTA) · 2:1 (CORTE B-B) · REVESTIMIENTO RUTILICO")
e2 = 1.25; ex, ey = 70, 412
Lr = E["L"] - E["punta"]
h.rect(ex, ey - E["Drev"] / 2 * e2 * 2, Lr * e2, E["Drev"] * e2 * 2, "url(#FLUX)", K, 1.0)
h.rect(ex + Lr * e2, ey - E["d"] / 2 * e2 * 2, E["punta"] * e2, E["d"] * e2 * 2, "url(#MET)", K, 1.0)
h.dimH(ey - 20, ex, ex + E["L"] * e2, f'{E["L"]}', ext=ey - E["Drev"] * e2)
h.dimH(ey + 20, ex + Lr * e2, ex + E["L"] * e2, f'{E["punta"]} (*)', ext=ey + E["d"] * e2, c=OR)
h.txt(ex, ey + 34, "ESPESOR DIBUJADO ×2 PARA QUE SE VEA", 8, 400, G)
bx, by, eb = 560, 402, 8
h.circ(bx, by, E["Drev"] / 2 * eb, "url(#FLUX)", K, 1.1); h.circ(bx, by, E["d"] / 2 * eb, "url(#MET)", K, 1.0)
h.dimH(by - E["Drev"] / 2 * eb - 10, bx - E["Drev"] / 2 * eb, bx + E["Drev"] / 2 * eb, f'Ø{n(E["Drev"])} (*)', ext=by, c=OR)
h.dimH(by + E["Drev"] / 2 * eb + 14, bx - E["d"] / 2 * eb, bx + E["d"] / 2 * eb, "Ø2,5 (ALMA)", ext=by)
h.txt(bx + 30, by - 4, "B-B", 10, 700)
h.txt(620, 402, "ALMA DE ACERO DULCE", 8.5, 400, G); h.txt(620, 416, "+ REVESTIMIENTO (RUTILO)", 8.5, 400, G)
cols = [(120, "l", False), (120, "c", False)]
h.tabla(600, 446, cols, [["DATO", "E6013 Ø2,5"], ["CORRIENTE", "60 A 90 A"], ["LARGO", "350 (300)"], ["POSICION", "TODAS"], ["NORMA", "AWS A5.1"]], rowh=13)

# ============ 3. CALOVENTOR ============
subt(h, 40, 470, "CALOVENTOR 2000 W 9014", "ESC. 1:6,5 · FRENTE Y COSTADO · 1000 / 2000 W · TERMOSTATO · REF. COFAN (*)")
e3 = .62; fx, fy = 70, 520
h.rect(fx, fy, CA["A"] * e3, CA["H"] * e3, "#fff", K, 1.2)
h.rect(fx + 25 * e3, fy + 70 * e3, (CA["A"] - 50) * e3, (CA["H"] - 120) * e3, "#fff", K, .9)
for k in range(11): yy = fy + (70 + 6 + k * (CA["H"] - 136) / 10) * e3; h.ln(fx + 30 * e3, yy, fx + (CA["A"] - 30) * e3, yy, K, 1.2)
for x in (-40, 40): h.rect(fx + (CA["A"] / 2 + x - 14) * e3, fy - 19 * e3, 28 * e3, 19 * e3, "#fff", K, .8)
h.dimH(fy + CA["H"] * e3 + 14, fx, fx + CA["A"] * e3, f'{CA["A"]} (*)', ext=fy + CA["H"] * e3, c=OR)
h.dimV(fx - 12, fy, fy + CA["H"] * e3, f'{CA["H"]} (*)', ext=fx, c=OR)
sx = fx + CA["A"] * e3 + 40
h.rect(sx, fy, CA["B"] * e3, CA["H"] * e3, "#fff", K, 1.2); h.dimH(fy + CA["H"] * e3 + 14, sx, sx + CA["B"] * e3, f'{CA["B"]} (*)', ext=fy + CA["H"] * e3, c=OR)
h.txt(sx + CA["B"] * e3 + 14, fy + 20, "PERILLAS: POTENCIA (0 · 1000 · 2000 W)", 8.5, 400, K)
h.txt(sx + CA["B"] * e3 + 14, fy + 34, "Y TERMOSTATO", 8.5, 400, K)
h.txt(sx + CA["B"] * e3 + 14, fy + 54, "PROTECCION POR SOBRETEMPERATURA", 8.5, 400, K)
h.txt(sx + CA["B"] * e3 + 14, fy + 74, "I = 2000 W / 220 V ≈ 9,1 A", 9, 700, K, "start", MONO)
h.txt(sx + CA["B"] * e3 + 14, fy + 90, "→ TOMA DE 10 A COMO MINIMO", 8.5, 400, K)

# ============ TABLAS Y NOTAS ============
EX = {9004: "Ø10,5 × 44,5 · 1,5 V", 9014: "1000 / 2000 W (*)", 1036: "E6013 (*) · Ø2,5 × 350"}
yt = tablaH(h, 40, 718, [(c, EX[c]) for c in (9004, 9014, 1036)], w=800, rowh=14.5)
notasW(h, 40, yt + 18, [
    "(*) CAPAS DE LA PILA: LAS DE UNA ALCALINA TIPICA, PROPORCIONALES. CALOVENTOR: MEDIDAS DE UN MODELO DE REFERENCIA (EL DEL PAÑOL NO TIENE MARCA). ELECTRODO: SE TOMA E6013 (EL RESPALDO NO DICE EL TIPO); Ø DEL REVESTIMIENTO Y PUNTA LIBRE (*).",
    "1036 ESTA EN «UNIDAD» EN EL RESPALDO: LOS ELECTRODOS SE COMPRAN POR kg O POR CAJA (*). SE COPIA TAL CUAL; CONFIRMAR CON EL PAÑOL. 9004 Y 9014: Un.",
    "EL CALOVENTOR ES PARA EL OBRADOR / GALPON: NUNCA TAPADO NI CERCA DE SOLVENTES, PINTURA O PAPEL; DESENCHUFAR AL IRSE.",
    "LOS ELECTRODOS VAN SECOS (EN SU CAJA): EL REVESTIMIENTO HUMEDO HACE POROS EN LA SOLDADURA."], w=800, lh=13.5)

# ============ 3D ============
h.titulo(890, 58, "VISTA 3D - CALOVENTOR, PILAS AAA Y ELECTRODOS", "UNA PILA Y UN ELECTRODO CORTADOS A LO LARGO")
A3 = img3d(h, "nherr_varios2", 884, 80, 330)
columna(h, A3, [("cal_per", "1", "POTENCIA"), ("cal_ter", "2", "TERMOSTATO"), ("cal_man", "", "MANIJA"), ("cal_carc", "3", "CARCASA"), ("cal_rej", "4", "REJILLA"), ("cal_res", "5", "RESISTENCIA"),
                ("cal_base", "", "BASE"), ("cal_cable", "", "CABLE")], 1230, 100, 330, paso=32)
A4 = img3d(h, "nherr_pilas", 884, 360, 520)
columna(h, A4, [("p_mas", "6", "POLO +"), ("p_etq", "", "ETIQUETA"), ("p_vaso", "7", "VASO (+)"), ("p_catodo", "8", "CATODO"), ("p_anodo", "9", "ANODO (GEL)"), ("p_pin", "10", "COLECTOR (−)"),
                ("e_rev", "11", "REVESTIMIENTO"), ("e_alma", "12", "ALMA Ø2,5"), ("e_punta", "13", "PUNTA DE AGARRE")], 1420, 380, 640, paso=27)
usoBloque(h, 890, 680, [
    "PILAS AAA: TELURIMETRO / PINZA AMPEROMETRICA / MULTIMETRO, LINTERNA Y CONTROL REMOTO (*).",
    "CALOVENTOR: CALEFACCION DEL OBRADOR O DE LA OFICINA DE OBRA EN INVIERNO; SECAR MATERIAL CHICO.",
    "ELECTRODOS: SOLDAR SOPORTES, GRAMPAS, PLACAS BASE Y ARREGLOS DE HERRERIA CON SOLDADORA ELECTRICA (60–90 A).",
    "SOLDAR CON MASCARA, GUANTES DE DESCARNE Y LEJOS DE CABLES Y DEL PASTO SECO."], w=740)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_varios2.mjs, nherr_pilas.mjs). FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-11", "PILAS AAA, CALOVENTOR", "Y ELECTRODOS", "VISTAS, CORTES A-A Y B-B Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_11")
