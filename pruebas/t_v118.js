// Pruebas v118 · El cartel «tareas pendientes» de «Llenar orden» no se abre mientras se escribe en un campo (en el celu
// quedaba debajo del teclado y de la lista de obras). Desde la v119 no se abre solo: con el botón del resumen.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v118' + (cel ? ' cel' : ''));
  const d = baseDatos(); d.db.avanceObras.p1.valorItems = [{ id: 1, itemPliego: '5', cantidad: 7, cantidadAvanzada: 0 }];
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, porPartes: true, ofPasos: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(500);
  await p.click('#subtabsOrdenes .subtab[data-sub="nueva"]'); await p.waitForTimeout(1800);
  // escribiendo: se elige la obra mientras el cursor sigue en un campo de texto
  await p.evaluate(() => { const i = [...document.querySelectorAll('#viewParteDiario input[type="text"], #viewParteDiario input[type="search"], #viewParteDiario input:not([type])')].find((x) => x.offsetParent); i.focus(); window.__campo = i.id || i.className; const s = document.getElementById('otPlaza'); s.value = 'p1'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(2200);
  let r = await p.evaluate(() => ({ pend: !!document.getElementById('ofPend'), campo: window.__campo }));
  c(!r.pend, 'mientras escribís, el cartel de pendientes no aparece encima · campo ' + r.campo);
  await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ pend: !!document.getElementById('ofPend'), n: document.querySelectorAll('#ofPend [data-op-k]').length }));
  c(!r.pend, 'v119: tampoco aparece solo después (se abre con el botón, pedido de Ángel) · ' + JSON.stringify(r));
  await p.evaluate(() => { const b = document.querySelector('[data-of-pend]'); b && b.click(); }); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ pend: !!document.getElementById('ofPend'), n: document.querySelectorAll('#ofPend [data-op-k]').length, lista: !!document.getElementById('otPlazaBuscar').getAttribute('list') }));
  c(r.pend && r.n > 0 && !r.lista, 'con «📋 Ver las N tareas pendientes» se abre el cartel; el buscador de la obra no tiene lista del teclado · ' + JSON.stringify(r));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
