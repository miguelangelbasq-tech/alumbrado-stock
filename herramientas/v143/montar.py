# Montaje: maqueta aprobada (arriba) y la app real (abajo), celu y PC
import os
from PIL import Image, ImageDraw, ImageFont
S = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(S, '..', 'maq_orden'); C = os.path.join(S, 'capturas')
def fnt(n):
    f = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    return ImageFont.truetype(f, n) if os.path.exists(f) else ImageFont.load_default()
reales = [('1_inicio', 'Entrada en el Inicio'), ('2_por_obra', 'Por obra'), ('3_por_persona', 'Por persona'), ('3b_semana', 'Semana'), ('4_cambiar', 'Cambiar'), ('5_emitir', 'Emitir'), ('6_ajustes', 'Ajustes'), ('7_aprende', 'Lo que aprende la app')]
W = 2400
cel = [Image.open(os.path.join(C, r + '_cel.png')).convert('RGB') for r, _ in reales]
pc = [Image.open(os.path.join(C, r + '_pc.png')).convert('RGB') for r, _ in reales]
mc, mp = Image.open(os.path.join(M, 'montaje_celu.jpg')).convert('RGB'), Image.open(os.path.join(M, 'montaje_pc.jpg')).convert('RGB')
mc.thumbnail((W, 1400)); mp.thumbnail((W, 1500))
cw = (W - 40) // 8; ch = int(cw * 844 / 390); pw = (W - 40) // 4; ph = int(pw * 900 / 1440)
H = 100 + mc.height + 60 + ch + 60 + 60 + mp.height + 60 + 2 * (ph + 40) + 40
img = Image.new('RGB', (W, H), '#eceff7'); d = ImageDraw.Draw(img)
d.text((20, 20), 'v143 · Orden sugerida: maqueta aprobada y la app real (celu 390×844 y PC 1440×900)', fill='#28285e', font=fnt(34))
y = 80; d.text((20, y), 'Maqueta · celu', fill='#7c879d', font=fnt(22)); y += 30; img.paste(mc, (20, y)); y += mc.height + 20
d.text((20, y), 'App real · celu', fill='#28285e', font=fnt(26)); y += 36
for i, (a, (_, t)) in enumerate(zip(cel, reales)): a = a.resize((cw - 10, ch)); img.paste(a, (20 + i * cw, y)); d.text((20 + i * cw, y + ch + 4), t, fill='#4b5670', font=fnt(16))
y += ch + 40
d.text((20, y), 'Maqueta · PC', fill='#7c879d', font=fnt(22)); y += 30; img.paste(mp, (20, y)); y += mp.height + 20
d.text((20, y), 'App real · PC', fill='#28285e', font=fnt(26)); y += 36
for i, (a, (_, t)) in enumerate(zip(pc, reales)):
    a = a.resize((pw - 10, ph)); x = 20 + (i % 4) * pw; yy = y + (i // 4) * (ph + 40); img.paste(a, (x, yy)); d.text((x, yy + ph + 4), t, fill='#4b5670', font=fnt(16))
img.save(os.path.join(C, 'real.jpg'), quality=80); print('ok', img.size)
