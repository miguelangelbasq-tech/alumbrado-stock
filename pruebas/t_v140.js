// v140 · Remito «inteligente»: reconoce el remito ya cargado (con la IA o a mano en «Registrar movimiento», con el número
// escrito distinto y el proveedor parecido), compara renglón por renglón (✅ ya cargado · 🟠 a medias · 💲 sin precio · 🆕 no se
// cargó · 🔴 sin código) y propone: «➕ Cargar solo lo que falta» (sin duplicar stock), «Solo los precios que faltan» (el remito
// más viejo que el precio sigue avisando), «Revisar renglón por renglón», «Ver lo cargado» / «Cargar igual» / «Cancelar».
// Mismo número de otro proveedor = remito nuevo. Remito nuevo = igual que antes.
// Además: el dictado del Asistente no vuelve a escribir en la caja después de enviar (resultados tardíos del navegador y del
// plugin de la app 1.4, modo charla) ni pega el texto repetido.
const fs = require('fs');
const path = require('path');
const { abrir, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
const URL_IA = 'https://ema-ia.mdiaz-60f.workers.dev/ia';
const FOTO = path.join(__dirname, 'foto.jpg');
const CAP = process.env.CAP || path.join(__dirname, 'out140'); fs.mkdirSync(CAP, { recursive: true });
function datos() {
  const d = baseDatos();
  d.db.movimientos = {};
  d.db.catalogoProductos = { 3017: { codigo: 3017, costo: 90, costoFecha: '2020-01-01', costoTs: 1, editadoTs: 1 }, 1010: { codigo: 1010, costo: 1000, costoFecha: '2099-12-31', costoTs: 1, editadoTs: 1 } };
  return d;
}
(async () => {
  const c = prueba('v140' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', datos: datos(), cel, espera: 4000, https: true, iaPro: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  const suf = cel ? '_cel' : '_pc';
  const foto = async (nom, ms) => { await p.waitForTimeout(ms == null ? 500 : ms); await p.screenshot({ path: CAP + '/' + nom + suf + '.png' }); };
  const db = () => p.evaluate(() => window.__stubDB());
  const hoy = datos().hoy, dd = hoy.slice(8, 10) + '/' + hoy.slice(5, 7);
  const pedidos = [], guion = [];
  await p.route(URL_IA, async (rt) => {
    let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { }
    pedidos.push(b);
    const x = guion.shift();
    const text = typeof x === 'string' ? x : JSON.stringify(x || { legible: false, motivo: 'nada' });
    return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'msg_1', type: 'message', role: 'assistant', model: b.model, content: [{ type: 'text', text }], stop_reason: 'end_turn', ema: { costoUsd: 0.01 } }) });
  });
  const leer = async (rem) => {
    await p.evaluate(() => { window.__remitoFoto.cerrar(); window.__remitoFoto.abrir('entrada'); }); await p.waitForTimeout(250);
    guion.push(rem);
    await p.setInputFiles('#rfFotoGal', FOTO);
    for (let i = 0; i < 50; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.querySelector('#rfFilas, #rfCartel, #rfDup'))) break; }
    await p.waitForTimeout(250);
  };
  const vista = () => p.evaluate(() => ({ cartel: (document.getElementById('rfCartel') || {}).textContent || '', clase: (document.getElementById('rfCartel') || { className: '' }).className, filas: document.querySelectorAll('#rfFilas .rf-ren').length, dup: !!document.getElementById('rfDup'), si: !!document.querySelector('#rfOv [data-rf="si"]'), est: [...document.querySelectorAll('#rfEstLista .rf-est, #rfFilas .rf-estado .rf-est')].map((x) => x.className.replace('rf-est ', '')), btns: [...document.querySelectorAll('#rfCartel button')].map((b) => b.textContent.trim()) }));
  // carga a mano en «Registrar movimiento» (como la hace el pañolero)
  const aMano = async (l) => {
    await p.evaluate(() => window.__remitoFoto.cerrar()); await p.waitForTimeout(200);
    await p.evaluate(() => window.__v135.irStock('registrar')); await p.waitForTimeout(600);
    for (const x of l) {
      await p.evaluate((x) => {
        const v = (id, val) => { const e = document.getElementById(id); e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
        v('stockMovTipo', 'entrada'); v('stockMovProducto', String(x.cod)); v('stockMovCantidad', String(x.cant)); v('stockMovProveedor', x.prov); v('stockMovRemito', x.num); v('stockMovPrecio', x.precio == null ? '' : String(x.precio));
        const k = document.getElementById('stockMovPrecioAlCatalogo'); if (k) k.checked = false;
      }, x);
      await p.click('#stockMovBtn'); await p.waitForTimeout(700);
    }
  };
  const movsDe = (D, re) => Object.values(D.movimientos || {}).filter((m) => re.test(String(m.remito || '')) && m.tipo === 'entrada' && !m.anulado);
  let r, D;

  // ======================================================== 0) normalización
  r = await p.evaluate(() => { const R = window.__remitoFoto; return { a: R.numN('0001-00012345'), b: R.numN('1-12345'), c: R.numN('N° 0001.00012345'), d: R.mismoProv('Richetta', 'RICHETTA S.A.'), e: R.mismoProv('Richetta', 'Electro Norte'), f: R.mismoProv('Eléctrica Córdoba SRL', 'electrica cordoba'), g: R.numN('0001-00012346') }; });
  c(r.a === '1-12345' && r.b === '1-12345' && r.c === '1-12345' && r.g !== r.a, 'número normalizado: «0001-00012345» = «1-12345» = «N° 0001.00012345» · ' + JSON.stringify(r));
  c(r.d && r.f && !r.e, 'proveedor parecido: «Richetta» = «RICHETTA S.A.», tildes y SRL no cuentan; otro proveedor no · ' + JSON.stringify(r));

  // ======================================================== 1) remito nuevo: igual que antes
  const FUS = { desc: 'FUSIBLE CILINDRICO 10X38 2A', cant: 20, un: 'u', precio: 100, ean: null };
  const CAB = { desc: 'CABLE CU 4X4 MM2 XLPE IRAM 2178', cant: 100, un: 'm', precio: 2000, ean: null };
  const BPN = { desc: 'BORNERA DE PASO 6 MM2 GRIS', cant: 30, un: 'u', precio: 150, ean: null };
  const PORT = { desc: 'PORTAFUSIBLE TABAQUERA 10X38', cant: 10, un: 'u', precio: 500, ean: null };
  const GAS = { desc: 'Gaseosa cola 2,25 L', cant: 2, un: 'u', precio: 3000, ean: null };
  const rem = (prov, numero, renglones) => ({ legible: true, motivo: '', proveedor: prov, numero, fecha: hoy, moneda: 'ARS', preciosConIva: false, ivaPct: null, renglones });
  await leer(rem('Richetta', '0009-00000001', [FUS, CAB, GAS]));
  r = await vista();
  c(!r.cartel && !r.dup && r.filas === 3 && r.si && !r.est.length, 'remito nuevo: la tarjeta de siempre, sin cartel ni estados · ' + JSON.stringify(r));

  // ======================================================== 2) mismo número de otro proveedor → nuevo
  await aMano([{ cod: 3017, cant: 5, prov: 'Electro Norte', num: '0003-00005555', precio: 100 }]);
  D = await db();
  c(movsDe(D, /0003-00005555/).length === 1 && movsDe(D, /0003-00005555/)[0].proveedor === 'Electro Norte', 'carga a mano en «Registrar movimiento» (Electro Norte 0003-00005555)');
  await leer(rem('Richetta', '0003-00005555', [FUS, CAB]));
  r = await vista();
  c(!r.cartel && !r.dup && r.filas === 2 && r.si, 'mismo número de OTRO proveedor: no es el mismo remito, sale como nuevo · ' + JSON.stringify(r));

  // ======================================================== 3) cargado sin precio → «Solo los precios que faltan»
  await aMano([{ cod: 3017, cant: 20, prov: 'Feyco', num: '2-777', precio: null }, { cod: 1010, cant: 100, prov: 'Feyco', num: '2-777', precio: null }]);
  await leer(rem('FEYCO S.A.', '0002-00000777', [FUS, CAB]));
  r = await vista();
  c(/ya se cargó en parte el/.test(r.cartel) && /0 de 2 renglones/.test(r.cartel) && /2 sin precio/.test(r.cartel) && r.est.join() === 'sp,sp', 'cargado sin precio: «Este remito ya se cargó en parte el dd/mm: 0 de 2 renglones… 2 sin precio», los dos 💲 · ' + r.cartel.replace(/\s+/g, ' ').slice(0, 160));
  c(r.btns.some((b) => /Cargar solo lo que falta/.test(b)) && r.btns.some((b) => /Solo los precios que faltan/.test(b)) && r.btns.some((b) => /Revisar renglón por renglón/.test(b)) && r.btns.some((b) => /Cancelar/.test(b)), 'botones: «➕ Cargar solo lo que falta», «Solo los precios que faltan», «Revisar renglón por renglón», «Cancelar» · ' + r.btns.join(' | '));
  await foto('v140_3_sin_precio');
  const movAntesC = Object.keys((await db()).movimientos).length;
  await p.click('#rfCartel [data-rf="pprecios"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => [...document.querySelectorAll('#rfFilas .rf-ren')].map((x) => ({ cod: (x.querySelector('select[data-rf="cod"]') || {}).value, usa: !!(x.querySelector('[data-rf="usa"]') || {}).checked, viejo: x.classList.contains('rf-viejo'), est: (x.querySelector('.rf-est') || {}).textContent || '', txt: x.textContent.replace(/\s+/g, ' ') })));
  c(r.length === 2 && r[0].cod === '3017' && r[0].usa && /sin precio/.test(r[0].est) && r[1].cod === '1010' && r[1].viejo && !r[1].usa && /más viejo que el precio que ya tenés/.test(r[1].txt), '«Solo los precios que faltan»: la hoja de precios con el 💲 tildado; el remito más viejo que el precio sigue avisando y queda destildado · ' + JSON.stringify(r.map((x) => [x.cod, x.usa, x.viejo])));
  await p.click('#rfOv [data-rf="sip"]');
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(200); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-listo'))) break; }
  D = await db();
  const cp = D.catalogoProductos || {};
  c(cp[3017] && cp[3017].costo === 100 && cp[3017].costoFecha === hoy && /Feyco|FEYCO/.test(cp[3017].costoFuente || '') && cp[1010].costo === 1000, 'con el Sí: 3017 queda con $ 100 (fecha del remito), el 1010 no cambia · ' + JSON.stringify([cp[3017], cp[1010] && cp[1010].costo]));
  c(Object.keys(D.movimientos).length === movAntesC, 'solo precios: no se movió el stock');
  let res = Object.values(D.adjuntos || {}).filter((a) => a.tipo === 'remitoRes' && a.numN === '2-777');
  c(res.length === 1 && res[0].deCargaManual === true && (res[0].historial || []).length === 1 && new RegExp('completado el ' + dd + ' por .+: \\+0 renglones, 1 precio').test(res[0].historial[0].texto) && (res[0].movimientos || []).length === 2, 'el remito cargado a mano ahora tiene su resumen (remitoRes) con historial «completado el dd/mm por X: +0 renglones, 1 precio» · ' + JSON.stringify(res.map((x) => x.historial)));
  await p.click('#rfOv [data-rf="cerrar"]'); await p.waitForTimeout(300);

  // ======================================================== 4) cargado completo con la IA
  await leer(rem('Richetta', '0001-00011111', [FUS, CAB, GAS]));
  await p.evaluate(() => { const k = document.getElementById('rfCat'); if (k && k.checked) k.click(); });
  await p.click('#rfOv [data-rf="si"]');
  for (let i = 0; i < 50; i++) { await p.waitForTimeout(200); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-listo'))) break; }
  D = await db();
  const ia = movsDe(D, /0001-00011111/), nums = ia.map((m) => m.numero).sort();
  c(ia.length === 2 && ia.every((m) => m.porAsistente), 'primera vez: se cargan los 2 renglones con código, con la IA · ' + nums.join(','));
  await leer(rem('RICHETTA S.A.', '1-11111', [FUS, CAB, GAS]));
  r = await vista();
  c(r.clase.indexOf('completo') >= 0 && r.cartel.indexOf('🧾 Este remito ya se cargó completo el ' + dd + ' por Ana Admin (' + nums[0] + ' a ' + nums[1] + ')') === 0 && r.est.join() === 'ok,ok,sc', 'ya cargado completo: «🧾 Este remito ya se cargó completo el dd/mm por Ana Admin (E-… a E-…)», renglones ✅ ✅ 🔴 · ' + r.cartel.replace(/\s+/g, ' ').slice(0, 140));
  c(r.btns.length === 3 && /Ver lo cargado/.test(r.btns[0]) && /Cargar igual/.test(r.btns[1]) && /Cancelar/.test(r.btns[2]) && !r.filas && !r.dup, 'todo cargado: «Ver lo cargado», «Cargar igual», «Cancelar» (sin el aviso viejo encima) · ' + r.btns.join(' | '));
  await foto('v140_1_completo');
  await p.click('#rfCartel [data-rf="pver"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ t: (document.getElementById('rfPrevOv') || {}).textContent || '', ver: document.querySelectorAll('#rfPrevOv [data-rfp="ver"]').length }));
  c(r.ver === 2 && nums.every((n) => r.t.indexOf(n) >= 0) && /con la IA/.test(r.t), '«Ver lo cargado»: las entradas de ese remito con su N°, cantidad, precio, quién y «🧾 Ver» · ' + r.t.replace(/\s+/g, ' ').slice(0, 120));
  if (cel) c(await p.evaluate(() => { const k = document.querySelector('#rfPrevOv .v7-caja'); return k.scrollWidth <= k.clientWidth + 1; }), 'en el celu, «Ver lo cargado» sin scroll de costado');
  await p.click('#rfPrevOv [data-rfp="cerrar"]'); await p.waitForTimeout(250);
  await p.click('#rfCartel [data-rf="pigual"]'); await p.waitForTimeout(300);
  r = await vista();
  c(!r.cartel && r.filas === 3 && r.si && !r.est.length, '«Cargar igual»: la tarjeta de siempre, como antes · ' + JSON.stringify(r));
  await p.click('#rfOv [data-rf="no"]'); await p.waitForTimeout(250);
  await leer(rem('Richetta', '0001-00011111', [FUS, CAB, GAS]));
  await p.click('#rfCartel [data-rf="cerrar"]'); await p.waitForTimeout(250);
  c(!(await p.evaluate(() => !!document.getElementById('rfOv'))) && movsDe(await db(), /11111/).length === 2, '«Cancelar» cierra sin cargar nada');

  // ======================================================== 5) cargado a mano «1-12345» + foto «0001-00012345», a medias
  await aMano([{ cod: 3017, cant: 20, prov: 'RICHETTA S.A.', num: '1-12345', precio: 100 }, { cod: 1010, cant: 40, prov: 'RICHETTA S.A.', num: '1-12345', precio: 2000 }, { cod: 2009, cant: 30, prov: 'RICHETTA S.A.', num: '1-12345', precio: null }]);
  D = await db();
  c(movsDe(D, /^1-12345$/).length === 3 && movsDe(D, /^1-12345$/).every((m) => !m.porAsistente), 'carga a mano en «Registrar movimiento»: 3 entradas con remito «1-12345» de «RICHETTA S.A.»');
  await leer(rem('Richetta', '0001-00012345', [FUS, CAB, BPN, PORT, GAS]));
  r = await vista();
  c(/ya se cargó en parte el/.test(r.cartel) && /1 de 4 renglones/.test(r.cartel) && /Faltan 2 renglones \(1 a medias\) y 1 sin precio/.test(r.cartel) && r.clase.indexOf('parcial') >= 0, 'reconoce la carga a mano aunque el número esté escrito distinto: «ya se cargó en parte… 1 de 4 renglones. Faltan 2 renglones (1 a medias) y 1 sin precio» · ' + r.cartel.replace(/\s+/g, ' ').slice(0, 170));
  c(r.est.join() === 'ok,med,sp,nu,sc', 'renglón por renglón: ✅ ya cargado · 🟠 a medias · 💲 sin precio · 🆕 no se cargó · 🔴 sin código · ' + r.est.join());
  r = await p.evaluate(() => (document.querySelector('#rfEstLista .rf-er.e-med') || {}).textContent || '');
  c(/se cargaron 40,00 de 100,00 m/.test(r) && /faltan 100?60,00 m|faltan 60,00 m/.test(r), '🟠 dice «se cargaron 40 de 100 → faltan 60» · ' + r.replace(/\s+/g, ' '));
  await foto('v140_2_a_medias');
  // revisar renglón por renglón: tarjeta de siempre con los estados y tildada según la propuesta
  await p.click('#rfCartel [data-rf="previsar"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => [...document.querySelectorAll('#rfFilas .rf-ren')].map((x) => ({ est: ((x.querySelector('.rf-est') || {}).className || '').replace('rf-est ', ''), fuera: x.classList.contains('rf-fuera'), cant: (x.querySelector('[data-rf="cant"]') || {}).value, tilde: x.querySelector('[data-rf="tilde"]') ? x.querySelector('[data-rf="tilde"]').checked : null, psi: x.querySelector('[data-rf="psi"]') ? x.querySelector('[data-rf="psi"]').checked : null })));
  c(r.length === 5 && r[0].est === 'ok' && r[0].fuera && r[0].tilde === false && r[1].est === 'med' && !r[1].fuera && r[1].cant === '60' && r[1].tilde === true && r[2].est === 'sp' && r[2].psi === true && r[3].est === 'nu' && r[3].tilde === true && r[3].cant === '10' && r[4].est === 'sc', 'revisar: cada renglón con su estado; ✅ destildado (no duplica), 🟠 con lo que falta (60), 💲 con el precio tildado, 🆕 tildado · ' + JSON.stringify(r));
  r = await p.evaluate(() => ({ cab: !!document.getElementById('rfCartel'), si: (document.querySelector('#rfOv [data-rf="sic"]') || {}).textContent || '', res: (document.getElementById('rfRes') || {}).textContent || '' }));
  c(r.cab && /Sí, cargar lo tildado/.test(r.si) && /Se cargan 2 entradas/.test(r.res) && /1 precio/.test(r.res), 'arriba el cartel chico; «Sí, cargar lo tildado» y el resumen (2 entradas + 1 precio) · ' + r.res);
  await p.evaluate(() => { const k = document.querySelector('#rfOv .v7-caja'), f = document.querySelector('#rfFilas [data-ren="1"]'); if (k && f) k.scrollTop += f.getBoundingClientRect().top - k.getBoundingClientRect().top - 12; });
  await foto('v140_4_tarjeta_estados', 300);
  if (cel) c(await p.evaluate(() => { const k = document.querySelector('#rfOv .v7-caja'); return k.scrollWidth <= k.clientWidth + 1; }), 'en el celu, la tarjeta con estados sin scroll de costado');
  // tildar el ✅ avisa que duplica; destildarlo vuelve
  await p.click('#rfFilas [data-ren="0"] [data-rf="tilde"]'); await p.waitForTimeout(250);
  r = await p.evaluate(() => (document.getElementById('rfRes') || {}).textContent || '');
  c(/se duplica/.test(r), 'tildar un ✅ avisa que se duplica · ' + r);
  await p.click('#rfFilas [data-ren="0"] [data-rf="tilde"]'); await p.waitForTimeout(250);
  await p.click('#rfCartel [data-rf="popciones"]'); await p.waitForTimeout(300);
  // ➕ Cargar solo lo que falta
  const movAntes = Object.keys((await db()).movimientos).length;
  await p.click('#rfCartel [data-rf="pfalta"]');
  for (let i = 0; i < 50; i++) { await p.waitForTimeout(200); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-listo'))) break; }
  D = await db();
  const todos = Object.values(D.movimientos).filter((m) => m.tipo === 'entrada' && !m.anulado && /12345$/.test(String(m.remito || '')));
  const nuevosB = todos.filter((m) => m.porAsistente);
  const suma = (cod) => todos.filter((m) => String(m.codigo) === String(cod)).reduce((s, m) => s + m.cantidad, 0);
  c(Object.keys(D.movimientos).length === movAntes + 2 && nuevosB.length === 2 && nuevosB.some((m) => m.codigo == 1010 && m.cantidad === 60) && nuevosB.some((m) => m.codigo == 3053 && m.cantidad === 10), '«Cargar solo lo que falta»: 2 entradas nuevas, 1010 × 60 (la diferencia) y 3053 × 10 · ' + JSON.stringify(nuevosB.map((m) => [m.codigo, m.cantidad])));
  c(suma(3017) === 20 && suma(1010) === 100 && suma(2009) === 30 && suma(3053) === 10, 'sin duplicar: del remito quedan 20 fusibles, 100 m de cable, 30 BPN y 10 portafusibles · ' + JSON.stringify([suma(3017), suma(1010), suma(2009), suma(3053)]));
  c(nuevosB.every((m) => m.proveedor === 'Richetta' && m.remito === '0001-00012345' && m.completaRemito), 'las entradas nuevas llevan el remito y el proveedor del remito');
  c(D.catalogoProductos[2009] && D.catalogoProductos[2009].costo === 150 && D.catalogoProductos[2009].costoFecha === hoy, 'el 💲 (2009) recibe su precio en el catálogo ($ 150, fecha del remito), sin mover stock');
  res = Object.values(D.adjuntos || {}).filter((a) => a.tipo === 'remitoRes' && a.numN === '1-12345');
  c(res.length === 1 && res[0].deCargaManual && (res[0].movimientos || []).length === 5 && new RegExp('completado el ' + dd + ' por Ana Admin: \\+2 renglones, 1 precio').test((res[0].historial || [])[0] && res[0].historial[0].texto), 'resumen remitoRes creado (venía de una carga a mano) con historial «completado el dd/mm por Ana Admin: +2 renglones, 1 precio» · ' + JSON.stringify(res.map((x) => x.historial)));
  const au = Object.values(D.auditoria || {}).filter((a) => a.accion === 'remito_completar');
  c(au.length === 1 && au[0].porAsistente === true, 'auditoría «remito_completar»');
  r = await p.evaluate(() => (document.querySelector('#rfOv .v7-msg.bien') || {}).textContent || '');
  c(/Remito completado: \+2 renglones/.test(r) && /1 precio/.test(r), 'mensaje final «✓ Remito completado: +2 renglones… · 1 precio» · ' + r.replace(/\s+/g, ' '));
  await p.click('#rfOv [data-rf="cerrar"]'); await p.waitForTimeout(250);
  // otra vez el mismo remito: ahora completo; el resumen se actualiza, no se duplica
  await leer(rem('Richetta', '0001-00012345', [FUS, CAB, BPN, PORT, GAS]));
  r = await vista();
  c(r.clase.indexOf('completo') >= 0 && /ya se cargó completo/.test(r.cartel), 'leído de nuevo, ya está completo · ' + r.cartel.replace(/\s+/g, ' ').slice(0, 120));
  await p.evaluate(() => window.__remitoFoto.cerrar());

  // ======================================================== 6) dictado: nada vuelve a la caja después de enviar
  await p.evaluate(() => {
    window.__srLog = [];
    function SR() { this.lang = ''; }
    SR.prototype.start = function () { const s = this; setTimeout(() => { s.onresult && s.onresult({ results: [[{ transcript: 'cargá diez' }]] }); }, 200); };
    SR.prototype.stop = function () { const s = this; setTimeout(() => { s.onresult && s.onresult({ results: [[{ transcript: 'cargá diez metros' }]] }); }, 250); setTimeout(() => { s.onend && s.onend(); }, 400); };
    SR.prototype.abort = function () { const s = this; window.__srLog.push('abort'); setTimeout(() => { s.onresult && s.onresult({ results: [[{ transcript: 'cargá diez metros' }]] }); }, 250); setTimeout(() => { s.onend && s.onend(); }, 400); };
    window.webkitSpeechRecognition = SR; window.SpeechRecognition = SR;
  });
  await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(900);
  await p.fill('#iaTxt', '');
  await p.click('#iaPanel [data-ia="mic"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => document.getElementById('iaTxt').value);
  c(r === 'cargá diez', 'navegador: dictando, el texto aparece en la caja · ' + r);
  guion.push('Dale.');
  const nP = pedidos.length;
  await p.click('#iaEnviar'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ v: document.getElementById('iaTxt').value, log: window.__srLog, dict: !!document.querySelector('#iaPanel [data-ia="mic"].on') }));
  const envio = JSON.stringify(pedidos[nP] && pedidos[nP].messages ? pedidos[nP].messages[pedidos[nP].messages.length - 1] : '');
  c(r.v === '' && !r.dict && r.log.indexOf('abort') >= 0, 'navegador: al enviar se corta el dictado y lo que llega tarde NO vuelve a la caja (queda vacía) · ' + JSON.stringify(r));
  c(/cargá diez/.test(envio) && !/cargá diez metros/.test(envio), 'el mensaje salió con lo dictado hasta el momento · ' + envio.slice(-80));
  // plugin de la app 1.4: parciales tardíos (sin removeAllListeners) y texto pegado dos veces
  await p.evaluate(() => {
    const L = {}; window.__plugLog = [];
    const emitir = (n, x) => (L[n] || []).slice().forEach((f) => f(x));
    window.__emitirSR = emitir; window.__srVeces = 0;
    window.Capacitor = window.Capacitor || {}; window.Capacitor.Plugins = window.Capacitor.Plugins || {};
    window.Capacitor.isNativePlatform = () => true; window.Capacitor.isPluginAvailable = () => true;
    window.Capacitor.Plugins.SpeechRecognition = {
      available: async () => ({ available: true }), checkPermissions: async () => ({ speechRecognition: 'granted' }), requestPermissions: async () => ({ speechRecognition: 'granted' }),
      addListener: async (n, cb) => { (L[n] = L[n] || []).push(cb); return { remove() { L[n] = (L[n] || []).filter((x) => x !== cb); } }; },
      start: async () => { window.__srVeces++; if (window.__srVeces > 1) return; setTimeout(() => emitir('partialResults', { matches: ['hola che'] }), 200); setTimeout(() => emitir('partialResults', { matches: ['hola che hola che'] }), 400); if (window.__srModo === 'charla') setTimeout(() => { const viejos = (L.partialResults || []).slice(); emitir('listeningState', { state: 'stopped' }); setTimeout(() => { window.__tardio = true; viejos.forEach((f) => f({ matches: ['hola che tardísimo'] })); }, 450); }, 700); },
      stop: async () => { window.__plugLog.push('stop'); const LL = Object.assign({}, L); setTimeout(() => (LL.partialResults || []).slice().forEach((f) => f({ matches: ['hola che tarde'] })), 300); }
    };
    window.__srModo = 'dicta';
  });
  await p.fill('#iaTxt', '');
  await p.click('#iaPanel [data-ia="mic"]'); await p.waitForTimeout(650);
  r = await p.evaluate(() => document.getElementById('iaTxt').value);
  c(r === 'hola che', 'app 1.4: si el plugin pega el texto dos veces («hola che hola che»), en la caja queda una sola vez · ' + r);
  guion.push('Hola.');
  await p.click('#iaEnviar'); await p.waitForTimeout(900);
  r = await p.evaluate(() => ({ v: document.getElementById('iaTxt').value, log: window.__plugLog }));
  c(r.v === '' && r.log.indexOf('stop') >= 0, 'app 1.4: al enviar se corta el plugin y el parcial que llega tarde NO vuelve a la caja · ' + JSON.stringify(r));
  // modo charla: el envío automático vacía la caja y no se vuelve a llenar
  await p.evaluate(() => { window.__srVeces = 0; window.__srModo = 'charla'; window.__iaOndaSimulada = true; });
  guion.push('Te escucho.');
  const nC = pedidos.length;
  await p.click('#iaPanel [data-ia="charla"]');
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(150); if (pedidos.length > nC) break; }
  for (let i = 0; i < 20; i++) { await p.waitForTimeout(100); if (await p.evaluate(() => !!window.__tardio)) break; }
  await p.waitForTimeout(200);
  r = await p.evaluate(() => ({ v: document.getElementById('iaTxt').value, charla: document.body.classList.contains('ia-charlando'), tardio: !!window.__tardio }));
  const envC = JSON.stringify(pedidos[nC] && pedidos[nC].messages ? pedidos[nC].messages[pedidos[nC].messages.length - 1] : '');
  c(pedidos.length > nC && /hola che/.test(envC) && r.tardio && r.v === '', 'modo charla: lo dicho se manda solo, la caja queda vacía y un parcial tardío no la vuelve a llenar · ' + JSON.stringify(r));
  await p.evaluate(() => { const b = document.querySelector('#iaCharla [data-ia="charlafin"]'); b && b.click(); });
  await p.waitForTimeout(500);
  await p.evaluate(() => { delete window.Capacitor.Plugins.SpeechRecognition; });

  const errs = A.errores.filter((e) => !/favicon|ERR_|Failed to load/.test(e));
  c(!errs.length, 'sin errores de JavaScript · ' + errs.slice(0, 3).join(' | '));
  await A.browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
