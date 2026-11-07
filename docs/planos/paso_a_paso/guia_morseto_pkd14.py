from aereo_kit import *
ID = "morseto_pkd14"; TOT = 5
TIT = "CÓMO SE HACE · MORSETO DE DERIVACIÓN PKD-14"
SUB = "Metal-CE 1995/6 (LCT PKD-14) · código 4027 · AP-T-019 · ítem 15.38 · riesgo ALTO"
PIE = "EMA · Alumbrado Público · Datos de la ficha técnica 4027 (LCT, planilla N° 352) y del plano AP-T-019 · (*) a confirmar"
pag = lambda n: pagina(n, TOT, TIT, SUB, PIE)


def plano_morseto(h, cx, cy, k=1.0, abierto=False, linea=False, deriv=False, cabeza=True, gap=None):
    """elevación del morseto en blanco y negro (k = px por mm aprox.)"""
    gp = (gap if gap is not None else (14 if abierto else 0)) * k
    w, hh = 60 * k, 44 * k
    h.rect(cx - w / 2, cy + 4 * k, w, hh, "url(#ANSI31)", K, 1.2)               # mordaza de abajo
    h.rect(cx - w / 2, cy - 4 * k - hh - gp, w, hh, "url(#ANSI31)", K, 1.2)      # mordaza de arriba
    h.rect(cx + w / 2, cy + 14 * k, 14 * k, 24 * k, "#fff", K, 1)               # capuchón
    h.rect(cx - 5 * k, cy - 62 * k - gp, 10 * k, 122 * k + gp, "#fff", K, .9)    # bulón
    h.rect(cx - 11 * k, cy - 60 * k - gp, 22 * k, 12 * k, "#fff", K, 1.1)        # tuerca
    if cabeza: h.rect(cx - 9 * k, cy - 74 * k - gp, 18 * k, 14 * k, "#fff", K, 1.1)
    if linea: h.circ(cx, cy - 26 * k - gp, 10 * k, "#fff", K, 1.2); h.circ(cx, cy - 26 * k - gp, 6 * k, "url(#cuH)", K, .5)
    if deriv: h.circ(cx, cy + 26 * k, 7 * k, "#fff", K, 1.2); h.circ(cx, cy + 26 * k, 4.5 * k, "url(#cuH)", K, .5)
    h.ln(cx, cy - 90 * k - gp, cx, cy + 70 * k, K, .5, h.EJE)


# ================= HOJA 1
h = pag(1)


def datos(y):
    h.txt(40, y + 28, "DATOS DE LA PIEZA (FICHA 4027)", 15, 800, "#28285E", "start", INT)
    h.tabla(40, y + 38, [(200, "l", False), (350, "l", True)],
            [("DATO", "VALOR"), ("Modelo", "Metal-CE 1995/6 · LCT PKD-14AC"), ("Conductor principal (línea)", "10–95 mm² (la guía dice 25–95)"),
             ("Derivación (bajada)", "1,5–10 mm² publicado · guía: 4–16 (*)"), ("Torque de la cabeza", "≈ 8 N·m"),
             ("Llave", "tubo 13 mm aislada"), ("Peso / norma", "123 g · IRAM 2435")], rowh=21,
            colores=lambda i, j, t: OR if "(*)" in t else K)


antes(h, [("🚧 Autorización", "Coordinado con EPEC según su procedimiento."),
          ("🦺 EPP", "Casco con barbijo, guantes dieléctricos de la clase adecuada, anteojos, ropa ignífuga, arnés en altura."),
          ("🛠 Herramientas", "Llave tubo aislada (13 mm), cuñas separadoras.")],
      [("4027", "Morseto PKD-14 (Metal-CE 1995/6): uno por conductor")], extra=datos)
X = W / 2 + 18
py = panel(h, X, 1, "Verificá el modelo", ["Grabado: línea 25-95 / derivación 4-16 mm².", "El 1995/3 (PKD-16) no sirve para 16 mm².", "Un morseto por conductor: para la bajada 4×16 son 4."],
           ojo="(*) La ficha publica 1,5–10 mm² en derivación para el 1995/6: si el grabado no dice 4–16, usá el PKD-14PF (1995/4, 4–16).", control="Leé el grabado de las dos caras antes de subir.")
