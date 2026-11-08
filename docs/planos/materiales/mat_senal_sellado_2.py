"""MAT-SENAL_SELLADO-2 (rev. B) · Elastómero de sellado (8009), espuma de poliuretano (8010), sellador elástico de junta (8026),
pintura asfáltica fría (8023) y silicona transparente 260 ml (9003).
Plano y 3D con las mismas medidas (perfiles_civil.json: CART, AERO, LATA, SELLO). 3D: r3d/out/civil_envases.png y civil_sello.png.
Fuentes: ficha de la app, AP-TC-003-A (arena hasta −50 y sello de 50), AP-T-019 (espuma + babero), TABLERO_NIVEL (perímetro del asiento),
pañol (9003: 260 ml). Envases: proporcionales (*). Ver r3d/FUENTES_civil.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

S = PC["SELLO"]; CA = PC["CART"]; AE = PC["AERO"]; LA = PC["LATA"]
h = nuevaC()

# =============== 1. D1 SELLADO DE LA BASE DEL POSTE PRFV ===============
h.titulo(40, 62, "D1 · SELLADO DE LA BASE DEL POSTE PRFV", "ESC. 1:2,5 · AP-TC-003-A: ARENA FINA SECA HASTA −50 Y SELLO DE 50 (MEDIO CORTE)")
k = .6; cx, y0 = 270, 175
def X(r): return cx + r * k
def Y(z): return y0 - z * k
rm, rp = 247 / 2, 197 / 2
h.rect(X(-300) + 50, Y(0), (300 - 50) * k - 0, 300 * k, "url(#CONC)", K, 1.0)
h.rect(X(-rm) - 3.2 * k, Y(0), 3.2 * k, 300 * k, "url(#PVCr)", K, .8)
h.rect(X(-rm), Y(-S["sello"]), (rm - rp) * k, (300 - S["sello"]) * k, "url(#SAND)", K, .8)
h.rect(X(-rm), Y(0), (rm - rp) * k, S["sello"] * k, "url(#GOMA)", K, 1.0)
h.rect(X(-rp), Y(90), 6 * k, 390 * k, "url(#PLAS)", K, 1.0)
h.ln(X(0), Y(100), X(0), Y(-310), K, .45, h.EJE)
h.ln(X(-300) + 50, Y(0), X(40), Y(0), K, 1.4)
h.nivel(X(-300) + 60, Y(0), "±0,00")
h.dimV(X(-rm) - 30, Y(0), Y(-S["sello"]), "50", ext=X(-rm))
h.dimH(Y(-300) + 16, X(-rm), X(-rp), "25", ext=Y(-300))
h.dimH(Y(-300) + 34, X(-rm), X(0), "Ø247 / 2", ext=Y(-300))
for t, (r, z), (gx, gy) in [("SELLO 50 (8009) (*)", (-(rm + rp) / 2, -20), (X(40), Y(30))), ("ARENA FINA SECA", (-(rm + rp) / 2, -150), (X(40), Y(-140))),
                            ("POSTE PRFV Ø197", (-rp + 3, 70), (X(40), Y(70))), ("MOLDE PVC (QUEDA)", (-rm - 1.6, -230), (X(40), Y(-230))), ("H-13", (-200, -180), (X(-300) + 60, Y(-320)))]:
    llamada(h, X(r), Y(z), gx, gy, t, c=OR if "(*)" in t else K, sz=9)

# =============== 2. D2 ENTRADA AL GABINETE (AP-T-019) ===============
subt(h, 520, 62, "D2 · ENTRADA AL GABINETE", "S/E · AP-T-019: ESPUMA PU + BABERO (*)")
gx, gy = 560, 150
h.rect(gx, gy, 230, 14, "url(#MET)", K, 1.0); h.txt(gx + 240, gy + 11, "PISO GABINETE", 9, 400, G)
h.rect(gx + 70, gy + 14, 60, 140, "#fff", K, .8, h.OCULTA)
h.path(f"M{gx + 72},{gy + 14} q10,10 0,20 q14,10 0,20 q12,8 0,18 h56 q-12,-8 0,-18 q-14,-10 0,-20 q-10,-10 0,-20 Z", "url(#GOMA)", K, .9)
for xx in (gx + 88, gx + 100, gx + 112): h.ln(xx, gy - 40, xx, gy + 160, K, 2.0)
h.path(f"M{gx + 60},{gy - 20} L{gx + 140},{gy - 20} L{gx + 120},{gy - 2} L{gx + 80},{gy - 2} Z", "#fff", K, .9)
llamada(h, gx + 76, gy + 30, gx - 10, gy + 90, "ESPUMA PU 8010", sz=9, anc="end")
llamada(h, gx + 130, gy - 12, gx + 170, gy - 30, "BABERO (*)", c=OR, sz=9)
llamada(h, gx + 112, gy + 120, gx + 150, gy + 150, "CABLES", sz=9)

# =============== 3. D3 JUNTA GABINETE / BASE ===============
subt(h, 520, 300, "D3 · JUNTA GABINETE / BASE", "ESC. 1:1 · CORDON DE SELLADOR ELASTICO 8026 (*)")
jx, jy = 560, 350
h.rect(jx, jy + 40, 250, 70, "url(#MORT)", K, 1.0); h.txt(jx + 6, jy + 104, "BASE (REVOQUE)", 9, 400, G)
h.rect(jx + 80, jy, 6, 40, "url(#MET)", K, 1.0); h.rect(jx + 80, jy + 34, 90, 6, "url(#MET)", K, 1.0)
h.path(f"M{jx + 86},{jy + 40} L{jx + 86},{jy + 22} Q{jx + 86},{jy + 40} {jx + 104},{jy + 40} Z", "url(#GOMA)", K, .9)
h.path(f"M{jx + 80},{jy + 40} L{jx + 62},{jy + 40} Q{jx + 80},{jy + 40} {jx + 80},{jy + 22} Z", "url(#GOMA)", K, .9)
llamada(h, jx + 70, jy + 36, jx + 10, jy + 10, "CORDON 8026 (*)", c=OR, sz=9, anc="end")
llamada(h, jx + 120, jy + 37, jx + 180, jy + 10, "PATA DEL GABINETE", sz=9)
h.txt(jx, jy + 130, "PERIMETRO: TIPO A 2,60 m · TIPO B 2,07 m (TABLERO_NIVEL)", 9.5, 700, K)

# =============== 4. ENVASES ===============
subt(h, 40, 500, "ENVASES · VISTAS ACOTADAS", "ESC. 1:4 · MEDIDAS DE REFERENCIA (*) · MANDA EL CONTENIDO")
ke = .5; ex, ey = 80, 720
def cart(x, txt1, txt2, fill):
    h.rect(x, ey - CA["L"] * ke, CA["D"] * ke, CA["L"] * ke, fill, K, 1.1)
    h.path(f"M{x + CA['D'] * ke / 2 - 6},{ey - CA['L'] * ke} V{ey - CA['L'] * ke - 9} L{x + CA['D'] * ke / 2 - 1.5},{ey - (CA['L'] + CA['pico']) * ke} H{x + CA['D'] * ke / 2 + 1.5} L{x + CA['D'] * ke / 2 + 6},{ey - CA['L'] * ke - 9} V{ey - CA['L'] * ke}", "#fff", K, .9)
    h.txt(x + CA["D"] * ke / 2, ey + 16, txt1, 9, 700, K, "middle"); h.txt(x + CA["D"] * ke / 2, ey + 28, txt2, 8.5, 400, OR if "(*)" in txt2 else K, "middle")
cart(ex, "9003 SILICONA", "260 ml", "#fff"); cart(ex + 90, "8009 ELASTOMERO", "ENVASE (*)", "url(#PVCr)")
h.dimV(ex - 12, ey - CA["L"] * ke, ey, "215 (*)", ext=ex, c=OR); h.dimH(ey + 46, ex, ex + CA["D"] * ke, "Ø50 (*)", ext=ey, c=OR)
ax = ex + 200
h.path(f"M{ax},{ey} V{ey - (AE['H'] - 40) * ke} Q{ax},{ey - (AE['H'] - 12) * ke} {ax + AE['D'] * ke / 2 - 7},{ey - (AE['H'] - 8) * ke} H{ax + AE['D'] * ke / 2 + 7} Q{ax + AE['D'] * ke},{ey - (AE['H'] - 12) * ke} {ax + AE['D'] * ke},{ey - (AE['H'] - 40) * ke} V{ey} Z", "#fff", K, 1.1)
h.rect(ax + AE["D"] * ke / 2 - 3, ey - (AE["H"] + 6) * ke, 6, 14 * ke, "#fff", K, .8)
h.dimV(ax + AE["D"] * ke + 12, ey - AE["H"] * ke, ey, "250 (*)", ext=ax + AE["D"] * ke, c=OR)
h.txt(ax + AE["D"] * ke / 2, ey + 16, "8010 ESPUMA PU", 9, 700, K, "middle"); h.txt(ax + AE["D"] * ke / 2, ey + 28, "500 ml (*)", 8.5, 400, OR, "middle")
lx = ax + 130
h.rect(lx, ey - LA["H"] * ke, LA["D"] * ke, LA["H"] * ke, "#fff", K, 1.1); h.rect(lx - 2, ey - LA["H"] * ke - 3, LA["D"] * ke + 4, 4, "#fff", K, .8)
h.rect(lx + 8, ey - LA["H"] * ke * .75, LA["D"] * ke - 16, LA["H"] * ke * .45, "none", K, .5)
h.dimH(ey + 46, lx, lx + LA["D"] * ke, "Ø155 (*)", ext=ey, c=OR); h.dimV(lx + LA["D"] * ke + 12, ey - LA["H"] * ke, ey, "175 (*)", ext=lx + LA["D"] * ke, c=OR)
h.txt(lx + LA["D"] * ke / 2, ey + 16, "8023 ASFALTICA", 9, 700, K, "middle"); h.txt(lx + LA["D"] * ke / 2, ey + 28, "4 L (*)", 8.5, 400, OR, "middle")

# =============== TABLAS Y NOTAS ===============
EX = {8009: "BASE PRFV", 8010: "GABINETE", 8026: "JUNTA · POR m", 8023: "POR m²", 9003: "260 ml"}
yt = tablaCod(h, 40, 800, [8009, 8010, 8026, 8023, 9003], EX, w=800, rowh=15, tit_extra="USO", wext=130)
cols = [(330, "l", False), (150, "c", True), (320, "l", False)]
fil = [["COMPUTO", "CANTIDAD", "DE DONDE SALE"], ["SELLO DE BASE PRFV (8009)", "1 POR POSTE (*)", "AP-TC-003-A"],
       ["JUNTA GABINETE / BASE (8026)", "2,60 / 2,07 m", "TABLERO_NIVEL TIPO A / B"], ["ESPUMA (8010)", "1 POR GABINETE (*)", "AP-T-019"]]
yt = tablaG(h, 40, yt + 20, cols, fil, rowh=15, titulo="COMPUTO")
yr = rayadosC(h, 40, yt + 20, ["GOMA", "SAND", "CONC", "PVCr", "PLAS", "MET"], cols=3, dx=260)
notasW(h, 40, yr + 12, [
    "DATOS: FICHA DE LA APP, AP-TC-003-A (SELLO 50), AP-T-019 (ESPUMA + BABERO) Y TABLERO_NIVEL (PERIMETRO DEL ASIENTO).",
    "(*) AP-TC-003-A: EL DIBUJO DICE «MORTERO» Y LA NOTA «SELLO DE HORMIGON»; EL PAÑOL TIENE «ELASTOMERO» (8009). CONFIRMAR CUAL VA.",
    "(*) MEDIDAS DE LOS ENVASES, CONTENIDO DE 8009 / 8010 / 8023 Y USO DE LA PINTURA ASFALTICA: A CONFIRMAR. FUENTES: r3d/FUENTES_civil.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - ENVASES Y SELLADORES", "CARTUCHOS · AEROSOL CON EL CORDON DE ESPUMA · LATA ABIERTA · JUNTA SELLADA")
A = img3d(h, "civil_envases", 884, 92, 600)
columna(h, A, [("pico", "", "PICO"), ("silicona", "1", "SILICONA 9003"), ("elast", "2", "ELASTOMERO 8009 (*)"), ("aerosol", "3", "ESPUMA PU 8010"), ("lata", "4", "PINTURA ASFALTICA 8023"),
               ("asfalto", "", "PINTURA (NEGRA)"), ("espuma", "", "ESPUMA EXPANDIDA"), ("junta", "5", "SELLADOR DE JUNTA 8026"), ("fondoj", "", "FONDO DE JUNTA (*)")], 1500, 110, 520, paso=26)
h.txt(890, 540, "D1 EN 3D: BASE DEL POSTE PRFV", 11, 700, NV, "start", INT)
A2 = img3d(h, "civil_sello", 884, 548, 300)
globo3d(h, A2("sello"), "", 1210, 600, "SELLO 50 (*)"); globo3d(h, A2("arena"), "", 1210, 640, "ARENA FINA"); globo3d(h, A2("horm"), "", 1210, 700, "H-13"); globo3d(h, A2("poste"), "", 1210, 570, "POSTE PRFV")
bloque(h, 1290, 560, "DATOS TECNICOS", [
    "SILICONA TRANSPARENTE 260 ml",
    "ESPUMA DE POLIURETANO: ENTRADA AL GABINETE",
    "SELLADOR ELASTICO DE JUNTA: POR METRO",
    "PINTURA ASFALTICA FRIA: POR m²"], w=340, sz=10, lh=13.5)
bloque(h, 890, 820, "DONDE SE USA", [
    "AP-TC-003-A: SELLADO DE LA BASE DEL POSTE PRFV · AP-T-019: ESPUMA + BABERO EN EL GABINETE",
    "AP-TC-007: JUNTA GABINETE / BASE (2,60 m TIPO A · 2,07 m TIPO B) · PINTURA ASFALTICA: USO (*)"], w=740, sz=10, lh=13.5)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_envases.mjs, civil_sello.mjs). FUENTES: r3d/FUENTES_civil.md")
rotuloMat(h, "MAT-SENAL_SELLADO-2", "SELLADORES, ESPUMA,", "SILICONA Y PINTURA ASFALTICA", "D1, D2, D3, ENVASES Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha=FECHA)
guardarC(h, "mat_senal_sellado_2")
