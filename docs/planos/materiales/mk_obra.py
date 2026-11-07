"""mk_obra · ayudas para las hojas de material de obra civil (caños, cámaras, áridos, mampostería, sellado,
reposición, fijación). Se apoya en mk_cab/planokit (no los modifica)."""
import math, os
from mk_cab import *
from mk_cab import _circ
from mk_cab import _circ

AQUI = os.path.dirname(os.path.abspath(__file__))
C30 = math.cos(math.radians(30))

# colores reales (3D)
C_PVC = "#dfe2e5"; C_PVC_IN = "#8d949b"; C_PEAD = "#1f2124"; C_CORR = "#3d4249"
C_BRONCE = "#c9973f"; C_LAD = "#c9653d"; C_CEM = "#d8c69e"; C_ARENA = "#e8cf8a"; C_PIEDRA = "#9ea3aa"
C_HIERRO = "#6e655e"; C_GALV = "#b8c2ca"; C_TELG = "#f7f7f2"; C_MALLA = "#d93a2b"; C_NYLON_N = "#232528"; C_NYLON_B = "#ece8dc"

EXTRA = '''<defs>
<pattern id="arenaT" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#e8cf8a"/><circle cx="1.5" cy="1.8" r=".7" fill="#b8954a"/><circle cx="5" cy="4.5" r=".6" fill="#c9a654"/><circle cx="3" cy="6" r=".45" fill="#a88440"/></pattern>
<pattern id="piedraT" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#8f949b"/><path d="M1,3 l4,-2 l3,2 l-1,4 l-5,0 z" fill="#b4b9bf" stroke="#6b7076" stroke-width=".4"/><path d="M9,8 l5,-1 l1,4 l-4,3 l-3,-2 z" fill="#a7acb2" stroke="#6b7076" stroke-width=".4"/><path d="M2,10 l3,1 l0,4 l-3,0 z" fill="#c2c6cb" stroke="#6b7076" stroke-width=".4"/></pattern>
<pattern id="cemT" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#bfc2c4"/><circle cx="2" cy="2" r=".35" fill="#9fa3a6"/></pattern>
<pattern id="calT" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#f4f3ee"/><circle cx="2" cy="3" r=".35" fill="#d9d7cf"/></pattern>
<pattern id="concT" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#b9bdc2"/><circle cx="3" cy="3" r="1" fill="#8f949a"/><circle cx="9" cy="8" r="1.3" fill="#9da2a8"/><circle cx="5" cy="10" r=".6" fill="#7d8288"/></pattern>
<pattern id="concPT" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#cfcabf"/><circle cx="3" cy="3" r="1" fill="#a9a395"/><circle cx="9" cy="8" r="1.1" fill="#b3ad9f"/></pattern>
<pattern id="morT" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#a9a59c"/><circle cx="2" cy="2" r=".5" fill="#8c887f"/><circle cx="4.5" cy="4.6" r=".4" fill="#c3bfb5"/></pattern>
<pattern id="ladT" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="none"/><circle cx="2" cy="3" r=".7" fill="#7a3418" opacity=".55"/><circle cx="7" cy="7" r=".9" fill="#e59b77" opacity=".6"/></pattern>
<pattern id="telgT" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fbfbf7"/><circle cx="2.2" cy="2.2" r="1.9" fill="none" stroke="#d6d6c8" stroke-width=".5"/><circle cx="6.2" cy="6" r="2" fill="none" stroke="#d6d6c8" stroke-width=".5"/></pattern>
<pattern id="baldT" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#cfc6b4"/><circle cx="5" cy="5" r="1.6" fill="#b9af9b"/><circle cx="15" cy="5" r="1.6" fill="#b9af9b"/><circle cx="5" cy="15" r="1.6" fill="#b9af9b"/><circle cx="15" cy="15" r="1.6" fill="#b9af9b"/></pattern>
<pattern id="asfT" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#3f4042"/><circle cx="3" cy="3" r=".9" fill="#67686b"/><circle cx="8" cy="7" r=".8" fill="#55575a"/><circle cx="6" cy="1" r=".5" fill="#77797c"/></pattern>
<pattern id="soilT" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#c9a77c"/><circle cx="3" cy="4" r="1.1" fill="#9c7a52"/><circle cx="10" cy="9" r="1.4" fill="#a8865c"/><circle cx="6" cy="12" r=".8" fill="#8a6a43"/></pattern>
<pattern id="maderaT" width="40" height="6" patternUnits="userSpaceOnUse"><rect width="40" height="6" fill="#b07a45"/><path d="M0,2 q10,-1.5 20,0 t20,0 M0,4.6 q12,1 24,0 t16,0" stroke="#8a5a2c" stroke-width=".5" fill="none"/></pattern>
<pattern id="papelT" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#d8c69e"/><path d="M0,3 H6" stroke="#c4b186" stroke-width=".4"/></pattern>
<pattern id="RAMA" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#fff"/><circle cx="2.5" cy="2.5" r=".9" fill="none" stroke="#111" stroke-width=".5"/><circle cx="7.5" cy="7.5" r="1.4" fill="none" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="WOOD" width="22" height="8" patternUnits="userSpaceOnUse"><rect width="22" height="8" fill="#fff"/><path d="M0,3 q6,-2 11,0 t11,0 M0,6.5 q7,1.5 14,0 t8,0" stroke="#111" stroke-width=".45" fill="none"/></pattern>
<pattern id="ASPH" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#fff"/><circle cx="2" cy="2" r="1" fill="#111"/><circle cx="7" cy="6" r=".8" fill="#111"/><circle cx="4" cy="8.5" r=".5" fill="#111"/></pattern>
</defs>'''


