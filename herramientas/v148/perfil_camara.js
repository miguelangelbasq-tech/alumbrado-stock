// v148 · ¿Qué tarda al abrir la cámara? Perfil de CPU (CDP) del toque «Foto · Col N» hasta el video con imagen (CPU ×6).
// Uso: APP=... node _perfcam.js [obra|barra]
const { abrir } = require('./h');
const { datos147, P } = require('./datos147');
const modo = process.argv[2] || 'obra';
const prep = () => {
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); };
  navigator.mediaDevices.getUserMedia = async () => { window.__m && window.__m('getUserMedia'); await new Promise((r) => setTimeout(r, 300)); const c = document.createElement('canvas'); c.width = 1280; c.height = 960; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
  window.__mk148 = [];
  const m = (n) => window.__mk148.push([n, Math.round(performance.now())]);
  window.__m = m; const pl = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { m('play'); return pl.apply(this, arguments); };
  new MutationObserver((ms) => ms.forEach((x) => x.addedNodes.forEach((n) => { if (n.id === 'emaCam') m('emaCam en la página'); }))).observe(document, { childList: true, subtree: true });
  document.addEventListener('pointerdown', () => m('toque'), true);
  document.addEventListener('click', () => m('click'), true);
  document.addEventListener('change', (e) => m('change ' + (e.target && e.target.id)), true);
  const tb = HTMLCanvasElement.prototype.toBlob; HTMLCanvasElement.prototype.toBlob = function (cb, ...a) { m('toBlob ' + this.width); return tb.call(this, (b) => { m('toBlob listo'); cb(b); }, ...a); };
  new MutationObserver((ms) => ms.forEach((x) => x.addedNodes.forEach((n) => { if (n.id === 'cdHoja') { m('cdHoja en la página'); requestAnimationFrame(() => { m('rAF'); setTimeout(() => m('pintado'), 0); }); } }))).observe(document, { childList: true, subtree: true });
  const lt = new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__mk148.push(['tarea larga ' + Math.round(e.duration), Math.round(e.startTime)]))); try { lt.observe({ entryTypes: ['longtask'] }); } catch (e) { }
};
(async () => {
  const A = await abrir({ datos: datos147(), sesion: 'juan', cel: true, dpr: 2, espera: 7000, https: true, antes: prep, v147: true, mov: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, obraGps: true, camaraB: true, porPartes: true, v145: true, v146: true, sugerida: true });
  const p = A.page, ev = (f, a) => p.evaluate(f, a);
  await A.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' });
  await A.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 8 });
  if (modo === 'obra') { await ev(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(5000); }
  if (modo === 'disparo') { await ev(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(1500); await p.tap('#cdApp [data-cd="boton"]'); await p.waitForFunction(() => { const v = document.getElementById('ecVideo'); return v && v.videoWidth > 0 && v.readyState >= 2; }, null, { timeout: 30000 }); await p.waitForTimeout(1500); }
  const cdp = await A.ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start');
  const t0 = await ev(() => performance.now());
  if (modo === 'disparo') {
    await p.tap('#emaCam [data-ec="disparar"]');
    await p.waitForFunction(() => { const h = document.getElementById('cdHoja'); if (h && /Foto guardada/.test(h.textContent)) { window.__m('foto guardada'); return true; } return false; }, null, { timeout: 30000, polling: 20 });
  } else {
  if (modo === 'obra') await p.tap('#cdApp [data-cd="boton"]'); else await p.tap('#navN1 [data-n1="camara"]');
  await p.waitForFunction(() => { const v = document.getElementById('ecVideo'); if (v && v.videoWidth > 0 && v.readyState >= 2) { window.__m('video listo'); return true; } return false; }, null, { timeout: 30000, polling: 20 });
  }
  const { profile } = await cdp.send('Profiler.stop');
  const marcas = await ev(() => window.__mk148);
  console.log('marcas:', marcas.map(([n, t]) => n + ' ' + Math.round(t - marcas[0][1])).join(' · '));
  // tiempo propio por función
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const self = new Map(); const dt = profile.timeDeltas; let tot = 0;
  profile.samples.forEach((id, i) => { const n = byId.get(id), d = dt[i] || 0; tot += d; const cf = n.callFrame; const k = (cf.functionName || '(anónima)') + ' @' + (cf.url.split('/').pop() || '') + ':' + (cf.lineNumber + 1) + ':' + (cf.columnNumber + 1); self.set(k, (self.get(k) || 0) + d); });
  console.log('total muestreado', Math.round(tot / 1000), 'ms');
  [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, v]) => console.log(String(Math.round(v / 1000)).padStart(6) + ' ms  ' + k));
  // tiempo total (incluido) de las funciones de primer nivel bajo cada evento
  const incl = new Map();
  const tiempoNodo = new Map(); profile.samples.forEach((id, i) => tiempoNodo.set(id, (tiempoNodo.get(id) || 0) + (dt[i] || 0)));
  const total = (n) => { let s = tiempoNodo.get(n.id) || 0; (n.children || []).forEach((c) => { s += total(byId.get(c)); }); return s; };
  profile.nodes.forEach((n) => { const cf = n.callFrame; if (!cf.url) return; const k = (cf.functionName || '(anónima)') + ' @' + ':' + (cf.lineNumber + 1) + ':' + (cf.columnNumber + 1); incl.set(k, Math.max(incl.get(k) || 0, total(n))); });
  console.log('--- incluido');
  [...incl.entries()].sort((a, b) => b[1] - a[1]).slice(0, 70).forEach(([k, v]) => console.log(String(Math.round(v / 1000)).padStart(6) + ' ms  ' + k));
  await A.browser.close();
})();
