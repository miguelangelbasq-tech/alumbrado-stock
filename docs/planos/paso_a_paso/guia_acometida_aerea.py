from aereo_kit import *
ID = "acometida_aerea"; TOT = 5
TIT = "CÓMO SE HACE · ACOMETIDA AÉREA"
SUB = "Planos AP-T-018 / AP-T-019 · de la línea de EPEC al tablero · riesgo ALTO"
PIE = "EMA · Alumbrado Público · Las medidas mandan en los planos AP-T-018 y AP-T-019 · (*) a confirmar"
pag = lambda n: pagina(n, TOT, TIT, SUB, PIE)
XE, XA, YP = 1000, 10500, 1500   # poste EPEC y apoyo PRFV (mm); el vano cruza la calle a lo largo de x


def escena_vano(h, X, py, bajada=False, conos=False, cotas=False, s=.0165):
    h.iso(s, X + 100, py + 160)
    h.BOX(0, 2000, 0, 3000, -300, 0, "url(#vereda)", "url(#soil3)", "url(#soil3)")
    h.BOX(2000, 8000, 0, 3000, -300, 0, "url(#asph3)", "url(#soil3)", "url(#soil3)")
    h.BOX(8000, 12000, 0, 3000, -300, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
    h.BOX(1850, 2000, 0, 3000, 0, 150, "url(#conc3)", "url(#conc3)", "url(#conc3)", "#555", .5)
    h.BOX(8000, 8150, 0, 3000, 0, 150, "url(#conc3)", "url(#conc3)", "url(#conc3)", "#555", .5)
    for yy in range(200, 3000, 900): lin3(h, (5000, yy, 1), (5000, yy + 500, 1), "#f5f5f5", 1.5)
    poste(h, XE, YP, 0, 9000, 170, 120, "hA")
    cable(h, [(XE, -500, 8500), (XE, 3500, 8500)], 60, "#1a1a1a")
    poste(h, XA, YP, 0, 8000, 160, 110, "prfv")
    h.BOX(XA - 330, XA - 110, YP - 70, YP + 70, 7350, 7650, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .5)
    h.tuboZ(7400, 7600, XA - 380, YP, 70, 70, "url(#porc)", "#555")
    if bajada:
        pts = comba((XE + 100, YP, 8450), (XA - 380, YP, 7500), 500)
        cable(h, pts + [(XA - 200, YP + 60, 7300), (XA - 60, YP + 180, 6000), (XA, YP + 200, 5600)], 45, "#222")
        h.BOX(XA - 265, XA + 265, YP + 130, YP + 330, 5000, 5530, "#c9cdd1", "url(#gab)", "#aeb2b7", "#555", .6)
        a = h.P(XA, YP + 330, 5330); h.path(f"M{a[0]:.1f},{a[1]-5:.1f} l5,8 h-10 z", "#facc15", "#333", .5)
    if conos:
        cs = ((9300, 300), (11700, 300), (11700, 2700), (9300, 2700))
        for i in range(4):
            pa = cs[i] + (450,); pb = cs[(i + 1) % 4] + (450,)
            if i == 3: continue
            lin3(h, pa, pb, "#e11d48", 2.4, 'stroke-dasharray="6 6"'); lin3(h, pa, pb, "#fff", 2.4, 'stroke-dasharray="6 6" stroke-dashoffset="6"')
        for (cx, cy) in cs:
            h.tuboZ(0, 600, cx, cy, 200, 30, "#f97316", "#7c2d12")
            h.tuboZ(300, 380, cx, cy, 115, 100, "#fff", "#7c2d12")


# ================= HOJA 1
h = pag(1)
y = antes(h, [("🚧 Autorización", "El punto de conexión y el corte se coordinan con EPEC según su procedimiento. Sin autorización no se trabaja en la línea."),
              ("🦺 EPP", "Casco con barbijo, guantes dieléctricos de la clase adecuada, anteojos, ropa ignífuga, arnés en altura."),
              ("🛠 Herramientas", "Hidrogrúa o escalera en buen estado, llave tubo aislada, cuñas separadoras, pinza de compresión, pistola de calor.")],
          [("1027", "Cable Cu autoportante 4×16 XLPE (o 1028 Cu 4×16 LSZH)"), ("4027", "Morseto PKD-14 (Metal-CE 1995/6): 4, uno por conductor"),
           ("4032", "Rack MN 4B2L"), ("4010", "Aislador MN 17"), ("4022", "Semiabrazaderas para el apoyo"),
           ("4031", "Capuchón R15: uno por conductor y por punta (8)"), ("2046", "Terminal ojal 16 mm²: 4"), ("2057", "Termocontraíble: 1 por ojal"),
           ("8010", "Espuma de poliuretano"), ("4015", "Babero de zinguería o PVC apto UV")])
h.txt(40, y + 24, "Apoyo PRFV hl 8 m (AP-T-018) ya plantado: guía aparte.", 13, 600, "#4B5670", "start", INT)
h.txt(40, y + 44, "Fusible NH-00 gL 63 A: según proyecto.", 13, 600, "#4B5670", "start", INT)
X = W / 2 + 18
py = panel(h, X, 1, "Coordiná con EPEC y balizá", ["Confirmá con EPEC el punto de conexión y si el cruce es aéreo.", "Balizá la zona de trabajo y el paso de peatones: conos y cinta alrededor del apoyo y de la hidrogrúa."],
           ojo="Sin autorización de EPEC no se toca la línea. (*) Si se conecta con corte o con tensión, y el EPP exacto: a confirmar con EPEC.",
           control="Autorización en mano y zona balizada antes de subir.")
escena_vano(h, X, py, conos=True)
g(h, (XE, -300, 8500), X + 120, py + 40, "línea EPEC", "start")
g(h, (XA, YP, 6000), X + 290, py + 60, "apoyo PRFV", "middle")
g(h, (9300, 2700, 500), X + 30, py + 250, "conos y cinta")
# plano: planta
px, py2 = X + 338, py
k = .016; ox = px + 20
h.ln(px + 8, py2 + 50, px + 204, py2 + 50, K, 1.6, 'stroke-dasharray="10 3 2 3"'); h.txt(px + 10, py2 + 44, "LÍNEA PREENSAMBLADA EPEC", 8.5, 700)
h.circ(px + 106, py2 + 50, 4, "#fff", K, 1.2)
h.ln(px + 8, py2 + 70, px + 204, py2 + 70, K, 1.2); h.ln(px + 8, py2 + 166, px + 204, py2 + 166, K, 1.2)
h.rect(px + 8, py2 + 70, 196, 96, "url(#ANSI37)", K, 0); h.txt(px + 106, py2 + 122, "CALZADA", 10, 700, K, "middle")
ya = py2 + 166 + 2500 * k * 1.6
h.circ(px + 106, ya, 5, "#fff", K, 1.2)
h.rect(px + 60, ya - 30, 92, 62, "none", K, 1, 'stroke-dasharray="4 3"'); h.txt(px + 106, ya + 46, "ZONA BALIZADA", 9, 700, K, "middle")
h.dimV(px + 175, py2 + 166, ya, "2500")
h.ln(px + 106, py2 + 50, px + 106, ya, K, .6, h.OCULTA)
h.txt(px + 12, ya + 6, "APOYO", 9, 700)
h.txt(px + 106, py2 + 290, "PLANTA DE EMPLAZAMIENTO", 10, 700, K, "middle")
h.guardar(f"{ID}_p1.svg")

# ================= HOJA 2: pasos 2 y 3
h = pag(2)
X = 40
py = panel(h, X, 2, "Revisá que el cable sea el del plano", ["Bajada: Cu 4×16 (autoportante XLPE o LSZH), según AP-T-019 ref. 12.", "4 conductores: L1 marrón, L2 negro, L3 rojo y N celeste.", "Un morseto PKD-14 por conductor: 4."],
           ojo="No se cambia por otro cable sin aprobación de la Inspección.", control="Leé el grabado de la cubierta (Cu 4×16 · XLPE o LSZH) y contá los 4 morsetos.")
h.iso(.9, X + 60, py + 150)
# cable: cubierta negra y conductores que salen con la cuerda de hilos
tubo(h, (-60, 0, 0), (110, 0, 0), 11, "#1f1f1f", "#666", cap="butt")
a = h.P(110, 0, 0)
for i, col in enumerate(FASES):
    ang = -40 + i * 22
    x1, y1 = conductor2d(h, a[0] + 2, a[1] - 6 + i * 4, ang, 52 + i * 6, col, pelado=16, w=7)
h.a(f'<ellipse cx="{a[0]:.1f}" cy="{a[1]:.1f}" rx="7" ry="12" fill="#c8c8c8" stroke="#111" stroke-width=".8"/>')
for i, (xx, yy) in enumerate(((X + 175, py + 262), (X + 215, py + 262), (X + 255, py + 262), (X + 295, py + 262))):
    h.iso(.26, xx, yy); morseto(h, 0, 0, 0, 1, linea=False, deriv=False)
for i, nm in enumerate(("L1", "L2", "L3", "N")): pass
h.txt(X + 235, py + 220, "4 × PKD-14", 12, 800, NV, "middle", INT)
g2(h, X + 50, py + 150, X + 20, py + 60, "Cu 4×16 mm²")
g2(h, X + 188, py + 165, X + 140, py + 40, "4 conductores, cuerda de hilos")
px, py2 = X + 338, py
h.cable(px + 106, py2 + 120, 52, color=False, hilos=True)
h.dimH(py2 + 52, px + 54, px + 158, "Ø 22,05 (*)", ext=py2 + 120, c=OR)
for i, (nm, dx, dy) in enumerate((("L1", 40, -40), ("L2", -40, -40), ("L3", -40, 40), ("N", 40, 40))):
    pass
h.txt(px + 106, py2 + 200, "Cu 4 × 16 mm²", 12, 700, K, "middle")
h.txt(px + 106, py2 + 218, "F · F · F · N", 10.5, 400, K, "middle")
h.txt(px + 106, py2 + 236, "XLPE (1027) o LSZH (1028)", 10.5, 400, K, "middle")
h.txt(px + 106, py2 + 290, "CORTE DEL CABLE (REF. 12)", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 3, "Colocá el rack en el apoyo", ["Rack MN 4B2L con aislador MN 17, con semiabrazaderas del diámetro del apoyo.", "El rack, lo más perpendicular posible a la línea de EPEC."],
           ojo="(*) El Ø del apoyo a esa altura se mide en obra (perímetro ÷ 3,14); la altura del rack: a confirmar con AP-T-019.", control="Rack firme (no gira), aislador sano y el ojo del rack mirando a la línea.")
h.iso(.25, X + 130, py + 175)
poste(h, 0, 0, -320, 300, 125, 115, "prfv")
for z in (-150, 150):
    anillo(h, 0, 0, z, 131, "#c9d1d8", 5)
h.BOX(-40, 40, -330, -128, -190, 190, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .6)
h.BOX(-40, 40, -400, -330, -190, -150, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .6)
h.BOX(-40, 40, -400, -330, 150, 190, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .6)
h.tuboZ(-150, 150, 0, -365, 8, 8, "url(#galv)", "#444")
for (z0, z1, r) in ((-150, -110, 48), (-110, -40, 38), (-40, 40, 48), (40, 110, 38), (110, 150, 48)):
    h.tuboZ(z0, z1, 0, -365, r, r, "url(#porc)", "#6b5f53")
g(h, (0, -365, 150), X + 230, py + 40, "aislador MN 17")
g(h, (-40, -230, 190), X + 230, py + 80, "rack MN 4B2L")
g(h, (0, 131, 150), X + 230, py + 190, "semiabrazaderas")
g(h, (0, 0, -300), X + 230, py + 270, "apoyo PRFV")
flecha(h, X + 200, py + 130, X + 290, py + 80, "#c2410c"); h.txt(X + 322, py + 145, "hacia la línea", 11, 800, "#c2410c", "end", INT)
px, py2 = X + 338, py
cx, cy = px + 120, py2 + 170
h.ln(px + 8, py2 + 50, px + 204, py2 + 50, K, 1.6, 'stroke-dasharray="10 3 2 3"'); h.txt(px + 10, py2 + 44, "LÍNEA EPEC", 9, 700)
h.circ(cx, cy, 40, "url(#ANSI37)", K, 1.2)
h.path(f"M{cx-46},{cy-14} A48,48 0 0 1 {cx-14},{cy-46}", "none", K, 2.4); h.path(f"M{cx+14},{cy-46} A48,48 0 0 1 {cx+46},{cy-14}", "none", K, 2.4)
h.rect(cx - 10, cy - 96, 20, 48, "#fff", K, 1.2); h.circ(cx, cy - 106, 12, "#fff", K, 1.2); h.circ(cx, cy - 106, 4, "#fff", K, .8)
h.ln(cx, cy - 118, cx, py2 + 50, K, .6, h.OCULTA); h.txt(cx + 6, cy - 128, "⊥ A LA LÍNEA", 9, 700)
h.dimH(cy + 60, cx - 40, cx + 40, "Ø MEDIR (*)", ext=cy, c=OR)
h.txt(px + 106, py2 + 290, "PLANTA DEL RACK", 10, 700, K, "middle")
h.guardar(f"{ID}_p2.svg")

# ================= HOJA 3: pasos 4 y 5
h = pag(3)
X = 40
py = panel(h, X, 4, "Tendé el vano «flojo»", ["Vano flojo de 10 m como máximo (AP-T-019 nota 7). Si es más largo, va otro poste.", "Apoyo a 2,50 m del cordón (nota 8).", "Del poste de EPEC al rack del apoyo, sin tensar."],
           ojo="Vano flojo: el cable cuelga con su flecha; no lo tires como una retención de línea.", control="Medí con cinta el vano (≤ 10 m) y el apoyo al cordón (2,50 m).")
escena_vano(h, X, py, bajada=True)
g(h, ((XE + XA) / 2, YP, 7450), X + 170, py + 40, "vano ≤ 10 m")
g(h, (XA - 380, YP, 7600), X + 290, py + 60, "rack", "middle")
g(h, (8000, 3000, 150), X + 150, py + 290, "cordón")
px, py2 = X + 338, py
k = .015; gx = px + 16; gy = py2 + 248
h.ln(px + 6, gy, px + 206, gy, K, 1.4)
for i in range(0, 200, 8): h.ln(px + 6 + i, gy, px + 2 + i, gy + 6, K, .5)
ex, axp = gx, gx + 10500 * k
h.rect(ex - 3, gy - 9000 * k, 6, 9000 * k, "#fff", K, 1); h.rect(axp - 3, gy - 8000 * k, 6, 8000 * k, "#fff", K, 1)
pts = [(ex + (axp - ex) * t, gy - (8500 * k) + (1000 * k) * t + 30 * t * (1 - t) * 4 / 4 * 1.0 + 0) for t in [i / 20 for i in range(21)]]
pts = [(ex + (axp - ex) * t, gy - 8500 * k + 1000 * k * t + 18 * 4 * t * (1 - t)) for t in [i / 20 for i in range(21)]]
h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in pts), "none", K, 1.6)
cord = gx + 8000 * k
h.ln(gx + 2000 * k, gy - 4, gx + 2000 * k, gy, K, 2); h.ln(cord, gy - 4, cord, gy, K, 2)
h.dimH(py2 + 52, ex, axp, "VANO ≤ 10000", ext=gy - 140)
h.dimH(gy + 22, cord, axp, "2500", ext=gy)
h.dimV(axp + 18, gy - 8000 * k, gy, "hl 8000")
h.txt(ex + 6, gy - 60, "EPEC", 9, 700); h.txt((gx + 2000 * k + cord) / 2, gy - 6, "CALZADA", 8.5, 700, K, "middle")
h.txt(px + 106, py2 + 290, "ELEVACIÓN POR EL VANO", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 5, "Conectá con un morseto por conductor", ["Seguí la guía «Morseto PKD-14»: cuñas, cobre hasta el capuchón, apretar hasta que corte la cabeza.", "Los 4 morsetos escalonados, no en el mismo punto.", "Cada color con su fase: L1, L2, L3 y N."],
           ojo="Abrí el haz solo con cuñas separadoras. (*) El rango publicado del 1995/6 en derivación es 1,5–10 mm²: confirmá en el grabado que diga 4–16.", control="Los 4 con la cabeza cortada, firmes (no giran ni se corren).")
