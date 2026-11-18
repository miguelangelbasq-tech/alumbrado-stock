// v168 · Luminarias armadas (datos168).
//  0) receta: el código lo elige la persona (la app propone el siguiente libre de la familia 6 y no lo pone sola), un código
//     usado se rechaza, las cantidades no vienen precargadas («a confirmar»), se guarda en catalogoProductos.armada.
//  1) armar 10: stock de cada pieza y de la armada, comprobante AR-0001 con QR (y ?doc=AR-0001), nada contado como salido /
//     gasto / entregado de ninguna obra en cada lugar que lee movimientos (lista del CHANGELOG).
//  2) no alcanza el stock: avisa, topea y no deja armar; anular el armado (vuelven las piezas) y volver a armar (AR-0002).
//  3) llevar 6 a PLAZA LOS ÁLAMOS: vale S- común; la obra recibe las piezas desglosadas (legajo, calculado vs. entregado,
//     entregadoAObra, costos de la obra, material contra avance); devolución de 2 armadas sin usar (vuelven como armadas).
//  4) DEPÓSITO LUMINARIAS → «Pasarlo a armadas» con «Sí»: devolución + armado, lo suelto con casilla, auditoría.
//  5) permisos: oficina igual que el pañol; cuadrilla, «solo mirar» y Dirección solo miran (sin botones); la cuadrilla ve la
//     armada como un producto más.
//  6) __v168No: todo como la v167.
const { abrir, prueba } = require('./h');
const { datos168 } = require('./datos168');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
(async () => {
  const c = prueba('v168' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 4500, nav: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v165: true, v166: true, v167: true, v168: true, reglas: !!process.env.REGLAS };
  let browser = null;
  const sesion = async (quien, op, dop) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos168(dop), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(800); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|sin permiso|Sin permiso|open-meteo/i.test(e));
  const tx = (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const esperar = async (p, fn, arg, ms) => { for (let i = 0; i < (ms || 40); i++) { if (await p.evaluate(fn, arg)) return true; await p.waitForTimeout(250); } return false; };
  const foto = async (p, nombre) => { if (!CAP) return; await p.waitForTimeout(300); await p.screenshot({ path: CAP + '/' + (cel ? 'cel_' : 'pc_') + nombre + '.png' }); };
  const fotoHoja = async (p, nombre) => { if (!CAP) return; await p.waitForTimeout(300); const e = await p.$('#arOv .v7-caja'); if (e) await e.screenshot({ path: CAP + '/' + (cel ? 'cel_' : 'pc_') + nombre + '.png' }); };
  const alPanol = async (p) => { await p.evaluate(() => { mostrarVista('stock'); const b = document.querySelector('#subtabsStock .subtab[data-sub="inventario"]'); b && b.click(); }); await p.waitForTimeout(1800); };
  const st = (p, cod) => p.evaluate((x) => stockActual(x), cod);
  const ent = (p, obra) => p.evaluate((o) => { const m = window.__reservas.entregadoAObra(o); const r = {}; m.forEach((v, k) => { r[k] = Math.round(v * 100) / 100; }); return r; }, obra);
  const COD = { lum: 6010, pre: 5040, cab: 1019 };
  // lo que cuenta consumo / gasto / entregado: tiene que dar igual antes y después de armar
  const consumo = (p) => p.evaluate(() => {
    const r = {}, J = (x) => JSON.stringify(x);
    const m2o = (m) => { const o = {}; m.forEach((v, k) => { o[k] = Math.round(v * 100) / 100; }); return o; };
    r.entregado = J((window.avanceObras || avanceObras).map((o) => [o.id, m2o(window.__reservas.entregadoAObra(o.id))]));
    r.balance = J(avanceObras.map((o) => calcularBalancePlaza(o).filas.map((f) => [f.codigo, f.entr]))) ;
    r.costeo = J(avanceObras.map((o) => { const x = window.GASTOS.costeoDe(o); return [o.id, x && x.mat ? Math.round(x.mat.total) : null]; }));
    r.matAv = J(avanceObras.map((o) => { try { const x = window.__matAvance.deObra(o); return [o.id, (x.filas || x.lineas || []).map((f) => [f.codigo, f.entregado != null ? f.entregado : f.ent])]; } catch (e) { return [o.id, 'err']; } }));
    r.mesGastos = J((() => { try { return window.__gastosPro.resumenMeses(); } catch (e) { return 'x'; } })());
    r.vista = window.__armVista(window.stockMovimientos).filter((m) => m.armado).length;
    r.inf = (() => { try { const I = window.__informeSemanal, R = I.armar(I.sem(I.lunesDe(fechaAISO(new Date())))); return J((R.panol && R.panol.salido) || []); } catch (e) { return 'x:' + e.message; } })();
    r.compras = J(comprasPorMinimo().map((x) => x.codigo).filter((x) => window.__armEs(x)));
    return r;
  });

  // ================================================================= 0..4) el pañolero, de punta a punta
  if (SOLO('0') || SOLO('1') || SOLO('2') || SOLO('3') || SOLO('4')) {
    const A = await sesion('pan'); const p = A.page;
    await alPanol(p);
    c(await p.evaluate(() => { const x = document.getElementById('arCard'); return !!x && !!x.offsetParent && !x.classList.contains('ar-off'); }), 'Pañol › Catálogo: está la tarjeta «🔧 Luminarias armadas»');
    c(/Tenés material en DEPOSITO LUMINARIAS/.test(await tx(p, '#arCard')), 'avisa que hay material en DEPOSITO LUMINARIAS');
    await foto(p, '01_panol_sin_receta');
    // ---------- 0) receta
    await p.click('#arCard [data-ar="nueva"]'); await p.waitForTimeout(500);
    const prop = await p.evaluate(() => window.__armadas.proponerCodigo());
    const r0 = await p.evaluate((pr) => { const s = window.__armadas.ocupados(); return { vacio: document.getElementById('arCod').value === '', boton: !!document.querySelector('#arOv [data-ar="prop"][data-arv="' + pr + '"]'), libre: !s.has(pr), fam: pr > 6000 && pr <= 6499 }; }, prop);
    c(r0.vacio && r0.boton, 'el código del pañol empieza vacío (la app no lo pone sola) y propone «Usar ' + prop + '»');
    c(r0.libre && r0.fam, 'lo propuesto es el siguiente libre de la familia 6 en x001–x499 (' + prop + ')');
    await p.fill('#arNom', 'Luminaria armada 7 m');
    await p.fill('#arCod', '6010'); await p.waitForTimeout(800);
    c(/ya está usado/.test(await tx(p, '#arOv .ar-mal')), 'un código usado (6010) se rechaza');
    await p.fill('#arCod', '6700'); await p.waitForTimeout(800);
    c(/x500–x999/.test(await tx(p, '#arOv .ar-mal')), 'un código x500–x999 se rechaza (son de la app)');
    await p.click('#arOv [data-ar="prop"]'); await p.waitForTimeout(400);
    c(await p.evaluate((pr) => document.getElementById('arCod').value === String(pr) && !document.querySelector('#arOv .ar-mal'), prop), 'con «Usar ' + prop + '» el código queda puesto y sin error');
    for (const q of ['6010', 'prensacable 3/4 5040', '1019']) { await p.fill('#arBus', q); await p.waitForTimeout(600); await p.click('#arOv .ar-resb'); await p.waitForTimeout(400); }
    const pz = await p.evaluate(() => [...document.querySelectorAll('#arOv [data-arpc]')].map((x) => ({ v: x.value, ph: x.placeholder })));
    c(pz.length === 3 && pz.every((x) => x.v === '' && x.ph === 'a confirmar'), 'las 3 piezas sin cantidad precargada («a confirmar»)');
    await fotoHoja(p, '02_receta_vacia');
    await p.click('#arOv [data-ar="guardarReceta"]'); await p.waitForTimeout(500);
    c(/Falta la cantidad/.test(await tx(p, '#arMsg')), 'sin cantidades no guarda («Falta la cantidad…»)');
    await p.fill('#arOv [data-arpc="0"]', '1'); await p.fill('#arOv [data-arpc="1"]', '1'); await p.fill('#arOv [data-arpc="2"]', '5,5');
    await fotoHoja(p, '03_receta');
    await p.click('#arOv [data-ar="guardarReceta"]'); await p.waitForTimeout(1500);
    const d0 = await db(p), doc = (d0.catalogoProductos || {})[String(prop)] || {};
    c(!!doc.armada && doc.desc === 'Luminaria armada 7 m' && doc.un === 'Un.' && doc.activo === true, 'la receta queda en catalogoProductos/' + prop + ' (nombre, Un., activo)');
    c(JSON.stringify((doc.armada && doc.armada.piezas || []).map((x) => [x.codigo, x.cant])) === JSON.stringify([[6010, 1], [5040, 1], [1019, 5.5]]), 'piezas: 1 luminaria + 1 prensacable + 5,5 m de cable'); if (process.env.DBG) console.log(JSON.stringify(doc.armada && doc.armada.piezas));
    c(!!doc.editadoPor && !!doc.editadoTs && !!doc.armada.ts, 'con editadoPor / editadoTs');
    const AR = prop;

    // ---------- 1) armar 10
    const antes = await consumo(p);
    const s0 = { lum: await st(p, COD.lum), pre: await st(p, COD.pre), cab: await st(p, COD.cab) };
    await alPanol(p);
    c(await esperar(p, (x) => !!document.querySelector('#arCard [data-ar="armar"][data-arc="' + x + '"]'), AR), 'la tarjeta de la armada con «Armar» y «Llevar a obra»');
    await p.click('#arCard [data-ar="armar"][data-arc="' + AR + '"]'); await p.waitForTimeout(500);
    await p.fill('#arN_n', '10'); await p.waitForTimeout(800);
    const hojaA = await tx(p, '#arOv .ar-grid');
    c(/10 Un\./.test(hojaA) && /55 m/.test(hojaA), '«Sale del pañol»: 10 luminarias, 10 prensacables, 55 m de cable');
    c(/\+10 Un\./.test(await tx(p, '#arOv .ar-entra')), '«Entra»: +10 armadas');
    if (process.env.DBG) console.log(await tx(p, '#arOv'));
    await p.fill('#arQuien', 'Juan Pérez, Pedro Gómez');
    await fotoHoja(p, '04_armar');
    await p.click('#arOv [data-ar="siArmar"]');
    c(await esperar(p, () => /AR-0001/.test((document.querySelector('#arOv') || {}).textContent || '') && /ya están en el stock/.test(document.querySelector('#arOv').textContent), null, 40), 'comprobante en pantalla: «Armado guardado» AR-0001 · «10 … ya están en el stock»');
    await fotoHoja(p, '05_comprobante');
    const s1 = { lum: await st(p, COD.lum), pre: await st(p, COD.pre), cab: await st(p, COD.cab), arm: await st(p, AR) };
    c(s1.lum === s0.lum - 10 && s1.pre === s0.pre - 10 && Math.abs(s1.cab - (s0.cab - 55)) < 1e-6 && s1.arm === 10, 'stock: luminarias ' + s0.lum + '→' + s1.lum + ', prensacables ' + s0.pre + '→' + s1.pre + ', cable ' + s0.cab + '→' + s1.cab + ' m, armadas 0→' + s1.arm);
    const d1 = await db(p), mv1 = Object.values(d1.movimientos).filter((m) => m.armado);
    c(mv1.length === 4 && mv1.every((m) => m.numero === 'AR-0001' && m.armadoGrupo && !m.plazaId), '4 movimientos armado:true con numero AR-0001 y sin obra');
    const eA = mv1.find((m) => m.tipo === 'entrada') || {};
    c(Math.abs(eA.precioUnit - (85000 + 1200 + 5.5 * 900)) < 0.01 && (eA.receta || []).length === 3 && /suma de las piezas/.test(eA.precioFuente || ''), 'la entrada lleva el costo (suma de las piezas al último costo: ' + eA.precioUnit + '), la receta copiada y de dónde sale');
    c(JSON.stringify(eA.quienes) === JSON.stringify(['Juan Pérez', 'Pedro Gómez']), 'quiénes armaron');
    c(await p.evaluate(() => { const i = document.querySelector('#arOv .ar-comp img'); return !!i && /^data:image\/png/.test(i.src); }), 'el comprobante en pantalla tiene su QR');
    const despues = await consumo(p);
    for (const k of Object.keys(antes)) c(antes[k] === despues[k], 'armar no cambia ' + ({ entregado: 'lo entregado a cada obra (__reservas.entregadoAObra)', balance: 'calculado vs. entregado (calcularBalancePlaza)', costeo: 'el costo de material de cada obra (GASTOS.costeoDe)', matAv: 'material contra avance (__matAvance)', mesGastos: 'los gastos por mes (gastosPro)', vista: 'la vista de consumo (sin patas del armado)', inf: 'lo salido de la semana (informe semanal)', compras: 'la lista de compras (las armadas no se compran)' }[k] || k));
    const sec = await p.evaluate(() => { const b = document.querySelector('#subtabsStock .subtab[data-sub="sector"]'); b && b.click(); return true; }); await p.waitForTimeout(800);
    c(!/Armado|armad/i.test(await tx(p, '#cardStockSector')), '«📊 Por sector» no cuenta el armado como salida');
    // comprobante A4 con QR + ?doc=
    await p.evaluate((g) => window.__armadas.verArmado(g), eA.armadoGrupo); await p.waitForTimeout(1200);
    const hoja = await p.evaluate(() => { const h = document.getElementById('hojaOv'); if (!h) return null; const f = h.querySelector('iframe'); const d = f && f.contentDocument; const t = (d ? d.body.innerText : h.innerText) || ''; return { t: t.slice(0, 3000), qr: !!(d ? d.querySelector('.ema-qr img') : h.querySelector('.ema-qr img')), tit: (h.querySelector('.hj-tit b') || {}).textContent || '' }; });
    c(!!hoja && /AR-0001/.test(hoja.tit + hoja.t) && /no es gasto de ninguna obra/i.test(hoja.t), 'el comprobante A4 «Comprobante de armado — N° AR-0001» (no es gasto de ninguna obra)');
    c(!!hoja && hoja.qr, 'la hoja A4 lleva el QR (?doc=AR-0001)');
    await p.evaluate(() => { const x = document.querySelector('#hojaOv .hj-x'); x && x.click(); }); await p.waitForTimeout(500);
    await p.evaluate(() => { const x = document.getElementById('hojaOv'); x && x.remove(); });
    await p.evaluate(() => window.__codigos.abrirRef({ doc: 'AR-0001' })); await p.waitForTimeout(1500);
    c(/AR-0001/.test(await p.evaluate(() => { const h = document.getElementById('hojaOv'); return h ? (h.querySelector('.hj-tit b') || {}).textContent || '' : ''; })), '?doc=AR-0001 (QR) abre el comprobante del armado');
    await p.evaluate(() => { const x = document.getElementById('hojaOv'); x && x.remove(); });
    c(/Armado \(sale\)/.test(await p.evaluate(() => etiquetaTipoMov(window.stockMovimientos.find((m) => m.armado && m.tipo === 'salida'), false))), 'en «Movimientos / entregas» la pata se ve como «Armado (sale)»');

    // ---------- 2) no alcanza / anular / volver a armar
    await p.evaluate(() => window.__armadas.cerrar());
    if (SOLO('2') || !process.env.SOLO) {
      await alPanol(p); await p.click('#arCard [data-ar="armar"][data-arc="' + AR + '"]'); await p.waitForTimeout(500);
      await p.fill('#arN_n', '40'); await p.waitForTimeout(800);
      const na = await p.evaluate(() => ({ msg: (document.querySelector('#arOv .ar-mal') || {}).textContent || '', dis: document.querySelector('#arOv [data-ar="siArmar"]').disabled, hay: [...document.querySelectorAll('#arOv .ar-hay.mal')].length }));
      c(/No alcanza el stock: con lo que hay se pueden armar hasta 16/.test(na.msg) && na.dis && na.hay >= 1, 'no alcanza: avisa «hasta 16», marca la pieza que falta y no deja armar');
      await p.fill('#arN_n', '16'); await p.waitForTimeout(800);
      c(await p.evaluate(() => document.getElementById('arN_n').value === '16' && document.querySelector('#arOv [data-ar="mas"]').disabled), '«+» topea en 16 (lo que alcanza)');
      await p.click('#arOv [data-ar="x"]'); await p.waitForTimeout(300);
      // anular AR-0001
      await p.evaluate((g) => window.__armadas.abrir('anular', { G: g, anMot: '' }), eA.armadoGrupo); await p.waitForTimeout(400);
      c(await p.evaluate(() => document.querySelector('#arOv [data-ar="siAnular"]').disabled === false), 'se puede anular (las 10 siguen en el pañol)');
      await p.click('#arOv [data-ar="siAnular"]'); await p.waitForTimeout(600);
      c(/por qué/.test(await tx(p, '#arMsg')), 'anular pide el porqué');
      await p.fill('#arAnMot', 'Prueba: se cargó de más'); await p.click('#arOv [data-ar="siAnular"]'); await p.waitForTimeout(1500);
      const s2 = { lum: await st(p, COD.lum), arm: await st(p, AR) };
      c(s2.lum === s0.lum && s2.arm === 0, 'anulado: vuelven las piezas (luminarias ' + s2.lum + ') y las armadas a 0');
      const d2 = await db(p);
      c(Object.values(d2.movimientos).filter((m) => m.armado).every((m) => m.anulado === true && /Prueba/.test(m.anuladoMotivo)), 'las 4 patas quedan anuladas (no se borra nada) con el motivo');
      await p.click('#arOv [data-ar="x"]'); await p.waitForTimeout(300);
      await alPanol(p); await p.click('#arCard [data-ar="armar"][data-arc="' + AR + '"]'); await p.waitForTimeout(500);
      await p.fill('#arN_n', '10'); await p.waitForTimeout(700); await p.click('#arOv [data-ar="siArmar"]');
      c(await esperar(p, () => /AR-0002/.test((document.querySelector('#arOv') || {}).textContent || ''), null, 40), 'se vuelve a armar: AR-0002 (el número no se reutiliza)');
      await p.click('#arOv [data-ar="x"]'); await p.waitForTimeout(300);
    } else {
      // sin el grupo 2 igual queda un armado de 10 hecho
    }
    // armar no se puede si ya salieron: lo verifica el grupo 3

    // ---------- 3) llevar 6 a la plaza
    await p.evaluate(() => window.__armadas.cerrar());
    const e0 = await ent(p, 'p1');
    await alPanol(p);
    await p.click('#arCard [data-ar="llevar"][data-arc="' + AR + '"]'); await p.waitForTimeout(800);
    const ll = await p.evaluate(() => { const b = document.querySelector('#arOv .ar-obra'); return { primera: b ? b.textContent : '', on: b ? b.classList.contains('on') : false, n: document.getElementById('arN_n').value, rec: (document.querySelectorAll('#arOv .ar-grid2')[0] || {}).textContent || '', boton: (document.querySelector('#arOv [data-ar="siLlevar"]') || {}).textContent || '' }; });
    c(/PLAZA LOS ÁLAMOS/.test(ll.primera) && /Orden de hoy OT-2026-170/.test(ll.primera) && /pide 8, recibió 2/.test(ll.primera), 'primero la obra con orden de hoy: «PLAZA LOS ÁLAMOS · Orden de hoy OT-2026-170 · el cálculo pide 8, recibió 2»');
    c(ll.on && ll.n === '6', 'ya elegida, con 6 (lo que le falta, dentro de lo libre)');
    c(/6 Un\./.test(ll.rec) && /33 m/.test(ll.rec), '«La plaza recibe»: 6 luminarias, 6 prensacables, 33 m de cable');
    c(/Hacer vale · S-0003/.test(ll.boton), 'el botón dice el número del vale: «Hacer vale · S-0003»');
    await fotoHoja(p, '06_llevar');
    await p.click('#arOv [data-ar="siLlevar"]'); await p.waitForTimeout(1600);
    c(/Vale S-0003/.test(await tx(p, '#arOv .ar-ok')), 'vale hecho: S-0003');
    await fotoHoja(p, '07_vale');
    const d3 = await db(p), vale = Object.values(d3.movimientos).find((m) => m.numero === 'S-0003') || {};
    c(vale.tipo === 'salida' && String(vale.codigo) === String(AR) && vale.cantidad === 6 && vale.plazaId === 'p1' && /^VS/.test(vale.valeGrupo || '') && !vale.armado, 'es un vale de salida común (S-, valeGrupo) de la armada a la obra');
    const e1 = await ent(p, 'p1');
    c(e1['6010'] === (e0['6010'] || 0) + 6 && e1['5040'] === (e0['5040'] || 0) + 6 && Math.abs(e1['1019'] - (e0['1019'] || 0) - 33) < 1e-6 && !e1[String(AR)], 'lo entregado a la obra en piezas: +6 luminarias, +6 prensacables, +33 m (sin la armada)');
    const bal = await p.evaluate(() => calcularBalancePlaza(avanceObras.find((o) => o.id === 'p1')).filas.map((f) => [String(f.codigo), f.calc, f.entr]));
    c(JSON.stringify(bal.find((x) => x[0] === '6010')) === JSON.stringify(['6010', 8, 8]) && JSON.stringify(bal.find((x) => x[0] === '5040')) === JSON.stringify(['5040', 8, 6]), 'calculado vs. entregado: luminarias 8 de 8, prensacables 6 de 8');
    const cost = await p.evaluate(() => { const x = window.GASTOS.costeoDe(avanceObras.find((o) => o.id === 'p1')); return (x.mat.lineas || []).map((l) => [String(l.codigo), l.cant]); });
    c(JSON.stringify(cost.find((x) => x[0] === '6010')) === JSON.stringify(['6010', 8]) && !cost.some((x) => x[0] === String(AR)), 'costo de la obra: las piezas (8 luminarias), no la armada');
    const leg = await p.evaluate(async () => { mostrarVista('obras'); await new Promise((r) => setTimeout(r, 500)); abrirLegajo('p1'); await new Promise((r) => setTimeout(r, 1500)); const t = document.getElementById('obrasApp').textContent; return t; });
    if (process.env.DBG) console.log(leg.slice(0, 3000));
    const me = (leg.split('📦 Material entregado')[1] || '').split('🧾')[0];
    c(/PRENSACABLE 3\/4"5040[^]*6 Un\./.test(me) && /6010[^]*8 Un\./.test(me) && !/armada/i.test(me), 'el legajo («Material entregado») lo muestra en piezas');
    await foto(p, '08_legajo');
    const mav = await p.evaluate(() => { try { const x = window.__matAvance.deObra(avanceObras.find((o) => o.id === 'p1')); return JSON.stringify(x).indexOf('"' + 6010) >= 0 || JSON.stringify(x).indexOf('6010') >= 0; } catch (e) { return 'err ' + e.message; } });
    c(mav === true, 'material contra avance ve las luminarias entregadas');
    // devolución de 2 armadas (la de siempre)
    await p.evaluate(async (ar) => { await window.fbAddMovimiento({ tipo: 'entrada', devolucion: true, devolOrigen: 'obra', fecha: fechaAISO(new Date()), usuario: 'pan@ema-alumbrado.app', sector: 'alumbrado', devueltoPor: 'Juan Pérez', devolMotivo: 'Sobrante de obra', devolObs: '', proveedor: '', remito: '', devolGrupo: 'DVt1', devolGrupoN: 1, plazaId: 'p1', obraId: '4031', destino: 'PLAZA LOS ÁLAMOS', codigo: ar, desc: 'Luminaria armada 7 m', un: 'Un.', cantidad: 2, devolEstado: 'bueno', ts: Date.now() }); }, AR);
    await p.waitForTimeout(1200);
    const e2 = await ent(p, 'p1');
    c((await st(p, AR)) === 6 && e2['6010'] === e1['6010'] - 2 && Math.abs(e2['1019'] - (e1['1019'] - 11)) < 1e-6, 'devolución de 2 sin usar: vuelven como armadas (quedan 6) y la obra resta 2 luminarias y 11 m');
    // anular un armado cuyas armadas ya salieron: no se puede
    const g2 = await p.evaluate(() => { const g = [...window.__armadas.idx().grupos.values()].find((x) => x.numero === 'AR-0002' || (!x.anulado)); return g ? g.id : ''; });
    await p.evaluate(async (ar) => { const vg = 'VSt2'; await window.fbAddMovimiento({ tipo: 'salida', codigo: ar, desc: 'Luminaria armada 7 m', un: 'Un.', cantidad: 5, fecha: fechaAISO(new Date()), ts: Date.now(), usuario: 'pan@ema-alumbrado.app', retiradoPor: '', plazaId: 'p2', obraId: '4072', destino: 'PLAZA LAS ACACIAS', valeGrupo: vg, sector: 'alumbrado' }); }, AR);
    await p.waitForTimeout(1000);
    const pa = await p.evaluate((g) => window.__armadas.puedeAnular(g), g2);
    c(!pa.ok && /ya salieron/.test(pa.txt), 'anular un armado cuyas armadas ya salieron no se puede («las otras ya salieron»)');
    await p.evaluate(() => { const x = document.getElementById('arOv'); x && x.remove(); });

    // ---------- 4) DEPÓSITO LUMINARIAS → armadas
    await alPanol(p);
    c(await esperar(p, () => !!document.querySelector('#arCard [data-ar="dep"]'), null, 20), 'la tarjeta del depósito ofrece «Pasarlo a armadas»');
    const armAntes = await st(p, AR), lumAntes = await st(p, COD.lum), cabAntes = await st(p, COD.cab);
    await p.click('#arCard [data-ar="dep"]'); await p.waitForTimeout(600);
    c(/6 Un\./.test(await tx(p, '#arOv .ar-grid2')) && /40 m/.test(await tx(p, '#arOv .ar-grid2')), 'muestra lo que figura en el depósito (6 luminarias, 6 prensacables, 40 m)');
    c(await p.evaluate(() => document.querySelector('#arOv [data-ar="siDep"]').disabled), 'hasta escribir cuántas hay, no deja confirmar');
    await p.fill('#arN_dep', '9'); await p.waitForTimeout(800);
    c(/no alcanza para 9: como mucho 6/.test(await tx(p, '#arOv .ar-mal')), 'si se pone más de lo que alcanza, avisa (como mucho 6)');
    await p.fill('#arN_dep', '6'); await p.waitForTimeout(800);
    const dep = await p.evaluate(() => ({ g: (document.querySelector('#arOv .ar-grid3') || {}).textContent || '', s: [...document.querySelectorAll('#arOv [data-arsuelta]')].map((x) => x.dataset.arsuelta) }));
    c(/7 m/.test(dep.g) && dep.s.join() === '1019', 'antes → después: queda 7 m de cable, con la casilla para devolverlo al pañol');
    await p.check('#arOv [data-arsuelta="1019"]'); await p.waitForTimeout(500);
    await fotoHoja(p, '09_deposito');
    await p.click('#arOv [data-ar="siDep"]');
    c(await esperar(p, () => /Pasado a armadas/.test((document.querySelector('#arOv') || {}).textContent || ''), null, 40), '«Sí» → «Pasado a armadas» con la nota de no seguir usando esa obra de depósito');
    c(/no uses esa obra como depósito/.test(await tx(p, '#arOv .ar-aviso')), 'la nota está');
    await fotoHoja(p, '10_deposito_hecho');
    await p.waitForTimeout(800);
    const eD = await ent(p, 'p5');
    c(!Object.keys(eD).some((k) => eD[k] > 1e-6), 'el depósito queda en 0 (6 luminarias, 6 prensacables y 40 m devueltos)');
    c((await st(p, AR)) === armAntes + 6 && (await st(p, COD.lum)) === lumAntes && Math.abs((await st(p, COD.cab)) - (cabAntes + 7)) < 1e-6, 'armadas +6; luminarias del pañol iguales; cable +7 m (lo suelto devuelto)');
    const d4 = await db(p);
    c(Object.values(d4.auditoria || {}).some((x) => x.accion === 'armadas_deposito'), 'auditoría armadas_deposito');
    c(Object.values(d4.movimientos).some((m) => m.devolucion && m.plazaId === 'p5' && /^D-/.test(m.numero || '')), 'la devolución desde el depósito tiene su comprobante D-');
    c(!(await p.evaluate(() => (avanceObras.find((o) => o.id === 'p5') || {}).oculta)), 'la obra depósito no se oculta sola');
    await p.click('#arOv [data-ar="x"]'); await p.waitForTimeout(300);
    // ficha del producto
    await p.evaluate((ar) => window.abrirFichaMaterial(ar), AR); await p.waitForTimeout(800);
    c(await p.evaluate(() => !!document.querySelector('#pfModal .ar-pf [data-ar="armar"]') && !!document.querySelector('#pfModal .ar-pf [data-ar="llevar"]')), 'la ficha del producto de la armada tiene «Armar» y «Llevar a obra»');
    await foto(p, '12_ficha');
    await p.evaluate(() => { const m = document.getElementById('pfModal'); m && m.remove(); });
    // pantalla del celu sin scroll de costado
    await alPanol(p); await foto(p, '11_panol_armadas');
    c((await scrollX(p)) <= 0, 'sin scroll de costado');
    c(errsJs(A).length === 0, 'sin errores de la página' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 3).join(' | ') : ''));
    await A.page.close();
  }

  // ================================================================= 5) permisos
  if (SOLO('5')) {
    const L = await sesion('lucia', null, { conArmadas: true }); await alPanol(L.page);
    c(await esperar(L.page, () => !!document.querySelector('#arCard [data-ar="armar"]') && !!document.querySelector('#arCard [data-ar="nueva"]'), null, 20), 'oficina: «Armar», «Llevar a obra» y «＋ Nueva armada»');
    await L.page.evaluate(() => window.__armadas.armar(6026, 4, ['Lucía']));
    await L.page.waitForTimeout(1200);
    c((await st(L.page, 6026)) === 8, 'oficina arma (4 más: 8)');
    await L.page.close();
    for (const [q, nom] of [['juan', 'cuadrilla'], ['mir', 'solo mirar'], ['dir', 'Dirección']]) {
      const X = await sesion(q, null, { conArmadas: true }); const p = X.page;
      await alPanol(p); await p.waitForTimeout(800);
      const r = await p.evaluate(() => { const x = document.getElementById('arCard'); return { ve: !!x && !!x.offsetParent && /Luminaria armada 7 m/.test(x.textContent), bot: !!document.querySelector('#arCard [data-ar="armar"], #arCard [data-ar="llevar"], #arCard [data-ar="nueva"], #arCard [data-ar="dep"]'), ed: window.__armadas.puedeEditar() }; });
      c(r.ve && !r.bot && !r.ed, nom + ': ve las armadas (4 listas) sin botones para armar ni llevar');
      let err = ''; try { await p.evaluate(() => window.__armadas.armar(6026, 1, [])); } catch (e) { err = String(e.message || e); }
      c(/no puede/.test(err), nom + ': armar por código también se frena');
      if (q === 'juan') c(await p.evaluate(() => catalogo().some((x) => x.codigo === 6026 && /armada/.test(x.desc))), 'cuadrilla: la armada está en el catálogo como un producto más');
      c(errsJs(X).length === 0, nom + ': sin errores' + (errsJs(X).length ? ': ' + errsJs(X).slice(0, 2).join(' | ') : ''));
      await p.close();
    }
  }

  // ================================================================= 6) compatibilidad
  if (SOLO('6')) {
    const A = await sesion('pan', { v168: false }); const p = A.page;
    await alPanol(p);
    const r = await p.evaluate(() => { const x = document.getElementById('arCard'); const l = window.stockMovimientos.slice(); return { oculto: !x || !x.offsetParent, misma: window.__armVista(l) === l, tipo: etiquetaTipoMov({ armado: true, tipo: 'salida' }, false) }; });
    c(r.oculto && r.misma && r.tipo === 'Salida', '__v168No: sin la tarjeta, sin desglose, el listado como antes');
    c(errsJs(A).length === 0, '__v168No: sin errores');
    await p.close();
  }
  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
