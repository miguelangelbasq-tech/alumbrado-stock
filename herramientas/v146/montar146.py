"""v146 · capturas reales al lado de las maquetas (uso: python3 montar146.py MAQ_PNG CAPTURAS SALIDA.jpg)"""
import sys
from PIL import Image, ImageDraw, ImageFont
maq, cap, sal = sys.argv[1:4]
filas = [('i3_cierre_voz_cel', 'voz_tarjeta_cel', 'Cierre del día por voz (celu)'), ('i4_compras_pc', 'compras_pc', 'Pedido de compras (compu)'), ('i4_compras_cel', 'compras_cel', 'Pedido de compras (celu)'),
         ('i5_tablero_pc', 'tablero_pc', 'Tablero del dueño (compu)'), ('i5_tablero_cel', 'tablero_cel', 'Tablero del dueño (celu)')]
H = 900; import os
TTF = os.environ.get('TTF', '')
F = ImageFont.truetype(TTF, 26) if TTF else ImageFont.load_default()
rows = []
for m, c, t in filas:
    a, b = Image.open(f'{maq}/{m}.png').convert('RGB'), Image.open(f'{cap}/{c}.png').convert('RGB')
    a, b = [x.resize((int(x.width * H / x.height), H)) for x in (a, b)]
    w = a.width + b.width + 60; r = Image.new('RGB', (w, H + 60), (236, 239, 247)); d = ImageDraw.Draw(r)
    d.text((20, 12), t + ' · maqueta | real', fill=(40, 40, 94), font=F)
    r.paste(a, (20, 55)); r.paste(b, (a.width + 40, 55)); rows.append(r)
W = max(r.width for r in rows); out = Image.new('RGB', (W, sum(r.height for r in rows)), (236, 239, 247)); y = 0
for r in rows: out.paste(r, (0, y)); y += r.height
out.thumbnail((2400, 99999)); out.save(sal, quality=82); print(sal, out.size)
