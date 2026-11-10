"""v142 · La cuadrilla nueva (maquetas aprobadas por Ángel, 10/11/2026): «Modo obra» con un solo botón gigante (opción E) y
todo el recorrido del día para cuadrilla y operario (celu, app de Android y compu):
 Inicio «Hoy» → la orden del día → seguridad antes de arrancar → antes de salir (material, herramientas, aviso sin IA) →
 cómo llegar (mapa) → Modo obra (Llegué con GPS → Foto · Col N → Terminé con horas − / + → la siguiente) → falta material,
 ayuda (asistente con la tarea, cómo se hace en el paso, llamar) → fin del día → mis puntos → sin señal.
 Por dentro usa lo mismo que Mis tareas (__mtAPI: fotos con la cámara y el sello, marcas, horas por tarea, envío por tarea):
 la oficina cierra igual. Lo nuevo va en campo de la orden y en configEquipo/personal (contactos, foto de la seguridad por
 ítem, herramientas por tarea): sin reglas nuevas. La oficina lo ve en el «📸 Avance» de la orden y en el cierre.
 Las pruebas viejas no lo ven (__crewViejo, salvo crew:true en h.js).
Uso: python3 patch_v142.py ORIGINAL_141.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA_141') if os.path.exists(os.path.join(SRC, 'BASE_SHA_141')) else os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 141
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 141 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip() + '\n'
assert t.count('id="cuadrillaDia"') == 0, 'ya tiene la v142'
css, js = leer('cuadrillaDia.css'), leer('cuadrillaDia.js')
for x in (css, js): assert ':has(' not in x and '</script' not in x.replace('</script>', '')

# 1) el logo blanco del Inicio para la portada de la cuadrilla
R('window.__inicioPro = { pintar: () => pintar(true), modo,', 'window.__inicioPro = { LOGO, pintar: () => pintar(true), modo,   // v142: LOGO (portada «Hoy» de la cuadrilla)\n   ')
# 2) barra de abajo: «Hoy» de la cuadrilla lleva al Inicio «Hoy» (Mis tareas clásica queda en «Ver lista completa»)
R('hoy: { t: "Hoy", i: "hoy", ir: () => V.ir("mistareas"), on: (v) => v === "mistareas", ve: () => V.ve("mistareas"), bd: () => V.misTareasHoy() },',
  'hoy: { t: "Hoy", i: "hoy", ir: () => V.ir(window.__cdOn && window.__cdOn() ? "inicio" : "mistareas"), on: (v) => v === (window.__cdOn && window.__cdOn() ? "inicio" : "mistareas"), ve: () => V.ve(window.__cdOn && window.__cdOn() ? "inicio" : "mistareas"), bd: () => V.misTareasHoy() },   // v142')
# 3) «atrás»: las pantallas del día de la cuadrilla (orden, seguridad, salir, llegar, modo obra…) vuelven con su ‹
R('''    { id: "mtOrden", sub: "mistareas", el: () => document.querySelector("#viewMisTareas [data-mtvolver]"), abierta: (e) => e.offsetParent !== null, cerrar: (e) => e.click() },''',
  '''    { id: "mtOrden", sub: "mistareas", el: () => document.querySelector("#viewMisTareas [data-mtvolver]"), abierta: (e) => e.offsetParent !== null, cerrar: (e) => e.click() },
    { id: "cdPant", sub: "inicio", el: () => document.querySelector("#cdApp [data-cdvolver]"), abierta: (e) => e.offsetParent !== null, cerrar: (e) => e.click() },   // v142''')
# 4) asistente: sabe en qué tarea está la persona («Estás en: Izaje · Col 7»)
R(r'Pantalla abierta: ${pant || "inicio"}.\n${perm}${voz}', r'Pantalla abierta: ${pant || "inicio"}.\n${window.__iaEnObra ? "Está trabajando en obra (Modo obra): " + window.__iaEnObra + ". Contestá sobre esa tarea, corto y en pasos.\n" : ""}${perm}${voz}')
# 5) la oficina ve seguridad / salida / llegada / falta material en el «📸 Avance» de la orden y en el cierre
R("""'<div class="ao-acc">' + (fotos.length ?""", """(window.__cdOficinaHtml ? window.__cdOficinaHtml(ot) : "") + '<div class="ao-acc">' + (fotos.length ?""")
R('<ul>${n}</ul>${typeof window.medidasCierreHtml', '${window.__cdOficinaHtml ? window.__cdOficinaHtml(e) : ""}<ul>${n}</ul>${typeof window.medidasCierreHtml')
# 5b) el control de permisos por pantalla: en el Inicio de la cuadrilla nueva se trabaja como en Mis tareas (fotos, marcas, envío)
R('    return a ? z[a.id] : "inicio";', '    const r0 = a ? z[a.id] : "inicio"; return r0 === "inicio" && window.__cdOn && window.__cdOn() ? "mistareas" : r0;   // v142: Modo obra = Mis tareas')
# 6) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="cuadrillaDiaCss">\n' + css + '</style>\n<script id="cuadrillaDia">\n' + js + '</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
