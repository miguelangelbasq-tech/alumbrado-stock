"""MAT-APOYOS-2 · Postes de 8,5 m: H°A° pretensado Ro 1050 (6023), H°A° pretensado Ro 750 (6501) y madera eucaliptus salinizado (6502).
Datos: FICHAS_TEC.apoyos (6023 empotr. 0,85 m; tabla barrio 6501 / 6023 / 6502 con ítems 11.01–11.03), FAMILIAS_MAT.apoyos (con H°A° va caño de
bajada + fleje), catálogo del pañol, calculadora de barrio (ORIGINAL v130, L47803/48050: empotramiento 1,45 con H-15 en hoyo Ø0,60 · 0,85 directo
en hoyo Ø0,50 con piedra · madera 1,35 directo; Ø del poste para el cómputo 0,30 H°A° / 0,24 madera — valores ESTIMADOS de la calculadora)."""
from ilukit import *
h = nueva(); m = h.m

# ======================= ELEVACIONES (1:100)
k = .042; YG = 440
h.titulo(40, 62, "ELEVACIONES - POSTES DE 8,5 m", "ESC. 1:100 - COTAS EN mm - Ø DIBUJADOS 2× (*)")
h.ln(40, YG, 840, YG, K, 1.4); h.nivel(820, YG, "±0,00")
for xx in range(44, 840, 9): h.ln(xx, YG + 1, xx - 6, YG + 7, K, .4)
P = [dict(x=150, cod="6023", nom="H°A° Ro 1050", emp=1450, d=300, fill="url(#CONC)", fund="H-15 EN HOYO Ø600", item="11.02"),
     dict(x=420, cod="6501", nom="H°A° Ro 750", emp=850, d=300, fill="url(#CONC)", fund="DIRECTO, HOYO Ø500", item="11.01"),
     dict(x=690, cod="6502", nom="MADERA Pm 8,5", emp=1350, d=240, fill="url(#ANSI31)", fund="DIRECTO (SIEMPRE)", item="11.03")]
for p in P:
    x = p["x"]; yb = YG + p["emp"] * k; yt = yb - 8500 * k; rb = p["d"] / 2 * k * 2; rt = rb * .62
    if p["cod"] == "6023":
        h.rect(x - 300 * k * 1.0, YG, 600 * k * 1.0, p["emp"] * k, "url(#CONC)", K, .8)            # hoyo Ø600 con H-15
    h.path(f"M{x-rb},{yb} L{x-rt},{yt} L{x+rt},{yt} L{x+rb},{yb} Z", "#fff" if p["cod"] != "6502" else "#f4ead9", K, 1.4)
    h.ln(x, yt - 10, x, yb + 10, K, .4, h.EJE)
    h.dimV(x - 62, yt, yb, "Po 8.500", ext=x - rt - 3)
    h.dimV(x - 40, YG, yb, f"{p['emp']:,} (*)".replace(",", "."), ext=x - rb - 3, c=OR)
    h.dimV(x - 40, yt, YG, f"{8500 - p['emp']:,}".replace(",", "."), ext=x - rt - 3)
    h.txt(x, yb + 20, p["cod"] + " · " + p["nom"], 10.5, 700, K, "middle"); h.txt(x, yb + 33, p["fund"] + " (*)", 9, 400, OR, "middle")
    h.txt(x, yb + 46, f"Ø BASE ≈ {p['d']} (*) · ÍTEM {p['item']}", 9, 400, OR, "middle")
# caño de bajada + fleje (en los de H°A°)
x = P[0]["x"] + 14
h.rect(x, YG - 4000 * k, 6, 4000 * k + 20, "url(#PLAS)", K, .7)
for z in (800, 2000, 3200): h.rect(x - 22, YG - z * k - 2, 34, 4, "#555", K, .3)
h.txt(x + 14, YG - 3000 * k, "CAÑO DE BAJADA + FLEJE", 9, 700, K)
h.txt(x + 14, YG - 3000 * k + 12, "(SOLO EN H°A°)", 9, 400, G)
h.globo("1", P[0]["x"], YG - 3500 * k, 60, 150); h.globo("2", P[1]["x"], YG - 3500 * k, 330, 150); h.globo("3", P[2]["x"], YG - 3500 * k, 600, 150)
h.globo("4", P[0]["x"], YG + 500 * k, 60, YG + 20)

# ======================= TABLAS
h.tabla(40, 590, [(62, "c", True), (150, "l", False), (80, "c", False), (130, "c", False), (130, "c", False), (238, "l", False)],
        [("CODIGO", "POSTE", "ÍTEM", "CARGA ROTURA", "EMPOTR. (CALC.)", "PARA QUE"),
         ("6023", "H°A° pretensado Po 8,5", "11.02", "Ro 1050 kg", "1,45 / 0,85 (*)", "retenciones fuertes y puntas"),
         ("6501", "H°A° pretensado Po 8,5", "11.01", "Ro 750 kg", "1,45 / 0,85 (*)", "alineación"),
         ("6502", "madera eucaliptus salinizado", "11.03", "—", "1,35 (*)", "va empotrado directo")],
        rowh=20, titulo="VARIANTES (LP 21478 ANEXO I · EPEC ET 4)", colores=coloresOR)
