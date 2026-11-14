// v155 · Rol «Dirección» y su Inicio (A en el celu, C en la compu) + 2 detalles de la v154.
//  0) Dirección entra: #iniDir (portada, número del día, atención, barras, curva S, qué se hizo con la foto del día, mapa,
//     equipo, clima, programación, plata, asistente), los números cuadran con Certificación / Gastos / Supervisor, sin scroll
//     de costado, barra de abajo propia (celu), semáforo (compu) y calendario; contrato estimado y con fecha cargada.
//  1) clima contra lo planeado (Open-Meteo simulado: lluvia el jueves sobre un hormigonado sugerido) y sin señal.
//  2) sin lecturas en vivo nuevas: ninguna escucha nueva y UNA consulta de fotos.
//  3) Dirección no puede escribir: permisos de la app (todo «ver»), las fb* cortan y las reglas (stub) niegan; con las reglas
//     viejas, la app avisa a Administración.
//  4) asistente de Dirección: sin ninguna proponer_*, con la plata y los puntos, «te lo dejo anotado» → aviso a la oficina con «Sí».
//  5) oficina y admin abren «📊 Dirección» (Inicio Ejecutivo, menú, Tablero del dueño); cuadrilla, pañol y mirar no la ven;
//     Usuarios ofrece el rol; con __v155No nada de esto.
//  6) los dos detalles de la v154.
//  7) la cuadrilla le avisa a la oficina por el asistente: Juan (celu) «avisale a Ángel que falta un fusible…» → tarjeta →
//     «Sí, mandalo» → aviso a Administración y al supervisor, «📨 Para resolver», Ángel responde → le llega a Juan; seguridad en
//     rojo (Inicio y Supervisor); pañol y mirar también pueden; la cuadrilla no lee los avisos de los demás (reglas).
const { abrir, otraPagina, prueba } = require('./h');
const { datos155 } = require('./datos155');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
(async () => {
  const c = prueba('v155' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, sugerida: true, inicio: true, nav: true, iaPro: true, leaflet: true, https: true, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; } };
  let browser = null;
  const sesion = async (quien, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos155(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1500); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, full) => { if (!CAP) return; await p.waitForTimeout(400); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png', fullPage: !!full }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const clima = async (p, modo) => {
    await p.unroute('https://api.open-meteo.com/**').catch(() => { });
    await p.route('https://api.open-meteo.com/**', (rt) => {
      if (modo === 'sin') return rt.abort('internetdisconnected');
      const t = [], h = new Date(); for (let i = 0; i < 7; i++) { const d = new Date(h); d.setDate(h.getDate() + i); t.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')); }
      const jue = (f) => new Date(f + 'T12:00:00').getDay() === 4;
      rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ daily: { time: t, precipitation_sum: t.map((f) => (jue(f) ? 12 : 0)), precipitation_probability_max: t.map((f) => (jue(f) ? 80 : 10)), temperature_2m_max: t.map(() => 28), wind_speed_10m_max: t.map(() => 15) } }) });
    });
    await p.evaluate(() => { const s = window.__inicioDir._st; s.climaErr = false; s.climaTs = 0; s.clima = null; s.climaPidiendo = false; try { localStorage.removeItem('ema.clima'); } catch (e) { } window.__inicioDir.pintar(); });
    await p.waitForTimeout(1200); await p.evaluate(() => window.__inicioDir.pintar()); await p.waitForTimeout(300);
  };
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.02, version: 'v4-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v4-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift(); const x = typeof f === 'function' ? f(b) : f; return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x || fin('Listo.')) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v4-ia', habilitado: true, quedanPreguntas: 10, topePreguntas: 10 }) }));
    await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v4-ia', gastoMes: 12.4, tope: 100, partes: {} }) }));
    await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v4-ia' }) }));
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const decir = async (p, sw, frase, guion) => { sw.cola.push(...guion); const n0 = sw.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p); await p.waitForTimeout(400); return sw.pedidos.slice(n0); };
  const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : Array.isArray(x) ? x.map((y) => (y && y.type === 'text' ? y.text : '')).join('') : JSON.stringify(x); };
  const herramientas = (ped) => ((ped[0] || {}).tools || []).map((t) => t.name);

  // ================================================================= 0) el Inicio de Dirección
  if (SOLO('0')) {
    const A = await sesion('dir'); const p = A.page;
    await p.waitForTimeout(2500); await clima(p, 'ok');
    let r = await p.evaluate(() => {
      const d = document.getElementById('iniDir'), v = (id) => { const e = document.getElementById(id); return !!e && e.offsetHeight > 0; };
      return { rol: PERMISOS.yo().rol, vis: !!d && d.offsetHeight > 0 && d.closest('#viewInicio') != null, eje: v('iniEje'), hero: document.body.classList.contains('ie-hero'), secs: ['drHero', 'drAt', 'drBar', 'drCurva', 'drHoy', 'drMapaC', 'drEq', 'drClima', 'drProg', 'drPlata', 'drIa'].filter((id) => !v(id)), svg: document.querySelectorAll('#iniDir svg.dr-chart').length, filas: [...document.querySelectorAll('#drHoy .dr-ob b')].map((b) => b.textContent.trim()), foto: document.querySelectorAll('#drHoy .dr-foto img').length, txt: d ? d.textContent.replace(/\s+/g, ' ') : '' };
    });
    c(r.rol === 'direccion' && r.vis && !r.eje && r.hero, 'Dirección entra a SU Inicio (#iniDir con la portada azul), no al Ejecutivo · ' + JSON.stringify({ vis: r.vis, eje: r.eje, hero: r.hero }));
    c(!r.secs.length && r.svg >= 2, 'todas las tarjetas a la vista (atención, barras, curva S, qué se hizo, mapa, equipo, clima, programación, plata, asistente) · faltan ' + JSON.stringify(r.secs) + ' · svg ' + r.svg);
    c(/El número del día/.test(r.txt) && /K hoy/.test(r.txt) && /del ritmo que hace falta/.test(r.txt), 'el número del día: módulos de hoy contra el ritmo que hace falta');
    c(r.filas.some((x) => /LOS ÁLAMOS/.test(x)) && r.filas.some((x) => /LAS ACACIAS/.test(x)) && r.foto >= 1, 'qué se hizo hoy por obra, con la foto del día · ' + JSON.stringify(r.filas) + ' fotos ' + r.foto);
    r = await p.evaluate(() => { const D = window.__inicioDir.datos(); return { hoyKc: D.hoyKc, hoyK: D.hoyK, est: D.hoyK - D.hoyKc, z: D.z.zona, C: D.C, obras: D.obras.map((o) => [o.n, o.est, o.prev, o.estimada]), txt: document.getElementById('drHoy').textContent }; });
    c(Math.abs(r.hoyKc - 3.2) < 0.05 && r.est > 0, 'hoy: 3,19 K cerrados (OT-2026-131, 1 columna PRFV) + lo mandado sin cerrar marcado aparte (estimado) · ' + JSON.stringify([r.hoyKc, r.hoyK]));
    c(/sellado/i.test(r.txt) && /montaje/i.test(r.txt) && /sin cerrar/.test(r.txt), '«3 sellado de base» (sin cerrar) y «1 montaje de columna» · ' + r.txt.replace(/\s+/g, ' ').slice(0, 160));
    const ob = (n) => r.obras.find((x) => new RegExp(n).test(x[0])) || [];
    c(ob('ÁLAMOS')[1] === 'atrasada' && ob('ACACIAS')[2] && ob('BULEVARES')[1] === 'sinfecha', 'programación: LOS ÁLAMOS atrasada (Gantt vencido), LAS ACACIAS con fecha prevista, BULEVARES «sin fecha prevista» · ' + JSON.stringify(r.obras));
    c(r.C.estimada && r.C.ini && /estimado/.test(await p.textContent('#drCurva')) && /acta de inicio/.test(await p.textContent('#drCurva')), 'contrato sin fecha cargada: inicio = la primera orden de la zona, marcado «estimado · cargá la fecha del acta de inicio» · ' + r.C.ini);
    // números que cuadran
    r = await p.evaluate(() => { const P = window.__inicioDir.plata(), T = window.__tableroDueno.datos(), C = window.__certMensual.armar(), sup = window.__supervisor.hallazgos().filter((h) => h.cat === 'Al día' && h.g === 'rojo').map((h) => h.t), at = window.__inicioDir.atencion().map((a) => a.t); return { R: P.R && P.R.sinIva, C: C.sinIva, gas: P.gastTot, tg: T.gastTot, gan: P.ganTot, tgan: T.ganTot, sup, at }; });
    c(r.R === r.C && r.gas === r.tg && r.gan === r.tgan, 'la plata cuadra con la Certificación (' + r.C + ') y con Gastos / Tablero del dueño (gasto ' + r.tg + ', ganancia ' + r.tgan + ')');
    c(r.sup.length && r.sup.every((t) => r.at.some((a) => a === t)) && r.at.length <= 3, '«Necesita tu atención» trae lo del Supervisor (obra atrasada), máximo 3 · ' + JSON.stringify(r.at));
    c(await scrollX(p) <= 0, 'sin scroll de costado');
    if (cel) {
      r = await p.evaluate(() => [...document.querySelectorAll('#navN1 [data-n1]')].map((b) => b.dataset.n1));
      c(JSON.stringify(r) === JSON.stringify(['inicio', 'obras', 'mapa', 'informes', 'perfil']), 'celu: barra de abajo de Dirección: Inicio · Obras · Mapa · Informes · Perfil · ' + JSON.stringify(r));
      c(await p.evaluate(() => !!document.querySelector('#drProg [data-dr="prog:pistas"]') && !document.querySelector('#drProg .dr-semt')), 'celu: programación en pistas (A), sin el semáforo de la compu');
    } else {
      r = await p.evaluate(() => ({ k6: (document.querySelector('#iniDir .dr-k6') || {}).offsetHeight > 0, sem: (document.querySelector('#drProg .dr-semt') || {}).offsetHeight > 0, cols: getComputedStyle(document.querySelector('#iniDir .dr-grid')).gridTemplateColumns.split(' ').length }));
      c(r.k6 && r.sem && r.cols >= 3, 'compu: 6 números en la portada, semáforo por obra y grilla de columnas (C) · ' + JSON.stringify(r));
    }
    await foto(p, 'dir_inicio', true);
    // calendario
    await p.click('#drProg [data-dr="prog:cal"]'); await p.waitForTimeout(400);
    r = await p.evaluate(() => { const e = document.querySelector('#drProg .dr-cal'); return e ? e.textContent.replace(/\s+/g, ' ') : ''; });
    c(/Ya vencidas/.test(r) && /Esta semana/.test(r) && /Próxima/.test(r) && /LAS ACACIAS/.test(r), 'calendario de terminaciones (por semana y por mes) · ' + r.slice(0, 160));
    await foto(p, 'dir_calendario');
    // la foto del día → visor
    await p.click('#drHoy .dr-foto'); await p.waitForTimeout(600);
    c(await p.evaluate(() => !!document.getElementById('gpVisor')), 'tocar la foto del día la abre en el visor');
    await p.evaluate(() => window.emaGaleria && window.emaGaleria.cerrar());
    // la fecha del acta de inicio (la carga Administración; acá se simula lo guardado)
    r = await p.evaluate(() => { window.__preciosNube = Object.assign({}, window.__preciosNube || {}, { contratoInicio: '2026-10-15', contratoPlazoMeses: 4 }); window.__inicioDir.pintar(); const D = window.__inicioDir.datos(); return { C: D.C, txt: document.getElementById('drCurva').textContent }; });
    c(!r.C.estimada && r.C.ini === '2026-10-15' && r.C.plazo === '2027-02-15' && /Acta de inicio 15\/10\/2026/.test(r.txt), 'con el acta de inicio cargada: plazo = 4 meses después (15/02/2027) y ya no dice «estimado»');
    c(!errsJs(A).length, 'sin errores · ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.close();
  }

  // ================================================================= 1) clima contra lo planeado
  if (SOLO('1')) {
    const A = await sesion('dir'); const p = A.page;
    await p.waitForTimeout(2000);
    await p.evaluate(() => { const S = window.__sugerida, f = (() => { const d = new Date(); for (let i = 0; i < 7; i++) { if (d.getDay() === 4) break; d.setDate(d.getDate() + 1); } return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })(); S.semana = () => [{ fecha: f, ordenes: [{ obra: 'PLAZA LOS ÁLAMOS', obraId: 'p1', incluir: true, tareas: [{ k: 'hormigonado', label: 'Hormigonado de bases', cant: 3 }], vehiculos: [] }] }]; window.__inicioDir._st.sugTs = 0; });
    await clima(p, 'ok');
    let t = (await p.textContent('#drClima')).replace(/\s+/g, ' ');
    c(/⛈ Jueves: lluvia 12 mm \(80 %\) · hay hormigonado.* en PLAZA LOS ÁLAMOS/i.test(t), 'lluvia el jueves sobre un hormigonado sugerido → «⛈ Jueves: lluvia 12 mm · hay hormigonado en LOS ÁLAMOS» · ' + t.slice(0, 260));
    c(/Solo avisa \(no cambia nada\)/.test(t) && /a confirmar/.test(t), 'solo avisa, con los umbrales «a confirmar»');
    c(await p.evaluate(() => { try { const c = JSON.parse(localStorage.getItem('ema.clima')); return !!c && c.d.length === 7 && Date.now() - c.ts < 6e4; } catch (e) { return false; } }), 'el pronóstico queda guardado (3 h) en el aparato');
    await foto(p, 'dir_clima');
    await clima(p, 'sin');
    t = (await p.textContent('#drClima')).replace(/\s+/g, ' ');
    c(/Sin pronóstico/.test(t) && await p.evaluate(() => !!document.getElementById('drBar').querySelector('svg')), 'sin señal: «Sin pronóstico» y lo demás sigue · ' + t.slice(0, 120));
    await A.page.close();
  }

  // ================================================================= 2) sin escuchas nuevas, una consulta de fotos
  if (SOLO('2')) {
    const A = await sesion('dir'); const p = A.page;
    await p.waitForTimeout(2500);
    await p.evaluate(() => {
      window.__cuenta = { snap: [], get: [] };
      const fs = firebase.firestore(), col0 = fs.collection.bind(fs);
      const envolver = (q, nombre) => { if (!q || q.__env) return q; const o = Object.assign({}, q); ['where', 'orderBy', 'limit'].forEach((k) => { if (q[k]) o[k] = (...a) => envolver(q[k](...a), nombre); }); if (q.get) o.get = (...a) => { window.__cuenta.get.push(nombre); return q.get(...a); }; if (q.onSnapshot) o.onSnapshot = (...a) => { window.__cuenta.snap.push(nombre); return q.onSnapshot(...a); }; if (q.doc) o.doc = (id) => envolver(q.doc(id), nombre + '/' + id); o.__env = 1; return o; };
      fs.collection = (n) => envolver(col0(n), n);
      window.__inicioDir._st.fotosTs = 0;
    });
    for (let i = 0; i < 3; i++) { await p.evaluate(() => { window.__inicioDir.pintar(); window.__inicioDir.pedirFotos(); }); await p.waitForTimeout(500); }
    await p.click('#drHoy [data-dr="seg:ayer"]'); await p.waitForTimeout(300); await p.click('#drHoy [data-dr="seg:hoy"]'); await p.waitForTimeout(300);
    await p.evaluate(() => mostrarVista('obras')); await p.waitForTimeout(600); await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => window.__cuenta);
    c(r.snap.length === 0, 'el Inicio de Dirección no abre escuchas nuevas · ' + JSON.stringify(r.snap));
    c(r.get.filter((x) => x === 'fotosObra').length === 1, 'UNA sola consulta de fotos de hoy (y no se repite antes de 15 min) · ' + JSON.stringify(r.get));
    await A.page.close();
  }

  // ================================================================= 3) Dirección no puede escribir
  if (SOLO('3')) {
    const A = await sesion('dir', { reglas: true }); const p = A.page;
    await p.waitForTimeout(2000);
    let r = await p.evaluate(() => { const h = ['inicio', 'registro', 'calc', 'parte', 'plan', 'avance', 'mapa', 'stock', 'informe', 'gastos', 'produccion', 'normas', 'obras', 'guias']; return { m: h.map((x) => PERMISOS.permiso(x)), tab: PERMISOS.permiso('tablero'), mt: PERMISOS.permiso('mistareas') }; });
    c(r.m.every((x) => x === 'ver') && r.tab === 'oculto' && r.mt === 'oculto', 'en la app: todas las hojas en «ver» (también gastos y producción), Mi tablero y Mis tareas ocultos · ' + JSON.stringify(r));
    r = await p.evaluate(async () => { const out = {}; const prob = async (k, f) => { try { await f(); out[k] = 'ok'; } catch (e) { out[k] = String(e.code || e.message).slice(0, 40); } }; await prob('fbOtUpdate', () => window.fbOtUpdate('h130', { notas: 'x' })); await prob('fbAvanceCampos', () => window.fbAvanceCampos('p1', { direccion: 'x' })); await prob('fbAddMovimiento', () => window.fbAddMovimiento({ tipo: 'salida', codigo: '7015', cantidad: 1 })); return out; });
    c(Object.keys(r).every((k) => r[k] === 'permission-denied'), 'las funciones de la app que guardan cortan con «sin permiso» · ' + JSON.stringify(r));
    r = await p.evaluate(async () => {
      const fs = firebase.firestore(), out = {};
      const prob = async (k, f) => { try { await f(); out[k] = 'ok'; } catch (e) { out[k] = String(e.code || e.message).slice(0, 30); } };
      await prob('orden', () => fs.collection('ordenesTrabajo').doc('h130').update({ notas: 'x' }));
      await prob('obra', () => fs.collection('avanceObras').doc('p1').update({ direccion: 'x' }));
      await prob('tablero', () => fs.collection('tableros').doc('x').set({ a: 1 }));
      await prob('salud', () => fs.collection('configEquipo').doc('salud').set({ a: 1 }, { merge: true }));
      await prob('ubicacion', () => fs.collection('ubicacionVivo').doc('uDir').set({ lat: 1 }));
      await prob('gasto', () => fs.collection('gastosObra').add({ plazaId: 'p1', monto: 1 }));
      await prob('foto', () => fs.collection('fotosObra').add({ plazaId: 'p1', otId: '' }));
      await prob('baremo', () => fs.collection('configEquipo').doc('baremo').set({ a: 1 }, { merge: true }));
      await prob('leerGastos', () => fs.collection('gastosObra').get());
      await prob('leerUbic', () => fs.collection('ubicacionVivo').get());
      await prob('leerCierres', () => fs.collection('cierresQuincena').get());
      await prob('aviso', () => fs.collection('avisosPush').add({ enviado: false, email: 'lucia@ema-alumbrado.app', titulo: 'x' }));
      await prob('presencia', () => fs.collection('presencia').doc('uDir').set({ ts: 1 }));
      return out;
    });
    const neg = ['orden', 'obra', 'tablero', 'salud', 'ubicacion', 'gasto', 'foto', 'baremo'], si = ['leerGastos', 'leerUbic', 'leerCierres', 'aviso', 'presencia'];
    c(neg.every((k) => r[k] === 'permission-denied'), 'reglas: Dirección no escribe nada (órdenes, obras, tablero, salud, ubicación, gastos, fotos, baremo) · ' + JSON.stringify(neg.map((k) => k + ':' + r[k])));
    c(si.every((k) => r[k] === 'ok'), 'reglas: lee gastos, ubicación en vivo y quincenas; deja avisos y su «estoy en la app» · ' + JSON.stringify(si.map((k) => k + ':' + r[k])));
    // la pantalla de órdenes: solo mirar
    await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(800);
    c(await p.evaluate(() => /solo para mirar/.test((document.querySelector('#viewParteDiario .perm-aviso') || {}).textContent || '')), 'en Órdenes dice «solo para mirar»');
    await A.page.close();
    // reglas viejas: la app avisa a Administración
    const B = await sesion('dir', { reglas: true, antes: () => { window.__reglasSinV155 = true; window.__pmPausa = true; window.__isNoAuto = true; window.__hvPausa = true; } }); const q = B.page;
    await q.waitForTimeout(3500);
    r = await q.evaluate(() => ({ e: window.__inicioDir.estado().reglas, txt: (document.getElementById('drReglas') || {}).textContent || '' }));
    const av = Object.values((await db(q)).avisosPush || {}).filter((x) => /reglas de la v155/.test(x.titulo || ''));
    c(r.e === 'viejas' && /Faltan publicar las reglas de Firebase de la v155/.test(r.txt) && av.some((x) => x.email === 'admin@ema-alumbrado.app'), 'con las reglas viejas: cartel «faltan publicar las reglas de la v155» y aviso a Administración · ' + JSON.stringify([r.e, av.length]));
    await B.page.close();
  }

  // ================================================================= 4) el asistente de Dirección
  if (SOLO('4')) {
    const A = await sesion('dir'); const p = A.page;
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(800);
    let ped = await decir(p, sw, '¿cómo vamos?', [usa('como_vamos', {}), fin('Vamos bien.')]);
    const tools = herramientas(ped), sist = JSON.stringify((ped[0] || {}).system || '') + JSON.stringify((ped[0] || {}).messages || '');
    c(tools.length > 20 && !tools.some((x) => /^proponer_/.test(x)), 'Dirección no recibe ninguna herramienta proponer_* (' + tools.length + ' herramientas)');
    c(['certificacion', 'explicar_puntos', 'revisar_puntos', 'obra_completa', 'verificar_orden', 'anotar_para_oficina', 'como_vamos'].every((x) => tools.includes(x)), 'recibe las de leer de la oficina (certificación, puntos, obra completa, verificación) + anotar_para_oficina y como_vamos');
    let rr = resultado(ped, 1);
    c(/"diasContraPlazo"/.test(rr) && /PLAZA LOS ÁLAMOS/.test(rr) && /Atrasada/.test(rr), 'como_vamos devuelve lo de la pantalla (ritmo, plazo, obras) · ' + rr.slice(0, 160));
    c(/DIRECCIÓN/.test(sist) && /te lo dejo anotado/.test(sist), 'el asistente sabe que Dirección no cambia nada y ofrece dejarlo anotado');
    ped = await decir(p, sw, '¿cuánto certificamos y por qué Juan tiene esos puntos?', [usa('certificacion', {}), usa('explicar_puntos', { persona: 'Juan' }), fin('Eso.')]);
    c(!/Eso no lo puedo ver/.test(resultado(ped, 1)) && /sinIva|total/i.test(resultado(ped, 1)) && !/Eso no lo puedo ver/.test(resultado(ped, 2)), 've la plata (certificación) y los puntos · ' + resultado(ped, 1).slice(0, 100) + ' | ' + resultado(ped, 2).slice(0, 100));
    ped = await decir(p, sw, 'cambiá la fecha de la OT-2026-130 a mañana', [usa('proponer_editar_orden', { otId: 'OT-2026-130', fecha: '2030-01-01' }), fin('Eso lo hace la oficina; ¿te lo dejo anotado para ellos?')]);
    rr = resultado(ped, 1);
    c(/no lo puedo ver|solo puede consultar|no hace cambios/i.test(rr) && !(await db(p)).ordenesTrabajo.h130.fecha.startsWith('2030'), 'si el modelo intenta cambiar algo, la app no lo deja (y la orden no cambia) · ' + rr.slice(0, 120));
    ped = await decir(p, sw, 'sí, dejáselo anotado', [usa('anotar_para_oficina', { texto: 'Pasar la OT-2026-130 a mañana' }), fin('Confirmalo.')]);
    c(/pendiente_de_confirmacion/.test(resultado(ped, 1)) && /Dejarle anotado a la oficina/.test(await p.textContent('#iaChat')), 'anotar_para_oficina: tarjeta «📝 Dejarle anotado a la oficina»');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1500);
    const av = Object.values((await db(p)).avisosPush || {}).filter((x) => /Pedido de Dirección/.test(x.titulo || ''));
    c(av.length >= 2 && av.some((x) => x.email === 'lucia@ema-alumbrado.app') && av.some((x) => x.email === 'admin@ema-alumbrado.app') && /OT-2026-130 a mañana/.test(av[0].cuerpo), 'con «Sí» les llega el aviso a Administración y Oficina (y nada más cambia) · ' + av.length);
    c(/Worker nuevo del asistente \(v155\)/.test(await p.textContent('#iaChat')), 'con el Worker viejo avisa una vez «Ángel tiene que pegar el Worker nuevo»');
    await foto(p, 'dir_asistente');
    await A.page.close();
  }

  // ================================================================= 5) oficina/admin la abren; los demás no la ven
  if (SOLO('5')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(2000);
    let r = await p.evaluate(() => ({ acc: !!document.querySelector('#ieAccs [data-dr="abrir"]'), menu: !!document.getElementById('menuDireccion'), dir: !!document.querySelector('#viewInicio #iniDir'), eje: (document.getElementById('iniEje') || {}).offsetHeight > 0 }));
    c(r.eje && r.acc && r.menu && !r.dir, 'oficina: su Inicio Ejecutivo sigue, con el acceso «📊 Dirección» y en el menú · ' + JSON.stringify(r));
    await p.click('#ieAccs [data-dr="abrir"]'); await p.waitForTimeout(1500);
    r = await p.evaluate(() => { const o = document.getElementById('dirOv'); return { ov: !!o && !o.hidden && o.getAttribute('role') === 'dialog', dir: !!(o && o.querySelector('#iniDir')), x: !!(o && o.querySelector('[data-dr="cerrar"][aria-label="Cerrar"]')), svg: o ? o.querySelectorAll('svg.dr-chart').length : 0 }; });
    c(r.ov && r.dir && r.x && r.svg >= 3, 'oficina: se abre la misma pantalla en una hoja con ✕ · ' + JSON.stringify(r));
    c(await scrollX(p) <= 0, 'la hoja sin scroll de costado');
    await foto(p, 'oficina_dir', true);
    await p.click('#dirOv [data-dr="cerrar"]'); await p.waitForTimeout(400);
    c(await p.evaluate(() => document.getElementById('dirOv').hidden), '✕ la cierra');
    await A.page.close();
    const B = await sesion('admin'); const q = B.page;
    await q.waitForTimeout(2000);
    await q.evaluate(() => window.__tableroDueno.abrir()); await q.waitForTimeout(800);
    c(await q.evaluate(() => !!document.querySelector('#tdOv .dr-tdcd[data-dr="abrir"]')), 'admin: el Tablero del dueño tiene la tarjeta «📊 Dirección»');
    await q.click('#tdOv .dr-tdcd'); await q.waitForTimeout(1000);
    c(await q.evaluate(() => !document.getElementById('dirOv').hidden && document.getElementById('tdOv').hidden), 'y la abre (cierra el tablero)');
    r = await q.evaluate(() => ({ sel: window.__zonaContrato.selectorHtml(), roles: Object.keys(PERMISOS.ROLES) }));
    c(/id="zcInicio"/.test(r.sel) && /id="zcPlazo"/.test(r.sel) && r.roles.includes('direccion'), 'admin: «Nuestra zona» tiene la fecha del acta de inicio y el plazo; Usuarios ofrece el rol Dirección');
    await q.evaluate(() => mostrarVista('usuarios')); await q.waitForTimeout(800);
    c(await q.evaluate(() => [...document.querySelectorAll('.us-rol b')].some((b) => b.textContent.trim() === 'Dirección')), 'Usuarios › Nuevo usuario: el botón del rol «Dirección»');
    await B.page.close();
    for (const quien of ['juan', 'pan', 'mir']) {
      const C = await sesion(quien, quien === 'juan' ? { crew: true, mtNuevo: true, tarjetas: true } : {}); const z = C.page;
      await z.waitForTimeout(1500);
      r = await z.evaluate(() => ({ dir: !!document.getElementById('iniDir'), acc: !!document.querySelector('[data-dr="abrir"]'), menu: !!document.getElementById('menuDireccion'), puede: window.__inicioDir.puedeVer(), abre: window.__inicioDir.abrir() }));
      c(!r.dir && !r.acc && !r.menu && !r.puede && r.abre === false, quien + ': no ve la pantalla de Dirección · ' + JSON.stringify(r));
      await C.page.close();
    }
    // pruebas viejas (sin v155)
    const D = await sesion('dir', { v155: false }); const w = D.page;
    await w.waitForTimeout(1500);
    r = await w.evaluate(() => ({ dir: !!document.getElementById('iniDir'), rol: Object.keys(PERMISOS.ROLES).includes('direccion'), m: PERMISOS.permiso('gastos') }));
    c(!r.dir && !r.rol && r.m === 'oculto', 'con __v155No: sin rol Dirección (cae a «solo mirar») ni su Inicio · ' + JSON.stringify(r));
    await D.page.close();
  }

  // ================================================================= 6) los dos detalles de la v154
  if (SOLO('6')) {
    const A = await sesion('lucia'); const p = A.page;
    await p.waitForTimeout(1500);
    await p.evaluate(() => window.__auditPuntos.abrir({ tab: 'pers' })); await p.waitForTimeout(800);
    let r = await p.evaluate(() => { const b = document.querySelector('#qpOv .qp-per .btn-ghost.on'), o = document.querySelector('#qpOv .qp-per .btn-ghost:not(.on)'); if (!b) return null; const cb = getComputedStyle(b), co = o ? getComputedStyle(o) : null; return { txt: b.textContent, bg: cb.backgroundImage + ' ' + cb.backgroundColor, col: cb.color, colO: co && co.color }; });
    c(r && /linear-gradient|rgb\(40, 40, 94\)/.test(r.bg) && r.col === 'rgb(255, 255, 255)' && r.colO !== r.col, '«🔎 Puntos»: el período elegido se ve marcado (azul, letra blanca) · ' + JSON.stringify(r));
    await foto(p, 'v154_periodo');
    const html = await p.content();
    c(!/usá proponer_corregir_cierre/.test(html) && !/anotar el motivo \(proponer_nota_puntos\)/.test(html) && /Si lo que cambia es lo hecho, usá ✏ Corregir cierre/.test(html), 'los avisos de la tarjeta ya no nombran herramientas: «Si lo que cambia es lo hecho, usá ✏ Corregir cierre»');
    await A.page.close();
  }

  // ================================================================= 7) la cuadrilla le avisa a la oficina
  if (SOLO('7')) {
    const A = await sesion('juan', { reglas: true, crew: true, mtNuevo: true, tarjetas: true }); const p = A.page;
    await p.waitForTimeout(2000);
    const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(800);
    let ped = await decir(p, sw, 'avisale a Ángel que falta un fusible en LOS ÁLAMOS', [usa('avisar_oficina', { texto: 'Falta un fusible de 2 A para la Col 3 de LOS ÁLAMOS', tipo: 'falta_material' }), fin('Confirmalo con «Sí, mandalo».')]);
    const tools = herramientas(ped), sist = JSON.stringify((ped[0] || {}).system || '');
    c(tools.includes('avisar_oficina') && tools.includes('mis_avisos') && !tools.some((x) => /^proponer_/.test(x)) && !tools.includes('avisos_cuadrilla'), 'cuadrilla: el asistente tiene avisar_oficina y mis_avisos (y ninguna proponer_*) · ' + tools.join(','));
    c(/AVISOS A LA OFICINA/.test(sist), 'el asistente de la cuadrilla sabe que puede avisarle a la oficina');
    let card = await p.evaluate(() => { const e = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); return e ? { t: e.textContent.replace(/\s+/g, ' '), si: (e.querySelector('[data-iasi]') || {}).textContent } : null; });
    c(card && /Le mando esto a Ángel/.test(card.t) && /Falta un fusible de 2 A/.test(card.t) && /LOS ÁLAMOS/.test(card.t) && /OT-2026-130/.test(card.t) && /última foto/.test(card.t) && card.si === 'Sí, mandalo', 'tarjeta «📨 Le mando esto a Ángel» con el texto, su obra y orden de hoy, la foto y «Sí, mandalo» · ' + JSON.stringify(card).slice(0, 220));
    await foto(p, 'cuadrilla_aviso_tarjeta');
    await p.click('#iaChat .ia-conf:last-of-type [data-iasi]'); await p.waitForTimeout(1800);
    let d = await db(p), ac = Object.entries(d.avisosCuadrilla || {}).map(([id, x]) => Object.assign({ id }, x)).filter((x) => x.uid === 'uJuan');
    const push = Object.values(d.avisosPush || {}).filter((x) => x.tipo === 'avisoCuadrilla').map((x) => x.email).sort();
    c(ac.length === 1 && ac[0].estado === 'nuevo' && ac[0].otId === 'h130' && ac[0].fotoId === 'fh1' && ac[0].tipo === 'falta_material' && /fusible/.test(ac[0].texto), 'con «Sí, mandalo» queda en «Para resolver» (nuevo, con la orden y la foto) · ' + JSON.stringify(ac[0] || {}).slice(0, 200));
    c(JSON.stringify(push) === JSON.stringify(['admin@ema-alumbrado.app', 'lucia@ema-alumbrado.app']), 'le llega el aviso a Administración y a la supervisora de su orden (Lucía) · ' + JSON.stringify(push));
    c(/se lo mandé/.test(await p.textContent('#iaChat')), 'la tarjeta dice «✅ Listo, se lo mandé»');
    // por voz: «sí, mandalo» confirma
    ped = await decir(p, sw, 'avisale a Ángel que se cortó un cable y hay peligro en la vereda', [usa('avisar_oficina', { texto: 'Se cortó un cable en la vereda de LOS ÁLAMOS: hay peligro', tipo: 'seguridad' }), fin('¿Se lo mando?')]);
    await p.fill('#iaTxt', 'sí, mandalo'); await p.click('#iaEnviar'); await p.waitForTimeout(2200); await esperarIa(p);
    d = await db(p); ac = Object.values(d.avisosCuadrilla || {}).filter((x) => x.uid === 'uJuan');
    c(ac.some((x) => x.tipo === 'seguridad'), '«sí, mandalo» (escrito o dicho) confirma la tarjeta: el de seguridad también salió');
    // reglas: la cuadrilla no lee los avisos de los demás
    let r = await p.evaluate(async () => { const fs = firebase.firestore(), o = {}; const pr = async (k, f) => { try { const s = await f(); o[k] = 'ok:' + (s && s.size != null ? s.size : s && s.exists); } catch (e) { o[k] = String(e.code || e.message).slice(0, 30); } }; await pr('todos', () => fs.collection('avisosCuadrilla').get()); await pr('mios', () => fs.collection('avisosCuadrilla').where('uid', '==', 'uJuan').get()); await pr('dePedro', () => fs.collection('avisosCuadrilla').doc('ac0').get()); await pr('marcar', () => fs.collection('avisosCuadrilla').doc('ac0').update({ estado: 'resuelto' })); await pr('ajeno', () => fs.collection('avisosCuadrilla').add({ uid: 'uPedro', estado: 'nuevo', texto: 'x' })); return o; });
    c(r.todos === 'permission-denied' && /^ok:2/.test(r.mios) && r.dePedro === 'permission-denied' && r.marcar === 'permission-denied' && r.ajeno === 'permission-denied', 'reglas: la cuadrilla lee solo los suyos, no los de Pedro, no los marca ni manda a nombre de otro · ' + JSON.stringify(r));
    // Ángel (admin) en la misma base
    const B = await otraPagina(A, Object.assign({}, MOD, { sesion: 'admin', reglas: true })); const q = B.page; await q.waitForTimeout(3500);
    await q.evaluate(() => window.__paraResolver.cargar(true)); await q.waitForTimeout(600); await q.evaluate(() => window.__inicioPro && window.__inicioPro.pintar()); await q.waitForTimeout(500);
    r = await q.evaluate(() => { const f = [...document.querySelectorAll('#ieAtender [data-ie="pararesolver"]')][0]; return { f: f ? f.textContent.replace(/\s+/g, ' ') : '', rojo: !!(f && f.querySelector('.rj')), sup: window.__supervisor.hallazgos({ ahora: true }).filter((h) => h.cat === 'Avisos').map((h) => h.g + ':' + h.t), menu: (document.getElementById('menuParaResolver') || {}).textContent || '' }; });
    c(/Para resolver/.test(r.f) && r.rojo && /3/.test(r.f), 'Inicio Ejecutivo › Para atender: «📨 Para resolver» con los 3 nuevos, en rojo por el de seguridad · ' + r.f);
    c(r.sup.length === 1 && /^rojo:.*Seguridad sin resolver: Juan/.test(r.sup[0]) && /Para resolver/.test(r.menu), 'el Supervisor lo marca en rojo y el menú tiene «📨 Para resolver» · ' + JSON.stringify(r.sup));
    await q.evaluate(() => window.__paraResolver.abrir()); await q.waitForTimeout(900);
    r = await q.evaluate(() => [...document.querySelectorAll('#prOv .pr-item')].map((e) => (e.classList.contains('rojo') ? 'R ' : '') + e.querySelector('.pr-tipo').textContent + ' ' + e.querySelector('.pr-cuerpo b').textContent));
    c(r.length === 3 && /^R ⛑ Seguridad Juan/.test(r[0]), '«📨 Para resolver»: los 3 pendientes, primero el de seguridad (en rojo) · ' + JSON.stringify(r));
    await foto(q, 'para_resolver');
    const idF = Object.entries((await db(q)).avisosCuadrilla).find(([, x]) => x.tipo === 'falta_material')[0];
    await q.click(`#prOv [data-pr="resolver:${idF}"]`); await q.waitForTimeout(300);
    await q.fill('#prResp', 'Mañana te lo lleva el pañol'); await q.click(`#prOv [data-pr="si:${idF}"]`); await q.waitForTimeout(1200);
    d = await db(q);
    const res = d.avisosCuadrilla[idF], vuelta = Object.values(d.avisosPush || {}).filter((x) => x.tipo === 'avisoRespuesta');
    c(res.estado === 'resuelto' && res.respuesta === 'Mañana te lo lleva el pañol' && vuelta.some((x) => x.clave === 'juan perez' && /te respondió/.test(x.titulo) && /pañol/.test(x.cuerpo)), 'Ángel lo marca resuelto con una respuesta → a Juan le llega «✅ … te respondió: Mañana te lo lleva el pañol» · ' + JSON.stringify(vuelta.map((x) => x.titulo)));
    await q.click('#prOv [data-pr="visto:ac0"]'); await q.waitForTimeout(800);
    c((await db(q)).avisosCuadrilla.ac0.estado === 'visto', '«👁 Visto» lo marca');
    c(await scrollX(q) <= 0, 'sin scroll de costado');
    await B.page.close();
    // Juan pregunta si le respondieron
    ped = await decir(p, sw, '¿me respondieron?', [usa('mis_avisos', {}), fin('Sí.')]);
    c(/Mañana te lo lleva el pañol/.test(resultado(ped, 1)) && /resuelto/.test(resultado(ped, 1)), 'Juan ve sus avisos y la respuesta en el asistente (mis_avisos) · ' + resultado(ped, 1).slice(0, 160));
    // pañol y mirar también pueden; Dirección solo mira
    for (const quien of ['pan', 'mir']) {
      const C = await otraPagina(A, Object.assign({}, MOD, { sesion: quien, reglas: true })); const z = C.page; await z.waitForTimeout(2500);
      r = await z.evaluate(async () => { await window.__iaCargar(); const al = window.__asistente.alcance(); const m = await window.__paraResolver.mandar({ texto: 'Prueba de aviso', tipo: 'pregunta' }); return { permite: al.permite('avisar_oficina'), ok: !!m.ok, err: m.err || '' }; });
      c(r.permite && r.ok, quien + ': también le puede avisar a la oficina · ' + JSON.stringify(r));
      await C.page.close();
    }
    const Dd = await otraPagina(A, Object.assign({}, MOD, { sesion: 'dir', reglas: true })); const w = Dd.page; await w.waitForTimeout(2500);
    await w.evaluate(() => window.__paraResolver.abrir()); await w.waitForTimeout(900);
    r = await w.evaluate(() => ({ n: document.querySelectorAll('#prOv .pr-item').length, botones: document.querySelectorAll('#prOv [data-pr^="resolver:"], #prOv [data-pr^="visto:"]').length, txt: document.querySelector('#prOv .pr-top').textContent }));
    c(r.n >= 3 && r.botones === 0 && /solo para mirar/.test(r.txt), 'Dirección ve «Para resolver» sin botones (solo mirar) · ' + JSON.stringify(r));
    await Dd.page.close();
    c(!errsJs(A).length, 'sin errores · ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await A.page.close();
  }

  await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
