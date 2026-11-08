"""MAT-COMANDO-2 (rev. B) · Comando por horario y a distancia (altas del equipo): 3094 interruptor horario ABB, 3100 interruptor horario genérico,
3098 Sonoff «SMART SWITCH MINI R4», 3099 «SWITCH MATE» (Sonoff S-MATE).
Plano: carcasa TM de perfiles_protab.mjs (sin tocarla) y SONOFF / SMATE / HOR de r3d/piezas/perfiles_nelec.mjs; 3D: r3d/out/nelec_com2.png.
Datos: ABB AT1 (ficha 2CSC440007B0201: 1 módulo, cuarzo, 230 V, 16 A resistiva / 4 A inductiva, 1 NA), Sonoff MINIR4 (39,5 × 33 × 16,8, 10 A, 100-240 V,
bornes L in / N in / L out / S1 / S2) y S-MATE (54 × 45 × 24, pila CR2032). Fuentes: r3d/FUENTES_nelec.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nelekit import *

S = TM; H_ = S["H"]; SO, SM = PN["SONOFF"], PN["SMATE"]
h = hojaN()

# =============== 1. FRENTES DE LOS HORARIOS ===============
e = 2.2; FY = 112
h.titulo(40, 62, "FRENTE - HORARIOS PARA RIEL DIN", "ESC. 2,2:1 · ALTO 85 Y CUELLO 45 (DIN 43880) (*)")
XA, ZA = frenteMod(h, 70, FY, e, S, 1, "", "", W=17.5, manija=False)
h.rect(XA(1.75), ZA(62), 14 * e, 24 * e, "#fff", K, 1)
for i in range(7): h.ln(XA(2.5), ZA(60 - i * 3.3), XA(15), ZA(60 - i * 3.3), K, .7 if i % 3 else 1.4)
h.circ(XA(8.75), ZA(30), 2.8 * e, "url(#PLAS2)", K, .9); h.txt(XA(8.75), ZA(70) + 4, "ABB", 8, 700, K, "middle")
h.dimH(FY + H_ * e + 20, XA(0), XA(17.5), "17,5", ext=FY + H_ * e + 4)
h.txt(XA(8.75), FY + H_ * e + 40, "3094 ABB (AT1 (*))", 9, 700, K, "middle")
XG, ZG = frenteMod(h, 170, FY, e, S, 3, "", "", W=17.5, manija=False)
cx, cz = XG(26.25), ZG(46)
h.circ(cx, cz, 19 * e, "#fff", K, 1.2); h.circ(cx, cz, 15 * e, "#fff", K, .6); h.circ(cx, cz, 6 * e, "url(#PLAS2)", K, .9)
for i in range(48):
    a = 2 * math.pi * i / 48; h.ln(cx + 15 * e * math.cos(a), cz + 15 * e * math.sin(a), cx + 18.5 * e * math.cos(a), cz + 18.5 * e * math.sin(a), K, .9 if i % 2 else .4)
for i, t in enumerate(["0", "6", "12", "18"]):
    a = -math.pi / 2 + i * math.pi / 2; h.txt(cx + 10 * e * math.cos(a), cz + 10 * e * math.sin(a) + 3.5, t, 8, 700, K, "middle")
h.dimH(FY + H_ * e + 20, XG(0), XG(52.5), "52,5 (*)", ext=FY + H_ * e + 4, c=OR)
h.txt(XG(26.25), FY + H_ * e + 40, "3100 GENERICO 24 h (*)", 9, 700, K, "middle")
h.dimV(56, FY, FY + H_ * e, "85", ext=68)
h.globo("1", XA(8.75), ZA(50), 142, FY + 60, r=9); h.globo("2", XA(8.75), ZA(30), 142, FY + 130, r=9)
h.globo("3", cx + 17 * e, cz, cx + 170, FY + 20, r=9); h.globo("4", cx, cz, cx + 170, FY + 60, r=9)

# =============== 2. PERFIL ===============
vp = Vista(h, 572, 300, 2.0)
h.titulo(530, 62, "PERFIL (LOS DOS)", "COMO UN MODULAR · PROF. (*)")
modPerfil(vp, S, cables=False, manija=False)
vp.cotaH(0, S["Dn"], -22, "69 (*)", zext=-1, c=OR)

# =============== 3. SONOFF: ARRIBA Y COSTADO ===============
DY = 404; es = 2.6
h.titulo(40, DY, "MINI R4 (3098) Y S-MATE (3099)", "ESC. 2,6:1 · DE ARRIBA Y DE COSTADO · MEDIDAS DEL FABRICANTE")
def caja(ox, oy, D, nombre):
    W, P, Hh = D["W"], D["P"], D["H"]
    h.a(f'<rect x="{ox:.1f}" y="{oy:.1f}" width="{W*es:.1f}" height="{P*es:.1f}" rx="{3*es:.1f}" fill="#fff" stroke="{K}" stroke-width="1.5"/>')
    n = len(D["bornes"]); paso = min(5.0, (W - 6) / n); x0 = W / 2 - paso * (n - 1) / 2
    for i, b in enumerate(D["bornes"]):
        xb = ox + (x0 + i * paso) * es; h.circ(xb, oy + (P - 4) * es, 1.6 * es, "#fff", K, .7)
        h.txt(xb, oy + (P - 8.6 - (i % 2) * 3.2) * es, b, 6.5, 700, K, "middle", INT)
    h.txt(ox + W / 2 * es, oy + P * .38 * es, nombre, 11, 700, K, "middle")
    h.dimH(oy - 12, ox, ox + W * es, str(W).replace(".", ","), ext=oy - 2)
    h.dimV(ox - 14, oy, oy + P * es, str(P).replace(".", ","), ext=ox - 2)
    yl = oy + P * es + 18
    h.a(f'<rect x="{ox:.1f}" y="{yl:.1f}" width="{W*es:.1f}" height="{Hh*es:.1f}" rx="{3*es:.1f}" fill="#fff" stroke="{K}" stroke-width="1.5"/>')
    for i in range(n): h.rect(ox + (x0 + i * paso - paso / 2 + .4) * es, yl + (Hh * .45) * es, (paso - .8) * es, Hh * .5 * es, "#111", K, .3)
    h.dimV(ox + W * es + 14, yl, yl + Hh * es, str(Hh).replace(".", ","), ext=ox + W * es + 2)
caja(70, DY + 60, SO, "MINI R4"); caja(250, DY + 60, SM, "S-MATE")

# =============== 4. D1 · CONEXION ===============
h.titulo(470, DY, "D1 - COMO SE CONECTAN", "SEGUN EL MANUAL DEL MINI R4 · ESQUEMA")
ox, oy = 490, DY + 40
h.ln(ox, oy + 10, ox + 340, oy + 10, K, 1); h.txt(ox - 4, oy + 14, "L", 10, 700, K, "end")
h.ln(ox, oy + 150, ox + 340, oy + 150, K, 1); h.txt(ox - 4, oy + 154, "N", 10, 700, K, "end")
h.rect(ox + 110, oy + 52, 110, 50, "#fff", K, 1.3); h.txt(ox + 165, oy + 72, "MINI R4", 10, 700, K, "middle"); h.txt(ox + 165, oy + 88, "10 A · 100-240 V", 8, 400, K, "middle")
for x, t in ((ox + 125, "L in"), (ox + 150, "N in"), (ox + 205, "L out")): h.txt(x, oy + 46, t, 7.5, 700, K, "middle")
h.ln(ox + 125, oy + 10, ox + 125, oy + 52, K, .9); h.ln(ox + 150, oy + 52, ox + 150, oy + 30, K, .9); h.path(f"M{ox+150},{oy+30} L{ox+90},{oy+30} L{ox+90},{oy+150}", "none", K, .9)
h.path(f"M{ox+205},{oy+52} L{ox+205},{oy+30} L{ox+290},{oy+30} L{ox+290},{oy+60}", "none", K, .9)
h.rect(ox + 275, oy + 60, 30, 30, "#fff", K, 1); h.txt(ox + 290, oy + 80, "KM", 8.5, 700, K, "middle"); h.ln(ox + 290, oy + 90, ox + 290, oy + 150, K, .9)
h.txt(ox + 312, oy + 70, "O LA", 7.5); h.txt(ox + 312, oy + 80, "CARGA", 7.5)
for x, t in ((ox + 150, "S1"), (ox + 190, "S2")): h.txt(x, oy + 118, t, 7.5, 700, K, "middle")
h.path(f"M{ox+150},{oy+102} L{ox+150},{oy+128} L{ox+160},{oy+128}", "none", K, .9); h.path(f"M{ox+190},{oy+102} L{ox+190},{oy+128} L{ox+180},{oy+128}", "none", K, .9)
h.ln(ox + 160, oy + 128, ox + 178, oy + 121, K, 1.2); h.txt(ox + 170, oy + 142, "LLAVE (OPCIONAL)", 7.5, 400, G, "middle")
for i, l in enumerate(["S1-S2: SOLO A UNA LLAVE; NUNCA A NEUTRO NI A TIERRA (MANUAL).", "TERMOMAGNETICA DE 10 A ANTES (MANUAL).",
                       "S-MATE: VA DETRAS DE UNA LLAVE COMUN, CON PILA CR2032;", "MANDA LA ORDEN POR RADIO AL MINI R4 (eWeLink-Remote).",
                       "EN EL TABLERO DE ALUMBRADO: USO A CONFIRMAR (*)."]):
    h.txt(ox, oy + 172 + i * 13, l, 8.5, 400, OR if "(*)" in l else K)

# =============== 5. TABLA ===============
dat = {3094: ("DIN 1 MOD. (*)", "16 A RES. / 4 A IND.", "HORARIO DE RESPALDO DEL FOTOCONTROL"), 3100: ("DIN 3 MOD. (*)", "16 A (*)", "HORARIO DE RESPALDO (*)"),
       3098: ("39,5x33x16,8", "10 A · 2400 W", "COMANDO A DISTANCIA (WI-FI) (*)"), 3099: ("54x45x24", "PILA CR2032", "LLAVE COMUN → MINI R4 (*)")}
filas = [["COD.", "DESCRIPCION (TAL CUAL EL PAÑOL)", "UN.", "FORMATO", "CORRIENTE", "PARA QUE"]]
for c in [3094, 3100, 3098, 3099]:
    r = catN(c, 36); filas.append([r[0], r[1], r[2], *dat[c]])
yt = tablaN(h, 40, 700, [(40, "c", True), (232, "l", False), (34, "c", False), (110, "l", False), (128, "l", False), (266, "l", False)], filas, "CODIGOS DEL PAÑOL (4) - ALTAS DEL EQUIPO")
notasW(h, 40, yt + 22, [
    "COTAS EN mm. MINI R4: 39,5 x 33 x 16,8 Y S-MATE: 54 x 45 x 24 (FABRICANTE / MINORISTAS; UNO DA 51 x 44,5 x 24). ABB AT1: 1 MODULO (17,5).",
    "(*) 3094 NO DICE EL MODELO: SE DIBUJA EL ABB AT1 (ANALOGICO, 1 MODULO). EN LA APP EL TABLERO AEREO USA EL «AT1-R» (CON RESERVA DE MARCHA).",
    "(*) 3100 «GENERICO»: SE DIBUJA UN ANALOGICO DE 24 h DE 3 MODULOS CON SEGMENTOS. MARCA, MEDIDAS Y CORRIENTE A CONFIRMAR.",
    "(*) ALTO, PROFUNDIDAD Y TAMBOR DE LOS HORARIOS: COMO UN MODULAR DIN 43880 (CARCASA DE MAT-TERMOMAGNETICAS-1).",
    "(*) «SWITCH MATE» = SONOFF S-MATE (EL UNICO PRODUCTO CON ESE NOMBRE). UNIDADES TAL CUAL EL PAÑOL: «UN» Y «Un.».",
    "FUENTES: r3d/FUENTES_nelec.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - LOS CUATRO", "HORARIOS EN EL RIEL NS35 · ADELANTE EL MINI R4 Y EL S-MATE")
A = img3d(h, "nelec_com2", 895, 84, 610)
columna(h, A, [("abb", "", "ABB AT1 (3094)"), ("tambor", "1", "TAMBOR DE SEGMENTOS"), ("modo", "2", "PERILLA AUTO / ON (*)"), ("gen", "", "GENERICO 24 h (3100)"),
               ("dial", "3", "DIAL CON SEGMENTOS"), ("seg", "4", "EJE / HORA (*)"), ("riel", "", "RIEL NS35"), ("cable", "", "L · N (AEA)"),
               ("smate", "", "S-MATE (3099)"), ("bornesM", "", "BORNES DEL S-MATE"), ("sonoff", "", "MINI R4 (3098)"), ("bornesS", "", "BORNES DEL MINI R4")],
        1500, 100, 580, paso=32)
bloque(h, 890, 640, "DATOS TECNICOS", ["ABB AT1: CUARZO, ±1 s POR DIA, 230 V, 16 A RESISTIVA / 4 A INDUCTIVA, 1 NA (FICHA ABB).",
                                        "MINI R4: 100-240 V, 10 A MAX. RESISTIVA, WI-FI 2,4 GHz, BORNES L in · N in · L out · S1 · S2.",
                                        "S-MATE: PILA CR2032, SIN NEUTRO; BORNES L · L1-L3 · S · S1-S3 PARA EMPALMAR."], w=740, sz=9.5, lh=13)
bloque(h, 890, 740, "DONDE SE USA", ["HORARIO: ENCIENDE POR HORA CUANDO NO HAY FOTOCONTROL O COMO RESPALDO (FICHA DE LA APP, TABLERO AEREO).",
                                       "MINI R4 / S-MATE: PRENDER A DISTANCIA (PRUEBAS, OFICINA, GALPON) (*)."], w=740, sz=9.5, lh=13)
rayadosRef(h, 890, 840, ["PLAS", "PLAS2", "MET"], cols=3, dx=200)
rotuloMat(h, "MAT-COMANDO-2", "INTERRUPTORES HORARIOS", "Y SMART SWITCH SONOFF", "FRENTES, PERFIL, CAJAS, D1, CODIGOS Y 3D", "2,2:1 · 2,6:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardar(h, "mat_comando_2")
