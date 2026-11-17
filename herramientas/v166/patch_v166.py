"""v166 · «▶ Voy a iniciar» y el tiempo de cada columna también en Mis tareas (la lista) (Ángel 17/11, con la v165 en los
   celus: «a los chicos no les sale eso del tiempo ni nada»). Los chicos sacan las fotos desde Mis tareas («Ver lista completa»),
   no desde Modo obra, y la v165 solo enganchaba el botón grande de Modo obra.
 · El primer 📷 (o «Se hizo», o «▶ Voy a iniciar esta tarea» de la cabecera) de una tarea sin arrancar abre el mismo cartel de la
   v165; «Voy a iniciar» anota campo.tareaInicio / colInicio para todos y sigue con la cámara de esa fila (la de la app o la del
   teléfono / APK: el mismo clic de siempre). «Todavía no» deja sacar la foto sin anotar (15 min sin volver a preguntar).
 · Cabecera de la tarea: «▶ Voy a iniciar esta tarea» o «▶ En marcha desde 08:20 · 12 min».
 · Cada fila con foto: «✓ Col 1 lista · 42 min» con «cambiar» (− / +) en la plantilla de la lista de fotos; las filas que
   faltan siguen las columnas que eligió la oficina (ot.columnas).
 · La foto de Mis tareas pasa por __tiempoCol.marcar (la que envuelve la v165): récord de cada columna; al mandar la tarea, el
   récord de las tareas sin columnas, campo.tareaFin y las felicitaciones.
Pruebas viejas: __v166No (lo pone el arnés salvo v166:true) → todo como la v165. Sin reglas nuevas.
Uso: python3 patch_v166.py ORIGINAL_165.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 165
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 165 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'inicioMt.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'inicioMt.css'), encoding='utf-8').read()

# ============================================================== inicioTarea (v165): el cartel también desde Mis tareas
R('function cartel(o, p, it, vista) {', 'function cartel(o, p, it, vista, seguir, todavia) {')
R('S.ini = { otId: o.id, k: p.k, num: it ? it.num : "", elegida',
  'const prv = S.ini && S.ini.otId === o.id && S.ini.k === p.k ? S.ini : null;   // v166: lo que sigue después (Mis tareas) se conserva al ir a «¿Es otra tarea?»\n'
  '    S.ini = { seguir: seguir || (prv && prv.seguir) || null, todavia: todavia || (prv && prv.todavia) || null, otId: o.id, k: p.k, num: it ? it.num : prv && prv.seguir ? prv.num : "", elegida')
R('if (a === "x") { const v = b.closest(".v7-ov");',
  'if (a === "x" && !window.__v166No && I && I.todavia && b.classList.contains("vi-no")) { const f = I.todavia; S.ini = null; cerrar(); f(); return; }   // v166: «Todavía no» desde Mis tareas: sigue con la foto sin anotar\n'
  '    if (a === "x") { const v = b.closest(".v7-ov");')
R('const el = I.elegida, p0 = tareas(o).find((x) => x.k === (el ? el.k : I.k));\n      cerrar("viOv");',
  'const el = I.elegida, p0 = tareas(o).find((x) => x.k === (el ? el.k : I.k));\n      cerrar("viOv");\n'
  '      if (I.seguir && !window.__v166No) { const f = I.seguir; S.ini = null; if (intentar(() => f(o, p0, el), false)) return; }   // v166: desde Mis tareas sigue con lo que la persona quería hacer')
R('camC, inicioDe, finDe, extras,',
  'camC, inicioDe, finDe, extras,\n'
  '    cartelMt: (o, p, it, seguir, todavia) => { if (!o || !p) return; S.ini = null; cartel(o, p, it || null, "si", seguir, todavia); },   // v166\n'
  '    memIni: (o, k, t0) => { if (o && !inicioDe(o, k)) S.mem[o.id + "|" + Lk(k)] = { ts: t0 || ahora(), por: per() }; }, esCrew: crew, tareasDe: tareas, envDe,')

# ============================================================== tiempoCol (v157): la foto de Mis tareas pasa por __tiempoCol.marcar (la envuelve la v165: récords)
R('const r = marcar(o, meta.k, meta.num, ahora(), "foto", { cat: meta.cat, por: meta.por });',
  'const r = (!window.__v166No && window.__tiempoCol && window.__tiempoCol.marcar ? window.__tiempoCol.marcar : marcar)(o, meta.k, meta.num, ahora(), "foto", { cat: meta.cat, por: meta.por });')

# ============================================================== la lista de fotos de Mis tareas: el tiempo de cada fila y las columnas de la orden
R('const libres = lista.filter((n) => !yaObra.has(normP(n)) && !usados.has(normP(n)));',
  'const colsOt = window.__mtColsOt ? window.__mtColsOt(ot, tarea.k) : [];   // v166: las columnas que eligió la oficina (ot.columnas, v165)\n'
  '    const libres = colsOt.length ? colsOt.filter((n) => !usados.has(normP(n))) : lista.filter((n) => !yaObra.has(normP(n)) && !usados.has(normP(n)));')
R('style="display:none;"></label>` : ""}</div>`; });',
  'style="display:none;"></label>` : ""}${window.__mtFilaTiempo ? window.__mtFilaTiempo(ot, tarea, x.num) : ""}</div>`; });')

R('data-flcam="1">📷${primera ? " Elegir y sacar la foto" : ""}</button>${camara(f)}`}</div>`;',
  'data-flcam="1">📷${primera ? " Elegir y sacar la foto" : ""}</button>${camara(f)}`}${primera && window.__mtFilaCorre ? window.__mtFilaCorre(ot, tarea, f.n) : ""}</div>`;')   # v166: «⏱ corriendo» en la que sigue

# ============================================================== el módulo
MOD = '<style id="inicioMtCss">\n' + CSS + '</style>\n<script id="inicioMt">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
