"""v176 · 🛡 Guardián de datos (Ángel 19/11, después de que el 18/11 se pisó la nómina, se vaciaron los vehículos y faltan precios:
«hay que tener algo controlador… no pueden pasar cosas así; es muy grave»). SOLO ADMINISTRACIÓN lo ve (pedido de Ángel 19/11):
 · copia de todos los días de configEquipo (personal, precios, baremo, cuadrillas, ubicacion, alias, guias, reinicios, sin sus
   respaldos[]) en adjuntos/cfg-<día> (turno con transacción en configEquipo/salud.guardian.<día>; la toma en silencio un aparato
   de Administración u Oficina); nunca se borran solas;
 · cuentas de cada lista contra la copia anterior → alerta roja (Inicio › Para atender, Supervisor «Datos», aviso al celu de los
   admin una vez por incidente) con «Ver qué cambió» y «Volver a como estaba» (casillas + «Sí», copia antes, se lee de vuelta);
 · hoja «🛡 Guardián de datos» (menú), asistente guardian / proponer_restaurar_datos (bloque ia176, dormido), la revisión con IA de
   las 12/18 h suma las alertas; auditoría config_guardar con cuentas en cada guardado de configEquipo.
Bandera __v176No. Sin reglas nuevas.
Uso: python3 patch_v176.py ORIGINAL_175.html SALIDA.html [--otra-base]"""
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
JS = open(os.path.join(SRC, 'guardianDatos.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'guardianDatos.css'), encoding='utf-8').read()
IA = open(os.path.join(SRC, 'ia176.js'), encoding='utf-8').read()

# 1) Supervisor: la línea «Datos» y a dónde lleva
R('''.concat(window.__auditAvance && !window.__v156No ? window.__auditAvance.supHallazgos() : []); }''',
  '''.concat(window.__auditAvance && !window.__v156No ? window.__auditAvance.supHallazgos() : []).concat(window.__guardian && !window.__v176No ? window.__guardian.supHallazgos() : []); }   /* v176 */''')
R('''    else if (x.tipo === "auditAvance") { try { window.__auditAvance.abrir({ obra: x.id || "" }); } catch (e) { } }   // v156''',
  '''    else if (x.tipo === "auditAvance") { try { window.__auditAvance.abrir({ obra: x.id || "" }); } catch (e) { } }   // v156
    else if (x.tipo === "guardian") { try { window.__guardian.abrir({ clave: x.clave || "" }); } catch (e) { } }   // v176''')
# 2) Inicio › Para atender (también el Inicio de Dirección de admin, v161)
R('''    if (k === "auditavance") return window.__auditAvance && window.__auditAvance.abrir({ obra: "" });   // v156''',
  '''    if (k === "auditavance") return window.__auditAvance && window.__auditAvance.abrir({ obra: "" });   // v156
    if (k === "guardian") return window.__guardian && window.__guardian.abrir();   // v176''')
R('''    try { (window.__auditAvance && !window.__v156No ? window.__auditAvance.atender() : []).forEach((x) => l.push(x)); } catch (e) { }   // v156''',
  '''    try { (window.__guardian && !window.__v176No ? window.__guardian.atender() : []).forEach((x) => l.unshift(x)); } catch (e) { }   // v176: datos borrados, primero
    try { (window.__auditAvance && !window.__v156No ? window.__auditAvance.atender() : []).forEach((x) => l.push(x)); } catch (e) { }   // v156''')
# 3) la revisión con IA de las 12/18 h suma las alertas del guardián
R('''    let avR = ""; try { avR = window.__auditAvance && !window.__v156No ? window.__auditAvance.resumenRojos() : ""; } catch (e) { avR = ""; }   // v156''',
  '''    let avR = ""; try { avR = window.__auditAvance && !window.__v156No ? window.__auditAvance.resumenRojos() : ""; } catch (e) { avR = ""; }   // v156
    try { avR += window.__guardian && !window.__v176No ? window.__guardian.resumenRojos() : ""; } catch (e) { }   // v176''')
# 4) asistente (dormido): herramientas y SISTEMA
R('  window.__asistente = { resumenSemana,', IA + '\n  window.__asistente = { resumenSemana,')
R('''    ...(window.__v173No ? [] : ["- QUIÉN HACE QUÉ Y HORARIO (v173)''', '''    ...(window.__v176No ? [] : ["- GUARDIÁN (v176, solo Administración: si no tenés la herramienta guardian, no hablés de esto): la app guarda una copia de la configuración todos los días y avisa si se borran datos (nómina, vehículos, precios, baremo, cuadrillas, pañol, obras…). Para «¿se borró algo?», «¿qué cambió desde ayer?», «¿quién guardó la nómina?» usá guardian (accion cambios con desde). Para volver lo borrado, proponer_restaurar_datos (tarjeta y Sí; nunca saca lo agregado después). Si hay alertas rojas del guardián, decilas primero. Nunca digas que algo se recuperó sin el «Sí» y la lectura de vuelta."]),
    ...(window.__v173No ? [] : ["- QUIÉN HACE QUÉ Y HORARIO (v173)''')

MOD = '<style id="guardianDatosCss">\n' + CSS + '</style>\n<script id="guardianDatos">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
