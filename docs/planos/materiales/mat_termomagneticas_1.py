"""MAT-TERMOMAGNETICAS-1 (rev. B) · Interruptor termomagnético curva C para riel DIN, por dentro, y peine de alimentación por pines.
Plano con los perfiles de r3d/piezas/perfiles_protab.mjs (TM, PEINE_TM); 3D: r3d/out/protab_tm_fila.png y protab_tm_corte.png.
Datos: FICHAS_TEC.termomagneticas (18 mm por polo, alto 85, prof. 78,5; Schneider iC60N; bornes 1–25 / 1–16 mm², 2 N·m; tabla de polos/In/curva),
catálogo del pañol, AP-T-007/008, DIN 43880 (cuello 45). Partes internas: guía de ABB (1SXU400142M0201). Fuentes: r3d/FUENTES_protab.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from protabkit import *

S = TM; H_, D_, Dr, Dn = S["H"], S["D"], S["Dr"], S["Dn"]; c0, c1 = S["cuello"]
h = nueva3()

# =============== 1. FRENTE 1, 2 Y 4 POLOS ===============
e = 1.9; FY = 112
h.titulo(40, 62, "FRENTE - 1, 2 Y 4 POLOS", "ESC. 1,9:1 · 18 mm POR POLO (FICHA)")
x = 58; Xs = []
for n, m, icc in ((1, "C10", ""), (2, "C20", "6000"), (4, "C25", "10000")):
    X, Z = frenteMod(h, x, FY, e, S, n, m, icc); Xs.append((X, Z, n))
    h.dimH(FY + H_ * e + 20, X(0), X(18 * n), str(18 * n), ext=FY + H_ * e + 4)
    h.txt(X(9 * n), FY + H_ * e + 40, f"{n} POLO" + ("S" if n > 1 else ""), 9.5, 400, G, "middle")
    x += 18 * n * e + 20
X4, Z4, _ = Xs[2]
h.dimV(44, FY, FY + H_ * e, "85", ext=56)
h.dimV(X4(72) + 16, Z4(c1), Z4(c0), "45 (DIN 43880)", ext=X4(72) + 2)
X1, Z1, _ = Xs[0]
lineaCorte(h, X1(9), Z1(H_) - 16, X1(9), Z1(0) + 16, "A", lado=-1)

# =============== 2. CORTE A-A (plano medio de un polo) ===============
ec = 4.0; vc = Vista(h, 486, 492, ec)
h.titulo(430, 62, "CORTE A-A", "ESC. 4:1 · PLANO MEDIO DEL POLO · PEINE ENCHUFADO")
tmCorte(vc, pin=True)
vc.cotaV(D_ + 13, 0, H_, "85", yext=Dr + 1)
vc.cotaH(0, D_, -22, "78,5", zext=-1)
glob = [("1", (5, 70), (436, 130)), ("2", (23, 80.5), (436, 158)), ("3", (40.5, 75), (812, 118)), ("4", (22, 60), (436, 186)), ("5", (18, 61.5), (436, 214)),
        ("6", (34, 57), (436, 242)), ("7", (37.9, 45.0), (812, 230)), ("8", (13, 30), (436, 290)), ("9", (32, 43), (436, 262)), ("10", (40, 22), (436, 378)),
        ("11", (44.5, 37.1), (812, 300)), ("12", (49, 29), (812, 340)), ("13", (72, 47), (812, 196)), ("15", (-4, 52), (436, 330)),
        ("16", (24.5, 92), (812, 88)), ("17", (TM["cable"]["y"], -12), (436, 470)), ("14", (Dn + .2, 25), (812, 400)), ("18", (2, -1.8), (436, 420))]
for n, (y, z), (gx, gy) in glob: h.globo(n, *vc.p(y, z), gx, gy, r=9)

# =============== 3. PERFIL ===============
ep = 1.9; vp = Vista(h, 74, 616, ep)
h.titulo(40, 352, "PERFIL", "SOBRE RIEL NS35")
modPerfil(vp, S)
vp.cotaH(0, D_, -22, "78,5", zext=-1)
vp.cotaH(0, Dr, -32, "44 (*)", zext=-1, c=OR)
vp.cotaH(Dr, Dn, 92, "", zext=c1)
h.txt(*[a + b for a, b in zip(vp.p((Dr + Dn) / 2, 92), (0, -6))], "25 (*)", 9.5, 400, OR, "middle")
vp.cotaV(D_ + 7, c0, c1, "45", yext=Dn + .5)
vp.cotaV(-12, S["zM"] - 17.5, S["zM"] + 17.5, "35", yext=-8)

# =============== 4. D1 · BORNE CON EL PIN DEL PEINE ===============
ed = 6.0; DX0, DY0, DW, DH = 262, 382, 140, 186
h.titulo(262, 352, "D1 - BORNE", "ESC. 6:1 · PIN ATRAS")
h.a(f'<clipPath id="cpD1"><rect x="{DX0}" y="{DY0}" width="{DW}" height="{DH}"/></clipPath>')
h.rect(DX0, DY0, DW, DH, "none", K, .5)
h.a('<g clip-path="url(#cpD1)">')
vd = Vista(h, DX0 - 17 * ed, DY0 + 96 * ed, ed)
tmCorte(vd, pin=True)
h.a('</g>')
vd.cotaH(PEI["pin"]["y"][0], PEI["pin"]["y"][1], 99.5, "2", zext=None)
h.txt(DX0 + DW - 4, DY0 + DH + 14, "JAULA 12 · M4 COMBI (*)", 8.5, 400, OR, "end")
for t, (y, z), (tx, ty) in [("PIN 10 mm²", (24.5, 84), (DX0 + 4, DY0 + 12)), ("PUNTERA", (31, 84), (DX0 + DW - 70, DY0 + 12))]:
    a = vd.p(y, z); llamada(h, a[0], a[1], tx, ty, t, sz=8.5)
h.llamadaDet(*vc.p(28, 80), 13 * ec, "D1")

# =============== 5. D2 · PEINE DE PINES ===============
h.titulo(40, 688, "D2 - PEINE DE PINES (1 FASE)", "ESC. 1,9:1 · REF. SIEMENS 5ST3687-0")
ee = 1.9; px0, py0 = 64, 728
L4 = 3 * 18 + 14
h.rect(px0, py0, L4 * ee, 11.3 * ee, "url(#PLAS2)", K, 1.1)
for i in range(4):
    xc = px0 + (7 + i * 18) * ee
    h.rect(xc - 2.3 * ee, py0 + 11.3 * ee, 4.6 * ee, 13.7 * ee, "url(#CU)", K, .8)
h.rect(px0 + 1 * ee, py0 + 4 * ee, (L4 - 2) * ee, 4 * ee, "none", K, .5, h.OCULTA)
xb = px0 + L4 * ee; h.path(f"M{xb},{py0-6} l6,8 l-8,6 l6,8 l-6,8 l6,8", "none", K, .7)
h.dimH(py0 - 12, px0 + 7 * ee, px0 + 25 * ee, "18", ext=py0 - 2)
h.dimV(px0 - 10, py0, py0 + 11.3 * ee, "11,3", ext=px0 - 2)
h.dimV(px0 + L4 * ee + 34, py0 + 11.3 * ee, py0 + 25 * ee, "13,7 (*)", ext=px0 + L4 * ee - 20, c=OR)
h.txt(px0, py0 + 58, "BARRA DE Cu 10 mm² EN UN PEINE AISLADO (PA).", 8.5, 400)
h.txt(px0, py0 + 70, "SE CORTA A MEDIDA. SIN CODIGO EN EL PAÑOL (*).", 8.5, 400, OR)

# =============== 6. D3 · QUE DICE EL FRENTE ===============
h.titulo(330, 688, "D3 - QUE DICE EL FRENTE", "EJEMPLO (DEPENDE DE LA MARCA)")
bx, by = 336, 720
h.rect(bx, by, 64, 64, "#fff", K, 1.1); h.txt(bx + 32, by + 22, "C20", 15, 700, K, "middle")
h.rect(bx + 6, by + 32, 26, 13, "#fff", K, .7); h.txt(bx + 19, by + 42, "6000", 8, 700, K, "middle")
h.rect(bx + 36, by + 32, 22, 13, "#fff", K, .7); h.txt(bx + 47, by + 42, "3", 8, 700, K, "middle")
h.txt(bx + 32, by + 58, "230/400V~", 7.5, 400, K, "middle")
for i, (t1, t2) in enumerate((("C20", "CURVA C · In = 20 A"), ("6000", "PODER DE CORTE 6 kA (IEC 60898-1)"), ("10 kA", "SI DICE kA: IEC 60947-2"), ("3", "CLASE DE LIMITACION (*)"))):
    h.txt(bx + 76, by + 12 + i * 16, t1, 9.5, 700, K, "start", MONO); h.txt(bx + 118, by + 12 + i * 16, t2, 9.5, 400, OR if "(*)" in t2 else K)
rayadosRef(h, 650, 688, ["PLAS", "PLAS2", "MET", "CU", "BOB"], cols=1, dx=200)

# =============== 7. TABLAS DE CODIGOS (2 columnas) ===============
tab = [[3045, "1", "6 A", "C · 10 kA"], [3040, "1", "6 A", "C"], [3068, "1", "6 A", "—"], [3046, "1", "6 A", "(*)"], [3032, "1", "10 A", "C · 10 kA"], [3067, "1", "10 A", "—"],
       [3066, "1", "25 A", "—"], [3025, "1", "32 A", "C"], [3063, "1", "32 A", "4,5 kA"], [3033, "2", "10 A", "C · 6/10 kA"], [3064, "2", "16 A", "4,5 kA"],
       [3041, "2", "20 A", "C · 10 kA"], [3069, "2", "20 A", "C"], [3023, "2", "25 A", "C"], [3024, "3", "16 A", "C"], [3044, "3", "25 A", "C · 10 kA"],
       [3038, "4", "6 A", "C"], [3039, "4", "6 A", "C"], [3034, "4", "10 A", "C"], [3021, "4", "16 A", "C · 10 kA"], [3035, "4", "20 A", "C"], [3036, "4", "25 A", "C · 10 kA"],
       [3042, "4", "25 A", "C · 10 kA"], [3070, "4", "25 A", "—"], [3037, "4", "32 A", "C"], [3022, "4", "40 A", "C"], [3065, "4", "40 A", "—"], [3043, "4", "50 A", "C · 10 kA"]]
cols = [(40, "c", True), (222, "l", False), (24, "c", True), (38, "c", True), (78, "l", False)]
TY = 815
for k, parte in enumerate((tab[:14], tab[14:])):
    filas = [["COD.", "DESCRIPCION (PAÑOL)", "P", "In", "CURVA/Icc"]] + [[str(c), cat(c, 31)[1], p, i_, cu] for c, p, i_, cu in parte]
    yt = h.tabla(40 + k * 412, TY, cols, filas, rowh=13.6, titulo="CODIGOS DEL PAÑOL (28) - TODOS Un." if k == 0 else None, colores=colorOR) if k == 0 else \
        h.tabla(40 + k * 412, TY + 14, cols, filas, rowh=13.6, colores=colorOR)
notasW(h, 40, yt + 24, [
    "COTAS EN mm: 18 POR POLO · 85 · 78,5 = SCHNEIDER iC60N (FICHA DE LA APP). CUELLO 45: DIN 43880.",
    "(*) HOMBRO 44, FRENTE 69, JAULA, TORNILLO Y MECANISMO: PROPORCIONALES (VARIA SEGUN LA MARCA).",
    "(*) 3046 «INTERRUPTOR UNIPOLAR 6 A» NO DICE TERMOMAGNETICO NI CURVA. 3038 = 3039 (MISMO MATERIAL).",
    "(*) PEINE DE PINES: SIN CODIGO EN EL PAÑOL (A VINCULAR). MODULO DIN 17,5; LA FICHA DICE 18 POR POLO."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - 4, 2 Y 1 POLO EN EL RIEL NS35", "4 POLOS CON L1 · L2 · L3 · N ARRIBA; 2 + 1 POLO CON PEINE DE PINES; EL DE 1 POLO CORTADO")
A = img3d(h, "protab_tm_fila", 905, 84, 560)
columna(h, A, [("peine", "16", "PEINE DE PINES"), ("pin", "", "PIN EN LA JAULA"), ("bobina", "6", "BOBINA"), ("arco", "8", "CAMARA DE ARCO"),
               ("riel", "15", "RIEL NS35 (2038)"), ("traba", "18", "TRABA DEL RIEL"), ("cableI", "17", "CABLE CON PUNTERA"), ("cable", "", "L1 · L2 · L3 · N (AEA)"),
               ("marca", "", "CURVA E In"), ("manija", "13", "MANIJA"), ("visor", "14", "VISOR ROJO = CERRADO"), ("tornillo", "3", "TORNILLO")], 1488, 96, 530, lado="der")
h.titulo(890, 552, "UN POLO POR DENTRO (CORTE POR EL PLANO MEDIO)", "MISMOS NUMEROS QUE EL CORTE A-A")
A2 = img3d(h, "protab_tm_corte", 905, 586, 430)
columna(h, A2, [("jaulaS", "1", "JAULA (ACERO CINCADO)"), ("tornillo", "3", "TORNILLO M4 (*)"), ("bobina", "6", "BOBINA (DISPARO MAGNETICO)"),
                ("percutor", "", "PERCUTOR"), ("yugo", "", "YUGO"), ("fijo", "7", "CONTACTO FIJO (PLATA)"), ("cuerno", "9", "CUERNO DE ARCO"),
                ("arco", "8", "CAMARA DE ARCO (9 PLACAS)"), ("movil", "", "CONTACTO MOVIL"), ("malla", "11", "MALLA DE COBRE"),
                ("bimetal", "10", "BIMETAL (DISPARO TERMICO)"), ("cerrojo", "12", "CERROJO / DISPARO"), ("manija", "13", "MANIJA")], 1360, 600, 935, paso=27)
ydt = bloque(h, 890, 962, "DATOS TECNICOS", [
    "CORTA POR SOBRECARGA (BIMETAL) Y CORTOCIRCUITO (BOBINA). CURVA C: MAGNETICO ENTRE 5 Y 10 In (IEC 60898-1).",
    "BORNES: RIGIDO 1-25 mm², FLEXIBLE 1-16 mm² · APRIETE ≈ 2 N·m (iC60N)."], w=470, sz=9, lh=12)
bloque(h, 1390, 962, "DONDE SE USA", ["UNO POR SALIDA DEL TABLERO (AP-T-007 / 008).", "TN-S: UNIPOLARES 1 x 6 mm² (AP-T-008)."], w=250, sz=9, lh=12)
rotuloMat(h, "MAT-TERMOMAGNETICAS-1", "TERMOMAGNETICA CURVA C", "Y PEINE DE PINES", "FRENTE, CORTE A-A, PERFIL, D1-D3, CODIGOS Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_termomagneticas_1.svg"))
