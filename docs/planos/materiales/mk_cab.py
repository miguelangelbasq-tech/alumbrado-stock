"""mk_cab · ayudas para las hojas de material de cables, terminales, empalmes y prensacables.
Se apoya en planokit (no lo modifica). Sólidos 3D por facetas con sombreado propio, cortes de cable,
rótulo de ficha MAT-…, tablas y bloques de texto que se ajustan al ancho."""
import math, json, os
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT, CORES

AQUI = os.path.dirname(os.path.abspath(__file__))
CAT = {int(k): v for k, v in json.load(open(os.path.join(AQUI, "_cat_app.json"))).items()}
FECHA = "07/11/2026"

# colores reales
C_CU = "#c8743a"; C_CU_HI = "#f2b27a"; C_AL = "#b9bec4"; C_EST = "#d6d9dc"   # cobre, aluminio, cobre estañado
C_VAINA = "#26282c"; C_REL = "#9a9ea4"
FASE = {"L1": "#7b3f1d", "L2": "#1a1a1a", "L3": "#c62828", "N": "#4fa3d9", "PE": "#3d9a4a", "GR": "#9aa0a6"}
FASE_TXT = {"L1": "L1 MARRON", "L2": "L2 NEGRO", "L3": "L3 ROJO", "N": "N CELESTE", "PE": "PE VERDE-AMARILLO", "GR": "GRIS"}


import re as _re
def esc(s):
    return _re.sub(r"&(?!(amp|lt|gt|quot|#\d+);)", "&amp;", str(s)).replace("<", "&lt;").replace(">", "&gt;")


def ancho(s, sz, fam="cad", w=400):
    """ancho aproximado del texto (Arial/Liberation, Inter o JetBrains Mono)"""
    s = str(s)
    if fam == "mono": return len(s) * sz * .6
    k = .56 if fam == "cad" else .58
    up = sum(1 for c in s if c.isupper() or c.isdigit())
    return (up * .66 + (len(s) - up) * .5) * sz * (1.06 if w >= 700 else 1)


def hexrgb(c):
    c = c.lstrip("#"); return [int(c[i:i + 2], 16) for i in (0, 2, 4)]


def rgbhex(r):
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(round(v)))) for v in r)


def sombra(col, f, spec=0.0):
    r = hexrgb(col); return rgbhex([v * f + (255 - v * f) * spec for v in r])


