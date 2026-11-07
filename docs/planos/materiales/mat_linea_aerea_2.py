import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *

h = HojaMat()
COD = [1502, 1503, 1015, 1016]
h.check_codigos(COD)
# proporciones esquemáticas (*): fase 25 r=1, neutro 16 r=.82 (relación de raíz de secciones), conductor = raíz(4S/pi)
RF = 32 / (2 * (1 / math.sin(math.pi / 4) + 1)); RN = RF * math.sqrt(16 / 25)   # mm: el haz 3x25+1x16 da Ø ≈ 32 (ficha)

def corte(cx, cy, s, formacion, color):
    if formacion == "2x16":
        r = RN * s; cores = [(-r, 0, r, "F"), (r, 0, r, "N")]
    else:
        d = RF * s / math.sin(math.pi / 4); cores = []
        for i, a in enumerate((135, 45, 315, 225)):
            rr = (RN if i == 3 else RF) * s; dd = d - (RF - RN) * s * (1 if i == 3 else 0)
            cores.append((dd * math.cos(math.radians(a)), -dd * math.sin(math.radians(a)), rr, "N" if i == 3 else "F%d" % (i + 1)))
    for x, y, r, t in cores:
        h.circ(cx + x, cy + y, r, "#202226" if color else "#fff", K, 1.1)
        h.cobre2d(cx + x, cy + y, r * .62, color, 7, al=True)
        h.txt(cx + x + r * .55, cy + y - r * .6, t, 10, 700, "#fff" if color else K, "middle")
    return cores

# ============ CORTES
h.titulo(40, 62, "CORTE A-A · 3 x 25 + 1 x 16 (1503)", "ESC. 4:1 · PROPORCIONES DE LOS CONDUCTORES ESQUEMATICAS (*)")
s = 4.0; cx, cy = 180, 215
corte(cx, cy, s, "3", False)
Rh = (RF / math.sin(math.pi / 4) + RF) * s
h.circ(cx, cy, Rh, "none", G, .6, 'stroke-dasharray="4 3"')
h.dimH(cy + Rh + 22, cx - Rh, cx + Rh, "Ø HAZ ≈ 32 (FICHA, ORIENTATIVO)", ext=cy)
h.titulo(470, 62, "CORTE B-B · 2 x 16 (1502)", "ESC. 4:1 · ESQUEMATICO (*)")
corte(600, 215, s, "2x16", False)
h.dimH(215 + RN * s + 22, 600 - 2 * RN * s, 600 + 2 * RN * s, "Ø HAZ (*)", ext=215, c=OR)
h.globo("1", cx + 4, cy - Rh * .5, 380, 140); h.globo("2", cx - Rh * .38, cy - Rh * .3, 380, 170)

# ============ D1 color
h.titulo(40, 380, "DETALLE D1 - A COLOR", "S/E · XLPE NEGRA, ALUMINIO EN CUERDA (7 ALAMBRES (*))")
corte(170, 530, 5.0, "3", True)
corte(440, 530, 5.0, "2x16", True)
h.txt(170, 620, "3 x 25 + 1 x 16 (1503)", 10.5, 700, K, "middle"); h.txt(440, 620, "2 x 16 (1502)", 10.5, 700, K, "middle")
h.parrafo(560, 460, "LOS CONDUCTORES SE IDENTIFICAN F1-F2-F3-N (EN LA APP); EL NEUTRO ES EL DE MENOR SECCION. (*) MARCA EXACTA (NUMEROS O NERVIOS) SEGUN FABRICANTE.", 270, 10, OR)

# ============ VISTA LATERAL
h.titulo(40, 640, "VISTA LATERAL DEL HAZ 3 x 25 + 1 x 16", "S/E · CUATRO CONDUCTORES RETORCIDOS ENTRE SI, SIN PORTANTE")
dd = RF / math.sin(math.pi / 4)
dd = RF / math.sin(math.pi / 4)
cores = [("#222", RF, .6 * RF, dd, math.radians(a)) for a in (135, 45, 315)] + [("#222", RN, .6 * RN, dd - (RF - RN), math.radians(225))]
haz_lateral(h, 60, 715, 2.4, 320, 240, cores)
h.dimH(770, 60, 60 + 240 * 2.4, "PASO DE CABLEADO (*)", ext=745, c=OR)

