"""MAT-FICHAS-1 (rev. B) · Fichas IRAM 2073 (altas del equipo): 2061 macho 10 A, 2062 hembra 10 A, 9043 macho 20 A, 9044 hembra 20 A.
Plano con FICHA de r3d/piezas/perfiles_nelec.mjs; 3D: r3d/out/nelec_fichas.png.
Datos: IRAM 2073 (clavija 2P+T 10 y 20 A, 250 V), patas planas 18,5 y tierra 22 (Museum of Plugs and Sockets; Interpower: 18,2 / 21,4), 20 A más separadas
(compatible NEMA 10-20). Ancho / espesor de las patas, separación y cuerpo: AC (cuerpo 10 A con las cifras sin rotular de la ficha Kalop). Fuentes: r3d/FUENTES_nelec.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nelekit import *

F10, F20, H10, H20 = PN["FICHA"]["f10"], PN["FICHA"]["f20"], PN["FICHA"]["h10"], PN["FICHA"]["h20"]
h = hojaN()


def patas(F):
    p, t = F["pata"], F["tierra"]; a = math.radians(p["ang"])
    return [("L", -p["cx"], p["cz"], -a, p["a"], p["e"], p["L"]), ("N", p["cx"], p["cz"], a, p["a"], p["e"], p["L"]), ("T", 0, t["cz"], math.pi / 2, t["a"], t["e"], t["L"])]


def rrect(cx, cy, W, H, r, e, fill="#fff", sw=1.5):
    h.a(f'<rect x="{cx - W/2*e:.1f}" y="{cy - H/2*e:.1f}" width="{W*e:.1f}" height="{H*e:.1f}" rx="{r*e:.1f}" fill="{fill}" stroke="{K}" stroke-width="{sw}"/>')


def pataF(cx, cy, x, z, a, w, t, e, fill="url(#CU)", ranura=False):
    c, s = math.cos(a), math.sin(a)
    pts = [(-t / 2, -w / 2), (t / 2, -w / 2), (t / 2, w / 2), (-t / 2, w / 2)]
    if ranura: pts = [(-(t + 1) / 2, -(w + 1.2) / 2), ((t + 1) / 2, -(w + 1.2) / 2), ((t + 1) / 2, (w + 1.2) / 2), (-(t + 1) / 2, (w + 1.2) / 2)]
    d = "M" + " L".join(f"{cx + (x + u * c - v * s) * e:.1f},{cy - (z + u * s + v * c) * e:.1f}" for u, v in pts) + " Z"
    h.path(d, fill, K, .9)


# =============== 1. FRENTES DE LOS MACHOS ===============
e = 3.0
h.titulo(40, 62, "FRENTE - MACHOS 10 A Y 20 A", "ESC. 3:1 · VISTO DESDE LAS PATAS (L Y N EN V, TIERRA ABAJO)")
for (F, cx, t) in ((F10, 150, "2061 · 10 A"), (F20, 400, "9043 · 20 A")):
    cy = 230; C = F["cuerpo"]
    rrect(cx, cy, C["W"], C["H"], C["r"], e)
    for n, x, z, a, w, tt, L in patas(F): pataF(cx, cy, x, z, a, w, tt, e)
    h.ln(cx, cy - C["H"] / 2 * e - 10, cx, cy + C["H"] / 2 * e + 10, K, .4, h.EJE); h.ln(cx - C["W"] / 2 * e - 10, cy, cx + C["W"] / 2 * e + 10, cy, K, .4, h.EJE)
    h.dimH(cy + C["H"] / 2 * e + 22, cx - C["W"] / 2 * e, cx + C["W"] / 2 * e, f'{C["W"]} (*)', ext=cy + C["H"] / 2 * e + 2, c=OR)
    h.dimV(cx - C["W"] / 2 * e - 18, cy - C["H"] / 2 * e, cy + C["H"] / 2 * e, f'{C["H"]} (*)', ext=cx - C["W"] / 2 * e - 2, c=OR)
    p = F["pata"]
    h.dimH(cy - C["H"] / 2 * e - 14, cx - p["cx"] * e, cx + p["cx"] * e, f'{2*p["cx"]:.1f} (*)'.replace(".", ","), ext=cy - p["cz"] * e, c=OR)
    h.txt(cx, cy + C["H"] / 2 * e + 52, t, 10.5, 700, K, "middle")
    for n, x, z, a, w, tt, L in patas(F):
        h.txt(cx + (x * 1.8 + (6 if n == "N" else -6 if n == "L" else 0)) * e, cy - (z * 1.6 + (0 if n != "T" else -2)) * e + 4, n, 9, 700, K, "middle")
h.txt(275, 330, "PATAS L Y N A 30° DE LA VERTICAL (*)", 9, 400, OR, "middle")

# =============== 2. LATERAL Y CORTE DEL MACHO 10 A ===============
el = 2.6; LX, LY = 560, 240
h.titulo(560, 62, "MACHO 10 A - MITAD EN CORTE", "ESC. 2,6:1 · LATERAL · BORNES Y GRAMPA (*)")
C = F10["cuerpo"]; Yv = lambda y: LX + (y + 22) * el; Zv = lambda z: LY - z * el
secs = [(0, 1), (C["frente"], 1), (C["L"] * .55, .94), (C["L"] * .82, .72), (C["L"], .52)]
top = " ".join(f"L{Yv(y):.1f},{Zv(C['H']/2*k):.1f}" for y, k in secs)
h.path(f"M{Yv(0):.1f},{Zv(0):.1f} " + top + f" L{Yv(C['L']):.1f},{Zv(0):.1f} Z", "#fff", K, 1.5)
h.path(f"M{Yv(0):.1f},{Zv(0):.1f} " + " ".join(f"L{Yv(y):.1f},{Zv(-C['H']/2*k):.1f}" for y, k in secs) + f" L{Yv(C['L']):.1f},{Zv(0):.1f} Z", "url(#PLAS)", K, 1.4)
h.path(f"M{Yv(2.5):.1f},{Zv(-2):.1f} " + " ".join(f"L{Yv(min(y, C['L'] - 3)):.1f},{Zv(-(C['H']/2*k - 2.5)):.1f}" for y, k in secs[1:]) + f" L{Yv(C['L'] - 3):.1f},{Zv(-2):.1f} Z", "#fff", K, .8)
p, t = F10["pata"], F10["tierra"]
h.rect(Yv(-p["L"]), Zv(p["cz"] + .8), (p["L"] + 14) * el, 1.6 * el, "url(#CU)", K, .9)
h.rect(Yv(-t["L"]), Zv(t["cz"] + .8), (t["L"] + 14) * el, 1.6 * el, "url(#CU)", K, .9)
h.rect(Yv(14), Zv(t["cz"] + 3.2), 8 * el, 6.4 * el, "url(#CU)", K, .8)
h.circ(Yv(18), Zv(t["cz"] - 4.2), 2.6 * el * .5, "#fff", K, .8)
h.rect(Yv(C["L"] * .55), Zv(-F10["cable"]["D"] / 2 + 0), (C["L"] * .45 + 30) * el, F10["cable"]["D"] / 2 * el, "url(#PVCV)", K, .9)
h.rect(Yv(C["L"] * .7 - 3), Zv(-F10["cable"]["D"] / 2), 6 * el, 2.8 * el, "url(#PLAS2)", K, .8)
h.ln(Yv(-30), Zv(0), Yv(C["L"] + 32), Zv(0), K, .4, h.EJE)
h.dimH(Zv(C["H"] / 2) - 18, Yv(0), Yv(C["L"]), "50,5 (*)", ext=Zv(C["H"] / 2) - 2, c=OR)
h.dimH(Zv(-C["H"] / 2) + 22, Yv(-p["L"]), Yv(0), "18,5", ext=Zv(p["cz"]) + 4)
h.dimH(Zv(-C["H"] / 2) + 44, Yv(-t["L"]), Yv(0), "22", ext=Zv(t["cz"]) + 4)
for n, (y, z), (gx, gy) in [("1", (-10, p["cz"]), (LX - 10, LY - 110)), ("2", (-14, t["cz"]), (LX - 10, LY + 110)), ("3", (18, t["cz"]), (LX + 100, LY + 110)),
                             ("4", (C["L"] * .7, -F10["cable"]["D"] / 2 + 1), (LX + 200, LY + 110)), ("5", (C["L"] * .8, -1.5), (LX + 250, LY + 80)), ("6", (C["L"] * .3, C["H"] * .4), (LX + 140, LY - 110))]:
    h.globo(n, Yv(y), Zv(z), gx, gy, r=9)

# =============== 3. FRENTES DE LAS HEMBRAS ===============
DY = 420; eh = 2.4
h.titulo(40, DY, "FRENTE - HEMBRAS (PROLONGADOR)", "ESC. 2,4:1 · RANURAS PARA LAS PATAS DEL MACHO")
for (Hh, F, cx, t) in ((H10, F10, 140, "2062 · 10 A"), (H20, F20, 330, "9044 · 20 A")):
    cy = DY + 120; C = Hh["cuerpo"]
    rrect(cx, cy, C["W"], C["H"], C["r"], eh)
    for n, x, z, a, w, tt, L in patas(F): pataF(cx, cy, x, z, a, w, tt, eh, "#222", ranura=True)
    h.dimH(cy + C["H"] / 2 * eh + 18, cx - C["W"] / 2 * eh, cx + C["W"] / 2 * eh, f'{C["W"]} (*)', ext=cy + C["H"] / 2 * eh + 2, c=OR)
    h.txt(cx, cy + C["H"] / 2 * eh + 44, t, 10.5, 700, K, "middle")

# =============== 4. D1 · CONEXION ===============
h.titulo(470, DY, "D1 - COMO SE CONECTA", "MIRANDO LOS BORNES DESDE ATRAS (*)")
bx, by = 520, DY + 60
for i, (n, col, t) in enumerate((("L", "#6e3b1d", "FASE: MARRON"), ("N", "#2f86c9", "NEUTRO: CELESTE"), ("T", "#2f9a3e", "TIERRA: VERDE-AMARILLO"))):
    h.circ(bx, by + i * 30, 9, col, K, .8); h.txt(bx, by + i * 30 + 4, n, 9, 700, "#fff", "middle", INT); h.txt(bx + 18, by + i * 30 + 4, t, 9.5, 400)
h.txt(470, by + 100, "IRAM 2073: L Y N EN POSICION INVERTIDA RESPECTO DE AS/NZS 3112.", 9, 400)
h.txt(470, by + 114, "LA TIERRA ES MAS LARGA: CONECTA PRIMERO Y DESCONECTA ULTIMO.", 9, 400)
h.txt(470, by + 128, "EL CABLE VA SUJETO POR LA GRAMPA, NUNCA TIRANDO DE LOS BORNES.", 9, 400)
h.txt(470, by + 142, "LA DE 20 A NO ENTRA EN UN TOMA DE 10 A (PATAS MAS SEPARADAS).", 9, 400)

# =============== 5. TABLA ===============
filas = [["COD.", "DESCRIPCION (TAL CUAL EL PAÑOL)", "UN.", "TIPO", "In", "PATAS L/N · T", "CABLE"]]
for c, ti, i_, pt, cb in ((2061, "MACHO 2P+T", "10 A", "18,5 · 22", "3 x 1,5 (*)"), (2062, "HEMBRA 2P+T", "10 A", "—", "3 x 1,5 (*)"),
                          (9043, "MACHO 2P+T", "20 A", "18,5 · 22", "3 x 2,5 (*)"), (9044, "HEMBRA 2P+T", "20 A", "—", "3 x 2,5 (*)")):
    r = catN(c); filas.append([r[0], r[1], r[2], ti, i_, pt, cb])
yt = tablaN(h, 40, 690, [(40, "c", True), (250, "l", False), (34, "c", False), (130, "l", False), (50, "c", True), (130, "c", True), (130, "c", False)], filas, "CODIGOS DEL PAÑOL (4) - ALTAS DEL EQUIPO")
notasW(h, 40, yt + 22, [
    "COTAS EN mm. PATAS L/N 18,5 Y TIERRA 22: MUSEUM OF PLUGS AND SOCKETS (INTERPOWER DA 18,2 Y 21,4). 250 V. LA NORMA ES PAGA: NO SE VIO.",
    "(*) ANCHO 6,5 Y ESPESOR 1,6 DE LAS PATAS, ANGULO 30°, SEPARACION, ANCHO DE LA TIERRA DEL 20 A Y CUERPOS: PROPORCIONALES (AS/NZS 3112, KALOP).",
    "(*) LA «HEMBRA» ES EL PROLONGADOR (CONTRAPARTE DE LA CLAVIJA); LOS TOMACORRIENTES SON IRAM 2071. FORMA DEL CUERPO A CONFIRMAR CON LA MARCA.",
    "(*) 2061/2062 EN FAMILIA 2 Y 9043/9044 EN FAMILIA 9 (VARIOS): MISMO PRODUCTO EN FAMILIAS DISTINTAS. UNIDADES «Un.» Y «UN» TAL CUAL.",
    "(*) SECCION DEL CABLE (3 x 1,5 / 3 x 2,5): SEGUN EL USO, A CONFIRMAR.", "FUENTES: r3d/FUENTES_nelec.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - MACHO Y HEMBRA DE 10 A Y DE 20 A", "DE IZQUIERDA A DERECHA: 2061 · 2062 · 9043 · 9044")
A = img3d(h, "nelec_fichas", 890, 96, 740)
lst = [("m10", "MACHO 10 A (2061)"), ("h10", "HEMBRA 10 A (2062)"), ("m20", "MACHO 20 A (9043)"), ("h20", "HEMBRA 20 A (9044)"),
       ("pataL", "PATA PLANA L / N (LATON)"), ("tierra", "PATA DE TIERRA, MAS LARGA"), ("ranura", "RANURA CON CONTACTO"), ("cable", "CABLE 3 x 1,5 (*)")]
off = {"m10": (-10, -40), "h10": (0, -50), "m20": (0, -50), "h20": (10, -40), "pataL": (-30, 30), "tierra": (-10, 46), "ranura": (10, 50), "cable": (-70, -24)}
for i, (k, t) in enumerate(lst):
    p = A(k); dx, dy = off[k]; globo3d(h, p, str(i + 1), p[0] + dx, p[1] + dy, r=10)
    yy = 440 + (i // 2) * 24; xx = 905 + (i % 2) * 300
    h.circ(xx, yy, 10, "#fff", NV, 1.1); h.txt(xx, yy + 4, str(i + 1), 11, 700, NV, "middle", INT); h.txt(xx + 16, yy + 4, t, 10, 700, NV, "start", INT)
bloque(h, 890, 560, "DATOS TECNICOS", ["IRAM 2073: CLAVIJA BIPOLAR CON TIERRA, 10 A Y 20 A, 250 V CA.", "PATAS DE LATON, CUERPO TERMOPLASTICO, BORNES CON TORNILLO (*)."], w=740, sz=9.5, lh=13)
bloque(h, 890, 640, "DONDE SE USA", ["ALARGUES Y HERRAMIENTAS ELECTRICAS DE OBRA Y GALPON (*).", "20 A: EQUIPOS DE MAS CONSUMO (SOLDADORA, HORMIGONERA) (*)."], w=740, sz=9.5, lh=13)
rayadosRef(h, 890, 730, ["PLAS", "PLAS2", "CU", "PVCV"], cols=4, dx=185)
rotuloMat(h, "MAT-FICHAS-1", "FICHAS IRAM 2073", "MACHO Y HEMBRA 10 A · 20 A", "FRENTES, MITAD EN CORTE, D1, CODIGOS Y 3D", "3:1 · 2,6:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardar(h, "mat_fichas_1")
