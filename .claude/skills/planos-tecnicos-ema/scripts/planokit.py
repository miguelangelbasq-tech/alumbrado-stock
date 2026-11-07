"""planokit · kit de dibujo de los planos técnicos de EMA (estilo «AutoCAD a la izquierda + 3D en corte a la derecha»).
Uso:  from planokit import Hoja
      h = Hoja(W=1680, H=1188); ... h.guardar("hoja.svg")
Todo es SVG a mano: sin librerías, anda sin señal, se ve nítido con zoom y se imprime en A3/A4.
Unidades: el plano se dibuja en px de hoja; cada vista tiene su escala k (px por mm). Las cotas se escriben en mm."""
import math
K = "#111"; G = "#555"; OR = "#c2410c"; NV = "#1d2160"
CAD = 'font-family="Arial Narrow,Roboto Condensed,Arial,sans-serif"'
MONO = 'font-family="JetBrains Mono,monospace"'
INT = 'font-family="Inter,Arial"'
# colores de fase (AEA 90364): L1 marrón · L2 negro · L3 rojo · N celeste
CORES = [("#7b3f1d", "L1 MARRON"), ("#1a1a1a", "L2 NEGRO"), ("#c62828", "L3 ROJO"), ("#4fa3d9", "N CELESTE")]
DEFS = '''<defs>
<pattern id="EARTH" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff"/><path d="M1,3 H7 M1,5 H7 M1,7 H7 M10,9 V15 M12,9 V15 M14,9 V15" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="SAND" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#fff"/><circle cx="2" cy="2" r=".55" fill="#111"/><circle cx="6.5" cy="4" r=".45" fill="#111"/><circle cx="3.5" cy="7.2" r=".5" fill="#111"/></pattern>
<pattern id="ANSI31" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><line x1="0" y1="0" x2="0" y2="7" stroke="#111" stroke-width=".55"/></pattern>
<pattern id="ANSI37" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#fff"/><path d="M0,0 V9 M0,0 H9" stroke="#111" stroke-width=".35"/></pattern>
<pattern id="CONC" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#fff"/><path d="M2,3 l2,-1.5 l1,2 z M9,8 l2.5,1 l-1.5,2 z" fill="none" stroke="#111" stroke-width=".5"/><circle cx="6" cy="11" r=".6" fill="#111"/><circle cx="11" cy="3" r=".5" fill="#111"/></pattern>
<pattern id="CONCP" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#fff"/><circle cx="3" cy="4" r=".7" fill="#111"/><circle cx="10" cy="9" r=".6" fill="#111"/><path d="M7,2 l1.5,-1 l.5,1.5 z" fill="none" stroke="#111" stroke-width=".45"/></pattern>
<pattern id="FOAM" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><path d="M0,4 q2,-3 4,0 t4,0" fill="none" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="cuH" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#fff"/><line x1="0" y1="0" x2="0" y2="3" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="mesh" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#f97316" fill-opacity=".25"/><path d="M0,0 L10,10 M10,0 L0,10" stroke="#ea580c" stroke-width="1.2"/></pattern>
<pattern id="grass" width="10" height="6" patternUnits="userSpaceOnUse"><rect width="10" height="6" fill="#86b95c"/><path d="M2,6 L3,1 M6,6 L7,2" stroke="#4d7c2b" stroke-width=".8"/></pattern>
<pattern id="soil3" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#c9a77c"/><circle cx="3" cy="4" r="1.1" fill="#9c7a52"/><circle cx="10" cy="9" r="1.4" fill="#a8865c"/><circle cx="6" cy="12" r=".8" fill="#8a6a43"/></pattern>
<pattern id="sand3" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f2dc97"/><circle cx="2" cy="2" r=".8" fill="#c9a654"/><circle cx="6" cy="5" r=".7" fill="#b8954a"/></pattern>
<pattern id="conc3" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#b9bdc2"/><circle cx="3" cy="3" r="1" fill="#8f949a"/><circle cx="9" cy="8" r="1.3" fill="#9da2a8"/><circle cx="5" cy="10" r=".6" fill="#7d8288"/></pattern>
<pattern id="concP3" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#cfcabf"/><circle cx="3" cy="3" r="1" fill="#a9a395"/><circle cx="9" cy="8" r="1.1" fill="#b3ad9f"/></pattern>
<pattern id="asph3" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#4b4b4b"/><circle cx="3" cy="3" r=".9" fill="#6a6a6a"/><circle cx="8" cy="7" r=".8" fill="#5c5c5c"/></pattern>
<linearGradient id="cyl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#555"/><stop offset=".35" stop-color="#2a2a2a"/><stop offset="1" stop-color="#0d0d0d"/></linearGradient>
<linearGradient id="pvc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f4f6"/><stop offset=".5" stop-color="#cfd3d8"/><stop offset="1" stop-color="#9aa0a6"/></linearGradient>
<linearGradient id="prfv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d949b"/><stop offset=".4" stop-color="#d7dbe0"/><stop offset="1" stop-color="#7d848b"/></linearGradient>
</defs>'''

