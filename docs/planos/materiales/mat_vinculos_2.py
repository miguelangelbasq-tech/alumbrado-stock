"""MAT-VINCULOS-2 (rev. B) · Vínculo octogonal (6016) y medio vínculo octogonal (6013), AP-C-011.
Geometría: r3d/piezas/perfiles_col.mjs (VIN.oct) → perfiles_col.json; 3D: r3d/out/col_vin2.png.
Datos: FICHAS_TEC.vinculos (6016 / 6013 → AP-C-011), catálogo del pañol, hoja aprobada AP-C-011 (ítems 10.21 / 10.22, 4 y 2 artefactos, brazo
«s/plano»: la calculadora usa 0,40). La app NO tiene medidas de esta pieza y la web tampoco: todo es ESQUEMA (*)."""
from colkit import *

h = nueva3()
O, Cp, Br = VIN["oct"], VIN["cap"], VIN["brazo"]
AP, LB = O["ap"], O["brazo"]; Ro = AP / math.cos(math.radians(22.5))

def octo(cx, cy, q, medio=False):
    P = [(cx + Ro * q * math.cos(math.radians(22.5 + 45 * i)), cy - Ro * q * math.sin(math.radians(22.5 + 45 * i))) for i in range(9)]
    w = O["rayo"] / 2 * q * 1.6
    def barra(a, b, w_, fill="#fff"):
        dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1; nx, ny = -dy / L * w_, dx / L * w_
        poly(h, [(a[0] + nx, a[1] + ny), (b[0] + nx, b[1] + ny), (b[0] - nx, b[1] - ny), (a[0] - nx, a[1] - ny)], fill, .9)
    for i in range(8):
        if medio and (P[i][1] > cy + 1 or P[i + 1][1] > cy + 1): continue
        barra(P[i], P[i + 1], w)
    if medio: barra((cx - AP * q, cy), (cx + AP * q, cy), w); barra(P[0], (cx + AP * q, cy), w); barra(P[3], (cx - AP * q, cy), w)
    for g in ((0, 90, 180) if medio else (0, 90, 180, 270)):
        dx, dy = math.cos(math.radians(g)), -math.sin(math.radians(g))
        barra((cx + dx * Cp["D"] / 2 * q, cy + dy * Cp["D"] / 2 * q), (cx + dx * AP * q, cy + dy * AP * q), w, "url(#MET)")
    for g in ((0, 180) if medio else (0, 90, 180, 270)):
        dx, dy = math.cos(math.radians(g)), -math.sin(math.radians(g))
        barra((cx + dx * (AP - 10) * q, cy + dy * (AP - 10) * q), (cx + dx * (AP + LB) * q, cy + dy * (AP + LB) * q), Br["D"] / 2 * q)
        lx, ly = cx + dx * (AP + LB + 60) * q, cy + dy * (AP + LB + 60) * q
        if abs(dx) > .5: h.rect(lx - 15, ly - 9, 30, 18, "#fff", G, .6, 'stroke-dasharray="3 2"')
        else: h.rect(lx - 9, ly - 15, 18, 30, "#fff", G, .6, 'stroke-dasharray="3 2"')
    h.circ(cx, cy, Cp["D"] / 2 * q, "#fff", K, 1.3); h.circ(cx, cy, 1.8, K, K, 0)
    return P

# ======================= 1. ARRIBA · OCTOGONAL (1:20)
q = .2; cx, cy = 230, 285
h.titulo(40, 62, "DESDE ARRIBA - OCTOGONAL (6016)", "ESC. 1:20 · ESQUEMA (*) · 4 ARTEFACTOS")
P = octo(cx, cy, q)
h.ln(cx - (AP + LB + 90) * q, cy, cx + (AP + LB + 90) * q, cy, K, .4, h.EJE); h.ln(cx, cy - (AP + LB + 90) * q, cx, cy + (AP + LB + 90) * q, K, .4, h.EJE)
h.dimH(cy + (AP + LB) * q + 30, cx, cx + (AP + LB) * q, f"{AP + LB} (*)", ext=cy + 8, c=OR)
h.dimH(cy + (AP + LB) * q + 14, cx, cx + AP * q, f"APOTEMA {AP} (*)", ext=cy + 8, c=OR)
lineaCorte(h, cx - (AP + LB) * q - 30, cy - 4, cx + (AP + LB) * q + 30, cy - 4, "A")
h.globo("1", *P[1], cx + 160, cy - 160, r=9); h.globo("2", cx, cy - AP * q * .55, cx - 160, cy - 160, OR, r=9)
h.globo("3", cx - (AP + LB * .6) * q, cy, cx - 165, cy + 60, r=9); h.globo("4", cx + 6, cy + 8, cx + 130, cy + 150, r=9)

