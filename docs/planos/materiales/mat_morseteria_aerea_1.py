import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
def poste_planta(cx, cy, r):
    h.circ(cx, cy, r, "url(#CONC)", K, 1.5)
# ================= SUSPENSION · ESQUEMA EN ELEVACION
h.titulo(40, 62, "SUSPENSION EN POSTE DE H°A° - ELEVACION", "ESQUEMA S/E (ET-1005) - GRAMPA 4502 + MENSULA 4504")
px = 110; h.rect(px - 22, 100, 44, 330, "url(#CONC)", K, 1.4); h.txt(px, 446, "POSTE H°A°", 10.5, 700, K, "middle")
for yy in (170, 220): h.rect(px - 26, yy, 52, 7, "url(#STEEL)", K, .9)
h.path(f"M{px+22},164 H230 L250,192 L230,232 H{px+22} Z", "url(#PLAS)", K, 1.3)
h.path("M240,192 C250,230 300,230 312,198", "none", K, 4); h.path("M240,192 C250,230 300,230 312,198", "none", "#fff", 1.6)
h.rect(282, 220, 110, 30, "url(#PLAS)", K, 1.2, 'rx="14"')
h.ln(40, 236, 440, 236, K, 7); h.ln(40, 236, 440, 236, "#fff", 2.5)
h.globo("1", 190, 180, 190, 128); h.globo("2", 290, 212, 300, 150); h.globo("3", 340, 236, 380, 290); h.globo("4", px + 20, 173, 64, 300)
h.dimV(470, 236, 430, "5 m VEREDA / 6 m AVENIDA", ext=446)
h.txt(40, 474, "1 MENSULA 4504 · 2 GANCHO · 3 GRAMPA 4502", 10.5); h.txt(40, 490, "4 FLEJE INOX 3/4\" + HEBILLA ×2", 10.5)
# ================= RETENCION
h.titulo(500, 62, "RETENCION (PUNTA O ANGULO)", "ESQUEMA S/E - GRAMPA DE CUÑA 4503 + MENSULA 4505")
qx = 550; h.rect(qx - 22, 100, 44, 330, "url(#CONC)", K, 1.4); h.txt(qx, 446, "POSTE H°A°", 10.5, 700, K, "middle")
for yy in (176, 212): h.rect(qx - 26, yy, 52, 7, "url(#STEEL)", K, .9)
h.rect(qx + 22, 170, 44, 50, "url(#PLAS)", K, 1.3); h.circ(qx + 78, 195, 11, "none", K, 4)
h.ln(qx + 89, 195, qx + 130, 195, K, 2.5)
h.path(f"M{qx+130},180 L{qx+250},188 V202 L{qx+130},210 Z", "url(#PLAS)", K, 1.3)
for i in range(4): h.ln(qx + 145 + i * 25, 190, qx + 160 + i * 25, 200, K, .6)
h.ln(qx + 190, 196, 840, 196, K, 7); h.ln(qx + 190, 196, 840, 196, "#fff", 2.5)
h.path(f"M{qx+190},196 C{qx+160},240 {qx+120},300 {qx+90},380", "none", K, 6)
h.path(f"M{qx+190},196 C{qx+160},240 {qx+120},300 {qx+90},380", "none", "#fff", 2)
h.globo("1", qx + 44, 175, qx + 44, 130); h.globo("2", qx + 190, 188, qx + 200, 140); h.globo("3", qx + 20, 215, qx - 30, 290)
h.globo("4", qx + 115, 320, qx + 175, 340)
h.txt(qx + 190, 360, "COLA / LAZO", 10.5, 700); h.txt(qx + 190, 376, "1,5 m POR RETENCION", 10.5)
h.txt(500, 474, "1 MENSULA 4505 · 2 GRAMPA DE CUÑA 4503", 10.5); h.txt(500, 490, "3 FLEJE + HEBILLA ×2 · 4 COLA", 10.5)
# códigos
y2 = h.codigos(40, 520, [4502, 4504, 4503, 4505],
               extra={4502: "tipo LCT PKS-10CF", 4504: "tipo LCT PKS-30", 4503: "PKD-20 / PRA-1500", 4505: "tipo LCT PKR-20"}, wx=150)
y3 = h.datos(40, y2 + 32, [("SUSPENSION", "200 daN (ET-1005)"), ("RETENCION", "1700 / 1000 daN (ET-1005)"), ("VANO MAXIMO", "40 m (ET-1005)"),
    ("FIJACION EN H°A°", "2 flejes inox 3/4\" con hebilla"), ("FIJACION EN MADERA", "tirafondo MN 520 / bulón de ojo MN 505"),
    ("COLA DE RETENCION", "1,5 m por retención"), ("MODELO", "según conductor: a confirmar (*)")], w=410, c1=150)
