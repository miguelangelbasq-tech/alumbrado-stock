"""MAT-MORSETERIA_AEREA-1 (rev. B) · Suspensión y retención de línea preensamblada: grampa 4502 + ménsula 4504; grampa de cuña 4503 + ménsula 4505.
Plano con la geometría de r3d/piezas/perfiles_cables.mjs (AER) y r3d/piezas/aerea.mjs; 3D: r3d/out/aer_susp.png y aer_ret.png.
Datos: ET-1005 (200 / 1700 / 1000 daN, vano 40 m), catálogo LCT (modelos), ficha de la app. Cotas de grampas y ménsulas: (*) proporcionales. Fuentes: r3d/FUENTES_cables.md."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cableskit import *

A_ = PC["AER"]; H = PC["HAZ"]["h25_50"]; NEU = H["neu"]; rn = NEU["rc"]
rp, zc = A_["poste"]["R"], 260; MS, GS, MR = A_["mensS"], A_["grampaS"], A_["mensR"]
h = hoja()

def poste(v, z0, z1):
    v.poly([[-rp, z0], [rp, z0], [rp, z1], [-rp, z1]], "url(#HORM)", 1.6)
    for zz in (z0, z1):  # líneas de rotura
        a, b = v.p(-rp - 8, zz), v.p(rp + 8, zz); h.path(f"M{a[0]:.1f},{a[1]:.1f} l{(b[0]-a[0])*.45:.1f},0 l6,-7 l6,14 l6,-7 L{b[0]:.1f},{b[1]:.1f}", "none", K, .8)
    v.eje(0, z0 - 10, 0, z1 + 10)

# =============== SUSPENSION · ELEVACION ===============
h.titulo(40, 62, "SUSPENSION - ELEVACION", "ESC. 1:1 APROX. (*) · GRAMPA 4502 COLGADA DE LA MENSULA 4504")
e = .95; v = Vista(h, 150, 455, e)
poste(v, 175, 345)
v.poly([[rp, zc - (MS["h"] + 30) / 2], [rp + 7, zc - (MS["h"] + 30) / 2], [rp + 7, zc + (MS["h"] + 30) / 2], [rp, zc + (MS["h"] + 30) / 2]], "url(#ALU)", 1.1)
for dz in (-(MS["h"] + 30) / 2 + 12, (MS["h"] + 30) / 2 - 12):
    v.rect(rp - 1, rp + 11, zc + dz - 9.5, zc + dz + 9.5, "#fff", .8); v.poly([[-rp, zc + dz - 9.5], [rp, zc + dz - 9.5], [rp, zc + dz + 9.5], [-rp, zc + dz + 9.5]], "url(#HG)", .8)
x0, x1 = rp + 6, rp + 6 + MS["L"]
v.poly([[x0, zc - MS["h"] / 2], [x1 - 14, zc - 12], [x1, zc - 8], [x1, zc + 6], [x1 - 14, zc + 10], [x0, zc + MS["h"] / 2]], "url(#ALU)", 1.2)
gx, gz = x1 - 6, zc - 12 - rn - 30
cx, cy = v.p(gx, zc - 12); h.circ(cx, cy, 9 * e, "none", K, 3.2 * e * 2 * .5 + 1)
cuerpo = [[gx - rn - 6, gz - rn - 7], [gx + rn + 6, gz - rn - 7], [gx + rn + 8, gz + 2], [gx + 6, gz + rn + 22], [gx - 6, gz + rn + 22], [gx - rn - 8, gz + 2]]
v.poly(cuerpo, "url(#NYL)", 1.2); a = v.p(gx, gz + rn + 30); h.circ(a[0], a[1], 8.5 * e, "#fff", K, 1)
nucleo2d(h, *v.p(gx, gz), e, NEU, al=True)
for ang in (20, 160, 270):   # fases del haz rodeando la grampa (en el 3D se abren ahí: AC)
    rr = H["d"] * 2.15; q = v.p(gx + rr * math.cos(math.radians(ang)), gz + rr * math.sin(math.radians(ang))); nucleo2d(h, q[0], q[1], e, H["fases"][0], al=True)
v.cotaH(rp, x1, zc + MS["h"] / 2 + 20, "≈ 120 (*)", zext=zc + MS["h"] / 2, c=OR)
v.cotaV(gx + 48, gz, zc - 12, "≈ 43 (*)", yext=gx + 28, c=OR)
h.dimV(v.p(-rp, 0)[0] - 60, v.p(0, 370)[1], v.p(0, 150)[1], "Ø ≈ 190 (*)", c=OR) if False else None
h.dimH(v.p(0, 175)[1] + 26, v.p(-rp, 0)[0], v.p(rp, 0)[0], "POSTE H°A° Ø ≈ 190 (*)", ext=v.p(0, 175)[1], c=OR)
for n, (yy, zz), (gx2, gy2) in [("1", (rp + 60, zc + 4), (400, 150)), ("2", (gx, zc - 20), (400, 210)), ("3", (gx + rn + 5, gz), (400, 300)), ("4", (rp - 20, zc + (MS["h"] + 30) / 2 - 12), (400, 120)), ("5", (gx, gz - rn), (400, 360)), ("6", (gx + H["d"] * 2.15 * math.cos(math.radians(20)), gz + 6), (400, 420))]:
    p = v.p(yy, zz); h.globo(n, p[0], p[1], gx2, gy2, r=9)
h.txt(40, 520, "1 MENSULA 4504 · 2 GANCHO · 3 GRAMPA 4502 · 4 FLEJE INOX 3/4\" + HEBILLA (x2) · 5 NEUTRO PORTANTE · 6 FASES DEL HAZ", 9.5, 400, G)

# =============== SECCION B-B DE LA GRAMPA ===============
h.titulo(440, 62, "D1 - GRAMPA DE SUSPENSION EN CORTE", "ESC. 3:1 · POR EL MEDIO, CON EL NEUTRO 50 (Ø 12,5)")
e2 = 3.0; v2 = Vista(h, 630, 270, e2)
cu = [[-rn - 6, -rn - 7], [rn + 6, -rn - 7], [rn + 8, 2], [6, rn + 22], [-6, rn + 22], [-rn - 8, 2]]
v2.poly(cu, "url(#NYL)", 1.4)
c0 = v2.p(0, 0); h.circ(c0[0], c0[1], (rn + .3) * e2, "#fff", K, 1)
v2.poly([[-rn + 1, 0], [rn - 1, 0], [rn - 1, rn + 3], [-rn + 1, rn + 3]], "#fff", .8)
v2.poly([[-rn + 1.2, rn + .2], [rn - 1.2, rn + .2], [rn - 1.2, rn + 6], [-rn + 1.2, rn + 6]], "url(#PLAS)", 1)
nucleo2d(h, c0[0], c0[1], e2, NEU, al=True)
ey = v2.p(0, rn + 30); h.circ(ey[0], ey[1], 11 * e2, "url(#NYL)", K, 1.2); h.circ(ey[0], ey[1], 6 * e2, "#fff", K, 1)
v2.rect(rn + 7, rn + 11, 2.5, 5.5, "#fff", .8); v2.linea([[rn + 11, 4], [-rn - 7, 4]], .6, K, h.OCULTA)
v2.cotaH(-rn - 8, rn + 8, -rn - 14, "≈ 29 (*)", zext=-rn - 7, c=OR)
v2.cotaV(rn + 22, -rn - 7, rn + 41, "≈ 54 (*)", yext=rn + 9, c=OR)
for t, (yy, zz), ty in [("OJO AL GANCHO", (8, rn + 36), 120), ("PIEZA DE APRIETE", (2, rn + 4), 170), ("TORNILLO DE APRIETE (x2)", (rn + 10, 4), 220),
                         ("NEUTRO Al-ALEACION 50", (2, -2), 270), ("CUERPO PLASTICO (*)", (rn + 4, -rn - 2), 320)]:
    p = v2.p(yy, zz); llamada(h, p[0], p[1], 735, ty, t, K, "start", 9.2)

# =============== RETENCION · ELEVACION ===============
h.titulo(40, 560, "RETENCION EN PUNTA - ELEVACION", "S/E (*) · GRAMPA DE CUÑA 4503 + MENSULA 4505 · COLA 1,5 m")
e3 = .9; v3 = Vista(h, 135, 916, e3)
poste(v3, 180, 340)
v3.poly([[rp, zc - MR["h"] / 2], [rp + 8, zc - MR["h"] / 2], [rp + 8, zc + MR["h"] / 2], [rp, zc + MR["h"] / 2]], "url(#ALU)", 1.1)
for dz in (-MR["h"] / 2 + 12, MR["h"] / 2 - 12): v3.poly([[-rp, zc + dz - 9.5], [rp, zc + dz - 9.5], [rp, zc + dz + 9.5], [-rp, zc + dz + 9.5]], "url(#HG)", .8)
xr0, xr1 = rp + 7, rp + 7 + MR["L"]
v3.poly([[xr0, zc - 22], [xr1 - 14, zc - 12], [xr1, zc - 8], [xr1, zc + 8], [xr1 - 14, zc + 12], [xr0, zc + 22]], "url(#ALU)", 1.2)
oj = v3.p(xr1 - 12, zc); h.circ(oj[0], oj[1], 6.5 * e3, "#fff", K, 1)
g0 = xr1 - 12 + 70; Lc = 110
v3.poly([[g0, zc - rn - 8], [g0 + Lc, zc - rn - 15], [g0 + Lc, zc + rn + 15], [g0, zc + rn + 8]], "url(#ALU)", 1.2)
v3.poly([[g0 + 8, zc - rn - 4], [g0 + Lc + 14, zc - rn - 9.6], [g0 + Lc + 14, zc - rn], [g0 + 8, zc - rn]], "url(#PLAS)", .9)
v3.poly([[g0 + 8, zc + rn + 4], [g0 + Lc + 14, zc + rn + 9.6], [g0 + Lc + 14, zc + rn], [g0 + 8, zc + rn]], "url(#PLAS)", .9)
for s in (-1, 1): v3.linea([[xr1 - 10, zc + s * 2.5], [g0 + 18, zc + s * (rn + 11)]], 1.6)
v3.linea([[g0 - 40, zc + rn], [g0 + Lc + 200, zc + rn]], 1.1); v3.linea([[g0 - 40, zc - rn], [g0 + Lc + 200, zc - rn]], 1.1)
v3.eje(g0 - 50, zc, g0 + Lc + 210, zc)
# cola que baja
p1, p2 = v3.p(g0 - 40, zc), v3.p(g0 - 75, zc - 35)
h.path(f"M{p1[0]:.1f},{p1[1]-rn*e3:.1f} Q{p2[0]+rn*e3:.1f},{p1[1]-rn*e3:.1f} {p2[0]+rn*e3:.1f},{p2[1]:.1f} V{v3.p(0, 175)[1]:.1f}", "none", K, 1.1)
h.path(f"M{p1[0]:.1f},{p1[1]+rn*e3:.1f} Q{p2[0]-rn*e3:.1f},{p1[1]+rn*e3:.1f} {p2[0]-rn*e3:.1f},{p2[1]:.1f} V{v3.p(0, 175)[1]:.1f}", "none", K, 1.1)
v3.cotaH(g0, g0 + Lc, zc + rn + 34, "≈ 110 (*)", zext=zc + rn + 15, c=OR)
h.txt(v3.p(g0 + Lc + 120, 0)[0], v3.p(0, zc)[1] - 16, "AL VANO (TIRO)", 9.5, 700, K, "middle")
for n, (yy, zz), (gx2, gy2) in [("1", (rp + 30, zc + 18), (300, 640)), ("2", (g0 + 50, zc + rn + 12), (420, 650)), ("3", (g0 + 30, zc - 9), (520, 640)), ("4", (g0 - 77, 200), (300, 850)), ("5", (rp - 30, zc + MR["h"] / 2 - 12), (120, 640))]:
    p = v3.p(yy, zz); h.globo(n, p[0], p[1], gx2, gy2, r=9)
h.txt(40, 910, "1 MENSULA 4505 · 2 GRAMPA DE CUÑA 4503 · 3 FIADOR INOX · 4 COLA (1,5 m) · 5 FLEJE + HEBILLA (x2)", 9.5, 400, G)

# =============== TABLA / DATOS ===============
fil = [["CODIGO", "DESCRIPCION (CATALOGO DEL PAÑOL)", "UN.", "TIPO"]]
dat = {4502: "LCT PKS-10CF", 4504: "LCT PKS-30", 4503: "PKD-20 / PRA-1500", 4505: "LCT PKR-20"}
for c in [4502, 4504, 4503, 4505]: r = cat(c, 64); fil.append([r[0], r[1], r[2], dat[c]])
yt = tablaC(h, 40, 940, [(52, "c", True), (470, "l", False), (32, "c", False), (130, "c", False)], fil, "CODIGOS DEL PAÑOL (4)", rowh=15)
rayadosC(h, 730, 940, ["HORM", "ALU", "NYL", "HG"], cols=1)
notasW(h, 40, yt + 12, [
    "ET-1005: SUSPENSION 200 daN · RETENCION 1700 / 1000 daN · VANO MAXIMO 40 m. EN H°A°: 2 FLEJES INOX 3/4\" CON HEBILLA; EN MADERA: MAT-MORSETERIA_AEREA-2.",
    "(*) COTAS DE GRAMPAS Y MENSULAS: NO ESTAN EN LA APP NI PUBLICADAS EN LA WEB (CATALOGO LCT); PROPORCIONALES A GRAMPAS ABC (ENSTO SO, NIUELEC 95B).",
    "(*) MODELOS LCT Y MATERIAL DEL CUERPO (TERMOPLASTICO / ALEACION DE Al): A CONFIRMAR CON EPEC SEGUN EL CONDUCTOR."], w=800, lh=13)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - SUSPENSION", "MENSULA CON 2 FLEJES INOX Y GRAMPA COLGANDO EL HAZ POR EL NEUTRO PORTANTE")
A = img3d(h, "aer_susp", 890, 90, 560)
columna(h, A, [("mensula", "1", "MENSULA 4504"), ("gancho", "2", "GANCHO"), ("apriete", "", "PIEZA DE APRIETE"), ("grampa", "3", "GRAMPA 4502"), ("fleje", "4", "FLEJE INOX + HEBILLA"), ("neutro", "5", "NEUTRO PORTANTE"), ("fase", "", "FASES ENROLLADAS"), ("poste", "", "POSTE H°A°")], 1460, 110, 500, paso=38)
h.titulo(890, 545, "VISTA 3D - RETENCION EN PUNTA", "GRAMPA DE CUÑA EN EL NEUTRO, FIADOR AL OJO DE LA MENSULA, COLA QUE BAJA")
A2 = img3d(h, "aer_ret", 890, 570, 560)
columna(h, A2, [("mensula", "1", "MENSULA 4505"), ("ojo", "", "OJO"), ("fiador", "3", "FIADOR INOX"), ("grampa", "2", "GRAMPA DE CUÑA 4503"), ("cuna", "", "CUÑAS"), ("cola", "4", "COLA 1,5 m"), ("vano", "", "AL VANO"), ("fleje", "5", "FLEJE + HEBILLA")], 1460, 600, 990, paso=38)
h.txt(890, 1026, "RENDER: three.js (r3d/escenas/aer_susp.mjs, aer_ret.mjs). FUENTES: r3d/FUENTES_cables.md", 9.5, 400, G, "start", INT)
rotuloMat(h, "MAT-MORSETERIA_AEREA-1", "SUSPENSION Y RETENCION", "DE LINEA PREENSAMBLADA", "ELEVACIONES, CORTE D1, DATOS Y 3D", "S/E", "ESQUEMATICAS (*)", rev="B", fecha="08/11/2026")
h.guardar(os.path.join(os.path.dirname(os.path.abspath(__file__)), "mat_morseteria_aerea_1.svg"))
