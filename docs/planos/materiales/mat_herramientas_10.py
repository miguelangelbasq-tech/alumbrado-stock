"""MAT-HERRAMIENTAS-10 (rev. A) · Cintas pasacable de 15 m (9023) y 10 m (9024), pistola aplicadora de silicona (9012) y cinta de papel 36 mm (9038).
Plano y 3D con las mismas medidas (perfiles_nherr.json: VARIOS, PISTOLA). 3D: r3d/out/nherr_varios1.png.
Fuentes: r3d/FUENTES_nherr.md (Klein 56001 / Screwfix / Wattmaster: cinta de acero 3 × 1 mm, 15 m, carrete Ø178; Bellota 50262: 210 × 365 × 55)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

V = PH["VARIOS"]; PI = PH["PISTOLA"]; P15, P10, PA = V["pasa15"], V["pasa10"], V["papel"]
h = nuevaH()

# ============ 1. PASACABLE ============
h.titulo(40, 58, "CINTA PASACABLE 15 m (9023) Y 10 m (9024)", "ESC. 1:4,4 · CARRETE DE FRENTE Y DE COSTADO · CINTA DE ACERO PLANA 3 × 1 CON OJAL")
e = .9
for i, P in enumerate((P15, P10)):
    cx = 140 + i * 0; cy = 175 if i == 0 else 175
for i, (P, cx) in enumerate(((P15, 150), (P10, 420))):
    cy = 210; Rr = P["carrete"] / 2 * e
    h.circ(cx, cy, Rr, "#fff", K, 1.2); h.circ(cx, cy, Rr - 4 * e, "none", K, .5); h.circ(cx, cy, Rr * .35, "#fff", K, .9)
    for k in range(6): h.circ(cx, cy, Rr * .4 + k * (Rr * .55) / 6, "none", K, .3, h.OCULTA)
    h.rect(cx - 12 * e, cy - Rr - 34 * e, 24 * e, 40 * e, "#fff", K, .9)
    h.path(f"M{cx + Rr - 6},{cy + 10 * e} H{cx + Rr + 70}", "none", K, 1.6)
    h.circ(cx + Rr + 75, cy + 10 * e, 4 * e, "none", K, 1)
    h.dimH(cy + Rr + 14, cx - Rr, cx + Rr, f'Ø{P["carrete"]} (*)' if P["cod"] == 9024 else f'Ø{P["carrete"]}', ext=cy, c=OR if P["cod"] == 9024 else K)
    h.txt(cx + 20, cy - Rr - 6, f'{P["cod"]} · {P["L"] // 1000} m', 10, 700, K, "start")
h.txt(150 + 89 * e + 60, 210 - 2, "OJAL", 8.5, 400, G)
# costado
sx, sy = 640, 130
h.rect(sx, sy, P15["e"] * e, P15["carrete"] * e, "#fff", K, 1.1); h.rect(sx + P15["e"] * e, sy + P15["carrete"] * e * .32, 2 * e, P15["carrete"] * e * .36, "#fff", K, .8)
h.dimH(sy + P15["carrete"] * e + 14, sx, sx + P15["e"] * e, f'{P15["e"]} (*)', ext=sy + P15["carrete"] * e, c=OR)
h.txt(sx, sy - 8, "COSTADO 9023", 9, 700, G)
# D1 sección de la cinta
subt(h, 720, 92, "D1 · CINTA", "ESC. 2,5:1")
h.rect(740, 130, 30, 10, "url(#MET)", K, 1); h.dimH(124, 740, 770, "3", ext=130); h.dimV(782, 130, 140, "1 (*)", ext=770, c=OR)
h.txt(720, 165, "ACERO DE RESORTE (*)", 8.5, 400, OR)

# ============ 2. PISTOLA ============
subt(h, 40, 330, "PISTOLA APLICADORA DE SILICONA 9012", "ESC. 1:4,4 · COSTADO CON EL CARTUCHO DE 300 ml (*) · REF. BELLOTA 50262 (210 × 365 × 55)")
e2 = .9; ox, oy = 90, 420
X = lambda x: ox + x * e2; Z = lambda z: oy - z * e2
c = PI["cuna"]
h.rect(X(4), Z(24.5), (215 - 8) * e2, 49 * e2, "#fff", K, 1.0)
h.path(f"M{X(3)},{Z(7)} L{X(-56)},{Z(2.4)} L{X(-59)},{Z(0)} L{X(-56)},{Z(-2.4)} L{X(3)},{Z(-7)} Z", "#fff", K, .9)
h.path(f"M{X(c['x0'])},{Z(-c['r'] * .35)} H{X(c['x1'])}", "none", K, 1.6); h.path(f"M{X(c['x0'])},{Z(-c['r'] - 1.2)} H{X(c['x1'])}", "none", K, 1.6)
h.rect(X(PI["placa"]["x"]), Z(c["r"]), PI["placa"]["e"] * e2, (2 * c["r"] + 6) * e2, "url(#MET)", K, .9)
h.path("M" + " L".join(f"{X(x):.1f},{Z(z):.1f}" for x, z in PI["mango"]) + " Z", "url(#PLAS)", K, 1.1)
h.path("M" + " L".join(f"{X(x):.1f},{Z(z):.1f}" for x, z in PI["gatillo"]) + " Z", "#fff", K, 1.1)
v_ = PI["vastago"]; h.rect(X(v_["x0"]), Z(v_["r"]), v_["L"] * e2, 2 * v_["r"] * e2, "#fff", K, .8)
h.rect(X(v_["x0"] - 4), Z(PI["piston"]["r"]), 4 * e2, 2 * PI["piston"]["r"] * e2, "url(#MET)", K, .8)
h.dimH(Z(26.5) - 14, X(0), X(v_["x0"] + v_["L"]), f'{v_["x0"] + v_["L"]} (SIN EL PICO)', ext=Z(26.5))
h.dimV(X(-70), Z(24.5), Z(-24.5), "Ø49 (*)", ext=X(4), c=OR)
h.dimV(X(285), Z(26.5), Z(-164), "≈ 190 (*)", ext=X(262), c=OR)
for (x, z, tx, tz, t) in [(120, 0, 60, 50, "CARTUCHO 300 ml"), (150, -c["r"] - 1, 100, -60, "CUNA DE CHAPA"), (232, -90, 180, -120, "GATILLO (EMPUJA)"), (256, -120, 300, -150, "EMPUÑADURA"),
                          (320, 0, 330, -40, "VASTAGO DENTADO (*)"), (v_["x0"] - 2, -18, 150, -40, "PISTON")]:
    llamada(h, X(x), Z(z), X(tx), Z(tz), t, sz=8.5, anc="end" if tx < x else "start", c=OR if "(*)" in t else K)

# ============ 3. CINTA DE PAPEL ============
subt(h, 600, 330, "CINTA DE PAPEL 36 mm 9038", "ESC. 1:4 · FRENTE Y CORTE F-F")
qx, qy, eq = 660, 430, 1.0
h.circ(qx, qy, PA["De"] / 2 * eq, "url(#PLAS2)", K, 1.1); h.circ(qx, qy, PA["nucleo"] / 2 * eq + 4, "url(#WOOD)", K, .9); h.circ(qx, qy, PA["nucleo"] / 2 * eq, "#fff", K, 1)
h.dimH(qy + PA["De"] / 2 + 14, qx - PA["De"] / 2, qx + PA["De"] / 2, f'Ø{PA["De"]} (*)', ext=qy, c=OR)
h.txt(qx, qy + 4, f'Ø{PA["nucleo"]} (*)', 8.5, 400, OR, "middle")
fx = 740
h.rect(fx, qy - PA["De"] / 2, PA["A"] * eq, (PA["De"] - PA["nucleo"]) / 2 * eq - 4, "url(#PLAS2)", K, 1); h.rect(fx, qy - PA["nucleo"] / 2 - 4, PA["A"] * eq, 4, "url(#WOOD)", K, .8)
h.dimH(qy - PA["De"] / 2 - 10, fx, fx + PA["A"] * eq, "36", ext=qy - PA["De"] / 2)
h.txt(fx, qy + 20, "PAPEL CREPE", 8.5, 400, G); h.txt(fx, qy + 34, "+ NUCLEO DE CARTON", 8.5, 400, G)

# ============ TABLAS Y NOTAS ============
EX = {9023: "15 m · 3 × 1 · Ø178 (*)", 9024: "10 m · 3 × 1 (*)", 9012: "CARTUCHO 280–310 ml", 9038: "36 mm · LARGO (*)"}
yt = tablaH(h, 40, 640, [(c_, EX[c_]) for c_ in (9023, 9024, 9012, 9038)], w=800, rowh=14.5)
cols = [(230, "l", False), (250, "c", False), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["CINTA PASACABLE 15 m", "ACERO 3 (3,2) × 1 · CARRETE Ø178", "KLEIN 56001 · SCREWFIX · WATTMASTER"],
       ["PISTOLA (CON CARTUCHO)", "210 × 365 × 55 · 0,72 kg", "BELLOTA 50262"],
       ["CARTUCHOS QUE ENTRAN", "280 · 300 · 310 ml", "COLLAK 933045"],
       ["CINTA DE PAPEL", "NUCLEO 76 · LARGO (*)", "NO SE ENCONTRO FICHA (*)"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
notasW(h, 40, yt + 16, [
    "(*) CARRETE DEL 9024, ANCHO DEL CARRETE, ESPESOR DE LA CINTA, CARTUCHO Y CINTA DE PAPEL (LARGO DEL ROLLO, Ø): A CONFIRMAR.",
    "LA CINTA PASACABLE ES DE ACERO: NUNCA EN CAÑOS O CAJAS CON CABLES CON TENSION. EXISTEN DE FIBRA (NO CONDUCTORA) PARA ESO (*).",
    "UNIDADES DEL RESPALDO TAL CUAL (UN / Un.)."], w=800, lh=13.5)

# ============ 3D ============
h.titulo(890, 58, "VISTA 3D - PASACABLES, PISTOLA Y CINTA DE PAPEL", "PISTOLA PARADA SOBRE SU EMPUÑADURA, CON UN CARTUCHO PUESTO")
A3 = img3d(h, "nherr_varios1", 884, 80, 600)
columna(h, A3, [("p_carrete", "1", "CARRETE 15 m"), ("p_manija", "2", "MANIJA"), ("p_cinta", "3", "CINTA DE ACERO"), ("p_ojal", "4", "OJAL"), ("p10", "", "9024 10 m"),
                ("s_vastago", "5", "VASTAGO"), ("s_cart", "6", "CARTUCHO"), ("s_boq", "7", "PICO"), ("s_cuna", "8", "CUNA"), ("s_gatillo", "9", "GATILLO"), ("s_mango", "10", "EMPUÑADURA"),
                ("c_papel", "11", "CINTA DE PAPEL"), ("c_nucleo", "", "NUCLEO 76")], 1500, 96, 510, paso=32)
usoBloque(h, 890, 560, [
    "PASACABLE: PASAR EL CABLE POR EL CAÑO PEAD Ø50 DE LA ZANJA, EL CRUCE DE CALZADA Y LA ACOMETIDA: SE EMPUJA LA CINTA, SE ATA EL CABLE AL OJAL Y SE TIRA.",
    "EL DE 15 m PARA CRUCES Y TRAMOS LARGOS; EL DE 10 m PARA CAJAS Y TRAMOS CORTOS.",
    "PISTOLA: SELLAR LA ENTRADA DE CABLES AL TABLERO Y A LA CAJA, JUNTAS DE TAPAS Y PASOS DE PARED (SILICONA).",
    "CINTA DE PAPEL: ENMASCARAR AL PINTAR, MARCAR CABLES Y CIRCUITOS DURANTE EL TENDIDO, ROTULAR."], w=740)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_varios1.mjs) CON LAS MISMAS MEDIDAS. FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-10", "PASACABLES, PISTOLA DE", "SILICONA Y CINTA DE PAPEL", "FRENTES, COSTADOS, D1, CORTE F-F Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_10")
