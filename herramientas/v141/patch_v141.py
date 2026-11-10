"""v141 · Pedido de Ángel (10/11/2026): el Asistente por rol (qué puede ver y preguntar cada uno) y topes para que los
100 USD alcancen el mes.
 1) alcance() en el código dormido del asistente (asistenteIaCod): herramientas por rol (lista cerrada) y cada resultado
    limpio ANTES de mandarlo al modelo (sin plata; en la cuadrilla, sin datos de otras personas). System con lo que no ve.
    Herramienta nueva como_se_hace (guías «Cómo se hace» + Normas y tipos constructivos). Modelo por rol: pañol, cuadrilla,
    operario y mirar → Sonnet 5.5 con effort low (los remitos siguen con Opus). Cada pedido lleva ema.tipo
    (pregunta / supervisor / remito) para el Worker v3-ia, que es el que controla los topes.
 2) Lo liviano (asistenteIa): por defecto lo ven todos los roles; __iaUso (lo que le queda a cada uno: /mio y ema.uso; el
    gasto del mes: /uso), aviso a Administración al llegar al freno del mes, «Gastado este mes» en menú › Versión.
 3) Panel: chip «Te quedan N preguntas hoy», cartel de tope (no error rojo), ⚙ Límites (solo admin: topes por rol, freno del
    mes y prender/apagar por rol; configEquipo/personal.asistente.limites y .roles) con el detalle por persona y «Gastado
    este mes» (admin y oficina). Aviso una vez si el Worker es el viejo.
 4) remitoFoto: ema.tipo "remito", cartel de tope, cuenta de lo que queda.
Base: ORIGINAL 140 (la publicada). Sin reglas nuevas (usuarios/{uid} lo lee cada uno; configEquipo/personal los confirmados)."""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = '43e7fc5c601b1f52aef65b48b70525810509923805b91b8862798a14975453ce'   # ORIGINAL 140 (la publicada)
ent, sal = sys.argv[1], sys.argv[2]
t = open(ent, encoding='utf-8').read()
assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 140'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip() + '\n'
assert t.count('function alcance()') == 0
css, cod, liv = leer('ia141.css'), leer('ia141_cod.js'), leer('ia141_liviano.js')
for x in (css, cod, liv): assert ':has(' not in x
for x in (cod,): assert '?.' not in x and '??' not in x and '||=' not in x   # el código dormido no lo transpila compactar80

# ============================================================== CSS (al final del CSS del asistente)
R('''#iaPanel .ia-cfg .btn-primary.ancho,#iaPanel .ia-cfg .btn-ghost.ancho{width:100%;margin:10px 0 0;min-height:48px}''',
  '''#iaPanel .ia-cfg .btn-primary.ancho,#iaPanel .ia-cfg .btn-ghost.ancho{width:100%;margin:10px 0 0;min-height:48px}
''' + css.rstrip('\n'))

# ============================================================== 2) lo liviano
R('''  const ROLES_DEF = ["admin", "oficina"];''', '''  const ROLES_DEF = ["admin", "oficina"];
  const ROLES_TODOS = ["admin", "oficina", "panol", "cuadrilla", "operario", "mirar"];   // v141: de entrada lo ven todos''')
R('''    return r && r.length ? r : ROLES_DEF.slice();''', '''    return r && r.length ? r : window.__iaCompat ? ROLES_DEF.slice() : ROLES_TODOS.slice();''')
R('''  window.__iaGastoTexto = () => { const x = window.__iaGasto(); return `✨ Asistente: US$ ${usd(x.hoy)} hoy · US$ ${usd(x.mes)} este mes`; };''',
  '''  window.__iaGastoTexto = () => { const x = window.__iaGasto(), m = window.__iaUso && window.__iaUso.textoMes ? window.__iaUso.textoMes() : ""; return `✨ Asistente: US$ ${usd(x.hoy)} hoy · US$ ${usd(x.mes)} este mes (en este aparato)` + (m ? "\\n✨ " + m : ""); };   // v141: + el gasto del mes del Worker''')
R('''  const tic = () => { try { document.body && boton(); envLegajo(); botonSinObra(); } catch (e) { } };''',
  liv + '''  const tic = () => { try { document.body && boton(); envLegajo(); botonSinObra(); } catch (e) { } };''')

# ============================================================== 1) y 3) el código dormido
R('''  async function ejecutar(nombre, entrada) {
    const f = H[nombre]; if (!f) return { err: "No conozco la herramienta «" + nombre + "»." };''',
  '''  async function ejecutarBase(nombre, entrada) {   // v141: ejecutar() (más abajo) pasa antes por el alcance del rol
    const f = H[nombre]; if (!f) return { err: "No conozco la herramienta «" + nombre + "»." };''')
