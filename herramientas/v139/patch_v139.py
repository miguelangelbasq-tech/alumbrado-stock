"""v139 · Pedido de Ángel (10/11/2026): «que la app ocupe toda la pantalla en la compu».
 Solo con más de 900 px de ancho (en el celular no cambia nada). Un <style id="v139PcCss"> + un script chico
 <script id="v139Pc"> (asa para cambiar el ancho del Asistente), antes de revisarAppDiag. No cambia ids, clases ni JS viejo.
 - Inicio Ejecutivo a todo lo ancho (tope 2200 px): portada con saludo · KPIs · anillo en una fila; tarjetas en columnas
   tipo masonry (2 hasta 1200 px, 3 hasta 1700 px, 4 desde ahí).
 - Perfil en columnas (2 hasta 1200 px, 3 desde ahí; tope 1400 px).
 - Asistente: panel lateral derecho de alto completo (480 px, se arrastra el borde: 420–760), desde 1240 px el contenido
   se corre a la izquierda (body.ia-abierto).
 - .wrap, header, footer y tabbar hasta 1960 px con 32 px a los costados.
Base: ORIGINAL 138 (la publicada)."""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = 'a52024ac70f7a38c563e3b9beb9cecb2316d088cb4171c2c0b6093ca5acf2de6'   # ORIGINAL 138 (la publicada)
ent, sal = sys.argv[1], sys.argv[2]
t = open(ent, encoding='utf-8').read()
assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 138'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().strip() + '\n'
assert t.count('id="v139PcCss"') == 0
css = leer('pc.css'); js = leer('pc.js')
assert ':has(' not in css and 'inset:' not in css.replace('inset-', '')
R('<script id="revisarAppDiag">', '<style id="v139PcCss">\n' + css + '</style>\n<script id="v139Pc">\n' + js + '</script>\n<script id="revisarAppDiag">')
# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
