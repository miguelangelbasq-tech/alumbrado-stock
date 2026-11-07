"""AP-CC-016 (hoja C) · Tablerito para columna metálica de pie Ø178: los 4 esquemas (proyectada / existente × TN-S / TT).
Datos: ficha AP-CC-016, AP-T-007/008, AP-TC-005; calculadora v130 (bpnMetDef, texto «AP-CC-016-C alternativa TT — bases N·R·R·R»,
«alternativa TN-S — bases R·R·S·T»); REVISION B.10 (¿qué columna es Ø178?)."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
import tabmet as T
from cc_hoja import tres_d
h = Hoja(); D = 178
# ===== 4 esquemas
for (X, Y, esq, ex, sub) in [(40, 62, "TN-S", False, "INSTALACION PROYECTADA · CADA ARTEF. A SU FASE"),
                             (450, 62, "TT", False, "INSTALACION PROYECTADA · 1 FASE + N SECCIONABLE"),
                             (40, 312, "TN-S", True, "PAT POR BLOQUETE + BANDERITA (*)"),
                             (450, 312, "TT", True, "PAT POR BLOQUETE + BANDERITA (*)")]:
    T.multifilar(h, X, Y, esq, 3, existente=ex, sub=sub)
h.ln(445, 50, 445, 560, K, .4, 'stroke-dasharray="2 3"'); h.ln(36, 300, 850, 300, K, .4, 'stroke-dasharray="2 3"')
h.ln(36, 560, 850, 560, K, .4, 'stroke-dasharray="2 3"')
# ===== frente TT
L = T.armado(3, "TT")
h.titulo(40, 592, "D1 - TABLERITO TT: FRENTE", "ESC. 1:2 - BASES N · R · R · R")
k = 1.15; X, Y = 110, 650
pos = T.frente(h, X, Y, k, L)
W, H = T.PL_W * k, T.PL_H * k
h.dimH(Y - 14, X, X + W, "95", ext=Y - 2); h.dimV(X - 18, Y, Y + H, "230", ext=X - 2)
ry = pos["riel"][1]; h.dimV(X + W + 18, ry, ry + T.RIEL_L * k, "RIEL 140", ext=pos["cx"] + 20)
tot = T.largo(L); y0 = ry + (T.RIEL_L - tot) / 2 * k
h.dimV(X + W + 42, y0, y0 + tot * k, f"{T.f(tot,1)} (*)", ext=pos["cx"] + 26, c=OR)
for n, tp, i, gx in (("3", "pf", 0, 290), ("6", "gris", 0, 290), ("7", "cel", 1, 290), ("8", "ver", 1, 290), ("11", "bulon", 0, 290)):
    a = pos[tp][i] if tp != "bulon" else pos["bulon"]
    h.globo(n, a[0] + 10, a[1], 300, {"3": 662, "6": 718, "7": 760, "8": 800, "11": 880}[n])
h.txt(X + W / 2, Y + H + 24, "EL ARMADO TT PASA LOS 140 DEL RIEL (*)", 9, 400, OR, "middle")
# ===== corte A-A Ø178 (planta)
h.titulo(350, 592, "CORTE A-A", "ESC. 1:4 - PLANTA, Ø178")
k2 = .78; cx2, cy2 = 430, 720; R = D / 2; RI = R - 4; VW = 80
av = math.degrees(math.asin(VW / 2 / R))
def arco(r, a0, a1): return [(cx2 + r * k2 * math.cos(math.radians(a)), cy2 + r * k2 * math.sin(math.radians(a))) for a in [a0 + (a1 - a0) * i / 60 for i in range(61)]]
h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in arco(R, 90 + av, 450 - av) + arco(RI, 450 - av, 90 + av)) + " Z", K, K, .8)
d = math.sqrt(RI ** 2 - (T.PL_W / 2) ** 2); yf = cy2 - d * k2
h.rect(cx2 - T.PL_W / 2 * k2, yf, T.PL_W * k2, 2.5, "url(#ANSI31)", K, .7)
h.rect(cx2 - T.PF_A / 2 * k2, yf + 2.5 + 6, T.PF_A * k2, T.PF_C * k2, "#fff", K, .8)
h.dimH(cy2 - R * k2 - 14, cx2 - R * k2, cx2 + R * k2, "Ø178", ext=cy2 - 4)
h.txt(cx2, cy2 + R * k2 + 22, f"LIBRE {T.f(RI + d,1)} ≥ 70,5", 9, 400, K, "middle")
h.txt(cx2, cy2 + R * k2 + 36, "VENTANA 80 (*)", 9, 400, OR, "middle")
# ===== cómputo
rows = [("PIEZA (TRIPLE)", "TN-S", "TT", "REGLA"),
        ("PORTAFUS. 10×38", "3", "4", "TT: +1 (EL N)"), ("FUSIBLE 2 A", "3", "3", "N SIN FUSIBLE"),
        ("BPN GRIS", "3", "2", "TT: ⌈(1+3)/2⌉"), ("BPN CELESTE", "3", "3", "1 POR ARTEFACTO"),
        ("BPN VERDE", "2", "2", "⌈(1+3)/2⌉"), ("TIRAS DE PEINE", "1", "2 + 1 (*)", "TT: N Y PE APARTE"),
        ("1×2,5 BPN→PF", "0,90 m", "0,90 m", "0,30 × 3 PF"), ("PAT EN LA CAJA", "BULON", "BULON", "EXIST.: BLOQUETE")]
h.tabla(520, 592, [(112, "l", False), (48, "c", True), (60, "c", True), (104, "l", False)], rows, rowh=19, titulo="COMPUTO POR CAJA")
h.notas(40, 985, [
 "COTAS EN mm. TN-S (AP-T-008): N Y PE SE UNEN EN UNA SOLA TIRA. TT (AP-T-007): TIERRA LOCAL, N Y PE EN TIRAS APARTE.",
 "TT: LOS 3 ARTEFACTOS DE LA COLUMNA VAN A UNA SOLA FASE Y SE REPARTEN LAS COLUMNAS ENTRE R, S Y T (AP-PL-002 b).",
 "(*) LA CALCULADORA CITA ESTE PLANO CON «TN-S: BASES R·R·S·T» (4 BASES) PERO COMPUTA 3: CONFIRMAR CON LA HOJA C.",
 "(*) PROYECTADA VS. EXISTENTE: SE DIBUJA LA PAT DE LA EXISTENTE CON BLOQUETE + BANDERITA (AP-TC-005 2/2). A CONFIRMAR.",
 "(*) PIE Ø178: EL AP-C-005 LLEGA HASTA Ø168. ¿QUE COLUMNA ES? ESPESOR 4, VENTANA Y FONDO 230×95 A CONFIRMAR.",
 "(*) PEINE DE LAS 2 GRISES EN TT (1 ENTRADA + 3 SALIDAS) Y LARGO DE RIEL: A CONFIRMAR."])
LISTA = [("POS.", "DESCRIPCION (TT, TRIPLE)", "CANT.", "CODIGO"),
 ("1", "FONDO DE TABLERO CHAPA GALVANIZADA P/ COLUMNA 230×95×2 (*)", "1 u", "3011"),
 ("2", "RIEL DIN NS35 (EL PAÑOL LO TIENE EN Un.)", "0,14 m", "2038"),
 ("3", "PORTAFUSIBLE TABAQUERA 10×38: N SECCIONABLE + 3 DE FASE R", "4 u", "3053"),
 ("4", "FUSIBLE 10×38 gG 2 A, UNO POR ARTEFACTO (EL N SIN FUSIBLE)", "3 u", "3017"),
 ("5", "TORNILLO CABEZA TANQUE 6×3/8 PARA EL RIEL", "2 u", "A VINCULAR"),
 ("6", "BORNE BPN 6 mm² GRIS (FASE R, ENTRA Y REPARTE)", "2 u", "2009"),
 ("7", "BORNE BPN 6 mm² CELESTE (NEUTRO)", "3 u", "2008"),
 ("8", "BORNE BPN 6 mm² VERDE (TIERRA)", "2 u", "2010"),
 ("9", "SEPARADOR BPN + PEINE 10 ELEM. (SE CORTA EN TIRAS)", "1 + 1", "2041·2027"),
 ("10", "TOPE / EXTREMO DE BORNERA (*)", "2 u (*)", "2021"),
 ("11", "BULON PAT (NUEVA) · BLOQUETE + BANDERITA (EXISTENTE)", "1 · 1+1", "CAJA·7003·7018"),
 ("12", "CABLE Cu 3×1,5 XLPE A CADA LUMINARIA", "S/ CALC.", "6001"),
 ("13", "CABLE TRONCAL (LLEGA Y SIGUE)", "2 subidas", "SEGUN CALCULO"),
 ("14", "CABLE 1×6 V/A BULON → BPN VERDE", "0,50 m", "A VINCULAR"),
 ("15", "CABLE 1×2,5 BPN GRIS → PORTAFUSIBLES", "0,90 m", "A VINCULAR"),
 ("16", "OJAL 6 + TIF 6 · TIF 2,5 (2 POR PF) · TIF 1,5 (SALIDAS)", "1+1·8·4", "2049·2032·2030·2028"),
 ("17", "ACRILICO DE PROTECCION CON CARTEL (ETG 16.1)", "1 u", "SIN CODIGO")]
c = dict(id="AP-CC-016", D=D, lista=LISTA, titLista="LISTA DE MATERIALES (1 CAJA, TT, 3 ARTEFACTOS)",
         tit3d="VISTA 3D - CAJA DE COLUMNA Ø178, ARMADO TT",
         glob3d={"pf": "PORTAFUS. N·R·R·R", "gris": "BPN GRIS R (2)"}, nota3d="PIE Ø178 (*) · VENTANA 80×250 (*)")
tres_d(h, c, D, L)
h.tabla(890, 608, [(40, "c", False), (440, "l", False), (90, "c", True), (180, "c", False)], LISTA, rowh=21,
        titulo=c["titLista"], colores=lambda i, j, t: OR if ("(*)" in t or t in ("A VINCULAR", "SIN CODIGO")) else K)
h.rotulo(890, h.H - 150, 750, "AP-CC-016", "TABLERO DE CONEXIONADO", "COLUMNA METALICA Ø178", "HOJA C - ESQUEMAS TN-S Y TT, PROYECTADA Y EXISTENTE", "1:2 · 1:4", "3D S/E", fecha="07/11/2026")
h.guardar("ap_cc_016.svg")
