"""v159 · Crear tareas nuevas con el asistente (y a mano), con los puntos calculados con la fórmula. Ángel (15/11): «también para
   crear nuevas tareas: por ahí se me van ocurriendo, se lo digo a la IA y lo tiene que calcular, y el tema de los puntos también
   calcularlo con la fórmula que dijimos, y que sea algo justo».
 · La fórmula es la del diccionario v108 (diccionarioTareas): D = min(1,8; redondeo a 1 decimal de 1 + 0,2 × factores) con los
   factores altura / pesado / riesgo eléctrico / oficio; puntos por unidad = HH × D. Se expone la MISMA función (window.__diccDif).
 · Módulo tareaNueva2 (window.__tareaNueva2, antes de revisarAppDiag): proponer (no escribe), crear / editar / baja (con «Sí», solo
   quien edita Producción), la calculadora en Producción › «＋ Crear tarea», los enganches con Llenar orden, la orden sugerida,
   Modo obra (fotos), el avance nuevo v158 y el auditor de puntos v154.
 · Baremo: registrarTareasNuevas guarda también `t159` en la tarea propia; window.__baremoInterno (S, h, aplicar, guardar) para
   editar / dar de baja por el mismo camino; al final de M() se llama a window.__tn2Aplicar(S).
 · Asistente (dormido): proponer_tarea_nueva, proponer_editar_tarea (tarjetas «Sí, crearla» / «Cambiar algo» / «No»).
Pruebas viejas: __v159No (salvo v159:true). Sin reglas nuevas (configEquipo/baremo lo escribe quien edita Producción).
Uso: python3 patch_v159.py ORIGINAL_158.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 158
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 158 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="tareaNueva2"') == 0, 'ya tiene la v159'

# 1) la fórmula del diccionario, a la vista (la misma función)
R('  L.forEach(function (x) { x.dif = dif(x); x.pts = Math.round(x.hh * x.dif * 100) / 100; });',
  '  L.forEach(function (x) { x.dif = dif(x); x.pts = Math.round(x.hh * x.dif * 100) / 100; });\n'
  '  window.__diccDif = function (f) { return dif({ f: f || {} }); };   // v159: la misma cuenta para las tareas nuevas')
# 2) baremo: t159 en la tarea propia, el gancho al final de M() y el acceso para editar / dar de baja
R('...(n.hh ? { hh: m(n.hh), f: n.f || {} } : {}) };',
  '...(n.hh ? { hh: m(n.hh), f: n.f || {} } : {}), ...(n.t159 ? { t159: n.t159 } : {}) };')
R('      }), ke();\n    }\n  }\n  function ke() {',
  '      }), ke();\n      try { window.__tn2Aplicar && window.__tn2Aplicar(S); } catch (x) { }   // v159\n    }\n  }\n  function ke() {')
R('  const qe = (e) => String(e || "").startsWith("propia_it_")',
  '  window.__baremoInterno = { S: () => S, h: () => h, aplicar: () => { M(); try { document.getElementById("baremoBody") && F(); } catch (x) { } }, guardar: async (extra) => { const n = {}; ACTIVIDADES_CATALOGO.forEach((i) => { n[i.id] = i.label; }); await window.fbBaremoGuardar(Object.assign({ baremo: h, pesos: k, tareasPropias: S, labels: n, pasos: Object.assign({}, (window.__baremoNube || {}).pasos || {}, window.__pasosEdit || {}), valorPunto: E, ts: Date.now(), usuario: (window.__fbUser || {}).email || "" }, extra || {})); } };   // v159\n'
  '  const qe = (e) => String(e || "").startsWith("propia_it_")')
# 3) las fotos de cada tarea (Modo obra / Mis tareas): la tabla, a la vista para las tareas nuevas
R('  const GENERICA = { tomas: [T("Antes de empezar", "Cómo estaba el lugar.", false), T("Trabajo terminado", "Que se vea bien lo que se hizo.")] };',
  '  const GENERICA = { tomas: [T("Antes de empezar", "Cómo estaba el lugar.", false), T("Trabajo terminado", "Que se vea bien lo que se hizo.")] };\n'
  '  window.__TAREAS_TOMAS = TAREAS;   // v159: las tareas nuevas suman sus fotos')
# 4) el avance nuevo: las cosas de las tareas nuevas
R('    const pasos = nCol ? PASOS.filter((p) => p.id !== "pat" || cols.some((c) => c.jab)) : [];',
  '    intentar(() => arr(window.__av2Glob ? window.__av2Glob() : []).forEach((g) => { if (!g || !RUBN[g.r]) return; const tot = g.q === "col" || g.q === "caja" ? nCol : g.q === "lum" ? nArt : g.q === "jab" ? nJab : g.q === "tab" ? tableros : g.q === "m" ? zanjaM : 1; if (!(tot > 0)) return; C.push({ id: "t_" + g.k, r: g.r, label: g.label, un: g.un || "", tot: r2(tot), hh: g.hh > 0 ? g.hh : 1, bin: !(g.q && g.q !== "bin"), extra: true, glob: true, ks: [g.k] }); }), null);   // v159: tareas nuevas\n'
  '    const pasos = nCol ? PASOS.filter((p) => p.id !== "pat" || cols.some((c) => c.jab)) : [];')
# 5) la orden sugerida: «quedan N de T» de las tareas nuevas (por el avance de la obra), sus columnas y sus rendimientos
R('    const o = c.o, sd = c.sd, T = sd.tareas, id = o.id, sa = obj(S.asig[id]);',
  '    const o = c.o, sd = c.sd, T = window.__tn2T ? window.__tn2T(o, sd.tareas) : sd.tareas, id = o.id, sa = obj(S.asig[id]);   // v159')
R('if (POR_COL.indexOf(k) >= 0 || (k === "montaje_luminaria" && izK',
  'if (POR_COL.indexOf(k) >= 0 || (window.__tn2PorCol && window.__tn2PorCol(k)) || (k === "montaje_luminaria" && izK')
R('  const dicc = (k) => arr(window.DICC_TAREAS).find((t) => t && t.id === k) || null;',
  '  const dicc = (k) => arr(window.DICC_TAREAS).find((t) => t && t.id === k) || (window.__tn2Dicc ? window.__tn2Dicc(k) : null) || null;   // v159: las tareas nuevas')
R('ORDEN.forEach((k) => { if (dicc(k)) s[k] = 1; });',
  'ORDEN.forEach((k) => { if (dicc(k)) s[k] = 1; }); (window.__tn2Ids ? window.__tn2Ids() : []).forEach((k) => { s[k] = 1; });')
# 6) el auditor de puntos: de dónde sale el valor de una tarea nueva
R('  function fuenteValor(k) {\n    if (String(k).indexOf("m:") === 0)',
  '  function fuenteValor(k) {\n    try { const t9 = window.__tareaNueva2 && window.__tareaNueva2.fuenteValor(k); if (t9) return t9; } catch (e) { }   // v159\n    if (String(k).indexOf("m:") === 0)')
# 7) asistente (dormido): la tarjeta y las herramientas
R('P.tipo === "cierreDia" ? "Sí, cerrar" : P.tipo === "avisoCuadrilla" ? "Sí, mandalo" : "Sí, hacelo"',
  'P.tipo === "cierreDia" ? "Sí, cerrar" : P.tipo === "avisoCuadrilla" ? "Sí, mandalo" : P.tipo === "tareaNueva" ? "Sí, crearla" : "Sí, hacelo"')
R('if (P.tipo === "sugeridas") extra = ',
  'if (P.tipo === "tareaNueva") extra = `<button type="button" class="btn-ghost" data-tn2cambiar="${P.id}">Cambiar algo</button>`;   // v159\n      if (P.tipo === "sugeridas") extra = ')
R('    "- AVANCE DE OBRA NUEVO (v158):',
  '    "- TAREAS NUEVAS (v159): SÍ PODÉS CREAR TAREAS NUEVAS con proponer_tarea_nueva (y cambiarlas o darlas de baja con proponer_editar_tarea). Los puntos se calculan con la fórmula de siempre: puntos por unidad = horas-hombre × D (D = 1 + 0,2 por cada factor: altura, pesado, riesgo eléctrico, oficio; tope 1,8). La app la compara con las parecidas (pts por hora) para que sea justa: contá la cuenta, si es justa y qué estimaste (va «estimado · a confirmar»), y preguntá lo que no sepas (por ejemplo las horas: cuánto tarda cada unidad y entre cuántos). «Media hora por columna entre dos» = minutos_por_unidad 30 y personas 2 = 1 HH. El ítem del itemizado (lo que se cobra) solo si la persona lo dice.",\n'
  '    "- AVANCE DE OBRA NUEVO (v158):')
R('  window.__asistente = { resumenSemana,', leer('ia159.js') + '\n  window.__asistente = { resumenSemana,')
# 8) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="tareaNueva2Css">\n' + leer('tareaNueva2.css') + '\n</style>\n<script id="tareaNueva2">\n' + leer('tareaNueva2.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
