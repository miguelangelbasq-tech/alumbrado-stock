from aereo_kit import *
ID = "tendido_aereo_barrio"; TOT = 4
TIT = "CÓMO SE HACE · TENDIDO AÉREO Y TRANSICIÓN"
SUB = "Piloto / preensamblado de barrio · ET-1005 · AP-TC-024 · AP-TC-004 · ítems 6.04, 6.07, 6.08 · riesgo ALTO"
PIE = "EMA · Alumbrado Público · Borrador: a confirmar con EPEC (ET-1005) y los planos AP-TC-024 / AP-TC-004 oficiales · (*) a confirmar"
pag = lambda n: pagina(n, TOT, TIT, SUB, PIE)
RP = 110


def badge(h, p, t, col):
    x, y = h.P(*p); h.circ(x, y - 12, 9, col, "#fff", 1.4); h.txt(x, y - 8, t, 10, 800, "#fff", "middle", INT)


def poste_linea(h, x, y, z1=8000, r=450, col="#b9b5ad"):
    tubo(h, (x, y, 0), (x, y, z1), r, col, "#e6e2da", cap="butt")


def haz_y(h, x, y0, y1, z, r=12):
    for dx, dz in ((-r, -r), (r, -r), (-r, r), (r, r)):
        cable(h, [(x + dx, y0, z + dz), (x + dx, y1, z + dz)], r * .95, "#1a1a1a", "#5d5d5d")


def fleje(h, z, x=0, y=0, r=RP): anillo(h, x, y, z, r + 6, "#e4e9ee", 4)


# ================= HOJA 1
h = pag(1)


def datos(y):
    h.txt(40, y + 26, "DATOS (ET-1005, FICHAS DE LA APP)", 15, 800, "#28285E", "start", INT)
    h.tabla(40, y + 36, [(250, "l", False), (300, "l", True)],
            [("DATO", "VALOR"), ("Vano máximo", "40 m"), ("Grampa de suspensión", "200 daN"), ("Grampa de retención", "1700 / 1000 daN"),
             ("Cola en cada retención", "1,5 m"), ("PAT del neutro", "cada 200 m, &lt; 5 Ω")], rowh=20)


antes(h, [("🚧 Autorización", "Coordinado con EPEC; los cruces de calle con corte de tránsito y balizamiento."),
          ("🦺 EPP", "Casco con barbijo, guantes dieléctricos, anteojos, ropa ignífuga, arnés en altura, chaleco reflectivo."),
          ("🛠 Herramientas", "Hidrogrúa, roldanas de tendido, malacate o tirfor, dinamómetro, flejadora, cuñas separadoras.")],
      [("1501", "Piloto Al-Al 1×25 (o 1502 / 1503 preensamblado)"), ("4502", "Grampa de suspensión"), ("4504", "Ménsula de suspensión"),
       ("4503", "Grampa de retención"), ("4505", "Ménsula de retención"), ("4024", "Fleje inox 3/4\" y 4025 hebillas"), ("4031", "Capuchón por punta"),
       ("5501", "Caño H°G° 2\" × 6,4 m (transición)"), ("5502", "Pipeta")], extra=datos)
X = W / 2 + 18
py = panel(h, X, 1, "Revisá vanos y retenciones", ["Vano máximo 40 m (ET-1005).", "Retención en puntas, esquinas y ángulos; suspensión en el resto.", "Marcá en el plano de la obra qué lleva cada poste."],
           ojo="Si un vano pasa los 40 m hace falta otro poste: revisá la cantidad antes de pedir material.", control="Cada poste marcado R (retención) o S (suspensión) y los vanos medidos.")