# ============ tabla
y = h.codigos(40, 810, COD, (52, 0, 40), extra_col=("ITEM LP 21478", {1502: "7.10", 1015: "7.11", 1503: "7.15", 1016: "—"}, 110), wtot=800, rowh=20)
h.notasM(40, 950, [
    "SOLO EL Ø DEL HAZ 3 x 25 + 1 x 16 (≈ 32) ESTA EN LA FICHA, Y ES ORIENTATIVO: VERIFICAR EN LA FICHA DEL FABRICANTE ANTES DE ELEGIR GRAMPA.",
    "(*) Ø DE CADA CONDUCTOR, ESPESOR DE AISLACION, PASO DE CABLEADO Y Ø DEL 2 x 16: A CONFIRMAR CON EL FABRICANTE.",
    "1016 (3 x 1 x 25/50, CON NEUTRO PORTANTE) TIENE SU HOJA: MAT-CABLE_ACOMETIDA-1.",
    "FUENTE: LP 21478 ANEXO I (7.10 / 7.11 / 7.15); EPEC ET-1005; IRAM 2263.",
], 790)

# ============ 3D
h.titulo(890, 62, "VISTA 3D - PREENSAMBLADO 3 x 25 + 1 x 16", "HAZ RETORCIDO · PUNTAS PELADAS EN ESCALONES")
h.iso(4.2, 990, 190)
c3 = [(C_VAINA, RF, .6 * RF, dd, math.radians(a)) for a in (135, 45, 315)] + [("#3a3d42", RN, .6 * RN, dd - (RF - RN), math.radians(225))]
o = haz3d(h, c3, 130, 200, u_fin=[104, 114, 124, 96], L_cu=14, hilos=7, al=True)
fin = o["fin"]
h.g3b("1", (40, 0, dd + RF * .7), 1440, 170, "FASE Al 25 XLPE")
h.g3b("2", (fin[0][0] + 10, fin[0][1], fin[0][2] + .6 * RF), 1440, 240, "Al EN CUERDA")
h.g3b("3", (fin[3][0] - 4, fin[3][1], fin[3][2] + RN), 1440, 310, "NEUTRO Al 16")
h.txt(890, 640, "Proporciones, paso y largos de pelado ilustrativos (*); el Ø del haz manda en el corte A-A.", 11, 400, OR, "start", INT)
h.bloque(890, 700, "DATOS TECNICOS", [
    "NORMA: IRAM 2263 · EPEC ET-1005",
    "CONDUCTORES DE ALUMINIO AISLADOS EN XLPE, RETORCIDOS EN HAZ",
    "2 x 16: RED MONOFASICA DE ALUMBRADO",
    "3 x 25 + 1 x 16: RED TRIFASICA · HAZ Ø ≈ 32",
    "UNIDAD DE COMPRA: METRO",
], 360)
h.bloque(1270, 700, "DONDE SE USA", [
    "RED AEREA DE ALUMBRADO DE BARRIO · GUIA «TENDIDO AEREO BARRIO»",
    "SE SUJETA POR EL HAZ CON GRAMPAS Y MENSULAS (FAMILIA «MORSETERIA DE LINEA AEREA»)",
    "VANO MAXIMO 40 m (ET-1005)",
], 370)
h.rotuloM("MAT-LINEA_AEREA-2", "PREENSAMBLADO Al 2 x 16 Y", "Al-Al 3 x 25 + 1 x 16 (IRAM 2263)", "CORTES, DETALLE, VISTA LATERAL Y VISTA 3D", "4:1", "D1, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_linea_aerea_2.svg"))
print("ok")
