from aereo_kit import *
ID = "unidad_aerea_barrio"; TOT = 4
TIT = "CÓMO SE HACE · LUMINARIA AÉREA DE BARRIO"
SUB = "Plano AP-TC-055 (borrador) · brazo H°G° 2,13 m, morsetos y PAT · ítems 1.28–1.36 / 1.43 / 1.44 · riesgo ALTO"
PIE = "EMA · Alumbrado Público · Borrador: las medidas mandan en el plano AP-TC-055 oficial (hojas B a G pendientes) · (*) a confirmar"
pag = lambda n: pagina(n, TOT, TIT, SUB, PIE)
RP = 110   # poste Ø220 (ejemplo de la guía)
ANG = math.radians(15)   # inclinación del brazo (*)
LB = 2130


def abrazadera(h, z, r=RP, x=0, y=0):
    anillo(h, x, y, z, r + 4, "#d6dde3", 6)
    for yy in (-r - 30, r + 4):
        h.BOX(x - 20, x + 20, y + yy, y + yy + 26, z - 25, z + 25, "url(#galv)", "url(#galv)", "url(#galv)", "#444", .5)


def brazo(h, z0, luz=False):
    """brazo de H°G° desde el poste hacia la calle (+x), con tensor y luminaria"""
    x1 = RP + LB * math.cos(ANG); z1 = z0 + LB * math.sin(ANG)
    xt = RP + LB * .55 * math.cos(ANG); zt = z0 + LB * .55 * math.sin(ANG)
    tubo(h, (RP, 0, z0 - 600), (xt, 0, zt), 16, "#b8c2cb", "#eef2f5")   # tensor
    tubo(h, (RP, 0, z0), (x1, 0, z1), 30, "#b8c2cb", "#eef2f5")        # brazo
    abrazadera(h, z0); abrazadera(h, z0 - 600)
    h.BOX(x1 - 40, x1 + 560, -150, 150, z1 - 70, z1 + 50, "#5b6168", "#3f444a", "#4b5157", "#222", .7)
    h.F3([(x1 + 40, -120, z1 - 71), (x1 + 520, -120, z1 - 71), (x1 + 520, 120, z1 - 71), (x1 + 40, 120, z1 - 71)], "#fff7c2" if luz else "#e8e8e8", "#555", .5)
    if luz:
        c = h.P(x1 + 280, 0, z1 - 80)
        h.a(f'<path d="M{c[0]-10:.1f},{c[1]:.1f} L{c[0]+10:.1f},{c[1]:.1f} L{c[0]+55:.1f},{c[1]+120:.1f} L{c[0]-55:.1f},{c[1]+120:.1f} z" fill="#fde047" opacity=".35"/>')
    return x1, z1


# ================= HOJA 1
h = pag(1)
antes(h, [("🚧 Autorización", "La red aérea es de EPEC: el trabajo con tensión o el corte se coordina según su procedimiento."),
          ("🦺 EPP", "Casco con barbijo, guantes dieléctricos de la clase adecuada, anteojos, ropa ignífuga, arnés en altura."),
          ("🛠 Herramientas", "Hidrogrúa con canasto, llave tubo aislada, cinta métrica (Ø del poste), flejadora, telurímetro.")],
      [("4501", "Brazo de H°G° 2,13 m"), ("4005", "Abrazaderas por Ø del poste: 2 por brazo (en madera, 4016 bulones MN 52)"), ("6010", "Luminaria LED"),
       ("4026", "Morseto 1995/4 con fusible: fase / piloto"), ("3018", "Fusible Neozed 2 A"), ("4027", "Morseto 1995/6: neutro"),
       ("6001", "Cable Cu 3×1,5 F-N-T para la bajada"), ("7015", "Jabalina Ø14,6 × 1500"), ("7019", "Tomacable"), ("7010", "Cable V/A 1×10"),
       ("5006", "Caño PVC 3/4\" hasta 2,5 m"), ("4024", "Fleje inox + 4025 hebillas")])
X = W / 2 + 18
py = panel(h, X, 1, "Medí el poste y elegí la abrazadera", ["Medí el perímetro a la altura del brazo y dividí por 3,14.", "Ø220 → abrazadera Ø220; Ø230 → Ø240.", "En madera: bulones pasantes (MN 52)."],
           ojo="El poste es cónico: medí justo donde va el brazo, no en el pie.", control="Anotá el Ø medido y el código de abrazadera en la orden.")