h.iso(.30, X + 180, py + 105)
haz(h, -520, 520, 0, 0, r=13)
for i, (xx, col) in enumerate(zip((-330, -110, 110, 330), FASES)):
    cable(h, [(xx - 40, 0, -47), (xx - 110, 0, -90), (xx - 200, 0, -300), (xx - 225, 0, -470)], 8, col, "#bbb")
    morseto(h, xx, 0, -23, .9, linea=False, deriv=True, der_len=50, col_der=col, cabeza="no")
    a = h.P(xx, 0, 70); h.txt(a[0] + 10, a[1] - 4, ("L1", "L2", "L3", "N")[i], 13, 800, NV, "start", INT)
g(h, (480, 0, 13), X + 230, py + 40, "línea EPEC")
g(h, (-555, 0, -470), X + 30, py + 285, "bajadas Cu 4×16 al rack")
px, py2 = X + 338, py
yl = py2 + 100
h.rect(px + 8, yl - 7, 196, 14, "#fff", K, 1); h.ln(px + 8, yl, px + 204, yl, K, .4, h.EJE); h.txt(px + 10, yl - 34, "LÍNEA EPEC", 9, 700)
xs = [px + 36 + i * 46 for i in range(4)]
for i, xx in enumerate(xs):
    h.rect(xx - 10, yl - 18, 20, 38, "#fff", K, 1.2); h.rect(xx - 3, yl - 28, 6, 10, "#fff", K, .8)
    h.path(f"M{xx},{yl+20} C{xx},{yl+70} {xx-20},{yl+100} {xx-30},{yl+140}", "none", K, 4); h.path(f"M{xx},{yl+20} C{xx},{yl+70} {xx-20},{yl+100} {xx-30},{yl+140}", "none", "#fff", 2)
    h.txt(xx + 12, yl + 40, ("L1", "L2", "L3", "N")[i], 9.5, 700)
