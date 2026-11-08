"""MAT-HERRAMIENTAS-5 (rev. A) · Golpe y picado: martillo maza 500 g (8031), martillo maza 2 kg (8035, DE BAJA), cabo de 40 cm para maza (8034)
y punta de hierro / puntero octogonal (8036, DE BAJA). Plano y 3D con las mismas medidas (perfiles_nherr.json: ALB). 3D: r3d/out/nherr_mazas.png.
Fuentes: r3d/FUENTES_nherr.md (DIN 6475: Stahlwille 1000 g / cabo 260, Hoffmann 2 kg / cabo 280–300; DIN 7256: Bellota / Rennsteig 300 × 16–18)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

A = PH["ALB"]; M5, M2, CB, PU = A["maza05"], A["maza2"], A["cabo"], A["punta"]
h = nuevaH()


def masa(Mz):
    Lc, a, H = Mz["cab"]; o = Mz["ojo"]
    v = Lc * a * H - math.pi / 4 * o[0] * o[1] * a
    return v / 1000, v / 1000 * 7.85


def maza(h, Mz, ox, oy, e, cot=True, lbl=True):
    """vista de frente (cabo horizontal, cabeza a la derecha) y corte A-A por el eje del cabo"""
    Lc, a, H = Mz["cab"]; o = Mz["ojo"]; L = Mz["cabo"]; x0 = L - a
    X = lambda x: ox + x * e; Y = lambda y: oy - y * e
    # cabo (perfil del costado: alto = sec[1])
    s1 = Mz["sec"][1]
    pts = [(0, s1 * .45), (25, s1 / 2), (L - a - 70, s1 * .47), (L - a, o[1] / 2), (L + .3, o[1] / 2)]
    up = [(X(x), Y(y)) for x, y in pts]; dn = [(X(x), Y(-y)) for x, y in reversed(pts)]
    h.path("M" + " L".join(f"{p:.1f},{q:.1f}" for p, q in up + dn) + " Z", "url(#WOOD)", K, 1.0)
    # cabeza: corte A-A por el eje (rayado acero), el ojo con el cabo y la cuña
    h.path(f"M{X(x0)},{Y(Lc / 2 - 3)} L{X(x0 + 3)},{Y(Lc / 2)} H{X(L - 3)} L{X(L)},{Y(Lc / 2 - 3)} V{Y(o[0] / 2)} H{X(x0)} Z", "url(#MET)", K, 1.2)
    h.path(f"M{X(x0)},{Y(-o[0] / 2)} H{X(L)} V{Y(-Lc / 2 + 3)} L{X(L - 3)},{Y(-Lc / 2)} H{X(x0 + 3)} L{X(x0)},{Y(-Lc / 2 + 3)} Z", "url(#MET)", K, 1.2)
    h.rect(X(x0), Y(o[0] / 2), a * e, o[0] * e, "url(#WOOD)", K, .9)
    h.path(f"M{X(L)},{Y(1.5)} L{X(L - a * .7)},{Y(.2)} L{X(L - a * .7)},{Y(-.2)} L{X(L)},{Y(-1.5)} Z", "#111", K, .4)
    h.ln(X(-4), oy, X(L + 6), oy, K, .4, h.EJE)
    if cot:
        h.dimH(Y(Lc / 2) - 12, X(0), X(L), f"{L} (*)" if Mz["cod"] == 8031 else f"{L}", ext=Y(s1 / 2), c=OR if Mz["cod"] == 8031 else K)
        h.dimV(X(L) + 12, Y(Lc / 2), Y(-Lc / 2), f"{Lc} (*)", ext=X(L), c=OR)
        h.dimH(Y(-Lc / 2) + 14, X(x0), X(L), f"{a} (*)", ext=Y(-Lc / 2), c=OR)
        h.dimV(X(x0) - 8, Y(o[0] / 2), Y(-o[0] / 2), f"{o[0]} (*)", ext=X(x0), c=OR)
    return X, Y


# ============ 1. MAZA 500 g ============
h.titulo(40, 58, "MARTILLO MAZA 500 g (8031) · CORTE A-A POR EL CABO", "ESC. 1:2,6 · DIN 6475 · CABEZA DE ACERO FORJADO, CABO DE MADERA ACUÑADO")
X, Y = maza(h, M5, 60, 170, 1.55)
x0 = M5["cabo"] - M5["cab"][1]
for (px, py, tx, ty, t, an) in [(x0 + 22, -M5["cab"][0] / 2 + 8, M5["cabo"] + 20, -34, "CABEZA (ACERO) (*)", "start"), (x0 + 12, 0, x0 - 34, -34, "CABO DENTRO DEL OJO", "end"),
                                (M5["cabo"] - 6, 0, M5["cabo"] + 20, 36, "CUÑA DE ACERO", "start"), (120, M5["sec"][1] / 2 - 2, 90, 30, "CABO DE MADERA (*)", "end"),
                                (M5["cabo"] - 2, M5["cab"][0] / 2 - 1, M5["cabo"] + 22, 52, "CARA DE GOLPE", "start")]:
    p = (X(px), Y(py)); q = (X(tx), Y(ty)); llamada(h, p[0], p[1], q[0], q[1], t, sz=8.5, anc=an, c=OR if "(*)" in t else K)
v5, m5 = masa(M5)
h.txt(60, 262, f"MASA: (30 × 30 × 80 − OJO π/4 × 20 × 13 × 30) = {n(v5)} cm³ × 7,85 g/cm³ ≈ {m5:.0f} g (*)", 9, 400, OR)

# ============ 2. MAZA 2 kg ============
subt(h, 40, 300, "MARTILLO MAZA 2 kg (8035, DE BAJA)", "ESC. 1:4 · MISMO DIBUJO, OTRA MEDIDA")
X2, Y2 = maza(h, M2, 60, 418, 1.0)
v2, m2 = masa(M2)
h.txt(60, 494, f"MASA: (50 × 50 × 120 − OJO π/4 × 34 × 22 × 50) = {n(v2)} cm³ × 7,85 ≈ {m2:.0f} g (*)", 9, 400, OR)

# ============ 3. CABO 8034 ============
subt(h, 440, 300, "CABO DE 40 cm PARA MAZA (8034)", "ESC. 1:4,3 · VISTA Y CORTE B-B")
e3 = .92; ox3, oy3 = 456, 380
s1 = CB["sec"][1]; s0 = CB["sec"][0]; o = CB["ojo"]; Lb = CB["L"]
pts = [(0, s1 * .45), (25, s1 / 2), (Lb - 50 - 70, s1 * .47), (Lb - 50, o[1] / 2), (Lb, o[1] / 2)]
up = [(ox3 + x * e3, oy3 - y * e3) for x, y in pts]; dn = [(ox3 + x * e3, oy3 + y * e3) for x, y in reversed(pts)]
h.path("M" + " L".join(f"{p:.1f},{q:.1f}" for p, q in up + dn) + " Z", "url(#WOOD)", K, 1.0)
h.ln(ox3 + (Lb - 30) * e3, oy3, ox3 + Lb * e3, oy3, K, 1.4); h.txt(ox3 + (Lb - 60) * e3, oy3 + 24, "RANURA DE LA CUÑA (*)", 8, 400, OR, "end")
h.dimH(oy3 + s1 * e3 / 2 + 16, ox3, ox3 + Lb * e3, "400", ext=oy3 + s1 * e3 / 2)
h.dimH(oy3 - s1 * e3 / 2 - 14, ox3 + (Lb - 50) * e3, ox3 + Lb * e3, "50 (OJO) (*)", ext=oy3 - o[1] / 2 * e3, c=OR)
bx, by = 520, 455
h.a(f'<ellipse cx="{bx}" cy="{by}" rx="{s0 / 2 * 1.4:.1f}" ry="{s1 / 2 * 1.4:.1f}" fill="url(#WOOD)" stroke="{K}" stroke-width="1.1"/>')
h.dimH(by + s1 / 2 * 1.4 + 12, bx - s0 / 2 * 1.4, bx + s0 / 2 * 1.4, f"{s0} (*)", ext=by, c=OR); h.dimV(bx + s0 / 2 * 1.4 + 12, by - s1 / 2 * 1.4, by + s1 / 2 * 1.4, f"{s1} (*)", ext=bx, c=OR)
h.txt(bx - 40, by - 26, "B-B", 10, 700)
h.txt(600, 440, "VA EN LA MAZA DE 2 kg (OJO 34 × 22) (*)", 8.5, 400, OR); h.txt(600, 454, "LA VETA, A LO LARGO DEL CABO", 8.5, 400, G)

# ============ 4. PUNTA 8036 ============
subt(h, 40, 520, "PUNTA DE HIERRO / PUNTERO OCTOGONAL (8036, DE BAJA)", "ESC. 1:3,2 · DIN 7256 · 300 × 18 (REF. RENNSTEIG / BELLOTA)")
e4 = 1.25; ox4, oy4 = 60, 585
rc = PU["af"] / 2 / math.cos(math.pi / 8)
X4 = lambda x: ox4 + x * e4
h.path(f"M{X4(0)},{oy4} L{X4(PU['punta'])},{oy4 - rc * e4} H{X4(PU['L'] - PU['cabeza'])} L{X4(PU['L'])},{oy4 - PU['af'] / 2 * .8 * e4} V{oy4 + PU['af'] / 2 * .8 * e4} L{X4(PU['L'] - PU['cabeza'])},{oy4 + rc * e4} H{X4(PU['punta'])} Z", "#fff", K, 1.1)
for yy in (PU["af"] / 2 * .41, -PU["af"] / 2 * .41): h.ln(X4(PU["punta"]), oy4 - yy * e4, X4(PU["L"] - PU["cabeza"]), oy4 - yy * e4, K, .6)
h.dimH(oy4 - rc * e4 - 12, X4(0), X4(PU["L"]), "300", ext=oy4 - rc * e4)
h.dimH(oy4 + rc * e4 + 14, X4(0), X4(PU["punta"]), f'{PU["punta"]} (*)', ext=oy4, c=OR)
ocx, ocy = 500, 585
pts = [(ocx + rc * 2.4 * math.cos(math.pi / 8 + math.pi / 4 * i), ocy + rc * 2.4 * math.sin(math.pi / 8 + math.pi / 4 * i)) for i in range(8)]
h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in pts) + " Z", "url(#MET)", K, 1.1)
h.dimH(ocy + rc * 2.4 + 14, ocx - PU["af"] * 1.2, ocx + PU["af"] * 1.2, "18 (ENTRE CARAS)", ext=ocy + PU["af"] * 1.2)
h.txt(ocx + 32, ocy - 16, "C-C", 10, 700)
h.txt(600, 568, "CABEZA ACHAFLANADA: SI SE HACE «HONGO»", 8.5, 400, OR); h.txt(600, 582, "(REBABA), SE AMOLA ANTES DE USAR (*)", 8.5, 400, OR)

# ============ TABLAS Y NOTAS ============
EX = {8031: f"500 g · CABO {M5['cabo']} (*)", 8035: "2 kg · CABO 300", 8034: "400", 8036: "300 × 18 (*)"}
yt = tablaH(h, 40, 650, [(c, EX[c]) for c in (8031, 8035, 8034, 8036)], w=800, rowh=14.5)
cols = [(230, "l", False), (250, "c", False), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["MAZA 1000 g: CABO", "260 (L2 95)", "STAHLWILLE DIN 6475"],
       ["MAZA 2 kg: CABO", "280 A 300", "HOFFMANN (DOS MODELOS)"],
       ["PUNTERO", "300 × 16 / 18 · OCTOGONAL", "BELLOTA 5821 · RENNSTEIG 331 300 0 (DIN 7256)"],
       ["MEDIDAS DE LA CABEZA", "POR MASA Y DENSIDAD 7,85 (*)", "DIN 6475: NO SE PUDO LEER LA TABLA (*)"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
yr = rayadosC(h, 40, yt + 20, ["MET", "WOOD"], cols=3, dx=200, rowh=18)
notasW(h, 40, yr + 16, [
    "(*) MEDIDAS DE LAS CABEZAS: CALCULADAS PARA QUE DEN LA MASA DEL PAÑOL (500 g Y 2 kg) CON SECCION CUADRADA; CABO DE LA DE 500 g Y SECCIONES DEL CABO: PROPORCIONALES.",
    "UNA CABEZA FLOJA EN EL CABO SE SALE: SE ACUÑA DE NUEVO O SE CAMBIA EL CABO (8034). NO SE USA CON EL CABO RAJADO.",
    "UNIDADES DEL RESPALDO TAL CUAL (Un.). 8035 Y 8036 FIGURAN DE BAJA (activo = false)."], w=800, lh=13.5)

# ============ 3D ============
h.titulo(890, 58, "VISTA 3D - MAZAS, CABO Y PUNTERO", "LA DE 500 g CORTADA A CUARTO EN LA CABEZA: SE VE EL CABO EN EL OJO")
A3 = img3d(h, "nherr_mazas", 884, 80, 600)
columna(h, A3, [("m2_cab", "1", "CABEZA 2 kg"), ("m2_cara", "2", "CARA DE GOLPE"), ("m2_cabo", "", "CABO 300"), ("m5_ojo", "3", "OJO + CABO (CORTE)"),
                ("m5_cuna", "4", "CUÑA"), ("m5_cab", "", "CABEZA 500 g"), ("m5_cabo", "", "CABO 8031"), ("cabo", "5", "CABO 8034 (40 cm)"), ("cabo_ojo", "", "PUNTA PARA EL OJO"),
                ("pu_punta", "6", "PUNTA"), ("pu_cuerpo", "7", "CUERPO OCTOGONAL"), ("pu_cabeza", "8", "CABEZA DEL PUNTERO")], 1500, 96, 520, paso=32)
usoBloque(h, 890, 560, [
    "MAZA 500 g: CLAVAR ESTACAS DEL REPLANTEO, ACOMODAR LADRILLOS Y MOLDES, GOLPEAR EL PUNTERO EN ROTURAS CHICAS.",
    "MAZA 2 kg: HINCAR LA JABALINA DE PUESTA A TIERRA (CON CABEZAL) Y ROMPER VEREDA O CONTRAPISO CON EL PUNTERO.",
    "CABO 8034: REPUESTO DEL CABO DE LA MAZA (SE ACUÑA EN EL OJO).",
    "PUNTERO: PICAR HORMIGON Y BALDOSA PARA EL POZO DE LA FUNDACION, LA ZANJA Y LA CAMARA.",
    "SIEMPRE CON ANTEOJOS Y GUANTES: SALTAN ASTILLAS."], w=740)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_mazas.mjs) CON LAS MISMAS MEDIDAS. FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-5", "MARTILLOS MAZA, CABO", "Y PUNTERO", "VISTAS, CORTES A-A, B-B, C-C Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_5")
