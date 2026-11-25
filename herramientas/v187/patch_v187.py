"""v187 · Revisión de la cuadrilla (fotos, planos y ubicaciones; pedido de Ángel 25/11/2026):
 1) Mis tareas «📤 Listo, enviar esta tarea» ya no se traba cuando «Voy a iniciar» y las fotos caen en el mismo minuto
    (las horas iban escondidas con inicio = fin y la app decía «La hora de fin tiene que ser después de la de inicio»).
 2) Los planos de la obra en la pantalla nueva de la cuadrilla: «Orden de trabajo» con la lista y Modo obra con «📐 Ver plano».
 3) El celu de la cuadrilla deja de recalcular pantallas que no ve (el Inicio viejo con el % de todas las obras, Planificación,
    Informes / Avance / Órdenes de la oficina) con cada cambio de su orden: con muchas obras eso frenaba la pantalla 1–2 s
    después de cada foto. Lo escondido se dibuja cuando la persona abre esa pantalla.
Bandera __v187No. Sin reglas nuevas.
BASE_SHA = el ORIGINAL 186 publicado. Uso: python3 patch_v187.py ENTRADA.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de entrada (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
assert '<script id="cuadrilla187">' not in t, 'ya tiene la v187'
for x in ['<script id="tiempoCol">', '<script id="cuadrillaDia">', '<script id="otPlanos">', '<script id="envioTarea">']:
    assert x in t, x
# --- 1) tiempoCol (v157): el cartelito de «Listo, enviar» con las horas escondidas. Si el rango de las fotos cae en el mismo
#     minuto (o el inicio y la foto son el mismo instante), el fin escondido pasa a ser un minuto después del inicio.
R('  const hm = (ts) => { const d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };',
  '  const hm = (ts) => { const d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };\n'
  '  const hmFin = (a, b) => (window.__v187No || !a || hm(b) > hm(a) ? hm(b) : hm(a + 6e4) > hm(a) ? hm(a + 6e4) : hm(b));   // v187: el fin nunca igual al inicio')
R('if (!(r.a && r.b && r.b > r.a)) return "";', 'if (!(r.a && r.b && (r.b > r.a || (!window.__v187No && r.b === r.a)))) return "";')
R('id="etFin" aria-label="Hora de fin" value="${esc(hm(r.b))}"', 'id="etFin" aria-label="Hora de fin" value="${esc(hmFin(r.a, r.b))}"')
R('a.value = hm(rg.a); z.value = hm(rg.b);', 'a.value = hm(rg.a); z.value = hmFin(rg.a, rg.b);')
# --- 2) cuadrillaDia (v142): los planos de la obra en «Orden de trabajo» y «📐 Ver plano» en Modo obra
R('\n<button type="button" class="cd-link" data-cd="lista">Ver lista completa</button></div>\n<div class="cd-pie"><button type="button" class="btn-primary cd-big" data-cd="empezar">',
  '${window.__pl187 ? window.__pl187.orden(o) : ""}\n<button type="button" class="cd-link" data-cd="lista">Ver lista completa</button></div>\n<div class="cd-pie"><button type="button" class="btn-primary cd-big" data-cd="empezar">')
R('<button type="button" class="cd-link" data-cd="fin">Fin del día</button>${window.__archivosNube && !window.__v160No ? window.__archivosNube.botonObra(o, pa) : ""}</div></div>`;',
  '<button type="button" class="cd-link" data-cd="fin">Fin del día</button>${window.__pl187 ? window.__pl187.boton(o) : ""}${window.__archivosNube && !window.__v160No ? window.__archivosNube.botonObra(o, pa) : ""}</div></div>`;')
# --- 3) el Inicio viejo (escondido para la cuadrilla: body.inicio-crew) calculaba el % de TODAS las obras cada 4 s y con cada
#     cambio de la orden (≈ 1,3 s de CPU por vez con 250 obras y el celu lento): con la cuadrilla, solo los globitos.
R('    document.getElementById("viewInicio") && (N(), D(), z(), y(), L());',
  '    if (!window.__v187No && document.body && document.body.classList.contains("inicio-crew")) { L(); return; }   // v187\n    document.getElementById("viewInicio") && (N(), D(), z(), y(), L());')
R('if (!e || e.style.display === "none" || (!window.__v186No && e.classList.contains("ie-on"))) return;   // v186',
  'if (!e || e.style.display === "none" || (!window.__v186No && e.classList.contains("ie-on")) || (!window.__v187No && document.body.classList.contains("inicio-crew"))) return;   // v186 · v187')
rd = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read()
R('<script id="revisarAppDiag">', '<style id="cuadrilla187Css">\n' + rd('cuadrilla187.css') + '</style>\n<script id="cuadrilla187">\n' + rd('cuadrilla187.js') + '</script>\n<script id="revisarAppDiag">')
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t)
print('OK', sal, f'{ahora} · {h6}')
