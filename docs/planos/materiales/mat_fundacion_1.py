"""MAT-FUNDACION-1 (rev. B) · grupo «nobra»: lo que entra en el pozo de la columna PRFV 7 m (AP-TC-003-A), altas del equipo del pañol
(respaldo/nuevos.csv, tal cual): molde PVC central (5036), caño de desagüe Ø25,4 (5037), arena fina seca (6027), cemento CPN 40 (8039),
arena gruesa (8040), agua (8041), bloque de telgopor (8042) y elastómero de sellado (8043).
Plano y 3D con los mismos números: r3d/piezas/perfiles_nobra.mjs (FUND, BOLSA50, BALDE, CARTU). 3D: r3d/out/nobra_fund.png, nobra_fund_mat.png.
Datos: app (FUNDACIONES.PRFV[7]: 0,60 × 0,60 × 1,20, vol. 0,403; AP-C-033-A LE 1,00 · Ø base 197; pliego 2.4: arena fina hasta −50, sello, elastómero),
CLAUDE.md §11.3 (H-13, molde = Ø base + 50, telgopor a 350, desagüe Ø25,4), FUENTES_civil (TELG). Lo que no está: naranja (*)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nobrakit import *

F = PN["FUND"]; TG = F["telg"]; H13 = F["h13"]
h = nuevaC()

# =============== 1. CORTE A-A ===============
h.titulo(40, 62, "CORTE A-A · FUNDACION PRFV 7 m (AP-TC-003-A)", "ESC. 1:15 · POR EL EJE DEL POSTE Y EL TELGOPOR")
s = .27; X0, Y0 = 235, 188          # x = 0 en el eje, y = 0 en el piso
X = lambda x: X0 + x * s; Y = lambda z: Y0 - z * s
a, t, LE = F["a"] / 2, F["t"], F["LE"]; rP = F["Dposte"] / 2; rMo = F["Dcom"] / 2; rMi = rMo - F["eMolde"]
h.rect(X(-a - 200), Y(0), (2 * a + 400) * s, (t + 150) * s, "url(#EARTH)", K, .6)
h.rect(X(-a), Y(0), 2 * a * s, t * s, "url(#CONC)", K, 1.6)
h.rect(X(-TG["b"] - rMo), Y(-t + TG["z0"] + TG["h"]), TG["b"] * s, TG["h"] * s, "url(#FOAM)", K, 1.0)
for sg in (1, -1):
    h.rect(X(sg * rMi if sg > 0 else -rMo), Y(0), F["eMolde"] * s + .6, LE * s, "#fff", K, .8)
    h.rect(X(rP if sg > 0 else -rMi), Y(-F["arena"]), (rMi - rP) * s, (LE - F["arena"]) * s, "url(#SAND)", K, .6)
    h.rect(X(rP if sg > 0 else -rMi), Y(0), (rMi - rP) * s, F["sello"] * s, "url(#CONCP)", K, .6)
h.rect(X(-rP), Y(250), 2 * rP * s, (LE + 250) * s, "#fff", K, 1.2); h.rect(X(-rP + 6), Y(250), (2 * rP - 12) * s, (LE + 250) * s, "none", K, .5, h.OCULTA)
h.rect(X(-F["desague"]["D"] / 2), Y(-LE), F["desague"]["D"] * s, (t - LE) * s, "#fff", K, .9)
h.ln(X(0), Y(280), X(0), Y(-t - 60), K, .45, h.EJE)
h.path(f"M{X(-a - 200)},{Y(-720)} H{X(-rMo - 60)} Q{X(-rP - 20)},{Y(-720)} {X(-rP)},{Y(-LE + 350)}", "none", K, 2.2)
h.nivel(X(a + 120), Y(0), "±0,00") if hasattr(h, "nivel") else None
h.dimH(Y(-t) + 16, X(-a), X(a), "600", ext=Y(-t))
h.dimV(X(a) + 22, Y(0), Y(-t), "1200", ext=X(a)); h.dimV(X(a) + 50, Y(0), Y(-LE), "LE 1000", ext=X(rMo))
h.dimV(X(-a) - 18, Y(-t), Y(-t + TG["z0"]), "350", ext=X(-a)); h.dimV(X(-a) - 18, Y(-t + TG["z0"]), Y(-t + TG["z0"] + TG["h"]), "650", ext=X(-a))
h.dimH(Y(250) - 8, X(rP) + 4, X(rP) + 4, "", ext=Y(250)); h.txt(X(rP) + 6, Y(200), "POSTE Ø197", 9, 400); h.dimH(Y(0) - 26, X(-rMo), X(rMo), "Ø250 (247)", ext=Y(0))
for n, (x, z), (gx, gy), tx in [("1", (-a + 40, -900), (60, Y(-1050)), "HORMIGON H-13"), ("2", (rMo - 1, -500), (X(a) + 90, Y(-480)), "MOLDE PVC"),
                                 ("3", (0, -1100), (X(a) + 90, Y(-1100)), "DESAGÜE Ø25,4"), ("4", (-rMo - 80, -500), (60, Y(-560)), "TELGOPOR"),
                                 ("5", ((rP + rMi) / 2, -650), (X(a) + 90, Y(-700)), "ARENA FINA"), ("6", ((rP + rMi) / 2, -25), (X(a) + 90, Y(-130)), "SELLO 50"),
                                 ("7", (rP + 3, 0), (X(a) + 90, Y(120)), "ELASTOMERO")]:
    h.globo(n, X(x), Y(z), gx, gy, r=9)
    h.txt(gx + (14 if gx > X0 else -14), gy + 4, tx, 9, 400, K, "start" if gx > X0 else "end") if False else None
h.a(f'<text x="{X(-a - 196):.1f}" y="{Y(-720) + 14:.1f}" font-size="8.5" fill="{K}" font-family="Arial Narrow, Arial" stroke="#fff" stroke-width="3" paint-order="stroke">CABLE DE LA ZANJA</text>')
lineaCorte(h, X(-a - 60), Y(-t - 40), X(a + 60), Y(-t - 40), "B") if False else None

# =============== 2. PLANTA ===============
h.titulo(470, 62, "PLANTA (SIN EL POSTE)", "ESC. 1:15 · TELGOPOR DEL LADO DE LA ZANJA")
px, py, s2 = 650, 200, .30
h.rect(px - a * s2, py - a * s2, 2 * a * s2, 2 * a * s2, "url(#CONC)", K, 1.5)
anillo(h, px, py, rMo * s2, rMi * s2, "PVCr", .8); anillo(h, px, py, rMi * s2, rP * s2, "SAND", .6); h.circ(px, py, rP * s2, "#fff", K, 1.0)
h.circ(px, py, F["desague"]["D"] / 2 * s2 + 1, "#fff", K, .8)
h.rect(px - TG["a"] / 2 * s2, py + rMo * s2, TG["a"] * s2, TG["b"] * s2, "url(#FOAM)", K, 1.0)
h.dimH(py - a * s2 - 12, px - a * s2, px + a * s2, "600", ext=py - a * s2); h.dimV(px + a * s2 + 14, py - a * s2, py + a * s2, "600", ext=px + a * s2)
h.dimH(py + a * s2 + 16, px - TG["a"] / 2 * s2, px + TG["a"] / 2 * s2, "150 (*)", ext=py + a * s2, c=OR)
h.dimV(px - a * s2 - 14, py + rMo * s2, py + a * s2, "176", ext=px - TG["a"] / 2 * s2)
h.txt(px - 60, py + a * s2 + 44, "↓ ZANJA / CABLE", 9, 700, G, "middle")
h.ln(px, py - a * s2 - 26, px, py + a * s2 + 26, K, .6, h.EJE); h.txt(px + 6, py - a * s2 - 22, "A", 12, 700); h.txt(px + 6, py + a * s2 + 34, "A", 12, 700)

# =============== 3. COMPUTO POR FUNDACION ===============
V = F["vol"]; aF = math.pi / 4 * ((2 * rMi / 1000) ** 2 - (F["Dposte"] / 1000) ** 2)
fil = [["MATERIAL", "CANTIDAD", "CALCULO"],
       ["8039 CEMENTO CPN 40", f"{H13['bolsas'] * V:.2f} BOLSAS".replace(".", ","), f"5,2 × {V:.3f} m³".replace(".", ",")],
       ["8040 ARENA GRUESA", f"{H13['arena'] * V:.3f} m³".replace(".", ","), f"0,55 × {V:.3f}".replace(".", ",")],
       ["PIEDRA 6-20 (8022)", f"{H13['piedra'] * V:.3f} m³".replace(".", ","), f"0,80 × {V:.3f}".replace(".", ",")],
       ["8041 AGUA", f"{H13['agua'] * V:.1f} L".replace(".", ","), f"170 × {V:.3f}".replace(".", ",")],
       ["6027 ARENA FINA SECA", f"{aF * (LE - F['arena']) / 1000:.4f} m³ (*)".replace(".", ","), "ANILLO × 0,95 m"],
       ["5036 MOLDE PVC", "1 (≈ 1,0 m)", "LE 1000"], ["5037 DESAGÜE Ø25,4", "≈ 0,20 m", "1200 − 1000"],
       ["8042 TELGOPOR", "1", "150 × 176 × 650 (*)"], ["8043 ELASTOMERO", "SEGUN VACIOS (*)", "PLIEGO 2.4"]]
tablaG(h, 452, 352, [(140, "l", False), (115, "c", True), (135, "l", False)], fil, rowh=14, titulo=f"COMPUTO POR FUNDACION (H-13 · {str(V).replace('.', ',')} m³)")

# =============== CODIGOS, RAYADOS, NOTAS ===============
EX = {5036: "Ø250 (247) (*)", 5037: "Ø25,4", 6027: "m³", 8039: "50 kg", 8040: "m³", 8041: "L", 8042: "150×176×650 (*)", 8043: "(*)"}
yt = tablaN(h, 40, 610, [5036, 5037, 6027, 8039, 8040, 8041, 8042, 8043], EX, w=800, rowh=14, wext=120, n=84)
yr = rayadosC(h, 40, yt + 16, ["CONC", "CONCP", "SAND", "FOAM", "PVCr", "EARTH"], cols=6, dx=133)
notasW(h, 40, yr + 10, [
    "▪ = ALTAS DEL EQUIPO: DESCRIPCION Y UNIDAD TAL CUAL (8039 EN «bolsa 50kg», 8041 EN «L», 6027 Y 8040 EN «m³»).",
    "(*) VOLUMEN: LA APP USA 0,403 m³ (ANTES 0,4057): A CONFIRMAR. EL MOLDE: Ø BASE + 50 = 247, SE COMPRA Ø250; SE DIBUJA PERDIDO (QUEDA EN EL HORMIGON) (*).",
    "(*) PARECIDOS YA CARGADOS: 8039 ≈ 8008 (CEMENTO CPN 40), 8040 ≈ 8003 (ARENA), 8042 ≈ 8005 (TELGOPOR), 8043 ≈ 8009 (ELASTOMERO): CODIGOS REPETIDOS. REVISAR.",
    "TELGOPOR: SE ROMPE DESPUES DEL FRAGUADO Y DEJA EL CANAL POR DONDE ENTRA EL CABLE A LA «C» DEL POSTE (A 350 DE LA BASE). ARENA FINA SECA HASTA −50 Y SELLO DE 50."], w=800, lh=13.5)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - FUNDACION CORTADA A CUARTO", "POSTE PRFV · MOLDE · ARENA FINA · SELLO · TELGOPOR · DESAGÜE · CABLE QUE ENTRA")
A = img3d(h, "nobra_fund", 890, 84, 390)
columna(h, A, [("poste", "", "POSTE PRFV 7 m"), ("elast", "7", "ELASTOMERO 8043"), ("sello", "6", "SELLO 50"), ("molde", "2", "MOLDE PVC 5036"), ("arena", "5", "ARENA FINA 6027"),
               ("telgopor", "4", "TELGOPOR 8042"), ("hormigon", "1", "HORMIGON H-13"), ("desague", "3", "DESAGÜE 5037"), ("cable", "", "CABLE DE LA ZANJA"), ("tierra", "", "TERRENO")],
        1300, 120, 530, lado="der", paso=34)
h.txt(890, 555, "LOS MATERIALES, A ESCALA", 11, 700, NV, "start", INT)
A2 = img3d(h, "nobra_fund_mat", 890, 560, 560)
columna(h, A2, [("molde", "", "5036 MOLDE"), ("telgopor", "", "8042 TELGOPOR"), ("agua", "", "8041 AGUA"), ("arenaF", "", "6027 ARENA FINA"), ("cemento", "", "8039 CEMENTO"),
                ("arenaG", "", "8040 ARENA GRUESA"), ("cartucho", "", "8043 ELASTOMERO"), ("desague", "", "5037 DESAGÜE")], 1460, 640, 950, lado="der", paso=28)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/nobra_fund.mjs, nobra_fund_mat.mjs). FUENTES: r3d/FUENTES_nobra.md")
rotN(h, "MAT-FUNDACION-1", "FUNDACION PRFV 7 m:", "LO QUE VA EN EL POZO", "CORTE A-A, PLANTA, COMPUTO, CODIGOS Y 3D", "1:15", "3D S/E")
guardarC(h, "mat_fundacion_1")
