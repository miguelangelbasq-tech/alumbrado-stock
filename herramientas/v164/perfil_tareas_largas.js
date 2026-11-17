// v164 · ¿Qué son las tareas largas? Perfil de CPU (CDP) + PerformanceObserver(longtask) en Modo obra (3 fotos) y cámara de la barra (5).
process.env.CPU = process.env.CPU || '6';
const { abrir } = require('./h');
const { datos147, P } = require('./datos147');
const prep = () => {
  window.__stubPorColeccion = true;
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#c33'; x.fillRect((Date.now() / 7) % c.width, 100, 60, 60); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { await new Promise((r) => setTimeout(r, 300)); const c = document.createElement('canvas'); c.width = 1920; c.height = 1440; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
  window.__LT = []; window.__MK = [];
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__LT.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ entryTypes: ['longtask'] }); } catch (e) { }
};
(async () => {
  const A = await abrir({ datos: datos147(), sesion: 'juan', cel: true, dpr: 2, espera: 7000, https: true, antes: prep, v147: true, mov: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, obraGps: true, camaraB: true, porPartes: true, v145: true, v146: true, sugerida: true, v150: true, v152: true, v157: true, v164: !!process.env.V164 });
  const p = A.page, ev = (f, a) => p.evaluate(f, a);
  await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { await new Promise((r) => setTimeout(r, 1500)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }); });
  await A.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' });
  await A.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 8 });
  const mk = (s) => ev((x) => window.__MK.push([Math.round(performance.now()), x]), s);
  const tapSel = async (sel) => { const b = await p.locator(sel).first().boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
  const vid = () => p.waitForFunction(() => { const v = document.getElementById('ecVideo'); return v && v.videoWidth > 0 && v.readyState >= 2; }, null, { timeout: 30000, polling: 50 });
  await ev(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(3000);
  const cdp = page = p.__cdp; await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 300 }); await cdp.send('Profiler.start');
  const pt0 = await ev(() => performance.now());
  await ev(() => { window.__LT = []; });
  for (let i = 0; i < 3; i++) {
    await mk(i ? 'abrir (Sacar otra)' : 'abrir (Foto)'); await tapSel(i ? '#cdHoja [data-cdh="otra"]' : '#cdApp [data-cd="boton"]'); await vid(); await p.waitForTimeout(500);
    await mk('disparo ' + (i + 1)); await tapSel('#emaCam [data-ec="disparar"]');
    await p.waitForFunction(() => { const h = document.getElementById('cdHoja'); return h && h.querySelector('[data-cdh="otra"]'); }, null, { timeout: 30000, polling: 50 });
    await mk('hoja'); await p.waitForTimeout(1500);
  }
  await ev(() => { const b = document.querySelector('#cdHoja [data-cdh="x"]'); b && b.click(); }); await p.waitForTimeout(1500);
  await mk('abrir cámara barra'); await ev(() => { const b = document.querySelector('#navN1 [data-n1="camara"]'); b && b.click(); }); await vid(); await p.waitForTimeout(1200);
  for (let i = 0; i < 5; i++) { await mk('disparo B' + (i + 1)); await tapSel('#emaCam [data-ec="disparar"]'); await p.waitForTimeout(1500); }
  if (process.env.V164) { await mk('nombrar Tablero'); await ev(() => { const b = document.querySelector('#emaCam [data-cbm="tablero"]'); b && b.click(); }); await p.waitForTimeout(800); }
  await mk('esperar con la cámara abierta'); await p.waitForTimeout(12000);
  await mk('fin');
  const { profile } = await cdp.send('Profiler.stop');
  const LT = await ev(() => window.__LT), MK = await ev(() => window.__MK);
  // tiempo de cada muestra (ms, en la escala de performance.now)
  const byId = new Map(profile.nodes.map((n) => [n.id, n])); const par = new Map(); profile.nodes.forEach((n) => (n.children || []).forEach((c) => par.set(c, n.id)));
  let t = 0; const S = profile.samples.map((id, i) => { t += profile.timeDeltas[i] || 0; return [pt0 + t / 1000, id]; });
  const nom = (n) => { const cf = n.callFrame; return (cf.functionName || '(anón)') + ':' + (cf.lineNumber + 1) + ':' + (cf.columnNumber + 1); };
  const marca = (ms) => { let m = ''; MK.forEach(([tt, x]) => { if (tt <= ms) m = x; }); return m; };
  console.log('MARCAS', MK.map(([tt, x]) => Math.round(tt - pt0) + ' ' + x).join(' · '));
  LT.filter(([s, d]) => d >= 120).forEach(([s, d]) => {
    const self = new Map(), app = new Map();
    S.forEach(([ts, id]) => { if (ts < s || ts > s + d) return; const n = byId.get(id); self.set(nom(n), (self.get(nom(n)) || 0) + 1);
      // las funciones de la app en la pila (de abajo hacia arriba), sin repetir
      const vistos = new Set(); let x = id; while (x != null) { const nn = byId.get(x); if (nn.callFrame.url && /index\.html|app\.test/.test(nn.callFrame.url)) { const k = nom(nn); if (!vistos.has(k)) { vistos.add(k); app.set(k, (app.get(k) || 0) + 1); } } x = par.get(x); } });
    const tot = [...self.values()].reduce((a, b) => a + b, 0) || 1;
    const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => Math.round(100 * v / tot) + '% ' + k).join(' | ');
    console.log(`\n### ${d} ms @${Math.round(s - pt0)} [${marca(s)}]\n  propio: ${top(self, 6)}\n  app: ${top(app, 8)}`);
  });
  require('fs').writeFileSync('/tmp/perf164.cpuprofile', JSON.stringify(profile));
  await A.browser.close();
})();
