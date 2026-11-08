"""MAT-HERRAMIENTAS-6 (rev. A) · Albañilería: fratacho de madera (8027), fratacho con fieltro de goma espuma (8033) y hacha de mano (8032).
Plano y 3D con las mismas medidas (perfiles_nherr.json: ALB). 3D: r3d/out/nherr_frat.png.
Fuentes: r3d/FUENTES_nherr.md (Easy: fratacho de pino 250 / 300 / 400; Hela 115 × 350 × 20). Hacha: sin ficha (todo (*))."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

A = PH["ALB"]; F, G, HC = A["fratM"], A["fratG"], A["hacha"]
h = nuevaH()


def fratacho(h, Fr, ox, oy, e, goma=False, titulo=""):
    """vista de arriba (izq.) y de costado (der.)"""
    L, W_, t = Fr["L"], Fr["A"], Fr["e"]; m = Fr["mango"]
    h.rect(ox, oy, L * e, W_ * e, "#fff", K, 1.2)
    h.rect(ox + (L - m["L"]) / 2 * e, oy + (W_ - m["A"]) / 2 * e, m["L"] * e, m["A"] * e, "#fff", K, 1.0)
    for x in (15, m["L"] - 15): h.circ(ox + ((L - m["L"]) / 2 + x) * e, oy + W_ / 2 * e, 4 * e, "#fff", K, .7)
    h.dimH(oy - 10, ox, ox + L * e, f"{L} (*)", ext=oy, c=OR); h.dimV(ox - 10, oy, oy + W_ * e, f"{W_} (*)", ext=ox, c=OR)
    # costado
    sx, sy = ox, oy + W_ * e + 66
    gz = Fr.get("goma", 0) if goma else 0
    if goma: h.rect(sx, sy + t * e, L * e, gz * e, "url(#ESP)", K, 1.0)
    h.rect(sx, sy, L * e, t * e, "url(#WOOD)" if not goma else "url(#PLAS)", K, 1.1)
    man = A["manija"]; hue = A["manijaHueco"]; x0 = (L - m["L"]) / 2
    h.path("M" + " L".join(f"{sx + (x0 + x) * e:.1f},{sy - z * e:.1f}" for x, z in man) + " Z", "url(#WOOD)" if not goma else "url(#PLAS)", K, 1.0)
    h.path("M" + " L".join(f"{sx + (x0 + x) * e:.1f},{sy - z * e:.1f}" for x, z in hue) + " Z", "#fff", K, .8)
    h.dimV(sx + L * e + 10, sy, sy + t * e, f"{t} (*)", ext=sx + L * e, c=OR)
    if goma: h.dimV(sx + L * e + 30, sy + t * e, sy + (t + gz) * e, f"{gz} (*)", ext=sx + L * e, c=OR)
    h.dimV(sx - 10, sy - 46 * e, sy, "46 (*)", ext=sx + x0 * e, c=OR)
    return sy


# ============ 1. FRATACHO DE MADERA ============
h.titulo(40, 58, "FRATACHO DE MADERA 8027", "ESC. 1:4 · ARRIBA Y COSTADO · TABLA DE PINO + MANIJA ATORNILLADA")
sy = fratacho(h, F, 70, 110, 1.0)
h.txt(400, 130, "TABLA DE PINO (VETA A LO LARGO)", 8.5, 400, G); h.txt(400, 144, "MANIJA DE MADERA, 2 TORNILLOS (*)", 8.5, 400, OR)
# ============ 2. FRATACHO CON GOMA ESPUMA ============
subt(h, 40, 372, "FRATACHO CON FIELTRO DE GOMA ESPUMA 8033", "ESC. 1:4 · BASE PLASTICA + ESPONJA PEGADA ABAJO")
sy2 = fratacho(h, G, 70, 422, 1.0, goma=True)
h.txt(400, 440, "BASE PLASTICA (*)", 8.5, 400, OR); h.txt(400, 454, "ESPUMA: SE CAMBIA CUANDO SE GASTA (*)", 8.5, 400, OR)
# corte D-D de la espuma (detalle)
subt(h, 560, 92, "D1 · CORTE DE LA ESPUMA", "ESC. 1:2")
h.rect(580, 130, 220, 20, "url(#PLAS)", K, 1.1); h.rect(580, 150, 220, 40, "url(#ESP)", K, 1.1)
h.txt(810, 144, "BASE", 8.5, 400, G); h.txt(810, 174, "ESPUMA", 8.5, 400, G)
h.txt(580, 210, "LA ESPUMA MOJADA LEVANTA EL GRANO FINO", 8.5, 400, G); h.txt(580, 224, "Y DEJA EL REVOQUE «FIELTRADO»", 8.5, 400, G)

# ============ 3. HACHA ============
subt(h, 560, 260, "HACHA DE MANO 8032", "ESC. 1:3,3 · COSTADO DE LA CABEZA Y CORTE E-E POR LA HOJA")
e3 = 1.2; hx, hy = 680, 345
pts = [(hx + x * e3, hy - y * e3 * -1) for x, y in HC["cont"]]
pts = [(hx + x * e3, hy + (-y) * e3) for x, y in HC["cont"]]
h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in [(hx + x * e3, hy - y * e3 * 1) for x, y in HC["cont"]]) + " Z", "#fff", K, 1.2)
# cabo saliendo hacia la izquierda (eje x de la herramienta = horizontal en el papel)
h.a(f'<ellipse cx="{hx}" cy="{hy}" rx="{HC["ojo"][1] / 2 * e3 + 2:.1f}" ry="{HC["ojo"][0] / 2 * e3:.1f}" fill="url(#WOOD)" stroke="{K}" stroke-width=".9"/>')
h.txt(hx, hy - 24 * e3 - 6, "OJO CON EL CABO", 8, 400, G, "middle")
ylin = -HC["esp"]["yHoja"] - 15
h.ln(hx - 60 * e3, hy + 75 * e3, hx + 56 * e3, hy + 75 * e3, K, .6, h.EJE); h.txt(hx - 64 * e3, hy + 75 * e3 + 4, "E", 11, 700, K, "end"); h.txt(hx + 58 * e3, hy + 75 * e3 + 4, "E", 11, 700)
h.dimV(hx - 66 * e3 - 6, hy - 26 * e3, hy + 121 * e3, f'{26 + 121} (*)', ext=hx - 20 * e3, c=OR)
h.dimH(hy + 121 * e3 + 12, hx - 53 * e3, hx + 47 * e3, "FILO ≈ 100 (*)", ext=hy + 114 * e3, c=OR)
# corte E-E: cuña
ex, ey = 790, 470
E_ = HC["esp"]
h.path(f"M{ex - E_['cuerpo'] / 2 * 1.6},{ey - 60} L{ex + E_['cuerpo'] / 2 * 1.6},{ey - 60} L{ex + E_['hoja'] / 2 * 1.6},{ey + 10} L{ex + E_['filo'] / 2 * 1.6},{ey + 64} L{ex - E_['filo'] / 2 * 1.6},{ey + 64} L{ex - E_['hoja'] / 2 * 1.6},{ey + 10} Z", "url(#MET)", K, 1.1)
h.txt(ex, ey - 68, "E-E", 10, 700, K, "middle")
h.dimH(ey - 72 - 8, ex - E_["cuerpo"] / 2 * 1.6, ex + E_["cuerpo"] / 2 * 1.6, "", ext=ey - 60)
h.txt(ex + 28, ey - 52, f'{E_["cuerpo"]} (*)', 8.5, 400, OR); h.txt(ex + 12, ey + 70, "FILO", 8.5, 400, G)

# ============ TABLAS Y NOTAS ============
EX = {8027: "300 × 140 × 20 (*)", 8033: "280 × 140 + 20 ESPUMA (*)", 8032: "600 g (*) · CABO 360 (*)"}
yt = tablaH(h, 40, 690, [(c, EX[c]) for c in (8027, 8033, 8032)], w=800, rowh=14.5)
cols = [(230, "l", False), (250, "c", False), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["FRATACHO DE PINO: LARGOS", "250 · 300 · 400", "EASY (GARDEX)"],
       ["PLATACHO DE MADERA", "115 × 350 × 20 · 140 × 400 × 20", "HELA (EASY CHILE)"],
       ["HACHA DE MANO", "SIN FICHA EN EL PAÑOL (*)", "MEDIDAS PROPORCIONALES (*)"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
yr = rayadosC(h, 40, yt + 20, ["WOOD", "PLAS", "ESP", "MET"], cols=4, dx=190, rowh=18)
notasW(h, 40, yr + 16, [
    "(*) EL RESPALDO NO DA MEDIDAS: FRATACHOS DIBUJADOS DE 300 × 140 (MADERA) Y 280 × 140 (GOMA ESPUMA); MANIJA, ESPESORES, PESO Y FORMA DEL HACHA: A CONFIRMAR.",
    "EL FRATACHO DE MADERA SE LAVA AL TERMINAR: SI SE SECA CON MORTERO SE DEFORMA. EL DE ESPUMA, ENJUAGADO Y A LA SOMBRA.",
    "UNIDADES DEL RESPALDO TAL CUAL (Un.)."], w=800, lh=13.5)

# ============ 3D ============
h.titulo(890, 58, "VISTA 3D - FRATACHOS Y HACHA DE MANO", "EL DE GOMA ESPUMA DADO VUELTA, PARA VER LA ESPONJA")
A3 = img3d(h, "nherr_frat", 884, 80, 600)
columna(h, A3, [("f1_base", "1", "TABLA DE PINO"), ("f1_manija", "2", "MANIJA"), ("f1_tornillo", "", "TORNILLO"), ("f2_espuma", "3", "GOMA ESPUMA"),
                ("f2_base", "4", "BASE PLASTICA"), ("h_ojo", "5", "CABEZA (OJO)"), ("h_hoja", "6", "HOJA"), ("h_filo", "7", "FILO"), ("h_cabo", "8", "CABO")], 1500, 110, 500, paso=36)
usoBloque(h, 890, 560, [
    "FRATACHO DE MADERA: REVOCAR Y EMPAREJAR EL MORTERO DE LA BASE DEL TABLERO, LA REPOSICION DE VEREDA Y EL SELLO DE LA FUNDACION.",
    "FRATACHO CON ESPUMA: TERMINACION FINA (FIELTRADO) DEL REVOQUE Y DE LA CARPETA DE REPOSICION.",
    "HACHA DE MANO: CORTAR RAICES EN LA ZANJA Y EN EL POZO; ESTACAS DEL REPLANTEO; PODA CHICA (ITEM 82) (*).",
    "HACHA: CON GUANTES Y ANTEOJOS, LEJOS DE CABLES ENTERRADOS. EL FILO SE GUARDA TAPADO."], w=740)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_frat.mjs) CON LAS MISMAS MEDIDAS. FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-6", "FRATACHOS Y", "HACHA DE MANO", "VISTAS, COSTADOS, D1, CORTE E-E Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_6")