# ======================= 2. ARRIBA · MEDIO (1:20)
h.titulo(470, 62, "MEDIO OCTOGONAL (6013)", "ESC. 1:20 · ESQUEMA (*) · 2 ARTEFACTOS")
octo(650, 285, q, medio=True)
h.txt(650, 335, "2 BRAZOS OPUESTOS · 180° (*)", 9.5, 700, K, "middle")
h.txt(650, 350, "CIERRE RECTO DEL MEDIO ARO (*)", 9, 400, OR, "middle")

# ======================= 3. CORTE A-A LATERAL (1:20)
h.titulo(40, 470, "CORTE A-A - LATERAL", "POR EL EJE Y 2 BRAZOS · ESC. 1:20 · ESQUEMA (*)")
cx2, yp = 230, 600
Y = lambda z: yp - z * q
h.rect(cx2 - 57 * q, Y(0), 114 * q, 60, "url(#MET)", K, 1); h.rect(cx2 - 90 * q, Y(0) + 60, 180 * q, 30, "url(#PRFV)", K, 1.1)
h.txt(cx2 + 30, Y(0) + 78, "POSTE PRFV 10 m + ADAPTADOR Ø114 (*)", 8.5, 400, OR)
for s in (-1, 1):
    poly(h, [(cx2 + s * Cp["D"] / 2 * q, Y(-60)), (cx2 + s * Cp["D"] / 2 * q, Y(Cp["H"] - 60)), (cx2 + s * (Cp["D"] / 2 - Cp["e"]) * q, Y(Cp["H"] - 60)), (cx2 + s * (Cp["D"] / 2 - Cp["e"]) * q, Y(-60))], "url(#MET)", .9)
    h.rect(min(cx2 + s * Cp["D"] / 2 * q, cx2 + s * AP * q), Y(O["z"]) - O["rayo"] / 2 * q * 1.6, abs(AP - Cp["D"] / 2) * q, O["rayo"] * q * 1.6, "#fff", K, .9)
    h.circ(cx2 + s * AP * q, Y(O["z"]), O["rayo"] / 2 * q * 1.8, "url(#MET)", K, .9)
    x0, x1 = cx2 + s * (AP - 10) * q, cx2 + s * (AP + LB) * q; dz = LB * math.tan(math.radians(5)) * q
    poly(h, [(x0, Y(O["z"]) - Br["D"] / 2 * q), (x1, Y(O["z"]) - Br["D"] / 2 * q - dz), (x1, Y(O["z"]) + Br["D"] / 2 * q - dz), (x0, Y(O["z"]) + Br["D"] / 2 * q)], "#fff", 1.1)
h.rect(cx2 - Cp["D"] / 2 * q, Y(Cp["H"] - 60) - 1.5, Cp["D"] * q, 1.5, "#111", K, .2)
h.ln(cx2, Y(Cp["H"]) - 20, cx2, Y(0) + 95, K, .4, h.EJE)
h.dimV(cx2 - (AP + LB) * q - 16, Y(O["z"]), Y(0), f"≈{O['z']} (*)", ext=cx2 - 30, c=OR)
h.globo("3", cx2 + (AP + 200) * q, Y(O["z"] + 8), cx2 + 170, yp - 95, r=9); h.globo("1", cx2 + AP * q, Y(O["z"]), cx2 + 140, yp - 125, r=9)
h.globo("4", cx2 + 8, Y(100), cx2 + 110, yp + 30, r=9)

# ======================= TABLAS (derecha)
yv = tablaD(h, 470, 470, [("CODIGO", "VINCULO", "ARTEF.", "ITEM VIEJO"), ("6016", "OCTOGONAL", "4", "10.21"), ("6013", "MEDIO OCTOGONAL", "2", "10.22")],
            [(62, "c", True), (130, "l", False), (70, "c", False), (100, "c", False)], "VARIANTES (AP-C-011)", rowh=17)
