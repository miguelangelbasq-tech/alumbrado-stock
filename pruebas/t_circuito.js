// Circuito completo, como se usa hoy (v119, todo lo nuevo prendido): la oficina arma la orden por pasos → a la cuadrilla
// le aparece en el celu (Hoy), marca, saca foto y envía → la oficina la ve «para cerrar», la cierra → puntos y avance.
// Saca fotos de cada pantalla (cuadrilla en el celu) para revisarlas a ojo.
const { abrir, otraPagina, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const FOTO = __dirname + '/foto.jpg', shot = (pg, n) => pg.screenshot({ path: __dirname + '/circ_' + n + (cel ? '_cel' : '') + '.png' });
(async () => {
  const c = prueba('circuito' + (cel ? ' cel' : ''));
  const d = baseDatos();
  d.db.avanceObras.p1.valorItems = [{ id: 1, itemPliego: '5', cantidad: 2, cantidadAvanzada: 0 }];
  delete d.db.ordenesTrabajo.ot1;
  const MOD = { ofPasos: true, mtNuevo: true, porPartes: true, rsObra: true, lgPleg: true, reglas: true, https: true };
  const A = await abrir(Object.assign({ sesion: 'admin', cel, datos: d, espera: 3500 }, MOD)), p = A.page;
  const dlgA = []; p.on('dialog', (x) => { dlgA.push(x.message()); x.accept(); });
  await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }));
  await A.ctx.grantPermissions(['geolocation'], { origin: 'https://app.test' }); await A.ctx.setGeolocation({ latitude: -31.4271, longitude: -64.1889, accuracy: 8 });
  // 1) OFICINA: armar la orden por pasos
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  await p.click('#subtabsOrdenes .subtab[data-sub="nueva"]'); await p.waitForTimeout(1500);
  await p.click('#ofObrasRec [data-of-obra="p1"]').catch(async () => { await p.evaluate(() => { const s = document.getElementById('otPlaza'); s.value = 'p1'; s.dispatchEvent(new Event('change', { bubbles: true })); }); });
  await p.waitForTimeout(1200);
  let r = await p.evaluate(() => !!document.getElementById('ofPend'));
  c(!r, 'oficina: al elegir la obra no se abre nada encima');
  await p.click('#ofPasos .of-paso[data-of-ir="2"]'); await p.waitForTimeout(900);
  await p.evaluate(() => { window.__ordenNueva.sumarPersona('Juan Pérez'); window.__ordenNueva.sumarPersona('Pedro Gómez'); document.getElementById('otCuadrilla').value = 'Cuadrilla 1'; });
  await p.waitForTimeout(600); await shot(p, '1_gente');
  await p.click('#ofPasos .of-paso[data-of-ir="3"]'); await p.waitForTimeout(900);
  await p.evaluate(() => { const cb = document.querySelector('#otActividades .ot-act-check[value="montaje_prfv"]'); cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const i = document.querySelector('#otActividades .ot-act-prev[data-id="montaje_prfv"]'); i.value = '2'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(800);
  r = await p.evaluate(() => { const x = document.getElementById('ofResumen'); return x ? x.textContent.replace(/\s+/g, ' ') : ''; });
  c(/Juan Pérez/.test(r) && /pts/.test(r), 'oficina: el resumen muestra la gente y los puntos si terminan todo · ' + r.slice(0, 120));
  await shot(p, '2_resumen');
  await p.evaluate(() => document.getElementById('otEmitirBtn').click()); await p.waitForTimeout(2500);
  r = await p.evaluate(() => { const db = window.__stubDB(); const o = Object.entries(db.ordenesTrabajo || {}).map(([id, v]) => Object.assign({ id }, v)).find((x) => (x.actividades || []).includes('montaje_prfv')); const av = Object.values(db.avisosPush || {}).filter((x) => x.tipo === 'ot'); return { o: o && { id: o.id, numero: o.numero, pn: o.personalNombres, estado: o.estado }, av: av.map((x) => x.clave || x.email) }; });
  c(r.o && r.o.estado === 'Emitida' && r.o.pn.includes('juan perez') && r.av.length >= 2, 'oficina: la orden se emite y se avisa a cada uno · ' + JSON.stringify(r));
  const otId = r.o && r.o.id, num = r.o && r.o.numero;
  // 2) CUADRILLA (Juan, en el celu): le aparece en Hoy
  const J = await otraPagina(A, Object.assign({ sesion: 'juan', cel: true, espera: 4500 }, MOD)), q = J.page;
  const dlgJ = []; q.on('dialog', (x) => { dlgJ.push(x.message()); x.accept(); });
  await q.evaluate(() => mostrarVista('inicio')); await q.waitForTimeout(1200); await shot(q, '3_inicio_cuadrilla');
  await q.evaluate(() => mostrarVista('mistareas')); await q.waitForTimeout(1800);
  if (process.env.DBG) console.log('DBG', JSON.stringify(await q.evaluate(() => ({ ots: (typeof ordenesTrabajo != 'undefined' ? ordenesTrabajo : []).map((o) => o.numero + ' ' + o.fecha + ' ' + (o.personalNombres || []).join('/')), db: Object.keys(window.__stubDB().ordenesTrabajo || {}), yo: (window.PERMISOS && PERMISOS.yo && PERMISOS.yo()) ? PERMISOS.yo().personaClave : '', hoy: fechaAISO(new Date()), mt: (document.getElementById('mtApp') || {}).textContent.slice(0, 300), modo: window.__modoDatos && window.__modoDatos.estado && window.__modoDatos.estado() }))));
  // con una sola orden en Hoy, la app ya la abre directo (con «← Tareas de hoy (1)»)
  r = await q.evaluate((id) => ({ items: [...document.querySelectorAll('.mt-item')].map((x) => x.dataset.mtabrir), abierta: !!document.querySelector(`.mt-ot[data-ot="${id}"]`), hoy: ((document.querySelector('.mt-tab[data-mtab="hoy"]') || {}).textContent || '').replace(/\s+/g, ' ') }), otId);
  c((r.abierta || r.items.includes(otId)) && /Hoy 1/.test(r.hoy), 'cuadrilla: en «Hoy» aparece la orden nueva · ' + JSON.stringify(r));
  await shot(q, '4_mistareas');
  if (!r.abierta) await q.click(`.mt-item[data-mtabrir="${otId}"]`); await q.waitForTimeout(900); await shot(q, '5_orden');
  // al llegar: «🦺 Antes de arrancar» (EPP, balizamiento, herramientas, corte)
  for (const k of ['epp', 'baliza', 'herram']) { await q.click(`.mt-ot[data-ot="${otId}"] .mt-seg [data-seg="${k}"][data-v="true"]`).catch(() => { }); await q.waitForTimeout(400); }
  await q.click(`.mt-ot[data-ot="${otId}"] .mt-seg [data-seg="corte"][data-v="no"]`).catch(() => { }); await q.waitForTimeout(800);
  r = await q.evaluate((id) => { const o = ordenesTrabajo.find((x) => x.id === id) || {}; const s = (o.campo || {}).seguridad || {}; return { epp: s.epp, baliza: s.baliza, herram: s.herram, corte: s.corte }; }, otId);
  c(r.epp && r.baliza && r.herram && r.corte === 'no', 'cuadrilla: completa «🦺 Antes de arrancar» · ' + JSON.stringify(r));
  await shot(q, '5b_seguridad');
  const T = `.mt-ot[data-ot="${otId}"] .mt-tarea[data-k="montaje_prfv"]`;
  await q.click(`${T} [data-m="si"]`).catch(() => { }); await q.waitForTimeout(800);
  if (process.env.DBG) require('fs').writeFileSync(__dirname + '/x_tarea.html', await q.evaluate((s) => document.querySelector(s).outerHTML, T));
  const nIn = await q.$$eval(`${T} input.mt-foto-t`, (l) => l.length);
  const nFotos = () => q.evaluate((id) => Object.keys(((ordenesTrabajo.find((o) => o.id === id) || {}).campo || {}).fotos || {}).length, otId);
  const tomar = async (fn) => { const [ch] = await Promise.all([q.waitForEvent('filechooser', { timeout: 2500 }).catch(() => null), fn()]); return ch; };
  for (let i = 0; i < 2; i++) {
    const antes = await nFotos();
    // como la cuadrilla: tocar 📷 de la fila (si pide cuál es, elegir «Col N»); la cámara de la app, sin cámara en la prueba, ofrece la del teléfono
    let ch = await tomar(() => q.evaluate(([s, k]) => { const f = document.querySelectorAll(s + ' .fl-fila')[k]; const b = f && (f.querySelector('.fl-cam') || [...f.querySelectorAll('button,label')].find((x) => /Sacar la foto/.test(x.textContent))); b && b.click(); }, [T, i]));
    if (!ch && await q.$('#flSel [data-fl="usarArm"]')) { await q.click('#flSel [data-flarm="col"][data-v="' + (i + 1) + '"]').catch(() => { }); ch = await tomar(() => q.click('#flSel [data-fl="usarArm"]').catch(() => { })); }
    if (!ch && await q.$('#emaCam button:has-text("Abrir la cámara del teléfono")')) ch = await tomar(() => q.click('#emaCam button:has-text("Abrir la cámara del teléfono")').catch(() => { }));
    if (ch) { await q.waitForTimeout(1000); await ch.setFiles(FOTO); }
    await q.waitForFunction(([id, n]) => Object.keys(((ordenesTrabajo.find((o) => o.id === id) || {}).campo || {}).fotos || {}).length >= n, [otId, antes + 1], { timeout: 20000 }).catch(() => { });
    await q.waitForTimeout(600); await q.click('#emaCam [data-ec="cerrar"]', { timeout: 1000 }).catch(() => { }); await q.waitForTimeout(400);
  }
  r = await q.evaluate((id) => Object.keys(((ordenesTrabajo.find((o) => o.id === id) || {}).campo || {}).fotos || {}).length, otId);
  c(r >= 2, 'cuadrilla: saca una foto por columna (2) · ' + r + ' foto(s)');
  await shot(q, '6_marcada');
  // v123: cada tarea se manda sola; el botón general queda escondido hasta que estén todas
  r = await q.evaluate((id) => { const b = document.querySelector(`.mt-ot[data-ot="${id}"] .mt-enviar`); return { oculto: !b || b.offsetParent === null, guia: ((document.querySelector(`.mt-ot[data-ot="${id}"] .et-guia`) || {}).textContent || '') }; }, otId);
  c(r.oculto && /Mandá cada tarea/.test(r.guia), 'cuadrilla: le explica que mande cada tarea apenas la termina · ' + r.guia.slice(0, 80));
  await q.click(`${T} [data-et="si"]`, { timeout: 5000 }).catch((e) => console.log('   et:', e.message.split('\n')[0])); await q.waitForTimeout(700);
  await shot(q, '6b_horas');
  r = await q.evaluate(() => !!document.querySelector('#etPop #etIni'));
  c(r, 'cuadrilla: al tocar «📤 Listo, enviar esta tarea» sale el cartelito de qué hora a qué hora');
  await q.fill('#etPop #etIni', '08:00'); await q.fill('#etPop #etFin', '10:30'); await q.waitForTimeout(300);
  await q.click('#etPop [data-etp="enviar"]'); await q.waitForTimeout(3500);
  r = await q.evaluate((id) => (((window.__stubDB().ordenesTrabajo[id] || {}).campo || {}).horasTarea || {}).montaje_prfv || {}, otId);
  c(r.ini === '08:00' && r.fin === '10:30', 'cuadrilla: pone de qué hora a qué hora hizo la tarea · ' + JSON.stringify(r));
  r = await q.evaluate((id) => { const o = window.__stubDB().ordenesTrabajo[id] || {}; return { env: Object.keys((o.campo || {}).enviados || {}), marca: (((o.campo || {}).marcas || {}).montaje_prfv || {}).hecho, te: Object.keys(((o.campo || {}).tareaEnv || {}).montaje_prfv || {}) }; }, otId);
  c(r.env.length === 1 && r.marca && r.te.length === 1, 'cuadrilla: manda la tarea y, como era la única, la orden se envía sola · ' + JSON.stringify(r) + ' · avisos: ' + dlgJ.join(' / ').slice(0, 120));
  await shot(q, '7_enviada');
  const sw = await q.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  c(sw <= 0, 'cuadrilla: sin scroll de costado en el celu · ' + sw);
  // 3) OFICINA: la ve para cerrar, la cierra
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(500);
  await p.click('#subtabsOrdenes .subtab[data-sub="tablero"]'); await p.waitForTimeout(2500);
  r = await p.evaluate((n) => (document.getElementById('otTablero') || {}).textContent.replace(/\s+/g, ' '), num);
  c(new RegExp(num.replace(/-\d{4}-/, '-')).test(r) && /Para revisar 1/.test(r) && /revisar|cerrar/i.test(r), 'oficina: en el tablero la orden aparece para revisar y cerrar · ' + (r || '').slice(0, 300));
  await p.evaluate((id) => window.abrirCierreOt(id), otId); await p.waitForTimeout(1200);
  await p.fill('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]', '2'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ ini: (document.querySelector('#cierreCuerpo .cierre-hini[data-k="montaje_prfv"]') || {}).value, fin: (document.querySelector('#cierreCuerpo .cierre-hfin[data-k="montaje_prfv"]') || {}).value }));
  c(r.ini === '08:00' && r.fin === '10:30', 'oficina: en el cierre ya aparecen las horas que puso la cuadrilla · ' + JSON.stringify(r));
  await shot(p, '8_cierre');
  await p.evaluate(async () => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); await guardarCierreOt(); }); await p.waitForTimeout(2500);
  r = await p.evaluate((id) => { const db = window.__stubDB(); const o = db.ordenesTrabajo[id] || {}, ci = o.cierre || {}; const pts = ci.puntos || {}; return { cerrada: !!ci.cerradoTs, pts: pts.porPersona ? pts.porPersona.map((x) => x.nombre + ' ' + x.pts) : pts, it5: db.avanceObras.p1.valorItems[0].cantidadAvanzada, avP: Object.values(db.avisosPush || {}).filter((x) => x.tipo === 'puntos').length }; }, otId);
  c(r.cerrada && r.it5 > 0 && r.avP >= 2, 'oficina: al cerrar quedan los puntos, avanza el itemizado de la obra y se avisa a cada uno · ' + JSON.stringify(r));
  // 4) CUADRILLA: la ve en Terminadas
  await q.evaluate(() => mostrarVista('mistareas')); await q.waitForTimeout(1500);
  await q.click('.mt-tab[data-mtab="term"]').catch(() => { }); await q.waitForTimeout(800);
  r = await q.evaluate(() => [...document.querySelectorAll('.mt-item')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  c(r.some((x) => /Plaza San Martín/.test(x)), 'cuadrilla: la orden queda en «Terminadas» · ' + r.join(' | '));
  await shot(q, '9_terminadas');
  const errs = [].concat(A.errores || [], J.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|error occurred when fetching the script|ERR_|Failed to fetch|aborted/i.test(e));
  c(!errs.length, 'sin errores de JS en ningún lado ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
