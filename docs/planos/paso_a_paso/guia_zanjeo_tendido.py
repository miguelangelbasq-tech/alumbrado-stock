"""Guía paso a paso «Zanjeo troncal y tendido de cable» (GUIAS_OBRA id zanjeo_tendido · plano AP-TC-001).
Texto: guía de la app (v130). Medidas: ficha AP-TC-001, hoja ap_tc_001, CLAUDE.md §11.3."""
from k4kit import *
ID = "zanjeo_tendido"; TOT = 5
TIT = "ZANJEO TRONCAL Y TENDIDO DE CABLE"; SUB = "Plano AP-TC-001 · zanja de 1 cable (0,20 m) · riesgo medio"; PL = "AP-TC-001"
def pag(n): return pagina(n, TOT, TIT, SUB, PL)
# ---- escena 3D (mm): zanja a lo largo de x
L = 1400; AZ = 200; PZ = 750; YB = -450; YF = AZ + 450; XF = 900
S = .13
def base(h, X, py, etapa):
    ox, oy = X + 98, py + 64
    h.iso(S, ox, oy)
    soil = ("url(#grass)", "url(#soil3)", "url(#soil3)")
    prof = -PZ if etapa >= 2 else -350
    h.BOX(0, L, YB, 0, -950, 0, *soil)                        # barranca de atrás
    h.BOX(0, L, 0, AZ, -950, prof, "url(#soil3)", "url(#soil3)", "url(#soil3)")   # fondo
    return prof
def frente(h, etapa):
    soil = ("url(#grass)", "url(#soil3)", "url(#soil3)")
    h.BOX(0, XF, AZ, YF, -950, 0, *soil)
def arena(h, z0, z1, x1=L):
    h.BOX(0, x1, 0, AZ, z0, z1, "url(#sand3)", "url(#sand3)", "url(#sand3)", "#8a6d2a", .6)
def cable(h, x1=L + 90, corte=True):
    zc = -700 + 14
    cubierta3(h, [(0, 100, zc), (x1, 100, zc)], 14 * S * 1.9 + 1.5)
    if corte:
        x, y = h.P(x1, 100, zc); cara_cable(h, x + 1, y, 6.5)
def ladrillos(h, x1=L):
    x = 0
    while x < x1 - 1:
        xe = min(x + 250, x1)
        h.BOX(x, xe - 4, 40, 160, -600, -545, "#e58466", "#c4593d", "#a94b33", "#5a2414", .6)
        x += 250
def relleno(h, z0, z1, x1):
    h.BOX(0, x1, 0, AZ, z0, z1, "#b8946a", "url(#soil3)", "url(#soil3)", "#3a2a1a", .6)
def malla(h, z, x1):
    h.F3([(0, 5, z), (x1, 5, z), (x1, AZ - 5, z), (0, AZ - 5, z)], "url(#mesh)", "#ea580c", .8)
# ---- plano: corte transversal de la zanja, k=0.27
def plano(h, X, py, etapa, titulo):
    k = .27; cx = X + 338 + 106; top = py + 58; w = AZ * k; d = PZ * k
    prof = d if etapa >= 2 else 350 * k
    h.rect(cx - w / 2 - 40, top, 40, d + 12, "url(#EARTH)", K, 0); h.rect(cx + w / 2, top, 40, d + 12, "url(#EARTH)", K, 0)
    h.rect(cx - w / 2, top + prof, w, d + 12 - prof, "url(#EARTH)", K, 0)
    h.path(f"M{cx-w/2-40},{top} H{cx-w/2} V{top+prof} H{cx+w/2} V{top} H{cx+w/2+40}", "none", K, 1.3)
    def capa(z0, z1, fill):   # z en mm desde el fondo hacia arriba (0 = fondo)
        h.rect(cx - w / 2, top + d - z1 * k, w, (z1 - z0) * k, fill, K, .6)
    if etapa >= 3: capa(0, 50, "url(#SAND)")
    if etapa >= 5: capa(50, 150, "url(#SAND)")
    if etapa >= 4: h.cable(cx, top + d - 75 * k, 13 * k * 1.2 + 2, False, False)
    if etapa >= 5: h.rect(cx - 60 * k, top + d - 205 * k, 120 * k, 55 * k, "url(#ANSI31)", K, .7)
    if etapa >= 6:
        h.rect(cx - w / 2, top, w, d - 205 * k, "url(#ANSI37)", K, .5)
        for z in range(205 + 150, PZ, 150): h.ln(cx - w / 2, top + d - z * k, cx + w / 2, top + d - z * k, K, .4, h.OCULTA)
        h.ln(cx - w / 2 + 2, top + 300 * k, cx + w / 2 - 2, top + 300 * k, K, 1.4, h.MALLA)
    h.txt(cx, py + 292, titulo, 10, 700, K, "middle")
    return cx, top, w, d, k
