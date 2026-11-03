// Pruebas v102 (4) · órdenes y puntos: el reinicio de puntos no descuenta lo ya pagado, lo de «toda la cuadrilla» cuenta una vez,
// anular una orden cerrada ofrece descontar el avance, «Quedan» con órdenes que siguen otro día y «Terminada» sin cierre,
// la cuadrilla no puede tocar una orden cerrada, 📥 en una anulada pregunta, el informe no cuenta anuladas.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v102d' + (cel ? ' cel' : ''));
  const d = baseDatos(), ahora = Date.now();
  const P = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  d.db.ordenesTrabajo.otQ = { numero: 'OT-2026-020', fecha: '2026-10-20', plazaId: 'p1', plazaNombre: 'Plaza San Martín', personal: P, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 2 }, estado: 'Terminada', cierre: { cantidades: { montaje_prfv: 2 }, cerradoTs: 5, fecha: '2026-10-20', horas: 8 } };
  d.db.cierresQuincena = { '2026-10-2': { key: '2026-10-2', estado: 'cerrada', desde: '2026-10-16', hasta: '2026-10-31', personas: [], valorPunto: 1 } };
  d.db.configEquipo.reinicios = { puntosDesde: '2026-11-01', saldoDesde: '2026-10-01' };
  d.db.avanceObras.p1.valorItems = [{ id: 1, itemPliego: '6', cantidad: 8, cantidadAvanzada: 3 }];
  d.db.ordenesTrabajo.otC = { numero: 'OT-2026-030', fecha: d.hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', personal: P, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 3 }, estado: 'Terminada', cierre: { cantidades: { montaje_prfv: 2 }, cerradoTs: 9, fecha: d.hoy, avanceItems: [{ id: 6, delta: 2 }] } };
  d.db.ordenesTrabajo.otS = { numero: 'OT-2026-031', fecha: d.hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', personal: P, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['zanjeo'], previsto: { zanjeo: 40 }, estado: 'En curso', cierre: { cantidades: { zanjeo: 25 }, cerradoTs: 10, fecha: d.hoy } };
  d.db.ordenesTrabajo.otT = { numero: 'OT-2026-032', fecha: d.hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', personal: P, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['tablero'], previsto: { tablero: 1 }, estado: 'Terminada' };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, reglas: true }), p = A.page;
  const dlg = []; p.on('dialog', (x) => { dlg.push(x.message()); x.accept(); });
  // ---- reinicio de puntos
  let r = await p.evaluate(() => { const Q = window.__quincenas; const C0 = Q.cierres(); C0['2026-10-2'] = C0['2026-10-2'] || { key: '2026-10-2', estado: 'cerrada', desde: '2026-10-16', hasta: '2026-10-31', personas: [], valorPunto: 1 }; const c = C0['2026-10-2']; c.personas = Q.calcular(c.desde, c.hasta).personas.map((x) => ({ nombre: x.nombre, pts: 0 })); window.__puntosSinFiltro = true; const pagado = Q.calcular(c.desde, c.hasta).personas.map((x) => ({ nombre: x.nombre, pts: x.pts })); window.__puntosSinFiltro = false; c.personas = pagado; return { aj: Q.ajustesPendientes(), pag: pagado.length }; });
  c(r.pag > 0 && r.aj.length === 0, 'con «contar puntos desde» después de una quincena ya pagada, la quincena abierta NO le descuenta lo cobrado (antes: ajuste negativo) · ' + JSON.stringify(r.aj).slice(0, 120));
  // ---- lo de «toda la cuadrilla»
  r = await p.evaluate(() => { const R = window.__reparto, ot = { previsto: { bpn: 10 }, reparto: { bpn: [{ nombre: 'Juan Pérez', cant: 4 }, { nombre: 'Pedro Gómez', cant: 3 }] }, campo: { marcasP: { bpn: { 'juan perez': { hecho: true, cant: 4, nombre: 'Juan Pérez' }, 'pedro gomez': { hecho: true, cant: 3, nombre: 'Pedro Gómez' }, 'mario luis': { hecho: true, cant: 3, nombre: 'Mario Luis' }, 'luis paz': { hecho: true, cant: 3, nombre: 'Luis Paz' } } } } }; return { ag: R.agregada(ot, 'bpn').cant, hp: R.hechoPorPersona(ot, 'bpn').map((x) => x.nombre.split(' ')[0] + ':' + x.cant).join(' ') }; });
  c(r.ag === 10 && r.hp === 'Juan:4 Pedro:3 Mario:1.5 Luis:1.5', 'BPN 10 repartida (Juan 4, Pedro 3, quedan 3 para todos): si Mario y Luis marcan los 3, suma 10 (no 13) y se reparten esos 3 · ' + JSON.stringify(r));
  // ---- «Quedan»
  r = await p.evaluate(() => { const s = window.saldoObra('p1'); return { zan: s.tareas.zanjeo, tab: s.tareas.tablero }; });
  c(r.zan && r.zan.hecho === 25 && r.zan.asignado === 15, 'orden cerrada que sigue otro día (25 de 40 m): 25 hechos y 15 siguen asignados (antes se liberaban) · ' + JSON.stringify(r.zan));
  c(r.tab && r.tab.hecho === 0 && r.tab.asignado === 1, '«Terminada» sin cargar lo hecho no cuenta como hecho (queda asignado) · ' + JSON.stringify(r.tab));
  // ---- anular una orden cerrada
  await p.evaluate(() => fbOtUpdate('otC', { estado: 'Anulada' })); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ av: window.__stubDB().avanceObras.p1.valorItems[0].cantidadAvanzada, rev: !!(window.__stubDB().ordenesTrabajo.otC.cierre.avanceRevertido) }));
  c(dlg.some((x) => /ya había sumado al avance/.test(x)) && r.av === 1 && r.rev, 'anular una orden ya cerrada pregunta y descuenta del avance lo que había sumado (3 → 1) · ' + JSON.stringify(r));
  // ---- 📥 en una anulada
  dlg.length = 0; p.removeAllListeners('dialog'); p.on('dialog', (x) => { dlg.push(x.message()); x.dismiss(); });
  r = await p.evaluate(() => { abrirCierreOt('otC'); const c = document.getElementById('cierreOt'); return !!(c && c.style.display !== 'none' && c.offsetParent); });
  c(dlg.some((x) => /está ANULADA/.test(x)) && !r, '📥 sobre una orden anulada pregunta antes de reactivarla (si decís que no, no abre)');
  // ---- informe de órdenes
  p.removeAllListeners('dialog'); p.on('dialog', (x) => x.accept());
  // ---- la cuadrilla no toca una orden cerrada
  const B = await abrir({ sesion: 'juan', cel, datos: d, espera: 3500, reglas: true, mtNuevo: true }); const q = B.page;
  r = await q.evaluate(() => { const ot = ordenesTrabajo.find((x) => x.id === 'otQ'); const antes = JSON.stringify(window.__stubDB().ordenesTrabajo.otQ.campo || {}); try { window.mtCampoGuardar ? window.mtCampoGuardar(ot, { 'campo.marcas.x': { hecho: true } }) : null; } catch (e) { } return antes; });
  await q.waitForTimeout(800);
  const r2 = await q.evaluate(() => JSON.stringify(window.__stubDB().ordenesTrabajo.otQ.campo || {}));
  c(r === r2, 'la cuadrilla ya no puede cambiar una orden que la oficina cerró (antes lo intentaba y la base lo rechazaba)');
  await B.browser.close();
  const errs = A.errores.filter((x) => !/Missing or insufficient permissions/.test(x));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
