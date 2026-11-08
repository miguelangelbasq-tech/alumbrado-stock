"""MAT-ARIDOS_HORMIGON-2 (rev. C) · Hormigones H-13 (8013), H-21 (8014), pobre (8015), morteros (8020, 8021, 8019) y revoques (8024, 8025).
Rev. C (grupo «nfin»): + H-15 para fundación de apoyo de H°A° (8501, app): fila, código y 3D r3d/out/nfin_h15.png (r3d/escenas/nfin_h15.mjs).
Plano y 3D con las mismas medidas (perfiles_civil.json: ARIDO, H13). 3D: r3d/out/civil_hormigones.png y civil_sello.png.
Fuentes: ficha de la app (LP 21478 y ETG Córdoba: H-13 para bases; pliego Malargüe: H-21, CIRSOC 201), CRUCE_AP_TC_002,
TABLERO_NIVEL, probeta normal Ø15 × 30. Ver r3d/FUENTES_civil.md. Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

AR = PC["ARIDO"]; H = PC["H13"]
h = nuevaC()

# =============== 1. DOSAJE EN VOLUMEN ===============
h.titulo(40, 62, "DOSAJE H-13 · 1 : 2,5 : 4 EN VOLUMEN", "PARTES MEDIDAS CON EL MISMO BALDE O CAJON · AGUA 170 L POR m³")
u = 30; bx0, by0 = 70, 250
for i, (n, t, pat, cod) in enumerate([(1, "CEMENTO", "PVCr", "8008"), (2.5, "ARENA", "SAND", "8003"), (4, "PIEDRA 6-20", "CONC", "8022")]):
    x = bx0 + i * 110
    for j in range(math.ceil(n)):
        f = min(1, n - j); h.rect(x, by0 - (j + f) * u, 70, f * u, f"url(#{pat})", K, 1.0)
    h.txt(x + 35, by0 + 16, t, 10, 700, K, "middle"); h.txt(x + 35, by0 + 30, f"{str(n).replace('.', ',')} PARTE" + ("S" if n > 1 else ""), 9.5, 400, K, "middle")
    h.txt(x + 35, by0 + 44, cod, 9.5, 700, K, "middle", MONO)
h.dimV(bx0 - 14, by0 - 4 * u, by0, "4 BALDES", ext=bx0 + 220)
bloque(h, 420, 100, "POR m³ DE H-13 (FICHA DE LA APP)", [
    "CEMENTO: 5,2 BOLSAS DE 50 kg (260 kg)",
    "ARENA GRUESA: 0,55 m³ · PIEDRA 6-20: 0,80 m³",
    "AGUA: 170 LITROS (NO SE AGREGA AGUA AL PASTON HECHO)",
    "EN CAPAS, APISONADO CON VARILLA · FRAGÜE 72 h ANTES DE MONTAR"], w=420, sz=10, lh=13.5)

# =============== 2. CORTES TIPO (CUBOS DE 150) ===============
subt(h, 40, 340, "CORTES TIPO · CUBOS DE 150 Y PROBETA Ø150 × 300", "ESC. 1:2,5 · SE VE EL ARIDO DE CADA MEZCLA (DIBUJO, NO GRANULOMETRIA EXACTA)")
kc = .4; cy0 = 390; L = 150 * kc
specs = [("H-13", "8013", 70, 3, 9, 1, "CONC"), ("H-21", "8014", 90, 3, 9, 2, "CONC"), ("H° POBRE", "8015", 35, 3, 8, 3, "CONCP"),
         ("MORTERO 1:3", "8021", 160, .6, 2, 4, "MORT"), ("CALCAREO", "8019", 120, .5, 1.6, 5, "MORT")]
for i, (t, cod, n, d0, d1, sem, pat) in enumerate(specs):
    x = 300 + i * 105
    h.rect(x, cy0, L, L, "#fff", K, 1.2)
    piedras2d(h, x, cy0, L, L, n, d0 * kc * 2.5, d1 * kc * 2.5, semilla=sem, fill="url(#CONC)" if pat == "CONC" else "#fff", sw=.5)
    h.rect(x, cy0, L, L, "none", K, 1.2)
    h.txt(x + L / 2, cy0 + L + 16, t, 10, 700, K, "middle"); h.txt(x + L / 2, cy0 + L + 29, cod, 9.5, 700, K, "middle", MONO)
h.dimH(cy0 - 10, 300, 300 + L, "150", ext=cy0)
# probeta
px, py = 70, 380; kp = .5
h.rect(px, py, 150 * kp, 300 * kp, "#fff", K, 1.3); piedras2d(h, px, py, 150 * kp, 300 * kp, 120, 3.5, 9, semilla=7, fill="url(#CONC)", sw=.5); h.rect(px, py, 150 * kp, 300 * kp, "none", K, 1.3)
h.dimH(py + 300 * kp + 14, px, px + 150 * kp, "Ø150", ext=py + 300 * kp)
h.dimV(px + 150 * kp + 14, py, py + 300 * kp, "300", ext=px + 150 * kp)
h.txt(px + 75 * kp, py + 300 * kp + 40, "PROBETA (ENSAYO)", 9.5, 700, K, "middle")
# revoque sobre ladrillo
rx, ry = 300, 520
h.rect(rx + 40, ry, 400 - 40, 50 * .5, "url(#LAD)", K, 1.0); h.rect(rx + 40, ry + 25 + 7.5, 360, 25, "url(#LAD)", K, 1.0)
h.rect(rx + 40, ry + 25, 360, 7.5, "url(#MORT)", K, .6)
h.rect(rx + 26, ry, 14, 57.5, "url(#MORT)", K, .9); h.rect(rx + 22, ry, 4, 57.5, "#fff", K, .9)
h.dimH(ry - 10, rx + 26, rx + 40, "15 (*)", ext=ry, c=OR); h.dimH(ry + 70, rx + 22, rx + 26, "5 (*)", ext=ry + 57.5, c=OR)
llamada(h, rx + 33, ry + 40, rx + 0, ry + 90, "REVOQUE GRUESO 8024", sz=9, anc="start")
llamada(h, rx + 24, ry + 12, rx + 120, ry - 18, "FINO / IGNIFUGO + CALCAREO 8025 (*)", c=OR, sz=9)
llamada(h, rx + 200, ry + 12, rx + 300, ry - 18, "LADRILLO", sz=9)

# =============== 3. TABLA DE MEZCLAS ===============
cols = [(110, "l", False), (54, "c", True), (240, "l", False), (196, "l", False), (200, "l", False)]
fil = [["MEZCLA", "COD.", "DOSAJE / RESISTENCIA", "DONDE VA", "DE DONDE SALE"],
       ["H-13", "8013", "1 : 2,5 : 4 · 5,2 BOLSAS/m³ · 13 MPa", "FUNDACIONES", "APP · ETG CORDOBA"],
       ["H-21", "8014", "320 ± 15 kg CEMENTO/m³ · a/c ≤ 0,50", "CRUCE: 0,20 (ESTIMADO)", "APP · CIRSOC 201"],
       ["H° POBRE", "8015", "DOSAJE (*)", "PEGOTES · CAPA DEL CRUCE", "AP-TC-001 / 002"],
       ["MORT. TORTA", "8020", "DOSAJE (*)", "TORTA COLUMNA METALICA", "APP (Un.)"],
       ["MORT. JUNTA", "8021", "1 : 3 (CEMENTO : ARENA)", "BASE DE TABLERO", "TABLERO_NIVEL"],
       ["CALCAREO", "8019", "DOSAJE (*)", "RELLENO", "APP"],
       ["REV. GRUESO", "8024", "DOSAJE (*) · 1 cm (NOTA 3)", "BASE DE TABLERO", "AP-TC-007"],
       ["IGNIF.+CALC.", "8025", "DOSAJE (*) · USO (*)", "(*)", "APP (m²)"],
       ["H-15", "8501", "15 MPa · DOSAJE (*)", "HOYO DEL APOYO H°A°", "APP · EPEC ET 4"]]
yt = tablaG(h, 40, 680, cols, fil, rowh=15, titulo="MEZCLAS")
yt = tablaCod(h, 40, yt + 16, [8013, 8014, 8015, 8020, 8021, 8019, 8024, 8025, 8501], None, w=800, rowh=14.5)
notasW(h, 40, yt + 14, [
    "DATOS: FICHA DE LA APP (PLIEGO LP 21478 Y ETG CORDOBA: H-13 PARA BASES; PLIEGO MALARGÜE: H-21, CIRSOC 201), CRUCE_AP_TC_002 Y TABLERO_NIVEL.",
    "(*) DOSAJE DEL POBRE, DEL MORTERO DE TORTA Y DEL CALCAREO; USO DEL REVOQUE IGNIFUGO; ESPESORES DEL REVOQUE: A CONFIRMAR.",
    "(*) H-21 «0,20 m (ESTIMADO)» SEGUN LA APP. LA METALICA LLEVA TORTA; EL PRFV NO (SOLO SELLADO DE BASE). FUENTES: r3d/FUENTES_civil.md.",
    "(*) REV. C · 8501 H-15 (APP): HOYO Ø0,60 × 1,45 DE EMPOTRAMIENTO ≈ 0,31 m³ + DESPERDICIO (EPEC ET 4). DOSAJE Y POSTE DEL 3D A CONFIRMAR (r3d/FUENTES_nfin.md)."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - PROBETAS Y CUBOS CORTADOS", "EL ARIDO SE VE EN LA CARA CORTADA DE CADA MEZCLA")
A = img3d(h, "civil_hormigones", 884, 92, 620)
columna(h, A, [("h13", "1", "H-13 (PROBETA Ø150)"), ("h21", "2", "H-21"), ("pobre", "3", "H° POBRE"), ("m13", "4", "MORTERO 1:3"), ("cal", "5", "MORTERO CALCAREO"),
               ("revoque", "6", "REVOQUE GRUESO"), ("fino", "7", "REVOQUE FINO (*)"), ("ladrillo", "", "LADRILLO")], 1515, 110, 400, paso=26)
h.txt(890, 430, "H-13 EN LA FUNDACION DEL POSTE PRFV (AP-TC-003-A)", 11, 700, NV, "start", INT)
A2 = img3d(h, "civil_sello", 884, 440, 400)
globo3d(h, A2("horm"), "", 1300, 600, "H-13"); globo3d(h, A2("arena"), "", 1300, 520, "ARENA FINA SECA"); globo3d(h, A2("sello"), "", 1300, 480, "SELLO 50 (*)")
globo3d(h, A2("molde"), "", 1300, 640, "MOLDE PVC Ø247"); globo3d(h, A2("poste"), "", 1300, 450, "POSTE PRFV")
h.txt(1432, 452, "H-15 (8501) EN EL HOYO", 10.5, 700, NV, "start", INT); h.txt(1432, 466, "DEL APOYO H°A° (*)", 10.5, 700, NV, "start", INT)
A3 = img3d(h, "nfin_h15", 1432, 472, 196)
globo3d(h, A3("tierra"), "", 1440, 684, "TERRENO"); globo3d(h, A3("h15"), "8", 1446, 708, "H-15 · Ø600 × 1450"); globo3d(h, A3("poste"), "", 1440, 732, "APOYO H°A° (*)")
bloque(h, 890, 790, "DATOS TECNICOS", [
    "H-13: 13 MPa · 1 : 2,5 : 4 · 5,2 BOLSAS/m³",
    "H-21: 21 MPa · 320 ± 15 kg DE CEMENTO/m³ · a/c ≤ 0,50",
    "H° POBRE: PEGOTES Y CAPA SOBRE LOS CAÑOS DEL CRUCE",
    "JUNTA 1:3 (CEMENTO : ARENA) EN LA BASE DE TABLERO",
    "H-15: 15 MPa · ≈ 0,31 m³ POR APOYO DE 8,5 m (APP) · DOSAJE (*)"], w=360, sz=10, lh=13.5)
bloque(h, 1270, 790, "DONDE SE USA", [
    "AP-TC-003 / 005-006: FUNDACIONES (H-13)",
    "AP-TC-002: CRUCE (H-21 + POBRE)",
    "AP-TC-001: PEGOTES DE LA ZANJA",
    "AP-TC-007: BASE DE TABLERO (JUNTA Y REVOQUE)",
    "APOYOS H°A° DE BARRIO: HOYO DEL APOYO (H-15, 8501)"], w=360, sz=10, lh=13.5)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_hormigones.mjs, civil_sello.mjs, nfin_h15.mjs): EL ARIDO ES UN VORONOI 3D. FUENTES: r3d/FUENTES_civil.md, FUENTES_nfin.md")
rotuloMat(h, "MAT-ARIDOS_HORMIGON-2", "HORMIGONES, MORTEROS", "Y REVOQUES", "DOSAJE, CORTES TIPO, MEZCLAS Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="C", fecha=FECHA)
guardarC(h, "mat_aridos_hormigon_2")
