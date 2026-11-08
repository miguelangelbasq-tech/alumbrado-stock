"""MAT-INSTRUMENTOS-2 (rev. A) · Probador de tensión UNI-T UT15C (3087) y busca polo con neón (9036).
Plano con la geometría de r3d/piezas/perfiles_nepp.mjs (perfiles_nepp.json); 3D: r3d/out/nepp_inst2.png y nepp_inst2b.png."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neppkit import *

h = nuevaN()
U = PN["UT"]

# =============== 1. UT15C · FRENTE ===============
h.titulo(40, 62, "3087 · UT15C · FRENTE", "ESC. 1:1,25")
e = .8; v = Vista(h, 130, 112 + (U["cuerpo"][-1][1]) * e, e)       # v = 0 en el arranque de la punta, hacia arriba
cont = [[w, vv] for w, vv in U["cuerpo"]] + [[-w, vv] for w, vv in reversed(U["cuerpo"])]
v.poly(cont, "#fff", 1.5)
v.linea([[-25.5, 40], [25.5, 40]], .7)                                                         # cambio de color (gris / rojo)
L = U["lcd"]; v.rect(-L["w"] / 2 - 3, L["w"] / 2 + 3, L["v0"] - 3, L["v1"] + 3, "#fff", 1); v.rect(-L["w"] / 2, L["w"] / 2, L["v0"], L["v1"], "#eef0e8", .7)
h.txt(*v.p(0, (L["v0"] + L["v1"]) / 2 - 6), "230", 13, 700, K, "middle", MONO)
for i, t in enumerate(U["escala"]):
    vv = U["leds"]["v0"] + (U["leds"]["v1"] - U["leds"]["v0"]) * i / (len(U["escala"]) - 1); v.circ(-8, vv, 2.2, "#fff", .7); h.txt(*v.p(-2, vv - 1.6), t, 7, 400, K, "start", MONO)
for u in (-9, 9): v.circ(u, 176, 4.2, "#fff", .9)
Pp = U["punta"]; v.rect(-Pp["guard"], Pp["guard"], -Pp["L"] + 10, 4, "url(#PLAST)", 1); v.rect(-Pp["d"] / 2, Pp["d"] / 2, -Pp["L"] - 8, -Pp["L"] + 10, "#fff", .9)
v.cotaV(-25.5 - 22, -Pp["L"] - 8, U["cuerpo"][-1][1], "275 (VENDEDOR)", yext=-27)
v.cotaH(-25.5, 25.5, 252, "51", zext=200)
v.cotaV(25.5 + 14, L["v0"], L["v1"], "48 (*)", yext=L["w"] / 2 + 3, c=OR)
for n, (u, vv), (gx, gy) in [("1", (0, 150), (230, 150)), ("2", (-8, 90), (230, 200)), ("3", (9, 176), (230, 116)), ("4", (0, -Pp["L"] - 4), (230, 380)), ("5", (Pp["guard"], -20), (230, 340)), ("6", (25, 20), (230, 290))]:
    a = v.p(u, vv); h.globo(n, a[0], a[1], gx, gy, r=8)

# PERFIL
h.titulo(270, 62, "PERFIL", "ESC. 1:1,25")
vp = Vista(h, 300, 112 + U["cuerpo"][-1][1] * e, e)
vp.rect(0, U["T"], 14, 222, "#fff", 1.4); vp.rect(4, U["T"] - 4, 0, 14, "#fff", 1.2); vp.rect(9, U["T"] - 9, 222, 238, "#fff", 1.2)
vp.rect(U["T"] / 2 - Pp["guard"], U["T"] / 2 + Pp["guard"], -Pp["L"] + 10, 0, "url(#PLAST)", 1); vp.rect(U["T"] / 2 - 2, U["T"] / 2 + 2, -Pp["L"] - 8, -Pp["L"] + 10, "#fff", .9)
vp.linea([[U["T"] * .52, 40], [U["T"] * .52, 214]], .6)
for k in range(2): vp.rect(8, U["T"] - 8, 60 + k * 50, 104 + k * 50, "none", .6, h.OCULTA)
h.txt(*vp.p(U["T"] + 6, 100), "2 PILAS AAA", 8, 400, K, "start"); h.txt(*vp.p(U["T"] + 6, 90), "(OCULTAS)", 8, 400, K, "start")
vp.cotaH(0, U["T"], 252, "30", zext=224)

# D1 · punta con capuchón
h.titulo(440, 62, "D1 - PUNTA DE PRUEBA", "ESC. 3:1 (*) · CON CAPUCHON CAT III / IV")
k1 = 3; px, py = 470, 150
h.rect(px, py - Pp["guard"] * k1, 26 * k1, 2 * Pp["guard"] * k1, "url(#PLAST)", K, 1.2)
h.rect(px + 26 * k1, py - Pp["d"] / 2 * k1, 4 * k1, Pp["d"] * k1, "#fff", K, 1.1)
h.rect(px + 2 * k1, py - Pp["d"] / 2 * k1, 24 * k1, Pp["d"] * k1, "#fff", K, .6, h.OCULTA)
h.dimH(py - Pp["guard"] * k1 - 14, px + 26 * k1, px + 30 * k1, "4 (*)", ext=py - Pp["d"] / 2 * k1 - 1, c=OR)
h.dimV(px - 14, py - Pp["guard"] * k1, py + Pp["guard"] * k1, "Ø15 (*)", ext=px - 2, c=OR)
h.dimV(px + 30 * k1 + 16, py - Pp["d"] / 2 * k1, py + Pp["d"] / 2 * k1, "Ø4", ext=px + 30 * k1 + 2)
h.txt(px, py + 64, "CON CAPUCHON: SOLO 4 mm DE METAL A LA VISTA", 8.5, 700, K); h.txt(px, py + 76, "(IEC 61010-031, CAT III / IV) (*)", 8.5, 400, OR)

# Sonda 2
h.titulo(440, 268, "SONDA 2 Y CABLE ESPIRAL", "ESC. 1:2")
S = U["sonda"]; k2 = .5; sx, sy = 470, 330
h.rect(sx, sy - S["D"] / 2 * k2, S["L"] * k2, S["D"] * k2, "#fff", K, 1.2); h.rect(sx - 10, sy - 2, 10, 4, "#fff", K, .8)
for i in range(18): x_ = sx + S["L"] * k2 + 4 + i * 6; h.a(f'<ellipse cx="{x_}" cy="{sy}" rx="3" ry="7" fill="none" stroke="{K}" stroke-width=".9"/>')
h.dimH(sy + 22, sx, sx + S["L"] * k2, "150 (*)", ext=sy + 8, c=OR); h.txt(sx + S["L"] * k2 + 8, sy + 26, "ESPIRAL ≈ 760 ESTIRADO (*)", 8.5, 400, OR)

# =============== 2. BUSCA POLO 9036 · CORTE ===============
B = PN["BP"]
h.titulo(40, 440, "9036 · BUSCA POLO · CORTE LONGITUDINAL", "ESC. 3:1 · MANGO AISLANTE TRANSPARENTE CON NEON")
k3 = 3.0; bx, by = 60, 530; hj = B["hoja"]
h.rect(bx + 8 * k3 * 0, by - hj["d"] / 2 * k3, hj["L"] * k3, hj["d"] * k3, "url(#ACERO)", K, 1.1)
h.a(f'<polygon points="{bx},{by - hj["punta"] / 2 * k3} {bx + 8 * k3},{by - hj["d"] / 2 * k3} {bx + 8 * k3},{by + hj["d"] / 2 * k3} {bx},{by + hj["punta"] / 2 * k3}" fill="#fff" stroke="{K}" stroke-width="1"/>')
x0 = bx + hj["L"] * k3
up = [(x0 + t * k3, by - r * k3) for r, t in B["perfil"]]; dn = [(x0 + t * k3, by + r * k3) for r, t in reversed(B["perfil"])]
h.a('<polygon points="' + " ".join(f"{a:.1f},{b_:.1f}" for a, b_ in up + dn) + f'" fill="url(#PLAST)" stroke="{K}" stroke-width="1.3"/>')
h.rect(x0 + 1 * k3, by - 4.6 * k3, (B["mango"]["L"] - 7) * k3, 9.2 * k3, "#fff", K, .7)                              # hueco interior
h.rect(x0 + B["resistencia"]["t0"] * k3, by - B["resistencia"]["d"] / 2 * k3, (B["resistencia"]["t1"] - B["resistencia"]["t0"]) * k3, B["resistencia"]["d"] * k3, K, K, 0)
h.rect(x0 + B["neon"]["t0"] * k3, by - B["neon"]["d"] / 2 * k3, (B["neon"]["t1"] - B["neon"]["t0"]) * k3, B["neon"]["d"] * k3, "#fff", K, 1)
h.ln(x0 + (B["neon"]["t0"] + 3) * k3, by, x0 + (B["neon"]["t1"] - 3) * k3, by, K, .6, 'stroke-dasharray="2 2"')
zz = [(x0 + (46 + 22 * i / 16) * k3, by + (-4.6 if i % 2 else 4.6) * k3 * .5) for i in range(17)]
h.a('<polyline points="' + " ".join(f"{a:.1f},{b_:.1f}" for a, b_ in zz) + f'" fill="none" stroke="{K}" stroke-width="1"/>')
h.rect(x0 + (B["mango"]["L"] - 6) * k3, by - 5.8 * k3, 6.6 * k3, 11.6 * k3, "url(#ACERO)", K, 1.1)
h.rect(x0 + 30 * k3, by - 6.25 * k3 - 3.6, B["clip"]["L"] * k3, 3.6, "#fff", K, .9)
h.dimH(by + 40, bx, x0 + B["mango"]["L"] * k3, "142 (REF. FERVI)", ext=by + 20)
h.dimH(by - 34, bx, x0, "62 (*)", ext=by - 6, c=OR)
h.dimV(x0 + B["mango"]["L"] * k3 + 18, by - 6.25 * k3, by + 6.25 * k3, "Ø12,5 (*)", ext=x0 + B["mango"]["L"] * k3 + 2, c=OR)
h.dimV(bx + 40, by - hj["d"] / 2 * k3, by + hj["d"] / 2 * k3, "3,5 (*)", ext=bx + 20, c=OR)
for n, (x, y), (gx, gy) in [("7", (bx + 4, by), (bx + 10, by + 70)), ("8", (x0 + 13 * k3, by), (x0 + 6, by + 70)), ("9", (x0 + 33 * k3, by), (x0 + 60, by + 70)),
                            ("10", (x0 + 57 * k3, by + 2), (x0 + 110, by + 70)), ("11", (x0 + 78 * k3, by - 8), (x0 + 175, by - 44)), ("12", (x0 + 50 * k3, by - 15), (x0 + 110, by - 46)), ("13", (x0 + 4 * k3, by + 9), (x0 - 30, by + 70))]:
    h.globo(n, x, y, gx, gy, r=8)
# circuito
h.titulo(560, 440, "COMO FUNCIONA", "CORRIENTE MINIMA AL CUERPO")
cx_ = 566; cy_ = 510
for i, t in enumerate(["FASE", "PUNTA", "RESIST.", "NEON", "RESORTE", "TAPA", "DEDO→TIERRA"]):
    x = cx_ + (i % 4) * 70; y = cy_ + (i // 4) * 42
    h.rect(x, y - 11, 60, 18, "#fff", K, .8); h.txt(x + 30, y + 2, t, 7.5, 700, OR if i == 3 else K, "middle")
    if i % 4 != 3 and i < 6: h.ln(x + 60, y - 2, x + 70, y - 2, K, 1)
h.path(f"M{cx_ + 3 * 70 + 30},{cy_ + 7} V{cy_ + 20} H{cx_ - 8} V{cy_ + 40} H{cx_}", "none", K, 1)
h.txt(cx_, cy_ + 72, "PRENDE CON ≥ 100 V CA (REF. 100-500 V) (*)", 8.5, 700, OR); h.txt(cx_, cy_ + 84, "SIN TOCAR LA TAPA NO PRENDE.", 8.5, 400, K)

# =============== TABLAS Y TEXTOS ===============
TY = 640
dato = {"3087": "12-690 V CA/CC · CAT IV 600 V", "9036": "NEON 100-500 V (*)"}
yt = tablaCodigos(h, 40, TY, [3087, 9036], dato, w_desc=330, w_dato=200, n=52)
rayadosN(h, 700, TY, ["PLAST", "ACERO"], cols=1, dx=150)
tf = [["UT15C", "DATO", "FUENTE"], ["TENSION", "12 A 690 V CA / CC (LED 12-24-50-120-230-400-690)", "VENDEDORES"], ["PANTALLA", "LCD · ±(3 % + 5) DE 24 A 690 V", "TOOLBOOM"],
      ["SEGURIDAD", "CAT IV 600 V", "VENDEDOR (*)"], ["ALIMENTACION", "2 PILAS AAA (EN EL PAÑOL: 9004)", "VENDEDORES"], ["MEDIDAS / PESO", "275 x 51 x 30 · 210 g", "VENDEDOR"], ["OTRAS", "CONTINUIDAD", "VENDEDORES"]]
yq = h.tabla(40, yt + 18, [(110, "l", False), (340, "l", True), (120, "l", False)], tf, rowh=15, titulo="DATOS DEL UT15C", colores=colorN)
yb = bloque(h, 40, yq + 16, "DONDE SE USA", [
    "3087: VERIFICAR AUSENCIA DE TENSION ANTES DE TRABAJAR (BORNERAS, FUSIBLES, TABLERO, ACOMETIDA), TENSION ENTRE FASES Y FASE-NEUTRO, CONTINUIDAD DE CABLES.",
    "9036: SOLO PARA UBICAR LA FASE EN BORNERAS Y TOMAS DE BAJA TENSION. NO SIRVE PARA DAR UN CIRCUITO POR SIN TENSION."], w=800, sz=10, lh=13.5)
notasW(h, 40, yb + 6, [
    "COTAS EN mm. UT15C: 275 x 51 x 30 SEGUN UN VENDEDOR (PUEDE SER LA CAJA) (*). FORMA DE LOS CUERPOS, SONDA Y ESPIRAL: PROPORCIONALES, A CONFIRMAR.",
    "(*) BUSCA POLO SIN MARCA: DIBUJADO SOBRE FERVI 0013/142 (142 mm, 100-500 V). HOJA, MANGO, RESISTENCIA Y NEON: PROPORCIONALES."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - PROBADOR UT15C Y BUSCA POLO", "UT15C CON LA SONDA 2 Y EL CABLE EN ESPIRAL · BUSCA POLO DE CERCA (MANGO TRANSPARENTE)")
A3 = img3d(h, "nepp_inst2", 905, 92, 560)
columna(h, A3, [("espiral", "", "CABLE ESPIRAL"), ("agarre", "6", "CUERPO"), ("botones", "3", "BOTONES"), ("lcd", "1", "LCD"), ("sonda", "", "SONDA 2"),
                ("leds", "2", "LED 12...690 V"), ("escala", "", "ESCALA"), ("cuerpo", "", "PORTAPILAS"), ("punta2", "", "PUNTA 2"), ("capuchon", "5", "CAPUCHON"), ("punta1", "4", "PUNTA Ø4")], 1500, 110, 500)
h.txt(905, 540, "9036 · BUSCA POLO DE CERCA", 11, 700, NV, "start", INT)
A4 = img3d(h, "nepp_inst2b", 905, 548, 735)
for an, n, t, gx, gy in [("bpPunta", "7", "PUNTA PLANA", 930, 870), ("bpHoja", "", "HOJA DE ACERO", 1060, 870), ("bpMango", "13", "MANGO AISLANTE", 1200, 870),
                         ("bpRes", "8", "RESISTENCIA", 1340, 600), ("bpNeon", "9", "NEON", 1340, 880), ("bpResorte", "10", "RESORTE", 1470, 880), ("bpClip", "12", "CLIP", 1440, 590), ("bpTapa", "11", "TAPA DE CONTACTO", 1500, 620)]:
    globo3d(h, A4(an), n, gx, gy, t)
cajaUso(h, 905, 900, 735, "USO EN OBRA", [
    "✓ PROBAR - MEDIR - PROBAR CON EL UT15C ANTES DE TOCAR; DOS PUNTAS: FASE-NEUTRO, FASE-TIERRA Y ENTRE FASES. CAPUCHONES PUESTOS.",
    "⚠ EL BUSCA POLO NO PRUEBA AUSENCIA DE TENSION (CON SOL O MALA TIERRA NO SE VE EL NEON). NO USARLO COMO DESTORNILLADOR DE FUERZA."])
h.txt(905, 1028, "RENDER: three.js (r3d/escenas/nepp_inst2.mjs, nepp_inst2b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_nepp.md", 9, 400, G, "start", INT)
rotuloMat(h, "MAT-INSTRUMENTOS-2", "PROBADOR DE TENSION", "UT15C Y BUSCA POLO", "FRENTE, PERFIL, D1, SONDA, CORTE DEL BUSCA POLO Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_instrumentos_2.svg"))
