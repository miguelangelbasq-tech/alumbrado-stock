"""v182 · Datos seguros: los agujeros que encontró la auditoría del 19/11 (sobre la v176, «¿pasó algo más?»). Arreglos SIN bandera:
 1. Escuchas de configEquipo (baremo, personal, precios, cuadrillas, ubicacion) y reinicios: no marcan «llegó la base» con la caché
    vacía (`!exists && metadata.fromCache`): la guardia (v174) frena los guardados hasta que conteste el servidor.
 2. Respaldo completo de la base (también las obras archivadas), avisa lo que no pudo leer; suma ubicacion y reinicios.
 3. Restaurar: contra la BASE, sin duplicar, con el mismo número de registro, catálogo solo completa vacíos, vista previa,
    «Sí» + segunda confirmación, auditoría.
 4. Borrar de verdad (reiniciar / reemplazar movimientos, limpiar historial de cómputos): solo Administración en «⚠ Zona peligrosa»,
    con BORRAR escrito, respaldo bajado antes y auditoría. «Importar movimientos» común solo agrega.
 5. Equipos habituales: el borrador no se queda con la propuesta de ejemplo si la base llega después.
 6. ⚙ del asistente (roles, modelo, límites, avisos) y tablero del dueño: por la guardia; lo abierto antes de que llegue la base se
    vuelve a cargar antes de guardar.
 7. Teléfonos de «La cuadrilla en obra»: sacar no toca la copia de la base (la guardia pregunta); seguridadCuadrilla / herrPorTarea
    entran en la revisión de lo sacado; lo abierto antes de la base se vuelve a cargar.
 8. Reinicios de puntos, ajustes de la orden sugerida y precios de Gastos no guardan sobre lo de fábrica / lo viejo; avanceHist y
    avanceNotas se agregan con arrayUnion.
Sin reglas nuevas.
Uso: python3 patch_v182.py ORIGINAL_base.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de base (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'datosSeguros.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'datosSeguros.css'), encoding='utf-8').read()
SC = '!(%s.metadata && %s.metadata.fromCache)'   # el servidor contestó (o no hay caché de por medio)

# 1) escuchas de configEquipo: con la caché vacía NO es «llegó la base»
R('''      (window.__cfgCargado = window.__cfgCargado || {}).baremo = true;   // v174''',
  '''      if (o.exists || %s) (window.__cfgCargado = window.__cfgCargado || {}).baremo = true;   // v174 · v182: no con la caché vacía''' % (SC % ('o', 'o')))
R('''      (window.__cfgCargado = window.__cfgCargado || {}).precios = true;   // v174''',
  '''      if (o.exists || %s) (window.__cfgCargado = window.__cfgCargado || {}).precios = true;   // v174 · v182: no con la caché vacía''' % (SC % ('o', 'o')))
R('''      window.__personalCargado = true, window.__personalNube = o.exists ? o.data() : null,''',
  '''      (o.exists || %s) && (window.__personalCargado = true, window.__dsPersonalLlego = window.__dsPersonalLlego || Date.now()), window.__personalNube = o.exists ? o.data() : (window.__personalCargado ? null : window.__personalNube || null),''' % (SC % ('o', 'o')))
R('''        (window.__cfgCargado = window.__cfgCargado || {}).cuadrillas = true, (window.__cfgDatos = window.__cfgDatos || {}).cuadrillas = e.exists ? e.data() : {};   // v174''',
  '''        (e.exists || %s) && ((window.__cfgCargado = window.__cfgCargado || {}).cuadrillas = true), (window.__cfgDatos = window.__cfgDatos || {}).cuadrillas = e.exists ? e.data() : {};   // v174 · v182: no con la caché vacía''' % (SC % ('e', 'e')))
R('''        (window.__cfgCargado = window.__cfgCargado || {}).ubicacion = true, (window.__cfgDatos = window.__cfgDatos || {}).ubicacion = d;   // v174''',
  '''        (s.exists || %s) && ((window.__cfgCargado = window.__cfgCargado || {}).ubicacion = true), (window.__cfgDatos = window.__cfgDatos || {}).ubicacion = d;   // v174 · v182: no con la caché vacía''' % (SC % ('s', 's')))
R('''try { const s = await firebase.firestore().collection("configEquipo").doc(doc).get(); DAT[doc] = s.exists ? s.data() : {}; CFG[doc] = true; } catch (e) { }''',
  '''try { const s = await firebase.firestore().collection("configEquipo").doc(doc).get(); if (s.exists || %s) { DAT[doc] = s.exists ? s.data() : {}; CFG[doc] = true; } } catch (e) { }''' % (SC % ('s', 's')))
# 7b) la guardia: lo que se saca de seguridadCuadrilla / herrPorTarea también pregunta
R('''    const qt = []; ks.forEach((k) => { if (k.indexOf(".") < 0 && k !== "ausencias") quitados(cur[k], p[k], k, qt); });''',
  '''    const qt = []; ks.forEach((k) => { if (k.indexOf(".") < 0 && k !== "ausencias") quitados(cur[k], p[k], k, qt); });
    ks.forEach((k) => { if (/^(seguridadCuadrilla|herrPorTarea)$/.test(k) && cur[k] && typeof cur[k] == "object" && p[k] && typeof p[k] == "object") Object.keys(cur[k]).forEach((q) => { if (!(q in p[k])) qt.push(k + ": " + q); }); });   // v182''')
# reinicios: la escucha y el guardado
R('''        const d = (s && s.exists ? s.data() : null) || {};''',
  '''        if (s && (s.exists || %s)) window.__reiCargado = true;   // v182: no con la caché vacía
        const d = (s && s.exists ? s.data() : null) || {};''' % (SC % ('s', 's')))
R('''  async function guardarCfg(patch, msg) {
    const m = $("reiMsg");
    try {''', '''  async function guardarCfg(patch, msg) {
    const m = $("reiMsg");
    if (!window.__reiCargado) {   // v182: la lista se armó con lo de fábrica (CFG0): leer la base y que lo vuelva a tocar
      try { const s = await firebase.firestore().collection("configEquipo").doc("reinicios").get(); if (s.exists || %s) { const d = (s.exists ? s.data() : null) || {}; CFG = { ...CFG0, ...d, saldoObras: d.saldoObras || {}, puntosSinObras: d.puntosSinObras || [], puntosSinDias: d.puntosSinDias || [] }; cache.clear(); window.__reiCargado = true; } } catch (er) { }
      m && (m.className = "rei-msg mal", m.textContent = window.__reiCargado ? "⚠ Llegaron los datos de la base: revisá y tocá de nuevo. No se guardó nada." : "⚠ Todavía no llegaron los reinicios de la base: esperá unos segundos y probá de nuevo. No se guardó nada."); pintarAdmin(true); return;
    }
    try {''' % (SC % ('s', 's')))
# 5) equipos habituales: no se queda con la propuesta si la base llega después
R('''  function borrador() {
    if (edit) return edit;''', '''  function borrador() {
    if (edit && (edit.conBase || !window.__personalCargado)) return edit;   // v182: armado antes de que llegue la base → se vuelve a armar''')
R('''    edit = g.length ? { guardado: true,''', '''    edit = g.length ? { conBase: !!window.__personalCargado, guardado: true,''')
R('''aVeces: arr(e.aVeces).map((n) => ({ pedido: n, nombre: n, estado: "ok" })), veh: { id: e.vehiculoId || "", estado: "ok" }, tareas: e.tareas || "", grua: !!e.grua })) } : { guardado: false, l: propuesta() };''',
  '''aVeces: arr(e.aVeces).map((n) => ({ pedido: n, nombre: n, estado: "ok" })), veh: { id: e.vehiculoId || "", estado: "ok" }, tareas: e.tareas || "", grua: !!e.grua })) } : { conBase: !!window.__personalCargado, guardado: false, l: propuesta() };''')
# 6) ⚙ del asistente (dormido): marca de cuándo se armó y guardados por la guardia
DSP = '(window.__dsPersonalSet || ((x) => firebase.firestore().collection("configEquipo").doc("personal").set(x, { merge: true })))'
R('''    if (verMes) refrescarGasto();   // v141''', '''    if (verMes) refrescarGasto();   // v141
    c.dataset.dsTs = String(Date.now());   // v182: cuándo se armó (si la base llega después, se vuelve a cargar antes de guardar)''')
DS_OP = '{ desde: +(((document.getElementById("iaCfg") || {}).dataset || {}).dsTs || 0), repintar: pintarCfg, accion: "%s" }'
R('''      await firebase.firestore().collection("configEquipo").doc("personal").set({ asistente: { roles, ts: Date.now(), por: String((window.__fbUser || {}).email || "") } }, { merge: true });''',
  '''      await %s({ asistente: { roles, ts: Date.now(), por: String((window.__fbUser || {}).email || "") } }, %s);   // v182''' % (DSP, DS_OP % 'asistente_roles'))
R('''      await firebase.firestore().collection("configEquipo").doc("personal").set({ asistente: Object.assign(cur, { modelo: a, modeloSupervisor: s, tsModelo: Date.now(), porModelo: String((window.__fbUser || {}).email || "") }) }, { merge: true });''',
  '''      await %s({ asistente: Object.assign(cur, { modelo: a, modeloSupervisor: s, tsModelo: Date.now(), porModelo: String((window.__fbUser || {}).email || "") }) }, %s);   // v182''' % (DSP, DS_OP % 'asistente_modelo'))
R('''      await firebase.firestore().collection("configEquipo").doc("personal").set({ asistente: Object.assign(cur, window.__v155No ? {} : { rolesConDir: true }, { roles, limites, tsLimites: Date.now(), porLimites: String((window.__fbUser || {}).email || "") }) }, { merge: true });''',
  '''      await %s({ asistente: Object.assign(cur, window.__v155No ? {} : { rolesConDir: true }, { roles, limites, tsLimites: Date.now(), porLimites: String((window.__fbUser || {}).email || "") }) }, %s);   // v182''' % (DSP, DS_OP % 'asistente_limites'))
R('''      await db().collection("configEquipo").doc("personal").set({ asistente: { avisosA: v } }, { merge: true });''',
  '''      await %s({ asistente: { avisosA: v } }, { desde: +(((document.getElementById("iaCfg") || {}).dataset || {}).dsTs || 0), repintar: () => { e.target.value = avisosA(); } });   // v182''' % DSP)
R('''    const us = intentar(() => PERMISOS.lista() || [], []).filter((x) => x && x.uid && x.activo !== false && x.pendiente !== true && (x.rol === "oficina")), l = habilitados();''',
  '''    st.dsTs = Date.now();   // v182: cuándo se armó
    const us = intentar(() => PERMISOS.lista() || [], []).filter((x) => x && x.uid && x.activo !== false && x.pendiente !== true && (x.rol === "oficina")), l = habilitados();''')
R('''      await firebase.firestore().collection("configEquipo").doc("personal").set({ tableroDueno: { habilitados: st.sel || l, ts: Date.now(), por: String((window.__fbUser || {}).email || "") } }, { merge: true });''',
  '''      await %s({ tableroDueno: { habilitados: st.sel || l, ts: Date.now(), por: String((window.__fbUser || {}).email || "") } }, { desde: st.dsSel || 0, repintar: () => { st.sel = null; } });   // v182''' % DSP)
R('''st.qmsg = l.length ? "Lo van a ver (con la plata): "''', '''st.dsSel = st.dsTs; st.qmsg = l.length ? "Lo van a ver (con la plata): "''')
R('''    } catch (e) { st.qmsg = "⚠ No se pudo guardar (" + ((e && (e.code || e.message)) || "sin conexión") + ")."; }''',
  '''    } catch (e) { st.qmsg = e && e.ds ? "⚠ " + e.message : "⚠ No se pudo guardar (" + ((e && (e.code || e.message)) || "sin conexión") + ")."; }''')
# 7) teléfonos de la cuadrilla: lo que se edita no toca la copia de la base
R('''  let cfgMsg = "", cfgFirma = "";''', '''  let cfgMsg = "", cfgFirma = "", ctsEdit = null;   // v182: lo que se está editando (la copia de la base no se toca)''')
R('''    const cf = cfg(), firma = JSON.stringify([cf.contactos, cf.seguridadCuadrilla, cf.herrPorTarea, cfgMsg]);''',
  '''    const cf = cfg(), firma = JSON.stringify([cf.contactos, cf.seguridadCuadrilla, cf.herrPorTarea, cfgMsg, ctsEdit]);''')
R('''    const cts = arr(cf.contactos).length ? arr(cf.contactos) : [{ nombre: "", rol: "oficina", tel: "" }];''',
  '''    const cts = ctsEdit || (arr(cf.contactos).length ? arr(cf.contactos) : [{ nombre: "", rol: "oficina", tel: "" }]);
    c.dataset.dsTs = String(Date.now());   // v182''')
R('''      window.__personalNube = Object.assign({}, cfg(), { contactos: f.cts }); cfgFirma = "";''', '''      ctsEdit = f.cts; cfgFirma = "";''')
R('''        await firebase.firestore().collection("configEquipo").doc("personal").set(window.__cfgGuardia ? await window.__cfgGuardia("personal", pcd) : pcd, { merge: true });   // v174''',
  '''        if (window.__dsPersonalSet) await window.__dsPersonalSet(pcd, { preguntar: true, desde: +((($("cdCfgCard") || {}).dataset || {}).dsTs || 0), repintar: () => { ctsEdit = null; cfgFirma = ""; } });   // v182: guardia, pregunta lo sacado
        else await firebase.firestore().collection("configEquipo").doc("personal").set(window.__cfgGuardia ? await window.__cfgGuardia("personal", pcd) : pcd, { merge: true });   // v174
        ctsEdit = null;''')
R('''      } catch (er) { cfgMsg = er && er.code === "permission-denied" ? "🔒 Tu usuario no puede cambiar el personal del equipo." : "⚠ No se pudo guardar (revisá la conexión)."; }''',
  '''      } catch (er) { cfgMsg = er && er.code === "permission-denied" ? "🔒 Tu usuario no puede cambiar el personal del equipo." : er && (er.ds || /^ps-/.test(er.code || "")) ? "⚠ " + er.message : "⚠ No se pudo guardar (revisá la conexión)."; }''')
# 8) orden sugerida › Ajustes: no guarda un borrador armado con lo de fábrica
R('''  let cfgLocal = null;   // lo que se está tocando en Ajustes (sin guardar)''', '''  let cfgLocal = null, cfgSinBase = false;   // lo que se está tocando en Ajustes (sin guardar) · v182: ¿se armó antes de que llegue el baremo?''')
R('''if (!cfgLocal) cfgLocal = cfgNube();''', '''if (!cfgLocal) { cfgLocal = cfgNube(); cfgSinBase = !(window.__cfgCargado || {}).baremo; }''', 3)
R('''    const m = $("sgCfgMsg"), C = C0 || cfgLocal || cfgNube();''', '''    const m = $("sgCfgMsg"), C = C0 || cfgLocal || cfgNube();
    if (!C0 && cfgLocal && cfgSinBase && (window.__cfgCargado || {}).baremo) {   // v182: lo tocado salió de lo de fábrica: se vuelve a cargar lo de la base
      cfgLocal = null; cfgSinBase = false; invalidar(); try { pintar(); if ($("sgCfg")) editorCfg(); } catch (e) { }
      const m3 = $("sgCfgMsg"); if (m3) m3.textContent = "⚠ Llegaron los ajustes de la base después de empezar a cambiarlos: se volvieron a cargar. Revisá y guardá de nuevo.";
      throw Object.assign(new Error("Llegaron los ajustes de la base después de empezar a cambiarlos: se volvieron a cargar. Revisá y guardá de nuevo."), { code: "ds-recargar", ds: true });
    }''')
# Gastos › precios de referencia: lo de la base si es más nuevo
R('''  const ref = () => refLocal || (window.__preciosNube && window.__preciosNube.gastosRef) || {};''',
  '''  const ref = () => { const n = window.__preciosNube && window.__preciosNube.gastosRef; if (refLocal && n && (+n.ts || 0) >= (+refLocal.ts || 0)) refLocal = null; return refLocal || n || {}; };   // v182: lo de la base si es más nuevo''')

MOD = '<style id="datosSegurosCss">\n' + CSS + '</style>\n<script id="datosSeguros">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
