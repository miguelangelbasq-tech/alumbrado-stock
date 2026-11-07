import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk_cab import *
from mk_cab import _circ

h = HojaMat()
COD = [2054, 2055, 2052, 2053, 2051, 2050, 2056, 2057]
h.check_codigos(COD)
AZ, AM = "#2563eb", "#f2c200"
# medidas (*) ilustrativas salvo el Ø del agujero (descripción del pañol)
LT, LCO, W, DA, DCO = 26, 11, 12, 6, 7.5

# ============ PLANTA
h.titulo(40, 62, "PLANTA - PREAISLADO DE OJAL", "MODELO OJAL Ø6 (2054 / 2055) · S/E · ACOTADO SOLO LO QUE DICE EL PAÑOL")
k = 9.0; x0, yc = 80, 215
X = lambda mm: x0 + mm * k
xp = LT - W / 2
h.circ(X(xp), yc, W / 2 * k, "#fff", K, 1.4); h.rect(X(LCO), yc - 2.2 * k, (xp - W / 2 * .9 - LCO) * k, 4.4 * k, "#fff", K, 1.4)
h.ln(X(xp - W / 2 * .9), yc - 2.2 * k + .7, X(xp - W / 2 * .9), yc + 2.2 * k - .7, "#fff", 2)
h.circ(X(xp), yc, DA / 2 * k, "#fff", K, 1.2)
h.path(f"M{X(0)},{yc-DCO/2*k} H{X(LCO*.7)} L{X(LCO)},{yc-2.6*k} V{yc+2.6*k} L{X(LCO*.7)},{yc+DCO/2*k} H{X(0)} Z", "url(#ANSI37)", K, 1.4)
h.ln(X(0) - 10, yc, X(LT) + 12, yc, K, .5, h.EJE); h.ln(X(xp), yc - W / 2 * k - 10, X(xp), yc + W / 2 * k + 10, K, .5, h.EJE)
h.dimH(yc + W / 2 * k + 28, X(xp) - DA / 2 * k, X(xp) + DA / 2 * k, "Ø6", ext=yc)
h.dimH(yc - W / 2 * k - 16, X(0), X(LT), "LARGO (*)", ext=yc - DCO / 2 * k, c=OR)
h.dimV(X(LT) + 22, yc - W / 2 * k, yc + W / 2 * k, "ANCHO (*)", ext=X(xp), c=OR)
h.globo("1", X(3), yc - DCO / 2 * k, X(3), 110); h.globo("2", X(LCO + 4), yc - 2.2 * k, X(LCO + 4) - 30, 110); h.globo("3", X(xp) + DA / 2 * k * .7, yc + DA / 2 * k * .7, 400, 320)

# ============ CORTE A-A del collar
h.titulo(500, 62, "CORTE LONGITUDINAL", "S/E · COLLAR AISLANTE SOBRE EL TUBO")
cx, cy = 520, 215; kc = 9
h.path(f"M{cx},{cy-DCO/2*kc} H{cx+LCO*.7*kc} L{cx+LCO*kc},{cy-2.6*kc} V{cy-1.6*kc} H{cx+5} V{cy-DCO/2*kc+8} Z", "url(#ANSI37)", K, 1)
h.path(f"M{cx},{cy+DCO/2*kc} H{cx+LCO*.7*kc} L{cx+LCO*kc},{cy+2.6*kc} V{cy+1.6*kc} H{cx+5} V{cy+DCO/2*kc-8} Z", "url(#ANSI37)", K, 1)
h.rect(cx + 5, cy - 1.6 * kc, LCO * kc + 40, .5 * kc, "url(#ANSI31)", K, .8); h.rect(cx + 5, cy + 1.1 * kc, LCO * kc + 40, .5 * kc, "url(#ANSI31)", K, .8)
h.flecha_llamada(cx + 30, cy - DCO / 2 * kc + 6, 680, 130, "COLLAR PLASTICO (COLOR)")
h.flecha_llamada(cx + LCO * kc + 20, cy - 1.4 * kc, 680, 160, "TUBO METALICO")
h.flecha_llamada(cx + LCO * kc + 30, cy, 680, 290, "ACA SE ENGARZA EL CABLE")

# ============ D1 termocontraíble
h.titulo(40, 400, "D1 - TERMOCONTRAIBLE PARED FINA 5,0 / 2,5 (2057)", "ESC. 10:1 · ANTES Y DESPUES DE CALENTAR")
for i, (t, dd, x) in enumerate((("ANTES", 5.0, 160), ("DESPUES", 2.5, 420))):
    y = 520; kk = 12
    h.circ(x, y, dd / 2 * kk, "#fff", K, 1.4); h.circ(x, y, dd / 2 * kk - 2.5, "#fff", K, .6)
    h.dimH(y + 50, x - dd / 2 * kk, x + dd / 2 * kk, "Ø" + str(dd).replace(".", ","), ext=y)
    h.txt(x, y - 50, t, 11, 700, K, "middle")
h.path("M230,520 H340", "none", K, 1.4); h.path("M330,514 L342,520 L330,526", "none", K, 1.4); h.txt(285, 510, "CALOR", 10.5, 700, K, "middle")
h.parrafo(540, 470, "SE CONTRAE A LA MITAD (2:1): SELLA LA UNION DEL TERMINAL DE OJAL CON EL CABLE.", 290, 10.5)
h.parrafo(540, 520, "(*) ESPESOR DE PARED Y LARGO DE CORTE: A CONFIRMAR CON EL FABRICANTE.", 290, 10.5, OR)

