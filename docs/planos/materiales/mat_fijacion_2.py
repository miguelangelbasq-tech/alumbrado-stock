"""MAT-FIJACION-2 (rev. B) · grupo «nobra»: altas del equipo del pañol (respaldo/nuevos.csv, descripción y unidad TAL CUAL).
Precintos 4046 (2,5 × 100), 4043 (200 × 4,5), 1040 (200 × 4,5, DE BAJA), 4044 (200 × 4,6 poliamida), 4042 (202 × 4,6), 4045 (250 × 4,8)
y cinta autosoldable Scotch 43+ 19 mm × 5 m (4041).
Plano y 3D con los mismos números: r3d/piezas/perfiles_nobra.mjs (PRECN, DIENTE, CINTA43) → perfiles_nobra.json.
3D: r3d/out/nobra_precintos.png, nobra_cinta43.png. Fuentes: r3d/FUENTES_nobra.md. Lo que no está: naranja (*)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nobrakit import *

PR = PN["PRECN"]; DI = PN["DIENTE"]; CI = PN["CINTA43"]
h = nuevaC()

# =============== 1. LOS 6 PRECINTOS A ESCALA · VISTA DE ARRIBA ===============
h.titulo(40, 62, "PRECINTOS · VISTA DE ARRIBA, A ESCALA", "ESC. 1:3,3 (0,3:1) · CABEZA ALINEADA · LARGO Y ANCHO DE LA DESCRIPCION DEL PAÑOL")
k = 2.78; x0 = 100; y0 = 112
for i, P in enumerate(PR):
    yc = y0 + i * 25; cl, ch, cw = P["cab"]; w = max(P["w"], 2.5); L = P["L"]
    col = ROJO if P.get("baja") else K
    h.rect(x0, yc - cw * k / 2 * .5, cl * k * .55, cw * k * .5, "#fff", col, 1.1)
    xb1 = x0 + (L - DI["tipLargo"]) * k
    h.path(f"M{x0 + cl * k * .55:.1f},{yc - w * k / 4:.1f} H{xb1:.1f} L{x0 + L * k:.1f},{yc - w * k / 4 * DI['tipW']:.1f} V{yc + w * k / 4 * DI['tipW']:.1f} L{xb1:.1f},{yc + w * k / 4:.1f} H{x0 + cl * k * .55:.1f} Z", "#fff", col, .9)
    for xx in range(int(cl * k * .55 + x0 + 6), int(xb1 - 4), 5): h.ln(xx, yc - w * k / 4 + .6, xx, yc + w * k / 4 - .6, col, .25)
    h.txt(x0 - 8, yc + 4, str(P["cod"]), 10.5, 700, col, "end", MONO)
    h.txt(x0 + L * k + 8, yc + 4, f"{L} × {str(P['w']).replace('.', ',')}" + ("  DE BAJA" if P.get("baja") else ""), 9.5, 700 if P.get("baja") else 400, col)
xL = lambda L: x0 + L * k
for L, t in ((100, "100"), (200, "200"), (250, "250")): h.ln(xL(L), y0 - 16, xL(L), y0 + 5 * 25 + 10, G, .4, 'stroke-dasharray="3 3"'); h.txt(xL(L), y0 - 20, t, 9, 700, G, "middle")
h.dimH(y0 + 6 * 25 + 6, x0, xL(250), "LARGO TOTAL L (CABEZA + BANDA + PUNTA)", ext=y0 + 5 * 25 + 6)
h.txt(40, y0 + 6 * 25 + 30, "LA BANDA SE DIBUJA A LA MITAD DE ANCHO PARA QUE SE VEA (EL ANCHO MANDA LA COTA). DENTADO DEL LADO DE ADENTRO, PUNTA AFINADA PARA ENHEBRAR.", 9, 400, G)

# =============== 2. D1 · CABEZA Y DENTADO (4046 vs 4045) ===============
subt(h, 40, 330, "D1 - CABEZA Y DENTADO · 4046 vs 4045", "ESC. 12:1 Y 9:1 · MEDIO CORTE POR LA RANURA · UÑA Y DIENTES (*)")
for j, P in enumerate((PR[0], PR[5])):
    e8 = 12.0 if j == 0 else 9.0; cx = 170 + j * 170; cy = 520
    cl, ch, cw = P["cab"]; t = P["t"]; d = DI["h"] * P["w"] / 4.6; p = DI["paso"] * (P["w"] / 4.6) ** .5
    X = lambda x, cx=cx, e8=e8: cx + x * e8; Y = lambda z, cy=cy, e8=e8: cy - z * e8
    xs0 = cl * .3; xa = xs0 + d + .15; xs1 = xa + t + .2
    h.path(f"M{X(0)},{Y(0)} H{X(xs0)} V{Y(ch)} H{X(0)} Z M{X(xs1)},{Y(0)} H{X(cl)} V{Y(ch)} H{X(xs1)} Z", "url(#PLAS)", K, 1.1)
    una = [(xs0, ch * .9), (xs0 + .2, ch * .9), (xa - d * .1, ch * .5), (xs0, ch * .55)]
    h.path("M" + " L".join(f"{X(a):.1f},{Y(b):.1f}" for a, b in una) + " Z", "url(#PLAS2)", K, .9)
    poly = [(xa + t, -2.5), (xa + t, ch + 3)]; z = ch + 3
    while z > -2.5: poly += [(xa, z), (xa - d, z - p * .85)]; z -= p
    poly += [(xa, -2.5)]
    h.path("M" + " L".join(f"{X(a):.1f},{Y(b):.1f}" for a, b in poly) + " Z", "url(#PLAS)", K, .8)
    h.dimH(Y(ch) - 14, X(0), X(cl), f"{str(cl).replace('.', ',')} (*)", ext=Y(ch), c=OR)
    h.dimV(X(cl) + 14, Y(0), Y(ch), f"{str(ch).replace('.', ',')} (*)", ext=X(cl), c=OR)
    h.dimH(Y(-2.5) + 14, X(xa), X(xa + t), f"{str(t).replace('.', ',')} (*)", ext=Y(-2.5), c=OR)
    h.txt(X(cl / 2), Y(-2.5) + 36, f"{P['cod']} · {P['ref']} · ESC. {int(e8)}:1", 9, 700, K, "middle")
    if j == 0:
        llamada(h, X(xs0 + .1), Y(ch * .75), X(-2.5), Y(ch + 1.5), "UÑA (TRINQUETE)", sz=9, anc="end")
        llamada(h, X(xa - d / 2), Y(ch * .2), X(-2.5), Y(-1.5), "DIENTES DE LA COLA", sz=9, anc="end")
    else:
        pass

# =============== 3. CINTA AUTOSOLDABLE 4041 ===============
subt(h, 470, 330, "CINTA AUTOSOLDABLE 4041 · ROLLO", "ESC. 1:1,5 · 19 mm × 5 m · Ø EXT. CALCULADO (*)")
rx, ry, s3 = 540, 440, 1.25
h.circ(rx, ry, CI["De"] / 2 * s3, "url(#GOMA)", K, 1.2); h.circ(rx, ry, CI["Di"] / 2 * s3 + 2, "#fff", K, .9); h.circ(rx, ry, CI["Di"] / 2 * s3, "none", K, .5)
h.dimH(ry + CI["De"] / 2 * s3 + 16, rx - CI["De"] / 2 * s3, rx + CI["De"] / 2 * s3, f"Ø{str(CI['De']).replace('.', ',')} (*)", ext=ry, c=OR)
h.dimV(rx - CI["De"] / 2 * s3 - 12, ry - CI["Di"] / 2 * s3, ry + CI["Di"] / 2 * s3, "Ø38 (*)", ext=rx - CI["Di"] / 2 * s3, c=OR)
bx = rx + 70; h.rect(bx, ry - CI["De"] / 2 * s3, CI["w"] * s3, CI["De"] * s3, "url(#GOMA)", K, 1.0); h.rect(bx, ry - CI["Di"] / 2 * s3, CI["w"] * s3, CI["Di"] * s3, "#fff", K, .7)
h.dimH(ry - CI["De"] / 2 * s3 - 8, bx, bx + CI["w"] * s3, "19", ext=ry - CI["De"] / 2 * s3)
bloque(h, 680, 380, "CUENTA DEL ROLLO", [f"De = √(Di² + 4·L·e/π)", f"= √(38² + 4·5000·0,76/π)", f"= {str(CI['De']).replace('.', ',')} mm (*)", "e = 0,76: SCOTCH 23 (REF.) (*)"], w=170, sz=9, lh=12)

subt(h, 470, 560, "EMPALME ENCINTADO · CORTE LONGITUDINAL", "ESC. 3:1 (RADIAL × 2,2) · 50 % DE SOLAPE · ESTIRADA · 4 CAPAS")
e2 = 2.9; ex0, ey = 470, 662; rA, rU, Lu = 2.6, 3.0, 30; ee = CI["e"] * .8
X2 = lambda x: ex0 + (x + 45) * e2; Y2 = lambda r: ey - r * e2 * 2.2
for sgn in (1, -1):
    pass
h.rect(X2(-45), Y2(rA), 37 * e2, rA * 2 * e2 * 2.2, "#fff", K, .8); h.rect(X2(Lu + 8), Y2(rA), 37 * e2, rA * 2 * e2 * 2.2, "#fff", K, .8)
h.rect(X2(-8), Y2(1.6), 8 * e2, 3.2 * e2 * 2.2, "url(#CU)", K, .6); h.rect(X2(Lu), Y2(1.6), 8 * e2, 3.2 * e2 * 2.2, "url(#CU)", K, .6)
h.rect(X2(0), Y2(rU), Lu * e2, rU * 2 * e2 * 2.2, "url(#MET)", K, .9)
for kk in range(4):
    a, b = -33 + kk * 5, Lu + 33 - kk * 5
    for sg in (1, -1):
        yi = lambda r: ey - sg * r * e2 * 2.2
        r0 = rA + .05 + kk * ee; r1 = r0 + ee; ru0 = rU + .05 + kk * ee; ru1 = ru0 + ee
        pts = [(a, r0), (-8, r0), (0, ru0), (Lu, ru0), (Lu + 8, r0), (b, r0), (b, r1), (Lu + 8, r1), (Lu, ru1), (0, ru1), (-8, r1), (a, r1)]
        h.path("M" + " L".join(f"{X2(x):.1f},{yi(r):.1f}" for x, r in pts) + " Z", "url(#GOMA)" if kk % 2 == 0 else "url(#PLAS2)", K, .5)
h.dimH(Y2(rU + 4 * ee) - 16, X2(-33), X2(Lu + 33), "≈ 96 = UNION 30 + 25 + 25 + SOLAPES (*)", ext=Y2(rU + 4 * ee), c=OR)
h.dimH(Y2(-rU - 4 * ee) + 18, X2(0), X2(Lu), "UNION 30 (CELLPACK / KLAUKE)", ext=Y2(-rU))
llamada(h, X2(-25), Y2(rA + 2.5 * ee), X2(-45), Y2(rA + 9), "4 CAPAS (2 PASADAS)", sz=8.5, anc="end")
llamada(h, X2(-30), Y2(rA * .4), X2(-50), Y2(-rA - 4), "CABLE 6 mm²", sz=8.5, anc="end")

# =============== TABLAS Y NOTAS ===============
EX = {4046: "100 × 2,5", 4043: "200 × 4,5", 1040: "200 × 4,5", 4044: "200 × 4,6 · PA", 4042: "202 × 4,6", 4045: "250 × 4,8", 4041: "19 mm × 5 m"}
yt = tablaN(h, 40, 765, [4046, 4043, 1040, 4044, 4042, 4045, 4041], EX, w=800, rowh=14.5, tit_extra="MEDIDA", wext=120)
cols = [(220, "l", False), (190, "c", False), (390, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["PRECINTO 100 × 2,5: RESISTENCIA", "80 N · MAZO ≤ 22 (REF.)", "HELLERMANNTYTON T18R 100 × 2,5 (PA 66)"],
       ["PRECINTO 200 × 4,6: RESISTENCIA", "225 N (REF.)", "HELLERMANNTYTON T50R (MAT-FIJACION-1)"],
       ["PRECINTO 250 × 4,8", "≈ 225 N (*)", "SIN FICHA EXACTA: SERIE T50 (*)"],
       ["SCOTCH 43+", "HASTA 1000 V · SIN AZUFRE", "CATALOGO DE DISTRIBUIDOR (GOMA AUTOSOLDABLE)"],
       ["ESPESOR DE LA CINTA", "0,76 mm (*)", "3M SCOTCH 23 (REF.): NO HAY FICHA DE LA 43+"]]
yt = tablaG(h, 40, yt + 16, cols, fil, rowh=14, titulo="DATOS DE REFERENCIA")
notasW(h, 40, yt + 16, [
    "▪ = ALTA DEL EQUIPO (respaldo/nuevos.csv): DESCRIPCION Y UNIDAD TAL CUAL. LARGO Y ANCHO DE CADA PRECINTO: DE ESA DESCRIPCION.",
    "1040 «PRECINTO 200 x 4.5 mm NYLON» ESTA DE BAJA (activo=false) Y ES IGUAL A 4043 Y AL 4029 DEL CATALOGO (MAT-FIJACION-1): TRES CODIGOS PARA EL MISMO PRECINTO. REVISAR.",
    "(*) 4046 DICE «2,5 x 100» (ANCHO × LARGO, AL REVES QUE LOS DEMAS). 4044 ES «POLIAMIDA» Y LOS OTROS «NYLON»: EL NYLON 66 ES UNA POLIAMIDA (PA 66), ES LO MISMO.",
    "(*) CABEZA, ESPESOR Y DENTADO: PROPORCIONALES A T18R / T50R. COLOR: NO LO DICE (SE DIBUJA NATURAL); PARA SOL USAR NEGRO (4030).",
    "(*) CINTA: ESPESOR, NUCLEO Y Ø DEL ROLLO A CONFIRMAR CON UN ROLLO. SE ESTIRA AL APLICAR Y SE SOLAPA LA MITAD; CUBRIR CON CINTA DE PVC SI QUEDA AL SOL (*)."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - LOS 6 PRECINTOS A ESCALA Y DOS CERRADOS", "NYLON 66 NATURAL (*) · 4046 SOBRE 3 CABLES 2,5 · 4045 SOBRE UN MAZO DE 7")
A = img3d(h, "nobra_precintos", 900, 84, 700)
columna(h, A, [("p4046", "", "4046 · 100 × 2,5"), ("p4043", "", "4043 · 200 × 4,5"), ("p1040", "", "1040 · DE BAJA"),
               ("p4044", "", "4044 · 200 × 4,6 PA"), ("p4042", "", "4042 · 202 × 4,6"), ("p4045", "", "4045 · 250 × 4,8")], 1010, 110, 240, lado="izq", paso=24)
for an, tx in (("lazo100", "4046 CERRADO"), ("lazo250", "4045 CERRADO")):
    ax, ay = A(an); globo3d(h, (ax, ay), "", ax + (40 if an == "lazo100" else -40), ay + (40 if an == "lazo100" else -30), tx, lado="der" if an == "lazo100" else "izq")
globo3d(h, A("c4046"), "1", 1000, 478, "CABEZA"); globo3d(h, A("dentado"), "2", 1180, 478, "DENTADO")
h.txt(890, 506, "VISTA 3D - CINTA 4041 Y EMPALME ENCINTADO, CON UN CUARTO ABIERTO", 11, 700, NV, "start", INT)
A2 = img3d(h, "nobra_cinta43", 1010, 512, 470)
columna(h, A2, [("rollo", "3", "ROLLO 19 × 5 m"), ("nucleo", "", "NUCLEO (*)"), ("tira", "4", "TIRA ESTIRADA")], 1500, 530, 720, paso=28)
columna(h, A2, [("capas", "5", "4 CAPAS FUNDIDAS"), ("union", "6", "UNION DE COMPRESION"), ("cuerda", "", "CUERDA DE COBRE"), ("costura", "", "BORDE DE CADA VUELTA"),
                ("cable", "", "CABLE 6 mm²"), ("puntaE", "", "ESCALON EN LA PUNTA")], 1000, 690, 810, lado="izq", paso=22)
bloque(h, 890, 840, "DONDE SE USA", [
    "PRECINTOS: ATAR MAZOS EN TABLEROS, CAJAS Y COLUMNAS; 100 × 2,5 PARA CABLES FINOS (≤ 22 mm); 250 × 4,8 PARA MAZOS GRANDES.",
    "CINTA AUTOSOLDABLE: SELLAR EMPALMES Y TERMINALES CONTRA EL AGUA (BAJO LA CINTA DE PVC), HASTA 1000 V."], w=740, sz=9.5, lh=13)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/nobra_precintos.mjs, nobra_cinta43.mjs). FUENTES: r3d/FUENTES_nobra.md")
rotN(h, "MAT-FIJACION-2", "PRECINTOS 100 A 250 Y", "CINTA AUTOSOLDABLE 43+", "VISTAS, D1, ROLLO, EMPALME, CODIGOS Y 3D", "VARIAS", "INDICADAS · 3D S/E")
guardarC(h, "mat_fijacion_2")
