"""Hojas AP-T-002 (gabinete del tablero a nivel) y AP-T-003 (elementos comunes: comando y fotocontrol en la primera columna)."""
import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT, CORES
from _tab import *

ESQ = "TNS"   # el interior se dibuja en TN-S (la ETG lo recomienda); TT en AP-T-007
LA, AN, HT, EP = 900, 400, 600, 72.5     # base tipo A (TABLERO_NIVEL / AP-TC-007)


def corte_base(h, x0, ytop, k, ancho, pvc_x=None, label=True):
    """base de mampostería cortada (AP-TC-007) + asiento + terreno. x0 = borde izq. de la base; ytop = tope de la base (+100)"""
    yb = ytop + HT * k; ya = yb + 100 * k; yn = ytop + 100 * k
    h.rect(x0 - 60 * k - 30, yn, 30, ya - yn + 30, "url(#EARTH)", K, 0)
    h.rect(x0 + ancho * k + 60 * k, yn, 30, ya - yn + 30, "url(#EARTH)", K, 0)
    h.rect(x0 - 50 * k, ya, (ancho + 100) * k, 30, "url(#EARTH)", K, 0)
    h.rect(x0 - 50 * k, yb, (ancho + 100) * k, 100 * k, "url(#CONC)", K, 1.2)
    h.rect(x0, ytop, EP * k, HT * k, "url(#ANSI31)", K, .9); h.rect(x0 + (ancho - EP) * k, ytop, EP * k, HT * k, "url(#ANSI31)", K, .9)
    h.rect(x0, ytop, ancho * k, HT * k, "none", K, 1.4)
    h.path(f"M{x0-60*k-30},{yn} H{x0-10*k} M{x0+ancho*k+10*k},{yn} H{x0+ancho*k+60*k+30}", "none", K, 1.6)
    return yb, ya, yn


