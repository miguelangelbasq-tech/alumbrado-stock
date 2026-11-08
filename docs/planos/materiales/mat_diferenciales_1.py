"""MAT-DIFERENCIALES-1 (rev. B) · Interruptor diferencial (IEC 61008) por dentro: transformador toroidal, relé de disparo, botón T.
Plano con los perfiles de r3d/piezas/perfiles_protab.mjs (DI); 3D: r3d/out/protab_di_fila.png.
Datos: FICHAS_TEC.diferenciales (2P 36 / 4P 72 × 91 × 73,5; Schneider iID; bornes 1–35 mm², 3,5 N·m; tabla de códigos), FAMILIAS_MAT,
AP-T-007 / AP-T-008, catálogo del pañol. Fuentes: r3d/FUENTES_protab.md. Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from protabkit import *

S = DI; H_, D_, Dr, Dn = S["H"], S["D"], S["Dr"], S["Dn"]; c0, c1 = S["cuello"]
h = nueva3()

# =============== FRENTE 2 Y 4 POLOS ===============
e = 1.9; FY = 112
h.titulo(40, 62, "FRENTE - 2 Y 4 POLOS", "ESC. 1,9:1 · CON BOTON «T» DE PRUEBA")
x = 62
for n, sens in ((2, "30 mA"), (4, "300 mA")):
    X, Z = frenteMod(h, x, FY, e, S, n, sens=sens)
    h.dimH(FY + H_ * e + 20, X(0), X(18 * n), str(18 * n), ext=FY + H_ * e + 4)
    h.txt(X(9 * n), FY + H_ * e + 40, f"{n} POLOS", 9.5, 400, G, "middle")
    if n == 4: X4, Z4 = X, Z
    x += 18 * n * e + 26
h.dimV(48, FY, FY + H_ * e, "91", ext=60)
h.dimV(X4(72) + 16, Z4(c1), Z4(c0), "45 (DIN 43880)", ext=X4(72) + 2)
lineaCorte(h, X4(36), Z4(H_) - 16, X4(36), Z4(0) + 16, "A")

# =============== CORTE A-A ===============
ec = 3.7; vc = Vista(h, 506, 488, ec)
h.titulo(450, 62, "CORTE A-A", "ESC. 3,7:1 · ENTRE LOS POLOS 2 Y 3 · ESQUEMATICO (*)")
diCorte(vc)
vc.cotaV(D_ + 12, 0, H_, "91", yext=Dr + 1)
vc.cotaH(0, D_, -22, "73,5", zext=-1)
t = S["toroide"]
for n, (y, z), (gx, gy) in [("1", (t["y"] - t["R"], t["z"] + 3), (446, 230)), ("2", (t["y"] + t["R"] + 4.3, t["z"]), (446, 270)), ("3", (t["y"] + 1.2, t["z"] + 8), (446, 190)),
                            ("4", (47, 58), (836, 170)), ("5", (Dn + 1.5, S["boton"]["z"]), (836, 380)), ("6", (48, 31), (836, 340)), ("7", (68, 50.5), (836, 250)),
                            ("8", (23, 86), (446, 120)), ("9", (40.5, 81), (836, 120)), ("10", (-4, 55), (446, 330)), ("11", (S["cable"]["y"], -12), (446, 470)), ("12", (2, -1.8), (446, 420))]:
    h.globo(n, *vc.p(y, z), gx, gy, r=9)

# =============== PERFIL ===============
vp = Vista(h, 80, 606, 1.9)
h.titulo(40, 360, "PERFIL", "SOBRE RIEL NS35")
modPerfil(vp, S)
vp.cotaH(0, D_, -22, "73,5", zext=-1)
vp.cotaH(0, Dr, -32, "44 (*)", zext=-1, c=OR)
vp.cotaV(D_ + 7, c0, c1, "45", yext=Dn + .5)
vp.cotaV(-12, S["zM"] - 17.5, S["zM"] + 17.5, "35", yext=-8)

# =============== D1 COMO CORTA ===============
DX, DY = 262, 360
h.titulo(DX, DY, "D1 - COMO CORTA", "S/E · COMPARA LO QUE ENTRA Y VUELVE")
cx, cy = DX + 46, DY + 112
h.a(f'<ellipse cx="{cx}" cy="{cy}" rx="30" ry="30" fill="none" stroke="{K}" stroke-width="7"/>'); h.a(f'<ellipse cx="{cx}" cy="{cy}" rx="30" ry="30" fill="none" stroke="#fff" stroke-width="5"/>')
for dx, tt in ((-10, "L"), (10, "N")):
    h.ln(cx + dx, cy - 50, cx + dx, cy + 54, K, 1.6); h.txt(cx + dx, cy + 68, tt, 11, 700, K, "middle")
h.path(f"M{cx + 30},{cy} h22 v-24 h12", "none", K, 1)
h.rect(cx + 64, cy - 36, 40, 24, "#fff", K, 1); h.txt(cx + 84, cy - 20, "RELE", 9, 700, K, "middle")
h.path(f"M{cx + 104},{cy - 24} h14 l10,-12", "none", K, 1.2)
for i, l in enumerate(["SI LA FUGA PASA LA", "SENSIBILIDAD, EL RELE ABRE.", "«T» SIMULA UNA FUGA:", "TIENE QUE SALTAR."]):
    h.txt(cx + 36, cy + 18 + i * 12, l, 8.5, 700 if i > 1 else 400)

# =============== UNIFILAR TT ===============
UX, UY = 40, 702
h.titulo(UX, UY, "UNIFILAR TT (AP-T-007)", "S/E · TABLERO AEREO EN POSTE PRFV")
yy = UY + 36; xm = UX + 70
h.ln(xm, yy, xm, yy + 24, K, 1.4); h.txt(xm + 10, yy + 12, "ACOMETIDA (NH T00)", 9.5, 400)
h.rect(xm - 18, yy + 24, 36, 28, "#fff", K, 1.4); h.txt(xm, yy + 42, "ID", 10, 700, K, "middle"); h.txt(xm + 26, yy + 36, "4 x 40 A · 300 mA (3007)", 9.5, 700)
h.txt(xm + 26, yy + 49, "SUPERINMUNIZADO · CLASE A", 9.5, 400)
h.ln(xm, yy + 52, xm, yy + 66, K, 1.4); h.ln(xm - 50, yy + 66, xm + 140, yy + 66, K, 1.4)
for i in range(4):
    xx = xm - 50 + i * 60
    h.ln(xx, yy + 66, xx, yy + 78, K, 1); h.rect(xx - 9, yy + 78, 18, 20, "#fff", K, 1); h.ln(xx, yy + 98, xx, yy + 110, K, 1); h.txt(xx, yy + 122, f"S{i+1}", 9, 400, K, "middle")
h.txt(UX + 220, yy + 84, "SALIDAS CON TERMOMAGNETICAS", 9, 400); h.txt(UX + 220, yy + 97, "PAT LOCAL: SIN UNION N-PE", 9, 400)

# =============== RAYADOS ===============
rayadosRef(h, 470, 702, ["PLAS", "PLAS2", "MET", "CU", "BOB", "FER", "CER"], cols=2, dx=190)

# =============== TABLA DE CODIGOS ===============
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "POLOS", "In", "SENSIBILIDAD"]]
for c, p, i_, s_ in [(3008, "2", "25 A", "30 mA"), (3030, "2", "25 A", "30 mA"), (3028, "2", "25 A", "300 mA"), (3007, "4", "40 A", "300 mA SUPERINM."),
                     (3029, "4", "63 A", "300 mA (S)"), (3026, "1 (+N)", "16 A", "— (*)"), (3027, "1 (+N)", "32 A", "— (*)")]:
    r = cat(c, 56); filas.append([r[0], r[1], r[2], p, i_, s_])
yt = h.tabla(40, 878, [(52, "c", True), (400, "l", False), (36, "c", False), (60, "c", True), (56, "c", True), (196, "l", False)], filas, rowh=15,
             titulo="CODIGOS DEL PAÑOL (7)", colores=colorOR)
notasW(h, 40, yt + 20, [
    "COTAS EN mm: 36 / 72 x 91 x 73,5 = SCHNEIDER iID (FICHA DE LA APP). CUELLO 45: DIN 43880.",
    "(*) HOMBRO 44, FRENTE 64, TOROIDE, RELE, BOTON «T» Y MANIJA: ESQUEMATICOS, PROPORCIONALES. CADA MARCA LOS UBICA DISTINTO.",
    "(*) 3026 Y 3027 DICEN «DIFERENCIAL ... CURVA C» (3027 «IK60N»): PUEDEN SER TERMOMAGNETICAS MAL NOMBRADAS. REVISAR EN EL PAÑOL.",
    "PROBAR CON «T» AL PONER EN MARCHA Y EN CADA MANTENIMIENTO."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - DIFERENCIAL 4 POLOS CORTADO Y 2 POLOS", "EL DE 4 POLOS SIN EL CUARTO DE ARRIBA: TOROIDE, CONDUCTORES QUE LO ATRAVIESAN Y RELE")
A = img3d(h, "protab_di_fila", 900, 84, 600)
columna(h, A, [("toroide", "1", "TOROIDE (FERRITA)"), ("bobinado", "2", "BOBINADO SECUND."), ("conductor", "3", "L1 L2 L3 N"),
               ("rele", "4", "RELE DE DISPARO"), ("boton", "5", "BOTON «T» DE PRUEBA"), ("manija", "7", "MANIJA"), ("jaula", "8", "JAULA"),
               ("tornillo", "9", "TORNILLO"), ("riel", "10", "RIEL NS35 (2038)"), ("cableI", "11", "CABLE CON PUNTERA"), ("traba", "12", "TRABA DEL RIEL"),
               ("sens", "", "SENSIBILIDAD E In")], 1515, 104, 560, paso=30)
ydt = bloque(h, 1370, 640, "DATOS TECNICOS", [
    "CORTA CUANDO HAY FUGA A TIERRA: PROTEGE A LAS PERSONAS (IEC 61008).",
    "36 mm (2 POLOS) o 72 mm (4 POLOS) x 91 x 73,5 (SCHNEIDER iID).",
    "BORNES 1-35 mm² · APRIETE ≈ 3,5 N·m (iID 4P).",
    "ESQUEMA TT: ≤ 300 mA, CLASE A, INMUNIDAD REFORZADA (ETG)."], w=270, sz=9.5, lh=12.5)
bloque(h, 1370, ydt + 8, "DONDE SE USA", [
    "300 mA SUPERINMUNIZADO (3007): GENERAL DEL TABLERO DE ALUMBRADO EN TT (AP-T-007).",
    "30 mA: TOMACORRIENTE Y CIRCUITOS DE SERVICIO DEL TABLERO.",
    "AP-T-008 (TN-S): SIN DIFERENCIAL GENERAL EN LOS CIRCUITOS DE AP."], w=270, sz=9.5, lh=12.5)
h.titulo(890, 612, "EL TOROIDE SOLO", "LO QUE ATRAVIESA: L1 L2 L3 N (PRIMARIO) · SECUNDARIO AL RELE")
A2 = img3d(h, "protab_di_toro", 880, 650, 320)
columna(h, A2, [("bobinado", "2", "SECUNDARIO"), ("ferrita", "1", "ANILLO DE FERRITA"), ("L1", "", "L1"), ("N", "", "N"), ("rele", "4", "RELE"), ("hilos", "", "SEÑAL AL RELE"), ("res", "6", "RESIST. «T» (*)")], 1206, 670, 990, paso=26)
h.txt(890, 1012, "RENDER: three.js (r3d/escenas/protab_di_fila.mjs, protab_di_toro.mjs) CON LOS MISMOS PERFILES DEL PLANO. FUENTES: r3d/FUENTES_protab.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-DIFERENCIALES-1", "INTERRUPTOR DIFERENCIAL", "POR DENTRO (IEC 61008)", "FRENTE, CORTE A-A, PERFIL, ESQUEMAS, CODIGOS Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_diferenciales_1.svg"))
