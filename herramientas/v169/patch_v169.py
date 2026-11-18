"""v169 · «🔧 Armadas» con su propio subíndice en el Pañol (Ángel 18/11: «eso tiene que tener su propio subíndice, no dentro de
   pañol (el catálogo)»).
 · Subpestaña «🔧 Armadas» (data-sub="armadas") después de Herramientas, con la tarjeta #arCard de la v168 (recetas, Armar,
   Llevar a obra, DEPÓSITO LUMINARIAS, comprobantes AR-). Se ve con la misma regla que la tarjeta de la v168 (quien edita el pañol
   siempre; cuadrilla, mirar y Dirección si hay alguna receta).
 · Catálogo pañol: una línea #arLinea «🔧 Luminarias armadas: N listas · Ver» → la subpestaña, con «‹ Volver al catálogo»
   (#arVolver) y el «atrás» del celu que vuelve al catálogo (capa `armadasCat` de atrasApp).
 · Ficha del producto armada: «Ver en Pañol › Armadas»; QR ?doc=AR-…: el comprobante con Pañol › Armadas detrás.
Pruebas viejas: __v169No (lo pone el arnés salvo v169:true) → todo como la v168. Sin reglas nuevas.
Uso: python3 patch_v169.py ORIGINAL_168.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 168
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 168 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'armadasTab.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'armadasTab.css'), encoding='utf-8').read()

# ============================================================== las subpestañas del Pañol
R('''  let i = "inventario";
  // v053: el personal de obra''', '''  let i = "inventario";
  // v169: «🔧 Armadas» con su propio subíndice (la tarjeta de la v168 sale del catálogo); con __v169No, la lista de la v168
  const m169 = () => {
    if (window.__v169No || window.__v168No) return m;
    const l = m.map((e) => e.id === "inventario" ? Object.assign({}, e, { cards: ["arLinea", "cardStockInventario", "cardStockCompras"] }) : e);
    const k = l.findIndex((e) => e.id === "herramientas") + 1;
    l.splice(k, 0, { id: "armadas", label: "🔧 Armadas", hdr: "Luminarias armadas", cards: ["arVolver", "arCard"] });
    return l;
  };
  const veArm = () => { try { return !!(window.__armTabVe && window.__armTabVe()); } catch (e) { return false; } };
  // v053: el personal de obra''')
R('''    const sc = soloCatalogo();
    sc && i !== "inventario" && (i = "inventario");
    const t = document.getElementById("subtabsStock");
    t && (t.innerHTML = (sc ? m.filter((e) => e.id === "inventario") : m).map((e) => `<button type="button" class="subtab${i === e.id ? " activo" : ""}" data-sub="${e.id}">${s(e.label)}</button>`).join("")''',
'''    const sc = soloCatalogo(), M = m169().filter((e) => e.id !== "armadas" || veArm());   // v169
    i === "armadas" && !M.some((e) => e.id === "armadas") && (i = "inventario");
    sc && i !== "inventario" && i !== "armadas" && (i = "inventario");
    const t = document.getElementById("subtabsStock");
    t && (t.innerHTML = (sc ? M.filter((e) => e.id === "inventario" || e.id === "armadas") : M).map((e) => `<button type="button" class="subtab${i === e.id ? " activo" : ""}" data-sub="${e.id}"${e.hdr ? ` data-hdr="${s(e.hdr)}"` : ""}>${s(e.label)}</button>`).join("")''')
R('''  function y() {
    if (m.forEach((t) => {''', '''  function y() {
    if (m169().forEach((t) => {''')
R('  window.__pintarSubtabsStock = d;\n', '  window.__pintarSubtabsStock = d;\n  window.__stockSubIr = (x) => { i = x; d(); };   // v169: ir a una subpestaña sin tocarla (la línea del catálogo, la ficha, el QR)\n')

# ============================================================== el lugar de la tarjeta
R('<div class="card no-print ar-off" id="arCard"></div>\n<div class="card" id="cardStockInventario">',
  '<div class="no-print ar-off" id="arVolver"></div>\n<div class="card no-print ar-off" id="arCard"></div>\n<div class="card no-print ar-off" id="arLinea"></div>\n<div class="card" id="cardStockInventario">')

# ============================================================== la ficha del producto: «Ver en Pañol › Armadas»
R('''(pe ? "Ver o cambiar la receta" : "Ver la receta") + "</button>";
    const cab0''', '''(pe ? "Ver o cambiar la receta" : "Ver la receta") + "</button>" + (window.__v169No ? "" : "<button type=\\"button\\" class=\\"link\\" data-armtab=\\"ficha\\">Ver en Pañol › Armadas</button>");   // v169
    const cab0''')

# ============================================================== QR ?doc=AR-…: el comprobante con Pañol › Armadas detrás
R('''      if (!m) return avisar(`No encontré el comprobante ${d}.`);
      if (typeof window.verComprobanteMovimiento == "function") window.verComprobanteMovimiento(m.id);''',
'''      if (!m) return avisar(`No encontré el comprobante ${d}.`);
      if (/^AR-/.test(d) && !window.__v169No && window.__armTab) { try { window.__armTab.ir(); } catch (e) { } }   // v169
      if (typeof window.verComprobanteMovimiento == "function") window.verComprobanteMovimiento(m.id);''')

# ============================================================== atrás: desde la línea del catálogo vuelve al catálogo
R('''    { id: "gananciaObra", sub: "gastos",''', '''    { id: "armadasCat", sub: "stock", el: () => document.querySelector("#arVolver [data-arvolver]"), abierta: (e) => e.offsetParent !== null, cerrar: (e) => e.click() },   // v169
    { id: "gananciaObra", sub: "gastos",''')

# ============================================================== el módulo
MOD = '<style id="armadasTabCss">\n' + CSS + '</style>\n<script id="armadasTab">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
