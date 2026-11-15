// v160 · PDF y videos (comprimidos) en Cloudflare R2, junto a las fotos.
//  1) oficina (Lucía): el servidor nuevo (/salud v2-fotos) · la planilla de PAT en PDF de 3 MB va a docs/ (en la base solo la
//     ficha: r2, tamaño, páginas) · ver = se baja del Worker · el certificado en PDF sin señal → queda en el celu (bandeja) → vuelve
//     la señal → sube solo · legajo «🎥 Videos y PDF»: PDF suelto, video de 30 s achicado en el celu (tamaño antes/después) con su
//     miniatura en fotosObra (tipo video) y la ficha en adjuntos, reproductor con ▶ y adelantar (pedidos por rango, 206).
//  2) video grande por partes (el aparato no achica: sube el original de 112 MB en partes de 10 MB) y el remito / docs topes.
//  3) cuadrilla (Raúl, celu): «🎥 Video» en Modo obra con la columna → achicado, subido, campo.videos en la orden (no campo.fotos:
//     la verificación v150 no lo cuenta), aparece en la hoja de esa columna del avance nuevo (v158) como evidencia; Mis tareas
//     clásica con su botón; la cámara de la app con «🎥 Video».
//  4) permisos: «solo mirar», Dirección y pañol ven la sección y el reproductor pero no suben.
//  5) servidor viejo (v1): todo como hoy (PDF hasta 650 KB en la base, botones «falta actualizar el servidor de fotos»).
//  6) apagado (__v160No): sin sección ni botones, PDF hasta 650 KB como antes.
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
(async () => {
  const c = prueba('v160' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v160: true, v150: true, v151: true, v152: true, v155: true, v157: true, v158: true, inicio: true, nav: true, https: true };
  let browser = null;
  const sesion = async (quien, op) => {
    op = op || {};
    const A = await abrir(Object.assign({ sesion: quien, datos: datos160(op), browser }, MOD, op)); browser = A.browser;
    A.W = worker(A.ctx, op.ver || 'v2');
    A.page.on('dialog', (x) => x.accept());
    await A.page.evaluate(() => window.__archivosNube && window.__archivosNube.revisar(true)); await A.page.waitForTimeout(800);
    return A;
  };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const ver = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden'; }, sel);
  const txt = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const esperar = (p, fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 20000, polling: 250 }).then(() => true, () => false);
  const bandeja = (p) => p.evaluate(() => new Promise((ok) => { const r = indexedDB.open('ema-archivos', 1); r.onupgradeneeded = () => r.result.createObjectStore('a', { keyPath: 'id' }); r.onsuccess = () => { const q = r.result.transaction('a').objectStore('a').getAll(); q.onsuccess = () => ok(q.result.map((x) => ({ id: x.id, tipo: x.tipo, fase: x.fase, tam: x.blob && x.blob.size }))); q.onerror = () => ok([]); }; r.onerror = () => ok([]); }));
  const foto = async (p, nombre, sel) => { if (!CAP) return; if (sel) await p.evaluate((s) => { const e = document.querySelector(s); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); }, sel); await p.waitForTimeout(400); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png' }); };
  const legajo = async (p, id) => { await p.evaluate(() => mostrarVista('obras')); await p.waitForTimeout(600); await p.evaluate((x) => window.abrirLegajo(x), id); return esperar(p, () => !!document.getElementById('lgVidSec'), null, 8000); };
  const MBx = (n) => (n / 1048576).toFixed(1).replace('.', ',') + ' MB';

  if (SOLO('1')) {
    const A = await sesion('lucia'); const p = A.page;
    c(await p.evaluate(() => window.__archivosNube.v2()), 'el servidor de fotos dice v2-fotos → la app usa lo nuevo');
    // la planilla de PAT en PDF de 3 MB
    await p.evaluate(() => window.__docObra.hoja('q2', 'pat', 'cargar')); await p.waitForTimeout(300);
    c(/hasta 25 MB/.test(await txt(p, '#dcOv')), 'la hoja de la documentación dice «El PDF, hasta 25 MB (va a la nube…)»');
    const P3 = pdf(3, 3);
    await p.setInputFiles('#dcArchivo', { name: 'PAT_las_rosas.pdf', mimeType: 'application/pdf', buffer: P3 });
    const ok1 = await esperar(p, () => /Guardado/.test((document.getElementById('dcMsg') || {}).textContent || '') || !document.getElementById('dcOv'), null, 30000);
    await p.waitForTimeout(1200);
    const d1 = await db(p), pat = ((d1.avanceObras.q2.documentos || {}).pat) || {}, adj = (d1.adjuntos || {})[pat.adjId] || {};
    const put1 = A.W.put.find((x) => /^docs\//.test(x.key)) || {};
    c(ok1 && pat.ok && pat.tipoArch === 'pdf' && put1.tam === P3.length && put1.tipo === 'application/pdf' && /^docs\/\d{4}\/\d\d\/q2\//.test(put1.key), 'PDF de 3 MB → al Worker en docs/AAAA/MM/q2/… (' + MBx(put1.tam || 0) + ', application/pdf)');
    c(adj.r2 === put1.key && !adj.dataUrl && adj.bytes === P3.length && adj.paginas === 3 && adj.mime === 'application/pdf' && JSON.stringify(adj).length < 2000, 'en la base solo la ficha: r2, tamaño, 3 páginas, sin el archivo (' + JSON.stringify(adj).length + ' bytes)');
    // ver: se baja del Worker
    const dl = p.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    await p.evaluate((id) => window.__docObra.verArchivo(id), pat.adjId);
    const d = await dl;
    c(!!d && A.W.gets.some((g) => g.key === put1.key), 'ver el PDF lo baja del Worker (' + (d ? d.suggestedFilename() : 'sin descarga') + ')');
    // el certificado sin señal → bandeja → sube solo
    await p.evaluate(() => window.__docObra.hoja('q2', 'cert', 'cargar')); await p.waitForTimeout(300);
    A.W.sinRed = true; await A.ctx.setOffline(true);
    const P2 = pdf(2, 2);
    await p.setInputFiles('#dcArchivo', { name: 'certificado.pdf', mimeType: 'application/pdf', buffer: P2 });
    const ok2 = await esperar(p, () => /quedó en el celu/.test((document.getElementById('dcMsg') || {}).textContent || ''), null, 40000);
    const b1 = await bandeja(p), d2 = await db(p), cert = ((d2.avanceObras.q2.documentos || {}).cert) || {};
    c(ok2 && b1.length === 1 && b1[0].tipo === 'pdf' && b1[0].tam === P2.length && cert.adjId === b1[0].id && !(d2.adjuntos || {})[cert.adjId], 'sin señal: «quedó en el celu» · 1 PDF en la bandeja (' + MBx(b1[0] ? b1[0].tam : 0) + ') · el documento anotado · nada entero en la base');
    c(!Object.values(d2.adjuntos || {}).some((x) => /^data:application\/pdf/.test(x.dataUrl || '')), 'ningún PDF entero en la base');
    await A.ctx.setOffline(false); A.W.sinRed = false;
    await p.evaluate(() => window.dispatchEvent(new Event('online')));
    const ok3 = await esperar(p, (id) => { const x = JSON.parse(localStorage.getItem('stub.db')).adjuntos || {}; return !!(x[id] && x[id].r2); }, cert.adjId, 40000);
    const b2 = await bandeja(p);
    c(ok3 && b2.length === 0 && A.W.put.some((x) => /^docs\//.test(x.key) && x.tam === P2.length), 'vuelve la señal → sube solo a docs/ y sale de la bandeja');
    // legajo: «🎥 Videos y PDF»
    c(await legajo(p, 'q2'), 'el legajo tiene la sección «🎥 Videos y PDF»');
    c(await ver(p, '[data-an="subirVideo"]') && await ver(p, '[data-an="subirPdf"]'), 'la oficina ve «🎥 Subir video» y «📎 Subir PDF»');
    await p.click('[data-an="subirPdf"]').catch(() => {});
    await p.setInputFiles('#anPdfIn', { name: 'memoria_descriptiva.pdf', mimeType: 'application/pdf', buffer: pdf(1.2, 5) });
    const ok4 = await esperar(p, () => /PDF guardado/.test((document.getElementById('anLgMsg') || {}).textContent || ''), null, 25000);
    await p.waitForTimeout(800);
    c(ok4 && /memoria_descriptiva\.pdf/.test(await txt(p, '#lgVidSec')) && /5 hojas/.test(await txt(p, '#lgVidSec')), 'PDF suelto del legajo: subido y en la lista con sus 5 hojas');
    // video de 30 s: achicar en el celu
    await p.click('[data-an="subirVideo"]'); await p.waitForTimeout(400);
    c(await ver(p, '#anOv') && await ver(p, '#anOv [data-an="grabar"]') && /Col 1/.test(await txt(p, '#anCol')), 'hoja «🎥 Video de obra» con «Grabar» / «Elegir» y la columna para elegir');
    await p.selectOption('#anCol', 'Col 2');
    const V30 = fs.readFileSync(MED + 'v30.webm');
    const t0 = Date.now();
    await p.click('[data-an="elegir"]');
    await p.setInputFiles('#anVidGal', { name: 'obra.webm', mimeType: 'video/webm', buffer: V30 });
    const ach = await esperar(p, () => /Achicando/.test((document.getElementById('anPaso') || {}).textContent || ''), null, 15000);
    await foto(p, 'video_achicando', '#anOv .v7-caja');
    const ok5 = await esperar(p, () => { const s = window.__archivosNube.estado().H; return s && (s.fase === 'listo' || s.fase === 'error'); }, null, 150000);
    const st = await p.evaluate(() => window.__archivosNube.estado().H);
    const vput = A.W.put.find((x) => /^videos\//.test(x.key)) || {};
    console.log('    video de 30 s: antes ' + MBx(st.antes) + ' → después ' + MBx(st.despues) + ' en ' + Math.round((Date.now() - t0) / 1000) + ' s · ' + (st.txt || ''));
    c(ach && ok5 && st.fase === 'listo' && st.despues > 0 && st.despues < st.antes * 0.4 && Math.abs(st.dur - 30) < 1.5, 'video de 30 s achicado en el celu: ' + MBx(st.antes) + ' → ' + MBx(st.despues) + ' (' + Math.round(st.despues / st.antes * 100) + ' %)');
    c(vput.tam === st.despues && vput.tipo === 'video/webm' && /^videos\/\d{4}\/\d\d\/q2\/.+\.webm$/.test(vput.key), 'subido al Worker en videos/…/q2/….webm (' + MBx(vput.tam || 0) + ')');
    await foto(p, 'video_listo', '#anOv .v7-caja');
    const d3 = await db(p), va = (d3.adjuntos || {})[st.id] || {}, vf = (d3.fotosObra || {})[st.id] || {};
    c(va.tipo === 'video' && va.r2 === vput.key && va.comprimido === true && va.bytesOriginal === V30.length && va.num === 'Col 2' && !va.dataUrl, 'ficha en adjuntos: tipo video, r2, achicado, peso original, Col 2');
    c(vf.tipo === 'video' && vf.adjId === st.id && /^data:image\/jpeg/.test(vf.mini || '') && Math.abs(vf.dur - 30) < 1.5 && vf.bytes === st.despues && vf.plazaId === 'q2', 'miniatura (primer cuadro) en fotosObra con tipo video, duración ' + vf.dur + ' s y peso');
    await p.click('#anOv [data-an="x"]').catch(() => {}); await p.waitForTimeout(600);
    const lg = await txt(p, '#lgVidSec');
    c(/Videos \(1\)/.test(lg) && await p.evaluate(() => !!document.querySelector('#lgVidSec [data-anver] .an-play')), 'el legajo muestra el video con ▶ (' + lg.slice(0, 90) + ')');
    c(!(await p.evaluate(() => [...document.querySelectorAll('#lgFotos [data-lgfoto]')].some((e) => /video/i.test(e.outerHTML)))), 'el video no aparece entre las fotos del legajo');
    await foto(p, 'legajo_videos', '#lgVidSec');
    // reproductor: adelantar con rango
    await p.click('#lgVidSec [data-anver]'); await p.waitForTimeout(500);
    const src = await p.evaluate(() => (document.querySelector('#anVer video') || {}).src || '');
    c(await ver(p, '#anVer video') && /\/f\/videos\/.+\?t=/.test(src), 'reproductor con la dirección del Worker (?t=)');
    const sk = await p.evaluate(() => new Promise((ok) => { const v = document.querySelector('#anVer video'); let hecho = false; const fin = (r) => { if (!hecho) { hecho = true; ok(r); } }; v.muted = true; const ir = () => { v.currentTime = 20; }; v.addEventListener('seeked', () => fin({ t: v.currentTime, d: v.duration }), { once: true }); if (v.readyState >= 1) ir(); else v.addEventListener('loadedmetadata', ir, { once: true }); setTimeout(() => fin({ t: v.currentTime, d: v.duration, err: v.error && v.error.code }), 15000); }));
    c(sk.t > 19 && sk.d > 28 && A.W.rangos.length > 0, 'adelantar a 0:20 anda (duración ' + Math.round(sk.d) + ' s, ' + A.W.rangos.length + ' pedidos por rango con 206)');
    await foto(p, 'reproductor', '#anVer .v7-caja');
    c(await ver(p, '#anVer [data-an="bajar"]') && await ver(p, '#anVer [data-an="compartir"]') && await ver(p, '#anVer [data-an="mover"]'), 'reproductor con «⬇ Bajar», «📤 Compartir» y «↔ Mover» (oficina)');
    const dl2 = p.waitForEvent('download', { timeout: 20000 }).catch(() => null);
    await p.click('#anVer [data-an="bajar"]');
    const dd = await dl2;
    c(!!dd && /\.webm$/.test(dd.suggestedFilename()), 'bajar el video (' + (dd ? dd.suggestedFilename() : '-') + ')');
    c(await scrollX(p) <= 0, 'sin scroll de costado');
    c(A.errores.length === 0, 'sin errores (' + A.errores.slice(0, 3).join(' | ') + ')');
    await A.ctx.close();
  }

  if (SOLO('2')) {
    const A = await sesion('lucia', { antes: () => { window.__anNoComprime = true; } }); const p = A.page;
    await legajo(p, 'q2');
    await p.click('[data-an="subirVideo"]'); await p.waitForTimeout(300);
    const VG = fs.readFileSync(MED + 'vgrande.webm');
    await p.click('[data-an="elegir"]');
    await p.setInputFiles('#anVidGal', MED + 'vgrande.webm');
    const ok = await esperar(p, () => { const s = window.__archivosNube.estado().H; return s && (s.fase === 'listo' || s.fase === 'error'); }, null, 150000);
    const st = await p.evaluate(() => window.__archivosNube.estado().H), pg = A.W.put.find((x) => /^videos\//.test(x.key)) || {};
    c(ok && st.fase === 'listo' && /no puede achicar/.test(st.txt), 'el aparato no puede achicar: avisa y sube el original (' + (st.txt || '').slice(0, 80) + ')');
    c(A.W.iniciar === 1 && A.W.terminar === 1 && pg.partes === Math.ceil(VG.length / 10485760) && pg.tam === VG.length, 'video grande (' + MBx(VG.length) + ') por partes: ' + (pg.partes || 0) + ' partes de 10 MB, juntado entero en el Worker');
    // rango sobre el grande
    const id = st.id;
    await p.evaluate((x) => window.__archivosNube.ver(x), id); await p.waitForTimeout(600);
    const sk = await p.evaluate(() => new Promise((ok) => { const v = document.querySelector('#anVer video'); let h = false; const fin = (r) => { if (!h) { h = true; ok(r); } }; v.muted = true; const ir = () => { v.currentTime = 25; }; v.addEventListener('seeked', () => fin({ t: v.currentTime }), { once: true }); if (v.readyState >= 1) ir(); else v.addEventListener('loadedmetadata', ir, { once: true }); setTimeout(() => fin({ t: v.currentTime }), 15000); }));
    const rgG = A.W.rangos.filter((r) => r.key === pg.key);
    c(sk.t > 24 && rgG.length > 0 && rgG.every((r) => r.fin - r.ini + 1 < VG.length), 'adelantar el grande pide solo pedazos (' + rgG.length + ' rangos, ninguno entero)');
    // remito: el PDF del remito ahora hasta 25 MB
    c(await p.evaluate(() => window.__archivosNube.topePdf() === 25 * 1048576), 'tope del PDF (remitos, documentación) = 25 MB con el servidor nuevo');
    const rem = await p.evaluate(async (b64) => { const id = await window.fbAdjuntoGuardar({ tipo: 'remito', remito: '0001-123', proveedor: 'Electro', dataUrl: 'data:application/pdf;base64,' + b64, bytes: 1, nombre: 'remito.pdf', mime: 'application/pdf' }); return id; }, pdf(1, 2).toString('base64'));
    await p.waitForTimeout(800);
    const dr = (await db(p)).adjuntos[rem] || {};
    c(/^docs\//.test(dr.r2 || '') && !dr.dataUrl && dr.tipo === 'remito' && dr.proveedor === 'Electro', 'un PDF de remito por fbAdjuntoGuardar va a docs/ (ficha sin el archivo)');
    c(A.errores.length === 0, 'sin errores (' + A.errores.slice(0, 3).join(' | ') + ')');
    await A.ctx.close();
  }

  if (SOLO('3')) {
    const A = await sesion('raul', { cel: true, crew: true }); const p = A.page;
    await p.evaluate(() => { window.__cuadrillaDia.elegirOt('o160'); window.__cuadrillaDia.ir('obra'); }); await p.waitForTimeout(900);
    // Llegué (sin GPS)
    await p.evaluate(() => { const b = document.querySelector('[data-cd="boton"]'); b && b.click(); }); await p.waitForTimeout(1200);
    c(await ver(p, '[data-anvid="obra"]'), 'Modo obra tiene «🎥 Video»');
    const num = await p.evaluate(() => (document.querySelector('[data-anvid="obra"]') || {}).dataset.num || '');
    await p.click('[data-anvid="obra"]'); await p.waitForTimeout(400);
    const col = await p.evaluate(() => (document.getElementById('anCol') || {}).value || '');
    c(await ver(p, '#anOv') && col === num && col === 'Col 1' && await p.evaluate(() => (document.getElementById('anTarea') || {}).value === 'montaje_prfv'), 'la hoja viene con la tarea y la columna de Modo obra (' + col + ')');
    await foto(p, 'cuadrilla_video', '#anOv .v7-caja');
    await p.click('[data-an="grabar"]');
    await p.setInputFiles('#anVidCam', { name: 'VID_2026.webm', mimeType: 'video/webm', buffer: fs.readFileSync(MED + 'v8.webm') });
    const ok = await esperar(p, () => { const s = window.__archivosNube.estado().H; return s && (s.fase === 'listo' || s.fase === 'error'); }, null, 90000);
    const st = await p.evaluate(() => window.__archivosNube.estado().H);
    console.log('    video de 8 s (cuadrilla): ' + MBx(st.antes) + ' → ' + MBx(st.despues));
    c(ok && st.fase === 'listo' && st.despues < st.antes, 'la cuadrilla graba, se achica (' + MBx(st.antes) + ' → ' + MBx(st.despues) + ') y sube');
    await p.waitForTimeout(1500);
    const d = await db(p), o = d.ordenesTrabajo.o160, cv = ((o.campo || {}).videos || {})[st.id] || {}, fo = (d.fotosObra || {})[st.id] || {};
    c(cv.num === 'Col 1' && cv.k === 'montaje_prfv' && /^data:image/.test(cv.mini || '') && !((o.campo || {}).fotos || {})[st.id], 'en la orden: campo.videos (Col 1, mini) y NO campo.fotos');
    c(fo.tipo === 'video' && fo.otId === 'o160' && fo.num === 'Col 1' && fo.por === 'Raúl Díaz', 'fotosObra con la orden y la columna (como una foto más, sin contar)');
    const vf = await p.evaluate(() => { try { const o = ordenesTrabajo.find((x) => x.id === 'o160'); const v = window.__verifOt && window.__verifOt.verifTarea(o, 'montaje_prfv'); return v ? { fotos: v.fotos != null ? v.fotos : (v.conFoto || 0), est: v.est || v.estado || '' } : null; } catch (e) { return { err: String(e) }; } });
    c(!vf || !(vf.fotos > 0), 'la verificación (v150) no cuenta el video como foto de la columna (' + JSON.stringify(vf) + ')');
    await p.click('#anOv [data-an="x"]').catch(() => {});
    // la cámara de la app: «🎥 Video»
    await p.evaluate(() => { const d = document.createElement('div'); d.id = 'emaCam'; d.className = 'ec-cb'; d.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9000'; document.body.appendChild(d); }); await p.waitForTimeout(500);
    c(await ver(p, '#anCamVid'), 'la cámara de la app tiene el botón «🎥 Video»');
    await p.evaluate(() => { const e = document.getElementById('emaCam'); e && e.remove(); });
    c(A.errores.length === 0, 'sin errores (' + A.errores.slice(0, 3).join(' | ') + ')');
    // la oficina (otra pestaña, misma base) ve el video en la hoja de esa columna del avance nuevo (evidencia, no foto)
    const C = await abrir(Object.assign({}, MOD, { sesion: 'lucia', browser, ctx: A.ctx })); const r = C.page;
    await r.evaluate(() => window.__archivosNube.revisar(true)); await r.waitForTimeout(600);
    await r.evaluate(() => { mostrarVista('avance'); }); await r.waitForTimeout(600);
    await r.evaluate(() => { try { verAvanceDetalle('q2'); } catch (e) { } }); await r.waitForTimeout(1200);
    await r.evaluate(() => window.fbFotosObraDe('q2')); await r.waitForTimeout(300);
    const i0 = await r.evaluate(() => { const E = window.__av2.estado(avanceObras.find((x) => x.id === 'q2')); return E && E.L ? E.L.cols.findIndex((x) => /Col 1$/.test(x.num)) : -1; });
    await r.evaluate((i) => window.__av2.abrirColumna('q2', i), i0); await r.waitForTimeout(1500);
    const ev = await r.evaluate(() => { const e = document.querySelector('.an-evid'); return e ? e.textContent.replace(/\s+/g, ' ') : ''; });
    c(i0 >= 0 && /Videos y PDF de .*Col 1/.test(ev) && await r.evaluate((id) => !!document.querySelector('.an-evid [data-anver="' + id + '"]'), st.id), 'avance nuevo: la hoja de Col 1 muestra el video como evidencia (' + ev.slice(0, 70) + ')');
    await foto(r, 'avance_columna_evidencia', '.an-evid');
    await A.ctx.close();
    // Mis tareas clásica
    const B = await sesion('raul', { cel: true }); const q = B.page;
    await q.evaluate(() => mostrarVista('mistareas')); await q.waitForTimeout(1500);
    c(await q.evaluate(() => !!document.querySelector('[data-anvid="ot"][data-ot="o160"]')), 'Mis tareas clásica: «🎥 Video» en la orden');
    await B.ctx.close();
  }

  if (SOLO('4')) {
    for (const [u, nom] of [['mir', 'solo mirar'], ['dir', 'Dirección'], ['pan', 'pañol']]) {
      const A = await sesion(u, { conVideo: true }); const p = A.page;
      void 0;
      const hay = await legajo(p, 'q2');
      await p.waitForTimeout(3500);
      if (!hay) { c(u === 'pan', nom + ': no abre legajos (sin la hoja de Obras)'); await A.ctx.close(); continue; }
      c(!(await ver(p, '[data-an="subirVideo"]')) && !(await ver(p, '[data-an="subirPdf"]')), nom + ': ve «🎥 Videos y PDF» sin los botones de subir');
      const v = await p.evaluate(() => !!document.querySelector('#lgVidSec [data-anver="vid1"]'));
      if (v) { await p.click('#lgVidSec [data-anver="vid1"]'); await p.waitForTimeout(500); }
      c(v && await ver(p, '#anVer video') && !(await ver(p, '#anVer [data-an="mover"]')), nom + ': mira el video (sin «↔ Mover»)');
      c(await p.evaluate(() => !window.__archivosNube.puedeSubirVideo()), nom + ': no puede subir videos');
      await A.ctx.close();
    }
  }

  if (SOLO('5')) {
    const A = await sesion('lucia', { ver: 'v1' }); const p = A.page;
    c(await p.evaluate(() => !window.__archivosNube.v2() && window.__archivosNube.topePdf() === 650 * 1024), 'servidor viejo (v1): sin lo nuevo, PDF hasta 650 KB');
    await legajo(p, 'q2');
    c(/falta actualizar el servidor de fotos/i.test(await txt(p, '#lgVidSec')) && !(await ver(p, '[data-an="subirVideo"]')), 'el legajo dice «Falta actualizar el servidor de fotos» (sin botones de subir)');
    await p.evaluate(() => window.__docObra.hoja('q2', 'pat', 'cargar')); await p.waitForTimeout(300);
    await p.setInputFiles('#dcArchivo', { name: 'PAT.pdf', mimeType: 'application/pdf', buffer: pdf(3, 3) });
    await p.waitForTimeout(1200);
    c(/650 KB/.test(await txt(p, '#dcMsg')) && !A.W.put.length, 'PDF de 3 MB rechazado como antes («la app guarda hasta 650 KB»), nada al Worker');
    await A.ctx.close();
  }

  if (SOLO('6')) {
    const A = await abrir(Object.assign({ sesion: 'lucia', datos: datos160(), browser }, MOD, { v160: false })); browser = A.browser;
    const W = worker(A.ctx, 'v2'); const p = A.page; await p.waitForTimeout(1500);
    await p.evaluate(() => mostrarVista('obras')); await p.waitForTimeout(500); await p.evaluate(() => window.abrirLegajo('q2')); await p.waitForTimeout(2500);
    c(!(await p.evaluate(() => !!document.getElementById('lgVidSec'))) && !(await p.evaluate(() => window.__archivosNube.v2())), 'apagado (__v160No): sin la sección ni lo nuevo');
    await p.evaluate(() => window.__docObra.hoja('q2', 'pat', 'cargar')); await p.waitForTimeout(300);
    c(/650 KB/.test(await txt(p, '#dcOv')), 'apagado: la documentación sigue con el PDF hasta 650 KB');
    void W;
    await A.ctx.close();
  }
  if (browser) await browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
