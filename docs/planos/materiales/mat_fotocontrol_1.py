"""MAT-FOTOCONTROL-1 · Fotocontrol 220 V 10 A IP65 (3012), interruptor fotoeléctrico según ETG con base (3031) y zócalo (3072).
Datos: FICHAS_TEC.fotocontrol (zócalo 3 patas con traba de giro, comanda la bobina del contactor; tabla del pliego: 10 lux ±30 %, ≤ 60 lux,
10–90 s, 10 A, 4 W, 195–270 V, ≥ 4000 maniobras, −30 a 50 °C; medidas típicas ANSI C136.10 Ø84 × 66), plano() de la ficha (vista lateral Ø84 / 66,
ventana de la fotocélula, zócalo NEMA 3 patas), FAMILIAS_MAT.fotocontrol (pendiente electromecánico vs electrónico, AP-T-007/008)."""
from ilukit import *
h = nueva(); m = h.m

# ======================= VISTA LATERAL (1:1 → 2,4 px/mm)
e = 2.4; cx, yz = 300, 400           # yz = cara de apoyo sobre el zócalo
h.titulo(40, 62, "VISTA LATERAL (CORTE A MEDIAS)", "ESC. 1:1 (×2,4) - COTAS EN mm - MEDIDAS TIPICAS ANSI C136.10")
D, H = 84, 66
h.path(f"M{cx-D/2*e},{yz} L{cx-D/2*e},{yz-(H-14)*e} Q{cx-D/2*e},{yz-H*e} {cx-D/2*e+14*e},{yz-H*e} L{cx},{yz-H*e} L{cx},{yz} Z", "#fff", K, 1.5)
h.path(f"M{cx},{yz} L{cx},{yz-H*e} L{cx+D/2*e-14*e},{yz-H*e} Q{cx+D/2*e},{yz-H*e} {cx+D/2*e},{yz-(H-14)*e} L{cx+D/2*e},{yz} Z", "url(#PLAS)", K, 1.5)
h.path(f"M{cx+D/2*e-3*e},{yz-(H-14)*e} L{cx+D/2*e-3*e},{yz-6*e} L{cx+16*e},{yz-6*e} L{cx+16*e},{yz-(H-14)*e} Z", "#fff", K, .7)   # interior
h.rect(cx + 20 * e, yz - 46 * e, 14 * e, 18 * e, "#fff", K, .8)                                   # placa / relé (*)
h.rect(cx - D / 2 * e + 2, yz - 44 * e, 4, 20 * e, "#3a4a5a", K, .7)                              # ventana fotocélula
h.rect(cx - 50 * e, yz, 100 * e, 8 * e, "#fff", K, 1.2)                                           # base / brida (*)
for x in (-14, 0, 14): h.rect(cx + x * e - 2, yz + 8 * e, 4, 14 * e, "url(#BRZ)", K, .8)       # 3 patas
h.rect(cx - 52 * e, yz + 8 * e, 104 * e, 26 * e, "none", K, .8, h.OCULTA)                         # zócalo (*)
h.ln(cx, yz - H * e - 16, cx, yz + 40 * e, K, .4, h.EJE)
h.dimH(yz - H * e - 22, cx - D / 2 * e, cx + D / 2 * e, "Ø84 (TIPICA)", ext=yz - H * e + 4)
h.dimV(cx + D / 2 * e + 30, yz - H * e, yz, "66 (TIPICA)", ext=cx + D / 2 * e + 2)
h.dimV(cx + 52 * e + 18, yz + 8 * e, yz + 34 * e, "(*)", ext=cx + 52 * e + 2, c=OR)
h.globo("1", cx - 20 * e, yz - 50 * e, 60, 150); h.globo("2", cx - D / 2 * e + 4, yz - 34 * e, 60, 260)
h.globo("3", cx + 2, yz + 18 * e, 60, yz + 60); h.globo("4", cx + 40 * e, yz + 24 * e, 480, yz - 20)
h.txt(76, 155, "CUBIERTA DE POLICARBONATO UV (*)", 9.5, 400, OR); h.txt(76, 265, "VENTANA DE LA FOTOCELULA", 9.5, 400)
h.txt(76, yz + 64, "3 PATAS (CONTACTOS)", 9.5, 400); h.txt(466, yz - 16, "ZOCALO 3072", 9.5, 400, K, "end")

