"""MAT-EMPALMES-3 (rev. B) · Conector estanco IP68 Pampaco QR 23 (2501) — ESQUEMA — y, como VARIANTE sin código, empalme recto termocontraíble de BT.
Plano y 3D con los mismos números: r3d/piezas/perfiles_conex.mjs (QR23, TERMOJ, UNION). 3D: r3d/out/conex_qr23.png y conex_termoj.png.
Datos: catálogo del pañol (2501: Pampaco QR 23 IP68 3 × 4 mm², pliego 15.14). La ficha no trae medidas: todo el QR 23 va (*).
Referencia termocontraíble: HellermannTyton LVK (12 × 250); unión 2060 (DIN 46267)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conexkit import *

h = nueva3()
Q = PC["QR23"]; L, r, tL, tD = Q["L"], Q["D"] / 2, Q["tuerca"]["L"], Q["tuerca"]["D"] / 2; rc = 5.55; xb0 = (L - Q["cuerpoL"]) / 2
TJ = PC["TERMOJ"]; U = PC["UNION"]; C = PC["CABLE"]["c4x10"]
COLS = [COLOR["L1"], COLOR["L2"], COLOR["L3"], COLOR["N"]]

# ================= 1. CORTE A-A · QR 23 (ESQUEMA) · ESC. 4:1 =================
e = 4.1; v = Vista(h, 150, 214, e)
h.titulo(40, 62, "CORTE A-A - CONECTOR ESTANCO QR 23 (2501)", "ESQUEMA: LA FICHA NO TRAE MEDIDAS (*) · ARRIBA CORTE, ABAJO VISTA · ESC. 4:1")
v.poly([[xb0, r - 2], [xb0, r], [L - xb0, r], [L - xb0, r - 2]], "url(#PLAS)", 1.2)
for x0_, s in ((0, 1), (L, -1)):
    v.poly([[x0_, rc + .2], [x0_, tD], [x0_ + s * tL, tD], [x0_ + s * tL, rc + .2]], "url(#PLAS2)", 1.1)
    v.poly([[x0_ + s * (tL - 2), rc + .05], [x0_ + s * (tL - 2), r - 2.05], [x0_ + s * (tL + 8), r - 2.05], [x0_ + s * (tL + 8), rc + .05]], "url(#GOM)", .8)
    v.poly([[x0_, -tD], [x0_, -rc], [x0_ + s * tL, -rc], [x0_ + s * tL, -tD]], "#fff", 1.1)
    for k_ in range(1, 6): v.linea([[x0_ + s * tL * k_ / 6, -tD], [x0_ + s * tL * k_ / 6, -tD + 1.2]], .4)
v.rect(xb0, L - xb0, -r, -rc, "#fff", 1.2)
for a_, b_ in ((-22, 22), (L - 22, L + 22)):
    v.rect(a_, b_, rc - 1, rc, "url(#PLAS2)", .8); v.rect(a_, min(b_, tL) if a_ < 0 else max(a_, L - tL), -rc, 0, "#fff", .8)
v.rect(L / 2 - 8, L / 2 + 8, -6, -2.6, "#fff", .8); v.rect(L / 2 - 6.5, L / 2 + 6.5, -2.6, .8, "url(#CU)", .8)
for xx in (L / 2 - 3.2, L / 2 + 3.2): v.rect(xx - 1.4, xx + 1.4, .8, 2.1, "#fff", .8); v.linea([[xx - 1, 1.6], [xx + 1, 1.6]], .8)
for s in (-1, 1):
    x1 = L / 2 + s * 7; xe = 22 if s < 0 else L - 22
    v.linea([[xe, 2.6 - 1.6], [x1 - s * 10, -.9], [x1 - s * 3.2, -.9]], 2.2, "#6e3b1d"); v.rect(min(x1 - s * 3.2, x1 + s * 3), max(x1 - s * 3.2, x1 + s * 3), -1.7, -.1, "url(#HIL)", .4)
v.eje(-24, 0, L + 24, 0)
v.cotaH(0, L, -tD - 3, "L (*)", zext=-tD, c=OR)
v.cotaV(L + 25, -tD, tD, "Ø (*)", yext=L - tL / 2, c=OR)
for n, (y, z), (gx, gy), tx in [("1", (L / 2 + 14, r - 1), (520, 112), "CUERPO (PA) (*)"), ("2", (L - 7, tD - 1), (620, 136), "TUERCA DE CIERRE (*)"), ("3", (tL + 3, r - 3), (130, 112), "JUNTA DE GOMA (*)"),
                                ("4", (L / 2 + 4, .2), (620, 160), "BORNERA 3 POLOS (*)"), ("5", (-14, rc - .5), (130, 136), "CABLE 3 x 1,5 / 3 x 2,5")]:
    a_ = v.p(y, z); h.globo(n, a_[0], a_[1], gx, gy, r=9); h.txt(gx + 14, gy + 4, tx, 9, 400, OR if "(*)" in tx else K)
a_, b_ = v.p(L / 2 - 3.2, tD + 2), v.p(L / 2 - 3.2, -tD - 1); lineaCorte(h, a_[0], a_[1], b_[0], b_[1], "B")

# ================= 2. SECCION B-B · POR LA BORNERA (color) · ESC. 4:1 =================
k = 4.6; cx, cy = 130, 432
h.titulo(40, 336, "SECCION B-B", "POR UN TORNILLO · ESC. 4,5:1 (*)")
anillo(h, cx, cy, r, r - 2, "PLAS", k, 1.1)
h.rect(cx - 4.9 * k, cy - (-2.6) * k, 9.8 * k, 3.4 * k, "#fff", K, .7)
for i, yy in enumerate((-3.2, 0, 3.2)):
    h.rect(cx + (yy - 1.4) * k, cy - .8 * k, 2.8 * k, 3.4 * k, "url(#CU)", K, .7)
    h.circ(cx + yy * k, cy + .9 * k, .9 * k, ["#e9a466"][0], "#6a3510", .4)
    h.rect(cx + (yy - 1.4) * k, cy - 2.1 * k, 2.8 * k, 1.3 * k, "#fff", K, .7)
for t_, c_ in (("L", COLOR["L1"]), ("N", COLOR["N"]), ("PE", COLOR["PE"])): pass
h.txt(cx + r * k + 8, cy - 6, "3 POLOS: L · N · PE", 9, 400); h.txt(cx + r * k + 8, cy + 8, "TORNILLO EN CADA LADO", 9, 400); h.txt(cx + r * k + 8, cy + 22, "HASTA 4 mm² (PAÑOL)", 9, 400)

# ================= 3. D1 · VARIANTE: EMPALME TERMOCONTRAIBLE 4 x 10 · ESC. 1:1,5 =================
e3 = 1.62; w = Vista(h, 100, 650, e3)
h.titulo(40, 520, "D1 - VARIANTE: EMPALME TERMOCONTRAIBLE", "SIN CODIGO EN EL PAÑOL · CABLE 4 x 10 · ARRIBA CORTE, ABAJO VISTA · ESC. 1:1,6 (*)")
LJ = TJ["L"]; Dj = TJ["Dext"] / 2; rv = C["D"] / 2
prA = [[rv, 0], [rv + .9, 0], [rv + .9, 40], [Dj - 2.0, 60], [Dj - 2.0, LJ - 60], [rv + .9, LJ - 40], [rv + .9, LJ], [rv, LJ], [rv, LJ - 38], [Dj - 3.0, LJ - 58], [Dj - 3.0, 58], [rv, 38]]
prE = [[rv + .9, 0], [rv + 2.4, 0], [rv + 2.4, 40], [Dj, 60], [Dj, LJ - 60], [rv + 2.4, LJ - 40], [rv + 2.4, LJ], [rv + .9, LJ], [rv + .9, LJ - 40], [Dj - 2.0, LJ - 60], [Dj - 2.0, 60], [rv + .9, 40]]
secRT(w, prA, "ADH", .7); secRT(w, prE, "PLAS3", 1.0)
for a_, b_ in ((-30, 50), (LJ - 50, LJ + 30)): w.rect(a_, b_, rv - 1.6, rv, "url(#PLAS2)", .8)
rs = 5.2; xU = [74, 92, 128, 146]
xu = xU[1]; w.rect(xu, xu + U["L"], rs - U["De"] / 2, rs + U["De"] / 2, "url(#CU)", .7)
w.rect(xu - 8, xu + U["L"] + 8, rs + U["De"] / 2, rs + U["De"] / 2 + .7, "url(#PLAS3)", .6)
w.linea([[-30, 3.5], [52, 3.5], [62, rs], [xu, rs]], 1.6, "#26282b"); w.linea([[xu + U["L"], rs], [LJ - 62, rs], [LJ - 52, 3.5], [LJ + 30, 3.5]], 1.6, "#26282b")
w.poly([[t_, -r_] for r_, t_ in prE[:7]] + [[LJ, 0], [0, 0]], "#fff", 1.0)
for a_, b_ in ((-30, 0), (LJ, LJ + 30)): w.rect(a_, b_, -rv, 0, "#fff", .9)
w.eje(-34, 0, LJ + 34, 0)
w.cotaH(0, LJ, -Dj - 5, "250 (*)", zext=-rv - 2.4, c=OR)
w.cotaV(LJ + 26, -Dj, Dj, "Ø24 (*)", yext=LJ / 2, c=OR)
for t_, (y, z), (gx, gy) in [("MANGA EXTERIOR (*)", (180, Dj - .5), (470, 548)), ("ADHESIVO (*)", (20, rv + .5), (210, 548)), ("MANGA INTERIOR POR CONDUCTOR (*)", (xu + 6, rs + 3.5), (340, 568)),
                              ("UNION 2060", (xu + 20, rs), (560, 576)), ("VAINA 4 x 10", (-20, rv - .8), (60, 548))]:
    a_ = w.p(y, z); llamada(h, a_[0], a_[1], gx, gy, t_, OR if "(*)" in t_ else K, sz=9)
a_, b_ = w.p(xu + 10, Dj + 4), w.p(xu + 10, -Dj - 2); lineaCorte(h, a_[0], a_[1], b_[0], b_[1], "C")

# ================= 4. SECCION C-C (color) =================
k4 = 4.2; cx4, cy4 = 540, 432
h.titulo(452, 336, "SECCION C-C", "D1 POR LAS UNIONES · ESC. 4:1 (*)")
anillo(h, cx4, cy4, Dj, Dj - 2.0, "PLAS3", k4, 1.0); h.circ(cx4, cy4, (Dj - 2.0) * k4, "#f1e2a8", K, .5); h.circ(cx4, cy4, (Dj - 2.0) * k4, "url(#ADH)", K, .5)
rIn = math.sqrt(10 / math.pi) + .7
for i, a in enumerate([math.pi, math.pi / 2, 0, -math.pi / 2]):
    px, py = cx4 + rs * math.cos(a) * k4, cy4 - rs * math.sin(a) * k4
    if xU[i] <= xu + 10 <= xU[i] + U["L"]:
        h.circ(px, py, (U["De"] / 2 + .7) * k4, "#26282b", K, .5); h.circ(px, py, U["De"] / 2 * k4, "url(#CU)", K, .6); hilos(h, px, py, 7, 1.35, U["Di"] / 2 - .05, k4, sw=.25)
    else:
        h.circ(px, py, (rIn + .7) * k4, "#26282b", K, .5); h.circ(px, py, rIn * k4, COLS[i], K, .6); h.circ(px, py, (rIn - .7) * k4, "#e9a466", K, .4)
h.dimH(cy4 - Dj * k4 - 10, cx4 - Dj * k4, cx4 + Dj * k4, "Ø24 (*)", ext=cy4, c=OR)
h.txt(cx4 + Dj * k4 + 10, cy4 - 4, "L1 Y L2: UNION 2060", 9, 400); h.txt(cx4 + Dj * k4 + 10, cy4 + 10, "CON SU MANGA INTERIOR", 9, 400)

# ================= TABLAS =================
TY = 720
fc = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO"], cat(2501, 60) + ["IP68 · 3 x 4 mm² · ITEM 15.14"],
      cat(2060, 60) + ["VA EN LA VARIANTE (D1)"], ["—", "VARIANTE: EMPALME RECTO TERMOCONTRAIBLE BT", "—", "SIN CODIGO (*)"]]
yt = h.tabla(40, TY, [(50, "c", True), (410, "l", False), (34, "c", False), (220, "l", False)], fc, rowh=15, titulo="CODIGOS DEL PAÑOL", colores=colorOR)
yr = rayados3(h, 40, yt + 20, ["PLAS", "PLAS2", "GOM", "CU", "HIL", "PLAS3", "ADH"], cols=4, dx=200, rowh=19)
notasW(h, 40, yr + 16, [
    "QR 23 «O SIMILAR», 3 x 4 mm², IP68: ITEM 15.14 DEL PLIEGO LP 21478, «SEGUN DISPONIBILIDAD». NO SE ENCONTRO FICHA DE PAMPACO EN LA WEB.",
    "(*) TODO EL QR 23 ES UN ESQUEMA (CUERPO, TUERCAS, JUNTAS, BORNERA Y MEDIDAS): A CONFIRMAR CON LA HOJA DEL FABRICANTE O MIDIENDO UNO DEL PAÑOL.",
    "(*) EL EMPALME TERMOCONTRAIBLE NO ESTA EN EL PAÑOL: MEDIDAS DE REFERENCIA (HELLERMANNTYTON LVK, 12 x 250). PARA EL TRONCAL ENTERRADO HOY VA CON RESINA (MAT-EMPALMES-2).",
    "SE USA CUANDO EL EMPALME NO SE PUEDE HACER DENTRO DEL ARTEFACTO. EL CABLE DE LA COLUMNA A LA LUMINARIA ES EL 3 x 1,5 (6001)."], w=800, lh=13.5)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - CONECTOR ESTANCO QR 23 (ESQUEMA)", "MEDIO CORTE: CUERPO, TUERCAS, JUNTAS Y BORNERA DE 3 POLOS · FORMA Y MEDIDAS (*)")
A = img3d(h, "conex_qr23", 880, 84, 640)
columna(h, A, [("cuerpo", "1", "CUERPO (*)"), ("tuerca", "2", "TUERCA DE CIERRE (*)"), ("junta", "3", "JUNTA (*)"), ("bornera", "4", "BORNERA (*)")], 1500, 120, 380, paso=28)
columna(h, A, [("cable", "5", "CABLE")], 902, 360, 380)
h.titulo(890, 450, "VARIANTE: EMPALME TERMOCONTRAIBLE 4 x 10 (SIN CODIGO)", "CORTE A CUARTO: MANGA EXTERIOR, ADHESIVO, MANGAS INTERIORES Y UNIONES 2060")
A2 = img3d(h, "conex_termoj", 880, 470, 640)
columna(h, A2, [("exterior", "", "MANGA EXTERIOR (*)"), ("interior", "", "MANGA INTERIOR (*)"), ("conductor", "", "CONDUCTOR XLPE"), ("union", "", "UNION 2060"), ("adhesivo", "", "ADHESIVO (*)")], 1500, 490, 720, paso=26)
columna(h, A2, [("vaina", "", "VAINA 4 x 10")], 902, 720, 740)
bloque(h, 890, 790, "DATOS TECNICOS", [
    "QR 23: CONECTOR ESTANCO IP68 (SUMERGIBLE), 3 CONDUCTORES DE HASTA 4 mm² (DESCRIPCION DEL PAÑOL).",
    "SE ARMA: PASAR TUERCAS Y JUNTAS, PELAR, AJUSTAR LOS TORNILLOS, CERRAR EL CUERPO Y APRETAR LAS TUERCAS (*).",
    "TERMOCONTRAIBLE: MANGA DE POLIOLEFINA CON ADHESIVO; AL CALENTAR SE CONTRAE Y EL ADHESIVO SELLA (*)."], w=740, sz=10, lh=14)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/conex_qr23.mjs, conex_termoj.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES_conex.md", 9.5, 400, G, "start", INT)
rotuloB(h, "MAT-EMPALMES-3", "CONECTOR ESTANCO IP68 QR 23", "Y EMPALME TERMOCONTRAIBLE", "CORTE A-A, SECCIONES B-B Y C-C, D1 Y 3D", "ESQUEMA", "3D S/E")
guardar(h, "mat_empalmes_3")
