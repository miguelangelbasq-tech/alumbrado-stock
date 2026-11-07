"""MAT-COLUMNA_PRFV-1 · Columna PRFV recta 7 m (6008) y 10 m (6007).
Datos: FICHAS_TEC.columna_prfv (tabla A–E, peso), FAMILIAS_MAT.columna_prfv, fichas de Normas AP-C-033-A / AP-C-033-B (LT, LL, LE, LB, LC,
DEB, DEC, buje/adaptador, «C», placas, cargas, conicidad, pared 10 m), CLAUDE.md §11.3 (molde = Ø base + 50, caja a 3,50 m). ORIGINAL v130."""
from ilukit import *
h = nueva(); m = h.m

# ======================= VISTAS DE FRENTE (7 m y 10 m) · k = 0,04 px/mm (1:100)
k = 0.036; YG = 480
h.titulo(40, 62, "VISTAS DE FRENTE - 7 m Y 10 m", "ESC. 1:110 - COTAS EN mm - Ø DIBUJADOS 2,2× PARA QUE SE VEAN")
P7 = dict(x=150, LT=8000, LL=7000, LE=1000, LB=4500, LC=2800, DEB=197, DEC=122, bs=468, be=240, bd=90, nom="7 m · 6008")
P10 = dict(x=355, LT=11100, LL=10000, LE=1100, LB=4600, LC=2900, DEB=353, DEC=180, bs=468, be=400, bd=114, nom="10 m · 6007")
h.ln(40, YG, 450, YG, K, 1.4); h.nivel(430, YG, "±0,00")
for xx in range(44, 450, 9): h.ln(xx, YG + 1, xx - 6, YG + 7, K, .4)
for P in (P7, P10):
    x = P["x"]; yb = YG + P["LE"] * k; yt = yb - P["LT"] * k
    rb, rt = P["DEB"] * k / 2 * 2.2, P["DEC"] * k / 2 * 2.2          # Ø exagerado 2,2× para que se lea
    h.path(f"M{x-rb:.1f},{yb:.1f} L{x-rt:.1f},{yt:.1f} L{x+rt:.1f},{yt:.1f} L{x+rb:.1f},{yb:.1f} Z", "#fff", K, 1.4)
    h.rect(x - P["bd"] * k * 1.1, yt - P["bs"] * k, P["bd"] * k * 2.2, P["bs"] * k, "#fff", K, 1)
    h.ln(x, yt - P["bs"] * k - 10, x, yb + 10, K, .4, h.EJE)
    for z in (P["LB"], P["LB"] + 500):
        yy = yb - z * k; h.rect(x - 3, yy - 3.2, 6, 6.4, "#111", K, .5)
    yl = yb - P["LC"] * k; h.rect(x - 2.5, yl - 2, 5, 4, "#fff", K, .7)
    yc = yb - 350 * k; h.rect(x + rb * .55, yc - 2, 4, 4, OR, OR, .5)
    # cotas izquierda: LT, LL, LE
    h.dimV(x - 62, yt, yb, f"LT = {P['LT']:,}".replace(",", "."), ext=x - rt - 3)
    h.dimV(x - 40, yt, YG, f"LL = {P['LL']:,}".replace(",", "."), ext=x - rt - 3)
    h.dimV(x - 40, YG, yb, f"{P['LE']:,}".replace(",", "."), ext=x - rb - 3)
    # derecha: LB, LC, caja de arriba
    h.dimV(x + 44, yb - P["LB"] * k, yb, f"LB = {P['LB']:,}".replace(",", "."), ext=x + 4)
    h.dimV(x + 26, yb - P["LC"] * k, yb, f"LC {P['LC']:,}".replace(",", "."), ext=x + 4)
    h.dimV(x + 44, yb - (P["LB"] + 500) * k, yb - P["LB"] * k, "500", ext=x + 4)
    h.txt(x, yb + 22, f"Ø{P['DEB']}", 10.5, 700, K, "middle"); h.txt(x, yb + 35, "(DEB)", 9, 400, G, "middle")
    h.txt(x + 10, yt + 14, f"Ø{P['DEC']}", 10, 700); h.txt(x + 10, yt - P["bs"] * k - 4, f"Ø{P['bd']}", 10, 700)
    h.txt(x, yb + 50, P["nom"], 11, 700, K, "middle")
