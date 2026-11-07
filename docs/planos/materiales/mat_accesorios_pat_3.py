import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matkit import Ficha, K, G, OR, NV, CAD, MONO, INT
h = Ficha(); m = h.m
# secciones: (nombre, códigos, sección mm², Ø conductor aprox, Ø exterior aprox, aislado, material)
CAB = [("1×2,5 V/A", "7008", 2.5, 2.0, 3.6, True, "cu"), ("1×6 V/A", "7009", 6, 3.1, 4.9, True, "cu"),
       ("1×10 V/A", "7011 · 7012 · 1032", 10, 4.1, 6.0, True, "cu"), ("Cu DESNUDO 35", "1013", 35, 7.6, 7.6, False, "cu"),
       ("Ac-Cu DESNUDO 1×25", "1012", 25, 6.5, 6.5, False, "accu")]
# ================= CORTES (5:1)
h.titulo(40, 62, "CORTES DE LOS CABLES DE PAT", "ESC. 11:1 - SECCION NOMINAL DEL CATALOGO · Ø Y HILOS APROXIMADOS (*)")
k = 11.0; xs = [100, 250, 400, 560, 730]; cy = 215
for (nom, cods, sec, dc, de, ais, mat), cx in zip(CAB, xs):
    if ais: h.circ(cx, cy, de / 2 * k, "url(#PLAS)", K, 1.2)
    rh = dc / 2 * k / 3
    pts = [(0, 0)] + [(2 * rh * math.cos(math.radians(60 * j)), 2 * rh * math.sin(math.radians(60 * j))) for j in range(6)]
    for j, (px, py) in enumerate(pts):
        fill = "url(#STEEL)" if (mat == "accu" and j == 0) else "url(#cuH)"
        h.circ(cx + px, cy + py, rh, fill, K, .6)
        if mat == "accu": h.circ(cx + px, cy + py, rh, "none", K, 1.4)   # capa de cobre sobre cada hilo de acero
    h.dimH(cy + 58, cx - de / 2 * k, cx + de / 2 * k, f"≈Ø{str(de).replace('.', ',')} (*)", ext=cy + de / 2 * k + 2, c=OR)
    h.txt(cx, cy - 62, nom, 11, 700, K, "middle"); h.txt(cx, cy - 48, cods, 10, 400, G, "middle")
    h.txt(cx, cy + 82, f"{str(sec).replace('.', ',')} mm²", 11, 700, K, "middle", MONO)
h.txt(40, 324, "7 HILOS EN TODOS (CLASE 2) (*) · EL ACERO-COBRE: HILOS DE ACERO CON CAPA DE COBRE.", 10.5, 400, OR)
# ================= VISTA DEL 1×10 V/A
h.titulo(40, 360, "VISTA - CABLE 1×10 V/A PELADO PARA OJAL", "ESC. 2:1 - LARGO PELADO SEGUN EL TERMINAL (*)")
vx, vy = 70, 430; k2 = 3.0
h.rect(vx, vy - 3 * k2, 140 * k2 / 1.0 if False else 330, 6 * k2, "#fff", K, 1.2)
for i in range(12): h.path(f"M{vx+10+i*28},{vy-3*k2} l12,{6*k2}", "none", K, .5)   # vetas V/A (en blanco y negro)
h.rect(vx + 330, vy - 2.05 * k2, 60, 4.1 * k2, "url(#cuH)", K, 1)
h.dimH(vy - 3 * k2 - 18, vx + 330, vx + 390, "≈ 20 (*)", ext=vy - 3 * k2 - 2, c=OR)
h.dimV(vx - 20, vy - 3 * k2, vy + 3 * k2, "≈Ø6 (*)", ext=vx - 2, c=OR)
h.txt(vx + 420, vy - 6, "AISLACION VERDE-AMARILLO", 10.5); h.txt(vx + 420, vy + 10, "COBRE: VA AL OJAL O A LA PUNTERA", 10.5)
# códigos
y2 = h.codigos(40, 490, [7011, 7012, 1032, 7009, 7008, 1013, 1012],
               extra={7011: "10 mm² (rollo)", 7012: "10 mm² (rollo 200 m)", 1032: "= 7010 (mismo material)", 7009: "6 mm²", 7008: "2,5 mm²", 1013: "electrodo / malla", 1012: "electrodo / malla"})
y3 = h.datos(40, y2 + 32, [("AISLADOS", "Cu, aislación verde-amarillo"), ("NORMA 1×10", "IRAM NM 247-3 (7010)"), ("DESNUDOS", "Cu 35 mm² · acero-Cu 1×25"),
    ("UNIDAD", "metros (CLAUDE.md §11.3)"), ("MISMO MATERIAL", "7010 = 1032 (otro código)"), ("HILOS / Ø", "no están en la app (*)")], w=410, c1=140)
