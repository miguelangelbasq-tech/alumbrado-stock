// Pruebas v092 · Ubicación con el celular bloqueado: el celular se da cuenta solo si se cortó (o si Android cerró la app),
// le dice a la persona qué hacer (con botón a los ajustes de la app), «Probar con el celu bloqueado» desde el menú, y la
// oficina ve en el Mapa cuántas veces se le cortó hoy a cada uno y el resultado de la prueba.
// El reloj se maneja con page.clock.setFixedTime: cada paso pasa a la hora que dice la prueba.
const { abrir, otraPagina, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
function datos() {
  const d = baseDatos();
  d.db.configEquipo.ubicacion = { activo: true, desde: '00:00', hasta: '23:59', dias: [0, 1, 2, 3, 4, 5, 6], cadaSeg: 30 };
  return d;
}
// APK simulado (igual que t_v087): plugin de ubicación + CapacitorHttp que hace de Firestore REST
const CAP = () => {
  window.__http = []; window.__tokOk = { 'id-1': 1 }; window.__ajustes = 0;
  const desdeFs = (f) => { const o = {}; Object.keys(f || {}).forEach((k) => { const v = f[k]; o[k] = 'nullValue' in v ? null : 'booleanValue' in v ? v.booleanValue : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : v.stringValue; }); return o; };
  window.Capacitor = { isNativePlatform: () => true, Plugins: {
    BackgroundGeolocation: {
      addWatcher: async (o, cb) => { window.__bgCb = cb; setTimeout(() => cb({ latitude: -31.4201, longitude: -64.1888, accuracy: 6, speed: 0, time: Date.now() }), 300); return 'w1'; },
      removeWatcher: async () => { }, openSettings: async () => { window.__ajustes++; } },
    CapacitorHttp: { request: async (r) => {
      window.__http.push(r.url);
      if (/securetoken/.test(r.url)) return { status: 200, data: { id_token: 'id-1', expires_in: '3600', refresh_token: 'rt-1' } };
      const m = r.url.match(/documents\/ubicacionVivo\/([^?]+)\?/);
      if (!m || r.method !== 'PATCH') return { status: 404, data: {} };
      await firebase.firestore().collection('ubicacionVivo').doc(decodeURIComponent(m[1])).set(desdeFs(r.data.fields), { merge: true });
      return { status: 200, data: {} };
    } } } };
};
const HOY = '2026-11-03T';   // martes; hora de Argentina (UTC−3)
const T = (hhmmss) => new Date(HOY + hhmmss + '-03:00');
(async () => {
  const c = prueba('v092u' + (cel ? ' cel' : ''));
  const TZ = 'America/Argentina/Cordoba';
  const J = await abrir({ sesion: 'juan', cel: true, datos: datos(), espera: 0, https: true, tz: TZ });
  const j = J.page;
  const hora = async (h) => { await j.clock.setFixedTime(T(h)); };
  await j.addInitScript(CAP);
  await j.addInitScript(() => { const t = setInterval(() => { const u = window.firebase && firebase.apps.length && firebase.auth().currentUser; if (!u) return; clearInterval(t); u.refreshToken = 'rt-1'; u.getIdTokenResult = async () => ({ token: 'id-1', expirationTime: new Date(Date.now() + 3600e3).toUTCString() }); }, 20); });
  await hora('12:00:00'); await j.evaluate(() => { try { localStorage.removeItem('ema.uv.diag'); } catch (e) { } });
  await j.reload(); await j.waitForFunction(() => window.__ubicacionVivo && window.__ubicacionVivo.estado().envTs, null, { timeout: 15000 }).catch(() => { });
  const doc = () => j.evaluate(() => (window.__stubDB().ubicacionVivo || {}).uJuan || null);
  const oculto = async (si) => { await j.evaluate((s) => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => s }); document.dispatchEvent(new Event('visibilitychange')); }, si); await j.waitForTimeout(250); };
  const pos = async () => { await j.evaluate(() => window.__bgCb({ latitude: -31.4201, longitude: -64.1888, accuracy: 5, speed: 0, time: Date.now() })); await j.waitForTimeout(250); };
  const hoja = () => j.evaluate(() => { const h = document.getElementById('uvHoja'); return h ? { txt: h.innerText, bot: [...h.querySelectorAll('button')].map((b) => b.textContent) } : null; });
  const tocar = async (t) => { await j.evaluate((t) => { const b = [...document.querySelectorAll('#uvHoja button')].find((x) => x.textContent === t); b && b.click(); }, t); await j.waitForTimeout(250); };
  let d = await doc();
  c(d && d.via === 'android' && d.cortesHoy === 0 && d.enviosFondo === 0, 'arranca mandando por el lado de Android, sin cortes: ' + JSON.stringify(d && { via: d.via, cortes: d.cortesHoy, fondo: d.enviosFondo }));

  // ---- A) bloqueado y manda bien: no hay corte ni aviso
  await hora('12:00:10'); await oculto(true);
  for (const h of ['12:01:10', '12:02:10', '12:03:10']) { await hora(h); await pos(); }
  await hora('12:03:30'); await oculto(false);
  d = await doc(); let h = await hoja();
  c(d.cortesHoy === 0 && d.enviosFondo === 3 && !h, 'bloqueado 3 min mandando cada minuto: cuenta 3 envíos con el celu bloqueado, sin corte ni aviso: ' + JSON.stringify({ c: d.cortesHoy, f: d.enviosFondo }));
  c(d.ts === T('12:03:30').getTime(), 'al volver a la app manda al toque (la oficina lo ve enseguida)');

  // ---- B) se corta con el celu bloqueado: lo detecta y le dice qué hacer
  await hora('12:05:00'); await oculto(true);
  await hora('12:06:00'); await pos();
  await hora('12:20:00'); await oculto(false);
  d = await doc(); h = await hoja();
  c(d.cortesHoy === 1 && d.ultCorteTipo === 'se cortó' && d.ultCorteDesde === T('12:06:00').getTime() && d.ultCorteHasta === T('12:20:00').getTime(), 'bloqueado 15 min con un solo envío: detecta el corte de 12:06 a 12:20 y lo manda a la base: ' + JSON.stringify({ c: d.cortesHoy, t: d.ultCorteTipo }));
  c(h && /Se cortó tu ubicación/.test(h.txt) && /de las 12:06 a las 12:20/.test(h.txt) && /Sin restricciones/.test(h.txt) && /No la cierres deslizándola/.test(h.txt), 'a la persona le aparece qué pasó y los pasos (Batería › Sin restricciones, no cerrarla)');
  c(h && h.bot.join('|') === 'Abrir ajustes de la app|Probar ahora|Cerrar', 'con botones: Abrir ajustes de la app · Probar ahora · Cerrar');
  await tocar('Abrir ajustes de la app');
  c(await j.evaluate(() => window.__ajustes) === 1 && !(await hoja()), '«Abrir ajustes de la app» abre los ajustes del celular');

  // ---- C) otro corte enseguida: lo cuenta pero no vuelve a molestar (un aviso cada 2 horas)
  await hora('12:21:00'); await oculto(true);
  await hora('12:40:00'); await oculto(false);
  d = await doc(); h = await hoja();
  c(d.cortesHoy === 2 && d.ultCorteTipo === 'no mandó' && !h, 'segundo corte sin ningún envío: lo cuenta («no mandó») pero no repite el aviso enseguida');

  // ---- D) el renglón del menú: estado y prueba
  await j.evaluate(() => abrirMenuLateral()); await j.waitForTimeout(300);
  let r = await j.evaluate(() => (document.getElementById('uvMenuLinea') || {}).innerText || '');
  c(/Hoy se cortó 2 veces/.test(r) && /Tocá para ver o probar/.test(r), 'en el menú se ve «Hoy se cortó 2 veces · Tocá para ver o probar»: ' + r.replace(/\s+/g, ' ').slice(0, 120));
  await j.click('#uvMenuLinea'); await j.waitForTimeout(300);
  h = await hoja();
  c(h && /Tu ubicación/.test(h.txt) && /mandó 4 veces/.test(h.txt) && /se cortó 2 veces/.test(h.txt) && h.bot[0] === 'Probar con el celu bloqueado', 'tocándolo: estado de hoy (4 envíos bloqueado, 2 cortes) y «Probar con el celu bloqueado»');

  // ---- E) prueba que anda
  await tocar('Probar con el celu bloqueado'); h = await hoja();
  c(h && /Bloqueá el celu/.test(h.txt) && /3 minutos/.test(h.txt), 'la prueba explica: bloqueá el celu 3 minutos y volvé');
  await hora('12:41:00'); await tocar('Empezar');
  await hora('12:41:20'); await oculto(true);
  for (const x of ['12:41:50', '12:42:20', '12:42:50', '12:43:20', '12:43:50', '12:44:20', '12:44:50']) { await hora(x); await pos(); }
  await hora('12:45:00'); await oculto(false);
  h = await hoja(); d = await doc();
  c(h && /Anduvo/.test(h.txt) && /7 veces/.test(h.txt) && d.pruebaOk === true && d.pruebaEnvios === 7, 'prueba bien: «¡Anduvo! mandó 7 veces» y queda en la base para la oficina');
  await tocar('Listo');

  // ---- F) prueba que no anda
  await j.evaluate(() => window.__ubicacionVivo.empezarPrueba()); await hora('12:50:00'); await tocar('Empezar');
  await hora('12:50:10'); await oculto(true);
  await hora('12:54:00'); await oculto(false);
  h = await hoja(); d = await doc();
  c(h && /No anduvo/.test(h.txt) && /mandó 0 veces/.test(h.txt) && /Sin restricciones/.test(h.txt) && h.bot.includes('Abrir ajustes de la app') && h.bot.includes('Probar de nuevo') && d.pruebaOk === false, 'prueba mal: «No anduvo» con los pasos, ajustes y «Probar de nuevo»; la oficina lo ve');
  await tocar('Cerrar');
  // ---- G) prueba muy corta
  await j.evaluate(() => window.__ubicacionVivo.empezarPrueba()); await hora('12:55:00'); await tocar('Empezar');
  await hora('12:55:05'); await oculto(true); await hora('12:56:00'); await oculto(false);
  h = await hoja();
  c(h && /Fue muy corto/.test(h.txt), 'si lo bloqueó muy poco, le pide dejarlo 3 minutos');
  await tocar('Cerrar');

  // ---- H) Android cerró la app: al volver a abrirla lo detecta
  await j.goto('https://app.test/sw.js');   // Android cerró la app: no queda nada corriendo (una página cualquiera del mismo sitio)
  await hora('14:30:00'); await j.goto('https://app.test/index.html'); await j.waitForTimeout(4500);
  d = await doc(); h = await hoja();
  c(d.cortesHoy === 3 && d.ultCorteTipo === 'app cerrada' && Math.abs(d.ultCorteDesde - T('12:56:00').getTime()) < 1000, 'al abrir de nuevo la app detecta que estuvo cerrada desde las 12:56: ' + JSON.stringify({ c: d.cortesHoy, t: d.ultCorteTipo }));
  c(h && /la app estuvo cerrada de las 12:56 a las 14:30/.test(h.txt), 'y se lo dice a la persona (pasaron más de 2 h del aviso anterior)');
  await tocar('Cerrar');

  // ---- I) la oficina lo ve en el Mapa
  const O = await otraPagina(J, { sesion: 'admin', cel, espera: 3000, https: true, leaflet: true, tz: TZ });
  await O.page.clock.setFixedTime(T('14:30:30')); await O.page.reload(); await O.page.waitForTimeout(3500);
  await O.page.evaluate(() => mostrarVista('mapa')); await O.page.waitForTimeout(1500);
  r = await O.page.evaluate(() => { const b = [...document.querySelectorAll('#uvPanel .uv-fila')].find((x) => /Juan/.test(x.innerText)); return b ? b.innerText.replace(/\s+/g, ' ') : ''; });
  c(/hoy se le cortó 3 veces/.test(r) && /12:56–14:30, app cerrada/.test(r) && /prueba con el celu bloqueado: ✗ no anduvo \(12:54\)/.test(r), 'la oficina ve en el Mapa: «hoy se le cortó 3 veces (última 12:56–14:30, app cerrada) · prueba ✗ no anduvo»: ' + r.slice(0, 200));

  // ---- J) en el navegador (sin la app de Android): no ofrece ajustes y explica que hace falta la app
  const W = await abrir({ sesion: 'juan', cel: true, datos: datos(), espera: 0, https: true, tz: TZ });
  const w = W.page;
  await w.clock.setFixedTime(T('10:00:00')); await w.context().grantPermissions(['geolocation']); await w.context().setGeolocation({ latitude: -31.42, longitude: -64.18, accuracy: 10 });
  await w.reload(); await w.waitForTimeout(4500);
  await w.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await w.clock.setFixedTime(T('10:10:00'));
  await w.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); }); await w.waitForTimeout(400);
  r = await w.evaluate(() => { const h = document.getElementById('uvHoja'); return h ? { txt: h.innerText, bot: [...h.querySelectorAll('button')].map((b) => b.textContent) } : null; });
  c(r && /en el navegador/.test(r.txt) && /app de Android/.test(r.txt) && !r.bot.includes('Abrir ajustes de la app'), 'en el navegador: explica que bloqueado no manda y que hace falta la app de Android (sin botón de ajustes)');

  c(!J.errores.length && !O.errores.length && !W.errores.length, 'sin errores de JS ' + JSON.stringify(J.errores.concat(O.errores, W.errores).slice(0, 4)));
  await W.browser.close(); await J.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
