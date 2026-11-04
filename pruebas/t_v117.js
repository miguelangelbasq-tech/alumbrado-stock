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
  // PDF con el logo aunque html2canvas no dibuje la imagen (pasa en algunos celulares)
  const C = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3000 }), w = C.page;
  await w.evaluate(() => { window.__pags = []; const P = HTMLCanvasElement.prototype, d0 = P.toDataURL; P.toDataURL = function (...a) { const r = d0.apply(this, a); if (this.width > 1000 && /jpeg/.test(a[0] || '')) window.__pags.push(r); return r; }; });
  const logoOscuro = () => w.evaluate(async () => { const u = window.__pags[window.__p0]; if (!u) return -1; const im = new Image(); im.src = u; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(52, 52, 270, 90).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 150) n++; return n; });
  const pdf = async () => { await w.evaluate(() => imprimirPlanificacion('detallada', 'dia', fechaAISO(new Date()))); await w.waitForTimeout(1500); const n0 = await w.evaluate(() => (window.__p0 = window.__pags.length)); await w.click('#hojaOv [data-hj="bajar"]'); await w.waitForFunction((n) => window.__pags.length > n, n0, { timeout: 40000 }).catch(() => { }); await w.waitForTimeout(500); await w.evaluate(() => { const x = document.querySelector('#hojaOv [data-hj="cerrar"]'); x && x.click(); }); await w.waitForTimeout(400); };
  await pdf(); const conLogo = await logoOscuro(); if (process.env.DBG) { const u = await w.evaluate(() => (window.__pags.slice(-1)[0] || '') + ' n=' + window.__pags.length); require('fs').writeFileSync(__dirname + '/x_pag.txt', u); }
  await w.evaluate(() => { const o = window.html2canvas; window.html2canvas = (el, op) => o(el, Object.assign({}, op, { ignoreElements: (e) => e.tagName === 'IMG' })); });   // como en el celular que no dibuja la imagen
  await pdf(); const sinH2c = await logoOscuro();
  c(conLogo > 500 && sinH2c > 500, 'el PDF sale con el logo aunque el celular no lo dibuje en la captura · ' + conLogo + ' / ' + sinH2c);
  await C.browser.close();
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
