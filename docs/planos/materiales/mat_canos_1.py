"""MAT-CAÑOS-1 (rev. B) · Caños de PVC rígido Ø25,4 a Ø160, unión pegada con enchufe, curva 90°, tapa 5030 y cordón guía 5014.
Plano y 3D con las mismas medidas (r3d/piezas/perfiles_civil.mjs → perfiles_civil.json). 3D: r3d/out/civil_pvc_union.png y civil_pvc_cmp.png.
Fuentes: ficha de la app (Tigre / ETG Córdoba), CRUCE_AP_TC_002, Wavin S-40 (IRAM 13326) y r3d/FUENTES_civil.md. Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

P = PC["PVC"]; d110 = P["d110"]; E = P["enchufe"]; CU = P["curva"]; TP = P["tapa"]
h = nuevaC()

# =============== 1. CORTES TRANSVERSALES (los 5 Ø) ===============
h.titulo(40, 62, "CORTES TRANSVERSALES A-A", "ESC. 1:1,25 · PVC RIGIDO · LA PARED SE VE AMPLIADA EN D1")
k = .8; yc = 190
for key, cx in (("d160", 112), ("d110", 268), ("d90", 388), ("d50", 486), ("d25", 560)):
    c = P[key]; ro = c["D"] / 2 * k; ri = (c["D"] / 2 - c["e"]) * k
    anillo(h, cx, yc, ro, ri, "PVCr", 1.1)
    h.ln(cx - ro - 9, yc, cx + ro + 9, yc, K, .4, h.EJE); h.ln(cx, yc - ro - 9, cx, yc + ro + 9, K, .4, h.EJE)
    D = str(c["D"]).replace(".", ","); h.dimH(yc + 76, cx - ro, cx + ro, "Ø" + D, ext=yc)
    et = "e " + str(c["e"]).replace(".", ",") + (" (*)" if c.get("eAC") else "")
    h.txt(cx, yc + 96, et, 10.5, 700, OR if c.get("eAC") else K, "middle")
    if c.get("eRef"): h.txt(cx, yc + 109, "(REF. 4,7)", 9, 400, G, "middle")
    h.txt(cx, yc - 76, str(c["cod"]), 11, 700, K, "middle", MONO)
h.txt(40, yc + 128, "Ø110 (5007): EL PAÑOL DICE «Ø100 INTERIOR»; CON e = 3,2 EL INTERIOR DA 103,6 (VER NOTA 2).", 9.5, 400, OR)
# llamada D1 en el Ø110
cx1 = 268; ro1 = 55 * k; h.llamadaDet(cx1 + ro1 * .707, yc - ro1 * .707, 10, "D1")

# D1: pared Ø110 ampliada 10:1
x1, y1, kk = 640, 92, 10
subt(h, 618, 62, "D1 - PARED Ø110", "ESC. 10:1")
h.rect(x1, y1 + 14, 170, 3.2 * kk, "url(#PVCr)", K, 1.3)
for xx in (x1, x1 + 170): h.path(f"M{xx},{y1 + 8} l-4,6 l4,6 l-4,6 l4,6 l-4,6 l4,6", "none", K, .6)
h.dimV(x1 + 188, y1 + 14, y1 + 14 + 32, "3,2", ext=x1 + 170)
h.txt(x1, y1 + 8, "CARA EXTERIOR Ø110", 9.5, 400, G); h.txt(x1, y1 + 62, "CARA INTERIOR Ø103,6", 9.5, 400, G)
h.ln(x1, y1 + 110, x1 + 170, y1 + 110, K, .4, h.EJE); h.txt(x1 + 174, y1 + 113, "EJE", 9, 400, G)
h.dimV(x1 - 14, y1 + 14, y1 + 110, "55 (R)", ext=x1)

# =============== 2. MEDIO CORTE B-B · UNION PEGADA ===============
h.titulo(40, 352, "MEDIO CORTE B-B · UNION DE DOS BARRAS Ø110 (ENCHUFE PEGADO)", "ESC. 1:0,6 · ARRIBA EN CORTE, ABAJO EN VISTA · LA ESPIGA DE UNA BARRA ENTRA EN EL ENCHUFE (CABEZA) DE LA OTRA")
kb = .95; yb = 476; X0 = 330            # x = 0 en la boca del enchufe
def bx(x): return X0 + x * kb
ro, e = d110["D"] / 2, d110["e"]; ri = ro - e; j, ad, Lc, Tr = E["juego"], P["adhesivo"], E["Lc"], E["trans"]
roS, riS = ro + j + ad + e, ro + j + ad
def by(r): return yb - r * kb
xa, xb = -240, 330
# espiga (barra 2): de xa a Lc - 2, arriba en corte
h.path(f"M{bx(xa)},{by(ro)} H{bx(Lc - 2)} V{by(ri)} H{bx(xa)} Z", "url(#PVCr)", K, 1.1)
# barra 1: enchufe + abocardado + caño
pts_o = [(-4, roS), (Lc, roS), (Lc + Tr, ro), (xb, ro)]; pts_i = [(xb, ri), (Lc + Tr, ri), (Lc, riS), (-4, riS)]
h.path("M" + " L".join(f"{bx(x):.1f},{by(r):.1f}" for x, r in pts_o + pts_i) + " Z", "url(#PVCr)", K, 1.1)
# adhesivo
h.rect(bx(1), by(riS), (Lc - 4) * kb, (riS - ro) * kb, OR, OR, .3)
# abajo: vista (contornos)
h.path(f"M{bx(xa)},{by(-ro)} H{bx(-4)} M{bx(-4)},{by(-roS)} H{bx(Lc)} L{bx(Lc + Tr)},{by(-ro)} H{bx(xb)}", "none", K, 1.2)
h.ln(bx(-4), by(-ro), bx(-4), by(-roS), K, 1.0)
h.path(f"M{bx(Lc - 2)},{by(-ri)} V{by(-ro)}", "none", K, .6, h.OCULTA)
for xx in (xa, xb): h.path(f"M{bx(xx)},{by(roS) - 8} l-5,10 l10,8 l-5,10 V{by(-roS) + 8}", "none", K, .7)
h.ln(bx(xa) - 10, yb, bx(xb) + 10, yb, K, .45, h.EJE)
h.ln(bx(Lc - 2), by(ri), bx(Lc - 2), yb - 20, K, .5, h.OCULTA)
h.dimH(by(-roS) + 20, bx(0), bx(Lc), "Lc 53,5 (*)", ext=by(-roS), c=OR, dy=13)
h.dimH(by(-roS) + 20, bx(Lc), bx(Lc + Tr), "", ext=by(-roS), c=OR); h.txt(bx(Lc + Tr) + 8, by(-roS) + 24, "18 (*)", 11, 400, OR)
h.dimV(bx(xb) + 22, by(ro), by(-ro), "Ø110", ext=bx(xb))
h.dimV(bx(xa) - 18, by(ri), by(-ri), "Ø103,6", ext=bx(xa))
h.dimV(bx(-30), by(roS), by(-roS), "Ø117,3", ext=None)
for n, (x, r), (gx, gy) in [("1", (-160, ro - e / 2), (bx(-160), by(roS) - 30)), ("2", (Lc * .3, roS - e / 2), (bx(0) - 50, by(roS) - 30)),
                            ("3", (Lc * .55, ro + .3), (bx(Lc) + 70, by(roS) - 30)), ("4", (Lc + Tr / 2, (roS + ro) / 2), (bx(Lc + Tr) + 110, by(roS) - 30)),
                            ("5", (250, ro - e / 2), (bx(250), by(roS) - 30))]:
    h.globo(n, bx(x), by(r), gx, gy, r=9)
cx, cy = bx(Lc * .5), by(roS - 2); h.llamadaDet(cx, cy, 22, ""); h.txt(cx + 25, cy - 16, "D2", 11, 700)
h.txt(bx(xa) + 230, by(-roS) + 52, "1 BARRA (ESPIGA) · 2 ENCHUFE · 3 ADHESIVO PARA PVC (*) · 4 ABOCARDADO · 5 BARRA", 9.5, 400, G)

# =============== 3. D2 · JUNTA PEGADA ===============
subt(h, 40, 625, "D2 - JUNTA PEGADA", "ESC. 8:1 · JUEGO + ADHESIVO ENTRE ESPIGA Y ENCHUFE")
k2 = 12; xd, yd = 62, 672
def dy(r): return yd + (roS - r) * k2
h.rect(xd, dy(roS), 200, e * k2, "url(#PVCr)", K, 1.1)                        # pared del enchufe
h.rect(xd, dy(riS), 200, (riS - ro) * k2, OR, OR, .4)                          # adhesivo + juego
h.rect(xd, dy(ro), 200, e * k2, "url(#PVCr)", K, 1.1)                          # pared de la espiga
for yy in (dy(roS), dy(ri)): h.path(f"M{xd},{yy - 4} l-4,6 l4,6 l-4,6 l4,6 l-4,6", "none", K, .5)
h.dimV(xd + 222, dy(roS), dy(riS), "3,2", ext=xd + 200)
h.dimV(xd + 222, dy(ro), dy(ri), "3,2", ext=xd + 200)
llamada(h, xd + 196, (dy(riS) + dy(ro)) / 2, xd + 140, dy(ri) + 46, "JUEGO + ADHESIVO 0,65 (*)", c=OR, sz=9)
llamada(h, xd + 80, dy(roS) + 12, xd + 110, dy(roS) - 12, "ENCHUFE (BARRA 1)", sz=9)
llamada(h, xd + 40, dy(ro) + 14, xd + 10, dy(ri) + 26, "ESPIGA (BARRA 2)", sz=9)

# =============== 4. CURVA 90° Ø110 (medio corte) ===============
subt(h, 330, 625, "CURVA 90° Ø110 CON ENCHUFES", "ESC. 1:3,5 · MEDIO CORTE · A VINCULAR")
k3 = .5; ox, oy = 372, 812            # centro del arco
Rk, rS, rSi = CU["R"] * k3, roS * k3, riS * k3; L3 = (Lc + 8) * k3
# enchufe horizontal (abajo, sale hacia la izquierda) y vertical (arriba)
ax, ay = ox, oy - Rk                   # el arco va de (ox, oy - R) ... uso centro (ox + R, oy)
cxa, cya = ox + Rk, oy                 # centro del arco
def P2(a, r): return (cxa + r * math.cos(math.radians(a)), cya + r * math.sin(math.radians(a)))
# media curva (lado de arriba en corte = anillo exterior entre Rk+rSi..Rk+rS y Rk-rS..Rk-rSi)
for r0, r1 in ((Rk + rSi, Rk + rS), (Rk - rS, Rk - rSi)):
    p = "M" + " L".join(f"{P2(a, r1)[0]:.1f},{P2(a, r1)[1]:.1f}" for a in range(180, 271, 5)) + " L" + " L".join(f"{P2(a, r0)[0]:.1f},{P2(a, r0)[1]:.1f}" for a in range(270, 179, -5)) + " Z"
    h.path(p, "url(#PVCr)", K, 1.0)
h.path(arcoPath(cxa, cya, Rk, 180, 270), "none", K, .45, h.EJE)
# enchufes rectos en las dos puntas
for (sx, sy, dx, dy_) in ((cxa - Rk, cya, 0, 1), (cxa, cya - Rk, -1, 0)):
    if dx == 0:
        h.rect(sx - rS, sy, rS - rSi, L3, "url(#PVCr)", K, 1.0); h.rect(sx + rSi, sy, rS - rSi, L3, "url(#PVCr)", K, 1.0)
    else:
        h.rect(sx, sy - rS, L3, rS - rSi, "url(#PVCr)", K, 1.0); h.rect(sx, sy + rSi, L3, rS - rSi, "url(#PVCr)", K, 1.0)
h.ln(cxa, cya, cxa - Rk, cya, K, .4, h.OCULTA); h.ln(cxa, cya, cxa, cya - Rk, K, .4, h.OCULTA)
h.txt(cxa - Rk / 2, cya + 12, "R 165 (*)", 9.5, 700, OR, "middle")
h.dimH(cya - Rk - rS - 12, cxa, cxa + L3, "61,5", ext=cya - Rk - rS)
h.ln(cxa - Rk - 30, cya, cxa + 10, cya, K, .4, h.EJE); h.ln(cxa, cya - Rk - 20, cxa, cya + 10, K, .4, h.EJE)
h.txt(cxa - Rk - rS - 4, cya + L3 + 16, "CURVA 90° = 1,5 × D (*)", 9, 400, OR)

# =============== 5. TAPA 5030 Y CORDON 5014 ===============
subt(h, 610, 625, "TAPA 5030 + CORDON 5014", "ESC. 1:2 · CAÑO DE RESERVA CERRADO")
k4 = .5; tx, ty = 620, 725; rr = ro * k4; rT = (ro + j + TP["e"]) * k4
h.ln(tx, ty, tx + 210, ty, K, .4, h.EJE)
h.rect(tx, ty - rr, 130, e * k4 + .5, "url(#PVCr)", K, .9); h.rect(tx, ty + rr - e * k4 - .5, 130, e * k4 + .5, "url(#PVCr)", K, .9)
h.path(f"M{tx + 130 - TP['L'] * k4 + 6},{ty - rT} H{tx + 130 + TP['fondo'] * k4 + 6} V{ty + rT} H{tx + 130 - TP['L'] * k4 + 6} V{ty + rr} H{tx + 136} V{ty - rr} H{tx + 130 - TP['L'] * k4 + 6} Z", K, K, .5)
h.path(f"M{tx + 10},{ty + 6} C{tx + 60},{ty + 18} {tx + 100},{ty - 2} {tx + 126},{ty + 4}", "none", K, 1.6, 'stroke-dasharray="5 3"')
h.dimH(ty - rT - 12, tx + 130 - TP["L"] * k4 + 6, tx + 136 + TP["fondo"] * k4, "62 (*)", ext=ty - rT, c=OR)
llamada(h, tx + 136, ty - rT + 3, tx + 160, ty - rT - 28, "TAPA 5030", sz=9.5)
llamada(h, tx + 60, ty + 13, tx + 20, ty + rr + 22, "CORDON GUIA Ø10 (5014), ATADO (*)", sz=9)
h.txt(tx, ty + rr + 40, "EL CAÑO DE TRABAJO SE SELLA DE LOS DOS LADOS", 9, 400, G)

# =============== TABLAS Y NOTAS ===============
EX = {5007: "Ø110 · e 3,2", 5008: "Ø160 · e 3,2 (4,7)", 5010: "Ø90 · e 2,7 (cl. 6)", 5009: "Ø50 · e 3,2", 5011: "Ø25,4 · e (*)", 5030: "PARA Ø110", 5014: "Ø10 NYLON"}
yt = tablaCod(h, 40, 880, [5007, 5008, 5010, 5009, 5011, 5030, 5014], EX, w=800, rowh=14.5, titulo="CODIGOS DEL PAÑOL", tit_extra="Ø × PARED", wext=130)
rayadosC(h, 640, 812, ["PVCr"], cols=1)
notasW(h, 40, yt + 22, [
    "COTAS EN mm. Ø Y PARED: FICHA DE LA APP (TIGRE; ETG CORDOBA: CRUCE CON PVC REFORZADO Ø100 × 3,2) Y CRUCE_AP_TC_002 (2 CAÑOS Ø110).",
    "(*) 5007 DICE «Ø100 INTERIOR»; CON e = 3,2 EL INTERIOR DA 103,6. CONFIRMAR CON EL PROVEEDOR CUAL SE COMPRA.",
    "(*) Lc = 53,5: LARGO MINIMO DE ENCHUFE PARA DN 110 (WAVIN S-40, IRAM 13326), LEIDO DE LA TABLA. ABOCARDADO, ADHESIVO, R DE LA CURVA, TAPA: PROPORCIONALES.",
    "(*) PLIEGO ITEM 21: «1 CAÑO Ø160» (5008); PLANO AP-TC-002: 2 Ø110. CERRAR CON LA INSPECCION. CURVAS Y CUPLAS NO TIENEN CODIGO (A VINCULAR).",
    "FUENTES DE CADA MEDIDA: r3d/FUENTES_civil.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - UNION Y CURVA Ø110 EN MEDIO CORTE", "SE SACO LA MITAD DE ADELANTE: SE VE LA PARED, EL ENCHUFE Y EL ADHESIVO · ATRAS EL CAÑO DE RESERVA")
A = img3d(h, "civil_pvc_union", 884, 84, 610)
columna(h, A, [("reserva", "6", "CAÑO DE RESERVA Ø110"), ("tapa", "7", "TAPA 5030"), ("cordon", "8", "CORDON GUIA 5014"), ("enchufeC", "9", "ENCHUFE DE LA CURVA"),
               ("curva", "10", "CURVA 90° (A VINCULAR)")], 1508, 104, 300)
columna(h, A, [("pared", "1", "PARED 3,2 (CORTE)"), ("enchufe", "2", "ENCHUFE"), ("adhesivo", "3", "ADHESIVO (*)"), ("abocardado", "4", "ABOCARDADO"),
               ("barra", "5", "BARRA Ø110")], 1508, 318, 440, paso=25)
h.txt(890, 470, "D2 EN 3D: LA JUNTA PEGADA", 11, 700, NV, "start", INT)
A3 = img3d(h, "civil_pvc_det", 884, 478, 380)
for an, t, gy in (("enchufe", "ENCHUFE", 492), ("adhesivo", "ADHESIVO (*)", 516), ("abocardado", "ABOCARDADO", 540), ("tope", "PUNTA DE LA ESPIGA", 564), ("espiga", "ESPIGA", 700)):
    globo3d(h, A3(an), "", 1275, gy, t)
h.txt(1420, 600, "LOS 5 Ø A LA MISMA ESCALA", 10, 700, NV, "start", INT)
A2 = img3d(h, "civil_pvc_cmp", 1415, 606, 230)
for key, t in (("d160", "160"), ("d110", "110"), ("d90", "90"), ("d50", "50"), ("d25", "25,4")):
    x, y = A2(key + "b"); h.txt(x, y + 12, t, 8.5, 700, NV, "middle", INT)
bloque(h, 890, 870, "DATOS TECNICOS", [
    "PVC RIGIDO REFORZADO (Ø110, Ø160, Ø50) · Ø90 CLASE 6",
    "UNION POR ENCHUFE PEGADO: LIMPIAR, LIJAR, ADHESIVO EN LAS DOS CARAS, ENCHUFAR HASTA EL FONDO SIN GIRAR (*)",
    "CORDON GUIA DE NYLON Ø10 EN EL CAÑO DE RESERVA, CON TAPA",
    "CURVAS Y CUPLAS: SIN CODIGO EN EL PAÑOL (*)"], w=360, sz=10, lh=13.5)
bloque(h, 1270, 870, "DONDE SE USA", [
    "AP-TC-002 CRUCE DE CALZADA: 2 Ø110 (TRABAJO + RESERVA), DE CAMARA A CAMARA",
    "AP-TC-007 TABLERO A NIVEL: Ø90 INGRESO DE LA ACOMETIDA EPEC",
    "PAT: CONDUCTO Ø50 EXCLUSIVO · Ø25,4 DESAGÜE DE LA FUNDACION (AP-TC-003)",
    "GUIA «ZANJEO Y TENDIDO»"], w=360, sz=10, lh=13.5)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_pvc_*.mjs) CON LAS MISMAS MEDIDAS DEL PLANO. FUENTES: r3d/FUENTES_civil.md")
rotuloMat(h, "MAT-CAÑOS-1", "CAÑOS DE PVC RIGIDO", "Ø25,4 A Ø160 · UNION Y CURVA", "CORTES A-A Y B-B, D1, D2, CURVA, TAPA Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha=FECHA)
guardarC(h, "mat_canos_1")
