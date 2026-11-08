"""cableskit · plano de cables y morsetería del grupo «cables» con la MISMA geometría del 3D (r3d/perfiles_cables.json,
que sale de r3d/piezas/perfiles_cables.mjs). Usa fichakit / matbfc / planokit sin modificarlos."""
import json, os, math
from fichakit import *          # noqa: F401,F403  nueva2, Vista, img3d, globo3d, columna, llamada, lineaCorte, bloque, notasW, rotuloMat, cat, colorOR
from planokit import K, G, OR, NV, CAD, MONO, INT

import planokit as _pk
if not getattr(_pk.Hoja.txt, "_esc", False):
    _txt0 = _pk.Hoja.txt
    def _txt(self, x, y, s, *a, **k):
        s = str(s)
        if "<tspan" not in s: s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("&amp;amp;", "&amp;")
        return _txt0(self, x, y, s, *a, **k)
    _txt._esc = True; _pk.Hoja.txt = _txt

PC = json.load(open(os.path.join(R3D, "perfiles_cables.json")))
COL = PC["COL"]
FCOL = {"L1": COL["L1"], "L2": COL["L2"], "L3": COL["L3"], "N": COL["N"], "PE": COL["PE"], "XN": COL["xlpeNegro"], "1": COL["xlpeNegro"], "2": COL["xlpeNegro"], "3": COL["xlpeNegro"]}
FTXT = {"L1": "L1 MARRON", "L2": "L2 NEGRO", "L3": "L3 ROJO", "N": "N CELESTE", "PE": "PE VERDE-AMARILLO"}
CU_F, CU_S = "#d88b55", "#7a3a12"
AL_F, AL_S = "#d5dade", "#5d656c"

DEFSC = '''<defs>
<pattern id="XLP" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="4" fill="#fff"/><line x1="0" y1="0" x2="0" y2="4" stroke="#111" stroke-width=".35"/><line x1="0" y1="2" x2="4" y2="2" stroke="#111" stroke-width=".25"/></pattern>
<pattern id="PVCV" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="4" height="4" fill="#fff"/><line x1="0" y1="0" x2="0" y2="4" stroke="#111" stroke-width=".7"/></pattern>
<pattern id="REL" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><circle cx="1.4" cy="1.6" r=".45" fill="#111"/><circle cx="4.3" cy="4.1" r=".45" fill="#111"/><circle cx="4.6" cy="1.1" r=".3" fill="#111"/></pattern>
<pattern id="ALU" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><line x1="0" y1="0" x2="0" y2="6" stroke="#111" stroke-width=".5"/><line x1="3" y1="0" x2="3" y2="6" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="NYL" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><line x1="0" y1="0" x2="0" y2="6" stroke="#111" stroke-width=".45"/><circle cx="3" cy="3" r=".45" fill="#111"/></pattern>
<pattern id="GOMA" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><path d="M0,3 Q1.5,1 3,3 T6,3" stroke="#111" stroke-width=".45" fill="none"/></pattern>
<pattern id="HG" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="6" height="6" fill="#fff"/><path d="M0,0 V6 M2,0 V6" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="HORM" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#fff"/><circle cx="3" cy="4" r="1.1" fill="none" stroke="#111" stroke-width=".4"/><path d="M8,9 l2,-2 l1.5,2.5 z" fill="none" stroke="#111" stroke-width=".4"/><circle cx="11" cy="2.5" r=".5" fill="#111"/><circle cx="5" cy="11" r=".4" fill="#111"/></pattern>
<pattern id="MAD" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#fff"/><path d="M0,3 Q5,1 10,3 M0,8 Q5,6 10,8" stroke="#111" stroke-width=".45" fill="none"/></pattern>
<pattern id="PORC" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><path d="M0,0 V5 M0,0 H5" stroke="#111" stroke-width=".35"/></pattern>
<radialGradient id="cuG" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#ffd2a8"/><stop offset=".55" stop-color="#d88b55"/><stop offset="1" stop-color="#8a4318"/></radialGradient>
<radialGradient id="alG" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#cfd5da"/><stop offset="1" stop-color="#7f878e"/></radialGradient>
</defs>'''

