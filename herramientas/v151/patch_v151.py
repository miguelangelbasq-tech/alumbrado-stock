"""v151 · «📄 Falta documentación» y «✅ Terminadas» en Avance de obra y en Obras (legajos) + ficha «📄 Documentación» del legajo.
 · Documentación completa = carpeta EPEC (fecha), conforme a obra cerrado (Avance de obra), planilla de PAT y certificado de
   instalación apta (estas dos se cargan: foto/PDF por el camino de los adjuntos —foto a R2— o «Lo tengo en papel» con fecha).
 · Terminada = el % que ya muestra la app (itemizado; si no hay, etapas) al 100 %, con la fecha del último cierre que movió el avance.
 · Falta documentación = terminadas o con avance ≥ 1 % (a confirmar) a las que les falta alguno de los 4.
 · Obras (legajos): las pestañas nuevas van junto a «En curso»; la de antes («✅ Terminadas» = ocultas) pasa a llamarse
   «🗄 Archivadas» (es lo mismo: las ocultadas en Registrar obra). Respeta el filtro de tipo y el buscador.
 · Avance de obra: fila de subíndices «📊 Avance · 📄 Falta documentación · ✅ Terminadas» debajo de Todas/Plazas/Barrios/Otras.
Sin reglas nuevas (documentos.* lo escribe quien edita Avance o Registrar obra; adjuntos como siempre). Sin APK nuevo.
Pruebas viejas: __v151No (salvo v151:true). Reemplazos chicos + un módulo antes de revisarAppDiag: se reaplica con --otra-base.
Uso: python3 patch_v151.py ORIGINAL_150.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 150 (publicada)
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 150 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="docObra"') == 0, 'ya tiene la v151'

# 1) Obras (legajos): pestañas nuevas, lista y tarjetas por los ganchos de __docObra
R('const n0 = m === "curso" ? a : o, cnt = {',
  'const DC = window.__docObra && !window.__v151No ? window.__docObra : null, n0 = DC && DC.lgModo(m) ? DC.lista(m) : m === "curso" ? a : o, cnt = {   /* v151 */')
R('.sort((r, l) => m === "curso" ?', '.sort((r, l) => DC && DC.lgModo(m) ? 0 : m === "curso" ?')
R('<button type="button" data-lgtab="terminadas" class="${m === "terminadas" ? "on" : ""}">✅ Terminadas <b>${o.length}</b></button></div>',
  '${DC ? DC.lgTabs(m) : ""}<button type="button" data-lgtab="terminadas" class="${m === "terminadas" ? "on" : ""}">${DC ? "🗄 Archivadas" : "✅ Terminadas"} <b>${o.length}</b></button></div>')
R('Las <b>terminadas</b> son las que se ocultaron en Registrar obra: quedan acá para siempre.',
  '${DC ? DC.lgNota() : "Las <b>terminadas</b> son las que se ocultaron en Registrar obra: quedan acá para siempre."}')
R('<div class="lg-lista">${c.length ? c.map((r) => {',
  '<div class="lg-lista">${c.length ? c.map((r) => {\n      if (DC && DC.lgModo(m)) return DC.lgCard(r, m);   // v151')
R('<div class="lg-vacio" style="grid-column:1/-1;">${n.length ?',
  '<div class="lg-vacio" style="grid-column:1/-1;">${DC && DC.lgModo(m) ? DC.vacio(m, n.length > 0, lt) : n.length ?')

# 2) Avance de obra: fila de subíndices y lista (la pinta __docObra; con «📊 Avance» queda todo como antes)
R('<div class="av-tipos no-print" id="avanceTipos" role="group" aria-label="Tipo de obra"></div>',
  '<div class="av-tipos no-print" id="avanceTipos" role="group" aria-label="Tipo de obra"></div>\n<div class="av-tipos no-print dc-tabs" id="avDocTabs" role="group" aria-label="Qué obras ver" hidden></div>\n<div class="no-print" id="avDocLista" hidden></div>')
R('  avTp && (avTp.innerHTML = avanceTiposHtml());',
  '  avTp && (avTp.innerHTML = avanceTiposHtml());\n  try { window.__docObra && window.__docObra.pintarAvance(); } catch (eDc) { }   // v151: Falta documentación / Terminadas')

# 3) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="docObraCss">\n' + leer('docObra.css') + '\n</style>\n<script id="docObra">\n' + leer('docObra.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
