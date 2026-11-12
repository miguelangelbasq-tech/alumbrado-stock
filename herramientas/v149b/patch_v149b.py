"""v149b (urgente) · Las fotos de la cuadrilla no se envían y se pierden + copia automática en el celu + mandar lo hecho.
Causas encontradas (ver CHANGELOG):
 · Con internet y «Esperando señal» (captura de Bruno, 11/11 16:36, antes de la v148): cuando la base (plan gratis) llega al
   cupo del día, Firestore no rechaza las escrituras: las reintenta solo para siempre, y la app lo mostraba como «sin señal».
   Encima la cola de fotos volvía a mandar cada minuto TODAS las fotos pendientes (una escritura nueva por foto por minuto,
   con la imagen adentro si la nube falló): una tormenta que se suma al cupo y llena la memoria del celu.
 · v148 (Modo obra por atrás): ante cualquier error que no fuera permiso o señal, borraba la copia del celu y decía
   «sacala de nuevo»; un solo intento, sin reintentos; una foto trabada frenaba a todas las de atrás; la cámara de la barra y
   Mis tareas clásica no tenían copia (el error = foto perdida).
 · Mis tareas clásica (Franco, OT-2026-218): la orden se envía sola solo con TODAS las tareas mandadas; con 1 de 10 no había
   cómo mandar lo hecho.
Sin reglas nuevas. Sin APK nuevo (usa Filesystem de la 1.3).
Uso: python3 patch_v149b.py ORIGINAL_149.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 149
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 149 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('v149b') == 0, 'ya tiene la v149b'

# ===================================================== 1) el número de la foto (adjId) se fija de entrada y viaja hasta la cola
R('try { t = await subirAdjunto(e, { tipo: "obra", plazaId', 'try { t = await subirAdjunto(e, { ...(a.__adjId ? { __id: a.__adjId } : {}) /* v149b: el número de la foto, fijado de entrada */, tipo: "obra", plazaId')
R('const db = firebase.firestore(), id = db.collection(col).doc().id, it =', '''let idFijo = ""; if (data && data.__id) { idFijo = String(data.__id); data = Object.assign({}, data); delete data.__id; }   // v149b: el número fijado de entrada
    const db = firebase.firestore(), id = idFijo || db.collection(col).doc().id, it =''')
# ===================================================== 2) la cola de fotos no vuelve a mandar lo que ya está en camino (tormenta)
R('function mandar(it) {   // devuelve', '''const VUELO = new Map();   // v149b: lo que ya está en camino no se vuelve a mandar (antes: una escritura nueva por foto por minuto)
  function mandar(it) { if (VUELO.has(it.k)) return VUELO.get(it.k); const p = mandar0(it); VUELO.set(it.k, p); p.then(() => VUELO.delete(it.k), () => VUELO.delete(it.k)); return p; }
  function mandar0(it) {   // devuelve''')
R('if (reintentando || !window.__fbUser || navigator.onLine === false) return;', 'if (reintentando || !window.__fbUser || navigator.onLine === false || (forzar !== true && window.__senalReal && window.__senalReal.pausa())) return;   // v149b: con el cupo agotado, no se golpea la base')
R('e.innerHTML = enNeg ?', 'const tr = window.__senalReal && window.__senalReal.textoCola ? window.__senalReal.textoCola(enCola, enNeg) : "";   // v149b: el motivo real\n    if (e.__h === tr + enCola + enNeg && tr) return; e.__h = tr + enCola + enNeg;\n    e.innerHTML = tr ? tr : enNeg ?')
R('if (col === "adjuntos") avisar("📶 Sin señal', 'if (col === "adjuntos") avisar((window.__senalReal && window.__senalReal.avisoFoto()) || "📶 Sin señal')
# ===================================================== 3) la foto con su marca → copia en el celu
R('return orig.call(this, f, meta);', 'try { window.__fotoSellada && window.__fotoSellada(f, meta); } catch (e) { }   // v149b: copia en el celu (Documentos › EMA › Fotos)\n      return orig.call(this, f, meta);')
# ===================================================== 4) lo que esperan en cada celu viaja en el latido (Supervisor)
R('window.__dispInfo = d; return d;', 'try { window.__dispExtra && Object.assign(d, window.__dispExtra()); } catch (e) { }   // v149b: fotos esperando y por qué\n    window.__dispInfo = d; return d;')
R('st.lista = controlar().concat(', 'st.lista = controlar().concat(window.__senalReal && window.__senalReal.supHallazgos ? window.__senalReal.supHallazgos() : []).concat(')   # v149b
# ===================================================== 5) Perfil › «Guardar copia de las fotos en el celu»
R('window.__mov && window.__mov.fila ? window.__mov.fila(sw) : null,', 'window.__mov && window.__mov.fila ? window.__mov.fila(sw) : null,\n      window.__fotoBandeja && window.__fotoBandeja.filaPerfil ? window.__fotoBandeja.filaPerfil(sw) : null,   // v149b')
R('if (k === "mov") { const on', 'if ((k === "fcopia" || k === "fzip") && window.__fotoBandeja) { if (k === "fzip") msg("Armando el ZIP…"); return msg(esc(await window.__fotoBandeja.perfil(k))); }   // v149b\n    if (k === "mov") { const on')
# ===================================================== 6) cuadrilla (Hoy / Modo obra / Sin señal): contador, motivo y lista
R('const nF = intentar(() => (window.__fotosSinSenal ? window.__fotosSinSenal.cantidad() : 0), 0) || 0,', 'const nF = intentar(() => (window.__fotoBandeja ? window.__fotoBandeja.cantidad() : window.__fotosSinSenal ? window.__fotosSinSenal.cantidad() : 0), 0) || 0,   /* v149b: todas las fotos que no están en la base */')
R('const q = colaTxt(); if (!q.off && !q.nF && !q.nC) return "";', 'const q = colaTxt(); if (!q.off && !q.nF && !q.nC) return intentar(() => window.__fotoBandeja.tarjeta(q) || "", "");   // v149b: «✓ Todas las fotos subidas»')
R('<b>${q.off ? "Sin señal" : "Esperando señal"}</b>', '<b>${esc(intentar(() => window.__fotoBandeja.titulo(q), q.off ? "Sin señal" : "Esperando señal"))}</b>')
R('return barra("Esperando señal") + `${q.off || q.nF || q.nC ?', 'return barra(intentar(() => window.__fotoBandeja.titulo(q), "Esperando señal")) + intentar(() => `<div class="cd-cu">${window.__fotoBandeja.pantallaHtml()}</div>`, "") + `${q.off || q.nF || q.nC ?')
i = t.index('${fs.length ? fs.map((x) => `<div class="cd-rw"><span class="cd-mini">'); j = t.index("'<div class=\"cd-vacio\">No hay fotos esperando.</div>'}", i) + len("'<div class=\"cd-vacio\">No hay fotos esperando.</div>'}")
assert j - i < 600, j - i
t = t[:i] + '${intentar(() => window.__fotoBandeja.listaHtml(), "")}' + t[j:]
R('<button type="button" class="btn-ghost cd-big" data-cd="probar">Probar ahora</button>', '<button type="button" class="btn-ghost cd-big" data-cd="probar">Reintentar ahora</button>${intentar(() => window.__fotoBandeja.fsOk(), true) ? "" : \'<button type="button" class="btn-ghost cd-big" data-cd="fzip">⬇ Bajar mis fotos de hoy</button><div class="cd-hint c">En el navegador las fotos no se guardan solas en el celu: bajalas en un ZIP.</div>\'}')
R('if (a === "probar") { intentar(() => window.__fotosSinSenal.reintentar(true));', 'if (a === "fzip") { S.toast = "Armando el ZIP…"; S.toastTs = Date.now(); pintar(true); Promise.resolve(intentar(() => window.__fotoBandeja.zipHoy(), "")).then((m) => { S.toast = m || ""; S.toastTs = Date.now(); pintar(true); }); return; }   // v149b\n    if (a === "probar") { intentar(() => window.__fotoBandeja && window.__fotoBandeja.reintentar()); intentar(() => window.__fotosSinSenal.reintentar(true));')
# ===================================================== 6b) cámara de la barra: un error ya no es «probá de nuevo» (la foto quedó en el celu)
R('avisar(er && er.code === "permission-denied" && window.__fotoError ? window.__fotoError(er, ot)', 'avisar(er && er.bandeja && window.__fotoError ? window.__fotoError(er, ot) : er && er.code === "permission-denied" && window.__fotoError ? window.__fotoError(er, ot)')
R('"⚠ No se pudo guardar la foto: " + (er && er.code === "permission-denied" ? "no tenés permiso para esa obra." : "probá de nuevo."), true);', '"⚠ No se pudo guardar la foto: " + (er && er.code === "permission-denied" ? "no tenés permiso para esa obra." : "probá de nuevo."), !(er && er.bandeja));   // v149b')
# ===================================================== 7) Modo obra (v148): la copia del celu es la bandeja; nada se borra por un error; nada traba la fila
R('FC.poner({ id: pe.id, f, meta, otId: o.id', 'meta.__bandejaId = pe.id; FC.poner({ id: pe.id, f, meta: Object.assign({}, meta, { __bandejaId: "" }), plaza: o.plazaNombre || "", origen: "obra", otId: o.id')
i = t.index('  const FC = (() => {   // v148: copia cruda'); j = t.index('  }, 9000);\n', i) + len('  }, 9000);\n')
assert 2000 < j - i < 6000, j - i
t = t[:i] + leer('obra149b.js') + '\n' + t[j:]
# ===================================================== 8) Mis tareas clásica: «📤 Mandar lo que hice» (lo demás queda pendiente)
R('Cuando estén todas, la orden se envía sola.</div>`', 'Cuando estén todas, la orden se envía sola. Si alguna no la vas a hacer hoy, podés mandar lo que hiciste y el resto queda pendiente.</div>` + (window.__mtLoHechoHtml ? window.__mtLoHechoHtml(o) : "")')
# ===================================================== 9) módulo nuevo
R('<script id="revisarAppDiag">', '<style id="fotosSegurasCss">\n' + leer('fotos149b.css') + '\n</style>\n<script id="fotosSeguras">\n' + leer('fotos149b.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