h.dimH(yl - 40, xs[2], xs[3], "(*)", c=OR)
h.txt(px + 106, py2 + 270, "UN MORSETO POR CONDUCTOR,", 9.5, 700, K, "middle"); h.txt(px + 106, py2 + 290, "ESCALONADOS", 10, 700, K, "middle")
h.guardar(f"{ID}_p3.svg")

# ================= HOJA 4: pasos 6 y 7
h = pag(4)
X = 40
py = panel(h, X, 6, "Poné los capuchones", ["Un capuchón R15 por conductor en cada punta de retención.", "4 conductores × 2 puntas = 8 capuchones.", "Que quede bien calzado: evita que entre agua."],
           ojo="Una punta sin capuchón junta agua y se corroe el cobre.", control="Contá los 8 capuchones puestos y calzados hasta el fondo.")
h.iso(.75, X + 150, py + 150)
tubo(h, (-150, 0, 40), (40, 0, 40), 11, "#1f1f1f", "#666")
a = h.P(40, 0, 40)
for i, col in enumerate(FASES):
    ang = -10 + i * 20
    x1, y1 = conductor2d(h, a[0], a[1] - 4 + i * 3, ang, 70 + i * 4, col, w=8)
    c, s_ = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    if i < 3:
        caps = (x1 + 8 * c, y1 + 8 * s_) if i == 0 else caps
        h.ln(x1 - 2 * c, y1 - 2 * s_, x1 + 18 * c, y1 + 18 * s_, "#000", 13, 'stroke-linecap="round"'); h.ln(x1 - 2 * c, y1 - 2 * s_, x1 + 16 * c, y1 + 16 * s_, "#2f2f2f", 11, 'stroke-linecap="round"')
    else:
        xo, yo = x1 + 50, y1 - 30
        h.ln(xo, yo, xo + 18, yo, "#000", 13, 'stroke-linecap="round"'); h.ln(xo, yo, xo + 16, yo, "#2f2f2f", 11, 'stroke-linecap="round"')
        flecha(h, xo - 6, yo + 6, x1 + 8, y1 - 6, "#c2410c", 2)
