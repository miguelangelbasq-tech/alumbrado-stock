// v186 · El Inicio nuevo (opción A + mapa y plazas de hoy juntos, de la B), Órdenes › «🗓 Mañana», «📋 Itemizado» y «📅 Gantt».
//  0) admin: #ini186 (contador, «Para atender» en una línea que se despliega, «Dónde trabajamos hoy» con el mapa y las plazas
//     numeradas, el avance del contrato por rubro / por plaza); sin el número del día, la sugerida ni las demás tarjetas; «Ver
//     todos los indicadores» abre la pantalla de antes en una hoja (con la sugerida, el Supervisor, la curva S…); sin scroll de
//     costado; botones de 44 px.
//  1) el contador con la hora de mentira: con el acta cargada (108 días 13 h 17 min; los segundos solo en la compu; «Termina el
//     martes 09/03/2027 · van 11 de 120 días»), sin el acta («fecha estimada» + el botón de Administración que lleva a «Nuestra
//     zona», cargarla y que cuente desde ahí); la oficina no tiene el botón.
//  2) las plazas de hoy: antes → ahora (lo que mandó la cuadrilla) y, al cerrar la orden, sube el «ahora» y no el «antes»;
//     el mismo número en el pin del mapa y en la fila; tocar la fila lleva al avance de la obra.
//  3) Órdenes › «🗓 Mañana»: la orden sugerida (ya no en el Inicio), «Revisar y emitir» → la hoja → «Emitir» → la base.
//  4) 📋 Itemizado: menú, «Todas · nuestra zona» con «Nuestra zona», una obra con contratado / hecho / falta; cambiar lo
//     contratado sin motivo no deja, con motivo sí (la base, avanceHist, la nota en la fila); Dirección mira sin ✎.
//  5) 📅 Gantt: fechas de la obra y de un rubro con «Sí» (planGantt con g186, lo de antes se conserva, la «prevista» de
//     Dirección y el plan del contador las leen); «Repartir» muestra la propuesta sin escribir nada y con «Sí» las pone.
//  6) roles: oficina igual que admin; Dirección el mismo Inicio sin botones que cambien nada; pañol, cuadrilla y «solo mirar»
//     sin cambios (mirar ve el Itemizado y el Gantt en el menú, sin editar); con __v186No todo como la v185.
const { abrir, prueba } = require('./h');
const { datos155 } = require('./datos155');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
(async () => {
  const c = prueba('v186' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, v163: true, v165: true, v186: true, ofPasos: true, sugerida: true, inicio: true, nav: true, iaPro: true, leaflet: true, https: true, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; } };
  let browser = null;
  const sesion = async (quien, op, datos) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos || datos155(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(2500); await A.page.evaluate(() => { const a = document.getElementById('avisoApp'); if (a) a.style.display = 'none'; }); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, full) => { if (!CAP) return; await p.waitForTimeout(400); await p.evaluate(() => { const a = document.getElementById('avisoApp'); if (a) a.style.display = 'none'; }); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png', fullPage: !!full }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso|tile|open-meteo/i.test(e));
  const ver = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }, s);
  const alInicio = async (p) => { await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(900); };
  const chicos = (p, sel) => p.evaluate((sel) => [...document.querySelectorAll(sel)].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 43.5 && !b.closest('.leaflet-container'); }).map((b) => (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 30)), sel);
  const ini = (p) => p.evaluate(() => {
    const r = document.getElementById('ini186'), v = (s) => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().height > 0; };
    return { on: window.__ini186.on(), vis: !!r && r.offsetHeight > 0, dirVis: v('#viewInicio > #iniDir'), eje: v('#iniEje'), cd: [...document.querySelectorAll('#i186Cd b')].map((b) => b.textContent), seg: !!document.querySelector('#i186Cd [data-cd="s"]'),
      hero: (document.getElementById('i186Hero') || {}).innerText || '', at: (document.querySelector('#ini186 .i6-at') || {}).innerText || '', mapa: v('#i186Mapa'), filas: [...document.querySelectorAll('#i186HoyL .i6-pl')].map((e) => e.innerText.replace(/\s+/g, ' ')),
      iz: (document.getElementById('i186Iz') || {}).innerText || '', sug: v('#ini186 .sg-ini') || v('#ini186 [data-sg]'), ndia: v('#ini186 .dr-ndia'), todos: v('#ini186 [data-i186="todos"]'), acta: v('#ini186 [data-i186="acta"]'), logo: (document.querySelector('#ini186 .i6-logo small') || {}).textContent || '' };
  });

  // ================================================================= 0) admin: las partes del Inicio nuevo
  if (SOLO('0')) {
    const A = await sesion('admin'); const p = A.page;
    let r = await ini(p);
    c(r.on && r.vis && !r.dirVis && !r.eje, 'admin abre la app en el Inicio nuevo (#ini186), sin la pantalla de Dirección ni el Ejecutivo · ' + JSON.stringify({ on: r.on, vis: r.vis, dir: r.dirVis }));
    c(r.cd.length === (cel ? 3 : 4) && r.seg === !cel && /Faltan para terminar/i.test(r.hero) && /Termina el/.test(r.hero) && /van \d+ días de \d+ días/.test(r.hero), 'arriba el contador (días · horas · min' + (cel ? ', sin segundos en el celu' : ' · seg en la compu') + '), «Termina el…» y «van N de M días» · ' + JSON.stringify(r.cd));
    c(/Tiempo/.test(r.hero) && /Avance/.test(r.hero) && /(detrás|adelante) del tiempo/.test(r.hero), 'la barra del tiempo contra el avance de la zona, con cuántos puntos vamos atrás o adelante');
    c(/Para atender/.test(r.at) && /\d+/.test(r.at) && /Órdenes para cerrar/.test(r.at), '«Para atender» en una línea, con la cuenta y lo principal · ' + r.at.replace(/\s+/g, ' ').slice(0, 120));
    await p.click('#ini186 [data-i186="at"]'); await p.waitForTimeout(500);
    const atl = await p.evaluate(() => ({ t: (document.getElementById('i186AtL') || {}).innerText || '', n: document.querySelectorAll('#i186AtL .ie-fila').length }));
    c(atl.n >= 2 && /Órdenes para cerrar/.test(atl.t) && /atrasada/i.test(atl.t), 'se despliega con la lista de siempre (lo del Ejecutivo y lo de Dirección) · ' + atl.n);
    await p.click('#ini186 [data-i186="at"]'); await p.waitForTimeout(300);
    c(r.mapa && r.filas.length === 2 && /^1 PLAZA LOS ÁLAMOS/.test(r.filas[0]) && /^2 PLAZA LAS ACACIAS/.test(r.filas[1]), '«Dónde trabajamos hoy»: el mapa y las plazas con orden hoy, numeradas, en la misma tarjeta · ' + JSON.stringify(r.filas.map((x) => x.slice(0, 40))));
    c(/\d+%/.test(r.filas[0]) && /Col/.test(r.filas[0]) && /\d+% → \d+%/.test(r.filas[0]), 'cada plaza con su % de avance, antes → ahora y las barritas por rubro');
    c(/Avance del contrato/.test(r.iz) && /de 18\.407 módulos/.test(r.iz) && /de 127 plazas terminadas/.test(r.iz) && /Columnas/.test(r.iz) && /Cable/.test(r.iz) && /PAT/.test(r.iz), 'el avance del contrato: anillo de la zona y barras por rubro');
    await p.click('#ini186 [data-i186="iz:pla"]'); await p.waitForTimeout(300);
    const pla = await p.evaluate(() => document.getElementById('i186Iz').innerText);
    c(/LAS ACACIAS/.test(pla) && /de \d+ K/.test(pla), '«Por plaza» (de la B): cada plaza de la zona con su avance');
    await p.click('#ini186 [data-i186="iz:rub"]');
    c(!r.sug && !r.ndia && !(await ver(p, '#ini186 .dr-curva, #drBar, #drCurva, #drClima, #drProg, #drPlata')), 'sin la orden sugerida, el número del día, la curva S, el clima, la programación ni la plata en el Inicio');
    c(r.logo === 'Alumbrado' && r.todos, 'el logo dice «Alumbrado» y abajo «Ver todos los indicadores»');
    c(await scrollX(p) <= 1, 'sin scroll de costado');
    const ch = await chicos(p, '#ini186 button, #ini186 [role="button"]'); c(!ch.length, 'todo lo que se toca mide 44 px o más · ' + JSON.stringify(ch));
    c(!errsJs(A).length, 'sin errores · ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await foto(p, 'inicio_admin', true);
    await p.click('#ini186 [data-i186="todos"]'); await p.waitForTimeout(1500);
    const h = await p.evaluate(() => { const v = (id) => { const e = document.getElementById(id); return !!e && e.offsetHeight > 0 && !!e.closest('#dirOv'); }; return { ov: !document.getElementById('dirOv').hidden, bar: v('drBar'), curva: v('drCurva'), sug: v('drSug'), sup: v('drSuper'), prog: v('drProg'), plata: v('drPlata') }; });
    c(h.ov && h.bar && h.curva && h.sug && h.sup && h.prog && h.plata, '«Ver todos los indicadores»: la pantalla de antes en una hoja (módulos por día, curva S, sugerida, Supervisor, programación, plata) · ' + JSON.stringify(h));
    await foto(p, 'todos_indicadores');
    await p.click('#dirOv [data-dr="cerrar"]'); await p.waitForTimeout(500);
    c(await p.evaluate(() => document.getElementById('dirOv').hidden && document.getElementById('ini186').offsetHeight > 0), '✕ cierra la hoja y queda el Inicio nuevo');
    await p.close();
  }

  // ================================================================= 1) el contador (con y sin acta, hora de mentira)
  if (SOLO('1')) {
    const T0 = new Date(2026, 10, 20, 10, 42, 20).getTime();
    const dA = datos155(); dA.db.configEquipo.precios = { contratoInicio: '2026-11-09', contratoPlazoMeses: 4 };
    let A = await sesion('admin', { antes: () => { window.__i186Ahora = new Date(2026, 10, 20, 10, 42, 20).getTime(); window.__pmPausa = true; window.__hvPausa = true; window.__isNoAuto = true; } }, dA); let p = A.page;
    await alInicio(p); await p.waitForTimeout(1300);
    let r = await ini(p);
    c(r.cd[0] === '108' && r.cd[1] === '13' && r.cd[2] === '17' && (cel || r.cd[3] === '40'), 'con el acta del 09/11/2026: faltan 108 días 13 h 17 min' + (cel ? '' : ' 40 s') + ' el 20/11 a las 10:42:20 · ' + JSON.stringify(r.cd));
    c(/Termina el martes 09\/03\/2027/.test(r.hero) && /van 11 días de 120 días/.test(r.hero) && /09\/11\/2026/.test(r.hero) && !/estimada/i.test(r.hero) && !r.acta, '«Termina el martes 09/03/2027 · van 11 días de 120 días desde el acta (09/11/2026)», sin «estimada» ni el botón');
    const tp = await p.evaluate(() => window.__ini186.tiempo(window.__inicioDir.contrato()).pct);
    c(Math.abs(tp - (11 * 864e5 + 10 * 36e5 + 42 * 6e4 + 20e3) / (120 * 864e5) * 100) < 0.01 && new RegExp(String(Math.round(tp * 10) / 10).replace('.', ',') + '%').test(r.hero), 'la barra del tiempo: ' + tp.toFixed(2) + ' % (días corridos)');
    await p.evaluate(() => { window.__i186Ahora += 61000; }); await p.waitForTimeout(1300);
    r = await ini(p); c(r.cd[2] === '16' && r.cd[0] === '108', 'el contador corre (un minuto después faltan 16 min) · ' + JSON.stringify(r.cd));
    await foto(p, 'contador_acta');
    await p.close();
    // sin acta: estimada + el botón de Administración
    A = await sesion('admin'); p = A.page;
    r = await ini(p);
    const C = await p.evaluate(() => window.__inicioDir.contrato());
    c(C.estimada && /Fecha estimada: cargá el acta de inicio/.test(r.hero) && r.acta && r.cd.length >= 3, 'sin el acta: cuenta desde la primera orden de la zona, dice «Fecha estimada: cargá el acta de inicio» y Administración tiene el botón · ' + C.ini);
    await p.click('#ini186 [data-i186="acta"]'); await p.waitForTimeout(700);
    const z = await p.evaluate(() => ({ ov: !document.getElementById('iz186Ov').hidden, inp: !!document.getElementById('zcInicio'), foco: document.activeElement && document.activeElement.id, enHoja: !!document.querySelector('#iz186Ov #zcInicio') }));
    c(z.ov && z.enHoja && z.foco === 'zcInicio', 'el botón abre 📋 Itemizado › «Nuestra zona» con la fecha del acta lista para cargar · ' + JSON.stringify(z));
    await p.fill('#iz186Ov #zcInicio', '2026-11-05'); await p.dispatchEvent('#iz186Ov #zcInicio', 'change'); await p.waitForTimeout(800);
    const pr = (await db(p)).configEquipo.precios || {};
    c(pr.contratoInicio === '2026-11-05', 'cargarla la guarda en la base (configEquipo/precios.contratoInicio) · ' + pr.contratoInicio);
    await p.evaluate(() => window.__iz186.cerrar()); await alInicio(p); await p.evaluate(() => window.__ini186.pintar()); await p.waitForTimeout(400);
    r = await ini(p); c(/Termina el .* 05\/03\/2027/.test(r.hero) && !/Fecha estimada/.test(r.hero), 'y el contador cuenta desde el acta: termina el 05/03/2027');
    await p.close();
    A = await sesion('lucia'); p = A.page; r = await ini(p);
    c(r.vis && /Fecha estimada/.test(r.hero) && !r.acta, 'la oficina ve «fecha estimada» sin el botón (lo carga Administración)'); await p.close();
  }

  // ================================================================= 2) las plazas de hoy: antes → ahora, mapa con los mismos números
  if (SOLO('2')) {
    const A = await sesion('admin'); const p = A.page;
    const P0 = await p.evaluate(() => window.__ini186.plazasHoy().map((x) => ({ n: x.n, nom: x.nom, antes: x.antes, ahora: x.ahora })));
    const al = P0.find((x) => /ÁLAMOS/.test(x.nom)), ac = P0.find((x) => /ACACIAS/.test(x.nom));
    c(al && al.antes != null && al.ahora > al.antes, 'LOS ÁLAMOS sube hoy con lo que mandó la cuadrilla (sellado de 3): ' + (al && al.antes) + ' % → ' + (al && al.ahora) + ' %');
    c(ac && ac.antes != null && ac.ahora >= ac.antes, 'LAS ACACIAS con su antes → ahora (sus izajes ya estaban por órdenes anteriores): ' + (ac && ac.antes) + ' % → ' + (ac && ac.ahora) + ' %');
    c(await p.evaluate((a) => document.querySelector('#i186HoyL .i6-pl').innerText.indexOf('+' + (a.ahora - a.antes) + ' hoy') >= 0, al), 'la fila dice «▲ +N hoy»');
    // la oficina cierra la de LOS ÁLAMOS con 6 sellados: sube el «ahora», el «antes» queda
    await p.evaluate(() => firebase.firestore().collection('ordenesTrabajo').doc('h130').update({ estado: 'Terminada', cierre: { cerradoTs: Date.now(), fecha: window.__ini186.hoy(), cantidades: { sellado_base: 6 }, horas: 8, avanceItems: [] } }));
    await p.waitForTimeout(1500); await p.evaluate(() => window.__ini186.pintar()); await p.waitForTimeout(400);
    const al2 = await p.evaluate(() => window.__ini186.plazasHoy().find((x) => /ÁLAMOS/.test(x.nom)));
    c(al2.ahora > al.ahora && al2.antes === al.antes, 'cerrada con 6: el «ahora» sube (' + al.ahora + ' → ' + al2.ahora + ' %) y el «antes» sigue ' + al2.antes + ' %');
    const m = await p.evaluate(() => ({ pins: [...document.querySelectorAll('#i186Mapa .i6-pin .n')].map((e) => e.textContent), lab: [...document.querySelectorAll('#i186Mapa .i6-pin .l')].map((e) => e.textContent), filas: [...document.querySelectorAll('#i186HoyL .i6-n')].map((e) => e.textContent), leaf: !!document.querySelector('#i186Mapa.leaflet-container') }));
    c(m.leaf && m.pins.join() === '1,2' && m.filas.join() === '1,2' && /LOS ÁLAMOS · \d+%/.test(m.lab[0]), 'el mapa (Leaflet) con un pin por plaza y el mismo número que la fila, con el nombre y el % · ' + JSON.stringify(m));
    await foto(p, 'plazas_hoy', true);
    await p.click('#i186HoyL .i6-pl'); await p.waitForTimeout(900);
    const v = await p.evaluate(() => ({ vista: document.body.dataset.vista, id: typeof avanceActivoId != 'undefined' ? avanceActivoId : '' }));
    c(v.vista === 'avance' && v.id === 'p1', 'tocar la plaza lleva a su avance de obra · ' + JSON.stringify(v));
    c(!errsJs(A).length, 'sin errores · ' + JSON.stringify(errsJs(A).slice(0, 3)));
    await p.close();
  }

  // ================================================================= 3) Órdenes › «Mañana» y emitir desde ahí
  if (SOLO('3')) {
    const A = await sesion('admin'); const p = A.page;
    c(!(await p.evaluate(() => !!document.querySelector('#ini186 .sg-ini, #ini186 [data-sg]'))), 'la orden sugerida ya no está en el Inicio');
    await p.evaluate(() => { mostrarVista('parte'); window.irSubOrdenes('tablero'); }); await p.waitForTimeout(700);
    const tab = await p.evaluate(() => { const b = document.querySelector('#otTablero [data-tbs="manana"]'); return b ? b.innerText.replace(/\s+/g, ' ') : ''; });
    const n = await p.evaluate(() => window.__man186.n());
    c(/Mañana/.test(tab) && tab.indexOf(String(n)) >= 0 && n > 0, 'Órdenes tiene la subpestaña «🗓 Mañana» con cuántas sugiere · ' + tab);
    await p.click('#otTablero [data-tbs="manana"]'); await p.waitForTimeout(800);
    const t = await p.evaluate(() => document.getElementById('otTablero').innerText);
    c(/Lo que la app armó para mañana/.test(t) && /Revisar y emitir/.test(t) && /Ajustes/.test(t) && /pts/.test(t), 'adentro, lo que la app armó para mañana (obras, gente, tareas, puntos) con «Ajustes» y «Revisar y emitir»');
    c(!(await ver(p, '#sgTab')), 'la línea vieja de la sugerida arriba del tablero ya no se repite');
    await foto(p, 'manana');
    const n0 = Object.keys((await db(p)).ordenesTrabajo || {}).length;
    await p.click('#otTablero .mn6 [data-sg="abrir"]:not([data-cfg])'); await p.waitForTimeout(1200);
    c(await ver(p, '#sgOv'), '«Revisar y emitir» abre la hoja de la orden sugerida de siempre');
    await p.click('#sgOv [data-sg="emitir"]'); await p.waitForTimeout(600);
    await p.evaluate(() => { const a = document.getElementById('sgAvisar'); if (a) a.checked = false; });
    await p.click('#sgEm [data-sg="emitirsi"]'); await p.waitForTimeout(400);
    for (let i = 0; i < 160; i++) { await p.waitForTimeout(250); await p.evaluate(() => { const b = document.querySelector('#uoPop [data-uo="otra"]'); b && b.click(); });   // «Ya hay una orden para BULEVARES ese día» → «Hacer otra» (v126)
      if (!(await p.evaluate(() => window.__sugerida.emitiendo() || /⏳/.test(window.__sugerida._st.msg)))) break; }
    await p.waitForTimeout(1500);
    const n1 = Object.keys((await db(p)).ordenesTrabajo || {}).length;
    const msg = await p.evaluate(() => window.__sugerida._st.msg + ' | uo:' + !!document.getElementById('uoPop') + ' | ' + (document.getElementById('sgEm') ? 'sgEm' : ''));
    c(n1 > n0 && /Emitida/.test(msg), 'emitir desde Órdenes › «Mañana»: las órdenes quedan en la base (BULEVARES: «Hacer otra» en el aviso de la v126) · ' + n0 + ' → ' + n1 + ' · ' + msg);
    await p.evaluate(() => { const x = document.querySelector('#sgOv [data-sg="x"]'); x && x.click(); }); await p.waitForTimeout(500);
    c(await p.evaluate(() => typeof window.__sinTarea == 'object' && typeof window.__sinTarea.tic == 'function'), 'el recordatorio de la gente sin tarea sigue andando (módulo intacto)');
    await p.close();
  }

  // ================================================================= 4) 📋 Itemizado
  if (SOLO('4')) {
    let A = await sesion('admin'); let p = A.page;
    await p.evaluate(() => abrirMenuLateral()); await p.waitForTimeout(400);
    c(await ver(p, '#menuItemizado186') && await ver(p, '#menuGantt186'), 'el menú tiene «📋 Itemizado» y «📅 Gantt»');
    await p.click('#menuItemizado186'); await p.waitForTimeout(700);
    let t = await p.evaluate(() => document.querySelector('#iz186Ov .g6-body').innerText);
    c(/Todas · nuestra zona/.test(t) && /Nuestra zona/.test(t) && /Por rubro/i.test(t) && /Por plaza/i.test(t) && /Columnas/.test(t), '«Todas · nuestra zona»: «Nuestra zona», por rubro y por plaza');
    await foto(p, 'itemizado_zona');
    await p.click('#iz186Ov [data-iz="obra:p2"]'); await p.waitForTimeout(500);
    t = await p.evaluate(() => document.querySelector('#iz186Ov .g6-body').innerText);
    c(/PLAZA LAS ACACIAS/.test(t) && /Contr\./i.test(t) && /Hecho/i.test(t) && /Falta/i.test(t) && /Columna PRFV/.test(t), 'una obra: cada ítem con contratado / hecho / falta');
    await p.click('#iz186Ov [data-iz="ed:5"]'); await p.waitForTimeout(400);
    await p.fill('#g6Cant', '5'); await p.click('#g6Conf [data-g6c="si"]'); await p.waitForTimeout(500);
    let m = await p.evaluate(() => document.getElementById('g6CMsg').textContent);
    c(/motivo/i.test(m) && (await db(p)).avanceObras.p2.valorItems[0].cantidad === 4, 'sin motivo no deja (y la base no cambia) · ' + m);
    await p.fill('#g6Mot', 'el plano nuevo suma la Col 5'); await p.click('#g6Conf [data-g6c="si"]'); await p.waitForTimeout(1500);
    const o = (await db(p)).avanceObras.p2, h = (o.avanceHist || []).slice(-1)[0] || {};
    c(o.valorItems[0].cantidad === 5 && h.motivo === 'el plano nuevo suma la Col 5' && h.cantAntes === 4 && h.cantDespues === 5, 'con motivo y «Sí»: lo contratado pasa de 4 a 5 en la base y queda en avanceHist · ' + JSON.stringify(h).slice(0, 160));
    t = await p.evaluate(() => document.querySelector('#iz186Ov .g6-body').innerText);
    c(/✎ 4 → 5/.test(t) && /el plano nuevo suma la Col 5/.test(t), 'la fila muestra el cambio con su motivo');
    const au = Object.values((await db(p)).auditoria || {}).some((x) => x && x.accion === 'avance_auditoria' && /ítem 5/.test(x.detalle || ''));
    c(au, 'y queda en la auditoría');
    c(await scrollX(p) <= 1 && !(await chicos(p, '#iz186Ov button')).length, 'sin scroll de costado y botones de 44 px');
    await foto(p, 'itemizado_obra');
    await p.close();
    A = await sesion('dir'); p = A.page;
    await p.evaluate(() => window.__iz186.abrir({ obra: 'p2' })); await p.waitForTimeout(500);
    c(await p.evaluate(() => !document.getElementById('iz186Ov').hidden && !document.querySelector('#iz186Ov [data-iz^="ed:"]') && /solo se mira/.test(document.querySelector('#iz186Ov').innerText)), 'Dirección mira el itemizado sin ✎');
    await p.close();
  }

  // ================================================================= 5) 📅 Gantt
  if (SOLO('5')) {
    let A = await sesion('admin'); let p = A.page;
    await p.evaluate(() => window.__gt186.abrir({ obra: 'p1' })); await p.waitForTimeout(600);
    let t = await p.evaluate(() => document.querySelector('#gt186Ov .g6-body').innerText);
    c(/PLAZA LOS ÁLAMOS por rubro/.test(t) && /Toda la obra/.test(t) && /Civil/.test(t) && /Columnas/.test(t) && /hoy/.test(t) && /fin contrato/.test(t), 'una obra: toda la obra y cada rubro, con la línea de hoy y la del fin del contrato');
    c(await p.evaluate(() => document.querySelectorAll('#gt186Ov .g6-trk .re').length >= 2 && document.querySelectorAll('#gt186Ov .g6-trk .pv').length >= 1), 'barras de lo previsto y lo real (de las órdenes)');
    await p.click('#gt186Ov [data-gt="ed"]'); await p.waitForTimeout(300);
    const set = async (k, a, b) => { await p.fill(`#gt186Ov [data-gtf="desde"][data-k="${k}"]`, a); await p.dispatchEvent(`#gt186Ov [data-gtf="desde"][data-k="${k}"]`, 'change'); await p.waitForTimeout(150); await p.fill(`#gt186Ov [data-gtf="hasta"][data-k="${k}"]`, b); await p.dispatchEvent(`#gt186Ov [data-gtf="hasta"][data-k="${k}"]`, 'change'); await p.waitForTimeout(150); };
    const hoy = await p.evaluate(() => window.__ini186.hoy()), mas = (n) => { const d = new Date(hoy + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
    await set('obra', mas(-30), mas(40)); await set('civil', mas(-20), mas(10));
    t = await p.evaluate(() => document.querySelector('#gt186Ov .g6-barra').innerText);
    c(/2 fechas cambiadas/.test(t), 'los cambios quedan marcados hasta guardar · ' + t.replace(/\s+/g, ' '));
    await foto(p, 'gantt_obra');
    await p.click('#gt186Ov [data-gt="guardar"]'); await p.waitForTimeout(400);
    c(await ver(p, '#g6Conf') && /Toda la obra/.test(await p.evaluate(() => document.getElementById('g6Conf').innerText)), '«Guardar» pide «Sí» con lo de antes → lo nuevo');
    await p.click('#g6Conf [data-g6c="si"]'); await p.waitForTimeout(1200);
    const g = (await db(p)).avanceObras.p1.planGantt || [];
    const go = g.find((x) => x.g186 === 'obra'), gc = g.find((x) => x.g186 === 'civil');
    c(go && go.desde === mas(-30) && go.hasta === mas(40) && gc && gc.hasta === mas(10) && g.some((x) => x.id === 'g1'), 'quedan en avanceObras.planGantt (toda la obra y Civil), y lo cargado antes se conserva · ' + g.map((x) => x.id).join(','));
    const prev = await p.evaluate(() => window.__inicioDir.prevista(avanceObras.find((o) => o.id === 'p1')).f);
    c(prev === mas(40), 'la «prevista» de la Programación de Dirección lee la fecha nueva · ' + prev);
    c(Object.values((await db(p)).auditoria || {}).some((x) => x && x.accion === 'gantt_fechas'), 'auditoría gantt_fechas');
    const pl = await p.evaluate(() => window.__ini186.planPct());
    c(pl && pl.n >= 1, 'el contador del Inicio usa esas fechas como plan · ' + JSON.stringify(pl));
    // repartir: solo propone
    await p.click('#gt186Ov [data-gt="obra:"]'); await p.waitForTimeout(400);
    t = await p.evaluate(() => document.querySelector('#gt186Ov .g6-body').innerText);
    c(/¿Cuándo termina cada plaza\?/.test(t) && /sin fecha prevista/.test(t), '«Todas · nuestra zona»: una fila por plaza y cuántas están sin fecha');
    await foto(p, 'gantt_zona');
    const antes = JSON.stringify((await db(p)).avanceObras.p3.planGantt || null);
    await p.click('#gt186Ov [data-gt="repartir"]'); await p.waitForTimeout(500);
    const pv = await p.evaluate(() => document.getElementById('g6Conf').innerText);
    c(/BULEVARES/.test(pv) && /→/.test(pv) && JSON.stringify((await db(p)).avanceObras.p3.planGantt || null) === antes, '«Repartir» muestra la propuesta (BULEVARES con fechas) sin escribir nada');
    await foto(p, 'gantt_repartir');
    await p.click('#g6Conf [data-g6c="si"]'); await p.waitForTimeout(1500);
    const g3 = ((await db(p)).avanceObras.p3.planGantt || []).find((x) => x.g186 === 'obra');
    c(g3 && g3.repartido === true && g3.desde && g3.hasta, 'con «Sí» las pone (marcadas «repartido») · ' + JSON.stringify(g3 && [g3.desde, g3.hasta]));
    c(await scrollX(p) <= 1, 'sin scroll de costado');
    await p.close();
    A = await sesion('dir'); p = A.page;
    await p.evaluate(() => window.__gt186.abrir({})); await p.waitForTimeout(500);
    c(await p.evaluate(() => !document.querySelector('#gt186Ov [data-gt="ed"], #gt186Ov [data-gt="repartir"]') && /¿Cuándo termina/.test(document.getElementById('gt186Ov').innerText)), 'Dirección mira el Gantt sin cambiar fechas ni repartir');
    await p.close();
  }

  // ================================================================= 6) roles y __v186No
  if (SOLO('6')) {
    let A = await sesion('lucia'); let p = A.page; let r = await ini(p);
    c(r.on && r.vis && r.filas.length === 2 && /Para atender/.test(r.at), 'oficina: el mismo Inicio nuevo'); await p.close();
    A = await sesion('dir'); p = A.page; r = await ini(p);
    const d = await p.evaluate(() => ({ ie: document.querySelectorAll('#ini186 [data-ie]').length, acta: !!document.querySelector('#ini186 [data-i186="acta"]') }));
    c(r.on && r.vis && r.logo === 'Dirección' && r.filas.length === 2 && !d.acta, 'Dirección: el mismo Inicio (logo «Dirección»), sin el botón del acta · ' + JSON.stringify(d));
    await foto(p, 'inicio_direccion');
    await p.close();
    A = await sesion('pan'); p = A.page;
    r = await p.evaluate(() => ({ modo: window.__inicioPro.modo(), pan: !!document.getElementById('iniPan') && document.getElementById('iniPan').offsetHeight > 0, n: !!document.getElementById('ini186'), menu: !!document.getElementById('menuItemizado186') }));
    c(r.modo === 'pan' && r.pan && !r.n && !r.menu, 'pañol: su Inicio de siempre, sin Itemizado ni Gantt · ' + JSON.stringify(r)); await p.close();
    A = await sesion('juan', { crew: true }); p = A.page;
    r = await p.evaluate(() => ({ n: !!document.getElementById('ini186'), cd: !!document.getElementById('cdApp'), menu: !!document.getElementById('menuItemizado186') }));
    c(!r.n && !r.menu, 'cuadrilla: sin cambios · ' + JSON.stringify(r)); await p.close();
    A = await sesion('mir'); p = A.page; await p.waitForTimeout(2600);
    r = await p.evaluate(() => ({ n: !!document.getElementById('ini186') && document.getElementById('ini186').offsetHeight > 0, menu: !!document.getElementById('menuItemizado186'), gt: !!document.getElementById('menuGantt186') }));
    await p.evaluate(() => window.__gt186.abrir({ obra: 'p1' })); await p.waitForTimeout(400);
    const ed = await p.evaluate(() => !!document.querySelector('#gt186Ov [data-gt="ed"]'));
    c(!r.n && r.menu && r.gt && !ed, '«solo mirar»: el Inicio de antes; Itemizado y Gantt en el menú, sin editar · ' + JSON.stringify(r)); await p.close();
    A = await sesion('admin', { v186: false }); p = A.page;
    r = await p.evaluate(() => ({ n: !!document.getElementById('ini186'), iu: !!document.querySelector('#viewInicio > #iniDir.iu'), menu: !!document.getElementById('menuItemizado186'), man: (() => { mostrarVista('parte'); window.irSubOrdenes('tablero'); return true; })() }));
    await p.waitForTimeout(600);
    const man = await p.evaluate(() => !!document.querySelector('#otTablero [data-tbs="manana"]'));
    c(!r.n && r.iu && !r.menu && !man, 'con __v186No todo como la v185 (#iniDir.iu, sin menús nuevos ni «Mañana») · ' + JSON.stringify(r)); await p.close();
  }
  if (browser) await browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
