"""v184 · «💬 Chat interno»: Administración y Oficina habilitan quién entra (configEquipo/chat.habilitados); «General» + una
conversación por persona con la oficina (chatInterno / chatHilos, reglas v184). La cuadrilla escribe «faltó cargarme la zanja de
10 m de hoy» → el asistente (Worker ema-ia, ema.tipo "pregunta", sus órdenes nada más) arma el pedido (sumar a su orden abierta,
corregir el cierre, reclamo de puntos) → Administración u Oficina «✅ Aprobar» / «✕ No corresponde» con motivo, por los caminos
de siempre (fbOtUpdate / __corregirCierre / reclamo v155); aviso al celu, auditoría chat_pedido. Bandera __v184No.
Módulo `chat184` + el globito en «Perfil» de la barra de abajo.
Uso: python3 patch_v184.py ORIGINAL_anterior.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip() if os.path.exists(os.path.join(SRC, 'BASE_SHA')) else ''
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL esperado (usá --otra-base si sabés lo que hacés)'
assert 'id="chat184"' not in t, 'ya tiene la v184'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
# ---------- barra de abajo: el globito del chat en «Perfil» (la cuadrilla entra desde ahí o desde el menú)
R('perfil: { t: "Perfil", i: "perfil", ir: () => V.ir("perfil"), on: (v) => v === "perfil", ve: () => true }',
  'perfil: { t: "Perfil", i: "perfil", ir: () => V.ir("perfil"), on: (v) => v === "perfil", ve: () => true, bd: () => (window.__chat184 ? window.__chat184.badge() : 0) }   // v184: mensajes sin leer del chat interno')
# ---------- el módulo, antes de revisarAppDiag
CSS = open(os.path.join(SRC, 'chat184.css'), encoding='utf-8').read()
JS = open(os.path.join(SRC, 'chat184.js'), encoding='utf-8').read()
R('<script id="revisarAppDiag">', '<style id="chat184Css">\n' + CSS + '</style>\n<script id="chat184">\n' + JS + '</script>\n<script id="revisarAppDiag">')
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
