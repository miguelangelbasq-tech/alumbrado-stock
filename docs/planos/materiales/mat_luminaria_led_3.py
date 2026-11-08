"""MAT-LUMINARIA_LED-3 (rev. B) · grupo «nobra»: altas del equipo (respaldo/nuevos.csv, tal cual): luminarias LED Strand 100 W para barrios (6025)
y para plazas (6026), Quisur LED 75 W (6028), proyector LED Bael Pointer Plus 100 L90 (6030) y shorting cup (6029) para el zócalo NEMA sin fotocontrol.
Plano y 3D con los mismos números: perfiles_col (LUM: carcasa Strand RS 160 de MAT-LUMINARIA_LED-1, sin cambios) y perfiles_nobra (PROY, SCUP, QUISUR).
3D: r3d/out/nobra_lum.png, nobra_scup.png. Fuentes: r3d/FUENTES_nobra.md (TE ALR-MC-10 Ø73 × 35,6; Intermatic SK4500K Ø3-1/4" × 1-1/2"). Lo que no está: (*)."""
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nobrakit import *

LUM = json.load(open(os.path.join(R3D, "perfiles_col.json")))["LUM"]; PR = PN["PROY"]; SC = PN["SCUP"]; kq = PN["QUISUR"]["k"]
FOTO = json.load(open(os.path.join(R3D, "perfiles_protab.json")))["FOTO"] if os.path.exists(os.path.join(R3D, "perfiles_protab.json")) else {"rPatas": 15.5}
h = nuevaC()

def planta(x0, y0, s, k=1.0):
    L, W, c, xa, r = LUM["L"] * k, LUM["W"] * k / 2, LUM["cuello"] * k, LUM["xAncho"] * k, LUM["rEsq"] * k
    p = [(0, -c), (xa, -W), (L - r, -W)] + [(L - r + r * math.cos(a), -W + r + r * math.sin(a)) for a in [-math.pi / 2 + i * math.pi / 12 for i in range(1, 7)]]
    p += [(L - r + r * math.cos(a), W - r + r * math.sin(a)) for a in [i * math.pi / 12 for i in range(0, 7)]] + [(xa, W), (0, c)]
    h.path("M" + " L".join(f"{x0 + x * s:.1f},{y0 + y * s:.1f}" for x, y in p) + " Z", "#fff", K, 1.3)
    for i in range(8): yy = y0 + (-W + 30 * k + i * (2 * W - 60 * k) / 7) * s; h.ln(x0 + (LUM["L"] * .4) * k * s, yy, x0 + (L - 15 * k) * s, yy, K, .4)
    return L, W

# =============== 1. STRAND 100 W (6025 / 6026) ===============
h.titulo(40, 62, "STRAND 100 W (6025 · 6026)", "ESC. 1:10 · PLANTA Y COSTADO · CARCASA RS 160 (*)")
s1 = .42; x1, y1 = 90, 190
L, W = planta(x1, y1, s1)
h.circ(x1 + LUM["nema"]["x"] * s1, y1, LUM["nema"]["D"] / 2 * s1, "#fff", K, .9); h.circ(x1 + LUM["nema"]["x"] * s1, y1, SC["D"] / 2 * s1, "none", K, .6, 'stroke-dasharray="4 2"')
h.rect(x1 - 80 * s1, y1 - 30 * s1, 80 * s1, 60 * s1, "url(#MET)", K, .9)
h.dimH(y1 - W * s1 - 14, x1, x1 + L * s1, "575 (*)", ext=y1 - W * s1, c=OR); h.dimV(x1 + L * s1 + 14, y1 - W * s1, y1 + W * s1, "312 (*)", ext=x1 + L * s1, c=OR)
llamada(h, x1 + LUM["nema"]["x"] * s1, y1 - 12, x1 + 140, y1 - 30, "NEMA + SHORTING CUP 6029", sz=9)
llamada(h, x1 - 40 * s1, y1, x1 - 50, y1 + 48, "BRAZO Ø60/Ø42", sz=8.5)
# costado
cy2 = 315
h.path(f"M{x1},{cy2} H{x1 + L * s1} V{cy2 - LUM['H'] * s1 * .55} L{x1 + L * s1 - 20},{cy2 - LUM['H'] * s1} H{x1 + 30} L{x1},{cy2 - LUM['H'] * s1 * .7} Z", "#fff", K, 1.3)
h.rect(x1 + LUM["nema"]["x"] * s1 - SC["D"] / 2 * s1, cy2 - LUM["H"] * s1 - SC["H"] * s1, SC["D"] * s1, SC["H"] * s1, "url(#PLAS2)", K, .9)
h.dimV(x1 + L * s1 + 14, cy2 - LUM["H"] * s1, cy2, "93 (*)", ext=x1 + L * s1, c=OR)
h.txt(40, cy2 + 18, "6025 / 6026: SOLO CAMBIA «(BARRIOS)» / «(PLAZAS)»: OPTICA Y COLOR DE LUZ (*)", 8.5, 400, OR)

