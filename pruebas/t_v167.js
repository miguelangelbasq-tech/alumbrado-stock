// v167 · Zoom en la cámara + galería: elegir varias, enviar varias, borrar.
// Juan (cuadrilla) siempre en el celu; la oficina (Lucía) en la compu o en el celu según el modo. También con REGLAS=1.
// Grupos (SOLO=0..9):
//  0) «muy alejada»: un celu con 2 cámaras traseras (la gran angular «camera2 2» primero en la lista, como la da el navegador
//     con «la de atrás») → la app se queda con la principal «camera2 0» y la recuerda (ANTES=1 contra la v166: nunca mira cuál
//     es, se queda con la gran angular y no hay zoom).
//  1) zoom del aparato (getCapabilities().zoom): 2× / 3× con applyConstraints, la foto entera (sin recorte), pellizco con dos
//     dedos (CDP touch).
//  2) zoom digital (sin zoom en el aparato): la imagen se agranda, la foto = lo que se ve (tamaño y centro: las franjas de
//     color de los bordes), la marca sobre lo visible, pellizco; los botones no tapan el disparador ni la fila para nombrar
//     (cámara de la barra y Modo obra); el zoom queda con la cámara tibia y vuelve a 1× con otra cámara.
//  3) cámara C (v165): los botones no tapan la píldora, el reloj, «Col ▾», «Terminé» ni las miniaturas.
//  4) tiempos (CPU ×6, toques reales): destello ≤ 100 ms de mediana y ninguno > 250 con 1×, 2× digital y 2× del aparato.
//  5) galería de la cuadrilla: «📷 Mis fotos» → «☑ Elegir» → todas → «📤 Enviar (3)» (navigator.share con 3 JPEG) → «🗑 Borrar
//     (2)» con «¿Borrar 2 fotos?» → quedan «borrada» en la orden; la de Pedro no («1 no es tuya»).
//  6) sacar 3 fotos con la cámara de la barra → caen en la orden y en el legajo → la última → «☑ Elegir» → Enviar las 3.
//  7) app de Android: «Enviar» por Share con 3 archivos en la caché.
//  8) oficina: legajo «☑ Elegir fotos» → «Enviar (2)» en la compu = ZIP; «Borrar (2)» → fotosBorradas; solo mirar: solo Enviar.
//  9) __v167No: todo como la v166.
process.env.CPU = process.env.CPU || '6';
const fs = require('fs');
const { abrir, prueba } = require('./h');
const { datos147, P } = require('./datos147');
const { datos152 } = require('./datos152');
const { datos165 } = require('./datos165');
const cel = process.argv[2] === 'cel';
const ANTES = !!process.env.ANTES;
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const JPG = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGPQiOrBihiGlgQAR05DgXjxIegAAAAASUVORK5CYII=';
// la cámara de mentira: 4 franjas verticales de color (rojo · verde · azul · amarillo) en 1920×1440, 2 traseras y 1 delantera
const camara = (cfg) => {
  cfg = cfg || {};
  window.__stubPorColeccion = true;   // como Firestore: cada escritura avisa solo a quien escucha esa colección (como t_v164)
  window.__gumN = 0; window.__gumMs = 300; window.__gumDev = []; window.__ac = []; window.__enumN = 0; window.__fotos = [];
  window.__zoomCaps = cfg.zoom || null;
  window.__T5 = []; window.__LT5 = []; window.__camLT5 = false;
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (window.__camLT5) window.__LT5.push(Math.round(e.duration)); })).observe({ entryTypes: ['longtask'] }); } catch (e) { }
  document.addEventListener('pointerdown', (e) => { const b = e.target && e.target.closest && e.target.closest('#emaCam [data-ec="disparar"]'); if (b) window.__T5.push({ pd: e.timeStamp }); }, true);
  const an = Element.prototype.animate; Element.prototype.animate = function () { if (this.id === 'ecFlash') { const x = window.__T5[window.__T5.length - 1]; if (x && !x.f) requestAnimationFrame((ts) => { if (!x.f) x.f = ts; }); } return an.apply(this, arguments); };
  const CAMS = cfg.unaSola ? [{ id: 'main', label: 'camera2 0, facing back' }, { id: 'front', label: 'camera2 1, facing front' }] : [{ id: 'ultra', label: 'camera2 2, facing back' }, { id: 'main', label: 'camera2 0, facing back' }, { id: 'front', label: 'camera2 1, facing front' }];
  const dib = (c, dev) => { const x = c.getContext('2d'); ['#ff0000', '#00ff00', '#0000ff', '#ffff00'].forEach((col, i) => { x.fillStyle = col; x.fillRect(i * 480, 0, 480, 1440); }); x.fillStyle = dev === 'ultra' ? '#000000' : '#ffffff'; x.fillRect(940, 700, 40, 40); };
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.enumerateDevices = async () => { window.__enumN++; return CAMS.map((d) => ({ kind: 'videoinput', deviceId: d.id, label: d.label, groupId: 'g' + d.id, toJSON() { return this; } })); };
  navigator.mediaDevices.getUserMedia = async (k) => {
    window.__gumN++; window.__gumK = JSON.stringify(k);
    if (window.__gumNunca) return new Promise(() => { });
    await new Promise((r) => setTimeout(r, window.__gumMs));
    const v = (k && k.video) || {}; let dev = null;
    if (v.deviceId && v.deviceId.exact) { dev = CAMS.find((d) => d.id === v.deviceId.exact); if (!dev) { const er = new Error('Overconstrained'); er.name = 'OverconstrainedError'; throw er; } }
    else { const f = (v.facingMode && (v.facingMode.ideal || v.facingMode.exact || v.facingMode)) || 'environment'; dev = CAMS.find((d) => (f === 'user' ? /front/ : /back/).test(d.label)); }
    window.__gumDev.push(dev.id);
    const c = document.createElement('canvas'); c.width = 1920; c.height = 1440; dib(c, dev.id); setInterval(() => { if (!window.__gumQuieto) dib(c, dev.id); }, 250);
    const st = c.captureStream(8), t = st.getVideoTracks()[0];
    t.getCapabilities = () => (window.__zoomCaps ? { zoom: window.__zoomCaps } : {});
    t.applyConstraints = async (x) => { window.__ac.push(JSON.stringify(x)); };
    t.getSettings = () => ({ deviceId: dev.id, width: 1920, height: 1440 });
    return st;
  };
  // la foto que sale (sin el sello): tamaño y el color de los bordes izquierdo y derecho, a media altura
  document.addEventListener('change', (e) => {
    const i = e.target; if (!i || i.type !== 'file' || !i.files || !i.files[0]) return;
    if (cfg.sinMirar) { window.__fotos.push({ w: 1 }); return; }   // las medidas de tiempo, sin decodificar la foto en la página
    const f = i.files[0]; const r = { w: 0, h: 0, L: '', R: '', C: '' }; window.__fotos.push(r);
    createImageBitmap(f).then((b) => { const c = document.createElement('canvas'); c.width = b.width; c.height = b.height; const x = c.getContext('2d'); x.drawImage(b, 0, 0); const col = (px) => { const d = x.getImageData(px, Math.round(b.height / 2) - 60, 1, 1).data; return d[0] > 150 && d[1] > 150 ? 'Y' : d[0] > 150 ? 'R' : d[1] > 150 ? 'G' : d[2] > 150 ? 'B' : '?'; }; r.w = b.width; r.h = b.height; r.L = col(3); r.R = col(b.width - 4); }).catch(() => { r.err = 1; });
  }, true);
  // compartir del celu (Chrome): lo que se manda
  window.__shared = [];
  if (cfg.share) { navigator.canShare = () => true; navigator.share = async (d) => { window.__shared.push({ n: (d.files || []).length, tipos: (d.files || []).map((f) => f.type), kb: (d.files || []).map((f) => f.size), text: d.text || '' }); }; }
  if (cfg.apk) {
    window.__apk = [];
    window.Capacitor = { isNativePlatform: () => true, convertFileSrc: (u) => u, Plugins: {
      Share: { share: async (o) => { window.__apk.push(o); return {}; } },
      Filesystem: { writeFile: async (o) => ({ uri: 'file:///cache/' + o.path }) } } };
  }
};
(async () => {
  const c = prueba('v167' + (ANTES ? ' antes' : '') + (cel ? ' cel' : ''));
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, obraGps: true, camaraB: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v167: true, mov: true, reglas: !!process.env.REGLAS };
  const foto = async (p, n) => { if (!CAP) return; fs.mkdirSync(CAP, { recursive: true }); await p.waitForTimeout(400); await p.screenshot({ path: CAP + '/' + n + '.png' }); };
  const tx = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const ver = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.hidden && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none'; }, s);
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|internetdisconnected|prueba|sin permiso|Sin permiso/i.test(e));
  const rutaFotos = (A) => A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { if (rq.request().method() === 'GET' && /\/f\//.test(rq.request().url())) return rq.fulfill({ status: 200, contentType: 'image/jpeg', headers: { 'access-control-allow-origin': '*' }, body: JPG }); await new Promise((r) => setTimeout(r, 300)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }).catch(() => { }); });
  // Juan en el celu con la cámara de mentira (datos147: BULEVARES, ot1 de hoy)
  const juan = async (cfg, op, datos) => {
    const A = await abrir(Object.assign({ datos: datos || datos147(), sesion: 'juan', cel: true, dpr: 2, espera: 6000, antes: camara, antesArg: cfg || {} }, MOD, op || {}));
    const p = A.page; A.p = p; A.ev = (f, a) => p.evaluate(f, a);
    p.on('dialog', (x) => x.accept());
    await rutaFotos(A);
    await A.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' });
    await A.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 8 });
    A.esperar = (fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 30000, polling: 80 }).then(() => true, () => false);
    A.camLista = () => A.esperar(() => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0 && v.readyState >= 2; });
    A.camB = async () => { await A.ev(() => { const b = document.querySelector('#navN1 [data-n1="camara"]'); if (b) b.click(); else document.getElementById('menuCamara').click(); }); await A.camLista(); await A.esperar(() => !!document.getElementById('cbPill'), null, 15000); await p.waitForTimeout(900); };
    A.disparo = async () => { const n = await A.ev(() => window.__fotos.length); await p.tap('#emaCam [data-ec="disparar"]'); await A.esperar((k) => window.__fotos.length > k && window.__fotos[window.__fotos.length - 1].w > 0, n, 15000); return A.ev(() => window.__fotos[window.__fotos.length - 1]); };
    return A;
  };
  const rect = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e || e.hidden || getComputedStyle(e).display === 'none' || getComputedStyle(e).visibility === 'hidden') return null; const r = e.getBoundingClientRect(); return r.width && r.height ? { x: r.left, y: r.top, w: r.width, h: r.height } : null; }, s);
  const choca = (a, b) => !!(a && b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h);
  const sinTapar = async (p, sels) => { const z = await rect(p, '#zmBar'); const out = []; for (const s of sels) { const r = await rect(p, s); if (choca(z, r)) out.push(s); } return { z, out }; };
  // lo que tiene que salir con zoom digital d (misma cuenta, aparte): franjas de los bordes y proporción
  const esperado = (p) => p.evaluate(() => { const v = document.getElementById('ecVideo'), W = v.clientWidth, H = v.clientHeight, vw = v.videoWidth, vh = v.videoHeight, d = window.__zoomCam.digital(), kc = Math.min(W / vw, H / vh) * d; const sw = Math.min(vw, W / kc), sh = Math.min(vh, H / kc), sx = (vw - sw) / 2; const band = (x) => 'RGBY'[Math.max(0, Math.min(3, Math.floor(x / 480)))]; return { ratio: sw / sh, L: band(sx + 3), R: band(sx + sw - 4), sw: Math.round(sw), sh: Math.round(sh) }; });
  const pellizco = async (A, desde, hasta) => {
    const cdp = await A.ctx.newCDPSession(A.p); const vp = A.p.viewportSize(); const cx = Math.round(vp.width * 0.42), cy = Math.round(vp.height * 0.36);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx - desde, y: cy, id: 1 }, { x: cx + desde, y: cy, id: 2 }] });
    for (let i = 1; i <= 8; i++) { const d = desde + (hasta - desde) * i / 8; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }] }); await A.p.waitForTimeout(40); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await A.p.waitForTimeout(300);
  };

  // ================================================================= 0) «muy alejada»: qué cámara de atrás usa
  if (SOLO(0)) {
    console.log('— 0 · qué cámara trasera usa (2 traseras: la gran angular primero)');
    const A = await juan({});
    await A.camB();
    await A.p.waitForTimeout(1500);
    const s = await A.ev(() => ({ dev: window.__gumDev.slice(), enumN: window.__enumN, bar: !!document.getElementById('zmBar'), p: (() => { try { return JSON.parse(localStorage.getItem('ema.cam.principal') || 'null'); } catch (e) { return null; } })(), k: window.__gumK }));
    console.log('    cámaras pedidas: ' + s.dev.join(' → ') + ' · enumerateDevices: ' + s.enumN + ' · último pedido: ' + s.k);
    if (ANTES) {
      c(s.dev[s.dev.length - 1] === 'ultra' && s.enumN === 0, 'ANTES (v166): pide solo «la de atrás» y se queda con la que da el navegador (la gran angular): ' + s.dev.join(' → '));
      c(!s.bar, 'ANTES (v166): la cámara no tiene zoom (ni botones ni pellizco)');
      await A.browser.close();
    } else {
      c(s.dev[s.dev.length - 1] === 'main' && s.enumN >= 1, 'la cámara de la app se queda con la principal de atrás («camera2 0»), no la gran angular: ' + s.dev.join(' → '));
      c(s.p && s.p.id === 'main' && /camera2 0/.test(s.p.label), 'queda anotada en el celu (ema.cam.principal) · ' + JSON.stringify(s.p));
      c(s.bar && (await ver(A.p, '#zmBar [data-zm="2"]')), 'botones de zoom 1× 2× 3× en la cámara');
      await foto(A.p, '0_camara_1x');
      // la segunda vez abre directo la principal (un solo pedido, con deviceId)
      await A.ev(() => window.camaraApp.cerrar()); await A.p.waitForTimeout(400);
      await A.ev(() => { window.__gumDev = []; window.__camTibiaMs = 1; }); await A.p.waitForTimeout(300);
      await A.camB(); await A.p.waitForTimeout(800);
      const s2 = await A.ev(() => ({ dev: window.__gumDev.slice(), k: window.__gumK }));
      c(s2.dev.length === 1 && s2.dev[0] === 'main' && /"exact":"main"/.test(s2.k), 'la vez siguiente pide directo la principal (un solo pedido): ' + s2.dev.join(' → '));
      // si la anotada desaparece (otro celu / se desconectó), vuelve a «la de atrás» sin trabarse
      await A.ev(() => { window.camaraApp.cerrar(); localStorage.setItem('ema.cam.principal', JSON.stringify({ id: 'vieja', label: 'x' })); window.__gumDev = []; }); await A.p.waitForTimeout(300);
      await A.camB(); await A.p.waitForTimeout(800);
      const s3 = await A.ev(() => ({ dev: window.__gumDev.slice(), v: document.getElementById('ecVideo').videoWidth }));
      c(s3.v > 0 && s3.dev.indexOf('main') >= 0, 'si la anotada no abre, vuelve a «la de atrás» y la cámara anda igual: ' + s3.dev.join(' → '));
      c(errsJs(A).length === 0, 'sin errores (' + errsJs(A).slice(0, 2).join(' | ') + ')');
      await A.browser.close();
    }
  }
  if (ANTES) { process.exit(c.fin() ? 1 : 0); }

  // ================================================================= 1) zoom del aparato
  if (SOLO(1)) {
    console.log('— 1 · zoom del aparato (getCapabilities().zoom 1–8)');
    const A = await juan({ zoom: { min: 1, max: 8, step: 0.1 }, unaSola: true });
    await A.camB();
    c((await A.ev(() => window.__zoomCam.hw())) && (await A.ev(() => window.__zoomCam.hw().max)) === 8, 'lee el zoom del aparato (1× a 8×)');
    const f1 = await A.disparo();
    await A.p.tap('#zmBar [data-zm="2"]'); await A.p.waitForTimeout(500);
    const z2 = await A.ev(() => ({ ac: window.__ac.slice(), tr: document.getElementById('ecVideo').style.transform, on: document.querySelector('#zmBar [data-zm="2"]').classList.contains('on') }));
    c(z2.ac.some((x) => /"zoom":2/.test(x)) && !z2.tr && z2.on, '«2×»: applyConstraints({advanced:[{zoom:2}]}), sin agrandar la imagen en la pantalla · ' + z2.ac.slice(-1)[0]);
    const f2 = await A.disparo();
    c(f2.w === f1.w && f2.h === f1.h && f2.w === 1024, 'con el zoom del aparato la foto sale entera (' + f2.w + '×' + f2.h + ', el aparato ya acercó)');
    await A.p.tap('#zmBar [data-zm="3"]'); await A.p.waitForTimeout(400);
    c((await A.ev(() => window.__ac.slice(-1)[0])).indexOf('"zoom":3') >= 0, '«3×» → zoom 3');
    await A.p.tap('#zmBar [data-zm="1"]'); await A.p.waitForTimeout(400);
    await pellizco(A, 40, 110);
    const zp = await A.ev(() => ({ z: window.__zoomCam.zoom(), ac: window.__ac.slice(-1)[0] }));
    c(zp.z > 2 && zp.z < 3.2 && /"zoom":(2|3)/.test(zp.ac), 'pellizco con dos dedos (de 80 a 220 px) → zoom ' + zp.z.toFixed(2) + ' del aparato');
    c(await ver(A.p, '#zmVal'), 'muestra el valor («' + (await tx(A.p, '#zmVal')) + '») cuando no es 1× / 2× / 3×');
    c(errsJs(A).length === 0, 'sin errores (' + errsJs(A).slice(0, 2).join(' | ') + ')');
    await A.browser.close();
  }

  // ================================================================= 2) zoom digital: la foto = lo que se ve
  if (SOLO(2)) {
    console.log('— 2 · zoom digital (el aparato no tiene zoom)');
    const A = await juan({ unaSola: true });
    // Modo obra: la ráfaga con zoom, y nada tapado
    await A.ev(() => window.__cuadrillaDia.ir('obra')); await A.p.waitForTimeout(2500);
    console.log('    Modo obra: ' + (await tx(A.p, '#cdApp [data-cd="boton"]')));
    await A.p.tap('#cdApp [data-cd="boton"]'); await A.camLista(); await A.esperar(() => !!document.getElementById('zmBar'), null, 8000); await A.p.waitForTimeout(900);
    if (!(await A.ev(() => !!document.getElementById('zmBar')))) { console.log('    sin zmBar: ' + JSON.stringify(await A.ev(() => ({ cam: !!document.getElementById('emaCam'), cl: (document.getElementById('emaCam') || {}).className, ovs: [...document.querySelectorAll('.v7-ov, [role=dialog]')].map((x) => x.id || x.className) })))); await foto(A.p, 'dbg_modo_obra'); }
    const t2 = await sinTapar(A.p, ['#emaCam [data-ec="disparar"]', '#fnFila', '#emaCam [data-fn="listo"]', '#emaCam .ec-arriba', '#ecMarca']);
    c(t2.z && !t2.out.length, 'Modo obra: los botones no tapan el disparador, la fila para nombrar ni «Listo»' + (t2.out.length ? ' · tapa ' + t2.out.join(', ') : ''));
    await A.p.tap('#zmBar [data-zm="2"]'); await A.p.waitForTimeout(300);
    await foto(A.p, '2_modo_obra_2x');
    const e4 = await esperado(A.p), f4 = await A.disparo();
    c(Math.abs(f4.w / f4.h - e4.ratio) < 0.02 && (await A.ev(() => !!document.getElementById('emaCam'))), 'Modo obra (ráfaga) con 2×: la foto = lo que se ve y la cámara sigue abierta (' + f4.w + '×' + f4.h + ')');
    await A.p.tap('#zmBar [data-zm="1"]'); await A.p.waitForTimeout(300);
    await A.ev(() => document.querySelector('#emaCam [data-fn="listo"]').click()); await A.p.waitForTimeout(1500);
    await A.ev(() => { const h = document.querySelector('#cdHoja [data-cdh="x"]'); h && h.click(); window.camaraApp.cerrar(); }); await A.p.waitForTimeout(800);
    await A.camB();
    c(!(await A.ev(() => window.__zoomCam.hw())), 'el aparato no ofrece zoom → digital');
    const f1 = await A.disparo();
    c(f1.w === 1024 && f1.h === 768 && f1.L === 'R' && f1.R === 'Y', '1×: la foto entera (1024×768, del rojo al amarillo) · ' + JSON.stringify(f1));
    await A.p.tap('#zmBar [data-zm="2"]'); await A.p.waitForTimeout(500);
    const tr = await A.ev(() => document.getElementById('ecVideo').style.transform);
    c(/scale\(2/.test(tr), '«2×»: la imagen se agranda en la pantalla (' + tr + ')');
    await foto(A.p, '2_camara_2x');
    const e2 = await esperado(A.p), f2 = await A.disparo();
    c(Math.abs(f2.w / f2.h - e2.ratio) < 0.02 && f2.L === e2.L && f2.R === e2.R && Math.max(f2.w, f2.h) <= 1024, '2×: la foto = lo que se ve (' + f2.w + '×' + f2.h + ', bordes ' + f2.L + '…' + f2.R + '; se ve ' + e2.sw + '×' + e2.sh + ' del video, ' + e2.L + '…' + e2.R + ')');
    const mk = await A.ev(() => { const m = document.getElementById('ecMarca').getBoundingClientRect(), v = window.__zoomCam.vis(); return { m: { x: m.left, b: m.bottom }, v }; });
    c(mk.v && mk.m.x >= mk.v.x - 1 && mk.m.b <= mk.v.y + mk.v.h + 1, 'la marca en vivo queda sobre lo que se ve (= la foto)');
    await A.p.tap('#zmBar [data-zm="3"]'); await A.p.waitForTimeout(400);
    const e3 = await esperado(A.p), f3 = await A.disparo();
    c(Math.abs(f3.w / f3.h - e3.ratio) < 0.02 && f3.L === e3.L && f3.R === e3.R, '3×: también (' + f3.w + '×' + f3.h + ', ' + f3.L + '…' + f3.R + ')');
    // los botones no tapan nada (cámara de la barra: fila para nombrar, disparador, «Listo», la píldora)
    const t1 = await sinTapar(A.p, ['#emaCam [data-ec="disparar"]', '#fnFila', '#cbPanel', '#cbPill', '#emaCam .ec-ult', '#emaCam .ec-borrar-ult', '#ecMarca', '#emaCam .ec-arriba']);
    c(t1.z && t1.z.w >= 44 && !t1.out.length, 'cámara de la barra: los botones de zoom (44 px) no tapan el disparador, la fila para nombrar ni la píldora' + (t1.out.length ? ' · tapa ' + t1.out.join(', ') : ''));
    await A.p.tap('#zmBar [data-zm="1"]'); await A.p.waitForTimeout(300);
    await pellizco(A, 40, 110);
    const zp = await A.ev(() => ({ z: window.__zoomCam.zoom(), tr: document.getElementById('ecVideo').style.transform }));
    c(zp.z > 2 && /scale\(2/.test(zp.tr), 'pellizco: zoom ' + zp.z.toFixed(2) + ' (' + zp.tr + ')');
    const ep = await esperado(A.p), fp = await A.disparo();
    c(Math.abs(fp.w / fp.h - ep.ratio) < 0.02, 'con el pellizco la foto también = lo que se ve (' + fp.w + '×' + fp.h + ')');
    // cerrar (queda tibia) y volver: el zoom sigue; otra cámara (girar) vuelve a 1×
    await A.ev(() => window.camaraApp.cerrar(true)); await A.p.waitForTimeout(300);
    await A.camB(); await A.p.waitForTimeout(500);
    c(Math.abs((await A.ev(() => window.__zoomCam.zoom())) - zp.z) < 0.01, 'con la cámara tibia el zoom sigue (' + (await A.ev(() => window.__zoomCam.zoom())).toFixed(2) + ')');
    await A.ev(() => window.camaraApp.cerrar()); await A.p.waitForTimeout(300);
    await A.camB(); await A.p.waitForTimeout(500);
    c((await A.ev(() => window.__zoomCam.zoom())) === 1 && !(await A.ev(() => document.getElementById('ecVideo').style.transform)), 'cerrada del todo, vuelve a 1×');
    await A.ev(() => window.camaraApp.cerrar());
    c(errsJs(A).length === 0, 'sin errores (' + errsJs(A).slice(0, 2).join(' | ') + ')');
    await A.browser.close();
  }

  // ================================================================= 3) cámara C (v165): nada tapado
  if (SOLO(3)) {
    console.log('— 3 · cámara C (v165)');
    const A = await juan({ unaSola: true }, { v165: true, v166: true }, datos165());
    await A.ctx.setGeolocation({ latitude: -31.4273, longitude: -64.1889, accuracy: 8 });
    await A.ev(() => window.__cuadrillaDia.ir('obra')); await A.p.waitForTimeout(1200);
    await A.p.tap('#cdApp [data-cd="boton"]'); await A.p.waitForTimeout(800);
    await A.p.tap('#viOv [data-vi="iniciar"]'); await A.camLista(); await A.p.waitForTimeout(1500);
    const vi = await A.ev(() => !!document.querySelector('#emaCam.vi-on'));
    const t = await sinTapar(A.p, ['#viPill', '#viReloj', '.vi-reloj', '#viColB', '.vi-colb', '#fnFila', '.vi-term', '#viThumbs', '.vi-thumbs', '#viCamPie', '#emaCam [data-ec="disparar"]']);
    c(vi && t.z && !t.out.length, 'cámara C: los botones de zoom no tapan la píldora, el reloj, «Col ▾», «Terminé», las miniaturas ni el disparador' + (t.out.length ? ' · tapa ' + t.out.join(', ') : ''));
    await foto(A.p, '3_camara_c');
    await A.p.tap('#zmBar [data-zm="2"]'); await A.p.waitForTimeout(300);
    const e = await esperado(A.p), f = await A.disparo();
    c(Math.abs(f.w / f.h - e.ratio) < 0.02, 'cámara C con 2×: la foto = lo que se ve (' + f.w + '×' + f.h + ')');
    c(errsJs(A).length === 0, 'sin errores (' + errsJs(A).slice(0, 2).join(' | ') + ')');
    await A.browser.close();
  }

  // ================================================================= 4) tiempos (toques reales, CPU ×6)
  if (SOLO(4)) {
    console.log('— 4 · destello con y sin zoom (toques reales, CPU ×' + process.env.CPU + ')');
    const medir = async (cfg, z, nombre, barra) => {
      const A = await juan(cfg); const p = A.p;
      const cdp = await A.ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +process.env.CPU });
      const caja = async (s) => { const b = await p.locator(s).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
      if (barra) await A.camB();
      else { await A.ev(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(3500); const b = await caja('#cdApp [data-cd="boton"]'); await p.touchscreen.tap(b.x, b.y); await A.camLista(); await p.waitForTimeout(900); }
      if (z > 1) { const b = await caja('#zmBar [data-zm="' + z + '"]'); await p.touchscreen.tap(b.x, b.y); await p.waitForTimeout(600); }
      await A.ev(() => { window.__T5 = []; window.__LT5 = []; window.__camLT5 = true; window.__gumQuieto = true; });
      const d = await caja('#emaCam [data-ec="disparar"]');
      for (let i = 0; i < 5; i++) { await p.touchscreen.tap(d.x, d.y); await p.waitForTimeout(1000); }
      await p.waitForTimeout(2500);
      const T = await A.ev(() => window.__T5), LT = await A.ev(() => window.__LT5), zz = await A.ev(() => ({ z: window.__zoomCam.zoom(), dg: window.__zoomCam.digital(), n: window.__fotos.length, w: (window.__fotos[window.__fotos.length - 1] || {}).w }));
      const ms = T.map((x) => (x.f ? Math.round(x.f - x.pd) : 9999)), ord = ms.slice().sort((a, b) => a - b), med = ord[Math.floor(ord.length / 2)];
      console.log('    ' + nombre + ' (zoom ' + zz.z + ', digital ' + zz.dg + '): toque → destello ' + ms.join(' · ') + ' ms (mediana ' + med + ') · tareas largas: ' + LT.length + ' (la más larga ' + Math.max(0, ...LT) + ' ms) · fotos ' + zz.n);
      c(T.length === 5 && med <= 100 && Math.max(...ms) <= 250, nombre + ': destello ≤ 100 ms (mediana ' + med + ') y ninguno > 250 (' + Math.max(...ms) + ')');
      c(LT.filter((x) => x > 300).length === 0, nombre + ': ninguna tarea larga > 300 ms con la cámara abierta (la más larga ' + Math.max(0, ...LT) + '; en esta máquina la v166 da 140–420 en t_v164 grupo 5)');
      c(zz.n >= 5, nombre + ': las 5 fotos salieron (' + zz.n + ')');
      await A.browser.close();
      return med;
    };
    const m1 = await medir({ unaSola: true, sinMirar: true }, 1, 'Modo obra 1×');
    const m2 = await medir({ unaSola: true, sinMirar: true }, 2, 'Modo obra 2× digital');
    const m3 = await medir({ unaSola: true, sinMirar: true, zoom: { min: 1, max: 8, step: 0.1 } }, 2, 'Modo obra 2× del aparato');
    const m4 = await medir({ unaSola: true, sinMirar: true }, 1, 'Cámara de la barra 1×', true);
    const m5 = await medir({ unaSola: true, sinMirar: true }, 2, 'Cámara de la barra 2× digital', true);
    console.log('    medianas: Modo obra 1× ' + m1 + ' ms · 2× digital ' + m2 + ' ms · 2× aparato ' + m3 + ' ms · cámara de la barra 1× ' + m4 + ' ms · 2× digital ' + m5 + ' ms');
  }

  // ================================================================= 5) galería de la cuadrilla: Mis fotos → Elegir → Enviar → Borrar
  const datosG = () => {
    const d = datos152(), h = d.db.ordenesTrabajo.h130, ahora = Date.now();
    const f = (por, num, t) => ({ k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', cat: 'columna', num, por, ts: t, mini: PNG });
    Object.assign(h.campo.fotos, { hf2: f('Juan Pérez', 'Col 2', ahora - 8e5), hf3: f('Juan Pérez', 'Col 3', ahora - 7e5), hp1: f('Pedro Gómez', 'Col 4', ahora - 6e5) });
    ['hf2', 'hf3', 'hp1'].forEach((id, i) => { d.db.fotosObra['fo' + id] = { adjId: id, plazaId: 'p1', plazaNombre: 'PLAZA LOS ÁLAMOS', otId: 'h130', otNumero: 'OT-2026-130', k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', cat: 'columna', num: 'Col ' + (i + 2), mini: PNG, por: i === 2 ? 'Pedro Gómez' : 'Juan Pérez', usuario: (i === 2 ? 'pedro@' : 'juan@') + require('./h').DOM, origen: 'cuadrilla', ts: ahora - 8e5 + i * 1e5, fecha: d.hoy }; d.db.adjuntos[id] = { tipo: 'obra', plazaId: 'p1', plazaNombre: 'PLAZA LOS ÁLAMOS', otId: 'h130', cat: 'columna', num: 'Col ' + (i + 2), dataUrl: PNG, w: 8, h: 8, bytes: 80, ts: ahora }; });
    return d;
  };
  const gal = async (quien, cfg, op) => {
    const A = await abrir(Object.assign({ datos: datosG(), sesion: quien, cel: quien === 'juan' || quien === 'pedro' ? true : cel, espera: 5000, antes: camara, antesArg: cfg || {} }, MOD, op || {}));
    A.p = A.page; A.ev = (f, a) => A.page.evaluate(f, a); A.page.on('dialog', (x) => x.accept()); await rutaFotos(A); await A.page.waitForTimeout(1200); return A;
  };
  const misFotos = async (A, id) => { await A.ev((id) => { const b = document.createElement('button'); b.dataset.misfotos = id; b.style.display = 'none'; document.body.appendChild(b); b.click(); b.remove(); }, id); await A.p.waitForTimeout(900); };
  const elegirEnVisor = async (A) => { await A.p.click('#gpVisor [data-gp="elegir"]'); await A.p.waitForTimeout(500); };
  if (SOLO(5)) {
    console.log('— 5 · galería de la cuadrilla (Juan)');
    const A = await gal('juan', { share: true }), p = A.p;
    await misFotos(A, 'h130');
    c(await ver(p, '#gpVisor [data-gp="elegir"]'), '«📷 Mis fotos» abre la galería con «☑ Elegir»');
    await elegirEnVisor(A);
    const h = await A.ev(() => { const v = document.getElementById('zgOv'); return v ? { dlg: v.getAttribute('role') === 'dialog' && v.classList.contains('v7-ov') && !!v.querySelector('[aria-label="Cerrar"]'), n: v.querySelectorAll('[data-zgf]').length, on: v.querySelectorAll('[data-zgf].on').length, st: !!v.querySelector('[role="status"]') } : null; });
    c(h && h.dlg && h.n === 3 && h.on === 1 && h.st, 'hoja «☑ Elegir fotos» (.v7-ov, role=dialog, ✕) con sus 3 fotos y la que estaba mirando ya elegida · ' + JSON.stringify(h));
    await p.click('#zgOv [data-zg="todas"]'); await p.waitForTimeout(200);
    c(/3 elegidas de 3/.test(await tx(p, '#zgN')) && /Enviar \(3\)/.test(await tx(p, '#zgOv [data-zg="enviar"]')) && /Borrar \(3\)/.test(await tx(p, '#zgOv [data-zg="borrar"]')), '«Elegir todas»: «3 elegidas de 3», «📤 Enviar (3)», «🗑 Borrar (3)»');
    await foto(p, '5_elegir_' + (cel ? 'cel' : 'pc'));
    c((await ver(p, '#zgOv [data-zg="mover"]')) === (await A.ev(() => ['hf1', 'hf2', 'hf3'].every((i) => window.__moverFoto.puedeVer(i)))), '«↔ Mover» con las reglas de la v152 (la cuadrilla, solo sus fotos de su orden)');
    await p.click('#zgOv [data-zg="ninguna"]'); await p.waitForTimeout(150);
    c(/Tocá las fotos/.test(await tx(p, '#zgN')) && (await p.evaluate(() => document.querySelector('#zgOv [data-zg="enviar"]').disabled)), '«Ninguna» saca todas');
    await p.click('#zgOv [data-zg="todas"]'); await p.waitForTimeout(150);
    await p.click('#zgOv [data-zg="enviar"]');
    const okS = await p.waitForFunction(() => window.__shared.length > 0, null, { timeout: 15000 }).then(() => true, () => false);
    const sh = await A.ev(() => window.__shared[0]);
    c(okS && sh.n === 3 && sh.tipos.every((t) => /^image\//.test(t)), '«📤 Enviar (3)»: el menú del celu con las 3 fotos de una (navigator.share) · ' + JSON.stringify(sh));
    // borrar 2
    await p.click('#zgOv [data-zg="ninguna"]'); await p.waitForTimeout(100);
    await p.click('#zgOv [data-zgf^="hf2"]'); await p.click('#zgOv [data-zgf^="hf3"]'); await p.waitForTimeout(150);
    await p.click('#zgOv [data-zg="borrar"]'); await p.waitForTimeout(300);
    const cf = await A.ev(() => { const v = document.getElementById('zgConf'); return v ? { t: v.textContent.replace(/\s+/g, ' '), dlg: v.getAttribute('role') === 'dialog' && !!v.querySelector('[aria-label="Cerrar"]') } : null; });
    c(cf && cf.dlg && /¿Borrar 2 fotos\?/.test(cf.t), 'pide «¿Borrar 2 fotos?» (ventana propia con ✕, no confirm) · ' + (cf && cf.t.slice(0, 90)));
    await foto(p, '5_borrar_' + (cel ? 'cel' : 'pc'));
    await p.click('#zgConf [data-zgc="si"]');
    const okB = await p.waitForFunction(() => { const o = (ordenesTrabajo || []).find((x) => x.id === 'h130'); const f = o && o.campo && o.campo.fotos; return f && f.hf2 && f.hf2.borrada && f.hf3 && f.hf3.borrada; }, null, { timeout: 15000 }).then(() => true, () => false);
    const db = await A.ev(() => { const o = window.__stubDB().ordenesTrabajo.h130.campo.fotos; return { hf1: !!o.hf1.borrada, hf2: !!(o.hf2 && o.hf2.borrada), hf3: !!(o.hf3 && o.hf3.borrada), hp1: !!o.hp1.borrada }; });
    c(okB && db.hf2 && db.hf3 && !db.hf1 && !db.hp1, 'se borraron las 2 (quedan «borrada» en la orden, como «🗑 La última»); las otras quedan · ' + JSON.stringify(db));
    c((await A.ev(() => document.querySelectorAll('#zgOv [data-zgf]').length)) === 1, 'la hoja queda con la que sigue');
    await p.click('#zgOv [data-zg="x"]'); await p.waitForTimeout(300);
    // con la de Pedro: no la puede borrar
    await A.ev(() => window.emaGaleria.abrir([{ id: 'hf1', mini: '' }, { id: 'hp1', mini: '' }], 1)); await p.waitForTimeout(600);
    await elegirEnVisor(A);
    await p.click('#zgOv [data-zg="todas"]'); await p.waitForTimeout(200);
    const bp = await A.ev(() => ({ b: document.querySelector('#zgOv [data-zg="borrar"]').textContent, nota: (document.getElementById('zgNota') || {}).textContent || '' }));
    c(/Borrar \(1\)/.test(bp.b) && /1 no es tuya/.test(bp.nota), 'con una de Pedro: «🗑 Borrar (1)» y «1 no es tuya» · ' + bp.b + ' · ' + bp.nota);
    await p.click('#zgOv [data-zgf^="hf1"]'); await p.waitForTimeout(150);
    c(await p.evaluate(() => document.querySelector('#zgOv [data-zg="borrar"]').disabled), 'solo la de Pedro elegida: «Borrar» apagado');
    await p.click('#zgOv [data-zg="x"]');
    // barra de Mis tareas (elegir en la página): «Enviar (N)» y «Borrar (N)» también para la cuadrilla
    const okBar = await A.ev(async () => { const d = document.createElement('div'); d.dataset.gpset = 'prueba'; d.innerHTML = '<img data-gpid="hf1" src="" alt="Col 1"><img data-gpid="hp1" src="" alt="Col 4">'; document.body.appendChild(d); d.querySelector('img').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await new Promise((r) => setTimeout(r, 600)); d.querySelector('img').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); await new Promise((r) => setTimeout(r, 300)); const b = document.getElementById('gpBarra'); return b ? b.textContent.replace(/\s+/g, ' ') : ''; });
    c(/Enviar \(1\)/.test(okBar) && /Borrar \(1\)/.test(okBar), 'la barra de elegir (mantener apretada) también dice «Enviar (1)» y «Borrar (1)» para la cuadrilla · ' + okBar.slice(0, 80));
    c(errsJs(A).length === 0, 'sin errores (' + errsJs(A).slice(0, 2).join(' | ') + ')');
    await A.browser.close();
  }

  // ================================================================= 6) sacar 3 → caen solas → la última → Elegir → Enviar
  if (SOLO(6)) {
    console.log('— 6 · «cuando sacás varias fotos» (cámara de la barra)');
    const A = await juan({ unaSola: true, share: true }), p = A.p;
    const k0 = await A.ev(() => Object.keys(((window.__stubDB().ordenesTrabajo.ot1 || {}).campo || {}).fotos || {}));
    await A.camB();
    await A.p.tap('#zmBar [data-zm="2"]'); await p.waitForTimeout(300);
    for (let i = 0; i < 3; i++) { await A.disparo(); await p.waitForTimeout(500); }
    const ok = await A.esperar((k) => { const d = window.__stubDB(), f = ((d.ordenesTrabajo.ot1 || {}).campo || {}).fotos || {}, nv = Object.keys(f).filter((x) => k.indexOf(x) < 0); return nv.length >= 3 && nv.every((x) => Object.values(d.fotosObra || {}).some((o) => o.adjId === x && o.plazaId)); }, k0, 60000);
    c(ok, 'las 3 fotos caen solas en la orden y en el legajo de la obra (fotosObra con su obra)');
    await A.esperar(() => (window.__camSesion || []).filter((x) => x.id).length >= 3, null, 30000);
    await p.tap('#emaCam [data-ec="ultima"]'); await p.waitForTimeout(700);
    c(await ver(p, '#gpVisor [data-gp="elegir"]'), 'la última foto (abajo a la izquierda) abre la galería con «☑ Elegir»');
    await elegirEnVisor(A);
    await p.click('#zgOv [data-zg="todas"]'); await p.waitForTimeout(200);
    await foto(p, '6_elegir_camara');
    await p.click('#zgOv [data-zg="enviar"]');
    const okS = await p.waitForFunction(() => window.__shared.length > 0, null, { timeout: 20000 }).then(() => true, () => false);
    const sh = await A.ev(() => window.__shared[0]);
    c(okS && sh && sh.n === 3 && sh.tipos.every((t) => /jpe?g/.test(t)), '«📤 Enviar (3)» desde la cámara: 3 JPEG · ' + JSON.stringify(sh));
    c((await A.ev(() => !!document.getElementById('emaCam'))), 'la cámara sigue abierta debajo (al cerrar la hoja se sigue sacando)');
    c(errsJs(A).length === 0, 'sin errores (' + errsJs(A).slice(0, 2).join(' | ') + ')');
    await A.browser.close();
  }

  // ================================================================= 7) app de Android (Share + Filesystem)
  if (SOLO(7)) {
    console.log('— 7 · app de Android');
    const A = await gal('juan', { apk: true }), p = A.p;
    await p.waitForTimeout(1500);
    await misFotos(A, 'h130'); await elegirEnVisor(A);
    await p.click('#zgOv [data-zg="todas"]'); await p.click('#zgOv [data-zg="enviar"]');
    const ok = await p.waitForFunction(() => (window.__apk || []).length > 0, null, { timeout: 15000 }).then(() => true, () => false);
    const o = await A.ev(() => (window.__apk || [])[0] || null);
    c(ok && o && (o.files || []).length === 3 && o.files.every((u) => /^file:\/\/\/cache\//.test(u)), 'en la app: «Enviar (3)» → Share con los 3 archivos en la caché · ' + JSON.stringify(o && o.files));
    c(errsJs(A).length === 0, 'sin errores (' + errsJs(A).slice(0, 2).join(' | ') + ')');
    await A.browser.close();
  }

  // ================================================================= 8) oficina (legajo) y solo mirar
  if (SOLO(8)) {
    console.log('— 8 · oficina en el legajo y solo mirar');
    const A = await gal('lucia', cel ? { share: true } : {}), p = A.p;
    await p.evaluate(() => window.abrirLegajo('p1')); await p.waitForTimeout(2000);
    await p.click('#lgFotosSec [data-fg="elegir"]'); await p.waitForTimeout(300);
    await p.click('#lgFotos [data-lgfoto="hf2"]'); await p.waitForTimeout(150); await p.click('#lgFotos [data-lgfoto="hp1"]'); await p.waitForTimeout(300);
    const bar = await tx(p, '#gpBarra');
    c(/2 elegidas/.test(bar) && /Enviar \(2\)/.test(bar) && /Borrar \(2\)/.test(bar), 'legajo «☑ Elegir fotos»: «2 elegidas», «Enviar (2)», «Borrar (2)» (la oficina borra las de cualquiera) · ' + bar.slice(0, 90));
    await foto(p, '8_legajo_' + (cel ? 'cel' : 'pc'));
    c(await p.evaluate(() => { const b = document.getElementById('gpBarra'); return b.getBoundingClientRect().right <= innerWidth + 1 && b.getBoundingClientRect().left >= -1; }), 'la barra entra en la pantalla');
    await p.click('#gpBarra [data-gpb="compartir"]');
    if (cel) {
      const okS = await p.waitForFunction(() => window.__shared.length > 0, null, { timeout: 15000 }).then(() => true, () => false);
      c(okS && (await A.ev(() => window.__shared[0].n)) === 2, 'celu: «Enviar (2)» → el menú del celu con 2 fotos');
    } else {
      const okZ = await p.waitForFunction(() => window.__ultimoZip && window.__ultimoZip.fotos === 2, null, { timeout: 20000 }).then(() => true, () => false);
      c(okZ, 'compu: «Enviar (2)» baja el ZIP de siempre con las 2 (con GPS) · ' + JSON.stringify(await A.ev(() => window.__ultimoZip && { n: window.__ultimoZip.nombre, f: window.__ultimoZip.fotos })));
    }
    await p.waitForTimeout(600);
    await p.click('#gpBarra [data-gpb="borrar"]'); await p.waitForTimeout(300);
    c(/¿Borrar 2 fotos\?/.test(await tx(p, '#zgConf')), 'pide «¿Borrar 2 fotos?»');
    await p.click('#zgConf [data-zgc="si"]');
    const okB = await p.waitForFunction(() => { const o = window.__stubDB().avanceObras.p1; return o && (o.fotosBorradas || []).indexOf('hf2') >= 0 && (o.fotosBorradas || []).indexOf('hp1') >= 0; }, null, { timeout: 15000 }).then(() => true, () => false);
    c(okB, 'la oficina borró las 2 (fotosBorradas de la obra, como el legajo de siempre)');
    await p.waitForTimeout(1500);
    c(!(await p.evaluate(() => !!document.querySelector('#lgFotos [data-lgfoto="hf2"]'))), 'el legajo ya no las muestra');
    c(errsJs(A).length === 0, 'sin errores (' + errsJs(A).slice(0, 2).join(' | ') + ')');
    await A.browser.close();
    // solo mirar: solo Enviar
    const M = await gal('mirta', {}), q = M.p;
    await q.evaluate(() => window.emaGaleria.abrir([{ id: 'hf1', mini: '' }, { id: 'hp1', mini: '' }], 0)); await q.waitForTimeout(600);
    await q.click('#gpVisor [data-gp="elegir"]'); await q.waitForTimeout(400);
    await q.click('#zgOv [data-zg="todas"]'); await q.waitForTimeout(150);
    c((await ver(q, '#zgOv [data-zg="enviar"]')) && !(await ver(q, '#zgOv [data-zg="borrar"]')) && !(await ver(q, '#zgOv [data-zg="mover"]')), 'solo mirar: solo «Enviar» (sin Borrar ni Mover)');
    c(errsJs(M).length === 0, 'sin errores (' + errsJs(M).slice(0, 2).join(' | ') + ')');
    await M.browser.close();
  }

  // ================================================================= 9) __v167No: como la v166
  if (SOLO(9)) {
    console.log('— 9 · __v167No');
    const A = await juan({}, { v167: false });
    await A.camB(); await A.p.waitForTimeout(800);
    const s = await A.ev(() => ({ bar: !!document.getElementById('zmBar'), dev: window.__gumDev.slice(), enumN: window.__enumN }));
    c(!s.bar && s.dev.every((d) => d === 'ultra') && s.enumN === 0, 'con __v167No: la cámara como antes (sin zoom ni elegir la principal) · ' + s.dev.join(' → '));
    await A.ev(() => window.camaraApp.cerrar());
    await A.ev(() => window.emaGaleria.abrir([{ id: 'x1', mini: '' }, { id: 'x2', mini: '' }], 0)); await A.p.waitForTimeout(500);
    c(!(await ver(A.p, '#gpVisor [data-gp="elegir"]')), 'con __v167No: la galería sin lista de fondo sigue sin «☑ Elegir»');
    await A.browser.close();
  }
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
