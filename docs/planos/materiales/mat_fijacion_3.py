"""MAT-FIJACION-3 (rev. A) · grupo «nfin»: precinto de tapa (9015), precinto de bornera (9019) y silicona neutra negra (9016; 9022 DE BAJA).
Altas del equipo (respaldo/nuevos.csv, descripción y unidad tal cual). Plano y 3D con los mismos números: r3d/piezas/perfiles_nfin.mjs
(PTAPA, PBORN, SILN) y perfiles_civil.mjs (CART). 3D: r3d/out/nfin_precintos.png, nfin_silicona.png. Fuentes: r3d/FUENTES_nfin.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nobrakit import *
from nfinkit import PF, cm

PT = PF["PTAPA"]; PB = PF["PBORN"]; SN = PF["SILN"]; CA = PC["CART"]
h = nuevaC()

# =============== 1. 9015 PRECINTO DE TAPA ===============
h.titulo(40, 62, "9015 PRECINTO DE TAPA · FRENTE", "ESC. 2,6:1 · PRECINTO DE SEGURIDAD DE COLA (PULL-TIGHT), NUMERADO · UN SOLO USO")
e = 2.6; x0, yc = 70, 160
bw, bh, be = PT["band"]; tx, tz, ty = PT["traba"]; w = PT["w"]
h.rect(x0, yc - bh / 2 * e, bw * e, bh * e, "url(#PLAS)", K, 1.2)
h.rect(x0 + 6, yc - bh / 2 * e + 8, bw * e - 12, 22, "#fff", K, .6); h.txt(x0 + bw * e / 2, yc - bh / 2 * e + 24, PT["num"], 12, 700, K, "middle", MONO)
h.txt(x0 + bw * e / 2, yc + bh / 2 * e - 8, "N° CORRELATIVO", 7.5, 700, K, "middle")
xt = x0 + bw * e; h.rect(xt, yc - tz / 2 * e, tx * e, tz * e, "url(#PLAS)", K, 1.2)
h.rect(xt + (tx - w) / 2 * e, yc - w / 2 * e, w * e, w * e, "#fff", K, .8)
xc0 = xt + tx * e; xc1 = xc0 + PT["L"] * e
h.path(f"M{xc0},{yc - w / 2 * e} H{xc1 - 12 * e} L{xc1},{yc - w / 4 * e} V{yc + w / 4 * e} L{xc1 - 12 * e},{yc + w / 2 * e} H{xc0} Z", "#fff", K, .9)
xx = xc0 + 3
while xx < xc1 - 12 * e - 2: h.ln(xx, yc - w / 2 * e, xx + PT["dentP"] * e * .5, yc + w / 2 * e, K, .3); xx += PT["dentP"] * e
h.dimH(yc - bh / 2 * e - 14, x0, x0 + bw * e, "25 (*)", ext=yc - bh / 2 * e, c=OR)
h.dimV(x0 - 12, yc - bh / 2 * e, yc + bh / 2 * e, "25 (*)", ext=x0, c=OR)
h.dimH(yc + 36, xc0, xc1, "210 (BANDA: REF. IMPA W2,2 × L210)", ext=yc + w / 2 * e, c=OR)
h.dimV(xc1 - 40, yc - w / 2 * e, yc + w / 2 * e, "", ext=None); h.txt(xc1 - 34, yc - 10, "Ø2,2 (*)", 9.5, 400, OR)
llamada(h, xt + tx * e / 2, yc - tz / 2 * e, xt + 40, yc - 52, "TRABA CON UÑA: ENTRA, NO SALE", sz=9)
llamada(h, xc0 + 120, yc, xc0 + 160, yc - 30, "COLA DENTADA (CORTE A-A)", sz=9)
lineaCorte(h, xc0 + 470, yc - 14, xc0 + 470, yc + 14, "A")

# D1 traba en corte · A-A cola · colocación
subt(h, 40, 228, "D1 - TRABA EN CORTE", "ESC. 8:1 · UÑA DE PLASTICO (*)")
e1 = 8.0; dx, dyb = 70, 330
h.rect(dx, dyb - tz * e1, tx * e1, tz * e1, "url(#PLAS)", K, 1.2)
xs0 = dx + (tx - w) / 2 * e1; h.rect(xs0, dyb - tz * e1, w * e1, tz * e1, "#fff", K, .8)
una = [(xs0, dyb - tz * e1 * .85), (xs0 + w * e1 * .55, dyb - tz * e1 * .5), (xs0, dyb - tz * e1 * .35)]
h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in una) + " Z", "url(#PLAS2)", K, .9)
yy = dyb - tz * e1 - 18
while yy < dyb + 14:
    h.path(f"M{xs0 + w * e1},{yy} l{-PT['dentH'] * e1},{PT['dentP'] * e1 * .8} l{PT['dentH'] * e1},0", "none", K, .6); yy += PT["dentP"] * e1
h.ln(xs0 + w * e1, dyb - tz * e1 - 18, xs0 + w * e1, dyb + 18, K, .8)
h.dimH(dyb + 30, dx, dx + tx * e1, "9 (*)", ext=dyb, c=OR); h.dimV(dx - 12, dyb - tz * e1, dyb, "8 (*)", ext=dx, c=OR)
llamada(h, xs0 + 4, dyb - tz * e1 * .6, dx + tx * e1 + 30, dyb - tz * e1 - 6, "UÑA", sz=9); llamada(h, xs0 + w * e1 - 2, dyb + 10, dx + tx * e1 + 30, dyb + 4, "COLA", sz=9)
subt(h, 230, 228, "CORTE A-A", "ESC. 10:1")
h.circ(280, 290, w / 2 * 10, "url(#PLAS)", K, 1.1); h.dimH(320, 280 - w * 5, 280 + w * 5, "Ø2,2 (*)", ext=290, c=OR)
subt(h, 400, 228, "COLOCACION EN LAS OREJAS DE LA TAPA", "ESQUEMA S/E · SE PASA, SE TIRA HASTA EL TOPE, SE ANOTA EL N°")
ox, oz = 470, 340; s3 = 2.4
h.rect(ox - 50, oz - 2.5 * s3, 66, 2.5 * s3, "url(#MET)", K, .9); h.rect(ox - 34, oz - 5.5 * s3, 66, 2.5 * s3, "url(#MET)", K, .9)
h.rect(ox - 3 * s3, oz - 5.6 * s3, 6 * s3, 5.7 * s3, "#fff", "none", 0)
h.ln(ox - 3 * s3, oz - 5.5 * s3, ox - 3 * s3, oz, K, .6); h.ln(ox + 3 * s3, oz - 5.5 * s3, ox + 3 * s3, oz, K, .6)
Rl = 13 * s3; cxl = ox + Rl; czl = oz - 2.75 * s3
h.path(f"M{cxl},{czl - Rl} A{Rl},{Rl} 0 1 0 {cxl + .01},{czl - Rl}", "none", K, 2.2)
h.rect(cxl - 9, czl - Rl - 8, 18, 16, "url(#PLAS)", K, 1); h.rect(cxl + 9, czl - Rl - 14, 40, 28, "url(#PLAS)", K, 1)
h.rect(cxl + 13, czl - Rl - 6, 32, 12, "#fff", K, .5); h.txt(cxl + 29, czl - Rl + 3, "N°", 8, 700, K, "middle")
llamada(h, ox - 40, oz - 1, ox - 56, oz + 14, "OREJA FIJA", sz=9, anc="end"); llamada(h, ox - 25, oz - 4.5 * s3, ox - 56, oz - 26, "OREJA DE LA TAPA", sz=9, anc="end")
llamada(h, cxl + Rl * .9, czl + Rl * .4, cxl + Rl + 70, czl + 12, "LAZO: NO SE ABRE SIN CORTARLO", sz=9)
llamada(h, cxl + 49, czl - Rl, cxl + 80, czl - Rl - 14, "BANDERA CON N°", sz=9)

# =============== 2. 9019 PRECINTO DE BORNERA ===============
h.titulo(40, 390, "9019 PRECINTO DE BORNERA · FRENTE Y CORTE B-B", "ESC. 4:1 · PRECINTO DE ROTOR CON ALAMBRE (TWIST SEAL), NUMERADO")
e2 = 4.0; fx, fy = 130, 490; r = PB["D"] / 2
h.circ(fx, fy, r * e2, "#fff", K, 1.3); h.circ(fx, fy, r * e2 - 4, "none", K, .5)
h.circ(fx, fy, PB["rotD"] / 2 * e2, "url(#PLAS2)", K, 1.0)
h.rect(fx - PB["ala"][0] / 2 * e2, fy - PB["ala"][1] / 2 * e2, PB["ala"][0] * e2, PB["ala"][1] * e2, "url(#PLAS)", K, 1.0)
for s in (-1, 1): h.circ(fx + s * PB["agujSep"] / 2 * e2, fy + r * e2 * .62, PB["agujD"] / 2 * e2, "#fff", K, .8)
h.txt(fx, fy + r * e2 * .45, PB["num"], 9, 700, K, "middle", MONO)
h.dimH(fy - r * e2 - 14, fx - r * e2, fx + r * e2, "Ø24 (*)", ext=fy, c=OR)
h.dimH(fy + r * e2 + 18, fx - PB["agujSep"] / 2 * e2, fx + PB["agujSep"] / 2 * e2, "9 (*)", ext=fy + r * e2 * .62, c=OR)
lineaCorte(h, fx - r * e2 - 14, fy, fx + r * e2 + 14, fy, "B")
# corte B-B (lado): carcasa transparente, rotor con ala, carrete con alambre
bx, by = 290, 490; ee = PB["e"] * e2
h.rect(bx, by - r * e2, ee, 2 * r * e2, "none", K, 1.3)
h.rect(bx, by - r * e2, ee, 2.4, "url(#PLAS)", K, .6); h.rect(bx, by + r * e2 - 2.4, ee, 2.4, "url(#PLAS)", K, .6); h.rect(bx, by - r * e2, 2.4, 2 * r * e2, "url(#PLAS)", K, .6)
h.rect(bx + 2.4, by - PB["rotD"] / 2 * e2, ee - 2.4 + PB["rotE"] * e2, PB["rotD"] * e2, "url(#PLAS2)", K, 1.0)
h.rect(bx + ee + PB["rotE"] * e2, by - PB["ala"][1] / 2 * e2, PB["ala"][2] * e2, PB["ala"][1] * e2, "url(#PLAS2)", K, 1.0)
h.rect(bx + 6, by - (PB["rotD"] / 2 - 1.5) * e2, ee - 12, (PB["rotD"] - 3) * e2, "url(#MET)", K, .8); h.rect(bx + 6, by - 3 * e2, ee - 12, 6 * e2, "url(#PLAS2)", K, .6)
h.dimV(bx - 14, by - r * e2, by + r * e2, "24 (*)", ext=bx, c=OR); h.dimH(by + r * e2 + 18, bx, bx + ee, "12 (*)", ext=by + r * e2, c=OR)
llamada(h, bx + 1, by - r * e2 + 12, bx + 120, by - r * e2 - 6, "CARCASA DE POLICARBONATO (PC)", sz=9)
llamada(h, bx + ee + PB["rotE"] * e2 + 6, by, bx + 130, by + 8, "ROTOR + ALA: SE GIRA Y ENROLLA", sz=9)
llamada(h, bx + ee / 2, by + 14, bx + 130, by + 40, "CARRETE CON EL ALAMBRE (*)", sz=9)
h.txt(bx + 130, by + 66, "EL ROTOR GIRA EN UN SOLO SENTIDO: PARA SACARLO HAY QUE ROMPERLO.", 9, 400)
h.txt(bx + 130, by + 79, "ALAMBRE INOX 2–4 HILOS · Ø0,5–1 (CRE) · Ø0,7 × 220 (ESSENTRA).", 9, 400)
# alambre 2 hilos 20:1
subt(h, 650, 470, "D2 - ALAMBRE", "ESC. 20:1 · 2 HILOS")
for k in range(9):
    if k > 6: break
    xa = 650 + k * 22; h.path(f"M{xa},{525} C{xa + 7},{517} {xa + 15},{517} {xa + 22},{525}", "none", K, 1.6); h.path(f"M{xa},{525} C{xa + 7},{533} {xa + 15},{533} {xa + 22},{525}", "none", K, 1.6)
h.dimV(820, 518, 532, "", ext=805); h.txt(826, 529, "Ø0,7", 9.5)

# =============== 3. 9016 / 9022 SILICONA ===============
h.titulo(40, 615, "9016 / 9022 SILICONA NEUTRA NEGRA · CARTUCHO EN CORTE", "ESC. 1:2 · MEDIDAS DEL CARTUCHO 9003 (*)")
e3 = .4 * 1.3; cx0, cyy = 60, 690; rr = CA["D"] / 2
X = lambda z: cx0 + z * e3
h.rect(X(0), cyy - rr * e3, CA["L"] * e3, 2 * rr * e3, "url(#PLAS)", K, 1.1); h.rect(X(20), cyy - (rr - 1.4) * e3, (CA["L"] - 22) * e3, 2 * (rr - 1.4) * e3, "url(#GOMA)", K, .6)
h.rect(X(4), cyy - (rr - 1.4) * e3, 16 * e3, 2 * (rr - 1.4) * e3, "#fff", K, .8)
h.path(f"M{X(CA['L'])},{cyy - rr * e3} L{X(CA['L'] + 18)},{cyy - 7 * e3} L{X(CA['L'] + 18 + CA['pico'])},{cyy - 1} V{cyy + 1} L{X(CA['L'] + 18)},{cyy + 7 * e3} L{X(CA['L'])},{cyy + rr * e3} Z", "#fff", K, 1.0)
h.dimH(cyy + rr * e3 + 16, X(0), X(CA["L"]), "215 (*)", ext=cyy + rr * e3, c=OR); h.dimV(X(0) - 10, cyy - rr * e3, cyy + rr * e3, "Ø50 (*)", ext=X(0), c=OR)
h.dimH(cyy - rr * e3 - 12, X(CA["L"] + 18), X(CA["L"] + 18 + CA["pico"]), "PICO 90 (*)", ext=cyy - 7 * e3, c=OR)
llamada(h, X(12), cyy, X(-4), cyy + 40, "PISTON", sz=9); llamada(h, X(120), cyy, X(110), cyy + 40, "SILICONA NEUTRA NEGRA", sz=9)
# junta tapa / caja 4:1
subt(h, 430, 660, "D3 - JUNTA TAPA / CAJA SELLADA", "ESC. 4:1 · JUNTA 10 × 4 Y CORDON Ø6 (*)")
e4 = 4.0; jx, jy = 560, 760; pw = 6; jw, jhh = SN["junta"]
h.rect(jx, jy - 0, pw * e4, 30, "url(#PVCr)", K, 1.1)                                   # pared de la caja
h.rect(jx - 2 * e4, jy - jhh * e4, (pw + 4) * e4, jhh * e4, "url(#GOMA)", K, 1.0)       # silicona
h.rect(jx - 6 * e4, jy - jhh * e4 - 6 * e4, 60 + 6 * e4 + pw * e4, 6 * e4, "url(#PVCr)", K, 1.1)   # tapa
h.circ(jx - 3.2 * e4, jy - jhh * e4 / 2 + .5 * e4, SN["cordon"] / 2 * e4, "url(#GOMA)", K, 1.0)
h.dimH(jy + 46, jx - 2 * e4, jx + (pw + 2) * e4, "10 (*)", ext=jy, c=OR); h.dimV(jx + 60 + pw * e4 + 10, jy - jhh * e4, jy, "4 (*)", ext=jx + (pw + 2) * e4, c=OR)
llamada(h, jx - 3.2 * e4 - 8, jy - 6, jx - 80, jy + 16, "CORDON EXTERIOR Ø6 (*)", sz=9, anc="end"); llamada(h, jx + 10, jy - 8, jx + 70, jy + 24, "SILICONA", sz=9)
llamada(h, jx + 40, jy - jhh * e4 - 12, jx + 120, jy - jhh * e4 - 40, "TAPA", sz=9); llamada(h, jx + 10, jy + 20, jx - 40, jy + 36, "PARED DE LA CAJA", sz=9, anc="end")

# =============== TABLAS Y NOTAS ===============
EX = {9015: "PULL-TIGHT · N° (*)", 9019: "ROTOR + ALAMBRE (*)", 9016: "CARTUCHO (*)", 9022: "CARTUCHO (*)"}
yt = tablaN(h, 40, 818, [9015, 9019, 9016, 9022], EX, w=800, rowh=14.5, tit_extra="FORMA", wext=150)
cols = [(230, "l", False), (200, "c", False), (370, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["9015: BANDA (LARGO × ANCHO)", "210 × 2,2 · PP (REF.)", "IMPA 47 «SECURITY SEAL PP PULLTIGHT»"],
       ["9015: BANDERA CON NUMERO", "≈ 25 × 25 (1\" × 1\") (*)", "CATALOGOS PULL-TIGHT (NUMERO EN CALIENTE)"],
       ["9019: CUERPO Y ALAMBRE", "PC TRANSP. · INOX 0,5–1 mm", "CRE NTCRE 008/07 (PRECINTO DE SEGURIDAD)"],
       ["9019: NUMERO", "SIGLA + 5 DIGITOS", "NTCRE 008/07 · ALAMBRE 0,7 × 220: ESSENTRA"],
       ["9016 / 9022: CARTUCHO", "Ø50 × 215 (*)", "IGUAL QUE 9003 (MAT-SENAL_SELLADO-2)"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14, titulo="DATOS DE REFERENCIA")
notasW(h, 40, yt + 14, [
    "▪ = ALTA DEL EQUIPO (respaldo/nuevos.csv): DESCRIPCION Y UNIDAD TAL CUAL. EL PAÑOL NO DICE MARCA, MODELO NI MEDIDA DE NINGUNO DE LOS CUATRO.",
    "(*) 9015 Y 9019: SE DIBUJAN LOS DOS TIPOS DE PRECINTO DE SEGURIDAD NUMERADO MAS COMUNES (COLA PULL-TIGHT PARA TAPAS, ROTOR CON ALAMBRE PARA BORNERAS Y MEDIDORES). FORMA Y MEDIDAS A CONFIRMAR CON UNO DEL PAÑOL.",
    "9016 Y 9022 TIENEN LA MISMA DESCRIPCION «Silicona Neutra Color Negro»; 9022 ESTA DE BAJA (activo=false): DOS CODIGOS PARA EL MISMO PRODUCTO. REVISAR.",
    "(*) SILICONA NEUTRA: CURA SIN ACIDO ACETICO (NO ATACA COBRE NI GALVANIZADO). VOLUMEN DEL CARTUCHO A CONFIRMAR. FUENTES: r3d/FUENTES_nfin.md."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - PRECINTOS 9015 Y 9019", "9015 ABIERTO Y CERRADO EN LAS OREJAS · 9019 EN EL TORNILLO DE LA TAPA DE BORNERA")
A = img3d(h, "nfin_precintos", 1000, 96, 500)
columna(h, A, [("bandC", "1", "BANDERA CON N°"), ("lazo", "", "LAZO 9015"), ("orejas", "", "OREJAS DE LA TAPA"), ("num", "", "N° CORRELATIVO"), ("band", "", "9015 ABIERTO")], 995, 130, 360, lado="izq", paso=28)
columna(h, A, [("rotor", "3", "ROTOR + ALA"), ("cuerpo", "", "CUERPO PC"), ("numB", "", "N° 9019"), ("alambre", "4", "ALAMBRE INOX"), ("tornillo", "", "TORNILLO"), ("cola", "2", "COLA DENTADA"), ("punta", "", "PUNTA")], 1515, 110, 360, paso=28)
h.txt(890, 500, "VISTA 3D - SILICONA NEUTRA NEGRA 9016 / 9022 (DE BAJA)", 11, 700, NV, "start", INT)
A2 = img3d(h, "nfin_silicona", 960, 506, 560)
columna(h, A2, [("pico", "", "PICO"), ("cart", "5", "CARTUCHO"), ("pared", "", "PARED"), ("sil", "", "SILICONA"), ("piston", "", "PISTON")], 955, 540, 800, lado="izq", paso=28)
columna(h, A2, [("cart2", "", "ABIERTO A CUARTO"), ("tapa", "", "TAPA"), ("junta", "6", "JUNTA SELLADA"), ("cordon", "", "CORDON EXTERIOR"), ("caja", "", "CAJA")], 1530, 560, 810, paso=28)
bloque(h, 890, 850, "DONDE SE USA", [
    "9015: CERRAR TAPAS DE TABLEROS, CAJAS Y PUERTAS DE COLUMNA: SI ALGUIEN ABRE, EL PRECINTO SE CORTA. ANOTAR EL N° EN LA ORDEN / PARTE.",
    "9019: SELLAR LA TAPA DE BORNERA O DEL MEDIDOR (TORNILLO CON AGUJERO EN LA CABEZA + OREJA).",
    "9016: SELLAR JUNTAS, ENTRADAS DE CABLE Y TAPAS CONTRA EL AGUA; NEGRA PARA QUE NO SE VEA EN EQUIPOS OSCUROS."], w=740, sz=9.5, lh=13)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/nfin_precintos.mjs, nfin_silicona.mjs). FUENTES: r3d/FUENTES_nfin.md")
rotN(h, "MAT-FIJACION-3", "PRECINTOS DE SEGURIDAD", "Y SILICONA NEUTRA NEGRA", "FRENTES, CORTES, D1–D3, CODIGOS Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A")
guardarC(h, "mat_fijacion_3")