h.globo("1", P7["x"] + 2, YG - 120, 62, 380); h.globo("2", P7["x"] + 3, YG + 36 - 4500 * k, 62, 330)
h.globo("3", P7["x"] + 3, YG + 36 - 5000 * k, 62, 290); h.globo("4", P7["x"], YG + 36 - 8000 * k - 9, 62, 210)
h.globo("5", P7["x"] + 2, YG + 36 - 2800 * k, 62, 420); h.globo("6", P7["x"] + 6, YG + 36 - 350 * k, 232, YG + 22, OR)
corteMarca(h, P7["x"] - 22, YG + 36 - 4500 * k, P7["x"] + 18, YG + 36 - 4500 * k, "A")

# ======================= CORTE A-A por la caja de abajo (1:5 → 0,8 px/mm)
s = .8; cx, cy = 560, 215
h.titulo(475, 62, "CORTE A-A (7 m)", "POR LA CAJA DE ABAJO - ESC. 1:5")
D = 155; R = D / 2 * s; t = 4 * s
h.circ(cx, cy, R, "#111", K, 1.4); h.circ(cx, cy, R - t, "#fff", K, .8)
h.rect(cx - 47.5 * s, cy - R - 2, 95 * s, 87 * s, "#fff", K, 1.3)            # caja empotrada (95 de ancho, 87 de fondo)
h.rect(cx - 42.5 * s, cy - R + 4, 85 * s, 4, "#ddd", K, .5)                     # placa A
h.ln(cx - R - 14, cy, cx + R + 14, cy, K, .4, h.EJE); h.ln(cx, cy - R - 16, cx, cy + R + 14, K, .4, h.EJE)
h.dimH(cy + R + 26, cx - R, cx + R, "Ø≈155 (*)", ext=cy + 8, c=OR)
h.dimH(cy - R - 18, cx - 47.5 * s, cx + 47.5 * s, "95", ext=cy - R - 4)
h.dimV(cx + R + 30, cy - R - 2, cy - R - 2 + 87 * s, "87", ext=cx + 47.5 * s + 2)
h.txt(cx, cy - R - 38, "FRENTE (TAPA)", 9.5, 700, K, "middle")
h.globo("2", cx - 30, cy - R + 30, 490, 120); h.txt(cx + 2, cy + R - 10, "PARED", 9, 700, K, "middle")
h.txt(cx - R - 14, cy + R + 44, "PARED: 10 m 4,8 · 7 m NO FIGURA (*)", 9.5, 400, OR)

# ======================= D1 · CAJA BORNERA IP54 (1:4 → 1 px/mm)
h.titulo(672, 62, "D1 · CAJA IP54", "FRENTE SIN TAPA - ESC. 1:4")
bx, by = 715, 115
h.rect(bx, by, 95, 160, "#fff", K, 1.4); h.rect(bx + 5, by + 5, 85, 150, "#fff", K, .7, 'stroke-dasharray="4 2"')
h.rect(bx + 20, by + 18, 55, 124, "#eee", K, .6)                                 # placa B (tablerito)
for i, c in enumerate(("#9aa0a6", "#9aa0a6", "#9aa0a6", "#4fa3d9", "#2f9e44")):
    h.rect(bx + 26 + i * 9, by + 60, 8, 40, "#fff", K, .6)