h.iso(.0039, X + 30, py + 175)
h.BOX(56000, 64000, -29000, -4000, -400, 0, "url(#grass)", "url(#soil3)", "url(#soil3)", "#3a2a1a", .5)
h.BOX(-4000, 64000, -4000, 4000, -400, 0, "url(#grass)", "url(#soil3)", "url(#soil3)", "#3a2a1a", .5)
P = [(0, 0), (30000, 0), (60000, 0), (60000, -25000)]
for (x, y), t_ in zip(P[3:], "R"): poste_linea(h, x, y, r=650)
for i in range(3):
    a, b = P[i], P[i + 1]; cable(h, comba((a[0], a[1], 7500), (b[0], b[1], 7500), 700), 250, "#1a1a1a", None)
for (x, y), t_ in zip(P[:3], "RSR"): poste_linea(h, x, y, r=650)
for (x, y), t_ in zip(P, "RSRR"): badge(h, (x, y, 9000), t_, "#c62828" if t_ == "R" else "#16a34a")
g(h, (15000, 0, 7100), X + 40, py + 50, "vano ≤ 40 m")
g(h, (60000, 0, 7000), X + 190, py + 50, "esquina: retención")
g(h, (30000, 0, 2500), X + 20, py + 290, "intermedio: suspensión")
px, py2 = X + 338, py
xs = [px + 30, px + 110, px + 180]; yl = py2 + 210
h.ln(xs[0], yl, xs[2], yl, K, 1.4); h.ln(xs[2], yl, xs[2], py2 + 80, K, 1.4)
for (x, y), t in zip(((xs[0], yl), (xs[1], yl), (xs[2], yl), (xs[2], py2 + 80)), "RSRR"):
    h.circ(x, y, 6, "#fff", K, 1.2); h.txt(x - 14 if y != yl else x, y + 4 if y != yl else y - 12, t, 10, 700, K, "middle")
h.dimH(yl + 30, xs[0], xs[1], "≤ 40000"); h.dimH(yl + 30, xs[1], xs[2], "≤ 40000")
h.dimV(xs[2] + 18, py2 + 80, yl, "≤ 40000")
h.txt(px + 14, py2 + 262, "R = RETENCIÓN · S = SUSPENSIÓN", 9, 700)
h.txt(px + 106, py2 + 290, "PLANTA DEL TENDIDO", 10, 700, K, "middle")
h.guardar(f"{ID}_p1.svg")

# ================= HOJA 2: pasos 2 y 3
h = pag(2)
X = 40
py = panel(h, X, 2, "Colocá ménsulas y grampas", ["En H°A°: 2 flejes inox con hebilla por ménsula.", "En madera: tirafondo (suspensión) o bulón de ojo (retención).", "La grampa de suspensión cuelga el haz sin apretar la aislación."],
           ojo="(*) Modelos exactos de grampas y ménsulas que acepta EPEC: a confirmar. Altura de la ménsula: según el plano.", control="Ménsula firme (no gira), flejes con hebilla cerrada.")
