"""MAT-FOTOCONTROL-1 (rev. B) · Fotocontrol 220 V 10 A IP65 (3012), interruptor fotoeléctrico según ETG con base (3031) y zócalo NEMA de 3 contactos (3072).
Plano con FOTO de r3d/piezas/perfiles_protab.mjs; 3D: r3d/out/protab_foto.png (separado del zócalo, cortado a cuarto) y protab_foto_zoc.png (patas y ranuras).
Datos: FICHAS_TEC.fotocontrol (zócalo 3 patas con traba de giro; comanda la bobina del contactor; tabla del pliego; medidas típicas ANSI C136.10 Ø84 × 66),
zócalo de referencia Intermatic K121/K122 (Ø76 = 3", 15 A, 105–480 V, ANSI C136.10), FAMILIAS_MAT.fotocontrol, AP-T-007/008/019."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from protabkit import *

F = PT["FOTO"]; D, H_, bh = F["D"], F["H"], F["base"]["h"]; rT = F["tapa"]["D"] / 2; hT = F["tapa"]["h"]; Z_ = F["zocalo"]
h = nueva3()

# =============== CORTE A MEDIAS ===============
e = 2.3; cx, yz = 250, 330          # yz = cara de apoyo (z = 0 del fotocontrol, separado 30 del zócalo)
h.titulo(40, 62, "VISTA LATERAL - MITAD EN CORTE", "ESC. 2,3:1 · SEPARADO 30 mm DEL ZOCALO · MEDIDAS TIPICAS ANSI C136.10")
v = Vista(h, cx, yz, e)
Ht = H_ - bh + .5
ext = [[rT, bh], [rT, bh + hT * .55], [rT - 3, bh + hT * .8], [rT - 12, bh + hT * .96], [rT - 22, bh + Ht], [0, bh + Ht]]
inn = [[0, bh + Ht - 2.5], [rT - 23, bh + Ht - 2.5], [rT - 14, bh + hT * .96 - 2.5], [rT - 5.2, bh + hT * .8 - 1.5], [rT - 2.5, bh + hT * .55], [rT - 2.5, bh]]
v.poly([[-y, z] for y, z in ext] + [[-y, bh] for y in (0,)], "#fff", 1.5)                                    # mitad izquierda en vista
v.poly(ext + inn, "url(#PLAS)", 1.3)                                                                        # mitad derecha en corte (cáscara)
v.rect(-D / 2, D / 2, 0, bh, "#fff", 1.4); v.rect(0, D / 2, 0, bh, "url(#PLAS2)", 1.2)
v.rect(1, 30, bh + 2, bh + 44, "url(#CU)", .6) if False else v.rect(0, 1.6, bh + 2, bh + 44, "url(#MET)", .6)
v.rect(1.6, 17, bh + 6, bh + 22, "url(#PLAS2)", .8); v.txt = None
v.rect(1.6, 5.6, bh + 7, bh + 21, "none", .4)
v.rect(-D / 2 + 1, -rT - .2, F["ventana"]["z"] - F["ventana"]["h"] / 2, F["ventana"]["z"] + F["ventana"]["h"] / 2, "url(#VID)", .8) if False else None
vz = F["ventana"]["z"]; v.rect(-rT - .6, -rT + 1.2, vz - 13, vz + 13, "url(#VID)", .9)
v.rect(rT - 12, rT - 3, vz - 2.6, vz + 2.6, "#fff", .6); v.rect(rT - 3.4, rT - 2.6, vz - 2.4, vz + 2.4, "#c2562a", .4)
for y in (-15.5, 15.5): v.rect(y - .8, y + .8, -F["pata"]["largo"], 0, "url(#CU)", .8)
v.rect(-.8, .8, -F["pata"]["largo"], 0, "url(#CU)", .5, h.OCULTA)
v.rect(F["zocalo"]["junta"][0], F["zocalo"]["junta"][1] + 4, -1.8, 0, "url(#GOMA)", .5)
zz = -30   # zócalo
v.rect(-Z_["D"] / 2, Z_["D"] / 2, zz - Z_["h"], zz, "#fff", 1.4); v.rect(0, Z_["D"] / 2, zz - Z_["h"], zz, "url(#PLAS2)", 1.2)
v.rect(15.5 - 2.4, 15.5 + 2.4, zz - 7, zz + .1, "#fff", .7); v.rect(15.5 - 1.4, 15.5 + 1.4, zz - 14, zz - 6.6, "url(#CU)", .7)
v.rect(Z_["junta"][0], Z_["junta"][1], zz, zz + 1.2, "url(#GOMA)", .4)
for i, x in enumerate((-9, -3, 3)): v.linea([[x, zz - Z_["h"]], [x, zz - Z_["h"] - 18]], 2.2, K)
v.eje(0, zz - Z_["h"] - 20, 0, bh + Ht + 8)
v.cotaH(-D / 2, D / 2, bh + Ht + 10, "Ø84 (TIPICA)", zext=bh + 2)
v.cotaV(D / 2 + 10, 0, bh + Ht, "66 (TIPICA)", yext=rT)
v.cotaV(-D / 2 - 10, -F["pata"]["largo"], 0, "13 (*)", yext=-16, c=OR)
v.cotaH(-Z_["D"] / 2, Z_["D"] / 2, zz - Z_["h"] - 26, "Ø76 (K121)", zext=zz - Z_["h"])
v.cotaV(Z_["D"] / 2 + 10, zz - Z_["h"], zz, "26 (*)", yext=Z_["D"] / 2, c=OR)
for n, (y, z), (gx, gy) in [("1", (-rT + 6, bh + 45), (60, 150)), ("2", (-rT, vz), (60, 220)), ("3", (-15.5, -8), (60, yz + 30)), ("4", (-Z_["D"] / 2 + 2, zz - 12), (60, yz + 110)),
                            ("5", (.8, bh + 30), (470, 140)), ("6", (10, bh + 14), (470, 190)), ("7", (rT - 8, vz), (470, 240)), ("8", (25, -1), (470, yz + 4)),
                            ("9", (15.5, zz - 10), (470, yz + 70)), ("10", (-3, zz - Z_["h"] - 12), (470, yz + 150))]:
    h.globo(n, *v.p(y, z), gx, gy, r=9)

# =============== VISTA DE ABAJO (PATAS) Y DE ARRIBA (ZOCALO) ===============
def patas(cx_, cy_, k, zocalo=False):
    h.circ(cx_, cy_, (Z_["D"] if zocalo else D) / 2 * k, "#fff", K, 1.4)
    h.circ(cx_, cy_, (Z_["junta"][1] + (0 if zocalo else 4)) * k, "none", K, .5); h.circ(cx_, cy_, Z_["junta"][0] * k, "none", K, .5)
    h.circ(cx_, cy_, (Z_["junta"][0] + Z_["junta"][1] + (0 if zocalo else 4)) / 2 * k, "none", "#777", (Z_["junta"][1] - Z_["junta"][0] + (0 if zocalo else 4)) * k * .9, 'stroke-opacity=".25"')
    for p in F["patas"]:
        a0 = p["a"] - p["ancho"] / 2 - (2 if zocalo else 0); a1 = p["a"] + p["ancho"] / 2 + (F["giro"] if zocalo else 0)
        r0, r1 = (15.5 - 2.4, 15.5 + 2.4) if zocalo else (15.5 - .8, 15.5 + .8)
        pts = [(r1 * math.cos(math.radians(a)), r1 * math.sin(math.radians(a))) for a in [a0 + (a1 - a0) * i / 16 for i in range(17)]]
        pts += [(r0 * math.cos(math.radians(a)), r0 * math.sin(math.radians(a))) for a in [a1 - (a1 - a0) * i / 16 for i in range(17)]]
        sg = -1 if not zocalo else 1   # vista de abajo: espejo
        h.path("M" + " L".join(f"{cx_ + sg * x * k:.1f},{cy_ - y * k:.1f}" for x, y in pts) + " Z", "#555" if zocalo else "url(#CU)", K, .8)
        am = math.radians(p["a"]); lx, ly = cx_ + sg * 25 * math.cos(am) * k, cy_ - 25 * math.sin(am) * k
        h.txt(lx, ly + 4, p["n"], 9, 700, K, "middle")
k = 1.9
h.titulo(560, 62, "PATAS Y ZOCALO", "ESC. 1,9:1 · PATAS VISTAS DE ABAJO · ENTRA Y GIRA")
patas(640, 220, k); patas(780, 340, k, True)
h.txt(640, 220 + D / 2 * k + 18, "FOTOCONTROL: 3 PATAS CURVAS", 8.5, 700, K, "middle")
h.txt(780, 340 + Z_["D"] / 2 * k + 18, "ZOCALO 3072: 3 RANURAS", 8.5, 700, K, "middle")
h.path(f"M{780 + 52},{340 - 22} A57,57 0 0,1 {780 + 22},{340 - 52}", "none", OR, 1.2); h.txt(780 + 50, 340 - 54, f"{F['giro']}° (*)", 9, 700, OR)
h.dimV(640 + D / 2 * k + 12, 220 - 15.5 * k, 220 + 15.5 * k, "Ø31 (*)", ext=640 + 15.5 * k, c=OR)
h.txt(560, 450, "CONTACTOS: L (NEGRO) · N (BLANCO) · CARGA (ROJO) (*)", 8.5, 400, OR)

# =============== D1 CONEXION ===============
X, Y = 560, 500
h.titulo(X - 20, 470, "D1 - COMO COMANDA EL TABLERO", "ESQUEMA · CIERRA LA BOBINA DEL CONTACTOR")
Y += 20
h.ln(X, Y, X + 270, Y, K, 1.2); h.txt(X - 4, Y + 4, "L", 10.5, 700, K, "end")
h.ln(X, Y + 100, X + 270, Y + 100, K, 1.2); h.txt(X - 4, Y + 104, "N", 10.5, 700, K, "end")
h.rect(X + 50, Y + 28, 56, 38, "#fff", K, 1.2); h.txt(X + 78, Y + 52, "FC", 11, 700, K, "middle")
h.ln(X + 66, Y, X + 66, Y + 28, K, 1); h.ln(X + 90, Y + 66, X + 90, Y + 100, K, 1)
h.ln(X + 106, Y + 47, X + 180, Y + 47, K, 1)
h.rect(X + 180, Y + 34, 40, 26, "#fff", K, 1.2); h.txt(X + 200, Y + 52, "KM", 10, 700, K, "middle"); h.ln(X + 220, Y + 47, X + 250, Y + 47, K, 1); h.ln(X + 250, Y + 47, X + 250, Y + 100, K, 1)
h.txt(X + 143, Y + 40, "CARGA → A1-A2", 8.5, 400, G, "middle"); h.txt(X + 135, Y + 120, "CON SELECTORA AUTOMATICO-MANUAL (MAT-COMANDO-1)", 8.5, 400, G, "middle")

# =============== TABLAS ===============
yt = h.tabla(40, 670, [(52, "c", True), (560, "l", False), (40, "c", False), (148, "l", False)],
             [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO"]] + [cat(c, 84) + [d] for c, d in ((3012, "CON SU BASE"), (3031, "SEGUN ETG, CON BASE"), (3072, "NEMA 3 CONTACTOS"))],
             rowh=16, titulo="CODIGOS DEL PAÑOL (3)", colores=colorOR)
yd = h.tabla(40, yt + 24, [(130, "l", False), (260, "l", False)],
             [("DATO", "VALOR (PLIEGO MUNIC. DE CORDOBA)"), ("ENCIENDE CON", "10 lux (± 30 %)"), ("APAGA CON", "60 lux o menos"), ("RETARDO", "10 a 90 s"), ("CORRIENTE", "10 A minimo"),
              ("CONSUMO", "4 W maximo"), ("TENSION", "195 a 270 V"), ("MANIOBRAS", "4000 o mas"), ("TEMPERATURA", "-30 a 50 °C"), ("PROTECCION", "IP65 · IRAM AADL J 20-24 / 25")], rowh=15, titulo="DATOS TECNICOS")
yu = bloque(h, 450, yt + 24, "DONDE SE USA", [
    "AP-T-019: ARRIBA DEL APOYO DEL TABLERO AEREO, CON SU JUEGO DE SEMIABRAZADERAS (ETG).",
    "AP-T-003: EN LA 1.ª COLUMNA MAS CERCANA AL TABLERO, CABLE DE COMANDO 3 x 1,5.",
    "AP-T-007 / 008: COMANDA EL CONTACTOR. BARRIO (AP-TC-055): FOTOCONTROL + ZOCALO."], w=390, sz=10, lh=13.5)
yr = rayadosRef(h, 450, yu + 8, ["PLAS", "PLAS2", "CU", "GOMA", "VID"], cols=3, dx=130)
notasW(h, 40, max(yd, yr) + 14, [
    "COTAS EN mm. Ø84 x 66 = MEDIDAS TIPICAS DE LA FICHA (ANSI C136.10); CADA MARCA TIENE LAS SUYAS. ZOCALO Ø76: INTERMATIC K121/K122.",
    "(*) LARGO, RADIO Y ANCHO DE LAS PATAS, ANGULO DE TRABA, ALTO DEL ZOCALO Y COLOR DE LOS CABLES: A CONFIRMAR (LA NORMA NO ES PUBLICA).",
    "(*) PENDIENTE: AP-T-007 / 008 PIDEN ELECTROMECANICO (IRAM AADL J20-24/25); LOS DATOS GARANTIZADOS SON DE UNO ELECTRONICO.",
    "(*) INTERIOR (PLACA, RELE, VARISTOR, FOTOCELULA): ESQUEMATICO."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - FOTOCONTROL ARRIBA DE SU ZOCALO", "SEPARADOS PARA VER LAS PATAS · FOTOCONTROL CORTADO A CUARTO")
A = img3d(h, "protab_foto", 920, 84, 470)
columna(h, A, [("tapa", "1", "CUBIERTA UV (*)"), ("ventana", "2", "VENTANA"), ("celula", "7", "FOTOCELULA"), ("pcb", "5", "PLACA DE CIRCUITO"), ("rele", "6", "RELE 10 A (*)"),
               ("mov", "", "VARISTOR (*)"), ("base", "", "BASE CON JUNTA"), ("pata", "3", "PATA (3)"), ("junta", "8", "JUNTA DEL ZOCALO"), ("zocalo", "4", "ZOCALO 3072"),
               ("negro", "10", "CABLES L · N · CARGA")], 1420, 110, 560, paso=36)
h.titulo(890, 720, "PATAS Y RANURAS", "EL FOTOCONTROL DADO VUELTA AL LADO DEL ZOCALO")
A2 = img3d(h, "protab_foto_zoc", 890, 740, 520)
columna(h, A2, [("pataN", "", "PATA N"), ("pataL", "", "PATA L"), ("pataC", "", "PATA CARGA"), ("pie", "", "PIE DE TRABA"), ("ranura", "9", "RANURA CURVA"), ("contacto", "", "CONTACTO"),
                ("zocalo", "", "ZOCALO")], 1440, 750, 1000, paso=34)
rotuloMat(h, "MAT-FOTOCONTROL-1", "FOTOCONTROL 220 V 10 A", "IP65 · ZOCALO NEMA", "LATERAL EN CORTE, PATAS, ZOCALO, D1, CODIGOS Y 3D", "2,3:1 · 1,9:1", "3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_fotocontrol_1.svg"))
