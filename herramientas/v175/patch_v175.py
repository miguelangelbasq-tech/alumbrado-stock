"""v175 · El asistente carga el personal (Ángel 19/11: «la IA de la app tiene que poder cargar por su cuenta el personal»).
Herramientas nomina (leer, con lo que falta según la v174), proponer_personal (altas / cambios / bajas / recuperar con el motor
de la v174) y proponer_vehiculo; todo por la guardia __psGuardia, leído de vuelta. Chip «👷 Cargar personal». Bandera __v175No.
Uso: python3 patch_v175.py ORIGINAL_174.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 174 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
IA = open(os.path.join(SRC, 'ia175.js'), encoding='utf-8').read()
# 1) el bloque del asistente (dormido), antes de window.__asistente
R('  window.__asistente = { resumenSemana,', IA + '\n  window.__asistente = { resumenSemana,')
# 2) el botón de la tarjeta
R('P.tipo === "tareaNueva" ? "Sí, crearla" : "Sí, hacelo"', 'P.tipo === "tareaNueva" ? "Sí, crearla" : P.tipo === "personal175" || P.tipo === "vehiculo175" ? "Sí, cargarlos" : "Sí, hacelo"')
# 3) SISTEMA
R('''    ...(window.__v173No ? [] : ["- QUIÉN HACE QUÉ Y HORARIO (v173)''', '''    ...(window.__v175No ? [] : ["- PERSONAL (v175): podés cargar, corregir y dar de baja personal y vehículos con tarjeta y Sí (nomina para leer, proponer_personal, proponer_vehiculo; «recuperá lo que se borró» = proponer_personal con recuperar:true); nunca inventes legajo ni valor hora; si falta, preguntá o dejalo a completar; antes de cargar, revisá si ya existe (si la app dice «preguntar», preguntá si es la misma persona). Una baja deja a la persona «de baja», no la borra."]),
    ...(window.__v173No ? [] : ["- QUIÉN HACE QUÉ Y HORARIO (v173)''')
# 4) el motor de recuperar de la v174 expone leerMas (auditoría + último respaldo) para el asistente
if 'window.__psRec = { leerMas,' not in t:
    R('window.__psRec = { analizar,', 'window.__psRec = { leerMas, analizar,')

ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
