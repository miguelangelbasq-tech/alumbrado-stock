// cuánto trabaja la página de la cuadrilla después de UNA escritura en su orden (datos grandes), y quién
process.env.CPU = process.env.CPU || '4';
const { abrir } = require('./h');
const { datos147 } = require('./datos147');
const { datosGrande } = require('./datosGrande');
(async () => {
  const d = datos147(), g = datosGrande();
  ['avanceObras', 'movimientos', 'reservas', 'historialCalculos', 'planSemanal', 'historialEtapas', 'catalogoProductos', 'gastosObra', 'planosObra', 'mapaPuntos'].forEach((c) => { d.db[c] = Object.assign({}, g.db[c] || {}, d.db[c] || {}); });
  Object.entries(g.db.ordenesTrabajo || {}).forEach(([k, o]) => { if (!d.db.ordenesTrabajo[k] && !(o.personalNombres || []).includes('juan perez')) d.db.ordenesTrabajo[k] = o; });
  const OP = { crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, obraGps: true, camaraB: true, porPartes: true, sugerida: true, https: true, mov: true, iaPro: true, ofPasos: true, supervisor: true, guias: true };
  for (let v = 145; v <= 187; v++) OP['v' + v] = true; if (process.env.SIN187) OP.v187 = false;
  const A = await abrir(Object.assign({ datos: d, sesion: 'juan', cel: true, espera: 9000, antes: () => { localStorage.setItem('ema.ultimoUid', 'uJuan'); localStorage.setItem('ema.perfil.uJuan', JSON.stringify({ rol: 'cuadrilla', activo: true, pendiente: false, persona: 'Juan Pérez', personaClave: 'juan perez' })); window.__stubPorColeccion = true; window.__LTP = []; try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__LTP.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ entryTypes: ['longtask'] }); } catch (e) { } } }, OP));
  const p = A.page, cdp = p.__cdp;
  await p.waitForTimeout(8000);
  const st = await p.evaluate(() => ({ liv: window.__modoDatos.liviano(), obras: avanceObras.length, ots: ordenesTrabajo.length, movs: (typeof movimientos != 'undefined' ? movimientos.length : -1), etapas: (typeof historialEtapas != 'undefined' ? historialEtapas.length : -1) }));
  console.log('estado', JSON.stringify(st));
  const medir = async (nombre, fn) => {
    await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp.send('Profiler.start');
    const t0 = await p.evaluate(() => performance.now());
    await p.evaluate(fn); await p.waitForTimeout(4000);
    const LT = (await p.evaluate(() => window.__LTP)).filter(([s]) => s >= t0);
    const { profile } = await cdp.send('Profiler.stop');
    const byId = new Map(profile.nodes.map((n) => [n.id, n])), par = new Map(); profile.nodes.forEach((n) => (n.children || []).forEach((c) => par.set(c, n.id)));
    const self = new Map(); let t = 0; profile.samples.forEach((id, i) => { const dt = (profile.timeDeltas[i] || 0) / 1000; const vis = new Set(); let x = id; while (x != null) { const n = byId.get(x); const nm = n.callFrame.functionName; if (/^render|^plazaYa|^pintar|renderOt/.test(nm) && !vis.has(nm)) { vis.add(nm); self.set(nm, (self.get(nm) || 0) + dt); } x = par.get(x); } });
    const inc = new Map(); profile.samples.forEach((id, i) => { const dt = (profile.timeDeltas[i] || 0) / 1000; const vis = new Set(); let x = id; while (x != null) { const n = byId.get(x); const cf = n.callFrame; if (cf.url && /index\.html/.test(cf.url)) { const k = (cf.functionName || '(anón)') + ':' + (cf.lineNumber + 1); if (!vis.has(k)) { vis.add(k); inc.set(k, (inc.get(k) || 0) + dt); } } x = par.get(x); } });
    if (process.env.TOP) console.log('  TOP', [...inc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => k + ' ' + Math.round(v)).join(' · '));
    console.log(nombre, '· tareas largas', LT.length, 'suma', LT.reduce((s, x) => s + x[1], 0), 'ms · la más larga', Math.max(0, ...LT.map((x) => x[1])), '· render*', [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' ' + Math.round(v)).join(' · '));
  };
  { const t0 = await p.evaluate(() => performance.now()); await p.waitForTimeout(20000); const LT = (await p.evaluate(() => window.__LTP)).filter(([s]) => s >= t0); console.log('quieto 20 s en «Hoy»: tareas largas', LT.length, 'suma', LT.reduce((s, x) => s + x[1], 0), 'ms · la más larga', Math.max(0, ...LT.map((x) => x[1]))); }
  await medir('una marca en su orden (fbOtCampo)', () => { window.fbOtCampo('ot1', { 'campo.prueba187': Date.now() }); });
  await medir('otra', () => { window.fbOtCampo('ot1', { 'campo.prueba187': Date.now() }); });
  await A.browser.close();
})();
