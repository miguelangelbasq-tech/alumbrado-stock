"""v157 · El tiempo de CADA columna (no de toda la tarea). Ángel (15/11): «si yo te digo "haceme los tableritos de 3 columnas",
   recién cuando terminan las 3 columnas le sale el horario, y eso está mal: tiene que ser en cada columna… Si te doy 3 columnas,
   tendría que tener 3 horarios. Eso es para después sacar un promedio».
 · Módulo tiempoCol (window.__tiempoCol, antes de revisarAppDiag): el fin de cada columna es la foto (o «Lista»), el inicio la
   anterior (o «Llegué» / «▶ Empecé»); «✓ Col 1 lista · 42 min» con − / + de 5 min; hora dudosa (fotos seguidas, sin inicio,
   más de 5 h) aparte; campo.pasosObra.<tarea>.<unidad> {num, ini, fin, iniTs, finTs, min, por, ts, fuente, iniFuente, v:157,
   dudosa?} y campo.horasTarea = el rango; envuelve guardarFotoObra (Mis tareas clásica y cámara B) y __cdOficinaHtml (📸
   Avance y cierre).
 · Modo obra (cuadrillaDia): la foto ya marca la columna (sin «Terminé» por columna), «▶ Empecé Col N» / «✓ Col N lista sin
   foto» / «No se hizo el resto», hoja «Así quedó cada columna» al final (minutos editables) que manda la tarea.
 · Mis tareas clásica (envioTarea): «📤 Listo, enviar esta tarea» ya no pide horas si están por columna (resumen editable).
 · Orden sugerida: medidos() usa los minutos por unidad (≥ 3 buenas); estudio() y 🧠 › ⏱ Tiempos con «Minutos por columna».
 · Verificación (v150): la hora dudosa de una columna es duda. Asistente (dormido): tiempos_por_unidad.
Pruebas viejas: __v157No (salvo v157:true). Sin reglas nuevas (todo en campo). Se reaplica con --otra-base.
Uso: python3 patch_v157.py ORIGINAL_156.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 156
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 156 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="tiempoCol"') == 0, 'ya tiene la v157'
ON = '(window.__tiempoCol && !window.__v157No)'

# 1) Modo obra: la foto marca el fin de la columna (con la hora de la foto, aunque se suba después)
R('const t0 = Date.now(), pe = {', f'const t0 = {ON} ? window.__tiempoCol.ahora() : Date.now(), pe = {{')
R('    meta.__bandejaId = pe.id; FC.poner(',
  f'    let tc = null; if ({ON}) {{ meta.__tcYa = 1; tc = intentar(() => window.__tiempoCol.marcar(o, p.k, num, t0, "foto", {{ cat, por }}), null); }}   // v157: el fin de esta columna es esta foto\n'
  '    meta.__bandejaId = pe.id; FC.poner(')
R('    if (o.estado === "Emitida") a.guardar(o, { estado: "En curso" });\n',
  '    if (o.estado === "Emitida") a.guardar(o, { estado: "En curso" });\n'
  '    if (tc && tc.hechas) a.marcar(otDe(o.id) || o, p.k, { hecho: true, cant: tc.hechas, motivo: "", nota: "" });   // v157: como el «Terminé» de cada columna de antes\n')
R('hojaFoto(o, { src: s.mini || src, num, tarea: primero(p.label), gps, enEspera: enEspera, cuenta, pe: pe.id });',
  'hojaFoto(o, { src: s.mini || src, num, tarea: primero(p.label), gps, enEspera: enEspera, cuenta, pe: pe.id, tc });')
R('<small>${esc(info.cuenta || "")}</small></div></div>',
  '<small>${esc(info.cuenta || "")}</small></div></div>${info.tc && window.__tiempoCol ? window.__tiempoCol.lineaHtml(info.tc) : ""}')
# botones chicos debajo del grande: «▶ Empecé Col N», «✓ Col N lista sin foto», «No se hizo el resto»
R('  const pasosDe = (o, k) => obj(obj(campo(o).pasosObra)[Lk(k)]);\n', '  const pasosDe = (o, k) => (window.__tiempoCol && !window.__v157No ? Object.assign({}, obj(obj(campo(o).pasosObra)[Lk(k)]), window.__tiempoCol.pend(o, k)) : obj(obj(campo(o).pasosObra)[Lk(k)]));   // v157: lo marcado en este celu cuenta aunque la orden en memoria todavía no lo tenga\n')
R('<div class="cd-pas">${pas}</div>', f'<div class="cd-pas">${{pas}}</div>${{{ON} && pa.fase !== "llegue" ? window.__tiempoCol.obraHtml(o, pa) : ""}}')
R('    if (a === "falta") return o ? hojaFalta(o) : avisar("Hoy no tenés orden.");',
  '    if ((a === "tcEmpece" || a === "tcLista" || a === "tcNoResto") && o && window.__tiempoCol) {   // v157\n'
  '      const pa = pasoActual(o); if (!pa.p || !pa.it) return pintar(true);\n'
  '      if (a === "tcEmpece") { const x = window.__tiempoCol.empece(o, pa.p.k, pa.it.num); if (x) { S.toast = "▶ Empezaste " + pa.it.num + " · " + hhmm(x.ts); S.toastTs = Date.now(); } return pintar(true); }\n'
  '      if (a === "tcLista") { const r = window.__tiempoCol.marcar(o, pa.p.k, pa.it.num, window.__tiempoCol.ahora(), "lista", { cat: pa.u.cat }); if (r) { if (o.estado === "Emitida") guardar(o, {}); API() && API().marcar(otDe(o.id) || o, pa.p.k, { hecho: true, cant: r.hechas, motivo: "", nota: "" }); window.__tiempoCol.aviso(r); } return pintar(true); }\n'
  '      HJ = { tipo: "termine", id: o.id, k: pa.p.k, num: "" }; return hojaMotivo("nohizo", "¿Por qué no se hizo el resto?", pa.p.label);\n'
  '    }\n'
  '    if (a === "falta") return o ? hojaFalta(o) : avisar("Hoy no tenés orden.");')
# la última columna: hoja con el tiempo de cada una (editable) que manda la tarea
R('if (pa.fase === "termine") { if (!pa.it && pa.u.tipo === "unidad") { marcarTareaFin(',
  f'if (pa.fase === "termine") {{ if (!pa.it && pa.u.tipo === "unidad" && {ON} && pa.u.items.some((x) => x.paso && x.paso.estado !== "no" && x.paso.v === 157)) return hojaCols(o, pa); if (!pa.it && pa.u.tipo === "unidad") {{ marcarTareaFin(')
R('  function hojaMotivo(tipo, titulo, sub) {',
  '  function hojaCols(o, pa) {   // v157: «Así quedó cada columna» (los minutos salieron solos de las fotos; − / + para corregir)\n'
  '    HJ = { tipo: "cols", id: o.id, k: pa.p.k, num: "" };\n'
  '    hoja(`<div class="v7-cab"><div><div class="cd-e2">${esc(pa.p.label)}</div><h3>Así quedó cada ${esc(pa.u.cosa === "columna" ? "columna" : pa.u.cosa)}</h3></div><button type="button" class="v7-x" data-cdh="x" aria-label="Cerrar">✕</button></div>\n'
  '${window.__tiempoCol.resumenHtml(o, pa.p.k)}<div class="cd-hmsg" id="cdHMsg"></div>\n'
  '<button type="button" class="btn-primary cd-big bverde" data-cdh="colsOk">${ic("tilde", "s22", 2.6)}Listo, mandar</button>`, "cd-ht tc-hoja");\n'
  '  }\n'
  '  function colsOk() {\n'
  '    const o = otDe(HJ.id), a = API(); if (!o || !a) return cerrarHoja();\n'
  '    const p = tareas(o).find((x) => x.k === HJ.k); if (!p) return cerrarHoja();\n'
  '    const yoN = per(), u = unidades(o, p), cant = u.items.filter((x) => x.paso && x.paso.estado !== "no").length, h = horasDe(otDe(o.id) || o, p.k);\n'
  '    a.marcar(otDe(o.id) || o, p.k, { hecho: cant > 0, cant, motivo: "", nota: "" });\n'
  '    cerrarHoja(); HJ = null;\n'
  '    const todo = marcarTareaFin(otDe(o.id) || o, p, cant > 0 ? "si" : "no");\n'
  '    avisarA(o, "📨 " + (o.plazaNombre || "Orden") + " · tarea enviada", `${primero(yoN)} · ✅ ${p.label} · ${fmtN(cant)} ${p.un || ""}${h.ini && h.fin ? " · " + h.ini + " a " + h.fin : ""} · ${o.numero || ""}`, "envio", false);\n'
  '    S.toast = todo ? "Mandaste todas las tareas de hoy" : p.label + " lista y mandada"; S.toastTs = Date.now();\n'
  '    pintar(true);\n'
  '  }\n'
  '  function hojaMotivo(tipo, titulo, sub) {')
R('      if (a === "sehizo") return seHizo();', '      if (a === "sehizo") return seHizo();\n      if (a === "colsOk") return colsOk();   // v157')

# 2) Mis tareas clásica: el cartelito de «📤 Listo, enviar esta tarea» no pide horas si ya están por columna
R('<div class="et-dur" id="etDur"></div>`;',
  '<div class="et-dur" id="etDur"></div>`;\n'
  f'      {{ const tcH = {ON} ? window.__tiempoCol.etHtml(o, p) : ""; if (tcH) cuerpo = tcH; }}   // v157: la hora de cada columna ya está (sale de las fotos)')

# 3) orden sugerida: los minutos por unidad (≥ 3 buenas) mandan sobre las horas de la tarea entera; 🧠 › ⏱ Tiempos
R('Object.keys(g).forEach((k) => { const p = prom(g[k]); if (p) out[k] = p; }); return out; }',
  f'Object.keys(g).forEach((k) => {{ const p = prom(g[k]); if (p) out[k] = p; }}); try {{ if ({ON}) Object.assign(out, window.__tiempoCol.medidos()); }} catch (e) {{ }} return out; }}   // v157')
R('txt: `Medido: ${fN(med.porHH * 2 * J)} por día con 2 (${med.n} cierres)` } : null;',
  'txt: `Medido: ${fN(med.porHH * 2 * J)} por día con 2 (${med.txtN || med.n + " cierres"})` } : null;')
R('const filas = Object.keys(g).concat(Object.keys(obj(C.angel)).length ? [] : [])',
  f'const filas = Object.keys(g).concat({ON} ? window.__tiempoCol.tareasMedidas() : [])')
R('const l = g[k], p = prom(l), d = dicc(k), an = angelPorDia(k, C);',
  f'const l = g[k] || [], pu = {ON} ? window.__tiempoCol.medidos()[k] || null : null, p = pu || prom(l), d = dicc(k), an = angelPorDia(k, C);   // v157')
R('medidoPorDia2: med, datos: l.length, usable: l.length >= 3,',
  'medidoPorDia2: med, datos: pu ? pu.n : l.length, usable: pu ? true : l.length >= 3, porUnidad: pu ? window.__tiempoCol.deTarea(k) : null,')
R('return `<div class="card"><h2>⏱ Tiempos de cada tarea',
  f'return ({ON} ? window.__tiempoCol.aprendeHtml() : "") + `<div class="card"><h2>⏱ Tiempos de cada tarea')

# 4) verificación (v150): la hora dudosa de una columna es una duda
R('fotoId: "", mini: "", dudosa: "" };\n      m.set(nk(u.num), u);',
  'fotoId: "", mini: "", dudosa: "" };\n      if (x.dudosa && x.v === 157 && !window.__v157No) u.dudosa = "hora dudosa (" + (x.dudosaMot || "sin dato") + ")";   // v157\n      m.set(nk(u.num), u);')

# 5) asistente (dormido): tiempos_por_unidad + SISTEMA
R('    "- AVANCE DE OBRA (v156): SÍ PODÉS',
  '    "- TIEMPOS (v157): la cuadrilla deja la hora de CADA columna (el fin es la foto de esa columna). Para «¿cuánto tardan en hacer un tablerito?», «¿quién es más rápido izando?» usá tiempos_por_unidad: contestá en minutos por columna con la mediana y cuántas mediciones; las dudosas no cuentan. No inventes tiempos.",\n'
  '    "- AVANCE DE OBRA (v156): SÍ PODÉS')
R('  window.__asistente = { resumenSemana,', leer('ia157.js') + '\n  window.__asistente = { resumenSemana,')

# 6) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="tiempoColCss">\n' + leer('tiempoCol.css') + '\n</style>\n<script id="tiempoCol">\n' + leer('tiempoCol.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
