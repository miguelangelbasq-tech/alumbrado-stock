// v130 · Mis tareas por tarjetas: una tarea por vez con ‹ ›, «✅ N de M hechas · K te quedan», «⚠ Te faltan N fotos» con el porqué
// (deja mandar igual) y la galería de cada foto pedida con quién la sacó. La oficina ve en el cierre lo que se mandó sin fotos.
const { abrir, otraPagina, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v130' + (cel ? ' cel' : ''));
  const d = baseDatos(), o1 = d.db.ordenesTrabajo.ot1, ahora = Date.now();
  Object.assign(o1, { actividades: ['zanjeo', 'montaje_prfv'], actividadesManuales: [{ actividad: 'Limpieza final', detalle: '' }], previsto: { zanjeo: 10, montaje_prfv: 2 }, estado: 'En curso',
    campo: { seguridad: { epp: true, baliza: true, herram: true, corte: 'no' }, marcas: { zanjeo: { hecho: true, cant: 10, por: 'Juan Pérez' } },
      fotos: { f1: { k: 'zanjeo', num: 'Profundidad con la cinta', por: 'Juan Pérez', ts: ahora - 600000, mini: '' }, f2: { k: 'zanjeo', num: 'Profundidad con la cinta', por: 'Pedro Gómez', ts: ahora - 300000, mini: '' } } } });
  const MOD = { cel, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true, tarjetas: true };
  const A = await abrir(Object.assign({ sesion: 'admin', datos: d }, MOD)), p = A.page;
  p.on('dialog', (x) => x.accept());
  const J = await otraPagina(A, Object.assign({}, MOD, { sesion: 'juan', cel: true })), q = J.page;
  q.on('dialog', (x) => x.accept());
  await q.evaluate(() => mostrarVista('mistareas')); await q.waitForTimeout(1800);
  if (!(await q.$('.mt-ot[data-ot="ot1"]'))) { await q.click('.mt-item[data-mtabrir="ot1"]').catch(() => { }); await q.waitForTimeout(900); }
  const vis = () => q.evaluate(() => [...document.querySelectorAll('.mt-ot[data-ot="ot1"] .mt-tarea[data-k]')].filter((t) => t.offsetParent !== null).map((t) => t.dataset.k));
  let r = await q.evaluate(() => ({ nav: ((document.querySelector('.mt-tarea.mtc-on .mtc-cnt') || {}).textContent || ''), res: ((document.querySelector('.mt-ot[data-ot="ot1"] .mtc-res') || {}).textContent || '').replace(/\s+/g, ' '), fs: getComputedStyle(document.querySelector('.mt-tarea.mtc-on > .t')).fontSize }));
  const v0 = await vis();
  c(v0.length === 1 && v0[0] === 'zanjeo' && /TAREA 1 DE 3/.test(r.nav), 'se ve una sola tarea por vez (la primera sin mandar) con «TAREA 1 DE 3» · ' + JSON.stringify({ v0, nav: r.nav }));
  c(/0 de 3 hechas/.test(r.res) && /3 te quedan/.test(r.res) && parseFloat(r.fs) >= 20, 'arriba: «✅ 0 de 3 hechas · 3 te quedan» y el nombre de la tarea más grande · ' + r.res + ' · ' + r.fs);
  if (cel) await q.screenshot({ path: __dirname + '/v130_tarjeta_cel.png' });
  await q.click('.mtc-on [data-mtc="1"]'); await q.waitForTimeout(500);
  const v1 = await vis();
  await q.click('.mtc-on [data-mtcir="2"]'); await q.waitForTimeout(500);
  const v2 = await vis();
  await q.click('.mtc-on [data-mtcir="0"]'); await q.waitForTimeout(500);
  c(v1[0] === 'montaje_prfv' && v2.length === 1 && v2[0] !== 'zanjeo' && v2[0] !== 'montaje_prfv' && (await vis())[0] === 'zanjeo', 'con › y los puntitos pasa de una tarea a otra · ' + JSON.stringify([v1, v2]));
  // galería de la foto pedida
  await q.click('.mt-tarea[data-k="zanjeo"] .tm-fila.hecha .tm-tx'); await q.waitForTimeout(500);
  r = await q.evaluate(() => ({ n: document.querySelectorAll('#fgHoja [data-fgver]').length, t: ((document.querySelector('#fgHoja') || {}).textContent || '').replace(/\s+/g, ' ') }));
  c(r.n === 2 && /Profundidad con la cinta/.test(r.t) && /Juan/.test(r.t) && /Pedro/.test(r.t) && /2 de 4/.test(r.t), 'al tocar una foto pedida se abre su galería con quién sacó cada una · ' + r.t.slice(0, 120));
  if (cel) await q.screenshot({ path: __dirname + '/v130_galeria_cel.png' });
  await q.click('#fgHoja [data-fgvol]'); await q.waitForTimeout(300);
  // te faltan fotos → el porqué → se manda igual
  await q.click('.mt-tarea[data-k="zanjeo"] [data-et="si"]'); await q.waitForTimeout(600);
  r = await q.evaluate(() => ({ t: ((document.querySelector('#ffPop') || {}).textContent || '').replace(/\s+/g, ' '), li: document.querySelectorAll('#ffPop li').length, dis: (document.querySelector('#ffPop [data-ff="igual"]') || {}).disabled }));
  c(/Te faltan 4 fotos/.test(r.t) && r.li === 4 && r.dis === true, 'si faltan fotos sale «⚠ Te faltan 4 fotos» con cuáles, y para mandar igual hay que decir por qué · ' + r.t.slice(0, 120));
  if (cel) await q.screenshot({ path: __dirname + '/v130_faltan_cel.png' });
  await q.click('#ffPop [data-ffm="noche"]'); await q.fill('#ffNota', 'se hizo de noche'); await q.click('#ffPop [data-ff="igual"]'); await q.waitForTimeout(700);
  r = await q.evaluate(() => !!document.querySelector('#etPop #etIni'));
  c(r, 'después del porqué sigue con la hora, como siempre');
  await q.fill('#etPop #etIni', '08:00'); await q.fill('#etPop #etFin', '10:00'); await q.click('#etPop [data-etp="enviar"]'); await q.waitForTimeout(2500);
  r = await q.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.ot1, sf = ((o.campo || {}).sinFotos || {}).zanjeo || {}; const x = Object.values(sf)[0] || {}; return { mot: x.motivo, nota: x.nota, n: (x.faltan || []).length, env: Object.keys(((o.campo || {}).tareaEnv || {}).zanjeo || {}) }; });
  const v3 = await vis(), res3 = await q.evaluate(() => ((document.querySelector('.mt-ot[data-ot="ot1"] .mtc-res') || {}).textContent || '').replace(/\s+/g, ' '));
  c(r.mot === 'noche' && r.nota === 'se hizo de noche' && r.n === 4 && r.env.length === 1, 'se manda la tarea y queda anotado por qué faltan fotos · ' + JSON.stringify(r));
  c(v3[0] === 'montaje_prfv' && /1 de 3 hechas/.test(res3) && /2 te quedan/.test(res3), 'al mandarla pasa sola a la siguiente y arriba dice «1 de 3 hechas · 2 te quedan» · ' + JSON.stringify(v3) + ' ' + res3);
  if (cel) { const sw = await q.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado (cuadrilla) · ' + sw); }
  // la oficina lo ve en el cierre
  await p.waitForTimeout(1500);
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  await p.evaluate(() => window.abrirCierreOt('ot1')); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ((document.querySelector('#cierreCuerpo .ff-cierre') || {}).textContent || ''));
  c(/sin/.test(r) && /No se ve/.test(r) && /se hizo de noche/.test(r), 'la oficina ve en el cierre que se mandó sin fotos y por qué · ' + r);
  const errs = (A.errores || []).concat(J.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
