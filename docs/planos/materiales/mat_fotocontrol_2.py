"""MAT-FOTOCONTROL-2 (rev. B) · Fotocontroles nuevos del pañol (altas del equipo): 3089 electrónico rojo «MOD 9FENC» y 3090 mecánico amarillo «MOD 8FN2C».
Plano con FOTO de r3d/piezas/perfiles_protab.mjs (grupo protab, sin tocarlo); 3D: r3d/out/nelec_foto2.png (sobre el zócalo NEMA 3072).
Datos: ficha de la app (Ø84 × 66 típico, ANSI C136.10, encendido 10 lux / apagado 60 lux, 10 A, 195-270 V). Los modelos 9FENC / 8FN2C (Fivasa)
NO aparecen en la web: forma y mecanismo AC. Térmico = fotorresistencia CdS + bimetal (Intermatic K4023C). Fuentes: r3d/FUENTES_nelec.md."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nelekit import *

F = PT["FOTO"]; D, H, hb, Dt = F["D"], F["H"], F["base"]["h"], F["tapa"]["D"]
h = hojaN()


def media(h, cx, by, e, interior, titulo):
    """vista lateral: mitad izquierda exterior, mitad derecha en corte. by = base de la base (z = 0)"""
    Z = lambda z: by - z * e; Xr = lambda x: cx + x * e
    rT = Dt / 2
    dome = [(rT, hb), (rT, hb + 57 * .55), (rT - 3, hb + 57 * .8), (rT - 12, hb + 57 * .96), (rT - 22, H), (0, H)]
    # exterior (izquierda)
    d = f"M{Xr(0):.1f},{Z(hb):.1f} " + " ".join(f"L{Xr(-x):.1f},{Z(z):.1f}" for x, z in dome) + f" L{Xr(0):.1f},{Z(H):.1f}"
    h.path(d.replace("M", "M", 1), "#fff", K, 1.5)
    h.rect(Xr(-D / 2), Z(hb), D / 2 * e, hb * e, "#fff", K, 1.5)
    h.rect(Xr(-rT + 2), Z(36 + 13), 1.5 * e, 26 * e, "url(#VID)", K, .8)        # ventana
    # corte (derecha): pared de 2,5
    outer = [(x, z) for x, z in dome]; inner = [(max(x - 2.5, 0), z - (2.5 if x < rT - 1 else 0)) for x, z in dome]
    d = f"M{Xr(0):.1f},{Z(H):.1f} " + " ".join(f"L{Xr(x):.1f},{Z(z):.1f}" for x, z in reversed(outer)) + " " + " ".join(f"L{Xr(x):.1f},{Z(z):.1f}" for x, z in inner) + f" L{Xr(0):.1f},{Z(H-2.5):.1f} Z"
    h.path(d, "url(#PLAS)", K, 1.3)
    h.rect(Xr(0), Z(hb), D / 2 * e, hb * e, "url(#PLAS2)", K, 1.3)
    h.ln(Xr(0), Z(H) - 10, Xr(0), Z(-16) + 6, K, .45, h.EJE)
    # patas
    for x in (-F["rPatas"], F["rPatas"]): h.rect(Xr(x - .8), Z(0), 1.6 * e, F["pata"]["largo"] * e, "url(#CU)", K, .8)
    if interior == "elec":
        h.rect(Xr(1), Z(hb + 44), 2 * e, 42 * e, "#fff", K, .9); h.txt(Xr(2) + 4, Z(hb + 46), "", 8)
        h.rect(Xr(4), Z(hb + 22), 16 * e, 16 * e, "url(#BOB)", K, .9)                     # relé
        h.rect(Xr(4), Z(hb + 30), 4 * e, 12 * e, "url(#FER)", K, .7)                       # varistor (disco de canto)
        h.rect(Xr(rT - 12), Z(36 + 2.6), 9 * e, 5.2 * e, "url(#CER)", K, .8)               # fotocélula
    else:
        h.rect(Xr(-26 + 26), Z(hb + 6), 26 * e, 6 * e, "url(#CER)", K, .9)                 # base de baquelita
        h.rect(Xr(4), Z(hb + 42), 2 * e, 36 * e, "url(#MET)", K, .9)                       # bimetal
        for i in range(13): h.circ(Xr(5), Z(hb + 13 + i * 1.5), 2.2 * e * .45, "none", K, .5)  # calefactor
        h.rect(Xr(-10 + 10), Z(hb + 42.5), 6 * e, 2.5 * e, "url(#CU)", K, .8)
        h.rect(Xr(rT - 9), Z(36 + 5), 4 * e, 10 * e, "url(#CER)", K, .8)                   # LDR
    h.txt(cx, by + 30 + F["pata"]["largo"] * e, titulo, 10, 700, K, "middle")
    return Xr, Z


# =============== 1. LATERALES MITAD EN CORTE ===============
e = 2.2
h.titulo(40, 62, "VISTA LATERAL - MITAD EN CORTE", "ESC. 2,2:1 · MEDIDAS TIPICAS ANSI C136.10 (FICHA) · LOS DOS MISMO CUERPO (*)")
XE, ZE = media(h, 225, 300, e, "elec", "3089 ELECTRONICO (ROJO)")
XM, ZM = media(h, 630, 300, e, "mec", "3090 MECANICO (AMARILLO)")
h.dimH(ZE(H) - 20, XE(-D / 2), XE(D / 2), "Ø84 (TIPICA)", ext=ZE(hb))
h.dimV(XE(-D / 2) - 18, ZE(H), ZE(0), "66 (TIPICA)", ext=XE(-D / 2) - 2)
h.dimV(XM(D / 2) + 18, ZM(0), ZM(-13), "13 (*)", ext=XM(F["rPatas"]) + 4, c=OR)
for n, p, (gx, gy) in [("1", (XE(-30), ZE(50)), (70, 110)), ("2", (XE(1.5), ZE(hb + 30)), (380, 110)), ("3", (XE(12), ZE(hb + 14)), (380, 140)),
                        ("4", (XE(6), ZE(hb + 25)), (380, 170)), ("5", (XE(31.5), ZE(36)), (380, 200)), ("6", (XE(-F["rPatas"]), ZE(-10)), (70, 330)),
                        ("7", (XM(5), ZM(hb + 38)), (790, 110)), ("8", (XM(5), ZM(hb + 20)), (790, 140)), ("9", (XM(2), ZM(hb + 41)), (790, 170)),
                        ("10", (XM(33), ZM(41)), (790, 200)), ("11", (XM(10), ZM(hb + 3)), (790, 230))]:
    h.globo(n, p[0], p[1], gx, gy, r=9)

# =============== 2. D1 · COMO FUNCIONA CADA UNO ===============
DY = 410
h.titulo(40, DY, "D1 - COMO CORTA CADA UNO", "ESQUEMAS · L = LINEA (NEGRO) · N (BLANCO) · CARGA (ROJO), COMO EL ZOCALO 3072 (*)")
def esq(ox, oy, titulo, bloques, txt):
    h.txt(ox, oy, titulo, 10, 700)
    yl, yn, ym = oy + 22, oy + 112, oy + 67
    h.ln(ox, yl, ox + 330, yl, K, 1); h.txt(ox - 4, yl + 4, "L", 10, 700, K, "end")
    h.ln(ox, yn, ox + 330, yn, K, 1); h.txt(ox - 4, yn + 4, "N", 10, 700, K, "end")
    x = ox + 20; h.ln(x, yl, x, ym, K, .9); h.circ(x, yl, 2, K, K, 0)
    for t, w in bloques + [("KM", 34)]:
        h.ln(x, ym, x + 12, ym, K, .9); x += 12
        h.rect(x, ym - 17, w, 34, "#fff", K, 1.1); h.txt(x + w / 2, ym + 4, t, 8.5, 700, K, "middle"); x += w
    h.ln(x, ym, x + 12, ym, K, .9); h.ln(x + 12, ym, x + 12, yn, K, .9); h.circ(x + 12, yn, 2, K, K, 0)
    h.txt(ox + 34, ym - 24, "SALIDA «CARGA» → BOBINA DEL CONTACTOR", 8, 400, G)
    for i, l in enumerate(txt): h.txt(ox, oy + 134 + i * 13, l, 8.8, 400, OR if "(*)" in l else K)
esq(50, DY + 40, "ELECTRONICO (3089)", [("LDR / FOTODIODO", 92), ("CIRCUITO + RELE", 96)],
    ["LA CELULA LEE LA LUZ, EL CIRCUITO COMPARA Y EL RELE", "CIERRA LA CARGA (BOBINA DEL CONTACTOR KM).", "SIN PARTES QUE SE CALIENTAN: RESPUESTA ESTABLE (*)."])
esq(470, DY + 40, "MECANICO-TERMICO (3090)", [("LDR CdS", 64), ("CALEFACTOR + BIMETAL", 124)],
    ["CON LUZ LA CdS DEJA PASAR CORRIENTE, EL CALEFACTOR", "CALIENTA EL BIMETAL Y ESTE ABRE EL CONTACTO (APAGA).", "DE NOCHE SE ENFRIA Y CIERRA (ENCIENDE) (*)."])

# =============== 3. TABLA ===============
filas = [["COD.", "DESCRIPCION (TAL CUAL EL PAÑOL)", "UN.", "TIPO", "COLOR", "PATAS", "DATO"]]
for c, t, col, d in [(3089, "ELECTRONICO", "ROJO", "MODELO 9FENC (*)"), (3090, "MECANICO-TERMICO (*)", "AMARILLO", "MODELO 8FN2C (*)")]:
    r = catN(c, 46); filas.append([r[0], r[1], r[2], t, col, "3 NEMA (*)", d])
yt = tablaN(h, 40, 650, [(40, "c", True), (300, "l", False), (34, "c", False), (150, "l", False), (70, "c", False), (80, "c", False), (126, "l", False)],
            filas, "CODIGOS DEL PAÑOL (2) - ALTAS DEL EQUIPO")
yd = tablaN(h, 40, yt + 30, [(200, "l", False), (240, "l", False)], [["DATO", "VALOR (PLIEGO MUNIC. DE CORDOBA)"], ["ENCIENDE CON", "10 lux (± 30 %)"], ["APAGA CON", "60 lux o mas"],
            ["CORRIENTE", "10 A minimo"], ["TENSION", "195 a 270 V"], ["PROTECCION", "IP65 · IRAM AADL J 20-24 / 25"]], "LO QUE PIDE EL PLIEGO (FICHA DE LA APP)", rowh=14)
notasW(h, 40, yd + 22, [
    "COTAS EN mm. Ø84 x 66 Y PATAS: MEDIDAS TIPICAS DE LA FICHA (ANSI C136.10) Y DE MAT-FOTOCONTROL-1. CADA MARCA TIENE LAS SUYAS.",
    "(*) «MOD 9FENC» Y «MOD 8FN2C» (FIVASA, SEGUN EL PEDIDO) NO APARECEN EN LA WEB: FORMA, COLOR DE LA TAPA, PATAS Y MECANISMO A CONFIRMAR CON LA ETIQUETA.",
    "(*) MECANICO = TERMICO: FOTORRESISTENCIA DE CdS + BIMETAL CON CALEFACTOR (REFERENCIA INTERMATIC K4023C). INTERIOR ESQUEMATICO.",
    "(*) LA FICHA DE LA APP DICE QUE SON DOS TECNOLOGIAS DISTINTAS: CONFIRMAR CUAL PIDE EL PROYECTO (AP-T-007/008 PIDEN ELECTROMECANICO).",
    "FUENTES: r3d/FUENTES_nelec.md."], w=800, lh=14)

# =============== 3D ===============
h.titulo(890, 62, "VISTA 3D - LOS DOS SOBRE SU ZOCALO NEMA (3072)", "CORTADOS A CUARTO · IZQUIERDA ELECTRONICO ROJO · DERECHA MECANICO AMARILLO")
A = img3d(h, "nelec_foto2", 900, 90, 600)
columna(h, A, [("rojo", "1", "TAPA ROJA (3089)"), ("pcb", "2", "PLACA DE CIRCUITO"), ("rele", "3", "RELE 10 A (*)"), ("vent", "5", "VENTANA DE LA CELULA"),
               ("amar", "", "TAPA AMARILLA (3090)"), ("bim", "7", "BIMETAL (*)"), ("calef", "8", "CALEFACTOR (*)"), ("cont", "9", "CONTACTO NC (*)"),
               ("base", "11", "BASE CON JUNTA"), ("zoc", "", "ZOCALO 3072")], 1500, 110, 560, paso=42)
bloque(h, 890, 600, "DATOS TECNICOS", ["220 V · 10 A · IP65 (PLIEGO). ENCIENDE 10 lux, APAGA 60 lux.", "3 PATAS NEMA QUE ENTRAN Y GIRAN 35° EN EL ZOCALO (*)."], w=740, sz=9.5, lh=13)
bloque(h, 890, 690, "DONDE SE USA", ["ARRIBA DEL TABLERO (AP-T-019) O EN LA 1.ª COLUMNA (AP-T-003): COMANDA EL CONTACTOR.",
                                       "BARRIO (AP-TC-055): UNO POR LUMINARIA CON SU ZOCALO 3072."], w=740, sz=9.5, lh=13)
rayadosRef(h, 890, 800, ["PLAS", "PLAS2", "CU", "MET", "BOB", "CER", "VID"], cols=4, dx=185)
rotuloMat(h, "MAT-FOTOCONTROL-2", "FOTOCONTROL ELECTRONICO", "Y MECANICO (TERMICO)", "LATERALES EN CORTE, D1, CODIGOS Y 3D", "2,2:1", "INDICADAS · 3D S/E", rev="B", fecha="08/11/2026")
guardar(h, "mat_fotocontrol_2")