h.a(f'<ellipse cx="{a[0]:.1f}" cy="{a[1]:.1f}" rx="6" ry="11" fill="#c8c8c8" stroke="#111" stroke-width=".8"/>')
g2(h, caps[0], caps[1], X + 200, py + 40, "capuchón R15")
g2(h, a[0] - 80, a[1] - 40, X + 30, py + 250, "Cu 4×16")
h.txt(X + 230, py + 270, "falta 1 → ponelo", 12, 800, "#c2410c", "middle", INT)
px, py2 = X + 338, py
cx, cy = px + 70, py2 + 130
h.rect(cx - 60, cy - 9, 90, 18, "url(#ANSI31)", K, 1); h.rect(cx + 30, cy - 6, 30, 12, "url(#cuH)", K, .8)
h.path(f"M{cx+20},{cy-15} H{cx+66} a15,15 0 0 1 0,30 H{cx+20} z", "none", K, 1.6)
h.dimH(cy - 34, cx + 20, cx + 81, "(*)", c=OR)
h.txt(cx + 50, cy + 44, "CAPUCHÓN R15", 9.5, 700, K, "middle")
h.tabla(px + 18, py2 + 200, [(110, "l", False), (66, "c", True)], [("CAPUCHONES", "CANT."), ("conductores", "4"), ("puntas", "2"), ("total", "8")], rowh=19)
h.txt(px + 106, py2 + 290, "CORTE DE LA PUNTA", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 7, "Entrá al gabinete y sellá", ["Con apoyo PRFV nuevo no lleva caño de bajada: el cable va del rack al gabinete.", "Sellá la entrada con espuma de poliuretano y cubrí con el babero (AP-T-019 nota 2).", "Puerta del gabinete hacia el espacio verde."],
           ojo="(*) Altura del gabinete y posición de la entrada: a confirmar con AP-T-019 (en el pliego, tablero en poste a 5 m o más).", control="Entrada sellada sin huecos, babero puesto, puerta hacia el verde.")
