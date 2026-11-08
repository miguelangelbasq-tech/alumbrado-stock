"""MAT-CAÑOS-3 (rev. B) · grupo «nobra»: sistema de caño rígido HDX Ø25 gris (altas del equipo, respaldo/nuevos.csv tal cual):
caño Ø25 × 3 m (5038), conector (5039), grampa fija (5040), caja de paso 90 × 90 × 75 (5041) y caja cuadrada de superficie con tapa (5042).
Plano y 3D con los mismos números: r3d/piezas/perfiles_nobra.mjs (HDX) → perfiles_nobra.json. 3D: r3d/out/nobra_hdx.png.
Fuentes: pañol (Ø25, 3 m, 90 × 90 × 75), Legrand 651425 (caño rígido 25 mm × 3 m: Ø int. 21,4, pared 1,8) como referencia; r3d/FUENTES_nobra.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nobrakit import *

H = PN["HDX"]; Cn = H["cano"]; Kc = H["conector"]; G = H["grampa"]; Cj = H["caja"]; Cs = H["cajaSup"]
De, e = Cn["De"], Cn["e"]; Di = De - 2 * e
h = nuevaC()

# =============== 1. CAÑO · SECCION Y TRAMO ===============
h.titulo(40, 62, "CAÑO RIGIDO HDX Ø25 (5038) · SECCION Y TRAMO", "ESC. 3:1 · PVC GRIS · TIRA DE 3 m")
cx, cy, s1 = 110, 160, 3.0
anillo(h, cx, cy, De / 2 * s1, Di / 2 * s1, "PVCr", 1.3)
h.dimH(cy + De / 2 * s1 + 18, cx - De / 2 * s1, cx + De / 2 * s1, "Ø25", ext=cy)
h.dimH(cy - De / 2 * s1 - 14, cx - Di / 2 * s1, cx + Di / 2 * s1, "Ø21,4 (*)", ext=cy - Di / 2 * s1, c=OR)
h.dimV(cx + De / 2 * s1 + 14, cy - De / 2 * s1, cy - Di / 2 * s1, "", ext=cx); h.txt(cx + De / 2 * s1 + 20, cy - De / 2 * s1 + 4, "1,8 (*)", 9, 400, OR)
tx0, ty = 230, 160
h.rect(tx0, ty - 12, 300, 24, "url(#PVCr)", K, 1.1); h.path(f"M{tx0 + 300},{ty - 18} l-8,36 M{tx0 + 306},{ty - 18} l-8,36", "none", K, .7)
h.rect(tx0 + 314, ty - 12, 60, 24, "url(#PVCr)", K, 1.1)
h.dimH(ty + 36, tx0, tx0 + 374, "3000 (PAÑOL: «X 3MTS»)", ext=ty + 12)
h.txt(tx0, ty - 24, "SE CORTA CON SIERRA Y SE DESBARBA · SE CURVA CON RESORTE (*)", 9, 400, G)

# =============== 2. CORTE A-A · CONECTOR EN LA CAJA DE PASO ===============
h.titulo(40, 270, "CORTE A-A · CONECTOR (5039) EN LA CAJA (5041)", "ESC. 4:1 · CORTE POR EL EJE")
s2 = 4.2; ax0, ay0 = 205, 400
X = lambda x: ax0 + x * s2; Y = lambda r: ay0 - r * s2
rI = De / 2 + .15
# pared de la caja (x de -pared a 0) y contratuerca adentro
h.rect(X(-Cj["pared"]), Y(20), Cj["pared"] * s2, (20 - Kc["Drosca"] / 2 - .3) * s2, "url(#PVCr)", K, 1.1)
h.rect(X(-Cj["pared"]), Y(-Kc["Drosca"] / 2 - .3), Cj["pared"] * s2, (20 - Kc["Drosca"] / 2 - .3) * s2, "url(#PVCr)", K, 1.1)
for sg in (1, -1):
    yy = lambda r: ay0 - sg * r * s2
    body = [(Kc["L"] - 12, rI), (Kc["L"] - 12, Kc["Dcuerpo"] / 2), (3, Kc["Dcuerpo"] / 2), (3, Kc["tuercaAF"] / 2 - 1), (0, Kc["tuercaAF"] / 2 - 1), (0, Kc["Drosca"] / 2),
            (-Kc["Lrosca"], Kc["Drosca"] / 2), (-Kc["Lrosca"], De / 2 - 2.6), (Kc["L"] - 12 - Kc["tope"], De / 2 - 2.6), (Kc["L"] - 12 - Kc["tope"], rI)]
    h.path("M" + " L".join(f"{X(x):.1f},{yy(r):.1f}" for x, r in body) + " Z", "url(#PLAS)", K, 1.0)
    h.rect(X(-Cj["pared"] - Kc["tuercaE"]), min(yy(Kc["Drosca"] / 2), yy(Kc["tuercaAF"] / 2 / math.cos(math.pi / 6))), Kc["tuercaE"] * s2, abs(yy(Kc["tuercaAF"] / 2 / math.cos(math.pi / 6)) - yy(Kc["Drosca"] / 2)), "url(#PLAS2)", K, .9)
    h.rect(X(Kc["L"] - 12 - Kc["tope"] + .5), min(yy(De / 2), yy(Di / 2)), 42 * s2, abs(yy(De / 2) - yy(Di / 2)), "url(#PVCr)", K, 1.0)
h.ln(X(-Kc["Lrosca"] - 6), ay0, X(Kc["L"] + 28), ay0, K, .45, h.EJE)
h.dimH(Y(-Kc["Dcuerpo"] / 2) + 22, X(-Kc["Lrosca"]), X(Kc["L"] - 12), f"{Kc['L']} (*)", ext=Y(-Kc["Dcuerpo"] / 2), c=OR)
h.dimV(X(Kc["L"] - 12) + 10, Y(Kc["Dcuerpo"] / 2), Y(-Kc["Dcuerpo"] / 2), "Ø31 (*)", ext=X(Kc["L"] - 12), c=OR)
h.dimV(X(-Kc["Lrosca"]) - 10, Y(Kc["Drosca"] / 2), Y(-Kc["Drosca"] / 2), "ROSCA Ø28,3 (*)", ext=X(-Kc["Lrosca"]), c=OR)
llamada(h, X(Kc["L"] - 12 - Kc["tope"]), Y(De / 2 - 1.3), X(36), Y(21), "TOPE: EL CAÑO ENTRA 18 (*)", OR, sz=9)
llamada(h, X(-Cj["pared"] - 3), Y(-Kc["tuercaAF"] / 2 - 1), X(-16), Y(-17), "CONTRATUERCA", sz=9, anc="end")
llamada(h, X(-Cj["pared"] / 2), Y(18), X(-14), Y(21), "PARED CAJA 2,5 (*)", OR, sz=9, anc="end")
llamada(h, X(40), Y(-Di / 2 - .5), X(46), Y(-21), "CAÑO Ø25", sz=9)

# =============== 3. CAJA DE PASO 90 x 90 x 75 ===============
h.titulo(470, 270, "CAJA DE PASO 90 x 90 x 75 (5041)", "ESC. 1:2 · FRENTE SIN TAPA Y COSTADO")
s3 = 1.25; bx, by = 520, 325
h.rect(bx, by, Cj["W"] * s3, Cj["H"] * s3, "url(#PVCr)", K, 1.3, 'rx="5"'); h.rect(bx + Cj["pared"] * s3, by + Cj["pared"] * s3, (Cj["W"] - 2 * Cj["pared"]) * s3, (Cj["H"] - 2 * Cj["pared"]) * s3, "#fff", K, .8, 'rx="3"')
for sx, sz in ((8, 8), (82, 8), (8, 82), (82, 82)): h.circ(bx + sx * s3, by + sz * s3, 3 * s3, "#fff", K, .7); h.circ(bx + sx * s3, by + sz * s3, 1.2 * s3, "#fff", K, .5)
for (x, y) in ((Cj["W"] / 2, 0), (Cj["W"] / 2, Cj["H"]), (0, Cj["H"] / 2), (Cj["W"], Cj["H"] / 2)): h.circ(bx + x * s3, by + y * s3, Cj["Dcono"] / 2 * s3, "none", K, .6, 'stroke-dasharray="4 2"')
h.dimH(by - 12, bx, bx + Cj["W"] * s3, "90", ext=by); h.dimV(bx - 12, by, by + Cj["H"] * s3, "90", ext=bx)
sx0 = bx + Cj["W"] * s3 + 40
h.rect(sx0, by, (Cj["P"] - Cj["tapa"]) * s3, Cj["H"] * s3, "url(#PVCr)", K, 1.2); h.rect(sx0 + (Cj["P"] - Cj["tapa"]) * s3, by - 1.5, Cj["tapa"] * s3, Cj["H"] * s3 + 3, "url(#PLAS2)", K, 1.0)
h.circ(sx0 + (Cj["P"] - Cj["tapa"]) * s3 / 2, by + Cj["H"] * s3 / 2, Cj["Dcono"] / 2 * s3, "none", K, .6, 'stroke-dasharray="4 2"')
h.dimH(by + Cj["H"] * s3 + 16, sx0, sx0 + Cj["P"] * s3, "75", ext=by + Cj["H"] * s3)
h.txt(bx, by + Cj["H"] * s3 + 40, "4 CONOS (TROQUELES) Ø25 PARA ROMPER (*) · TAPA CON 4 TORNILLOS (*)", 9, 400, OR)

# =============== 4. GRAMPA Y CAJA DE SUPERFICIE ===============
h.titulo(40, 510, "GRAMPA FIJA (5040) · DE COSTADO", "ESC. 2:1 · TACO + CLIP EN C (*)")
s4 = 2.2; gx, gy = 150, 640
yaa = Cj["P"] / 2; rr = De / 2; re = rr + G["e"]
h.rect(gx - 4, gy - 60, 8, 130, "url(#LAD)", K, 1.0); h.txt(gx - 8, gy + 82, "PARED", 8.5, 400, G, "end")
h.rect(gx + 4, gy - (G["base"][1] / 2 + 4) * s4, (yaa - rr + 1.2) * s4, (G["base"][1] + 8) * s4, "url(#PVCr)", K, 1.0)
h.path(arcoPath(gx + 4 + yaa * s4, gy, re * s4, -215 + 180 - 180, 35, 60) + " " + arcoPath(gx + 4 + yaa * s4, gy, rr * s4, 35, -215 + 180 - 180, 60).replace("M", "L", 1) + " Z", "url(#PVCr)", K, 1.0)
anillo(h, gx + 4 + yaa * s4, gy, rr * s4, (rr - e) * s4, "PVCr", .8)
h.dimV(gx + 4 + yaa * s4 + re * s4 + 14, gy - re * s4, gy + re * s4, f"{2 * re:.1f}".replace(".", ",") + " (*)", ext=gx + 4 + yaa * s4, c=OR)
h.dimH(gy + re * s4 + 22, gx + 4, gx + 4 + yaa * s4, "37,5 AL EJE (*)", ext=gy, c=OR)
llamada(h, gx + 4 + yaa * s4 + re * s4 * .8, gy - re * s4 * .6, gx + 160, gy - 60, "CLIP: SE CALZA A PRESION", sz=9)
llamada(h, gx + 10, gy - 10, gx + 160, gy - 40, "TACO + TORNILLO 3,5 x 25 (*)", OR, sz=9)
h.titulo(470, 510, "CAJA CUADRADA DE SUPERFICIE (5042)", "ESC. 1:2 · SIN MEDIDAS EN LA DESCRIPCION (*)")
s5 = 1.15; qx, qy = 500, 560
h.rect(qx, qy, Cs["W"] * s5, Cs["H"] * s5, "url(#PVCr)", K, 1.3, 'rx="4"'); h.rect(qx + 4, qy + 4, Cs["W"] * s5 - 8, Cs["H"] * s5 - 8, "#fff", K, .7, 'rx="3"')
for sx, sz in ((9, 91), (91, 9)): h.circ(qx + sx * s5, qy + sz * s5, 2.8 * s5, "#fff", K, .7)
h.dimH(qy - 12, qx, qx + Cs["W"] * s5, "100 (*)", ext=qy, c=OR); h.dimV(qx - 12, qy, qy + Cs["H"] * s5, "100 (*)", ext=qx, c=OR)
h.rect(qx + Cs["W"] * s5 + 40, qy, Cs["P"] * s5, Cs["H"] * s5, "url(#PVCr)", K, 1.2); h.dimH(qy + Cs["H"] * s5 + 16, qx + Cs["W"] * s5 + 40, qx + Cs["W"] * s5 + 40 + Cs["P"] * s5, "55 (*)", ext=qy + Cs["H"] * s5, c=OR)

# =============== TABLAS Y NOTAS ===============
EX = {5038: "Ø25 × 3 m", 5039: "Ø25", 5040: "Ø25", 5041: "90 × 90 × 75", 5042: "MEDIDA (*)"}
yt = tablaN(h, 40, 765, [5038, 5039, 5040, 5041, 5042], EX, w=800, rowh=14.5, wext=120)
cols = [(230, "l", False), (180, "c", False), (390, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"], ["CAÑO Ø25: Ø INT. Y PARED", "21,4 · 1,8 (*)", "LEGRAND 651425 (RIGIDO 25 mm × 3 m): REFERENCIA, NO ES HDX"],
       ["CAÑO RIGIDO 25 mm (OTRAS)", "Ø INT. 20,9 A 22,7", "ELETTROCANALI HF 25 · DKC 63925R (LIVIANO)"], ["CONECTOR, GRAMPA, CAJAS", "FORMA Y COTAS (*)", "SIN FICHA DE HDX EN LA WEB: PROPORCIONALES"]]
yt = tablaG(h, 40, yt + 16, cols, fil, rowh=14, titulo="DATOS DE REFERENCIA")
yr = rayadosC(h, 40, yt + 20, ["PVCr", "PLAS", "PLAS2", "LAD"], cols=4, dx=190)
notasW(h, 40, yr + 14, [
    "▪ = ALTA DEL EQUIPO: DESCRIPCION Y UNIDAD TAL CUAL. EL CAÑO ESTA EN «Un.» (UNA TIRA DE 3 m), NO EN METROS: OJO AL PEDIR POR METRO.",
    "(*) NO HAY FICHA DE HDX: Ø INTERIOR, PARED, CONECTOR (ROSCA, LARGO, TOPE), GRAMPA Y CONOS PROPORCIONALES A CATALOGOS DE CAÑO RIGIDO 25 mm. A CONFIRMAR MIDIENDO.",
    "(*) 5042 «CAJA CUADRADA SUPERF C/ TAPA» NO DICE MEDIDA NI QUE ES HDX: SE DIBUJA 100 x 100 x 55 (A CONFIRMAR).",
    "EL CAÑO ENTRA EN EL CONECTOR HASTA EL TOPE; LA ROSCA ENTRA EN EL CONO ROTO DE LA CAJA Y SE APRIETA CON LA CONTRATUERCA DE ADENTRO."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - TRAMO HDX AMURADO A LA PARED", "CAJA DE PASO, CONECTOR CORTADO A CUARTO, CAÑO, GRAMPA Y CAJA DE SUPERFICIE")
A = img3d(h, "nobra_hdx", 884, 110, 620)
columna(h, A, [("cajaS", "5", "CAJA DE SUPERFICIE"), ("conS", "", "CONECTOR"), ("grampa", "3", "GRAMPA FIJA"), ("cano", "1", "CAÑO HDX Ø25"), ("pared", "", "PARED"),
               ("caja", "4", "CAJA DE PASO 90 x 90"), ("tapa", "", "TAPA"), ("conector", "2", "CONECTOR (CORTADO)"), ("tope", "", "TOPE"), ("tuerca", "", "CONTRATUERCA"), ("cono", "", "CONO SIN ROMPER")],
        1515, 110, 440, lado="der", paso=29)
bloque(h, 890, 500, "DONDE SE USA", [
    "CABLEADO A LA VISTA SOBRE PAREDES Y MUROS (PILAR DE MEDICION, GALPON, OBRADOR): EL CAÑO PROTEGE EL CABLE Y LA CAJA DE PASO DEJA EMPALMAR O DERIVAR.",
    "1 GRAMPA CADA 0,80 A 1,00 m Y A 0,30 m DE CADA CAJA (CRITERIO USUAL, A CONFIRMAR) (*).",
    "SI EL CAÑO QUEDA AL SOL, PEDIR PVC CON PROTECCION UV (*)."], w=740, sz=10, lh=14)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/nobra_hdx.mjs) CON LOS MISMOS NUMEROS DEL PLANO (HDX). FUENTES: r3d/FUENTES_nobra.md")
rotN(h, "MAT-CAÑOS-3", "CAÑO RIGIDO HDX Ø25,", "CONECTOR, GRAMPA Y CAJAS", "SECCION, CORTE A-A, CAJAS, GRAMPA, CODIGOS Y 3D", "VARIAS", "INDICADAS · 3D S/E")
guardarC(h, "mat_canos_3")
