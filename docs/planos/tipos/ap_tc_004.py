import math, sys
sys.path.insert(0, ".")
from _barrio import *

h = nueva()
banner(h, "PLANO OFICIAL PENDIENTE - DIBUJADO CON LA FICHA DE NORMAS, LA CALCULADORA DE BARRIO Y LA GUIA «TENDIDO AEREO». LO NARANJA CON (*) ES A CONFIRMAR")

# ======================= VISTA DE FRENTE · ESC 1:75
k = 0.0533; PX = 150; yG = 500
LIB, EMP = 7050, 1450
zR = 6800            # neutro de la red (*)
zF = (300, 2200)     # flejes (*)
JD, JT = 900, 300    # jabalina: distancia al poste y tapada de la cabeza (*)
def Y(z): return yG - z * k
h.titulo(40, 74, "VISTA DE FRENTE", "ESC. 1:75 - DESDE LA VEREDA, LA RED A LO LARGO")
suelo2d(h, 40, 340, yG, 125)
d = poste2d(h, PX, yG, k, LIB, EMP, 300, 209, "#fff", K, 1.6)
def R(z): return d(z + EMP) / 2 * k
h.ln(44, Y(zR), 336, Y(zR), K, 3.4); h.ln(44, Y(zR), 336, Y(zR), "#fff", 1.6)
h.rect(PX - 4, Y(zR) - 2, 8, 9, "#fff", K, .8)
mx = PX + 42
h.rect(mx - 3, Y(zR) + 2, 6, 7, "#fff", K, .7)
xV = PX + R(2500) + 3
h.path(f"M{mx},{Y(zR)+9} Q{mx},{Y(zR)+40} {xV},{Y(zR-900)} L{xV},{yG+JT*k} L{PX+JD*k},{yG+JT*k}", "none", K, .9)
h.rect(xV - 2.5, Y(2500), 5, 2500 * k + 6, "#fff", K, .8)
for z in zF: h.rect(PX - R(z) - 2, Y(z) - 1.5, 2 * R(z) + 9, 3, "#fff", K, .7)
jx = PX + JD * k
jabalina2d(h, jx, yG + JT * k, 1500 * k, 3)
h.rect(jx - 3, yG + JT * k - 3, 6, 5, "#fff", K, .8)
h.nivel(48, yG, "±0,00")
h.dimV(80, yG, Y(zR), "6.800 (*)", ext=PX - 12, c=OR)
h.dimV(300, yG, Y(2500), "2.500", ext=xV + 3)
blanco(h, (PX + jx) / 2, yG + 1960 * k + 12, 70)
h.dimH(yG + 1960 * k, PX, jx, "900 (*)", c=OR, ext=yG + 1820 * k, dy=12)
h.dimV(300, yG + JT * k, yG + (JT + 1500) * k, "1.500", ext=jx + 3)
for z in zF: h.txt(PX - R(z) - 8, Y(z) + 4, "F", 9.5, 700, K, "end")
for xa in (PX - R(1200) - 26, PX + R(1200) + 30):
    h.ln(xa, Y(1200) - 7, xa, Y(1200) + 7, K, 1.6); h.txt(xa + (6 if xa > PX else -6), Y(1200) - 9, "A", 12, 700, K, "middle")
h.ln(PX - R(1200) - 26, Y(1200), PX + R(1200) + 30, Y(1200), K, .5, 'stroke-dasharray="10 3 2 3"')
h.llamadaDet(mx, Y(zR) + 6, 26, "D1")
h.llamadaDet(PX + 16, yG + 14, 34, "D2")
h.globo("4", mx + 3, Y(zR) + 6, 250, 116); h.globo("8", 290, Y(zR), 300, 116)
h.globo("3", xV, Y(4200), 240, Y(4200)); h.globo("5", xV + 2, Y(1700), 240, Y(1700))
h.globo("1", jx, yG + 1200 * k, 238, yG + 1100 * k); h.globo("9", PX - R(3500), Y(3500), 110, Y(3500))

