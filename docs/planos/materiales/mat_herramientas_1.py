"""MAT-HERRAMIENTAS-1 (rev. A) · Pinzas y alicates aislados IEC 60900 (1000 V): pinza universal (9005), pinza de punta cónica (9029),
alicate de corte oblicuo (3088) y cuchillo de electricista aislado (3086, DE BAJA).
Plano y 3D con los mismos contornos (perfiles_nherr.json: P9005, P9029, P3088, CUCH). 3D: r3d/out/nherr_pinzas.png, nherr_pinza_corte.png.
Fuentes: r3d/FUENTES_nherr.md (Knipex 03 06 200, 26 16 200, 70 06 160, 98 52; IEC 60900:2018). Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

U, PC, AL, CU = PH["P9005"], PH["P9029"], PH["P3088"], PH["CUCH"]
h = nuevaH()

# ============ 1. PINZA UNIVERSAL 9005 ============
h.titulo(40, 58, "PINZA UNIVERSAL AISLADA 9005", "ESC. 1:2 · CERRADA, ARRIBA Y COSTADO · REF. KNIPEX 03 06 200 (200 × 58 × 20 · 355 g)")
e = 1.95; ox, oy = 62, 175
v = pinzaArriba(h, U, ox, oy, e)
pinzaCostado(h, U, ox, 282, e)
# llamadas de partes (vista de arriba): arriba la cabeza, abajo el mango
def ll(px, py, tx, ty, t, anc="start"): llamada(h, px, py, tx, ty, t, sz=8.5, anc=anc)
P0 = v.p(6, 4.5); ll(*P0, ox - 6, oy - 52, "MORDAZA ESTRIADA", "start")
P1 = v.p(U["tubo"]["x"] - 2, U["tubo"]["r"] * .7); ll(*P1, ox + 72, oy - 66, "AGARRE DE CAÑOS")
P2 = v.p(45, 3); ll(*P2, ox + 120, oy - 52, "FILOS DE CORTE")
P3 = v.p(U["xp"], -U["rp"] * .75); ll(*P3, ox + 40, oy + 60, "EJE (REMACHE)", "end")
xt = U["xh"] + 3; P4 = v.p(xt, cdel(U, xt) - U["hc0"] - U["ais"]["tope"][0] + 1); ll(*P4, P4[0] + 14, oy + 68, "TOPE (COLLAR)")
xg = U["xh"] + 86; P5 = v.p(xg, cdel(U, xg) - 4); ll(*P5, P5[0] + 26, oy + 68, "CAPA BLANDA")
xb = U["L"] - 5; P6 = v.p(xb, cdel(U, xb) - 3); ll(*P6, P6[0] + 4, oy + 82, "CAPA DURA")
xs = U["xh"] + U["ais"]["grip"][0] + 18; ps = v.p(xs, -cdel(U, xs)); sello2d(h, ps[0], ps[1], 5, "1000 V", K, 6.5)
h.txt(ox - 20, 282 + 34, "COSTADO", 9, 700, G)

# ============ 2. CORTE A-A DEL MANGO ============
subt(h, 560, 92, "CORTE A-A · MANGO BIMATERIAL", "ESC. 1,1:1 · AISLACION SOBRE EL ACERO")
wg = pinzaSeccion(h, U, 690, 185, 4.4)
llamada(h, 690, 185, 770, 140, "ACERO", sz=8.5)
llamada(h, 690 - (U["hcAA"] + 1.3) * 4.4, 180, 596, 140, "CAPA DURA (*)", sz=8.5, anc="end", c=OR)
llamada(h, 690 - (U["hcAA"] + U["ais"]["base"] + 1.2) * 4.4, 202, 596, 244, "CAPA BLANDA (*)", sz=8.5, anc="end", c=OR)
h.txt(560, 270, "MANGO SIN HUECOS NI ACERO A LA VISTA.", 8.5, 400, G)
h.txt(560, 282, "SI ASOMA EL COLOR DE LA CAPA DE ADENTRO,", 8.5, 400, OR); h.txt(560, 294, "LA AISLACION ESTA DAÑADA → NO SE USA (*)", 8.5, 400, OR)

# ============ 3. PUNTA CONICA 9029 Y ALICATE 3088 ============
e2 = 1.12
subt(h, 40, 350, "PUNTA CONICA 9029", "ESC. 1:3,6 · KNIPEX 26 16 200 (206 g)")
v2 = pinzaArriba(h, PC, 50, 430, e2, corte=False)
llamada(h, *v2.p(5, 1.6), v2.p(5, 1.6)[0] - 2, 430 + 44, "PUNTA SEMIRREDONDA", sz=8.5)
llamada(h, *v2.p(66, -4), v2.p(66, -4)[0] + 46, 430 + 44, "FILO Ø3,2", sz=8.5)
subt(h, 330, 350, "CORTE OBLICUO 3088", "ESC. 1:3,6 · KNIPEX 70 06 160")
v4 = pinzaArriba(h, AL, 340, 430, e2, corte=False)
llamada(h, *v4.p(3, -4), v4.p(3, -4)[0] + 4, 430 + 44, "FILOS DIAGONALES", sz=8.5)
h.txt(340, 492, "CORTA Ø2 DURO · Ø2,8 SEMIDURO · Ø4 BLANDO", 8.5, 400, G)

# ============ 4. D1 MORDAZA ============
subt(h, 588, 330, "D1 · CABEZA DE LA 9005", "ESC. 1:1,3 · ABIERTA")
e3 = 3.0; dx, dy = 610, 430
v3 = Vista(h, dx, dy, e3)
jaw = [(x, y) for x, y in U["jaw"]]
for sg in (1, -1):
    v3.poly([(x, sg * (y + 3.5)) for x, y in [(0, 0)] + jaw + [(U["xp"], 0)]], "#fff", 1.1)
for k in range(0, 14):
    x = U["estrias"][0] + k * 1.8
    if x > U["estrias"][1]: break
    for sg in (1, -1): a_, b_ = v3.p(x, sg * 3.5), v3.p(x + .9, sg * 5.0); h.ln(a_[0], a_[1], b_[0], b_[1], K, .5)
for sg in (1, -1):
    c = v3.p(U["tubo"]["x"], sg * 3.5); r_ = U["tubo"]["r"] * e3
    h.a(f'<path d="M{c[0] - r_:.1f},{c[1]:.1f} A{r_:.1f},{r_:.1f} 0 0,{0 if sg > 0 else 1} {c[0] + r_:.1f},{c[1]:.1f}" fill="#fff" stroke="{K}" stroke-width="1"/>')
    a_, b_ = v3.p(U["filo"][0], sg * 3.5), v3.p(U["filo"][1], sg * 3.5); h.ln(a_[0], a_[1], b_[0], b_[1], K, 2.6)
v3.circ(U["xp"], 0, U["rp"], "#fff", 1.1); v3.circ(U["xp"], 0, 5.2, "#fff", .9)
v3.cotaH(0, U["estrias"][1], 17, f'{U["estrias"][1] - U["estrias"][0]:g} (*)', zext=9, c=OR)
v3.cotaH(U["filo"][0], U["filo"][1], -19, f'{U["filo"][1] - U["filo"][0]:g} (*)', zext=-8, c=OR)
pt = v3.p(U["tubo"]["x"], 0); h.txt(pt[0], pt[1] + 26, f'Ø{n(2 * U["tubo"]["r"])} (*)', 8.5, 400, OR, "middle"); h.ln(pt[0], pt[1] + 4, pt[0], pt[1] + 17, OR, .5)
h.txt(dx, dy + 76, "ESTRIAS · CAÑO · FILOS (TRAZO GRUESO)", 8.5, 400, G)

# ============ 5. CUCHILLO 3086 ============
subt(h, 40, 530, "CUCHILLO DE ELECTRICISTA 3086 (DE BAJA)", "ESC. 1:2,9 · KNIPEX 98 52 (190 · HOJA 50)")
e5 = 1.4; cx0, cy0 = 52, 600
v5 = Vista(h, cx0, cy0, e5)
v5.poly([tuple(p) for p in CU["contHoja"]], "#fff", 1.1)
m = CU["mango"]; x0 = CU["L"] - m["L"]
v5.rect(x0 + m["tope"], CU["L"], -m["D0"] / 2 - 1.5, m["D0"] / 2 + 1.5, "#fff", 1.0)
v5.rect(x0 + m["tope"] + 14, CU["L"] - 16, -m["D1"] / 2 - 2.6, m["D1"] / 2 + 2.6, "url(#TPE)", 1.0)
v5.rect(x0, x0 + m["tope"], -m["Dtope"] / 2, m["Dtope"] / 2, "#fff", 1.0)
v5.oculta([(55, 4.5), (x0 + m["tope"] + 50, 4.5)]); v5.oculta([(55, -4.5), (x0 + m["tope"] + 50, -4.5)])
v5.cotaH(0, CU["L"], m["Dtope"] / 2 + 8, f'{CU["L"]:g}', zext=m["Dtope"] / 2)
v5.cotaH(0, CU["hoja"], -m["Dtope"] / 2 - 4, f'{CU["hoja"]:g}', zext=-7)
llamada(h, *v5.p(22, -6.5), v5.p(22, -6.5)[0] + 60, cy0 + 30, "FILO CURVO", sz=8.5)
llamada(h, *v5.p(x0 + 3, -m["Dtope"] / 2 + 2), v5.p(x0 + 3, 0)[0] - 10, cy0 + 40, "COLLAR", sz=8.5, anc="end")
ps = v5.p(x0 + 60, 0); sello2d(h, ps[0], ps[1], 5, "1000 V", K, 6.5)
bloque(h, 380, 545, "CUIDADO Y CONTROL", [
    "ANTES DE USAR: MIRAR EL MANGO (CORTES, QUEMADURAS, CAPAS ASOMADAS).",
    "NO CALENTAR, NO USAR COMO MARTILLO NI PALANCA.",
    "GUARDAR SEPARADAS (NO SUELTAS CON MECHAS NI DISCOS)."], w=440, sz=9.5, lh=13)

# ============ TABLAS Y NOTAS ============
EX = {9005: "200 · 1000 V", 9029: "200 · 1000 V", 3088: "160 · 1000 V", 3086: "190 / HOJA 50"}
yt = tablaH(h, 40, 666, [(c, EX[c]) for c in (9005, 9029, 3088, 3086)], w=800, rowh=14.5)
cols = [(230, "l", False), (250, "c", False), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["NORMA / MARCA", "IEC 60900 · 1000 V ca / 1500 V cc", "IEC 60900:2018 · SIMBOLO IEC 60417-5216"],
       ["ENSAYO DIELECTRICO", "10 000 V AL 100 % DE LAS PIEZAS", "FABRICANTES (KNIPEX, EGA MASTER)"],
       ["CORTE UNIVERSAL 9005", "Cu 16 mm² · Ø2,5 DURO · Ø3,8", "KNIPEX 03 06 200 (MILLS)"],
       ["ESPESOR DE LAS CAPAS", "VER CORTE A-A (*)", "IEC 60900 CL. 4.3: NO SE PUDO LEER (*)"]]
yt = tablaG(h, 40, yt + 16, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
yr = rayadosC(h, 40, yt + 20, ["MET", "PLAS", "TPE"], cols=3, dx=200, rowh=18)
notasW(h, 40, yr + 16, [
    "MEDIDAS: FICHAS DE KNIPEX (LARGO, ANCHO, ESPESOR, PESO, CAPACIDAD DE CORTE). LA MARCA DEL PAÑOL NO ESTA EN EL RESPALDO: SE DIBUJA LA DE REFERENCIA.",
    "(*) FORMA DE LA CABEZA, ESTRIAS, AGARRE DE CAÑOS, LARGO DE LOS FILOS, ESPESOR DEL ACERO Y DE LAS DOS CAPAS: PROPORCIONALES A LA FOTO DE REFERENCIA. A CONFIRMAR CON LA PINZA.",
    "MARCA OBLIGATORIA EN CADA MANGO: DOBLE TRIANGULO + 1000 V, FABRICANTE, MODELO, AÑO E IEC 60900. SIN ESA MARCA NO ES HERRAMIENTA AISLADA. EL COLOR NO INDICA LA CLASE.",
    "UNIDADES DEL RESPALDO MEZCLADAS (Un. / un): SE COPIAN TAL CUAL. 3086 FIGURA DE BAJA (activo = false).",
    "LA AISLACION NO REEMPLAZA EL CORTE DE TENSION NI LOS GUANTES (AEA 95705): SE TRABAJA SIN TENSION SIEMPRE QUE SE PUEDA."], w=800, lh=13.5)

# ============ 3D ============
h.titulo(890, 58, "VISTA 3D - PINZAS, ALICATE Y CUCHILLO AISLADOS", "LA UNIVERSAL ABIERTA, CON UN MANGO CORTADO A CUARTO (ACERO + 2 CAPAS)")
A = img3d(h, "nherr_pinzas", 884, 80, 560)
columna(h, A, [("u_mordaza", "1", "MORDAZA"), ("u_tubo", "", "AGARRE DE CAÑOS"), ("u_filo", "2", "FILOS"), ("u_eje", "3", "EJE"),
               ("u_tope", "4", "TOPE"), ("u_sello", "5", "IEC 60900 · 1000 V"), ("u_grip", "6", "CAPA BLANDA"), ("u_base", "7", "CAPA DURA"),
               ("u_acero", "8", "ACERO (CORTE)"), ("p_punta", "", "9029 PUNTA CONICA"), ("a_filo", "", "3088 CORTE OBLICUO"),
               ("c_hoja", "", "3086 HOJA"), ("c_mango", "", "3086 MANGO")], 1462, 92, 470, paso=29)
h.txt(890, 556, "DETALLE: MANGO CORTADO (CAPAS ESCALONADAS)", 11, 700, NV, "start", INT)
A2 = img3d(h, "nherr_pinza_corte", 884, 564, 400)
columna(h, A2, [("acero", "8", "ACERO DEL BRAZO"), ("capa1", "7", "CAPA DURA"), ("capa2", "6", "CAPA BLANDA")], 1310, 680, 790, paso=32)
h.txt(1310, 590, "MARCA EN EL MANGO", 11, 700, NV, "start", INT)
h.rect(1310, 600, 200, 30, "#f2c418", K, .8); sello2d(h, 1328, 615, 8, "1000 V", K, 11)
h.txt(1428, 620, "IEC 60900", 10, 700, K)
h.txt(1310, 648, "DOBLE TRIANGULO (IEC 60417-5216)", 8.5, 400, G)
usoBloque(h, 890, 850, [
    "9005 UNIVERSAL: PELAR, DOBLAR Y AJUSTAR CABLES EN EL TABLERITO DE LA COLUMNA Y EN EL TABLERO; CORTAR HASTA 16 mm² DE COBRE.",
    "9029 PUNTA CONICA: ARMAR OJALES Y ACOMODAR CABLES EN LA CAJA BORNERA (LUGARES CHICOS).",
    "3088 CORTE OBLICUO: CORTAR CABLES DE COMANDO, PRECINTOS Y PUNTAS AL RAS.",
    "3086 CUCHILLO (DE BAJA): PELAR LA CUBIERTA DEL CABLE SUBTERRANEO.",
    "SIEMPRE CON EL CIRCUITO SIN TENSION: LA AISLACION ES LA SEGUNDA BARRERA, NO LA PRIMERA."], w=740)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_pinzas.mjs, nherr_pinza_corte.mjs) CON LOS MISMOS CONTORNOS. FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-1", "PINZAS Y ALICATES AISLADOS", "IEC 60900 · 1000 V", "VISTAS, CORTE A-A, D1, MARCA Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_1")