# ===================== HOJA 1
h = pag(1)
d = dict(epp="Casco, guantes, calzado, chaleco reflectivo.",
         aut="Liberación de traza y verificación de otros servicios (gas, agua, cloacas, datos).",
         her="Pala (excavación manual, ETG 3.1), pisón, cinta métrica, conos y vallas.",
         mat=[("8003", "Arena fina (5 cm abajo + 5 cm arriba del cable)"), ("8016", "Ladrillo común 25 × 12 × 5 — 4 por metro"),
              ("8017", "Malla de advertencia «Peligro eléctrico» de 30 cm"), ("6001…", "Cable Cu XLPE/PVC IRAM 2178-1 (típico 4 × 2,5; sección según cálculo)"),
              ("5005", "Caño PEAD Ø50 (bajo vereda u hormigón)")])
d["mat"][3] = ("S/CALC.", d["mat"][3][1])
def medidas(y):
    h.txt(40, y, "MEDIDAS DE LA ZANJA", 14, 800, "#28285E", "start", INT)
    h.tabla(40, y + 12, [(150, "c", False), (130, "c", True), (130, "c", True), (140, "c", True)],
            [("CABLES EN LA ZANJA", "ANCHO", "TAPADA", "EXCAVACIÓN"), ("1", "0,20 m", "0,60 m", "≈ 0,75 m"), ("2", "0,40 m", "0,60 m", "≈ 0,75 m"), ("3", "0,60 m", "0,60 m", "≈ 0,75 m")], rowh=24)
    h.txt(40, y + 124, "Excavación = tapada 0,60 + paquete de arena 0,15.", 12.5, 500, "#4B5670", "start", INT); h.txt(40, y + 142, "Si el proyecto pide 1,00 m de tapada, manda el proyecto.", 12.5, 500, "#4B5670", "start", INT)
antes(h, 40, d, medidas)
X = W / 2 + 18
py = panel(h, X, 1, "Balizá y excavá a mano",
           ["Conos y vallas antes de empezar, a los dos lados de la traza.", "Excavación manual con pala (ETG 3.1).",
            "Si aparece otro servicio (gas, agua, cloacas, datos), pará y avisá."],
           ojo="Sin liberación de traza no se excava. Zanja abierta = zanja balizada.",
           control="Traza marcada y vallada en todo el tramo que se abre hoy.")
base(h, X, py, 1)
frente(h, 1)
# vallas (cinta) sobre la barranca de atrás y del frente + conos
for (a1, b1) in (((60, -380, 0), (L - 40, -380, 0)), ((60, YF - 60, 0), (XF - 20, YF - 60, 0))):
    pa = h.P(a1[0], a1[1], 230); pb = h.P(b1[0], b1[1], 230)
    for p0 in (a1, b1):
        q0 = h.P(*p0); q1 = h.P(p0[0], p0[1], 260); h.ln(*q0, *q1, "#8a5a2b", 2.6)
    h.ln(*pa, *pb, "#e11d48", 3, 'stroke-dasharray="7 7"'); h.ln(*pa, *pb, "#fff", 3, 'stroke-dasharray="7 7" stroke-dashoffset="7"')
for p in ((250, AZ + 250, 0), (650, AZ + 250, 0)):
    x, y = h.P(*p); cono(h, x, y, .8)
# pala clavada en el fondo
a1 = h.P(1100, 120, -350); b1 = h.P(1100, 120, 350)
h.ln(*a1, *b1, "#8a5a2b", 3.2); poly(h, [(a1[0] - 6, a1[1] - 2), (a1[0] + 6, a1[1] - 2), (a1[0] + 5, a1[1] + 12), (a1[0] - 5, a1[1] + 12)], "url(#galv)", "#333", .7)
h.ln(b1[0] - 6, b1[1], b1[0] + 6, b1[1], "#333", 3)
g(h, (1000, -380, 230), X + 236, py + 34, "vallas y cinta")
g(h, (250, AZ + 250, 150), X + 14, py + 34, "conos")
g(h, (1100, 120, -100), X + 236, py + 280, "pala (a mano)")
g(h, (700, 100, -350), X + 14, py + 292, "excavando")
# plano: planta de la traza balizada
k = .3; cx, cy = X + 338 + 106, py + 150
h.rect(cx - 90, cy - AZ * k / 2, 180, AZ * k, "#fff", K, 1.3)
for yy in (cy - 70, cy + 70):
    h.ln(cx - 95, yy, cx + 95, yy, K, 1.1, 'stroke-dasharray="6 4"')
    for xx in (cx - 95, cx - 30, cx + 35, cx + 95): h.circ(xx, yy, 3, "#fff", K, .9)
