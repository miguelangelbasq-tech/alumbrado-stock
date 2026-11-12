// v142 · La cuadrilla nueva: «Modo obra» (opción E) y todo el recorrido del día, con el arnés (crew:true).
// Juan (cuadrilla) en el celu: Inicio «Hoy» → la orden → seguridad (tilde + foto) → antes de salir (material de la reserva,
// herramientas, salir igual) → cómo llegar (mapa) → Modo obra: Llegué con GPS → Foto · Col 5 con la cámara de la app →
// Terminé con horas → sigue sola a la Col 6 … → No se hizo (con el porqué) → falta material (aviso al pañol y a la oficina) →
// ayuda (asistente con la tarea, guía en el paso) → llamar (con y sin teléfonos) → fin del día → puntos → sin señal.
// La oficina ve seguridad / salida / falta material en el «📸 Avance» y en el cierre, y cierra como siempre (puntos y avance).
// Con «cel» saca las 22 capturas del recorrido (capturas/NN_*.png).
const { abrir, otraPagina, prueba } = require('./h');
const { datos142 } = require('./datos142');
const fs = require('fs');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v142/capturas/';
const shot = async (pg, n) => { if (cel) { fs.mkdirSync(CAP, { recursive: true }); await pg.screenshot({ path: CAP + n + '.png' }); } };
// cámara de mentira: la cámara de la app ve una columna (canvas) en vez de la del celu
const camaraFalsa = () => {
  const dib = (c) => { const x = c.getContext('2d'), w = c.width, h = c.height; const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9cc3e6'); g.addColorStop(0.62, '#d8e8f4'); g.addColorStop(0.62, '#7fae5a'); g.addColorStop(1, '#5d8a3e'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#e9edf2'; x.fillRect(w * 0.47, h * 0.18, w * 0.06, h * 0.62); x.fillStyle = '#5b6470'; x.fillRect(w * 0.47, h * 0.18, w * 0.2, h * 0.018); x.fillStyle = '#2c333b'; x.fillRect(w * 0.64, h * 0.17, w * 0.07, h * 0.03); x.fillStyle = '#4c7a36'; [[0.18, 0.55, 0.1], [0.82, 0.58, 0.08]].forEach(([a, b, r]) => { x.beginPath(); x.arc(w * a, h * b, w * r, 0, 7); x.fill(); }); };
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => { const c = document.createElement('canvas'); c.width = 720; c.height = 1280; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
};
const FOTO = __dirname + '/foto.jpg';
(async () => {
  const c = prueba('v142' + (cel ? ' cel' : ''));
  const d = datos142();
  d.db.configEquipo.personal.asistente = { roles: ['admin', 'oficina', 'panol', 'cuadrilla', 'operario', 'mirar'] };
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, rsObra: true, lgPleg: true, reglas: true, https: true, leaflet: true, cel };
  // la entrada (sin sesión todavía)
  const P = await abrir(Object.assign({ datos: d, espera: 2500 }, MOD, { cel: true })), q0 = P.page;
  await q0.evaluate(() => { const u = document.querySelector('#portada input[type="text"], #portada input[type="email"], #loginUsuario'); u && (u.value = 'juan'); });
  await shot(q0, '01_entrar');
  // Juan en el celu
  const J = await otraPagina(P, Object.assign({ sesion: 'juan', espera: 4500, antes: camaraFalsa }, MOD)), q = J.page;
  const dlg = []; q.on('dialog', (x) => { dlg.push(x.message()); x.accept(); });
  await J.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }));
  let preguntas = 0;
  await J.ctx.route(/ema-ia\.mdiaz-60f\.workers\.dev/, async (rq) => {
    const u = rq.request().url(); const H = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
    if (rq.request().method() === 'OPTIONS') return rq.fulfill({ status: 204, headers: H });
    if (/\/mio|\/uso|\/salud/.test(u)) return rq.fulfill({ status: 200, contentType: 'application/json', headers: H, body: JSON.stringify({ ok: true, version: 'v3-ia', rol: 'cuadrilla', quedanPreguntas: 8, topePreguntas: 10, quedanRemitos: 0, topeRemitos: 0 }) });
    const b = rq.request().postData() || ''; preguntas++;
    const gana = /gano la hora/i.test(b);
    const txt = gana ? 'Eso no lo puedo ver con tu usuario. Lo de sueldos y horas lo maneja la oficina: preguntale a Lucía.\n\nLo que sí te muestro son tus puntos de la quincena.' : '1. Cortá la energía y probá con el buscapolo.\n2. Fase del 4×4 → **bornera gris (2009)** → portafusible con **fusible 2 A (3017)**.\n3. Neutro → celeste (2008). Tierra → verde (2010).\n4. Cable 3×1,5 a la luminaria con punteras TIF crimpeadas.';
    return rq.fulfill({ status: 200, contentType: 'application/json', headers: H, body: JSON.stringify({ id: 'm1', type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', content: [{ type: 'text', text: txt }], stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 10 }, ema: { costoUsd: 0.01, uso: { rol: 'cuadrilla', tipo: 'pregunta', quedanPreguntas: gana ? 7 : 8, topePreguntas: 10, quedanRemitos: 0, topeRemitos: 0 } } }) });
  });
  await J.ctx.grantPermissions(['geolocation', 'camera'], { origin: 'https://app.test' });
  await J.ctx.setGeolocation({ latitude: -31.42735, longitude: -64.18866, accuracy: 8 });   // a ~30 m del pin de la obra
  const db = () => q.evaluate(() => window.__stubDB().ordenesTrabajo.ot134);
  const esperar = (fn, arg, ms) => q.waitForFunction(fn, arg, { timeout: ms || 8000 }).then(() => true, () => false);
  const tx = (sel) => q.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const toca = async (sel, ms) => { await q.click(sel, { timeout: 5000 }).catch((e) => console.log('   (no pude tocar ' + sel + ': ' + e.message.split('\n')[0] + ')')); await q.waitForTimeout(ms || 700); };
  await q.evaluate(() => window.__emaAvisos && window.__emaAvisos.avisar({ id: 'a1', titulo: 'Orden nueva OT-2026-134', cuerpo: 'PLAZA LOS ÁLAMOS · Izaje de 4 columnas', tipo: 'ot', ts: Date.now() }));
  await q.evaluate(() => { window.__permToasts = []; new MutationObserver(() => { const e = document.getElementById('permToast'); e && window.__permToasts.indexOf(e.textContent) < 0 && window.__permToasts.push(e.textContent); }).observe(document.body, { childList: true }); });
  await q.evaluate(() => mostrarVista('inicio')); await q.waitForTimeout(1500);
  // 1) Inicio «Hoy»
  let r = await q.evaluate(() => ({ cd: !!document.querySelector('#cdApp .cd-hh'), viejo: (() => { const e = document.getElementById('inicioCuadrilla'); return !e || e.offsetParent === null; })(), txt: (document.getElementById('cdApp') || {}).textContent.replace(/\s+/g, ' '), hdr: getComputedStyle(document.querySelector('body > header')).display }));
  c(r.cd && r.viejo && /PLAZA LOS ÁLAMOS · ID 4031/.test(r.txt) && /Cómo llegar/.test(r.txt) && /Tus tareas/.test(r.txt) && /Avisos nuevos/.test(r.txt) && /puntos quincena/.test(r.txt), 'Hoy: obra del día con dirección y «Cómo llegar», tareas, avisos y puntos (el Inicio viejo queda escondido) · ' + r.txt.slice(0, 160));
  c(/Montaje de columna PRFV/.test(r.txt) && /Col 5 a 8/.test(r.txt) && /OT-2026-134/.test(r.txt) && /12/.test(r.txt), 'Hoy: las 3 tareas con sus columnas (sigue de la Col 5: la 1 a 4 ya tienen foto) y los 12 puntos aprobados');
  await q.evaluate(() => document.querySelectorAll('#avToast, .av-toast').forEach((x) => x.classList.remove('on'))); await q.waitForTimeout(600);
  await shot(q, '02_inicio_hoy');
  await q.evaluate(() => { document.querySelectorAll('#avToast, .av-toast').forEach((x) => x.remove()); const b = document.getElementById('avCampana'); b && b.click(); }); await q.waitForTimeout(900); await shot(q, '03_aviso'); await q.evaluate(() => { const p = document.getElementById('avPanel'); p && p.remove(); }); await q.waitForTimeout(400);
  // 2) la orden del día
  await toca('#cdApp [data-cd="orden"]', 900);
  r = await tx('#cdApp');
  c(/Juan Pérez · vos/.test(r) && /Pedro Gómez/.test(r) && /Hidroelevador · Interno 3/.test(r) && /Te sigue Lucía/.test(r) && /Tareas en orden/.test(r) && /cantero de la Col 8/.test(r) && /Empezar/.test(r), 'La orden: quiénes, vehículo, quién la sigue, tareas en orden, la nota de la oficina y «Empezar»');
  await shot(q, '04_orden_del_dia');
  await toca('#cdApp [data-cd="empezar"]', 900);
  // 3) seguridad
  r = await q.evaluate(() => ({ p: __cuadrillaDia.estado().pant, off: document.querySelector('#cdApp [data-cd="arrancar"]').classList.contains('cd-off'), fotos: [...document.querySelectorAll('#cdApp [data-cd="segfoto"]')].map((b) => b.dataset.it) }));
  c(r.p === 'seg' && r.off && r.fotos.join() === 'conos,equipo', '«Empezar» abre la seguridad; «Arrancar el día» apagado; por defecto piden foto solo conos y equipo · ' + JSON.stringify(r));
  for (const k of ['casco', 'arnes', 'guantes', 'botines', 'conos', 'equipo']) await toca(`#cdApp [data-cd="segtick"][data-it="${k}"]`, 250);
  r = await q.evaluate(() => ({ off: document.querySelector('#cdApp [data-cd="arrancar"]').classList.contains('cd-off'), falta: (document.querySelector('#cdApp .cd-falta') || {}).textContent || '' }));
  c(r.off && /foto/.test(r.falta), 'tildado todo pero sin las fotos obligatorias: no arranca («' + r.falta + '»)');
  await shot(q, '05_seguridad');
  // foto de los conos con la cámara de la app
  await toca('#cdApp [data-cd="segfoto"][data-it="conos"]', 1500); await q.waitForFunction(() => { const v = document.getElementById('ecVideo'); return v && v.videoWidth > 0; }, null, { timeout: 8000 }).catch(() => { });
  r = await q.evaluate(() => ({ cam: !!document.getElementById('emaCam'), guia: (document.querySelector('#emaCam .cd-guia') || {}).textContent || '' }));
  c(r.cam && /conos/.test(r.guia), 'la foto de la seguridad abre la cámara de la app con la guía · ' + r.guia);
  await toca('#emaCam [data-ec="disparar"]', 2500);
  await toca('#cdApp [data-cd="segfoto"][data-it="equipo"]', 1500); await q.waitForFunction(() => { const v = document.getElementById('ecVideo'); return v && v.videoWidth > 0; }, null, { timeout: 8000 }).catch(() => { }); await toca('#emaCam [data-ec="disparar"]', 2500);
  await toca('#cdApp [data-cd="corte"][data-v="no"]', 500);
  await esperar(() => { const s = ((window.__stubDB().ordenesTrabajo.ot134.campo || {}).seguridad || {})['juan perez'] || {}; return s.fotos && s.fotos.conos && s.fotos.equipo; }, null, 10000);
  r = await esperar(() => { const b = document.querySelector('#cdApp [data-cd="arrancar"]'); return b && !b.classList.contains('cd-off'); }, null, 15000);
  if (!r) console.log('   DBG seg: ' + JSON.stringify(await q.evaluate(() => { const o = ordenesTrabajo.find((x) => x.id === 'ot134') || {}; const s = (o.campo || {}).seguridad || {}; return { s, falta: (document.querySelector('#cdApp .cd-falta') || {}).textContent, pant: __cuadrillaDia.estado().pant, msg: (document.querySelector('#cdApp .cd-msg') || {}).textContent, cam: !!document.getElementById('emaCam') }; })));
  c(r, 'con las dos fotos y el corte de energía, «Arrancar el día» se prende');
  await toca('#cdApp [data-cd="arrancar"]', 1200);
  r = await db(); const sg = ((r.campo || {}).seguridad || {});
  c(sg['juan perez'] && sg['juan perez'].ok && sg['juan perez'].items.casco && sg['juan perez'].fotos.conos && sg.epp && sg.baliza && sg.herram && sg.corte === 'no', 'se guarda campo.seguridad.<persona> {items, fotos, ts} y lo de antes (epp, baliza, herram, corte) · ' + JSON.stringify(sg['juan perez'] || {}).slice(0, 140));
  // 4) antes de salir
  r = await q.evaluate(() => ({ p: __cuadrillaDia.estado().pant, txt: document.getElementById('cdApp').textContent.replace(/\s+/g, ' '), off: document.querySelector('#cdApp [data-cd="salimos"]').classList.contains('cd-off') }));
  c(r.p === 'salir' && /Material · 2 de 4/.test(r.txt) && /2 sin retirar/.test(r.txt) && /Falta retirar · R-0045 lista/.test(r.txt) && /Retirado del pañol/.test(r.txt), 'Antes de salir: material de la reserva de la orden (2 retirados, 2 por retirar de la R-0045)');
  c(/Pinza crimpeadora/.test(r.txt) && /la tiene Lucas Martínez/.test(r.txt) && /Eslingas/.test(r.txt) && /la tenés vos/.test(r.txt) && /a confirmar/.test(r.txt), 'herramientas sugeridas por tarea con quién las tiene');
  c(/Asistente EMA/.test(r.txt) && /Te falta retirar 2 cosas \(reserva R-0045\)/.test(r.txt) && /pinza crimpeadora/.test(r.txt) && r.off, 'aviso del asistente armado sin IA y «Salimos» apagado · ' + (r.txt.match(/Asistente EMA.{0,140}/) || [''])[0]);
  await shot(q, '06_antes_de_salir');
  await toca('#cdApp [data-cd="salirIgual"]', 600);
  await q.fill('#cdMotTx', 'El pañol abre a las 8, lo pasamos a buscar al mediodía'); await toca('#cdHoja [data-cdh="motOk"]', 1500);
  r = await db(); r = (((r.campo || {}).salida || {})['juan perez']) || {};
  c(r.ts && r.ok === false && /pañol abre/.test(r.motivo) && r.faltaMat.length === 2, '«Salir igual (decí por qué)» se guarda en campo.salida.<persona> · ' + JSON.stringify(r).slice(0, 140));
  // 5) cómo llegar
  await q.waitForTimeout(1500);
  r = await q.evaluate(() => ({ p: __cuadrillaDia.estado().pant, pin: !!document.querySelector('#cdMapa .cd-pinm'), g: (document.querySelector('#cdApp a[data-cd="gmaps"]') || {}).href || '', d: (document.querySelector('#cdApp .cd-dist') || {}).textContent || '' }));
  c(r.p === 'llegar' && r.pin && /google\.com\/maps\/dir\/\?api=1&destination=-31\.42710\d*,-64\.18890/.test(r.g) && /\d+ m/.test(r.d), 'Cómo llegar: mapa con el pin, la distancia con GPS y «Abrir en Google Maps» · ' + r.d.replace(/\s+/g, ' '));
  await shot(q, '07_como_llegar');
  await toca('#cdApp button[data-cd="obra"]', 1800);
  // 6) Modo obra: Llegué
  r = await q.evaluate(() => ({ btn: document.querySelector('#cdApp [data-cd="boton"]').textContent, gps: (document.querySelector('#cdApp .cd-gps') || {}).textContent || '', hdr: (document.getElementById('hdrHoja') || {}).textContent }));
  c(/Llegué/.test(r.btn) && /Estás en la obra · a \d+ m/.test(r.gps) && /Modo obra · OT-2026-134/.test(r.hdr), 'Modo obra: el botón dice «Llegué» y el GPS «Estás en la obra» (menos de 150 m) · ' + r.gps + ' · ' + r.hdr);
  await shot(q, '08_E_llegue');
  await toca('#cdApp [data-cd="boton"]', 1500);
  r = await db(); const lg = (((r.campo || {}).llegada || {})['juan perez']) || {};
  c(lg.ts && lg.enObra === true && lg.dist < 150 && r.estado === 'En curso', 'Llegué: queda campo.llegada.<persona> con el GPS y la orden pasa a «En curso» · ' + JSON.stringify(lg));
  r = await q.evaluate(() => ({ btn: document.querySelector('#cdApp [data-cd="boton"]').textContent, col: (document.querySelector('#cdApp .cd-colg') || {}).textContent }));
  c(/Foto/.test(r.btn) && r.col === 'Col 5', 'el mismo botón pasa a «Foto · Col 5» · ' + JSON.stringify(r));
  await shot(q, '09_E_foto');
  // 7) cámara y foto guardada (4 columnas: Col 5 a 8)
  const fotoYTermine = async (col, i) => {
    await toca('#cdApp [data-cd="boton"]', 1500);
    if (i === 0) { const g = await tx('#emaCam .cd-guia'); c(/Columna entera en el cuadro/.test(g), 'la cámara de la app con la guía «Columna entera en el cuadro» · ' + g); await q.waitForTimeout(800); await shot(q, '10_camara'); }
    await q.waitForFunction(() => { const v = document.getElementById('ecVideo'); return v && v.videoWidth > 0; }, null, { timeout: 8000 }).catch(() => { });
    await toca('#emaCam [data-ec="disparar"]', 300);
    const okF = await esperar((cl) => { const h = document.getElementById('cdHoja'); return h && /Foto guardada/.test(h.textContent); }, col, 45000);
    if (!okF) console.log('   DBG foto ' + col + ': ' + JSON.stringify(await q.evaluate(() => ({ fase: __cuadrillaDia.pasoActual().fase, it: (__cuadrillaDia.pasoActual().it || {}).num, cam: !!document.getElementById('emaCam'), msg: (document.querySelector('#cdApp .cd-msg') || {}).textContent, hoja: (document.getElementById('cdHoja') || {}).textContent }))));
    if (i === 0) {
      const h = await tx('#cdHoja'); c(/Foto guardada/.test(h) && /Col 5/.test(h) && /Es la 1 de 4 columnas/.test(h), 'Foto guardada · Col 5 · «Es la 1 de 4» · ' + h.slice(0, 90));
      await shot(q, '11_foto_guardada');
    }
    await toca('#cdHoja [data-cdh="x"]', 500);
    const b = await tx('#cdApp [data-cd="boton"]'); if (i === 0) c(/Terminé/.test(b), 'con la foto, el botón pasa a «Terminé» (verde) · ' + b);
    await toca('#cdApp [data-cd="boton"]', 700);
    if (i === 0) {
      const ini0 = await tx('#cdIni');
      await toca('#cdHoja [data-cdh="ini-"]', 200); await toca('#cdHoja [data-cdh="ini-"]', 200); await toca('#cdHoja [data-cdh="fin+"]', 200);
      const h2 = { ini: await tx('#cdIni'), fin: await tx('#cdFin') };
      c(/^\d\d:\d\d$/.test(h2.ini) && h2.ini !== ini0, 'Terminé: hora de inicio y fin con − / + · ' + ini0 + ' → ' + JSON.stringify(h2));
      await shot(q, '12_E_termine');
    }
    await toca('#cdHoja [data-cdh="sehizo"]', 1500);
  };
  for (let i = 0; i < 4; i++) {
    await fotoYTermine('Col ' + (5 + i), i);
    if (i === 0) {
      r = await q.evaluate(() => ({ toast: (document.querySelector('#cdApp .cd-toast') || {}).textContent || '', col: (document.querySelector('#cdApp .cd-colg') || {}).textContent }));
      c(/Col 5 lista y mandada · vas 1 de 4/.test(r.toast) && r.col === 'Col 6', 'pasa sola a la Col 6 · ' + JSON.stringify(r));
      await shot(q, '13_E_col6');
    }
  }
  await esperar(() => { const o = window.__stubDB().ordenesTrabajo.ot134, cp = o.campo || {}; return ((cp.tareaEnv || {}).montaje_prfv || {})['Juan Pérez']; }, null, 10000);
  // v148: las fotos de Modo obra se guardan por atrás (de a una, con la cámara cerrada y sin toques): se espera a que lleguen las 4
  await esperar(() => { const o = window.__stubDB().ordenesTrabajo.ot134, cp = o.campo || {}; return Object.values(cp.fotos || {}).filter((f) => f.k === 'montaje_prfv').length >= 4; }, null, 60000);
  r = await db(); let cp = r.campo || {};
  const fotosCol = Object.values(cp.fotos || {}).filter((f) => f.k === 'montaje_prfv').map((f) => f.num).sort();
  c(fotosCol.join() === 'Col 5,Col 6,Col 7,Col 8', 'las 4 fotos quedan en campo.fotos con su columna (como Mis tareas) · ' + fotosCol.join());
  c(((cp.marcas || {}).montaje_prfv || {}).hecho && +((cp.marcas || {}).montaje_prfv || {}).cant === 4 && (cp.horasTarea || {}).montaje_prfv && (cp.horasTarea || {}).montaje_prfv.ini && Object.keys((cp.pasosObra || {}).montaje_prfv || {}).length === 4 && ((cp.tareaEnv || {}).montaje_prfv || {})['Juan Pérez'].estado === 'si', 'al terminar la Col 8: marca hecha (4), horas de la tarea, hora de cada columna y la tarea mandada (tareaEnv) · ' + JSON.stringify((cp.horasTarea || {}).montaje_prfv));
  r = await q.evaluate(() => ({ tit: (document.querySelector('#cdApp .cd-arr h1') || {}).textContent, col: (document.querySelector('#cdApp .cd-colg') || {}).textContent }));
  c(/vínculo/i.test(r.tit || ''), 'sigue sola con la tarea 2 · ' + JSON.stringify(r));
  // 8) falta material
  await toca('#cdApp [data-cd="falta"]', 700);
  await toca('#cdHoja [data-cdh="ftick"][data-i="1"]', 300); await toca('#cdHoja [data-cdh="fq+"][data-i="1"]', 300);
  await toca('#cdHoja [data-cdh="faltaOk"]', 2500);
  r = await q.evaluate(() => ({ h: (document.getElementById('cdHoja') || {}).textContent || '', av: Object.values(window.__stubDB().avisosPush || {}).filter((x) => x.tipo === 'falta').map((x) => x.email), fm: Object.values(((window.__stubDB().ordenesTrabajo.ot134.campo || {}).faltaMaterial) || {}) }));
  c(/Avisado ✓/.test(r.h) && r.av.includes('raul@ema-alumbrado.app') && r.av.includes('lucia@ema-alumbrado.app') && r.fm.length === 1 && r.fm[0].items[0].codigo === '2009' && r.fm[0].items[0].cant === 13, 'Falta material: avisa al pañol (Raúl) y a quien sigue la orden (Lucía), queda en campo.faltaMaterial · ' + JSON.stringify(r.av) + ' ' + JSON.stringify(r.fm[0] && r.fm[0].items));
  await shot(q, '14_falta_material');
  await toca('#cdHoja [data-cdh="x"]', 400);
  // 9) ayuda → asistente con la tarea y la guía en el paso
  await toca('#cdApp [data-cd="ayuda"]', 700);
  r = await tx('#cdHoja');
  c(/Preguntale al asistente/.test(r) && /Ver cómo se hace/.test(r) && /Llamar a la oficina/.test(r) && /Estás en: Colocación · Col 1/.test(r), 'Ayuda: asistente, cómo se hace y llamar, con «Estás en» · ' + r.slice(0, 90));
  await shot(q, '15_ayuda');
  await toca('#cdHoja [data-cdh="ia"]', 3500);
  r = await q.evaluate(() => ({ p: !!document.getElementById('iaPanel'), ctx: (document.getElementById('cdIaCtx') || {}).textContent || '', en: window.__iaEnObra || '' }));
  c(r.p && /Estás en: Colocación · Col 1/.test(r.ctx) && /OT-2026-134/.test(r.en), 'el Asistente se abre con el contexto de la tarea («Estás en: …») · ' + r.ctx);
  if (await q.$('#iaTxt')) {
    await q.fill('#iaTxt', '¿Cómo conecto la bornera de la caja de la columna?'); await q.click('#iaEnviar').catch(() => { }); await q.waitForTimeout(3500);
    r = await q.evaluate(() => ({ chat: (document.getElementById('iaChat') || {}).textContent || '', chip: (document.getElementById('iaPanel') || {}).textContent.match(/Te quedan \d+ preguntas? hoy/) }));
    c(/bornera gris/.test(r.chat) && r.chip, 'contesta en pasos y muestra «Te quedan N preguntas hoy» · ' + (r.chip && r.chip[0]));
    await shot(q, '16_asistente');
    await q.fill('#iaTxt', '¿Cuánto gano la hora?'); await q.click('#iaEnviar').catch(() => { }); await q.waitForTimeout(3500);
    r = await tx('#iaChat'); c(/Eso no lo puedo ver con tu usuario/.test(r), 'lo que la IA no contesta (rol cuadrilla): «Eso no lo puedo ver…»');
    await shot(q, '19_ia_no');
  } else c(false, 'no está la caja del asistente');
  await q.evaluate(() => { const b = document.querySelector('#iaPanel [data-ia="volver"]'); b ? b.click() : window.__asistente && window.__asistente.cerrar(); }); await q.waitForTimeout(600);
  await toca('#cdApp [data-cd="ayuda"]', 600); await toca('#cdHoja [data-cdh="guia"]', 2500);
  r = await q.evaluate(() => ({ img: (document.querySelector('#cdGuia .cd-gz img') || {}).getAttribute ? document.querySelector('#cdGuia .cd-gz img').getAttribute('src') : '', t: (document.getElementById('cdGuia') || {}).textContent || '' }));
  c(/guias\/pasos\/montaje_prfv_p1\.webp/.test(r.img) && /Paso 1 de \d/.test(r.t), 'Cómo se hace: la guía de la tarea (montaje PRFV) en el paso 1 con ‹ › y zoom · ' + r.img);
  await toca('#cdGuia [data-cdg="sig"]', 600); await toca('#cdGuia [data-cdg="z+"]', 300);
  r = await q.evaluate(() => ({ img: document.querySelector('#cdGuia .cd-gz img').getAttribute('src'), w: document.querySelector('#cdGuia .cd-gz img').style.width }));
  c(/_p2\.webp/.test(r.img) && r.w === '150%', '› pasa al paso 2 y ＋ acerca · ' + JSON.stringify(r));
  await shot(q, '17_guia_paso');
  await toca('#cdGuia [data-cdg="x"]', 500);
  // 10) «No se hizo (decí por qué)»: la tarea 2 no se hace
  await toca('#cdApp [data-cd="boton"]', 1500); await toca('#emaCam [data-ec="cerrar"]', 400);
  r = await q.evaluate(() => __cuadrillaDia.pasoActual().fase);
  if (r === 'foto') { await q.evaluate(() => { const i = document.getElementById('cdFotoIn'); i.dataset.ot = 'ot134'; i.dataset.k = 'vinculo_luminaria'; i.dataset.fln = 'Col 1'; i.dataset.cat = 'luminaria'; }); await q.setInputFiles('#cdFotoIn', FOTO); await esperar(() => /Foto guardada/.test((document.getElementById('cdHoja') || {}).textContent || ''), null, 30000); await toca('#cdHoja [data-cdh="x"]', 400); }
  await toca('#cdApp [data-cd="boton"]', 700); await toca('#cdHoja [data-cdh="sehizo"]', 1200);   // Col 1 hecha
  await toca('#cdApp [data-cd="boton"]', 1500); await toca('#emaCam [data-ec="cerrar"]', 400);
  // no hay foto de la Col 2 → «Terminé» todavía no; el porqué sale desde la hoja de horas de la siguiente: usamos la hoja directo
  await q.evaluate(() => { const i = document.getElementById('cdFotoIn'); i.dataset.ot = 'ot134'; i.dataset.k = 'vinculo_luminaria'; i.dataset.fln = 'Col 2'; i.dataset.cat = 'luminaria'; }); await q.setInputFiles('#cdFotoIn', FOTO);
  await esperar(() => /Foto guardada/.test((document.getElementById('cdHoja') || {}).textContent || ''), null, 30000); await toca('#cdHoja [data-cdh="x"]', 400);
  await toca('#cdApp [data-cd="boton"]', 700); await toca('#cdHoja [data-cdh="nohizo"]', 500);
  await toca('#cdHoja [data-cdm="material"]', 200); await q.fill('#cdMotTx', 'faltaron las borneras BPN 6'); await toca('#cdHoja [data-cdh="motOk"]', 1500);
  r = await db(); cp = r.campo || {};
  const m2 = (cp.marcas || {}).vinculo_luminaria || {}, e2 = ((cp.tareaEnv || {}).vinculo_luminaria || {})['Juan Pérez'] || {};
  c(m2.hecho && +m2.cant === 1 && /Faltó material/.test(m2.nota || '') && /Col 2, Col 3, Col 4/.test(m2.nota || '') && e2.estado === 'si', '«No se hizo (decí por qué)»: lo hecho (1) queda, el resto con el porqué, y la tarea se manda · ' + JSON.stringify(m2).slice(0, 160));
  // tarea 3: no se hace nada
  await toca('#cdApp [data-cd="boton"]', 1500); await toca('#emaCam [data-ec="cerrar"]', 400);
  await q.evaluate(() => { const i = document.getElementById('cdFotoIn'); i.dataset.ot = 'ot134'; i.dataset.k = 'bpn'; i.dataset.fln = 'Col 1'; i.dataset.cat = 'caja'; }); await q.setInputFiles('#cdFotoIn', FOTO);
  await esperar(() => /Foto guardada/.test((document.getElementById('cdHoja') || {}).textContent || ''), null, 30000); await toca('#cdHoja [data-cdh="x"]', 400);
  await toca('#cdApp [data-cd="boton"]', 700); await toca('#cdHoja [data-cdh="nohizo"]', 500);
  await toca('#cdHoja [data-cdm="material"]', 200); await q.fill('#cdMotTx', 'faltaron borneras BPN 6 (avisado)'); await toca('#cdHoja [data-cdh="motOk"]', 2500);
  await esperar(() => { const cp2 = window.__stubDB().ordenesTrabajo.ot134.campo || {}; return (cp2.enviados || {})['Juan Pérez']; }, null, 10000);
  r = await db(); cp = r.campo || {};
  c((cp.enviados || {})['Juan Pérez'] && (cp.horas || {})['Juan Pérez'] && (cp.horas || {})['Juan Pérez'].horas > 0, 'con las 3 tareas mandadas, la orden se envía sola (campo.enviados y campo.horas, como envioTarea) · ' + JSON.stringify((cp.horas || {})['Juan Pérez']));
  // 11) fin del día
  r = await q.evaluate(() => ({ p: __cuadrillaDia.estado().pant, txt: document.getElementById('cdApp').textContent.replace(/\s+/g, ' ') }));
  c(/Hoy hiciste/.test(r.txt) && /Montaje de columna PRFV/.test(r.txt) && /4\/4/.test(r.txt) && /No se hizo/.test(r.txt) && /Mandado a la oficina/.test(r.txt) && /fotos esperando señal|Todo subido/.test(r.txt), 'Fin del día: lo que hizo (verde), lo que no y por qué (rojo), y «Mandado a la oficina» · ' + r.txt.slice(0, 220));
  await shot(q, '20_fin_del_dia');
  // 12) llamar (con teléfonos)
  await q.evaluate(() => __cuadrillaDia.ir('llamar')); await q.waitForTimeout(800);
  r = await q.evaluate(() => ({ nom: [...document.querySelectorAll('#cdApp .cd-ct .cd-tx b')].map((x) => x.textContent), tel: [...document.querySelectorAll('#cdApp a[data-cd="tel"]')].map((a) => a.getAttribute('href')), wa: [...document.querySelectorAll('#cdApp a[data-cd="wa"]')].map((a) => a.getAttribute('href')), sin: (document.getElementById('cdApp').textContent.match(/Pedile a la oficina que cargue su teléfono/g) || []).length }));
  c(/Lucía/.test(r.nom[0]) && r.tel.includes('tel:3515550101') && r.wa.includes('https://wa.me/5493515550101') && r.wa.includes('https://wa.me/5493515550202') && r.sin === 1, 'Llamar: quien sigue la orden primero, 📞 tel: y 💬 wa.me; sin teléfono, «Pedile a la oficina que cargue su teléfono» · ' + JSON.stringify(r));
  await shot(q, '18_llamar');
  await q.evaluate(() => { window.open = (u) => { window.__abierto = u; return {}; }; }); await toca('#cdApp [data-cd="ubicacion"]', 1500);
  r = await q.evaluate(() => window.__abierto || '');
  c(/^https:\/\/wa\.me\/\?text=/.test(r) && /maps\.google\.com%2F%3Fq%3D-31\.42/.test(r), '«Mandar mi ubicación» abre WhatsApp con el link de Maps · ' + r.slice(0, 90));
  // 13) mis puntos
  await q.evaluate(() => __cuadrillaDia.ir('puntos')); await q.waitForTimeout(800);
  r = await tx('#cdApp');
  c(/OT-2026-129/.test(r) && /Aprobados/.test(r) && /OT-2026-134/.test(r) && /Esperando cierre/.test(r) && /12/.test(r), 'Mis puntos: la quincena por orden, aprobados y esperando cierre · ' + r.slice(0, 160));
  await shot(q, '21_mis_puntos');
  // 14) sin señal
  await J.ctx.setOffline(true); await q.evaluate(() => { window.dispatchEvent(new Event('offline')); __cuadrillaDia.ir('obra'); }); await q.waitForTimeout(1200);
  r = await tx('#cdApp .cd-senal');
  c(/Sin señal/.test(r), 'sin señal: la tarjeta naranja aparece arriba (Modo obra / fin del día) · ' + r);
  await toca('#cdApp [data-cd="senal"]', 1200);
  r = await tx('#cdApp');
  c(/Sin señal: todo se guarda en el celu/.test(r) && /Podés seguir trabajando/.test(r) && /Reintentar ahora/.test(r), 'pantalla «Sin señal»: franja, cola de lo que espera y «Reintentar ahora» (v149b: antes «Probar ahora»)');
  await shot(q, '22_sin_senal');
  await J.ctx.setOffline(false); await q.evaluate(() => window.dispatchEvent(new Event('online')));
  r = await q.evaluate(() => window.__permToasts);
  c(!r.length, 'en todo el recorrido no salta ningún «🔒 no tenés permiso» · ' + JSON.stringify(r));
  const sw = await q.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  c(sw <= 0, 'sin scroll de costado · ' + sw);
  // 15) «atrás» del celu vuelve a la pantalla anterior
  await q.evaluate(() => __cuadrillaDia.ir('hoy')); await q.waitForTimeout(500); await q.evaluate(() => __cuadrillaDia.ir('orden')); await q.waitForTimeout(800);
  await q.goBack().catch(() => { }); await q.waitForTimeout(1200);
  r = await q.evaluate(() => __cuadrillaDia.estado().pant);
  c(r === 'hoy', '«atrás» desde la orden vuelve al Hoy · ' + r);
  // 16) «Ver lista completa» → Mis tareas de siempre
  await q.evaluate(() => __cuadrillaDia.ir('obra')); await q.waitForTimeout(600); await toca('#cdApp [data-cd="lista"]', 1500);
  r = await q.evaluate(() => document.body.dataset.vista + ' ' + !!document.querySelector('#mtApp'));
  c(/mistareas true/.test(r), '«Ver lista completa» abre Mis tareas de siempre · ' + r);
  // 17) sin contactos cargados
  const d2 = datos142({ contactos: false });
  const K = await abrir(Object.assign({ sesion: 'pedro', datos: d2, espera: 4000 }, MOD)); const k = K.page;
  await k.evaluate(() => mostrarVista('inicio')); await k.waitForTimeout(800); await k.evaluate(() => __cuadrillaDia.ir('llamar')); await k.waitForTimeout(800);
  r = await k.evaluate(() => document.getElementById('cdApp').textContent.replace(/\s+/g, ' '));
  c(/Pedile a la oficina que cargue su teléfono/.test(r) && !(await k.$('#cdApp a[data-cd="tel"]')), 'sin teléfonos cargados: no inventa números, «Pedile a la oficina que cargue su teléfono» · ' + r.slice(0, 120));
  await K.browser.close();
  // 18) OFICINA: ve seguridad, salida, llegada y falta material; cierra como siempre
  const A = await otraPagina(J, Object.assign({}, MOD, { sesion: 'admin', espera: 4000, cel: false })), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => window.__avanceOrden.abrir('ot134')); await p.waitForTimeout(1500);
  r = await p.evaluate(() => (document.querySelector('#avOt .cd-of') || {}).textContent || '');
  c(/La cuadrilla en obra/.test(r) && /seguridad completa/.test(r) && /salió igual/.test(r) && /pañol abre/.test(r) && /llegó/.test(r) && /Falta material/.test(r) && /2009/.test(r), 'oficina: en el «📸 Avance» de la orden ve seguridad, salida, llegada y falta material · ' + r.slice(0, 200));
  r = await p.evaluate(() => !!document.querySelector('#avOt .cd-of img'));
  c(r, 'oficina: la seguridad con sus fotos (miniaturas)');
  await p.evaluate(() => window.__avanceOrden.cerrar()); await p.waitForTimeout(300);
  await p.evaluate(() => window.abrirCierreOt('ot134')); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ of: (document.querySelector('#cierreCuerpo .cd-of') || {}).textContent || '', q: (document.querySelector('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]') || {}).value, ini: (document.querySelector('#cierreCuerpo .cierre-hini[data-k="montaje_prfv"]') || {}).value }));
  c(/seguridad completa/.test(r.of) && /Falta material/.test(r.of) && +r.q === 4 && /^\d\d:\d\d$/.test(r.ini || ''), 'oficina: el cierre trae lo de la cuadrilla (4 columnas, horas) y el bloque de seguridad / salida / falta material · ' + JSON.stringify({ q: r.q, ini: r.ini }));
  await p.evaluate(async () => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); const t = document.getElementById('apTodo'); if (t) t.click(); else await guardarCierreOt(); }); await p.waitForTimeout(3000);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.ot134, ci = o.cierre || {}; return { cerrada: !!ci.cerradoTs, pts: ((ci.puntos || {}).porPersona || []).map((x) => x.nombre + ' ' + x.pts), it: window.__stubDB().avanceObras.p1.valorItems[0].cantidadAvanzada }; });
  c(r.cerrada && r.pts.length >= 1 && r.it > 4, 'oficina: cierra como siempre → puntos y avance del itemizado · ' + JSON.stringify(r));
  const errs = [].concat(P.errores || [], J.errores || [], A.errores || [], K.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|error occurred when fetching the script|ERR_|Failed to fetch|aborted|net::|404|tile/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 4)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