h.iso(1.5, X + 150, py + 170)
morseto(h, 0, 0, 0, 1, linea=False, deriv=False)
a = h.P(0, 24, 26); h.txt(a[0] - 4, a[1] + 2, "25-95", 9, 800, "#d9d9d9", "middle", MONO)
a = h.P(0, 24, -26); h.txt(a[0] - 4, a[1] + 2, "4-16", 9, 800, "#d9d9d9", "middle", MONO)
g(h, (-30, 10, 26), X + 20, py + 60, "canal de la línea")
g(h, (-30, 10, -26), X + 20, py + 280, "canal de la derivación")
g(h, (44, 0, -26), X + 240, py + 250, "capuchón")
g(h, (0, 0, 70), X + 210, py + 40, "cabeza fusible")
g(h, (8, 0, 54), X + 240, py + 90, "tuerca")
px, py2 = X + 338, py
plano_morseto(h, px + 90, py2 + 165, 1.25, linea=True, deriv=True)
h.txt(px + 130, py2 + 133, "LÍNEA 25-95", 9, 700); h.txt(px + 100, py2 + 238, "DERIV. 4-16 (*)", 9, 700, OR)
h.txt(px + 120, py2 + 75, "CABEZA FUSIBLE", 9, 700); h.ln(px + 102, py2 + 72, px + 118, py2 + 72, K, .5)
h.txt(px + 106, py2 + 290, "ELEVACIÓN (S/E)", 10, 700, K, "middle")
h.guardar(f"{ID}_p1.svg")

# ================= HOJA 2: pasos 2 y 3
h = pag(2)
X = 40
py = panel(h, X, 2, "Separá el conductor del haz", ["Abrí el haz con las cuñas separadoras, nunca con algo que corte.", "Identificá fase y neutro antes de conectar.", "Separá lo justo para que entre el morseto."],
           ojo="Nunca un destornillador o cuchilla: si cortás la aislación de la línea queda un punto con tensión a la vista.", control="Aislación de la línea sana y el conductor identificado.")
h.iso(.5, X + 160, py + 150)
r = 13
# 3 conductores juntos del haz
for dy, dz in ((r, -r), (-r, -r), (r, r)):
    cable(h, [(-330, dy, dz), (330, dy, dz)], r * .95, "#1a1a1a", "#5d5d5d")
# el conductor separado (sube entre las cuñas)
pts = [(-330, -r, r), (-180, -r, r), (-90, -r - 20, r + 60), (90, -r - 20, r + 60), (180, -r, r), (330, -r, r)]
cable(h, pts, r * .95, "#1a1a1a", "#5d5d5d")
for xx in (-120, 120):   # cuñas separadoras naranja
    h.F3([(xx - 30, -40, r + 8), (xx + 30, -40, r + 8), (xx + 30, 30, r + 8), (xx - 30, 30, r + 8)], "#f97316", "#7c2d12", .8)
    h.F3([(xx - 30, 30, r + 8), (xx + 30, 30, r + 8), (xx + 30, 30, r + 45), (xx - 30, 30, r + 45)], "#ea580c", "#7c2d12", .8)
    h.F3([(xx - 30, -40, r + 45), (xx + 30, -40, r + 45), (xx + 30, 30, r + 45), (xx - 30, 30, r + 45)], "#fb923c", "#7c2d12", .8)
g(h, (120, 30, r + 30), X + 230, py + 270, "cuña separadora")
g(h, (0, -r - 20, r + 72), X + 180, py + 50, "conductor a derivar")
g(h, (-300, r, -r), X + 20, py + 250, "haz preensamblado")
px, py2 = X + 338, py
cx, cy = px + 106, py2 + 170; rr = 16
for dx, dy in ((-rr, rr), (rr, rr), (-rr, -rr)):
    h.circ(cx + dx, cy + dy, rr, "#fff", K, 1.2); h.circ(cx + dx, cy + dy, rr * .6, "url(#cuH)", K, .5)
