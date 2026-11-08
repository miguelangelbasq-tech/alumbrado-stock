"""MAT-HERRAMIENTAS-9 (rev. A) · Cajas y organizadores: caja de herramientas plástica 13" con bandeja (8037), caja grande para herramientas (9013)
y estuche organizador apilable 15" (9020). Plano y 3D con las mismas medidas (perfiles_nherr.json: CAJAS). 3D: r3d/out/nherr_cajas.png.
Fuentes: r3d/FUENTES_nherr.md (Jadever JDTB1313 / Wadfow WDFWTB3313: 330 × 170 × 140 con 1 bandeja; Truper 13": 33 × 18 × 13)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

C = PH["CAJAS"]; A, B, O = C["c8037"], C["c9013"], C["c9020"]
h = nuevaH()


def caja(h, c, ox, oy, e, corte=True, cot=True, ast=False):
    L, W_, H = c["L"], c["A"], c["H"]; hb = H * .72; t = 3
    X = lambda x: ox + x * e; Y = lambda z: oy - z * e
    # frente (corte A-A por el medio si corte=True)
    if corte:
        h.rect(X(0), Y(H), L * e, H * e, "#fff", K, .5)
        for (x0, x1, z0, z1) in [(0, L, 0, t), (0, t, t, hb), (L - t, L, t, hb), (0, L, H - t, H), (0, t, hb, H - t), (L - t, L, hb, H - t)]:
            h.rect(X(x0), Y(z1), (x1 - x0) * e, (z1 - z0) * e, "url(#PLAS)", K, .8)
        zb = hb - c["bandeja"]
        for (x0, x1, z0, z1) in [(t + .5, L - t - .5, zb, zb + 2), (t + .5, t + 2.5, zb, hb), (L - t - 2.5, L - t - .5, zb, hb)]:
            h.rect(X(x0), Y(z1), (x1 - x0) * e, (z1 - z0) * e, "url(#PLAS2)", K, .7)
        for xd in (L / 2 - L * .18, L / 2 + L * .12): h.rect(X(xd - 1), Y(hb - 6), 2 * e, (c["bandeja"] - 8) * e, "url(#PLAS2)", K, .5)
        h.ln(X(-4), Y(hb), X(L + 4), Y(hb), K, .5, h.OCULTA)
        h.rect(X(L * .2), Y(H + 24), (L * .6) * e, 10 * e, "#fff", K, .9)
    else:
        h.rect(X(0), Y(H), L * e, H * e, "#fff", K, 1.1); h.ln(X(0), Y(hb), X(L), Y(hb), K, .8)
    c_ = OR if ast else K; s_ = " (*)" if ast else ""
    if cot:
        h.dimH(Y(0) + 14, X(0), X(L), f"{L}{s_}", ext=Y(0), c=c_)
        h.dimV(X(L) + 12, Y(H), Y(0), f"{H}{s_}", ext=X(L), c=c_)
    return X, Y


h.titulo(40, 58, "CAJA DE HERRAMIENTAS 13\" CON BANDEJA 8037 · CORTE A-A", "ESC. 1:4 · CUBETA + TAPA CON BISAGRA + BANDEJA REMOVIBLE · REF. JADEVER JDTB1313 (330 × 170 × 140)")
X, Y = caja(h, A, 140, 270, 1.0)
for (px, pz, tx, tz, t) in [(A["L"] * .75, A["H"] + 19, A["L"] * .95, A["H"] + 30, "MANIJA"), (A["L"] * .3, A["H"] * .72 - A["bandeja"] / 2, -30, A["H"] * .55, "BANDEJA REMOVIBLE"),
                            (1.5, A["H"] * .3, -30, A["H"] * .3, "CUBETA (PP) (*)"), (A["L"] - 1.5, A["H"] * .86, A["L"] + 26, A["H"] * .86, "TAPA")]:
    llamada(h, X(px), Y(pz), X(tx), Y(tz), t, sz=8.5, anc="end" if tx < 0 else "start", c=OR if "(*)" in t else K)
# costado
sx = 560
h.rect(sx, 270 - A["H"], A["A"], A["H"], "#fff", K, 1.1); h.ln(sx, 270 - A["H"] * .72, sx + A["A"], 270 - A["H"] * .72, K, .8)
h.rect(sx - 4, 270 - A["H"] * .72 - 18, 4, 36, "#fff", K, .8); h.txt(sx - 8, 270 - A["H"] * .72 + 26, "TRABA", 8, 400, G, "end")
h.dimH(284, sx, sx + A["A"], f'{A["A"]}', ext=270)
h.txt(sx, 270 - A["H"] - 8, "COSTADO", 9, 700, G)

subt(h, 40, 310, "CAJA GRANDE PARA HERRAMIENTAS 9013", "ESC. 1:7,3 · FRENTE · MEDIDA NO INFORMADA EN EL PAÑOL (*)")
X2, Y2 = caja(h, B, 60, 500, .55, corte=False, ast=True)
h.txt(60, 540, "CUBETA + TAPA CON BISAGRA, BANDEJA Y TRABAS (*)", 8.5, 400, OR)

subt(h, 440, 310, "ESTUCHE ORGANIZADOR APILABLE 15\" 9020", "ESC. 1:7,3 · ARRIBA · 12 DIVISIONES (*)")
e3 = .55; ox, oy = 470, 375
h.rect(ox, oy, O["L"] * e3, O["A"] * e3, "#fff", K, 1.2)
nx, ny = O["divs"]
for i in range(1, nx): h.ln(ox + O["L"] * e3 * i / nx, oy, ox + O["L"] * e3 * i / nx, oy + O["A"] * e3, K, 1.0)
for j in range(1, ny): h.ln(ox, oy + O["A"] * e3 * j / ny, ox + O["L"] * e3, oy + O["A"] * e3 * j / ny, K, 1.0)
h.dimH(oy - 10, ox, ox + O["L"] * e3, f'{O["L"]} (≈ 15") (*)', ext=oy, c=OR)
h.dimV(ox + O["L"] * e3 + 12, oy, oy + O["A"] * e3, f'{O["A"]} (*)', ext=ox + O["L"] * e3, c=OR)
h.txt(ox, oy + O["A"] * e3 + 22, f'ALTO {O["H"]} (*) · TAPA TRANSPARENTE · ENCASTRA ARRIBA DE OTRO', 8.5, 400, OR)

bloque(h, 40, 572, "QUE VA EN CADA UNA (SUGERIDO) (*)", [
    "8037 (13\"): CAJA DE CADA CUADRILLA — PINZAS AISLADAS, DESTORNILLADORES, CRIMPEADORA, CINTA, PUNTERAS EN LA BANDEJA.",
    "9013 (GRANDE): HERRAMIENTA PESADA DEL VEHICULO — MAZAS, PUNTERO, LLAVES FRANCESAS, CORTA CABLE A CRIQUET.",
    "9020 (ORGANIZADOR): PUNTERAS TIF POR SECCION, TERMINALES, PRECINTOS, TARUGOS Y TORNILLOS, FUSIBLES."], w=800, sz=9.5, lh=13)

EX = {8037: "330 × 170 × 140 (*) · 1 BANDEJA", 9013: "≈ 480 × 250 × 230 (*)", 9020: "≈ 380 × 290 × 80 (*)"}
yt = tablaH(h, 40, 672, [(c, EX[c]) for c in (8037, 9013, 9020)], w=800, rowh=14.5)
cols = [(230, "l", False), (250, "c", False), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["CAJA 13\" CON BANDEJA", "330 × 170 × 140 · PP · 1 BANDEJA", "JADEVER JDTB1313 · WADFOW WDFWTB3313"],
       ["CAJA 13\" (OTRA)", "330 × 180 × 130 · CON CHAROLA", "TRUPER FICHA 10826"],
       ["9013 Y 9020", "SIN MEDIDA PUBLICADA (*)", "PROPORCIONALES (*)"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
notasW(h, 40, yt + 16, [
    "(*) EL RESPALDO NO DA MEDIDAS NI MARCA: 8037 SE DIBUJA COMO LA DE REFERENCIA (330 × 170 × 140); 9013 Y 9020: MEDIDAS Y DIVISIONES PROPORCIONALES. COLORES DE REFERENCIA.",
    "LAS HERRAMIENTAS AISLADAS VAN SEPARADAS DE MECHAS, DISCOS Y PUNTAS (NO SE MARCAN NI SE CORTAN LAS CAPAS).",
    "UNIDADES DEL RESPALDO TAL CUAL (Un. / UN)."], w=800, lh=13.5)

h.titulo(890, 58, "VISTA 3D - CAJAS Y ORGANIZADOR", "LA 13\" CON UNA VENTANA DE CORTE (SE VE LA BANDEJA) · LA GRANDE ABIERTA")
A3 = img3d(h, "nherr_cajas", 884, 80, 600)
columna(h, A3, [("a_tapa", "1", "TAPA"), ("a_manija", "2", "MANIJA"), ("a_traba", "3", "TRABA"), ("a_bandeja", "4", "BANDEJA"), ("a_corte", "", "VENTANA DE CORTE"), ("a_cuerpo", "5", "CUBETA 8037"),
                ("b_tapa", "", "9013 TAPA ABIERTA"), ("b_band", "", "9013 BANDEJA"), ("b_cuerpo", "", "9013 CUBETA"), ("o_tapa", "6", "TAPA TRANSPARENTE"), ("o_div", "7", "DIVISIONES"), ("o_traba", "", "9020 TRABAS")], 1500, 96, 500, paso=34)
usoBloque(h, 890, 540, [
    "GUARDAR Y LLEVAR LA HERRAMIENTA DE MANO A LA OBRA, ORDENADA Y CONTADA (VALE DEL PAÑOL / REMITO DE HERRAMIENTA RH).",
    "AL VOLVER, REVISAR QUE ESTE TODO ANTES DE CERRAR LA ORDEN.",
    "EL ORGANIZADOR EVITA MEZCLAR PUNTERAS DE DISTINTA SECCION.",
    "NO APILAR PESO ARRIBA DE LA TAPA TRANSPARENTE DEL ORGANIZADOR."], w=740)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_cajas.mjs) CON LAS MISMAS MEDIDAS. FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-9", "CAJAS DE HERRAMIENTAS", "Y ORGANIZADOR", "FRENTE, CORTE A-A, COSTADO, PLANTA Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_9")