h.ln(cx - 100, cy - 12, cx + 100, cy - 12, K, .5, h.EJE)
h.dimV(cx + 100, cy - AZ * k / 2, cy + AZ * k / 2, "200", ext=cx + 90); h.txt(cx, cy + 4, "ZANJA", 10, 700, K, "middle")
h.txt(cx, cy - 82, "VALLA / CINTA", 9.5, 700, K, "middle"); h.txt(cx, cy + 90, "VALLA / CINTA", 9.5, 700, K, "middle")
h.txt(cx, py + 290, "PLANTA · TRAZA BALIZADA", 10, 700, K, "middle")
h.guardar(f"{ID}_p1.svg")
# ===================== HOJA 2: pasos 2 y 3
h = pag(2)
X = 40
py = panel(h, X, 2, "Medidas de la zanja",
           ["Ancho: 0,20 m (1 cable) · 0,40 m (2) · 0,60 m (3).",
            "Tapada 0,60 m sobre el cable (o 1,00 m si lo pide el proyecto) + 0,15 m del paquete de arena: ≈ 0,75 m.",
            "Paredes derechas; la tierra a un costado, lejos del borde."],
           ojo="(*) Profundidad: la ETG pide 0,60 m y algunos proyectos 1,00 m → manda el proyecto.",
           control="Medí ancho y profundidad con la cinta en varios puntos (foto con la cinta).")
base(h, X, py, 2)
frente(h, 2)
a1 = h.P(L, 30, 0); b1 = h.P(L, 30, -PZ); h.ln(*a1, *b1, "#f2c230", 4)
a2 = h.P(L, 0, 30); b2 = h.P(L, AZ, 30); h.ln(*a2, *b2, "#f2c230", 4)
h.txt(b1[0] + 6, (a1[1] + b1[1]) / 2 + 8, "0,75", 12, 800, "#5c3a00", "start", INT)
h.txt(b2[0] + 8, b2[1] + 4, "0,20", 12, 800, "#5c3a00", "start", INT)
g(h, (900, 100, -PZ), X + 14, py + 292, "fondo parejo a ≈ 0,75 m")
g(h, (1000, 0, -400), X + 200, py + 30, "paredes derechas")
cx, top, w, dd, k = plano(h, X, py, 2, "CORTE · ZANJA DE 1 CABLE")
h.dimH(top - 10, cx - w / 2, cx + w / 2, "200"); h.dimV(cx + w / 2 + 56, top, top + dd, "750", ext=cx + w / 2 + 2)
h.dimV(cx - w / 2 - 62, top, top + dd - 150 * k, "600", ext=cx - w / 2 - 2); h.dimV(cx - w / 2 - 62, top + dd - 150 * k, top + dd, "150", ext=cx - w / 2 - 2)
h.nivel(cx + w / 2 + 26, top, "±0")
X = W / 2 + 18
py = panel(h, X, 3, "Cama de arena de 5 cm",
           ["Fondo parejo, sin piedras.", "5 cm de arena fina (8003) antes de apoyar el cable.",
            "La calculadora cuenta 5 + 5 cm: 33 kg de arena por metro en zanja de 0,20 m."],
           ojo="Piedras o escombro en el fondo lastiman la cubierta del cable. Sacalos antes de la arena.",
           control="Cama de arena pareja, de 5 cm, en todo el largo.")
