"""v138 · Pedidos de Ángel (10/11/2026):
 1) El botón «atrás» del celular (y la flecha del navegador / botón del mouse) vuelve atrás: cierra lo que esté abierto
    encima con la misma función que su ✕ y, si no hay nada, vuelve a la pantalla anterior; en el Inicio no deja historia
    (el APK manda la app al fondo). «¿Salir sin guardar?» en Llenar orden, Registrar movimiento y el cierre de la orden.
    Módulo nuevo `atrasApp`; se apagan los pushState/popstate sueltos de appCelular, visor de planos, hoja del celu,
    cámara, galería y hoja A4 (ahora los maneja todos atrasApp).
 2) Remito con IA: también PDF (bloque «document») y varias fotos del mismo remito en un solo pedido → una tarjeta;
    remitos largos: 16.000 tokens con Opus/Fable, resumen arriba y «Sí, cargar entrada» pegado abajo.
Base: ORIGINAL 137 (la publicada)."""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = 'cbe62a3bebff8ddbdf8122bae961fd1e1282669536a44179319bab4811f69729'   # ORIGINAL 137 (la publicada)
ent, sal = sys.argv[1], sys.argv[2]
t = open(ent, encoding='utf-8').read()
assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 137'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().strip() + '\n'
assert t.count('<script id="atrasApp"') == 0

# 1) appCelular: la historia de pantallas y menú pasa a atrasApp (queda la animación y el cierre de la orden al cambiar)
R('''        if (!u) try {
          history.state && history.state.emaMenu || window.__vistaReemplazar ? history.replaceState({ emaVista: n }, "") : history.pushState({ emaVista: n }, "");
        } catch {
        }
        _(n);''', '''        _(n);   // v138: la historia la lleva atrasApp''')
R('''    try {
      history.state && history.state.emaMenu || history.pushState({ emaMenu: true, emaVista: l() }, "");
    } catch {
    }
    return e;''', '''    return e;   // v138: atrasApp''')
R('''    return u || setTimeout(() => {
      try {
        history.state && history.state.emaMenu && history.back();
      } catch {
      }
    }, 0), e;''', '''    return e;   // v138: atrasApp''')
R('''  try {
    history.replaceState({ emaVista: l() }, "");
  } catch {
  }
  window.addEventListener("popstate", (e) => {
    const t = e.state || {};
    u = true;''', '''  (window.__popViejoApp = (e) => {   // v138: ya no escucha «atrás» (lo hace atrasApp)
    const t = e.state || {};
    u = true;''')
# 2) visor de planos
R('''      try {
        history.pushState(Object.assign({}, history.state || {}, { plnVisor: true }), "");
      } catch {
      }
    }
    r.innerHTML = Z()''', '''    }
    r.innerHTML = Z()''')
R('''  window.cerrarPlano = () => E(false), window.addEventListener("popstate", (t) => {''', '''  window.cerrarPlano = () => E(false), ((t) => {   // v138: «atrás» lo maneja atrasApp''')
# 3) hoja del celu
R('''    try { history.pushState(Object.assign({}, history.state || {}, { hojaCel: 1 }), ""); } catch { }
    return ov;''', '''    return ov;   // v138: atrasApp''')
R('''  window.addEventListener("popstate", (e) => { $("hojaCelOv") && !(e.state && e.state.hojaCel) && cerrarHoja(true); });''',
  '''  void ((e) => { $("hojaCelOv") && !(e.state && e.state.hojaCel) && cerrarHoja(true); });   // v138: atrasApp''')
# 4) cámara
R('''  window.addEventListener("popstate", () => { cam && cerrar(); });''', '''  void (() => { cam && cerrar(); });   // v138: «atrás» cierra la cámara por atrasApp''')
# 5) galería
R('''    if (!$("emaCam")) { try { history.pushState(Object.assign({}, history.state || {}, { gpVisor: 1 }), ""); V.conHist = true; } catch { } }
''', '''    // v138: la entrada de la historia la pone atrasApp
''')
R('''  window.addEventListener("popstate", (ev) => { if (V && !(ev.state && ev.state.gpVisor)) { V.conHist = false; cerrarVisor(true); } });''',
  '''  void ((ev) => { if (V && !(ev.state && ev.state.gpVisor)) { V.conHist = false; cerrarVisor(true); } });   // v138: atrasApp''')
# 6) hoja A4
R('''    try { history.pushState(Object.assign({}, history.state || {}, { hojaOv: 1 }), ""); H.hist = true; } catch { }
''', '''    // v138: la entrada de la historia la pone atrasApp
''')
R('''  window.addEventListener("popstate", (e) => { if (H && !(e.state && e.state.hojaOv)) { H.hist = false; cerrar(true); } });''',
  '''  void ((e) => { if (H && !(e.state && e.state.hojaOv)) { H.hist = false; cerrar(true); } });   // v138: atrasApp''')
assert 'addEventListener("popstate"' not in t, 'quedó un popstate suelto'
assert 'history.pushState' not in t, 'quedó un pushState suelto'

# 7) remito con IA: PDF, varias fotos, remitos largos (el bloque entero de la v137 → el de la v138)
R(open(os.path.join(SRC, 'remito137.html'), encoding='utf-8').read().strip(), open(os.path.join(SRC, 'remito138.html'), encoding='utf-8').read().strip())

# módulo nuevo, antes del último script
R('<script id="revisarAppDiag">', leer('atras.html') + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
