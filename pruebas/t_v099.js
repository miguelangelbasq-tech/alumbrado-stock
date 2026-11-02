// Pruebas v099 · Proyectista: tocar / mover / borrar puntos en el mapa y en el plano, forma de los tramos (quiebres),
// dibujar el camino caminando, plano que se mueve y se acerca, ↶ Deshacer, el mapa no vuelve a encuadrar, largos por el camino.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const C = { lat: -31.4330339, lng: -64.19418 }, MLAT = 110861, MLNG = 95049;
const pto = (id, n, tipo, dx, dy) => ({ id, n, tipo, lat: C.lat + dy / MLAT, lng: C.lng + dx / MLNG, acc: 0.02, fuente: 'gps', ts: 1, nota: '' });
function datos() {
  const d = baseDatos();
  d.db.proyectos = { pa: { nombre: 'PLAZA PRUEBA · proyecto', obraId: '', obraNombre: '', puntos: [pto('t1', 'T1', 'tab', -20, -15), pto('c1', 'C1', 'colN', 0, 0), pto('c2', 'C2', 'colN', 20, 0), pto('c3', 'C3', 'colN', 40, 0)], creado: 1, ts: 1, por: 'admin', faja: 0, etapa: 1 } };
  return d;
}
(async () => {
  const c = prueba('v099' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true, https: true, leaflet: true }), p = A.page;
  const dlg = []; p.on('dialog', (d) => { dlg.push(d.message()); d.accept(); });
  // GPS de mentira (para caminar)
  await p.evaluate(() => { const cbs = []; window.__gpsPush = (lat, lng, acc) => cbs.forEach((cb) => cb({ coords: { latitude: lat, longitude: lng, accuracy: acc, altitude: null }, timestamp: Date.now() })); Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { watchPosition: (ok) => { cbs.push(ok); return 1; }, clearWatch: () => { }, getCurrentPosition: () => { } } }); });
  await p.evaluate(() => { try { localStorage.setItem('ema.py.cat', '0'); } catch (e) { } window.__abrirProyectista('pa'); });
  await p.waitForSelector('#pyMapa .py-pin', { timeout: 15000 });
  await p.waitForTimeout(600);
  const pts = () => p.evaluate(() => JSON.parse(JSON.stringify(window.__stubDB().proyectos.pa.puntos)));
  const enPantalla = (lat, lng) => p.evaluate(([la, lo]) => { const m = window.__proyectista._mapa(), mr = m.getContainer().getBoundingClientRect(); if (mr.top < 0 || mr.bottom > innerHeight) m.getContainer().scrollIntoView({ block: 'center' }); const q = m.latLngToContainerPoint([la, lo]), r = m.getContainer().getBoundingClientRect(); return [r.left + q.x, r.top + q.y]; }, [lat, lng]);
  const arrastrar = async (a, b) => { await p.mouse.move(a[0], a[1]); await p.mouse.down(); for (let i = 1; i <= 8; i++) await p.mouse.move(a[0] + (b[0] - a[0]) * i / 8, a[1] + (b[1] - a[1]) * i / 8); await p.mouse.up(); await p.waitForTimeout(500); };
  let ps = await pts();
  // ---- 1) tocar un punto en el mapa
  let q = await enPantalla(ps[1].lat, ps[1].lng);
  await p.mouse.click(q[0], q[1]); await p.waitForTimeout(400);
  let r = await p.evaluate(() => ({ sel: (document.querySelector('#pySel .py-sel') || {}).innerText || '', pin: !!document.querySelector('#pyMapa .py-pin.sel') }));
  c(r.pin && /C1/.test(r.sel) && /Columna nueva/.test(r.sel) && /Borrar/.test(r.sel) && /arrastralo/i.test(r.sel), 'tocando un punto en el mapa se marca y aparece su cuadro (tipo, nombre, nota, mover, borrar) · ' + r.sel.replace(/\s+/g, ' ').slice(0, 120));
  await p.screenshot({ path: __dirname + '/v099_punto' + (cel ? '_cel' : '') + '.png' });
  // ---- 2) arrastrarlo
  const z0 = await p.evaluate(() => window.__proyectista._mapa().getZoom());
  await arrastrar(q, [q[0] + 40, q[1] + 30]);
  ps = await pts();
  const dx = (ps[1].lng - C.lng) * MLNG, dy = (ps[1].lat - C.lat) * MLAT;
  c(Math.abs(dx) > 1 && dy < -0.5 && /movido/.test(ps[1].fuente) && ps[1].acc == null && ps[1].movido > 0, 'arrastrándolo en el mapa se mueve (' + dx.toFixed(1) + ' m E, ' + dy.toFixed(1) + ' m N) y queda «movido»');
  r = await p.evaluate(() => window.__proyectista._mapa().getZoom());
  c(r === z0, 'el mapa no vuelve a encuadrar todo después de mover (zoom ' + z0 + ' → ' + r + ')');
  // ---- 3) deshacer
  await p.click('#pySel [data-py="deshacer"]'); await p.waitForTimeout(500);
  ps = await pts();
  c(Math.abs(ps[1].lat - C.lat) < 1e-9 && Math.abs(ps[1].lng - C.lng) < 1e-9, '«↶ Deshacer» lo vuelve a donde estaba');
  // ---- 4) moverlo tocando el mapa / cambiar tipo / borrar
  q = await enPantalla(ps[1].lat, ps[1].lng);
  await p.mouse.click(q[0], q[1]); await p.waitForTimeout(300);
  await p.click('#pySel [data-py="selMover"]'); await p.waitForTimeout(200);
  const dest = await enPantalla(C.lat + 6 / MLAT, C.lng - 8 / MLNG);
  await p.mouse.click(dest[0], dest[1]); await p.waitForTimeout(500);
  ps = await pts();
  c(Math.abs((ps[1].lat - C.lat) * MLAT - 6) < 0.8 && Math.abs((ps[1].lng - C.lng) * MLNG + 8) < 0.8, '«🎯 Moverlo tocando el mapa»: va a donde se toca (6 m N, 8 m O)');
  q = await enPantalla(ps[2].lat, ps[2].lng); await p.mouse.click(q[0], q[1]); await p.waitForTimeout(300);
  await p.click('#pySel [data-py="selTipo"][data-k="tab"]'); await p.waitForTimeout(400);
  ps = await pts();
  c(ps[2].tipo === 'tab' && ps[2].n === 'T2', 'cambiarle el tipo desde el cuadro (columna → tablero, se llama T2)');
  await p.click('#pySel [data-py="deshacer"]'); await p.waitForTimeout(400);
  q = await enPantalla(ps[2].lat, ps[2].lng); await p.mouse.click(q[0], q[1]); await p.waitForTimeout(300);
  await p.fill('#pySel [data-pys="nota"]', 'frente a la escuela'); await p.press('#pySel [data-pys="nota"]', 'Tab'); await p.waitForTimeout(400);
  ps = await pts();
  c(ps[2].nota === 'frente a la escuela', 'escribirle una nota desde el cuadro');
  q = await enPantalla(ps[2].lat, ps[2].lng); await p.mouse.click(q[0], q[1]); await p.waitForTimeout(300);
  await p.click('#pySel [data-py="selBorrar"]'); await p.waitForTimeout(500);
  ps = await pts();
  c(ps.length === 3 && !ps.some((x) => x.id === 'c2') && dlg.some((x) => /Borrar el punto C2/.test(x)), 'borrarlo desde el mapa (pregunta antes): quedan 3');
  await p.click('#pySel [data-py="deshacer"]'); await p.waitForTimeout(400);
  ps = await pts(); c(ps.length === 4 && ps[2].id === 'c2', 'y «Deshacer» lo trae de vuelta');
  // ---- 5) forma del tramo C2 → C3
  const mid = await enPantalla(ps[3].lat, (ps[2].lng + ps[3].lng) / 2);
  await p.mouse.click(mid[0], mid[1] + 2); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ sel: ((document.querySelector('#pySel .py-sel') || {}).innerText || '').replace(/\s+/g, ' '), mas: document.querySelectorAll('#pyMapa .py-vmas').length }));
  c(/Tramo C2 → C3/.test(r.sel) && /recto/.test(r.sel) && r.mas === 1, 'tocando la línea se elige el tramo C2 → C3, con un «＋» para darle forma · ' + r.sel.slice(0, 80));
  let m = await p.evaluate(() => { const e = document.querySelector('#pyMapa .py-vmas').getBoundingClientRect(); return [e.left + e.width / 2, e.top + e.height / 2]; });
  const curva = await enPantalla(C.lat + 8 / MLAT, C.lng + 30 / MLNG);
  await arrastrar(m, curva);
  ps = await pts();
  r = await p.evaluate(() => { const ps = window.__stubDB().proyectos.pa.puntos; return { via: ps[3].via, sel: ((document.querySelector('#pySel .py-sel') || {}).innerText || '').replace(/\s+/g, ' '), q: document.querySelectorAll('#pyMapa .py-vq').length, mas: document.querySelectorAll('#pyMapa .py-vmas').length }; });
  const geo = (ps) => p.evaluate((ps) => { const D = window.__proyectista._geo.distancia, a = ps[2], b = ps[3], v = b.via[0]; return D(a.lat, a.lng, v.la, v.lo) + D(v.la, v.lo, b.lat, b.lng); }, ps);
  const largoEsp = await geo((await pts()));
  c(r.via && r.via.length === 1 && Math.abs((r.via[0].la - C.lat) * MLAT - 8) < 0.8 && r.q === 1 && r.mas === 2, 'arrastrando el «＋» se agrega un quiebre donde se suelta (8 m al norte): 1 cuadradito y 2 «＋»');
  const cota = await p.evaluate(() => [...document.querySelectorAll('#pyMapa .py-cota')].map((x) => x.textContent));
  c(r.sel.indexOf(largoEsp.toFixed(2).replace('.', ',') + ' m por el camino') >= 0 && cota.some((x) => x === largoEsp.toFixed(2).replace('.', ',') + ' m') && /recto 20,00 m/.test(r.sel), 'el largo va por el camino: ' + largoEsp.toFixed(2) + ' m (recto 20,00) en el cuadro y en la cota · ' + r.sel.slice(0, 90));
  // mover el quiebre
  m = await p.evaluate(() => { const e = document.querySelector('#pyMapa .py-vq').getBoundingClientRect(); return [e.left + e.width / 2, e.top + e.height / 2]; });
  const otro = await enPantalla(C.lat - 6 / MLAT, C.lng + 30 / MLNG);
  await arrastrar(m, otro);
  ps = await pts();
  c(ps[3].via.length === 1 && Math.abs((ps[3].via[0].la - C.lat) * MLAT + 6) < 0.8, 'arrastrando el cuadradito se mueve el quiebre (6 m al sur)');
  // DXF, planilla y cálculo eléctrico por el camino
  r = await p.evaluate(() => { const P = window.__proyectista; const dx = P._dxf('pa', 'gk'), csv = P._csv('pa'), rr = P._calc.red('pa'); return { poly: /POLYLINE\r\n8\r\nTRAMOS/.test(dx), csv: csv.split('\r\n')[4], m: rr.cols.c3 && rr.cols.c3.metros }; });
  const l2 = await geo(ps);
  c(r.poly && r.csv.indexOf(l2.toFixed(3).replace('.', ',')) >= 0, 'DXF: el tramo con quiebre va como polilínea; planilla: ' + l2.toFixed(3) + ' m por el camino');
  c(r.m > l2 * 1.05 - 0.01 && r.m < l2 * 1.05 + 8, 'el cable del cálculo eléctrico usa el largo por el camino (' + (r.m || 0).toFixed(2) + ' m con reserva y subidas)');
  await p.click('#pySel [data-py="selRecto"]'); await p.waitForTimeout(400);
  ps = await pts(); c(!ps[3].via || !ps[3].via.length, '«↺ Dejarlo recto» saca los quiebres');
  // ---- 6) dibujar el camino caminando: un cuarto de círculo de 20 m de radio de C3 a un punto nuevo
  await p.click('[data-py="selCerrar"]').catch(() => { });
  await p.click('[data-py="reco"]'); await p.waitForTimeout(300);
  const c3 = ps[3], R0 = 20;
  for (let k = 0; k <= 30; k++) { const a = Math.PI / 2 * k / 30; await p.evaluate(([la, lo]) => window.__gpsPush(la, lo, 1.5), [c3.lat + (R0 * Math.sin(a)) / MLAT, c3.lng + (R0 - R0 * Math.cos(a)) / MLNG]); }
  await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ g: (document.getElementById('pyGps') || {}).innerText || '', l: document.querySelectorAll('#pyMapa path[stroke-dasharray="6 6"]').length }));
  c(/por donde caminaste/.test(r.g) && r.l >= 1, 'mientras camina se ve el recorrido en el mapa y la distancia «por donde caminaste» · ' + r.g.replace(/\s+/g, ' ').slice(0, 90));
  await p.click('[data-py="marcar"]'); await p.waitForTimeout(600);
  ps = await pts();
  r = await p.evaluate(() => { const ps = window.__stubDB().proyectos.pa.puntos, n = ps[ps.length - 1]; return { via: (n.via || []).length, csv: window.__proyectista._csv('pa').split('\r\n')[5] }; });
  const arco = Math.PI * R0 / 2;
  const dcsv = parseFloat((r.csv.split(';')[9] || '0').replace(',', '.'));
  c(ps.length === 5 && r.via >= 3 && Math.abs(dcsv - arco) < 0.6, 'al marcar el punto, el tramo sigue la curva caminada: ' + r.via + ' quiebres, ' + dcsv.toFixed(2) + ' m (el arco da ' + arco.toFixed(2) + ', recto daría ' + (R0 * Math.SQRT2).toFixed(2) + ')');
  await p.click('[data-py="reco"]'); await p.waitForTimeout(200);
  // ---- 7) plano: mover, acercar, tocar y arrastrar
  await p.click('[data-py="pest"][data-p="plano"]'); await p.waitForTimeout(500);
  const pm = () => p.evaluate(() => { const s = window.__proyectista._st; return { pv: s.pv, k: s.pm && s.pm.k }; });
  let a0 = await pm();
  await p.click('#pyPlano [data-py="pz"][data-z="1.6"]'); await p.waitForTimeout(300);
  let a1 = await pm();
  c(a1.pv && Math.abs(a1.k / a0.k - 1.6) < 0.01, 'el plano se acerca con «＋» (por 1,6)');
  const box = await p.evaluate(() => { document.querySelector('#pyPlano').scrollIntoView({ block: 'center' }); const r = document.querySelector('#pyPlano svg').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  const cen = [box[0] + box[2] * 0.3, box[1] + box[3] * 0.85];
  await arrastrar(cen, [cen[0] + 60, cen[1] - 40]);
  let a2 = await pm();
  const movPx = Math.hypot((a2.pv.xa - a1.pv.xa) * a2.k, (a2.pv.ya - a1.pv.ya) * a2.k) * box[2] / 900;
  c(Math.abs(movPx - Math.hypot(60, 40)) < 6, 'arrastrando se mueve el plano (' + movPx.toFixed(0) + ' px)');
  await p.mouse.move(box[0] + box[2] / 2, box[1] + box[3] / 2); await p.mouse.wheel(0, -200); await p.waitForTimeout(400);
  let a3 = await pm();
  c(a3.k > a2.k * 1.2, 'con la rueda del mouse se acerca');
  // dos dedos: separar al doble
  await p.evaluate(() => { const el = document.getElementById('pyPlano'), s = el.querySelector('svg'), r = s.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const ev = (t, id, x, y) => s.dispatchEvent(new PointerEvent(t, { pointerId: id, clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: id === 1 }));
    ev('pointerdown', 1, cx - 20, cy); ev('pointerdown', 2, cx + 20, cy);
    for (let i = 1; i <= 5; i++) { ev('pointermove', 1, cx - 20 - 4 * i, cy); ev('pointermove', 2, cx + 20 + 4 * i, cy); }
    ev('pointerup', 1, cx - 40, cy); ev('pointerup', 2, cx + 40, cy); });
  await p.waitForTimeout(400);
  const a4 = await pm();
  c(Math.abs(a4.k / a3.k - 2) < 0.05, 'con dos dedos (pellizco) se acerca: ' + (a4.k / a3.k).toFixed(2) + ' veces');
  await p.click('#pyPlano [data-py="pzFit"]'); await p.waitForTimeout(300);
  a3 = await pm(); c(!a3.pv && Math.abs(a3.k - a0.k) < 1e-6, '«⤢» vuelve a ver todo');
  // tocar C1 en el plano y arrastrarlo
  const enPlano = (id) => p.evaluate((id) => { const e = document.querySelector('#pyPlano [data-pyp="' + id + '"]').getBoundingClientRect(); return [e.left + e.width / 2, e.top + e.height / 2]; }, id);
  let pc = await enPlano('c1');
  await p.mouse.click(pc[0], pc[1]); await p.waitForTimeout(300);
  r = await p.evaluate(() => ((document.querySelector('#pySel .py-sel') || {}).innerText || '').replace(/\s+/g, ' '));
  c(/C1/.test(r) && /arrastralo en el plano/.test(r), 'en el plano también se toca un punto y aparece su cuadro');
  const k1 = (await pm()).k, sc = box[2] / 900, antes = (await pts())[1];
  await arrastrar(pc, [pc[0] + 5 * k1 * sc, pc[1]]);
  ps = await pts();
  const mx = (ps[1].lng - antes.lng) * MLNG;
  c(Math.abs(mx - 5) < 0.7 && /plano/.test(ps[1].fuente), 'arrastrándolo en el plano se mueve (' + mx.toFixed(2) + ' m al este, se pidió 5)');
  if (cel) { const w = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); c(w[0] <= w[1] + 1, 'celular: sin scroll de costado ' + w); }
  await p.screenshot({ path: __dirname + '/v099_plano' + (cel ? '_cel' : '') + '.png' });
  c(!A.errores.length, 'sin errores de JS ' + JSON.stringify(A.errores.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
