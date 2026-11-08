"""MAT-HERRAMIENTAS-4 (rev. A) · Llaves: francesa 8" (9030) y 10" (9031), juego de llaves Allen (9035, DE BAJA) y juego de llaves combinadas
con criquet «40» (9037, DE BAJA). Plano y 3D con los mismos contornos (perfiles_nherr.json: LLAVES). 3D: r3d/out/nherr_llaves.png.
Fuentes: r3d/FUENTES_nherr.md (EMTOP 8" 24 mm; Stanley / Eclipse 8" 29 mm; Teng 10" 33 mm; ISO 6787; ISO 2936)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

L = PH["LLAVES"]; F10, F8, C = L["f9031"], L["f9030"], L["comb"]
h = nuevaH()


def francesa(h, F, ox, oy, e, cot=True):
    v = Vista(h, ox, oy, e)
    multi(v, F["cuerpo"], "#fff", 1.2); multi(v, F["movil"], "#fff", 1.1)
    w = F["sinfin"]; a, b = v.p(w["x0"], w["y"] + w["r"]), v.p(w["x1"], w["y"] - w["r"])
    h.rect(a[0], a[1], b[0] - a[0], b[1] - a[1], "#fff", K, .9)
    for i in range(1, 20):
        x = w["x0"] + (w["x1"] - w["x0"]) * i / 20; p, q = v.p(x, w["y"] + w["r"]), v.p(x + .8, w["y"] - w["r"]); h.ln(p[0], p[1], q[0], q[1], K, .45)
    v.circ(F["ojo"]["x"], 0, F["ojo"]["r"], "none", .9)
    v.eje(-4, 0, F["L"] + 4, 0)
    if cot:
        yt = F["ancCab"] * .47 + 1.5
        v.cotaH(0, F["L"], yt + 10, f'{F["L"]} ({F["pulg"]}")', zext=yt)
        v.cotaV(-6, F["ab"] / 2, -F["ab"] / 2, "", yext=0)
        p = v.p(-8, 0); h.txt(p[0] - 2, p[1] + 4, f'{F["ab"]} MAX. (*)', 9, 400, OR, "end")
        v.cotaV(F["ancCab"] * 1.1 + 4, yt, -F["ancCab"] * .47 + 1.5, f'{F["ancCab"]} (*)', yext=F["ancCab"] * .6, c=OR)
    return v


# ============ 1. FRANCESA 10" ============
h.titulo(40, 58, "LLAVE FRANCESA 10\" (9031) Y 8\" (9030)", "ESC. 1:2,5 · VISTA DE ARRIBA · ISO 6787 · BOCA A LA ABERTURA DEL DIBUJO (60 %)")
v = francesa(h, F10, 150, 182, 1.6)
for (x, y, tx, ty, t, an) in [(F10["ancCab"] * .3, F10["ab"] / 2 + 8, -8, 34, "MANDIBULA FIJA", "end"), (F10["ancCab"] * .1, -F10["ab"] / 2 - 8, -6, -46, "MANDIBULA MOVIL", "end"),
                              ((F10["sinfin"]["x0"] + F10["sinfin"]["x1"]) / 2, F10["sinfin"]["y"] - 4, 60, -40, "SINFIN (SE GIRA CON EL PULGAR)", "start"),
                              (F10["ojo"]["x"], -3, F10["L"] - 40, -30, "OJO PARA COLGAR", "start"), (F10["L"] * .62, 6, F10["L"] * .5, 26, "MANGO (CROMO-VANADIO (*))", "start")]:
    p = v.p(x, y); q = v.p(tx, ty); llamada(h, p[0], p[1], q[0], q[1], t, sz=8.5, anc=an, c=OR if "(*)" in t else K)
francesa(h, F8, 150, 338, 1.6)
# costado
X = lambda x: 150 + x * 1.6
yy = 408; h.rect(X(0), yy - F10["eCab"] / 2 * 1.6, F10["ancCab"] * 1.02 * 1.6, F10["eCab"] * 1.6, "#fff", K, 1.1)
h.path(f"M{X(F10['ancCab'] * 1.02)},{yy - 3.6 * 1.6} H{X(F10['L'])} V{yy + 3.6 * 1.6} H{X(F10['ancCab'] * 1.02)} Z", "#fff", K, 1.0)
h.dimV(X(0) - 10, yy - F10["eCab"] / 2 * 1.6, yy + F10["eCab"] / 2 * 1.6, f'{F10["eCab"]} (*)', ext=X(0), c=OR)
h.dimV(X(F10["L"]) + 10, yy - 3.6 * 1.6, yy + 3.6 * 1.6, "7,2 (*)", ext=X(F10["L"]), c=OR)
h.txt(X(0), yy + 26, "COSTADO 10\"", 9, 700, G)
h.txt(46, 338 + 4, "8\"", 12, 700); h.txt(46, 182 + 4, "10\"", 12, 700)

# ============ 2. ALLEN ============
subt(h, 40, 456, "JUEGO ALLEN 9035 (DE BAJA)", "ESC. 1:4 · LA DE 6 · ISO 2936 CORTA (*)")
ax, ay, ea = 70, 566, 1.0
s6, l16, l26 = 6, 96, 38
h.path(f"M{ax},{ay} H{ax + l16 * ea} V{ay - s6 * ea} H{ax + s6 * ea} V{ay - l26 * ea} H{ax} Z", "#fff", K, 1.1)
h.dimH(ay + 14, ax, ax + l16, "96 (l1) (*)", ext=ay, c=OR); h.dimV(ax - 12, ay - l26, ay, "38 (l2) (*)", ext=ax, c=OR)
hx, hy, rr = 210, 530, 14
pts = [(hx + rr * math.cos(math.radians(30 + 60 * i)), hy + rr * math.sin(math.radians(30 + 60 * i))) for i in range(6)]
h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in pts) + " Z", "url(#MET)", K, 1.1)
h.dimH(hy + 24, hx - rr * math.cos(math.radians(30)), hx + rr * math.cos(math.radians(30)), "s", ext=hy)
h.txt(hx, hy - 22, "CORTE (×4)", 8.5, 400, G, "middle")
cols = [(52, "c", True), (52, "c", True), (52, "c", True)]
fil = [["s", "l1", "l2"]] + [[n(s), n(l1), n(l2)] for s, l1, l2 in L["allen"]]
h.tabla(268, 470, cols, fil, rowh=12.5)
h.txt(268, 470 + 10 * 12.5 + 12, "MEDIDAS DEL JUEGO (*)", 8.5, 400, OR)

# ============ 3. COMBINADA ============
subt(h, 440, 456, "LLAVE COMBINADA CON CRIQUET 9037 (DE BAJA)", "ESC. 1:2,5 · LA DE 13 · BOCA 15° + ESTRELLA A CRIQUE (*)")
vc = Vista(h, 470, 556, 1.6)
multi(vc, C["cont"], "#fff", 1.2); multi(vc, C["engranaje"], "url(#MET)", .6)
vc.cotaH(0, C["L"], C["estrella"] / 2 + 10, f'{C["L"]} (*)', zext=C["estrella"] / 2, c=OR)
vc.cotaV(-5, C["s"] / 2, -C["s"] / 2, "", yext=0); p = vc.p(-6, 0); h.txt(p[0] - 2, p[1] + 4, "13", 9, 700, K, "end")
for (x, y, tx, ty, t, an) in [(C["boca"] / 2, -C["boca"] / 2 + 2, 20, -30, "BOCA", "start"), (C["ojoX"], -C["s"] * .5, C["L"] - 60, -30, "ESTRELLA CON CRIQUET (72 DIENTES (*))", "start")]:
    p = vc.p(x, y); q = vc.p(tx, ty); llamada(h, p[0], p[1], q[0], q[1], t, sz=8.5, anc=an, c=OR if "(*)" in t else K)

# ============ TABLAS Y NOTAS ============
EX = {9030: "200 · BOCA 24–29 (*)", 9031: "250 · BOCA 30–33 (*)", 9035: "1,5 A 10 (*)", 9037: "«40» (*)"}
yt = tablaH(h, 40, 640, [(c, EX[c]) for c in (9030, 9031, 9035, 9037)], w=800, rowh=14.5)
cols = [(230, "l", False), (250, "c", False), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["8\" (200): BOCA MAXIMA", "24 (EMTOP) · 28 (TENG) · 29 (STANLEY)", "FICHAS DE FABRICANTE: VARIA CON LA MARCA"],
       ["10\" (250): BOCA MAXIMA", "33 (TENG 4004) · 30 (*)", "NO SE ENCONTRO 29 / 30 PUBLICADO (*)"],
       ["NORMA", "ISO 6787 / DIN 3117", "STANLEY 250 (ROBERT DYAS)"],
       ["ALLEN: LARGOS", "ISO 2936 TABLA 1 (*)", "NO SE PUDO LEER LA TABLA: VALORES DE REFERENCIA"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
notasW(h, 40, yt + 16, [
    "(*) BOCA MAXIMA DE CADA FRANCESA: DEPENDE DE LA MARCA (24 A 29 EN 8\", 30 A 33 EN 10\"). MEDIR LA DEL PAÑOL. CABEZA DIBUJADA RECTA (LAS REALES VAN A 15°).",
    "(*) 9037 «JUEGO DE LLAVES COMBINADA CRIQUET 40»: NO SE SABE SI «40» ES LA CANTIDAD DE PIEZAS O UNA MEDIDA; SE DIBUJA UNA DE 13. ESTA DE BAJA.",
    "(*) 9035 JUEGO ALLEN: CANTIDAD Y MEDIDAS DEL JUEGO A CONFIRMAR. ESTA DE BAJA.",
    "LAS LLAVES NO SON AISLADAS: SOLO SIN TENSION. UNIDADES DEL RESPALDO TAL CUAL (UN)."], w=800, lh=13.5)

# ============ 3D ============
h.titulo(890, 58, "VISTA 3D - LLAVES", "FRANCESAS 10\" Y 8\" · JUEGO ALLEN · COMBINADA DE 13 CON CRIQUET")
A = img3d(h, "nherr_llaves", 884, 80, 600)
columna(h, A, [("f_fija", "1", "MANDIBULA FIJA"), ("f_movil", "2", "MANDIBULA MOVIL"), ("f_sinfin", "3", "SINFIN"), ("f_mango", "4", "MANGO 10\""),
               ("f_ojo", "", "OJO"), ("f8", "", "9030 FRANCESA 8\""), ("c_boca", "5", "BOCA"), ("c_estr", "6", "ESTRELLA A CRIQUE"), ("c_cuerpo", "", "9037 COMBINADA"),
               ("allen10", "", "9035 ALLEN 10"), ("allen15", "", "ALLEN 1,5"), ("allen_corto", "", "BRAZO CORTO")], 1500, 96, 520, paso=32)
usoBloque(h, 890, 560, [
    "FRANCESAS: AJUSTAR LOS BULONES Y TUERCAS DE LOS PERNOS DE ANCLAJE DE LA COLUMNA METALICA, DE LOS MORSETOS DE LA ACOMETIDA, DEL TOMACABLE DE LA JABALINA Y DEL RACK.",
    "LA FUERZA VA SOBRE LA MANDIBULA FIJA: LA MOVIL SIEMPRE DEL LADO DEL GIRO.",
    "ALLEN: PRISIONEROS DEL BRAZO Y DE LA LUMINARIA, TORNILLOS DE TAPAS.",
    "COMBINADA CON CRIQUET: TUERCAS DE 13 EN LUGARES DONDE NO ENTRA LA FRANCESA."], w=740)
bloque(h, 890, 700, "CUIDADO", [
    "LA FRANCESA SE AJUSTA BIEN A LA TUERCA ANTES DE HACER FUERZA: SI QUEDA FLOJA, REDONDEA LAS ARISTAS.",
    "NO SE ALARGA EL MANGO CON UN CAÑO NI SE GOLPEA CON LA MAZA.",
    "LLAVES DE ACERO: NO AISLADAS. CERCA DE PARTES CON TENSION, SOLO HERRAMIENTA IEC 60900."], w=740, sz=10, lh=13.5)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_llaves.mjs) CON LOS MISMOS CONTORNOS. FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-4", "LLAVES FRANCESAS, ALLEN", "Y COMBINADA CON CRIQUET", "VISTAS, COSTADO, CORTE DE LA ALLEN Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_4")