# ======================= VISTA DE ABAJO · PATAS NEMA 3 (esquema)
h.titulo(500, 62, "VISTA DE ABAJO - 3 PATAS", "ZOCALO NEMA 3 PATAS CON TRABA DE GIRO (ESQUEMA (*))")
bx, by = 665, 250
h.circ(bx, by, 50 * e * .9, "#fff", K, 1.4); h.circ(bx, by, 42 * e * .9, "none", K, .6, h.OCULTA)
for g, lbl, c in ((90, "N", "#f2f2f2"), (210, "L", "#222"), (330, "CARGA", "#c62828")):
    a = math.radians(g); px, py = bx + 30 * e * .9 * math.cos(a), by - 30 * e * .9 * math.sin(a)
    w, t = 15, 4
    pts = [(-w / 2, -t / 2), (w / 2, -t / 2), (w / 2, t / 2), (-w / 2, t / 2)]
    rr = [rot2(x, y, -(g + 90 + 15)) for x, y in pts]
    h.a('<polygon points="' + " ".join(f"{px + x * e:.1f},{py + y * e:.1f}" for x, y in rr) + '" fill="url(#BRZ)" stroke="#111" stroke-width="1"/>')
    h.txt(bx + 62 * e * .9 * math.cos(a) * .9, by - 62 * e * .9 * math.sin(a) * .9 + 4, lbl, 10.5, 700, K, "middle")
h.path(f"M{bx-30},{by+70} A80,80 0 0,0 {bx+30},{by+70}", "none", OR, 1); flecha(h, bx + 22, by + 72, bx + 32, by + 66, OR)
h.txt(bx, by + 118, "SE ENCHUFA Y SE GIRA PARA TRABAR", 9.5, 700, K, "middle")
h.txt(bx, by + 132, "UBICACION Y COLOR DE BORNES: TIPICOS (*)", 9, 400, OR, "middle")

# ======================= D1 · CONEXION EN EL TABLERO
h.titulo(500, 420, "D1 · COMO COMANDA EL TABLERO", "ESQUEMA - ENCIENDE LA BOBINA DEL CONTACTOR")
X, Y = 520, 470
h.ln(X, Y, X + 300, Y, K, 1.2); h.txt(X - 4, Y + 4, "L", 10.5, 700, K, "end")
h.ln(X, Y + 110, X + 300, Y + 110, K, 1.2); h.txt(X - 4, Y + 114, "N", 10.5, 700, K, "end")
h.rect(X + 60, Y + 30, 60, 40, "#fff", K, 1.2); h.txt(X + 90, Y + 55, "FC", 11, 700, K, "middle")
h.ln(X + 80, Y, X + 80, Y + 30, K, 1); h.ln(X + 100, Y + 70, X + 100, Y + 110, K, 1)
h.ln(X + 120, Y + 50, X + 200, Y + 50, K, 1)
h.rect(X + 200, Y + 36, 40, 28, "#fff", K, 1.2); h.txt(X + 220, Y + 55, "KM", 10, 700, K, "middle"); h.ln(X + 240, Y + 50, X + 270, Y + 50, K, 1); h.ln(X + 270, Y + 50, X + 270, Y + 110, K, 1)
h.txt(X + 160, Y + 30, "CARGA → BOBINA A1-A2", 9, 400, G, "middle")
h.txt(X + 150, Y + 132, "CON SELECTORA AUTOMATICO-MANUAL (TABLERO)", 9, 400, G, "middle")

# ======================= TABLAS
y2 = h.codigos(40, 625, [3012, 3031, 3072], extra={3012: "con su base", 3031: "según ETG, con base", 3072: "zócalo NEMA 3 patas"}, wx=150)
h.tabla(40, y2 + 30, [(150, "l", False), (270, "l", False)],
        [("DATO", "VALOR (PLIEGO MUNICIPALIDAD DE CORDOBA)"), ("ENCIENDE CON", "10 lux (± 30 %)"), ("APAGA CON", "60 lux o menos"),
         ("RETARDO", "10 a 90 s"), ("CORRIENTE", "10 A mínimo"), ("CONSUMO", "4 W máximo"), ("TENSION", "195 a 270 V"),
         ("MANIOBRAS", "4000 o más"), ("TEMPERATURA", "−30 a 50 °C"), ("PROTECCION", "IP65 · IRAM AADL J 20-24 / 25")],
        rowh=19, titulo="DATOS TECNICOS")