h.iso(.2, X + 120, py + 165)
poste(h, 0, 0, -450, 600, RP + 3, RP - 3, "hA")
h.BOX(RP - 10, RP + 30, -40, 40, 60, 320, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .6)
for z in (110, 270): fleje(h, z)
haz_y(h, 400, -550, 550, 60, 13)
h.BOX(RP + 30, 420, -25, 25, 240, 290, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .6)
tubo(h, (400, 0, 240), (400, 0, 150), 10, "#c9d1d8", "#eef2f5")
h.BOX(370, 430, -60, 60, 85, 150, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .6)
g(h, (420, 0, 290), X + 180, py + 40, "ménsula de suspensión")
g(h, (430, 60, 125), X + 215, py + 110, "grampa")
g(h, (0, RP + 6, 110), X + 15, py + 270, "2 flejes inox + hebilla")
g(h, (400, 450, 60), X + 215, py + 260, "haz / piloto")
px, py2 = X + 338, py
cx = px + 45
h.rect(cx - 22, py2 + 40, 44, 230, "url(#CONCP)", K, 1.2)
h.rect(cx + 22, py2 + 100, 8, 70, "#fff", K, 1); h.rect(cx + 30, py2 + 110, 80, 12, "url(#ANSI31)", K, 1)
for y in (py2 + 106, py2 + 160): h.rect(cx - 26, y - 3, 56, 6, "#fff", K, 1)
h.ln(cx + 100, py2 + 122, cx + 100, py2 + 150, K, 1.2); h.rect(cx + 88, py2 + 150, 24, 14, "#fff", K, 1.2)
h.circ(cx + 100, py2 + 176, 12, "#fff", K, 1.2); h.cable(cx + 100, py2 + 176, 10)
h.txt(cx + 34, py2 + 100, "MÉNSULA", 8.5, 700); h.txt(cx + 118, py2 + 161, "GRAMPA", 8.5, 700)
h.txt(cx + 36, py2 + 210, "2 FLEJES INOX 3/4\"", 8.5, 700)
h.txt(cx + 36, py2 + 236, "MADERA: TIRAFONDO", 8.5, 700); h.txt(cx + 36, py2 + 250, "O BULÓN DE OJO", 8.5, 700)
h.txt(px + 106, py2 + 290, "SUSPENSIÓN EN POSTE H°A°", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 3, "Tendé con roldanas", ["Colgá una roldana en cada poste.", "Tendé sobre roldanas, sin arrastrar el cable por el piso.", "Tirá con malacate o tirfor, parejo y sin tirones."],
           ojo="Un cable arrastrado por el piso o rozando ramas pierde la aislación: va al rechazo.", control="Cable siempre en el aire, sobre las roldanas, sin raspones.")
h.iso(.0042, X + 38, py + 128)
h.BOX(-6000, 66000, -4000, 4000, -400, 0, "url(#grass)", "url(#soil3)", "url(#soil3)", "#3a2a1a", .5)
xs = (0, 30000, 60000)
for x in xs: poste_linea(h, x, 0)
pts = [(-4000, 2500, 900)]
for x in xs: pts += [(x - 2000, 0, 7300), (x + 2000, 0, 7300)]
pts += [(64000, 0, 5000)]
cable(h, pts, 120, "#1a1a1a", None)
for x in xs:
    a = h.P(x, 0, 7550); h.circ(a[0], a[1], 7, "#facc15", "#713f12", 1.4); h.circ(a[0], a[1], 2, "#713f12", "#713f12", 0)
b = h.P(-4500, 2500, 600); h.a(f'<ellipse cx="{b[0]:.1f}" cy="{b[1]:.1f}" rx="10" ry="16" fill="#b7814a" stroke="#5c3a1a" stroke-width="1.2"/>'); h.a(f'<ellipse cx="{b[0]+6:.1f}" cy="{b[1]:.1f}" rx="10" ry="16" fill="#d29a5d" stroke="#5c3a1a" stroke-width="1.2"/>')
m = h.P(64000, 0, 5000); flecha(h, m[0] - 20, m[1] - 10, m[0] + 12, m[1] + 6, "#c2410c")
g(h, (30000, 0, 7550), X + 150, py + 40, "roldana en cada poste")
g(h, (-4500, 2500, 600), X + 20, py + 270, "bobina")
g(h, (64000, 0, 5000), X + 60, py + 292, "tiro (malacate / tirfor)")
px, py2 = X + 338, py
gy = py2 + 230
h.ln(px + 8, gy, px + 204, gy, K, 1.4)
for x in (px + 40, px + 106, px + 172):
    h.rect(x - 4, gy - 150, 8, 150, "#fff", K, 1.1); h.circ(x, gy - 156, 7, "#fff", K, 1.2)
