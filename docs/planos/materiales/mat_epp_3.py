"""MAT-EPP-3 (rev. A) · Equipo para trabajo en altura: 9032 cabo de vida con amortiguador, 9033 cinturón de posicionamiento con cola
de amarre de cinta plana 2 m (DE BAJA), 9034 cola de amarre con amortiguador kit Caran CR 45 (DE BAJA). Ganchos, absorbedor y anillos D.
Plano con la geometría de r3d/piezas/perfiles_nepp.mjs (perfiles_nepp.json); 3D: r3d/out/nepp_epp3.png. Fuentes: r3d/FUENTES_nepp.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neppkit import *

h = nuevaN()
A = PN["ALT"]


def tuboPlano(h, pts, d, cerrado=False, sw=1.0):
    """pieza de alambre/tubo de diámetro d (en px) dibujada con doble línea (contorno negro, relleno blanco)"""
    P = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    tag = "polygon" if cerrado else "polyline"
    h.a(f'<{tag} points="{P}" fill="none" stroke="{K}" stroke-width="{d + 2 * sw:.2f}" stroke-linejoin="round" stroke-linecap="round"/>')
    h.a(f'<{tag} points="{P}" fill="none" stroke="#fff" stroke-width="{d:.2f}" stroke-linejoin="round" stroke-linecap="round"/>')


def mosqPts(x, y, e, ang=0):
    """mosquetón (línea media) en la hoja: base en (x, y), largo hacia +x si ang = 0. Misma forma que nepp.mjs/mosqueton"""
    M = A["mosq"]; a = M["a"] - M["d"]; hh = M["L"] - M["d"]; R1 = a / 2; r2 = a * .32; p = [(a, hh - R1 - 18)]
    for i in range(11): t = math.pi * i / 10; p.append((R1 + R1 * math.cos(t), hh - R1 + R1 * math.sin(t)))
    p.append((0, hh * .45))
    for i in range(1, 7): t = math.pi + math.pi / 2 * i / 6; p.append((r2 + r2 * math.cos(t), r2 + r2 * math.sin(t)))
    p += [(a * .7, 0), (a - 2, 5)]
    c, s = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    return [(x + (v * c - (u - a / 2) * s) * e, y + (v * s + (u - a / 2) * c) * e) for u, v in p]


def ganchoPts(x, y, e, ang=0):
    G = A["gancho"]; Rb = (G["apertura"] + G["d"]) / 2; v1 = G["L"] - Rb - G["d"] / 2 - 10; p = [(0, 22), (0, v1)]
    for i in range(1, 13): t = math.pi - math.pi * i / 12; p.append((Rb + Rb * math.cos(t), v1 + Rb * math.sin(t)))
    p += [(2 * Rb, v1 - 26), (2 * Rb - 7, v1 - 38)]
    c, s = math.cos(math.radians(ang)), math.sin(math.radians(ang))
    T = lambda u, v: (x + (v * c - u * s) * e, y + (v * s + u * c) * e)
    ojo = [T(14 * math.sin(2 * math.pi * i / 16), 7 + 15 * math.cos(2 * math.pi * i / 16)) for i in range(16)]
    gat = [T(2 * Rb - 8, v1 - 36), T(G["d"] / 2 + 2, v1 - 46)]
    return [T(u, v) for u, v in p], ojo, gat, Rb, v1


# =============== 1. DESARROLLOS (estirados) ===============
h.titulo(40, 62, "DESARROLLO (ESTIRADOS)", "ESC. 1:3 · LARGO TOTAL CON CONECTORES Y ABSORBEDOR ≤ 2000 (EN 355)")
e = .34; X0 = 70
filas = [("9032", "CABO DE VIDA (CUERDA)", "cuerda", 124), ("9034 †", "COLA C/ AMORTIGUADOR CR 45", "cinta", 192), ("9033 †", "COLA DE AMARRE CINTA 2 m", "cinta2", 260)]
for cod, nom, tipo, yy in filas:
    h.txt(X0 - 30, yy - 22, f"{cod} · {nom}", 9.5, 700, ROJO if "†" in cod else K)
    xa = X0 + A["mosq"]["L"] * e          # fin del mosquetón
    gL = A["gancho"]["L"] if tipo != "cinta2" else A["mosq"]["L"]
    xb = X0 + (A["Lmax"] - gL) * e          # inicio del conector del otro extremo
    if tipo == "cuerda":
        h.ln(xa, yy, xb, yy, K, A["cuerda"]["d"] * e + 2.2); h.ln(xa, yy, xb, yy, "#fff", A["cuerda"]["d"] * e)
    else:
        h.rect(xa, yy - A["cinta"]["a"] * .8 * e / 2, xb - xa, A["cinta"]["a"] * .8 * e, "url(#POLI)", K, .9)
        for xx in (xa + 6, xb - 12): h.rect(xx, yy - 5, 6, 10, K, K, 0)          # costuras de barra
    tuboPlano(h, mosqPts(X0, yy, e, 0), A["mosq"]["d"] * e)
    if tipo == "cinta2": tuboPlano(h, mosqPts(xb + A["mosq"]["L"] * e, yy, e, 180), A["mosq"]["d"] * e)
    else:
        L, ojo, gat, Rb, v1 = ganchoPts(xb, yy, e, 0)
        tuboPlano(h, L, A["gancho"]["d"] * e); tuboPlano(h, ojo, A["gancho"]["d"] * e * .8, cerrado=True); h.ln(*gat[0], *gat[1], K, 1.6)
    if tipo != "cinta2":
        ab = A["absorbedor"]; xab = xb - 40 * e - ab["L"] * e
        h.rect(xab, yy - ab["a"] * e / 2, ab["L"] * e, ab["a"] * e, "#fff", K, 1.2); h.txt(xab + ab["L"] * e / 2, yy + 3, "EN 355", 7, 700, K, "middle")
h.dimH(304, X0, X0 + A["Lmax"] * e, "2000 MAX. (EN 355, CON CONECTORES)", ext=272)
for n, (x, y), (gx, gy) in [("1", (X0 + 20, 124 + 10), (X0 - 12, 104)), ("2", (X0 + 1200 * e, 124), (X0 + 1200 * e, 100)), ("3", (X0 + (A["Lmax"] - 245 - 40 - 100) * e, 124), (X0 + 1500 * e, 98)),
                              ("4", (X0 + (A["Lmax"] - 120) * e, 124 + 8), (X0 + 2000 * e + 18, 146)), ("5", (X0 + 900 * e, 192), (X0 + 900 * e, 168)), ("6", (X0 + 120 * e, 192 + 5), (X0 + 260 * e, 222))]:
    h.globo(n, x, y, gx, gy, r=8)

# =============== 2. DETALLES DE CONECTORES ===============
h.titulo(40, 344, "D1 - MOSQUETON", "ESC. 1:1 · ACERO · EN 362")
M_ = A["mosq"]; mp = mosqPts(110, 380, 1.0, 90)
tuboPlano(h, mp, M_["d"])
xs = [p[0] for p in mp]; ys = [p[1] for p in mp]
h.dimV(min(xs) - 16, min(ys) - M_["d"] / 2, max(ys) + M_["d"] / 2, "110 (*)", ext=min(xs) - 4, c=OR)
h.dimH(max(ys) + 22, min(xs) - M_["d"] / 2, max(xs) + M_["d"] / 2, "66 (*)", ext=max(ys) + 6, c=OR)
gx_ = max(xs); h.ln(gx_ - 2, min(ys) + 30, gx_ - 2, max(ys) - 8, K, 6.5); h.ln(gx_ - 2, min(ys) + 30, gx_ - 2, max(ys) - 8, "#fff", 4.5)
h.rect(gx_ - 9, max(ys) - 40, 14, 24, "url(#ACERO)", K, .8)
llamada(h, gx_ + 4, max(ys) - 28, gx_ + 24, max(ys) - 10, "VIROLA", sz=8.5)
llamada(h, gx_, min(ys) + 50, gx_ + 24, min(ys) + 34, "GATILLO", sz=8.5)
h.txt(min(xs) - 4, max(ys) + 50, "APERTURA 18 (*)", 8.5, 700, OR)

h.titulo(225, 344, "D2 - GANCHO", "ESC. 1:2 · ALUMINIO")
L, ojo, gat, Rb, v1 = ganchoPts(258, 515, .5, -90)
tuboPlano(h, L, A["gancho"]["d"] * .5); tuboPlano(h, ojo, A["gancho"]["d"] * .4, cerrado=True); h.ln(*gat[0], *gat[1], K, 2.4)
h.dimV(232, 515 - 245 * .5 + 8, 515 + 8, "245 (*)", ext=246, c=OR)
xb0, xb1 = 258 + A["gancho"]["d"] * .25, 258 + 2 * Rb * .5 - 3.5
h.dimH(515 - v1 * .5 - Rb * .5 - 16, xb0, xb1, "60 (*)", ext=515 - v1 * .5 - 4, c=OR)
llamada(h, *gat[0], 340, 430, "GATILLO", sz=8.5); llamada(h, 258, 470, 300, 480, "PALANCA DE TRABA", sz=8.5)

h.titulo(400, 344, "D3 - ANILLO D", "ESC. 1:1 · FORJADO")
D_ = A["anilloD"]; a = D_["a"] - D_["d"]; hh = D_["h"] - D_["d"]; ox, oy = 470, 460
q = [(ox - a / 2, oy), (ox + a / 2, oy)] + [(ox + a / 2 * math.cos(math.pi * i / 14), oy - hh * math.sin(math.pi * i / 14)) for i in range(15)]
tuboPlano(h, q, D_["d"], cerrado=True)
h.dimH(oy + 22, ox - D_["a"] / 2, ox + D_["a"] / 2, "62 (*)", ext=oy + 6, c=OR); h.dimV(ox + D_["a"] / 2 + 16, oy - D_["h"] + D_["d"] / 2, oy + D_["d"] / 2, "52 (*)", ext=ox + 6, c=OR)
h.txt(ox - 34, oy - 66, "UNO A CADA LADO", 8.5, 400, K); h.txt(ox - 34, oy - 56, "DEL CINTURON 9033", 8.5, 400, K)

h.titulo(580, 344, "D4 - ABSORBEDOR EN CORTE", "ESC. 1:2 · CINTA DESGARRABLE PLEGADA (*)")
ab = A["absorbedor"]; k4 = .9; bx, by = 600, 440
h.rect(bx, by - ab["e"] * k4 / 2, ab["L"] * k4, ab["e"] * k4, "url(#PLAST)", K, 1.2)
h.rect(bx + 3, by - ab["e"] * k4 / 2 + 3, ab["L"] * k4 - 6, ab["e"] * k4 - 6, "#fff", K, .6)
zz = [(bx + 8 + i * 9, by + (-9 if i % 2 else 9)) for i in range(int((ab["L"] * k4 - 16) / 9) + 1)]
h.a('<polyline points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in zz) + f'" fill="none" stroke="{K}" stroke-width="1.6"/>')
h.ln(bx - 30, by, bx + 8, by, K, 2.4); h.ln(zz[-1][0], zz[-1][1], bx + ab["L"] * k4 + 30, by, K, 2.4)
h.dimH(by + ab["e"] * k4 / 2 + 16, bx, bx + ab["L"] * k4, "190 (*)", ext=by + ab["e"] * k4 / 2 + 2, c=OR)
h.txt(bx, by - 30, "EN UNA CAIDA SE DESCOSE Y SE ESTIRA", 8.5, 700, K); h.txt(bx, by + 46, "≤ 6 kN AL CUERPO · ESTIRA HASTA 1750 (*)", 8.5, 700, OR)

# secciones: cinta y cuerda
h.titulo(580, 524, "D5 - SECCIONES", "ESC. 3:1")
h.rect(600, 562, A["cinta"]["a"] * 3, A["cinta"]["e"] * 3, "url(#POLI)", K, 1)
h.dimH(552, 600, 600 + A["cinta"]["a"] * 3, "45 (*)", ext=560, c=OR); h.txt(600, 592, "CINTA PLANA POLIESTER e 2,2 (*)", 8.5, 400, OR)
cx_, cy_ = 790, 572; rr = A["cuerda"]["d"] / 2 * 3
h.circ(cx_, cy_, rr, "url(#POLI)", K, 1); h.circ(cx_, cy_, rr * .62, "#fff", K, .7)
for i in range(7): t = 2 * math.pi * i / 7; h.circ(cx_ + rr * .32 * math.cos(t), cy_ + rr * .32 * math.sin(t), rr * .17, "#fff", K, .4)
h.dimH(cy_ + rr + 12, cx_ - rr, cx_ + rr, "Ø12 (*)", ext=cy_ + 2, c=OR); h.txt(cx_ - 22, cy_ + rr + 32, "CAMISA + ALMA", 8.5, 400, K)

# =============== 3. CINTURÓN 9033 ===============
h.titulo(40, 560, "9033 † · CINTURON DE POSICIONAMIENTO", "ESC. 1:6 · PLANTA (EN 358)")
Cb = A["cinturon"]; k5 = 1 / 6; ex, ey = 200, 632; ra, rb = 240 * k5 * 1.0, 150 * k5
h.a(f'<ellipse cx="{ex}" cy="{ey}" rx="{ra + Cb["a"] * .3 * k5}" ry="{rb + Cb["a"] * .3 * k5}" fill="url(#POLI)" stroke="{K}" stroke-width="1.1"/>')
h.a(f'<ellipse cx="{ex}" cy="{ey}" rx="{ra - Cb["a"] * .3 * k5}" ry="{rb - Cb["a"] * .3 * k5}" fill="#fff" stroke="{K}" stroke-width="1.1"/>')
h.rect(ex - 9, ey + rb - 6, 18, 12, "#fff", K, 1.2)
for sg in (1, -1):
    xx = ex + sg * (ra + 8); h.a(f'<path d="M{xx},{ey - 6} L{xx},{ey + 6} A9,9 0 0 {1 if sg > 0 else 0} {xx},{ey - 6}" fill="none" stroke="{K}" stroke-width="2"/>')
h.a(f'<path d="M{ex - ra * .6},{ey - rb - 4} A{ra},{rb} 0 0 1 {ex + ra * .6},{ey - rb - 4}" fill="none" stroke="{K}" stroke-width="6" stroke-opacity=".25"/>')
h.dimH(ey + rb + 22, ex - ra, ex + ra, "CINTURA 1150 (*)", ext=ey + 4, c=OR)
llamada(h, ex, ey - rb - 4, ex + 60, ey - rb - 22, "ALMOHADILLA (ESPALDA)", sz=8.5); llamada(h, ex + 4, ey + rb, ex + 70, ey + rb + 14, "HEBILLA", sz=8.5)
llamada(h, ex + ra + 14, ey, ex + ra + 30, ey - 22, "ANILLO D", sz=8.5)
h.txt(380, 610, "POSICIONAMIENTO: EL OPERARIO SE APOYA", 9, 700, K); h.txt(380, 623, "EN LA COLA PASADA ALREDEDOR DEL POSTE", 9, 700, K)
h.txt(380, 636, "Y ENGANCHADA A LOS DOS ANILLOS D.", 9, 700, K); h.txt(380, 652, "NO ES ANTICAIDAS: SIEMPRE CON ARNES", 9, 700, OR)
h.txt(380, 665, "DE CUERPO ENTERO (EN 361) + 9032.", 9, 700, OR)

# =============== TABLAS Y TEXTOS ===============
TY = 712
dato = {"9032": "EN 355 · ≤ 2 m · 6 kN", "9033": "EN 358", "9034": "EN 355 · CR 45 (*)"}
yt = tablaCodigos(h, 40, TY, [9032, 9033, 9034], dato, w_desc=380, w_dato=140, n=58)
rayadosN(h, 700, TY, ["POLI", "ACERO", "PLAST"], cols=1, dx=150)
yb = bloque(h, 40, yt + 18, "DONDE SE USA", [
    "TRABAJO EN ALTURA: ARMADO Y REPARACION DE LUMINARIAS, VINCULOS Y TABLEROS EN POSTE, IZAJE DE COLUMNAS Y TAREAS DESDE LA CANASTA DEL HIDROELEVADOR.",
    "9032 / 9034: SE ENGANCHAN AL ANILLO DORSAL O PECTORAL DEL ARNES (MOSQUETON) Y AL ANCLAJE (GANCHO DE ANDAMIO). 9033: SUBIDA AL POSTE CON ESCALERA."], w=800, sz=10, lh=13.5)
notasW(h, 40, yb + 6, [
    "COTAS EN mm. LARGO TOTAL ≤ 2000 CON CONECTORES Y FUERZA DE FRENADO ≤ 6 kN: EN 355 (MANUALES Y GUIAS DE FABRICANTES). (*) EL RESTO ES PROPORCIONAL: A CONFIRMAR CON EL EQUIPO DEL PAÑOL.",
    "(*) EL PEDIDO CITA IRAM 3605 (CINTURONES Y ARNESES); LOS CABOS Y ABSORBEDORES CERTIFICADOS EN ARGENTINA CITAN IRAM 3622. CONECTORES: EN 362. ESTIRAMIENTO 1750: A CONFIRMAR.",
    "† 9033 Y 9034 ESTAN DE BAJA EN EL RESPALDO (ACTIVO = FALSE). (*) 9034 «CARAN CR 45»: NO SE ENCONTRO FICHA PUBLICADA.",
    "(*) 9033 JUNTA EN UN CODIGO EL CINTURON Y LA COLA DE 2 m: ¿ES UN JUEGO O SON DOS COSAS? A CONFIRMAR."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - EQUIPO DE ALTURA APOYADO EN EL PISO", "IZQ. A DER.: 9032 CUERDA · 9034 CINTA ROJA CR 45 · 9033 CINTURON Y SU COLA DE 2 m (LARGO REAL)")
A3 = img3d(h, "nepp_epp3", 905, 92, 735)
columna(h, A3, [("cuerda", "2", "CUERDA Ø12"), ("absorb1", "3", "ABSORBEDOR"), ("mosq1", "1", "MOSQUETON"), ("traba1", "", "TRABA"), ("gancho1", "4", "GANCHO 60 mm")], 905, 300, 620, paso=30)
for an, n, t, gx, gy in [("cintaR", "5", "CINTA CR 45", 1170, 180), ("absorb2", "3", "ABSORBEDOR", 1170, 520), ("barra2", "6", "COSTURA DE BARRA", 1170, 560),
                         ("almohadilla", "", "ALMOHADILLA", 1250, 132), ("anilloD2", "", "ANILLO D", 1040, 390), ("hebilla", "", "HEBILLA", 1250, 450),
                         ("anilloD", "", "ANILLO D", 1530, 300), ("cinturon", "", "CINTURON 9033", 1500, 420), ("cintaN", "", "COLA 2 m", 1530, 200), ("mosq4", "1", "MOSQUETON", 1530, 610)]:
    globo3d(h, A3(an), n, gx, gy, t)
cajaUso(h, 905, 660, 735, "ANTES DE CADA USO · USO EN OBRA", [
    "✓ REVISA COSTURAS Y CINTA (CORTES, QUEMADURAS, DESHILACHADO, PINTURA), LA CUERDA (CAMISA GASTADA, ALMA A LA VISTA) Y QUE LOS GATILLOS CIERREN Y TRABEN SOLOS.",
    "✓ ABSORBEDOR CERRADO: SI ESTA ABIERTO, DESCOSIDO O ESTIRADO, YA FRENO UNA CAIDA: FUERA DE SERVICIO. REVISION ANUAL POR PERSONA COMPETENTE (EN 365) (*).",
    "✓ ENGANCHA SIEMPRE A UN PUNTO FIRME POR ARRIBA DE LA CINTURA (EN LA CANASTA: AL ANCLAJE DE LA CANASTA). NUNCA A LA LUMINARIA, AL BRAZO NI AL CABLE.",
    "⚠ EL CINTURON 9033 SOLO POSICIONA: NO FRENA UNA CAIDA. PARA CAIDA: ARNES DE CUERPO ENTERO + 9032 / 9034.",
    "⚠ NO ANUDES NI ALARGUES UN CABO CON OTRO, NO PASES LA CINTA POR CANTOS VIVOS Y DEJA LUGAR LIBRE ABAJO PARA QUE EL ABSORBEDOR SE ESTIRE (*).",
    "⚠ GUARDALO SECO, A LA SOMBRA, LEJOS DE ACIDO DE BATERIA, COMBUSTIBLE Y CHISPAS DE AMOLADORA."])
h.txt(905, 1028, "RENDER: three.js (r3d/escenas/nepp_epp3.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_nepp.md", 9, 400, G, "start", INT)
rotuloMat(h, "MAT-EPP-3", "EQUIPO PARA TRABAJO", "EN ALTURA", "DESARROLLOS, DETALLES D1-D5, CINTURON Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_epp_3.svg"))
