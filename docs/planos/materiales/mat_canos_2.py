"""MAT-CAÑOS-2 (rev. B) · Caño PEAD Ø50 PN6 (5005), corrugado 3/4" (5006) y grampa de sujeción (5015).
Plano y 3D con las mismas medidas (perfiles_civil.json). 3D: r3d/out/civil_pead.png, civil_pead_rollo.png, civil_corr.png.
Fuentes: ficha de la app (familia «Caños y conductos»), AP-TC-007, r3d/FUENTES_civil.md. Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

PE = PC["PEAD"]; CR = PC["CORR"]; GR = PC["GRAMPA"]; CP = PE["cupla"]
h = nuevaC()
ro, e = PE["D"] / 2, PE["e"]; ri = ro - e

# =============== 1. CORTE A-A · PEAD Ø50 ===============
h.titulo(40, 62, "CORTE A-A · PEAD Ø50", "ESC. 2:1 · PEAD NEGRO")
k = 2.0; cx, cy = 140, 190
anillo(h, cx, cy, ro * k, ri * k, "PE", 1.3)
h.ln(cx - ro * k - 12, cy, cx + ro * k + 12, cy, K, .4, h.EJE); h.ln(cx, cy - ro * k - 12, cx, cy + ro * k + 12, K, .4, h.EJE)
h.dimH(cy + ro * k + 24, cx - ro * k, cx + ro * k, "Ø50", ext=cy)
h.dimH(cy + ro * k + 44, cx - ri * k, cx + ri * k, "Ø44 (*)", ext=cy, c=OR)
h.dimV(cx + ro * k + 22, cy - ro * k, cy - ri * k, "3,0 (*)", ext=cx, c=OR)
h.txt(40, 318, "PN6 EN PE100 (SDR 26) DARIA ≈ 2,0: CONFIRMAR LA PARED REAL", 9.5, 400, OR)

# =============== 2. UNION A COMPRESION · MEDIO CORTE ===============
h.titulo(330, 62, "UNION A COMPRESION (*) · MEDIO CORTE B-B", "ESC. 1:0,75 · SIN CODIGO EN EL PAÑOL (A VINCULAR)")
kb = 1.35; X0 = 595; Y0 = 205
def bx(x): return X0 + x * kb
def by(r): return Y0 - r * kb
L2 = CP["L"] / 2; Lt = CP["Lt"]; Rc = CP["Dc"] / 2; Rt = CP["tuerca"] / 2
# caños (arriba en corte, abajo vista)
for s in (-1, 1):
    xx0, xx1 = (bx(-170), bx(-4)) if s < 0 else (bx(4), bx(170))
    h.rect(xx0, by(ro), xx1 - xx0, e * kb, "url(#PE)", K, 1.0)
    h.ln(xx0, by(-ro), xx1, by(-ro), K, 1.1)
# cuerpo
h.path(f"M{bx(-L2 + Lt - 6)},{by(Rc)} H{bx(L2 - Lt + 6)} V{by(ro + .5)} H{bx(-L2 + Lt - 6)} Z", "url(#PVCr)", K, 1.1)
# tuercas
for s in (-1, 1):
    a, b = (-L2, -L2 + Lt) if s < 0 else (L2 - Lt, L2)
    h.path(f"M{bx(a)},{by(Rt)} H{bx(b)} V{by(Rc - 2.5)} H{bx(a + (6 if s < 0 else 0))} V{by(ro + .8)} H{bx(a)} Z" if s < 0 else
           f"M{bx(a)},{by(Rt)} H{bx(b)} V{by(ro + .8)} H{bx(b - 6)} V{by(Rc - 2.5)} H{bx(a)} Z", "url(#PLAS)", K, 1.1)
    xo = s * (L2 - Lt - 10); h.circ(bx(xo), by(ro + .3 + CP["oring"]), CP["oring"] * kb, "url(#GOMA)", K, .8)
    xa = s * (L2 - Lt + 8)
    h.path(f"M{bx(xa - 6)},{by(ro + 6)} H{bx(xa + 6)} V{by(ro + .2)} " + " ".join(f"L{bx(xa + 6 - 3 * i - 1.5)},{by(ro + 1.4)} L{bx(xa + 6 - 3 * (i + 1))},{by(ro + .2)}" for i in range(4)) + " Z", "url(#CERAM)", K, .8)
    h.ln(bx(s * 250) - 0, by(-Rt), bx(s * L2), by(-Rt), K, 0)
# vista abajo (contorno de tuercas y cuerpo)
h.path(f"M{bx(-L2)},{by(-ro)} V{by(-Rt)} H{bx(-L2 + Lt)} V{by(-Rc)} H{bx(L2 - Lt)} V{by(-Rt)} H{bx(L2)} V{by(-ro)}", "none", K, 1.1)
h.ln(bx(-178), Y0, bx(178), Y0, K, .45, h.EJE)
h.ln(bx(-4), by(ro), bx(-4), by(ri), K, 1.2); h.ln(bx(4), by(ro), bx(4), by(ri), K, 1.2)
h.dimH(by(Rt) - 14, bx(-L2), bx(L2), "150 (*)", ext=by(Rt), c=OR)
h.dimV(bx(L2) + 18, by(Rt), by(-Rt), "Ø96 (*)", ext=bx(L2), c=OR)
for n, (x, r), (gx, gy) in [("1", (-140, ro - e / 2), (bx(-140), by(Rt) - 22)), ("2", (0, Rc - 3), (bx(-30), by(Rt) - 22)), ("3", (-L2 + Lt / 2, Rt - 4), (bx(-L2 + 8), by(Rt) - 22)),
                            ("4", (L2 - Lt - 10, ro + 3.8), (bx(30), by(Rt) - 22)), ("5", (L2 - Lt + 8, ro + 4), (bx(L2 - 10), by(Rt) - 22)), ("6", (0, ro - e / 2), (bx(60), Y0 + 26))]:
    h.globo(n, bx(x), by(r), gx, gy, r=9)
h.txt(bx(-170), by(-Rt) + 24, "1 CAÑO · 2 CUERPO · 3 TUERCA · 4 JUNTA TORICA · 5 ANILLO DE AGARRE · 6 TOPE (*)", 9.5, 400, OR)

# =============== 3. CURVADO EN FRIO ===============
subt(h, 40, 360, "CURVA EN FRIO", "ESC. 1:25 · SIN ACCESORIO · R ≥ 20 × D (*)")
kc = .04 * 1.0; ox, oy = 60, 560; Rr = PE["Rcurva"]

cxa, cya = ox + Rr * kc * 4.2, oy
for rr, sw in ((Rr * kc * 4.2 + ro * kc * 4.2, 1.2), (Rr * kc * 4.2 - ro * kc * 4.2, 1.2)):
    h.path(arcoPath(cxa, cya, rr, 180, 270), "none", K, sw)
h.path(arcoPath(cxa, cya, Rr * kc * 4.2, 180, 270), "none", K, .45, h.EJE)
h.ln(cxa, cya, cxa - Rr * kc * 4.2, cya, K, .4, h.OCULTA); h.ln(cxa, cya, cxa, cya - Rr * kc * 4.2, K, .4, h.OCULTA)
h.txt(cxa - Rr * kc * 2.1, cya + 14, "R ≥ 1000 (*)", 10, 700, OR, "middle")
h.txt(40, 595, "NO SE CALIENTA CON SOPLETE · SI SE APLASTA, SE CORTA EL TRAMO (*)", 9.5, 400, OR)

# =============== 4. CORRUGADO 3/4" · MEDIO CORTE ===============
subt(h, 300, 360, "CORRUGADO 3/4\" · MEDIO CORTE", "ESC. 4:1 · Ø Y PASO (*)")
k4 = 4.0; X4, Y4 = 330, 470
def cz(x): return CR["De"] / 2 - CR["cresta"] * (.5 - .5 * math.cos(x / CR["paso"] * 2 * math.pi))
xs = [i * .25 for i in range(0, int(48 / .25) + 1)]
top_o = [(X4 + x * k4, Y4 - cz(x) * k4) for x in xs]; top_i = [(X4 + x * k4, Y4 - (cz(x) - .55) * k4) for x in xs]
h.path("M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in top_o) + " L" + " L".join(f"{a:.1f},{b:.1f}" for a, b in reversed(top_i)) + " Z", "url(#PVCr)", K, .9)
h.path("M" + " L".join(f"{a:.1f},{2 * Y4 - b:.1f}" for a, b in top_o), "none", K, 1.0)
h.ln(X4 - 10, Y4, X4 + 48 * k4 + 10, Y4, K, .45, h.EJE)
h.dimV(X4 + 48 * k4 + 18, Y4 - CR["De"] / 2 * k4, Y4 + CR["De"] / 2 * k4, "Ø25 (*)", ext=X4 + 48 * k4, c=OR)
h.dimV(X4 - 16, Y4 - (CR["De"] / 2 - CR["cresta"] - .55) * k4, Y4 + (CR["De"] / 2 - CR["cresta"] - .55) * k4, "Ø19,5 (*)", ext=X4, c=OR)
h.dimH(Y4 - CR["De"] / 2 * k4 - 14, X4 + CR["paso"] * 2 * k4, X4 + CR["paso"] * 3 * k4, "4,2 (*)", ext=Y4 - CR["De"] / 2 * k4, c=OR)

# =============== 5. GRAMPA 5015 ===============
subt(h, 590, 360, "GRAMPA 5015 · Ø50", "ESC. 1:1,25 · VISTA DE FRENTE (*)")
k5 = 1.25; gx, gy = 650, 530; rc = ro + GR["chapa"] / 2
h.ln(gx - 80, gy + ro * k5, gx + 80, gy + ro * k5, K, 1.4); h.rect(gx - 80, gy + ro * k5, 160, 12, "url(#CONC)", "none", 0)
anillo(h, gx, gy, ro * k5, ri * k5, "PE", 1.0)
Ro, Ri = (rc + GR["chapa"] / 2) * k5, (rc - GR["chapa"] / 2) * k5
h.path(f"M{gx - Ro - GR['ala'] * k5},{gy + ro * k5} V{gy + ro * k5 - GR['chapa'] * k5} H{gx - Ro} V{gy} " + f"A{Ro},{Ro} 0 0,1 {gx + Ro},{gy} V{gy + ro * k5 - GR['chapa'] * k5} H{gx + Ro + GR['ala'] * k5} V{gy + ro * k5} H{gx + Ri} V{gy} A{Ri},{Ri} 0 0,0 {gx - Ri},{gy} V{gy + ro * k5} Z", "url(#MET)", K, 1.0)
for s in (-1, 1):
    xx = gx + s * (Ro + GR["ala"] * k5 / 2); h.ln(xx, gy + ro * k5 - 6, xx, gy + ro * k5 + 22, K, .8, h.OCULTA); h.rect(xx - 4, gy + ro * k5 - GR["chapa"] * k5 - 3, 8, 3, "#fff", K, .8)
h.dimH(gy - Ro - 14, gx - Ro - GR["ala"] * k5, gx + Ro + GR["ala"] * k5, "≈ 100 (*)", ext=gy - Ro, c=OR)
h.txt(gx, gy + ro * k5 + 36, "CHAPA H°G° 1,2 × 20 (*) · 2 TORNILLOS CON FISHER", 9, 400, OR, "middle")

# =============== TABLAS Y NOTAS ===============
EX = {5005: "Ø50 · e 3,0 (*) · NEGRO", 5006: "3/4\" · Ø25 (*)", 5015: "PARA Ø50 (*)"}
yt = tablaCod(h, 40, 640, [5005, 5006, 5015], EX, w=800, rowh=15, tit_extra="MEDIDA", wext=170)
cols = [(150, "l", False), (210, "c", False), (220, "c", False), (220, "c", False)]
fil = [["", "PEAD Ø50 (5005)", "PVC RIGIDO Ø50 (5009)", "CORRUGADO 3/4\" (5006)"],
       ["SE CURVA", "SI, EN FRIO (R ≥ 20 D (*))", "NO: CON CURVAS", "SI, A MANO"],
       ["UNION", "A COMPRESION (*)", "ENCHUFE PEGADO", "CUPLA (*)"],
       ["USO EN LA APP", "VEREDA, HORMIGON, CANAL", "CONDUCTO DE PAT", "CABLE DE PAT"],
       ["UNIDAD DEL PAÑOL", "Un. (*)", "m", "Un. (*)"]]
yt = tablaG(h, 40, yt + 24, cols, fil, rowh=15, titulo="CUAL USAR")
yr = rayadosC(h, 40, yt + 24, ["PE", "PVCr", "PLAS", "GOMA", "MET", "CERAM"], cols=3, dx=260)

notasW(h, 40, yr + 14, [
    "COTAS EN mm. DATOS: FICHA DE LA APP (FAMILIA «CAÑOS Y CONDUCTOS») Y AP-TC-007 (UN PEAD Ø50 POR CIRCUITO DEL TABLERO A LA ZANJA).",
    "(*) PARED DEL PEAD: SE DIBUJO 3,0 (TRITUBO PEAD 50 × 3); PN6 EN PE100 SERIA ≈ 2,0. CONFIRMAR CON EL PROVEEDOR.",
    "(*) LA APP NO DICE COMO SE UNE EL PEAD: SE DIBUJO LA UNION A COMPRESION COMUN (CUERPO, TUERCAS, JUNTA, ANILLO). SIN CODIGO: A VINCULAR.",
    "(*) Ø Y PASO DEL CORRUGADO, MEDIDAS DE LA GRAMPA, RADIO DE CURVADO: PROPORCIONALES, A CONFIRMAR.",
    "(*) 5005 Y 5006 SE DAN POR «Un.»: CONFIRMAR SI ES ROLLO O TRAMO Y CUANTOS METROS TRAE. FUENTES: r3d/FUENTES_civil.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - UNION A COMPRESION (*) CORTADA A CUARTO", "PEAD NEGRO · CUERPO Y TUERCAS (COLOR (*)) · JUNTA TORICA Y ANILLO DE AGARRE ADENTRO")
A = img3d(h, "civil_pead", 884, 96, 600)
columna(h, A, [("pared", "1", "PARED PEAD 3,0 (*)"), ("cuerpo", "2", "CUERPO"), ("tuerca", "3", "TUERCA"), ("oring2", "4", "JUNTA TORICA"),
               ("agarre2", "5", "ANILLO DE AGARRE"), ("tope", "6", "TOPE (*)")], 1500, 120, 380, paso=28)
h.txt(890, 430, "ROLLO DE PEAD Ø50", 11, 700, NV, "start", INT); h.txt(1200, 430, "CORRUGADO 3/4\" Y GRAMPA 5015", 11, 700, NV, "start", INT)
A3 = img3d(h, "civil_corr", 1195, 438, 300)
globo3d(h, A3("cresta"), "", 1520, 650, "CORRUGADO"); globo3d(h, A3("grampa"), "", 1520, 560, "GRAMPA 5015"); globo3d(h, A3("tornillo"), "", 1520, 590, "TORNILLO + FISHER")
globo3d(h, A3("cano"), "", 1520, 470, "CAÑO Ø50")
A2 = img3d(h, "civil_pead_rollo", 884, 438, 300)
globo3d(h, A2("rollo"), "", 1110, 470, "ROLLO (*)"); globo3d(h, A2("punta"), "", 1110, 640, "PUNTA CORTADA")
bloque(h, 890, 700, "DATOS TECNICOS", [
    "PEAD Ø50 PN6: POLIETILENO DE ALTA DENSIDAD, NEGRO",
    "SE CURVA EN FRIO; LAS UNIONES VAN FUERA DE LOS CRUCES (*)",
    "CORRUGADO 3/4\": PVC FLEXIBLE PARA EL CABLE DE PAT",
    "GRAMPA: SUJETA EL CAÑO A PARED O ESTRUCTURA"], w=360, sz=10, lh=13.5)
bloque(h, 1270, 700, "DONDE SE USA", [
    "PEAD: BAJO VEREDA U HORMIGON, CANAL Y ACOMETIDA SUBTERRANEA",
    "AP-TC-007: 1 PEAD Ø50 POR CIRCUITO, DEL TABLERO A LA ZANJA",
    "AP-TC-003: VARIANTE DE LA ACOMETIDA DE LA FUNDACION (HOY: TELGOPOR)",
    "CORRUGADO: CABLE DE PAT · GUIA «ZANJEO Y TENDIDO»"], w=360, sz=10, lh=13.5)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_pead*.mjs, civil_corr.mjs) CON LAS MISMAS MEDIDAS DEL PLANO. FUENTES: r3d/FUENTES_civil.md")
rotuloMat(h, "MAT-CAÑOS-2", "PEAD Ø50, CORRUGADO 3/4\"", "Y GRAMPA DE SUJECION", "CORTES, UNION, CURVA, CORRUGADO, GRAMPA Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha=FECHA)
guardarC(h, "mat_canos_2")
