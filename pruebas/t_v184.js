// v184 · «💬 Chat interno» (Ángel 19/11: «oficina y administrador registran los que pueden entrar… para que los de cuadrilla pidan
//  cosas como "faltó hacerme esta tarea, agregarme esto" — y la IA me cree la tarea y me diga que la apruebe a mí y a la oficina»).
//  0) Administración habilita a Juan (⚙); Juan (celu) ve el chat en el menú y en Perfil, escribe «faltó cargarme la zanja de 10 m
//     de hoy» → UN pedido al Worker (tipo pregunta, solo SUS órdenes) → tarjeta «Le mandé a Ángel y a la oficina…» + aviso al
//     celu de Administración y Oficina; Administración la ve (globito, «🙋 1 para aprobar»), «✅ Aprobar» → antes → después →
//     «Sí, aprobar» → la OT-2026-130 suma la zanja de 10 m, el pedido queda aprobado, auditoría, aviso a Juan y Juan lo ve.
//  1) Lucía (Oficina): un pedido de corregir el cierre de la OT-2026-110 (cerrada) → aprueba por __corregirCierre (3 → 4);
//     otro pedido → «✕ No corresponde» sin motivo no deja; con motivo sí (aviso a Juan); el asistente pregunta si falta un dato;
//     el Worker caído → el mensaje queda como texto y le avisa.
//  2) Pedro (cuadrilla, no habilitado): no ve el chat ni puede abrirlo; con las reglas no lee la conversación de Juan ni escribe.
//  3) Dirección: ve todo, sin caja para escribir ni «Aprobar».
//  4) Sin señal: el mensaje queda «⏳ Sin enviar» y sale cuando vuelve la señal (después arma el pedido).
//  5) Reglas viejas (sin la v184): Administración ve «Falta publicar las reglas de Firebase de la v184» (chat y menú).
//  6) __v184No: nada del chat.
const { abrir, otraPagina, prueba } = require('./h');
const { datos184 } = require('./datos184');
const cel = process.argv[2] === 'cel';
const REGLAS = !!process.env.REGLAS;
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v184' + (cel ? ' cel' : '') + (REGLAS ? ' REGLAS' : ''));
  let n = 0;
  const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 900, output_tokens: 60 }, ema: { costoUsd: 0.01, version: 'v4-ia' } });
  const MOD = { cel, espera: 3500, https: true, reglas: REGLAS, v184: true, v150: true, v153: true, v154: true, v155: true, v156: true, antes: () => { window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; window.__cvSinMic = true; window.__gdEspera = 1e9; window.__stubPorColeccion = true; } };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const tx = (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const esperar = async (p, fn, arg, ms) => { for (let i = 0; i < (ms || 40); i++) { if (await p.evaluate(fn, arg).catch(() => false)) return true; await p.waitForTimeout(250); } return false; };
  const sinScroll = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const cap = async (p, nn) => { if (CAP) await p.screenshot({ path: `${CAP}/${nn}${cel ? '_cel' : '_pc'}.png`, fullPage: false }); };
  const msgs = (d) => Object.values(d.chatInterno || {});
  // el Worker simulado (por página): cola de respuestas; guarda lo que se le mandó
  async function worker(p) {
    const W0 = { cola: [], pedidos: [] };
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } W0.pedidos.push(b); const f = W0.cola.shift(); if (f === 500) return rt.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { tipo: 'api', mensaje: 'caído' } }) }); const x = typeof f === 'function' ? f(b) : f; return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x || fin('{"accion":"nada"}')) }); });
    for (const r of ['/mio', '/uso', '/salud']) await p.route(W + r, (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v4-ia', habilitado: true, quedanPreguntas: 10, topePreguntas: 10, gastoMes: 1, tope: 100, partes: {} }) }));
    return W0;
  }
  const listo = (p) => esperar(p, () => !!(window.__chat184 && window.__chat184.puedeEntrar()), null, 60);
  async function escribir(p, t) { await p.fill('#chTxt', t); await p.click('#chOv [data-ch="enviar"]'); }
  async function juan(A, op) {
    const J = await otraPagina(A, Object.assign({}, MOD, { sesion: 'juan', crew: true, nav: true }, op || {}));
    if (!cel) await J.page.setViewportSize({ width: 390, height: 844 });
    J.W = await worker(J.page); return J;
  }
  let browser = null;
  try {
    // ================================================================= 0) habilitar, pedido de Juan, aprobar
    if (SOLO(0)) {
      const A = await abrir(Object.assign({ sesion: 'admin', datos: datos184() }, MOD)); browser = A.browser; const p = A.page;
      c(await listo(p), 'Administración entra al chat siempre');
      c(await p.evaluate(() => !!document.getElementById('menuChat')), 'menú: «💬 Chat interno»');
      await p.evaluate(() => window.__chat184.abrir()); await p.waitForTimeout(400);
      c(/General/.test(await tx(p, '#chOv')) && /Todavía no habilitaste/.test(await tx(p, '#chOv')), 'la lista: «General» y «Todavía no habilitaste a nadie»');
      await p.click('#chOv [data-ch="cfg"]'); await p.waitForTimeout(300);
      const filas = await p.evaluate(() => [...document.querySelectorAll('#chOv .ch-hab')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
      c(filas.some((x) => /Juan Pérez/.test(x)) && filas.some((x) => /Pedro Gómez/.test(x)) && !filas.some((x) => /Lucía|Roberto|Ana Admin/.test(x)), '⚙: se elige entre cuadrilla / pañol / mirar (no Oficina, Dirección ni Administración) · ' + filas.length);
      await p.click('#chOv [data-ch="hab:uJuan"]'); await p.waitForTimeout(600);
      let D = await db(p);
      c(!!(((D.configEquipo || {}).chat || {}).habilitados || {}).uJuan && D.configEquipo.chat.habilitados.uJuan.email === 'juan@ema-alumbrado.app', 'configEquipo/chat.habilitados.uJuan (con quién y el correo)');
      c(Object.values(D.auditoria || {}).some((x) => x.tipo === 'chat_habilitar' || x.accion === 'chat_habilitar' || /chat_habilitar/.test(JSON.stringify(x))), 'auditoría chat_habilitar');
      await cap(p, 'v184_cfg');
      await p.click('#chOv [data-ch="cerrar"]');
      // Juan en el celu
      const J = await juan(A); const q = J.page;
      c(await listo(q), 'Juan (habilitado) entra al chat');
      c(await q.evaluate(() => !!document.getElementById('menuChat')), 'Juan tiene «💬 Chat interno» en el menú');
      await q.evaluate(() => mostrarVista('perfil')); await q.waitForTimeout(2600);
      c(await q.evaluate(() => !!document.querySelector('#chPerfil [data-ch="abrir"]')), 'Perfil: «💬 Chat con la oficina»');
      await q.click('#chPerfil [data-ch="abrir"]'); await q.waitForTimeout(500);
      c(/Con la oficina/.test(await tx(q, '#chOv .ch-tabs')) && /General/.test(await tx(q, '#chOv .ch-tabs')), 'Juan abre directo «Con la oficina» (y la pestaña «General»)');
      c(await sinScroll(q) && await q.evaluate(() => [...document.querySelectorAll('#chOv .ch-pie button, #chOv .ch-pie label, #chOv .ch-x, #chOv .ch-tabs .subtab')].every((b) => b.getBoundingClientRect().height >= 40)), 'celu: sin scroll de costado y botones grandes');
      J.W.cola.push(fin('{"accion":"agregar","ot":"OT-2026-130","tarea":"zanjeo","cantidad":10,"resumen":"le faltó la zanja de 10 m"}'));
      await escribir(q, 'faltó cargarme la zanja de 10 m de hoy');
      c(await esperar(q, () => Object.values(JSON.parse(localStorage.getItem('stub.db') || '{}').chatInterno || {}).some((m) => m.tipo === 'pedido'), null, 60), 'el asistente arma el pedido');
      const b0 = J.W.pedidos[0] || {}, txt0 = JSON.stringify(b0.messages || '');
      c(J.W.pedidos.length === 1 && b0.ema && b0.ema.tipo === 'pregunta', 'UN pedido al Worker, tipo «pregunta» (con los topes de su rol)');
      c(/OT-2026-130/.test(txt0) && !/OT-2026-121/.test(txt0) && !/Marcos/.test(txt0), 'el asistente ve SOLO las órdenes de Juan (la OT-2026-121 de Marcos no va)');
      D = await db(q);
      const M = msgs(D).sort((a, b) => a.ts - b.ts), ped = M.find((m) => m.tipo === 'pedido');
      c(M[0].tipo === 'msg' && M[0].hilo === 'p_uJuan' && M[0].uid === 'uJuan' && /zanja de 10 m/.test(M[0].texto), 'el mensaje de Juan queda en su conversación');
      c(ped && ped.estado === 'pendiente' && ped.pedido.accion === 'agregar' && ped.pedido.k === 'zanjeo' && ped.pedido.despues === 10 && ped.pedido.otNumero === 'OT-2026-130', 'tarjeta: sumar «zanjeo» 10 a la OT-2026-130, pendiente');
      c(/Le mandé a Ángel y a la oficina para que lo aprueben/.test(await tx(q, '#chOv')), 'Juan lee «Le mandé a Ángel y a la oficina para que lo aprueben»');
      c((D.chatHilos || {}).p_uJuan && D.chatHilos.p_uJuan.pend === 1 && D.chatHilos.p_uJuan.uid === 'uJuan', 'chatHilos/p_uJuan: 1 pedido por aprobar');
      const av = Object.values(D.avisosPush || {});
      c(av.some((x) => x.email === 'admin@ema-alumbrado.app' && /Pedido de Juan/.test(x.titulo)) && av.some((x) => x.email === 'lucia@ema-alumbrado.app' && /Pedido de Juan/.test(x.titulo)), 'aviso al celu de Administración y Oficina («🙋 Pedido de Juan para aprobar»)');
      c(!(D.ordenesTrabajo.h130.actividades || []).includes('zanjeo'), 'la orden NO cambió todavía');
      await cap(q, 'v184_juan_pedido');
      // Administración aprueba
      c(await esperar(p, () => /\d/.test((document.getElementById('menuChat') || {}).textContent || ''), null, 30), 'Administración: el globito del chat en el menú · ' + await tx(p, '#menuChat'));
      await p.evaluate(() => window.__chat184.abrir()); await p.waitForTimeout(500);
      c(/🙋 1 para aprobar/.test(await tx(p, '#chOv')), 'la lista: Juan «🙋 1 para aprobar»');
      await p.click('#chOv [data-ch="hilo:p_uJuan"]'); await p.waitForTimeout(600);
      c(/sumar a la orden/.test(await tx(p, '#chOv .ch-card')) && /no está en la orden/.test(await tx(p, '#chOv .ch-card')), 'la tarjeta con antes → después');
      await p.click('#chOv .ch-card [data-ch^="si:"]'); await p.waitForTimeout(400);
      c(/Sí, aprobar/.test(await tx(p, '#chOv .ch-card')) && (await p.inputValue('#chMot')).length > 10, '«✅ Aprobar» → antes → después + motivo precargado');
      await cap(p, 'v184_admin_aprobar');
      await p.click('#chOv .ch-card [data-ch^="sisi:"]');
      c(await esperar(p, () => { const o = JSON.parse(localStorage.getItem('stub.db')).ordenesTrabajo.h130; return (o.actividades || []).includes('zanjeo') && (o.previsto || {}).zanjeo === 10; }, null, 40), 'Aprobado: la OT-2026-130 suma la zanja de 10 m (actividades + previsto)');
      D = await db(p);
      const ped2 = msgs(D).find((m) => m.tipo === 'pedido');
      c(ped2.estado === 'aprobado' && ped2.decPor === 'admin@ema-alumbrado.app' && /zanj/i.test(ped2.resultado), 'el pedido queda aprobado (quién y qué)');
      c(msgs(D).some((m) => m.tipo === 'sistema' && /aprobó/.test(m.texto)) && D.chatHilos.p_uJuan.pend === 0, 'mensaje «✅ Ana aprobó…» y 0 por aprobar');
      c(Object.values(D.avisosPush || {}).some((x) => x.email === 'juan@ema-alumbrado.app' && /aprobó tu pedido/.test(x.titulo)), 'aviso al celu de Juan');
      c(Object.values(D.auditoria || {}).some((x) => /chat_pedido/.test(JSON.stringify(x)) && /aprobado/.test(JSON.stringify(x))), 'auditoría chat_pedido');
      c(await esperar(q, () => /Aprobado por/.test(document.querySelector('#chOv') ? document.querySelector('#chOv').textContent : ''), null, 40), 'Juan ve «✅ Aprobado por Ana» en el chat');
      await cap(q, 'v184_juan_aprobado');
      c([...A.errores, ...J.errores].filter((e) => !/permission|ERR_|Failed to fetch|aborted|insufficient/i.test(e)).length === 0, 'sin errores de JS · ' + [...A.errores, ...J.errores].slice(0, 2).join(' | '));
      await A.browser.close(); browser = null;
    }
    // ================================================================= 1) Oficina: corregir un cierre, no corresponde, preguntas, Worker caído
    if (SOLO(1)) {
      const A = await abrir(Object.assign({ sesion: 'lucia', datos: datos184({ hab: true }) }, MOD)); browser = A.browser; const p = A.page;
      c(await listo(p), 'Lucía (Oficina) entra al chat');
      const J = await juan(A); const q = J.page; await listo(q);
      await q.evaluate(() => window.__chat184.abrir()); await q.waitForTimeout(400);
      J.W.cola.push(fin('{"accion":"corregir","ot":"OT-2026-110","tarea":"montaje_prfv","cantidad":1}'));
      await escribir(q, 'en la OT-2026-110 me faltó cargar una columna izada');
      c(await esperar(q, () => Object.values(JSON.parse(localStorage.getItem('stub.db')).chatInterno || {}).some((m) => m.tipo === 'pedido'), null, 60), 'pedido de corregir el cierre · ' + (await tx(q, '#chOv')).slice(-300));
      let ped = msgs(await db(q)).find((m) => m.tipo === 'pedido');
      c(ped.pedido.accion === 'corregir' && ped.pedido.antes === 3 && ped.pedido.despues === 4, 'la tarjeta: «izaje» del cierre 3 → 4');
      await p.evaluate(() => window.__chat184.abrir('p_uJuan')); await p.waitForTimeout(800);
      await p.click('#chOv .ch-card [data-ch^="si:"]'); await p.waitForTimeout(500);
      c(/Sí, aprobar/.test(await tx(p, '#chOv .ch-card')), 'Oficina: «Aprobar» arma la corrección del cierre · ' + (await tx(p, '#chOv .ch-card')).slice(0, 160));
      await p.click('#chOv .ch-card [data-ch^="sisi:"]');
      c(await esperar(p, () => ((JSON.parse(localStorage.getItem('stub.db')).ordenesTrabajo.c110.cierre || {}).cantidades || {}).montaje_prfv === 4, null, 40), 'aprobado por __corregirCierre: la OT-2026-110 cerrada con 4');
      let D = await db(p);
      c((D.ordenesTrabajo.c110.cierre.puntosHist || []).some((h) => /chat/i.test(h.motivo || '')), 'el historial de la orden guarda el motivo («Pedido de Juan por el chat…»)');
      c(msgs(D).find((m) => m.tipo === 'pedido').estado === 'aprobado' && msgs(D).find((m) => m.tipo === 'pedido').decPor === 'lucia@ema-alumbrado.app', 'aprobado por Lucía');
      // otro pedido → no corresponde
      J.W.cola.push(fin('{"accion":"agregar","ot":"OT-2026-130","tarea":"sellado_base","cantidad":2}'));
      await escribir(q, 'agregame 2 sellados más de hoy');
      c(await esperar(q, () => Object.values(JSON.parse(localStorage.getItem('stub.db')).chatInterno || {}).filter((m) => m.tipo === 'pedido').length === 2, null, 60), 'segundo pedido');
      await p.waitForTimeout(800);
      const id2 = msgs(await db(p)).filter((m) => m.tipo === 'pedido').sort((a, b) => b.ts - a.ts)[0].id;
      await p.click(`#chOv [data-ch="rech:${id2}"]`); await p.waitForTimeout(300);
      await p.click(`#chOv [data-ch="rechsi:${id2}"]`); await p.waitForTimeout(500);
      c(/Escribí por qué/.test(await tx(p, '#chOv')) && msgs(await db(p)).find((m) => m.id === id2).estado === 'pendiente', '«No corresponde» sin motivo no deja');
      await p.fill('#chMot', 'el sellado de hoy ya está en 3 y no se hizo más'); await p.click(`#chOv [data-ch="rechsi:${id2}"]`);
      c(await esperar(p, (i) => (JSON.parse(localStorage.getItem('stub.db')).chatInterno[i] || {}).estado === 'rechazado', id2, 30), 'con motivo: queda «no corresponde»');
      D = await db(p);
      c(D.chatInterno[id2].decMotivo === 'el sellado de hoy ya está en 3 y no se hizo más' && (D.ordenesTrabajo.h130.previsto || {}).sellado_base === 3, 'el motivo queda y la orden NO cambia');
      c(Object.values(D.avisosPush || {}).some((x) => x.email === 'juan@ema-alumbrado.app' && /no corresponde/.test(x.titulo) && /no se hizo más/.test(x.cuerpo)), 'a Juan le llega el motivo');
      c(await esperar(q, () => /No corresponde/.test(document.querySelector('#chOv').textContent), null, 30), 'Juan lo ve en el chat');
      // el asistente pregunta si falta un dato
      J.W.cola.push(fin('{"accion":"preguntar","pregunta":"¿De qué día es la zanja que te faltó?"}'));
      await escribir(q, 'me faltó cargar una zanja');
      c(await esperar(q, () => Object.values(JSON.parse(localStorage.getItem('stub.db')).chatInterno || {}).some((m) => m.tipo === 'ia' && /De qué día/.test(m.texto)), null, 60), 'el asistente pregunta en el chat («¿De qué día…?»)');
      // el Worker caído: queda como mensaje
      J.W.cola.push(500);
      await escribir(q, 'me faltan puntos de la zanja de ayer');
      c(await esperar(q, () => /no pudo armar el pedido/.test(document.querySelector('#chOv').textContent), null, 60), 'Worker caído: «el asistente no pudo armar el pedido: tu mensaje le llegó a la oficina igual»');
      D = await db(q);
      c(msgs(D).some((m) => m.tipo === 'msg' && /puntos de la zanja/.test(m.texto)) && msgs(D).filter((m) => m.tipo === 'pedido').length === 2, 'el mensaje está igual (sin pedido nuevo)');
      // un mensaje común no va al asistente
      const np = J.W.pedidos.length; await escribir(q, 'buen día, ya llegamos'); await q.waitForTimeout(1500);
      c(J.W.pedidos.length === np, 'un saludo no gasta una pregunta del asistente');
      // la oficina le contesta a Juan
      await p.evaluate(() => window.__chat184.abrir('p_uJuan')); await p.waitForTimeout(400);
      await escribir(p, 'Dale Juan, gracias');
      c(await esperar(q, () => /Dale Juan, gracias/.test(document.querySelector('#chOv').textContent), null, 30), 'la respuesta de la Oficina le llega a Juan');
      D = await db(p);
      c(Object.values(D.avisosPush || {}).some((x) => x.email === 'juan@ema-alumbrado.app' && /💬 Lucía/.test(x.titulo)), 'aviso al celu de Juan («💬 Lucía»)');
      // General
      await q.click('#chOv [data-ch="hilo:general"]'); await q.waitForTimeout(400);
      await escribir(q, 'mañana llueve');
      c(await esperar(q, () => Object.values(JSON.parse(localStorage.getItem('stub.db')).chatInterno || {}).some((m) => m.hilo === 'general' && /llueve/.test(m.texto)), null, 30), 'Juan escribe en «General»');
      c([...A.errores, ...J.errores].filter((e) => !/permission|ERR_|Failed to fetch|aborted|insufficient|500/i.test(e)).length === 0, 'sin errores de JS · ' + [...A.errores, ...J.errores].slice(0, 2).join(' | '));
      await A.browser.close(); browser = null;
    }
    // ================================================================= 2) Pedro (no habilitado)
    if (SOLO(2)) {
      const d = datos184({ hab: true });
      d.db.chatInterno = { m1: { id: 'm1', hilo: 'p_uJuan', mes: new Date().toISOString().slice(0, 7), uid: 'uJuan', texto: 'privado de Juan', tipo: 'msg', ts: Date.now() } };
      const A = await abrir(Object.assign({ sesion: 'pedro', datos: d }, MOD, { crew: true })); browser = A.browser; const p = A.page;
      await p.waitForTimeout(2000);
      c(await p.evaluate(() => !!window.__chat184 && !window.__chat184.puedeEntrar() && !document.getElementById('menuChat')), 'Pedro (no habilitado) no ve el chat en el menú');
      c(await p.evaluate(() => window.__chat184.abrir() === false), 'abrirlo igual: «Para entrar al chat te tiene que habilitar la oficina»');
      if (REGLAS) {
        const r = await p.evaluate(async () => { const o = {}; try { await firebase.firestore().collection('chatInterno').where('hilo', '==', 'p_uJuan').get(); o.lee = 1; } catch (e) { o.lee = e.code; } try { await firebase.firestore().collection('chatInterno').doc('mx').set({ id: 'mx', hilo: 'p_uPedro', mes: 'x', uid: 'uPedro', texto: 'hola', tipo: 'msg', ts: 1 }); o.esc = 1; } catch (e) { o.esc = e.code; } return o; });
        c(r.lee === 'permission-denied' && r.esc === 'permission-denied', 'reglas: Pedro no lee la conversación de Juan ni escribe · ' + JSON.stringify(r));
        const J = await otraPagina(A, Object.assign({}, MOD, { sesion: 'juan', crew: true }));
        const r2 = await J.page.evaluate(async () => { const o = {}; try { await firebase.firestore().collection('chatInterno').where('hilo', '==', 'p_uPedro').get(); o.ajeno = 1; } catch (e) { o.ajeno = e.code; } try { await firebase.firestore().collection('chatInterno').doc('my').set({ id: 'my', hilo: 'p_uJuan', mes: 'x', uid: 'uJuan', texto: 'x', tipo: 'pedido', estado: 'aprobado', ts: 1 }); o.aprobado = 1; } catch (e) { o.aprobado = e.code; } try { await firebase.firestore().collection('chatInterno').doc('m1').update({ estado: 'aprobado' }); o.upd = 1; } catch (e) { o.upd = e.code; } try { await firebase.firestore().collection('chatInterno').doc('m1').delete(); o.del = 1; } catch (e) { o.del = e.code; } return o; });
        c(r2.ajeno === 'permission-denied' && r2.aprobado === 'permission-denied' && r2.upd === 'permission-denied' && r2.del === 'permission-denied', 'reglas: Juan no lee la de Pedro, no se aprueba solo, no cambia ni borra · ' + JSON.stringify(r2));
      }
      await A.browser.close(); browser = null;
    }
    // ================================================================= 3) Dirección
    if (SOLO(3)) {
      const d = datos184({ hab: true }), mes = new Date().toISOString().slice(0, 7), ts = Date.now();
      d.db.chatHilos = { p_uJuan: { id: 'p_uJuan', tipo: 'persona', uid: 'uJuan', nombre: 'Juan Pérez', email: 'juan@ema-alumbrado.app', ultTs: ts, ultTexto: 'faltó la zanja', ultUid: 'uJuan', pend: 1 } };
      d.db.chatInterno = { m1: { id: 'm1', hilo: 'p_uJuan', mes, uid: 'uJuan', nombre: 'Juan Pérez', persona: 'Juan Pérez', texto: 'faltó la zanja', tipo: 'msg', ts: ts - 1000 }, m2: { id: 'm2', hilo: 'p_uJuan', mes, uid: 'uJuan', persona: 'Juan Pérez', texto: 'Le mandé a Ángel y a la oficina para que lo aprueben.', tipo: 'pedido', estado: 'pendiente', ts, refId: 'm1', pedido: { accion: 'agregar', otId: 'h130', otNumero: 'OT-2026-130', k: 'zanjeo', tarea: 'Zanjeo troncal', un: 'm', cantidad: 10, antes: 0, despues: 10, persona: 'Juan Pérez', resumen: 'Sumar zanja', filas: [{ c: 'Zanjeo troncal', a: 'no está en la orden', d: '10 m' }] } } };
      const A = await abrir(Object.assign({ sesion: 'dir', datos: d }, MOD)); browser = A.browser; const p = A.page;
      c(await listo(p), 'Dirección entra al chat (solo mirar)');
      await p.evaluate(() => window.__chat184.abrir()); await p.waitForTimeout(400);
      c(/Solo para mirar/.test(await tx(p, '#chOv')) && !(await p.$('#chOv [data-ch="cfg"]')), 'la lista «Solo para mirar», sin ⚙');
      await p.click('#chOv [data-ch="hilo:p_uJuan"]'); await p.waitForTimeout(600);
      c(/faltó la zanja/.test(await tx(p, '#chOv')) && !!(await p.$('#chOv .ch-pie.solo')) && !(await p.$('#chTxt')), 've la conversación de Juan, sin caja para escribir');
      c(!(await p.$('#chOv [data-ch^="si:"]')) && /Para aprobar/.test(await tx(p, '#chOv .ch-card')), 've el pedido sin «Aprobar»');
      c((await p.evaluate(() => window.__chat184.decidir('m2', true, 'x'))).err && (await db(p)).chatInterno.m2.estado === 'pendiente', 'Dirección no puede aprobar');
      await A.browser.close(); browser = null;
    }
    // ================================================================= 4) sin señal
    if (SOLO(4)) {
      const A = await abrir(Object.assign({ sesion: 'admin', datos: datos184({ hab: true }) }, MOD)); browser = A.browser;
      const J = await juan(A); const q = J.page; await listo(q);
      await q.evaluate(() => window.__chat184.abrir()); await q.waitForTimeout(400);
      await q.evaluate(() => { window.__stubSinRed = true; });
      J.W.cola.push(fin('{"accion":"agregar","ot":"OT-2026-130","tarea":"zanjeo","cantidad":4}'));
      await escribir(q, 'faltó cargarme 4 m de zanja');
      await q.waitForTimeout(800);
      c(/Sin enviar/.test(await tx(q, '#chOv')) && !msgs(await db(q)).length, 'sin señal: se ve «⏳ Sin enviar» y todavía no está en la base');
      c(Object.keys(await q.evaluate(() => window.__chat184.pendientes())).length === 1, 'queda guardado en el celu');
      await cap(q, 'v184_sin_senal');
      await q.evaluate(() => { window.__stubSinRed = false; });
      c(await esperar(q, () => Object.values(JSON.parse(localStorage.getItem('stub.db')).chatInterno || {}).some((m) => /4 m de zanja/.test(m.texto)), null, 40), 'vuelve la señal: el mensaje sale');
      c(await esperar(q, () => Object.values(JSON.parse(localStorage.getItem('stub.db')).chatInterno || {}).some((m) => m.tipo === 'pedido'), null, 60) && !/Sin enviar/.test(await tx(q, '#chOv')), 'y después el asistente arma el pedido');
      await A.browser.close(); browser = null;
    }
    // ================================================================= 5) reglas viejas
    if (SOLO(5)) {
      const A = await abrir(Object.assign({ sesion: 'admin', datos: datos184({ hab: true }) }, MOD, { reglas: true, antes: () => { localStorage.setItem('stub.sinReglas184', '1'); window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; window.__gdEspera = 1e9; } })); browser = A.browser; const p = A.page;
      c(await esperar(p, () => window.__chat184 && window.__chat184.reglasViejas(), null, 40), 'con las reglas de antes: la app se da cuenta');
      c(/⚠/.test(await tx(p, '#menuChat')), 'menú: «Chat interno ⚠»');
      await p.evaluate(() => window.__chat184.abrir()); await p.waitForTimeout(400);
      c(/Falta publicar las reglas de Firebase de la v184/.test(await tx(p, '#chOv')), 'en el chat: «Falta publicar las reglas de Firebase de la v184»');
      const J = await otraPagina(A, Object.assign({}, MOD, { sesion: 'juan', crew: true, reglas: true, antes: () => { localStorage.setItem('stub.sinReglas184', '1'); } }));
      await J.page.waitForTimeout(1500);
      c(await J.page.evaluate(() => !window.__chat184.puedeEntrar() && !document.getElementById('menuChat')), 'la cuadrilla no ve el chat hasta que se publiquen');
      await A.browser.close(); browser = null;
    }
    // ================================================================= 6) __v184No
    if (SOLO(6)) {
      const A = await abrir(Object.assign({ sesion: 'admin', datos: datos184({ hab: true }) }, MOD, { v184: false })); browser = A.browser; const p = A.page;
      await p.waitForTimeout(1500);
      c(await p.evaluate(() => !window.__chat184 && !document.getElementById('menuChat') && !document.getElementById('chOv')), '__v184No: nada del chat');
      await A.browser.close(); browser = null;
    }
  } catch (e) { c(false, 'error: ' + (e && e.stack || e)); }
  finally { if (browser) await browser.close().catch(() => { }); c.fin ? c.fin() : null; }
})();
