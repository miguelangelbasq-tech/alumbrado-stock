// v136 · Inicio sin encimar y con el borde de arriba, campanita de línea en todas las pantallas, barra de abajo deslizable
// (opción B: guardar/abrir por toque y deslizando, recuerda, globito, sin el relleno de abajo), asistente con Opus 5.5 bien
// formado (sin temperature ni thinking, con fallbacks, effort, historia solo-agregar con los bloques de pensamiento tal cual),
// ⚙ modelos (Fable 5.2 / Sonnet 5.5) y caída a Sonnet con el Worker viejo, armar_pdf (abre la hoja), cierre rápido,
// supervisor (hallazgos, bloque en el Inicio, revisión con IA de las 12 h una sola vez y aviso) y Guías nuevas.
const fs = require('fs');
const { abrir, otraPagina, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
const URL_IA = 'https://ema-ia.mdiaz-60f.workers.dev/ia';
const CAP = process.env.CAP || '';
const GUIAS = process.env.APPDIR ? process.env.APPDIR + '/guias' : '';
function datos() {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy, anio = hoy.slice(0, 4);
  const hace = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() - n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  d.db.usuarios.uRol = { email: 'rolando@' + DOM, usuario: 'rolando', nombre: 'Rolando Velázquez', rol: 'cuadrilla', activo: true };   // sin persona vinculada
  d.cuentas['rolando@' + DOM] = { pass: 'clave123', uid: 'uRol' };
  d.db.usuarios.uOfi = { email: 'ofi@' + DOM, usuario: 'ofi', nombre: 'Olga Oficina', rol: 'oficina', activo: true };
  d.cuentas['ofi@' + DOM] = { pass: 'clave123', uid: 'uOfi' };
  Object.assign(d.db.avanceObras.p1, { lat: -31.41, lng: -64.18, tipoObra: 'plaza', valorItems: [{ id: 1, itemPliego: '5', cantidad: 10, cantidadAvanzada: 12 }, { id: 2, itemPliego: '15', cantidad: 100, cantidadAvanzada: 0 }] });
  d.db.avanceObras.p2 = { nombre: 'PLAZA GEORG NICOLAI', obraId: '4026', barrio: 'Alta Córdoba', direccion: 'Calle 1', creado: ahora, estado: 'En curso' };
  d.db.ordenesTrabajo.ot2 = { numero: `OT-${anio}-002`, fecha: hoy, plazaId: 'p2', plazaNombre: 'PLAZA GEORG NICOLAI', obraId: '4026', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['zanjeo'], previsto: { zanjeo: 10 }, actividadesManuales: [], estado: 'En curso', creado: ahora - 9e5,
    campo: { marcas: { zanjeo: { hecho: true, cant: 10, por: 'Juan Pérez' } }, tareaEnv: { zanjeo: { 'juan perez': { estado: 'si', ts: ahora - 3600e3, por: 'Juan Pérez' } } }, horasTarea: { zanjeo: { ini: '08:00', fin: '12:00', por: 'Juan Pérez' } }, enviados: { 'juan perez': { nombre: 'Juan Pérez', ts: ahora - 3600e3 } } } };
  d.db.ordenesTrabajo.ot3 = { numero: `OT-${anio}-003`, fecha: hoy, plazaId: 'p2', plazaNombre: 'PLAZA GEORG NICOLAI', obraId: '4026', personal: [{ nombre: 'Pedro Gómez', rol: 'Ayudante' }], personalNombres: ['pedro gomez'], actividades: ['zanjeo'], previsto: { zanjeo: 5 }, actividadesManuales: [], estado: 'Emitida', creado: ahora - 8e5 };
  d.db.ordenesTrabajo.ot4 = { numero: `OT-${anio}-004`, fecha: hace(4), plazaId: 'p2', plazaNombre: 'PLAZA GEORG NICOLAI', obraId: '4026', personal: [{ nombre: 'Pedro Gómez', rol: 'Ayudante' }], personalNombres: ['pedro gomez'], actividades: [], actividadesManuales: [{ actividad: 'Limpieza', detalle: '' }], estado: 'Emitida', creado: ahora - 4 * 864e5 };
  d.db.movimientos = { m1: { tipo: 'entrada', codigo: 3017, desc: 'Fusible cilíndrico 10×38 2 A', un: 'Un.', cantidad: 10, fecha: hoy, ts: ahora - 5e5, usuario: 'admin@x', precioUnit: 100 } };
  return d;
}
(async () => {
  const c = prueba('v136' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 4000, nav: true, inicio: true, supervisor: true, iaPro: true, guias: true, mtNuevo: true, ofPasos: true, tarjetas: true, porPartes: true, https: true };
  const d0 = datos();
  const A = await abrir(Object.assign({ sesion: 'admin', datos: d0 }, MOD)), p = A.page;
  p.on('dialog', (x) => x.accept());
  const foto = async (pg, nom, ms) => { if (cel && CAP) { await pg.waitForTimeout(ms == null ? 900 : ms); await pg.screenshot({ path: CAP + '/' + nom + '.png' }); } };
  const db = () => p.evaluate(() => window.__stubDB());
  await p.waitForTimeout(1500);

  // ========================================================= 1) Inicio: las tarjetas debajo de la portada, borde de arriba, buscador
  let r = await p.evaluate(() => {
    const h = document.getElementById('ieHero').getBoundingClientRect();
    const tj = [...document.querySelectorAll('#iniEje .ie-tarj')].filter((x) => getComputedStyle(x).display !== 'none').map((x) => ({ id: x.id, top: Math.round(x.getBoundingClientRect().top) }));
    return { heroBottom: Math.round(h.bottom), tj, bg: getComputedStyle(document.getElementById('ieAtender')).backgroundColor };
  });
  c(r.tj.length >= 4 && r.tj.every((x) => x.top >= r.heroBottom + 8), 'todas las tarjetas del Inicio empiezan debajo de la portada azul (sin encimar) · hero ' + r.heroBottom + ' · ' + JSON.stringify(r.tj));
  c(/rgba\(255, 255, 255, 0\.8/.test(r.bg), '«Para atender» es una tarjeta blanca normal · ' + r.bg);
  r = await p.evaluate(async () => {
    document.documentElement.style.setProperty('--safe-area-inset-top', '30px'); await new Promise((ok) => setTimeout(ok, 50));
    const hero = getComputedStyle(document.getElementById('ieHero')).paddingTop, rel = document.getElementById('ieReloj'), rr = rel ? rel.getBoundingClientRect() : null;
    const o = { hero, reloj: rr ? { top: rr.top, h: Math.round(rr.height), pos: getComputedStyle(rel).position, z: getComputedStyle(rel).zIndex } : null, cls: document.body.classList.contains('ie-hero') };
    document.documentElement.style.removeProperty('--safe-area-inset-top'); return o;
  });
  c(r.hero === '42px' && r.reloj && r.reloj.top === 0 && r.reloj.h === 30 && r.reloj.pos === 'fixed' && r.cls, 'con el borde de arriba del celu (30 px) la portada baja 30 px y una franja fija tapa el reloj al subir · ' + JSON.stringify(r));
  if (cel) {
    r = await p.evaluate(() => {
      const i = document.getElementById('ieBuscar'), cs = getComputedStyle(i, '::placeholder'), cv = document.createElement('canvas').getContext('2d');
      cv.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; return { w: Math.ceil(cv.measureText(i.placeholder).width), caja: i.clientWidth, fs: cs.fontSize };
    });
    c(r.w <= r.caja, 'en 390 px entra «Buscar obra o barrio…» entero · ' + JSON.stringify(r));
  }
  r = await p.evaluate(() => { const s = document.getElementById('ieSuper'), a = document.getElementById('ieAtender'); return { vis: !!s && getComputedStyle(s).display !== 'none', debajo: !!s && !!a && s.getBoundingClientRect().top >= a.getBoundingClientRect().bottom - 1, t: s ? s.textContent.replace(/\s+/g, ' ') : '', rojo: !!(s && s.querySelector('.ie-ic.rj')) }; });
  c(r.vis && r.debajo && /Supervisor/.test(r.t) && /hechas de más/.test(r.t) && r.rojo, 'bloque «🩺 Supervisor» debajo de «Para atender», con los hallazgos en rojo/ámbar · ' + r.t.slice(0, 200));
  await foto(p, 'v136_1_inicio_arriba', 1600);

  // ========================================================= 2) campanita de línea en varias pantallas
  const camp = () => p.evaluate(() => { const b = document.getElementById('avCampana'); if (!b) return null; const cs = getComputedStyle(b); return { svg: !!b.querySelector('svg.av-ic'), emoji: /🔔/.test(b.textContent), color: cs.color, vis: cs.display !== 'none' && b.getBoundingClientRect().width >= 40 }; });
  const pant = {};
  for (const v of ['stock', 'parte', 'mapa', 'obras']) { await p.evaluate((x) => window.mostrarVista(x), v); await p.waitForTimeout(500); pant[v] = await camp(); }
  c(Object.keys(pant).every((k) => pant[k] && pant[k].svg && !pant[k].emoji && pant[k].color === 'rgb(40, 40, 94)' && pant[k].vis), 'la campana es de línea, navy y sin 🔔 en Pañol, Órdenes, Mapa y Obras · ' + JSON.stringify(pant));
  await p.evaluate(() => { window.__emaAvisos && window.__emaAvisos.agregar ? window.__emaAvisos.agregar({ id: 'x1', titulo: 'Prueba', cuerpo: 'algo' }) : null; });

  // ========================================================= 3) barra de abajo B (celular)
  if (cel) {
    await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(900);
    const est = () => p.evaluate(() => { const n = document.getElementById('navN1'), t = document.getElementById('navTab'), rn = n.getBoundingClientRect(), rt = t ? t.getBoundingClientRect() : null, bd = t && t.querySelector('.nt-bd');
      return { guardada: document.body.classList.contains('n1-guardada'), navDer: Math.round(rn.right), tabVis: !!rt && getComputedStyle(t).display !== 'none' && rt.width > 0, tabLeft: rt ? Math.round(rt.left) : null, tabW: rt ? Math.round(rt.width) : 0, tabH: rt ? Math.round(rt.height) : 0, bd: bd ? bd.textContent : '', suma: window.__navGuardar.pendientes(), pad: parseFloat(getComputedStyle(document.body).paddingBottom), ls: localStorage.getItem('ema.nav.guardada'), flecha: !!n.querySelector('[data-n1g]') }; });
    r = await est();
    c(r.flecha && !r.guardada && !r.tabVis && r.pad >= 90, 'abierta: la barra tiene la flechita ‹ a la derecha y el contenido deja lugar abajo · ' + JSON.stringify(r));
    await p.click('#navN1 [data-n1g]'); await p.waitForTimeout(600);
    r = await est();
    c(r.guardada && r.navDer <= 0 && r.tabVis && r.tabLeft === 0 && r.tabW >= 44 && r.tabH >= 44 && r.ls === '1' && r.pad < 60, 'tocar la flechita la guarda: se va a la izquierda, queda la lengüeta al borde izquierdo (44 px), sin el relleno de abajo y lo recuerda · ' + JSON.stringify(r));
    c(r.suma > 0 && r.bd === String(r.suma), 'la lengüeta lleva el globito con el total de pendientes · ' + JSON.stringify({ bd: r.bd, suma: r.suma }));
    await foto(p, 'v136_2_barra_guardada');
    await p.click('#navTab'); await p.waitForTimeout(600);
    r = await est();
    c(!r.guardada && r.navDer > 300 && !r.tabVis && r.ls === '0', 'tocar la lengüeta la trae de vuelta · ' + JSON.stringify(r));
    // deslizar la barra a la izquierda
    let b = await p.evaluate(() => { const x = document.querySelector('#navN1 [data-n1="obras"]').getBoundingClientRect(); return { x: x.left + x.width / 2, y: x.top + x.height / 2 }; });
    await p.mouse.move(b.x, b.y); await p.mouse.down(); for (let i = 1; i <= 8; i++) await p.mouse.move(b.x - i * 18, b.y); await p.mouse.up(); await p.waitForTimeout(600);
    r = await est();
    const vista1 = await p.evaluate(() => document.body.dataset.vista);
    c(r.guardada && r.navDer <= 0 && vista1 !== 'obras', 'deslizar la barra a la izquierda la guarda (y no abre la pestaña que se tocó) · ' + JSON.stringify({ g: r.guardada, vista1 }));
    b = await p.evaluate(() => { const x = document.getElementById('navTab').getBoundingClientRect(); return { x: x.left + 12, y: x.top + x.height / 2 }; });
    await p.mouse.move(b.x, b.y); await p.mouse.down(); for (let i = 1; i <= 5; i++) await p.mouse.move(b.x + i * 14, b.y); await p.mouse.up(); await p.waitForTimeout(600);
    r = await est();
    c(!r.guardada && r.navDer > 300, 'deslizar la lengüeta a la derecha la trae · ' + JSON.stringify(r));
    await p.click('#navN1 [data-n1g]'); await p.waitForTimeout(300);
    await p.reload(); await p.waitForTimeout(4500);
    r = await est();
    c(r.guardada && r.tabVis, 'al volver a abrir la app sigue guardada (ema.nav.guardada) · ' + JSON.stringify(r));
    await p.click('#navTab'); await p.waitForTimeout(500);
  }

  // ========================================================= 4) asistente: el Worker simulado
  const pedidos = [], cola = []; let viejo = false;
  await p.route(URL_IA, async (rt) => {
    const req = rt.request(); let b = null; try { b = JSON.parse(req.postData() || 'null'); } catch (e) { }
    pedidos.push({ b });
    if (viejo && b && b.model !== 'claude-sonnet-5-5') return rt.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'pedido', mensaje: 'Ese modelo no está permitido. Usá «claude-haiku-5-5» o «claude-sonnet-5-5».' } }) });
    const f = cola.shift(), x = typeof f === 'function' ? f(b) : f;
    if (!x) return rt.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'prueba', mensaje: 'sin guion' } }) });
    return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x) });
  });
  let n = 0;
  const PENS = { type: 'thinking', thinking: '', signature: 'firma-de-prueba' };
  const usa = (name, input, txt) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [PENS, { type: 'text', text: txt || 'Me fijo.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01 } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [PENS, { type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02 } });
  const esperarLibre = async (pg) => { for (let i = 0; i < 80; i++) { await pg.waitForTimeout(150); const ok = await pg.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; }); if (ok) return; } };
  async function preguntar(t, guion) { cola.push(...guion); const n0 = pedidos.length; await p.fill('#iaTxt', t); await p.click('#iaEnviar'); await p.waitForTimeout(250); await esperarLibre(p); return pedidos.slice(n0); }
  const ultimaB = (sel) => p.evaluate((s) => { const l = document.querySelectorAll('#iaChat ' + s); return l.length ? l[l.length - 1].textContent.replace(/\s+/g, ' ') : ''; }, sel || '.ia-b.ia');
  await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(400);
  await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(700);
  let ps = await preguntar('contame de san martin', [usa('datos_obra', { obraId: 'san martin' }), fin('Tiene 10 columnas.')]);
  const b0 = ps[0] && ps[0].b, b1 = ps[1] && ps[1].b;
  c(b0 && b0.model === 'claude-opus-5-5' && b0.output_config.effort === 'medium' && b0.max_tokens === 16000 && b0.tool_choice.type === 'auto', 'por defecto el asistente usa Opus 5.5 con effort «medium», 16.000 tokens y tool_choice auto · ' + JSON.stringify(b0 && [b0.model, b0.output_config, b0.max_tokens]));
  c(b0 && !('temperature' in b0) && !('top_p' in b0) && !('top_k' in b0) && !('thinking' in b0) && b0.fallbacks === 'default' && (b0.betas || []).includes('server-side-fallback-2026-07-01') && b0.cache_control && b0.cache_control.type === 'ephemeral', 'sin temperature/top_p/top_k ni thinking; con fallbacks «default», la beta del respaldo y caché · ' + JSON.stringify(Object.keys(b0 || {})));
  const asis1 = b1 && b1.messages[b1.messages.length - 2];
  c(asis1 && asis1.role === 'assistant' && JSON.stringify(asis1.content[0]) === JSON.stringify(PENS) && b1.messages[b1.messages.length - 1].content[0].type === 'tool_result', 'el bloque de pensamiento vuelve TAL CUAL en la vuelta siguiente');
  ps = await preguntar('gracias', [fin('De nada.')]);
  const b2 = ps[0] && ps[0].b;
  c(b2 && JSON.stringify(b2.messages.slice(0, b1.messages.length)) === JSON.stringify(b1.messages) && JSON.stringify(b2.messages).split('firma-de-prueba').length - 1 === 2, 'en la pregunta siguiente la historia es la misma, solo se agrega (los dos bloques de pensamiento siguen) · ' + (b2 ? b2.messages.length : 0));
  // «revisá todo» → modelo del supervisor con effort high, usando la herramienta supervisor
  ps = await preguntar('revisá todo', [usa('supervisor', {}), fin('Acá hay algo raro: San Martín tiene hechas de más.')]);
  const trS = ps[1] && JSON.parse(ps[1].b.messages[ps[1].b.messages.length - 1].content[0].content);
  c(ps[0] && ps[0].b.model === 'claude-opus-5-5' && ps[0].b.output_config.effort === 'high' && trS && trS.total >= 3 && trS.hallazgos.some((h) => h.gravedad === 'rojo' && /hechas de más/.test(h.que)), '«revisá todo»: Opus 5.5 con effort «high» y la herramienta supervisor trae los hallazgos · ' + JSON.stringify(ps[0] && ps[0].b.output_config) + ' · ' + (trS && trS.total));

  // ⚙ (admin): Fable 5.2 para el asistente y Sonnet 5.5 para el supervisor, con el costo por pregunta
  await p.click('#iaPanel [data-ia="cfg"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => { const s = document.getElementById('iaModelo'); return { hay: !!s, ops: s ? [...s.options].map((o) => o.textContent) : [], sel: s ? s.value : '' }; });
  c(r.hay && r.ops.length === 3 && r.sel === 'claude-opus-5-5' && r.ops.every((o) => /US\$ \d+,\d\d por pregunta/.test(o)) && /Opus 5\.5 · recomendado/.test(r.ops.join()) && /Fable 5\.2 · el más pro/.test(r.ops.join()) && /Sonnet 5\.5 · el más barato/.test(r.ops.join()), '⚙ Modelo: Opus 5.5 (recomendado) · Fable 5.2 (el más pro) · Sonnet 5.5 (el más barato) con el costo aproximado · ' + JSON.stringify(r.ops));
  await p.selectOption('#iaModelo', 'claude-fable-5-2'); await p.selectOption('#iaModeloSup', 'claude-sonnet-5-5');
  await p.click('#iaPanel [data-ia="cfgmodelos"]'); await p.waitForTimeout(700);
  let s = await db();
  const asis = ((s.configEquipo || {}).personal || {}).asistente || {};
  c(asis.modelo === 'claude-fable-5-2' && asis.modeloSupervisor === 'claude-sonnet-5-5' && /Guardado/.test(await p.evaluate(() => document.getElementById('iaModMsg').textContent)), 'se guarda para todo el equipo en configEquipo/personal.asistente · ' + JSON.stringify(asis));
  await p.click('#iaPanel [data-ia="volver"]'); await p.waitForTimeout(300);
  ps = await preguntar('contame lo de los fusibles', [fin('Hay 10.')]);   // v137: «¿y el stock…?» es dato simple (effort low)
  const bf = ps[0] && ps[0].b;
  c(bf && bf.model === 'claude-fable-5-2' && bf.output_config.effort === 'high' && bf.max_tokens === 16000 && !('thinking' in bf) && !('temperature' in bf) && bf.fallbacks === 'default' && bf.tool_choice.type === 'auto', 'con Fable 5.2 elegido: pedido bien formado (effort high, sin thinking ni temperature, fallbacks, tool_choice auto) · ' + JSON.stringify(bf && [bf.model, bf.output_config, bf.max_tokens]));
  await p.evaluate(() => firebase.firestore().collection('configEquipo').doc('personal').set({ asistente: { modelo: 'claude-opus-5-5', modeloSupervisor: 'claude-opus-5-5' } }, { merge: true }));
  await p.waitForTimeout(600);
  // Worker viejo → Sonnet 5.5 y aviso una sola vez
  viejo = true;
  ps = await preguntar('¿qué falta en san martin?', [fin('Falta el tablero.')]);
  r = await p.evaluate(() => [...document.querySelectorAll('#iaChat .ia-b.nota')].map((x) => x.textContent).filter((t) => /actualizá el Worker/.test(t)).length);
  c(ps.length === 2 && ps[0].b.model === 'claude-opus-5-5' && ps[1].b.model === 'claude-sonnet-5-5' && /Falta el tablero/.test(await ultimaB()) && r === 1, 'Worker viejo: «modelo no permitido» → sigue con Sonnet 5.5 y avisa «actualizá el Worker (ver instructivo)» · ' + JSON.stringify(ps.map((x) => x.b.model)));
  ps = await preguntar('¿y en georg?', [fin('Nada.')]);
  r = await p.evaluate(() => [...document.querySelectorAll('#iaChat .ia-b.nota')].filter((x) => /actualizá el Worker/.test(x.textContent)).length);
  c(ps.length === 1 && ps[0].b.model === 'claude-sonnet-5-5' && r === 1, 'después va directo con Sonnet y no vuelve a avisar · ' + JSON.stringify(ps.map((x) => x.b.model)));
  viejo = false; await p.evaluate(() => { window.__iaModelos.workerNuevo(); });

  // ========================================================= 5) armar_pdf
  ps = await preguntar('pasame el stock de fusibles en pdf', [usa('armar_pdf', { tipo: 'stock', ref: 'fusible' }), fin('Ahí tenés el PDF.')]);
  await p.waitForTimeout(900);
  r = await p.evaluate(() => { const a = window.hojaEMA && window.hojaEMA.actual(); return { abierta: !!(window.hojaEMA && window.hojaEMA.abierta()), t: a ? a.titulo : '', doc: a ? a.doc : '', btns: [...document.querySelectorAll('#hojaOv [data-hj]')].map((b) => b.dataset.hj) }; });
  c(r.abierta && /Stock del pañol/.test(r.t) && /3017/.test(r.doc) && /Fusible/.test(r.doc) && /PAÑOL · STOCK/.test(r.doc) && r.btns.includes('imprimir') && r.btns.includes('compartir'), 'armar_pdf «stock»: abre la hoja de la app (logo, A4) con Imprimir / Compartir PDF · ' + JSON.stringify({ t: r.t, btns: r.btns }));
  await foto(p, 'v136_6_pdf_ia', 600);
  await p.evaluate(() => window.hojaEMA.cerrar()); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(400);
  const md = '# Informe de la semana\n\n- Se cerraron **2** órdenes\n- Falta el tablero\n\n| Obra | Avance |\n|---|---|\n| SAN MARTÍN | 40 % |';
  ps = await preguntar('armame un informe en pdf', [usa('armar_pdf', { tipo: 'libre', titulo: 'Informe semanal', contenido: md, firmas: true, quienes_firman: ['Jefe de obra'] }), fin('Listo.')]);
  await p.waitForTimeout(900);
  r = await p.evaluate(() => { const a = window.hojaEMA && window.hojaEMA.actual(); return { t: a ? a.titulo : '', doc: a ? a.doc : '' }; });
  c(/Informe semanal/.test(r.t) && /<h3>Informe de la semana<\/h3>/.test(r.doc) && /<table>/.test(r.doc) && /SAN MARTÍN/.test(r.doc) && /Jefe de obra · firma/.test(r.doc) && !/tabla-tarjetas/.test(r.doc), 'armar_pdf «libre»: el markdown de la IA se vuelve hoja (títulos, listas, tabla) con firmas al pie');
  await p.evaluate(() => window.hojaEMA.cerrar()); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(400);
  ps = await preguntar('la planilla de la 002', [usa('armar_pdf', { tipo: 'orden', ref: '002' }), fin('Ahí está.')]);
  await p.waitForTimeout(900);
  r = await p.evaluate(() => { const a = window.hojaEMA && window.hojaEMA.actual(); return a ? a.titulo : ''; });
  c(/Orden de trabajo OT-\d{4}-002/.test(r), 'armar_pdf «orden»: la planilla de la OT de siempre · ' + r);
  await p.evaluate(() => window.hojaEMA.cerrar()); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(400);

  // ========================================================= 6) cierre rápido
  const anio = d0.hoy.slice(0, 4);
  ps = await preguntar('cerrá las de hoy', [usa('proponer_cierre', { fecha: 'hoy' }), fin(`OT-${anio}-002: ✅ Lista. OT-${anio}-003: ⚠ Le falta todo.`)]);
  const trC = ps[1] && JSON.parse(ps[1].b.messages[ps[1].b.messages.length - 1].content[0].content);
  c(ps[0] && ps[0].b.output_config.effort === 'low' && ps.length === 2, 'cierre rápido: effort «low» y una sola vuelta de herramientas · ' + JSON.stringify(ps.map((x) => x.b.output_config)));
  const o2 = trC && trC.ordenes.find((o) => /002/.test(o.numero)), o3 = trC && trC.ordenes.find((o) => /003/.test(o.numero));
  c(o2 && o2.lista && o3 && !o3.lista && o3.leFalta.some((m) => /no mandó nada|todavía no mandó/.test(m)), 'revisa cada orden: la 002 lista, la 003 «le falta» (la cuadrilla no mandó nada) · ' + JSON.stringify(trC && trC.ordenes).slice(0, 300));
  r = await p.evaluate(() => { const l = document.querySelectorAll('#iaChat .ia-conf'), x = l[l.length - 1]; return { t: x ? x.textContent.replace(/\s+/g, ' ') : '', btns: x ? [...x.querySelectorAll('button')].map((b) => b.textContent.trim()) : [] }; });
  c(/✅/.test(r.t) && /Lista/.test(r.t) && /Le falta/.test(r.t) && r.btns.some((b) => /^Cerrar la lista/.test(b)) && r.btns.some((b) => /^Cerrar igual/.test(b)) && r.btns.includes('No'), 'tarjeta: «✅ Lista» / «⚠ Le falta…» con «Cerrar» / «Cerrar igual» / «No» · ' + JSON.stringify(r.btns));
  await foto(p, 'v136_5_cierre_rapido', 400);
  s = await db();
  c(!(s.ordenesTrabajo.ot2.cierre && s.ordenesTrabajo.ot2.cierre.cerradoTs), 'antes del Sí no se cierra nada');
  await p.click('#iaChat .ia-conf:last-of-type [data-iasi]');
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); s = await db(); if (s.ordenesTrabajo.ot2.cierre && s.ordenesTrabajo.ot2.cierre.cerradoTs) break; }
  await p.waitForTimeout(1500);
  s = await db();
  c(s.ordenesTrabajo.ot2.cierre && s.ordenesTrabajo.ot2.cierre.cerradoTs && !(s.ordenesTrabajo.ot3.cierre && s.ordenesTrabajo.ot3.cierre.cerradoTs), 'con «Cerrar» se cierra la lista con el cierre de siempre («✅ Aprobar todo y cerrar»), sin tocar nada más; la que le falta queda abierta · ' + JSON.stringify(s.ordenesTrabajo.ot2.cierre ? Object.keys(s.ordenesTrabajo.ot2.cierre) : null));
  for (let i = 0; i < 30; i++) { if (!(await p.evaluate(() => !!document.getElementById('iaCola')))) break; await p.waitForTimeout(250); }
  r = await p.evaluate(() => ({ cola: !!document.getElementById('iaCola'), cierre: (document.getElementById('cierreOt') || { style: {} }).style.display }));
  c(!r.cola && r.cierre === 'none', 'la ventana del cierre se cerró sola y no queda la barra de la cola · ' + JSON.stringify(r));
  await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(300);

  // ========================================================= 7) supervisor: hallazgos, «Ver todo», revisión con IA de las 12 h
  r = await p.evaluate(() => window.__supervisor.hallazgos({ ahora: true }).map((h) => h.g + '|' + h.cat + '|' + h.t));
  c(r.some((x) => /^rojo\|Itemizado\|.*hechas de más/.test(x)) && r.some((x) => /días anteriores sin cerrar/.test(x)) && r.some((x) => /sin persona vinculada/.test(x)) && r.some((x) => /^info\|Al día\|.*sin Gantt/.test(x)), 'supervisor: hechas de más (rojo), órdenes viejas sin cerrar, usuario sin persona y «sin Gantt no sé si van al día» · ' + JSON.stringify(r));
  await p.evaluate(() => window.__inicioPro.pintar()); await p.waitForTimeout(300);
  await p.click('#ieSuper [data-sup="todo"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => { const o = document.getElementById('spHoja'); return { vis: !!o && !o.hidden, n: o ? o.querySelectorAll('.sp-it').length : 0, grupos: o ? [...o.querySelectorAll('.sp-grupo')].map((g) => g.textContent) : [], ir: o ? o.querySelectorAll('.sp-it [data-sup]').length : 0 }; });
  c(r.vis && r.n >= 4 && r.ir >= 3 && r.grupos.includes('Itemizado') && r.grupos.includes('Equipo'), '«Ver todo» abre la hoja con cada hallazgo, por tema y con «Ir» · ' + JSON.stringify(r));
  await foto(p, 'v136_3_supervisor');
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado con la hoja del supervisor · ' + sw); }
  await p.click('#spHoja [data-sup="cerrar"]'); await p.waitForTimeout(200);
  const slot = d0.hoy + '-12', nAv0 = Object.keys((await db()).avisosPush || {}).length;
  cola.push((b) => fin('Acá hay algo raro: PLAZA SAN MARTÍN tiene 12 columnas hechas de 10 (ítem 5). Urgente: revisar el itemizado.'));
  const n0 = pedidos.length;
  await p.evaluate((sl) => { window.__supNoIA = false; window.__supSlotPrueba = sl; return window.__supervisor.tic(); }, slot);
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (!(await p.evaluate(() => window.__supervisor.estado().revisando)) && pedidos.length > n0) break; }
  await p.waitForTimeout(800);
  s = await db();
  const pr = pedidos.slice(n0), sal = ((s.configEquipo || {}).salud || {}).supervisor || {};
  const ultU = pr[0] && pr[0].b.messages[pr[0].b.messages.length - 1];   // v137: el mensaje lleva antes el bloque de contexto
  c(pr.length === 1 && pr[0].b.model === 'claude-opus-5-5' && pr[0].b.output_config.effort === 'high' && /Revisión automática del supervisor de las 12 h/.test(JSON.stringify(ultU.content)) && /hechas de más/.test(JSON.stringify(ultU.content)), 'a las 12 h: una revisión con Opus 5.5 (effort high) con los hallazgos y los datos de las obras marcadas · ' + pr.length);
  c(sal.slots && sal.slots[slot] && sal.slots[slot].estado === 'hecho' && sal.ultimo && /algo raro/.test(sal.ultimo.parte), 'el parte queda en configEquipo/salud.supervisor (para los otros aparatos) · ' + JSON.stringify(sal.slots));
  const avs = Object.values(s.avisosPush || {}).filter((a) => /El supervisor encontró/.test(a.titulo || ''));
  c(Object.keys(s.avisosPush || {}).length > nAv0 && avs.length >= 1 && avs[0].email === 'admin@' + DOM, 'como hay algo rojo, avisa al celular de Administración · ' + JSON.stringify(avs.map((a) => [a.titulo, a.email])));
  r = await p.evaluate(() => [...document.querySelectorAll('#iaChat .ia-b')].slice(-2).map((x) => x.textContent.replace(/\s+/g, ' ')));
  c(r.length === 2 && /Revisión automática del supervisor/.test(r[0]) && /algo raro/.test(r[1]), 'el parte queda también en el chat del asistente · ' + JSON.stringify(r).slice(0, 200));
  await p.evaluate(() => window.__inicioPro.pintar()); await p.waitForTimeout(300);
  r = await p.evaluate(() => (document.querySelector('#ieSuper .sp-parte') || {}).textContent || '');
  c(/Parte de las 12:00/.test(r) && /algo raro/.test(r), 'el parte aparece en el Inicio · ' + r.slice(0, 120));
  // otro aparato (oficina) a la misma hora: no repite la revisión
  const O = await otraPagina(A, Object.assign({}, MOD, { sesion: 'ofi' })), q = O.page;
  const pedQ = []; await q.route(URL_IA, (rt) => { pedQ.push(1); rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fin('otra')) }); });
  await q.waitForTimeout(1500);
  await q.evaluate((sl) => { window.__supNoIA = false; window.__supSlotPrueba = sl; return window.__supervisor.tic(); }, slot);
  await q.waitForTimeout(1500);
  r = await q.evaluate(() => window.__supervisor.estado());
  c(pedQ.length === 0 && r.parte && /algo raro/.test(r.parte.parte), 'en otro aparato no se hace dos veces la misma revisión (y ve el parte) · ' + pedQ.length);
  await q.close();

  // ========================================================= 8) Guías nuevas
  global.__guiasPedidos = [];
  await p.evaluate(() => { window.__asistente && window.__asistente.cerrar(); window.mostrarVista('guias'); }); await p.waitForTimeout(1500);
  r = await p.evaluate(() => [...document.querySelectorAll('#guiasApp .gq-card img.gn-tapa')].map((i) => i.getAttribute('src')));
  c(r.length >= 9 && r.every((x) => /guias\/pasos\/[a-z_0-9]+_tapa\.webp$/.test(x)), 'Procesos: cada guía muestra la tapa nueva (guias/pasos/…_tapa.webp) · ' + r.length);
  await foto(p, 'v136_4_guias_procesos', 1200);
  await p.click('#guiasApp .gq-card[data-gq-abrir="fundacion_prfv"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const b = document.querySelector('.gn-pasos'); return { hay: !!b, pags: b ? [...b.querySelectorAll('.gn-pag img')].map((i) => i.getAttribute('src')) : [], pdf: !!(b && b.querySelector('[data-gnpdf="compartir"]') && b.querySelector('[data-gnpdf="bajar"]')), viejo: !!document.querySelector('.gq-guia .gn-viejo .gq-pasos') }; });
  c(r.hay && r.pags.length === 4 && /guias\/pasos\/fundacion_prfv_p1\.webp$/.test(r.pags[0]) && r.pdf && r.viejo, 'adentro: las 4 hojas del paso a paso, «📄 PDF» (compartir / bajar) y los dibujos de antes plegados · ' + JSON.stringify(r).slice(0, 220));
  await p.waitForTimeout(800);
  c(global.__guiasPedidos.some((x) => /fundacion_prfv_p1\.webp$/.test(x)) && !global.__guiasPedidos.some((x) => /montaje_prfv_p1\.webp$/.test(x)), 'las hojas se bajan recién al abrir la guía (solo las de esa) · ' + global.__guiasPedidos.filter((x) => /_p\d/.test(x)).length);
  await p.click('.gn-pasos .gn-pag'); await p.waitForTimeout(700);
  r = await p.evaluate(() => { const v = document.getElementById('mfVisor'); return v ? (v.querySelector('img') || {}).getAttribute('src') : null; });
  c(/guias\/pasos\/fundacion_prfv_p1\.webp$/.test(r || ''), 'tocar una hoja la abre en el visor claro con zoom · ' + r);
  await p.evaluate(() => window.__matFichas.cerrarVisor());
  const nPdf = global.__guiasPedidos.length;
  const dl = p.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await p.click('.gn-pasos [data-gnpdf="bajar"]');
  const dlx = await dl; await p.waitForTimeout(500);
  c(global.__guiasPedidos.slice(nPdf).some((x) => /pasos\/fundacion_prfv\.pdf$/.test(x)) && dlx && /fundacion_prfv_paso_a_paso\.pdf$/.test(dlx.suggestedFilename()), '«⬇ Bajar PDF» baja guias/pasos/fundacion_prfv.pdf · ' + (dlx && dlx.suggestedFilename()));
  // tipos constructivos
  await p.evaluate(() => { const b = document.querySelector('#guiasApp [data-gq="volver"]'); b && b.click(); }); await p.waitForTimeout(400);
  await p.click('#guiasApp [data-gq-tab="tipos"]'); await p.waitForTimeout(900);
  r = await p.evaluate(() => [...document.querySelectorAll('#guiasApp .gq-card img.gn-tapa')].map((i) => i.getAttribute('src')));
  c(r.length >= 20 && r.every((x) => /guias\/tipos\/[a-z_0-9]+_3d\.webp$/.test(x)), 'Tipos constructivos: la lista con el 3D nuevo · ' + r.length);
  await p.click('#guiasApp .gq-card[data-gq-abrir="AP-TC-001"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => { const b = document.querySelector('.gn-tipo'); return { hay: !!b, im: b ? (b.querySelector('img') || {}).getAttribute('src') : '', plano: b ? (b.querySelector('[data-gnver$="_plano.webp"]') || {}).dataset : null }; });
  c(r.hay && /guias\/tipos\/ap_tc_001_3d\.webp$/.test(r.im) && r.plano && /ap_tc_001_plano\.webp$/.test(r.plano.gnver), 'AP-TC-001: la hoja nueva (3D, 📐 Plano, 🗂 Hoja completa) · ' + JSON.stringify(r).slice(0, 200));
  await foto(p, 'v136_4b_guias_tipo', 1400);
  // materiales
  await p.evaluate(() => { const b = document.querySelector('#guiasApp [data-gq="volver"]'); b && b.click(); }); await p.waitForTimeout(300);
  await p.click('#guiasApp [data-gq-tab="materiales"]'); await p.waitForTimeout(900);
  r = await p.evaluate(() => ({ tapas: document.querySelectorAll('#guiasApp .gq-card img.gn-tapa').length, otras: document.querySelectorAll('#gnOtras .gn-mat').length, src: (document.querySelector('#guiasApp .gq-card img.gn-tapa') || {}).src || '' }));
  c(r.tapas >= 20 && /materiales\/mat_[a-z_0-9]+_3d\.webp$/.test(r.src) && r.otras >= 10, 'Materiales: cada familia con su hoja nueva (de materiales/) y «Más hojas de materiales» · ' + JSON.stringify(r));
  const fam = await p.evaluate(() => { const x = document.querySelector('#guiasApp .gq-card[data-gq-abrir="jabalina"]') || document.querySelector('#guiasApp .gq-card img.gn-tapa').closest('.gq-card'); x.click(); return x.dataset.gqAbrir; });
  await p.waitForTimeout(1000);
  r = await p.evaluate(() => [...document.querySelectorAll('.gn-fam .gn-mat .gn-im')].map((b) => b.dataset.gnver));
  c(r.length >= 1 && r.every((x) => /materiales\/mat_[a-z_0-9]+_hoja\.webp$/.test(x)), 'adentro de la familia «' + fam + '»: sus hojas nuevas, que abren la hoja completa · ' + r.length);
  // láminas: la nueva si está en el índice; la parcial ofrece la de antes
  await p.evaluate(() => window.laminaAbrir('prfv_fund')); await p.waitForTimeout(800);
  r = await p.evaluate(() => { const o = document.getElementById('gnLam'); return { vis: !!o && !o.hidden, pasos: o ? o.querySelectorAll('.gn-pasos').length : 0, tipo: o ? o.querySelectorAll('.gn-tipo').length : 0, mat: o ? o.querySelectorAll('.gn-mat').length : 0, vieja: !!document.getElementById('lmOverlay') }; });
  c(r.vis && r.pasos === 1 && r.tipo === 1 && r.mat === 1 && !r.vieja, 'lámina «prfv_fund»: abre lo nuevo (paso a paso, tipo y material), no la de antes · ' + JSON.stringify(r));
  await p.evaluate(() => { document.getElementById('gnLam').hidden = true; window.laminaAbrir('col_aerea_h1'); }); await p.waitForTimeout(600);
  r = await p.evaluate(() => !!document.querySelector('#gnLam [data-gnlam="vieja"]'));
  await p.click('#gnLam [data-gnlam="vieja"]'); await p.waitForTimeout(900);
  const vieja = await p.evaluate(() => !!document.getElementById('lmOverlay'));
  c(r && vieja, 'lámina de barrio sin dibujo nuevo completo (col_aerea_h1): queda la de antes con «Ver la lámina de antes» · ' + vieja);
  await p.evaluate(() => window.laminaCerrar && window.laminaCerrar());
  // sin señal
  global.__guiasSinRed = true;
  await p.evaluate(() => { window.mostrarVista('guias'); const t = document.querySelector('#guiasApp [data-gq-tab="procesos"]'); t && t.click(); }); await p.waitForTimeout(500);
  await p.evaluate(() => window.abrirGuia('zanjeo_tendido')); await p.waitForTimeout(1500);
  r = await p.evaluate(() => [...document.querySelectorAll('.gn-pasos .gn-sin')].map((x) => x.textContent));
  c(r.length >= 1 && /se ve cuando vuelva la señal/.test(r[0]), 'sin señal: «se ve cuando vuelva la señal» · ' + r.length);
  global.__guiasSinRed = false;
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'Guías sin scroll de costado en el celu · ' + sw); }

  c(A.errores.filter((e) => !/net::|Failed to load|ERR_|favicon/.test(e)).length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores.slice(0, 4)));
  await A.browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
