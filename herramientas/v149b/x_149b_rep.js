// repro v149b: casos donde las fotos de Modo obra no suben o se pierden (sobre la app de APP)
const { abrir } = require('./h');
const { datos147, P } = require('./datos147');
const caso = process.argv[2] || 'normal';
const MOD = { v147: true, mov: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, sugerida: true, v145: true, v146: true, obraGps: true, camaraB: true, porPartes: true, https: true, v149: true };
const camaraFalsa = () => {
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#6f6f5c'; x.fillRect(0, c.height * 0.62, c.width, c.height); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { await new Promise((r) => setTimeout(r, 300)); const c = document.createElement('canvas'); c.width = 1280; c.height = 960; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
};
(async () => {
  const d = datos147();
  if (caso === 'sinvinc') { d.db.usuarios.uJuan.personaClave = ''; }
  if (caso === 'grande') { d.db.ordenesTrabajo.ot1.relleno = 'x'.repeat(1040000); }
  const J = await abrir(Object.assign({ datos: d, sesion: 'juan', cel: true, espera: 6000, antes: camaraFalsa, reglas: /sinvinc|reglas/.test(caso) }, MOD)), q = J.page, ev = (f, a) => q.evaluate(f, a);
  q.on('console', (m) => { if (/foto|cuadrillaDia|campo/i.test(m.text())) console.log('  [consola]', m.text().slice(0, 200)); });
  await J.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { if (caso === 'r2caido') return rq.fulfill({ status: 500, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":false,"error":"boom"}' }); await new Promise((r) => setTimeout(r, 800)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }); });
  await J.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' });
  await J.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 8 });
  const esperar = (fn, arg, ms) => q.waitForFunction(fn, arg, { timeout: ms || 30000, polling: 100 }).then(() => true, () => false);
  if (caso === 'error') await ev(() => { let n = 0; const iv = setInterval(() => { const g = window.fbAdjuntoGuardar; if (g && !g.__rompe) { const o = g; const f = async function (d) { if (n++ < 2) throw Object.assign(new Error('boom interno'), { code: 'internal' }); return o.apply(this, arguments); }; Object.keys(o).forEach((k) => { f[k] = o[k]; }); f.__rompe = 1; window.fbAdjuntoGuardar = f; clearInterval(iv); } }, 50); });
  if (caso === 'cupo') { await J.ctx.route(/firestore\.googleapis\.com/, (rq) => rq.fulfill({ status: 429, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Quota exceeded.' } }) })); await ev(() => { window.__stubSinRed = true; }); }
  if (caso === 'imgmal') await ev(() => { const I = window.Image; let n = 0; window.Image = function () { const i = new I(); if (n++ < 6) setTimeout(() => { i.onerror && i.onerror(new Event('error')); }, 10); return i; }; });
  await ev(() => window.__cuadrillaDia.ir('obra')); await q.waitForTimeout(3000);
  const estado = () => ev(async () => {
    const db = window.__stubDB(), o = db.ordenesTrabajo.ot1;
    const crudas = await new Promise((ok) => { const r = indexedDB.open('ema-fotos-crudas', 1); r.onupgradeneeded = () => r.result.createObjectStore('f', { keyPath: 'id' }); r.onsuccess = () => { try { const s = r.result.transaction('f', 'readonly').objectStore('f').getAll(); s.onsuccess = () => ok(s.result.length); } catch (e) { ok('x'); } }; r.onerror = () => ok(-1); });
    const cola = await new Promise((ok) => { const r = indexedDB.open('ema-fotos-cola', 1); r.onupgradeneeded = () => r.result.createObjectStore('pend', { keyPath: 'k' }); r.onsuccess = () => { try { const s = r.result.transaction('pend', 'readonly').objectStore('pend').getAll(); s.onsuccess = () => ok(s.result.map((x) => x.col + (x.neg ? ':neg' : '')).join(',')); } catch (e) { ok('x'); } }; r.onerror = () => ok(-1); });
    return { campoFotos: Object.keys(((o || {}).campo || {}).fotos || {}).length, fotosObra: Object.values(db.fotosObra || {}).filter((x) => x.otId === 'ot1').length, adj: Object.values(db.adjuntos || {}).filter((x) => x.otId === 'ot1').length, crudas, cola, campoCola: JSON.stringify(window.__campoCola && window.__campoCola.estado()), msg: (document.querySelector('#cdApp .cd-msg') || {}).textContent || '', bandeja: window.__fotoBandeja ? JSON.stringify(window.__fotoBandeja.estado().lista.map((r) => r.fase + ':' + (r.motivo || '') + ':' + (r.campo ? 'c' : '-'))) + ' mot=' + window.__fotoBandeja.estado().motivo : 'no', senal: ((document.querySelector('#cdApp .cd-senal') || document.querySelector('#cdApp .fb-ok') || {}).textContent || '').trim().slice(0, 90), fss: ((document.getElementById('fssAviso') || {}).textContent || '').trim() };
  });
  const toque = (s) => q.tap(s);
  const camLista = () => esperar(() => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0 && v.readyState >= 2; });
  if (caso === 'sinred') { await ev(() => { window.__stubSinRed = true; }); await J.ctx.setOffline(true); await ev(() => window.dispatchEvent(new Event('offline'))); }
  for (let i = 0; i < 3; i++) {
    await toque(i === 0 ? '#cdApp [data-cd="boton"]' : '#cdHoja [data-cdh="otra"]'); await camLista();
    await toque('#emaCam [data-ec="disparar"]');
    await esperar(() => { const h = document.getElementById('cdHoja'); return !!h && /Foto guardada/.test(h.textContent); }, null, 20000);
    // la persona sigue tocando (sin pausas de 1,8 s)
    for (let k = 0; k < 3; k++) { await q.mouse.click(5, 300); await q.waitForTimeout(500); }
  }
  console.log('tras 3 fotos (sin pausa):', JSON.stringify(await estado()));
  if (caso === 'cupo') { await q.waitForTimeout(65000); console.log('cupo +65 s:', JSON.stringify(await estado())); await ev(() => { window.__stubSinRed = false; }); await q.waitForTimeout(1000); }
  if (caso === 'cerrar' || caso === 'sinred' || caso === 'sinvinc') {
    await q.reload(); await q.waitForTimeout(4000);
    if (caso === 'sinred') { await ev(() => { window.__stubSinRed = false; }); await J.ctx.setOffline(false); await ev(() => window.dispatchEvent(new Event('online'))); }
    console.log('reabierta:', JSON.stringify(await estado()));
    await q.waitForTimeout(25000);
    console.log('reabierta +25 s:', JSON.stringify(await estado()));
  } else {
    await q.waitForTimeout(20000);
    console.log('+20 s quieto:', JSON.stringify(await estado()));
  }
  console.log('errores', J.errores.slice(0, 4));
  await J.browser.close();
})();
