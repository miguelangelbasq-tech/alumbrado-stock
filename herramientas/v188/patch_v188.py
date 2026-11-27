"""v188 · Reserva nueva desde el celu (pedido de Ángel 27/11/2026: «pongo la obra y no me sale para buscar al personal ni
el material ni nada»). Desde la v119, en el celu (y en la app de Android) los campos con lista de sugerencias muestran la
caja blanca propia #sugCaja (z-index 9500), pegada al body. La ventana de la reserva (#rsModal, .pf-modal) va en z 9600:
la caja quedaba DEBAJO de la ventana, invisible y sin poder tocarse («Para quién» y cada material). Lo mismo en cualquier
otra ventana fija con un campo con lista. Arreglo: la caja se pone siempre arriba de la capa donde está el campo
(el z-index más alto de sus antepasados + 1, nunca menos de 9500), y el clic que sigue al toque de una sugerencia
ya no cae en el botón que quedaba debajo de la caja; un renglón nuevo («＋ Agregar material») muestra la caja
al toque (antes esperaba hasta 1 s a que el relojito le sacara la lista del teclado). En la compu no cambia nada (lista del navegador).
Bandera __v188No. Sin reglas nuevas.
BASE_SHA = el ORIGINAL 187 publicado. Uso: python3 patch_v188.py ENTRADA.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de entrada (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
assert '__v188No' not in t, 'ya tiene la v188'
# sugerencias (v119): la caja arriba de la capa del campo
R('''  function ubicar() {
    if (!caja || !campo) return;
    if (!campo.isConnected) return cerrar();''',
'''  // v188: la caja va pegada al body; si el campo está en una ventana fija (la reserva #rsModal es z 9600) quedaba debajo.
  function capaDe(i) {
    let z = 0;
    for (let e = i; e && e !== document.body && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e), n = parseInt(cs.zIndex, 10);
      if (cs.position !== "static" && isFinite(n) && n > z) z = n;
    }
    return z;
  }
  function ubicar() {
    if (!caja || !campo) return;
    if (!campo.isConnected) return cerrar();
    if (!window.__v188No) { const z = capaDe(campo); caja.style.zIndex = z >= 9500 ? String(z + 1) : ""; }''')
# el toque que eligió la sugerencia no tiene que seguir de largo: la caja se saca en el pointerdown y el clic que viene
# después caía en lo que estaba debajo (en la reserva, «＋ Agregar material» o «Reservar»)
R('''  document.addEventListener("pointerdown", (e) => { const b = e.target && e.target.closest && e.target.closest("#sugCaja button"); if (b) { e.preventDefault(); elegir(b.dataset.v); } }, true);
  document.addEventListener("click", (e) => { const b = e.target && e.target.closest && e.target.closest("#sugCaja button"); if (b) { e.preventDefault(); } }, true);''',
'''  let tragar = 0;   // v188
  document.addEventListener("pointerdown", (e) => { const b = e.target && e.target.closest && e.target.closest("#sugCaja button"); if (b) { e.preventDefault(); if (!window.__v188No) tragar = Date.now(); elegir(b.dataset.v); } }, true);
  document.addEventListener("click", (e) => { const b = e.target && e.target.closest && e.target.closest("#sugCaja button"); if (b) { e.preventDefault(); return; } if (tragar && Date.now() - tragar < 700) { tragar = 0; e.preventDefault(); e.stopPropagation(); } }, true);''')
# un campo recién agregado (el renglón de «＋ Agregar material») esperaba hasta 1 s al relojito de preparar(): si la persona
# ya lo tocaba y escribía, no salía nada. Ahora se prepara al recibir el foco o la primera letra.
R('''  document.addEventListener("focusin", (e) => { const i = e.target; if (i && i.dataset && i.dataset.sugList)''',
'''  const prepUno = (i) => { if (window.__v188No || !i || !i.getAttribute || !esTactil()) return; const l = i.tagName === "INPUT" && i.getAttribute("list"); if (!l) return; i.dataset.sugList = l; i.removeAttribute("list"); i.setAttribute("autocomplete", "off"); };   // v188
  document.addEventListener("focusin", (e) => { const i = e.target; prepUno(i); if (i && i.dataset && i.dataset.sugList)''')
R('''  document.addEventListener("input", (e) => { const i = e.target; if (i && i.dataset && i.dataset.sugList''',
'''  document.addEventListener("input", (e) => { const i = e.target; prepUno(i); if (i && i.dataset && i.dataset.sugList''')
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t)
print('OK', sal, f'{ahora} · {h6}')
