"""MAT-TERMOMAGNETICAS-1 · Interruptor termomagnético curva C para riel DIN.
Datos: FICHAS_TEC.termomagneticas (18 mm por polo, alto 85, prof. 78,5; Schneider iC60N; bornes 1–25 / 1–16 mm², 2 N·m;
tabla de polos/In/curva por código), FAMILIAS_MAT.termomagneticas, catálogo (3041–3045 del catálogo base L16074), AP-T-007/008."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
H, D, NECK = 85, 78.5, 45
DR = D - 20   # (*)
e = 1.9
# ================= VISTA DE FRENTE =================
h.titulo(40, 62, "VISTA DE FRENTE - 1, 2, 3 Y 4 POLOS", "ESC. 2:1 (APROX.) - COTAS EN mm - 18 mm POR POLO")
FY = 140; x = 70
for p, marca in ((1, "C10"), (2, "C20"), (3, "C16"), (4, "C25")):
    frenteModular(h, x, FY, 18 * p, H, e, marca=marca)
    h.dimH(FY + H * e + 22, x, x + 18 * p * e, str(18 * p), ext=FY + H * e + 2)
    h.txt(x + 9 * p * e, FY + H * e + 44, f"{p} POLO" + ("S" if p > 1 else ""), 10, 400, G, "middle")
    if p == 2:
        xa = x + 9 * p * e
    x += 18 * p * e + 22
h.dimV(52, FY, FY + H * e, "85", ext=68)
h.dimV(x - 6, FY + (H - NECK) / 2 * e, FY + (H + NECK) / 2 * e, "45 (*)", ext=x - 24, c=OR)
# corte A-A por el aparato de 2 polos
h.globo("1", 70 + 9 * e, FY + H / 2 * e, 64, FY - 26)
h.globo("2", 70 + 18 * e + 22 + 6 * e, FY + 8 * e, 70 + 18 * e + 22 + 6 * e, FY - 30)
h.globo("3", 70 + 18 * e + 22 + 10 * e, FY + 31 * e, 70 + 18 * e + 22 + 34 * e, FY - 30)

# ================= PERFIL (VISTA A) =================
PX, PY = 620, 140
h.titulo(PX - 30, 62, "PERFIL", "SOBRE RIEL NS35")
perfilModular(h, PX, PY, H, D, e, DR, NECK)
h.dimH(PY + H * e + 22, PX, PX + D * e, "78,5", ext=PY + H * e + 2)
h.dimH(PY - 14, PX + DR * e, PX + D * e, "", ext=PY + (H - NECK) / 2 * e - 2)
h.txt(PX + (DR + D) / 2 * e, PY - 20, "(*)", 10, 400, OR, "middle")
h.dimV(PX + D * e + 9 * e + 18, PY, PY + H * e, "85", ext=PX + DR * e + 2)
h.globo("4", PX - 4 * e, PY + (H / 2 + 20) * e, PX - 34, PY + H * e + 30)
h.txt(PX - 34 + 14, PY + H * e + 34, "TRABA DEL RIEL", 9.5, 400, G)

# ================= D1 MARCAS DEL FRENTE =================
DX, DY = 40, 385
h.titulo(DX, DY, "D1 - QUE DICE EL FRENTE", "ESC. 4:1 - EJEMPLO DE LECTURA (EL TEXTO EXACTO DEPENDE DE LA MARCA)")
bx, by = DX + 20, DY + 30; k4 = 3.2
h.rect(bx, by, 36 * k4, 45 * k4 * .6, "#fff", K, 1.2)
h.txt(bx + 18 * k4, by + 26, "C20", 18, 700, K, "middle")
h.rect(bx + 6, by + 36, 34, 18, "#fff", K, .8); h.txt(bx + 23, by + 49, "6000", 9.5, 700, K, "middle")
h.rect(bx + 46, by + 36, 34, 18, "#fff", K, .8); h.txt(bx + 63, by + 49, "3", 9.5, 700, K, "middle")

lx = bx + 36 * k4 + 18
for i, (t1, t2) in enumerate((("C20", "CURVA C · In = 20 A"), ("6000", "PODER DE CORTE 6 kA (IEC 60898)"), ("10 kA", "SI DICE kA: IEC 60947-2"), ("3", "CLASE DE LIMITACION (*)"))):
    h.txt(lx, by + 14 + i * 18, t1, 11, 700, K, "start", MONO); h.txt(lx + 48, by + 14 + i * 18, t2, 10.5, 400, OR if "(*)" in t2 else K)

# ================= TABLA DE CODIGOS =================
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "POLOS", "In", "CURVA / Icc"]]
tab = [[3045, "1", "6 A", "C · 10 kA"], [3040, "1", "6 A", "C"], [3068, "1", "6 A", "—"], [3046, "1", "6 A", "INTERRUPTOR (*)"], [3032, "1", "10 A", "C · 10 kA"], [3067, "1", "10 A", "—"],
       [3066, "1", "25 A", "—"], [3025, "1", "32 A", "C"], [3063, "1", "32 A", "4,5 kA"], [3033, "2", "10 A", "C · 6/10 kA"], [3064, "2", "16 A", "4,5 kA"],
       [3041, "2", "20 A", "C · 10 kA"], [3069, "2", "20 A", "C"], [3023, "2", "25 A", "C"], [3024, "3", "16 A", "C"], [3044, "3", "25 A", "C · 10 kA"],
       [3038, "4", "6 A", "C"], [3039, "4", "6 A", "C"], [3034, "4", "10 A", "C"], [3021, "4", "16 A", "C · 10 kA"], [3035, "4", "20 A", "C"], [3036, "4", "25 A", "C · 10 kA"],
       [3042, "4", "25 A", "C · 10 kA"], [3070, "4", "25 A", "—"], [3037, "4", "32 A", "C"], [3022, "4", "40 A", "C"], [3065, "4", "40 A", "—"], [3043, "4", "50 A", "C · 10 kA"]]
for c, p, i_, cu in tab:
    r = cat(c, 64); filas.append([r[0], r[1], p, i_, cu])
TY = 530
yt = h.tabla(40, TY, [(52, "c", True), (440, "l", False), (52, "c", True), (56, "c", True), (200, "l", False)], filas, rowh=15.5,
             titulo="CODIGOS DEL PAÑOL (28) - TODOS Un.", colores=colorOR)
ydat = bloque(h, 890, 830, "DATOS TECNICOS", [
    "CORTAN POR SOBRECARGA Y CORTOCIRCUITO. EN ALUMBRADO: CURVA C.",
    "18 mm POR POLO · ALTO 85 · PROFUNDIDAD 78,5 (SCHNEIDER iC60N, 2 POLOS 36 x 85 x 78,5).",
    "BORNES: RIGIDO 1-25 mm², FLEXIBLE 1-16 mm² · APRIETE ≈ 2 N·m (EJ. iC60N).",
    "PODER DE CORTE 6 o 10 kA SEGUN EL MODELO (SE LEE EN EL FRENTE)."], w=370)
yu = bloque(h, 1280, 830, "DONDE SE USA", [
    "TABLERO DE MEDICION Y COMANDO: UNO POR SALIDA / CIRCUITO.",
    "AP-T-007 (TT): SALIDAS CON TERMOMAGNETICOS BIPOLARES, DETRAS DEL DIFERENCIAL 4 x 40 A 300 mA.",
    "AP-T-008 (TN-S): SALIDAS 1 x 6 mm² CON TERMOMAGNETICOS UNIPOLARES."], w=360)
notasW(h, 40, yt + 26, [
    "COTAS EN mm (ANCHO POR POLO, ALTO Y PROFUNDIDAD: FICHA DE LA APP, SCHNEIDER iC60N).",
    "(*) CUELLO DEL FRENTE 45 (DIN 43880) Y SU PROFUNDIDAD: TIPICOS, A CONFIRMAR CON EL FABRICANTE DE CADA CODIGO.",
    "(*) 3046 «INTERRUPTOR UNIPOLAR 6 A»: NO DICE TERMOMAGNETICO NI CURVA. 3038 Y 3039 SON EL MISMO MATERIAL (CLAUDE.md §11.3)."], w=800)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - 1, 2 Y 4 POLOS EN EL RIEL NS35", "SOBRE LA PLACA DEL TABLERO, CON EL CABLE ENTRANDO ARRIBA")
setIso(h, 2.9, 1270, 440, True)
placaV(h, -10, 130, -15, 100)
riel3dV(h, -8, 128, H / 2)
x0 = 0
for p, m in ((1, "C10"), (2, "C20"), (4, "C25")):
    W = modular3d(h, x0, p, H, D, NECK, DR)
    txtY(h, x0 + 9 * p, D, H / 2 + 15, m, 10 if p > 1 else 8)
    x0 += W + 2
# cable entrando arriba en el bipolar
for i, col in enumerate(("#7b3f1d", "#4fa3d9")):
    xc = 20 + 9 + 18 * i
    cil3(h, (xc, DR + 1, H - 8), (xc, DR + 30, H - 8 + 0), 2.6, col, col)
h.g3("1", (9, D + 7, H / 2), 1440, 470, "PALANCA (MANIJA)")
h.g3("2", (38 + 9, DR, H - 8), 1440, 150, "BORNE CON TORNILLO")
h.g3("3", (20 + 18, D, H / 2 + 15), 1440, 200, "MARCA: CURVA, In, Icc")
h.g3("5", (125, -2, H / 2 + 17), 920, 600, "RIEL DIN NS35 (2038)")
h.g3("6", (40 + 36 + 18, D, 30), 1440, 700, "4 POLOS = 72 mm")
h.g3("7", (20 + 9, DR + 26, H - 8), 1440, 250, "CABLE CON PUNTERA")
h.txt(890, 1010, "FUENTE: FICHA TECNICA DE LA APP (SCHNEIDER iC60N A9F74210) Y CATALOGO DEL PAÑOL (POLOS E In DE CADA CODIGO).", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-TERMOMAGNETICAS-1", "INTERRUPTOR", "TERMOMAGNETICO CURVA C", "FRENTE, PERFIL, DETALLE, CODIGOS Y 3D", "2:1 · 4:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_termomagneticas_1.svg"))
