// Pruebas v110 · App de Android 1.3: abrir el PDF al bajarlo, imprimir directo, fotos por la cámara del celular
// (y recuperarlas si Android cerró la app), lector de códigos, avisos FCM dormidos. En el navegador, nada cambia.
const fs = require('fs');
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const FOTO = __dirname + '/foto.jpg', FOTO64 = fs.readFileSync(FOTO).toString('base64');
const apk = (foto64) => {
  window.__fsW = []; window.__sh = []; window.__op = []; window.__pr = []; window.__cam = 0; window.__appL = {}; window.__pushReg = 0;
  const fotoURL = () => { const b = atob(foto64), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return URL.createObjectURL(new Blob([u], { type: 'image/jpeg' })); };
  window.__fotoURL = fotoURL;
  window.__cargador = { url: 'https://miguelangelbasq-tech.github.io/alumbrado-stock/', nativo: true, version: () => 'prueba', listo() { }, guardar() { }, actualizar() { }, borrar() { } };
  window.Capacitor = { isNativePlatform: () => true, convertFileSrc: (u) => u, Plugins: {
    Filesystem: { writeFile: async (o) => { window.__fsW.push({ path: o.path, dir: o.directory, n: (o.data || '').length }); return { uri: 'file:///storage/' + o.directory + '/' + o.path }; } },
    Share: { share: async (o) => { window.__sh.push(o); } },
    FileOpener: { open: async (o) => { window.__op.push(o); } },
    Printer: { printBase64: async (o) => { window.__pr.push({ name: o.name, mime: o.mimeType, n: (o.data || '').length }); } },
    Camera: { takePhoto: async () => { window.__cam++; await new Promise((r) => setTimeout(r, 1200)); return { type: 'image', webPath: fotoURL(), saved: false }; } },
    App: { addListener: (ev, fn) => { window.__appL[ev] = fn; return Promise.resolve({ remove() { } }); }, getInfo: async () => ({ version: '1.3' }) },
    PushNotifications: { register: async () => { window.__pushReg++; }, addListener() { }, checkPermissions: async () => ({ receive: 'granted' }) },
    BarcodeScanner: { isGoogleBarcodeScannerModuleAvailable: async () => ({ available: true }), scan: async () => ({ barcodes: [{ rawValue: 'H-014' }] }) } } };
};
function datos() {
  const d = baseDatos(), ahora = Date.now();
  const seg = { epp: true, baliza: true, herram: true, corte: 'no', por: 'Juan Pérez', ts: ahora };
  d.db.avanceObras.p1.puntos = ['T1 · C1 · Col 1', 'T1 · C1 · Col 2', 'T1 · C1 · Col 3'];
  Object.assign(d.db.ordenesTrabajo.ot1, { actividades: ['bpn'], actividadesManuales: [], previsto: { bpn: 3 }, campo: { seguridad: seg } });
  return d;
}
(async () => {
  const c = prueba('v110' + (cel ? ' cel' : ''));
  // 1) oficina en la app de Android: Bajar abre el PDF, Imprimir va directo a la impresora
  let A = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3000, antes: apk, antesArg: FOTO64 }), p = A.page;
  await p.evaluate(() => hojaEMA.abrir('Planificación de prueba', '<!doctype html><html><body><h1>Hoja</h1><p>Texto</p></body></html>')); await p.waitForTimeout(1200);
  await p.click('#hojaOv [data-hj="bajar"]'); await p.waitForFunction(() => window.__op.length > 0, null, { timeout: 30000 }).catch(() => { });
  let r = await p.evaluate(() => ({ op: window.__op.slice(), fs: window.__fsW.slice() }));
  c(r.op.length === 1 && r.op[0].contentType === 'application/pdf' && /DOCUMENTS\/EMA\/.*\.pdf$/.test(r.op[0].filePath), '«Bajar PDF» lo guarda y lo abre solo en el visor del celular · ' + JSON.stringify(r.op));
  await p.click('#hojaOv [data-hj="imprimir"]'); await p.waitForFunction(() => window.__pr.length > 0, null, { timeout: 30000 }).catch(() => { });
  r = await p.evaluate(() => ({ pr: window.__pr.slice(), sh: window.__sh.length }));
  c(r.pr.length === 1 && r.pr[0].mime === 'application/pdf' && r.pr[0].n > 1000 && r.sh === 0, '«Imprimir» abre la impresora de Android directo (sin pasar por Drive) · ' + JSON.stringify(r.pr));
  // menú «Compartir» como en las apps pro: WhatsApp · Drive · Mail · Copiar · Guardar · Otra app
  await p.click('#hojaOv [data-hj="compartir"]'); await p.waitForTimeout(300);
  r = await p.evaluate(() => [...document.querySelectorAll('#hjComp .hc-b')].map((b) => b.textContent.trim()));
  c(r.join('|') === '✆WhatsApp|▲Drive|✉Mail|⧉Copiar|⬇Guardar|⋯Otra app', 'el menú «Compartir» tiene WhatsApp, Drive, Mail, Copiar, Guardar y Otra app · ' + r.join(', '));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'el menú entra en el celular sin scroll de costado · ' + sw); await p.screenshot({ path: __dirname + '/v110_compartir_cel.png' }); }
  await p.click('#hjComp [data-hc="wa"]'); await p.waitForFunction(() => window.__sh.length > 0, null, { timeout: 30000 }).catch(() => { });
  await p.waitForTimeout(300); r = await p.evaluate(() => ({ sh: window.__sh.slice(-1)[0], m: (document.querySelector('#hojaOv .hj-msg') || {}).textContent, abierto: !!document.getElementById('hjComp') }));
  c(r.sh && /\.pdf$/.test(r.sh.files[0]) && /EMA Servicios/.test(r.sh.text) && r.sh.dialogTitle === 'Compartir' && /WhatsApp/.test(r.m) && !r.abierto, 'en la app de Android, «WhatsApp» abre el menú del celular con el PDF y su descripción · ' + r.m);
  r = await p.evaluate(async () => ({ cod: await window.__escanear(), push: window.__pushReg, fcm: window.__androidPro.FCM_LISTO, v: await window.__androidPro.version() }));
  c(r.cod === 'H-014', 'lector de códigos: __escanear() devuelve el código leído · ' + r.cod);
  c(r.fcm === true, 'avisos FCM: dormidos hasta la v115; desde la v115 se prenden (lo prueba t_v115)');
  await A.browser.close();
  // 2) cuadrilla en la app de Android: el 📷 abre la cámara del celular y la foto queda en su fila
  A = await abrir({ sesion: 'juan', cel, datos: datos(), espera: 4000, reglas: true, antes: apk, antesArg: FOTO64 }); p = A.page;
  const caja = '.mt-ot[data-ot="ot1"] .fl-caja';
  const info = () => p.evaluate((sel) => { const b = document.querySelector(sel); return b ? { cuenta: (b.querySelector('.fl-cuenta') || {}).textContent, filas: [...b.querySelectorAll('.fl-fila')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()) } : null; }, caja);
  const chooser = p.waitForEvent('filechooser', { timeout: 2500 }).then(() => true).catch(() => false);
  await p.click(caja + ' label.fl-cam'); 
  const abrioSelector = await chooser; await p.waitForTimeout(3000);
  r = await info(); let cam = await p.evaluate(() => window.__cam);
  c(cam === 1 && !abrioSelector, 'el 📷 de Mis tareas abre la cámara del celular (no el selector de archivos) · ' + cam);
  c(r && /✅ T1 · C1 · Col 1/.test(r.filas[0] || ''), 'la foto quedó guardada en su fila · ' + (r && r.filas[0]));
  // 3) Android cerró la app con la cámara abierta: al volver, la foto se recupera sola
  await p.evaluate(() => localStorage.setItem('ema.cam.pend', JSON.stringify({ ot: 'ot1', k: (document.querySelector('.mt-ot[data-ot="ot1"] .mt-tarea[data-k]') || {}).dataset.k, fli: '0', fln: 'T1 · C1 · Col 2', lab: 'fl-cam', ts: Date.now() })));
  await p.evaluate(() => window.__appL.appRestoredResult({ pluginId: 'Camera', methodName: 'takePhoto', success: true, data: { webPath: window.__fotoURL() } }));
  await p.waitForTimeout(5000); r = await info();
  const fotos = await p.evaluate(() => Object.values(((ordenesTrabajo.find((x) => x.id === 'ot1') || {}).campo || {}).fotos || {}).map((x) => x.num));
  c(fotos.includes('T1 · C1 · Col 2'), 'si Android cerró la app con la cámara abierta, la foto se recupera al volver y queda en su fila · ' + JSON.stringify(fotos));
  await A.browser.close();
  // 4) navegador / PC: el mismo menú; WhatsApp y Drive bajan el PDF y dan el botón para abrirlos; Copiar copia
  A = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3000, https: true }); p = A.page;   // el portapapeles pide https, como GitHub Pages
  try { await p.context().grantPermissions(['clipboard-read', 'clipboard-write']); } catch (e) { }
  await p.evaluate(() => hojaEMA.abrir('Planificación de prueba', '<!doctype html><html><body><h1>Hoja de prueba</h1><p>Texto para copiar</p></body></html>')); await p.waitForTimeout(1200);
  await p.click('#hojaOv [data-hj="compartir"]'); await p.waitForTimeout(300);
  if (!cel) {
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }).catch(() => null), p.click('#hjComp [data-hc="wa"]')]);
    await p.waitForTimeout(2500);
    r = await p.evaluate(() => ({ m: (document.querySelector('#hjComp .hc-msg') || {}).textContent, href: (document.querySelector('#hjComp .hc-msg a') || {}).href }));
    c(dl && /\.pdf$/.test(dl.suggestedFilename()) && r.href === 'https://web.whatsapp.com/', 'PC: «WhatsApp» baja el PDF y da el botón «Abrir WhatsApp Web» · ' + r.m);
  }
  await p.click('#hjComp [data-hc="co"]'); await p.waitForTimeout(3000);
  r = await p.evaluate(async () => { let tx = ''; try { tx = await navigator.clipboard.readText(); } catch (e) { tx = 'ERR ' + e.message; } return { m: (document.querySelector('#hojaOv .hj-msg') || {}).textContent, tx }; });
  c(/Copiado/.test(r.m) && /imagen/.test(r.m) && /Texto para copiar/.test(r.tx), '«Copiar» copia la hoja (imagen y texto) para pegar en WhatsApp o un mail · ' + r.m);
  await p.click('#hojaOv [data-hj="compartir"]'); await p.waitForTimeout(300);
  const [dl2] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }).catch(() => null), p.click('#hjComp [data-hc="gu"]')]);
  c(dl2 && /\.pdf$/.test(dl2.suggestedFilename()), '«Guardar» baja el PDF · ' + (dl2 && dl2.suggestedFilename()));
  await A.browser.close();
  // 5) en el navegador el 📷 sigue con el selector de siempre

  A = await abrir({ sesion: 'juan', cel, datos: datos(), espera: 4000, reglas: true }); p = A.page;
  const ch2 = await Promise.all([p.waitForEvent('filechooser', { timeout: 3000 }).then(() => true).catch(() => false), p.click(caja + ' label.fl-cam')]);
  c(ch2[0], 'en el navegador el 📷 sigue como siempre');
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
