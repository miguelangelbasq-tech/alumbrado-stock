"""MAT-HERRAMIENTAS-7 (rev. A) · Discos para amoladora: desbaste 115 (8028), flap 115 (8029), corte 115 (8030) y corte 230 (9042).
Plano y 3D con las mismas medidas (perfiles_nherr.json: DISCOS). 3D: r3d/out/nherr_discos.png.
Fuentes: r3d/FUENTES_nherr.md (EN 12413; Hoffmann / KWB / Wolfcraft 115 × 1,0 × 22,23 · 13 300 rpm · 80 m/s; Metabo 230 × 3,0 T41; RS PRO flap 115 × 7)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nherrkit import *

D = PH["DISCOS"]
h = nuevaH()


def media(h, Dk, ox, oy, e, ez):
    """medio corte del disco (eje vertical a la izquierda): capas de abrasivo, mallas de fibra y ojal"""
    R_, ri, t = Dk["D"] / 2, Dk["agujero"] / 2, Dk["e"]
    X = lambda r: ox + r * e; Z = lambda z: oy - z * ez
    hh = Dk["depr"]["h"] if Dk["tipo"] == 27 else 0
    rd = Dk["depr"]["D"] / 2 if Dk["tipo"] == 27 else 0
    def poly(a, b):
        if Dk["tipo"] != 27: return [(ri, a), (R_, a), (R_, b), (ri, b)]
        return [(ri, a - hh), (rd, a - hh), (rd + 9, a), (R_, a), (R_, b), (rd + 9, b), (rd, b - hh), (ri, b - hh)]
    h.path("M" + " L".join(f"{X(r):.1f},{Z(z):.1f}" for r, z in poly(0, t)) + " Z", "url(#ABR)", K, 1.2)
    n_ = Dk.get("mallas", 0)
    for i in range(n_):
        f = (i + 1) / (n_ + 1)
        pts = poly(t * f - .12, t * f + .12)
        h.path("M" + " L".join(f"{X(r):.1f},{Z(z):.1f}" for r, z in pts) + " Z", "#111", K, .3)
    h.rect(X(ri), Z(t + .2 - hh), 6 * e, (t + .5) * ez, "url(#MET)", K, .8)
    h.ln(X(0), Z(t + 8), X(0), Z(-hh - 8), K, .5, h.EJE)
    h.dimH(Z(t - hh) - 14 - (hh * ez if hh else 0), X(0), X(R_), f'{Dk["D"]}/2', ext=Z(t))
    h.dimV(X(R_) + 12, Z(t), Z(0), n(t), ext=X(R_))
    h.dimH(Z(-hh) + 16, X(0), X(ri), "22,23/2", ext=Z(-hh))
    return X, Z


# ============ 1. CORTE 115 Y 230 (TIPO 41) ============
h.titulo(40, 58, "DISCOS DE CORTE · TIPO 41 (PLANOS)", "MEDIO CORTE · RADIO 1,25:1 (8030) Y 1:1,6 (9042) · ESPESOR 2,5:1 Y 2:1")
media(h, D["d8030"], 60, 150, 5.0, 10)
h.txt(60, 196, "8030 · 115 × 1,6 (*) × 22,23 · 2 MALLAS (*)", 9.5, 700, OR)
media(h, D["d9042"], 60, 270, 2.5, 8)
h.txt(60, 316, "9042 · 230 × 3,0 × 22,23 · 2 MALLAS (*)", 9.5, 700, OR)
for (x, y, tx, ty, t) in [(60 + 40 * 5, 150 - 1.6 * 8, 420, 112, "ABRASIVO (ALUMINA) + RESINA"), (60 + 50 * 5, 150 - 1.6 * 10 * .66, 420, 132, "MALLA DE FIBRA DE VIDRIO (REFUERZO)"),
                          (60 + 13 * 5, 150 - 1.6 * 10 - 2, 420, 152, "OJAL DE CHAPA (*)")]:
    llamada(h, x, y, tx, ty, t, sz=8.5, c=OR if "(*)" in t else K)

# ============ 2. DESBASTE T27 ============
subt(h, 40, 352, "DESBASTE 8028 · TIPO 27", "MEDIO CORTE · RADIO 1,1:1 · ESPESOR 1:1")
media(h, D["d8028"], 60, 440, 4.4, 4)
h.txt(60, 490, "115 × 6,4 × 22,23 · 3 MALLAS (*) · SE APOYA A 15–30° (*)", 9.5, 700, OR)

# ============ 3. FLAP T29 ============
subt(h, 440, 352, "DISCO FLAP 8029 · TIPO 29", "MEDIO CORTE · 1:1,3 · LAMINAS SOBRE PLATO DE FIBRA")
fx, fy, ef = 460, 445, 3.0
R_ = D["d8029"]["D"] / 2
h.path(f"M{fx + 11.1 * ef},{fy + 4 * ef} H{fx + 20 * ef} L{fx + 24 * ef},{fy} L{fx + (R_ - 2) * ef},{fy - 2.5 * ef} V{fy - 4 * ef} L{fx + 24 * ef},{fy - 1.5 * ef} L{fx + 20 * ef},{fy + 2.5 * ef} H{fx + 11.1 * ef} Z", "url(#FIB)", K, 1.0)
for i in range(10):
    x0 = fx + (26 + i * 3.1) * ef; y0 = fy - (2.5 + i * .06) * ef
    h.path(f"M{x0:.1f},{y0:.1f} l{9 * ef:.1f},{-3.2 * ef:.1f} l{.6 * ef:.1f},{1.2 * ef:.1f} l{-9 * ef:.1f},{3.2 * ef:.1f} Z", "url(#ABR)", K, .5)
h.dimH(fy + 4 * ef + 16, fx, fx + R_ * ef, "115/2", ext=fy + 4 * ef)
h.dimV(fx + R_ * ef + 14, fy - 10 * ef, fy + 4 * ef, "≈ 7 (*)", ext=fx + R_ * ef, c=OR)
h.ln(fx, fy - 14 * ef, fx, fy + 10 * ef, K, .5, h.EJE)
h.txt(440, 500, "LAMINAS DE TELA CON GRANO DE ZIRCONIO, SUPERPUESTAS", 8.5, 400, G); h.txt(440, 513, f'{D["d8029"]["laminas"]} LAMINAS (*) · GRANO {D["d8029"]["grano"]} (*)', 8.5, 400, OR)

# ============ 4. VELOCIDAD ============
subt(h, 40, 540, "VELOCIDAD MAXIMA = 80 m/s EN EL BORDE", "n = v × 60 000 / (π × D)")
for i, (k, d_) in enumerate([("115", 115), ("230", 230)]):
    nn = 80 * 60000 / (math.pi * d_)
    h.txt(60, 576 + i * 16, f"Ø{k}: 80 × 60 000 / (π × {k}) = {nn:,.0f} rpm → EL DISCO DICE {'13 300' if d_ == 115 else '6 600'} rpm".replace(",", "."), 9.5, 400, K, "start", MONO)
h.txt(60, 612, "LA AMOLADORA DE 115 GIRA ≈ 11 000–12 000 rpm (*): NUNCA PONER UN DISCO DE 230 EN UNA AMOLADORA CHICA SIN GUARDA.", 8.5, 400, OR)

# ============ TABLAS Y NOTAS ============
EX = {8028: "115 × 6,4 × 22,23 · T27 (*)", 8029: "115 × 22,23 · T29 (*)", 8030: "115 × 1,6 (*) × 22,23 · T41", 9042: "230 × 3,0 (*) × 22,23 · T41"}
yt = tablaH(h, 40, 640, [(c, EX[c]) for c in (8028, 8029, 8030, 9042)], w=800, rowh=14.5)
cols = [(230, "l", False), (250, "c", False), (320, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"],
       ["CORTE 115", "1,0 O 1,6 · 13 200–13 300 rpm", "HOFFMANN, KWB, WOLFCRAFT (EN 12413)"],
       ["CORTE 230 × 3,0", "80 m/s · T41", "METABO FLEXIAMANT 616302000"],
       ["DESBASTE 115 × 6,4", "13 300 rpm · 80 m/s", "Q-FLEX (ALISOUQ)"],
       ["FLAP 115", "≈ 7 · 13 300 rpm · P40–P120", "RS PRO / BETAFER / KWB"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14.5, titulo="DATOS DE REFERENCIA")
yr = rayadosC(h, 40, yt + 20, ["ABR", "FIB", "MET"], cols=3, dx=220, rowh=18)
notasW(h, 40, yr + 16, [
    "(*) EL RESPALDO NO DICE EL ESPESOR NI LA MARCA: SE DIBUJA EL CORTE 115 DE 1,6 Y EL 230 DE 3,0. CANTIDAD DE MALLAS, OJAL, LAMINAS Y GRANO DEL FLAP: A CONFIRMAR.",
    "8029 TIENE UNIDAD «c/a» EN EL RESPALDO (¿CADA UNO?): SE COPIA TAL CUAL. LAS DEMAS: Un. / UN.",
    "EL DISCO DE CORTE NO SE USA DE COSTADO (DESBASTAR CON EL CORTE LO ROMPE). REVISAR FECHA DE VENCIMIENTO IMPRESA EN EL OJAL (*)."], w=800, lh=13.5)

# ============ 3D ============
h.titulo(890, 58, "VISTA 3D - DISCOS DE AMOLADORA", "EL DE CORTE 115 Y EL DE DESBASTE CORTADOS A CUARTO: CAPAS Y MALLAS")
A3 = img3d(h, "nherr_discos", 884, 80, 600)
columna(h, A3, [("d230", "1", "9042 CORTE 230"), ("d230_ojal", "2", "OJAL"), ("c_abr", "3", "ABRASIVO"), ("c_malla", "4", "MALLA DE FIBRA"), ("c_ojal", "", "8030 CORTE 115"),
                ("d_depr", "5", "CENTRO DEPRIMIDO"), ("d_abr", "", "8028 DESBASTE"), ("d_malla", "", "3 MALLAS"), ("f_lam", "6", "LAMINAS DE ZIRCONIO"), ("f_plato", "7", "PLATO DE FIBRA")], 1500, 96, 500, paso=36)
usoBloque(h, 890, 540, [
    "CORTE 115 (8030): CORTAR HIERRO DE LA ARMADURA, PERFILES, BULONES, CAÑO H°G° Y RIEL DIN EN EL TALLER Y EN LA OBRA.",
    "CORTE 230 (9042): CORTAR BALDOSA, HORMIGON Y CORDON CON LA AMOLADORA GRANDE PARA ABRIR LA ZANJA Y LA VEREDA (*: DISCO DE METAL; PARA PIEDRA VA OTRO).",
    "DESBASTE (8028): SACAR REBABAS DE CORTES Y SOLDADURAS, EMPAREJAR LA CABEZA DEL PUNTERO.",
    "FLAP (8029): TERMINACION Y LIMPIEZA DE SOLDADURA ANTES DE PINTAR (CAÑO, SOPORTES).",
    "SIEMPRE CON GUARDA, ANTEOJOS O MASCARA, GUANTES Y PROTECTOR AUDITIVO."], w=740)
nota3d(h, 890, 1028, "RENDER: three.js (r3d/escenas/nherr_discos.mjs) CON LAS MISMAS MEDIDAS. FUENTES: r3d/FUENTES_nherr.md")
rotuloMat(h, "MAT-HERRAMIENTAS-7", "DISCOS DE CORTE,", "DESBASTE Y FLAP", "MEDIOS CORTES, VELOCIDAD Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="A", fecha=FECHA)
guardarH(h, "mat_herramientas_7")
