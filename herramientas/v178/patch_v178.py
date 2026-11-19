"""v178 · El asistente ve TODO y hace TODO lo de la app (Ángel 19/11: «la IA de la app tiene que saber y ver todo lo de la app,
absolutamente todo; no puede decirme que no ve; tiene que poder ver todo, saber todo y poder hacer todo»).
Solo Administración y Oficina (cada uno con sus permisos); cuadrilla, pañol, «solo mirar» y Dirección como antes.
 · consultar / describir_datos con todas las colecciones (lo que no está en memoria se lee de la base a pedido, con tope y
   paginado), leer_doc, buscar_en_todo, ver_pantalla, dato_app;
 · proponer_accion (reservas, herramientas, gastos, obra nueva, archivar/borrar obra, usuarios, punto del mapa, documentación,
   avisos de la cuadrilla, ausencias, contactos, quincena, borrar fotos, alta de producto) y proponer_editar con más
   colecciones; lo delicado pide el «Sí» dos veces;
 · __quincenas expone cerrarQ / reabrirQ (los mismos de Producción › Por quincena).
Todo dentro del asistente dormido (bloque ia178). Bandera __v178No. Sin reglas nuevas.
Uso: python3 patch_v178.py ORIGINAL_177.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 177 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
IA = open(os.path.join(SRC, 'ia178.js'), encoding='utf-8').read()

# 1) quincenas: cerrar y reabrir desde el asistente (las mismas funciones del botón de Producción)
R('  window.__quincenas = { calcular, qInfo,', '  window.__quincenas = { cerrarQ, reabrirQ, calcular, qInfo,')
# 2) asistente (dormido): el bloque y el SISTEMA
R('  window.__asistente = { resumenSemana,', IA + '\n  window.__asistente = { resumenSemana,')
R('''    ...(window.__v176No ? [] : ["- GUARDIÁN''', '''    ...(window.__v178No ? [] : ["- VER Y HACER TODO (v178; si tenés leer_doc, buscar_en_todo y proponer_accion): podés ver TODO lo de la app y hacer todo lo que la persona puede hacer en la pantalla, siempre con tarjeta y «Sí». NUNCA digas «no lo puedo ver», «no tengo acceso» ni «desde acá no puedo» sin antes buscarlo: consultar (cualquier colección; lo que no está en memoria se lee de la base), leer_doc (un documento por id, número o código), buscar_en_todo (un nombre o número en todas las colecciones), ver_pantalla (lo que la persona está mirando: usala para «esto», «esta pantalla», «¿por qué dice…?») y dato_app (pedido de compras, tablero del dueño, alertas, informe semanal, documentación, material contra avance, fotos en el celu…). Si de verdad no está, decí dónde buscaste. Para hacer: las proponer_* de siempre y proponer_accion (reservas, herramientas, gastos, obra nueva, archivar o borrar obra, usuarios, puntos del mapa, documentación en papel, avisos de la cuadrilla, ausencias, contactos, cerrar/reabrir la quincena, borrar fotos, alta de producto) o proponer_editar. Lo delicado (borrar, anular, usuarios y roles, la quincena, reiniciar puntos) la app lo pide confirmar dos veces. Lo único que nadie lee desde la app: las claves del servidor, los celulares anotados para avisos y la cola de avisos (a propósito)."]),
    ...(window.__v176No ? [] : ["- GUARDIÁN''')

ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