h.circ(cx + rr + 6, cy - rr - 40, rr, "#fff", K, 1.2); h.circ(cx + rr + 6, cy - rr - 40, rr * .6, "url(#cuH)", K, .5)
h.path(f"M{cx-4},{cy-rr-16} L{cx+40},{cy-rr-16} L{cx+18},{cy-rr+12} z", "url(#ANSI37)", K, 1)
h.txt(cx + 46, cy - rr - 10, "CUÑA", 9, 700)
flecha(h, cx + rr + 6, cy - rr - 4, cx + rr + 6, cy - rr - 18, K, 1)
h.txt(px + 106, py2 + 290, "CORTE DEL HAZ", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 3, "Aflojá la tuerca", ["Lo justo para que entren los cables.", "No lo desarmes: la tuerca, el bulón y las mordazas quedan juntos."],
           ojo="No toques la cabeza fusible: es la que marca el torque al final.", control="Las dos mordazas abiertas y los dientes limpios.")
h.iso(1.5, X + 150, py + 185)
morseto(h, 0, 0, 0, 1, abierto=True, linea=False, deriv=False)
a = h.P(0, 0, 70); rotar(h, a[0], a[1] - 10, 34, -1, "aflojar")
g(h, (0, 24, 10), X + 170, py + 292, "mordazas abiertas")
px, py2 = X + 338, py
plano_morseto(h, px + 90, py2 + 175, 1.25, abierto=True)
h.dimV(px + 150, py2 + 175 - 5, py2 + 175 - 5 - 17.5 + 0, "", c=K)
h.txt(px + 156, py2 + 162, "ABERTURA:", 8.5, 700); h.txt(px + 156, py2 + 174, "LO JUSTO", 8.5, 700)
h.txt(px + 106, py2 + 290, "MORSETO ABIERTO", 10, 700, K, "middle")
h.guardar(f"{ID}_p2.svg")

# ================= HOJA 3: pasos 4 y 5
h = pag(3)
X = 40
py = panel(h, X, 4, "Meté el cobre hasta el capuchón", ["Cable de cobre sin pelar, por el canal de abajo.", "Hasta que la punta toque el fondo del capuchón.", "Cada conductor con su color: L1 marrón, L2 negro, L3 rojo, N celeste."],
           ojo="No lo peles: los dientes perforan la aislación. Si no llega al capuchón, queda la punta con tensión.", control="Mirá la punta: tiene que estar contra el fondo del capuchón.")
h.iso(1.15, X + 185, py + 165)
morseto(h, 0, 0, 0, 1, abierto=True, linea=False, deriv=True, col_der=L1, der_len=95)
a = h.P(-95, 0, -26); b = h.P(-40, 0, -26)
flecha(h, a[0] - 30, a[1] - 34, a[0] + 10, a[1] - 12, "#c2410c")
g(h, (44, 0, -26), X + 120, py + 292, "hasta el fondo del capuchón")
g(h, (-80, 0, -26), X + 20, py + 60, "Cu 4×16 sin pelar")
px, py2 = X + 338, py
cy = py2 + 160
h.rect(px + 60, cy - 26, 90, 52, "url(#ANSI31)", K, 1.2); h.rect(px + 150, cy - 14, 20, 28, "#fff", K, 1.2)
h.rect(px + 60, cy - 8, 110, 16, "#fff", K, .1)
h.rect(px + 14, cy - 8, 156, 16, "#fff", K, 1.2); h.rect(px + 14, cy - 5, 156, 10, "url(#cuH)", K, .5)
for xx in range(66, 150, 12): h.path(f"M{px+xx},{cy-8} l3,4 l3,-4", "none", K, .7)
h.ln(px + 170, cy - 30, px + 170, cy + 30, K, .6); h.txt(px + 172, cy + 44, "TOPE", 9, 700)
h.txt(px + 16, cy - 36, "SIN PELAR", 9, 700)
h.txt(px + 106, py2 + 290, "CORTE POR EL CANAL DE ABAJO", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 5, "Montalo sobre la línea", ["La línea de EPEC va en el canal de arriba.", "Los dos cables derechos y asentados en sus canales."],
           ojo="No lo montes torcido: si el conductor queda cruzado, los dientes no muerden parejo.", control="Línea arriba, bajada abajo, los dos derechos.")
