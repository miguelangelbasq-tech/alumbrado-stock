// v164 · Medición antes (v163) / después (v164) de las fotos de la cuadrilla, en el celu (390×844) con CPU ×6 (CPU=4 para la otra).
// Uso: APP=.../index.html [V164=1] [CPU=6] [GPS=ok|sinfix] node medir164.js [salida.json]
// · Disparador: del toque a la primera señal (destello o la cámara que se va), del toque a la foto entregada (el «change» del
//   input), tocar mientras la cámara arranca (getUserMedia lento: 1,5 s) y dos toques seguidos (¿cuántas fotos? ¿errores?).
// · Abrir la cámara desde Modo obra (la 1.ª y «Sacar otra»).
// · La oficina (otra página, otra sesión) ve la foto: Modo obra (3) y cámara de la barra (5 seguidas con la cámara abierta).
// · Tareas largas (PerformanceObserver longtask) por fase: abrir · disparo · subiendo con la cámara abierta · nombrar.
process.env.CPU = process.env.CPU || '6';
const fs = require('fs');
const { abrir, otraPagina } = require('./h');
const { datos147, P } = require('./datos147');
const OUT = process.argv[2] || '', V = !!process.env.V164, GPS = process.env.GPS || 'ok';
const OP = { crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, obraGps: true, camaraB: true, porPartes: true, v145: true, v146: true, v147: true, sugerida: true, v150: true, v152: true, v157: true, v164: V, https: true, mov: true };
const prep = () => {
  window.__stubPorColeccion = true;
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#6f6f5c'; x.fillRect(0, c.height * 0.62, c.width, c.height); x.fillStyle = '#c33'; x.fillRect((Date.now() / 7) % c.width, 100, 60, 60); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { await new Promise((r) => setTimeout(r, window.__gumMs || 300)); const c = document.createElement('canvas'); c.width = 1920; c.height = 1440; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
  window.__LT = []; window.__FASE = 'arranque'; window.__EV = [];
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__LT.push([window.__FASE, Math.round(e.duration)]))).observe({ entryTypes: ['longtask'] }); } catch (e) { }
  document.addEventListener('change', (e) => { if (/^(cdFotoIn|ecLibreIn)$/.test(e.target.id)) window.__EV.push(['foto', performance.now()]); }, true);
  window.addEventListener('error', (e) => window.__EV.push(['error', performance.now(), String(e.message)]));
  window.addEventListener('unhandledrejection', (e) => window.__EV.push(['error', performance.now(), String(e.reason && e.reason.message || e.reason)]));
  const obs = () => { if (!document.body) return setTimeout(obs, 50); new MutationObserver(() => { const c = document.getElementById('emaCam'); if (window.__camAbierta && !c) { window.__camAbierta = false; window.__EV.push(['camCerrada', performance.now()]); } if (c && !window.__camAbierta) { window.__camAbierta = true; window.__EV.push(['camAbierta', performance.now()]); } const f = document.getElementById('ecFlash'); if (f && !f.__m) { f.__m = 1; } }).observe(document.body, { childList: true }); };
  obs();
  const an = Element.prototype.animate; Element.prototype.animate = function () { if (this.id === 'ecFlash') window.__EV.push(['destello', performance.now()]); return an.apply(this, arguments); };
};
(async () => {
  const A = await abrir(Object.assign({ datos: datos147(), sesion: 'juan', cel: true, dpr: 2, espera: 7000, antes: prep }, OP));
  const p = A.page, ev = (f, a) => p.evaluate(f, a);
  await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { await new Promise((r) => setTimeout(r, 1500)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }).catch(() => { }); });
  await A.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' });
  await A.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: GPS === 'sinfix' ? 900 : 8 });
  const B = await otraPagina(A, Object.assign({ sesion: 'lucia', espera: 6000, antes: () => { window.__stubPorColeccion = true; } }, OP, { cel: false }));
  await B.page.evaluate(() => { window.__visto = {}; setInterval(() => { try { const o = (ordenesTrabajo || []).find((x) => x.id === 'ot1'); const f = (o && o.campo && o.campo.fotos) || {}; Object.keys(f).forEach((k) => { if (!window.__visto[k] && f[k] && f[k].mini) window.__visto[k] = Date.now(); }); } catch (e) { } }, 100); });
  const fase = (f) => ev((x) => { window.__FASE = x; }, f);
  const ahora = () => ev(() => performance.now());
  const evs = () => ev(() => window.__EV.slice());
  const tapSel = async (sel) => { const b = await p.locator(sel).first().boundingBox(); if (!b) return false; await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); return true; };
  const esperar = (fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 30000, polling: 40 }).then(() => true, () => false);
  const vid = () => esperar(() => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0 && v.readyState >= 2; });
  const prim = (L, tipo, t) => { const e = L.find((x) => x[0] === tipo && x[1] >= t); return e ? Math.round(e[1] - t) : -1; };
  const R = { v164: V, cpu: process.env.CPU, gps: GPS, obra: [], camB: [], abrirObra: [] };
  // ------------------------------------------------ Modo obra: 3 fotos (Foto → disparo → Sacar otra …)
  await ev(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(3500);
  const SOLO_A = process.env.SECC === 'A';
  if (SOLO_A) { await tapSel('#cdApp [data-cd="boton"]'); await vid(); await p.waitForTimeout(500); await tapSel('#emaCam [data-ec="disparar"]'); await esperar(() => !!document.getElementById('cdHoja'), null, 30000); await p.waitForTimeout(3000); }
  const kO = await ev(() => Date.now());
  if (!SOLO_A) {
  for (let i = 0; i < 3; i++) {
    await fase('abrir'); const ta = await ahora();
    const selA = i ? '#cdHoja [data-cdh="otra"]' : '#cdApp [data-cd="boton"]';
    await esperar((q) => !!document.querySelector(q), selA, 15000); await tapSel(selA);
    if (!(await esperar(() => !!document.getElementById('emaCam'), null, 5000))) await ev((q) => { const b = document.querySelector(q); b && b.click(); }, selA);
    await vid(); R.abrirObra.push(Math.round((await ahora()) - ta));
    await p.waitForTimeout(500);
    await fase('disparo'); const t0 = await ahora(), w0 = await ev(() => Date.now());
    await tapSel('#emaCam [data-ec="disparar"]');
    await esperar(() => { const h = document.getElementById('cdHoja'); return !!h && !!h.querySelector('[data-cdh="otra"]'); }, null, 40000);
    const L = await evs(), th = await ahora();
    R.obra.push({ w0, senal: Math.min(...[prim(L, 'destello', t0), prim(L, 'camCerrada', t0)].filter((x) => x >= 0)), cerrada: prim(L, 'camCerrada', t0), entregada: prim(L, 'foto', t0), hoja: Math.round(th - t0) });
    await fase('despues'); await p.waitForTimeout(1500);
  }
  await ev(() => { const b = document.querySelector('#cdHoja [data-cdh="x"]'); b && b.click(); }); await p.waitForTimeout(1500);
  // ------------------------------------------------ Cámara de la barra: 5 seguidas con la cámara abierta
  await fase('abrir'); const tb = await ahora();
  await ev(() => { const b = document.querySelector('#navN1 [data-n1="camara"]'); if (b) b.click(); else document.getElementById('menuCamara').click(); });
  await vid(); R.abrirBarra = Math.round((await ahora()) - tb);
  await esperar(() => !!document.getElementById('cbPill'), null, 15000); await p.waitForTimeout(800);
  const kB = await ev(() => Date.now());
  for (let i = 0; i < 5; i++) {
    await fase('disparo'); const t0 = await ahora(), w0 = await ev(() => Date.now());
    await tapSel('#emaCam [data-ec="disparar"]');
    await p.waitForTimeout(400); await fase('subiendo'); await p.waitForTimeout(1100);
    const L = await evs();
    R.camB.push({ w0, senal: prim(L, 'destello', t0), entregada: prim(L, 'foto', t0) });
  }
  // nombrar (solo la v164 tiene los botones en la cámara)
  if (V) { await fase('nombrar'); for (const s of ['[data-cbm="tablero"]', '[data-cbm="pat"]', '[data-cbm="columna"]']) { await tapSel('#emaCam ' + s); await p.waitForTimeout(700); } }
  await fase('subiendo');
  const t5 = Date.now(); let todas = false;
  const nuevas = async (desde) => { const f = await ev(() => { const d = window.__stubDB(); const o = (d.ordenesTrabajo || {}).ot1 || {}; return Object.keys((o.campo && o.campo.fotos) || {}).map((k) => [k, o.campo.fotos[k].ts || 0]); }); return f.filter((x) => x[1] >= desde - 5000); };
  while (Date.now() - t5 < 30000) { const vis = await B.page.evaluate(() => window.__visto), nv = await nuevas(kB); if (nv.length >= 5 && nv.every((x) => vis[x[0]])) { todas = true; break; } await p.waitForTimeout(250); }
  R.camBAbierta = await ev(() => !!document.getElementById('emaCam')); R.camBTodasConCamaraAbierta = todas && R.camBAbierta;
  await p.waitForTimeout(6000);
  { const vis = await B.page.evaluate(() => window.__visto); const nv = (await nuevas(kB)).sort((a, b) => a[1] - b[1]); R.camBFotos = nv.length; nv.slice(0, 5).forEach((x, i) => { if (R.camB[i]) R.camB[i].oficina = vis[x[0]] ? vis[x[0]] - R.camB[i].w0 : -1; }); }
  { const vis = await B.page.evaluate(() => window.__visto); const nv = (await nuevas(kO)).filter((x) => x[1] < kB).sort((a, b) => a[1] - b[1]); R.obraFotos = nv.length; nv.slice(0, 3).forEach((x, i) => { if (R.obra[i]) R.obra[i].oficina = vis[x[0]] ? vis[x[0]] - R.obra[i].w0 : -1; }); }
  await ev(() => window.camaraApp.cerrar()); await fase('fin'); await p.waitForTimeout(500);
  }
  // ------------------------------------------------ tocar mientras la cámara arranca (getUserMedia 1,5 s) y dos toques seguidos
  await ev(() => { window.__gumMs = 1500; const h = document.querySelector('#cdHoja [data-cdh="x"]'); h && h.click(); }); await p.waitForTimeout(2500);
  const nF0 = (await evs()).filter((x) => x[0] === 'foto').length, nE0 = (await evs()).filter((x) => x[0] === 'error').length;
  const abrirObra = () => ev(() => { const i = document.getElementById('cdFotoIn'); window.camaraApp.abrir(i); });   // la misma cámara de Modo obra (el input de la última foto)
  await abrirObra();
  await esperar(() => !!document.querySelector('#emaCam [data-ec="disparar"]'), null, 5000);
  const tA = await ahora(); await ev(() => document.querySelector('#emaCam [data-ec="disparar"]').click());   // apenas aparece (antes de que haya imagen)
  await esperar(() => !document.getElementById('emaCam'), null, 12000); await p.waitForTimeout(1500);
  { const L = await evs(); R.arrancando = { foto: L.filter((x) => x[0] === 'foto').length - nF0, senal: prim(L, 'destello', tA), entregada: prim(L, 'foto', tA) }; }
  await ev(() => { const b = document.querySelector('#cdHoja [data-cdh="x"]'); b && b.click(); window.__gumMs = 300; }); await p.waitForTimeout(1500);
  const nF1 = (await evs()).filter((x) => x[0] === 'foto').length;
  await abrirObra(); await vid(); await p.waitForTimeout(500);
  await ev(() => { const b = document.querySelector('#emaCam [data-ec="disparar"]'); b.click(); setTimeout(() => { const c = document.querySelector('#emaCam [data-ec="disparar"]'); c && c.click(); }, 120); });
  await p.waitForTimeout(5000);
  { const L = await evs(); R.dosToques = { fotos: L.filter((x) => x[0] === 'foto').length - nF1, errores: L.filter((x) => x[0] === 'error').slice(nE0).map((x) => x[2]).slice(0, 3) }; }
  // ------------------------------------------------ tareas largas por fase
  const LT = await ev(() => window.__LT), F = {};
  LT.forEach(([f, d]) => { const x = F[f] || (F[f] = { n: 0, n200: 0, max: 0 }); x.n++; if (d > 200) x.n200++; x.max = Math.max(x.max, d); });
  R.largas = F;
  R.errores = A.errores.slice(0, 5);
  await A.browser.close();
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(R));
  const s = (x) => (x == null || x < 0 ? '—' : x >= 1000 ? (x / 1000).toFixed(1) + ' s' : x + ' ms');
  console.log(`== ${V ? 'v164' : 'v163 (antes)'} · CPU ×${R.cpu} · GPS ${GPS} · R2 1,5 s`);
  (R.obra || []).forEach((x, i) => console.log(`  Modo obra foto ${i + 1}: abrir ${s(R.abrirObra[i])} · toque → señal ${s(x.senal)} · → foto entregada ${s(x.entregada)} · → «Foto guardada» ${s(x.hoja)} · → la oficina la ve ${s(x.oficina)}`));
  if (R.abrirBarra != null) console.log(`  Cámara de la barra: abrir ${s(R.abrirBarra)}`);
  R.camB.forEach((x, i) => console.log(`  Barra foto ${i + 1}: toque → señal ${s(x.senal)} · → foto entregada ${s(x.entregada)} · → la oficina la ve ${s(x.oficina)}`));
  if (!SOLO_A) console.log(`  la oficina vio las 5 con la cámara abierta: ${R.camBTodasConCamaraAbierta ? 'sí' : 'no'} · fotos nuevas: Modo obra ${R.obraFotos}, barra ${R.camBFotos}`);
  console.log(`  tocar con la cámara arrancando (1,5 s): ${R.arrancando.foto} foto · señal ${s(R.arrancando.senal)} · entregada ${s(R.arrancando.entregada)}`);
  console.log(`  dos toques seguidos (120 ms): ${R.dosToques.fotos} foto(s)${R.dosToques.errores.length ? ' · ERRORES: ' + R.dosToques.errores.join(' | ') : ' · sin errores'}`);
  console.log('  tareas largas (cantidad · > 200 ms · la más larga): ' + Object.keys(F).map((k) => `${k} ${F[k].n} · ${F[k].n200} · ${F[k].max} ms`).join(' | '));
})();
