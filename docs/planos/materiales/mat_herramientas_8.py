"""MAT-HERRAMIENTAS-8 (rev. A) · Mechas de acero rápido Ø10 (9040) y Ø12 (9041), DIN 338, y cepillo de alambre con mango (9039).
Plano y 3D con las mismas medidas (perfiles_nherr.json: MECHAS con la sección polar del canal, CEPILLO). 3D: r3d/out/nherr_mechas.png.
Fuentes: r3d/FUENTES_nherr.md (DeWalt / Milwaukee / Metabo DIN 338: 10 → 133 / 87, 12 → 151 / 101; Lessmann 105451 / Bellota 50802-5)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

MC = PH["MECHAS"]; CE = PH["CEPILLO"]
h = nuevaH()


def mecha(h, m, ox, oy, e, cot=True):
    d, L, Lc, tp, paso = m["d"], m["L"], m["Lc"], m["punta"], m["paso"]
    X = lambda x: ox + x * e; Y = lambda y: oy - y * e; r = d / 2
    h.path(f"M{X(0)},{Y(0)} L{X(tp)},{Y(r)} H{X(L - .6)} L{X(L)},{Y(r - .6)} V{Y(-r + .6)} L{X(L - .6)},{Y(-r)} H{X(tp)} Z", "#fff", K, 1.2)
    h.ln(X(Lc), Y(r), X(Lc), Y(-r), K, .7)
    # canales: hélices vistas (curvas de la arista)
    for k in range(2):
        pts = []; x = tp
        while x <= Lc:
            ang = 2 * math.pi * x / paso + k * math.pi; y = r * math.cos(ang)
            pts.append((X(x), Y(y))) if math.sin(ang) > 0 else pts.append(None); x += .5
        seg = []
        for p in pts + [None]:
            if p: seg.append(p)
            elif len(seg) > 1: h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in seg), "none", K, .7); seg = []
            else: seg = []
    h.ln(X(-3), oy, X(L + 3), oy, K, .4, h.EJE)
    if cot:
        h.dimH(Y(r) - 12, X(0), X(L), f"{L}", ext=Y(r))
        h.dimH(Y(-r) + 14, X(0), X(Lc), f"{Lc} (CORTE)", ext=Y(-r))
        h.dimV(X(L) + 10, Y(r), Y(-r), f"Ø{d}", ext=X(L))


h.titulo(40, 58, "MECHAS HSS Ø10 (9040) Y Ø12 (9041) · DIN 338", "ESC. 1:1,7 · VISTA, CORTE A-A DEL CANAL (1,5:1) Y PUNTA 118° (1:1)")
mecha(h, MC["m9040"], 60, 130, 2.4)
mecha(h, MC["m9041"], 60, 230, 2.4)
h.txt(46, 92, "9040 · Ø10", 10, 700); h.txt(46, 196, "9041 · Ø12", 10, 700)
m = MC["m9040"]
lineaCorte(h, 60 + 30 * 2.4, 130 - 9 * 2.4, 60 + 30 * 2.4, 130 + 9 * 2.4, "A")
llamada(h, 60 + 48 * 2.4, 130 - 3 * 2.4, 60 + 44 * 2.4, 92, "CANAL (EVACUA LA VIRUTA)", sz=8.5)
llamada(h, 60 + 110 * 2.4, 130 - 4 * 2.4, 60 + 120 * 2.4, 88, "COLA CILINDRICA (MANDRIL)", sz=8.5)
# corte A-A
subt(h, 40, 290, "CORTE A-A", "ESC. 1,5:1 · 2 CANALES · ALMA AL MEDIO (*)")
cx, cy, ec = 110, 370, 6.0
h.path("M" + " L".join(f"{cx + x * ec:.1f},{cy - y * ec:.1f}" for x, y in m["secc"]) + " Z", "url(#MET)", K, 1.1)
h.circ(cx, cy, 5 * ec, "none", K, .5, h.OCULTA)
h.dimH(cy + 5 * ec + 14, cx - 5 * ec, cx + 5 * ec, "Ø10", ext=cy)
h.txt(cx + 5 * ec + 12, cy - 18, "ALMA ≈ 0,18 d (*)", 8.5, 400, OR); h.txt(cx + 5 * ec + 12, cy - 4, "FAJA (GUIA) EN EL BORDE", 8.5, 400, G)
# punta 118°
subt(h, 330, 290, "D1 · PUNTA", "ESC. 1:1 · ANGULO 118° · HELICE 30° (*)")
px, py, ep = 380, 370, 4.0
tp = m["punta"]
h.path(f"M{px},{py} L{px + tp * ep},{py - 5 * ep} H{px + 30 * ep} V{py + 5 * ep} H{px + tp * ep} Z", "#fff", K, 1.1)
h.a(f'<path d="{arcoPath(px, py, 40, -59, 59)}" fill="none" stroke="{K}" stroke-width=".6" transform="rotate(180 {px} {py})"/>')
h.ln(px, py, px + 60 * math.cos(math.radians(31)), py - 60 * math.sin(math.radians(31)), K, .4)
h.txt(px - 46, py + 4, "118°", 10, 700, K, "end")
h.txt(px + 30 * ep + 8, py + 4, f"PASO ≈ {n(m['paso'])} (*)", 8.5, 400, OR)
h.txt(330, 440, "HSS = ACERO RAPIDO: PARA METAL. EN HORMIGON VA MECHA DE WIDIA (OTRA).", 8.5, 400, G)

# ============ CEPILLO ============
subt(h, 40, 470, "CEPILLO DE ALAMBRE CON MANGO 9039", "ESC. 1:2,9 · ARRIBA Y COSTADO · REF. LESSMANN 105451 (290 · 5 HILERAS)")
e2 = 1.4; ox, oy = 60, 560
C = CE
cont = [(0, -C["ancho"] / 2), (C["largoHil"] + 20, -C["ancho"] / 2), (C["largoHil"] + 40, -C["ancho"] / 2 + 6), (C["L"] - 8, -9), (C["L"], -6), (C["L"], 6), (C["L"] - 8, 9), (C["largoHil"] + 40, C["ancho"] / 2 - 6), (C["largoHil"] + 20, C["ancho"] / 2), (0, C["ancho"] / 2)]
h.path("M" + " L".join(f"{ox + x * e2:.1f},{oy - y * e2:.1f}" for x, y in cont) + " Z", "url(#WOOD)", K, 1.1)
dx = C["largoHil"] / C["penachos"]; dy = (C["ancho"] - 6) / (C["hileras"] - 1)
for i in range(C["penachos"]):
    for j in range(C["hileras"]):
        h.circ(ox + (10 + i * dx + (j % 2) * dx * .3) * e2, oy - (-C["ancho"] / 2 + 3 + j * dy) * e2, 1.6, "#fff", K, .5)
h.circ(ox + (C["L"] - 14) * e2, oy, 3 * e2, "#fff", K, .7)
h.dimH(oy - C["ancho"] / 2 * e2 - 12, ox, ox + C["L"] * e2, f'{C["L"]}', ext=oy - C["ancho"] / 2 * e2)
h.dimH(oy + C["ancho"] / 2 * e2 + 14, ox + 10 * e2, ox + (10 + C["largoHil"]) * e2, f'{C["largoHil"]} (HILERAS)', ext=oy + C["ancho"] / 2 * e2)
h.dimV(ox - 10, oy - C["ancho"] / 2 * e2, oy + C["ancho"] / 2 * e2, f'{C["ancho"]} (*)', ext=ox, c=OR)
# costado
sy = 640
h.rect(ox, sy, C["L"] * e2, C["e"] * e2, "url(#WOOD)", K, 1.0)
for i in range(C["penachos"]):
    x = ox + (10 + i * dx) * e2
    for k in (-1.2, 0, 1.2): h.ln(x + k, sy + C["e"] * e2, x + k * 1.6, sy + (C["e"] + C["pelo"]) * e2, K, .35)
h.dimV(ox + C["L"] * e2 + 10, sy, sy + C["e"] * e2, f'{C["e"]} (*)', ext=ox + C["L"] * e2, c=OR)
h.dimV(ox - 10, sy + C["e"] * e2, sy + (C["e"] + C["pelo"]) * e2, f'{C["pelo"]}', ext=ox + 10 * e2)
h.txt(ox + 200 * e2 / 1.4, sy + 40, f'ALAMBRE Ø{n(C["alambre"])} · {C["hileras"]} HILERAS', 9, 400, K)

# ============ TABLAS Y NOTAS ============
EX = {9040: "Ø10 × 133 / 87", 9041: "Ø12 × 151 / 101", 9039: "290 · 5 HILERAS (*)"}
yt = tablaH(h, 40, 712, [(c, EX[c]) for c in (9040, 9041, 9039)], w=800, rowh=14.5)
cols = [(230, "l", False), (250, "c", False), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["MECHA Ø10 DIN 338", "133 TOTAL · 87 DE CORTE", "DEWALT DT5222 · METABO"],
       ["MECHA Ø12 DIN 338", "151 TOTAL · 101 DE CORTE", "MILWAUKEE 4932363554 · METABO"],
       ["CEPILLO 5 HILERAS", "290 · HILERAS 140 · PELO 25 · Ø0,30", "LESSMANN 105451 · BELLOTA 50802-5"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
notasW(h, 40, yt + 16, [
    "«A/RAP» = ACERO RAPIDO (HSS). (*) ANGULO DE PUNTA 118°, HELICE 30° Y ALMA: VALORES HABITUALES, NO LEIDOS DE LA NORMA. CEPILLO: ANCHO Y ESPESOR (*).",
    "UNIDADES DEL RESPALDO TAL CUAL (UN)."], w=800, lh=13.5)

# ============ 3D ============
h.titulo(890, 58, "VISTA 3D - MECHAS HSS Y CEPILLO DE ALAMBRE", "MECHAS HELICOIDALES DE 2 CANALES · CEPILLO DE 5 HILERAS")
A3 = img3d(h, "nherr_mechas", 884, 80, 600)
columna(h, A3, [("m10_punta", "1", "PUNTA 118°"), ("m10_canal", "2", "CANAL HELICOIDAL"), ("m10_cola", "3", "COLA"), ("m12_punta", "", "9041 Ø12"),
                ("c_cuerpo", "4", "CUERPO DE MADERA"), ("c_pelo", "5", "PENACHOS DE ALAMBRE"), ("c_mango", "6", "MANGO"), ("c_ojo", "", "AGUJERO PARA COLGAR")], 1500, 120, 440, paso=40)
usoBloque(h, 890, 500, [
    "MECHAS Ø10 / Ø12: AGUJEREAR CHAPA, PERFILES Y SOPORTES PARA BULONES M8 Y M10 (TABLERO, RACK, GRAMPAS, PLACA BASE) (*).",
    "CON TALADRO A BAJAS VUELTAS Y ACEITE DE CORTE; PRIMERO UN AGUJERO GUIA CHICO.",
    "CEPILLO: LIMPIAR OXIDO Y REBABA ANTES DE PINTAR (9002), LIMPIAR ROSCAS Y LA ZONA DEL TOMACABLE ANTES DE AJUSTAR (BUEN CONTACTO DE LA PAT).",
    "ANTEOJOS SIEMPRE: SE SUELTAN ALAMBRES."], w=740)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_mechas.mjs) CON LAS MISMAS MEDIDAS. FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-8", "MECHAS HSS Ø10 / Ø12", "Y CEPILLO DE ALAMBRE", "VISTAS, CORTES A-A, D1 Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_8")