# ====================================================================================================== AP-T-002
def gen002():
    h = Hoja(); h.a(EXTRA)
    # ---------- frente cerrado
    h.titulo(40, 62, "VISTA FRONTAL - CERRADO", "ESC. 1:20 - SOBRE LA BASE AP-TC-007")
    k = .16; X0, Y0 = 80, 128
    gx0 = X0 + (LA - GW) / 2 * k
    h.rect(gx0, Y0, GW * k, GH * k, "#fff", K, 1.8)
    h.rect(gx0 + 6, Y0 + 6, GW * k - 12, GH * k - 12, "none", K, .6)                 # marco
    h.rect(gx0 + 20, Y0 + 24, GW * k - 40, 50, "url(#polic)", K, .9)                  # tapa de inspección (*)
    h.txt(gx0 + GW * k / 2, Y0 + 45, "TAPA DE INSPECCION", 7.5, 700, K, "middle"); h.txt(gx0 + GW * k / 2, Y0 + 56, "POLICARBONATO UV (*)", 7.5, 400, OR, "middle")
    h.rect(gx0 + GW * k - 18, Y0 + GH * k / 2 - 10, 7, 20, "#fff", K, .8); h.txt(gx0 + GW * k - 22, Y0 + GH * k / 2 + 26, "CIERRE (*)", 7.5, 400, OR, "end")
    h.txt(gx0 + GW * k / 2, Y0 + 100, "PRFV IP65 - IK10", 8.5, 700, K, "middle")
    ytop = Y0 + GH * k
    yb, ya, yn = corte_base(h, X0, ytop, k, LA)
    h.dimH(Y0 - 10, gx0, gx0 + GW * k, "785", ext=Y0 - 2); h.dimV(X0 - 20, Y0, ytop, "830", ext=gx0 - 2)
    h.dimV(X0 - 20, ytop, yn, "100", ext=X0 - 2); h.dimH(ya + 18, X0, X0 + LA * k, "900 BASE TIPO A", ext=yb + 2, dy=13)
    # ---------- planta B-B (piso del gabinete)
    h.titulo(40, 474, "CORTE B-B (PISO)", "ESC. 1:20 - PASOS DE CABLE Y ANCLAJES")
    px, py = 80, 520
    h.rect(px, py, LA * k, AN * k, "url(#ANSI31)", K, 1.2); h.rect(px + EP * k, py + EP * k, (LA - 2 * EP) * k, (AN - 2 * EP) * k, "#fff", K, .8)
    h.rect(px + (LA - GW) / 2 * k, py + (AN - GD) / 2 * k, GW * k, GD * k, "none", K, 1.1, h.OCULTA)
    for xx, rr, t in ((250, 45, "Ø90"), (380, 25, ""), (560, 25, ""), (680, 25, ""), (790, 25, "")):
        h.circ(px + xx * k, py + AN / 2 * k, rr * k, "#fff", K, 1); h.circ(px + xx * k, py + AN / 2 * k, 1.4, K, K, 0)
    for xa in (LA / 2 - GW / 2 + 40, LA / 2 + GW / 2 - 40):
        for ya_ in (EP / 2, AN - EP / 2): h.circ(px + xa * k, py + ya_ * k, 2.2, "#fff", K, .8)
    h.txt(px + 250 * k + 4, py - 16, "Ø90", 8, 700, K, "middle"); h.txt(px + 380 * k, py - 16, "PAT", 8, 700, K, "middle"); h.txt(px + 680 * k, py - 16, "PEAD Ø50 x CIRC.", 8, 700, K, "middle")
    xA = px + 250 * k
    h.ln(xA, py - 10, xA, py + AN * k + 10, K, .8, h.EJE)
    for yy in (py - 10, py + AN * k + 10): h.ln(xA - 6, yy, xA + 6, yy, K, 1.6)
    h.txt(xA - 8, py - 3, "A", 12, 700, K, "end")
    h.dimV(px + LA * k + 16, py, py + AN * k, "400", ext=px + LA * k + 2)
    # ---------- frente abierto
    h.titulo(270, 62, "VISTA FRONTAL - ABIERTO", "ESC. 1:10 - SIN PUERTA - INTERIOR EN TN-S (VER AP-T-007 / 008)")
    ka = .385; XA, YA = 300, 128
    F = frente(h, XA, YA, ka, ESQ)
    # línea de corte A-A en el frente (pasa por el PVC Ø90 y la caja de toma)
    xa_ = XA + PVC_U * ka
    h.ln(xa_, YA - 6, xa_, YA + GH * ka + 6, K, .8, h.EJE)
    gx = 630; slots = iter(range(118, 520, 33))
    def gl(n, u, v, c=K):
        x, y = F(u, v); h.globo(n, x, y, gx, next(slots), c)
    gl("3", CT[0] + 222, CT[1] + 120); gl("4", CT[0] + 60, CT[1] + 120); gl("5", CT[0] + 262, CT[1] + 110)
    gl("6", ME[0] + 80, ME[3] + 40, OR); gl("7", ME[2] - 20, ME[1] + 160); gl("9", 40, 640, OR)
    gl("8", RU1 - 6, RAILS[1] + 10); gl("10", comp_de(ESQ, "km")[1] + 40, RAILS[1] + 30); gl("11", BAR[2] - 10, BAR[1] + 10)
    gl("15", PVC_U + 30, GH - 14); gl("16", PEAD_U[2] + 8, GH - 14); gl("17", PAT_U + 6, GH - 20, OR)
    # ---------- corte A-A (lateral, por el PVC Ø90)
    h.titulo(668, 62, "CORTE A-A", "ESC. 1:20 - POR EL PVC Ø90")
    kc = .2; cx0, cy0 = 700, 128          # cx0 = cara del fondo de la base (y = 0)
    yt = cy0 + GH * kc
    yb2, ya2, yn2 = corte_base(h, cx0, yt, kc, AN)
    gy0 = cx0 + (AN - GD) / 2 * kc
    h.rect(gy0, cy0, GD * kc, GH * kc, "#fff", K, 1.8); h.rect(gy0 + 2, cy0 + 2, GD * kc - 4, GH * kc - 4, "none", K, .5)
    h.ln(gy0 + GD * kc, cy0 + 4, gy0 + GD * kc, yt - 4, "#fff", 2.2); h.ln(gy0 + GD * kc, cy0, gy0 + GD * kc, yt, K, .6, 'stroke-dasharray="2 2"')
    h.txt(gy0 + GD * kc + 3, cy0 + 12, "FRENTE", 7.5, 700)
    # placa, rieles de perfil, caja de toma y aparatos de costado
    pl_ = gy0 + 12 * kc; h.ln(pl_, cy0 + 24 * kc, pl_, yt - 24 * kc, K, 1.2)
    for v in RAILS: h.rect(pl_, cy0 + (v - 17.5) * kc, 7.5 * kc + 1, 35 * kc, K, K, 0); h.rect(pl_ + 2, cy0 + (v - 42.5) * kc, 78.5 * kc, 85 * kc, "#fff", K, .6)
    h.rect(pl_, cy0 + CT[1] * kc, 150 * kc, (CT[3] - CT[1]) * kc, "#fff", OR, .8)
    h.txt(pl_ + 16, cy0 + (CT[1] + 100) * kc, "CAJA", 6.5, 700, OR)
    # PVC Ø90: viene de EPEC de frente por debajo del asiento, codo y sube; el cable sube hasta la caja de toma
    ypv = ya2 + 14; xr = cx0 + AN / 2 * kc
    d = f"M{xr},{yb2-100*kc} V{ypv-6} Q{xr},{ypv} {xr+6},{ypv} H{cx0+AN*kc+80}"
    h.path(d, "none", K, 90 * kc + 2.2); h.path(d, "none", "#fff", 90 * kc)
    h.path(f"M{xr},{cy0+CT[3]*kc} V{ypv-6} Q{xr},{ypv} {xr+6},{ypv} H{cx0+AN*kc+80}", "none", K, 1.8)
    h.txt(cx0 + AN * kc + 62, ypv - 12, "DE EPEC", 8.5, 700, K, "end")
    h.nivel(cx0 + AN * kc + 14, yn2, "±0,00")
    h.dimV(cx0 - 22, cy0, yt, "830", ext=gy0 - 2); h.dimV(cx0 - 22, yt, yb2, "600", ext=cx0 - 2); h.dimV(cx0 - 22, yb2, ya2, "100", ext=cx0 - 52 * kc)
    h.dimH(cy0 - 10, gy0, gy0 + GD * kc, "320", ext=cy0 - 2); h.dimH(ya2 + 50, cx0, cx0 + AN * kc, "400", ext=yb2 + 2, dy=14)
    h.globo("15", xr + 40, ypv, 800, ya2 + 44); h.globo("13", gy0 + 4, yt - 2, 820, yt - 30); h.globo("1", gy0 + GD * kc - 2, cy0 + 70, 820, cy0 + 40)
    h.globo("12", cx0 + (AN - 30) * kc, yt + 70, 826, yt + 70)
    # ---------- D1 caja de toma (NH T00)
    h.titulo(40, 610, "D1 - CAJA DE TOMA PRIMARIA", "ESC. 1:2 - NH T00 + TERMINAL DE NEUTRO (EPEC)")
    kd = 1.0; dx, dy = 70, 656
    for i in range(3):
        bx = dx + i * 52
        h.rect(bx, dy, 40, 150, "#fff", K, 1)                        # base T00 (*)
        h.rect(bx + 5, dy + 36, 30, 79, "#fff", K, 1.1)              # cartucho NH00 79 x 30
        h.rect(bx + 12, dy + 26, 16, 10, "#ddd", K, .6); h.rect(bx + 12, dy + 115, 16, 10, "#ddd", K, .6)
        h.rect(bx + 14, dy + 66, 12, 18, "#fff", K, .6); h.txt(bx + 20, dy + 100, "63A", 7.5, 700, K, "middle")
        h.circ(bx + 20, dy + 10, 3, "#fff", K, .7); h.circ(bx + 20, dy + 140, 3, "#fff", K, .7)
        h.txt(bx + 20, dy - 5, ["L1", "L2", "L3"][i], 9, 700, K, "middle")
    h.dimV(dx - 14, dy + 36, dy + 115, "79 x 30 NH00", ext=dx + 3)
    h.dimV(dx + 160, dy, dy + 150, "150 (*)", ext=dx + 146, c=OR)
    nx = dx + 180
    h.rect(nx, dy + 50, 50, 34, "#fff", K, 1); [h.circ(nx + 10 + j * 15, dy + 67, 4, "#fff", K, .7) for j in range(3)]
    h.txt(nx + 25, dy + 100, "TERMINAL N", 8.5, 700, K, "middle")
    h.globo("4", dx + 25, dy + 80, dx + 30, dy + 176); h.globo("3", dx + 72, dy + 50, dx + 70, dy + 176); h.globo("5", nx + 25, dy + 84, nx + 25, dy + 176)
    # ---------- D2 riel y módulo
    h.titulo(320, 610, "D2 - RIEL NS35 Y MODULO", "ESC. 1:2 - CORTE Y FRENTE")
    rx, ry = 350, 680
    h.path(f"M{rx},{ry} h7.5 v5 h-1 v25 h1 v5 h-7.5 v-1 h6.5 v-3 h-1 v-27 h1 v-3 h-6.5 z", "url(#ANSI31)", K, 1)   # perfil (esquemático)
    h.dimV(rx - 10, ry, ry + 35, "35", ext=rx - 2); h.dimH(ry - 10, rx, rx + 7.5, "7,5", ext=ry - 2)
    tx = rx + 9
    h.path(f"M{tx},{ry-25} h78.5 v85 h-78.5 z", "#fff", K, 1.1); h.rect(tx + 60, ry - 5, 18.5, 45, "#fff", K, .8)
    h.dimH(ry + 76, tx, tx + 78.5, "78,5", ext=ry + 62, dy=14); h.dimV(tx + 92, ry - 25, ry + 60, "85", ext=tx + 80)
    fx = rx + 130
    for p in range(4):
        h.rect(fx + p * 18, ry - 25, 18, 85, "#fff", K, 1); h.circ(fx + p * 18 + 9, ry - 18, 2.5, "#fff", K, .6); h.circ(fx + p * 18 + 9, ry + 53, 2.5, "#fff", K, .6)
    h.rect(fx + 6, ry + 10, 60, 10, "#333", K, .6)
    h.dimH(ry - 36, fx, fx + 18, "18", ext=ry - 27); h.dimH(ry + 76, fx, fx + 72, "72 (4P)", ext=ry + 62, dy=14)
    h.txt(rx, ry + 120, "1 POLO = 18 mm DE RIEL (iC60N). EN 500 ENTRAN 27.", 8.5, 400, G)
    # ---------- D3 paso de cables por el piso
    h.titulo(600, 610, "D3 - PASO DEL PISO", "ESC. 1:5 - CABLE QUE ENTRA AL GABINETE")
    sx, sy = 640, 750
    h.rect(sx - 20, sy, 200, 9, "url(#ANSI31)", K, 1)
    h.txt(sx + 186, sy - 4, "PISO GABINETE (*)", 8, 400, OR, "end")
    h.rect(sx + 30, sy - 2, 46, 13, "#fff", K, 0)
    h.rect(sx + 26, sy + 9, 54, 70, "url(#ANSI31)", K, .8); h.rect(sx + 30, sy + 9, 46, 70, "#fff", K, .6)     # PVC Ø90 en corte (esc. 1:5 aprox.)
    h.rect(sx + 30, sy - 4, 46, 14, "url(#FOAM)", OR, .8)
    h.ln(sx + 53, sy - 70, sx + 53, sy + 80, K, 5); h.ln(sx + 53, sy - 70, sx + 53, sy + 80, "#fff", 2)
    h.txt(sx + 80, sy - 40, "CABLE DE EPEC", 8.5, 700); h.txt(sx + 84, sy + 20, "SELLO DEL PASO (*)", 8.5, 400, OR)
    h.txt(sx + 84, sy + 50, "PVC Ø90 (BASE)", 8.5, 700)
    h.txt(600, 846, "EL GABINETE ES IP65: EL PASO SE SELLA (*).", 9, 400, OR)
    # ---------- cómputo
    filas = [("RIEL", "APARATOS (TN-S, 3 CIRC.)", "mm", "LIBRE"),
             ("1", "TM GRAL 4P 72 + BORNE N 12,2", "84,2", "415,8"),
             ("2", "KM 45 + SELEC. 18 + FUS. 18 + 3 x 6,2 (*)", "99,6", "400,4"),
             ("3", "3 TM 1P x 18", "54,0", "446,0"),
             ("4", "3 x (3 BPN x 8,2 + SEP. 2) + 2 TOPES x 5", "89,8", "410,2"),
             ("TOTAL", "4 BARRAS x 500 = 2000 mm DE RIEL", "327,6", "1672,4")]
    h.tabla(40, 866, [(52, "c", False), (300, "l", False), (64, "c", True), (64, "c", True)], filas, rowh=18,
            titulo="COMPUTO - OCUPACION DE LOS RIELES", colores=lambda i, j, t: OR if "(*)" in t else K)
    h.txt(40, 1006, "EN TT SE SUMA EL ID 4P (72) EN EL RIEL 1 Y LAS SALIDAS SON 2P (3 x 36 = 108).", 9.5, 400, G)
    h.rayados(580, 866, [("ANSI31", "CORTE / LADRILLO"), ("CONC", "H° SIMPLE"), ("EARTH", "TERRENO"), ("FOAM", "SELLO (*)")], cols=2, dx=130)
    h.ln(580, 944, 610, 944, K, .8, h.EJE); h.txt(618, 948, "LINEA DE CORTE A-A", 10.5)
    h.notas(40, 1040, ["GABINETE PRFV TERMORIGIDO 785 x 830 x 320, IP65 - IK10, MARCO Y TAPA DE INSPECCION DE POLICARBONATO UV (FICHA AP-T-002).",
                       "CAJA DE TOMA CON NH T00 UNITRIPOLAR (CARTUCHO NH00 79 x 58 x 30) Y TERMINAL DE NEUTRO: LA PROVEE EPEC. FLEXIBLE PVC Ø32.",
                       "RIEL DIN NS35 EN CUATRO BARRAS DE 50 cm. EL INTERIOR SALE DEL ESQUEMA: TT (AP-T-007) O TN-S (AP-T-008).",
                       "(*) UBICACION DE TAPA, CIERRE, CAJA DE TOMA, MEDIDOR, PLACA, RIELES Y SELLO DEL PISO: A CONFIRMAR CON EL PLANO OFICIAL.",
                       "(*) PAÑOL: 3020 (530 x 430 x 200) ES EL GABINETE AEREO; EL TIPO B A NIVEL NO TIENE CODIGO PROPIO (SE PIDE ARMADO, 3058)."])
    # ---------- 3D
    h.titulo(890, 62, "VISTA 3D - GABINETE TIPO B ABIERTO SOBRE SU BASE", "SIN PUERTA, TECHO Y LADO DERECHO CORTADOS; BASE AP-TC-007 CORTADA: PVC Ø90 DE EPEC Y PEAD Ø50 POR CIRCUITO")
    g = g3d(h, 1160, 314, .25, ESQ)
    X, Z, yp = g["X"], g["Z"], g["yp"]
    GX = 1468; yy = 98
    for n, p, t in (("1", (X(GW), 300, Z(500)), "GABINETE PRFV IP65 IK10"),
                    ("3", (X(CT[0] + 120), yp + 150, Z(CT[1] + 100)), "CAJA DE TOMA - NH T00"),
                    ("6", (X(ME[0] + 70), yp + 80, Z(ME[3] + 20)), "FLEXIBLE PVC Ø32"),
                    ("7", (X(ME[2] - 30), yp + 100, Z(ME[1] + 150)), "MEDIDOR EPEC"),
                    ("8", (X(RU1 - 30), yp + 7, Z(RAILS[1] + 10)), "RIEL DIN NS35 (4 x 500)"),
                    ("10", (X(comp_de(ESQ, "km")[1] + 40), yp + 99, Z(RAILS[1])), "APARATOS (AP-T-007/008)"),
                    ("11", (X(BAR[2] - 30), yp + 36, Z(BAR[1] + 4)), "BARRA PAT"),
                    ("12", (LA - 40, AN, 0), "BASE AP-TC-007"),
                    ("16", (1030, 280, -690), "PEAD Ø50 A LA ZANJA")):
        h.g3(n, p, GX, yy, t, OR if n == "6" else NV); yy += 33
    h.g3("15", (250, 640, -640), 905, 545, "PVC Ø90 DE EPEC")
    L = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "GABINETE PRFV TERMORIGIDO 785 x 830 x 320 IP65 IK10 (ARMADO)", "1", "3058"),
         ("2", "MARCO Y TAPA DE INSPECCION POLICARBONATO UV", "1", "CON EL 1"),
         ("3", "CAJA DE TOMA PRIMARIA C/ SECCIONADOR NH T00 (EPEC)", "1 (3 POLOS)", "3055"),
         ("4", "FUSIBLE NH00 gL 63 A", "3", "3004"),
         ("5", "TERMINAL DE NEUTRO (EPEC)", "1", "EPEC"),
         ("6", "CAÑO FLEXIBLE PVC Ø32 CON TERMINAL DE AJUSTE", "1", "A VINCULAR"),
         ("7", "MEDIDOR TRIFASICO (LO PROVEE EPEC)", "1", "3049"),
         ("8", "RIEL DIN NS35 - CUATRO BARRAS DE 500", "4", "2038"),
         ("9", "PLACA DE MONTAJE (*)", "1", "A VINCULAR"),
         ("10", "APARATOS DE PROTECCION Y COMANDO S/ ESQUEMA", "1 JUEGO", "AP-T-007/008"),
         ("11", "BARRA DE PUESTA A TIERRA 125 A", "1", "7001"),
         ("12", "BASE DE MAMPOSTERIA TIPO A (0,900 x 0,400 x 0,60)", "1", "VER AP-TC-007"),
         ("13", "KWIK BOLT 1/2\" x 15 cm + TUERCA Y ARANDELA / SELLADOR", "4 / 2,60 m", "8002 / 8026"),
         ("14", "CABLE DE ACOMETIDA (LO DEFINE EPEC)", "-", "EPEC"),
         ("15", "CAÑO PVC Ø90 - INGRESO DE LA ACOMETIDA EPEC", "1", "5010"),
         ("16", "CAÑO PEAD Ø50 PN6 - SALIDA, 1 POR CIRCUITO", "N", "5005"),
         ("17", "CAÑO PVC Ø50 - CONDUCTO DE PAT (*)", "1", "5009")]
    h.tabla(890, 652, [(40, "c", False), (470, "l", False), (90, "c", True), (150, "c", False)], L, rowh=19,
            titulo="LISTA DE MATERIALES (1 GABINETE A NIVEL)", colores=lambda i, j, t: OR if (t == "A VINCULAR" or "(*)" in t) else K)
    h.rotulo(890, h.H - 150, 750, "AP-T-002", "GABINETE DEL TABLERO", "A NIVEL - TIPO B", "FRENTES, CORTES A-A Y B-B, DETALLES Y 3D", "1:20 / 1:10", "D1-D2 1:2, D3 1:5, 3D S/E", fecha="07/11/2026")
    h.guardar("ap_t_002.svg"); print("ok AP-T-002")


