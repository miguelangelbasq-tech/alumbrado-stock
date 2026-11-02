// Pruebas v095 (visor de fotos) · Al pasar rápido de foto (flecha del teclado apretada o «›» seguido) el visor quedaba corrido de
// costado (captura de Ángel en la compu: sin ✕, foto partida en dos). Ahora la foto queda siempre en su lugar.
const fs = require('fs');
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const JPG = 'data:image/jpeg;base64,' + fs.readFileSync(__dirname + '/foto.jpg').toString('base64');
function datos() {
  const d = baseDatos(), ahora = Date.now();
  d.db.adjuntos = {}; d.db.fotosObra = {};
  for (let k = 0; k < 40; k++) {   // 40 fotos, como en la captura
    d.db.adjuntos['a' + k] = { tipo: 'obra', plazaId: 'p1', plazaNombre: 'Plaza San Martín', cat: 'columna', num: String(k + 1), dataUrl: JPG, ts: ahora - (40 - k) * 60e3, usuario: 'juan@x' };
    d.db.fotosObra['f' + k] = { plazaId: 'p1', plazaNombre: 'Plaza San Martín', adjId: 'a' + k, cat: 'columna', num: String(k + 1), lat: -31.4271, lng: -64.1889, gpsPrec: 5, ts: ahora - (40 - k) * 60e3, fecha: '2026-10-20', por: 'Juan Pérez', mini: '' };
  }
  return d;
}
(async () => {
  const c = prueba('v095b' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true, https: true }), p = A.page;
  if (!cel) await p.setViewportSize({ width: 1919, height: 1027 });
  await p.evaluate(() => { mostrarVista('obras'); window.abrirLegajo('p1'); });
  await p.waitForFunction(() => document.querySelectorAll('#lgFotos [data-lgfoto]').length >= 10, null, { timeout: 15000 }).catch(() => { });
  await p.evaluate(() => document.querySelector('#lgFotos [data-lgfoto]').click()); await p.waitForTimeout(900);
  const estado = () => p.evaluate(() => {
    const e = document.getElementById('gpVisor'), s0 = e.querySelector('.gp-sl[data-p="0"]'), x = e.querySelector('[data-gp="cerrar"]').getBoundingClientRect();
    return { visor: Math.round(e.getBoundingClientRect().left), sl: Math.round(s0.getBoundingClientRect().left), scroll: e.scrollLeft, cerrar: Math.round(x.left), cnt: e.querySelector('.gp-cnt').textContent, i: window.emaGaleria.actual().i, iguales: new Set([...e.querySelectorAll('.gp-sl')].map((s) => s.dataset.p)).size };
  });
  const bien = (r) => r.visor === 0 && r.sl === 0 && r.scroll === 0 && r.cerrar > 0 && r.iguales === 3;
  let r = await estado();
  c(bien(r) && r.cnt === '1 / 40', 'abre la primera foto, en su lugar: ' + JSON.stringify(r));
  for (let k = 0; k < 12; k++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(25); }   // tecla apretada (repite)
  await p.waitForTimeout(700); r = await estado();
  c(bien(r) && r.i >= 1 && r.cnt === (r.i + 1) + ' / 40', 'con la flecha del teclado apretada, la foto queda en su lugar (sin correrse): ' + JSON.stringify(r));
  for (let k = 0; k < 6; k++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(260); }
  await p.waitForTimeout(500); const r2 = await estado();
  c(bien(r2) && r2.i === r.i + 6, 'tecla por tecla pasa de a una (' + r.i + ' → ' + r2.i + ')');
  if (!cel) {
    for (let k = 0; k < 8; k++) { await p.click('#gpVisor .gp-sig', { force: true }).catch(() => { }); await p.waitForTimeout(40); }
    await p.waitForTimeout(700); r = await estado();
    c(bien(r), 'tocando «›» seguido, tampoco se corre: ' + JSON.stringify(r));
  }
  await p.evaluate(() => { const t = document.querySelector('#gpVisor .gp-tira img[data-gpk="35"]'); t && t.click(); }); await p.waitForTimeout(700);
  r = await estado();
  const tira = await p.evaluate(() => { const t = document.querySelector('#gpVisor .gp-tira img.on'), b = t.getBoundingClientRect(); return { izq: Math.round(b.left), der: Math.round(b.right), w: innerWidth }; });
  c(bien(r) && r.cnt === '36 / 40' && tira.izq >= 0 && tira.der <= tira.w, 'tocando la miniatura 36: la abre en su lugar y la tira la deja a la vista: ' + JSON.stringify(Object.assign(r, tira)));
  await p.screenshot({ path: __dirname + '/v095b_visor' + (cel ? '_cel' : '') + '.png' });
  c(!A.errores.length, 'sin errores de JS ' + JSON.stringify(A.errores.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
