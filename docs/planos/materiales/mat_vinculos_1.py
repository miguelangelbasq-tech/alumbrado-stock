"""MAT-VINCULOS-1 · Vínculos tipo capuchón con brazos (6019, 6017, 6018, 6020, 6021, 6022) + bulón pasante 4019 y tuerca/arandela 4038.
Datos: FICHAS_TEC.vinculos (tabla código/descr./plano), plano() de la ficha (5° / 15°, brazo 400 · 1000 · 1500, caño Ø60,3, bulón de fijación,
capuchón sobre la columna), FAMILIAS_MAT.vinculos, Normas AP-C-008 / 017-a / 017-b / 034, hojas aprobadas AP-C-008 y AP-C-034 (buje Ø90/76,
manguito Ø60,3 entrada 63±1 empotr. 100-200, fijación HOY bulón pasante 4019 + 4038). Lo que no tiene medida en la app: (*)."""
from ilukit import *
h = nueva(); m = h.m

# ======================= VISTA LATERAL · CAPUCHON 1 BRAZO (1:8 → 0,5 px/mm)
s = .5; X0, Y0 = 120, 200           # X0 = eje del poste, Y0 = cima del poste
h.titulo(40, 62, "VISTA LATERAL - CAPUCHON 1 BRAZO", "ESC. 1:8 - COTAS EN mm - CORTE POR EL EJE DEL BRAZO")
RC = 51; HC = 250; ZB = 190                                   # capuchón Ø≈102 × 250 (*), brazo a 190 de la base (*)
h.rect(X0 - 45 * s, Y0, 90 * s, 120, "url(#PLAS)", K, 1)       # buje Ø90 (sale del poste)
h.rect(X0 - 61 * s, Y0 + 120, 122 * s, 30, "#fff", K, 1.2); h.txt(X0, Y0 + 162, "POSTE", 9, 700, K, "middle")
h.rect(X0 - RC * s, Y0 + 120 - HC * s - 0, 2 * RC * s, HC * s, "#fff", K, 1.5)
yb = Y0 + 120 - ZB * s
a = math.radians(5); L = 400
x1 = X0 + RC * s; x2 = X0 + L * s; dyy = (L - RC) * s * math.tan(a); r6 = 30.15 * s
h.path(f"M{x1},{yb - r6} L{x2},{yb - r6 - dyy} L{x2},{yb + r6 - dyy} L{x1},{yb + r6} Z", "#fff", K, 1.4)
h.ln(X0, Y0 - 40, X0, Y0 + 170, K, .4, h.EJE); h.ln(x1 - 10, yb + 2, x2 + 30, yb - dyy - 2.6, K, .4, h.EJE)
# corte de la rotura y los largos 1000 / 1500
h.path(f"M{x2+6},{yb-r6-dyy-4} l-4,8 l8,4 l-4,8", "none", K, .7)
h.dimH(Y0 - 58, X0, x2, "L = 400 · 1000 · 1500 (*)", ext=yb - r6 - dyy - 4, c=OR)
h.dimV(X0 - RC * s - 22, Y0 + 120 - HC * s, Y0 + 120, "250 (*)", ext=X0 - RC * s - 2, c=OR)
h.dimH(Y0 + 120 - HC * s - 14, X0 - RC * s, X0 + RC * s, "Ø≈102 (*)", ext=Y0 + 120 - HC * s, c=OR)
h.txt(x2 - 30, yb - dyy - 26, "5° (O 15°)", 10.5, 700, K, "middle")
h.path(f"M{x2-80},{yb-6} A80,80 0 0,0 {x2-80},{yb-6 - 7}", "none", K, .6)
h.txt(X0 + 14, Y0 + 140, "BUJE Ø90/76", 9.5, 400, G)
h.globo("1", X0 - 10, Y0 + 50, 56, 150); h.globo("2", X0 + 120, yb - 4, 240, 120); h.globo("3", X0 + 4, Y0 + 100, 56, 300)
corteMarca(h, X0 + 160, yb - 50, X0 + 160, yb + 40, "B")

