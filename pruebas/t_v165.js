// v165 · La cuadrilla: «▶ Voy a iniciar esta tarea», cámara primero (opción C), otra tarea rápido, récords y columnas en la orden.
// Juan (cuadrilla) siempre en el celu (CPU ×4); la oficina (Lucía) en la compu o en el celu según el modo.
//  0) cartel «Voy a iniciar» → la hora exacta en la orden (de Juan y de Pedro: el compañero no ve el cartel y no duplica) → la
//     cámara C (píldora, reloj, «Col ▾», miniaturas, «Terminé») → 3 fotos seguidas sin cerrar la cámara → el tiempo de cada
//     columna → «Listo, mandar» → la que sigue (izaje) con su «Voy a iniciar»: sin récord en izaje.
//  1) otra tarea: con el botón (Hormigón, no estaba en la orden), escrita con sugerencia (Poda de árbol) y tal cual («Reparar
//     tapa»); las fotos llevan ese nombre; la oficina la ve como «hecho de más» en el cierre, el «📸 Avance» y la verificación y la
//     suma con «＋» (o la descarta).
//  2) récords: con 3 tiempos previos más lentos → «🔥 ¡Récord tuyo!»; «👍 Estuviste bien»; «⭐ Todas las fotos bien hoy»; la falla
//     marcada por la oficina borra el récord; «🔥 Mis récords» en ⭐ Mis puntos; la oficina en 🧠 › ⏱.
//  3) Llenar orden con las columnas del cálculo (hechas, en otra orden, fraguando, «Las que siguen»), la orden guarda
//     ot.columnas, la sugerida/el asistente (llenarCols), la planilla y el avance nuevo usan esos nombres; PAT en dos hitos.
//  4) compatibilidad (__v165No): Modo obra como antes (sin cartel), PAT de antes, sin chips.
//  5) nada nuevo para la oficina en Modo obra; Mis tareas clásica sigue andando.
const fs = require('fs');
const { abrir, prueba } = require('./h');
const { datos165 } = require('./datos165');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const camaraFalsa = () => {
  const dib = (c) => { const x = c.getContext('2d'), w = c.width, h = c.height; const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9cc3e6'); g.addColorStop(0.62, '#d8e8f4'); g.addColorStop(0.62, '#8c8c74'); g.addColorStop(1, '#6f6f5c'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#e9edf2'; x.fillRect(w * 0.47, h * 0.12, w * 0.05, h * 0.62); };
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => { const c = document.createElement('canvas'); c.width = 720; c.height = 1280; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
};
(async () => {
  const c = prueba('v165' + (cel ? ' cel' : ''));
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v165: true, reglas: !!process.env.REGLAS, antes: camaraFalsa };
  let browser = null;
  const sesion = async (quien, op, datos) => {
    const A = await abrir(Object.assign({ sesion: quien, datos: datos || datos165(), browser, espera: 4500 }, MOD, { cel: quien === 'lucia' ? cel : true }, op || {})); browser = A.browser;
    A.page.on('dialog', (x) => x.accept());
    await A.ctx.grantPermissions(['geolocation', 'camera'], { origin: 'https://app.test' }); await A.ctx.setGeolocation({ latitude: -31.4273, longitude: -64.1889, accuracy: 8 });
    await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }));
    if (quien !== 'lucia' && !(op && op.sinCpu)) { const cdp = await A.ctx.newCDPSession(A.page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
    await A.page.waitForTimeout(800); return A;
  };
  const otra = async (A, quien) => { const B = await abrir(Object.assign({ sesion: quien, browser: A.browser, ctx: A.ctx, espera: 4500 }, MOD, { cel: true })); B.page.on('dialog', (x) => x.accept()); return B; };
  const foto = async (p, n) => { if (!CAP) return; fs.mkdirSync(CAP, { recursive: true }); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + n + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const hoyDe = (p) => p.evaluate(() => fechaAISO(new Date()));
  const reloj = (p, hoy, hm) => p.evaluate(([d, h]) => { window.__tcAhora = () => new Date(d + 'T' + h + ':00').getTime(); }, [hoy, hm]);
  const tx = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const otC = (p, id) => p.evaluate((id) => JSON.parse(JSON.stringify((ordenesTrabajo.find((x) => x.id === id) || {}).campo || {})), id || 'ot165');
  const modoObra = async (p) => { await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(600); await p.evaluate(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(900); };
  const tiro = async (p, hoy, hm) => { await reloj(p, hoy, hm); await p.click('#emaCam [data-ec="disparar"]'); await p.waitForFunction(() => !document.querySelector('#ecVista:not([hidden])'), null, { timeout: 6000 }).catch(() => { }); await p.waitForTimeout(2200); };
  const recs = (p) => p.evaluate(() => window.__inicioTarea.estado().recs.map((r) => r.em + ' ' + r.t + ' · ' + (r.r1 || '') + ' · ' + (r.r2 || '') + (r.r3 ? ' · ' + r.r3 : '')));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  // la base de Juan pasa a la oficina (otra compu)
  const baseDe = async (p) => { const db = await p.evaluate(() => JSON.parse(JSON.stringify(window.__stubDB()))); const d = datos165(); d.db = db; return d; };

  // ================================================================= 0) «Voy a iniciar» → cámara C → Terminé → Listo, mandar → la que sigue
  let base0 = null;
  if (SOLO(0) || SOLO(1) || SOLO(2)) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:20'); await modoObra(p);
    await foto(p, '0_modo_obra');
    await p.click('#cdApp [data-cd="boton"]'); await p.waitForTimeout(700);
    const car = await tx(p, '#viOv');
    const dlg = await p.evaluate(() => { const v = document.getElementById('viOv'); return !!v && v.getAttribute('role') === 'dialog' && v.classList.contains('v7-ov') && !!v.querySelector('[aria-label="Cerrar"]'); });
    c(dlg && /¿Arrancás con Pozo\?/i.test(car) && /Col 6, 7 y 8/.test(car) && /PLAZA LOS ÁLAMOS/.test(car) && /con Pedro/.test(car) && /VOY A INICIAR/i.test(car) && /Todavía no/.test(car) && /queda anotada \(08:20\)/.test(car), 'el botón de Modo obra abre el cartel grande (.v7-ov, role=dialog, ✕): «¿Arrancás con POZO?», «Col 6, 7 y 8 · PLAZA LOS ÁLAMOS · con Pedro» (las columnas de la orden), «▶ VOY A INICIAR», «Todavía no» · ' + car.slice(0, 160));
    c(!(await p.evaluate(() => !!document.getElementById('emaCam'))), 'mientras el cartel está, la cámara no se abre');
    await foto(p, '1_iniciar');
    await p.click('#viOv [data-vi="x"]'); await p.waitForTimeout(400);
    c(!(await p.evaluate(() => !!document.getElementById('viOv'))) && !Object.keys((await otC(p)).tareaInicio || {}).length, '«Todavía no» / ✕: no anota nada');
    await p.click('#cdApp [data-cd="boton"]'); await p.waitForTimeout(600);
    await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(1800);
    let C0 = await otC(p);
    const ti = ((C0.tareaInicio || {}).excavacion || {})['juan perez'] || {}, ci = ((C0.colInicio || {}).excavacion || {})['col 6'] || {};
    const hm = (t) => new Date(t).toTimeString().slice(0, 5);
    c(hm(ti.ts) === '08:20' && ti.por === 'Juan Pérez' && (ti.gente || []).length === 2 && ti.lat != null && hm(ci.ts) === '08:20' && ci.num === 'Col 6', '«Voy a iniciar»: campo.tareaInicio.excavacion.juan perez 08:20 (con la gente y el GPS) y campo.colInicio de la Col 6 · ' + JSON.stringify({ ti: hm(ti.ts), ci: hm(ci.ts), gps: ti.lat }));
    const cam = await p.evaluate(() => { const e = document.getElementById('emaCam'); return e ? { on: e.classList.contains('vi-on'), pill: (document.getElementById('viPill') || {}).textContent, reloj: !!document.getElementById('viReloj'), term: !!e.querySelector('[data-vi="termine"]'), col: (e.querySelector('.fn-nt b') || {}).textContent || (document.getElementById('viColB') || {}).textContent, seguir: document.getElementById('cdFotoIn').dataset.ecSeguir, rafaga: document.getElementById('cdFotoIn').dataset.ecRafaga } : null; });
    c(cam && cam.on && /LOS ÁLAMOS · Pozo/.test(cam.pill) && /a \d+ m/.test(cam.pill) && cam.reloj && cam.term && /Col 6/.test(cam.col || '') && (cam.seguir === '1' || cam.rafaga === '1'), 'enseguida la cámara de la app (opción C): píldora «PLAZA LOS ÁLAMOS · Pozo · a N m», reloj de la tarea, «Col 6», «✓ Terminé la tarea» · ' + JSON.stringify(cam));
    await reloj(p, hoy, '08:21'); await p.waitForTimeout(1300);
    c(/^1:00$|^0:59$|^1:0\d$/.test(await tx(p, '#viReloj')), 'el reloj de la tarea corre (08:20 → 08:21: «1:00») · ' + await tx(p, '#viReloj'));
    await foto(p, 'C_camara');
    // Pedro (el compañero): no ve el cartel; su toque va directo a la cámara; no duplica
    const B = await otra(A, 'pedro'); const q = B.page;
    await reloj(q, hoy, '08:25'); await modoObra(q); await q.waitForTimeout(800);
    await q.click('#cdApp [data-cd="boton"]'); await q.waitForTimeout(1200);
    const pd = await q.evaluate(() => ({ cartel: !!document.getElementById('viOv'), cam: !!document.getElementById('emaCam'), marcha: (document.querySelector('.vi-marcha') || {}).textContent || '' }));
    const C1 = await otC(q);
    c(!pd.cartel && pd.cam && Object.keys((C1.tareaInicio || {}).excavacion || {}).length === 1 && hm(((C1.colInicio || {}).excavacion || {})['col 6'].ts) === '08:20', 'Pedro: la tarea ya está iniciada por Juan: sin cartel, a la cámara; el inicio sigue en 08:20 (una sola entrada) · ' + JSON.stringify(pd));
    await q.evaluate(() => window.camaraApp.cerrar()); await q.waitForTimeout(500);
    const mq = await tx(q, '.vi-marcha');
    c(/en marcha desde 08:20/.test(mq) && /Volver a la cámara/.test(mq) && /Terminé la tarea/.test(mq), 'Pedro sale de la cámara a Modo obra: «▶ Pozo en marcha desde 08:20 · inició Juan», «📷 Volver a la cámara», «✓ Terminé la tarea» · ' + mq);
    await q.close();
    // 3 fotos seguidas sin cerrar la cámara
    await tiro(p, hoy, '08:44');
    let e1 = await p.evaluate(() => ({ cam: !!document.getElementById('emaCam'), hoja: !!document.getElementById('cdHoja'), col: (document.querySelector('#emaCam .fn-nt b') || {}).textContent || (document.getElementById('viColB') || {}).textContent || document.getElementById('cdFotoIn').dataset.fln, th: document.querySelectorAll('#viThumbs .vi-th').length }));
    c(e1.cam && !e1.hoja && /Col 7/.test(e1.col) && e1.th === 1, 'la foto de la Col 6 no cierra la cámara: pasa sola a la Col 7, la miniatura aparece (sin la hoja «Foto guardada») · ' + JSON.stringify(e1));
    let R0 = await recs(p);
    c(R0.some((r) => /🔥 ¡Récord tuyo! · Col 6 en 24 min · Tu mejor era 30 min/.test(r)), 'récord personal: «🔥 ¡Récord tuyo! Col 6 en 24 min · Tu mejor era 30 min» (3 o más tiempos previos de Juan de a 2, más lentos) · ' + R0.join(' | '));
    const rs = await p.evaluate(() => { const v = document.getElementById('viRec'); return v ? { role: v.getAttribute('role'), pe: getComputedStyle(v).pointerEvents, oculto: v.hidden } : null; });
    c(rs && rs.role === 'status' && rs.pe === 'none', 'el cartelito es role=status y no frena (no toma los toques) · ' + JSON.stringify(rs));
    await foto(p, '6_record');
    await tiro(p, hoy, '09:10'); await tiro(p, hoy, '09:41');
    C0 = await otC(p);
    const pas = Object.values(C0.pasosObra.excavacion || {}).sort((a, b) => a.finTs - b.finTs).map((x) => x.num + ' ' + x.ini + '-' + x.fin + ' ' + x.min);
    c(pas.join(' | ') === 'Col 6 08:20-08:44 24 | Col 7 08:44-09:10 26 | Col 8 09:10-09:41 31', 'el tiempo de cada columna: Col 6 08:20–08:44 (24, desde «Voy a iniciar»), Col 7 26, Col 8 31 · ' + pas.join(' | '));
    R0 = await recs(p);
    c(R0.some((r) => /👍 Estuviste bien · Col 7 en 26 min/.test(r)) && !R0.some((r) => /Col 8/.test(r)), '«👍 Estuviste bien» cerca del mejor (Col 7, 26 min) y nada en la Col 8 (31 min) · ' + R0.join(' | '));
    await foto(p, 'C_camara_fotos');
    // «Col ▾»: la lista de columnas en la cámara
    await p.evaluate(() => { const b = document.querySelector('#emaCam [data-vi="cols"]'); b && b.click(); }); await p.waitForTimeout(400);
    const lc = await tx(p, '#viCols');
    c(/De tu orden/.test(lc) && /Col 6\s*lista · 24 min/.test(lc) && /Otras de la obra/.test(lc) && /Col 5/.test(lc), '«Col ▾» abre la lista: las de su orden con su estado («Col 6 lista · 24 min») y «Otras de la obra» · ' + lc.slice(0, 160));
    await foto(p, '8_camara_columnas');
    await p.evaluate(() => { const b = [...document.querySelectorAll('#viCols [data-vi="col"]')].find((x) => x.dataset.n === 'Col 5'); b && b.click(); }); await p.waitForTimeout(300);
    c((await p.evaluate(() => document.getElementById('cdFotoIn').dataset.fln)) === 'Col 5' && !(await p.evaluate(() => !!document.getElementById('viCols'))), 'elegir «Col 5» de la lista: la foto siguiente dice Col 5');
    // Terminé → la hoja con el tiempo de cada columna
    await reloj(p, hoy, '09:42');
    await p.click('#emaCam [data-vi="termine"]'); await p.waitForTimeout(900);
    const fin = await tx(p, '#viFin');
    c(!(await p.evaluate(() => !!document.getElementById('emaCam'))) && /Tarea 1 de 3 · terminada/i.test(fin) && /Pozo · 1 h 22 min/.test(fin) && /08:20 → 09:42/.test(fin) && /Col 6\s*08:20–08:44 · 24′/.test(fin) && /Listo, mandar/i.test(fin) && /Sigue\s*Tarea 2 · Izaje · Col 2 y 3/i.test(fin) && /Voy a iniciar esta tarea/.test(fin), '«✓ Terminé la tarea»: cierra la cámara y muestra «Pozo · 1 h 22 min», «08:20 → 09:42 · con Pedro», cada columna con su tiempo, «Listo, mandar» y «Sigue: Tarea 2 · Izaje · Col 2 y 3» · ' + fin.slice(0, 220));
    await p.click('#viFin [data-vi="aj"][data-n="Col 8"][data-d="-5"]'); await p.waitForTimeout(500);
    c(/Col 8\s*09:15–09:41 · 26′/.test(await tx(p, '#viFin')), 'corregir con + : la Col 8 empezó 5 min después (09:15–09:41 · 26′)');
    await foto(p, '2_terminar');
    // Listo, mandar con la que sigue: el izaje arranca y la cámara se abre
    await reloj(p, hoy, '09:45');
    await p.click('#viFin [data-vi="sigue"]'); await p.waitForTimeout(1800);
    C0 = await otC(p);
    const env = ((C0.tareaEnv || {}).excavacion || {})['Juan Pérez'] || {}, mk = (C0.marcas || {}).excavacion || {};
    c(env.estado === 'si' && mk.hecho && mk.cant === 3 && hm((((C0.tareaFin || {}).excavacion || {})['juan perez'] || {}).ts) === '09:45', '«Voy a iniciar esta tarea» de la que sigue manda la tarea (3 hechas, terminada 09:45)…');
    const ti2 = (((C0.tareaInicio || {}).montaje_prfv || {})['juan perez'] || {});
    c(hm(ti2.ts) === '09:45' && (await p.evaluate(() => !!document.getElementById('emaCam'))) && /Izaje/.test(await tx(p, '#viPill')), '… y arranca el izaje (09:45) con la cámara abierta («· Izaje»)');
    await tiro(p, hoy, '10:05');
    R0 = await recs(p);
    c(!R0.some((r) => /Izaje|Col 2/.test(r)) && (await p.evaluate(() => window.__inicioTarea.riesgo('montaje_prfv') && !window.__inicioTarea.riesgo('excavacion'))), 'sin récord en el izaje (tarea de riesgo: Col 2 en 20 min, sus tiempos de antes eran 48–55) · ' + R0.length);
    await p.evaluate(() => window.camaraApp.cerrar()); await p.waitForTimeout(500);
    c(errsJs(A).length === 0, 'sin errores (Juan)' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    c(await scrollX(p) <= 0, 'sin scroll de costado');

    // ================================================================= 1) otra tarea
    if (SOLO(1)) {
      await reloj(p, hoy, '10:30');
      await p.evaluate(() => window.__inicioTarea.cartel()); await p.waitForTimeout(500);
      await p.click('#viOv [data-vi="otra"]'); await p.waitForTimeout(400);
      const g = await tx(p, '#viOv');
      c(['Pozo', 'Hormigón', 'Izaje', 'Vínculo', 'Artefacto', 'Tablerito', 'Tablero', 'PAT', 'Zanja'].every((x) => g.indexOf(x) >= 0) && /Otra: escribila o decila/.test(g), '«¿Es otra tarea?»: los 9 botones grandes (Pozo, Hormigón, Izaje, Vínculo, Artefacto, Tablerito, Tablero, PAT, Zanja) y «✏ Otra: escribila o decila 🎤»');
      await p.click('#viOv [data-vi="tk"][data-k="hormigonado"]'); await p.waitForTimeout(400);
      c(/VOY A INICIAR · Hormigón/i.test(await tx(p, '#viOv')) && /No estaba en la orden/.test(await tx(p, '#viOv')), 'tocar «Hormigón» (no está en la orden): «▶ VOY A INICIAR · HORMIGÓN» y «No estaba en la orden: la oficina lo ve…»');
      await foto(p, '3_otra_tarea');
      await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(1500);
      C0 = await otC(p);
      let exs = Object.entries(C0.extras || {});
      c(exs.length === 1 && exs[0][1].k === 'hormigonado' && exs[0][1].texto && hm(exs[0][1].ts) === '10:30' && (await p.evaluate(() => !!document.getElementById('emaCam'))) && /Hormig/.test(await tx(p, '#viPill')), 'la tarea agregada va a campo.extras (k hormigonado, 10:30) y la cámara se abre con su nombre · ' + JSON.stringify(exs.map((x) => x[1].texto)));
      await reloj(p, hoy, '10:50'); await p.click('#emaCam [data-ec="disparar"]'); await p.waitForTimeout(3500);
      await p.waitForFunction(() => Object.values(((ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {}).fotos || {}).some((f) => f.extra), null, { timeout: 15000 }).catch(() => { });
      C0 = await otC(p);
      const fx = Object.values(C0.fotos || {}).find((f) => f.extra === exs[0][0]);
      c(!!fx && /Hormig/.test(fx.tarea || ''), 'la foto lleva el nombre de la tarea agregada (campo.fotos con extra) · ' + JSON.stringify(fx && { tarea: fx.tarea, extra: fx.extra }));
      await p.click('#emaCam [data-vi="termine"]'); await p.waitForTimeout(800);
      await p.click('#viFin [data-vi="cant"][data-d="1"]'); await p.waitForTimeout(300);
      c(/Tarea agregada/i.test(await tx(p, '#viFin')) && /2/.test(await tx(p, '#viFin code')), '«Terminé»: la hoja de la tarea agregada con «¿Cuántas hicieron?» (− / +)');
      await p.click('#viFin [data-vi="mandar"]'); await p.waitForTimeout(800);
      C0 = await otC(p); exs = Object.entries(C0.extras || {});
      c(exs[0][1].fin && exs[0][1].cant === 2, '«Listo, mandar»: la agregada queda con fin y cantidad 2');
      // escrita: sugerencia y tal cual
      await p.evaluate(() => window.__inicioTarea.cartel()); await p.waitForTimeout(400);
      await p.click('#viOv [data-vi="otra"]'); await p.waitForTimeout(300);
      await p.click('#viOv [data-vi="escribir"]'); await p.waitForTimeout(300);
      await p.type('#viQ', 'pod', { delay: 40 }); await p.waitForTimeout(300);
      const sg = await tx(p, '#viSug');
      c(/Poda de árbol\s*de la lista/.test(sg) && /Usar «pod» tal cual lo escribí/.test(sg) && (await p.evaluate(() => !!document.querySelector('#viOv [data-vi="mic"]'))), '«Otra»: con 3 letras sugiere del catálogo («Poda de árbol · de la lista»), «＋ Usar «pod» tal cual lo escribí» y el 🎤 · ' + sg);
      await foto(p, '4_escribir');
      await p.click('#viSug [data-vi="sug"]'); await p.waitForTimeout(400);
      c(/VOY A INICIAR · Poda/i.test(await tx(p, '#viOv')), 'elegida la sugerencia: «▶ VOY A INICIAR · PODA»');
      await p.click('#viOv [data-vi="otra"]').catch(() => { }); await p.waitForTimeout(100);
      await p.evaluate(() => window.__inicioTarea.cartel()); await p.waitForTimeout(300);
      await p.click('#viOv [data-vi="otra"]'); await p.waitForTimeout(300);
      await p.click('#viOv [data-vi="escribir"]'); await p.waitForTimeout(300);
      const ul = await tx(p, '.vi-ult');
      c(/Poda de árbol/.test(ul), 'las últimas que usaron (en este celu): «Poda de árbol» · ' + ul);
      await p.type('#viQ', 'reparar tapa', { delay: 20 }); await p.waitForTimeout(300);
      await p.click('#viSug [data-vi="tal"]'); await p.waitForTimeout(300);
      await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(1300);
      C0 = await otC(p); exs = Object.entries(C0.extras || {});
      const rt = exs.find((x) => /Reparar tapa/.test(x[1].texto));
      c(!!rt && rt[1].k === '' && /Reparar tapa/.test(await tx(p, '#viPill')), '«tal cual»: la tarea «Reparar tapa» (sin código) va a campo.extras y a la cámara');
      await foto(p, '5_camara_otro');
      await p.evaluate(() => window.camaraApp.cerrar()); await p.waitForTimeout(400);
      base0 = await baseDe(p);
      // la oficina: «hecho de más» en el cierre y la verificación; «＋ Sumar»
      const L = await sesion('lucia', {}, base0); const o = L.page;
      await o.evaluate(() => { mostrarVista('parte'); }); await o.waitForTimeout(800);
      await o.evaluate(() => abrirCierreOt('ot165')); await o.waitForTimeout(1500);
      const ci2 = await tx(o, '.vi-of:not([style])');
      c(/Hecho de más · no estaba en la orden/.test(ci2) && /Hormigón|Hormigonado/i.test(ci2) && /Reparar tapa\s*\(escrita a mano\)/.test(ci2) && /1 foto/.test(ci2) && /Sumar a la orden/.test(ci2) && /Descartar/.test(ci2), 'la oficina en el cierre: «➕ Hecho de más · no estaba en la orden» (Hormigonado con su foto, «Reparar tapa (escrita a mano)») con «＋ Sumar a la orden» / «✕ Descartar» · ' + ci2.slice(0, 200));
      c(/«Voy a iniciar» de la cuadrilla/.test(await tx(o, '#cierreOt, body')) && /Pozo: inició 08:20 · terminó 09:45/.test(await tx(o, 'body')), '… y «▶ «Voy a iniciar» de la cuadrilla: Pozo: inició 08:20 · terminó 09:45 (1 h 25 min) · Juan»');
      const vt = await o.evaluate(() => window.__verifOt.texto('ot165'));
      c(/hecho de más \(no estaba en la orden\): .*Hormig/i.test(vt), 'la verificación (v150) lo dice: «hecho de más (no estaba en la orden): …» · ' + vt.slice(0, 120));
      await foto(o, 'oficina_hecho_de_mas');
      const exH = base0.db.ordenesTrabajo.ot165.campo.extras; const idH = Object.keys(exH).find((q) => exH[q].k === 'hormigonado');
      await o.evaluate((id) => { const b = document.querySelector('[data-visumar="ot165"][data-ex="' + id + '"]'); b && b.click(); }, idH); await o.waitForTimeout(2200);
      const ot2 = await o.evaluate(() => JSON.parse(JSON.stringify(window.__stubDB().ordenesTrabajo.ot165)));
      c(ot2.actividades.indexOf('hormigonado') >= 0 && ot2.previsto.hormigonado === 2 && ot2.campo.extras[idH].sumado && Object.values(ot2.campo.fotos).some((f) => f.extra === idH && f.k === 'hormigonado'), '«＋ Sumar a la orden»: la tarea entra a la orden (hormigonado × 2), su foto pasa a esa tarea y queda «sumada» · ' + JSON.stringify(ot2.actividades));
      const idR = Object.keys(exH).find((q) => /Reparar/.test(exH[q].texto));
      await o.evaluate(() => abrirCierreOt('ot165')); await o.waitForTimeout(1200);
      await o.evaluate((id) => { const b = document.querySelector('[data-videsc="ot165"][data-ex="' + id + '"]'); b && b.click(); }, idR); await o.waitForTimeout(1200);
      c(!!(await o.evaluate((id) => window.__stubDB().ordenesTrabajo.ot165.campo.extras[id].descartado, idR)), '«✕ Descartar» la deja descartada (no se borra)');
      c(errsJs(L).length === 0, 'sin errores (oficina)' + (errsJs(L).length ? ': ' + errsJs(L).slice(0, 2).join(' | ') : ''));
      await L.ctx.close();
    }

    // ================================================================= 2) récords: Mis récords, todas las fotos bien, la falla lo borra
    if (SOLO(2)) {
      await p.waitForTimeout(2500);
      c(await p.evaluate(() => window.__inicioTarea.fotosBienHoy()), '«⭐ Todas las fotos bien hoy»: con su columna, su hora y en la obra');
      await p.evaluate(() => { try { localStorage.removeItem('ema.vi.felic'); } catch (e) { } window.__inicioTarea.felicitar(ordenesTrabajo.find((o) => o.id === 'ot165'), null); }); await p.waitForTimeout(300);
      const fz = await tx(p, '#viRec');
      c(/Todas las fotos bien hoy/.test(fz) || /Todas las fotos bien hoy/.test((await recs(p)).join(' ')), 'la felicitación de lo bien hecho sale en el cartelito · ' + fz);
      await p.evaluate(() => window.__cuadrillaDia.ir('puntos')); await p.waitForTimeout(800);
      const mr = await tx(p, '.vi-recs');
      c(/Mis récords/.test(mr) && /Pozo/.test(mr) && /24 min por columna/.test(mr) && !/Izaje/.test(mr), '⭐ Mis puntos › «🔥 Mis récords»: Pozo · tu mejor 24 min por columna (sin izaje) · ' + mr.slice(0, 160));
      await foto(p, '6_mis_records');
      const db2 = await baseDe(p);
      const L = await sesion('lucia', {}, db2); const o = L.page;
      const r0 = await o.evaluate(() => window.__inicioTarea.recordsDe('Juan Pérez').map((x) => x.tarea + ' ' + x.mejor));
      const ap = await o.evaluate(() => window.__tiempoCol.aprendeHtml());
      c(/Récords de cada uno/.test(ap) && /Juan Pérez/.test(ap) && /solo para mirar/.test(ap), 'la oficina: 🧠 › ⏱ «🔥 Récords de cada uno» (solo mirar)');
      await o.evaluate(() => { const P = window.__av2.planMarcar({ obra: 'p1', columnas: ['Col 6'], pasos: ['pozo'], accion: 'falla', motivo: 'se desmoronó' }); return window.__av2.aplicar(P, 'se desmoronó'); }); await o.waitForTimeout(1500);
      const r1 = await o.evaluate(() => window.__inicioTarea.recordsDe('Juan Pérez').map((x) => x.tarea + ' ' + x.mejor));
      c(r0.some((x) => /Pozo 24/.test(x)) && r1.some((x) => /Pozo 26/.test(x)), 'la falla que marca la oficina en la Col 6 borra ese récord (Pozo: 24 → 26 min) · ' + r0.join(',') + ' → ' + r1.join(','));
      await L.ctx.close();
    }
    await A.ctx.close();
  }

  // ================================================================= 3) Llenar orden con las columnas; la orden; la planilla; PAT
  if (SOLO(3)) {
    const L = await sesion('lucia'); const o = L.page;
    await o.evaluate(() => { window.mostrarVista('parte'); window.irSubOrdenes('nueva'); }); await o.waitForTimeout(700);
    await o.evaluate(() => { try { window.__ordenNueva.elegirObra('p1'); } catch (e) { const s = document.getElementById('otPlaza'); s.value = 'p1'; s.dispatchEvent(new Event('change', { bubbles: true })); } }); await o.waitForTimeout(1500);
    await o.evaluate(() => { try { const k = document.getElementById('otActividades').closest('[data-paso]'); if (k) window.__ordenNueva.ir(+k.dataset.paso || k.dataset.paso); } catch (e) { } }); await o.waitForTimeout(500);
    await o.evaluate(() => { ['excavacion', 'montaje_prfv'].forEach((k) => { const cb = document.querySelector('#otActividades .ot-act-check[value="' + k + '"]'); if (cb && !cb.checked) cb.click(); }); }); await o.waitForTimeout(1600);
    const bx = await o.evaluate(() => { const g = (k) => { const b = document.querySelector('.cc-box[data-cck="' + k + '"]'); return b ? [...b.querySelectorAll('.cc-c')].map((x) => x.dataset.ccn + ':' + (x.className.replace('cc-c', '').trim() || 'libre')).join(',') : null; }; return { ex: g('excavacion'), iz: g('montaje_prfv') }; });
    c(bx.ex && /Col 1:hecha/.test(bx.ex) && /Col 4:hecha/.test(bx.ex) && /Col 5:libre/.test(bx.ex) && /Col 6:asig/.test(bx.ex) && /Col 8:asig/.test(bx.ex), 'Llenar orden › Excavación: chips con las columnas del cálculo: Col 1–4 hechas (tachadas), Col 6–8 ya en otra orden, Col 5 libre · ' + bx.ex);
    c(bx.iz && /Col 1:hecha/.test(bx.iz) && /Col 4:frag/.test(bx.iz) && /Col 2:asig/.test(bx.iz) && /Col 5:sinprev/.test(bx.iz), '… Izaje: Col 1 izada, Col 4 «fraguando (hasta …)», Col 2–3 en otra orden, Col 5+ sin el paso anterior · ' + bx.iz);
    await o.evaluate(() => document.querySelector('.cc-box[data-cck="montaje_prfv"]').scrollIntoView({ block: 'center' }));
    await foto(o, '7_orden_columnas');
    await o.evaluate(() => { document.querySelector('.cc-box[data-cck="excavacion"] [data-cca="sigue"]').click(); }); await o.waitForTimeout(500);
    const sel = await o.evaluate(() => ({ s: window.__inicioTarea.estado().sel.excavacion, v: document.querySelector('.ot-act-prev[data-id="excavacion"]').value, on: [...document.querySelectorAll('.cc-box[data-cck="excavacion"] .cc-c.on')].map((x) => x.dataset.ccn) }));
    c(JSON.stringify(sel.s) === '["Col 5"]' && sel.v === '1' && sel.on.join() === 'Col 5', '«Las que siguen»: elige la Col 5 (la única libre) y la cantidad queda en 1 · ' + JSON.stringify(sel));
    await o.evaluate(() => { const b = [...document.querySelectorAll('.cc-box[data-cck="excavacion"] .cc-c')].find((x) => x.dataset.ccn === 'Col 2'); b && b.click(); }); await o.waitForTimeout(300);
    c((await o.evaluate(() => window.__inicioTarea.estado().sel.excavacion.length)) === 1, 'una columna hecha no se puede elegir (deshabilitada)');
    const d = await o.evaluate(() => { try { document.getElementById('otCuadrilla').value = 'Cuadrilla 1'; } catch (e) { } const r = window.datosOtDesdeFormulario(); return r ? r.columnas : 'sin datos'; });
    c(d && JSON.stringify(d.excavacion) === '["Col 5"]', 'la orden guarda ot.columnas {excavacion: [Col 5]} · ' + JSON.stringify(d));
    const ll = await o.evaluate(() => { const ot = { plazaId: 'p1', actividades: ['excavacion', 'zanjeo'], previsto: { excavacion: 1, zanjeo: 10 } }; window.__inicioTarea.llenarCols(ot); return ot.columnas; });
    c(ll && JSON.stringify(ll.excavacion) === '["Col 5"]' && !ll.zanjeo, 'la sugerida y el asistente (al emitir, sin elegir): «las que siguen» (Col 5); la zanja no lleva columnas · ' + JSON.stringify(ll));
    const as = await o.evaluate(() => { const E = window.__av2.estado('p1'), L = E.L; const a = (i) => !!(E.R['pozo|' + i] || {}).asig; return L.cols.map((c, i) => c.num + ':' + (a(i) ? 'asig' : E.R['pozo|' + i].e)).join(','); });
    c(/Col 5:falta/.test(as) && /Col 6:asig/.test(as) && /Col 8:asig/.test(as), 'el avance nuevo pone lo asignado en las columnas elegidas (Col 6–8), no en «las siguientes que faltan» (Col 5) · ' + as);
    const pl = await o.evaluate(() => { const P = window.__hecho.planilla('p1'); const x = (n) => (P.celda['pozo|' + n.toLowerCase()] || {}).est; return ['Col 5', 'Col 6', 'Col 8'].map((n) => n + ':' + x(n)).join(','); });
    c(/Col 5:falta/.test(pl) && /Col 6:asig/.test(pl) && /Col 8:asig/.test(pl), 'la planilla de columnas (v150) también · ' + pl);
    const pat = await o.evaluate(() => { const L = window.__av2.lista(avanceObras.find((x) => x.id === 'p1')); return { cosas: L.cosas.filter((x) => /med_pat/.test(x.id)).map((x) => x.id + ':' + x.label + ':' + x.tot), dicc: ['medicion_pat_int', 'medicion_pat_fin'].filter((k) => window.__DICC_ID[k]).length, map: window.__av2.TAREA_AV.medicion_pat }; });
    c(pat.cosas.length === 2 && /med_pat_int:Medición de PAT · prueba interna/.test(pat.cosas[0]) && /med_pat_fin:Medición de PAT · inspección final/.test(pat.cosas[1]) && pat.dicc === 2 && pat.map[0] === 'c:med_pat_int', 'PAT en dos instancias: el avance nuevo tiene «Medición de PAT · prueba interna» y «· inspección final» (una vez cada una, de todas las jabalinas y el tablero) y el diccionario las dos tareas · ' + JSON.stringify(pat));
    c(errsJs(L).length === 0, 'sin errores (Llenar orden)' + (errsJs(L).length ? ': ' + errsJs(L).slice(0, 2).join(' | ') : ''));
    c(await scrollX(o) <= 0, 'sin scroll de costado');
    await L.ctx.close();
  }

  // ================================================================= 4) compatibilidad (__v165No)
  if (SOLO(4)) {
    const A = await sesion('juan', { v165: false }); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:20'); await modoObra(p);
    await p.click('#cdApp [data-cd="boton"]'); await p.waitForTimeout(900);
    const r = await p.evaluate(() => ({ cartel: !!document.getElementById('viOv'), cam: !!document.getElementById('emaCam'), vi: !!document.querySelector('#emaCam .vi-pill') }));
    c(!r.cartel && r.cam && !r.vi, 'con __v165No: el botón abre la cámara como antes (sin cartel ni píldora) · ' + JSON.stringify(r));
    await A.ctx.close();
    const L = await sesion('lucia', { v165: false }); const o = L.page;
    const pat = await o.evaluate(() => { const L = window.__av2 && window.__av2.lista(avanceObras.find((x) => x.id === 'p1')); return L ? L.cosas.filter((x) => /med_pat/.test(x.id)).map((x) => x.id) : []; });
    c(JSON.stringify(pat) === '["med_pat"]', 'con __v165No: la medición de PAT como antes · ' + JSON.stringify(pat));
    await o.evaluate(() => { window.mostrarVista('parte'); window.irSubOrdenes('nueva'); }); await o.waitForTimeout(600);
    await o.evaluate(() => { try { window.__ordenNueva.elegirObra('p1'); } catch (e) { } }); await o.waitForTimeout(1200);
    await o.evaluate(() => { const cb = document.querySelector('#otActividades .ot-act-check[value="excavacion"]'); cb && !cb.checked && cb.click(); }); await o.waitForTimeout(1500);
    c(!(await o.evaluate(() => !!document.querySelector('.cc-box'))), 'con __v165No: Llenar orden sin las columnas');
    await L.ctx.close();
  }

  // ================================================================= 5) la oficina no ve nada nuevo en lo suyo; Mis tareas clásica sigue andando
  if (SOLO(5)) {
    const A = await sesion('juan'); const p = A.page;
    await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(1500);
    const mt = await p.evaluate(() => ({ app: !!document.getElementById('mtApp'), ot: !!document.querySelector('.mt-item[data-mtabrir="ot165"], .mt-ot[data-ot="ot165"]') }));
    c(mt.app && mt.ot && errsJs(A).length === 0, 'Mis tareas clásica abre como siempre (la orden de hoy está) · ' + JSON.stringify(mt));
    await A.ctx.close();
    const L = await sesion('lucia'); const o = L.page;
    const n = await o.evaluate(() => ({ cd: !!document.getElementById('cdApp'), crew: window.__cuadrillaDia && window.__cuadrillaDia.on(), cartel: (window.__inicioTarea.cartel(), !!document.getElementById('viOv')) }));
    c(!n.cd && !n.crew && !n.cartel, 'la oficina: sin Modo obra ni el cartel · ' + JSON.stringify(n));
    await L.ctx.close();
  }
  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