# ======================= D1 · TOMA DEL NEUTRO · S/E
h.titulo(360, 74, "D1 - TOMA DEL NEUTRO", "S/E - NO SE PELA: EL MORSETO PERFORA LA AISLACION")
yN = 160
for dy, lab in ((-16, "FASES"), (0, ""), (16, "")):
    h.ln(372, yN + dy, 600, yN + dy, K, 7); h.ln(372, yN + dy, 600, yN + dy, "#fff", 5)
h.ln(372, yN + 32, 600, yN + 32, K, 7); h.ln(372, yN + 32, 600, yN + 32, "#fff", 5)
for xx in range(372, 600, 9): h.ln(xx, yN + 29, xx + 2, yN + 35, K, .5)   # nervaduras del neutro
h.txt(372, yN - 26, "PREENSAMBLADO 3×25 + 1×16 (*)", 9.5, 700, OR)
h.txt(500, yN + 54, "NEUTRO (NERVADURAS (*))", 9.5, 400, OR)
morseto2d(h, 480, yN + 32, 1.0)
h.path(f"M480,{yN+65} L480,{yN+80} Q480,{yN+90} 490,{yN+90} L560,{yN+90} Q570,{yN+90} 570,{yN+100} L570,{yN+110}", "none", K, 2.6)
h.path(f"M480,{yN+65} L480,{yN+80} Q480,{yN+90} 490,{yN+90} L560,{yN+90} Q570,{yN+90} 570,{yN+100} L570,{yN+110}", "none", "#fff", 1.2)
h.rect(564, yN + 110, 12, 24, "url(#ANSI31)", K, 1); h.rect(567, yN + 110, 6, 24, "#fff", K, .5)
h.txt(586, yN + 118, "A LA JABALINA, EN", 9.5, 400, G); h.txt(586, yN + 130, "CAÑO PVC 3/4\"", 9.5, 400, G)
h.globo("4", 494, yN + 4, 540, yN - 40 + 6, r=9); h.globo("3", 525, yN + 90, 640, yN + 90, r=9)
h.globo("5", 576, yN + 126, 560, yN + 136, r=9)
h.txt(372, yN + 100, "1995/1: RANGO", 9.5, 400, OR); h.txt(372, yN + 112, "EN EL GRABADO (*)", 9.5, 400, OR)

# ======================= CORTE A-A · ESC 1:10 (por la bajada, sobre el caño)
k2 = .42; ax, ay = 742, 200
h.titulo(660, 74, "CORTE A-A", "ESC. 1:10 - POR EL CAÑO")
rp = 110 * k2; rcn = 26.7 / 2 * k2 * 1.6
h.circ(ax, ay, rp, "url(#CONCP)", K, 1.6)
ccx = ax + rp + rcn
h.cano(ccx, ay, rcn, rcn * .72, "#fff")
h.circ(ccx, ay, 2.6, "#fff", K, .6); h.circ(ccx, ay, 1.6, "url(#cuH)", K, .3)
h.txt(ax - rp, ay + rp + 46, "EN A-A EL CAÑO VA SIN FLEJE", 9.5, 400, G)
h.dimH(ay + rp + 22, ax - rp, ax + rp, "Ø220 (SE MIDE)", ext=ay + 4, dy=12)
h.txt(ccx + rcn + 6, ay - 8, "PVC 3/4\"", 9.5, 400, G); h.txt(ccx + rcn + 6, ay + 4, "V/A 1×10", 9.5, 400, G)
h.txt(ax - rp, ay + rp + 62, "FLEJE = π × 0,220 + 0,30 = 0,99 m", 10, 700)

