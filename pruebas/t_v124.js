// v124 · Tablero de Órdenes por subíndices: Hoy · Para revisar y cerrar · Próximas (calendario) · Sin cerrar · Cerradas · Anuladas
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v124' + (cel ? ' cel' : ''));
  const d = baseDatos(), base = d.db.ordenesTrabajo.ot1, f = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const mk = (id, num, fecha, extra) => { d.db.ordenesTrabajo[id] = Object.assign(JSON.parse(JSON.stringify(base)), { numero: num, fecha, plazaNombre: 'PLAZA ' + id.toUpperCase() }, extra || {}); };
  mk('otProx', 'OT-2026-010', f(3)); mk('otProx2', 'OT-2026-011', f(3)); mk('otAtras', 'OT-2026-012', f(-2));
  mk('otRev', 'OT-2026-013', f(0), { estado: 'En curso', campo: { enviados: { 'Juan Pérez': { nombre: 'Juan Pérez', ts: Date.now() } } } });
  mk('otCerr', 'OT-2026-014', f(-1), { estado: 'Terminada', cierre: { cerradoTs: Date.now(), cantidades: {} } }); mk('otAnul', 'OT-2026-015', f(-1), { estado: 'Anulada' });
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true }), p = A.page;
  await p.evaluate(() => { try { localStorage.removeItem('ema.tb.sub'); } catch (e) { } mostrarVista('parte'); }); await p.waitForTimeout(600);
  await p.click('#subtabsOrdenes .subtab[data-sub="tablero"]'); await p.waitForTimeout(1500);
  const chips = () => p.evaluate(() => [...document.querySelectorAll('#otTablero [data-tbs]')].map((b) => b.dataset.tbs + ':' + b.querySelector('b').textContent + (b.classList.contains('on') ? '*' : '')).join(' '));
  const cards = () => p.evaluate(() => [...document.querySelectorAll('#otTablero .ot-tb-card .pl')].map((x) => x.textContent));
  let r = await chips();
  c(/obra:1/.test(r) && /revisar:1\*/.test(r) && /prox:2/.test(r) && /atras:1/.test(r) && /cerr:1/.test(r) && /anul:1/.test(r), 'subíndices con su cantidad; arranca en «Para revisar y cerrar» si hay algo · ' + r);
  r = await cards(); c(r.length === 1 && /OTREV/.test(r[0]) && await p.$('#otTablero .ot-tb-card [data-ota="cerrar"]'), 'en «Para revisar» está la que mandó la cuadrilla, con «Revisar y cerrar» · ' + r.join(', '));
  await p.click('#otTablero [data-tbs="prox"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ cal: !!document.querySelector('#otTablero .tb-cal'), con: [...document.querySelectorAll('#otTablero .tb-cal-g button.con')].map((b) => b.dataset.tbdia), sel: (document.querySelector('#otTablero .tb-cal-g button.sel') || {}).dataset }));
  c(r.cal && r.con.length >= 1, '«Próximas» muestra el calendario con los días que tienen órdenes · ' + JSON.stringify(r.con));
  r = await cards(); c(r.length === 2 && r.every((x) => /OTPROX/.test(x)), 'el día elegido muestra todas sus órdenes · ' + r.join(', '));
  if (cel) await p.screenshot({ path: __dirname + '/v124_prox_cel.png' });
  await p.click('#otTablero [data-tbs="atras"]'); await p.waitForTimeout(400); r = await cards(); c(r.length === 1 && /OTATRAS/.test(r[0]), '«Sin cerrar» las de días anteriores · ' + r);
  await p.click('#otTablero [data-tbs="cerr"]'); await p.waitForTimeout(400); r = await cards(); c(r.length === 1 && /OTCERR/.test(r[0]), '«Cerradas» aparte · ' + r);
  await p.click('#otTablero [data-tbs="anul"]'); await p.waitForTimeout(400); r = await cards(); c(r.length === 1 && /OTANUL/.test(r[0]), '«Anuladas» aparte · ' + r);
  await p.click('#otTablero [data-tbs="obra"]'); await p.waitForTimeout(400); r = await cards(); c(r.length === 1 && /Plaza San Martín/.test(r[0]), '«Hoy» las de hoy en obra · ' + r);
  await p.fill('#otTbBuscar', 'otprox'); await p.waitForTimeout(800);
  r = await chips(); c(/prox:2/.test(r) && /obra:0/.test(r), 'el buscador filtra todos los subíndices · ' + r);
  await p.fill('#otTbBuscar', ''); await p.waitForTimeout(500);
  await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(300); await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(300);
  await p.click('#subtabsOrdenes .subtab[data-sub="tablero"]'); await p.waitForTimeout(800);
  r = await chips(); c(/obra:\d\*/.test(r), 'se acuerda del último subíndice · ' + r);
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); await p.screenshot({ path: __dirname + '/v124_hoy_cel.png' }); }
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
