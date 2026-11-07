// v128 · En el cierre, por tarea: «👥 Puntos de esta tarea» (parejo o a mano) y «📅 Lo que falta, a otro día».
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v128' + (cel ? ' cel' : ''));
  const d = baseDatos(), o1 = d.db.ordenesTrabajo.ot1;
  Object.assign(o1, { actividades: ['montaje_prfv', 'zanjeo'], actividadesManuales: [], previsto: { montaje_prfv: 3, zanjeo: 30 }, estado: 'En curso' });
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  await p.evaluate(() => window.abrirCierreOt('ot1')); await p.waitForTimeout(1200);
  await p.evaluate(() => { const s = (k, v) => { const i = document.querySelector(`#cierreCuerpo .cierre-qty[data-k="${k}"]`); i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }; s('montaje_prfv', '2'); s('zanjeo', '30'); });
  await p.waitForTimeout(500);
  let r = await p.evaluate(() => [...document.querySelectorAll('#cierreCuerpo [data-ct]')].map((b) => b.dataset.ct + ':' + b.dataset.k));
  c(r.includes('pts:montaje_prfv') && r.includes('dia:montaje_prfv') && r.includes('pts:zanjeo'), 'cada tarea del cierre tiene «👥 Puntos» y «📅 Lo que falta» · ' + r.join(', '));
  const pu = await p.evaluate(() => +document.querySelector('#cierreCuerpo [data-ct="pts"][data-k="montaje_prfv"]').dataset.pu);
  await p.click('#cierreCuerpo [data-ct="pts"][data-k="montaje_prfv"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ gente: [...document.querySelectorAll('#ctPop [data-ctv]')].map((i) => i.value), tot: (document.querySelector('#ctPop .ct-tot') || {}).textContent || '' }));
  const tot = Math.round(2 * pu * 100) / 100;
  c(r.gente.length === 2 && Math.abs(+r.gente[0] - tot / 2) < 0.02 && Math.abs(+r.gente[1] - tot / 2) < 0.02, 'abre la ventana con la gente de la tarea y los puntos repartidos parejo · ' + JSON.stringify(r));
  if (cel) await p.screenshot({ path: __dirname + '/v128_pts_cel.png' });
  await p.fill('#ctPop [data-ctv="0"]', String(tot)); await p.dispatchEvent('#ctPop [data-ctv="0"]', 'change'); await p.waitForTimeout(200);
  await p.fill('#ctPop [data-ctv="1"]', '0'); await p.dispatchEvent('#ctPop [data-ctv="1"]', 'change'); await p.waitForTimeout(200);
  r = await p.evaluate(() => (document.querySelector('#ctPop .ct-aviso.ok') || {}).textContent || '');
  c(/Suman/.test(r), 'a mano: todo a uno y nada al otro, y suma · ' + r);
  await p.click('#ctPop [data-ctp="listo"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => (document.querySelector('#cierreCuerpo [data-ctinfo="montaje_prfv"]') || {}).textContent || '');
  c(/Repartida/.test(r) && /Juan/.test(r), 'la tarea muestra cómo quedó repartida · ' + r);
  // lo que falta, a otro día
  await p.click('#cierreCuerpo [data-ct="dia"][data-k="montaje_prfv"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ cant: document.getElementById('ctCant').value, fecha: document.getElementById('ctFecha').value, q: [...document.querySelectorAll('#ctPop [data-ctq]')].map((x) => x.dataset.ctq + (x.checked ? '*' : '')) }));
  c(r.cant === '1' && r.fecha && r.q.some((x) => /Juan Pérez\*/.test(x)) && r.q.some((x) => /Pedro Gómez\*/.test(x)), 'ofrece pasar lo que falta (1), para mañana, con la misma gente · ' + JSON.stringify(r));
  if (cel) await p.screenshot({ path: __dirname + '/v128_dia_cel.png' });
  await p.evaluate(() => { const x = [...document.querySelectorAll('#ctPop [data-ctq]')].find((i) => /Pedro/.test(i.dataset.ctq)); x.checked = false; });
  const fecha = r.fecha;
  await p.click('#ctPop [data-ctp="pasar"]'); await p.waitForTimeout(2000);
  r = await p.evaluate((f) => { const db = window.__stubDB(); const n = Object.entries(db.ordenesTrabajo).map(([id, o]) => Object.assign({ id }, o)).find((o) => o.id !== 'ot1' && o.fecha === f); return { n: n && { act: n.actividades, prev: n.previsto, per: (n.personal || []).map((x) => x.nombre), pn: n.personalNombres, as: n.asignada, viene: (n.vieneDe || {}).numero }, pasado: (db.ordenesTrabajo.ot1.pasadoA || {}).montaje_prfv, info: (document.querySelector('#cierreCuerpo [data-ctinfo="montaje_prfv"]') || {}).textContent || '', av: Object.values(db.avisosPush || {}).filter((x) => x.tipo === 'ot').map((x) => x.clave) }; }, fecha);
  c(r.n && r.n.act.join() === 'montaje_prfv' && r.n.prev.montaje_prfv === 1 && r.n.per.join() === 'Juan Pérez' && r.n.as.montaje_prfv === 'Juan Pérez' && r.n.viene === 'OT-2026-001', 'se arma la orden de ese día con lo que falta y la persona elegida · ' + JSON.stringify(r.n));
  c(r.pasado && /Pasada a la/.test(r.info) && r.av.includes('juan perez'), 'la orden de hoy anota a dónde se pasó y a Juan le llega el aviso · ' + r.info);
  // era otra tarea: el zanjeo en realidad fue otra
  const cand = await p.evaluate(() => { const b = window.baremoActual() || {}; const a = ACTIVIDADES_CATALOGO.find((x) => x.id !== 'zanjeo' && x.id !== 'montaje_prfv' && b[x.id] && b[x.id].pts > 0 && b[x.id].pts !== (b.zanjeo || {}).pts); return a && { id: a.id, label: a.label, pts: b[a.id].pts }; });
  await p.click('#cierreCuerpo [data-ct="cambiar"][data-k="zanjeo"]'); await p.waitForTimeout(400);
  await p.fill('#ctBusca', cand.label.slice(0, 12)); await p.waitForTimeout(300);
  await p.click(`#ctPop [data-ctsel="${cand.id}"]`); await p.waitForTimeout(200);
  if (cel) await p.screenshot({ path: __dirname + '/v128_cambiar_cel.png' });
  await p.click('#ctPop [data-ctp="cambiar"]'); await p.waitForTimeout(2500);
  r = await p.evaluate((k2) => { const o = window.__stubDB().ordenesTrabajo.ot1; return { act: o.actividades, prev: o.previsto, cam: (o.tareasCambiadas || []).length, qty: (document.querySelector(`#cierreCuerpo .cierre-qty[data-k="${k2}"]`) || {}).value, qm: (document.querySelector('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]') || {}).value, info: (document.querySelector(`#cierreCuerpo [data-ctinfo="${k2}"]`) || {}).textContent || '', pt: !!(window.__ptTarea.leer() || {}).montaje_prfv }; }, cand.id);
  c(r.act.includes(cand.id) && !r.act.includes('zanjeo') && r.prev[cand.id] === 30 && r.cam === 1 && r.qty === '30' && r.qm === '2' && /Antes era/.test(r.info) && r.pt, '«🔁 Era otra tarea» cambia la tarea en la orden y el cierre mantiene lo cargado · ' + JSON.stringify(r).slice(0, 220));
  // guardar el cierre: los puntos de la tarea quedan como se repartieron
  await p.evaluate(async () => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); await guardarCierreOt(); }); await p.waitForTimeout(2500);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.ot1, z = window.puntosDeOrden(o, true); const g = (n) => (z.porPersona.find((x) => x.nombre === n) || {}).pts || 0; const zr = z.renglones.find((x) => x.k !== 'montaje_prfv') || {}; return { pt: (o.cierre || {}).puntosTarea, juan: g('Juan Pérez'), pedro: g('Pedro Gómez'), zp: zr.pts || 0, mp: (z.renglones.find((x) => x.k === 'montaje_prfv') || {}).pts || 0 }; });
  const okJ = Math.abs(r.juan - (r.mp + r.zp * 1 / 1.6)) < 0.05, okP = Math.abs(r.pedro - r.zp * 0.6 / 1.6) < 0.05;
  c(r.pt && r.pt.montaje_prfv && okJ && okP, 'al cerrar, el montaje va todo a Juan y la otra tarea (con su valor) se reparte como siempre · ' + JSON.stringify(r));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  const errs = (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
