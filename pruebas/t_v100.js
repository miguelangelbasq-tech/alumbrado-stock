// Pruebas v100 · Avance de obra limpio y gráfico (sin etapas EPEC, valorización, balance de material ni fotos): rubros con %,
// colores por ítem, columnas a la vista, metros, total del ítem, sacar y agregar ítems · Legajo: material calculado vs. entregado.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const it = (desc, cod, q, un) => ({ desc, cod, cantNecesaria: q, un: un || 'Un.', cantInstalada: 0 });
function datos() {
  const d = baseDatos(), ahora = Date.now(), o = d.db.avanceObras.p1;
  o.valorItems = [{ id: 1, itemPliego: '6', cantidad: 8, cantidadAvanzada: 7 }, { id: 2, itemPliego: '15', cantidad: 120, cantidadAvanzada: 30 }, { id: 3, itemPliego: '10', cantidad: 1, cantidadAvanzada: 0 }, { id: 4, itemPliego: '75', cantidad: 3, cantidadAvanzada: 3 }];
  o.puntos = ['T1 · C1', 'T1 · C2', 'T1 · C3', 'T1 · C4', 'T1 · C5', 'T1 · C6', 'T1 · C7', 'T1 · C8'];
  o.secciones = [{ titulo: 'Materiales', items: [it('Cable Cu 4×4 mm²', 1010, 100, 'm'), it('Jabalina 1/2" × 1,5 m', 7015, 4), it('Bornera BPN 6 mm² gris — fase', 2009, 10), it('Luminaria vial LED 75 W', 6010, 8)] }];
  d.db.movimientos = {
    e1: { tipo: 'entrada', codigo: 1010, cantidad: 500, fecha: d.hoy, ts: ahora }, e2: { tipo: 'entrada', codigo: 7015, cantidad: 20, fecha: d.hoy, ts: ahora }, e3: { tipo: 'entrada', codigo: 2009, cantidad: 50, fecha: d.hoy, ts: ahora }, e4: { tipo: 'entrada', codigo: 3017, cantidad: 50, fecha: d.hoy, ts: ahora },
    s1: { tipo: 'salida', codigo: 1010, cantidad: 120, plazaId: 'p1', plazaNombre: 'Plaza San Martín', fecha: d.hoy, ts: ahora + 1 }, s2: { tipo: 'salida', codigo: 7015, cantidad: 4, plazaId: 'p1', plazaNombre: 'Plaza San Martín', fecha: d.hoy, ts: ahora + 2 },
    s3: { tipo: 'salida', codigo: 2009, cantidad: 6, plazaId: 'p1', plazaNombre: 'Plaza San Martín', fecha: d.hoy, ts: ahora + 3 }, s4: { tipo: 'salida', codigo: 3017, cantidad: 10, plazaId: 'p1', plazaNombre: 'Plaza San Martín', fecha: d.hoy, ts: ahora + 4 }
  };
  return d;
}
(async () => {
  const c = prueba('v100' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true }), p = A.page;
  const dlg = []; p.on('dialog', (d) => { dlg.push(d.message()); d.accept(); });
  const db = () => p.evaluate(() => JSON.parse(JSON.stringify(window.__stubDB().avanceObras.p1)));
  await p.evaluate(() => { mostrarVista('avance'); verAvanceDetalle('p1'); }); await p.waitForTimeout(900);
  let r = await p.evaluate(() => document.getElementById('avanceDetalleCard').innerText);
  c(!/criterio EPEC/i.test(r) && !/Valorización de la licitación/i.test(r) && !/Material entregado vs/i.test(r) && !/Fotos de la plaza/i.test(r), 'el Avance de obra ya no tiene etapas EPEC, valorización, material entregado vs. calculado ni fotos');
  r = await p.evaluate(() => { const d = document.querySelector('#avanceDetalleCard details.av-mas'); return d ? { abierto: d.open, txt: d.querySelector('summary').innerText } : null; });
  c(r && !r.abierto && /Materiales/.test(r.txt), 'los materiales del cómputo quedan plegados abajo («🧰 Materiales…»)');
  r = await p.evaluate(() => ({ fams: [...document.querySelectorAll('#aviSec .avp-fam')].map((x) => x.className.split(' ').pop() + '|' + x.innerText.replace(/\s+/g, ' ')), total: document.querySelector('#aviSec .avp-total b').textContent }));
  c(r.fams.length === 4 && /p3\|🏗 Columnas 88% 7 de 8/.test(r.fams[0]) && /p0\|🔌 Tablero/.test(r.fams[1]) && /p1\|⛏ Zanja y cruces 25% 30 de 120 m/.test(r.fams[2]) && /p4\|⏚ Puesta a tierra 100%/.test(r.fams[3]), 'rubros con su % y color: columnas 88 % (azul), tablero 0 % (gris), zanja 25 % (rojo), PAT 100 % (verde) · ' + JSON.stringify(r.fams));
  r = await p.evaluate(() => ({ cls: document.querySelector('#aviSec .avi-row[data-ref="v:1"]').className, chips: document.querySelectorAll('#aviSec .avi-row[data-ref="v:1"] .avi-u').length, on: document.querySelectorAll('#aviSec .avi-row[data-ref="v:1"] .avi-u.on').length, nom: document.querySelector('#aviSec .avi-row[data-ref="v:1"] .avi-u').textContent, num: !!document.querySelector('#aviSec .avi-row[data-ref="v:2"] .avi-num') }));
  c(/p3/.test(r.cls) && r.chips === 8 && r.on === 7 && /C1/.test(r.nom), 'las columnas se ven una por una sin desplegar (8, 7 marcadas, con su nombre) · ' + r.nom);
  c(r.num, 'los ítems por metro tienen el número para escribir a la vista');
  await p.evaluate(() => document.getElementById('aviSec').scrollIntoView({ block: 'start' })); await p.evaluate(() => window.scrollBy(0, -90));
  await p.screenshot({ path: __dirname + '/v100_avance' + (cel ? '_cel' : '') + '.png', fullPage: false });
  await p.click('#aviSec .avi-row[data-ref="v:1"] .avi-u:not(.on)'); await p.waitForTimeout(1200);
  r = await db();
  c(r.valorItems[0].cantidadAvanzada === 8, 'tocando la columna que falta: 8 de 8');
  r = await p.evaluate(() => document.querySelector('#aviSec .avi-row[data-ref="v:1"]').className + ' ' + document.querySelector('#aviSec .avp-fam').className);
  c(/p4/.test(r) && /lleno/.test(r), 'el ítem y el rubro se ponen en verde');
  await p.click('#aviSec .avi-row[data-ref="v:3"] [data-avi="mas"]'); await p.waitForTimeout(1200);
  r = await db(); c(r.valorItems[2].cantidadAvanzada === 1, '+ en el tablero: 1 de 1');
  // ⋯ total del ítem
  await p.click('#aviSec .avi-row[data-ref="v:2"] [data-avi="abrir"]'); await p.waitForTimeout(300);
  await p.fill('#aviSec .avi-total[data-ref="v:2"]', '150'); await p.dispatchEvent('#aviSec .avi-total[data-ref="v:2"]', 'change'); await p.waitForTimeout(1200);
  r = await db(); c(r.valorItems[1].cantidad === 150 && r.valorItems[1].cantidadAvanzada === 30, 'con «⋯» se cambia el total del ítem (zanja 120 → 150 m)');
  // agregar
  await p.selectOption('#aviAddItem', '82'); await p.fill('#aviAddCant', '5'); await p.click('#aviSec [data-avi="agregar"]'); await p.waitForTimeout(1200);
  r = await db(); c(r.valorItems.some((v) => String(v.itemPliego) === '82' && v.cantidad === 5), '«＋ Agregar un ítem del pliego»: ítem 82 (poda), 5');
  // sacar
  await p.click('#aviSec .avi-row[data-ref="v:4"] [data-avi="abrir"]'); await p.waitForTimeout(300);
  await p.click('#aviSec .avi-row[data-ref="v:4"] [data-avi="quitar"]'); await p.waitForTimeout(1200);
  r = await db(); c(!r.valorItems.some((v) => v.id === 4) && dlg.some((x) => /Sacar el ítem 75/.test(x)), '«🗑 Sacar este ítem» (pregunta antes)');
  // inspección
  await p.click('#avanceDetalleCard input[data-action="toggle-etapa"][data-etapa="inspeccion"]'); await p.waitForTimeout(1200);
  r = await db(); c(r.etapas && r.etapas.inspeccion === true, 'la inspección municipal se tilda en «Datos para el informe»');
  if (cel) { const w = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); c(w[0] <= w[1] + 1, 'celular: sin scroll de costado en el avance ' + w); }
  // ---- legajo: material calculado vs. entregado
  await p.evaluate(() => { try { localStorage.setItem('ema.lg.pleg', JSON.stringify({ '🧾 Material: calculado vs. entregado': true })); } catch (e) { } mostrarVista('obras'); abrirLegajo('p1'); }); await p.waitForTimeout(1500);
  r = await p.evaluate(() => { const s = document.getElementById('lgBalSec'); if (!s) return null; return { prev: (s.previousElementSibling.querySelector('h3') || {}).textContent, tiles: [...s.querySelectorAll('.lb-tile')].map((x) => x.className.split(' ')[1] + ':' + x.querySelector('b').textContent), filas: [...s.querySelectorAll('.lb-f')].map((x) => x.className.split(' ')[1] + ':' + x.querySelector('.lb-f-cab b').textContent.slice(0, 12)), gral: s.querySelector('.lb-gral b').textContent }; });
  c(r && /Material entregado/.test(r.prev), 'en el legajo, la sección nueva va debajo de «📦 Material entregado»');
  c(r && JSON.stringify(r.tiles) === JSON.stringify(['todo:5', 'falta:1', 'mas:1', 'ok:1', 'nada:1', 'sin:1']), 'tarjetas de colores: 5 materiales · 1 falta · 1 de más · 1 coincide · 1 sin entregar · 1 sin calcular · ' + JSON.stringify(r && r.tiles));
  c(r && r.filas[0].indexOf('mas:') === 0 && r.filas[r.filas.length - 1].indexOf('ok:') === 0, 'primero lo que salió de más y lo que falta, al final lo que coincide · ' + JSON.stringify(r && r.filas));
  c(r && r.gral === '65%', 'arriba: cuánto de lo calculado ya salió (65 %: cable y jabalina completos, BPN 6 de 10, luminaria 0) · ' + (r && r.gral));
  await p.click('#lgBalSec .lb-tile.falta'); await p.waitForTimeout(400);
  r = await p.evaluate(() => [...document.querySelectorAll('#lgBalSec .lb-f')].map((x) => x.innerText.replace(/\s+/g, ' ')));
  c(r.length === 1 && /BPN/.test(r[0]) && /Falta 4/.test(r[0]), 'tocando «Falta entregar» filtra: la BPN, faltan 4 · ' + r[0]);
  await p.click('#lgBalSec .lb-tile.todo'); await p.waitForTimeout(300);
  await p.screenshot({ path: __dirname + '/v100_legajo' + (cel ? '_cel' : '') + '.png' });
  // lo que sobró: devolver al pañol
  await p.click('#lgBalSec .lb-f.mas [data-lbal="sobra"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => { const i = document.querySelector('#lgBalSec [id^="sobranteCant"]'); return i ? i.value : null; });
  c(r === '20', 'el cable salió de más: propone devolver 20 m');
  await p.click('#lgBalSec [data-lbal="confirmar"]'); await p.waitForTimeout(1800);
  r = await p.evaluate(() => ({ mov: Object.values(window.__stubDB().movimientos).filter((m) => m.codigo === 1010 && m.tipo !== 'salida' && m.cantidad === 20).length, aviso: (document.querySelector('#lgBalSec .lb-aviso') || {}).textContent || '', mas: document.querySelectorAll('#lgBalSec .lb-f.mas').length }));
  c(r.mov === 1 && /volvieron al pañol/.test(r.aviso) && r.mas === 0, 'Confirmar: vuelve al pañol (queda el movimiento) y el cable pasa a «coincide» · ' + r.aviso);
  if (cel) { const w = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); c(w[0] <= w[1] + 1, 'celular: sin scroll de costado en el legajo ' + w); }
  const errs = A.errores.filter((e) => !/Missing or insufficient permissions/.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
