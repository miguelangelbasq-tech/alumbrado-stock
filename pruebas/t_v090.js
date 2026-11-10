// Pruebas v090 · Proyectista con las piezas del diseño «Cristal» de la app (mismo diseño que el resto).
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v090' + (cel ? ' cel' : ''));
  const M = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3500, https: true, leaflet: true });
  const p = M.page; await M.ctx.grantPermissions(['geolocation']); await M.ctx.setGeolocation({ latitude: -31.42, longitude: -64.19, accuracy: 4 });
  await p.evaluate(() => window.__abrirProyectista()); await p.waitForTimeout(800);
  let r = await p.evaluate(() => ({ card: document.querySelectorAll('#pyOv .card').length, pri: !!document.querySelector('#pyOv .btn-primary[data-py="crear"]') }));
  c(r.card >= 2 && r.pri, 'la lista de proyectos usa las tarjetas y el botón principal de la app ' + JSON.stringify(r));
  await p.fill('#pyNombre', 'PRUEBA'); await p.click('[data-py="crear"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => {
    const cs = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e) : null; };
    const pri = cs('#pyOv [data-py="marcar"]'), app = getComputedStyle(document.documentElement);
    return {
      marcar: document.querySelector('#pyOv [data-py="marcar"]').className,
      chips: document.querySelectorAll('#pyOv .py-chips .chip').length, chipAct: document.querySelectorAll('#pyOv .py-chips .chip.activo').length,
      tabs: !!document.querySelector('#pyOv .subtabs .subtab.activo'),
      fondoBoton: pri && pri.backgroundImage, radio: pri && pri.borderRadius, alto: pri && parseFloat(pri.minHeight),
      fuente: cs('#pyOv').fontFamily, navy: app.getPropertyValue('--navy').trim(),
      css: (document.getElementById('proyectistaCss') || {}).textContent || ''
    };
  });
  c(/btn-primary/.test(r.marcar) && /gradient/.test(r.fondoBoton) && r.radio === '999px' && r.alto >= 44, '«Marcar punto acá» es el botón principal de la app (píldora con degradé, 44 px o más): ' + r.radio);
  // v092: 8 tipos de punto (se sumó «Borde de la plaza»)
  c(r.chips === 8 && r.chipAct === 1 && r.tabs, 'tipos de punto como chips de la app y pestañas como las de la app');
  c(/Inter|Plus Jakarta Sans/.test(r.fuente) && r.navy === '#28285e', 'misma letra que la app (Inter; desde v144 Plus Jakarta Sans) y mismo azul de la marca');   // v144: estilo V1, letra nueva
  c(!/\.py-btn|\.py-card|\.py-tabs/.test(r.css) && /var\(--navy\)/.test(r.css), 'sin estilos propios de botones, tarjetas ni pestañas: usa los del tema');
  if (cel) { r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: document.documentElement.clientWidth })); c(r.sw <= r.w + 1, 'en el celular, sin scroll de costado'); }
  c(!M.errores.length, 'sin errores de JS ' + JSON.stringify(M.errores.slice(0, 3)));
  await M.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
