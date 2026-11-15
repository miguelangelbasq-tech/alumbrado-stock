// v162 · Videos cortos y livianos (Ángel 15/11: «lo que pese lo menos posible… videos cortos»).
//  · la hoja dice «hasta 1 minuto» y «≈ 5 MB por minuto»; un video de 75 s se rechaza con «el tope es 1 minuto»;
//  · el de 30 s (1280×720, 25 MB) queda en ≤ 2,5 MB (≈ 4,7 MB por minuto o menos) y sigue a 480p (lado mayor 854).
const fs = require('fs');
const { abrir, prueba } = require('./h');
const { datos160 } = require('./datos160');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
const MED = __dirname + '/v160med/';
// los videos de prueba se hacen con ffmpeg la primera vez (no van al repo)
(function hacerVideos() {
  const { execSync } = require('child_process'); fs.mkdirSync(MED, { recursive: true });
  const F = (n, c) => { if (!fs.existsSync(MED + n)) execSync('ffmpeg -y -loglevel error ' + c + ' ' + MED + n, { stdio: 'inherit' }); };
  F('v30.webm', '-f lavfi -i "testsrc2=size=1280x720:rate=30,noise=alls=40:allf=t" -f lavfi -i "sine=frequency=440:sample_rate=48000" -t 30 -c:v libvpx -b:v 7M -minrate 7M -maxrate 7M -deadline realtime -cpu-used 8 -c:a libopus -b:a 128k -ac 2');
  F('v8.webm', '-f lavfi -i "testsrc2=size=640x480:rate=25" -f lavfi -i "sine=frequency=660:sample_rate=48000" -t 8 -c:v libvpx -b:v 2M -deadline realtime -cpu-used 8 -c:a libopus -b:a 96k');
  F('vgrande.webm', '-f lavfi -i "testsrc2=size=640x360:rate=30,noise=alls=80:allf=t" -t 30 -c:v libvpx -b:v 30M -minrate 30M -maxrate 30M -bufsize 30M -deadline realtime -cpu-used 8 -an');
})();
const JPG = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
function pdf(mb, hojas) {   // un PDF «de mentira» del tamaño pedido, con sus hojas
  const cab = '%PDF-1.4\n' + Array.from({ length: hojas }, (_, i) => `${i + 3} 0 obj << /Type /Page /Parent 2 0 R >> endobj\n`).join('') + '2 0 obj << /Type /Pages /Count ' + hojas + ' >> endobj\n';
  const fin = '\n%%EOF\n', relleno = Math.max(0, Math.round(mb * 1048576) - cab.length - fin.length);
  return Buffer.concat([Buffer.from(cab), Buffer.alloc(relleno, 0x41), Buffer.from(fin)]);
}
// el Worker «ema-fotos» simulado (v2: docs/videos, por partes, rango; v1: solo fotos, /salud sin versión)
function worker(ctx, ver) {
  const W = { ver, R2: {}, put: [], gets: [], rangos: [], partes: 0, iniciar: 0, terminar: 0, sinRed: false, tokenMal: 0 };
  const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,PUT,POST,HEAD,OPTIONS', 'access-control-expose-headers': '*' };
  const js = (rq, st, o) => rq.fulfill({ status: st, contentType: 'application/json', headers: CORS, body: JSON.stringify(o) });
  const MP = {};
  ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => {
    const r = rq.request(), u = new URL(r.url()), m = r.method(), h = r.headers();
    if (W.sinRed) return rq.abort('internetdisconnected');
    if (m === 'OPTIONS') return rq.fulfill({ status: 204, headers: CORS, body: '' });
    if (u.pathname === '/salud') return js(rq, 200, W.ver === 'v2' ? { ok: true, version: 'v2-fotos', tipos: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm'], multipart: true, rango: true, r2: true, enlace: 'FOTOS' } : { ok: true });
    const tok = (h.authorization || '').replace(/^Bearer /, '') || u.searchParams.get('t') || '';
    if (!tok) { W.tokenMal++; return js(rq, 401, { ok: false, error: 'Tu sesión no es válida: cerrá y volvé a entrar a la app.' }); }
    if (u.pathname.startsWith('/f/')) {
      const key = decodeURIComponent(u.pathname.slice(3));
      if (W.ver !== 'v2' && !/^fotos\//.test(key)) return js(rq, 400, { ok: false, error: 'Solo fotos.' });
      if (m === 'PUT') { const b = r.postDataBuffer() || Buffer.alloc(0); W.put.push({ key, tam: b.length, tipo: h['content-type'] || '' }); W.R2[key] = { b, tipo: h['content-type'] || 'application/octet-stream' }; return js(rq, 200, { ok: true }); }
      if (m === 'GET' || m === 'HEAD') {
        const o = W.R2[key] || (/^fotos\//.test(key) ? { b: JPG, tipo: 'image/jpeg' } : null);
        W.gets.push({ key, rango: h.range || '' });
        if (!o) return js(rq, 404, { ok: false, error: 'No existe ese archivo.' });
        const rg = /bytes=(\d*)-(\d*)/.exec(h.range || '');
        if (rg) {
          const tam = o.b.length, ini = rg[1] === '' ? Math.max(0, tam - (+rg[2])) : +rg[1], fin = rg[1] === '' ? tam - 1 : rg[2] === '' ? Math.min(tam - 1, ini + 4194303) : Math.min(tam - 1, +rg[2]);   // como un servidor que entrega de a pedazos
          W.rangos.push({ key, ini, fin });
          return rq.fulfill({ status: 206, headers: Object.assign({ 'content-type': o.tipo, 'accept-ranges': 'bytes', 'content-range': `bytes ${ini}-${fin}/${tam}`, 'cache-control': 'private, max-age=604800' }, CORS), body: o.b.slice(ini, fin + 1) });
        }
        return rq.fulfill({ status: 200, headers: Object.assign({ 'content-type': o.tipo, 'accept-ranges': 'bytes', 'cache-control': 'private, max-age=604800' }, CORS), body: o.b });
      }
      return js(rq, 405, { ok: false, error: 'No se puede borrar desde acá.' });
    }
    if (u.pathname.startsWith('/m/') && W.ver === 'v2') {
      const key = decodeURIComponent(u.pathname.slice(3)), q = u.searchParams, ac = q.get('accion');
      if (m === 'POST' && ac === 'iniciar') { W.iniciar++; const id = 'up' + W.iniciar; MP[id] = { key, tipo: q.get('tipo'), partes: {} }; return js(rq, 200, { ok: true, key, id }); }
      if (m === 'PUT' && q.get('parte')) { const x = MP[q.get('id')]; if (!x) return js(rq, 404, { ok: false, error: 'no' }); const b = r.postDataBuffer() || Buffer.alloc(0); x.partes[+q.get('parte')] = b; W.partes++; return js(rq, 200, { ok: true, parte: +q.get('parte'), etag: 'e' + q.get('parte') + '_' + b.length }); }
      if (m === 'POST' && ac === 'terminar') { const x = MP[q.get('id')]; const j = JSON.parse(r.postData() || '{}'); if (!x || !j.partes) return js(rq, 400, { ok: false, error: 'faltan' }); W.terminar++; const b = Buffer.concat(j.partes.map((p) => x.partes[p.parte])); W.R2[key] = { b, tipo: x.tipo }; W.put.push({ key, tam: b.length, tipo: x.tipo, partes: j.partes.length }); return js(rq, 200, { ok: true, key, tam: b.length }); }
      if (m === 'POST' && ac === 'cancelar') return js(rq, 200, { ok: true });
    }
    return js(rq, 404, { ok: false, error: 'No existe esa dirección.' });
  });
  return W;
}
(function () { const { execSync } = require('child_process'); if (!fs.existsSync(MED + 'v75.webm')) execSync('ffmpeg -y -loglevel error -f lavfi -i "testsrc2=size=640x360:rate=15" -t 75 -c:v libvpx -b:v 300k -deadline realtime -cpu-used 8 -an ' + MED + 'v75.webm'); })();
(async () => {
  const c = prueba('v162' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'lucia', datos: datos160({}), cel, espera: 5000, v160: true, v150: true, v151: true, v152: true, v155: true, v157: true, v158: true, inicio: true, nav: true, https: true });
  A.W = worker(A.ctx, 'v2'); const p = A.page; p.on('dialog', (x) => x.accept());
  await p.evaluate(() => window.__archivosNube.revisar(true)); await p.waitForTimeout(800);
  const txt = (s) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const esperar = (fn, ms) => p.waitForFunction(fn, null, { timeout: ms || 20000, polling: 250 }).then(() => true, () => false);
  c(await p.evaluate(() => window.__archivosNube.TOPE_SEG === 60), 'el tope es 1 minuto (60 s)');
  await p.evaluate(() => mostrarVista('obras')); await p.waitForTimeout(600); await p.evaluate(() => window.abrirLegajo('q2'));
  await esperar(() => !!document.querySelector('[data-an="subirVideo"]'), 8000);
  await p.click('[data-an="subirVideo"]'); await p.waitForTimeout(400);
  const ay = await txt('#anOv');
  c(/hasta 1 minuto/.test(ay) && /5 MB por minuto/.test(ay), 'la hoja dice «Videos cortos: hasta 1 minuto… ≈ 5 MB por minuto»');
  await p.click('[data-an="elegir"]');
  await p.setInputFiles('#anVidGal', { name: 'largo.webm', mimeType: 'video/webm', buffer: fs.readFileSync(MED + 'v75.webm') });
  const er = await esperar(() => /tope es 1 minuto/.test((document.getElementById('anOv') || {}).textContent || ''), 20000);
  c(er && !A.W.put.some((x) => /^videos\//.test(x.key)), 'un video de 1:15 se rechaza («el tope es 1 minuto») y no se sube nada');
  await p.click('#anOv [data-an="x"]').catch(() => {}); await p.waitForTimeout(500);
  await p.click('[data-an="subirVideo"]'); await p.waitForTimeout(400); await p.click('[data-an="elegir"]');
  const V30 = fs.readFileSync(MED + 'v30.webm');
  await p.setInputFiles('#anVidGal', { name: 'obra.webm', mimeType: 'video/webm', buffer: V30 });
  const ok = await esperar(() => { const s = window.__archivosNube.estado().H; return s && (s.fase === 'listo' || s.fase === 'error'); }, 150000);
  const st = await p.evaluate(() => window.__archivosNube.estado().H);
  const d = JSON.parse(await p.evaluate(() => localStorage.getItem('stub.db'))), va = (d.adjuntos || {})[st.id] || {};
  console.log('    30 s: ' + (st.antes / 1048576).toFixed(1) + ' MB → ' + (st.despues / 1048576).toFixed(2) + ' MB · ' + va.w + '×' + va.h);
  c(ok && st.fase === 'listo' && st.despues > 0 && st.despues <= 2.5 * 1048576, 'video de 30 s: de 25 MB a ' + (st.despues / 1048576).toFixed(1) + ' MB (≤ 2,5 MB)');
  c(Math.max(va.w || 0, va.h || 0) === 854, 'sigue a 480p (lado mayor 854: ' + va.w + '×' + va.h + ')');
  await A.browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
