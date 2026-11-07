"""Generador de las hojas AP-T-002, AP-T-003, AP-T-007 (TT) y AP-T-008 (TN-S): tablero de plaza a nivel.
Datos: fichas de Normas AP-T-002/003/007/008, TABLERO_NIVEL y ESQUEMA_TIERRA (calculadora), cómputo «Tablero para esquema TT/TN-S»
(calc. L20480), FICHAS_TEC (termomagnético iC60N 18 mm/polo x 85 x 78,5; diferencial iID 4P 72 x 91 x 73,5; contactor LC1D25 45 x 85 x 92;
NH00 79 x 58 x 30; BPN 6 paso 8,2 x 50; riel NS35 x 7,5; fotocontrol 220 V 10 A IP65), AP-TC-007 (base) y CLAUDE.md §11.
Todo lo que no está (disposición interior, medidas de caja de toma, medidor, barra, selectora, etc.) va en naranja con (*)."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT, CORES

MAR, NEG, ROJ, CEL = CORES[0][0], CORES[1][0], CORES[2][0], CORES[3][0]
VA = "#2e9d4a"; AMA = "#e8c21a"; GRI = "#9ea4aa"; CU = "#c87533"
FASES = [MAR, NEG, ROJ]
GW, GH, GD = 785, 830, 320            # gabinete AP-T-002 (ficha y calculadora): ancho x alto x fondo
RAILS = [380, 490, 600, 700]          # (*) altura de los 4 rieles (centro, medido desde arriba del gabinete)
RU0, RU1 = (GW - 500) / 2, (GW + 500) / 2   # riel DIN de 500 (ficha: cuatro barras de 50 cm)
CT = (40, 40, 360, 250)               # (*) caja de toma primaria EPEC (u0, v0, u1, v1)
ME = (470, 40, 690, 310)              # (*) medidor EPEC
BAR = (230, 770, 410, 790)            # (*) barra de PAT
PVC_U, PAT_U, PEAD_U = 192.5, 322.5, [502.5, 622.5, 732.5]   # entradas por el piso (u del gabinete) = base x 250 / 380 / 560 / 680 / 790


def sh(hexc, f):
    hh = hexc.lstrip("#"); r, g, b = (int(hh[i:i + 2], 16) for i in (0, 2, 4))
    if f >= 1: r, g, b = (int(v + (255 - v) * (f - 1)) for v in (r, g, b))
    else: r, g, b = (int(v * f) for v in (r, g, b))
    return "#%02x%02x%02x" % (r, g, b)


EXTRA = '''<defs>
<linearGradient id="gabG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9dcd6"/><stop offset=".6" stop-color="#c3c7c0"/><stop offset="1" stop-color="#aeb2ab"/></linearGradient>
<pattern id="gabF" width="5" height="30" patternUnits="userSpaceOnUse"><path d="M1,0 V30 M3.5,5 V25" stroke="#fff" stroke-width=".3" opacity=".35"/></pattern>
<pattern id="vaS" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#2e9d4a"/><rect width="4" height="8" fill="#e8c21a"/></pattern>
<linearGradient id="cuB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0b27a"/><stop offset=".5" stop-color="#c87533"/><stop offset="1" stop-color="#8a4b1c"/></linearGradient>
<linearGradient id="polic" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f3fb" stop-opacity=".55"/><stop offset="1" stop-color="#b9d7ec" stop-opacity=".35"/></linearGradient>
</defs>'''


# ----------------------------------------------------------------------------------------------------------------- componentes
def comps(esq):
    """lista de aparatos: (tipo, u0, v0, w, h, d, rotulo). u a la derecha, v hacia abajo, desde la esquina sup. izq. del gabinete (mm)"""
    L = []
    def en_riel(r, u, w, h, d, t, lab): L.append((t, u, RAILS[r] - h / 2, w, h, d, lab))
    u = RU0 + 18
    en_riel(0, u, 72, 85, 78.5, "tm4", "TM GRAL")                    # termomagnético general 4P
    if esq == "TT": en_riel(0, u + 82, 72, 91, 73.5, "dif", "ID 300mA")
    else: en_riel(0, u + 86, 12.2, 56, 66, "bN", "N")                 # borne de neutro (BPN-16) desvinculable
    en_riel(1, u, 45, 85, 92, "km", "KM 25A")
    en_riel(1, u + 55, 18, 85, 70, "sel", "A-M")
    en_riel(1, u + 81, 18, 81, 70, "fc", "2A")
    for i, lab in enumerate(("L", "N", "R")): en_riel(1, 430 + i * 6.2, 6.2, 50, 48, "b25", lab)
    w = 36 if esq == "TT" else 18
    for i in range(3): en_riel(2, u + i * (w + 4), w, 85, 78.5, "tm2" if esq == "TT" else "tm1", f"C{i+1}")
    # borneras de salida (a la derecha del riel 4, cerca de los PEAD)
    grp = ["g", "c"] if esq == "TT" else ["g", "c", "v"]
    uu = RU1 - 12 - 3 * (len(grp) * 8.2 + 2)
    L.append(("tope", uu - 5, RAILS[3] - 22, 5, 44, 40, ""))
    for c in range(3):
        for col in grp: L.append(("bpn", uu, RAILS[3] - 25, 8.2, 50, 53, col)); uu += 8.2
        L.append(("sep", uu, RAILS[3] - 27, 2, 54, 55, "")); uu += 2
    L.append(("tope", uu, RAILS[3] - 22, 5, 44, 40, ""))
    return L


def pos_bornes(esq):
    """u del centro de cada borne de salida: {(circuito, color): u}"""
    out = {}
    for t, u0, v0, w, h, d, lab in comps(esq):
        pass
    grp = ["g", "c"] if esq == "TT" else ["g", "c", "v"]
    uu = RU1 - 12 - 3 * (len(grp) * 8.2 + 2)
    for c in range(3):
        for col in grp: out[(c, col)] = uu + 4.1; uu += 8.2
        uu += 2
    return out


def comp_de(esq, t, lab=None):
    for c in comps(esq):
        if c[0] == t and (lab is None or c[6] == lab): return c


# ----------------------------------------------------------------------------------------------------------------- frente 2D
def frente(h, X, Y, k, esq, color=True, cotas=True):
    """vista frontal del gabinete abierto (sin puerta). Devuelve f(u, v) -> (x, y) para ubicar globos."""
    F = lambda u, v: (X + u * k, Y + v * k)
    R = lambda u0, v0, u1, v1, fill="#fff", st=K, sw=.8, ex="": h.rect(X + u0 * k, Y + v0 * k, (u1 - u0) * k, (v1 - v0) * k, fill, st, sw, ex)
    # gabinete, marco y placa de montaje
    R(0, 0, GW, GH, "#fff", K, 1.8); R(10, 10, GW - 10, GH - 10, "none", K, .6)
    R(24, 24, GW - 24, GH - 24, "none", K, .5, h.OCULTA)
    h.txt(*F(GW - 30, 36), "PLACA DE MONTAJE (*)", 7.5, 400, OR, "end")
    # caja de toma primaria (EPEC) abierta: 3 bases NH T00 + terminal de neutro
    R(*CT, "#fff", K, 1.1); R(CT[0] + 6, CT[1] + 6, CT[2] - 6, CT[3] - 6, "none", K, .4)
    h.txt(*F((CT[0] + CT[2]) / 2, CT[1] + 22), "CAJA DE TOMA PRIMARIA (EPEC)", 7.5, 700, K, "middle")
    for i in range(3):
        u0 = CT[0] + 40 + i * 62
        R(u0, CT[1] + 34, u0 + 40, CT[1] + 184, "#fff", K, .8)              # base NH T00 (*)
        R(u0 + 5, CT[1] + 70, u0 + 35, CT[1] + 149, "#f4f1e6" if color else "#fff", K, .8)   # cartucho NH00 79 x 30
        R(u0 + 12, CT[1] + 62, u0 + 28, CT[1] + 70, "#bbb", K, .4); R(u0 + 12, CT[1] + 149, u0 + 28, CT[1] + 157, "#bbb", K, .4)
        h.txt(*F(u0 + 20, CT[1] + 113), "63A", 6.5, 700, K, "middle")
    R(CT[0] + 232, CT[1] + 90, CT[0] + 290, CT[1] + 130, "#fff", K, .8)    # terminal de neutro
    for j in range(3): h.circ(*F(CT[0] + 244 + j * 17, CT[1] + 110), 2.0, "#fff", K, .6)
    h.txt(*F(CT[0] + 261, CT[1] + 145), "N", 7.5, 700, K, "middle")
    # medidor
    R(*ME, "#fff", K, 1.1); R(ME[0] + 40, ME[1] + 30, ME[2] - 40, ME[1] + 80, "#eef3f6" if color else "#fff", K, .6)
    h.txt(*F((ME[0] + ME[2]) / 2, ME[1] + 62), "0 0 0 0 0 kWh", 7, 400, K, "middle", MONO)
    R(ME[0] + 20, ME[3] - 70, ME[2] - 20, ME[3] - 10, "#fff", K, .6, 'stroke-dasharray="3 2"')
    h.txt(*F((ME[0] + ME[2]) / 2, ME[1] + 120), "MEDIDOR 3F (EPEC)", 7.5, 700, K, "middle")
    # caño flexible PVC Ø32 entre caja de toma y medidor
    pa = F(CT[2], CT[1] + 190); pb = F(ME[0] + 60, ME[3])
    d = f"M{pa[0]:.1f},{pa[1]:.1f} C{pa[0]+40:.1f},{pa[1]:.1f} {pb[0]:.1f},{pb[1]+40:.1f} {pb[0]:.1f},{pb[1]:.1f}"
    h.path(d, "none", K, 32 * k + 2); h.path(d, "none", "#eceff2" if color else "#fff", 32 * k - .6)
    h.path(d, "none", K, .35, 'stroke-dasharray="1.5 2"')
    # rieles NS35
    for v in RAILS:
        R(RU0, v - 17.5, RU1, v + 17.5, "url(#ANSI31)", K, .7); R(RU0, v - 12.5, RU1, v + 12.5, "#fff", K, .4)
    # cables (detrás de los aparatos): se dibujan primero los recorridos de fondo
    cables(h, F, k, esq)
    # aparatos
    for t, u0, v0, w, hh, dd, lab in comps(esq):
        dib_aparato(h, F, k, t, u0, v0, w, hh, lab, color)
    # barra de PAT
    R(BAR[0] - 10, BAR[1] - 6, BAR[0] + 10, BAR[3] + 6, "#fff", K, .6); R(BAR[2] - 10, BAR[1] - 6, BAR[2] + 10, BAR[3] + 6, "#fff", K, .6)
    R(*BAR, "url(#cuB)" if color else "#fff", K, 1)
    for j in range(8): h.circ(*F(BAR[0] + 25 + j * 21.5, (BAR[1] + BAR[3]) / 2), 1.6, "#fff", K, .5)
    h.txt(*F((BAR[0] + BAR[2]) / 2, BAR[3] + 22), "BARRA PAT", 7.5, 700, K, "middle")
    # entradas por el piso
    for u, dmm, t in ((PVC_U, 90, "Ø90"), (PAT_U, 50, "Ø50"), *[(pu, 50, "Ø50") for pu in PEAD_U]):
        x0, y0 = F(u - dmm / 2, GH - 10); h.rect(x0, y0, dmm * k, 10 * k, "#fff", K, .7)
    if cotas:
        x0, y0 = F(0, 0); x1, y1 = F(GW, GH)
        h.dimH(y1 + 18, x0, x1, "785", ext=y1 + 2, dy=14); h.dimV(x0 - 18, y0, y1, "830", ext=x0 - 2)
        h.dimH(y0 - 10, *[F(u, 0)[0] for u in (RU0, RU1)], "500 RIEL (x4)", ext=y0 + (RAILS[0] - 18) * k)
    return F


def dib_aparato(h, F, k, t, u0, v0, w, hh, lab, color):
    x, y = F(u0, v0); W, H = w * k, hh * k
    fs = 5.6
    if t in ("tm4", "tm2", "tm1", "dif"):
        pol = {"tm4": 4, "tm2": 2, "tm1": 1, "dif": 4}[t]
        h.rect(x, y, W, H, "#fff", K, .9)
        h.rect(x, y + H * .3, W, H * .4, "#f7f7f4" if color else "#fff", K, .4)
        for p in range(pol):
            cx = x + (p + .5) * W / pol
            h.circ(cx, y + 3.2, 1.25, "#fff", K, .5); h.circ(cx, y + H - 3.2, 1.25, "#fff", K, .5)
            if p: h.ln(x + p * W / pol, y + 6, x + p * W / pol, y + H - 6, K, .3)
        h.rect(x + W * .12, y + H * .40, W * .76, H * .12, "#333" if color else "#fff", K, .6)     # palanca (barra que une los polos)
        if t == "dif":
            h.circ(x + W - 4, y + H * .63, 2, "#1f5fae" if color else "#fff", K, .5); h.txt(x + W - 4, y + H * .63 + 1.8, "T", 4.5, 700, "#fff" if color else K, "middle")
        h.txt(x + W / 2, y + H * .66 + 2, lab, fs, 700, K, "middle")
    elif t == "km":
        h.rect(x, y, W, H, "#fff", K, .9); h.rect(x + 3, y + H * .32, W - 6, H * .36, "#e6e7ea" if color else "#fff", K, .4)
        for j, s in enumerate(("1", "3", "5")): h.circ(x + W * (j + .5) / 3, y + 3.2, 1.2, "#fff", K, .5); h.circ(x + W * (j + .5) / 3, y + H - 3.2, 1.2, "#fff", K, .5)
        h.txt(x + W / 2, y + H * .52, "KM", 6, 700, K, "middle"); h.txt(x + W / 2, y + H * .62, "25 A", 5, 400, K, "middle")
        h.txt(x + 2, y + 9.5, "A1", 4.3, 400, K); h.txt(x + W - 2, y + 9.5, "A2", 4.3, 400, K, "end")
    elif t == "sel":
        h.rect(x, y, W, H, "#fff", K, .9); h.circ(x + W / 2, y + H / 2, W * .38, "#ddd" if color else "#fff", K, .6)
        h.ln(x + W / 2, y + H / 2 - W * .32, x + W / 2, y + H / 2 + W * .32, K, 1.1); h.txt(x + W / 2, y + H - 4, "A-M", 4.3, 700, K, "middle")
    elif t == "fc":
        h.rect(x, y, W, H, "#fff", K, .9); h.rect(x + 1.5, y + H * .25, W - 3, H * .5, "#efe9d8" if color else "#fff", K, .5)
        h.txt(x + W / 2, y + H * .55, "2A", 4.5, 700, K, "middle")
    elif t in ("bpn", "b25", "bN"):
        col = {"g": GRI, "c": "#4fa3d9", "v": VA}.get(lab, GRI)
        if t == "bN": col = "#4fa3d9"
        h.rect(x, y, W, H, col if color else "#fff", K, .7)
        h.circ(x + W / 2, y + 3.5, min(1.6, W * .3), "#fff", K, .4); h.circ(x + W / 2, y + H - 3.5, min(1.6, W * .3), "#fff", K, .4)
        if t == "bN": h.txt(x + W / 2, y + H / 2 + 2, "N", 5, 700, "#fff" if color else K, "middle")
    elif t == "sep": h.rect(x, y, W, H, "#555" if color else "#fff", K, .4)
    elif t == "tope": h.rect(x, y, W, H, "#888" if color else "#fff", K, .5)


def cables(h, F, k, esq):
    """recorridos de los cables en la vista frontal (con sus colores, AEA 90364)"""
    def pl(pts, c, w=1.3, ex=""):
        P = [F(u, v) for u, v in pts]
        h.path("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in P), "none", c, w, 'stroke-linejoin="round" ' + ex)
    tm = comp_de(esq, "tm4"); km = comp_de(esq, "km")
    LNc = FASES + [CEL]
    # acometida EPEC: del PVC Ø90 sube a la caja de toma (4 conductores)
    for i, c in enumerate(LNc):
        uu = PVC_U - 12 + i * 8
        dest = CT[0] + 60 + i * 62 if i < 3 else CT[0] + 244
        pl([(uu, GH - 10), (uu, CT[3] + 40 - i * 6), (dest, CT[3] + 40 - i * 6), (dest, CT[3])], c, 1.5)
    # medidor -> TM general
    for i, c in enumerate(LNc):
        uu = ME[0] + 70 + i * 22; ut = tm[1] + (i + .5) * 18
        vv = ME[3] + 20 + i * 6
        pl([(uu, ME[3] - 10), (uu, vv), (ut, vv), (ut, tm[2])], c, 1.3)
    vbot = tm[2] + tm[4]
    if esq == "TT":
        df = comp_de(esq, "dif")
        for i, c in enumerate(LNc):   # puentes TM general -> diferencial (por debajo)
            a = tm[1] + (i + .5) * 18; b = df[1] + (i + .5) * 18; vv = vbot + 6 + i * 4
            pl([(a, vbot), (a, vv), (b, vv), (b, df[2] + df[4])], c, 1.1)
        src = lambda i: df[1] + (i + .5) * 18; srcv = df[2]
    else:
        src = lambda i: tm[1] + (i + .5) * 18; srcv = vbot
    # fases -> contactor (KM entra arriba)
    for i, c in enumerate(FASES):
        a = src(i); b = km[1] + (i + .5) * 15
        if esq == "TT":
            pl([(a, srcv), (a, srcv - 8 - i * 4), (comp_de(esq, "dif")[1] + 80 + i * 4, srcv - 8 - i * 4), (comp_de(esq, "dif")[1] + 80 + i * 4, RAILS[1] - 62 + i * 4), (b, RAILS[1] - 62 + i * 4), (b, km[2])], c, 1.2)
        else:
            vv = vbot + 14 + i * 4
            pl([(a, vbot), (a, vv), (b, vv), (b, km[2])], c, 1.2)
    # contactor -> TM de salida (C1 = L1, C2 = L2, C3 = L3)
    for i, c in enumerate(FASES):
        t = comp_de(esq, "tm2" if esq == "TT" else "tm1", f"C{i+1}")
        a = km[1] + (i + .5) * 15; b = t[1] + 4.5; vv = km[2] + km[4] + 6 + i * 4
        pl([(a, km[2] + km[4]), (a, vv), (b, vv), (b, t[2])], c, 1.2)
    pb = pos_bornes(esq)
    # neutro
    if esq == "TT":
        a = src(3); vv = RAILS[1] - 74
        pts = [(a, srcv), (a, srcv - 22), (comp_de(esq, "dif")[1] + 96, srcv - 22), (comp_de(esq, "dif")[1] + 96, RAILS[2] - 58), (comp_de(esq, "tm2", "C3")[1] + 27, RAILS[2] - 58)]
        pl(pts, CEL, 1.2)
        for i in range(3):
            t = comp_de(esq, "tm2", f"C{i+1}"); pl([(t[1] + 27, RAILS[2] - 58), (t[1] + 27, t[2])], CEL, 1.2)
    else:
        bN = comp_de(esq, "bN"); a = src(3)
        pl([(a, vbot), (a, vbot + 8), (bN[1] + 6.1, vbot + 8), (bN[1] + 6.1, bN[2] + bN[4])], CEL, 1.3)
        # del borne N a los bornes celestes de salida (por arriba del riel 4)
        vv = RAILS[3] - 46
        pl([(bN[1] + 6.1, bN[2]), (bN[1] + 6.1, bN[2] - 8), (bN[1] + 30, bN[2] - 8), (bN[1] + 30, vv - 8), (pb[(2, "c")] + 10, vv - 8)], CEL, 1.2)
        for c in range(3): pl([(pb[(c, "c")], vv - 8), (pb[(c, "c")], RAILS[3] - 25)], CEL, 1.1)
        # puente N - PE (desvinculable) hasta la barra
        PN = [(bN[1] + 6.1, bN[2] + bN[4]), (bN[1] + 6.1, BAR[1])]
        pl(PN, VA, 2.0); pl(PN, AMA, .8, 'stroke-dasharray="3 3"')
    # TM salida -> bornes grises (y celestes en TT)
    for i, c in enumerate(FASES):
        t = comp_de(esq, "tm2" if esq == "TT" else "tm1", f"C{i+1}")
        vv = t[2] + t[4] + 8 + i * 5
        pl([(t[1] + 4.5, t[2] + t[4]), (t[1] + 4.5, vv), (pb[(i, "g")], vv), (pb[(i, "g")], RAILS[3] - 25)], c, 1.2)
        if esq == "TT":
            vv2 = vv + 2.5
            pl([(t[1] + 27, t[2] + t[4]), (t[1] + 27, vv2), (pb[(i, "c")], vv2), (pb[(i, "c")], RAILS[3] - 25)], CEL, 1.1)
    # tierra: barra -> bornes verdes (TN-S) y barra -> jabalina (por el caño de PAT)
    if esq != "TT":
        for c in range(3):
            pl([(BAR[2] - 10 - c * 20, BAR[1]), (BAR[2] - 10 - c * 20, RAILS[3] + 44 + c * 4), (pb[(c, "v")], RAILS[3] + 44 + c * 4), (pb[(c, "v")], RAILS[3] + 25)], VA, 1.3)
    pl([(PAT_U, BAR[3]), (PAT_U, GH - 10)], VA, 2.0)
    pl([(PAT_U, BAR[3]), (PAT_U, GH - 10)], AMA, .8, 'stroke-dasharray="3 3"')
    # salidas: de los bornes bajan a cada PEAD Ø50
    for c in range(3):
        cols = [("g", FASES[c]), ("c", CEL)] + ([("v", VA)] if esq != "TT" else [])
        for j, (col, cc) in enumerate(cols):
            u = pb[(c, col)]; tgt = PEAD_U[c] - 8 + j * 8
            pl([(u, RAILS[3] + 25), (u, RAILS[3] + 60 + c * 6), (tgt, RAILS[3] + 60 + c * 6), (tgt, GH - 10)], cc, 1.2)
    # comando: L1 (después del general) -> fusible 2 A -> borne L ; borne R -> selectora -> A1 ; A2 -> N
    fc = comp_de(esq, "fc"); sel = comp_de(esq, "sel")
    bl = comp_de(esq, "b25", "L"); bn_ = comp_de(esq, "b25", "N"); br = comp_de(esq, "b25", "R")
    pl([(src(0) - 3, srcv + (0 if esq != "TT" else 0)), ], MAR, .9)
    vtop = RAILS[1] - 52
    pl([(fc[1] + 9, fc[2]), (fc[1] + 9, vtop), (tm[1] + 9 - 6, vtop), (tm[1] + 9 - 6, tm[2] + tm[4] - 2)], MAR, .9, 'stroke-dasharray="4 1.5"')
    pl([(fc[1] + 9, fc[2] + fc[4]), (fc[1] + 9, fc[2] + fc[4] + 6), (bl[1] + 3.1, fc[2] + fc[4] + 6), (bl[1] + 3.1, bl[2] + bl[4])], MAR, .9)
    pl([(br[1] + 3.1, br[2]), (br[1] + 3.1, br[2] - 14), (sel[1] + 9, br[2] - 14), (sel[1] + 9, sel[2])], "#7a5ea8", .9)
    pl([(sel[1] + 9, sel[2] + sel[4]), (sel[1] + 9, sel[2] + sel[4] + 14), (km[1] + 4, sel[2] + sel[4] + 14), (km[1] + 4, km[2] + 10)], "#7a5ea8", .9)
    pl([(bn_[1] + 3.1, bn_[2] + bn_[4]), (bn_[1] + 3.1, bn_[2] + bn_[4] + 10), (km[1] + 41, bn_[2] + bn_[4] + 10), (km[1] + 41, km[2] + 10)], CEL, .9)
    # cable de comando 3 x 1,5 al fotocontrol (sale por el PEAD del circuito 1)
    for j, b_ in enumerate((bl, bn_, br)):
        pl([(b_[1] + 3.1, b_[2]), (b_[1] + 3.1, b_[2] - 6 - j * 3), (b_[1] + 30, b_[2] - 6 - j * 3)], [MAR, CEL, "#7a5ea8"][j], .9)
    CMD = [(br[1] + 30, br[2] - 12), (470, br[2] - 12), (470, GH - 30), (PEAD_U[0] + 12, GH - 30), (PEAD_U[0] + 12, GH - 10)]
    pl(CMD, "#111", 2.2); pl(CMD, "#666", .7)


# ----------------------------------------------------------------------------------------------------------------- unifilar
def unifilar(h, x, y, esq, alto=360):
    """unifilar en blanco y negro (símbolos IEC 60617)"""
    def interr(cx, cy, l=26, tipo="tm"):
        h.ln(cx, cy, cx, cy + 6, K, 1.1); h.ln(cx, cy + 6, cx + 9, cy + l - 6, K, 1.1); h.ln(cx, cy + l - 6, cx, cy + l, K, 1.1)
        if tipo == "tm":
            h.rect(cx - 13, cy + 8, 7, 7, "#fff", K, .7); h.path(f"M{cx-12},{cy+18} q2,-3 4,0 t4,0", "none", K, .7)
            h.ln(cx - 6, cy + 11, cx + 3, cy + 11, K, .5, 'stroke-dasharray="2 1.5"')
        if tipo == "dif":
            h.a(f'<ellipse cx="{cx}" cy="{cy+l+8}" rx="9" ry="3.5" fill="none" stroke="{K}" stroke-width=".9"/>'); h.ln(cx, cy + l, cx, cy + l + 16, K, 1.1)
        if tipo == "km":
            h.path(f"M{cx-3},{cy+6} a3,3 0 0 1 6,0", "none", K, .8)
    def fus(cx, cy, l=22):
        h.ln(cx, cy, cx, cy + l, K, 1.1); h.rect(cx - 4, cy + 4, 8, l - 8, "#fff", K, .9); h.ln(cx, cy + 4, cx, cy + l - 4, K, .7)
    cx = x + 70; yy = y
    h.txt(cx, yy, "ACOMETIDA EPEC", 9.5, 700, K, "middle"); h.txt(cx, yy + 12, "3 x 380/220 V + N", 9, 400, G, "middle")
    yy += 18; h.ln(cx, yy, cx, yy + 10, K, 1.1)
    for j in range(3): h.ln(cx - 4 + j * 4, yy + 4, cx + 2 + j * 4, yy - 2, K, .7)
    yy += 10; fus(cx, yy, 26); h.txt(cx + 14, yy + 12, "3 x NH00 gL 63 A", 9.5, 700); h.txt(cx + 14, yy + 23, "SECC. NH T00 (CAJA DE TOMA)", 8.5, 400, G); yy += 26
    h.ln(cx, yy, cx, yy + 8, K, 1.1); yy += 8
    h.circ(cx, yy + 12, 12, "#fff", K, 1); h.txt(cx, yy + 15.5, "kWh", 8, 700, K, "middle"); h.txt(cx + 18, yy + 15, "MEDIDOR (EPEC)", 9.5, 700); yy += 24
    h.ln(cx, yy, cx, yy + 6, K, 1.1); yy += 6
    interr(cx, yy, 30, "tm"); h.txt(cx + 16, yy + 14, "TM GENERAL 4P CURVA C", 9.5, 700); h.txt(cx + 16, yy + 25, "In S/ PROYECTO (*)", 8.5, 400, OR); yy += 30
    if esq == "TT":
        h.ln(cx, yy, cx, yy + 6, K, 1.1); yy += 6
        interr(cx, yy, 26, "dif"); h.txt(cx + 16, yy + 12, "DIFERENCIAL 4 x 40 A", 9.5, 700); h.txt(cx + 16, yy + 23, "300 mA CLASE A, SUPERINMUNIZADO", 8.5, 400, G); yy += 42
    else:
        # borne de neutro desvinculable, unido a la barra PAT
        h.ln(cx, yy, cx, yy + 18, K, 1.1)
        h.ln(cx, yy + 9, cx - 30, yy + 9, K, .9, 'stroke-dasharray="4 2"'); h.rect(cx - 40, yy + 3, 10, 12, "#fff", K, .9); h.txt(cx - 35, yy + 12, "N", 7, 700, K, "middle")
        h.ln(cx - 35, yy + 15, cx - 35, yy + 48, K, 1.4); h.circ(cx - 35, yy + 31, 2.6, "#fff", K, .9)
        h.txt(cx - 46, yy + 34, "UNION N-PE", 8, 700, K, "end"); h.txt(cx - 46, yy + 44, "DESVINCULABLE", 8, 400, G, "end")
        yy += 18
    h.ln(cx, yy, cx, yy + 6, K, 1.1); yy += 6
    interr(cx, yy, 26, "km"); h.txt(cx + 16, yy + 12, "CONTACTOR KM 25 A AC-1", 9.5, 700); h.txt(cx + 16, yy + 23, "BOBINA 220 V", 8.5, 400, G); yy += 26
    # comando (a la izquierda): fusible -> fotocontrol -> selectora -> bobina
    kx = x + 8
    h.ln(cx, yy - 70, kx + 4, yy - 70, K, .7, 'stroke-dasharray="4 2"') if False else None
    # barra de salidas
    yb = yy + 14; h.ln(cx, yy, cx, yb, K, 1.1)
    xs = [x + 40 + i * 64 for i in range(3)]
    h.ln(xs[0], yb, xs[2], yb, K, 1.6)
    for i, xx in enumerate(xs):
        h.ln(xx, yb, xx, yb + 8, K, 1.1); interr(xx, yb + 8, 26, "tm")
        h.ln(xx, yb + 34, xx, yb + 54, K, 1.1); h.path(f"M{xx-4},{yb+50} l4,6 l4,-6", "none", K, 1)
        h.txt(xx, yb + 70, f"C{i+1} - L{i+1}", 9, 700, K, "middle")
        h.txt(xx, yb + 81, "TM 2P (2x1x6)" if esq == "TT" else "TM 1P (1x6)", 8, 400, K, "middle")
    for xx in xs: h.ln(xx, yb + 54, xx, yb + 54, K, 1)
    # PAT
    px = x + 222; py = yb + 20
    h.rect(px - 32, py - 6, 64, 10, "#fff", K, 1); h.txt(px, py - 10, "BARRA PAT", 8.5, 700, K, "middle")
    h.ln(px, py + 4, px, py + 30, K, 1.2)
    for j, wj in enumerate((18, 12, 6)): h.ln(px - wj / 2, py + 30 + j * 4, px + wj / 2, py + 30 + j * 4, K, 1.2)
    h.txt(px + 14, py + 26, "JABALINA", 8.5, 700); h.txt(px + 14, py + 36, "1 x 10 V/A", 8, 400, G)
    if esq == "TT":
        h.txt(px + 20, py + 84, "BARRA SOLA A SU JABALINA:", 8.5, 700, K, "middle"); h.txt(px + 20, py + 95, "N Y PE NO SE UNEN", 8.5, 700, "#b02a20", "middle")
    else:
        h.path(f"M{cx-35},{yy-64+0} ", "none")
    return yb


def comando(h, x, y, w=150):
    """circuito de comando (columna izq. del unifilar): L1 -> fusible 2 A -> fotocontrol -> selectora A-M -> bobina A1-A2 -> N"""
    cx = x + 30
    h.txt(cx, y, "COMANDO", 9.5, 700, K, "middle")
    h.txt(cx - 18, y + 16, "L1", 8.5, 700, K, "end"); h.ln(cx, y + 8, cx, y + 20, K, 1)
    h.rect(cx - 4, y + 20, 8, 16, "#fff", K, .9); h.ln(cx, y + 20, cx, y + 36, K, .6); h.txt(cx + 9, y + 31, "2 A", 8.5, 700)
    h.ln(cx, y + 36, cx, y + 46, K, 1)
    # fotocontrol (contacto comandado por luz)
    h.ln(cx, y + 46, cx + 8, y + 62, K, 1); h.ln(cx, y + 64, cx, y + 72, K, 1)
    for j in range(2): h.path(f"M{cx+18+j*5},{y+44} l-6,8 m0,0 l1,-4 m-1,4 l4,-1", "none", K, .7)
    h.txt(cx + 22, y + 60, "FC", 8.5, 700)
    h.ln(cx, y + 72, cx, y + 78, K, 1); h.ln(cx, y + 78, cx + 8, y + 92, K, 1); h.ln(cx, y + 94, cx, y + 102, K, 1)
    h.path(f"M{cx-3},{y+84} h-8 v8", "none", K, .7); h.txt(cx + 12, y + 92, "A-M", 8.5, 700)
    h.rect(cx - 8, y + 102, 16, 12, "#fff", K, 1); h.txt(cx + 12, y + 112, "A1-A2", 8.5, 700)
    h.ln(cx, y + 114, cx, y + 124, K, 1); h.txt(cx - 18, y + 124, "N", 8.5, 700, K, "end")


# ----------------------------------------------------------------------------------------------------------------- trifilar (color)
def trifilar(h, x, y, w, esq):
    Ls = [("L1", MAR), ("L2", NEG), ("L3", ROJ), ("N", CEL)] + [("PE", VA)]
    dy = 14; ys = [y + i * dy for i in range(5)]
    for i, (n, c) in enumerate(Ls):
        h.txt(x - 4, ys[i] + 3, n, 9, 700, K, "end")
    xe = x + w
    def tramo(i, x0, x1, ww=1.8):
        c = Ls[i][1]; h.ln(x0, ys[i], x1, ys[i], c, ww)
        if i == 4: h.ln(x0, ys[i], x1, ys[i], AMA, .7, 'stroke-dasharray="3 3"')
    def caja(x0, x1, i0, i1, t, sub="", fill="#fff"):
        h.rect(x0, ys[i0] - 8, x1 - x0, ys[i1] - ys[i0] + 16, fill, K, 1); h.txt((x0 + x1) / 2, ys[i0] - 12, t, 8.5, 700, K, "middle")
        if sub: h.txt((x0 + x1) / 2, ys[4] + 16, sub, 7.5, 400, G, "middle")
    # tramos
    X = [x, x + 50, x + 90, x + 130, x + 170, x + 210, x + 250, x + 290, x + 330]
    for i in range(4): tramo(i, X[0], X[1])
    caja(X[1], X[1] + 30, 0, 2, "NH", "63 A gL")
    for i in range(3):
        h.rect(X[1] + 9, ys[i] - 4, 12, 8, "#f4f1e6", K, .7)
    tramo(3, X[1], X[1] + 30)
    for i in range(4): tramo(i, X[1] + 30, X[2] + 6)
    caja(X[2] + 6, X[2] + 34, 0, 3, "kWh", "EPEC", "#eef3f6")
    for i in range(4): tramo(i, X[2] + 34, X[3] + 10)
    caja(X[3] + 10, X[3] + 36, 0, 3, "TM", "GRAL 4P")
    for i in range(4): h.path(f"M{X[3]+16},{ys[i]} l6,-5 l0,5", "none", K, .8)
    xa = X[3] + 36
    if esq == "TT":
        for i in range(4): tramo(i, xa, xa + 16)
        caja(xa + 16, xa + 44, 0, 3, "ID", "4x40 300mA", "#e3efff")
        h.circ(xa + 30, ys[3] + 2, 3, "#1f5fae", K, .5)
        xa += 44
    else:
        for i in range(4): tramo(i, xa, xa + 16)
        # borne N y unión con PE
        h.rect(xa + 6, ys[3] - 5, 10, 10, "#4fa3d9", K, .8); h.txt(xa + 11, ys[3] + 3, "N", 6.5, 700, "#fff", "middle")
        h.ln(xa + 11, ys[3] + 5, xa + 11, ys[4], VA, 2.2); h.ln(xa + 11, ys[3] + 5, xa + 11, ys[4], AMA, .7, 'stroke-dasharray="3 3"')
        h.circ(xa + 11, ys[4], 2.4, K, K, 0); h.txt(xa + 16, ys[4] + 13, "N-PE", 7.5, 700, K)
        for i in range(3): tramo(i, xa + 16, xa + 44)
        tramo(3, xa + 16, xa + 44); xa += 44
    for i in range(3): tramo(i, xa, xa + 14)
    tramo(3, xa, xa + 14)
    caja(xa + 14, xa + 42, 0, 2, "KM", "25 A AC-1", "#e6e7ea")
    xa += 42
    tramo(3, xa - 28, xa + 160)
    for i in range(3): tramo(i, xa, xa + 160 - (2 - i) * 0)
    # PE: de la barra
    xb = x + 40
    if esq != "TT": tramo(4, xb, xa + 160)
    else: tramo(4, xb, xb + 40); h.txt(xb + 44, ys[4] + 3, "MASAS", 7.5, 700, K)
    h.rect(xb - 26, ys[4] - 5, 24, 10, "url(#cuB)", K, .8); h.txt(xb - 14, ys[4] + 18, "BARRA PAT", 7.5, 700, K, "middle")
    h.ln(xb - 14, ys[4] + 5, xb - 14, ys[4] + 26, VA, 2);
    for j, wj in enumerate((14, 9, 4)): h.ln(xb - 14 - wj / 2, ys[4] + 26 + j * 3.5, xb - 14 + wj / 2, ys[4] + 26 + j * 3.5, K, 1)
    # salidas
    out = []
    for c in range(3):
        xx = xa + 30 + c * 48; yb = ys[4] + 26
        h.circ(xx, ys[c], 2.2, K, K, 0); h.ln(xx, ys[c], xx, yb + 6, Ls[c][1], 1.8)
        h.circ(xx + 8, ys[3], 2.2, K, K, 0); h.ln(xx + 8, ys[3], xx + 8, yb + 6, CEL, 1.8)
        h.rect(xx - 6, yb + 6, 20 if esq == "TT" else 10, 22, "#fff", K, 1)
        h.txt(xx + (4 if esq == "TT" else -1), yb + 21, "1P" if esq != "TT" else "2P", 6, 700, K, "middle")
        if esq != "TT":
            h.rect(xx + 3, yb + 10, 10, 12, "#4fa3d9", K, .6)   # N pasa por borne
        h.ln(xx, yb + 28, xx, yb + 58, Ls[c][1], 1.8); h.ln(xx + 8, yb + 28, xx + 8, yb + 58, CEL, 1.8)
        if esq != "TT":
            h.circ(xx + 16, ys[4], 2.2, K, K, 0); h.ln(xx + 16, ys[4], xx + 16, yb + 58, VA, 1.8); h.ln(xx + 16, ys[4], xx + 16, yb + 58, AMA, .6, 'stroke-dasharray="3 3"')
        for j, cc in enumerate([Ls[c][1], CEL] + ([VA] if esq != "TT" else [])):
            h.rect(xx - 3 + j * 8, yb + 58, 6, 12, GRI if j == 0 else ("#4fa3d9" if j == 1 else VA), K, .5)
        h.txt(xx + 6, yb + 84, f"C{c+1}", 9, 700, K, "middle")
        out.append(xx)
    return ys, out


# ----------------------------------------------------------------------------------------------------------------- 3D
def g3d(h, ox, oy, s, esq, cortar_base=True):
    h.iso(s, ox, oy)
    LA, AN, HT, EP, HIL, LADH = 900, 400, 600, 72.5, 75, 50
    zt, zb = 100, -500
    gx0, gy0, gz0 = (LA - GW) / 2, (AN - GD) / 2, zt
    def tuboY(y0, y1, xc, zc, r, fill, st="#000"):
        p0 = h.P(xc, y0, zc); p1 = h.P(xc, y1, zc); nx, ny = .5 * r * h._s, .866 * r * h._s
        h.a(f'<polygon points="{p0[0]+nx:.1f},{p0[1]-ny:.1f} {p1[0]+nx:.1f},{p1[1]-ny:.1f} {p1[0]-nx:.1f},{p1[1]+ny:.1f} {p0[0]-nx:.1f},{p0[1]+ny:.1f}" fill="{fill}" stroke="{st}" stroke-width=".6"/>')
        h.poly3([(xc + r * math.cos(2 * math.pi * i / 30), y1, zc + r * math.sin(2 * math.pi * i / 30)) for i in range(30)], "#d6d9dd", st, .6)
    def pl3(pts, c, w=1.4, ex=""):
        P = [h.P(*p) for p in pts]; h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in P), "none", c, w, 'stroke-linejoin="round" stroke-linecap="round" ' + ex)
    # terreno de fondo
    h.BOX(-50, 950, -300, -50, -90, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
    h.BOX(-300, -50, -50, 450, -90, 0, "url(#grass)", "url(#soil3)", "url(#soil3)")
    # caños que salen por debajo del asiento: PEAD (a la zanja, +x), PVC Ø90 de EPEC (+y), PVC Ø50 de PAT (+y)
    for ys_, zc in ((150, -640), (215, -665), (280, -690)):
        h.tuboX(560, 1030, ys_, zc, 25, "url(#pead)", "#000"); h.poly3(h.circX(1030, ys_, zc, 25), "#333", "#000", .5); h.poly3(h.circX(1031, ys_, zc, 9, 14), "#111", "#000", .4)
    tuboY(200, 640, 250, -660, 45, "url(#pvc)", "#555"); h.poly3([(250 + 14 * math.cos(2 * math.pi * i / 16), 641, -660 + 14 * math.sin(2 * math.pi * i / 16)) for i in range(16)], "#1a1a1a", "#000", .4)
    tuboY(200, 600, 380, -640, 25, "url(#pvc)", "#555"); h.poly3([(380 + 6 * math.cos(2 * math.pi * i / 12), 601, -640 + 6 * math.sin(2 * math.pi * i / 12)) for i in range(12)], VA, "#000", .4)
    h.BOX(-50, 950, -50, 450, zb - 100, zb, "url(#conc3)", "url(#conc3)", "url(#conc3)")
    MORT = "#bfb6a6"
    def pared(x0, x1, y0, y1): h.BOX(x0, x1, y0, y1, zb, zt, MORT, "url(#lad3)", "url(#lad3)")
    pared(0, LA, 0, EP); pared(0, EP, EP, AN - EP)
    # caños dentro de la base y cables que suben al gabinete
    h.tuboZ(zb, zb + 100, 250, AN / 2, 45, 45, "url(#pvc)", "#555")
    h.tuboZ(zb, zb + 100, 380, AN / 2, 25, 25, "url(#pvc)", "#555")
    for xs in (560, 680, 790): h.tuboZ(zb, zb + 100, xs, AN / 2, 25, 25, "url(#pead)", "#000")
    h.tuboZ(zb + 100, zt + 10, 250, AN / 2, 14, 14, "#1a1a1a", "#000")
    pl3([(380, AN / 2, zb + 100), (380, AN / 2, zt + 10)], VA, 3.2); pl3([(380, AN / 2, zb + 100), (380, AN / 2, zt + 10)], AMA, 1.2, 'stroke-dasharray="3 3"')
    for xs in (560, 680, 790): h.tuboZ(zb + 100, zt + 10, xs, AN / 2, 9, 9, "#2a2a2a", "#000")
    pared(LA - EP, LA, EP, AN - EP)
    pared(0, 200, AN - EP, AN)
    for r in range(8):
        z0 = zb + r * HIL
        h.F3([(200, AN - EP, z0 + LADH), (200, AN, z0 + LADH), (200, AN, z0 + HIL), (200, AN - EP, z0 + HIL)], MORT, "#6b5a4a", .4)
        h.F3([(200, AN - EP, z0), (200, AN, z0), (200, AN, z0 + LADH), (200, AN - EP, z0 + LADH)], "#b8533a", "#6b2a1a", .4)
    # ===== gabinete (sin puerta)
    X = lambda u: gx0 + u; Z = lambda v: gz0 + GH - v
    e = 8; yb_ = gy0 + e; yp = yb_ + 4       # pared del fondo y placa de montaje (*)
    h.BOX(gx0, gx0 + GW, gy0, gy0 + e, gz0, gz0 + GH, "url(#gabG)", "url(#gabG)", "url(#gabG)", "#6c706a", .7)
    h.BOX(gx0, gx0 + e, gy0 + e, gy0 + GD, gz0, gz0 + GH, "url(#gabG)", "#cfd2cc", "#b8bcb5", "#6c706a", .7)
    h.BOX(gx0 + e, gx0 + GW, gy0 + e, gy0 + GD, gz0, gz0 + e, "#d4d7d1", "url(#gabG)", "url(#gabG)", "#6c706a", .7)
    for xx, rr in ((250, 45), (380, 25), (560, 25), (680, 25), (790, 25)):   # pasos por el piso del gabinete
        h.poly3(h.circZ(gz0 + e + .5, xx, AN / 2, rr + 4), "#2a2a2a", "#000", .4)
    h.F3([(gx0 + 24, yp, gz0 + 24), (gx0 + GW - 24, yp, gz0 + 24), (gx0 + GW - 24, yp, gz0 + GH - 24), (gx0 + 24, yp, gz0 + GH - 24)], "#e3e6ea", "#8a9099", .6)
    # rieles
    for v in RAILS:
        h.BOX(X(RU0), X(RU1), yp, yp + 7.5, Z(v + 17.5), Z(v - 17.5), "url(#galv)", "#c5ced6", "#8f9aa4", "#5a636b", .4)
    # cables de fondo (detrás de los aparatos, sobre la placa)
    yc = yp + 10
    LNc = FASES + [CEL]
    tm = comp_de(esq, "tm4"); km = comp_de(esq, "km")
    for i, c in enumerate(LNc):    # medidor -> TM general
        uu = ME[0] + 70 + i * 22; ut = tm[1] + (i + .5) * 18; vv = ME[3] + 20 + i * 6
        pl3([(X(uu), yc + 40, Z(ME[3] - 10)), (X(uu), yc + 40, Z(vv)), (X(ut), yc + 40, Z(vv)), (X(ut), yc + 60, Z(tm[2]))], c, 1.6)
    pb = pos_bornes(esq)
    for c in range(3):              # bornes -> PEAD (salidas)
        cols = [("g", FASES[c]), ("c", CEL)] + ([("v", VA)] if esq != "TT" else [])
        for j, (col, cc) in enumerate(cols):
            u = pb[(c, col)]; tx = 560 + 120 * c - 1.5 + j * 1.5 if c < 2 else 790 - 1.5 + j * 1.5
            tx = [560, 680, 790][c] - 3 + j * 3
            pl3([(X(u), yc + 30, Z(RAILS[3] + 25)), (X(u), yc + 30, Z(RAILS[3] + 60 + c * 6)), (tx, AN / 2 - 30 + j * 4, Z(RAILS[3] + 60 + c * 6)), (tx, AN / 2, zt + 10)], cc, 1.5)
    # acometida EPEC: cable negro que sube a la caja de toma y se abre en 4
    pl3([(250, AN / 2, zt + 10), (250, AN / 2, Z(CT[3] + 60)), (250, yc + 60, Z(CT[3] + 40))], "#1a1a1a", 4.5)
    for i, c in enumerate(LNc):
        dest = CT[0] + 60 + i * 62 if i < 3 else CT[0] + 244
        pl3([(250, yc + 60, Z(CT[3] + 40)), (X(dest), yc + 60, Z(CT[3] + 20)), (X(dest), yc + 60, Z(CT[3]))], c, 1.6)
    # PAT: cable 1x10 V/A sube a la barra
    PP = [(380, AN / 2, zt + 10), (380, yp + 33, Z(BAR[3] + 10)), (380, yp + 33, Z(BAR[3]))]
    pl3(PP, VA, 2.6); pl3(PP, AMA, 1, 'stroke-dasharray="3 3"')
    # aparatos (de abajo hacia arriba, de izquierda a derecha)
    cs = sorted(comps(esq), key=lambda c: (-(c[2] + c[4]), c[1]))
    # barra PAT con aisladores
    for uu in (BAR[0], BAR[2]): h.BOX(X(uu - 10), X(uu + 10), yp, yp + 30, Z(BAR[3] + 6), Z(BAR[1] - 6), "#c23b2b", "#a32f22", "#7d2419", "#4a1510", .4)
    h.BOX(X(BAR[0]), X(BAR[2]), yp + 30, yp + 36, Z(BAR[3]), Z(BAR[1]), "url(#cuB)", "url(#cuB)", "#8a4b1c", "#5a2e0e", .5)
    for j in range(8):
        px, py = h.P(X(BAR[0] + 25 + j * 21.5), yp + 36, Z((BAR[1] + BAR[3]) / 2)); h.circ(px, py, 1.1, "#5a2e0e", "#000", .2)
    for t, u0, v0, w, hh, dd, lab in cs:
        x0, x1, z0, z1 = X(u0), X(u0 + w), Z(v0 + hh), Z(v0)
        y0, y1 = yp + 7.5, yp + 7.5 + dd
        if t in ("tm4", "tm2", "tm1", "dif"):
            h.BOX(x0, x1, y0, y1 - 18, z0, z1, "#e9eae6", "#f6f6f3", "#d5d6d1", "#555", .5)
            zz0, zz1 = z0 + hh * .28, z1 - hh * .28
            h.BOX(x0 + .5, x1 - .5, y1 - 18, y1, zz0, zz1, "#f2f2ee", "#fbfbf8", "#dcdcd6", "#555", .5)
            ph = h.P((x0 + x1) / 2, y1, (zz0 + zz1) / 2)
            h.F3([(x0 + w * .15, y1 + 1, zz0 + hh * .2), (x1 - w * .15, y1 + 1, zz0 + hh * .2), (x1 - w * .15, y1 + 1, zz0 + hh * .32), (x0 + w * .15, y1 + 1, zz0 + hh * .32)], "#2b2b2b", "#000", .3)
            if t == "dif":
                p = h.P(x1 - 7, y1, zz0 + 6); h.circ(p[0], p[1], 1.6, "#1f5fae", "#000", .3)
        elif t == "km":
            h.BOX(x0, x1, y0, y1, z0, z1, "#8c9098", "#a4a8b0", "#6f737a", "#333", .5)
            h.F3([(x0 + 4, y1, z0 + 30), (x1 - 4, y1, z0 + 30), (x1 - 4, y1, z1 - 30), (x0 + 4, y1, z1 - 30)], "#cfd2d8", "#333", .3)
        elif t == "sel":
            h.BOX(x0, x1, y0, y1, z0, z1, "#e9eae6", "#f6f6f3", "#d5d6d1", "#555", .5)
            p = h.P((x0 + x1) / 2, y1, (z0 + z1) / 2); h.circ(p[0], p[1], 2.2, "#222", "#000", .3)
        elif t == "fc":
            h.BOX(x0, x1, y0, y1, z0, z1, "#e9eae6", "#f6f6f3", "#d5d6d1", "#555", .5)
            h.F3([(x0 + 2, y1, z0 + 22), (x1 - 2, y1, z0 + 22), (x1 - 2, y1, z1 - 22), (x0 + 2, y1, z1 - 22)], "#efe9d8", "#555", .3)
        elif t in ("bpn", "b25", "bN"):
            col = {"g": GRI, "c": "#4fa3d9", "v": VA}.get(lab, GRI)
            if t == "bN": col = "#4fa3d9"
            if t == "b25": col = {"L": GRI, "N": "#4fa3d9", "R": GRI}[lab]
            h.BOX(x0, x1, y0, y1, z0, z1, sh(col, 1.15), col, sh(col, .75), "#222", .35)
        elif t == "sep": h.BOX(x0, x1, y0, y1, z0, z1, "#666", "#555", "#444", "#222", .3)
        elif t == "tope": h.BOX(x0, x1, y0, y1, z0, z1, "#9a9a9a", "#888", "#666", "#222", .3)
    # caja de toma primaria (EPEC): caja con tapa transparente, NH adentro
    cy0, cy1 = yp, yp + 150
    h.BOX(X(CT[0]), X(CT[2]), cy0, cy1 - 1, Z(CT[3]), Z(CT[1]), "#d9d4c6", "#ece8dc", "#cfc9ba", "#6b6656", .6)
    for i in range(3):
        u0 = CT[0] + 40 + i * 62
        h.BOX(X(u0), X(u0 + 40), cy1 - 60, cy1 - 30, Z(CT[1] + 184), Z(CT[1] + 34), "#2d2f33", "#3a3d42", "#202226", "#000", .4)
        h.BOX(X(u0 + 5), X(u0 + 35), cy1 - 30, cy1 - 2, Z(CT[1] + 149), Z(CT[1] + 70), "#f4f1e6", "#fbf8ee", "#ddd7c4", "#6b6656", .4)
    h.F3([(X(CT[0]), cy1, Z(CT[3])), (X(CT[2]), cy1, Z(CT[3])), (X(CT[2]), cy1, Z(CT[1])), (X(CT[0]), cy1, Z(CT[1]))], "url(#polic)", "#6b8aa3", .7)
    # medidor
    h.BOX(X(ME[0]), X(ME[2]), yp, yp + 100, Z(ME[3]), Z(ME[1]), "#eceeef", "#f7f8f9", "#cfd3d6", "#555", .6)
    h.F3([(X(ME[0] + 40), yp + 100, Z(ME[1] + 80)), (X(ME[2] - 40), yp + 100, Z(ME[1] + 80)), (X(ME[2] - 40), yp + 100, Z(ME[1] + 30)), (X(ME[0] + 40), yp + 100, Z(ME[1] + 30))], "#9fd3b8", "#333", .4)
    h.F3([(X(ME[0] + 20), yp + 100, Z(ME[3] - 10)), (X(ME[2] - 20), yp + 100, Z(ME[3] - 10)), (X(ME[2] - 20), yp + 100, Z(ME[3] - 70)), (X(ME[0] + 20), yp + 100, Z(ME[3] - 70))], "#d9dde0", "#555", .4)
    # caño flexible Ø32 (caja de toma -> medidor)
    pts = [(X(CT[2]), yp + 80, Z(CT[1] + 190)), (X(CT[2] + 40), yp + 80, Z(CT[1] + 200)), (X(ME[0] + 60), yp + 80, Z(ME[3] + 30)), (X(ME[0] + 60), yp + 80, Z(ME[3]))]
    P = [h.P(*p) for p in pts]; d = f"M{P[0][0]:.1f},{P[0][1]:.1f} C{P[1][0]:.1f},{P[1][1]:.1f} {P[2][0]:.1f},{P[2][1]:.1f} {P[3][0]:.1f},{P[3][1]:.1f}"
    h.path(d, "none", "#555", 32 * s + 1.4); h.path(d, "none", "#dfe3e7", 32 * s - .4); h.path(d, "none", "#9aa1a8", .5, 'stroke-dasharray="1.2 1.6"')
    # cables de frente (los que llegan a los bornes de cada aparato)
    yf = yp + 7.5 + 78.5 + 4
    for i, c in enumerate(FASES):
        t = comp_de(esq, "tm2" if esq == "TT" else "tm1", f"C{i+1}")
        a = km[1] + (i + .5) * 15; b = t[1] + 4.5; vv = km[2] + km[4] + 6 + i * 4
        pl3([(X(a), yp + 92, Z(km[2] + km[4])), (X(a), yf, Z(vv)), (X(b), yf, Z(vv)), (X(b), yp + 80, Z(t[2]))], c, 1.5)
    for i, c in enumerate(FASES):
        t = comp_de(esq, "tm2" if esq == "TT" else "tm1", f"C{i+1}")
        vv = t[2] + t[4] + 8 + i * 5
        pl3([(X(t[1] + 4.5), yp + 80, Z(t[2] + t[4])), (X(t[1] + 4.5), yf, Z(vv)), (X(pb[(i, 'g')]), yf, Z(vv)), (X(pb[(i, 'g')]), yp + 55, Z(RAILS[3] - 25))], c, 1.5)
    if esq == "TT":
        df = comp_de(esq, "dif")
        for i, c in enumerate(LNc):
            a = tm[1] + (i + .5) * 18; b = df[1] + (i + .5) * 18; vv = tm[2] + tm[4] + 6 + i * 4
            pl3([(X(a), yp + 80, Z(tm[2] + tm[4])), (X(a), yf, Z(vv)), (X(b), yf, Z(vv)), (X(b), yp + 75, Z(df[2] + df[4]))], c, 1.4)
        for i, c in enumerate(FASES):
            b = km[1] + (i + .5) * 15; a = df[1] + (i + .5) * 18; vv = RAILS[1] - 62 + i * 4
            pl3([(X(a), yp + 75, Z(df[2])), (X(a), yf, Z(df[2] - 8 - i * 4)), (X(df[1] + 80 + i * 4), yf, Z(df[2] - 8 - i * 4)), (X(df[1] + 80 + i * 4), yf, Z(vv)), (X(b), yf, Z(vv)), (X(b), yp + 92, Z(km[2]))], c, 1.4)
    else:
        bN = comp_de(esq, "bN")
        for i, c in enumerate(FASES):
            a = tm[1] + (i + .5) * 18; b = km[1] + (i + .5) * 15; vv = tm[2] + tm[4] + 14 + i * 4
            pl3([(X(a), yp + 80, Z(tm[2] + tm[4])), (X(a), yf, Z(vv)), (X(b), yf, Z(vv)), (X(b), yp + 92, Z(km[2]))], c, 1.4)
        a = tm[1] + 3.5 * 18; vb = tm[2] + tm[4]
        pl3([(X(a), yp + 80, Z(vb)), (X(a), yf, Z(vb + 8)), (X(bN[1] + 6.1), yf, Z(vb + 8)), (X(bN[1] + 6.1), yp + 66, Z(bN[2] + bN[4]))], CEL, 1.5)
        # puente N-PE hasta la barra
        P_ = [(X(bN[1] + 6.1), yp + 66, Z(bN[2] + bN[4])), (X(bN[1] + 6.1), yf, Z(bN[2] + bN[4] + 10)), (X(bN[1] + 6.1), yf, Z(BAR[1] - 4)), (X(bN[1] + 6.1), yp + 36, Z(BAR[1]))]
        pl3(P_, VA, 2.6); pl3(P_, AMA, 1, 'stroke-dasharray="3 3"')
        for c in range(3):
            P_ = [(X(BAR[2] - 10 - c * 20), yp + 36, Z(BAR[1])), (X(BAR[2] - 10 - c * 20), yf, Z(RAILS[3] + 44 + c * 4)), (X(pb[(c, 'v')]), yf, Z(RAILS[3] + 44 + c * 4)), (X(pb[(c, 'v')]), yp + 55, Z(RAILS[3] + 25))]
            pl3(P_, VA, 1.6)
    # techo y pared derecha del gabinete
    # techo cortado en x = 420 y pared derecha cortada a 140 del piso (para ver adentro)
    h.BOX(gx0, gx0 + 420, gy0, gy0 + GD, gz0 + GH - e, gz0 + GH, "url(#gabG)", "url(#gabG)", "#e9d3c9", "#6c706a", .7)
    h.BOX(gx0 + GW - e, gx0 + GW, gy0, gy0 + GD, gz0, gz0 + 140, "#e9d3c9", "#cfd2cc", "url(#gabG)", "#6c706a", .7)
    h.F3([(gx0 + GW, gy0, gz0), (gx0 + GW, gy0 + GD, gz0), (gx0 + GW, gy0 + GD, gz0 + 140), (gx0 + GW, gy0, gz0 + 140)], "url(#gabF)", "none", 0)
    for (a, b) in (((gx0 + GW, gy0 + GD, gz0 + 140), (gx0 + GW, gy0 + GD, gz0 + GH)), ((gx0 + GW, gy0 + GD, gz0 + GH), (gx0 + 420, gy0 + GD, gz0 + GH)), ((gx0 + GW, gy0 + GD, gz0 + GH), (gx0 + GW, gy0, gz0 + GH)), ((gx0 + GW, gy0, gz0 + GH), (gx0 + GW, gy0, gz0 + 140))):
        pa, pb2 = h.P(*a), h.P(*b); h.ln(pa[0], pa[1], pb2[0], pb2[1], "#6c706a", .7, 'stroke-dasharray="6 3"')
    # marco del frente (labio de la puerta)
    for (a, b) in (((gx0, gy0 + GD, gz0), (gx0 + GW, gy0 + GD, gz0)), ((gx0, gy0 + GD, gz0 + GH), (gx0 + 420, gy0 + GD, gz0 + GH))):
        pa, pb2 = h.P(*a), h.P(*b); h.ln(pa[0], pa[1], pb2[0], pb2[1], "#4b4f49", 1.6)
    return dict(X=X, Z=Z, yp=yp, gx0=gx0, gy0=gy0)
