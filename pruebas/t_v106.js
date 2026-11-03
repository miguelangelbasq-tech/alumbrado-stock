// Pruebas v106 · al cerrar la orden, «＋ Agregar a alguien que también fue»: entra a la orden con sus horas y sus puntos.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v106' + (cel ? ' cel' : ''));
  const d = baseDatos(), hoy = d.hoy;
  d.db.ordenesTrabajo = { o1: { numero: 'OT-2026-301', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'C1', horaInicio: '07:00', horaFin: '13:00', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['tablero'], previsto: { tablero: 1 }, estado: 'En curso', creado: 1 } };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, reglas: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(500);
  await p.evaluate(() => window.abrirCierreOt('o1')); await p.waitForTimeout(600);
  let r = await p.evaluate(() => { const s = document.getElementById('ciAddSel'); return s ? [...s.options].map((o) => o.value) : null; });
  c(r && r.includes('Pedro Gómez') && !r.includes('Juan Pérez'), 'en el cierre está «＋ Agregar a alguien que también fue» con la nómina (sin los que ya están) · ' + JSON.stringify(r));
  await p.fill('#cierreCuerpo .cierre-qty[data-k="tablero"]', '1'); await p.fill('#cierreObs', 'se sumó Pedro');
  await p.selectOption('#ciAddSel', 'Pedro Gómez'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.o1; return { per: o.personal.map((x) => x.nombre + '/' + x.rol), pn: o.personalNombres, filas: [...document.querySelectorAll('#cierreCuerpo .cierre-persona b')].map((b) => b.innerText), qty: document.querySelector('#cierreCuerpo .cierre-qty[data-k="tablero"]').value, obs: document.getElementById('cierreObs').value, sel: !!document.getElementById('ciAddSel') }; });
  c(r.per.join() === 'Juan Pérez/Oficial,Pedro Gómez/Ayudante' && r.pn.includes('pedro gomez'), 'Pedro queda en la orden con su rol de la nómina (y en personalNombres) · ' + JSON.stringify(r.per));
  c(r.filas.includes('Pedro Gómez') && r.qty === '1' && r.obs === 'se sumó Pedro' && r.sel, 'el cierre lo muestra con sus horas y no se pierde lo que ya estaba cargado · ' + JSON.stringify(r));
  const msgs = []; p.on('dialog', (x) => msgs.push(x.message().slice(0, 80)));
  await p.evaluate(async () => { document.querySelectorAll('#cierreCuerpo input[type=radio]').forEach((x) => { if (/no/i.test(x.value)) x.checked = true; }); try { await guardarCierreOt(); } catch (e) { window.__errCierre = String(e); } });
  await p.waitForTimeout(2000);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.o1; const pts = typeof window.puntosDeOrden == 'function' ? window.puntosDeOrden(o) : null; return { cerrada: !!(o.cierre && o.cierre.cerradoTs), hp: o.cierre && o.cierre.horasPersona, pts }; });
  c(r.cerrada && r.hp && r.hp['Pedro Gómez'] > 0, 'al guardar el cierre, Pedro tiene sus horas · ' + JSON.stringify(r.hp));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