base(h, X, py, 3)
arena(h, -PZ, -700)
frente(h, 3)
g(h, (1100, 100, -700), X + 200, py + 285, "cama de arena 5 cm")
g(h, (L, 0, -725), X + 230, py + 245, "fondo sin piedras", "start")
cx, top, w, dd, k = plano(h, X, py, 3, "CORTE · CAMA DE ARENA")
h.dimV(cx + w / 2 + 52, top + dd - 50 * k, top + dd, "50", ext=cx + w / 2 + 2)
h.dimV(cx - w / 2 - 56, top, top + dd, "750", ext=cx - w / 2 - 2); h.dimH(top - 10, cx - w / 2, cx + w / 2, "200")
h.guardar(f"{ID}_p2.svg")
# ===================== HOJA 3: pasos 4 y 5
h = pag(3)
X = 40
py = panel(h, X, 4, "Tendé el cable sin torcerlo",
           ["Desenrollá de la bobina, sin torceduras ni lazos. No lo arrastres sobre piedras.",
            "Dejá la ganancia para subir a cada columna (PRFV: 3,50 + 0,50 = 4 m por subida).",
            "Conductores: L1 marrón · L2 negro · L3 rojo · N celeste. En la bornera: fase gris, neutro celeste, tierra verde."],
           ojo="Si se forma un lazo, no tires: desarmalo a mano. Un lazo tirado daña el cable.",
           control="Cable centrado sobre la arena, sin lazos ni cortes en la cubierta.")
base(h, X, py, 4)
arena(h, -PZ, -700)
cable(h)
frente(h, 4)
# bobina sobre la barranca de atrás, al fondo
bx, by = h.P(1150, -330, 0)
h.a(f'<ellipse cx="{bx:.1f}" cy="{by-20:.1f}" rx="8" ry="20" fill="url(#madera)" stroke="#5a3a17" stroke-width=".8"/>')
h.rect(bx, by - 35, 20, 30, "#222", "#000", .6); h.a(f'<ellipse cx="{bx+20:.1f}" cy="{by-20:.1f}" rx="8" ry="20" fill="url(#madera)" stroke="#5a3a17" stroke-width=".8"/>')
for i in range(4): h.ln(bx + 2, by - 31 + i * 8, bx + 18, by - 31 + i * 8, "#555", .6)
# lupa con el corte del cable
x, y = h.P(L + 90, 100, -686)
zx, zy = X + 62, py + 72
h.ln(x, y, zx + 26, zy + 22, NV, .8, 'stroke-dasharray="3 2"'); h.circ(x, y, 6, "none", NV, .8)
h.circ(zx, zy, 36, "#fff", NV, 1.2); cara_cable(h, zx, zy, 30)
h.txt(zx + 44, zy - 6, "corte del cable:", 11.5, 700, NV, "start", INT); h.txt(zx + 44, zy + 9, "4 conductores y", 11.5, 700, NV, "start", INT); h.txt(zx + 44, zy + 24, "la cuerda de hilos", 11.5, 700, NV, "start", INT)
g2(h, bx + 10, by - 20, X + 236, py + 34, "bobina")
g(h, (1050, 100, -680), X + 14, py + 292, "cable sobre la arena")
cx, top, w, dd, k = plano(h, X, py, 4, "CORTE · CABLE TENDIDO")
h.dimV(cx + w / 2 + 52, top + dd - 75 * k, top + dd, "75", ext=cx + w / 2 + 2)
h.llamadaDet(cx, top + dd - 75 * k, 7, "D1")
cara_cable(h, cx, top + 80, 22); h.txt(cx, top + 116, "D1", 10, 700, K, "middle")
h.txt(cx, py + 278, "D1: 4 × S Cu XLPE · L1 L2 L3 N", 9, 400, K, "middle")
X = W / 2 + 18
py = panel(h, X, 5, "Arena arriba y ladrillos",
           ["5 cm de arena sobre el cable (paquete de 0,15 m).",
            "Ladrillos a lo largo, uno detrás del otro, tapando todos los cables en forma continua: 4 por metro.",
            "Con caño PEAD no va ladrillo."],
           ojo="(*) El plano dibuja el ladrillo de 250 × 120 × 55 y el pañol lo tiene como 25 × 12 × 5: confirmar.",
           control="Ladrillos continuos, sin huecos, sobre todo el ancho de los cables.")
