"""MAT-VINCULOS-2 · Vínculo octogonal (6016) y medio vínculo octogonal (6013), AP-C-011.
Datos: FICHAS_TEC.vinculos (tabla: 6016 / 6013 → AP-C-011), FAMILIAS_MAT.vinculos, catálogo del pañol, hoja aprobada AP-C-011
(ítems 10.21 / 10.22, 4 y 2 artefactos, brazo «s/plano»: la calculadora usa 0,40). La app NO tiene medidas de esta pieza: todo es ESQUEMA (*)."""
from ilukit import *
h = nueva(); m = h.m
AP = 250; LB = 400                      # apotema del aro (*) y brazo (*) → 650 del eje (*)

def octo(cx, cy, q, medio=False):
    R = AP / math.cos(math.radians(22.5)) * q
    pts = [(cx + R * math.cos(math.radians(22.5 + 45 * i)), cy - R * math.sin(math.radians(22.5 + 45 * i))) for i in range(8)]
    if medio:   # medio: la mitad del aro (lado de los 2 brazos) + cierre recto
        pts = [p for p in pts if p[1] <= cy + 1]
        h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in [(cx + AP / math.cos(math.radians(22.5)) * q * 0 + AP * q, cy)] + pts + [(cx - AP * q, cy)]), "none", K, 2.2)
        h.ln(cx - AP * q, cy, cx + AP * q, cy, K, 1.2)
    else:
        h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z", "none", K, 2.2)
    angs = (0, 180) if medio else (0, 90, 180, 270)
    for g in (0, 90, 180, 270) if not medio else (0, 90, 180):
        dx, dy = math.cos(math.radians(g)), -math.sin(math.radians(g))
        h.ln(cx + dx * 13 * q * 4, cy + dy * 13 * q * 4, cx + dx * AP * q, cy + dy * AP * q, OR, 1.4)     # rayos (*)
    for g in angs:
        dx, dy = math.cos(math.radians(g)), -math.sin(math.radians(g)); nx, ny = -dy, dx; w = 30.15 * q
        a0, a1 = AP * q, (AP + LB) * q
        h.path(f"M{cx+dx*a0+nx*w:.1f},{cy+dy*a0+ny*w:.1f} L{cx+dx*a1+nx*w:.1f},{cy+dy*a1+ny*w:.1f} L{cx+dx*a1-nx*w:.1f},{cy+dy*a1-ny*w:.1f} L{cx+dx*a0-nx*w:.1f},{cy+dy*a0-ny*w:.1f} Z", "#fff", K, 1.1)
        lx, ly = cx + dx * (a1 + 20), cy + dy * (a1 + 20)
        if abs(dx) > .5: h.rect(lx - 17, ly - 10, 34, 20, "#fff", K, .6, 'stroke-dasharray="3 2"')
        else: h.rect(lx - 10, ly - 17, 20, 34, "#fff", K, .6, 'stroke-dasharray="3 2"')
    h.circ(cx, cy, 57 * q * 1.4, "#fff", K, 1.3); h.circ(cx, cy, 2, K, K, 0)
    return R

# ======================= VISTA DESDE ARRIBA · OCTOGONAL (1:20 → 0,2 px/mm)
q = .2; cx, cy = 245, 285
h.titulo(40, 62, "VISTA DESDE ARRIBA - OCTOGONAL (6016)", "ESC. 1:20 - ESQUEMA (*) - 4 ARTEFACTOS")
R = octo(cx, cy, q)
h.dimH(cy + 34, cx, cx + (AP + LB) * q, "650 (*)", ext=cy + 8, c=OR)
h.txt(cx + 60, cy - 60, "APOTEMA 250 (*)", 9.5, 400, OR)
corteMarca(h, cx - (AP + LB) * q - 70, cy, cx + (AP + LB) * q + 70, cy, "A")
h.globo("1", cx + R * .92 * math.cos(math.radians(60)), cy - R * .92 * math.sin(math.radians(60)), cx + 150, cy - 175)
h.globo("2", cx + AP * q * .6, cy, cx + 150, cy - 140, OR); h.globo("3", cx, cy - (AP + 200) * q, cx - 150, cy - 175)
h.globo("4", cx - 6, cy + 8, cx - 150, cy + 110)