h.ln(bx + 22, by + 80, bx + 73, by + 80, K, 1.6)
h.dimH(by - 10, bx, bx + 95, "95", ext=by)
h.dimV(bx + 116, by, by + 160, "160", ext=bx + 97)
h.dimV(bx - 10, by + 5, by + 155, "150", ext=bx + 3)
h.txt(bx + 47, by + 176, "ACCESO 85 × 150", 9.5, 700, K, "middle"); h.txt(bx + 47, by + 189, "PLACA B 80 × 130 (TABLERITO)", 9, 400, G, "middle")

# ======================= D2 · CIMA: BUJE (7 m) Y ADAPTADOR (10 m) (1:16 → 0,25 px/mm)
q = .18; YT = 568
h.titulo(475, 345, "D2 · CIMA DEL TUBO", "BUJE Ø90/76 (7 m) · ADAPTADOR METALICO Ø114 (10 m) - ESC. 1:16")
for (x0, dt, bd, bi, bs, be, nom, rell) in ((560, 122, 90, 76, 468, 240, "7 m", "url(#PLAS)"), (735, 180, 114, None, 468, 400, "10 m", "url(#STEEL)")):
    ytop = YT - 470 * q
    h.path(f"M{x0-dt/2*q-2:.1f},{YT} L{x0-dt/2*q:.1f},{ytop:.1f} L{x0+dt/2*q:.1f},{ytop:.1f} L{x0+dt/2*q+2:.1f},{YT}", "#fff", K, 1.3)
    h.rect(x0 - bd / 2 * q, ytop - bs * q, bd * q, (bs + be) * q, rell, K, 1)
    h.ln(x0 - dt / 2 * q, ytop + be * q, x0 + dt / 2 * q, ytop + be * q, K, .5, h.OCULTA)
    if bi: h.rect(x0 - bi / 2 * q, ytop - bs * q, bi * q, (bs + be) * q, "#fff", K, .6)
    h.ln(x0, ytop - bs * q - 8, x0, YT, K, .4, h.EJE)
    h.dimV(x0 - 50, ytop - bs * q, ytop, str(bs), ext=x0 - bd / 2 * q - 2)
    h.dimV(x0 - 50, ytop, ytop + be * q, str(be), ext=x0 - dt / 2 * q - 2)
    h.dimH(ytop - bs * q - 12, x0 - bd / 2 * q, x0 + bd / 2 * q, f"Ø{bd}" + (f"/{bi}" if bi else ""), ext=ytop - bs * q)
    h.txt(x0 + dt / 2 * q + 6, ytop + 14, f"Ø{dt}", 10.5, 700); h.txt(x0, YT + 14, nom, 11, 700, K, "middle")
h.globo("4", 560, YT - 470 * q - 300 * q, 615, 420)
h.txt(612, 545, "ENTRA EN EL TUBO", 9, 400, G); h.ln(610, 542, 562 + 8, YT - 470 * q + 120 * q, G, .4)

# ======================= TABLAS
h.tabla(40, 604, [(62, "c", True), (150, "l", False), (80, "c", True), (80, "c", True), (84, "c", True), (84, "c", True), (84, "c", True), (76, "c", True), (90, "c", True)],
        [("CODIGO", "MODELO", "A TOTAL", "B LIBRE", "C EMPOTR.", "D Ø BASE", "Ø CIMA", "E CAJA", "PESO"),
         ("6008", "7 m (AP-C-033-A)", "8,00 m", "7,00 m", "1,00 m", "197 mm", "122 mm", "3,50 m", "41 kg+buje"),
         ("6007", "10 m (AP-C-033-B)", "11,10 m", "10,00 m", "1,10 m", "353 mm", "180 mm", "3,50 m", "107 kg")],
        rowh=20, titulo="VARIANTES (FICHA TECNICA · E = CAJA SOBRE EL PISO)")
