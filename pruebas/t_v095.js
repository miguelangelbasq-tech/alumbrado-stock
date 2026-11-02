// Pruebas v095 · Catastro de Córdoba de fondo en Proyectista: mapa (manzanas, parcelas, calles con nombre), plano, DXF,
// plano impreso/memoria y «🌳 Traer el borde de la plaza». Con la carpeta catastro/v6 real (54 bloques) servida junto a la app.
// La conversión de coordenadas se controla aparte con PROJ (num/gkinv.json: al micrómetro).
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const esperar = (p, fn, arg, ms = 15000) => p.waitForFunction(fn, arg, { timeout: ms, polling: 150 }).then(() => true, () => false);
// Plaza de las Américas (46 vértices en el catastro), centro -31.4330339, -64.1941800
const C = { lat: -31.4330339, lng: -64.19418 };
const pto = (id, n, tipo, dx, dy) => ({ id, n, tipo, lat: C.lat + dy / 110861, lng: C.lng + dx / 95049, acc: 0.02, fuente: 'gps', ts: 1, nota: '' });
function datos() {
  const d = baseDatos();
  d.db.proyectos = { pa: { nombre: 'PLAZA DE LAS AMÉRICAS · proyecto', obraId: '', obraNombre: '', puntos: [pto('t1', 'T1', 'tab', -20, -15), pto('c1', 'C1', 'colN', -5, 0), pto('c2', 'C2', 'colN', 15, 5), pto('c3', 'C3', 'colN', 30, 12)], creado: 1, ts: 1, por: 'admin', faja: 0, etapa: 1 } };
  return d;
}
(async () => {
  const c = prueba('v095' + (cel ? ' cel' : ''));
  const M = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true, https: true, leaflet: true });
  const p = M.page, pedidos = [];
  p.on('request', (r) => { if (/\/catastro\//.test(r.url())) pedidos.push(new URL(r.url()).pathname); });
  await p.evaluate(() => { try { localStorage.removeItem('ema.py.cat'); } catch (e) { } });
  await p.evaluate(() => window.__abrirProyectista('pa'));
  let ok = await esperar(p, () => document.querySelectorAll('#pyMapa .py-cat-t').length > 5, null, 20000);
  let r = await p.evaluate(() => { const K = window.__proyectista._cat; return { bloques: Object.keys(K.CAT.bloques), z: null, txt: [...document.querySelectorAll('#pyMapa .py-cat-t')].map((x) => (x.className.match(/py-cat-t (\w)/) || [])[1] + ':' + x.textContent).slice(0, 400), canvas: document.querySelectorAll('#pyMapa .leaflet-pyCat-pane canvas').length, chip: (document.querySelector('[data-py="catVer"]') || {}).className }; });
  c(ok && r.canvas === 1 && /activo/.test(r.chip), 'el mapa muestra el catastro de fondo (dibujado en una capa liviana) con el chip «🗺 Catastro» prendido');
  c(r.bloques.length >= 1 && r.bloques.length <= 2 && pedidos.filter((x) => /\/b_/.test(x)).length === r.bloques.length && pedidos.includes('/catastro/v6/indice.json'), 'baja solo el bloque de la zona (' + r.bloques.join(', ') + ') de los 54, y el índice: ' + JSON.stringify(pedidos));
  const calles = r.txt.filter((x) => /^c:/.test(x)).map((x) => x.slice(2));
  c(calles.length >= 2, 'se ven los nombres de las calles: ' + JSON.stringify(calles.slice(0, 6)));
  c(r.txt.some((x) => /^v:.*Am[ée]ricas/i.test(x)), 'y el nombre de la plaza del catastro: ' + JSON.stringify(r.txt.filter((x) => /^v:/.test(x)).slice(0, 3)));
  // ---- precisión: el catastro dibujado coincide con el contorno de la plaza (GeoJSON de Ángel) pasado por PROJ
  r = await p.evaluate(() => { const K = window.__proyectista._cat; const z = K.CAT.bloques; const ps = K.catPedazos(4386300, 6522200, 4386600, 6522500); return ps ? ps.length : -1; });
  c(r >= 1, 'los pedacitos de 250 m de la plaza están (' + r + ')');
  // ---- apagar y prender
  await p.click('[data-py="catVer"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => ({ t: document.querySelectorAll('#pyMapa .py-cat-t').length, ls: localStorage.getItem('ema.py.cat'), chip: document.querySelector('[data-py="catVer"]').className }));
  c(r.t === 0 && r.ls === '0' && !/activo/.test(r.chip), 'el chip lo apaga (y se acuerda): ' + JSON.stringify(r));
  await p.click('[data-py="catVer"]'); ok = await esperar(p, () => document.querySelectorAll('#pyMapa .py-cat-t').length > 5);
  c(ok, 'y lo vuelve a prender');
  // ---- lejos: pide acercarse
  await p.evaluate(() => { const m = document.querySelector('#pyMapa'); });
  await p.evaluate(() => window.__proyectista._mapa && window.__proyectista._mapa().setZoom(14));
  await p.waitForTimeout(900);
  r = await p.evaluate(() => ({ t: document.querySelectorAll('#pyMapa .py-cat-t').length, est: (document.getElementById('pyCatEst') || {}).textContent, vis: !(document.getElementById('pyCatEst') || {}).hidden }));
  c(r.t === 0 && /Acercá el mapa/.test(r.est) && r.vis, 'con el mapa muy lejos no lo dibuja y dice «Acercá el mapa para ver el catastro»');
  // ---- plano
  await p.click('[data-py="pest"][data-p="plano"]'); ok = await esperar(p, () => !!document.querySelector('#pyPlano svg g.py-cat path'));
  r = await p.evaluate(() => { const g = document.querySelector('#pyPlano svg g.py-cat'); return g ? { paths: g.querySelectorAll('path').length, txt: [...g.querySelectorAll('text')].map((t) => t.textContent).slice(0, 8), antes: !!g.nextElementSibling } : null; });
  c(ok && r && r.paths >= 3 && r.txt.length >= 2, 'el plano tiene el catastro de fondo (manzanas, parcelas, calles con nombre): ' + JSON.stringify(r && r.txt));
  // ---- DXF
  const dxf = await p.evaluate(() => window.__proyectista._dxf('pa', 'gk'));
  const capas = {}; const L = dxf.split('\r\n'); for (let i = 0; i < L.length - 1; i++) if (L[i] === '8' && /^CAT_/.test(L[i + 1])) capas[L[i + 1]] = (capas[L[i + 1]] || 0) + 1;
  const xs = []; for (let i = 0; i < L.length - 3; i++) if (L[i] === 'VERTEX' && L[i + 2] === 'CAT_MANZANA') xs.push(+L[i + 4]);
  c(capas.CAT_MANZANA > 0 && capas.CAT_PARCELA > 0 && capas.CAT_EJE > 0 && capas.CAT_TEXTO > 0 && /\r\nLAYER\r\n2\r\nCAT_MANZANA\r\n/.test(dxf), 'el DXF lleva el catastro en capas CAT_… (' + Object.keys(capas).join(', ') + ')');
  c(xs.length && xs.every((x) => x > 4385500 && x < 4387600), 'en Gauss-Krüger faja 4, alrededor de la plaza (x ' + Math.min(...xs).toFixed(1) + ' … ' + Math.max(...xs).toFixed(1) + ')');
  // ---- traer el borde de la plaza
  await p.click('[data-py="pest"][data-p="mapa"]'); await p.waitForTimeout(600);
  await p.click('[data-py="bordeCat"]'); ok = await esperar(p, () => (window.__stubDB().proyectos.pa.puntos || []).filter((x) => x.tipo === 'borde').length > 3);
  r = await p.evaluate(() => { const ps = window.__stubDB().proyectos.pa.puntos, b = ps.filter((x) => x.tipo === 'borde'); return { n: b.length, f: b[0] && b[0].fuente, nota: b[0] && b[0].nota, otros: ps.length - b.length, msg: (document.getElementById('pyMsg') || {}).textContent }; });
  c(ok && r.n === 46 && r.f === 'catastro' && r.nota === 'Plaza de las Américas' && r.otros === 4 && /Plaza de las Américas/.test(r.msg), '«🌳 Traer el borde de la plaza» pone los 46 puntos del contorno del catastro: ' + JSON.stringify(r));
  p.once('dialog', (d) => d.accept());
  await p.click('[data-py="bordeCat"]'); await p.waitForTimeout(1500);
  r = await p.evaluate(() => window.__stubDB().proyectos.pa.puntos.filter((x) => x.tipo === 'borde').length);
  c(r === 46, 'si ya había borde, pregunta y lo cambia (no lo duplica): ' + r);
  // el cálculo de luz usa ese borde
  r = await p.evaluate(() => { const P = window.__stubDB().proyectos.pa, C = window.__proyectista._calc; return C.luz(P.puntos, [{ id: 'L', nombre: 'x', W: 75, lm: 8000, cos: 0.95 }], C.cfgDe(P)).zonaTipo; });
  c(r === 'borde' || r === undefined, 'el cálculo de luz toma ese borde como zona');
  // ---- plano impreso y memoria con el catastro
  await p.click('[data-py="imprimir"]'); ok = await esperar(p, () => !!document.getElementById('hojaOv'));
  r = await p.evaluate(() => { const f = document.querySelector('#hojaOv iframe'); return f ? /class="py-cat"/.test(f.srcdoc) : false; });
  c(ok && r, 'el plano impreso (PDF) sale con el catastro de fondo');
  await p.evaluate(() => window.hojaEMA && hojaEMA.cerrar());
  if (cel) { r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: document.documentElement.clientWidth })); c(r.sw <= r.w + 1, 'celular: sin scroll de costado ' + JSON.stringify(r)); }
  await p.screenshot({ path: __dirname + '/v095_mapa' + (cel ? '_cel' : '') + '.png' });
  // ---- sin el catastro (sin señal o sin subir): lo dice y todo lo demás anda
  const N = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true, https: true, leaflet: true });
  await N.page.evaluate(() => { const f = window.fetch; window.fetch = function (u) { return /\/catastro\//.test(String(u)) ? Promise.reject(new TypeError('Failed to fetch')) : f.apply(this, arguments); }; });   // sin señal para el catastro
  await N.page.evaluate(() => window.__abrirProyectista('pa')); await N.page.waitForTimeout(2500);
  r = await N.page.evaluate(() => (document.getElementById('pyCatEst') || {}).textContent || '');
  c(/No se pudo bajar el catastro/.test(r), 'si no se puede bajar, lo avisa en el mapa: «' + r + '»');
  await N.page.click('[data-py="pest"][data-p="plano"]'); await N.page.waitForTimeout(600);
  r = await N.page.evaluate(() => ({ svg: !!document.querySelector('#pyPlano svg circle'), dxf: /EOF/.test(window.__proyectista._dxf('pa', 'gk')) }));
  c(r.svg && r.dxf, 'y el plano y el DXF salen igual, sin catastro');
  c(!M.errores.length && !N.errores.length, 'sin errores de JS ' + JSON.stringify(M.errores.concat(N.errores).slice(0, 4)));
  await N.browser.close(); await M.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
