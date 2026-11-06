// Pruebas v121 · Mapa: el buscador encuentra personas; «Personal en vivo» abajo de las plazas y el aviso de cortes a lo ancho.
// (La hora de inicio y fin de cada tarea de la cuadrilla se prueba en t_circuito.)
const { abrir, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v121' + (cel ? ' cel' : ''));
  const d = baseDatos(), ahora = Date.now();
  const u = (id, nombre, lat) => ({ uid: id, email: id + '@' + DOM, persona: nombre, clave: nombre.toLowerCase(), lat, lng: -64.18, acc: 3, ts: ahora - 30000, posTs: ahora - 30000, fuente: 'app', activo: true, cortesHoy: 1, ultCorteDesde: ahora - Math.min(3 * 3600e3, (ahora - new Date(new Date().toDateString()).getTime()) / 3), ultCorteHasta: ahora - Math.min(2 * 3600e3, (ahora - new Date(new Date().toDateString()).getTime()) / 4), ultCorteTipo: 'app cerrada' });
  d.db.ubicacionVivo = { a1: u('a1', 'AXEL ESCUDERO', -31.41), a2: u('a2', 'Bruno Federico Cherino', -31.43) };
  d.db.configEquipo.ubicacion = { activo: true, desde: '00:00', hasta: '23:59', dias: [0, 1, 2, 3, 4, 5, 6], cadaSeg: 60 };
  const A = await abrir({ sesion: 'admin', cel, dpr: cel ? 2 : 1, datos: d, espera: 3500, leaflet: true }), p = A.page;
  await p.evaluate(() => mostrarVista('mapa')); await p.waitForTimeout(3500);
  let r = await p.evaluate(() => { const pn = document.getElementById('uvPanel'), l = document.getElementById('mapaListaPlazas'); if (!pn || !l) return { pn: !!pn, l: !!l }; const pq = pn.querySelector('.uv-porque'); return { pn: true, despues: !!(l.compareDocumentPosition(pn) & Node.DOCUMENT_POSITION_FOLLOWING), ancho: pq ? Math.round(pq.getBoundingClientRect().width) : 0, fila: Math.round(pn.querySelector('.uv-fila').getBoundingClientRect().width) }; });
  c(r.pn && r.despues, '«Personal en vivo» queda abajo de la lista de plazas · ' + JSON.stringify(r));
  c(r.ancho > r.fila * 0.6, 'el aviso «⚠ hoy se le cortó…» va a lo ancho (no una palabra por renglón) · ' + r.ancho + ' de ' + r.fila + ' px');
  await p.fill('#mapaBuscar', 'axe'); await p.waitForTimeout(700);
  r = await p.evaluate(() => ({ res: [...document.querySelectorAll('#mpPersonas [data-mpp]')].map((b) => b.textContent), vis: [...document.querySelectorAll('#uvPanel [data-uvid]')].filter((b) => b.style.display !== 'none').length, ph: document.getElementById('mapaBuscar').placeholder }));
  c(r.res.length === 1 && /AXEL ESCUDERO/.test(r.res[0]) && r.vis === 1 && /persona/.test(r.ph), 'el buscador del Mapa encuentra personas («axe» → AXEL ESCUDERO) · ' + JSON.stringify(r));
  await p.click('#mpPersonas [data-mpp]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => { try { const c = mapaLeaflet.getCenter(); return { lat: Math.round(c.lat * 100) / 100, z: mapaLeaflet.getZoom() }; } catch (e) { return { err: e.message }; } });
  c(r.lat === -31.41 && r.z >= 16, 'tocando la persona, el mapa va a donde está · ' + JSON.stringify(r));
  if (!cel) await p.screenshot({ path: __dirname + '/v121_mapa.png' });
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
