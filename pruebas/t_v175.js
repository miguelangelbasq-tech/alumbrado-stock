// v175 · El asistente carga el personal (Ángel 19/11: «la IA de la app tiene que poder cargar por su cuenta el personal»).
//  0) oficina: nomina (la real, con valor hora y lo que falta); 3 altas dictadas (Olariaga ya está → pregunta, no duplica;
//     legajo / valor hora que no dijo → «a completar»); «Sí, cargarlos» → guardia (respaldos[]), leído de vuelta, auditoría
//     personal_asistente; cambiar valor hora; baja (activo:false, no se borra); vehículo nuevo con quién lo tiene a cargo.
//  1) recuperar (la base como quedó el 18/11): el asistente propone los 5 que faltan y los 3 vehículos y los carga con «Sí».
//  2) la base todavía no llegó: nomina lo dice y proponer_personal no arma nada.
//  3) roles: Dirección lee (sin valor hora) y no propone; cuadrilla, pañol y mirar no reciben nada de esto.
//  4) __v175No: como la v174.
const { abrir, prueba, DOM } = require('./h');
const { datos174 } = require('./datos174');
const cel = process.argv[2] === 'cel';
const REGLAS = !!process.env.REGLAS;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
function datos175(op) {
  const d = datos174(op || {});
  const U = { lucia: ['uLucia', 'Lucía Oficina', 'oficina'], dir: ['uDir', 'Roberto Dirección', 'direccion'], pan: ['uPan', 'Pablo Pañol', 'panol'], mir: ['uMir', 'Mirta Mira', 'mirar'] };
  Object.keys(U).forEach((k) => { const [uid, nombre, rol] = U[k]; d.cuentas[k + '@' + DOM] = { pass: 'clave123', uid }; d.db.usuarios[uid] = { email: k + '@' + DOM, usuario: k, nombre, rol, activo: true }; });
  return d;
}
(async () => {
  const c = prueba('v175' + (cel ? ' cel' : '') + (REGLAS ? ' REGLAS' : ''));
  const MOD = { cel, espera: 3500, https: true, iaPro: true, inicio: true, v155: true, v175: true, reglas: REGLAS, antes: () => { window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; window.__cvSinMic = true; } };
  let browser = null;
  const sesion = async (quien, d, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: d || datos175(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(1200); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const tx = (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const esperar = async (p, fn, arg, ms) => { for (let i = 0; i < (ms || 40); i++) { if (await p.evaluate(fn, arg)) return true; await p.waitForTimeout(250); } return false; };
  let n = 0;
  const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v5-ia' } });
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v5-ia' } });
  async function worker(p) {
    const st = { pedidos: [], cola: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift() || fin('Listo.'); return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(f) }); });
    await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30 }) }));
    await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', gastoMes: 12.4, tope: 100, partes: {} }) }));
    await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia' }) }));
    return st;
  }
  const esperarIa = async (p) => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
  const decir = async (p, sw, frase, guion) => { sw.cola.push(...guion); const n0 = sw.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(p); await p.waitForTimeout(400); return sw.pedidos.slice(n0); };
  const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : Array.isArray(x) ? x.map((y) => (y && y.type === 'text' ? y.text : '')).join('') : JSON.stringify(x); };
  const herramientas = (ped) => ((ped[0] || {}).tools || []).map((t) => t.name);
  const abrirIa = async (p) => { await esperar(p, () => typeof window.__asistenteAbrir === 'function', null, 80); const sw = await worker(p); await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(800); return sw; };
  const tarjeta = (p) => tx(p, '#iaChat .ia-conf:last-of-type');
  const botones = (p) => p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); return c ? [...c.querySelectorAll('button')].map((b) => b.textContent.trim()) : []; });
  const si = async (p) => { await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); const b = c && c.querySelector('[data-iasi]'); b && b.click(); }); for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (/Guardado|No se pudo|⚠/.test(await tarjeta(p))) break; } await p.waitForTimeout(300); };
  const per = (d) => d.configEquipo.personal;
  try {
    // ================================================================= 0) la oficina carga gente con el asistente
    if (SOLO(0)) {
      const A = await sesion('lucia'); const p = A.page; const sw = await abrirIa(p);
      c(/Cargar personal/.test(await tx(p, '#iaChips')), 'chip «👷 Cargar personal» para la oficina');
      let ped = await decir(p, sw, '¿quiénes están en la nómina?', [usa('nomina', {}), fin('Son 15.')]);
      const h = herramientas(ped);
      c(['nomina', 'proponer_personal', 'proponer_vehiculo'].every((x) => h.indexOf(x) >= 0), 'la oficina tiene nomina, proponer_personal y proponer_vehiculo');
      c(/PERSONAL \(v175\)/.test(JSON.stringify((ped[0] || {}).system || '')) && /nunca inventes legajo ni valor hora/.test(JSON.stringify((ped[0] || {}).system || '')), 'el SISTEMA: PERSONAL (v175), nunca inventes legajo ni valor hora');
      let r = resultado(ped, 1);
      c(/"cargada":true/.test(r) && /JAVIER OLARIAGA/.test(r) && /51400/.test(r) && /"valorHora":4000/.test(r) && /Hilux blanca/.test(r) && /"totalPersonas":15/.test(r), 'nomina: las 15 con legajo, valor hora y los vehículos · ' + r.slice(0, 160));
      c(/"equipoCivil":true/.test(r) && /AB123CD/.test(r) && /"aCargo":\["Mauricio Mainini"/.test(r), 'nomina: equipo civil, patentes y quién tiene cada vehículo');
      const d0 = await db(p), resp0 = (per(d0).respaldos || []).length;
      ped = await decir(p, sw, 'sumá a RAMIRO SOSA, oficial, legajo 51500, valor hora 5200; a javier olariaga oficial; y a lucas ferreyra ayudante', [usa('proponer_personal', { altas: [{ nombre: 'RAMIRO SOSA', rol: 'oficial', legajo: '51500', valor_hora: 5200 }, { nombre: 'javier olariaga', rol: 'oficial' }, { nombre: 'lucas ferreyra', rol: 'ayudante' }] }), fin('Te armé la tarjeta.')]);
      r = resultado(ped, 1);
      c(/pendiente_de_confirmacion/.test(r) && /OLARIAGA/.test(r) && /mismo nombre/.test(r), 'Olariaga ya está → queda para preguntar (no se duplica) · ' + r.slice(0, 200));
      const card = await tarjeta(p);
      c(/Ramiro Sosa/.test(card) && /Lucas Ferreyra/.test(card) && /leg\. 51500/.test(card) && /\$ 5\.200\/h/.test(card), 'tarjeta: Ramiro Sosa (nombre prolijo) con legajo y valor hora · ' + card.slice(0, 200));
      c(/Lucas Ferreyra: legajo, valor hora/.test(card) && /a completar/.test(card), 'Lucas: legajo y valor hora «a completar» (no se inventan)');
      c(/OLARIAGA/.test(card) && /Sin cargar hasta que me digas/.test(card), 'la tarjeta dice que Olariaga no se carga hasta confirmar');
      c((await botones(p)).indexOf('Sí, cargarlos') >= 0 && (await botones(p)).indexOf('No') >= 0, '«Sí, cargarlos» / «No» · ' + (await botones(p)).join(' | '));
      c(per(await db(p)).nomina.length === 15, 'antes del «Sí» no se escribe nada');
      await si(p);
      let d = await db(p), P = per(d);
      c(P.nomina.length === 17 && P.nomina.some((x) => x.nombre === 'Ramiro Sosa' && x.legajo === '51500' && x.valorHora === 5200 && x.rol === 'Oficial') && P.nomina.some((x) => x.nombre === 'Lucas Ferreyra' && x.legajo === '' && !x.valorHora && x.rol === 'Ayudante'), `«Sí»: 17 personas, Ramiro con sus datos y Lucas sin legajo ni valor hora (${P.nomina.length})`);
      c(P.nomina.filter((x) => /olariaga/i.test(x.nombre)).length === 1, 'Olariaga sigue una sola vez');
      c((P.respaldos || []).length === resp0 + 1 && P.respaldos[P.respaldos.length - 1].nomina.length === 15, 'respaldos[] con la nómina anterior de 15 (la guardia de la v174)');
      c(/✓ Guardado: 17 personas, 3 vehículos \(leído de vuelta de la base\)/.test(await tarjeta(p)), 'mensaje leído de vuelta: ' + (await tarjeta(p)).match(/✓[^.]*\./));
      const au = Object.values(d.auditoria || {}).filter((x) => x.accion === 'personal_asistente');
      c(au.length === 1 && au[0].porAsistente === true && au[0].despues.personas === 17, 'auditoría personal_asistente con porAsistente:true');
      // cambiar el valor hora
      ped = await decir(p, sw, 'el valor hora de Ramiro es 5600', [usa('proponer_personal', { cambios: [{ persona: 'Ramiro', valor_hora: '5.600' }] }), fin('Listo.')]);
      c(/\$ 5\.200/.test(await tarjeta(p)) && /\$ 5\.600/.test(await tarjeta(p)), 'cambio: valor hora $ 5.200 → $ 5.600 en la tarjeta');
      await si(p); d = await db(p);
      c(per(d).nomina.find((x) => x.nombre === 'Ramiro Sosa').valorHora === 5600, 'valor hora guardado 5600');
      // baja
      ped = await decir(p, sw, 'dá de baja a Vizgarra, renunció', [usa('proponer_personal', { bajas: [{ persona: 'Vizgarra', motivo: 'renunció' }] }), fin('Listo.')]);
      c(/de baja \(no se borra\)/.test(await tarjeta(p)), 'baja: la tarjeta dice «de baja (no se borra)»');
      await si(p); d = await db(p);
      const vz = per(d).nomina.find((x) => /Vizgarra/.test(x.nombre));
      c(per(d).nomina.length === 17 && vz && vz.activo === false && vz.bajaMotivo === 'renunció', 'Vizgarra activo:false con el motivo, sigue en la nómina (17)');
      // vehículo nuevo
      ped = await decir(p, sw, 'cargá la barquilla 2, patente ae111ff, 2 lugares, la tiene Ramiro', [usa('proponer_vehiculo', { altas: [{ nombre: 'Barquilla 2', patente: 'ae111ff', tipo: 'barquilla', lugares: 2, a_cargo: 'Ramiro Sosa' }] }), fin('Listo.')]);
      c(/Barquilla 2/.test(await tarjeta(p)) && /AE111FF/.test(await tarjeta(p)) && (await botones(p)).indexOf('Sí, cargarlos') >= 0, 'tarjeta del vehículo con la patente en mayúsculas');
      await si(p); d = await db(p);
      const bq = (per(d).vehiculos || []).find((v) => v.nombre === 'Barquilla 2');
      c(per(d).vehiculos.length === 4 && bq && bq.tipo === 'barquilla' && bq.lugares === 2 && per(d).nomina.find((x) => x.nombre === 'Ramiro Sosa').vehiculoId === bq.id, '4 vehículos y Ramiro con la barquilla a cargo');
      c(/4 vehículos/.test(await tarjeta(p)), 'leído de vuelta con 4 vehículos');
      // un vehículo repetido → pregunta
      ped = await decir(p, sw, 'cargá la hilux blanca', [usa('proponer_vehiculo', { altas: [{ nombre: 'Hilux blanca' }] }), fin('Ya está.')]);
      c(/preguntar/.test(resultado(ped, 1)), 'vehículo repetido → pregunta');
      c((A.errores || []).filter((e) => !/permission|ERR_|Failed to fetch|aborted/i.test(e)).length === 0, 'sin errores de JS · ' + (A.errores || []).slice(0, 2).join(' | '));
      await A.browser.close(); browser = null;
    }
    // ================================================================= 1) recuperar lo que se borró
    if (SOLO(1)) {
      const A = await sesion('admin', datos175({ mal: true })); const p = A.page; const sw = await abrirIa(p);
      const ped = await decir(p, sw, 'recuperá lo que se borró del personal', [usa('proponer_personal', { recuperar: true }), fin('Encontré 5 y 3 vehículos.')]);
      const r = resultado(ped, 1), card = await tarjeta(p);
      c(/Recuperar personal/.test(card) && ['OLARIAGA', 'Pereyra', 'PETITTI', 'Cherino', 'Vizgarra'].every((x) => card.indexOf(x) >= 0), 'la tarjeta propone a los 5 que faltan · ' + card.slice(0, 220));
      c(/Hilux blanca/.test(card) && /Hidro 1/.test(card) && /Grúa/.test(card), 'y los 3 vehículos de las órdenes');
      c(/sale de/.test(card) && /orden OT-2026-20/.test(card) && /quincena cerrada/.test(card), 'con de dónde sale cada dato (orden, quincena)');
      c(/Lastra Sergi Ariel/.test(card) === false || !/Lastra.*→/.test(card), 'no saca ni cambia a los que están');
      c(/pendiente_de_confirmacion/.test(r), 'no escribe antes del «Sí»');
      const nF = await p.evaluate(() => window.__psRec.analizar().faltan.length);   // lo que encuentra el motor de la v174 (el mismo de «🩹 Recuperar»)
      await si(p);
      const P = per(await db(p));
      c(P.nomina.length === 10 + nF && nF >= 5 && ['OLARIAGA', 'Pereyra', 'PETITTI', 'Cherino', 'Vizgarra'].every((x) => P.nomina.some((y) => y.nombre.indexOf(x) >= 0)) && P.vehiculos.length === 3 && P.nomina.find((x) => x.nombre === 'JAVIER OLARIAGA').legajo === '51400', `con «Sí»: los 5 (y lo demás que encuentra el motor de la v174: ${nF}) y 3 vehículos (Olariaga con el legajo de la quincena) (${P.nomina.length}/${(P.vehiculos || []).length})`);
      c(P.nomina.find((x) => x.nombre === 'Lastra Sergi Ariel').rol === 'Medio oficial', 'Lastra sigue como estaba (no se pisa a nadie)');
      c((P.respaldos || []).length >= 1 && P.respaldos[P.respaldos.length - 1].nomina.length === 10, 'respaldo con la de 10');
      c(new RegExp('✓ Guardado: ' + (10 + nF) + ' personas, 3 vehículos').test(await tarjeta(p)), 'leído de vuelta: ' + (10 + nF) + ' personas, 3 vehículos');
      await A.browser.close(); browser = null;
    }
    // ================================================================= 2) la base todavía no llegó
    if (SOLO(2)) {
      const A = await sesion('lucia', null, { demora: { 'configEquipo/personal': 60000 } }); const p = A.page; const sw = await abrirIa(p);
      let ped = await decir(p, sw, 'quiénes están', [usa('nomina', {}), fin('Todavía no llegó.')]);
      c(/"cargada":false/.test(resultado(ped, 1)) && /no la muestro/.test(resultado(ped, 1)), 'nomina sin la base: «todavía no llegó», no muestra la de ejemplo');
      ped = await decir(p, sw, 'sumá a Ramiro Sosa', [usa('proponer_personal', { altas: [{ nombre: 'Ramiro Sosa' }] }), fin('No pude.')]);
      c(/Todavía no llegó la nómina/.test(resultado(ped, 1)), 'proponer_personal sin la base: no arma nada');
      c(!(await p.$('#iaChat .ia-conf [data-iasi]')), 'sin tarjeta');
      await A.browser.close(); browser = null;
    }
    // ================================================================= 3) roles
    if (SOLO(3)) {
      for (const [quien, lee] of [['dir', true], ['juan', false], ['pan', false], ['mir', false]]) {
        const A = await sesion(quien); const p = A.page; const sw = await abrirIa(p);
        const ped = await decir(p, sw, 'quiénes están en la nómina', lee ? [usa('nomina', {}), fin('Son 15.')] : [fin('No puedo.')]);
        const h = herramientas(ped);
        c(h.indexOf('proponer_personal') < 0 && h.indexOf('proponer_vehiculo') < 0 && (h.indexOf('nomina') >= 0) === lee, `${quien}: sin proponer_personal ni proponer_vehiculo; nomina ${lee ? 'sí' : 'no'}`);
        if (lee) { const r = resultado(ped, 1); c(/"cargada":true/.test(r) && !/valorHora/.test(r), 'Dirección lee la nómina sin valor hora'); }
        c(!/Cargar personal/.test(await tx(p, '#iaChips')), `${quien}: sin el chip`);
        await A.browser.close(); browser = null;
      }
    }
    // ================================================================= 4) __v175No
    if (SOLO(4)) {
      const A = await sesion('lucia', null, { v175: false }); const p = A.page; const sw = await abrirIa(p);
      const ped = await decir(p, sw, 'hola', [fin('Hola.')]);
      const h = herramientas(ped);
      c(h.length > 10 && h.indexOf('nomina') < 0 && h.indexOf('proponer_personal') < 0 && !/PERSONAL \(v175\)/.test(JSON.stringify(ped[0].system || '')) && !/Cargar personal/.test(await tx(p, '#iaChips')), '__v175No: sin herramientas, sin SISTEMA ni chip (como la v174)');
      await A.browser.close(); browser = null;
    }
  } catch (e) { console.log('ERROR', e && e.stack); c(false, 'error: ' + (e && e.message)); }
  if (browser) await browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