h.path(f"M{px+14},{gy-10} L{px+33},{gy-163} L{px+179},{gy-163} L{px+204},{gy-120}", "none", K, 1.6)
h.txt(px + 106, gy - 176, "ROLDANAS", 9, 700, K, "middle")
h.txt(px + 14, gy + 18, "BOBINA", 9, 700); h.txt(px + 204, gy + 18, "TIRO", 9, 700, K, "end")
h.txt(px + 106, py2 + 290, "TENDIDO SOBRE ROLDANAS", 10, 700, K, "middle")
h.guardar(f"{ID}_p2.svg")

# ================= HOJA 3: pasos 4 y 5
h = pag(3)
X = 40
py = panel(h, X, 4, "Tensá y dejá la cola", ["Tensá con dinamómetro en las retenciones.", "La grampa de cuña muerde el conductor portante.", "Dejá 1,5 m de cola por retención, con capuchón en la punta."],
           ojo="(*) La tensión de tendido (según vano y temperatura) la da la tabla de EPEC: a confirmar. No pases la carga de la grampa (retención 1700 / 1000 daN).", control="Dinamómetro en el valor de la tabla, cola de 1,5 m con capuchón. Foto de cada retención.")
h.iso(.14, X + 175, py + 140)
poste(h, 0, 0, -900, 700, RP + 3, RP - 3, "hA")
h.BOX(-40, 40, RP - 10, RP + 30, 220, 480, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .6)
for z in (260, 440): fleje(h, z)
h.BOX(-20, 20, RP + 30, 260, 330, 370, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .6)
h.BOX(-35, 35, 260, 520, 300, 400, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .6)
cable(h, [(0, 520, 350), (0, 850, 320), (0, 1250, 280)], 14, "#1a1a1a", "#666")
cable(h, [(0, 260, 340), (60, 200, 300), (150, 220, 0), (160, 260, -450), (170, 300, -640)], 12, "#1a1a1a", "#666")
h.tuboZ(-710, -640, 170, 300, 16, 16, "#2a2a2a", "#000")
d = h.P(0, 850, 320); h.rect(d[0] - 14, d[1] - 12, 28, 16, "#f97316", "#7c2d12", 1, 'rx="3"'); h.txt(d[0], d[1] + 1, "daN", 8, 800, "#fff", "middle", INT)
e = h.P(0, 1250, 280); flecha(h, e[0] + 8, e[1] - 6, e[0] - 20, e[1] + 8, "#c2410c")
g(h, (0, 400, 400), X + 150, py + 40, "grampa de retención (cuña)")
g(h, (0, RP + 30, 480), X + 15, py + 110, "ménsula + 2 flejes")
g(h, (0, 850, 320), X + 15, py + 200, "dinamómetro")
g(h, (170, 300, -690), X + 200, py + 285, "cola 1,5 m + capuchón")
px, py2 = X + 338, py
cx = px + 150
h.rect(cx - 16, py2 + 30, 32, 240, "url(#CONCP)", K, 1.2)
h.rect(cx - 38, py2 + 80, 22, 26, "url(#ANSI31)", K, 1); h.rect(cx - 74, py2 + 84, 36, 18, "#fff", K, 1.2)
h.ln(cx - 74, py2 + 93, px + 8, py2 + 93, K, 2)
h.path(f"M{cx-16},{py2+93} C{cx+10},{py2+100} {cx+24},{py2+120} {cx+26},{py2+150} L{cx+26},{py2+230}", "none", K, 1.6)
h.rect(cx + 20, py2 + 230, 12, 10, "#fff", K, 1.2)
h.dimV(cx + 48, py2 + 93, py2 + 240, "COLA 1500")
h.txt(px + 10, py2 + 84, "TIRO", 9, 700); h.txt(cx - 76, py2 + 120, "GRAMPA", 8.5, 700, K, "end")
h.txt(px + 10, py2 + 260, "1700 / 1000 daN", 9, 700)
h.txt(px + 106, py2 + 290, "RETENCIÓN EN PUNTA", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 5, "Transición al subterráneo", ["Caño H°G° 2\" × 6,4 m con pipeta arriba y 3 flejes.", "Sellá las bocas con espuma; abajo sigue en PEAD Ø50 hasta la zanja.", "Toma de la red con morsetos, uno por conductor (AP-TC-024)."],
           ojo="(*) Altura de la pipeta respecto de la red, altura de los flejes y unión caño-PEAD: sin plano oficial, a confirmar.", control="Caño a plomo con 3 flejes, pipeta y bocas selladas, PEAD hasta la zanja.")
