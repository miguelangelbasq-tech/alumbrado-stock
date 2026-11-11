// v148 · Parpadeos en los celus + fotos de la cuadrilla más rápidas.
// Con CPU lenta (×4 como un Moto g24; ×6 para las fotos):
//  · cuadrilla (Juan en «Antes de arrancar» 6/6, como el video de Marcos), oficina (Lucía) y pañol (Pablo):
//    quieta y al llegar avisos (cartel de arriba, orden/reserva nueva en la base, varios seguidos): la barra de abajo, sus
//    botones, la campanita, el botón del asistente y el botón de abajo de la pantalla no cambian de tamaño, lugar ni
//    opacidad, body.n1-on no cambia y la barra no se rearma (solo cambia el número del globito);
//  · el aviso de arriba (#avToast) no se estira hasta la barra; lo que se mueve (.mov-*) y los carteles no esconden la
//    barra; algo que cambia de tamaño con la barra se ignora a la tercera vez (sin parpadeo);
//  · la letra de la barra no queda en 9,5 px por medir con la barra escondida;
//  · movPantallas: una hoja que aparece sin un toque (un aviso) no sube con movimiento;
//  · fotos (Modo obra): disparo → «Foto guardada · Sacar otra» en menos de 1 s (antes esperaba sello + nube + base), la
//    columna siguiente al toque, la foto llega igual a la base y a la orden (campo.fotos con su columna), sin señal queda
//    en la cola del celu; abrir la cámara (Modo obra y la de la barra) en menos de 1,5 s.
const { abrir, prueba } = require('./h');
const { datos147, P } = require('./datos147');
const cel = process.argv[2] === 'cel';
const MOD = { v147: true, mov: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, sugerida: true, v145: true, v146: true, obraGps: true, camaraB: true, porPartes: true, https: true };
const monitor = () => {
  const P = window.__pp = { on: false, ev: [], muts: [], rearm: 0 };
  const SEL = ['#navN1', '#navN1 > button', '#navN1 .n1-t', '#avCampana', '#iaFab', '#navTab', '#btnMenu', '#cdApp .cd-pie', '#cdApp .cd-big', '#avToast'];
  const st = (e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), cs.transform, (+cs.opacity).toFixed(2), cs.visibility, cs.display, cs.fontSize].join('|'); };
  let prev = new Map();
  const frame = () => {
    try {
      if (P.on) {
        const cur = new Map();
        SEL.forEach((s) => { let i = 0; document.querySelectorAll(s).forEach((e) => { if (i < 12) cur.set(s + '[' + (i++) + ']', { e, v: st(e) }); }); });
        cur.set('n1-on', { v: String(document.body.classList.contains('n1-on')) });
        if (prev.size) cur.forEach((x, k) => { const p = prev.get(k); if (p && p.v !== x.v) P.ev.push({ k, a: p.v, b: x.v }); else if (p && p.e && x.e && p.e !== x.e) { P.rearm++; P.ev.push({ k, a: 'nodo', b: 'rearmado' }); } });
        prev = cur;
      } else prev = new Map();
    } catch (e) { }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  new MutationObserver((ms) => { if (P.on) ms.forEach((m) => { const t = m.target; if (t === document.body && m.attributeName === 'class') P.muts.push('body.class'); else if (t.closest && t.closest('#navN1') && !(t.classList && t.classList.contains('n1-bd')) && !(t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('n1-bd'))) P.muts.push('navN1:' + (m.attributeName || m.type)); }); }).observe(document, { attributes: true, childList: true, subtree: true, characterData: true });
};
const camaraFalsa = () => {
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#6f6f5c'; x.fillRect(0, c.height * 0.62, c.width, c.height); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { await new Promise((r) => setTimeout(r, 300)); const c = document.createElement('canvas'); c.width = 1280; c.height = 960; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
};
const tiempos = () => {
  // tiempos medidos en el celu (sin el retardo de la prueba): desde el toque hasta el cuadro dibujado
  window.__ft = {};
  document.addEventListener('pointerdown', (e) => { const b = e.target && e.target.closest && e.target.closest('[data-ec="disparar"],[data-cd="boton"],[data-cdh="otra"],[data-n1="camara"],#menuCamara'); if (b) window.__ft = { t0: performance.now(), que: b.getAttribute('data-ec') || b.getAttribute('data-cd') || b.getAttribute('data-cdh') || b.getAttribute('data-n1') || b.id }; }, true);
  const vig = () => {
    const F = window.__ft;
    if (F.t0 != null) {
      const v = document.getElementById('ecVideo');
      if (F.vid == null && v && v.videoWidth > 0 && v.readyState >= 2) F.vid = Math.round(performance.now() - F.t0);
      const h = document.getElementById('cdHoja');
      if (F.hoja == null && F.que === 'disparar' && h && /Foto guardada/.test(h.textContent) && h.querySelector('[data-cdh="otra"]')) F.hoja = Math.round(performance.now() - F.t0);
      const d = document.querySelector('#emaCam [data-ec="disparar"]');
      if (F.listo == null && F.que === 'disparar' && F.blob && d) F.listo = Math.round(performance.now() - F.t0);
    }
    requestAnimationFrame(vig);
  };
  requestAnimationFrame(vig);
  const tb = HTMLCanvasElement.prototype.toBlob; HTMLCanvasElement.prototype.toBlob = function (cb, ...a) { return tb.call(this, (b) => { if (window.__ft.t0 != null) window.__ft.blob = 1; cb(b); }, ...a); };
};
const antes = new Function('(' + monitor.toString() + ')();(' + camaraFalsa.toString() + ')();(' + tiempos.toString() + ')();');
const lento = async (pg, rate) => { const cdp = await pg.context().newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate }); };
(async () => {
  const c = prueba('v148' + (cel ? ' cel' : ''));
  // ===================================================================================== parpadeo
  for (const rol of ['juan', 'lucia', 'pan']) {
    const A = await abrir(Object.assign({ datos: datos147(), sesion: rol, cel, espera: 6000, antes }, MOD)), p = A.page, ev = (f, a) => p.evaluate(f, a);
    await lento(p, 4);
    if (rol === 'juan') {   // como el video de Marcos: «Antes de arrancar» con 6/6, abajo de todo
      await ev(() => { const t = Date.now(); return firebase.firestore().collection('ordenesTrabajo').doc('ot1').set({ campo: { seguridad: { corte: 'epec', 'juan perez': { items: { casco: true, arnes: true, guantes: true, botines: true, conos: true, equipo: true }, fotos: { conos: 'fc1', equipo: 'fe1' }, fotosTs: { conos: t, equipo: t }, ts: t } } } }, { merge: true }); });
      await p.waitForTimeout(1500); await ev(() => window.__cuadrillaDia.ir('seg')); await p.waitForTimeout(2000); await ev(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(800);
      c(await ev(() => /6\/6/.test((document.querySelector('#cdApp') || {}).textContent || '') && !!document.querySelector('#cdApp [data-cd="arrancar"]')), 'cuadrilla en «Antes de arrancar» con 6/6 y «Arrancar el día» abajo');
    }
    const medir = async (txt, fn, ms) => {
      await ev(() => { window.__pp.ev = []; window.__pp.muts = []; window.__pp.rearm = 0; window.__pp.on = true; });
      if (fn) await fn();
      await p.waitForTimeout(ms);
      const r = await ev(() => { window.__pp.on = false; const P = window.__pp; return { ev: P.ev.filter((x) => !/^#avToast/.test(x.k)), toast: P.ev.filter((x) => /^#avToast/.test(x.k)), muts: P.muts, rearm: P.rearm }; });
      const nav = r.ev.length === 0 && r.muts.length === 0;
      c(nav, `${rol} · ${txt}: 0 cambios de tamaño/lugar/opacidad en la barra y los botones, body.n1-on quieto, la barra no se rearma` + (nav ? '' : ' · ' + r.ev.length + ' cambios, ' + r.muts.length + ' mutaciones: ' + JSON.stringify(r.ev.slice(0, 2)) + ' ' + r.muts.slice(0, 3).join(',')));
      return r;
    };
    await medir('quieta 6 s', null, 6000);
    let r = await medir('llega un aviso (cartel de arriba)', () => ev(() => { window.__emaAvisos.avisar({ titulo: 'Te asignaron una orden de trabajo', cuerpo: 'OT-2026-400 · Plaza Bulevares', ir: { v: 'mistareas' } }); window.__altos = []; const f = () => { const e = document.getElementById('avToast'); if (e) window.__altos.push(Math.round(e.getBoundingClientRect().height)); if (window.__altos.length < 200) requestAnimationFrame(f); }; f(); }), 6000);
    const altos = await ev(() => [...new Set(window.__altos)]);
    c(altos.every((h) => h < 300), `${rol} · el aviso de arriba no se estira hasta la barra (altos ${altos.join(', ') || '—'} px)`);
    await medir('sigue quieta con el aviso puesto y después', null, 8000);
    await medir('llegan 3 avisos y datos nuevos seguidos', () => ev(async (r) => {
      const db = firebase.firestore(), hoy = window.__v135.hoy(), ahora = Date.now();
      for (let i = 0; i < 3; i++) {
        window.__emaAvisos.avisar({ titulo: 'Aviso ' + (i + 1), cuerpo: 'Varios seguidos' });
        if (r === 'juan') await db.collection('ordenesTrabajo').doc('otN' + i).set({ numero: 'OT-2026-41' + i, fecha: hoy, plazaId: 'p2', plazaNombre: 'Plaza San Pablo', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['replanteo'], actividadesManuales: [], estado: 'Emitida', ts: ahora, creado: ahora });
        else await db.collection('reservas').doc('rsN' + i).set({ numero: 'R-009' + i, plazaId: 'p3', plazaNombre: 'Plaza Las Acacias', estado: 'solicitada', items: [{ codigo: '6010', desc: 'Luminaria', un: 'Un.', cant: 1, entregado: 0 }], creado: ahora, creadoPor: 'juan@ema-alumbrado.app' });
        await new Promise((ok) => setTimeout(ok, 400));
      }
    }, rol), 7000);
    if (cel) {
      const b = await ev(() => ({ bd: [...document.querySelectorAll('#navN1 .n1-bd')].map((e) => e.textContent).join(','), fs: [...document.querySelectorAll('#navN1 .n1-t')].map((e) => getComputedStyle(e).fontSize), on: document.body.classList.contains('n1-on') }));
      // cada nombre con la letra más grande que entra (11,5 px salvo los largos, como «Herramientas»): no quedó achicada por medir con la barra escondida
      const de = await ev(() => [...document.querySelectorAll('#navN1 .n1-t')].filter((e) => { const f = parseFloat(getComputedStyle(e).fontSize); if (f >= 11.5) return false; const c = e.cloneNode(true); c.style.fontSize = (f + 0.25) + 'px'; c.style.position = 'absolute'; c.style.visibility = 'hidden'; e.parentNode.appendChild(c); const sobra = c.scrollWidth <= e.parentNode.clientWidth - 4; c.remove(); return sobra; }).map((e) => e.textContent));
      c(b.on && !de.length, `${rol} · la barra a la vista y cada nombre con la letra justa (${b.fs.join(' ')})` + (de.length ? ' · achicados de más: ' + de.join(', ') : '') + ` · globitos ${b.bd || '—'}`);
    }
    if (rol === 'juan' && cel) {   // el globito cambia solo su número: mismos botones, misma letra
      const id0 = await ev(() => { window.__btn0 = [...document.querySelectorAll('#navN1 > button')]; return (document.querySelector('#navN1 [data-n1="hoy"] .n1-bd') || {}).textContent || ''; });
      await ev(() => { const hoy = window.__v135.hoy(), ahora = Date.now(); return firebase.firestore().collection('ordenesTrabajo').doc('otN9').set({ numero: 'OT-2026-419', fecha: hoy, plazaId: 'p2', plazaNombre: 'Plaza San Pablo', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['replanteo'], actividadesManuales: [], estado: 'Emitida', ts: ahora, creado: ahora }); });
      await p.waitForTimeout(3000);
      const id1 = await ev(() => ({ t: (document.querySelector('#navN1 [data-n1="hoy"] .n1-bd') || {}).textContent || '', mismos: [...document.querySelectorAll('#navN1 > button')].every((b, i) => b === window.__btn0[i]) }));
      c(id1.t !== id0 && id1.mismos, `cuadrilla · llega una orden: el globito pasa de ${id0 || '—'} a ${id1.t} y los botones de la barra son los mismos (no se rearma)`);
      // algo que cambia de tamaño con la barra (realimentación): se ignora y la barra queda
      await ev(() => { const s = document.createElement('style'); s.textContent = '#pruebaVai{position:fixed;left:0;right:0;top:0;height:40px;z-index:50;background:rgba(0,0,0,.01)} body.n1-on #pruebaVai{height:100vh}'; document.head.appendChild(s); const d = document.createElement('div'); d.id = 'pruebaVai'; document.body.appendChild(d); });
      await p.waitForTimeout(6000);
      r = await medir('con algo que cambia de tamaño con la barra', null, 5000);
      await ev(() => document.getElementById('pruebaVai').remove());
      // una hoja que aparece sin un toque (un aviso) no sube con movimiento
      const h0 = await ev(() => window.__mov.estado().hist.length);
      await ev(() => { const d = document.createElement('div'); d.className = 'v7-ov'; d.id = 'pruebaHoja'; d.setAttribute('role', 'dialog'); d.innerHTML = '<div class="v7-caja">Hola</div>'; document.body.appendChild(d); });
      await p.waitForTimeout(800);
      c(await ev((n) => window.__mov.estado().hist.slice(n).filter((x) => x.tipo === 'hoja').length === 0 && document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#pruebaHoja')).length === 0, h0), 'una hoja que aparece sin que la persona toque nada no sube con movimiento');
      await ev(() => document.getElementById('pruebaHoja').remove());
    }
    c(!A.errores.length, `${rol} · sin errores` + (A.errores.length ? ': ' + A.errores.slice(0, 3).join(' | ') : ''));
    await A.browser.close();
  }
  // ===================================================================================== fotos (Modo obra y cámara de la barra)
  for (const sin of [false, true]) {
    const J = await abrir(Object.assign({ datos: datos147(), sesion: 'juan', cel, espera: 6000, antes }, MOD)), q = J.page, ev = (f, a) => q.evaluate(f, a);
    await J.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { await new Promise((r) => setTimeout(r, 1500)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }); });
    await J.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' });
    await J.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 8 });
    await lento(q, 6);
    const esperar = (fn, arg, ms) => q.waitForFunction(fn, arg, { timeout: ms || 30000, polling: 30 }).then(() => true, () => false);
    const toque = (pg, sel) => (cel ? pg.tap(sel) : pg.click(sel));
    const t = () => ev(() => performance.now());
    const camLista = () => esperar(() => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0 && v.readyState >= 2; });
    const ft = (k) => q.waitForFunction((x) => window.__ft[x] != null, k, { timeout: 40000, polling: 50 }).then(() => ev((x) => window.__ft[x], k), () => 99999);
    await ev(() => window.__cuadrillaDia.ir('obra')); await q.waitForTimeout(5000);
    if (sin) { await ev(() => { window.__stubSinRed = true; }); await J.ctx.setOffline(true); await ev(() => window.dispatchEvent(new Event('offline'))); }
    const tag = sin ? 'sin señal' : 'con señal';
    const cols = [], tDisp = [], tAbre = [];
    for (let i = 0; i < 3; i++) {
      let t0 = await t();
      await toque(q, i === 0 ? '#cdApp [data-cd="boton"]' : '#cdHoja [data-cdh="otra"]');
      await camLista(); const ab = await ft('vid');
      const esperado = await ev(() => { const pa = window.__cuadrillaDia.pasoActual(); return (pa.it && pa.it.num) || ''; });
      t0 = await t();
      await toque(q, '#emaCam [data-ec="disparar"]');
      const ok = await esperar(() => { const h = document.getElementById('cdHoja'); return !!h && /Foto guardada/.test(h.textContent) && !!h.querySelector('[data-cdh="otra"]'); }, null, 40000);
      const sig = await ft('hoja');
      const sigue = await ev(() => { const pa = window.__cuadrillaDia.pasoActual(); return pa.fase + ':' + ((pa.it && pa.it.num) || ''); });
      cols.push(esperado);
      if (i < 2 || !sin) { tDisp.push(sig); c(ok && sig < 2000, `fotos ${tag} · foto ${i + 1} (${esperado}): disparo → «Foto guardada · Sacar otra» en ${sig} ms (antes de la v148: 7 a 13 s)`); }
      tAbre.push(ab);
      if (i === 0) c(sigue === 'termine:' + esperado, `fotos ${tag} · la foto ya cuenta al toque (Modo obra pasa a «Terminé» de ${esperado}: ${sigue})`);
    }
    const med = (l) => l.slice().sort((a, b) => a - b)[Math.floor((l.length - 1) / 2)];
    c(med(tDisp) < 1000, `fotos ${tag} · disparo → poder sacar la siguiente: mediana ${med(tDisp)} ms (< 1 s) · ${tDisp.join(' / ')} ms`);
    c(Math.min.apply(null, tAbre) < 1500 && Math.max.apply(null, tAbre) < 2500, `fotos ${tag} · abrir la cámara desde Modo obra: ${tAbre.join(' / ')} ms (la mejor < 1,5 s, ninguna > 2,5 s; con la CPU ×6)`);
    if (!sin) {
      const okBase = await esperar(() => { const o = window.__stubDB().ordenesTrabajo.ot1; const f = Object.values(((o || {}).campo || {}).fotos || {}).filter((y) => y.k && y.num); return f.length >= 3 && Object.values(window.__stubDB().fotosObra || {}).filter((x) => x.otId === 'ot1').length >= 3; }, null, 90000);
      const db = await ev(() => { const o = window.__stubDB().ordenesTrabajo.ot1; return { f: Object.values(((o || {}).campo || {}).fotos || {}).map((y) => y.num + '/' + y.k + '/' + (y.mini ? 'mini' : '')), fo: Object.values(window.__stubDB().fotosObra || {}).filter((x) => x.otId === 'ot1').length }; });
      c(okBase && db.fo >= 3, `fotos ${tag} · las 3 llegan igual a la base: campo.fotos ${db.f.join(', ')} · fotosObra ${db.fo}`);
      c(await ev(() => !document.querySelector('#cdApp .cd-msg') || !/No se pudo/.test(document.querySelector('#cdApp .cd-msg').textContent)), `fotos ${tag} · sin carteles de error`);
      // cámara de la barra (cámara B): abrir y disparar
      await ev(() => { const b = document.querySelector('#cdHoja [data-cdh="x"]'); b && b.click(); }); await q.waitForTimeout(600);
      let t0 = await t();
      await ev(() => { window.__ft = { t0: performance.now(), que: 'camara' }; const b = document.querySelector('#navN1 [data-n1="camara"]'); if (b) b.click(); else document.getElementById('menuCamara').click(); });
      await camLista(); const ab = await ft('vid');
      c(ab < 2500, `fotos · abrir la cámara de la barra: ${ab} ms (< 1,5 s esperado; tope de la prueba 2,5 s con la CPU ×6)`);
      const n0 = await ev(() => Object.keys(window.__stubDB().fotosObra || {}).length);
      t0 = await t(); await toque(q, '#emaCam [data-ec="disparar"]');
      const okB = await esperar((n) => Object.keys(window.__stubDB().fotosObra || {}).length > n, n0, 30000);
      c(okB, `fotos · cámara de la barra: la foto llega a la base (${Math.round((await t()) - t0)} ms, por atrás)`);
      await ev(() => window.camaraApp.cerrar());
    } else {
      const cola = await ev(() => new Promise((ok) => { const r = indexedDB.open('ema-fotos-cola', 1); r.onsuccess = () => { const s = r.result.transaction('pend', 'readonly').objectStore('pend').getAll(); s.onsuccess = () => ok(s.result.filter((x) => x.col === 'adjuntos').length); s.onerror = () => ok(-1); }; r.onerror = () => ok(-1); }));
      await q.waitForTimeout(6000);
      const cola2 = await ev(() => new Promise((ok) => { const r = indexedDB.open('ema-fotos-cola', 1); r.onsuccess = () => { const s = r.result.transaction('pend', 'readonly').objectStore('pend').getAll(); s.onsuccess = () => ok(s.result.filter((x) => x.col === 'adjuntos').length); s.onerror = () => ok(-1); }; r.onerror = () => ok(-1); }));
      c(Math.max(cola, cola2) >= 2, `fotos ${tag} · quedan en la cola del celu (ema-fotos-cola: ${Math.max(cola, cola2)}) para subirse solas`);
      await ev(() => { window.__stubSinRed = false; }); await J.ctx.setOffline(false); await ev(() => window.dispatchEvent(new Event('online')));
    }
    c(!J.errores.length, `fotos ${tag} · sin errores` + (J.errores.length ? ': ' + J.errores.slice(0, 3).join(' | ') : ''));
    await J.browser.close();
  }
  process.exit(c.fin() ? 1 : 0);
})();
