"""v180 · 🗂 Carpetas de obra: unir duplicadas, mover cosas sueltas a otra obra y eliminar las vacías (Ángel 19/11: «en carpetas
a veces se crean por error o son duplicados; hay que poner la posibilidad de mover o eliminar carpeta, mover órdenes, fotos, todo»).
Módulo `carpetasObra` (+ CSS) antes de revisarAppDiag, bloque `ia180` del asistente (dormido), botones de la tarjeta, SISTEMA,
la línea del Supervisor. Sin reglas nuevas. Bandera __v180No.
Uso: python3 patch_v180.py ORIGINAL_ENTRADA.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la base (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read()
JS, CSS, IA = leer('carpetas.js'), leer('carpetas.css'), leer('ia180.js')
# 1) el módulo y su estilo, antes del último script
R('<script id="revisarAppDiag">', '<style id="carpetasObraCss">\n' + CSS + '</style>\n<script id="carpetasObra">\n' + JS + '</script>\n<script id="revisarAppDiag">')
# 2) el asistente (dormido), antes de window.__asistente
R('  window.__asistente = { resumenSemana,', IA + '\n  window.__asistente = { resumenSemana,')
# 3) el botón de la tarjeta
R('P.tipo === "personal175" || P.tipo === "vehiculo175" ? "Sí, cargarlos"', 'P.tipo === "unir180" ? "Sí, unir" : P.tipo === "mover180" ? "Sí, mover" : P.tipo === "eliminar180" ? "Sí, eliminar" : P.tipo === "personal175" || P.tipo === "vehiculo175" ? "Sí, cargarlos"')
# 4) SISTEMA
R('    ...(window.__v175No ? [] : ["- PERSONAL (v175)', '''    ...(window.__v180No ? [] : ["- CARPETAS DE OBRA (v180): una «carpeta» es una obra (su legajo). SÍ PODÉS unir obras repetidas (proponer_unir_obras: todo pasa a la buena y la otra queda ARCHIVADA, nunca se borra, se puede deshacer), pasar órdenes, fotos, vales, reservas, cálculos, gastos y planos de una obra a otra (proponer_mover_a_obra) y eliminar una carpeta VACÍA (proponer_eliminar_obra; si tiene algo, no se puede: ofrecé unir o archivar). Antes mirá revisar_carpetas (duplicadas, vacías, inventario). Los avisos de la cuadrilla no se cambian de obra (reglas). Unir y eliminar piden una segunda confirmación en la app."]),
    ...(window.__v175No ? [] : ["- PERSONAL (v175)''')
# 5) Dirección no recibe revisar_carpetas (es de la oficina)
R('x !== "avisar_oficina" && x !== "mis_avisos")', 'x !== "avisar_oficina" && x !== "mis_avisos" && x !== "revisar_carpetas")')
# 6) Supervisor: posibles duplicadas y uniones a mitad
R('.concat(window.__guardian && !window.__v176No ? window.__guardian.supHallazgos() : []); }', '.concat(window.__guardian && !window.__v176No ? window.__guardian.supHallazgos() : []).concat(window.__carpetas && !window.__v180No ? window.__carpetas.supHallazgos() : []); }   /* v180 */')
R('    else if (x.tipo === "guardian") { try { window.__guardian.abrir({ clave: x.clave || "" }); } catch (e) { } }   // v176\n',
  '    else if (x.tipo === "guardian") { try { window.__guardian.abrir({ clave: x.clave || "" }); } catch (e) { } }   // v176\n    else if (x.tipo === "carpetas") { try { window.__carpetas.abrir({ modo: "dup" }); } catch (e) { } }   // v180\n')

ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
