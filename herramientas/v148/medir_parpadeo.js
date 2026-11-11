// v148 · Medición de parpadeos en el celu (390×844, dpr 2, CPU lenta) para cuadrilla, oficina y pañol.
// Uso: APP=.../index.html CPU=4 node _parpadeo.js [rol1,rol2] [salida.json]
// Cuadro por cuadro (rAF): geometría y estilo (transform/opacity/visibility/display/font-size) de la barra de abajo, sus botones
// y globitos, la campanita, el botón del asistente, la lengüeta, botones de la portada, chips; clase n1-on y padding del body;
// animaciones nuevas (document.getAnimations) y MutationObserver de toda la página.
process.env.CPU = process.env.CPU || '4';
const fs = require('fs');
const { abrir } = require('./h');
const { datos147 } = require('./datos147');
const ROLES = (process.argv[2] || 'juan,lucia,pan').split(',');
const OUT = process.argv[3] || '';
const monitor = () => {
  const P = window.__pp = { on: false, fase: '', ev: [], muts: [], anims: [], nMut: 0 };
  const SEL = ['#navN1', '#navN1 > button', '#navN1 .n1-bd', '#navN1 .n1-t', '#avCampana', '#avCampana i', '#iaFab', '#navTab', '#btnMenu', 'body > header', '#ieHero button', '#cdApp button', '#iniPan button', '.chip', '#avToast', '#offAviso', '#pmAviso', '#avisoApp'];
  const desc = (e) => { if (!e || e.nodeType !== 1) return e && e.nodeType === 3 ? 'texto<' + desc(e.parentNode) : String(e); let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; else if (e.className && typeof e.className == 'string') s += '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.'); const p = e.parentElement; if (!e.id && p) s = (p.id ? '#' + p.id : p.tagName.toLowerCase() + (p.className && typeof p.className == 'string' ? '.' + p.className.trim().split(/\s+/)[0] : '')) + '>' + s; return s; };
  P.desc = desc;
  const st = (e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), cs.transform, (+cs.opacity).toFixed(2), cs.visibility, cs.display, cs.fontSize].join('|'); };
  let prev = new Map();
  const vistos = new WeakSet();
  const frame = () => {
    try {
      if (P.on) {
        const t = Math.round(performance.now()), cur = new Map();
        SEL.forEach((s) => { let i = 0; document.querySelectorAll(s).forEach((e) => { if (i < 30) cur.set(s + '[' + (i++) + ']', { e, v: st(e) }); }); });
        cur.set('body.n1-on', { v: String(document.body.classList.contains('n1-on')) });
        cur.set('body.padding-bottom', { v: getComputedStyle(document.body).paddingBottom });
        cur.set('tapado', { v: String(window.__navN1 && window.__navN1.tapado ? window.__navN1.tapado() : '') });
        if (prev.size) {
          cur.forEach((x, k) => { const p = prev.get(k); if (!p) P.ev.push({ t, f: P.fase, k, a: '(no estaba)', b: x.v }); else if (p.v !== x.v) P.ev.push({ t, f: P.fase, k, a: p.v, b: x.v }); else if (p.e && x.e && p.e !== x.e) P.ev.push({ t, f: P.fase, k, a: 'nodo', b: 'nodo nuevo (rearmado)', rearmado: 1 }); });
          prev.forEach((x, k) => { if (!cur.has(k)) P.ev.push({ t, f: P.fase, k, a: x.v, b: '(ya no está)' }); });
        }
        prev = cur;
        if (document.getAnimations) document.getAnimations().forEach((a) => { if (vistos.has(a)) return; vistos.add(a); const tg = a.effect && a.effect.target; P.anims.push({ t, f: P.fase, n: a.animationName || (a.transitionProperty ? 'transition:' + a.transitionProperty : 'waapi'), el: desc(tg) }); });
      } else prev = new Map();
    } catch (e) { P.err = String(e); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  const mo = new MutationObserver((ms) => { if (!P.on) return; const t = Math.round(performance.now()); ms.forEach((m) => { P.nMut++; if (P.muts.length < 4000) P.muts.push({ t, f: P.fase, k: desc(m.target) + ':' + (m.attributeName || m.type) }); }); });
  const go = () => mo.observe(document.documentElement, { attributes: true, childList: true, subtree: true, characterData: true });
  if (document.documentElement) go(); else document.addEventListener('DOMContentLoaded', go);
  P.fijar = (f) => { P.fase = f; };
};
const OPS = { v147: true, mov: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, sugerida: true, v145: true, v146: true, obraGps: true, camaraB: true, iaPro: true, porPartes: true, ofPasos: true, rsObra: true, lgPleg: true, pisoReal: true };
async function medir(rol) {
  const kbps = /lento/.test(rol), seg = /seg$/.test(rol), sesion = rol.replace(/lento$|seg$/, '');
  const antes = (k) => { if (k) window.__stubKbps = k; };
  const A = await abrir(Object.assign({}, OPS, { datos: datos147(), sesion, cel: true, dpr: 2, espera: 500, antes: monitorYmas, antesArg: kbps ? 2000 : 0 }));
  const p = A.page, ev = (f, a) => p.evaluate(f, a);
  if (seg) {   // como el video de Marcos: «Antes de arrancar» con 6/6, ubicación en vivo prendida
    await A.ctx.grantPermissions(['geolocation'], { origin: 'http://app.test' }).catch(() => { });
    await A.ctx.setGeolocation({ latitude: -31.4, longitude: -64.18, accuracy: 10 }).catch(() => { });
    await p.waitForTimeout(6000);
    await ev(() => { const t = Date.now(); return firebase.firestore().collection('ordenesTrabajo').doc('ot1').set({ campo: { seguridad: { corte: 'epec', 'juan perez': { items: { casco: true, arnes: true, guantes: true, botines: true, conos: true, equipo: true }, fotos: { conos: 'fc1', equipo: 'fe1' }, fotosTs: { conos: t, equipo: t }, ts: t } } } }, { merge: true }); });
    await p.waitForTimeout(1500);
    await ev(() => window.__cuadrillaDia.ir('seg'));
    await p.waitForTimeout(1500);
    await ev(() => window.scrollTo(0, document.documentElement.scrollHeight));
  }
  const fase = async (n, ms, fn) => { await ev((x) => { window.__pp.fijar(x); window.__pp.on = true; }, n); if (fn) await fn(); if (ms) await p.waitForTimeout(ms); };
  // arranque (con señal lenta: todo lo que cae mientras carga)
  await fase('arranque', kbps ? 15000 : 8000);
  if (!kbps) {
    await fase('quieto', 15000);
    await fase('scroll', 3500, async () => { for (let i = 0; i < 8; i++) { await ev(() => window.scrollBy(0, 90)); await p.waitForTimeout(120); } for (let i = 0; i < 8; i++) { await ev(() => window.scrollBy(0, -90)); await p.waitForTimeout(120); } });
    await fase('menu', 2500, async () => { await p.click('#btnMenu').catch(() => ev(() => window.abrirMenuLateral && window.abrirMenuLateral())); await p.waitForTimeout(1500); await ev(() => window.cerrarMenuLateral && window.cerrarMenuLateral()); });
    await fase('pestana', 2500, async () => { const n = await ev(() => document.querySelectorAll('#navN1 [data-n1]').length); if (n > 2) { await p.tap('#navN1 [data-n1]:nth-child(3)').catch(() => { }); await p.waitForTimeout(2500); await p.tap('#navN1 [data-n1]:nth-child(1)').catch(() => { }); } });
    await fase('quieto2', 6000);
    await fase('aviso1', 11000, () => ev(() => window.__emaAvisos.avisar({ titulo: 'Te asignaron una orden de trabajo', cuerpo: 'OT-2026-400 · Plaza Bulevares · hoy a las 07:30', ir: { v: 'mistareas' } })));
    await fase('avisoDatos', 8000, () => ev((r) => {
      const db = firebase.firestore(), hoy = window.__v135.hoy(), ahora = Date.now();
      if (r === 'juan') return db.collection('ordenesTrabajo').doc('otNueva1').set({ numero: 'OT-2026-401', fecha: hoy, plazaId: 'p2', plazaNombre: 'Plaza San Pablo', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['replanteo'], actividadesManuales: [], estado: 'Emitida', ts: ahora, creado: ahora });
      return db.collection('reservas').doc('rsNueva1').set({ numero: 'R-0090', plazaId: 'p3', plazaNombre: 'Plaza Las Acacias', estado: 'solicitada', items: [{ codigo: '6010', desc: 'Luminaria LED 75 W', un: 'Un.', cant: 2, entregado: 0 }], creado: ahora, creadoPor: 'juan@ema-alumbrado.app' });
    }, sesion));
    await fase('avisos3', 11000, () => ev(async (r) => {
      const db = firebase.firestore(), hoy = window.__v135.hoy(), ahora = Date.now();
      for (let i = 0; i < 3; i++) {
        window.__emaAvisos.avisar({ titulo: 'Aviso ' + (i + 1), cuerpo: 'Prueba de varios seguidos', ir: { v: 'inicio' } });
        if (r === 'juan') await db.collection('ordenesTrabajo').doc('otNueva' + (i + 2)).set({ numero: 'OT-2026-41' + i, fecha: hoy, plazaId: 'p2', plazaNombre: 'Plaza San Pablo', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['replanteo'], actividadesManuales: [], estado: 'Emitida', ts: ahora, creado: ahora });
        else await db.collection('reservas').doc('rsNueva' + (i + 2)).set({ numero: 'R-009' + (i + 1), plazaId: 'p3', plazaNombre: 'Plaza Las Acacias', estado: 'solicitada', items: [{ codigo: '6010', desc: 'Luminaria', un: 'Un.', cant: 1, entregado: 0 }], creado: ahora, creadoPor: 'juan@ema-alumbrado.app' });
        await new Promise((ok) => setTimeout(ok, 400));
      }
    }, sesion));
    await fase('push', 6000, () => ev(() => { const l = (window.__pushOyentes || {}).pushNotificationReceived || []; l.forEach((f) => { try { f({ title: 'Orden nueva', body: 'OT-2026-420 · tocá para ver' }); } catch (e) { } }); (window.__pushOyentes || {}).localNotificationReceived && window.__pushOyentes.localNotificationReceived.forEach((f) => { try { f({ title: 'Recordatorio', body: 'Tu tarea de hoy' }); } catch (e) { } }); return l.length; }));
    await fase('avisoApp', 4000, async () => { await ev(() => { window.alert('Listo: se guardó.'); }); await p.waitForTimeout(2000); await ev(() => { const b = document.querySelector('#avisoApp .av-ok'); b && b.click(); }); });
    await fase('pmAviso', 5000, () => ev(() => { const v = document.createElement('div'); v.id = 'pmAviso'; v.className = 'no-print'; v.setAttribute('role', 'status'); v.innerHTML = '<div class="pm-in"><div class="pm-t">📅 <b>Se pasaron 2 tareas de hoy a mañana.</b></div><ul><li>Bulevares · Izaje</li><li>Bulevares · Vínculo</li></ul><div class="pm-acc"><button type="button" class="btn-ghost">↶ Deshacer</button><button type="button" class="btn-primary">Listo</button></div></div>'; document.body.appendChild(v); setTimeout(() => v.remove(), 3500); }));
    await fase('sinSenal', 4000, async () => { await A.ctx.setOffline(true); await ev(() => window.dispatchEvent(new Event('offline'))); });
    await fase('vuelveSenal', 5000, async () => { await A.ctx.setOffline(false); await ev(() => window.dispatchEvent(new Event('online'))); });
    await fase('quieto3', 10000);
  }
  await ev(() => { window.__pp.on = false; });
  const R = await ev(() => ({ ev: window.__pp.ev, muts: window.__pp.muts, nMut: window.__pp.nMut, anims: window.__pp.anims, err: window.__pp.err }));
  R.errores = A.errores;
  await A.browser.close();
  return R;
}
// el monitor y, para ver un aviso «del celu», un Capacitor de mentira solo con los oyentes de avisos (no se hace app nativa)
const monitorYmas = new Function('k', '(' + monitor.toString() + ')(); if (k) window.__stubKbps = k; window.__pushOyentes = {};');
const ESPERADO = { pestana: 1, menu: 1, scroll: 1, arranque: 1 };
function resumen(rol, R) {
  const L = [];
  const fases = [...new Set(R.ev.map((e) => e.f).concat(R.muts.map((m) => m.f)))];
  fases.forEach((f) => {
    const E = R.ev.filter((e) => e.f === f), M = R.muts.filter((m) => m.f === f), An = R.anims.filter((a) => a.f === f);
    const porK = {}; E.forEach((e) => { porK[e.k] = (porK[e.k] || 0) + 1; });
    const porM = {}; M.forEach((m) => { porM[m.k] = (porM[m.k] || 0) + 1; });
    const porA = {}; An.forEach((a) => { const k = a.n + ' @ ' + a.el; porA[k] = (porA[k] || 0) + 1; });
    L.push(`  [${f}] cambios geom/estilo: ${E.length} · mutaciones: ${M.length} · animaciones nuevas: ${An.length}`);
    Object.entries(porK).sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([k, n]) => { const e = E.find((x) => x.k === k); L.push(`      ${n}× ${k}  ${e.a} → ${e.b}`); });
    Object.entries(porM).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([k, n]) => L.push(`      mut ${n}× ${k}`));
    Object.entries(porA).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([k, n]) => L.push(`      anim ${n}× ${k}`));
  });
  return `== ${rol} ==\n` + L.join('\n') + (R.errores.length ? '\n  ERRORES: ' + R.errores.slice(0, 4).join(' | ') : '');
}
(async () => {
  const todo = {};
  for (const r of ROLES) { const R = await medir(r); todo[r] = R; console.log(resumen(r, R)); }
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(todo));
})();
