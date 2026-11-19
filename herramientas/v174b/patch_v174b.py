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
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
COPIA = lambda doc: '''(function(o, doc) { try { if (!o.exists) return; var d = o.data() || {}, j = JSON.stringify(d); if (j.length > 700000) return; var k = "ema.cfg.respaldoLocal", l = JSON.parse(localStorage.getItem(k) || "[]"), f = doc + "#" + (d.ts || "") + "#" + j.length; if (l.some(function(x) { return x.f === f; })) return; l.push({ f: f, doc: doc, ts: d.ts || 0, usuario: d.usuario || d.por || "", d: d, visto: Date.now(), cache: !!(o.metadata && o.metadata.fromCache) }); var del = function() { var m = l.filter(function(x) { return x.doc === doc; }); if (m.length <= 4) return false; var g = m[0]; m.forEach(function(x) { if (x.f.length && JSON.stringify(x.d).length > JSON.stringify(g.d).length) g = x; }); var v = m.find(function(x) { return x !== g; }); l.splice(l.indexOf(v), 1); return true; }; while (del()) { } while (l.length > 1 && JSON.stringify(l).length > 2500000) l.shift(); localStorage.setItem(k, JSON.stringify(l)); } catch (e) { } })(o, "%s");   // v174b: copia en el aparato''' % doc
# 1) copia en el aparato de baremo y precios, como la nómina (antes de que la del servidor pise la del aparato)
R('''      (window.__cfgCargado = window.__cfgCargado || {}).baremo = true;   // v174''', '''      (window.__cfgCargado = window.__cfgCargado || {}).baremo = true;   // v174
      ''' + COPIA("baremo"))
R('''      (window.__cfgCargado = window.__cfgCargado || {}).precios = true;   // v174''', '''      (window.__cfgCargado = window.__cfgCargado || {}).precios = true;   // v174
      ''' + COPIA("precios"))
# 2) la misma carrera de la nómina en baremo y precios: si la base contestó antes de que se leyera el script, aplicarla igual
R('''  window.aplicarBaremoDeLaNube = pe;''', '''  window.aplicarBaremoDeLaNube = pe;
  window.__baremoNube && setTimeout(() => { try { pe(); } catch (e) { } }, 0);   // v174b''')
R('''  window.aplicarPreciosDeLaNube = function() {''', '''  window.__preciosNube && setTimeout(() => { try { window.aplicarPreciosDeLaNube && window.aplicarPreciosDeLaNube(); } catch (e) { } }, 0);   // v174b: la base contestó antes de que se leyera este script
  window.aplicarPreciosDeLaNube = function() {''')
m = re.search(r'<style id="personalSeguroCss">\n.*?</style>\n<script id="personalSeguro">\n.*?</script>\n', t, re.S); assert m
t = t[:m.start()] + '<style id="personalSeguroCss">\n' + CSS + '</style>\n<script id="personalSeguro">\n' + JS + '</script>\n' + t[m.end():]
ahora = os.environ.get('SELLO') or datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
s = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert s and mm and mm.group(1) == s.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
t = t.replace(s.group(0), f'· v {ahora} · {h6}<').replace(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(args[1], 'w', encoding='utf-8').write(t); print('ok', args[1], len(t), f'{ahora} · {h6}')