R('''    const acc = puedeAcciones(), lista = TOOLS.filter((t) => acc || ACCIONES.indexOf(t.name) < 0);''',
  '''    const acc = puedeAcciones(), lista = alcance().tools(TOOLS.filter((t) => acc || ACCIONES.indexOf(t.name) < 0));   // v141: y solo las de su rol''')
R('''    const pro = modelo === OPUS || modelo === FABLE, extra = modelo === HAIKU ? {} : { fallbacks: "default", betas: [BETA_RESPALDO] };''',
  '''    const pro = modelo === OPUS || modelo === FABLE, extra = modelo === HAIKU ? {} : { fallbacks: "default", betas: [BETA_RESPALDO] };
    extra.ema = { tipo: op.tipo || "pregunta" };   // v141: el Worker v3-ia cuenta preguntas / supervisor (el rol lo lee él de la base)''')
R('''    const sys = window.__iaCompat ? [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }, { type: "text", text: contexto() }] : [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }];''',
  '''    const sys = window.__iaCompat ? [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }, { type: "text", text: contexto() }] : [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }];
    const sr = sistemaRol(); if (sr) sys.push({ type: "text", text: sr });   // v141: lo que NO ve este rol (fijo durante la charla)''')
R('''    if (modelo === OPUS || modelo === FABLE) { try { window.__iaModelos && window.__iaModelos.workerNuevo(); } catch (e) { } }
    try { window.__iaSumarGasto && window.__iaSumarGasto(j.ema && j.ema.costoUsd); } catch (e) { }
    return j;
  }
  const quiereSonnet''', '''    if (modelo === OPUS || modelo === FABLE) { try { window.__iaModelos && window.__iaModelos.workerNuevo(); } catch (e) { } }
    try { window.__iaSumarGasto && window.__iaSumarGasto(j.ema && j.ema.costoUsd); } catch (e) { }
    try { window.__iaUso && window.__iaUso.poner(j.ema); } catch (e) { }   // v141: lo que le queda hoy (chip)
    try { avisoWorkerV3(j.ema); } catch (e) { }
    return j;
  }
  const quiereSonnet''')
R('''  function modeloPara(t) { const M = window.__iaModelos; if (!M) return SONNET;''',
  '''  function modeloPara(t) { if (rolBarato()) return SONNET; /* v141: pañol, cuadrilla, operario y mirar → Sonnet */ const M = window.__iaModelos; if (!M) return SONNET;''')
R('''  function effortPara(t) { return''', '''  function effortPara(t) { if (rolBarato()) return "low"; return''')
R('''      const opT = ef ? { effort: ef, rapido: rap } : {};''', '''      const opT = ef ? { effort: ef, rapido: rap } : {}; if (op.tipo) opT.tipo = op.tipo;   // v141''')
R('''      const m = e && e.ia ? e.message : "Algo falló en la app: " + String((e && e.message) || e).slice(0, 140);
      agregarBurbuja("mal", m); ultimo = { error: m };''',
  '''      const m = e && e.ia ? e.message : "Algo falló en la app: " + String((e && e.message) || e).slice(0, 140);
      if (e && e.ia && TOPE_TIT[e.tipo]) { agregarHtml(cartelTope(e.tipo, m)); try { window.__iaUso && window.__iaUso.marcarTope(e.tipo); } catch (er) { } }   // v141: tope del Worker → cartel, no error rojo
      else agregarBurbuja("mal", m);
      ultimo = { error: m };''')
R('''    await enviar(txt, true, { modelo, effort: "high", burbuja:''', '''    await enviar(txt, true, { modelo, effort: "high", tipo: "supervisor", burbuja:''')
# panel: chip «Te quedan», atajos y ejemplos por rol
R('''<div class="ia-chips" id="iaChips">${CHIPS.map(''', '''<div class="ia-queda" id="iaQueda" hidden role="status"></div><div class="ia-chips" id="iaChips">${CHIPS.map(''')
R('''    p = document.createElement("div"); p.id = "iaPanel"; p.className = "no-print"; p.hidden = true;''',
  '''    chipsRol();   // v141
    p = document.createElement("div"); p.id = "iaPanel"; p.className = "no-print"; p.hidden = true;''')
R('''Preguntame lo que necesites de la obra o pedime algo:<br>• <b>«¿cuántas columnas tiene Hípica?»</b><br>• <b>«pasame la ubi de San Martín»</b><br>• <b>«armá una orden para mañana en … con Juan, zanjeo 20 m»</b><br>• <b>«cerrame las OT que estén completas»</b><br>${puedeAcciones() ?''',
  '''Preguntame lo que necesites de la obra o pedime algo:<br>${ejemplosRol() || `• <b>«¿cuántas columnas tiene Hípica?»</b><br>• <b>«pasame la ubi de San Martín»</b><br>• <b>«armá una orden para mañana en … con Juan, zanjeo 20 m»</b><br>• <b>«cerrame las OT que estén completas»</b><br>${puedeAcciones() ?''')
