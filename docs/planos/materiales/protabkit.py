"""protabkit · vistas de los aparatos modulares (termomagnética, diferencial, contactor), del peine de pines, de los gabinetes
y del fotocontrol, dibujadas con los perfiles de r3d/perfiles_protab.json (salen de r3d/piezas/perfiles_protab.mjs, los mismos del 3D).
Grupo «protab». Usa fichakit / fuskit sin modificarlos."""
import json, math, os
from fichakit import *          # noqa: F401,F403
from fuskit import rielYZ, tornilloH

PT = json.load(open(os.path.join(R3D, "perfiles_protab.json")))
TM, DI, CT, PEI = PT["TM"], PT["DI"], PT["CT"], PT["PEINE_TM"]

# patrones extra: bobinado (alambre en corte), ferrita, fibra, PRFV, aluminio, goma
DEFS3 = '''<defs>
<pattern id="BOB" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#fff"/><circle cx="2" cy="2" r="1.5" fill="none" stroke="#111" stroke-width=".45"/><path d="M1,1 L3,3 M3,1 L1,3" stroke="#111" stroke-width=".3"/></pattern>
<pattern id="FER" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><path d="M0,0 V6 M3,0 V6" stroke="#111" stroke-width=".5"/><path d="M0,3 H6" stroke="#111" stroke-width=".3"/></pattern>
<pattern id="LAM" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#fff"/><path d="M0,1.5 H3" stroke="#111" stroke-width=".6"/></pattern>
<pattern id="PRFV" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#fff"/><path d="M0,0 V8 M4,0 V8" stroke="#111" stroke-width=".45" stroke-dasharray="3 1.5"/></pattern>
<pattern id="ALU" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><path d="M0,0 V7" stroke="#111" stroke-width=".5"/><path d="M3.5,0 V7" stroke="#111" stroke-width=".5" stroke-dasharray="1 1.4"/></pattern>
<pattern id="GOMA" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#3a3a3a"/><circle cx="2" cy="2" r=".6" fill="#fff"/></pattern>
</defs>'''
RAYADOS.extend([("BOB", "BOBINADO (Cu ESMALTADO)"), ("FER", "FERRITA / CHAPA MAGNETICA"), ("LAM", "PAQUETE DE CHAPAS"), ("PRFV", "PRFV (POLIESTER + FIBRA)"),
                ("ALU", "ALUMINIO INYECTADO"), ("GOMA", "JUNTA DE GOMA"), ("PLAS2", "PA OSCURA (MANIJA, CERROJO)")])


def nueva3():
    h = nueva2(); h.a(DEFS3); return h


def rot(p, c, deg):
    a = math.radians(deg); dy, dz = p[0] - c[0], p[1] - c[1]
    return [c[0] + dy * math.cos(a) - dz * math.sin(a), c[1] + dy * math.sin(a) + dz * math.cos(a)]


def cableMod(v, S, arriba=True, largo=8, rA=2.5, rC=1.45, pin=False):
    """cable con puntera que entra por la boca del aparato modular (corte longitudinal) + rotura"""
    yc, H = S["cable"]["y"], S["H"]; s = 1 if arriba else -1; zb = H if arriba else 0
    zi = S["jaula"]["S" if arriba else "I"]["int"][0][1] + .6 if arriba else S["jaula"]["I"]["int"][2][1] - .6
    v.rect(yc - rC, yc + rC, min(zi, zb + s * 1), max(zi, zb + s * 1), "url(#CU)", .7)               # tubo de la puntera
    v.rect(yc - rA - .4, yc + rA + .4, min(zb + s * 1, zb + s * 8), max(zb + s * 1, zb + s * 8), "url(#PLAS2)", .7)   # collar
    z1 = zb + s * (8 + largo)
    v.rect(yc - rA, yc + rA, min(zb + s * 8, z1), max(zb + s * 8, z1), "#fff", .8); v.rect(yc - rC, yc + rC, min(zb + s * 8, z1), max(zb + s * 8, z1), "url(#CU)", .4)
    a = v.p(yc - rA, z1); w = rA * v.e
    v.h.path(f"M{a[0]:.1f},{a[1]:.1f} q{w/2:.1f},{-s*3:.1f} {w:.1f},0 q{w/2:.1f},{s*3:.1f} {w:.1f},0", "none", K, .6)


def manijaV(v, S, fill="url(#PLAS2)", off=False):
    m = S["manija"]; v.poly(S["manijaOff" if off else "manijaP"], fill, 1.0); v.circ(m["piv"][0], m["piv"][1], m["r"], fill, 1.0); v.circ(m["piv"][0], m["piv"][1], 1.2, "#fff", .7)


