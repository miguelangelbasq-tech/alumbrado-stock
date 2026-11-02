// Pruebas v047: obra sin cantidades → armarlas (del cálculo o carga rápida) y que avance sola con las órdenes.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
function datos() {
  const d = baseDatos(), ahora = Date.now();
  Object.assign(d.db.avanceObras.p1, { tipoObra: 'plaza', etapas: { pozo: true }, puntos: Array.from({ length: 6 }, (_, i) => `Col ${i + 1}`) });
  d.db.avanceObras.p2 = { nombre: 'Plaza Dos', tipoObra: 'plaza', etapas: {}, creado: ahora };
  d.db.ordenesTrabajo = { otA: { numero: 'OT-2026-020', fecha: d.hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'Cuadrilla 1', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], actividades: ['montaje_prfv'], actividadesManuales: [], estado: 'Emitida', creado: ahora } };
  return d;
}
(async () => {
  const c = prueba('v047' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true });
  const p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => { mostrarVista('avance'); verAvanceDetalle('p1'); }); await p.waitForTimeout(800);
  let r = await p.evaluate(() => ({ txt: (document.getElementById('aviSec') || {}).textContent || '', col: (document.getElementById('aviR_col') || {}).value }));
  c(/todavía no tiene cargadas sus cantidades/i.test(r.txt) && /Traer del cálculo/.test(r.txt) && /Carga rápida/.test(r.txt) && r.col === '6', 'obra sin cantidades: ofrece traerlas del cálculo o la carga rápida, con las 6 columnas ya puestas (de los nombres de la obra)');
  await p.click('#aviSec [data-avi="traer"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => document.getElementById('aviSec').innerText);
  c(/No se encontró|cómputo/i.test(r), 'sin cálculo de la obra, «Traer del cálculo» lo dice y no se rompe');
  await p.screenshot({ path: __dirname + '/v047_armar' + (cel ? '_cel' : '') + '.png' });
  await p.fill('#aviR_tab', '1'); await p.fill('#aviR_zan', '120');
  await p.click('#aviSec [data-avi="rapido"]'); await p.waitForTimeout(1300);
  r = await p.evaluate(() => (window.__stubDB().avanceObras.p1.valorItems || []).map((v) => v.itemPliego + ':' + v.cantidad));
  c(r.join('|') === '6:6|9:1|15:120', 'la carga rápida carga columnas (ítem 6) 6, tablero (ítem 9) 1 y zanjeo (ítem 15) 120 m: ' + r.join(' | '));
  r = await p.evaluate(() => [...document.querySelectorAll('#aviSec .avi-row .avi-cant')].map((x) => x.innerText.replace(/\s+/g, ' ')));
  c(r.length === 3 && /^0 de 6/.test(r[0]), 'ya se ve la lista «0 de 6 columnas», «0 de 1», «0 de 120 m»');
  await p.click('#aviSec .avi-lista .avi-row >> nth=0 >> [data-avi="mas"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => window.__stubDB().avanceObras.p1.valorItems[0].cantidadAvanzada);
  c(r === 1, 'se suma a mano (1 de 6)');
  // la orden suma sola
  await p.evaluate(() => abrirCierreOt('otA')); await p.waitForTimeout(600);
  await p.fill('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]', '2'); await p.dispatchEvent('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]', 'input'); await p.waitForTimeout(400);
  const co = await p.$('#cierreCuerpo input[name="coCierreResp"][value="no"]'); if (co) await co.check();
  await p.evaluate(() => guardarCierreOt()); await p.waitForTimeout(1600);
  r = await p.evaluate(() => window.__stubDB().avanceObras.p1.valorItems[0].cantidadAvanzada);
  c(r === 3, 'al aprobar la orden (2 columnas montadas) queda 3 de 6 sola');
  // del cálculo (con un cómputo)
  await p.evaluate(() => { window.epecPreviaDe = () => ({ filas: [{ item: '6', cantidad: 8 }, { item: '9', cantidad: 1 }, { item: '75', cantidad: 9 }] }); verAvanceDetalle('p2'); }); await p.waitForTimeout(600);
  await p.click('#aviSec [data-avi="traer"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => document.querySelectorAll('#aviSec .avi-prev-chk').length);
  c(r === 3, 'con cálculo, muestra lo que trae (3 ítems) para tildar');
  await p.click('#aviSec .avi-prev-chk[data-i="2"]'); await p.click('#aviSec [data-avi="cargarPrevia"]'); await p.waitForTimeout(1300);
  r = await p.evaluate(() => (window.__stubDB().avanceObras.p2.valorItems || []).map((v) => v.itemPliego + ':' + v.cantidad));
  c(r.join('|') === '6:8|9:1', 'carga solo las tildadas (8 columnas y 1 tablero): ' + r.join(' | '));
  r = await p.evaluate(() => calcularAvanceEtapasPct(avanceObras.find((x) => x.id === 'p2')));
  c(r === 0, 'el avance de esa obra pasa a salir de sus cantidades (0 %)');
  const errs = A.errores.filter((e) => !/Missing or insufficient permissions/.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  const neg = await p.evaluate(() => (window.__stubNegadas || []).filter((x) => /^(create|update|delete|set)/.test(x)));
  c(!neg.length, 'la base (reglas simuladas) no rechazó nada ' + JSON.stringify(neg));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
