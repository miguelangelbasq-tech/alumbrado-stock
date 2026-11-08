"""MAT-CAMARAS-1 (rev. B) · Cámara de inspección PVC 40 × 40 (5003), marco y tapa de bronce «A.P.» (5016), masilla de boca (5017).
Plano y 3D con las mismas medidas (perfiles_civil.json: CAM, PVC, VER). 3D: r3d/out/civil_camara.png.
Fuentes: ficha de la app (pliego LP 21478, plano AP-TC-002 Detalle N° 3), CRUCE_AP_TC_002, r3d/FUENTES_civil.md. Lo que no está: naranja (*)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from civilkit import *

C = PC["CAM"]; V = PC["VER"]; P = PC["PVC"]; mc = C["marco"]; tp = C["tapa"]
h = nuevaC()
a, e, hp, zf = C["A"] / 2, C["e"], C["hpobre"], -C["prof"]
zb = -V["baldosa"]; zm = zb - V["mortero"]; zc = zm - V["contrapiso"]; zk = zf + C["zCano"]; ro = P["d110"]["D"] / 2

# =============== 1. CORTE A-A (por el eje de un caño) ===============
h.titulo(40, 62, "CORTE A-A · POR EL EJE DEL CAÑO DE TRABAJO", "ESC. 1:10 · CAMARA EN LA VEREDA, A UN LADO DEL CRUCE (AP-TC-002)")
k = .38; ox, oy = 250, 130             # (y = 0, z = 0) → hoja; y hacia la derecha
def X(y): return ox + y * k
def Y(z): return oy - z * k
B = 540
# suelo y vereda
h.rect(X(-B), Y(zc), (2 * B) * k, (zc - (zf - hp - 160)) * k, "url(#ANSI37)", "none", 0)
h.rect(X(-B), Y(zm), 2 * B * k, (zm - zc) * k, "url(#CONCP)", K, .6); h.rect(X(-B), Y(zb), 2 * B * k, (zb - zm) * k, "url(#MORT)", K, .6)
h.rect(X(-B), Y(0), 2 * B * k, -zb * k, "url(#CERAM)", K, .8)
# hormigón pobre de confinación
h.path(f"M{X(-a - e - hp)},{Y(zc)} V{Y(zf - hp - e)} H{X(a + e + hp)} V{Y(zc)} H{X(a + e)} V{Y(zf - e)} H{X(-a - e)} V{Y(zc)} Z", "url(#CONCP)", K, 1.0)
# cámara PVC (paredes y fondo)
h.path(f"M{X(-a - e)},{Y(-mc['ala'])} V{Y(zf - e)} H{X(a + e)} V{Y(-mc['ala'])} H{X(a)} V{Y(zf)} H{X(-a)} V{Y(-mc['ala'])} Z", "url(#PVCr)", K, 1.3)
# hueco de la cámara en el contrapiso / vereda
h.rect(X(-a), Y(0), 2 * a * k, (0 - zf) * k, "#fff", "none", 0)
h.path(f"M{X(-a - e)},{Y(-mc['ala'])} V{Y(zf - e)} H{X(a + e)} V{Y(-mc['ala'])} H{X(a)} V{Y(zf)} H{X(-a)} V{Y(-mc['ala'])} Z", "url(#PVCr)", K, 1.3)
# marco (ángulo) y tapa
for s in (-1, 1):
    x0 = a if s > 0 else -a
    h.path(f"M{X(x0)},{Y(0)} H{X(x0 + s * mc['ala'])} V{Y(-mc['e'])} H{X(x0 + s * mc['e'])} V{Y(-mc['ala'])} H{X(x0)} Z", "url(#BRZ)", K, .9)
h.rect(X(-a + mc["e"] + tp["juego"]), Y(0), (2 * (a - mc["e"] - tp["juego"])) * k, tp["e"] * k, "url(#BRZ)", K, 1.0)
# caño Ø110 que entra por la pared (y > a), cortado por su eje
h.path(f"M{X(a - 12)},{Y(zk + ro)} H{X(B)} V{Y(zk + ro - 3.2)} H{X(a - 12)} Z M{X(a - 12)},{Y(zk - ro + 3.2)} H{X(B)} V{Y(zk - ro)} H{X(a - 12)} Z", "url(#PVCr)", K, .9)
h.rect(X(a - 40), Y(zk + ro - 3.2), 28 * k, (2 * ro - 6.4) * k, "url(#MORT)", K, .8)    # masilla
h.ln(X(-a + 60), Y(zk), X(B + 10), Y(zk), K, .45, h.EJE)
h.path(f"M{X(B)},{Y(zk)} H{X(a - 40)} C{X(a - 150)},{Y(zk)} {X(a - 230)},{Y(zf + 40)} {X(a - 330)},{Y(zf + 11)}", "none", K, 2.2)   # cable
# niveles y cotas
h.nivel(X(-B) + 18, Y(0), "±0,00 SOLADO")
h.dimH(Y(zf - hp - e) + 22, X(-a), X(a), "400", ext=Y(zf))
h.dimH(Y(zf - hp - e) + 40, X(-a - e - hp), X(a + e + hp), "616 (*)", ext=Y(zf - hp - e), c=OR)
h.dimV(X(-B) - 14, Y(0), Y(zf), "600 (PROF. MAX.)", ext=X(-a))
h.dimV(X(-a - e - hp) - 14, Y(-mc["ala"]), Y(zf), "≤ 500 (*)", ext=X(-a - e), c=OR)
h.dimV(X(B) + 14, Y(zk), Y(zf), "80 (*)", ext=X(a + e), c=OR)
h.dimV(X(B) + 14, Y(0), Y(zc), "125", ext=X(B))
lineaCorte(h, X(-B) - 6, Y(zk), X(-B) - 6, Y(zk), "") if False else None
for n, (y, z), (gx, gy) in [("1", (-a - e / 2, -330), (X(-B) + 40, Y(-330))), ("2", (-a - e - hp / 2, -420), (X(-B) + 40, Y(-420))), ("3", (-a - mc["ala"] / 2, -2), (X(-a - 60), Y(0) - 30)),
                            ("4", (0, tp["e"] / 2), (X(0), Y(0) - 30)), ("5", (a + 100, zk + ro - 1.6), (X(a + 100), Y(zk + ro) - 34)), ("6", (a - 26, zk + 20), (X(a - 120), Y(zk + 70))),
                            ("7", (a - 230, zf + 40), (X(a - 260), Y(zf + 130))), ("8", (300, zf - hp - 80), (X(470), Y(zf - hp - 60))), ("9", (-300, (zc + zm) / 2), (X(-B) + 40, Y(zc) + 1))]:
    h.globo(n, X(y), Y(z), gx, gy, r=8.5)
cx, cy = X(-a), Y(-6); h.llamadaDet(cx, cy, 26, ""); h.txt(cx - 29, cy - 18, "D1", 11, 700, K, "end")
cx2, cy2 = X(a - 20), Y(zk); h.llamadaDet(cx2, cy2, 30, ""); h.txt(cx2 + 33, cy2 - 20, "D2", 11, 700)

# =============== 2. PLANTA ===============
subt(h, 620, 62, "PLANTA (SIN TAPA)", "ESC. 1:10")
kp = .28; px, py = 735, 220
def PX(x): return px + x * kp
def PY(y): return py - y * kp
h.rect(PX(-a - mc["ala"]), PY(a + mc["ala"]), (2 * a + 2 * mc["ala"]) * kp, (2 * a + 2 * mc["ala"]) * kp, "url(#BRZ)", K, .9)
h.rect(PX(-a), PY(a), 2 * a * kp, 2 * a * kp, "#fff", K, 1.1)
h.rect(PX(-a - e - hp), PY(a + e + hp), (2 * (a + e + hp)) * kp, (2 * (a + e + hp)) * kp, "none", K, .5, h.OCULTA)
for xx in (-125, 125):
    h.ln(PX(xx - ro), PY(a), PX(xx - ro), PY(a + 250), K, .7, h.OCULTA); h.ln(PX(xx + ro), PY(a), PX(xx + ro), PY(a + 250), K, .7, h.OCULTA)
    h.ln(PX(xx), PY(a + 260), PX(xx), PY(a - 20), K, .4, h.EJE)
h.txt(PX(-125), PY(a + 268), "TRABAJO", 8.5, 400, G, "middle"); h.txt(PX(125), PY(a + 268), "RESERVA", 8.5, 400, G, "middle")
h.dimH(PY(-a - mc["ala"]) + 16, PX(-a), PX(a), "400", ext=PY(-a))
h.dimH(PY(-a - mc["ala"]) + 32, PX(-a - mc["ala"]), PX(a + mc["ala"]), "460 (*)", ext=PY(-a - mc["ala"]), c=OR)
h.dimV(PX(a + e + hp) + 14, PY(125), PY(-125), "250 (*)", ext=PX(125), c=OR)
lineaCorte(h, PX(-125), PY(-a - e - hp - 20), PX(-125), PY(a + e + hp + 20), "A", lado=-1)
h.txt(PX(0), PY(-a - e - hp) + 66, "CAÑOS Ø110 DEL CRUCE", 9, 400, G, "middle")

# =============== 3. D1 MARCO Y TAPA ===============
subt(h, 40, 560, "D1 - MARCO Y TAPA DE BRONCE «A.P.»", "ESC. 1:1,6 · ANGULO 30 × 30 × 4 (*) · TAPA 6 CON NERVIO (*)")
kd = 2.6; dx0, dy0 = 140, 610
def DX(y): return dx0 + (y + a + mc["ala"] + 10) * kd
def DY(z): return dy0 - z * kd
h.rect(DX(-a - mc["ala"] - 10), DY(0), 60 * kd, 20 * kd + 1, "url(#CERAM)", K, .6)
h.rect(DX(-a - mc["ala"] - 10), DY(zb), 60 * kd, 18 * kd, "url(#MORT)", K, .5)
h.path(f"M{DX(-a - mc['ala'])},{DY(0)} H{DX(-a)} V{DY(-mc['ala'])} H{DX(-a - mc['e'])} V{DY(-mc['e'])} H{DX(-a - mc['ala'])} Z", "url(#BRZ)", K, 1.2)
h.path(f"M{DX(-a + mc['e'])},{DY(-tp['e'])} H{DX(-a + mc['e'] + 8)} V{DY(-tp['e'] - 4)} H{DX(-a + mc['e'])} Z", "url(#BRZ)", K, .9)
h.rect(DX(-a + mc["e"] + tp["juego"]), DY(0), 26 * kd, tp["e"] * kd, "url(#BRZ)", K, 1.2)
h.rect(DX(-a + mc["e"] + tp["juego"] + 8), DY(-tp["e"]), 4 * kd, tp["nervio"] * kd, "url(#BRZ)", K, .9)
h.rect(DX(-a - mc["ala"] - 4), DY(-mc["ala"]) , (mc["ala"] + 4 - 0) * kd - 1, 6 * kd, "url(#PVCr)", K, .5) if False else None
h.dimH(DY(0) - 12, DX(-a - mc["ala"]), DX(-a), "30 (*)", ext=DY(0), c=OR)
h.dimV(DX(-a - mc["ala"]) - 12, DY(0), DY(-mc["ala"]), "30 (*)", ext=DX(-a - mc["ala"]), c=OR)
h.dimV(DX(-a + mc["e"] + tp["juego"] + 26) + 12, DY(0), DY(-tp["e"]), "6 (*)", ext=DX(-a + 30), c=OR)
llamada(h, DX(-a - 2), DY(-20), DX(-a - 20), DY(-50), "ANGULO DE BRONCE (MARCO)", sz=9, anc="end")
llamada(h, DX(-a + mc["e"] + 4), DY(-tp["e"] - 2), DX(-a + 30), DY(-30), "ASIENTO DE LA TAPA (*)", sz=9)
llamada(h, DX(-a + 22), DY(-3), DX(-a + 34), DY(-46), "TAPA (*) · «A.P.» EN RELIEVE", sz=9)

# =============== 4. D2 BOCA CON MASILLA ===============
subt(h, 470, 560, "D2 - BOCA DEL CAÑO DE TRABAJO", "ESC. 1:4 · MASILLA 5017 ALREDEDOR DEL CABLE")
k2 = .9; qx, qy = 560, 680; ri = ro - 3.2
h.rect(qx - 20, qy - ro * k2 - 26, 20, 2 * ro * k2 + 52, "url(#PVCr)", K, 1.0)
h.path(f"M{qx},{qy - ro * k2} H{qx + 200} V{qy - ri * k2} H{qx} Z M{qx},{qy + ri * k2} H{qx + 200} V{qy + ro * k2} H{qx} Z", "url(#PVCr)", K, .9)
h.rect(qx - 24, qy - ri * k2, 40, 2 * ri * k2, "url(#MORT)", K, .9)
h.rect(qx - 120, qy - 10 * k2, 330, 20 * k2, "#555", K, .8)
h.dimV(qx + 236, qy - ro * k2, qy + ro * k2, "Ø110", ext=qx + 200)
llamada(h, qx - 10, qy - ri * k2 + 10, qx - 60, qy - ro * k2 - 34, "MASILLA 5017 (*)", sz=9, anc="end")
llamada(h, qx + 120, qy, qx + 140, qy + ro * k2 + 22, "CABLE", sz=9)
llamada(h, qx - 10, qy + ro * k2 + 20, qx - 60, qy + ro * k2 + 40, "PARED DE LA CAMARA", sz=9, anc="end")

# =============== TABLAS Y NOTAS ===============
EX = {5003: "40 × 40 · h ≤ 50", 5016: "BRONCE · «A.P.»", 5017: "1 POR BOCA (*)"}
yt = tablaCod(h, 40, 800, [5003, 5016, 5017], EX, w=800, rowh=15, tit_extra="MEDIDA", wext=150)
cols = [(330, "l", False), (150, "c", True), (320, "l", False)]
fil = [["COMPUTO (POR CRUCE DE CALZADA)", "CANTIDAD", "DE DONDE SALE"],
       ["CAMARAS 40 × 40 (5003)", "2 u", "CRUCE_AP_TC_002: camaras = 2"],
       ["MARCO Y TAPA DE BRONCE (5016)", "2 u", "1 POR CAMARA"],
       ["MASILLA EN LAS BOCAS (5017)", "4 u (*)", "2 BOCAS POR CAMARA (*)"],
       ["HORMIGON POBRE DE CONFINACION", "(*)", "LA APP LO PIDE; NO DICE ESPESOR"]]
yt = tablaG(h, 40, yt + 22, cols, fil, rowh=15, titulo="COMPUTO")
yr = rayadosC(h, 40, yt + 22, ["PVCr", "BRZ", "CONCP", "MORT", "CERAM", "ANSI37"], cols=3, dx=260)
notasW(h, 40, yr + 12, [
    "COTAS EN mm. CRUCE_AP_TC_002: «40 × 40 cm, ALTURA MAXIMA 50 cm», PROFUNDIDAD MAXIMA 0,60 m. 40 cm ES MEDIDA INTERIOR. CAMARA DE PVC TIPO DESAGÜE CLOACAL.",
    "(*) ESPESOR DE PARED, HORMIGON POBRE (100), ALTURA DE LOS CAÑOS, PERFIL DEL MARCO Y DE LA TAPA: PROPORCIONALES, A CONFIRMAR CON EL PLANO OFICIAL.",
    "(*) LA APP: «LAS PIDE EL PLANO AP-TC-002 PERO NO TIENEN ITEM EN EL ANEXO I»: PRECIO PROPIO O RESOLVER CON LA INSPECCION.",
    "(*) MASILLA: 1 POR BOCA; EL CAÑO DE RESERVA LLEVA TAPA 5030 Y CORDON. FUENTES: r3d/FUENTES_civil.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - CAMARA EN LA VEREDA, MEDIO CORTE", "SE SACO LA MITAD DE ADELANTE · TAPA DE BRONCE LEVANTADA PARA VER EL ASIENTO")
A = img3d(h, "civil_camara", 884, 90, 600)
columna(h, A, [("tapa", "4", "TAPA DE BRONCE"), ("leyenda", "", "«A.P.» EN RELIEVE"), ("marco", "3", "MARCO (ANGULO)"), ("baldosa", "", "BALDOSA"), ("asiento", "", "ASIENTO DE LA TAPA"),
               ("contrapiso", "9", "CONTRAPISO"), ("reserva", "", "RESERVA CON TAPA 5030"), ("trabajo", "5", "CAÑO Ø110"), ("masilla", "6", "MASILLA 5017"), ("relleno", "8", "RELLENO"),
               ("pared", "1", "PARED PVC"), ("pobre", "2", "H° POBRE (*)"), ("cable", "7", "CABLE"), ("fondo", "", "FONDO (*)")],
        1490, 112, 690, paso=25)
bloque(h, 890, 715, "DATOS TECNICOS", [
    "CAMARA DE PVC TIPO DESAGÜE CLOACAL, 40 × 40 cm INTERIOR",
    "ALTURA MAXIMA 50 cm · PROFUNDIDAD MAXIMA 0,60 m",
    "MARCO DE BRONCE CON TAPA «A.P.», A NIVEL DEL SOLADO",
    "BOCAS DE LOS CONDUCTOS OBTURADAS CON MASILLA O ESPUMA"], w=360, sz=10, lh=13.5)
bloque(h, 1270, 715, "DONDE SE USA", [
    "AP-TC-002 CRUCE DE CALZADA: 2 CAMARAS, UNA A CADA LADO, EN LA VEREDA",
    "LOS 2 CAÑOS Ø110 LLEGAN DE CAMARA A CAMARA",
    "GUIA «ZANJEO Y TENDIDO»"], w=360, sz=10, lh=13.5)
nota3d(h, 890, 1022, "RENDER: three.js (r3d/escenas/civil_camara.mjs) CON LAS MISMAS MEDIDAS DEL PLANO. FUENTES: r3d/FUENTES_civil.md")
rotuloMat(h, "MAT-CAMARAS-1", "CAMARA DE INSPECCION", "PVC 40 × 40 CON TAPA «A.P.»", "CORTE A-A, PLANTA, D1, D2 Y 3D", "VARIAS", "INDICADAS · 3D S/E", rev="B", fecha=FECHA)
guardarC(h, "mat_camaras_1")
