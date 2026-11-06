// v123 · Una tarea escrita a mano sin puntaje ya no traba «Guardar cambios» ni «Emitir» (OT-188 de Ángel: «sigue sin poder
// editarse»): se guarda como tarea suelta y avisa. Con mala señal, «Guardar cambios» no se queda colgado.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v123b' + (cel ? ' cel' : ''));
  const d = baseDatos(); const o = d.db.ordenesTrabajo.ot1; o.actividades = ['montaje_prfv']; o.previsto = { montaje_prfv: 2 };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  await p.evaluate(() => editarOrdenTrabajo('ot1')); await p.waitForTimeout(1500);
  await p.evaluate(() => { const i = document.querySelector('#otActividades .ot-act-prev[data-id="montaje_prfv"]'); i.value = '5'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(500);
  await p.evaluate(() => window.emitirOrdenTrabajo()); await p.waitForTimeout(2500);
  let r = await p.evaluate(() => { const x = window.__stubDB().ordenesTrabajo.ot1; return { prev: x.previsto, man: (x.actividadesManuales || []).map((m) => m.actividad), msg: document.getElementById('otMsg').textContent }; });
  c(r.prev.montaje_prfv === 5 && r.man.includes('Revisar tablero') && /quedó actualizada/.test(r.msg) && /sin puntaje/.test(r.msg), 'editar una orden con una tarea a mano sin puntaje guarda igual, la deja como tarea suelta y avisa · ' + JSON.stringify(r).slice(0, 220));
  // con mala señal, «Guardar cambios» vuelve a los segundos
  await p.evaluate(() => editarOrdenTrabajo('ot1')); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__otAddEspera = 1500; window.__stubSinRed = true; const i = document.querySelector('#otActividades .ot-act-prev[data-id="montaje_prfv"]'); i.value = '7'; i.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.evaluate(() => { window.emitirOrdenTrabajo(); }); await p.waitForTimeout(4000);
  r = await p.evaluate(() => ({ dis: document.getElementById('otEmitirBtn').disabled, m: document.getElementById('otMsg').textContent }));
  c(!r.dis && /se sube sola/.test(r.m), 'con la señal lenta, «Guardar cambios» no se cuelga y avisa · ' + r.m.slice(0, 160));
  await p.evaluate(() => { window.__stubSinRed = false; }); await p.waitForTimeout(1500);
  r = await p.evaluate(() => window.__stubDB().ordenesTrabajo.ot1.previsto.montaje_prfv);
  c(r === 7, 'cuando vuelve la señal, el cambio se guarda · ' + r);
  // las envolturas quedan quietas (antes se envolvían entre ellas sin fin: «se tilda», cartel repetido)
  r = await p.evaluate(async () => { const N = ['emitirOrdenTrabajo', 'datosOtDesdeFormulario', 'editarOrdenTrabajo', 'abrirCierreOt', 'mostrarVista', 'guardarCierreOt']; const a = N.map((n) => window[n]); await new Promise((ok) => setTimeout(ok, 8000)); return N.filter((n, i) => window[n] !== a[i]); });
  c(!r.length, 'con la app abierta, las funciones de las órdenes no se vuelven a envolver solas · ' + JSON.stringify(r));
  r = await p.evaluate(() => { const b = document.getElementById('ofBarra'); return b ? b.querySelectorAll('[data-of-emitir]').length : 0; });
  c(r === 0, 'la barra de abajo ya no tiene su propio «Emitir» · ' + r);
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
