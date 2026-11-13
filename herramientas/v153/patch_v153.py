"""v153 · Corregir el cierre de una orden YA CERRADA, a mano y con el asistente (Ángel, 13/11: «NECESITO QUE LA IA PUEDA HACER
   ESAS MODIFICACIONES» — el asistente decía «desde acá no tengo cómo corregir el cierre de una orden cerrada»).
 · Un solo motor window.__corregirCierre (módulo corregirCierre, antes de revisarAppDiag): por tarea, cantidad hecha / «no se
   hizo», quiénes (de la orden o de la nómina: se suman a personal/personalNombres), puntos de esa tarea por persona (reparto
   de siempre rol × horas, con puntosDeOrden; o a mano). Recalcula cierre.puntos (lo de las otras tareas no se toca),
   puntosTarea, cantidades, hechoPersona, reparto (si estaba a mano), puntosHist; avance de la obra por el camino del cierre
   (efectosDelCierre, por partes v108; lo que baja sale de lo que sumó esa tarea), nunca dos veces; quincena cerrada y
   conforme a obra cerrado: aviso; aviso «⭐ Puntos corregidos» al celu; auditoría ot_cierre_corregido. Sin reglas nuevas.
 · A mano: «✏ Corregir cierre» al lado de «⭐ Puntos» (tablero de órdenes cerradas, Historial) y en «📋 La orden» de #peOv →
   hoja #ccOv (.v7-ov) con cada tarea, quiénes, puntos, motivo, antes → después, «Sí, corregir» y «↶ Deshacer».
 · Asistente: proponer_corregir_cierre (tarjeta antes → después, «Sí»); proponer_editar_orden sobre una cerrada con
   cantidades/quién deriva acá; usa la verificación v150 para avisar dudas en otras tareas; SISTEMA lo sabe.
Pruebas viejas: __v153No (salvo v153:true). Reemplazos chicos + un módulo: se reaplica con --otra-base.
Uso: python3 patch_v153.py ORIGINAL_152.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 152
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 152 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="corregirCierre"') == 0, 'ya tiene la v153'

# 1) «⭐ Puntos» (puntosEditar) › «📋 La orden»: el botón «✏ Corregir cierre»
R('<div class="pe-acc"><button type="button" class="btn-ghost" data-pe="cierre">✏ Abrir el cierre (cambiar lo hecho)</button>',
  '<div class="pe-acc">${window.__corregirCierre && !window.__v153No && cerrada(o) && window.__corregirCierre.puede() ? `<button type="button" class="btn-primary pe-cc" data-ccabrir="${esc(o.id)}">✏ Corregir cierre (lo hecho, quiénes y puntos)</button>` : ""}<button type="button" class="btn-ghost" data-pe="cierre">✏ Abrir el cierre (cambiar lo hecho)</button>')

# 2) asistente (código dormido): SISTEMA + proponer_corregir_cierre
R('Usá la específica antes que la genérica.",',
  'Usá la específica antes que la genérica.",\n    "- Órdenes YA CERRADAS (v153): SÍ PODÉS CORREGIR EL CIERRE con proponer_corregir_cierre: lo hecho de cada tarea («no se hizo» → hecha, 0 → 1, o al revés), quiénes la hicieron (de la orden o de la nómina) y los puntos de cada uno; la app recalcula los puntos, mueve el avance de la obra una sola vez y avisa a la gente. Nunca digas que no podés corregir una orden cerrada ni la mandes a cargarlo a mano. Antes mirá verificar_orden: si en otra tarea lo que mandó la cuadrilla no coincide con el cierre (fotos pero «no se hizo», o al revés), PREGUNTÁ si también se corrige; después proponé todo junto en UNA llamada.",')
R('  window.__asistente = { resumenSemana,', leer('ia153.js') + '\n  window.__asistente = { resumenSemana,')

# 3) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="corregirCierreCss">\n' + leer('corregirCierre.css') + '\n</style>\n<script id="corregirCierre">\n' + leer('corregirCierre.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
