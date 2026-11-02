// Pruebas v093 · En la app de Android (de borde a borde) la pantalla no se mete debajo del reloj ni de los botones de Android.
// Se simulan los bordes del celular (reloj 32 px arriba, botones 48 px abajo) con la emulación de Chrome.
const { abrir, prueba } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v093' + (cel ? ' cel' : ''));
  const M = await abrir({ sesion: 'juan', cel, espera: 3500 });
  const p = M.page;
  let r = await p.evaluate(() => document.querySelector('meta[name="viewport"]').content);
  c(/viewport-fit=cover/.test(r), 'la página pide «viewport-fit=cover» (así Android le pasa los bordes): ' + r);
  const sinBordes = await p.evaluate(() => { const h = document.querySelector('body > header'); return { pt: getComputedStyle(h).paddingTop, alto: h.offsetHeight }; });
  c(sinBordes.pt === '10px', 'en la compu / navegador común no cambia nada (encabezado igual): ' + JSON.stringify(sinBordes));
  const cdp = await p.context().newCDPSession(p);
  let ok = true;
  try { await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 32, bottom: 48, left: 0, right: 0 } }); } catch (e) { ok = false; console.log('sin emulación de bordes: ' + e.message); }
  if (ok) {
    await p.waitForTimeout(400);
    r = await p.evaluate(() => {
      const h = document.querySelector('body > header'), hb = h.getBoundingClientRect(), btn = document.getElementById('btnMenu').getBoundingClientRect();
      const fin = getComputedStyle(document.body, '::after').height;
      return { hTop: hb.top, pt: getComputedStyle(h).paddingTop, btnTop: btn.top, fin };
    });
    c(r.hTop === 0 && r.pt === '42px' && r.btnTop >= 32, 'arriba: el vidrio llega hasta el borde pero el botón del menú y el título arrancan debajo del reloj: ' + JSON.stringify(r));
    c(r.fin === '48px', 'abajo: al final de cada hoja queda el espacio de los botones de Android (' + r.fin + ')');
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(300);
    r = await p.evaluate(() => { let max = 0; document.querySelectorAll('body *').forEach((e) => { if (e.offsetParent === null) return; const s = getComputedStyle(e); if (s.position === 'fixed') return; const b = e.getBoundingClientRect(); if (b.height && b.bottom > max) max = b.bottom; }); return { ultimo: Math.round(max), alto: innerHeight }; });
    c(r.ultimo <= r.alto - 48 + 1, 'bajando hasta el final, lo último de la hoja queda por encima de los botones: ' + JSON.stringify(r));
    await p.evaluate(() => abrirMenuLateral()); await p.waitForTimeout(500);
    r = await p.evaluate(() => { const m = document.querySelector('#menuLateral .menu-panel'), s = getComputedStyle(m); const pr = m.querySelector('a,button'); return { pt: s.paddingTop, pb: s.paddingBottom, primero: pr ? Math.round(pr.getBoundingClientRect().top) : -1 }; });
    c(r.pt === '32px' && r.pb === '48px' && r.primero >= 32, 'el menú lateral también respeta el reloj y los botones: ' + JSON.stringify(r));
    await p.screenshot({ path: 'v093_bordes' + (cel ? '_cel' : '') + '.png' });
  }
  // Android: íconos del reloj oscuros
  const N = await abrir({ sesion: 'juan', cel: true, espera: 0 });
  await N.page.addInitScript(() => { window.__estilo = []; window.Capacitor = { isNativePlatform: () => true, Plugins: { SystemBars: { setStyle: async (o) => { window.__estilo.push(o); } } } }; });
  await N.page.reload(); await N.page.waitForTimeout(3500);
  r = await N.page.evaluate(() => window.__estilo);
  c(r.length === 1 && r[0].style === 'LIGHT', 'en la app de Android pide íconos oscuros para el reloj y la batería: ' + JSON.stringify(r));
  c(!M.errores.length && !N.errores.length, 'sin errores de JS ' + JSON.stringify(M.errores.concat(N.errores).slice(0, 4)));
  await N.browser.close(); await M.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
