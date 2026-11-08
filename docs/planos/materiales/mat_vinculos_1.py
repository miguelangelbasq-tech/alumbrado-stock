"""MAT-VINCULOS-1 (rev. B) · Vínculos tipo capuchón con brazos de 400 / 1000 / 1500 (6019, 6017, 6018, 6020, 6021, 6022) + bulón pasante 4019 y 4038.
Geometría: r3d/piezas/perfiles_col.mjs (VIN) → perfiles_col.json; 3D: r3d/out/col_vin1.png y col_vin_fam.png.
Datos: FICHAS_TEC.vinculos (código / plano / ítem), AP-C-008 / 017-a / 017-b / 034 (hojas aprobadas: buje Ø90/76, manguito Ø60,3, entrada 63±1,
empotramiento 100–200, bulón pasante 4019 + 4038), ETG Córdoba (brazo 5° o 15°; variante prisioneros inox punta copa). Resto: (*)."""
from colkit import *

h = nueva3()
Cp, Br, Pr, c7 = VIN["cap"], VIN["brazo"], VIN["pris"], PRFV["c7"]
B = c7["buje"]

# ======================= 1. CORTE POR EL EJE DEL BRAZO (6019 sobre el buje del 7 m, 1:5)
e = .42; X0, ZT = 120, 372          # X0 = eje, ZT = y de la hoja en la cima del poste (z = LL)
h.titulo(40, 62, "CORTE POR EL EJE DEL BRAZO (6019)", "SOBRE EL BUJE Ø90/76 DEL POSTE PRFV 7 m · ESC. 1:5")
Y = lambda z: ZT - z * e                      # z desde la cima del poste
zc = B["sobre"] + Cp["tapa"] - Cp["H"]        # base del capuchón
# poste (pared PRFV) y buje
for s in (-1, 1):
    poly(h, [(X0 + s * c7["DEC"] / 2 * e, Y(-100)), (X0 + s * c7["DEC"] / 2 * e, Y(0)), (X0 + s * (c7["DEC"] / 2 - c7["e"]) * e, Y(0)), (X0 + s * (c7["DEC"] / 2 - c7["e"]) * e, Y(-100))], "url(#PRFV)", 1)
    poly(h, [(X0 + s * B["De"] / 2 * e, Y(-100)), (X0 + s * B["De"] / 2 * e, Y(B["sobre"])), (X0 + s * B["Di"] / 2 * e, Y(B["sobre"])), (X0 + s * B["Di"] / 2 * e, Y(-100))], "url(#PLAS)", .9)
    poly(h, [(X0 + s * Cp["D"] / 2 * e, Y(zc)), (X0 + s * Cp["D"] / 2 * e, Y(zc + Cp["H"] - Cp["tapa"])), (X0 + s * (Cp["D"] / 2 - Cp["e"]) * e, Y(zc + Cp["H"] - Cp["tapa"])), (X0 + s * (Cp["D"] / 2 - Cp["e"]) * e, Y(zc))], "url(#MET)", 1.1)
h.rect(X0 - Cp["D"] / 2 * e, Y(zc + Cp["H"]), Cp["D"] * e, Cp["tapa"] * e, "url(#MET)", K, 1.1)
rotura(h, X0 - c7["DEC"] / 2 * e, X0 + c7["DEC"] / 2 * e, Y(-100))
# brazo Ø60,3 a 5°, desde el capuchón a 400 del eje
inc = math.radians(Br["inc"]); zb = zc + Br["z"]; r = Cp["D"] / 2
def P(t, n): return (X0 + (r + t) * e + (-math.sin(inc)) * n * e * 0, Y(zb + t * math.tan(inc) + n))
L = Br["L"] - r
for n in (Br["D"] / 2, -Br["D"] / 2):
    a, b = P(0, n), P(L, n); h.ln(a[0], a[1], b[0], b[1], K, 1.3)
for n in (Br["D"] / 2 - Br["e"], -Br["D"] / 2 + Br["e"]):
    a, b = P(0, n), P(L, n); h.ln(a[0], a[1], b[0], b[1], K, .5, h.OCULTA)