textoBloque(h, 485, y2 + 30, "DONDE SE USA", [
    "· AP-T-019: arriba del apoyo del tablero aéreo,",
    "   con su propio juego de semiabrazaderas (ETG).",
    "· AP-T-007 / 008: comanda el contactor.",
    "· Barrio (AP-TC-055): variante fotocontrol +",
    "   zócalo cuando se enciende sin piloto.",
    "· Guía «Acometida aérea»."], sz=10, dy=15)
h.notas(40, 1040, [
    "COTAS EN mm. Ø84 × 66 SON MEDIDAS TIPICAS (ANSI C136.10) QUE DA LA FICHA: CADA MARCA TIENE LAS SUYAS.",
    "(*) PENDIENTE: AP-T-007 / 008 PIDEN FOTOCONTROL ELECTROMECANICO (IRAM AADL J20-24/25); LOS DATOS GARANTIZADOS, ELECTRONICO.",
    "(*) MEDIDAS DEL ZOCALO, MATERIAL DE LA CUBIERTA Y POSICION/COLOR DE LAS PATAS: A CONFIRMAR CON EL FABRICANTE.",
    "FUENTE: ETG MUNICIPALIDAD DE CORDOBA (2014), ANSI C136.10, LP 21478 (AP-T-007 / 008 / 019), CATALOGO DEL PAÑOL."])

# ======================= 3D
def foto(m, z0=0, zocalo=True, cuerpo=True):
    if zocalo:
        m.cyl([0, 0, z0 - 40], [0, 0, z0 - 6], 52, "pvcg", n=40, capmat="#b9bec3"); m.render()
        for g in (90, 210, 330):
            a = math.radians(g); m.box(30 * math.cos(a) - 7, 30 * math.cos(a) + 7, 30 * math.sin(a) - 2, 30 * math.sin(a) + 2, z0 - 6, z0 - 5, "#222222", edge="#000")
        m.render()
    if cuerpo:
        b = z0 + 30
        for g in (90, 210, 330):
            a = math.radians(g); m.box(30 * math.cos(a) - 7, 30 * math.cos(a) + 7, 30 * math.sin(a) - 2, 30 * math.sin(a) + 2, b - 22, b, "bronce", edge="#5a4012")
        m.render()
        m.cyl([0, 0, b], [0, 0, b + 8], 50, "gris", n=40, capmat="#9aa0a6"); m.render()
        m.cyl([0, 0, b + 8], [0, 0, b + 60], 42, "#d9dde1", n=40, seg=1, capmat="#e8ebee"); m.render()
        m.cyl([0, 0, b + 60], [0, 0, b + 74], 42, "#d9dde1", n=40, r1=30, seg=1, capmat="#eef0f2"); m.render()
        ventanaZ(m, 42, 30, b + 36, 30, 34, "#2c3f52"); m.render()
h.titulo(890, 62, "VISTA 3D - FOTOCONTROL SOBRE SU ZOCALO", "SEPARADOS PARA VER LAS 3 PATAS · CUBIERTA CLARA, VENTANA DE LA FOTOCELULA")
h.iso(1.9, 1190, 600); foto(m, 0, zocalo=True, cuerpo=False); foto(m, 50, zocalo=False, cuerpo=True)
h.g3("1", (30, 30, 130), 1440, 200, "FOTOCONTROL 3012 / 3031", NV)
h.g3("2", (36, 21, 120), 1440, 260, "VENTANA DE LA FOTOCELULA", NV)
h.g3("3", (20, 20, 66), 1440, 420, "3 PATAS DE BRONCE (*)", NV)
h.g3("4", (36, 36, -20), 1440, 560, "ZOCALO NEMA 3 PATAS (3072)", NV)
h.rotulo(890, h.H - 150, 750, "MAT-FOTOCONTROL-1", "FOTOCONTROL 220 V 10 A", "IP65 · CON ZOCALO", "LATERAL, PATAS, CONEXION, CODIGOS, DATOS Y 3D", "1:1 (×2,4)", "3D S/E")
guardar(h, "mat_fotocontrol_1")
