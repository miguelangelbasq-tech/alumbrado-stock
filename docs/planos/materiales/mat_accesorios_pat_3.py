"""MAT-ACCESORIOS_PAT-3 (rev. B) · Cables de puesta a tierra (7008 / 7009 / 7010 = 1032 / 7011 / 7012, desnudos 1013 y 1012) y el caño H°G° del ítem 77.
Geometría: r3d/piezas/perfiles_pat.mjs (CAB10, CANO) y perfiles_cables.mjs (u10v); 3D: r3d/out/pat_acc3a.png, pat_acc3b.png. Fuentes: r3d/FUENTES_pat.md"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patkit import *

Cn = PP["CANO"]; c34 = Cn["c34"]
h = hojaP()

# ================= CORTES DE LOS CABLES (9:1) =================
h.titulo(40, 62, "CORTES DE LOS CABLES DE PAT", "ESC. 9:1 · Ø DE FICHA DONDE HAY · HILOS: CLASE 5 (AISLADOS) Y 7 HILOS (DESNUDOS)")
e = 9.0; y0 = 175
def hex_hilos(cx, cy, R, rw):
    """llena el círculo R con alambres de radio rw (anillos hexagonales)"""
    k = 0
    while True:
        r = 2 * k * rw
        if r + rw > R + 1e-6: break
        n = 1 if k == 0 else 6 * k
        for i in range(n):
            a = 2 * math.pi * i / n + k * .3
            h.circ(cx + r * math.cos(a), cy + r * math.sin(a), rw * .96, "url(#cuG)", "#7a3a12", .35)
        k += 1
items = [("1 × 2,5 V/A", "7008", 3.6, 1.0, .9, "(*)"), ("1 × 6 V/A", "7009", 4.7, 1.38, .8, ""), ("1 × 10 V/A", "7010 · 1032 · 7011 · 7012", 6.0, 2.0, 1.0, ""),
         ("Cu DESNUDO 35", "1013", 7.56, 0, 0, "(*)"), ("ACERO-Cu 1 × 25", "1012", 6.39, 0, 0, "(*)")]
x = 85
for nom, cods, D, Rc, ea, ast in items:
    cx = x; R = D / 2 * e
    if Rc:
        h.circ(cx, y0, R, "url(#PVCV)", K, 1.3); h.circ(cx, y0, Rc * e, "#fff", K, .7)
        hex_hilos(cx, y0, Rc * e - 1, .2 * e if Rc > 1.2 else .16 * e)
        h.txt(cx, y0 + R + 32, f"Ø{str(D).replace('.', ',')} {ast}".strip(), 9.5, 400, OR if ast else K, "middle")
    else:
        rw = D / 6 * e
        for i in range(7):
            a = 2 * math.pi * (i - 1) / 6; rr = 0 if i == 0 else 2 * rw
            px, py = cx + rr * math.cos(a), y0 + rr * math.sin(a)
            if nom.startswith("ACERO"):
                h.circ(px, py, rw * .97, "url(#cuG)", "#7a3a12", .7); h.circ(px, py, rw * .72, "url(#ACE)", K, .5)
            else: h.circ(px, py, rw * .97, "url(#cuG)", "#7a3a12", .7)
        h.txt(cx, y0 + R + 32, f"≈ Ø{str(round(D, 1)).replace('.', ',')} {ast}", 9.5, 400, OR, "middle")
    h.dimH(y0 + R + 12, cx - R, cx + R, "", ext=y0)
    h.txt(cx, y0 - 52, nom, 10, 700, K, "middle"); h.txt(cx, y0 - 39, cods, 9, 400, G, "middle", MONO)
    x += 160 if x < 300 else 155
h.txt(40, 262, "1 × 6 Y 1 × 10: Ø Y AISLACION DE FICHA (IRAM NM 247-3, SUPERASTIC JET). DESNUDOS: 7 HILOS DE Ø 2,52 (35) Y 2,13 (25), Ø CALCULADO.", 9.5)
h.txt(40, 275, "ACERO-COBRE: CADA HILO ES DE ACERO CON SU CAPA DE COBRE (SE VE EN EL CORTE DEL HILO).", 9.5)

# ================= VISTA 1 × 10 PELADO PARA OJAL (2:1) =================
h.titulo(40, 310, "1 × 10 V/A PELADO PARA EL OJAL (7010)", "ESC. 2:1 · LARGO PELADO = LARGO DEL BARRIL (*)")
e2 = 2.0; vx, vy = 60, 380; La = 110; Lp = 16
h.rect(vx, vy - 3 * e2, La * e2, 6 * e2, "#fff", K, 1.3)
for i in range(16): xx = vx + 8 + i * 13.5; h.path(f"M{xx},{vy - 3 * e2} l7,{6 * e2}", "none", K, .45)
h.rect(vx + La * e2, vy - 2 * e2, Lp * e2, 4 * e2, "url(#CU)", K, 1.1)
h.dimH(vy - 3 * e2 - 14, vx + La * e2, vx + (La + Lp) * e2, "16 (*)", ext=vy - 2 * e2, c=OR)
h.dimV(vx - 14, vy - 3 * e2, vy + 3 * e2, "Ø6,0", ext=vx)
llamada(h, vx + 60, vy + 3 * e2, vx + 80, vy + 30, "AISLACION PVC VERDE-AMARILLO (FRANJAS)")
llamada(h, vx + (La + 8) * e2, vy + 2 * e2, vx + (La + 50) * e2, vy + 12, "CUERDA Ø4,0 → AL OJAL O A LA PUNTERA")

# ================= ITEM 77: CAÑO H°G° 3/4" (2:1) =================
h.titulo(40, 440, "ÍTEM 77 - CAÑO H°G° CON EL CABLE DE PAT (CORTE)", 'ESC. 2:1 · CAÑO 3/4" (*) · ROSCA GAS BSP 55°, 14 HILOS/PULG · CUPLA')
e3 = 2.0; cy3 = 540; xc0 = 60; ro = c34["De"] / 2; ri = ro - c34["e"]; P3 = c34["paso"]; Lr = Cn["rosca"]; cu = Cn["cupla"]
L1 = 120; xcu = xc0 + (L1 - Lr / 2) * e3   # la cupla empieza en la mitad de la rosca
for lado in (-1, 1):
    out = roscaPts(xc0 + (L1 - Lr) * e3, xc0 + L1 * e3, cy3, ro, P3, 55, e3, lado)
    d = f"M{xc0:.1f},{cy3 + lado * ri * e3:.1f} L{xc0:.1f},{cy3 + lado * ro * e3:.1f} L{out[0][0]:.1f},{cy3 + lado * ro * e3:.1f} " + " ".join(f"L{x:.1f},{y:.1f}" for x, y in out) + f" L{xc0 + L1 * e3:.1f},{cy3 + lado * ri * e3:.1f} Z"
    h.path(d, "url(#HG)", K, 1.2)
    # caño de arriba (rosca hacia la cupla) explotado a la derecha
    xb0 = xc0 + (L1 + 30) * e3
    out2 = roscaPts(xb0, xb0 + Lr * e3, cy3, ro, P3, 55, e3, lado, fase=.3)
    d2 = f"M{xb0:.1f},{cy3 + lado * ri * e3:.1f} " + " ".join(f"L{x:.1f},{y:.1f}" for x, y in out2) + f" L{xb0 + 90 * e3:.1f},{cy3 + lado * ro * e3:.1f} L{xb0 + 90 * e3:.1f},{cy3 + lado * ri * e3:.1f} Z"
    h.path(d2, "url(#HG)", K, 1.2)
    inn = roscaPts(xcu, xcu + cu["L"] * e3, cy3, ro, P3, 55, e3, lado, ext=False)
    d3 = poly(inn) + f" L{xcu + cu['L'] * e3:.1f},{cy3 + lado * (ro + cu['e']) * e3:.1f} L{xcu:.1f},{cy3 + lado * (ro + cu['e']) * e3:.1f} Z"
    h.path(d3, "url(#HG)", K, 1.2)
# cable adentro
h.rect(xc0 - 10, cy3 - 3 * e3, (L1 + 30 + 90) * e3 + 20, 6 * e3, "url(#PVCV)", K, .8)
ejeH(h, xc0 - 16, xc0 + (L1 + 30 + 90) * e3 + 16, cy3)
h.dimV(xc0 - 20, cy3 - ro * e3, cy3 + ro * e3, "Ø26,9 (*)", ext=xc0, c=OR)
h.dimH(cy3 - (ro + cu["e"]) * e3 - 14, xcu, xcu + cu["L"] * e3, "CUPLA 40 (*)", ext=cy3 - (ro + cu["e"]) * e3, c=OR)
h.dimH(cy3 + ro * e3 + 34, xc0 + (L1 - Lr) * e3, xc0 + L1 * e3, "ROSCA 30 (*)", ext=cy3 + ro * e3, c=OR)
llamada(h, xc0 + 30, cy3 - ri * e3 - 2, xc0 + 20, cy3 - ro * e3 - 26, "CAÑO H°G° (PARED 2,65 (*))", OR)
llamada(h, xc0 + 330, cy3 + 2, xc0 + 360, cy3 + ro * e3 + 40, "CABLE 1 × 10 V/A")
# D2: perfil BSP
h.titulo(600, 440, "D2 - ROSCA GAS (BSP)", "ESC. 15:1 · 55° · P = 1,814")
dx0, dy0 = 610, 540; ed = 15.0; Hf = P3 / (2 * math.tan(math.radians(27.5)))
pts = []
for i in range(3 * 16 + 1):
    z = 3 * P3 * i / 48; s = (z / P3) % 1; tri = 1 - abs(2 * s - 1); rr = min(Hf / 6 * 5, max(Hf / 6, Hf * tri)); pts.append((dx0 + z * ed, dy0 - (rr - Hf / 6) * ed))
h.path(poly(pts) + f" L{dx0 + 3 * P3 * ed},{dy0 + 24} L{dx0},{dy0 + 24} Z", "url(#HG)", K, 1.1)
h.dimH(dy0 - .64 * P3 * ed - 18, dx0 + P3 * .5 * ed, dx0 + P3 * 1.5 * ed, "1,814", ext=dy0 - .64 * P3 * ed)
h.txt(600, dy0 + 44, "ROSCA CONICA 1:16 EN EL CAÑO (BSPT, ISO 7-1),", 9.5); h.txt(600, dy0 + 57, "CILINDRICA EN LA CUPLA. CINTA O SELLADOR.", 9.5)

# ================= TABLAS =================
yC = codigos(h, 40, 630, [7010, 1032, 7011, 7012, 7009, 7008, 1013, 1012], {7010: "jabalina → borne / barra", 1032: "= 7010 (otro código)", 7011: "rollo · se carga en m", 7012: "rollo 200 m · en m",
                                                                            7009: "uso a confirmar (*)", 7008: "tierra del artefacto", 1013: "electrodo / malla (*)", 1012: "electrodo / malla (*)"}, wdesc=420, wx=180, rowh=15)
yD = bloque(h, 40, yC + 16, "DATOS TECNICOS Y DONDE SE USA", [
    "AISLADOS: Cu CLASE 5, PVC VERDE-AMARILLO (IRAM NM 247-3). 1 × 10: Ø 6,0 · AISLACION 1,0. LOS CABLES SE CARGAN SIEMPRE EN METROS (CLAUDE.md §11.3).",
    "1 × 10 V/A: DE LA JABALINA AL BORNE, BULON O BARRA (AP-TC-005, TC-PRFV-02, AP-T-007). CALCULO: 10 m POR TABLERO + 7 m POR CIRCUITO (PRFV) O 4 m POR COLUMNA.",
    "1 × 2,5 V/A: TIERRA DEL ARTEFACTO; VA CON EL 10 mm² EN LA BANDERITA (AP-TC-006). ÍTEM 77: «CAÑO H°G° CON JABALINA, TOMACABLE, TERMINAL Y CABLE 1 × 10»."], w=800, sz=10, lh=13.5)
notasW(h, 40, yD + 2, [
    "COTAS EN mm. MANDA LA COTA. LOS CORTES MUESTRAN LA SECCION NOMINAL DEL CATALOGO.",
    "(*) Ø DEL 1 × 2,5 Y DE LOS DESNUDOS, Ø Y PARED DEL CAÑO DEL ÍTEM 77 (SE DIBUJA 3/4\" PORQUE LA APP YA TIENE LA CURVA H°G° 3/4\" 5503), LARGO PELADO: A CONFIRMAR.",
    "1032 «CABLE V y A 10 mm (PLAZA-MUNICIPALIDAD)» ES EL MISMO MATERIAL QUE 7010: NO SE UNEN CODIGOS. 7011 / 7012 SON ROLLOS PERO SE CARGAN EN m.",
    "(*) USO DEL 1 × 6 V/A (7009) Y DE LOS DESNUDOS (1013, 1012) EN ESTA OBRA: NO ESTA DEFINIDO EN LAS FICHAS. PREGUNTAR. FUENTES: r3d/FUENTES_pat.md."], w=800, lh=14)
rayadosC(h, 40, 1104, ["CU", "PVCV", "HG", "ACE"], cols=4, dx=190)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - LOS CINCO CABLES, PUNTA PELADA", "V/A CON CUERDA CLASE 5 · Cu DESNUDO 7 HILOS · ACERO-COBRE CON EL ALMA A LA VISTA")
A = img3d(h, "pat_acc3a", 860, 100, 600)
columna(h, A, [("ac25", "", "ACERO-Cu 1 × 25 (1012)"), ("hilo", "", "HILO: ACERO + CAPA DE Cu"), ("d35", "", "Cu DESNUDO 35 (1013)"), ("cu10", "", "CUERDA CLASE 5"),
               ("a10", "", "1 × 10 V/A (7010)"), ("a6", "", "1 × 6 V/A (7009)"), ("a25", "", "1 × 2,5 V/A (7008)")], 1450, 110, 500, paso=36)
h.txt(890, 556, "ÍTEM 77 - CAÑO H°G° CON CUPLA, CORTADO A CUARTO (ROSCA BSP REAL) Y EL 1 × 10 ADENTRO (*)", 11, 700, NV, "start", INT)
A2 = img3d(h, "pat_acc3b", 860, 560, 560)
columna(h, A2, [("canoS", "", "CAÑO (TRAMO QUE SIGUE)"), ("roscaS", "", "ROSCA BSP 55°"), ("cupla", "", "CUPLA H°G°"), ("roscaC", "", "ROSCA DE LA CUPLA"), ("cable", "", "CABLE 1 × 10 V/A"),
                ("rosca", "", "ROSCA DEL CAÑO (CORTE)"), ("cano", "", "CAÑO H°G° 3/4\" (*)"), ("pared", "", "PARED + GALVANIZADO")], 1420, 600, 990, paso=34)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/pat_acc3a.mjs, pat_acc3b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_pat.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-ACCESORIOS_PAT-3", "CABLES DE PAT", "Y CAÑO H°G° (ÍTEM 77)", "CORTES, VISTA, CAÑO EN CORTE, D2 Y 3D", "9:1 / 2:1", "D2 15:1 · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_accesorios_pat_3.svg"))