a, b = P(L, Br["D"] / 2), P(L, -Br["D"] / 2); h.ln(a[0], a[1], b[0], b[1], K, 1.3)
poly(h, [P(0, -Br["D"] / 2), P(Br["cartela"], -Br["D"] / 2), (X0 + r * e, Y(zb - Br["D"] / 2 - Br["cartela"]))], "url(#MET)", .9)
# luminaria (fantasma) con el empotramiento del manguito
a0, a1 = P(L - 150, 0), P(L + 330, 0)
h.path(f"M{P(L - 150, 32)[0]:.1f},{P(L - 150, 32)[1]:.1f} L{P(L + 330, 46)[0]:.1f},{P(L + 330, 46)[1]:.1f} L{P(L + 330, -46)[0]:.1f},{P(L + 330, -46)[1]:.1f} L{P(L - 150, -32)[0]:.1f},{P(L - 150, -32)[1]:.1f} Z", "none", G, .8, 'stroke-dasharray="10 3 2 3"')
h.txt(P(L + 120, 0)[0], P(L + 120, 0)[1] - 30, "LUMINARIA", 8.5, 400, G, "middle")
bx = P(L - 60, 0); h.rect(bx[0] - 2.5, bx[1] - 40 * e * 1.4, 5, 80 * e * 1.4, "url(#STEEL)", K, .7)
# prisionero
h.rect(X0 + r * e, Y(zc + Pr["z"]) - 5, 9, 10, "#fff", K, .8); h.rect(X0 + (B["De"] / 2) * e, Y(zc + Pr["z"]) - 2.5, (r - B["De"] / 2 + 14) * e + 6, 5, "#fff", K, .7)
# cable 3×1,5 que sube y entra al brazo
h.path(f"M{X0+4},{Y(-100)} L{X0+4},{Y(zb-40)} Q{X0+4},{Y(zb)} {X0+30},{Y(zb)} L{P(120, 0)[0]:.1f},{P(120, 0)[1]:.1f}", "none", K, 2.4)
h.ln(X0, Y(zc + Cp["H"]) - 14, X0, Y(-100) + 10, K, .4, h.EJE)
a, b = P(-r, 0), P(L + 40, 0); h.ln(a[0], a[1], b[0], b[1], K, .4, h.EJE)
h.dimH(Y(zc + Cp["H"]) - 34, X0, P(L, 0)[0], "L = 400 · 1000 · 1500", ext=P(L, 0)[1] - 34)
h.dimV(X0 - r * e - 26, Y(zc + Cp["H"]), Y(zc), f"{Cp['H']} (*)", ext=X0 - r * e - 2, c=OR)
h.dimV(X0 - r * e - 46, Y(zb), Y(zc), f"{Br['z']} (*)", ext=X0 - r * e - 2, c=OR)
h.dimH(Y(zc + Cp["H"]) - 10, X0 - r * e, X0 + r * e, "Ø101,6 (*)", ext=Y(zc + Cp["H"]), c=OR)
h.dimV(P(L, 0)[0] + 14, P(L, Br["D"] / 2)[1], P(L, -Br["D"] / 2)[1], "Ø60,3", ext=P(L, 0)[0] + 2)
h.dimH(P(L, -60)[1] + 10, P(L - 200, 0)[0], P(L, 0)[0], "100-200", ext=P(L - 100, -32)[1])
h.txt(P(L * .55, 0)[0], P(L * .55, 0)[1] - 26, "5° (ETG; O 15°)", 9.5, 700, K, "middle")
h.txt(X0 - c7["DEC"] / 2 * e - 6, Y(-80), "POSTE", 8.5, 700, K, "end"); h.txt(X0 + 30, Y(-80), "BUJE Ø90/76", 8.5, 400, G)
h.globo("1", X0 - r * e + 2, Y(zc + 120), 52, 200, r=9); h.globo("2", *P(200, Br["D"] / 2), 270, 135, r=9)
h.globo("3", X0 + B["De"] / 2 * e - 2, Y(40), 52, 330, r=9); h.globo("6", X0 + r * e + 9, Y(zc + Pr["z"]), 230, Y(zc + Pr["z"]) + 22, r=9)
h.globo("7", P(40, -Br["D"] / 2 - 18)[0], P(40, -Br["D"] / 2 - 18)[1], 240, 380, r=9); h.globo("4", bx[0], bx[1] - 40 * e * 1.4, 380, 150, r=9)
lineaCorte(h, X0 - r * e - 18, Y(zc + Pr["z"]), X0 + r * e + 30, Y(zc + Pr["z"]), "C")

