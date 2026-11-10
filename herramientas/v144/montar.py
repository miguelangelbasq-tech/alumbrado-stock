# v144 · montaje: maquetas aprobadas (opción B + hoja estilo D) arriba y la app real abajo (celu 390×844), y la oficina (PC)
import os
from PIL import Image, ImageDraw, ImageFont
S = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(S, '..', 'maq_camara', 'png'); C = os.path.join(S, 'capturas')
def fnt(n):
    f = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    return ImageFont.truetype(f, n) if os.path.exists(f) else ImageFont.load_default()
maq = [('B1_normal.png', 'B1 · normal'), ('B2_otra_obra.png', 'B2 · otra obra'), ('B3_gps_malo.png', 'B3 · GPS malo'), ('D3_que_cosa.png', 'D3 · hoja «cambiar»')]
real = [('1_normal', 'Normal: 1 toque'), ('2_otra_obra', 'Otra obra: va ahí'), ('6_gps_malo', 'GPS malo'), ('3_lista_obras', 'Las suyas + donde está'), ('4_aviso_otra_obra', 'Elige otra a mano'), ('5_es_otra_obra', '«Es otra obra» + motivo'), ('7_modo_obra_otra', 'Modo obra en otra obra')]
pc = [('8_supervisor', 'Supervisor: Mover / Está bien'), ('9_oficina_buscar', 'Oficina: buscador'), ('10_inicio_zona', 'Inicio: solo Zona Este')]
W = 2400; cw = (W - 40) // 7; ch = int(cw * 844 / 390); pw = (W - 40) // 3; ph = int(pw * 900 / 1366)
H = 90 + 40 + ch + 60 + 40 + ch + 60 + 40 + ph + 80
img = Image.new('RGB', (W, H), '#eceff7'); d = ImageDraw.Draw(img)
d.text((20, 20), 'v144 · Cámara «B · cámara primero» y la obra elegida por el GPS: maquetas aprobadas y la app real', fill='#28285e', font=fnt(34))
y = 90; d.text((20, y), 'Maquetas aprobadas', fill='#7c879d', font=fnt(24)); y += 36
for i, (f, t) in enumerate(maq):
    a = Image.open(os.path.join(M, f)).convert('RGB').resize((cw - 10, ch)); img.paste(a, (20 + i * cw, y)); d.text((20 + i * cw, y + ch + 6), t, fill='#4b5670', font=fnt(18))
y += ch + 50; d.text((20, y), 'App real · celu', fill='#28285e', font=fnt(26)); y += 36
for i, (f, t) in enumerate(real):
    a = Image.open(os.path.join(C, f + '_cel.png')).convert('RGB').resize((cw - 10, ch)); img.paste(a, (20 + i * cw, y)); d.text((20 + i * cw, y + ch + 6), t, fill='#4b5670', font=fnt(18))
y += ch + 50; d.text((20, y), 'App real · oficina (PC)', fill='#28285e', font=fnt(26)); y += 36
for i, (f, t) in enumerate(pc):
    a = Image.open(os.path.join(C, f + '_pc.png')).convert('RGB').resize((pw - 10, ph)); img.paste(a, (20 + i * pw, y)); d.text((20 + i * pw, y + ph + 6), t, fill='#4b5670', font=fnt(18))
img.save(os.path.join(C, 'real.jpg'), quality=80); print('ok', img.size)
