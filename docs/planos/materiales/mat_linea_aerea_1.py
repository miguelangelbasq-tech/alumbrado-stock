import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *

h = HojaMat()
COD = [1501, 1504]
h.check_codigos(COD)
DE, DC = 9.5, 5.8      # ficha: Ø ext ≈ 9,5 · Ø conductor ≈ 5,8 · Al 7 alambres

# ============ VISTA LATERAL
h.titulo(40, 62, "VISTA LATERAL - PUNTA PELADA", "PILOTO Al-Al 1 x 25 XLPE (1501) · ESC. 5:1 · PELADO ILUSTRATIVO")
k = 6.0; x0, yc = 70, 200
h.path(f"M{x0},{yc-DE/2*k} H{x0+50*k} V{yc+DE/2*k} H{x0}", "#fff", K, 1.4)
h.path(f"M{x0},{yc-DE/2*k} q-7,{DE/4*k} 0,{DE/2*k} t0,{DE/2*k}", "none", K, .9)
h.ln(x0 + 4, yc - DC / 2 * k, x0 + 50 * k, yc - DC / 2 * k, K, .5, h.OCULTA); h.ln(x0 + 4, yc + DC / 2 * k, x0 + 50 * k, yc + DC / 2 * k, K, .5, h.OCULTA)
h.rect(x0 + 50 * k, yc - DC / 2 * k, 15 * k, DC * k, "#fff", K, 1)
for q in range(1, 9): xx = x0 + 50 * k + q * 15 * k / 9; h.ln(xx - 6, yc + DC / 2 * k, xx + 6, yc - DC / 2 * k, K, .6)
h.ln(x0 - 12, yc, x0 + 68 * k, yc, K, .5, h.EJE)
h.dimV(x0 - 18, yc - DE / 2 * k, yc + DE / 2 * k, "Ø9,5", ext=x0 - 2)
h.dimV(x0 + 65 * k + 22, yc - DC / 2 * k, yc + DC / 2 * k, "Ø5,8", ext=x0 + 65 * k + 2)
xs = x0 + 25 * k; h.ln(xs, yc - DE / 2 * k - 10, xs, yc + DE / 2 * k + 10, K, .6, h.EJE)
h.txt(xs - 6, yc - DE / 2 * k - 16, "A", 12, 700, K, "end"); h.txt(xs - 6, yc + DE / 2 * k + 26, "A", 12, 700, K, "end")
h.globo("1", x0 + 38 * k, yc - DE / 2 * k, x0 + 38 * k, 118); h.globo("2", x0 + 58 * k, yc - 6, x0 + 58 * k, 118)

# ============ CORTE A-A
h.titulo(560, 62, "CORTE A-A", "ESC. 10:1 · COTAS EN mm")
kc = 12.0; cx, cy = 660, 205
h.circ(cx, cy, DE / 2 * kc, "#fff", K, 1.2)
h.cobre2d(cx, cy, DC / 2 * kc, False, 7)
h.dimH(cy + DE / 2 * kc + 22, cx - DE / 2 * kc, cx + DE / 2 * kc, "Ø ≈ 9,5", ext=cy)
h.dimH(cy - DE / 2 * kc - 14, cx - DC / 2 * kc, cx + DC / 2 * kc, "Ø ≈ 5,8", ext=cy - DC / 2 * kc)
h.globo("1", cx + 48, cy + 26, 800, 250); h.globo("2", cx + 10, cy + 8, 800, 280)
h.txt(740, 160, "7 ALAMBRES", 10.5, 700); h.txt(740, 176, "DE ALUMINIO", 10.5, 700)

# ============ D1 color
h.titulo(40, 350, "DETALLE D1 - A COLOR", "S/E · XLPE NEGRA APTA INTEMPERIE · Al 7 ALAMBRES")
h.circ(130, 460, 70, "#202226", K, 1.2); h.cobre2d(130, 460, 70 * DC / DE, True, 7, al=True)
h.circ(130, 460, 79, "none", K, .7, 'stroke-dasharray="4 3"')
h.circ(300, 460, 34, "#202226", K, 1); h.cobre2d(300, 460, 18, True, 7)
h.txt(130, 556, "1501 · Al-Al 1 x 25", 10.5, 700, K, "middle"); h.txt(300, 556, "1504 · Cu 1 x 4 (*)", 10.5, 700, OR, "middle")

