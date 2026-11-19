"""v183 · Calculadora (Ángel 19/11/2026): cable 3×1,5 de subida al artefacto = 4 m (columna de 7 m, brazo 0,4 m) y
7,5 m (columna de 10 m, brazo 1 m); ganancia del troncal = 6 m por subida (7 y 10 m); luminarias de distinta potencia
en la misma obra (tipos: potencia + cantidad + producto del pañol, guardados en el formulario). Bandera __v183No.
Módulo `calc183` + reemplazos chicos. Uso: python3 patch_v183.py ORIGINAL_ENTRADA.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip() if os.path.exists(os.path.join(SRC, 'BASE_SHA')) else ''
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de entrada (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
NO = 'window.__v183No'
# ---------- (1) cable 3×1,5 de subida al artefacto
R('''function cableSubidaPorArtefacto(e, a, t) {
''', '''// v183 · cable 3×1,5 a la luminaria, uno por artefacto (Ángel 19/11/2026): 4 m en columna de 7 m con brazo de 0,4 m y
// 7,5 m en columna de 10 m con brazo de 1 m. Otra combinación: la más parecida (por altura) + la diferencia de altura y de brazo (a confirmar).
const CABLE_SUBIDA_V183 = [{ h: 7, b: 0.4, m: 4 }, { h: 10, b: 1, m: 7.5 }];
function cableSubida183(e, a, t) {
  const alt = a > 0 ? a : 7, br = e > 0 ? e : 0.4, r = Math.abs(alt - 7) <= Math.abs(alt - 10) ? CABLE_SUBIDA_V183[0] : CABLE_SUBIDA_V183[1];
  const dB = Math.abs(br - r.b) <= 0.05 ? 0 : br - r.b, dA = alt - r.h;
  return { m: Math.max(0.5, Math.round((r.m + dA + dB) * 100) / 100), ref: r, aConf: !!(dA || dB || t === "Metálica") };
}
// con columnas de 7 y de 10 m en la misma plaza: los brazos de 1 m o más van en la de 10 m y los cortos en la de 7 m (a confirmar)
function alturaSubida183(br, j, N) {
  const hs = (N || []).filter((g) => g && g.columnas > 0).map((g) => +g.altura || 7);
  if (hs.length < 2) return j;
  const mn = Math.min.apply(null, hs), mx = Math.max.apply(null, hs);
  return mn === mx ? j : (br >= 0.9 ? mx : mn);
}
window.cableSubida183 = cableSubida183; window.alturaSubida183 = alturaSubida183;
function cableSubidaPorArtefacto(e, a, t) {
  if (!window.__v183No) return cableSubida183(e, a, t).m;   // v183
''')
# ---------- (2) ganancia del troncal: 6 m por subida
R('''function gananciaPorDefecto(e, a) {
''', '''const GANANCIA_V183_M = 6;   // v183 · Ángel 19/11/2026: 6 m de abajo hacia arriba en columnas de 7 y de 10 m (metálica: a confirmar)
window.GANANCIA_V183_M = GANANCIA_V183_M;
function gananciaPorDefecto(e, a) {
  if (!window.__v183No) return GANANCIA_V183_M;
''')
R(': ((document.getElementById("colTipo") || {}).value || "") === "Metálica" ? `a <b>${fmt(GANANCIA_METALICA_M, 1)} m por subida</b>',
  ': !window.__v183No ? `a <b>${fmt(GANANCIA_V183_M, 1)} m por subida</b> (campo vacío: 6 m de abajo hacia arriba en columnas de 7 y de 10 m)` : ((document.getElementById("colTipo") || {}).value || "") === "Metálica" ? `a <b>${fmt(GANANCIA_METALICA_M, 1)} m por subida</b>')
# ---------- calcular(): altura por grupo de vínculo, textos
R('const q = te.columnas * oe.lum, _ = cableSubidaPorArtefacto(oe.brazoM, j, ce);',
  'const q = te.columnas * oe.lum, a183 = ' + NO + ' ? j : alturaSubida183(oe.brazoM, j, N), _ = cableSubidaPorArtefacto(oe.brazoM, a183, ce), c183 = !' + NO + ' && cableSubida183(oe.brazoM, a183, ce).aConf;')
R('B.push(`${q}×${fmt(_, 2)} m (${oe.label.split("—")[0].trim()}, brazo ${oe.brazo})`);',
  'B.push(`${q}×${fmt(_, 2)} m (${oe.label.split("—")[0].trim()}, brazo ${oe.brazo}${' + NO + ' ? "" : `, columna de ${fmt(a183, 0)} m`}${c183 ? ", <b>a confirmar</b>" : ""})`);')
R('ref: `(${fmt(j, 0)} − ${fmt(alturaCajaColumna(ce), 2)}) + brazo + 0,60 · ítem 7.7 del proyecto`',
  'ref: !' + NO + ' ? "Regla EMA 19/11/2026: 4 m (7 m · brazo 0,4) · 7,5 m (10 m · brazo 1 m)" : `(${fmt(j, 0)} − ${fmt(alturaCajaColumna(ce), 2)}) + brazo + 0,60 · ítem 7.7 del proyecto`')
R('H.push({ desc: `ℹ El cable a la luminaria se calcula como',
  'H.push({ desc: !' + NO + ' && window.__lum183 ? window.__lum183.hintCable(j, ce, Q, o && R > 0) : `ℹ El cable a la luminaria se calcula como')
# ---------- (3) luminarias de distinta potencia: un renglón por potencia
R('const fe = [(() => {', 'const fe = [...(!' + NO + ' && window.__lum183 && window.__lum183.multi() ? window.__lum183.lineas(Le) : [(() => {')
R('    })(), { desc: "⚠ <b>Shorting cup', '    })()]), { desc: "⚠ <b>Shorting cup')
R('<div class="hint">Sale impresa en el cómputo: «Luminaria LED 75 W». Si esta plaza lleva otra potencia, cambiala acá.</div>',
  '<div class="hint">Sale impresa en el cómputo: «Luminaria LED 75 W». Si esta plaza lleva otra potencia, cambiala acá.</div>\n<input type="hidden" id="lumTipos183" value="">\n<div id="lum183"></div>')
R('''function restaurarFormulario(e) {
  if (!e || !e.campos) return false;''', '''function restaurarFormulario(e) {
  if (!e || !e.campos) return false;
  try {   // v183: un cómputo sin potencias guardadas vuelve a una sola potencia
    const h183 = document.getElementById("lumTipos183");
    h183 && !Object.prototype.hasOwnProperty.call(e.campos, "lumTipos183") && (h183.value = "");
    setTimeout(() => { try { window.__lum183 && window.__lum183.pintar(); } catch (e9) { } }, 0);
  } catch (e9) { }''')
# ---------- 💡 Consumo (Cálculos rápidos): otra potencia
R('e = n(a.n) * n(a.w) / 1e3', 'e = (n(a.n) * n(a.w) + (' + NO + ' ? 0 : n(a.n2) * n(a.w2))) / 1e3')
R('<div><label>Potencia de cada una (W)</label><input type="number" inputmode="decimal" min="0" step="any" data-k="w" value="${r(a.w)}"></div>',
  '<div><label>Potencia de cada una (W)</label><input type="number" inputmode="decimal" min="0" step="any" data-k="w" value="${r(a.w)}"></div>${' + NO + ' ? "" : `<div><label>Otra potencia: cantidad (opcional)</label><input type="number" inputmode="numeric" min="0" step="1" data-k="n2" value="${r(a.n2 == null ? "" : a.n2)}" placeholder="0"></div><div><label>Otra potencia (W)</label><input type="number" inputmode="decimal" min="0" step="any" data-k="w2" value="${r(a.w2 == null ? "" : a.w2)}" placeholder="ej. 180"></div>`}')
# ---------- guías y textos que decían 7 m
R('4) Dejar ganancia de cable para la subida en cada columna: ~7 m si el circuito termina ahí, ~14 m (2 cables) si de esa columna el circuito sigue a la próxima.',
  '4) Dejar ganancia de cable para la subida en cada columna: ${' + NO + ' ? "~7 m si el circuito termina ahí, ~14 m (2 cables) si de esa columna el circuito sigue a la próxima." : "6 m si el circuito termina ahí, 12 m (2 cables: sube y baja) si de esa columna el circuito sigue a la próxima."}')
R('4) Cortar y dejar preparado el cable de subida 3×1,5 mm²: 7 m por columna (14 m si el circuito continúa de esa columna a la siguiente).',
  '4) Cortar y dejar preparado el cable de subida 3×1,5 mm²: ${' + NO + ' ? "7 m por columna (14 m si el circuito continúa de esa columna a la siguiente)." : "uno por artefacto: 4 m en columna de 7 m con brazo de 0,40 m · 7,5 m en columna de 10 m con brazo de 1 m."}')
R('"El rollo de cable que queda para subir (~7 m, o ~14 m si sigue a la próxima)."',
  '(' + NO + ' ? "El rollo de cable que queda para subir (~7 m, o ~14 m si sigue a la próxima)." : "El rollo de cable que queda para subir (6 m, o 12 m si sigue a la próxima).")')
R('Sale de la fórmula (altura − caja) + brazo + 0,60, verificada contra seis cómputos oficiales.',
  '${' + NO + ' ? "Sale de la fórmula (altura − caja) + brazo + 0,60, verificada contra seis cómputos oficiales." : "Sale de la regla de EMA del 19/11/2026: 4 m por artefacto en columna de 7 m con brazo de 0,4 m y 7,5 m en la de 10 m con brazo de 1 m (antes era (altura − caja) + brazo + 0,60, verificada contra seis cómputos oficiales: a confirmar en las metálicas)."}')
# ---------- Proyectista (dormido, Chrome 80): la regla de la calculadora
R('subLum: 7, x: 0.08', 'subLum: (window.__v183No ? 7 : 4), x: 0.08')
R('"regla de la calculadora: 7 m"', '(window.__v183No ? "regla de la calculadora: 7 m" : "regla de la calculadora: 4 m (7 m, brazo 0,4) · 7,5 m (10 m, brazo 1 m)")')
# ---------- asistente (dormido): proponer_calculo con luminarias de distinta potencia
R('''    if (c.campos && typeof c.campos == "object") Object.keys(c.campos).forEach((k) => {''',
  '''    if (Array.isArray(c.luminarias) && c.luminarias.length && window.__lum183 && !window.__v183No) {   // v183
      const L = window.__lum183.aplicarForm(f, c.luminarias); if (L.err) return { err: L.err };
      if (L.fila) filas.push(L.fila); (L.notas || []).forEach((x) => notasF.push(x));
    }
    if (c.campos && typeof c.campos == "object") Object.keys(c.campos).forEach((k) => {''')
R('zanjaM: { type: "number", description: "metros de zanja" }, campos:',
  'zanjaM: { type: "number", description: "metros de zanja" }, luminarias: { type: "array", items: S({ potencia: { type: "number" }, cantidad: { type: "integer" }, codigo: { type: "integer" } }, ["potencia"]), description: "luminarias de distinta potencia en la misma obra (v183): la primera lleva el resto de las luminarias de los vínculos; codigo = producto del pañol (familia 6, luminaria), sin código queda «a confirmar»; NUNCA inventes un código" }, campos:')
# ---------- el módulo, antes de revisarAppDiag
CSS = open(os.path.join(SRC, 'calc183.css'), encoding='utf-8').read()
JS = open(os.path.join(SRC, 'calc183.js'), encoding='utf-8').read()
R('<script id="revisarAppDiag">', '<style id="calc183Css">\n' + CSS + '</style>\n<script id="calc183">\n' + JS + '</script>\n<script id="revisarAppDiag">')
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
