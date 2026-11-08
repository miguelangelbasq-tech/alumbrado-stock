"""MAT-PRENSACABLES-1 (rev. B) · Prensacable de aluminio, rosca eléctrica (RE), 1/2" a 2", con tuercas sueltas (18 códigos).
Plano y 3D con los mismos números: r3d/piezas/perfiles_conex.mjs (PRENSA, PRENSA_TABLA). 3D: r3d/out/conex_prensa_corte.png y conex_prensa_despiece.png.
Datos: FICHAS_TEC.prensacables (Pampaco, serie Compacto, rosca BSC: rango de Ø de cable por rosca), PRENSACABLES de la calculadora, catálogo del pañol.
Medidas de la pieza: (*) proporcionales a prensacables metálicos de catálogo (no hay ficha de Pampaco en la web)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conexkit import *

h = nueva3()
P = PC["PRENSA"]
rr = P["rosca"]["D"] / 2; hr = .7; ri = P["cuerpo"]["Dint"] / 2; je = P["junta"]["e"]; hx = P["hex"]["caras"] / 2; hL = P["hex"]["L"]
xh1 = je + hL; rt = P["tapa"]["rosc"] / 2; h2 = .55; ch = P["chapa"]; tl = P["tuerca"]["L"]; cl = P["contratuerca"]["L"]
pz = P["pinza"]; gm = P["goma"]; tp = P["tapa"]; rv = P["cableD"] / 2

def dientes(t0, t1, rb, hh, p):
    a = []; t = t0
    while t < t1 - 1e-6: a += [[rb, t], [rb + hh, t + p * .5]]; t += p
    return a + [[rb, t1]]

# ================= 1. CORTE A-A · MONTADO EN LA CAJA · ESC. 7:1 =================
e = 7.0; v = Vista(h, 210, 246, e)
h.titulo(40, 62, "CORTE A-A", "3/4\" RE (5023) MONTADO, CABLE 4 x 2,5 (Ø12) · ESC. 7:1")
# pared de la caja
v.rect(-ch, 0, rr + .25, 15.5, "url(#MET)", 1.0); v.rect(-ch, 0, -15.5, -(rr + .25), "#fff", 1.0)
# cuerpo (aluminio): rosca de entrada + hexágono + rosca de la tapa
body = [[ri, -P["rosca"]["L"]], [rr - hr, -P["rosca"]["L"]]] + dientes(-P["rosca"]["L"] + .4, -.3, rr - hr, hr, P["rosca"]["paso"]) + [[rr - hr, je], [hx, je], [hx, xh1], [rt - h2, xh1]] + \
       dientes(xh1 + .3, xh1 + 8.2, rt - h2, h2, 1.2) + [[rt - h2 - .3, xh1 + 8.6], [ri + .4, xh1 + 8.6], [ri, xh1 + 8.2]]
secRT(v, [[r_, t_] for r_, t_ in body], "ALU", 1.2)
# junta plana
v.rect(0, je, P["junta"]["Di"] / 2, P["junta"]["De"] / 2, "url(#GOM)", .9)
# tuerca y contratuerca (del lado de adentro)
v.rect(-ch - tl, -ch, rr - .35, hx, "url(#MET)", 1.0); v.rect(-ch - tl - cl, -ch - tl, rr - .35, hx * .95, "url(#MET)", 1.0)
# tapa (domo)
xt = xh1 + .4
tapa = [[rt + .05, xt], [hx, xt], [hx, xt + 7.5], [tp["Dcup"] / 2 - 1.2, xt + 7.5], [tp["Dcup"] / 2 - 1.2, xt + 9.1], [tp["Dcup"] / 2 - 2.6, xt + tp["L"] - .8], [tp["boca"] / 2 + 1.2, xt + tp["L"]],
        [tp["boca"] / 2, xt + tp["L"]], [tp["boca"] / 2, xt + tp["L"] - .8], [gm["Di"] / 2 + 1.6, xt + tp["L"] - 1.8], [pz["De"] / 2 - 1.2, xt + 8.7], [rt + .05, xt + 8.1]]
secRT(v, tapa, "ALU", 1.2)
# pinza (dedos) y goma
xp = xh1 + 1.2
secRT(v, [[pz["Di"] / 2, xp], [pz["De"] / 2, xp], [pz["De"] / 2, xp + 3], [pz["De"] / 2 - .8, xp + pz["L"]], [pz["Di"] / 2 - 1.1, xp + pz["L"]], [pz["Di"] / 2 - .4, xp + pz["L"] - 1.5], [pz["Di"] / 2, xp + 3]], "PLAS", .9)
xg = xh1 + 2.2
secRT(v, [[gm["Di"] / 2, xg], [gm["De"] / 2 - .5, xg], [gm["De"] / 2, xg + .5], [gm["De"] / 2, xg + gm["L"] - gm["chafl"]], [gm["Di"] / 2 + .9, xg + gm["L"]], [gm["Di"] / 2, xg + gm["L"]]], "GOM", .9)
# cable (vaina) pasando
v.rect(-17, 34, rv - 1.1, rv, "url(#PLAS2)", .9); v.rect(-17, 34, 0, rv - 1.1, "#fff", .5)
for z in (1.4, 3.6): v.linea([[-17, z], [34, z]], .4)
# abajo: vista exterior
vista = [[0, -(rr - hr)], [-P["rosca"]["L"], -(rr - hr)]]
v.poly([[-P["rosca"]["L"], 0], [-P["rosca"]["L"], -rr], [-ch - .1, -rr], [-ch - .1, 0]], "#fff", .9)
for k_ in range(6): x_ = -P["rosca"]["L"] + .6 + k_ * 1.5; v.linea([[x_, -rr], [x_ + .75, -rr + .9]], .4)
v.rect(0, je, -P["junta"]["De"] / 2, 0, "#fff", .9); v.rect(je, xh1, -hx * 1.155, 0, "#fff", 1.1); v.linea([[je, -hx * .577], [xh1, -hx * .577]], .5)
v.rect(xt, xt + 7.5, -hx * 1.155, 0, "#fff", 1.1); v.linea([[xt, -hx * .577], [xt + 7.5, -hx * .577]], .5)
v.poly([[xt + 7.5, 0], [xt + 7.5, -(tp["Dcup"] / 2 - 1.2)], [xt + 9.1, -(tp["Dcup"] / 2 - 1.2)], [xt + tp["L"] - .8, -(tp["Dcup"] / 2 - 2.6)], [xt + tp["L"], -(tp["boca"] / 2 + 1.2)], [xt + tp["L"], 0]], "#fff", 1.1)
v.rect(-ch - tl, -ch, -hx * 1.155, 0, "#fff", 1.0); v.rect(-ch - tl - cl, -ch - tl, -hx * 1.1, 0, "#fff", 1.0)
v.rect(xt + tp["L"], 34, -rv, 0, "#fff", .9); v.rect(-17, -ch - tl - cl, -rv, 0, "#fff", .9)
v.eje(-19, 0, 36, 0)
v.cotaV(36.5, -rv, rv, "Ø12", yext=34)

v.cotaH(-P["rosca"]["L"], 0, -16.5, "ROSCA 3/4\" RE (*) 10", zext=-rr, c=OR)
v.cotaH(je, xt + tp["L"], -19.5, "≈ 23 (*)", zext=-hx * 1.155, c=OR)
v.cotaH(je, xh1, hx * 1.155 + 1.4, "", zext=hx); h.txt(*v.p(je + hL / 2, hx * 1.155 + 2.2), "HEX 24 (*)", 9, 400, OR, "middle")
a_, b_ = v.p(xp + 6, 15), v.p(xp + 6, -14); lineaCorte(h, a_[0], a_[1], b_[0], b_[1], "B")
cx_, cy_ = v.p(-4.5, rr - .2); h.llamadaDet(cx_, cy_, 24, "")
glob = [("1", (-tl - ch - cl / 2, hx - 1)), ("2", (-ch - tl / 2, hx - .8)), ("9", (-1, 14)), ("3", (je / 2, 11.5)), ("4", (je + 3, 10.5)),
        ("7", (xt + 11, 11)), ("5", (xp + 8, 7.6)), ("6", (xg + 9, 6.9)), ("8", (30, rv - .5))]
xs_ = []
for n, (y, z) in glob:
    ax, ay = v.p(y, z); gx = max(ax, (xs_[-1] + 26) if xs_ else 0); xs_.append(gx); h.globo(n, ax, ay, gx, 118, r=9)
# ================= 2. D1 · ROSCA EN CORTE · ESC. 20:1 =================
k = 16; X1, Y1 = 650, 110
h.titulo(620, 236, "D1 - ROSCA EN CORTE", "CUERPO Y TUERCA · ESC. 18:1 · PASO (*)")
def zig(x0, y0, n, p, hh, s=1):
    pts = []
    for i in range(n): pts += [(x0 + i * p * k, y0), (x0 + (i + .5) * p * k, y0 - s * hh * k)]
    pts.append((x0 + n * p * k, y0)); return pts
p_ = P["rosca"]["paso"]; n_ = 5; yb = 316
cuerpoT = [(X1 - 20, yb + 30)] + [(X1 - 20, yb)] + zig(X1, yb, n_, p_, hr) + [(X1 + n_ * p_ * k + 20, yb), (X1 + n_ * p_ * k + 20, yb + 30)]
h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in cuerpoT) + " Z", "url(#ALU)", K, 1.1)
tuercaT = [(X1 - 20, yb - hr * k - 34), (X1 - 20, yb - hr * k - .5)] + [(x, y - .8) for x, y in zig(X1, yb, n_, p_, hr)][::-1][::-1] + [(X1 + n_ * p_ * k + 20, yb - hr * k - .5), (X1 + n_ * p_ * k + 20, yb - hr * k - 34)]
h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in [tuercaT[0], tuercaT[1]] + [(x, y - .8) for x, y in zig(X1, yb, n_, p_, hr)] + [tuercaT[-2], tuercaT[-1]]) + " Z", "url(#MET)", K, 1.1)
h.dimH(yb + 44, X1, X1 + p_ * k, "1,5 (*)", ext=yb + 2, c=OR)
h.txt(X1 + n_ * p_ * k + 26, yb - 22, "TUERCA", 9, 400); h.txt(X1 + n_ * p_ * k + 26, yb + 18, "CUERPO", 9, 400)
h.txt(620, yb + 58, "Ø 19,05 (3/4\"). RE / BSC: HILOS Y PERFIL (*).", 9, 400, OR)

# ================= 3. SECCION B-B · POR LA PINZA · ESC. 4:1 =================
k3 = 4.6; cx, cy = 650, 160
h.titulo(560, 62, "SECCION B-B", "PINZA Y GOMA · ESC. 4,5:1")
anillo(h, cx, cy, tp["Dcup"] / 2 - 1.2, pz["De"] / 2 - .4, "ALU", k3, 1.0)
for i in range(pz["dedos"]):
    a0 = 2 * math.pi * i / pz["dedos"]; w_ = 2 * math.pi / pz["dedos"] - pz["ranura"] / (pz["De"] / 2)
    ro_, ri_ = pz["De"] / 2 - .45, pz["Di"] / 2 - .6
    pts = [(cx + ro_ * k3 * math.cos(a0 + w_ * j / 8), cy - ro_ * k3 * math.sin(a0 + w_ * j / 8)) for j in range(9)] + [(cx + ri_ * k3 * math.cos(a0 + w_ * j / 8), cy - ri_ * k3 * math.sin(a0 + w_ * j / 8)) for j in range(8, -1, -1)]
    h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z", "url(#PLAS)", K, .7)
anillo(h, cx, cy, gm["De"] / 2 - .9, gm["Di"] / 2 - .25, "GOM", k3, .8)
anillo(h, cx, cy, rv - .25, rv - 1.35, "PLAS2", k3, .8)
for i, (a, c_) in enumerate(zip([45, 135, 225, 315], [COLOR["L1"], COLOR["L2"], COLOR["L3"], COLOR["N"]])):
    px, py = cx + 2.15 * math.cos(math.radians(a)) * k3, cy - 2.15 * math.sin(math.radians(a)) * k3
    h.circ(px, py, 1.65 * k3, c_, K, .5); h.circ(px, py, .9 * k3, "#e9a466", K, .3)
h.txt(cx + 72, cy - 30, "8 DEDOS (*)", 9, 400, OR); h.txt(cx + 72, cy - 16, "GOMA APRETADA", 9, 400); h.txt(cx + 72, cy - 2, "VAINA Ø12", 9, 400)
h.txt(cx + 72, cy + 12, "4 x 2,5: L1 L2", 9, 400); h.txt(cx + 72, cy + 24, "L3 N (AEA)", 9, 400)

# ================= TABLAS =================
TY = 414
ft = [["ROSCA", "Ø DEL CABLE (mm)", "CODIGOS DEL PAÑOL", "USO TIPICO"]] + [list(r) for r in PC["PRENSA_TABLA"]]
yt = h.tabla(40, TY, [(64, "c", False), (120, "c", True), (210, "c", True), (170, "l", False)], ft, rowh=14,
             titulo="SE ELIGE POR EL Ø EXTERIOR DEL CABLE (FICHA: PAMPACO COMPACTO)", colores=lambda i, j, t: OR if "(*)" in str(t) else (NV if i == 3 else K))
h.txt(40, yt + 12, "EN AZUL: 3/4\", EL DIBUJADO. LA CALCULADORA USA 1 1/2\": 25-32 Y 2\": 32-37 (VER NOTA 3).", 9.5, 400, NV)
bloque(h, 640, TY + 14, "COMO SE ARMA", ["PASAR LA TAPA, LA GOMA Y LA PINZA POR EL CABLE.", "ROSCAR EL CUERPO CON SU JUNTA EN LA CAJA Y APRETAR LA TUERCA ADENTRO.",
                                     "PASAR EL CABLE Y APRETAR LA TAPA: LOS DEDOS CIERRAN LA GOMA.", "TIRAR DEL CABLE: NO TIENE QUE MOVERSE."], w=210, sz=9.5, lh=12.5)
DES = {5020: "1/2\" C/T Y A", 5024: "5/8\" SIN TUERCA", 5027: "5/8\" C/T Y A", 5032: "TUERCA 5/8\"", 5022: "3/4\" SIN TUERCA", 5023: "3/4\" C/T Y A", 5029: "3/4\" PLASTICO",
       5034: "TUERCA 3/4\"", 5028: "7/8\" C/T Y A", 5018: "1\" (*)", 5026: "1\" C/TUERCA", 5031: "TUERCA 1\"", 5025: "1 1/4\" C/T Y A", 5033: "TUERCA 1 1/4\"",
       5019: "1 1/2\" C/T Y A", 5021: "2\" C/T Y A", 5012: "CAJA-CAÑO Ø40", 5013: "CAJA-CAÑO Ø40"}
fc = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "TIPO"]]
for c in [5020, 5024, 5027, 5032, 5022, 5023, 5029, 5034, 5028, 5018, 5026, 5031, 5025, 5033, 5019, 5021, 5012, 5013]:
    r_ = cat(c, 62); fc.append([r_[0], r_[1], r_[2], DES[c]])
yc_ = h.tabla(40, yt + 30, [(50, "c", True), (440, "l", False), (34, "c", False), (130, "l", False)], fc, rowh=13.2, titulo="CODIGOS DEL PAÑOL (18)", colores=colorOR)
yr = rayados3(h, 720, yt + 30, ["ALU", "MET", "GOM", "PLAS", "PLAS2"], cols=1, dx=200)
notasW(h, 40, yc_ + 18, [
    "Ø DE CABLE POR ROSCA Y CODIGOS: FICHA DE LA APP (PAMPACO, PRENSACABLES DE ALUMINIO SERIE COMPACTO, ROSCA BSC). COMPARAR CON EL Ø EXTERIOR DEL CABLE, NO CON LA SECCION.",
    "(*) MEDIDAS DE LA PIEZA (HEXAGONO, LARGOS, DOMO, PINZA, JUNTA, PASO DE ROSCA): NO HAY FICHA DE PAMPACO EN LA WEB. PROPORCIONALES, A CONFIRMAR MIDIENDO UNO.",
    "(*) LA FICHA DICE 1 1/2\": 23-30 Y 2\": 30-40; LA CALCULADORA (PRENSACABLES) Y EL PAÑOL (5019 / 5021) DICEN 25-32 / 25-30 Y 32-37 / 30-40. 1/2\": LA AP-PL-002 DICE 6 A 12.",
    "5031 / 5032 / 5033 / 5034 SON TUERCAS SUELTAS; 5022 Y 5024 VIENEN SIN TUERCA. 5012 / 5013 SON CONECTORES CAJA-CAÑO Ø40 (OTRA PIEZA). 5018 «PRENSACABLE 1»: SIN MATERIAL (*).",
    "EL PLANO DE LA CAJA DE COLUMNA PIDE PRENSACABLE METALICO: EL PLASTICO 5029 NO VA AHI."], w=800, lh=13.2)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - PRENSACABLE 3/4\" MONTADO EN LA CAJA", "CORTE A CUARTO: CUERPO, JUNTA, TUERCAS, PINZA, GOMA Y TAPA, CON EL CABLE 4 x 2,5")
A = img3d(h, "conex_prensa_corte", 880, 84, 600)
columna(h, A, [("tapa", "7", "TAPA (DOMO)"), ("goma", "6", "GOMA"), ("pinza", "5", "PINZA (*)"), ("cuerpo", "4", "CUERPO"), ("junta", "3", "JUNTA (*)"), ("rosca", "", "ROSCA 3/4\" RE"),
               ("cable", "8", "CABLE 4 x 2,5")], 1488, 104, 470, paso=26)
columna(h, A, [("pared", "9", "PARED"), ("tuerca", "2", "TUERCA"), ("contratuerca", "1", "CONTRATUERCA (*)"), ("conductores", "", "CONDUCTORES")], 902, 300, 470, paso=26)
h.titulo(890, 540, "DESPIECE", "EN EL ORDEN EN QUE SE ARMA")
A2 = img3d(h, "conex_prensa_despiece", 880, 574, 640)
pts = [("contratuerca", "1"), ("tuerca", "2"), ("junta", "3"), ("cuerpo", "4"), ("pinza", "5"), ("goma", "6"), ("tapa", "7")]
for an, n in pts:
    ax, ay = A2(an); globo3d(h, (ax, ay), n, ax, ay - 34)
bloque(h, 890, 840, "DONDE SE USA", [
    "ENTRADA DE CABLES A CAJAS, TABLEROS Y LUMINARIAS: 1 PRENSACABLE 3/4\" POR ARTEFACTO.",
    "1 x 10 → 1/2\" · 3 x 1,5 Y 4 x 2,5 → 3/4\" · 4 x 6 → 7/8\" · 4 x 10 → 1\" · Cu 4 x 16 → 1 1/4\" (CLAUDE.md §11.3)."], w=740, sz=10, lh=14)
h.txt(890, 1022, "RENDER: three.js (r3d/escenas/conex_prensa_*.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES_conex.md", 9.5, 400, G, "start", INT)
rotuloB(h, "MAT-PRENSACABLES-1", "PRENSACABLE DE ALUMINIO", "ROSCA ELECTRICA · 1/2\" A 2\"", "CORTE A-A, D1, SECCION B-B, TABLA Y 3D", "7:1 · 18:1", "INDICADAS · 3D S/E")
guardar(h, "mat_prensacables_1")