def modPerfil(v, S, cables=True, manija=True, ocultas=True):
    """vista lateral exterior de un aparato modular (perfil y,z) sobre el riel"""
    rielYZ(v, S["zM"], "#fff")
    v.poly(S["contorno"], "#fff", 1.6)
    v.poly(S["traba"], "#fff", .8)
    if ocultas:
        for p in PT["SECC"][("tm" if S is TM else "di" if S is DI else "ct") + "Pozos"]: v.oculta(p + [p[0]], .5)
        for q in S["bolsillo"]: v.oculta(q + [q[0]], .45)
    if manija and "manijaP" in S: manijaV(v, S, "#fff")
    if cables: cableMod(v, S, True, 6); cableMod(v, S, False, 6)


def jaulas(v, S):
    for l in ("S", "I"):
        J = S["jaula"][l]; v.poly(J["ext"], "url(#MET)", .9); v.poly(J["int"], "#fff", .6)
    t = S["tornillo"]
    for z in (t["zS"], t["zI"]): tornilloH(v, t["yCab"], z, t)


def tmCorte(v, cables=True, pin=False):
    """CORTE A-A de la termomagnética por el plano medio de un polo: carcasa rayada + mecanismo"""
    S = TM
    v.seccion(PT["SECC"]["tm"], "PLAS")
    rielYZ(v, S["zM"]); v.poly(S["traba"], "url(#PLAS2)", .8)
    jaulas(v, S)
    for k in ("barraS", "salidaBob", "cuernoS", "cuernoI", "barraI"): v.poly(S[k], "url(#CU)", .7)
    v.poly([[20.6, 57], [22, 57], [22, 66.6], [20.6, 66.6]], "url(#CU)", .7); v.poly([[22.2, 14.6], [36.4, 14.6], [36.4, 16], [22.2, 16]], "url(#CU)", .7)
    b = S["bobina"]
    for s in (1, -1):   # bobinado arriba y abajo del eje, carrete
        z0, z1 = sorted((b["z"] + s * b["rI"], b["z"] + s * b["rE"]))
        v.rect(b["y0"], b["y1"], z0, z1, "url(#BOB)", .7)
        zf0, zf1 = sorted((b["z"] + s * (b["rI"] - .7), b["z"] + s * (b["rE"] + .6)))
        for yy in (b["y0"] - .8, b["y1"]): v.rect(yy, yy + .8, zf0, zf1, "url(#PLAS2)", .5)
    v.rect(b["percutor"][0], b["percutor"][1], b["z"] - b["rP"], b["z"] + b["rP"], "url(#MET)", .8)
    for p in S["yugo"]: v.poly(p, "url(#MET)", .7)
    for p in S["camaraArco"]: v.poly(p, "url(#MET)", .6)
    v.poly(S["brazoP"], "url(#CU)", .8); v.poly(S["contactoFijo"], "#111", .5); v.poly(S["pastillaMovil"], "#111", .5)
    v.circ(*S["brazo"]["piv"], 1.1, "#fff", .7)
    v.poly(S["bimetal"]["a"], "url(#CU)", .6); v.poly(S["bimetal"]["b"], "url(#MET)", .6)
    v.linea([[40.4, 33.6], [41.6, 35.4], [42.6, 36.4], [43.8, 36.9], [44.6, 37.2], [45.6, 37.0], [46.6, 36.6]], 1.4, K)   # malla
    v.linea([[40.4, 33.6], [41.6, 35.4], [42.6, 36.4], [43.8, 36.9], [44.6, 37.2], [45.6, 37.0], [46.6, 36.6]], .6, "#fff", 'stroke-dasharray="1 1"')
    v.poly(S["cerrojo"], "url(#PLAS2)", .8)
    v.linea([[57.5, 37.6], [53.6, 36.2], [50.4, 34.4]], .9)
    zz = [27 + i * 6.5 / 14 for i in range(15)]; v.linea([[47 + (1.2 if i % 2 else -1.2), z] for i, z in enumerate(zz)], .6)   # resorte
    manijaV(v, S)
    v.rect(S["Dn"] - .2, S["Dn"] + .5, S["ventana"]["z"][0], S["ventana"]["z"][1], "#111", .4)
    if pin:
        P = PEI; v.poly(P["cuerpo"], "url(#PLAS2)", .9); v.poly(P["barra"], "url(#CU)", .7)
        v.rect(P["pin"]["y"][0], P["pin"]["y"][1], P["pin"]["z0"], P["barra"][0][1], "url(#CU)", .6)
    if cables: cableMod(v, S, True, 7); cableMod(v, S, False, 7)


