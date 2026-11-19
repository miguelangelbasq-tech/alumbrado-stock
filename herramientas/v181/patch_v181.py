"""v181 · 📜 Registro de cambios en el Guardián de datos (Ángel 19/11: «cada modificación, cada cambio —letra, color, nombre—,
si se borra algo de la app, tiene que quedar registrado en la app qué es lo que se hizo y quién lo hizo, en el Guardián»).
 · módulo registroCambios (temprano, justo antes de lecturasCuenta: envuelve UNA vez los caminos de escritura de Firestore —set,
   update, delete, add, lotes y transacciones— y las escuchas, para tener el «antes» de lo que ya está en memoria);
 · lo de unos segundos va en UN documento de auditoria (accion "cambios_app", sin reglas nuevas); la cuadrilla por minuto;
   sin ruido (latidos, ubicación, turnos, avisos, la propia auditoría, secretos);
 · Guardián › «📜 Historial de cambios» (solo Administración): filtros, antes → después, «Volver este cambio» con «Sí», Excel/PDF;
   las alertas del Guardián llevan a los cambios que las causaron;
 · asistente historial_cambios / proponer_revertir_cambio (bloque ia181, dormido, solo Administración).
Bandera __v181No. Sin reglas nuevas.
Uso: python3 patch_v181.py ORIGINAL_base.html SALIDA.html [--otra-base]"""
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
JS = open(os.path.join(SRC, 'registroCambios.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'registroCambios.css'), encoding='utf-8').read()
IA = open(os.path.join(SRC, 'ia181.js'), encoding='utf-8').read()

# 1) el módulo, temprano (después del SDK de Firebase, antes de que la app abra sus escuchas)
MOD = '<style id="registroCambiosCss">\n' + CSS + '</style>\n<script id="registroCambios">\n' + JS + '</script>\n'
R('<script id="lecturasCuenta">', MOD + '<script id="lecturasCuenta">')
# 2) Guardián: botón «📜 Historial de cambios» y, en cada alerta, «📜 Quién lo cambió» (los cambios que la causaron)
R('''    let h = "";
    h += al.length ?''', '''    let h = window.__regCambios && !window.__v181No ? window.__regCambios.botonGuardian() : "";   // v181
    h += al.length ?''')
R('''data-gd="ver:${esc(a.clave)}">Ver qué cambió</button>''',
  '''data-gd="ver:${esc(a.clave)}">Ver qué cambió</button>${window.__regCambios && !window.__v181No ? `<button type="button" class="btn-ghost" data-rc="alerta:${esc(a.clave)}">📜 Quién lo cambió</button>` : ""}''')
R('''data-gd="verA:${esc(a.clave)}">Ver</button></div>`; });''',
  '''data-gd="verA:${esc(a.clave)}">Ver</button>${window.__regCambios && !window.__v181No ? ` <button type="button" class="btn-ghost gd-chico" data-rc="alerta:${esc(a.clave)}">📜 Quién</button>` : ""}</div>`; });''')
# 3) asistente (dormido): herramientas y SISTEMA
R('  window.__asistente = { resumenSemana,', IA + '\n  window.__asistente = { resumenSemana,')
R('''    ...(window.__v176No ? [] : ["- GUARDIÁN''', '''    ...(window.__v181No ? [] : ["- HISTORIAL DE CAMBIOS (v181, solo Administración: si no tenés historial_cambios, no hablés de esto): la app anota cada cambio, alta o borrado (quién, cuándo, en qué pantalla, si fue el asistente o algo automático, y cada dato antes → después). Para «¿quién cambió X?», «¿qué se cambió ayer?», «¿qué hizo Fulano?», «¿quién borró…?» usá historial_cambios; para volver uno, proponer_revertir_cambio (tarjeta y Sí). Si una alerta del Guardián dice que se borraron datos, buscá con historial_cambios quién lo hizo. El registro arranca con la v181: de antes no hay."]),
    ...(window.__v176No ? [] : ["- GUARDIÁN''')

ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
