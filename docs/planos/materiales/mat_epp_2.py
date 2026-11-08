"""MAT-EPP-2 (rev. A) · EPP de uso general: guantes de trabajo 9007 (tejido con palma de nitrilo, DE BAJA), 9008 (moteado),
9011 (descarne), anteojo de seguridad 7013 (código reutilizado) y tapones auditivos 3092.
Plano con la geometría de r3d/piezas/perfiles_nepp.mjs (perfiles_nepp.json); 3D: r3d/out/nepp_epp2.png y nepp_epp2b.png."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neppkit import *

h = nuevaN()
PU = PN["PUNOS"]; MA = PN["MANO"]

# =============== 1. GUANTES DE TRABAJO (palma) ===============
h.titulo(40, 62, "GUANTES DE TRABAJO · PALMA", "ESC. 1:2,5 · MANO DERECHA")
e = .4
h.a('<defs><clipPath id="cpMano"><rect x="0" y="0" width="1680" height="100000"/></clipPath></defs>')
X0 = {"g9007": 82, "g9008": 236, "g9011": 404}
for key, nom in [("g9007", "9007 NITRILO EN PALMA †"), ("g9008", "9008 MOTEADO"), ("g9011", "9011 DESCARNE")]:
    x0, x1, y0, y1 = bboxG(key); oy = 252 + y0 * e; v = Vista(h, X0[key], oy, e); s = PN["GUANTES"][key]["s"]
    guantePlano(v, key)
    Pp = PU[PN["GUANTES"][key]["puno"]]
    if key == "g9007":     # baño de nitrilo: toda la mano (palma y dedos), sin el puño
        yc = v.p(0, 4)[1]; h.a(f'<clipPath id="cpN"><rect x="0" y="0" width="1680" height="{yc:.1f}"/></clipPath>')
        d = " ".join(v.d([q for q in ring[:-1]]) for poly in PN["CONTORNO"][key] for ring in poly)
        h.a(f'<path d="{d}" fill="url(#GOMA)" stroke="{K}" stroke-width="1.3" clip-path="url(#cpN)"/>')
        for k in range(1, 5): vv = Pp["v0"] + k * (6 - Pp["v0"]) / 5; v.linea([[-Pp["wA"] / 2 + 1, vv], [Pp["wA"] / 2 - 1, vv]], .4)
    if key == "g9008":     # motas (misma grilla que el 3D)
        pl = MA["palma"]; u = pl["u0"] * s + 12
        while u <= pl["u1"] * s - 10:
            vv = pl["v0"] * s + 12
            while vv <= pl["v1"] * s - 6:
                c = v.p(u + (round(vv / 11) % 2) * 5.5, vv); h.circ(c[0], c[1], 2.6 * e, K, K, 0); vv += 11
            u += 11
        for dd in PN["DEDOS"][key]:
            L = math.hypot(dd["p1"][0] - dd["p0"][0], dd["p1"][1] - dd["p0"][1]); t = 14
            while t < L + 2:
                f = t / L; c = v.p(dd["p0"][0] + (dd["p1"][0] - dd["p0"][0]) * f, dd["p0"][1] + (dd["p1"][1] - dd["p0"][1]) * f); h.circ(c[0], c[1], 2.4 * e, K, K, 0); t += 11
        for k in range(1, 5): vv = Pp["v0"] + k * (6 - Pp["v0"]) / 5; v.linea([[-Pp["wA"] / 2 + 1, vv], [Pp["wA"] / 2 - 1, vv]], .4)
    if key == "g9011":     # costuras del descarne
        pl = MA["palma"]; v.linea([[-pl["u1"] * s * .55, pl["v0"] * s + 4], [-pl["u1"] * s * .55, pl["v1"] * s - 4]], .6); h.path("", "none")
        h.a(f'<path d="{v.d([[Pp["wA"] / 2 - 5, Pp["v0"] + 8], [Pp["wB"] / 2 - 5, 0]], False)}" fill="none" stroke="{K}" stroke-width=".6" stroke-dasharray="3 2"/>')
    v.cotaV(x1 + 12, y0, y1, f"{y1 - y0:.0f} (*)", yext=x1 + 2, c=OR)
    v.cotaH(-Pp["wA"] / 2, Pp["wA"] / 2, Pp["v0"] - 40, f'{Pp["wA"]:.0f} (*)', zext=Pp["v0"] - 1, c=OR)
    h.txt(X0[key] + (x0 + x1) / 2 * e, 288, nom, 9.5, 700, ROJO if "†" in nom else K, "middle")
_v = Vista(h, X0["g9007"], 252 + bboxG("g9007")[2] * e, e)
lineaCorte(h, X0["g9007"] - 26, _v.p(0, 50)[1], X0["g9007"] + 48, _v.p(0, 50)[1], "A")

# D1 · corte A-A de la palma 9007 (tejido + nitrilo)
h.titulo(560, 62, "D1 - CORTE A-A 9007", "ESC. 4:1 (*) · TEJIDO Y BAÑO DE NITRILO")
k1 = 4; cx, cy = 690, 150; w2 = 50; t2 = 14
h.a(f'<rect x="{cx - w2 * k1 / 2 - 4}" y="{cy - t2 * k1 / 2 - 4}" width="{w2 * k1 + 8}" height="{t2 * k1 + 8}" rx="{(t2 * k1 + 8) / 2}" fill="url(#TELA)" stroke="{K}" stroke-width="1"/>')
h.a(f'<rect x="{cx - w2 * k1 / 2}" y="{cy - t2 * k1 / 2}" width="{w2 * k1}" height="{t2 * k1}" rx="{t2 * k1 / 2}" fill="#fff" stroke="{K}" stroke-width=".7"/>')
h.a(f'<clipPath id="cpD1"><rect x="0" y="{cy - 2}" width="1680" height="200"/></clipPath>')
h.a(f'<rect x="{cx - w2 * k1 / 2 - 8}" y="{cy - t2 * k1 / 2 - 8}" width="{w2 * k1 + 16}" height="{t2 * k1 + 16}" rx="{(t2 * k1 + 16) / 2}" fill="url(#GOMA)" stroke="{K}" stroke-width="1" clip-path="url(#cpD1)"/>')
h.a(f'<rect x="{cx - w2 * k1 / 2 - 4}" y="{cy - t2 * k1 / 2 - 4}" width="{w2 * k1 + 8}" height="{t2 * k1 + 8}" rx="{(t2 * k1 + 8) / 2}" fill="url(#TELA)" stroke="{K}" stroke-width="1" clip-path="url(#cpD1)"/>')
h.a(f'<rect x="{cx - w2 * k1 / 2}" y="{cy - t2 * k1 / 2}" width="{w2 * k1}" height="{t2 * k1}" rx="{t2 * k1 / 2}" fill="#fff" stroke="{K}" stroke-width=".7"/>')
h.txt(cx, cy + 4, "MANO", 9, 400, G, "middle")
llamada(h, cx + 60, cy - t2 * k1 / 2 - 2, cx + 80, cy - 52, "TEJIDO (*)", sz=8.5)
llamada(h, cx - 40, cy + t2 * k1 / 2 + 6, cx - 30, cy + 62, "NITRILO EN LA PALMA (*)", sz=8.5)
h.txt(560, 236, "9008: TEJIDO DE ALGODON / POLIESTER CON PUNTOS DE PVC", 8.5, 400, K)
h.txt(560, 248, "EN LA PALMA (AGARRE). 9011: CUERO DESCARNE, PUÑO LARGO.", 8.5, 400, K)
h.txt(560, 262, "(*) NORMA: EN 388 (RIESGO MECANICO), A CONFIRMAR", 8.5, 400, OR)

# =============== 2. ANTEOJO 7013 ===============
A = PN["ANT"]; L = PN["LENTE"]
h.titulo(40, 316, "7013 · ANTEOJO DE SEGURIDAD", "ESC. 1:1 · FRENTE")
fx, fy = 210, 410
for sg in (1, -1):
    pts = [(fx + sg * u * math.cos(math.radians(A["curva"])), fy - vv) for u, vv in L]
    h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in pts) + f'" fill="#f4f8fb" stroke="{K}" stroke-width="1.2"/>')
    top = sorted([(u, vv) for u, vv in L if vv > 8])
    h.a('<polyline points="' + " ".join(f"{fx + sg * u * math.cos(math.radians(A['curva'])):.1f},{fy - vv - 1.2:.1f}" for u, vv in top) + f'" fill="none" stroke="{K}" stroke-width="3.2"/>')
    hx = fx + sg * A["ancho"] / 2; h.rect(min(hx, hx - sg * 9), fy - 19, 9, 14, "#fff", K, 1)
h.rect(fx - A["puente"]["w"] / 2, fy - 26, A["puente"]["w"], 12, "#fff", K, 1)
for sg in (1, -1): h.rect(fx + sg * 6 - 2.5, fy - 2, 5, 16, "#fff", K, .8)
h.txt(fx - 46, fy + 21, "Z87+", 8, 700, K, "middle")
h.dimH(fy + 50, fx - A["ancho"] / 2, fx + A["ancho"] / 2, "150 (*)", ext=fy - 10, c=OR)
h.dimV(fx + A["ancho"] / 2 + 18, fy - 25, fy + 26, "52 (*)", ext=fx + 70, c=OR)
for n, (ax, ay), (gx, gy) in [("1", (fx + 40, fy + 5), (fx + 112, fy + 48)), ("2", (fx - 40, fy - 25), (fx - 95, fy - 58)), ("3", (fx + 6, fy + 10), (fx + 40, fy + 58)),
                              ("4", (fx - A["ancho"] / 2 + 4, fy - 12), (fx - 106, fy + 10)), ("5", (fx - 46, fy + 18), (fx - 80, fy + 58))]:
    h.globo(n, ax, ay, gx, gy, r=8)

h.titulo(370, 316, "PLANTA", "ESC. 1:2 · ENVOLVENTE Y PATILLAS")
k3 = .5; px, py = 470, 345
for sg in (1, -1):
    a = math.radians(A["curva"]); x0 = px + sg * 6 * k3; x1 = x0 + sg * 70 * math.cos(a) * k3; y1 = py + 70 * math.sin(a) * k3
    h.ln(x0, py, x1, y1, K, 2.2)
    hx = px + sg * A["ancho"] / 2 * k3; h.ln(hx, py + 6, hx, py + 6 + A["patilla"]["L"] * k3, K, 1.6)
h.dimV(px + A["ancho"] / 2 * k3 + 14, py + 6, py + 6 + A["patilla"]["L"] * k3, "135 (*)", ext=px + A["ancho"] / 2 * k3 + 3, c=OR)
h.txt(px, py + 6 + A['patilla']['L'] * k3 + 16, f"ENVOLVENTE {A['curva']}° (*)", 8.5, 400, OR, "middle")

h.titulo(560, 316, "PERFIL", "ESC. 1:2")
sx, sy = 590, 400; Pt = A["patilla"]
pat = [(0, -Pt["h0"] / 2), (Pt["L"] * .7, -Pt["h1"] / 2), (Pt["L"], -Pt["h1"] / 2 - Pt["caida"]), (Pt["L"] + 4, -Pt["h1"] / 2 - Pt["caida"] + 3), (Pt["L"] * .72, Pt["h1"] / 2), (0, Pt["h0"] / 2)]
h.a('<polygon points="' + " ".join(f"{sx + t * k3 * 1.6:.1f},{sy - (vv + 12) * k3 * 1.6:.1f}" for t, vv in pat) + f'" fill="url(#PLAST)" stroke="{K}" stroke-width="1.1"/>')
h.ln(sx - 3, sy - 26 * 1.6 * k3, sx - 3, sy + 26 * 1.6 * k3, K, 2.4)
h.txt(sx + 60, sy + 30, "PATILLA CON PUNTA CAIDA (*)", 8.5, 400, OR)

# =============== 3. TAPÓN 3092 ===============
T = PN["TAP"]; TP = PN["TAP_P"]
h.titulo(40, 520, "3092 · TAPON AUDITIVO", "ESC. 4:1 · ESPUMA DE POLIURETANO")
k4 = 4; tx, ty = 66, 600
up = [(tx + t * k4, ty - r * k4) for r, t in TP]; dn = [(tx + t * k4, ty + r * k4) for r, t in reversed(TP)]
h.a('<polygon points="' + " ".join(f"{a:.1f},{b:.1f}" for a, b in up + dn) + f'" fill="url(#ESPUMA)" stroke="{K}" stroke-width="1.2"/>')
h.ln(tx - 10, ty, tx + T["L"] * k4 + 10, ty, K, .45, h.EJE)
h.dimH(ty + T["D"] / 2 * k4 + 18, tx, tx + T["L"] * k4, "24 (*)", ext=ty + 2, c=OR)
h.dimV(tx + T["L"] * k4 + 18, ty - T["D"] / 2 * k4, ty + T["D"] / 2 * k4, "Ø12,5 (*)", ext=tx + T["L"] * k4 - 4, c=OR)
h.dimV(tx - 14, ty - T["d"] / 2 * k4, ty + T["d"] / 2 * k4, "Ø10 (*)", ext=tx + 2, c=OR)
h.txt(tx - 6, ty + 66, "← PUNTA QUE ENTRA AL OIDO", 8.5, 400, K)
# cómo se pone (3 pasos)
h.titulo(240, 520, "COMO SE PONE", "EN 352-2 · SNR ≈ 37 dB (*)")
for i, (a1, a2) in enumerate([("1. ENROLLARLO", "BIEN FINITO"), ("2. TIRAR LA OREJA", "ARRIBA Y ATRAS"), ("3. METERLO Y", "SOSTENER 30 s")]):
    ox = 268 + i * 98; oy = 590
    if i == 0:
        h.a(f'<rect x="{ox - 6}" y="{oy - 30}" width="12" height="44" rx="6" fill="url(#ESPUMA)" stroke="{K}" stroke-width="1"/>')
        for dy in (-18, -4, 10): h.path(f"M{ox - 16},{oy + dy} q16,-8 32,0", "none", K, .7)
    else:
        h.path(f"M{ox - 20},{oy + 20} q-8,-34 14,-46 q26,-8 28,20 q2,18 -14,26 q-8,6 -4,16", "none", K, 1.2)   # oreja
        h.circ(ox + 2, oy - 4, 4, "#fff", K, .8)
        if i == 1: h.path(f"M{ox + 18},{oy - 40} l10,-10 m-10,10 l3,-10 m-3,10 l10,-3", "none", K, .9)
        else: h.a(f'<rect x="{ox - 2}" y="{oy - 8}" width="10" height="8" rx="3" fill="url(#ESPUMA)" stroke="{K}" stroke-width=".8"/>')
    h.txt(ox, 640, a1, 8, 700, K, "middle"); h.txt(ox, 650, a2, 8, 400, K, "middle")

# =============== TABLAS Y TEXTOS ===============
TY = 690
dato = {"9007": "NITRILO EN PALMA", "9008": "PVC EN PALMA (AGARRE)", "9011": "CUERO DESCARNE", "7013": "(*) CODIGO REUTILIZADO: REVISAR",
        "3092": "EN 352-2 (*)"}
yt = tablaCodigos(h, 40, TY, [9008, 9011, 9007, 7013, 3092], dato, w_desc=330, w_dato=210, n=50)
rayadosN(h, 700, TY, ["TELA", "GOMA", "CUERO", "PLAST", "ESPUMA"], cols=1, dx=150)
h.rect(40, yt + 8, 640, 32, "#fff", ROJO, 1.2)
h.txt(48, yt + 21, f"7013: EN EL CATALOGO BASE ERA «{baseDe(7013)[:58]}» (VER MAT-JABALINA-2);", 9, 700, ROJO)
h.txt(48, yt + 34, "EN EL RESPALDO DICE «ANTEOJO DE SEGURIDAD». (*) CODIGO REUTILIZADO: REVISAR. NO SE CORRIGE ACA.", 9, 700, ROJO)
yb = bloque(h, 40, yt + 60, "DONDE SE USA", [
    "9008 MOTEADO: CARGA Y DESCARGA, TENDIDO DE CABLE, CAÑOS Y ARMADO EN EL GALPON. 9011 DESCARNE: HIERROS, PIEDRA, HORMIGON, AMOLADORA Y SOLDADURA.",
    "7013 ANTEOJO: AMOLAR, PICAR, PERFORAR, CORTAR CABLE O ALAMBRE, PELAR Y TRABAJAR EN EL TABLERO. 3092 TAPONES: AMOLADORA, MARTILLO, GRUPO ELECTROGENO Y COMPACTADORA."], w=800, sz=10, lh=13.5)
notasW(h, 40, yb + 6, [
    "COTAS EN mm. (*) TODAS LAS MEDIDAS DE ESTA HOJA SON PROPORCIONALES (NO HAY MARCA NI MODELO EN EL CATALOGO): A CONFIRMAR CON LO QUE HAY EN EL PAÑOL.",
    "ANTEOJO: EN 166 / ANSI Z87.1 («Z87+» = ALTO IMPACTO) / IRAM 3630 SEGUN FICHAS DE 3M Y LIBUS. TAPON: EN 352-2; 3M 1100 = SNR 37 dB (OTRA FICHA DICE 35) (*).",
    "† 9007 ESTA DE BAJA (ACTIVO = FALSE EN EL RESPALDO): QUEDA EN LA TABLA, NO SE PIDE MAS.",
    "(*) UNIDADES MEZCLADAS TAL CUAL EL RESPALDO: 3092 EN «c/a» (¿CAJA? ¿CADA PAR?); GUANTES EN «Un.» (¿PAR?). A CONFIRMAR."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - GUANTES DE TRABAJO (PALMA ARRIBA)", "IZQ. A DER.: 9007 NITRILO (DE BAJA) · 9008 MOTEADO · 9011 DESCARNE")
A3 = img3d(h, "nepp_epp2", 920, 92, 700)
for an, t, gx, gy, lado in [("nitriloDedo", "NITRILO EN LOS DEDOS", 912, 200, "der"), ("nitrilo", "PALMA DE NITRILO", 912, 300, "der"), ("tejido", "DORSO TEJIDO", 912, 380, "der"),
                           ("punoEl", "PUÑO ELASTIZADO", 950, 512, "der"), ("motas", "PUNTOS DE PVC", 1250, 150, "der"), ("tejidoB", "TEJIDO BLANCO", 1170, 512, "der"),
                           ("descarne", "CUERO DESCARNE", 1500, 200, "der"), ("costura", "COSTURA", 1500, 250, "der"), ("punoLargo", "PUÑO LARGO", 1545, 512, "der")]:
    globo3d(h, A3(an), "", gx, gy, t, lado)
h.txt(905, 560, "ANTEOJO 7013 Y TAPONES 3092 (UNO CORTADO: ESPUMA)", 11, 700, NV, "start", INT)
A4 = img3d(h, "nepp_epp2b", 905, 566, 420)
columna(h, A4, [("montura", "2", "MONTURA"), ("lente", "1", "LENTE DE POLICARBONATO"), ("patilla", "", "PATILLA"), ("nariz", "3", "APOYO DE NARIZ"), ("marca", "5", "MARCA Z87+"),
                ("bisagra", "4", "BISAGRA")], 1250, 590, 760, paso=24)
columna(h, A4, [("tapon", "", "TAPON DE ESPUMA"), ("taponParado", "", "PUNTA REDONDA"), ("espuma", "", "CORTE: ESPUMA")], 1250, 790, 860, paso=24)
cajaUso(h, 1420, 590, 220, "USO EN OBRA", [
    "⚠ NINGUNO DE ESTOS GUANTES AISLA: CON TENSION, EL JUEGO DIELECTRICO (MAT-EPP-1).",
    "✓ ANTEOJO SIEMPRE PUESTO AL AMOLAR, PICAR O CORTAR. RAYADO O PARTIDO: SE CAMBIA.",
    "✓ TAPON: ENROLLAR, TIRAR LA OREJA Y SOSTENER 30 s, CON LAS MANOS LIMPIAS.",
    "⚠ TAPON DE UN SOLO USO: NO SE LAVA NI SE PRESTA."])
h.txt(905, 1028, "RENDER: three.js (r3d/escenas/nepp_epp2.mjs, nepp_epp2b.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_nepp.md", 9, 400, G, "start", INT)
rotuloMat(h, "MAT-EPP-2", "GUANTES DE TRABAJO,", "ANTEOJO Y TAPONES", "PALMAS, CORTE D1, ANTEOJO EN 3 VISTAS, TAPON Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_epp_2.svg"))
