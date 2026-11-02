// Pruebas v045: avance de obra por itemizado (avance total, ítems con − / + / unidades, etapas solas, órdenes que suman).
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
function datos() {
  const d = baseDatos(), ahora = Date.now();
  Object.assign(d.db.avanceObras.p1, { tipoObra: 'plaza', valorItems: [{ id: 1, itemPliego: '6', cantidad: 10, cantidadAvanzada: 0 }, { id: 2, itemPliego: '15', cantidad: 300, cantidadAvanzada: 0 }], etapas: {}, puntos: Array.from({ length: 10 }, (_, i) => `T1 · C1 · Col ${i + 1}`) });
  d.db.avanceObras.p2 = { nombre: 'Plaza Sin Itemizado', tipoObra: 'plaza', etapas: { pozo: true, zanjeo: true }, creado: ahora };
  d.db.ordenesTrabajo = { otA: { numero: 'OT-2026-010', fecha: d.hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'Cuadrilla 1', responsable: 'Juan Pérez', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], actividades: ['montaje_prfv'], actividadesManuales: [{ actividad: 'Sellado de bases', detalle: '' }], estado: 'Emitida', creado: ahora, personalNombres: ['juan perez'] } };
  return d;
}
(async () => {
  const c = prueba('v045' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true });
  const p = A.page;
  p.on('dialog', (x) => x.accept());
  const pct = (id) => p.evaluate((i) => calcularAvanceEtapasPct(avanceObras.find((x) => x.id === i)), id);
  const db = () => p.evaluate(() => window.__stubDB().avanceObras.p1);
  let r = { p1: await pct('p1'), p2: await pct('p2') };
  c(r.p1 === 0 && r.p2 === 20, `el avance total sale del itemizado (plaza con itemizado sin hacer: 0 %); sin itemizado, de las etapas (20 %) · ${JSON.stringify(r)}`);
  await p.evaluate(() => { mostrarVista('avance'); verAvanceDetalle('p1'); }); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ sec: !!document.getElementById('aviSec'), filas: [...document.querySelectorAll('#aviSec .avi-row')].map((x) => x.querySelector('.avi-cant').innerText.replace(/\s+/g, ' ')) }));
  c(r.sec && r.filas.length === 2 && /^0 de 10/.test(r.filas[0]) && /^0 de 300/.test(r.filas[1]), 'el detalle tiene «📋 Avance por ítem» con cada ítem: ' + r.filas.join(' | '));
  for (let i = 0; i < 3; i++) { await p.click('#aviSec .avi-row[data-ref="v:1"] [data-avi="mas"]'); await p.waitForTimeout(250); }
  await p.waitForTimeout(1200);
  r = { v: (await db()).valorItems[0].cantidadAvanzada, pct: await pct('p1'), gauge: await p.evaluate(() => document.getElementById('avanceGaugePctText').textContent) };
  const esperado = await p.evaluate(() => { const k6 = window.epecItemK('6') || 1, k15 = window.epecItemK('15') || 1; return Math.round(3 * k6 / (10 * k6 + 300 * k15) * 100); });
  c(r.v === 3 && r.pct === esperado && r.gauge === esperado + '%', `con + tres veces quedan 3 de 10, se guarda y el avance total sube a ${r.pct} % (pesado por K) · ${JSON.stringify(r)}`);
  await p.click('#aviSec .avi-row[data-ref="v:1"] [data-avi="abrir"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => [...document.querySelectorAll('#aviSec .avi-row[data-ref="v:1"] .avi-u')].map((b) => b.textContent.trim()));
  c(r.length === 10 && /^✓ T1 · C1 · Col 1$/.test(r[0]) && r[3] === 'T1 · C1 · Col 4', 'desplegando se ven las 10 columnas con sus nombres, las 3 hechas tildadas');
  await p.click('#aviSec .avi-u[data-n="7"]'); await p.waitForTimeout(1200);
  r = await db();
  c(r.valorItems[0].cantidadAvanzada === 4 && JSON.stringify(r.valorItems[0].hechas) === '[1,2,3,7]', 'tildar la Col 7 suma una (4 de 10) y queda cuál es: ' + JSON.stringify(r.valorItems[0].hechas));
  await p.screenshot({ path: __dirname + '/v045_items' + (cel ? '_cel' : '') + '.png' });
  // todas → etapas solas
  await p.click('#aviSec .avi-row[data-ref="v:1"] [data-avi="todas"]'); await p.waitForTimeout(1300);
  r = await db();
  c(r.valorItems[0].cantidadAvanzada === 10 && r.etapas.izaje === true && r.etapasAuto && r.etapasAuto.izaje, 'con «✓ Todo» quedan 10 de 10 y la etapa «Izaje» se tilda sola');
  await p.click('#aviSec .avi-row[data-ref="v:1"] [data-avi="menos"]'); await p.waitForTimeout(1300);
  r = await db();
  c(r.valorItems[0].cantidadAvanzada === 9 && !r.etapas.izaje, 'si baja a 9, la etapa que tildó la app se destilda sola');
  // metros
  await p.click('#aviSec .avi-row[data-ref="v:2"] [data-avi="abrir"]'); await p.waitForTimeout(300);
  await p.fill('#aviSec .avi-num[data-ref="v:2"]', '120'); await p.dispatchEvent('#aviSec .avi-num[data-ref="v:2"]', 'change'); await p.waitForTimeout(1200);
  await p.click('#aviSec [data-avi="suma"][data-ref="v:2"][data-x="10"]'); await p.waitForTimeout(1200);
  r = await db();
  c(r.valorItems[1].cantidadAvanzada === 130, 'en los ítems por metro se escriben los metros (120) y +10 → 130 de 300');
  r = await p.evaluate(() => document.querySelector('#aviSec .avi-row[data-ref="v:1"] .avi-origen').innerText);
  c(/9 a mano/.test(r), 'dice de dónde viene: «✋ 9 a mano»');
  // v100: la tabla de valorización ya no está (lo pidió Ángel): el número se ve en la fila del ítem
  r = await p.evaluate(() => ['v:1', 'v:2'].map((k) => document.querySelector('#aviSec .avi-row[data-ref="' + k + '"] .avi-cant b').textContent));
  c(r[0] === '9' && r[1] === '130', 'cada ítem muestra lo hecho (9 y 130) ' + JSON.stringify(r));
  // orden de trabajo: la cuadrilla hizo 1 columna, la oficina carga y aprueba
  await p.evaluate(() => abrirCierreOt('otA')); await p.waitForTimeout(600);
  await p.fill('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]', '1'); await p.dispatchEvent('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]', 'input');
  await p.fill('#cierreCuerpo .cierre-qty[data-k="m:Sellado de bases"]', '20'); await p.dispatchEvent('#cierreCuerpo .cierre-qty[data-k="m:Sellado de bases"]', 'input'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ prop: [...document.querySelectorAll('#cierreEfectos .cierre-av-delta')].map((i) => i.dataset.id + ':' + i.value), libre: !!document.querySelector('#cierreEfectos .avs-item'), txt: (document.querySelector('#cierreEfectos .avs-bloque') || {}).innerText || '' }));
  c(r.prop[0] === '6:1' && r.libre && /Sellado de bases/.test(r.txt), 'al cerrar la orden propone sumar 1 al ítem 6, y la tarea escrita a mano («Sellado de bases») se puede mandar a un ítem: ' + JSON.stringify(r.prop));
  await p.selectOption('#cierreEfectos .avs-item', '15'); await p.waitForTimeout(200);
  await p.check('#cierreCuerpo input[name="coCierreResp"][value="no"]');
  await p.evaluate(() => guardarCierreOt()); await p.waitForTimeout(1800);
  r = await db();
  c(r.valorItems[0].cantidadAvanzada === 10 && r.valorItems[1].cantidadAvanzada === 150 && r.etapas.izaje === true, 'al aprobar (guardar lo hecho) el avance de obra avanza solo: 10 de 10 columnas (Izaje se tilda) y 150 m de zanja');
  r = await p.evaluate(() => JSON.parse(localStorage.getItem('ema.tareaItem') || '{}'));
  c(r['m:Sellado de bases'] === '15', 'la app se acuerda a qué ítem suma esa tarea');
  await p.evaluate(() => { mostrarVista('avance'); verAvanceDetalle('p1'); }); await p.waitForTimeout(700);
  r = await p.evaluate(() => [...document.querySelectorAll('#aviSec .avi-origen')].map((x) => x.innerText));
  c(/1 por órdenes \(OT-2026-010\)/.test(r[0]) && /9 a mano/.test(r[0]) && /20 por órdenes/.test(r[1]), 'en el avance se ve sin editar nada: «📋 1 por órdenes (OT-2026-010) · ✋ 9 a mano»');
  // si al volver a guardar el cierre se corta la conexión, el itemizado queda como estaba
  await p.evaluate(() => { window.__fbOtUpdateOrig = window.fbOtUpdate; window.fbOtUpdate = () => Promise.reject(new Error('sin red')); abrirCierreOt('otA'); }); await p.waitForTimeout(600);
  await p.check('#cierreCuerpo input[name="coCierreResp"][value="no"]');
  await p.evaluate(() => guardarCierreOt()); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.fbOtUpdate = window.__fbOtUpdateOrig; try { cerrarCuadroCierre(); } catch {} }); await p.waitForTimeout(1200);
  r = await p.evaluate(() => avanceObras.find((x) => x.id === 'p1').valorItems.map((v) => v.cantidadAvanzada));
  c(r[0] === 10 && r[1] === 150, 'si el cierre falla por la conexión, el itemizado queda igual (antes se perdía lo de la orden): ' + JSON.stringify(r));
  // tarjetas
  await p.evaluate(() => { document.querySelector('#subtabsAvance [data-sub="obra"]') && document.querySelector('#subtabsAvance [data-sub="obra"]').click(); }); await p.waitForTimeout(500);
  r = await p.evaluate(() => document.getElementById('viewAvance').innerText);
  const pp = await pct('p1');
  c(new RegExp(pp + '\\s*%').test(r), `las tarjetas muestran el mismo avance total (${pp} %)`);
  // v100: la lista de etapas a mano ya no está en el Avance de obra (se tildan solas); la inspección se tilda en «Datos para el informe»
  await p.evaluate(() => verAvanceDetalle('p1')); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ izaje: !!document.querySelector('#avanceDetalleCard input[data-action="toggle-etapa"][data-etapa="izaje"]'), insp: !!document.querySelector('#avanceDetalleCard input[data-action="toggle-etapa"][data-etapa="inspeccion"]') }));
  c(!r.izaje && r.insp, 'sin la lista de etapas; la inspección municipal se tilda aparte ' + JSON.stringify(r));
  const errs = A.errores.filter((e) => !/Missing or insufficient permissions|sin red/.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  const neg = await p.evaluate(() => (window.__stubNegadas || []).filter((x) => /^(create|update|delete|set)/.test(x)));
  c(!neg.length, 'la base (reglas simuladas) no rechazó nada ' + JSON.stringify(neg));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
