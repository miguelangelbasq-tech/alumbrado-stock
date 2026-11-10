// v144 · capturas antes/después del estilo V1: Inicio (oficina, pañol, cuadrilla), Órdenes, Pañol, Asistente y hoja A4 · celu y PC
const { abrir, otraPagina } = require('./h'); const { datos142 } = require('./datos142'); const fs = require('fs');
const OUT = process.env.OUT, cel = process.argv[2] === 'cel'; fs.mkdirSync(OUT, { recursive: true });
const MOD = { crew: true, nav: true, inicio: true, mtNuevo: true, tarjetas: true, ofPasos: true, rsObra: true, lgPleg: true, iaPro: true, https: true, cel };
(async () => {
  const d = datos142(); d.db.configEquipo.personal.asistente = { roles: ['admin', 'oficina', 'panol', 'cuadrilla', 'operario', 'mirar'] };
  const L = await abrir(Object.assign({ datos: d, sesion: 'lucia', espera: 5000 }, MOD)), p = L.page;
  const sfx = cel ? '_cel' : '_pc', shot = (pg, n) => pg.screenshot({ path: OUT + '/' + n + sfx + '.png' });
  await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(2500); await shot(p, '1_inicio_oficina');
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(1800); await shot(p, '4_ordenes');
  await p.evaluate(() => mostrarVista('stock')); await p.waitForTimeout(1800); await shot(p, '5_panol');
  await p.evaluate(() => { mostrarVista('inicio'); window.__asistenteAbrir && window.__asistenteAbrir(); }); await p.waitForTimeout(2500); await shot(p, '6_asistente');
  await p.evaluate(() => { try { window.__asistente && window.__asistente.cerrar(); } catch (e) { } abrirHojaImpresion('Prueba de hoja A4', '<p>Hoja de prueba: <b>1.050,00</b> · OT-2026-134</p><table><tr><th>Cód.</th><th>Descripción</th></tr><tr><td>2009</td><td>Bornera BPN 6 mm²</td></tr></table>'); }); await p.waitForTimeout(1500); await shot(p, '7_hoja_a4');
  const R = await otraPagina(L, Object.assign({ sesion: 'raul', espera: 5000 }, MOD)); await R.page.evaluate(() => mostrarVista('inicio')); await R.page.waitForTimeout(2500); await shot(R.page, '2_inicio_panol');
  const J = await otraPagina(L, Object.assign({ sesion: 'juan', espera: 5000 }, MOD)); await J.page.evaluate(() => mostrarVista('inicio')); await J.page.waitForTimeout(2500); await shot(J.page, '3_inicio_cuadrilla');
  const fonts = await p.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily.slice(0, 40), mono: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight).join(', ') }));
  console.log('FUENTES', JSON.stringify(fonts), 'errores', L.errores.concat(R.errores, J.errores).filter((e) => !/net::|Failed to fetch/.test(e)).slice(0, 3));
  await L.browser.close();
})().catch((e) => { console.error(e); process.exit(2); });