# ======================= VISTAS DESDE ARRIBA (1:25)
h.titulo(470, 62, "VISTAS DESDE ARRIBA", "ESC. 1:25 - BRAZOS DE 400 - UNO POR CODIGO")
q = .12
def arriba(cx, cy, angs, tit, sub, conf=False, Lb=400):
    h.circ(cx, cy, RC * q * 1.6, "#fff", K, 1.2)
    for g in angs:
        dx, dy = math.cos(math.radians(g)), -math.sin(math.radians(g))
        ex, ey = cx + dx * Lb * q, cy + dy * Lb * q; nx, ny = -dy, dx
        w = 30 * q * 1.6
        h.path(f"M{cx+dx*RC*q*1.6+nx*w:.1f},{cy+dy*RC*q*1.6+ny*w:.1f} L{ex+nx*w:.1f},{ey+ny*w:.1f} L{ex-nx*w:.1f},{ey-ny*w:.1f} L{cx+dx*RC*q*1.6-nx*w:.1f},{cy+dy*RC*q*1.6-ny*w:.1f}", "#fff", K, 1)
        lx, ly = cx + dx * (Lb * q + 12), cy + dy * (Lb * q + 12)
        h.rect(lx - 10, ly - 7, 20, 14, "#fff", K, .6, 'stroke-dasharray="3 2"')
    dl = 82 if len(angs) > 2 else 30
    h.txt(cx, cy + dl, tit, 10.5, 700, K, "middle"); h.txt(cx, cy + dl + 13, sub, 9.5, 400, OR if conf else G, "middle")
arriba(560, 130, [0], "6019 · 1 ART.", "BRAZO 400 · AP-C-008 1/3")
arriba(760, 130, [0, 180], "6020 · 2 ART.", "180° · AP-C-008 2/3")
arriba(560, 265, [0, 120, 240], "6021 · 3 ART.", "120° (*) · AP-C-008 3/3", True)
arriba(760, 265, [0, 90, 180, 270], "6022 · 4 ART.", "90° · AP-C-034")
h.txt(655, 384, "6017 / 6018 = COMO 6019 CON BRAZO DE 1000 / 1500 (AP-C-017-a / b)", 9.5, 700, K, "middle")

# ======================= D1 · BRAZO ↔ LUMINARIA (1:4 → 1 px/mm)
h.titulo(40, 400, "D1 · BRAZO ↔ LUMINARIA", "ESC. 1:4 - CORTE B-B POR EL MANGUITO")
mx, my = 70, 500
h.rect(mx, my - 30.15, 260, 60.3, "#fff", K, 1.3); h.rect(mx, my - 26, 260, 52, "#fff", K, .5, h.OCULTA)   # caño Ø60,3 (pared (*))
h.path(f"M{mx+150},{my-50} L{mx+380},{my-58} L{mx+380},{my+58} L{mx+150},{my+50} Z", "url(#STEEL)", K, 1.1)   # cuerpo de la luminaria (corte)
h.rect(mx + 150, my - 31.5, 150, 63, "#fff", K, .9)                                                           # manguito Ø63±1
h.rect(mx + 150, my - 30.15, 150, 60.3, "#fff", K, 1.3)
h.ln(mx - 10, my, mx + 390, my, K, .4, h.EJE)
bx = mx + 230
h.rect(bx - 6, my - 74, 12, 148, "url(#STEEL)", K, 1)                                                         # bulón pasante (*)
h.rect(bx - 13, my - 84, 26, 10, "#fff", K, 1.1); h.rect(bx - 14, my + 74, 28, 4, "#fff", K, .9); h.rect(bx - 11, my + 78, 22, 12, "#fff", K, 1.1)
h.dimV(mx - 18, my - 30.15, my + 30.15, "Ø60,3", ext=mx - 2)
h.dimH(my + 108, mx + 150, mx + 300, "EMPOTR. 100 - 200", ext=my + 52)
h.dimV(mx + 400, my - 31.5, my + 31.5, "63±1", ext=mx + 382)
h.globo("2", mx + 60, my - 30, mx + 60, my - 66); h.globo("4", bx, my - 84, bx + 50, my - 100); h.globo("5", bx + 11, my + 86, bx + 60, my + 100)
h.txt(mx + 330, my - 66, "LUMINARIA", 9.5, 700, K, "middle")

# ======================= D2 · CORTE C-C · ENCASTRE (1:2)
h.titulo(470, 400, "D2 · CORTE C-C", "ENCASTRE DEL CAPUCHON EN EL BUJE - ESC. 1:2")
cx, cy, e2 = 655, 510, 1.0
h.circ(cx, cy, 51 * e2, "url(#STEEL)", K, 1.4); h.circ(cx, cy, 47 * e2, "#fff", K, .8)
h.circ(cx, cy, 45 * e2, "#111", K, 1); h.circ(cx, cy, 38 * e2, "#fff", K, .7)
for i, g in enumerate((90, 210, 330)):
    h.cable(cx + 16 * math.cos(math.radians(g)), cy - 16 * math.sin(math.radians(g)), 5.6, color=True, nucleos=3)
