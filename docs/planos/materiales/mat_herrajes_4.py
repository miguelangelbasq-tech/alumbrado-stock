"""MAT-HERRAJES-4 (rev. B) · grupo «nobra»: altas del equipo (respaldo/nuevos.csv, tal cual): collar con espiga móvil Ø240 / 260 / 300 / 350
(4052–4055), bulones 12 × 90 (4048), 12 × 250 (4051), de cabeza redonda 12 × 1" (4056), prisioneros de 3 y 4 cm (4058 / 4059) y perno para
aislador cerámico MN 16 (4057). Plano y 3D con los mismos números: r3d/piezas/perfiles_nobra.mjs (COLLAR, BULN, PERNO16, MN16) y, sin cambios,
perfiles_pat (ABR, BUL.w12) y aerea.mjs (posteHA, aisladorMN). 3D: r3d/out/nobra_her4.png. Fuentes: r3d/FUENTES_nobra.md · FUENTES_pat.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nobrakit import *

CO = PN["COLLAR"]; BN = PN["BULN"]; PE = PN["PERNO16"]; MN = PN["MN16"]
h = nuevaC()

# =============== 1. COLLAR · PLANTA ===============
h.titulo(40, 62, "COLLAR CON ESPIGA MOVIL Ø260 (4053) · PLANTA", "ESC. 1:2,5 · 2 MEDIAS DE PLANCHUELA + BUJE + ESPIGA Ø16 (*)")
s = .58; cx, cy = 230, 250; R0 = 130; e = CO["e"]; luz = CO["luz"] / 2; ore = CO["oreja"]
for sg in (1, -1):
    th0 = math.asin(luz / R0); th1 = math.asin((luz + e) / (R0 + e))
    inn = [(-(R0 * math.cos(th0) + ore), sg * luz)] + [(R0 * math.cos(math.pi - th0 - (math.pi - 2 * th0) * i / 48), sg * R0 * math.sin(math.pi - th0 - (math.pi - 2 * th0) * i / 48)) for i in range(49)] + [(R0 * math.cos(th0) + ore, sg * luz)]
    out = [(-(R0 * math.cos(th0) + ore), sg * (luz + e))] + [((R0 + e) * math.cos(math.pi - th1 - (math.pi - 2 * th1) * i / 48), sg * (R0 + e) * math.sin(math.pi - th1 - (math.pi - 2 * th1) * i / 48)) for i in range(49)] + [(R0 * math.cos(th0) + ore, sg * (luz + e))]
    pts = inn + out[::-1]
    h.path("M" + " L".join(f"{cx + x * s:.1f},{cy + y * s:.1f}" for x, y in pts) + " Z", "url(#MET)", K, 1.0)
h.circ(cx, cy, R0 * s, "none", K, .5, 'stroke-dasharray="6 3"'); h.txt(cx, cy - 10, "POSTE H°A°", 9, 700, G, "middle")
B = CO["buje"]; E_ = CO["espiga"]
by0 = cy + (R0 + e) * s
h.rect(cx - B["De"] / 2 * s, by0, B["De"] * s, B["L"] * s, "url(#MET)", K, 1.0); h.rect(cx - E_["d"] / 2 * s, by0 - 2, E_["d"] * s, (B["L"] + B["sale"] + 60) * s, "#fff", K, .9)
h.rect(cx - 12 * s, by0 + (B["L"] + B["sale"] + 34) * s, 24 * s, 13 * s, "url(#MET)", K, .8)
for sx in (-1, 1): h.rect(cx + sx * (R0 + ore / 2) * s - 3, cy - 20, 6, 40, "#fff", K, .7)
h.dimH(cy - (R0 + e) * s - 22, cx - R0 * s, cx + R0 * s, "Ø INTERIOR = Ø DEL POSTE (240 · 260 · 300 · 350)", ext=cy)
h.dimV(cx + B["De"] / 2 * s + 30, by0, by0 + (B["L"] + B["sale"] + 60) * s, "≈ 140 (*)", ext=cx, c=OR)
llamada(h, cx + B["De"] / 2 * s, by0 + B["L"] / 2 * s, cx + 90, by0 + 20, "BUJE Ø34 x 50 SOLDADO (*)", OR, sz=9)
llamada(h, cx, by0 + (B["L"] + 30) * s, cx + 90, by0 + 44, "ESPIGA Ø16: GIRA Y CORRE (MOVIL) (*)", OR, sz=9)
llamada(h, cx + (R0 + ore / 2) * s, cy, cx + 150, cy - 70, "OREJA + BULON 1/2\"", sz=9)
llamada(h, cx - (R0 + e) * s * .7, cy + (R0 + e) * s * .7, 60, cy + 105, "PLANCHUELA 4,76 x 38 (*)", OR, sz=9)

# =============== 2. CORTE B-B DEL BUJE ===============
subt(h, 470, 230, "CORTE B-B · BUJE Y PRISIONERO", "ESC. 1:1 · EL PRISIONERO (4058 / 4059) TRABA LA ESPIGA (*)")
k2 = 2.0; bx, byy = 560, 360
h.rect(bx - B["De"] / 2 * k2, byy - B["L"] / 2 * k2, (B["De"] - B["Di"]) / 2 * k2, B["L"] * k2, "url(#MET)", K, 1.0)
h.rect(bx + B["Di"] / 2 * k2, byy - B["L"] / 2 * k2, (B["De"] - B["Di"]) / 2 * k2, B["L"] * k2, "url(#MET)", K, 1.0)
h.rect(bx - E_["d"] / 2 * k2, byy - 40 * k2, E_["d"] * k2, 80 * k2, "url(#MET)", K, .9)
h.rect(bx + B["Di"] / 2 * k2, byy - 5 * k2, (B["De"] - B["Di"]) / 2 * k2 + 30 * k2, 10 * k2, "#fff", K, .9)
h.rect(bx + B["De"] / 2 * k2 + 30 * k2, byy - 8.5 * k2, 6.5 * k2, 17 * k2, "url(#MET)", K, .9)
h.dimV(bx - B["De"] / 2 * k2 - 14, byy - B["L"] / 2 * k2, byy + B["L"] / 2 * k2, "50 (*)", ext=bx - B["De"] / 2 * k2, c=OR)
h.dimH(byy + B["L"] / 2 * k2 + 20, bx - B["De"] / 2 * k2, bx + B["De"] / 2 * k2, "Ø34 (*)", ext=byy + B["L"] / 2 * k2, c=OR)
h.dimH(byy - 40 * k2 - 10, bx - E_["d"] / 2 * k2, bx + E_["d"] / 2 * k2, "Ø16", ext=byy - 40 * k2)
llamada(h, bx + B["De"] / 2 * k2 + 34 * k2, byy, bx + 140, byy - 40, "PRISIONERO M10 x 30 / 40 (*)", OR, sz=9)

# =============== 3. BULONES Y PERNO · VISTAS ===============
subt(h, 40, 520, "BULONES, PRISIONEROS Y PERNO DEL MN 16 · VISTAS", "ESC. 1:2 (EL 12 x 250 PARTIDO) · ROSCA 1/2\" W (MAT-HERRAJES-3) · M10 Y Ø16 (*)")
k3 = 1.6; y3 = 575
def bul(y, cod, b, txt, cab="hex"):
    x0 = 100; L = b["L"]; Lr = b["Lr"]; d = b["d"]; Lc = min(L, 120)
    if cab == "hex": h.rect(x0 - b["k"] * k3, y - b["af"] / 2 * k3, b["k"] * k3, b["af"] * k3, "url(#MET)", K, 1.0)
    elif cab == "red": h.path(f"M{x0},{y - b['dk'] / 2 * k3} A{b['k'] * k3 * 1.2},{b['dk'] / 2 * k3} 0 0 0 {x0},{y + b['dk'] / 2 * k3} Z", "url(#MET)", K, 1.0); h.rect(x0, y - d / 2 * k3, b["cuello"] * k3, d * k3, "url(#MET)", K, .8)
    xs = x0 + (b.get("cuello", 0) if cab == "red" else 0) * k3
    lr = min(Lr, Lc)
    h.rect(xs, y - d / 2 * k3, (Lc - (b.get("cuello", 0) if cab == "red" else 0)) * k3, d * k3, "#fff", K, 1.0)
    for i in range(int(lr / 2)): xx = x0 + (Lc - lr + i * 2) * k3; h.ln(xx, y - d / 2 * k3, xx + 1.2 * k3, y + d / 2 * k3, K, .4)
    if L > 120: h.path(f"M{x0 + 60 * k3},{y - d * k3} l-5,{2 * d * k3} M{x0 + 64 * k3},{y - d * k3} l-5,{2 * d * k3}", "none", K, .7)
    h.txt(40, y + 4, str(cod), 10, 700, K, "start", MONO)
    h.txt(x0 + Lc * k3 + 14, y + 4, txt, 9, 400, OR if "(*)" in txt else K)
bul(y3, 4048, BN["b4048"], "12 x 90 · ROSCA 76 (*) · «NO4 76 mm» (*)")
bul(y3 + 30, 4051, BN["b4051"], "12 x 250 · «NO4-R» (*)")
bul(y3 + 60, 4056, BN["b4056"], "12 x 1\" CABEZA REDONDA + CUELLO CUADRADO (*)", "red")
bul(y3 + 85, 4058, BN["b4058"], "PRISIONERO 30 · M10 (*)")
bul(y3 + 108, 4059, BN["b4059"], "PRISIONERO 40 · M10 (*)")
h.dimH(y3 - 18, 100, 100 + 90 * k3, "90", ext=y3 - 6)
# perno MN 16 de pie, con el carretel en corte
px, py = 600, 590; k4 = 1.3
h.rect(px - PE["af"] / 2 * k4, py - PE["k"] * k4, PE["af"] * k4, PE["k"] * k4, "url(#MET)", K, 1.0)
h.rect(px - PE["d"] / 2 * k4, py, PE["d"] * k4, PE["L"] * k4, "#fff", K, 1.0)
for i in range(int(PE["Lr"] / 2.5)): yy = py + (PE["L"] - PE["Lr"] + i * 2.5) * k4; h.ln(px - PE["d"] / 2 * k4, yy, px + PE["d"] / 2 * k4, yy + 1.5 * k4, K, .4)
zA = py + 4 * k4
for sg in (1, -1):
    pf = [(MN["agujero"] / 2, 0), (MN["D"] / 2 - 4, 0), (MN["D"] / 2, 4), (MN["D"] / 2, 14), (MN["D"] / 2 - 3, 18), (MN["Dc"] / 2 + 2, 26), (MN["Dc"] / 2, 32), (MN["Dc"] / 2, MN["H"] - 32), (MN["Dc"] / 2 + 2, MN["H"] - 26), (MN["D"] / 2 - 3, MN["H"] - 18), (MN["D"] / 2, MN["H"] - 14), (MN["D"] / 2, MN["H"] - 4), (MN["D"] / 2 - 4, MN["H"]), (MN["agujero"] / 2, MN["H"])]
    h.path("M" + " L".join(f"{px + sg * r * k4:.1f},{zA + t * k4:.1f}" for r, t in pf) + " Z", "url(#CERAM)", K, 1.0)
h.dimV(px + MN["D"] / 2 * k4 + 16, zA, zA + MN["H"] * k4, "76 (MN 16)", ext=px + MN["D"] / 2 * k4)
h.dimV(px - MN["D"] / 2 * k4 - 18, py, py + PE["L"] * k4, "150 (*)", ext=px - PE["d"] / 2 * k4, c=OR)
h.txt(px, py - PE["k"] * k4 - 12, "4057 · PERNO Ø16 (*) + MN 16", 9.5, 700, K, "middle")

# =============== TABLAS Y NOTAS ===============
EX = {4052: "Ø240", 4053: "Ø260", 4054: "Ø300", 4055: "Ø350", 4048: "12 × 90", 4051: "12 × 250", 4056: "12 × 1\" (25,4)", 4058: "30 · M10 (*)", 4059: "40 · M10 (*)", 4057: "Ø16 × 150 (*)"}
yt = tablaN(h, 40, 800, [4052, 4053, 4054, 4055, 4048, 4051, 4056, 4058, 4059, 4057], EX, w=800, rowh=13.5, wext=120)
yr = rayadosC(h, 40, yt + 16, ["MET", "CERAM"], cols=2, dx=200)
notasW(h, 40, yr + 12, [
    "▪ = ALTA DEL EQUIPO: DESCRIPCION Y UNIDAD TAL CUAL (4052 EN «Un.», 4053–4055 EN «UN»: ES LA MISMA UNIDAD).",
    "(*) COLLAR: NO HAY FICHA. SE DIBUJA COMO LAS ABRAZADERAS H°G° (MAT-HERRAJES-1) + BUJE Y ESPIGA Ø16 QUE GIRA Y SE TRABA CON EL PRISIONERO. USO Y FORMA A CONFIRMAR.",
    "(*) «NO4», «NO4-R» Y «C. RED» NO SE ENTIENDEN DEL TODO: SE LEEN COMO ROSCA DE 76 mm, BULON CON TUERCA Y CABEZA REDONDA (CARROCERO). PRISIONEROS: Ø NO DICE.",
    "(*) PERNO 4057: Ø16 x 150 CON TUERCA Y ARANDELA, PASA POR EL AGUJERO Ø20 DEL CARRETEL MN 16 (MAT-HERRAJES-2). LARGO A CONFIRMAR."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - COLLAR Ø260 EN EL POSTE Y LA FILA DE BULONES", "H°G° · ESPIGA EN SU BUJE CON EL PRISIONERO · PERNO DEL MN 16 CON SU CARRETEL")
A = img3d(h, "nobra_her4", 884, 100, 740)
columna(h, A, [("poste", "", "POSTE H°A°"), ("collar", "1", "COLLAR (4052-4055)"), ("oreja", "", "OREJA + BULON 1/2\""), ("buje", "2", "BUJE (*)"), ("espiga", "3", "ESPIGA Ø16 (*)"),
               ("prisionero", "4", "PRISIONERO 4058 (*)"), ("tuercaE", "", "TUERCA DE LA ESPIGA")], 1000, 140, 560, lado="izq", paso=30)
columna(h, A, [("b4048", "5", "4048 · 12 x 90"), ("b4051", "6", "4051 · 12 x 250"), ("b4056", "7", "4056 · C. REDONDA"), ("b4058", "", "4058 · 30"), ("b4059", "", "4059 · 40")], 1420, 440, 560, lado="der", paso=23)
globo3d(h, A("perno"), "8", 1440, 200, "4057 · PERNO MN 16"); globo3d(h, A("mn16"), "", 1625, 255, "MN 16", lado="izq")
bloque(h, 890, 760, "DONDE SE USA", [
    "COLLAR: EN EL POSTE DE H°A° DE LA RED AEREA (BARRIO) PARA TOMAR UN APOYO / AISLADOR EN LA ESPIGA; SE PIDE POR EL Ø DEL POSTE A ESA ALTURA (*).",
    "BULONES 1/2\": CIERRE DE ABRAZADERAS Y MENSULAS (12 x 90) Y PASANTE DE POSTE (12 x 250). PERNO 4057: ARMA EL CARRETEL MN 16 EN EL RACK."], w=740, sz=9.5, lh=13)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/nobra_her4.mjs; abrazadera y bulones de pat.mjs, MN 16 de aerea.mjs). FUENTES: r3d/FUENTES_nobra.md")
rotN(h, "MAT-HERRAJES-4", "COLLAR CON ESPIGA MOVIL,", "BULONES Y PERNO MN 16", "PLANTA, CORTE B-B, VISTAS, CODIGOS Y 3D", "VARIAS", "INDICADAS · 3D S/E")
guardarC(h, "mat_herrajes_4")
