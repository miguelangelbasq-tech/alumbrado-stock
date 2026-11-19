// v177 · El Inicio de admin/oficina/Dirección (#iniDir) prolijo (Ángel 19/11: «la ubicación del cartel de EMA… no se está
// respetando la prolijidad»). En 1916×1000, 1440×900, 1280×800 y el celu: el logo a la izquierda junto al menú (como el
// encabezado de las otras pantallas: 34 px en la compu, a 20 px del menú), la campanita a la derecha, la caja «El número del día»
// sin tocar la barra de arriba ni el logo, los 6 números sin cortar el rótulo, los botones de la sugerida ≥ 44 px, sin scroll de
// costado; Dirección igual; con __v177No, como antes (logo al centro).
const { abrir, prueba } = require('./h');
const { datos155 } = require('./datos155');
const cel = process.argv[2] === 'cel';
const flags = {}; for (let v = 145; v <= 177; v++) flags['v' + v] = true;
const MOD = Object.assign(flags, { cel, espera: 5000, sugerida: true, inicio: true, nav: true, iaPro: true, leaflet: true, https: true, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; } });
(async () => {
  const c = prueba('v177' + (cel ? ' cel' : ''));
  let browser = null;
  const medir = (p) => p.evaluate(() => {
    const r = (s, root) => { const e = (root || document).querySelector(s); if (!e || !e.offsetHeight) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
    const d = document.getElementById('iniDir');
    const k6 = [...d.querySelectorAll('.dr-k6 span')].filter((s) => s.offsetHeight).map((s) => s.scrollHeight <= s.clientHeight + 1);
    const bt = [...d.querySelectorAll('.sg-ini-acc .btn-primary, .sg-ini-acc .btn-ghost')].filter((b) => b.offsetHeight).map((b) => b.offsetHeight);
    return { v177: document.documentElement.classList.contains('v177'), menu: r('[data-dr=menu], [data-dr=cerrar]', d), logo: r('.dr-logo img', d), campana: r('[data-dr=avisos]', d), top: r('.dr-top', d), nd: r('.dr-ndia', d), sal: r('.dr-sal', d), k6, bt, sx: document.documentElement.scrollWidth - document.documentElement.clientWidth, txt: (d.querySelector('.dr-logo small') || {}).textContent };
  });
  const tam = cel ? [[390, 844]] : [[1916, 1000], [1440, 900], [1280, 800]];
  for (const quien of ['admin', 'dir']) {
    for (const [w, h] of tam) {
      const A = await abrir(Object.assign({ sesion: quien, datos: datos155(), browser }, MOD)); browser = A.browser; const p = A.page;
      if (!cel) await p.setViewportSize({ width: w, height: h });
      await p.waitForTimeout(3500); await p.evaluate(() => { try { mostrarVista('inicio'); } catch (e) { } }); await p.waitForTimeout(1200);
      const m = await medir(p), et = quien + ' ' + w;
      c(m.v177 && m.menu && m.logo && m.campana, et + ': portada con menú, logo y campanita');
      c(m.logo.l > m.menu.r && m.logo.l - m.menu.r <= 32 && Math.abs((m.logo.t + m.logo.h / 2) - (m.menu.t + m.menu.h / 2)) <= 3, et + ': el logo a la izquierda, junto al menú y centrado con él · ' + Math.round(m.logo.l - m.menu.r) + ' px');
      c(cel ? m.logo.h >= 28 && m.logo.h <= 32 : m.logo.h === 34, et + ': el logo del tamaño del encabezado de la app · ' + m.logo.h);
      c(m.campana.r > w - 60, et + ': la campanita a la derecha');
      c(m.nd && m.nd.t >= m.top.b + 12 && (m.nd.l > m.logo.r + 40 || m.nd.t > m.logo.b + 12), et + ': «El número del día» sin tocar la barra de arriba ni el logo · ' + Math.round(m.nd.t - m.top.b) + ' px');
      if (!cel) c(m.k6.length === 6 && m.k6.every(Boolean), et + ': los 6 números con el rótulo entero');
      if (quien === 'admin') c(m.bt.length === 2 && m.bt.every((x) => x >= 44), et + ': «Ver la de mañana» y «Ajustes» con su forma (≥ 44 px) · ' + JSON.stringify(m.bt));
      c(m.sx <= 1, et + ': sin scroll de costado');
      c(m.txt === (quien === 'admin' ? 'Alumbrado' : 'Dirección'), et + ': el rótulo del logo sigue («' + m.txt + '»)');
      await p.context().close();
    }
  }
  // con __v177No, como antes
  const A = await abrir(Object.assign({ sesion: 'admin', datos: datos155(), browser }, MOD, { v177: false })); const p = A.page;
  if (!cel) await p.setViewportSize({ width: 1440, height: 900 });
  await p.waitForTimeout(3500); const m = await medir(p);
  c(!m.v177 && m.logo && Math.abs((m.logo.l + m.logo.r) / 2 - (cel ? 195 : 720)) < 60, '__v177No: el logo al centro como antes');
  await browser.close(); c.fin ? c.fin() : 0;
})().catch((e) => { console.error(e); process.exit(1); });
