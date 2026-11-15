// mide el Inicio de admin/oficina en el celu con CPU ×4: del reload al Inicio dibujado, y el trabajo largo de los primeros 10 s
const { abrir } = require('./h');
const { datos155 } = require('./datos155');
const cel = process.argv[2] !== 'pc', quien = process.argv[3] || 'admin', vueltas = +(process.argv[4] || 3);
(async () => {
  const MOD = { cel, espera: 4000, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, sugerida: true, inicio: true, nav: true, iaPro: true, leaflet: true, https: true,
    antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true;
      window.__lt = 0; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.startTime < 12000) window.__lt += e.duration; })).observe({ type: 'longtask', buffered: true }); } catch (e) { }
      const mo = new MutationObserver(() => { if (window.__tIni) return; const a = document.querySelector('#iniDir #drAt .ie-fila, #iniDir #drAt .dr-at, #iniEje #ieAtender .ie-fila, #iniEje #ieAtender .ie-nada, #iniDir #drAt .dr-nada'); if (a && a.offsetHeight) { window.__tIni = performance.now(); mo.disconnect(); } });
      mo.observe(document, { childList: true, subtree: true });
      const iv = setInterval(() => { try { const v = document.getElementById('viewInicio'); if (window.__inicioPro && window.__inicioPro.modo() && v && v.style.display !== 'none') { window.__tListo = performance.now(); clearInterval(iv); } } catch (e) { } }, 20); } };
  const A = await abrir(Object.assign({ sesion: quien, datos: datos155() }, MOD)); const p = A.page;
  const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const R = [];
  for (let i = 0; i < vueltas; i++) {
    await p.reload(); await p.waitForTimeout(12000);
    R.push(await p.evaluate(() => {
      const m = window.__inicioPro.modo(); let t0 = performance.now();
      if (m === 'eje') { const e = document.getElementById('iniEje'); e && e.remove(); window.__inicioPro.pintar(); }
      else { const e = document.getElementById('iniDir'); e && e.remove(); window.__inicioDir.pintar(); }
      const pint = Math.round(performance.now() - t0);
      return { listo: Math.round(window.__tListo || -1), dif: Math.round((window.__tIni || 0) - (window.__tListo || 0)), ini: Math.round(window.__tIni || -1), lt: Math.round(window.__lt), modo: m, pint, t: window.__iniUnico && window.__iniUnico.estado && window.__iniUnico.estado().t };
    }));
  }
  const med = (k) => R.map((x) => x[k]).sort((a, b) => a - b)[Math.floor(R.length / 2)];
  console.log(JSON.stringify({ app: process.env.APP.split('/').slice(-3).join('/'), quien, R, dif: med('dif'), ini: med('ini'), lt: med('lt'), pint: med('pint') }));
  await A.browser.close();
})();