# ============ D2 en el poste
h.titulo(430, 350, "D2 - DONDE VA (ESQUEMA)", "S/E · INDEPENDIENTE, EN LA PARTE ALTA DEL POSTE (ET-1005)")
px = 600; yb = 590
h.rect(px - 9, 400, 18, yb - 400, "#fff", K, 1.2); h.ln(430, yb, 840, yb, K, 1.4)
h.path(f"M440,410 Q520,420 {px-9},414", "none", K, 2.4); h.path(f"M{px+9},414 Q680,420 820,410", "none", K, 2.4)
h.txt(445, 404, "PILOTO 1 x 25", 10.5, 700)
h.path(f"M440,455 Q520,470 {px-9},462", "none", K, 4); h.path(f"M{px+9},462 Q680,470 820,455", "none", K, 4)
h.txt(445, 450, "PREENSAMBLADO DE LA RED", 10, 400, G)
h.circ(px + 26, 417, 5, "#fff", K, 1); h.txt(px + 36, 400, "MORSETO 1995/4", 10, 700)
h.path(f"M{px+26},422 C{px+30},470 {px+60},480 {px+80},500", "none", K, 1, h.OCULTA); h.txt(px + 84, 506, "A LA LUMINARIA", 10)
h.dimH(yb + 18, 440, 820, "VANO MAXIMO 40 m (ET-1005)", ext=yb - 140, dy=14)

# ============ tabla
y = h.codigos(40, 640, COD, (52, 0, 40), extra_col=("ITEM LP 21478 · DATO", {1501: "7.09 · Ø≈9,5 · 712 daN · 136 A", 1504: "7.16 · —"}, 240), wtot=800, rowh=20)
h.notasM(40, 740, [
    "COTAS EN mm. Ø 9,5 / 5,8, 7 ALAMBRES, 712 daN Y 136 A: FICHA DE LA APP (ET-1005 / IRAM 63002).",
    "(*) 1504 (Cu 1 x 4 XLPE, ITEM 7.16): MISMO TIPO DE AISLACION EN COBRE; SUS MEDIDAS NO ESTAN EN LA FICHA. A CONFIRMAR CON EL FABRICANTE.",
    "(*) EL ESQUEMA D2 ES DE UBICACION; ALTURAS Y SEPARACIONES SEGUN PLANOS AP-TC-055 (FALTAN EN LA APP).",
    "FUENTE: LP 21478 ANEXO I (7.09 / 7.16); EPEC ET-1005; IRAM 63002.",
], 790)

# ============ 3D
h.titulo(890, 62, "VISTA 3D - PILOTO Al-Al 1 x 25 XLPE", "PUNTA PELADA · 7 ALAMBRES DE ALUMINIO")
h.iso(10.5, 1040, 230)
h.cil("x", 0, 34, 0, 0, DE / 2, "#202226", tapa="#3a3d42", borde="#000", bw=.6)
x, y = h.P(4, 0, DE / 2); h.a(f'<text transform="matrix(.866 .5 0 1 {x:.1f} {y+3:.1f})" font-size="11" font-weight="700" fill="#9aa0a6" {INT}>Al-Al 1x25 XLPE · IRAM 63002</text>')
h.cil("x", 34, 48, 0, 0, DC / 2, C_AL, metal=True, borde="#555", bw=.4)
h.helice("x", 34, 48, 0, 0, DC / 2, 6, DC * 3.5, "#6b7177", .6)
h.cuerda_tapa("x", 48, 0, 0, DC / 2, 7, col="#e3e6e9", st="#555")
h.g3b("1", (22, 0, DE / 2), 1440, 170, "AISLACION XLPE NEGRA")
h.g3b("2", (44, 0, DC / 2), 1440, 240, "Al 25 mm² - 7 ALAMBRES")

h.bloque(890, 640, "DATOS TECNICOS (1501)", [
    "NORMA: IRAM 63002 · EPEC ET-1005",
    "CONDUCTOR: ALUMINIO, 7 ALAMBRES, 25 mm²",
    "Ø EXTERIOR ≈ 9,5 mm · Ø CONDUCTOR ≈ 5,8 mm",
    "CARGA DE ROTURA ≈ 712 daN",
    "CORRIENTE ADMISIBLE ≈ 136 A",
    "UNIDAD DE COMPRA: METRO",
], 360)
h.bloque(1270, 640, "DONDE SE USA", [
    "PILOTO DE ALUMBRADO DE BARRIO: INDEPENDIENTE, EN LA PARTE ALTA DEL POSTE (ITEM 7.09)",
    "DE EL SE TOMA LA FASE DE CADA LUMINARIA CON EL MORSETO 1995/4",
    "SE TIENDE CON LA MORSETERIA DE LINEA AEREA · GUIA «TENDIDO AEREO BARRIO»",
    "1504 Cu 1 x 4: BAJADAS CORTAS (ITEM 7.16)",
], 370)
h.rotuloM("MAT-LINEA_AEREA-1", "PILOTO Al-Al 1 x 25 mm² XLPE", "Y Cu 1 x 4 XLPE (IRAM 63002)", "VISTA LATERAL, CORTE A-A, DETALLES Y VISTA 3D", "5:1 / 10:1", "D1, D2, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_linea_aerea_1.svg"))
print("ok")
