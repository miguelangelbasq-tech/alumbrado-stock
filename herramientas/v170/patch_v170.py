"""v170 · Avance de obra: carga rápida a mano (Ángel 18/11: «en avance de obra no se puede editar… está difícil entrar a columna.
   Y poder poner: ya pusieron diez columnas — y un cartel: eso significa que las bases y el hormigón están hechas… columnas todas
   puestas o solo 8 de 10, pero editado rápido. Sacar el cartel que te pide explicaciones por ahora»).
 · Tarjeta «✏ Carga rápida» (cada paso: Todas / Ninguna / − N + «de 12» + «Listo»; las cosas sin columna igual), cascada con cartel
   («… también marca pozo y hormigón de esas 10 (ya fraguado)» Sí / Solo el izaje), sacar con «¿También los pasos que siguen?»,
   grilla «✏ Tocar marca» (tocar = marcar/sacar; mantener apretado = la hoja), «↶ Deshacer» 10 s.
 · Motivo: por ahora no se pide (queda «Carga rápida del avance»); Administración: «Pedir motivo al cambiar el avance a mano: Sí»
   (configEquipo/baremo.avanceMotivo). El ítem por ítem del itemizado (v156, #aaMotOv) sigue el mismo ajuste; el asistente no.
Pruebas viejas: __v170No (lo pone el arnés salvo v170:true) → todo como la v169. Sin reglas nuevas.
Uso: python3 patch_v170.py ORIGINAL_169.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 169
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 169 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'rapido.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'rapido.css'), encoding='utf-8').read()

# ============================================================== avanceObra2: el motivo según el ajuste (de entrada, no se pide)
R('  const off3 = () => !!(window.__v158No || window.__v163No);   // v163: puesta al día y hormigón a mano sin fraguado\n',
  '  const off3 = () => !!(window.__v158No || window.__v163No);   // v163: puesta al día y hormigón a mano sin fraguado\n'
  '  const pideMot = () => (typeof window.__avMotivoPide == "function" ? window.__avMotivoPide() : true), MOT_RAP = "Carga rápida del avance";   // v170: el motivo, solo si Administración lo pide\n')
R('motivo = String(motivo || "").trim(); if (motivo.length < 3) return { ok: false, txt: "Escribí el motivo (queda en el historial de la obra)." };',
  'motivo = String(motivo || "").trim(); if (motivo.length < 3 && !op.porAsistente && !pideMot()) motivo = MOT_RAP; if (motivo.length < 3) return { ok: false, txt: "Escribí el motivo (queda en el historial de la obra)." };')
R('const motivoInput = () => (puede() ? `', 'const motivoInput = () => (puede() && pideMot() ? `')
R('<label for="a2SelMot" class="a2-lbl">Motivo (obligatorio, queda en el historial)</label><input id="a2SelMot" type="text" maxlength="200" placeholder="Ej: lo hicieron sin orden, lo vi en obra" autocomplete="off" value="${esc(st.selMot || "")}">',
  '${pideMot() ? `<label for="a2SelMot" class="a2-lbl">Motivo (obligatorio, queda en el historial)</label><input id="a2SelMot" type="text" maxlength="200" placeholder="Ej: lo hicieron sin orden, lo vi en obra" autocomplete="off" value="${esc(st.selMot || "")}">` : ""}')
R('''    const mot = String((($(motivoSel || "a2Mot") || {}).value) || "").trim();
    if (P.err) { hmsg(P.err, true); msgPant(P.err); return null; }
    if (mot.length < 3) {''', '''    let mot = String((($(motivoSel || "a2Mot") || {}).value) || "").trim();
    if (P.err) { hmsg(P.err, true); msgPant(P.err); return null; }
    if (mot.length < 3 && !pideMot()) mot = MOT_RAP;   // v170
    if (mot.length < 3) {''')
R('if (a === "agregarOk") { const mot = String(($("a2Mot") || {}).value || "").trim(); if (mot.length < 3) return hmsg("Escribí el motivo.", true);',
  'if (a === "agregarOk") { let mot = String(($("a2Mot") || {}).value || "").trim(); if (mot.length < 3 && !pideMot()) mot = MOT_RAP; if (mot.length < 3) return hmsg("Escribí el motivo.", true);')
R('<label for="pdMot" class="a2-lbl">Motivo (obligatorio, queda en el historial)</label>', '<label for="pdMot" class="a2-lbl">Motivo (${pideMot() ? "obligatorio" : "opcional"}, queda en el historial)</label>')
R('''      const mot = String(PD.mot || "").trim();
      if (mot.length < 3) { hmsg("Escribí el motivo (queda en el historial).", true); const i = $("pdMot");''', '''      let mot = String(PD.mot || "").trim();
      if (mot.length < 3 && !pideMot()) mot = MOT_RAP;   // v170
      if (mot.length < 3) { hmsg("Escribí el motivo (queda en el historial).", true); const i = $("pdMot");''')

# ============================================================== la grilla: «✏ Tocar marca» (tocar = marcar / sacar sin hoja)
R('    if (a === "cel") { if (st.sel) {', '    if (a === "cel" && window.__avRap && window.__avRap.celda(t)) return;   // v170: tocar marca / saca\n    if (a === "cel") { if (st.sel) {')
R('return `<div class="a2-grilla"><div class="a2-gtit"><span>Columna por columna${sel ? " · tocá el nombre para elegir" : " · tocá una"}</span>${barraSel}</div>',
  'const rapOn = !sel && !!(window.__avRapToque && window.__avRapToque());   // v170\n    return `<div class="a2-grilla${rapOn ? " a2-rapon" : ""}"><div class="a2-gtit"><span>Columna por columna${sel ? " · tocá el nombre para elegir" : rapOn ? " · tocá para marcar o sacar (mantené apretado para ver)" : " · tocá una"}</span>${!sel && window.__avRapGrilla ? window.__avRapGrilla() : ""}${barraSel}</div>')

# ============================================================== la tarjeta «✏ Carga rápida» arriba del avance
R('return `${flashHtml(E, T)}<div class="a2-cuerpo"><div class="a2-izq">${tiempoHtml(E, T)}', 'return `${flashHtml(E, T)}<div class="a2-cuerpo"><div class="a2-izq">${window.__avRapHtml ? window.__avRapHtml(E) : ""}${tiempoHtml(E, T)}')
# lo cargado rápido no tiene fecha real (como la puesta al día): sin «Lo último que pasó» para las cosas y con su nombre
R('if (r.man && r.man.e === "cant") l.push({', 'if (r.man && r.man.e === "cant" && !(r.man.pd && r.man.rapido && !window.__v170No)) l.push({')
R('if (r.pd && r.e === "mano" && !off3()) return `Puesta al día (ya estaba hecho) · ', 'if (r.pd && r.e === "mano" && !off3()) return `${r.rapido && !window.__v170No ? "Carga rápida (ya estaba hecho)" : "Puesta al día (ya estaba hecho)"} · ')
R('abrirColumna: hojaColumna, cerrarHoja,', 'abrirColumna: hojaColumna, hojaCelda, hojaCosa, cerrarHoja,')

# ============================================================== v156: el motivo del ítem por ítem sigue el mismo ajuste
R('    if (ultMot.k === k && Date.now() - ultMot.ts < 180000 && ultMot.m) return seguir(ultMot.m);   // mismo ítem al rato: mismo motivo',
  '    if (typeof window.__avMotivoPide == "function" && !window.__avMotivoPide()) return seguir("Carga rápida del avance");   // v170: por ahora sin pedir el motivo\n'
  '    if (ultMot.k === k && Date.now() - ultMot.ts < 180000 && ultMot.m) return seguir(ultMot.m);   // mismo ítem al rato: mismo motivo')

# ============================================================== el módulo
MOD = '<style id="avanceRapidoCss">\n' + CSS + '</style>\n<script id="avanceRapido">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
