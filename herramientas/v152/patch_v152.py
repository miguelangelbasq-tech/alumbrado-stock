"""v152 · Mover fotos: a mano y con el asistente (obra, columna/tipo, «Fotos sin obra», orden).
 · Por qué el asistente «no podía»: proponer_mover_fotos solo aceptaba los id que devolvía ubicar_fotos (los de ver_fotos no
   traían id → «Hay fotos que no conozco»), solo cambiaba de obra (no había columna/tipo ni orden), y no tocaba la orden: la
   foto seguía en campo.fotos de la orden de origen (seguía contando ahí para la verificación v150 y aparecía en el legajo viejo).
 · Un solo motor window.__moverFoto (módulo moverFoto, antes de revisarAppDiag): ficha fotosObra + adjunto + orden de origen y
   de destino (campo.fotos, con k/num/mini 72 px; pasosObra de Modo obra si la columna era solo de esa foto), movidaDe +
   movidaHist, auditoría foto_mover. La imagen no se mueve. Sin reglas nuevas (v128): la cuadrilla solo cambia columna/tipo
   de SUS fotos en SU orden abierta.
 · A mano: «↔ Mover» en el visor y en la selección de la galería (también «☑ Elegir fotos» del legajo), «Asignar a una obra» en
   «Fotos sin obra», «Era de otra columna» en la foto guardada de Modo obra.
 · Asistente: buscar_fotos + proponer_mover_fotos con los 4 destinos (tarjeta antes → después, «Sí»). ver_fotos manda el id.
 · El «Mover a X» del Supervisor (v144) usa el mismo motor (ahora también saca la foto de la orden de la otra obra).
Pruebas viejas: __v152No (salvo v152:true). Reemplazos chicos + un módulo: se reaplica con --otra-base.
Uso: python3 patch_v152.py ORIGINAL_151.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 151
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 151 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="moverFoto"') == 0, 'ya tiene la v152'
MF = 'window.__moverFoto && !window.__v152No'

# 1) galería (galeriaPro): «↔ Mover» en el visor y en la barra de elegir varias
R('<button type="button" data-gp="borrar" hidden>🗑<span>Borrar</span></button>',
  '<button type="button" data-gp="mover" hidden>↔<span>Mover</span></button><button type="button" data-gp="borrar" hidden>🗑<span>Borrar</span></button>')
R("V.el.querySelector('[data-gp=\"borrar\"]').hidden = !(it.id",
  "{ const mvB = V.el.querySelector('[data-gp=\"mover\"]'); if (mvB) mvB.hidden = !(it.id && " + MF + " && window.__moverFoto.puedeVer(it.id)); }   // v152\n    V.el.querySelector('[data-gp=\"borrar\"]').hidden = !(it.id")
R('      if (a === "borrar") {',
  '      if (a === "mover" && ' + MF + ') { const idM = it.id; window.__moverFoto.abrir([idM], { alListo: () => { if (V && V.items[V.i] && V.items[V.i].id === idM) { delete V.items[V.i].datos; cacheDatos.delete(idM); mostrar(); } } }); return; }   // v152\n      if (a === "borrar") {')
R('${plaza && puedeBorrar() ? `<button type="button" class="gpb-borrar"',
  '${' + MF + ' && window.__moverFoto.puedeAlguna() && [...sel.ids].every((i) => window.__moverFoto.puedeVer(i)) ? `<button type="button" data-gpb="mover" ${n ? "" : "disabled"}>↔<span>Mover</span></button>` : ""}${plaza && puedeBorrar() ? `<button type="button" class="gpb-borrar"')
R('    if (a === "compartir" || a === "bajar") return accion(a, items);',
  '    if (a === "compartir" || a === "bajar") return accion(a, items);\n    if (a === "mover" && ' + MF + ') { window.__moverFoto.abrir(items.map((i) => i.id), { alListo: () => salir() }); return; }   // v152')
R('  window.emaGaleria.elegidas = () => [...sel.ids];',
  '  window.emaGaleria.elegidas = () => [...sel.ids];\n  window.emaGaleria.olvidar = (id) => { cacheDatos.delete(id); if (V) V.items.forEach((x) => { if (x.id === id) delete x.datos; }); };   // v152: la foto se movió')

# 2) (el «☑ Elegir fotos» del legajo entra en la selección de la galería: el «↔ Mover» de #gpBarra sirve para los dos)

# 3) legajo (obrasLegajo): la ficha muestra la columna que dijo la orden (la cuadrilla no puede tocar la ficha)
R('    const a = b[t.id] || [], o = new Set(a.map((e) => e.adjId)), n = [];',
  '    const a = (b[t.id] || []).map((e) => (window.__moverFoto && !window.__v152No ? window.__moverFoto.corr(e) : e)), o = new Set(a.map((e) => e.adjId)), n = [];   // v152')

# 4) «📷 Fotos sin obra»: elegir y asignar a una obra
R('<div class="fso-acc">${fil.length && window.__iaPuede',
  '<div class="fso-acc">${' + MF + ' ? window.__moverFoto.fsoBtn(fil.length) : ""}${fil.length && window.__iaPuede')

# 5) Modo obra (cuadrillaDia): «Era de otra columna» en la foto guardada
R('<div class="cd-dosb"><button type="button" class="btn-ghost" data-cdh="otra">',
  '${' + MF + ' ? `<button type="button" class="cd-otracol" data-mfcd="${esc(o.id)}" data-mfpe="${esc(info.pe || "")}">↔ Era de otra columna</button>` : ""}<div class="cd-dosb"><button type="button" class="btn-ghost" data-cdh="otra">')

# 6) asistente (código dormido): ver_fotos con id, SISTEMA, buscar_fotos + proponer_mover_fotos nuevo
R('lista.push({ foto: lista.length + 1, cat: f.cat,', 'lista.push({ foto: lista.length + 1, id: f.adjId || f.id, cat: f.cat,')
R('    "- Fotos: ver_fotos para revisar el trabajo (si falta la jabalina, si la foto es de otra obra por la distancia); ubicar_fotos para encontrar fotos cargadas en la obra equivocada según el GPS y proponer_mover_fotos para moverlas (con tarjeta).",',
  '    "- Fotos: ver_fotos para revisar el trabajo (si falta la jabalina, si la foto es de otra obra por la distancia); ubicar_fotos para encontrar fotos cargadas en la obra equivocada según el GPS y proponer_mover_fotos para moverlas (con tarjeta). SÍ PODÉS MOVER FOTOS (v152): buscar_fotos te da los id (por obra, orden, día, persona, columna, hora, «Fotos sin obra», las N últimas) y proponer_mover_fotos las pasa a otra obra, a otra columna o tipo (Col 4 → Col 5, zanja → tablero), desde «Fotos sin obra» o a otra orden. Nunca digas que no podés mover fotos: buscalas y proponé.",')
R('  window.__asistente = { resumenSemana,', leer('ia152.js') + '\n  window.__asistente = { resumenSemana,')

# 7) Supervisor (obraGps v144): «Mover a X» con el mismo motor (también saca la foto de la orden de la otra obra)
R('  async function mover(x) {   // los mismos cambios que proponer_mover_fotos (v133): fotosObra + adjuntos con movidaDe\n',
  '  async function mover(x) {   // los mismos cambios que proponer_mover_fotos (v133): fotosObra + adjuntos con movidaDe\n'
  '    if (window.__moverFoto && !window.__v152No) {   // v152: un solo motor (ficha, adjunto y orden)\n'
  '      window.__moverFoto.recordar(x.fotos);\n'
  '      const r = await window.__moverFoto.mover(x.fotos.map((f) => f.adjId || f.id), { plazaId: String(x.otra.id) }, "ubicadas por el GPS (supervisor)", { porSupervisor: true });\n'
  '      x.fotos.forEach((f) => { if (r.movidas.some((m) => m.id === (f.adjId || f.id))) SUP.quitado[f.id] = 1; });\n'
  '      return { ok: r.ok, mal: r.mal.filter((m) => !m.igual).map((m) => /permiso/.test(m.motivo) ? "permiso" : m.motivo) };\n'
  '    }\n')

# 8) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="moverFotoCss">\n' + leer('moverFoto.css') + '\n</style>\n<script id="moverFoto">\n' + leer('moverFoto.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
