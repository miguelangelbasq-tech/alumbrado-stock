// v129 · Cierre: las horas que puso la cuadrilla aparecen solas; «✅ Aprobar esta tarea» suma sus puntos y su avance al toque
// (la orden sigue abierta para las demás) y «✅ Aprobar todo y cerrar».
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v129' + (cel ? ' cel' : ''));
  const d = baseDatos(), o1 = d.db.ordenesTrabajo.ot1;
  Object.assign(o1, { actividades: ['montaje_prfv', 'zanjeo'], actividadesManuales: [], previsto: { montaje_prfv: 3, zanjeo: 30 }, estado: 'En curso', campo: { horasTarea: { zanjeo: { ini: '08:15', fin: '11:40', por: 'Juan Pérez', ts: 1 } } } });
  d.db.ordenesTrabajo.ot2 = Object.assign(JSON.parse(JSON.stringify(o1)), { numero: 'OT-2026-002', campo: {} });
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  await p.evaluate(() => window.abrirCierreOt('ot1')); await p.waitForTimeout(1500);
  let r = await p.evaluate(() => ({ i: document.querySelector('#cierreCuerpo .cierre-hini[data-k="zanjeo"]').value, f: document.querySelector('#cierreCuerpo .cierre-hfin[data-k="zanjeo"]').value }));
  c(r.i === '08:15' && r.f === '11:40', 'la hora que puso la cuadrilla aparece en el cierre · ' + JSON.stringify(r));
  const s = (k, v) => p.evaluate(`(() => { const i = document.querySelector('#cierreCuerpo .cierre-qty[data-k="${k}"]'); i.value = '${v}'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await s('montaje_prfv', '2'); await s('zanjeo', '30'); await p.waitForTimeout(800);
  r = await p.evaluate(() => [...document.querySelectorAll('#cierreCuerpo [data-aprob]')].map((b) => b.dataset.aprob).concat(document.getElementById('apTodo') ? ['TODO'] : []));
  c(r.includes('zanjeo') && r.includes('montaje_prfv') && r.includes('TODO'), 'cada tarea tiene «✅ Aprobar esta tarea» y está «Aprobar todo y cerrar» · ' + r.join());
  if (cel) await p.screenshot({ path: __dirname + '/v129_cierre_cel.png' });
  await p.click('#cierreCuerpo [data-aprob="zanjeo"]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ msg: document.getElementById('cierreMsg').textContent, cant: (window.__stubDB().ordenesTrabajo.ot1.cierre || {}).cantidades }));
  c(/pregunta del itemizado/.test(r.msg) && !r.cant, 'si falta responder lo del itemizado, avisa y no aprueba · ' + r.msg);
  await p.evaluate(() => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); });
  await p.click('#cierreCuerpo [data-aprob="zanjeo"]'); await p.waitForTimeout(2500);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.ot1, z = window.puntosDeOrden(ordenesTrabajo.find((x) => x.id === 'ot1')); return { cant: o.cierre && o.cierre.cantidades, apr: Object.keys((o.cierre || {}).aprobadas || {}), est: o.estado, pts: z && z.total, abierta: document.getElementById('cierreOt').style.display !== 'none', otra: document.querySelector('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]').value, ok: !!document.querySelector('#cierreCuerpo [data-apbox="zanjeo"] .ap-ok'), msg: document.getElementById('cierreMsg').textContent }; });
  c(r.cant && r.cant.zanjeo === 30 && !('montaje_prfv' in r.cant) && r.apr.join() === 'zanjeo' && r.pts > 0, 'al aprobar una tarea se guardan solo sus puntos (ya cuentan) · ' + JSON.stringify(r).slice(0, 200));
  c(r.est === 'En curso' && r.abierta && r.otra === '2' && r.ok, 'la orden sigue abierta, la ventana no se cierra, lo cargado en la otra sigue y la aprobada queda en verde · ' + JSON.stringify({ est: r.est, ab: r.abierta, otra: r.otra, ok: r.ok, msg: r.msg }));
  await p.click('#cierreCuerpo [data-aprob="montaje_prfv"]'); await p.waitForTimeout(2500);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.ot1; return { cant: o.cierre.cantidades, apr: Object.keys(o.cierre.aprobadas || {}).sort(), est: o.estado, h: (o.cierre.horasTarea || {}).zanjeo }; });
  c(r.cant.zanjeo === 30 && r.cant.montaje_prfv === 2 && r.apr.join() === 'montaje_prfv,zanjeo' && r.est === 'Terminada', 'con la última aprobada, la orden queda terminada con las dos · ' + JSON.stringify(r));
  c(r.h && r.h.ini === '08:15', 'las horas de la cuadrilla quedan guardadas en el cierre · ' + JSON.stringify(r.h));
  // aprobar todo
  await p.waitForTimeout(1000);
  await p.evaluate(() => window.abrirCierreOt('ot2')); await p.waitForTimeout(1500);
  await s('montaje_prfv', '3'); await s('zanjeo', '10'); await p.waitForTimeout(500);
  await p.evaluate(() => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); });
  await p.click('#apTodo'); await p.waitForTimeout(2500);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.ot2; return { cant: o.cierre && o.cierre.cantidades, apr: Object.keys((o.cierre || {}).aprobadas || {}).sort(), est: o.estado }; });
  c(r.cant && r.cant.zanjeo === 10 && r.cant.montaje_prfv === 3 && r.apr.join() === 'montaje_prfv,zanjeo' && r.est === 'Terminada', '«Aprobar todo y cerrar» aprueba todas y termina la orden · ' + JSON.stringify(r));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  const errs = (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
