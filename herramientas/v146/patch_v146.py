"""v146 · Cierre del día por voz (maqueta i3) + pedido de compras automático (i4) + tablero del dueño (i5)
+ «lo no terminado de hoy pasa solo a mañana» (agregado de Ángel, pasó de la v145).
 · cierreVoz: «✨ Cerrar el día por voz» (Órdenes › Para revisar y cerrar / Hoy) y chip «🎙 Cerrar el día» en el Asistente;
   el contexto lleva las órdenes del día ya prellenadas con lo que mandó la cuadrilla; herramienta proponer_cierre_dia
   (código dormido) → tarjeta antes → después → «Sí, cerrar» = cierre de siempre + «lo que falta a otro día» (v128).
 · pedidoCompras: Pañol › Lista de compras › «🧾 Pedido de compras sugerido» (bajo mínimo, se acabó, obras programadas 7 días,
   menos stock libre y lo ya pedido), por proveedor, hoja A4 con o sin precios, guardar con «Sí» (adjuntos tipo pedidoCompra).
 · tableroDueno: «📊 Tablero del dueño» (menú e Inicio Ejecutivo › Accesos), solo admin y habilitados; «✨ Resumen de la semana».
 · pasarManana: a las 18:00 (o al cerrar la orden de hoy) lo no terminado se suma a la orden emitida de mañana de la obra
   (o al borrador de la sugerida), una sola vez (transacción en configEquipo/salud), aviso con «Deshacer», ajuste
   automático / preguntarme / no.
Sin reglas nuevas. Pruebas viejas: window.__v146No (salvo v146:true en h.js).
Uso: python3 patch_v146.py ORIGINAL_145.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 145
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 145 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip() + '\n'
assert t.count('id="cierreVoz"') == 0, 'ya tiene la v146'
css, cv, pc, td, pm, ia = leer('v146.css'), leer('cierreVoz.js'), leer('pedidoCompras.js'), leer('tableroDueno.js'), leer('pasarManana.js'), leer('ia146.js')
for x in (css, cv, pc, td, pm, ia): assert ':has(' not in x and '</script' not in x and '?.' not in x and '??' not in x

# 1) asistente (código dormido): el contexto del cierre por voz, la herramienta, la tarjeta y el resumen de la semana
R('${perm}${voz}`;', '${perm}${voz}${window.__cierreVoz ? window.__cierreVoz.ctx() : ""}`;   // v146: cierre del día por voz')
R('  window.__asistente = { informeMaterial, revisarSugerida,', ia + '  window.__asistente = { resumenSemana, informeMaterial, revisarSugerida,')
R('      pie = d.pie || "";', '      if (d.html) h += d.html;   // v146: cierre por voz (personas y lo que queda de cada orden)\n      if (P.tipo === "cierreDia" && (d.avisos || []).length) h += f("⚠", esc(d.avisos.join(" · ")));\n      pie = d.pie || "";')
R('if (P.tipo !== "cierre" || !d.rapido) return `<button type="button" class="btn-primary" data-iasi="${P.id}">Sí, hacelo</button>`;',
  'if (P.tipo !== "cierre" || !d.rapido) return `<button type="button" class="btn-primary" data-iasi="${P.id}">${P.tipo === "cierreDia" ? "Sí, cerrar" : "Sí, hacelo"}</button>`;   // v146')
# 2) Órdenes › Para revisar y cerrar (y Hoy): «✨ Cerrar el día por voz»
R('<div class="tb-ayuda">${esc(AYUDA[st.tab])}</div>`;', '<div class="tb-ayuda">${esc(AYUDA[st.tab])}</div>${(st.tab === "revisar" || st.tab === "obra") && window.__cierreVoz ? window.__cierreVoz.botonHtml() : ""}`;   // v146')
# 3) Inicio Ejecutivo › Accesos: «📊 Tablero del dueño»
R('<div class="ie-accs">${l.map(([v, i, t])', '<div class="ie-accs">${window.__tableroDueno ? window.__tableroDueno.accesoHtml() : ""}${l.map(([v, i, t])')
# 4) orden sugerida: ajuste «Pasar lo no terminado a mañana»
R('avisoEmitir: true, recordatorio: true, sinTareaAviso: true, sinTareaHora: "17:00",', 'avisoEmitir: true, recordatorio: true, sinTareaAviso: true, sinTareaHora: "17:00", pasarModo: "auto", pasarHora: "18:00",   // v146')
R('${window.__sinTarea ? window.__sinTarea.cfgHtml(C) : ""}', '${window.__sinTarea ? window.__sinTarea.cfgHtml(C) : ""}${window.__pasarManana ? window.__pasarManana.cfgHtml(C) : ""}')
# 5) los módulos nuevos (antes del último script)
R('<script id="revisarAppDiag">', '<style id="v146Css">\n' + css + '</style>\n<script id="cierreVoz">\n' + cv + '</script>\n<script id="pedidoCompras">\n' + pc + '</script>\n<script id="tableroDueno">\n' + td + '</script>\n<script id="pasarManana">\n' + pm + '</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
