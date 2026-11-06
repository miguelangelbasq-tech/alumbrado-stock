// v125 · La cuadrilla saca fotos de cualquier obra con la Cámara, aunque no tenga orden ahí (con «📍 Estás en…» por el GPS).
// Necesita las reglas v125 (fotoLibre); sin ellas, la foto queda en el celu y avisa que falta publicar las reglas.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const FOTO = __dirname + '/foto.jpg';
(async () => {
  const c = prueba('v125' + (cel ? ' cel' : ''));
  const d = baseDatos();
  delete d.db.ordenesTrabajo.ot1;   // Juan no tiene ninguna orden
  d.db.avanceObras.p1.lat = -31.4201; d.db.avanceObras.p1.lng = -64.1888;
  d.db.avanceObras.p2 = { nombre: 'PEDRO CAVIA', obraId: '5001', barrio: 'Alta Córdoba', lat: -31.39, lng: -64.18, creado: Date.now() };
  const A = await abrir({ sesion: 'juan', cel, datos: d, espera: 4500, ofPasos: true, mtNuevo: true, porPartes: true, reglas: true, https: true }), p = A.page;
  await A.ctx.grantPermissions(['geolocation'], { origin: 'https://app.test' }); await A.ctx.setGeolocation({ latitude: -31.4202, longitude: -64.1889, accuracy: 10 });
  await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.abort());   // sin el Worker: la foto va a la base
  const hoja = async () => { await p.evaluate(() => { localStorage.removeItem('ema.camara.ultima'); abrirMenuLateral(); }); await p.waitForTimeout(400); await p.evaluate(() => document.getElementById('menuCamara').click()); await p.waitForSelector('#ecElegir', { timeout: 4000 }).catch(() => { }); await p.waitForTimeout(1500); };
  await hoja();
  let r = await p.evaluate(() => ({ obras: [...document.querySelectorAll('#ecObras .ec-op b')].map((x) => x.textContent), buscar: !!document.getElementById('ecBuscar'), nada: !!document.querySelector('#ecElegir .ec-nada'), geo: (document.getElementById('ecGeo') || {}).textContent || '' }));
  c(r.obras.length === 2 && r.buscar && !r.nada, 'sin orden, la cuadrilla ve todas las obras con buscador · ' + r.obras.join(', '));
  c(/San Martín/.test(r.geo), 'el GPS le sugiere la obra donde está parado · ' + r.geo.replace(/\s+/g, ' ').slice(0, 90));
  if (cel) await p.screenshot({ path: __dirname + '/v125_hoja_cel.png' });
  await p.fill('#ecBuscar', 'cavia'); await p.waitForTimeout(300);
  r = await p.evaluate(() => [...document.querySelectorAll('#ecObras .ec-op')].filter((b) => b.style.display !== 'none').map((b) => b.querySelector('b').textContent));
  c(r.length === 1 && /PEDRO CAVIA/.test(r[0]), 'el buscador encuentra cualquier obra · ' + r.join(', '));
  await p.evaluate(() => { const b = [...document.querySelectorAll('#ecObras .ec-op')].find((x) => /PEDRO CAVIA/.test(x.textContent)); b.click(); }); await p.waitForTimeout(300);
  const sacar = async () => {
    await p.evaluate(() => { HTMLInputElement.prototype.__clk = HTMLInputElement.prototype.click; document.querySelector('#ecElegir [data-ece="abrir"]').click(); }); await p.waitForTimeout(700);
    await p.click('#emaCam [data-ec="cerrar"]', { timeout: 1500 }).catch(() => { }); await p.waitForTimeout(300);
    await p.setInputFiles('#ecLibreIn', FOTO); await p.waitForTimeout(4000);
  };
  await sacar();
  r = await p.evaluate(() => { const db = window.__stubDB(); return { fo: Object.values(db.fotosObra || {}).map((x) => [x.plazaId, x.otId, x.por, x.origen].join('|')), ad: Object.values(db.adjuntos || {}).filter((x) => x.plazaId === 'p2').length, msg: ((document.getElementById('ecToast') || document.getElementById('ecAviso') || {}).textContent || '') }; });
  c(r.fo.some((x) => /^p2\|\|Juan Pérez/.test(x)) && r.ad >= 1, 'la foto queda en el legajo de la obra elegida, sin orden, con quién la sacó · ' + JSON.stringify(r).slice(0, 220));
  // sin las reglas nuevas publicadas: queda en el celu y lo dice
  await p.evaluate(() => { window.__reglasSinV125 = true; });
  await hoja();
  await p.evaluate(() => { const b = [...document.querySelectorAll('#ecObras .ec-op')].find((x) => /PEDRO CAVIA/.test(x.textContent)); b && b.click(); }); await p.waitForTimeout(300);
  const antes = await p.evaluate(() => Object.keys(window.__stubDB().fotosObra || {}).length);
  await sacar();
  r = await p.evaluate(async () => ({ n: Object.keys(window.__stubDB().fotosObra || {}).length, cola: (await window.__fotosSinSenal.todos()).length, msg: [...document.querySelectorAll('#ecToast, #ecAviso')].map((e) => e.textContent).join(' ') }));
  c(r.n === antes && r.cola >= 1 && /publique las reglas nuevas/.test(r.msg), 'sin las reglas nuevas, la foto queda en el celu y avisa que falta publicarlas · ' + JSON.stringify(r).slice(0, 220));
  await p.evaluate(() => { window.__reglasSinV125 = false; });
  await p.evaluate(() => window.__fotosSinSenal.reintentar(true)); await p.waitForTimeout(2500);
  r = await p.evaluate(async () => ({ n: Object.keys(window.__stubDB().fotosObra || {}).length, cola: (await window.__fotosSinSenal.todos()).length }));
  c(r.n > antes && r.cola === 0, 'cuando están las reglas, se suben solas la foto y su ficha del legajo · ' + JSON.stringify(r));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
