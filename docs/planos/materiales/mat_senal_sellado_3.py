"""MAT-SENAL_SELLADO-3 (rev. B) · grupo «nobra»: señalización de obra y de zanja, altas del equipo (respaldo/nuevos.csv, tal cual):
malla de seguridad vial naranja 1 × 45 m (1035), malla subterránea «Peligro eléctrico» de 15 cm (1052) y cinta de peligro 100 m (8038).
Plano y 3D con los mismos números: r3d/piezas/perfiles_nobra.mjs (MVIAL, MALLA15, CINTAP, ZANJA). 3D: r3d/out/nobra_senal.png.
Fuentes: pañol (anchos y largos), Maintec (mallas de 15 y 30 cm, rollos de 100 m: FUENTES_civil), AP-TC-001 (malla a 0,30), ficha de la app (8017)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nobrakit import *

V = PN["MVIAL"]; M15 = PN["MALLA15"]; CP = PN["CINTAP"]; Z = PN["ZANJA"]
h = nuevaC()

# =============== 1. MALLA VIAL NARANJA · DETALLE Y CERCO ===============
h.titulo(40, 62, "MALLA DE SEGURIDAD VIAL NARANJA (1035) · CERCO", "ESC. 1:25 · 1 m DE ALTO · ROLLO DE 45 m · OJOS OVALADOS ≈ 90 x 40 (*)")
s1 = .17; cx0, cy0 = 80, 335
est = lambda x: h.rect(cx0 + x * s1 - 5, cy0 - 1250 * s1, 10, 1250 * s1 + 30, "url(#WOOD)", K, 1.0)
est(0); est(1500)
h.rect(cx0, cy0 - 1100 * s1, 1500 * s1, 1000 * s1, "none", K, 1.0)
for k in range(1, 22, 2): h.ln(cx0, cy0 - (100 + k * 46) * s1, cx0 + 1500 * s1, cy0 - (100 + k * 46) * s1, K, .3)
h.rect(cx0, cy0 - 1200 * s1 - CP["ancho"] / 2 * s1, 1500 * s1, CP["ancho"] * s1, "#fff", K, .8)
for x in range(0, 1500, 100): h.rect(cx0 + x * s1, cy0 - 1200 * s1 - CP["ancho"] / 2 * s1, 50 * s1, CP["ancho"] * s1, "#111", K, .3)
h.ln(cx0 - 20, cy0 + 30, cx0 + 1500 * s1 + 20, cy0 + 30, K, 1.2); h.txt(cx0 + 1500 * s1 + 24, cy0 + 34, "PISO", 8.5, 400, G)
h.dimV(cx0 - 16, cy0 - 1100 * s1, cy0 - 100 * s1, "1000", ext=cx0)
h.dimH(cy0 + 46, cx0, cx0 + 1500 * s1, "1500 ENTRE ESTACAS (*)", ext=cy0 + 30, c=OR)
llamada(h, cx0 + 700 * s1, cy0 - 1200 * s1, cx0 + 1500 * s1 + 30, cy0 - 1250 * s1, "CINTA 8038 ARRIBA", sz=9)
llamada(h, cx0 + 1500 * s1, cy0 - 1180 * s1 + 60, cx0 + 1500 * s1 + 30, cy0 - 1180 * s1 + 30, "ESTACA (*)", OR, sz=9)
# detalle de los ojos
dx0, dy0, s2 = 560, 130, .55
h.titulo(530, 62, "D1 - OJOS DE LA MALLA VIAL", "ESC. 1:7 · PEAD NARANJA (*)")
for k in range(4):
    for j in range(3):
        off = (k % 2) * 48
        cx = dx0 + (j * 96 + off) * s2; cy = dy0 + 20 + k * 46 * s2
        h.a(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{45 * s2:.1f}" ry="{20 * s2:.1f}" fill="#fff" stroke="{K}" stroke-width=".9"/>')
h.dimH(dy0 + 20 + 4 * 46 * s2, dx0 - 45 * s2, dx0 + 45 * s2, "90 (*)", ext=dy0 + 20 + 3 * 46 * s2, c=OR)
h.dimV(dx0 + 260 * s2 + 10, dy0 + 20 - 20 * s2, dy0 + 20 + 20 * s2, "40 (*)", ext=dx0 + 240 * s2, c=OR)

# =============== 2. MALLA SUBTERRANEA 15 cm (1052) vs 30 cm (8017) ===============
h.titulo(40, 420, "MALLA DE ZANJA 15 cm (1052) Y 30 (8017)", "ESC. 1:12,5 · PEBD ROJA · ROMBOS ≈ 22 x 18 (COMO LA 8017) · ROLLO DE 100 m (*)")
s3 = .32; my = 478
def malla(y, W, L=700):
    h.rect(70, y, L * s3, W * s3, "none", K, 1.0)
    for x in range(0, L, 22):
        h.ln(70 + x * s3, y, 70 + (x + 11) * s3, y + W * s3 / 2, K, .25) if False else None
    h.a(f'<rect x="70" y="{y}" width="{L * s3}" height="{W * s3}" fill="url(#ROMBO)" stroke="{K}" stroke-width="1"/>')
    h.rect(70, y + W * s3 / 2 - 6, L * s3, 12, "#fff", K, .6); h.txt(70 + L * s3 / 2, y + W * s3 / 2 + 3, "PELIGRO ELECTRICO", 7.5, 700, K, "middle")
h.a('<defs><pattern id="ROMBO" width="12.1" height="9.9" patternUnits="userSpaceOnUse"><rect width="12.1" height="9.9" fill="#fff"/><path d="M0,4.95 L6.05,0 L12.1,4.95 L6.05,9.9 Z" fill="none" stroke="#111" stroke-width=".4"/></pattern></defs>')
malla(my, 150); malla(my + 70, 300)
h.dimV(70 + 700 * s3 + 14, my, my + 150 * s3, "150 (1052)", ext=70 + 700 * s3)
h.dimV(70 + 700 * s3 + 14, my + 70, my + 70 + 300 * s3, "300 (8017)", ext=70 + 700 * s3)
# corte de zanja AP-TC-001
h.titulo(470, 420, "DONDE VA: ZANJA AP-TC-001", "ESC. 1:15 · MALLA A 0,30 SOBRE EL CABLE")
s4 = .27; zx, zy = 560, 470
h.rect(zx - 120, zy, Z["ancho"] * s4 + 240, Z["prof"] * s4 + 30, "url(#EARTH)", K, .5)
h.rect(zx, zy, Z["ancho"] * s4, Z["prof"] * s4, "url(#ANSI37)", K, 1.5)
h.rect(zx, zy + (Z["prof"] - 200) * s4, Z["ancho"] * s4, 100 * s4, "url(#SAND)", K, .6)
h.circ(zx + Z["ancho"] * s4 / 2, zy + (Z["prof"] - 150) * s4, 7, "#fff", K, 1.0)
h.ln(zx + Z["ancho"] * s4 / 2 - 150 * s4 / 2, zy + Z["malla"] * s4, zx + Z["ancho"] * s4 / 2 + 150 * s4 / 2, zy + Z["malla"] * s4, K, 2.0, 'stroke-dasharray="7 2 1.5 2"')
h.dimV(zx + Z["ancho"] * s4 + 18, zy, zy + Z["malla"] * s4, "300", ext=zx + Z["ancho"] * s4)
h.dimV(zx + Z["ancho"] * s4 + 46, zy, zy + Z["prof"] * s4, "750", ext=zx + Z["ancho"] * s4)
h.dimH(zy - 12, zx, zx + Z["ancho"] * s4, "400", ext=zy)
llamada(h, zx + Z["ancho"] * s4 / 2 - 15, zy + Z["malla"] * s4, zx - 110, zy - 12, "MALLA 15 cm (1052)", sz=9)
llamada(h, zx + Z["ancho"] * s4 / 2, zy + (Z["prof"] - 150) * s4, zx + 30, zy + Z["prof"] * s4 + 24, "CABLE", sz=9)

# =============== 3. CINTA DE PELIGRO ===============
h.titulo(40, 720, "CINTA DE PELIGRO 100 m (8038)", "ESC. 1:5 · ANCHO 75 (*) · FRANJAS ROJO / BLANCO (*)")
s5 = .8; cy5 = 765
h.rect(70, cy5, 600 * s5, CP["ancho"] * s5, "#fff", K, 1.0)
for x in range(0, 600, 100): h.path(f"M{70 + x * s5},{cy5} h{50 * s5} l{-20 * s5},{CP['ancho'] * s5} h{-50 * s5} Z".replace(f"l{-20 * s5}", "l0"), "url(#PLAS)", K, .4)
h.rect(70 + 250 * s5, cy5 + 15, 110 * s5, CP["ancho"] * s5 - 30, "#fff", K, .6); h.txt(70 + 305 * s5, cy5 + CP["ancho"] * s5 / 2 + 4, "PELIGRO", 10, 700, K, "middle")
h.dimV(70 + 600 * s5 + 14, cy5, cy5 + CP["ancho"] * s5, "75 (*)", ext=70 + 600 * s5, c=OR)

# =============== TABLA, COMPUTO Y NOTAS ===============
EX = {1035: "1 m × 45 m", 1052: "15 cm × 100 m (*)", 8038: "100 m · 75 (*)"}
yt = tablaN(h, 40, 870, [1035, 1052, 8038], EX, w=800, rowh=14.5, wext=130)
fil = [["MATERIAL", "CUANTO", "COMO SE CUENTA"], ["1052 MALLA 15 cm", "1,05 m POR m DE ZANJA (*)", "+5 % DE SOLAPE (FICHA 8017) · 1 ROLLO ≈ 95 m"],
       ["1035 MALLA VIAL", "PERIMETRO DEL POZO / ZANJA + 10 % (*)", "1 ROLLO = 45 m"], ["8038 CINTA", "PERIMETRO + ATADURAS (*)", "1 ROLLO = 100 m"]]
yt = tablaG(h, 40, yt + 14, [(170, "l", False), (240, "c", False), (390, "l", False)], fil, rowh=14, titulo="COMPUTO")
yr = rayadosC(h, 40, yt + 14, ["EARTH", "ANSI37", "SAND", "WOOD"], cols=4, dx=190)
notasW(h, 40, yr + 8, [
    "▪ = ALTAS DEL EQUIPO: DESCRIPCION Y UNIDAD TAL CUAL. 1035 Y 1052 EN «Un.» (ROLLO); 8038 EN «Un.» (ROLLO DE 100 m).",
    "(*) 1052: NO DICE LARGO DEL ROLLO (MAINTEC: 100 m) NI LEYENDA EXACTA. ES LA MISMA MALLA QUE 8017 PERO DE 15 cm: PARA ZANJAS DE 1 CABLE (*).",
    "(*) 1035: OJO, COLOR NARANJA Y ALTO 1 m DE LA DESCRIPCION; FORMA DEL OJO Y ESTACAS: PROPORCIONALES. 8038: ANCHO Y COLOR NO LOS DICE."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - CERCO, CINTA Y MALLAS DE ZANJA", "MALLA VIAL 1 m ENTRE ESTACAS · CINTA ARRIBA · MALLA 15 Y 30 cm EXTENDIDAS · ROLLOS")
A = img3d(h, "nobra_senal", 884, 90, 690)
columna(h, A, [("cinta", "1", "CINTA DE PELIGRO 8038"), ("estaca", "", "ESTACA (*)"), ("vial", "2", "MALLA VIAL 1035"), ("rolloCinta", "", "ROLLO CINTA 100 m"), ("rolloVial", "", "ROLLO 1 x 45 m"),
               ("m15rollo", "", "ROLLO MALLA 15"), ("m30", "", "8017 · 30 cm"), ("m15", "3", "1052 · 15 cm"), ("leyenda", "", "LEYENDA")], 1580, 110, 560, lado="izq", paso=34)
bloque(h, 890, 680, "DONDE SE USA", [
    "MALLA VIAL Y CINTA: CERCAR POZOS DE FUNDACION, ZANJAS ABIERTAS Y EL OBRADOR (SEGURIDAD DEL PEATON) MIENTRAS DURA LA OBRA.",
    "MALLA 15 cm: ENTERRADA SOBRE EL CABLE, A 0,30 DEL PISO, EN ZANJAS ANGOSTAS (AP-TC-001); LA DE 30 cm (8017) EN LAS DE 2 O 3 CABLES (*)."], w=740, sz=10, lh=14)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/nobra_senal.mjs). FUENTES: r3d/FUENTES_nobra.md · FUENTES_civil.md")
rotN(h, "MAT-SENAL_SELLADO-3", "MALLA VIAL, CINTA DE PELIGRO", "Y MALLA SUBTERRANEA 15 cm", "CERCO, D1, MALLAS, ZANJA, CINTA, CODIGOS Y 3D", "VARIAS", "INDICADAS · 3D S/E")
guardarC(h, "mat_senal_sellado_3")
