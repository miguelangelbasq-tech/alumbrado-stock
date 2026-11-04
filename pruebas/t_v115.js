// Pruebas v115 · Avisos con la app cerrada en la app de Android 1.3 (FCM): el celular se anota en pushSubs con tipo «fcm»
// (lo que lee el Worker «ema-avisos» v115), crea el canal «avisos» y, al tocar la notificación, abre la hoja que corresponde.
// En el navegador no cambia nada.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const apk = () => {
  window.__pushReg = 0; window.__canal = []; window.__pl = {};
  window.__cargador = { url: 'https://miguelangelbasq-tech.github.io/alumbrado-stock/', nativo: true, version: () => 'prueba', listo() { }, guardar() { }, actualizar() { }, borrar() { } };
  window.Capacitor = { isNativePlatform: () => true, convertFileSrc: (u) => u, Plugins: {
    App: { addListener: () => Promise.resolve({ remove() { } }), getInfo: async () => ({ version: '1.3' }) },
    PushNotifications: { register: async () => { window.__pushReg++; setTimeout(() => window.__pl.registration && window.__pl.registration({ value: 'TOKEN-PRUEBA-123' }), 50); },
      addListener: (ev, fn) => { window.__pl[ev] = fn; return Promise.resolve({ remove() { } }); },
      checkPermissions: async () => ({ receive: 'granted' }), requestPermissions: async () => ({ receive: 'granted' }), createChannel: async (o) => { window.__canal.push(o); } } } };
};
(async () => {
  const c = prueba('v115' + (cel ? ' cel' : ''));
  // 1) cuadrilla en la app de Android
  let A = await abrir({ sesion: 'juan', cel, datos: baseDatos(), espera: 3000, antes: apk }), p = A.page; if (process.env.DBG) p.on('console', (m) => /androidPro|push/i.test(m.text()) && console.log('CONSOLA', m.text()));
  await p.waitForFunction(() => Object.keys(window.__stubDB().pushSubs || {}).some((k) => /^fcm-/.test(k)), null, { timeout: 15000 }).catch(() => { });
  let r = await p.evaluate(() => { const s = window.__stubDB().pushSubs || {}, k = Object.keys(s).find((x) => /^fcm-/.test(x)); return { todos: Object.keys(s), k, s: k && s[k], reg: window.__pushReg, canal: window.__canal.map((x) => x.id), uid: (window.__fbUser || {}).uid }; });
  c(r.reg === 1 && r.s && r.s.tipo === 'fcm' && r.s.fcm === 'TOKEN-PRUEBA-123' && r.s.uid === r.uid && r.s.clave, 'el celular se anota para los avisos (pushSubs tipo «fcm», con su persona) · ' + JSON.stringify(r.s));
  c(r.canal.includes('avisos'), 'crea el canal «Avisos de EMA» en Android (el que usa el Worker)');
  await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(400);
  await p.evaluate(() => window.__pl.pushNotificationActionPerformed({ notification: { data: { vista: 'mistareas' } } })); await p.waitForTimeout(800);
  r = await p.evaluate(() => getComputedStyle(document.getElementById('viewMisTareas')).display);
  c(r !== 'none', 'al tocar el aviso, abre Mis tareas');
  await A.browser.close();
  // 2) en el navegador (sin la app de Android): no se anota por FCM
  A = await abrir({ sesion: 'juan', cel, datos: baseDatos(), espera: 3000 }); p = A.page; await p.waitForTimeout(2500);
  r = await p.evaluate(() => Object.keys(window.__stubDB().pushSubs || {}).filter((k) => /^fcm-/.test(k)).length);
  c(r === 0, 'en el navegador no cambia nada (no hay anotaciones FCM)');
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