h.dimH(cy + 72, cx - 51 * e2, cx + 51 * e2, "Ø≈102 (*)", ext=cy + 10, c=OR)
h.dimH(cy - 64, cx - 45 * e2, cx + 45 * e2, "BUJE Ø90 / 76", ext=cy - 10)
for sx in (-1, 1):
    h.rect(cx + sx * 51 - (16 if sx > 0 else 0) + (0 if sx > 0 else -0), cy - 3, 16, 6, OR, OR, .4) if False else h.rect(cx + (51 if sx > 0 else -67), cy - 3, 16, 6, "#fff", OR, 1)
h.txt(cx + 90, cy - 8, "PRISIONERO (*)", 9.5, 400, OR); h.txt(cx, cy + 96, "3 CABLES 3×1,5 SUBEN POR ADENTRO", 9.5, 700, K, "middle")
h.globo("1", cx - 36, cy - 32, 520, 440); h.globo("3", cx - 41, cy + 15, 520, 560)

# ======================= TABLAS
y2 = h.codigos(40, 625, [6019, 6017, 6018, 6020, 6021, 6022, 4019, 4038], extra={
    6019: "1 art. · 400 · ít. 10.15", 6017: "1 art. · 1000 · ít. 10.18", 6018: "1 art. · 1500 · ít. 10.19", 6020: "2 art. · 400 · ít. 10.16",
    6021: "3 art. · 400 · ít. 10.17", 6022: "4 art. · 400 · ít. 10.20", 4019: "1 por artefacto", 4038: "1 juego por bulón"}, wx=170,
    titulo="CODIGOS DEL PAÑOL Y VARIANTES (ITEMS DEL PLIEGO VIEJO)")
h.datos(40, y2 + 28, [("MATERIAL", "acero galvanizado"), ("BRAZO", "caño Ø60,3, inclinado 5° o 15° (ETG)"),
        ("LARGO BRAZO", "400 · 1000 · 1500 (del eje a la punta (*))"), ("MANGUITO", "Ø60,3: entrada 63±1, empotr. 100-200"),
        ("ACOPLE LUM.", "Ø60,3 (lum. ≥ 800 mm) · Ø42,4 (menores)"), ("FIJACION LUM.", "bulón pasante 4019 + 4038 (antivandálico)"),
        ("APOYO", "calza sobre el buje Ø90/76 del poste")], w=420, c1=110)
textoBloque(h, 485, y2 + 28, "DONDE SE USA", [
    "· AP-C-008 1/3 · 2/3 · 3/3 y AP-C-034: plazas,",
    "   sobre poste PRFV 7 m o metálica.",
    "· AP-C-017-a / b: brazo 1000 / 1500 (simple).",
    "· Anexo I 2026: va DENTRO del ítem de columna",
    "   (1-3 metálica, 5-7 PRFV), no se cobra aparte.",
    "· Columna 10 m: AP-C-040 (brazos 1,025 m).",
    "· Guía «Montaje de columna PRFV»."], sz=10, dy=15)
h.notas(40, 1040, [
    "COTAS EN mm. MANDA LA COTA. LOS CABLES 3×1,5 SUBEN POR ADENTRO DEL POSTE Y DEL BUJE Y CADA UNO ENTRA A SU BRAZO.",
    "(*) A CONFIRMAR CON EL PLANO: Ø Y ALTO DEL CAPUCHON, ALTURA DEL BRAZO, PARED DEL CAÑO, FIJACION AL BUJE, ANGULO DEL TRIPLE.",
    "(*) EL «0,425 m» DE ALGUNOS ITEMIZADOS ES EL CAPUCHON TRIPLE DEL PROYECTO 7081 (OTRA PIEZA). MULTIPLES DE 1000/1500: SIN PLANO.",
    "VARIANTE ETG: PRISIONEROS INOX PUNTA COPA EN LUGAR DEL BULON PASANTE (*). FUENTE: LP 21478, ETG CORDOBA, CATALOGO DEL PAÑOL."])

