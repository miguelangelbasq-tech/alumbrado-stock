"""MAT-EPP-1 (rev. B) · Juego dieléctrico: guante clase 0 (9010), interior de tela (9009), sobreguante de vaqueta (9017),
cobertor de vaqueta amarillo (3096) y alfombra de caucho dieléctrica 3 mm (3091).
Plano con la geometría de r3d/piezas/perfiles_nepp.mjs (perfiles_nepp.json); 3D: r3d/out/nepp_epp1.png. Fuentes: r3d/FUENTES_nepp.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neppkit import *

h = nuevaN()
PU = PN["PUNOS"]; D = PU["dielectrico"]

# =============== 1. GUANTE DIELÉCTRICO 9010 · PALMA ===============
h.titulo(40, 62, "9010 · PALMA", "ESC. 1:1 · MANO DERECHA")
e = 1.0; v = Vista(h, 128, 296, e)
guantePlano(v, "g9010")
v.linea([[-D["wA"] / 2 + 2, D["v0"] + 4], [D["wA"] / 2 - 2, D["v0"] + 4]], .5)                # borde enrollado
v.rect(-26, 26, -135, -105, "none", .7, h.OCULTA)                                                # zona de la marca
h.txt(*v.p(0, -123), "MARCA", 8, 700, K, "middle"); h.txt(*v.p(0, -114), "(VER 3D)", 7.5, 400, K, "middle")
v.cotaV(-90, D["v0"], 190, "360", yext=-76)
v.cotaH(-D["wA"] / 2, D["wA"] / 2, D["v0"] - 26, "150 (*)", zext=D["v0"] - 1, c=OR)
v.cotaV(118, D["v0"], 6, "170 (*)", yext=78)
v.cotaV(118, 6, 190, "184", yext=12)
v.cotaH(-50, 50, 72, "100 (*)", zext=100, c=OR)
lineaCorte(h, v.p(-D["wA"] / 2 - 10, -60)[0], v.p(0, -60)[1], v.p(D["wA"] / 2 + 10, -60)[0], v.p(0, -60)[1], "A")
lineaCorte(h, v.p(0, 30)[0], v.p(0, 30)[1], v.p(0, D["v0"] + 10)[0], v.p(0, D["v0"] + 10)[1], "B", lado=-1)
for n, (u, vv), (gx, gy) in [("1", (40, 60), (262, 150)), ("2", (60, D["v0"] + 4), (262, 452)), ("3", (-10, -120), (262, 400))]:
    a = v.p(u, vv); h.globo(n, a[0], a[1], gx, gy, r=9)

# =============== 2. CORTE A-A (puño aplanado) ===============
h.titulo(298, 62, "CORTE A-A", "ESC. 2:1 · PUÑO DE GOMA, ESPESOR ≈ 1")
w = D["wA"] + (D["wB"] - D["wA"]) * (-60 - D["v0"]) / (6 - D["v0"]); b = w * D["kz"]; k2 = 2.0; cx, cy = 445, 160
h.a(f'<ellipse cx="{cx}" cy="{cy}" rx="{w / 2 * k2:.1f}" ry="{b / 2 * k2:.1f}" fill="url(#GOMA)" stroke="{K}" stroke-width="1.2"/>')
h.a(f'<ellipse cx="{cx}" cy="{cy}" rx="{(w / 2 - 1) * k2:.1f}" ry="{(b / 2 - 1) * k2:.1f}" fill="#fff" stroke="{K}" stroke-width=".8"/>')
h.ln(cx - w / 2 * k2 - 14, cy, cx + w / 2 * k2 + 14, cy, K, .45, h.EJE)
h.dimH(cy + b / 2 * k2 + 18, cx - w / 2 * k2, cx + w / 2 * k2, f"{w:.0f} (*) APLANADO", ext=cy + 2, c=OR)
llamada(h, cx + w / 2 * k2 * .55, cy - b / 2 * k2 * .82, cx + 60, cy - 46, "GOMA ≈ 1 (*)", sz=9)
h.txt(cx, cy + 4, "INTERIOR (MANO)", 9, 400, G, "middle")

# =============== 3. OTROS GUANTES DEL JUEGO (contornos) ===============
h.titulo(626, 62, "9009 · 3096 · 9017", "ESC. 1:3")
e3 = .34
for i, (key, nom) in enumerate([("g9009", "9009 INTERIOR"), ("g3096", "3096 COBERTOR"), ("g9017", "9017 VAQUETA")]):
    x0, x1, y0, y1 = bboxG(key); ox = 646 + i * 76 - x0 * e3 + 6; vv = Vista(h, ox, 100 + y1 * e3 + 6, e3)
    guantePlano(vv, key, dedos=False, sw=1.0)
    vv.cotaV(x0 - 9, y0, y1, f"{y1 - y0:.0f} (*)", yext=x0 - 2, c=OR)
    h.txt(ox + (x0 + x1) / 2 * e3, 228, nom.split()[0], 9, 700, K, "middle"); h.txt(ox + (x0 + x1) / 2 * e3, 239, nom.split()[1], 8, 400, K, "middle")

# =============== 4. D1 · BORDE ENROLLADO ===============
h.titulo(298, 272, "D1 - BORDE", "ESC. 10:1 (*)")
k1 = 10; bx, by = 335, 352
h.rect(bx, by - 5, 90, 10, "url(#GOMA)", K, 1.1)                                         # pared 1
h.circ(bx, by, 2.4 * k1, "url(#GOMA)", K, 1.1); h.circ(bx, by, .9 * k1, "#fff", K, .6)  # cordón enrollado
h.dimV(bx + 116, by - 5, by + 5, "1 (*)", ext=bx + 92, c=OR)
h.dimH(by + 2.4 * k1 + 14, bx - 2.4 * k1, bx + 2.4 * k1, "Ø4,8 (*)", ext=by + 2, c=OR)
h.txt(bx - 26, by + 62, "EVITA QUE SE RASGUE", 8.5, 400, G); h.txt(bx - 26, by + 73, "LA BOCA DEL GUANTE", 8.5, 400, G)

# =============== 5. CORTE B-B · CONJUNTO PUESTO ===============
h.titulo(470, 272, "CORTE B-B · CONJUNTO PUESTO", "ESC. 1:2 · ESPESORES EXAGERADOS")
kb = .5; X = lambda vv: 460 + (vv + 175) * kb          # v → x (la boca a la izquierda)
yc = 390
capas = [("TELA", -62, 190, 26, "9009 INTERIOR"), ("GOMA", D["v0"], 190, 33, "9010 GOMA CLASE 0"), ("CUERO", PU["cobertor"]["v0"], 204, 41, "3096 COBERTOR")]
for pat, v0, v1, off, t in capas:
    for sg in (-1, 1):
        y = yc + sg * off; h.rect(X(v0), min(y, y + sg * 6), X(v1) - X(v0), 6, f"url(#{pat})", K, .8)
h.ln(X(-180), yc, X(210), yc, K, .45, h.EJE); h.txt(X(60), yc + 4, "MANO", 9, 400, G, "middle")
for (pat, v0, v1, off, t), (gx, gy) in zip(capas, [(X(200) + 36, yc - 48), (X(200) + 36, yc - 30), (X(200) + 36, yc - 66)]):
    h.globo({"TELA": "4", "GOMA": "2", "CUERO": "5"}[pat], X(v1) - 6, yc - off - 3, gx, gy, r=9); h.txt(gx + 14, gy + 4, t, 8.5, 700)
yd = yc + 62
h.dimH(yd, X(D["v0"]), X(PU["cobertor"]["v0"]), "45 (≥ 13 ASTM F496)", ext=yc + 39)
h.txt(X(-150), yd + 18, "EL PUÑO DE GOMA SOBRESALE DEL CUERO", 8.5, 700, K)

# =============== 6. ALFOMBRA 3091 ===============
A = PN["ALF"]
h.titulo(40, 520, "3091 · ALFOMBRA", "ESC. 1:10 · PLANTA")
ka = .13; ax, ay = 66, 552
h.rect(ax, ay, A["W"] * ka, A["L"] * ka, "#fff", K, 1.3)
for i in range(1, 40): h.ln(ax + i * A["W"] * ka / 40, ay + 2, ax + i * A["W"] * ka / 40, ay + A["L"] * ka - 2, K, .25)
h.dimH(ay + A["L"] * ka + 16, ax, ax + A["W"] * ka, "1000", ext=ay + A["L"] * ka + 2)
h.dimV(ax + A["W"] * ka + 16, ay, ay + A["L"] * ka, "1000", ext=ax + A["W"] * ka + 2)
lineaCorte(h, ax - 8, ay + 90, ax + A["W"] * ka + 8, ay + 90, "C")
h.txt(ax + A["W"] * ka + 30, ay + 20, "NERVADURAS", 8.5, 400, G); h.txt(ax + A["W"] * ka + 30, ay + 31, "ARRIBA", 8.5, 400, G)

h.titulo(286, 520, "CORTE C-C", "ESC. 10:1 · ESPESOR Y NERVADURAS")
kc = 10; N = A["nerv"]; cx0, cyb = 300, 640; base = A["e"] - N["alto"]
pts = [(0, 0), (22, 0), (22, base)]
x = 22
while x > 0:
    pass; break
# perfil: base + nervios (desde la izquierda)
poly = [(0, 0), (24, 0)]; xx = 24; top = []
u = 24
seq = [(0, base)]
cur = 0.0
while cur < 24 - 1e-6:
    r0 = cur + (N["paso"] - N["ancho"]) / 2; r1 = r0 + N["ancho"]
    seq += [(r0, base), (r0, A["e"]), (r1, A["e"]), (r1, base)]; cur += N["paso"]
seq += [(24, base)]
P_ = [(cx0 + a * kc, cyb - b_ * kc) for a, b_ in [(0, 0), (24, 0)] + list(reversed(seq))]
h.a('<polygon points="' + " ".join(f"{p[0]:.1f},{p[1]:.1f}" for p in P_) + f'" fill="url(#GOMA)" stroke="{K}" stroke-width="1.2" stroke-linejoin="round"/>')
h.dimV(cx0 - 14, cyb - A["e"] * kc, cyb, "3", ext=cx0 + 2 * kc)
r0 = (N["paso"] - N["ancho"]) / 2
h.dimH(cyb - A["e"] * kc - 14, cx0 + r0 * kc, cx0 + (r0 + N["paso"]) * kc, "6 (*)", ext=cyb - A["e"] * kc - 1, c=OR)
h.dimH(cyb + 16, cx0 + r0 * kc, cx0 + (r0 + N["ancho"]) * kc, "3 (*)", ext=cyb + 2, c=OR)
llamada(h, cx0 + (r0 + N["paso"] * 2 + 1.5) * kc, cyb - (A["e"] - .2) * kc, cx0 + 150, cyb - 62, "NERVADURA 0,7 (*)", sz=8.5)
llamada(h, cx0 + 18 * kc, cyb - 1 * kc, cx0 + 170, cyb + 24, "CAUCHO (*)", sz=8.5)
h.txt(cx0 - 14, cyb + 50, "IEC 61111 CLASE 0: USO 1000 V · ENSAYO 5000 V", 8.5, 700, K); h.txt(cx0 - 14, cyb + 62, "NO PERFORA A 10 000 V (FICHAS MCG / RS)", 8.5, 400, K)

# =============== 7. PRUEBA DE INFLADO (pictogramas) ===============
h.titulo(580, 520, "PRUEBA DE INFLADO", "ANTES DE CADA USO")
kp = .26
for i, (txt1, txt2) in enumerate([("1. ENROLLAR", "LA BOCA"), ("2. SE INFLAN", "LOS DEDOS"), ("3. MIRAR Y", "ESCUCHAR")]):
    ox = 618 + i * 86; vp = Vista(h, ox, 600, kp)
    guantePlano(vp, "g9010", dedos=False, sw=.9, muneca=False)
    if i >= 1:
        for d in PN["DEDOS"]["g9010"]:
            c = vp.p(*d["p1"]); h.circ(c[0], c[1], d["r"] * kp * (1.35 if i == 1 else 1.2), "none", K, .5)
    for k_ in range(3 if i else 1):
        y = vp.p(0, D["v0"] + 16 + k_ * 14)[1]; h.a(f'<ellipse cx="{ox:.1f}" cy="{y:.1f}" rx="{(D["wA"] / 2 - 4 - k_ * 6) * kp:.1f}" ry="3.2" fill="#fff" stroke="{K}" stroke-width=".7"/>')
    if i == 0: h.path(f"M{ox - 22},{vp.p(0, D['v0'])[1] + 10} q22,10 44,0", "none", K, .8, 'marker-end="url(#fl)"')
    h.txt(ox, 712, txt1, 8, 700, K, "middle"); h.txt(ox, 722, txt2, 8, 400, K, "middle")

# =============== TABLAS Y TEXTOS ===============
TY = 748
dato = {"9010": "CLASE 0 · USO 1000 V CA", "9009": "VA DEBAJO DEL 9010", "9017": "SOBREGUANTE · NO AISLA",
        "3096": "VA ENCIMA DEL 9010", "3091": "IEC 61111 CLASE 0"}
yt = tablaCodigos(h, 40, TY, [9010, 9009, 3096, 9017, 3091], dato, w_desc=380, w_dato=150, n=60)
yb = bloque(h, 40, yt + 20, "DONDE SE USA", [
    "MANIOBRAS CON TENSION ≤ 1000 V: TABLERO DE PLAZA Y DE TRANSICION, CAMBIO DE FUSIBLES NH, ACOMETIDA Y CONEXION AL MEDIDOR, PRUEBA DE ENCENDIDO.",
    "LA ALFOMBRA SE TIENDE EN EL PISO FRENTE AL TABLERO; EL OPERARIO TRABAJA PARADO SOBRE ELLA CON EL JUEGO PUESTO (INTERIOR + GOMA + CUERO)."], w=800, sz=10, lh=13.5)
rayadosN(h, 688, TY, ["GOMA", "CUERO", "TELA"], cols=1, dx=150)
notasW(h, 40, yb + 6, [
    "COTAS EN mm. LARGO 360 Y CLASE 0 = GUANTES COMERCIALES (CATU, SIBILLE). (*) ANCHOS, ESPESOR ≈1 Y TALLE: PROPORCIONALES, A CONFIRMAR CON EL DEL PAÑOL.",
    "IEC 60903 CLASE 0: USO 1000 V CA · ENSAYO 5000 V (= CATALOGO «CLASE 0 5000 V · TENSION DE USO 1000 V»). DOBLE TRIANGULO (IEC 60417-5216) Y ETIQUETA ROJA.",
    "(*) EL COLOR DE LA GOMA DEPENDE DEL FABRICANTE (ROJO, BEIGE O NEGRO): LA CLASE LA DICE LA ETIQUETA. SOBRESALE ≥ 13: ASTM F496.",
    "(*) 9017 «VAQUETA DE 1/2»: SE TOMA COMO MEDIO PUÑO. EL CUERO NO AISLA: SOLO PROTEGE LA GOMA. ALFOMBRA: NERVADURAS PASO 6, 3 Y 0,7 A CONFIRMAR.",
    "(*) UNIDAD «Un.» EN 9010 / 9009 / 9017 / 3096: ¿PAR O GUANTE? A CONFIRMAR EN EL PAÑOL."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - JUEGO DIELECTRICO SOBRE LA ALFOMBRA 3091", "DE IZQ. A DER.: INTERIOR 9009 · GOMA 9010 · COBERTOR 3096 · CONJUNTO PUESTO · VAQUETA 9017")
A3 = img3d(h, "nepp_epp1", 905, 84, 730)
columna(h, A3, [("interior", "4", "INTERIOR DE ALGODON"), ("interiorPuno", "", "PUÑO ELASTIZADO"), ("dielectrico", "1", "GOMA CLASE 0"),
                ("marca", "3", "MARCA DE CLASE"), ("borde", "2", "BORDE ENROLLADO"), ("alfombra", "10", "ALFOMBRA 3 mm")], 912, 120, 600)
columna(h, A3, [("vaqueta", "6", "VAQUETA 9017"), ("cobertor", "5", "COBERTOR 3096"), ("costura", "", "COSTURA"), ("conjunto", "", "CONJUNTO PUESTO"),
                ("sobresale", "7", "SOBRESALE LA GOMA"), ("nervio", "11", "NERVADURA"), ("espesor", "", "ESPESOR 3")], 1490, 118, 600)
h.txt(1345, 652, "D3 - CONJUNTO CORTADO A CUARTO EN EL PUÑO", 10.5, 700, NV, "start", INT)
A4 = img3d(h, "nepp_epp1b", 1345, 660, 300)
columna(h, A4, [("cuero", "5", "CUERO"), ("goma", "1", "GOMA"), ("tela", "4", "ALGODON"), ("sobre", "7", "≥ 13")], 1350, 690, 870, paso=22)
cajaUso(h, 905, 650, 430, "ANTES DE CADA USO · USO EN OBRA", [
    "✓ FECHA DEL ULTIMO ENSAYO (MARCADA EN EL PUÑO O EN LA PLANILLA): SI ESTA VENCIDA, NO SE USA. CLASE 0: REENSAYO CADA 6 MESES EN USO (*).",
    "✓ INFLALO: ENROLLA LA BOCA, APRETA Y ACERCALO A LA CARA Y AL OIDO: NI UNA PERDIDA. MIRA CORTES, PINCHADURAS, GRIETAS, AMPOLLAS, ZONAS PEGAJOSAS O DURAS.",
    "✓ SIEMPRE LOS TRES: INTERIOR DE ALGODON (9009) + GOMA (9010) + CUERO (3096 / 9017). EL PUÑO DE GOMA SOBRESALE DEL CUERO.",
    "✓ ALFOMBRA LIMPIA, SECA, SIN CORTES NI ALAMBRES ENCIMA, BIEN APOYADA FRENTE AL TABLERO.",
    "⚠ CLASE 0 = HASTA 1000 V CA. NO SIRVE PARA MEDIA TENSION. EL CUERO SOLO NO AISLA; LA GOMA SOLA SE CORTA CON UN ALAMBRE.",
    "⚠ GUARDALO EN SU BOLSA, ESTIRADO, SIN DOBLAR, LEJOS DEL SOL, EL CALOR, NAFTA Y SOLVENTES. SIN CINTAS NI PINTURA.",
    "⚠ SI FALLA UNA PRUEBA: FUERA DE SERVICIO, CORTALO Y AVISA AL PAÑOL."], )
h.txt(905, 1028, "RENDER: three.js (r3d/escenas/nepp_epp1.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_nepp.md", 9, 400, G, "start", INT)
rotuloMat(h, "MAT-EPP-1", "GUANTES DIELECTRICOS", "Y ALFOMBRA AISLANTE", "PALMA, CORTES A-A / B-B / C-C, DETALLE D1, INFLADO Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_epp_1.svg"))