h.iso(.028, X + 110, py + 232)
h.BOX(-1000, 2000, -1000, 0, -700, 0, "url(#vereda)", "url(#soil3)", "url(#soil3)")
h.BOX(-1000, 0, 0, 1000, -700, 0, "url(#vereda)", "url(#soil3)", "url(#soil3)")
h.BOX(800, 2000, 0, 400, -700, -450, "url(#sand3)", "url(#sand3)", "url(#sand3)", "#a8873a", .5)
cable(h, [(RP + 60, 60, -450), (RP + 200, 60, -500), (2000, 60, -500)], 25, "#111", "#555")
poste(h, 0, 0, -700, 7600, RP + 20, RP - 10, "hA")
h.tuboZ(-450, 6400, RP + 60, 60, 30, 30, "url(#galv)", "#444")
for z in (1500, 3500, 5500): fleje(h, z, 0, 0, RP + 40)
pi = h.P(RP + 60, 60, 6400); h.path(f"M{pi[0]:.1f},{pi[1]:.1f} c0,-14 14,-18 20,-8", "none", "#555", 5); h.path(f"M{pi[0]:.1f},{pi[1]:.1f} c0,-14 14,-18 20,-8", "none", "#dfe6ec", 3)
haz_y(h, RP + 250, -1500, 900, 7200, 25)
cable(h, [(RP + 250, 0, 7150), (RP + 200, 40, 6800), (RP + 80, 60, 6500)], 18, "#222")
g(h, (RP + 60, 60, 6400), X + 20, py + 60, "pipeta")
g(h, (RP + 60, 60, 3000), X + 200, py + 150, "caño H°G° 2\"")
g(h, (0, RP + 40, 1500), X + 20, py + 180, "3 flejes inox")
g(h, (1600, 60, -500), X + 200, py + 230, "PEAD Ø50")
g(h, (RP + 250, -1300, 7200), X + 200, py + 40, "red de barrio")
px, py2 = X + 338, py
gy = py2 + 220; k = .024
h.ln(px + 8, gy, px + 204, gy, K, 1.4); h.rect(px + 8, gy, 196, 50, "url(#EARTH)", K, 0)
h.rect(px + 40, gy - 7600 * k, 20, 7600 * k + 30, "url(#CONCP)", K, 1.1)
h.rect(px + 60, gy - 6400 * k, 6, 6400 * k + 18, "#fff", K, 1)
h.path(f"M{px+63},{gy-6400*k} c0,-8 8,-10 12,-4", "none", K, 1.2)
for z in (1500, 3500, 5500): h.rect(px + 36, gy - z * k - 2, 34, 4, "#fff", K, .8)
h.path(f"M{px+63},{gy+18} q0,12 12,12 L{px+200},{gy+30}", "none", K, 2.4); h.path(f"M{px+63},{gy+18} q0,12 12,12 L{px+200},{gy+30}", "none", "#fff", 1)
h.ln(px + 8, gy - 7400 * k, px + 204, gy - 7400 * k, K, 1.4); h.txt(px + 120, gy - 7400 * k - 4, "RED", 9, 700)
h.dimV(px + 90, gy - 6400 * k, gy, "6400", ext=px + 66)
h.dimV(px + 112, gy - 7400 * k, gy - 6400 * k, "(*)", c=OR, ext=px + 70)
h.txt(px + 200, gy - 6, "PEAD Ø50 · 2000 (*)", 8.5, 700, OR, "end")
h.txt(px + 106, py2 + 290, "VISTA DE FRENTE (AP-TC-024)", 10, 700, K, "middle")
h.guardar(f"{ID}_p3.svg")

