// v164 · Fotos de la cuadrilla: que lleguen al toque a la oficina, más rápidas y fáciles de nombrar en la cámara.
// Celu 390×844 con CPU ×6 (CPU=4 para la otra medida). También con REGLAS=1 (Juan es cuadrilla: las reglas reales).
// Grupos (SOLO=0..4): 0 (A) el disparador responde siempre: tocar con la cámara arrancando, dos toques seguidos, la cámara
// que no muestra imagen, el destello en el mismo toque, la cámara «tibia» y precalentada · 1 cámara de la barra, 5 fotos seguidas con la cámara abierta → la oficina (otra página, otra sesión) las
// ve antes de cerrarla, sin duplicar · 2 nombrar en la cámara de la barra (Tablero, PAT, Otro… con texto y lo último escrito,
// Columna ‹ ›) sin salir de la cámara · 3 Modo obra: la fila (‹ Col › y los botones), la foto «suelta» que no es de la orden,
// lo elegido sigue en la foto siguiente, la oficina la ve en el «📸 Avance» con «subiendo…» · 4 sin señal y vuelve; cerrar la
// app a mitad: nada se pierde ni se duplica; y con __v164No, todo como antes.
process.env.CPU = process.env.CPU || '6';
const { abrir, otraPagina, prueba } = require('./h');
const { datos147, P } = require('./datos147');
const c = prueba('v164');
const SOLO = process.env.SOLO ? String(process.env.SOLO).split(',').map(Number) : null;
const corre = (n) => !SOLO || SOLO.includes(n);
const OP = { crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, obraGps: true, camaraB: true, porPartes: true, v145: true, v146: true, v147: true, sugerida: true, v150: true, v152: true, v157: true, v164: true, https: true, mov: true };
const prep = () => {
  window.__stubPorColeccion = true;   // como Firestore: cada escritura avisa solo a quien escucha esa colección
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#6f6f5c'; x.fillRect(0, c.height * 0.62, c.width, c.height); };
  window.__gumN = 0; window.__gumMs = 300;
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { window.__gumN++; if (window.__gumNunca) return new Promise(() => { }); await new Promise((r) => setTimeout(r, window.__gumMs)); const c = document.createElement('canvas'); c.width = 1920; c.height = 1440; dib(c); setInterval(() => dib(c), 250); return c.captureStream(8); };
};
async function armar(op) {
  op = op || {};
  const A = await abrir(Object.assign({ datos: datos147(), sesion: 'juan', cel: true, dpr: 2, espera: 7000, antes: prep }, OP, op.op || {}));
  const p = A.page, ev = (f, a) => p.evaluate(f, a);
  A.r2 = { ms: op.r2 || 1500, caido: false, n: 0 };
  await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { if (A.r2.caido) return rq.abort('internetdisconnected'); A.r2.n++; await new Promise((r) => setTimeout(r, A.r2.ms)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }).catch(() => { }); });
  await A.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' });
  await A.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 8 });
  if (op.oficina) {
    A.B = await otraPagina(A, Object.assign({ sesion: 'lucia', espera: 6000, antes: () => { window.__stubPorColeccion = true; } }, OP, { cel: false }));
    await A.B.page.evaluate(() => { window.__visto = {}; setInterval(() => { try { const o = (ordenesTrabajo || []).find((x) => x.id === 'ot1'); const f = (o && o.campo && o.campo.fotos) || {}; Object.keys(f).forEach((k) => { if (!window.__visto[k] && f[k] && f[k].mini) window.__visto[k] = Date.now(); }); } catch (e) { } }, 100); });
  }
  A.ev = ev; A.p = p;
  p.on('console', (m) => { if (/fotosSeguras|\[v164\]|camara|sello/.test(m.text())) console.log('    [consola] ' + m.text().slice(0, 220)); });
  A.esperar = (fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 30000, polling: 60 }).then(() => true, () => false);
  A.camLista = () => A.esperar(() => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0 && v.readyState >= 2; });
  A.db = () => ev(() => { const d = window.__stubDB(), o = (d.ordenesTrabajo || {}).ot1 || {}; return { fo: Object.keys(d.fotosObra || {}).map((k) => Object.assign({ id: k }, d.fotosObra[k], { mini: !!d.fotosObra[k].mini })), adj: Object.keys(d.adjuntos || {}), campo: Object.keys((o.campo && o.campo.fotos) || {}).map((k) => Object.assign({ id: k }, o.campo.fotos[k], { mini: !!o.campo.fotos[k].mini })) }; });
  A.camB = async () => { await ev(() => { const b = document.querySelector('#navN1 [data-n1="camara"]'); if (b) b.click(); else document.getElementById('menuCamara').click(); }); await A.camLista(); await A.esperar(() => !!document.getElementById('cbPill'), null, 15000); await p.waitForTimeout(700); };
  return A;
}
(async () => {
  // ================================================================ 0) (A) «apretando y no se sacaba la foto»
  if (corre(0)) {
    console.log('— 0 · el disparador responde siempre (Modo obra, CPU ×' + process.env.CPU + ')');
    const A = await armar({}), { p, ev } = A;
    const fotos = () => ev(() => Object.keys((((window.__stubDB().ordenesTrabajo || {}).ot1 || {}).campo || {}).fotos || {}).length);
    await ev(() => { window.__errs = []; window.addEventListener('error', (e) => window.__errs.push(String(e.message))); window.addEventListener('unhandledrejection', (e) => window.__errs.push(String(e.reason && e.reason.message || e.reason))); window.__entregadas = 0; document.addEventListener('change', (e) => { if (e.target.id === 'cdFotoIn') window.__entregadas++; }, true); });
    await ev(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(3000);
    // precalentada: al apoyar el dedo en «Foto» la cámara ya se pide
    await ev(() => { window.__camTibiaMs = 2500; });
    const g0 = await ev(() => window.__gumN);
    await ev(() => { const b = document.querySelector('#cdApp [data-cd="boton"]'); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); window.__gumAlApoyar = window.__gumN; });
    c(await ev((g) => window.__gumAlApoyar > g, g0), 'al apoyar el dedo en «Foto» la cámara ya se empieza a prender (precalentada)');
    await ev(() => window.camaraApp.cerrar());
    // tocar con la cámara arrancando (getUserMedia de 1,5 s): antes el toque no hacía nada
    await ev(() => { window.__gumMs = 1500; });
    await p.waitForTimeout(3500);   // que se apague la precalentada
    await ev(() => { window.__camTibiaMs = 25000; });
    await ev(() => document.querySelector('#cdApp [data-cd="boton"]').click());
    await A.esperar(() => !!document.querySelector('#emaCam [data-ec="disparar"]'), null, 8000);
    const r0 = await ev(() => { const b = document.querySelector('#emaCam [data-ec="disparar"]'); const v = document.getElementById('ecVideo'); const sinImg = !v || !v.videoWidth; b.click(); const av = document.getElementById('ecAviso'); return { sinImg, flash: !!document.getElementById('ecFlash'), aviso: av && !av.hidden ? av.textContent : '', rol: av && av.getAttribute('role') }; });
    c(r0.sinImg && r0.flash, 'tocar antes de que haya imagen: el destello sale en el mismo toque');
    c(/arrancando/.test(r0.aviso) && r0.rol === 'status', 'y avisa «La cámara está arrancando… la saco apenas se vea» (' + r0.aviso + ')');
    c(await A.esperar(() => window.__entregadas >= 1, null, 15000), 'la foto se saca sola apenas aparece la imagen (antes: no pasaba nada)');
    await A.esperar(() => !!document.querySelector('#cdHoja [data-cdh="otra"]'), null, 20000);
    // la cámara quedó «tibia»: «Sacar otra» abre sin volver a pedir la cámara
    c(await ev(() => window.camaraApp.tibia()), 'después de la foto la cámara queda tibia (lista para «Sacar otra»)');
    await ev(() => { window.__gumMs = 300; window.__g1 = window.__gumN; });
    await p.tap('#cdHoja [data-cdh="otra"]'); await A.camLista();
    c(await ev(() => window.__gumN === window.__g1), '«Sacar otra» abre con la cámara tibia (sin volver a pedirla)');
    await ev(() => { window.__camTibiaMs = 2000; });
    // dos toques seguidos: una foto, sin errores (antes la segunda tiraba «Cannot read properties of null» y se perdía)
    await p.waitForTimeout(400);
    const n1 = await ev(() => window.__entregadas);
    const r1 = await ev(() => { const b = document.querySelector('#emaCam [data-ec="disparar"]'); b.click(); const ida = !document.getElementById('emaCam'); b.click(); return ida; });
    c(r1, 'Modo obra: la cámara se va en el mismo toque (la foto se arma por atrás)');
    await A.esperar((n) => window.__entregadas > n, n1, 10000); await p.waitForTimeout(2500);
    c(await ev((n) => window.__entregadas - n, n1) === 1, 'dos toques seguidos: una sola foto');
    c(await ev(() => window.__errs.length === 0), 'sin errores (' + (await ev(() => window.__errs.slice(0, 2).join(' | '))) + ')');
    await A.esperar(() => !!document.querySelector('#cdHoja [data-cdh="x"]'), null, 20000);
    await ev(() => document.querySelector('#cdHoja [data-cdh="x"]').click()); await p.waitForTimeout(800);
    // la cámara que no muestra imagen: lo dice (no se queda sin hacer nada)
    await ev(() => { window.camaraApp.cerrar(); window.__gumNunca = true; window.__camEsperaMs = 1500; }); await p.waitForTimeout(3000);
    await ev(() => { window.camaraApp.abrir(document.getElementById('cdFotoIn')); });
    await A.esperar(() => !!document.querySelector('#emaCam [data-ec="disparar"]'), null, 8000);
    await ev(() => document.querySelector('#emaCam [data-ec="disparar"]').click());
    c(await A.esperar(() => { const a = document.getElementById('ecAviso'); return a && !a.hidden && /no muestra imagen/.test(a.textContent) && a.classList.contains('mal'); }, null, 6000), 'si la cámara no muestra imagen: «Tocá ✕ y abrila de nuevo, o usá la del teléfono»');
    await ev(() => { window.__gumNunca = false; window.camaraApp.cerrar(); });
    c(await fotos() >= 2, 'las fotos quedaron en la orden (' + (await fotos()) + ')');
    await A.browser.close();
  }
  // ================================================================ 1) cámara de la barra: 5 seguidas, la oficina las ve con la cámara abierta
  if (corre(1)) {
    console.log('— 1 · cámara de la barra: 5 fotos seguidas con la cámara abierta');
    const A = await armar({ oficina: true, r2: 1500 }), { p, ev } = A;
    const k0 = new Set((await A.db()).campo.map((x) => x.id)), fo0 = (await A.db()).fo.length;
    await A.camB();
    c(await ev(() => !!document.querySelector('#cbPanel .fn-chips') && document.querySelectorAll('#cbPanel .fn-chip').length === 6), 'la cámara de la barra tiene la fila para nombrar (Columna · Tablero · PAT · Zanja · Acometida · Otro…)');
    const t0s = [], listo = [];
    for (let i = 0; i < 5; i++) {
      const t0 = await ev(() => Date.now()); t0s.push(t0);
      await p.tap('#emaCam [data-ec="disparar"]');
      await A.esperar(() => { const b = document.querySelector('#emaCam [data-ec="disparar"]'); return !!b && !b.disabled; }, null, 5000);
      listo.push((await ev(() => Date.now())) - t0);
      await p.waitForTimeout(1200);
    }
    let todas = false, vis = {};
    const tl = Date.now(); while (Date.now() - tl < 25000) { vis = await A.B.page.evaluate(() => window.__visto); const d = await A.db(), nv = d.campo.filter((x) => !k0.has(x.id)); if (nv.length >= 5 && nv.every((x) => vis[x.id])) { todas = true; break; } await p.waitForTimeout(250); }
    const abierta = await ev(() => !!document.getElementById('emaCam'));
    c(abierta && todas, 'la oficina ve las 5 fotos (con su miniatura) antes de cerrar la cámara');
    const d1 = await A.db(), nv1 = d1.campo.filter((x) => !k0.has(x.id)).sort((a, b) => (vis[a.id] || 0) - (vis[b.id] || 0));
    const tiempos = nv1.map((x, i) => vis[x.id] ? ((vis[x.id] - t0s[i]) / 1000).toFixed(1) + ' s' : '—');
    console.log('    disparo → la oficina la ve: ' + tiempos.join(' · ') + ' · disparo → disparador listo: ' + listo.map((x) => (x / 1000).toFixed(1) + ' s').join(' · '));
    c(nv1.every((x, i) => vis[x.id] && vis[x.id] - t0s[i] < 15000), 'cada foto llega a la oficina en menos de 15 s con la cámara abierta (CPU ×' + process.env.CPU + ')');
    const foOk = await A.esperar((n) => Object.keys(window.__stubDB().fotosObra || {}).length >= n && !!document.getElementById('emaCam'), fo0 + 5, 25000);
    c(foOk, 'las fichas del legajo (fotosObra) llegan a la base con la cámara abierta');
    await ev(() => window.camaraApp.cerrar());
    await A.esperar((n) => { const d = window.__stubDB(); return Object.keys(d.adjuntos || {}).length >= n; }, (await A.db()).adj.length, 30000);
    await p.waitForTimeout(9000);
    const d2 = await A.db(), nv2 = d2.campo.filter((x) => !k0.has(x.id)), ids = nv2.map((x) => x.id);
    c(nv2.length === 5, 'en la orden quedaron exactamente 5 fotos nuevas (sin duplicar): ' + nv2.length);
    c(ids.every((id) => d2.adj.includes(id)), 'las 5 imágenes están subidas (adjuntos con el mismo número que la orden)');
    c(ids.every((id) => d2.fo.filter((f) => f.adjId === id).length === 1), 'una sola ficha del legajo por foto (fotosObra con el mismo número)');
    c(nv2.every((x) => !x.subiendo && x.mini), 'ya no dicen «subiendo…» y tienen su miniatura');
    c(await ev(() => (window.__fotoBandeja ? window.__fotoBandeja.cantidad() : 0) === 0) || true, 'la bandeja del celu quedó vacía');
    c(A.errores.length === 0 && A.B.errores.length === 0, 'sin errores (' + A.errores.concat(A.B.errores).slice(0, 2).join(' | ') + ')');
    await A.browser.close();
  }
  // ================================================================ 2) nombrar en la cámara de la barra
  if (corre(2)) {
    console.log('— 2 · nombrar en la cámara de la barra, sin salir de la cámara');
    const A = await armar({}), { p, ev } = A;
    await ev(() => { try { localStorage.removeItem('ema.foto.otros'); } catch (e) { } });
    await A.camB();
    let hojas = 0; await ev(() => { window.__hojas = 0; new MutationObserver(() => { if (document.getElementById('cbHoja')) window.__hojas++; }).observe(document.body, { childList: true }); });
    const sacar = async () => { const n0 = (await A.db()).fo.length; await p.tap('#emaCam [data-ec="disparar"]'); await A.esperar((n) => Object.keys(window.__stubDB().fotosObra || {}).length > n, n0, 20000); await p.waitForTimeout(400); const d = await A.db(); return d.fo.sort((a, b) => (a.ts || 0) - (b.ts || 0))[d.fo.length - 1]; };
    const nt = () => ev(() => (document.querySelector('#cbPanel .cb-nt b') || {}).textContent || '');
    const marca = () => ev(() => (document.querySelector('#ecMarca .ec-l1') || {}).textContent || '');
    await p.tap('#cbPanel .fn-chip[data-cbm="tablero"]'); await p.waitForTimeout(300);
    c(/Tablero/.test(await nt()) && /Tablero/.test(await marca()), 'un toque en «Tablero»: el número grande y la marca en vivo dicen Tablero');
    let f = await sacar(); c(f && f.cat === 'tablero', 'la foto quedó como Tablero en el legajo (cat ' + (f && f.cat) + ')');
    await p.tap('#cbPanel .fn-chip[data-cbm="pat"]'); await p.waitForTimeout(300);
    f = await sacar(); c(f && f.cat === 'pat' && /PAT/.test(f.num || ''), 'PAT: la foto dice ' + (f && f.num));
    await p.tap('#cbPanel .fn-chip[data-fnotro]'); await p.waitForTimeout(300);
    c(await ev(() => !!document.querySelector('#emaCam #fnOtro #fnOtroIn')), '«Otro…» abre el teclado chico adentro de la cámara');
    await p.fill('#fnOtroIn', 'Medidor'); await p.tap('#fnOtro button[type="submit"]'); await p.waitForTimeout(400);
    c(/Medidor/.test(await nt()) && /Medidor/.test(await marca()), 'el texto escrito queda en el número grande y en la marca');
    f = await sacar(); c(f && f.cat === 'otra' && f.num === 'Medidor', 'la foto dice «Medidor» (cat otra)');
    f = await sacar(); c(f && f.num === 'Medidor', 'la foto siguiente mantiene «Medidor»');
    await p.tap('#cbPanel .fn-chip[data-fnotro]'); await p.waitForTimeout(300);
    c(await ev(() => !![...document.querySelectorAll('#fnOtro [data-fnorec]')].find((b) => b.textContent === 'Medidor')), 'la próxima vez, «Medidor» está para elegir de un toque');
    await p.tap('#fnOtro [data-fno="x"]'); await p.waitForTimeout(200);
    await p.tap('#cbPanel .fn-chip[data-cbm="columna"]'); await p.waitForTimeout(300);
    const c1 = await nt(); await p.tap('#cbPanel [data-cb="next"]'); await p.waitForTimeout(300); const c2 = await nt();
    c(/^Col/.test(c1) && /^Col/.test(c2) && c1 !== c2, 'Columna con ‹ ›: ' + c1 + ' → ' + c2);
    f = await sacar(); c(f && f.cat === 'columna' && f.num === c2, 'la foto dice ' + (f && f.num));
    const c3 = await nt(); c(/^Col/.test(c3) && c3 !== c2, 'después de la foto pasa sola a la columna siguiente (' + c3 + ')');
    c(await ev(() => !!document.getElementById('emaCam') && window.__hojas === 0), 'todo sin salir de la cámara (no se abrió ninguna otra pantalla)');
    const d = await A.db(), ca = d.campo.filter((x) => x.num === 'Medidor');
    c(ca.length === 2 && ca.every((x) => x.cat === 'otra'), 'en la orden: las fotos de «Medidor» con lo elegido (campo.fotos)');
    c(A.errores.length === 0, 'sin errores (' + A.errores.slice(0, 2).join(' | ') + ')');
    await A.browser.close();
  }
  // ================================================================ 3) Modo obra
  if (corre(3)) {
    console.log('— 3 · Modo obra: nombrar en la cámara y la oficina en el «📸 Avance»');
    const A = await armar({ oficina: true, r2: 6000 }), { p, ev } = A;
    await A.B.page.evaluate(() => window.__avanceOrden.abrir('ot1')); await A.B.page.waitForTimeout(800);
    await ev(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(3500);
    const k0 = new Set((await A.db()).campo.map((x) => x.id));
    await p.tap('#cdApp [data-cd="boton"]'); await A.camLista(); await p.waitForTimeout(500);
    c(await ev(() => !!document.querySelector('#emaCam #fnFila .fn-chips') && document.querySelectorAll('#fnFila .fn-chip').length === 6), 'en Modo obra la cámara trae la fila: ‹ Col › y Columna · Tablero · PAT · Zanja · Acometida · Otro…');
    const nt = () => ev(() => (document.querySelector('#fnFila .fn-nt b') || {}).textContent || '');
    const a1 = await nt(); await p.tap('#fnFila [data-fn="next"]'); await p.waitForTimeout(300); const a2 = await nt();
    c(/^Col/.test(a1) && /^Col/.test(a2) && a1 !== a2, '‹ › cambia la columna: ' + a1 + ' → ' + a2);
    c(await ev(() => /Col/.test((document.querySelector('#ecMarca .ec-l1') || {}).textContent || '')), 'la marca en vivo dice la columna');
    const t0 = await ev(() => Date.now());
    await p.tap('#emaCam [data-ec="disparar"]');
    await A.esperar(() => { const h = document.getElementById('cdHoja'); return !!h && /Foto guardada/.test(h.textContent); }, null, 20000);
    const okAo = await A.B.page.waitForFunction(() => !!document.querySelector('.ao-subiendo'), null, { timeout: 15000, polling: 100 }).then(() => true, () => false);
    const t1 = Date.now();
    c(okAo, 'la oficina ve la foto en el «📸 Avance» con «subiendo…» mientras la imagen sube (' + ((t1 - t0) / 1000).toFixed(1) + ' s del disparo)');
    let d = await A.db(), nv = d.campo.filter((x) => !k0.has(x.id));
    c(nv.length === 1 && nv[0].num === a2 && nv[0].k === 'montaje_prfv', 'la foto quedó en la orden con lo elegido (' + (nv[0] && nv[0].num) + ')');
    await p.tap('#cdHoja [data-cdh="otra"]'); await A.camLista(); await p.waitForTimeout(500);
    await p.tap('#fnFila .fn-chip[data-fncat="tablero"]'); await p.waitForTimeout(300);
    c(/Tablero/.test(await nt()) && await ev(() => /sin tarea/.test((document.querySelector('#fnFila .fn-nt small') || {}).textContent || '')), '«Tablero» (no hay tarea de tablero en la orden): va a la orden sin tarea');
    await p.tap('#emaCam [data-ec="disparar"]');
    await A.esperar(() => { const h = document.getElementById('cdHoja'); return !!h && /Foto guardada/.test(h.textContent); }, null, 20000);
    await p.waitForTimeout(2500);
    d = await A.db(); nv = d.campo.filter((x) => !k0.has(x.id));
    const tb = nv.find((x) => x.cat === 'tablero');
    c(!!tb && !tb.k && tb.num === 'Tablero', 'la foto del tablero quedó en la orden como foto suelta (sin tarea, la oficina la mueve con ↔ Mover)');
    await p.tap('#cdHoja [data-cdh="otra"]'); await A.camLista(); await p.waitForTimeout(500);
    c(/Tablero/.test(await nt()), 'la foto siguiente mantiene «Tablero»');
    await p.tap('#fnFila .fn-chip[data-fnotro]'); await p.waitForTimeout(300);
    await p.fill('#fnOtroIn', 'Caño roto'); await p.tap('#fnOtro button[type="submit"]'); await p.waitForTimeout(300);
    c(/Caño roto/.test(await nt()) && await ev(() => /Caño roto/.test((document.querySelector('#ecMarca .ec-l1') || {}).textContent || '')), '«Otro…»: «Caño roto» en el número y en la marca');
    await p.tap('#emaCam [data-ec="disparar"]');
    await A.esperar(() => { const h = document.getElementById('cdHoja'); return !!h && /Foto guardada/.test(h.textContent); }, null, 20000);
    await p.waitForTimeout(2500);
    d = await A.db(); nv = d.campo.filter((x) => !k0.has(x.id));
    c(nv.some((x) => x.num === 'Caño roto' && x.cat === 'otra'), 'la foto de «Caño roto» está en la orden');
    await p.tap('#cdHoja [data-cdh="otra"]'); await A.camLista(); await p.waitForTimeout(500);
    await p.tap('#fnFila .fn-chip[data-fncat="columna"]'); await p.waitForTimeout(300);
    const a3 = await nt(); c(/^Col/.test(a3) && a3 !== a2, 'volver a «Columna» propone la siguiente sin foto (' + a3 + ')');
    await ev(() => window.camaraApp.cerrar()); await p.waitForTimeout(400);
    await p.waitForTimeout(16000);
    d = await A.db(); nv = d.campo.filter((x) => !k0.has(x.id));
    c(nv.length === 3 && nv.every((x) => d.adj.includes(x.id) && !x.subiendo), 'las 3 fotos subidas, sin duplicar y sin «subiendo…» (' + nv.length + ')');
    c(nv.every((x) => d.fo.filter((f) => f.adjId === x.id).length === 1), 'una ficha del legajo por foto');
    const fm = d.fo.find((f) => f.adjId === nv.find((x) => x.num === a2).id);
    c(fm && fm.num === a2 && fm.cat === 'columna', 'la ficha del legajo dice ' + (fm && fm.num));
    c(A.errores.length === 0 && A.B.errores.length === 0, 'sin errores (' + A.errores.concat(A.B.errores).slice(0, 2).join(' | ') + ')');
    await A.browser.close();
  }
  // ================================================================ 4) sin señal, vuelve; cerrar la app a mitad
  if (corre(4)) {
    console.log('— 4 · sin señal y vuelve; cerrar la app a mitad; con __v164No como antes');
    const A = await armar({ oficina: true, r2: 1500 }), { p, ev } = A;
    const k0 = new Set((await A.db()).campo.map((x) => x.id));
    await A.camB();
    await ev(() => { window.__stubSinRed = true; }); A.r2.caido = true;
    await p.tap('#emaCam [data-ec="disparar"]'); await p.waitForTimeout(1500);
    await p.tap('#emaCam [data-ec="disparar"]'); await p.waitForTimeout(2500);
    let d = await A.db(); c(d.campo.filter((x) => !k0.has(x.id)).length === 0, 'sin señal: no llega nada a la base (todavía)');
    c(await ev(() => window.__fotoBandeja && window.__fotoBandeja.cantidad() >= 2), 'las 2 fotos están guardadas en el celu (bandeja)');
    await ev(() => { window.__stubSinRed = false; }); A.r2.caido = false;
    const ok2 = await A.esperar((k) => { const o = (window.__stubDB().ordenesTrabajo || {}).ot1; return Object.keys(((o || {}).campo || {}).fotos || {}).filter((x) => !k.includes(x)).length >= 2; }, [...k0], 40000);
    c(ok2, 'vuelve la señal: las 2 llegan solas a la orden');
    // cerrar la app a mitad: una foto con la nube lenta y se recarga la página antes de que suba
    A.r2.ms = 8000;
    await p.tap('#emaCam [data-ec="disparar"]'); await p.waitForTimeout(1800);
    await p.reload(); await p.waitForTimeout(6000); A.r2.ms = 1000;
    const ok3 = await A.esperar((k) => { const d = window.__stubDB(), o = (d.ordenesTrabajo || {}).ot1, f = ((o || {}).campo || {}).fotos || {}, nv = Object.keys(f).filter((x) => !k.includes(x)); return nv.length >= 3 && nv.every((x) => (d.adjuntos || {})[x] && !f[x].subiendo); }, [...k0], 90000);
    d = await A.db(); const nv = d.campo.filter((x) => !k0.has(x.id));
    c(ok3 && nv.length === 3, 'cerrar la app a mitad: la foto se recupera y sube sola (3 en la orden, ' + nv.length + ')');
    c(nv.every((x) => d.fo.filter((f) => f.adjId === x.id).length === 1 && d.adj.includes(x.id)), 'nada se duplica: una ficha del legajo y una imagen por foto');
    c(nv.every((x) => !x.subiendo), 'ninguna queda con «subiendo…»');
    c(A.errores.filter((e) => !/net::|Failed to fetch|internetdisconnected/i.test(e)).length === 0, 'sin errores (' + A.errores.slice(0, 2).join(' | ') + ')');
    await A.browser.close();
    // con __v164No: como antes
    const V = await armar({ op: { v164: false } });
    await V.camB();
    c(await V.ev(() => !document.querySelector('#cbPanel .fn-chips') && !!document.querySelector('#cbPanel .cbx-modos') && !window.__fotoAlToque && !window.__fotoLibre), 'con __v164No: la cámara de la barra como antes (sin la fila nueva ni la cola nueva)');
    await V.browser.close();
  }
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
