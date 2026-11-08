"""MAT-HERRAMIENTAS-3 (rev. A) · Destornilladores aislados 1000 V (IEC 60900): Phillips 6 × 150 (9025), plano 6 × 150 (9026), plano 6 × 125 (9027),
Phillips 6 × 100 (9028). Plano y 3D con las mismas medidas (perfiles_nherr.json: DESTOR, PH2). 3D: r3d/out/nherr_destor.png.
Fuentes: r3d/FUENTES_nherr.md (PB Swiss 5100.5-150 6,5 × 1,2 × 150 · L 255; Wera PH2 × 100 · L 198–205; Recahispania mango 99 / Ø34)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

D, PH2 = PH["DESTOR"], PH["PH2"]
h = nuevaH()


def destor(h, d, ox, oy, e, cot=True):
    r, v, m = d["d"] / 2, d["vaina"], d["mango"]; X = lambda x: ox + x * e; Y = lambda y: oy - y * e
    def sim(pts, fill="#fff", sw=1.0):
        up = [(X(x), Y(y)) for x, y in pts]; dn = [(X(x), Y(-y)) for x, y in reversed(pts)]
        h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in up + dn) + " Z", fill, K, sw)
    if d["tipo"] == "PL":
        a = d["hoja"][0]; sim([(0, a / 2), (14, r)])
    else:
        sim([(0, .9), (PH2["conoL"], r)])
        h.ln(X(.6), oy, X(PH2["conoL"] * .85), oy, K, 1.6)
    sim([(14 if d["tipo"] == "PL" else PH2["conoL"], r), (v["libre"], r)])
    sim([(v["libre"], r + v["e"]), (d["L"] + 2, r + v["e"])], "url(#PLAS)", .9)
    x0, Lm = d["L"], m["L"]
    prof = [(0, r), (0, m["Dcol"] / 2 - 3), (2.5, m["Dcol"] / 2), (7, m["Dcol"] / 2), (11, m["D"] / 2 - 4.5), (Lm - 8, m["D"] / 2 - 3.6), (Lm - 3, m["D"] / 2 - 1.6), (Lm, m["D"] / 2 - 4)]
    sim([(x0 + x, y) for x, y in prof], "#fff", 1.1)
    h.rect(X(x0 + 16), Y(m["D"] / 2 - .4), (Lm - 30) * e, (m["D"] - .8) * e, "url(#TPE)", K, 1.0)
    for yy in (r * .9, -r * .9): h.ln(X(d["L"]), Y(yy), X(d["L"] + Lm * .7), Y(yy), K, .5, h.OCULTA)
    h.ln(X(-4), oy, X(d["total"] + 4), oy, K, .4, h.EJE)
    sello2d(h, X(x0 + 50), oy, 4.5, "1000 V", K, 6)
    if cot:
        h.dimH(Y(m["D"] / 2) - 10, X(0), X(d["total"]), f'{d["total"]} (*)' if d["cod"] in (9025, 9027) else f'{d["total"]}', ext=Y(m["Dcol"] / 2), c=OR if d["cod"] in (9025, 9027) else K)
        h.dimH(Y(-m["D"] / 2) + 12, X(0), X(d["L"]), f'{d["L"]}', ext=Y(-r))
        h.dimH(Y(r + v["e"]) - 7, X(0), X(v["libre"]), "", ext=Y(r), c=OR); h.txt(X(v["libre"]) + 6, Y(r + v["e"]) - 4, f'{v["libre"]} SIN AISLAR (*) · IEC ≤ 18 (*)', 8.5, 400, OR)
        h.dimV(X(d["total"]) + 12, Y(m["D"] / 2 - .4), Y(-m["D"] / 2 + .4), f'Ø{m["D"]} (*)', ext=X(x0 + Lm - 14), c=OR)


# ============ 1. VISTAS ============
h.titulo(40, 58, "DESTORNILLADORES AISLADOS 1000 V · VISTAS DE COSTADO", "ESC. 1:2,9 · PUNTA · CAÑA CON VAINA · MANGO BIMATERIAL CON COLLAR")
e = 1.38
filas = [("d9025", "9025 · PHILLIPS PH2 × 150 (*)"), ("d9026", "9026 · PLANO 6,5 × 1,2 × 150"), ("d9027", "9027 · PLANO 6 × 1,0 × 125 (*)"), ("d9028", "9028 · PHILLIPS PH2 × 100")]
for i, (k, t) in enumerate(filas):
    y = 150 + i * 104
    h.txt(46, y - 50, t, 10, 700, OR if "(*)" in t else K)
    destor(h, D[k], 52, y, e)
# llamadas en la primera
d = D["d9026"]; y1 = 140 + 98
for (x, yy, tx, ty, t) in [(3, 0, 20, 30, "PUNTA (SIN AISLAR)"), (60, d["d"] / 2 + 1.1, 90, 26, "VAINA AISLANTE"), (d["L"] + 4, 17, d["L"] - 26, 28, "COLLAR (TOPE)"),
                           (d["L"] + 70, 16.6, d["L"] + 120, 30, "CAPA BLANDA"), (d["L"] + 95, 13, d["L"] + 128, -28, "CAPA DURA")]:
    pass

# ============ 2. CORTES Y PUNTAS ============
subt(h, 600, 92, "CORTE C-C · CAÑA", "ESC. 2:1 · VAINA SOBRE EL ACERO")
cx, cy, ee = 680, 175, 8
h.circ(cx, cy, (d["d"] / 2 + d["vaina"]["e"]) * ee, "url(#PLAS)", K, 1.1); h.circ(cx, cy, d["d"] / 2 * ee, "url(#MET)", K, 1.1)
h.dimH(cy - 44, cx - d["d"] / 2 * ee, cx + d["d"] / 2 * ee, "Ø6,5", ext=cy)
h.txt(cx + 52, cy - 4, f'VAINA {n(d["vaina"]["e"])} (*)', 9, 400, OR); h.txt(cx + 52, cy + 10, "ACERO Cr-V (*)", 9, 400, OR)
subt(h, 600, 248, "CORTE D-D · MANGO", "ESC. 1:2 · CAPA DURA ROJA + CAPA BLANDA (TPE)")
cx, cy, ee = 670, 335, 2.0
m = d["mango"]
pts = []
for i in range(120):
    a = 2 * math.pi * i / 120; rr = m["D"] / 2 - .4 - 1.6 * abs(math.cos(3 * a)) ** 6; pts.append((cx + rr * ee * math.cos(a), cy - rr * ee * math.sin(a)))
h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in pts) + " Z", "url(#TPE)", K, 1.1)
h.circ(cx, cy, (m["D"] / 2 - 4.2) * ee, "url(#PLAS)", K, 1.0); h.circ(cx, cy, d["d"] / 2 * .9 * ee, "url(#MET)", K, .9)
h.dimH(cy - m["D"] / 2 * ee - 10, cx - m["D"] / 2 * ee, cx + m["D"] / 2 * ee, f'Ø{m["D"]} (*)', ext=cy, c=OR)
h.txt(cx + 46, cy - 6, "6 LOBULOS: NO RUEDA", 9, 400, G); h.txt(cx + 46, cy + 8, "SOBRE LA MESA (*)", 9, 400, OR)
subt(h, 600, 410, "D1 · PUNTA PLANA Y PH2", "ESC. 1,5:1")
px, py, e6 = 620, 470, 6
a_, t_ = d["hoja"]
h.rect(px, py - t_ / 2 * e6, a_ * e6, t_ * e6, "url(#MET)", K, 1.1)
h.dimH(py - 20, px, px + a_ * e6, "6,5", ext=py - 4); h.dimV(px + a_ * e6 + 12, py - t_ / 2 * e6, py + t_ / 2 * e6, "1,2", ext=px + a_ * e6)
h.txt(px, py + 34, "PLANO (FRENTE)", 8.5, 400, G)
qx, qy = 760, 470
h.circ(qx, qy, 3 * e6, "#fff", K, 1.0)
for k in range(4):
    a = math.radians(45 + 90 * k); h.path(f"M{qx:.1f},{qy:.1f} L{qx + 3 * e6 * math.cos(a - .14):.1f},{qy - 3 * e6 * math.sin(a - .14):.1f} L{qx + 3 * e6 * math.cos(a + .14):.1f},{qy - 3 * e6 * math.sin(a + .14):.1f} Z", "#333", K, .4)
h.txt(qx, qy + 34, "PH2 (FRENTE)", 8.5, 400, G, "middle"); h.txt(qx + 26, qy - 18, "ISO 8764 (*)", 8, 400, OR)

# ============ TABLAS Y NOTAS ============
EX = {9025: "PH2 (*) × 150", 9026: "6,5 × 1,2 × 150", 9027: "6 × 1,0 (*) × 125", 9028: "PH2 × 100"}
yt = tablaH(h, 40, 560, [(c, EX[c]) for c in (9025, 9026, 9027, 9028)], w=800, rowh=14.5)
cols = [(230, "l", False), (250, "c", False), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["9026: HOJA Y LARGO", "6,5 × 1,2 × 150 · TOTAL 255", "PB SWISS 5100.5-150 (BUERKLIN)"],
       ["9028: LARGO TOTAL", "198 A 205", "WERA PH2 × 100 (RS)"],
       ["MANGO", "≈ 99 DE LARGO · Ø34", "RECAHISPANIA VDE 6,5 × 150"],
       ["PUNTA SIN AISLAR", "≤ 18 (*)", "IEC 60900 (NO SE PUDO LEER EL TEXTO) (*)"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
yr = rayadosC(h, 40, yt + 20, ["MET", "PLAS", "TPE"], cols=3, dx=200, rowh=18)
notasW(h, 40, yr + 16, [
    "EL RESPALDO DICE «6 × 150», «6 × 125», «6 × 100»: EN LOS PHILLIPS SE TOMA PH2 (CAÑA Ø6) Y EN EL 9027 HOJA 6 × 1,0 (*). CONFIRMAR CON LA HERRAMIENTA.",
    "(*) LARGO TOTAL DE 9025 Y 9027, Ø Y FORMA DEL MANGO, ESPESOR DE LA VAINA Y LARGO DE PUNTA SIN AISLAR: PROPORCIONALES A LAS REFERENCIAS.",
    "LA VAINA CUBRE LA CAÑA HASTA LA PUNTA: SI ESTA CORTADA O CORRIDA, EL DESTORNILLADOR YA NO ES AISLADO. MARCA: DOBLE TRIANGULO + 1000 V + IEC 60900.",
    "UNIDADES DEL RESPALDO TAL CUAL (UN / un)."], w=800, lh=13.5)

# ============ 3D ============
h.titulo(890, 58, "VISTA 3D - DESTORNILLADORES AISLADOS", "EL 9026 CORTADO A CUARTO: ACERO, VAINA, CAPA DURA Y CAPA BLANDA")
A = img3d(h, "nherr_destor", 884, 80, 600)
columna(h, A, [("9025_punta", "1", "PUNTA PH2"), ("9026_punta", "2", "PUNTA PLANA"), ("9025_vaina", "3", "VAINA AISLANTE"), ("c_acero", "4", "CAÑA (ACERO)"),
               ("c_nucleo", "5", "CAPA DURA"), ("c_blanda", "6", "CAPA BLANDA"), ("c_collar", "7", "COLLAR"), ("c_sello", "8", "IEC 60900 · 1000 V"),
               ("9025_mango", "", "9025 PH2 × 150"), ("9027_mango", "", "9027 PLANO 6 × 125"), ("9028_mango", "", "9028 PH2 × 100")], 1500, 96, 500, paso=32)
usoBloque(h, 890, 640, [
    "AJUSTAR LOS BORNES DE LA BORNERA BPN, DEL PORTAFUSIBLE Y DE LA TERMICA EN EL TABLERITO DE LA COLUMNA Y EN EL TABLERO (PLANOS 6,5 Y 6).",
    "TORNILLOS PHILLIPS DE TAPAS, CAJAS Y LUMINARIAS (PH2).",
    "EL LARGO (150) LLEGA A LOS BORNES DEL FONDO DE LA CAJA SIN METER LA MANO.",
    "AJUSTE: EL QUE PIDE EL FABRICANTE DEL BORNE (EJ. BPN-06 0,8–1,6 N·m, WDU 6) (*).",
    "SIN TENSION: LA AISLACION ES LA SEGUNDA BARRERA."], w=740)
bloque(h, 890, 790, "CONTROL ANTES DE USAR", [
    "VAINA SANA HASTA LA PUNTA (SIN CORTES, SIN CORRERSE).",
    "MANGO SIN GRIETAS NI QUEMADURAS; MARCA 1000 V LEGIBLE.",
    "PUNTA SIN REDONDEAR: UNA PUNTA GASTADA RESBALA Y DAÑA EL BORNE.",
    "NO SE USA COMO PALANCA NI SE GOLPEA."], w=740, sz=10, lh=13.5)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_destor.mjs) CON LAS MISMAS MEDIDAS. FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-3", "DESTORNILLADORES", "AISLADOS 1000 V", "VISTAS, CORTES C-C Y D-D, PUNTAS Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_3")