h.iso(.32, X + 165, py + 160)
poste(h, 0, 0, -260, 300, RP + 6, RP - 4, "hA")
anillo(h, 0, 0, 40, RP + 3, "#facc15", 7)
a = h.P(0, RP + 3, 40); h.ln(a[0], a[1], a[0] - 14, a[1] + 50, "#a16207", 6); h.ln(a[0], a[1], a[0] - 14, a[1] + 50, "#facc15", 4)
h.rect(a[0] - 34, a[1] + 46, 30, 22, "#facc15", "#a16207", 1, 'rx="5"')
g(h, (RP * .75, RP * .75, 40), X + 230, py + 150, "cinta métrica")
g(h, (0, 0, 300), X + 30, py + 50, "poste H°A° (ej. Ø220)")
h.txt(X + 165, py + 285, "Ø = perímetro ÷ 3,14", 13, 800, "#c2410c", "middle", INT)
px, py2 = X + 338, py
cx, cy = px + 70, py2 + 90
h.circ(cx, cy, 44, "url(#CONCP)", K, 1.4); h.ln(cx - 56, cy, cx + 56, cy, K, .5, h.EJE)
h.dimH(cy + 64, cx - 44, cx + 44, "Ø220 (SE MIDE)", ext=cy)
h.txt(cx + 56, cy - 30, "A-A", 10, 700)
h.tabla(px + 14, py2 + 176, [(98, "c", True), (86, "c", True)], [("Ø POSTE", "ABRAZADERA"), ("≤ 140", "4001"), ("≤ 200", "4002"), ("≤ 220", "4004"), ("≤ 240", "4005"), ("≤ 260", "4006"), ("≤ 300", "4007")], rowh=14.5)
h.txt(px + 106, py2 + 290, "CORTE A-A · TABLA AP-TC-055", 9.5, 700, K, "middle")
h.guardar(f"{ID}_p1.svg")

# ================= HOJA 2: pasos 2 y 3
h = pag(2)
X = 40
py = panel(h, X, 2, "Montá el brazo de 2,13 m", ["Dos abrazaderas, ajuste parejo de los bulones.", "El brazo apunta a la calzada, nivelado de costado.", "Luminaria LED en la punta del brazo."],
           ojo="(*) Altura del brazo, inclinación (15°), separación entre abrazaderas y Ø del caño: a confirmar con el plano AP-TC-055 oficial.", control="Brazo firme (no gira) y apuntando a la calle.")
h.iso(.085, X + 95, py + 175)
poste(h, 0, 0, -1300, 1500, RP + 10, RP - 5, "hA")
brazo(h, 600)
g(h, (RP + 1100, 0, 600 + 1100 * math.tan(ANG)), X + 160, py + 50, "brazo H°G° 2,13 m")
g(h, (RP + 2260, 0, 600 + 2130 * math.sin(ANG)), X + 250, py + 110, "luminaria LED")
g(h, (0, RP + 30, 0), X + 30, py + 260, "2 abrazaderas")
g(h, (RP + 600, 0, 150), X + 170, py + 260, "tensor")
px, py2 = X + 338, py
k = .062; bx, bz = px + 34, py2 + 170
h.rect(bx - 8, py2 + 40, 16, 230, "#fff", K, 1.2)
ex, ez = bx + 8 + LB * k * math.cos(ANG), bz - LB * k * math.sin(ANG)
h.ln(bx + 8, bz, ex, ez, K, 3); h.ln(bx + 8, bz, ex, ez, "#fff", 1.4)
h.ln(bx + 8, bz + 600 * k, bx + 8 + LB * .55 * k * math.cos(ANG), bz - LB * .55 * k * math.sin(ANG), K, 1)
h.rect(ex - 4, ez - 6, 28, 10, "#fff", K, 1)
for z in (bz, bz + 600 * k): h.rect(bx - 11, z - 3, 22, 6, "#fff", K, 1)
h.dimV(bx - 22, bz, bz + 600 * k, "600 (*)", c=OR)
h.txt(bx + 60, bz - 26, "L = 2130", 10, 700, K, "start", CAD, -15)
h.path(f"M{bx+70},{bz} A60,60 0 0 0 {bx+8+62*math.cos(ANG):.1f},{bz-62*math.sin(ANG):.1f}", "none", K, .6); h.ln(bx + 8, bz, bx + 90, bz, K, .4, h.OCULTA)
h.txt(bx + 92, bz + 4, "15° (*)", 9.5, 700, OR)
h.txt(px + 106, py2 + 290, "VISTA LATERAL DEL BRAZO", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 3, "Conectá con los morsetos", ["Fase: morseto 1995/4 con Neozed 2 A sobre el piloto (o sobre la fase si va con fotocontrol).", "Neutro: morseto 1995/6 sobre el neutro de la red.", "No se pela: los morsetos perforan la aislación. La bajada es Cu 3×1,5 F-N-T."],
           ojo="Fusible Neozed puesto antes de cerrar. Llave tubo aislada y cabeza cortada en los dos morsetos.", control="Morsetos con la cabeza cortada y fusible Neozed 2 A colocado.")
