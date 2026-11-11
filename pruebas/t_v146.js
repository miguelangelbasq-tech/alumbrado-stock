// v146 · Cierre del día por voz + pedido de compras automático + tablero del dueño + lo no terminado pasa solo a mañana.
//  1) cierre por voz (oficina, Worker simulado): botón en Órdenes › Para revisar y cerrar, chip «🎙 Cerrar el día», contexto con lo
//     que mandó la cuadrilla, tarjeta antes → después, «Sí, cerrar»: dos órdenes cerradas por el cierre de siempre (cantidades y
//     horas por persona) y una con «lo que falta a otro día» (orden nueva el jueves con vieneDe y pasadoA). La cuadrilla no lo tiene.
//  2) pedido de compras: bajo mínimo, obra programada (cómputo − apartado − stock libre), alternativa 🟢, por proveedor, hoja A4 con
//     y sin precios, guardar con «Sí» (adjuntos pedidoCompra sin precios), lo recibido con la entrada, el pañol sin precios.
//  3) tablero del dueño: datos (zona, certificado, órdenes hoy y mañana, gente, ausencias), cada tarjeta lleva a su pantalla,
//     «✨ Resumen de la semana» (Worker simulado), permisos (oficina solo habilitada, pañol y cuadrilla no), celu sin scroll de costado.
//  4) lo no terminado pasa a mañana: a las 18:00 se suma sola a la emitida de mañana, sin orden → borrador, llena → borrador del día
//     siguiente, sin duplicar (ya pasada a mano, ya está mañana, dos veces), aviso y «Deshacer», modo «preguntarme», dos aparatos a la vez.
const { abrir, otraPagina, prueba, DOM } = require('./h');
const { datos146 } = require('./datos146');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const CAP = process.env.CAP || '';
(async () => {
  const c = prueba('v146' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v145: true, v146: true, sugerida: true, inicio: true, porPartes: true, ofPasos: true, tarjetas: true, nav: true, mtNuevo: true, iaPro: true, https: true, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; } };
  let browser = null;
  const sesion = async (quien, datos, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos || datos146(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(900); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const ver = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden'; }, sel);
  const txt = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const sinToast = (p) => p.evaluate(() => { document.querySelectorAll('body *').forEach((e) => { if (e.children.length < 8 && /Falta cerrar la quincena/.test(e.textContent || '') && getComputedStyle(e).position === 'fixed') e.style.display = 'none'; }); });
  const scrollX = (p, sel) => p.evaluate((s) => { const o = document.querySelector(s); return Math.max(o ? o.scrollWidth - o.clientWidth : 0, document.documentElement.scrollWidth - document.documentElement.clientWidth); }, sel);
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Armo el cierre.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v3-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v3-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift(); const x = typeof f === 'function' ? f(b) : f; return x ? rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) }) : rt.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'prueba', mensaje: 'sin guion' } }) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', gastoMes: 12.4, tope: 100, partes: { preguntas: 9, remitos: 2, supervisor: 1.4 } }) }));
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 100; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const D0 = datos146(), hoy = D0.hoy, man = D0.man;

  // ================================================================= 1) cierre del día por voz (oficina)
  if (!process.env.SOLO || process.env.SOLO.indexOf('1') >= 0) {
    const A = await sesion('lucia'); const p = A.page;
    const sw = await worker(p); await p.waitForTimeout(400);
    await p.evaluate(() => window.mostrarVista('parte')); await p.waitForTimeout(1500);
    await p.evaluate(() => { const b = document.querySelector('[data-tbs="revisar"]'); b && b.click(); }); await p.waitForTimeout(700);
    c(await ver(p, '.cv-btn[data-cv="abrir"]'), 'Órdenes › Para revisar y cerrar: botón «✨ Cerrar el día por voz»');
    if (CAP) { await sinToast(p); await p.screenshot({ path: CAP + '/voz_boton_' + (cel ? 'cel' : 'pc') + '.png' }); }
    await p.click('.cv-btn[data-cv="abrir"]'); await p.waitForTimeout(1800);
    c(await ver(p, '#iaPanel') && /Cierre del día · 2 órdenes abiertas/.test(await txt(p, '#cvBanda')), 'se abre el Asistente en «modo cierre»: «🎙 Cierre del día · 2 órdenes abiertas» · ' + (await txt(p, '#cvBanda')).slice(0, 80));
    c(await p.evaluate(() => [...document.querySelectorAll('#iaChips [data-cv]')].some((x) => /Cerrar el día/.test(x.textContent))), 'chip «🎙 Cerrar el día» en el Asistente');
    const jue = await p.evaluate(() => window.__cierreVoz.fechaDe('jueves'));
    let pedidoCtx = '';
    sw.cola.push((b) => { pedidoCtx = JSON.stringify(b.messages[b.messages.length - 1]); return usa('proponer_cierre_dia', { ordenes: [{ otId: 'OT-2026-150', cantidades: { montaje_prfv: 4 }, horas: { 'Juan Pérez': 8, 'Pedro Gómez': 6 }, pasar: [{ k: 'montaje_vinculo', cant: 1, fecha: jue }] }, { otId: 'OT-2026-151', cantidades: { zanjeo: 35 } }] }); }, fin('Te dejé el cierre para confirmar.'));
    await p.fill('#iaTxt', 'Los Álamos se hicieron 4 izajes, Juan 8 horas, Pedro 6, faltó un vínculo, lo pasamos al jueves. Las Acacias 35 metros de zanja.'); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p);
    const herr = ((sw.pedidos[0] || {}).tools || []).map((t) => t.name);
    c(herr.indexOf('proponer_cierre_dia') >= 0, 'la oficina recibe la herramienta proponer_cierre_dia');
    c(/CIERRE DEL DÍA POR VOZ/.test(pedidoCtx) && /OT-2026-150/.test(pedidoCtx) && /se hizo 4 de 6/.test(pedidoCtx) && /OT-2026-151/.test(pedidoCtx), 'el contexto lleva las órdenes del día ya prellenadas con lo que mandó la cuadrilla («se hizo 4 de 6»)');
    const card = await txt(p, '#iaChat .ia-conf:last-of-type');
    c(/¿Cierro así\?/.test(card) && /Sí, cerrar/.test(card) && /OT-2026-150/.test(card) && /horas de Juan/.test(card) && /orden nueva/.test(card) && /OT-2026-151/.test(card) && /35/.test(card), 'tarjeta antes → después por orden con «Sí, cerrar» (horas por persona, lo que falta al jueves: orden nueva) · ' + card.slice(0, 150));
    if (CAP) { await sinToast(p); await p.evaluate(() => { const e = document.querySelector('#iaChat .ia-conf:last-of-type'); e && e.scrollIntoView(); }); await p.waitForTimeout(300); await p.screenshot({ path: CAP + '/voz_tarjeta_' + (cel ? 'cel' : 'pc') + '.png' }); }
    const d0 = await db(p);
    c(!(((d0.ordenesTrabajo || {}).v1 || {}).cierre || {}).cerradoTs, 'nada se cierra sin el «Sí»');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]');
    for (let i = 0; i < 80; i++) { await p.waitForTimeout(250); if (/Cerradas|No se pudo/.test(await txt(p, '#iaChat .ia-conf:last-of-type'))) break; }
    const msg = await txt(p, '#iaChat .ia-conf:last-of-type .ia-conf-msg');
    const d1 = await db(p), O = d1.ordenesTrabajo || {}, v1 = O.v1 || {}, v2 = O.v2 || {}, ci1 = v1.cierre || {}, ci2 = v2.cierre || {};
    const nueva = Object.keys(O).map((k) => Object.assign({ id: k }, O[k])).find((o) => o.vieneDe && o.vieneDe.otId === 'v1');
    c(/Cerradas: OT-2026-150, OT-2026-151/.test(msg), 'con «Sí, cerrar» se cierran las dos · ' + msg.slice(0, 160));
    c(ci1.cerradoTs && (ci1.cantidades || {}).montaje_prfv == 4 && (ci1.cantidades || {}).montaje_vinculo == 3, 'OT-150 cerrada por el cierre de siempre: izaje 4 (dicho) y vínculo 3 (lo que mandó la cuadrilla) · ' + JSON.stringify(ci1.cantidades));
    const hp = ci1.horasPersona || {};
    c(Number(hp['Juan Pérez']) === 8 && Number(hp['Pedro Gómez']) === 6, 'horas por persona: Juan 8, Pedro 6 · ' + JSON.stringify(hp));
    c(ci2.cerradoTs && (ci2.cantidades || {}).zanjeo == 35, 'OT-151 cerrada con 35 m de zanja (corregido por voz, la cuadrilla mandó 30)');
    c(!!nueva && nueva.fecha === jue && (nueva.previsto || {}).montaje_vinculo === 1 && nueva.plazaId === 'p1' && ((v1.pasadoA || {}).montaje_vinculo || {}).fecha === jue, '«lo que falta a otro día»: orden nueva el jueves (' + jue + ') con 1 vínculo, vieneDe y pasadoA en la OT-150 · ' + (nueva ? nueva.numero : 'sin orden'));
    c(Object.values(d1.auditoria || {}).some((a) => a.accion === 'asistente_editar' && /Cierro así/.test(a.detalle || a.texto || JSON.stringify(a))), 'auditoría del cierre por el asistente');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
    // la cuadrilla no lo tiene
    const B = await sesion('juan'); const pb = B.page;
    const cr = await pb.evaluate(async () => { const out = { cv: window.__cierreVoz.puede(), btn: window.__cierreVoz.botonHtml(), td: window.__tableroDueno.puede(), pc: window.__pedidoCompras.puede() }; try { await window.__iaCargar(); } catch (e) { } out.tool = window.__asistente ? window.__asistente.alcance().tools(window.__asistente.TOOLS).some((t) => t.name === 'proponer_cierre_dia') : false; return out; });
    c(!cr.cv && !cr.btn && !cr.tool, 'la cuadrilla no tiene el cierre por voz (ni el botón ni la herramienta)');
    c(!cr.td && !cr.pc && !(await pb.evaluate(() => !!document.getElementById('menuTableroDueno'))), 'la cuadrilla no ve el tablero del dueño ni el pedido de compras');
    await B.ctx.close();
  }

  // ================================================================= 2) pedido de compras (admin) + pañol sin precios
  if (!process.env.SOLO || process.env.SOLO.indexOf('2') >= 0) {
    const A = await sesion('admin'); const p = A.page;
    await p.evaluate(() => window.__v135.irStock('inventario')); await p.waitForTimeout(2200);
    c(await ver(p, '#pcCard') && /Pedido de compras sugerido/.test(await txt(p, '#pcCard')) && /4 materiales/.test(await txt(p, '#pcCard')), 'Pañol › Lista de compras: «🧾 Pedido de compras sugerido» se arma solo · ' + (await txt(p, '#pcCard')).slice(0, 120));
    await p.click('#pcCard [data-pq="abrir"]'); await p.waitForTimeout(1200);
    const P = await p.evaluate(() => { const A = window.__pedidoCompras.armar(7); const it = (c) => A.items.find((x) => x.codigo === String(c)) || null; return { g: A.grupos.map((g) => g.proveedor || '(sin)'), i3017: it(3017), i6010: it(6010), i1019: it(1019), i7015: it(7015), obras: A.obras.map((o) => o.obra) }; });
    c(P.i3017 && P.i3017.cant === 40 && /mínimo 50/.test(P.i3017.porque) && P.i3017.proveedor === 'Eléctrica del Centro' && P.i3017.precio === 300, 'bajo el mínimo: fusible 3017 → 40 (mínimo 50, hay 10), último proveedor y precio de las entradas');
    c(P.i6010 && P.i6010.cant === 8 && /para PLAZA LOS ÁLAMOS/.test(P.i6010.porque) && P.i6010.precio === 85000, 'obra programada: luminarias 12 del cómputo − 4 apartadas en la reserva, contra el stock libre → 8 («para PLAZA LOS ÁLAMOS hoy: 8 Un.») · ' + (P.i6010 && P.i6010.porque));
    c(P.i1019 && P.i1019.cant === 120 && P.i1019.alt && P.i1019.alt.codigo === '1025' && P.i1019.alt.hay === 200 && P.i1019.proveedor === 'Cables Mediterránea', 'alternativa 🟢: para el cable 1019 hay 200 m del 1025 (casi igual)');
    c(P.i7015 && P.i7015.precio == null && !P.i7015.proveedor && P.g.indexOf('(sin)') >= 0, 'sin entrada previa: «sin precio» y sin proveedor (no se inventan)');
    c(P.g[0] === 'Eléctrica del Centro' && P.g.indexOf('Cables Mediterránea') >= 0, 'agrupado por proveedor · ' + P.g.join(' / '));
    const t1 = await txt(p, '#pcOv');
    c(/Para los próximos 7 días/.test(t1) && /Eléctrica del Centro/.test(t1) && /Hay 200 m de 1025/.test(t1) && /sin precio/.test(t1) && /\$ 85\.000,00/.test(t1), 'pantalla: por proveedor, el porqué, la alternativa y el último precio');
    c((await scrollX(p, '#pcOv .sg-in')) <= 1, 'sin scroll de costado');
    if (CAP) { await sinToast(p); await p.screenshot({ path: CAP + '/compras_' + (cel ? 'cel' : 'pc') + '.png' }); }
    const kEle = await p.evaluate(() => window.__pedidoCompras.armar(7).grupos.find((g) => g.proveedor === 'Eléctrica del Centro').k);
    await p.click(`#pcOv [data-pq="hoja"][data-g="${kEle}"]`); await p.waitForTimeout(1500);
    const h1 = await p.evaluate(() => { const a = window.hojaEMA && window.hojaEMA.actual(); return { t: a ? a.titulo : '', doc: a ? a.doc : '' }; });
    c(/^Pedido de compras · Eléctrica del Centro/.test(h1.t) && /3017/.test(h1.doc) && /6010/.test(h1.doc) && /85\.000/.test(h1.doc) && !/1019/.test(h1.doc), '«📤 Pedido a Eléctrica del Centro»: hoja A4 (hojaPdf) con sus materiales y precios · ' + h1.t);
    await p.evaluate(() => { try { window.hojaEMA.cerrar(); } catch (e) { const o = document.getElementById('hojaOv'); if (o) o.remove(); } }); await p.waitForTimeout(400);
    if (!(await ver(p, '#pcOv'))) await p.evaluate(() => window.__pedidoCompras.abrir());
    await p.evaluate(() => { const x = document.querySelector('#pcOv [data-pq="precios"]'); x.checked = false; x.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(400);
    await p.click(`#pcOv [data-pq="hoja"][data-g="${kEle}"]`); await p.waitForTimeout(1500);
    const h2 = await p.evaluate(() => { const a = window.hojaEMA && window.hojaEMA.actual(); return a ? a.doc : ''; });
    c(/3017/.test(h2) && !/85\.000/.test(h2) && !/Precio unit/.test(h2), 'hoja «sin precios» (para mandar al proveedor si se elige)');
    await p.evaluate(() => { try { window.hojaEMA.cerrar(); } catch (e) { const o = document.getElementById('hojaOv'); if (o) o.remove(); } }); await p.waitForTimeout(400);
    if (!(await ver(p, '#pcOv'))) await p.evaluate(() => window.__pedidoCompras.abrir());
    const ad0 = Object.keys((await db(p)).adjuntos || {}).length;
    await p.click(`#pcOv [data-pq="guardar"][data-g="${kEle}"]`); await p.waitForTimeout(400);
    c(await ver(p, '#pcPreg') && Object.keys((await db(p)).adjuntos || {}).length === ad0, '«💾 Guardar el pedido» pide «Sí» (nada se escribe antes)');
    await p.click('#pcPreg [data-pq="siguardar"]'); await p.waitForTimeout(1200);
    const ped = Object.values((await db(p)).adjuntos || {}).find((x) => x.tipo === 'pedidoCompra');
    c(!!ped && ped.proveedor === 'Eléctrica del Centro' && ped.items.length === 2 && !/precio/i.test(JSON.stringify(ped.items)), 'guardado en adjuntos (tipo pedidoCompra, sin precios) · ' + (ped ? ped.items.map((x) => x.codigo + '×' + x.cant).join(', ') : ''));
    // llega el remito: entrada de 6010 × 8 de Eléctrica del Centro
    await p.evaluate(() => window.fbAddMovimiento({ tipo: 'entrada', codigo: 6010, desc: 'Luminaria LED 75 W', un: 'Un.', cantidad: 8, proveedor: 'Eléctrica del Centro', remito: '0001-00013000', precioUnit: 86000, fecha: new Date().toISOString().slice(0, 10), ts: Date.now() + 1000, usuario: 'admin@ema-alumbrado.app' })); await p.waitForTimeout(2000);
    const rec = await p.evaluate(async () => { const l = await window.__pedidoCompras.leerPedidos(true); const E = window.__pedidoCompras.estadoPedido(l[0]); const A = window.__pedidoCompras.armar(7); return { est: E.est, it: E.items.map((x) => x.codigo + ':' + x.recibido + '/' + x.cant), f3017: (A.items.find((x) => x.codigo === '3017') || null) }; });
    c(rec.est === 'med' && rec.it.indexOf('6010:8/8') >= 0 && rec.it.indexOf('3017:0/40') >= 0, 'cuando entra el remito se marca lo recibido (6010: 8 de 8; 3017: 0 de 40) · ' + rec.it.join(' '));
    c(!rec.f3017, 'lo ya pedido y sin recibir no se vuelve a sugerir (fusible 3017)');
    await p.waitForTimeout(1600);
    c(/Pedidos guardados/.test(await txt(p, '#pcOv')), '«📜 Pedidos guardados» con su estado');
    await A.ctx.close();
    // pañol: lo ve, sin precios
    const B = await sesion('pan'); const pb = B.page;
    const pq = await pb.evaluate(() => ({ puede: window.__pedidoCompras.puede(), cp: window.__pedidoCompras.conPrecio(), td: window.__tableroDueno.puede() }));
    await pb.evaluate(() => window.__pedidoCompras.abrir()); await pb.waitForTimeout(1200);
    const tp = await txt(pb, '#pcOv');
    c(pq.puede && !pq.cp && !/\$/.test(tp) && !/Con precios/.test(tp) && /Eléctrica del Centro/.test(tp), 'el pañol arma el pedido, sin precios');
    c(!pq.td, 'el pañol no ve el tablero del dueño');
    await B.ctx.close();
  }

  // ================================================================= 3) tablero del dueño
  if (!process.env.SOLO || process.env.SOLO.indexOf('3') >= 0) {
    const A = await sesion('admin'); const p = A.page;
    const sw = await worker(p); await p.waitForTimeout(400);
    c(await p.evaluate(() => !!document.getElementById('menuTableroDueno')), 'menú: «📊 Tablero del dueño» (admin)');
    await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(1500);
    c(await p.evaluate(() => !!document.querySelector('#iniEje [data-td="abrir"]')), 'Inicio Ejecutivo › Accesos: «Tablero del dueño»');
    await p.evaluate(() => document.querySelector('#iniEje [data-td="abrir"]').click()); await p.waitForTimeout(1500);
    const T = await p.evaluate(() => ({ D: window.__tableroDueno.datos(), z: window.__zonaContrato.resumen() }));
    const t1 = await txt(p, '#tdOv');
    c(await ver(p, '#tdOv') && /Tablero del dueño/.test(t1) && /Certificado y por certificar/.test(t1) && /Ganancia por obra/.test(t1) && /Material entregado sin avance/.test(t1) && /Alertas/.test(t1), 'se abre con sus tarjetas (contrato, ganancia, material sin avance, alertas)');
    c(T.D.kCert === 12.5 && T.D.z.zona === T.z.zona && Math.abs(T.D.z.pct - T.z.pct) < 1e-9 && /12,5/.test(t1), 'avance y certificado de nuestra zona (zona ' + T.z.zona + '; certificado 12,5 mód. del mes pasado cerrado)');
    c(T.D.oh.n === 2 && T.D.oh.mandadas === 2 && T.D.om.n === 1 && T.D.gente === 4 && T.D.aus.length === 1 && /Lucas Vera/.test(t1), 'órdenes de hoy (2, para cerrar 2) y de mañana (1), 4 personas en obra, 1 ausencia (Lucas Vera)');
    c(T.D.lista.every((x) => x.id !== 'p4'), 'el barrio (otra zona) no entra en el avance ni en la plata');
    c(/Asistente: US\$ 12,40/.test(t1) || /US\$ 12,4/.test(t1), 'gasto del asistente en el mes (v141) · ' + (t1.match(/Asistente: [^A-Z]*/) || [''])[0]);
    c((await scrollX(p, '#tdOv .sg-in')) <= 1, 'sin scroll de costado');
    if (CAP) { await sinToast(p); await p.screenshot({ path: CAP + '/tablero_' + (cel ? 'cel' : 'pc') + '.png' }); }
    sw.cola.push(fin('Semana: 2 órdenes para cerrar hoy, sin atrasos. Certificado 12,5 módulos del mes pasado.'));
    await p.click('#tdOv [data-td="resumen"]');
    for (let i = 0; i < 60; i++) { await p.waitForTimeout(250); if (/Semana:/.test(await txt(p, '#tdOv'))) break; }
    const bod = JSON.stringify(sw.pedidos[sw.pedidos.length - 1] || {});
    c(/Semana: 2 órdenes/.test(await txt(p, '#tdResTx')) && /Tablero del dueño/.test(bod) && /pregunta/.test(bod), '«✨ Resumen de la semana»: pedido corto al asistente (tipo pregunta, cuenta para el gasto)');
    await p.evaluate(() => { const ia = document.getElementById('iaPanel'); if (ia && !ia.hidden) { const x = ia.querySelector('[data-ia="cerrar"], [data-ia="volver"]'); x && x.click(); } }); await p.waitForTimeout(300);
    if (!(await ver(p, '#tdOv'))) await p.evaluate(() => window.__tableroDueno.abrir());
    await p.evaluate(() => document.querySelector('#tdOv [data-td="ir:cert"]').click()); await p.waitForTimeout(900);
    c(await ver(p, '#certOv') && !(await ver(p, '#tdOv')), 'cada tarjeta lleva a su pantalla (certificado → Certificación del mes)');
    await p.evaluate(() => window.__certMensual.cerrar());
    await p.evaluate(() => window.__tableroDueno.abrir()); await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelector('#tdOv [data-td="ir:ordenes"]').click()); await p.waitForTimeout(900);
    c(await p.evaluate(() => document.getElementById('viewParteDiario').style.display !== 'none'), 'órdenes → Órdenes');
    // habilitar a la oficina (con «Sí»)
    await p.evaluate(() => window.__tableroDueno.abrir()); await p.waitForTimeout(800);
    await p.evaluate(() => { const x = document.querySelector('#tdOv [data-tdq="uLucia"]'); x.checked = true; }); await p.click('#tdOv [data-td="quien"]'); await p.waitForTimeout(500);
    c(/Sí, guardar/.test(await txt(p, '#tdOv [data-td="quien"]')) && !((((await db(p)).configEquipo || {}).personal || {}).tableroDueno), '«¿Quién más lo ve?» pide «Sí, guardar»');
    await p.click('#tdOv [data-td="quien"]'); await p.waitForTimeout(900);
    c(((((await db(p)).configEquipo || {}).personal || {}).tableroDueno || {}).habilitados.indexOf('uLucia') >= 0, 'admin habilita a la oficina (configEquipo/personal.tableroDueno)');
    await A.ctx.close();
    const D2 = datos146(); const B = await sesion('lucia', D2); const pb = B.page;
    c(!(await pb.evaluate(() => window.__tableroDueno.puede())) && !(await pb.evaluate(() => !!document.getElementById('menuTableroDueno'))), 'la oficina sin habilitar no lo ve');
    await B.ctx.close();
    const D3 = datos146(); D3.db.configEquipo.personal.tableroDueno = { habilitados: ['uLucia'] };
    const C2 = await sesion('lucia', D3); const pc2 = C2.page; await pc2.waitForTimeout(1500);
    c(await pc2.evaluate(() => window.__tableroDueno.puede() && !!document.getElementById('menuTableroDueno')), 'la oficina habilitada sí lo ve');
    c(await pc2.evaluate(() => { window.__tableroDueno.abrir(); return !document.querySelector('#tdOv [data-td="resumen"]') && !document.querySelector('#tdOv [data-tdq]'); }), 'el resumen con IA y «quién lo ve» son solo de Administración');
    await C2.ctx.close();
  }

  // ================================================================= 4) lo no terminado de hoy pasa solo a mañana
  if (!process.env.SOLO || process.env.SOLO.indexOf('4') >= 0) {
    const a18 = (p) => p.evaluate((h) => { window.__pmAhora = new Date(h + 'T18:05:00').getTime(); window.__pmPausa = false; window.__pmEspera = 300; }, hoy);
    const A = await sesion('admin', datos146({ pasar: true })); const p = A.page; await a18(p);
    const plan = await p.evaluate((h) => { const P = window.__pasarManana.plan(h); return { sumar: P.sumar.map((x) => x.k + '→' + x.dstNum + ':' + x.cant), borr: P.borr.map((x) => x.obra + ':' + x.k + '@' + x.fecha + (x.lleno ? ':lleno' : '')), salt: P.saltear.map((x) => x.k + ':' + x.por) }; }, hoy);
    const r = await p.evaluate(() => window.__pasarManana.tic()); await p.waitForTimeout(1200);
    const d1 = await db(p), O = d1.ordenesTrabajo;
    c(O.m1.actividades.indexOf('montaje_prfv') >= 0 && O.m1.previsto.montaje_prfv === 2 && O.m1.previsto.montaje_vinculo === 4 && O.m1.previsto.excavacion === 4, 'a las 18:00 se suma sola a la emitida de mañana (OT-170): izaje 2 (quedó a medias, 4 de 6) y vínculo 4 («no se hizo») · ' + JSON.stringify(O.m1.previsto));
    c((O.h1.pasadoA.montaje_prfv || {}).numero === 'OT-2026-170' && (O.h1.pasadoA.montaje_vinculo || {}).auto, 'la de hoy queda marcada (pasadoA, auto)');
    c(plan.salt.some((x) => /^sellado_base/.test(x)) === false && !O.m1.previsto.sellado_base && plan.salt.some((x) => /^replanteo:ya está/.test(x)) && O.m3.previsto.replanteo === 1, 'sin duplicar: lo pasado a mano antes (sellado) y lo que ya está en la orden de mañana (replanteo) no se suman · ' + plan.salt.join(' | '));
    const E = await p.evaluate(() => JSON.parse(localStorage.getItem('ema.sug.E') || '{}'));
    c(((E[man] || {}).p2 || {}).agregar && E[man].p2.agregar.indexOf('zanjeo') >= 0 && E[man].p2.cant.zanjeo === 40, 'sin orden de mañana (Las Acacias): queda en el borrador de la sugerida, no se emite sola');
    c(plan.borr.some((x) => /montaje_metalica@/.test(x) && /lleno/.test(x) && x.indexOf('@' + D0.pasMan) > 0) && O.m3.actividades.indexOf('montaje_metalica') < 0, 'mañana llena (HH de los rendimientos): «no entra» y va al borrador del día siguiente · ' + plan.borr.join(' | '));
    c(await ver(p, '#pmAviso') && /Se pasaron 4 tareas de hoy a mañana/.test(await txt(p, '#pmAviso')) && /Deshacer/.test(await txt(p, '#pmAviso')), 'aviso «Se pasaron 4 tareas de hoy a mañana: … · Deshacer»');
    if (CAP) { await sinToast(p); await p.screenshot({ path: CAP + '/pasar_' + (cel ? 'cel' : 'pc') + '.png' }); }
    c(((((d1.configEquipo || {}).salud || {}).pasarManana || {})[hoy] || {}).dia && Object.values(d1.auditoria || {}).some((a) => a.accion === 'sugerida_pasar'), 'turno anotado en configEquipo/salud.pasarManana y auditoría sugerida_pasar');
    c(Object.values(d1.avisosPush || {}).some((a) => a.tipo === 'pasarmanana' && a.email === 'lucia@' + DOM), 'aviso al celu de la oficina');
    // sin duplicar: otra vuelta del reloj y otra corrida
    await p.evaluate(() => window.__pasarManana.tic()); const r2 = await p.evaluate((h) => window.__pasarManana.correr(h), hoy); await p.waitForTimeout(500);
    c((await db(p)).ordenesTrabajo.m1.previsto.montaje_prfv === 2 && (!r2.hecho || !r2.hecho.length), 'otra vuelta no suma de nuevo');
    // Deshacer
    await p.click('#pmAviso [data-pm="deshacer"]'); await p.waitForTimeout(1500);
    const d2 = await db(p), O2 = d2.ordenesTrabajo, E2 = await p.evaluate(() => JSON.parse(localStorage.getItem('ema.sug.E') || '{}'));
    c(JSON.stringify(O2.m1.actividades) === '["excavacion"]' && JSON.stringify(O2.m1.previsto) === '{"excavacion":4}' && !O2.h1.pasadoA.montaje_prfv && !(((E2[man] || {}).p2 || {}).agregar || []).length, '«Deshacer» vuelve todo atrás (orden de mañana, marca de la de hoy y borrador)');
    c(Object.values(d2.auditoria || {}).filter((a) => a.accion === 'sugerida_pasar').length >= 2, 'Deshacer queda en la auditoría (sugerida_pasar)');
    c(A.errores.length === 0, 'sin errores en la consola' + (A.errores.length ? ': ' + A.errores.slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
    // modo «preguntarme»
    const B = await sesion('admin', datos146({ pasar: true, preguntar: true })); const pb = B.page; await a18(pb);
    await pb.evaluate(() => window.__pasarManana.tic()); await pb.waitForTimeout(600);
    c(await ver(pb, '#pmAviso') && /Quedaron 4 tareas sin terminar hoy/.test(await txt(pb, '#pmAviso')) && !(await db(pb)).ordenesTrabajo.m1.previsto.montaje_prfv, 'modo «preguntarme»: pregunta y no toca nada');
    await pb.click('#pmAviso [data-pm="si"]'); await pb.waitForTimeout(1800);
    c((await db(pb)).ordenesTrabajo.m1.previsto.montaje_prfv === 2, 'con «Sí, pasarlas» se pasan');
    await B.ctx.close();
    // dos aparatos a la vez → una sola vez
    const C = await sesion('admin', datos146({ pasar: true })); const pc = C.page;
    const C2 = await otraPagina(C, Object.assign({}, MOD, { sesion: 'lucia' })); const pd = C2.page; await pd.waitForTimeout(1500);
    await a18(pc); await a18(pd);
    const [x1, x2] = await Promise.all([pc.evaluate((h) => window.__pasarManana.correr(h), hoy), pd.evaluate((h) => window.__pasarManana.correr(h), hoy)]);
    await pc.waitForTimeout(800);
    const d3 = await db(pc), n1 = (x1.hecho || []).length, n2 = (x2.hecho || []).length;
    c((n1 > 0) !== (n2 > 0) && Object.values(d3.auditoria || {}).filter((a) => a.accion === 'sugerida_pasar').length === 1 && d3.ordenesTrabajo.m1.previsto.montaje_prfv === 2, 'dos aparatos a la vez: se hace una sola vez (' + n1 + ' / ' + n2 + ')');
    await C.ctx.close();
  }
  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