h.iso(1.0, X + 165, py + 160)
morseto(h, 0, 0, 0, 1, abierto=True, linea=True, deriv=True, col_der=L1, der_len=110, lin_len=125)
g(h, (100, 0, 40), X + 200, py + 40, "línea EPEC (arriba)")
g(h, (-100, 0, -26), X + 20, py + 275, "bajada Cu (abajo)")
px, py2 = X + 338, py
plano_morseto(h, px + 90, py2 + 175, 1.25, abierto=True, linea=True, deriv=True)
h.txt(px + 132, py2 + 128, "LÍNEA", 9, 700); h.txt(px + 150, py2 + 196, "BAJADA", 9, 700)
h.txt(px + 106, py2 + 290, "CORTE TRANSVERSAL", 10, 700, K, "middle")
h.guardar(f"{ID}_p3.svg")

# ================= HOJA 4: pasos 6 y 7
h = pag(4)
X = 40
py = panel(h, X, 6, "Ajustá a mano", ["Cerrá la tuerca con la mano hasta que apoye.", "Revisá que nada se haya corrido."],
           ojo="Si al cerrar se corre un cable, aflojá y volvé a acomodarlo: no lo fuerces con la llave.", control="Mordazas cerradas parejas, sin luz entre ellas.")
h.iso(1.3, X + 165, py + 170)
morseto(h, 0, 0, 0, 1, linea=True, deriv=True, col_der=L1, der_len=110, lin_len=125)
a = h.P(0, 0, 70); rotar(h, a[0], a[1] - 8, 28, 1, "a mano")
g(h, (0, 24, 0), X + 150, py + 292, "mordazas cerradas")
px, py2 = X + 338, py
plano_morseto(h, px + 90, py2 + 175, 1.25, linea=True, deriv=True)
h.txt(px + 120, py2 + 88, "A MANO", 9, 700)
h.txt(px + 106, py2 + 290, "CERRADO, SIN APRETAR", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 7, "Apretá hasta que se corte la cabeza", ["Con llave tubo aislada (13 mm), apretá parejo.", "Cuando la cabeza fusible se corta, listo. No sigas apretando.", "La cabeza corta al torque de la pieza: ≈ 8 N·m (ficha)."],
           ojo="Nunca con llave común o sin aislar. No agregues palanca: el torque lo da la cabeza.", control="Cabeza cortada en cada morseto. Foto «Conexión / acometida».")
h.iso(1.0, X + 165, py + 200)
morseto(h, 0, 0, 0, 1, linea=True, deriv=True, col_der=L1, der_len=110, lin_len=125, cabeza="no")
# llave tubo aislada sobre la tuerca y la cabeza fusible que salta
h.tuboZ(62, 98, 0, 0, 14, 14, "url(#galv)", "#444")
h.tuboZ(98, 150, 0, 0, 8, 8, "#f97316", "#7c2d12")
a = h.P(0, 0, 150); h.ln(a[0] - 38, a[1], a[0] + 38, a[1], "#000", 9, 'stroke-linecap="round"'); h.ln(a[0] - 38, a[1], a[0] + 38, a[1], "#f97316", 7, 'stroke-linecap="round"')
h.tuboZ(80, 94, 90, -60, 9, 9, "url(#galv)", "#444")
b = h.P(90, -60, 94)
for k in range(3): h.ln(b[0] - 18 - k * 4, b[1] + 10 + k * 5, b[0] - 30 - k * 6, b[1] + 16 + k * 7, "#c2410c", 1.6)
h.txt(b[0] + 14, b[1] - 6, "✕", 14, 800, "#c2410c", "start", INT)
rotar(h, a[0], a[1] + 14, 30, 1, None)
g(h, (90, -60, 84), X + 215, py + 180, "cabeza cortada")
g(h, (0, 0, 115), X + 15, py + 135, "llave tubo aislada 13 mm")
px, py2 = X + 338, py
plano_morseto(h, px + 90, py2 + 185, 1.25, linea=True, deriv=True, cabeza=False)
cx, cy = px + 112, py2 + 185 - 74 * 1.25 - 10
h.rect(cx - 9 * 1.25, cy - 6, 18 * 1.25, 14 * 1.25, "#fff", K, 1.1, f'transform="rotate(25 {cx} {cy})"')
h.ln(px + 70, py2 + 185 - 60 * 1.25, px + 112, py2 + 185 - 60 * 1.25, K, .6, 'stroke-dasharray="3 2"')
h.txt(px + 130, py2 + 90, "CORTA A ≈ 8 N·m", 9, 700)
h.txt(px + 106, py2 + 290, "APRIETE FINAL", 10, 700, K, "middle")
h.guardar(f"{ID}_p4.svg")

