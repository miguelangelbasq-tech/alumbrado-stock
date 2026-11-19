"""v185 · La Calculadora por rubros, opción A (Ángel 19/11/2026: «VAMOS CON LA A»): pestañas Obra · Columnas · Luminarias ·
Eléctrico · Civil · PAT · Resultado (barrio: Obra · Luminarias y postes · Red aérea · Alimentación y tablero · PAT de red ·
Resultado) con su puntito, las tarjetas de siempre marcadas por rubro (no se rearman; el esquema de tierra se mueve a PAT),
la barra de abajo (materiales, módulos K, avisos, «Calcular», ⚡ Cálculos rápidos), «Lo que sale de este rubro» y el
Resultado por rubro con «✎ Cambiar». Bandera __v185No. Solo el módulo `calc185` antes de revisarAppDiag (+ sello): anda sobre
la 183 y sobre las que se arman encima (181, 182, 184) sin tocar nada de ellas.
Uso: python3 patch_v185.py ORIGINAL_ENTRADA.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip() if os.path.exists(os.path.join(SRC, 'BASE_SHA')) else ''
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de entrada (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
# lo que usa el módulo tiene que estar (la Calculadora de la v183 y sus piezas)
for x in ['id="viewCalculadora"', 'id="calcFlotante"', 'id="resultCard"', 'id="esquemaTierra"', 'id="esquemaHint"', 'id="cardProvision"', 'id="cardEmpalmes"',
          'window.calcModoActual = Na', '<script id="computoTabs">', '<script id="calc183">', 'window.epecPreviaDe = (e) =>']:
    assert x in t, x
assert '<script id="calc185">' not in t, 'ya tiene la v185'
CSS = open(os.path.join(SRC, 'calc185.css'), encoding='utf-8').read()
JS = open(os.path.join(SRC, 'calc185.js'), encoding='utf-8').read()
R('<script id="revisarAppDiag">', '<style id="calc185Css">\n' + CSS + '</style>\n<script id="calc185">\n' + JS + '</script>\n<script id="revisarAppDiag">')
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
