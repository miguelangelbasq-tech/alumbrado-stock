// Pruebas v122 · Cambiar el orden de las tareas en «Llenar orden»: así quedan en la orden y así las ve la cuadrilla.
const { abrir, otraPagina, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v122' + (cel ? ' cel' : ''));
  const d = baseDatos(); delete d.db.ordenesTrabajo.ot1;
  const A = await abrir({ sesion: 'admin', cel, dpr: cel ? 2 : 1, datos: d, espera: 3500, ofPasos: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(500);
  await p.click('#subtabsOrdenes .subtab[data-sub="nueva"]'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const s = document.getElementById('otPlaza'); s.value = 'p1'; s.dispatchEvent(new Event('change', { bubbles: true })); window.__ordenNueva.sumarPersona('Juan Pérez'); document.getElementById('otCuadrilla').value = 'C1'; });
  await p.click('#ofPasos .of-paso[data-of-ir="3"]'); await p.waitForTimeout(800);
  await p.evaluate(() => ['poda', 'zanjeo', 'bpn'].forEach((k) => { const cb = document.querySelector(`#otActividades .ot-act-check[value="${k}"]`); cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); }));
  await p.waitForTimeout(900);
  const filas = () => p.evaluate(() => [...document.querySelectorAll('#otOrdenT .ord-l')].map((x) => x.textContent));
  let r = await filas();
  c(r.length === 3, 'arriba de las tareas aparece «↕ Orden de las tareas» con las 3 tildadas · ' + r.join(' / '));
  const ultima = r[2];
  await p.click('#otOrdenT .ord-f:nth-child(5) [data-ord="sube"]'); await p.waitForTimeout(200);
  await p.click('#otOrdenT .ord-f:nth-child(4) [data-ord="sube"]'); await p.waitForTimeout(300);
  r = await filas();
  c(r[0] === ultima, 'con ↑ la última pasa a ser la primera · ' + r.join(' / '));
  if (cel) { await p.evaluate(() => document.getElementById('otOrdenT').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300); await p.screenshot({ path: __dirname + '/v122_orden_cel.png' }); }
  await p.evaluate(() => { window.emitirOrdenTrabajo(); }); await p.waitForTimeout(600); await p.evaluate(() => { const b = document.querySelector('#uoPop [data-uo="otra"]'); b && b.click(); });   /* v144: con el fondo quieto (estilo V1) el «click» de Playwright esperaba un cuadro que no llegaba */ await p.waitForTimeout(1800);   // v126: si ya hay una para la misma obra y día, «Hacer otra orden igual»
  const o = await p.evaluate(() => Object.entries(window.__stubDB().ordenesTrabajo).map(([id, v]) => Object.assign({ id }, v))[0]);
  const labs = await p.evaluate((a) => a.map((k) => ACTIVIDADES_CATALOGO.find((x) => x.id === k).label), o.actividades);
  c(JSON.stringify(labs) === JSON.stringify(r), 'la orden se guarda con las tareas en ese orden · ' + labs.join(' / '));
  // la cuadrilla las ve en ese orden
  const J = await otraPagina(A, { sesion: 'juan', cel: true, espera: 4000, mtNuevo: true, ofPasos: true }), q = J.page;
  await q.evaluate(() => mostrarVista('mistareas')); await q.waitForTimeout(1800);
  r = await q.evaluate((id) => [...document.querySelectorAll(`.mt-ot[data-ot="${id}"] .mt-tarea .t`)].map((x) => x.textContent), o.id);
  c(JSON.stringify(r) === JSON.stringify(labs), 'en el celu de la cuadrilla salen en ese orden · ' + r.join(' / '));
  // editar: arranca con el orden guardado
  await p.evaluate((id) => editarOrdenTrabajo(id), o.id); await p.waitForTimeout(1200);
  r = await filas();
  c(JSON.stringify(r) === JSON.stringify(labs), 'al editar la orden, el orden de las tareas es el que tenía · ' + r.join(' / '));

  // «no me deja crear»: sin nombre de cuadrilla la orden sale igual (con los nombres de la gente)
  await p.evaluate(() => { try { window.__salirEdicionOt && window.__salirEdicionOt('prueba'); } catch (e) { } });
  await p.waitForTimeout(900);
  await p.evaluate(() => { const s = document.getElementById('otPlaza'); s.value = 'p1'; s.dispatchEvent(new Event('change', { bubbles: true })); document.getElementById('otCuadrilla').value = ''; personal = [{ nombre: 'Marcos Mancloba', rol: 'Oficial' }, { nombre: 'Mauricio Mainini', rol: 'Ayudante' }]; typeof renderPersonal == 'function' && renderPersonal(); const cb = document.querySelector('#otActividades .ot-act-check'); cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(600);
  const antes = await p.evaluate(() => Object.keys(window.__stubDB().ordenesTrabajo).length);
  await p.evaluate(() => { window.emitirOrdenTrabajo(); }); await p.waitForTimeout(600); await p.evaluate(() => { const b = document.querySelector('#uoPop [data-uo="otra"]'); b && b.click(); });   /* v144: con el fondo quieto (estilo V1) el «click» de Playwright esperaba un cuadro que no llegaba */ await p.waitForTimeout(1800);   // v126: si ya hay una para la misma obra y día, «Hacer otra orden igual»
  r = await p.evaluate(() => ({ n: Object.keys(window.__stubDB().ordenesTrabajo).length, c: Object.values(window.__stubDB().ordenesTrabajo).map((o) => o.cuadrilla), m: document.getElementById('otMsg').textContent }));
  c(r.n === antes + 1 && r.c.includes('Marcos y Mauricio'), 'sin nombre de cuadrilla la orden sale igual, con los nombres de la gente · ' + JSON.stringify(r).slice(0, 200));
  // señal lenta: «Emitir» no se queda colgado
  await p.evaluate(() => { window.__otAddEspera = 1500; window.__stubSinRed = true; document.getElementById('otCuadrilla').value = 'Lenta'; const cb = document.querySelector('#otActividades .ot-act-check'); cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { window.emitirOrdenTrabajo(); }); await p.waitForTimeout(600); await p.evaluate(() => { const b = document.querySelector('#uoPop [data-uo="otra"]'); b && b.click(); });   /* v144: con el fondo quieto (estilo V1) el «click» de Playwright esperaba un cuadro que no llegaba */ await p.waitForTimeout(3500);
  r = await p.evaluate(() => ({ m: document.getElementById('otMsg').textContent, dis: document.getElementById('otEmitirBtn').disabled }));
  c(/se sube sola/.test(r.m) && !r.dis, 'con la señal lenta, a los segundos avisa que quedó en el aparato y el botón vuelve · ' + r.m.slice(0, 160));
  await p.evaluate(() => { window.__stubSinRed = false; }); await p.waitForTimeout(1500);
  r = await p.evaluate(() => Object.values(window.__stubDB().ordenesTrabajo).filter((o) => o.cuadrilla === 'Lenta').length);
  c(r === 1, 'cuando vuelve la señal, la orden se sube (una sola) · ' + r + ' ' + await p.evaluate(() => JSON.stringify(Object.entries(window.__stubDB().ordenesTrabajo).map(([k, o]) => [k, o.numero, o.cuadrilla, o.actividades]))));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
