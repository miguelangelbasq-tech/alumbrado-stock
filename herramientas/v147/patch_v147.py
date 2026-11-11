"""v147 · Movimiento entre pantallas, opción B «como app de banco» (elegida por Ángel entre las 3 maquetas, 11/11/2026).
 · movCss + movPantallas (antes de revisarAppDiag): la pantalla nueva entra desde la derecha con sombra y la anterior se corre
   un 30 % a la izquierda y se oscurece; «atrás» al revés (280 ms). Legajo, pantallas de la cuadrilla, subpestañas y hojas igual;
   tarjetas escalonadas. Sin copiar la pantalla que se va (queda visible la real y se esconde al terminar), solo transform/opacity,
   sin animación en cámara, mapa, Asistente, visores, hoja A4 y Modo obra con la cámara; en la compu, fundido de 150 ms;
   reduced-motion = sin movimiento; celu lento (primer cambio > 250 ms) → fundido corto (opción A).
 · Perfil › Tus ajustes: «Movimiento entre pantallas» Sí / No (localStorage ema.mov).
 · atrasApp: no cuenta como ventana abierta lo que se está yendo (.mov-cierra / .mov-fantasma / .mov-sale): misma historia que la v138.
Sin reglas nuevas. Pruebas viejas: window.__movNo (salvo mov:true en h.js).
Uso: python3 patch_v147.py ORIGINAL_146.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 146
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 146 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip() + '\n'
assert t.count('id="movPantallas"') == 0, 'ya tiene la v147'
css, js = leer('movCss.css'), leer('movPantallas.js')
MOD = [('mapaControlCss', 'mapaControl.css', 'mapaControl', 'mapaControl.js'), ('pasosTareaCss', 'pasosTarea.css', 'pasosTarea', 'pasosTarea.js'), ('informeSemanalCss', 'informeSemanal.css', 'informeSemanal', 'informeSemanal.js')]
EXTRA = [(leer(c), sc, leer(j).replace('/*BORRADOR*/\n', leer('pasosBorrador.js')) if j == 'pasosTarea.js' else leer(j)) for (ci, c, sc, j) in MOD]
assert all('/*BORRADOR*/' not in e[2] for e in EXTRA)
for x in [css, js] + [y for e in EXTRA for y in (e[0], e[2])]: assert ':has(' not in x and '</script' not in x and '?.' not in x and '??' not in x and 'overflow-x:clip' not in x
assert 'gap:' not in css

# 1) Perfil › Tus ajustes: «Movimiento entre pantallas» Sí / No
R('      { k: "rec", i: "despertador", t: "Recordatorios"',
  '      window.__mov && window.__mov.fila ? window.__mov.fila(sw) : null,   // v147: movimiento entre pantallas\n      { k: "rec", i: "despertador", t: "Recordatorios"')
R('    if (k === "rec") { if (!LN()) return msg(NECESITA + "."); return hoja(); }',
  '    if (k === "mov") { const on = window.__mov && window.__mov.alternar(); return msg(on ? "Listo: las pantallas se mueven al cambiar." : "Listo: las pantallas cambian al instante."); }   // v147\n    if (k === "rec") { if (!LN()) return msg(NECESITA + "."); return hoja(); }')
# 2) atrasApp: lo que se está yendo no es una ventana abierta
R('      if (tomadas.has(e) || (e.id && NO_CAPA.test(e.id)) || /^(SCRIPT|STYLE|TEMPLATE|LINK)$/.test(e.tagName)) return;',
  '      if (tomadas.has(e) || (e.id && NO_CAPA.test(e.id)) || /^(SCRIPT|STYLE|TEMPLATE|LINK)$/.test(e.tagName)) return;\n      if (e.classList && (e.classList.contains("mov-cierra") || e.closest(".mov-fantasma, .mov-sale"))) return;   // v147: se está yendo (movimiento)')
R('  async function pasoAtras() {', '  async function pasoAtras() {\n    window.__atrasTs = Date.now();   // v147: el movimiento entre pantallas sabe que es «atrás» (va al revés)')
# --- cuadrilla (pedido de Ángel por las fotos del celu): la barra de abajo fija para cuadrilla/operario y sin parpadeo
CREW = '(window.__cdOn && window.__cdOn())'
R("""      + '<button type="button" class="n1-gu" data-n1g="1" aria-label="Guardar la barra"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 6.5L9 12l5.5 5.5"/></svg></button>';   // v136: guardarla (opción B)""",
  """      + (""" + CREW + """ ? "" : '<button type="button" class="n1-gu" data-n1g="1" aria-label="Guardar la barra"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 6.5L9 12l5.5 5.5"/></svg></button>');   // v136: guardarla (opción B) · v147: la cuadrilla no la guarda""")