y2 = h.codigos(40, 698, [6008, 6007])
h.datos(40, y2 + 32, [("NORMA / COLOR", "IRAM 13901 · gris RAL 7043"), ("CONICIDAD", "7 m: 10 mm/m · 10 m: 17 mm/m"), ("CAJAS (2)", "IP54 95×160×87 · acceso 85×150"),
        ("ALTURA CAJAS", "abajo 3,50 m del piso · arriba +500"), ("ENTRADA «C»", "350 de la base (0,65 / 0,75 bajo piso)"),
        ("PLACA CARACT.", "100×100 a 1,80 m del piso (LC)"), ("CARGA", "trabajo 65 kgf · rotura 130 kgf · FS 2"),
        ("DEFLEXION ADM.", "10 % LL = 700 / 1000 mm")], w=410, c1=130)
textoBloque(h, 475, y2 + 32, "DONDE SE USA", [
    "· AP-C-033-A / B: el poste. Ítems 5 a 8 (PRFV",
    "   1-2-3 brazos / 10 m) y provisión 84.1 / 84.2.",
    "· AP-TC-003-A: fundación (molde Ø base + 50:",
    "   247 / 403 mm) con arena seca y telgopor.",
    "· TC-PRFV-01 / 02: lo que va en las 2 cajas.",
    "· Vínculos: AP-C-008 / 034 (7 m), AP-C-040 (10 m).",
    "· Calculadora: subida 3×1,5 = altura − 3,50",
    "   + brazo + 0,60 (4,5 m en 7 m).",
    "· Guía «Montaje de columna PRFV».",
    "· Marcas: OTEK, PETROPLAST, FIBERKUVET."])
h.notas(40, 1040, [
    "COTAS EN mm. CONICA, TAPA EN LA BASE (10 m: Y EN LA CIMA). TOL. LARGO ±1 %, Ø ±5 % (7 m). LB, LC Y «C» DESDE LA BASE.",
    "EL PLANO DE 10 m ROTULA «LC = 4600» A LA LINEA DE CAJA (ES LB).",
    "ENTRE LAS DOS CAJAS VA SOLO EL CABLE 4×4 XLPE, SIN CAÑO (EL PLANO DIBUJA CAÑO PVC; EN OBRA NO SE PONE).",
    "(*) Ø EN LA CAJA (≈155) SALE DE INTERPOLAR 197 → 122; LA PARED DEL DE 7 m NO FIGURA: A CONFIRMAR CON EL FABRICANTE.",
    "FUENTE: FICHAS AP-C-033-A Y AP-C-033-B (D.G.A.P. JUNIO 2026), PLIEGO LP 21478, FICHA FD-C-02 Y CATALOGO DEL PAÑOL."])

# ======================= 3D: POSTE 7 m EN SU FUNDACION (CORTADA A UN CUARTO)
h.titulo(890, 62, "VISTA 3D - POSTE PRFV 7 m EN SU LUGAR", "FUNDACION Y SUELO CORTADOS A UN CUARTO · PRFV RAL 7043")
h.iso(.082, 1000, 865)
rb, rt = 98.5, 61
def rz(z): return rb + (rt - rb) * (z + 1000) / 8000
B = 300
m.box(-B, 0, -B, B, -1200, 0, "hormigon", pat="conc3", edge="#6d7277"); m.box(0, B, -B, 0, -1200, 0, "hormigon", pat="conc3", edge="#6d7277")
m.render()
ringZ(m, 123.5, 126, -1150, 0, "pvc", bias=40)                         # molde PVC Ø247 (*)
ringZ(m, rb + 1, 123.5, -1150, -50, "#d8c49a", bias=41)               # arena seca
ringZ(m, rb + 1, 123.5, -50, 0, "#b1aa9c", bias=42)                   # sello 50
m.render()
ringZ(m, rb - 4, rb, -1000, 0, "prfv", bias=60)                       # pared del poste en corte
m.render()
for (gx0, gx1, gy0, gy1) in ((-B - 260, -B, -B - 260, B + 260), (-B, B + 260, -B - 260, -B)):
    m.box(gx0, gx1, gy0, gy1, -60, 0, "#5a9e3a", pat="grass", edge="#3d6b27")
