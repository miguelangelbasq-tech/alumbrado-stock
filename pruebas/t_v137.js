// v137 · Remito por foto con IA (tarjeta, corregir, renglón sin código que no se carga, Sí → entradas E- con precio sin IVA
// y la foto vinculada, auditoría remito_ia; remito ilegible; Worker caído), código de barras (asociar, repetido, escanear
// con el plugin de la app simulado, desconocido → «¿A qué producto corresponde?»), etiquetas QR de herramientas, QR en el
// vale, la orden y la reserva (se decodifican con jsQR y tienen que dar la dirección correcta) y ?doc= / ?obra= abriendo
// cada cosa, y «No tenés permiso» para quien no puede verla. Además: dictado en vivo y onda de rayitas del Asistente
// (navegador con nivel real en la PC y simulado en el celu; plugin de la app 1.4 y modo charla).
const fs = require('fs');
const path = require('path');
const { abrir, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
const URL_IA = 'https://ema-ia.mdiaz-60f.workers.dev/ia';
const BASE = 'https://miguelangelbasq-tech.github.io/alumbrado-stock/';
const CAP = process.env.CAP || '';
const JSQR = fs.readFileSync(path.join(__dirname, 'lib', 'jsQR.js'), 'utf8');
const FOTO = path.join(__dirname, 'foto.jpg');
function datos() {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  d.db.movimientos = {
    m1: { tipo: 'entrada', codigo: 3017, desc: 'FUSIBLE CILINDRICO 10 X 38 2 AMP', un: 'Un.', cantidad: 50, fecha: hoy, ts: ahora - 9e5, usuario: 'admin@' + DOM, numero: 'E-0001', proveedor: 'Richetta', remito: '0001-0009', precioUnit: 90 },
    m2: { tipo: 'salida', codigo: 3017, desc: 'FUSIBLE CILINDRICO 10 X 38 2 AMP', un: 'Un.', cantidad: 4, fecha: hoy, ts: ahora - 8e5, usuario: 'admin@' + DOM, numero: 'S-0001', valeGrupo: 'vg1', plazaId: 'p1', plazaNombre: 'Plaza San Martín', retiradoPor: 'Juan Pérez', sector: 'alumbrado' }
  };
  d.db.catalogoProductos = { 7015: { codigo: 7015, ean: ['7790000000015'] } };
  d.db.reservas = { r1: { numero: 'R-0001', estado: 'pendiente', plazaId: 'p1', plazaNombre: 'Plaza San Martín', obraId: '1234', para: 'Juan Pérez', items: [{ codigo: 3017, desc: 'FUSIBLE CILINDRICO 10 X 38 2 AMP', un: 'Un.', cant: 6 }], creadoPor: 'admin@' + DOM, ts: ahora - 7e5, fechaNecesaria: hoy } };
  d.db.avanceObras.p2 = { nombre: 'PLAZA EL PUEBLITO', obraId: '4100', barrio: 'Villa Allende', creado: ahora };
  d.db.avanceObras.p3 = { nombre: 'PLAZA PUEBLO NUEVO', obraId: '4101', barrio: 'Centro', creado: ahora };
  d.db.avanceObras.p4 = { nombre: 'PLAZA LOS ALAMOS NORTE', obraId: '4102', creado: ahora };
  d.db.avanceObras.p5 = { nombre: 'PLAZA LOS ALAMOS SUR', obraId: '4103', creado: ahora };
  d.db.herramientas = { h1: { codigo: 'H-001', nombre: 'Pinza amperométrica', cat: 'medicion', estado: 'libre', marca: 'Fluke', modelo: '323', creado: ahora - 864e5 }, h2: { codigo: 'H-002', nombre: 'Taladro percutor', cat: 'electrica', estado: 'libre', creado: ahora - 864e5 } };
  return d;
}
(async () => {
  const c = prueba('v137' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', datos: datos(), cel, espera: 4000, https: true, iaPro: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  const foto = async (pg, nom, ms) => { if (cel && CAP) { await pg.waitForTimeout(ms == null ? 700 : ms); await pg.screenshot({ path: CAP + '/' + nom + '.png' }); } };
  const db = () => p.evaluate(() => window.__stubDB());
  const decod = (pg, sel, enHoja) => pg.evaluate(async ([s, h]) => {
    const raiz = h ? (document.querySelector('#hojaOv iframe') || {}).contentDocument : document;
    const img = raiz && raiz.querySelector(s); if (!img) return null;
    const im = new Image(); im.src = img.src; await new Promise((ok) => { im.onload = ok; im.onerror = ok; });
    const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height), r = window.jsQR(d.data, cv.width, cv.height);
    return r ? r.data : '(no se leyó)';
  }, [sel, !!enHoja]);
  await p.addScriptTag({ content: JSQR });
  await p.waitForTimeout(1200);

  // ========================================================= 1) remito por foto: botón y tarjeta
  const pedidos = []; let guion = [];
  await p.route(URL_IA, async (rt) => {
    let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { }
    pedidos.push(b);
    const x = guion.shift();
    if (x === 'caido') return rt.abort('connectionrefused');
    return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'msg_1', type: 'message', role: 'assistant', model: b.model, content: [{ type: 'thinking', thinking: '', signature: 'f' }, { type: 'text', text: JSON.stringify(x) }], stop_reason: 'end_turn', ema: { costoUsd: 0.03 } }) });
  });
  const hoy = await p.evaluate(() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  const REMITO = { legible: true, motivo: '', proveedor: 'Richetta', numero: '0001-00012345', fecha: hoy, moneda: 'ARS', preciosConIva: true, ivaPct: 21, renglones: [
    { desc: 'FUSIBLE CILINDRICO 10X38 2A', cant: 20, un: 'u', precio: 121, ean: null },
    { desc: 'CABLE CU 4X4 MM2 XLPE IRAM 2178', cant: 100, un: 'm', precio: 2420, ean: null },
    { desc: 'Gaseosa cola 2,25 L', cant: 2, un: 'u', precio: 3000, ean: null },
    { desc: 'Jabalina cobre', cant: 3, un: 'u', precio: 12100, ean: '7790000000015' }] };
  await p.evaluate(() => window.__v135.irStock('registrar')); await p.waitForTimeout(700);
  let r = await p.evaluate(() => { const b = document.getElementById('rfBtn'), w = document.getElementById('rfEntrada'); return { vis: !!b && getComputedStyle(w).display !== 'none' && b.getBoundingClientRect().height >= 44, txt: b ? b.textContent : '' }; });
  c(r.vis && /Cargar remito con foto/.test(r.txt), 'Pañol › Registrar movimiento (entrada) tiene «📷 Cargar remito con foto» de 44 px o más · ' + JSON.stringify(r));
  await p.evaluate(() => { const s = document.getElementById('stockMovTipo'); s.value = 'salida'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  r = await p.evaluate(() => getComputedStyle(document.getElementById('rfEntrada')).display);
  await p.evaluate(() => { const s = document.getElementById('stockMovTipo'); s.value = 'entrada'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  c(r === 'none', 'con «Salida» el botón del remito no aparece');
  await p.evaluate(() => document.getElementById('cardStockRegistrar').scrollIntoView({ block: 'start' }));
  await foto(p, 'v137_1_boton_remito');
  await p.click('#rfBtn'); await p.waitForTimeout(300);
  c(await p.evaluate(() => !!document.getElementById('rfFotoGal') && !!document.getElementById('rfFotoCam')), 'se abre la hoja con «Sacar foto» y «Elegir de la galería»');
  guion.push(REMITO);
  await p.setInputFiles('#rfFotoGal', FOTO);
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.querySelector('#rfFilas'))) break; }
  const b0 = pedidos[0];
  const img = b0 && b0.messages[0].content.find((x) => x.type === 'image');
  c(b0 && b0.model === 'claude-opus-5-5' && b0.output_config && b0.output_config.effort === 'medium' && img && img.source.media_type === 'image/jpeg' && img.source.data.length > 1000 && b0.fallbacks === 'default' && !('temperature' in b0) && !('thinking' in b0), 'la foto va al Worker como el asistente: Opus 5.5, bloque image JPEG, effort medium, con respaldo, sin temperature/thinking · ' + JSON.stringify(b0 && [b0.model, b0.output_config, b0.max_tokens]));
  r = await p.evaluate(() => [...document.querySelectorAll('#rfFilas .rf-ren')].map((x) => ({ g: x.querySelector('.rf-grado').className.replace('rf-grado ', ''), t: x.querySelector('.rf-grado').textContent, cod: (x.querySelector('select[data-rf="cod"]') || {}).value || '', fuera: x.classList.contains('rf-fuera'), n: x.querySelectorAll('select[data-rf="cod"] option').length })));
  c(r.length === 4, 'la tarjeta tiene los 4 renglones del remito · ' + JSON.stringify(r));
  c(r[0] && r[0].g === 'v' && r[0].cod === '3017', 'fusible 10×38 2 A → 🟢 3017 · ' + JSON.stringify(r[0]));
  c(r[1] && r[1].cod === '1010' && r[1].g !== 'r', 'cable 4×4 → 1010 · ' + JSON.stringify(r[1]));
  c(r[2] && r[2].g === 'r' && r[2].cod === '' && r[2].fuera, 'la gaseosa → 🔴 sin código: queda afuera con el desplegable para elegir (no se inventa código) · ' + JSON.stringify(r[2]));
  c(r[3] && r[3].g === 'v' && r[3].cod === '7015' && /código de barras/.test(r[3].t), 'jabalina con EAN asociado → 🟢 7015 por el código de barras · ' + JSON.stringify(r[3]));
  r = await p.evaluate(() => ({ prov: document.getElementById('rfProv').value, num: document.getElementById('rfNum').value, fecha: document.getElementById('rfFecha').value, iva: document.getElementById('rfIva').value, si: !!document.querySelector('[data-rf="si"]'), no: !!document.querySelector('[data-rf="no"]'), res: document.getElementById('rfRes').textContent }));
  c(r.prov === 'Richetta' && r.num === '0001-00012345' && r.fecha === hoy && r.iva === '21' && r.si && r.no && /Se cargan 3 renglones/.test(r.res) && /1 queda afuera/.test(r.res), 'datos leídos (proveedor, remito, fecha, IVA 21 %) y botones «Sí, cargar entrada» / «No» · ' + JSON.stringify(r));
  if (cel) r = await p.evaluate(() => document.querySelector('#rfOv .v7-caja').scrollWidth <= document.querySelector('#rfOv .v7-caja').clientWidth + 1);
  if (cel) c(r, 'en el celu la tarjeta no tiene scroll de costado');
  await foto(p, 'v137_2_tarjeta_remito');
  // corregir un renglón: cantidad del cable
  await p.fill('#rfFilas [data-rf="cant"][data-i="1"]', '50');
  await p.evaluate(() => { const s = document.querySelector('#rfFilas select[data-rf="cod"][data-i="2"]'); s.value = '__otro'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  r = await p.evaluate(() => !!document.querySelector('#rfFilas [data-rf="busca"][data-i="2"]'));
  c(r, '«🔎 Buscar otro en el catálogo…» abre el buscador del catálogo en el renglón sin código');
  const movAntes = Object.keys((await db()).movimientos || {}).length;
  await p.click('[data-rf="si"]');
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(200); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-listo'))) break; }
  let D = await db();
  const nuevos = Object.entries(D.movimientos || {}).filter(([, m]) => m.remito === '0001-00012345');
  const m3017 = nuevos.map((x) => x[1]).find((m) => m.codigo === 3017), m1010 = nuevos.map((x) => x[1]).find((m) => m.codigo === 1010), m7015 = nuevos.map((x) => x[1]).find((m) => m.codigo === 7015);
  c(Object.keys(D.movimientos).length === movAntes + 3 && nuevos.length === 3 && nuevos.every(([, m]) => m.tipo === 'entrada' && m.proveedor === 'Richetta' && m.fecha === hoy && /^E-\d{4}$/.test(m.numero || '')), 'con el Sí se cargan 3 entradas E- (la gaseosa sin código NO) · ' + JSON.stringify(nuevos.map(([, m]) => [m.codigo, m.numero, m.cantidad])));
  c(m3017 && m3017.precioUnit === 100 && m3017.precioOriginal === 121 && m3017.ivaPct === 21 && m3017.moneda === 'ARS' && m3017.cantidad === 20, 'precio: $ 121 con IVA → precioUnit $ 100 sin IVA + precioOriginal, moneda e ivaPct · ' + JSON.stringify(m3017 && [m3017.precioUnit, m3017.precioOriginal, m3017.ivaPct, m3017.moneda]));
  c(m1010 && m1010.cantidad === 50 && m7015 && m7015.cantidad === 3, 'el renglón corregido (50 m de cable) se carga corregido · ' + JSON.stringify(m1010 && m1010.cantidad));
  const fid = m3017 && m3017.fotoId, adj = fid && (D.adjuntos || {})[fid];
  c(fid && nuevos.every(([, m]) => m.fotoId === fid) && adj && adj.tipo === 'remito' && adj.remito === '0001-00012345' && (adj.dataUrl || adj.r2), 'la foto del remito queda en adjuntos (tipo remito) y vinculada a cada renglón (fotoId) · ' + fid);
  const au = Object.values(D.auditoria || {}).filter((a) => a.accion === 'remito_ia');
  c(au.length === 1 && au[0].porAsistente === true && (au[0].movIds || []).length === 3, 'auditoría «remito_ia» con porAsistente:true y los 3 movimientos · ' + JSON.stringify(au[0] && { d: au[0].detalle }));
  r = await p.evaluate(() => document.querySelector('#rfOv').textContent.replace(/\s+/g, ' '));
  c(/Entrada cargada: 3 renglones/.test(r) && /Gaseosa/.test(r) && /Quedaron afuera/.test(r), 'al terminar dice qué se cargó y qué quedó afuera · ' + r.slice(0, 160));
  await p.click('#rfOv [data-rf="cerrar"]'); await p.waitForTimeout(200);

  // ========================================================= 1b) remito ilegible y Worker caído
  await p.click('#rfBtn'); await p.waitForTimeout(200);
  guion.push({ legible: false, motivo: 'La foto está movida.', renglones: [] });
  await p.setInputFiles('#rfFotoGal', FOTO);
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-ilegible'))) break; }
  r = await p.evaluate(() => ({ t: (document.querySelector('#rfOv') || {}).textContent || '', otra: !!document.querySelector('#rfOv [data-rf="otra"]'), filas: !!document.getElementById('rfFilas') }));
  D = await db();
  c(/No se lee bien el remito/.test(r.t) && /movida/.test(r.t) && r.otra && !r.filas && Object.keys(D.movimientos).length === movAntes + 3, 'remito ilegible: lo dice, pide otra foto y no llena nada · ' + r.t.replace(/\s+/g, ' ').slice(0, 140));
  await p.click('#rfOv [data-rf="otra"]'); await p.waitForTimeout(200);
  guion.push('caido');
  await p.setInputFiles('#rfFotoGal', FOTO);
  for (let i = 0; i < 30; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => !!document.querySelector('#rfOv.rf-falla'))) break; }
  r = await p.evaluate(() => (document.querySelector('#rfOv') || {}).textContent || '');
  c(/no responde/.test(r) && /a mano/.test(r), 'Worker caído: mensaje claro y la carga a mano sigue igual · ' + r.replace(/\s+/g, ' ').slice(0, 140));
  await p.click('#rfOv [data-rf="cerrar"]'); await p.waitForTimeout(200);

  // ========================================================= 1c) en el panel del Asistente
  await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(900);
  r = await p.evaluate(() => !!document.querySelector('#iaChips [data-rfabrir]'));
  c(r, 'el panel del Asistente tiene el chip «📷 Cargar remito con foto»');
  await p.fill('#iaTxt', 'cargá este remito'); const nPed = pedidos.length; await p.click('#iaEnviar'); await p.waitForTimeout(400);
  r = await p.evaluate(() => !!document.getElementById('rfFotoGal'));
  c(r && pedidos.length === nPed, '«cargá este remito» en el chat abre la hoja del remito (sin mandar nada al Worker)');
  // ========================================================= 1d) dictado en vivo y onda de rayitas (navegador)
  await p.evaluate(() => {
    window.__remitoFoto.cerrar();
    window.__ondaLog = [];
    const snap = () => { const o = document.getElementById('iaOndaV'), tr = o ? [...o.children].map((i) => i.style.transform) : []; window.__ondaLog.push({ tx: document.getElementById('iaTxt').value, est: window.__iaOnda && window.__iaOnda.estado(), vis: !!o && !o.hidden && o.getBoundingClientRect().height > 0, n: o ? o.children.length : 0, distintas: new Set(tr).size, fuente: o ? o.dataset.fuente : '' }); };
    function SR() { this.lang = ''; }
    SR.prototype.start = function () { const self = this, partes = ['cargá', 'cargá diez', 'cargá diez metros de cable']; let i = 0;
      const tick = () => { if (self._stop) return; if (i < partes.length) { const s = partes[i++]; self.onresult && self.onresult({ results: [[{ transcript: s }]] }); setTimeout(snap, 120); setTimeout(tick, 450); } else { self.onend && self.onend(); } };
      setTimeout(tick, 500); };
    SR.prototype.stop = function () { this._stop = true; this.onend && this.onend(); };
    window.webkitSpeechRecognition = SR; window.SpeechRecognition = SR;
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { const ac = new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(); g.gain.value = 0.5; lfo.frequency.value = 3; lg.gain.value = 0.5; lfo.connect(lg); lg.connect(g.gain); const d = ac.createMediaStreamDestination(); o.connect(g); g.connect(d); o.start(); lfo.start(); return d.stream; };
  });
  await p.fill('#iaTxt', '');
  await p.click('#iaPanel [data-ia="mic"]'); await p.waitForTimeout(1050);
  await foto(p, 'v137_7_dictado_en_vivo', 0);
  await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ log: window.__ondaLog, fin: document.getElementById('iaTxt').value, oculta: document.getElementById('iaOndaV').hidden, est: window.__iaOnda.estado() }));
  const lg = r.log;
  c(lg.length === 3 && lg[0].tx === 'cargá' && lg[1].tx === 'cargá diez' && lg[2].tx === 'cargá diez metros de cable', 'mientras dicta, el texto va apareciendo en vivo en el cuadro · ' + JSON.stringify(lg.map((x) => x.tx)));
  c(lg.length && lg.every((x) => x.vis && x.n === 28 && x.est.on) && lg[2].distintas >= 3, 'mientras escucha se ve la onda de 28 rayitas y se mueve · ' + JSON.stringify(lg.map((x) => [x.vis, x.distintas, x.fuente])));
  c(cel ? lg.every((x) => x.est.real === false && x.fuente === 'simulada') : lg.some((x) => x.est.real === true && x.fuente === 'real'), cel ? 'en el celu la onda es simulada (no abre el micrófono dos veces)' : 'en la compu la onda usa el nivel real del micrófono (getUserMedia + AnalyserNode) · ' + JSON.stringify(lg.map((x) => x.fuente)));
  c(r.fin === 'cargá diez metros de cable' && r.oculta && !r.est.on, 'al terminar queda el texto dictado y la onda se apaga · ' + JSON.stringify({ fin: r.fin, oculta: r.oculta }));
  await p.fill('#iaTxt', '');
  // ========================================================= 1e) asistente más «vivo»: búsqueda aproximada, glosario, effort y system fijo
  r = await p.evaluate(() => { const H = window.__asistente.herramientas, m = (x) => { const o = H.buscar_obra({ texto: x }).r; return o && o.mejor ? [o.mejor.nombre, o.mejor.puntaje] : null; };
    const d1 = H.datos_obra({ obraId: 'sanma' }), d2 = H.datos_obra({ obraId: 'alamos' });
    return { pueblito: m('pueblito'), sanma: m('sanma'), typo: m('puebito'), sinTilde: m('plaza san martin'), d1: !d1.err, d2: d2.err ? (d2.r && d2.r.candidatos || d2.candidatos || []).length : -1, d2err: d2.err || '' }; });
  c(r.pueblito && r.pueblito[0] === 'PLAZA EL PUEBLITO' && r.sanma && r.sanma[0] === 'Plaza San Martín' && r.typo && r.typo[0] === 'PLAZA EL PUEBLITO' && r.sinTilde && r.sinTilde[0] === 'Plaza San Martín' && r.sanma[1] > 0, 'buscar_obra aproximado: «pueblito», «puebito» (tipeo) → PLAZA EL PUEBLITO; «sanma», «plaza san martin» → San Martín, con puntaje · ' + JSON.stringify(r));
  c(r.d1, 'las herramientas que reciben nombre de obra la encuentran igual («sanma» en datos_obra)');
  c(r.d2 === 2 && /varias obras/.test(r.d2err), 'solo pregunta si hay 2+ parecidas de verdad («alamos»: LOS ALAMOS NORTE y SUR) · ' + JSON.stringify([r.d2, r.d2err]));
  const n0 = pedidos.length;
  guion.push('Tiene 10 columnas.'); await p.fill('#iaTxt', 'cuantas columnas tiene sanma'); await p.click('#iaEnviar');
  for (let i = 0; i < 40 && pedidos.length < n0 + 1; i++) await p.waitForTimeout(150); await p.waitForTimeout(600);
  guion.push('Listo, te lo comparo.'); await p.fill('#iaTxt', 'revisá y compará el cómputo de sanma con el itemizado'); await p.click('#iaEnviar');
  for (let i = 0; i < 40 && pedidos.length < n0 + 2; i++) await p.waitForTimeout(150); await p.waitForTimeout(600);
  const q1 = pedidos[n0], q2 = pedidos[n0 + 1];
  c(q1 && q1.system.length === 1 && /pe erre efe ve/.test(q1.system[0].text) && /PRFV/.test(q1.system[0].text) && /be pe ene/.test(q1.system[0].text) && /no lo comentes/.test(q1.system[0].text) && /ACTUÁ sin preguntar de más/.test(q1.system[0].text), 'el system trae el glosario del dictado (PRFV, PAT, BPN, OT…) y «actuá sin preguntar de más»');
  const u1 = q1 && q1.messages[q1.messages.length - 1];
  c(u1 && Array.isArray(u1.content) && /^\[Contexto de la app/.test(u1.content[0].text) && /Hoy es/.test(u1.content[0].text) && u1.content[1].text === 'cuantas columnas tiene sanma', 'el contexto que cambia (fecha, hora, pantalla, permisos) va al principio del mensaje de la persona, no en el system');
  c(q1 && q1.output_config.effort === 'low' && q1.max_tokens === 4000 && q2 && q2.output_config.effort === 'medium' && q2.max_tokens === 16000, 'dato simple («cuántas…») → effort low y respuesta corta; «revisá y compará…» → medium · ' + JSON.stringify([q1 && [q1.output_config, q1.max_tokens], q2 && [q2.output_config, q2.max_tokens]]));
  c(q1 && q2 && JSON.stringify(q1.system) === JSON.stringify(q2.system) && JSON.stringify(q2.messages.slice(0, q1.messages.length)) === JSON.stringify(q1.messages), 'el system es idéntico entre turnos y la historia solo se agrega (los bloques de pensamiento siguen valiendo)');
  await p.evaluate(() => { window.__remitoFoto.cerrar(); const x = document.querySelector('[data-ia="volver"]') || document.querySelector('[data-ia="cerrar"]'); x && x.click(); });
  await p.waitForTimeout(300);

  // ========================================================= 2) código de barras
  await p.evaluate(() => {   // el lector de la app de Android (ML Kit) simulado
    window.__codigoFalso = '';
    window.Capacitor = Object.assign(window.Capacitor || {}, { isNativePlatform: () => true, Plugins: Object.assign((window.Capacitor && window.Capacitor.Plugins) || {}, { BarcodeScanner: { isGoogleBarcodeScannerModuleAvailable: async () => ({ available: true }), scan: async () => ({ barcodes: [{ rawValue: window.__codigoFalso }] }) } }) });
  });
  const ficha = async (cod) => { await p.evaluate((k) => { document.getElementById('pfModal') && document.getElementById('pfModal').remove(); const b = document.createElement('button'); b.className = 'pf-link'; b.dataset.cod = k; document.body.appendChild(b); b.click(); b.remove(); }, String(cod)); await p.waitForTimeout(400); };
  await p.evaluate(() => window.__v135.irStock('inventario')); await p.waitForTimeout(500);
  await ficha(2009);
  r = await p.evaluate(() => { const b = document.getElementById('eanBox'); return b ? { t: b.textContent.replace(/\s+/g, ' '), as: !!b.querySelector('[data-ean="asociar"]'), vale: !!b.querySelector('[data-ean="vale"]'), ent: !!b.querySelector('[data-ean="entrada"]') } : null; });
  c(r && /Sin código de barras/.test(r.t) && r.as && r.vale && r.ent, 'la ficha del material tiene «🔗 Asociar código de barras», «Hacer vale de salida» y «Entrada» · ' + JSON.stringify(r));
  await p.evaluate(() => { window.__codigoFalso = '7790000000022'; });
  await p.click('#eanBox [data-ean="asociar"]'); await p.waitForTimeout(700);
  D = await db();
  const c2009 = (D.catalogoProductos || {})['2009'];
  c(c2009 && JSON.stringify(c2009.ean) === '["7790000000022"]' && c2009.editadoPor === 'admin@' + DOM && c2009.editadoTs > 0, 'asociar con el lector: catalogoProductos/2009.ean = [7790000000022] con editadoPor y editadoTs · ' + JSON.stringify(c2009));
  r = await p.evaluate(() => document.getElementById('eanBox').textContent);
  c(/7790000000022/.test(r), 'la ficha muestra el código asociado');
  await foto(p, 'v137_3_asociar_ean', 500);
  // repetido
  await ficha(2010);
  await p.click('#eanBox [data-ean="asociar"]'); await p.waitForTimeout(600);
  r = await p.evaluate(() => { const v = document.getElementById('v7Preg'); return v ? v.textContent.replace(/\s+/g, ' ') : ''; });
  c(/ya está en otro producto/.test(r) && /2009/.test(r), 'un EAN que ya está en otro producto: avisa y pregunta · ' + r.slice(0, 160));
  await p.click('#v7Preg [data-v7p="no"]'); await p.waitForTimeout(500);
  D = await db();
  c(JSON.stringify((D.catalogoProductos['2009'] || {}).ean) === '["7790000000022"]' && !(D.catalogoProductos['2010'] && (D.catalogoProductos['2010'].ean || []).length), 'con «No» no cambia nada');
  await p.click('#eanBox [data-ean="asociar"]'); await p.waitForTimeout(600);
  await p.click('#v7Preg [data-v7p="si"]'); await p.waitForTimeout(800);
  D = await db();
  c(JSON.stringify(D.catalogoProductos['2010'].ean) === '["7790000000022"]' && JSON.stringify(D.catalogoProductos['2009'].ean) === '[]', 'con «Sí, pasarlo» queda solo en 2010 (nunca en dos) · ' + JSON.stringify([D.catalogoProductos['2009'].ean, D.catalogoProductos['2010'].ean]));
  await p.evaluate(() => { const m = document.getElementById('pfModal'); m && m.remove(); });
  // escanear desde el pañol: conocido → ficha
  await p.evaluate(() => { window.__codigoFalso = '7790000000015'; });
  await p.click('#esBtnPanol'); await p.waitForTimeout(700);
  r = await p.evaluate(() => { const f = document.getElementById('pfFoto'), m = document.getElementById('pfModal'); return { cod: f && f.dataset.cod, stock: m ? /Stock/.test(m.textContent) : false, vale: !!document.querySelector('#eanBox [data-ean="vale"]') }; });
  c(r.cod === '7015' && r.stock && r.vale, '«📷 Escanear» con un código conocido abre la ficha del producto con stock y «Hacer vale de salida» · ' + JSON.stringify(r));
  await p.click('#eanBox [data-ean="vale"]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ tipo: document.getElementById('stockMovTipo').value, prod: document.getElementById('stockMovProducto').value, vis: getComputedStyle(document.getElementById('cardStockRegistrar')).display }));
  c(r.tipo === 'salida' && /^7015 — /.test(r.prod) && r.vis !== 'none', '«Hacer vale de salida» lleva a Registrar movimiento con el producto puesto · ' + JSON.stringify(r));
  // desconocido → ¿a qué producto corresponde?
  await p.evaluate(() => window.__v135.irStock('inventario')); await p.waitForTimeout(400);
  await p.evaluate(() => { window.__codigoFalso = '7790000000039'; });
  await p.click('#esBtnPanol'); await p.waitForTimeout(700);
  r = await p.evaluate(() => { const v = document.getElementById('eanPreg'); return v ? v.textContent.replace(/\s+/g, ' ') : ''; });
  c(/¿A qué producto corresponde\?/.test(r) && /7790000000039/.test(r), 'código desconocido: «¿A qué producto corresponde?» con el buscador del catálogo · ' + r.slice(0, 120));
  await p.fill('#eanProd', '3017'); await p.click('#eanPreg [data-ep="ok"]'); await p.waitForTimeout(800);
  D = await db();
  r = await p.evaluate(() => (document.getElementById('pfFoto') || {}).dataset ? document.getElementById('pfFoto').dataset.cod : '');
  c(JSON.stringify((D.catalogoProductos['3017'] || {}).ean) === '["7790000000039"]' && r === '3017', 'lo asocia al producto elegido y abre su ficha');
  await p.evaluate(() => { const m = document.getElementById('pfModal'); m && m.remove(); });

  // ========================================================= 2b) app de Android 1.4: partialResults del plugin y modo charla
  await p.evaluate(() => {
    const L = {}; window.__ondaLog2 = []; window.__srModo = 'dicta';
    const emitir = (n, x) => (L[n] || []).slice().forEach((f) => f(x));
    window.Capacitor.Plugins.SpeechRecognition = {
      available: async () => ({ available: true }), checkPermissions: async () => ({ speechRecognition: 'granted' }), requestPermissions: async () => ({ speechRecognition: 'granted' }),
      addListener: async (n, cb) => { (L[n] = L[n] || []).push(cb); return { remove() { L[n] = (L[n] || []).filter((x) => x !== cb); } }; },
      start: async () => { const ps = ['hola', 'hola che']; ps.forEach((s, i) => setTimeout(() => { emitir('partialResults', { matches: [s] }); setTimeout(() => { const o = document.getElementById('iaOndaV'); window.__ondaLog2.push({ tx: document.getElementById('iaTxt').value, est: window.__iaOnda.estado(), vis: !!o && !o.hidden, modo: o && o.dataset.modo }); }, 80); }, 300 + i * 300));
        if (window.__srModo === 'dicta') setTimeout(() => emitir('listeningState', { state: 'stopped' }), 1100); },
      stop: async () => { emitir('listeningState', { state: 'stopped' }); }
    };
  });
  await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(600);
  await p.fill('#iaTxt', '');
  await p.click('#iaPanel [data-ia="mic"]'); await p.waitForTimeout(1700);
  r = await p.evaluate(() => ({ log: window.__ondaLog2, fin: document.getElementById('iaTxt').value, oculta: document.getElementById('iaOndaV').hidden }));
  c(r.log.length === 2 && r.log[0].tx === 'hola' && r.log[1].tx === 'hola che' && r.log.every((x) => x.vis && x.est.real === false && x.modo === 'dicta') && r.fin === 'hola che' && r.oculta, 'app 1.4: los resultados parciales del plugin van apareciendo en vivo, con la onda simulada · ' + JSON.stringify(r));
  await p.evaluate(() => { window.__ondaLog2 = []; window.__srModo = 'charla'; document.getElementById('iaTxt').value = ''; });
  await p.click('#iaPanel [data-ia="charla"]'); await p.waitForTimeout(1000);
  r = await p.evaluate(() => ({ log: window.__ondaLog2, viejaOculta: getComputedStyle(document.querySelector('#iaCharla .ia-onda')).display === 'none', charla: !document.getElementById('iaCharla').hidden }));
  c(r.charla && r.log.length === 2 && r.log[1].tx === 'hola che' && r.log.every((x) => x.vis && x.modo === 'charla') && r.viejaOculta, 'modo charla: lo que dice va apareciendo en el cuadro y se mueve la onda · ' + JSON.stringify(r.log.map((x) => [x.tx, x.modo])));
  await foto(p, 'v137_8_charla_onda', 0);
  await p.click('#iaCharla [data-ia="charlafin"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ oculta: document.getElementById('iaOndaV').hidden, on: window.__iaOnda.estado().on, charla: document.body.classList.contains('ia-charlando') }));
  c(r.oculta && !r.on && !r.charla, '«Terminar» corta la charla y apaga la onda · ' + JSON.stringify(r));
  await p.evaluate(() => { delete window.Capacitor.Plugins.SpeechRecognition; const x = document.querySelector('[data-ia="volver"]') || document.querySelector('[data-ia="cerrar"]'); x && x.click(); });
  await p.waitForTimeout(300);

  // ========================================================= 3) etiquetas QR de herramientas
  await p.evaluate(() => window.__v135.irStock('herramientas')); await p.waitForTimeout(1200);
  r = await p.evaluate(() => !!document.getElementById('etBtn'));
  c(r, 'Herramientas tiene «🏷 Imprimir etiquetas QR» y «📷 Escanear»');
  await p.click('#etBtn'); await p.waitForTimeout(400);
  r = await p.evaluate(() => document.querySelectorAll('#etOv .et-ch').length);
  c(r === 2, 'se eligen cuáles (las 2 herramientas, tildadas) · ' + r);
  await p.evaluate(() => { const ch = [...document.querySelectorAll('#etOv .et-ch')]; ch[1].checked = false; ch[1].dispatchEvent(new Event('change', { bubbles: true })); });
  await p.click('#etOv [data-et="imp"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const d = (document.querySelector('#hojaOv iframe') || {}).contentDocument; return d ? { n: d.querySelectorAll('.et').length, t: d.body.textContent.replace(/\s+/g, ' ') } : null; });
  const qrH = await decod(p, '.et img', true);
  c(r && r.n === 1 && /H-001/.test(r.t) && /Pinza amperométrica/.test(r.t) && !/H-002/.test(r.t), 'hoja A4 con la etiqueta elegida: QR, código H-001 y nombre · ' + JSON.stringify(r && r.n));
  c(qrH === BASE + '?doc=H-001', 'el QR de la etiqueta da la dirección de la herramienta · ' + qrH);
  await foto(p, 'v137_4_etiquetas_qr', 900);
  await p.evaluate(() => window.hojaEMA.cerrar(true));
  // escanear el QR de una herramienta → su ficha con entregar / devolver
  await p.evaluate(() => { window.__codigoFalso = 'https://miguelangelbasq-tech.github.io/alumbrado-stock/?doc=H-002'; });
  await p.click('#etBarra [data-v7esc]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const m = document.getElementById('hrModal'); return m ? { t: m.textContent.replace(/\s+/g, ' ').slice(0, 120), asig: !!m.querySelector('[data-hrp="asignar"]') } : null; });
  c(r && /H-002/.test(r.t) && r.asig, 'escanear el QR de una herramienta abre su ficha con «Asignar a una persona» (entregar) · ' + JSON.stringify(r));
  await p.evaluate(() => { const m = document.getElementById('hrModal'); m && m.remove(); });

  // ========================================================= 4) QR en el vale, la orden y la reserva
  await p.evaluate(() => window.verComprobanteMovimiento('m2')); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const d = (document.querySelector('#hojaOv iframe') || {}).contentDocument, q = d && d.querySelector('.ema-qr'); if (!q) return null; const a = q.getBoundingClientRect(), w = d.documentElement.clientWidth; return { der: Math.round(w - a.right), arriba: Math.round(a.top), w: Math.round(a.width), et: q.textContent, barras: !!d.querySelector('svg[class*=barcode], .barcode') }; });
  let qr = await decod(p, '.ema-qr img', true);
  c(r && r.der < 60 && r.arriba < 40 && r.w <= 90 && /S-0001/.test(r.et) && !r.barras, 'el vale tiene un QR chico arriba a la derecha (solo QR) · ' + JSON.stringify(r));
  c(qr === BASE + '?doc=S-0001', 'el QR del vale da …/?doc=S-0001 · ' + qr);
  await foto(p, 'v137_5_vale_con_qr', 900);
  await p.evaluate(() => window.hojaEMA.cerrar(true));
  await p.evaluate(() => window.imprimirOrdenTrabajo('ot1')); await p.waitForTimeout(1200);
  qr = await decod(p, '.ema-qr img', true);
  c(qr === BASE + '?doc=OT-2026-001', 'el QR de la orden da …/?doc=OT-2026-001 · ' + qr);
  await p.evaluate(() => window.hojaEMA.cerrar(true));
  await p.evaluate(() => { const r = (window.reservasMaterial || []).find((x) => x.numero === 'R-0001'); window.__rsImprimir.imprimir([r], 'Reserva R-0001 — Plaza San Martín'); }); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const d = (document.querySelector('#hojaOv iframe') || {}).contentDocument; return d ? d.querySelectorAll('.ema-qr, .ema-qr-r').length : -1; });
  qr = await decod(p, '.ema-qr-r img', true);
  c(r === 1 && qr === BASE + '?doc=R-0001', 'la reserva lleva un QR (uno solo) que da …/?doc=R-0001 · ' + qr);
  await p.evaluate(() => window.hojaEMA.cerrar(true));
  r = await p.evaluate(() => { const m = window.__codigos.matriz(window.__codigos.urlDoc('OT-2026-012')); return { n: m.length, ok: m.length >= 21 && (m.length - 17) % 4 === 0 }; });
  c(r.ok, 'el generador arma matrices QR válidas (21 + 4k módulos) · ' + JSON.stringify(r));

  // ========================================================= 5) ?doc= / ?obra= abren cada cosa
  const ir = async (q, ms) => { await p.goto('https://app.test/index.html' + q); await p.addScriptTag({ content: JSQR }); await p.waitForTimeout(ms || 6000); };
  await ir('?doc=S-0001');
  r = await p.evaluate(() => ({ hoja: window.hojaEMA.abierta() ? window.hojaEMA.actual().titulo : '', url: location.search }));
  c(/S-0001/.test(r.hoja) && !/doc=/.test(r.url), '?doc=S-0001 abre el vale en su hoja (y la dirección queda limpia) · ' + JSON.stringify(r));
  await foto(p, 'v137_6_abre_doc', 300);
  await ir('?doc=OT-2026-001');
  r = await p.evaluate(() => { const c = document.getElementById('parteResultCard'); return { vista: document.body.dataset.vista, vis: !!c && getComputedStyle(c).display !== 'none' && /OT-2026-001/.test(c.textContent) }; });
  c(r.vis, '?doc=OT-2026-001 abre la orden · ' + JSON.stringify(r));
  await ir('?doc=R-0001');
  r = await p.evaluate(() => { const c = document.querySelector('#cardStockReservas .rs-card[data-rsid="r1"]'); return { vis: !!c && c.getBoundingClientRect().height > 0, card: getComputedStyle(document.getElementById('cardStockReservas')).display }; });
  c(r.vis, '?doc=R-0001 abre la reserva en Pañol › Reservas · ' + JSON.stringify(r));
  await ir('?doc=H-001', 7000);
  r = await p.evaluate(() => { const m = document.getElementById('hrModal'); return m ? m.textContent.replace(/\s+/g, ' ').slice(0, 80) : ''; });
  c(/H-001/.test(r), '?doc=H-001 abre la ficha de la herramienta · ' + r);
  await ir('?obra=p1');
  r = await p.evaluate(() => ({ vista: document.body.dataset.vista, t: (document.getElementById('obrasApp') || {}).textContent || '' }));
  c(r.vista === 'obras' && /Plaza San Martín/i.test(r.t), '?obra=p1 abre el legajo de la obra · ' + r.vista);
  await A.browser.close();

  // sin permiso: el operario (pañol oculto) no ve el vale
  const B = await abrir({ sesion: 'juan', datos: datos(), cel, espera: 3000, https: true }), q = B.page;
  await q.goto('https://app.test/index.html?doc=S-0001'); await q.waitForTimeout(6000);
  r = await q.evaluate(() => ({ aviso: (document.getElementById('avisoApp') || {}).textContent || '', hoja: !!document.getElementById('hojaOv') }));
  c(/No tenés permiso para ver esto/.test(r.aviso) && !r.hoja, 'sin permiso: «No tenés permiso para ver esto» y no abre nada · ' + JSON.stringify(r));
  const errs = A.errores.concat(B.errores).filter((e) => !/jsQR|ResizeObserver/.test(e));
  c(!errs.length, 'sin errores de JavaScript · ' + errs.slice(0, 3).join(' | '));
  await B.browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
