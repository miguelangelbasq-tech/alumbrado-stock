// v165 · «Que no se tilde nada»: tareas largas (PerformanceObserver longtask) con la CPU ×6 en cada paso nuevo:
//   Modo obra (abrir) · el cartel «Voy a iniciar» · la cámara C (abrir, 1 foto, «Col ▾») · «Terminé» · Llenar orden (abrir, tildar
//   la tarea con las columnas, «Las que siguen»). Uso: APP=…/index.html node medir_v165.js [rate] [v165:1|0]  → JSON por paso.
const { abrir } = require('./h');
const { datos165 } = require('./datos165');
const RATE = +(process.argv[2] || 6), ON = process.argv[3] !== '0';
const camaraFalsa = () => {
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#e9edf2'; x.fillRect(c.width * 0.47, c.height * 0.12, c.width * 0.05, c.height * 0.62); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { const c = document.createElement('canvas'); c.width = 720; c.height = 1280; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
  window.__stubPorColeccion = true;   // como Firestore: cada escucha se entera solo de su colección
  window.__lt = []; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push({ t: Math.round(e.startTime), d: Math.round(e.duration) }))).observe({ entryTypes: ['longtask'] }); } catch (e) { }
};
(async () => {
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v165: ON, antes: camaraFalsa };
  const out = { rate: RATE, v165: ON, pasos: {} };
  // el toque con el mouse en el lugar del botón (sin el buscador de Playwright adentro de la página, que cuenta como tarea larga)
  const toca = async (p, sel) => { const r = await p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel); if (r) await p.mouse.click(r.x, r.y); };
  const medir = async (p, nombre, fn, espera) => { await p.waitForTimeout(400); const t0 = await p.evaluate(() => performance.now()); await fn(); await p.waitForTimeout(espera || 1500); const l = await p.evaluate((t0) => window.__lt.filter((x) => x.t >= t0 - 5), t0); out.pasos[nombre] = { n: l.length, max: l.length ? Math.max.apply(null, l.map((x) => x.d)) : 0, tot: l.reduce((s, x) => s + x.d, 0), mas200: l.filter((x) => x.d > 200).length }; };
  const A = await abrir(Object.assign({ sesion: 'juan', datos: datos165(), espera: 5000, cel: true }, MOD)); const p = A.page;
  await A.ctx.grantPermissions(['geolocation', 'camera'], { origin: 'https://app.test' }); await A.ctx.setGeolocation({ latitude: -31.4273, longitude: -64.1889, accuracy: 8 });
  await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true}' }));
  const cdp = await A.ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  await p.waitForTimeout(4000);
  await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(1500);
  await medir(p, 'modo_obra', () => p.evaluate(() => window.__cuadrillaDia.ir('obra')));
  await medir(p, 'cartel_inicio', () => toca(p, '#cdApp [data-cd="boton"]'));
  if (ON) await medir(p, 'camara_abrir', () => toca(p, '#viOv [data-vi="iniciar"]'), 2500);
  else out.pasos.camara_abrir = out.pasos.cartel_inicio;
  await medir(p, 'foto', () => toca(p, '#emaCam [data-ec="disparar"]'), 3500);
  if (ON) {
    await medir(p, 'lista_columnas', () => p.evaluate(() => { const b = document.querySelector('#emaCam [data-vi="cols"]'); b && b.click(); }));
    await medir(p, 'termine', () => p.evaluate(() => { const v = document.getElementById('viCols'); v && v.remove(); document.querySelector('#emaCam [data-vi="termine"]').click(); }));
  }
  await A.ctx.close();
  const L = await abrir(Object.assign({ sesion: 'lucia', datos: datos165(), espera: 5000, cel: true, browser: A.browser }, MOD)); const o = L.page;
  const c2 = await L.ctx.newCDPSession(o); await c2.send('Emulation.setCPUThrottlingRate', { rate: RATE }); await o.waitForTimeout(4000);
  await medir(o, 'llenar_orden', async () => { await o.evaluate(() => { window.mostrarVista('parte'); window.irSubOrdenes('nueva'); }); await o.waitForTimeout(600); await o.evaluate(() => { try { window.__ordenNueva.elegirObra('p1'); } catch (e) { } }); }, 2500);
  await medir(o, 'tarea_con_columnas', () => o.evaluate(() => { const cb = document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]'); cb && cb.click(); }), 2500);
  if (ON) await medir(o, 'las_que_siguen', () => o.evaluate(() => { const b = document.querySelector('.cc-box[data-cck="montaje_prfv"] [data-cca="sigue"]'); b && b.click(); }));
  console.log(JSON.stringify(out));
  await A.browser.close();
})().catch((e) => { console.error(e); process.exit(2); });
