"""Hojas AP-T-007 (TT) y AP-T-008 (TN-S): interior del tablero de plaza según el esquema de tierra."""
import sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT, CORES
from _tab import *


def lista_esq(esq):
    TT = esq == "TT"
    L = [("POS.", "DESCRIPCION", "CANT.", "CODIGO"),
         ("1", "TABLERO ARMADO S/ PROYECTO EN GABINETE A NIVEL AP-T-002", "1", "3058"),
         ("2", "SECCIONADOR NH T00 + FUSIBLE NH00 gL 63 A (CAJA DE TOMA EPEC)", "3", "3055 / 3004"),
         ("3", "MEDIDOR TRIFASICO (LO PROVEE EPEC)", "1", "3049"),
         ("4", "RIEL DIN NS35 (CUATRO BARRAS DE 500)", "4", "2038"),
         ("5", "TERMOMAGNETICO GENERAL TETRAPOLAR CURVA C - In (*)", "1", "S/ PROYECTO")]
    if TT: L.append(("6", "DIFERENCIAL 4 x 40 A 300 mA CLASE A SUPERINMUNIZADO", "1", "3007"))
    else: L.append(("6", "BORNE DE NEUTRO DESVINCULABLE (UNION N-PE)", "1", "2018"))
    L += [("7", "CONTACTOR TRIPOLAR AC-1 25 A, BOBINA 220 V", "1", "3006"),
          ("8", "SELECTORA 2 POSICIONES (AUTOMATICO - MANUAL)", "1", "3056"),
          ("9", "BASE PORTAFUSIBLE 8x31 + FUSIBLE 2 A (COMANDO) (*)", "1 + 1", "3002 / 3014"),
          ("10", "BORNES 2,5 mm² COMANDO FC (L - N - RETORNO)", "3", "2017"),
          ("11", ("TERMOMAGNETICO BIPOLAR" if TT else "TERMOMAGNETICO UNIPOLAR") + " DE SALIDA CURVA C (*)", "1 x CIRC.", "S/ PROYECTO"),
          ("12", "BORNE BPN 6 mm² GRIS - FASE DE SALIDA", "1 x CIRC.", "2009"),
          ("13", "BORNE BPN 6 mm² CELESTE - NEUTRO DE SALIDA", "1 x CIRC.", "2008")]
    if not TT: L.append(("14", "BORNE BPN 6 mm² VERDE - PE DE SALIDA", "1 x CIRC.", "2010"))
    else: L.append(("14", "BORNE VERDE DE SALIDA: NO VA (TIERRA LOCAL) (*)", "-", "-"))
    L += [("15", "SEPARADOR Y TOPES DE BORNERA", "N + 2", "2041 / 2059"),
          ("16", "BARRA DE PUESTA A TIERRA 125 A, SOBRE AISLADORES", "1", "7001"),
          ("17", "CABLE Cu 1 x 10 mm² V/A BARRA - JABALINA" + ("" if TT else " Y PUENTE N-PE"), "10 m", "7010"),
          ("18", "FOTOCONTROL 220 V 10 A IP65 + ZOCALO (VER AP-T-003)", "1", "3012 / 3072"),
          ("19", "CAÑO PVC Ø90 ACOMETIDA EPEC / PEAD Ø50 POR CIRCUITO", "1 / N", "5010 / 5005"),
          ("20", "CAÑO PVC Ø50 CONDUCTO DE PAT (*)", "1", "5009")]
    return L