# ======================= 2. VISTAS DESDE ARRIBA · LA FAMILIA (1:25)
h.titulo(470, 62, "DESDE ARRIBA - LA FAMILIA", "ESC. 1:25 · BRAZOS DE 400 · UNO POR CODIGO")
q = .12
def arriba(cx, cy, angs, tit, sub, conf=False):
    h.circ(cx, cy, Cp["D"] / 2 * q * 1.6, "#fff", K, 1.2)
    for g in angs:
        dx, dy = math.cos(math.radians(g)), -math.sin(math.radians(g)); nx, ny = -dy, dx; w = Br["D"] / 2 * q * 1.6; r0 = Cp["D"] / 2 * q * 1.6
        ex, ey = cx + dx * Br["L"] * q, cy + dy * Br["L"] * q
        h.path(f"M{cx+dx*r0+nx*w:.1f},{cy+dy*r0+ny*w:.1f} L{ex+nx*w:.1f},{ey+ny*w:.1f} L{ex-nx*w:.1f},{ey-ny*w:.1f} L{cx+dx*r0-nx*w:.1f},{cy+dy*r0-ny*w:.1f}", "#fff", K, 1)
        lx, ly = cx + dx * (Br["L"] * q + 12), cy + dy * (Br["L"] * q + 12)
        h.rect(lx - 10, ly - 7, 20, 14, "#fff", G, .6, 'stroke-dasharray="3 2"')
    for i in range(3):
        a = math.radians(-45 + i * 120); h.circ(cx + math.cos(a) * Cp["D"] / 2 * q * 1.6, cy - math.sin(a) * Cp["D"] / 2 * q * 1.6, 1.6, K, K, 0)
    dl = 82 if len(angs) > 2 else 32
    h.txt(cx, cy + dl, tit, 10.5, 700, K, "middle"); h.txt(cx, cy + dl + 13, sub, 9, 400, OR if conf else G, "middle")
arriba(560, 135, [0], "6019 · 1 ART.", "AP-C-008 1/3"); arriba(760, 135, [0, 180], "6020 · 2 ART.", "180° · AP-C-008 2/3")
arriba(560, 268, [0, 120, 240], "6021 · 3 ART.", "120° (*) · AP-C-008 3/3", True); arriba(760, 268, [0, 90, 180, 270], "6022 · 4 ART.", "90° · AP-C-034")
h.txt(655, 384, "6017 / 6018 = 6019 CON BRAZO DE 1000 / 1500 (AP-C-017-a / b)", 9, 700, K, "middle")

# ======================= 3. D1 · BRAZO ↔ LUMINARIA (corte por el manguito, 1:2)
h.titulo(40, 420, "D1 · BRAZO EN EL ACOPLE", "CORTE POR EL MANGUITO · BULON PASANTE 4019 + 4038 · ESC. 1:2,5")
mx, my, e2 = 70, 530, .62
h.rect(mx, my - 30.15 * e2 * 1.6, 230, 60.3 * e2 * 1.6, "#fff", K, 1.2)
h.rect(mx, my - (30.15 - 3.2) * e2 * 1.6, 230, (60.3 - 6.4) * e2 * 1.6, "#fff", K, .5, h.OCULTA)
h.path(f"M{mx+110},{my-62} L{mx+330},{my-70} L{mx+330},{my+70} L{mx+110},{my+62} Z", "url(#ALU)", K, 1.1)
h.rect(mx + 110, my - 31.5 * e2 * 1.6, 200 * e2 * 1.6 * .65, 63 * e2 * 1.6, "#fff", K, .9)
h.rect(mx + 110, my - 30.15 * e2 * 1.6, 200 * e2 * 1.6 * .65, 60.3 * e2 * 1.6, "#fff", K, 1.3)
bx = mx + 190
h.rect(bx - 5, my - 74, 10, 148, "url(#STEEL)", K, 1); h.rect(bx - 11, my - 84, 22, 10, "#fff", K, 1.1)
h.rect(bx - 12, my + 74, 24, 3, "#fff", K, .9); h.rect(bx - 10, my + 77, 20, 11, "#fff", K, 1.1)
h.ln(mx - 10, my, mx + 340, my, K, .4, h.EJE)
h.dimV(mx - 14, my - 30.15 * e2 * 1.6, my + 30.15 * e2 * 1.6, "Ø60,3", ext=mx - 2)
h.dimH(my + 100, mx + 110, mx + 110 + 200 * e2 * 1.6 * .65, "EMPOTR. 100-200", ext=my + 64)
h.dimV(mx + 350, my - 31.5 * e2 * 1.6, my + 31.5 * e2 * 1.6, "63±1", ext=mx + 332)
h.globo("2", mx + 50, my - 30, mx + 50, my - 64, r=9); h.globo("4", bx, my - 84, bx + 60, my - 70, r=9); h.globo("5", bx + 10, my + 82, bx + 56, my + 100, r=9)
h.txt(mx + 300, my - 78, "LUMINARIA", 9, 700, K, "middle")