m.render()
m.cyl([0, 0, 0], [0, 0, 7000], rz(0), "prfv", n=30, r1=rt, seg=14, pat="fibra", capmat="#6f7472")
m.render()
m.cyl([0, 0, 7000], [0, 0, 7468], 45, "pvcg", n=24, capmat="#b9bdc1")
m.render()
for z in (3500, 4000): ventanaZ(m, rz(z), 45, z, 95, 160)
ventanaZ(m, rz(1800), 45, 1800, 100, 100, "#e9ecef")
m.render()
# tubito de la «C»: el troncal entra desde la zanja
m.cyl([0, 300 + 240, -650], [0, rb * .7, -650], 9, "negro", n=12, seg=4, bias=200); m.render()
h.g3("1", (0, 0, 5600), 1110, 330, "POSTE PRFV 7 m (6008)")
h.g3("3", (60, 60, 4000), 1110, 370, "CAJA DE ARRIBA (FUSIBLES)")
h.g3("2", (60, 60, 3500), 1110, 410, "CAJA DE ABAJO (TRONCAL)")
h.g3("4", (0, 0, 7300), 1110, 290, "BUJE Ø90/76")
h.g3("5", (65, 65, 1800), 1110, 450, "PLACA DE CARACTERISTICAS")
h.g3("6", (0, 250, -650), 1110, 760, "ENTRADA «C» (350 DE LA BASE)", OR)
h.g3("7", (-200, 290, -700), 1110, 800, "FUNDACION H-13 0,60×0,60×1,20")
h.g3("8", (0, 110, -400), 1110, 840, "ARENA SECA + MOLDE PVC Ø247")
h.nivel(*[v + d for v, d in zip(h.P(-B - 260, B + 260, 0), (-2, -6))], "")
pz = h.P(-B - 260, B + 260, 0); h.txt(pz[0] - 20, pz[1] - 18, "±0,00", 11, 400, K, "start", INT)
# 3D chico: tramo de las cajas, ampliado, con las tapas abiertas
h.iso(.42, 1530, 2210)
for z0 in (0,):
    m.cyl([0, 0, 3300], [0, 0, 4250], rz(3300), "prfv", n=36, r1=rz(4250), seg=6, pat="fibra", capmat="#6f7472")
    m.render()
    for z in (3500, 4000):
        nx, ny, tx, ty, c = ventanaZ(m, rz(z), 45, z, 95, 160)
        for i, col in enumerate(("gris", "gris", "gris", "celeste", "verde")):
            u = -36 + i * 15
            m.face([[c[0] + tx * u + nx * 2, c[1] + ty * u + ny * 2, z - 34], [c[0] + tx * (u + 12) + nx * 2, c[1] + ty * (u + 12) + ny * 2, z - 34],
                    [c[0] + tx * (u + 12) + nx * 2, c[1] + ty * (u + 12) + ny * 2, z + 34], [c[0] + tx * u + nx * 2, c[1] + ty * u + ny * 2, z + 34]], col, 10, "#333")
        m.render()
h.txt(1415, 960, "AMPLIADO: LAS 2 CAJAS (TAPA SACADA)", 10.5, 700, NV, "start", INT)
h.txt(1415, 975, "BORNES: FASE GRIS · N CELESTE · PE VERDE", 10, 400, G, "start", INT)
h.rotulo(890, h.H - 150, 750, "MAT-COLUMNA_PRFV-1", "COLUMNA PRFV RECTA", "7 m (6008) Y 10 m (6007)", "VISTAS, CORTE, CAJA, CIMA, VARIANTES, DATOS Y 3D",
         "1:110 / 1:5", "D1 1:4 · D2 1:16 · 3D S/E")
guardar(h, "mat_columna_prfv_1")
