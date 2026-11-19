// capturas de la v185: node cap185.js [cel]  (OUT=carpeta)
const { abrir, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel', OUT = process.env.OUT || '/tmp/cap185';
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const A = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3500, v185: true, v183: true, https: true });
  const p = A.page; p.on('dialog', (x) => x.accept()); await p.waitForTimeout(1200);
  await p.evaluate(() => {
    mostrarVista('calc');
    document.getElementById('obraNombre').value = 'Plaza San Martín'; document.getElementById('obraId').value = '1234';
    columnaGrupos.length = 0; columnaGrupos.push({ id: 1, altura: 7, columnas: 12 }); renderColumnaGrupos();
    vinculoGrupos.length = 0; vinculoGrupos.push({ id: 1, tipo: 'simple_400', columnas: 8, sobre: 'nueva' }, { id: 2, tipo: 'doble_400', columnas: 4, sobre: 'nueva' }); try { renderVinculoGrupos(); } catch (e) { }
    document.getElementById('vincCantCol').value = '12';
    const tc = document.getElementById('toggleCableado'); tc.checked = true; tc.dispatchEvent(new Event('change', { bubbles: true }));
    circuitos.length = 0; [6, 6].forEach((n, i) => { const pts = []; for (let j = 0; j < n; j++) pts.push({ id: i * 100 + j + 1, calibre: '4x4', largo: 20, esColumna: true }); circuitos.push({ id: i + 1, numero: i + 1, tablero: 1, puntos: pts }); }); try { renderCircuitos(); actualizarResumenCircuitos(); } catch (e) { }
    window.__calc185 && window.__calc185.ir('obra');
  });
  await p.waitForTimeout(600);
  await p.screenshot({ path: OUT + '/0_obra_antes' + (cel ? '_cel' : '') + '.png' });
  await p.click('#calcFlotante .cf-calc'); await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + '/9_resultado' + (cel ? '_cel' : '') + '.png', fullPage: !!process.env.FULL });
  for (const [i, k] of [[1, 'obra'], [2, 'col'], [3, 'lum'], [4, 'ele'], [5, 'civ'], [6, 'pat']]) {
    await p.evaluate((k) => { window.__calc185.ir(k); window.scrollTo(0, 0); }, k); await p.waitForTimeout(400);
    await p.screenshot({ path: OUT + '/' + i + '_' + k + (cel ? '_cel' : '') + '.png' });
  }
  // barrio
  await p.evaluate(() => { window.scrollTo(0, 0); document.querySelector('.cb-modo [data-modo="barrio"]').click(); });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const s = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } }; s('obraNombre', 'B° Los Robles'); s('b_lumCant', '24'); window.__calc185.ir('blum'); });
  await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + '/b1_blum' + (cel ? '_cel' : '') + '.png' });
  await p.click('#calcFlotante .cf-calc'); await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + '/b9_res' + (cel ? '_cel' : '') + '.png' });
  console.log(JSON.stringify(await p.evaluate(() => window.__calc185.estadoInterno())));
  console.log(await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth })));
  console.log((A.errores || []).join('\n'));
  await A.browser.close();
})();
