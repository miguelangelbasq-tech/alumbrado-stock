// Pruebas v116 · «Compartir» en la app de Android abre el menú del celular (WhatsApp, Drive…) en vez de «copiar»:
// ubicación de la plaza (texto + link) y archivos (fotos, ZIP). Cancelar no copia nada. En el navegador no cambia.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const apk = () => {
  window.__sh = []; window.__fsW = []; window.__alertas = []; window.__cancelar = false;
  window.__cargador = { url: 'https://miguelangelbasq-tech.github.io/alumbrado-stock/', nativo: true, version: () => 'prueba', listo() { }, guardar() { }, actualizar() { }, borrar() { } };
  window.Capacitor = { isNativePlatform: () => true, convertFileSrc: (u) => u, Plugins: {
    Filesystem: { writeFile: async (o) => { window.__fsW.push({ path: o.path, dir: o.directory, n: (o.data || '').length }); return { uri: 'file:///cache/' + o.path }; } },
    Share: { share: async (o) => { if (window.__cancelar) throw new Error('Share canceled'); window.__sh.push(o); } },
    App: { addListener: () => Promise.resolve({ remove() { } }), getInfo: async () => ({ version: '1.3' }) } } };
  // el WebView de Android no trae Web Share
  try { Object.defineProperty(Navigator.prototype, 'share', { configurable: true, value: undefined }); Object.defineProperty(Navigator.prototype, 'canShare', { configurable: true, value: undefined }); } catch (e) { }
  window.alert = (m) => window.__alertas.push(String(m));
};
(async () => {
  const c = prueba('v116' + (cel ? ' cel' : ''));
  const d = baseDatos(); Object.assign(d.db.avanceObras.p1, { lat: -31.4, lng: -64.17 });
  let A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3000, antes: apk }), p = A.page;
  let r = await p.evaluate(async () => { await compartirUbicacionPlaza('p1'); return { sh: window.__sh.slice(), al: window.__alertas.slice() }; });
  c(r.sh.length === 1 && /google\.com\/maps/.test(r.sh[0].text) && r.sh[0].dialogTitle === 'Compartir' && !r.al.some((x) => /copiada/.test(x)), 'compartir la ubicación abre el menú del celular (WhatsApp, etc.) con el link · ' + JSON.stringify(r.sh[0] || r.al));
  r = await p.evaluate(async () => { window.__cancelar = true; window.__sh = []; window.__alertas = []; await compartirUbicacionPlaza('p1'); window.__cancelar = false; return { al: window.__alertas.slice() }; });
  c(!r.al.some((x) => /copiada/.test(x)), 'si cerrás el menú sin elegir, no copia ni muestra carteles');
  r = await p.evaluate(async () => { window.__sh = []; const f = new File([new Uint8Array([255, 216, 255, 1, 2, 3])], 'foto 1.jpg', { type: 'image/jpeg' }); const can = navigator.canShare({ files: [f] }); await navigator.share({ files: [f], title: 'Foto', text: 'Plaza' }); return { can, sh: window.__sh.slice(), fs: window.__fsW.slice() }; });
  c(r.can && r.sh.length === 1 && r.sh[0].files.length === 1 && /^file:\/\/\/cache\//.test(r.sh[0].files[0]) && r.fs.some((x) => x.dir === 'CACHE'), 'las fotos y archivos se comparten por el menú del celular · ' + JSON.stringify(r.sh[0]));
  await A.browser.close();
  // navegador: no se toca
  A = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 2500 }); p = A.page;
  r = await p.evaluate(() => !!(navigator.share && navigator.share.__emaApp));
  c(!r, 'en el navegador no cambia nada');
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
