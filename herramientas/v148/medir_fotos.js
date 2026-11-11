// v148 · Medición de la velocidad de las fotos de la cuadrilla (celu 390×844, CPU ×6, señal lenta, GPS sin fix, R2 lento).
// Uso: APP=.../index.html node _fotos.js [salida.json]
// Mide: (1) Modo obra: toque «Foto · Col N» → cámara lista (video con imagen); disparo → puede sacar la siguiente
//           («Foto guardada» con «Sacar otra») → «Sacar otra» → cámara lista; (2) Cámara de la barra (cámara B v144):
//           toque → cámara lista con la píldora; disparo → disparador listo de nuevo y → foto en la base.
// Con el desglose: comprimir/sello, R2 (fetch al Worker), adjuntos, fotosObra, campo.fotos y el registro de fotoRapida.
process.env.CPU = process.env.CPU || '6';
const fs = require('fs');
const { abrir } = require('./h');
const { datos147, P } = require('./datos147');
const OUT = process.argv[2] || '';
const R2_MS = +(process.env.R2_MS || 1500);
const prep = (o) => {
  // cámara de mentira
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#6f6f5c'; x.fillRect(0, c.height * 0.62, c.width, c.height); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { await new Promise((r) => setTimeout(r, o.gum)); const c = document.createElement('canvas'); c.width = 1280; c.height = 960; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
  // GPS sin fix: nunca contesta (getCurrentPosition: error al vencer el timeout)
  if (o.sinFix && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition = (ok, mal, op) => { setTimeout(() => mal && mal({ code: 3, message: 'timeout' }), (op && op.timeout) || 10000); };
    navigator.geolocation.watchPosition = () => 1; navigator.geolocation.clearWatch = () => { };
  }
  if (o.kbps) window.__stubKbps = o.kbps;
  // tiempos medidos en el celu (sin el retardo de la prueba): desde el toque hasta el cuadro dibujado
  window.__ft = {};
  document.addEventListener('pointerdown', (e) => { const b = e.target && e.target.closest && e.target.closest('[data-ec="disparar"],[data-cd="boton"],[data-cdh="otra"],[data-n1="camara"],#menuCamara'); if (b) window.__ft = { t0: performance.now(), que: b.getAttribute('data-ec') || b.getAttribute('data-cd') || b.getAttribute('data-cdh') || b.getAttribute('data-n1') || b.id }; }, true);
  const vig = () => {
    const F = window.__ft;
    if (F.t0 != null) {
      const v = document.getElementById('ecVideo');
      if (F.vid == null && v && v.videoWidth > 0 && v.readyState >= 2) F.vid = Math.round(performance.now() - F.t0);
      const h = document.getElementById('cdHoja');
      if (F.hoja == null && F.que === 'disparar' && h && /Foto guardada/.test(h.textContent) && h.querySelector('[data-cdh="otra"]')) F.hoja = Math.round(performance.now() - F.t0);
      const d = document.querySelector('#emaCam [data-ec="disparar"]');
      if (F.listo == null && F.que === 'disparar' && F.blob && d) F.listo = Math.round(performance.now() - F.t0);
    }
    requestAnimationFrame(vig);
  };
  requestAnimationFrame(vig);
  const tb = HTMLCanvasElement.prototype.toBlob; HTMLCanvasElement.prototype.toBlob = function (cb, ...a) { return tb.call(this, (b) => { if (window.__ft.t0 != null) window.__ft.blob = 1; cb(b); }, ...a); };
  // tiempos de cada pieza
  window.__tt = [];
  const marca = (n, t0) => window.__tt.push({ n, ms: Math.round(performance.now() - t0), t: Math.round(performance.now()) });
  const envolver = (nom) => { const f = window[nom]; if (typeof f != 'function' || f.__tt) return; const n = async function () { const t0 = performance.now(); try { return await f.apply(this, arguments); } finally { marca(nom, t0); } }; Object.keys(f).forEach((k) => { n[k] = f[k]; }); n.__tt = 1; window[nom] = n; };
  setInterval(() => ['fbAdjuntoGuardar', 'fbFotoObraCrear', 'comprimirImagen'].forEach(envolver), 300);
  const fe = window.fetch; window.fetch = async function (u) { const t0 = performance.now(); try { return await fe.apply(this, arguments); } finally { if (/workers\.dev\/f\//.test(String(u && u.url || u))) marca('R2', t0); } };
};
async function correr(cond) {
  const A = await abrir({ datos: datos147(), sesion: 'juan', cel: true, dpr: 2, espera: 7000, https: true, antes: prep, antesArg: cond, v147: true, mov: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, obraGps: true, camaraB: true, porPartes: true, v145: true, v146: true, sugerida: true });
  const p = A.page, ev = (f, a) => p.evaluate(f, a);
  await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { await new Promise((r) => setTimeout(r, cond.r2)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }); });
  await A.ctx.grantPermissions(['camera'].concat(cond.sinFix ? [] : ['geolocation']), { origin: 'https://app.test' });
  if (!cond.sinFix) await A.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 8 });
  const esperar = (fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 30000, polling: 30 }).then(() => true, () => false);
  const t = () => ev(() => performance.now());
  const camLista = () => esperar(() => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0 && v.readyState >= 2; });
  const R = { cond, obra: [], camB: [] };
  // ---------------------------------------------------------------- Modo obra
  await ev(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(5000);
  const btn = await ev(() => (document.querySelector('#cdApp [data-cd="boton"]') || {}).textContent || '');
  R.boton = btn.trim();
  for (let i = 0; i < 3; i++) {
    const x = {};
    let t0 = await t();
    if (i === 0) await p.tap('#cdApp [data-cd="boton"]'); else await p.tap('#cdHoja [data-cdh="otra"]');
    await camLista(); x.abrir = (await p.waitForFunction((k) => window.__ft[k] != null, 'vid', { timeout: 40000, polling: 50 }).then(() => ev((k) => window.__ft[k], 'vid'), () => -1));
    await ev(() => { window.__tt = []; });
    t0 = await t();
    await p.tap('#emaCam [data-ec="disparar"]');
    const ok = await esperar(() => { const h = document.getElementById('cdHoja'); return !!h && /Foto guardada/.test(h.textContent) && !!h.querySelector('[data-cdh="otra"]'); }, null, 40000);
    x.siguiente = ok ? (await p.waitForFunction((k) => window.__ft[k] != null, 'hoja', { timeout: 40000, polling: 50 }).then(() => ev((k) => window.__ft[k], 'hoja'), () => -1)) : -1;
    await esperar(() => { const o = (window.__stubDB().ordenesTrabajo || {}).ot1; return Object.keys(((o || {}).campo || {}).fotos || {}).length >= 0; }, null, 1000);
    const okBase = await esperar((n) => { const o = (window.__stubDB().ordenesTrabajo || {}).ot1; return Object.keys(((o || {}).campo || {}).fotos || {}).length > n; }, i, 40000);
    x.enLaBase = okBase ? Math.round((await t()) - t0) : -1;
    x.piezas = await ev(() => window.__tt.slice());
    R.obra.push(x);
  }
  await ev(() => { const b = document.querySelector('#cdHoja [data-cdh="x"]'); b && b.click(); }); await p.waitForTimeout(800);
  // ---------------------------------------------------------------- Cámara de la barra (cámara B)
  await ev(() => { const c = document.getElementById('emaCam'); if (c) window.camaraApp.cerrar(); }); await p.waitForTimeout(500);
  for (let i = 0; i < 2; i++) {
    const x = {};
    let t0 = await t();
    await ev(() => { window.__ft = { t0: performance.now(), que: 'camara' }; const b = document.querySelector('#navN1 [data-n1="camara"]'); if (b) b.click(); else document.getElementById('menuCamara').click(); });
    await camLista(); x.abrir = (await p.waitForFunction((k) => window.__ft[k] != null, 'vid', { timeout: 40000, polling: 50 }).then(() => ev((k) => window.__ft[k], 'vid'), () => -1));
    await esperar(() => !!document.getElementById('cbPill'), null, 15000); x.pildora = Math.round((await t()) - t0);
    const n0 = await ev(() => Object.keys(window.__stubDB().fotosObra || {}).length);
    await ev(() => { window.__tt = []; });
    t0 = await t();
    await p.tap('#emaCam [data-ec="disparar"]');
    await esperar(() => { const b = document.querySelector('#emaCam [data-ec="disparar"]'); return !!b && !b.disabled && getComputedStyle(b).pointerEvents !== 'none'; }, null, 20000);
    x.siguiente = (await p.waitForFunction((k) => window.__ft[k] != null, 'listo', { timeout: 40000, polling: 50 }).then(() => ev((k) => window.__ft[k], 'listo'), () => -1));
    const ok = await esperar((n) => Object.keys(window.__stubDB().fotosObra || {}).length > n, n0, 40000);
    x.enLaBase = ok ? Math.round((await t()) - t0) : -1;
    x.piezas = await ev(() => window.__tt.slice());
    R.camB.push(x);
    await ev(() => window.camaraApp.cerrar()); await p.waitForTimeout(600);
  }
  R.rapida = await ev(() => { try { return JSON.parse(localStorage.getItem('ema.fotos.tiempos') || '[]'); } catch (e) { return []; } });
  R.errores = A.errores.slice(0, 5);
  await A.browser.close();
  return R;
}
(async () => {
  const conds = [
    { n: 'normal (CPU×6, GPS ok, R2 1,5 s)', gum: 300, r2: R2_MS },
    { n: 'lento (CPU×6, señal 2000 kbps, GPS sin fix, R2 5 s)', gum: 300, r2: 5000, kbps: 2000, sinFix: true }
  ];
  const todo = [];
  for (const c of conds) {
    const R = await correr(c); todo.push(R);
    console.log('== ' + c.n + ' · botón «' + R.boton + '»');
    R.obra.forEach((x, i) => console.log(`  Modo obra foto ${i + 1}: abrir cámara ${x.abrir} ms · disparo→«Sacar otra» ${x.siguiente} ms · en la base ${x.enLaBase} ms · ` + x.piezas.map((q) => q.n + ' ' + q.ms).join(', ')));
    R.camB.forEach((x, i) => console.log(`  Cámara B ${i + 1}: abrir ${x.abrir} ms (píldora ${x.pildora}) · disparo→disparador listo ${x.siguiente} ms · en la base ${x.enLaBase} ms · ` + x.piezas.map((q) => q.n + ' ' + q.ms).join(', ')));
    console.log('  fotoRapida: ' + R.rapida.map((x) => x.ms + (x.gps ? '/gps ' + x.gps : '')).join(' · '));
    if (R.errores.length) console.log('  ERRORES: ' + R.errores.join(' | '));
  }
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(todo));
})();