# ======================= 3D
h.titulo(890, 62, "VISTA 3D - CAPUCHON 1 BRAZO 400 (6019)", "GALVANIZADO · BULON PASANTE Y LUMINARIA LED (LINEA FINA)")
h.iso(.36, 1110, 430)
def capuchon(m, angs, L=400, inc=5, lum=True, cut=False):
    m.cyl([0, 0, -150], [0, 0, 0], 45, "galv", n=28, capmat="#9aa6b0")               # buje (arriba del poste)
    m.cyl([0, 0, -260], [0, 0, -150], 61, "prfv", n=28, pat="fibra")
    m.render()
    m.cyl([0, 0, -120], [0, 0, 130], 51, "galv", n=32, capmat="#b8c2ca"); m.render()
    for g in sorted(angs, key=lambda g: math.cos(math.radians(g)) + math.sin(math.radians(g))):
        dx, dy = math.cos(math.radians(g)), math.sin(math.radians(g)); zt = (L - 51) * math.tan(math.radians(inc))
        p0 = [dx * 45, dy * 45, 70]; p1 = [dx * L, dy * L, 70 + zt]
        m.cyl(p0, p1, 30.15, "galv", n=20, seg=3, capmat="#c9d1d8"); m.render()
        if lum:
            u = [dx, dy, 0]; v = [-dy, dx, 0]; c0 = [dx * (L - 120), dy * (L - 120), 70 + zt - 20]
            pts = lambda a, b, z: [c0[0] + u[0] * a + v[0] * b, c0[1] + u[1] * a + v[1] * b, z]
            for z0, z1 in ((c0[2] - 40, c0[2] + 50),):
                poly = [(0, -100), (150, -156), (575, -156), (575, 156), (150, 156), (0, 100)]
                A = [pts(a, b, z0) for a, b in poly]; B = [pts(a, b, z1) for a, b in poly]
                m.face(B, "#d7dbdf", 0, "#7a8188"); m.face(A, "#b4bac0", 0, "#7a8188")
                for i in range(len(A)): j = (i + 1) % len(A); m.face([A[i], A[j], B[j], B[i]], "#c3c8cd", 0, "#7a8188")
            m.render()
            b0 = [dx * (L - 50), dy * (L - 50), 70 + zt + 75]; b1 = [dx * (L - 50), dy * (L - 50), 70 + zt - 75]
            m.cyl(b0, b1, 6, "inox", n=10); m.hexa([b0[0], b0[1], b0[2]], [b0[0], b0[1], b0[2] + 10], 11, "inox"); m.render()
capuchon(m, [-90])
h.g3("1", (0, -30, 60), 1320, 180, "CAPUCHON GALV. Ø≈102 × 250 (*)")
h.g3("2", (0, -220, 85), 1320, 220, "BRAZO CAÑO Ø60,3 · 5° O 15°")
h.g3("4", (0, -350, 175), 1320, 260, "BULON PASANTE 4019 + 4038")
h.g3("3", (0, 0, -60), 1320, 480, "BUJE Ø90/76 DEL POSTE PRFV")
h.txt(905, 575, "LUMINARIA LED (6010): VER MAT-LUMINARIA_LED-1", 10, 400, G, "start", INT)
# la familia
h.titulo(890, 600, "LA FAMILIA (MISMA ESCALA)", "SIN LUMINARIAS · 1 / 2 / 3 / 4 BRAZOS DE 400 Y SIMPLES DE 1000 / 1500")
fam = [((960, 760), [-90], 400, "6019"), ((1130, 760), [-90, 90], 400, "6020"), ((1300, 760), [-90, 30, 150], 400, "6021"),
       ((1480, 760), [0, 90, 180, 270], 400, "6022"), ((1000, 930), [-90], 1000, "6017"), ((1320, 930), [-90], 1500, "6018")]
for (ox, oy), angs, L, cod in fam:
    h.iso(.17, ox + (L - 400) * .08, oy); capuchon(m, angs, L, lum=False)
    h.txt(ox + (L - 400) * .08 - 30, oy + 40, cod, 12, 700, NV, "middle", MONO)
h.rotulo(890, h.H - 150, 750, "MAT-VINCULOS-1", "VINCULOS TIPO CAPUCHON", "CON BRAZOS · 1 A 4 ART.", "LATERAL, ARRIBA, MANGUITO, ENCASTRE, CODIGOS Y 3D",
         "1:8 / 1:25", "D1 1:4 · D2 1:2 · 3D S/E")
guardar(h, "mat_vinculos_1")
