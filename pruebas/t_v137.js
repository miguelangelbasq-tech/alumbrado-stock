// v137 · Remito por foto con IA (tarjeta, corregir, renglón sin código que no se carga, Sí → entradas E- con precio sin IVA
// y la foto vinculada, auditoría remito_ia; remito ilegible; Worker caído), código de barras (asociar, repetido, escanear
// con el plugin de la app simulado, desconocido → «¿A qué producto corresponde?»), etiquetas QR de herramientas, QR en el
// vale, la orden y la reserva (se decodifican con jsQR y tienen que dar la dirección correcta) y ?doc= / ?obra= abriendo
// cada cosa, y «No tenés permiso» para quien no puede verla.
const fs = require('fs');
const path = require('path');
const { abrir, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
const URL_IA = 'https://ema-ia.mdiaz-60f.workers.dev/ia';
const BASE = 'https://miguelangelbasq-tech.github.io/alumbrado-stock/';
const CAP = process.env.CAP || '';
const JSQR = fs.readFileSync(path.join(__dirname, 'lib', 'jsQR.js'), 'utf8');
const FOTO = path.join(__dirname, 'foto.jpg');
function datos() {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  d.db.movimientos = {
    m1: { tipo: 'entrada', codigo: 3017, desc: 'FUSIBLE CILINDRICO 10 X 38 2 AMP', un: 'Un.', cantidad: 50, fecha: hoy, ts: ahora - 9e5, usuario: 'admin@' + DOM, numero: 'E-0001', proveedor: 'Richetta', remito: '0001-0009', precioUnit: 90 },
    m2: { tipo: 'salida', codigo: 3017, desc: 'FUSIBLE CILINDRICO 10 X 38 2 AMP', un: 'Un.', cantidad: 4, fecha: hoy, ts: ahora - 8e5, usuario: 'admin@' + DOM, numero: 'S-0001', valeGrupo: 'vg1', plazaId: 'p1', plazaNombre: 'Plaza San Martín', retiradoPor: 'Juan Pérez', sector: 'alumbrado' }
  };
  d.db.catalogoProductos = { 7015: { codigo: 7015, ean: ['7790000000015'] } };
  d.db.reservas = { r1: { numero: 'R-0001', estado: 'pendiente', plazaId: 'p1', plazaNombre: 'Plaza San Martín', obraId: '1234', para: 'Juan Pérez', items: [{ codigo: 3017, desc: 'FUSIBLE CILINDRICO 10 X 38 2 AMP', un: 'Un.', cant: 6 }], creadoPor: 'admin@' + DOM, ts: ahora - 7e5, fechaNecesaria: hoy } };
  d.db.herramientas = { h1: { codigo: 'H-001', nombre: 'Pinza amperométrica', cat: 'medicion', estado: 'libre', marca: 'Fluke', modelo: '323', creado: ahora - 864e5 }, h2: { codigo: 'H-002', nombre: 'Taladro percutor', cat: 'electrica', estado: 'libre', creado: ahora - 864e5 } };
  return d;
}
(async () => {
  const c = prueba('v137' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', datos: datos(), cel, espera: 4000, https: true, iaPro: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  const foto = async (pg, nom, ms) => { if (cel && CAP) { await pg.waitForTimeout(ms == null ? 700 : ms); await pg.screenshot({ path: CAP + '/' + nom + '.png' }); } };
  const db = () => p.evaluate(() => window.__stubDB());
  const decod = (pg, sel, enHoja) => pg.evaluate(async ([s, h]) => {
    const raiz = h ? (document.querySelector('#hojaOv iframe') || {}).contentDocument : document;
    const img = raiz && raiz.querySelector(s); if (!img) return null;
    const im = new Image(); im.src = img.src; await new Promise((ok) => { im.onload = ok; im.onerror = ok; });
    const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height), r = window.jsQR(d.data, cv.width, cv.height);
    return r ? r.data : '(no se leyó)';
  }, [sel, !!enHoja]);
  await p.addScriptTag({ content: JSQR });
  await p.waitForTimeout(1200);

  // ========================================================= 1) remito por foto: botón y tarjeta
  const pedidos = []; let guion = [];
  await p.route(URL_IA, async (rt) => {
    let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { }
    pedidos.push(b);
    const x = guion.shift();
    if (x === 'caido') return rt.abort('connectionrefused');
    return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'msg_1', type: 'message', role: 'assistant', model: b.model, content: [{ type: 'thinking', thinking: '', signature: 'f' }, { type: 'text', text: JSON.stringify(x) }], stop_reason: 'end_turn', ema: { costoUsd: 0.03 } }) });
  });
  const hoy = await p.evaluate(() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  const REMITO = { legible: true, motivo: '', proveedor: 'Richetta', numero: '0001-00012345', fecha: hoy, moneda: 'ARS', preciosConIva: true, ivaPct: 21, renglones: [
    { desc: 'FUSIBLE CILINDRICO 10X38 2A', cant: 20, un: 'u', precio: 121, ean: null },
    { desc: 'CABLE CU 4X4 MM2 XLPE IRAM 2178', cant: 100, un: 'm', precio: 2420, ean: null },
    { desc: 'Gaseosa cola 2,25 L', cant: 2, un: 'u', precio: 3000, ean: null },
    { desc: 'Jabalina cobre', cant: 3, un: 'u', precio: 12100, ean: '7790000000015' }] };
  await p.evaluate(() => window.__v135.irStock('registrar')); await p.waitForTimeout(700);
  let r = await p.evaluate(() => { const b = document.getElementById('rfBtn'), w = document.getElementById('rfEntrada'); return { vis: !!b && getComputedStyle(w).display !== 'none' && b.getBoundingClientRect().height >= 44, txt: b ? b.textContent : '' }; });
  c(r.vis && /Cargar remito con foto/.test(r.txt), 'Pañol › Registrar movimiento (entrada) tiene «📷 Cargar remito con foto» de 44 px o más · ' + JSON.stringify(r));
  await p.evaluate(() => { const s = document.getElementById('stockMovTipo'); s.value = 'salida'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  r = await p.evaluate(() => getComputedStyle(document.getElementById('rfEntrada')).display);
  await p.evaluate(() => { const s = document.getElementById('stockMovTipo'); s.value = 'entrada'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  c(r === 'none', 'con «Salida» el botón del remito no aparece');
  await p.evaluate(() => document.getElementById('cardStockRegistrar').scrollIntoView({ block: 'start' }));
  await foto(p, 'v137_1_boton_remito');
  await p.click('#rfBtn'); await p.waitForTimeout(300);
  c(await p.evaluate(() => !!document.getElementById('rfFotoGal') && !!document.getElementById('rfFotoCam')), 'se abre la hoja con «Sacar foto» y «Elegir de la galería»');
  guion.push(REMITO);
  await p.setInputFiles('#rfFotoGal', FOTO);
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.querySelector('#rfFilas'))) break; }
  const b0 = pedidos[0];
  const img = b0 && b0.messages[0].content.find((x) => x.type === 'image');
  c(b0 && b0.model === 'claude-opus-5-5' && b0.output_config && b0.output_config.effort === 'medium' && img && img.source.media_type === 'image/jpeg' && img.source.data.length > 1000 && b0.fallbacks === 'default' && !('temperature' in b0) && !('thinking' in b0), 'la foto va al Worker como el asistente: Opus 5.5, bloque image JPEG, effort medium, con respaldo, sin temperature/thinking · ' + JSON.stringify(b0 && [b0.model, b0.output_config, b0.max_tokens]));
  r = await p.evaluate(() => [...document.querySelectorAll('#rfFilas .rf-ren')].map((x) => ({ g: x.querySelector('.rf-grado').className.replace('rf-grado ', ''), t: x.querySelector('.rf-grado').textContent, cod: (x.querySelector('select[data-rf="cod"]') || {}).value || '', fuera: x.classList.contains('rf-fuera'), n: x.querySelectorAll('select[data-rf="cod"] option').length })));
  c(r.length === 4, 'la tarjeta tiene los 4 renglones del remito · ' + JSON.stringify(r));
  c(r[0] && r[0].g === 'v' && r[0].cod === '3017', 'fusible 10×38 2 A → 🟢 3017 · ' + JSON.stringify(r[0]));
  c(r[1] && r[1].cod === '1010' && r[1].g !== 'r', 'cable 4×4 → 1010 · ' + JSON.stringify(r[1]));
  c(r[2] && r[2].g === 'r' && r[2].cod === '' && r[2].fuera, 'la gaseosa → 🔴 sin código: queda afuera con el desplegable para elegir (no se inventa código) · ' + JSON.stringify(r[2]));
  c(r[3] && r[3].g === 'v' && r[3].cod === '7015' && /código de barras/.test(r[3].t), 'jabalina con EAN asociado → 🟢 7015 por el código de barras · ' + JSON.stringify(r[3]));
  r = await p.evaluate(() => ({ prov: document.getElementById('rfProv').value, num: document.getElementById('rfNum').value, fecha: document.getElementById('rfFecha').value, iva: document.getElementById('rfIva').value, si: !!document.querySelector('[data-rf="si"]'), no: !!document.querySelector('[data-rf="no"]'), res: document.getElementById('rfRes').textContent }));
  c(r.prov === 'Richetta' && r.num === '0001-00012345' && r.fecha === hoy && r.iva === '21' && r.si && r.no && /Se cargan 3 renglones/.test(r.res) && /1 queda afuera/.test(r.res), 'datos leídos (proveedor, remito, fecha, IVA 21 %) y botones «Sí, cargar entrada» / «No» · ' + JSON.stringify(r));
  if (cel) r = await p.evaluate(() => document.querySelector('#rfOv .v7-caja').scrollWidth <= document.querySelector('#rfOv .v7-caja').clientWidth + 1);
  if (cel) c(r, 'en el celu la tarjeta no tiene scroll de costado');
  await foto(p, 'v137_2_tarjeta_remito');
  // corregir un renglón: cantidad del cable
  await p.fill('#rfFilas [data-rf="cant"][data-i="1"]', '50');
  await p.evaluate(() => { const s = document.querySelector('#rfFilas select[data-rf="cod"][data-i="2"]'); s.value = '__otro'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  r = await p.evaluate(() => !!document.querySelector('#rfFilas [data-rf="busca"][data-i="2"]'));
  c(r, '«🔎 Buscar otro en el catálogo…» abre el buscador del catálogo en el renglón sin código');
  const movAntes = Object.keys((await db()).movimientos || {}).length;
  await p.click('[data-rf="si"]');
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(200); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-listo'))) break; }
  let D = await db();
  const nuevos = Object.entries(D.movimientos || {}).filter(([, m]) => m.remito === '0001-00012345');
  const m3017 = nuevos.map((x) => x[1]).find((m) => m.codigo === 3017), m1010 = nuevos.map((x) => x[1]).find((m) => m.codigo === 1010), m7015 = nuevos.map((x) => x[1]).find((m) => m.codigo === 7015);
  c(Object.keys(D.movimientos).length === movAntes + 3 && nuevos.length === 3 && nuevos.every(([, m]) => m.tipo === 'entrada' && m.proveedor === 'Richetta' && m.fecha === hoy && /^E-\d{4}$/.test(m.numero || '')), 'con el Sí se cargan 3 entradas E- (la gaseosa sin código NO) · ' + JSON.stringify(nuevos.map(([, m]) => [m.codigo, m.numero, m.cantidad])));
  c(m3017 && m3017.precioUnit === 100 && m3017.precioOriginal === 121 && m3017.ivaPct === 21 && m3017.moneda === 'ARS' && m3017.cantidad === 20, 'precio: $ 121 con IVA → precioUnit $ 100 sin IVA + precioOriginal, moneda e ivaPct · ' + JSON.stringify(m3017 && [m3017.precioUnit, m3017.precioOriginal, m3017.ivaPct, m3017.moneda]));
  c(m1010 && m1010.cantidad === 50 && m7015 && m7015.cantidad === 3, 'el renglón corregido (50 m de cable) se carga corregido · ' + JSON.stringify(m1010 && m1010.cantidad));
  const fid = m3017 && m3017.fotoId, adj = fid && (D.adjuntos || {})[fid];
  c(fid && nuevos.every(([, m]) => m.fotoId === fid) && adj && adj.tipo === 'remito' && adj.remito === '0001-00012345' && (adj.dataUrl || adj.r2), 'la foto del remito queda en adjuntos (tipo remito) y vinculada a cada renglón (fotoId) · ' + fid);
  const au = Object.values(D.auditoria || {}).filter((a) => a.accion === 'remito_ia');
  c(au.length === 1 && au[0].porAsistente === true && (au[0].movIds || []).length === 3, 'auditoría «remito_ia» con porAsistente:true y los 3 movimientos · ' + JSON.stringify(au[0] && { d: au[0].detalle }));
  r = await p.evaluate(() => document.querySelector('#rfOv').textContent.replace(/\s+/g, ' '));
  c(/Entrada cargada: 3 renglones/.test(r) && /Gaseosa/.test(r) && /Quedaron afuera/.test(r), 'al terminar dice qué se cargó y qué quedó afuera · ' + r.slice(0, 160));
  await p.click('#rfOv [data-rf="cerrar"]'); await p.waitForTimeout(200);

  // ========================================================= 1b) remito ilegible y Worker caído
  await p.click('#rfBtn'); await p.waitForTimeout(200);
  guion.push({ legible: false, motivo: 'La foto está movida.', renglones: [] });
  await p.setInputFiles('#rfFotoGal', FOTO);
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-ilegible'))) break; }
  r = await p.evaluate(() => ({ t: (document.querySelector('#rfOv') || {}).textContent || '', otra: !!document.querySelector('#rfOv [data-rf="otra"]'), filas: !!document.getElementById('rfFilas') }));
  D = await db();
  c(/No se lee bien el remito/.test(r.t) && /movida/.test(r.t) && r.otra && !r.filas && Object.keys(D.movimientos).length === movAntes + 3, 'remito ilegible: lo dice, pide otra foto y no llena nada · ' + r.t.replace(/\s+/g, ' ').slice(0, 140));
  await p.click('#rfOv [data-rf="otra"]'); await p.waitForTimeout(200);
  guion.push('caido');
  await p.setInputFiles('#rfFotoGal', FOTO);
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-falla'))) break; }
  r = await p.evaluate(() => (document.querySelector('#rfOv') || {}).textContent || '');
  c(/no responde/.test(r) && /a mano/.test(r), 'Worker caído: mensaje claro y la carga a mano sigue igual · ' + r.replace(/\s+/g, ' ').slice(0, 140));
  await p.click('#rfOv [data-rf="cerrar"]'); await p.waitForTimeout(200);

  // ========================================================= 1c) en el panel del Asistente
  await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(900);
  r = await p.evaluate(() => !!document.querySelector('#iaChips [data-rfabrir]'));
  c(r, 'el panel del Asistente tiene el chip «📷 Cargar remito con foto»');
  await p.fill('#iaTxt', 'cargá este remito'); const nPed = pedidos.length; await p.click('#iaEnviar'); await p.waitForTimeout(400);
  r = await p.evaluate(() => !!document.getElementById('rfFotoGal'));
  c(r && pedidos.length === nPed, '«cargá este remito» en el chat abre la hoja del remito (sin mandar nada al Worker)');
  await p.evaluate(() => { window.__remitoFoto.cerrar(); const x = document.querySelector('[data-ia="volver"]') || document.querySelector('[data-ia="cerrar"]'); x && x.click(); });
  await p.waitForTimeout(300);

  // ========================================================= 2) código de barras
  await p.evaluate(() => {   // el lector de la app de Android (ML Kit) simulado
    window.__codigoFalso = '';
    window.Capacitor = Object.assign(window.Capacitor || {}, { isNativePlatform: () => true, Plugins: Object.assign((window.Capacitor && window.Capacitor.Plugins) || {}, { BarcodeScanner: { isGoogleBarcodeScannerModuleAvailable: async () => ({ available: true }), scan: async () => ({ barcodes: [{ rawValue: window.__codigoFalso }] }) } }) });
  });
  const ficha = async (cod) => { await p.evaluate((k) => { document.getElementById('pfModal') && document.getElementById('pfModal').remove(); const b = document.createElement('button'); b.className = 'pf-link'; b.dataset.cod = k; document.body.appendChild(b); b.click(); b.remove(); }, String(cod)); await p.waitForTimeout(400); };
  await p.evaluate(() => window.__v135.irStock('inventario')); await p.waitForTimeout(500);
  await ficha(2009);
  r = await p.evaluate(() => { const b = document.getElementById('eanBox'); return b ? { t: b.textContent.replace(/\s+/g, ' '), as: !!b.querySelector('[data-ean="asociar"]'), vale: !!b.querySelector('[data-ean="vale"]'), ent: !!b.querySelector('[data-ean="entrada"]') } : null; });
  c(r && /Sin código de barras/.test(r.t) && r.as && r.vale && r.ent, 'la ficha del material tiene «🔗 Asociar código de barras», «Hacer vale de salida» y «Entrada» · ' + JSON.stringify(r));
  await p.evaluate(() => { window.__codigoFalso = '7790000000022'; });
  await p.click('#eanBox [data-ean="asociar"]'); await p.waitForTimeout(700);
  D = await db();
  const c2009 = (D.catalogoProductos || {})['2009'];
  c(c2009 && JSON.stringify(c2009.ean) === '["7790000000022"]' && c2009.editadoPor === 'admin@' + DOM && c2009.editadoTs > 0, 'asociar con el lector: catalogoProductos/2009.ean = [7790000000022] con editadoPor y editadoTs · ' + JSON.stringify(c2009));
  r = await p.evaluate(() => document.getElementById('eanBox').textContent);
  c(/7790000000022/.test(r), 'la ficha muestra el código asociado');
  await foto(p, 'v137_3_asociar_ean', 500);
  // repetido
  await ficha(2010);
  await p.click('#eanBox [data-ean="asociar"]'); await p.waitForTimeout(600);
  r = await p.evaluate(() => { const v = document.getElementById('v7Preg'); return v ? v.textContent.replace(/\s+/g, ' ') : ''; });
  c(/ya está en otro producto/.test(r) && /2009/.test(r), 'un EAN que ya está en otro producto: avisa y pregunta · ' + r.slice(0, 160));
  await p.click('#v7Preg [data-v7p="no"]'); await p.waitForTimeout(500);
  D = await db();
  c(JSON.stringify((D.catalogoProductos['2009'] || {}).ean) === '["7790000000022"]' && !(D.catalogoProductos['2010'] && (D.catalogoProductos['2010'].ean || []).length), 'con «No» no cambia nada');
  await p.click('#eanBox [data-ean="asociar"]'); await p.waitForTimeout(600);
  await p.click('#v7Preg [data-v7p="si"]'); await p.waitForTimeout(800);
  D = await db();
  c(JSON.stringify(D.catalogoProductos['2010'].ean) === '["7790000000022"]' && JSON.stringify(D.catalogoProductos['2009'].ean) === '[]', 'con «Sí, pasarlo» queda solo en 2010 (nunca en dos) · ' + JSON.stringify([D.catalogoProductos['2009'].ean, D.catalogoProductos['2010'].ean]));
  await p.evaluate(() => { const m = document.getElementById('pfModal'); m && m.remove(); });
  // escanear desde el pañol: conocido → ficha
  await p.evaluate(() => { window.__codigoFalso = '7790000000015'; });
  await p.click('#esBtnPanol'); await p.waitForTimeout(700);
  r = await p.evaluate(() => { const f = document.getElementById('pfFoto'), m = document.getElementById('pfModal'); return { cod: f && f.dataset.cod, stock: m ? /Stock/.test(m.textContent) : false, vale: !!document.querySelector('#eanBox [data-ean="vale"]') }; });
  c(r.cod === '7015' && r.stock && r.vale, '«📷 Escanear» con un código conocido abre la ficha del producto con stock y «Hacer vale de salida» · ' + JSON.stringify(r));
  await p.click('#eanBox [data-ean="vale"]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ tipo: document.getElementById('stockMovTipo').value, prod: document.getElementById('stockMovProducto').value, vis: getComputedStyle(document.getElementById('cardStockRegistrar')).display }));
  c(r.tipo === 'salida' && /^7015 — /.test(r.prod) && r.vis !== 'none', '«Hacer vale de salida» lleva a Registrar movimiento con el producto puesto · ' + JSON.stringify(r));
  // desconocido → ¿a qué producto corresponde?
  await p.evaluate(() => window.__v135.irStock('inventario')); await p.waitForTimeout(400);
  await p.evaluate(() => { window.__codigoFalso = '7790000000039'; });
  await p.click('#esBtnPanol'); await p.waitForTimeout(700);
  r = await p.evaluate(() => { const v = document.getElementById('eanPreg'); return v ? v.textContent.replace(/\s+/g, ' ') : ''; });
  c(/¿A qué producto corresponde\?/.test(r) && /7790000000039/.test(r), 'código desconocido: «¿A qué producto corresponde?» con el buscador del catálogo · ' + r.slice(0, 120));
  await p.fill('#eanProd', '3017'); await p.click('#eanPreg [data-ep="ok"]'); await p.waitForTimeout(800);
  D = await db();
  r = await p.evaluate(() => (document.getElementById('pfFoto') || {}).dataset ? document.getElementById('pfFoto').dataset.cod : '');
  c(JSON.stringify((D.catalogoProductos['3017'] || {}).ean) === '["7790000000039"]' && r === '3017', 'lo asocia al producto elegido y abre su ficha');
  await p.evaluate(() => { const m = document.getElementById('pfModal'); m && m.remove(); });

  // ========================================================= 3) etiquetas QR de herramientas
  await p.evaluate(() => window.__v135.irStock('herramientas')); await p.waitForTimeout(1200);
  r = await p.evaluate(() => !!document.getElementById('etBtn'));
  c(r, 'Herramientas tiene «🏷 Imprimir etiquetas QR» y «📷 Escanear»');
  await p.click('#etBtn'); await p.waitForTimeout(400);
  r = await p.evaluate(() => document.querySelectorAll('#etOv .et-ch').length);
  c(r === 2, 'se eligen cuáles (las 2 herramientas, tildadas) · ' + r);
  await p.evaluate(() => { const ch = [...document.querySelectorAll('#etOv .et-ch')]; ch[1].checked = false; ch[1].dispatchEvent(new Event('change', { bubbles: true })); });
  await p.click('#etOv [data-et="imp"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const d = (document.querySelector('#hojaOv iframe') || {}).contentDocument; return d ? { n: d.querySelectorAll('.et').length, t: d.body.textContent.replace(/\s+/g, ' ') } : null; });
  const qrH = await decod(p, '.et img', true);
  c(r && r.n === 1 && /H-001/.test(r.t) && /Pinza amperométrica/.test(r.t) && !/H-002/.test(r.t), 'hoja A4 con la etiqueta elegida: QR, código H-001 y nombre · ' + JSON.stringify(r && r.n));
  c(qrH === BASE + '?doc=H-001', 'el QR de la etiqueta da la dirección de la herramienta · ' + qrH);
  await foto(p, 'v137_4_etiquetas_qr', 900);
  await p.evaluate(() => window.hojaEMA.cerrar(true));
  // escanear el QR de una herramienta → su ficha con entregar / devolver
  await p.evaluate(() => { window.__codigoFalso = 'https://miguelangelbasq-tech.github.io/alumbrado-stock/?doc=H-002'; });
  await p.click('#etBarra [data-v7esc]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const m = document.getElementById('hrModal'); return m ? { t: m.textContent.replace(/\s+/g, ' ').slice(0, 120), asig: !!m.querySelector('[data-hrp="asignar"]') } : null; });
  c(r && /H-002/.test(r.t) && r.asig, 'escanear el QR de una herramienta abre su ficha con «Asignar a una persona» (entregar) · ' + JSON.stringify(r));
  await p.evaluate(() => { const m = document.getElementById('hrModal'); m && m.remove(); });

  // ========================================================= 4) QR en el vale, la orden y la reserva
  await p.evaluate(() => window.verComprobanteMovimiento('m2')); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const d = (document.querySelector('#hojaOv iframe') || {}).contentDocument, q = d && d.querySelector('.ema-qr'); if (!q) return null; const a = q.getBoundingClientRect(), w = d.documentElement.clientWidth; return { der: Math.round(w - a.right), arriba: Math.round(a.top), w: Math.round(a.width), et: q.textContent, barras: !!d.querySelector('svg[class*=barcode], .barcode') }; });
  let qr = await decod(p, '.ema-qr img', true);
  c(r && r.der < 60 && r.arriba < 40 && r.w <= 90 && /S-0001/.test(r.et) && !r.barras, 'el vale tiene un QR chico arriba a la derecha (solo QR) · ' + JSON.stringify(r));
  c(qr === BASE + '?doc=S-0001', 'el QR del vale da …/?doc=S-0001 · ' + qr);
  await foto(p, 'v137_5_vale_con_qr', 900);
  await p.evaluate(() => window.hojaEMA.cerrar(true));
  await p.evaluate(() => window.imprimirOrdenTrabajo('ot1')); await p.waitForTimeout(1200);
  qr = await decod(p, '.ema-qr img', true);
  c(qr === BASE + '?doc=OT-2026-001', 'el QR de la orden da …/?doc=OT-2026-001 · ' + qr);
  await p.evaluate(() => window.hojaEMA.cerrar(true));
  await p.evaluate(() => { const r = (window.reservasMaterial || []).find((x) => x.numero === 'R-0001'); window.__rsImprimir.imprimir([r], 'Reserva R-0001 — Plaza San Martín'); }); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const d = (document.querySelector('#hojaOv iframe') || {}).contentDocument; return d ? d.querySelectorAll('.ema-qr, .ema-qr-r').length : -1; });
  qr = await decod(p, '.ema-qr-r img', true);
  c(r === 1 && qr === BASE + '?doc=R-0001', 'la reserva lleva un QR (uno solo) que da …/?doc=R-0001 · ' + qr);
  await p.evaluate(() => window.hojaEMA.cerrar(true));
  r = await p.evaluate(() => { const m = window.__codigos.matriz(window.__codigos.urlDoc('OT-2026-012')); return { n: m.length, ok: m.length >= 21 && (m.length - 17) % 4 === 0 }; });
  c(r.ok, 'el generador arma matrices QR válidas (21 + 4k módulos) · ' + JSON.stringify(r));

  // ========================================================= 5) ?doc= / ?obra= abren cada cosa
  const ir = async (q, ms) => { await p.goto('https://app.test/index.html' + q); await p.addScriptTag({ content: JSQR }); await p.waitForTimeout(ms || 6000); };
  await ir('?doc=S-0001');
  r = await p.evaluate(() => ({ hoja: window.hojaEMA.abierta() ? window.hojaEMA.actual().titulo : '', url: location.search }));
  c(/S-0001/.test(r.hoja) && !/doc=/.test(r.url), '?doc=S-0001 abre el vale en su hoja (y la dirección queda limpia) · ' + JSON.stringify(r));
  await foto(p, 'v137_6_abre_doc', 300);
  await ir('?doc=OT-2026-001');
  r = await p.evaluate(() => { const c = document.getElementById('parteResultCard'); return { vista: document.body.dataset.vista, vis: !!c && getComputedStyle(c).display !== 'none' && /OT-2026-001/.test(c.textContent) }; });
  c(r.vis, '?doc=OT-2026-001 abre la orden · ' + JSON.stringify(r));
  await ir('?doc=R-0001');
  r = await p.evaluate(() => { const c = document.querySelector('#cardStockReservas .rs-card[data-rsid="r1"]'); return { vis: !!c && c.getBoundingClientRect().height > 0, card: getComputedStyle(document.getElementById('cardStockReservas')).display }; });
  c(r.vis, '?doc=R-0001 abre la reserva en Pañol › Reservas · ' + JSON.stringify(r));
  await ir('?doc=H-001', 7000);
  r = await p.evaluate(() => { const m = document.getElementById('hrModal'); return m ? m.textContent.replace(/\s+/g, ' ').slice(0, 80) : ''; });
  c(/H-001/.test(r), '?doc=H-001 abre la ficha de la herramienta · ' + r);
  await ir('?obra=p1');
  r = await p.evaluate(() => ({ vista: document.body.dataset.vista, t: (document.getElementById('obrasApp') || {}).textContent || '' }));
  c(r.vista === 'obras' && /Plaza San Martín/i.test(r.t), '?obra=p1 abre el legajo de la obra · ' + r.vista);
  await A.browser.close();

  // sin permiso: el operario (pañol oculto) no ve el vale
  const B = await abrir({ sesion: 'juan', datos: datos(), cel, espera: 3000, https: true }), q = B.page;
  await q.goto('https://app.test/index.html?doc=S-0001'); await q.waitForTimeout(6000);
  r = await q.evaluate(() => ({ aviso: (document.getElementById('avisoApp') || {}).textContent || '', hoja: !!document.getElementById('hojaOv') }));
  c(/No tenés permiso para ver esto/.test(r.aviso) && !r.hoja, 'sin permiso: «No tenés permiso para ver esto» y no abre nada · ' + JSON.stringify(r));
  const errs = A.errores.concat(B.errores).filter((e) => !/jsQR|ResizeObserver/.test(e));
  c(!errs.length, 'sin errores de JavaScript · ' + errs.slice(0, 3).join(' | '));
  await B.browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
