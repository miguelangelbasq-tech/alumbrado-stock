// v157 · El tiempo de CADA columna (no de toda la tarea). Juan (cuadrilla) en el celu; Lucía (oficina) en la compu.
//  0) el bug (con ANTES=1 contra la v156): por Modo obra la foto no deja hora (hay que tocar «Terminé» en cada columna y el fin
//     es la hora de ese toque, no la de la foto) y por Mis tareas clásica la hora se pide recién al mandar la tarea entera.
//     Sin ANTES: lo mismo, arreglado.
//  1) Modo obra: tableritos × 3 con fotos a las 08:52, 09:30 y 10:15 (llegó 08:10) → 42, 38 y 45 min; «✓ Col 1 lista · 42 min»
//     con «cambiar» (− / +); «Última: …»; al final «Así quedó cada columna» editable → «Listo, mandar».
//  2) Mis tareas clásica: las mismas 3 fotos → los mismos tiempos; «📤 Listo, enviar esta tarea» no pide horas (resumen).
//  3) «▶ Empecé Col 2» manda; «✓ Col 3 lista sin foto».
//  4) sin señal: la hora es la de la foto y sube después igual.
//  5) 3 fotos juntas → «hora dudosa» (y la anterior también); sin «Llegué» → dudosa; la verificación lo marca.
//  6) izaje × 3 por Modo obra; zanja en metros: un solo tramo como antes.
//  7) la oficina: «📸 Avance» y cierre («Col 1 · 08:10–08:52 · 42 min · Juan y Pedro»), 🧠 › ⏱ Minutos por columna, la orden
//     sugerida usa lo medido por columna (≥ 3 buenas), la orden vieja con la hora de toda la tarea cuenta como un tramo, el
//     asistente (tiempos_por_unidad).
const { abrir, prueba } = require('./h');
const { datos157 } = require('./datos157');
const cel = process.argv[2] === 'cel';
const ANTES = !!process.env.ANTES;
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
const FOTO = __dirname + '/foto.jpg';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v157' + (cel ? ' cel' : '') + (ANTES ? ' ANTES' : ''));
  const MOD = { crew: true, nav: true, mtNuevo: true, tarjetas: true, ofPasos: true, porPartes: true, https: true, inicio: true, sugerida: true, iaPro: true, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: !ANTES, reglas: !!process.env.REGLAS, antes: () => { window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; window.__aaPausa = true; } };
  let browser = null;
  const sesion = async (quien, op, dop) => {
    const A = await abrir(Object.assign({ sesion: quien, datos: datos157(dop || {}), browser, espera: 4500 }, MOD, { cel: quien === 'lucia' ? cel && false : true }, op || {})); browser = A.browser;
    A.page.on('dialog', (x) => { (A.dlg = A.dlg || []).push(x.message()); x.accept(); });
    await A.ctx.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }));
    await A.page.waitForTimeout(1000); return A;
  };
  const foto = async (p, nombre) => { if (!CAP) return; await p.waitForTimeout(350); await p.screenshot({ path: CAP + '/' + nombre + '.png' }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso/i.test(e));
  const hoyDe = (p) => p.evaluate(() => fechaAISO(new Date()));
  const reloj = (p, hoy, hm) => p.evaluate(([d, h]) => { window.__tcAhora = () => new Date(d + 'T' + h + (h.length === 5 ? ':00' : '')).getTime(); }, [hoy, hm]);
  const pasosDe = (p, k, db) => p.evaluate(([k, db]) => { const o = db ? window.__stubDB().ordenesTrabajo.ot157 : ordenesTrabajo.find((x) => x.id === 'ot157'); const P = ((o.campo || {}).pasosObra || {})[k] || {}; return Object.keys(P).map((q) => P[q]).filter((x) => x.estado === 'si').sort((a, b) => (a.finTs || 0) - (b.finTs || 0)).map((x) => ({ num: x.num, ini: x.ini, fin: x.fin, min: x.min, dudosa: !!x.dudosa, mot: x.dudosaMot || '', fuente: x.fuente, iniF: x.iniFuente })); }, [k, !!db]);
  const campoDe = (p, db) => p.evaluate((db) => { const o = db ? window.__stubDB().ordenesTrabajo.ot157 : ordenesTrabajo.find((x) => x.id === 'ot157'); return o.campo || {}; }, !!db);
  const tx = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  // Modo obra: tocar el botón (abre la cámara de la app: se cierra) y la foto entra por el «📷» de Modo obra, como en t_v142
  const fotoObra = async (p) => {
    await p.click('#cdApp [data-cd="boton"]'); await p.waitForTimeout(600);
    await p.evaluate(() => { const b = document.querySelector('#emaCam [data-ec="cerrar"]'); b && b.click(); }); await p.waitForTimeout(250);
    await p.setInputFiles('#cdFotoIn', FOTO);
    await p.waitForFunction(() => /Foto guardada/.test((document.getElementById('cdHoja') || {}).textContent || ''), null, { timeout: 15000 }).catch(() => { });
    await p.waitForTimeout(400);
  };
  const cerrarHoja = async (p) => { await p.evaluate(() => { const b = document.querySelector('#cdHoja [data-cdh="x"]'); b && b.click(); }); await p.waitForTimeout(500); };
  const modoObra = async (p) => { await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(600); await p.evaluate(() => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(800); };
  const T = (k) => `.mt-ot[data-ot="ot157"] .mt-tarea[data-k="${k}"]`;
  const misTareas = async (p, k) => {
    await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(1500);
    if (!(await p.$(T(k)))) { await p.click('.mt-item[data-mtabrir="ot157"]').catch(() => { }); await p.waitForTimeout(900); }
    await p.click(`${T(k)} [data-m="si"]`).catch(() => { }); await p.waitForTimeout(700);
  };
  const fotoClasica = async (p, k, num) => {
    const ok = await p.evaluate(([s, n]) => { const x = [...document.querySelectorAll(s + ' input.mt-foto-t')].find((y) => y.dataset.fln === n); if (!x) return false; x.id = 'tcIn'; return true; }, [T(k), num]);
    if (ok) { await p.setInputFiles('#tcIn', FOTO); await p.waitForTimeout(1600); await p.evaluate(() => { const x = document.getElementById('tcIn'); x && x.removeAttribute('id'); }); }
    return ok;
  };

  // ================================================================= 0) el bug (ANTES) / arreglado
  if (SOLO('0')) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await modoObra(p); await reloj(p, hoy, '08:52'); await fotoObra(p);
    let ps = await pasosDe(p, 'conexionado_tablerito'), hoja = await tx(p, '#cdHoja');
    await cerrarHoja(p);
    const btn = await tx(p, '#cdApp [data-cd="boton"]');
    if (ANTES) {
      c(!ps.length && /Terminé/.test(btn), 'ANTES (Modo obra): la foto de la Col 1 NO deja hora; hay que tocar «Terminé» en cada columna · pasos ' + ps.length + ' · botón «' + btn + '»');
      await p.click('#cdApp [data-cd="boton"]'); await p.waitForTimeout(600);
      const h = await tx(p, '#cdHoja');
      const ahora = await p.evaluate(() => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); });
      c(/¿A qué hora la hiciste\?/.test(h) && !/Terminó\s*08:52/.test(h), 'ANTES (Modo obra): «Terminé» pide la hora y el fin sale de la hora del toque (' + ahora + ', o el inicio + 30 min), no de la foto (08:52) · ' + h.slice(0, 120));
      await cerrarHoja(p);
    } else {
      c(ps.length === 1 && ps[0].num === 'Col 1' && ps[0].ini === '08:10' && ps[0].fin === '08:52' && ps[0].min === 42 && /Col 1 lista · 42 min/.test(hoja), 'Modo obra: la foto de la Col 1 ya deja su hora (08:10–08:52 · 42 min) y la hoja dice «✓ Col 1 lista · 42 min» · ' + JSON.stringify(ps) + ' · ' + hoja.slice(0, 120));
      c(/Foto/.test(btn), 'Modo obra: sin «Terminé» por columna: el botón ya pide la foto de la Col 2 · «' + btn + '»');
    }
    // Mis tareas clásica (otra orden limpia)
    const B = await sesion('juan', {}, { limpio: false }); const q = B.page;
    await q.evaluate(() => { const o = ordenesTrabajo.find((x) => x.id === 'ot157'); }); await misTareas(q, 'conexionado_tablerito');
    for (const [n, hm] of [['Col 1', '08:52'], ['Col 2', '09:30'], ['Col 3', '10:15']]) { await reloj(q, hoy, hm); await fotoClasica(q, 'conexionado_tablerito', n); }
    ps = await pasosDe(q, 'conexionado_tablerito');
    await q.click(`${T('conexionado_tablerito')} [data-et="si"]`).catch(() => { }); await q.waitForTimeout(700);
    const et = await q.evaluate(() => { const i = document.getElementById('etIni'); return { hay: !!document.getElementById('etPop'), visibles: !!(i && i.offsetParent), tx: ((document.getElementById('etPop') || {}).textContent || '').replace(/\s+/g, ' ') }; });
    if (ANTES) c(!ps.length && et.hay && et.visibles && /¿De qué hora a qué hora\?/.test(et.tx), 'ANTES (Mis tareas clásica): las fotos de las 3 columnas no dejan hora y recién al mandar la tarea pide «¿De qué hora a qué hora?» de TODA la tarea · pasos ' + ps.length);
    else c(ps.map((x) => x.min).join() === '42,38,45' && et.hay && !et.visibles && /Col 1 · 08:10–08:52 · 42 min/.test(et.tx) && /Col 3 · 09:30–10:15 · 45 min/.test(et.tx), 'Mis tareas clásica: cada foto deja la hora de su columna (42, 38, 45) y al mandar no pide horas: muestra cada columna · ' + JSON.stringify(ps.map((x) => x.min)) + ' · ' + et.tx.slice(0, 160));
    c(!errsJs(A).length && !errsJs(B).length, 'sin errores de JS · ' + errsJs(A).concat(errsJs(B)).join(' | ').slice(0, 200));
    await A.ctx.close(); await B.ctx.close();
  }
  if (ANTES) { await browser.close(); return c.fin ? c.fin() : null; }

  // ================================================================= 1) Modo obra × 3
  if (SOLO('1')) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await modoObra(p);
    let r = await tx(p, '#cdApp .tc-obra');
    c(/▶ Empecé Col 1/.test(r) && /Col 1 lista sin foto/.test(r), 'Modo obra: debajo del botón «▶ Empecé Col 1» (opcional) y «✓ Col 1 lista sin foto» · ' + r);
    const vistos = [];
    for (const hm of ['08:52', '09:30', '10:15']) {
      await reloj(p, hoy, hm); await fotoObra(p);
      vistos.push(await tx(p, '#cdHoja .tc-linea'));
      if (hm === '08:52') await foto(p, 'col_lista_cel');
      if (hm === '09:30') {   // «cambiar»: − / + de 5 min (sin teclado)
        await p.click('#cdHoja .tc-linea [data-tc="cambiar"]'); await p.waitForTimeout(200);
        await p.click('#cdHoja .tc-linea [data-tc="+"]'); await p.waitForTimeout(300);
        const l = await tx(p, '#cdHoja .tc-linea'); const x = (await pasosDe(p, 'conexionado_tablerito'))[1];
        c(/43 min/.test(l) && x.min === 43 && x.ini === '08:47' && x.iniF === 'manual', '«cambiar» → +5: la Col 2 queda 43 min (empezó 08:47, corregido a mano) · ' + l + ' · ' + JSON.stringify(x));
        await p.click('#cdHoja .tc-linea [data-tc="-"]'); await p.waitForTimeout(300);
      }
      await cerrarHoja(p);
    }
    c(/Col 1 lista · 42 min/.test(vistos[0]) && /Col 2 lista · 38 min/.test(vistos[1]) && /Col 3 lista · 45 min/.test(vistos[2]), 'cada foto: «✓ Col N lista · N min» (42, 38, 45) · ' + vistos.join(' | '));
    let ps = await pasosDe(p, 'conexionado_tablerito');
    c(ps.map((x) => x.num + ' ' + x.ini + '–' + x.fin + ' ' + x.min).join(', ') === 'Col 1 08:10–08:52 42, Col 2 08:52–09:30 38, Col 3 09:30–10:15 45', '3 columnas, 3 horarios en campo.pasosObra · ' + JSON.stringify(ps));
    let cp = await campoDe(p);
    c(cp.horasTarea && cp.horasTarea.conexionado_tablerito.ini === '08:10' && cp.horasTarea.conexionado_tablerito.fin === '10:15' && cp.horasTarea.conexionado_tablerito.deCols === 3, 'la tarea en campo.horasTarea = el rango de sus columnas (08:10 a 10:15) · ' + JSON.stringify(cp.horasTarea));
    c(cp.marcas && cp.marcas.conexionado_tablerito && cp.marcas.conexionado_tablerito.cant === 3, 'la oficina ve el avance columna por columna (marca con 3 hechas) · ' + JSON.stringify(cp.marcas));
    r = await tx(p, '#cdApp .tc-obra'); const b = await tx(p, '#cdApp [data-cd="boton"]');
    c(/Última: Col 3 · 45 min/.test(r) && /Terminé/.test(b), 'al final «Última: Col 3 · 45 min» y el botón «Terminé» · ' + r);
    await p.click('#cdApp [data-cd="boton"]'); await p.waitForTimeout(700);
    r = await tx(p, '#cdHoja');
    c(/Así quedó cada/.test(r) && /Col 1 · 08:10–08:52 · 42 min/.test(r) && /Col 2 · 08:52–09:30 · 38 min/.test(r) && /Col 3 · 09:30–10:15 · 45 min/.test(r) && /Total: 2 h 05 min/.test(r) && !/¿A qué hora la hiciste/.test(r), '«Terminé»: resumen de las columnas con sus minutos y el total (no pide horas de toda la tarea) · ' + r.slice(0, 260));
    const sinX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    c(sinX <= 0, 'sin scroll de costado · ' + sinX);
    await foto(p, 'termine_columnas_cel');
    await p.click('#cdHoja .tc-fila [data-tc="-"]'); await p.waitForTimeout(300);
    r = await tx(p, '#cdHoja .tc-tot');
    c(/Total: 2 h \(de 08:15/.test(r), 'el resumen es editable (− en la Col 1 → total 2 h, de 08:15) · ' + r);
    await p.click('#cdHoja [data-cdh="colsOk"]'); await p.waitForTimeout(1500);
    cp = await campoDe(p, true);
    c(cp.tareaEnv && cp.tareaEnv.conexionado_tablerito && cp.enviados && Object.keys(cp.enviados).length === 1 && cp.marcas.conexionado_tablerito.hecho && cp.marcas.conexionado_tablerito.cant === 3 && cp.pasosObra.conexionado_tablerito['col 1'].min === 37, '«Listo, mandar»: la tarea va a la oficina (3 hechas) y la orden se envía sola; los minutos corregidos quedan en la base · ' + JSON.stringify({ te: cp.tareaEnv, env: Object.keys(cp.enviados || {}), c1: cp.pasosObra.conexionado_tablerito['col 1'].min }));
    c(!errsJs(A).length, 'sin errores de JS · ' + errsJs(A).join(' | ').slice(0, 200));
    await A.ctx.close();
  }

  // ================================================================= 2) Mis tareas clásica × 3
  if (SOLO('2')) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await misTareas(p, 'conexionado_tablerito');
    const av = [];
    for (const [n, hm] of [['Col 1', '08:52'], ['Col 2', '09:30'], ['Col 3', '10:15']]) { await reloj(p, hoy, hm); await fotoClasica(p, 'conexionado_tablerito', n); av.push(await tx(p, '#tcAviso')); if (n === 'Col 1') await foto(p, 'clasica_aviso_cel'); }
    c(/Col 1 lista · 42 min/.test(av[0]) && /Col 2 lista · 38 min/.test(av[1]) && /Col 3 lista · 45 min/.test(av[2]), 'Mis tareas clásica: con cada foto, el cartelito «✓ Col N lista · N min» · ' + av.join(' | '));
    const role = await p.evaluate(() => (document.querySelector('#tcAviso .tc-linea') || {}).getAttribute && document.querySelector('#tcAviso .tc-linea').getAttribute('role'));
    c(role === 'status', 'el cartelito es role=status (no tapa la barra de abajo) · ' + role);
    await p.click('#tcAviso [data-tc="cambiar"]'); await p.waitForTimeout(200); await p.click('#tcAviso [data-tc="-"]'); await p.waitForTimeout(300);
    let ps = await pasosDe(p, 'conexionado_tablerito');
    c(ps.map((x) => x.min).join() === '42,38,40', 'el mismo dato que Modo obra; «cambiar» − en la Col 3 → 40 min · ' + JSON.stringify(ps.map((x) => x.num + ' ' + x.min)));
    await p.click(`${T('conexionado_tablerito')} [data-et="si"]`).catch(() => { }); await p.waitForTimeout(700);
    await foto(p, 'clasica_enviar_cel');
    const et = await tx(p, '#etPop');
    c(/Col 3 · 09:35–10:15 · 40 min/.test(et) && /Total: 2 h \(de 08:10/.test(et), '«📤 Listo, enviar esta tarea»: muestra cada columna (sin pedir horas) · ' + et.slice(0, 200));
    await p.click('#etPop [data-etp="enviar"]'); await p.waitForTimeout(2500);
    const cp = await campoDe(p, true);
    c(cp.horasTarea.conexionado_tablerito.ini === '08:10' && cp.horasTarea.conexionado_tablerito.fin === '10:15' && cp.tareaEnv && cp.tareaEnv.conexionado_tablerito && Object.keys(cp.pasosObra.conexionado_tablerito).length === 3, 'al mandar: la tarea con el rango de sus columnas (08:10 a 10:15) y las 3 columnas con su hora en la base · ' + JSON.stringify(cp.horasTarea));
    c(!errsJs(A).length, 'sin errores de JS · ' + errsJs(A).join(' | ').slice(0, 200));
    await A.ctx.close();
  }

  // ================================================================= 3) «▶ Empecé» manda · «Lista» sin foto
  if (SOLO('3')) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await modoObra(p);
    await reloj(p, hoy, '08:52'); await fotoObra(p); await cerrarHoja(p);
    await reloj(p, hoy, '08:58'); await p.click('#cdApp [data-cd="tcEmpece"]'); await p.waitForTimeout(500);
    let r = await tx(p, '#cdApp .tc-obra');
    c(/Empezaste Col 2 a las 08:58/.test(r), '«▶ Empecé Col 2» queda anotado · ' + r);
    await reloj(p, hoy, '09:30'); await fotoObra(p); await cerrarHoja(p);
    await reloj(p, hoy, '10:00'); await p.click('#cdApp [data-cd="tcLista"]'); await p.waitForTimeout(700);
    const ps = await pasosDe(p, 'conexionado_tablerito');
    c(ps[1] && ps[1].min === 32 && ps[1].ini === '08:58' && ps[1].iniF === 'empece', '«Empecé» manda: la Col 2 es 08:58–09:30 = 32 min (no 38) · ' + JSON.stringify(ps[1]));
    c(ps[2] && ps[2].fuente === 'lista' && ps[2].min === 30 && /Col 3 lista · 30 min/.test(await tx(p, '#tcAviso')), '«✓ Col 3 lista sin foto»: fin 10:00, 30 min, con el cartelito · ' + JSON.stringify(ps[2]));
    c(!errsJs(A).length, 'sin errores de JS · ' + errsJs(A).join(' | ').slice(0, 200));
    await A.ctx.close();
  }

  // ================================================================= 4) sin señal
  if (SOLO('4')) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await modoObra(p);
    await p.evaluate(() => { window.__stubSinRed = true; });
    await reloj(p, hoy, '08:52'); await fotoObra(p); await cerrarHoja(p);
    await reloj(p, hoy, '09:30'); await fotoObra(p); await cerrarHoja(p);
    const loc = await pasosDe(p, 'conexionado_tablerito'), base0 = await pasosDe(p, 'conexionado_tablerito', true);
    c(loc.map((x) => x.min).join() === '42,38' && !base0.length, 'sin señal: las columnas quedan en el celu con la hora de la foto (42, 38) y todavía no en la base · celu ' + JSON.stringify(loc.map((x) => x.min)) + ' · base ' + base0.length);
    await p.evaluate(() => { window.__stubSinRed = false; try { window.__campoCola && window.__campoCola.ya && window.__campoCola.ya(); } catch (e) { } window.dispatchEvent(new Event('online')); });
    await reloj(p, hoy, '13:00');
    let base = [];
    for (let i = 0; i < 30 && base.length < 2; i++) { await p.waitForTimeout(600); base = await pasosDe(p, 'conexionado_tablerito', true); }
    c(base.map((x) => x.fin + ' ' + x.min).join() === '08:52 42,09:30 38', 'vuelve la señal: suben con la hora real del celu (08:52 y 09:30), no la de cuando subió · ' + JSON.stringify(base));
    await A.ctx.close();
  }

  // ================================================================= 5) fotos juntas → dudosa · sin «Llegué»
  if (SOLO('5')) {
    const A = await sesion('juan'); const p = A.page, hoy = await hoyDe(p);
    await modoObra(p);
    for (const hm of ['10:15:00', '10:15:30', '10:16:10']) { await reloj(p, hoy, hm); await fotoObra(p); if (hm === '10:15:30') await foto(p, 'dudosa_cel'); await cerrarHoja(p); }
    const ps = await pasosDe(p, 'conexionado_tablerito');
    c(ps.length === 3 && ps.every((x) => x.dudosa) && /fotos seguidas/.test(ps[1].mot) && /puede tener el tiempo de varias/.test(ps[0].mot), '3 fotos juntas al final: las 3 quedan «hora dudosa» con el porqué (la 1.ª tiene el tiempo de varias) · ' + JSON.stringify(ps.map((x) => x.num + ' ' + x.min + ' ' + x.mot)));
    const v = await p.evaluate(() => { const o = ordenesTrabajo.find((x) => x.id === 'ot157'); const V = window.__verifOt && window.__verifOt.verifTarea ? window.__verifOt.verifTarea(o, 'conexionado_tablerito') : null; return V ? JSON.stringify(V.dudas || V.duda || V.texto || V) : ''; });
    c(/hora dudosa/.test(v), 'la verificación (v150) lo marca como duda · ' + v.slice(0, 200));
    await A.ctx.close();
    const B = await sesion('juan', {}, { sinLlegue: true }); const q = B.page;
    await q.evaluate(() => mostrarVista('mistareas')); await q.waitForTimeout(1200);
    await misTareas(q, 'conexionado_tablerito'); await reloj(q, hoy, '08:52'); await fotoClasica(q, 'conexionado_tablerito', 'Col 1');
    const p2 = await pasosDe(q, 'conexionado_tablerito');
    c(p2[0] && p2[0].dudosa && /sin «Llegué»/.test(p2[0].mot) && p2[0].ini === '07:30', 'sin «Llegué» ni columna anterior: se cuenta desde la hora de la orden y lo dice (dudosa, no se inventa) · ' + JSON.stringify(p2[0]));
    await B.ctx.close();
  }

  // ================================================================= 6) izaje × 3 · zanja en metros
  if (SOLO('6')) {
    const A = await sesion('juan', {}, { izaje: true }); const p = A.page, hoy = await hoyDe(p);
    await modoObra(p);
    for (const hm of ['09:00', '09:35', '10:20']) { await reloj(p, hoy, hm); await fotoObra(p); await cerrarHoja(p); }
    const ps = await pasosDe(p, 'montaje_prfv');
    c(ps.map((x) => x.min).join() === '50,35,45', 'izaje × 3 por Modo obra: 3 tiempos (50, 35, 45) · ' + JSON.stringify(ps.map((x) => x.num + ' ' + x.min)));
    await A.ctx.close();
    const B = await sesion('juan', {}, { zanja: true }); const q = B.page;
    await modoObra(q); await reloj(q, hoy, '09:00');
    let b = await tx(q, '#cdApp [data-cd="boton"]');
    const ob = await tx(q, '#cdApp .tc-obra');
    for (let i = 0; i < 6 && /Foto/.test(b); i++) { await fotoObra(q); await cerrarHoja(q); b = await tx(q, '#cdApp [data-cd="boton"]'); }   // las tomas de la zanja
    const p2 = await pasosDe(q, 'zanjeo');
    await q.click('#cdApp [data-cd="boton"]'); await q.waitForTimeout(600);
    const h = await tx(q, '#cdHoja');
    c(!p2.length && !ob && /¿A qué hora la hiciste\?/.test(h), 'zanja en metros: un solo tramo como antes (sin columnas, «Terminé» pide la hora de la tarea) · ' + h.slice(0, 100));
    await B.ctx.close();
  }

  // ================================================================= 7) la oficina, 🧠, la orden sugerida y el asistente
  if (SOLO('7')) {
    const A = await sesion('lucia', { cel }, { viejas: true }); const p = A.page;
    await p.waitForTimeout(2500);
    // la orden de hoy con las 3 columnas (como la dejó Juan)
    await p.evaluate(() => { const o = ordenesTrabajo.find((x) => x.id === 'ot157'); const h = o.fecha, t = (x) => new Date(h + 'T' + x + ':00').getTime(); const mk = (n, a, b, m, du) => ({ num: n, ini: a, fin: b, iniTs: t(a), finTs: t(b), min: m, estado: 'si', por: 'Juan Pérez', ts: t(b), fuente: 'foto', iniFuente: 'anterior', n: 1, v: 157, dudosa: !!du, dudosaMot: du || '' }); o.campo = Object.assign({}, o.campo, { pasosObra: { conexionado_tablerito: { 'col 1': mk('Col 1', '08:10', '08:52', 42), 'col 2': mk('Col 2', '08:52', '09:30', 38), 'col 3': mk('Col 3', '09:30', '10:15', 45) } }, horasTarea: { conexionado_tablerito: { ini: '08:10', fin: '10:15' } }, enviados: { 'Juan Pérez': { ts: Date.now() } }, tareaEnv: { conexionado_tablerito: { 'Juan Pérez': { estado: 'si', ts: Date.now() } } }, marcas: { conexionado_tablerito: { hecho: true, cant: 3 } } }); o.estado = 'En curso'; });
    let r = await p.evaluate(() => (window.__cdOficinaHtml(ordenesTrabajo.find((x) => x.id === 'ot157')) || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
    c(/Tiempo de cada columna/.test(r) && /Col 1 · 08:10–08:52 · 42 min · Juan y Pedro/.test(r) && /Col 3 · 09:30–10:15 · 45 min · Juan y Pedro/.test(r) && /mediana 42 min/.test(r), '«📸 Avance»: «Col 1 · 08:10–08:52 · 42 min · Juan y Pedro»… con la mediana · ' + r.slice(0, 300));
    await p.evaluate(() => window.abrirCierreOt('ot157')); await p.waitForTimeout(1500);
    r = await tx(p, '#cierreCuerpo .tc-of');
    c(/Col 2 · 08:52–09:30 · 38 min · Juan y Pedro/.test(r), 'en el cierre también · ' + r.slice(0, 200));
    await p.evaluate(() => { const x = document.querySelector('#cierreCuerpo .tc-of'); x && x.scrollIntoView({ block: 'center' }); }); await foto(p, 'oficina_cierre_' + (cel ? 'cel' : 'pc'));
    await p.evaluate(() => { try { cerrarCuadroCierre(); } catch (e) { } }); await p.waitForTimeout(500);
    // la orden vieja con la hora de toda la tarea: un tramo
    r = await p.evaluate(() => JSON.stringify(window.__tiempoCol.tramos(ordenesTrabajo.find((x) => x.id === 'otv4'), 'conexionado_tablerito')));
    c(/"tarea":true/.test(r) && /"min":120/.test(r), 'orden vieja con la hora de toda la tarea: sigue andando como un tramo (08:00 a 10:00) · ' + r);
    // promedios
    const E = await p.evaluate(() => window.__tiempoCol.deTarea('conexionado_tablerito'));
    c(E.n === 10 && E.dudosas === 1 && E.mediana === 41 && E.minimo === 30 && E.maximo === 50, 'minutos por columna del tablerito: 10 mediciones buenas, 1 dudosa aparte, mediana 41 min, rango 30 a 50 · ' + JSON.stringify({ n: E.n, du: E.dudosas, med: E.mediana, min: E.minimo, max: E.maximo }));
    c(E.porCuadrilla[0].quien === 'Diego, Lucas' && E.porCuadrilla[0].mediana === 32, 'por cuadrilla: Diego y Lucas más rápidos (32 min) · ' + JSON.stringify(E.porCuadrilla));
    await p.evaluate(() => window.__sugerida.abrirAprende('tiempos')); await p.waitForTimeout(1000);
    r = await tx(p, '#apOv');
    c(/Minutos por columna/.test(r) && /Conexionado del tablerito/.test(r) && /41 min/.test(r) && /30 min a 50 min/.test(r), '🧠 › ⏱ Tiempos: «Minutos por columna» con la mediana y el rango · ' + r.slice(0, 260));
    await foto(p, 'aprende_' + (cel ? 'cel' : 'pc'));
    const rd = await p.evaluate(() => { const C = (window.__sugerida && window.__sugerida.probarCfg) ? null : null; const x = window.__sugerida.rend('conexionado_tablerito'); return x ? { fuente: x.fuente, txt: x.txt, porHH: x.porHH } : null; });
    c(rd && rd.fuente === 'medido' && /columnas medidas/.test(rd.txt) && Math.abs(rd.porHH - 60 / 82) < 0.02, 'la orden sugerida usa lo medido por columna (mediana 41 min × 2 personas → ' + (60 / 82).toFixed(3) + ' por HH) · ' + JSON.stringify(rd));
    await p.evaluate(() => { const o = document.getElementById('apOv'); o && (o.hidden = true); });
    // el asistente
    let n = 0; const sw = { pedidos: [], cola: [] };
    const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 40 }, ema: { costoUsd: 0.01, version: 'v5-ia' } });
    const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v5-ia' } });
    await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } sw.pedidos.push(b); const x = sw.cola.shift(); return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(x || fin('Listo.')) }); });
    for (const u of ['/mio', '/uso', '/salud']) await p.route(W + u, (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', habilitado: true, quedanPreguntas: 30, topePreguntas: 30, gastoMes: 1, tope: 100, partes: {} }) }));
    await p.evaluate(() => window.__asistenteAbrir && window.__asistenteAbrir()); await p.waitForTimeout(2500);
    sw.cola.push(usa('tiempos_por_unidad', { tarea: 'tablerito' }), fin('El tablerito lleva 41 min por columna.'));
    await p.fill('#iaTxt', '¿cuánto tardan en hacer un tablerito?'); await p.click('#iaEnviar');
    for (let i = 0; i < 60 && sw.pedidos.length < 2; i++) await p.waitForTimeout(200);
    await p.waitForTimeout(500);
    const herr = ((sw.pedidos[0] || {}).tools || []).map((t) => t.name);
    const m = (sw.pedidos[1] || {}).messages || [], u = m[m.length - 1] || {}, tr = (u.content || []).find((x) => x.type === 'tool_result');
    const res = tr ? (typeof tr.content === 'string' ? tr.content : JSON.stringify(tr.content)) : '';
    c(herr.indexOf('tiempos_por_unidad') >= 0 && /medianaMin.{0,4}41/.test(res) && /dudosasAparte.{0,4}1/.test(res) && /mediciones.{0,4}10/.test(res), 'el asistente: «¿cuánto tardan en hacer un tablerito?» → tiempos_por_unidad (mediana 41 min, 10 mediciones, 1 dudosa aparte) · ' + res.slice(0, 220));
    const sis = JSON.stringify((sw.pedidos[0] || {}).system || '');
    c(/TIEMPOS \(v157\)/.test(sis), 'SISTEMA: «TIEMPOS (v157)…»');
    c(!errsJs(A).length, 'sin errores de JS · ' + errsJs(A).join(' | ').slice(0, 200));
    await A.ctx.close();
  }
  await browser.close();
  c.fin();
})();
