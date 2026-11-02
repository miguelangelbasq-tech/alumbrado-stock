// Pruebas v098 · las órdenes conviven con el avance de obra: lo cargado en el Avance de obra (itemizado) cuenta como hecho
// en el «Quedan N de T» de la orden; no se suma dos veces con lo que ya cerraron las órdenes; al cambiar el avance cambia la orden.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
function datos() {
  const d = baseDatos(), o = d.db.avanceObras.p1;
  o.valorItems = [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 7 }, { id: 2, itemPliego: '15', cantidad: 120, cantidadAvanzada: 50 }, { id: 3, itemPliego: '9', cantidad: 1, cantidadAvanzada: 0 }];
  // una orden cerrada de 3 columnas que ya avanzó el itemizado (está dentro de las 7): no se suma otra vez
  d.db.ordenesTrabajo.otC = { numero: 'OT-2026-050', fecha: '2026-10-30', plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'C1', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 3 }, estado: 'Terminada', cierre: { cantidades: { montaje_prfv: 3 }, cerradoTs: 2, fecha: '2026-10-30', avanceItems: [{ id: 1, delta: 3 }] }, personalNombres: ['juan perez'] };
  // el tablero: la orden cerró 1 pero no tocó el itemizado → manda la orden
  d.db.ordenesTrabajo.otT = { numero: 'OT-2026-051', fecha: '2026-10-31', plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'C1', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], actividades: ['tablero'], previsto: { tablero: 1 }, estado: 'Terminada', cierre: { cantidades: { tablero: 1 }, cerradoTs: 3, fecha: '2026-10-31' }, personalNombres: ['juan perez'] };
  return d;
}
(async () => {
  const c = prueba('v098' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 4000, reglas: true }), p = A.page;
  let r = await p.evaluate(() => window.saldoObra('p1'));
  const t = (k) => r && r.tareas[k];
  c(t('montaje_prfv') && t('montaje_prfv').total === 8 && t('montaje_prfv').hecho === 7 && t('montaje_prfv').queda === 1 && t('montaje_prfv').deAvance, 'avance 7 de 8 columnas → la orden dice que queda 1 (y no 8 − 7 − 3) · ' + JSON.stringify(t('montaje_prfv')));
  c(t('zanjeo') && t('zanjeo').total === 120 && t('zanjeo').queda === 70, 'zanjeo: 50 m de 120 en el avance → quedan 70 m');
  c(t('tablero') && t('tablero').hecho === 1 && t('tablero').queda === 0 && !t('tablero').deAvance, 'tablero: la orden cerrada cuenta aunque el avance esté en 0 (manda el mayor)');
  c(r && !r.sinCalculo, 'sin cálculo de materiales, el total sale del itemizado de la obra');
  // en el formulario
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  const b = p.locator('text=+ Nueva orden'); if (await b.count() && await b.first().isVisible()) { await b.first().click(); await p.waitForTimeout(500); }
  await p.selectOption('#otPlaza', 'p1'); await p.waitForTimeout(1500);
  const linea = (k) => p.evaluate((k) => { const el = document.getElementById('otAct_' + k); const s = el && el.closest('.ot-tarea').querySelector('.sa-linea'); return s ? s.innerText.replace(/\s+/g, ' ') : ''; }, k);
  let l = await linea('montaje_prfv');
  c(/Quedan 1 de 8/.test(l) && /hecho 7 \(según el Avance de obra\)/.test(l) && /Usar 1/.test(l), 'en la tarea: «Quedan 1 de 8 · hecho 7 (según el Avance de obra) · Usar 1» · ' + l);
  r = await p.evaluate(() => (document.getElementById('otSaldoResumen') || {}).innerText.replace(/\s+/g, ' '));
  c(/Avance de obra o en las órdenes cerradas/.test(r), 'el resumen dice de dónde sale lo hecho');
  await p.screenshot({ path: __dirname + '/v098_orden' + (cel ? '_cel' : '') + '.png' });
  // cambia el avance (alguien carga la 8ª columna) → la orden lo ve
  await p.evaluate(() => firebase.firestore().collection('avanceObras').doc('p1').update({ valorItems: [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 8 }, { id: 2, itemPliego: '15', cantidad: 120, cantidadAvanzada: 50 }, { id: 3, itemPliego: '9', cantidad: 1, cantidadAvanzada: 0 }] }));
  await p.waitForTimeout(1200);
  await p.evaluate(() => document.getElementById('otPlaza').dispatchEvent(new Event('change', { bubbles: true }))); await p.waitForTimeout(400);
  l = await linea('montaje_prfv');
  c(/Completo \(8 de 8\)/.test(l), 'se carga la 8ª en el avance → la orden dice «✓ Completo (8 de 8)» · ' + l);
  // asignar de más pide motivo
  await p.check('#otAct_montaje_prfv'); await p.fill('.ot-act-prev[data-id="montaje_prfv"]', '2'); await p.waitForTimeout(300);
  l = await linea('montaje_prfv');
  c(/2 más de lo que queda/.test(l), 'si igual asigna 2: «⚠ 2 más de lo que queda»');
  if (cel) { const w = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); c(w[0] <= w[1] + 1, 'celular: sin scroll de costado ' + w); }
  c(!A.errores.length, 'sin errores de JS ' + JSON.stringify(A.errores.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
