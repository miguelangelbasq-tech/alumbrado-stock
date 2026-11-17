// v164 · «Apretás y saca AL INSTANTE»: toques reales (page.touchscreen → CDP Input.dispatchTouchEvent), 5 seguidos a ~1 por segundo,
// en Modo obra y en la cámara de la barra. Por toque: del pointerdown (su timeStamp: cuando el celu registró el dedo) al cuadro
// con el destello (rAF después de empezar la animación) y si el toque sacó foto. Tareas largas mientras la cámara está abierta.
// Uso: APP=… [V164=1] [CPU=6|4] [OFICINA=1] node medir_toque.js [salida.json]
process.env.CPU = process.env.CPU || '6';
const fs = require('fs');
const { abrir, otraPagina } = require('./h');
const { datos147, P } = require('./datos147');
const V = !!process.env.V164, OFI = !!process.env.OFICINA, OUT = process.argv[2] || '';
const OP = { crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, obraGps: true, camaraB: true, porPartes: true, v145: true, v146: true, v147: true, sugerida: true, v150: true, v152: true, v157: true, v164: V, https: true, mov: true };
const prep = (MOCKQ) => {
  window.__stubPorColeccion = true;
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#6f6f5c'; x.fillRect(0, c.height * 0.62, c.width, c.height); x.fillStyle = '#c33'; x.fillRect((Date.now() / 7) % c.width, 100, 60, 60); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { await new Promise((r) => setTimeout(r, 300)); const c = document.createElement('canvas'); c.width = 1920; c.height = 1440; dib(c); if (!window.__mockQuieto) setInterval(() => dib(c), 200); return c.captureStream(10); };
  window.__T = []; window.__LT = []; window.__camLT = false; window.__mockQuieto = MOCKQ;
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (window.__camLT) { window.__LT.push(Math.round(e.duration)); (window.__LT2 = window.__LT2 || []).push([e.startTime, e.duration]); } })).observe({ entryTypes: ['longtask'] }); } catch (e) { }
  document.addEventListener('pointerdown', (e) => { const b = e.target && e.target.closest && e.target.closest('#emaCam [data-ec="disparar"]'); if (b) window.__T.push({ pd: e.timeStamp, t: performance.now() }); }, true);
  // la señal visible: el destello (v164) o, en la v163, lo primero que cambia en pantalla (la cámara que se cierra o la miniatura nueva)
  const marca = (tipo) => { const x = window.__T[window.__T.length - 1]; if (!x || x.senal) return; x.tipo = tipo; requestAnimationFrame((ts) => { if (!x.senal) x.senal = ts; }); };
  const an = Element.prototype.animate; Element.prototype.animate = function () { if (this.id === 'ecFlash') marca('destello'); return an.apply(this, arguments); };
  const obs = () => { if (!document.body) return setTimeout(obs, 50); new MutationObserver((ms) => { ms.forEach((m) => { m.removedNodes.forEach((n) => { if (n.id === 'emaCam') marca('cerrada'); }); }); }).observe(document.body, { childList: true }); };
  obs();
  document.addEventListener('change', (e) => { if (/^(cdFotoIn|ecLibreIn)$/.test(e.target.id)) { const x = window.__T.find((y) => !y.foto); if (x) x.foto = performance.now(); } }, true);
  window.addEventListener('error', (e) => (window.__ERR = window.__ERR || []).push(String(e.message)));
};
(async () => {
  const A = await abrir(Object.assign({ datos: datos147(), sesion: 'juan', cel: true, dpr: 2, espera: 7000, antes: prep, antesArg: !!process.env.MOCKQ }, OP));
  const p = A.page, ev = (f, a) => p.evaluate(f, a);
  await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { await new Promise((r) => setTimeout(r, 1500)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }).catch(() => { }); });
  await A.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' });
  await A.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 8 });
  let B = null;
  if (OFI) { B = await otraPagina(A, Object.assign({ sesion: 'lucia', espera: 6000, antes: () => { window.__stubPorColeccion = true; } }, OP, { cel: false })); await B.page.evaluate(() => window.__avanceOrden && window.__avanceOrden.abrir('ot1')); }
  const esperar = (fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 30000, polling: 50 }).then(() => true, () => false);
  const vid = () => esperar(() => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0 && v.readyState >= 2; });
  const caja = async (sel) => { const b = await p.locator(sel).first().boundingBox(); return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : null; };
  const R = { v164: V, cpu: process.env.CPU, oficina: OFI };
  async function rafaga(nombre) {
    await ev(() => { window.__T = []; window.__LT = []; window.__camLT = true; });
    const c = await caja('#emaCam [data-ec="disparar"]');
    for (let i = 0; i < 5; i++) {
      if (!(await ev(() => !!document.querySelector('#emaCam [data-ec="disparar"]')))) {   // v163 en Modo obra: la cámara se cierra en cada foto
        await esperar(() => !!document.querySelector('#cdHoja [data-cdh="otra"]'), null, 20000);
        const o = await caja('#cdHoja [data-cdh="otra"]'); if (o) await p.touchscreen.tap(o.x, o.y); await vid(); await p.waitForTimeout(300);
      }
      await p.touchscreen.tap(c.x, c.y);
      await p.waitForTimeout(1000);
    }
    await p.waitForTimeout(3000);
    const T = await ev(() => window.__T), LT = await ev(() => window.__LT);
    await ev(() => { window.__camLT = false; });
    R[nombre] = { toques: T.map((x) => ({ senal: x.senal ? Math.round(x.senal - x.pd) : -1, tipo: x.tipo || '', foto: x.foto ? Math.round(x.foto - x.pd) : -1, js: Math.round(x.t - x.pd) })), largas: { n: LT.length, n100: LT.filter((d) => d > 100).length, n200: LT.filter((d) => d > 200).length, max: Math.max(0, ...LT) } };
  }
  await ev(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(3500);
  let pt0 = 0; if (process.env.PERFILT) { const cdp = p.__cdp; await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 300 }); await cdp.send('Profiler.start'); pt0 = await ev(() => performance.now()); }
  { const b = await caja('#cdApp [data-cd="boton"]'); await p.touchscreen.tap(b.x, b.y); await vid(); await p.waitForTimeout(800); }
  await rafaga('obra');
  await ev(() => { const l = document.querySelector('#emaCam [data-fn="listo"]'); if (l) l.click(); else if (window.camaraApp.abierta()) window.camaraApp.cerrar(); });
  await p.waitForTimeout(1500);
  await ev(() => { const h = document.querySelector('#cdHoja [data-cdh="x"]'); h && h.click(); }); await p.waitForTimeout(1500);
  { const b = await caja('#navN1 [data-n1="camara"]'); await p.touchscreen.tap(b.x, b.y); await vid(); await esperar(() => !!document.getElementById('cbPill'), null, 15000); await p.waitForTimeout(1200); }
  await rafaga('barra');
  if (process.env.PERFILT) {
    const { profile } = await p.__cdp.send('Profiler.stop'); const LT = await ev(() => window.__LT2 || []);
    const byId = new Map(profile.nodes.map((n) => [n.id, n])); const par = new Map(); profile.nodes.forEach((n) => (n.children || []).forEach((c) => par.set(c, n.id)));
    let t = 0; const SM = profile.samples.map((id, i) => { t += profile.timeDeltas[i] || 0; return [pt0 + t / 1000, id]; });
    const nom = (n) => { const cf = n.callFrame; return (cf.functionName || '(anón)') + ':' + (cf.lineNumber + 1); };
    const tot = new Map();
    LT.filter(([s0, d]) => d > 100).forEach(([s0, d]) => { SM.forEach(([ts, id]) => { if (ts < s0 || ts > s0 + d) return; const vis = new Set(); let x = id; while (x != null) { const nn = byId.get(x); if (nn.callFrame.url) { const k = nom(nn); if (!vis.has(k)) { vis.add(k); tot.set(k, (tot.get(k) || 0) + 0.3); } } x = par.get(x); } }); });
    const cat = new Map(); LT.filter(([s0, d]) => d > 100).forEach(([s0, d]) => { SM.forEach(([ts, id]) => { if (ts < s0 || ts > s0 + d) return; let x = id, k = 'nativo/idle/GC (sin JS)'; const n0 = byId.get(id); if (!/^\((idle|program|garbage collector)\)$/.test(n0.callFrame.functionName) || n0.callFrame.url) { k = null; while (x != null) { const nn = byId.get(x); if (nn.callFrame.url) { k = /app\.test|index\.html|\.html/.test(nn.callFrame.url) ? 'la app' : 'otro: ' + nn.callFrame.url.slice(0, 40); break; } x = par.get(x); } if (!k) k = 'JS sin archivo (el arnés: firebase_stub / reglas_stub)'; if (/^\((idle|program|garbage collector)\)$/.test(n0.callFrame.functionName)) k = n0.callFrame.functionName; } cat.set(k, (cat.get(k) || 0) + 0.3); }); });
    console.log('PERFIL por origen (ms dentro de las tareas > 100 ms): ' + [...cat.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + Math.round(v)).join(' · '));
    console.log('PERFIL (ms incluidos dentro de las tareas > 100 ms):'); [...tot.entries()].sort((a, b) => b[1] - a[1]).slice(0, 45).forEach(([k, v]) => console.log(String(Math.round(v)).padStart(6) + '  ' + k));
  }
  R.errores = (await ev(() => window.__ERR || [])).concat(A.errores).slice(0, 4);
  await A.browser.close();
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(R));
  const f = (x) => '[dedo→JS ' + x.js + '] ' + (x.senal < 0 ? '—' : x.senal + ' ms') + (x.tipo ? ' (' + x.tipo + ')' : '') + (x.foto >= 0 ? ' · foto ' + x.foto + ' ms' : ' · SIN FOTO');
  console.log(`== ${V ? 'v164' : 'v163 (antes)'} · CPU ×${R.cpu}${OFI ? ' · con la oficina abierta' : ''}`);
  ['obra', 'barra'].forEach((k) => { const r = R[k]; console.log(`  ${k === 'obra' ? 'Modo obra' : 'Cámara de la barra'}: ${r.toques.length} toques · toque → señal en pantalla: ${r.toques.map(f).join(' | ')}`); console.log(`    tareas largas con la cámara abierta: ${r.largas.n} · > 100 ms ${r.largas.n100} · > 200 ms ${r.largas.n200} · la más larga ${r.largas.max} ms`); });
  if (R.errores.length) console.log('  errores: ' + R.errores.join(' | '));
})();
