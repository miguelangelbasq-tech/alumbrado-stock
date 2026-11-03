// Pruebas v107 · la cuadrilla ve y borra sus fotos: «📷 Mis fotos (N)» en la orden y «🗑 La última» en la cámara.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v107' + (cel ? ' cel' : ''));
  const d = baseDatos(), hoy = d.hoy, ahora = Date.now();
  const MINI = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
  const o = d.db.ordenesTrabajo.ot1;
  o.campo = { fotos: { a1: { por: 'Pedro Gómez', ts: ahora - 3000, k: 'm:Revisar tablero', tarea: 'Revisar tablero', mini: MINI }, a2: { por: 'Pedro Gómez', ts: ahora - 2000, cat: 'otra', mini: MINI }, a3: { por: 'Juan Pérez', ts: ahora - 1000, cat: 'otra', mini: MINI } } };
  const A = await abrir({ sesion: 'pedro', cel, datos: d, espera: 4000, reglas: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(900);
  let r = await p.evaluate(() => { const b = document.querySelector('[data-misfotos="ot1"]'); return b ? b.innerText.replace(/\s+/g, ' ').trim() : null; });
  c(r && /Mis fotos \(2\)/.test(r), 'en la orden de Mis tareas está «📷 Mis fotos (2)» (las suyas, no las de Juan) · ' + r);
  await p.click('[data-misfotos="ot1"]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => { const v = document.getElementById('gpVisor'); const b = v && v.querySelector('[data-gp="borrar"]'); return { abierto: !!v, n: window.emaGaleria && window.emaGaleria.actual() && window.emaGaleria.actual().n, borrar: !!b && !b.hidden }; });
  c(r.abierto && r.n === 2 && r.borrar, 'se abre la galería con sus 2 fotos y el botón «🗑 Sacar» · ' + JSON.stringify(r));
  await p.click('#gpVisor [data-gp="borrar"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const f = window.__stubDB().ordenesTrabajo.ot1.campo.fotos; return { a1: !!(f.a1 && f.a1.borrada), a2: !!(f.a2 && f.a2.borrada), a3: !!(f.a3 && f.a3.borrada) }; });
  c(r.a2 && !r.a1 && !r.a3, 'borra la que estaba mirando (la última) y no toca las otras · ' + JSON.stringify(r));
  await p.evaluate(() => { try { window.emaGaleria.cerrar(); } catch (e) { } }); await p.waitForTimeout(900);
  r = await p.evaluate(() => { const b = document.querySelector('[data-misfotos="ot1"]'); return b ? b.innerText.replace(/\s+/g, ' ').trim() : null; });
  c(r && /Mis fotos \(1\)/.test(r), 'la orden ahora dice «Mis fotos (1)» · ' + r);
  // cámara: «🗑 La última»
  r = await p.evaluate(async () => {
    const cam = document.createElement('div'); cam.id = 'emaCam'; document.body.appendChild(cam);
    window.__camDisparo({ name: 'EMA_x.jpg' }, {}); await new Promise((s) => setTimeout(s, 120));
    const b0 = cam.querySelector('.ec-borrar-ult'); const antes = { visible: b0 && !b0.hidden, deshab: b0 && b0.disabled };
    await firebase.firestore().collection('ordenesTrabajo').doc('ot1').update({ 'campo.fotos.a9': { por: 'Pedro Gómez', ts: Date.now(), cat: 'otra', mini: '' } });
    await new Promise((s) => setTimeout(s, 600));
    window.__camGuardada({ name: 'EMA_x.jpg' }, { adjId: 'a9' }, {}); await new Promise((s) => setTimeout(s, 120));
    const b = cam.querySelector('.ec-borrar-ult'); return { antes, hab: b && !b.disabled };
  });
  c(r.antes.visible && r.antes.deshab && r.hab, 'en la cámara aparece «🗑 La última»: espera a que la foto se guarde y después se puede tocar · ' + JSON.stringify(r));
  await p.click('#emaCam .ec-borrar-ult'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const f = window.__stubDB().ordenesTrabajo.ot1.campo.fotos; return !!(f.a9 && f.a9.borrada); });
  c(r, 'y al tocarla saca la última foto');
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