def gen(esq):
    h = Hoja(); h.a(EXTRA)
    TT = esq == "TT"
    PL = "AP-T-007" if TT else "AP-T-008"
    # ===================== FRENTE DEL GABINETE ABIERTO
    h.titulo(40, 62, "VISTA FRONTAL - GABINETE ABIERTO", "ESC. 1:10 - SIN PUERTA - ESQUEMA " + ("TT" if TT else "TN-S") + " - CABLES CON SU COLOR")
    k = .44; X0, Y0 = 72, 128
    F = frente(h, X0, Y0, k, esq)
    gx = 440
    slots = iter(range(110, 560, 31))
    def gl(n, u, v, c=K):
        x, y = F(u, v); h.globo(n, x, y, gx, next(slots), c)
    tm = comp_de(esq, "tm4")
    gl("2", CT[0] + 222, CT[1] + 120)
    gl("3", ME[2] - 20, ME[1] + 160)
    gl("5", tm[1] + 60, tm[2] + 20, OR)
    if TT: d6 = comp_de(esq, "dif"); gl("6", d6[1] + 60, d6[2] + 60)
    else: b6 = comp_de(esq, "bN"); gl("6", b6[1] + 10, b6[2] + 30)
    gl("4", RU1 - 6, RAILS[1] + 10)
    km = comp_de(esq, "km"); gl("7", km[1] + 40, km[2] + 70)
    gl("8", comp_de(esq, "sel")[1] + 15, comp_de(esq, "sel")[2] + 75)
    gl("9", comp_de(esq, "fc")[1] + 15, comp_de(esq, "fc")[2] + 70, OR)
    gl("10", comp_de(esq, "b25", "R")[1] + 5, comp_de(esq, "b25", "R")[2] + 45)
    t1 = comp_de(esq, "tm2" if TT else "tm1", "C3"); gl("11", t1[1] + t1[3] - 2, t1[2] + 70, OR)
    pb = pos_bornes(esq)
    gl("12", pb[(2, "g")], RAILS[3] + 18)
    gl("16", BAR[2] - 10, BAR[1] + 10)
    gl("17", PAT_U + 2, GH - 30)
    gl("19", PEAD_U[2] + 8, GH - 14)
    # ===================== UNIFILAR
    h.titulo(490, 62, "UNIFILAR - ESQUEMA " + ("TT" if TT else "TN-S"), "S/E - " + ("AP-T-007 (3/3) D.G.A.P. OCT. 2022" if TT else "AP-T-008 (3/3) D.G.A.P. NOV. 2022"))
    yb = unifilar(h, 545, 110, esq)
    comando(h, 480, 322)
    # ===================== TRIFILAR
    h.titulo(40, 545, "TRIFILAR - " + ("TT" if TT else "TN-S"), "S/E - COLORES AEA 90364: L1 MARRON - L2 NEGRO - L3 ROJO - N CELESTE - PE VERDE-AMARILLO")
    ys, outs = trifilar(h, 70, 610, 500, esq)
    if TT:
        h.txt(70, ys[4] + 70, "PE: SOLO MASAS DEL TABLERO Y JABALINA.", 9, 700, K)
        h.txt(70, ys[4] + 84, "N Y PE NO SE UNEN EN NINGUN PUNTO.", 9, 700, "#b02a20")
    # ===================== DETALLE
    if TT: det_tt(h, 600, 545)
    else: det_tns(h, 600, 545)
    # ===================== CUADRO TT vs TN-S
    filas = [("", "TT (AP-T-007)", "TN-S (AP-T-008)"),
             ("DIFERENCIAL GENERAL", "SI: 4x40 A 300 mA CL. A", "NO (EN LOS CIRCUITOS AP)"),
             ("TERMOMAG. DE SALIDA", "BIPOLAR (2x1x6 mm²)", "UNIPOLAR (1x6 mm²)"),
             ("BORNE UNION N-PE", "NO VA", "SI, DESPUES DEL GENERAL"),
             ("BARRA PAT", "SOLA A SU JABALINA", "UNIDA AL BORNE N"),
             ("PUENTE DE LAS BPN", "N Y PE EN 2 TIRAS", "N Y PE EN 1 TIRA"),
             ("PLAZAS (FICHA)", "3232 3231 5001 5002", "3191 12022 4724 4725 6240")]
    hl = 1 if TT else 2
    h.tabla(40, 830, [(150, "l", False), (160, "l", False), (170, "l", False)], filas, rowh=19,
            titulo="TT CONTRA TN-S (CALCULADORA ESQUEMA_TIERRA)", colores=lambda i, j, t: (NV if j == hl and i else K))
    h.rect(40 + (150 if TT else 310), 844, 160 if TT else 170, 19 * 7, "none", NV, 2)
    # referencias de cables
    h.txt(540, 830, "CABLES EN LAS VISTAS", 13, 700); h.ln(540, 834, 690, 834, K, 1)
    refs = [(MAR, "L1 MARRON"), (NEG, "L2 NEGRO"), (ROJ, "L3 ROJO"), (CEL, "N CELESTE"), (VA, "PE VERDE-AMARILLO"), ("#7a5ea8", "RETORNO FC (*)"), ("#111", "CABLE COMANDO 3x1,5")]
    for i, (c, t) in enumerate(refs):
        yy = 852 + (i % 4) * 22; xx = 540 + (i // 4) * 150
        h.ln(xx, yy, xx + 28, yy, c, 3 if c != "#111" else 4)
        if c == VA: h.ln(xx, yy, xx + 28, yy, AMA, 1.2, 'stroke-dasharray="3 3"')
        h.txt(xx + 34, yy + 4, t, 10, 400, OR if "(*)" in t else K)
    # ===================== NOTAS
    com = ["COTAS EN mm. GABINETE AP-T-002 785 x 830 x 320. TM 18 mm POR POLO x 85, ID 4P 72 x 91, KM 45 x 85 (FICHAS TECNICAS).",
           "C1 = L1, C2 = L2, C3 = L3. CANTIDAD DE SALIDAS, In Y SECCIONES: S/ PROYECTO (SE DIBUJAN 3 COMO EJEMPLO).",
           "FOTOCONTROL: EN EL TABLERO A NIVEL VA EN LA PRIMERA COLUMNA (AP-T-003); EN EL AEREO, EN EL APOYO.",
           "(*) DISPOSICION INTERIOR, CAJA DE TOMA, MEDIDOR, BARRA, SELECTORA Y COMANDO: A CONFIRMAR CON PLANO Y PROVEEDOR.",
           "(*) EL PLANO OFICIAL ES DEL TABLERO AEREO EN POSTE; ACA VA EN EL GABINETE A NIVEL (AP-T-002): A CONFIRMAR."]
    if TT:
        com.append("(*) PAÑOL 3057 «TT 2 SAL. 4 x 25» NO CUADRA CON SALIDAS BIPOLARES. PE DE SALIDA Y PEINE PRFV EN TT: A CONFIRMAR.")
    else:
        com.append("(*) EL PUENTE N-PE SE SACA SOLO PARA MEDIR; SU SECCION, A CONFIRMAR. A LA FICHA LE FALTAN LAS PLAZAS 12001 Y 6039.")
    h.notas(40, 1026, com)
    # ===================== 3D
    h.titulo(890, 62, "VISTA 3D - TABLERO " + ("TT" if TT else "TN-S") + " ABIERTO SOBRE SU BASE", "SIN PUERTA, TECHO Y LADO DERECHO CORTADOS; BASE AP-TC-007 CORTADA: ENTRA EL PVC Ø90 DE EPEC, SALE UN PEAD Ø50 POR CIRCUITO")
    g = g3d(h, 1160, 314, .25, esq)
    X, Z, yp = g["X"], g["Z"], g["yp"]
    GX = 1468
    yy = 98; dyy = 33
    def G3(n, p, t, c=NV):
        nonlocal yy; h.g3(n, p, GX, yy, t, c); yy += dyy
    G3("1", (X(GW) , 300, Z(500)), "GABINETE PRFV AP-T-002")
    G3("2", (X(CT[0] + 120), g["yp"] + 150, Z(CT[1] + 100)), "NH T00 (CAJA EPEC)")
    G3("3", (X(ME[2] - 30), g["yp"] + 130, Z(ME[1] + 150)), "MEDIDOR EPEC")
    if TT: d6 = comp_de(esq, "dif"); G3("6", (X(d6[1] + 50), yp + 80, Z(d6[2] + 30)), "DIFERENCIAL 300 mA")
    else: b6 = comp_de(esq, "bN"); G3("6", (X(b6[1] + 6), yp + 70, Z(b6[2] + 10)), "BORNE N (UNION N-PE)")
    G3("7", (X(km[1] + 40), yp + 99, Z(km[2] + 60)), "CONTACTOR 25 A")
    t3 = comp_de(esq, "tm2" if TT else "tm1", "C3"); G3("11", (X(t3[1] + t3[3]), yp + 80, Z(t3[2] + 40)), "TM " + ("2P" if TT else "1P") + " DE SALIDA")
    G3("12", (X(pb[(2, 'g')] + 4), yp + 60, Z(RAILS[3])), "BORNES DE SALIDA")
    G3("16", (X(BAR[2] - 30), yp + 36, Z(BAR[1] + 4)), "BARRA PAT")
    G3("17", (380, 200, -100), "1x10 V/A A LA JABALINA")
    G3("19", (1030, 280, -690), "PEAD Ø50 A LA ZANJA")
    h.g3("19", (250, 640, -640), 905, 545, "PVC Ø90 DE EPEC")
    # ===================== LISTA Y ROTULO
    L = lista_esq(esq)
    h.tabla(890, 652, [(40, "c", False), (470, "l", False), (90, "c", True), (150, "c", False)], L, rowh=17,
            titulo="LISTA DE MATERIALES (1 TABLERO " + ("TT" if TT else "TN-S") + ", 3 CIRCUITOS)",
            colores=lambda i, j, t: OR if (t in ("A VINCULAR", "S/ PROYECTO") or "(*)" in t) else K)
    h.rotulo(890, h.H - 150, 750, PL, "TABLERO DE PLAZA", "ESQUEMA " + ("TT" if TT else "TN-S"),
             "FRENTE ABIERTO, UNIFILAR, TRIFILAR, DETALLE Y 3D", "1:10 · S/E", "3D S/E", fecha="07/11/2026")
    h.guardar(PL.lower().replace("-", "_") + ".svg"); print("ok", PL)


def det_tt(h, x, y):
    h.titulo(x, y, "D1 - BARRA PAT EN TT", "S/E - SIN BORNE DE UNION N-PE")
    bx, by = x + 40, y + 80
    h.rect(bx, by, 150, 14, "url(#cuB)", K, 1)
    for j in range(6): h.circ(bx + 14 + j * 24, by + 7, 3, "#fff", K, .7)
    for xx in (bx - 14, bx + 150): h.rect(xx, by - 6, 14, 26, "#c23b2b", K, .8)
    h.txt(bx + 75, by - 12, "BARRA PAT 125 A (7001)", 9, 700, K, "middle")
    # a la jabalina
    h.ln(bx + 14, by + 14, bx + 14, by + 120, VA, 3); h.ln(bx + 14, by + 14, bx + 14, by + 120, AMA, 1.1, 'stroke-dasharray="3 3"')
    for j, wj in enumerate((26, 17, 8)): h.ln(bx + 14 - wj / 2, by + 124 + j * 5, bx + 14 + wj / 2, by + 124 + j * 5, K, 1.4)
    h.txt(bx + 24, by + 116, "1x10 V/A A SU JABALINA", 9, 700)
    # masas
    h.ln(bx + 62, by + 14, bx + 62, by + 60, VA, 2); h.ln(bx + 62, by + 14, bx + 62, by + 60, AMA, .8, 'stroke-dasharray="3 3"')
    h.txt(bx + 68, by + 56, "MASAS DEL TABLERO (*)", 9, 400, OR)
    # neutro aparte, con X
    nx, ny = bx + 150, by + 100
    h.rect(nx - 10, ny, 20, 26, "#4fa3d9", K, .8); h.txt(nx, ny + 17, "N", 9, 700, "#fff", "middle")
    h.ln(nx - 10, ny + 13, bx + 100, by + 30, K, .8, 'stroke-dasharray="4 3"')
    cx_, cy_ = (nx - 10 + bx + 100) / 2, (ny + 13 + by + 30) / 2
    h.ln(cx_ - 8, cy_ - 8, cx_ + 8, cy_ + 8, "#b02a20", 2.4); h.ln(cx_ - 8, cy_ + 8, cx_ + 8, cy_ - 8, "#b02a20", 2.4)
    h.txt(nx + 16, ny + 12, "N DE EPEC", 9, 700); h.txt(nx + 16, ny + 24, "(VIENE DEL ID)", 8.5, 400, G)
    h.txt(x, by + 160, "EL N NO SE TOCA CON LA BARRA PAT.", 9.5, 700, "#b02a20")
    h.txt(x, by + 174, "PROTEGE EL DIFERENCIAL: BOTON T AL", 9.5, 400)
    h.txt(x, by + 188, "PONER EN MARCHA. CADA PAT ≤ 40 Ω (ETG).", 9.5, 400)


def det_tns(h, x, y):
    h.titulo(x, y, "D1 - UNION N-PE", "ESC. 2:1 - BORNE N DESVINCULABLE")
    bx, by = x + 30, y + 62
    # riel
    h.rect(bx - 10, by + 30, 90, 35, "url(#ANSI31)", K, .8); h.rect(bx - 10, by + 35, 90, 25, "#fff", K, .5)
    # borne N (BPN-16: paso 12,2 x 56)
    k2 = 1.6
    h.rect(bx + 10, by + 47.5 - 28 * k2 / 1.6 - 10, 12.2 * k2, 56 * k2, "#4fa3d9", K, 1)
    tb = by + 47.5 - 28 - 10
    h.circ(bx + 10 + 6.1 * k2, tb + 8, 4, "#fff", K, .8); h.circ(bx + 10 + 6.1 * k2, tb + 56 * k2 - 8, 4, "#fff", K, .8)
    h.txt(bx + 10 + 6.1 * k2, tb + 45, "N", 11, 700, "#fff", "middle")
    h.txt(bx + 90, tb + 30, "BORNE N TIPO BPN-16", 8.5, 700); h.txt(bx + 90, tb + 42, "PASO 12,2 (FICHA BPN) (*)", 8.5, 400, OR)
    # entra N del TM general, sale a los bornes celestes
    h.ln(bx + 10 + 6.1 * k2, tb + 8, bx + 10 + 6.1 * k2, tb - 30, CEL, 3); h.txt(bx + 30, tb - 22, "N DEL TM GENERAL", 8.5, 700)
    # puente a la barra PAT (desvinculable)
    yy = tb + 56 * k2 - 8
    h.path(f"M{bx+10+6.1*k2},{yy} V{yy+30} H{bx+150}", "none", VA, 3.4); h.path(f"M{bx+10+6.1*k2},{yy} V{yy+30} H{bx+150}", "none", AMA, 1.2, 'stroke-dasharray="3 3"')
    h.circ(bx + 80, yy + 30, 5, "#fff", K, 1); h.ln(bx + 76, yy + 26, bx + 84, yy + 34, K, 1)
    h.txt(bx + 80, yy + 50, "SE SACA PARA MEDIR", 8.5, 700, K, "middle")
    h.rect(bx + 150, yy + 22, 70, 14, "url(#cuB)", K, 1); h.txt(bx + 185, yy + 14, "BARRA PAT", 8.5, 700, K, "middle")
    for j in range(3): h.circ(bx + 162 + j * 22, yy + 29, 2.4, "#fff", K, .6)
    h.ln(bx + 210, yy + 36, bx + 210, yy + 80, VA, 3); h.ln(bx + 210, yy + 36, bx + 210, yy + 80, AMA, 1.1, 'stroke-dasharray="3 3"')
    for j, wj in enumerate((22, 14, 6)): h.ln(bx + 210 - wj / 2, yy + 84 + j * 5, bx + 210 + wj / 2, yy + 84 + j * 5, K, 1.4)
    h.txt(bx + 150, yy + 74, "JABALINA", 8.5, 700, K, "end")
    h.txt(x, y + 250, "«EN EL BORNE DE NEUTRO SE REALIZARA LA", 9, 400)
    h.txt(x, y + 263, "CONEXION CON LA BARRA DE PAT» (AP-T-008).", 9, 400)


if __name__ == "__main__":
    gen(sys.argv[1] if len(sys.argv) > 1 else "TT")
