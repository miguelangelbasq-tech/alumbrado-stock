// Pruebas v120 · «✏ Editar» una tarea desde Seguimiento: cuánto, quién, sacarla de la orden, abrir la orden; cerrada no se toca.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v120b' + (cel ? ' cel' : ''));
  const d = baseDatos(), hoy = d.hoy, P = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  d.db.ordenesTrabajo.e1 = { numero: 'OT-2026-181', fecha: hoy, plazaId: 'p1', plazaNombre: 'IRENE GUTIERREZ', personal: P, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['poda', 'montaje_prfv'], previsto: { poda: 2, montaje_prfv: 3 }, estado: 'Emitida', creado: 1 };
  d.db.ordenesTrabajo.e2 = { numero: 'OT-2026-150', fecha: hoy, plazaId: 'p1', plazaNombre: 'CERRADA', personal: P, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['poda'], previsto: { poda: 1 }, estado: 'Terminada', creado: 2, cierre: { cerradoTs: Date.now(), cantidades: { poda: 1 } } };
  const A = await abrir({ sesion: 'admin', cel, dpr: cel ? 2 : 1, datos: d, espera: 3500 }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(500);
  await p.click('#subtabsOrdenes .subtab[data-sub="seguimiento"]'); await p.waitForTimeout(1500);
  await p.click('#otSeguimientoPanel [data-sgver="todas"]'); await p.waitForTimeout(800);
  const fila = (num, tarea) => p.evaluate(([n, t]) => { const el = document.getElementById('otSeguimientoPanel'); const i = (el.__vis || []).findIndex((x) => x.o.numero === n && x.k === t); return i; }, [num, tarea]);
  let i = await fila('OT-2026-181', 'poda');
  let r = await p.evaluate((i) => !!document.querySelector(`#otSeguimientoPanel button[data-sga="editar"][data-i="${i}"]`), i);
  c(i >= 0 && r, 'cada fila de Seguimiento tiene «✏ Editar»');
  await p.click(`#otSeguimientoPanel button[data-sga="editar"][data-i="${i}"]`); await p.waitForTimeout(500);
  if (cel) await p.screenshot({ path: __dirname + '/v120b_editar_cel.png' });
  r = await p.evaluate(() => ({ v: !!document.getElementById('sgEdit'), cant: (document.getElementById('seCant') || {}).value, q: [...document.querySelectorAll('#seQuien option')].map((o) => o.textContent) }));
  c(r.v && r.cant === '2' && r.q.length === 3, 'abre una ventana con cuánto (2) y quién (toda la cuadrilla, Juan, Pedro) · ' + JSON.stringify(r));
  await p.fill('#seCant', '5'); await p.selectOption('#seQuien', 'Pedro Gómez');
  await p.click('#sgEdit [data-se="guardar"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.e1; return { prev: o.previsto, asig: o.asignada, modal: !!document.getElementById('sgEdit') }; });
  c(r.prev.poda === 5 && r.asig.poda === 'Pedro Gómez' && r.prev.montaje_prfv === 3 && !r.modal, 'guarda: ahora son 5 y la hace Pedro (lo demás igual) · ' + JSON.stringify(r));
  // sacar una tarea
  await p.waitForTimeout(600); i = await fila('OT-2026-181', 'montaje_prfv');
  await p.click(`#otSeguimientoPanel button[data-sga="editar"][data-i="${i}"]`); await p.waitForTimeout(400);
  await p.click('#sgEdit [data-se="sacar"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.e1; return { acts: o.actividades, prev: o.previsto, sac: (o.tareasSacadas || []).map((x) => x.k) }; });
  c(r.acts.join() === 'poda' && r.prev.montaje_prfv == null && r.sac.includes('montaje_prfv'), '«🚫 Sacar esta tarea» la saca de la orden (queda anotado quién y cuándo) · ' + JSON.stringify(r));
  // la única que queda: no se puede sacar (se anula la orden)
  await p.waitForTimeout(600); i = await fila('OT-2026-181', 'poda');
  await p.click(`#otSeguimientoPanel button[data-sga="editar"][data-i="${i}"]`); await p.waitForTimeout(400);
  await p.click('#sgEdit [data-se="sacar"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ m: (document.getElementById('seMsg') || {}).textContent || '', acts: window.__stubDB().ordenesTrabajo.e1.actividades }));
  c(/única tarea/.test(r.m) && r.acts.length === 1, 'si es la única tarea, no la saca y avisa que se anula la orden · ' + r.m.slice(0, 60));
  await p.click('#sgEdit [data-se="cerrar"]'); await p.waitForTimeout(300);
  // orden cerrada: no se toca
  i = await fila('OT-2026-150', 'poda');
  await p.click(`#otSeguimientoPanel button[data-sga="editar"][data-i="${i}"]`); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ t: (document.querySelector('#sgEdit .se-aviso') || {}).textContent || '', g: !!document.querySelector('#sgEdit [data-se="guardar"]'), s: !!document.querySelector('#sgEdit [data-se="sacar"]') }));
  c(/ya está cerrada/.test(r.t) && !r.g && !r.s, 'con la orden ya cerrada no deja cambiar (solo abrirla) · ' + r.t.slice(0, 50));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
