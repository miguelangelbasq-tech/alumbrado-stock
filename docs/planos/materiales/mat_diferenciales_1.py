"""MAT-DIFERENCIALES-1 · Interruptor diferencial (IEC 61008).
Datos: FICHAS_TEC.diferenciales (36 mm 2P / 72 mm 4P, alto 91, prof. 73,5; Schneider iID; bornes 1–35 mm², 3,5 N·m;
tabla de polos/In/sensibilidad por código), FAMILIAS_MAT.diferenciales (30 mA / 300 mA, TT, clase A, botón T), AP-T-007/008, catálogo."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matbfc import *

h = nueva()
H, D, NECK = 91, 73.5, 45
DR = D - 20   # (*)
e = 1.9
# ================= VISTA DE FRENTE =================
h.titulo(40, 62, "VISTA DE FRENTE - 2 Y 4 POLOS", "ESC. 2:1 (APROX.) - COTAS EN mm - CON BOTON «T» DE PRUEBA")
FY = 140; x = 80
for p, w, marca in ((2, 36, "30 mA"), (4, 72, "300 mA")):
    frenteModular(h, x, FY, w, H, e, marca=marca, test=True)
    h.dimH(FY + H * e + 22, x, x + w * e, str(w), ext=FY + H * e + 2)
    h.txt(x + w / 2 * e, FY + H * e + 44, f"{p} POLOS", 10, 400, G, "middle")
    x += w * e + 40
h.dimV(62, FY, FY + H * e, "91", ext=78)
h.dimV(x - 22, FY + (H - NECK) / 2 * e, FY + (H + NECK) / 2 * e, "45 (*)", ext=x - 38, c=OR)
xt = 80 + 36 * e + 40 + 72 * e - 7 * e; yt_ = FY + ((H - NECK) / 2 + NECK - 8) * e
h.globo("1", 80 + 36 * e + 40 + 20 * e, FY + H / 2 * e, 80 + 36 * e + 40 + 20 * e, FY - 30)
h.globo("2", xt, yt_, xt + 10, FY - 30)
h.globo("3", 80 + 9 * e, FY + 8 * e, 80 + 9 * e, FY - 30)
# ================= PERFIL =================
PX, PY = 620, 140
h.titulo(PX - 30, 62, "PERFIL", "SOBRE RIEL NS35")
perfilModular(h, PX, PY, H, D, e, DR, NECK)
h.dimH(PY + H * e + 22, PX, PX + D * e, "73,5", ext=PY + H * e + 2)
h.dimV(PX + D * e + 9 * e + 18, PY, PY + H * e, "91", ext=PX + DR * e + 2)
h.dimH(PY - 14, PX + DR * e, PX + D * e, "", ext=PY + (H - NECK) / 2 * e - 2)
h.txt(PX + (DR + D) / 2 * e, PY - 20, "(*)", 10, 400, OR, "middle")

# ================= D1 COMO FUNCIONA (esquema) =================
DX, DY = 40, 400
h.titulo(DX, DY, "D1 - COMO CORTA (ESQUEMA)", "S/E - TRANSFORMADOR TOROIDAL: COMPARA LO QUE ENTRA Y LO QUE VUELVE")
cx, cy = DX + 120, DY + 95
h.a(f'<ellipse cx="{cx}" cy="{cy}" rx="34" ry="34" fill="none" stroke="{K}" stroke-width="7"/>')
h.a(f'<ellipse cx="{cx}" cy="{cy}" rx="34" ry="34" fill="none" stroke="#fff" stroke-width="5"/>')
for dx, t in ((-12, "L"), (12, "N")):
    h.ln(cx + dx, cy - 52, cx + dx, cy + 60, K, 1.6); h.txt(cx + dx, cy + 74, t, 11, 700, K, "middle")
h.path(f"M{cx + 34},{cy} h40 v-24 h30", "none", K, 1)
h.rect(cx + 104, cy - 36, 40, 24, "#fff", K, 1); h.txt(cx + 124, cy - 20, "RELE", 9, 700, K, "middle")
h.path(f"M{cx + 144},{cy - 24} h30 l12,-14", "none", K, 1.2)
h.txt(cx + 160, cy + 8, "SI LA DIFERENCIA (FUGA) PASA LA", 10, 400); h.txt(cx + 160, cy + 22, "SENSIBILIDAD (30 / 300 mA), ABRE.", 10, 400)
h.txt(cx + 160, cy + 40, "«T» SIMULA UNA FUGA: TIENE QUE SALTAR.", 10, 700)
# ================= ESQUEMA TT (AP-T-007) =================
UX, UY = 560, 400
h.titulo(UX, UY, "UNIFILAR TT (AP-T-007)", "S/E - TABLERO AEREO EN POSTE PRFV")
yy = UY + 40; xm = UX + 80
h.ln(xm, yy, xm, yy + 30, K, 1.4); h.txt(xm + 10, yy + 14, "ACOMETIDA (NH T00)", 9.5, 400)
h.rect(xm - 18, yy + 30, 36, 30, "#fff", K, 1.4); h.txt(xm, yy + 49, "ID", 10, 700, K, "middle"); h.txt(xm + 26, yy + 44, "4 x 40 A · 300 mA", 9.5, 700)
h.txt(xm + 26, yy + 58, "CLASE A (3007)", 9.5, 400)
h.ln(xm, yy + 60, xm, yy + 80, K, 1.4); h.ln(xm - 60, yy + 80, xm + 120, yy + 80, K, 1.4)
for i in range(4):
    xx = xm - 60 + i * 60
    h.ln(xx, yy + 80, xx, yy + 96, K, 1); h.rect(xx - 10, yy + 96, 20, 22, "#fff", K, 1); h.ln(xx, yy + 118, xx, yy + 134, K, 1)
    h.txt(xx, yy + 148, f"S{i+1}", 9.5, 400, K, "middle")
h.txt(xm - 70, yy + 166, "SALIDAS CON TERMOMAGNETICOS BIPOLARES", 9.5, 400)
h.txt(xm - 70, yy + 180, "PAT LOCAL: SIN UNION NEUTRO-PAT", 9.5, 400)

# ================= TABLA DE CODIGOS =================
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "POLOS", "In", "SENSIBILIDAD"]]
for c, p, i_, s_ in [(3008, "2", "25 A", "30 mA"), (3030, "2", "25 A", "30 mA"), (3028, "2", "25 A", "300 mA"), (3007, "4", "40 A", "300 mA SUPERINM."),
                     (3029, "4", "63 A", "300 mA (S)"), (3026, "1 (+N)", "16 A", "— (*)"), (3027, "1 (+N)", "32 A", "— (*)")]:
    r = cat(c, 58); filas.append([r[0], r[1], r[2], p, i_, s_])
TY = 640
yt = h.tabla(40, TY, [(52, "c", True), (410, "l", False), (36, "c", False), (60, "c", True), (56, "c", True), (186, "l", False)], filas, rowh=17,
             titulo="CODIGOS DEL PAÑOL (7)", colores=colorOR)
ydat = bloque(h, 40, yt + 28, "DATOS TECNICOS", [
    "CORTAN CUANDO HAY FUGA A TIERRA: PROTEGEN A LAS PERSONAS.",
    "ANCHO 36 mm (2 POLOS) o 72 mm (4 POLOS) · ALTO 91 · PROF. 73,5 (SCHNEIDER iID).",
    "BORNES 1-35 mm² · APRIETE ≈ 3,5 N·m (EJ. iID 4P).",
    "ESQUEMA TT: DIFERENCIAL ≤ 300 mA, CLASE A, INMUNIDAD REFORZADA (ETG)."], w=390)
yu = bloque(h, 450, yt + 28, "DONDE SE USA", [
    "300 mA SUPERINMUNIZADO: ALUMBRADO (GENERAL DEL TABLERO EN TT, AP-T-007).",
    "30 mA: TOMACORRIENTES Y CIRCUITOS DE SERVICIO DEL TABLERO.",
    "AP-T-008 (TN-S): SIN DIFERENCIAL GENERAL EN LOS CIRCUITOS DE AP.",
    "PROBAR CON «T» AL PONER EN MARCHA Y EN CADA MANTENIMIENTO."], w=390)
notasW(h, 40, max(ydat, yu) + 10, [
    "COTAS EN mm (FICHA DE LA APP, SCHNEIDER iID). LOS DATOS DE CADA CODIGO SALEN DEL PAÑOL.",
    "(*) CUELLO 45 (DIN 43880) Y SU PROFUNDIDAD, POSICION DEL BOTON «T»: A CONFIRMAR CON EL FABRICANTE.",
    "(*) 3026 Y 3027 DICEN «DIFERENCIAL ... CURVA C» (3027 «IK60N»): PUEDEN SER TERMOMAGNETICOS MAL NOMBRADOS. REVISAR EN EL PAÑOL."], w=800)

# ================= 3D =================
h.titulo(890, 62, "VISTA 3D - DIFERENCIAL 4 POLOS Y 2 POLOS EN EL RIEL", "SOBRE LA PLACA DEL TABLERO, CON EL BOTON «T» DE PRUEBA")
setIso(h, 3.0, 1260, 500, True)
placaV(h, -10, 125, -15, 105)
riel3dV(h, -8, 123, H / 2)
x0 = 0
for p, w, m in ((2, 36, "30 mA"), (4, 72, "300 mA")):
    W = modular3d(h, x0, p, H, D, NECK, DR, test=True, ancho=w, color_frente="#dfeaf8")
    txtY(h, x0 + w / 2, D, H / 2 + 14, m, 10)
    x0 += W + 2
# cables entrando arriba en el 4 polos (L1 L2 L3 N)
for i, col in enumerate(("#7b3f1d", "#1a1a1a", "#c62828", "#4fa3d9")):
    xc = 38 + 9 + 18 * i
    cil3(h, (xc, DR + 1, H - 8), (xc, DR + 26, H - 8), 2.6, col, col)
h.g3("1", (38 + 36, D + 7, H / 2), 1440, 470, "PALANCA (MANIJA)")
h.g3("2", (38 + 72 - 6, D, (H - NECK) / 2 + 8), 1440, 560, "BOTON «T» DE PRUEBA")
h.g3("3", (9, DR, H - 8), 1440, 150, "BORNE CON TORNILLO")
h.g3("4", (38 + 36, D, H / 2 + 14), 1440, 200, "SENSIBILIDAD: 300 mA")
h.g3("5", (120, -2, H / 2 + 17), 920, 680, "RIEL DIN NS35 (2038)")
h.g3("6", (38 + 9, DR + 22, H - 8), 1440, 250, "L1 · L2 · L3 · N CON PUNTERA")
h.txt(890, 1010, "FUENTE: FICHA TECNICA DE LA APP (SCHNEIDER iID), FAMILIA «DIFERENCIALES», AP-T-007 / AP-T-008 Y CATALOGO DEL PAÑOL.", 10.5, 400, G, "start", INT)
rotuloMat(h, "MAT-DIFERENCIALES-1", "INTERRUPTOR", "DIFERENCIAL", "FRENTE, PERFIL, ESQUEMAS, CODIGOS Y 3D", "2:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_diferenciales_1.svg"))