R('''"Con tu usuario te contesto y te muestro todo, pero no hago cambios."}<br>Tocá el botón''', '''"Con tu usuario te contesto y te muestro todo, pero no hago cambios."}`}<br>Tocá el botón''')
R('''    if (!esCel()) setTimeout(() => { try { t.focus({ preventScroll: true }); } catch (e) { } }, 50);
    bajar();
  }''', '''    if (!esCel()) setTimeout(() => { try { t.focus({ preventScroll: true }); } catch (e) { } }, 50);
    bajar();
    pintarQueda(); try { window.__iaUso && window.__iaUso.mio(); } catch (e) { }   // v141: «Te quedan N preguntas hoy»
  }''')
# ⚙: Límites (admin) en lugar de «¿Quién ve el asistente?», y «Gastado este mes» (admin y oficina)
i = t.index('''${admin ? `<div class="card"><h2>¿Quién ve el asistente?''')
k = t.index('''<div class="hint" id="iaCfgMsg"></div></div>` : ""}''', i) + len('''<div class="hint" id="iaCfgMsg"></div></div>` : ""}''')
assert t.count(t[i:k]) == 1
t = t[:i] + '''${admin ? cfgLimitesHtml() : ""}''' + t[k:]
R('''<div class="hint">Lo cuenta este aparato (menú › Versión).</div></div>`;''',
  '''<div class="hint">Lo cuenta este aparato (menú › Versión).</div>${verMes ? cfgGastoHtml() : ""}</div>`;
    if (verMes) refrescarGasto();   // v141''')
R('''    const admin = esAdm(), r = window.__iaRoles ? window.__iaRoles() : ["admin", "oficina"], g = window.__iaGasto ? window.__iaGasto() : { hoy: 0, mes: 0 };''',
  '''    const admin = esAdm(), r = window.__iaRoles ? window.__iaRoles() : ["admin", "oficina"], g = window.__iaGasto ? window.__iaGasto() : { hoy: 0, mes: 0 };
    const verMes = !window.__iaCompat && (admin || nivelRol() === "oficina");   // v141''')
R('''  async function guardarCfg() {''', '''  async function guardarCfg() { return guardarLimites(); }   // v141: ⚙ › Límites (roles + topes + freno)
  async function guardarCfgV140() {''')
# el bloque v141 + lo que se exporta
R('''  window.__asistente = { VERSION, DATOS, podarImagenes,''', cod + '''  window.__asistente = { alcance, nivelRol, sistemaRol, ejecutar, cartelTope, NO_VE, VERSION, DATOS, podarImagenes,''')
R('''  const VERSION = "v136";
  const URL_IA = window.__iaUrl''', '''  const VERSION = "v141";
  const URL_IA = window.__iaUrl''')

# ============================================================== 4) remitoFoto
R('''      output_config: { effort: "medium" }, fallbacks: "default", betas: [BETA]
    };''', '''      output_config: { effort: "medium" }, fallbacks: "default", betas: [BETA],
      ema: { tipo: "remito" }   // v141: el Worker v3-ia lo cuenta como 1 remito (aparte de las preguntas), aunque traiga varias hojas
    };''')
R('''      throw errR(mj ? "El asistente contestó: " + mj : "El asistente no responde ahora (" + r.status + "). Cargá el remito a mano, como siempre.", "worker");''',
  '''      const tp = (j && j.error && j.error.tipo) || "";
      if (/^(tope_dia|tope_remitos|tope_mes|rol_apagado|usuario)$/.test(tp)) { try { window.__iaUso && window.__iaUso.marcarTope(tp); } catch (e) { } throw errR("⏸ " + mj + " Mientras tanto, cargalo a mano como siempre.", "tope"); }   // v141
      throw errR(mj ? "El asistente contestó: " + mj : "El asistente no responde ahora (" + r.status + "). Cargá el remito a mano, como siempre.", "worker");''')
R('''    try { window.__iaSumarGasto && window.__iaSumarGasto(j.ema && j.ema.costoUsd); } catch (e) { }
    return j;
  }
  function modelo() {''', '''    try { window.__iaSumarGasto && window.__iaSumarGasto(j.ema && j.ema.costoUsd); } catch (e) { }
    try { window.__iaUso && window.__iaUso.poner(j.ema); } catch (e) { }   // v141
    return j;
  }
  function modelo() {''')
R('''e.tipo === "red" || e.tipo === "worker"); return; }''', '''e.tipo === "red" || e.tipo === "worker" || e.tipo === "tope"); return; }''', 2)

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
