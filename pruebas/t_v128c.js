// v128 · Una tarea que está en una orden de ayer SIN CERRAR: aviso en «Llenar orden» con «Asignar igual» y «⚡ Cerrar esa tarea»
// (el cierre de esa orden mostrando solo esa tarea; la orden sigue «En curso» para lo demás).
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v128c' + (cel ? ' cel' : ''));
  const d = baseDatos(), ay = (() => { const x = new Date(); x.setDate(x.getDate() - 1); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); })();
  delete d.db.ordenesTrabajo.ot1;
  d.db.ordenesTrabajo.otY = { numero: 'OT-2026-040', fecha: ay, plazaId: 'p1', plazaNombre: 'Plaza San Martín', estado: 'Emitida', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['montaje_prfv', 'zanjeo'], actividadesManuales: [], previsto: { montaje_prfv: 2, zanjeo: 20 }, horaInicio: '07:00', horaFin: '13:00', creado: Date.now() };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  await p.click('#subtabsOrdenes .subtab[data-sub="nueva"]'); await p.waitForTimeout(1200);
  await p.evaluate(() => { const s = document.getElementById('otPlaza'); s.value = 'p1'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(2000);
  const T = '#otActividades .ot-tarea:has(.ot-act-check[value="montaje_prfv"])';
  let r = await p.evaluate(() => { const cb = document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]'), el = cb && cb.closest('.ot-tarea'); return el ? ((el.querySelector('.sc-linea') || {}).textContent || '') : 'sin fila'; });
  c(/OT-2026-040/.test(r) && /sin cerrar/.test(r), 'en «Llenar orden», la tarea avisa que está en una orden de ayer sin cerrar · ' + r.replace(/\s+/g, ' ').slice(0, 120));
  if (cel) { await p.evaluate(() => document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]').closest('.ot-tarea').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300); await p.screenshot({ path: __dirname + '/v128_sincerrar_cel.png' }); }
  await p.evaluate(() => document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]').closest('.ot-tarea').querySelector('[data-scigual]').click()); await p.waitForTimeout(400);
  r = await p.evaluate(() => { const cb = document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]'), el = cb.closest('.ot-tarea'); return { on: cb.checked, prev: (el.querySelector('.ot-act-prev') || {}).value, opt: window.__saSinCerrarOpt('montaje_prfv') }; });
  c(r.on && r.prev === '2' && /Sigue de la OT-2026-040/.test(r.opt), '«Asignar igual» la tilda con esa cantidad (y el motivo ya viene elegido) · ' + JSON.stringify(r).slice(0, 160));
  // ⚡ cerrar esa tarea
  await p.evaluate(() => document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]').closest('.ot-tarea').querySelector('[data-sccerrar]').click()); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const rows = [...document.querySelectorAll('#cierreCuerpo .cierre-tabla tbody tr')].filter((x) => x.querySelector('.cierre-qty')); return { vis: rows.filter((x) => getComputedStyle(x).display !== 'none').map((x) => x.querySelector('.cierre-qty').dataset.k), solo: !!document.getElementById('scSolo'), term: (document.getElementById('cierreTerminada') || {}).checked, tit: (document.getElementById('cierreTitulo') || {}).textContent }; });
  c(r.vis.join() === 'montaje_prfv' && r.solo && r.term === false && /OT-2026-040/.test(r.tit), 'abre el cierre de esa orden con esa tarea sola, sin darla por terminada · ' + JSON.stringify(r));
  if (cel) await p.screenshot({ path: __dirname + '/v128_solo_cel.png' });
  await p.fill('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]', '1'); await p.dispatchEvent('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]', 'input');
  await p.evaluate(async () => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); await guardarCierreOt(); }); await p.waitForTimeout(2500);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.otY; return { est: o.estado, cant: (o.cierre || {}).cantidades, solo: document.body.classList.contains('sc-solo') }; });
  c(r.est === 'En curso' && r.cant && r.cant.montaje_prfv === 1 && !r.cant.zanjeo, 'se guarda lo hecho de esa tarea y la orden sigue «En curso» para lo demás · ' + JSON.stringify(r));
  await p.waitForTimeout(1500);
  r = await p.evaluate(() => { const cb = document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]'), el = cb && cb.closest('.ot-tarea'); return el ? ((el.querySelector('.sc-linea') || {}).textContent || '') : ''; });
  c(!/sin cerrar/.test(r), 'después de cerrarla, el aviso se va · ' + r);
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  const errs = (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