# ======================= D2 · PIE DEL POSTE Y JABALINA · ESC 1:30
k3 = .1; X3 = 440; yG3 = 400
def Y3(z): return yG3 - z * k3
h.titulo(360, 322, "D2 - PIE DEL POSTE Y JABALINA", "ESC. 1:40 - CORTE POR LA BAJADA")
h.rect(364, yG3, 486, 236, "url(#EARTH)", K, 0)
h.rect(364, yG3 - 4, 486, 4, "url(#CONCP)", K, .6); h.ln(364, yG3, 850, yG3, K, 1.4)
rr3 = d(EMP) / 2 * k3
h.rect(X3 - rr3, Y3(400), 2 * rr3, (400 + 1450) * k3, "url(#CONCP)", K, 1.6)
h.path(f"M{X3-rr3-6},{Y3(400)} l8,-5 l10,9 l10,-9 l10,9 l8,-5 l8,-5", "none", K, .9)
rc3 = 26.7 / 2 * k3 * 1.6; xc3 = X3 + rr3 + rc3 + 1
h.rect(xc3 - rc3, Y3(400), 2 * rc3, 400 * k3 + 150 * k3, "url(#ANSI31)", K, 1)
h.rect(PX * 0 + X3 - rr3 - 3, Y3(300) - 3, 2 * rr3 + 2 * rc3 + 8, 6, "#fff", K, 1)
h.rect(xc3 + rc3 + 3, Y3(300) - 5, 6, 10, "#fff", K, 1)
jx3 = X3 + JD * k3
yj = Y3(-JT)
h.path(f"M{xc3},{Y3(-150)} Q{xc3},{yj} {xc3+20},{yj} L{jx3-8},{yj}", "none", K, 1.6)
h.rect(jx3 - 1.0, yj, 2.0, 1500 * k3, "#fff", K, 1)
h.path(f"M{jx3-1},{yj+1500*k3} L{jx3},{yj+1500*k3+5} L{jx3+1},{yj+1500*k3}", "#fff", K, .9)
h.rect(jx3 - 7, yj - 5, 14, 12, "#fff", K, 1.1); h.rect(jx3 + 7, yj - 3, 5, 7, "#fff", K, .9)
blanco(h, jx3 + 60, yj + 120, 80)
h.txt(jx3 + 22, yj + 120, "Ø14,6 × 1500", 9.5, 400, K, "start", MONO)
h.dimV(jx3 + 30, yG3, yj, "300 (*)", ext=jx3 + 9, c=OR)
blanco(h, jx3 + 52, yj + 1500 * k3 / 2 + 4, 14, 40)
h.dimV(jx3 + 52, yj, yj + 1500 * k3, "1.500", ext=jx3 + 3)
blanco(h, (X3 + jx3) / 2, Y3(-2050) + 12, 60)
h.dimH(Y3(-2050), X3, jx3, "900 (*)", c=OR, ext=yj + 10, dy=12)
blanco(h, X3 + 4, Y3(-1450) + 12, 100)
h.txt(X3 + 4, Y3(-1450) + 12, "EMPOTRAMIENTO (*)", 9, 400, OR, "middle")
h.globo("5", xc3, Y3(380), 600, 360, r=9); h.globo("6", xc3 + rc3 + 6, Y3(300), 640, 360, r=9)
h.globo("3", xc3 + 30, yj, 680, 360, r=9); h.globo("2", jx3 + 12, yj, 720, 360, r=9)
h.globo("1", jx3, yj + 100, 760, 360, r=9)

# ======================= ESQUEMA DE LA RED (planta) · S/E
h.titulo(40, 700, "ESQUEMA DE LA RED", "S/E - PLANTA DE UNA LINEA DE 200 m")
ye = 762
h.ln(60, ye, 560, ye, K, 1.6)
for i in range(6):
    x = 60 + i * 100
    h.circ(x, ye, 6, "#fff", K, 1.2)
    if i < 5: h.txt(x + 50, ye - 10, "≤ 40 m", 9.5, 400, K, "middle", MONO)
for x in (60, 560):
    h.path(f"M{x},{ye+8} l0,22 m-10,0 h20 m-15,5 h10 m-6,5 h2", "none", K, 1.2)
    h.txt(x, ye + 58, "PAT", 10.5, 700, K, "middle")
h.dimH(ye + 76, 60, 560, "≤ 200.000 ENTRE PAT DEL NEUTRO (ET-1005)", dy=-6)
h.txt(600, ye - 6, "PAT AL FINAL DE", 9.5, 400, OR); h.txt(600, ye + 6, "LINEA (*)", 9.5, 400, OR)

