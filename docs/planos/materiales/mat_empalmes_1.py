"""MAT-EMPALMES-1 (rev. B) · Conector de empalme en línea con palanca WAGO 221-2411 (2001) y, como VARIANTE sin código, empalme en gel IP68.
Plano y 3D con los mismos números: r3d/piezas/perfiles_conex.mjs (WAGO, GEL). 3D: r3d/out/conex_wago.png y conex_gel.png.
Datos: FICHAS_TEC.empalmes (Farnell: 35,5 × 8,9 × 8,1 · 32 A · 450 V), hoja de datos WAGO (0,2–4 mm², carcasa transparente, palanca naranja), Etelec LDJ01."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conexkit import *

h = nueva3()
Wg = PC["WAGO"]; L, H, A = Wg["L"], Wg["H"], Wg["A"]; PEL = Wg["pelar"]; LP = Wg["palanca"]["L"]
pw = .8          # pared de la carcasa (*)
zc = 3.4; rI = 3.66 / 2; rC = .9

def resorte(xc_, s):
    pl = [[-3.8, 1.4], [-3.8, 6.3], [-2.6, 7.3], [1.6, 7.3], [2.8, 6.2], [2.8, 3.6], [1.2, 2.2]]
    return [[xc_ + s * u, z] for u, z in pl]
def tiraPol(pl, tt):
    Lp, Rp = [], []
    for i in range(len(pl)):
        a = pl[max(0, i - 1)]; b = pl[min(len(pl) - 1, i + 1)]; dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy) or 1
        nx, ny = -dy / l, dx / l; Lp.append([pl[i][0] + nx * tt / 2, pl[i][1] + ny * tt / 2]); Rp.append([pl[i][0] - nx * tt / 2, pl[i][1] - ny * tt / 2])
    return Lp + Rp[::-1]

# ================= 1. CORTE A-A (longitudinal por el centro) · ESC. 8:1 =================
e = 7.6; v = Vista(h, 236, 272, e)
h.titulo(40, 62, "CORTE A-A", "POR EL MEDIO · IZQ. CERRADO · DER. ABIERTO, CABLE ENTRANDO · ESC. 7,5:1")
# carcasa (policarbonato transparente): paredes en corte
v.poly([[0, 0], [L, 0], [L, H], [0, H]], "url(#VID)", 1.4)
v.poly([[pw, pw], [L - pw, pw], [L - pw, H - pw], [pw, H - pw]], "#fff", .8)
for x0_ in (0, L - pw): v.rect(x0_, x0_ + pw, zc - 1.5, zc + 1.5, "#fff", 0)   # bocas
v.linea([[0, zc - 1.5], [pw, zc - 1.5]], .8); v.linea([[0, zc + 1.5], [pw, zc + 1.5]], .8)
v.linea([[L - pw, zc - 1.5], [L, zc - 1.5]], .8); v.linea([[L - pw, zc + 1.5], [L, zc + 1.5]], .8)
v.rect(L / 2 - .4, L / 2 + .4, pw, H - pw, "url(#VID)", .6)
# barra de corriente
v.rect(2.2, L - 2.2, .9, 1.9, "url(#CU)", .9)
# resortes
for s in (-1, 1): v.poly(tiraPol(resorte(L / 2 + s * L / 4, s), .48), "url(#MET)", .7)
# cable izquierdo (entra hasta el tope, pelado 11)
v.rect(-15, 0, zc + rC, zc + rI, "url(#PLAS2)", .8); v.rect(-15, 0, zc - rI, zc - rC, "url(#PLAS2)", .8)
v.rect(-15, PEL - .5, zc - rC, zc + rC, "url(#HIL)", .6)
# cable derecho entrando (4 mm afuera)
xs = L + 4.2
v.rect(xs, xs + 11, zc + rC, zc + rI, "url(#PLAS2)", .8); v.rect(xs, xs + 11, zc - rI, zc - rC, "url(#PLAS2)", .8)
v.rect(L - PEL + 4, xs + 11, zc - rC, zc + rC, "url(#HIL)", .6)
# palancas: izquierda cerrada, derecha abierta 60°
v.rect(L / 2 - .6 - LP, L / 2 - .6, H - 1.0, H + 1.0, "url(#PLAS)", 1.0)
ang = math.radians(Wg["palanca"]["abre"]); px, pz = L / 2 + .6, H - .6
lev = [[0, -.4], [LP, -.4], [LP, 1.6 + .6], [LP - 4, 1.6 + .6], [LP - 4, 1.6], [0, 1.6]]
v.poly([[px + u * math.cos(ang) - w_ * math.sin(ang), pz + u * math.sin(ang) + w_ * math.cos(ang)] for u, w_ in lev], "url(#PLAS)", 1.0)
v.circ(px, pz, .9, "#fff", .8); v.circ(L / 2 - .6, H - .6, .9, "#fff", .8)
h.path(f"M{v.p(L / 2 + 13, H + 2)[0]:.1f},{v.p(L / 2 + 13, H + 2)[1]:.1f} A{9*e:.1f},{9*e:.1f} 0 0 0 {v.p(L / 2 + 8, H + 9.5)[0]:.1f},{v.p(L / 2 + 8, H + 9.5)[1]:.1f}", "none", K, .7, 'stroke-dasharray="4 2"')
v.eje(-17, zc, xs + 13, zc)
v.cotaH(0, L, -2.8, "35,5", zext=-.2)
v.cotaV(-17.5, 0, H, "8,9", yext=-1)
v.cotaH(0, PEL, H + 3.2, "PELAR 11 (*)", zext=H + .2, c=OR)
for n, (y, z), (gx, gy), tx in [("1", (6, H + .4), (150, 120), "PALANCA (PA NARANJA)"), ("2", (L * .8, .4), (536, 340), "CARCASA TRANSPARENTE"),
                                ("3", (L / 4 - 3.8, 4.4), (330, 340), "RESORTE DE ACERO INOX. (*)"), ("4", (L / 2, 1.4), (430, 360), "BARRA Cu ESTAÑADO"),
                                ("5", (5, zc), (110, 340), "CABLE PELADO 11 mm")]:
    a_ = v.p(y, z); h.globo(n, a_[0], a_[1], gx, gy, r=9); h.txt(gx + (14 if gx < 500 else 14), gy + 4, tx, 9, 400, OR if "(*)" in tx else K)

# ================= 2. PLANTA · ESC. 4:1 =================
e2 = 4.2; w = Vista(h, 54, 452, e2)
h.titulo(40, 392, "PLANTA", "ESC. 4:1")
w.rect(0, L, -A / 2, A / 2, "#fff", 1.3)
w.rect(L / 2 - .6 - LP, L / 2 - .6, -A / 2 + .5, A / 2 - .5, "url(#PLAS)", .8); w.rect(L / 2 + .6, L / 2 + .6 + LP, -A / 2 + .5, A / 2 - .5, "url(#PLAS)", .8)
w.eje(-3, 0, L + 3, 0)
w.cotaV(L + 3.5, -A / 2, A / 2, "8,1", yext=L)
w.cotaH(0, L, -A / 2 - 5, "35,5", zext=-A / 2)

# ================= 3. D1 · COMO SE USA =================
h.titulo(230, 392, "D1 - COMO SE USA", "SIN HERRAMIENTA")
pasos = ["1. LEVANTAR LA PALANCA", "2. CABLE PELADO HASTA EL TOPE", "3. BAJAR LA PALANCA Y TIRAR"]
for i, tx in enumerate(pasos):
    x0, y0 = 250 + i * 200, 480
    h.rect(x0, y0 - 14, 70, 16, "url(#VID)", K, 1)
    if i == 0: h.path(f"M{x0 + 36},{y0 - 14} l40,-26 l4,6 l-38,24 z", "url(#PLAS)", K, .8); h.rect(x0 + 2, y0 - 18, 33, 4, "url(#PLAS)", K, .8)
    else: h.rect(x0 + 2, y0 - 18, 66, 4, "url(#PLAS)", K, .8)
    if i == 1: h.path(f"M{x0 + 36},{y0 - 14} l40,-26 l4,6 l-38,24 z", "url(#PLAS)", K, .8)
    if i >= 1: h.rect(x0 + 70 - (26 if i else 0), y0 - 8, 26, 4, "url(#HIL)", K, .5); h.rect(x0 + 70, y0 - 9.5, 40, 7, "url(#PLAS2)", K, .7)
    h.txt(x0, y0 + 22, tx, 9, 700)

# ================= 4. D2 · VARIANTE EMPALME EN GEL · ESC. 2:1 =================
G_ = PC["GEL"]; e4 = 2.6; g = Vista(h, 120, 640, e4); rg = G_["D"] / 2
h.titulo(40, 540, "D2 - VARIANTE: EMPALME EN GEL IP68", "SIN CODIGO EN EL PAÑOL · REFERENCIA ETELEC LDJ01 (118 x Ø25) · MEDIO CORTE · ESC. 2,5:1")
g.poly([[18, rg - 1.6], [18, rg], [G_["L"] - 18, rg], [G_["L"] - 18, rg - 1.6]], "url(#PLAS)", 1.0)
for x0_, s in ((0, 1), (G_["L"], -1)):
    g.poly([[x0_, 3.9], [x0_, rg + 1.3], [x0_ + s * 18, rg + 1.3], [x0_ + s * 18, 3.9]], "url(#PLAS2)", 1.0)
    g.poly([[x0_ + s * 18, 3.65], [x0_ + s * 18, rg - 1.62], [x0_ + s * 26, rg - 1.62], [x0_ + s * 26, 3.65]], "url(#GOM)", .8)
g.poly([[26, 0], [26, rg - 1.65], [G_["L"] - 26, rg - 1.65], [G_["L"] - 26, 0]], "url(#GEL)", .6)
g.rect(G_["L"] / 2 - 9, G_["L"] / 2 + 9, -4.6, -1.6, "#fff", .8); g.rect(G_["L"] / 2 - 7, G_["L"] / 2 + 7, -1.6, 1.4, "url(#CU)", .8)
for xx in (G_["L"] / 2 - 3.5, G_["L"] / 2 + 3.5): g.rect(xx - 1.1, xx + 1.1, 1.4, 2.4, "#fff", .7)
g.rect(-22, 26, -3.6, 3.6, "#fff", .9); g.rect(G_["L"] - 26, G_["L"] + 22, -3.6, 3.6, "#fff", .9)
g.linea([[26, 1.3], [G_["L"] / 2 - 7, .2]], 1.6, "#6e3b1d"); g.linea([[G_["L"] - 26, 1.3], [G_["L"] / 2 + 7, .2]], 1.6, "#6e3b1d")
g.poly([[0, -rg - 1.3], [0, -3.9], [18, -3.9], [18, -rg - 1.3]], "#fff", 1.0); g.poly([[G_["L"], -rg - 1.3], [G_["L"], -3.9], [G_["L"] - 18, -3.9], [G_["L"] - 18, -rg - 1.3]], "#fff", 1.0)
g.rect(18, G_["L"] - 18, -rg, -3.6, "#fff", 1.0)
g.eje(-24, 0, G_["L"] + 24, 0)
g.cotaH(0, G_["L"], -rg - 6.5, "118", zext=-rg - 1.3)
g.cotaV(G_["L"] + 26, -rg, rg, "Ø25", yext=G_["L"] - 18)
for t_, (y, z), (gx, gy) in [("CUERPO", (40, rg - .8), (240, 584)), ("TUERCA DE CIERRE", (8, rg + .6), (60, 584)), ("GEL", (70, 6), (430, 584)),
                              ("BORNERA (*)", (G_["L"] / 2 + 3, 1.5), (560, 600)), ("JUNTA", (G_["L"] - 22, 7), (500, 700))]:
    a_ = g.p(y, z); llamada(h, a_[0], a_[1], gx, gy, t_, OR if "(*)" in t_ else K, sz=9)

# ================= TABLAS =================
TY = 735
fc = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATOS (FICHA)"], cat(2001) + ["35,5 x 8,9 x 8,1 · 32 A · 450 V"],
      ["—", "VARIANTE: EMPALME EN GEL IP68 EN LINEA", "—", "SIN CODIGO (*)"]]
yt = h.tabla(40, TY, [(52, "c", True), (370, "l", False), (34, "c", False), (200, "l", False)], fc, rowh=15, titulo="CODIGOS DEL PAÑOL", colores=colorOR)
fd = [["DATO", "WAGO 221-2411", "FUENTE"], ["MEDIDAS (L x A x H)", "35,5 x 8,1 x 8,9", "FICHA APP / FARNELL"], ["CABLE", "0,2 A 4 mm² RIGIDO O FLEXIBLE", "HOJA WAGO"],
      ["CORRIENTE / TENSION", "32 A / 450 V", "FARNELL"], ["CARCASA / PALANCA", "TRANSPARENTE / NARANJA", "HOJA WAGO"], ["PELADO", "11 mm (*)", "ENVASE (*)"]]
yd = h.tabla(40, yt + 20, [(150, "l", False), (220, "c", False), (150, "l", False)], fd, rowh=14, titulo="DATOS DEL FABRICANTE", colores=colorOR)
yr = rayados3(h, 600, yt + 20, ["VID", "PLAS", "MET", "CU", "HIL", "GEL", "GOM"], cols=1, dx=200, rowh=18)
notasW(h, 40, max(yd, yr) + 18, [
    "COTAS EN mm: FICHA DE LA APP (FARNELL, WAGO 221-2411). RANGO DE CABLE Y COLORES: HOJA DE DATOS WAGO (UN DISTRIBUIDOR DICE 0,2 A 2,5 mm² EN FLEXIBLE).",
    "(*) PELADO 11 mm: DE LA HOJA ANTERIOR (ENVASE), NO SE PUDO VER EN LA FICHA. RESORTE, BARRA, PAREDES Y BISAGRA: PROPORCIONALES, A CONFIRMAR.",
    "NO ES ESTANCO: SOLO DENTRO DE CAJAS, TABLEROS O LA LUMINARIA. PARA ENTERRAR: RESINA (MAT-EMPALMES-2) O CONECTOR ESTANCO (MAT-EMPALMES-3).",
    "(*) EL EMPALME EN GEL (VARIANTE) NO ESTA EN EL PAÑOL: MEDIDAS DE ETELEC LDJ01 (0,5 A 1,5 mm²) SOLO COMO REFERENCIA."], w=800, lh=13.5)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - WAGO 221-2411 CON DOS CABLES DE 2,5 mm²", "CARCASA TRANSPARENTE: SE VEN LOS RESORTES Y LA BARRA · DERECHA CON LA PALANCA ABIERTA")
A = img3d(h, "conex_wago", 880, 84, 640)
columna(h, A, [("palancaA", "1", "PALANCA ABIERTA"), ("palanca", "", "PALANCA CERRADA"), ("resorte", "3", "RESORTE (*)"), ("cuerpo", "2", "CARCASA"),
               ("barra", "4", "BARRA Cu ESTAÑADO"), ("pelado", "", "CABLE ENTRANDO"), ("cableD", "", "CABLE N (CELESTE)")], 1500, 110, 420, paso=26)
columna(h, A, [("cableI", "5", "CABLE L1")], 902, 400, 420)
h.titulo(890, 470, "VARIANTE: EMPALME EN GEL IP68 (SIN CODIGO)", "MEDIO CORTE: CUERPO, TUERCAS, JUNTAS, GEL Y BORNERA (REFERENCIA ETELEC LDJ01)")
A2 = img3d(h, "conex_gel", 880, 492, 640)
columna(h, A2, [("cuerpo", "", "CUERPO"), ("tuerca", "", "TUERCA DE CIERRE"), ("gel", "", "GEL"), ("junta", "", "JUNTA"), ("bornera", "", "BORNERA (*)"), ("conductor", "", "CONDUCTORES")], 1500, 520, 780, paso=26)
columna(h, A2, [("cable", "", "CABLE 3 x 1,5")], 902, 760, 780)
bloque(h, 890, 832, "DONDE SE USA", [
    "UNIONES SECAS DENTRO DE CAJAS, TABLEROS O LA LUMINARIA: DOS CABLES DE HASTA 4 mm², SIN HERRAMIENTA.",
    "NO VA ENTERRADO NI A LA INTEMPERIE. LA CAJA DE GEL (VARIANTE) LO HARIA ESTANCO: A CONFIRMAR SI SE COMPRA (*)."], w=740, sz=10, lh=14)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/conex_wago.mjs, conex_gel.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES_conex.md", 9.5, 400, G, "start", INT)
rotuloB(h, "MAT-EMPALMES-1", "EMPALME EN LINEA CON PALANCA", "(WAGO 221-2411) Y EN GEL", "CORTE A-A, PLANTA, D1, D2 Y 3D", "7,5:1 · 4:1", "D2 2,5:1 · 3D S/E")
guardar(h, "mat_empalmes_1")