# ======================= 4. D2 · CORTE C-C POR LOS PRISIONEROS (1:2)
h.titulo(470, 420, "D2 · CORTE C-C", "PRISIONEROS M10 A 120° SOBRE EL BUJE · ESC. 1:2")
cx, cy, e3 = 650, 535, 1.0
ring = lambda r_, n=72: [(cx + r_ * math.cos(2 * math.pi * i / n), cy - r_ * math.sin(2 * math.pi * i / n)) for i in range(n)]
hatchPoly(h, ring(Cp["D"] / 2) + list(reversed(ring(Cp["D"] / 2 - Cp["e"]))), "MET", 1.2)
hatchPoly(h, ring(B["De"] / 2) + list(reversed(ring(B["Di"] / 2))), "PLAS", 1)
for i in range(3):
    a = math.radians(-45 + i * 120); ca, sa = math.cos(a), -math.sin(a)
    for t0, t1, w in ((Cp["D"] / 2, Cp["D"] / 2 + 9, 8.5), (B["De"] / 2, Cp["D"] / 2 + 22, 5)):
        p0 = (cx + ca * t0, cy + sa * t0); p1 = (cx + ca * t1, cy + sa * t1); nx, ny = -sa, ca
        poly(h, [(p0[0] + nx * w, p0[1] + ny * w), (p1[0] + nx * w, p1[1] + ny * w), (p1[0] - nx * w, p1[1] - ny * w), (p0[0] - nx * w, p0[1] - ny * w)], "#fff", .8)
for i, g in enumerate((90, 210, 330)): h.cable(cx + 18 * math.cos(math.radians(g)), cy - 18 * math.sin(math.radians(g)), 5, color=True, nucleos=3)
h.dimH(cy + 70, cx - Cp["D"] / 2, cx + Cp["D"] / 2, "Ø101,6 (*)", ext=cy + 10, c=OR)
h.dimH(cy - 70, cx - B["De"] / 2, cx + B["De"] / 2, "BUJE Ø90 / 76", ext=cy - 10)
llamada(h, cx + math.cos(math.radians(-45)) * 70, cy + math.sin(math.radians(45)) * 70, 745, 600, "PRISIONERO M10 (*)", c=OR, sz=8.5)
h.txt(cx, cy + 92, "3 CABLES 3×1,5 (6001), UNO POR BRAZO", 9, 700, K, "middle")
h.globo("6", cx + math.cos(math.radians(75)) * 62, cy - math.sin(math.radians(75)) * 62, 760, 470, r=9)

# ======================= TABLAS
TY = 655
yc_ = codTabla(h, 40, TY, [6019, 6017, 6018, 6020, 6021, 6022, 4019, 4038], {6019: "1 ART. · 400 · LP 10.15", 6017: "1 ART. · 1000 · LP 10.18", 6018: "1 ART. · 1500 · LP 10.19",
        6020: "2 ART. · 400 · LP 10.16", 6021: "3 ART. · 400 · LP 10.17", 6022: "4 ART. · 400 · LP 10.20", 4019: "1 POR ARTEFACTO", 4038: "1 JUEGO POR BULON"}, wd=150,
        titulo="CODIGOS DEL PAÑOL (ITEMS DEL PLIEGO VIEJO LP 21478)")
