"""MAT-TABLERO-2 (rev. B) · Tablero de alumbrado armado (TT / TN-S): 3058, 3057, 3059, 3060, 3061, 3062 y sus aparatos 3049, 3055, 3004, 3054, 3050, 3071.
3D: r3d/out/protab_tab2.png (gabinete abierto, sin puerta) y protab_tab2_det.png (la placa con los aparatos). Base y fusible NH con NH de perfiles_protab.mjs.
Datos: FICHAS_TEC.tablero pieza 2 y su unifilar (NH gL 63 A, medidor «lo provee EPEC», diferencial 4 × 40 A 300 mA, contactor 25 A AC-1, salidas 1–4),
FICHAS_TEC.fusibles (NH00 79 × 58 × 30, Eaton 160NHG00B; base ETI PK00 30 × 119 × 58,5), AP-T-007 (TT) / AP-T-008 (TN-S), catálogo del pañol."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from protabkit import *

NH = PT["NH"]; B, F = NH["base"], NH["fus"]
h = nueva3()

# =============== UNIFILAR ===============
h.titulo(40, 62, "ESQUEMA UNIFILAR TIPICO (TT, AP-T-007)", "GUIA: SALIDAS Y PROTECCIONES SEGUN EL PROYECTO APROBADO")
X = 120; y = 104
def tri(x, y):
    for i in range(3): h.ln(x - 6, y + 4 - i * 4 + 6, x + 6, y - 4 - i * 4 + 6, K, .8)
h.txt(X, y, "ACOMETIDA EPEC 3 x 380 / 220 V", 10, 700, K, "middle"); y += 8
h.ln(X, y, X, y + 18, K, 1.4); tri(X, y + 6); y += 18
h.rect(X - 12, y, 24, 38, "#fff", K, 1.2); h.rect(X - 5, y + 6, 10, 26, "url(#CER)", K, .8); h.ln(X, y + 4, X, y + 34, K, .8)
h.txt(X + 22, y + 16, "BASE NH 00 + FUSIBLE gL 63 A (POR FASE)", 9.5, 700); h.txt(X + 22, y + 30, "3055 + 3004 · VARIANTE 3054", 9, 400, G)
h.globo("1", X - 12, y + 19, 56, y + 19, r=9); y += 38
h.ln(X, y, X, y + 16, K, 1.4); y += 16
h.rect(X - 22, y, 44, 32, "#fff", K, 1.2); h.txt(X, y + 21, "kWh", 11, 700, K, "middle")
h.txt(X + 32, y + 14, "MEDIDOR TRIFASICO (LO PROVEE EPEC)", 9.5, 700); h.txt(X + 32, y + 28, "3049", 9, 400, G)
h.globo("2", X - 22, y + 16, 56, y + 16, r=9); y += 32
h.ln(X, y, X, y + 16, K, 1.4); y += 16
h.rect(X - 14, y, 28, 38, "#fff", K, 1.2); h.ln(X - 8, y + 29, X + 8, y + 9, K, 1.2); h.circ(X, y + 19, 12, "none", K, .6)
h.txt(X + 22, y + 15, "DIFERENCIAL 4 x 40 A · 300 mA SUPERINM. (3007)", 9.5, 700); h.txt(X + 22, y + 29, "SOLO EN TT · TN-S: NO VA (AP-T-008)", 9, 400, G)
h.globo("3", X - 14, y + 19, 56, y + 19, r=9); y += 38
h.ln(X, y, X, y + 16, K, 1.4); y += 16
h.rect(X - 14, y, 28, 34, "#fff", K, 1.2); h.ln(X - 6, y + 25, X + 6, y + 9, K, 1.2)
h.txt(X + 22, y + 13, "CONTACTOR KM 25 A AC-1 · BOBINA 220 V (3005)", 9.5, 700); h.txt(X + 22, y + 27, "LO COMANDA EL FOTOCONTROL (3012) CON SELECTORA A-M", 9, 400, G)
h.globo("4", X - 14, y + 17, 56, y + 17, r=9); y += 34
h.ln(X, y, X, y + 16, K, 1.4); y += 16
h.ln(X - 60, y, X + 240, y, K, 2.4)
for i in range(4):
    xs = X - 50 + i * 80
    h.ln(xs, y, xs, y + 12, K, 1.2); h.rect(xs - 9, y + 12, 18, 28, "#fff", K, 1.1); h.ln(xs - 4, y + 35, xs + 4, y + 18, K, 1)
    h.ln(xs, y + 40, xs, y + 56, K, 1.2); h.txt(xs, y + 70, f"SALIDA {i+1}", 9, 700, K, "middle"); h.txt(xs, y + 82, "TM 2P (*)", 8.5, 400, OR, "middle")
h.globo("5", X - 59, y + 26, 56, y + 26, r=9)
h.globo("6", X + 270, y + 56, 56, y + 100, r=9) if False else None
h.txt(470, 160, "TT: LA BARRA PE VA SOLA A SU JABALINA,", 9.5, 400); h.txt(470, 174, "SIN UNION NEUTRO-PE (AP-T-007).", 9.5, 400)
h.txt(470, 194, "TN-S: BORNE DE NEUTRO DESPUES DEL GENERAL,", 9.5, 400); h.txt(470, 208, "UNIDO A LA BARRA PE, DESVINCULABLE (AP-T-008).", 9.5, 400)
h.txt(470, 228, "BORNERA DE SALIDA: L + N POR CIRCUITO, PE A LA BARRA.", 9.5, 400)

# =============== D1 · BASE NH 00 + FUSIBLE ===============
DX, DY = 40, 470
h.titulo(DX, DY, "D1 - BASE NH 00 Y FUSIBLE NH 00", "ESC. 1:1,25 · VISTA DE FRENTE Y DE COSTADO (DIN 43620)")
nhD1(h, DX, DY)

# =============== DISPOSICION EN LA PLACA ===============
PX, PY = 470, 470
h.titulo(PX, PY, "DISPOSICION EN LA PLACA (*)", "ESC. 1:4 · GABINETE 800 x 600 x 300 (3057 / 3059)")
s = .4; ox, oy = PX + 20, PY + 52
Xp = lambda x: ox + (x + 300) * s; Zp = lambda z: oy + (800 - z) * s
h.rect(Xp(-300), Zp(800), 600 * s, 800 * s, "#fff", K, 1.4); h.rect(Xp(-270), Zp(770), 540 * s, 740 * s, "url(#MET)", K, .6)
for x in (-225, -180, -135): h.rect(Xp(x - 15), Zp(640 + 59.5), 30 * s, 119 * s, "#fff", K, .8)
h.rect(Xp(60), Zp(760), 180 * s, 260 * s, "#fff", K, .8); h.txt(Xp(150), Zp(640), "kWh", 9, 700, K, "middle")
for zc, items in ((420, [(-245, 72, "ID"), (-160, 45, "KM")]), (270, [(-245 + i * 38, 36, "") for i in range(4)])):
    h.rect(Xp(-262), Zp(zc + 17.5), 232 * s, 35 * s, "none", K, .5, h.OCULTA)
    for x, w, t in items: h.rect(Xp(x), Zp(zc + 45), w * s, 90 * s, "#fff", K, .8); h.txt(Xp(x + w / 2), Zp(zc) + 3, t, 7.5, 700, K, "middle")
for i in range(10): h.rect(Xp(-255 + i * 8.2), Zp(146), 8.2 * s, 53 * s, "#fff", K, .5)
h.rect(Xp(-10), Zp(130), 120 * s, 20 * s, "url(#CU)", K, .6)
h.dimH(Zp(800) - 10, Xp(-300), Xp(300), "600 (*)", ext=Zp(800) - 2, c=OR); h.dimV(Xp(300) + 14, Zp(800), Zp(0), "800 (*)", ext=Xp(300) + 2, c=OR)
for n, (x, z), (gx, gy) in [("1", (-180, 700), (Xp(-300) - 18, Zp(700))), ("2", (150, 700), (Xp(300) + 34, Zp(700))), ("3", (-210, 420), (Xp(-300) - 18, Zp(440))),
                            ("4", (-138, 420), (Xp(-300) - 18, Zp(400))), ("5", (-200, 270), (Xp(-300) - 18, Zp(270))), ("6", (-220, 120), (Xp(-300) - 18, Zp(120))), ("7", (50, 120), (Xp(300) + 34, Zp(120)))]:
    h.globo(n, Xp(x), Zp(z), gx, gy, r=9)

# =============== TABLA ===============
ex = {3058: "ARMADO S/PROYECTO", 3057: "TT · 2 SAL. 4 x 25", 3059: "TNS · 6 SAL. 1 x 16 A", 3060: "TNS · 3 SAL. 1 x 25", 3061: "3 SAL. 3 x 1 x 20 A",
      3062: "4 SAL. 3 x 1 x 16 A", 3049: "LO PROVEE EPEC", 3055: "T00 + gL 63 A", 3004: "NH 00 63 A", 3054: "160 A, T000/00", 3050: "IRAM 2071", 3071: "10 A + T"}
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO"]] + [cat(c, 60) + [ex[c]] for c in ex]
yt = h.tabla(40, 838, [(52, "c", True), (490, "l", False), (40, "c", False), (218, "l", False)], filas, rowh=13.8, titulo="CODIGOS DEL PAÑOL (TABLEROS Y APARATOS)", colores=colorOR)
notasW(h, 40, yt + 16, [
    "EL ESQUEMA ES UNA GUIA: SALIDAS, PROTECCIONES Y ESQUEMA DE TIERRA (TT / TN-S) SALEN DEL PROYECTO APROBADO.",
    "(*) DISPOSICION, CALIBRE Y POLOS DE LAS TERMOMAGNETICAS, BORNERA Y MEDIDAS DEL GABINETE 3058/3060/3061/3062: SEGUN PROYECTO.",
    "(*) BASE NH: CUCHILLAS, PINZAS Y BORNES PROPORCIONALES A DIN 43620. MEDIDOR: FORMA ESQUEMATICA (LO PROVEE EPEC)."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - TABLERO ARMADO (SIN PUERTA)", "ACOMETIDA POR ABAJO · NH · MEDIDOR · DIFERENCIAL · CONTACTOR · SALIDAS · BORNERA")
A = img3d(h, "protab_tab2", 892, 84, 420)
columna(h, A, [("nh", "1", "BASE NH + FUSIBLE"), ("medidor", "2", "MEDIDOR (EPEC)"), ("dif", "3", "DIFERENCIAL 4P 300 mA"), ("cont", "4", "CONTACTOR 25 A"),
               ("tm", "5", "TM DE SALIDA (*)"), ("bornes", "6", "BORNERA DE SALIDA"), ("pe", "7", "BARRA PE (7001)"), ("placa", "", "PLACA DE MONTAJE"),
               ("cableado", "", "CABLEADO (ESQUEMA)"), ("acometida", "", "ACOMETIDA EPEC")], 1325, 96, 540, paso=30)
h.titulo(890, 600, "LA PLACA DE CERCA", "MISMOS APARATOS QUE EN LAS HOJAS DE CADA MATERIAL")
A2 = img3d(h, "protab_tab2_det", 960, 620, 380)
columna(h, A2, [("nh", "1", "NH 00 + gL 63 A"), ("fus", "", "INDICADOR DEL FUSIBLE"), ("dif", "3", "DIFERENCIAL (MAT-DIFERENCIALES-1)"), ("cont", "4", "CONTACTOR (MAT-COMANDO-1)"),
                ("tm", "5", "TM (MAT-TERMOMAGNETICAS-1)"), ("riel", "", "RIEL NS35"), ("bornes", "6", "BPN (MAT-BORNERAS-1)")], 1330, 640, 1000, paso=30)
rayadosRef(h, 890, 900, ["CER", "CU", "MET", "PLAS2"], cols=1, dx=200) if False else None
rotuloMat(h, "MAT-TABLERO-2", "TABLERO DE ALUMBRADO", "ARMADO (TT / TN-S)", "UNIFILAR, BASE NH, DISPOSICION, CODIGOS Y 3D", "VARIAS", "D1 1:1,25 · 1:4", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_tablero_2.svg"))
