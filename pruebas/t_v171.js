// v171 · «＋ Otra foto» con nombre en Mis tareas (la lista). Juan (cuadrilla) en el celu con CPU ×4, la cámara de mentira, datos165
// (LOS ÁLAMOS Col 1–8; OT-2026-165 de hoy: pozo Col 6–8, izaje Col 2–3, zanja 10 m).
//  0) el botón en cada tarea; sin arrancar → el cartel «▶ Voy a iniciar» (v166) → la hoja «¿Qué es la foto?» (Columna · Tablero · PAT ·
//     Zanja · Acometida · Otro…) → Tablero → la cámara de la app → la foto en la orden (otra171, sin tarea) y en fotosObra; «Otras
//     fotos» en la tarjeta; lo pedido sigue «0 de 3»; Otro… «Medidor» (y queda en «Lo último que escribiste»); Columna → Col 9;
//     Col 6 (la pide la tarea) → va a su fila; la oficina (Lucía, otra página) lo ve en el «📸 Avance» debajo de su tarea y en el
//     legajo; Mis fotos las cuenta; Pedro las ve.
//  1) la cámara del teléfono del APK (Capacitor Camera simulado).
//  2) sin señal: queda en el celu y en la orden; vuelve la señal y llega.
//  3) la zanja (fotos por tomas): «＋ Otra foto» en vez del «📷 Otra foto» de antes; la oficina en su Mis tareas no ve nada raro.
//  4) compatibilidad (__v171No).
const fs = require('fs');
const { abrir, prueba } = require('./h');
const { datos165 } = require('./datos165');
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const FOTO = __dirname + '/foto.jpg', FOTO64 = fs.readFileSync(FOTO).toString('base64');
const camaraFalsa = () => {
  const dib = (c) => { const x = c.getContext('2d'), w = c.width, h = c.height; x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, w, h); x.fillStyle = '#6f6f5c'; x.fillRect(0, h * 0.6, w, h * 0.4); };
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => { const c = document.createElement('canvas'); c.width = 720; c.height = 1280; dib(c); setInterval(() => dib(c), 250); return c.captureStream(10); };
};
const apk = (foto64) => {
  window.__cam = 0;
  const fotoURL = () => { const b = atob(foto64), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return URL.createObjectURL(new Blob([u], { type: 'image/jpeg' })); };
  window.__cargador = { url: 'https://miguelangelbasq-tech.github.io/alumbrado-stock/', nativo: true, version: () => 'prueba', listo() { }, guardar() { }, actualizar() { }, borrar() { } };
  window.Capacitor = { isNativePlatform: () => true, convertFileSrc: (u) => u, Plugins: {
    Camera: { takePhoto: async () => { window.__cam++; await new Promise((r) => setTimeout(r, 900)); return { type: 'image', webPath: fotoURL(), saved: false }; } },
    App: { addListener: () => Promise.resolve({ remove() { } }), getInfo: async () => ({ version: '1.4' }) } } };
  try { localStorage.setItem('ema.camara.telefono', '1'); } catch (e) { }
};
(async () => {
  const c = prueba('v171' + (process.argv[2] === 'cel' ? ' cel' : ''));
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v165: true, v166: true, v167: true, v168: true, v169: true, v170: true, v171: true, reglas: !!process.env.REGLAS, antes: camaraFalsa };
  let browser = null;
  const sesion = async (quien, op, cel) => {
    const A = await abrir(Object.assign({ sesion: quien, datos: datos165(), browser, espera: 4500 }, MOD, { cel: cel !== false }, op || {})); browser = A.browser;
    A.page.on('dialog', (x) => x.accept());
    await A.ctx.grantPermissions(['geolocation', 'camera'], { origin: 'https://app.test' }); await A.ctx.setGeolocation({ latitude: -31.4273, longitude: -64.1889, accuracy: 8 });
    await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }));
    const cdp = await A.ctx.newCDPSession(A.page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await A.page.waitForTimeout(800); return A;
  };
  const otra = async (A, quien, cel) => { const B = await abrir(Object.assign({ sesion: quien, browser: A.browser, ctx: A.ctx, espera: 4500 }, MOD, { cel: cel !== false })); B.page.on('dialog', (x) => x.accept()); return B; };
  const T = (k) => `#mtApp .mt-ot[data-ot="ot165"] .mt-tarea[data-k="${k}"]`;
  const foto = async (p, n, k) => { if (!CAP) return; if (k) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); }, k); fs.mkdirSync(CAP, { recursive: true }); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + n + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const hoyDe = (p) => p.evaluate(() => fechaAISO(new Date()));
  const reloj = (p, hoy, hm) => p.evaluate(([d, h]) => { window.__tcAhora = () => new Date(d + 'T' + h + ':00').getTime(); }, [hoy, hm]);
  const tx = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const otC = (p, db) => p.evaluate((db) => JSON.parse(JSON.stringify((db ? window.__stubDB().ordenesTrabajo.ot165 : ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {})), !!db);
  const otras = async (p, db) => Object.values((await otC(p, db)).fotos || {}).filter((f) => f.otra171);
  const misTareas = async (p) => {
    await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(1500);
    if (!(await p.$(T('excavacion')))) { await p.click('.mt-item[data-mtabrir="ot165"]').catch(() => { }); await p.waitForTimeout(1200); }
  };
  const verTarea = async (p, k) => { await p.evaluate((k) => { const card = document.querySelector('#mtApp .mt-ot[data-ot="ot165"]'); if (!card) return; const l = [...card.querySelectorAll('.mt-tarea[data-k]')].map((x) => x.dataset.k); const d = card.querySelector('[data-mtcir="' + l.indexOf(k) + '"]'); d && d.click(); }, k); await p.waitForTimeout(700); };
  const cerrarCam = async (p) => { await p.evaluate(() => { if (document.getElementById('emaCam')) window.camaraApp.cerrar(); }); await p.waitForTimeout(500); };
  const tocarBoton = (p, k) => p.evaluate((s) => { const b = document.querySelector(s + ' [data-mto="abrir"]'); if (!b) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true; }, T(k));
  // la foto llega al input de «Otra foto» (como si saliera de la cámara del teléfono)
  const alInput = async (p, k) => { const ok = await p.evaluate((s) => { const x = document.querySelector(s + ' input[data-mto171]'); if (!x) return false; x.id = 'v171In'; return true; }, T(k)); if (ok) { await p.setInputFiles('#v171In', FOTO); await p.waitForTimeout(1800); await p.evaluate(() => { const x = document.getElementById('v171In'); x && x.removeAttribute('id'); }); } return ok; };
  const cuenta = (p, k) => tx(p, T(k) + ' .fl-cab .fl-cuenta');
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);

  // ================================================================= 0) el camino completo
  if (SOLO(0)) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:20'); await misTareas(p);
    const btns = await p.evaluate(() => [...document.querySelectorAll('#mtApp .mt-ot[data-ot="ot165"] .mt-tarea[data-k]')].map((t) => t.dataset.k + ':' + !!t.querySelector('[data-mto="abrir"]')));
    c(btns.length === 3 && btns.every((x) => /:true$/.test(x)), 'cada tarea de Mis tareas tiene «＋ Otra foto» · ' + btns.join(' '));
    const c0 = await cuenta(p, 'excavacion');
    const alto = await p.evaluate((s) => { const b = document.querySelector(s + ' [data-mto="abrir"]'); return b ? Math.round(b.getBoundingClientRect().height) : 0; }, T('excavacion'));
    c(alto >= 44, 'el botón se toca bien (≥ 44 px) · ' + alto);
    await foto(p, '0_boton', T('excavacion') + ' .of-caja');
    // sin arrancar → el cartel de la v166
    await tocarBoton(p, 'excavacion'); await p.waitForTimeout(800);
    const car = await tx(p, '#viOv');
    c(/¿Arrancás con Pozo\?/i.test(car) && !(await p.$('#ofOv')), 'la tarea no arrancó: «＋ Otra foto» abre primero el cartel «▶ Voy a iniciar» (v166) · ' + car.slice(0, 80));
    await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(1200);
    const hoja = await p.evaluate(() => { const v = document.getElementById('ofOv'); return v ? { rol: v.getAttribute('role'), v7: v.classList.contains('v7-ov'), x: !!v.querySelector('[aria-label="Cerrar"]'), chips: [...v.querySelectorAll('[data-ofcat]')].map((b) => b.textContent.trim()), min: Math.min.apply(null, [...v.querySelectorAll('[data-ofcat]')].map((b) => b.getBoundingClientRect().height)) } : null; });
    const ini = (((await otC(p)).tareaInicio || {}).excavacion || {})['juan perez'];
    c(!!ini && hoja && hoja.rol === 'dialog' && hoja.v7 && hoja.x && hoja.chips.join('|') === 'Columna|Tablero|PAT|Zanja|Acometida|Otro…' && hoja.min >= 44, '«Voy a iniciar» anota el inicio y sigue: la hoja «¿Qué es la foto?» con Columna · Tablero · PAT · Zanja · Acometida · Otro… (≥ 44 px, ✕) · ' + JSON.stringify(hoja));
    c(!(await p.evaluate(() => !!document.getElementById('emaCam'))), 'todavía no abre la cámara: primero el nombre');
    await foto(p, '1_hoja_nombre');
    // Tablero → la cámara de la app
    await p.click('#ofOv [data-ofcat="tablero"]'); await p.waitForTimeout(1500);
    const cam = await p.evaluate(() => ({ cam: !!document.getElementById('emaCam'), fln: window.camaraApp && window.camaraApp.inp && window.camaraApp.inp() ? window.camaraApp.inp().dataset.fln : '' }));
    c(cam.cam && cam.fln === 'Tablero' && !(await p.$('#ofOv')), 'Tablero → se abre la cámara de la app con «Tablero» de nombre · ' + JSON.stringify(cam));
    await foto(p, '2_camara_tablero');
    await p.waitForFunction(() => { const v = document.getElementById('ecVideo'); return v && v.videoWidth > 0; }, null, { timeout: 8000 }).catch(() => { });
    await p.click('#emaCam [data-ec="disparar"]').catch(() => { });
    await p.waitForFunction(() => Object.values(((ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {}).fotos || {}).some((f) => f.otra171 && f.num === 'Tablero'), null, { timeout: 15000 }).catch(() => { });
    await p.waitForTimeout(1200); await cerrarCam(p);
    let O = await otras(p);
    const tb = O.find((f) => f.num === 'Tablero');
    c(!!tb && tb.cat === 'tablero' && tb.kx === 'excavacion' && !tb.k && tb.por === 'Juan Pérez', 'la foto queda en la orden con su nombre: campo.fotos {cat tablero, num Tablero, otra171, kx excavacion, sin k (suelta)} · ' + JSON.stringify(tb || {}).slice(0, 160));
    await p.waitForTimeout(1500);
    const fo = await p.evaluate(() => Object.values(window.__stubDB().fotosObra || {}).filter((f) => f.otId === 'ot165' && f.num === 'Tablero').map((f) => f.cat + '|' + (f.k || '')));
    c(fo.length === 1 && fo[0] === 'tablero|', 'y en fotosObra (el legajo) con su nombre, sin tarea · ' + JSON.stringify(fo));
    await verTarea(p, 'excavacion');
    let bl = await tx(p, T('excavacion') + ' .of-caja');
    c(/Otras fotos/.test(bl) && /Tablero/.test(bl), 'en la tarjeta de la tarea: «📎 Otras fotos» con «Tablero» · ' + bl.slice(0, 100));
    c((await cuenta(p, 'excavacion')) === c0 && (await p.evaluate(() => window.__mtAPI.fotos(ordenesTrabajo.find((x) => x.id === 'ot165'), 'excavacion').length)) === 0, 'lo que se pide no cambia: «' + c0 + '» y la tarea sin fotos propias (no cuenta, la verificación igual)');
    const ver = await p.evaluate(() => { try { const v = window.__verifOt.verifTarea(ordenesTrabajo.find((x) => x.id === 'ot165'), 'excavacion'); return JSON.stringify(v).slice(0, 300); } catch (e) { return 'x'; } });
    c(!/Tablero/.test(ver), 'la verificación (v150) no la toma como una columna · ' + ver.slice(0, 120));
    // Otro… «Medidor»
    await tocarBoton(p, 'excavacion'); await p.waitForTimeout(600);
    c(!(await p.$('#viOv')) && !!(await p.$('#ofOv')), 'ya arrancó: el botón va directo a la hoja (sin cartel)');
    await p.click('#ofOv [data-ofcat="otra"]'); await p.waitForTimeout(400);
    await p.fill('#ofOtroIn', 'Medidor'); await foto(p, '3_otro_teclado');
    await p.click('#ofOv .of-form button[type="submit"]'); await p.waitForTimeout(900);
    const fl2 = await p.evaluate(() => window.camaraApp && window.camaraApp.inp && window.camaraApp.inp() ? window.camaraApp.inp().dataset.fln : '');
    await cerrarCam(p); await alInput(p, 'excavacion');
    O = await otras(p);
    const rec = await p.evaluate(() => JSON.parse(localStorage.getItem('ema.foto.otros') || '[]'));
    c(fl2 === 'Medidor' && O.some((f) => f.num === 'Medidor' && f.cat === 'otra') && rec[0] === 'Medidor', 'Otro… → «Medidor» → la cámara con ese nombre y la foto en la orden (cat otra); queda en lo último escrito (ema.foto.otros, la misma lista de la cámara) · ' + fl2 + ' · ' + JSON.stringify(rec));
    await tocarBoton(p, 'excavacion'); await p.waitForTimeout(500); await p.click('#ofOv [data-ofcat="otra"]'); await p.waitForTimeout(400);
    c(/Medidor/.test(await tx(p, '#ofOv .of-rec')), 'la próxima vez «Medidor» aparece en «Lo último que escribiste»');
    await p.click('#ofOv [data-of="x"]'); await p.waitForTimeout(300);
    c(!(await p.$('#ofOv')), '✕ cierra la hoja');
    // Columna → Col 9 (la que sigue a las de la tarea)
    await tocarBoton(p, 'excavacion'); await p.waitForTimeout(500); await p.click('#ofOv [data-ofcat="columna"]'); await p.waitForTimeout(400);
    const col0 = await tx(p, '#ofOv .of-nt b');
    await foto(p, '4_columna_picker');
    await p.click('#ofOv [data-of="sacar"]'); await p.waitForTimeout(900); await cerrarCam(p); await alInput(p, 'excavacion');
    O = await otras(p);
    c(col0 === 'Col 9' && O.some((f) => f.num === 'Col 9' && f.cat === 'columna' && !f.k), 'Columna: «‹ Col 9 ›» (la que sigue a las de la tarea) → la foto «Col 9», de más (no es de esta tarea) · ' + col0);
    c((await cuenta(p, 'excavacion')) === c0, 'lo pedido sigue igual («' + c0 + '») con Tablero, Medidor y Col 9');
    // Col 6, que la tarea sí pide: va a su fila
    await tocarBoton(p, 'excavacion'); await p.waitForTimeout(500); await p.click('#ofOv [data-ofcat="columna"]'); await p.waitForTimeout(300);
    for (let i = 0; i < 3; i++) { await p.click('#ofOv [data-of="prev"]'); await p.waitForTimeout(150); }
    const col6 = await tx(p, '#ofOv .of-nt b');
    await reloj(p, hoy, '08:44');
    await p.click('#ofOv [data-of="sacar"]'); await p.waitForTimeout(900); await cerrarCam(p); await alInput(p, 'excavacion');
    const C1 = await otC(p), f6 = Object.values(C1.fotos || {}).find((f) => f.k === 'excavacion' && f.num === 'Col 6');
    c(col6 === 'Col 6' && !!f6 && !f6.otra171 && /^1 de 3/.test(await cuenta(p, 'excavacion')), '‹ › hasta «Col 6», que la tarea pide → va a su fila como siempre (cuenta: ' + (await cuenta(p, 'excavacion')) + ')');
    await verTarea(p, 'excavacion');
    bl = await tx(p, T('excavacion') + ' .of-caja');
    c(/Tablero/.test(bl) && /Medidor/.test(bl) && /Col 9/.test(bl) && !/Col 6/.test(bl), '«Otras fotos»: Tablero, Medidor y Col 9 (la Col 6 no) · ' + bl.slice(0, 120));
    await foto(p, '5_otras_fotos', T('excavacion') + ' .of-caja');
    const nov = await p.evaluate(() => { const n = document.querySelector('#mtApp .mt-ot[data-ot="ot165"] .mt-nov'); const b = n && n.closest('.mt-bloque'); return b ? b.querySelectorAll('.mt-fotos img').length : 0; });
    c(nov === 0, 'no se repiten abajo en «Novedades» · ' + nov);
    const mf = await tx(p, '#mtApp [data-misfotos="ot165"]');
    c(/Mis fotos \(4\)/.test(mf), '«📷 Mis fotos» las cuenta (4: Tablero, Medidor, Col 9 y Col 6) · ' + mf);
    c(await scrollX(p) <= 0, 'sin scroll de costado');
    c(errsJs(A).length === 0, 'sin errores (Juan)' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    // Pedro las ve en su tarjeta
    const B = await otra(A, 'pedro'); const q = B.page; await misTareas(q); await verTarea(q, 'excavacion');
    c(/Tablero/.test(await tx(q, T('excavacion') + ' .of-caja')), 'Pedro (compañero) ve las «Otras fotos» de la tarea');
    await q.close();
    // la oficina (Lucía, en la compu)
    const L = await otra(A, 'lucia', false); const o = L.page; await o.waitForTimeout(1500);
    await o.evaluate(() => window.__avanceOrden.abrir('ot165')); await o.waitForTimeout(1500);
    const ao = await o.evaluate(() => { const t = [...document.querySelectorAll('#avOt .ao-t')].find((x) => /Excavaci|Pozo/i.test(x.textContent)); const x = t && t.querySelector('.ao-otras171'); return x ? x.textContent.replace(/\s+/g, ' ') : ''; });
    c(/Otras fotos/.test(ao) && /Tablero/.test(ao) && /Medidor/.test(ao) && /Col 9/.test(ao), 'la oficina, en el «📸 Avance»: debajo del pozo «📎 Otras fotos (de más, no cuentan)» con Tablero, Medidor y Col 9 · ' + ao.slice(0, 140));
    await foto(o, '6_oficina_avance');
    await o.evaluate(() => window.__avanceOrden.cerrar());
    const leg = await o.evaluate(async () => { const l = await window.fbFotosObraDe('p1'); return (l || []).filter((f) => f.otId === 'ot165').map((f) => f.num); });
    c(['Tablero', 'Medidor', 'Col 9'].every((n) => leg.indexOf(n) >= 0), 'y en el legajo de la obra con su nombre (se puede ↔ Mover) · ' + JSON.stringify(leg));
    c(errsJs(L).length === 0, 'sin errores (oficina)' + (errsJs(L).length ? ': ' + errsJs(L).slice(0, 2).join(' | ') : ''));
    await o.close(); await A.ctx.close();
  }

  // ================================================================= 1) la cámara del teléfono (APK)
  if (SOLO(1)) {
    const A = await sesion('juan', { antes: apk, antesArg: FOTO64 }); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:30'); await misTareas(p);
    await tocarBoton(p, 'excavacion'); await p.waitForTimeout(700);
    await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(1000);
    c((await p.evaluate(() => window.__cam)) === 0 && !!(await p.$('#ofOv')), 'APK: cartel → la hoja del nombre (el teléfono todavía no)');
    await p.click('#ofOv [data-ofcat="pat"]');
    await p.waitForFunction(() => Object.values(((ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {}).fotos || {}).some((f) => f.otra171 && f.num === 'PAT'), null, { timeout: 20000 }).catch(() => { });
    const O = await otras(p);
    c((await p.evaluate(() => window.__cam)) === 1 && O.some((f) => f.num === 'PAT' && f.cat === 'pat' && f.kx === 'excavacion'), 'PAT → la cámara del teléfono (plugin Camera) una vez → la foto «PAT» en la orden · cámara ' + (await p.evaluate(() => window.__cam)));
    c(errsJs(A).length === 0, 'sin errores (APK)' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 2) sin señal
  if (SOLO(2)) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:30'); await misTareas(p);
    await tocarBoton(p, 'zanjeo'); await p.waitForTimeout(700);
    if (await p.$('#viOv')) { await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(1000); }
    await p.evaluate(() => { window.__stubSinRed = true; }); await A.ctx.setOffline(true);
    await p.click('#ofOv [data-ofcat="otra"]'); await p.waitForTimeout(300); await p.fill('#ofOtroIn', 'Caño roto'); await p.press('#ofOtroIn', 'Enter'); await p.waitForTimeout(800);
    await cerrarCam(p); await alInput(p, 'zanjeo'); await p.waitForTimeout(2500);
    const O = await otras(p), tt = await tx(p, '#ofToast');
    c(O.some((f) => f.num === 'Caño roto' && f.kx === 'zanjeo'), 'sin señal: la foto «Caño roto» queda en la orden (en el celu) · ' + tt);
    await verTarea(p, 'zanjeo');
    c(/Caño roto/.test(await tx(p, T('zanjeo') + ' .of-caja')), 'y se ve en «Otras fotos» de la zanja');
    await p.evaluate(() => { window.__stubSinRed = false; }); await A.ctx.setOffline(false);
    await p.evaluate(() => window.dispatchEvent(new Event('online')));
    await p.waitForFunction(() => Object.values(((window.__stubDB().ordenesTrabajo.ot165 || {}).campo || {}).fotos || {}).some((f) => f.otra171 && f.num === 'Caño roto'), null, { timeout: 40000 }).catch(() => { });
    c((await otras(p, true)).some((f) => f.num === 'Caño roto'), 'vuelve la señal: llega a la base');
    c(errsJs(A).length === 0, 'sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 3) la zanja (tomas)
  if (SOLO(3)) {
    const A = await sesion('juan'); const p = A.page;
    await misTareas(p); await verTarea(p, 'zanjeo');
    const z = await p.evaluate((s) => ({ nuevo: !!document.querySelector(s + ' [data-mto="abrir"]'), viejo: [...document.querySelectorAll(s + ' label.fl-otra')].filter((l) => /Otra foto/.test(l.textContent)).length }), T('zanjeo'));
    c(z.nuevo && z.viejo === 0, 'la zanja (fotos por tomas): «＋ Otra foto» en lugar del «📷 Otra foto» de antes · ' + JSON.stringify(z));
    await foto(p, '7_zanja', T('zanjeo') + ' .of-caja');
    await A.ctx.close();
  }

  // ================================================================= 4) __v171No
  if (SOLO(4)) {
    const A = await sesion('juan', { v171: false }); const p = A.page;
    await misTareas(p); await verTarea(p, 'zanjeo');
    const z = await p.evaluate((s) => ({ nuevo: document.querySelectorAll('#mtApp [data-mto]').length, viejo: [...document.querySelectorAll(s + ' label.fl-otra')].filter((l) => /Otra foto/.test(l.textContent)).length, of: document.querySelectorAll('#mtApp .of-caja').length }), T('zanjeo'));
    c(z.nuevo === 0 && z.of === 0 && z.viejo === 1, '__v171No: sin «＋ Otra foto» ni «Otras fotos»; la zanja con el «📷 Otra foto» de antes · ' + JSON.stringify(z));
    await A.ctx.close();
  }
  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
