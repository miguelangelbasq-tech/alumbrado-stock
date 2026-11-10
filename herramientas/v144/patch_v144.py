"""v144 · Las fotos caen en la obra donde están parados (pedido de Ángel, 10/11/2026) + cámara «opción B · cámara primero»
+ «Nuestra zona» en el anillo del Inicio.
 · La obra de la foto la elige el GPS (≤ 150 m del pin de una obra), aunque la orden sea de otra; cartel «Estás en X» sin frenar.
 · La cuadrilla elige entre sus órdenes y la obra donde está; el resto con «Es otra obra (decí por qué)». Elegir a mano otra obra
   estando parado en una registrada pregunta «Estás en X, no en Y. ¿Guardo la foto en X?». GPS malo → ubicDudosa.
 · Cada foto lleva obraAuto, obraElegida, obraElegidaNombre, distObra, motivoOtra, ubicDudosa (fotosObra y adjuntos).
 · Foto sin orden → foto libre (v125) y aviso al supervisor de su orden de hoy o a la oficina (uno por persona, obra y día).
 · Modo obra (v142): «Llegué» en otra obra → «Estás en X. ¿Trabajás acá hoy?».
 · Supervisor: «Fotos que parecen de otra obra» con «Mover» / «Está bien» y «Obras sin ubicación cargada (N)».
 · Cámara B: «Cámara» abre directo la cámara de la app con la píldora de la obra, modos, «‹ Col 4 ›», disparador y «Listo».
 · Nuestra zona (configEquipo/precios.zonaContrato, de entrada A · Este): el anillo cuenta solo esa zona sobre sus módulos.
Sin reglas nuevas. Pruebas viejas: __obraGpsNo / __camViejaNo (salvo obraGps:true / camaraB:true en h.js).
Uso: python3 patch_v144.py ORIGINAL_143.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 143
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 143 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip() + '\n'
assert t.count('id="obraGps"') == 0, 'ya tiene la v144'
css, js = leer('obraGps.css'), leer('obraGps.js')
for x in (css, js): assert ':has(' not in x and '</script' not in x

# 1) cada foto de obra guarda cómo se eligió la obra (fotosObra y adjuntos; también la que queda en el celu esperando)
R('  a = a || {};\n  let t;\n  try { t = await subirAdjunto(e, { tipo: "obra"',
  '  a = a || {};\n  const __ub = (() => { try { return window.__obraGpsUbic ? window.__obraGpsUbic(a) || {} : {}; } catch (x) { return {}; } })();   // v144: obraAuto, obraElegida, distObra, motivoOtra, ubicDudosa\n  let t;\n  try { t = await subirAdjunto(e, { tipo: "obra"')
R('origen: a.origen || "" }); }\n  catch (er) {', 'origen: a.origen || "", ...__ub }); }\n  catch (er) {')
R('por: a.por || "", usuario: window.__fbUser && window.__fbUser.email || "", origen: a.origen || "" }); } catch (x) { } }',
  'por: a.por || "", usuario: window.__fbUser && window.__fbUser.email || "", origen: a.origen || "", ...__ub }); } catch (x) { } }')
R('origen: a.origen || "" };\n  let r = "";', 'origen: a.origen || "", ...__ub };\n  let r = "";')
# 2) cámara de la app: «Cámara» abre directo la cámara (opción B) y la obra se decide con el GPS al guardar
R('function abrirHoja() {\n    let e = $("ecElegir");',
  'function abrirHoja() {\n    if (window.__camB && window.__camB.activa()) { cerrarHoja(); return window.__camB.abrir(); }   // v144: cámara primero (la obra la elige el GPS)\n    let e = $("ecElegir");')
R('  async function guardarLibre(file, el) {\n',
  '  async function guardarLibre(file, el) {\n    if (el && el.__b && window.__camB) { try { el = await window.__camB.resolver(el); } catch (x) { } }   // v144: la obra donde está parado, con el GPS de este momento\n')
R('num, tarea: catTxt(el.cat || "otra"), por,', 'num, tarea: el.tareaLbl || catTxt(el.cat || "otra"), por, ...(el.k && ot ? { k: el.k } : {}), ...(el.ubic ? { ubic: el.ubic } : {}),')
R('{ por, ts: Date.now(), cat: meta.cat, num, mini: s.mini || "" } });', '{ por, ts: Date.now(), cat: meta.cat, num, mini: s.mini || "", ...(meta.k ? { k: meta.k, tarea: meta.tarea } : {}) } });')
R('{ por, ts: Date.now(), cat: meta.cat, num, mini: "" } });', '{ por, ts: Date.now(), cat: meta.cat, num, mini: "", ...(meta.k ? { k: meta.k, tarea: meta.tarea } : {}) } });')
R('      nGuardadas++;\n', '      nGuardadas++;\n      try { window.__obraGps && window.__obraGps.trasFoto(meta); } catch (x) { }   // v144: foto sin orden → aviso a la oficina\n')
R('window.camaraApp = { abrir, cerrar, usaTelefono: usarTelefono, abierta: () => !!cam, abrirHoja, guardadas: () => nGuardadas,',
  'window.camaraApp = { abrir, cerrar, usaTelefono: usarTelefono, abierta: () => !!cam, abrirHoja, guardadas: () => nGuardadas,\n'
  '    // v144: la cámara B pone lo elegido (obra, qué, columna) y abre la cámara sin la hoja; el GPS de la cámara abierta\n'
  '    pos: () => (cam && cam.pos) || null,\n'
  '    ponerElig: (o) => { elig = Object.assign(elig || { ot: "", plazaId: "", plazaNombre: "", cat: "otra", num: "" }, o || {}); const que = String(elig.num || "").trim() || catTxt(elig.cat), i = $("ecLibreIn"); if (i) { i.dataset.ecPlaza = elig.plazaNombre || ""; i.dataset.fln = que; } if (cam && cam.inp === i) { cam.ctx.plaza = elig.plazaNombre || ""; cam.ctx.que = que; try { pintarMarca(); } catch { } } return { ...elig }; },\n'
  '    abrirLibre: () => { if (!elig) return false; nGuardadas = 0; const i = inputLibre(); i.dataset.ecPlaza = elig.plazaNombre || ""; i.dataset.fln = String(elig.num || "").trim() || catTxt(elig.cat); i.click(); return true; },')
# 3) Modo obra: «Llegué» en otra obra registrada pregunta «¿Trabajás acá hoy?»
R('  function llegue(o) {\n    const fin = (p) => {',
  '  function llegue(o) {   // v144: si el GPS dice que está en otra obra registrada, pregunta antes («Estás en X. ¿Trabajás acá hoy?»)\n'
  '    const g = window.__obraGps;\n'
  '    if (g && g.on()) { const chk = (p) => { if (!(p && g.llegue(o, p))) llegue0(o); }; if (S.pos && Date.now() - S.posTs < 60000) chk(S.pos); else pedirGPS(chk); return; }\n'
  '    llegue0(o);\n  }\n  function llegue0(o) {\n    const fin = (p) => {')
# 4) Supervisor: fotos que parecen de otra obra («Mover» / «Está bien») y obras sin ubicación
R('window.__sugerida.supHallazgos() : []); }', 'window.__sugerida.supHallazgos() : []).concat(window.__obraGps ? window.__obraGps.supHallazgos() : []); }   /* v144 */')
R('data-sup="${l.indexOf(h)}">Ir</button>', 'data-sup="${l.indexOf(h)}">${esc(h.btn || "Ir")}</button>')
R('    else if (x.tipo === "aprende") { try { window.__sugerida.abrirAprende("tiempos"); } catch (e) { } }   // v143\n',
  '    else if (x.tipo === "aprende") { try { window.__sugerida.abrirAprende("tiempos"); } catch (e) { } }   // v143\n    else if (x.tipo === "obragps" || x.tipo === "obragpsSin") { try { window.__obraGps.hojaSup(x); } catch (e) { } }   // v144\n')
# 5) Nuestra zona: el anillo del Inicio cuenta solo la zona del contrato (A · Este, 18.407 módulos)
R('    let pct = 0;\n    try {\n      const t = typeof window.epecTotales == "function" ? window.epecTotales() : null;',
  '    let pct = 0, zona = null;\n    try { zona = window.__zonaContrato ? window.__zonaContrato.resumen() : null; } catch (e) { zona = null; }   // v144: solo nuestra zona\n    if (zona) pct = zona.pct;\n    else try {\n      const t = typeof window.epecTotales == "function" ? window.epecTotales() : null;')
R('return { hoy, deHoy, gente: gente.size, cerrar, pct };', 'return { hoy, deHoy, gente: gente.size, cerrar, pct, zona };')
R('function anillo(pct) {', 'function anillo(pct, z) {')
R('<span>Contrato</span></div>`;', '<span>${z ? "Zona " + esc(z.corto) : "Contrato"}</span></div>`;')
R('aria-label="Avance del contrato">${anillo(d.pct)}', 'aria-label="${esc(d.zona ? d.zona.texto : "Avance del contrato")}">${anillo(d.pct, d.zona)}')
R('<div class="ie-fecha">${DIAS[ahora.getDay()]} ${ahora.getDate()} de ${MESES[ahora.getMonth()]}</div></div>',
  '<div class="ie-fecha">${DIAS[ahora.getDay()]} ${ahora.getDate()} de ${MESES[ahora.getMonth()]}</div>${d.zona ? `<div class="ie-zona">${esc(d.zona.texto)}</div>` : ""}</div>')
R('<div class="res-lic">De la licitación entera llevamos cargados <b>${h(a)}</b> de <b>${fmt(n.modulos, 0)} módulos</b> — <b>${fmt(G, 2)}%</b> del contrato.</div>',
  '<div class="res-lic">${window.__zonaContrato ? window.__zonaContrato.lineaInicio() : `De la licitación entera llevamos cargados <b>${h(a)}</b> de <b>${fmt(n.modulos, 0)} módulos</b> — <b>${fmt(G, 2)}%</b> del contrato.`}</div>')
R('window.epecTotales = () => ({ modulos: Oe, presupuesto: We,', 'window.epecTotales = () => ({ modulos: Oe, renglones: ro.map((r) => Object.assign({}, r)), presupuesto: We,')
R('    }).join("") + i;\n  }\n  function Ga() {', '    }).join("") + i + (window.__zonaContrato ? window.__zonaContrato.selectorHtml() : "");   // v144: «Nuestra zona»\n  }\n  function Ga() {')
# 7) estilo «V1 · Turquesa del logo»: paleta, portadas y la letra Plus Jakarta Sans en toda la app (letras incrustadas, sin internet);
#    a Google Fonts solo se le sigue pidiendo Inter, que usa el sello de las fotos (no cambia) y las hojas A4 que se abren aparte
estilo = leer('estiloV1.css'); assert ':has(' not in estilo and '</style' not in estilo
R('family=Inter:opsz,wght@14..32,400..800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap',
  'family=Inter:opsz,wght@14..32,400..800&display=swap')
# 6) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="obraGpsCss">\n' + css + '</style>\n<script id="obraGps">\n' + js + '</script>\n<style id="estiloV1Css">\n' + estilo + '</style>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
