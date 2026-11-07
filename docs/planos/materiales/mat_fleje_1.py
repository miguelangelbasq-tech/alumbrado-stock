import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
# ================= CORTE DEL FLEJE (10:1)
h.titulo(40, 62, "CORTE DEL FLEJE (AMPLIADO)", "ESC. 10:1 - ACERO INOXIDABLE AISI 304 · 3/4\" (4024)")
i, s, M = 60, 130, 12
h.rect(i, s, 19.05 * M, 0.7 * M, "url(#STEEL)", K, 1.4)
h.dimH(s - 16, i, i + 19.05 * M, '19,05 (3/4")', ext=s)
h.dimV(i + 19.05 * M + 22, s, s + 0.7 * M, "0,7", ext=i + 19.05 * M)
h.txt(i, s + 40, "ROTURA ≈ 7,5 kN", 10.5, 700)
# ================= HEBILLA
h.titulo(40, 210, "HEBILLA (4025)", "ESC. 2:1 - AISI 304 · ESPESOR 1,5")
hx, hy = 70, 290; k = 4
h.path(f"M{hx},{hy} h{19.05*k+20} v{14*k} h{-(19.05*k+20)} z", "url(#STEEL)", K, 1.3)
h.rect(hx + 10, hy + 10, 19.05 * k, 14 * k - 20, "#fff", K, 1)
h.path(f"M{hx},{hy} q{(19.05*k+20)/2},-26 {19.05*k+20},0", "none", K, 1.4)
h.dimH(hy + 14 * k + 20, hx + 10, hx + 10 + 19.05 * k, "19,05", ext=hy + 14 * k - 10)
h.dimH(hy - 30, hx, hx + 19.05 * k + 20, "ANCHO (*)", ext=hy - 4, c=OR)
h.txt(hx + 19.05 * k + 40, hy + 20, "PASA EL FLEJE DOBLE;", 10.5); h.txt(hx + 19.05 * k + 40, hy + 36, "LA LENGÜETA SE DOBLA", 10.5); h.txt(hx + 19.05 * k + 40, hy + 52, "SOBRE EL FLEJE", 10.5)
h.txt(hx + 19.05 * k + 40, hy + 68, "LARGO DE LA HEBILLA (*)", 10.5, 400, OR)
# ================= SUNCHO NO
h.titulo(40, 410, "SUNCHOS DE ACERO 3/8 (4034)", "NO USAR")
h.rect(60, 460, 220, 10, "url(#STEEL)", K, 1.1); h.ln(50, 450, 290, 480, OR, 3); h.ln(50, 480, 290, 450, OR, 3)
h.txt(300, 470, "NO USAR (SE OXIDAN)", 10.5, 700, OR)
# ================= CAÑO DE BAJADA EN POSTE H°A°
h.titulo(470, 62, "CAÑO DE BAJADA EN POSTE DE H°A°", "ESC. 1:40 - DOBLE AISLACION Ø2\" · L = 4 m (5004)")
k2 = 0.085; x0, yb = 560, 535
h.path(f"M{x0-20},{yb} L{x0-14},{yb-410} H{x0+14} L{x0+20},{yb} Z", "url(#CONC)", K, 1.4)
h.rect(x0 + 22, yb - 4000 * k2, 18, 4000 * k2, "url(#PLAS)", K, 1.2)
for yy in (yb - 310, yb - 190, yb - 70):
    h.rect(x0 - 26, yy, 72, 6, "url(#STEEL)", K, .9)
h.path(f"M{x0+18},{yb-4000*k2-8} h30 l-6,26 h-18 z", "url(#STEEL)", K, 1)   # babero (*)
h.dimV(x0 + 80, yb - 4000 * k2, yb, "L = 4000", ext=x0 + 42)
h.dimV(x0 + 120, yb - 310, yb - 190, "(*)", ext=x0 + 48, c=OR); h.dimV(x0 + 120, yb - 190, yb - 70, "(*)", ext=x0 + 48, c=OR)
h.globo("1", x0 + 44, yb - 307, x0 + 150, yb - 330); h.txt(x0 + 166, yb - 326, "FLEJE + HEBILLA (×3)", 10.5)
h.globo("2", x0 + 40, yb - 140, x0 + 150, yb - 150); h.txt(x0 + 166, yb - 146, "CAÑO Ø2\" (5004)", 10.5)
h.globo("3", x0 + 40, yb - 4000 * k2 - 4, x0 + 150, yb - 400); h.txt(x0 + 166, yb - 396, "BABERO (4015) (*)", 10.5)
h.globo("4", x0 - 10, yb - 250, x0 - 70, yb - 250)
h.txt(x0 - 70, yb + 20, "POSTE H°A°", 10.5, 700, K, "middle"); h.ln(400, yb, 700, yb, K, 1.4); h.txt(400, yb - 6, "±0,00", 10.5)
# códigos
y2 = h.codigos(40, 590, [4024, 4025, 5004, 4015, 4034],
               extra={4024: "19,05 × 0,7 · ítem 71", 4025: "esp. 1,5 · ítem 72", 5004: "en poste H°A° · ítem 76", 4015: "sobre el cable expuesto", 4034: "NO USAR"}, wx=170)
