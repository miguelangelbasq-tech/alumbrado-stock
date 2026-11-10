// v136b · La nómina guardada como la guarda la app (configEquipo/personal.nomina, no «lista»): el asistente la ve
// (aviso a una persona), y el Inicio en la compu no muestra el título viejo «Plazas» y alinea las tarjetas con la portada.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const URL_IA = 'https://ema-ia.mdiaz-60f.workers.dev/ia';
(async () => {
  const c = prueba('v136b' + (cel ? ' cel' : ''));
  const d = baseDatos();
  d.db.configEquipo.personal = { nomina: [{ nombre: 'Facundo Moreno', rol: 'Capataz', activo: true }, { nombre: 'Juan Pérez', rol: 'Oficial', activo: true }] };
  const A = await abrir({ sesion: 'admin', datos: d, cel, espera: 3500, nav: true, inicio: true, supervisor: true, guias: true, iaPro: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  const cola = []; let n = 0;
  await p.route(URL_IA, async (r) => { const f = cola.shift(); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(f || { error: { tipo: 'x', mensaje: 'sin guion' } }) }); });
  const usa = (name, input) => ({ id: 'm' + (++n), type: 'message', role: 'assistant', content: [{ type: 'tool_use', id: 'tu' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 9, output_tokens: 4 }, ema: { costoUsd: 0 } });
  const fin = (text) => ({ id: 'm' + (++n), type: 'message', role: 'assistant', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 9, output_tokens: 4 }, ema: { costoUsd: 0 } });
  await p.waitForTimeout(1500);
  // Inicio en la compu
  if (!cel) {
    const r = await p.evaluate(() => { const v = document.getElementById('viewInicio'), b = getComputedStyle(v, '::before'); const h = document.querySelector('#iniEje .ie-hero').getBoundingClientRect(), k = (document.querySelector('#iniEje .ie-tarj') || document.querySelector('#iniEje .ie-col')).getBoundingClientRect(); return { antes: b.content, hx: Math.round(h.x), kx: Math.round(k.x), top: Math.round(h.y) }; });
    c((r.antes === 'none' || r.antes === 'normal') && r.hx === r.kx && r.top < 40, 'compu: sin «Plazas» arriba y tarjetas alineadas con la portada · ' + JSON.stringify(r));
  }
  await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(1500);
  for (let i = 0; i < 40 && !(await p.evaluate(() => !!window.__asistente && !!document.getElementById('iaTxt'))); i++) await p.waitForTimeout(250);
  cola.push(usa('proponer_aviso', { personas: ['Facundo'], texto: 'Actualizá la app.' }), fin('Confirmalo en la tarjeta.'));
  await p.fill('#iaTxt', 'avisale a facundo que actualice la app'); await p.click('#iaEnviar');
  await p.waitForTimeout(2500);
  const r2 = await p.evaluate(() => ({ tarjeta: (document.querySelector('#iaPanel .ia-conf:last-of-type') || {}).textContent || '', personal: window.__asistente && window.__asistente.herramientas ? JSON.stringify(window.__asistente.herramientas.personal({})).slice(0, 300) : '' }));
  c(/Facundo Moreno/.test(r2.tarjeta), 'el asistente arma el aviso para Facundo con la nómina real · ' + r2.tarjeta.replace(/\s+/g, ' ').slice(0, 120));
  c(/Facundo Moreno/.test(r2.personal), 'la herramienta «personal» ve la nómina real · ' + r2.personal.slice(0, 120));
  console.log(A.errores.join('\n'));
  await A.browser.close(); c.fin ? c.fin() : null;
})();