# =============== 2. QUISUR 75 W ===============
h.titulo(40, 365, "QUISUR 75 W (6028)", f"ESC. 1:10 · SIN FICHA: MISMA FAMILIA A ESCALA {str(kq).replace('.', ',')} (*)")
x3, y3 = 90, 455
L2, W2 = planta(x3, y3, s1, kq)
h.rect(x3 - 70 * s1, y3 - 21 * s1, 70 * s1, 42 * s1, "url(#MET)", K, .9)
h.dimH(y3 + W2 * s1 + 16, x3, x3 + L2 * s1, f"≈ {LUM['L'] * kq:.0f} (*)", ext=y3 + W2 * s1, c=OR); h.dimV(x3 + L2 * s1 + 14, y3 - W2 * s1, y3 + W2 * s1, f"≈ {LUM['W'] * kq:.0f} (*)", ext=x3 + L2 * s1, c=OR)

# =============== 3. PROYECTOR ===============
h.titulo(470, 365, "PROYECTOR BAEL POINTER PLUS 100 (6030)", "ESC. 1:10 · FRENTE Y COSTADO (*) · ALUMINIO, VIDRIO, LIRA")
s3 = .45; px, py = 510, 420
h.rect(px, py, PR["W"] * s3, PR["H"] * s3, "url(#MET)", K, 1.3); h.rect(px + (PR["W"] - PR["vidrio"][0]) / 2 * s3, py + (PR["H"] - PR["vidrio"][1]) / 2 * s3, PR["vidrio"][0] * s3, PR["vidrio"][1] * s3, "url(#VID)", K, .8)
h.path(f"M{px - 12},{py + PR['H'] * s3 / 2} V{py + PR['H'] * s3 + 30} H{px + PR['W'] * s3 + 12} V{py + PR['H'] * s3 / 2}", "none", K, 2.2)
h.dimH(py - 12, px, px + PR["W"] * s3, "300 (*)", ext=py, c=OR); h.dimV(px - 26, py, py + PR["H"] * s3, "240 (*)", ext=px - 12, c=OR)
qx = px + PR["W"] * s3 + 40
h.rect(qx, py, PR["P"] * .55 * s3, PR["H"] * s3, "url(#MET)", K, 1.2)
for i in range(PR["aletas"]): h.ln(qx + PR["P"] * .55 * s3, py + 8 + i * (PR["H"] * s3 - 16) / (PR["aletas"] - 1), qx + PR["P"] * s3, py + 8 + i * (PR["H"] * s3 - 16) / (PR["aletas"] - 1), K, 1.0)
h.dimH(py + PR["H"] * s3 + 16, qx, qx + PR["P"] * s3, "62 (*)", ext=py + PR["H"] * s3, c=OR)
h.txt(px, py + PR["H"] * s3 + 50, "LIRA EN U CON 2 PERNOS: SE INCLINA Y SE FIJA. L90: OPTICA DE 90° (*)", 8.5, 400, OR)

