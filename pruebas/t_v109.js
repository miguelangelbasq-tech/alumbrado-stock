// Pruebas v109 · Bajar y compartir PDF (y cualquier archivo) en la app de Android (APK 1.3 con Filesystem + Share);
// con el APK viejo avisa claro en vez de decir «PDF listo»; en el navegador sigue bajando como siempre.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const apk = (conPlugins) => {
  window.__fsW = []; window.__sh = [];
  window.__cargador = { url: 'https://miguelangelbasq-tech.github.io/alumbrado-stock/', nativo: true, version: () => 'prueba', listo() { }, guardar() { }, actualizar() { }, borrar() { } };
  window.Capacitor = { isNativePlatform: () => true, Plugins: conPlugins ? {
    Filesystem: { writeFile: async (o) => { window.__fsW.push({ path: o.path, dir: o.directory, n: (o.data || '').length }); return { uri: 'file:///data/cache/' + o.path }; } },
    Share: { share: async (o) => { window.__sh.push(o); } } } : {} };
};
(async () => {
  const c = prueba('v109' + (cel ? ' cel' : ''));
  const hoja = async (p) => { await p.evaluate(() => hojaEMA.abrir('Planificación de prueba', '<!doctype html><html><body><h1>Hoja de prueba</h1><p>Texto</p></body></html>')); await p.waitForTimeout(1200); };
  const hojaMsg = (p) => p.evaluate(() => { const m = document.querySelector('#hojaOv .hj-msg'); return m && !m.hidden ? m.textContent : ''; });
  // 1) APK 1.3: Bajar guarda en Documentos › EMA; Compartir abre el menú de Android con el archivo
  let A = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3000, antes: apk, antesArg: true }), p = A.page;
  await hoja(p); await p.click('#hojaOv [data-hj="bajar"]');
  await p.waitForFunction(() => window.__fsW.length > 0, null, { timeout: 30000 }).catch(() => { });
  let r = await p.evaluate(() => window.__fsW.slice());
  c(r.length === 1 && r[0].dir === 'DOCUMENTS' && /^EMA\/EMA_.*\.pdf$/.test(r[0].path) && r[0].n > 1000, 'app de Android: «Bajar PDF» guarda el PDF en Documentos › EMA · ' + JSON.stringify(r));
  await p.waitForTimeout(300); let m = await hojaMsg(p);
  c(/Guardado en el celular/.test(m), 'dice dónde quedó · ' + m);
  await p.click('#hojaOv [data-hj="compartir"]');
  await p.waitForFunction(() => window.__sh.length > 0, null, { timeout: 30000 }).catch(() => { });
  r = await p.evaluate(() => ({ sh: window.__sh.slice(), fs: window.__fsW.slice(-1)[0] }));
  c(r.sh.length === 1 && r.sh[0].files && /\.pdf$/.test(r.sh[0].files[0]) && r.fs.dir === 'CACHE', '«Compartir PDF» abre el menú de Android con el archivo (WhatsApp, mail, Drive…) · ' + JSON.stringify(r.sh));
  // «Imprimir» en la app de Android: arma el PDF y abre el menú (impresora o Drive)
  await p.click('#hojaOv [data-hj="imprimir"]');
  await p.waitForFunction(() => window.__sh.length > 1, null, { timeout: 30000 }).catch(() => { });
  r = await p.evaluate(() => window.__sh.slice(-1)[0]); m = await hojaMsg(p);
  c(r && r.files && /\.pdf$/.test(r.files[0]) && /impresora/.test(m), '«Imprimir» en la app de Android arma el PDF y lo abre para mandarlo a la impresora o a Drive · ' + m);
  // cualquier otro archivo que la app baja (AutoCAD DXF, Excel, ZIP…)
  await p.evaluate(() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['0\nSECTION\n'], { type: 'application/dxf' })); a.download = 'plano de prueba.dxf'; a.click(); });
  await p.waitForFunction(() => window.__fsW.some((x) => /plano de prueba\.dxf$/.test(x.path)), null, { timeout: 10000 }).catch(() => { });
  c(await p.evaluate(() => window.__fsW.some((x) => x.path === 'EMA/plano de prueba.dxf' && x.dir === 'DOCUMENTS')), 'el plano de AutoCAD (DXF) también se guarda en Documentos › EMA');
  // cualquier otro archivo que la app baja (Excel, ZIP, DXF…) también se guarda
  await p.evaluate(() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['a;b\n1;2'], { type: 'text/csv' })); a.download = 'planilla de prueba.csv'; a.click(); });
  await p.waitForFunction(() => window.__fsW.some((x) => /planilla de prueba\.csv$/.test(x.path)), null, { timeout: 10000 }).catch(() => { });
  r = await p.evaluate(() => ({ fs: window.__fsW.slice(-1)[0], av: (document.getElementById('arAviso') || {}).textContent || '' }));
  c(/EMA\/planilla de prueba\.csv/.test(r.fs.path) && /Documentos/.test(r.av), 'los demás archivos de la app (planillas, ZIP, DXF) también se guardan · ' + r.av.slice(0, 80));
  await A.browser.close();
  // 2) APK viejo (sin los plugins): avisa que hace falta la app nueva y no dice «PDF listo»
  A = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3000, antes: apk, antesArg: false }); p = A.page;
  await hoja(p); await p.click('#hojaOv [data-hj="bajar"]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ av: (document.getElementById('arAviso') || {}).textContent || '', b: !!document.querySelector('#arAviso .btn-primary') }));
  m = await hojaMsg(p);
  c(/versión 1\.3/.test(r.av) && r.b && !/PDF listo/.test(m), 'APK viejo: avisa que hace falta la app 1.3 y ofrece abrir en Chrome (no dice «PDF listo») · ' + r.av.slice(0, 70));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'el aviso no hace scroll de costado · ' + sw); }
  await A.browser.close();
  // 3) navegador / PC: baja como siempre
  A = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3000 }); p = A.page;
  await hoja(p);
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }).catch(() => null), p.click('#hojaOv [data-hj="bajar"]')]);
  c(dl && /\.pdf$/.test(dl.suggestedFilename()), 'en el navegador «Bajar PDF» baja el archivo como antes · ' + (dl && dl.suggestedFilename()));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