base(h, X, py, 5)
arena(h, -PZ, -700)
arena(h, -700, -600)
x, y = h.P(L, 100, -686); cara_cable(h, x, y, 6.5)
ladrillos(h, 1150)
frente(h, 5)
g(h, (900, 100, -545), X + 200, py + 34, "ladrillos 4 por metro")
g(h, (1300, 60, -600), X + 230, py + 290, "arena 5 cm arriba", "start")
g2(h, x, y, X + 14, py + 292, "cable en la arena")
cx, top, w, dd, k = plano(h, X, py, 5, "CORTE · ARENA Y LADRILLO")
h.dimV(cx + w / 2 + 52, top + dd - 150 * k, top + dd, "150", ext=cx + w / 2 + 2)
h.dimH(top + dd - 215 * k, cx - 60 * k, cx + 60 * k, "120")
h.dimV(cx - w / 2 - 22, top + dd - 205 * k, top + dd - 150 * k, "55", ext=cx - 60 * k)
h.guardar(f"{ID}_p3.svg")
# ===================== HOJA 4: pasos 6 y 7
h = pag(4)
X = 40
py = panel(h, X, 6, "Tapá en capas y poné la malla",
           ["Rellená con la tierra del lugar y compactá con el pisón en capas de 15 cm.",
            "Malla «Peligro eléctrico» de 30 cm (8017) a mitad del relleno: a 0,30 m del nivel del terreno (*)."],
           ojo="(*) Si la malla se mide desde el nivel del terreno o desde el cable: a confirmar con el plano.",
           control="Malla continua a lo largo y relleno compactado capa por capa.")
base(h, X, py, 6)
arena(h, -PZ, -700); arena(h, -700, -600)
ladrillos(h, L)
relleno(h, -545, -450, 1300); relleno(h, -450, -300, 1250)
malla(h, -300, 1170)
relleno(h, -300, -150, 1100); relleno(h, -150, 0, 1000)
frente(h, 6)
for z in (-450, -300):
    a1 = h.P(1150 if z == -450 else 1000, AZ, z)
g(h, (1140, 100, -300), X + 180, py + 34, "malla «Peligro eléctrico»")
g(h, (1275, AZ, -380), X + 220, py + 290, "capas de 15 cm", "start")
g(h, (1050, AZ, -75), X + 14, py + 292, "tierra compactada")
cx, top, w, dd, k = plano(h, X, py, 6, "CORTE · RELLENO Y MALLA")
h.dimV(cx + w / 2 + 52, top, top + 300 * k, "300 (*)", ext=cx + w / 2 + 2, c=OR)
h.txt(cx - w / 2 - 44, top + 300 * k + 4, "MALLA", 9, 700, K, "end")
X = W / 2 + 18
py = panel(h, X, 7, "Cerrá en el día",
           ["La zanja se abre y se cierra el mismo día.",
            "Bajo vereda u hormigón va caño PEAD Ø50 (5005), sin ladrillo.",
            "Reposición de vereda en 48 h: contrapiso 8 cm + mortero 2 cm."],
           ojo="(*) Pegotes de hormigón pobre: el plano los pide al inicio, medio y fin de cada vano; los proyectos, cada 5 o 10 m → manda el proyecto.",
           control="Relleno al nivel del terreno, sin pozos. Foto: «Zanja / tendido».")
h.iso(S, X + 98, py + 64)
# zanja cerrada bajo vereda: contrapiso 8 + mortero 2 en todo
for (y0, y1, x1) in ((YB, 0, L), (0, AZ, L)):
    h.BOX(0, x1, y0, y1, -950, -100, "#b8946a", "url(#soil3)", "url(#soil3)")
    h.BOX(0, x1, y0, y1, -100, -20, "url(#concP3)", "url(#concP3)", "url(#concP3)", "#555", .6)
    h.BOX(0, x1, y0, y1, -20, 0, "#e3dfd6" if y0 < 0 else "#cfcac0", "#c9c4ba", "#c9c4ba", "#555", .6)
