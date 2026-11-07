// v128 · «Unir» que no vuelva a aparecer: unir 3 órdenes (fotos de las tres), la marca que el celu de la cuadrilla manda
// tarde a la orden vieja va a la buena (la vieja sigue anulada) y volver a unir no suma dos veces lo previsto.
const { abrir, otraPagina, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v128d' + (cel ? ' cel' : ''));
  const d = baseDatos(), o1 = d.db.ordenesTrabajo.ot1, f = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const base = JSON.parse(JSON.stringify(o1)); base.fecha = f(0); base.actividadesManuales = [];
  const ot = (num, quien, clave, act, prev, foto) => Object.assign(JSON.parse(JSON.stringify(base)), { numero: num, personal: [{ nombre: quien, rol: 'Oficial' }], personalNombres: [clave], actividades: [act], previsto: { [act]: prev }, campo: { fotos: { [foto]: { por: quien, ts: 1, k: act, num: 'Col 1', mini: '' } } } });
  delete d.db.ordenesTrabajo.ot1;
  d.db.ordenesTrabajo.otA = ot('OT-2026-030', 'Juan Pérez', 'juan perez', 'zanjeo', 10, 'fa');
  d.db.ordenesTrabajo.otB = ot('OT-2026-031', 'Juan Pérez', 'juan perez', 'montaje_prfv', 3, 'fb');
  d.db.ordenesTrabajo.otC = ot('OT-2026-032', 'Pedro Gómez', 'pedro gomez', 'tablero', 1, 'fc');
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  const J = await otraPagina(A, { sesion: 'juan', cel: true, espera: 3500, mtNuevo: true, porPartes: true, reglas: true, https: true }), q = J.page;
  q.on('dialog', (x) => x.accept());
  // el celu de Juan, sin señal, marca en la OT-031 (todavía la ve abierta)
  let r = await q.evaluate(() => { const o = ordenesTrabajo.find((x) => x.id === 'otB'); return o && o.estado; });
  c(r === 'Emitida', 'el celu de la cuadrilla tiene la orden vieja abierta · ' + r);
  await q.evaluate(() => { window.__stubSinRed = true; window.__pend = window.fbOtCampo('otB', { 'campo.marcas.montaje_prfv': { hecho: true, cant: 2, por: 'Juan Pérez', ts: Date.now() }, estado: 'En curso' }).then(() => 'ok', (e) => 'error ' + (e && e.code)); });
  // la oficina une las tres
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  await p.click('#subtabsOrdenes .subtab[data-sub="tablero"]'); await p.waitForTimeout(2000);
  r = await p.evaluate(() => (document.getElementById('uoAviso') || {}).textContent || '');
  c(/OT-2026-030/.test(r) && /OT-2026-031/.test(r) && /OT-2026-032/.test(r), 'avisa de las tres órdenes de la misma obra · ' + r.replace(/\s+/g, ' ').slice(0, 140));
  await p.click('#uoAviso [data-uounir="0"]'); await p.waitForTimeout(2500);
  r = await p.evaluate(() => { const db = window.__stubDB().ordenesTrabajo, a = db.otA; return { fotos: Object.keys((a.campo || {}).fotos || {}).sort(), act: a.actividades, prev: a.previsto, unidas: Object.keys(a.unidas || {}).sort(), b: db.otB.estado, c: db.otC.estado, aviso: !!document.getElementById('uoAviso') }; });
  c(r.fotos.join() === 'fa,fb,fc', 'con tres órdenes quedan las fotos de las tres (antes se perdían las de la segunda) · ' + JSON.stringify(r.fotos));
  c(r.act.length === 3 && r.prev.montaje_prfv === 3 && r.prev.tablero === 1 && r.unidas.join() === 'otB,otC', 'tareas y cantidades de las tres, y anota cuáles se unieron · ' + JSON.stringify({ act: r.act, prev: r.prev, u: r.unidas }));
  c(r.b === 'Anulada' && r.c === 'Anulada' && !r.aviso, 'las otras dos quedan anuladas y el aviso se va · ' + JSON.stringify({ b: r.b, c: r.c, aviso: r.aviso }));
  // vuelve la señal en el celu: la marca vieja no reabre la OT-031, va a la OT-030
  await q.evaluate(() => { window.__stubSinRed = false; }); await q.waitForTimeout(2500);
  r = await q.evaluate(async () => ({ res: await window.__pend, red: (window.__unirSeguro.redirigidas || []).length }));
  r = Object.assign(r, await p.evaluate(() => { const db = window.__stubDB().ordenesTrabajo; return { b: db.otB.estado, marcaB: !!((db.otB.campo || {}).marcas || {}).montaje_prfv, marcaA: ((db.otA.campo || {}).marcas || {}).montaje_prfv }; }));
  c(r.res === 'ok' && r.b === 'Anulada' && !r.marcaB && r.marcaA && r.marcaA.cant === 2, 'la marca que llegó tarde va a la orden buena y la vieja sigue anulada · ' + JSON.stringify(r));
  await p.waitForTimeout(1500);
  r = await p.evaluate(() => !!document.getElementById('uoAviso'));
  c(!r, 'no vuelve a aparecer como repetida');
  // si igual se reabrió (reglas viejas), volver a unir no suma dos veces
  await p.evaluate(() => { const db = window.__stubDB(); db.ordenesTrabajo.otB.estado = 'En curso'; localStorage.setItem('stub.db', JSON.stringify(db)); window.dispatchEvent(new StorageEvent('storage', { key: 'stub.db' })); });
  await p.waitForTimeout(2500);
  r = await p.evaluate(() => (document.getElementById('uoAviso') || {}).textContent || '');
  c(/OT-2026-031/.test(r), 'si una unida se reabrió, vuelve el aviso · ' + r.replace(/\s+/g, ' ').slice(0, 100));
  await p.click('#uoAviso [data-uounir="0"]'); await p.waitForTimeout(2500);
  r = await p.evaluate(() => { const db = window.__stubDB().ordenesTrabajo; return { prev: db.otA.previsto, b: db.otB.estado, aviso: !!document.getElementById('uoAviso') }; });
  c(r.prev.montaje_prfv === 3 && r.prev.zanjeo === 10 && r.b === 'Anulada' && !r.aviso, 'al volver a unir no se suma dos veces lo previsto · ' + JSON.stringify(r));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  const errs = (A.errores || []).concat(J.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