# ================= HOJA 5: paso 8 + así queda
h = pag(5)
X = 40
py = panel(h, X, 8, "Uno por conductor, escalonados", ["Uno por cada fase y uno para el neutro, separados entre sí.", "Volvé a juntar el haz y sacá las cuñas.", "Ponele el capuchón a cada punta (guía «Acometida aérea»)."],
           ojo="(*) La separación entre morsetos no está en el plano: a confirmar. Que no queden en el mismo punto del haz.", control="Cada morseto firme (no gira ni se corre), capuchón puesto, cabeza cortada, cables sin daños.")
h.iso(.30, X + 180, py + 105)
haz(h, -520, 520, 0, 0, r=13)
for i, (xx, col) in enumerate(zip((-330, -110, 110, 330), FASES)):
    cable(h, [(xx - 40, 0, -47), (xx - 110, 0, -90), (xx - 200, 0, -300), (xx - 225, 0, -470)], 8, col, "#bbb")
    morseto(h, xx, 0, -23, .9, linea=False, deriv=True, der_len=50, col_der=col, cabeza="no")
    a = h.P(xx, 0, 70); h.txt(a[0] + 10, a[1] - 4, ("L1", "L2", "L3", "N")[i], 13, 800, NV, "start", INT)
g(h, (480, 0, 13), X + 230, py + 40, "línea EPEC")
g(h, (-555, 0, -470), X + 30, py + 285, "bajadas Cu 4×16")
px, py2 = X + 338, py
yl = py2 + 100
h.rect(px + 8, yl - 7, 196, 14, "#fff", K, 1); h.ln(px + 8, yl, px + 204, yl, K, .4, h.EJE); h.txt(px + 10, yl - 34, "LÍNEA EPEC", 9, 700)
xs = [px + 36 + i * 46 for i in range(4)]
for i, xx in enumerate(xs):
    h.rect(xx - 10, yl - 18, 20, 38, "#fff", K, 1.2); h.rect(xx - 3, yl - 28, 6, 10, "#fff", K, .8)
    h.path(f"M{xx},{yl+20} C{xx},{yl+70} {xx-20},{yl+100} {xx-30},{yl+140}", "none", K, 4); h.path(f"M{xx},{yl+20} C{xx},{yl+70} {xx-20},{yl+100} {xx-30},{yl+140}", "none", "#fff", 2)
    h.txt(xx + 12, yl + 40, ("L1", "L2", "L3", "N")[i], 9.5, 700)
h.dimH(yl - 40, xs[2], xs[3], "(*)", c=OR)
h.txt(px + 106, py2 + 290, "ELEVACIÓN SOBRE LA LÍNEA", 10, 700, K, "middle")
X = W / 2 + 18
asi_queda(h, X, "../hojas/ap_t_019.png", (515, 650, 905, 948), "Plano: AP-T-019, detalle D1 «Derivación en la línea».", "guía «Acometida aérea», paso 6 (capuchones).",
          "Cada morseto firme (no gira ni se corre), capuchón puesto, cabeza cortada, cables sin daños. Foto: «Conexión / acometida».",
          ["si se instala con corte o con tensión (EPEC).", "que el grabado del 1995/6 diga derivación 4–16 mm² (la ficha publica 1,5–10)."], nombre="morseto_pkd14_fin.png")
h.guardar(f"{ID}_p5.svg")
print("ok")
