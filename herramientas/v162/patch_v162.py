"""v162 · Videos cortos y livianos (Ángel 15/11: «lo que pese lo menos posible para subirlo y que esté buena calidad…
   videos cortos, no tienen que ser videos largos»).
 · Tope de 1 minuto por video (antes 2).
 · Se achica a 480p (lado mayor 854, igual que antes: buena calidad) pero con menos bits: video 600 kbps (antes 1 Mbps) y
   audio mono 32 kbps (antes 48) → ≈ 4,7 MB por minuto (antes ≈ 8).
 · Un video que ya viene más liviano que eso (≤ 0,8 Mbps y ≤ 960 px) no se vuelve a achicar.
 · Textos: «Hasta 1 minuto… (≈ 5 MB por minuto)».
Solo constantes y textos de archivosNube (v160). Sin reglas nuevas.
Uso: python3 patch_v162.py ORIGINAL_161.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 161
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 161 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
R('  const TOPE_SEG = 120;              // 2 minutos (a confirmar con Ángel)',
  '  const TOPE_SEG = 60;               // v162: 1 minuto (Ángel 15/11: «videos cortos»)')
R('  const LADO = 854, VBPS = 1000000, ABPS = 48000;   // ≈ 480p, 1 Mbps, audio mono 48 kbps (a confirmar)',
  '  const LADO = 854, VBPS = 600000, ABPS = 32000;   // v162: ≈ 480p, 600 kbps, audio mono 32 kbps (≈ 4,7 MB por minuto; «lo que pese lo menos posible»)\n'
  '  const topeTxt = () => TOPE_SEG >= 120 ? (TOPE_SEG / 60) + " minutos" : TOPE_SEG >= 60 ? "1 minuto" : TOPE_SEG + " segundos";')
R('Hasta ${TOPE_SEG / 60} minutos. Antes de subirlo, el celu lo achica (≈ 8 MB por minuto).',
  'Videos cortos: hasta ${topeTxt()}. Antes de subirlo, el celu lo achica (≈ 5 MB por minuto).')
R('y el tope es ${TOPE_SEG / 60} minutos. Cortalo o grabá uno más corto.', 'y el tope es ${topeTxt()}. Cortalo o grabá uno más corto.')
R('file.size * 8 / info.dur <= 1.4e6 && Math.max(info.W, info.H) <= 960', 'file.size * 8 / info.dur <= 0.8e6 && Math.max(info.W, info.H) <= 960')
R('Subí un video corto (hasta 2 min) o un PDF (hasta 25 MB).', 'Subí un video corto (hasta 1 min) o un PDF (hasta 25 MB).')
R('(lado mayor 854 px ≈ 480p, ~1 Mbps de video + audio mono ~48 kbps, WebM; a confirmar)',
  '(lado mayor 854 px ≈ 480p, ~600 kbps de video + audio mono ~32 kbps, WebM; v162)')
R('    Tope de 2 minutos (a confirmar).', '    Tope de 1 minuto (v162).')
# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
