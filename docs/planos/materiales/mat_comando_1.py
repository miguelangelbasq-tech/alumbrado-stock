"""MAT-COMANDO-1 (rev. B) · Contactor tripolar 25 A (bobina 220 V) por dentro, selectora automático-manual y llaves encapsuladas.
Plano con los perfiles de r3d/piezas/perfiles_protab.mjs (CT); 3D: r3d/out/protab_ct.png y protab_ct_sel.png.
Datos: FICHAS_TEC.comando (Schneider LC1D25 45 × 85 × 92; AC-1 40 A, AC-3 25 A; bobina 220 V; 1NA + 1NC; selectora y llaves),
FAMILIAS_MAT.comando, AP-T-003, EN 50005 (marcas de bornes), catálogo. Fuentes: r3d/FUENTES_protab.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from protabkit import *

S = CT; H_, D_, Dr, Dn = S["H"], S["D"], S["Dr"], S["Dn"]; c0, c1 = S["cuello"]
h = nueva3()

# =============== FRENTE ===============
e = 2.0; FX, FY = 66, 112
h.titulo(40, 62, "FRENTE", "ESC. 2:1 · BORNES EN 50005")
X, Z = frenteCT(h, FX, FY, e)
h.dimH(FY + H_ * e + 20, X(0), X(45), "45", ext=FY + H_ * e + 4)
h.dimV(FX - 16, FY, FY + H_ * e, "85", ext=FX - 2)
lineaCorte(h, X(22.5), Z(H_) - 16, X(22.5), Z(0) + 16, "A")

# =============== PERFIL ===============
vp = Vista(h, 250, FY + H_ * e, e)
h.titulo(225, 62, "PERFIL", "SOBRE RIEL NS35")
modPerfil(vp, S, manija=False)
vp.cotaH(0, D_, -20, "92", zext=-1)
vp.cotaH(0, Dr, -30, "60 (*)", zext=-1, c=OR)
vp.cotaV(D_ + 8, c0, c1, "65 (*)", yext=Dn + .5, c=OR)

# =============== CORTE A-A ===============
ec = 3.3; vc = Vista(h, 520, 438, ec)
h.titulo(470, 62, "CORTE A-A", "ESC. 3,3:1 · POLO DEL MEDIO · BOBINA SIN TENSION (*)")
ctCorte(vc)
vc.cotaH(0, D_, -22, "92", zext=-1)
vc.cotaV(D_ + 2.5, 0, H_, "85", yext=D_)
N = S["nucleo"]; B = S["bobina"]
for n, (y, z), (gx, gy) in [("1", (6.5, 62), (476, 150)), ("2", (16, 31), (476, 330)), ("3", (22.5, 39.3), (476, 290)), ("4", (33.5, 62), (476, 190)),
                            ("5", (50, 42.5), (850, 300)), ("6", (69.6, 50), (850, 260)), ("7", (67.2, 57.8), (850, 220)), ("8", (55, 60.2), (850, 180)),
                            ("9", (40, 45.5), (476, 240)), ("10", (43, 76), (850, 140)), ("11", (S["cable"]["y"], -12), (476, 410)), ("12", (-4, 50), (476, 370))]:
    h.globo(n, *vc.p(y, z), gx, gy, r=9)

# =============== ESQUEMA DE COMANDO ===============
SX, SY = 40, 410
h.titulo(SX, SY, "ESQUEMA DE COMANDO", "S/E · EL FOTOCONTROL CIERRA LA BOBINA; LA SELECTORA PRUEBA DE DIA (*)")
y0 = SY + 40; xl = SX + 24
h.ln(xl, y0, xl, y0 + 150, K, 1.4); h.txt(xl, y0 - 6, "L", 11, 700, K, "middle")
xn = SX + 410; h.ln(xn, y0, xn, y0 + 150, K, 1.4); h.txt(xn, y0 - 6, "N", 11, 700, K, "middle")
ym = y0 + 58
h.ln(xl, ym, xl + 34, ym, K, 1.2); h.circ(xl + 38, ym, 3, "#fff", K, 1); h.ln(xl + 38, ym, xl + 74, ym - 20, K, 1.4)
h.circ(xl + 80, ym - 24, 3, "#fff", K, 1); h.circ(xl + 80, ym + 24, 3, "#fff", K, 1)
h.txt(xl + 22, ym + 50, "SELECTORA (3056 / 3048)", 9, 400); h.txt(xl + 88, ym - 28, "AUT", 9, 700); h.txt(xl + 88, ym + 34, "MAN", 9, 700)
h.ln(xl + 83, ym - 24, xl + 130, ym - 24, K, 1.2); h.rect(xl + 130, ym - 37, 60, 26, "#fff", K, 1.2); h.txt(xl + 160, ym - 20, "FOTOC.", 9, 700, K, "middle")
h.ln(xl + 190, ym - 24, xl + 240, ym - 24, K, 1.2); h.txt(xl + 130, ym - 44, "EN LA 1.ª COLUMNA (AP-T-003)", 8.5, 400, G)
h.ln(xl + 83, ym + 24, xl + 240, ym + 24, K, 1.2); h.ln(xl + 240, ym - 24, xl + 240, ym + 24, K, 1.2); h.ln(xl + 240, ym, xl + 276, ym, K, 1.2)
h.rect(xl + 276, ym - 12, 40, 24, "#fff", K, 1.4); h.ln(xl + 276, ym + 12, xl + 316, ym - 12, K, 1)
h.txt(xl + 296, ym - 17, "A1     A2", 8.5, 700, OR, "middle"); h.txt(xl + 296, ym + 28, "KM 220 V", 9, 700, K, "middle"); h.ln(xl + 316, ym, xn, ym, K, 1.2)
yp = y0 + 128
for i in range(3):
    xx = xl + 280 + i * 22; h.ln(xx, yp - 18, xx, yp - 6, K, 1); h.ln(xx, yp - 6, xx + 9, yp + 6, K, 1.2); h.ln(xx, yp + 8, xx, yp + 20, K, 1)
h.path(f"M{xl + 296},{ym + 32} V{yp - 2}", "none", K, .6, h.OCULTA); h.txt(xl + 270, yp + 4, "SALIDAS DE ALUMBRADO", 8.5, 400, K, "end")

# =============== D1 SELECTORA Y LLAVE ===============
LX, LY = 470, 530
h.titulo(LX, LY, "D1 - SELECTORA Y LLAVE", "ESC. 1:1 · MEDIDAS (*)")
cx, cy = LX + 70, LY + 100; k = 1.6
h.circ(cx, cy, 15 * k, "#fff", K, 1.4); h.circ(cx, cy, 11.4 * k, "#fff", K, .8)
h.a(f'<rect x="{cx - 3*k:.1f}" y="{cy - 11*k:.1f}" width="{6*k:.1f}" height="{22*k:.1f}" rx="3" fill="url(#PLAS2)" stroke="{K}" stroke-width="1" transform="rotate(-45 {cx} {cy})"/>')
h.txt(cx - 30, cy - 30, "AUT", 9, 700, K, "middle"); h.txt(cx + 30, cy - 30, "MAN", 9, 700, K, "middle")
h.dimH(cy + 15 * k + 14, cx - 15 * k, cx + 15 * k, "Ø30 (*)", ext=cy, c=OR)
h.txt(cx, cy + 15 * k + 34, "AGUJERO Ø22 EN LA PUERTA (*)", 8.5, 400, OR, "middle"); h.txt(cx, cy + 15 * k + 46, "1 NA (VERDE) + 1 NC (ROJO)", 8.5, 400, K, "middle")
bx, by = LX + 170, LY + 40; k2 = 1.3
h.rect(bx, by, 80 * k2, 80 * k2, "#fff", K, 1.4, 'rx="8"'); h.rect(bx + 27 * k2, by + 18 * k2, 26 * k2, 44 * k2, "#fff", K, 1)
h.rect(bx + 30 * k2, by + 21 * k2, 20 * k2, 38 * k2, "url(#PLAS)", K, .7)
for (xx, yy) in ((8, 8), (72, 72)): h.circ(bx + xx * k2, by + yy * k2, 3 * k2, "#fff", K, .8)
h.dimH(by - 10, bx, bx + 80 * k2, "80 (*)", ext=by - 2, c=OR); h.dimV(bx + 80 * k2 + 14, by, by + 80 * k2, "80 (*)", ext=bx + 80 * k2 + 2, c=OR)
h.txt(bx + 40 * k2, by + 80 * k2 + 16, "LLAVE ENCAPSULADA (3047 / 3048)", 8.5, 400, K, "middle")

# =============== TABLAS ===============
filas = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "DATO (FICHA)"]]
dd = {"3005": "45 x 85 x 92 (LC1D25)", "3006": "25 A · AC1 · 1 NA", "3056": "AUTOMATICO - MANUAL", "3048": "AUTOMATICO - MANUAL", "3047": "LUZ INTERNA DEL TABLERO"}
for c in (3005, 3006, 3056, 3048, 3047):
    r = cat(c, 64); filas.append([r[0], r[1], r[2], dd[str(c)]])
yt = h.tabla(40, 728, [(52, "c", True), (470, "l", False), (40, "c", False), (238, "l", False)], filas, rowh=16, titulo="CODIGOS DEL PAÑOL (5)", colores=colorOR)
ydat = bloque(h, 40, yt + 22, "DATOS TECNICOS", [
    "CONTACTOR TRIPOLAR 25 A, BOBINA 220 V 50 Hz, 1 NA + 1 NC (3005).",
    "AC-1: 40 A · AC-3: 25 A (400 V) (SCHNEIDER LC1D25).",
    "CON TENSION EN A1-A2 LA E MOVIL SE PEGA A LA FIJA Y EL PUENTE CIERRA LOS 3 POLOS.",
    "LA ESPIRA DE SOMBRA EVITA QUE VIBRE (ZUMBIDO) EN CORRIENTE ALTERNA."], w=390, sz=10, lh=13.5)
yu = bloque(h, 450, yt + 22, "DONDE SE USA", [
    "TABLERO DE MEDICION Y COMANDO: EL FOTOCONTROL CIERRA LA BOBINA AL ANOCHECER.",
    "AP-T-003: FOTOCONTROL EN LA 1.ª COLUMNA, CABLE DE COMANDO 3 x 1,5 AL TABLERO.",
    "SELECTORA AUT - MAN: PROBAR EL ALUMBRADO DE DIA. LLAVE 3047: LUZ INTERNA."], w=390, sz=10, lh=13.5)
notasW(h, 40, max(ydat, yu) + 6, [
    "COTAS EN mm: 45 x 85 x 92 = SCHNEIDER LC1D25 (FICHA). OTRAS VERSIONES DEL LC1D25 (BOBINA EN CC) TIENEN 101 DE PROFUNDIDAD.",
    "(*) ESCALON DEL FRENTE (60 / 65), ELECTROIMAN, PORTA-CONTACTOS Y POSICION DE A1-A2: PROPORCIONALES, A CONFIRMAR.",
    "(*) SELECTORA Y LLAVE ENCAPSULADA: MEDIDAS Y FORMA A CONFIRMAR CON EL FABRICANTE. ESQUEMA DE COMANDO: VER EL UNIFILAR DE CADA PLAZA.",
    "3050 (TOMACORRIENTE) Y 3071 (TOMA 10 A) ESTAN EN LA FICHA PERO SON DE LA FAMILIA «TABLERO»."], w=800, lh=14)
rayadosRef(h, 40, 1086, ["LAM", "BOB", "CU", "PLAS2"], cols=4, dx=205)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - CONTACTOR 25 A ENTERO Y CORTADO", "EL DE ADELANTE CORTADO POR EL POLO DEL MEDIO · MISMOS NUMEROS QUE EL CORTE A-A")
A = img3d(h, "protab_ct", 895, 84, 600)
columna(h, A, [("nucleoF", "1", "E FIJA (CHAPAS)"), ("bobina", "2", "BOBINA 220 V"), ("espira", "3", "ESPIRA DE SOMBRA"), ("nucleoM", "4", "E MOVIL"),
               ("porta", "5", "PORTA-CONTACTOS"), ("puente", "6", "PUENTE"), ("pastilla", "7", "PASTILLAS DE PLATA"), ("fijo", "8", "CONTACTO FIJO"),
               ("resorte", "9", "RESORTE DE RETORNO"), ("jaula", "10", "JAULA"), ("riel", "12", "RIEL NS35"), ("A1", "", "BOBINA A1 / A2"),
               ("aux", "", "AUXILIAR 13-14 / 21-22"), ("marca", "", "AC-3 25 A · AC-1 40 A")], 1505, 100, 560, paso=30)
h.titulo(890, 596, "SELECTORA 22 mm Y LLAVE ENCAPSULADA", "LA SELECTORA VA EN LA PUERTA DEL TABLERO (*)")
A2 = img3d(h, "protab_ct_sel", 895, 622, 470)
columna(h, A2, [("cabezal", "", "PALANCA AUT / MAN"), ("aro", "", "ARO CROMADO"), ("chapa", "", "PUERTA"), ("llave", "", "TECLA"), ("rotulo", "", "LLAVE 3047 / 3048"), ("caja", "", "CAJA DE APLICAR (*)")],
        1390, 640, 960, paso=28)
rotuloMat(h, "MAT-COMANDO-1", "CONTACTOR 25 A", "SELECTORA Y LLAVES", "FRENTE, PERFIL, CORTE A-A, ESQUEMA, D1, CODIGOS Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_comando_1.svg"))
