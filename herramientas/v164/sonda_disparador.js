// Sonda (A): ¿el disparador responde? Modo obra / cámara de la barra, CPU ×6, GPS sin fix. Toca con el dedo (touchscreen) en
// las coordenadas del disparador SIN esperar (como el dedo) y anota qué recibe cada toque.
process.env.CPU = process.env.CPU || '6';
const { abrir } = require('./h');
const { datos147, P } = require('./datos147');
const MODO = process.argv[2] || 'obra', GPS = process.env.GPS || 'sinfix';
const prep = () => {
  window.__stubPorColeccion = true;
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#c33'; x.fillRect((Date.now() / 7) % c.width, 100, 60, 60); };
  const LENTO = +(window.localStorage.getItem('sonda.gum') || 300);
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { await new Promise((r) => setTimeout(r, LENTO)); const c = document.createElement('canvas'); c.width = 1920; c.height = 1440; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
  window.__L = []; const L = (s) => window.__L.push(Math.round(performance.now()) + ' ' + s);
  window.__lg = L;
  document.addEventListener('pointerdown', (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); L('pointerdown en ' + (el ? (el.id || el.className || el.tagName) : '-') + ' / target ' + (e.target.id || e.target.className || e.target.tagName)); }, true);
  document.addEventListener('click', (e) => { L('click en ' + (e.target.id || e.target.className || e.target.tagName) + (e.defaultPrevented ? ' (prevenido)' : '')); }, true);
  document.addEventListener('change', (e) => L('change ' + e.target.id), true);
  const tb = HTMLCanvasElement.prototype.toBlob; HTMLCanvasElement.prototype.toBlob = function (cb, ...a) { L('toBlob ' + this.width); return tb.call(this, (b) => { L('toBlob listo ' + this.width); cb(b); }, ...a); };
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.duration > 100) L('LARGA ' + Math.round(e.duration) + 'ms (' + Math.round(e.startTime) + ')'); })).observe({ entryTypes: ['longtask'] }); } catch (e) { }
  new MutationObserver((ms) => ms.forEach((x) => x.addedNodes.forEach((n) => { if (n.id && /^(emaCam|cdHoja|fnOtro|cbHoja)$/.test(n.id)) L('+ ' + n.id); }))).observe(document, { childList: true, subtree: true });
};
(async () => {
  const A = await abrir({ datos: datos147(), sesion: 'juan', cel: true, dpr: 2, espera: 7000, https: true, antes: prep, v147: true, mov: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, obraGps: true, camaraB: true, porPartes: true, v145: true, v146: true, sugerida: true, v150: true, v152: true, v157: true, v164: !!process.env.V164 });
  const p = A.page, ev = (f, a) => p.evaluate(f, a);
  await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { await new Promise((r) => setTimeout(r, 1500)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }); });
  await A.ctx.grantPermissions(GPS === 'nogps' ? ['camera'] : ['camera', 'geolocation'], { origin: 'https://app.test' });
  if (GPS === 'ok') await A.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 8 });
  if (GPS === 'sinfix') await A.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 900 });
  const box = async (sel) => { const b = await p.locator(sel).first().boundingBox().catch(() => null); return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : null; };
  const tocar = async (sel, nombre) => { const c = await box(sel); if (!c) { await ev((s) => window.__lg('NO HAY ' + s), sel); return false; } await ev((s) => window.__lg('>> toco ' + s), nombre || sel); await p.touchscreen.tap(c.x, c.y); return true; };
  const t0 = Date.now();
  if (MODO === 'obra') { await ev(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(3000); await tocar('#cdApp [data-cd="boton"]', 'botón grande'); }
  else { await tocar('#navN1 [data-n1="camara"]', 'Cámara de la barra'); }
  // el dedo: toca el disparador apenas aparece y después cada 700 ms, 8 veces
  for (let i = 0; i < 40; i++) { if (await ev(() => !!document.querySelector('#emaCam [data-ec="disparar"]'))) break; await p.waitForTimeout(50); }
  await ev(() => window.__lg('cámara en la página; video ' + ((document.getElementById('ecVideo') || {}).videoWidth || 0)));
  for (let i = 0; i < +(process.env.N || 8); i++) {
    const hay = await ev(() => !!document.querySelector('#emaCam [data-ec="disparar"]'));
    if (!hay) { await ev(() => window.__lg('(cámara cerrada)')); const h = await ev(() => { const x = document.getElementById('cdHoja'); return x ? x.textContent.slice(0, 60) : ''; }); if (h) await ev((t) => window.__lg('hoja: ' + t), h); if (MODO === 'obra' && await tocar('#cdHoja [data-cdh="otra"]', 'Sacar otra')) { await p.waitForTimeout(150); continue; } break; }
    await ev(() => window.__lg('video ' + ((document.getElementById('ecVideo') || {}).videoWidth || 0) + ' rs ' + ((document.getElementById('ecVideo') || {}).readyState || 0)));
    await tocar('#emaCam [data-ec="disparar"]', 'DISPARADOR');
    await p.waitForTimeout(+(process.env.CADA || 700));
  }
  await p.waitForTimeout(4000);
  const L = await ev(() => window.__L);
  const base = L.length ? +L[0].split(' ')[0] : 0;
  console.log(L.map((s) => { const i = s.indexOf(' '); return String(+s.slice(0, i) - base).padStart(6) + ' ' + s.slice(i + 1); }).join('\n'));
  const n = await ev(() => { const d = window.__stubDB(); return { fo: Object.keys(d.fotosObra || {}).length, campo: Object.keys(((d.ordenesTrabajo.ot1 || {}).campo || {}).fotos || {}).length }; });
  console.log('fotos en la base:', JSON.stringify(n), 'errores:', A.errores.slice(0, 5));
  await A.browser.close();
})();
