// v128 · La foto desde la tarea tarda menos: GPS lento (no contesta), la nube a 2 s (A) o colgada (B, y la base sin señal).
// Antes (v127): A 7 s · B 13 s. Ahora tiene que ser A < 6 s y B < 9 s; con la ubicación del seguimiento en vivo, menos.
const { abrir, prueba, baseDatos } = require('./h');
const fs = require('fs');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v128b' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'juan', cel, datos: baseDatos(), espera: 4000, ofPasos: true, mtNuevo: true, reglas: true, https: true }), p = A.page;
  await p.evaluate(() => { navigator.geolocation.getCurrentPosition = function () { }; });
  let lenta = 2000;
  await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { await new Promise((ok) => setTimeout(ok, lenta)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }).catch(() => { }); });
  const b64 = fs.readFileSync(__dirname + '/foto.jpg').toString('base64');
  const sacar = () => p.evaluate(async (b) => { const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const f = new File([u], 'x.jpg', { type: 'image/jpeg' }); const t0 = Date.now(); try { await window.guardarFotoObra(f, { plazaId: 'p1', plazaNombre: 'P', otId: 'ot1', cat: 'columna', num: '1', por: 'Juan Pérez' }); } catch (e) { } return Date.now() - t0; }, b64);
  let ms = await sacar();
  c(ms < 6000, 'con el GPS que no contesta y la nube a 2 s, la foto queda en menos de 6 s · ' + (ms / 1000).toFixed(1) + ' s');
  lenta = 12000; await p.evaluate(() => { window.__stubSinRed = true; });
  ms = await sacar();
  c(ms < 9000, 'con la nube colgada y sin señal para la base, en menos de 9 s (antes 13 s), y queda en el celu · ' + (ms / 1000).toFixed(1) + ' s');
  const cola = await p.evaluate(async () => (await window.__fotosSinSenal.todos()).length);
  c(cola >= 1, 'la foto que no llegó a subir quedó en el celu para subirse sola · ' + cola);
  await p.evaluate(() => { window.__stubSinRed = false; window.__ubicacionVivo && (window.__ubicacionVivo.estado = () => ({ ultimo: { lat: -31.42, lng: -64.18, acc: 8, t: Date.now() } })); });
  lenta = 2000; ms = await sacar();
  c(ms < 1500, 'con la ubicación del seguimiento en vivo no espera al GPS · ' + (ms / 1000).toFixed(1) + ' s');
  const t = await p.evaluate(() => window.__fotoTiempos());
  c(/Últimas 3 fotos/.test(t), 'menú › Versión muestra cuánto tardaron las últimas fotos · ' + t);
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