h.iso(.2, X + 150, py + 150)
poste(h, 0, 0, -450, 520, RP, RP - 3, "hA")
YL = 260; e = 1.8
cable(h, [(-300, YL, 380), (750, YL, 380)], 12, "#1a1a1a", "#666")            # piloto 1x25
for dy, dz in ((-12, 12), (12, 12), (-12, -12), (12, -12)):
    cable(h, [(-300, YL + dy, -40 + dz), (750, YL + dy, -40 + dz)], 11.5, "#1a1a1a", "#5d5d5d")
# morsetos: fase sobre el piloto (con portafusible) y neutro sobre la red; la derivación sale hacia el poste
xA, xB = 450, 650
zA, zB = 380 - 26 * e, -40 - 26 * e
cable(h, [(xA - 30 * e, YL, zA - 26 * e), (xA - 160, YL, zA - 26 * e - 30), (300, YL - 40, -300), (250, YL - 60, -380)], 6, L1, "#bbb")
cable(h, [(xB - 30 * e, YL, zB - 26 * e), (xB - 160, YL, zB - 26 * e - 40), (330, YL - 40, -330), (250, YL - 60, -380)], 6, NN, "#bbb")
cable(h, [(250, YL - 60, -380), (200, YL - 60, -450)], 9, "#9aa0a6", "#ddd")
morseto(h, xA, YL, zA, e, linea=False, deriv=True, der_len=30, col_der=L1, cabeza="no", pf=True)
morseto(h, xB, YL, zB, e, linea=False, deriv=True, der_len=30, col_der=NN, cabeza="no")
g(h, (xA - 20, YL + 24 * e, zA + 20), X + 15, py + 42, "1995/4 + Neozed 2 A")
g(h, (xB + 20, YL + 24 * e, zB + 10), X + 215, py + 290, "1995/6 (neutro)")
g(h, (730, YL, 380), X + 245, py + 160, "piloto 1×25")
g(h, (730, YL, -28), X + 240, py + 230, "red preensamb.")
g(h, (205, YL - 60, -440), X + 15, py + 285, "bajada Cu 3×1,5")
px, py2 = X + 338, py
y1, y2 = py2 + 80, py2 + 170
h.ln(px + 8, y1, px + 204, y1, K, 1.6); h.ln(px + 8, y2, px + 204, y2, K, 1.6); h.ln(px + 8, y2 + 6, px + 204, y2 + 6, K, 1.6)
h.txt(px + 10, y1 - 6, "PILOTO 1×25", 9, 700); h.txt(px + 10, y2 - 6, "RED (NEUTRO)", 9, 700)
for xx, yy, pf in ((px + 90, y1, True), (px + 140, y2, False)):
    h.rect(xx - 9, yy - 14, 18, 30, "#fff", K, 1.2); h.rect(xx - 3, yy - 22, 6, 8, "#fff", K, .8)
    if pf: h.rect(xx + 9, yy + 2, 14, 12, "#fff", K, 1); h.txt(xx + 26, yy + 12, "NEOZED 2 A", 8.5, 700)
h.path(f"M{px+90},{y1+16} V{py2+225} H{px+120}", "none", K, 1.2); h.path(f"M{px+140},{y2+16} V{py2+225} H{px+120}", "none", K, 1.2)
h.circ(px + 120, py2 + 240, 12, "#fff", K, 1.2); h.txt(px + 120, py2 + 244, "3×1,5", 7.5, 700, K, "middle")
h.txt(px + 106, py2 + 290, "D2 · CONEXIÓN A LA RED", 10, 700, K, "middle")
h.guardar(f"{ID}_p2.svg")

# ================= HOJA 3: pasos 4 y 5
h = pag(3)
X = 40
py = panel(h, X, 4, "Clavá la jabalina con tomacable", ["Jabalina Ø14,6 × 1500 al pie del poste.", "Tomacable en la cabeza de la jabalina, con el V/A 1×10.", "Cabeza de la jabalina enterrada (*)."],
           ojo="(*) Distancia al poste y profundidad de la cabeza: a confirmar con el plano AP-TC-055 (hojas F/G).", control="Jabalina entera clavada, tomacable apretado. Foto antes de tapar.")
