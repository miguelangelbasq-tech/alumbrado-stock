"""MAT-HERRAMIENTAS-2 (rev. A) · Pinza corta cable a criquet hasta 240 mm² (9018) y pinza crimpeadora para punteras TIF 0,75–10 mm² «ES-10WF» (9021).
Plano y 3D con los mismos contornos (perfiles_nherr.json: CRIQ, CRIMP). 3D: r3d/out/nherr_criquet.png.
Fuentes: r3d/FUENTES_nherr.md (Knipex 95 36 250; Goobay HSC8 6-4A, Klauke K 301/6). La ES-10WF no tiene ficha publicada: todo proporcional (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

Q, C = PH["CRIQ"], PH["CRIMP"]
h = nuevaH()

# ============ 1. CORTA CABLE A CRIQUET 9018 ============
h.titulo(40, 58, "CORTA CABLE A CRIQUET 9018 · HASTA 240 mm²", "ESC. 1:2,7 · VISTA DE ARRIBA, ABIERTA · REF. KNIPEX 95 36 250 (250 × 115 × 20 · 652 g)")
e = 1.5; ox, oy = 70, 200
v = Vista(h, ox, oy, e)
def banda(m, off):
    x1 = m["x0"] + m["L"]; dx, dy = m["L"], m["c1"] - m["c0"]; L = math.hypot(dx, dy); nx, ny = -dy / L * (m["hc"] + off), dx / L * (m["hc"] + off)
    return [(m["x0"] + nx, m["c0"] + ny), (x1 + nx, m["c1"] + ny), (x1 - nx, m["c1"] - ny), (m["x0"] - nx, m["c0"] - ny)]
def bandaT(m, a, b, off):
    t = lambda x: m["c0"] + (m["c1"] - m["c0"]) * (x - m["x0"]) / m["L"]
    dx, dy = m["L"], m["c1"] - m["c0"]; L = math.hypot(dx, dy); nx, ny = -dy / L * (m["hc"] + off), dx / L * (m["hc"] + off)
    xa, xb = m["x0"] + a, m["x0"] + m["L"] - b
    return [(xa + nx, t(xa) + ny), (xb + nx, t(xb) + ny), (xb - nx, t(xb) - ny), (xa - nx, t(xa) - ny)]
multi(v, Q["contFija"], "#fff", 1.2)
multi(v, Q["contMovil"], "#fff", 1.2)
for m in (Q["manijaF"], Q["manijaM"]):
    v.poly(banda(m, m["ais"]), "#fff", 1.0); v.poly(bandaT(m, 3, m["L"] - 9, m["ais"] + 4), "#fff", 1.0)
    v.poly(bandaT(m, 22, 12, m["grip"]), "url(#TPE)", 1.0)
cu = Q["cuchilla"]
v.circ(Q["piv"]["x"], Q["piv"]["y"], 6.2, "#fff", 1); v.circ(Q["piv"]["x"], Q["piv"]["y"], 2.4, "none", .5)
v.circ(cu["cx"] - 8, 6, 13.5, "none", .9, 'stroke-dasharray="5 3"'); v.circ(cu["cx"] - 8, 6, Q["Dcap"] / 2, "none", .6, h.EJE)
v.cotaH(cu["cx"] - 8 - 16, cu["cx"] - 8 + 16, 40, "Ø32 MAX.", zext=6)
v.cotaH(cu["cx"] - Q["fija"]["R"], Q["L"], -84, f'{Q["L"]}', zext=-46)
h.dimV(ox + (Q["L"] + 12) * e, oy - 62 * e, oy + 50 * e, "115 (ABIERTA)")
for (x, y, tx, ty, t, an) in [(cu["cx"] + 18, -16, 92, -58, "CUCHILLA FIJA (PAVONADA)", "start"), (cu["cx"] - 18, -18, 30, -70, "DIENTES DEL CRIQUET", "start"),
                              (cu["cx"] + 4, 20, 40, 58, "CUCHILLA MOVIL", "start"), (Q["piv"]["x"], Q["piv"]["y"], 100, 60, "EJE", "start"),
                              (cu["cx"] - 8, 18, -2, 70, "CABLE 4 × 120 (EJEMPLO)", "start")]:
    p = v.p(x, y); q = v.p(tx, ty); llamada(h, p[0], p[1], q[0], q[1], t, sz=8.5, anc=an)
q = v.p(128, 4); h.txt(q[0], q[1] + 3, "MANGOS AISLADOS 1000 V", 8.5, 700, G); sello2d(h, q[0] - 10, q[1], 5, "", K)
# corte B-B por la boca: dos cuchillas superpuestas
subt(h, 560, 92, "CORTE B-B · BOCA", "ESC. 1:2 · LAS DOS CUCHILLAS, UNA SOBRE OTRA")
bx, by = 600, 175
h.rect(bx, by - 5.5 * 2, 200, 5.5 * 2, "url(#MET)", K, 1.1); h.rect(bx, by, 200, 5.5 * 2, "url(#MET)", K, 1.1)
h.rect(bx + 40, by - 30, 54, 60, "#fff", K, .8, 'stroke-dasharray="5 3"'); h.txt(bx + 67, by + 46, "CABLE", 8.5, 400, G, "middle")
h.dimV(bx + 214, by - 11, by + 11, "11 (*)", ext=bx + 200, c=OR)
h.txt(bx, by - 22, "MOVIL", 8.5, 400, G); h.txt(bx + 110, by + 26, "FIJA", 8.5, 400, G)
bloque(h, 560, 250, "COMO CORTA", [
    "SE ABRE CON LA TRABA Y SE ENGANCHA EL CABLE EN LA CUCHILLA FIJA.",
    "CADA APRETON AVANZA UN DIENTE: LA MOVIL CORTA EN VARIOS PASOS.",
    "Cu O Al HASTA 240 mm² (Ø32). NO CORTA ACERO NI CABLE MUY FLEXIBLE."], w=270, sz=9, lh=12.5)

# ============ 2. CRIMPEADORA 9021 ============
subt(h, 40, 375, "CRIMPEADORA DE PUNTERAS TIF 9021 «ES-10WF»", "ESC. 1:2 · CERRADA · REF. GOOBAY HSC8 6-4A / KLAUKE K 301/6 (175, AUTOAJUSTABLE)")
e2 = 1.95; cx, cy = 60, 492
v2 = pinzaArriba(h, C, cx, cy, e2, corte=False)
k = C["criquet"]
for i in range(k["n"]):
    a = math.radians(-35 + 70 * i / (k["n"] - 1)); p = v2.p(k["x"] + k["r"] * math.cos(a) - k["r"], k["r"] * math.sin(a) * .5 + 2); h.circ(p[0], p[1], 1.4, "#fff", K, .5)
for (x, y, tx, ty, t, an) in [(C["muescas"][3][0], 1, 6, 30, "BOCAS (MATRIZ)", "start"), (k["x"] - 2, 4, 90, 34, "CRIQUET (NO ABRE HASTA EL FINAL)", "start"),
                              (C["xh"] + 40, -C["c0"] - 6, 100, -36, "MANGO: PLASTICO, NO AISLADO (*)", "start")]:
    p = v2.p(x, y); q = v2.p(tx, ty); llamada(h, p[0], p[1], q[0], q[1], t, sz=8.5, anc=an, c=OR if "(*)" in t else K)

bloque(h, 40, 610, "COMO SE ENGARZA", [
    "PELAR EL LARGO DE LA PUNTERA (≈ 8 A 12 mm) (*) Y RETORCER LOS HILOS.",
    "METER EL CABLE HASTA QUE ASOME EL COBRE POR LA PUNTA.",
    "PONER LA PUNTERA EN LA BOCA DE SU SECCION Y APRETAR HASTA QUE EL CRIQUET SUELTE.",
    "TIRAR DEL CABLE: NO TIENE QUE SALIR."], w=360, sz=9, lh=12.5)
# D1 matrices
subt(h, 420, 590, "D1 · MATRICES (BOCAS POR SECCION)", "ESC. 1,25:1 · CERRADA: CADA BOCA CIERRA LA PUNTERA EN HEXAGONO (*)")
e3 = 5.0; mx, my = 432, 680
v3 = Vista(h, mx, my, e3)
xe = C["muescas"][-1][0] + C["muescas"][-1][1] / 2 + 3
for sg in (1, -1):
    pts = [(0, sg * .15)]
    for xc, w, hh in C["muescas"]:
        pts += [(xc - w / 2, sg * .15), (xc - w * .32, sg * (hh + .15)), (xc + w * .32, sg * (hh + .15)), (xc + w / 2, sg * .15)]
    pts += [(xe, sg * .15), (xe, sg * 9), (0, sg * 9)]
    v3.poly(pts, "url(#MET)", 1.1)
for (xc, w, hh), (sec, _) in zip(C["muescas"], C["bocas"]):
    p = v3.p(xc, 9); h.txt(p[0], p[1] - 6, n(sec, 2), 8.5, 700, K, "middle")
    p2 = v3.p(xc, -9); h.txt(p2[0], p2[1] + 13, f"{n(w)}", 8, 400, OR, "middle")
h.txt(mx - 6, my - 9 * e3 - 6, "mm²", 8.5, 700, K, "end"); h.txt(mx - 6, my + 9 * e3 + 13, "ANCHO (*)", 8, 400, OR, "end")
# puntera antes y después
px0, py0 = 440, 790
subt(h, 420, 756, "D2 · PUNTERA TIF 2,5 mm² ANTES Y DESPUES", "ESC. 1:1")
h.rect(px0, py0, 72, 14, "url(#CU)", K, .9); h.rect(px0 - 30, py0 - 4, 30, 22, "#fff", K, .9); h.txt(px0 - 15, py0 + 33, "COLLAR", 8, 400, G, "middle")
h.dimV(px0 + 82, py0, py0 + 14, "", ext=px0 + 72); h.txt(px0 + 90, py0 + 11, "Ø3,5 (*)", 8.5, 400, OR)
qx = 640; h.path(f"M{qx},{py0 + 14} L{qx + 8},{py0} H{qx + 64} L{qx + 72},{py0 + 14} Z", "url(#CU)", K, .9); h.txt(qx + 36, py0 + 33, "ENGARZADA", 8, 400, G, "middle")
flecha(h, px0 + 140, py0 + 7, qx - 10, py0 + 7)

# ============ TABLAS Y NOTAS ============
yt = tablaH(h, 40, 846, [(9018, "250 · Ø32 · 240 mm²"), (9021, "0,75–10 mm² (*)")], w=800, rowh=14.5)
cols = [(230, "l", False), (250, "c", False), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["9018: CAPACIDAD", "Cu/Al 240 mm² · Ø32 · 500 MCM", "KNIPEX 95 36 250 (DISTRIBUIDORES)"],
       ["9018: NO SIRVE PARA", "ACERO, CABLE DE ACERO, EXTRAFLEXIBLE", "KNIPEX 95 36 250"],
       ["9021: TIPO Y LARGO", "AUTOAJUSTABLE · ≈ 175", "GOOBAY / KLAUKE (NO HAY FICHA ES-10WF) (*)"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
notasW(h, 40, yt + 16, [
    "(*) «ES-10WF» NO APARECE PUBLICADA: FORMA DE LA CABEZA, BOCAS (CANTIDAD, ANCHO, PERFIL) Y LARGO: PROPORCIONALES. CONFIRMAR CON LA PINZA.",
    "LA CRIMPEADORA NO ES HERRAMIENTA AISLADA (SIN MARCA IEC 60900): SOLO SIN TENSION. EN EL CATALOGO HAY OTRA, 2022 (CRIQUET TIFF 6–16 mm²).",
    "UNIDADES DEL RESPALDO TAL CUAL (Un. / UN). LA PUNTERA SE ELIGE POR LA SECCION DEL CABLE, NO POR LA BORNERA."], w=800, lh=13.5)

# ============ 3D ============
h.titulo(890, 58, "VISTA 3D - CORTA CABLE A CRIQUET Y CRIMPEADORA", "CABLE 4 × 120 EN LA BOCA · PUNTERA TIF EN LA BOCA DE 2,5 mm²")
A = img3d(h, "nherr_criquet", 884, 80, 560)
columna(h, A, [("k_movil", "1", "CUCHILLA MOVIL"), ("k_fija", "2", "CUCHILLA FIJA"), ("k_dientes", "3", "DIENTES DEL CRIQUET"), ("k_eje", "4", "EJE"),
               ("k_una", "5", "UÑA Y RESORTE"), ("k_cable", "", "CABLE (EJEMPLO)"), ("k_mangoM", "6", "MANGO AISLADO"), ("k_mangoF", "", "MANGO FIJO"),
               ("c_cab", "7", "CABEZA 9021"), ("c_bocas", "8", "BOCAS"), ("c_tif", "", "PUNTERA TIF"), ("c_criq", "9", "CRIQUET"), ("c_eje", "", "EJE 9021"),
               ("c_mango", "10", "MANGO (NO AISLADO)")], 1462, 92, 520, paso=29)
usoBloque(h, 890, 640, [
    "9018: CORTAR EL CABLE SUBTERRANEO Y EL DE ACOMETIDA (Cu 4 × 16, PREENSAMBLADO 3 × 1 × 25/50) A ESCUADRA, SIN APLASTARLO.",
    "SIRVE PARA DEJAR LA PUNTA LISTA PARA EL EMPALME O PARA ENTRAR AL TABLERO.",
    "9021: ENGARZAR PUNTERAS TIF EN CADA CABLE QUE ENTRA A UNA BORNERA (BPN, PORTAFUSIBLE, TERMICA): 1,5 · 2,5 · 4 · 6 · 10 mm².",
    "LA PUNTERA SIGUE EL CALIBRE DEL CABLE (CLAUDE.md §11.3): 3 × 1,5 → TIF 1,5 · Cu 4 × 4 → TIF 4.",
    "LAS DOS: SIN TENSION. LA 9018 TIENE MANGOS 1000 V; LA 9021 NO."], w=740)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_criquet.mjs) CON LOS MISMOS CONTORNOS. FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-2", "CORTA CABLE A CRIQUET", "Y CRIMPEADORA TIF", "VISTAS, CORTE B-B, MATRICES D1, D2 Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_2")