y3 = h.datos(40, y2 + 30, [("FLEJE 4024", "AISI 304 · 19,05 × 0,7 mm · ≈ 7,5 kN"), ("HEBILLA 4025", "AISI 304 · 3/4\" · esp. 1,5"), ("POR BAJADA", "3 flejes con hebilla"),
    ("CAÑO 5004", "doble aislación Ø2\" · L = 4 m"), ("BABERO 4015", "zinguería o PVC apto UV"), ("SE TENSA CON", "flejadora")], w=430, c1=120)
h.lista(500, y2 + 30, "DONDE SE USA", [
    "· Bajada en poste de H°A°: caño + 3 flejes.",
    "· Con apoyo PRFV nuevo NO va caño de",
    "   bajada (AP-T-018 / AP-T-019).",
    "· AP-T-019 nota 2: espuma + babero sobre",
    "   el tramo de cable expuesto.",
    "· Ménsulas de la red aérea en H°A°:",
    "   2 flejes con hebilla cada una.",
    "· Calculadora: 3 m de fleje por tablero",
    "   aéreo sobre poste existente (ítem 71).",
])
h.notas(40, 1010, [
    "COTAS EN mm. MANDA LA COTA. EL CAÑO SE DIBUJA A 1:40.",
    "(*) SEPARACION ENTRE FLEJES, FORMA DEL BABERO Y MEDIDAS DE LA HEBILLA (SALVO 19,05 Y ESPESOR 1,5): A CONFIRMAR CON EL PLANO OFICIAL.",
    "(*) EL ITEM 71 DICE «3/4\" × 0,7\" × 30\"», LARGO 3 m; LA FICHA DICE 19,05 × 0,7 mm. EL «0,7\"» DEL PLIEGO PARECE SER mm: CONFIRMAR.",
    "(*) ESPUMA Y BABERO NO TIENEN ITEM EN EL ANEXO I AUNQUE LOS EXIGE EL AP-T-019.",
    "LOS SUNCHOS DE ACERO 3/8 (4034) NO SE USAN.",
    "FUENTE: TVC / LAN, FICHA DE FLEJE Y HEBILLA SS304; LP 21478 ITEMS 71 / 72 / 76; AP-T-019; FICHA DE LA APP.",
])
# ================= 3D FLEJE Y HEBILLA
h.titulo(890, 62, "VISTA 3D - FLEJE CON HEBILLA SOBRE EL POSTE", "ACERO INOXIDABLE AISI 304 · TOMA EL CAÑO DE BAJADA")
h.iso(.95, 1150, 330)
R = 100
m.cyl([0, 0, -60], [0, 0, 80], R, "conc", n=48, seg=2, pat="conc3"); m.render()
m.cyl([0, R + 32, -70], [0, R + 32, 90], 30, "#e9eaec", n=28, seg=3); m.render()
m.ring([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], R, R + 1.2, 0, 19.05, -50, 60, "inox", n=30); m.render()
# vuelta del fleje alrededor del caño
m.ring([0, R + 32, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], 30, 31.2, 0, 19.05, -60, 240, "inox", n=30); m.render()
m.ring([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], R, R + 1.2, 0, 19.05, 120, 145, "inox", n=10); m.render()
m.box(52, 82, 76, 92, -4, 23, "inox", edge="#666"); m.render()   # hebilla
h.g3("1", (95, 30, 19), 1450, 130, "FLEJE INOX 3/4\" 4024")
h.g3("2", (67, 92, 23), 1450, 180, "HEBILLA 4025")
h.g3("3", (0, R + 62, 60), 1450, 230, "CAÑO DOBLE AISLACION 5004")
h.g3("4", (60, -60, 70), 1450, 280, "POSTE H°A°")
# ================= EN SU LUGAR
h.titulo(890, 560, "EN SU LUGAR - BAJADA EN POSTE DE H°A°", "CAÑO DE 4 m CON 3 FLEJES Y BABERO ARRIBA")
h.iso(.075, 1170, 1000)
m.cyl([0, 0, 0], [0, 0, 4700], 150, "conc", n=36, seg=10, r1=110, pat="conc3"); m.render()
m.cyl([0, 185, 0], [0, 168, 4000], 30, "#e9eaec", n=20, seg=10); m.render()
for z in (700, 2000, 3300):
    rr = 150 - 40 * z / 4700
    m.ring([0, 0, z], [1, 0, 0], [0, 1, 0], [0, 0, 1], rr, rr + 8, 0, 60, -50, 140, "inox", n=24); m.render()
m.box(-60, 60, 140, 260, 4000, 4060, "galv", edge="#555"); m.render()
m.cyl([0, 170, 4060], [0, 200, 4700], 10, "negro", n=10, seg=3); m.render()
h.g3("1", (0, 150, 2030), 1450, 640, "FLEJE + HEBILLA (×3)")
h.g3("3", (0, 180, 1300), 1450, 700, "CAÑO Ø2\" · L = 4 m")
h.g3("5", (0, 200, 4060), 1450, 760, "BABERO 4015 (*)")
h.g3("6", (0, 195, 4500), 1450, 820, "CABLE DE ACOMETIDA")
h.rotulo(890, h.H - 150, 750, "MAT-FLEJE-1", "FLEJE, HEBILLA", "Y CAÑO DE BAJADA", "CORTES, ELEVACION, DATOS Y 3D", "10:1 / 1:40", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_fleje_1.svg")); print("ok")
