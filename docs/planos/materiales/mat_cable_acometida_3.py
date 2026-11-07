import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *

h = HojaMat()
COD = [1030, 1031, 7009, 7010, 7008, 1029]
h.check_codigos(COD)
# ficha: 6 mm² Ø ext 4,7 aislación 0,8 · 10 mm² Ø 6,0 aislación 1,0 · PVC 450/750 V · Cu flexible
D6, E6 = 4.7, 0.8
RCU6 = D6 / 2 - E6          # 1,55 (Ø ext - 2 e; el conductor real flexible es así)

# ============ VISTA LATERAL
h.titulo(40, 62, "VISTA LATERAL - PUNTA PELADA", "MODELO 1 x 6 mm² · ESC. 10:1 · LARGO DE PELADO ILUSTRATIVO")
k = 10.0; x0, yc = 70, 190
h.path(f"M{x0},{yc-D6/2*k} H{x0+30*k} V{yc+D6/2*k} H{x0}", "#fff", K, 1.4)
h.path(f"M{x0},{yc-D6/2*k} q-6,{D6/4*k} 0,{D6/2*k} t0,{D6/2*k}", "none", K, .9)
h.ln(x0 + 4, yc - RCU6 * k, x0 + 30 * k, yc - RCU6 * k, K, .5, h.OCULTA); h.ln(x0 + 4, yc + RCU6 * k, x0 + 30 * k, yc + RCU6 * k, K, .5, h.OCULTA)
h.rect(x0 + 30 * k, yc - RCU6 * k, 12 * k, 2 * RCU6 * k, "url(#cuH)", K, .9)
for q in range(1, 12): xx = x0 + 30 * k + q * k; h.ln(xx - 3, yc + RCU6 * k, xx + 3, yc - RCU6 * k, K, .35)
h.ln(x0 - 12, yc, x0 + 44 * k, yc, K, .5, h.EJE)
h.dimV(x0 - 18, yc - D6 / 2 * k, yc + D6 / 2 * k, "Ø4,7", ext=x0 - 2)
h.dimV(x0 + 42 * k + 22, yc - RCU6 * k, yc + RCU6 * k, "Ø3,1", ext=x0 + 42 * k + 2)
xs = x0 + 15 * k
h.ln(xs, yc - D6 / 2 * k - 10, xs, yc + D6 / 2 * k + 10, K, .6, h.EJE)
h.txt(xs - 6, yc - D6 / 2 * k - 16, "A", 12, 700, K, "end"); h.txt(xs - 6, yc + D6 / 2 * k + 26, "A", 12, 700, K, "end")
h.globo("1", x0 + 22 * k, yc - D6 / 2 * k, x0 + 22 * k, 120); h.globo("2", x0 + 36 * k, yc - 4, x0 + 36 * k, 120)

# ============ CORTE A-A
h.titulo(560, 62, "CORTE A-A (6 mm²)", "ESC. 20:1 · COTAS EN mm")
kc = 20.0; cx, cy = 650, 200
h.circ(cx, cy, D6 / 2 * kc, "#fff", K, 1.2); h.cobre2d(cx, cy, RCU6 * kc, False, 37)
h.dimH(cy + D6 / 2 * kc + 24, cx - D6 / 2 * kc, cx + D6 / 2 * kc, "Ø4,7", ext=cy)
h.ln(cx + RCU6 * kc, cy, cx + D6 / 2 * kc, cy, K, .6); h.tick(cx + RCU6 * kc, cy); h.tick(cx + D6 / 2 * kc, cy)
h.txt(cx + D6 / 2 * kc + 6, cy + 4, "0,8", 11)
h.globo("1", cx - 40, cy - 25, 580, 120); h.globo("2", cx - 6, cy + 10, 580, 290)

# ============ D1 colores
h.titulo(40, 352, "DETALLE D1 - LOS COLORES DEL PAÑOL", "S/E · AISLACION PVC DE UN COLOR, CUERDA FLEXIBLE (HILOS FINOS)")
CL = [("L2", "1031 · 1029 NEGRO"), ("N", "1030 CELESTE"), ("PE", "7008 · 7009 · 7010 VERDE-AMARILLO")]
for i, (c, t) in enumerate(CL):
    x = 110 + i * 250; y = 450
    h.circ(x, y, 46, FASE[c], K, 1)
    if c == "PE":
        h.path(f"M{x-44},{y-14} A46,46 0 0 1 {x-14},{y-44} L{x+14},{y-44} A46,46 0 0 1 {x+44},{y-14} Z", "#f2c200", "none", 0)
        h.circ(x, y, 46, "none", K, 1)
    h.cobre2d(x, y, 30, True, 37)
    h.txt(x, y + 66, t, 10.5, 700, K, "middle")

