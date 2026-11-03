// Pruebas v102 (2) · sin señal: la foto y la marca no se borran del celular hasta que la base confirma; lo que está en camino
// no se manda dos veces · número de los comprobantes del pañol guardado y fijo (los viejos no se corren; «-B» si se repite).
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v102b' + (cel ? ' cel' : ''));
  const d = baseDatos(), ahora = Date.now();
  d.db.movimientos = { a1: { tipo: 'salida', codigo: 1001, cantidad: 1, valeGrupo: 'g1', ts: ahora - 5000, fecha: d.hoy }, a2: { tipo: 'salida', codigo: 1001, cantidad: 1, valeGrupo: 'g2', ts: ahora - 4000, fecha: d.hoy } };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, reglas: true }), p = A.page;
  // ---- números
  let r = await p.evaluate(() => stockMovimientos.map((m) => m.id + ':' + numeroComprobante(m)).sort().join(' '));
  c(r === 'a1:S-0001 a2:S-0002', 'los vales viejos conservan su número (S-0001, S-0002) · ' + r);
  await p.evaluate(async () => { await fbAddMovimiento({ tipo: 'salida', codigo: 1001, cantidad: 1, valeGrupo: 'g3', ts: Date.now(), fecha: '2026-11-03' }); await fbAddMovimiento({ tipo: 'salida', codigo: 1002, cantidad: 2, valeGrupo: 'g3', ts: Date.now(), fecha: '2026-11-03' }); await fbAddMovimiento({ tipo: 'entrada', codigo: 1001, cantidad: 5, ts: Date.now(), fecha: '2026-11-03' }); });
  await p.waitForTimeout(900);
  r = await p.evaluate(() => Object.values(window.__stubDB().movimientos).filter((m) => !/^a/.test(m.id || '') && m.numero).map((m) => (m.valeGrupo || m.tipo) + ':' + m.numero).sort());
  c(JSON.stringify(r) === JSON.stringify(['entrada:E-0001', 'g3:S-0003', 'g3:S-0003']), 'el vale nuevo guarda su número (los dos renglones del mismo vale: S-0003) y la entrada el suyo (E-0001) · ' + JSON.stringify(r));
  // llega tarde un movimiento viejo cargado sin señal (hora anterior): antes corría todos los números
  await p.evaluate(() => firebase.firestore().collection('movimientos').doc('a0').set({ tipo: 'salida', codigo: 1001, cantidad: 1, valeGrupo: 'g0', ts: Date.now() - 9000, fecha: '2026-11-03', numero: 'S-0004' }));
  await p.waitForTimeout(900);
  r = await p.evaluate(() => { const by = (g) => stockMovimientos.find((m) => m.valeGrupo === g); return ['g1', 'g2', 'g3', 'g0'].map((g) => numeroComprobante(by(g))).join(' '); });
  c(r === 'S-0001 S-0002 S-0003 S-0004', 'un movimiento que llega tarde con hora anterior no corre los números ya impresos · ' + r);
  await p.evaluate(() => firebase.firestore().collection('movimientos').doc('z9').set({ tipo: 'salida', codigo: 1001, cantidad: 1, valeGrupo: 'g9', ts: Date.now() + 5000, fecha: '2026-11-03', numero: 'S-0003' }));
  await p.waitForTimeout(900);
  r = await p.evaluate(() => numeroComprobante(stockMovimientos.find((m) => m.valeGrupo === 'g9')));
  c(r === 'S-0003-B', 'si otro aparato sin señal sacó el mismo número, el segundo se ve «S-0003-B» (no se confunden) · ' + r);
  // ---- sin señal: la marca de Mis tareas no se borra del celular hasta que la base confirma
  await p.evaluate(() => { window.__stubSinRed = true; });
  await A.ctx.setOffline(true); await p.waitForTimeout(300);
  r = await p.evaluate(async () => { let n = 0; const o = window.fbOtCampo; const p1 = window.fbOtCampo('ot1', { 'campo.marcas.x': { hecho: true } }), p2 = window.fbOtCampo('ot1', { 'campo.marcas.x': { hecho: true } }); const t = await Promise.race([p1.then(() => 'ok'), new Promise((r) => setTimeout(() => r('espera'), 2500))]); return { t, mismo: p1 === p2 }; });
  c(r.t === 'espera' && r.mismo, 'sin señal, la marca espera la confirmación de verdad (antes se daba por hecha a los 1,2 s) y no se manda dos veces · ' + JSON.stringify(r));
  r = await p.evaluate(async () => { const ref = firebase.firestore().collection('auditoria').doc('t1'); const t = await Promise.race([ref.set({ a: 1 }).then(() => 'ok'), new Promise((r) => setTimeout(() => r('espera'), 2500))]); return t; });
  c(r === 'ok', 'lo demás sigue igual que antes: sin señal se da por hecho al toque (queda en el celu) · ' + r);
  await A.ctx.setOffline(false); await p.evaluate(() => { window.__stubSinRed = false; window.dispatchEvent(new Event('online')); }); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.ot1; return !!(o.campo && o.campo.marcas && o.campo.marcas.x); });
  c(r, 'al volver la señal, la marca llega a la base');
  const errs = A.errores.filter((e) => !/Missing or insufficient permissions|net/.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
