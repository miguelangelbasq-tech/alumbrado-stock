"""v168 · Luminarias armadas (Ángel 18/11: «del depósito sacamos artefacto, prensacable y cable, armamos el artefacto armado…
   la idea es tener stock de ya armadas para no perder tiempo… sale del pañol pero no sale de la empresa… algo rápido para mover
   las armadas a la plaza que lo necesite»). Idea 1 + 2 con las maquetas aprobadas.
 · Receta (producto «armada» en catalogoProductos.armada), Armar (comprobante AR-, movimientos armado:true), Llevar a obra (vale S-
   común), Depósito luminarias → armadas con «Sí».
 · Todo lo que cuenta consumo / lo entregado a una obra lee los movimientos por window.__armVista (desglosa las armadas en piezas
   y saca las patas del armado). Lista de cada lugar: CHANGELOG.md (v168).
Pruebas viejas: __v168No (lo pone el arnés salvo v168:true) → todo como la v167. Sin reglas nuevas.
Uso: python3 patch_v168.py ORIGINAL_167.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 167
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 167 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'armadas.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'armadas.css'), encoding='utf-8').read()
AV = 'window.__armVista'   # la vista de los movimientos sin las patas del armado y con las armadas abiertas en piezas

# ============================================================== la vista (vacía hasta que carga el módulo)
R('window.stockMovimientos = [], window.catalogoCambios = [];',
  'window.stockMovimientos = [], window.catalogoCambios = []; window.__armVista = window.__armVista || ((l) => l);   // v168: armadas (desglose)')

# ============================================================== lo entregado a una obra (desglosado) y el consumo
# calculado vs. entregado (legajo, balance)
R('''  const t = /* @__PURE__ */ new Map();
  stockMovimientosVigentes().forEach((i) => {
    if (String(i.plazaId || "") !== e.id) return;''', '''  const t = /* @__PURE__ */ new Map();
  window.__armVista(stockMovimientosVigentes()).forEach((i) => {   // v168: las armadas cuentan en piezas
    if (String(i.plazaId || "") !== e.id) return;''')
# materiales por tarea (lo entregado a la plaza)
R('return e && (typeof stockMovimientosVigentes == "function" ? stockMovimientosVigentes() : []).forEach((t) => {\n    if (String(t.plazaId || "") !== e.id || t.codigo == null) return;',
  'return e && window.__armVista(typeof stockMovimientosVigentes == "function" ? stockMovimientosVigentes() : []).forEach((t) => {   // v168\n    if (String(t.plazaId || "") !== e.id || t.codigo == null) return;')
# compras para una plaza (lo que salió)
R('''  return (window.stockMovimientos || []).forEach((o) => {
    if (o.anulado || String(o.plazaId || "") !== String(e.id)) return;''', '''  return window.__armVista(window.stockMovimientos || []).forEach((o) => {   // v168
    if (o.anulado || String(o.plazaId || "") !== String(e.id)) return;''')
# lista de compras: las armadas no se compran (se arman)
R('''  return (typeof catalogo == "function" ? catalogo() : []).map((e) => {
    const a = stockMinimoDe(e.codigo),''', '''  return (typeof catalogo == "function" ? catalogo() : []).map((e) => {
    if (window.__armEs && window.__armEs(e.codigo)) return null;   // v168: las armadas se arman, no se compran
    const a = stockMinimoDe(e.codigo),''')
# ficha del material («salió este mes») y Por sector
R('q = () => (window.stockMovimientos || []).filter((t) => !t.anulado), D = () =>', 'q = () => window.__armVista((window.stockMovimientos || []).filter((t) => !t.anulado)), D = () =>')
# informe de movimientos del pañol (Centro de informes)
R('Ge = () => (he(() => window.stockMovimientos, []) || []).filter((e) => !e.anulado),', 'Ge = () => window.__armVista((he(() => window.stockMovimientos, []) || []).filter((e) => !e.anulado)),')
# costos de la obra (GASTOS.costeoDe: material)
R('at = () => (w(() => window.stockMovimientos, []) || []).filter((e) => e && !e.anulado),', 'at = () => window.__armVista((w(() => window.stockMovimientos, []) || []).filter((e) => e && !e.anulado)),')
# reservas: lo entregado a la obra
R('''  function ne(e) {
    const a = /* @__PURE__ */ new Map();
    return (window.stockMovimientos || []).forEach((t) => {''', '''  function ne(e) {
    const a = /* @__PURE__ */ new Map();
    return window.__armVista(window.stockMovimientos || []).forEach((t) => {   // v168''')
# legajo: material entregado
R('''  function H(t) {
    const a = /* @__PURE__ */ new Map();
    return (window.stockMovimientos || []).forEach((o) => {
      if (!o || o.anulado || o.ajuste || o.correccion || String(o.plazaId || o.usoPlazaId || "") !== String(t.id)) return;''', '''  function H(t) {
    const a = /* @__PURE__ */ new Map();
    return window.__armVista(window.stockMovimientos || []).forEach((o) => {   // v168: las armadas en piezas
      if (!o || o.anulado || o.ajuste || o.correccion || String(o.plazaId || o.usoPlazaId || "") !== String(t.id)) return;''')
# gastos: materiales por mes
R('const movs = () => (window.stockMovimientos || []).filter((m) => m && !m.anulado);', 'const movs = () => window.__armVista((window.stockMovimientos || []).filter((m) => m && !m.anulado));   // v168')
# material contra avance (vales de una obra)
R("""  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const movs = () => (Array.isArray(window.stockMovimientos) ? window.stockMovimientos : []);
  const permiso = (h) =>""", """  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const movs = () => window.__armVista(Array.isArray(window.stockMovimientos) ? window.stockMovimientos : []);   // v168: las armadas en piezas
  const permiso = (h) =>""")
# pedido de compras (consumo de las obras, lo recibido)
R('const movs = () => intentar(() => stockMovimientosVigentes(), []) || [];', 'const movs = () => window.__armVista(intentar(() => stockMovimientosVigentes(), []) || []);   // v168')
# informe semanal: lo que salió en la semana
R("""    const sal = {};
    arr(window.stockMovimientos).forEach((m) => {""", """    const sal = {};
    arr(window.__armVista(arr(window.stockMovimientos))).forEach((m) => {   // v168: sin el armado, las armadas en piezas""")

# ============================================================== números: el armado es un grupo AR- (no un S- por pieza)
R('const grupo = (s) => (letra(s) === "D" && s.devolGrupo ? "g:" + s.devolGrupo :', 'const grupo = (s) => (s && s.armadoGrupo ? "a:" + s.armadoGrupo : letra(s) === "D" && s.devolGrupo ? "g:" + s.devolGrupo :')
# anular una pata del armado ofrece anular el resto
R('((a.correccionGrupo && m.correccionGrupo === a.correccionGrupo) ||', '((a.armadoGrupo && m.armadoGrupo === a.armadoGrupo) || (a.correccionGrupo && m.correccionGrupo === a.correccionGrupo) ||')
R('`Este movimiento tiene su pareja (${a.correccionGrupo ? "la corrección de código"', '`Este movimiento tiene su pareja (${a.armadoGrupo ? "el resto del armado " + (a.numero || "") : a.correccionGrupo ? "la corrección de código"')
# listado de movimientos: la pata del armado se ve como tal
R('function etiquetaTipoMov(e, a) {\n  const t = e.soloPrecio ?', 'function etiquetaTipoMov(e, a) {\n  const t = e.armado && !window.__v168No ? ["🔧", e.tipo === "entrada" ? "Armado (entra)" : "Armado (sale)"] : e.soloPrecio ?')

# ============================================================== QR y ?doc=AR-0001
R('if ((m = t.match(/N°\\s*([SED]-\\d{3,})/))) return { doc: m[1] };', 'if ((m = t.match(/N°\\s*((?:[SED]|AR)-\\d{3,})/))) return { doc: m[1] };')
R('const m = c.toUpperCase().match(/^(H-\\d+|[SED]-\\d+|', 'const m = c.toUpperCase().match(/^(H-\\d+|(?:[SED]|AR)-\\d+|')
R('if (/^[SED]-\\d+$/.test(d)) {', 'if (/^(?:[SED]|AR)-\\d+$/.test(d)) {')

# ============================================================== asistente (dormido): stock con la receta, resumen del día sin el armado
R('bajoMinimo: mn > 0 && s != null && s < mn }; }) } };', 'bajoMinimo: mn > 0 && s != null && s < mn, armada: window.__armadas && !window.__v168No ? window.__armadas.paraIa(p.codigo) : undefined }; }) } };')
R('const mv = (window.stockMovimientos || []).filter((m) => m && !m.anulado && m.fecha === f); r.panol = { salidas: mv.filter((m) => m.tipo === "salida").length,',
  'const mv = (window.stockMovimientos || []).filter((m) => m && !m.anulado && m.fecha === f && !(m.armado && !window.__v168No)); r.panol = { salidas: mv.filter((m) => m.tipo === "salida").length,')
R('valeGrupo, devolGrupo, numero, anulado, nota." },', 'valeGrupo, devolGrupo, numero, anulado, nota; armado:true = armado de luminarias (comprobante AR-, armadoGrupo, receta, quienes): es interno del pañol, NO es consumo ni gasto de ninguna obra." },')

# ============================================================== la tarjeta en Pañol › Catálogo
R('cards: ["cardStockInventario", "cardStockCompras"] }', 'cards: ["arCard", "cardStockInventario", "cardStockCompras"] }')
R('<div class="card" id="cardStockInventario">', '<div class="card no-print ar-off" id="arCard"></div>\n<div class="card" id="cardStockInventario">')

# ============================================================== el módulo
MOD = '<style id="armadasCss">\n' + CSS + '</style>\n<script id="armadas">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