h.iso(.13, X + 150, py + 175)
poste(h, 0, 0, -620, 950, 125, 118, "prfv")
cable(h, [(120, 60, 950), (140, 80, 400), (150, 150, 120), (150, 230, 40)], 14, "#222")
h.BOX(-265, 265, 130, 330, -530, 0, "#c9cdd1", "url(#gab)", "#aeb2b7", "#555", .7)
a = h.P(0, 330, -260); h.path(f"M{a[0]:.1f},{a[1]-9:.1f} l9,15 h-18 z", "#facc15", "#333", .7); h.txt(a[0], a[1] + 4, "!", 9, 800, "#111", "middle", INT)
for z in (-120, -400): lin3(h, (-200, 330, z), (-150, 330, z), "#555", 2)
h.F3([(100, 180, 0), (200, 180, 0), (200, 280, 0), (100, 280, 0)], "#facc15", "#a16207", .6)
cable(h, [(150, 200, 120), (150, 230, 10)], 14, "#222")
h.F3([(60, 150, 200), (260, 150, 200), (260, 300, 90), (60, 300, 90)], "url(#galv)", "#444", .7, .85)
g(h, (190, 270, 0), X + 250, py + 215, "espuma")
g(h, (240, 260, 120), X + 250, py + 150, "babero")
g(h, (130, 70, 700), X + 200, py + 50, "Cu 4×16 del rack")
g(h, (-200, 330, -450), X + 12, py + 285, "gabinete (puerta al verde)")
px, py2 = X + 338, py
cx = px + 80; top = py2 + 150
h.rect(cx - 16, py2 + 30, 32, 250, "url(#ANSI37)", K, 1)
h.rect(cx + 16, top, 60, 100, "#fff", K, 1.4); h.rect(cx + 22, top + 6, 48, 88, "none", K, .5, 'stroke-dasharray="3 2"')
h.path(f"M{cx+30},{py2+40} C{cx+60},{py2+80} {cx+50},{top-30} {cx+46},{top}", "none", K, 4); h.path(f"M{cx+30},{py2+40} C{cx+60},{py2+80} {cx+50},{top-30} {cx+46},{top}", "none", "#fff", 2)
h.rect(cx + 36, top - 10, 22, 10, "url(#FOAM)", K, .8); h.path(f"M{cx+26},{top-22} L{cx+70},{top-22} L{cx+76},{top-8}", "none", K, 1.6)
h.txt(cx + 80, top - 24, "BABERO", 8.5, 700); h.txt(cx + 62, top - 4, "ESPUMA", 8.5, 700)
h.dimV(cx + 92, top, top + 100, "530")
h.txt(px + 106, py2 + 290, "CORTE: ENTRADA AL GABINETE", 10, 700, K, "middle")
h.guardar(f"{ID}_p4.svg")