h.lista(480, y2 + 32, "DONDE SE USA", [
    "· 1×10 V/A: de la jabalina al borne, bulón",
    "   o barra (AP-TC-005, TC-PRFV-02, AP-T-007).",
    "   Cálculo: 10 m por tablero + 7 m por circuito",
    "   (PRFV) o 4 m por columna (metálica).",
    "· 1×2,5 V/A: tierra del artefacto, va con el",
    "   10 mm² en la banderita (AP-TC-006).",
    "· Desnudos 35 / Ac-Cu 25: electrodos o mallas.",
    "· 1×6 V/A: uso a confirmar (*).",
])
h.notas(40, 1010, [
    "COTAS EN mm. MANDA LA COTA. LOS CORTES MUESTRAN LA SECCION NOMINAL DEL CATALOGO.",
    "(*) Ø EXTERIOR, Ø DEL CONDUCTOR, HILOS Y LARGO PELADO: APROXIMADOS DESDE LA SECCION. A CONFIRMAR CON EL FABRICANTE.",
    "1032 «CABLE V y A 10 mm (PLAZA-MUNICIPALIDAD)» ES EL MISMO MATERIAL QUE 7010 (CLAUDE.md §11.3): NO SE UNEN CODIGOS.",
    "(*) USO DEL 1×6 V/A (7009) Y DE LOS DESNUDOS EN ESTA OBRA: NO ESTA DEFINIDO EN LAS FICHAS. PREGUNTAR.",
    "LOS CABLES SE CARGAN SIEMPRE EN METROS. 7011 / 7012 SON ROLLOS PERO EL CATALOGO LOS LLEVA EN m.",
    "FUENTE: DESCRIPCIONES DEL PAÑOL; FICHA «CABLES DE PUESTA A TIERRA»; GUIA PAT; CLAUDE.md §11.3.",
])
# ================= 3D PUNTAS DE CABLE
h.titulo(890, 62, "VISTA 3D - LOS CINCO CABLES, PUNTA PELADA", "AISLACION VERDE-AMARILLO · COBRE · ACERO RECUBIERTO DE COBRE")
h.iso(3.6, 1170, 250)
for i, (nom, cods, sec, dc, de, ais, mat) in enumerate(CAB):
    y = i * 15; rh = dc / 2 / 3
    if ais:
        m.cyl([0, y, 0], [60, y, 0], de / 2, "verde", n=18, seg=6, capmat="verde")
        m.render()
        for kk in range(5):
            a = h.P(4 + kk * 12, y + de / 2 * .7, de / 2 * .7); b = h.P(10 + kk * 12, y + de / 2 * .7, de / 2 * .7); h.ln(a[0], a[1], b[0], b[1], "#f2d21e", 3)
    x0 = 60 if ais else 0
    for j in range(7):
        px, py = (0, 0) if j == 0 else (2 * rh * math.cos(math.radians(60 * j)), 2 * rh * math.sin(math.radians(60 * j)))
        matj = "galv" if (mat == "accu" and j == 0) else "cobre"
        m.cyl([x0, y + px, py], [80, y + px, py], rh, "cobre", n=10, seg=1, capmat=("galv" if mat == "accu" else "cobre"))
    m.render()
    h.g3(str(i + 1), (80, y, 0), 1450, 130 + i * 50, f"{nom} ({cods})")
# ================= 3D ROLLO
h.titulo(890, 560, "ROLLO DE CABLE 1×10 V/A (7012 · 200 m)", "SE COMPRA EN ROLLO Y SE CARGA EN METROS")
h.iso(.75, 1180, 800)
for kk in range(6):
    m.ring([0, 0, kk * 12], [1, 0, 0], [0, 1, 0], [0, 0, 1], 110, 185, 0, 11, 0, 360, "verde", n=48)
    m.render()
    for a in range(0, 360, 20):
        p1 = h.P(185 * math.cos(math.radians(a)), 185 * math.sin(math.radians(a)), kk * 12 + 6)
        p2 = h.P(185 * math.cos(math.radians(a + 8)), 185 * math.sin(math.radians(a + 8)), kk * 12 + 6)
        if math.cos(math.radians(a + 4)) + math.sin(math.radians(a + 4)) > .15: h.ln(p1[0], p1[1], p2[0], p2[1], "#f2d21e", 3)
m.cyl([160, 0, 66], [340, 60, 0], 3, "verde", n=10, seg=4)
m.render()
h.g3("6", (0, 185, 40), 1450, 700, "ROLLO 1×10 V/A 7012 (200 m)")
h.g3("7", (300, 47, 15), 1450, 760, "PUNTA DEL ROLLO")
h.rotulo(890, h.H - 150, 750, "MAT-ACCESORIOS_PAT-3", "CABLES DE", "PUESTA A TIERRA", "CORTES, VISTA, DATOS Y 3D", "11:1 / 2:1", "3D S/E")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_accesorios_pat_3.svg")); print("ok")