# =============== 4. SHORTING CUP ===============
h.titulo(470, 62, "SHORTING CUP (6029) · CORTE Y CONEXION", "ESC. 2:1 · ANSI C136.10 · VA EN EL NEMA CUANDO NO HAY FOTOCONTROL")
s4 = 2.0; sx, sy = 570, 235
for sg in (1, -1):
    pf = [(0, 0), (SC["D"] / 2, 0), (SC["D"] / 2, SC["H"] * .55), (SC["D"] / 2 - 6, SC["H"] * .62), (SC["D"] / 2 - 7, SC["H"]), (0, SC["H"])]
    inn = [(0, 2.5), (SC["D"] / 2 - 2.2, 2.5), (SC["D"] / 2 - 2.2, SC["H"] * .55), (SC["D"] / 2 - 8.2, SC["H"] * .62), (SC["D"] / 2 - 9.2, SC["H"] - 2.5), (0, SC["H"] - 2.5)]
    h.path("M" + " L".join(f"{sx + sg * r * s4:.1f},{sy - t * s4:.1f}" for r, t in pf) + " Z M" + " L".join(f"{sx + sg * r * s4:.1f},{sy - t * s4:.1f}" for r, t in inn[::-1]) + " Z", "url(#PLAS2)", K, 1.1, 'fill-rule="evenodd"')
    h.rect(sx + sg * 15.5 * s4 - 1.6 * s4 / 2, sy - 5 * s4, 1.6 * s4, 18 * s4, "url(#CU)", K, .8)
h.path(f"M{sx - 15.5 * s4},{sy - 6 * s4} Q{sx},{sy - 12 * s4} {sx + 15.5 * s4},{sy - 6 * s4}", "none", K, 2.4)
h.dimH(sy + 13 * s4 + 16, sx - SC["D"] / 2 * s4, sx + SC["D"] / 2 * s4, "Ø73", ext=sy); h.dimV(sx + SC["D"] / 2 * s4 + 14, sy - SC["H"] * s4, sy, "35,6", ext=sx + SC["D"] / 2 * s4)
llamada(h, sx, sy - 10.5 * s4, sx + 10, sy - SC["H"] * s4 - 26, "PUENTE DE BRONCE L → CARGA", sz=9)
llamada(h, sx - 15.5 * s4, sy + 10 * s4, sx - 90, sy + 18 * s4, "PATA (L)", sz=9, anc="end")
llamada(h, sx + 15.5 * s4, sy + 10 * s4, sx + 70, sy + 22 * s4, "PATA (CARGA)", sz=9)
# esquema
ex, ey = 745, 120
for i, (t, yy) in enumerate((("L", 0), ("N", 30), ("CARGA", 60))): h.circ(ex, ey + yy, 4, "#fff", K, .9); h.txt(ex - 8, ey + yy + 4, t, 9, 700, K, "end")
h.path(f"M{ex + 4},{ey} H{ex + 40} V{ey + 60} H{ex + 4}", "none", K, 1.8); h.txt(ex + 46, ey + 34, "PUENTE", 8.5, 700, K)
h.txt(ex - 45, ey + 84, "SIEMPRE PRENDIDA: EL CORTE", 8.5, 400, G); h.txt(ex - 45, ey + 96, "LO HACE EL TABLERO (RELOJ)", 8.5, 400, G)

# =============== TABLAS Y NOTAS ===============
EX = {6025: "100 W · BARRIOS", 6026: "100 W · PLAZAS", 6028: "75 W", 6030: "100 W (*) · L90", 6029: "Ø73 × 35,6 (REF.)"}
yt = tablaN(h, 40, 640, [6025, 6026, 6028, 6030, 6029], EX, w=800, rowh=14.5, wext=130)
cols = [(210, "l", False), (210, "c", False), (380, "l", False)]
fil = [["DATO", "VALOR", "DE DONDE SALE"], ["SHORTING CUP ANSI", "Ø73 × 35,6", "TE CONNECTIVITY LUMAWISE ALR-MC-10 (ANSI)"], ["SHORTING CAP (OTRA)", "Ø82,5 × 38 (3-1/4\" × 1-1/2\")", "INTERMATIC SK4500K (POLICARBONATO)"],
       ["CARCASA STRAND", "575 × 312 × 93 (RS 160)", "MAT-LUMINARIA_LED-1 · EL DE 100 W SIN FICHA (*)"],
       ["PROYECTOR POINTER", "ALUMINIO INYECTADO · IP65 (REF.)", "LINEA POINTER PRO · SIN FICHA DEL PLUS (*)"], ["QUISUR 75 W", "SIN DATOS (*)", "NO SE ENCONTRO FICHA EN LA WEB"]]
