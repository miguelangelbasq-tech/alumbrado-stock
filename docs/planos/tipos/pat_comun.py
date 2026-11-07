"""Piezas de puesta a tierra para los planos AP-TC-005 / AP-TC-006 / AP-C-006 (usa planokit, no lo modifica)."""
import math
from planokit import K, G, OR, NV, CAD, MONO, INT

VERDE, AMAR = "#2f9e44", "#f2c200"
CU1, CU2, CUB = "#e7a35a", "#d08a3f", "#7a4512"
EXTRA = '''<defs>
<pattern id="VA" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="12" height="12" fill="#2f9e44"/><rect width="5" height="12" fill="#f2c200"/></pattern>
<pattern id="VAs" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="7" height="7" fill="#2f9e44"/><rect width="3" height="7" fill="#f2c200"/></pattern>
<linearGradient id="bronceV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d5718"/><stop offset=".4" stop-color="#f0cf7a"/><stop offset="1" stop-color="#8d6420"/></linearGradient>
<linearGradient id="cuV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a4d1d"/><stop offset=".45" stop-color="#f6c39a"/><stop offset="1" stop-color="#a5561f"/></linearGradient>
<linearGradient id="cuH2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c39a"/><stop offset=".5" stop-color="#d08a3f"/><stop offset="1" stop-color="#8a4a18"/></linearGradient>
<linearGradient id="acero" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b737c"/><stop offset=".4" stop-color="#dfe3e8"/><stop offset="1" stop-color="#5d646c"/></linearGradient>
<linearGradient id="aceroH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe3e8"/><stop offset=".5" stop-color="#9aa3ae"/><stop offset="1" stop-color="#5d646c"/></linearGradient>
<linearGradient id="estano" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f4f2"/><stop offset=".5" stop-color="#c9ccd0"/><stop offset="1" stop-color="#8f949a"/></linearGradient>
<pattern id="ROSCA" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#fff"/><line x1="0" y1="0" x2="4" y2="4" stroke="#111" stroke-width=".5"/></pattern>
</defs>'''


def defs(h):
    h.a(EXTRA)


def cuerda(h, cx, cy, r, color=True, n=7):
    """cuerda de hilos de Cu en corte (1 + 6)"""
    rh = r / 3
    pts = [(0, 0)] + [(2 * rh * math.cos(math.radians(60 * j + 30)), 2 * rh * math.sin(math.radians(60 * j + 30))) for j in range(6)]
    for px, py in pts[:n]:
        h.circ(cx + px, cy + py, rh * .97, CU1 if color else "#fff", CUB if color else K, .45 if color else .5)


def seccionVA(h, cx, cy, rext, rcu, color=True):
    """conductor unipolar verde-amarillo en corte: aislación + cuerda de Cu"""
    h.circ(cx, cy, rext, "url(#VA)" if color else "#fff", K, .9)
    h.circ(cx, cy, rcu, CU2 if color else "#fff", K, .5)
    cuerda(h, cx, cy, rcu, color)


def cableVA(h, d, w, color=True, extra=""):
    """cable unipolar visto de costado por un recorrido d (path)"""
    if color:
        h.path(d, "none", "#163d1c", w + 1.6, f'stroke-linecap="butt" stroke-linejoin="round" {extra}')
        h.path(d, "none", "url(#VA)", w, f'stroke-linecap="butt" stroke-linejoin="round" {extra}')
        h.path(d, "none", "#fff", w * .18, f'stroke-linecap="butt" opacity=".35" transform="translate(0,{-w*.22:.1f})" {extra}')
    else:
        h.path(d, "none", K, w + 1.4, f'stroke-linecap="butt" stroke-linejoin="round" {extra}')
        h.path(d, "none", "#fff", w - .4, f'stroke-linecap="butt" stroke-linejoin="round" {extra}')


def cuPelado(h, x0, y0, x1, y1, w, color=True, n=5):
    """punta pelada: hilos de Cu paralelos de (x0,y0) a (x1,y1), ancho w"""
    L = math.hypot(x1 - x0, y1 - y0); ux, uy = (x1 - x0) / L, (y1 - y0) / L; nx, ny = -uy, ux
    pts = f"{x0+nx*w/2:.1f},{y0+ny*w/2:.1f} {x1+nx*w/2:.1f},{y1+ny*w/2:.1f} {x1-nx*w/2:.1f},{y1-ny*w/2:.1f} {x0-nx*w/2:.1f},{y0-ny*w/2:.1f}"
    h.a(f'<polygon points="{pts}" fill="{CU2 if color else "#fff"}" stroke="{CUB if color else K}" stroke-width=".7"/>')
    for i in range(1, n):
        o = -w / 2 + i * w / n
        h.ln(x0 + nx * o, y0 + ny * o, x1 + nx * o, y1 + ny * o, "#8a4a18" if color else K, .45)