# ======================= VISTA DESDE ARRIBA · MEDIO (1:20)
h.titulo(500, 62, "MEDIO OCTOGONAL (6013)", "ESC. 1:20 - ESQUEMA (*) - 2 ARTEFACTOS")
octo(670, 300, q, medio=True)
h.txt(670, 420, "LOS 2 BRAZOS OPUESTOS · 180°", 10, 700, K, "middle")

# ======================= CORTE A-A (lateral) 1:20
h.titulo(40, 470, "CORTE A-A - LATERAL", "ESC. 1:20 - POR EL EJE Y 2 BRAZOS - ESQUEMA (*)")
cx2, yp = 245, 600
h.rect(cx2 - 57 * q, yp, 114 * q, 60, "url(#STEEL)", K, 1)                          # adaptador Ø114 del poste PRFV 10 m (*)
h.rect(cx2 - 90 * q, yp + 60, 180 * q, 30, "#fff", K, 1.1); h.txt(cx2, yp + 104, "POSTE PRFV 10 m (*)", 9, 700, K, "middle")
h.rect(cx2 - 65 * q, yp - 200 * q, 130 * q, 260 * q, "#fff", K, 1.4)                # capuchón (*)
for sx in (-1, 1):
    h.ln(cx2 + sx * 65 * q, yp - 150 * q, cx2 + sx * AP * q, yp - 150 * q - 4, OR, 1.6)      # rayo (*)
    h.rect(min(cx2 + sx * AP * q, cx2 + sx * (AP + LB) * q), yp - 150 * q - 6 - 30 * q - 4, LB * q, 60 * q, "#fff", K, 1.1)
    h.rect(cx2 + sx * AP * q - 4, yp - 150 * q - 20, 8, 28, "#111", K, .5)            # aro en corte
h.ln(cx2, yp - 90, cx2, yp + 100, K, .4, h.EJE)
h.dimV(cx2 - (AP + LB) * q - 18, yp - 150 * q - 4, yp, "≈150 (*)", ext=cx2 - 30, c=OR)
h.globo("3", cx2 + (AP + 200) * q, yp - 150 * q - 10, cx2 + 170, yp - 80); h.globo("1", cx2 + AP * q, yp - 150 * q - 18, cx2 + 140, yp - 110)
h.globo("4", cx2 + 8, yp - 20, cx2 + 120, yp + 40)

# ======================= TABLAS (columna derecha del plano)
h.tabla(475, 470, [(62, "c", True), (120, "l", False), (90, "c", False), (93, "c", False)],
        [("CODIGO", "VINCULO", "ARTEFACTOS", "ITEM VIEJO"), ("6016", "OCTOGONAL", "4", "10.21"), ("6013", "MEDIO OCTOGONAL", "2", "10.22")],
        rowh=20, titulo="VARIANTES (AP-C-011)")
textoBloque(h, 475, 580, "DONDE SE USA", [
    "· AP-C-011: columnas altas y nodos viales.",
    "· Se dibuja sobre el poste PRFV 10 m",
    "   (adaptador Ø114) (*): confirmar columna.",
    "· Sin ítem propio en el Itemizado 2026:",
    "   cómo se cobra, a confirmar (*).",
    "· Calculadora: brazo 0,40 para la subida."], sz=10, dy=15)
y2 = h.codigos(40, 740, [6016, 6013])
h.datos(40, y2 + 30, [("MATERIAL", "acero galvanizado (*)"), ("ARO", "octogonal, apotema 250 (*)"),
        ("BRAZOS", "caño Ø60,3 (*), 400 desde el aro (*)"), ("FIJACION LUM.", "bulón pasante 4019 + 4038"),
        ("FUSIBLES", "4 art.: 4 A + 4 A · 2 art.: 2 A + 2 A")], w=420, c1=110)
h.lista(485, y2 + 30, "QUE LLEVA (POR VINCULO: OCT. · 1/2)", [
    "· Luminaria LED 6010: 4 · 2",
    "· Bulón pasante 4019 + 4038: 4 · 2",
    "· Cable 3×1,5 (6001): uno por artefacto",
    "· Prensacable 3/4\" (5029): 4 · 2"], sz=10.5, dy=16)
