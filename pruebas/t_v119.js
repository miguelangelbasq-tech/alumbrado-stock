// Pruebas v119 · Editar una orden sin pisarla por error (cartel, sale sola, pregunta si cambia la fecha) · Planificación
// con calendario del mes (tocás un día y ves ese día) · imprimir eligiendo qué órdenes.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v119' + (cel ? ' cel' : ''));
  const d = baseDatos(), hoy = d.hoy;
  const mas = (f, n) => { const x = new Date(f + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const P = [{ nombre: 'Juan Pérez', rol: 'Oficial' }];
  d.db.ordenesTrabajo.v98 = { numero: 'OT-2026-098', fecha: mas(hoy, -20), plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'Civil', personal: P, personalNombres: ['juan perez'], actividades: ['poda'], previsto: { poda: 1 }, estado: 'Terminada', creado: 1, cierre: { cerradoTs: Date.now() - 86400000 * 19, cantidades: { poda: 1 } } };
  d.db.ordenesTrabajo.v2 = { numero: 'OT-2026-176', fecha: mas(hoy, 1), plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'Eléctrica', personal: P, personalNombres: ['juan perez'], actividades: ['poda'], previsto: { poda: 1 }, estado: 'Emitida', creado: 2 };
  d.db.ordenesTrabajo.v3 = { numero: 'OT-2026-177', fecha: mas(hoy, 1), plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'Eléctrica', personal: P, personalNombres: ['juan perez'], actividades: ['poda'], previsto: { poda: 1 }, estado: 'Emitida', creado: 3 };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, ofPasos: true }), p = A.page;
  const dialogos = []; p.on('dialog', (x) => { dialogos.push(x.message()); x.dismiss(); });
  // 1) editar: cartel bien visible
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(700);
  await p.evaluate(() => editarOrdenTrabajo('v98')); await p.waitForTimeout(1500);
  let r = await p.evaluate(() => { const b = document.getElementById('edBanner'); return { t: b ? b.textContent : '', vis: !!(b && b.offsetParent) }; });
  c(r.vis && /EDITANDO la OT-2026-098/.test(r.t) && /ya está cerrada/.test(r.t), 'al editar, cartel bien visible «Estás EDITANDO la OT-2026-098 … ya está cerrada» · ' + r.t.slice(0, 90));
  // cambiar la fecha y guardar → pregunta; si decís que no, no se toca
  const fNueva = mas(hoy, 1);
  await p.evaluate((f) => { const i = document.getElementById('otFecha'); i.value = f; i.dispatchEvent(new Event('change', { bubbles: true })); }, fNueva);
  await p.evaluate(() => window.emitirOrdenTrabajo()); await p.waitForTimeout(1200);
  r = await p.evaluate(() => window.__stubDB().ordenesTrabajo.v98.fecha);
  c(dialogos.some((m) => /cambiás la FECHA/.test(m) && /OT-2026-098/.test(m)) && r !== fNueva, 'si le cambiás la fecha, pregunta antes; con «Cancelar» la orden vieja queda como estaba · ' + (dialogos[0] || '').slice(0, 80));
  // salir con el botón: queda para una orden nueva
  await p.click('#edBanner [data-ed-salir]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ ed: typeof otEditandoId != 'undefined' ? otEditandoId : 'x', btn: document.getElementById('otEmitirBtn').textContent, ban: !!document.getElementById('edBanner'), msg: document.getElementById('otMsg').textContent }));
  c(r.ed === null && /Emitir orden de trabajo/.test(r.btn) && !r.ban && /orden nueva/.test(r.msg), '«✕ Salir y hacer una orden nueva» deja el formulario para una orden nueva · ' + r.msg.slice(0, 80));
  // cambiar de pestaña sin guardar también sale de la edición
  await p.evaluate(() => editarOrdenTrabajo('v98')); await p.waitForTimeout(800);
  await p.click('#subtabsOrdenes .subtab[data-sub="historial"]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => (typeof otEditandoId != 'undefined' ? otEditandoId : 'x'));
  c(r === null, 'si cambiás de pestaña sin guardar, la edición se cancela sola (no queda pisando la orden vieja)');
  // 2) calendario en Planificación
  await p.evaluate(() => mostrarVista('plan')); await p.waitForTimeout(1500);
  r = await p.evaluate((f) => { const b = document.querySelector(`#pcCal [data-pc-dia="${f}"]`); return { cal: !!document.getElementById('pcCal'), n: b ? (b.querySelector('.pc-n') || {}).textContent : '' }; }, fNueva);
  c(r.cal && r.n === '2', 'calendario del mes arriba de la semana, con cuántas órdenes tiene cada día · ' + JSON.stringify(r));
  await p.click(`#pcCal [data-pc-dia="${fNueva}"]`); await p.waitForTimeout(800);
  r = await p.evaluate(() => [...document.querySelectorAll('#planGrid .plan-day')].filter((x) => x.offsetParent).map((x) => x.dataset.fecha));
  c(r.length === 1 && r[0] === fNueva, 'tocás un día y se ve solo ese día (sin bajar buscando) · ' + r.join(','));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado en el celu · ' + sw); }
  await p.click('#pcCal [data-pc="semana"]'); await p.waitForTimeout(600);
  r = await p.evaluate(() => [...document.querySelectorAll('#planGrid .plan-day')].filter((x) => x.offsetParent).length);
  c(r === 7, '«Ver la semana completa» vuelve a los 7 días · ' + r);
  // 3) imprimir eligiendo
  await p.evaluate((f) => { abrirPanelImpresionPlan('semana'); const rr = document.querySelector('input[name="planPrintRango"][value="dia"]'); rr.checked = true; rr.dispatchEvent(new Event('change', { bubbles: true })); const i = document.getElementById('planPrintFecha'); i.value = f; i.dispatchEvent(new Event('change', { bubbles: true })); }, fNueva);
  await p.waitForTimeout(1500);
  r = await p.evaluate(() => [...document.querySelectorAll('#pcPrintSel [data-pcp-id]')].map((x) => x.closest('label').textContent));
  c(r.length === 2 && r.some((x) => /176/.test(x)) && r.some((x) => /177/.test(x)), 'al imprimir, lista de las órdenes del período con casillas · ' + r.length);
  await p.evaluate(() => { const x = [...document.querySelectorAll('#pcPrintSel [data-pcp-id]')].find((y) => /177/.test(y.closest('label').textContent)); x.checked = false; x.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(300);
  await p.evaluate(() => imprimirPlanDesdePanel('detallado')); await p.waitForTimeout(1800);
  r = await p.evaluate(() => { const f = document.querySelector('#hojaOv iframe'); const t = f && f.contentDocument ? f.contentDocument.body.textContent : ''; return { c176: /OT-2026-176/.test(t), c177: /OT-2026-177/.test(t) }; });
  c(r.c176 && !r.c177, 'se imprime solo lo tildado · ' + JSON.stringify(r));
  // 4) la hoja de abajo no queda mostrando otra orden mientras armás una nueva
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(500);
  await p.evaluate(() => verOrdenTrabajo('v98')); await p.waitForTimeout(1200);
  r = await p.evaluate(() => /OT-2026-098/.test((document.getElementById('parteResultCard') || {}).textContent || ''));
  const fv = await p.evaluate(() => { const i = [...document.querySelectorAll('#viewParteDiario > .grid > div:first-child input[type="text"], #viewParteDiario > .grid > div:first-child textarea')].find((x) => x.offsetParent); return i ? '#' + i.id : ''; });
  await p.fill(fv, 'algo'); await p.waitForTimeout(600);
  const r2 = await p.evaluate(() => { const rc = document.getElementById('parteResultCard'); return { vieja: /OT-2026-098/.test(rc.textContent), vacia: !!rc.querySelector('.empty-state') }; });
  c(r && !r2.vieja && r2.vacia, 'al empezar a armar una orden nueva, abajo ya no queda la hoja de otra orden (la 098) · campo ' + fv);
  await A.browser.close();
  // 5) sugerencias propias en el celu (en vez de la lista del teclado)
  const B = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3000, ofPasos: true, antes: () => { window.__sugForzar = true; } }), q = B.page;
  await q.evaluate(() => mostrarVista('parte')); await q.waitForTimeout(500);
  await q.click('#subtabsOrdenes .subtab[data-sub="nueva"]'); await q.waitForTimeout(1500);
  await q.evaluate(() => { const b = document.querySelector('#ofPasos .of-paso[data-of-ir="2"]'); b && b.click(); }); await q.waitForTimeout(1500);
  const sel = await q.evaluate(() => { const i = [...document.querySelectorAll('input[data-sug-list="personalLista"]')].find((x) => x.offsetParent); if (!i) return ''; i.id = i.id || 'sugPrueba'; return '#' + i.id; });
  await q.click(sel); await q.keyboard.type('Ju'); await q.waitForTimeout(500);
  r = await q.evaluate(() => { const k = document.getElementById('sugCaja'); return { vis: !!(k && k.getBoundingClientRect().height > 30), op: k ? [...k.querySelectorAll('button')].map((b) => b.dataset.v) : [], bg: k ? getComputedStyle(k).backgroundColor : '', lista: document.querySelectorAll('input[list]').length }; });
  c(r.vis && r.op.length > 0 && r.op.every((x) => /ju/i.test(x.normalize('NFD'))) && r.bg === 'rgb(255, 255, 255)' && r.lista === 0, 'en el celu, al escribir un nombre aparece una lista blanca de la app (no la del teclado) · ' + JSON.stringify(r));
  const elegido = await q.evaluate(() => document.querySelector('#sugCaja button').dataset.v);
  await q.click('#sugCaja button'); await q.waitForTimeout(400);
  r = await q.evaluate((s) => ({ v: document.querySelector(s).value, caja: !!document.getElementById('sugCaja') }), sel);
  c(r.v === elegido && !r.caja, 'tocás el nombre y queda puesto · ' + JSON.stringify(r));
  await B.browser.close(); process.exit(c.fin() ? 1 : 0);

})();