h.iso(.07, X + 165, py + 85)
L, A0 = 1400, 700
h.BOX(0, L, 0, A0, -1900, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
h.BOX(0, A0, A0, L, -1900, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
poste(h, A0, A0, -1450, 600, RP + 8, RP + 2, "hA")
h.tuboZ(-1800, -300, 1200, 850, 18, 18, "url(#cobre)", "#7a4512")
h.BOX(1165, 1235, 815, 885, -340, -260, "url(#bronce)", "url(#bronce)", "url(#bronce)", "#5c3a00", .6)
cable(h, [(1200, 885, -290), (1100, 820, -120), (A0 + 130, A0 + 60, 0), (A0 + 120, A0 + 60, 600)], 22, "url(#pe)", None)
g(h, (1200, 850, -1200), X + 215, py + 265, "jabalina Ø14,6 × 1500")
g(h, (1235, 885, -300), X + 235, py + 195, "tomacable")
g(h, (A0 + 120, A0 + 60, 450), X + 230, py + 50, "V/A 1×10")
g(h, (A0, A0, 500), X + 30, py + 50, "poste H°A°")
px, py2 = X + 338, py
gy = py2 + 60; k = .09
h.ln(px + 8, gy, px + 204, gy, K, 1.4); h.rect(px + 8, gy, 196, 180, "url(#EARTH)", K, 0)
h.rect(px + 40, py2 + 30, 26, 220, "#fff", K, 1.2)
jx = px + 130
h.rect(jx - 4, gy + 300 * k, 8, 1500 * k, "#fff", K, 1.2); h.rect(jx - 8, gy + 300 * k - 6, 16, 8, "#fff", K, 1)
h.path(f"M{jx},{gy+300*k-6} C{jx},{gy} {px+70},{gy} {px+66},{gy-30}", "none", K, 1.4)
h.dimV(jx + 30, gy + 300 * k, gy + 1800 * k, "1500", ext=jx + 4)
h.dimV(jx + 52, gy, gy + 300 * k, "300 (*)", ext=jx + 8, c=OR)
h.dimH(gy + 1800 * k + 20, px + 66, jx, "(*)", c=OR)
h.txt(jx - 10, gy + 1000 * k, "Ø14,6", 9, 700, K, "end")
h.txt(px + 106, py2 + 290, "D3 · JABALINA Y TOMACABLE", 10, 700, K, "middle")
X = W / 2 + 18
py = panel(h, X, 5, "Bajá el V/A 1×10 en caño y flejes", ["V/A 1×10 por el poste, del brazo a la jabalina.", "Protegido en caño PVC 3/4\" hasta 2,5 m.", "Caño sujeto con 2 flejes inox con hebilla: 2 × (π × 0,220 + 0,30) = 1,98 m."],
           ojo="(*) Altura de los flejes: a confirmar con el plano. El V/A nunca a la vista abajo de 2,5 m.", control="Caño entero hasta 2,5 m, 2 flejes apretados, V/A sin cortes.")
h.iso(.07, X + 150, py + 245)
h.BOX(-450, 450, -450, 450, -150, 0, "url(#vereda)", "url(#soil3)", "url(#soil3)")
poste(h, 0, 0, 0, 2900, RP + 10, RP + 2, "hA")
cable(h, [(RP + 20, 40, 2500), (RP + 20, 40, 2900)], 9, "url(#pe)", None)
h.tuboZ(0, 2500, RP + 20, 40, 14, 14, "url(#pvc)", "#666")
for z in (700, 2000): anillo(h, 0, 0, z, RP + 30, "#e4e9ee", 4)
g(h, (RP + 20, 40, 1200), X + 230, py + 170, "caño PVC 3/4\"")
g(h, (0, RP + 30, 2000), X + 30, py + 60, "fleje inox + hebilla")
g(h, (0, RP + 30, 700), X + 30, py + 150, "fleje inox + hebilla")
g(h, (RP + 20, 40, 2750), X + 230, py + 50, "V/A 1×10")
px, py2 = X + 338, py
gy = py2 + 260; k = .068
h.ln(px + 8, gy, px + 204, gy, K, 1.4)
h.rect(px + 60, gy - 3300 * k, 26, 3300 * k, "#fff", K, 1.2)
h.rect(px + 86, gy - 2500 * k, 6, 2500 * k, "#fff", K, 1)
for z in (700, 2000): h.rect(px + 56, gy - z * k - 3, 40, 6, "url(#ANSI31)", K, .8)
h.ln(px + 89, gy - 2500 * k, px + 89, gy - 3300 * k, K, .8)
h.dimV(px + 112, gy - 2500 * k, gy, "2500", ext=px + 92)
h.dimV(px + 40, gy - 2000 * k, gy, "(*)", c=OR, ext=px + 56)
h.txt(px + 120, gy - 2000 * k + 3, "FLEJE 0,99 m", 8.5, 700); h.txt(px + 120, gy - 700 * k + 3, "FLEJE 0,99 m", 8.5, 700)
h.txt(px + 106, py2 + 290, "PROTECCIÓN DEL V/A", 10, 700, K, "middle")
h.guardar(f"{ID}_p3.svg")

# ================= HOJA 4: paso 6 + así queda
h = pag(4)
X = 40
py = panel(h, X, 6, "Probá y medí", ["Encendé (piloto o tapando el fotocontrol) y verificá que prende.", "Medí la PAT con el telurímetro: ≤ 10 Ω (ETG).", "Anotá el valor en la orden."],
           ojo="La PAT se mide con la instalación SIN TENSIÓN (guía «Puesta a tierra y medición»). Distancias de las picas: (*) según el telurímetro.", control="Luminaria encendida y PAT ≤ 10 Ω anotada. Foto de la unidad terminada.")
h.iso(.028, X + 120, py + 232)
h.BOX(-400, 3200, -400, 400, -150, 0, "url(#vereda)", "url(#soil3)", "url(#soil3)")
poste(h, 0, 0, 0, 7200, RP + 15, RP - 5, "hA")
brazo(h, 6000, luz=True)
h.BOX(600, 1000, 100, 350, 0, 220, "#facc15", "#eab308", "#ca8a04", "#713f12", .7)
for xx, col in ((2000, "#c62828"), (3000, "#2563eb")):
    h.tuboZ(0, 400, xx, 250, 30, 30, "url(#galv)", "#444"); lin3(h, (800, 250, 220), (xx, 250, 400), col, 1.2)
lin3(h, (800, 250, 220), (0, 120, 0), "#2e9e44", 1.2)
g(h, (800, 350, 110), X + 20, py + 285, "telurímetro (≤ 10 Ω)")
g(h, (RP + 2300, 0, 6500), X + 200, py + 40, "luminaria encendida")
g(h, (3000, 250, 400), X + 250, py + 200, "picas")
px, py2 = X + 338, py
gy = py2 + 170
h.ln(px + 8, gy, px + 204, gy, K, 1.4); h.rect(px + 8, gy, 196, 70, "url(#EARTH)", K, 0)
for xx, t in ((px + 30, "E"), (px + 120, "P"), (px + 190, "C")):
    h.rect(xx - 2, gy - 6, 4, 50, "#fff", K, 1); h.txt(xx, gy - 12, t, 10, 700, K, "middle")
h.rect(px + 60, gy - 60, 40, 26, "#fff", K, 1.2); h.txt(px + 80, gy - 43, "Ω", 13, 700, K, "middle")
for xx in (px + 30, px + 120, px + 190): h.path(f"M{px+80},{gy-34} Q{(px+80+xx)/2},{gy-14} {xx},{gy-6}", "none", K, .6)
h.dimH(gy + 78, px + 30, px + 120, "(*)", c=OR); h.dimH(gy + 78, px + 120, px + 190, "(*)", c=OR)
h.txt(px + 106, py2 + 270, "≤ 10 Ω (ETG) · ≤ 40 Ω por apoyo (ET-1005)", 8.5, 700, K, "middle")
h.txt(px + 106, py2 + 290, "MEDICIÓN DE PAT", 10, 700, K, "middle")
X = W / 2 + 18
asi_queda(h, X, "../hojas/ap_tc_055.png", (1310, 150, 2482, 926), "Plano: AP-TC-055 (borrador, hojas B a G pendientes).", "guía «Tendido aéreo de piloto / preensamblado y transición».",
          "Brazo firme y nivelado, abrazaderas del Ø correcto, morsetos con cabeza cortada, fusible Neozed puesto, luminaria enciende, PAT medida. Foto de la unidad terminada.",
          ["plano oficial AP-TC-055 hojas B a G: qué es TIPO 1, 2 y 3.", "Ø / espesor del brazo y el detalle de la PAT completa."], nombre=f"{ID}_fin.png")
h.guardar(f"{ID}_p4.svg")
print("ok")
