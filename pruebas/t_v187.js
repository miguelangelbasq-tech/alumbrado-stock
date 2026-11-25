// v187 · Revisión de la cuadrilla (Ángel 25/11/2026: «que los de cuadrilla puedan sacar fotos rapidito y que se suban rápido; y
// que puedan abrir los planos y las ubicaciones; fijate si hay algún error»). Juan (cuadrilla) en el celu con CPU ×4.
//  0) Mis tareas «📤 Listo, enviar esta tarea» con «Voy a iniciar» y las fotos en el MISMO minuto: en la v186 las horas iban
//     escondidas con inicio = fin y «Enviar» se trababa («La hora de fin tiene que ser después de la de inicio»; con ANTES=1
//     contra la v186 lo reproduce). Arreglado: se manda, con el fin un minuto después; con columnas de minutos
//     distintos, como siempre.
//  1) los planos en la pantalla nueva de la cuadrilla: «Orden de trabajo» con la lista (abre el visor con la imagen) y Modo obra
//     con «📐 Ver plano» (con dos planos, «Ver planos (2)» lleva a la orden); la obra sin planos lo dice y Modo obra no muestra nada.
//  2) ubicaciones: «Cómo llegar» con el mapa, el pin y Google Maps (también sin señal), y el Mapa con la obra.
//  3) compatibilidad (__v187No): sin planos en la pantalla nueva (como la v186).
//  4) con muchas obras (datosGrande, CPU ×4): quieto en «Hoy» y con cada cambio de su orden, el celu de la cuadrilla no
//     redibuja lo que no ve (el Inicio viejo con el % de todas las obras, Planificación, lo de la oficina); Planificación se
//     dibuja al abrirla. Con ANTES=1 solo mide (la v186: ≈ 5 s de trabajo cada 20 s quieto y ≈ 2 s por cambio).
// También con REGLAS=1 (las reglas reales: la cuadrilla lee planosObra / planosImg).
const fs = require('fs');
const { abrir, prueba } = require('./h');
const { datos165 } = require('./datos165');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const ANTES = !!process.env.ANTES;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const FOTO = __dirname + '/foto.jpg', FOTO64 = fs.readFileSync(FOTO).toString('base64');
const camaraFalsa = () => {
  const dib = (c) => { const x = c.getContext('2d'), w = c.width, h = c.height; x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, w, h); x.fillStyle = '#6f6f5c'; x.fillRect(0, h * 0.6, w, h * 0.4); x.fillStyle = '#e9edf2'; x.fillRect(w * 0.47, h * 0.12, w * 0.05, h * 0.62); };
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => { const c = document.createElement('canvas'); c.width = 720; c.height = 1280; dib(c); setInterval(() => dib(c), 250); return c.captureStream(10); };
};
// la app de Android (APK 1.4): la cámara del teléfono por el plugin Camera
const apk = (foto64) => {
  window.__cam = 0;
  const fotoURL = () => { const b = atob(foto64), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return URL.createObjectURL(new Blob([u], { type: 'image/jpeg' })); };
  window.__cargador = { url: 'https://miguelangelbasq-tech.github.io/alumbrado-stock/', nativo: true, version: () => 'prueba', listo() { }, guardar() { }, actualizar() { }, borrar() { } };
  window.Capacitor = { isNativePlatform: () => true, convertFileSrc: (u) => u, Plugins: {
    Camera: { takePhoto: async () => { window.__cam++; await new Promise((r) => setTimeout(r, 900)); return { type: 'image', webPath: fotoURL(), saved: false }; } },
    App: { addListener: () => Promise.resolve({ remove() { } }), getInfo: async () => ({ version: '1.4' }) } } };
  try { localStorage.setItem('ema.camara.telefono', '1'); } catch (e) { }
};
(async () => {
  const c = prueba('v187' + (cel ? ' cel' : '') + (ANTES ? ' ANTES' : ''));
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v165: true, v166: true, v167: true, v171: true, v172: true, v173: true, v186: true, v187: !ANTES, leaflet: true, reglas: !!process.env.REGLAS, antes: camaraFalsa };
  let browser = null;
  const sesion = async (quien, op, datos, cpu) => {
    const A = await abrir(Object.assign({ sesion: quien, datos: datos || datos165(), browser, espera: 4500 }, MOD, { cel: true }, op || {})); browser = A.browser;
    A.page.on('dialog', (x) => x.accept());
    await A.ctx.grantPermissions(['geolocation', 'camera'], { origin: 'https://app.test' }); await A.ctx.setGeolocation({ latitude: -31.4273, longitude: -64.1889, accuracy: 8 });
    await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }));
    const cdp = await A.ctx.newCDPSession(A.page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu || 4 }); A.cdp = cdp;
    await A.page.waitForTimeout(800); return A;
  };
  const otra = async (A, quien) => { const B = await abrir(Object.assign({ sesion: quien, browser: A.browser, ctx: A.ctx, espera: 4500 }, MOD, { cel: true })); B.page.on('dialog', (x) => x.accept()); return B; };
  const foto = async (p, n, k) => { if (!CAP) return; if (k) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); }, T(k)); fs.mkdirSync(CAP, { recursive: true }); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + n + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const hoyDe = (p) => p.evaluate(() => fechaAISO(new Date()));
  const reloj = (p, hoy, hm) => p.evaluate(([d, h]) => { window.__tcAhora = () => new Date(d + 'T' + h + ':00').getTime(); }, [hoy, hm]);
  const tx = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const otC = (p, db) => p.evaluate((db) => JSON.parse(JSON.stringify((db ? window.__stubDB().ordenesTrabajo.ot165 : ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {})), !!db);
  const hm = (t) => new Date(t).toTimeString().slice(0, 5);
  const T = (k) => `#mtApp .mt-ot[data-ot="ot165"] .mt-tarea[data-k="${k}"]`;
  const misTareas = async (p) => {
    await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(1500);
    if (!(await p.$(T('excavacion')))) { await p.click('.mt-item[data-mtabrir="ot165"]').catch(() => { }); await p.waitForTimeout(1200); }
  };
  const verTarea = async (p, k) => { await p.evaluate((k) => { const card = document.querySelector('#mtApp .mt-ot[data-ot="ot165"]'); if (!card) return; const l = [...card.querySelectorAll('.mt-tarea[data-k]')].map((x) => x.dataset.k); const d = card.querySelector('[data-mtcir="' + l.indexOf(k) + '"]'); d && d.click(); }, k); await p.waitForTimeout(700); };
  // el 📷 de la fila (la etiqueta, como el dedo)
  const camFila = async (p, k, num) => p.evaluate(([s, n]) => { const i = [...document.querySelectorAll(s + ' input.mt-foto-t')].find((y) => y.dataset.fln === n); const l = i && i.closest('label'); if (!l) return false; l.click(); return true; }, [T(k), num]);
  const cerrarCam = async (p) => { await p.evaluate(() => { if (document.getElementById('emaCam')) window.camaraApp.cerrar(); }); await p.waitForTimeout(500); };
  const filaInput = async (p, k, num) => { const ok = await p.evaluate(([s, n]) => { const x = [...document.querySelectorAll(s + ' input.mt-foto-t')].find((y) => y.dataset.fln === n); if (!x) return false; x.id = 'v166In'; return true; }, [T(k), num]); if (ok) { await p.setInputFiles('#v166In', FOTO); await p.waitForTimeout(1800); await p.evaluate(() => { const x = document.getElementById('v166In'); x && x.removeAttribute('id'); }); } return ok; };
  const pasos = async (p, k) => Object.values(((await otC(p)).pasosObra || {})[k] || {}).filter((x) => x.estado === 'si').sort((a, b) => a.finTs - b.finTs).map((x) => x.num + ' ' + x.ini + '-' + x.fin + ' ' + x.min);
  const filaTxt = (p, k, num) => p.evaluate(([s, n]) => { const f = [...document.querySelectorAll(s + ' .fl-fila.hecha')].find((x) => (x.querySelector('.fl-nom') || {}).textContent.indexOf(n) >= 0); return f ? f.textContent.replace(/\s+/g, ' ').trim() : ''; }, [T(k), num]);
  const recs = (p) => p.evaluate(() => window.__inicioTarea && window.__inicioTarea.estado ? window.__inicioTarea.estado().recs.map((r) => r.em + ' ' + r.t + ' · ' + (r.r1 || '') + ' · ' + (r.r2 || '') + (r.r3 ? ' · ' + r.r3 : '')) : []);
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);

  const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mN4+vQpAAWuAtWnU9yRAAAAAElFTkSuQmCC';
  const conPlanos = (n) => { const d = datos165(), t0 = Date.now(); d.db.planosObra = {}; d.db.planosImg = {};
    for (let i = 1; i <= n; i++) { d.db.planosObra['pl' + i] = { plazaId: 'p1', nombre: i === 1 ? 'Planta general' : 'Tablero y circuitos', tipo: 'pdf', paginas: [{ n: 1, w: 800, h: 600 }], creado: t0 - i * 5000, por: 'Ana', mini: PNG }; d.db.planosImg['pl' + i + '_0_0'] = { d: PNG }; }
    return d; };
  const relojS = (p, hoy, hms) => p.evaluate(([d, h]) => { window.__tcAhora = () => new Date(d + 'T' + h).getTime(); }, [hoy, hms]);
  const vis = (p, s) => p.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.offsetParent !== null).length, s);
  const visor = (p) => p.evaluate(() => { const i = document.getElementById('plnImg'); return { abierto: !!document.getElementById('plnVisor'), img: !!(i && /^data:image/.test(i.src || '')) }; });
  const cerrarV = (p) => p.evaluate(() => window.cerrarPlano && window.cerrarPlano());
  const ir = async (p, x) => { await p.evaluate((x) => window.__cuadrillaDia.ir(x), x); await p.waitForTimeout(900); };
  const mandar = async (p, k) => {
    await p.evaluate((s) => { const b = document.querySelector(s + ' [data-m="si"]'); b && !b.classList.contains('on') && b.click(); }, T(k)); await p.waitForTimeout(700);
    await p.click(T(k) + ' [data-et="si"]', { timeout: 8000 }).catch(() => { }); await p.waitForTimeout(700);
    const pop = await tx(p, '#etPop');
    await p.click('#etPop [data-etp="enviar"]', { timeout: 8000 }).catch(() => { }); await p.waitForTimeout(2200);
    const C = await otC(p);
    return { pop, abierto: await p.evaluate(() => !!document.getElementById('etPop')), msg: await tx(p, '#etMsg'), env: (((C.tareaEnv || {})[k] || {})['Juan Pérez'] || {}).estado || '', horas: (C.horasTarea || {})[k] || null };
  };
  const iniciarYFotos = async (p, hoy, tIni, fotos) => {
    await relojS(p, hoy, tIni); await misTareas(p);
    const filas = await p.evaluate((s) => [...document.querySelectorAll(s + ' .fl-fila:not(.hecha) input.mt-foto-t')].map((x) => x.dataset.fln), T('excavacion'));
    await camFila(p, 'excavacion', filas[0]); await p.waitForTimeout(900);
    await p.click('#viOv [data-vi="iniciar"]').catch(() => { }); await p.waitForTimeout(1500);
    await cerrarCam(p);
    for (const [n, h] of fotos) { await relojS(p, hoy, h); await filaInput(p, 'excavacion', n); }
    await p.waitForTimeout(700);
  };

  // ================================================================= 0) «Enviar» con todo en el mismo minuto
  if (SOLO(0)) {
    console.log('— 0 · Mis tareas: «Listo, enviar» con «Voy a iniciar» y las fotos en el mismo minuto');
    let A = await sesion('juan'); let p = A.page, hoy = await hoyDe(p);
    await iniciarYFotos(p, hoy, '08:20:05', [['Col 6', '08:20:40'], ['Col 7', '08:20:50'], ['Col 8', '08:20:58']]);
    const ps = await pasos(p, 'excavacion');
    c(ps.length === 3 && ps.every((x) => / 08:20-08:20 /.test(x)), 'las 3 columnas quedaron con 08:20 a 08:20 (todo en el mismo minuto) · ' + ps.join(' | '));
    let r = await mandar(p, 'excavacion');
    if (ANTES) {
      c(r.abierto && /fin tiene que ser después/.test(r.msg) && !r.env, 'ANTES: «Enviar» no manda y dice «La hora de fin tiene que ser después de la de inicio» (las horas están escondidas: no hay qué corregir) · ' + JSON.stringify(r).slice(0, 220));
      await A.ctx.close(); await browser.close(); process.exit(c.fin() ? 1 : 0);
    }
    c(/La hora de cada columna/.test(r.pop) && /Col 6 · 08:20–08:20/.test(r.pop), 'el cartelito muestra el tiempo de cada columna (sin pedir horas) · ' + r.pop.slice(0, 120));
    c(!r.abierto && r.env === 'si' && r.horas && r.horas.ini === '08:20' && r.horas.fin === '08:21', '«Enviar» manda la tarea: tareaEnv «si» y la hora de la tarea 08:20 a 08:21 (el fin un minuto después) · ' + JSON.stringify({ abierto: r.abierto, msg: r.msg, env: r.env, horas: r.horas && [r.horas.ini, r.horas.fin] }));
    c(errsJs(A).length === 0, 'sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
    // minutos distintos: como siempre (el fin es la última foto)
    A = await sesion('juan'); p = A.page; hoy = await hoyDe(p);
    await iniciarYFotos(p, hoy, '08:20:00', [['Col 6', '08:44:00'], ['Col 7', '09:10:00'], ['Col 8', '09:30:00']]);
    r = await mandar(p, 'excavacion');
    c(!r.abierto && r.env === 'si' && r.horas && r.horas.ini === '08:20' && r.horas.fin === '09:30', 'con minutos distintos, igual que antes: 08:20 a 09:30 (la última foto) · ' + JSON.stringify(r.horas && [r.horas.ini, r.horas.fin]));
    await A.ctx.close();
  }

  // ================================================================= 1) planos
  if (SOLO(1)) {
    console.log('— 1 · los planos en la pantalla nueva de la cuadrilla');
    let A = await sesion('juan', null, conPlanos(1)); let p = A.page;
    await p.waitForTimeout(800);
    await ir(p, 'orden');
    c((await vis(p, '#cdApp [data-plnot="pl1"]')) === 1 && /Planos de la obra/.test(await tx(p, '#cdApp .cd-pl187')), '«Orden de trabajo»: «📐 Planos de la obra» con «Planta general» · ' + (await tx(p, '#cdApp .cd-pl187')).slice(0, 80));
    const bb = await p.locator('#cdApp [data-plnot="pl1"]').boundingBox();
    c(bb && bb.height >= 44, 'el botón del plano se toca bien (≥ 44 px) · ' + (bb && Math.round(bb.height)));
    await p.click('#cdApp [data-plnot="pl1"]'); await p.waitForTimeout(2200);
    let v = await visor(p);
    c(v.abierto && v.img, 'tocar el plano abre el visor con la imagen (la cuadrilla la lee de la base) · ' + JSON.stringify(v));
    await foto(p, '1_visor_orden');
    await p.goBack().catch(() => { }); await p.waitForTimeout(800);
    c(!(await visor(p)).abierto && (await p.evaluate(() => (window.__cuadrillaDia.estado() || {}).pant)) === 'orden', '«atrás» cierra el plano y vuelve a la orden');
    await cerrarV(p);
    await ir(p, 'obra');
    c((await vis(p, '#cdApp .cd-pl187b[data-plnot="pl1"]')) === 1, 'Modo obra: «📐 Ver plano» abajo');
    await p.click('#cdApp .cd-pl187b'); await p.waitForTimeout(2200);
    v = await visor(p);
    c(v.abierto && v.img, '… y abre el plano en el visor · ' + JSON.stringify(v));
    await foto(p, '1b_visor_obra');
    await cerrarV(p); await p.waitForTimeout(400);
    // sin señal (la imagen ya se abrió una vez): el plano se sigue viendo
    await A.ctx.setOffline(true); await p.evaluate(() => { window.__stubSinRed = true; });
    await ir(p, 'orden'); await p.click('#cdApp [data-plnot="pl1"]').catch(() => { }); await p.waitForTimeout(2000);
    v = await visor(p);
    c(v.abierto && v.img, 'sin señal: el plano ya abierto se vuelve a ver · ' + JSON.stringify(v));
    await cerrarV(p); await A.ctx.setOffline(false); await p.evaluate(() => { window.__stubSinRed = false; });
    c(errsJs(A).length === 0, 'sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    c(await scrollX(p) <= 0, 'sin scroll de costado');
    await A.ctx.close();
    // dos planos
    A = await sesion('juan', null, conPlanos(2)); p = A.page; await p.waitForTimeout(800);
    await ir(p, 'obra');
    c(/Ver planos \(2\)/.test(await tx(p, '#cdApp .cd-pl187b')), 'con dos planos, Modo obra dice «📐 Ver planos (2)»');
    await p.click('#cdApp .cd-pl187b'); await p.waitForTimeout(1000);
    c((await p.evaluate(() => window.__cuadrillaDia.estado().pant)) === 'orden' && (await vis(p, '#cdApp [data-plnot]')) === 2, '… que lleva a la orden con los dos planos');
    await A.ctx.close();
    // sin planos
    A = await sesion('juan'); p = A.page; await p.waitForTimeout(800);
    await ir(p, 'orden');
    c(/todavía no tiene planos/.test(await tx(p, '#cdApp .cd-pl187')), 'la obra sin planos: la orden dice «Esta obra todavía no tiene planos cargados»');
    await ir(p, 'obra');
    c(!(await vis(p, '#cdApp .cd-pl187b')), 'y Modo obra no muestra el botón');
    await A.ctx.close();
  }

  // ================================================================= 2) ubicaciones
  if (SOLO(2)) {
    console.log('— 2 · ubicaciones: «Cómo llegar» y el Mapa');
    const A = await sesion('juan'); const p = A.page;
    await A.ctx.setGeolocation({ latitude: -31.43, longitude: -64.19, accuracy: 8 });
    await ir(p, 'llegar'); await p.waitForTimeout(1500);
    const L1 = await p.evaluate(() => ({ mapa: !!document.querySelector('#cdMapa.leaflet-container, #cdMapa .leaflet-container'), pin: !!document.querySelector('#cdMapa .cd-pinm'), gm: (document.querySelector('[data-cd="gmaps"]') || {}).href || '', dist: (document.querySelector('.cd-dist') || {}).textContent || '' }));
    c(L1.mapa && L1.pin && /destination=-31\.427100,-64\.188900/.test(L1.gm) && /m/.test(L1.dist), '«Cómo llegar»: el mapa con el pin de la obra, la distancia y «Abrir en Google Maps» con el punto de la obra · ' + JSON.stringify(L1).slice(0, 200));
    await foto(p, '2_llegar');
    await p.evaluate(() => mostrarVista('mapa')); await p.waitForTimeout(2500);
    const M = await p.evaluate(() => ({ vista: document.body.dataset.vista, leaflet: !!document.querySelector('#viewMapa .leaflet-container'), pines: document.querySelectorAll('#viewMapa .leaflet-marker-icon').length }));
    c(M.vista === 'mapa' && M.leaflet && M.pines >= 1, 'el Mapa se abre con las obras · ' + JSON.stringify(M));
    await A.ctx.setOffline(true); await p.evaluate(() => { window.__stubSinRed = true; });
    await p.evaluate(() => mostrarVista('inicio')); await ir(p, 'llegar'); await p.waitForTimeout(1200);
    const L2 = await p.evaluate(() => ({ mapa: !!document.querySelector('#cdMapa.leaflet-container, #cdMapa .leaflet-container'), gm: !!document.querySelector('[data-cd="gmaps"]') }));
    c(L2.mapa && L2.gm, 'sin señal: «Cómo llegar» sigue con el mapa y el botón de Google Maps · ' + JSON.stringify(L2));
    c(errsJs(A).length === 0, 'sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 4) lo que la cuadrilla no ve, no se recalcula (datos grandes)
  if (SOLO(4)) {
    console.log('— 4 · con muchas obras: el celu de la cuadrilla no redibuja lo que no ve (CPU ×4)');
    const { datos147 } = require('./datos147'); const { datosGrande } = require('./datosGrande');
    const d = datos147(), g = datosGrande();
    ['avanceObras', 'movimientos', 'reservas', 'historialCalculos', 'planSemanal', 'historialEtapas', 'catalogoProductos', 'gastosObra', 'planosObra', 'mapaPuntos'].forEach((k) => { d.db[k] = Object.assign({}, g.db[k] || {}, d.db[k] || {}); });
    Object.entries(g.db.ordenesTrabajo || {}).forEach(([k, o]) => { if (!d.db.ordenesTrabajo[k] && !(o.personalNombres || []).includes('juan perez')) d.db.ordenesTrabajo[k] = o; });
    const prep4 = () => { localStorage.setItem('ema.ultimoUid', 'uJuan'); localStorage.setItem('ema.perfil.uJuan', JSON.stringify({ rol: 'cuadrilla', activo: true, pendiente: false, persona: 'Juan Pérez', personaClave: 'juan perez' })); window.__stubPorColeccion = true; window.__LTP = []; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__LTP.push([e.startTime, e.duration]))).observe({ entryTypes: ['longtask'] }); } catch (e) { } };
    const A = await abrir(Object.assign({}, MOD, { sesion: 'juan', datos: d, browser, cel: true, espera: 9000, antes: prep4 })); browser = A.browser; const p = A.page;
    const cdp = await A.ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.waitForTimeout(8000);
    const st = await p.evaluate(() => ({ liv: window.__modoDatos.liviano(), obras: avanceObras.length, crew: document.body.classList.contains('inicio-crew') }));
    const lt = async (fn, ms) => { const t0 = await p.evaluate(() => performance.now()); if (fn) await p.evaluate(fn); await p.waitForTimeout(ms); const L = (await p.evaluate(() => window.__LTP)).filter(([s]) => s >= t0); return { n: L.length, suma: Math.round(L.reduce((s, x) => s + x[1], 0)), max: Math.round(Math.max(0, ...L.map((x) => x[1]))) }; };
    const quieto = await lt(null, 15000);
    const marca = await lt(() => { window.fbOtCampo('ot1', { 'campo.prueba187': Date.now() }); }, 4000);
    const lim = ANTES ? 1e9 : 600;
    c(st.liv && st.obras > 200 && st.crew, 'Juan entra liviano con ' + st.obras + ' obras · ' + JSON.stringify(st));
    c(quieto.suma < lim, 'quieto 15 s en «Hoy»: casi sin trabajo (la v186 calculaba el % de todas las obras cada 4 s) · ' + JSON.stringify(quieto));
    c(marca.suma < lim, 'un cambio en su orden (una foto, una marca) no frena la pantalla (la v186: ≈ 2 s con el celu lento) · ' + JSON.stringify(marca));
    if (!ANTES) {
      const sal = await p.evaluate(() => window.__pl187.estado());
      c(sal.pend.length >= 1, 'lo de la oficina y Planificación quedan pendientes (escondidos) · ' + JSON.stringify(sal));
      await p.evaluate(() => mostrarVista('plan')); await p.waitForTimeout(2500);
      const pg = await p.evaluate(() => ({ vista: document.body.dataset.vista, dias: document.querySelectorAll('#planGrid .plan-day').length, pend: window.__pl187.estado().pend }));
      c(pg.dias >= 5 && pg.pend.indexOf('renderPlanGrid') < 0, 'Planificación se dibuja apenas Juan la abre · ' + JSON.stringify(pg));
      await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(1500);
      c(await p.evaluate(() => !!document.querySelector('#cdApp') && document.querySelector('#cdApp').offsetParent !== null), 'el Inicio de la cuadrilla («Hoy») sigue igual');
    }
    c(errsJs(A).length === 0, 'sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 3) compatibilidad
  if (SOLO(3)) {
    console.log('— 3 · __v187No: como la v186');
    const A = await sesion('juan', { v187: false }, conPlanos(1)); const p = A.page; await p.waitForTimeout(800);
    await ir(p, 'orden'); const a = await vis(p, '#cdApp [data-plnot]');
    await ir(p, 'obra'); const b = await vis(p, '#cdApp .cd-pl187b');
    c(!a && !b, 'con __v187No la pantalla nueva no muestra planos (como la v186)');
    await A.ctx.close();
  }
  if (browser) await browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
