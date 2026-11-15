"""v158 · Avance de obra nuevo: detallado por rubro y por columna, se mueve solo con las órdenes. Ángel (15/11): «la A con la
   grilla de la C adentro. Hacelo… Las tareas que no existen hay que agregarlas todas… El % de la obra NO sale más del itemizado:
   es el avance de la obra… cuando se tiene que mover el avance de obra es según las órdenes de trabajo… Lo mismo con las fallas».
 · Módulo avanceObra2 (window.__av2, antes de revisarAppDiag): qué lleva la obra (columnas con sus pasos y piezas + civil,
   cableado, PAT, tablero, pruebas y cierre), estado de cada cosa de memoria (órdenes: pasosObra, fotos con su columna, marcas,
   cierre; «5 columnas» sin decir cuáles → las siguientes que faltan; fallas; fraguando; piezas; lo marcado a mano en
   avanceObras.av2 con motivo e historial), % por horas-hombre del diccionario (a confirmar) = el % de toda la app
   (calcularAvanceEtapasPct); el del itemizado sigue en la plata y en «🧾 Ver itemizado». Pantalla A con la grilla C adentro.
 · Tareas nuevas en DICC_TAREAS (noAvanza del itemizado, sí del avance nuevo) con pasos y fotos «a confirmar».
 · Auditor v156: % del avance ≠ itemizado, misma columna en dos órdenes, fallas. Asistente (dormido): avance_obra,
   proponer_marcar_avance; auditar_avance con obra suma el avance nuevo.
Pruebas viejas: __v158No (salvo v158:true). Sin reglas nuevas (avanceObras lo edita quien edita Avance). Se reaplica con --otra-base.
Uso: python3 patch_v158.py ORIGINAL_157.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 157
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 157 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="avanceObra2"') == 0, 'ya tiene la v158'

# 1) tareas nuevas en el diccionario (con sus pasos «a confirmar»)
R('    t("reparacion_falla", "Búsqueda y reparación de falla", VA, "falla", 3, S, N, S, S, { noAvanza: true }),\n',
  '    t("reparacion_falla", "Búsqueda y reparación de falla", VA, "falla", 3, S, N, S, S, { noAvanza: true }),\n' + leer('tareas158.js') + '\n')
R('if (!ya[x.id]) { cat.push({ id: x.id, label: x.label, pasos: "" });',
  'if (!ya[x.id]) { cat.push({ id: x.id, label: x.label, pasos: x.pasos || "" });')
# fotos que pide cada tarea nueva
R('    poda: { tomas: [T("Antes de podar"',
  '    // v158: tareas nuevas (fotos a confirmar)\n'
  '    inspeccion_interna: { tomas: [T("Lo observado", "Cada cosa que está mal o falta.", false), T("Obra recorrida", "Vista general de la obra.")] },\n'
  '    plano_conforme: { tomas: [T("Plano terminado", "La hoja del plano o la pantalla con el plano.")] },\n'
  '    certificado_instalacion: { tomas: [T("Certificado firmado", "Que se lea.")] },\n'
  '    carpeta_epec: { tomas: [T("Carpeta presentada", "El sello o la constancia de EPEC.")] },\n'
  '    conexion_epec: { tomas: [T("Medidor conectado", "El medidor con la acometida a la vista.")] },\n'
  '    prensacables: { tomas: [T("Prensacables colocados", "Que se vean ajustados.")] },\n'
  '    morsetos_terminales: { tomas: [T("Morsetos y terminales", "Los morsetos de la acometida y los terminales en el NH.")] },\n'
  '    rehacer_falla: { tomas: [T("Cómo quedó", "Lo que se rehizo.")] },\n'
  '    acabado_pozo: { ayuda: "En cada pozo: sin molde ni telgopor, con la arena y el sello." },\n'
  '    fusibles_borneras: { ayuda: "En cada caja: abierta, con las borneras (gris, celeste, verde) y los fusibles puestos." },\n'
  '    subida_cable: { ayuda: "En cada columna: el cable de subida con su prensacable." },\n'
  '    poda: { tomas: [T("Antes de podar"')

# 2) asistente (dormido): avance_obra, proponer_marcar_avance + SISTEMA
R('    "- AVANCE DE OBRA (v156): SÍ PODÉS',
  '    "- AVANCE DE OBRA NUEVO (v158): el % de la obra sale de las órdenes (lo que va haciendo la gente), no del itemizado (que es lo que se cobra). Para «¿qué le falta a la Col 4?», «¿cuánto va?», «¿está terminada?» usá avance_obra (exacto, por columna y por pieza). Para marcar a mano (hecho, no se hizo, se arruinó, observado, una pieza que falta, varias columnas juntas) usá proponer_marcar_avance con el motivo que diga la persona (nunca lo inventes).",\n'
  '    "- AVANCE DE OBRA (v156): SÍ PODÉS')
R('  window.__asistente = { resumenSemana,', leer('ia158.js') + '\n  window.__asistente = { resumenSemana,')

# 3) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="avanceObra2Css">\n' + leer('avanceObra2.css') + '\n</style>\n<script id="avanceObra2">\n' + leer('avanceObra2.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
