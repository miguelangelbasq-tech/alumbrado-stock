// v145 · capturas antes/después del degradé de las acciones y de las mayúsculas (APP = index a capturar, OUT = carpeta, ETQ = antes|despues)
const { abrir } = require('./h');
const { datos145 } = require('./datos145');
const OUT = process.env.OUT, ETQ = process.env.ETQ || 'x';
(async () => {
  let browser = null;
  for (const cel of [false, true]) {
    const m = cel ? 'cel' : 'pc';
    const A = await abrir({ sesion: 'admin', datos: datos145(), cel, espera: 4500, v145: true, inicio: true, nav: true, sugerida: true, ofPasos: true, browser }); browser = A.browser; const p = A.page;
    const sin = () => p.evaluate(() => { document.querySelectorAll('body *').forEach((e) => { if (e.children.length < 8 && /Falta cerrar la quincena/.test(e.textContent || '') && getComputedStyle(e).position === 'fixed') e.style.display = 'none'; }); });
    const foto = async (n) => { await sin(); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/${n}_${m}_${ETQ}.png` }); };
    await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(1500); await p.evaluate(() => { const e = document.querySelector('#iniEje .ie-chips'); e && e.scrollIntoView({ block: 'center' }); }); await foto('1_inicio');
    await p.evaluate(() => window.mostrarVista('calc')); await p.waitForTimeout(1200); await foto('2_calculadora');
    await p.evaluate(() => window.mostrarVista('obras')); await p.waitForTimeout(1200); await foto('3_obras');
    await p.evaluate(() => window.mostrarVista('parte')); await p.waitForTimeout(1500); await foto('4_ordenes');
    await p.evaluate(() => { const b = document.querySelector('#subtabsParte [data-sub="llenar"], .subtab[data-sub="llenar"]'); b && b.click(); }); await p.waitForTimeout(1000); await foto('5_llenar');
    await p.evaluate(() => window.mostrarVista('stock')); await p.waitForTimeout(1500); await foto('6_panol');
    await p.evaluate(() => window.mostrarVista('produccion')); await p.waitForTimeout(1500); await foto('7_produccion');
    await A.ctx.close();
    const B = await abrir({ sesion: 'juan', datos: datos145(), cel, espera: 4500, v145: true, crew: true, nav: true, browser }); const q = B.page;
    await q.evaluate(() => window.mostrarVista('inicio')); await q.waitForTimeout(1800);
    await q.evaluate(() => { try { window.__cuadrillaDia.ir('orden'); } catch (e) { } }); await q.waitForTimeout(1200); await q.screenshot({ path: `${OUT}/8_modo_obra_${m}_${ETQ}.png` });
    await B.ctx.close();
  }
  await browser.close();
})();
