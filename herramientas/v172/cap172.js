// v172 · capturas de las 3 cámaras (barra / Modo obra / C) en 390×844 y 360×740, y qué tapa el botón de video.
// APP=… CAP=carpeta [V172=1] node cap172.js
const fs = require('fs');
const { abrir } = require('./h');
const { datos165 } = require('./datos165');
const CAP = process.env.CAP || './cap172';
const V172 = !!process.env.V172;
const camara = () => {
  window.__stubPorColeccion = true; window.__fotos = [];
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.enumerateDevices = async () => [{ kind: 'videoinput', deviceId: 'main', label: 'camera2 0, facing back', groupId: 'g', toJSON() { return this; } }];
  navigator.mediaDevices.getUserMedia = async () => {
    await new Promise((r) => setTimeout(r, 200));
    const c = document.createElement('canvas'); c.width = 1920; c.height = 1440; const x = c.getContext('2d');
    const dib = () => { x.fillStyle = '#7fa8c9'; x.fillRect(0, 0, 1920, 1440); x.fillStyle = '#5d6b4c'; x.fillRect(0, 900, 1920, 540); x.fillStyle = '#ddd'; x.fillRect(900, 200, 60, 900); };
    dib(); setInterval(dib, 300);
    const st = c.captureStream(8), t = st.getVideoTracks()[0];
    t.getCapabilities = () => ({}); t.applyConstraints = async () => { }; t.getSettings = () => ({ deviceId: 'main', width: 1920, height: 1440 });
    return st;
  };
};
const tapables = () => {
  const b = document.getElementById('anCamVid'), cam = document.getElementById('emaCam'); if (!cam) return { err: 'sin cámara' };
  const vis = (e) => { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || e.hidden) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight; };
  const R = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; };
  const nom = (e) => (e.id ? '#' + e.id : '') + (e.dataset && Object.keys(e.dataset).length ? '[' + Object.keys(e.dataset).map((k) => k + '=' + e.dataset[k]).join(',') + ']' : '') + (e.className && typeof e.className == 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' «' + (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 18) + '»';
  const els = [...cam.querySelectorAll('button, [role=button], input:not([type=file]), label, select, a, .zm-bar [data-zm]')].filter((e) => e !== b && !(b && b.contains(e)) && vis(e) && !e.closest('[hidden]'));
  const vb = b && vis(b) ? R(b) : null;
  const choca = (a, c) => a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h;
  const tapa = [], tapado = [];
  els.forEach((e) => {
    const r = R(e);
    if (vb && choca(vb, r)) tapa.push(nom(e) + ' ' + JSON.stringify(r));
    // el centro y las 4 esquinas adentro (3 px): ¿lo de arriba es él?
    const pts = [[r.x + r.w / 2, r.y + r.h / 2], [r.x + 3, r.y + 3], [r.x + r.w - 3, r.y + 3], [r.x + 3, r.y + r.h - 3], [r.x + r.w - 3, r.y + r.h - 3]];
    pts.forEach(([x, y]) => { if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return; const top = document.elementFromPoint(x, y); if (top && b && (top === b || b.contains(top))) tapado.push(nom(e)); });
  });
  const ab = cam.querySelector('.ec-abajo'); const abajo = ab ? [...ab.children].map((e) => nom(e).slice(0, 40) + ' ' + getComputedStyle(e).display + '/' + getComputedStyle(e).visibility + ' ' + JSON.stringify(R(e))) : []; const arriba = [...(cam.querySelector('.ec-arriba') || { children: [] }).children].map((e) => nom(e).slice(0, 30) + ' ' + getComputedStyle(e).display + ' ' + JSON.stringify(R(e)));
  return { abajo, arriba, abR: ab ? R(ab) : null, video: vb, enBarra: !!(b && b.closest('.ec-arriba, .ec-abajo, #cbPill, .an-camvid-sitio')), padre: b ? nom(b.parentElement) : '', tapa: [...new Set(tapa)], tapado: [...new Set(tapado)], n: els.length };
};
(async () => {
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, obraGps: true, camaraB: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v165: true, v166: true, v167: true, v168: true, v169: true, v170: true, v171: true, v172: V172 };
  fs.mkdirSync(CAP, { recursive: true });
  const out = [];
  for (const [w, h] of [[390, 844], [360, 740]]) {
    for (const modo of ['barra', 'obra', 'c']) {
      const A = await abrir(Object.assign({ datos: datos165(), sesion: 'juan', espera: 6000, antes: camara }, MOD, { cel: true, dpr: 2 }, modo === 'obra' ? { v165: false, v166: false } : {}));
      const p = A.page; p.on('dialog', (x) => x.accept());
      await p.setViewportSize({ width: w, height: h });
      await A.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' });
      await A.ctx.setGeolocation({ latitude: -31.4273, longitude: -64.1889, accuracy: 8 });
      await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true, version: 'v2-fotos' }) }));
      await p.waitForTimeout(800);
      const lista = () => p.waitForFunction(() => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0; }, null, { timeout: 20000 }).catch(() => { });
      if (modo === 'barra') { await p.evaluate(() => { const b = document.querySelector('#navN1 [data-n1="camara"]'); if (b) b.click(); else document.getElementById('menuCamara').click(); }); await lista(); await p.waitForFunction(() => !!document.getElementById('cbPill'), null, { timeout: 15000 }).catch(() => { }); }
      else {
        await p.evaluate(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(2500);
        await p.tap('#cdApp [data-cd="boton"]'); await p.waitForTimeout(900);
        if (modo === 'c') { await p.tap('#viOv [data-vi="iniciar"]').catch(() => { }); }
        else if (await p.$('#cdApp [data-cd="boton"]') && !(await p.$('#emaCam'))) await p.tap('#cdApp [data-cd="boton"]').catch(() => { });
        await lista();
      }
      await p.waitForTimeout(1800);
      const r = await p.evaluate(tapables);
      const n = `${w}x${h}_${modo}`;
      await p.screenshot({ path: `${CAP}/${n}.png` });
      out.push(n + ' ' + JSON.stringify(r));
      console.log(n, JSON.stringify(r));
      await A.browser.close();
    }
  }
  fs.writeFileSync(CAP + '/tapa.txt', out.join('\n') + '\n');
})();