bloque(h, 470, yv + 20, "DONDE SE USA", ["AP-C-011: COLUMNAS ALTAS Y NODOS VIALES.", "SE DIBUJA SOBRE EL PRFV 10 m (ADAPTADOR Ø114) (*).",
       "SIN ITEM PROPIO EN EL ITEMIZADO 2026: COMO SE COBRA (*).", "CALCULADORA: BRAZO 0,40 PARA LA SUBIDA."], w=370, sz=9.5, lh=12.5)
yc_ = codTabla(h, 40, 735, [6016, 6013, 4019, 4038], {6016: "4 ART. · ITEM 10.21", 6013: "2 ART. · ITEM 10.22", 4019: "1 POR ARTEFACTO", 4038: "1 POR BULON"}, wd=150)
yd = tablaD(h, 40, yc_ + 20, [("DATO", "VALOR"), ("MATERIAL", "ACERO GALVANIZADO (*)"), ("ARO", "OCTOGONAL, APOTEMA 250 (*)"),
        ("RAYOS / ARO", "CAÑO Ø26,9 (*)"), ("BRAZOS", "CAÑO Ø60,3, 400 DESDE EL ARO (*)"), ("FIJACION LUM.", "BULON PASANTE 4019 + 4038"),
        ("FUSIBLES", "4 ART.: 4 A + 4 A · 2 ART.: 2 A + 2 A")], [(110, "l", False), (300, "l", False)], "DATOS TECNICOS", rowh=14)
ry = rayadosRef(h, 470, yc_ + 20, ["MET", "PRFV"], cols=1, dx=180)
yl = bloque(h, 470, ry + 8, "QUE LLEVA (OCTOGONAL · MEDIO)", ["LUMINARIA LED 6010: 4 · 2", "BULON 4019 + 4038: 4 · 2", "CABLE 3×1,5 (6001): UNO POR ARTEFACTO",
            "PRENSACABLE 3/4\": UNO POR ARTEFACTO"], w=370, sz=9.5, lh=12.5)
notasW(h, 40, max(yd, yl) + 20, [
    "(*) ESQUEMA: LA APP NO TIENE MEDIDAS DEL AP-C-011 (BRAZO «S/PLANO») Y NO SE ENCONTRO PLANO PUBLICO. ARO, RAYOS, BRAZOS Y ALTURAS: A CONFIRMAR.",
    "OCTOGONAL = 4 ARTEFACTOS (ITEM 10.21, 6016) · MEDIO OCTOGONAL = 2 ARTEFACTOS (ITEM 10.22, 6013).",
    "LOS CABLES 3×1,5 SUBEN POR EL POSTE Y EL ADAPTADOR; CADA UNO VA POR SU RAYO Y SU BRAZO HASTA EL EQUIPO (*)."], w=800, lh=13.5)

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - OCTOGONAL (6016) Y MEDIO (6013)", "GALVANIZADO (*) · ESQUEMA: FORMA A CONFIRMAR CON EL PLANO (*) · SIN LUMINARIAS")
A = img3d(h, "col_vin2", 895, 100, 740)
columna(h, A, [("aro", "1", "ARO OCTOGONAL (*)"), ("rayo", "2", "RAYO (*)"), ("brazo", "3", "BRAZO Ø60,3 (*)"), ("cap", "4", "CAPUCHON (*)"), ("adapt", "", "ADAPTADOR Ø114 (10 m)")],
        910, 560, 760, paso=30)
columna(h, A, [("medio", "", "MEDIO ARO + CIERRE (*)"), ("medioBrazo", "", "2 BRAZOS A 180°")], 1400, 560, 700, paso=30)
h.txt(1030, 130, "6016 · 4 ARTEFACTOS", 12, 700, NV, "middle", INT); h.txt(1480, 130, "6013 · 2 ARTEFACTOS", 12, 700, NV, "middle", INT)
h.txt(905, 830, "LUMINARIAS: VER MAT-LUMINARIA_LED-1 · BRAZO Y CAPUCHON: VER MAT-VINCULOS-1", 10, 400, G, "start", INT)
pie3d(h, "", "RENDER three.js: r3d/escenas/col_vin2.mjs · MISMA GEOMETRIA DEL PLANO · FUENTES: r3d/FUENTES_col.md")
rotuloMat(h, "MAT-VINCULOS-2", "VINCULO OCTOGONAL", "Y MEDIO OCTOGONAL", "ESQUEMA (*): ARRIBA, CORTE A-A, CODIGOS Y 3D", "1:20", "3D S/E", rev="B", fecha="08/11/2026")
guardarCol(h, "mat_vinculos_2")
