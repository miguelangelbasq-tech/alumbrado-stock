"""MAT-CABLE_SUBTERRANEO-2 (rev. B) · Cable subterráneo Cu: otras formaciones (2, 3 y 1 conductor) del pañol.
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (CAB.c2x4, c3x2_5, c2x1_5T, c3x25_16, c1x4f); 3D: r3d/out/cab_sub2.png.
Ninguna de estas formaciones tiene ficha con medidas: Ø, espesores e intensidades (*) a confirmar. Fuentes: r3d/FUENTES_cables.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

CB = PC["CAB"]
h = hoja()
TIPOS = [("c2x4", "2 CONDUCTORES", "1017 · 1018 · 1023 · 1024", 7.5), ("c3x2_5", "3 CONDUCTORES", "1019 · 1020 · 1025 · 1026", 7.5),
         ("c2x1_5T", "2 + TIERRA", "1022", 8.0), ("c3x25_16", "3 + 1 NEUTRO MENOR", "1021 (3 x 25/16)", 4.0), ("c1x4f", "1 CONDUCTOR FLEXIBLE", "1005 (1 x 4 XLPE)", 10)]
xs = [100, 255, 405, 570, 745]

# =============== CORTES TIPO (B y N) ===============
h.titulo(40, 62, "CORTES TIPO POR FORMACION", "MISMA CONSTRUCCION: Cu CLASE 2 + XLPE + RELLENO + VAINA PVC (IRAM 2178) · CADA UNO A SU ESCALA")
for (k, t, cods, e), x in zip(TIPOS, xs):
    C = CB[k]; y = 190
    corte(h, x, y, e, C)
    R0 = C["Ro"] * e
    h.dimH(y + R0 + 20, x - R0, x + R0, ("Ø" + f"{C['D']:.1f}".replace(".", ",") + " (*)"), ext=y, c=OR)
    h.txt(x, 112, "ESC. " + f"{e:g}".replace(".", ",") + ":1", 9.5, 400, G, "middle")
    h.txt(x, 286, t, 10.5, 700, K, "middle"); h.txt(x, 301, cods, 9.5, 400, G, "middle")
    h.txt(x, 316, CB[k]["txt"] + " mm² (DIBUJADO)", 9, 400, G, "middle")

# =============== D1..D5 A COLOR ===============
h.titulo(40, 352, "DETALLES D1 A D5 - LOS MISMOS CORTES A COLOR", "AISLACION CON EL COLOR DE CADA CONDUCTOR (AEA 90364) Y LA CUERDA DE ALAMBRES")
for i, ((k, t, cods, e), x) in enumerate(zip(TIPOS, xs)):
    C = CB[k]; y = 460; R0 = C["Ro"] * e
    h.circ(x, y, R0 + 7, "none", K, .6, 'stroke-dasharray="4 3"')
    corte(h, x, y, e, C, color=True)
    h.txt(x - R0 - 4, y - R0 - 4, f"D{i+1}", 11, 700, K, "end")
leyendaF(h, 40, 556, ["L1", "L2", "L3", "N", "PE"], 5, 150)
h.txt(40, 578, "(*) COLORES HABITUALES DE CADA FORMACION: A CONFIRMAR CON EL ROLLO. D5: CUERDA FLEXIBLE CLASE 5 (ALAMBRES FINOS, Ø ≤ 0,31 (*)).", 9.5, 400, OR)
h.txt(40, 592, "3 x 25 + 1 x 16: CONDUCTORES REDONDOS EN EL DIBUJO; MUCHOS FABRICANTES LOS HACEN SECTORIALES (*). EL NEUTRO ES EL DE MENOR SECCION.", 9.5, 400, OR)

# =============== TABLA ===============
FORM = {1017: "2 x 10", 1018: "2 x 4", 1022: "2 x 1,5 + T", 1023: "2 x 2,5", 1024: "2 x 6", 1025: "3 x 1,5", 1019: "3 x 1,5",
        1020: "3 x 2,5", 1026: "3 x 4", 1021: "3 x 25 + 1 x 16", 1005: "1 x 4", 1029: "1 x 16", 1030: "1 x 6", 1031: "1 x 6"}
TIPO = {1017: "D1", 1018: "D1", 1023: "D1", 1024: "D1", 1025: "D2", 1019: "D2", 1020: "D2", 1026: "D2", 1022: "D3", 1021: "D4", 1005: "D5",
        1029: "MAT-CABLE_ACOMETIDA-3", 1030: "MAT-CABLE_ACOMETIDA-3", 1031: "MAT-CABLE_ACOMETIDA-3"}
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "FORMACION", "CORTE"]]
for c in [1017, 1018, 1023, 1024, 1025, 1019, 1020, 1026, 1022, 1021, 1005, 1029, 1030, 1031]:
    r = cat(c, 54); fil.append([r[0], r[1], r[2], FORM[c], TIPO[c]])
yt = tablaC(h, 40, 624, [(52, "c", True), (380, "l", False), (32, "c", False), (120, "c", False), (190, "c", False)], fil, "CODIGOS DEL PAÑOL (14)", rowh=15)
h.txt(40, yt + 13, "1019 Y 1025 SON LOS DOS 3 x 1,5 PERO DE DISTINTO ORIGEN / NORMA: NO SE UNEN (ACLARACION DE ANGEL, v101).", 9.5, 400, G)
rayadosC(h, 640, 900 - 0, ["PVCV", "REL", "XLP", "CU"])
ydat = bloque(h, 40, yt + 32, "DATOS TECNICOS", [
    "NORMA IRAM 2178 (0,6/1,1 kV) · Cu + XLPE + RELLENO + VAINA PVC. UNIDAD DE COMPRA: METRO.",
    "1029 / 1030 / 1031: UNIPOLARES IRAM NM 247-3 (PVC 450/750 V), NO SON PARA ENTERRAR: VER MAT-CABLE_ACOMETIDA-3.",
    "(*) Ø EXTERIOR, ESPESORES E INTENSIDADES DE ESTAS FORMACIONES: SEGUN FABRICANTE."], w=580, sz=10, lh=13.5)
notasW(h, 40, ydat + 4, [
    "COTAS EN mm. GEOMETRIA DIBUJADA CON AISLACION 0,7 Y VAINA 1,8 COMO LA 2178-1 DE LA FICHA (MAT-CABLE_SUBTERRANEO-1) (*).",
    "(*) 3 x 25 + 1 x 16: Ø 25,5 DE LA FICHA (1006); AISLACION 0,9 / 0,7 SEGUN IEC 60502-1, A CONFIRMAR. CUERDA DE 7 ALAMBRES: MINIMO IEC 60228.",
    "(*) 1005 «ACOMETIDA FLEXIBLE 1 x 4 XLPE»: CUERDA CLASE 5, VAINA 1,4: A CONFIRMAR CON EL ROLLO.",
    "FUENTES: DESCRIPCIONES DEL PAÑOL, FICHA «CABLE SUBTERRANEO» DE LA APP, r3d/FUENTES_cables.md."], w=580, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - LAS FORMACIONES DEL PAÑOL EN FILA", "PUNTAS PELADAS EN ESCALONES · MISMA GEOMETRIA DEL PLANO")
A = img3d(h, "cab_sub2", 890, 92, 700)
columna(h, A, [("c3x25_16_v", "", "3 x 25 + 1 x 16 (D4)"), ("c3x25_16_r", "2", "RELLENO"), ("c3x25_16_a", "3", "XLPE"), ("c3x25_16_c", "4", "CUERDA Cu")], 1540, 120, 330, paso=30)
columna(h, A, [("c1x4f_v", "", "1 x 4 FLEXIBLE (D5)"), ("c2x1_5T_v", "", "2 x 1,5 + T (D3)"), ("c2x4_v", "", "2 x 4 (D1)"), ("c3x2_5_v", "1", "3 x 2,5 (D2) · VAINA PVC")], 905, 120, 300, paso=30)
yb = bloque(h, 890, 640, "DONDE SE USA", [
    "DERIVACIONES Y TRAMOS CORTOS · GUIA «ZANJEO Y TENDIDO».",
    "PLAZAS DE LA MUNICIPALIDAD: 3 x 1,5 (1019).",
    "3 x 25 / 16 (1021): ACOMETIDA SUBTERRANEA AP-T-019 REF. 13.",
    "2 x 1,5 + T (1022): ALIMENTACION CON TIERRA (VERDE-AMARILLA).",
    "1005: ACOMETIDA FLEXIBLE CORTA."], w=740, sz=10, lh=14)
h.txt(890, 1010, "RENDER: three.js (r3d/escenas/cab_sub2.mjs) CON LA MISMA GEOMETRIA DEL PLANO. FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-CABLE_SUBTERRANEO-2", "CABLE SUBTERRANEO Cu", "OTRAS FORMACIONES", "CORTES TIPO, D1 A D5 A COLOR Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_cable_subterraneo_2.svg"))
