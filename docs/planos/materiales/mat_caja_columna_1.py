"""MAT-CAJA_COLUMNA-1 (rev. C) · rev. C (grupo «nobra»): alta del equipo 6024 caja 200 × 200 × 100 (VARIANTE + 3D r3d/out/nobra_caja6024.png).
 · Caja estanca de aluminio inyectado 200 × 150 × 100 IP65 (6003) y caja de conexión con señal (6002).
Plano con CAJA_AL de r3d/piezas/perfiles_protab.mjs; 3D: r3d/out/protab_cc1.png (caja en la columna, tapa sacada, tablerito adentro).
Datos: FICHAS_TEC.caja_columna pieza 1 (Conextube; tapa con junta, tornillos imperdibles, prensacable), AP-PL-003 (externa en columna existente, a 2,50 m,
2 juegos de abrazaderas = Ø de la columna; ítem 14.1), AP-PL-002 (riel 14 cm + 2 tornillos 6 × 3/8, ojal Ø50, prensacable 3/4" BSC o 1/2" BSP — ZA3 / ZA11, cable 6–12 mm), AP-CC-010 / 014."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from protabkit import *
from nobrakit import catN, colorN

C = PT["CAJA_AL"]; W, H, P, tp, e = C["W"], C["H"], C["P"], C["tapa"], C["pared"]; off = C["tornillos"]["off"]
h = nueva3()

# =============== FRENTE SIN TAPA ===============
s = 1.3; X0, Y0 = 70, 132
X = lambda x: X0 + (x + W / 2) * s; Z = lambda z: Y0 + (H - z) * s
h.titulo(40, 62, "FRENTE SIN TAPA", "ESC. 1:0,77 (1,3:1) · TABLERITO AP-CC-014 ADENTRO")
h.rect(X(-W / 2), Z(H), W * s, H * s, "url(#ALU)", K, 1.6, f'rx="{C["radio"]*s}"'); h.rect(X(-W / 2 + e), Z(H - e), (W - 2 * e) * s, (H - 2 * e) * s, "#fff", K, .8, f'rx="{(C["radio"]-e)*s}"')
for sx in (-1, 1):
    for z in (off, H - off): h.circ(X(sx * (W / 2 - off)), Z(z), 6.5 * s, "url(#ALU)", K, .8); h.circ(X(sx * (W / 2 - off)), Z(z), 2.1 * s, "#fff", K, .6)
h.rect(X(-70), Z(125), 140 * s, 100 * s, "url(#MET)", K, .8)
h.rect(X(-66), Z(75 + 17.5), 132 * s, 35 * s, "#fff", K, .7)
for x in (-2, 16): h.rect(X(x), Z(75 + 39.75), 17.5 * s, 79.5 * s, "#fff", K, .8); h.rect(X(x + 1.5), Z(75 + 22.5), 14.5 * s, 45 * s, "url(#PLAS2)", K, .6)
for i in range(4): h.rect(X(-60 + i * 8.2), Z(75 + 26.5), 8.2 * s, 53 * s, "#fff", K, .7); [h.circ(X(-60 + i * 8.2 + 4.1), Z(75 + 26.5 - yy), 2.6 * s, "#fff", K, .5) for yy in (10, 43)]
h.circ(X(50), Z(50), 6.5 * s, "url(#MET)", K, .8)
h.dimH(Z(H) - 14, X(-W / 2), X(W / 2), "200", ext=Z(H) - 2); h.dimV(X(-W / 2) - 16, Z(H), Z(0), "150", ext=X(-W / 2) - 2)
h.dimH(Z(0) + 16, X(-66), X(66), "RIEL 132 (AP-PL-002: 140 (*))", ext=Z(75 - 17.5), c=OR)
lineaCorte(h, X(-30), Z(H) - 30, X(-30), Z(0) + 30, "A")
for n, (x, z), (gx, gy) in [("1", (-W / 2 + 2, 120), (46, Z(130))), ("2", (W / 2 - off, H - off), (X(W / 2) + 26, Z(H) - 8)), ("4", (-50, 75), (46, Z(40))),
                            ("5", (7, 75), (X(W / 2) + 26, Z(100))), ("6", (50, 50), (X(W / 2) + 26, Z(50))), ("7", (-66, 95), (46, Z(95)))]:
    h.globo(n, X(x), Z(z), gx, gy, r=9)

# =============== CORTE A-A ===============
ec = 1.3; vc = Vista(h, 470, 318, ec)
h.titulo(440, 62, "CORTE A-A", "ESC. 1,3:1 · TAPA CON JUNTA Y PRENSACABLE")
vc.poly([[0, 0], [P - tp, 0], [P - tp, e], [e, e], [e, H - e], [P - tp, H - e], [P - tp, H], [0, H]], "url(#ALU)", 1.3)
vc.rect(P - tp, P, 0, H, "url(#ALU)", 1.3); vc.rect(P - tp - 5, P - tp, e + 1, e + 6, "url(#ALU)", .6); vc.rect(P - tp - 5, P - tp, H - e - 6, H - e - 1, "url(#ALU)", .6)
vc.rect(P - tp - 6.4, P - tp - 4.9, e + 1.6, e + 1.6 + C["junta"], "url(#GOMA)", .4); vc.rect(P - tp - 6.4, P - tp - 4.9, H - e - 1.6 - C["junta"], H - e - 1.6, "url(#GOMA)", .4)
vc.rect(10, 12, 25, 125, "url(#MET)", .7)
vc.rect(19.5, 19.5 + 61 - 19.5 + 7.5, 75 - 39.75, 75 + 39.75, "#fff", .8)
vc.rect(30, 30 + 26, -30, 0, "#fff", .8); vc.rect(36, 50, -60, -30, "#fff", .6); vc.rect(38, 48, -100, -60, "#fff", .5)
vc.rect(37, 49, 0, 22, "#fff", .5, h.OCULTA)
vc.cotaH(0, P, -112, "100", zext=-2); vc.cotaH(P - tp, P, H + 14, "14 (*)", zext=H, c=OR)
for n, (y, z), (gx, gy) in [("3", (P - 5.6, 30), (720, 160)), ("8", (43, -25), (720, 420)), ("9", (P - tp - 5.6, 140), (720, 120)), ("4", (11, 100), (720, 250))]:
    h.globo(n, *vc.p(y, z), gx, gy, r=9)
h.llamadaDet(*vc.p(P - 8, H - 10), 20, "D1")

# =============== D1 · JUNTA Y TORNILLO ===============
DX, DY = 740, 62
h.titulo(DX, DY, "D1 - CIERRE", "ESC. 4:1 (*)")
k = 4.0; vj = Vista(h, DX - (P - 30) * k + 6, DY + 30 + (H + 2) * k, k)
h.a(f'<clipPath id="cpCC"><rect x="{DX}" y="{DY + 30}" width="110" height="130"/></clipPath>'); h.rect(DX, DY + 30, 110, 130, "none", K, .5)
h.a('<g clip-path="url(#cpCC)">')
vj.poly([[0, H - e], [P - tp, H - e], [P - tp, H], [0, H]], "url(#ALU)", 1.1); vj.rect(P - tp, P, H - 40, H, "url(#ALU)", 1.1)
vj.rect(P - tp - 5, P - tp, H - e - 6, H - e - 1, "url(#ALU)", .7); vj.rect(P - tp - 6.4, P - tp - 4.9, H - e - 1.6 - C["junta"], H - e - 1.6, "url(#GOMA)", .5)
vj.rect(P - tp - 30, P - tp, H - off - 6.5, H - off + 6.5, "url(#ALU)", .8)
tornilloH(vj, P + 1.2, H - off, {"M": 5, "dk": 9, "k": 3.5, "L": 16})
h.a('</g>')
h.txt(DX, DY + 176, "TORNILLO IMPERDIBLE M5 (*)", 8.5, 400, OR); h.txt(DX, DY + 189, "JUNTA EN LA TAPA (*)", 8.5, 400, OR)

# =============== INSTALACION ===============
IX, IY = 40, 470
h.titulo(IX, IY, "INSTALACION (AP-PL-003)", "S/E · EN COLUMNA EXISTENTE")
kk = .06; x0, yb = IX + 70, IY + 250
h.ln(IX + 10, yb, IX + 250, yb, K, 1.6); h.rect(IX + 10, yb, 240, 8, "url(#EARTH)", K, 0)
h.rect(x0 - 8, yb - 3300 * kk, 16, 3300 * kk, "url(#MET)", K, 1.1)
bz = yb - 2500 * kk; h.rect(x0 + 8, bz - 150 * kk * 2.2, 100 * kk * 2.2, 150 * kk * 2.2, "url(#ALU)", K, 1.1)
for dy in (20 * kk * 2.2, 130 * kk * 2.2): h.rect(x0 - 10, bz - dy - 2, 20 + 100 * kk * 2.2, 4, "url(#MET)", K, .5)
h.dimV(x0 - 26, yb, bz, "2500", ext=x0 - 10); h.nivel(IX + 200, yb, "±0,00")
h.txt(x0 + 34, bz - 12, "CAJA 200 x 150 x 100", 9.5, 700); h.txt(x0 + 34, bz + 2, "2 JUEGOS DE ABRAZADERAS", 9.5, 400); h.txt(x0 + 34, bz + 16, "MEDIDA = Ø DE LA COLUMNA", 9.5, 400)

# =============== D2 · SEÑAL 6002 ===============
SX, SY = 560, 600
h.titulo(SX, SY, "D2 - SEÑAL (6002)", "S/E · MEDIDAS (*)")
cx, cy = SX + 70, SY + 100
h.path(f"M{cx},{cy - 50} L{cx + 54},{cy + 40} L{cx - 54},{cy + 40} Z", "#f2c418", K, 2.2)
h.path(f"M{cx + 6},{cy - 22} L{cx - 10},{cy + 6} L{cx + 2},{cy + 6} L{cx - 8},{cy + 30} L{cx + 14},{cy - 2} L{cx + 2},{cy - 2} L{cx + 12},{cy - 22} Z", K, K, .8)
h.txt(cx, cy + 58, "RIESGO ELECTRICO", 9.5, 700, K, "middle")

# =============== TABLAS ===============
dd = {"6003": "200 x 150 x 100 · IP65", "6002": "MEDIDAS (*)", "6024": "200 x 200 x 100 · IP (*)"}
yt = h.tabla(40, 780, [(52, "c", True), (520, "l", False), (40, "c", False), (188, "l", False)],
             [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "MEDIDAS (FICHA)"]] + [cat(c, 74) + [dd[str(c)]] for c in (6003, 6002)] + [[r_[0], "▪ " + r_[1], r_[2], dd["6024"]] for r_ in [catN(6024, 72)]], rowh=16, titulo="CODIGOS DEL PAÑOL (3 · ▪ ALTA DEL EQUIPO)", colores=colorN)
ydat = bloque(h, 890, 690, "DATOS TECNICOS", [
    "ALUMINIO INYECTADO · IP65 · TAPA CON JUNTA · 4 TORNILLOS.",
    "6003: 200 x 150 x 100 · 6024: 200 x 200 x 100 (AP-PL-003).",
    "PRENSACABLE 3/4\" BSC o 1/2\" BSP · CABLE 6-12 (AP-PL-002).",
    "ADENTRO: TABLERITO AP-CC-014 (RIEL, BPN, FUSIBLES, PAT)."], w=370, sz=9.5, lh=12.5)
yu = bloque(h, 1280, 690, "DONDE SE USA", [
    "AP-PL-003 / ITEM 14.1: CAJA EXTERNA PARA COLUMNA EXISTENTE, A 2,50 m. ITEMIZADO 2026: ITEM 42.",
    "AP-CC-010 (BARRIO): TABLERO DE COLUMNA EXTERNO (PLANO OFICIAL PENDIENTE).",
    "GUIA «CAJA DE COLUMNA PRFV»: COLUMNAS SIN CAJA INCORPORADA."], w=370, sz=9.5, lh=12.5)
rayadosRef(h, 40, 1050, ["ALU", "MET", "GOMA", "PLAS2"], cols=4, dx=185)
notasW(h, 40, yt + 22, [
    "COTAS EN mm: 200 x 150 x 100 (CONEXTUBE, FICHA DE LA APP Y AP-PL-003).",
    "(*) PARED 4, TAPA 14, JUNTA, COLUMNAS DE ESQUINA, TORNILLOS M5 Y PRENSACABLE: PROPORCIONALES, A CONFIRMAR CON EL FABRICANTE.",
    "(*) RIEL: AP-PL-002 DICE 14 cm; ADENTRO DE ESTA CAJA ENTRA UNO DE 132 (DIBUJO).",
    "(*) 6002 (CAJA CON SEÑAL «RIESGO ELECTRICO»): SIN MEDIDAS NI MATERIAL EN LA FICHA.",
    "REV. C: 6024 «CAJA ESTANCA ALUMINIO INYECTADO 200 X 200 X 100 P/ COLUMNA» (ALTA DEL EQUIPO). LA DESCRIPCION NO DICE IP: SE DIBUJA IGUAL A LA 6003 (PARED, TAPA, JUNTA, TORNILLOS Y PRENSACABLE) CON 50 mm MAS DE ALTO. (*) IP, MARCA Y RIEL QUE ENTRA (≈ 132 ANCHO; CABEN 2 FILAS): A CONFIRMAR CON LA CAJA."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - CAJA EN LA COLUMNA EXISTENTE", "TAPA SACADA (SE VE LA JUNTA) · TABLERITO AP-CC-014 · 2 ABRAZADERAS · PRENSACABLE")
A = img3d(h, "protab_cc1", 892, 92, 590)
columna(h, A, [("columna", "", "COLUMNA EXISTENTE"), ("abraz", "", "ABRAZADERA (2 JUEGOS)"), ("caja", "1", "CAJA IP65 (6003)"), ("rosca", "2", "COLUMNA CON ROSCA"),
               ("tablerito", "4", "TABLERITO (CHAPA)"), ("bpn", "7", "BORNES BPN 6"), ("tabaquera", "5", "TABAQUERAS 10x38"), ("pat", "6", "BULON DE PAT"),
               ("tapa", "3", "TAPA"), ("junta", "9", "JUNTA DE GOMA"), ("tornillo", "", "TORNILLO IMPERDIBLE"), ("prensa", "8", "PRENSACABLE"), ("cable", "", "CABLE 6-12 mm")],
        1490, 96, 600, paso=32)
# =============== REV. C · VARIANTE 6024 200 x 200 x 100 ===============
h.titulo(890, 818, "VARIANTE 6024 - 200 x 200 x 100", "FRENTE CON TAPA · ESC. 1:1,5")
s2 = .64; Hv = 200; X2 = lambda x: 935 + (x + W / 2) * s2; Z2 = lambda z: 872 + (Hv - z) * s2
h.rect(X2(-W / 2), Z2(Hv), W * s2, Hv * s2, "url(#ALU)", K, 1.4, f'rx="{C["radio"]*s2}"'); h.rect(X2(-W / 2 + e + 2), Z2(Hv - e - 2), (W - 2 * e - 4) * s2, (Hv - 2 * e - 4) * s2, "#fff", K, .6, f'rx="{(C["radio"]-e)*s2}"')
for sx in (-1, 1):
    for z in (off, Hv - off): h.circ(X2(sx * (W / 2 - off)), Z2(z), 4.5 * s2, "#fff", K, .7); h.ln(X2(sx * (W / 2 - off)) - 2, Z2(z), X2(sx * (W / 2 - off)) + 2, Z2(z), K, .5)
h.rect(X2(-30) - 8, Z2(0), 16, 12, "#fff", K, .7); h.txt(X2(0), Z2(Hv / 2), "TAPA IP (*)", 8.5, 400, OR, "middle")
h.rect(X2(-W / 2), Z2(150), W * s2, 150 * s2, "none", NV, .6, 'stroke-dasharray="5 3"'); h.txt(X2(W / 2) - 4, Z2(150) - 4, "6003 (150)", 8.5, 700, NV, "end")
h.dimH(Z2(Hv) - 10, X2(-W / 2), X2(W / 2), "200", ext=Z2(Hv) - 2); h.dimV(X2(-W / 2) - 12, Z2(Hv), Z2(0), "200", ext=X2(-W / 2) - 2)
h.dimV(X2(W / 2) + 14, Z2(Hv), Z2(0), "", ext=X2(W / 2) + 2); h.txt(X2(W / 2) + 20, Z2(Hv / 2) + 4, "FONDO 100", 9, 400)
A6 = img3d(h, "nobra_caja6024", 1180, 830, 300)
columna(h, A6, [("c6024", "", "6024 · 200 x 200"), ("c6003", "", "6003 · 200 x 150"), ("tornillo", "", "4 TORNILLOS"), ("prensa", "8", "PRENSACABLE")], 1500, 845, 1010, paso=22)
rotuloMat(h, "MAT-CAJA_COLUMNA-1", "CAJA ESTANCA ALUMINIO", "200 x 150 / 200 x 200 x 100", "FRENTE, CORTE, D1, D2, VARIANTE 6024 Y 3D", "1,3:1", "D1 4:1 · 3D S/E", rev="C", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_caja_columna_1.svg"))
