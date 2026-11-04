// Pruebas v117 · Menos lecturas: la oficina escucha el «personal en vivo» solo con el Mapa abierto (cada ubicación que
// manda la cuadrilla es una lectura para cada oficina que escucha) y deja de escuchar al salir. Contador en menú › Versión.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const espia = () => {
  window.__escuchas = {};
  let fbv;
  Object.defineProperty(window, 'firebase', { configurable: true, get: () => fbv, set: (v) => {
    fbv = v;
    try {
      const fs0 = v.firestore;
      const envolver = (db) => { if (!db || db.__esp) return db; const c0 = db.collection.bind(db); db.collection = (n) => { const r = c0(n); const o = r.onSnapshot && r.onSnapshot.bind(r); if (o) r.onSnapshot = (...a) => { window.__escuchas[n] = (window.__escuchas[n] || 0) + 1; const u = o(...a); return () => { window.__escuchas[n]--; return typeof u === 'function' ? u() : undefined; }; }; return r; }; db.__esp = 1; return db; };
      const nf = function () { return envolver(fs0.apply(this, arguments)); }; Object.assign(nf, fs0); v.firestore = nf;
    } catch (e) { }
  } });
};
(async () => {
  const c = prueba('v117' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3500, antes: espia }), p = A.page;
  await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(1500);
  let r = await p.evaluate(() => window.__escuchas.ubicacionVivo || 0);
  c(r === 0, 'la oficina NO escucha el personal en vivo fuera del Mapa · ' + r);
  await p.evaluate(() => mostrarVista('mapa')); await p.waitForTimeout(2500);
  r = await p.evaluate(() => window.__escuchas.ubicacionVivo || 0);
  c(r === 1, 'al abrir el Mapa empieza a escuchar el personal en vivo · ' + r);
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(16500);
  r = await p.evaluate(() => window.__escuchas.ubicacionVivo || 0);
  c(r === 0, 'al salir del Mapa deja de escuchar (no gasta lecturas) · ' + r);
  await p.evaluate(() => mostrarVista('mapa')); await p.waitForTimeout(2500);
  r = await p.evaluate(() => window.__escuchas.ubicacionVivo || 0);
  c(r === 1, 'al volver al Mapa escucha de nuevo · ' + r);
  r = await p.evaluate(() => { let m = ''; const a0 = window.alert; window.alert = (x) => { m = String(x); }; try { revisarApp(); } finally { window.alert = a0; } return { m, f: !!window.__lecturas }; });
  c(r.f && /Lecturas de la base hoy/.test(r.m), 'menú › Versión muestra las lecturas de hoy en este aparato');
  // 👁 desde el Historial: se ve la orden, y el resumen de «Llenar orden» no la tapa
  const B = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3000, ofPasos: true }), q = B.page;
  await q.evaluate(() => mostrarVista('parte')); await q.waitForTimeout(800);
  await q.click('#subtabsOrdenes .subtab[data-sub="historial"]'); await q.waitForTimeout(1200);
  await q.evaluate(() => document.querySelector('#otBody button[onclick*="verOrdenTrabajo"]').click()); await q.waitForTimeout(2500);
  r = await q.evaluate(() => { const rc = document.getElementById('parteResultCard'), rs = document.getElementById('ofResumen'); return { vis: !!(rc && rc.offsetParent && rc.offsetHeight > 200 && !rc.querySelector('.empty-state')), pos: rs ? getComputedStyle(rs).position : 'sin' }; });
  c(r.vis && (r.pos === 'static' || r.pos === 'sin'), '👁 desde el Historial muestra la orden, sin el resumen encima · ' + JSON.stringify(r));
  await B.browser.close();
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