yt = tablaG(h, 40, yt + 14, cols, fil, rowh=14, titulo="DATOS DE REFERENCIA")
yr = rayadosC(h, 40, yt + 14, ["MET", "PLAS2", "CU"], cols=3, dx=200)
notasW(h, 40, yr + 8, [
    "▪ = ALTAS DEL EQUIPO: DESCRIPCION Y UNIDAD TAL CUAL (6025, 6028 EN «Un.»; 6026, 6029, 6030 EN «UN»: ES LA MISMA UNIDAD).",
    "(*) STRAND 100 W Y QUISUR 75 W: NO HAY FICHA EN LA WEB DESDE ACA. SE DIBUJAN CON LA CARCASA STRAND RS 160 (575 × 312 × 93) Y LA QUISUR ESCALADA. MEDIR UNA.",
    "(*) PROYECTOR: MEDIDAS, PESO (≈ 3,2 kg DE OTRO «POINTER») Y OPTICA L90 A CONFIRMAR CON LA FICHA DE BAEL.",
    "SHORTING CUP: SI LA LUMINARIA TIENE ZOCALO NEMA Y SE COMANDA DESDE EL TABLERO (INTERRUPTOR HORARIO / FOTOCONTROL DEL TABLERO), VA LA CUP EN VEZ DEL FOTOCONTROL."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - STRAND 100 W, QUISUR 75 W Y PROYECTOR BAEL", "A ESCALA ENTRE ELLAS · LA STRAND CON LA SHORTING CUP EN EL NEMA")
A = img3d(h, "nobra_lum", 884, 84, 750)
columna(h, A, [("quisur", "2", "QUISUR 75 W"), ("aletas", "", "ALETAS"), ("scup", "4", "SHORTING CUP"), ("brazo", "", "BRAZO"), ("strand", "1", "STRAND 100 W")], 1000, 100, 440, lado="izq", paso=30)
columna(h, A, [("aletasP", "", "ALETAS"), ("proy", "3", "PROYECTOR (6030)"), ("vidrio", "", "VIDRIO"), ("lira", "", "LIRA")], 1560, 120, 420, lado="izq", paso=30)
h.txt(890, 535, "SHORTING CUP SOBRE EL ZOCALO NEMA, CORTADA A CUARTO", 11, 700, NV, "start", INT)
A2 = img3d(h, "nobra_scup", 1010, 540, 330)
columna(h, A2, [("cup", "4", "TAPA (6029)"), ("puente", "", "PUENTE L → CARGA"), ("pataL", "", "PATA L"), ("pataC", "", "PATA CARGA"), ("pataN", "", "PATA N (LIBRE)"), ("zocalo", "", "ZOCALO NEMA"), ("cables", "", "CABLES")],
        1420, 560, 830, lado="der", paso=34)
bloque(h, 890, 862, "DONDE SE USA", [
    "STRAND 100 W: LUMINARIA DE BARRIO (6025) Y DE PLAZA (6026) EN EL BRAZO / VINCULO; QUISUR 75 W: OTRA MARCA DE LA MISMA POTENCIA QUE EL ITEM 85.1 (75 W) (*).",
    "PROYECTOR: CANCHAS, MONUMENTOS O FACHADAS DE LA PLAZA (*). SHORTING CUP: NEMA SIN FOTOCONTROL."], w=740, sz=9.5, lh=13)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/nobra_lum.mjs, nobra_scup.mjs; luminaria() de col_util y zocaloFoto() de protab_caja sin cambios)")
rotN(h, "MAT-LUMINARIA_LED-3", "LUMINARIAS STRAND Y QUISUR,", "PROYECTOR Y SHORTING CUP", "PLANTAS, COSTADO, PROYECTOR, CORTE, CODIGOS Y 3D", "1:10 · 2:1", "3D S/E")
guardarC(h, "mat_luminaria_led_3")