RAY = {"PVCV": "VAINA PVC", "XLP": "AISLACION XLPE", "REL": "RELLENO", "CU": "COBRE", "ALU": "ALUMINIO", "NYL": "NYLON 6/6 + FV",
       "GOMA": "GOMA / ELASTOMERO", "HG": "ACERO GALV. / INOX", "HORM": "HORMIGON ARMADO", "MAD": "MADERA", "PORC": "PORCELANA", "PLAS": "PVC / PLASTICO"}


def hoja():
    h = nueva2(); h.a(DEFSC); return h


def rayadosC(h, x, y, items, cols=1, dx=200, rowh=22):
    h.txt(x, y, "RAYADOS", 12.5, 700); h.ln(x, y + 4, x + 64, y + 4, K, 1)
    for i, pid in enumerate(items):
        xx = x + (i % cols) * dx; yy = y + 14 + (i // cols) * rowh
        h.rect(xx, yy, 26, 15, f"url(#{pid})", K, .6); h.txt(xx + 32, yy + 11.5, RAY[pid], 9.5)
    return y + 14 + ((len(items) + cols - 1) // cols) * rowh


def circd(cx, cy, r, n=72, cw=True):
    pts = [(cx + r * math.cos(2 * math.pi * i / n * (1 if cw else -1)), cy + r * math.sin(2 * math.pi * i / n * (1 if cw else -1))) for i in range(n)]
    return "M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in pts) + " Z"


def cuerda2d(h, cx, cy, e, c, color=False, al=False, sw=.5):
    """alambres de la cuerda (clase 2 o 5) en corte, a la escala e (px/mm)"""
    fill = ("url(#alG)" if al else "url(#cuG)") if color else ("url(#ALU)" if al else "url(#CU)")
    st = (AL_S if al else CU_S) if color else K
    rw = c["rw"] * e
    if rw < 1.1:   # alambres muy chicos: se dibuja el contorno y un punteado
        h.circ(cx, cy, c["R"] * e, fill, st, sw)
        return
    for r, a in c["hilos"]:
        a = math.radians(a)
        h.circ(cx + r * e * math.cos(a), cy - r * e * math.sin(a), rw * .97, fill, st, sw if rw > 2 else .35)


def nucleo2d(h, cx, cy, e, c, color=False, al=False, sw=1.0, fcol=None):
    """conductor aislado en corte: aislación (anillo) + cuerda"""
    if color:
        col = fcol or FCOL.get(c.get("f", "XN"), COL["xlpeNegro"])
        h.circ(cx, cy, c["rc"] * e, col, K, sw)
        if c.get("f") == "PE":   # franjas amarillas
            ro = c["rc"] * e
            for a0, a1 in ((20, 110), (200, 290)):
                p0 = (cx + ro * math.cos(math.radians(a0)), cy - ro * math.sin(math.radians(a0))); p1 = (cx + ro * math.cos(math.radians(a1)), cy - ro * math.sin(math.radians(a1)))
                ri = c["R"] * e
                q0 = (cx + ri * math.cos(math.radians(a1)), cy - ri * math.sin(math.radians(a1))); q1 = (cx + ri * math.cos(math.radians(a0)), cy - ri * math.sin(math.radians(a0)))
                h.path(f"M{p0[0]:.1f},{p0[1]:.1f} A{ro:.1f},{ro:.1f} 0 0 0 {p1[0]:.1f},{p1[1]:.1f} L{q0[0]:.1f},{q0[1]:.1f} A{ri:.1f},{ri:.1f} 0 0 1 {q1[0]:.1f},{q1[1]:.1f} Z", COL["PEy"], "none", 0)
            h.circ(cx, cy, ro, "none", K, sw)
        h.circ(cx, cy, c["R"] * e, "#3a2a1e" if not al else "#555", "none", 0)
    else:
        h.path(circd(cx, cy, c["rc"] * e) + " " + circd(cx, cy, c["R"] * e, cw=False), "url(#XLP)", K, sw, 'fill-rule="evenodd"')
    cuerda2d(h, cx, cy, e, c, color, al)


def corte(h, cx, cy, e, C, color=False, al=False, sw=1.4):
    """corte transversal de un cable multipolar C (CAB.xxx) centrado en (cx, cy), e = px/mm"""
    Ro, Ri = C["Ro"] * e, C["Ri"] * e
    if C.get("ev", 0) > 0:
        h.path(circd(cx, cy, Ro) + " " + circd(cx, cy, Ri, cw=False), "#26282c" if color else "url(#PVCV)", K, sw, 'fill-rule="evenodd"')
        if len(C["conds"]) > 1:
            d = circd(cx, cy, Ri - .3) + " " + " ".join(circd(cx + c["y"] * e, cy - c["z"] * e, c["rc"] * e, cw=False) for c in C["conds"])
            h.path(d, "#c9ccd0" if color else "url(#REL)", K, .5, 'fill-rule="evenodd"')
    for c in C["conds"]:
        nucleo2d(h, cx + c["y"] * e, cy - c["z"] * e, e, c, color, al, 1.0 if color else 1.1)


def cota_radial(h, cx, cy, r0, r1, ang, t, c=K, lado=1, dx=40):
    """cota de espesor (de r0 a r1, en px) con la línea de referencia hacia afuera"""
    a = math.radians(ang); ux, uy = math.cos(a), -math.sin(a)
    p0 = (cx + r0 * ux, cy + r0 * uy); p1 = (cx + r1 * ux, cy + r1 * uy)
    h.ln(p0[0] - ux * 10, p0[1] - uy * 10, p1[0] + ux * 14, p1[1] + uy * 14, c, .6)
    for p in (p0, p1): h.ln(p[0] - 3.5, p[1] + 3.5, p[0] + 3.5, p[1] - 3.5, c, 1.1)
    e = (p1[0] + ux * 14, p1[1] + uy * 14); h.ln(e[0], e[1], e[0] + dx * lado, e[1], c, .6)
    h.txt(e[0] + (dx + 3) * lado, e[1] + 3.5, t, 10, 400, c, "start" if lado > 0 else "end")


def lateral(h, x0, yc, e, C, xs, Lv, Lr, La, Lc, sep=None, al=False, letras=None, pasoHel=None, cortar=None):
    """vista lateral (como en el 3D: la punta pelada en escalones). x en mm desde el fin de la vaina (Lv), cada conductor abierto en z.
    Devuelve las (x, y) de la hoja del eje de cada conductor en su punta."""
    X = lambda x: x0 + x * e
    Ro, Ri = C["Ro"] * e, C["Ri"] * e
    n = len(C["conds"]); rc = max(c["rc"] for c in C["conds"])
    sep = sep if sep is not None else 2 * rc + 2.2
    zs = [((n - 1) / 2 - i) * sep for i in range(n)]
    if C.get("ev", 0) > 0:
        # vaina con línea de rotura a la izquierda
        xa = X(xs)
        h.path(f"M{xa:.1f},{yc-Ro:.1f} H{X(Lv):.1f} V{yc+Ro:.1f} H{xa:.1f} q-7,{-Ro/2:.1f} 0,{-Ro:.1f} t0,{-Ro:.1f} Z", "#fff", K, 1.5)
        if Lr > Lv: h.rect(X(Lv), yc - Ri, (Lr - Lv) * e, 2 * Ri, "url(#REL)", K, .8)
        if cortar is not None:
            h.ln(X(cortar), yc - Ro - 14, X(cortar), yc + Ro + 14, K, .6, h.EJE)
            for s in (-1, 1): h.ln(X(cortar) - 6, yc + s * (Ro + 14), X(cortar) + 6, yc + s * (Ro + 14), K, 2)
            h.txt(X(cortar) - 9, yc - Ro - 18, "A", 12, 700, K, "end"); h.txt(X(cortar) - 9, yc + Ro + 28, "A", 12, 700, K, "end")
    puntas = []
    for i, c in enumerate(C["conds"]):
        zf = zs[i] * e; zi = c["z"] * e * .6
        r = c["rc"] * e; rr = c["R"] * e
        xa0 = X(Lr); xb = X(Lr + 12)
        # tramo de transición (curva) + recto hasta La
        def borde(s):
            return f"M{xa0:.1f},{yc - zi + s:.1f} C{xa0 + 20:.1f},{yc - zi + s:.1f} {xb - 20:.1f},{yc - zf + s:.1f} {xb:.1f},{yc - zf + s:.1f} H{X(La[i]):.1f}"
        h.path(borde(-r) + f" V{yc - zf + r:.1f} " + f"H{xb:.1f} C{xb - 20:.1f},{yc - zf + r:.1f} {xa0 + 20:.1f},{yc - zi + r:.1f} {xa0:.1f},{yc - zi + r:.1f} Z", "#fff", K, 1.1)
        # cuerda pelada
        yy = yc - zf
        h.rect(X(La[i]), yy - rr, (Lc[i] - La[i]) * e, 2 * rr, "#fff", K, .9)
        ph = (pasoHel or max(18, c["R"] * 16)) * e / 7
        xx = X(La[i]) + ph / 2
        while xx < X(Lc[i]) - 1:
            x1 = min(xx + ph * .45, X(Lc[i])); h.ln(xx, yy + rr, x1, yy - rr, K, .45); xx += ph / 2.2
        puntas.append((X(Lc[i]), yy, X(La[i]), r, rr))
    return puntas


def leyendaF(h, x, y, fases, cols=2, dx=140):
    for i, f in enumerate(fases):
        xx = x + (i % cols) * dx; yy = y + (i // cols) * 18
        h.circ(xx + 6, yy - 4, 6, FCOL[f], K, .6)
        if f == "PE": h.path(f"M{xx+1:.1f},{yy-8:.1f} L{xx+11:.1f},{yy:.1f}", "none", COL["PEy"], 2.4)
        h.txt(xx + 17, yy, FTXT[f], 10)


def marcaVaina(h, x, y, w, hh, texto, sub=None):
    """detalle del grabado de la cubierta: tramo de vaina negra con el texto impreso"""
    h.rect(x, y, w, hh, "#26282c", K, 1.2, 'rx="3"')
    h.a(f'<rect x="{x:.1f}" y="{y+2:.1f}" width="{w:.1f}" height="{hh*.3:.1f}" fill="#fff" opacity=".07"/>')
    h.txt(x + w / 2, y + hh / 2 + 4, texto, min(11, w / (len(texto) * .62)), 700, "#ecebe5", "middle", MONO)
    if sub: h.txt(x + w / 2, y + hh + 15, sub, 9.5, 400, OR, "middle")


def tablaC(h, x, y, cols, filas, titulo, rowh=15):
    return h.tabla(x, y, cols, filas, rowh=rowh, titulo=titulo, colores=colorOR)


def haz2d(h, cx, cy, e, H, color=False, a0=60, numeros=True):
    """corte de un haz preensamblado H (HAZ.xxx): neutro al centro (si es portante) y fases alrededor (ángulo a0 como en el 3D)"""
    n = len(H["fases"]); out = []
    for i, c in enumerate(H["fases"]):
        d = H["d"] if H.get("neu") or c["rc"] >= H["fases"][0]["rc"] else H["d"] - (H["fases"][0]["rc"] - c["rc"])
        a = math.radians(a0 + 360 * i / n); x, y = cx + d * e * math.cos(a), cy - d * e * math.sin(a)
        nucleo2d(h, x, y, e, c, color, al=True, fcol=COL["xlpeNegro"])
        if numeros and c["f"] != "N":
            h.txt(x + c["rc"] * e * .62 * math.cos(a), y - c["rc"] * e * .62 * math.sin(a) + 4, c["f"], 10, 700, "#fff" if color else K, "middle")
        out.append((x, y, c))
    if H.get("neu"):
        nucleo2d(h, cx, cy, e, H["neu"], color, al=True, fcol="#2e3034"); out.append((cx, cy, H["neu"]))
    return out


def lateral_haz(h, x0, yc, e, H, L, paso, a0=60, dx=1.2, color=False):
    """vista lateral del haz retorcido (fases helicoidales alrededor del neutro), con ocultamiento por franjas"""
    n = len(H["fases"]); cores = []
    for i, c in enumerate(H["fases"]):
        d = H["d"] if H.get("neu") or c["rc"] >= H["fases"][0]["rc"] else H["d"] - (H["fases"][0]["rc"] - c["rc"])
        cores.append((c, d, math.radians(a0 + 360 * i / n)))
    if H.get("neu"): cores.append((H["neu"], 0.0, 0.0))
    xs = [i * dx for i in range(int(L / dx) + 1)]
    sl = []
    for k in range(len(xs) - 1):
        for j, (c, d, a) in enumerate(cores):
            pts = []
            for x in (xs[k], xs[k + 1]):
                ang = a + 2 * math.pi * x / paso
                z = d * math.sin(ang); dep = d * math.cos(ang)   # dep > 0 = hacia el que mira (−y)
                pts.append((x, z, dep))
            dep = (pts[0][2] + pts[1][2]) / 2
            sl.append((dep, j, pts, c))
    sl.sort(key=lambda t: t[0])
    fill = "#fff" if not color else "#2b2d31"
    for dep, j, pts, c in sl:
        r = c["rc"] * e
        (xa, za, _), (xb, zb, _) = pts
        Xa, Xb = x0 + xa * e, x0 + xb * e + .3; Ya, Yb = yc - za * e, yc - zb * e
        h.a(f'<path d="M{Xa:.1f},{Ya-r:.1f} L{Xb:.1f},{Yb-r:.1f} L{Xb:.1f},{Yb+r:.1f} L{Xa:.1f},{Ya+r:.1f} Z" fill="{fill}" stroke="none"/>')
        h.ln(Xa, Ya - r, Xb - .3, Yb - r, K, 1.0); h.ln(Xa, Ya + r, Xb - .3, Yb + r, K, 1.0)


_clip_n = [0]
def rrect_d(X, Y, y0, y1, z0, z1, r):
    """path de rectángulo redondeado en coordenadas (y, z) → hoja con X(y), Y(z)"""
    xa, xb, ya, yb = X(y0), X(y1), Y(z1), Y(z0); rr = abs(X(r) - X(0))
    return f"M{xa+rr:.1f},{ya:.1f} H{xb-rr:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {xb:.1f},{ya+rr:.1f} V{yb-rr:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {xb-rr:.1f},{yb:.1f} H{xa+rr:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {xa:.1f},{yb-rr:.1f} V{ya+rr:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {xa+rr:.1f},{ya:.1f} Z"


def morsetoCorte(h, ox, oy, e, P, lin, der, color=False, dientes=True, abierto=0):
    """corte transversal del morseto por la fila de dientes (plano y-z): mitades rayadas, canales, cables cortados, dientes y bulón.
    ox, oy = hoja de (y=0, z=0). lin / der = conductores (dict con R, rc, rw, hilos). Devuelve funciones X, Y"""
    X = lambda y: ox + y * e; Y = lambda z: oy - z * e
    D, H, g = P["D"], P["H"], P["gap"]; rcP, rcD = lin["rc"] + .35, der["rc"] + .35
    for s in (1, -1):
        y0, y1 = (g / 2, D / 2) if s > 0 else (-D / 2, -g / 2)
        _clip_n[0] += 1; cid = f"mc{_clip_n[0]}"
        d = rrect_d(X, Y, y0, y1, -H / 2, H / 2, 3.5)
        h.a(f'<clipPath id="{cid}"><path d="{d}"/></clipPath>')
        h.path(d, "url(#NYL)" if not color else "#2a2b2e", "none", 0)
        for zc, rc in ((P["zP"], rcP), (P["zD"], rcD)):
            h.a(f'<circle cx="{X(0):.1f}" cy="{Y(zc):.1f}" r="{rc*e:.1f}" fill="#fff" stroke="{K}" stroke-width="1.1" clip-path="url(#{cid})"/>')
        # agujero del bulón (en corte por los dientes no se ve: está en x = 0; se dibuja oculto)
        h.path(d, "none", K, 1.5)
    # placa de contacto y dientes (en la mitad de atrás, y < 0)
    if dientes:
        rmax = max(rcP, rcD)
        yA, yB = -rmax - 2.6, -rmax - 1.2
        h.path(f"M{X(yA):.1f},{Y(P['zP']+rcP*.7):.1f} H{X(yB):.1f} V{Y(P['zD']-rcD*.7):.1f} H{X(yA):.1f} Z", "url(#CU)" if not color else "#c99a6a", K, .9)
        for zc, rc, c in ((P["zP"], rcP, lin), (P["zD"], rcD, der)):
            for dz in (-c["R"] * .45, 0, c["R"] * .45):
                tip = -math.sqrt(max(c["R"] ** 2 - dz * dz, 0)) + .3; base = -rc - 1.2
                h.path(f"M{X(base):.1f},{Y(zc+dz-1.7):.1f} L{X(tip):.1f},{Y(zc+dz-.15):.1f} L{X(tip):.1f},{Y(zc+dz+.15):.1f} L{X(base):.1f},{Y(zc+dz+1.7):.1f} Z",
                       "url(#CU)" if not color else "#c99a6a", K, .8)
    # cables en corte (aislación + cuerda): se dibujan después de los dientes para tapar la parte de la punta … y los dientes otra vez encima
    for zc, c, al in ((P["zP"], lin, True), (P["zD"], der, der.get("_al", False))):
        nucleo2d(h, X(0), Y(zc), e, c, color, al=al, fcol=COL["xlpeNegro"])
    if dientes:
        for zc, rc, c in ((P["zP"], rcP, lin), (P["zD"], rcD, der)):
            for dz in (-c["R"] * .45, 0, c["R"] * .45):
                tip = -math.sqrt(max(c["R"] ** 2 - dz * dz, 0)) + .3; yb = -c["rc"] - .2
                h.path(f"M{X(yb):.1f},{Y(zc+dz-1.7*(yb-tip)/(-rc-1.2-tip)):.1f} L{X(tip):.1f},{Y(zc+dz-.15):.1f} L{X(tip):.1f},{Y(zc+dz+.15):.1f} L{X(yb):.1f},{Y(zc+dz+1.7*(yb-tip)/(-rc-1.2-tip)):.1f} Z",
                       "url(#CU)" if not color else "#c99a6a", K, .8)
    return X, Y


def morsetoFrente(h, ox, oy, e, P, pf=False):
    """vista de frente (desde +y): cuerpo L × H, canales ocultos, cabeza fusible, leyendas. ox, oy = hoja de (x=0, z=0). x → derecha"""
    X = lambda x: ox + x * e; Y = lambda z: oy - z * e
    L, H = P["L"], P["H"]
    h.path(rrect_d(X, Y, -L / 2, L / 2, -H / 2, H / 2, 3.5), "#fff", K, 1.6)
    for zc, r in ((P["zP"], P.get("_rcP", 5)), (P["zD"], P.get("_rcD", 3))):
        h.ln(X(-L / 2), Y(zc + r), X(L / 2), Y(zc + r), K, .6, h.OCULTA); h.ln(X(-L / 2), Y(zc - r), X(L / 2), Y(zc - r), K, .6, h.OCULTA)
        h.ln(X(-L / 2 - 8), Y(zc), X(L / 2 + 8), Y(zc), K, .4, h.EJE)
    b = P["bulon"]; af = b["cab"]; rr = af / math.sqrt(3) * e
    h.circ(X(0), Y(b["z"]), 10 * e, "#fff", K, 1.0)
    pts = " ".join(f"{X(0)+rr*math.cos(math.radians(30+60*i)):.1f},{Y(b['z'])+rr*math.sin(math.radians(30+60*i)):.1f}" for i in range(6))
    h.a(f'<polygon points="{pts}" fill="#fff" stroke="{K}" stroke-width="1.2"/>')
    h.circ(X(0), Y(b["z"]), af / 2 * e * .92, "none", K, .5)
    return X, Y