# ======================= CÓMPUTO
h.tabla(40, 860, [(150, "l", False), (78, "c", True), (300, "l", False)],
        [("POR PAT DE NEUTRO", "CANT.", "CALCULO (CALCULADORA DE BARRIO)"),
         ("CANTIDAD DE PAT", "≥ L/200", "metros de tendido ÷ 200, para arriba"),
         ("JABALINA + TOMACABLE", "1 + 1", "una por PAT de neutro"),
         ("CONDUCTOR DE BAJADA", "9 m", "del neutro a la jabalina (defecto)"),
         ("MORSETO 1995/1", "1 u", "toma el neutro de la red"),
         ("CAÑO PVC 3/4\"", "3 m", "protege la bajada hasta 2,5 m"),
         ("FLEJE + HEBILLAS", "1,98 m + 2", "2 × (π × 0,220 + 0,30)"),
         ("MEDICION (ITEM 2.02)", "1", "neutro &lt; 5 Ω (ET-1005)")],
        rowh=19, titulo="COMPUTO POR PAT")
h.rayados(610, 860, [("EARTH", "TERRENO"), ("CONCP", "POSTE (CORTE)"), ("ANSI31", "CAÑO PVC (CORTE)"), ("FOAM", "-")][:3], cols=1, dx=150)
h.notas(40, 1042, [
    "COTAS EN mm. PAT COMPLETA DE LA RED AEREA: ITEM 2.02 LP 21478 (K 2,0367, EL DOBLE DEL 2.01 DE AP-TC-005/006).",
    "ET-1005: NEUTRO A TIERRA CADA 200 m COMO MAXIMO, &lt; 5 Ω; VANO ≤ 40 m. LA CALCULADORA AVISA SI FALTAN.",
    "TOMA CON MORSETO 1995/1; BAJADA POR EL POSTE EN CAÑO PVC 3/4\" HASTA 2,5 m, 2 FLEJES. TOMACABLE, NUNCA A ROSCA (ETG 14).",
    "VARIANTES DEL CONDUCTOR: ACERO-Cu 1×25 DESNUDO (1012) O Cu DESNUDO 35 (1013). MEDIR CADA PAT Y ANOTARLA EN LA ORDEN.",
    "(*) SIN PLANO: DISTANCIA Y TAPADA DE LA JABALINA, ALTURA DEL NEUTRO Y DE LOS FLEJES, SI VA PAT AL FINAL DE LINEA.",
    "(*) FORMACION DEL PREENSAMBLADO SEGUN LA RED (2×16 / 3×25+1×16). MORSETO 1995/1 SIN DATOS PUBLICADOS: VER EL GRABADO."])

# ======================= 3D · ARRIBA
h.titulo(880, 74, "VISTA 3D - TOMA DEL NEUTRO Y PAT", "IZQ.: EL MORSETO EN EL NEUTRO · DER.: PIE DEL POSTE CON EL TERRENO CORTADO A UN CUARTO")
h.iso(.25, 1110, 1912)
posteZ(h, 5900, 7050, 0, 0, 114, 105)
roturaV(h, h.P(0, 0, 5900)[0], h.P(0, 0, 5900)[1], 26)
h.BOX(100, 240, -20, 20, zR - 40, zR + 20, "url(#galv)", "#8a96a0", "#a4afb8", "#333", .6)
for dz, c_ in ((-30, "#1a1a1a"), (-70, "#262626"), (-110, "#1f1f1f")):
    cuerda(h, [(250, -480, zR + dz), (250, 600, zR + dz)], 16, c_)
cuerda(h, [(250, -480, zR - 150), (250, 600, zR - 150)], 14, "#3a3a3a")
for yy in range(-460, 600, 60):
    a_ = h.P(250, yy, zR - 150 + 14); b_ = h.P(250, yy + 20, zR - 150 - 14); h.ln(*a_, *b_, "#666", .8)
h.BOX(225, 290, 90, 150, zR - 195, zR - 115, "#3a3a3a", "#1d1d1d", "#2a2a2a", "#000", .5)
tubo(h, (257, 120, zR - 115), (257, 120, zR - 75), 7, "url(#galv)", cap="#d0d6dc")
cuerda(h, [(257, 120, zR - 200), (240, 120, zR - 330), (140, 60, zR - 450), (140, 60, 5900)], 9, "#5aa02c")
GL = 900
h.g3("8", (250, -400, zR - 70), GL, 128, "RED (NEUTRO ABAJO)")
h.g3("4", (290, 120, zR - 150), GL, 166, "MORSETO 1995/1")
h.g3("3", (140, 60, 6100), GL, 204, "V/A 1×10")
h.g3("9", (-60, 0, 6200), GL, 242, "POSTE")

