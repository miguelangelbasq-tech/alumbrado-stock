// v127 · Ver y corregir los puntos de una orden cerrada («📋 La orden» / «⭐ Puntos»), desde el tablero, el Historial y Producción.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v127' + (cel ? ' cel' : ''));
  const d = baseDatos(), o1 = d.db.ordenesTrabajo.ot1, ay = (() => { const x = new Date(); x.setDate(x.getDate() - 1); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); })();
  Object.assign(o1, { numero: 'OT-2026-177', plazaNombre: 'GEORG NICOLAI', fecha: ay, estado: 'Terminada', actividades: ['montaje_prfv'], actividadesManuales: [{ actividad: 'Acometida aérea al tablero', detalle: '' }], previsto: { montaje_prfv: 2 },
    cierre: { cerradoTs: Date.now() - 3600e3, fecha: ay, cantidades: { montaje_prfv: 2, 'm:Acometida aérea al tablero': 39 },
      puntos: { total: 6, ts: 1, renglones: [{ k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', cant: 2, un: 'columna', ptsUnit: 3, pts: 6 }, { k: 'm:Acometida aérea al tablero', tarea: 'Acometida aérea al tablero', cant: 39, un: 'metro', ptsUnit: 0, pts: 0 }], porPersona: [{ nombre: 'Juan Pérez', rol: 'Oficial', pts: 4 }, { nombre: 'Pedro Gómez', rol: 'Ayudante', pts: 2 }] } } });
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  await p.click('#subtabsOrdenes .subtab[data-sub="tablero"]'); await p.waitForTimeout(1200);
  await p.click('#otTablero [data-tbs="cerr"]'); await p.waitForTimeout(1500);
  let r = await p.evaluate(() => !!document.querySelector('#otTablero .ot-tb-card [data-peabrir]'));
  c(r, 'las órdenes cerradas del tablero tienen «⭐ Puntos»');
  await p.click('#otTablero .ot-tb-card [data-peabrir]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ tabs: [...document.querySelectorAll('#peOv .pe-tabs button')].map((b) => b.textContent), cero: [...document.querySelectorAll('#peOv .pe-f.cero .pe-n b')].map((b) => b.textContent) }));
  c(r.tabs.length === 2 && /La orden/.test(r.tabs[0]) && /Puntos/.test(r.tabs[1]) && r.cero.includes('Acometida aérea al tablero'), 'se abre con dos subíndices y la tarea sin puntos en rojo · ' + JSON.stringify(r));
  if (cel) await p.screenshot({ path: __dirname + '/v127_puntos_cel.png' });
  await p.fill('#peOv [data-pet="1"]', '0.2'); await p.dispatchEvent('#peOv [data-pet="1"]', 'change'); await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ tot: document.querySelector('#peOv .pe-tot').textContent, g: [...document.querySelectorAll('#peOv [data-peg]')].map((i) => i.value) }));
  c(/13,8/.test(r.tot) && r.g[0] === '9.2' && r.g[1] === '4.6', 'al darle valor a la tarea, el total sube y se reparte como estaba (2 a 1) · ' + JSON.stringify(r));
  await p.fill('#peOv [data-peg="0"]', '5'); await p.dispatchEvent('#peOv [data-peg="0"]', 'change'); await p.waitForTimeout(300);
  r = await p.evaluate(() => (document.querySelector('#peOv .pe-aviso') || {}).textContent || '');
  c(/quedan/.test(r) && /4,2/.test(r), 'si se corrige a mano, dice cuánto queda por repartir · ' + r.replace(/\s+/g, ' ').slice(0, 90));
  await p.fill('#peOv [data-peg="1"]', '8.8'); await p.dispatchEvent('#peOv [data-peg="1"]', 'change'); await p.waitForTimeout(300);
  await p.click('#peOv [data-pe="guardar"]'); await p.waitForTimeout(1500);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.ot1, z = window.puntosDeOrden(o); return { tot: o.cierre.puntos.total, pp: o.cierre.puntos.porPersona.map((x) => x.nombre + ' ' + x.pts), rep: o.cierre.reparto, hist: (o.cierre.puntosHist || []).length, z: z.total, msg: (document.getElementById('peMsg') || {}).textContent }; });
  c(r.tot === 13.8 && r.pp.join() === 'Juan Pérez 5,Pedro Gómez 8.8' && r.hist === 1 && r.z === 13.8, 'se guardan los puntos nuevos de la orden y de cada uno (con historial) · ' + JSON.stringify(r).slice(0, 220));
  await p.click('#peOv [data-pe="tab"][data-t="orden"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => document.querySelector('#peOv .pe-caja').textContent.replace(/\s+/g, ' '));
  c(/Gente/.test(r) && /Juan Pérez/.test(r) && /Tareas/.test(r) && /Montaje de columna PRFV/.test(r) && /Hecho 39/.test(r), '«La orden» muestra la gente y todas las tareas con lo hecho · ' + r.slice(0, 160));
  await p.click('#peOv [data-pe="cerrar"]'); await p.waitForTimeout(300);
  // Historial
  await p.click('#subtabsOrdenes .subtab[data-sub="historial"]'); await p.waitForTimeout(1800);
  r = await p.evaluate(() => !!document.querySelector('#otBody [data-peabrir]'));
  c(r, 'en el Historial, las cerradas tienen «⭐ Puntos»');
  // Producción: persona › obra › sus órdenes
  await p.evaluate(() => mostrarVista('produccion')); await p.waitForTimeout(1500);
  await p.evaluate(() => { const f = [...document.querySelectorAll('.prod-fila')].find((x) => /Juan/.test(x.dataset.persona || '')); f && f.querySelector('.prod-fila-cab').click(); }); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ obras: document.querySelectorAll('.prod-obra[data-probra]').length, filas: [...document.querySelectorAll('.prod-ord-tabla tr[data-penum]')].map((t) => t.dataset.penum) }));
  c(r.obras >= 1 && r.filas.includes('OT-2026-177'), 'en Producción, la persona muestra sus obras y sus órdenes · ' + JSON.stringify(r));
  await p.click('.prod-obra[data-probra]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ on: !!document.querySelector('.prod-obra.on'), vis: [...document.querySelectorAll('.prod-ord-tabla tr[data-penum]')].filter((t) => t.style.display !== 'none').length }));
  c(r.on && r.vis >= 1, 'tocar la obra deja solo sus órdenes · ' + JSON.stringify(r));
  await p.click('.prod-ord-tabla tr[data-penum="OT-2026-177"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ ov: !!document.getElementById('peOv'), tab: (document.querySelector('#peOv .pe-tabs button.on') || {}).textContent || '' }));
  c(r.ov && /La orden/.test(r.tab), 'tocar la orden abre «📋 La orden» (con «⭐ Puntos» al lado) · ' + JSON.stringify(r));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  const errs = (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
