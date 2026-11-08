"""MAT-INSTRUMENTOS-1 (rev. A) · Pinza amperométrica digital Pro'sKit MT-3202 (3084) y detector de tensión por inducción (3085).
Plano con la geometría de r3d/piezas/perfiles_nepp.mjs (perfiles_nepp.json); 3D: r3d/out/nepp_inst1.png. Fuentes: r3d/FUENTES_nepp.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neppkit import *

h = nuevaN()
P = PN["PINZA"]; C = PN["PINZA_C"]

# =============== 1. PINZA · FRENTE ===============
h.titulo(40, 62, "3084 · PINZA MT-3202 · FRENTE", "ESC. 1:1")
e = 1.0; v = Vista(h, 150, 318, e)
v.poly(C, "#fff", 1.5)
v.circ(0, P["mord"]["vc"], P["mord"]["r"], "#fff", 1.2)
v.linea([[0, P["mord"]["vc"] + P["mord"]["r"]], [0, P["mord"]["vc"] + P["mord"]["R"]]], 1.0)                  # boca de la mordaza
v.linea([[0, P["mord"]["vc"] - P["mord"]["r"]], [0, P["mord"]["vc"] - P["mord"]["R"] + 2]], .6)
v.linea([[-P["W"] / 2 - 4, P["guarda"]["v"]], [P["W"] / 2 + 4, P["guarda"]["v"]]], 2.2)                        # tope de mano
v.rect(-P["W"] / 2 - P["gatillo"]["s"], -P["W"] / 2, P["gatillo"]["v0"] - 12, P["gatillo"]["v1"] - 12, "url(#PLAST)", 1)
L = P["lcd"]; v.rect(L["u0"] - 3, L["u1"] + 3, L["v0"] - 3, L["v1"] + 3, "#fff", 1); v.rect(L["u0"], L["u1"], L["v0"], L["v1"], "#eef0e8", .7)
h.txt(*v.p(0, (L["v0"] + L["v1"]) / 2 - 4), "12.6", 15, 700, K, "middle", MONO)
S = P["selector"]; v.circ(0, S["v"], S["D"] / 2, "#fff", 1.1); v.rect(-2.2, 2.2, S["v"] - S["D"] / 2 + 3, S["v"] + S["D"] / 2 - 3, "#fff", .8)
for u in (-P["bornes"]["du"], P["bornes"]["du"]): v.circ(u, P["bornes"]["v"] + 6, P["bornes"]["D"] / 2, "#fff", 1); v.circ(u, P["bornes"]["v"] + 6, 2, K, .5)
for u in (-14, 0, 14): v.rect(u - 5, u + 5, 106, 112, "#fff", .7)
v.cotaV(-P["W"] / 2 - 26, 0, P["H"] - 2, "190 (*)", yext=-P["W"] / 2 - 2, c=OR)
v.cotaH(-P["W"] / 2, P["W"] / 2, -14, "71 (*)", zext=-1, c=OR)
v.cotaH(-P["mord"]["r"], P["mord"]["r"], P["mord"]["vc"] + P["mord"]["R"] + 12, "Ø30 (*)", zext=P["mord"]["vc"], c=OR)
lineaCorte(h, v.p(-P["mord"]["R"] - 12, P["mord"]["vc"])[0], v.p(0, P["mord"]["vc"])[1], v.p(-P["mord"]["r"] + 2, P["mord"]["vc"])[0], v.p(0, P["mord"]["vc"])[1], "A")
for n, (u, vv), (gx, gy) in [("1", (P["mord"]["R"] * .7, P["mord"]["vc"] + P["mord"]["R"] * .7), (262, 110)), ("2", (-P["W"] / 2 - 6, 100), (62, 240)),
                             ("3", (P["W"] / 2 + 2, P["guarda"]["v"]), (262, 180)), ("4", (L["u1"], 90), (262, 234)), ("5", (12, S["v"] + 8), (262, 276)),
                             ("6", (P["bornes"]["du"], P["bornes"]["v"] + 6), (262, 308)), ("7", (14, 109), (262, 150))]:
    a = v.p(u, vv); h.globo(n, a[0], a[1], gx, gy, r=8)

# =============== 2. PINZA · PERFIL ===============
h.titulo(300, 62, "PERFIL", "ESC. 1:1")
vp = Vista(h, 340, 318, e)
vp.rect(0, P["T"], 0, P["cuello"]["v"], "#fff", 1.4)
y0 = (P["T"] - P["Tm"]) / 2; vp.rect(y0, y0 + P["Tm"], P["cuello"]["v"] + 4, P["mord"]["vc"] + P["mord"]["R"], "#fff", 1.2)
vp.rect(-4, P["T"] + 4, P["guarda"]["v"] - P["guarda"]["h"], P["guarda"]["v"], "#fff", 1)
vp.rect(-2.3, 0, 8, 104, "#fff", .8); vp.rect(-7, -2.3, S["v"] - S["D"] / 2, S["v"] + S["D"] / 2, "#fff", .8)
vp.cotaH(0, P["T"], -14, "30 (*)", zext=-1, c=OR); vp.cotaH(y0, y0 + P["Tm"], P["H"] + 10, "18 (*)", zext=P["H"] - 2, c=OR)

# =============== 3. CORTE A-A · MORDAZA ===============
h.titulo(430, 62, "CORTE A-A · MORDAZA", "ESC. 3:1 (*) · TRANSFORMADOR")
k3 = 3; cx, cy = 505, 200; w = P["mord"]["R"] - P["mord"]["r"]; t = P["Tm"]
h.rect(cx - w * k3 / 2, cy - t * k3 / 2, w * k3, t * k3, "url(#PLAST)", K, 1.3)
h.rect(cx - w * k3 / 2 + 2.5 * k3, cy - t * k3 / 2 + 2.5 * k3, w * k3 - 5 * k3, t * k3 - 5 * k3, "url(#ACERO)", K, 1)
for i in range(5): h.circ(cx - w * k3 / 2 + 2.5 * k3 + 6 + i * 11, cy + t * k3 / 2 - 2.5 * k3 - 4, 3.2, "#fff", K, .6)
h.dimH(cy + t * k3 / 2 + 16, cx - w * k3 / 2, cx + w * k3 / 2, "18 (*)", ext=cy + t * k3 / 2 + 2, c=OR)
h.dimV(cx + w * k3 / 2 + 16, cy - t * k3 / 2, cy + t * k3 / 2, "18 (*)", ext=cx + w * k3 / 2 + 2, c=OR)
llamada(h, cx - 10, cy - 10, cx + 50, cy - 56, "NUCLEO (*)", sz=8.5); llamada(h, cx - 20, cy + t * k3 / 2 - 10, cx + 50, cy + 52, "BOBINADO (*)", sz=8.5)
llamada(h, cx - w * k3 / 2 + 2, cy - t * k3 / 2 + 3, cx - 70, cy - 56, "CARCASA ABS", sz=8.5)
h.txt(430, 300, "EL CABLE ES EL PRIMARIO; EL NUCLEO JUNTA EL CAMPO", 8.5, 400, K); h.txt(430, 312, "Y LA BOBINA DA LA CORRIENTE. SOLO CA (MT-3202).", 8.5, 400, K)

# =============== 4. COMO SE MIDE (esquema) ===============
h.titulo(660, 62, "COMO SE MIDE", "UN SOLO CONDUCTOR")
for i, (t1, ok) in enumerate([("1 CABLE: MIDE", True), ("L + N: 0 A", False)]):
    ox, oy = 700 + i * 92, 150
    h.circ(ox, oy, 26, "#fff", K, 3); h.circ(ox, oy, 17, "#fff", K, .6)
    if ok: h.circ(ox, oy, 6, "#6e3b1d", K, .8)
    else: h.circ(ox - 5, oy, 5, "#6e3b1d", K, .8); h.circ(ox + 6, oy, 5, "#4aa3df", K, .8)
    h.txt(ox, oy + 46, t1, 8.5, 700, K if ok else OR, "middle"); h.txt(ox, oy + 58, "✓" if ok else "✗", 12, 700, "#1d6b35" if ok else OR, "middle")
h.txt(660, 245, "EN EL TABLERO: CADA FASE POR", 8.5, 400, K); h.txt(660, 257, "SEPARADO (L1, L2, L3) Y COMPARAR", 8.5, 400, K)
h.txt(660, 269, "CON LAS LUMINARIAS DEL CIRCUITO.", 8.5, 400, K)

# =============== 5. DETECTOR 3085 ===============
N = PN["NCV"]
h.titulo(40, 372, "3085 · DETECTOR POR INDUCCION", "ESC. 1:1 · VISTA LATERAL Y CORTE DE LA PUNTA")
dx, dy = 70, 468; pts = [(dx + t_, dy - r_) for r_, t_ in N["perfil"]] + [(dx + t_, dy + r_) for r_, t_ in reversed(N["perfil"])]
h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in pts) + f'" fill="#fff" stroke="{K}" stroke-width="1.4"/>')
tip = [(dx + t_, dy - r_) for r_, t_ in N["perfil"] if t_ <= N["punta"]] + [(dx + t_, dy + r_) for r_, t_ in reversed(N["perfil"]) if t_ <= N["punta"]]
h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in tip) + f'" fill="url(#PLAST)" stroke="{K}" stroke-width="1"/>')
h.ln(dx + N["punta"], dy - 11, dx + N["punta"], dy + 11, K, 1)
h.rect(dx + 6, dy - 2, 18, 4, K, K, 0); h.circ(dx + N["led"]["t"] - 14, dy, 2.2, "#fff", K, .7)                  # antena / LED
b = N["boton"]; h.rect(dx + b["t"] - b["L"] / 2, dy - 11 - 3, b["L"], 3, "#fff", K, .8)
c_ = N["clip"]; h.rect(dx + N["L"] - 6 - c_["L"], dy - 11 - 4.6, c_["L"], 2.2, "#fff", K, .8); h.rect(dx + N["L"] - 14, dy - 11 - 4.6, 8, 4.6, "#fff", K, .8)
for x0_ in (dx + 66, dx + 112): h.rect(x0_, dy - 5, 44, 10, "#fff", K, .5, h.OCULTA)                                # pilas (ocultas)
h.ln(dx - 10, dy, dx + N["L"] + 10, dy, K, .45, h.EJE)
h.dimH(dy + 32, dx, dx + N["L"], "148 (*)", ext=dy + 12, c=OR); h.dimH(dy - 34, dx, dx + N["punta"], "34 (*)", ext=dy - 12, c=OR)
h.dimV(dx + N["L"] + 22, dy - 11, dy + 11, "Ø22 (*)", ext=dx + N["L"] - 20, c=OR)
for n, (x, y), (gx, gy) in [("8", (dx + 12, dy), (dx + 10, dy + 60)), ("9", (dx + N["led"]["t"] - 14, dy), (dx + 50, dy + 60)),
                            ("10", (dx + b["t"], dy - 14), (dx + b["t"] + 10, dy - 50)), ("11", (dx + N["L"] - 40, dy - 15), (dx + N["L"] - 20, dy - 50)), ("12", (dx + 90, dy + 4), (dx + 100, dy + 60))]:
    h.globo(n, x, y, gx, gy, r=8)
h.txt(330, 420, "CAPTA EL CAMPO ELECTRICO DE UN CONDUCTOR CON", 8.5, 400, K); h.txt(330, 432, "TENSION ALTERNA SIN TOCARLO: PITA Y PRENDE EL LED.", 8.5, 400, K)
h.txt(330, 448, "(*) RANGO TIPICO 12 / 50-1000 V CA SEGUN MODELO: EL", 8.5, 400, OR); h.txt(330, 460, "CATALOGO NO DA MARCA NI MODELO. A CONFIRMAR.", 8.5, 400, OR)
h.txt(330, 476, "NO DETECTA CC NI CABLES BLINDADOS O ENTERRADOS.", 8.5, 700, OR)

# =============== TABLAS Y TEXTOS ===============
TY = 556
dato = {"3084": "600 A CA TRMS · CAT II 600 V", "3085": "SIN CONTACTO · SOLO CA"}
yt = tablaCodigos(h, 40, TY, [3084, 3085], dato, w_desc=330, w_dato=200, n=52)
rayadosN(h, 700, TY, ["PLAST", "ACERO"], cols=1, dx=150)
tf = [["FUNCION (MT-3202)", "RANGOS", "PRECISION"], ["A CA (TRMS)", "4 / 40 / 400 / 600 A", "±(2 % + 5) · 4 A: ±(3 % + 5)"], ["V CC", "400 mV · 4 / 40 / 400 / 600 V", "±(0,8 % + 5)"],
      ["V CA (TRMS)", "4 / 40 / 400 / 600 V", "±(1,2 % + 5)"], ["PANTALLA", "3 3/4 DIGITOS (3999)", "—"], ["CATEGORIA", "CAT II 600 V (MANUAL)", "—"]]
yq = h.tabla(40, yt + 18, [(130, "l", False), (220, "l", True), (200, "l", True)], tf, rowh=15, titulo="DATOS DE LA PINZA (VENDEDOR / MANUAL)")
yb = bloque(h, 40, yq + 18, "DONDE SE USA", [
    "3084: CORRIENTE DE CADA FASE EN EL TABLERO DE PLAZA (BALANCE DE CIRCUITOS), CONSUMO DE LUMINARIAS, CONTROL EN LA PRUEBA DE ENCENDIDO; TENSION CON LAS PUNTAS.",
    "3085: PRIMER AVISO DE TENSION EN COLUMNAS, CAJAS, TABLERITOS Y CABLES ANTES DE TOCAR. SIEMPRE CONFIRMAR CON EL PROBADOR DE DOS POLOS (UT15C, MAT-INSTRUMENTOS-2)."], w=800, sz=10, lh=13.5)
notasW(h, 40, yb + 6, [
    "COTAS EN mm. (*) MEDIDAS DE LA PINZA: DE LA HERMANA MT-3209 (190 x 71 x 30, MORDAZA Ø30); LA MT-3202 NO TIENE MEDIDAS PUBLICADAS. A CONFIRMAR.",
    "(*) EL PEDIDO HABLA DE «CATEGORIA CAT»: EL MANUAL DE LA MT-3202 DICE CAT II 600 V. NO USARLA EN LA ACOMETIDA NI EN EL MEDIDOR (ESO ES CAT III / IV).",
    "(*) 3085 SIN MARCA NI MODELO: DIBUJADO PROPORCIONAL A UN LAPIZ NCV TIPICO (148 x 28 x 22). UNIDAD «c/a» EN EL RESPALDO: ¿CADA UNO? A CONFIRMAR."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - PINZA MIDIENDO UN CONDUCTOR Y DETECTOR", "CABLE MARRON (L1) ADENTRO DE LA MORDAZA · PUNTAS EN COM Y VΩ")
A3 = img3d(h, "nepp_inst1", 905, 92, 735)
columna(h, A3, [("mordaza", "1", "MORDAZA (TI)"), ("abertura", "", "ABERTURA Ø30"), ("gatillo", "2", "GATILLO"), ("tope", "3", "TOPE DE MANO"), ("lcd", "4", "PANTALLA 3999"),
                ("selector", "5", "SELECTOR"), ("botones", "7", "HOLD / FUNC")], 1470, 110, 470)
columna(h, A3, [("cable", "", "CONDUCTOR L1"), ("com", "6", "COM / VΩ"), ("punta", "", "PUNTAS DE PRUEBA")], 1470, 500, 640)
for an, n, t, gx, gy in [("ncvPunta", "8", "PUNTA SENSORA", 1150, 672), ("ncvBoton", "10", "BOTON", 1330, 672), ("ncvClip", "11", "CLIP", 1480, 672)]:
    globo3d(h, A3(an), n, gx, gy, t)
cajaUso(h, 905, 700, 735, "ANTES DE MEDIR · USO EN OBRA", [
    "✓ PROBAR - MEDIR - PROBAR: ANTES Y DESPUES, PROBA EL INSTRUMENTO EN UN PUNTO CON TENSION CONOCIDA (TOMA, BORNERA VIVA).",
    "✓ PINZA: UN SOLO CONDUCTOR ADENTRO Y CENTRADO, MORDAZA BIEN CERRADA; SELECTOR EN EL RANGO ANTES DE ABRAZAR. PUNTAS SANAS, SIN CABLE PELADO.",
    "✓ PILAS: SI APARECE EL SIMBOLO DE BATERIA, CAMBIARLAS (LA LECTURA DEJA DE SER CONFIABLE).",
    "⚠ CAT II 600 V: NO MEDIR EN LA ACOMETIDA NI ANTES DEL MEDIDOR. CON LAS PUNTAS, LA MANO SIEMPRE DETRAS DEL TOPE.",
    "⚠ EL DETECTOR QUE NO SUENA NO PRUEBA QUE NO HAY TENSION: CONFIRMAR CON EL UT15C ANTES DE TOCAR. CON GUANTES DIELECTRICOS (MAT-EPP-1)."])
h.txt(905, 1028, "RENDER: three.js (r3d/escenas/nepp_inst1.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_nepp.md", 9, 400, G, "start", INT)
rotuloMat(h, "MAT-INSTRUMENTOS-1", "PINZA AMPEROMETRICA", "Y DETECTOR DE TENSION", "FRENTE, PERFIL, CORTE A-A, DETECTOR Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_instrumentos_1.svg"))