# ====================================================================================================== AP-T-003
def gen003():
    h = Hoja(); h.a(EXTRA)
    # ---------- corte longitudinal tablero -> primera columna
    h.titulo(40, 62, "CORTE LONGITUDINAL - TABLERO A LA PRIMERA COLUMNA", "ESC. 1:50 - EL FOTOCONTROL VA EN LA COLUMNA MAS CERCANA, NO EN EL TABLERO")
    k = .04; y0 = 420                      # nivel ±0,00
    xb = 70                                 # borde izq. de la base
    # terreno
    h.rect(40, y0, 800, 80, "url(#EARTH)", K, 0)
    # base y gabinete
    h.rect(xb, y0 - 100 * k, LA * k, 700 * k, "url(#ANSI31)", K, 1)
    h.rect(xb - 50 * k, y0 + 600 * k, (LA + 100) * k, 100 * k, "url(#CONC)", K, .8)
    gx = xb + (LA - GW) / 2 * k; h.rect(gx, y0 - 100 * k - GH * k, GW * k, GH * k, "#fff", K, 1.6)
    h.txt(gx + GW * k / 2, y0 - 100 * k - GH * k - 6, "TABLERO", 9, 700, K, "middle")
    # zanja (AP-TC-001): tapada 0,60 + 0,15 -> 0,75
    zx0, zx1 = xb + LA * k, 640; zy = y0 + 750 * k
    h.rect(zx0, y0, zx1 - zx0, 750 * k, "url(#ANSI37)", K, .6)
    h.rect(zx0, zy - 150 * k, zx1 - zx0, 150 * k, "url(#SAND)", K, .6)
    h.ln(40, y0, 840, y0, K, 1.8)
    # corte (rotura) del largo
    mx = 360
    h.rect(mx - 8, y0 - 6, 16, 90, "#fff", None, 0)
    h.path(f"M{mx-4},{y0-14} l4,8 l-8,8 l8,8 l-8,8 l8,8 l-4,8 V{y0+90}", "none", K, .8); h.path(f"M{mx+4},{y0-14} l4,8 l-8,8 l8,8 l-8,8 l8,8 l-4,8 V{y0+90}", "none", K, .8)
    # columna PRFV 7 m con su fundación 0,60 x 0,60 x 1,20 (AP-TC-003-A)
    cx = 700
    h.rect(cx - 300 * k, y0, 600 * k, 1200 * k, "url(#CONC)", K, 1.1)
    h.path(f"M{cx-197/2*k},{y0+1100*k} L{cx-130/2*k},{y0-7000*k} H{cx+130/2*k} L{cx+197/2*k},{y0+1100*k} Z", "#fff", K, 1.4)
    h.txt(cx + 10, y0 - 7000 * k + 6, "PRFV 7 m (AP-C-033-A)", 9, 700)
    # caja a 3,50 y fotocontrol (*)
    ycj = y0 - 3500 * k
    h.rect(cx - 4, ycj - 6, 8, 12, "#fff", K, .8); h.txt(cx + 12, ycj + 3, "CAJA A 3,50", 8.5, 700)
    yfc = y0 - 6000 * k
    h.rect(cx + 130 / 2 * k, yfc - 2, 14, 4, "#fff", OR, .8); h.rect(cx + 130 / 2 * k + 12, yfc - 22, 14, 20, "#fff", OR, 1.1)
    h.path(f"M{cx+130/2*k+12},{yfc-22} q7,-10 14,0", "#fff", OR, 1.1)
    h.txt(cx + 34, yfc - 10, "FOTOCONTROL", 9, 700); h.txt(cx + 34, yfc + 2, "ALTURA Y FIJACION (*)", 8.5, 400, OR)
    # cable de comando: sale del tablero por el PEAD, va por la zanja, entra a la columna, sube a la caja y al FC
    ycab = zy - 75 * k
    cmd = f"M{gx+GW*k*.6},{y0-100*k-GH*k*.3} V{y0+500*k} Q{gx+GW*k*.6},{ycab} {gx+GW*k*.6+8},{ycab} H{cx-8} Q{cx},{ycab} {cx},{ycab-8} V{yfc+6} H{cx+130/2*k+12}"
    h.path(cmd, "none", K, 2.4); h.path(cmd, "none", "#fff", .8)
    h.rect(392, ycab - 18, 156, 14, "#fff", None, 0); h.txt(470, ycab - 7, "CABLE DE COMANDO Cu 3 x 1,5 mm²", 9, 700, K, "middle")
    h.rect(400, zy + 6, 140, 14, "#fff", None, 0); h.txt(470, zy + 17, "EN LA ZANJA DEL CIRCUITO (*)", 8.5, 400, OR, "middle")
    # cotas
    h.dimV(cx - 70, y0 - 7000 * k, y0, "7000", ext=cx - 10)
    h.dimV(cx - 44, ycj, y0, "3500", ext=cx - 6)
    h.dimV(cx + 100, y0, y0 + 1200 * k, "1200", ext=cx + 300 * k + 2)
    h.dimV(zx0 + 40, y0, zy, "750", ext=None)
    h.dimV(xb - 18, y0 - 100 * k - GH * k, y0 - 100 * k, "830", ext=gx - 2)
    h.dimH(y0 + 86, xb + LA * k, cx, "d = PRIMERA COLUMNA MAS CERCANA (S/ PROYECTO)", ext=y0 + 2, dy=14)
    h.nivel(560, y0, "±0,00")
    h.globo("4", 300, ycab, 300, ycab - 40); h.globo("1", cx + 130 / 2 * k + 20, yfc - 22, 620, yfc - 50)
    h.globo("3", cx + 130 / 2 * k + 4, yfc, 620, yfc - 16, OR)
    h.globo("12", gx + GW * k * .6, y0 + 300 * k, 150, y0 + 60)
    # ---------- frente: zona de comando (ampliada)
    h.titulo(40, 545, "VISTA FRONTAL - ZONA DE COMANDO", "ESC. 1:4 - LOS ELEMENTOS COMUNES A TT Y TN-S, CON SUS CABLES")
    ka = 1.0; u0, v0, u1, v1 = 140, 300, 520, 560
    XA, YA = 60 - u0 * ka, 590 - v0 * ka
    h.a(f'<clipPath id="clz"><rect x="60" y="590" width="{(u1-u0)*ka}" height="{(v1-v0)*ka}"/></clipPath><g clip-path="url(#clz)">')
    F = frente(h, XA, YA, ka, ESQ, cotas=False)
    h.a('</g>'); h.rect(60, 590, (u1 - u0) * ka, (v1 - v0) * ka, "none", K, 1, 'stroke-dasharray="6 3"')
    gxl = 460; slots = iter(range(600, 860, 34))
    def gl(n, u, v, c=K):
        x, y = F(u, v); h.globo(n, x, y, gxl, next(slots), c)
    km = comp_de(ESQ, "km"); sel = comp_de(ESQ, "sel"); fc = comp_de(ESQ, "fc"); bR = comp_de(ESQ, "b25", "R")
    tm = comp_de(ESQ, "tm4")
    gl("9", tm[1] + 50, tm[2] + 60, OR); gl("5", km[1] + 40, km[2] + 60); gl("6", sel[1] + 14, sel[2] + 70); gl("7", fc[1] + 14, fc[2] + 64, OR)
    gl("8", bR[1] + 5, bR[2] + 40); gl("4", 470, 520); gl("11", RU1 - 30, RAILS[1] + 12)
    h.dimH(590 + (RAILS[1] - 42.5 - v0) * ka - 10, *[F(u, 0)[0] for u in (km[1], km[1] + 45)], "45", ext=None)
    h.dimV(F(km[1], 0)[0] - 10, F(0, km[2])[1], F(0, km[2] + 85)[1], "85", ext=None)
    # ---------- esquema de comando (color)
    h.titulo(500, 545, "ESQUEMA DE COMANDO", "S/E - L1 MARRON - N CELESTE - RETORNO VIOLETA (*)")
    ex, ey = 520, 610
    h.ln(ex, ey, ex + 300, ey, MAR, 2.2); h.txt(ex - 4, ey + 4, "L1", 9, 700, K, "end")
    h.ln(ex, ey + 250, ex + 300, ey + 250, CEL, 2.2); h.txt(ex - 4, ey + 254, "N", 9, 700, K, "end")
    h.txt(ex + 302, ey - 6, "DESPUES DEL TM GENERAL", 8, 400, G, "end")
    c1 = ex + 40
    h.circ(c1, ey, 2.4, K, K, 0); h.ln(c1, ey, c1, ey + 30, MAR, 1.8)
    h.rect(c1 - 5, ey + 30, 10, 26, "#efe9d8", K, 1); h.txt(c1 + 10, ey + 47, "FUSIBLE 2 A", 8.5, 700)
    h.ln(c1, ey + 56, c1, ey + 80, MAR, 1.8); h.rect(c1 - 4, ey + 80, 8, 12, GRI, K, .7); h.txt(c1 + 10, ey + 90, "BORNE L", 8.5, 700)
    # columna (FC)
    fx = ex + 150
    h.rect(fx - 40, ey + 40, 120, 90, "none", K, .8, 'stroke-dasharray="5 3"'); h.txt(fx + 20, ey + 54, "EN LA COLUMNA", 8, 700, K, "middle")
    h.circ(fx + 20, ey + 88, 20, "#f3f4f6", K, 1); h.txt(fx + 20, ey + 92, "FC", 9, 700, K, "middle")
    for j in range(2): h.path(f"M{fx+44+j*7},{ey+60} l-8,10 m0,0 l1,-5 m-1,5 l5,-1", "none", K, .8)
    h.path(f"M{c1},{ey+92} V{ey+102} H{fx}", "none", MAR, 1.8)
    h.txt(fx - 10, ey + 98, "L", 8, 700, K, "end")
    h.path(f"M{fx+20},{ey+108} V{ey+250}", "none", CEL, 1.6); h.txt(fx + 24, ey + 122, "N", 8, 700)
    h.path(f"M{fx+40},{ey+88} H{fx+60} V{ey+150} H{c1}", "none", "#7a5ea8", 1.8); h.txt(fx + 64, ey + 120, "CARGA (*)", 8, 400, OR)
    h.rect(c1 - 4, ey + 144, 8, 12, GRI, K, .7); h.txt(c1 - 8, ey + 154, "BORNE R", 8.5, 700, K, "end")
    h.ln(c1, ey + 156, c1, ey + 170, "#7a5ea8", 1.8)
    # selectora A-M: en A pasa el retorno; en M toma L1 directo
    h.ln(c1, ey + 170, c1 + 10, ey + 186, K, 1.4); h.ln(c1, ey + 188, c1, ey + 196, K, 1.4)
    h.txt(c1 + 12, ey + 172, "A", 8.5, 700)
    h.path(f"M{c1-30},{ey} V{ey+170} M{c1-30},{ey+170} l10,16 M{c1-30},{ey+188} V{ey+196} H{c1}", "none", MAR, 1.4)
    h.circ(c1 - 30, ey, 2.4, K, K, 0); h.txt(c1 - 34, ey + 182, "M", 8.5, 700, K, "end")
    h.ln(c1 - 26, ey + 178, c1 + 4, ey + 178, K, .6, 'stroke-dasharray="3 2"'); h.txt(c1 + 26, ey + 182, "SELECTORA", 7.5, 700)
    h.ln(c1, ey + 196, c1, ey + 208, "#7a5ea8", 1.8); h.rect(c1 - 12, ey + 208, 24, 16, "#fff", K, 1.2); h.txt(c1 + 16, ey + 220, "BOBINA KM A1-A2", 8.5, 700)
    h.ln(c1, ey + 224, c1, ey + 250, CEL, 1.8); h.circ(c1, ey + 250, 2.4, K, K, 0)
    h.txt(c1 + 16, ey + 232, "220 V", 8, 400, G)
    # contactos del KM
    kx = ex + 245
    for j, c in enumerate(FASES):
        h.ln(kx + j * 16, ey + 150, kx + j * 16, ey + 166, c, 1.6); h.ln(kx + j * 16, ey + 166, kx + j * 16 + 6, ey + 180, K, 1.2); h.ln(kx + j * 16, ey + 182, kx + j * 16, ey + 196, c, 1.6)
        h.path(f"M{kx+j*16},{ey+196} l-3,-5 m3,5 l3,-5", "none", c, 1.2)
    h.ln(kx - 4, ey + 174, kx + 36, ey + 174, K, .6, 'stroke-dasharray="3 2"'); h.ln(c1 + 12, ey + 216, kx - 4, ey + 216, K, .6, 'stroke-dasharray="3 2"')
    h.ln(kx - 4, ey + 216, kx - 4, ey + 174, K, .6, 'stroke-dasharray="3 2"')
    h.txt(kx + 16, ey + 144, "KM 1-3-5", 8, 700, K, "middle"); h.txt(kx + 16, ey + 212, "A LAS SALIDAS", 8, 400, G, "middle")
    # ---------- D1 fotocontrol y zócalo
    h.titulo(40, 885, "D1 - FOTOCONTROL Y ZOCALO", "S/E - SE ENCHUFA CON TRABA DE GIRO")
    fx, fy = 80, 935
    h.path(f"M{fx},{fy+40} V{fy+10} Q{fx+35},{fy-22} {fx+70},{fy+10} V{fy+40} Z", "#fff", K, 1.2)
    h.rect(fx + 22, fy + 2, 26, 12, "#fff", K, .7); h.txt(fx + 35, fy + 11, "SENSOR", 5.5, 700, K, "middle")
    h.rect(fx - 4, fy + 40, 78, 10, "#fff", K, 1)
    for j in range(3): h.rect(fx + 16 + j * 18, fy + 50, 3, 10, K, K, 0)
    h.rect(fx - 8, fy + 64, 86, 16, "#fff", K, 1); h.txt(fx + 35, fy + 76, "ZOCALO 3 PATAS", 7.5, 700, K, "middle")
    h.txt(fx + 90, fy + 20, "CUERPO IP65 (*)", 8.5, 400, OR); h.txt(fx + 90, fy + 58, "PATAS L - N - CARGA (*)", 8.5, 400, OR)
    h.txt(fx + 90, fy + 76, "MEDIDAS A CONFIRMAR (*)", 8.5, 400, OR)
    h.globo("1", fx + 60, fy + 20, fx + 70, fy - 20 + 0) if False else None
    # ---------- datos del fotocontrol (pliego Municipalidad, ficha técnica)
    fil = [("DATO", "VALOR (PLIEGO)"), ("ENCIENDE CON", "10 lux (± 30 %)"), ("APAGA CON", "60 lux O MENOS"), ("RETARDO", "10 A 90 s"),
           ("CORRIENTE", "10 A MINIMO"), ("TENSION", "195 A 270 V"), ("MANIOBRAS", "4000 O MAS")]
    h.tabla(318, 885, [(96, "l", False), (124, "l", True)], fil, rowh=17, titulo="DATOS DEL FOTOCONTROL")
    # ---------- cómputo del cable de comando
    fc_ = [("TRAMO", "m", "DE DONDE"), ("ZANJA TAB. - COLUMNA", "d", "S/ PROYECTO"), ("BAJADA/SUBIDA BASE", "(*)", "A CONFIRMAR"),
           ("SUBIDA A LA CAJA", "3,50", "AP-C-033-A"), ("CAJA - FC", "(*)", "ALTURA FC"), ("RESERVA", "0,60", "CALCULADORA"), ("TOTAL", "d+4,1+(*)", "")]
    h.tabla(556, 885, [(118, "l", False), (78, "c", True), (88, "l", False)], fc_, rowh=17, titulo="COMPUTO - CABLE 3 x 1,5",
            colores=lambda i, j, t: OR if "(*)" in t or "CONFIRMAR" in t or "ALTURA" in t else K)
    h.notas(40, 1062, ["AP-T-003: «EL TABLERO SE COMANDARA DESDE INTERRUPTOR FOTOELECTRICO INSTALADO EN LA PRIMERA COLUMNA MAS CERCANA».",
                       "EN EL TABLERO AEREO (AP-T-007/008) EL FOTOCONTROL VA EN EL MISMO APOYO, CON ABRAZADERAS O ZUNCHOS PROPIOS.",
                       "(*) LOS PLANOS PIDEN FOTOCONTROL ELECTROMECANICO (IRAM-AADL J20-24/25); LA PLANILLA, ELECTRONICO: SIN RESOLVER.",
                       "(*) RECORRIDO DEL CABLE, ALTURA DEL FC, FIJACION, PATAS DEL ZOCALO Y COLOR DEL RETORNO: A CONFIRMAR CON EL PLANO."])
    # ---------- 3D: gabinete abierto + recuadro de la columna con el fotocontrol
    h.titulo(890, 62, "VISTA 3D - ELEMENTOS COMUNES DEL TABLERO", "GABINETE SIN PUERTA, TECHO Y LADO DERECHO CORTADOS; EL COMANDO SALE POR EL PEAD HACIA LA COLUMNA")
    g = g3d(h, 1160, 314, .25, ESQ)
    X, Z, yp = g["X"], g["Z"], g["yp"]
    GX = 1468; yy = 98
    for n, p, t, c in (("5", (X(km[1] + 40), yp + 99, Z(km[2] + 60)), "CONTACTOR KM 25 A", NV),
                       ("6", (X(sel[1] + 9), yp + 77, Z(sel[2] + 40)), "SELECTORA A-M", NV),
                       ("7", (X(fc[1] + 9), yp + 77, Z(fc[2] + 40)), "FUSIBLE 2 A (*)", OR),
                       ("8", (X(bR[1] + 3), yp + 55, Z(bR[2] + 20)), "BORNES DE COMANDO", NV),
                       ("9", (X(tm[1] + 50), yp + 86, Z(tm[2] + 40)), "TM GENERAL", OR),
                       ("10", (X(BAR[2] - 30), yp + 36, Z(BAR[1] + 4)), "BARRA PAT", NV),
                       ("12", (1030, 150, -640), "PEAD CON EL COMANDO", NV)):
        h.g3(n, p, GX, yy, t, c); yy += 33
    # recuadro: la primera columna con el fotocontrol
    bx0, by0, bw, bh = 896, 112, 180, 250
    h.rect(bx0, by0, bw, bh, "#fff", K, .8)
    h.txt(bx0 + 6, by0 + 14, "EN LA 1RA COLUMNA (*)", 9, 700, NV)
    h.iso(.11, bx0 + 70, by0 + 262)
    h.tuboZ(900, 2000, 0, 0, 84, 78, "url(#prfv)", "#333")
    # abrazadera y soporte (*)
    h.tuboZ(1750, 1800, 0, 0, 82, 82, "url(#galv)", "#333")
    p0 = h.P(0, 82, 1775); p1 = h.P(0, 260, 1775); h.ln(p0[0], p0[1], p1[0], p1[1], "#6c7883", 3)
    h.tuboZ(1775, 1840, 0, 260, 40, 40, "#d9dde0", "#555")
    pt = h.P(0, 260, 1840); h.path(f"M{pt[0]-4.4},{pt[1]} q4.4,-9 8.8,0", "#f3f4f6", "#555", .8)
    # cable 3x1,5 que sale de la columna y entra al fotocontrol
    a = h.P(0, 78, 1600); b = h.P(0, 200, 1700); c_ = h.P(0, 260, 1775)
    h.path(f"M{a[0]:.1f},{a[1]:.1f} Q{b[0]:.1f},{b[1]:.1f} {c_[0]:.1f},{c_[1]:.1f}", "none", "#111", 2.4)
    h.circ(a[0], a[1], 2.4, "#333", "#000", .4)
    h.txt(bx0 + 6, by0 + bh - 24, "SALE EL CABLE 3 x 1,5 DEL TABLERO", 8, 700); h.txt(bx0 + 6, by0 + bh - 12, "FIJACION Y ALTURA DEL FC (*)", 8, 400, OR)
    h.globo("1", pt[0] + 2, pt[1] - 4, bx0 + bw - 18, by0 + 34, NV, 10)
    h.globo("4", (a[0] + c_[0]) / 2, (a[1] + c_[1]) / 2, bx0 + bw - 18, by0 + 120, NV, 10)
    L = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "FOTOCONTROL 220 V 10 A IP65 (IRAM AADL J20-24/25)", "1", "3012"),
         ("2", "ZOCALO DEL FOTOCONTROL", "1", "3072"),
         ("3", "FIJACION DEL FOTOCONTROL EN LA COLUMNA (*)", "1", "A VINCULAR"),
         ("4", "CABLE DE COMANDO Cu 3 x 1,5 mm² (TABLERO - COLUMNA) (*)", "d + 4,10", "1025"),
         ("5", "CONTACTOR TRIPOLAR AC-1 25 A, BOBINA 220 V", "1", "3006"),
         ("6", "SELECTORA 2 POSICIONES (AUTOMATICO - MANUAL)", "1", "3056"),
         ("7", "BASE PORTAFUSIBLE 8x31 + FUSIBLE 2 A DE COMANDO (*)", "1 + 1", "3002 / 3014"),
         ("8", "BORNES 2,5 mm² DE COMANDO (L - N - RETORNO)", "3", "2017"),
         ("9", "TERMOMAGNETICO GENERAL TETRAPOLAR CURVA C (*)", "1", "S/ PROYECTO"),
         ("10", "BARRA DE PUESTA A TIERRA 125 A", "1", "7001"),
         ("11", "RIEL DIN NS35 (CUATRO BARRAS DE 500)", "4", "2038"),
         ("12", "CAÑO PEAD Ø50 DEL CIRCUITO (LLEVA EL COMANDO) (*)", "1", "5005"),
         ("13", "PUNTERA TIF 1,5 mm² (PUNTAS DEL COMANDO EN EL TABLERO)", "3", "2028")]
    h.tabla(890, 652, [(40, "c", False), (470, "l", False), (90, "c", True), (150, "c", False)], L, rowh=19,
            titulo="LISTA DE MATERIALES (ELEMENTOS COMUNES)", colores=lambda i, j, t: OR if (t in ("A VINCULAR", "S/ PROYECTO") or "(*)" in t) else K)
    h.rotulo(890, h.H - 150, 750, "AP-T-003", "TABLERO A NIVEL", "ELEMENTOS COMUNES", "COMANDO Y FOTOCONTROL EN LA PRIMERA COLUMNA", "1:50 / 1:4", "ESQUEMA Y 3D S/E", fecha="07/11/2026")
    h.guardar("ap_t_003.svg"); print("ok AP-T-003")
