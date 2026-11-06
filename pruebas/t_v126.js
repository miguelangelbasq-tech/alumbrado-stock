// v126 · Una sola orden por obra y por día: al emitir otra para la misma obra y día, «Sumar a la OT-xxx»; y en el tablero,
// las que ya están repetidas se unen en una («Unir en…»), con las fotos y marcas de la cuadrilla.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v126' + (cel ? ' cel' : ''));
  const d = baseDatos(), o1 = d.db.ordenesTrabajo.ot1, f = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  o1.personal = [{ nombre: 'Juan Pérez', rol: 'Oficial' }]; o1.personalNombres = ['juan perez']; o1.actividades = ['zanjeo']; o1.actividadesManuales = []; o1.previsto = { zanjeo: 10 };
  const base = JSON.parse(JSON.stringify(o1));
  d.db.ordenesTrabajo.otA = Object.assign(JSON.parse(JSON.stringify(base)), { numero: 'OT-2026-020', fecha: f(1), campo: { fotos: { fa: { por: 'Juan Pérez', ts: 1, k: 'zanjeo', num: 'Tramo 1', mini: '' } }, marcas: { zanjeo: { hecho: true, cant: 4, por: 'Juan Pérez' } } } });
  d.db.ordenesTrabajo.otB = Object.assign(JSON.parse(JSON.stringify(base)), { numero: 'OT-2026-021', fecha: f(1), personal: [{ nombre: 'Pedro Gómez', rol: 'Ayudante' }], personalNombres: ['pedro gomez'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 3 }, campo: { fotos: { fb: { por: 'Pedro Gómez', ts: 2, k: 'montaje_prfv', num: 'Col 1', mini: '' } }, seguridad: { epp: true, baliza: true, herram: true, corte: 'no' } } });
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  // 1) orden nueva para la misma obra y el mismo día → «Sumar a la OT-…»
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  await p.click('#subtabsOrdenes .subtab[data-sub="nueva"]'); await p.waitForTimeout(1200);
  await p.evaluate(() => { const s = document.getElementById('otPlaza'); s.value = 'p1'; s.dispatchEvent(new Event('change', { bubbles: true })); window.__ordenNueva.sumarPersona('Pedro Gómez'); document.getElementById('otCuadrilla').value = 'C2'; });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const cb = document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]'); cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); const i = document.querySelector('#otActividades .ot-act-prev[data-id="montaje_prfv"]'); i.value = '2'; i.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(500);
  const n0 = await p.evaluate(() => Object.keys(window.__stubDB().ordenesTrabajo).length);
  await p.evaluate(() => { window.emitirOrdenTrabajo(); }); await p.waitForTimeout(800);
  let r = await p.evaluate(() => (document.getElementById('uoPop') || {}).textContent || '');
  c(/Ya hay una orden/.test(r) && /OT-2026-001/.test(r), 'si ya hay una orden para esa obra y ese día, avisa y ofrece sumar · ' + r.replace(/\s+/g, ' ').slice(0, 120));
  if (cel) await p.screenshot({ path: __dirname + '/v126_sumar_cel.png' });
  await p.click('#uoPop [data-uo="sumar"]'); await p.waitForTimeout(2000);
  r = await p.evaluate(() => { const db = window.__stubDB(), o = db.ordenesTrabajo.ot1; return { n: Object.keys(db.ordenesTrabajo).length, act: o.actividades, per: (o.personal || []).map((x) => x.nombre), pn: o.personalNombres, prev: o.previsto, msg: document.getElementById('otMsg').textContent, av: Object.values(db.avisosPush || {}).filter((x) => x.tipo === 'ot').map((x) => x.clave) }; });
  c(r.act.includes('zanjeo') && r.act.includes('montaje_prfv') && r.pn.includes('pedro gomez') && r.per.length === 2 && r.prev.montaje_prfv === 2, 'las tareas y la gente nuevas se suman a esa orden · ' + JSON.stringify(r).slice(0, 220));
  c(r.n === n0 && /Sumado a la OT-2026-001/.test(r.msg), 'no se crea otra orden · ' + r.msg.slice(0, 90));
  c(r.av.includes('pedro gomez'), 'al que se sumó le llega el aviso de la orden · ' + JSON.stringify(r.av));
  // 2) las que ya están repetidas: aviso en el tablero y «Unir en una»
  await p.click('#subtabsOrdenes .subtab[data-sub="tablero"]'); await p.waitForTimeout(2000);
  r = await p.evaluate(() => (document.getElementById('uoAviso') || {}).textContent || '');
  c(/más de una orden/.test(r) && /OT-2026-020/.test(r) && /OT-2026-021/.test(r), 'el tablero avisa de la obra con dos órdenes el mismo día · ' + r.replace(/\s+/g, ' ').slice(0, 140));
  await p.click('#uoAviso [data-uounir="0"]'); await p.waitForTimeout(2500);
  r = await p.evaluate(() => { const db = window.__stubDB(), a = db.ordenesTrabajo.otA, b = db.ordenesTrabajo.otB; return { act: a.actividades, pn: a.personalNombres, fotos: Object.keys((a.campo || {}).fotos || {}), marca: ((a.campo || {}).marcas || {}).zanjeo, seg: !!((a.campo || {}).seguridad || {}).epp, b: b.estado, unida: (b.unidaEn || {}).numero, aviso: !!document.getElementById('uoAviso') }; });
  c(r.act.length === 2 && r.pn.includes('pedro gomez') && r.pn.includes('juan perez') && r.fotos.includes('fa') && r.fotos.includes('fb') && r.marca && r.marca.hecho && r.seg, 'al unir, la orden queda con las tareas, la gente, las fotos y las marcas de las dos · ' + JSON.stringify(r).slice(0, 220));
  c(r.b === 'Anulada' && r.unida === 'OT-2026-020' && !r.aviso, 'la otra queda anulada (no se borra) y el aviso se va · ' + JSON.stringify({ b: r.b, unida: r.unida, aviso: r.aviso }));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  const errs = (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
