// v179 · Personal del equipo con subíndices por sector (Ángel 19/11: «dentro de Personal del equipo tiene que tener subíndices que
//  separen a Ilícitos, Alumbrado, Civil, Contratista, Oficina, Dirección y Pañol»).
//  0) admin: las 8 pestañas con la cantidad, filtran la tabla, la última queda (recargar), «＋ Agregar persona» en Contratista trae
//     ese sector, «Guardar» filtrado guarda a TODOS (guardia v174: respaldos[]; equipoCivil no se pierde).
//  1) cambiar el sector de alguien (guardia + respaldo), la marca «equipo civil» en Civil y «Pasar los de equipo civil al sector
//     Civil» (Cancelar no toca; «Sí» por la guardia, auditoría).
//  2) gente sin tarea y la orden sugerida: sin Oficina, Dirección, Pañol ni Contratista; Civil entra como equipo civil.
//  3) pañol: el vale de la gente de Civil/Contratista va como Alumbrado y el de Ilícitos como Ilícitos; «Por sector» lo dice;
//     Llenar orden muestra el sector al lado del nombre.
//  4) asistente: nomina filtra por sector; proponer_personal pone «obra civil» → civil y cambia a contratista.
//  5) celular: la fila de pestañas se corre adentro, sin scroll de costado en la página, botones de 44 px; Oficina no ve «Pasar…».
//  6) __v179No: como antes.
const { abrir, prueba } = require('./h');
const { datos179 } = require('./datos179');
const cel = process.argv[2] === 'cel';
const REGLAS = !!process.env.REGLAS;
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v179' + (cel ? ' cel' : '') + (REGLAS ? ' REGLAS' : ''));
  let browser = null;
  const MOD = { cel, espera: 3500, https: true, reglas: REGLAS, v179: true, antes: () => { window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; window.__cvSinMic = true; window.__gdEspera = 1e9; } };
  const sesion = async (quien, d, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: d || datos179(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(800); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const per = (d) => d.configEquipo.personal;
  const tx = (p, s) => p.evaluate((x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, s);
  const esperar = async (p, fn, arg, ms) => { for (let i = 0; i < (ms || 40); i++) { if (await p.evaluate(fn, arg)) return true; await p.waitForTimeout(250); } return false; };
  const irPersonal = async (p) => { await p.evaluate(() => { mostrarVista('produccion'); }); await p.waitForTimeout(300); await p.evaluate(() => { const s = document.querySelector('#subtabsProd [data-sub="personal"]'); s && s.click(); }); await esperar(p, () => !!document.getElementById('ps179') && !!window.__personalCargado && document.querySelectorAll('#personalBody tr').length >= 20, null, 40); await p.waitForTimeout(400); };
  const tabs = (p) => p.evaluate(() => [...document.querySelectorAll('#ps179 [data-ps179]')].map((b) => ({ k: b.dataset.ps179, t: b.textContent.replace(/\s+/g, ' ').trim(), on: b.classList.contains('activo') })));
  const vis = (p) => p.evaluate(() => [...document.querySelectorAll('#personalBody tr[data-i]')].filter((tr) => tr.offsetParent !== null).map((tr) => tr.querySelector('.per-nombre').value));
  const tab = async (p, k) => { await p.click(`#ps179 [data-ps179="${k}"]`); await p.waitForTimeout(250); };
  const guardar = async (p) => { await p.evaluate(() => guardarPersonalEquipo()); for (let i = 0; i < 30; i++) { await p.waitForTimeout(250); if (/Guardado|⚠|No se pudo/.test(await tx(p, '#personalMsg'))) break; } };
  const sinScroll = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const cap = async (p, n) => { if (CAP) await p.screenshot({ path: `${CAP}/${n}${cel ? '_cel' : '_pc'}.png`, fullPage: false }); };
  try {
    // ================================================================= 0) pestañas, filtro, recordar, agregar, guardar
    if (SOLO(0)) {
      const A = await sesion('admin'); const p = A.page;
      await irPersonal(p);
      const T = await tabs(p);
      c(T.map((x) => x.k).join(',') === 'todos,alumbrado,civil,ilicitos,contratista,oficina,direccion,panol', 'las 8 pestañas en orden · ' + T.map((x) => x.t).join(' | '));
      const n = (k) => +((T.find((x) => x.k === k) || {}).t || '').replace(/\D+/g, ' ').trim().split(' ').pop();
      c(n('todos') === 20 && n('alumbrado') === 14 && n('civil') === 2 && n('ilicitos') === 1 && n('contratista') === 1 && n('oficina') === 1 && n('direccion') === 1 && n('panol') === 1, 'cantidades: Todos 20 · Alumbrado 14 · Civil 2 (1 + equipo civil) · Ilícitos 1 · los demás 1');
      c(T.find((x) => x.on).k === 'todos' && (await vis(p)).length === 20, 'de entrada «Todos» con las 20');
      await tab(p, 'civil'); let v = await vis(p);
      c(v.length === 2 && v.indexOf('Ramón Paredes') >= 0 && v.indexOf('Víctor Exequiel Franco') >= 0, 'Civil: Ramón (sector Civil) y Víctor (equipo civil) · ' + v.join(', '));
      c(/equipo civil/.test(await p.evaluate(() => { const tr = [...document.querySelectorAll('#personalBody tr')].find((x) => x.querySelector('.per-nombre').value === 'Víctor Exequiel Franco'); return tr ? tr.textContent : ''; })), 'Víctor lleva la marca «equipo civil»');
      c(/Pasar los de equipo civil al sector Civil \(1\)/.test(await tx(p, '#ps179')), 'Administración ve «Pasar los de equipo civil al sector Civil (1)»');
      await cap(p, 'v179_civil');
      await tab(p, 'ilicitos'); v = await vis(p); c(v.length === 1 && v[0] === 'Vizgarra Alfredo', 'Ilícitos: Vizgarra');
      await tab(p, 'oficina'); v = await vis(p); c(v.length === 1 && v[0] === 'Lucía Oficina', 'Oficina: Lucía');
      const opts = await p.evaluate(() => [...document.querySelector('#personalBody .per-sector').options].map((o) => o.value).join(','));
      c(opts === 'alumbrado,civil,ilicitos,contratista,oficina,direccion,panol', 'el «Sector» de cada uno tiene los 7 · ' + opts);
      c((await p.evaluate(() => localStorage.getItem('ema.per.sector'))) === 'oficina', 'la pestaña queda guardada (ema.per.sector)');
      await p.reload(); await p.waitForTimeout(2500); await irPersonal(p);
      c(((await tabs(p)).find((x) => x.on) || {}).k === 'oficina' && (await vis(p)).length === 1, 'al volver a entrar sigue en «Oficina»');
      // agregar en Contratista y guardar con la tabla filtrada
      const resp0 = (per(await db(p)).respaldos || []).length;
      await tab(p, 'contratista');
      await p.evaluate(() => agregarFilaPersonal()); await p.waitForTimeout(300);
      const nueva = await p.evaluate(() => { const l = [...document.querySelectorAll('#personalBody tr')]; const tr = l[l.length - 1]; return { sec: tr.querySelector('.per-sector').value, ver: tr.offsetParent !== null }; });
      c(nueva.sec === 'contratista' && nueva.ver, '«＋ Agregar persona» en Contratista: la fila nueva viene con Contratista');
      await p.evaluate(() => { const l = [...document.querySelectorAll('#personalBody tr')]; const i = l[l.length - 1].querySelector('.per-nombre'); i.value = 'Mario Contratado'; i.dispatchEvent(new Event('input', { bubbles: true })); });
      await guardar(p);
      let P = per(await db(p));
      c(P.nomina.length === 21 && P.nomina.some((x) => x.nombre === 'Mario Contratado' && x.sector === 'contratista'), `«Guardar» con la pestaña filtrada: 21 personas (nadie se perdió) y Mario en Contratista (${P.nomina.length})`);
      c(P.nomina.find((x) => x.nombre === 'Víctor Exequiel Franco').equipoCivil === true && P.nomina.find((x) => x.nombre === 'Vizgarra Alfredo').sector === 'ilicitos' && P.nomina.find((x) => x.nombre === 'Pablo Pañol').sector === 'panol', 'equipoCivil, Ilícitos y Pañol quedan como estaban');
      c((P.respaldos || []).length === resp0 + 1 && P.respaldos[P.respaldos.length - 1].nomina.length === 20, 'respaldos[] con la de 20 (guardia v174)');
      c(+((await tabs(p)).find((x) => x.k === 'contratista').t.replace(/\D+/g, ' ').trim().split(' ').pop()) === 2, 'Contratista ahora dice 2');
      c((A.errores || []).filter((e) => !/permission|ERR_|Failed to fetch|aborted/i.test(e)).length === 0, 'sin errores de JS · ' + (A.errores || []).slice(0, 2).join(' | '));
      await A.browser.close(); browser = null;
    }
    // ================================================================= 1) cambiar sector + pasar los de equipo civil
    if (SOLO(1)) {
      const A = await sesion('admin'); const p = A.page;
      await irPersonal(p); await tab(p, 'todos');
      await p.evaluate(() => { const tr = [...document.querySelectorAll('#personalBody tr')].find((x) => x.querySelector('.per-nombre').value === 'Ivan Exequiel Pereyra'); const s = tr.querySelector('.per-sector'); s.value = 'civil'; s.dispatchEvent(new Event('change', { bubbles: true })); });
      await p.waitForTimeout(200);
      c(/Civil 3/.test((await tabs(p)).find((x) => x.k === 'civil').t), 'al cambiar el sector la cuenta de Civil sube a 3 (antes de guardar)');
      const r0 = (per(await db(p)).respaldos || []).length;
      await guardar(p);
      let P = per(await db(p));
      c(P.nomina.find((x) => x.nombre === 'Ivan Exequiel Pereyra').sector === 'civil', 'Ivan guardado en Civil');
      const ul = P.respaldos[P.respaldos.length - 1];
      c(P.respaldos.length === r0 + 1 && ul.nomina.find((x) => x.nombre === 'Ivan Exequiel Pereyra').sector === 'alumbrado', 'el respaldo tiene a Ivan en Alumbrado (cómo estaba)');
      await tab(p, 'civil');
      await p.click('[data-ps179p]'); await p.waitForTimeout(300);
      c(/¿Pasar 1 al sector Civil\?/.test(await tx(p, '#ps179Conf')) && /Víctor Exequiel Franco/.test(await tx(p, '#ps179Conf')), 'pregunta «¿Pasar 1 al sector Civil?» con Víctor');
      await cap(p, 'v179_pasar');
      await p.click('#ps179Conf [data-ps179c="no"]'); await p.waitForTimeout(300);
      c(per(await db(p)).nomina.find((x) => x.nombre === 'Víctor Exequiel Franco').sector === 'alumbrado', 'Cancelar no cambia nada');
      await p.click('[data-ps179p]'); await p.waitForTimeout(300); await p.click('#ps179Conf [data-ps179c="si"]');
      await esperar(p, () => /Guardado/.test((document.getElementById('ps179Msg') || {}).textContent || ''), null, 30);
      const d = await db(p); P = per(d);
      const vic = P.nomina.find((x) => x.nombre === 'Víctor Exequiel Franco');
      c(vic.sector === 'civil' && vic.equipoCivil === true && P.nomina.length === 20, '«Sí»: Víctor pasa a Civil (la marca queda) y siguen las 20');
      c(P.respaldos.length === r0 + 2, 'otra copia en respaldos[]');
      c(Object.values(d.auditoria || {}).some((x) => x.accion === 'personal_sector'), 'auditoría personal_sector');
      c(/pasó al sector Civil/.test(await tx(p, '#ps179Msg')) && !/Pasar los de equipo civil/.test(await tx(p, '#ps179')), 'mensaje y el botón ya no está (no queda nadie para pasar)');
      await A.browser.close(); browser = null;
    }
    // ================================================================= 2) gente sin tarea y orden sugerida
    if (SOLO(2)) {
      const A = await sesion('admin', null, { v145: true, sugerida: true }); const p = A.page;
      await esperar(p, () => !!window.__sinTarea && !!window.__personalCargado, null, 40);
      const r = await p.evaluate(() => { const f = window.__sinTarea.manana(); return { per: window.__sinTarea.personal().map((x) => x.nombre + (x.civil ? '*' : '')), sin: window.__sinTarea.sinTarea(f).map((x) => x.nombre), lib: window.__sugerida.armar(f).libres.map((x) => x.nombre + (x.civil ? '*' : '')) }; });
      const fuera = ['Carlos Tercero', 'Lucía Oficina', 'Roberto Dirección', 'Pablo Pañol'];
      c(fuera.every((x) => r.per.join('|').indexOf(x) < 0) && fuera.every((x) => r.sin.indexOf(x) < 0), 'gente sin tarea: sin Contratista, Oficina, Dirección ni Pañol · ' + r.per.length);
      c(r.per.indexOf('Ramón Paredes*') >= 0 && r.per.indexOf('Víctor Exequiel Franco*') >= 0 && r.per.indexOf('Vizgarra Alfredo') >= 0, 'Civil (como equipo civil), equipo civil de Alumbrado e Ilícitos sí');
      c(fuera.every((x) => r.lib.join('|').indexOf(x) < 0) && r.lib.indexOf('Ramón Paredes*') >= 0, 'orden sugerida: libres sin esos 4, Ramón como civil · ' + r.lib.length);
      await A.browser.close(); browser = null;
    }
    // ================================================================= 3) pañol y Llenar orden
    if (SOLO(3)) {
      const A = await sesion('admin', null, { ofPasos: true }); const p = A.page;
      await esperar(p, () => !!window.__personalCargado, null, 40);
      const s = await p.evaluate(() => ['Ramón Paredes', 'Carlos Tercero', 'Vizgarra Alfredo', 'Lucía Oficina', 'Mauricio Mainini'].map((n) => window.sectorDePersona(n)));
      c(s.join(',') === 'alumbrado,alumbrado,ilicitos,alumbrado,alumbrado', 'vale del pañol: Civil, Contratista, Oficina → Alumbrado; Ilícitos → Ilícitos · ' + s.join(','));
      await p.evaluate(() => mostrarVista('stock')); await p.waitForTimeout(400);
      await p.evaluate(() => { const b = document.querySelector('#subtabsStock .subtab[data-sub="sector"]'); b && b.click(); }); await p.waitForTimeout(800);
      const ps = await tx(p, '#cardStockSector');
      c(/Civil, Contratista, Oficina, Dirección y Pañol van como Alumbrado/.test(ps), '«Por sector» explica a dónde va cada sector');
      c(/Vales Alumbrado|Alumbrado/.test(ps) && /Ilícitos/.test(ps), '«Por sector» sigue con Alumbrado e Ilícitos');
      await cap(p, 'v179_porsector');
      await p.evaluate(() => { mostrarVista('parte'); }); await p.waitForTimeout(400);
      await p.evaluate(() => { const b = document.querySelector('#subtabsParte [data-sub="llenar"], .subtab[data-sub="llenar"]'); b && b.click(); }); await p.waitForTimeout(1500);
      const g = await tx(p, '#ofGenteRap');
      c(/Ramón Paredes · Oficial · Civil/.test(g) && /Lucía Oficina · Capataz · Oficina/.test(g) && /Vizgarra Alfredo · Chofer · Ilícitos/.test(g) && !/Mauricio Mainini · Oficial · Alumbrado/.test(g), 'Llenar orden: el sector al lado del nombre (no en Alumbrado) · ' + g.slice(0, 120));
      await A.browser.close(); browser = null;
    }
    // ================================================================= 4) asistente
    if (SOLO(4)) {
      const A = await sesion('lucia', null, { iaPro: true, inicio: true, v155: true, v175: true }); const p = A.page;
      let n = 0;
      const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v5-ia' } });
      const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v5-ia' } });
      const sw = { pedidos: [], cola: [] };
      await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } sw.pedidos.push(b); const f = sw.cola.shift() || fin('Listo.'); return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(f) }); });
      for (const r of ['/mio', '/uso', '/salud']) await p.route(W + r, (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30, gastoMes: 1, tope: 100, partes: {} }) }));
      const esperarIa = async () => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
      const decir = async (frase, guion) => { sw.cola.push(...guion); const n0 = sw.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(); await p.waitForTimeout(400); return sw.pedidos.slice(n0); };
      const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : Array.isArray(x) ? x.map((y) => (y && y.type === 'text' ? y.text : '')).join('') : JSON.stringify(x); };
      const tarjeta = () => tx(p, '#iaChat .ia-conf:last-of-type');
      const si = async () => { await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); const b = c && c.querySelector('[data-iasi]'); b && b.click(); }); for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (/Guardado|No se pudo|⚠/.test(await tarjeta())) break; } await p.waitForTimeout(300); };
      await esperar(p, () => typeof window.__asistenteAbrir === 'function', null, 80);
      await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(800);
      let ped = await decir('¿quiénes son de civil?', [usa('nomina', { sector: 'civil' }), fin('Son 2.')]);
      const tool = ((ped[0] || {}).tools || []).find((t) => t.name === 'nomina');
      c(tool && tool.input_schema && tool.input_schema.properties && tool.input_schema.properties.sector, 'la herramienta nomina tiene «sector»');
      let r = resultado(ped, 1);
      let pj = []; try { pj = JSON.parse(r).personas.map((x) => x.nombre); } catch (e) { }
      c(pj.length === 2 && pj.indexOf('Ramón Paredes') >= 0 && pj.indexOf('Víctor Exequiel Franco') >= 0 && /"porSector"/.test(r) && /"Oficina":1/.test(r), 'nomina sector:civil → Ramón y Víctor, con la cuenta por sector · ' + r.slice(-300));
      ped = await decir('sumá a Hugo Ledesma, oficial, de obra civil; y pasá a Carlos Tercero a pañol', [usa('proponer_personal', { altas: [{ nombre: 'Hugo Ledesma', rol: 'oficial', sector: 'obra civil' }], cambios: [{ persona: 'Carlos Tercero', sector: 'pañol' }] }), fin('Te armé la tarjeta.')]);
      const card = await tarjeta();
      c(/Hugo Ledesma/.test(card) && /Civil/.test(card) && /Pañol|panol/.test(card), 'tarjeta: Hugo en Civil y Carlos a Pañol · ' + card.slice(0, 200));
      await si();
      const P = per(await db(p));
      c(P.nomina.find((x) => x.nombre === 'Hugo Ledesma').sector === 'civil' && P.nomina.find((x) => x.nombre === 'Carlos Tercero').sector === 'panol', '«Sí»: Hugo civil, Carlos panol (por la guardia)');
      c((P.respaldos || []).length >= 1, 'con respaldo');
      ped = await decir('¿quiénes son de mantenimiento?', [usa('nomina', { sector: 'mantenimiento' }), fin('No hay.')]);
      c(/No conozco el sector/.test(resultado(ped, 1)), 'un sector que no existe → lo dice');
      await A.browser.close(); browser = null;
    }
    // ================================================================= 5) celular / oficina
    if (SOLO(5)) {
      const A = await sesion('lucia'); const p = A.page;
      await irPersonal(p); await tab(p, 'civil');
      c(!/Pasar los de equipo civil/.test(await tx(p, '#ps179')), 'Oficina no ve «Pasar los de equipo civil…» (solo Administración)');
      await tab(p, 'panol');
      const m = await p.evaluate(() => { const b = [...document.querySelectorAll('#ps179 .subtab')]; const t = document.querySelector('#ps179 .ps179-tabs'); return { min: Math.min(...b.map((x) => x.getBoundingClientRect().height)), w: t.getBoundingClientRect().right <= window.innerWidth + 1 }; }).catch(() => ({}));
      c(m.min >= 44, 'pestañas de 44 px o más · ' + m.min);
      c(await sinScroll(p), 'sin scroll de costado en la página');
      c(m.w, 'la fila de pestañas no se sale de la pantalla');
      await cap(p, 'v179_panol');
      await tab(p, 'todos'); await cap(p, 'v179_todos');
      await A.browser.close(); browser = null;
    }
    // ================================================================= 6) __v179No
    if (SOLO(6)) {
      const A = await sesion('admin', null, { v179: false, v145: true }); const p = A.page;
      await p.evaluate(() => { mostrarVista('produccion'); }); await p.waitForTimeout(300);
      await p.evaluate(() => { const s = document.querySelector('#subtabsProd [data-sub="personal"]'); s && s.click(); }); await p.waitForTimeout(1500);
      const o = await p.evaluate(() => ({ bar: !!document.getElementById('ps179'), opts: [...document.querySelector('#personalBody .per-sector').options].map((x) => x.value).join(','), sec: !!window.__sec179 }));
      c(!o.bar && !o.sec && o.opts === 'alumbrado,ilicitos', '__v179No: sin pestañas y el sector con Alumbrado / Ilícitos · ' + o.opts);
      const per2 = await p.evaluate(() => window.__sinTarea.personal().map((x) => x.nombre));
      c(per2.indexOf('Lucía Oficina') >= 0, '__v179No: la gente sin tarea como antes (no mira el sector)');
      await A.browser.close(); browser = null;
    }
  } catch (e) { c(false, 'ERROR ' + (e && e.stack || e)); }
  if (browser) await browser.close();
  c.fin ? c.fin() : null;
})();
