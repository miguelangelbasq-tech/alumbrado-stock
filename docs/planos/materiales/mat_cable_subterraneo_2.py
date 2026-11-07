import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *

h = HojaMat()
COD = [1017, 1018, 1022, 1023, 1024, 1025, 1019, 1020, 1026, 1021, 1005, 1029, 1030, 1031]
h.check_codigos(COD)

# ============ CORTES TIPO (B y N) + D1..D5 a color
h.titulo(40, 62, "CORTES TIPO POR FORMACION", "S/E · MISMA CONSTRUCCION: Cu + AISLACION XLPE + VAINA PVC (IRAM 2178)")
TIPOS = [("2 CONDUCTORES", ["L1", "N"], None, "1017 · 1018 · 1023 · 1024"),
         ("3 CONDUCTORES", ["L1", "L2", "N"], None, "1019 · 1020 · 1025 · 1026"),
         ("2 + TIERRA", ["L1", "N", "PE"], None, "1022"),
         ("3 + 1 NEUTRO RED.", ["L1", "L2", "L3", "N"], (3, .72, .5), "1021 (3x25/16)"),
         ("1 CONDUCTOR", ["L2"], None, "1005 · 1029 · 1030 · 1031")]
xs = [110, 270, 430, 590, 750]
for (t, cc, nr, cods), x in zip(TIPOS, xs):
    n = len(cc); r_cu, e = 9, 4.2
    rc = r_cu + e
    d = (rc / math.sin(math.pi / n) if n > 2 else (rc if n == 2 else 0)) + rc
    R = d + 9 if n > 1 else rc + 7
    for y, col in ((190, False), (380, True)):
        h.corte_cable(x, y, R, cc, r_cu, e, color=col, hilos=7, e_v=6,
                      neutro_red=(nr[0], r_cu * nr[1], e * .85) if nr else None) if n > 1 else None
        if n == 1:
            # unipolar: sin relleno; vaina sólo en 1005 (XLPE); NM 247-3 = una sola aislación PVC
            h.circ(x, y, rc, FASE["L2"] if col else "#fff", K, .9); h.cobre2d(x, y, r_cu, col, 19)
        if col: h.circ(x, y, R + 6, "none", K, .6, 'stroke-dasharray="4 3"')
    h.txt(x, 268, t, 11, 700, K, "middle"); h.parrafo(x - 70, 286, cods, 140, 10, G)
    h.txt(x - R - 6, 380 - R - 4, "D" + str(xs.index(x) + 1), 10.5, 700, K, "end")
h.dimH(130, xs[0] - 29, xs[0] + 29, "Ø EXT. (*)", ext=190, c=OR)
h.txt(40, 470, "D1 A D5: LOS MISMOS CORTES A COLOR. CADA CONDUCTOR CON SU AISLACION Y LA CUERDA DE HILOS DE COBRE.", 10.5, 400, G)
h.leyenda_fases(40, 494, ["L1", "L2", "L3", "N", "PE"], 5, 135)
h.txt(40, 520, "(*) LOS COLORES DE CADA FORMACION SON LOS HABITUALES: A CONFIRMAR CON EL FABRICANTE DE CADA ROLLO.", 10.5, 400, OR)

# ============ tabla
FORM = {1017: "2 x 10", 1018: "2 x 4", 1022: "2 x 1,5 + T", 1023: "2 x 2,5", 1024: "2 x 6", 1025: "3 x 1,5", 1019: "3 x 1,5",
        1020: "3 x 2,5", 1026: "3 x 4", 1021: "3 x 25 + 1 x 16", 1005: "1 x 4", 1029: "1 x 16", 1030: "1 x 6", 1031: "1 x 6"}
y = h.codigos(40, 560, COD, (50, 0, 40), extra_col=("FORMACION mm²", FORM, 120), wtot=800, rowh=19)
h.txt(40, y + 16, "1019 Y 1025 SON LOS DOS 3 x 1,5 PERO DE DISTINTO ORIGEN / NORMA: NO SE UNEN (ACLARACION DE ANGEL, v101).", 10, 400, G)

h.notasM(40, 900, [
    "MISMA CONSTRUCCION QUE LA FICHA MAT-CABLE_SUBTERRANEO-1 (Cu CLASE 2 + XLPE + VAINA PVC). REVISAR SIEMPRE QUE LA FORMACION SEA LA DEL PLANO.",
    "(*) Ø EXTERIOR, ESPESORES E INTENSIDADES DE ESTAS FORMACIONES: NO ESTAN EN LA FICHA. A CONFIRMAR CON EL FABRICANTE.",
    "1029 / 1030 / 1031 SON UNIPOLARES IRAM NM 247-3 (PVC, 450/750 V): NO SON PARA ENTERRAR DIRECTO. VER MAT-CABLE_ACOMETIDA-3.",
    "1005 (ACOMETIDA FLEXIBLE 1 x 4 XLPE): CUERDA FLEXIBLE, SE DIBUJA CON 19 HILOS (*) A CONFIRMAR.",
    "FUENTE: DESCRIPCIONES DEL PAÑOL Y FICHA «CABLE SUBTERRANEO» DE LA APP.",
], 790)

# ============ 3D: 3 conductores
h.titulo(890, 62, "VISTA 3D - CABLE DE 3 CONDUCTORES", "EJ. 3 x 1,5 mm² (1025 / 1019) · PUNTA PELADA EN ESCALONES")
h.iso(7.5, 1030, 230)
o = cable3d(h, 5.2, ["L1", "L2", "N"], 1.0, 1.0, L_vaina=40, L_rel=4, L_ais=(20, 7), L_cu=9, abrir=1.9, hilos=7,
            texto="Cu XLPE 3x1,5 · IRAM 2178")
h.g3b("1", o["vaina"], 1440, 150, "VAINA PVC")
h.g3b("2", o["relleno"], 1440, 200, "RELLENO")
h.g3b("3", o["ais"][-1], 1440, 250, "AISLACION XLPE")
h.g3b("4", o["cu"][-1], 1440, 300, "Cu (CUERDA)")
h.txt(890, 600, "Escala del 3D exagerada para ver las capas; colores habituales (*) a confirmar con el fabricante.", 11, 400, OR, "start", INT)

h.bloque(890, 660, "DATOS TECNICOS", [
    "NORMA: IRAM 2178 (0,6/1,1 kV) · Cu + XLPE + PVC",
    "1029-1031: IRAM NM 247-3, PVC 450/750 V",
    "UNIDAD DE COMPRA: METRO",
    "(*) Ø EXT. E INTENSIDAD: SEGUN FABRICANTE",
], 360)
h.bloque(1270, 660, "DONDE SE USA", [
    "DERIVACIONES Y TRAMOS CORTOS (GUIA «ZANJEO Y TENDIDO»)",
    "PLAZAS DE LA MUNICIPALIDAD (1019)",
    "3 x 25 / 16 (1021): ACOMETIDA SUBTERRANEA AP-T-019 REF. 13",
    "TABLEROS: UNIPOLARES 1030 / 1031 (CABLEADO INTERNO)",
], 370)
h.rotuloM("MAT-CABLE_SUBTERRANEO-2", "CABLE SUBTERRANEO Cu", "OTRAS FORMACIONES (2, 3 Y 1 COND.)", "CORTES TIPO, DETALLES A COLOR Y VISTA 3D",
          "S/E", "ESQUEMATICOS")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_cable_subterraneo_2.svg"))
print("ok")
