"""MAT-TERMOMAGNETICAS-2 (rev. B) · Termomagnéticas nuevas del pañol (altas del equipo): 3074 1 × 20, 3093 1 × 16 C, 3095 4 × 40, 3097 iK60N 2 × 20 C.
Plano con TM de r3d/piezas/perfiles_protab.mjs (grupo protab, sin tocarlo: frente, perfil); 3D: r3d/out/nelec_tm2.png y nelec_tm2_corte.png.
Datos: FICHAS_TEC.termomagneticas (18 por polo · 85 · 78,5 iC60N), Schneider iK60N A9K24220 (2P 20 A C 6000 A IEC 60898-1). Fuentes: r3d/FUENTES_nelec.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nelekit import *

S = TM; H_, D_, Dr, Dn = S["H"], S["D"], S["Dr"], S["Dn"]; c0, c1 = S["cuello"]
h = hojaN()

# =============== 1. FRENTES ===============
e = 2.0; FY = 112
h.titulo(40, 62, "FRENTE - LOS 4 APARATOS", "ESC. 2:1 · 18 mm POR POLO (FICHA)")
x = 60; Xs = []
for n, m, icc, t in ((4, "40 A", "", "3095 · 4 x 40 A"), (2, "C20", "6000", "3097 · iK60N 2 x 20"), (1, "C16", "", "3093 · 1 x 16 C"), (1, "20A", "", "3074 · 1 x 20")):
    X, Z = frenteMod(h, x, FY, e, S, n, m, icc); Xs.append((X, Z, n))
    h.dimH(FY + H_ * e + 20, X(0), X(18 * n), str(18 * n), ext=FY + H_ * e + 4)
    h.txt(X(9 * n), FY + H_ * e + 40, t, 9, 700 if n > 1 else 400, K, "middle")
    x += 18 * n * e + (34 if n > 1 else 30)
h.dimV(46, FY, FY + H_ * e, "85", ext=58)
X1, Z1, _ = Xs[2]
lineaCorte(h, X1(9), Z1(H_) - 16, X1(9), Z1(0) + 16, "A", lado=-1)

# =============== 2. PERFIL ===============
ep = 2.0; vp = Vista(h, 618, 300, ep)
h.titulo(560, 62, "PERFIL", "IGUAL EN LOS CUATRO · RIEL NS35")
modPerfil(vp, S)
vp.cotaH(0, D_, -22, "78,5", zext=-1)
vp.cotaH(0, Dr, -34, "44 (*)", zext=-1, c=OR)
vp.cotaV(D_ + 8, c0, c1, "45", yext=Dn + .5)

# =============== 3. D1 · CURVA C (ESQUEMA) ===============
DY = 410
h.titulo(40, DY, "D1 - CURVA C: CUANDO CORTA", "ESQUEMA SIN ESCALA · IEC 60898-1")
gx0, gy0, gw, gh = 70, DY + 40, 330, 170
h.ln(gx0, gy0 + gh, gx0 + gw, gy0 + gh, K, 1.1); h.ln(gx0, gy0, gx0, gy0 + gh, K, 1.1)
h.txt(gx0 + gw, gy0 + gh + 16, "I / In", 9.5, 700, K, "end"); h.txt(gx0 - 6, gy0 - 6, "TIEMPO", 9.5, 700, K, "start")
xs = lambda k: gx0 + 30 + (math.log10(k) / math.log10(30)) * (gw - 40)
h.path(f"M{xs(1.15):.1f},{gy0+4} C{xs(1.4):.1f},{gy0+60} {xs(2.5):.1f},{gy0+95} {xs(5):.1f},{gy0+110} L{xs(5):.1f},{gy0+gh-30} L{xs(30):.1f},{gy0+gh-24}", "none", K, 1.6)
h.path(f"M{xs(1.45):.1f},{gy0+4} C{xs(1.8):.1f},{gy0+40} {xs(4):.1f},{gy0+70} {xs(10):.1f},{gy0+82} L{xs(10):.1f},{gy0+gh-12} L{xs(30):.1f},{gy0+gh-8}", "none", K, 1.6)
h.a(f'<path d="M{xs(5):.1f},{gy0+110} L{xs(10):.1f},{gy0+82} L{xs(10):.1f},{gy0+gh-12} L{xs(5):.1f},{gy0+gh-30} Z" fill="url(#PLAS)" opacity=".7"/>')
for k_, t in ((1, "1"), (5, "5"), (10, "10")):
    h.ln(xs(k_), gy0 + gh, xs(k_), gy0 + gh + 5, K, .8); h.txt(xs(k_), gy0 + gh + 16, t, 9.5, 700, K, "middle", MONO)
h.txt(xs(2.4) + 6, gy0 + 30, "TERMICO (BIMETAL): SOBRECARGA", 9, 400)
h.txt(xs(7) + 4, gy0 + gh - 52, "MAGNETICO", 9, 700); h.txt(xs(7) + 4, gy0 + gh - 40, "5 A 10 In", 9, 400)

# =============== 4. D2 · FRENTE DEL iK60N ===============
h.titulo(450, DY, "D2 - QUE DICE EL FRENTE (iK60N)", "SCHNEIDER A9K24220 · 2P · C20")
bx, by = 460, DY + 44
h.rect(bx, by, 72, 70, "#fff", K, 1.1); h.txt(bx + 36, by + 22, "C20", 15, 700, K, "middle")
h.rect(bx + 8, by + 32, 30, 13, "#fff", K, .7); h.txt(bx + 23, by + 42, "6000", 8, 700, K, "middle")
h.txt(bx + 36, by + 62, "230/400V~", 7.5, 400, K, "middle")
for i, (t1, t2) in enumerate((("iK60N", "LINEA ECONOMICA DE ACTI9 (SCHNEIDER)"), ("C20", "CURVA C · In = 20 A"), ("6000", "6 kA · IEC 60898-1"), ("2P", "2 POLOS PROTEGIDOS (L + N)"))):
    h.txt(bx + 86, by + 12 + i * 17, t1, 9.5, 700, K, "start", MONO); h.txt(bx + 138, by + 12 + i * 17, t2, 9, 400)
h.txt(460, DY + 150, "EL 3095 (4 x 40) Y EL 3074 (1 x 20) NO DICEN CURVA NI", 9, 400, OR)
h.txt(460, DY + 163, "PODER DE CORTE: LEERLOS EN EL FRENTE (*).", 9, 400, OR)
rayadosRef(h, 460, DY + 186, ["PLAS", "PLAS2", "MET", "CU"], cols=2, dx=190)

# =============== 5. TABLA ===============
dat = {3095: ("4", "40 A", "(*)", "(*)", "GENERAL DEL TABLERO (*)"), 3097: ("2", "20 A", "C", "6 kA", "SALIDA MONOFASICA L + N"),
       3093: ("1", "16 A", "C", "(*)", "SALIDA 3 x 1 x 16 (T-010) (*)"), 3074: ("1", "20 A", "(*)", "(*)", "SALIDA / COMANDO (*)")}
filas = [["COD.", "DESCRIPCION (TAL CUAL EL PAÑOL)", "UN.", "P", "In", "CURVA", "Icc", "PARA QUE"]]
for c in [3095, 3097, 3093, 3074]:
    r = catN(c, 48); filas.append([r[0], r[1], r[2], *dat[c]])
yt = tablaN(h, 40, 660, [(40, "c", True), (318, "l", False), (34, "c", False), (22, "c", True), (44, "c", True), (48, "c", False), (40, "c", False), (254, "l", False)],
            filas, "CODIGOS DEL PAÑOL (4) - ALTAS DEL EQUIPO")
notasW(h, 40, yt + 22, [
    "COTAS EN mm: 18 POR POLO · 85 · 78,5 = SCHNEIDER iC60N (FICHA DE LA APP); EL iK60N TIENE EL MISMO MODULO. CUELLO 45: DIN 43880.",
    "(*) HOMBRO 44, JAULA, TORNILLO Y MECANISMO: PROPORCIONALES (MAT-TERMOMAGNETICAS-1, GRUPO PROTAB). VARIAN SEGUN LA MARCA.",
    "(*) 3095 «4 X 40 A» Y 3074 «1 X 20»: SIN CURVA NI PODER DE CORTE EN LA DESCRIPCION. 3093 CURVA C SIN Icc.",
    "(*) UNIDADES TAL CUAL EL PAÑOL: 3093 EN «c/a» (¿CADA UNO?), 3095 EN «UN». REVISAR.",
    "(*) DESTINO DE CADA UNO: A CONFIRMAR CON EL PROYECTO DEL TABLERO. EL 3093 COINCIDE CON LAS SALIDAS «3 x 1 x 16 A» DEL T-010.",
    "FUENTES: r3d/FUENTES_nelec.md (iK60N A9K24220: 2P, 20 A, C, 6000 A, IEC 60898-1)."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - LOS CUATRO EN EL RIEL NS35", "4 x 40 A CON L1 · L2 · L3 · N · iK60N 2 x 20 C · 1 x 16 C · 1 x 20")
A = img3d(h, "nelec_tm2", 900, 84, 560)
columna(h, A, [("tm4", "", "4 x 40 A (3095)"), ("ik", "", "iK60N 2 x 20 C (3097)"), ("c16", "", "1 x 16 C (3093)"), ("c20", "", "1 x 20 (3074)"),
               ("manija", "13", "MANIJA UNIDA"), ("visor", "14", "VISOR ROJO = CERRADO"), ("tornillo", "3", "TORNILLO M4 (*)"), ("riel", "15", "RIEL NS35"),
               ("cable", "", "L1 · L2 · L3 · N (AEA)")], 1478, 100, 480, paso=32)
h.titulo(890, 500, "EL 1 x 16 A POR DENTRO (CORTE A-A)", "NUMEROS IGUALES A MAT-TERMOMAGNETICAS-1")
A2 = img3d(h, "nelec_tm2_corte", 935, 520, 400)
columna(h, A2, [("jaulaS", "1", "JAULA"), ("bobina", "6", "BOBINA (MAGNETICO)"), ("fijo", "7", "CONTACTO FIJO"), ("arco", "8", "CAMARA DE ARCO"),
                ("bimetal", "10", "BIMETAL (TERMICO)"), ("manija", "13", "MANIJA")], 1400, 560, 860, paso=34)
bloque(h, 890, 902, "DATOS TECNICOS", ["CORTA POR SOBRECARGA (BIMETAL) Y POR CORTOCIRCUITO (BOBINA).", "BORNES DE JAULA, TORNILLO M4 (*), CON PUNTERA."], w=470, sz=9, lh=12)
bloque(h, 1390, 902, "DONDE SE USA", ["TABLEROS DE PLAZA Y T-010 (MAT-TABLERO-4).", "UNO POR SALIDA (AP-T-007 / 008)."], w=250, sz=9, lh=12)
rotuloMat(h, "MAT-TERMOMAGNETICAS-2", "TERMOMAGNETICAS NUEVAS", "1x16 · 1x20 · 2x20 · 4x40", "FRENTES, PERFIL, D1, D2, CODIGOS Y 3D", "2:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardar(h, "mat_termomagneticas_2")
