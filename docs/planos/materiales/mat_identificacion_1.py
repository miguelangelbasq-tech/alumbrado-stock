"""MAT-IDENTIFICACION-1 (rev. B) · Anillos identificadores de cable (letra R/S/T y lisos de color) y spaghetti termocontraíble (altas del equipo):
1048 1050 1051 1053 1054 1055 3077 3078 3079 3080 3081 3082 (anillos) · 1049 3/8" · 1060 3/16" (termocontraíble).
Plano con ANI / SPAG / UNI de r3d/piezas/perfiles_nelec.mjs; 3D: r3d/out/nelec_ident.png.
Datos: rangos por cable de la descripción del pañol; Ø de los unipolares Superastic Jet; termocontraíble 2:1 3M FP-301 (3/8") y Panduit HSTT19 (3/16").
Medidas del anillo: AC. Fuentes: r3d/FUENTES_nelec.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nelekit import *

A25, A6, SP = PN["ANI"]["a25"], PN["ANI"]["a6"], PN["SPAG"]
U25, U6 = PN["UNI"]["u2_5M"], PN["UNI"]["u6M"]
h = hojaN()
RAYADOS[[k for k, _ in RAYADOS].index("XLP")] = ("XLP", "AISLACION PVC (UNIPOLAR)")


def ceA(cx, cy, A, e, cable=None, letra=""):
    """anillo en corte (C abierta abajo) con el cable adentro"""
    a0, a1 = math.radians(270 + A["abre"] / 2), math.radians(270 + 360 - A["abre"] / 2)
    N = 60
    out = [(cx + A["re"] * e * math.cos(a0 + (a1 - a0) * i / N), cy - A["re"] * e * math.sin(a0 + (a1 - a0) * i / N)) for i in range(N + 1)]
    inn = [(cx + A["ri"] * e * math.cos(a1 - (a1 - a0) * i / N), cy - A["ri"] * e * math.sin(a1 - (a1 - a0) * i / N)) for i in range(N + 1)]
    if cable:
        CK.corte(h, cx, cy, e, cable, color=False)
    h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in out + inn) + " Z", "url(#PLAS2)", K, 1.4)
    if letra: h.txt(cx, cy - A["re"] * e - 8, letra, 12, 700, K, "middle")


# =============== 1. ANILLOS EN CORTE ===============
e = 13.0
h.titulo(40, 62, "ANILLOS - CORTE SOBRE EL CABLE", "ESC. 13:1 · CLIP ABIERTO DE PVC FLEXIBLE (*)")
for A, U, cx, t, sub in ((A25, U25, 150, "1 A 2,5 mm²", "SOBRE 1 x 2,5 (Ø3,6)"), (A6, U6, 390, "4 A 6 mm²", "SOBRE 1 x 6 (Ø4,7)")):
    cy = 215
    ceA(cx, cy, A, e, U)
    h.dimH(cy + A["re"] * e + 26, cx - A["re"] * e, cx + A["re"] * e, f'Ø{2*A["re"]:.1f} (*)'.replace(".", ","), ext=cy + 4, c=OR)
    h.dimV(cx + A["re"] * e + 30, cy - A["ri"] * e, cy + A["ri"] * e, f'Ø{2*A["ri"]:.1f} (*)'.replace(".", ","), ext=cx + 4, c=OR)
    h.txt(cx, cy + A["re"] * e + 60, t, 10.5, 700, K, "middle"); h.txt(cx, cy + A["re"] * e + 74, sub, 9, 400, G, "middle")
    ga = math.radians(270 - A["abre"] / 2); h.txt(cx, cy + A["re"] * e + 6, f'{A["abre"]}° (*)', 8.5, 400, OR, "middle")
for n, (x, y), (gx, gy) in [("1", (150 - A25["re"] * e * .7, 215 - A25["re"] * e * .7), (70, 110)), ("2", (150, 215), (70, 330)), ("3", (390, 215 - A6["re"] * e * .95), (480, 110))]:
    h.globo(n, x, y, gx, gy, r=9)

# =============== 2. LATERAL CON LA LETRA ===============
el = 6.0
h.titulo(560, 62, "LATERAL - ANILLO CON LETRA", "ESC. 6:1 · LA LETRA SE LEE A LO LARGO DEL CABLE")
for A, U, y0, l in ((A25, U25, 150, "R"), (A6, U6, 260, "S")):
    x0 = 600; r = U["Ro"] * el
    h.rect(x0, y0 - r, 34 * el, 2 * r, "#fff", K, 1.2)
    xa = x0 + 14 * el; h.rect(xa, y0 - A["re"] * el, A["L"] * el, 2 * A["re"] * el, "url(#PLAS2)", K, 1.3)
    h.rect(xa + 2, y0 - A["re"] * el * .55, A["L"] * el - 4, A["re"] * el * 1.1, "#fff", K, .6); h.txt(xa + A["L"] * el / 2, y0 + 6, l, 15, 700, K, "middle")
    h.dimH(y0 - A["re"] * el - 14, xa, xa + A["L"] * el, f'{A["L"]:.0f} (*)', ext=y0 - A["re"] * el - 2, c=OR)
    h.dimV(x0 + 34 * el + 16, y0 - r, y0 + r, f'Ø{2*U["Ro"]:.1f}'.replace(".", ","), ext=x0 + 34 * el + 2)
    h.txt(x0, y0 + A["re"] * el + 20, "1 x 2,5 + ANILLO 1-2,5 mm²" if l == "R" else "1 x 6 + ANILLO 4-6 mm²", 9, 400, G)

# =============== 3. TERMOCONTRAIBLE ===============
DY = 380; es = 9.0
h.titulo(40, DY, "SPAGHETTI TERMOCONTRAIBLE 2:1 - ANTES Y DESPUES", "ESC. 9:1 · CORTE · SE CONTRAE CON PISTOLA DE CALOR")
for i, (k, cx, t) in enumerate((("s38", 130, '3/8" (1049)'), ("s316", 420, '3/16" (1060)'))):
    S = SP[k]; cy = DY + 108
    h.path(CK.circd(cx, cy, S["Ds"] / 2 * es) + " " + CK.circd(cx, cy, (S["Ds"] / 2 - S["es"]) * es, cw=False), "url(#PLAS)", K, 1.1, 'fill-rule="evenodd"')
    h.dimH(cy + S["Ds"] / 2 * es + 18, cx - S["Ds"] / 2 * es, cx + S["Ds"] / 2 * es, f'Ø{S["Ds"]:.2f}'.replace(".", ","), ext=cy + 2)
    cx2 = cx + 140
    h.path(CK.circd(cx2, cy, S["Dr"] / 2 * es) + " " + CK.circd(cx2, cy, (S["Dr"] / 2 - S["er"]) * es, cw=False), "url(#PLAS2)", K, 1.1, 'fill-rule="evenodd"')
    h.dimH(cy + S["Ds"] / 2 * es + 18, cx2 - S["Dr"] / 2 * es, cx2 + S["Dr"] / 2 * es, f'Ø{S["Dr"]:.2f}'.replace(".", ","), ext=cy + 2)
    h.txt(cx2 + S["Dr"] / 2 * es + 6, cy - 4, f'e = {S["er"]:.2f}'.replace(".", ","), 9, 400)
    h.path(f"M{cx + S['Ds']/2*es + 10:.1f},{cy:.1f} L{cx2 - S['Dr']/2*es - 10:.1f},{cy:.1f}", "none", K, 1, 'marker-end="url(#fl)"')
    h.ln(cx2 - S['Dr'] / 2 * es - 18, cy - 5, cx2 - S['Dr'] / 2 * es - 10, cy, K, 1); h.ln(cx2 - S['Dr'] / 2 * es - 18, cy + 5, cx2 - S['Dr'] / 2 * es - 10, cy, K, 1)
    h.txt(cx + 70, DY + 214, t, 10.5, 700, K, "middle")
    h.txt(cx + 70, DY + 228, "SUMINISTRADO → CONTRAIDO", 8.5, 400, G, "middle")
h.txt(40, DY + 250, "3/8\": ENTRA EN EL 1 x 6 (Ø4,7) Y CONTRAE A 4,75 → AJUSTA. 3/16\": EN EL 1 x 1,5 (Ø3,0) CONTRAE A 2,36 → AJUSTA.", 9, 400)

# =============== 4. TABLA ===============
anis = [(1048, "4-6", "AMARILLO", "R"), (1050, "4-6", "AMARILLO", "S"), (1051, "4-6", "AMARILLO", "T"), (3082, "4-6", "AMARILLO", "—"), (3081, "4-6", "VERDE", "—"),
        (3080, "4-6", "CELESTE", "—"), (1053, "1-2,5", "AMARILLO", "R"), (1054, "1-2,5", "AMARILLO", "S"), (1055, "1-2,5", "AMARILLO", "T"), (3077, "1-2,5", "AMARILLO", "—"),
        (3078, "1-2,5", "VERDE", "—"), (3079, "1-2,5", "CELESTE", "—"), (1049, '3/8"', "(*)", "Ø9,5 → 4,75"), (1060, '3/16"', "(*)", "Ø4,75 → 2,36")]
filas = [["COD.", "DESCRIPCION (TAL CUAL EL PAÑOL)", "UN.", "RANGO", "COLOR", "LETRA / DATO"]]
for c, rg, col, l in anis:
    r = catN(c, 52); filas.append([r[0], r[1], r[2], rg + (" mm²" if "-" in rg else ""), col, l])
yt = tablaN(h, 40, 662, [(40, "c", True), (360, "l", False), (34, "c", False), (90, "c", False), (80, "c", False), (196, "c", False)], filas, "CODIGOS DEL PAÑOL (14) - ALTAS DEL EQUIPO", rowh=13.6)
notasW(h, 40, yt + 20, [
    "COTAS EN mm. TERMOCONTRAIBLE 2:1: 3/8\" Ø9,53 → 4,75, PARED 0,64 (3M FP-301); 3/16\" Ø4,75 → 2,36, PARED 0,51 (PANDUIT HSTT19). Ø DE LOS CABLES: SUPERASTIC JET.",
    "(*) ANILLO: Ø, ANCHO, ABERTURA Y LETRA PROPORCIONALES AL RANGO DEL CABLE (NO HAY FICHA CON SUS MEDIDAS). MARCA A CONFIRMAR.",
    "(*) ANILLOS EN DOS FAMILIAS: CON LETRA 1048-1055 (FAMILIA 1) Y LISOS 3077-3082 (FAMILIA 3). NO HAY 1052 EN LA SERIE DE ANILLOS (ES LA MALLA).",
    "(*) COLOR DEL SPAGHETTI NO DICHO (SE DIBUJA NEGRO Y ROJO). UNIDADES MEZCLADAS: «Un.», «UN» Y «m» (1049 / 1060 POR METRO), TAL CUAL EL PAÑOL.",
    "R · S · T = L1 · L2 · L3. COLOR DEL ANILLO LISO: VERDE TIERRA, CELESTE NEUTRO, AMARILLO A DEFINIR (*)."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - ANILLOS Y TERMOCONTRAIBLE", "ADELANTE 1 x 2,5 · ATRAS 1 x 6 · ARRIBA SPAGHETTI SUELTO Y CONTRAIDO")
A = img3d(h, "nelec_ident", 895, 84, 590)
columna(h, A, [("s38", "", 'SPAGHETTI 3/8" SUELTO (1049)'), ("s38c", "", '3/8" CONTRAIDO SOBRE 1 x 6'), ("s316", "", '3/16" SUELTO (1060)'), ("s316c", "", '3/16" SOBRE 1 x 1,5'),
               ("bAm", "", "4-6 AMARILLO LISO (3082)"), ("bVe", "", "4-6 VERDE (3081)"), ("bCe", "", "4-6 CELESTE (3080)"), ("bT", "", "4-6 R · S · T (1048-1051)"),
               ("aAm", "", "1-2,5 AMARILLO LISO (3077)"), ("aVe", "", "1-2,5 VERDE (3078)"), ("aCe", "", "1-2,5 CELESTE (3079)"), ("aS", "1", "1-2,5 R · S · T (1053-1055)")],
        1478, 100, 520, paso=34)
bloque(h, 890, 590, "DATOS TECNICOS", ["ANILLO: SE ABRE Y SE CALZA SOBRE EL CABLE YA PELADO O ARMADO; NO SE CORRE (*).", "TERMOCONTRAIBLE 2:1: CALOR PAREJO, DEL MEDIO HACIA LAS PUNTAS."], w=740, sz=9.5, lh=13)
bloque(h, 890, 670, "DONDE SE USA", ["MARCAR FASES R · S · T EN TABLEROS Y TABLERITOS; TIERRA Y NEUTRO POR COLOR.", "TERMOCONTRAIBLE: AISLAR EMPALMES, PUNTERAS Y TERMINALES; IDENTIFICAR (*)."], w=740, sz=9.5, lh=13)
rayadosRef(h, 890, 760, ["PLAS", "PLAS2", "XLP", "CU"], cols=4, dx=185)
rotuloMat(h, "MAT-IDENTIFICACION-1", "ANILLOS IDENTIFICADORES", "Y TERMOCONTRAIBLE", "CORTES, LATERAL, ANTES/DESPUES, CODIGOS Y 3D", "13:1 · 9:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardar(h, "mat_identificacion_1")