def hexCab(h, cx, cy, s, fill="url(#bronceV)", st=K, sw=.9, vista="frente"):
    """cabeza o tuerca hexagonal. vista 'frente' (de punta) o 'lado' (rectángulo con 3 caras)"""
    if vista == "frente":
        pts = " ".join(f"{cx+s*math.cos(math.radians(60*i)):.1f},{cy+s*math.sin(math.radians(60*i)):.1f}" for i in range(6))
        h.a(f'<polygon points="{pts}" fill="{fill}" stroke="{st}" stroke-width="{sw}"/>')
        h.circ(cx, cy, s * .82, "none", st, .4)


def rosca(h, x0, y0, x1, y1, r, paso=3, fill="#fff"):
    """varilla roscada horizontal o vertical en vista: contorno + líneas de rosca"""
    if abs(y1 - y0) < 1:  # horizontal
        h.rect(min(x0, x1), y0 - r, abs(x1 - x0), 2 * r, fill, K, .8)
        x = min(x0, x1) + 2
        while x < max(x0, x1) - 1:
            h.ln(x, y0 - r, x + paso * .6, y0 + r, K, .45); x += paso
    else:
        h.rect(x0 - r, min(y0, y1), 2 * r, abs(y1 - y0), fill, K, .8)
        y = min(y0, y1) + 2
        while y < max(y0, y1) - 1:
            h.ln(x0 - r, y, x0 + r, y + paso * .6, K, .45); y += paso


def jabalinaCAD(h, x, ytop, ybot, w, punta=None):
    """jabalina en vista (B/N): varilla con punta cónica"""
    p = punta if punta is not None else w * 1.6
    h.path(f"M{x-w/2:.1f},{ytop:.1f} V{ybot-p:.1f} L{x:.1f},{ybot:.1f} L{x+w/2:.1f},{ybot-p:.1f} V{ytop:.1f} Z", "#fff", K, 1.1)
    h.ln(x, ytop - 6, x, ybot + 6, K, .4, h.EJE)


def flecha(h, x1, y1, x2, y2, c=K, w=.8):
    h.ln(x1, y1, x2, y2, c, w)
    a = math.atan2(y2 - y1, x2 - x1)
    pts = f"{x2:.1f},{y2:.1f} {x2-8*math.cos(a-.35):.1f},{y2-8*math.sin(a-.35):.1f} {x2-8*math.cos(a+.35):.1f},{y2-8*math.sin(a+.35):.1f}"
    h.a(f'<polygon points="{pts}" fill="{c}"/>')


def corteMarca(h, x1, y1, x2, y2, letra, lado=1):
    """línea de corte con trazos gruesos en las puntas y la letra"""
    h.ln(x1, y1, x2, y2, K, .7, h.EJE)
    L = math.hypot(x2 - x1, y2 - y1); ux, uy = (x2 - x1) / L, (y2 - y1) / L
    for (px, py, s) in ((x1, y1, 1), (x2, y2, -1)):
        h.ln(px, py, px + ux * 14 * s, py + uy * 14 * s, K, 2.2)
        tx, ty = px - uy * 12 * lado, py + ux * 12 * lado
        h.txt(tx, ty + 5, letra, 13, 700, K, "middle")


def corteDoble(h, x, y, tam=10):
    """marca de rotura (zigzag) horizontal centrada en x"""
    h.path(f"M{x-tam*2.2:.1f},{y:.1f} h{tam*1.2:.1f} l{tam*.4:.1f},{-tam*.6:.1f} l{tam*.6:.1f},{tam*1.2:.1f} l{tam*.4:.1f},{-tam*.6:.1f} h{tam*1.2:.1f}", "none", K, .8)


def soldaduraSimbolo(h, x, y, largo=70, txt=""):
    """símbolo de soldadura en ángulo, todo alrededor (flecha a la junta en x,y)"""
    h.ln(x, y, x + 26, y - 26, K, .8)
    h.a(f'<polygon points="{x:.1f},{y:.1f} {x+7:.1f},{y-3:.1f} {x+3:.1f},{y-7:.1f}" fill="{K}"/>')
    h.ln(x + 26, y - 26, x + 26 + largo, y - 26, K, .8)
    h.circ(x + 26, y - 26, 4.5, "none", K, .9)  # todo alrededor
    bx = x + 26 + largo * .35
    h.path(f"M{bx:.1f},{y-26:.1f} v-10 l10,10 z", "none", K, .9)  # filete
    if txt:
        h.txt(x + 26 + largo + 4, y - 22, txt, 10.5)