class HojaO(HojaMat):
    def __init__(self):
        super().__init__(); self.a(EXTRA)

    # ---- caja 3D con 3 caras visibles sombreadas y textura opcional
    def caja(self, x0, x1, y0, y1, z0, z1, col, pat=None, borde="#333", bw=.6, op=1, patop=.8):
        t, sy, sx = sombra(col, 1.06), sombra(col, .82), sombra(col, .64)
        caras = [[(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], [(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)],
                 [(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)]]
        for q, c in zip(caras, (t, sy, sx)):
            self.F3(q, c, borde, bw, op)
            if pat: self.F3(q, f"url(#{pat})", "none", 0, patop)
        # re-sombra suave encima de la textura
        if pat:
            self.F3(caras[1], "#000", "none", 0, .1); self.F3(caras[2], "#000", "none", 0, .22)
            for q in caras: self.F3(q, "none", borde, bw)

    def txtY(self, x, y, z, s, sz=9, w=700, c=NV, anc="middle", fam=INT):
        """texto pegado a la cara +y (lee a lo largo de x)"""
        X, Y = self.P(x, y, z)
        self.a(f'<text transform="matrix({C30:.4f},0.5,0,1,{X:.1f},{Y:.1f})" font-size="{sz}" font-weight="{w}" fill="{c}" text-anchor="{anc}" {fam}>{esc(s)}</text>')

    def txtX(self, x, y, z, s, sz=9, w=700, c=NV, anc="middle", fam=INT):
        """texto pegado a la cara +x (lee a lo largo de -y)"""
        X, Y = self.P(x, y, z)
        self.a(f'<text transform="matrix({C30:.4f},-0.5,0,1,{X:.1f},{Y:.1f})" font-size="{sz}" font-weight="{w}" fill="{c}" text-anchor="{anc}" {fam}>{esc(s)}</text>')

    def txtZ(self, x, y, z, s, sz=9, w=700, c=NV, anc="middle", fam=INT):
        """texto acostado sobre la cara de arriba (lee a lo largo de x)"""
        X, Y = self.P(x, y, z)
        self.a(f'<text transform="matrix({C30:.4f},0.5,{-C30:.4f},0.5,{X:.1f},{Y:.1f})" font-size="{sz}" font-weight="{w}" fill="{c}" text-anchor="{anc}" {fam}>{esc(s)}</text>')

    # ---- caño con pared visible en la punta
    def cano3(self, eje, u0, u1, ca, cb, R, e, col, inner=C_PVC_IN, metal=False, n=44, borde="#555"):
        self.cil(eje, u0, u1, ca, cb, R, col, tapa=sombra(col, 1.1), metal=metal, n=n, borde=borde, bw=.5, agujero=(R - e, inner))

    # ---- montón cónico de árido, con granos
    def monton(self, xc, yc, R, H, pat, col, granos=None, semilla=1):
        n = 40
        pts = [(xc + R * math.cos(2 * math.pi * k / n), yc + R * math.sin(2 * math.pi * k / n), 0) for k in range(n)]
        top = (xc, yc, H)
        # caras visibles (normal con componente hacia el observador)
        for k in range(n):
            a, b = pts[k], pts[(k + 1) % n]
            mx = (a[0] + b[0]) / 2 - xc; my = (a[1] + b[1]) / 2 - yc
            vis = mx + my > -R * .2
            if not vis: continue
            nn = [mx * H, my * H, R * R]; m = math.sqrt(sum(v * v for v in nn)); nn = [v / m for v in nn]
            L = (-.35, .45, .82); f = .55 + .55 * max(0, sum(nn[i] * L[i] for i in range(3)))
            self.F3([a, b, top], sombra(col, min(f, 1.08)), sombra(col, min(f, 1.08)), .5)
        self.F3([p for p in pts] , "none", "none", 0)
        # textura encima (silueta del cono)
        sil = [self.P(*p) for p in pts] + [self.P(*top)]
        hull = _hull_pts(sil)
        self.a('<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in hull) + f'" fill="url(#{pat})" opacity=".55" stroke="#555" stroke-width=".6"/>')
        if granos:
            import random
            rnd = random.Random(semilla)
            for _ in range(granos[0]):
                t = rnd.random() ** .7; ang = rnd.uniform(-.35, 1.85) * math.pi / 2 + math.pi * 0.0
                ang = rnd.uniform(-math.pi / 4 - .9, -math.pi / 4 + .9) + math.pi
                ang = rnd.uniform(-0.6, 2.2)
                r = R * t; z = H * (1 - t)
                x, y = self.P(xc + r * math.cos(ang), yc + r * math.sin(ang), z)
                rr = rnd.uniform(*granos[1])
                self.a(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{rr:.1f}" ry="{rr*.75:.1f}" fill="{rnd.choice(granos[2])}" stroke="#555" stroke-width=".3"/>')

    # ---- bolsa (paralelepípedo con bordes redondeados) con impreso en la cara +y
    def bolsa(self, x0, y0, z0, L, A, H, col, lineas, colTxt=NV, pat="papelT"):
        self.caja(x0, x0 + L, y0, y0 + A, z0, z0 + H, col, pat, "#7a6a48", .8, patop=.5)
        # costura / válvula
        self.F3([(x0 + L * .78, y0 + A, z0 + H * .82), (x0 + L * .95, y0 + A, z0 + H * .82), (x0 + L * .95, y0 + A, z0 + H * .95), (x0 + L * .78, y0 + A, z0 + H * .95)], "#b49a6a", "#7a6a48", .5)
        # etiqueta
        self.F3([(x0 + L * .1, y0 + A, z0 + H * .2), (x0 + L * .74, y0 + A, z0 + H * .2), (x0 + L * .74, y0 + A, z0 + H * .88), (x0 + L * .1, y0 + A, z0 + H * .88)], "#fbfaf6", "#9a8a68", .5)
        n = len(lineas)
        for i, (t, sz, w, c) in enumerate(lineas):
            self.txtY(x0 + L * .42, y0 + A, z0 + H * (.78 - i * (.52 / max(1, n - 1)) if n > 1 else .55), t, sz, w, c)

    def cota3(self, p0, p1, t, off=(0, 0, 0), c=K, sz=10, lado=1):
        """cota simple en 3D: línea entre p0+off y p1+off con ticks y texto en el medio"""
        a = self.P(*[p0[i] + off[i] for i in range(3)]); b = self.P(*[p1[i] + off[i] for i in range(3)])
        for p, q in ((p0, a), (p1, b)):
            pp = self.P(*p); self.ln(pp[0], pp[1], q[0], q[1], c, .35)
        self.ln(a[0], a[1], b[0], b[1], c, .6)
        for q in (a, b): self.ln(q[0] - 3.5, q[1] + 3.5, q[0] + 3.5, q[1] - 3.5, c, 1.1)
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        self.txt(mx + 6 * lado, my - 4, t, sz, 700, c, "start" if lado > 0 else "end", INT)


def _hull_pts(pts):
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


def guardar(h, nombre):
    h.guardar(os.path.join(AQUI, nombre + ".svg")); print("ok", nombre)


def barrido(h, pts, r, mat, n=32, w=(0, 1, 0), M3cls=None, edge=None):
    """tubo que sigue pts con anillos coherentes (marco fijo: w perpendicular al plano de la curva). Usa el motor M3 de matkit."""
    from matkit import M3
    m = M3(h); rings = []
    for i, p in enumerate(pts):
        a = pts[max(0, i - 1)]; b = pts[min(len(pts) - 1, i + 1)]
        t = [b[k] - a[k] for k in range(3)]; L = math.sqrt(sum(v * v for v in t)); t = [v / L for v in t]
        u = [t[1] * w[2] - t[2] * w[1], t[2] * w[0] - t[0] * w[2], t[0] * w[1] - t[1] * w[0]]
        rings.append([[p[k] + r * (math.cos(2 * math.pi * j / n) * u[k] + math.sin(2 * math.pi * j / n) * w[k]) for k in range(3)] for j in range(n)])
    for A, B in zip(rings[:-1], rings[1:]):
        for j in range(n): m.face([A[j], A[(j + 1) % n], B[(j + 1) % n], B[j]], mat, 0, edge)
    m.render()
