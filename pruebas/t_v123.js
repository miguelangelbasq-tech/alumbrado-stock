// v123 · Mandar cada tarea apenas se termina: «✓ Se hizo» → fotos → «📤 Listo, enviar esta tarea» → ¿de qué hora a qué hora? → Enviar;
// «✗ No se hizo» → ¿por qué? → Enviar. Cada una queda en una línea verde o roja; con todas mandadas, la orden se envía sola.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v123' + (cel ? ' cel' : ''));
  const d = baseDatos(), o1 = d.db.ordenesTrabajo.ot1;
  o1.actividades = ['montaje_prfv', 'zanjeo']; o1.actividadesManuales = []; o1.previsto = { montaje_prfv: 2, zanjeo: 30 }; o1.creadoPor = 'oficina@ema.test';
  o1.campo = { seguridad: { epp: true, baliza: true, herram: true, corte: 'no', por: 'Juan Pérez', ts: Date.now() } };
  const A = await abrir({ sesion: 'juan', cel, datos: d, espera: 4500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true }), q = A.page;
  q.on('dialog', (x) => x.accept());
  await q.evaluate(() => mostrarVista('mistareas')); await q.waitForTimeout(1800);
  if (!await q.$('.mt-ot[data-ot="ot1"]')) { await q.click('.mt-item[data-mtabrir="ot1"]').catch(() => { }); await q.waitForTimeout(900); }
  const T = (k) => `.mt-ot[data-ot="ot1"] .mt-tarea[data-k="${k}"]`;
  const db = () => q.evaluate(() => window.__stubDB().ordenesTrabajo.ot1);
  let r = await q.evaluate(() => { const b = document.querySelector('.mt-ot[data-ot="ot1"] .mt-enviar'); return { oculto: !b || b.offsetParent === null, guia: (document.querySelector('.mt-ot[data-ot="ot1"] .et-guia') || {}).textContent || '' }; });
  c(r.oculto && /quedan 2 de 2/.test(r.guia), 'arranca con «mandá cada tarea» y sin el botón general · ' + r.guia.slice(0, 120));
  // 1) se hizo, sin fotos: no deja mandar
  await q.click(`${T('montaje_prfv')} [data-m="si"]`); await q.waitForTimeout(800);
  r = await q.evaluate((s) => !!document.querySelector(s + ' [data-et="si"]') && !document.querySelector(s + ' .mt-htarea'), T('montaje_prfv'));
  c(r, '«✓ Se hizo» muestra «📤 Listo, enviar esta tarea» (y ya no el recuadro de horas suelto)');
  await q.click(`${T('montaje_prfv')} [data-et="si"]`); await q.waitForTimeout(700);
  r = await q.evaluate(() => ({ pop: !!document.getElementById('etPop'), txt: [...document.querySelectorAll('body *')].filter((x) => x.offsetParent !== null && /faltan fotos/.test(x.textContent) && x.children.length < 4).map((x) => x.textContent)[0] || '' }));
  c(!r.pop && /faltan fotos/.test(r.txt), 'sin las fotos de esa tarea no la deja mandar · ' + r.txt.slice(0, 80));
  await q.click('button:has-text("Entendido")', { timeout: 2000 }).catch(() => { }); await q.waitForTimeout(300);
  // 2) con las fotos (las fotos ya se prueban en t_circuito): cartelito de horas → Enviar
  await q.evaluate(() => { window.mtFotosFaltan = () => 0; });
  await q.click(`${T('montaje_prfv')} [data-et="si"]`); await q.waitForTimeout(700);
  r = await q.evaluate(() => ({ pop: !!document.querySelector('#etPop #etIni'), ini: (document.getElementById('etIni') || {}).value, fin: (document.getElementById('etFin') || {}).value }));
  c(r.pop && r.ini === '07:00' && /^\d\d:\d\d$/.test(r.fin), 'sale «⏱ ¿De qué hora a qué hora?» con el inicio de la orden y la hora de ahora · ' + JSON.stringify(r));
  await q.fill('#etIni', '07:30'); await q.fill('#etFin', '07:00'); await q.click('#etPop [data-etp="enviar"]'); await q.waitForTimeout(400);
  r = await q.evaluate(() => (document.getElementById('etMsg') || {}).textContent || '');
  c(/después/.test(r), 'si el fin es antes del inicio, no manda · ' + r);
  await q.fill('#etFin', '09:45'); await q.waitForTimeout(200);
  r = await q.evaluate(() => (document.getElementById('etDur') || {}).textContent || '');
  c(/2 h 15 min/.test(r), 'muestra cuánto tardaron · ' + r);
  if (cel) await q.screenshot({ path: __dirname + '/v123_horas_cel.png' });
  await q.click('#etPop [data-etp="enviar"]'); await q.waitForTimeout(2000);
  let o = await db();
  r = { te: ((o.campo.tareaEnv || {}).montaje_prfv || {}), h: (o.campo.horasTarea || {}).montaje_prfv, env: Object.keys(o.campo.enviados || {}), fila: await q.evaluate((s) => { const x = document.querySelector(s); return x ? x.className + ' | ' + ((x.querySelector('.mt-env-res') || {}).textContent || '') : ''; }, T('montaje_prfv')) };
  c(Object.values(r.te).some((x) => x && x.estado === 'si') && r.h && r.h.ini === '07:30' && r.h.fin === '09:45' && !r.env.length, 'la tarea queda mandada con sus horas; la orden todavía no (falta otra) · ' + JSON.stringify(r).slice(0, 220));
  c(/mt-env env-si/.test(r.fila) && /Se hizo/.test(r.fila), 'la tarea mandada queda en una línea verde · ' + r.fila.slice(0, 160));
  r = await q.evaluate(() => Object.values(window.__stubDB().avisosPush || {}).filter((x) => x.tipo === 'envio' && /ema-envt-/.test(x.tag || '')).map((x) => x.email + ' · ' + x.cuerpo));
  c(r.some((x) => /oficina@ema\.test/.test(x) && /Montaje/i.test(x)), 'a la oficina le llega el aviso de esa tarea · ' + r.join(' / ').slice(0, 160));
  // 3) no se hizo → ¿por qué? → Enviar
  await q.click(`${T('zanjeo')} [data-m="no"]`); await q.waitForTimeout(700);
  r = await q.evaluate(() => document.querySelectorAll('#etPop [data-etm]').length);
  c(r >= 4, '«✗ No se hizo» abre el cartelito «¿Por qué?» con opciones rápidas · ' + r);
  await q.click('#etPop [data-etp="enviar"]'); await q.waitForTimeout(300);
  r = await q.evaluate(() => (document.getElementById('etMsg') || {}).textContent || '');
  c(/por qué/.test(r), 'sin elegir el porqué, no manda · ' + r);
  await q.click('#etPop [data-etm="lluvia"]'); await q.fill('#etNota', 'se inundó la zanja'); await q.waitForTimeout(200);
  if (cel) await q.screenshot({ path: __dirname + '/v123_porque_cel.png' });
  await q.click('#etPop [data-etp="enviar"]'); await q.waitForTimeout(3500);
  o = await db();
  r = { m: (o.campo.marcas || {}).zanjeo, te: (o.campo.tareaEnv || {}).zanjeo, env: Object.keys(o.campo.enviados || {}), hs: Object.values(o.campo.horas || {})[0] };
  c(r.m && r.m.hecho === false && r.m.motivo === 'lluvia' && /inund/.test(r.m.nota) && Object.values(r.te || {}).some((x) => x && x.estado === 'no'), 'queda «no se hizo» con el porqué · ' + JSON.stringify(r).slice(0, 200));
  c(r.env.length === 1 && r.hs && r.hs.ini === '07:30' && r.hs.fin === '09:45', 'con todas mandadas, la orden se envía sola (Mis horas: del primer inicio al último fin) · ' + JSON.stringify(r.hs));
  r = await q.evaluate(() => ({ tab: (document.querySelector('.mt-tab.on') || {}).dataset ? document.querySelector('.mt-tab.on').dataset.mtab : '', fila: (document.querySelector('.mt-tarea[data-k="zanjeo"]') || {}).className || '', res: ((document.querySelector('.mt-tarea[data-k="zanjeo"] .mt-env-res') || {}).textContent || '') }));
  c(r.tab === 'term' && /env-no/.test(r.fila) && /Lluvia/.test(r.res), 'pasa a Terminadas; lo que no se hizo queda en rojo con el porqué · ' + JSON.stringify(r).slice(0, 200));
  if (cel) await q.screenshot({ path: __dirname + '/v123_lista_cel.png' });
  // 4) corregir
  await q.click(`${T('zanjeo')} [data-et="corregir"]`); await q.waitForTimeout(1200);
  r = await q.evaluate((s) => (document.querySelector(s) || {}).className || '', T('zanjeo'));
  c(!/mt-env/.test(r), '«Corregir» vuelve a abrir la tarea · ' + r);
  // 5) foto que «espera permiso» pero ya estaba arriba (Pablo): se saca de la cola; la de una orden borrada no traba más
  r = await q.evaluate(async () => {
    const db = firebase.firestore();
    await db.collection('adjuntos').doc('yaArriba1').set({ otId: 'ot1', por: 'Juan Pérez', ts: Date.now() });
    const put = (it) => new Promise((ok, mal) => { const rq = indexedDB.open('ema-fotos-cola', 1); rq.onupgradeneeded = () => rq.result.createObjectStore('pend', { keyPath: 'k' }); rq.onsuccess = () => { const t = rq.result.transaction('pend', 'readwrite'); t.objectStore('pend').put(it); t.oncomplete = ok; t.onerror = mal; }; });
    await put({ k: 'adjuntos/yaArriba1', col: 'adjuntos', id: 'yaArriba1', data: { otId: 'ot1', por: 'Juan Pérez', ts: Date.now() }, ts: Date.now(), neg: Date.now() });
    await put({ k: 'adjuntos/sinPermiso1', col: 'adjuntos', id: 'sinPermiso1', data: { otId: 'otBorrada', otNumero: 'OT-2026-099', por: 'Juan Pérez', ts: Date.now() }, ts: Date.now(), neg: Date.now() });
    await window.__fotosSinSenal.contar(); const antes = window.__fotosSinSenal.cantidad();
    await window.__fotosSinSenal.reintentar(true); await new Promise((ok) => setTimeout(ok, 800)); await window.__fotosSinSenal.contar();
    const l = await window.__fotosSinSenal.todos();
    return { antes, despues: window.__fotosSinSenal.cantidad(), ids: l.map((x) => x.id), ya: window.__fotosYaArriba || 0 };
  });
  r.huerf = await q.evaluate(() => { const e = document.getElementById('fssHuerf'), a = document.getElementById('fssAviso'); return { h: e ? e.textContent : '', aviso: a ? a.textContent : '' }; });
  c(r.antes === 2 && r.despues === 0 && r.ya === 1 && r.ids.length === 1 && /ya no existe/.test(r.huerf.h) && !r.huerf.aviso, 'la foto que ya estaba arriba sale de la cola; la de una orden que no existe deja de trabar el candadito y lo dice · ' + JSON.stringify(r));
  await q.click('#fssHuerf'); await q.waitForTimeout(800);
  r = await q.evaluate(async () => ({ n: (await window.__fotosSinSenal.todos()).length, h: !!document.getElementById('fssHuerf') }));
  c(r.n === 0 && !r.h, '«Sacarlas del celu» limpia las fotos de la orden borrada · ' + JSON.stringify(r));
  if (cel) { const sw = await q.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  const errs = (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