# ======================= 3D · ABAJO
h.iso(.09, 1390, 318)
W = 1000
suelo3d(h, W, W, 2000)
h.a(f'<clipPath id="cuarto"><polygon points="{hull(h, W, W, 2000)}"/></clipPath><g clip-path="url(#cuarto)">')
posteZ(h, -1450, 0, 0, 0, 150, 144)
cuerda(h, [(165, 40, 0), (165, 40, -200), (400, 20, -300), (900, 0, -300)], 9, "#5aa02c")
h.a('</g>')
posteZ(h, 0, 1700, 0, 0, 144, 138)
roturaV(h, h.P(0, 0, 1700)[0], h.P(0, 0, 1700)[1], 16)
tubo(h, (165, 40, 1700), (165, 40, 0), 14, "url(#pvc)", "#777")
anilloZ(h, 300, 0, 0, 160, 25, "url(#inox)", "#666")
tubo(h, (900, 0, -1800), (900, 0, -300), 9, "url(#cobre)", "#5a3510")
h.BOX(870, 940, -25, 25, -330, -260, "url(#bronce)", "#9b6a22", "#b07a2a", "#4a3010", .6)
GR = 1560
h.g3("5", (165, 40, 1300), GR, 128, "CAÑO PVC")
h.g3("6", (160, 0, 312), GR, 166, "FLEJE")
h.g3("3", (380, 20, -300), GR, 260, "V/A 1×10")
h.g3("2", (940, 0, -290), GR, 340, "TOMACABLE")
h.g3("1", (900, 0, -1300), GR, 420, "JABALINA")
h.txt(1250, 600, "La bajada entra al suelo por el caño hasta la cabeza de la jabalina.", 11, 400, G, "start", INT)

# ======================= LISTA
filas = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "JABALINA Cu-ACERO Ø14,6 × 1500 (IRAM 2309)", "1 u", "7015"),
         ("2", "TOMACABLE WGC / TGC PARA LA JABALINA", "1 u", "7019"),
         ("3", "CABLE Cu 1×10 V/A: DEL NEUTRO A LA JABALINA", "9 m", "7010"),
         ("4", "MORSETO DE DERIVACION 1995/1: TOMA EL NEUTRO", "1 u", "3051"),
         ("5", "CAÑO PVC 3/4\": PROTECCION DE LA BAJADA HASTA 2,5 m", "3 m", "5006"),
         ("6", "FLEJE INOX 3/4\" (2 × 0,99 m) + HEBILLAS", "1,98 m + 2", "4024·4025"),
         ("7", "MEDICION DE PAT (NEUTRO &lt; 5 Ω)", "1", "ITEM 2.02"),
         ("8", "RED EXISTENTE: NEUTRO DEL PREENSAMBLADO", "-", "1502·1503"),
         ("9", "POSTE EXISTENTE H°A° O MADERA", "SEGUN OBRA", "6501·6502"),
         ("10", "VARIANTE: ACERO-Cu 1×25 DESNUDO EN LUGAR DE 3", "(9 m)", "1012"),
         ("11", "VARIANTE: Cu DESNUDO 35 mm² EN LUGAR DE 3", "(9 m)", "1013")]
h.tabla(880, 660, [(38, "c", False), (468, "l", False), (104, "c", True), (150, "c", False)], filas, rowh=23,
        titulo="LISTA DE MATERIALES (1 PAT DE NEUTRO)")
h.rotulo(880, h.H - 150, 760, "AP-TC-004", "PUESTA A TIERRA", "DE LA RED AEREA", "SISTEMA DE PAT COMPLETO - NEUTRO CADA 200 m", "1:75 / 1:40", "A-A 1:10 · D1 S/E", fecha="07/11/2026", proyecto="ALUMBRADO DE BARRIOS")
h.guardar("ap_tc_004.svg"); print("ok")
