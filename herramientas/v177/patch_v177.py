"""v177 · El Inicio de admin/oficina/Dirección (#iniDir) prolijo: logo a la izquierda junto al menú (como el encabezado de la app),
la caja «El número del día» separada de la barra de arriba, rótulos de los 6 números en 2 renglones y los botones de la sugerida
con su forma. Solo CSS (+ la clase html.v177). Bandera __v177No.
Uso: python3 patch_v177.py ORIGINAL_176.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 176 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
CSS = open(os.path.join(SRC, 'ordenInicio.css'), encoding='utf-8').read()
# justo después del estilo del Inicio de Dirección (antes de que se dibuje): la clase y el estilo
R('@media print{#iniDir,#dirOv{display:none !important}}\n</style>\n',
  '@media print{#iniDir,#dirOv{display:none !important}}\n</style>\n<style id="ordenInicio177Css">\n' + CSS + '</style>\n'
  '<script id="ordenInicio177">\n/* v177: la clase que prende el estilo prolijo del Inicio (pruebas viejas: window.__v177No) */\n'
  '(function () { try { if (!window.__v177No) document.documentElement.classList.add("v177"); } catch (e) { } })();\n</script>\n')
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
