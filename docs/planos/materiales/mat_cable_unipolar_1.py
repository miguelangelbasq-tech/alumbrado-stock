"""MAT-CABLE_UNIPOLAR-1 (rev. B) · Cables unipolares IRAM NM 247-3 nuevos del pañol (altas del equipo):
1044 1 × 1,5 celeste · 1045 1 × 1,5 marrón · 1056 / 1057 / 1058 / 1043 / 1041 1 × 2,5 celeste / rojo / marrón / negro / verde-amarillo ·
1042 1 × 6 marrón · 1034 1 × 10 verde-amarillo (DE BAJA). Plano con UNI de r3d/piezas/perfiles_nelec.mjs; 3D: r3d/out/nelec_uni.png.
Datos: Prysmian Superastic Jet (1,5: Ø3,0 / 0,7 · 2,5: Ø3,6 / 0,8 · alambre 0,26) y ficha de la app (6: Ø4,7 / 0,8 · 10: Ø6,0 / 1,0). Fuentes: r3d/FUENTES_nelec.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nelekit import *

U = PN["UNI"]
h = hojaN()
RAYADOS[[k for k, _ in RAYADOS].index("XLP")] = ("XLP", "AISLACION PVC")

# =============== 1. CORTES A ESCALA (los 4 tamaños) ===============
e = 14.0
h.titulo(40, 62, "CORTES - 1,5 · 2,5 · 6 · 10 mm²", "ESC. 14:1 · CUERDA CLASE 5 (FLEXIBLE) + PVC · A COLOR Y EN LINEAS")
xs = [90, 220, 370, 560]
for (k, t), x in zip((("u1_5N", "1 x 1,5"), ("u2_5R", "1 x 2,5"), ("u6M", "1 x 6"), ("u10V", "1 x 10")), xs):
    C = U[k]; cy = 190
    CK.corte(h, x, cy, e, C, color=True)
    CK.corte(h, x, cy + 130, e, C, color=False)
    h.dimH(cy + C["Ro"] * e + 16, x - C["Ro"] * e, x + C["Ro"] * e, f'Ø{C["D"]:.1f}'.replace(".", ","), ext=cy + 2)
    h.txt(x, cy + 130 + C["Ro"] * e + 24, t, 10, 700, K, "middle")
    c = C["conds"][0]; h.txt(x, cy + 130 + C["Ro"] * e + 38, f'AISL. {c["e"]:.1f}'.replace(".", ","), 9, 400, G, "middle")
CK.cota_radial(h, xs[3], 320, U["u10V"]["conds"][0]["R"] * e, U["u10V"]["Ro"] * e, 35, "1,0", dx=30)
h.globo("1", xs[3] - 30, 320 - 30, xs[3] + 120, 260, r=9); h.globo("2", xs[3] + 10, 320 + 10, xs[3] + 120, 380, r=9)
h.txt(xs[3] + 132, 264, "AISLACION PVC", 9, 400); h.txt(xs[3] + 132, 384, "CUERDA CLASE 5 (*)", 9, 400, OR)

# =============== 2. LATERAL PELADO ===============
DY = 440
h.titulo(40, DY, "LATERAL - PUNTA PELADA (1 x 2,5)", "ESC. 6:1 · PELADO SEGUN LA PUNTERA O EL BORNE (*)")
el = 6; x0, y0 = 70, DY + 70; C = U["u2_5R"]; r = C["Ro"] * el; rc = C["conds"][0]["R"] * el
h.path(f"M{x0:.1f},{y0-r:.1f} H{x0+60*el:.1f} V{y0+r:.1f} H{x0:.1f} q-6,{-r/2:.1f} 0,{-r:.1f} t0,{-r:.1f} Z", "#fff", K, 1.4)
h.rect(x0 + 60 * el, y0 - rc, 12 * el, 2 * rc, "#fff", K, .9)
xx = x0 + 60 * el + 3
while xx < x0 + 72 * el - 4: h.ln(xx, y0 + rc, xx + 5, y0 - rc, K, .45); xx += 3.5
h.dimH(y0 + r + 18, x0 + 60 * el, x0 + 72 * el, "12 (*)", ext=y0 + r + 2, c=OR)
h.dimV(x0 - 16, y0 - r, y0 + r, "Ø3,6", ext=x0 - 2)
h.txt(x0 + 80 * el, y0 + 4, "CON PUNTERA SI VA A BORNE DE TORNILLO (MAT-TERMINALES)", 9, 400)

# =============== 3. D1 · COLORES ===============
h.titulo(470, DY + 110, "D1 - QUE COLOR PARA QUE (AEA 90364)", "")
for i, (col, t, ray) in enumerate((("#6e3b1d", "MARRON: L1 (FASE)", None), ("#202124", "NEGRO: L2 (FASE)", None), ("#c8302c", "ROJO: L3 (FASE)", None),
                                    ("#2f86c9", "CELESTE: NEUTRO", None), ("#2f9a3e", "VERDE-AMARILLO: TIERRA (PE)", "#f2c418"))):
    yy = DY + 150 + i * 20
    h.rect(480, yy - 9, 40, 12, col, K, .6)
    if ray: h.rect(480, yy - 6, 40, 5, ray, "none", 0)
    h.txt(530, yy + 1, t, 9.5, 400)

# =============== 4. TABLA ===============
TAB = [(1044, "1,5", "CELESTE", "3,0 / 0,7"), (1045, "1,5", "MARRON", "3,0 / 0,7"), (1056, "2,5", "CELESTE", "3,6 / 0,8"), (1057, "2,5", "ROJO", "3,6 / 0,8"),
       (1058, "2,5", "MARRON", "3,6 / 0,8"), (1043, "2,5", "NEGRO", "3,6 / 0,8"), (1041, "2,5", "VERDE-AMARILLO", "3,6 / 0,8"), (1042, "6", "MARRON", "4,7 / 0,8"),
       (1034, "10", "VERDE-AMARILLO", "6,0 / 1,0")]
filas = [["COD.", "DESCRIPCION (TAL CUAL EL PAÑOL)", "UN.", "mm²", "COLOR", "Ø / AISL.", "ESTADO"]]
for c, s_, col, d in TAB:
    r = catN(c, 46); filas.append([r[0], r[1], r[2], s_, col, d, "DE BAJA" if r[3] else "ACTIVO"])
yt = tablaN(h, 40, 680, [(40, "c", True), (300, "l", False), (54, "c", False), (40, "c", True), (120, "c", False), (88, "c", True), (86, "c", False)],
            filas, "CODIGOS DEL PAÑOL (9) - ALTAS DEL EQUIPO", rowh=14)
notasW(h, 40, yt + 20, [
    "COTAS EN mm. 1,5 Y 2,5: PRYSMIAN SUPERASTIC JET (IRAM NM 247-3, CATALOGO 2020/2026); 6 Y 10: FICHA DE LA APP. 450/750 V.",
    "(*) CUERDA CLASE 5: ALAMBRES Ø0,26 (1,5 Y 2,5), CANTIDAD DIBUJADA ILUSTRATIVA. PELADO ILUSTRATIVO.",
    "(*) 1034 (1 x 10 VERDE-AMARILLO) ESTA DE BAJA: EL MISMO CABLE ES EL 7010 (MAT-JABALINA / PAT). 1042 SE SUMA A 1030/1031 (1 x 6).",
    "(*) UNIDADES TAL CUAL EL PAÑOL Y MEZCLADAS: «m», «M», «METRO» Y «c/a» EN 1045 (¿CADA UNO? REVISAR).",
    "FUENTES: r3d/FUENTES_nelec.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - LOS 9 UNIPOLARES", "DE ADELANTE A ATRAS: 10 · 6 · 2,5 (V/A, NEGRO, MARRON, ROJO, CELESTE) · 1,5 (MARRON, CELESTE)")
A = img3d(h, "nelec_uni", 890, 96, 600)
lst = [("u10V", "1 x 10 V/A (1034) DE BAJA"), ("u6M", "1 x 6 MARRON (1042)"), ("u2_5V", "1 x 2,5 V/A (1041)"), ("u2_5K", "1 x 2,5 NEGRO (1043)"),
       ("u2_5M", "1 x 2,5 MARRON (1058)"), ("u2_5R", "1 x 2,5 ROJO (1057)"), ("u2_5N", "1 x 2,5 CELESTE (1056)"), ("u1_5M", "1 x 1,5 MARRON (1045)"), ("u1_5N", "1 x 1,5 CELESTE (1044)")]
for i, (k, t) in enumerate(lst):
    p = A(k + "cu"); globo3d(h, p, str(i + 1), p[0] + 22, p[1] + 34, r=10)
    h.circ(1515, 130 + i * 30, 10, "#fff", NV, 1.1); h.txt(1515, 134 + i * 30, str(i + 1), 11, 700, NV, "middle", INT)
    h.txt(1532, 134 + i * 30, t, 10, 700, ROJO if "BAJA" in t else NV, "start", INT)
h.txt(1505, 420, "PUNTAS: CUERDA CLASE 5 PELADA", 9.5, 400, G, "start", INT)
bloque(h, 890, 500, "DATOS TECNICOS", ["IRAM NM 247-3 · 450/750 V · COBRE CLASE 5 · AISLACION PVC 70 °C (*).", "PARA INSTALAR EN CAÑO O DENTRO DE TABLEROS; NO VA ENTERRADO."], w=740, sz=9.5, lh=13)
bloque(h, 890, 580, "DONDE SE USA", ["CABLEADO INTERNO DE TABLEROS Y TABLERITOS; PUENTES ENTRE BORNES.", "2,5 / 1,5: COMANDO (CONTACTOR, FOTOCONTROL, HORARIO). 6 Y 10: POTENCIA Y TIERRA."], w=740, sz=9.5, lh=13)
rayadosRef(h, 890, 670, ["XLP", "CU"], cols=2, dx=220)
rotuloMat(h, "MAT-CABLE_UNIPOLAR-1", "CABLES UNIPOLARES", "IRAM NM 247-3 · ALTAS", "CORTES, LATERAL, D1, CODIGOS Y 3D", "14:1 · 6:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardar(h, "mat_cable_unipolar_1")