yd = tablaD(h, 40, yc_ + 20, [("DATO", "VALOR"), ("MATERIAL", "ACERO GALVANIZADO"), ("CAPUCHON", "Ø101,6 × 4 × 250 + TAPA 6 (*)"),
        ("BRAZO", "CAÑO Ø60,3 · 5° O 15° (ETG) · CARTELA (*)"), ("LARGO", "400 · 1000 · 1500 DEL EJE A LA PUNTA (*)"), ("MANGUITO", "ENTRADA 63±1 · EMPOTR. 100-200"),
        ("FIJACION AL BUJE", "3 PRISIONEROS M10 A 120° (*)"), ("FIJACION LUM.", "BULON PASANTE 4019 + 4038")], [(110, "l", False), (300, "l", False)], "DATOS TECNICOS", rowh=14)
ry = rayadosRef(h, 470, yc_ + 20, ["MET", "PRFV", "PLAS", "ALU"], cols=2, dx=180)
yu = bloque(h, 470, ry + 8, "DONDE SE USA", [
    "AP-C-008 1/3 · 2/3 · 3/3 Y AP-C-034: PLAZAS, SOBRE PRFV 7 m O METALICA.",
    "AP-C-017-a / b: BRAZO 1000 / 1500 (SIMPLE). 10 m: AP-C-040.",
    "ANEXO I 2026: VA DENTRO DEL ITEM DE COLUMNA (1-3 / 5-7).",
    "CALCULADORA: SUBIDA 3×1,5 = ALTURA − 3,50 + BRAZO + 0,60."], w=420, sz=9.5, lh=12)
notasW(h, 40, max(yd, yu) + 20, [
    "COTAS EN mm. LOS CABLES 3×1,5 SUBEN POR EL POSTE Y EL BUJE; CADA UNO ENTRA A SU BRAZO.",
    "(*) A CONFIRMAR CON EL PLANO: Ø Y ALTO DEL CAPUCHON, ALTURA DEL BRAZO, PARED DEL CAÑO, PRISIONEROS, CARTELA Y ANGULO DEL TRIPLE.",
    "(*) EL «0,425 m» DE ALGUNOS ITEMIZADOS ES EL CAPUCHON TRIPLE DEL PROYECTO 7081 (OTRA PIEZA). LA WEB NO TRAE PLANOS DE ESTOS CAPUCHONES."], w=800, lh=13.5)

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - CAPUCHON 1 BRAZO (6019) EN SU LUGAR", "CAPUCHON CORTADO A UN CUARTO SOBRE EL BUJE · LUMINARIA LED · ABAJO LA FAMILIA (MISMA ESCALA)")
A = img3d(h, "col_vin1", 895, 84, 420)
columna(h, A, [("foto", "", "FOTOCONTROL NEMA"), ("lum", "", "LUMINARIA (MAT-LUMINARIA_LED-1)"), ("bulon", "4", "BULON PASANTE 4019 + 4038"), ("brazo", "2", "BRAZO Ø60,3 A 5°"),
               ("tapaCap", "", "TAPA SOLDADA"), ("cartela", "7", "CARTELA (*)"), ("cap", "1", "CAPUCHON GALV. (*)"), ("pris", "6", "PRISIONERO M10 (*)"), ("buje", "3", "BUJE Ø90/76"),
               ("cable", "", "CABLE 3×1,5"), ("poste", "", "POSTE PRFV")], 1340, 110, 450, paso=26)
F_ = img3d(h, "col_vin_fam", 900, 560, 560)
for cod in ("6019", "6020", "6021", "6022", "6017", "6018"):
    x_, y_ = F_("c" + cod); h.txt(x_, y_ - 14, cod, 12, 700, NV, "middle", MONO)
h.txt(1470, 760, "1 · 2 · 3 · 4 BRAZOS DE 400", 10, 700, NV, "start", INT); h.txt(1470, 775, "Y SIMPLES DE 1000 / 1500", 10, 700, NV, "start", INT)
pie3d(h, "", "RENDER three.js: r3d/escenas/col_vin1.mjs y col_vin_fam.mjs · MISMA GEOMETRIA DEL PLANO · FUENTES: r3d/FUENTES_col.md")
rotuloMat(h, "MAT-VINCULOS-1", "VINCULOS TIPO CAPUCHON", "CON BRAZOS · 1 A 4 ART.", "CORTE, ARRIBA, D1 ACOPLE, D2 C-C Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardarCol(h, "mat_vinculos_1")
