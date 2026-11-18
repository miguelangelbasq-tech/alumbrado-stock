"""v171 · «＋ Otra foto» en Mis tareas (Ángel 18/11: «en Mis tareas de la cuadrilla ellos ponen las fotos que les piden, y de paso
   deberían poder poner otra, y ahí que les pida poner un nombre como en la cámara: ponés "otra" y te pide un nombre»).
 · Cada tarea de Mis tareas (la lista), debajo de las fotos que se piden: «📎 Otras fotos» (con su nombre) y «＋ Otra foto».
 · «＋ Otra foto» → hoja #ofOv «¿Qué es la foto?» con los botones de la cámara (v164): Columna (‹ Col N ›) · Tablero · PAT · Zanja ·
   Acometida · Otro… (tecladito con lo último escrito, ema.foto.otros) → la cámara de siempre (app / teléfono / APK).
 · La foto va a la orden suelta (campo.fotos con otra171 y kx = la tarea, sin k): no cuenta para lo pedido ni para la verificación;
   la oficina la ve debajo de esa tarea en el «📸 Avance» y en el legajo, y la mueve con «↔ Mover». Si es una columna que la tarea
   pide, va a su fila como siempre.
 · «▶ Voy a iniciar» (v166): el botón también pide el cartel si la tarea no arrancó.
Pruebas viejas: __v171No (lo pone el arnés salvo v171:true) → todo como antes. Sin reglas nuevas.
Uso: python3 patch_v171.py ORIGINAL_170.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 170
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 170 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'otraFoto.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'otraFoto.css'), encoding='utf-8').read()

# ============================================================== la lista de fotos por unidad (fotosUnaPorUna): el bloque «Otras fotos»
R('''    return h + `</div>`;
  };

  // antes de que la app suba la foto''', '''    if (window.__otraFoto && !window.__v171No) h += window.__otraFoto.bloque(ot, tarea, con.map((x) => x.num).concat(filas.map((f) => f.n)));   // v171: «＋ Otra foto»
    return h + `</div>`;
  };

  // antes de que la app suba la foto''')
# ============================================================== la lista de tomas: el «📷 Otra foto» de antes pasa a ser «＋ Otra foto» con nombre
R('''<label class="btn-ghost fl-otra">📷 Otra foto<input type="file" accept="image/*" capture="environment" class="mt-foto-t" data-fln="Otra" data-fli="x" style="display:none;"></label></div>`;
    return h + `</div>`;''', '''${window.__otraFoto && !window.__v171No ? "" : '<label class="btn-ghost fl-otra">📷 Otra foto<input type="file" accept="image/*" capture="environment" class="mt-foto-t" data-fln="Otra" data-fli="x" style="display:none;"></label>'}</div>`;
    if (window.__otraFoto && !window.__v171No) h += window.__otraFoto.bloque(ot, tarea);   // v171
    return h + `</div>`;''')
# ============================================================== la orden (Novedades): las «otras» de una tarea no se repiten abajo
R('.filter(([, p]) => p && h(p.por) === h(a) && !p.k)', '.filter(([, p]) => p && h(p.por) === h(a) && !p.k && !(p.otra171 && !window.__v171No))')
# ============================================================== la oficina («📸 Avance»): debajo de su tarea
R('''(fs.length ? '<div class="ao-fotos">' + fs.map((f) => botonFoto(f, todas)).join("") + "</div>" : "") + "</div>";''',
  '''(fs.length ? '<div class="ao-fotos">' + fs.map((f) => botonFoto(f, todas)).join("") + "</div>" : "") + (window.__v171No ? "" : (function () { const fx = fotos.filter((f) => f.otra171 && f.kx === t.k); return fx.length ? '<div class="ao-otras171"><small>📎 Otras fotos (de más, no cuentan)</small><div class="ao-fotos">' + fx.map((f) => botonFoto(f, todas)).join("") + "</div></div>" : ""; })()) + "</div>";''')
R('    const otras = fotos.filter((f) => !ts.some((t) => t.k === f.k));',
  '    const otras = fotos.filter((f) => !ts.some((t) => t.k === f.k) && !(!window.__v171No && f.otra171 && ts.some((t) => t.k === f.kx)));   // v171: las «otras» van debajo de su tarea')
# ============================================================== «▶ Voy a iniciar» (v166): también desde «＋ Otra foto»
R("""const SEL = 'label.fl-cam, label.fl-cam-mas, label.fl-otra, label.mt-foto-btn, [data-flcam], input.mt-foto-t, [data-m="si"], [data-vimt]';""",
  """const SEL = 'label.fl-cam, label.fl-cam-mas, label.fl-otra, label.mt-foto-btn, [data-flcam], input.mt-foto-t, [data-m="si"], [data-vimt], [data-mto="abrir"]';   // v171""")
R('''    if (L.el && L.el.isConnected) return L.el;
    const base = `#mtApp .mt-ot[data-ot="${CSS.escape(L.ot)}"] .mt-tarea[data-k="${CSS.escape(L.k)}"]`;''', '''    if (L.el && L.el.isConnected) return L.el;
    const base = `#mtApp .mt-ot[data-ot="${CSS.escape(L.ot)}"] .mt-tarea[data-k="${CSS.escape(L.k)}"]`;
    if (L.mto) return document.querySelector(base + ' [data-mto="abrir"]');   // v171''')
R('flcam: b.matches("[data-flcam]") ? b.dataset.fli : null };', 'flcam: b.matches("[data-flcam]") ? b.dataset.fli : null, mto: b.matches("[data-mto]") };')

# ============================================================== el módulo
MOD = '<style id="otraFotoCss">\n' + CSS + '</style>\n<script id="otraFoto">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