# ============ tabla
AG = {2054: "Ø6 · AMARILLO · 2,5/6", 2055: "Ø6 · AZUL · 2,5/6", 2052: "B6 · AZUL (*)", 2053: "Ø12 · AMARILLO", 2051: "Ø10 · AMARILLO",
      2050: "Ø8", 2056: "\"012\" (*)", 2057: "5,0 / 2,5"}
y = h.codigos(40, 640, COD, (50, 0, 40), extra_col=("AGUJERO / COLOR", AG, 170), wtot=800, rowh=20)
h.notasM(40, 850, [
    "SOLO LOS DATOS DE LA DESCRIPCION DEL PAÑOL (Ø DEL AGUJERO, COLOR Y SECCION) SON SEGUROS. EL RESTO DEL DIBUJO ES ILUSTRATIVO.",
    "(*) LARGO, ANCHO DE LA PALMA, Ø DEL COLLAR Y ESPESORES: A CONFIRMAR CON EL FABRICANTE.",
    "(*) 2052 «B6 OJAL 800 AZUL 16-14» Y 2056 «OJAL 012»: LA DESCRIPCION NO ACLARA EL Ø DEL AGUJERO. A CONFIRMAR MIDIENDO EN EL PAÑOL.",
    "SON PARA CABLES CHICOS DE COMANDO. SE ENGARZAN CON PINZA PARA PREAISLADOS (*) A CONFIRMAR CUAL HAY EN EL PAÑOL.",
    "FUENTE: DESCRIPCIONES DEL PAÑOL; FICHA «TERMINALES Y PUNTERAS» DE LA APP.",
], 790)

# ============ 3D
h.titulo(890, 62, "VISTA 3D - PREAISLADOS Y TERMOCONTRAIBLE", "OJAL AMARILLO Y AZUL CON SU CABLE · TUBO TERMOCONTRAIBLE")
h.iso(9.0, 1090, 280)
def preais(yy, col):
    h.cil("x", -14, 2, yy, 0, 1.9, "#2b2d33", borde="#000", bw=.4)
    h.solido("x", 0, LCO, _circ(DCO / 2, 30), _circ(2.6, 30), yy, 0, col, borde="#000", bw=.5)
    h.cil("x", LCO, LCO + 3, yy, 0, 1.4, C_EST, metal=True, borde="#555", bw=.4)
    pal = [(LCO + 2, -2.2), (xp - W * .2, -2.2)] + [(xp + W / 2 * math.cos(math.radians(a)), W / 2 * math.sin(math.radians(a))) for a in range(-150, 151, 10)] + [(xp - W * .2, 2.2), (LCO + 2, 2.2)]
    h.solido("z", -.4, .4, [(px, py) for px, py in pal], [(px, py) for px, py in pal], 0, yy, C_EST, tapa=sombra(C_EST, 1.12), metal=True, borde="#555", bw=.5)
    h.F3([(xp + DA / 2 * math.cos(2 * math.pi * q / 36), yy + DA / 2 * math.sin(2 * math.pi * q / 36), .41) for q in range(36)], "#fff", "#555", .6)
preais(14, AZ)
preais(-6, AM)
# termocontraíble (antes de calentar)
h.cil("x", 0, 18, -30, 0, 2.5, "#1f2937", tapa="#4b5563", borde="#000", bw=.5, agujero=(2.2, "#0b0f14"))
h.g3b("1", (4, -6, DCO / 2), 1440, 330, "COLLAR AMARILLO")
h.g3b("2", (xp + W / 2, -6, .4), 1440, 420, "OJAL Ø6 Cu ESTAÑADO")
h.g3b("3", (14, -30, 2.5), 1460, 260, "TERMOCONTR. 5,0/2,5")
h.g3b("4", (4, 14, -DCO / 2), 1060, 540, "COLLAR AZUL")
h.txt(890, 600, "Tubo termocontraíble dibujado negro (*): el color según el que se compre.", 11, 400, OR, "start", INT)
h.bloque(890, 650, "DATOS TECNICOS", [
    "TERMINAL DE OJAL PREAISLADO: TUBO METALICO + COLLAR PLASTICO DE COLOR",
    "AGUJEROS EN EL PAÑOL: Ø6, Ø8, Ø10, Ø12",
    "2054 / 2055: PARA 2,5 A 6 mm²",
    "TERMOCONTRAIBLE PARED FINA 5,0 / 2,5 mm (2:1)",
    "UNIDAD: Un.",
], 360)
h.bloque(1270, 650, "DONDE SE USA", [
    "CABLES CHICOS DE COMANDO DEL TABLERO",
    "TERMOCONTRAIBLE: 1 POR OJAL EN LA ACOMETIDA (PLANILLA EMA, CON EL OJAL 16 mm² 2046)",
    "GUIA «CAJA DE COLUMNA PRFV»",
], 370)
h.rotuloM("MAT-TERMINALES-3", "TERMINALES PREAISLADOS", "Y TERMOCONTRAIBLE", "PLANTA, CORTE, DETALLE Y VISTA 3D", "S/E", "D1 10:1")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_terminales_3.svg"))
print("ok")
