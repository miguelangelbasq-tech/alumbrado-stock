"""v174b · «🩹 Recuperar personal y vehículos» no encontraba nada con los datos reales (Ángel 19/11).
Cambia solo el módulo personalSeguro (lo toma de herramientas/v174/personalSeguro.js/.css): lee todas las órdenes, quincenas y
usuarios de la base al abrir la hoja (no solo lo que hay en memoria), saca la gente de todos los lugares de la orden (personal[]
como texto u objeto, responsable, asignada, reparto, equipoTarea, equipos, vehiculoPersona, horario, cierre, personalNombres),
se vuelve a revisar sola cuando terminan de cargar, y dice qué revisó («Revisé N órdenes…», «ya en la nómina» / «faltan»).
Uso: python3 patch_v174b.py ORIGINAL_174.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__)); MOD = os.path.join(SRC, '..', 'v174')
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()
args = [a for a in sys.argv[1:] if not a.startswith('--')]
t = open(args[0], encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 174 (usá --otra-base si sabés lo que hacés)'
JS = open(os.path.join(MOD, 'personalSeguro.js'), encoding='utf-8').read()
CSS = open(os.path.join(MOD, 'personalSeguro.css'), encoding='utf-8').read()
m = re.search(r'<style id="personalSeguroCss">\n.*?</style>\n<script id="personalSeguro">\n.*?</script>\n', t, re.S); assert m
t = t[:m.start()] + '<style id="personalSeguroCss">\n' + CSS + '</style>\n<script id="personalSeguro">\n' + JS + '</script>\n' + t[m.end():]
ahora = os.environ.get('SELLO') or datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
s = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert s and mm and mm.group(1) == s.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
t = t.replace(s.group(0), f'· v {ahora} · {h6}<').replace(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(args[1], 'w', encoding='utf-8').write(t); print('ok', args[1], len(t), f'{ahora} · {h6}')
