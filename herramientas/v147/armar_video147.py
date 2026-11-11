# v147 · Arma capturas/B_real.mp4 (portada + recorrido real grabado por grabar147.js) y capturas/B_real_cuadros.jpg
# (cuadros a mitad de cada movimiento). Uso: python3 armar_video147.py CARPETA_REC SALIDA_DIR
import json, subprocess, os, sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
REC, SAL = sys.argv[1], sys.argv[2]
FB = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'; FR = '/usr/share/fonts/opentype/inter/Inter-Regular.otf'
FX = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
if not os.path.exists(FX): FX = FB
sh = lambda *a: subprocess.run(a, check=True)
J = json.load(open(f'{REC}/marcas.json'))
raw = f'{REC}/_raw.mp4'
sh('ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{REC}/vid/lista.txt', '-vf', 'fps=30,scale=780:1688,format=yuv420p', '-c:v', 'libx264', '-crf', '18', raw)
W, H = 780, 1688
g = np.linspace(0, 1, H)[:, None]; c0, c1 = np.array([23, 23, 61]), np.array([31, 111, 145])
im = Image.fromarray(np.broadcast_to((c0 * (1 - g) + c1 * g).astype(np.uint8).reshape(H, 1, 3), (H, W, 3)).copy()); d = ImageDraw.Draw(im)
d.text((60, 560), 'Pantallas en movimiento', font=ImageFont.truetype(FR, 34), fill=(137, 194, 219))
d.text((60, 620), 'Opción B', font=ImageFont.truetype(FX, 88), fill='white')
d.text((60, 730), 'en la app real (v147)', font=ImageFont.truetype(FB, 54), fill='white')
y = 860
for l in ['La pantalla nueva entra de la derecha', 'la anterior se corre y se oscurece', '«Atrás»: al revés', 'Hojas que suben · 280 ms']:
    d.text((60, y), '•  ' + l, font=ImageFont.truetype(FR, 33), fill=(225, 236, 244)); y += 58
d.text((60, H - 140), 'Grabado de la app v147 · celular 390×844', font=ImageFont.truetype(FR, 28), fill=(137, 194, 219))
im.save(f'{REC}/portada.jpg', quality=92)
os.makedirs(SAL, exist_ok=True)
sh('ffmpeg', '-loglevel', 'error', '-y', '-loop', '1', '-t', '1.6', '-framerate', '30', '-i', f'{REC}/portada.jpg', '-i', raw,
   '-filter_complex', '[0:v]scale=720:1558,setsar=1,fps=30,format=yuv420p[a];[1:v]scale=720:1558,setsar=1,fps=30,format=yuv420p[b];[a][b]concat=n=2:v=1[v]',
   '-map', '[v]', '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p', '-crf', '22', '-preset', 'slow', '-movflags', '+faststart', f'{SAL}/B_real.mp4')
LAT = 0.34
def cuadros(t0, t1, w=78, h=169):
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', str(t0), '-t', str(t1 - t0), '-i', raw, '-vf', f'fps=30,scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    return np.frombuffer(r, np.uint8).reshape(-1, h, w).astype(int)
sel = []
for i, m in enumerate(J['marcas']):
    t = m['t'] + LAT; F = cuadros(t, t + 1.0)
    if not len(F): continue
    a, b = F[0], F[-1]; s = [min(np.abs(f - a).mean(), np.abs(f - b).mean()) for f in F]; k = int(np.argmax(s))
    p = f'{REC}/k_{i:02d}.png'; sh('ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{t + k / 30:.3f}', '-i', raw, '-frames:v', '1', p); sel.append((p, m['n']))
cw, ch, pad, lh = 300, 649, 24, 40
cols = 4; rows = (len(sel) + cols - 1) // cols
M = Image.new('RGB', (pad + cols * (cw + pad), 90 + rows * (ch + lh + pad)), (234, 242, 247)); d = ImageDraw.Draw(M)
d.text((pad, 24), 'Opción B en la app real (v147) · cuadros a mitad de cada movimiento', font=ImageFont.truetype(FX, 34), fill=(40, 40, 94))
for k, (p, rot) in enumerate(sel):
    x, y = pad + (k % cols) * (cw + pad), 90 + (k // cols) * (ch + lh + pad)
    d.rounded_rectangle((x - 3, y - 3, x + cw + 3, y + ch + 3), 14, fill=(205, 218, 230)); M.paste(Image.open(p).convert('RGB').resize((cw, ch), Image.LANCZOS), (x, y))
    d.text((x + 4, y + ch + 8), rot, font=ImageFont.truetype(FB, 22), fill=(30, 111, 145))
M.save(f'{SAL}/B_real_cuadros.jpg', quality=86)
print('ok', os.path.getsize(f'{SAL}/B_real.mp4') // 1024, 'KB', len(sel), 'cuadros')
