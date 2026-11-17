// v166 · «▶ Voy a iniciar» y el tiempo de cada columna también en Mis tareas (la lista). Juan (cuadrilla) en el celu con CPU ×4;
// Pedro (su compañero) en otra página del mismo celu (la base compartida).
//  0) el bug (con ANTES=1 contra la v165): en Mis tareas el 📷 abre la cámara directo, sin cartel ni hora de inicio; las fotos
//     de 3 columnas dejan la hora en la base pero en la fila no se ve nada (solo un cartelito que se va a los 9 s) y no hay récord.
//     Sin ANTES: el 📷 de la Col 6 abre el cartel de la v165 → «Voy a iniciar» (08:20, para Juan y Pedro sin duplicar) → la cámara
//     de esa fila → 3 fotos → «✓ Col N lista · N min» en cada fila (− / + que queda), «En marcha desde 08:20» en la cabecera,
//     el récord de la Col 6, Pedro sin cartel, «Listo, enviar esta tarea» con el resumen por columna y campo.tareaFin.
//  1) la cámara del teléfono del APK (Capacitor Camera simulado): el cartel → «Voy a iniciar» → takePhoto → la foto llega a su fila.
//  2) «Todavía no» (la foto sale igual, sin anotar; no vuelve a preguntar), el botón de la cabecera, «¿Es otra tarea?», la zanja
//     (sin columnas): «Voy a iniciar» deja la hora de inicio, al mandar el récord por metro y las felicitaciones.
//  3) compatibilidad (__v166No): Mis tareas como la v165.
//  4) que no se tilde (CPU ×6): abrir Mis tareas y tocar el 📷 sin tareas largas nuevas.
const fs = require('fs');
const { abrir, prueba } = require('./h');
const { datos165 } = require('./datos165');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const ANTES = !!process.env.ANTES;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const FOTO = __dirname + '/foto.jpg', FOTO64 = fs.readFileSync(FOTO).toString('base64');
const camaraFalsa = () => {
  const dib = (c) => { const x = c.getContext('2d'), w = c.width, h = c.height; x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, w, h); x.fillStyle = '#6f6f5c'; x.fillRect(0, h * 0.6, w, h * 0.4); x.fillStyle = '#e9edf2'; x.fillRect(w * 0.47, h * 0.12, w * 0.05, h * 0.62); };
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => { const c = document.createElement('canvas'); c.width = 720; c.height = 1280; dib(c); setInterval(() => dib(c), 250); return c.captureStream(10); };
};
// la app de Android (APK 1.4): la cámara del teléfono por el plugin Camera
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
  const c = prueba('v166' + (cel ? ' cel' : '') + (ANTES ? ' ANTES' : ''));
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v165: true, v166: !ANTES, reglas: !!process.env.REGLAS, antes: camaraFalsa };
  let browser = null;
  const sesion = async (quien, op, datos, cpu) => {
    const A = await abrir(Object.assign({ sesion: quien, datos: datos || datos165(), browser, espera: 4500 }, MOD, { cel: true }, op || {})); browser = A.browser;
    A.page.on('dialog', (x) => x.accept());
    await A.ctx.grantPermissions(['geolocation', 'camera'], { origin: 'https://app.test' }); await A.ctx.setGeolocation({ latitude: -31.4273, longitude: -64.1889, accuracy: 8 });
    await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }));
    const cdp = await A.ctx.newCDPSession(A.page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu || 4 }); A.cdp = cdp;
    await A.page.waitForTimeout(800); return A;
  };
  const otra = async (A, quien) => { const B = await abrir(Object.assign({ sesion: quien, browser: A.browser, ctx: A.ctx, espera: 4500 }, MOD, { cel: true })); B.page.on('dialog', (x) => x.accept()); return B; };
  const foto = async (p, n, k) => { if (!CAP) return; if (k) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); }, T(k)); fs.mkdirSync(CAP, { recursive: true }); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + n + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const hoyDe = (p) => p.evaluate(() => fechaAISO(new Date()));
  const reloj = (p, hoy, hm) => p.evaluate(([d, h]) => { window.__tcAhora = () => new Date(d + 'T' + h + ':00').getTime(); }, [hoy, hm]);
  const tx = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const otC = (p, db) => p.evaluate((db) => JSON.parse(JSON.stringify((db ? window.__stubDB().ordenesTrabajo.ot165 : ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {})), !!db);
  const hm = (t) => new Date(t).toTimeString().slice(0, 5);
  const T = (k) => `#mtApp .mt-ot[data-ot="ot165"] .mt-tarea[data-k="${k}"]`;
  const misTareas = async (p) => {
    await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(1500);
    if (!(await p.$(T('excavacion')))) { await p.click('.mt-item[data-mtabrir="ot165"]').catch(() => { }); await p.waitForTimeout(1200); }
  };
  const verTarea = async (p, k) => { await p.evaluate((k) => { const card = document.querySelector('#mtApp .mt-ot[data-ot="ot165"]'); if (!card) return; const l = [...card.querySelectorAll('.mt-tarea[data-k]')].map((x) => x.dataset.k); const d = card.querySelector('[data-mtcir="' + l.indexOf(k) + '"]'); d && d.click(); }, k); await p.waitForTimeout(700); };
  // el 📷 de la fila (la etiqueta, como el dedo)
  const camFila = async (p, k, num) => p.evaluate(([s, n]) => { const i = [...document.querySelectorAll(s + ' input.mt-foto-t')].find((y) => y.dataset.fln === n); const l = i && i.closest('label'); if (!l) return false; l.click(); return true; }, [T(k), num]);
  const cerrarCam = async (p) => { await p.evaluate(() => { if (document.getElementById('emaCam')) window.camaraApp.cerrar(); }); await p.waitForTimeout(500); };
  const filaInput = async (p, k, num) => { const ok = await p.evaluate(([s, n]) => { const x = [...document.querySelectorAll(s + ' input.mt-foto-t')].find((y) => y.dataset.fln === n); if (!x) return false; x.id = 'v166In'; return true; }, [T(k), num]); if (ok) { await p.setInputFiles('#v166In', FOTO); await p.waitForTimeout(1800); await p.evaluate(() => { const x = document.getElementById('v166In'); x && x.removeAttribute('id'); }); } return ok; };
  const pasos = async (p, k) => Object.values(((await otC(p)).pasosObra || {})[k] || {}).filter((x) => x.estado === 'si').sort((a, b) => a.finTs - b.finTs).map((x) => x.num + ' ' + x.ini + '-' + x.fin + ' ' + x.min);
  const filaTxt = (p, k, num) => p.evaluate(([s, n]) => { const f = [...document.querySelectorAll(s + ' .fl-fila.hecha')].find((x) => (x.querySelector('.fl-nom') || {}).textContent.indexOf(n) >= 0); return f ? f.textContent.replace(/\s+/g, ' ').trim() : ''; }, [T(k), num]);
  const recs = (p) => p.evaluate(() => window.__inicioTarea && window.__inicioTarea.estado ? window.__inicioTarea.estado().recs.map((r) => r.em + ' ' + r.t + ' · ' + (r.r1 || '') + ' · ' + (r.r2 || '') + (r.r3 ? ' · ' + r.r3 : '')) : []);
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);

  // ================================================================= 0) el bug / arreglado
  if (SOLO(0)) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:20'); await misTareas(p);
    await foto(p, '0_mis_tareas', 'excavacion');
    const filas0 = await p.evaluate((s) => [...document.querySelectorAll(s + ' .fl-fila:not(.hecha) input.mt-foto-t')].map((x) => x.dataset.fln), T('excavacion'));
    await camFila(p, 'excavacion', filas0[0]); await p.waitForTimeout(900);
    const car = await tx(p, '#viOv'), camAb = await p.evaluate(() => !!document.getElementById('emaCam'));
    if (ANTES) {
      c(!car && camAb, 'ANTES: el 📷 de Mis tareas abre la cámara directo, sin el cartel «Voy a iniciar» · cámara ' + camAb);
      await cerrarCam(p);
      for (const [n, h] of [['Col 6', '08:44'], ['Col 7', '09:10'], ['Col 8', '09:41']]) { await reloj(p, hoy, h); await filaInput(p, 'excavacion', n); }
      await p.waitForTimeout(9500);
      const C0 = await otC(p), ps = await pasos(p, 'excavacion'), f6 = await filaTxt(p, 'excavacion', 'Col 6');
      c(!Object.keys(C0.tareaInicio || {}).length, 'ANTES: no queda la hora de inicio de la tarea (campo.tareaInicio vacío)');
      c(!/lista ·/.test(f6) && !(await p.evaluate(() => { const v = document.getElementById('tcAviso'); return !!v && !v.hidden; })), 'ANTES: en la fila de la Col 6 no se ve el tiempo (el cartelito de 9 s ya se fue) · fila «' + f6 + '» · pasos ' + ps.join(' | '));
      c(!(await recs(p)).length, 'ANTES: las fotos de Mis tareas no pasan por el récord · ' + (await recs(p)).join(' | '));
      c(!(await p.$(T('excavacion') + ' [data-vimt], ' + T('excavacion') + ' .vim-cab')), 'ANTES: la cabecera de la tarea no dice nada de «Voy a iniciar» ni «En marcha»');
      await A.ctx.close(); await browser.close(); process.exit(c.fin() ? 1 : 0);
    }
    c(JSON.stringify(filas0.slice(0, 3)) === '["Col 6","Col 7","Col 8"]', 'Mis tareas: las filas que faltan son las columnas que eligió la oficina (Col 6, 7 y 8, salteando la 5) · ' + JSON.stringify(filas0));
    const dlg = await p.evaluate(() => { const v = document.getElementById('viOv'); return !!v && v.getAttribute('role') === 'dialog' && v.classList.contains('v7-ov') && !!v.querySelector('[aria-label="Cerrar"]'); });
    c(dlg && !camAb && /¿Arrancás con Pozo\?/i.test(car) && /Col 6, 7 y 8/.test(car) && /con Pedro/.test(car) && /Todavía no/.test(car) && /queda anotada \(08:20\)/.test(car), 'el 📷 de la Col 6 en Mis tareas abre el MISMO cartel de la v165 («¿Arrancás con POZO?», «Col 6, 7 y 8 · … · con Pedro», «Todavía no»), sin abrir la cámara todavía · ' + car.slice(0, 160));
    await foto(p, '1_cartel_mis_tareas');
    const med = await p.evaluate(() => window.__inicioMt.estado().med);
    c(med.length && Math.max.apply(null, med) < 200, 'el toque del 📷 → cartel tarda menos de 200 ms (CPU ×4) · ' + med.join(', ') + ' ms');
    await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(1600);
    let C0 = await otC(p);
    const ti = ((C0.tareaInicio || {}).excavacion || {})['juan perez'] || {}, ci = ((C0.colInicio || {}).excavacion || {})['col 6'] || {};
    const cam1 = await p.evaluate(() => { const e = document.getElementById('emaCam'); return { cam: !!e, fln: (document.querySelector('#emaCam') && window.camaraApp && window.camaraApp.inp && window.camaraApp.inp() ? window.camaraApp.inp().dataset.fln : '') }; });
    c(hm(ti.ts) === '08:20' && (ti.gente || []).length === 2 && hm(ci.ts) === '08:20' && ci.num === 'Col 6', '«▶ Voy a iniciar»: campo.tareaInicio.excavacion.juan perez 08:20 (con la gente) y colInicio de la Col 6 · ' + JSON.stringify({ ti: ti.ts && hm(ti.ts), ci: ci.ts && hm(ci.ts) }));
    c(cam1.cam && (!cam1.fln || cam1.fln === 'Col 6'), '… y sigue con lo que quería: la cámara de esa fila (Col 6) se abre en el mismo toque · ' + JSON.stringify(cam1));
    await foto(p, '2_camara_fila');
    // la foto de la Col 6 con la cámara de la app
    await reloj(p, hoy, '08:44');
    await p.click('#emaCam [data-ec="disparar"]').catch(() => { });
    await p.waitForFunction(() => Object.values(((ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {}).fotos || {}).some((f) => f.k === 'excavacion' && f.num === 'Col 6'), null, { timeout: 15000 }).catch(() => { });
    await p.waitForTimeout(1500); await cerrarCam(p);
    let R0 = await recs(p);
    c(R0.some((r) => /🔥 ¡Récord tuyo! · Col 6 en 24 min · Tu mejor era 30 min/.test(r)), 'la foto de Mis tareas pasa por el récord: «🔥 ¡Récord tuyo! Col 6 en 24 min · Tu mejor era 30 min» · ' + R0.join(' | '));
    await p.waitForTimeout(400);
    let f6 = await filaTxt(p, 'excavacion', 'Col 6'), cab = await tx(p, T('excavacion') + ' .vim-cab');
    c(/Col 6 lista · 24 min/.test(f6), 'la fila de la Col 6 dice «✓ Col 6 lista · 24 min» (desde «Voy a iniciar») · ' + f6);
    c(/En marcha desde 08:20 · 24 min/.test(cab), 'la cabecera de la tarea: «▶ En marcha desde 08:20 · 24 min» · ' + cab);
    await foto(p, '3_fila_col6', 'excavacion');
    // Col 7 y 8: ya está en marcha → el 📷 va directo (sin cartel)
    await reloj(p, hoy, '09:10'); await camFila(p, 'excavacion', 'Col 7'); await p.waitForTimeout(700);
    c(!(await p.evaluate(() => !!document.getElementById('viOv'))) && (await p.evaluate(() => !!document.getElementById('emaCam'))), 'la tarea ya arrancó: el 📷 de la Col 7 abre la cámara directo (sin cartel)');
    await cerrarCam(p);
    await filaInput(p, 'excavacion', 'Col 7');
    await reloj(p, hoy, '09:41'); await filaInput(p, 'excavacion', 'Col 8');
    await p.waitForTimeout(800);
    const ps = await pasos(p, 'excavacion');
    c(ps.join(' | ') === 'Col 6 08:20-08:44 24 | Col 7 08:44-09:10 26 | Col 8 09:10-09:41 31', 'en la orden: campo.pasosObra con el tiempo de cada columna (24, 26, 31) · ' + ps.join(' | '));
    const filas = [await filaTxt(p, 'excavacion', 'Col 6'), await filaTxt(p, 'excavacion', 'Col 7'), await filaTxt(p, 'excavacion', 'Col 8')];
    c(/Col 6 lista · 24 min/.test(filas[0]) && /Col 7 lista · 26 min/.test(filas[1]) && /Col 8 lista · 31 min/.test(filas[2]), 'cada fila con su «✓ Col N lista · N min» (y siguen ahí, no es un cartelito que se va) · ' + filas.map((x) => x.slice(0, 50)).join(' | '));
    R0 = await recs(p);
    c(R0.some((r) => /👍 Estuviste bien · Col 7 en 26 min/.test(r)) && !R0.some((r) => /Col 8/.test(r)), '«👍 Estuviste bien» en la Col 7 y nada en la Col 8 (31 min) · ' + R0.join(' | '));
    await foto(p, '4_filas_tiempo', 'excavacion');
    // «cambiar» en la Col 8: − / + y queda abierto aunque se redibuje
    await p.click(T('excavacion') + ' .fl-fila.hecha .vim-t .tc-linea[data-tcnum="Col 8"] [data-tc="cambiar"]'); await p.waitForTimeout(300);
    await p.click(T('excavacion') + ' .fl-fila.hecha .vim-t .tc-linea[data-tcnum="Col 8"] [data-tc="-"]'); await p.waitForTimeout(400);
    await p.evaluate(() => window.__mtAPI.redibujar()); await p.waitForTimeout(600);
    const f8 = await filaTxt(p, 'excavacion', 'Col 8'), ab = await p.evaluate((s) => { const l = document.querySelector(s + ' .vim-t .tc-linea[data-tcnum="Col 8"] .tc-pm'); return !!l && !l.hidden; }, T('excavacion'));
    c(/Col 8 lista · 26 min/.test(f8) && ab && (await pasos(p, 'excavacion'))[2] === 'Col 8 09:15-09:41 26', '«cambiar» → −5 en la fila: la Col 8 queda 26 min (empezó 09:15) y los botones siguen abiertos después de redibujar · ' + f8);
    // Pedro, el compañero: sin cartel, ve «En marcha desde 08:20 · inició Juan»; no duplica
    const B = await otra(A, 'pedro'); const q = B.page;
    await reloj(q, hoy, '09:45'); await misTareas(q); await q.waitForTimeout(600);
    const cabP = await tx(q, T('excavacion') + ' .vim-cab');
    const hayFila = await q.evaluate((s) => [...document.querySelectorAll(s + ' input.mt-foto-t')].map((x) => x.dataset.fln).filter((x) => x && x !== 'Otra'), T('excavacion'));
    if (hayFila.length) { await camFila(q, 'excavacion', hayFila[hayFila.length - 1]); await q.waitForTimeout(800); }
    const pd = await q.evaluate(() => ({ cartel: !!document.getElementById('viOv') }));
    await q.evaluate(() => { if (document.getElementById('emaCam')) window.camaraApp.cerrar(); });
    const C1 = await otC(q);
    c(/En marcha desde 08:20/.test(cabP) && /inició Juan/.test(cabP) && !pd.cartel && Object.keys((C1.tareaInicio || {}).excavacion || {}).length === 1, 'Pedro: la tarea ya está iniciada por Juan: «▶ En marcha desde 08:20 · inició Juan», su 📷 no muestra el cartel y no hay una segunda entrada · ' + cabP + ' · ' + JSON.stringify(pd));
    c(errsJs(B).length === 0, 'sin errores (Pedro)' + (errsJs(B).length ? ': ' + errsJs(B).slice(0, 2).join(' | ') : ''));
    await q.close();
    // mandar la tarea: el resumen por columna y campo.tareaFin
    await reloj(p, hoy, '09:50');
    await p.evaluate((s) => { const b = document.querySelector(s + ' [data-m="si"]'); b && !b.classList.contains('on') && b.click(); }, T('excavacion')); await p.waitForTimeout(800);
    await foto(p, '4b_antes_de_mandar', 'excavacion');
    await p.click(T('excavacion') + ' [data-et="si"]', { timeout: 8000 }).catch(() => { }); await p.waitForTimeout(800);
    const et = await tx(p, '#etPop');
    c(/Col 6 · 08:20–08:44 · 24 min/.test(et) && /Col 8 · 09:15–09:41 · 26 min/.test(et) && /Total:/.test(et), '«✓ Se hizo · mandar»: el resumen con el tiempo de cada columna (sin pedir horas) · ' + et.slice(0, 200));
    await foto(p, '5_mandar_resumen');
    await p.click('#etPop [data-etp="enviar"]', { timeout: 8000 }).catch(() => { }); await p.waitForTimeout(2500);
    C0 = await otC(p);
    const te = ((C0.tareaEnv || {}).excavacion || {})['Juan Pérez'] || {}, tf = ((C0.tareaFin || {}).excavacion || {})['juan perez'] || {};
    c(te.estado === 'si' && hm(tf.ts) === '09:50' && C0.horasTarea.excavacion.ini === '08:20' && C0.horasTarea.excavacion.fin === '09:41', 'mandada: tareaEnv, campo.tareaFin 09:50 y la tarea con el rango de sus columnas (08:20 a 09:41) · ' + JSON.stringify({ te: te.estado, tf: tf.ts && hm(tf.ts), ht: C0.horasTarea.excavacion }));
    const cabE = await p.evaluate((s) => !!document.querySelector(s + ' .vim-cab'), T('excavacion'));
    c(!cabE, 'ya mandada: la cabecera no ofrece «Voy a iniciar»');
    const Cdb = await otC(p, true);
    c(((Cdb.pasosObra || {}).excavacion || {})['col 8'] && Cdb.pasosObra.excavacion['col 8'].min === 26 && Object.keys((Cdb.tareaInicio || {}).excavacion || {}).length === 1, 'en la base: los minutos de cada columna (Col 8 corregida a 26) y un solo inicio');
    c(errsJs(A).length === 0, 'sin errores (Juan)' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    c(await scrollX(p) <= 0, 'sin scroll de costado');
    await A.ctx.close();
  }
  if (ANTES) { await browser.close(); process.exit(c.fin() ? 1 : 0); }

  // ================================================================= 1) la cámara del teléfono (APK, plugin Camera)
  if (SOLO(1)) {
    const A = await sesion('juan', { antes: apk, antesArg: FOTO64 }); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:30'); await misTareas(p);
    await camFila(p, 'excavacion', 'Col 6'); await p.waitForTimeout(800);
    const car = await tx(p, '#viOv');
    c(/¿Arrancás con Pozo\?/i.test(car) && (await p.evaluate(() => window.__cam)) === 0, 'en la app de Android: el 📷 abre el cartel (la cámara del teléfono todavía no) · cámara ' + (await p.evaluate(() => window.__cam)));
    await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(300);
    await reloj(p, hoy, '08:58');
    await p.waitForFunction(() => Object.values(((ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {}).fotos || {}).some((f) => f.k === 'excavacion' && f.num === 'Col 6'), null, { timeout: 20000 }).catch(() => { });
    await p.waitForTimeout(1200);
    const C0 = await otC(p), f = Object.values(C0.fotos || {}).find((x) => x.k === 'excavacion' && x.num === 'Col 6'), ps = await pasos(p, 'excavacion');
    c((await p.evaluate(() => window.__cam)) === 1 && !!f && hm((((C0.tareaInicio || {}).excavacion || {})['juan perez'] || {}).ts) === '08:30', '«Voy a iniciar» → la cámara del teléfono (plugin Camera) una vez → la foto llega a la fila de la Col 6 (campo.fotos con su columna) · cámara ' + (await p.evaluate(() => window.__cam)));
    c(ps[0] === 'Col 6 08:30-08:58 28' && /Col 6 lista · 28 min/.test(await filaTxt(p, 'excavacion', 'Col 6')), 'la foto del teléfono marca el fin de la Col 6: 08:30–08:58 · 28 min, en la fila · ' + ps.join(' | '));
    await foto(p, '6_apk_camara', 'excavacion');
    c(errsJs(A).length === 0, 'sin errores (APK)' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 2) «Todavía no», la cabecera, otra tarea, la zanja
  if (SOLO(2)) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:30'); await misTareas(p);
    // «Todavía no»: la cámara se abre igual, sin anotar; el siguiente toque no pregunta
    await camFila(p, 'excavacion', 'Col 6'); await p.waitForTimeout(700);
    await p.click('#viOv .vi-no[data-vi="x"]'); await p.waitForTimeout(800);
    let C0 = await otC(p);
    c(!(await p.evaluate(() => !!document.getElementById('viOv'))) && (await p.evaluate(() => !!document.getElementById('emaCam'))) && !Object.keys(C0.tareaInicio || {}).length, '«Todavía no»: sigue con la foto (la cámara se abre) sin anotar el inicio');
    await cerrarCam(p);
    await camFila(p, 'excavacion', 'Col 6'); await p.waitForTimeout(700);
    c(!(await p.evaluate(() => !!document.getElementById('viOv'))), 'y no vuelve a preguntar enseguida por esa tarea');
    await cerrarCam(p);
    // ✕: cierra sin hacer nada
    // el botón de la cabecera (izaje): «▶ Voy a iniciar esta tarea» → cartel → anota y abre la cámara de la primera fila
    await verTarea(p, 'montaje_prfv');
    const cb = await tx(p, T('montaje_prfv') + ' .vim-cab');
    c(/Voy a iniciar esta tarea/i.test(cb), 'la cabecera de una tarea sin arrancar: «▶ Voy a iniciar esta tarea» · ' + cb);
    await foto(p, '7_cabecera', 'montaje_prfv');
    await reloj(p, hoy, '09:00');
    await p.click(T('montaje_prfv') + ' [data-vimt]'); await p.waitForTimeout(700);
    const car = await tx(p, '#viOv');
    c(/¿Arrancás con Izaje\?/i.test(car) && /Col 2 y 3/.test(car), 'el botón abre el cartel del izaje («Col 2 y 3») · ' + car.slice(0, 100));
    // ✕ no hace nada
    await p.click('#viOv .v7-x[data-vi="x"]'); await p.waitForTimeout(400);
    c(!(await p.evaluate(() => !!document.getElementById('viOv') || !!document.getElementById('emaCam'))) && !Object.keys((await otC(p)).tareaInicio || {}).length, '✕ cierra el cartel sin anotar ni abrir la cámara');
    await p.click(T('montaje_prfv') + ' [data-vimt]'); await p.waitForTimeout(600);
    await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(1500);
    C0 = await otC(p);
    c(hm((((C0.tareaInicio || {}).montaje_prfv || {})['juan perez'] || {}).ts) === '09:00' && (await p.evaluate(() => !!document.getElementById('emaCam'))), '«Voy a iniciar» de la cabecera: anota el izaje (09:00) y abre la cámara de su primera columna');
    await cerrarCam(p); await p.waitForTimeout(500);
    c(/En marcha desde 09:00/.test(await tx(p, T('montaje_prfv') + ' .vim-cab')), 'y la cabecera pasa a «▶ En marcha desde 09:00»');
    // «¿Es otra tarea?» → Zanja (está en la orden): arranca la zanja y pasa a esa tarjeta
    await verTarea(p, 'excavacion');
    await reloj(p, hoy, '10:00');
    await p.evaluate(() => { window.__inicioMt.estado(); });
    await p.evaluate(() => { const o = ordenesTrabajo.find((x) => x.id === 'ot165'); });
    await verTarea(p, 'zanjeo');
    const hayCab = await tx(p, T('zanjeo') + ' .vim-cab');
    await p.click(T('zanjeo') + ' [data-vimt]').catch(() => { }); await p.waitForTimeout(600);
    await p.click('#viOv [data-vi="otra"]').catch(() => { }); await p.waitForTimeout(400);
    await p.click('#viOv [data-vi="tk"][data-k="zanjeo"]').catch(() => { }); await p.waitForTimeout(300);
    await p.click('#viOv [data-vi="iniciar"]').catch(() => { }); await p.waitForTimeout(1500);
    await cerrarCam(p);
    C0 = await otC(p);
    c(/Voy a iniciar/i.test(hayCab) && hm((((C0.tareaInicio || {}).zanjeo || {})['juan perez'] || {}).ts) === '10:00' && (C0.horasTarea || {}).zanjeo && C0.horasTarea.zanjeo.ini === '10:00', 'la zanja (sin columnas): «Voy a iniciar» (pasando por «¿Es otra tarea?» → Zanja) deja tareaInicio y la hora de inicio de la tarea (10:00) · ' + JSON.stringify((C0.horasTarea || {}).zanjeo));
    // la zanja: se hizo 10 m, foto, mandar a las 10:30 → récord por metro (sus de antes: 40, 38, 45 min)
    await p.click(T('zanjeo') + ' [data-m="si"]').catch(() => { }); await p.waitForTimeout(600);
    await p.evaluate((s) => { const i = document.querySelector(s + ' .mt-cant, ' + s + ' input[type="number"]'); if (i) { i.value = '10'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); } }, T('zanjeo')); await p.waitForTimeout(500);
    const tomas = await p.evaluate((s) => [...new Set([...document.querySelectorAll(s + ' input.mt-foto-t')].filter((x) => x.dataset.fli !== 'x' && x.dataset.fln).map((x) => x.dataset.fln))], T('zanjeo'));
    for (const n of tomas) await filaInput(p, 'zanjeo', n);
    const cantZ = await p.evaluate(() => ((((ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {}).marcas || {}).zanjeo || {}).cant);
    console.log('   tomas de la zanja: ' + tomas.join(', ') + ' · cant ' + cantZ);
    await reloj(p, hoy, '10:30');
    await p.click(T('zanjeo') + ' [data-et="si"]').catch(() => { }); await p.waitForTimeout(800);
    const etZ = await p.evaluate(() => ({ ini: (document.getElementById('etIni') || {}).value, tx: ((document.getElementById('etPop') || {}).textContent || '').replace(/\s+/g, ' ') }));
    c(etZ.ini === '10:00', '«Se hizo · mandar» de la zanja: la hora de inicio ya viene de «Voy a iniciar» (10:00) · ' + JSON.stringify(etZ.ini));
    await p.evaluate(() => { const f = document.getElementById('etFin'); if (f) { f.value = '10:30'; f.dispatchEvent(new Event('input', { bubbles: true })); } });
    await p.click('#etPop [data-etp="enviar"]').catch(() => { }); await p.waitForTimeout(2600);
    const R0 = await recs(p);
    c(R0.some((r) => /🔥 ¡Récord tuyo! · 10 m(etros)? de zanj/i.test(r) || /¡Récord tuyo! · 10 .* en 30 min/.test(r)), 'al mandar la zanja (10 m en 30 min; antes 38–45): «🔥 ¡Récord tuyo!» · ' + R0.join(' | '));
    await foto(p, '8_record_zanja');
    c(errsJs(A).length === 0, 'sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 3) compatibilidad: __v166No
  if (SOLO(3)) {
    const A = await sesion('juan', { v166: false }); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:20'); await misTareas(p);
    await camFila(p, 'excavacion', 'Col 6'); await p.waitForTimeout(800);
    const r = await p.evaluate(() => ({ cartel: !!document.getElementById('viOv'), cam: !!document.getElementById('emaCam') }));
    await cerrarCam(p);
    await reloj(p, hoy, '08:44'); await filaInput(p, 'excavacion', 'Col 6'); await p.waitForTimeout(600);
    const f6 = await filaTxt(p, 'excavacion', 'Col 6');
    c(!r.cartel && r.cam && !(await p.$(T('excavacion') + ' .vim-cab')) && !/lista ·/.test(f6) && !(await recs(p)).length, '__v166No: Mis tareas como la v165 (el 📷 abre la cámara, sin cabecera ni tiempo en la fila ni récord) · ' + JSON.stringify(r) + ' · ' + f6);
    await A.ctx.close();
  }

  // ================================================================= 4) que no se tilde (CPU ×6)
  if (SOLO(4)) {
    const med = {};
    const M = { v165: [], v166: [] };
    for (const v of [false, true, false, true, false, true]) {
      const A = await sesion('juan', { v166: v, antes: () => { window.__lt = []; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push({ t: e.startTime, d: Math.round(e.duration) }))).observe({ entryTypes: ['longtask'] }); } catch (e) { } } }, null, 6);
      const p = A.page, hoy = await hoyDe(p);
      await reloj(p, hoy, '08:20'); await p.waitForTimeout(1500);
      const t0 = await p.evaluate(() => performance.now());
      await misTareas(p); await p.waitForTimeout(1500);
      const t1 = await p.evaluate(() => performance.now());
      await camFila(p, 'excavacion', 'Col 6'); await p.waitForTimeout(1500);
      const t2 = await p.evaluate(() => performance.now());
      const lt = await p.evaluate(() => window.__lt.slice());
      M[v ? 'v166' : 'v165'].push({ abrir: Math.max(0, ...lt.filter((x) => x.t >= t0 && x.t < t1).map((x) => x.d)), toque: Math.max(0, ...lt.filter((x) => x.t >= t1 && x.t < t2).map((x) => x.d)), cartel: await p.evaluate(() => !!document.getElementById('viOv')) });
      await A.ctx.close();
    }
    const md = (l) => l.slice().sort((a, b) => a - b)[Math.floor(l.length / 2)];
    ['v165', 'v166'].forEach((v) => { med[v] = { abrir: md(M[v].map((x) => x.abrir)), toque: md(M[v].map((x) => x.toque)), cartel: M[v].every((x) => x.cartel), todas: M[v] }; });
    console.log('MEDIDAS', JSON.stringify(med));
    c(med.v166.cartel && med.v166.toque <= Math.max(200, med.v165.toque + 30) && med.v166.abrir <= med.v165.abrir + 120, 'CPU ×6 (mediana de 3): tocar el 📷 → el cartel sin tareas largas nuevas (v166 ' + med.v166.toque + ' ms contra la cámara de la v165 ' + med.v165.toque + ' ms) y abrir Mis tareas igual (v166 ' + med.v166.abrir + ' ms · v165 ' + med.v165.abrir + ' ms; tarea más larga)');
  }
  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
