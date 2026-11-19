"""v174 · La nómina y los vehículos no se pierden (Ángel 19/11: Personal del equipo quedó con las 10 personas de la lista de
ejemplo de la app y sin vehículos). Arreglo sin bandera:
 · la pantalla toma la nómina de la base aunque la base conteste antes de que se lea su script (carrera al abrir);
 · nada escribe nomina / vehiculos de configEquipo/personal si la base no llegó en esta sesión («Cargando la nómina…»);
 · la lista de ejemplo de la app no se graba nunca; sacar gente o vehículos pide «Sí»;
 · antes de cada guardado, la versión anterior va a configEquipo/personal.respaldos[] (las últimas 10) + auditoría personal_guardar;
 · cada versión de la nómina que llega a un aparato queda en localStorage ema.personal.respaldoLocal (las últimas 6, la más grande siempre);
 · «🩹 Recuperar personal y vehículos» (solo Administración): qué se borró, de dónde sale cada dato, qué se perdió; casillas + «Sí».
Uso: python3 patch_v174.py ORIGINAL_173.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 173
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 173 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'personalSeguro.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'personalSeguro.css'), encoding='utf-8').read()

# 1) la escucha de configEquipo/personal: «ya llegó» + copia local de cada versión que llega (antes de que la del servidor pise la del aparato)
R('''a.collection("configEquipo").doc("personal").onSnapshot((o) => {
      window.__personalNube = o.exists ? o.data() : null,''', '''a.collection("configEquipo").doc("personal").onSnapshot((o) => {
      (function(o) { try { if (!o.exists) return; var d = o.data() || {}, n = Array.isArray(d.nomina) && d.nomina.length ? d.nomina : Array.isArray(d.lista) ? d.lista : [], v = Array.isArray(d.vehiculos) ? d.vehiculos : []; if (!n.length && !v.length) return; var k = "ema.personal.respaldoLocal", l = JSON.parse(localStorage.getItem(k) || "[]"), f = n.map(function(x) { return x && x.nombre; }).join("|") + "#" + v.map(function(x) { return x && x.id; }).join("|") + "#" + (d.ts || ""); if (l.some(function(x) { return x.f === f; })) return; l.push({ f: f, ts: d.ts || 0, usuario: d.usuario || "", nomina: n, vehiculos: v, visto: Date.now(), cache: !!(o.metadata && o.metadata.fromCache) }); while (l.length > 6) { var g = 0; l.forEach(function(x, i) { if (x.nomina.length + x.vehiculos.length > l[g].nomina.length + l[g].vehiculos.length) g = i; }); l.splice(g === 0 ? 1 : 0, 1); } localStorage.setItem(k, JSON.stringify(l)); } catch (e) { } })(o);   // v174
      window.__personalCargado = true, window.__personalNube = o.exists ? o.data() : null,''')
# 2) la pantalla: de dónde viene la lista y la carrera (la base contestó antes de que se leyera este script)
R('''    e && Array.isArray(e.nomina) && e.nomina.length && (A = e.nomina), Q();''',
  '''    e && Array.isArray(e.nomina) && e.nomina.length && (A = e.nomina), window.__nominaDeBase = !!(e && Array.isArray(e.nomina) && e.nomina.length), Q();   // v174''')
R('''  window.aplicarPersonalDeLaNube = ie;''', '''  window.aplicarPersonalDeLaNube = ie;
  window.__personalNube && ie();   // v174: si la base ya contestó, la pantalla no se queda con la lista de ejemplo''')
# 3) «Guardar» de Personal del equipo: el motivo real si no se guardó
R('''    } catch {
      e.style.color = "var(--danger)", e.textContent = "No se pudo guardar en la base compartida (revisá la conexión). El cambio quedó solo acá.";''',
  '''    } catch (er) {
      e.style.color = "var(--danger)", e.textContent = window.__psErr ? window.__psErr(er) : "No se pudo guardar en la base compartida (revisá la conexión). El cambio quedó solo acá.";''')
# 4) vehículos (v043): también por la guardia
R('''    await firebase.firestore().collection("configEquipo").doc("personal").set({ vehiculos: limpio, vehiculosTs: Date.now(), vehiculosPor: (window.__fbUser && window.__fbUser.email) || "" }, { merge: true });''',
  '''    const pv = { vehiculos: limpio, vehiculosTs: Date.now(), vehiculosPor: (window.__fbUser && window.__fbUser.email) || "" };
    await firebase.firestore().collection("configEquipo").doc("personal").set(window.__psGuardia ? await window.__psGuardia(pv) : pv, { merge: true });   // v174''')
# 5) asistente (genérico): configEquipo/personal por la guardia
R('''    else if (d.coleccion === "configEquipo") await db.collection("configEquipo").doc(d.doc).update(p);''',
  '''    else if (d.coleccion === "configEquipo") await db.collection("configEquipo").doc(d.doc).update(d.doc === "personal" && window.__psGuardia ? await window.__psGuardia(p) : p);   // v174''')

# 6) los otros documentos de configuración: «ya llegó» + datos, y sus guardados por la guardia
R('''a.collection("configEquipo").doc("baremo").onSnapshot((o) => {
      window.__baremoNube''', '''a.collection("configEquipo").doc("baremo").onSnapshot((o) => {
      (window.__cfgCargado = window.__cfgCargado || {}).baremo = true;   // v174
      window.__baremoNube''')
R('''a.collection("configEquipo").doc("precios").onSnapshot((o) => {
      window.__preciosNube''', '''a.collection("configEquipo").doc("precios").onSnapshot((o) => {
      (window.__cfgCargado = window.__cfgCargado || {}).precios = true;   // v174
      window.__preciosNube''')
R('''      firebase.firestore().collection("configEquipo").doc("cuadrillas").onSnapshot((e) => {
        W = e.exists''', '''      firebase.firestore().collection("configEquipo").doc("cuadrillas").onSnapshot((e) => {
        (window.__cfgCargado = window.__cfgCargado || {}).cuadrillas = true, (window.__cfgDatos = window.__cfgDatos || {}).cuadrillas = e.exists ? e.data() : {};   // v174
        W = e.exists''')
R('''        const d = s.exists ? s.data() : {}, firma = JSON.stringify(d || {});''', '''        const d = s.exists ? s.data() : {}, firma = JSON.stringify(d || {});
        (window.__cfgCargado = window.__cfgCargado || {}).ubicacion = true, (window.__cfgDatos = window.__cfgDatos || {}).ubicacion = d;   // v174''')
R('''        try { await db().collection("configEquipo").doc("ubicacion").set(nuevo); msg.textContent''', '''        try { await db().collection("configEquipo").doc("ubicacion").set(window.__cfgGuardia ? await window.__cfgGuardia("ubicacion", nuevo) : nuevo); msg.textContent''')
R('''    await firebase.firestore().collection("configEquipo").doc("precios").set({ gastosRef: nuevo }, { merge: true });''', '''    const pgr = { gastosRef: nuevo };
    await firebase.firestore().collection("configEquipo").doc("precios").set(window.__cfgGuardia ? await window.__cfgGuardia("precios", pgr) : pgr, { merge: true });   // v174''')
R('''        await firebase.firestore().collection("configEquipo").doc("personal").set({ contactos: cts, seguridadCuadrilla: f.seg, herrPorTarea: f.ht, cuadrillaDiaTs: Date.now(), cuadrillaDiaPor: miEmail() }, { merge: true });''', '''        const pcd = { contactos: cts, seguridadCuadrilla: f.seg, herrPorTarea: f.ht, cuadrillaDiaTs: Date.now(), cuadrillaDiaPor: miEmail() };
        await firebase.firestore().collection("configEquipo").doc("personal").set(window.__cfgGuardia ? await window.__cfgGuardia("personal", pcd) : pcd, { merge: true });   // v174''')
R('''.doc(d.doc).update(d.doc === "personal" && window.__psGuardia ? await window.__psGuardia(p) : p);   // v174''', '''.doc(d.doc).update(d.doc === "personal" && window.__psGuardia ? await window.__psGuardia(p) : window.__cfgGuardia && /^(baremo|precios|cuadrillas|ubicacion)$/.test(d.doc) ? await window.__cfgGuardia(d.doc, p) : p);   // v174''')

MOD = '<style id="personalSeguroCss">\n' + CSS + '</style>\n<script id="personalSeguro">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