R('function aplicar() { if (!document.body) return; document.body.classList.toggle("n1-guardada", guardada); bd0 = null; pintarTab(); }',
  'const guardadaYa = () => guardada && !' + CREW + ';   // v147: para la cuadrilla la barra no se guarda (se ignora lo guardado, no se borra)\n  function aplicar() { if (!document.body) return; document.body.classList.toggle("n1-guardada", guardadaYa()); bd0 = null; pintarTab(); }')
R('if (document.body.classList.contains("n1-guardada") !== guardada) aplicar();', 'if (document.body.classList.contains("n1-guardada") !== guardadaYa()) aplicar();')
R("""  function tab() {
    let t = $("navTab");
    if (!t && document.body) {""", """  function tab() {
    let t = $("navTab");
    if (""" + CREW + """) { t && t.remove(); return null; }   // v147: la cuadrilla no tiene lengüeta
    if (!t && document.body) {""")
R('    const n = guardada ? pendientes() : 0, h = n ? (n > 99 ? "99+" : String(n)) : "";', '    const n = guardadaYa() ? pendientes() : 0, h = n ? (n > 99 ? "99+" : String(n)) : "";')
# el parpadeo: escribir solo si cambia (classList.toggle con fuerza no toca el atributo si ya está así)
R('document.body.classList.remove("cd-portada")', 'document.body.classList.toggle("cd-portada", false)', 3)
R('document.body.classList.remove("ie-hero")', 'document.body.classList.toggle("ie-hero", false)', 3)
R('document.body.classList.remove("con-offaviso")', 'document.body.classList.toggle("con-offaviso", false)')
R('document.body.classList.add("con-offaviso")', 'document.body.classList.toggle("con-offaviso", true)')
R('document.body.classList.add("pf-on")', 'document.body.classList.toggle("pf-on", true)')
R('b.style.top = Math.max(8, Math.min(y + 6, 180)) + "px";', 'const tp = Math.max(8, Math.min(y + 6, 180)) + "px"; if (b.style.top !== tp) b.style.top = tp;')
R('if (c.innerHTML !== h) c.innerHTML = h;', 'if (c.__h !== h) { c.innerHTML = h; c.__h = h; }   // v147: el innerHTML leído nunca es igual al armado (redibujaba siempre)', 4)
R('if (b.innerHTML !== h) b.innerHTML = h;   // v136: campana de línea (antes 🔔)', 'if (b.__h !== h) { b.innerHTML = h; b.__h = h; }   // v136: campana de línea (antes 🔔) · v147: solo si cambió')
R('b.textContent = activo() ? "🏗 Por obra ✓" : "🏗 Por obra";', 'const tx = activo() ? "🏗 Por obra ✓" : "🏗 Por obra"; if (b.textContent !== tx) b.textContent = tx;')
# la campanita: el aviso de orden nueva lleva a la orden en «Hoy» (cuadrilla nueva)
R('      if (d.v === "mistareas") { typeof mostrarVista == "function"', '      if (d.v === "mistareas" && window.__pasosTarea && window.__pasosTarea.irOrden(d.ot)) return;   // v147\n      if (d.v === "mistareas") { typeof mostrarVista == "function"')
R('${o.horaInicio ? " a las " + o.horaInicio : ""}`, ir: { v: "mistareas" } });', '${o.horaInicio ? " a las " + o.horaInicio : ""}`, ir: { v: "mistareas", ot: o.id } });')
# 3) los módulos nuevos (antes del último script)
extra = ''.join('<style id="%s">\n%s</style>\n<script id="%s">\n%s</script>\n' % (ci, e[0], sc, e[2]) for (ci, c, sc, j), e in zip(MOD, EXTRA))
R('<script id="revisarAppDiag">', '<style id="movCss">\n' + css + '</style>\n<script id="movPantallas">\n' + js + '</script>\n' + extra + '<script id="revisarAppDiag">')
# pasos de la cuadrilla: Modo obra, La orden del día, Ayuda, export de cuadrillaDia
R('<div class="cd-pas">${pas}</div>', '<div class="cd-pas">${pas}</div>${window.__pasosTarea ? window.__pasosTarea.botonObra(o, pa.p) : ""}')
R('${ts.map((p, i) => tareaFila(o, p, i + 1)).join("")', '${ts.map((p, i) => tareaFila(o, p, i + 1) + (window.__pasosTarea ? window.__pasosTarea.linkFila(o, p) : "")).join("")')
R('<button type="button" class="cd-op" data-cdh="ia">', '${window.__pasosTarea ? window.__pasosTarea.opAyuda(o, pa.p) : ""}<button type="button" class="cd-op" data-cdh="ia">')
R('window.__cuadrillaDia = { on,', 'window.__cuadrillaDia = { on, elegirOt: (id) => { S.otId = String(id || ""); }, GUIA_DE, /* v147 */')
# avisos: «Tocá para ver la orden y los pasos» y abren la orden
R('${o.horaInicio ? " a las " + o.horaInicio : ""}`, tipo: "ot"', '${o.horaInicio ? " a las " + o.horaInicio : ""}${window.__v147No ? "" : " · Tocá para ver la orden y los pasos"}`, tipo: "ot"')
R('tipo: "ot", ref: String(id || ""), tag: "ema-ot-" + (id || o.numero) });', 'tipo: "ot", ref: String(id || ""), tag: "ema-ot-" + (id || o.numero), ...(window.__v147No ? {} : { url: "./?ot=" + encodeURIComponent(String(id || "")) }) });')
R('titulo: "⏰ Tarea de EMA · hoy", cuerpo: textoHoy(o),', 'titulo: "⏰ Tarea de EMA · hoy", cuerpo: textoHoy(o) + (window.__v147No ? "" : " · Tocá para ver la orden y los pasos"),')
R('enviarDesde: ts7(o.fecha), url: "./"', 'enviarDesde: ts7(o.fecha), url: window.__v147No ? "./" : "./?ot=" + encodeURIComponent(String(id))')
R('PN.addListener("pushNotificationActionPerformed", (a) => { const v = a && a.notification && a.notification.data && a.notification.data.vista;', 'PN.addListener("pushNotificationActionPerformed", (a) => { try { const m = /[?&]ot=([^&]+)/.exec(String((a && a.notification && a.notification.data && a.notification.data.url) || "")); if (m && window.__pasosTarea && window.__pasosTarea.abrirPend(decodeURIComponent(m[1]))) return; } catch (e) { } const v = a && a.notification && a.notification.data && a.notification.data.vista;')
# la hoja de la orden (impresa / «Ver orden») usa la copia de los pasos que quedó en la orden
R('const E = String(b.pasos || "").split(', 'const E = String((e.pasos && e.pasos[h]) || b.pasos || "").split(')
# bug: los pasos editados de las tareas del catálogo original se guardan (configEquipo/baremo.pasos) y se aplican al cargar
R('s && (s.label = e, o && (s.pasos = o)), h[q] = { un: a, pts: t };', 's && (s.label = e, o && (s.pasos = o)), o && ((window.__pasosEdit = window.__pasosEdit || {})[q] = o), h[q] = { un: a, pts: t };')
R('labels: n, valorPunto: E,', 'labels: n, pasos: Object.assign({}, (window.__baremoNube || {}).pasos || {}, window.__pasosEdit || {}), valorPunto: E,', 2)
R("""      e.labels[t.id] && (t.label = e.labels[t.id]);
    });
    const a = document.getElementById("viewProduccion");""", """      e.labels[t.id] && (t.label = e.labels[t.id]);
    });
    e.pasos && typeof e.pasos == "object" && typeof ACTIVIDADES_CATALOGO < "u" && ACTIVIDADES_CATALOGO.forEach((t) => {   // v147: los pasos editados de las tareas del catálogo
      typeof e.pasos[t.id] == "string" && e.pasos[t.id].trim() && (t.pasos = e.pasos[t.id]);
    });
    const a = document.getElementById("viewProduccion");""")
# Inicio Ejecutivo › Accesos y Tablero del dueño: «🗺 Mapa de guerra» (y más abajo el informe semanal)
R('<div class="ie-accs">${window.__tableroDueno ? window.__tableroDueno.accesoHtml() : ""}', '<div class="ie-accs">${window.__tableroDueno ? window.__tableroDueno.accesoHtml() : ""}${window.__mapaControl ? window.__mapaControl.accesoHtml() : ""}${window.__informeSemanal ? window.__informeSemanal.accesoHtml() : ""}')
R('<div class="sg-in td-in">${hero}<div class="td-gr">', '<div class="sg-in td-in">${hero}<div class="td-gr">${window.__mapaControl ? window.__mapaControl.tdHtml() : ""}${window.__informeSemanal ? window.__informeSemanal.tdHtml() : ""}')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
