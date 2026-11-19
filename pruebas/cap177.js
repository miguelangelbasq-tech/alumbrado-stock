// capturas del Inicio (admin y Dirección) en 1916×1000, 1440×900, 1280×800 y celu 390×844
const { abrir } = require('./h');
const { datos155 } = require('./datos155');
const OUT = process.env.OUT, ET = process.env.ET || 'x';
const flags = {}; for (let v = 145; v <= 177; v++) flags['v' + v] = true;
const MOD = Object.assign(flags, { espera: 5000, sugerida: true, inicio: true, nav: true, iaPro: true, leaflet: true, https: true, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; } });
if (process.env.NO161) MOD.v161 = false;
(async () => {
  let browser = null;
  for (const quien of (process.env.QUIEN || 'admin,dir').split(',')) {
    for (const [w, h, cel] of [[1916, 1000], [1440, 900], [1280, 800], [390, 844, true]]) {
      const A = await abrir(Object.assign({ sesion: quien, datos: datos155(), browser, cel: !!cel }, MOD)); browser = A.browser; const p = A.page;
      if (!cel) await p.setViewportSize({ width: w, height: h });
      await p.waitForTimeout(3500);
      await p.evaluate(() => { try { mostrarVista('inicio'); } catch (e) { } window.scrollTo(0, 0); const st = document.createElement('style'); st.textContent = '#avToast,#avisoApp{display:none !important}'; document.head.appendChild(st); }); await p.waitForTimeout(1200);
      const n = OUT + '/' + ET + '_' + quien + '_' + (cel ? 'cel' : w);
      await p.screenshot({ path: n + '.png' });
      if (process.env.INFO) console.log(n, JSON.stringify(await p.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; }; return { logo: r('#iniDir .dr-logo'), menu: r('#iniDir [data-dr=menu]'), nd: r('#iniDir .dr-ndia'), sal: r('#iniDir .dr-sal'), k6: r('#iniDir .dr-k6'), logoEje: r('#iniEje .ie-logo, #iniEje .logo-badge'), num: r('#iniDir .dr-num, #drHero .dr-dia, #drHero'), hdr: r('header .logo-badge'), btnMenu: r('#btnMenu'), campana: r('#avCampana') }; })));
      await A.page.context().close();
    }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