y2 = h.codigos(40, 706, [6023, 6501, 6502])
h.datos(40, y2 + 30, [("LARGO", "8,5 m (Po / Pm)"), ("NORMA", "EPEC ET 4 (H°A°)"),
        ("EMPOTR. H-15", "1,45 m en hoyo Ø0,60 (calc.) (*)"), ("EMPOTR. DIRECTO", "0,85 m en hoyo Ø0,50 + piedra (*)"),
        ("EMPOTR. MADERA", "1,35 m directo (calc.) (*)"), ("FICHA 6023", "empotramiento 0,85 m"), ("Ø CIMA H°A°", "18–20 (Ro 750) · 20–22 (Ro 1050) cm")], w=420, c1=130)
textoBloque(h, 485, y2 + 30, "DONDE SE USA", [
    "· AP-TC-055: unidades aéreas de barrio con",
    "   brazo H°G° 2,13 m (4501) y luminaria.",
    "· Calculadora 🏘 Barrio › Apoyos nuevos:",
    "   tipo, cómo se planta y empotramiento.",
    "· 6023 también sirve de apoyo del tablero",
    "   (con caño de bajada y fleje).",
    "· Abrazaderas por Ø medido (4001…4008)."], sz=10, dy=15)
h.notas(40, 1040, [
    "COTAS EN mm. LOS EMPOTRAMIENTOS Y Ø SON LOS QUE USA LA CALCULADORA COMO ESTIMADO (*): MANDA EL PLANO / ET 4 DE EPEC.",
    "(*) LA FICHA DEL 6023 DICE 0,85 m DE EMPOTRAMIENTO; LA CALCULADORA PROPONE 1,45 m SI VA CON H-15. CONFIRMAR CON EPEC.",
    "CON POSTE DE H°A° LLEVA CAÑO DE BAJADA SUJETO CON FLEJE; CON APOYO PRFV NUEVO NO (VER MAT-APOYOS-1).",
    "FUENTE: LP 21478 ANEXO I (11.01–11.03), EPEC ET 4, FICHA DE APOYOS (Ø CIMA DEL ESQUEMA DE LA APP) Y CALCULADORA DE BARRIO."])

# ======================= 3D: LOS TRES, LADO A LADO
h.titulo(890, 62, "VISTA 3D - LOS TRES POSTES DE 8,5 m", "H°A° PRETENSADO (GRIS, ARIDOS) · MADERA SALINIZADA · SUELO CORTADO A UN CUARTO")
for i, p in enumerate(P):
    h.iso(.068, 1010 + i * 210, 860 - i * 0)
    B = 380
    m.box(-B, 0, -B, B, -1600, 0, "#c9a77c", pat="soil3", edge="#6b5236"); m.box(0, B, -B, 0, -1600, 0, "#c9a77c", pat="soil3", edge="#6b5236"); m.render()
    if p["cod"] == "6023": ringZ(m, p["d"] / 2, 300, -p["emp"], 0, "hormigon", bias=40); m.render()
    ringZ(m, 0, p["d"] / 2, -p["emp"], 0, "hormigon" if p["cod"] != "6502" else "#8f7a4a", bias=60); m.render()
    m.cyl([0, 0, 0], [0, 0, 8500 - p["emp"]], p["d"] / 2, "hormigon" if p["cod"] != "6502" else "#8f7a4a", n=24, r1=p["d"] / 2 * .62, seg=10,
          pat="conc3" if p["cod"] != "6502" else None, capmat="#9a9ea3" if p["cod"] != "6502" else "#b59d6a"); m.render()
    c = h.P(0, 0, 8500 - p["emp"]); h.txt(c[0], c[1] - 32, p["cod"], 13, 700, NV, "middle", MONO); h.txt(c[0], c[1] - 14, p["nom"], 10.5, 700, NV, "middle", INT)
h.txt(1265, 1010, "EL 6023 DIBUJADO CON H-15 (HOYO Ø600); LOS OTROS EMPOTRADOS DIRECTO (*)", 10, 400, OR, "middle", INT)
h.rotulo(890, h.H - 150, 750, "MAT-APOYOS-2", "POSTES DE 8,5 m", "H°A° Ro 1050 / Ro 750 · MADERA", "ELEVACIONES, VARIANTES, CODIGOS, DATOS Y 3D", "1:100", "3D S/E")
guardar(h, "mat_apoyos_2")
