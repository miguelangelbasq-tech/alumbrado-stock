// Pruebas v104 · «📌 Seguimiento» en Órdenes: cada tarea dada, a quién, qué se hizo y qué quedó; por persona y obra;
// «Darla hoy» / «Darla a otro» arma la orden nueva con lo que faltó (para hoy, con esa persona).
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v104' + (cel ? ' cel' : ''));
  const d = baseDatos();
  const ay = (() => { const t = new Date(); t.setDate(t.getDate() - 1); return t.toISOString().slice(0, 10); })(), an = (() => { const t = new Date(); t.setDate(t.getDate() - 3); return t.toISOString().slice(0, 10); })();
  const P = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], pn = ['juan perez', 'pedro gomez'];
  d.db.ordenesTrabajo = {
    o1: { numero: 'OT-2026-201', fecha: ay, plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'C1', personal: P, personalNombres: pn, actividades: ['montaje_prfv', 'tablero'], previsto: { montaje_prfv: 4, tablero: 1 }, asignada: { montaje_prfv: 'Pedro Gómez' }, estado: 'Terminada', creado: 1, cierre: { cantidades: { montaje_prfv: 2, tablero: 1 }, cerradoTs: 5, fecha: ay } },
    o3: { numero: 'OT-2026-203', fecha: new Date().toISOString().slice(0, 10), plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'C1', personal: P, personalNombres: pn, actividades: ['zanjeo'], previsto: { zanjeo: 10 }, estado: 'En curso', creado: 3, campo: { enviados: { 'Pedro Gómez': { nombre: 'Pedro Gómez', ts: 9 } }, marcas: {} } },
    o2: { numero: 'OT-2026-202', fecha: an, plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'C1', personal: P, personalNombres: pn, actividades: ['zanjeo'], previsto: { zanjeo: 30 }, estado: 'En curso', creado: 2 }
  };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, reglas: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => { mostrarVista('parte'); }); await p.waitForTimeout(600);
  let r = await p.evaluate(() => [...document.querySelectorAll('#subtabsOrdenes .subtab')].map((b) => b.dataset.sub));
  c(r.includes('seguimiento'), 'Órdenes tiene su pestaña propia «📌 Seguimiento» · ' + r.join(','));
  await p.click('#subtabsOrdenes [data-sub="seguimiento"]'); await p.waitForTimeout(600);
  r = await p.evaluate(() => { const el = document.getElementById('otSeguimientoPanel'); return { vis: el && getComputedStyle(el).display !== 'none', t: el ? el.innerText : '' }; });
  c(r.vis && /Pedro Gómez/.test(r.t) && /Hizo una parte/.test(r.t) && /Sin cerrar/.test(r.t), 'muestra la tarea de Pedro: se dieron 4, hizo 2 (falta 2) y la orden sin cerrar');
  c(!/Tablero[^\n]*Pendiente/.test(r.t), 'lo que se hizo completo no queda como pendiente');
  r = await p.evaluate(() => { const rows = window.__seguimiento.filas(); const m = rows.find((x) => x.k === 'montaje_prfv'); return m && { prev: m.prev, hecho: m.hecho, falta: m.falta, est: m.est, quien: m.q.nombres.join(), pend: m.pend }; });
  c(r && r.prev === 4 && r.hecho === 2 && r.falta === 2 && r.est === 'par' && r.quien === 'Pedro Gómez' && r.pend, 'se dio 4 a Pedro, hizo 2, faltan 2 · ' + JSON.stringify(r));
  r = await p.evaluate(() => { const t = document.getElementById('otSeguimientoPanel').innerText; return { per: /Por persona/.test(t), obra: /Por obra/.test(t) }; });
  c(r.per && r.obra, 'resumen por persona y por obra (dadas, hechas, pendientes, cumplió)');
  // darla a otra persona
  await p.evaluate(() => { const s = [...document.querySelectorAll('#otSeguimientoPanel select[data-sga="otro"]')][0]; s.value = 'Juan Pérez'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const ch = [...document.querySelectorAll('.ot-act-check')].filter((x) => x.checked).map((x) => x.value); const pv = document.querySelector('.ot-act-prev[data-id="montaje_prfv"]'); const q = document.querySelector('#otActividades .ot-act-quien[data-id="montaje_prfv"]'); return { ch, pv: pv && pv.value, q: q && q.value, fe: document.getElementById('otFecha').value, hoy: fechaAISO(new Date()), msg: (document.getElementById('otMsg') || {}).innerText || '' }; });
  c(r.ch.join() === 'montaje_prfv' && +r.pv === 2 && r.fe === r.hoy, '«Darla a otro»: orden nueva para hoy, solo con esa tarea y lo que faltó (2) · ' + JSON.stringify(r));
  c(/Juan/.test(r.q || '') && /Juan Pérez/.test(r.msg), 'y queda asignada a la persona elegida (Juan) · ' + r.q);
  // la cuadrilla la mandó por error → «↩ Sigue en obra»
  await p.evaluate(() => window.irSubOrdenes('tablero')); await p.waitForTimeout(600);
  r = await p.evaluate(() => { const b = document.querySelector('[data-otid="o3"] [data-ota="devolver"]'); return !!b; });
  c(r, 'en «Para revisar» la orden tiene «↩ Sigue en obra»');
  await p.click('[data-otid="o3"] [data-ota="devolver"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.o3; const card = document.querySelector('[data-otid="o3"]'); const col = card && card.closest('.ot-tb-col'); return { env: Object.keys((o.campo || {}).enviados || {}).length, est: o.estado, dv: !!o.devuelta, cierre: !!o.cierre, col: col ? col.querySelector('h3').innerText : '', aviso: Object.values(window.__stubDB().avisosPush || {}).some((a) => /Seguí con la orden/.test(a.titulo || '')) }; });
  c(r.env === 0 && r.est === 'En curso' && r.dv && !r.cierre && /En obra/.test(r.col), 'vuelve a «En obra» sin cerrarse (queda anotado quién la había mandado) · ' + JSON.stringify(r));
  c(r.aviso, 'y le avisa a quien la mandó que siga marcando');
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