# ================= HOJA 5: paso 8 + así queda
h = pag(5)
X = 40
py = panel(h, X, 8, "Ojal, termocontraíble y portafusible NH", ["Cada conductor con terminal ojal 16 mm² comprimido y termocontraíble.", "Al portafusible NH del tablero (fusible NH-00 gL 63 A, según proyecto).", "Cada fase a su NH; el neutro a su borne."],
           ojo="Ojal comprimido con la pinza, nunca apretado con alicate. No energizar hasta verificar todo lo de aguas abajo.", control="Ojales comprimidos, termocontraíble cubriendo la unión. Foto «Conexión / acometida».")
h.iso(1, X + 200, py + 160)
# base NH de porcelana con fusible
h.BOX(-30, 110, -20, 30, -60, -40, "#efe9dd", "url(#porc)", "#d8d0c2", "#555", .7)
h.BOX(0, 80, -12, 22, -40, -14, "#cfd3d8", "url(#estano)", "#b6bcc2", "#555", .7)
h.txt(h.P(40, 22, -27)[0], h.P(40, 22, -27)[1] + 4, "NH-00", 8, 800, "#111", "middle", INT)
for xx in (-14, 94): h.tuboZ(-40, -30, xx, 5, 6, 6, "url(#galv)", "#444")
a = h.P(-14, 5, -30)
# conductor L1 con termocontraíble y ojal, llegando al bulón del NH
an = math.radians(28); dx, dy = math.cos(an), math.sin(an)
Pp = lambda d: (a[0] - d * dx, a[1] - d * dy)
p0, p1, p2, p3 = Pp(160), Pp(70), Pp(34), Pp(12)
h.ln(*p0, *p1, "#000", 10.4); h.ln(*p0, *p1, L1, 9)
h.ln(*p1, *p2, "#000", 13.4); h.ln(*p1, *p2, "#3a3a3a", 12)
h.ln(*p2, *p3, "#555", 8); h.ln(*p2, *p3, "#d9dee2", 6.5)
h.a(f'<ellipse cx="{a[0]:.1f}" cy="{a[1]:.1f}" rx="14" ry="8" fill="#e3e7ea" stroke="#555" stroke-width="1"/>')
h.a(f'<ellipse cx="{a[0]:.1f}" cy="{a[1]:.1f}" rx="5" ry="3" fill="#777" stroke="#333" stroke-width=".6"/>')
x1, y1 = p1
# los otros 3 conductores esperando
for i, col in enumerate(FASES[1:]):
    conductor2d(h, X + 40, py + 230 + i * 18, 0, 70, col, pelado=14, w=8)