def frenteMod(h, x0, y0, e, S, n, marca="", icc="", W=None, boton=False, manija=True, numeros=True, sens=None):
    """vista de frente (x, z) de un aparato modular de n polos. x0,y0 = esquina de arriba a la izquierda. Devuelve X(), Z()"""
    W = W or S["W"]; H = S["H"]; c0, c1 = S["cuello"]; X = lambda x: x0 + x * e; Z = lambda z: y0 + (H - z) * e; L = W * n
    h.a(f'<rect x="{X(0):.1f}" y="{Z(H):.1f}" width="{L*e:.1f}" height="{H*e:.1f}" rx="{1.2*e:.1f}" fill="#fff" stroke="{K}" stroke-width="1.5"/>')
    h.rect(X(.8), Z(c1), (L - 1.6) * e, (c1 - c0) * e, "#fff", K, 1.1)
    for i in range(1, n): h.ln(X(i * W), Z(H), X(i * W), Z(c1), K, .6); h.ln(X(i * W), Z(c0), X(i * W), Z(0), K, .6)
    t = S["tornillo"]
    for i in range(n):
        xm = (i + .5) * W
        for z in (t["zS"], t["zI"]):
            h.circ(X(xm), Z(z), t["pozo"] * e, "#fff", K, .6); h.circ(X(xm), Z(z), t["dk"] / 2 * e, "#fff", K, .9)
            h.ln(X(xm) - 2.6 * e, Z(z) + 1.0 * e, X(xm) + 2.6 * e, Z(z) - 1.0 * e, K, .9); h.ln(X(xm) - 1.0 * e, Z(z) - 2.6 * e, X(xm) + 1.0 * e, Z(z) + 2.6 * e, K, .9)
        if numeros:
            h.txt(X(xm), Z(t["zS"] + 7.8), "N" if (sens and i == n - 1) else str(2 * i + 1), 8.5, 700, K, "middle")
            h.txt(X(xm), Z(t["zI"] - 6.6) + 6, "N" if (sens and i == n - 1) else str(2 * i + 2), 8.5, 700, K, "middle")
        if manija and "manijaP" in S and not sens:
            h.rect(X(xm - 3.6), Z(47.5), 7.2 * e, 8 * e, "url(#PLAS2)", K, 1)
            h.rect(X(xm - 2.8), Z(S["ventana"]["z"][1]), 5.6 * e, (S["ventana"]["z"][1] - S["ventana"]["z"][0]) * e, "#111", K, .5)
    if sens:   # diferencial: una manija ancha y botón T
        xc = L / 2; h.rect(X(xc - 6.5), Z(S["manija"]["piv"][1] + 4), 13 * e, 8 * e, "url(#PLAS2)", K, 1)
        xb = L - W / 2 - 2; h.circ(X(xb), Z(S["boton"]["z"]), S["boton"]["r"] * e, "#fff", K, 1); h.txt(X(xb), Z(S["boton"]["z"]) + 3.5, "T", 9, 700, K, "middle")
        h.txt(X(xc), Z(61.5) + 4, sens, 9.5, 700, K, "middle")
    if n > 1 and manija and not sens: h.ln(X(W / 2), Z(43.5), X(L - W / 2), Z(43.5), K, 1.6)
    if marca: h.txt(X(L / 2), Z(57.5) + 4, marca, 10.5 if n > 1 else 8.5, 700, K, "middle")
    if icc and n > 1: h.txt(X(L / 2), Z(33.5) + 3, icc, 7.5, 400, K, "middle")
    h.rect(X(L / 2 - 4.4), Z(-2.4), 8.8 * e, 2.4 * e, "#fff", K, .7)  # traba
    return X, Z


