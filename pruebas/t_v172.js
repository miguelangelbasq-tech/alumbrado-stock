// v172 · dos cosas de la cámara (Ángel 18/11). Juan (cuadrilla) siempre en el celu (390×844 y 360×740), CPU ×4, la cámara de
// mentira, datos165 (LOS ÁLAMOS Col 1–8; OT-2026-165 de hoy: pozo Col 6–8, izaje Col 2–3, zanja 10 m).
//  0) el «🎥 Video»: en las tres cámaras (la de la barra, Modo obra y la C de la v165) y en los dos tamaños, en la fila de abajo
//     (no flota) y no tapa nada que se toca (‹ › de la fila, botones, disparador, Listo, zoom, Terminé, Col ▾, miniaturas):
//     cajas y elementFromPoint en el centro y las esquinas de cada uno; «›» anda con el dedo; el video abre su hoja con la obra.
//     ANTES=1 (contra la v171): el video tapa «›» y «PAT».
//  1) cámara de la barra: Tablero → otra vez → «Tablero ___» (✕, 1 2 3 E roto) → «1» → la foto «Tablero 1» (fotosObra, sin
//     tarea); la siguiente también; «roto» escrito → «Tablero roto»; lo último en ema.foto.sufijos; «Sacar» vuelve a «Tablero»;
//     Columna «base» → «Col 6 base», ‹ › → «Col 7 base» → la foto suelta (no cuenta la Col 7).
//  2) Modo obra: Tablero → «E» → la foto «Tablero E» en la orden (campo.fotos, suelta) y la siguiente igual.
//  3) cámara C: Columna «base» → «Col 6 base» → la foto (suelta) y no salta sola a la Col 7.
//  4) «＋ Otra foto» (v171): Tablero elige (✎ y «Sacar la foto · Tablero») → otra vez → «1» → la foto «Tablero 1» (otra171);
//     la próxima vez sigue elegido «Tablero 1»; la oficina (Lucía) la ve en el «📸 Avance» y en el legajo.
//  5) __v172No: el video flota como antes, el segundo toque no abre nada, la hoja «＋ Otra foto» saca al toque.
const fs = require('fs');
const { abrir, prueba } = require('./h');
const { datos165 } = require('./datos165');
const CAP = process.env.CAP || '';
const ANTES = !!process.env.ANTES;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const FOTO = __dirname + '/foto.jpg';
const camara = () => {
  window.__stubPorColeccion = true;
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.enumerateDevices = async () => [{ kind: 'videoinput', deviceId: 'main', label: 'camera2 0, facing back', groupId: 'g', toJSON() { return this; } }];
  navigator.mediaDevices.getUserMedia = async () => {
    await new Promise((r) => setTimeout(r, 200));
    const c = document.createElement('canvas'); c.width = 1280; c.height = 960; const x = c.getContext('2d');
    const dib = () => { x.fillStyle = '#7fa8c9'; x.fillRect(0, 0, 1280, 960); x.fillStyle = '#5d6b4c'; x.fillRect(0, 600, 1280, 360); x.fillStyle = '#ddd'; x.fillRect(600, 130, 40, 600); };
    dib(); setInterval(dib, 300);
    const st = c.captureStream(8), t = st.getVideoTracks()[0];
    t.getCapabilities = () => ({}); t.applyConstraints = async () => { }; t.getSettings = () => ({ deviceId: 'main', width: 1280, height: 960 });
    return st;
  };
};
// qué tapa el botón de video: cajas y lo que hay arriba en el centro y las 4 esquinas de cada cosa que se toca
const tapables = () => {
  const b = document.getElementById('anCamVid'), cam = document.getElementById('emaCam'); if (!cam) return { err: 'sin cámara' };
  const vis = (e) => { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || e.hidden) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight; };
  const R = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const nom = (e) => (e.id ? '#' + e.id : '') + (e.dataset && Object.keys(e.dataset).length ? '[' + Object.keys(e.dataset).map((k) => k + '=' + e.dataset[k]).join(',') + ']' : '') + ' «' + (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 14) + '»';
  const els = [...cam.querySelectorAll('button, [role=button], input:not([type=file]), label, select, a, .vi-thumbs img, #viThumbs > *')].filter((e) => e !== b && !(b && b.contains(e)) && vis(e));
  const vb = b && vis(b) ? R(b) : null;
  const choca = (a, c) => a.x < c.x + c.w - 0.5 && c.x < a.x + a.w - 0.5 && a.y < c.y + c.h - 0.5 && c.y < a.y + a.h - 0.5;
  const tapa = [], tapado = [];
  els.forEach((e) => {
    const r = R(e);
    if (vb && choca(vb, r)) tapa.push(nom(e));
    [[r.x + r.w / 2, r.y + r.h / 2], [r.x + 3, r.y + 3], [r.x + r.w - 3, r.y + 3], [r.x + 3, r.y + r.h - 3], [r.x + r.w - 3, r.y + r.h - 3]].forEach(([x, y]) => { if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return; const top = document.elementFromPoint(x, y); if (top && b && (top === b || b.contains(top))) tapado.push(nom(e)); });
  });
  const ab = cam.querySelector('.ec-abajo');
  // el video tampoco queda debajo de otra cosa (se toca)
  let videoLibre = false; if (vb) { const top = document.elementFromPoint(vb.x + vb.w / 2, vb.y + vb.h / 2); videoLibre = !!top && (top === b || b.contains(top)); }
  return { video: vb, enFila: !!(b && ab && b.parentElement === ab), arriba: !!(b && b.parentElement && b.parentElement.classList.contains('ec-arriba')), pos: b ? getComputedStyle(b).position : '', tapa: [...new Set(tapa)], tapado: [...new Set(tapado)], n: els.length, videoLibre, zoom: !!document.querySelector('#zmBar [data-zm="2"]') };
};
(async () => {
  const c = prueba('v172' + (ANTES ? ' antes' : '') + (process.argv[2] === 'cel' ? ' cel' : ''));
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, obraGps: true, camaraB: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v164: true, v165: true, v166: true, v167: true, v168: true, v169: true, v170: true, v171: true, v172: !ANTES, reglas: !!process.env.REGLAS, antes: camara };
  let browser = null;
  const sesion = async (quien, op, tam) => {
    const A = await abrir(Object.assign({ sesion: quien, datos: datos165(), browser, espera: 4500 }, MOD, { cel: true, dpr: 2 }, op || {})); browser = A.browser;
    const p = A.page; p.on('dialog', (x) => x.accept());
    if (tam) await p.setViewportSize({ width: tam[0], height: tam[1] });
    await A.ctx.grantPermissions(['geolocation', 'camera'], { origin: 'https://app.test' }); await A.ctx.setGeolocation({ latitude: -31.4273, longitude: -64.1889, accuracy: 8 });
    await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true, version: 'v2-fotos' }) }));
    const cdp = await A.ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.waitForTimeout(800);
    A.esperar = (fn, arg, ms) => p.waitForFunction(fn, arg, { timeout: ms || 20000, polling: 100 }).then(() => true, () => false);
    A.camLista = () => A.esperar(() => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0; });
    return A;
  };
  const otra = async (A, quien) => { const B = await abrir(Object.assign({ sesion: quien, browser: A.browser, ctx: A.ctx, espera: 4500 }, MOD, { cel: false })); B.page.on('dialog', (x) => x.accept()); return B; };
  const foto = async (p, n) => { if (!CAP) return; fs.mkdirSync(CAP, { recursive: true }); await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + n + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|internetdisconnected|prueba|sin permiso|Sin permiso/i.test(e));
  const tx = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const hoyDe = (p) => p.evaluate(() => fechaAISO(new Date()));
  const reloj = (p, hoy, hm) => p.evaluate(([d, h]) => { window.__tcAhora = () => new Date(d + 'T' + h + ':00').getTime(); }, [hoy, hm]);
  const camB = async (A) => { await A.page.evaluate(() => { const b = document.querySelector('#navN1 [data-n1="camara"]'); if (b) b.click(); else document.getElementById('menuCamara').click(); }); await A.camLista(); await A.esperar(() => !!document.getElementById('cbPill'), null, 15000); await A.page.waitForTimeout(900); };
  const modoObra = async (A, iniciar) => {
    const p = A.page; await p.evaluate(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(2500);
    await p.tap('#cdApp [data-cd="boton"]'); await p.waitForTimeout(900);
    if (iniciar) await p.tap('#viOv [data-vi="iniciar"]').catch(() => { });
    else if (!(await p.$('#emaCam')) && (await p.$('#cdApp [data-cd="boton"]'))) await p.tap('#cdApp [data-cd="boton"]').catch(() => { });
    await A.camLista(); await p.waitForTimeout(1500);
  };
  const fotosObra = (p, num) => p.evaluate((n) => Object.values(window.__stubDB().fotosObra || {}).filter((f) => f.num === n).map((f) => ({ cat: f.cat, k: f.k || '', otId: f.otId || '', num: f.num })), num);
  const campoFotos = (p, num) => p.evaluate((n) => Object.values(((ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {}).fotos || {}).filter((f) => f && f.num === n && !f.borrada).map((f) => ({ cat: f.cat, k: f.k || '', otra171: !!f.otra171, sub: !!f.subiendo })), num);
  const disparar = async (A, num) => { const p = A.page; const cu = (n) => p.evaluate((n) => Object.values(window.__stubDB().fotosObra || {}).filter((f) => f.num === n).length, n); const k = await cu(num); await p.tap('#emaCam [data-ec="disparar"]'); return A.esperar(([n, k]) => Object.values(window.__stubDB().fotosObra || {}).filter((f) => f.num === n).length > k, [num, k], 25000); };
  const nombreCam = (p) => p.evaluate(() => { const b = document.querySelector('#cbPanel .cb-nt b, #fnFila .fn-nt b'); const i = window.camaraApp && window.camaraApp.inp && window.camaraApp.inp(); return { que: b ? b.textContent.trim() : '', fln: i ? i.dataset.fln || '' : '', k: i ? i.dataset.k || '' : '', suelta: i ? i.dataset.fnSuelta || '' : '' }; });
  const sfInfo = (p) => p.evaluate(() => { const d = document.getElementById('sfOv'); if (!d) return null; return { rol: d.getAttribute('role'), x: !!d.querySelector('[aria-label="Cerrar"]'), ops: [...d.querySelectorAll('[data-sfv]')].map((b) => b.textContent.trim()), min: Math.min.apply(null, [...d.querySelectorAll('[data-sfv], [data-sf="x"], button[type=submit]')].map((b) => b.getBoundingClientRect().height)), tit: (d.querySelector('.fn-oh b') || {}).textContent || '', enCam: !!d.closest('#emaCam') }; });

  // ================================================================= 0) el botón de video
  if (SOLO(0)) {
    const r0 = [];
    for (const tam of [[390, 844], [360, 740]]) {
      for (const modo of ['barra', 'obra', 'c']) {
        const A = await sesion('juan', modo === 'obra' ? { v165: false, v166: false } : {}, tam); const p = A.page;
        if (modo === 'barra') await camB(A); else await modoObra(A, modo === 'c');
        const n = tam.join('×') + ' ' + modo;
        const revisar = async (cuando) => {
          const r = await p.evaluate(tapables);
          if (ANTES) return r;
          const lugar = modo === 'c' ? r.arriba : r.enFila;
          c(r.video && lugar && r.pos === 'static' && r.videoLibre && r.video.w >= 44 && r.video.h >= 44, n + cuando + ': el «🎥 Video» va ' + (modo === 'c' ? 'arriba, entre la píldora y el reloj' : 'en la fila de abajo, al lado de la última') + ' (no flota) y se toca entero (' + (r.video ? Math.round(r.video.w) + '×' + Math.round(r.video.h) : '—') + ')');
          c(r.zoom && r.n >= 10 && !r.tapa.length && !r.tapado.length, n + cuando + ': no tapa nada de lo que se toca (' + r.n + ' cosas, con el zoom 1× 2× 3×)' + (r.tapa.length || r.tapado.length ? ' · tapa ' + r.tapa.concat(r.tapado).join(', ') : ''));
          return r;
        };
        const r = await revisar('');
        await foto(p, '0_' + tam.join('x') + '_' + modo);
        if (ANTES) { r0.push(n + ': tapa ' + r.tapa.join(', ')); c(r.tapa.length > 0, 'ANTES (v171) ' + n + ': el video flota y tapa ' + r.tapa.join(', ')); await A.ctx.close(); continue; }
        // «›» anda con el dedo
        const sel = modo === 'barra' ? '#cbPanel [data-cb="next"]' : '#fnFila [data-fn="next"]';
        const a0 = (await nombreCam(p)).que; await p.tap(sel); await p.waitForTimeout(700); const a1 = (await nombreCam(p)).que;
        c(a0 && a1 && a0 !== a1, n + ': «›» con el dedo pasa de «' + a0 + '» a «' + a1 + '»');
        if (modo === 'c') { await p.tap('#fnFila [data-fn="prev"]'); await p.waitForTimeout(500); for (let i = 0; i < 2; i++) { await p.tap('#emaCam [data-ec="disparar"]'); await p.waitForTimeout(1800); } await p.waitForTimeout(1500); await revisar(' con 2 miniaturas'); await foto(p, '0_' + tam.join('x') + '_c_miniaturas'); }
        if (tam[0] === 390 || modo === 'barra') {
          await p.tap('#anCamVid'); await p.waitForTimeout(1200);
          const hv = await p.evaluate(() => { const v = document.getElementById('anOv'); return { ov: !!v, cam: !!document.getElementById('emaCam'), txt: v ? v.textContent.replace(/\s+/g, ' ') : '' }; });
          c(hv.ov && !hv.cam && /LOS ÁLAMOS|Los Álamos/i.test(hv.txt), n + ': tocar «🎥 Video» cierra la cámara y abre la hoja del video con la obra · ' + hv.txt.slice(0, 70));
        }
        c(errsJs(A).length === 0, n + ': sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
        await A.ctx.close();
      }
    }
    if (ANTES) { console.log(r0.join('\n')); await browser.close(); process.exit(c.fin() ? 1 : 0); }
  }

  // ================================================================= 1) cámara de la barra: «Tablero 1», «Tablero roto», «Col 6 base»
  if (SOLO(1)) {
    const A = await sesion('juan', {}, [360, 740]); const p = A.page;
    await camB(A);
    await p.tap('#cbPanel [data-cbm="tablero"]'); await p.waitForTimeout(700);
    const ch = await tx(p, '#cbPanel [data-cbm="tablero"]');
    c(/✎/.test(ch) && !(await p.$('#sfOv')), 'Tablero: el primer toque lo elige y muestra «✎» (se puede tocar otra vez) · ' + ch);
    await p.tap('#cbPanel [data-cbm="tablero"]'); await p.waitForTimeout(600);
    const sf = await sfInfo(p);
    c(sf && sf.rol === 'dialog' && sf.x && sf.enCam && ['1', '2', '3', 'E', 'roto'].every((x) => sf.ops.indexOf(x) >= 0) && sf.min >= 44, 'otra vez → «Tablero ___» (role=dialog, ✕, adentro de la cámara) con 1 · 2 · 3 · E · roto (≥ 44 px) · ' + JSON.stringify(sf));
    await foto(p, '1_tablero_sufijo');
    await p.tap('#sfOv [data-sfv="1"]'); await p.waitForTimeout(800);
    const n1 = await nombreCam(p), ch1 = await tx(p, '#cbPanel [data-cbm="tablero"]');
    c(!(await p.$('#sfOv')) && n1.que === 'Tablero 1' && /Tablero 1/.test(ch1), '«1» → la cámara dice «Tablero 1» (y el botón «Tablero 1 ✎») · ' + JSON.stringify(n1) + ' · ' + ch1);
    await foto(p, '1_tablero_1');
    const ok1 = await disparar(A, 'Tablero 1');
    const f1 = await fotosObra(p, 'Tablero 1');
    c(ok1 && f1.length === 1 && f1[0].cat === 'tablero' && !f1[0].k, 'la foto se guarda «Tablero 1» (cat tablero, sin tarea: suelta) en el legajo · ' + JSON.stringify(f1));
    await p.waitForTimeout(1200);
    c((await nombreCam(p)).que === 'Tablero 1', 'la siguiente sigue «Tablero 1»');
    const ok2 = await disparar(A, 'Tablero 1'); await p.waitForTimeout(800);
    c(ok2 && (await fotosObra(p, 'Tablero 1')).length === 2, 'y la segunda foto también sale «Tablero 1»');
    // «roto» escrito
    await p.tap('#cbPanel [data-cbm="tablero"]'); await p.waitForTimeout(600);
    await p.fill('#sfIn', 'roto'); await p.tap('#sfOv button[type="submit"]'); await p.waitForTimeout(700);
    c((await nombreCam(p)).que === 'Tablero roto', 'escrito con el teclado: «roto» → «Tablero roto»');
    const ok3 = await disparar(A, 'Tablero roto');
    c(ok3 && (await fotosObra(p, 'Tablero roto')).length === 1, 'la foto «Tablero roto»');
    const mem = await p.evaluate(() => JSON.parse(localStorage.getItem('ema.foto.sufijos') || '{}'));
    c(mem.tablero && mem.tablero[0] === 'roto' && mem.tablero[1] === '1', 'lo último usado en Tablero queda en el celu (ema.foto.sufijos) · ' + JSON.stringify(mem));
    await p.tap('#cbPanel [data-cbm="tablero"]'); await p.waitForTimeout(600);
    const ops = (await sfInfo(p)).ops;
    c(ops[0] === 'roto' && ops[1] === '1', 'la próxima vez, lo último primero · ' + ops.join(' '));
    await p.tap('#sfOv [data-sf="nada"]'); await p.waitForTimeout(700);
    c((await nombreCam(p)).que === 'Tablero' && !/Tablero \S/.test((await tx(p, '#cbPanel [data-cbm="tablero"]')).replace('✎', '')), '«Sacar «roto»» → vuelve a «Tablero»');
    // ✕ no cambia nada
    await p.tap('#cbPanel [data-cbm="tablero"]'); await p.waitForTimeout(500); await p.tap('#sfOv [data-sf="x"]'); await p.waitForTimeout(400);
    c(!(await p.$('#sfOv')) && (await nombreCam(p)).que === 'Tablero', '✕ cierra sin cambiar nada');
    // Columna: «Col 6 base», ‹ › sigue andando
    await p.tap('#cbPanel [data-cbm="columna"]'); await p.waitForTimeout(700);
    const col0 = (await nombreCam(p)).que;
    await p.tap('#cbPanel [data-cbm="columna"]'); await p.waitForTimeout(600);
    const sfc = await sfInfo(p);
    await p.fill('#sfIn', 'base'); await p.tap('#sfOv button[type="submit"]'); await p.waitForTimeout(700);
    const nc = await nombreCam(p);
    c(sfc && /Columna/.test(sfc.tit) && nc.que === col0 + ' base', 'Columna otra vez → «base» → «' + nc.que + '» (el número y lo agregado)');
    await p.tap('#cbPanel [data-cb="next"]'); await p.waitForTimeout(700);
    const nn = await nombreCam(p);
    c(/^Col \d+ base$/.test(nn.que) && nn.que !== nc.que, '‹ › sigue andando: «' + nn.que + '»');
    await foto(p, '1_col_base');
    const ok4 = await disparar(A, nn.que); const f4 = await fotosObra(p, nn.que);
    c(ok4 && f4.length === 1 && f4[0].cat === 'columna' && !f4[0].k, 'la foto «' + nn.que + '» va suelta (no es la columna de la tarea) · ' + JSON.stringify(f4));
    await p.waitForTimeout(1200);
    c((await nombreCam(p)).que === nn.que, 'no pasa sola a la columna siguiente (sigue «' + (await nombreCam(p)).que + '»)');
    c(errsJs(A).length === 0, 'sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 2) Modo obra: «Tablero E»
  if (SOLO(2)) {
    const A = await sesion('juan', { v165: false, v166: false }); const p = A.page;
    await modoObra(A, false);
    await p.tap('#fnFila [data-fncat="tablero"]'); await p.waitForTimeout(700);
    await p.tap('#fnFila [data-fncat="tablero"]'); await p.waitForTimeout(600);
    c(!!(await sfInfo(p)), 'Modo obra: Tablero, otra vez → «Tablero ___»');
    await p.tap('#sfOv [data-sfv="E"]'); await p.waitForTimeout(700);
    const n = await nombreCam(p), sub = await tx(p, '#fnFila .fn-nt small');
    c(n.que === 'Tablero E' && n.fln === 'Tablero E' && n.suelta === '1' && !n.k && /sin tarea/.test(sub), '«E» → «Tablero E», va a la orden sin tarea · ' + JSON.stringify(n) + ' · ' + sub);
    await foto(p, '2_modo_obra_tablero_e');
    const ok = await disparar(A, 'Tablero E');
    await A.esperar(() => Object.values(((ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {}).fotos || {}).some((f) => f && f.num === 'Tablero E'), null, 15000);
    const cf = await campoFotos(p, 'Tablero E');
    c(ok && cf.length === 1 && cf[0].cat === 'tablero' && !cf[0].k, 'la foto «Tablero E» queda en la orden (campo.fotos, cat tablero, sin tarea) y en el legajo · ' + JSON.stringify(cf));
    await p.waitForTimeout(1200);
    c((await nombreCam(p)).que === 'Tablero E' && !!(await p.$('#emaCam')), 'la cámara sigue abierta y la siguiente también «Tablero E»');
    await p.tap('#fnFila [data-fncat="columna"]'); await p.waitForTimeout(700);
    const nc = await nombreCam(p);
    c(/^Col \d+$/.test(nc.que) && nc.k === 'excavacion' && !nc.suelta, 'Columna sin nada agregado: «' + nc.que + '» de la tarea, como siempre');
    c(errsJs(A).length === 0, 'sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 3) cámara C: «Col 6 base»
  if (SOLO(3)) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:20');
    await modoObra(A, true);
    c(!!(await p.$('#emaCam.vi-on')), 'la cámara C (v165)');
    const c0 = (await nombreCam(p)).que;
    await p.tap('#fnFila [data-fncat="columna"]'); await p.waitForTimeout(600);
    await p.fill('#sfIn', 'base'); await p.tap('#sfOv button[type="submit"]'); await p.waitForTimeout(700);
    const n = await nombreCam(p);
    c(n.que === c0 + ' base' && n.suelta === '1', 'Columna (ya elegida) otra vez → «base» → «' + n.que + '» (suelta)');
    await foto(p, '3_camara_c_base');
    const ok = await disparar(A, c0 + ' base'); await p.waitForTimeout(1500);
    const n2 = await nombreCam(p);
    c(ok && n2.que === c0 + ' base' && n2.fln === c0 + ' base', 'la foto «' + c0 + ' base» y no salta sola a la columna siguiente (sigue «' + n2.fln + '»)');
    const C = await p.evaluate(() => JSON.parse(JSON.stringify(((ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {}).pasosObra || {})));
    c(!JSON.stringify(C).includes('base'), 'no marca el tiempo de ninguna columna con esa foto (pasosObra) · ' + JSON.stringify(C).slice(0, 80));
    c(errsJs(A).length === 0, 'sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }

  // ================================================================= 4) «＋ Otra foto» (v171) + la oficina
  if (SOLO(4)) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await reloj(p, hoy, '08:20');
    await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(1500);
    if (!(await p.$('#mtApp .mt-ot[data-ot="ot165"] .mt-tarea[data-k="excavacion"]'))) { await p.click('.mt-item[data-mtabrir="ot165"]').catch(() => { }); await p.waitForTimeout(1200); }
    const T = '#mtApp .mt-ot[data-ot="ot165"] .mt-tarea[data-k="excavacion"]';
    const boton = () => p.evaluate((s) => { const b = document.querySelector(s + ' [data-mto="abrir"]'); if (!b) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true; }, T);
    await boton(); await p.waitForTimeout(800);
    if (await p.$('#viOv')) { await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(1200); }
    await p.click('#ofOv [data-ofcat="tablero"]'); await p.waitForTimeout(500);
    const h1 = await p.evaluate(() => ({ cam: !!document.getElementById('emaCam'), chip: (document.querySelector('#ofOv [data-ofcat="tablero"]') || {}).textContent || '', sacar: (document.querySelector('#ofOv [data-of="sacar"]') || {}).textContent || '', on: !!document.querySelector('#ofOv [data-ofcat="tablero"].on') }));
    c(!h1.cam && h1.on && /✎/.test(h1.chip) && /Sacar la foto · Tablero/.test(h1.sacar), '«＋ Otra foto» → Tablero lo elige (✎) y muestra «📷 Sacar la foto · Tablero» (todavía no abre la cámara) · ' + JSON.stringify(h1));
    await p.click('#ofOv [data-ofcat="tablero"]'); await p.waitForTimeout(500);
    const sf = await sfInfo(p);
    c(sf && !sf.enCam && sf.ops.indexOf('1') >= 0, 'otra vez → «Tablero ___» encima de la hoja');
    await foto(p, '4_hoja_tablero_sufijo');
    await p.click('#sfOv [data-sfv="1"]'); await p.waitForTimeout(500);
    const sc = await tx(p, '#ofOv [data-of="sacar"]');
    c(/Sacar la foto · Tablero 1/.test(sc) && /Tablero 1/.test(await tx(p, '#ofOv .of-nt b')), '«1» → «📷 Sacar la foto · Tablero 1» · ' + sc);
    await p.click('#ofOv [data-of="sacar"]'); await p.waitForTimeout(1200);
    const fln = await p.evaluate(() => window.camaraApp && window.camaraApp.inp && window.camaraApp.inp() ? window.camaraApp.inp().dataset.fln : '');
    c(fln === 'Tablero 1', 'la cámara abre con «Tablero 1» de nombre');
    await p.evaluate(() => { if (document.getElementById('emaCam')) window.camaraApp.cerrar(); }); await p.waitForTimeout(500);
    await p.evaluate((s) => { const x = document.querySelector(s + ' input[data-mto171]'); if (x) x.id = 'v172In'; }, T);
    await p.setInputFiles('#v172In', FOTO); await p.waitForTimeout(2500);
    const of = await p.evaluate(() => Object.values(((ordenesTrabajo.find((x) => x.id === 'ot165') || {}).campo || {}).fotos || {}).filter((f) => f.otra171).map((f) => f.num + '|' + f.cat + '|' + (f.k || '') + '|' + f.kx));
    c(of.indexOf('Tablero 1|tablero||excavacion') >= 0, 'la foto queda en la orden «Tablero 1» (otra171, sin tarea) · ' + JSON.stringify(of));
    await boton(); await p.waitForTimeout(700);
    const h2 = await p.evaluate(() => ({ on: !!document.querySelector('#ofOv [data-ofcat="tablero"].on'), sacar: (document.querySelector('#ofOv [data-of="sacar"]') || {}).textContent || '' }));
    c(h2.on && /Tablero 1/.test(h2.sacar), 'la próxima vez sigue elegido «Tablero 1» (dos toques, como antes) · ' + JSON.stringify(h2));
    await p.click('#ofOv [data-of="x"]'); await p.waitForTimeout(300);
    c(errsJs(A).length === 0, 'sin errores (Juan)' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    // la oficina (Lucía, en la compu)
    await p.waitForTimeout(1500);
    const L = await otra(A, 'lucia'); const o = L.page; await o.waitForTimeout(1500);
    await o.evaluate(() => window.__avanceOrden.abrir('ot165')); await o.waitForTimeout(1500);
    const ao = await o.evaluate(() => { const x = document.querySelector('#avOt .ao-otras171'); return x ? x.textContent.replace(/\s+/g, ' ') : ''; });
    c(/Tablero 1/.test(ao), 'la oficina ve «Tablero 1» en el «📸 Avance» · ' + ao.slice(0, 100));
    await foto(o, '4_oficina_avance');
    await o.evaluate(() => window.__avanceOrden.cerrar());
    const leg = await o.evaluate(async () => { const l = await window.fbFotosObraDe('p1'); return (l || []).filter((f) => f.otId === 'ot165').map((f) => f.num); });
    c(leg.indexOf('Tablero 1') >= 0, 'y en el legajo de la obra · ' + JSON.stringify(leg));
    c(errsJs(L).length === 0, 'sin errores (oficina)' + (errsJs(L).length ? ': ' + errsJs(L).slice(0, 2).join(' | ') : ''));
    await o.close(); await A.ctx.close();
  }

  // ================================================================= 5) __v172No
  if (SOLO(5)) {
    const A = await sesion('juan', { v172: false }); const p = A.page;
    await camB(A);
    const r = await p.evaluate(tapables);
    c(r.video && !r.enFila && r.pos === 'absolute', '__v172No: el «🎥 Video» flota como en la v171 · ' + r.pos);
    await p.tap('#cbPanel [data-cbm="tablero"]'); await p.waitForTimeout(600);
    await p.tap('#cbPanel [data-cbm="tablero"]'); await p.waitForTimeout(600);
    c(!(await p.$('#sfOv')) && !/✎/.test(await tx(p, '#cbPanel [data-cbm="tablero"]')), '__v172No: el segundo toque no abre nada y no hay «✎»');
    await p.evaluate(() => window.camaraApp.cerrar()); await p.waitForTimeout(500);
    await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(1500);
    if (!(await p.$('#mtApp .mt-ot[data-ot="ot165"] .mt-tarea[data-k="excavacion"]'))) { await p.click('.mt-item[data-mtabrir="ot165"]').catch(() => { }); await p.waitForTimeout(1200); }
    await p.evaluate(() => { const b = document.querySelector('#mtApp .mt-ot[data-ot="ot165"] .mt-tarea[data-k="excavacion"] [data-mto="abrir"]'); b && b.click(); }); await p.waitForTimeout(800);
    if (await p.$('#viOv')) { await p.click('#viOv [data-vi="iniciar"]'); await p.waitForTimeout(1200); }
    await p.click('#ofOv [data-ofcat="tablero"]'); await p.waitForTimeout(1200);
    c(!!(await p.$('#emaCam')) && !(await p.$('#ofOv')), '__v172No: en «＋ Otra foto», Tablero abre la cámara al toque (v171)');
    c(errsJs(A).length === 0, 'sin errores' + (errsJs(A).length ? ': ' + errsJs(A).slice(0, 2).join(' | ') : ''));
    await A.ctx.close();
  }
  if (browser) await browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