g2(h, (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, X + 30, py + 40, "termocontraíble")
g2(h, a[0] + 10, a[1] - 4, X + 160, py + 40, "ojal 16 mm²")
g2(h, a[0] + 70, a[1] + 10, X + 260, py + 120, "base NH")
h.txt(X + 40, py + 214, "L2 · L3 · N: igual", 11.5, 700, NV, "start", INT)
px, py2 = X + 338, py
cx, cy = px + 40, py2 + 130; k = 3
h.rect(cx - 30, cy - 9, 30, 18, "url(#ANSI31)", K, 1)
h.rect(cx, cy - 11, 20 * k / 2, 22, "#fff", K, 1.2)
h.rect(cx + 30, cy - 5, 26, 10, "#fff", K, 1)
h.circ(cx + 30 + 26 + 24, cy, 24, "#fff", K, 1.2); h.circ(cx + 80, cy, 8.25, "#fff", K, 1)
h.dimH(cy + 52, cx + 30, cx + 30 + 39 * 1.55, "39", ext=cy)
h.dimV(cx + 116, cy - 24, cy + 24, "16")
h.dimH(cy - 38, cx + 72, cx + 88, "Ø5,5", ext=cy)
h.txt(cx, cy - 18, "TERMOCONTR.", 8.5, 700)
h.txt(px + 106, py2 + 220, "OJAL Cu ESTAÑADO 16 mm² · M10", 9.5, 400, K, "middle")
h.txt(px + 106, py2 + 236, "L 39 · d 5,5 · W 16 (AP-T-019 D4)", 9.5, 400, K, "middle")
h.txt(px + 106, py2 + 290, "D4: LLEGADA AL NH", 10, 700, K, "middle")
X = W / 2 + 18
asi_queda(h, X, "../hojas/ap_t_019.png", (1330, 75, 2485, 830), "Plano completo: AP-T-019 (con AP-T-018, apoyo PRFV).", "guía «Puesta a tierra y medición».",
          "Morsetos firmes y con la cabeza cortada, capuchones puestos, vano sin tensión exagerada, entrada sellada, ojales comprimidos. No energizar hasta que esté verificado todo lo de aguas abajo. Foto: «Conexión / acometida».",
          ["si la conexión se hace con corte o con tensión y el EPP exacto (EPEC)."])
h.guardar(f"{ID}_p5.svg")
print("ok")