# ---------------------------------------------------------------- hoja de material
class HojaMat(Hoja):
    def __init__(self):
        super().__init__(W=1680, H=1188, divisor=860)
        self._gid = 0

    def txt(self, x, y, s, *a, **kw):
        super().txt(x, y, esc(s), *a, **kw)

    # ---- texto en varias líneas que no se pasa del ancho
    def parrafo(self, x, y, texto, wmax, sz=11, c=K, fam=CAD, lh=None, w=400):
        lh = lh or sz * 1.45; palabras = str(texto).split(" "); linea = ""; n = 0
        famk = "mono" if fam == MONO else ("int" if fam == INT else "cad")
        for p in palabras:
            prueba = (linea + " " + p).strip()
            if ancho(prueba, sz, famk, w) > wmax and linea:
                self.txt(x, y + n * lh, esc(linea), sz, w, c, "start", fam); n += 1; linea = p
            else:
                linea = prueba
        if linea: self.txt(x, y + n * lh, esc(linea), sz, w, c, "start", fam); n += 1
        return y + n * lh

    def notasM(self, x, y, lineas, wmax=790, sz=11):
        self.txt(x, y, "NOTAS", 13, 700); self.ln(x, y + 4, x + 52, y + 4, K, 1); yy = y + 22
        for i, n in enumerate(lineas):
            c = OR if "(*)" in n else K
            yy = self.parrafo(x, yy, f"{i+1}. {n}", wmax, sz, c, lh=15) + 4
        return yy

    def bloque(self, x, y, titulo, lineas, wmax=360, sz=11):
        """titulo subrayado + viñetas que se ajustan al ancho; devuelve la y final"""
        self.txt(x, y, titulo, 13, 700); self.ln(x, y + 4, x + ancho(titulo, 13, "cad", 700), y + 4, K, 1); yy = y + 22
        for l in lineas:
            c = OR if "(*)" in l else K
            self.circ(x + 3, yy - 4, 1.6, c, c, 0)
            yy = self.parrafo(x + 11, yy, l, wmax - 11, sz, c, lh=15) + 4
        return yy

    def tablaM(self, x, y, cols, filas, rowh=20, titulo=None, colores=None, sz=10.5):
        """como planokit.tabla, pero recorta el texto que no entra (con …) y letra configurable"""
        if titulo:
            self.txt(x, y, titulo, 13, 700); self.ln(x, y + 4, x + ancho(titulo, 13, "cad", 700), y + 4, K, 1); y += 14
        tw = sum(c[0] for c in cols)
        for i, fila in enumerate(filas):
            yy = y + i * rowh; self.rect(x, yy, tw, rowh, "#f3f4f6" if i == 0 else "#fff", K, .5); xx = x
            for j, ((cw, al, mono), t) in enumerate(zip(cols, fila)):
                if j: self.ln(xx, yy, xx, yy + rowh, K, .5)
                t = str(t); fam = MONO if (mono and i) else CAD; famk = "mono" if (mono and i) else "cad"
                w = 700 if i == 0 else 400; s = sz if i else sz - .5
                while ancho(t, s, famk, w) > cw - 10 and len(t) > 3: t = t[:-2].rstrip() + "…"
                col = colores(i, j, t) if colores else K
                if "(*)" in t and colores is None: col = OR
                if al == "c": self.txt(xx + cw / 2, yy + rowh - 6, esc(t), s, w, col, "middle", fam)
                else: self.txt(xx + 5, yy + rowh - 6, esc(t), s, w, col, "start", fam)
                xx += cw
        return y + len(filas) * rowh

    def codigos(self, x, y, lista, anchos=(52, 0, 40), titulo="VARIANTES Y CODIGOS DEL PAÑOL", wtot=None, rowh=19, extra_col=None):
        """lista de códigos (int) → tabla código · descripción (del catálogo) · un. Si extra_col=(titulo, dict) agrega una columna."""
        wtot = wtot or 800
        c1, _, c3 = anchos
        ce = extra_col[2] if extra_col and len(extra_col) > 2 else (110 if extra_col else 0)
        c2 = wtot - c1 - c3 - ce
        cols = [(c1, "c", True), (c2, "l", False)] + ([(ce, "c", False)] if extra_col else []) + [(c3, "c", False)]
        enc = ["COD.", "DESCRIPCION (CATALOGO DEL PAÑOL)"] + ([extra_col[0]] if extra_col else []) + ["UN."]
        filas = [enc]
        for cod in lista:
            d, u = CAT[cod]
            filas.append([str(cod), d] + ([extra_col[1].get(cod, "—")] if extra_col else []) + [u])
        return self.tablaM(x, y, cols, filas, rowh, titulo)

    def rotuloM(self, codigo, t1, t2, sub, escalas="S/E", escalas2="", hoja="1 DE 1"):
        x, y, w, h = 890, self.H - 150, 750, 120
        self.rect(x, y, w, h, "#fff", K, 1.6)
        a1 = 250
        for xx in (x + a1, x + w - 210, x + w - 100): self.ln(xx, y, xx, y + h, K, .8)
        self.ln(x, y + 60, x + a1, y + 60, K, .6); self.ln(x + w - 210, y + 60, x + w, y + 60, K, .6)
        self.txt(x + 8, y + 16, "FICHA DE MATERIAL", 9.5, 400, G)
        fs = min(18, (a1 - 16) / (len(codigo) * .6)); self.txt(x + a1 / 2, y + 44, codigo, fs, 700, K, "middle", MONO)
        self.txt(x + 8, y + 76, "PROYECTO", 9.5, 400, G); self.txt(x + 8, y + 100, "PAÑOL - MATERIALES", 12, 700)
        tx = x + a1 + 10; tw = w - a1 - 210 - 20
        self.txt(tx, y + 16, "TITULO", 9.5, 400, G)
        for i, t in enumerate((t1, t2)):
            s = 20
            while ancho(t, s, "cad", 700) > tw and s > 12: s -= .5
            self.txt(tx, y + 50 + i * 28, esc(t), s, 700)
        s = 10.5
        while ancho(sub, s) > tw and s > 8: s -= .5
        self.txt(tx, y + 106, esc(sub), s, 400, G)
        e = x + w - 202; self.txt(e, y + 16, "ESCALAS", 9.5, 400, G); self.txt(e, y + 36, escalas, 11, 700, K, "start", MONO); self.txt(e, y + 52, escalas2, 9.5, 400)
        self.txt(e, y + 76, "UNIDADES", 9.5, 400, G); self.txt(e, y + 100, "mm", 13, 700, K, "start", MONO)
        r = x + w - 92; self.txt(r, y + 16, "REV.", 9.5, 400, G); self.txt(r, y + 40, "A", 14, 700, K, "start", MONO)
        self.txt(r, y + 76, "FECHA / HOJA", 9.5, 400, G); self.txt(r, y + 96, FECHA, 11, 700, K, "start", MONO); self.txt(r, y + 112, hoja, 11, 700, K, "start", MONO)

    # ---------------------------------------------------------------- 3D por facetas
    def _w(self, eje, u, a, b):
        return (u, a, b) if eje == "x" else ((a, u, b) if eje == "y" else (a, b, u))

    def solido(self, eje, u0, u1, prof0, prof1, ca, cb, color, tapa=None, metal=False, borde="#000", bw=.5,
               tapa0=False, agujero=None, op=1, nofacet=False, ca1=None, cb1=None):
        """prisma/tronco a lo largo de 'eje' (x, y o z). prof = [(a, b)] alrededor del centro (ca, cb).
        Dibuja las caras laterales que miran al observador, sombreadas, y la tapa de u1 (o u0)."""
        n = len(prof0); V = (1 / math.sqrt(3),) * 3; L = (-.35, .45, .82); Ln = math.sqrt(sum(v * v for v in L)); L = tuple(v / Ln for v in L)
        P0 = [self._w(eje, u0, ca + a, cb + b) for a, b in prof0]; ca1 = ca if ca1 is None else ca1; cb1 = cb if cb1 is None else cb1
        P1 = [self._w(eje, u1, ca1 + a, cb1 + b) for a, b in prof1]
        ctr = self._w(eje, (u0 + u1) / 2, (ca + ca1) / 2, (cb + cb1) / 2)
        caras = []
        for i in range(n):
            j = (i + 1) % n; q = [P0[i], P0[j], P1[j], P1[i]]
            e1 = [q[1][k] - q[0][k] for k in range(3)]; e2 = [q[3][k] - q[0][k] for k in range(3)]
            nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
            m = math.sqrt(sum(v * v for v in nn)) or 1; nn = [v / m for v in nn]
            mid = [sum(p[k] for p in q) / 4 for k in range(3)]
            if sum((mid[k] - ctr[k]) * nn[k] for k in range(3)) < 0: nn = [-v for v in nn]
            if sum(nn[k] * V[k] for k in range(3)) <= 0.001: continue
            dif = max(0, sum(nn[k] * L[k] for k in range(3)))
            f = .52 + .55 * dif
            sp = 0
            if metal:
                h = [L[k] + V[k] for k in range(3)]; hm = math.sqrt(sum(v * v for v in h)); h = [v / hm for v in h]
                sp = max(0, sum(nn[k] * h[k] for k in range(3))) ** 18 * .75
            caras.append((q, sombra(color, min(f, 1.08), sp)))
        for q, col in caras:
            st = col if not nofacet else col
            self.F3(q, col, st, .45, op)
        # silueta
        if borde:
            pts = [self.P(*p) for p in P0 + P1]; hull = _hull(pts)
            self.a('<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in hull) + f'" fill="none" stroke="{borde}" stroke-width="{bw}" stroke-linejoin="round"/>')
        # tapa
        if tapa is not None:
            T = P0 if tapa0 else P1
            self.F3(T, tapa, borde or tapa, bw, op)
            if agujero is not None:
                ra, col = agujero; uu = u0 if tapa0 else u1
                cA, cB = (ca, cb) if tapa0 else (ca1, cb1)
                self.F3([self._w(eje, uu, cA + ra * math.cos(2 * math.pi * k / 36), cB + ra * math.sin(2 * math.pi * k / 36)) for k in range(36)], col, borde or col, bw)

    def cil(self, eje, u0, u1, ca, cb, r, color, tapa=None, metal=False, n=40, r1=None, **kw):
        p0 = [(r * math.cos(2 * math.pi * k / n), r * math.sin(2 * math.pi * k / n)) for k in range(n)]
        rr = r if r1 is None else r1
        p1 = [(rr * math.cos(2 * math.pi * k / n), rr * math.sin(2 * math.pi * k / n)) for k in range(n)]
        self.solido(eje, u0, u1, p0, p1, ca, cb, color, tapa, metal, **kw)

    def hexa(self, eje, u0, u1, ca, cb, s, color, tapa=None, metal=True, rot=0, **kw):
        """prisma hexagonal: s = entre caras"""
        R = s / math.sqrt(3); p = [(R * math.cos(math.radians(60 * k + rot)), R * math.sin(math.radians(60 * k + rot))) for k in range(6)]
        self.solido(eje, u0, u1, p, p, ca, cb, color, tapa, metal, **kw)

    def circ3(self, eje, u, ca, cb, r, fill, st="#000", sw=.4, n=30):
        self.F3([self._w(eje, u, ca + r * math.cos(2 * math.pi * k / n), cb + r * math.sin(2 * math.pi * k / n)) for k in range(n)], fill, st, sw)

    def helice(self, eje, u0, u1, ca, cb, r, hilos=6, paso=None, col="#7a3f12", sw=.5, fase=0):
        """líneas de la cuerda (hilos retorcidos) sobre la cara visible de un conductor desnudo"""
        paso = paso or r * 9; V = (1 / math.sqrt(3),) * 3
        for k in range(hilos):
            seg = []; N = 60
            for i in range(N + 1):
                u = u0 + (u1 - u0) * i / N; th = 2 * math.pi * k / hilos + 2 * math.pi * (u - u0) / paso + fase
                nn = self._w(eje, 0, math.cos(th), math.sin(th)); vis = sum(nn[q] * V[q] for q in range(3)) > .12
                p = self.P(*self._w(eje, u, ca + r * math.cos(th), cb + r * math.sin(th)))
                if vis: seg.append(p)
                else:
                    if len(seg) > 1: self.a('<polyline points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in seg) + f'" fill="none" stroke="{col}" stroke-width="{sw}"/>')
                    seg = []
            if len(seg) > 1: self.a('<polyline points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in seg) + f'" fill="none" stroke="{col}" stroke-width="{sw}"/>')

    def cuerda_tapa(self, eje, u, ca, cb, r, n=7, col=C_CU_HI, st="#6a3510"):
        """punta del conductor: hilos de la cuerda vistos de frente (7 = 1+6, 19 = 1+6+12)"""
        self.circ3(eje, u, ca, cb, r, sombra(col, .75), st, .4)
        if n == 7: anillos = [(0, 1), (2, 6)]; rh = r / 3.05
        elif n == 19: anillos = [(0, 1), (2, 6), (4, 12)]; rh = r / 5.05
        else:
            rh = r / 7.2; anillos = [(0, 1), (2, 6), (4, 12), (6, 18)]
        for d, m in anillos:
            for k in range(m):
                a = 2 * math.pi * k / max(m, 1) + (.26 if d == 4 else 0)
                self.circ3(eje, u + .01, ca + d * rh * math.cos(a), cb + d * rh * math.sin(a), rh * .95, col, st, .3, 14)

    def g3b(self, n, p, gx, gy, texto, c=NV, ancho_max=None):
        x, y = self.P(*p); self.globo(n, x, y, gx, gy, c, 12)
        if texto: self.txt(gx + 18, gy + 4, esc(texto), 11, 700, c, "start", INT)

    # ---------------------------------------------------------------- 2D: corte de cable
    def corte_cable(self, cx, cy, R, cond, r_cu, e_ais, color=True, hilos=7, relleno=True, vaina=True, rel_r=None,
                    neutro_red=None, cortes_txt=False, sin_relleno_color=None, e_v=None):
        """R = radio exterior (px); cond = lista de claves de color ('L1','L2','L3','N','PE','GR', o '#hex').
        r_cu = radio del conductor (px), e_ais = espesor de aislación (px). neutro_red = (índice, r_cu, e_ais) para el 3+1."""
        n = len(cond)
        rc = r_cu + e_ais
        if vaina: self.circ(cx, cy, R, C_VAINA if color else "#fff", K, 1.1)
        rin = R - (e_v if e_v else 0)
        if relleno and vaina: self.circ(cx, cy, rin, (sin_relleno_color or C_REL) if color else "url(#ANSI37)", K, .5)
        pos = []
        if n == 1: pos = [(0, 0)]
        else:
            # radio de colocación: conductores tocándose
            d = rc / math.sin(math.pi / n) if n > 2 else rc
            off = {2: 0, 3: -90, 4: 45}.get(n, 0)
            for i in range(n):
                a = math.radians(off + 360 * i / n); pos.append((d * math.cos(a), -d * math.sin(a)))
        for i, (k, (px, py)) in enumerate(zip(cond, pos)):
            rcu, eai = r_cu, e_ais
            if neutro_red and i == neutro_red[0]: rcu, eai = neutro_red[1], neutro_red[2]
            col = FASE.get(k, k)
            self.circ(cx + px, cy + py, rcu + eai, col if color else "#fff", K, .7)
            if k == "PE" and color:   # verde-amarillo: franja amarilla
                rr = rcu + eai
                self.path(f"M{cx+px-rr*.95:.1f},{cy+py-rr*.3:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {cx+px-rr*.3:.1f},{cy+py-rr*.95:.1f} L{cx+px+rr*.3:.1f},{cy+py-rr*.95:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {cx+px+rr*.95:.1f},{cy+py-rr*.3:.1f} Z", "#f2c200", "none", 0)
            self.cobre2d(cx + px, cy + py, rcu, color, hilos)
        return pos

    def cobre2d(self, x, y, r, color=True, hilos=7, al=False):
        base = (C_AL if al else C_CU) if color else "#fff"
        self.circ(x, y, r, base if color else "url(#cuH)", K, .45)
        if not hilos or r < 3: return
        if hilos == 7: anillos = [(0, 1), (2, 6)]; rh = r / 3.05
        elif hilos == 19: anillos = [(0, 1), (2, 6), (4, 12)]; rh = r / 5.05
        else: anillos = [(0, 1), (2, 6), (4, 12), (6, 18)]; rh = r / 7.1
        for d, m in anillos:
            for k in range(m):
                a = 2 * math.pi * k / m + (.26 if d == 4 else 0)
                fill = ("#e3e6e9" if al else "#e9a466") if color else "#fff"
                self.circ(x + d * rh * math.cos(a), y + d * rh * math.sin(a), rh * .95, fill, "#6a3510" if (color and not al) else ("#555" if color else K), .35)

    def flecha_llamada(self, ax, ay, tx, ty, texto, sz=10.5, anc="start", c=K):
        self.ln(ax, ay, tx, ty, c, .6); self.circ(ax, ay, 1.8, c, c, 0)
        self.ln(tx, ty, tx + (6 if anc == "start" else -6), ty, c, .6)
        self.txt(tx + (9 if anc == "start" else -9), ty + 4, esc(texto), sz, 400, c, anc)

    def leyenda_fases(self, x, y, claves, cols=2, dx=150):
        for i, k in enumerate(claves):
            xx = x + (i % cols) * dx; yy = y + (i // cols) * 18
            self.circ(xx + 5, yy - 4, 5, FASE.get(k, k), "#000", .4)
            if k == "PE": self.path(f"M{xx+1},{yy-6} h8 v3 h-8 z", "#f2c200", "none", 0)
            self.txt(xx + 14, yy, FASE_TXT.get(k, k), 10)

    def check_codigos(self, lista):
        for c in lista: assert c in CAT, c


def _hull(pts):
    pts = sorted(set((round(x, 2), round(y, 2)) for x, y in pts))
    if len(pts) < 3: return pts
    def cr(o, a, b): return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo = []
    for p in pts:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    up = []
    for p in reversed(pts):
        while len(up) >= 2 and cr(up[-2], up[-1], p) <= 0: up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]


def _circ(r, n=32): return [(r * math.cos(2 * math.pi * k / n), r * math.sin(2 * math.pi * k / n)) for k in range(n)]


def tubo_camino(h, eje, camino, r, color, metal=False, tapa=None, n=28):
    """tubo que sigue un camino [(u, a, b)] (curva suave): segmentos oblicuos sin costura"""
    p = _circ(r, n)
    for i in range(len(camino) - 1):
        (u0, a0, b0), (u1, a1, b1) = camino[i], camino[i + 1]
        ult = i == len(camino) - 2
        h.solido(eje, u0, u1, p, p, a0, b0, color, tapa if ult else None, metal, borde=None, ca1=a1, cb1=b1)
    # silueta exterior aproximada: bordes superior e inferior


def pos_cond(n, rc, off=None):
    """posiciones (a, b) de n conductores de radio rc tocándose"""
    if n == 1: return [(0, 0)]
    d = rc / math.sin(math.pi / n) if n > 2 else rc
    off = {2: 0, 3: 90, 4: 45}.get(n, 0) if off is None else off
    return [(d * math.cos(math.radians(off + 360 * i / n)), d * math.sin(math.radians(off + 360 * i / n))) for i in range(n)]


def cable3d(h, R, conds, r_cu, e_ais, L_vaina=70, L_rel=6, L_ais=(34, 8), L_cu=13, abrir=1.8, al=False, hilos=7,
            vaina_col=C_VAINA, rel_col=C_REL, texto=None, radios=None, pos=None, relleno=True):
    """cable en 3D a lo largo de x, con la punta pelada en escalones: vaina → relleno → conductores (abiertos) → cobre.
    L_ais = (largo base, incremento por conductor). radios = [(r_cu, e_ais)] por conductor (para el neutro reducido).
    Devuelve dict con puntos útiles para globos."""
    n = len(conds); rc = r_cu + e_ais
    pos = pos or pos_cond(n, rc)
    radios = radios or [(r_cu, e_ais)] * n
    out = {}
    # vaina
    if vaina_col:
        h.cil("x", 0, L_vaina, 0, 0, R, vaina_col, tapa=sombra(vaina_col, 1.25), borde="#000", bw=.6)
        # relleno visto en la tapa
        if relleno:
            h.circ3("x", L_vaina + .02, 0, 0, R * .84, sombra(rel_col, .9), "#444", .35)
        if texto:
            x, y = h.P(L_vaina * .12, 0, R * 1.0)
            h.a(f'<text transform="matrix(.866 .5 0 1 {x:.1f} {y+3:.1f})" font-size="{max(7, R*h._s*.22):.1f}" font-weight="700" fill="#b9bdc2" {INT}>{esc(texto)}</text>')
        out["vaina"] = (L_vaina * .55, R * .6, R * .75)
    x0 = L_vaina
    if relleno and vaina_col and L_rel:
        h.cil("x", L_vaina, L_vaina + L_rel, 0, 0, R * .84, rel_col, tapa=sombra(rel_col, 1.15), borde="#333", bw=.4)
        out["relleno"] = (L_vaina + L_rel, R * .55, R * .55)
        x0 = L_vaina + L_rel
    orden = sorted(range(n), key=lambda i: pos[i][0] + pos[i][1])     # de atrás para adelante
    rank = {i: k for k, i in enumerate(sorted(range(n), key=lambda i: -(pos[i][0] + pos[i][1])))}  # el de adelante es el más corto
    for i in orden:
        a, b = pos[i]; rcu, eai = radios[i]; col = FASE.get(conds[i], conds[i])
        L = L_ais[0] + L_ais[1] * rank[i]
        cam = []
        for t in range(0, 13):
            f = t / 12; u = x0 + L * f
            s = 1 + (abrir - 1) * (min(1, f / .45) ** 1.5 if f < .45 else 1) if n > 1 else 1
            if f >= .45: s = abrir if n > 1 else 1
            cam.append((u, a * s, b * s))
        tubo_camino(h, "x", cam, rcu + eai, col, tapa=sombra(col, 1.3) if col != FASE["L2"] else "#4a4a4a")
        if conds[i] == "PE":   # franja amarilla
            for k in range(len(cam) - 1):
                (u0, a0, b0), (u1, a1, b1) = cam[k], cam[k + 1]
                h.solido("x", u0, u1, [(math.cos(t) * (rcu + eai) * 1.005, math.sin(t) * (rcu + eai) * 1.005) for t in [math.radians(30 + 12 * q) for q in range(6)]],
                         [(math.cos(t) * (rcu + eai) * 1.005, math.sin(t) * (rcu + eai) * 1.005) for t in [math.radians(30 + 12 * q) for q in range(6)]],
                         a0, b0, "#f2c200", None, False, borde=None, ca1=a1, cb1=b1)
        ue = x0 + L; ae, be = cam[-1][1], cam[-1][2]
        cu = C_AL if al else C_CU
        h.cil("x", ue, ue + L_cu, ae, be, rcu, cu, tapa=None, metal=True, borde="#5a2c0c" if not al else "#555", bw=.4)
        h.helice("x", ue, ue + L_cu, ae, be, rcu, 6, rcu * 7, "#7a3f12" if not al else "#6b7177", .45)
        h.cuerda_tapa("x", ue + L_cu, ae, be, rcu, hilos, col="#f0b06a" if not al else "#e3e6e9", st="#6a3510" if not al else "#555")
        out.setdefault("ais", []).append((x0 + L * .8, ae, be + rcu + eai))
        out.setdefault("cu", []).append((ue + L_cu * .6, ae, be + rcu))
        out.setdefault("ais_i", {})[conds[i] + str(i)] = (x0 + L * .8, ae, be + rcu + eai)
    return out


def cable_lateral(h, x0, ycen, k, R, conds, rc, L_vaina, L_rel, L_ais, L_cu, abrir=2.2, rcu=None, corteAA=None, vaina=True):
    """vista lateral (blanco y negro) de la punta pelada: vaina, relleno, conductores abiertos y cobre (mm → px con k)"""
    n = len(conds); X = lambda mm: x0 + mm * k
    if vaina:
        # quiebre a la izquierda
        h.path(f"M{X(0)},{ycen-R*k} L{X(L_vaina)},{ycen-R*k} L{X(L_vaina)},{ycen+R*k} L{X(0)},{ycen+R*k}", "#fff", K, 1.4)
        h.path(f"M{X(0)},{ycen-R*k} q-6,{R*k*.5} 0,{R*k} t0,{R*k}", "none", K, .9)
        # oculta: relleno y conductores dentro
        h.ln(X(0) + 4, ycen - R * .84 * k, X(L_vaina), ycen - R * .84 * k, K, .5, h.OCULTA)
        h.ln(X(0) + 4, ycen + R * .84 * k, X(L_vaina), ycen + R * .84 * k, K, .5, h.OCULTA)
        h.ln(X(0) - 12, ycen, X(L_vaina + L_rel + max(L_ais) + L_cu) + 14, ycen, K, .5, h.EJE)
        if L_rel:
            h.rect(X(L_vaina), ycen - R * .84 * k, L_rel * k, 2 * R * .84 * k, "url(#ANSI37)", K, .9)
    xa = X(L_vaina + L_rel)
    # conductores abiertos en abanico (lateral): alturas repartidas
    zs = [((i - (n - 1) / 2) * rc * abrir * 1.15) for i in range(n)]
    pts = []
    for i in range(n):
        z = zs[i]; L = L_ais[i]; rcu_ = rcu or rc * .6
        y = ycen + z * k
        y0 = ycen + z * k * .25
        # tramo curvo + recto
        h.path(f"M{xa},{y0-rc*k:.1f} C{xa+6*k},{y0-rc*k:.1f} {xa+4*k},{y-rc*k:.1f} {xa+10*k},{y-rc*k:.1f} L{X(L_vaina+L_rel+L)},{y-rc*k:.1f} L{X(L_vaina+L_rel+L)},{y+rc*k:.1f} L{xa+10*k},{y+rc*k:.1f} C{xa+4*k},{y+rc*k:.1f} {xa+6*k},{y0+rc*k:.1f} {xa},{y0+rc*k:.1f}", "#fff", K, 1.0)
        xc = X(L_vaina + L_rel + L)
        h.rect(xc, y - rcu_ * k, L_cu * k, 2 * rcu_ * k, "url(#cuH)", K, .8)
        for q in range(1, 6):   # hilos de la cuerda (líneas oblicuas)
            xx = xc + q * L_cu * k / 6
            h.ln(xx - 3, y + rcu_ * k, xx + 3, y - rcu_ * k, K, .35)
        pts.append((xc, y))
    if corteAA is not None and vaina:
        xs = X(corteAA)
        for yy, d in ((ycen - R * k - 18, -1), (ycen + R * k + 18, 1)):
            h.ln(xs, yy, xs, yy - d * 10, K, 1.6)
        h.ln(xs, ycen - R * k - 8, xs, ycen + R * k + 8, K, .6, h.EJE)
        h.path(f"M{xs},{ycen-R*k-18} h-12 l4,-3 m-4,3 l4,3", "none", K, 1)
        h.path(f"M{xs},{ycen+R*k+18} h-12 l4,-3 m-4,3 l4,3", "none", K, 1)
        h.txt(xs - 16, ycen - R * k - 22, "A", 12, 700, K, "end"); h.txt(xs - 16, ycen + R * k + 30, "A", 12, 700, K, "end")
    return pts


def haz3d(h, cores, L, paso, u_fin=None, L_cu=None, n_seg=None, hilos=7, al=True):
    """haz retorcido a lo largo de x. cores = [(color, r_ext, r_cond, d (radio de colocación), fase0)].
    u_fin = largo de cada conductor (aislado) y L_cu = largo pelado. Todos los segmentos se ordenan por profundidad."""
    n_seg = n_seg or int(L / paso * 28) + 10
    segs = []
    for ci, (col, r, rcu, d, f0) in enumerate(cores):
        uf = u_fin[ci] if u_fin else L
        N = max(4, int(n_seg * uf / L))
        pts = []
        for i in range(N + 1):
            u = uf * i / N; th = f0 + 2 * math.pi * u / paso
            pts.append((u, d * math.cos(th), d * math.sin(th)))
        for i in range(N):
            (u0, a0, b0), (u1, a1, b1) = pts[i], pts[i + 1]
            prof = u0 + u1 + a0 + a1 + b0 + b1
            segs.append((prof / 2, ci, (u0, a0, b0), (u1, a1, b1), i == N - 1))
    segs.sort(key=lambda s: s[0])
    p = {}
    for ci, (col, r, rcu, d, f0) in enumerate(cores): p[ci] = _circ(r, 24)
    fin = {}
    for prof, ci, A, B, ult in segs:
        col, r, rcu, d, f0 = cores[ci]
        h.solido("x", A[0], B[0], p[ci], p[ci], A[1], A[2], col, sombra(col, 1.6) if ult and not L_cu else None, False, borde=None, ca1=B[1], cb1=B[2])
        if ult: fin[ci] = B
    out = {"fin": fin}
    if L_cu:
        for ci in sorted(fin, key=lambda c: fin[c][1] + fin[c][2]):
            col, r, rcu, d, f0 = cores[ci]; u, a, b = fin[ci]
            h.circ3("x", u, a, b, r, sombra(col, 1.5), "#000", .4)
            base = C_AL if al else C_CU
            h.cil("x", u, u + L_cu, a, b, rcu, base, metal=True, borde="#555", bw=.4)
            h.helice("x", u, u + L_cu, a, b, rcu, 6, rcu * 7, "#6b7177" if al else "#7a3f12", .45)
            h.cuerda_tapa("x", u + L_cu, a, b, rcu, hilos, col="#e3e6e9" if al else "#f0b06a", st="#555" if al else "#6a3510")
    return out


def haz_lateral(h, x0, yc, k, L, paso, cores, cortes=None):
    """vista lateral B/N de un haz retorcido: cada conductor como banda sinusoidal (de atrás para adelante)"""
    N = 160; segs = []
    for ci, (col, r, rcu, d, f0) in enumerate(cores):
        for i in range(N):
            u0 = L * i / N; u1 = L * (i + 1) / N
            th0 = f0 + 2 * math.pi * u0 / paso; th1 = f0 + 2 * math.pi * u1 / paso
            segs.append((d * math.sin((th0 + th1) / 2), ci, u0, u1, d * math.cos(th0), d * math.cos(th1)))
    segs.sort(key=lambda s: s[0])
    for z, ci, u0, u1, y0, y1 in segs:
        r = cores[ci][1]
        X0, X1 = x0 + u0 * k, x0 + u1 * k
        h.a(f'<polygon points="{X0:.1f},{yc+(y0-r)*k:.1f} {X1+.6:.1f},{yc+(y1-r)*k:.1f} {X1+.6:.1f},{yc+(y1+r)*k:.1f} {X0:.1f},{yc+(y0+r)*k:.1f}" fill="#fff" stroke="none"/>')
        h.ln(X0, yc + (y0 - r) * k, X1, yc + (y1 - r) * k, K, .9); h.ln(X0, yc + (y0 + r) * k, X1, yc + (y1 + r) * k, K, .9)