# ============ tabla
TD = {1030: ("4,7", "0,8"), 1031: ("4,7", "0,8"), 7009: ("4,7", "0,8"), 7010: ("6,0", "1,0"), 7008: ("—", "—"), 1029: ("—", "—")}
cols = [(52, "c", True), (420, "l", False), (90, "c", True), (90, "c", True), (60, "c", False), (88, "c", False)]
fil = [["COD.", "DESCRIPCION (CATALOGO DEL PAÑOL)", "Ø EXT.", "AISLACION", "UN.", "COLOR"]]
COL = {1030: "CELESTE", 1031: "NEGRO", 7009: "VERDE-AM.", 7010: "VERDE-AM.", 7008: "VERDE-AM.", 1029: "NEGRO"}
for c in COD: fil.append([str(c), CAT[c][0], TD[c][0], TD[c][1], CAT[c][1], COL[c]])
y = h.tablaM(40, 580, cols, fil, 20, "VARIANTES Y CODIGOS DEL PAÑOL")

h.notasM(40, 760, [
    "COTAS EN mm. Ø EXT. Y AISLACION: FICHA DE LA APP (PRYSMIAN, SUPERASTIC JET, IRAM NM 247-3).",
    "Ø DEL CONDUCTOR = Ø EXT. - 2 x AISLACION (4,7 - 1,6 = 3,1): DE LA FICHA, NO ES DATO SEPARADO DEL FABRICANTE.",
    "(*) 1029 (16 mm²) Y 7008 (2,5 mm²): MEDIDAS NO ESTAN EN LA FICHA. A CONFIRMAR CON EL FABRICANTE.",
    "(*) CANTIDAD DE HILOS DE LA CUERDA FLEXIBLE: SE DIBUJAN 37. A CONFIRMAR CON EL FABRICANTE.",
    "NO ES CABLE PARA ENTERRAR: VA DENTRO DE TABLEROS, CAJAS O CAÑOS.",
    "MISMO MATERIAL, OTRO CODIGO: 7010 = 1032 (CLAUDE.md §11.3). LA TIERRA VA VERDE-AMARILLA.",
], 790)

# ============ 3D
h.titulo(890, 62, "VISTA 3D - TRES UNIPOLARES", "NEGRO · CELESTE · VERDE-AMARILLO · PUNTAS PELADAS")
h.iso(11, 1010, 210)
for i, (c, yy) in enumerate([("L2", -9), ("N", 0), ("PE", 9)]):
    col = FASE[c]; L = 30 + i * 4
    h.cil("x", 0, L, yy, 0, D6 / 2, col, tapa=sombra(col, 1.4) if c != "L2" else "#4a4a4a", borde="#000", bw=.5)
    if c == "PE":
        for k0 in range(0, L, 4):
            h.solido("x", k0, min(L, k0 + 4), [(math.cos(t) * D6 / 2 * 1.01, math.sin(t) * D6 / 2 * 1.01) for t in [math.radians(20 + 14 * q) for q in range(6)]],
                     [(math.cos(t) * D6 / 2 * 1.01, math.sin(t) * D6 / 2 * 1.01) for t in [math.radians(20 + 14 * q) for q in range(6)]], yy, 0, "#f2c200", borde=None)
        h.circ3("x", L + .01, yy, 0, D6 / 2, "#3d9a4a", "#000", .4)
    h.cil("x", L, L + 10, yy, 0, RCU6, C_CU, metal=True, borde="#5a2c0c", bw=.4)
    h.helice("x", L, L + 10, yy, 0, RCU6, 10, RCU6 * 5, "#7a3f12", .35)
    h.cuerda_tapa("x", L + 10, yy, 0, RCU6, 37)
h.g3b("1", (20, 9, D6 / 2), 1440, 170, "AISLACION PVC")
h.g3b("2", (42, 9, RCU6), 1440, 240, "Cu FLEXIBLE")
h.txt(890, 600, "Los tres juntos para comparar colores; el 3D no está a escala de las cotas.", 11, 400, G, "start", INT)

h.bloque(890, 650, "DATOS TECNICOS", [
    "NORMA: IRAM NM 247-3 · 450/750 V",
    "CONDUCTOR: COBRE FLEXIBLE · AISLACION: PVC",
    "6 mm²: Ø 4,7 / AISLACION 0,8 · 10 mm²: Ø 6,0 / 1,0",
    "UNIDAD DE COMPRA: METRO",
], 360)
h.bloque(1270, 650, "DONDE SE USA", [
    "CABLEADO INTERNO DE TABLEROS (1030 / 1031)",
    "CONEXIONES DE TIERRA VERDE-AMARILLA: CABLE 1 x 10 DE PAT (7010) - 10 m POR TABLERO + 7 m POR CIRCUITO (PRFV) O 4 m POR COLUMNA (METALICA)",
    "LAS PUNTAS VAN CON PUNTERA (MAT-TERMINALES-2) U OJAL (MAT-TERMINALES-1)",
], 370)
h.rotuloM("MAT-CABLE_ACOMETIDA-3", "CABLE UNIPOLAR", "IRAM NM 247-3 (450/750 V)", "VISTA LATERAL, CORTE A-A, COLORES Y VISTA 3D", "10:1 / 20:1", "D1, 3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_cable_acometida_3.svg"))
print("ok")