h.lista(480, y2 + 32, "DONDE SE USA", [
    "· Red aérea de barrio (piloto y preensamblado):",
    "   suspensión en cada poste intermedio;",
    "   retención en puntas, esquinas y ángulos.",
    "· AP-TC-055: unidad sobre poste (barrio).",
    "· Guía «Tendido aéreo de barrio».",
    "· Calculadora de barrio (red aérea).",
])
h.notas(40, 1010, [
    "ESQUEMAS SIN ESCALA. LAS COTAS DE GRAMPAS Y MENSULAS ESTAN EN EL CATALOGO DEL FABRICANTE: NO ESTAN EN LA APP (*).",
    "LA GRAMPA DE SUSPENSION CUELGA EL HAZ SIN APRETAR LA AISLACION. LA CUÑA DE RETENCION MUERDE EL CONDUCTOR PORTANTE.",
    "(*) MODELOS LCT / METAL-CE (PKS-10CF, PKS-30, PKD-20 / PRA-1500, PKR-20): A CONFIRMAR CON EPEC SEGUN EL CONDUCTOR.",
    "(*) MATERIAL DEL CUERPO DE GRAMPAS Y MENSULAS (PLASTICO / ALEACION): A CONFIRMAR CON LA FICHA DEL FABRICANTE.",
    "EN POSTE DE MADERA NO VA FLEJE: VER MAT-MORSETERIA_AEREA-2 (HERRAJES MN).",
    "FUENTE: CATALOGO LCT DE MORSETERIA PARA LINEAS PREENSAMBLADAS; EPEC ET-1005; FICHA DE LA APP.",
])
# ================= 3D SUSPENSION
def poste(R=95, z0=40, z1=320):
    m.cyl([0, 0, z0], [0, 0, z1], R, "conc", n=40, seg=6, pat="conc3"); m.render()
def flejes(zs, R=95):
    for z in zs: m.ring([0, 0, z], [1, 0, 0], [0, 1, 0], [0, 0, 1], R, R + 3, 0, 19, -55, 145, "inox", n=30); m.render()
h.titulo(890, 62, "VISTA 3D - SUSPENSION", "MENSULA CON 2 FLEJES INOX Y GRAMPA COLGANDO EL HAZ PREENSAMBLADO")
h.iso(.7, 1170, 400)
poste()
flejes([150, 230])
m.box(95, 230, -22, 22, 140, 260, "pvcg", edge="#555"); m.render()
m.cyl([230, -14, 200], [255, -14, 170], 6, "galv", n=12); m.cyl([255, -14, 170], [255, -14, 130], 6, "galv", n=12); m.render()
for dyy in (-8, 8): m.cyl([255, -190, 108 + dyy], [255, -30, 108 + dyy], 9, "negro", n=14, seg=4); m.render()
m.box(225, 285, -30, 30, 95, 130, "pvcg", edge="#555"); m.render()
for dyy in (-8, 8): m.cyl([255, -30, 108 + dyy], [255, 300, 108 + dyy], 9, "negro", n=14, seg=8); m.render()
h.g3("1", (160, 22, 230), 1450, 150, "MENSULA DE SUSPENSION 4504")
h.g3("3", (255, 30, 120), 1450, 200, "GRAMPA DE SUSPENSION 4502")
h.g3("4", (60, 75, 240), 1450, 250, "FLEJE INOX 3/4\" + HEBILLA (×2)")
h.g3("5", (255, 220, 108), 1450, 300, "HAZ PREENSAMBLADO / PILOTO")
h.g3("6", (0, 95, 80), 1450, 350, "POSTE DE H°A°")
# ================= 3D RETENCION
h.titulo(890, 560, "VISTA 3D - RETENCION EN PUNTA", "MENSULA, GRAMPA DE CUÑA Y COLA DE 1,5 m")
h.iso(.7, 1150, 900)
poste()
flejes([150, 210])
m.box(95, 150, -25, 25, 140, 230, "pvcg", edge="#555"); m.render()
m.ring([165, 0, 185], [1, 0, 0], [0, 0, 1], [0, 1, 0], 12, 18, -3, 3, 0, 360, "galv", n=24); m.render()
m.cyl([183, 0, 185], [230, 0, 185], 3, "inox", n=8); m.render()
m.box(230, 380, -14, 14, 172, 198, "pvcg", edge="#555"); m.render()
m.cyl([380, 0, 185], [620, 0, 185], 10, "negro", n=14, seg=6); m.render()
m.cyl([260, 0, 172], [220, 120, 80], 10, "negro", n=14, seg=4); m.cyl([220, 120, 80], [210, 170, 0], 10, "negro", n=14, seg=4); m.render()
h.g3("1", (120, 25, 230), 1450, 650, "MENSULA DE RETENCION 4505")
h.g3("2", (300, 14, 198), 1450, 700, "GRAMPA DE CUÑA 4503")
h.g3("4", (220, 120, 80), 1450, 750, "COLA / LAZO 1,5 m")
h.g3("5", (560, 0, 195), 1450, 800, "PORTANTE AL VANO")
h.rotulo(890, h.H - 150, 750, "MAT-MORSETERIA_AEREA-1", "SUSPENSION Y RETENCION", "DE LINEA PREENSAMBLADA", "ESQUEMAS, DATOS Y 3D", "S/E", "ESQUEMAS Y 3D")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_morseteria_aerea_1.svg")); print("ok")
