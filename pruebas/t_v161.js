// v161 · El Inicio de Administración y Oficina pasa a ser la pantalla de Dirección (#iniDir), con permiso de editar.
//  0) admin entra a #iniDir (no al Ejecutivo) con todos los bloques del Ejecutivo adentro (buscador + Asistente, «Para atender»
//     fundido con «Necesita tu atención», la orden sugerida de mañana, Supervisor, En obra ahora, Órdenes de hoy, Accesos, Obras)
//     y los gráficos de Dirección; sin «📊 Dirección» en menú / accesos / Tablero del dueño; sin scroll de costado.
//  1) las acciones andan: buscador, chips, «Órdenes para cerrar», «Cerrar» de una orden de hoy, Supervisor «Ver todo»,
//     «📨 Para resolver», Certificación y Avance desde los gráficos, «Ver el Inicio de antes» y volver.
//  2) emitir la orden sugerida desde el Inicio (hoja → «Emitir» → «Sí»): la orden queda en la base.
//  3) oficina (Lucía) igual que admin.
//  4) Dirección igual que antes: sin las piezas del Ejecutivo, sin ninguna acción (data-ie), «solo para mirar».
//  5) pañol, cuadrilla y «solo mirar» sin cambios; con __v161No admin sigue con el Ejecutivo y «📊 Dirección».
//  6) sin escuchas nuevas y rendimiento: del «Inicio listo» al Inicio dibujado (celu, CPU ×4) y el repintado cada 2,5 s.
const { abrir, prueba } = require('./h');
const { datos155 } = require('./datos155');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.indexOf(x) >= 0;
function datos161() {
  const d = datos155();
  // la orden de hoy de LOS ÁLAMOS ya mandada (para el «Cerrar» de «Órdenes de hoy»)
  d.db.ordenesTrabajo.h130.campo = Object.assign({}, d.db.ordenesTrabajo.h130.campo, { enviados: { 'juan perez': { ts: Date.now() - 6e5, por: 'Juan Pérez' } } });
  return d;
}
(async () => {
  const c = prueba('v161' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 5000, v145: true, v146: true, v147: true, v150: true, v151: true, v152: true, v153: true, v154: true, v155: true, v156: true, v157: true, v158: true, v159: true, v160: true, v161: true, sugerida: true, inicio: true, nav: true, iaPro: true, leaflet: true, https: true, antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true; } };
  let browser = null;
  const sesion = async (quien, op) => { const A = await abrir(Object.assign({ sesion: quien, datos: datos161(), browser }, MOD, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(2500);
    await A.page.evaluate(() => { try { window.__paraResolver && window.__paraResolver.cargar(true); } catch (e) { } }); await A.page.waitForTimeout(800); return A; };
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db') || '{}'));
  const scrollX = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const foto = async (p, nombre, full) => { if (!CAP) return; await p.waitForTimeout(400); await p.screenshot({ path: CAP + '/' + nombre + '_' + (cel ? 'cel' : 'pc') + '.png', fullPage: !!full }); };
  const errsJs = (A) => (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|prueba|sin permiso|Sin permiso|tile|open-meteo/i.test(e));
  const ver = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }, s);
  const alInicio = async (p) => { await p.evaluate(() => { document.querySelectorAll('#spHoja,#prOv,#sgOv,#cierreOt').forEach(() => { }); try { window.__atras && window.__atras.estado && 0; } catch (e) { } mostrarVista('inicio'); }); await p.waitForTimeout(900); };
  const PIEZAS = ['drBusca', 'drAt', 'drSug', 'drSuper', 'drEnObra', 'drOts', 'drAccs', 'drObras'];
  const GRAF = ['drHero', 'drBar', 'drCurva', 'drHoy', 'drMapaC', 'drEq', 'drClima', 'drProg', 'drPlata', 'drIa'];
  const estado = (p) => p.evaluate(([P, G]) => {
    const d = document.getElementById('iniDir'), v = (id) => { const e = document.getElementById(id); return !!e && e.offsetHeight > 0; };
    return { rol: PERMISOS.yo().rol, modo: window.__inicioPro.modo(), dir: !!d && d.offsetHeight > 0 && !!d.closest('#viewInicio'), iu: !!d && d.classList.contains('iu'), eje: v('iniEje'), hero: document.body.classList.contains('ie-hero'),
      faltan: P.filter((id) => !v(id)), faltanG: G.filter((id) => !v(id)), at: (document.getElementById('drAt') || {}).textContent || '', ie: document.querySelectorAll('#iniDir [data-ie]').length,
      nota: (d && d.querySelector('.dr-nota') || {}).textContent || '', logo: (d && d.querySelector('.dr-logo small') || {}).textContent || '',
      menuDir: !!document.getElementById('menuDireccion'), accDir: !!document.querySelector('#iniDir [data-dr="abrir"]'), tdDir: (window.__tableroDueno ? '' : '') + (window.__inicioDir.tdHtml() || ''), accesoDir: window.__inicioDir.accesoHtml() || '' };
  }, [PIEZAS, GRAF]);

  // ================================================================= 0) admin entra a #iniDir con todo adentro
  if (SOLO('0') || SOLO('1') || SOLO('2')) {
    const A = await sesion('admin'); const p = A.page;
    if (SOLO('0')) {
      const r = await estado(p);
      c(r.rol === 'admin' && r.modo === 'dir' && r.dir && r.iu && !r.eje && r.hero, 'admin abre la app en #iniDir (la pantalla de Dirección, en su Inicio, no como hoja) y no en el Ejecutivo · ' + JSON.stringify({ modo: r.modo, dir: r.dir, iu: r.iu, eje: r.eje }));
      c(!r.faltan.length, 'adentro, todo lo del Ejecutivo: buscador, Para atender, sugerida de mañana, Supervisor, En obra ahora, Órdenes de hoy, Accesos, Obras · faltan ' + JSON.stringify(r.faltan));
      c(!r.faltanG.length, 'y los gráficos de Dirección (portada, barras, curva S, qué se hizo, mapa, equipo, clima, programación, plata, asistente) · faltan ' + JSON.stringify(r.faltanG));
      c(/Para atender/.test(r.at) && /Órdenes para cerrar/.test(r.at) && /atrasada/.test(r.at) && /respaldo/i.test(r.at) && !/Necesita tu atención/.test(r.at), '«Para atender» fundido: lo de Dirección (obra atrasada) + lo del Ejecutivo (para cerrar, respaldo…) en una sola tarjeta · ' + r.at.replace(/\s+/g, ' ').slice(0, 200));
      c(/Para resolver/.test(r.at), '«📨 Para resolver» también en «Para atender» (el aviso de Pedro)');
      c(r.ie > 10 && /Ver el Inicio de antes/.test(r.nota) && r.logo === 'Alumbrado', 'con sus acciones de siempre (' + r.ie + ' botones), «Ver el Inicio de antes» abajo y el logo dice «Alumbrado» (no «Dirección»)');
      c(!r.menuDir && !r.accDir && !r.accesoDir && !r.tdDir, '«📊 Dirección» ya no aparece para admin (menú, accesos, Tablero del dueño)');
      const t = await p.evaluate(() => ({ sug: document.getElementById('drSug').textContent, sup: document.getElementById('drSuper').textContent, ots: document.getElementById('drOts').textContent, acc: document.getElementById('drAccs').textContent, ob: document.getElementById('drObras').textContent }));
      c(/sugerida/i.test(t.sug) && /Supervisor/.test(t.sup) && /OT-2026-130/.test(t.ots) && /Mapa de guerra/.test(t.acc) && /Tablero del/.test(t.acc) && /LOS ÁLAMOS/.test(t.ob), 'las piezas con su contenido: sugerida, Supervisor, OT de hoy, accesos (Mapa de guerra, Tablero del dueño…), obras');
      c(await scrollX(p) <= 1, 'sin scroll de costado');
      if (!cel) { const g = await p.evaluate(() => { const r = (id) => document.getElementById(id).getBoundingClientRect(); const w = document.getElementById('iniDir').getBoundingClientRect(); return { sug: r('drSug').right, sup: r('drSuper').right, at: r('drAt').left, w: w.right }; }); c(g.sug > g.w - 120 && g.sup > g.w - 120 && g.at < 120, 'compu: la sugerida y el Supervisor en la columna de la derecha · ' + JSON.stringify(g)); }
      else { const o = await p.evaluate(() => ['drHoy', 'drSug', 'drSuper'].map((id) => document.getElementById(id).getBoundingClientRect().top)); c(o[0] < o[1] && o[1] < o[2], 'celu: la sugerida y el Supervisor después de los gráficos del día (qué se hizo)'); }
      c(!errsJs(A).length, 'sin errores · ' + JSON.stringify(errsJs(A).slice(0, 3)));
      await foto(p, 'admin_inicio', true);
    }
    if (SOLO('1')) {
      // buscador
      await p.fill('#drBuscar', 'acacias'); await p.waitForTimeout(500);
      let r = await p.evaluate(() => ({ n: document.querySelectorAll('#drObras .ie-obra').length, t: document.getElementById('drObras').textContent }));
      c(r.n === 1 && /ACACIAS/.test(r.t) && /coinciden/.test(r.t), 'el buscador filtra las obras · ' + r.n);
      await p.click('#drObras [data-ie="chip:eje"]'); await p.waitForTimeout(400);
      r = await p.evaluate(() => ({ n: document.querySelectorAll('#drObras .ie-obra').length, q: document.getElementById('drBuscar').value, on: !!document.querySelector('#drObras [data-ie="chip:eje"].on') }));
      c(r.q === '' && r.on && r.n >= 1, 'los chips de Obras andan y limpian el buscador');
      // órdenes para cerrar → Órdenes › Para revisar y cerrar
      await p.click('#drAt [data-ie="cerrar"]'); await p.waitForTimeout(900);
      r = await p.evaluate(() => ({ v: document.body.dataset.vista, sub: (document.querySelector('[data-tbs].on, [data-tbs].activo') || {}).dataset }));
      c(r.v === 'parte', '«Órdenes para cerrar» lleva a Órdenes · ' + JSON.stringify(r));
      await alInicio(p);
      // cerrar una orden de hoy
      c(await ver(p, '#drOts [data-ie^="cerrarOt:"]'), '«Órdenes de hoy»: la que mandó la cuadrilla tiene «Cerrar»');
      await p.click('#drOts [data-ie^="cerrarOt:"]'); await p.waitForTimeout(1200);
      c(await ver(p, '#cierreOt') || await p.evaluate(() => !!document.querySelector('.cierre-qty')), '«Cerrar» abre el cierre de esa orden');
      await p.evaluate(() => { try { window.cerrarCuadroCierre && window.cerrarCuadroCierre(); } catch (e) { } }); await p.waitForTimeout(400); await alInicio(p);
      // Supervisor
      await p.click('#drSuper [data-sup="todo"]'); await p.waitForTimeout(700);
      c(await ver(p, '#spHoja'), '«🩺 Supervisor › Ver todo» abre la hoja del Supervisor');
      await p.evaluate(() => { const b = document.querySelector('#spHoja [data-sup="cerrar"]'); b && b.click(); }); await p.waitForTimeout(400);
      // Para resolver
      await p.click('#drAt [data-ie="pararesolver"]'); await p.waitForTimeout(900);
      c(await ver(p, '#prOv'), '«📨 Para resolver» abre la bandeja');
      await p.evaluate(() => window.__paraResolver.cerrar()); await p.waitForTimeout(300); await alInicio(p);
      // gráficos → sus pantallas
      await p.click('#drPlata [data-dr="cert"]'); await p.waitForTimeout(900);
      c(await p.evaluate(() => window.__certMensual.estado().abierta), '«Certificación ›» desde la plata abre la certificación del mes');
      await p.evaluate(() => window.__certMensual.cerrar()); await p.waitForTimeout(300); await alInicio(p);
      await p.click('#drProg [data-dr="v:avance"]'); await p.waitForTimeout(900);
      c(await p.evaluate(() => document.body.dataset.vista === 'avance'), '«Avance ›» de la programación lleva a Avance de obra');
      await alInicio(p);
      // el Inicio de antes y volver
      await p.click('#iniDir [data-iu="viejo"]'); await p.waitForTimeout(900);
      r = await p.evaluate(() => ({ modo: window.__inicioPro.modo(), eje: !!document.getElementById('iniEje') && document.getElementById('iniEje').offsetHeight > 0, dir: !!document.getElementById('iniDir') && document.getElementById('iniDir').offsetHeight > 0, volver: !!document.querySelector('#iniEje [data-iu="nuevo"]') }));
      c(r.modo === 'eje' && r.eje && !r.dir && r.volver, '«Ver el Inicio de antes» muestra el Ejecutivo, con «‹ Volver al Inicio nuevo» · ' + JSON.stringify(r));
      await foto(p, 'admin_inicio_antes');
      await p.click('#iniEje [data-iu="nuevo"]'); await p.waitForTimeout(900);
      r = await estado(p);
      c(r.modo === 'dir' && r.dir && !r.eje && !r.faltan.length, '«Volver al Inicio nuevo» vuelve a #iniDir con todo');
      c(!errsJs(A).length, 'sin errores en las acciones · ' + JSON.stringify(errsJs(A).slice(0, 3)));
    }
    if (SOLO('2')) {
      await alInicio(p);
      const n0 = Object.keys((await db(p)).ordenesTrabajo || {}).length;
      await p.click('#drSug [data-sg="abrir"]'); await p.waitForTimeout(1200);
      c(await ver(p, '#sgOv'), 'la tarjeta de la sugerida abre la hoja de la orden sugerida');
      await p.click('#sgOv [data-sg="emitir"]'); await p.waitForTimeout(600);
      await p.evaluate(() => { const a = document.getElementById('sgAvisar'); if (a) a.checked = false; });
      await p.click('#sgEm [data-sg="emitirsi"]'); await p.waitForTimeout(400);
      for (let i = 0; i < 160; i++) { await p.waitForTimeout(250); if (!(await p.evaluate(() => window.__sugerida.emitiendo() || /⏳/.test(window.__sugerida._st.msg)))) break; }
      await p.waitForTimeout(1500);
      const n1 = Object.keys((await db(p)).ordenesTrabajo || {}).length;
      c(n1 > n0, 'emitir la sugerida desde el Inicio: las órdenes quedan en la base · ' + n0 + ' → ' + n1);
      await p.evaluate(() => { const x = document.querySelector('#sgOv [data-sg="x"]'); x && x.click(); }); await alInicio(p);
      await p.waitForTimeout(2800);
      const t = await p.evaluate(() => document.getElementById('drSug').textContent);
      c(/emitidas/i.test(t), 'la tarjeta del Inicio se actualiza: «emitidas N de M» · ' + t.replace(/\s+/g, ' ').slice(0, 90));
    }
    await p.close();
  }

  // ================================================================= 3) oficina igual que admin
  if (SOLO('3')) {
    const A = await sesion('lucia'); const p = A.page;
    const r = await estado(p);
    c(r.rol === 'oficina' && r.modo === 'dir' && r.dir && r.iu && !r.eje && !r.faltan.length && !r.faltanG.length, 'oficina (Lucía) también entra a #iniDir con todo adentro · ' + JSON.stringify({ modo: r.modo, faltan: r.faltan, faltanG: r.faltanG }));
    c(!r.menuDir && !r.accDir, 'sin «📊 Dirección» para la oficina');
    await p.fill('#drBuscar', 'bulevares'); await p.waitForTimeout(500);
    c(await p.evaluate(() => document.querySelectorAll('#drObras .ie-obra').length === 1), 'el buscador anda para la oficina');
    await foto(p, 'oficina_inicio');
    await p.close();
  }

  // ================================================================= 4) Dirección igual que antes
  if (SOLO('4')) {
    const A = await sesion('dir'); const p = A.page;
    const r = await estado(p);
    c(r.rol === 'direccion' && r.modo === 'dir' && r.dir && !r.iu && !r.faltanG.length, 'Dirección sigue con su Inicio de siempre · ' + JSON.stringify({ iu: r.iu, faltanG: r.faltanG }));
    c(r.faltan.length === PIEZAS.length - 1 && r.faltan.indexOf('drAt') < 0 && r.ie === 0, 'sin las piezas del Ejecutivo ni ninguna acción (data-ie) · ' + JSON.stringify(r.faltan) + ' ie ' + r.ie);
    c(/solo para mirar/.test(r.nota) && r.logo === 'Dirección' && /Necesita tu atención/.test(r.at), '«solo para mirar», logo «Dirección» y «Necesita tu atención» como antes');
    await foto(p, 'direccion_inicio');
    await p.close();
  }

  // ================================================================= 5) pañol, cuadrilla, mirar sin cambios; __v161No
  if (SOLO('5')) {
    let A = await sesion('pan'); let p = A.page;
    let r = await p.evaluate(() => ({ modo: window.__inicioPro.modo(), pan: !!document.getElementById('iniPan') && document.getElementById('iniPan').offsetHeight > 0, dir: !!document.getElementById('iniDir') }));
    c(r.modo === 'pan' && r.pan && !r.dir, 'pañol: su Inicio de siempre · ' + JSON.stringify(r)); await p.close();
    A = await sesion('juan', { crew: true }); p = A.page;
    r = await p.evaluate(() => ({ modo: window.__inicioPro.modo(), dir: !!document.getElementById('iniDir'), u: window.__iniUnico.on() }));
    c(r.modo === '' && !r.dir && !r.u, 'cuadrilla: sin cambios (ni #iniDir) · ' + JSON.stringify(r)); await p.close();
    A = await sesion('mir'); p = A.page;
    r = await p.evaluate(() => ({ modo: window.__inicioPro.modo(), dir: !!document.getElementById('iniDir'), on: document.getElementById('viewInicio').classList.contains('ie-on') }));
    c(r.modo === '' && !r.dir && !r.on, '«solo mirar»: el Inicio de antes, sin cambios · ' + JSON.stringify(r)); await p.close();
    A = await sesion('admin', { v161: false }); p = A.page;
    r = await p.evaluate(() => ({ modo: window.__inicioPro.modo(), eje: !!document.getElementById('iniEje') && document.getElementById('iniEje').offsetHeight > 0, dirIni: !!document.querySelector('#viewInicio > #iniDir'), acc: !!document.querySelector('#iniEje [data-dr="abrir"]') }));
    c(r.modo === 'eje' && r.eje && !r.dirIni && r.acc, 'con __v161No admin sigue con el Ejecutivo y «📊 Dirección» · ' + JSON.stringify(r)); await p.close();
  }

  // ================================================================= 6) escuchas y rendimiento
  if (SOLO('6')) {
    const contar = async (op) => {
      const A = await sesion('admin', op); const p = A.page;
      await p.evaluate(() => {
        window.__cuenta = { snap: [], get: [] };
        const fs = firebase.firestore(), col0 = fs.collection.bind(fs);
        const envolver = (q, nombre) => { if (!q || q.__env) return q; const o = Object.assign({}, q); ['where', 'orderBy', 'limit'].forEach((k) => { if (q[k]) o[k] = (...a) => envolver(q[k](...a), nombre); }); if (q.get) o.get = (...a) => { window.__cuenta.get.push(nombre); return q.get(...a); }; if (q.onSnapshot) o.onSnapshot = (...a) => { window.__cuenta.snap.push(nombre); return q.onSnapshot(...a); }; if (q.doc) o.doc = (id) => envolver(q.doc(id), nombre + '/' + id); o.__env = 1; return o; };
        fs.collection = (n) => envolver(col0(n), n);
      });
      for (let i = 0; i < 3; i++) { await p.evaluate(() => { window.__inicioPro.pintar(); window.__inicioDir && window.__inicioDir.pintar(); }); await p.waitForTimeout(400); }
      await p.evaluate(() => { mostrarVista('obras'); }); await p.waitForTimeout(500); await p.evaluate(() => mostrarVista('inicio')); await p.waitForTimeout(2500);
      const n = await p.evaluate(() => window.__cuenta); await p.close(); return n;
    };
    const s1 = await contar({}), s0 = await contar({ v161: false });
    c(s1.snap.length === 0 && s0.snap.length === 0, 'sin escuchas nuevas al pintar e ir y volver al Inicio · ' + JSON.stringify([s1.snap, s0.snap]));
    c(s1.get.filter((x) => x !== 'fotosObra').length <= s0.get.length, 'consultas: solo la de las fotos de hoy de Dirección además de las del Ejecutivo · ' + JSON.stringify([s1.get, s0.get]));
    if (cel) {
      const A = await sesion('admin', { antes: () => { window.__pmPausa = true; window.__cvSinMic = true; window.__hvPausa = true; window.__isNoAuto = true;
        const mo = new MutationObserver(() => { if (window.__tIni) return; const a = document.querySelector('#iniDir #drAt .ie-fila, #iniDir #drAt .ie-nada'); if (a && a.offsetHeight) { window.__tIni = performance.now(); mo.disconnect(); } }); mo.observe(document, { childList: true, subtree: true });
        const iv = setInterval(() => { try { const v = document.getElementById('viewInicio'); if (window.__inicioPro && window.__inicioPro.modo() && v && v.style.display !== 'none') { window.__tListo = performance.now(); clearInterval(iv); } } catch (e) { } }, 20); } });
      const p = A.page; const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await p.reload(); await p.waitForTimeout(14000);
      const r = await p.evaluate(() => { const t0 = performance.now(); for (let i = 0; i < 3; i++) window.__inicioPro.pintar(); return { dif: Math.round(window.__tIni - window.__tListo), ini: Math.round(window.__tIni), rep: Math.round((performance.now() - t0) / 3), t: window.__iniUnico.estado().t }; });
      c(r.dif > 0 && r.dif < 1500, 'celu con CPU ×4: del «Inicio listo» al Inicio dibujado ' + r.dif + ' ms (el Ejecutivo de la v160: 100–330 ms; la portada y las piezas primero, los gráficos al toque)');
      c(r.rep < 120, 'repintado de las piezas (cada 2,5 s a la vista, como el Ejecutivo): ' + r.rep + ' ms · ' + JSON.stringify(r.t));
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 }); await p.close();
    }
  }
  if (browser) await browser.close();
  process.exit(c.fin() ? 1 : 0);
})();
