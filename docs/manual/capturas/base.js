// Utilidades para sacar las capturas del manual con la app real (v147) y los datos de ejemplo.
// Uso: TZ=America/Argentina/Cordoba APP=.../index.html APPDIR=... node sacar.js [filtro]
const T = process.env.T || '/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t';
const { abrir } = require('./h_es');
const SAL = process.env.SAL || __dirname + '/img';
const fs = require('fs'); fs.mkdirSync(SAL, { recursive: true });
const TODO = { inicio: true, nav: true, porPartes: true, ofPasos: true, tarjetas: true, mtNuevo: true, rsObra: true, lgPleg: true, iaPro: true, guias: true, crew: true, sugerida: true, obraGps: true, camaraB: true, v145: true, v146: true, v147: true, pisoReal: true, https: true, mov: true };
const limpiar = () => {
  try { localStorage.setItem('ema.nav.guardada', '0'); } catch (e) { }
  window.__pmPausa = true; window.__isNoAuto = true; window.__supNoIA = true;
  const dib = (c) => { const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, '#9cc3e6'); g.addColorStop(.6, '#cfe0ee'); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#7c7a68'; x.fillRect(0, c.height * 0.66, c.width, c.height); x.fillStyle = '#3d4a55'; x.fillRect(c.width * .47, c.height * .12, c.width * .06, c.height * .56); x.fillRect(c.width * .47, c.height * .12, c.width * .22, c.height * .025); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { const c = document.createElement('canvas'); c.width = 720; c.height = 1280; dib(c); setInterval(() => dib(c), 300); return c.captureStream(10); };
  document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '#avToast{display:none!important}'; document.head.appendChild(s); });
};
async function app(datos, sesion, op = {}) {
  const o = Object.assign({}, TODO, { datos, sesion, espera: op.espera || 5000, antes: op.antes || limpiar, cel: !!op.cel, dpr: 2 }, op.extra || {});
  const A = await abrir(o);
  if (!op.cel) await A.page.setViewportSize({ width: op.w || 1440, height: op.h || 900 });
  try { await A.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' }); } catch (e) { }
  if (op.geo) await A.ctx.setGeolocation({ latitude: op.geo[0], longitude: op.geo[1], accuracy: op.geo[2] || 8 });
  await A.page.evaluate(() => document.fonts && document.fonts.ready);
  await A.page.waitForTimeout(800);
  return A;
}
async function foto(p, nombre, sel, op = {}) {
  await p.waitForTimeout(op.espera || 700);
  const f = SAL + '/' + nombre + '.png';
  if (sel) {
    const l = p.locator(sel).first();
    if (op.ver !== false) await l.scrollIntoViewIfNeeded().catch(() => { });
    await l.screenshot({ path: f, timeout: 8000 });
  } else await p.screenshot({ path: f, fullPage: !!op.full, clip: op.clip });
  console.log('  📷 ' + nombre);
}
module.exports = { app, foto, T, SAL };
// Corre una lista de tomas sobre la misma sesión: [nombre, preparar(p), selector o null, opciones]
async function tomas(A, lista) {
  const p = A.page, solo = process.env.SOLO;
  for (const [n, prep, sel, op] of lista) {
    if (solo && !n.includes(solo) && !(op && op.siempre)) continue;
    try { if (prep) await prep(p); if (n[0] !== '_') await foto(p, n, sel, op || {}); }
    catch (e) { console.log('  ✗ ' + n + ': ' + String(e.message).split('\n')[0].slice(0, 200)); }
  }
}
const ev = (p, f, a) => p.evaluate(f, a);
const clic = async (p, sel, op = {}) => { await p.locator(sel).first().click(Object.assign({ timeout: 5000 }, op)); await p.waitForTimeout(op.espera || 600); };
const cerrarTodo = async (p) => {
  for (let i = 0; i < 6; i++) {
    const hubo = await p.evaluate(() => {
      try { window.cerrarMenuLateral(); } catch (e) { }
      const W = innerWidth, H = innerHeight;
      const capas = [...document.body.querySelectorAll('*')].filter((e) => { if (e.id === 'navN1' || e.id === 'iaFab' || e.closest('header')) return false; const cs = getComputedStyle(e); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width * r.height > W * H * 0.25; });
      for (const c of capas.reverse()) {
        const b = [...c.querySelectorAll('button,a,[role=button]')].find((x) => x.offsetParent !== null && (x.getAttribute('aria-label') === 'Cerrar' || /^(✕|×|Cerrar|Entendido|Listo)$/.test((x.textContent || '').trim())));
        if (b) { b.click(); return true; }
      }
      return false;
    });
    if (!hubo) break; await p.waitForTimeout(500);
  }
};
const vista = async (p, v) => { await cerrarTodo(p); return p.evaluate((v) => { window.mostrarVista(v); window.scrollTo(0, 0); }, v).then(() => p.waitForTimeout(900)); };
module.exports.tomas = tomas; module.exports.ev = ev; module.exports.clic = clic; module.exports.vista = vista; module.exports.cerrarTodo = cerrarTodo;
// Worker del asistente simulado (sin internet): contesta con el texto que se le pase.
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
async function workerFalso(p, rol, respuestas) {
  const cola = (respuestas || []).slice();
  await p.route(W + '/ia', (rt) => { const t = (cola.length > 1 ? cola.shift() : cola[0]) || 'Listo.'; const body = typeof t === 'object' ? t : { id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: t }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 80 }, ema: { costoUsd: 0.02, version: 'v3-ia' } }; return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) }); });
  await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', rol, habilitado: true, pausado: false, nivel: '', preguntasHoy: 3, topePreguntas: rol === 'admin' ? 0 : 10, quedanPreguntas: rol === 'admin' ? 999 : 7, remitosHoy: 0, topeRemitos: 40, quedanRemitos: 40 }) }));
  await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia', mes: '2026-11', gastoMes: 23.4, tope: 100, pausa: 80, corte: 95, nivel: '', partes: { preguntas: 15.1, remitos: 6.3, supervisor: 2 }, personas: [] }) }));
  await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v3-ia' }) }));
}
module.exports.workerFalso = workerFalso;
