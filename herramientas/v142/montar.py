# Montaje maqueta (izquierda) vs. app real (derecha) de las 22 pantallas del recorrido
import os, sys
from PIL import Image, ImageDraw, ImageFont
S = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(S, '..', 'maq_ideas', 'recorrido'); C = os.path.join(S, 'capturas')
reales = sorted(f for f in os.listdir(C) if f[:2].isdigit() and f.endswith('.png'))
maqs = sorted(f for f in os.listdir(M) if f.endswith('.png'))
W, H = 300, 650
def fnt(n):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(f): return ImageFont.truetype(f, n)
    return ImageFont.load_default()
F, F2 = fnt(22), fnt(15)
cols = 4; filas = (22 + cols - 1) // cols
cw, ch = 2 * W + 30, H + 60
img = Image.new('RGB', (cols * cw + 40, filas * ch + 120), '#eceff7'); d = ImageDraw.Draw(img)
d.text((30, 30), 'v142 · Recorrido de la cuadrilla: maqueta aprobada (izq.) vs. la app real (der.) · celu 390×844', fill='#28285e', font=fnt(30))
for i in range(22):
    r = next((f for f in reales if f.startswith('%02d' % (i + 1))), None); m = maqs[i] if i < len(maqs) else None
    x, y = 20 + (i % cols) * cw, 100 + (i // cols) * ch
    d.text((x, y), r[:-4] if r else '%02d' % (i + 1), fill='#28285e', font=F)
    for j, f in enumerate([os.path.join(M, m) if m else None, os.path.join(C, r) if r else None]):
        if not f: continue
        a = Image.open(f).convert('RGB'); a.thumbnail((W, H)); img.paste(a, (x + j * (W + 10), y + 32))
        d.text((x + j * (W + 10), y + 32 + a.height + 2), 'maqueta' if j == 0 else 'app real', fill='#7c879d', font=F2)
img.save(os.path.join(C, 'recorrido_real.jpg'), quality=82); print('ok', img.size)