# ================= HOJA 4: paso 6 + así queda
h = pag(4)
X = 40
py = panel(h, X, 6, "PAT del neutro cada 200 m", ["ET-1005: neutro a tierra cada 200 m como máximo, &lt; 5 Ω.", "Jabalina al pie del poste y bajada del neutro por el poste.", "Medí y anotá cada una."],
           ojo="(*) Cable de la bajada del neutro y su protección: a confirmar con AP-TC-004 / EPEC. Medí sin tensión.", control="Una PAT cada 200 m como máximo, todas &lt; 5 Ω y anotadas.")
h.iso(.055, X + 160, py + 160)
h.BOX(-1200, 1200, -1200, 0, -1700, 0, "url(#vereda)", "url(#soil3)", "url(#soil3)")
h.BOX(-1200, 0, 0, 1200, -1700, 0, "url(#vereda)", "url(#soil3)", "url(#soil3)")
poste(h, 0, 0, -1400, 2400, RP + 20, RP + 10, "hA")
h.tuboZ(-1650, -300, 950, 350, 20, 20, "url(#cobre)", "#7a4512")
h.BOX(915, 985, 315, 385, -340, -260, "url(#bronce)", "url(#bronce)", "url(#bronce)", "#5c3a00", .6)
cable(h, [(950, 385, -290), (500, 250, -100), (RP + 15, 80, 0), (RP + 15, 80, 2400)], 25, "url(#pe)", None)
a = h.P(0, 0, 2400); h.txt(a[0] + 18, a[1] - 4, "⋮ al neutro de la red", 11, 700, "#4B5670", "start", INT)
g(h, (950, 350, -1100), X + 245, py + 280, "jabalina")
g(h, (985, 385, -300), X + 245, py + 205, "tomacable")
g(h, (RP + 15, 80, 1500), X + 15, py + 105, "bajada del neutro (*)")
h.txt(X + 15, py + 50, "una cada", 12, 800, "#c2410c", "start", INT); h.txt(X + 15, py + 66, "200 m como máx.", 12, 800, "#c2410c", "start", INT)
px, py2 = X + 338, py
yl = py2 + 110
h.ln(px + 10, yl, px + 202, yl, K, 1.6)
for x in (px + 14, px + 62, px + 110, px + 158, px + 198): h.circ(x, yl, 4, "#fff", K, 1.1)
for x in (px + 14, px + 198):
    h.ln(x, yl + 4, x, yl + 30, K, 1); h.ln(x - 8, yl + 30, x + 8, yl + 30, K, 1.4); h.ln(x - 5, yl + 34, x + 5, yl + 34, K, 1.2); h.ln(x - 2, yl + 38, x + 2, yl + 38, K, 1)
h.dimH(yl - 26, px + 14, px + 198, "≤ 200000")
h.txt(px + 106, yl + 70, "R &lt; 5 Ω EN CADA PAT", 10, 700, K, "middle")
h.txt(px + 106, py2 + 290, "PLANTA DE LA LÍNEA", 10, 700, K, "middle")
X = W / 2 + 18
asi_queda(h, X, "../hojas/ap_tc_024.png", (1310, 160, 2482, 926), "Plano: AP-TC-024 (transición) · AP-TC-004 · ET-1005.", "guía «Luminaria aérea de barrio» (AP-TC-055).",
          "Vanos ≤ 40 m, grampas firmes, haz sin rozar ramas ni otras líneas, colas con capuchón, transición sellada, PAT de neutro medidas. Foto de cada retención.",
          ["modelos exactos de grampas y ménsulas que acepta EPEC.", "plano oficial AP-TC-024 y AP-TC-004."], nombre=f"{ID}_fin.png")
h.guardar(f"{ID}_p4.svg")
print("ok")
