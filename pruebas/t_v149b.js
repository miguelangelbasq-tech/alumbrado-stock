// v149b · «Las fotos no se envían y se pierden» + copia en el celu + mandar lo hecho (Mis tareas clásica).
// Cada caso con Juan (cuadrilla) en Modo obra, 3 fotos seguidas SIN pausa (la persona sigue tocando):
//  · normal: se cuentan al toque, quedan copiadas en el celu (ema-fotos-crudas) y recién se borran cuando están en la base
//    (adjuntos + fotosObra + campo.fotos con su columna); «✓ Todas las fotos subidas».
//  · error raro de la base (2 veces): ningún «sacala de nuevo», la copia no se borra, se reintenta sola y sube.
//  · cerrar la app antes de subir: al abrir de nuevo se suben solas y quedan anotadas en la orden.
//  · usuario sin vincular (reglas reales): quedan en el celu, «Falta permiso», el aviso 🔒 y el latido lo lleva al Supervisor.
//  · cupo de la base agotado (REST 429 y las escrituras colgadas como hace Firestore): «La base no acepta más por hoy»,
//    la cola no vuelve a mandar lo que ya está en camino (antes: una escritura nueva por foto por minuto) y cuando se
//    renueva suben todas.
//  · cámara de la barra y Mis tareas clásica con error: la foto queda en el celu (mensaje «quedó guardada en el celu»).
//  · copia en el celu con Filesystem simulado (carpeta, nombre, Sí/No en Perfil) y, sin plugin, «⬇ Bajar mis fotos de hoy».
//  · Mis tareas clásica: con 1 de 3 tareas mandadas, «📤 Mandar lo que hice» manda la orden y lo demás queda pendiente.
const { abrir, prueba } = require('./h');
const { datos147, P } = require('./datos147');
const cel = process.argv[2] === 'cel';
const MOD = { v147: true, mov: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, sugerida: true, v145: true, v146: true, obraGps: true, camaraB: true, porPartes: true, https: true, v149: true, cel };
const JPG = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
const camaraFalsa = () => {
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#6f6f5c'; x.fillRect(0, c.height * 0.62, c.width, c.height); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { await new Promise((r) => setTimeout(r, 200)); const c = document.createElement('canvas'); c.width = 960; c.height = 720; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
};
const filesystem = () => {   // la app de Android 1.3+: Filesystem simulado
  window.__fsEscritos = [];
  window.Capacitor = { isNativePlatform: () => true, isPluginAvailable: (n) => n === 'Filesystem', Plugins: { Filesystem: { writeFile: async (o) => { window.__fsEscritos.push({ path: o.path, directory: o.directory, recursive: o.recursive, len: (o.data || '').length, jpg: /^\/9j\//.test(o.data || '') }); return { uri: 'file:///storage/Documents/' + o.path }; } } } };
};
(async () => {
  const c = prueba('v149b' + (cel ? ' cel' : ''));
  async function sesion(caso, op) {
    op = op || {};
    const d = datos147();
    if (caso === 'sinvinc') d.db.usuarios.uJuan.personaClave = '';
    const J = await abrir(Object.assign({ datos: d, sesion: 'juan', espera: 6000, antes: op.antes || camaraFalsa, reglas: caso === 'sinvinc' }, MOD, op.mod || {})), q = J.page, ev = (f, a) => q.evaluate(f, a);
    await J.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, async (rq) => { if (rq.request().method() === 'GET' && /\/f\//.test(rq.request().url())) return rq.fulfill({ status: 200, contentType: 'image/jpeg', headers: { 'access-control-allow-origin': '*' }, body: JPG }); await new Promise((r) => setTimeout(r, 400)); rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }); });
    await J.ctx.route(/firestore\.googleapis\.com/, (rq) => global.__cupo ? rq.fulfill({ status: 429, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Quota exceeded.' } }) }) : rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{}' }));
    await J.ctx.grantPermissions(['camera', 'geolocation'], { origin: 'https://app.test' });
    await J.ctx.setGeolocation({ latitude: P.bul[0] + 0.0002, longitude: P.bul[1], accuracy: 8 });
    return { J, q, ev };
  }
  const esperar = (q, fn, arg, ms) => q.waitForFunction(fn, arg, { timeout: ms || 30000, polling: 200 }).then(() => true, () => false);
  const est = (ev) => ev(async () => {
    const db = window.__stubDB(), o = db.ordenesTrabajo.ot1, cf = ((o || {}).campo || {}).fotos || {};
    const crudas = await new Promise((ok) => { const r = indexedDB.open('ema-fotos-crudas', 1); r.onupgradeneeded = () => r.result.createObjectStore('f', { keyPath: 'id' }); r.onsuccess = () => { const s = r.result.transaction('f', 'readonly').objectStore('f').getAll(); s.onsuccess = () => ok(s.result.length); }; r.onerror = () => ok(-1); });
    const B = window.__fotoBandeja ? window.__fotoBandeja.estado() : {};
    return { campo: Object.keys(cf).length, campoK: Object.values(cf).filter((x) => x.k && x.num).length, campoMini: Object.values(cf).filter((x) => x.mini).length, adj: Object.values(db.adjuntos || {}).filter((x) => x.otId === 'ot1').length, fo: Object.values(db.fotosObra || {}).filter((x) => x.otId === 'ot1').length, crudas, n: B.n, motivo: B.motivo, lista: (B.lista || []).map((r) => r.fase + ':' + (r.motivo || '')), senal: ((document.querySelector('#cdApp .cd-senal') || document.querySelector('#cdApp .fb-ok') || {}).textContent || '').replace(/\s+/g, ' ').trim(), fss: ((document.getElementById('fssAviso') || {}).textContent || '').replace(/\s+/g, ' ').trim(), msg: ((document.querySelector('#cdApp .cd-msg') || {}).textContent || '') };
  });
  const tresFotos = async (q, ev) => {
    const toque = (s) => (cel ? q.tap(s) : q.click(s));
    await ev(() => window.__cuadrillaDia.ir('obra')); await q.waitForTimeout(2500);
    for (let i = 0; i < 3; i++) {
      await toque(i === 0 ? '#cdApp [data-cd="boton"]' : '#cdHoja [data-cdh="otra"]');
      await esperar(q, () => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0; });
      await toque('#emaCam [data-ec="disparar"]');
      await esperar(q, () => { const h = document.getElementById('cdHoja'); return !!h && /Foto guardada/.test(h.textContent); }, null, 20000);
      for (let k = 0; k < 3; k++) { await q.mouse.click(5, 300); await q.waitForTimeout(400); }   // sigue tocando: sin pausa
    }
    await ev(() => { const b = document.querySelector('#cdHoja [data-cdh="x"]'); b && b.click(); });
  };
  const ok3 = (q) => esperar(q, () => { const db = window.__stubDB(), o = db.ordenesTrabajo.ot1, f = Object.values(((o || {}).campo || {}).fotos || {}); return f.filter((y) => y.k && y.num).length >= 3 && Object.values(db.fotosObra || {}).filter((x) => x.otId === 'ot1').length >= 3 && Object.values(db.adjuntos || {}).filter((x) => x.otId === 'ot1').length >= 3; }, null, 120000);
  const crudas0 = (q) => esperar(q, () => window.__fotoBandeja && window.__fotoBandeja.estado().n === 0, null, 60000);

  // ------------------------------------------------------------------------------------------------ 1) normal
  {
    const { J, q, ev } = await sesion('normal');
    await tresFotos(q, ev);
    let e = await est(ev);
    c(e.crudas === 3 && e.n === 3, `normal · las 3 fotos quedan copiadas en el celu apenas se sacan (copias ${e.crudas}, contador ${e.n})`);
    c(/3 fotos/.test(e.senal) && !/Esperando señal/.test(e.senal), `normal · contador visible en Modo obra: «${e.senal}» (con señal no dice «esperando señal»)`);
    const subio = await ok3(q); await crudas0(q); e = await est(ev);
    c(subio && e.adj === 3 && e.fo === 3 && e.campoK >= 3, `normal · llegan a la base: adjuntos ${e.adj} · fotosObra ${e.fo} · campo.fotos con columna ${e.campoK}`);
    c(e.crudas === 0 && e.n === 0, `normal · recién con todo en la base se borran las copias del celu (quedan ${e.crudas})`);
    await ev(() => window.__cuadrillaDia.ir('hoy')); await q.waitForTimeout(800);
    c(await esperar(q, () => /Todas las fotos subidas/.test((document.getElementById('cdApp') || {}).textContent || ''), null, 5000), 'normal · Hoy dice «✓ Todas las fotos subidas»');
    const dx = await ev(() => window.__dispExtra());
    c(dx && dx.fotosPend === 0, 'normal · el latido de presencia lleva fotosPend 0');
    c(!J.errores.length, 'normal · sin errores' + (J.errores.length ? ': ' + J.errores.slice(0, 3).join(' | ') : ''));
    await J.browser.close();
  }
  // ------------------------------------------------------------------------------------------------ 2) error raro de la base
  {
    const { J, q, ev } = await sesion('error');
    await ev(() => { window.__rotas = 0; const iv = setInterval(() => { const g = window.fbAdjuntoGuardar; if (g && g.__nube && !g.__rompe) { const o = g; const f = async function () { if (window.__rotas < 2) { window.__rotas++; throw Object.assign(new Error('boom interno'), { code: 'internal' }); } return o.apply(this, arguments); }; Object.keys(o).forEach((k) => { f[k] = o[k]; }); f.__rompe = 1; window.fbAdjuntoGuardar = f; clearInterval(iv); } }, 50); });
    await tresFotos(q, ev);
    await esperar(q, () => window.__rotas >= 2, null, 40000);
    let e = await est(ev);
    c(!/Sacala de nuevo|No se pudo guardar/.test(e.msg) && e.crudas === 3, `error · no dice «sacala de nuevo» y la copia no se borra (copias ${e.crudas}; antes de la v149b se borraba) · ${e.lista.join(',')}`);
    const subio = await ok3(q); await crudas0(q); e = await est(ev);
    c(subio && e.adj === 3 && e.crudas === 0, `error · se reintentan solas y suben las 3 (adjuntos ${e.adj}, copias ${e.crudas})`);
    c(e.campoMini === 3, `error · la miniatura queda en la orden también para las reintentadas (${e.campoMini} de 3)`);
    await J.browser.close();
  }
  // ------------------------------------------------------------------------------------------------ 3) cerrar la app antes de subir
  {
    const { J, q, ev } = await sesion('cerrar');
    await tresFotos(q, ev);
    let e = await est(ev);
    await q.reload(); await q.waitForTimeout(3000);
    const subio = await ok3(q); await crudas0(q); const e2 = await est(ev);
    c(e.crudas === 3 && subio && e2.campoK >= 3 && e2.crudas === 0, `cerrar · Android cierra la app con ${e.crudas} sin subir: al abrir de nuevo se suben y quedan en la orden (campo.fotos ${e2.campoK}, adjuntos ${e2.adj})`);
    await J.browser.close();
  }
  // ------------------------------------------------------------------------------------------------ 4) usuario sin vincular
  {
    const { J, q, ev } = await sesion('sinvinc');
    await tresFotos(q, ev);
    await esperar(q, () => window.__fotoBandeja && window.__fotoBandeja.estado().lista.filter((r) => r.motivo === 'permiso').length >= 3, null, 60000);
    await ev(() => window.__cuadrillaDia.ir('hoy')); await q.waitForTimeout(1500);
    const e = await est(ev);
    c(e.crudas === 3 && e.n === 3, `sin vincular · las 3 quedan en el celu (no se pierden): ${e.lista.join(',')}`);
    c(/Falta permiso/.test(e.senal) && /oficina arregle el permiso/.test(e.fss), `sin vincular · dice el motivo: «${e.senal}» · «${e.fss}»`);
    await ev(() => window.__cuadrillaDia.ir('senal')); await q.waitForTimeout(800);
    const pt = await ev(() => document.getElementById('cdApp').textContent);
    c(/no está vinculado|no tiene permiso/.test(pt) && /Reintentar ahora/.test(pt) && /BULEVARES|Bulevares/i.test(pt), 'sin vincular · pantalla de fotos: motivo, la lista (obra y columna) y «Reintentar ahora»');
    const dx = await ev(() => window.__dispExtra());
    c(dx.fotosPend === 3 && dx.colaMotivo === 'permiso', 'sin vincular · el latido lleva «3 fotos, sin permiso» para el Supervisor · ' + JSON.stringify(dx));
    const sh = await ev(() => { window.__presenciaDatos = { uJuan: { nombre: 'Juan Pérez', ts: Date.now(), disp: window.__dispExtra() } }; return window.__senalReal.supHallazgos().map((h) => h.g + ' ' + h.t + ' ' + h.s); });
    c(sh.some((x) => /^rojo 3 foto/.test(x) && /Juan Pérez: 3 \(sin permiso\)/.test(x)), 'sin vincular · la oficina lo ve en el Supervisor: ' + sh.join(' | ').slice(0, 160));
    await J.browser.close();
  }
  // ------------------------------------------------------------------------------------------------ 5) cupo de la base agotado
  {
    global.__cupo = true;
    const { J, q, ev } = await sesion('cupo');
    await ev(() => { window.__stubSinRed = true; window.__sets = 0; const o = window.__colaDirecta; window.__colaDirecta = function (fn, ctx, args) { if (args && args[0] && args[0].dataUrl !== undefined || (args && args[0] && args[0].r2)) window.__sets++; return o.apply(this, arguments); }; });
    await tresFotos(q, ev);
    await esperar(q, () => window.__senalReal.estado().motivo === 'cupo', null, 90000);
    const s1 = await ev(() => window.__sets);
    await ev(() => window.__fotosSinSenal.reintentar()); await q.waitForTimeout(65000); await ev(() => window.__fotosSinSenal.reintentar());
    const s2 = await ev(() => window.__sets);
    await ev(() => window.__cuadrillaDia.ir('hoy')); await q.waitForTimeout(1000);
    const e = await est(ev);
    c(e.motivo === 'cupo' && /no acepta más por hoy/.test(e.senal) && /no acepta más por hoy/.test(e.fss), `cupo · con «internet» dice el motivo real: «${e.senal}» · «${e.fss}»`);
    c(s2 === s1 && s1 <= 3, `cupo · no vuelve a mandar lo que ya está en camino (escrituras de fotos: ${s1} → ${s2} en 65 s; antes, 3 más por minuto)`);
    c(e.crudas === 3, `cupo · las 3 siguen en el celu (${e.crudas})`);
    global.__cupo = false; await ev(() => { window.__stubSinRed = false; window.__senalReal.sondear(true); });
    const subio = await ok3(q); await crudas0(q);
    c(subio, 'cupo · cuando la base vuelve a aceptar, suben todas solas');
    await J.browser.close();
  }
  // ------------------------------------------------------------------------------------------------ 6) cámara de la barra con error
  {
    const { J, q, ev } = await sesion('camB');
    await ev(() => { window.__rotas = 0; const iv = setInterval(() => { const g = window.fbAdjuntoGuardar; if (g && g.__nube && !g.__rompe) { const o = g; const f = async function () { if (window.__rotas < 1) { window.__rotas++; throw Object.assign(new Error('boom'), { code: 'internal' }); } return o.apply(this, arguments); }; Object.keys(o).forEach((k) => { f[k] = o[k]; }); f.__rompe = 1; window.fbAdjuntoGuardar = f; clearInterval(iv); } }, 50); });
    const n0 = await ev(() => Object.keys(window.__stubDB().fotosObra || {}).length);
    await ev(() => { const b = document.querySelector('#navN1 [data-n1="camara"]'); if (b) b.click(); else document.getElementById('menuCamara').click(); });
    await esperar(q, () => { const v = document.getElementById('ecVideo'); return !!v && v.videoWidth > 0; });
    await (cel ? q.tap('#emaCam [data-ec="disparar"]') : q.click('#emaCam [data-ec="disparar"]'));
    await esperar(q, () => window.__rotas >= 1, null, 20000); await q.waitForTimeout(1500);
    const av = await ev(() => ((document.getElementById('ecAviso') || document.getElementById('ecToast') || {}).textContent || ''));
    const pill = await ev(() => ((document.querySelector('#emaCam .fb-cam') || {}).textContent || ''));
    c(/quedó guardada en el celu/.test(av) && !/probá de nuevo/.test(av), `cámara de la barra · un error no pierde la foto: «${av}»`);
    c(/1 foto esperando para subir/.test(pill), `cámara · la píldora dice cuántas esperan: «${pill}»`);
    await ev(() => window.camaraApp.cerrar());
    const ok = await esperar(q, (n) => Object.keys(window.__stubDB().fotosObra || {}).length > n, n0, 90000);
    c(ok, 'cámara de la barra · se reintenta sola y llega a la base');
    await J.browser.close();
  }
  // ------------------------------------------------------------------------------------------------ 7) copia en el celu (app de Android)
  {
    const { J, q, ev } = await sesion('copia', { antes: new Function('(' + camaraFalsa.toString() + ')();(' + filesystem.toString() + ')();') });
    await tresFotos(q, ev);
    await esperar(q, () => (window.__fsEscritos || []).length >= 3, null, 90000);
    const w = await ev(() => window.__fsEscritos);
    c(w.length === 3 && w.every((x) => /^EMA\/Fotos\/\d{4}-\d\d-\d\d\/[A-Z_]*BULEVARES_Col_\d+_\d\d-\d\d-\d\d\.jpg$/.test(x.path) && x.directory === 'DOCUMENTS' && x.recursive && x.jpg), 'copia · cada foto (con la marca) se guarda sola en Documentos › EMA › Fotos › AAAA-MM-DD › OBRA_Col_N_hora.jpg · ' + w.map((x) => x.path).join(', '));
    await ok3(q); await crudas0(q); await q.waitForTimeout(2000);
    c((await ev(() => window.__fsEscritos.length)) === 3, 'copia · no se copia dos veces');
    await ev(() => mostrarVista('perfil')); await q.waitForTimeout(1000);
    const fila = await ev(() => { const b = document.querySelector('[data-pf="fcopia"]'); return b ? b.textContent.replace(/\s+/g, ' ') : ''; });
    c(/Guardar copia de las fotos en el celu/.test(fila) && /Sí: en Documentos › EMA › Fotos · hoy 3/.test(fila), `copia · Perfil: «${fila}»`);
    await ev(() => document.querySelector('[data-pf="fcopia"]').click()); await q.waitForTimeout(600);
    c(await ev(() => localStorage.getItem('ema.fotos.copia') === '0' && /No: las fotos solo se suben/.test(document.querySelector('[data-pf="fcopia"]').textContent)), 'copia · «No» en Perfil la apaga');
    await ev(() => window.__fotoSellada(new File([new Uint8Array([255, 216, 255])], 'x.jpg', { type: 'image/jpeg' }), { plazaNombre: 'X', __bandejaId: 'otra' })); await q.waitForTimeout(500);
    c((await ev(() => window.__fsEscritos.length)) === 3, 'copia · apagada no copia');
    c(!J.errores.length, 'copia · sin errores' + (J.errores.length ? ': ' + J.errores.slice(0, 3).join(' | ') : ''));
    await J.browser.close();
  }
  // ------------------------------------------------------------------------------------------------ 8) sin plugin: bajar ZIP
  {
    const { J, q, ev } = await sesion('zip');
    await tresFotos(q, ev); await ok3(q); await crudas0(q);
    await ev(() => mostrarVista('perfil')); await q.waitForTimeout(1000);
    const fila = await ev(() => { const b = document.querySelector('.pf-fila[data-pf="fzip"]'); return b ? b.textContent.replace(/\s+/g, ' ') : ''; });
    c(/no se pueden guardar solas/.test(fila) && /Bajar mis fotos de hoy/.test(fila), `zip · sin la app de Android, Perfil lo dice y ofrece «⬇ Bajar mis fotos de hoy»: «${fila}»`);
    const [dl] = await Promise.all([q.waitForEvent('download', { timeout: 30000 }).catch(() => null), ev(() => document.querySelector('span[data-pf="fzip"]').click())]);
    let n = 0; if (dl) { const p = await dl.path(); const b = require('fs').readFileSync(p); for (let i = 0; i < b.length - 4; i++) if (b.readUInt32LE(i) === 0x04034b50) n++; }
    c(dl && /^Fotos_\d{4}-\d\d-\d\d_.*\.zip$/.test(dl.suggestedFilename()) && n === 3, `zip · baja un ZIP con las 3 fotos de hoy (${dl ? dl.suggestedFilename() : 'nada'}, ${n} archivos)`);
    await ev(() => window.__cuadrillaDia.ir('senal')); await q.waitForTimeout(600);
    c(await ev(() => !!document.querySelector('#cdApp [data-cd="fzip"]')), 'zip · también en la pantalla de fotos de la cuadrilla');
    await J.browser.close();
  }
  // ------------------------------------------------------------------------------------------------ 9) Mis tareas clásica: mandar lo hecho
  {
    const d = datos147(), o = d.db.ordenesTrabajo.ot1;
    o.campo = { tareaEnv: { montaje_prfv: { 'Juan Pérez': { estado: 'si', ts: Date.now(), por: 'Juan Pérez' } } }, marcas: { montaje_prfv: { hecho: true, cant: 4 } }, horasTarea: { montaje_prfv: { ini: '07:30', fin: '10:00', por: 'Juan Pérez' } } };
    const J = await abrir({ datos: d, sesion: 'juan', espera: 6000, cel, mtNuevo: true, tarjetas: true, ofPasos: true }), q = J.page, ev = (f, a) => q.evaluate(f, a);
    await ev(() => mostrarVista('mistareas')); await q.waitForTimeout(1800);
    if (!await q.$('.mt-ot[data-ot="ot1"]')) { await q.click('.mt-item[data-mtabrir="ot1"]').catch(() => { }); await q.waitForTimeout(900); }
    const bt = await ev(() => { const b = document.querySelector('[data-etl="abrir"]'); return b ? b.textContent : ''; });
    c(/Mandar lo que hice \(1 de 2\)/.test(bt), `mandar lo hecho · con 1 de 2 mandadas aparece «${bt}»`);
    if (bt) {
      await ev(() => document.querySelector('[data-etl="abrir"]').click()); await q.waitForTimeout(500);
      const pop = await ev(() => (document.getElementById('etlPop') || {}).textContent || '');
      c(/Quedan pendientes/.test(pop) && /Hormigonado|hormig/i.test(pop), 'mandar lo hecho · dice qué queda pendiente');
      await ev(() => document.querySelector('#etlPop [data-etl="si"]').click());
      const ok = await esperar(q, () => { const e = (((window.__stubDB().ordenesTrabajo.ot1 || {}).campo || {}).enviados || {})['Juan Pérez']; return !!(e && e.parcial); }, null, 15000);
      const en = await ev(() => window.__stubDB().ordenesTrabajo.ot1.campo);
      c(ok && en.enviados['Juan Pérez'].pendientes.length === 1 && en.horas && en.horas['Juan Pérez'] && en.horas['Juan Pérez'].horas === 2.5, 'mandar lo hecho · la orden queda enviada (parcial, con lo pendiente y las horas) · ' + JSON.stringify(en.enviados['Juan Pérez']).slice(0, 160));
      await q.waitForTimeout(800);
      c(await ev(() => /Ya mandaste lo que hiciste/.test(document.getElementById('mtApp').textContent)), 'mandar lo hecho · después dice «Ya mandaste lo que hiciste» y lo que falta queda pendiente');
    }
    c(!J.errores.length, 'mandar lo hecho · sin errores' + (J.errores.length ? ': ' + J.errores.slice(0, 3).join(' | ') : ''));
    await J.browser.close();
  }
  process.exit(c.fin() ? 1 : 0);
})();
