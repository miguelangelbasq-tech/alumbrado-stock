// v138 · «Atrás» del celular / navegador: cada capa se cierra (menú, Asistente, galería, visor de hojas, hoja A4, cierre de
// la orden, hojas del supervisor, remito, lector, etiquetas, pregunta, cámara), las pantallas vuelven en orden, en el Inicio
// no queda historia, «¿Salir sin guardar?» en Llenar orden (Sí sale, No se queda), abrir y cerrar con ✕ no deja entradas
// fantasma, ?doc= sigue andando. Además: remito con IA en PDF (bloque document), 3 fotos en un pedido, 30 renglones con
// resumen arriba y «Sí, cargar entrada» pegado abajo; PDF muy grande o con muchas páginas → «mandalo en partes».
const fs = require('fs');
const path = require('path');
const { abrir, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
const URL_IA = 'https://ema-ia.mdiaz-60f.workers.dev/ia';
const FOTO = path.join(__dirname, 'foto.jpg');
const TMP = path.join(__dirname, 'out138'); fs.mkdirSync(TMP, { recursive: true });
function pdfFalso(pags, extraBytes) {
  let s = '%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Count ' + pags + ' >> endobj\n';
  for (let i = 0; i < pags; i++) s += (3 + i) + ' 0 obj << /Type /Page /Parent 2 0 R >> endobj\n';
  s += '%%EOF\n';
  return Buffer.concat([Buffer.from(s, 'latin1'), Buffer.alloc(extraBytes || 0, 32)]);
}
function datos() {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  d.db.movimientos = {
    m1: { tipo: 'entrada', codigo: 3017, desc: 'FUSIBLE CILINDRICO 10 X 38 2 AMP', un: 'Un.', cantidad: 50, fecha: hoy, ts: ahora - 9e5, usuario: 'admin@' + DOM, numero: 'E-0001', proveedor: 'Richetta', remito: '0001-0009', precioUnit: 90 },
    m2: { tipo: 'salida', codigo: 3017, desc: 'FUSIBLE CILINDRICO 10 X 38 2 AMP', un: 'Un.', cantidad: 4, fecha: hoy, ts: ahora - 8e5, usuario: 'admin@' + DOM, numero: 'S-0001', valeGrupo: 'vg1', plazaId: 'p1', plazaNombre: 'Plaza San Martín', retiradoPor: 'Juan Pérez', sector: 'alumbrado' }
  };
  d.db.catalogoProductos = { 3017: { codigo: 3017, costo: 90, costoFecha: '2020-01-01', costoTs: 1, editadoTs: 1 }, 1010: { codigo: 1010, costo: 1000, costoFecha: '2099-12-31', costoTs: 1, editadoTs: 1 } };
  d.db.herramientas = { h1: { codigo: 'H-001', nombre: 'Pinza amperométrica', cat: 'medicion', estado: 'libre', creado: ahora - 864e5 } };
  return d;
}
(async () => {
  const c = prueba('v138' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', datos: datos(), cel, espera: 4000, https: true, iaPro: true }), p = A.page;
  const est = () => p.evaluate(() => Object.assign(window.__atras.estado(), { n: (history.state && history.state.ema) ? history.state.ema.n : null }));
  const atras = async (ms) => { await p.goBack(); await p.waitForTimeout(ms || 450); };
  const vista = () => p.evaluate(() => window.__atras.estado().vista);
  let r = await est();
  c(r.vista === 'inicio' && r.prof === 0 && r.n === 0 && r.pila.join() === 'inicio', 'al entrar: Inicio, sin historia de más (nivel 0) · ' + JSON.stringify(r));

  // ======================================================== 1) pantallas en orden: Inicio → Obras → legajo → atrás → atrás
  await p.evaluate(() => window.mostrarVista('obras')); await p.waitForTimeout(300);
  await p.evaluate(() => window.abrirLegajo('p1')); await p.waitForTimeout(900);
  r = await est();
  c(r.vista === 'obras' && r.capas.includes('legajo') && r.prof === 2 && r.n === 2, 'Obras + legajo abierto = 2 entradas · ' + JSON.stringify(r));
  await atras();
  r = await est(); const lista = await p.evaluate(() => !document.querySelector('#obrasApp [data-lgvolver]'));
  c(r.vista === 'obras' && lista && r.prof === 1, '«atrás» cierra el legajo y queda la lista de Obras · ' + JSON.stringify(r));
  await atras();
  r = await est();
  c(r.vista === 'inicio' && r.prof === 0 && r.n === 0, 'otro «atrás» vuelve al Inicio, sin historia de más · ' + JSON.stringify(r));
  // varias pantallas
  for (const v of ['obras', 'stock', 'mapa']) { await p.evaluate((x) => window.mostrarVista(x), v); await p.waitForTimeout(250); }
  r = await est();
  c(r.pila.join() === 'inicio,obras,stock,mapa' && r.prof === 3, 'Inicio → Obras → Pañol → Mapa = 3 entradas · ' + JSON.stringify(r));
  const orden = [];
  for (let i = 0; i < 3; i++) { await atras(); orden.push(await vista()); }
  c(orden.join() === 'stock,obras,inicio', '«atrás» vuelve en orden: Pañol, Obras, Inicio · ' + orden.join());
  // volver a una pantalla que ya estaba no apila (Obras → Pañol → Obras = Obras)
  await p.evaluate(() => { mostrarVista('obras'); mostrarVista('stock'); mostrarVista('obras'); }); await p.waitForTimeout(400);
  r = await est();
  c(r.pila.join() === 'inicio,obras' && r.prof === 1, 'ir y volver a la misma pantalla no apila entradas · ' + JSON.stringify(r));
  // ir al Inicio por el menú / la barra consume todo
  await p.evaluate(() => mostrarVista('mapa')); await p.waitForTimeout(250);
  await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(500);
  r = await est();
  c(r.vista === 'inicio' && r.prof === 0 && r.n === 0, 'ir al Inicio sin «atrás» también deja la historia en 0 · ' + JSON.stringify(r));

  // ======================================================== 2) cada tipo de capa se cierra con «atrás»
  const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mN4+vQpAAWuAtWnU9yRAAAAAElFTkSuQmCC';
  const capas = [
    ['menú lateral', () => window.abrirMenuLateral(), () => { const e = document.getElementById('menuLateral'); return !!e && e.classList.contains('abierto') && getComputedStyle(e).display !== 'none'; }],
    ['Asistente', () => window.__asistenteAbrir && window.__asistenteAbrir(), () => { const e = document.getElementById('iaPanel'); return !!e && !e.hidden; }, 2500],
    ['galería de fotos', (png) => window.emaGaleria.abrir([{ id: 'f1', mini: png, titulo: 'Foto 1' }, { id: 'f2', mini: png, titulo: 'Foto 2' }], 0), () => !!document.getElementById('gpVisor')],
    ['visor de hojas (#mfVisor)', (png) => window.__matFichas.visor(png), () => { const e = document.getElementById('mfVisor'); return !!e && !e.hidden && getComputedStyle(e).display !== 'none'; }],
    ['hoja A4 (#hojaOv)', () => window.hojaEMA.abrir('Prueba', '<html><body><p>Hoja</p></body></html>'), () => !!document.getElementById('hojaOv')],
    ['cierre de la orden', () => window.abrirCierreOt('ot1'), () => { const e = document.getElementById('cierreOt'); return !!e && e.style.display !== 'none' && e.classList.contains('abierto'); }, 900],
    ['Supervisor (#spHoja)', () => window.__supervisor.hoja(), () => { const e = document.getElementById('spHoja'); return !!e && !e.hidden; }],
    ['remito con foto (#rfOv)', () => window.__remitoFoto.abrir(), () => !!document.getElementById('rfOv')],
    ['lector de códigos (#esOv)', () => { window.__codigos.escanear(); }, () => !!document.getElementById('esOv'), 900],
    ['etiquetas QR (#etOv)', () => window.__codigos.elegirEtiquetas(), () => !!document.getElementById('etOv')],
    ['pregunta Sí/No (#v7Preg)', () => { window.__codigos.preguntar('¿Seguro?', 'Prueba'); }, () => !!document.getElementById('v7Preg')],
    ['¿De qué obra? (#ecElegir)', () => window.camaraApp.abrirHoja(), () => !!document.getElementById('ecElegir')]
  ];
  for (const [nom, fAbrir, fAb, ms] of capas) {
    try { await p.evaluate(fAbrir, PNG); } catch (e) { c(false, nom + ': no se pudo abrir · ' + e.message.slice(0, 120)); continue; }
    await p.waitForTimeout(ms || 600);
    const ab = await p.evaluate(fAb); const e1 = await est();
    if (!ab) { c(false, nom + ': no se abrió'); continue; }
    await atras(600);
    const sigue = await p.evaluate(fAb); const e2 = await est();
    c(e1.prof >= 1 && !sigue && e2.prof === 0 && e2.vista === 'inicio', `«atrás» cierra ${nom} y queda el Inicio (nivel ${e1.prof} → ${e2.prof}, capas ${e1.capas.join('/')}) `);
  }
  // capa sobre capa: hoja A4 encima del legajo
  await p.evaluate(() => { mostrarVista('obras'); abrirLegajo('p1'); }); await p.waitForTimeout(900);
  await p.evaluate(() => window.hojaEMA.abrir('Prueba', '<html><body><p>Hoja</p></body></html>')); await p.waitForTimeout(600);
  r = await est();
  await atras();
  const r2 = await p.evaluate(() => ({ hoja: !!document.getElementById('hojaOv'), leg: !!document.querySelector('#obrasApp [data-lgvolver]') }));
  c(r.prof === 3 && !r2.hoja && r2.leg, '«atrás» cierra la hoja de arriba y deja el legajo debajo · ' + JSON.stringify([r.prof, r2]));
  await atras(); await atras();
  r = await est();
  c(r.vista === 'inicio' && r.prof === 0, '… y dos «atrás» más llevan a Obras y al Inicio · ' + JSON.stringify(r));

  // ======================================================== 3) abrir y cerrar con ✕ no deja entradas fantasma
  for (let i = 0; i < 4; i++) {
    await p.evaluate(() => window.hojaEMA.abrir('Prueba', '<html><body><p>Hoja</p></body></html>')); await p.waitForTimeout(300);
    await p.click('#hojaOv [data-hj="cerrar"], #hojaOv .hj-x, #hojaOv [aria-label="Cerrar"]').catch(() => p.evaluate(() => window.hojaEMA.cerrar())); await p.waitForTimeout(300);
    await p.evaluate(() => window.__remitoFoto.abrir()); await p.waitForTimeout(250);
    await p.click('#rfOv [data-rf="cerrar"]'); await p.waitForTimeout(300);
  }
  await p.evaluate(() => window.abrirMenuLateral()); await p.waitForTimeout(300);
  await p.evaluate(() => window.cerrarMenuLateral()); await p.waitForTimeout(500);
  r = await est();
  c(r.prof === 0 && r.n === 0 && !r.capas.length, 'abrir y cerrar con ✕ 9 veces deja la historia en 0 (sin entradas fantasma) · ' + JSON.stringify(r));
  // con una pantalla de por medio: Obras → hoja ✕ → «atrás» va directo al Inicio
  await p.evaluate(() => mostrarVista('obras')); await p.waitForTimeout(250);
  await p.evaluate(() => window.hojaEMA.abrir('Prueba', '<html><body><p>Hoja</p></body></html>')); await p.waitForTimeout(300);
  await p.evaluate(() => window.hojaEMA.cerrar()); await p.waitForTimeout(500);
  await atras();
  c((await vista()) === 'inicio' && (await est()).prof === 0, 'Obras → hoja cerrada con ✕ → un solo «atrás» vuelve al Inicio');

  // ======================================================== 4) «¿Salir sin guardar?» en Llenar orden
  await p.evaluate(() => { mostrarVista('parte'); try { window.irSubOrdenes && window.irSubOrdenes('nueva'); } catch (e) { } }); await p.waitForTimeout(600);
  await p.evaluate(() => { const b = document.querySelector('#viewParteDiario .subtab[data-sub="llenar"], #viewParteDiario [data-ots="llenar"]'); if (document.getElementById('otEmitirBtn').offsetParent === null && b) b.click(); }); await p.waitForTimeout(400);
  const visForm = await p.evaluate(() => document.getElementById('otEmitirBtn').offsetParent !== null);
  c(visForm, '«Llenar orden» a la vista');
  await p.fill('#otNotas', 'Entrar por la calle lateral');
  await atras(500);
  r = await p.evaluate(() => ({ preg: !!document.getElementById('atPreg'), t: (document.getElementById('atPreg') || {}).textContent || '', v: window.__atras.estado().vista }));
  c(r.preg && /Salir sin guardar/.test(r.t) && r.v === 'parte', 'con datos, «atrás» pregunta «¿Salir sin guardar?» y todavía no sale · ' + JSON.stringify(r).slice(0, 140));
  await p.click('#atPreg [data-atp="no"]'); await p.waitForTimeout(500);
  r = await est();
  const notas = await p.evaluate(() => document.getElementById('otNotas').value);
  c(r.vista === 'parte' && r.prof === 1 && notas === 'Entrar por la calle lateral', '«No» se queda en Llenar orden con lo cargado (la entrada vuelve a estar) · ' + JSON.stringify(r));
  await atras(500);
  c(await p.evaluate(() => !!document.getElementById('atPreg')), 'otro «atrás» vuelve a preguntar');
  await p.click('#atPreg [data-atp="si"]'); await p.waitForTimeout(500);
  r = await est();
  c(r.vista === 'inicio' && r.prof === 0 && !(await p.evaluate(() => !!document.getElementById('atPreg'))), '«Sí, salir» sale al Inicio · ' + JSON.stringify(r));
  // sin datos no pregunta
  await p.evaluate(() => { mostrarVista('parte'); document.getElementById('otNotas').value = ''; }); await p.waitForTimeout(400);
  await atras(500);
  c(!(await p.evaluate(() => !!document.getElementById('atPreg'))) && (await vista()) === 'inicio', 'sin datos, «atrás» sale sin preguntar');
  // cierre de la orden con cambios
  await p.evaluate(() => window.abrirCierreOt('ot1')); await p.waitForTimeout(900);
  const inp = await p.$('#cierreCuerpo input:not([type=hidden]):not([type=checkbox]):not([disabled])');
  if (inp) { await inp.fill('3'); }
  await atras(500);
  r = await p.evaluate(() => ({ preg: !!document.getElementById('atPreg'), cierre: document.getElementById('cierreOt').classList.contains('abierto') }));
  c(!!inp && r.preg && r.cierre, 'cierre de la orden con cambios: «atrás» pregunta antes de cerrarlo · ' + JSON.stringify(r));
  if (r.preg) { await p.click('#atPreg [data-atp="si"]'); await p.waitForTimeout(600); }
  r = await p.evaluate(() => ({ cierre: document.getElementById('cierreOt').classList.contains('abierto'), prof: window.__atras.estado().prof }));
  c(!r.cierre && r.prof === 0, '«Sí» cierra el cierre como su ✕ · ' + JSON.stringify(r));

  // ======================================================== 5) remito: PDF, 3 fotos, 30 renglones
  const pedidos = []; const guion = [];
  await p.route(URL_IA, async (rt) => {
    let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { }
    pedidos.push(b);
    const x = guion.shift();
    return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'msg_1', type: 'message', role: 'assistant', model: b.model, content: [{ type: 'text', text: JSON.stringify(x) }], stop_reason: 'end_turn', ema: { costoUsd: 0.01 } }) });
  });
  const hoy = datos().hoy;
  const base = [
    { desc: 'FUSIBLE CILINDRICO 10X38 2A', cant: 20, un: 'u', precio: 121, ean: null },
    { desc: 'CABLE CU 4X4 MM2 XLPE IRAM 2178', cant: 100, un: 'm', precio: 2420, ean: null },
    { desc: 'Gaseosa cola 2,25 L', cant: 2, un: 'u', precio: 3000, ean: null }];
  const ren30 = []; for (let i = 0; i < 30; i++) ren30.push(Object.assign({}, base[i % 3], { cant: 1 + i }));
  const LARGO = { legible: true, motivo: '', proveedor: 'Richetta', numero: '0001-00099999', fecha: hoy, moneda: 'ARS', preciosConIva: false, ivaPct: null, renglones: ren30 };
  const pdf = path.join(TMP, 'remito_' + (cel ? 'cel' : 'pc') + '.pdf'); fs.writeFileSync(pdf, pdfFalso(2, 20000));
  await p.evaluate(() => window.__remitoFoto.abrir()); await p.waitForTimeout(300);
  r = await p.evaluate(() => (document.getElementById('rfFotoGal') || {}).accept + ' · multiple=' + (document.getElementById('rfFotoGal') || {}).multiple);
  c(/application\/pdf/.test(r) && /image/.test(r) && /multiple=true/.test(r), '«Elegir fotos o PDF» acepta imágenes y PDF, varias juntas · ' + r);
  guion.push(LARGO);
  await p.setInputFiles('#rfFotoGal', pdf);
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.querySelector('#rfFilas'))) break; }
  let b0 = pedidos[0];
  const doc = b0 && b0.messages[0].content.find((x) => x.type === 'document');
  c(doc && doc.source.media_type === 'application/pdf' && doc.source.type === 'base64' && Buffer.from(doc.source.data, 'base64').toString('latin1').startsWith('%PDF') && !b0.messages[0].content.some((x) => x.type === 'image'), 'el PDF va al Worker como bloque «document» (base64, application/pdf)');
  c(b0 && b0.model === 'claude-opus-5-5' && b0.max_tokens === 16000, 'remito con Opus y max_tokens 16000 (no se corta con muchos renglones) · ' + (b0 && b0.max_tokens));
  r = await p.evaluate(() => ({ n: document.querySelectorAll('#rfFilas .rf-ren').length, v: document.querySelectorAll('#rfFilas .rf-ren.g-v').length, a: document.querySelectorAll('#rfFilas .rf-ren.g-a').length, rr: document.querySelectorAll('#rfFilas .rf-ren.g-r').length, sum: (document.getElementById('rfSum') || {}).textContent || '', sumArriba: (() => { const s = document.getElementById('rfSum'), f = document.getElementById('rfFilas'); return !!s && !!f && (s.compareDocumentPosition(f) & 4) > 0; })() }));
  c(r.n === 30 && r.sumArriba && new RegExp('30 renglones\\s*' + r.v + ' 🟢\\s*' + r.a + ' 🟡\\s*' + r.rr + ' 🔴').test(r.sum.replace(/\s+/g, ' ')), 'una tarjeta con los 30 renglones y el resumen arriba («30 renglones · N 🟢 · N 🟡 · N 🔴») · ' + r.sum.replace(/\s+/g, ' '));
  c(r.rr === 10, 'los 10 renglones sin producto quedan 🔴 sin código (no se inventan códigos) · ' + r.rr);
  r = await p.evaluate(() => { const b = document.querySelector('#rfOv [data-rf="si"]'), caja = document.querySelector('#rfOv .v7-caja'); caja.scrollTop = 0; const q = b.getBoundingClientRect(), k = caja.getBoundingClientRect(); return { pos: getComputedStyle(document.getElementById('rfPie')).position, vis: q.bottom <= k.bottom + 1 && q.top >= k.top, alto: caja.scrollHeight > caja.clientHeight }; });
  c(r.pos === 'sticky' && r.vis && r.alto, '«Sí, cargar entrada» pegado abajo, a la vista aunque la tarjeta sea larga · ' + JSON.stringify(r));
  await p.waitForTimeout(100);
  r = await p.evaluate(() => { const caja = document.querySelector('#rfOv .v7-caja'); caja.scrollTop = caja.scrollHeight / 2; const b = document.querySelector('#rfOv [data-rf="si"]').getBoundingClientRect(), k = caja.getBoundingClientRect(); return b.bottom <= k.bottom + 1 && b.top >= k.top; });
  c(r, 'a mitad de la tarjeta el botón sigue a la vista');
  if (cel) c(await p.evaluate(() => document.querySelector('#rfOv .v7-caja').scrollWidth <= document.querySelector('#rfOv .v7-caja').clientWidth + 1), 'en el celu, sin scroll de costado');
  // cargar: entra con el PDF chico guardado
  await p.evaluate(() => { const k = document.getElementById('rfCat'); if (k && k.checked) k.click(); });   // sin tocar los costos del catálogo (los prueba «Solo precios»)
  const movAntes = Object.keys((await p.evaluate(() => window.__stubDB())).movimientos || {}).length;
  await p.click('#rfOv [data-rf="si"]');
  for (let i = 0; i < 60; i++) { await p.waitForTimeout(200); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-listo'))) break; }
  let D = await p.evaluate(() => window.__stubDB());
  const nuevos = Object.values(D.movimientos || {}).filter((m) => m.remito === '0001-00099999');
  const adj = nuevos[0] && nuevos[0].fotoId && (D.adjuntos || {})[nuevos[0].fotoId];
  c(Object.keys(D.movimientos).length === movAntes + 20 && nuevos.length === 20 && nuevos.every((m) => m.tipo === 'entrada' && m.porAsistente), 'con el Sí se cargan los 20 renglones con código (los 10 sin código no) · ' + nuevos.length);
  c(adj && adj.mime === 'application/pdf' && /^data:application\/pdf/.test(adj.dataUrl || ''), 'el PDF chico queda guardado como adjunto del remito · ' + (adj && adj.nombre));
  await p.click('#rfOv [data-rf="cerrar"]'); await p.waitForTimeout(300);
  // 3 fotos de un mismo remito → un solo pedido, una sola tarjeta
  await p.evaluate(() => window.__remitoFoto.abrir()); await p.waitForTimeout(300);
  guion.push(Object.assign({}, LARGO, { numero: '0001-00088888' }));
  const n0 = pedidos.length;
  await p.setInputFiles('#rfFotoGal', [FOTO, FOTO, FOTO]);
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.querySelector('#rfFilas'))) break; }
  b0 = pedidos[n0];
  const imgs = b0 ? b0.messages[0].content.filter((x) => x.type === 'image') : [];
  c(pedidos.length === n0 + 1 && imgs.length === 3 && imgs.every((x) => x.source.media_type === 'image/jpeg'), '3 fotos del mismo remito van en UN solo pedido (3 bloques image) · ' + imgs.length);
  r = await p.evaluate(() => ({ n: document.querySelectorAll('#rfFilas .rf-ren').length, tarjetas: document.querySelectorAll('#rfOv #rfFilas').length, pags: document.querySelectorAll('#rfOv .rf-pags img').length, sum: (document.getElementById('rfSum') || {}).textContent || '' }));
  c(r.n === 30 && r.tarjetas === 1 && r.pags === 3 && /3 páginas/.test(r.sum), 'una sola tarjeta con todos los renglones y las 3 páginas · ' + JSON.stringify(r));
  await p.click('#rfOv [data-rf="no"]'); await p.waitForTimeout(300);
  // PDF grande / con muchas páginas → «mandalo en partes», sin pedido
  const grande = path.join(TMP, 'grande_' + (cel ? 'cel' : 'pc') + '.pdf'); fs.writeFileSync(grande, pdfFalso(3, 3.7 * 1024 * 1024));
  const largo = path.join(TMP, 'largo_' + (cel ? 'cel' : 'pc') + '.pdf'); fs.writeFileSync(largo, pdfFalso(25, 1000));
  const n1 = pedidos.length;
  await p.evaluate(() => window.__remitoFoto.abrir()); await p.waitForTimeout(300);
  await p.setInputFiles('#rfFotoGal', grande); await p.waitForTimeout(700);
  const m1 = await p.evaluate(() => (document.getElementById('rfMsg') || {}).textContent || '');
  await p.setInputFiles('#rfFotoGal', largo); await p.waitForTimeout(700);
  const m2 = await p.evaluate(() => (document.getElementById('rfMsg') || {}).textContent || '');
  c(/mandalo en partes/i.test(m1) && /MB/.test(m1) && /mandalo en partes/i.test(m2) && /25 páginas/.test(m2) && pedidos.length === n1, 'PDF de más de 3,5 MB o de más de 20 páginas → «mandalo en partes», sin mandar nada · ' + m1.slice(0, 70) + ' | ' + m2.slice(0, 70));
  await p.evaluate(() => window.__remitoFoto.cerrar()); await p.waitForTimeout(400);


  // ======================================================== 7) «💲 Solo precios», remito repetido y «📜 Remitos cargados»
  const PRECIOS = { legible: true, motivo: '', proveedor: 'Richetta', numero: '0001-777', fecha: hoy, moneda: 'ARS', preciosConIva: true, ivaPct: 21, renglones: base };
  await p.evaluate(() => window.__remitoFoto.abrir()); await p.waitForTimeout(300);
  r = await p.evaluate(() => [...document.querySelectorAll('#rfOv [data-rf="modo"]')].map((b) => b.textContent));
  c(r.length === 2 && /Cargar entrada/.test(r[0]) && /Solo precios/.test(r[1]), 'al abrir el remito se elige «📦 Cargar entrada» o «💲 Solo precios» · ' + r.join(' | '));
  await p.click('#rfOv [data-rf="modo"][data-m="precios"]');
  guion.push(PRECIOS);
  const movAntesP = Object.keys((await p.evaluate(() => window.__stubDB())).movimientos || {}).length;
  await p.setInputFiles('#rfFotoGal', FOTO);
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.querySelector('#rfFilas'))) break; }
  r = await p.evaluate(() => [...document.querySelectorAll('#rfFilas .rf-ren')].map((x) => ({ cod: (x.querySelector('select[data-rf="cod"]') || {}).value || '', usa: !!(x.querySelector('[data-rf="usa"]') || {}).checked, hayUsa: !!x.querySelector('[data-rf="usa"]'), pre: ((x.querySelector('.rf-pre') || {}).textContent || '').replace(/\s+/g, ' '), viejo: x.classList.contains('rf-viejo'), txt: x.textContent.replace(/\s+/g, ' ') })));
  c(r.length === 3 && r[0].cod === '3017' && r[0].usa && /\$ ?90,00.*01\/01\/2020.*→.*\$ ?100,00.*sin IVA/.test(r[0].pre), 'renglón 🟢 3017: precio actual $ 90 (01/01/2020) → $ 100 sin IVA ($ 121 con IVA 21 %), tildado · ' + r[0] && r[0].pre);
  c(r[1] && r[1].cod === '1010' && r[1].viejo && !r[1].usa && /más viejo que el precio que ya tenés/.test(r[1].txt) && /revisá/.test(r[1].pre), 'remito más viejo que el precio guardado → aviso amarillo, destildado; cambio > 50 % → «revisá» · ' + JSON.stringify(r[1] && { usa: r[1].usa, pre: r[1].pre }));
  c(r[2] && r[2].cod === '' && !r[2].hayUsa, 'renglón sin código: no se ofrece actualizar nada (no se inventa código)');
  r = await p.evaluate(() => ({ si: (document.querySelector('#rfOv [data-rf="sip"]') || {}).textContent || '', res: (document.getElementById('rfRes') || {}).textContent || '' }));
  c(/Sí, actualizar precios/.test(r.si) && /Se actualizan 1 precio/.test(r.res) && /No se mueve el stock/.test(r.res), 'botón «Sí, actualizar precios» y el resumen dice que no se mueve el stock · ' + r.res);
  // en dólares, con la cotización
  await p.selectOption('#rfMon', 'USD'); await p.waitForTimeout(200);
  await p.fill('#rfDolar', '1000'); await p.waitForTimeout(200);
  r = await p.evaluate(() => (document.querySelector('#rfFilas [data-rfpre="0"]') || {}).textContent || '');
  c(/100\.000,00/.test(r), 'en U$S pasa a pesos con el dólar del día (U$S 121 c/IVA × 1000 → $ 100.000 sin IVA) · ' + r.replace(/\s+/g, ' '));
  await p.selectOption('#rfMon', 'ARS'); await p.waitForTimeout(200);
  await p.click('#rfOv [data-rf="sip"]');
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(200); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-listo'))) break; }
  D = await p.evaluate(() => window.__stubDB());
  const cp = D.catalogoProductos || {};
  c(cp[3017] && cp[3017].costo === 100 && cp[3017].costoFecha === hoy && cp[3017].costoFuente === 'remito Richetta 0001-777' && /admin@/.test(cp[3017].editadoPor || '') && cp[3017].editadoTs > 0, 'con el Sí: 3017 queda con costo $ 100 sin IVA, costoFecha = fecha del remito, costoFuente «remito Richetta 0001-777», editadoPor/editadoTs · ' + JSON.stringify(cp[3017]));
  c(cp[1010] && cp[1010].costo === 1000, 'el destildado (1010) no cambia');
  c(Object.keys(D.movimientos || {}).length === movAntesP, 'solo precios: no se hizo ningún movimiento (el stock no se mueve)');
  const auP = Object.values(D.auditoria || {}).filter((a) => a.accion === 'remito_precios');
  c(auP.length === 1 && auP[0].porAsistente === true, 'auditoría «remito_precios» con porAsistente:true');
  const res = Object.values(D.adjuntos || {}).filter((a) => a.tipo === 'remitoRes');
  const rp = res.find((a) => a.modo === 'precios'), re = res.find((a) => a.modo === 'entrada');
  c(rp && re && res.every((a) => !a.dataUrl && JSON.stringify(a).length < 60000) && rp.renglones.length === 3 && rp.renglones[0].codigo === 3017 && rp.renglones[0].precioAntes === 90 && rp.renglones[0].precioDespues === 100 && re.renglones.some((x) => /^E-\d{4}$/.test(x.mov || '')) && (re.movimientos || []).length === 20, 'cada remito deja su resumen liviano en adjuntos (tipo remitoRes, sin imagen): renglones, código, E- de las entradas o precio antes → después · ' + res.length);
  await p.click('#rfOv [data-rf="cerrar"]'); await p.waitForTimeout(300);
  // repetido: mismo proveedor + número
  await p.evaluate(() => window.__remitoFoto.abrir('entrada')); await p.waitForTimeout(300);
  guion.push(PRECIOS);
  await p.setInputFiles('#rfFotoGal', FOTO);
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.getElementById('rfDup'))) break; }
  r = await p.evaluate(() => (document.getElementById('rfDup') || {}).textContent || '');
  const dd = hoy.slice(8, 10) + '/' + hoy.slice(5, 7);
  c(r.includes('Este remito ya lo cargaste el ' + dd) && /Solo precios/.test(r) && /Ver/.test(r) && /Cargar igual/.test(r) && /Cancelar/.test(r), 'mismo proveedor + número → «Este remito ya lo cargaste el dd/mm (Solo precios)» con Ver / Cargar igual / Cancelar · ' + r.replace(/\s+/g, ' ').slice(0, 110));
  await p.click('#rfDup [data-dup="ver"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ ver: (document.getElementById('rhVer') || {}).textContent || '', dup: !!document.getElementById('rfDup') }));
  c(!r.dup && /0001-777/.test(r.ver) && /→/.test(r.ver), '«Ver» abre el remito ya cargado · ' + r.ver.replace(/\s+/g, ' ').slice(0, 100));
  await p.click('#rhVer [data-rh="cerrarVer"]'); await p.waitForTimeout(200);
  await p.evaluate(() => window.__remitoFoto.cerrar()); await p.waitForTimeout(300);
  await p.evaluate(() => window.__remitoFoto.abrir('entrada')); await p.waitForTimeout(300);
  guion.push(PRECIOS);
  await p.setInputFiles('#rfFotoGal', FOTO);
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.getElementById('rfDup'))) break; }
  await p.click('#rfDup [data-dup="igual"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ dup: !!document.getElementById('rfDup'), filas: document.querySelectorAll('#rfFilas .rf-ren').length, si: !!document.querySelector('#rfOv [data-rf="si"]') }));
  c(!r.dup && r.filas === 3 && r.si, '«Cargar igual» sigue con la tarjeta de entrada · ' + JSON.stringify(r));
  await p.evaluate(() => window.__remitoFoto.cerrar()); await p.waitForTimeout(300);
  await p.evaluate(() => window.__remitoFoto.abrir('entrada')); await p.waitForTimeout(300);
  guion.push(PRECIOS);
  await p.setInputFiles('#rfFotoGal', FOTO);
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.getElementById('rfDup'))) break; }
  await p.click('#rfDup [data-dup="cancelar"]'); await p.waitForTimeout(300);
  c(!(await p.evaluate(() => !!document.getElementById('rfOv') || !!document.getElementById('rfDup'))), '«Cancelar» no carga nada y cierra');
  // 📜 Remitos cargados
  await p.evaluate(() => window.__v135.irStock('registrar')); await p.waitForTimeout(700);
  r = await p.evaluate(() => { const b = document.getElementById('rhBtn'); return b && b.offsetParent !== null ? b.textContent : ''; });
  c(/Remitos cargados/.test(r), 'Pañol › Registrar movimiento tiene «📜 Remitos cargados»');
  await p.click('#rhBtn'); await p.waitForTimeout(800);
  r = await p.evaluate(() => [...document.querySelectorAll('#rhOv .rh-item')].map((x) => x.textContent.replace(/\s+/g, ' ')));
  c(r.length === 2 && r.some((x) => /0001-777/.test(x) && /Solo precios/.test(x) && /3 renglones/.test(x) && /admin/.test(x)) && r.some((x) => /0001-00099999/.test(x) && /Entrada/.test(x) && /30 renglones/.test(x)), 'la lista muestra cada remito: fecha, proveedor, N°, modo, renglones, total, quién y cuándo · ' + r.join(' || ').slice(0, 220));
  await p.fill('#rhBuscar', '777'); await p.waitForTimeout(200);
  const n777 = await p.evaluate(() => document.querySelectorAll('#rhOv .rh-item').length);
  await p.fill('#rhBuscar', ''); await p.selectOption('#rhProv', 'Richetta'); await p.waitForTimeout(200);
  const nProv = await p.evaluate(() => document.querySelectorAll('#rhOv .rh-item').length);
  await p.fill('#rhDesde', '2099-01-01'); await p.waitForTimeout(200);
  const nFecha = await p.evaluate(() => document.querySelectorAll('#rhOv .rh-item').length);
  await p.fill('#rhDesde', ''); await p.waitForTimeout(200);
  c(n777 === 1 && nProv === 2 && nFecha === 0, 'filtros: buscar, proveedor y fechas · ' + [n777, nProv, nFecha].join('/'));
  await p.click('#rhOv .rh-item:has-text("0001-00099999")'); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ t: (document.getElementById('rhVer') || {}).textContent || '', fotos: document.querySelectorAll('#rhVer [data-rh="foto"]').length }));
  c(/E-\d{4}/.test(r.t) && /quedó afuera/.test(r.t) && /1010/.test(r.t) && r.fotos === 1, 'tocar un remito: renglones con su código, los E- de las entradas, lo que quedó afuera y el PDF · ' + JSON.stringify({ fotos: r.fotos, t: r.t.replace(/\s+/g, ' ').slice(0, 120) }));
  await p.click('#rhVer [data-rh="imprimir"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ hoja: !!document.getElementById('hojaOv'), tit: (document.querySelector('#hojaOv .hj-tit') || {}).textContent || '' }));
  c(r.hoja && /Remito 0001-00099999/.test(r.tit), '«Imprimir / PDF» sale en la hoja A4 de la app · ' + r.tit.slice(0, 80));
  for (let i = 0; i < 6 && (await p.evaluate(() => window.__atras.estado().prof)) > 0; i++) await atras(400);
  c(!(await p.evaluate(() => !!document.getElementById('hojaOv') || !!document.getElementById('rhVer') || !!document.getElementById('rhOv'))), '«atrás» cierra la hoja, el remito y la lista');

  // ======================================================== 6) ?doc= sigue andando (y «atrás» después vuelve al Inicio)
  const p2 = p;
  await p2.goto('https://app.test/index.html?doc=S-0001'); await p2.waitForTimeout(5000);
  r = await p2.evaluate(() => ({ hoja: !!document.getElementById('hojaOv'), tit: (document.querySelector('#hojaOv .hj-tit') || {}).textContent || '', url: location.search, est: window.__atras.estado() }));
  c(r.hoja && r.url === '' && r.est.prof >= 1, '?doc=S-0001 abre el vale y limpia la dirección (con su entrada de «atrás») · ' + JSON.stringify({ hoja: r.hoja, tit: r.tit, url: r.url, prof: r.est.prof, capas: r.est.capas, pila: r.est.pila }));
  for (let i = 0; i < 4 && (await p2.evaluate(() => window.__atras.estado().prof)) > 0; i++) { await p2.goBack(); await p2.waitForTimeout(500); }
  r = await p2.evaluate(() => ({ hoja: !!document.getElementById('hojaOv'), est: window.__atras.estado(), url: location.href }));
  c(!r.hoja && r.est.vista === 'inicio' && r.est.prof === 0 && /app\.test\/index\.html$/.test(r.url), '«atrás» cierra el vale y deja el Inicio sin historia de más · ' + JSON.stringify({ v: r.est.vista, prof: r.est.prof, url: r.url }));

  const errs = A.errores.filter((e) => !/favicon|ERR_|Failed to load/.test(e));
  c(!errs.length, 'sin errores de JavaScript · ' + errs.slice(0, 3).join(' | '));
  await A.browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