def diCorte(v, cables=True):
    """CORTE A-A del diferencial por el plano medio (entre los polos 2 y 3): toroide, conductores, relé, botón T, manija"""
    S = DI; t = S["toroide"]
    v.seccion(PT["SECC"]["di"], "PLAS")
    rielYZ(v, S["zM"]); v.poly(S["traba"], "url(#PLAS2)", .8)
    jaulas(v, S)
    # conductores (atrás del plano: línea oculta) que bajan por adentro del toroide
    for dy in (-1.6, 1.6):
        v.oculta([[29 + dy, 75], [29 + dy, 68], [t["y"] + 2 + dy, t["z"] + 12], [t["y"] + dy, t["z"]], [t["y"] - 1 + dy, t["z"] - 12], [29 + dy, 22], [29 + dy, 16]], .7)
    for s in (-1, 1):   # sección del anillo: núcleo de ferrita + bobinado secundario alrededor
        yc = t["y"] + s * t["R"]; v.circ(yc, t["z"], t["r"] + .5, "url(#BOB)", 1.0); v.circ(yc, t["z"], t["r"] - .2, "url(#FER)", .8)
    v.poly(S["rele"], "#fff", 1.0); v.rect(S["rele"][1][0] - .6, S["rele"][1][0] + 1.2, S["rele"][0][1] + 3, S["rele"][2][1] - 3, "url(#MET)", .6)
    v.rect(S["rele"][0][0] + 2, S["rele"][1][0] - 2, S["rele"][0][1] + 3, S["rele"][2][1] - 3, "url(#BOB)", .5)
    v.poly(S["resistencia"], "url(#CER)", .6)
    b = S["boton"]; v.rect(S["Dn"] - 3, S["Dn"] + 2.4, b["z"] - b["r"], b["z"] + b["r"], "url(#PLAS2)", .9)
    v.linea([[t["y"] + t["R"], t["z"] + 4], [33, 52], [40, 54]], .5); v.linea([[46, 31], [S["Dn"] - 3, 31]], .5)
    manijaV(v, S)
    if cables: cableMod(v, S, True, 7, rA=2.9, rC=1.8); cableMod(v, S, False, 7, rA=2.9, rC=1.8)


def ctCorte(v, cables=True):
    """CORTE A-A del contactor por el polo del medio: electroimán, bobina, porta-contactos, puente, contactos fijos"""
    S = CT; N = S["nucleo"]; B = S["bobina"]
    v.seccion(PT["SECC"]["ct"], "PLAS")
    rielYZ(v, S["zM"]); v.poly(S["traba"], "url(#PLAS2)", .8)
    jaulas(v, S)
    for p in N["fijo"] + N["movil"]: v.poly(p, "url(#LAM)", .8)
    for p in N["espira"]: v.poly(p, "url(#CU)", .6)
    for z0, z1 in ((B["z"][0], B["zN"][0] - 1), (B["zN"][1] + 1, B["z"][1])): v.rect(B["y"][0], B["y"][1], z0, z1, "url(#BOB)", .7)
    v.seccion([[S["porta"] + [S["porta"][0]], S["ventanaPorta"] + [S["ventanaPorta"][0]]]], "PLAS2", 1.0)
    v.poly(S["puente"], "url(#CU)", .8); v.poly(S["fijoS"], "url(#CU)", .8); v.poly(S["fijoI"], "url(#CU)", .8)
    for q in S["pastillas"]: v.poly(q, "#111", .4)
    for z0 in (56.5, 26): v.rect(67.6, 68.6, z0, z0 + 2.5, "#111", .4)
    zz = [S["resorte"]["y"][0] + i * 8 / 16 for i in range(17)]
    v.linea([[y, S["resorte"]["z"] + (S["resorte"]["r"] if i % 2 else -S["resorte"]["r"])] for i, y in enumerate(zz)], .6)
    if cables: cableMod(v, S, True, 7, rA=2.9, rC=1.8); cableMod(v, S, False, 7, rA=2.9, rC=1.8)


def frenteCT(h, x0, y0, e):
    S = CT; W, H = S["W"], S["H"]; X = lambda x: x0 + x * e; Z = lambda z: y0 + (H - z) * e; c0, c1 = S["cuello"]
    h.a(f'<rect x="{X(0):.1f}" y="{Z(H):.1f}" width="{W*e:.1f}" height="{H*e:.1f}" rx="{1.2*e:.1f}" fill="#fff" stroke="{K}" stroke-width="1.5"/>')
    h.rect(X(1.5), Z(c1), (W - 3) * e, (c1 - c0) * e, "#fff", K, 1.1)
    t = S["tornillo"]
    for i, p in enumerate(S["polos"]):
        for z, lab in ((t["zS"], f"{2*i+1}/L{i+1}"), (t["zI"], f"{2*i+2}/T{i+1}")):
            h.circ(X(p), Z(z), t["pozo"] * e, "#fff", K, .6); h.circ(X(p), Z(z), t["dk"] / 2 * e, "#fff", K, .9)
            h.ln(X(p) - 2.6 * e, Z(z) + 1 * e, X(p) + 2.6 * e, Z(z) - 1 * e, K, .9); h.ln(X(p) - 1 * e, Z(z) - 2.6 * e, X(p) + 1 * e, Z(z) + 2.6 * e, K, .9)
    for x, z, tt in ((8, 70, "A1"), (37, 15, "A2"), (22.5, 70, "13"), (37, 70, "21"), (22.5, 15, "14"), (8, 15, "22")):
        h.rect(X(x - 4.6), Z(z + 4.6), 9.2 * e, 9.2 * e, "#fff", K, .7); h.circ(X(x), Z(z), 3.2 * e, "#fff", K, .7)
        h.ln(X(x) - 2.2 * e, Z(z), X(x) + 2.2 * e, Z(z), K, .8); h.txt(X(x), Z(z + (-7.6 if z > 40 else 6)), tt, 8, 700, OR if tt[0] == "A" else K, "middle")
    h.rect(X(15), Z(41), 15 * e, 9 * e, "url(#PLAS2)", K, .8)
    h.txt(X(22.5), Z(52), "KM 25 A", 8.5, 700, K, "middle")
    return X, Z


