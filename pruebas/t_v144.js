// v144 · Las fotos caen en la obra donde están parados + cámara «opción B · cámara primero» + «Nuestra zona».
// Juan (cuadrilla) con orden hoy en BULEVARES, GPS simulado:
//  · parado en SAN PABLO: «Cámara» abre directo la cámara; la píldora dice SAN PABLO, el cartel avisa y la foto va a San Pablo
//    (1 toque) como foto libre; llega el aviso a Lucía (la que sigue su orden);
//  · en BULEVARES: caso normal, 1 toque, Columna · Col 1 de su tarea, después Col 2;
//  · la lista de obras: las suyas + la de donde está (no las demás); elegir a mano otra obra → «Estás en X, no en Y»; motivo;
//  · «Es otra obra» pide el motivo; GPS malo → «Elegí la obra» y ubicDudosa; sin señal (GPS sí, internet no);
//  · Modo obra: «Llegué» en SAN PABLO → «¿Trabajás acá hoy?» (Sí: cámara en San Pablo + aviso; No: Cómo llegar).
// Oficina (admin): Supervisor «Fotos que parecen de otra obra» con «Mover» y «Está bien», «Obras sin ubicación», buscador de obras en
// la cámara; «Nuestra zona»: el anillo cuenta solo la zona A (18.407 módulos), no la B ni los barrios.
// Con «cel» saca las capturas (v144/capturas/).
const { abrir, otraPagina, prueba } = require('./h');
const { datos144, P } = require('./datos144');
const fs = require('fs');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/v144/capturas/';
const shot = async (pg, n) => { fs.mkdirSync(CAP, { recursive: true }); await pg.screenshot({ path: CAP + n + (cel ? '_cel' : '_pc') + '.png' }); };
const camaraFalsa = () => {
  const dib = (c) => { const x = c.getContext('2d'), w = c.width, h = c.height; const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9cc3e6'); g.addColorStop(0.62, '#d8e8f4'); g.addColorStop(0.62, '#8c8c74'); g.addColorStop(1, '#6f6f5c'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#e9edf2'; x.fillRect(w * 0.47, h * 0.12, w * 0.05, h * 0.62); x.fillStyle = '#cfd5dc'; x.fillRect(w * 0.3, h * 0.12, w * 0.4, h * 0.015); x.fillStyle = '#4c7a36'; [[0.12, 0.55, 0.14], [0.86, 0.56, 0.12]].forEach(([a, b, r]) => { x.beginPath(); x.arc(w * a, h * b, w * r, 0, 7); x.fill(); }); x.fillStyle = '#ff7a1a'; x.beginPath(); x.moveTo(w * 0.78, h * 0.72); x.lineTo(w * 0.74, h * 0.8); x.lineTo(w * 0.82, h * 0.8); x.fill(); };
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => { const c = document.createElement('canvas'); c.width = 720; c.height = 1280; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
};
(async () => {
  const c = prueba('v144' + (cel ? ' cel' : ''));
  const d = datos144();
  const MOD = { obraGps: true, camaraB: true, crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, rsObra: true, lgPleg: true, inicio: true, reglas: true, https: true, leaflet: true, cel };
  const J = await abrir(Object.assign({ datos: d, sesion: 'juan', espera: 4500, antes: camaraFalsa }, MOD)), q = J.page;
  await J.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }));
  await J.ctx.grantPermissions(['geolocation', 'camera'], { origin: 'https://app.test' });
  const ir = async (ll, acc) => { await J.ctx.setGeolocation({ latitude: ll[0] + 0.0002, longitude: ll[1], accuracy: acc || 8 }); };   // ~22 m del pin
  const DB = (col) => q.evaluate((k) => JSON.parse(JSON.stringify(window.__stubDB()[k] || {})), col);
  const esperar = (fn, arg, ms) => q.waitForFunction(fn, arg, { timeout: ms || 8000 }).then(() => true, () => false);
  const tx = (sel) => q.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const toques = { n: 0 };
  const toca = async (sel, ms) => { toques.n++; await q.click(sel, { timeout: 5000 }).catch((e) => console.log('   (no pude tocar ' + sel + ': ' + e.message.split('\n')[0] + ')')); await q.waitForTimeout(ms || 600); };
  const fotos = async () => Object.entries(await DB('fotosObra')).filter(([k]) => k !== 'fv1');
  const abrirCam = async () => {
    await q.evaluate(() => { const c = document.getElementById('emaCam'); if (c) window.camaraApp.cerrar(); });
    await q.waitForTimeout(300);
    await q.evaluate(() => document.getElementById('menuCamara').click());
    await esperar(() => { const v = document.getElementById('ecVideo'); return v && v.videoWidth > 0 && document.getElementById('cbPill'); }, null, 9000);
    await q.waitForTimeout(1500);
  };
  const disparar = async () => { const n0 = await q.evaluate(() => Object.keys(window.__stubDB().fotosObra || {}).length); toques.n = 0; await toca('#emaCam [data-ec="disparar"]', 400); const ok = await esperar((n) => Object.keys(window.__stubDB().fotosObra || {}).length > n, n0, 9000); await q.waitForTimeout(600); return ok; };

  // 1) en SAN PABLO con orden en BULEVARES
  await ir(P.sp);
  await abrirCam();
  let r = await q.evaluate(() => ({ cam: !!document.querySelector('#emaCam.ec-cb'), hoja: !!document.getElementById('ecElegir'), pill: (document.getElementById('cbPill') || {}).textContent || '', aviso: (document.getElementById('cbAviso') || {}).textContent || '', est: __camB.estado() }));
  c(r.cam && !r.hoja, '«Cámara» abre directo la cámara de la app (sin la hoja «¿De qué obra?»)');
  c(/PLAZA SAN PABLO/.test(r.pill) && /no es tu orden/.test(r.pill) && r.est.auto, 'la píldora: la obra la eligió el GPS · ' + r.pill.replace(/\s+/g, ' '));
  c(/Estás en PLAZA SAN PABLO/.test(r.aviso) && /Tu orden de hoy es PLAZA BULEVARES/.test(r.aviso) && /Las fotos van a PLAZA SAN PABLO/.test(r.aviso), 'cartel que no frena: «Estás en SAN PABLO. Tu orden de hoy es BULEVARES…» · ' + r.aviso.replace(/\s+/g, ' ').slice(0, 140));
  r = await tx('#cbPanel'); c(/Antes/i.test(r), 'sin orden ahí: el modo arranca en «Antes» · ' + r.slice(0, 60));
  await shot(q, '2_otra_obra');
  let n0 = (await fotos()).length + 1;
  let ok = await disparar(n0);
  let fs1 = (await fotos()).map(([, f]) => f).find((f) => f.plazaId === 'p2');
  c(ok && fs1 && fs1.obraAuto === true && fs1.obraElegida === 'p1' && fs1.distObra < 150 && !fs1.otId && !fs1.ubicDudosa, `1 toque (${toques.n}): la foto va a SAN PABLO como foto libre con obraAuto, obraElegida=Bulevares, distObra ${fs1 && fs1.distObra} m`);
  r = Object.values(await DB('adjuntos')).find((a) => a.plazaId === 'p2');
  c(r && r.obraAuto === true && r.obraElegida === 'p1' && r.distObra != null, 'en adjuntos también quedan obraAuto / obraElegida / distObra');
  r = await q.evaluate(() => __obraGps.flush());
  ok = await esperar(() => Object.values(window.__stubDB().avisosPush || {}).some((a) => /sin orden/.test(a.cuerpo || '')), null, 6000);
  let av = Object.values(await DB('avisosPush')).find((a) => /sin orden/.test(a.cuerpo || ''));
  c(ok && av && /lucia@/.test(av.email) && /Juan Pérez sacó 1 foto en PLAZA SAN PABLO sin orden \(tiene orden en PLAZA BULEVARES\)/.test(av.cuerpo), 'aviso al supervisor de su orden: ' + (av && av.cuerpo));
  await disparar(n0 + 0); await q.evaluate(() => __obraGps.flush()); await q.waitForTimeout(800);
  c(Object.values(await DB('avisosPush')).filter((a) => /sin orden/.test(a.cuerpo || '')).length === 1, 'uno solo por persona, obra y día');

  // 6) Modo obra: «Llegué» en otra obra registrada
  await q.evaluate(() => window.camaraApp.cerrar()); await q.waitForTimeout(300); await q.evaluate(() => __cuadrillaDia.ir('obra')); await q.waitForTimeout(2500);
  await toca('#cdApp [data-cd="boton"]', 2500);
  if (0) console.log('DBG', JSON.stringify(await q.evaluate(() => ({ est: __cuadrillaDia.estado(), pa: __cuadrillaDia.pasoActual().fase, ll: (__stubDB().ordenesTrabajo.ot1.campo || {}).llegada, cam: !!document.getElementById('emaCam'), cd: (document.getElementById('cdApp')||{}).textContent.slice(0,200) }))));
  r = await tx('#ogLlegue');
  c(/Estás en PLAZA SAN PABLO\. ¿Trabajás acá hoy\?/.test(r) && /No, voy a PLAZA BULEVARES/.test(r), 'Modo obra: «Estás en PLAZA SAN PABLO. ¿Trabajás acá hoy?» · ' + r.slice(0, 120));
  await shot(q, '7_modo_obra_otra');
  await toca('#ogLlegue [data-ogl="no"]', 900);
  r = await q.evaluate(() => ({ p: __cuadrillaDia.estado().pant, lleg: !!(((window.__stubDB().ordenesTrabajo.ot1.campo || {}).llegada || {})['juan perez']) }));
  c(r.p === 'llegar' && !r.lleg, '«No, voy a BULEVARES» → Cómo llegar (no anota la llegada)');
  await q.evaluate(() => __cuadrillaDia.ir('obra')); await q.waitForTimeout(1500);
  await toca('#cdApp [data-cd="boton"]', 2500); await toca('#ogLlegue [data-ogl="si"]', 400);
  await esperar(() => { const v = document.getElementById('ecVideo'); return v && v.videoWidth > 0 && document.getElementById('cbPill'); }, null, 9000); await q.waitForTimeout(1200);
  r = await q.evaluate(() => ({ est: __camB.estado(), lleg: !!(((window.__stubDB().ordenesTrabajo.ot1.campo || {}).llegada || {})['juan perez']) }));
  ok = await esperar(() => Object.values(window.__stubDB().avisosPush || {}).some((a) => /está trabajando en PLAZA SAN PABLO/.test(a.cuerpo || '')), null, 6000);
  c(r.est.obra && r.est.obra.id === 'p2' && !r.est.ot && !r.lleg && ok, '«Sí»: cámara en SAN PABLO como fotos libres (no se mezclan con las columnas de la orden) y aviso a la oficina');
  await q.evaluate(() => window.camaraApp.cerrar()); await q.waitForTimeout(400);

  // 2) caso normal en BULEVARES: 1 toque, Columna · Col 1 de su tarea
  await ir(P.bul); await abrirCam();
  await esperar(() => /BULEVARES/.test((document.getElementById('cbPill') || {}).textContent || ''), null, 6000);
  r = await q.evaluate(() => ({ pill: document.getElementById('cbPill').textContent, aviso: document.getElementById('cbAviso').textContent, panel: document.getElementById('cbPanel').textContent, modo: (document.querySelector('#cbPanel .cbx-modo.on') || {}).textContent }));
  c(/PLAZA BULEVARES/.test(r.pill) && /OT-2026-203/.test(r.pill) && !r.aviso, 'caso normal: «PLAZA BULEVARES · a 22 m · OT-2026-203» sin cartel · ' + r.pill.replace(/\s+/g, ' '));
  c(/Col 1/.test(r.panel) && /Columna/i.test(r.modo) && /0 de 4 con foto/i.test(r.panel), 'el modo ya elegido por la tarea: Columna · Col 1 (0 de 4 con foto) · ' + r.panel.replace(/\s+/g, ' ').slice(0, 80));
  await shot(q, '1_normal');
  n0 = (await fotos()).length + 1; ok = await disparar(n0 - 1 + 1);
  await esperar(() => { const o = window.__stubDB().ordenesTrabajo.ot1; return o.campo && o.campo.fotos && Object.keys(o.campo.fotos).length; }, null, 8000);
  const ot1 = (await DB('ordenesTrabajo')).ot1, cf = Object.values((ot1.campo || {}).fotos || {})[0] || {};
  fs1 = (await fotos()).map(([, f]) => f).find((f) => f.plazaId === 'p1');
  c(ok && toques.n === 1 && fs1 && fs1.otId === 'ot1' && fs1.obraAuto && cf.num === 'Col 1' && cf.k === 'montaje_prfv', `caso normal = ${toques.n} toque: foto en la orden (campo.fotos ${cf.num} · ${cf.k})`);
  await q.waitForTimeout(500);
  r = await tx('#cbPanel'); c(/Col 2/.test(r), 'después pasa sola a la Col 2 · ' + r.slice(0, 40));

  // 3) la lista de obras: las suyas + la de donde está
  await toca('#cbPill .cb-pill', 700);
  r = await q.evaluate(() => [...document.querySelectorAll('#cbHoja .cb-op')].map((b) => b.textContent.replace(/\s+/g, ' ').trim()));
  c(r.some((x) => /BULEVARES/.test(x)) && r.some((x) => /LAS ACACIAS/.test(x)) && r.some((x) => /Es otra obra/.test(x)) && !r.some((x) => /SAN PABLO|LOS ÁLAMOS|SIN PIN/.test(x)), 'la lista: Bulevares (cerca), Las Acacias (su orden de mañana) y «Es otra obra» · ' + r.join(' | ').slice(0, 200));
  await shot(q, '3_lista_obras');
  // elige a mano Las Acacias estando en Bulevares → aviso
  await q.evaluate(() => { const b = [...document.querySelectorAll('#cbHoja .cb-op')].find((x) => /LAS ACACIAS/.test(x.textContent)); b.click(); }); await q.waitForTimeout(600);
  r = await tx('#cbHoja');
  c(/Estás en PLAZA BULEVARES, no en PLAZA LAS ACACIAS/.test(r) && /Sí, en Bulevares/.test(r) && /No, es de Las Acacias \(decí por qué\)/.test(r), 'elige a mano otra obra: «Estás en BULEVARES, no en LAS ACACIAS. ¿Guardo la foto en Bulevares?»');
  await shot(q, '4_aviso_otra_obra');
  await toca('#cbHoja [data-cb="confNo"]', 500);
  r = await q.evaluate(() => document.querySelector('#cbHoja [data-cb="confMotOk"]').disabled);
  await q.fill('#cbMotivo', 'material para llevar mañana'); await q.waitForTimeout(200);
  const r2 = await q.evaluate(() => document.querySelector('#cbHoja [data-cb="confMotOk"]').disabled);
  c(r && !r2, '«No, es de Las Acacias» pide el porqué (sin motivo no deja)');
  await toca('#cbHoja [data-cb="confMotOk"]', 700);
  r = await q.evaluate(() => __camB.estado());
  c(r.obra && r.obra.id === 'p3' && !r.auto && /material/.test(r.motivo), 'queda Las Acacias, elegida a mano con el motivo');
  n0 = (await fotos()).length; await disparar(n0);
  fs1 = (await fotos()).map(([, f]) => f).find((f) => f.plazaId === 'p3');
  c(fs1 && fs1.obraAuto === false && fs1.motivoOtra === 'material para llevar mañana' && fs1.distObra > 150, `la foto queda en Las Acacias con motivoOtra y distObra ${fs1 && fs1.distObra} m`);

  // 4) «Es otra obra (decí por qué)»
  await toca('#cbPill .cb-pill', 600); await toca('#cbHoja [data-cb="otraObra"]', 600);
  r = await q.evaluate(() => ({ n: document.querySelectorAll('#cbLista .cb-op').length, mot: !!document.getElementById('cbMotivo'), dis: document.querySelector('#cbHoja [data-cb="otraOk"]').disabled }));
  c(r.n >= 5 && r.mot && r.dis, '«Es otra obra» abre la lista completa y pide el motivo · ' + JSON.stringify(r));
  await q.fill('#cbBusca', 'alamos'); await q.waitForTimeout(250);
  await q.evaluate(() => { const b = [...document.querySelectorAll('#cbLista .cb-op')].find((x) => x.style.display !== 'none' && /LOS ÁLAMOS/.test(x.textContent)); b && b.click(); }); await q.waitForTimeout(400);
  r = await q.evaluate(() => document.querySelector('#cbHoja [data-cb="otraOk"]').disabled);
  await q.fill('#cbMotivo', 'no se alcanzó a hacer la orden'); await q.waitForTimeout(200);
  await shot(q, '5_es_otra_obra');
  const r3 = await q.evaluate(() => document.querySelector('#cbHoja [data-cb="otraOk"]').disabled);
  c(r && !r3, 'sin motivo no deja; con el motivo, «Guardar las fotos en PLAZA LOS ÁLAMOS»');
  await toca('#cbHoja [data-cb="otraOk"]', 700);
  r = await q.evaluate(() => __camB.estado()); c(r.obra && r.obra.id === 'p4' && /alcanzó/.test(r.motivo), 'queda Los Álamos con el motivo');
  await toca('#emaCam [data-cb="listo"]', 600);
  c(!(await q.$('#emaCam')), '«Listo» sale de la cámara');

  // 5) GPS malo: «Elegí la obra», se usa lo elegido (la orden de hoy) y la foto queda con ubicDudosa
  await ir(P.sp, 260); await abrirCam();
  r = await q.evaluate(() => ({ pill: document.getElementById('cbPill').textContent, est: __camB.estado() }));
  c(/Elegí la obra/.test(r.pill) && /±260 m/.test(r.pill) && r.est.gps === 'malo' && r.est.obra && r.est.obra.id === 'p1', 'GPS malo: píldora «Elegí la obra · GPS impreciso ±260 m» y queda la obra de su orden · ' + r.pill.replace(/\s+/g, ' '));
  await toca('#cbPill .cb-pill', 700);
  r = await tx('#cbHoja'); c(/El GPS todavía no es bueno/.test(r) && /Podés sacar igual/.test(r) && /Cerca, según el GPS/.test(r), 'la hoja corta: GPS impreciso, cerca según el GPS, tus órdenes y «Es otra obra»');
  await shot(q, '6_gps_malo');
  await toca('#cbHoja [data-cb="cerrarH"]', 400);
  n0 = (await fotos()).length; await disparar(n0);
  fs1 = (await fotos()).map(([, f]) => f).sort((a, b) => b.ts - a.ts)[0];
  c(fs1 && fs1.ubicDudosa === true && fs1.plazaId === 'p1', 'se puede sacar igual: la foto va a la orden de hoy con ubicDudosa');
  await q.evaluate(() => window.camaraApp.cerrar()); await q.waitForTimeout(400);

  // 7) sin señal (GPS sí, internet no)
  await ir(P.sp); await J.ctx.setOffline(true); await q.evaluate(() => { window.__stubSinRed = true; window.dispatchEvent(new Event('offline')); });
  await abrirCam();
  r = await q.evaluate(() => __camB.estado()); c(r.obra && r.obra.id === 'p2' && r.auto, 'sin internet: el GPS elige igual SAN PABLO (obras en memoria)');
  const antes = (await fotos()).length; toques.n = 0; await toca('#emaCam [data-ec="disparar"]', 3500);
  await J.ctx.setOffline(false); await q.evaluate(() => { window.__stubSinRed = false; window.dispatchEvent(new Event('online')); });
  ok = await esperar((n) => Object.keys(window.__stubDB().fotosObra || {}).length > n + 1, antes, 20000);
  fs1 = (await fotos()).map(([, f]) => f).sort((a, b) => b.ts - a.ts)[0];
  c(ok && fs1 && fs1.plazaId === 'p2' && fs1.obraAuto === true, 'al volver la señal, la foto sube a SAN PABLO con obraAuto');
  await q.evaluate(() => window.camaraApp.cerrar());
  const errJ = J.errores.filter((e) => !/ResizeObserver|net::|Failed to fetch|NetworkError/i.test(e));
  c(!errJ.length, 'sin errores en la página de Juan' + (errJ.length ? ': ' + errJ.slice(0, 3).join(' | ') : ''));

  // 8) oficina: supervisor, cámara con buscador y nuestra zona
  const A = await otraPagina(J, Object.assign({ sesion: 'admin', espera: 5000, antes: camaraFalsa }, MOD, { crew: false })), p = A.page;
  await p.evaluate(() => { window.__obraGps.cargarFotos(true); }); await p.waitForTimeout(1500);
  r = await p.evaluate(() => window.__supervisor.hallazgos({ ahora: true }).filter((h) => h.cat === 'Fotos').map((h) => h.t));
  c(r.some((t) => /1 foto de PLAZA LOS ÁLAMOS se sacó en PLAZA LAS ACACIAS/.test(t)) && r.some((t) => /foto.* de PLAZA LAS ACACIAS se sacó en PLAZA BULEVARES/.test(t)) && r.some((t) => /Obras sin ubicación cargada \(1\)/.test(t)), 'Supervisor: «Fotos que parecen de otra obra» y «Obras sin ubicación cargada (1)» · ' + r.join(' | '));
  await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(800);
  await p.evaluate(() => window.__supervisor.hoja()); await p.waitForTimeout(500);
  r = await p.evaluate(() => [...document.querySelectorAll('#spHoja .sp-it')].filter((x) => /otra obra|se sac|sin ubicación/i.test(x.textContent)).map((x) => (x.querySelector('button') || {}).textContent));
  c(r.indexOf('Mover') >= 0 && r.indexOf('Ver') >= 0, 'en el Supervisor: botones «Mover» y «Ver» · ' + r.join(','));
  await p.evaluate(() => { const b = [...document.querySelectorAll('#spHoja .sp-it')].find((x) => /LOS ÁLAMOS se sacó/.test(x.textContent)); b.querySelector('button').click(); }); await p.waitForTimeout(700);
  await shot(p, '8_supervisor');
  await p.evaluate(() => { const g = [...document.querySelectorAll('#ogSup .og-grupo')].find((x) => /LOS ÁLAMOS se sacó/.test(x.textContent)); g.querySelector('[data-ogs="mover"]').click(); }); await p.waitForTimeout(500);
  r = await p.evaluate(() => (document.querySelector('#ogSup .og-conf') || {}).textContent || '');
  c(/¿Mover la foto a PLAZA LAS ACACIAS\?/.test(r), '«Mover» pide el «Sí» · ' + r.slice(0, 80));
  await p.evaluate(() => document.querySelector('#ogSup [data-ogs="si"]').click());
  ok = await p.waitForFunction(() => (window.__stubDB().fotosObra.fv1 || {}).plazaId === 'p3', null, { timeout: 8000 }).then(() => true, () => false);
  const fv = (await p.evaluate(() => window.__stubDB().fotosObra.fv1)), au = await p.evaluate(() => Object.values(window.__stubDB().auditoria || {}).find((a) => a.accion === 'supervisor_mover_fotos'));
  c(ok && fv.movidaDe && fv.movidaDe.plazaId === 'p4' && au && au.porSupervisor, '«Sí, moverlas»: la foto pasa a LAS ACACIAS con movidaDe y auditoría supervisor_mover_fotos');
  await p.evaluate(() => { const g = [...document.querySelectorAll('#ogSup .og-grupo')].find((x) => /LAS ACACIAS se sacó en PLAZA BULEVARES/.test(x.textContent)); g && g.querySelector('[data-ogs="bien"]').click(); }); await p.waitForTimeout(1200);
  r = await p.evaluate(() => Object.values(window.__stubDB().fotosObra).filter((f) => f.plazaId === 'p3' && f.motivoOtra).map((f) => !!f.ubicOk));
  const gq = await p.evaluate(() => window.__obraGps.grupos().length);
  c(r.length && r.every(Boolean) && gq === 0, '«Está bien»: queda anotado (ubicOk) y no vuelve a avisar');
  await p.evaluate(() => { document.getElementById('ogSup') && document.getElementById('ogSup').remove(); window.__obraGps.hojaSup({ tipo: 'obragpsSin' }); }); await p.waitForTimeout(400);
  r = await p.evaluate(() => (document.getElementById('ogSup') || {}).textContent || '');
  c(/PLAZA SIN PIN/.test(r) && /Cargar ubicación/.test(r), 'obras sin ubicación con «📍 Cargar ubicación»');
  await p.evaluate(() => document.querySelector('#ogSup [data-ogs="ubicar"]').click()); await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ v: !document.getElementById('viewMapa').hidden && getComputedStyle(document.getElementById('viewMapa')).display !== 'none', u: typeof mapaUbicarId !== 'undefined' ? mapaUbicarId : null }));
  c(r.v && r.u === 'p5', 'lleva al Mapa a poner el pin de esa obra');
  // la cámara de la oficina: buscador de todas las obras (nombres completos)
  await p.evaluate(() => mostrarVista('inicio')); await p.grantPermissions && 0;
  await A.ctx.setGeolocation({ latitude: P.ala[0] + 0.0002, longitude: P.ala[1], accuracy: 8 });
  await p.evaluate(() => document.getElementById('menuCamara').click());
  await p.waitForFunction(() => document.getElementById('cbPill'), null, { timeout: 9000 }).catch(() => { }); await p.waitForTimeout(1800);
  await p.click('#cbPill .cb-pill').catch(() => { }); await p.waitForTimeout(600);
  r = await p.evaluate(() => ({ busca: !!document.getElementById('cbBusca'), n: document.querySelectorAll('#cbLista .cb-op').length, otra: !!document.querySelector('#cbHoja [data-cb="otraObra"]') }));
  c(r.busca && r.n >= 4 && !r.otra, 'oficina: la píldora abre el buscador de todas las obras (sin pedir motivo) · ' + JSON.stringify(r));
  await shot(p, '9_oficina_buscar');
  await p.evaluate(() => { document.getElementById('cbHoja') && document.getElementById('cbHoja').remove(); window.camaraApp.cerrar(); }); await p.waitForTimeout(400);
  // nuestra zona
  r = await p.evaluate(() => { const z = window.__zonaContrato.resumen(); const k = ['p1', 'p2', 'p4', 'p5'].reduce((s, id) => s + (calcularValorPlaza(avanceObras.find((o) => o.id === id)).kAvanzado || 0), 0); const kB = calcularValorPlaza(avanceObras.find((o) => o.id === 'p3')).kAvanzado; return { z, k, kB }; });
  c(r.z.zona === 'A' && r.z.modulos === 18407 && r.z.n === 4 && Math.abs(r.z.k - r.k) < 1e-9 && r.kB > 0 && Math.abs(r.z.pct - r.k / 18407 * 100) < 1e-9, `anillo: solo la zona A (${r.z.n} plazas, ${r.z.k.toFixed(2)} K / 18.407; la B con ${r.kB.toFixed(2)} K y el barrio no cuentan)`);
  await p.evaluate(() => window.__inicioPro && window.__inicioPro.pintar()); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ c: (document.querySelector('#iniEje .ie-anillo .ie-c') || {}).textContent || '', z: (document.querySelector('#iniEje .ie-zona') || {}).textContent || '' }));
  c(/Zona Este/.test(r.c) && /Zona A \(Este\): 0 de 127 plazas terminadas · [\d,]+ % de 18\.407 módulos/.test(r.z), 'Inicio: «Zona Este» en el anillo y «' + r.z + '»');
  await shot(p, '10_inicio_zona');
  r = await p.evaluate(() => window.__zonaContrato.selectorHtml());
  c(/id="zcSel"/.test(r) && /A · Este/.test(r) && /35\.364/.test(r), 'Itemizado: «Nuestra zona» con selector (admin) y el total de la licitación aparte');
  await p.evaluate(() => { document.body.insertAdjacentHTML('beforeend', window.__zonaContrato.selectorHtml()); const s = document.getElementById('zcSel'); s.value = 'B'; s.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ db: ((window.__stubDB().configEquipo || {}).precios || {}).zonaContrato, z: window.__zonaContrato.resumen() }));
  c(r.db === 'B' && r.z.modulos === 9131 && r.z.n === 1, 'cambiar a B la guarda en configEquipo/precios y cuenta solo la B (9.131 módulos)');
  await p.evaluate(() => { const s = document.getElementById('zcSel'); s.value = 'A'; s.dispatchEvent(new Event('change', { bubbles: true })); document.getElementById('zcCaja').remove(); }); await p.waitForTimeout(500);
  const errA = A.errores.filter((e) => !/ResizeObserver|net::|Failed to fetch|NetworkError/i.test(e));
  c(!errA.length, 'sin errores en la página de la oficina' + (errA.length ? ': ' + errA.slice(0, 3).join(' | ') : ''));
  await J.browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