h.notas(40, 1040, [
    "(*) ESQUEMA: LA APP NO TIENE MEDIDAS DEL AP-C-011 (BRAZO «S/PLANO»). ARO, RAYOS, BRAZOS Y ALTURAS: A CONFIRMAR CON EL PLANO.",
    "OCTOGONAL = 4 ARTEFACTOS (ITEM 10.21, 6016) · MEDIO OCTOGONAL = 2 ARTEFACTOS (ITEM 10.22, 6013).",
    "LOS CABLES 3×1,5 SUBEN POR ADENTRO DEL POSTE Y DEL ADAPTADOR; CADA UNO VA POR SU RAYO Y SU BRAZO HASTA EL EQUIPO (*).",
    "LOS RAYOS (NARANJA) NO FIGURAN EN NINGUN DATO DE LA APP (*). FUENTE: LP 21478 (AP-C-011), CATALOGO DEL PAÑOL, HOJA AP-C-011."])

# ======================= 3D
def vinculo3d(medio=False):
    m.cyl([0, 0, -500], [0, 0, -100], 90, "prfv", n=30, pat="fibra"); m.render()
    m.cyl([0, 0, -100], [0, 0, 0], 57, "galv", n=28); m.render()
    m.cyl([0, 0, -60], [0, 0, 200], 65, "galv", n=30, capmat="#b8c2ca"); m.render()
    Ro = AP / math.cos(math.radians(22.5))
    sides = range(8) if not medio else [i for i in range(8) if math.sin(math.radians(22.5 + 45 * i + 22.5)) >= -0.01]
    angs_r = (0, 90, 180, 270) if not medio else (0, 90, 180)
    for g in angs_r:
        dx, dy = math.cos(math.radians(g)), math.sin(math.radians(g))
        m.cyl([dx * 60, dy * 60, 150], [dx * AP, dy * AP, 150], 14, "galv", n=12, seg=2)
    for i in range(8):
        a0, a1 = math.radians(22.5 + 45 * i), math.radians(22.5 + 45 * (i + 1))
        p0 = [Ro * math.cos(a0), Ro * math.sin(a0), 150]; p1 = [Ro * math.cos(a1), Ro * math.sin(a1), 150]
        if medio and (p0[1] < -1 or p1[1] < -1): continue
        m.cyl(p0, p1, 16, "galv", n=12, seg=2)
    if medio: m.cyl([AP, 0, 150], [-AP, 0, 150], 14, "galv", n=12, seg=3)
    m.render()
    for g in ((0, 180) if medio else (0, 90, 180, 270)):
        dx, dy = math.cos(math.radians(g)), math.sin(math.radians(g))
        m.cyl([dx * AP, dy * AP, 150], [dx * (AP + LB), dy * (AP + LB), 150 + LB * math.tan(math.radians(5))], 30.15, "galv", n=18, seg=3, capmat="#c9d1d8")
    m.render()
h.titulo(890, 62, "VISTA 3D - VINCULO OCTOGONAL (6016)", "GALVANIZADO (*) · ESQUEMA: FORMA A CONFIRMAR CON EL PLANO (*)")
h.iso(.27, 1170, 360); vinculo3d()
h.g3("1", (AP * .7, -AP * .7, 150), 1380, 170, "ARO OCTOGONAL (*)", NV)
h.g3("2", (0, -150, 150), 1380, 210, "RAYOS (*)", OR)
h.g3("3", (0, -(AP + 250), 160), 1380, 250, "BRAZO CAÑO Ø60,3 (*)", NV)
h.g3("4", (0, 0, 120), 1380, 470, "CAPUCHON SOBRE ADAPTADOR Ø114", NV)
h.titulo(890, 640, "VISTA 3D - MEDIO OCTOGONAL (6013)", "2 BRAZOS OPUESTOS · ESQUEMA (*)")
h.iso(.27, 1170, 860); vinculo3d(medio=True)
h.txt(1450, 880, "LUMINARIAS NO DIBUJADAS:", 10, 700, G, "start", INT); h.txt(1450, 895, "VER MAT-LUMINARIA_LED-1", 10, 400, G, "start", INT)
h.rotulo(890, h.H - 150, 750, "MAT-VINCULOS-2", "VINCULO OCTOGONAL", "Y MEDIO OCTOGONAL", "ESQUEMA (*): ARRIBA, CORTE, CODIGOS Y 3D (AP-C-011)", "1:20", "3D S/E")
guardar(h, "mat_vinculos_2")