def nhD1(h, DX, DY):
    """base NH 00 + fusible NH 00: vista de frente y de costado con cotas (DIN 43620) desde (DX, DY)"""
    NH = PT["NH"]; B, F = NH["base"], NH["fus"]
    k = 1.25; bx, by = DX + 40, DY + 46
    # frente (eje vertical)
    h.rect(bx, by, B["W"] * k, B["L"] * k, "url(#PLAS2)", K, 1.3)
    for s_ in (0, 1):
        zc = by + (12 if s_ == 0 else B["L"] - 12) * k
        h.circ(bx + B["W"] / 2 * k, zc, 8 * k, "#fff", K, .9); h.circ(bx + B["W"] / 2 * k, zc, 4 * k, "url(#MET)", K, .7)
    fy = by + (B["L"] - F["L"]) / 2 * k
    h.rect(bx + (B["W"] - F["W"]) / 2 * k + 1, fy + F["cuchilla"]["l"] * k, F["W"] * k - 2, F["cuerpo"][0] * k, "url(#CER)", K, 1.2)
    for s_ in (0, 1):
        yy = fy if s_ == 0 else fy + (F["L"] - F["cuchilla"]["l"]) * k
        h.rect(bx + (B["W"] - F["cuchilla"]["a"]) / 2 * k, yy, F["cuchilla"]["a"] * k, F["cuchilla"]["l"] * k, "url(#CU)", K, .9)
    h.circ(bx + B["W"] / 2 * k, by + B["L"] / 2 * k, 3 * k, "#d63a2f", K, .6)
    h.dimV(bx - 14, by, by + B["L"] * k, "119", ext=bx - 2)
    h.dimH(by - 10, bx, bx + B["W"] * k, "30", ext=by - 2)
    h.dimV(bx + B["W"] * k + 18, fy, fy + F["L"] * k, "79 (FUSIBLE)", ext=bx + B["W"] * k + 2)
    # costado
    cx0 = bx + 120
    h.rect(cx0, by, 8 * k, B["L"] * k, "url(#PLAS2)", K, 1.1)
    for s_ in (-1, 1):
        yc = by + (B["L"] / 2 + s_ * NH["pinzas"]) * k
        h.rect(cx0 + 8 * k, yc - 11 * k, 22 * k, 22 * k, "url(#PLAS2)", K, .9)
    h.rect(cx0 + 10 * k, fy + F["cuchilla"]["l"] * k, (F["H"] - 10) * k, F["cuerpo"][0] * k, "url(#CER)", K, 1.1)
    for s_ in (0, 1):
        yy = fy if s_ == 0 else fy + (F["L"] - F["cuchilla"]["l"]) * k
        h.rect(cx0 + (30 - 3) * k, yy, F["cuchilla"]["e"] * k, F["cuchilla"]["l"] * k, "url(#CU)", K, .8)
    h.dimH(by + B["L"] * k + 16, cx0, cx0 + B["H"] * k, "58,5", ext=by + B["L"] * k + 2)
    h.dimH(by - 10, cx0 + 10 * k, cx0 + F["H"] * k, "58 (FUSIBLE)", ext=by - 2)
    for t, (x_, y_), (tx, ty) in [("CUCHILLA 6 x 15 (*)", (cx0 + 30 * k, fy + 6), (cx0 + 96, by + 6)), ("PINZA A RESORTE (*)", (cx0 + 18 * k, by + 40 * k), (cx0 + 96, by + 40)),
                                   ("CUERPO CERAMICO", (cx0 + 40 * k, by + 60 * k), (cx0 + 96, by + 74)), ("BORNE M8 (*)", (cx0 + 4, by + 12 * k), (cx0 + 96, by + 108))]:
        llamada(h, x_, y_, tx, ty, t, sz=8.5)