class Hoja:
    def __init__(self, W=1680, H=1188, divisor=860):
        self.W, self.H, self.o = W, H, []
        a = self.a
        a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">')
        a(DEFS); a(f'<rect width="{W}" height="{H}" fill="#fff"/>')
        self.rect(14, 14, W - 28, H - 28, "none", K, 1.8); self.rect(22, 22, W - 44, H - 44, "none", K, .5)
        if divisor: self.ln(divisor, 22, divisor, H - 22, K, .5)
    # --- primitivas
    def a(self, s): self.o.append(s)
    def txt(self, x, y, s, sz=12, w=400, c=K, anc="start", fam=CAD, rot=None):
        tr = f' transform="rotate({rot} {x:.1f} {y:.1f})"' if rot is not None else ""
        self.a(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{sz}" font-weight="{w}" fill="{c}" text-anchor="{anc}" {fam}{tr}>{s}</text>')
    def ln(self, x1, y1, x2, y2, c=K, w=.8, d=""): self.a(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}" {d}/>')
    def rect(self, x, y, w, h, fill="none", st=K, sw=.8, extra=""): self.a(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{st}" stroke-width="{sw}" {extra}/>')
    def circ(self, x, y, r, fill="none", st=K, sw=.8, extra=""): self.a(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}" fill="{fill}" stroke="{st}" stroke-width="{sw}" {extra}/>')
    def path(self, d, fill="none", st=K, sw=.8, extra=""): self.a(f'<path d="{d}" fill="{fill}" stroke="{st}" stroke-width="{sw}" {extra}/>')
    EJE = 'stroke-dasharray="14 3 2 3"'; OCULTA = 'stroke-dasharray="5 3"'; MALLA = 'stroke-dasharray="7 2 1.5 2"'
    # --- cotas con trazo oblicuo (dibujo de construcción)
    def tick(self, x, y): self.ln(x - 4, y + 4, x + 4, y - 4, K, 1.2)
    def dimV(self, x, y1, y2, t, ext=None, c=K):
        if ext is not None:
            for y in (y1, y2): self.ln(ext, y, x + 5 if ext < x else x - 5, y, K, .4)
        self.ln(x, y1 - 4, x, y2 + 4, K, .6); self.tick(x, y1); self.tick(x, y2); self.txt(x - 4, (y1 + y2) / 2, t, 11, 400, c, "middle", CAD, -90)
    def dimH(self, y, x1, x2, t, ext=None, c=K, dy=-4):
        if ext is not None:
            for x in (x1, x2): self.ln(x, ext, x, y - 5 if ext > y else y + 5, K, .4)
        self.ln(x1 - 4, y, x2 + 4, y, K, .6); self.tick(x1, y); self.tick(x2, y); self.txt((x1 + x2) / 2, y + dy, t, 11, 400, c, "middle")
    def nivel(self, x, y, t): self.path(f"M{x},{y-2} l6,-9 h-12 z", "none", K, .8); self.txt(x + 10, y - 5, t, 10.5)
    def globo(self, n, ax, ay, gx, gy, c=K, r=10):
        self.ln(ax, ay, gx, gy, c, .6); self.circ(ax, ay, 1.8, c, c, 0); self.circ(gx, gy, r, "#fff", c, 1); self.txt(gx, gy + 4, n, 11, 700, c, "middle")
    def titulo(self, x, y, t, sub):
        self.txt(x, y, t, 15, 700, K); self.ln(x, y + 4, x + len(t) * 7.6, y + 4, K, 1.2); self.txt(x, y + 19, sub, 10.5, 400, G)
    def llamadaDet(self, cx, cy, r, nombre):
        self.circ(cx, cy, r, "none", K, .7, 'stroke-dasharray="3 2"'); self.txt(cx - r - 4, cy - r + 4, nombre, 10.5, 700, K, "end")
    # --- cable en corte: cubierta, relleno, 4 conductores con color de fase y cuerda de hilos
    def cable(self, cx, cy, r, color=False, hilos=False, nucleos=4):
        self.circ(cx, cy, r, "#2a2a2a" if color else "#fff", K, .9); self.circ(cx, cy, r * .86, "#c8c8c8" if color else "#fff", K, .4)
        rc, d = r * .36, r * .42
        for i, (col, _) in enumerate(CORES[:nucleos]):
            ang = math.radians(45 + 90 * i); x = cx + d * math.cos(ang); y = cy - d * math.sin(ang)
            self.circ(x, y, rc, col if color else "#fff", K, .5); rcu = rc * .66; self.circ(x, y, rcu, "#d08a3f" if color else "url(#cuH)", K, .3)
            if hilos:
                rh = rcu / 3
                for px, py in [(0, 0)] + [(2 * rh * math.cos(math.radians(60 * j)), 2 * rh * math.sin(math.radians(60 * j))) for j in range(6)]:
                    self.circ(x + px, y + py, rh * .95, "#e7a35a", "#7a4512", .35)
    def cano(self, cx, cy, rext, rint, fill="#fff"):   # caño en corte (pared rayada)
        self.circ(cx, cy, rext, "url(#ANSI31)", K, .9); self.circ(cx, cy, rint, fill, K, .7)
    # --- tablas
    def tabla(self, x, y, cols, filas, rowh=21, titulo=None, colores=None):
        """cols = [(ancho, alineación 'l'|'c', mono)]; filas[0] = encabezado. colores: función(fila_i, col_i, texto) → color"""
        if titulo: self.txt(x, y, titulo, 13, 700); self.ln(x, y + 4, x + len(titulo) * 7.2, y + 4, K, 1); y += 14
        tw = sum(c[0] for c in cols)
        for i, fila in enumerate(filas):
            yy = y + i * rowh; self.rect(x, yy, tw, rowh, "#fff", K, .5); xx = x
            for j, ((cw, al, mono), t) in enumerate(zip(cols, fila)):
                if j: self.ln(xx, yy, xx, yy + rowh, K, .5)
                col = colores(i, j, t) if colores else K
                if al == "c": self.txt(xx + cw / 2, yy + rowh - 6, t, 11, 700 if i == 0 else 400, col, "middle", MONO if (mono and i) else CAD)
                else: self.txt(xx + 6, yy + rowh - 6, t, 11, 700 if i == 0 else 400, col, "start", MONO if (mono and i) else CAD)
                xx += cw
        return y + len(filas) * rowh
    def notas(self, x, y, lineas):
        self.txt(x, y, "NOTAS", 13, 700); self.ln(x, y + 4, x + 52, y + 4, K, 1)
        for i, n in enumerate(lineas):
            c = OR if "(*)" in n else K
            self.txt(x, y + 22 + i * 19, f"{i+1}. {n}", 11, 400, c)
    def rayados(self, x, y, items, malla=False, cols=2, dx=150):
        self.txt(x, y, "RAYADOS", 13, 700); self.ln(x, y + 4, x + 70, y + 4, K, 1)
        for i, (pid, t) in enumerate(items):
            xx = x + (i % cols) * dx; yy = y + 16 + (i // cols) * 26; self.rect(xx, yy, 30, 18, f"url(#{pid})", K, .6); self.txt(xx + 38, yy + 13, t, 10.5)
        if malla:
            yy = y + 16 + ((len(items) + cols - 1) // cols) * 26 + 8; self.ln(x, yy, x + 30, yy, K, 1.6, self.MALLA); self.txt(x + 38, yy + 4, "MALLA DE ADVERTENCIA", 10.5)
    def rotulo(self, x, y, w, plano, titulo1, titulo2, sub, escalas, escalas2, rev="A", fecha="", hoja="1 DE 1", proyecto="ALUMBRADO DE PLAZAS"):
        h = 120; self.rect(x, y, w, h, "#fff", K, 1.6)
        for xx in (x + 170, x + w - 230, x + w - 110): self.ln(xx, y, xx, y + h, K, .8)
        self.ln(x, y + 60, x + 170, y + 60, K, .6); self.ln(x + w - 230, y + 60, x + w, y + 60, K, .6)
        self.txt(x + 8, y + 16, "PLANO TIPO", 9.5, 400, G); self.txt(x + 85, y + 46, plano, 19, 700, K, "middle", MONO)
        self.txt(x + 8, y + 76, "PROYECTO", 9.5, 400, G); self.txt(x + 8, y + 100, proyecto, 12, 700)
        self.txt(x + 180, y + 16, "TITULO", 9.5, 400, G); self.txt(x + 180, y + 52, titulo1, 21, 700); self.txt(x + 180, y + 80, titulo2, 21, 700); self.txt(x + 180, y + 104, sub, 11, 400, G)
        e = x + w - 222; self.txt(e, y + 16, "ESCALAS", 9.5, 400, G); self.txt(e, y + 36, escalas, 12, 700, K, "start", MONO); self.txt(e, y + 52, escalas2, 10.5, 400)
        self.txt(e, y + 76, "UNIDADES", 9.5, 400, G); self.txt(e, y + 100, "mm", 13, 700, K, "start", MONO)
        r = x + w - 102; self.txt(r, y + 16, "REV.", 9.5, 400, G); self.txt(r, y + 40, rev, 14, 700, K, "start", MONO)
        self.txt(r, y + 76, "FECHA / HOJA", 9.5, 400, G); self.txt(r, y + 96, fecha, 11, 700, K, "start", MONO); self.txt(r, y + 112, hoja, 11, 700, K, "start", MONO)
    # --- 3D isométrico (x a la derecha-abajo, y a la izquierda-abajo, z arriba). Se ven las caras +x, +y y la de arriba.
    def iso(self, s, ox, oy): self._s, self._ox, self._oy = s, ox, oy
    def P(self, x, y, z):
        c = math.cos(math.radians(30)); return (self._ox + self._s * (x * c - y * c), self._oy + self._s * (.5 * x + .5 * y) - self._s * z)
    def F3(self, pts, fill, st="#3a2a1a", sw=.8, op=1, extra=""):
        self.a('<polygon points="' + " ".join(f"{self.P(*p)[0]:.1f},{self.P(*p)[1]:.1f}" for p in pts) + f'" fill="{fill}" fill-opacity="{op}" stroke="{st}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>')
    def BOX(self, x0, x1, y0, y1, z0, z1, top, side, end, st="#3a2a1a", sw=.8, op=1):
        self.F3([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], top, st, sw, op)
        self.F3([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], side, st, sw, op)
        self.F3([(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)], end, st, sw, op)
    def circX(self, x, yc, zc, r, n=36): return [(x, yc + r * math.cos(2 * math.pi * i / n), zc + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
    def circZ(self, z, xc, yc, r, n=40): return [(xc + r * math.cos(2 * math.pi * i / n), yc + r * math.sin(2 * math.pi * i / n), z) for i in range(n)]
    def poly3(self, pts, fill, st="#000", sw=.5, op=1): self.F3(pts, fill, st, sw, op)
    def tuboX(self, x0, x1, yc, zc, r, fill="url(#cyl)", st="#000"):
        """cilindro a lo largo de x: silueta + tapa en x1"""
        t = [self.P(x, yc - r * .5, zc + r * .9) for x in (x0, x1)]; b = [self.P(x, yc + r * .9, zc - r * .6) for x in (x1, x0)]
        self.a(f'<polygon points="{t[0][0]:.1f},{t[0][1]:.1f} {t[1][0]:.1f},{t[1][1]:.1f} {b[0][0]:.1f},{b[0][1]:.1f} {b[1][0]:.1f},{b[1][1]:.1f}" fill="{fill}" stroke="{st}" stroke-width=".6"/>')
    def tuboZ(self, z0, z1, xc, yc, r0, r1, fill="url(#prfv)", st="#333"):
        """cilindro/cono vertical: silueta + tapa arriba"""
        c = math.cos(math.radians(30)); w0 = r0 * self._s * 1.0; w1 = r1 * self._s * 1.0
        p0 = self.P(xc, yc, z0); p1 = self.P(xc, yc, z1)
        self.a(f'<polygon points="{p0[0]-w0:.1f},{p0[1]:.1f} {p1[0]-w1:.1f},{p1[1]:.1f} {p1[0]+w1:.1f},{p1[1]:.1f} {p0[0]+w0:.1f},{p0[1]:.1f}" fill="{fill}" stroke="{st}" stroke-width=".7"/>')
        self.a(f'<ellipse cx="{p0[0]:.1f}" cy="{p0[1]:.1f}" rx="{w0:.1f}" ry="{w0*.5:.1f}" fill="{fill}" stroke="{st}" stroke-width=".7"/>')
        self.a(f'<ellipse cx="{p1[0]:.1f}" cy="{p1[1]:.1f}" rx="{w1:.1f}" ry="{w1*.5:.1f}" fill="#d7dbe0" stroke="{st}" stroke-width=".7"/>')
    def g3(self, n, p, gx, gy, texto, c=NV):
        x, y = self.P(*p); self.globo(n, x, y, gx, gy, c, 12); self.txt(gx + 18, gy + 4, texto, 11, 700, c)
    def guardar(self, ruta):
        self.a('</svg>'); open(ruta, "w").write("\n".join(self.o))