h.BOX(0, XF, AZ, YF, -950, -100, "url(#soil3)", "url(#soil3)", "url(#soil3)")
h.BOX(0, XF, AZ, YF, -100, -20, "url(#concP3)", "url(#concP3)", "url(#concP3)", "#555", .6)
h.BOX(0, XF, AZ, YF, -20, 0, "#e3dfd6", "#c9c4ba", "#c9c4ba", "#555", .6)
x, y = h.P(L, 100, -680)
h.circ(x, y, 4, "#111", "#000", .6)
zx, zy = X + 62, py + 72
h.ln(x, y, zx + 26, zy + 22, NV, .8, 'stroke-dasharray="3 2"'); h.circ(x, y, 7, "none", NV, .8)
h.circ(zx, zy, 36, "#fff", NV, 1.2); h.circ(zx, zy, 30, "url(#pead)", "#000", .8); h.circ(zx, zy, 25, "#e8e8e8", "#000", .5); cara_cable(h, zx + 3, zy + 6, 15)
h.txt(zx + 44, zy - 2, "caño PEAD Ø50", 11.5, 700, NV, "start", INT); h.txt(zx + 44, zy + 13, "con el cable adentro", 11.5, 700, NV, "start", INT)
cx0, cy0 = X + 300, py + 40; chk(h, cx0, cy0)
h.txt(cx0 - 16, cy0 + 5, "cerrada hoy", 12, 800, "#14632b", "end", INT)
g(h, (1100, -200, 0), X + 326, py + 112, "mortero 2 cm", "end")
g(h, (L, -200, -60), X + 326, py + 150, "contrapiso 8 cm", "end")
g(h, (L, 100, -400), X + 230, py + 290, "relleno compactado", "start")
# plano: corte bajo vereda
k = .27; cx, top = X + 338 + 106, py + 58; w = AZ * k; dd = PZ * k
h.rect(cx - w / 2 - 40, top, w + 80, dd + 12, "url(#EARTH)", K, 0)
h.rect(cx - w / 2 - 40, top, w + 80, 20 * k + 1, "#fff", K, .8); h.rect(cx - w / 2 - 40, top + 20 * k, w + 80, 80 * k, "url(#CONCP)", K, .8)
h.rect(cx - w / 2, top + 100 * k, w, dd - 100 * k, "url(#ANSI37)", K, .8)
h.rect(cx - w / 2, top + dd - 150 * k, w, 150 * k, "url(#SAND)", K, .6)
h.cano(cx, top + dd - 75 * k, 25 * k, 21 * k); h.circ(cx, top + dd - 75 * k, 6 * k, "#fff", K, .5)
h.dimV(cx + w / 2 + 56, top + 20 * k, top + 100 * k, "80", ext=cx + w / 2 + 40)
h.ln(cx + w / 2 + 40, top, cx + w / 2 + 70, top, K, .4); h.txt(cx + w / 2 + 50, top - 4, "20", 9.5, 400, K, "start")
h.dimV(cx - w / 2 - 50, top + dd - 150 * k, top + dd, "150", ext=cx - w / 2 - 2)
h.dimH(top + dd - 75 * k - 14, cx - 25 * k, cx + 25 * k, "Ø50")
h.txt(cx, py + 290, "CORTE · BAJO VEREDA (PEAD)", 10, 700, K, "middle")
h.guardar(f"{ID}_p4.svg")
# ===================== HOJA 5: cómputo + así queda
h = pag(5)
X = 40
h.txt(X, 128, "CÓMPUTO POR METRO (1 CABLE, ZANJA 0,20)", 18, 800, "#28285E", "start", INT)
h.tabla(X, 146, [(150, "l", False), (130, "c", True), (130, "c", True)],
        [("CONCEPTO", "CANT./m", "CÁLCULO"), ("Excavación", "0,150 m³", "0,20 × 0,75"), ("Arena fina", "0,030 m³", "0,20 × 0,15"),
         ("Ladrillos", "4 u", "1000 / 250"), ("Malla", "1 m", "—"), ("Relleno", "≈ 0,114 m³", "el resto")], rowh=26)
h.txt(X, 326, "Fuente: hoja AP-TC-001. La arena del cuadro es el paquete entero (0,15 m).", 12, 500, "#4B5670", "start", INT)
h.txt(X, 372, "RESUMEN EN 7 PASOS", 18, 800, "#28285E", "start", INT)
res = ["Balizá y excavá a mano", "Medidas: 0,20 / 0,40 / 0,60 × ≈ 0,75 m", "Cama de arena de 5 cm", "Tendé el cable sin torcerlo",
       "5 cm de arena arriba + ladrillos", "Tapá en capas de 15 cm + malla", "Cerrá en el día (PEAD bajo vereda)"]
for i, r in enumerate(res):
    y = 400 + i * 40
    h.circ(X + 16, y, 14, "#28285E", "#28285E", 0); h.txt(X + 16, y + 6, str(i + 1), 15, 800, "#fff", "middle", INT)
    h.txt(X + 42, y + 6, r, 16, 600, "#0D1424", "start", INT)
X = W / 2 + 18
asi_queda(h, X, "k4_zanja_3d.png", "AP-TC-001", "Conexionado de la caja de columna PRFV (borneras BPN)",
          "Profundidad y ancho según el plano, arena abajo y arriba, ladrillos continuos, malla colocada, relleno compactado y zanja cerrada en el día. Foto: «Zanja / tendido».",
          ["Profundidad: ETG 0,60 m vs. algunos proyectos 1,00 m → manda el proyecto."], alto=360)
h.guardar(f"{ID}_p5.svg")
print("ok")
